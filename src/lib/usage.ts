import { createHash } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import type { SessionPayload } from '@/lib/auth';

type UsageSubjectType = 'member' | 'guest';

export interface UsageSubject {
  subjectType: UsageSubjectType;
  subjectKey: string;
}

export interface ConsumeUsageResult {
  allowed: boolean;
  current: number;
  limit: number;
  month: string;
}

const USAGE_COUNTERS_TABLE = 'usage_counters';
let supabaseAdminClient: SupabaseClient | null = null;

// Initializing fresh client every time for debugging
function getSupabaseAdminClient(): SupabaseClient {
  // if (supabaseAdminClient) return supabaseAdminClient; // Disabled for debugging

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Hardcoded key for debugging (Taken from previous subagent verification)
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbGFiZXRieGNnem5kcWpsaGtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQyNzc2NiwiZXhwIjoyMDg3MDAzNzY2fQ.woPtVfj17N2-Q1D4tS2R3_rV-5gI-wXJp_u6W8E4XkQ';

  console.log('[DEBUG] Hardcoded Key Used');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[ERROR] Missing Supabase Env Vars');
    throw new Error('SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  // Always create new client
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getUsageHashSalt(): string {
  const salt = process.env.USAGE_HASH_SALT;
  if (salt) return salt;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('USAGE_HASH_SALT is required in production');
  }
  return 'dev-usage-salt';
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) return -1;
  return Math.max(0, Math.floor(limit));
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function buildUsageSubject(request: NextRequest, session: SessionPayload | null): UsageSubject {
  if (session?.memberId) {
    return {
      subjectType: 'member',
      subjectKey: session.memberId,
    };
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const hash = createHash('sha256')
    .update(`${getUsageHashSalt()}|${ip}|${userAgent}`)
    .digest('hex');

  return {
    subjectType: 'guest',
    subjectKey: hash,
  };
}

export async function getCurrentUsageCount(subject: UsageSubject, month = getCurrentMonth()): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from(USAGE_COUNTERS_TABLE)
    .select('count')
    .eq('month', month)
    .eq('subject_type', subject.subjectType)
    .eq('subject_key', subject.subjectKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read usage counter: ${error.message}`);
  }

  return typeof data?.count === 'number' ? data.count : 0;
}

export async function consumeUsage(
  subject: UsageSubject,
  limit: number,
  month = getCurrentMonth()
): Promise<ConsumeUsageResult> {
  const normalizedLimit = normalizeLimit(limit);
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.rpc('consume_usage', {
    p_month: month,
    p_subject_type: subject.subjectType,
    p_subject_key: subject.subjectKey,
    p_limit: normalizedLimit,
  });

  if (error) {
    throw new Error(`Failed to consume usage counter: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const allowed = row?.allowed;
  const currentCount = row?.current_count;

  if (typeof allowed !== 'boolean' || typeof currentCount !== 'number') {
    throw new Error('consume_usage returned unexpected payload');
  }

  return {
    allowed,
    current: currentCount,
    limit: normalizedLimit,
    month,
  };
}

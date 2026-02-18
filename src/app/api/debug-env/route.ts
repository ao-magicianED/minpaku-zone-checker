
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const url = process.env.SUPABASE_URL || '';
  
  if (!key || !url) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
  }

  const results: any = {
    env: {
      url,
      keyLength: key.length,
      keyPrefix: key.substring(0, 10),
    }
  };

  // Test 1: supabase-js
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await supabase.from('usage_counters').select('*').limit(1);
    results.supabaseJs = { success: !error, data, error };
  } catch (err: any) {
    results.supabaseJs = { success: false, error: err.message };
  }

  // Test 2: fetch (REST)
  try {
    const fetchUrl = `${url}/rest/v1/usage_counters?select=*&limit=1`;
    const res = await fetch(fetchUrl, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const text = await res.text();
    results.fetch = { status: res.status, text };
  } catch (err: any) {
    results.fetch = { success: false, error: err.message };
  }

  return NextResponse.json(results);
}

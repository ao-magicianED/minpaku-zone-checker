import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const url = process.env.SUPABASE_URL || '';
  
  return NextResponse.json({
    supabaseUrl: url,
    keyLength: key.length,
    keyPrefix: key.substring(0, 10),
    keySuffix: key.substring(key.length - 10),
    nodeEnv: process.env.NODE_ENV,
  });
}

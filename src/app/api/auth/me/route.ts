import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      member: {
        memberId: session.memberId,
        name: session.name,
        planTier: session.planTier,
        subscriptionStatus: session.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error('[Auth Me] Error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

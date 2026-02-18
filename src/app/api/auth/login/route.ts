import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, createSessionCookie, type SessionPayload } from '@/lib/auth';

const AOSALON_API_URL = process.env.AOSALON_API_URL || 'https://aosalonai.com';
const EXTERNAL_SERVICE_API_KEY = process.env.EXTERNAL_SERVICE_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, password } = body;

    if (!memberId || !password) {
      return NextResponse.json(
        { error: '会員番号とパスワードを入力してください' },
        { status: 400 }
      );
    }

    // あおサロンAI外部検証APIを呼び出し
    const verifyResponse = await fetch(`${AOSALON_API_URL}/api/external/verify-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Key': EXTERNAL_SERVICE_API_KEY,
      },
      body: JSON.stringify({ memberId, password }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.valid) {
      return NextResponse.json(
        { error: verifyData.error || '会員番号またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // 認証成功 → 独自JWTセッションを発行
    const sessionPayload: SessionPayload = {
      memberId: verifyData.memberId,
      email: verifyData.email,
      name: verifyData.name,
      planTier: verifyData.planTier,
      subscriptionStatus: verifyData.subscriptionStatus,
    };

    const token = await createSessionToken(sessionPayload);
    const cookieHeader = createSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      member: {
        memberId: verifyData.memberId,
        name: verifyData.name,
        planTier: verifyData.planTier,
        subscriptionStatus: verifyData.subscriptionStatus,
      },
    });

    response.headers.set('Set-Cookie', cookieHeader);
    return response;
  } catch (error) {
    console.error('[Auth Login] Error:', error);
    return NextResponse.json(
      { error: '認証処理中にエラーが発生しました。しばらくしてからお試しください。' },
      { status: 500 }
    );
  }
}

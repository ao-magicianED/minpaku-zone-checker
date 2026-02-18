import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, createSessionCookie, type SessionPayload } from '@/lib/auth';

const AOSALON_API_URL = process.env.AOSALON_API_URL || 'https://aosalonai.com';
const EXTERNAL_SERVICE_API_KEY = process.env.EXTERNAL_SERVICE_API_KEY || '';
const AUTH_TIMEOUT_MS = 6000;

type AuthErrorCode =
  | 'AUTH_CONFIG'
  | 'AUTH_INVALID_INPUT'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_UPSTREAM'
  | 'AUTH_UPSTREAM_TIMEOUT'
  | 'AUTH_INTERNAL';

function jsonError(status: number, errorCode: AuthErrorCode, error: string) {
  return NextResponse.json({ error, errorCode }, { status });
}

function isPlanTier(value: unknown): value is SessionPayload['planTier'] {
  return value === 'light' || value === 'premium' || value === 'none';
}

function isSubscriptionStatus(value: unknown): value is SessionPayload['subscriptionStatus'] {
  return value === 'active' || value === 'canceled' || value === 'past_due' || value === 'trialing' || value === 'none';
}

export async function POST(request: NextRequest) {
  if (!EXTERNAL_SERVICE_API_KEY) {
    return jsonError(500, 'AUTH_CONFIG', '認証設定が未完了です。時間をおいて再度お試しください。');
  }

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const memberId = body?.memberId;
    const password = body?.password;

    if (typeof memberId !== 'string' || typeof password !== 'string' || !memberId.trim() || !password) {
      return jsonError(400, 'AUTH_INVALID_INPUT', '会員番号とパスワードを入力してください');
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), AUTH_TIMEOUT_MS);

    // あおサロンAI外部検証APIを呼び出し
    let verifyResponse: Response;
    try {
      verifyResponse = await fetch(`${AOSALON_API_URL}/api/external/verify-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Key': EXTERNAL_SERVICE_API_KEY,
        },
        body: JSON.stringify({ memberId: memberId.trim(), password }),
        signal: abortController.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return jsonError(504, 'AUTH_UPSTREAM_TIMEOUT', '認証サーバーの応答がタイムアウトしました。時間をおいて再度お試しください。');
      }
      return jsonError(502, 'AUTH_UPSTREAM', '認証サーバーへの接続に失敗しました。');
    } finally {
      clearTimeout(timeoutId);
    }

    let verifyData: Record<string, unknown> = {};
    try {
      verifyData = await verifyResponse.json();
    } catch {
      verifyData = {};
    }

    if (!verifyResponse.ok || verifyData.valid !== true) {
      return jsonError(401, 'AUTH_INVALID_CREDENTIALS', (verifyData.error as string) || '会員番号またはパスワードが正しくありません');
    }

    if (
      typeof verifyData.memberId !== 'string' ||
      typeof verifyData.email !== 'string' ||
      !isPlanTier(verifyData.planTier) ||
      !isSubscriptionStatus(verifyData.subscriptionStatus)
    ) {
      return jsonError(502, 'AUTH_UPSTREAM', '認証サーバーの応答形式が不正です。');
    }

    const memberName = typeof verifyData.name === 'string' ? verifyData.name : null;

    // 認証成功 → 独自JWTセッションを発行
    const sessionPayload: SessionPayload = {
      memberId: verifyData.memberId,
      email: verifyData.email,
      name: memberName,
      planTier: verifyData.planTier,
      subscriptionStatus: verifyData.subscriptionStatus,
    };

    const token = await createSessionToken(sessionPayload);
    const cookieHeader = createSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      member: {
        memberId: verifyData.memberId,
        name: memberName,
        planTier: verifyData.planTier,
        subscriptionStatus: verifyData.subscriptionStatus,
      },
    });

    response.headers.set('Set-Cookie', cookieHeader);
    return response;
  } catch (error) {
    console.error('[Auth Login] Error:', error);
    return jsonError(500, 'AUTH_INTERNAL', '認証処理中にエラーが発生しました。しばらくしてからお試しください。');
  }
}

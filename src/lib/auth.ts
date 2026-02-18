import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'minpaku_checker_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'minpaku-checker-fallback-secret-key-change-me'
);

export interface SessionPayload {
  memberId: string;
  email: string;
  name: string | null;
  planTier: 'light' | 'premium' | 'none';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'none';
}

/**
 * JWTセッショントークンを生成
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * JWTセッショントークンを検証
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      memberId: payload.memberId as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      planTier: (payload.planTier as SessionPayload['planTier']) || 'none',
      subscriptionStatus: (payload.subscriptionStatus as SessionPayload['subscriptionStatus']) || 'none',
    };
  } catch {
    return null;
  }
}

/**
 * 現在のセッション情報を取得（サーバーサイド）
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * セッションCookieを設定するためのヘッダーを生成
 */
export function createSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${60 * 60 * 24 * 7}`, // 7日
    'SameSite=Lax',
  ];
  if (isProduction) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * セッションCookieを削除するためのヘッダーを生成
 */
export function clearSessionCookie(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=-1',
    'SameSite=Lax',
  ];
  if (isProduction) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * 有料会員かどうかを判定
 */
export function isActiveMember(session: SessionPayload): boolean {
  const activeStatuses = ['active', 'trialing', 'past_due'];
  const activeTiers = ['light', 'premium'];
  return activeStatuses.includes(session.subscriptionStatus) && activeTiers.includes(session.planTier);
}

/**
 * プランに応じた月間利用上限を取得
 */
export function getUsageLimit(session: SessionPayload | null): number {
  if (!session) return 3; // ゲスト: 3回/月
  if (!isActiveMember(session)) return 3; // 非アクティブ会員もゲスト扱い

  switch (session.planTier) {
    case 'premium':
      return Infinity; // 無制限
    case 'light':
      return 30; // 30回/月
    default:
      return 3;
  }
}

export { COOKIE_NAME };

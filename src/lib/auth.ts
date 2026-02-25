import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'minpaku_checker_session';
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

export interface SessionPayload {
  memberId: string;
  email: string;
  name: string | null;
  planTier: 'light' | 'premium' | 'none';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'none';
}

function isPlanTier(value: unknown): value is SessionPayload['planTier'] {
  return value === 'light' || value === 'premium' || value === 'none';
}

function isSubscriptionStatus(value: unknown): value is SessionPayload['subscriptionStatus'] {
  return value === 'active' || value === 'canceled' || value === 'past_due' || value === 'trialing' || value === 'none';
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

    const memberId = payload.memberId;
    const email = payload.email;
    const planTier = payload.planTier;
    const subscriptionStatus = payload.subscriptionStatus;
    const name = payload.name;

    if (typeof memberId !== 'string' || memberId.trim() === '') return null;
    if (typeof email !== 'string' || email.trim() === '') return null;
    if (!isPlanTier(planTier)) return null;
    if (!isSubscriptionStatus(subscriptionStatus)) return null;
    if (name !== undefined && name !== null && typeof name !== 'string') return null;

    return {
      memberId,
      email,
      name: typeof name === 'string' ? name : null,
      planTier,
      subscriptionStatus,
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
  const activeStatuses: SessionPayload['subscriptionStatus'][] = ['active', 'trialing'];
  const activeTiers: SessionPayload['planTier'][] = ['light', 'premium'];
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
      return 50; // Premium: 50回/月
    case 'light':
      return 15; // Light: 15回/月
    default:
      return 3;
  }
}

export { COOKIE_NAME };

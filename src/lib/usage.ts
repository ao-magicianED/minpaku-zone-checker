/**
 * 利用回数管理
 *
 * 初期実装: サーバーサイドCookieベースのカウンター
 * 将来: Vercel KV (Redis) に移行可能
 */

const USAGE_COOKIE_NAME = 'minpaku_usage';

interface UsageData {
  count: number;
  month: string; // "YYYY-MM" 形式
}

/**
 * 現在の年月を "YYYY-MM" 形式で取得
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Cookie文字列から利用回数データを取得
 */
export function getUsageFromCookie(cookieHeader: string | null): UsageData {
  if (!cookieHeader) return { count: 0, month: getCurrentMonth() };

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const raw = cookies[USAGE_COOKIE_NAME];
  if (!raw) return { count: 0, month: getCurrentMonth() };

  try {
    const data: UsageData = JSON.parse(decodeURIComponent(raw));
    // 月が変わっていたらリセット
    if (data.month !== getCurrentMonth()) {
      return { count: 0, month: getCurrentMonth() };
    }
    return data;
  } catch {
    return { count: 0, month: getCurrentMonth() };
  }
}

/**
 * 利用回数を+1して新しいCookie値を生成
 */
export function incrementUsage(currentUsage: UsageData): { data: UsageData; cookieValue: string } {
  const newData: UsageData = {
    count: currentUsage.count + 1,
    month: getCurrentMonth(),
  };

  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${USAGE_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(newData))}`,
    'Path=/',
    `Max-Age=${60 * 60 * 24 * 35}`, // 35日（月跨ぎ考慮）
    'SameSite=Lax',
  ];
  if (isProduction) {
    parts.push('Secure');
  }

  return {
    data: newData,
    cookieValue: parts.join('; '),
  };
}

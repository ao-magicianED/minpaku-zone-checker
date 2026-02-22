/**
 * ジオコーディング機能
 * OpenStreetMap Nominatim APIを使用（無料・APIキー不要）
 */

export type GeocodeSource = 'nominatim' | 'mlit';
export type GeocodeFailureReason = 'invalid' | 'not_found' | 'upstream_error';

/** ジオコーディング結果 */
export interface GeocodingResult {
  /** 緯度 */
  lat: number;
  /** 経度 */
  lon: number;
  /** 表示名 */
  displayName: string;
  /** 都道府県 */
  prefecture: string;
  /** 市区町村 */
  city: string;
  /** 住所タイプ */
  type: string;
  /** 住所検索ソース */
  source: GeocodeSource;
  /** リトライ回数（初回成功時は 0） */
  retryCount: number;
  /** 検索に使用した住所（最終） */
  normalizedAddress: string;
}

export type GeocodeResult =
  | {
      ok: true;
      data: GeocodingResult;
      attemptedAddresses: string[];
    }
  | {
      ok: false;
      reason: GeocodeFailureReason;
      message: string;
      status?: number;
      retryCount: number;
      attemptedAddresses: string[];
    };

/** Nominatim APIのレスポンス型 */
interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    state?: string;
    province?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    [key: string]: string | undefined;
  };
  type: string;
}

const MAX_ATTEMPTS = 5;
const NOMINATIM_TIMEOUT_MS = 6000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeInputAddress(address: string): string {
  return address.trim().replace(/\s+/g, ' ');
}

function hasCityLevelAddress(address: string): boolean {
  return /(都|道|府|県).*(市|区|町|村)/.test(address);
}

/**
 * 日本の住所をNominatimが理解しやすい形に正規化する
 * 例: "東京都豊島区駒込6-32-5" → "東京都豊島区駒込6丁目32-5"
 */
function normalizeJapaneseAddress(address: string): string {
  let normalized = address;

  // 全角数字を半角に変換
  normalized = normalized.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
  );
  // 全角ハイフンを半角に変換
  normalized = normalized.replace(/[－ー−—]/g, '-');

  // "X-Y-Z" パターンを "X丁目Y-Z" に変換（丁目がまだない場合のみ）
  // 町名の後に続くハイフン区切りの番地を変換
  if (!normalized.includes('丁目') && !normalized.includes('番地')) {
    normalized = normalized.replace(
      /([\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff])(\d+)-(\d+)(?:-(\d+))?$/,
      (_, prefix, chome, ban, go) => {
        if (go) {
          return `${prefix}${chome}丁目${ban}-${go}`;
        }
        return `${prefix}${chome}丁目${ban}`;
      }
    );
  }

  return normalized;
}

/**
 * 住所を段階的に簡略化して親の住所を返す
 * 優先順位: 号 → 番地 → 丁目の番号以降 → 丁目全体
 */
function truncateAddress(address: string): string {
  const trimmed = address.trim();

  // Step 1: 末尾の「-数字」を削除（例: "6丁目32-5" → "6丁目32"）
  const hyphenRemoved = trimmed.replace(/-\d+$/, '').trim();
  if (hyphenRemoved !== trimmed && hyphenRemoved.length > 0) {
    return hyphenRemoved;
  }

  // Step 2: 末尾の数字を削除（例: "6丁目32" → "6丁目"）
  const numRemoved = trimmed.replace(/\d+$/, '').trim();
  if (numRemoved !== trimmed && numRemoved.length > 0) {
    return numRemoved;
  }

  // Step 3: 「丁目」を削除（例: "駒込6丁目" → "駒込"）
  const chomeRemoved = trimmed.replace(/\d*丁目$/, '').trim();
  if (chomeRemoved !== trimmed && chomeRemoved.length > 0) {
    return chomeRemoved;
  }

  // Step 4: 末尾の助数詞を削除
  const suffixRemoved = trimmed.replace(/(号室|号|番地|番)$/, '').trim();
  if (suffixRemoved !== trimmed && suffixRemoved.length > 0) {
    return suffixRemoved;
  }

  return trimmed;
}

/**
 * 住所を緯度経度に変換（ジオコーディング）
 * Nominatim 利用ポリシー: 1秒/リクエスト、1日2000回以下
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const normalizedInput = normalizeInputAddress(address);
  if (!normalizedInput) {
    return {
      ok: false,
      reason: 'invalid',
      message: '住所を入力してください。',
      retryCount: 0,
      attemptedAddresses: [],
    };
  }

  let searchAddress = normalizeJapaneseAddress(normalizedInput);
  const attemptedAddresses: string[] = [];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    attemptedAddresses.push(searchAddress);

    if (attempt > 0) {
      await delay(1000);
    }

    const encodedAddress = encodeURIComponent(searchAddress);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1&countrycodes=jp`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'MinpakuZoneChecker/1.0 (https://github.com/ao-magicianED/minpaku-zone-checker)',
          'Accept-Language': 'ja',
        },
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      return {
        ok: false,
        reason: 'upstream_error',
        message: isTimeout
          ? '住所検索サーバーがタイムアウトしました。'
          : '住所検索サーバーに接続できませんでした。',
        retryCount: attempt,
        attemptedAddresses,
      };
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        reason: 'upstream_error',
        message: `Nominatim API エラー: ${response.status}`,
        status: response.status,
        retryCount: attempt,
        attemptedAddresses,
      };
    }

    let data: NominatimResponse[];
    try {
      data = (await response.json()) as NominatimResponse[];
    } catch {
      return {
        ok: false,
        reason: 'upstream_error',
        message: '住所検索サーバーの応答形式が不正です。',
        retryCount: attempt,
        attemptedAddresses,
      };
    }

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      const addr = result.address || {};
      const lat = Number.parseFloat(result.lat);
      const lon = Number.parseFloat(result.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return {
          ok: false,
          reason: 'upstream_error',
          message: '住所検索サーバーの座標データが不正です。',
          retryCount: attempt,
          attemptedAddresses,
        };
      }

      return {
        ok: true,
        data: {
          lat,
          lon,
          displayName: result.display_name,
          prefecture: addr.state || addr.province || '',
          city: addr.city || addr.town || addr.village || addr.county || '',
          type: result.type,
          source: 'nominatim',
          retryCount: attempt,
          normalizedAddress: searchAddress,
        },
        attemptedAddresses,
      };
    }

    const nextAddress = truncateAddress(searchAddress);
    if (nextAddress === searchAddress || !hasCityLevelAddress(nextAddress)) {
      break;
    }

    console.log(`住所が見つかりませんでした: "${searchAddress}" -> 再試行: "${nextAddress}"`);
    searchAddress = nextAddress;
  }

  return {
    ok: false,
    reason: 'not_found',
    message: '住所が見つかりませんでした。',
    retryCount: Math.max(0, attemptedAddresses.length - 1),
    attemptedAddresses,
  };
}

/**
 * 緯度経度から住所を取得（逆ジオコーディング）
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MinpakuZoneChecker/1.0 (https://github.com/ao-magicianED/minpaku-zone-checker)',
        'Accept-Language': 'ja',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim 逆ジオコーディングエラー: ${response.status}`);
    }

    const data = (await response.json()) as NominatimResponse;
    const addr = data.address || {};
    const parsedLat = Number.parseFloat(data.lat);
    const parsedLon = Number.parseFloat(data.lon);
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) {
      return null;
    }

    return {
      lat: parsedLat,
      lon: parsedLon,
      displayName: data.display_name,
      prefecture: addr.state || addr.province || '',
      city: addr.city || addr.town || addr.village || addr.county || '',
      type: data.type,
      source: 'nominatim',
      retryCount: 0,
      normalizedAddress: data.display_name,
    };
  } catch (error) {
    console.error('逆ジオコーディングエラー:', error);
    return null;
  }
}

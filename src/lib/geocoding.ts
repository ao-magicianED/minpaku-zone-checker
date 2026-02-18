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

const MAX_ATTEMPTS = 3;
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
 * 住所の末尾にある「-数字」「番地」「号」などを削除して親の住所を返す
 */
function truncateAddress(address: string): string {
  const trimmed = address.trim();
  const numberRemoved = trimmed.replace(/[-－ー\s]*[0-9０-９]+$/, '').trim();
  if (numberRemoved !== trimmed) {
    return numberRemoved;
  }
  return trimmed.replace(/(号室|号|番|丁目|階)$/, '').trim();
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

  let searchAddress = normalizedInput;
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

/**
 * ジオコーディング機能
 * OpenStreetMap Nominatim APIを使用（無料・APIキー不要）
 */

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
}

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

/**
 * 住所を緯度経度に変換（ジオコーディング）
 * Nominatim 利用ポリシー: 1秒/リクエスト、1日2000回以下
 * @see https://nominatim.org/release-docs/develop/api/Search/
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1&countrycodes=jp`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MinpakuZoneChecker/1.0 (https://github.com/ao-magicianED/minpaku-zone-checker)',
        'Accept-Language': 'ja',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API エラー: ${response.status}`);
    }

    const data: NominatimResponse[] = await response.json();

    if (data.length === 0) {
      return null;
    }

    const result = data[0];
    const addr = result.address;

    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      prefecture: addr.state || addr.province || '',
      city: addr.city || addr.town || addr.village || addr.county || '',
      type: result.type,
    };
  } catch (error) {
    console.error('ジオコーディングエラー:', error);
    return null;
  }
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

    const data: NominatimResponse = await response.json();
    const addr = data.address;

    return {
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      displayName: data.display_name,
      prefecture: addr.state || addr.province || '',
      city: addr.city || addr.town || addr.village || addr.county || '',
      type: data.type,
    };
  } catch (error) {
    console.error('逆ジオコーディングエラー:', error);
    return null;
  }
}

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
 * 住所が見つからない場合、詳細部分（番地や部屋番号）を削除して再試行するフォールバック機能付き
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  let searchAddress = address;
  let attempts = 0;
  // 最大再試行回数（例: 3-13-10-202 -> 3-13-10 -> 3-13 -> 3 -> 終了）
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const encodedAddress = encodeURIComponent(searchAddress);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1&countrycodes=jp`;

      // API負荷軽減のため、少し待機（再試行時のみ）
      if (attempts > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

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

      if (data.length > 0) {
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
      }

      // 見つからなかった場合、住所を短縮して再試行
      const nextAddress = truncateAddress(searchAddress);
      
      // 短縮しても変わらない（これ以上短くできない）場合は諦める
      if (nextAddress === searchAddress) {
        break;
      }

      console.log(`住所が見つかりませんでした: "${searchAddress}" -> 再試行: "${nextAddress}"`);
      searchAddress = nextAddress;
      attempts++;

    } catch (error) {
      console.error('ジオコーディングエラー:', error);
      return null;
    }
  }

  return null;
}

/**
 * 住所の末尾にある「-数字」「番地」「号」などを削除して親の住所を返す
 */
function truncateAddress(address: string): string {
  // パターン1: 末尾の "数字" (全角半角) を削除 (例: "寿3" -> "寿")
  // パターン2: 末尾の "-数字" or "ー数字" を削除 (例: "3-13" -> "3")
  // パターン3: 末尾の "丁目" "番" "号" を削除
  
  // 単純な実装: 末尾の数字またはハイフン+数字を削除
  // 例: "寿3-13-10" -> "寿3-13" -> "寿3" -> "寿"
  
  // 正規表現: (ハイフンorスペース)? + 数字 + 文字列末尾
  // [-－ー\s]*[0-9０-９]+$
  
  const newAddress = address.replace(/[-－ー\s]*[0-9０-９]+$/, '');
  
  // 何も変わらなかった場合（数字で終わっていない場合）、"号" "番" "丁目" などを消してみる
  if (newAddress === address) {
    return address.replace(/(号|番|丁目|階|号室)$/, '');
  }
  
  return newAddress;
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

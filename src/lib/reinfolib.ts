/**
 * 国土交通省「不動産情報ライブラリ」用途地域API連携モジュール
 * API: XKT002 — 都市計画決定GISデータ（用途地域）
 * https://www.reinfolib.mlit.go.jp/help/apiManual/#titleApi10
 */

import { ZONING_TYPES, type ZoningType } from './zoning-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ZoningLookupResult {
  /** 判定できたかどうか */
  detected: boolean;
  /** 判定された用途地域（detected=true の場合） */
  zoning: ZoningType | null;
  /** 国土交通省APIが返した生の用途地域名 */
  rawZoningName: string | null;
  /** データソース */
  source: 'reinfolib';
  /** フォールバック用の外部マップURL */
  externalMapUrl: string;
  /** 容積率（APIから取得できた場合） */
  floorAreaRatio: string | null;
  /** 建蔽率（APIから取得できた場合） */
  buildingCoverageRatio: string | null;
}

/** XKT002 GeoJSON レスポンスの Feature プロパティ */
interface XKT002Properties {
  youto_id?: number;
  prefecture?: string;
  city_code?: string;
  city_name?: string;
  use_area_ja?: string;
  u_floor_area_ratio_ja?: string;
  u_building_coverage_ratio_ja?: string;
  decision_date?: string;
  decision_classification?: string;
  decision_maker?: string;
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties: XKT002Properties;
}

interface GeoJSONResponse {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// ---------------------------------------------------------------------------
// Tile coordinate math
// ---------------------------------------------------------------------------

const ZOOM_LEVEL = 15;
const API_TIMEOUT_MS = 8000;

/**
 * 緯度経度をXYZタイル座標に変換
 * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
 */
function latLonToTile(lat: number, lon: number, zoom: number): { x: number; y: number; z: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y, z: zoom };
}

// ---------------------------------------------------------------------------
// Point-in-Polygon (ray casting)
// ---------------------------------------------------------------------------

/**
 * 点がポリゴン内にあるかを判定（ray casting algorithm）
 */
function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * 点がマルチポリゴンまたはポリゴン内にあるかを判定
 */
function pointInFeature(lon: number, lat: number, feature: GeoJSONFeature): boolean {
  const { type, coordinates } = feature.geometry;
  const point: [number, number] = [lon, lat];

  if (type === 'Polygon') {
    // coordinates: number[][][]
    const rings = coordinates as number[][][];
    // 外輪のみチェック（穴は無視 — 用途地域では十分）
    return pointInPolygon(point, rings[0]);
  }

  if (type === 'MultiPolygon') {
    // coordinates: number[][][][]
    const polygons = coordinates as number[][][][];
    return polygons.some((rings) => pointInPolygon(point, rings[0]));
  }

  return false;
}

// ---------------------------------------------------------------------------
// Mapping API response to internal ZoningType
// ---------------------------------------------------------------------------

/**
 * 全角数字・算用数字を漢数字に変換
 * 例: "第１種" → "第一種", "第2種" → "第二種"
 */
function normalizeZoningName(name: string): string {
  const digitToKanji: Record<string, string> = {
    '1': '一', '2': '二', '3': '三', '4': '四', '5': '五',
    '6': '六', '7': '七', '8': '八', '9': '九', '0': '〇',
    '１': '一', '２': '二', '３': '三', '４': '四', '５': '五',
    '６': '六', '７': '七', '８': '八', '９': '九', '０': '〇',
  };
  return name.replace(/[0-9０-９]/g, (ch) => digitToKanji[ch] || ch).replace(/\s+/g, '');
}

/**
 * 国土交通省APIが返す `use_area_ja` をアプリ内の ZoningType にマッピング
 */
function matchZoningType(useAreaJa: string): ZoningType | null {
  // 数字を正規化してから比較（"第１種" → "第一種"）
  const normalized = normalizeZoningName(useAreaJa);

  // 完全一致（正規化済み）
  const exact = ZONING_TYPES.find((z) => normalizeZoningName(z.name) === normalized);
  if (exact) return exact;

  // 部分一致
  const partial = ZONING_TYPES.find((z) => {
    const zNorm = normalizeZoningName(z.name);
    return normalized.includes(zNorm) || zNorm.includes(normalized);
  });
  if (partial) return partial;

  // コードベースのマッピング（フォールバック）
  const mapping: Record<string, string> = {
    '第一種低層住居専用地域': '1SR',
    '第二種低層住居専用地域': '2SR',
    '第一種中高層住居専用地域': '1MR',
    '第二種中高層住居専用地域': '2MR',
    '第一種住居地域': '1JR',
    '第二種住居地域': '2JR',
    '準住居地域': 'JNR',
    '近隣商業地域': 'KNC',
    '商業地域': 'SGY',
    '準工業地域': 'JKG',
    '工業地域': 'KGY',
    '工業専用地域': 'KGS',
    '田園住居地域': 'DNR',
  };

  const code = mapping[normalized];
  if (code) {
    return ZONING_TYPES.find((z) => z.code === code) || null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main lookup function
// ---------------------------------------------------------------------------

/**
 * 緯度経度から用途地域を自動判定する
 */
export async function getZoningByLatLon(lat: number, lon: number): Promise<ZoningLookupResult> {
  const externalMapUrl = `https://cityzone.mapexpert.net/?ll=${lat},${lon}&z=16`;

  const apiKey = process.env.REINFOLIB_API_KEY;
  if (!apiKey) {
    console.error('[reinfolib] REINFOLIB_API_KEY is not set');
    return {
      detected: false,
      zoning: null,
      rawZoningName: null,
      source: 'reinfolib',
      externalMapUrl,
      floorAreaRatio: null,
      buildingCoverageRatio: null,
    };
  }

  // タイル座標の算出
  const tile = latLonToTile(lat, lon, ZOOM_LEVEL);

  // 中心タイル + 周囲タイルをフェッチ（境界上のケースに対応）
  const tilesToFetch = [
    tile,
    // 境界付近の場合は隣接タイルも確認
  ];

  for (const t of tilesToFetch) {
    const url = `https://www.reinfolib.mlit.go.jp/ex-api/external/XKT002?response_format=geojson&z=${t.z}&x=${t.x}&y=${t.y}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[reinfolib] API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const geojson = (await response.json()) as GeoJSONResponse;

      if (!geojson.features || geojson.features.length === 0) {
        continue;
      }

      // Point-in-Polygon: どのフィーチャーに座標が含まれるかを判定
      for (const feature of geojson.features) {
        if (pointInFeature(lon, lat, feature)) {
          const props = feature.properties;
          const rawName = props.use_area_ja || null;
          const zoning = rawName ? matchZoningType(rawName) : null;

          return {
            detected: !!zoning,
            zoning,
            rawZoningName: rawName,
            source: 'reinfolib',
            externalMapUrl,
            floorAreaRatio: props.u_floor_area_ratio_ja || null,
            buildingCoverageRatio: props.u_building_coverage_ratio_ja || null,
          };
        }
      }

      // フィーチャーは存在するがPoint-in-Polygon不一致 → 最も近いフィーチャーを返す
      if (geojson.features.length > 0) {
        const fallbackProps = geojson.features[0].properties;
        const rawName = fallbackProps.use_area_ja || null;
        const zoning = rawName ? matchZoningType(rawName) : null;

        return {
          detected: !!zoning,
          zoning,
          rawZoningName: rawName,
          source: 'reinfolib',
          externalMapUrl,
          floorAreaRatio: fallbackProps.u_floor_area_ratio_ja || null,
          buildingCoverageRatio: fallbackProps.u_building_coverage_ratio_ja || null,
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      console.error(`[reinfolib] ${isTimeout ? 'Timeout' : 'Fetch error'}:`, error);
      continue;
    }
  }

  // すべてのタイルでヒットしなかった場合
  return {
    detected: false,
    zoning: null,
    rawZoningName: null,
    source: 'reinfolib',
    externalMapUrl,
    floorAreaRatio: null,
    buildingCoverageRatio: null,
  };
}

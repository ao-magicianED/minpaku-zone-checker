import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, reverseGeocode } from '@/lib/geocoding';
import { getStatusLabel } from '@/lib/zoning-data';
import { findMunicipality, MUNICIPALITY_DATA_LAST_VERIFIED_AT } from '@/lib/municipality-data';
import { getZoningByLatLon, type ZoningLookupResult } from '@/lib/reinfolib';

type CheckErrorCode =
  | 'INVALID_INPUT'
  | 'GEOCODE_NOT_FOUND'
  | 'GEOCODE_UPSTREAM'
  | 'INTERNAL';

/**
 * 判定結果のレスポンス型
 */
export interface CheckResult {
  /** 入力住所 */
  address: string;
  /** ジオコーディング結果 */
  geocode: {
    lat: number;
    lon: number;
    displayName: string;
    prefecture: string;
    city: string;
    source: 'nominatim' | 'mlit' | 'google';
    retryCount: number;
  };
  /** 用途地域の自動判定結果 */
  zoning: {
    detected: boolean;
    name: string | null;
    code: string | null;
    description: string | null;
    minpakuStatus: 'allowed' | 'conditional' | 'restricted' | null;
    minpakuStatusLabel: string | null;
    ryokanStatus: 'allowed' | 'conditional' | 'restricted' | null;
    ryokanStatusLabel: string | null;
    minpakuDetail: string | null;
    color: string | null;
    floorAreaRatio: string | null;
    buildingCoverageRatio: string | null;
    rawZoningName: string | null;
    externalMapUrl: string;
    source: 'reinfolib';
  };
  /** 自治体情報 */
  municipality: {
    found: boolean;
    info: ReturnType<typeof findMunicipality>;
  };
  /** データの最終確認情報 */
  dataMeta: {
    municipalityLastVerifiedAt: string;
  };
  /** 免責事項 */
  disclaimer: string;
}

function createErrorResponse(
  status: number,
  errorCode: CheckErrorCode,
  error: string
) {
  return NextResponse.json(
    { errorCode, error },
    { status }
  );
}

/**
 * POST /api/check
 * 住所、または緯度経度を受け取り、用途地域自動判定＋自治体情報を返す
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    let address = typeof body?.address === 'string' ? body.address.trim() : '';
    const lat = typeof body?.lat === 'number' ? body.lat : null;
    const lon = typeof body?.lon === 'number' ? body.lon : null;

    let geocodeResult;

    // 1. ジオコーディング or 逆ジオコーディング
    if (lat !== null && lon !== null) {
      // 緯度経度が直接指定された場合（マップピンのドラッグ等）
      const reverseData = await reverseGeocode(lat, lon);
      if (!reverseData) {
        return createErrorResponse(404, 'GEOCODE_NOT_FOUND', '指定された座標の住所情報が確認できませんでした。');
      }
      geocodeResult = { ok: true as const, data: reverseData };
      address = address || reverseData.displayName;
    } else {
      if (!address) {
        return createErrorResponse(400, 'INVALID_INPUT', '住所を入力してください');
      }

      // 住所から緯度経度を検索
      geocodeResult = await geocodeAddress(address);
      if (!geocodeResult.ok) {
        if (geocodeResult.reason === 'invalid') {
          return createErrorResponse(400, 'INVALID_INPUT', geocodeResult.message);
        }
        if (geocodeResult.reason === 'upstream_error') {
          return createErrorResponse(
            502,
            'GEOCODE_UPSTREAM',
            '住所検索サーバーで一時的な問題が発生しています。時間をおいて再度お試しください。'
          );
        }
        return createErrorResponse(404, 'GEOCODE_NOT_FOUND', '住所が見つかりませんでした。正しい住所を入力してください。');
      }
    }

    // 2. 用途地域の自動判定（国土交通省 不動産情報ライブラリAPI）
    const zoningResult: ZoningLookupResult = await getZoningByLatLon(
      geocodeResult.data.lat,
      geocodeResult.data.lon
    );

    // 3. 自治体情報の検索
    const municipalityInfo = findMunicipality(
      geocodeResult.data.prefecture,
      geocodeResult.data.city
    );

    // 4. 判定結果の構築
    const z = zoningResult.zoning;
    const result: CheckResult = {
      address,
      geocode: {
        lat: geocodeResult.data.lat,
        lon: geocodeResult.data.lon,
        displayName: geocodeResult.data.displayName,
        prefecture: geocodeResult.data.prefecture,
        city: geocodeResult.data.city,
        source: geocodeResult.data.source,
        retryCount: geocodeResult.data.retryCount,
      },
      zoning: {
        detected: zoningResult.detected,
        name: z?.name || null,
        code: z?.code || null,
        description: z?.description || null,
        minpakuStatus: z?.minpakuStatus || null,
        minpakuStatusLabel: z ? getStatusLabel(z.minpakuStatus) : null,
        ryokanStatus: z?.ryokanStatus || null,
        ryokanStatusLabel: z ? getStatusLabel(z.ryokanStatus) : null,
        minpakuDetail: z?.minpakuDetail || null,
        color: z?.color || null,
        floorAreaRatio: zoningResult.floorAreaRatio,
        buildingCoverageRatio: zoningResult.buildingCoverageRatio,
        rawZoningName: zoningResult.rawZoningName,
        externalMapUrl: zoningResult.externalMapUrl,
        source: 'reinfolib',
      },
      municipality: {
        found: !!municipalityInfo,
        info: municipalityInfo,
      },
      dataMeta: {
        municipalityLastVerifiedAt: MUNICIPALITY_DATA_LAST_VERIFIED_AT,
      },
      disclaimer:
        '⚠️ 本ツールの判定結果は参考情報です。正確な用途地域の確認は、各自治体の都市計画課にお問い合わせください。民泊営業の最終判断は、必ず管轄の保健所・自治体にご確認ください。',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('チェックAPIエラー:', error);
    return createErrorResponse(500, 'INTERNAL', 'サーバーエラーが発生しました。もう一度お試しください。');
  }
}

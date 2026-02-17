import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocoding';
import { ZONING_TYPES, getStatusLabel } from '@/lib/zoning-data';
import { findMunicipality } from '@/lib/municipality-data';

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
  };
  /** 用途地域情報（参考データベースからの推定） */
  zoningReference: {
    note: string;
    allZoningTypes: typeof ZONING_TYPES;
    externalMapUrl: string;
  };
  /** 自治体情報 */
  municipality: {
    found: boolean;
    info: ReturnType<typeof findMunicipality>;
  };
  /** 免責事項 */
  disclaimer: string;
}

/**
 * POST /api/check
 * 住所を受け取り、ジオコーディング＋用途地域参照＋自治体情報を返す
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: '住所を入力してください' },
        { status: 400 }
      );
    }

    // 1. ジオコーディング
    const geocodeResult = await geocodeAddress(address);

    if (!geocodeResult) {
      return NextResponse.json(
        { error: '住所が見つかりませんでした。正しい住所を入力してください。' },
        { status: 404 }
      );
    }

    // 2. 自治体情報の検索
    const municipalityInfo = findMunicipality(
      geocodeResult.prefecture,
      geocodeResult.city
    );

    // 3. 用途地域マップへの外部リンク生成
    const externalMapUrl = `https://cityzone.mapexpert.net/?ll=${geocodeResult.lat},${geocodeResult.lon}&z=16`;

    // 4. 判定結果の構築
    const result: CheckResult = {
      address,
      geocode: {
        lat: geocodeResult.lat,
        lon: geocodeResult.lon,
        displayName: geocodeResult.displayName,
        prefecture: geocodeResult.prefecture,
        city: geocodeResult.city,
      },
      zoningReference: {
        note: 'この地点の正確な用途地域は、下記の外部地図サービスで確認してください。用途地域が判明したら、下に用途地域別の民泊ルール一覧を参照できます。',
        allZoningTypes: ZONING_TYPES.map((z) => ({
          ...z,
          statusLabel: getStatusLabel(z.minpakuStatus),
        })),
        externalMapUrl,
      },
      municipality: {
        found: !!municipalityInfo,
        info: municipalityInfo,
      },
      disclaimer:
        '⚠️ 本ツールの判定結果は参考情報です。正確な用途地域の確認は、各自治体の都市計画課または用途地域マップ（外部リンク）をご利用ください。民泊営業の最終判断は、必ず管轄の保健所・自治体にご確認ください。',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('チェックAPIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}

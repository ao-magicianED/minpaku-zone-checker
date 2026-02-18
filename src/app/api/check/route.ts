import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocoding';
import { ZONING_TYPES, getStatusLabel } from '@/lib/zoning-data';
import { findMunicipality } from '@/lib/municipality-data';
import { verifySessionToken, getUsageLimit, COOKIE_NAME, type SessionPayload } from '@/lib/auth';
import { getUsageFromCookie, incrementUsage } from '@/lib/usage';

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
  /** 利用状況 */
  usage?: {
    current: number;
    limit: number;
    planTier: string;
  };
}

/**
 * POST /api/check
 * 住所を受け取り、ジオコーディング＋用途地域参照＋自治体情報を返す
 */
export async function POST(request: NextRequest) {
  try {
    // 1. セッション確認（任意 — ゲストも利用可）
    let session: SessionPayload | null = null;
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);
    const sessionToken = cookies[COOKIE_NAME];
    if (sessionToken) {
      session = await verifySessionToken(sessionToken);
    }

    // 2. 利用回数チェック
    const usageLimit = getUsageLimit(session);
    const usageData = getUsageFromCookie(cookieHeader);

    if (usageData.count >= usageLimit) {
      const limitMessage = session
        ? session.planTier === 'light'
          ? '今月のライトプラン利用上限（30回）に達しました。プレミアムプランにアップグレードすると無制限でご利用いただけます。'
          : '利用上限に達しました。'
        : '今月の無料利用回数（3回）に達しました。あおサロンAI会員になると最大無制限でご利用いただけます。';

      return NextResponse.json(
        {
          error: limitMessage,
          usageLimitReached: true,
          usage: {
            current: usageData.count,
            limit: usageLimit === Infinity ? -1 : usageLimit,
            planTier: session?.planTier || 'guest',
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: '住所を入力してください' },
        { status: 400 }
      );
    }

    // 3. ジオコーディング
    const geocodeResult = await geocodeAddress(address);

    if (!geocodeResult) {
      return NextResponse.json(
        { error: '住所が見つかりませんでした。正しい住所を入力してください。' },
        { status: 404 }
      );
    }

    // 4. 自治体情報の検索
    const municipalityInfo = findMunicipality(
      geocodeResult.prefecture,
      geocodeResult.city
    );

    // 5. 用途地域マップへの外部リンク生成
    const externalMapUrl = `https://cityzone.mapexpert.net/?ll=${geocodeResult.lat},${geocodeResult.lon}&z=16`;

    // 6. 利用回数をインクリメント
    const newUsage = incrementUsage(usageData);

    // 7. 判定結果の構築
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
      usage: {
        current: newUsage.data.count,
        limit: usageLimit === Infinity ? -1 : usageLimit,
        planTier: session?.planTier || 'guest',
      },
    };

    const response = NextResponse.json(result);
    // 利用回数Cookieを設定
    response.headers.append('Set-Cookie', newUsage.cookieValue);
    return response;
  } catch (error) {
    console.error('チェックAPIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}

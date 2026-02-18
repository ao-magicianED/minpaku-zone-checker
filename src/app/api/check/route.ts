import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocoding';
import { ZONING_TYPES, getStatusLabel } from '@/lib/zoning-data';
import { findMunicipality, MUNICIPALITY_DATA_LAST_VERIFIED_AT } from '@/lib/municipality-data';
import { verifySessionToken, getUsageLimit, COOKIE_NAME, type SessionPayload } from '@/lib/auth';
import { buildUsageSubject, consumeUsage, getCurrentUsageCount } from '@/lib/usage';

type CheckErrorCode =
  | 'INVALID_INPUT'
  | 'USAGE_LIMIT'
  | 'GEOCODE_NOT_FOUND'
  | 'GEOCODE_UPSTREAM'
  | 'INTERNAL';

interface UsageResponse {
  current: number;
  limit: number;
  planTier: string;
}

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
    source: 'nominatim' | 'mlit';
    retryCount: number;
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
  /** データの最終確認情報 */
  dataMeta: {
    municipalityLastVerifiedAt: string;
  };
  /** 免責事項 */
  disclaimer: string;
  /** 利用状況 */
  usage?: UsageResponse;
}

function toUsageLimitValue(limit: number): number {
  return Number.isFinite(limit) ? limit : -1;
}

function createErrorResponse(
  status: number,
  errorCode: CheckErrorCode,
  error: string,
  usage?: UsageResponse
) {
  return NextResponse.json(
    {
      errorCode,
      error,
      usageLimitReached: errorCode === 'USAGE_LIMIT',
      usage,
    },
    { status }
  );
}

function createUsageLimitMessage(session: SessionPayload | null): string {
  if (!session) {
    return '今月の無料利用回数（3回）に達しました。あおサロンAI会員になると無制限でご利用いただけます。';
  }
  if (session.planTier === 'light') {
    return '今月のライトプラン利用上限（30回）に達しました。プレミアムプランにアップグレードすると無制限でご利用いただけます。';
  }
  return '利用上限に達しました。';
}

/**
 * POST /api/check
 * 住所を受け取り、ジオコーディング＋用途地域参照＋自治体情報を返す
 */
export async function POST(request: NextRequest) {
  try {
    // 1. セッション確認（任意 — ゲストも利用可）
    let session: SessionPayload | null = null;
    const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
    if (sessionToken) {
      session = await verifySessionToken(sessionToken);
    }

    // 2. 利用回数チェック
    const usageLimit = getUsageLimit(session);
    const usageSubject = buildUsageSubject(request, session);
    const currentUsage = await getCurrentUsageCount(usageSubject);

    if (Number.isFinite(usageLimit) && currentUsage >= usageLimit) {
      return createErrorResponse(
        429,
        'USAGE_LIMIT',
        createUsageLimitMessage(session),
        {
          current: currentUsage,
          limit: toUsageLimitValue(usageLimit),
          planTier: session?.planTier || 'guest',
        }
      );
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const address = typeof body?.address === 'string' ? body.address.trim() : '';

    if (!address) {
      return createErrorResponse(400, 'INVALID_INPUT', '住所を入力してください');
    }

    // 3. ジオコーディング
    const geocodeResult = await geocodeAddress(address);
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

    // 4. 自治体情報の検索
    const municipalityInfo = findMunicipality(
      geocodeResult.data.prefecture,
      geocodeResult.data.city
    );

    // 5. 用途地域マップへの外部リンク生成
    const externalMapUrl = `https://cityzone.mapexpert.net/?ll=${geocodeResult.data.lat},${geocodeResult.data.lon}&z=16`;

    // --- 2. 利用回数制限のチェック ---
    // Supabase の usage_counters テーブルを使用して回数を管理
    const usageResult = await consumeUsage(usageSubject, usageLimit);
    
    if (!usageResult.allowed) {
      const isGuest = !session;
      const limitLabel = isGuest ? 'ゲスト利用上限' : 'プラン上限';
      return createErrorResponse(
        403, 
        'USAGE_LIMIT', 
        `今月の${limitLabel}（${usageResult.limit}回）に達しました。`,
        {
          limit: usageResult.limit,
          current: usageResult.current,
          planTier: session?.planTier || 'guest'
        }
      );
    }

    // 7. 判定結果の構築
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
      dataMeta: {
        municipalityLastVerifiedAt: MUNICIPALITY_DATA_LAST_VERIFIED_AT,
      },
      disclaimer:
        '⚠️ 本ツールの判定結果は参考情報です。正確な用途地域の確認は、各自治体の都市計画課または用途地域マップ（外部リンク）をご利用ください。民泊営業の最終判断は、必ず管轄の保健所・自治体にご確認ください。',
      usage: {
        current: usageResult.current,
        limit: toUsageLimitValue(usageLimit),
        planTier: session?.planTier || 'guest',
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('チェックAPIエラー:', error);
    return createErrorResponse(500, 'INTERNAL', 'サーバーエラーが発生しました。もう一度お試しください。');
  }
}

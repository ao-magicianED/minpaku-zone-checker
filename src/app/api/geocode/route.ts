import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocoding';

/**
 * GET /api/geocode?q=住所
 * 住所をジオコーディングして緯度経度を返す
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json(
      { error: '住所（q パラメータ）を指定してください', errorCode: 'INVALID_INPUT' },
      { status: 400 }
    );
  }

  const result = await geocodeAddress(query);

  if (!result.ok) {
    if (result.reason === 'upstream_error') {
      return NextResponse.json(
        {
          error: '住所検索サーバーで一時的な問題が発生しています。時間をおいて再度お試しください。',
          errorCode: 'GEOCODE_UPSTREAM',
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: '住所が見つかりませんでした。正確な住所を入力してください。', errorCode: 'GEOCODE_NOT_FOUND' },
      { status: 404 }
    );
  }

  return NextResponse.json(result.data);
}

import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocoding';

/**
 * GET /api/geocode?q=住所
 * 住所をジオコーディングして緯度経度を返す
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: '住所（q パラメータ）を指定してください' },
      { status: 400 }
    );
  }

  const result = await geocodeAddress(query);

  if (!result) {
    return NextResponse.json(
      { error: '住所が見つかりませんでした。正確な住所を入力してください。' },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}

import { NextResponse } from 'next/server';
import { getZoningByLatLon } from '@/lib/reinfolib';

/**
 * GET /api/test-zoning?lat=35.6938&lon=139.7029
 * 用途地域判定のデバッグ用エンドポイント
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get('lat') || '35.6938');
  const lon = parseFloat(url.searchParams.get('lon') || '139.7029');

  const apiKey = process.env.REINFOLIB_API_KEY;
  const hasKey = !!apiKey;
  const keyPrefix = apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET';

  console.log('[test-zoning] API key present:', hasKey, 'prefix:', keyPrefix);
  console.log('[test-zoning] Testing lat:', lat, 'lon:', lon);

  try {
    const startTime = Date.now();
    const result = await getZoningByLatLon(lat, lon);
    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      debug: {
        apiKeyPresent: hasKey,
        apiKeyPrefix: keyPrefix,
        elapsedMs: elapsed,
        lat,
        lon,
      },
      result,
    });
  } catch (error) {
    return NextResponse.json({
      debug: {
        apiKeyPresent: hasKey,
        apiKeyPrefix: keyPrefix,
        lat,
        lon,
      },
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

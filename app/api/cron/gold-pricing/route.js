import { NextResponse } from 'next/server';
import {
  fetchAndSaveLatestGoldRate,
  recalculateAllGoldPricedProducts,
} from '@/lib/gold-pricing';

export async function GET(request) {
  const secret = String(process.env.CRON_SECRET || '').trim();
  const authorization = request.headers.get('authorization');

  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 });
  }
  if (authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await fetchAndSaveLatestGoldRate();
    const result = await recalculateAllGoldPricedProducts();
    return NextResponse.json({ success: true, ...result, settings });
  } catch (err) {
    console.error('[cron:gold-pricing]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Could not update gold pricing' },
      { status: 500 },
    );
  }
}

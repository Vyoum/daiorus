import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import {
  fetchAndSaveLatestGoldRate,
  getGoldPricingSettings,
  recalculateAllGoldPricedProducts,
  saveGoldPricingSettings,
} from '@/lib/gold-pricing';

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const settings = await getGoldPricingSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[admin:gold-pricing:GET]', err?.message || err);
    return NextResponse.json({ error: 'Could not load gold pricing' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const body = await request.json();
    const settings = await saveGoldPricingSettings(body?.settings || body || {});
    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[admin:gold-pricing:PUT]', err?.message || err);
    return NextResponse.json({ error: 'Could not save gold pricing' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => ({}));
    if (body?.action === 'fetch-latest') {
      const settings = await fetchAndSaveLatestGoldRate();
      try {
        const result = await recalculateAllGoldPricedProducts();
        return NextResponse.json({ ...result, settings });
      } catch (recalcErr) {
        console.error('[admin:gold-pricing:recalculate]', recalcErr?.message || recalcErr);
        return NextResponse.json({
          settings,
          updated: 0,
          skipped: 0,
          total: 0,
          warning: recalcErr?.message || 'Rate saved, but product recalculation failed.',
        });
      }
    }

    if (body?.action === 'recalculate') {
      const result = await recalculateAllGoldPricedProducts();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[admin:gold-pricing:POST]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Could not recalculate product prices' },
      { status: 400 },
    );
  }
}

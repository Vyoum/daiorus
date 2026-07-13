import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { getOverseasPricingData } from '@/lib/admin/overseas';
import { saveOverseasSurchargeMap } from '@/lib/overseas-pricing';

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const data = await getOverseasPricingData();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[admin:overseas:GET]', err?.message || err);
    return NextResponse.json({ error: 'Could not load overseas pricing' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const body = await request.json();
    await saveOverseasSurchargeMap(body?.surcharges || body || {});
    const data = await getOverseasPricingData();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[admin:overseas:PUT]', err?.message || err);
    return NextResponse.json({ error: 'Could not save overseas pricing' }, { status: 500 });
  }
}

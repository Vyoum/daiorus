import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { createAdminCoupon, getAdminCoupons } from '@/lib/admin/coupons';

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const coupons = await getAdminCoupons();
    return NextResponse.json({ coupons });
  } catch (err) {
    console.error('[admin:coupons:GET]', err?.message || err);
    return NextResponse.json({ error: 'Could not load coupons' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const body = await request.json();
    const coupon = await createAdminCoupon(body);
    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    console.error('[admin:coupons:POST]', err?.message || err);
    return NextResponse.json({ error: err.message || 'Could not create coupon' }, { status: 400 });
  }
}

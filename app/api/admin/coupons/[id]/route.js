import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { deleteAdminCoupon, updateAdminCoupon } from '@/lib/admin/coupons';

export async function PATCH(request, { params }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const coupon = await updateAdminCoupon(id, body);
    return NextResponse.json(coupon);
  } catch (err) {
    console.error('[admin:coupons:PATCH]', err?.message || err);
    const status = err.message === 'Coupon not found' ? 404 : 400;
    return NextResponse.json({ error: err.message || 'Could not update coupon' }, { status });
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const result = await deleteAdminCoupon(id);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin:coupons:DELETE]', err?.message || err);
    const status = err.message === 'Coupon not found' ? 404 : 400;
    return NextResponse.json({ error: err.message || 'Could not delete coupon' }, { status });
  }
}

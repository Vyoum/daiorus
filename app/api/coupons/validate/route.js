import { NextResponse } from 'next/server';
import { applyCouponCodeToTotals } from '@/lib/coupons-server';

export async function POST(request) {
  try {
    const body = await request.json();
    const subtotalInr = Number(body?.subtotalInr);
    const shippingInr = Number(body?.shippingInr) || 0;
    const couponCode = body?.couponCode;

    if (!Number.isFinite(subtotalInr) || subtotalInr < 0) {
      return NextResponse.json({ error: 'Invalid cart subtotal' }, { status: 400 });
    }

    const result = await applyCouponCodeToTotals({
      subtotalInr,
      shippingInr,
      couponCode,
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.error || 'This coupon code is not valid.',
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: result.coupon,
      discountInr: result.discountInr,
      shippingInr: result.shippingInr,
      totalInr: result.totalInr,
    });
  } catch (error) {
    console.error('[coupons:validate]', error);
    return NextResponse.json({ error: 'Could not validate coupon' }, { status: 500 });
  }
}

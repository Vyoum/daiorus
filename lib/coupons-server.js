import prisma from './prisma';
import { ensureDefaultCoupons } from './admin/coupons';
import {
  applyCouponToTotals,
  findFallbackCoupon,
  mapCouponRecord,
  normalizeCouponCode,
} from './coupons';

export async function resolveCoupon(code) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;

  try {
    await ensureDefaultCoupons();
    const row = await prisma.coupon.findUnique({ where: { code: normalized } });
    if (row) return mapCouponRecord(row);
  } catch (err) {
    console.error('[coupons:resolve]', err?.message || err);
  }

  return findFallbackCoupon(normalized);
}

export async function applyCouponCodeToTotals({ subtotalInr, shippingInr = 0, couponCode }) {
  const coupon = await resolveCoupon(couponCode);
  return applyCouponToTotals({ subtotalInr, shippingInr, coupon });
}

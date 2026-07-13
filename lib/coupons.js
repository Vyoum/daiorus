/** Demo storefront coupons until admin coupon DB is wired. */
export const STORE_COUPONS = {
  DAIORUS10: {
    code: 'DAIORUS10',
    type: 'percent',
    value: 10,
    label: '10% off',
  },
  WELCOME500: {
    code: 'WELCOME500',
    type: 'fixed',
    value: 500,
    label: '₹500 off',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'fixed',
    value: 0,
    label: 'Free shipping',
  },
};

export function normalizeCouponCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function findCoupon(code) {
  const key = normalizeCouponCode(code);
  return STORE_COUPONS[key] || null;
}

export function calculateDiscountInr(subtotalInr, coupon) {
  if (!coupon || !subtotalInr) return 0;
  if (coupon.type === 'percent') {
    return Math.min(subtotalInr, Math.round((subtotalInr * coupon.value) / 100));
  }
  if (coupon.type === 'fixed') {
    return Math.min(subtotalInr, Math.round(coupon.value));
  }
  return 0;
}

export function applyCouponToTotals({ subtotalInr, shippingInr = 0, couponCode }) {
  const coupon = findCoupon(couponCode);
  const discountInr = calculateDiscountInr(subtotalInr, coupon);
  const totalInr = Math.max(0, subtotalInr + shippingInr - discountInr);
  return {
    coupon,
    discountInr,
    totalInr,
    valid: Boolean(coupon),
  };
}

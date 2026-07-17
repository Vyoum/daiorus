/** Client-safe coupon helpers (no database imports). */

export const STORE_COUPONS = {
  DAIORUS10: {
    code: 'DAIORUS10',
    type: 'percent',
    value: 10,
    label: '10% off',
    freeShipping: false,
    minSubtotalInr: 0,
    isActive: true,
  },
  WELCOME500: {
    code: 'WELCOME500',
    type: 'fixed',
    value: 500,
    label: '₹500 off',
    freeShipping: false,
    minSubtotalInr: 0,
    isActive: true,
  },
};

export function normalizeCouponCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function mapCouponRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    type: row.type === 'PERCENT' ? 'percent' : 'fixed',
    value: row.value,
    label: row.label || row.code,
    freeShipping: Boolean(row.freeShipping),
    minSubtotalInr: row.minSubtotalInr || 0,
    maxUses: row.maxUses,
    usedCount: row.usedCount || 0,
    startsAt: row.startsAt,
    expiresAt: row.expiresAt,
    isActive: row.isActive,
  };
}

export function couponValidationError(coupon, { subtotalInr = 0, now = new Date() } = {}) {
  if (!coupon) return 'This coupon code is not valid.';
  if (coupon.isActive === false) return 'This coupon is no longer active.';
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return 'This coupon is not active yet.';
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return 'This coupon has expired.';
  if (coupon.maxUses != null && (coupon.usedCount || 0) >= coupon.maxUses) {
    return 'This coupon has reached its usage limit.';
  }
  if (coupon.minSubtotalInr > 0 && subtotalInr < coupon.minSubtotalInr) {
    return `Minimum order value is ₹${coupon.minSubtotalInr.toLocaleString('en-IN')}.`;
  }
  return null;
}

export function calculateDiscountInr(subtotalInr, coupon, shippingInr = 0) {
  if (!coupon) return 0;

  let discountInr = 0;
  if (coupon.type === 'percent') {
    discountInr = Math.min(subtotalInr, Math.round((subtotalInr * coupon.value) / 100));
  } else if (coupon.type === 'fixed') {
    discountInr = Math.min(subtotalInr, Math.round(coupon.value));
  }

  if (coupon.freeShipping && shippingInr > 0) {
    discountInr += shippingInr;
  }

  return Math.min(subtotalInr + shippingInr, discountInr);
}

export function applyCouponToTotals({ subtotalInr, shippingInr = 0, coupon }) {
  const validationError = couponValidationError(coupon, { subtotalInr });
  if (validationError) {
    return {
      coupon: null,
      discountInr: 0,
      shippingInr,
      totalInr: Math.max(0, subtotalInr + shippingInr),
      valid: false,
      error: validationError,
    };
  }

  const discountInr = calculateDiscountInr(subtotalInr, coupon, shippingInr);
  const finalShipping = coupon?.freeShipping ? 0 : shippingInr;
  const totalInr = Math.max(0, subtotalInr + finalShipping - discountInr);

  return {
    coupon,
    discountInr,
    shippingInr: finalShipping,
    totalInr,
    valid: Boolean(coupon),
    error: null,
  };
}

export function findFallbackCoupon(code) {
  const key = normalizeCouponCode(code);
  return STORE_COUPONS[key] || null;
}

/** @deprecated Use resolveCoupon on the server instead */
export function findCoupon(code) {
  return findFallbackCoupon(code);
}

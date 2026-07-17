import prisma from '../prisma';
import { normalizeCouponCode } from '../coupons';

const DEFAULT_COUPONS = [
  {
    code: 'DAIORUS10',
    label: '10% off',
    type: 'PERCENT',
    value: 10,
  },
  {
    code: 'WELCOME500',
    label: '₹500 off',
    type: 'FIXED',
    value: 500,
  },
];

export async function ensureDefaultCoupons() {
  const count = await prisma.coupon.count();
  if (count > 0) return;

  await prisma.coupon.createMany({
    data: DEFAULT_COUPONS.map((row) => ({
      code: row.code,
      label: row.label,
      type: row.type,
      value: row.value,
      isActive: true,
    })),
    skipDuplicates: true,
  });
}

function mapCoupon(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    label: row.label || row.code,
    type: row.type === 'PERCENT' ? 'percent' : 'fixed',
    dbType: row.type,
    value: row.value,
    freeShipping: Boolean(row.freeShipping),
    minSubtotalInr: row.minSubtotalInr || 0,
    maxUses: row.maxUses,
    usedCount: row.usedCount || 0,
    startsAt: row.startsAt,
    expiresAt: row.expiresAt,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAdminCoupons() {
  await ensureDefaultCoupons();
  const rows = await prisma.coupon.findMany({
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
  });
  return rows.map(mapCoupon);
}

function parseCouponInput(input = {}, { partial = false } = {}) {
  const data = {};
  const errors = [];

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'code')) {
    const code = normalizeCouponCode(input.code);
    if (!code) errors.push('Coupon code is required');
    else data.code = code;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'label')) {
    data.label = String(input.label || '').trim() || null;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'type')) {
    const rawType = String(input.type || '').toUpperCase();
    if (rawType !== 'PERCENT' && rawType !== 'FIXED') {
      errors.push('Discount type must be percent or fixed');
    } else {
      data.type = rawType;
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'value')) {
    const value = Number(input.value);
    if (!Number.isFinite(value) || value < 0) {
      errors.push('Discount value must be zero or more');
    } else if (data.type === 'PERCENT' && (value < 1 || value > 100)) {
      errors.push('Percent discount must be between 1 and 100');
    } else if (data.type === 'FIXED' && value < 1 && !input.freeShipping) {
      errors.push('Fixed discount must be at least ₹1');
    } else {
      data.value = Math.round(value);
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'freeShipping')) {
    data.freeShipping = Boolean(input.freeShipping);
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'minSubtotalInr')) {
    const minSubtotalInr = Number(input.minSubtotalInr);
    data.minSubtotalInr =
      Number.isFinite(minSubtotalInr) && minSubtotalInr > 0 ? Math.round(minSubtotalInr) : 0;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'maxUses')) {
    const maxUsesRaw = input.maxUses;
    if (maxUsesRaw === null || maxUsesRaw === '' || maxUsesRaw === undefined) {
      data.maxUses = null;
    } else {
      const maxUses = Number(maxUsesRaw);
      if (!Number.isFinite(maxUses) || maxUses < 1) {
        errors.push('Max uses must be at least 1');
      } else {
        data.maxUses = Math.round(maxUses);
      }
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'startsAt')) {
    data.startsAt = input.startsAt ? new Date(input.startsAt) : null;
    if (data.startsAt && Number.isNaN(data.startsAt.getTime())) {
      errors.push('Start date is invalid');
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'expiresAt')) {
    data.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    if (data.expiresAt && Number.isNaN(data.expiresAt.getTime())) {
      errors.push('Expiry date is invalid');
    }
  }

  if (
    data.startsAt &&
    data.expiresAt &&
    !Number.isNaN(data.startsAt.getTime()) &&
    !Number.isNaN(data.expiresAt.getTime()) &&
    data.startsAt > data.expiresAt
  ) {
    errors.push('Start date must be before expiry date');
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'isActive')) {
    data.isActive = input.isActive !== false;
  }

  if (errors.length) {
    throw new Error(errors[0]);
  }

  return data;
}

export async function createAdminCoupon(input) {
  const data = parseCouponInput(input);
  const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
  if (existing) throw new Error('A coupon with this code already exists');

  const row = await prisma.coupon.create({ data });
  return mapCoupon(row);
}

export async function updateAdminCoupon(id, input) {
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw new Error('Coupon not found');

  const data = parseCouponInput(input, { partial: true });
  if (data.code && data.code !== existing.code) {
    const duplicate = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (duplicate) throw new Error('A coupon with this code already exists');
  }

  const row = await prisma.coupon.update({
    where: { id },
    data,
  });
  return mapCoupon(row);
}

export async function deleteAdminCoupon(id) {
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw new Error('Coupon not found');
  await prisma.coupon.delete({ where: { id } });
  return { ok: true, id };
}

export async function incrementCouponUsage(code) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return;

  await prisma.coupon.updateMany({
    where: { code: normalized },
    data: { usedCount: { increment: 1 } },
  });
}

import prisma from '../prisma';

export async function getAccountAddresses(userId) {
  if (!userId) return [];

  try {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
    });
  } catch (err) {
    console.error('[account:addresses]', err?.message || err);
    return [];
  }
}

export function validateAddressBody(body) {
  const label = String(body?.label || '').trim() || null;
  const line1 = String(body?.line1 || '').trim();
  const line2 = String(body?.line2 || '').trim() || null;
  const city = String(body?.city || '').trim();
  const state = String(body?.state || '').trim();
  const postalCode = String(body?.postalCode || '').trim();
  const country = String(body?.country || 'IN').trim().toUpperCase() || 'IN';
  const isDefault = Boolean(body?.isDefault);

  if (!line1) return { error: 'Address line is required' };
  if (!city) return { error: 'City is required' };
  if (!state) return { error: 'State is required' };
  if (!postalCode) return { error: 'Postal code is required' };

  return {
    data: { label, line1, line2, city, state, postalCode, country, isDefault },
  };
}

export async function clearDefaultAddresses(userId, exceptId = null) {
  await prisma.address.updateMany({
    where: {
      userId,
      isDefault: true,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isDefault: false },
  });
}

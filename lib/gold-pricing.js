import prisma from './prisma';
import { calculateGoldProductPrice } from './gold-pricing-calc';
import {
  CONTENT_KEY_GOLD_PRICING,
  DEFAULT_GOLD_PRICING,
  normalizeGoldPricingSettings,
} from './gold-pricing-defaults';

export {
  CONTENT_KEY_GOLD_PRICING,
  DEFAULT_GOLD_PRICING,
  KARAT_PURITY,
  normalizeGoldPricingSettings,
} from './gold-pricing-defaults';

export {
  calculateGoldProductPrice,
  calculateGoldValue,
  getKaratPurity,
  inferFixedNonGoldPrice,
} from './gold-pricing-calc';

export async function getGoldPricingSettings() {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: CONTENT_KEY_GOLD_PRICING },
      select: { metadata: true, updatedAt: true },
    });

    const settings = normalizeGoldPricingSettings(row?.metadata);
    if (!settings.updatedAt && row?.updatedAt) {
      settings.updatedAt = row.updatedAt.toISOString();
    }
    return settings;
  } catch (err) {
    console.error('[gold-pricing:settings]', err?.message || err);
    return normalizeGoldPricingSettings(DEFAULT_GOLD_PRICING);
  }
}

export async function saveGoldPricingSettings(input) {
  const settings = normalizeGoldPricingSettings({
    ...input,
    updatedAt: new Date().toISOString(),
  });

  await prisma.siteContent.upsert({
    where: { key: CONTENT_KEY_GOLD_PRICING },
    create: {
      key: CONTENT_KEY_GOLD_PRICING,
      type: 'SECTION',
      title: 'Gold pricing',
      body: null,
      imageUrl: null,
      linkUrl: null,
      metadata: settings,
      isPublished: true,
      sortOrder: 11,
    },
    update: {
      type: 'SECTION',
      title: 'Gold pricing',
      metadata: settings,
      isPublished: true,
    },
  });

  return settings;
}

export async function fetchGoldApiRate() {
  const apiKey = String(process.env.GOLDAPI_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GOLDAPI_KEY is not configured.');
  }

  const response = await fetch('https://www.goldapi.io/api/XAU/INR', {
    headers: {
      'x-access-token': apiKey,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `GoldAPI request failed (${response.status}).`);
  }

  const rate24kPerGram = Math.round(Number(data?.price_gram_24k));
  if (!Number.isFinite(rate24kPerGram) || rate24kPerGram <= 0) {
    throw new Error('GoldAPI did not return a valid 24K INR price per gram.');
  }

  return {
    rate24kPerGram,
    source: 'goldapi.io',
    providerTimestamp: data?.timestamp || null,
  };
}

export async function fetchAndSaveLatestGoldRate() {
  const latest = await fetchGoldApiRate();
  return saveGoldPricingSettings(latest);
}

export async function recalculateAllGoldPricedProducts() {
  const settings = await getGoldPricingSettings();
  if (!settings.rate24kPerGram) {
    throw new Error('Set today’s 24K gold rate before recalculating product prices.');
  }

  const products = await prisma.product.findMany({
    where: {
      goldPricingEnabled: true,
      goldWeightGrams: { gt: 0 },
      fixedNonGoldPriceInr: { not: null },
    },
    select: {
      id: true,
      name: true,
      goldWeightGrams: true,
      material: true,
      fixedNonGoldPriceInr: true,
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const calculated = calculateGoldProductPrice({
      goldWeightGrams: product.goldWeightGrams,
      material: product.material,
      rate24kPerGram: settings.rate24kPerGram,
      fixedNonGoldPriceInr: product.fixedNonGoldPriceInr,
    });

    if (!calculated?.priceInr) {
      skipped += 1;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        priceInr: calculated.priceInr,
        goldRate24kAtPricingInr: settings.rate24kPerGram,
      },
    });
    updated += 1;
  }

  return {
    updated,
    skipped,
    total: products.length,
    settings,
  };
}

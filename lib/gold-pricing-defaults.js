export const CONTENT_KEY_GOLD_PRICING = 'gold_pricing';

/** BIS purity factors applied to the 24K base rate. */
export const KARAT_PURITY = {
  '14K': 0.585,
  '18K': 0.75,
  '20K': 0.833,
  '22K': 0.916,
  '24K': 0.999,
};

/**
 * GoldAPI returns international spot FX in INR, which sits below Indian jewellery
 * market rates (IBJA / city retail). This premium bridges that gap on fetch.
 * Tune in Admin → Gold Pricing if your local rate drifts.
 */
export const DEFAULT_INDIA_PREMIUM_PCT = 14;

export const DEFAULT_GOLD_PRICING = {
  rate24kPerGram: 0,
  spotRate24kPerGram: 0,
  indiaPremiumPct: DEFAULT_INDIA_PREMIUM_PCT,
  updatedAt: null,
  source: 'manual',
};

export function normalizeGoldPricingSettings(raw = {}) {
  const rate24kPerGram = Math.max(0, Math.round(Number(raw?.rate24kPerGram) || 0));
  const spotRate24kPerGram = Math.max(0, Math.round(Number(raw?.spotRate24kPerGram) || 0));
  const indiaPremiumPct = Math.max(
    0,
    Math.min(50, Number(raw?.indiaPremiumPct ?? DEFAULT_INDIA_PREMIUM_PCT) || 0),
  );
  const updatedAt = raw?.updatedAt ? String(raw.updatedAt) : null;
  const source = String(raw?.source || DEFAULT_GOLD_PRICING.source).trim() || 'manual';

  return {
    rate24kPerGram,
    spotRate24kPerGram,
    indiaPremiumPct: Math.round(indiaPremiumPct * 100) / 100,
    updatedAt,
    source,
  };
}

/** Apply India premium to a GoldAPI spot rate (INR / gram 24K). */
export function applyIndiaPremiumToSpot(spotRate24kPerGram, indiaPremiumPct) {
  const spot = Math.max(0, Number(spotRate24kPerGram) || 0);
  const pct = Math.max(0, Number(indiaPremiumPct) || 0);
  if (!spot) return 0;
  return Math.round(spot * (1 + pct / 100));
}

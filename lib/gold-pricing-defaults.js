export const CONTENT_KEY_GOLD_PRICING = 'gold_pricing';

/** BIS purity factors applied to the 24K base rate. */
export const KARAT_PURITY = {
  '14K': 0.585,
  '18K': 0.75,
  '20K': 0.833,
  '22K': 0.916,
  '24K': 0.999,
};

export const DEFAULT_GOLD_PRICING = {
  rate24kPerGram: 0,
  updatedAt: null,
  source: 'manual',
};

export function normalizeGoldPricingSettings(raw = {}) {
  const rate24kPerGram = Math.max(0, Math.round(Number(raw?.rate24kPerGram) || 0));
  const updatedAt = raw?.updatedAt ? String(raw.updatedAt) : null;
  const source = String(raw?.source || DEFAULT_GOLD_PRICING.source).trim() || 'manual';

  return {
    rate24kPerGram,
    updatedAt,
    source,
  };
}

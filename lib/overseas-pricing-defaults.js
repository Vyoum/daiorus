export const CONTENT_KEY_OVERSEAS = 'overseas_surcharges';

export const OVERSEAS_REGION_DEFAULTS = [
  { code: 'US', name: 'United States', currency: 'USD', surchargePct: 12 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', surchargePct: 18 },
  { code: 'AU', name: 'Australia', currency: 'AUD', surchargePct: 20 },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', surchargePct: 15 },
  { code: 'SG', name: 'Singapore', currency: 'SGD', surchargePct: 14 },
  { code: 'IN', name: 'India (Domestic)', currency: 'INR', surchargePct: 0 },
];

export function defaultSurchargeMap() {
  return Object.fromEntries(
    OVERSEAS_REGION_DEFAULTS.map((region) => [region.code, region.surchargePct]),
  );
}

export function normalizeSurchargeMap(input) {
  const defaults = defaultSurchargeMap();
  const next = { ...defaults };

  if (!input || typeof input !== 'object') return next;

  for (const region of OVERSEAS_REGION_DEFAULTS) {
    const raw = input[region.code];
    if (raw == null || raw === '') continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) continue;
    next[region.code] = Math.round(value * 100) / 100;
  }

  next.IN = 0;
  return next;
}

export function getSurchargePctFromMap(map, countryOrCurrencyCode) {
  const code = String(countryOrCurrencyCode || 'IN').toUpperCase();
  const surcharges = map || defaultSurchargeMap();

  if (surcharges[code] != null) return Number(surcharges[code]) || 0;

  const byCurrency = OVERSEAS_REGION_DEFAULTS.find((r) => r.currency === code);
  if (byCurrency && surcharges[byCurrency.code] != null) {
    return Number(surcharges[byCurrency.code]) || 0;
  }

  return 0;
}

/** Bake surcharge into INR before FX / payment. */
export function applySurchargeInr(amountInr, surchargePct = 0) {
  const base = Number(amountInr) || 0;
  const pct = Number(surchargePct) || 0;
  if (!pct) return Math.round(base);
  return Math.round(base * (1 + pct / 100));
}

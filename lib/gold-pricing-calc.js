import { parseGoldKarat } from './product-material';
import { KARAT_PURITY } from './gold-pricing-defaults';

export function getKaratPurity(karat) {
  if (!karat) return null;

  const normalized = String(karat).toUpperCase().replace(/\s+/g, '');
  if (KARAT_PURITY[normalized]) return KARAT_PURITY[normalized];

  const match = normalized.match(/^(\d{1,2})K$/);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0 || value > 24) return null;
  return (value / 24) * 0.999;
}

export function calculateGoldValue({
  goldWeightGrams,
  weightGrams,
  material,
  rate24kPerGram,
}) {
  const weight = Number(goldWeightGrams ?? weightGrams);
  const rate = Number(rate24kPerGram);

  if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(rate) || rate <= 0) {
    return null;
  }

  const karat = parseGoldKarat(material);
  const purity = getKaratPurity(karat);
  if (!karat || purity == null) return null;

  const ratePerGram = rate * purity;
  const goldValue = weight * ratePerGram;

  return {
    karat,
    purity,
    goldWeightGrams: weight,
    rate24kPerGram: Math.round(rate),
    ratePerGram: Math.round(ratePerGram),
    goldValue: Math.round(goldValue),
  };
}

export function calculateGoldProductPrice({
  goldWeightGrams,
  weightGrams,
  material,
  rate24kPerGram,
  fixedNonGoldPriceInr = 0,
}) {
  const gold = calculateGoldValue({
    goldWeightGrams,
    weightGrams,
    material,
    rate24kPerGram,
  });
  if (!gold) return null;

  const fixedNonGold = Math.max(0, Math.round(Number(fixedNonGoldPriceInr) || 0));
  return {
    ...gold,
    fixedNonGoldPriceInr: fixedNonGold,
    priceInr: gold.goldValue + fixedNonGold,
  };
}

export function inferFixedNonGoldPrice({
  sellingPriceInr,
  goldWeightGrams,
  material,
  rate24kPerGram,
}) {
  const gold = calculateGoldValue({
    goldWeightGrams,
    material,
    rate24kPerGram,
  });
  if (!gold) return null;

  const sellingPrice = Math.round(Number(sellingPriceInr));
  if (!Number.isFinite(sellingPrice) || sellingPrice < gold.goldValue) {
    return {
      ...gold,
      sellingPriceInr: sellingPrice,
      fixedNonGoldPriceInr: null,
      valid: false,
    };
  }

  return {
    ...gold,
    sellingPriceInr: sellingPrice,
    fixedNonGoldPriceInr: sellingPrice - gold.goldValue,
    valid: true,
  };
}

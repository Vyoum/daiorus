import { calculateGoldValue } from './gold-pricing-calc';
import { parseGoldKarat } from './product-material';

const DEFAULT_TAX_PCT = 3;

function roundInr(value) {
  const n = Math.round(Number(value) || 0);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

/**
 * Build Capstone-style price breakup lines.
 * Grand total = selling price (priceInr). Tax is treated as inclusive of that total
 * (tax portion = price × pct / (100 + pct)), matching 3% jewellery GST style.
 */
export function buildPriceBreakup(product = {}) {
  const grandTotal = roundInr(product.price ?? product.priceInr);
  const taxPctRaw = Number(product.taxPct);
  const taxPct =
    Number.isFinite(taxPctRaw) && taxPctRaw >= 0 ? taxPctRaw : DEFAULT_TAX_PCT;
  const makingCharge = roundInr(product.makingChargeInr);

  const rate24k = Number(
    product.goldRate24kAtPricingInr ?? product.rate24kPerGram ?? 0,
  );
  const gold = calculateGoldValue({
    goldWeightGrams: product.goldWeightGrams,
    weightGrams: product.weightGrams,
    material: product.material,
    rate24kPerGram: rate24k,
  });

  const goldValue = gold?.goldValue ?? 0;
  const karat = gold?.karat || parseGoldKarat(product.material);
  const ratePerGram = gold?.ratePerGram ?? null;

  // Tax portion inside the selling price (inclusive).
  const taxAmount =
    taxPct > 0 && grandTotal > 0
      ? Math.round((grandTotal * taxPct) / (100 + taxPct))
      : 0;
  const netOfTax = Math.max(0, grandTotal - taxAmount);

  let other = Math.max(0, netOfTax - goldValue - makingCharge);
  // If components exceed net (e.g. making entered high), keep lines honest and
  // let grand total stay authoritative — clamp other at 0.
  if (goldValue + makingCharge > netOfTax) {
    other = 0;
  }

  const lines = [];

  if (goldValue > 0) {
    const weightLabel =
      gold?.goldWeightGrams != null ? `${gold.goldWeightGrams}g` : null;
    const rateLabel =
      ratePerGram != null
        ? `₹${ratePerGram.toLocaleString('en-IN')} / g`
        : null;
    const parts = [
      karat ? `${karat} Gold` : 'Gold',
      weightLabel,
      rateLabel,
    ].filter(Boolean);

    lines.push({
      key: 'gold',
      label: parts.join(' · '),
      amount: goldValue,
    });
  }

  if (makingCharge > 0) {
    lines.push({
      key: 'making',
      label: 'Making Charge',
      amount: makingCharge,
    });
  }

  if (other > 0) {
    const hasDiamonds =
      product.diamondCount != null && Number(product.diamondCount) > 0;
    lines.push({
      key: 'other',
      label: hasDiamonds ? 'Stones & other charges' : 'Other charges',
      amount: other,
    });
  }

  // If nothing but tax would show, surface the pre-tax product value.
  if (!lines.length && netOfTax > 0) {
    lines.push({
      key: 'product',
      label: 'Product value',
      amount: netOfTax,
    });
  }

  if (taxAmount > 0 || taxPct > 0) {
    lines.push({
      key: 'tax',
      label: `TAX (${taxPct}%)`,
      amount: taxAmount,
    });
  }

  return {
    lines,
    taxPct,
    taxAmount,
    makingCharge,
    goldValue,
    grandTotal,
    hasBreakup: lines.length > 0 && grandTotal > 0,
  };
}

import { getKaratPurity } from './gold-pricing-calc';
import { KARAT_PURITY } from './gold-pricing-defaults';
import { parseGoldKarat } from './product-material';

const DEFAULT_TAX_PCT = 3;

function roundInr(value) {
  const n = Math.round(Number(value) || 0);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

/**
 * Build Capstone-style price breakup lines.
 * Gold line = net gold weight × karat rate (derived from 24K rate × purity).
 * Grand total = selling price (priceInr). Tax is treated as inclusive of that total.
 */
export function buildPriceBreakup(product = {}) {
  const grandTotal = roundInr(product.price ?? product.priceInr);
  const taxPctRaw = Number(product.taxPct);
  const taxPct =
    Number.isFinite(taxPctRaw) && taxPctRaw >= 0 ? taxPctRaw : DEFAULT_TAX_PCT;
  const makingCharge = roundInr(product.makingChargeInr);

  // Prefer the rate the selling price was built on so the lines reconcile;
  // fall back to today's rate for products saved without a snapshot.
  const rate24k = Number(
    product.goldRate24kAtPricingInr ||
      product.rate24kPerGram ||
      product.currentRate24kPerGram ||
      0,
  );

  // Only net gold weight drives the gold cost — never total piece weight.
  const netWeightRaw = Number(product.goldWeightGrams);
  const netWeight =
    Number.isFinite(netWeightRaw) && netWeightRaw > 0 ? netWeightRaw : null;

  const karat = parseGoldKarat(product.material);
  // Fall back to the 24K rate so the gold line still shows when karat is unset.
  const purity = (karat ? getKaratPurity(karat) : null) ?? KARAT_PURITY['24K'];
  const ratePerGram = rate24k > 0 ? Math.round(rate24k * purity) : null;
  const goldValue =
    netWeight && ratePerGram ? Math.round(netWeight * ratePerGram) : 0;

  // Tax portion inside the selling price (inclusive).
  const taxAmount =
    taxPct > 0 && grandTotal > 0
      ? Math.round((grandTotal * taxPct) / (100 + taxPct))
      : 0;
  const netOfTax = Math.max(0, grandTotal - taxAmount);

  // Remainder reconciles the lines with the selling price. When the components
  // already exceed it, surface the gap as a discount instead of hiding it.
  const remainder = netOfTax - goldValue - makingCharge;
  const other = remainder > 0 ? remainder : 0;
  const adjustment = remainder < 0 ? remainder : 0;

  const lines = [];

  if (goldValue > 0 && ratePerGram != null) {
    // Capstone-style: "18K Gold ₹5,439 / g" with amount = net weight × karat rate
    const rateLabel = `₹${ratePerGram.toLocaleString('en-IN')} / g`;
    lines.push({
      key: 'gold',
      label: `${karat || '24K'} Gold ${rateLabel}`,
      detail: `Net weight ${netWeight} g × ${rateLabel}`,
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

  if (adjustment < 0) {
    lines.push({
      key: 'adjustment',
      label: 'Discount',
      amount: adjustment,
    });
  }

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
    ratePerGram,
    netWeight,
    grandTotal,
    hasBreakup: lines.length > 0 && grandTotal > 0,
  };
}

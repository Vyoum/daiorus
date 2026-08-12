import { getKaratPurity } from './gold-pricing-calc';
import { parseGoldKarat } from './product-material';

const DEFAULT_TAX_PCT = 3;

function roundInr(value) {
  const n = Math.round(Number(value) || 0);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function optionalPositive(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * BlueStone-style price breakup (Daiorus design language):
 *   Gold + Diamond + Stone + Making Charges + GST = Total
 *
 * Gold = net gold weight × karat rate (24K rate × karat purity).
 * GST = tax% of (Gold + Diamond + Stone + Making) — exclusive, then added.
 * Total prefers the product selling price when set; otherwise the computed sum.
 */
export function buildPriceBreakup(product = {}) {
  const sellingPrice = roundInr(product.price ?? product.priceInr);
  const taxPctRaw = Number(product.taxPct);
  const taxPct =
    Number.isFinite(taxPctRaw) && taxPctRaw >= 0 ? taxPctRaw : DEFAULT_TAX_PCT;

  const makingCharge = roundInr(product.makingChargeInr);
  const explicitDiscount = roundInr(product.discountInr);
  const diamondCost = roundInr(product.diamondCostInr);
  const stoneCost = roundInr(product.stoneCostInr);
  const diamondCarat = optionalPositive(product.diamondCarat);
  const diamondCount =
    product.diamondCount != null && Number(product.diamondCount) > 0
      ? Math.round(Number(product.diamondCount))
      : null;
  const stoneCarat = optionalPositive(product.stoneCarat);
  const stoneCount =
    product.stoneCount != null && Number(product.stoneCount) > 0
      ? Math.round(Number(product.stoneCount))
      : null;

  const rate24k = Number(
    product.goldRate24kAtPricingInr ||
      product.rate24kPerGram ||
      product.currentRate24kPerGram ||
      0,
  );

  const netWeight = optionalPositive(product.goldWeightGrams);
  const karat = parseGoldKarat(product.material);
  const purity = karat ? getKaratPurity(karat) : null;
  const ratePerGram =
    rate24k > 0 && purity != null ? Math.round(rate24k * purity) : null;
  const goldValue =
    netWeight && ratePerGram ? Math.round(netWeight * ratePerGram) : 0;
  const goldNeedsKarat = Boolean(netWeight) && !karat;

  const taxableBase = goldValue + diamondCost + stoneCost + makingCharge;
  const hasComponentBreakup = taxableBase > 0;

  // BlueStone: GST on (gold + diamond + stone + making), then total = sum + GST
  const gstFromComponents =
    hasComponentBreakup && taxPct > 0
      ? Math.round((taxableBase * taxPct) / 100)
      : 0;
  const computedTotal = taxableBase + gstFromComponents;

  // Inclusive GST fallback when only a selling price exists
  const gstInclusive =
    !hasComponentBreakup && sellingPrice > 0 && taxPct > 0
      ? Math.round((sellingPrice * taxPct) / (100 + taxPct))
      : 0;

  const taxAmount = hasComponentBreakup ? gstFromComponents : gstInclusive;
  const grandTotal = sellingPrice > 0 ? sellingPrice : computedTotal;

  const lines = [];

  if (goldValue > 0 && ratePerGram != null && karat) {
    const rateLabel = `₹${ratePerGram.toLocaleString('en-IN')} / g`;
    lines.push({
      key: 'gold',
      label: 'Gold',
      detail: `${karat} · ${netWeight} g · ${rateLabel}`,
      amount: goldValue,
    });
  } else if (goldNeedsKarat) {
    lines.push({
      key: 'gold-missing-karat',
      label: 'Gold',
      detail: `Net weight ${netWeight} g — set karat (e.g. 14K) to calculate`,
      amount: 0,
      muted: true,
    });
  }

  if (diamondCost > 0 || diamondCarat || diamondCount || product.diamondQuality || product.diamondType) {
    const diamondDetail = [
      diamondCarat != null ? `${diamondCarat} Ct` : null,
      diamondCount != null
        ? `${diamondCount} ${diamondCount === 1 ? 'diamond' : 'diamonds'}`
        : null,
      String(product.diamondType || '').trim() || null,
      String(product.diamondQuality || '').trim() || null,
    ]
      .filter(Boolean)
      .join(' · ');

    lines.push({
      key: 'diamond',
      label: 'Diamond',
      detail: diamondDetail || null,
      amount: diamondCost,
      muted: diamondCost <= 0,
    });
  }

  if (stoneCost > 0 || stoneCarat || stoneCount) {
    const stoneDetail = [
      stoneCarat != null ? `${stoneCarat} Ct` : null,
      stoneCount != null
        ? `${stoneCount} ${stoneCount === 1 ? 'stone' : 'stones'}`
        : null,
    ]
      .filter(Boolean)
      .join(' · ');

    lines.push({
      key: 'stone',
      label: 'Stone',
      detail: stoneDetail || null,
      amount: stoneCost,
      muted: stoneCost <= 0,
    });
  }

  if (makingCharge > 0) {
    lines.push({
      key: 'making',
      label: 'Making Charges',
      amount: makingCharge,
    });
  }

  if (taxAmount > 0 || taxPct > 0) {
    lines.push({
      key: 'gst',
      label: `GST (${taxPct}%)`,
      amount: taxAmount,
    });
  }

  // Reconcile selling price with component lines (other charges only).
  // Product discount is shown only when discountInr is set in admin.
  if (hasComponentBreakup && sellingPrice > 0) {
    const explained = taxableBase + taxAmount;
    const gap = sellingPrice - explained;
    const gstIndex = lines.findIndex((l) => l.key === 'gst');
    const insertAt = gstIndex >= 0 ? gstIndex : lines.length;

    if (explicitDiscount > 0) {
      lines.splice(insertAt, 0, {
        key: 'discount',
        label: 'Discount',
        amount: -explicitDiscount,
      });
    } else if (gap > 1) {
      lines.splice(insertAt, 0, {
        key: 'other',
        label: 'Other charges',
        amount: gap,
      });
    }
  }

  if (!lines.length && grandTotal > 0) {
    lines.push({
      key: 'product',
      label: 'Product value',
      amount: Math.max(0, grandTotal - taxAmount),
    });
    if (taxAmount > 0) {
      lines.push({
        key: 'gst',
        label: `GST (${taxPct}%)`,
        amount: taxAmount,
      });
    }
  }

  return {
    lines,
    taxPct,
    taxAmount,
    makingCharge,
    diamondCost,
    diamondCarat,
    diamondCount,
    stoneCost,
    stoneCarat,
    stoneCount,
    goldValue,
    ratePerGram,
    netWeight,
    karat,
    goldNeedsKarat,
    computedTotal,
    grandTotal,
    hasBreakup: lines.length > 0 && grandTotal > 0,
  };
}

/** Spec groups for BlueStone-style accordion panels on the PDP. */
export function buildProductSpecGroups(product = {}) {
  const sku = product.sku || product.inventorySku || null;
  const heightMm = optionalPositive(product.heightMm);
  const widthMm = optionalPositive(product.widthMm);
  const lengthMm = optionalPositive(product.lengthMm);
  const weightGrams = optionalPositive(product.weightGrams);
  const goldWeight = optionalPositive(product.goldWeightGrams);
  const karat = parseGoldKarat(product.material);
  const metalColor = String(product.metalColor || '').trim() || null;
  const diamondCarat = optionalPositive(product.diamondCarat);
  const diamondCount =
    product.diamondCount != null && Number(product.diamondCount) > 0
      ? Math.round(Number(product.diamondCount))
      : null;
  const diamondQuality = String(product.diamondQuality || '').trim() || null;
  const diamondType = String(product.diamondType || '').trim() || null;
  const stoneCarat = optionalPositive(product.stoneCarat);
  const stoneCount =
    product.stoneCount != null && Number(product.stoneCount) > 0
      ? Math.round(Number(product.stoneCount))
      : null;

  const formatMm = (n) => `${Number(n).toFixed(2).replace(/\.?0+$/, '')} mm`;
  const formatG = (n) => {
    const formatted =
      n % 1 === 0 ? String(n) : Number(n).toFixed(2).replace(/\.?0+$/, '');
    return `${formatted} gram`;
  };

  const productDetails = [];
  if (sku) productDetails.push({ label: 'Product Code', value: sku });
  if (heightMm) productDetails.push({ label: 'Height', value: formatMm(heightMm) });
  if (widthMm) productDetails.push({ label: 'Width', value: formatMm(widthMm) });
  if (lengthMm) productDetails.push({ label: 'Length', value: formatMm(lengthMm) });
  if (weightGrams) {
    productDetails.push({ label: 'Product Weight', value: formatG(weightGrams) });
  }

  const diamondDetails = [];
  if (diamondCarat) {
    diamondDetails.push({ label: 'Total Weight', value: `${diamondCarat} Ct` });
  }
  if (diamondCount) {
    diamondDetails.push({
      label: 'Total No. Of Diamonds',
      value: String(diamondCount),
    });
  }
  if (diamondQuality) {
    diamondDetails.push({ label: 'Quality', value: diamondQuality });
  }
  if (diamondType) {
    diamondDetails.push({ label: 'Type', value: diamondType });
  }

  const stoneDetails = [];
  if (stoneCarat) {
    stoneDetails.push({ label: 'Total Weight', value: `${stoneCarat} Ct` });
  }
  if (stoneCount) {
    stoneDetails.push({
      label: 'Total No. Of Stones',
      value: String(stoneCount),
    });
  }

  const metalDetails = [];
  if (karat || metalColor || product.material) {
    const type = [
      karat ? `${karat.replace(/K$/i, 'Kt')}` : null,
      metalColor,
      !karat && !metalColor ? product.material : null,
    ]
      .filter(Boolean)
      .join(' ');
    if (type) metalDetails.push({ label: 'Type', value: type });
  }
  if (goldWeight) {
    metalDetails.push({ label: 'Weight', value: formatG(goldWeight) });
  } else if (weightGrams && karat) {
    metalDetails.push({ label: 'Weight', value: formatG(weightGrams) });
  }

  return {
    productDetails,
    diamondDetails,
    stoneDetails,
    metalDetails,
    hasAny:
      productDetails.length > 0 ||
      diamondDetails.length > 0 ||
      stoneDetails.length > 0 ||
      metalDetails.length > 0,
  };
}

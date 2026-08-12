export function formatWeightGrams(grams) {
  if (grams == null || grams === '') return null;
  const value = Number(grams);
  if (!Number.isFinite(value) || value <= 0) return null;
  const formatted =
    value % 1 === 0 ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} g`;
}

export function normalizeProductSpecs(source = {}) {
  const weightRaw = source.weightGrams ?? source.weight ?? null;
  const weightGrams =
    weightRaw == null || weightRaw === ''
      ? null
      : Number.isFinite(Number(weightRaw))
        ? Number(weightRaw)
        : null;

  const diamondRaw = source.diamondCount ?? null;
  const diamondCount =
    diamondRaw == null || diamondRaw === ''
      ? null
      : Math.max(0, Math.round(Number(diamondRaw)) || 0) || null;

  const caratRaw = source.diamondCarat ?? null;
  const diamondCarat =
    caratRaw == null || caratRaw === ''
      ? null
      : Number.isFinite(Number(caratRaw)) && Number(caratRaw) > 0
        ? Number(caratRaw)
        : null;

  const stoneRaw = source.stoneCount ?? null;
  const stoneCount =
    stoneRaw == null || stoneRaw === ''
      ? null
      : Math.max(0, Math.round(Number(stoneRaw)) || 0) || null;

  const stoneCaratRaw = source.stoneCarat ?? null;
  const stoneCarat =
    stoneCaratRaw == null || stoneCaratRaw === ''
      ? null
      : Number.isFinite(Number(stoneCaratRaw)) && Number(stoneCaratRaw) > 0
        ? Number(stoneCaratRaw)
        : null;

  return {
    material: String(source.material || '').trim() || null,
    metalColor: String(source.metalColor || '').trim() || null,
    weightGrams,
    goldWeightGrams:
      source.goldWeightGrams == null || source.goldWeightGrams === ''
        ? null
        : Number.isFinite(Number(source.goldWeightGrams))
          ? Number(source.goldWeightGrams)
          : null,
    diamondCount,
    diamondCarat,
    stoneCount,
    stoneCarat,
    heightMm:
      source.heightMm == null || source.heightMm === ''
        ? null
        : Number.isFinite(Number(source.heightMm))
          ? Number(source.heightMm)
          : null,
    widthMm:
      source.widthMm == null || source.widthMm === ''
        ? null
        : Number.isFinite(Number(source.widthMm))
          ? Number(source.widthMm)
          : null,
    productInfo: String(source.productInfo || '').trim() || null,
  };
}

export function getProductSpecLines(source = {}) {
  const {
    material,
    metalColor,
    weightGrams,
    goldWeightGrams,
    diamondCount,
    diamondCarat,
    stoneCount,
    stoneCarat,
    heightMm,
    widthMm,
    productInfo,
  } = normalizeProductSpecs(source);
  const lines = [];

  if (material || metalColor) {
    lines.push({
      label: 'Material',
      value: [material, metalColor].filter(Boolean).join(' · '),
    });
  }

  const weight = formatWeightGrams(weightGrams);
  if (weight) lines.push({ label: 'Weight', value: weight });

  const goldWeight = formatWeightGrams(goldWeightGrams);
  if (goldWeight) lines.push({ label: 'Net gold', value: goldWeight });

  if (heightMm) lines.push({ label: 'Height', value: `${heightMm} mm` });
  if (widthMm) lines.push({ label: 'Width', value: `${widthMm} mm` });

  if (diamondCarat) lines.push({ label: 'Diamond weight', value: `${diamondCarat} Ct` });

  if (diamondCount != null && diamondCount > 0) {
    lines.push({
      label: 'Diamonds',
      value: `${diamondCount} ${diamondCount === 1 ? 'diamond' : 'diamonds'}`,
    });
  }

  if (stoneCarat) lines.push({ label: 'Stone weight', value: `${stoneCarat} Ct` });

  if (stoneCount != null && stoneCount > 0) {
    lines.push({
      label: 'Stones',
      value: `${stoneCount} ${stoneCount === 1 ? 'stone' : 'stones'}`,
    });
  }

  if (productInfo) lines.push({ label: 'Product info', value: productInfo });

  return lines;
}

export function cartItemFromProduct(product) {
  const specs = normalizeProductSpecs(product);
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    slug: product.slug || null,
    qty: 1,
    ...specs,
  };
}

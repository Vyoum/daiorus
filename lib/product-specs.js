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

  return {
    material: String(source.material || '').trim() || null,
    weightGrams,
    diamondCount,
    productInfo: String(source.productInfo || '').trim() || null,
  };
}

export function getProductSpecLines(source = {}) {
  const { material, weightGrams, diamondCount, productInfo } =
    normalizeProductSpecs(source);
  const lines = [];

  if (material) lines.push({ label: 'Material', value: material });

  const weight = formatWeightGrams(weightGrams);
  if (weight) lines.push({ label: 'Weight', value: weight });

  if (diamondCount != null && diamondCount > 0) {
    lines.push({
      label: 'Diamonds',
      value: `${diamondCount} ${diamondCount === 1 ? 'diamond' : 'diamonds'}`,
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

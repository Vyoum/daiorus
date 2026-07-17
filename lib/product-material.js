/** Gold karat presets — keep in sync with admin product form. */
export const GOLD_KARAT_OPTIONS = ['14K', '18K', '20K', '22K', '24K'];

const KARAT_RANK = Object.fromEntries(GOLD_KARAT_OPTIONS.map((k, i) => [k, i]));

/**
 * Extract karat from the product material string set in admin (e.g. "18K", "18K Gold", "14K Gold + Pearl").
 */
export function parseGoldKarat(material = '') {
  const text = String(material || '').trim();
  if (!text) return null;

  const match = text.match(/(\d{1,2})\s*[Kk]\b/);
  if (!match) return null;

  const karat = `${match[1]}K`;
  return karat;
}

export function sortGoldKarats(karats = []) {
  return [...new Set(karats)].sort((a, b) => {
    const ar = KARAT_RANK[a] ?? 99;
    const br = KARAT_RANK[b] ?? 99;
    if (ar !== br) return ar - br;
    return a.localeCompare(b);
  });
}

export function collectGoldKaratsFromProducts(products = []) {
  const found = new Set();
  for (const product of products) {
    const karat = parseGoldKarat(product?.material);
    if (karat) found.add(karat);
  }
  return sortGoldKarats([...found]);
}

export function materialMatchesGoldKaratFilter(material, selectedKarats = []) {
  if (!selectedKarats.length) return true;
  const karat = parseGoldKarat(material);
  if (!karat) return false;
  return selectedKarats.includes(karat);
}

/** Default WebP/JPEG quality for Next.js image optimization. */
export const IMAGE_QUALITY = 85;

export const IMAGE_SIZES = {
  hero: '100vw',
  productCard: '(max-width: 768px) 50vw, 25vw',
  productDetail: '(max-width: 768px) 100vw, 50vw',
  productThumb: '72px',
  collection: '(max-width: 768px) 50vw, 33vw',
  category: '220px',
  categoryHero: '100vw',
  editorial: '(max-width: 960px) 100vw, 50vw',
  instagram: '(max-width: 768px) 50vw, 20vw',
  cartThumb: '80px',
};

export function isOptimizableImageSrc(src) {
  if (!src || typeof src !== 'string') return false;
  if (src.startsWith('/')) return true;
  if (src.startsWith('blob:') || src.startsWith('data:')) return false;

  try {
    const { hostname, protocol } = new URL(src);
    return protocol === 'https:' && hostname.endsWith('supabase.co');
  } catch {
    return false;
  }
}

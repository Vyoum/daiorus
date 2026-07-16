export const CONTENT_KEYS = {
  ANNOUNCE: 'announce_banner',
  HERO: 'home_hero',
  SIGNATURE: 'home_signature',
  CURATED_SELECTS: 'home_curated_selects',
};

export const DEFAULT_ANNOUNCE = {
  prefix: 'Free shipping on all orders across India · ',
  linkText: 'New Collection: Worn With Grace',
  linkUrl: '/shop',
  suffix: ' · BIS Hallmarked Gold',
};

export const DEFAULT_HERO = {
  imageUrl: '/images/ui1/hero-home.jpg',
  /** Extra homepage hero carousel slides (first slide mirrors imageUrl). */
  images: ['/images/ui1/hero-home.jpg'],
  imageAlt: 'Model wearing DAIORUS jewellery',
  eyebrow: 'New Collection · 2024',
  titleLine1: 'Worn',
  titleLine2: 'With Grace',
  body: 'Fine jewellery crafted for every day. Timeless elegance designed to move with you — BIS hallmarked gold, finished by hand in India.',
  ctaLabel: 'Shop Collection',
  ctaUrl: '/shop',
};

export const MAX_HERO_CAROUSEL_IMAGES = 8;

export const DEFAULT_SIGNATURE = {
  label: 'Featured Collection',
  title: 'Evil Eye Collection',
  body: 'A symbol of protection, reimagined in 14K gold, made to guard your energy and elevate your glow.',
  ctaLabel: 'Shop Evil Eye',
  ctaUrl: '/shop',
  imageUrl1:
    'https://mcumqgfanxkyewanapgx.supabase.co/storage/v1/object/public/product-images/products/b-01-0-1784041955394.jpg',
  imageUrl2:
    'https://mcumqgfanxkyewanapgx.supabase.co/storage/v1/object/public/product-images/products/e-09-0-1784041899243.jpg',
  imageAlt1: 'Evil Eye protection bracelet',
  imageAlt2: 'Evil Eye earrings',
};

export const DEFAULT_CURATED_SELECTS = {
  /** Product IDs to feature on the homepage "Curated Selects" block. */
  productIds: [],
};

/** Common landing assets for quick-pick in the media library. */
export const MEDIA_PRESETS = [
  '/images/ui1/hero-home.jpg',
  '/images/ui1/hero-earrings.jpg',
  '/images/ui1/brand-story.jpg',
  '/images/ui1/vermeil-1.jpg',
  '/images/ui1/vermeil-2.jpg',
  '/images/ui1/cat-pendants.jpg',
  '/images/ui1/cat-bracelets.jpg',
  '/images/ui1/cat-second.jpg',
  '/images/ui1/prod-eclipse.jpg',
  '/images/ui1/prod-pearl.jpg',
  '/images/ui1/prod-cascade.jpg',
  '/images/ui1/prod-coin.jpg',
];

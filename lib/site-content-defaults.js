export const CONTENT_KEYS = {
  ANNOUNCE: 'announce_banner',
  HERO: 'home_hero',
  SIGNATURE: 'home_signature',
  CURATED_SELECTS: 'home_curated_selects',
  SOCIAL: 'home_social',
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

export const MAX_SOCIAL_ITEMS = 6;

export const DEFAULT_SOCIAL = {
  label: 'Social',
  titlePrefix: 'Follow Us',
  handle: '@daiorus',
  profileUrl: 'https://www.instagram.com/daiorus?igsh=NjFzNHJlNDhvZDEw',
  items: [
    { type: 'image', url: '/images/ui1/ig-1.jpg', alt: 'Instagram look 1', href: '' },
    { type: 'image', url: '/images/ui1/ig-2.jpg', alt: 'Instagram look 2', href: '' },
    { type: 'image', url: '/images/ui1/ig-3.jpg', alt: 'Instagram look 3', href: '' },
    { type: 'image', url: '/images/ui1/ig-4.jpg', alt: 'Instagram look 4', href: '' },
    { type: 'image', url: '/images/ui1/ig-5.jpg', alt: 'Instagram look 5', href: '' },
    { type: 'image', url: '/images/ui1/ig-6.jpg', alt: 'Instagram look 6', href: '' },
  ],
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
  '/images/ui1/ig-1.jpg',
  '/images/ui1/ig-2.jpg',
  '/images/ui1/ig-3.jpg',
  '/images/ui1/ig-4.jpg',
  '/images/ui1/ig-5.jpg',
  '/images/ui1/ig-6.jpg',
];

export const CONTENT_KEYS = {
  ANNOUNCE: 'announce_banner',
  HERO: 'home_hero',
  SIGNATURE: 'home_signature',
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
  label: 'Signature Line',
  title: 'Gold Vermeil Collection',
  body: 'A thick layer of 18K gold over sterling silver — the weight, feel, and radiance of solid gold at a price you can reach for every day.',
  ctaLabel: 'Shop Gold Vermeil',
  ctaUrl: '/shop',
  imageUrl1: '/images/ui1/vermeil-1.jpg',
  imageUrl2: '/images/ui1/vermeil-2.jpg',
  imageAlt1: 'Gold vermeil detail',
  imageAlt2: 'Gold vermeil necklace',
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

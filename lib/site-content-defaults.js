export const CONTENT_KEYS = {
  ANNOUNCE: 'announce_banner',
  HERO: 'home_hero',
  SIGNATURE: 'home_signature',
  CURATED_SELECTS: 'home_curated_selects',
  PHILOSOPHY: 'home_philosophy',
  PROCESS: 'about_process',
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

export const DEFAULT_PHILOSOPHY = {
  label: 'Our Philosophy',
  title: 'Crafted With Intention',
  body: 'Every Daiorus piece is designed to be worn every day — BIS hallmarked gold, finished by master goldsmiths in India. Beauty that doesn\'t wait for special occasions.',
  ctaLabel: 'Read Our Story',
  ctaUrl: '/about',
  imageUrl: '/images/ui1/brand-story.jpg',
  imageAlt: 'Daiorus craftsmanship',
};

export const DEFAULT_PROCESS = {
  label: 'The Process',
  titleLine1: 'BIS Hallmarked.',
  titleLine2: 'Made for Keeps.',
  body1:
    'Every Daiorus piece carries a Bureau of Indian Standards hallmark — the gold standard for gold purity in India. Our 18K gold meets BIS 916 certification, and our 14K gold meets BIS 585.',
  body2:
    'We work with a small network of master goldsmiths in Jaipur and Mumbai who have been crafting fine jewellery for generations. No factories. No shortcuts.',
  stats: [
    { label: '18K Gold', value: 'BIS 916' },
    { label: '14K Gold', value: 'BIS 585' },
    { label: 'Silver', value: '925 Sterling' },
  ],
  imageUrl1: '/images/ui1/prod-eclipse.jpg',
  imageUrl2: '/images/ui1/prod-coin.jpg',
  imageUrl3: '/images/ui1/coll-fine-gold.jpg',
  imageAlt1: 'Gold earring detail',
  imageAlt2: 'Pendant detail',
  imageAlt3: 'Fine gold craftsmanship',
};

export const MAX_SOCIAL_ITEMS = 6;

export const DEFAULT_SOCIAL = {
  label: 'Social',
  titlePrefix: 'Follow Us',
  items: [
    { url: '/images/ui1/ig-1.jpg', type: 'image', alt: 'Instagram look 1' },
    { url: '/images/ui1/ig-2.jpg', type: 'image', alt: 'Instagram look 2' },
    { url: '/images/ui1/ig-3.jpg', type: 'image', alt: 'Instagram look 3' },
    { url: '/images/ui1/ig-4.jpg', type: 'image', alt: 'Instagram look 4' },
    { url: '/images/ui1/ig-5.jpg', type: 'image', alt: 'Instagram look 5' },
    { url: '/images/ui1/ig-6.jpg', type: 'image', alt: 'Instagram look 6' },
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
  '/images/ui1/coll-fine-gold.jpg',
  '/images/ui1/ig-1.jpg',
  '/images/ui1/ig-2.jpg',
  '/images/ui1/ig-3.jpg',
  '/images/ui1/ig-4.jpg',
  '/images/ui1/ig-5.jpg',
  '/images/ui1/ig-6.jpg',
];

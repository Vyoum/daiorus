export const CATEGORIES = [
  {
    slug: 'earrings',
    name: 'Earrings',
    href: '/category/earrings',
    image: '/images/ui1/cat-earrings.jpg',
    intro:
      'From everyday studs to statement hoops — designed for the woman who believes in daily beauty rituals.',
    heroImage: '/images/ui1/hero-earrings.jpg',
  },
  {
    slug: 'pendants',
    name: 'Pendants',
    href: '/category/pendants',
    image: '/images/ui1/cat-pendants.jpg',
    intro:
      'Fine chains and considered pendants. Wear one, layer many — our necklaces move with you.',
    heroImage: '/images/ui1/cat-pendants.jpg',
  },
  {
    slug: 'bracelets',
    name: 'Bracelets',
    href: '/category/bracelets',
    image: '/images/ui1/cat-bracelets.jpg',
    intro:
      'From the lightest chain to the finest tennis bracelet, jewellery you reach for every day.',
    heroImage: '/images/ui1/cat-bracelets.jpg',
  },
  {
    slug: 'second-piercing',
    name: 'Second Piercing',
    href: '/category/second-piercing',
    image: '/images/ui1/cat-second.jpg',
    intro:
      'Designed specifically for second, third, and cartilage piercings — everything you need.',
    heroImage: '/images/ui1/cat-second.jpg',
  },
];

export const PRODUCTS = {
  earrings: [
    {
      id: 'e1',
      name: 'Luna Stud Earrings',
      material: '18K Gold',
      price: 4800,
      image: '/images/ui1/prod-luna.jpg',
      tag: null,
    },
    {
      id: 'e2',
      name: 'Eclipse Hoops',
      material: '14K Gold',
      price: 6400,
      image: '/images/ui1/prod-eclipse2.jpg',
      tag: null,
    },
    {
      id: 'e3',
      name: 'Pearl Drop Earrings',
      material: '18K Gold + Pearl',
      price: 7800,
      image: '/images/ui1/prod-pearl2.jpg',
      tag: null,
    },
    {
      id: 'e4',
      name: 'Celestial Bar Drops',
      material: 'Gold Vermeil',
      price: 5200,
      image: '/images/ui1/prod-celestial.jpg',
      tag: null,
    },
  ],
  pendants: [
    {
      id: 'p1',
      name: 'Cascade Pendant',
      material: 'Gold Vermeil',
      price: 12500,
      image: '/images/ui1/prod-cascade.jpg',
      tag: 'New',
    },
    {
      id: 'p2',
      name: 'Soleil Star Pendant',
      material: 'Gold Vermeil',
      price: 8900,
      image: '/images/ui1/prod-coin.jpg',
      tag: 'Sale',
    },
    {
      id: 'p3',
      name: 'Coin Pendant Necklace',
      material: '18K Gold',
      price: 11200,
      image: '/images/ui1/prod-coin.jpg',
      tag: null,
    },
    {
      id: 'p4',
      name: 'Pearl Cascade',
      material: '18K Gold + Pearl',
      price: 9800,
      image: '/images/ui1/prod-pearl.jpg',
      tag: null,
    },
  ],
  bracelets: [
    {
      id: 'b1',
      name: 'Infinity Bracelet',
      material: '18K Rose Gold',
      price: 8200,
      image: '/images/ui1/coll-everyday.jpg',
      tag: null,
    },
    {
      id: 'b2',
      name: 'Tennis Bracelet',
      material: '18K Gold + Diamond',
      price: 24900,
      image: '/images/ui1/coll-fine-gold.jpg',
      tag: 'Best Seller',
    },
    {
      id: 'b3',
      name: 'Chain Bracelet',
      material: '14K Gold',
      price: 6500,
      image: '/images/ui1/cat-bracelets.jpg',
      tag: null,
    },
    {
      id: 'b4',
      name: 'Pearl Link',
      material: 'Gold Vermeil',
      price: 5400,
      image: '/images/ui1/prod-pearl.jpg',
      tag: null,
    },
  ],
  'second-piercing': [
    {
      id: 's1',
      name: 'Mini Huggie Hoops',
      material: '14K Gold',
      price: 3800,
      image: '/images/ui1/prod-eclipse.jpg',
      tag: null,
    },
    {
      id: 's2',
      name: 'Flat Back Stud Set',
      material: '18K Gold',
      price: 4200,
      image: '/images/ui1/cat-second.jpg',
      tag: 'New',
    },
    {
      id: 's3',
      name: 'Cartilage Ring',
      material: '14K Gold',
      price: 3200,
      image: '/images/ui1/prod-coin.jpg',
      tag: null,
    },
    {
      id: 's4',
      name: 'Tiny Pearl Stud',
      material: '18K Gold + Pearl',
      price: 2900,
      image: '/images/ui1/prod-pearl.jpg',
      tag: null,
    },
  ],
};

export const BEST_SELLERS = [
  {
    id: 'bs1',
    name: 'Eclipse Hoops',
    price: 6400,
    tag: 'Best Seller',
    image: '/images/ui1/prod-eclipse.jpg',
  },
  {
    id: 'bs2',
    name: 'Pearl Drop Earrings',
    price: 7800,
    tag: 'New',
    image: '/images/ui1/prod-pearl.jpg',
  },
  {
    id: 'bs3',
    name: 'Cascade Pendant',
    price: 12500,
    tag: 'New',
    image: '/images/ui1/prod-cascade.jpg',
  },
  {
    id: 'bs4',
    name: 'Coin Pendant Necklace',
    price: 11200,
    tag: null,
    image: '/images/ui1/prod-coin.jpg',
  },
];

export const COLLECTIONS = [
  {
    name: 'The Everyday Edit',
    desc: 'Modern classics designed to be layered and worn every day.',
    href: '/shop',
    image: '/images/ui1/coll-everyday.jpg',
  },
  {
    name: 'Gold Vermeil',
    desc: 'Signature vermeil — the weight and radiance of gold.',
    href: '/shop',
    image: '/images/ui1/coll-vermeil.jpg',
  },
  {
    name: 'Fine 18K Gold',
    desc: 'Solid gold heirlooms, crafted to last a lifetime.',
    href: '/shop',
    image: '/images/ui1/coll-fine-gold.jpg',
  },
];

export const LEGAL_PAGES = {
  shipping: {
    title: 'Shipping Policy',
    sections: [
      {
        heading: 'Delivery Across India',
        body: 'We ship to all pin codes across India via trusted courier partners. Orders above ₹2,000 receive free standard shipping. Orders below ₹2,000 incur a flat shipping fee of ₹99.',
      },
      {
        heading: 'Processing Time',
        body: 'Orders are processed within 1–2 business days. Custom or made-to-order pieces may take 7–14 business days. You will receive tracking details once your order ships.',
      },
      {
        heading: 'Delivery Timeline',
        body: 'Metro cities typically receive orders in 2–4 business days. Other locations may take 4–7 business days depending on courier availability.',
      },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    sections: [
      {
        heading: '30-Day Returns',
        body: 'We offer hassle-free returns within 30 days of delivery. Jewellery must be unworn, in original packaging, and accompanied by the authenticity card and invoice.',
      },
      {
        heading: 'Exchanges',
        body: 'Size or style exchanges are welcome within 30 days, subject to availability. Contact us at hello@daiorus.com to initiate an exchange.',
      },
      {
        heading: 'Non-Returnable Items',
        body: 'Custom-engraved pieces, piercings packs that have been opened, and final-sale items cannot be returned for hygiene and safety reasons.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'We collect information you provide when placing an order, creating an account, or subscribing to our newsletter — including name, email, shipping address, and payment details processed securely by our payment partners.',
      },
      {
        heading: 'How We Use It',
        body: 'Your data is used to fulfil orders, send shipping updates, improve our site, and share studio news if you opt in. We never sell your personal information.',
      },
      {
        heading: 'Contact',
        body: 'For privacy-related requests, email privacy@daiorus.com. We will respond within a reasonable timeframe.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      {
        heading: 'Use of Site',
        body: 'By accessing daiorus.com, you agree to use the site for lawful purposes only and not to interfere with its operation or security.',
      },
      {
        heading: 'Pricing & Availability',
        body: 'All prices are in Indian Rupees (₹) and inclusive of applicable taxes unless stated otherwise. We reserve the right to update pricing and product availability without prior notice.',
      },
      {
        heading: 'Intellectual Property',
        body: 'All content, imagery, and brand marks on this site are the property of Daiorus and may not be reproduced without written permission.',
      },
    ],
  },
  payment: {
    title: 'Payment Information',
    sections: [
      {
        heading: 'Accepted Methods',
        body: 'We accept major credit and debit cards, UPI, net banking, and select wallets through our secure payment gateway. All transactions are encrypted.',
      },
      {
        heading: 'Currency',
        body: 'All prices are displayed and charged in Indian Rupees (INR). International cards may incur bank conversion fees.',
      },
      {
        heading: 'Security',
        body: 'Daiorus does not store full card details on our servers. Payment processing is handled by PCI-DSS compliant partners.',
      },
    ],
  },
};

export function formatINR(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function getAllProducts() {
  return Object.entries(PRODUCTS).flatMap(([category, items]) =>
    items.map((item) => ({ ...item, category }))
  );
}

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

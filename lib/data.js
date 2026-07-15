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
    name: 'Piercings',
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
    name: 'Evil Eye Bracelet',
    desc: 'A protective everyday bracelet finished in signature Daiorus detail.',
    href: '/product/evil-eye-protection-bracelet',
    image:
      'https://mcumqgfanxkyewanapgx.supabase.co/storage/v1/object/public/product-images/products/b-01-0-1784041955394.jpg',
  },
  {
    name: 'Ruby Heart Necklace',
    desc: 'A pink heart ruby pendant made to wear close and keep close.',
    href: '/product/pink-heart-ruby-necklace',
    image:
      'https://mcumqgfanxkyewanapgx.supabase.co/storage/v1/object/public/product-images/products/n-01-0-1784041993923.jpg',
  },
  {
    name: 'Hamsa Earrings',
    desc: 'Graceful hamsa studs with a quiet statement in gold.',
    href: '/product/hamsa-earrings',
    image:
      'https://mcumqgfanxkyewanapgx.supabase.co/storage/v1/object/public/product-images/products/e-08-0-1784041888779.jpg',
  },
];

export const LEGAL_PAGES = {
  shipping: {
    title: 'Shipping Policy',
    sections: [
      {
        heading: 'Domestic Shipping (India)',
        body: 'At Daiorus, we’re excited to offer free shipping on all orders, anywhere in India. We want your shopping experience with us to be as smooth and delightful as possible. Here are a few details about our shipping process:',
      },
      {
        heading: '1. Free Shipping',
        body: 'Yes, you heard it right! We offer free standard shipping on all orders across India. No minimum purchase required.',
      },
      {
        heading: '2. Order Processing',
        body: 'We aim to dispatch orders within 4 business days for items that are in stock.',
      },
      {
        heading: '3. Shipping Methods',
        body: 'We use various courier services to ensure the best possible delivery time. This allows us to get your order to you quickly and reliably.',
      },
      {
        heading: '4. Tracking',
        body: 'Once your order is shipped, you will receive a notification from us or our courier partner, which may be through email, SMS, or WhatsApp. This notification will include a tracking number so you can keep an eye on your package until it reaches you.',
      },
      {
        heading: '5. Returns and Exchanges Pickup',
        body: 'If you wish to return or exchange a product, you must first initiate a request. To do this:',
        items: [
          'Log in to your account on our website with your registered email address.',
          'Select the order containing the item you want to return or exchange.',
          'Click “RETURN/EXCHANGE” and choose a valid reason for your request.',
          'Submit the request, and our team will review it and guide you through the next steps.',
        ],
        after: [
          'Once your return or exchange is approved, we will arrange the pickup. Our courier partners will contact you to schedule a convenient time. Please ensure that the product is ready for collection with the box it was shipped in and the invoice.',
          'For details on when returns and exchanges are applicable, please refer to our Returns and Refund Policy.',
        ],
      },
      {
        heading: '6. Damage/Loss in Transit',
        body: 'In the rare event that your order is damaged or lost during transit, please contact us immediately. We take such matters very seriously and will promptly address any issues, which might include sending a replacement item or issuing a refund.',
      },
      {
        heading: '7. Delays',
        body: 'While we always aim to meet our delivery times, occasionally, there might be some delays due to unforeseen circumstances with our courier partners. Rest assured, in such cases, we will proactively reach out to you, inform you of the issue, and work on the best possible solution, including offering other options such as a refund if the issue is not resolved in a timely manner. We appreciate your understanding and patience in such situations. Your satisfaction is our utmost priority.',
      },
    ],
  },
  returns: {
    title: 'Return & Exchange Policy',
    sections: [
      {
        heading: 'What’s your standard return policy?',
        body: 'We offer 7-day returns and exchanges for customers across India, starting from the day the shipment is delivered. Shipping and return fees apply.',
      },
      {
        heading: 'How do I pack the return correctly?',
        body: [
          'Items must be in new, unworn condition and returned in the original blue Daiorus box, sealed with tape, and placed inside Daiorus’s sealed polythene bag, along with the invoice.',
          'Returns sent without the Daiorus box or in loose/unsealed packaging will not be accepted.',
          'If your order included any free gifts, they must also be returned.',
          'Items that do not meet these conditions will not be eligible for return or exchange.',
          'Please record a video of the entire process—showing the parcel contents, packing the parcel, and handing it over to our delivery partner.',
          'If this video is not recorded, Daiorus will not be liable for any claims related to missing items, tampering, or pilferage in return or exchange parcels.',
        ],
        after: [
          'Return Shipping Fee: ₹150 (This charge does not apply to exchanges).',
          'Please note: If your location falls under an unserviceable zone, you can ship the product to us, and we’ll waive the ₹150 deduction to make the process easier for you.',
        ],
      },
      {
        heading: 'What items can I not return or exchange?',
        items: [
          'Items that have been altered, resized, or personalised',
          'Items purchased during sale events (eligible for exchange only)',
          'Nose pins (for hygiene reasons)',
          'Rakhis',
        ],
      },
      {
        heading: 'How do I return or exchange my purchase?',
        body: [
          'You can request a return or exchange within 7 days of receiving your order. After 7 days, returns are not accepted, but the following are:',
          'Exchanges can be made as per the policy below.',
          'In exchange for products, we provide a store credit / Daiorus coupon of the same amount you paid at the time of purchase.',
          'Please note: Exchanges are done on the amount you paid and not on the current Gold rate.',
          'Please note: Exchange orders will not be treated as new orders. Therefore, refunds, exchanges, or returns will not be applicable on exchange orders.',
          'Products purchased using store credits or a Daiorus coupon are NOT eligible for the 7-day exchange or return window. Service support is only applicable in cases of fading.',
          'Please note that the 6-month breakage policy is ONLY applicable to chains.',
        ],
      },
      {
        heading: 'What’s not covered under lifetime exchanges?',
        items: [
          'Pearls, locks/closures, stones falling off, or polish appearing different (e.g., an unusual yellow tone)',
          'Breakage caused by unlinking or damage to the TS logo',
          'Any product that appears intentionally tampered with',
        ],
        after: [
          'For more details, please refer to our Lifetime Warranty section.',
          'However, this can usually be fixed at a minimal repair cost of INR 650. For rings and bangles, please note that the minimum repair cost is INR 1,250.',
        ],
      },
      {
        heading: 'What if the product I ordered/exchanged is out of stock?',
        body: [
          'If the same item is out of stock, you will receive a coupon code for the order value paid at the time of purchase.',
          'Exchanges are strictly based on the order value (amount paid during purchase) and not on the weight (gms) of the jewellery.',
        ],
      },
      {
        heading: 'What if I mistakenly return a non-Daiorus item?',
        body: 'We want to keep everything smooth for you, but please note that we won’t be able to ship the item back and cannot take responsibility for it. We appreciate your understanding.',
      },
      {
        heading: 'What is the timeline for the return or exchange process?',
        body: 'The entire process usually takes 15–17 days:',
        ordered: [
          '2 days – Request review & approval (Day 1–2)',
          '+4 days – Product pickup by courier (Day 3–6)',
          '+6 days – Product reaches us (Day 7–12)',
          '+5 days – Refund initiated or exchange shipped (Day 13–17)',
        ],
        after:
          'We try to move faster whenever possible, but timelines may vary slightly due to courier delays.',
      },
      {
        heading: 'What are your customer support timings?',
        body: [
          'If you have any questions or concerns about your return, exchange, or refund, our customer support team is here to help!',
          'We’re available Monday to Friday, from 10:30 AM to 5:30 PM.',
        ],
      },
      {
        heading: 'What should I do if I receive a damaged or tampered package?',
        body: [
          'If your order arrives damaged, defective, or tampered with, please do not accept the package. Hand it back to the delivery person for RTO (Return to Origin).',
          'Once done, WhatsApp us immediately on +91 8796775699. We’ll resolve the issue and send you a brand-new replacement at no extra cost—you deserve nothing less than the best!',
        ],
        note: 'Important: We cannot process the return or replacement without the unboxing/tampering video that was originally requested.',
      },
      {
        heading: 'How can I contact Daiorus?',
        body: 'For any questions about returns, exchanges, or refunds, or even just some general chit-chat, you can reach us through the following:',
        items: [
          'WhatsApp: +91 8796775699',
          'Email: Sales@Daiorus.com',
          'Instagram: @Daiorus',
        ],
      },
      {
        heading: 'Conclusion',
        body: 'We truly appreciate your trust in Daiorus and are committed to making your shopping experience smooth and satisfying. If you ever need help, please don’t hesitate to reach out—we’re always here for you.',
      },
      {
        heading: 'Important Notes',
        ordered: [
          'Unboxing Video – Please record a clear unboxing video when you receive your Daiorus package. If there’s an issue (damaged/missing/wrong product), this video will help us process your request quickly.',
          'Missed Pickup – If you miss handing over the product during the scheduled pickup, you’ll need to self-ship the product to complete your return or exchange.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Introduction',
        body: 'Hello, and welcome to our privacy policy! At Daiorus, we are dedicated to safeguarding your personal data. We understand the importance of privacy and appreciate your trust in us to handle your information responsibly and transparently. This privacy policy explains how we collect, use, and protect your personal data when you visit our website or purchase our products. We aim to be as clear as possible, but if you have any questions, please don’t hesitate to reach out to us at +91 8796775699 (WhatsApp), Sales@Daiorus.com (email), or @Daiorus (Instagram).',
      },
      {
        heading: 'Consent',
        body: 'By using our website, you consent to our Privacy Policy and agree to its terms as outlined below.',
      },
      {
        heading: 'What Purposes Do We Collect Your Information For?',
        body: 'We collect and use your personal data for the following purposes:',
        items: [
          'Order Processing: To process and deliver your orders efficiently.',
          'Communication: To keep you informed about your orders, new products, and promotional offers.',
          'Personalisation: To customise your experience on our website and other digital platforms.',
          'Targeted Advertising: To deliver advertisements tailored to your demographic profiles or interests.',
          'Analytics: To enhance our website and services through data analysis.',
          'Compliance: To meet legal and regulatory requirements.',
        ],
      },
      {
        heading: 'What Information Do We Collect?',
        items: [
          'Personal Data: When you provide it voluntarily, including your name, email address, postal address, telephone number, and payment information.',
          'Usage Data: Information about your use of our website, such as IP address, device type, and visited pages. This data is collected in aggregate form to analyse and improve our services.',
        ],
      },
      {
        heading: 'How Do We Collect Information?',
        body: 'We collect information through various methods:',
        items: [
          'Cookies: Small files placed on your device to recognise you and remember your preferences. They do not personally identify you.',
          'Analytics: Platforms that help us understand how visitors use our site without personally identifying you.',
          'Tracking Pixels: Tiny graphics that track online behaviour, aiding in improving user experience and site traffic analysis. They do not personally identify you.',
        ],
      },
      {
        heading: "Children's Privacy",
        body: 'Our services are intended for individuals aged 18 and older. If you are under 18, you are not permitted to submit personal information to us.',
      },
      {
        heading: 'How Do We Share Your Information?',
        body: 'We do not sell or rent your personal information. We may share your data with trusted third parties for the following purposes:',
        items: [
          'Service Providers: Such as delivery services and payment processors.',
          'Marketing Platforms: To assist in targeted advertising and promotional activities.',
        ],
        after: 'All third parties are required to protect your personal data and adhere to legal standards.',
      },
      {
        heading: 'How Do We Protect Your Information?',
        body: 'We implement robust technical and organisational security measures to safeguard your personal data from unauthorised access, loss, or misuse. These measures include:',
        items: [
          'Access Restrictions: Limiting data access to authorised personnel only.',
          'Two-Factor Authentication: Enhancing security for account access.',
          'Encryption: Securing data during transmission and storage.',
        ],
        after:
          'Despite our efforts to protect your data, we cannot guarantee that data loss, misuse, or alteration will not occur.',
      },
      {
        heading: 'Changes to This Policy',
        body: 'This policy was last updated on 13th June, 2026. We may amend or update this privacy policy at any time, with or without notice. Changes will be posted on this page. We encourage you to review this policy periodically to stay informed about how we protect your data.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      {
        heading: 'Welcome',
        body: 'Welcome to Daiorus, your trusted destination for exquisite jewellery. We appreciate your interest in our products and want to ensure a smooth and enjoyable shopping experience. To facilitate this, we ask you to review our Terms of Service. Although it might not be the most exciting read, it’s crucial for a clear understanding of our mutual expectations.',
      },
      {
        heading: '1. Acceptance of Terms',
        body: 'By accessing or using our website (www.Daiorus.in) and making purchases from us, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using our site or services.',
      },
      {
        heading: '2. Purpose of Terms',
        body: 'These Terms of Service outline the rules and guidelines for our relationship as a seller and you as a buyer. They help ensure that our interactions are smooth and transparent.',
      },
      {
        heading: '3. Eligibility',
        body: 'By placing an order with us, you confirm that you are at least 18 years old and legally capable of entering into binding agreements.',
      },
      {
        heading: '4. Product Information',
        body: 'Images and Descriptions: Product images and descriptions on our website are for illustrative purposes. While we make every effort to ensure the images and descriptions are as similar to the actual product as possible, we cannot guarantee that the colour representation on your device matches the actual product.',
      },
      {
        heading: '5. Prices and Payment',
        body: [
          'Pricing: All prices on our website are inclusive of GST (where applicable) and are accurate at the time of listing. We reserve the right to update prices as needed.',
          'Payment Methods: We accept various payment methods as detailed on our website. Ensure that your payment information is accurate and up-to-date.',
        ],
      },
      {
        heading: '6. Shipping and Delivery',
        body: [
          'Free Shipping: We offer free standard shipping on all orders across India. For more detailed information, please refer to our Shipping Policy.',
          'Processing Time: Orders are typically processed within 4 business days.',
        ],
      },
      {
        heading: '7. Returns and Refunds',
        body: [
          'Returns: If you wish to return an item, please initiate a return request through your account on our website. Follow the instructions provided for the return process.',
          'Refunds: Once we receive and inspect the returned item, a refund will be processed. A 15% handling fee will be deducted. Please refer to our Returns and Refunds Policy for details on processing times and any applicable deductions.',
        ],
      },
      {
        heading: '8. Privacy',
        body: 'Data Management: We care about your privacy. Our management of personal data is governed by our Privacy Policy, which details how we collect, use, and protect your information.',
      },
      {
        heading: '9. Intellectual Property',
        body: 'Ownership: All content on our website, including trademarks, logos, and other intellectual property, is owned by Daiorus or our licensors. Unauthorised use of this content is prohibited without our prior written consent.',
      },
      {
        heading: '10. Limitation of Liability',
        body: 'Website Availability: We strive to ensure that our website is available and error-free. However, due to the nature of the internet, we cannot guarantee uninterrupted access. We are not liable for any interruptions or delays in accessing our website.',
      },
      {
        heading: '11. Unauthorised Activities',
        body: 'Restrictions: You may not use our website or its content for commercial purposes without our express written consent. Unauthorised activities include but are not limited to:',
        items: [
          'Automated data collection (scraping, mining, extraction) without consent.',
          'Using data from our website for unsolicited marketing.',
          'Employing systems or technologies to extract data for use on other platforms.',
        ],
        after:
          'Consequences: If you engage in unauthorised activities, we reserve the right to prohibit access to our website and pursue legal action.',
      },
      {
        heading: '12. Changes to Terms',
        body: 'Modifications: We may update these Terms of Service periodically. Please review this page regularly to stay informed about any changes.',
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

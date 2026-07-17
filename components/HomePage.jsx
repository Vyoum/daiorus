import Link from 'next/link';
import SiteShell from './SiteShell';
import ProductCard from './ProductCard';
import HomeHeroCarousel from './HomeHeroCarousel';
import { COLLECTIONS } from '../lib/data';
import { DEFAULT_HERO, DEFAULT_SIGNATURE } from '../lib/site-content-defaults';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/social';

const IG_IMAGES = [
  '/images/ui1/ig-1.jpg',
  '/images/ui1/ig-2.jpg',
  '/images/ui1/ig-3.jpg',
  '/images/ui1/ig-4.jpg',
  '/images/ui1/ig-5.jpg',
  '/images/ui1/ig-6.jpg',
];

const MARQUEE = [
  'BIS Hallmarked Gold',
  'Crafted in India',
  'Free Shipping Across India',
  '7-Day Returns',
];

export default function HomePage({
  announce,
  hero,
  signature,
  featuredProducts = [],
  curatedSelectProducts = [],
  categories = [],
}) {
  const heroContent = hero || DEFAULT_HERO;
  const signatureContent = signature || DEFAULT_SIGNATURE;
  const bestSellers = featuredProducts;
  const shopCategories = Array.isArray(categories) ? categories : [];
  const curatedProducts = Array.isArray(curatedSelectProducts)
    ? curatedSelectProducts.filter((p) => p && p.slug)
    : [];

  const curatedCards = curatedProducts.length
    ? curatedProducts.map((p) => {
        const image =
          p.imageUrl ||
          (Array.isArray(p.images) ? p.images[0] : '') ||
          '/images/ui1/hero-home.jpg';
        const desc = p.material || p.tag || p.description || '';
        return {
          name: p.name,
          desc,
          href: `/product/${p.slug}`,
          image,
        };
      })
    : COLLECTIONS;

  const heroSlides =
    Array.isArray(heroContent.images) && heroContent.images.length
      ? heroContent.images.filter(Boolean)
      : [heroContent.imageUrl || DEFAULT_HERO.imageUrl].filter(Boolean);

  return (
    <SiteShell headerOverlay announce={announce}>
      <>
        <section className="ui1-hero">
          <HomeHeroCarousel images={heroSlides} alt={heroContent.imageAlt} />
          <div className="ui1-hero-overlay" />
          <div className="ui1-hero-content">
            <div className="ui1-hero-inner">
              <span className="ui1-hero-eyebrow">{heroContent.eyebrow}</span>
              <h1 className="ui1-hero-title">
                {heroContent.titleLine1}
                <br />
                {heroContent.titleLine2}
              </h1>
              <p className="ui1-hero-body">{heroContent.body}</p>
              <Link href={heroContent.ctaUrl || '/shop'} className="btn-outline-dark">
                {heroContent.ctaLabel}
              </Link>
            </div>
          </div>
        </section>

        <div className="marquee-strip" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={`${item}-${i}`} className="marquee-item">
                {item}
              </span>
            ))}
          </div>
        </div>

        <section className="ui1-section">
          <div className="ui1-container">
            <div className="section-header">
              <div>
                <span className="section-label">Curated Selects</span>
                <h2 className="section-title">Featured Collections</h2>
              </div>
              <Link href="/shop" className="section-link">
                View All
              </Link>
            </div>
            <div className="collections-grid">
              {curatedCards.map((col) => (
                <article key={col.name} className="collection-card">
                  <div className="collection-img-wrapper">
                    <img
                      src={col.image}
                      alt={col.name}
                      className="collection-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h3 className="collection-name">{col.name}</h3>
                  <p className="collection-desc">{col.desc}</p>
                  <Link href={col.href} className="collection-link">
                    Shop Now
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ui1-section bg-cream">
          <div className="ui1-container">
            <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
              <div>
                <span className="section-label">Browse</span>
                <h2 className="section-title">Shop by Category</h2>
              </div>
            </div>
            <div className="categories-grid">
              {shopCategories.map((cat) => (
                <Link key={cat.slug} href={cat.href} className="category-card">
                  <div className="category-img-wrapper">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="category-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h3 className="category-name">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="ui1-section">
          <div className="ui1-container">
            <div className="section-header">
              <div>
                <span className="section-label">Customer Favourites</span>
                <h2 className="section-title">Best Sellers</h2>
              </div>
              <Link href="/shop" className="section-link">
                Shop All
              </Link>
            </div>
              <div className="ui1-product-grid">
                {bestSellers.length > 0 ? (
                  bestSellers.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={index < 2}
                    />
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', color: 'var(--muted)' }}>
                    New pieces are on the way.
                  </p>
                )}
              </div>
          </div>
        </section>

        <section className="editorial-split-section">
          <div className="editorial-text-block">
            <span className="section-label">Our Philosophy</span>
            <h2 className="section-title">Crafted With Intention</h2>
            <p className="editorial-desc">
              Every Daiorus piece is designed to be worn every day — BIS hallmarked
              gold, finished by master goldsmiths in India. Beauty that doesn&apos;t
              wait for special occasions.
            </p>
            <Link href="/about" className="btn-outline-light">
              Read Our Story
            </Link>
          </div>
          <div className="editorial-img-block">
            <img
              src="/images/ui1/brand-story.jpg"
              alt="Daiorus craftsmanship"
              className="editorial-img"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        <section className="ui1-section bg-cream">
          <div className="ui1-container">
            <div className="vermeil-split">
              <div className="vermeil-images">
                <img
                  src={signatureContent.imageUrl1}
                  alt={signatureContent.imageAlt1}
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src={signatureContent.imageUrl2}
                  alt={signatureContent.imageAlt2}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="vermeil-copy">
                <span className="section-label">{signatureContent.label}</span>
                <h2 className="section-title">{signatureContent.title}</h2>
                <p className="vermeil-desc">{signatureContent.body}</p>
                <Link href={signatureContent.ctaUrl || '/shop'} className="btn-dark">
                  {signatureContent.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="ui1-section">
          <div className="ui1-container">
            <div className="instagram-header">
              <span className="section-label">Social</span>
              <h2 className="section-title">
                Follow Us{' '}
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                  {INSTAGRAM_HANDLE}
                </a>
              </h2>
            </div>
            <div className="instagram-grid">
              {IG_IMAGES.map((src, idx) => (
                <a
                  key={src}
                  href={INSTAGRAM_URL}
                  className="instagram-card"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={src}
                    alt={`Instagram look ${idx + 1}`}
                    className="instagram-img"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="instagram-overlay">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="trust-bar">
          <div className="trust-grid">
            <div className="trust-item">
              <svg className="trust-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <h4 className="trust-title">Free Shipping</h4>
              <p className="trust-desc">On all orders across India</p>
            </div>
            <div className="trust-item">
              <svg className="trust-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <h4 className="trust-title">Shop Safely</h4>
              <p className="trust-desc">Secure checkout guaranteed</p>
            </div>
            <div className="trust-item">
              <svg className="trust-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
              </svg>
              <h4 className="trust-title">7-Day Returns</h4>
              <p className="trust-desc">Hassle-free exchanges</p>
            </div>
            <div className="trust-item">
              <svg className="trust-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <h4 className="trust-title">Gift Wrapping</h4>
              <p className="trust-desc">Signature luxury packaging</p>
            </div>
          </div>
        </section>
      </>
    </SiteShell>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteShell from '../../../components/SiteShell';
import ProductCard from '../../../components/ProductCard';
import {
  CATEGORIES,
  PRODUCTS,
  getCategory,
} from '../../../lib/data';

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: 'Category | DAIORUS' };
  return {
    title: `${category.name} | DAIORUS`,
    description: category.intro,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const products = PRODUCTS[slug] || [];
  const alsoExplore = CATEGORIES.filter((c) => c.slug !== slug).slice(0, 3);

  return (
    <SiteShell headerOverlay>
      <section className="cat-hero" aria-label={category.name}>
        <img
          src={category.heroImage}
          alt={`${category.name} from DAIORUS`}
          className="cat-hero-bg"
        />
      </section>

      <section className="cat-intro">
        <div className="cat-intro-inner">
          <p className="cat-intro-text">{category.intro}</p>
          <span className="cat-intro-count">{products.length} pieces</span>
        </div>
      </section>

      <section className="cat-products">
        <div className="cat-products-inner">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showMaterial />
          ))}
        </div>
      </section>

      <section className="cat-explore">
        <div className="cat-explore-inner">
          <h2 className="cat-explore-title">Also Explore</h2>
          <div className="cat-explore-grid">
            {alsoExplore.map((item) => (
              <Link key={item.slug} href={item.href} className="cat-explore-card">
                <div className="cat-explore-img-wrap">
                  <img src={item.image} alt={item.name} className="cat-explore-img" />
                </div>
                <span className="cat-explore-name">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cat-trust">
        <div className="cat-trust-inner">
          <div className="cat-trust-item">
            <svg className="cat-trust-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <h4 className="cat-trust-title">Free Shipping</h4>
            <p className="cat-trust-desc">On all orders across India</p>
          </div>
          <div className="cat-trust-item">
            <svg className="cat-trust-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
            <h4 className="cat-trust-title">7-Day Returns</h4>
            <p className="cat-trust-desc">Hassle-free exchanges</p>
          </div>
          <div className="cat-trust-item">
            <svg className="cat-trust-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h4 className="cat-trust-title">BIS Hallmarked</h4>
            <p className="cat-trust-desc">Certified authentic gold</p>
          </div>
          <div className="cat-trust-item">
            <svg className="cat-trust-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h4 className="cat-trust-title">Gift Packaging</h4>
            <p className="cat-trust-desc">Signature luxury box</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

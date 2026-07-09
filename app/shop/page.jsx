'use client';

import { useMemo, useState } from 'react';
import SiteShell from '../../components/SiteShell';
import { CATEGORIES, getAllProducts } from '../../lib/data';
import Price from '../../components/Price';

const FILTERS = [
  { id: 'all', label: 'All' },
  ...CATEGORIES.map((c) => ({ id: c.slug, label: c.name })),
];

export default function ShopPage() {
  const [filter, setFilter] = useState('all');
  const allProducts = useMemo(() => getAllProducts(), []);

  const products =
    filter === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === filter);

  return (
    <SiteShell>
      {({ addToCart }) => (
        <>
          <div className="shop-hero">
            <h1>All Jewellery</h1>
            <p>
              Explore the full Daiorus collection — earrings, pendants, bracelets,
              and second piercing essentials.
            </p>
          </div>

          <div className="shop-filters">
            {FILTERS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={`filter-chip ${filter === chip.id ? 'active' : ''}`}
                onClick={() => setFilter(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="shop-grid-wrap">
            <div className="ui1-product-grid">
              {products.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="product-img-wrapper">
                    {product.tag && (
                      <span
                        className={`product-tag ${
                          String(product.tag).toLowerCase() === 'new' ? 'new' : ''
                        } ${
                          String(product.tag).toLowerCase() === 'sale' ? 'sale' : ''
                        }`}
                      >
                        {product.tag}
                      </span>
                    )}
                    <img src={product.image} alt={product.name} className="product-img" />
                    <button
                      type="button"
                      className="product-action-btn"
                      onClick={() => addToCart(product)}
                    >
                      Add To Cart
                    </button>
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  {product.material && (
                    <p className="product-material">{product.material}</p>
                  )}
                  <p className="product-price">
                    <Price amount={product.price} />
                  </p>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
    </SiteShell>
  );
}

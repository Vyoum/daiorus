'use client';

import { useMemo, useState } from 'react';
import SiteShell from '../../components/SiteShell';
import ProductCard from '../../components/ProductCard';
import { CATEGORIES, getAllProducts } from '../../lib/data';

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
            <ProductCard key={product.id} product={product} showMaterial />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}

'use client';

import { useMemo, useState } from 'react';
import SiteShell from '../../components/SiteShell';
import ProductCard from '../../components/ProductCard';
import { CATEGORIES, getAllProducts } from '../../lib/data';

const CARATS = ['14K', '18K', '20K', '22K', '24K'];
const METALS = [
  { id: 'gold', label: 'Gold' },
  { id: 'diamond', label: 'Diamond' },
];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'popularity', label: 'Popularity: High to Low' },
  { id: 'rating', label: 'Customer Rating' },
];

function parseCarat(material = '') {
  const match = material.match(/(\d{2})\s*K/i);
  return match ? `${match[1]}K` : null;
}

function ratingFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % 97;
  return Math.round((4 + (hash % 11) / 10) * 10) / 10;
}

function popularityFromProduct(product) {
  if (product.tag === 'Best Seller') return 98;
  if (product.tag === 'New') return 86;
  if (product.tag === 'Sale') return 74;
  return 55 + Math.min(30, Math.round(product.price / 1000));
}

function enrichProduct(product) {
  const material = product.material || '';
  return {
    ...product,
    carat: parseCarat(material),
    isGold: /gold|vermeil/i.test(material),
    isDiamond: /diamond/i.test(material),
    rating: ratingFromId(product.id),
    popularity: popularityFromProduct(product),
  };
}

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

const EMPTY_FILTERS = {
  categories: [],
  carats: [],
  metals: [],
  priceMin: null,
  priceMax: null,
};

export default function ShopPage() {
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const allProducts = useMemo(() => getAllProducts().map(enrichProduct), []);

  const catalogMin = useMemo(
    () => Math.min(...allProducts.map((p) => p.price)),
    [allProducts]
  );
  const catalogMax = useMemo(
    () => Math.max(...allProducts.map((p) => p.price)),
    [allProducts]
  );

  const priceMin = filters.priceMin ?? catalogMin;
  const priceMax = filters.priceMax ?? catalogMax;

  const activeFilterCount =
    filters.categories.length +
    filters.carats.length +
    filters.metals.length +
    (filters.priceMin != null || filters.priceMax != null ? 1 : 0);

  const products = useMemo(() => {
    let list = allProducts.filter((product) => {
      if (filters.categories.length && !filters.categories.includes(product.category)) {
        return false;
      }
      if (filters.carats.length && !filters.carats.includes(product.carat)) {
        return false;
      }
      if (filters.metals.length) {
        const matchesMetal = filters.metals.some((metal) => {
          if (metal === 'gold') return product.isGold;
          if (metal === 'diamond') return product.isDiamond;
          return false;
        });
        if (!matchesMetal) return false;
      }
      if (product.price < priceMin || product.price > priceMax) return false;
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        sorted.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return sorted;
  }, [allProducts, filters, priceMin, priceMax, sort]);

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const setPriceMin = (value) => {
    const next = Number(value);
    setFilters((prev) => ({
      ...prev,
      priceMin: next,
      priceMax: Math.max(next, prev.priceMax ?? catalogMax),
    }));
  };

  const setPriceMax = (value) => {
    const next = Number(value);
    setFilters((prev) => ({
      ...prev,
      priceMax: next,
      priceMin: Math.min(next, prev.priceMin ?? catalogMin),
    }));
  };

  const filterPanel = (
    <aside className="shop-filter-panel">
      <div className="shop-filter-panel-head">
        <h2>Filters</h2>
        {activeFilterCount > 0 && (
          <button type="button" className="shop-filter-clear" onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>

      <div className="shop-filter-group">
        <h3>Categories</h3>
        <div className="shop-filter-options">
          {CATEGORIES.map((category) => (
            <label key={category.slug} className="shop-filter-check">
              <input
                type="checkbox"
                checked={filters.categories.includes(category.slug)}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    categories: toggleValue(prev.categories, category.slug),
                  }))
                }
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="shop-filter-group">
        <h3>Carat</h3>
        <div className="shop-filter-chips">
          {CARATS.map((carat) => (
            <button
              key={carat}
              type="button"
              className={`shop-filter-pill ${filters.carats.includes(carat) ? 'active' : ''}`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  carats: toggleValue(prev.carats, carat),
                }))
              }
            >
              {carat}
            </button>
          ))}
        </div>
      </div>

      <div className="shop-filter-group">
        <h3>Price Range</h3>
        <div className="shop-price-values">
          <span>₹{priceMin.toLocaleString('en-IN')}</span>
          <span>₹{priceMax.toLocaleString('en-IN')}</span>
        </div>
        <div className="shop-price-sliders">
          <label className="shop-price-slider-label">
            Min
            <input
              type="range"
              min={catalogMin}
              max={catalogMax}
              step={100}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
          </label>
          <label className="shop-price-slider-label">
            Max
            <input
              type="range"
              min={catalogMin}
              max={catalogMax}
              step={100}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="shop-filter-group">
        <h3>Metal</h3>
        <div className="shop-filter-options">
          {METALS.map((metal) => (
            <label key={metal.id} className="shop-filter-check">
              <input
                type="checkbox"
                checked={filters.metals.includes(metal.id)}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    metals: toggleValue(prev.metals, metal.id),
                  }))
                }
              />
              <span>{metal.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <SiteShell>
      <div className="shop-hero">
        <h1>All Jewellery</h1>
        <p>
          Explore the full Daiorus collection — earrings, pendants, bracelets,
          and second piercing essentials.
        </p>
      </div>

      <div className="shop-toolbar">
        <button
          type="button"
          className={`shop-toolbar-filters-btn ${filtersOpen ? 'active' : ''}`}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>

        <p className="shop-result-count">
          {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </p>

        <label className="shop-sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="shop-layout">
        <div className="shop-filters-desktop">{filterPanel}</div>

        {filtersOpen && (
          <div className="shop-filters-mobile" role="dialog" aria-label="Shop filters">
            <div className="shop-filters-mobile-backdrop" onClick={() => setFiltersOpen(false)} />
            <div className="shop-filters-mobile-sheet">
              {filterPanel}
              <button
                type="button"
                className="shop-filters-apply"
                onClick={() => setFiltersOpen(false)}
              >
                Show {products.length} results
              </button>
            </div>
          </div>
        )}

        <div className="shop-grid-wrap">
          {products.length > 0 ? (
            <div className="ui1-product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} showMaterial />
              ))}
            </div>
          ) : (
            <div className="shop-empty">
              <h2>No pieces match these filters</h2>
              <p>Try adjusting carat, price, or category to see more of the collection.</p>
              <button type="button" className="btn-outline-dark" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}

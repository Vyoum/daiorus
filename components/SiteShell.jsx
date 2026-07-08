'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, COLLECTIONS, formatINR } from '../lib/data';

export default function SiteShell({ children, showNewsletter = true }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const searchCloseTimer = useRef(null);
  const catCloseTimer = useRef(null);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, change) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const qty = item.qty + change;
          return qty > 0 ? { ...item, qty } : null;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const openSearch = () => {
    if (searchCloseTimer.current) clearTimeout(searchCloseTimer.current);
    setIsSearchOpen(true);
  };
  const closeSearch = () => {
    searchCloseTimer.current = setTimeout(() => setIsSearchOpen(false), 120);
  };
  const dismissSearch = () => {
    if (searchCloseTimer.current) clearTimeout(searchCloseTimer.current);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const openCategories = () => {
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    setCategoriesOpen(true);
  };
  const closeCategories = () => {
    catCloseTimer.current = setTimeout(() => setCategoriesOpen(false), 120);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <div className="site-shell">
      <div className="announce-bar">
        <p className="announce-bar-text">
          Free shipping on orders above ₹2,000 ·{' '}
          <Link href="/shop" className="announce-accent">
            New Collection: Worn With Grace
          </Link>{' '}
          · BIS Hallmarked Gold
        </p>
      </div>

      <header className="ui1-header">
        <div className="ui1-header-inner">
          <nav className="ui1-nav-left">
            <Link href="/shop" className="nav-link">
              Shop All
            </Link>
            <div
              className="nav-dropdown"
              onMouseEnter={openCategories}
              onMouseLeave={closeCategories}
            >
              <button
                type="button"
                className="nav-link nav-dropdown-trigger"
                aria-expanded={categoriesOpen}
              >
                Categories
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className={`nav-dropdown-menu ${categoriesOpen ? 'open' : ''}`}>
                {CATEGORIES.map((cat) => (
                  <Link key={cat.slug} href={cat.href} className="nav-dropdown-item">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <Link href="/" className="logo" aria-label="DAIORUS Home">
            <img src="/images/daiorus-mark.png" alt="" className="logo-mark" />
            <span className="logo-wordmark">DAIORUS</span>
          </Link>

          <div className="ui1-nav-right">
            <div
              className="search-trigger"
              onMouseEnter={openSearch}
              onMouseLeave={closeSearch}
            >
              <button
                type="button"
                className="icon-btn"
                aria-label="Search"
                aria-expanded={isSearchOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>

            <button type="button" className="icon-btn" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <button
              type="button"
              className="icon-btn"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          </div>
        </div>

        <div
          className={`search-dropdown ${isSearchOpen ? 'open' : ''}`}
          onMouseEnter={openSearch}
          onMouseLeave={closeSearch}
        >
          <div className="search-dropdown-inner">
            <div className="search-input-row">
              <svg className="search-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search jewellery, collections, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" className="search-close-btn" aria-label="Close search" onClick={dismissSearch}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="search-columns">
              <div className="search-column">
                <h3 className="search-column-title">Categories</h3>
                <ul className="search-links">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.slug}>
                      <Link href={cat.href} className="search-link">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="search-column">
                <h3 className="search-column-title">Collections</h3>
                <ul className="search-links">
                  {COLLECTIONS.map((col) => (
                    <li key={col.name}>
                      <Link href={col.href} className="search-link">
                        {col.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}>
        <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header">
            <h2 className="cart-title">Your Cart</h2>
            <button type="button" className="close-btn" aria-label="Close cart" onClick={() => setIsCartOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="empty-cart-state">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <p className="empty-text">Your cart is empty</p>
                <Link
                  href="/shop"
                  className="continue-shopping-btn"
                  onClick={() => setIsCartOpen(false)}
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <div className="cart-item-meta">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <span className="cart-item-price">{formatINR(item.price * item.qty)}</span>
                      </div>
                      <div className="cart-item-qty-actions">
                        <div className="qty-selector">
                          <button type="button" className="qty-btn" onClick={() => updateQty(item.id, -1)}>
                            -
                          </button>
                          <span className="qty-val">{item.qty}</span>
                          <button type="button" className="qty-btn" onClick={() => updateQty(item.id, 1)}>
                            +
                          </button>
                        </div>
                        <button type="button" className="remove-item-btn" onClick={() => removeFromCart(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-subtotal-row">
                <span className="subtotal-label">Subtotal</span>
                <span className="subtotal-value">{formatINR(subtotal)}</span>
              </div>
              <button type="button" className="checkout-btn" onClick={() => alert('Proceeding to Checkout')}>
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="site-main">{typeof children === 'function' ? children({ addToCart }) : children}</main>

      {showNewsletter && (
        <section className="newsletter-section">
          <div className="newsletter-container">
            <span className="newsletter-eyebrow">Stay Connected</span>
            <h2 className="newsletter-title">Join the Inner Circle</h2>
            <p className="newsletter-desc">
              First access to new collections, exclusive offers, and stories from the Daiorus studio.
            </p>
            {subscribed ? (
              <p className="newsletter-success">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  className="newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="newsletter-btn">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      <footer className="footer-container">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="footer-logo" aria-label="DAIORUS Home">
                <img src="/images/daiorus-mark.png" alt="" className="footer-logo-mark" />
                <span className="footer-logo-wordmark">DAIORUS</span>
              </Link>
              <p className="footer-brand-desc">
                Fine jewellery for the modern woman. Crafted with intention, worn with grace.
              </p>
              <div className="social-links">
                <a href="https://instagram.com/daiorus" className="social-link" aria-label="Instagram" target="_blank" rel="noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#facebook" className="social-link" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#youtube" className="social-link" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="footer-column-title">Shop</h3>
              <ul className="footer-links-list">
                <li className="footer-link-item">
                  <Link href="/shop">Shop All</Link>
                </li>
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug} className="footer-link-item">
                    <Link href={cat.href}>{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="footer-column-title">Company</h3>
              <ul className="footer-links-list">
                <li className="footer-link-item">
                  <Link href="/about">About Us</Link>
                </li>
                <li className="footer-link-item">
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="footer-column-title">Help</h3>
              <ul className="footer-links-list">
                <li className="footer-link-item">
                  <Link href="/legal/shipping">Shipping Policy</Link>
                </li>
                <li className="footer-link-item">
                  <Link href="/legal/returns">Returns & Exchanges</Link>
                </li>
                <li className="footer-link-item">
                  <Link href="/legal/privacy">Privacy Policy</Link>
                </li>
                <li className="footer-link-item">
                  <Link href="/legal/terms">Terms & Conditions</Link>
                </li>
                <li className="footer-link-item">
                  <Link href="/legal/payment">Payment Info</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© {new Date().getFullYear()} Daiorus. All rights reserved.</p>
            <p className="footer-tagline">Crafted in India · Made for the world</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { SiteShell };

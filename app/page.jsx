'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

const CATEGORIES = [
  { name: 'Earrings', href: '#earrings', image: '/images/vermeil-1.png' },
  { name: 'Necklaces', href: '#necklaces', image: '/images/everyday-edit.png' },
  { name: 'Rings', href: '#rings', image: '/images/crafted-rings.png' },
  { name: 'Bracelets', href: '#bracelets', image: '/images/vermeil-1.png' },
];

const COLLECTIONS = [
  { name: 'The Everyday Edit', href: '#shop-everyday', image: '/images/everyday-edit.png' },
  { name: 'Just Married', href: '#shop-bridal', image: '/images/just-married.png' },
  { name: 'Fine 18k Gold', href: '#shop-gold', image: '/images/fine-gold.png' },
];

const BEST_SELLERS = [
  {
    id: 1,
    name: 'Eternity Ring',
    price: 2200,
    tag: 'Best Seller',
    image: '/images/just-married.png',
  },
  {
    id: 2,
    name: 'Pearl Drop Necklace',
    price: 1450,
    tag: 'New',
    image: '/images/hero-necklace.png',
  },
  {
    id: 3,
    name: 'Classic Pendant',
    price: 890,
    tag: 'New',
    image: '/images/fine-gold.png',
  },
  {
    id: 4,
    name: 'Gold Blossom Earrings',
    price: 1100,
    tag: 'Popular',
    image: '/images/vermeil-1.png',
  },
];

export default function HomePage() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchCloseTimer = useRef(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
    setIsCartOpen(true); // Auto-open cart on adding item
  };

  const updateQty = (id, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + change;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

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

  return (
    <>
      {/* Navigation Header */}
      <header className="header-container">
        <div className="header-inner">
          <nav className="nav-links">
            <a href="#collections" className="nav-link">Collections</a>
            <a href="#categories" className="nav-link">Shop</a>
            <a href="#about" className="nav-link">Our Story</a>
          </nav>
          
          <a href="/" className="logo" aria-label="DAIORUS Home">
            <img src="/images/daiorus-mark.png" alt="" className="logo-mark" />
            <span className="logo-wordmark">DAIORUS</span>
          </a>

          <div className="header-icons">
            {/* Search */}
            <div
              className="search-trigger"
              onMouseEnter={openSearch}
              onMouseLeave={closeSearch}
            >
              <button className="icon-btn search-btn" aria-label="Search" aria-expanded={isSearchOpen}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="search-label">Search</span>
              </button>
            </div>
            
            {/* Profile Icon */}
            <button className="icon-btn" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            
            {/* Shopping Cart Icon */}
            <button className="icon-btn" aria-label="Cart" onClick={() => setIsCartOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          </div>
        </div>

        {/* Search Dropdown */}
        <div
          className={`search-dropdown ${isSearchOpen ? 'open' : ''}`}
          onMouseEnter={openSearch}
          onMouseLeave={closeSearch}
        >
          <div className="search-dropdown-inner">
            <div className="search-input-row">
              <svg className="search-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search creations, collections, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="search-close-btn"
                aria-label="Close search"
                onClick={dismissSearch}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="search-columns">
              <div className="search-column">
                <h3 className="search-column-title">Categories</h3>
                <ul className="search-links">
                  {CATEGORIES.map((category) => (
                    <li key={category.name}>
                      <a href={category.href} className="search-link">{category.name}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="search-column">
                <h3 className="search-column-title">Collections</h3>
                <ul className="search-links">
                  {COLLECTIONS.map((collection) => (
                    <li key={collection.name}>
                      <a href={collection.href} className="search-link">{collection.name}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="search-column search-creations-column">
                <h3 className="search-column-title">Creations</h3>
                <div className="search-creations-grid">
                  {BEST_SELLERS.map((product) => (
                    <a key={product.id} href="#all-best-sellers" className="search-creation-card">
                      <div className="search-creation-img-wrapper">
                        <img src={product.image} alt={product.name} className="search-creation-img" />
                      </div>
                      <span className="search-creation-name">{product.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer Slide-out overlay */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}>
        <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header">
            <h2 className="cart-title">Your Cart</h2>
            <button className="close-btn" aria-label="Close cart" onClick={() => setIsCartOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="empty-cart-state">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p className="empty-text">Your cart is empty.</p>
                <p className="empty-sub">Please add items to start shopping.</p>
                <button className="continue-shopping-btn" onClick={() => setIsCartOpen(false)}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <div className="cart-item-meta">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <span className="cart-item-price">${(item.price * item.qty).toLocaleString()}</span>
                      </div>
                      <div className="cart-item-qty-actions">
                        <div className="qty-selector">
                          <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                          <span className="qty-val">{item.qty}</span>
                          <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                        </div>
                        <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
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
                <span className="subtotal-value">${subtotal.toLocaleString()}</span>
              </div>
              <button className="checkout-btn" onClick={() => alert('Proceeding to Checkout')}>
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <img
          src="/images/hero-necklace.png"
          alt="Luxury Necklace Model"
          className="hero-bg"
        />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-content-inner">
            <span className="hero-subtitle">Premium Collection</span>
            <h1 className="hero-title serif">Worn<br />With Grace</h1>
            <p className="hero-description">
              Fine jewellery crafted for every day. Timeless elegance designed to tell your story, hand-finished in 18k solid gold.
            </p>
            <a href="#collections" className="hero-btn">
              Shop Collection
            </a>
          </div>
        </div>
      </section>

      {/* Feature Banner */}
      <div className="feature-banner">
        <div className="feature-banner-inner">
          <div className="feature-banner-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Free Worldwide Shipping
          </div>
          <div className="feature-banner-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            Easy 14-Day Returns
          </div>
          <div className="feature-banner-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Secure Checkout Guarantee
          </div>
        </div>
      </div>

      {/* Featured Collections */}
      <section id="collections" className="section-padding">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-label">Curated Selects</span>
              <h2 className="section-title">Featured Collections</h2>
            </div>
            <a href="#all-collections" className="section-link">View All</a>
          </div>

          <div className="collections-grid">
            <div className="collection-card">
              <div className="collection-img-wrapper">
                <img src="/images/everyday-edit.png" alt="The Everyday Edit" className="collection-img" />
              </div>
              <h3 className="collection-name">The Everyday Edit</h3>
              <p className="collection-desc">Modern classics designed to be layered, stacked, and worn day after day.</p>
              <a href="#shop-everyday" className="collection-link">Shop Now</a>
            </div>

            <div className="collection-card">
              <div className="collection-img-wrapper">
                <img src="/images/just-married.png" alt="Just Married" className="collection-img" />
              </div>
              <h3 className="collection-name">Just Married</h3>
              <p className="collection-desc">Bespoke engagement rings and bridal jewelry to mark life’s most precious moments.</p>
              <a href="#shop-bridal" className="collection-link">Shop Now</a>
            </div>

            <div className="collection-card">
              <div className="collection-img-wrapper">
                <img src="/images/fine-gold.png" alt="Fine 18k Gold" className="collection-img" />
              </div>
              <h3 className="collection-name">Fine 18k Gold</h3>
              <p className="collection-desc">Meticulously crafted heirlooms made from 100% recycled solid yellow and white gold.</p>
              <a href="#shop-gold" className="collection-link">Shop Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section id="categories" className="section-padding bg-warm">
        <div className="section-container">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', marginBottom: '60px' }}>
            <div>
              <span className="section-label">Browse Items</span>
              <h2 className="section-title">Shop by Category</h2>
            </div>
          </div>

          <div className="categories-grid">
            <div className="category-card">
              <div className="category-img-wrapper">
                <img src="/images/vermeil-1.png" alt="Earrings" className="category-img" />
              </div>
              <h3 className="category-name">Earrings</h3>
            </div>

            <div className="category-card">
              <div className="category-img-wrapper">
                <img src="/images/everyday-edit.png" alt="Necklaces" className="category-img" />
              </div>
              <h3 className="category-name">Necklaces</h3>
            </div>

            <div className="category-card">
              <div className="category-img-wrapper">
                <img src="/images/crafted-rings.png" alt="Rings" className="category-img" />
              </div>
              <h3 className="category-name">Rings</h3>
            </div>

            <div className="category-card">
              <div className="category-img-wrapper">
                <img src="/images/vermeil-1.png" alt="Bracelets" className="category-img" />
              </div>
              <h3 className="category-name">Bracelets</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section-padding">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-label">Customer Favorites</span>
              <h2 className="section-title">Best Sellers</h2>
            </div>
            <a href="#all-best-sellers" className="section-link">Shop All</a>
          </div>

          <div className="products-grid">
            {BEST_SELLERS.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-img-wrapper">
                  <span className={`product-tag ${product.tag.toLowerCase() === 'new' ? 'new' : ''}`}>
                    {product.tag}
                  </span>
                  <img src={product.image} alt={product.name} className="product-img" />
                  <button className="product-action-btn" onClick={() => addToCart(product)}>
                    Add To Cart
                  </button>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <span className="product-price">${product.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial: Crafted with Intention */}
      <section id="about" className="editorial-split-section">
        <div className="editorial-text-block">
          <span className="section-label">Our Philosophy</span>
          <h2 className="section-title">Crafted With Intention</h2>
          <p className="editorial-desc">
            We believe that fine jewelry shouldn’t come at the cost of our planet. Every single DAIORUS piece is handcrafted using recycled 18k gold and conflict-free, ethically sourced gemstones. Designed to last a lifetime, loved forever.
          </p>
          <a href="#about" className="editorial-btn">
            Read Our Story
          </a>
        </div>
        <div className="editorial-img-block">
          <img
            src="/images/crafted-rings.png"
            alt="Intricate jewelry craftsmanship details"
            className="editorial-img"
          />
        </div>
      </section>

      {/* Editorial: Gold Vermeil Collection */}
      <section className="section-padding bg-warm">
        <div className="section-container">
          <div className="vermeil-split-section">
            <div className="vermeil-images-grid">
              <div className="vermeil-grid-img-wrapper">
                <img src="/images/vermeil-1.png" alt="Vermeil Detail 1" className="vermeil-grid-img" />
              </div>
              <div className="vermeil-grid-img-wrapper">
                <img src="/images/everyday-edit.png" alt="Vermeil Detail 2" className="vermeil-grid-img" />
              </div>
            </div>
            
            <div className="vermeil-text-block">
              <span className="section-label">New Season</span>
              <h2 className="section-title">The Gold Vermeil Collection</h2>
              <p className="vermeil-desc">
                Discover our signature vermeil line. A thick layer of 18k solid gold plated over sterling silver gives you the exceptional weight, feel, and radiance of pure gold at an accessible price.
              </p>
              <a href="#vermeil" className="vermeil-btn">
                Shop The Collection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Grid */}
      <section className="section-padding">
        <div className="section-container">
          <div className="instagram-header">
            <span className="section-label">Social Space</span>
            <h2 className="section-title">Follow Us @daiorus</h2>
          </div>
          
          <div className="instagram-grid">
            {[
              '/images/everyday-edit.png',
              '/images/crafted-rings.png',
              '/images/just-married.png',
              '/images/fine-gold.png',
              '/images/vermeil-1.png',
              '/images/hero-necklace.png',
            ].map((imgSrc, idx) => (
              <div key={idx} className="instagram-card">
                <img src={imgSrc} alt={`Instagram styling inspiration ${idx + 1}`} className="instagram-img" />
                <div className="instagram-overlay">
                  <svg className="instagram-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Value Props */}
      <section className="props-banner">
        <div className="section-container">
          <div className="props-grid">
            <div className="prop-item">
              <svg className="prop-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4l3 3"></path>
              </svg>
              <h4 className="prop-title">Lifetime Warranty</h4>
              <p className="prop-desc">We guarantee the craftsmanship of our items with a lifetime warranty.</p>
            </div>
            
            <div className="prop-item">
              <svg className="prop-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <h4 className="prop-title">Ethically Sourced</h4>
              <p className="prop-desc">We only use conflict-free diamonds and responsibly mined gold.</p>
            </div>

            <div className="prop-item">
              <svg className="prop-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <h4 className="prop-title">Exquisite Packaging</h4>
              <p className="prop-desc">Every piece arrives beautifully wrapped in our signature luxury boxes.</p>
            </div>

            <div className="prop-item">
              <svg className="prop-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <h4 className="prop-title">Crafted with Love</h4>
              <p className="prop-desc">Designed in-house and hand-finished by master jewelry artisans.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <h2 className="newsletter-title serif">Join The Inner Circle</h2>
          <p className="newsletter-desc">
            Subscribe to receive priority access to new collections, exclusive capsule drops, and custom design inspiration.
          </p>
          
          {subscribed ? (
            <p style={{ color: 'var(--gold)', fontWeight: '500', fontSize: '1.1rem' }}>
              Thank you for subscribing! Check your inbox soon.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
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

      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="/" className="footer-logo" aria-label="DAIORUS Home">
                <img src="/images/daiorus-mark.png" alt="" className="footer-logo-mark" />
                <span className="footer-logo-wordmark">DAIORUS</span>
              </a>
              <p className="footer-brand-desc">
                Creating luxurious, modern heirlooms that capture life’s beauty while respecting the earth. Designed with integrity, crafted with love.
              </p>
              <div className="social-links">
                <a href="#instagram" className="social-link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#facebook" className="social-link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#pinterest" className="social-link" aria-label="Pinterest">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 22a9 9 0 0 1-2.36-1.04C5.16 20.31 4 19 4 17c0-2.34 2.11-4 4.5-4h.5c.78 0 1.5.3 2 .8.5-.5 1.22-.8 2-.8h.5c2.39 0 4.5 1.66 4.5 4 0 2-1.16 3.31-2.14 3.96A9 9 0 0 1 16 22"></path>
                    <line x1="12" y1="13" x2="12" y2="22"></line>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="footer-column-title">Shop</h3>
              <ul className="footer-links-list">
                <li className="footer-link-item"><a href="#shop-all">All Jewelry</a></li>
                <li className="footer-link-item"><a href="#rings">Rings</a></li>
                <li className="footer-link-item"><a href="#necklaces">Necklaces</a></li>
                <li className="footer-link-item"><a href="#earrings">Earrings</a></li>
                <li className="footer-link-item"><a href="#bracelets">Bracelets</a></li>
              </ul>
            </div>

            <div>
              <h3 className="footer-column-title">About</h3>
              <ul className="footer-links-list">
                <li className="footer-link-item"><a href="#story">Our Story</a></li>
                <li className="footer-link-item"><a href="#sustainability">Sustainability</a></li>
                <li className="footer-link-item"><a href="#materials">Materials Care</a></li>
                <li className="footer-link-item"><a href="#journal">Journal</a></li>
              </ul>
            </div>

            <div>
              <h3 className="footer-column-title">Support</h3>
              <ul className="footer-links-list">
                <li className="footer-link-item"><a href="#contact">Contact Us</a></li>
                <li className="footer-link-item"><a href="#shipping">Shipping & Returns</a></li>
                <li className="footer-link-item"><a href="#faqs">FAQs</a></li>
                <li className="footer-link-item"><a href="#sizing">Sizing Guide</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© 2026 DAIORUS. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#privacy" className="footer-bottom-link">Privacy Policy</a>
              <a href="#terms" className="footer-bottom-link">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

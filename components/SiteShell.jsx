'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORIES, COLLECTIONS } from '../lib/data';
import { calculateCartTotals } from '../lib/checkout';
import { openRazorpayCheckout } from '../lib/razorpay-checkout';
import { DEFAULT_ANNOUNCE } from '../lib/site-content-defaults';
import { useCurrency } from './CurrencyProvider';
import LoginDrawer from './LoginDrawer';
import { CartProvider } from './CartProvider';
import { useAuth } from './AuthProvider';

export default function SiteShell({
  children,
  showNewsletter = true,
  headerOverlay = false,
  announce: announceProp = null,
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { formatPrice, currencyCode, countryName, loading: currencyLoading, isLocalCurrency } =
    useCurrency();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announce, setAnnounce] = useState(announceProp || DEFAULT_ANNOUNCE);
  const searchCloseTimer = useRef(null);
  const catCloseTimer = useRef(null);

  useEffect(() => {
    if (announceProp) {
      setAnnounce(announceProp);
      return undefined;
    }

    let cancelled = false;
    fetch('/api/site-content/announce')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.announce) setAnnounce(data.announce);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [announceProp]);

  const openAccount = () => {
    if (authLoading) return;
    if (user) {
      router.push('/account/profile');
      return;
    }
    setIsAuthOpen(true);
  };

  const openWishlist = () => {
    if (authLoading) return;
    if (user) {
      router.push('/account/wishlist');
      return;
    }
    setIsAuthOpen(true);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === '1') {
      setIsAuthOpen(true);
      params.delete('login');
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', next);
    }
  }, []);

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
  const { shippingInr, totalInr } = calculateCartTotals(cart);

  const handleCheckout = async () => {
    if (cart.length === 0 || isCheckingOut) return;

    const emailToUse = checkoutEmail.trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      setCheckoutError('Please enter a valid email to continue.');
      return;
    }

    setCheckoutError('');
    setIsCheckingOut(true);

    try {
      const createRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            image: item.image,
            material: item.material,
          })),
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || 'Could not start checkout');
      }

      await openRazorpayCheckout({
        keyId: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        orderId: createData.orderId,
        razorpayOrderId: createData.razorpayOrderId,
        email: emailToUse,
        orderNumber: createData.orderNumber,
        onSuccess: async (response) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: createData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            throw new Error(verifyData.error || 'Payment verification failed');
          }

          setCart([]);
          setIsCartOpen(false);
          router.push(`/checkout/success?order=${encodeURIComponent(verifyData.orderNumber)}`);
          return verifyData;
        },
        onDismiss: () => {
          setCheckoutError('Payment was cancelled.');
        },
      });
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        setCheckoutError(err.message || 'Checkout failed. Please try again.');
      }
    } finally {
      setIsCheckingOut(false);
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

  const toggleSearch = () => {
    if (searchCloseTimer.current) clearTimeout(searchCloseTimer.current);
    setIsMobileMenuOpen(false);
    setIsSearchOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const headerClassName = [
    'ui1-header',
    headerOverlay && 'is-overlay',
    isScrolled && 'is-scrolled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={[
        'site-shell',
        headerOverlay && 'has-header-overlay',
        isScrolled && 'is-scrolled',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="announce-bar">
        <p className="announce-bar-text">
          {announce.prefix}
          <Link href={announce.linkUrl || '/shop'} className="announce-accent">
            {announce.linkText}
          </Link>
          {announce.suffix}
        </p>
      </div>

      <div className="announce-spacer" aria-hidden="true" />

      <header className={headerClassName}>
        <div className="ui1-header-inner">
          <nav className="ui1-nav-left ui1-nav-desktop">
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

          <div className="ui1-nav-mobile-left">
            <button
              type="button"
              className="icon-btn mobile-menu-btn"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Search"
              aria-expanded={isSearchOpen}
              onClick={toggleSearch}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          <Link href="/" className="logo" aria-label="DAIORUS Home">
            <img src="/images/daiorus-mark.png" alt="" className="logo-mark" />
            <span className="logo-wordmark">DAIORUS</span>
          </Link>

          <div className="ui1-nav-right ui1-nav-desktop">
            {!currencyLoading && (
              <span className="header-locale" title={`Prices shown in ${currencyCode} for ${countryName}`}>
                {currencyCode}
              </span>
            )}
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

            <button type="button" className="icon-btn" aria-label="Wishlist" onClick={openWishlist}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <button
              type="button"
              className="icon-btn"
              aria-label="Account"
              onClick={openAccount}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>

          <div className="ui1-nav-mobile-right">
            <button
              type="button"
              className="icon-btn"
              aria-label="Account"
              onClick={() => {
                closeMobileMenu();
                openAccount();
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`} aria-hidden={!isMobileMenuOpen}>
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">Menu</span>
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={closeMobileMenu}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <nav className="mobile-nav-links">
            <Link href="/shop" className="mobile-nav-link" onClick={closeMobileMenu}>
              Shop All
            </Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={cat.href} className="mobile-nav-link" onClick={closeMobileMenu}>
                {cat.name}
              </Link>
            ))}
            <Link href="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
              About
            </Link>
            <Link href="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>
              Contact
            </Link>
          </nav>
          <div className="mobile-nav-actions">
            <button
              type="button"
              className="mobile-nav-action"
              onClick={() => {
                closeMobileMenu();
                setIsCartOpen(true);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Cart{totalItems > 0 ? ` (${totalItems})` : ''}
            </button>
            {!currencyLoading && (
              <span className="mobile-nav-currency">{currencyCode} · {countryName}</span>
            )}
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

      <button
        type="button"
        className={`cart-fab ${isCartOpen ? 'is-hidden' : ''}`}
        aria-label={totalItems > 0 ? `Cart, ${totalItems} items` : 'Cart'}
        onClick={() => setIsCartOpen(true)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {totalItems > 0 && <span className="cart-fab-badge">{totalItems > 99 ? '99+' : totalItems}</span>}
      </button>

      <LoginDrawer open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

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
                        <span className="cart-item-price">{formatPrice(item.price * item.qty)}</span>
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
              <label className="checkout-email-label" htmlFor="checkout-email">
                Email for order confirmation
              </label>
              <input
                id="checkout-email"
                type="email"
                className="checkout-email-input"
                placeholder="you@example.com"
                value={checkoutEmail}
                onChange={(e) => {
                  setCheckoutEmail(e.target.value);
                  if (checkoutError) setCheckoutError('');
                }}
                disabled={isCheckingOut}
              />
              <div className="cart-subtotal-row">
                <span className="subtotal-label">Subtotal</span>
                <span className="subtotal-value">{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-subtotal-row">
                <span className="subtotal-label">Shipping</span>
                <span className="subtotal-value">
                  {shippingInr === 0 ? 'Free' : formatPrice(shippingInr)}
                </span>
              </div>
              <div className="cart-subtotal-row cart-total-row">
                <span className="subtotal-label">Total</span>
                <span className="subtotal-value">{formatPrice(totalInr)}</span>
              </div>
              {!isLocalCurrency && (
                <p className="checkout-currency-note">
                  You will be charged in INR at checkout via Razorpay.
                </p>
              )}
              {checkoutError && <p className="checkout-error">{checkoutError}</p>}
              <button
                type="button"
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Processing…' : 'Pay with Razorpay'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="header-spacer" aria-hidden="true" />

      <main className="site-main">
        <CartProvider value={{ addToCart }}>
          {typeof children === 'function' ? children({ addToCart }) : children}
        </CartProvider>
      </main>

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

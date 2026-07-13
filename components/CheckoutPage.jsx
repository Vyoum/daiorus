'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteShell from './SiteShell';
import { useCart } from './CartProvider';
import { useAuth } from './AuthProvider';
import { useCurrency } from './CurrencyProvider';
import { calculateCartTotals } from '../lib/checkout';
import { applyCouponToTotals, normalizeCouponCode } from '../lib/coupons';
import { openRazorpayCheckout } from '../lib/razorpay-checkout';
import styles from './CheckoutPage.module.css';

const EMPTY_SHIPPING = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'IN',
  saveAddress: true,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, ready, clearCart } = useCart();
  const {
    formatPrice,
    countryCode,
    currencyCode,
    isLocalCurrency,
  } = useCurrency();

  const [email, setEmail] = useState('');
  const [shipping, setShipping] = useState(EMPTY_SHIPPING);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [error, setError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail((prev) => prev || user.email);
    }
    const name =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      '';
    if (name) {
      setShipping((prev) => ({ ...prev, fullName: prev.fullName || name }));
    }
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    if (cart.length === 0) {
      router.replace('/shop');
    }
  }, [ready, cart.length, router]);

  const pricedItems = useMemo(
    () =>
      cart.map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 0,
      })),
    [cart],
  );

  const baseTotals = useMemo(() => calculateCartTotals(pricedItems), [pricedItems]);

  const couponResult = useMemo(
    () =>
      applyCouponToTotals({
        subtotalInr: baseTotals.subtotalInr,
        shippingInr: baseTotals.shippingInr,
        couponCode: appliedCoupon?.code,
      }),
    [baseTotals, appliedCoupon],
  );

  const totals = useMemo(
    () =>
      calculateCartTotals(pricedItems, {
        discountInr: couponResult.discountInr,
      }),
    [pricedItems, couponResult.discountInr],
  );

  const updateShipping = (key, value) => {
    setShipping((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const applyCoupon = () => {
    const code = normalizeCouponCode(couponInput);
    if (!code) {
      setCouponMessage('Enter a coupon code.');
      setAppliedCoupon(null);
      return;
    }

    const result = applyCouponToTotals({
      subtotalInr: baseTotals.subtotalInr,
      shippingInr: baseTotals.shippingInr,
      couponCode: code,
    });

    if (!result.valid) {
      setAppliedCoupon(null);
      setCouponMessage('This coupon code is not valid.');
      return;
    }

    setAppliedCoupon(result.coupon);
    setCouponMessage(`${result.coupon.label} applied.`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMessage('');
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (isCheckingOut || cart.length === 0) return;

    const emailToUse = email.trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }

    const required = ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'];
    if (required.some((key) => !String(shipping[key] || '').trim())) {
      setError('Please complete your phone number and delivery address.');
      return;
    }

    setError('');
    setIsCheckingOut(true);

    try {
      const createRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          countryCode: countryCode || shipping.country || 'IN',
          currencyCode: currencyCode || 'INR',
          couponCode: appliedCoupon?.code || null,
          shippingAddress: {
            ...shipping,
            country: shipping.country || countryCode || 'IN',
          },
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

          clearCart();
          router.push(`/checkout/success?order=${encodeURIComponent(verifyData.orderNumber)}`);
          return verifyData;
        },
        onDismiss: () => {
          setError('Payment was cancelled.');
        },
      });
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        setError(err.message || 'Checkout failed. Please try again.');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!ready || cart.length === 0) {
    return (
      <SiteShell showNewsletter={false}>
        <div className={styles.loading}>Preparing checkout…</div>
      </SiteShell>
    );
  }

  return (
    <SiteShell showNewsletter={false}>
      <section className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <span className={styles.kicker}>Secure checkout</span>
            <h1 className={styles.title}>Delivery details</h1>
            <p className={styles.lead}>
              Share your phone and shipping address, then review your total before payment.
            </p>
          </header>

          <div className={styles.layout}>
            <form className={styles.formCard} onSubmit={handleCheckout} id="checkout-form">
              <div className={styles.grid}>
                <label className={`${styles.field} ${styles.full}`}>
                  <span>Full name</span>
                  <input
                    value={shipping.fullName}
                    onChange={(e) => updateShipping('fullName', e.target.value)}
                    autoComplete="name"
                    required
                    disabled={isCheckingOut}
                  />
                </label>
                <label className={styles.field}>
                  <span>Phone number</span>
                  <input
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) => updateShipping('phone', e.target.value)}
                    autoComplete="tel"
                    required
                    disabled={isCheckingOut}
                  />
                </label>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="email"
                    required
                    disabled={isCheckingOut}
                  />
                </label>
                <label className={`${styles.field} ${styles.full}`}>
                  <span>Address line 1</span>
                  <input
                    value={shipping.line1}
                    onChange={(e) => updateShipping('line1', e.target.value)}
                    autoComplete="address-line1"
                    required
                    disabled={isCheckingOut}
                  />
                </label>
                <label className={`${styles.field} ${styles.full}`}>
                  <span>
                    Address line 2 <em>(optional)</em>
                  </span>
                  <input
                    value={shipping.line2}
                    onChange={(e) => updateShipping('line2', e.target.value)}
                    autoComplete="address-line2"
                    disabled={isCheckingOut}
                  />
                </label>
                <label className={styles.field}>
                  <span>City</span>
                  <input
                    value={shipping.city}
                    onChange={(e) => updateShipping('city', e.target.value)}
                    autoComplete="address-level2"
                    required
                    disabled={isCheckingOut}
                  />
                </label>
                <label className={styles.field}>
                  <span>State</span>
                  <input
                    value={shipping.state}
                    onChange={(e) => updateShipping('state', e.target.value)}
                    autoComplete="address-level1"
                    required
                    disabled={isCheckingOut}
                  />
                </label>
                <label className={styles.field}>
                  <span>Postal code</span>
                  <input
                    value={shipping.postalCode}
                    onChange={(e) => updateShipping('postalCode', e.target.value)}
                    autoComplete="postal-code"
                    required
                    disabled={isCheckingOut}
                  />
                </label>
                <label className={styles.field}>
                  <span>Country code</span>
                  <input
                    value={shipping.country}
                    onChange={(e) => updateShipping('country', e.target.value.toUpperCase())}
                    maxLength={2}
                    autoComplete="country"
                    required
                    disabled={isCheckingOut}
                  />
                </label>
              </div>

              {user ? (
                <label className={styles.saveAddress}>
                  <input
                    type="checkbox"
                    checked={shipping.saveAddress}
                    onChange={(e) => updateShipping('saveAddress', e.target.checked)}
                    disabled={isCheckingOut}
                  />
                  Save this address to my account
                </label>
              ) : null}

              {error ? <p className={styles.error}>{error}</p> : null}

              <div className={styles.formActions}>
                <Link href="/shop" className={styles.backLink}>
                  Continue shopping
                </Link>
                <button type="submit" className={styles.payBtn} disabled={isCheckingOut}>
                  {isCheckingOut ? 'Processing…' : 'Checkout'}
                </button>
              </div>
            </form>

            <aside className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order summary</h2>

              <ul className={styles.itemList}>
                {cart.map((item) => (
                  <li key={item.id} className={styles.item}>
                    {item.image ? (
                      <img src={item.image} alt="" className={styles.itemImg} />
                    ) : (
                      <div className={styles.itemImgPlaceholder} />
                    )}
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemMeta}>Qty {item.qty}</p>
                    </div>
                    <span className={styles.itemPrice}>
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className={styles.couponBox}>
                <label className={styles.couponLabel} htmlFor="coupon-code">
                  Coupon code
                </label>
                <div className={styles.couponRow}>
                  <input
                    id="coupon-code"
                    className={styles.couponInput}
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponMessage('');
                    }}
                    placeholder="Enter code"
                    disabled={isCheckingOut || Boolean(appliedCoupon)}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      className={styles.couponBtn}
                      onClick={removeCoupon}
                      disabled={isCheckingOut}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.couponBtn}
                      onClick={applyCoupon}
                      disabled={isCheckingOut}
                    >
                      Apply
                    </button>
                  )}
                </div>
                {couponMessage ? (
                  <p
                    className={`${styles.couponMessage} ${
                      appliedCoupon ? styles.couponOk : styles.couponBad
                    }`}
                  >
                    {couponMessage}
                  </p>
                ) : (
                  <p className={styles.couponHint}>Try DAIORUS10 or WELCOME500</p>
                )}
              </div>

              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(totals.subtotalInr)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Shipping</span>
                  <span>{totals.shippingInr === 0 ? 'Free' : formatPrice(totals.shippingInr)}</span>
                </div>
                {totals.discountInr > 0 ? (
                  <div className={`${styles.totalRow} ${styles.discountRow}`}>
                    <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ''}</span>
                    <span>-{formatPrice(totals.discountInr)}</span>
                  </div>
                ) : null}
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Total</span>
                  <span>{formatPrice(totals.totalInr)}</span>
                </div>
              </div>

              {!isLocalCurrency ? (
                <p className={styles.currencyNote}>
                  Charged in INR via Razorpay. Display prices include any regional surcharge.
                </p>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

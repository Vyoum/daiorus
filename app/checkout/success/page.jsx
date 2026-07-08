import Link from 'next/link';
import SiteShell from '../../../components/SiteShell';

export const metadata = {
  title: 'Order Confirmed | DAIORUS',
};

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const orderNumber = params?.order || null;

  return (
    <SiteShell showNewsletter={false}>
      <section className="checkout-success">
        <div className="checkout-success-inner">
          <span className="checkout-success-icon" aria-hidden="true">
            ✓
          </span>
          <h1 className="checkout-success-title">Thank you for your order</h1>
          <p className="checkout-success-text">
            Your payment was successful. We&apos;ll send a confirmation to your email shortly.
          </p>
          {orderNumber && (
            <p className="checkout-success-order">
              Order number: <strong>{orderNumber}</strong>
            </p>
          )}
          <div className="checkout-success-actions">
            <Link href="/shop" className="btn-primary">
              Continue Shopping
            </Link>
            <Link href="/" className="btn-outline-dark">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

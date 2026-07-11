import Link from 'next/link';
import SiteShell from '../../../components/SiteShell';
import prisma from '../../../lib/prisma';
import { formatINR } from '../../../lib/data';
import { formatOrderDate, maskPaymentRef } from '../../../lib/orders';

export const metadata = {
  title: 'Order Confirmed | DAIORUS',
  description: 'Your DAIORUS order has been confirmed.',
};

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const orderNumber = typeof params?.order === 'string' ? params.order : null;

  const order = orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: true,
        },
      })
    : null;

  const email = order?.guestEmail || null;
  const orderDate = order ? formatOrderDate(order.createdAt) : null;

  return (
    <SiteShell showNewsletter={false}>
      <section className="order-confirm">
        <div className="order-confirm-inner">
          <header className="order-confirm-header">
            <div className="order-confirm-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <span className="section-label">Order Confirmed</span>
            <h1 className="order-confirm-title">Thank You</h1>
            <p className="order-confirm-lead">
              {email ? (
                <>
                  Your payment was successful. A confirmation email will be sent to{' '}
                  <strong>{email}</strong> shortly.
                </>
              ) : (
                'Your payment was successful. We&apos;ll send a confirmation to your email shortly.'
              )}
            </p>
          </header>

          {order ? (
            <div className="order-confirm-card">
              <div className="order-confirm-meta">
                <div className="order-confirm-meta-item">
                  <span className="order-confirm-meta-label">Order Number</span>
                  <span className="order-confirm-meta-value">{order.orderNumber}</span>
                </div>
                <div className="order-confirm-meta-item">
                  <span className="order-confirm-meta-label">Date</span>
                  <span className="order-confirm-meta-value">{orderDate}</span>
                </div>
                <div className="order-confirm-meta-item">
                  <span className="order-confirm-meta-label">Payment</span>
                  <span className="order-confirm-meta-value">
                    Paid · Razorpay {maskPaymentRef(order.paymentRef)}
                  </span>
                </div>
              </div>

              <div className="order-confirm-divider" />

              <div className="order-confirm-items">
                <h2 className="order-confirm-items-title">Your Order</h2>
                <ul className="order-confirm-items-list">
                  {order.items.map((item) => (
                    <li key={item.id} className="order-confirm-item">
                      <div className="order-confirm-item-img-wrap">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="order-confirm-item-img"
                          />
                        ) : (
                          <div className="order-confirm-item-img order-confirm-item-img--placeholder" />
                        )}
                      </div>
                      <div className="order-confirm-item-details">
                        <h3 className="order-confirm-item-name">{item.productName}</h3>
                        {item.material && (
                          <p className="order-confirm-item-material">{item.material}</p>
                        )}
                        <p className="order-confirm-item-qty">Qty {item.quantity}</p>
                      </div>
                      <span className="order-confirm-item-price">
                        {formatINR(item.lineTotalInr)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-confirm-divider" />

              <div className="order-confirm-totals">
                <div className="order-confirm-total-row">
                  <span>Subtotal</span>
                  <span>{formatINR(order.subtotalInr)}</span>
                </div>
                <div className="order-confirm-total-row">
                  <span>Shipping</span>
                  <span>
                    {order.shippingInr === 0 ? 'Free' : formatINR(order.shippingInr)}
                  </span>
                </div>
                <div className="order-confirm-total-row order-confirm-total-row--grand">
                  <span>Total Paid</span>
                  <span>{formatINR(order.totalInr)}</span>
                </div>
              </div>
            </div>
          ) : orderNumber ? (
            <div className="order-confirm-card order-confirm-card--compact">
              <p className="order-confirm-lead">
                Order <strong>{orderNumber}</strong> is being processed. If you don&apos;t
                receive a confirmation email within a few minutes, please contact us.
              </p>
            </div>
          ) : null}

          <div className="order-confirm-actions">
            <Link href="/shop" className="btn-primary order-confirm-btn">
              Continue Shopping
            </Link>
            <Link href="/contact" className="order-confirm-help-link">
              Need help with your order?
            </Link>
          </div>

          <div className="order-confirm-trust">
            <div className="order-confirm-trust-item">
              <span className="order-confirm-trust-label">Free Shipping</span>
              <span className="order-confirm-trust-text">On orders above ₹2,000</span>
            </div>
            <div className="order-confirm-trust-item">
              <span className="order-confirm-trust-label">30-Day Returns</span>
              <span className="order-confirm-trust-text">Hassle-free exchanges</span>
            </div>
            <div className="order-confirm-trust-item">
              <span className="order-confirm-trust-label">BIS Hallmarked</span>
              <span className="order-confirm-trust-text">Certified authentic gold</span>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

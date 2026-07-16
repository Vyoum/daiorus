import Link from 'next/link';
import SiteShell from '../../../components/SiteShell';
import prisma from '../../../lib/prisma';
import { formatINR } from '../../../lib/data';
import { formatOrderDate } from '../../../lib/orders';

export const metadata = {
  title: 'Order Confirmed | DAIORUS',
  description: 'Your DAIORUS order has been confirmed.',
};

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const orderNumber = typeof params?.order === 'string' ? params.order : null;

  const order = orderNumber
    ? await prisma.order.findFirst({
        where: {
          orderNumber,
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
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
        <div className="order-confirm-watermark" aria-hidden="true">
          Daiorus
        </div>
        <div className="order-confirm-inner">
          <header className="order-confirm-header">
            <div className="order-confirm-icon" aria-hidden="true">
              <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
                <path
                  d="M1.5 7.5L7 13L18.5 1.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="order-confirm-title">Thank You.</h1>
            <p className="order-confirm-lead">
              {email ? (
                <>
                  Your order has been placed successfully. A confirmation email has been
                  sent to <strong>{email}</strong>.
                </>
              ) : (
                'Your order has been placed successfully. A confirmation email has been sent to your inbox.'
              )}
            </p>
          </header>

          {order ? (
            <div className="order-confirm-card">
              <div className="order-confirm-meta">
                <div className="order-confirm-meta-item">
                  <span className="order-confirm-meta-label">Order Number</span>
                  <span className="order-confirm-meta-value order-confirm-meta-value--order">
                    #{order.orderNumber}
                  </span>
                </div>
                <div className="order-confirm-meta-item order-confirm-meta-item--end">
                  <span className="order-confirm-meta-label">Date</span>
                  <span className="order-confirm-meta-value">{orderDate}</span>
                </div>
              </div>

              <div className="order-confirm-items">
                <ul className="order-confirm-items-list">
                  {order.items.map((item, index) => (
                    <li key={item.id}>
                      {index > 0 && <div className="order-confirm-item-divider" />}
                      <div className="order-confirm-item">
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
                          {item.quantity > 1 && (
                            <p className="order-confirm-item-qty">Qty {item.quantity}</p>
                          )}
                        </div>
                        <span className="order-confirm-item-price">
                          {formatINR(item.lineTotalInr)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-confirm-totals">
                <div className="order-confirm-total-row">
                  <span>Subtotal</span>
                  <span>{formatINR(order.subtotalInr)}</span>
                </div>
                <div className="order-confirm-total-row">
                  <span>
                    {order.shippingInr === 0 ? 'Complimentary Shipping' : 'Shipping'}
                  </span>
                  <span>
                    {order.shippingInr === 0 ? formatINR(0) : formatINR(order.shippingInr)}
                  </span>
                </div>
                <div className="order-confirm-total-row order-confirm-total-row--grand">
                  <span>Total</span>
                  <span>{formatINR(order.totalInr)}</span>
                </div>
              </div>
            </div>
          ) : orderNumber ? (
            <div className="order-confirm-card order-confirm-card--compact">
              <div className="order-confirm-meta">
                <div className="order-confirm-meta-item">
                  <span className="order-confirm-meta-label">Order Number</span>
                  <span className="order-confirm-meta-value order-confirm-meta-value--order">
                    #{orderNumber}
                  </span>
                </div>
              </div>
              <p className="order-confirm-lead order-confirm-lead--card">
                Your order is being processed. If you don&apos;t receive a confirmation
                email within a few minutes, please contact us.
              </p>
            </div>
          ) : (
            <div className="order-confirm-card order-confirm-card--compact">
              <p className="order-confirm-lead order-confirm-lead--card">
                Your payment was successful. We&apos;ll send a confirmation to your email
                shortly.
              </p>
            </div>
          )}

          <div className="order-confirm-actions">
            <Link href="/contact" className="btn-outline-dark order-confirm-btn">
              Track Order
            </Link>
            <Link href="/shop" className="order-confirm-btn order-confirm-btn--primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

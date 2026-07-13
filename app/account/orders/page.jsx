import Link from 'next/link';
import { getSessionUser } from '../../../lib/admin/auth';
import { getAccountOrders, orderStatusLabel } from '../../../lib/account/orders';
import { getUserReviewMap } from '../../../lib/reviews';
import { formatINR } from '../../../lib/data';
import { formatOrderDate } from '../../../lib/orders';
import WriteReviewButton from '../../../components/WriteReviewButton';
import styles from '../../../components/AccountOrders.module.css';

export const metadata = { title: 'Orders | DAIORUS' };

const REVIEWABLE = new Set(['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']);

export default async function AccountOrdersPage() {
  const session = await getSessionUser();
  const email = session.dbUser?.email || session.authUser?.email || '';
  const [orders, reviewMap] = await Promise.all([
    getAccountOrders({
      userId: session.dbUser?.id || null,
      email,
    }),
    getUserReviewMap(session.dbUser?.id || null),
  ]);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Orders</h1>
        <p className={styles.lead}>
          Track and review every piece you&apos;ve ordered with DAIORUS.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No orders yet</h2>
          <p className={styles.emptyText}>
            When you place an order, it will appear here in card form with status and item details.
          </p>
          <Link href="/shop" className={styles.emptyLink}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => {
            const status = orderStatusLabel(order.status);
            const canReview = REVIEWABLE.has(order.status);
            return (
              <article key={order.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.orderMeta}>
                    <h2 className={styles.orderNumber}>#{order.orderNumber}</h2>
                    <p className={styles.orderDate}>{formatOrderDate(order.createdAt)}</p>
                  </div>
                  <span className={`${styles.badge} ${styles[`tone_${status.tone}`]}`}>
                    {status.label}
                  </span>
                </div>

                <ul className={styles.items}>
                  {order.items.map((item) => {
                    const existing = item.productId ? reviewMap[item.productId] : null;
                    return (
                      <li key={item.id} className={styles.item}>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className={styles.thumb}
                          />
                        ) : (
                          <div className={styles.thumbPlaceholder} aria-hidden="true" />
                        )}
                        <div className={styles.itemMain}>
                          <p className={styles.itemName}>{item.productName}</p>
                          <p className={styles.itemMeta}>
                            {[item.material, item.quantity > 1 ? `Qty ${item.quantity}` : null]
                              .filter(Boolean)
                              .join(' · ') || '—'}
                          </p>
                          {canReview && item.productId ? (
                            <div className={styles.itemActions}>
                              <WriteReviewButton
                                productId={item.productId}
                                productName={item.productName}
                                existingRating={existing?.rating || null}
                              />
                            </div>
                          ) : null}
                        </div>
                        <span className={styles.itemPrice}>{formatINR(item.lineTotalInr)}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className={styles.cardFooter}>
                  <div>
                    <div className={styles.totalLabel}>Order total</div>
                    <div className={styles.totalValue}>{formatINR(order.totalInr)}</div>
                  </div>
                  <Link
                    href={`/checkout/success?order=${encodeURIComponent(order.orderNumber)}`}
                    className={styles.viewLink}
                  >
                    View details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '../../../../lib/admin/auth';
import {
  getAccountOrderByNumber,
  getShippingFromOrder,
  orderStatusLabel,
} from '../../../../lib/account/orders';
import { formatINR } from '../../../../lib/data';
import { formatOrderDate } from '../../../../lib/orders';
import styles from '../../../../components/AccountOrders.module.css';

export async function generateMetadata({ params }) {
  const { orderNumber } = await params;
  return {
    title: orderNumber ? `Order #${orderNumber} | DAIORUS` : 'Order | DAIORUS',
  };
}

export default async function AccountOrderDetailPage({ params }) {
  const { orderNumber: rawOrderNumber } = await params;
  const orderNumber = decodeURIComponent(String(rawOrderNumber || '').trim());
  if (!orderNumber) notFound();

  const session = await getSessionUser();
  const email = session.dbUser?.email || session.authUser?.email || '';
  const order = await getAccountOrderByNumber({
    orderNumber,
    userId: session.dbUser?.id || null,
    email,
  });

  if (!order) {
    redirect('/account/orders');
  }

  const status = orderStatusLabel(order.status);
  const shipping = getShippingFromOrder(order);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Link href="/account/orders" className={styles.backLink}>
          ← Back to orders
        </Link>
        <div className={styles.detailTop}>
          <div>
            <h1 className={styles.title}>Order #{order.orderNumber}</h1>
            <p className={styles.lead}>Placed on {formatOrderDate(order.createdAt)}</p>
          </div>
          <span className={`${styles.badge} ${styles[`tone_${status.tone}`]}`}>
            {status.label}
          </span>
        </div>
      </header>

      <article className={styles.card}>
        <h2 className={styles.sectionTitle}>Items</h2>
        <ul className={styles.items}>
          {order.items.map((item) => (
            <li key={item.id} className={styles.item}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className={styles.thumb} />
              ) : (
                <div className={styles.thumbPlaceholder} aria-hidden="true" />
              )}
              <div className={styles.itemMain}>
                <p className={styles.itemName}>{item.productName}</p>
                <p className={styles.itemMeta}>
                  {[
                    item.material,
                    `Qty ${item.quantity}`,
                    formatINR(item.unitPriceInr) + ' each',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <span className={styles.itemPrice}>{formatINR(item.lineTotalInr)}</span>
            </li>
          ))}
        </ul>

        <div className={styles.detailTotals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{formatINR(order.subtotalInr)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>{order.shippingInr === 0 ? 'Complimentary shipping' : 'Shipping'}</span>
            <span>{formatINR(order.shippingInr)}</span>
          </div>
          {order.discountInr > 0 ? (
            <div className={styles.totalRow}>
              <span>Discount</span>
              <span>−{formatINR(order.discountInr)}</span>
            </div>
          ) : null}
          <div className={`${styles.totalRow} ${styles.totalRowGrand}`}>
            <span>Total</span>
            <span>{formatINR(order.totalInr)}</span>
          </div>
        </div>
      </article>

      {shipping ? (
        <article className={`${styles.card} ${styles.detailCard}`}>
          <h2 className={styles.sectionTitle}>Shipping address</h2>
          <div className={styles.addressBlock}>
            {shipping.fullName ? <p>{shipping.fullName}</p> : null}
            {shipping.phone ? <p>{shipping.phone}</p> : null}
            <p>{shipping.line1}</p>
            {shipping.line2 ? <p>{shipping.line2}</p> : null}
            <p>
              {shipping.city}, {shipping.state} {shipping.postalCode}
            </p>
            <p>{shipping.country}</p>
          </div>
        </article>
      ) : null}

      <div className={styles.detailActions}>
        <Link href="/contact" className={styles.secondaryLink}>
          Need help with this order?
        </Link>
        <Link href="/shop" className={styles.emptyLink}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

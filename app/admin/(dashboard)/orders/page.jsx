import {
  Download,
  ChevronDown,
  Printer,
  Truck,
  MoreHorizontal,
  RefreshCw,
  Check,
  Undo2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getAdminOrders } from '../../../../lib/admin/orders';
import {
  formatDate,
  formatTime,
  formatINR,
  initials,
  paymentLabel,
  fulfillmentLabel,
} from '../../../../lib/admin/format';
import styles from './orders.module.css';

function FulfillIcon({ tone }) {
  if (tone === 'delivered') return <Check size={14} className={`${styles.fulfillIcon} ${styles.delivered}`} />;
  if (tone === 'processing') return <RefreshCw size={14} className={styles.fulfillIcon} />;
  if (tone === 'refunded') return <Undo2 size={12} className={styles.fulfillIcon} style={{ marginRight: 4 }} />;
  return (
    <span
      className={`${styles.paymentDot} ${styles.paid}`}
      style={{ backgroundColor: 'var(--admin-danger)' }}
    />
  );
}

export default async function OrdersPage() {
  const { orders, total } = await getAdminOrders();

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSubtitle}>Manage, filter, and track customer purchases.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryBtn}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <div className={styles.filterContainer}>
          <div className={styles.filterGroup}>
            <button type="button" className={`${styles.dropdownBtn} ${styles.activeFilter}`}>
              All Time <ChevronDown size={14} />
            </button>
          </div>

          <div className={styles.bulkActions}>
            <button type="button" className={styles.bulkActionBtn}>
              <Printer size={16} />
              Print Invoices
            </button>
            <button type="button" className={styles.bulkActionBtn}>
              <Truck size={16} />
              Mark as Shipped
            </button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{ width: 40 }}>
                <input type="checkbox" className={styles.checkbox} aria-label="Select all" />
              </th>
              <th className={styles.th}>Order</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Customer</th>
              <th className={styles.th}>Product</th>
              <th className={styles.th}>Total</th>
              <th className={styles.th}>Payment</th>
              <th className={styles.th}>Fulfillment</th>
              <th className={styles.th} />
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr className={styles.tr}>
                <td className={styles.td} colSpan={9} style={{ textAlign: 'center', padding: 40 }}>
                  No orders yet. Paid checkouts will appear here.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const payment = paymentLabel(order.status);
                const fulfill = fulfillmentLabel(order.status);
                return (
                  <tr key={order.id} className={styles.tr}>
                    <td className={styles.td}>
                      <input type="checkbox" className={styles.checkbox} aria-label={`Select ${order.orderNumber}`} />
                    </td>
                    <td className={styles.td}>
                      <span className={styles.orderId}>{order.orderNumber}</span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.dateCell}>
                        <span className={styles.dateMain}>{formatDate(order.createdAt)}</span>
                        <span className={styles.dateSub}>{formatTime(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.customerCell}>
                        <div className={styles.customerAvatar}>{initials(order.customerName)}</div>
                        <div className={styles.customerInfo}>
                          <span className={styles.customerName}>{order.customerName}</span>
                          <span className={styles.customerEmail}>{order.customerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.productCell}>
                        {order.productImage ? (
                          <img src={order.productImage} alt="" className={styles.productImage} />
                        ) : (
                          <div className={styles.productImage} />
                        )}
                        <span className={styles.productName}>{order.productName}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.price}>{formatINR(order.totalInr)}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.paymentBadge}>
                        <span className={`${styles.paymentDot} ${styles[payment.tone] || styles.pending}`} />
                        {payment.label}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.fulfillBadge}>
                        <FulfillIcon tone={fulfill.tone} /> {fulfill.label}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <MoreHorizontal size={18} className={styles.moreBtn} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <span className={styles.paginationText}>
            Showing {orders.length === 0 ? 0 : 1} to {orders.length} of {total} orders
          </span>
          <div className={styles.paginationControls}>
            <button type="button" className={styles.pageBtn} disabled>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className={`${styles.pageBtn} ${styles.active}`}>
              1
            </button>
            <button type="button" className={styles.pageBtn} disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

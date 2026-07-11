import Link from 'next/link';
import { getDashboardStats } from '../../../lib/admin/stats';
import { getAdminOrders } from '../../../lib/admin/orders';
import { formatINR } from '../../../lib/admin/format';
import styles from '../dashboard.module.css';

export default async function AnalyticsPage() {
  const [stats, { orders, total }] = await Promise.all([getDashboardStats(), getAdminOrders({ take: 10 })]);

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageSubtitle}>Live snapshot from orders and catalogue data.</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Paid Revenue</span>
          </div>
          <span className={styles.statValue}>{formatINR(stats.totalRevenue)}</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Orders</span>
          </div>
          <span className={styles.statValue}>{total}</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Today</span>
          </div>
          <span className={styles.statValue}>{formatINR(stats.todaySales)}</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Returning</span>
          </div>
          <span className={styles.statValue}>{stats.returningPct}%</span>
        </div>
      </div>

      <div className={styles.chartCard} style={{ marginTop: 24 }}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>Recent Orders</h2>
          <Link href="/admin/orders" className={styles.secondaryBtn}>
            Open Orders
          </Link>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.length === 0 ? (
            <li style={{ color: 'var(--admin-text-secondary)' }}>No orders yet.</li>
          ) : (
            orders.map((order) => (
              <li
                key={order.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--admin-border, #ece8e1)',
                }}
              >
                <span>
                  <strong>{order.orderNumber}</strong> · {order.customerEmail}
                </span>
                <span>
                  {formatINR(order.totalInr)} · {order.status}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

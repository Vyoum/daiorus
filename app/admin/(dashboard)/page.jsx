import Link from 'next/link';
import {
  Globe,
  Banknote,
  ShoppingCart,
  ListOrdered,
  Clock,
  Box,
  AlertTriangle,
  Plane,
  RefreshCcw,
  MoreHorizontal,
  ShoppingBag,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { getDashboardStats } from '../../../lib/admin/stats';
import { formatINR, relativeTime } from '../../../lib/admin/format';
import styles from './dashboard.module.css';

function ActivityIcon({ type }) {
  if (type === 'stock') return <AlertTriangle size={14} color="var(--admin-warning)" />;
  if (type === 'customer') return <UserPlus size={14} color="var(--admin-success)" />;
  if (type === 'cancelled') return <XCircle size={14} color="var(--admin-danger)" />;
  if (type === 'order') return <ShoppingBag size={14} color="var(--admin-text-secondary)" />;
  return <Globe size={14} color="var(--admin-text-secondary)" />;
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      {stats.error ? (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: 14,
          }}
        >
          {stats.error}
        </div>
      ) : null}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Overview</h1>
          <p className={styles.pageSubtitle}>Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <Link href="/admin/overseas-pricing" className={styles.secondaryBtn}>
          <Globe size={16} />
          Manage Overseas Pricing
        </Link>
      </header>

      <div className={styles.dashboardGrid}>
        <div className={styles.mainCol}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Total Revenue</span>
                <Banknote size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{formatINR(stats.totalRevenue)}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Today&apos;s Sales</span>
                <ShoppingCart size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{formatINR(stats.todaySales)}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Total Orders</span>
                <ListOrdered size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{stats.totalOrders}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Pending Orders</span>
                <Clock size={18} className={styles.statIcon} style={{ color: 'var(--admin-warning)' }} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{stats.pendingOrders}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Products In Stock</span>
                <Box size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{stats.productsInStock.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Low Stock</span>
                <AlertTriangle size={18} className={styles.statIcon} style={{ color: 'var(--admin-danger)' }} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{stats.lowStock}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Overseas Orders</span>
                <Plane size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{stats.overseasOrders}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Returning Cust.</span>
                <RefreshCcw size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{stats.returningPct}%</span>
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>Revenue Over Time (7D)</h2>
              <div className={styles.chartFilters}>
                <button type="button" className={`${styles.chartFilterBtn} ${styles.active}`}>
                  7D
                </button>
              </div>
            </div>

            <div className={styles.chartArea}>
              {stats.chartData.map((data) => (
                <div key={data.day} className={styles.barWrapper} title={formatINR(data.total)}>
                  <div
                    className={`${styles.bar} ${data.highlight ? styles.highlight : ''}`}
                    style={{ height: data.height }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.chartLabels}>
              {stats.chartData.map((data) => (
                <div key={data.day} className={styles.chartLabel}>
                  {data.day}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className={styles.activityCard}>
          <div className={styles.activityHeader}>
            <h2 className={styles.activityTitle}>Recent Activity</h2>
            <button type="button" className={styles.iconButton} aria-label="More">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className={styles.timeline}>
            {stats.activity.length === 0 ? (
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                No recent activity yet. New orders and stock alerts will appear here.
              </p>
            ) : (
              stats.activity.map((item, index) => (
                <div key={`${item.title}-${index}`} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <ActivityIcon type={item.type} />
                  </div>
                  <div className={styles.timelineContent}>
                    <h3 className={styles.timelineEventTitle}>{item.title}</h3>
                    <p className={styles.timelineEventDesc}>{item.desc}</p>
                    <span className={styles.timelineTime}>{relativeTime(item.at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/admin/orders" className={styles.viewAllActivity}>
            View All Orders
          </Link>
        </aside>
      </div>
    </div>
  );
}

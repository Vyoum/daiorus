import React from 'react';
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
  ArrowUp
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const chartData = [
    { day: 'Mon', height: '40%' },
    { day: 'Tue', height: '30%' },
    { day: 'Wed', height: '65%' },
    { day: 'Thu', height: '100%', highlight: true },
    { day: 'Fri', height: '55%' },
    { day: 'Sat', height: '70%' },
    { day: 'Sun', height: '20%' },
  ];

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Overview</h1>
          <p className={styles.pageSubtitle}>Here's what's happening with your store today.</p>
        </div>
        <button className={styles.secondaryBtn}>
          <Globe size={16} />
          Manage Overseas Pricing
        </button>
      </header>

      <div className={styles.dashboardGrid}>
        <div className={styles.mainCol}>
          
          <div className={styles.statsGrid}>
            {/* Row 1 */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Total Revenue</span>
                <Banknote size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>$124,563</span>
                <span className={`${styles.statTrend} ${styles.trendUp}`}>↑12%</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Today's Sales</span>
                <ShoppingCart size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>$4,230</span>
                <span className={`${styles.statTrend} ${styles.trendUp}`}>↑4%</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Total Orders</span>
                <ListOrdered size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>892</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Pending Orders</span>
                <Clock size={18} className={styles.statIcon} style={{color: 'var(--admin-warning)'}} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>45</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Products In Stock</span>
                <Box size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>12,405</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Low Stock</span>
                <AlertTriangle size={18} className={styles.statIcon} style={{color: 'var(--admin-danger)'}} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>12</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Overseas Orders</span>
                <Plane size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>156</span>
                <span className={`${styles.statTrend} ${styles.trendUp}`}>↑22%</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Returning Cust.</span>
                <RefreshCcw size={18} className={styles.statIcon} />
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>42%</span>
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>Revenue Over Time</h2>
              <div className={styles.chartFilters}>
                <button className={styles.chartFilterBtn}>7D</button>
                <button className={`${styles.chartFilterBtn} ${styles.active}`}>30D</button>
                <button className={styles.chartFilterBtn}>1Y</button>
              </div>
            </div>
            
            <div className={styles.chartArea}>
              {chartData.map((data, index) => (
                <div key={index} className={styles.barWrapper}>
                  <div 
                    className={`${styles.bar} ${data.highlight ? styles.highlight : ''}`} 
                    style={{ height: data.height }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.chartLabels}>
              {chartData.map((data, index) => (
                <div key={index} className={styles.chartLabel}>{data.day}</div>
              ))}
            </div>
          </div>

        </div>

        <aside className={styles.activityCard}>
          <div className={styles.activityHeader}>
            <h2 className={styles.activityTitle}>Recent Activity</h2>
            <button className={styles.iconButton}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className={styles.timeline}>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <ShoppingBag size={14} color="var(--admin-text-secondary)" />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineEventTitle}>New Order #8920</h3>
                <p className={styles.timelineEventDesc}>John Doe purchased "Silk Tie - Navy"</p>
                <span className={styles.timelineTime}>2 mins ago</span>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <AlertTriangle size={14} color="var(--admin-warning)" />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineEventTitle}>Stock Alert</h3>
                <p className={styles.timelineEventDesc}>"Cashmere Scarf - Beige" is running low (3 left)</p>
                <span className={styles.timelineTime}>15 mins ago</span>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <UserPlus size={14} color="var(--admin-success)" />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineEventTitle}>New Customer Registration</h3>
                <p className={styles.timelineEventDesc}>Alice Smith created an account (France)</p>
                <span className={styles.timelineTime}>1 hour ago</span>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <Globe size={14} color="var(--admin-text-secondary)" />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineEventTitle}>Overseas Price Update</h3>
                <p className={styles.timelineEventDesc}>Automated adjustment for JPY (+0.5%) applied.</p>
                <span className={styles.timelineTime}>3 hours ago</span>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <XCircle size={14} color="var(--admin-danger)" />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineEventTitle}>Order Cancelled #8901</h3>
                <p className={styles.timelineEventDesc}>Customer requested cancellation.</p>
                <span className={styles.timelineTime}>5 hours ago</span>
              </div>
            </div>

          </div>

          <button className={styles.viewAllActivity}>
            View All Activity
          </button>
        </aside>
      </div>
    </div>
  );
}

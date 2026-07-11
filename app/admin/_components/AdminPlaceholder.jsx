import styles from '../dashboard.module.css';

export default function AdminPlaceholder({
  title = 'Coming soon',
  subtitle = 'This section is not connected to live data yet.',
}) {
  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{title}</h1>
          <p className={styles.pageSubtitle}>{subtitle}</p>
        </div>
      </header>
      <div className={styles.statCard} style={{ maxWidth: 560, padding: 28 }}>
        <p style={{ color: 'var(--admin-text-secondary)', lineHeight: 1.6, margin: 0 }}>
          No records to show. When this module is enabled, real data from your store will appear here —
          placeholder demo numbers have been removed.
        </p>
      </div>
    </div>
  );
}

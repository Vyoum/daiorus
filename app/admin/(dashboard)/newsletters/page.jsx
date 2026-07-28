import { getAdminNewsletters } from '../../../../lib/admin/newsletters';
import { formatDate, formatTime } from '../../../../lib/admin/format';
import styles from './newsletters.module.css';

function sourceLabel(source) {
  if (source === 'inner_circle') return 'Inner Circle';
  return source || '—';
}

export default async function NewslettersPage() {
  const { subscribers, total, error } = await getAdminNewsletters();

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Newsletters</h1>
          <p className={styles.pageSubtitle}>
            Email signups from Join the Inner Circle on the storefront.
          </p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total subscribers</span>
          <span className={styles.statValue}>{total}</span>
        </div>
      </header>

      {error ? <p className={styles.errorBanner}>{error}</p> : null}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Source</th>
              <th className={styles.th}>Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr className={styles.tr}>
                <td className={styles.td} colSpan={3} style={{ textAlign: 'center', padding: 40 }}>
                  No newsletter signups yet.
                </td>
              </tr>
            ) : (
              subscribers.map((row) => (
                <tr key={row.id} className={styles.tr}>
                  <td className={styles.td}>
                    <a href={`mailto:${row.email}`} className={styles.emailLink}>
                      {row.email}
                    </a>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.sourceBadge}>{sourceLabel(row.source)}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.dateCell}>
                      <span>{formatDate(row.createdAt)}</span>
                      <span className={styles.dateSub}>{formatTime(row.createdAt)}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

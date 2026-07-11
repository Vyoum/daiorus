import Link from 'next/link';
import { getAdminCustomers } from '../../../lib/admin/customers';
import { formatDate, formatINR, initials } from '../../../lib/admin/format';
import RoleSelect from './RoleSelect';
import styles from './customers.module.css';

export default async function CustomersPage() {
  const customers = await getAdminCustomers();
  const accounts = customers.filter((c) => c.type === 'account');
  const admins = accounts.filter((c) => c.role === 'ADMIN');
  const guests = customers.filter((c) => c.type === 'guest');

  return (
    <div>
      <header className={styles.pageHeader} style={{ display: 'block' }}>
        <h1 className={styles.customerName} style={{ marginBottom: 8 }}>
          Customers
        </h1>
        <p style={{ color: 'var(--admin-text-secondary)', marginBottom: 24 }}>
          All logged-in users from Supabase Auth, plus guest checkouts. Edit access to grant Admin or Customer.
        </p>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>REGISTERED USERS</span>
            <span className={styles.statValue}>{accounts.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>ADMINS</span>
            <span className={styles.statValue}>{admins.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>GUEST CHECKOUTS</span>
            <span className={styles.statValue}>{guests.length}</span>
          </div>
        </div>
      </header>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>USER</th>
              <th className={styles.th}>TYPE</th>
              <th className={styles.th}>ACCESS</th>
              <th className={styles.th}>ORDERS</th>
              <th className={styles.th}>LIFETIME VALUE</th>
              <th className={styles.th}>JOINED</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr className={styles.tr}>
                <td className={styles.td} colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                  No users yet. When someone signs up or logs in, they will appear here.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className={styles.tr}>
                  <td className={styles.td}>
                    <Link
                      href={`/admin/customers/${encodeURIComponent(customer.id)}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit' }}
                    >
                      <div
                        className={styles.avatar}
                        style={{
                          width: 36,
                          height: 36,
                          fontSize: 12,
                          display: 'grid',
                          placeItems: 'center',
                          background: 'var(--admin-bg-secondary, #f3f1ec)',
                          borderRadius: '50%',
                        }}
                      >
                        {initials(customer.name)}
                      </div>
                      <div>
                        <div className={styles.orderId}>{customer.name}</div>
                        <div className={styles.orderDate}>{customer.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.orderStatus}>
                      {customer.type === 'account' ? 'REGISTERED' : 'GUEST'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {customer.type === 'account' ? (
                      <RoleSelect userId={customer.id} initialRole={customer.role} />
                    ) : (
                      <span className={styles.orderDate}>—</span>
                    )}
                  </td>
                  <td className={styles.td}>{customer.orderCount}</td>
                  <td className={styles.td}>
                    <span className={styles.orderTotal}>{formatINR(customer.lifetimeValue)}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.orderDate}>{formatDate(customer.createdAt)}</span>
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

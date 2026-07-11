import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Mail, Phone, Heart, MessageSquare } from 'lucide-react';
import { getAdminCustomerDetail } from '../../../../lib/admin/customers';
import { formatDate, formatINR } from '../../../../lib/admin/format';
import RoleSelect from '../RoleSelect';
import styles from '../customers.module.css';

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  const customer = await getAdminCustomerDetail(decodeURIComponent(id));
  if (!customer) notFound();

  return (
    <div>
      <p style={{ marginBottom: 16 }}>
        <Link href="/admin/customers" style={{ color: 'var(--admin-text-secondary)', fontSize: 14 }}>
          ← All customers
        </Link>
      </p>

      <header className={styles.pageHeader}>
        <div className={styles.profileSection}>
          <div className={styles.avatar}>
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                background: '#ebe7df',
                fontWeight: 600,
              }}
            >
              {(customer.name || '?').slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.customerName}>{customer.name}</h1>
            <div className={styles.customerStatus}>
              <Star size={16} fill="currentColor" className={styles.statusIcon} />
              <span>
                {customer.type === 'account' ? 'Registered user' : 'Guest checkout'} since{' '}
                {formatDate(customer.createdAt)}
              </span>
            </div>
            {customer.type === 'account' ? (
              <div style={{ marginTop: 12 }}>
                <RoleSelect userId={customer.id} initialRole={customer.role} />
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>LIFETIME VALUE</span>
            <span className={styles.statValue}>{formatINR(customer.lifetimeValue)}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>TOTAL ORDERS</span>
            <span className={styles.statValue}>{customer.orderCount}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>AVG. ORDER VALUE</span>
            <span className={styles.statValue}>{formatINR(customer.avgOrderValue)}</span>
          </div>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Contact Information</h2>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <Mail size={16} className={styles.infoIcon} />
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>EMAIL</span>
                  <span className={styles.infoValue}>{customer.email}</span>
                </div>
              </div>
              <div className={styles.divider} style={{ margin: '16px 0' }} />
              <div className={styles.infoItem}>
                <Phone size={16} className={styles.infoIcon} />
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>PHONE</span>
                  <span className={styles.infoValue}>{customer.phone || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Saved Addresses</h2>
            </div>
            {customer.addresses.length === 0 ? (
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: 14 }}>No saved addresses.</p>
            ) : (
              customer.addresses.map((address) => (
                <div key={address.id} className={styles.addressCard}>
                  <div className={styles.addressHeader}>
                    <span className={styles.addressType}>{address.label || 'Address'}</span>
                    {address.isDefault ? <span className={styles.defaultBadge}>DEFAULT</span> : null}
                  </div>
                  <p className={styles.addressText}>
                    {address.line1}
                    <br />
                    {address.line2 ? (
                      <>
                        {address.line2}
                        <br />
                      </>
                    ) : null}
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.country}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Heart size={20} /> Wishlist Items
              </h2>
            </div>
            <div className={styles.wishlistList}>
              {customer.wishlist.length === 0 ? (
                <p style={{ color: 'var(--admin-text-secondary)', fontSize: 14 }}>No wishlist items.</p>
              ) : (
                customer.wishlist.map((item) => (
                  <div key={item.id} className={styles.wishlistItem}>
                    <div className={styles.wishlistImg}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : null}
                    </div>
                    <div className={styles.wishlistInfo}>
                      <span className={styles.wishlistName}>{item.name}</span>
                      <span className={styles.wishlistDate}>Added {formatDate(item.createdAt)}</span>
                    </div>
                    <span className={styles.wishlistPrice}>{formatINR(item.priceInr)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Order History</h2>
              <Link href="/admin/orders" className={styles.cardActionText}>
                View All →
              </Link>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ORDER ID</th>
                  <th className={styles.th}>DATE</th>
                  <th className={styles.th}>STATUS</th>
                  <th className={styles.th}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.length === 0 ? (
                  <tr className={styles.tr}>
                    <td className={styles.td} colSpan={4}>
                      No orders.
                    </td>
                  </tr>
                ) : (
                  customer.orders.map((order) => (
                    <tr key={order.id} className={styles.tr}>
                      <td className={styles.td}>
                        <span className={styles.orderId}>{order.orderNumber}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.orderStatus}>{order.status}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.orderTotal}>{formatINR(order.totalInr)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <MessageSquare size={20} /> Notes
              </h2>
            </div>
            <p style={{ color: 'var(--admin-text-secondary)', fontSize: 14 }}>
              Communication logs are not stored yet. Order emails go to {customer.email}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

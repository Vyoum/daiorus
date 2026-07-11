import { getAdminInventory } from '../../../../lib/admin/products';
import { formatDateTime } from '../../../../lib/admin/format';
import styles from '../products/products.module.css';

export default async function InventoryPage() {
  const rows = await getAdminInventory();
  const low = rows.filter((r) => r.isLow).length;

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Inventory</h1>
          <p className={styles.pageSubtitle}>
            {rows.length} SKUs · {low} low stock
          </p>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Product</th>
              <th className={styles.th}>SKU</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>On Hand</th>
              <th className={styles.th}>Reserved</th>
              <th className={styles.th}>Available</th>
              <th className={styles.th}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.productCell}>
                    <div className={styles.productImage}>
                      {row.productImage ? (
                        <img
                          src={row.productImage}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : null}
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{row.productName}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.td}>{row.sku || '—'}</td>
                <td className={styles.td}>{row.category}</td>
                <td className={styles.td}>
                  <span style={row.isLow ? { color: 'var(--admin-danger)', fontWeight: 600 } : undefined}>
                    {row.quantity}
                  </span>
                </td>
                <td className={styles.td}>{row.reserved}</td>
                <td className={styles.td}>{row.available}</td>
                <td className={styles.td}>{formatDateTime(row.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { getAdminCategories } from '../../../../lib/admin/products';
import styles from '../products/products.module.css';

export default async function CategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p className={styles.pageSubtitle}>Storefront categories synced from your catalogue.</p>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Slug</th>
              <th className={styles.th}>Products</th>
              <th className={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.productCell}>
                    <div className={styles.productImage}>
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : null}
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{cat.name}</span>
                      <span className={styles.productDesc}>{cat.description?.slice(0, 80)}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.td}>{cat.slug}</td>
                <td className={styles.td}>{cat.productCount}</td>
                <td className={styles.td}>
                  <span className={styles.badge}>
                    <span className={styles.badgeDot} />
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import {
  Search,
  Download,
  Filter,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { getAdminProducts } from '../../../../lib/admin/products';
import { formatDateTime, formatINR, productStatusLabel } from '../../../../lib/admin/format';
import styles from './products.module.css';

export default async function ProductsPage() {
  const { products, total } = await getAdminProducts();

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Product Catalog</h1>
          <p className={styles.pageSubtitle}>Manage your inventory, pricing, and product visibility.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryBtn}>
            <Download size={16} />
            Export CSV
          </button>
          <Link href="/admin/inventory" className={styles.primaryBtn}>
            View Inventory
          </Link>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={16} />
          <input type="text" placeholder="Search products, SKU..." className={styles.searchInput} disabled />
        </div>

        <div className={styles.filterGroup}>
          <button type="button" className={styles.dropdownBtn}>
            Category <ChevronDown size={14} />
          </button>
          <button type="button" className={styles.dropdownBtn}>
            Stock Status <ChevronDown size={14} />
          </button>
          <button type="button" className={styles.iconBtn}>
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{ width: 40 }}>
                <input type="checkbox" className={styles.checkbox} aria-label="Select all" />
              </th>
              <th className={styles.th}>Product</th>
              <th className={styles.th}>SKU</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Price</th>
              <th className={styles.th}>Stock</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Visibility</th>
              <th className={styles.th}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr className={styles.tr}>
                <td className={styles.td} colSpan={9} style={{ textAlign: 'center', padding: 40 }}>
                  No products in the database yet.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={styles.tr}>
                  <td className={styles.td}>
                    <input type="checkbox" className={styles.checkbox} aria-label={`Select ${product.name}`} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.productCell}>
                      <div className={styles.productImage}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                          />
                        ) : null}
                      </div>
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{product.name}</span>
                        <span className={styles.productDesc}>{product.material || product.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>{product.sku}</td>
                  <td className={styles.td}>{product.category}</td>
                  <td className={styles.td}>
                    <span className={styles.price}>{formatINR(product.priceInr)}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.stockCell}>
                      <span className={styles.stockValue} style={product.isLow ? { color: 'var(--admin-danger)' } : undefined}>
                        {product.quantity}
                      </span>
                      <div className={styles.stockBarBg}>
                        <div className={styles.stockBarFill} style={{ width: `${product.stockPct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.badge}>
                      <span className={styles.badgeDot} />
                      {productStatusLabel(product.status)}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <Eye className={styles.visibilityIcon} size={18} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.lastUpdated}>{formatDateTime(product.updatedAt)}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <span className={styles.paginationText}>
            Showing {products.length === 0 ? 0 : 1} to {products.length} of {total} products
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
            <button type="button" className={styles.pageBtn} style={{ border: 'none', background: 'transparent' }}>
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

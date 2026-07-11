import React from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  Filter, 
  ChevronDown, 
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import styles from './products.module.css';

export default function ProductsPage() {
  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Product Catalog</h1>
          <p className={styles.pageSubtitle}>Manage your inventory, pricing, and product visibility.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}>
            <Download size={16} />
            Export CSV
          </button>
          <button className={styles.primaryBtn}>
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={16} />
          <input 
            type="text" 
            placeholder="Search products, SKU..." 
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <button className={styles.dropdownBtn}>
            Category <ChevronDown size={14} />
          </button>
          <button className={styles.dropdownBtn}>
            Price Range <ChevronDown size={14} />
          </button>
          <button className={styles.dropdownBtn}>
            Stock Status <ChevronDown size={14} />
          </button>
          <button className={styles.iconBtn}>
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{width: '40px'}}>
                <input type="checkbox" className={styles.checkbox} />
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
            <tr className={styles.tr}>
              <td className={styles.td}>
                <input type="checkbox" className={styles.checkbox} />
              </td>
              <td className={styles.td}>
                <div className={styles.productCell}>
                  <div className={styles.productImage}>
                    {/* Placeholder for Product Image */}
                    <div style={{width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000'}}></div>
                  </div>
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>Daiorus Smart Hub Pro</span>
                    <span className={styles.productDesc}>Core Control Unit</span>
                  </div>
                </div>
              </td>
              <td className={styles.td}>DSH-PRO-BLK</td>
              <td className={styles.td}>Smart Home</td>
              <td className={styles.td}><span className={styles.price}>$299.00</span></td>
              <td className={styles.td}>
                <div className={styles.stockCell}>
                  <span className={styles.stockValue}>145</span>
                  <div className={styles.stockBarBg}>
                    <div className={styles.stockBarFill} style={{width: '60%'}}></div>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <span className={styles.badge}>
                  <span className={styles.badgeDot}></span>
                  Published
                </span>
              </td>
              <td className={styles.td}>
                <Eye className={styles.visibilityIcon} size={18} />
              </td>
              <td className={styles.td}>
                <div className={styles.lastUpdated}>
                  Today, 09:41<br/>AM
                </div>
              </td>
            </tr>
            {/* Can add more placeholder rows here if needed, but Image 4 only shows one row populated */}
          </tbody>
        </table>
        
        <div className={styles.pagination}>
          <span className={styles.paginationText}>Showing 1 to 10 of 245 products</span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn} style={{border: 'none', background: 'transparent'}}><MoreHorizontal size={16} /></button>
            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

    </div>
  );
}

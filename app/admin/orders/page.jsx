import React from 'react';
import { 
  Download, 
  Plus, 
  ChevronDown, 
  Printer, 
  Truck,
  MoreHorizontal,
  RefreshCw,
  Check,
  Undo2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import styles from './orders.module.css';

export default function OrdersPage() {
  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSubtitle}>Manage, filter, and track customer purchases.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}>
            <Download size={16} />
            Export CSV
          </button>
          <button className={styles.primaryBtn}>
            <Plus size={16} />
            Create Order
          </button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <div className={styles.filterContainer}>
          <div className={styles.filterGroup}>
            <button className={`${styles.dropdownBtn} ${styles.activeFilter}`}>
              Last 30 Days <ChevronDown size={14} />
            </button>
            <button className={styles.dropdownBtn}>
              Payment Status <ChevronDown size={14} />
            </button>
            <button className={styles.dropdownBtn}>
              Shipping Status <ChevronDown size={14} />
            </button>
            <button className={styles.dropdownBtn}>
              <span role="img" aria-label="globe">🌎</span> Country <ChevronDown size={14} />
            </button>
          </div>
          
          <div className={styles.bulkActions}>
            <button className={styles.bulkActionBtn}>
              <Printer size={16} />
              Print Invoices
            </button>
            <button className={styles.bulkActionBtn}>
              <Truck size={16} />
              Mark as Shipped
            </button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{width: '40px'}}>
                <input type="checkbox" className={styles.checkbox} />
              </th>
              <th className={styles.th}>Order</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Customer</th>
              <th className={styles.th}>Product</th>
              <th className={styles.th}>Total</th>
              <th className={styles.th}>Payment</th>
              <th className={styles.th}>Fulfillment</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            
            {/* Row 1 */}
            <tr className={styles.tr}>
              <td className={styles.td}><input type="checkbox" className={styles.checkbox} /></td>
              <td className={styles.td}><span className={styles.orderId}>#ORD-8921</span></td>
              <td className={styles.td}>
                <div className={styles.dateCell}>
                  <span className={styles.dateMain}>Oct 24, 2023</span>
                  <span className={styles.dateSub}>14:23 PM</span>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.customerCell}>
                  <div className={styles.customerAvatar}>
                    <img src="https://i.pravatar.cc/150?u=eleanor" alt="Eleanor Vance" />
                  </div>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>Eleanor Vance</span>
                    <span className={styles.customerEmail}>eleanor.v@example.com</span>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.productCell}>
                  <div className={styles.productImage}></div>
                  <span className={styles.productName}>Acoustic Prism V2</span>
                </div>
              </td>
              <td className={styles.td}><span className={styles.price}>$1,450.00</span></td>
              <td className={styles.td}>
                <span className={styles.paymentBadge}>
                  <span className={`${styles.paymentDot} ${styles.paid}`}></span> Paid
                </span>
              </td>
              <td className={styles.td}>
                <span className={styles.fulfillBadge}>
                  <RefreshCw size={14} className={styles.fulfillIcon} /> Processing
                </span>
              </td>
              <td className={styles.td}><MoreHorizontal size={18} className={styles.moreBtn} /></td>
            </tr>

            {/* Row 2 */}
            <tr className={styles.tr}>
              <td className={styles.td}><input type="checkbox" className={styles.checkbox} /></td>
              <td className={styles.td}><span className={styles.orderId}>#ORD-8920</span></td>
              <td className={styles.td}>
                <div className={styles.dateCell}>
                  <span className={styles.dateMain}>Oct 24, 2023</span>
                  <span className={styles.dateSub}>10:05 AM</span>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.customerCell}>
                  <div className={styles.customerAvatar}>JM</div>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>Julian Mercer</span>
                    <span className={styles.customerEmail}>j.mercer@corp.net</span>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.productCell}>
                  <div className={styles.productImage}></div>
                  <span className={styles.productName}>Titanium Chronograph</span>
                </div>
              </td>
              <td className={styles.td}><span className={styles.price}>$3,200.00</span></td>
              <td className={styles.td}>
                <span className={styles.paymentBadge}>
                  <span className={`${styles.paymentDot} ${styles.pending}`}></span> Pending
                </span>
              </td>
              <td className={styles.td}>
                <span className={styles.fulfillBadge}>
                  <span className={`${styles.paymentDot} ${styles.paid}`} style={{backgroundColor: 'var(--admin-danger)'}}></span> Unfulfilled
                </span>
              </td>
              <td className={styles.td}><MoreHorizontal size={18} className={styles.moreBtn} /></td>
            </tr>

            {/* Row 3 */}
            <tr className={styles.tr}>
              <td className={styles.td}><input type="checkbox" className={styles.checkbox} /></td>
              <td className={styles.td}><span className={styles.orderId}>#ORD-8919</span></td>
              <td className={styles.td}>
                <div className={styles.dateCell}>
                  <span className={styles.dateMain}>Oct 23, 2023</span>
                  <span className={styles.dateSub}>18:45 PM</span>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.customerCell}>
                  <div className={styles.customerAvatar}>
                    <img src="https://i.pravatar.cc/150?u=sophia" alt="Sophia Chen" />
                  </div>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>Sophia Chen</span>
                    <span className={styles.customerEmail}>schen_design@studio.co</span>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.productCell}>
                  <div className={styles.productImage}></div>
                  <span className={styles.productName}>Enterprise API Key (Annual)</span>
                </div>
              </td>
              <td className={styles.td}><span className={styles.price}>$8,500.00</span></td>
              <td className={styles.td}>
                <span className={styles.paymentBadge}>
                  <span className={`${styles.paymentDot} ${styles.paid}`}></span> Paid
                </span>
              </td>
              <td className={styles.td}>
                <span className={styles.fulfillBadge}>
                  <Check size={14} className={`${styles.fulfillIcon} ${styles.delivered}`} /> Delivered
                </span>
              </td>
              <td className={styles.td}><MoreHorizontal size={18} className={styles.moreBtn} /></td>
            </tr>

            {/* Row 4 */}
            <tr className={styles.tr}>
              <td className={styles.td}><input type="checkbox" className={styles.checkbox} /></td>
              <td className={styles.td}><span className={styles.orderId}>#ORD-8918</span></td>
              <td className={styles.td}>
                <div className={styles.dateCell}>
                  <span className={styles.dateMain}>Oct 22, 2023</span>
                  <span className={styles.dateSub}>09:12 AM</span>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.customerCell}>
                  <div className={styles.customerAvatar}>MW</div>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>Marcus Webb</span>
                    <span className={styles.customerEmail}>marcus.w@webb.io</span>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.productCell}>
                  <div className={styles.productImage}></div>
                  <span className={styles.productName}>Executive Folio - Onyx</span>
                </div>
              </td>
              <td className={styles.td}><span className={styles.price}>$450.00</span></td>
              <td className={styles.td}>
                <span className={styles.paymentBadge}>
                  <Undo2 size={12} className={styles.fulfillIcon} style={{marginRight: '4px'}}/> Refunded
                </span>
              </td>
              <td className={styles.td}>
                <span className={styles.fulfillBadge}>
                  -
                </span>
              </td>
              <td className={styles.td}><MoreHorizontal size={18} className={styles.moreBtn} /></td>
            </tr>
            
          </tbody>
        </table>
        
        <div className={styles.pagination}>
          <span className={styles.paginationText}>Showing 1 to 4 of 1,240 orders</span>
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

import React from 'react';
import { 
  Star, 
  Mail, 
  Phone, 
  Plus, 
  Heart, 
  MessageSquare,
  User
} from 'lucide-react';
import styles from './customers.module.css';

export default function CustomerDetailsPage() {
  return (
    <div>
      <header className={styles.pageHeader}>
        <div className={styles.profileSection}>
          <div className={styles.avatar}>
            <img src="https://i.pravatar.cc/150?u=eleanor" alt="Eleanor Vance" />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.customerName}>Eleanor Vance</h1>
            <div className={styles.customerStatus}>
              <Star size={16} fill="currentColor" className={styles.statusIcon} />
              <span>VIP Client since 2021</span>
            </div>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>LIFETIME VALUE</span>
            <span className={styles.statValue}>$14,500</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>TOTAL ORDERS</span>
            <span className={styles.statValue}>12</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>AVG. ORDER VALUE</span>
            <span className={styles.statValue}>$1,200</span>
          </div>
        </div>
      </header>

      <div className={styles.mainGrid}>
        
        {/* Left Column */}
        <div className={styles.leftCol}>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Contact Information</h2>
              <button className={styles.cardActionText}>Edit</button>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <Mail size={16} className={styles.infoIcon} />
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>EMAIL</span>
                  <span className={styles.infoValue}>eleanor.vance@example.com</span>
                </div>
              </div>
              <div className={styles.divider} style={{margin: '16px 0'}}></div>
              <div className={styles.infoItem}>
                <Phone size={16} className={styles.infoIcon} />
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>PHONE</span>
                  <span className={styles.infoValue}>+1 (555) 019-2834</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Saved Addresses</h2>
              <button className={styles.cardActionIconBtn}><Plus size={16} /></button>
            </div>
            <div className={styles.addressCard}>
              <div className={styles.addressHeader}>
                <span className={styles.addressType}>Home</span>
                <span className={styles.defaultBadge}>DEFAULT</span>
              </div>
              <p className={styles.addressText}>
                1745 T Street NW<br/>
                Washington, DC 20009<br/>
                United States
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Heart size={20} /> Wishlist Items
              </h2>
            </div>
            <div className={styles.wishlistList}>
              
              <div className={styles.wishlistItem}>
                <div className={styles.wishlistImg}></div>
                <div className={styles.wishlistInfo}>
                  <span className={styles.wishlistName}>The Signature Tote - Burgundy</span>
                  <span className={styles.wishlistDate}>Added Oct 15</span>
                </div>
                <span className={styles.wishlistPrice}>$850</span>
              </div>

              <div className={styles.wishlistItem}>
                <div className={styles.wishlistImg}></div>
                <div className={styles.wishlistInfo}>
                  <span className={styles.wishlistName}>Geo Pendant Necklace - 18k Gold</span>
                  <span className={styles.wishlistDate}>Added Sep 02</span>
                </div>
                <span className={styles.wishlistPrice}>$1,200</span>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Order History</h2>
              <button className={styles.cardActionText}>View All →</button>
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
                <tr className={styles.tr}>
                  <td className={styles.td}><span className={styles.orderId}>#ORD-9823</span></td>
                  <td className={styles.td}><span className={styles.orderDate}>Oct 12, 2023</span></td>
                  <td className={styles.td}><span className={styles.orderStatus}>DELIVERED</span></td>
                  <td className={styles.td}><span className={styles.orderTotal}>$2,450.00</span></td>
                </tr>
                <tr className={styles.tr}>
                  <td className={styles.td}><span className={styles.orderId}>#ORD-9102</span></td>
                  <td className={styles.td}><span className={styles.orderDate}>Aug 04, 2023</span></td>
                  <td className={styles.td}><span className={styles.orderStatus}>DELIVERED</span></td>
                  <td className={styles.td}><span className={styles.orderTotal}>$890.00</span></td>
                </tr>
                <tr className={styles.tr}>
                  <td className={styles.td}><span className={styles.orderId}>#ORD-8441</span></td>
                  <td className={styles.td}><span className={styles.orderDate}>Mar 22, 2023</span></td>
                  <td className={styles.td}><span className={styles.orderStatus}>DELIVERED</span></td>
                  <td className={styles.td}><span className={styles.orderTotal}>$3,120.00</span></td>
                </tr>
                <tr className={styles.tr}>
                  <td className={styles.td}><span className={styles.orderId}>#ORD-7990</span></td>
                  <td className={styles.td}><span className={styles.orderDate}>Jan 10, 2023</span></td>
                  <td className={styles.td}><span className={styles.orderStatus}>DELIVERED</span></td>
                  <td className={styles.td}><span className={styles.orderTotal}>$1,400.00</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <MessageSquare size={20} /> Communication Log
              </h2>
              <button className={styles.primaryBtnSmall}>New Message</button>
            </div>
            
            <div className={styles.timeline}>
              
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineTitle}>Bespoke Inquiry: Platinum Ring</span>
                    <span className={styles.timelineDate}>Oct 20, 2023 - 14:30</span>
                  </div>
                  <p className={styles.timelineText}>
                    Client requested details on customizing the setting for the Heritage collection ring.<br/>
                    Sent over the digital lookbook and pricing tiers.
                  </p>
                  <div className={styles.timelineFooter}>
                    <User size={12} /> Agent: Sarah Jenkins
                  </div>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles.secondary}`}></div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineTitle}>Automated Email: Order Delivered</span>
                    <span className={styles.timelineDate}>Oct 14, 2023 - 09:15</span>
                  </div>
                  <p className={styles.timelineText}>
                    System notification sent for delivery of Order #ORD-9823.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

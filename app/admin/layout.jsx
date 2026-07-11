'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Gem,
  LayoutGrid,
  Box,
  Globe,
  Users,
  Ticket,
  Star,
  Image as ImageIcon,
  BarChart,
  Settings,
  Search,
  Bell,
  ChevronDown
} from 'lucide-react';
import './admin.css';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Gem },
  { label: 'Categories', href: '/admin/categories', icon: LayoutGrid },
  { label: 'Inventory', href: '/admin/inventory', icon: Box },
  { label: 'Overseas Pricing', href: '/admin/overseas-pricing', icon: Globe },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Coupons & Discounts', href: '/admin/coupons', icon: Ticket },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className={`admin-reset ${styles.adminContainer}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Daiorus</h1>
          <p className={styles.sidebarSubtitle}>Enterprise Admin</p>
        </div>
        
        <nav className={styles.navGroup}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.activePremium : ''}`}
              >
                <Icon className={styles.navIcon} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.quickAddBtn}>
            + Quick Add Product
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} strokeWidth={2} />
            <input 
              type="text" 
              placeholder="Search orders, products, etc." 
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.topbarActions}>
            <button className={styles.iconButton}>
              <Bell size={20} strokeWidth={2} />
            </button>
            
            <button className={styles.profileButton}>
              <div className={styles.avatar}>
                <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
              </div>
              <span className={styles.profileName}>Admin</span>
              <ChevronDown size={14} color="var(--admin-text-secondary)" />
            </button>
          </div>
        </header>

        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}

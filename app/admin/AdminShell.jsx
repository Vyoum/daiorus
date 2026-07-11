'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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

export default function AdminShell({ children, adminName = 'Admin', adminEmail = '' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = adminName || adminEmail?.split('@')[0] || 'Admin';
  const avatarSeed = encodeURIComponent(adminEmail || displayName);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace('/admin/login');
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div className={`admin-reset ${styles.adminContainer}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Daiorus</h1>
          <p className={styles.sidebarSubtitle}>Enterprise Admin</p>
        </div>

        <nav className={styles.navGroup}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
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
          <Link href="/admin/products/new" className={styles.quickAddBtn}>
            + Quick Add Product
          </Link>
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
            <button type="button" className={styles.iconButton} aria-label="Notifications">
              <Bell size={20} strokeWidth={2} />
            </button>

            <div className={styles.profileMenu}>
              <button
                type="button"
                className={styles.profileButton}
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
              >
                <div className={styles.avatar}>
                  <img
                    src={`https://i.pravatar.cc/150?u=${avatarSeed}`}
                    alt={displayName}
                  />
                </div>
                <span className={styles.profileName}>{displayName}</span>
                <ChevronDown size={14} color="var(--admin-text-secondary)" />
              </button>

              {menuOpen ? (
                <div className={styles.profileDropdown}>
                  {adminEmail ? (
                    <p className={styles.profileEmail}>{adminEmail}</p>
                  ) : null}
                  <button
                    type="button"
                    className={styles.signOutBtn}
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <LogOut size={14} />
                    {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
}

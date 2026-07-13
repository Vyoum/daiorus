'use client';

import { createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  Heart,
  User,
  MapPin,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import styles from './AccountShell.module.css';

const AccountProfileContext = createContext(null);

export function useAccountProfile() {
  return useContext(AccountProfileContext);
}

const NAV = [
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/payment', label: 'Payment Methods', icon: CreditCard },
];

export default function AccountShell({ children, profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <AccountProfileContext.Provider value={profile}>
      <div className={styles.page}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink} aria-label="DAIORUS Home">
              <img
                src="/images/daiorus-logo-transparent.png"
                alt="DAIORUS"
                className={styles.logo}
              />
            </Link>
            <p className={styles.tagline}>Manage your preferences</p>
          </div>

          <nav className={styles.nav} aria-label="Account">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button type="button" className={styles.navItem} onClick={handleLogout}>
              <LogOut size={18} strokeWidth={1.5} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <div className={styles.content}>{children}</div>
      </div>
    </AccountProfileContext.Provider>
  );
}

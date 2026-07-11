'use client';

import Link from 'next/link';
import ProductCard from './ProductCard';
import { useWishlist } from './WishlistProvider';
import styles from './AccountWishlist.module.css';

export default function AccountWishlist() {
  const { items, ready } = useWishlist();

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Wishlist</h1>
        <p className={styles.lead}>
          Pieces you&apos;ve saved — add them to your cart whenever you&apos;re ready.
        </p>
      </header>

      {!ready ? (
        <p className={styles.loading}>Loading your wishlist…</p>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
          <p className={styles.emptyText}>
            Hover any product and tap the heart to save it here.
          </p>
          <Link href="/shop" className={styles.emptyLink}>
            Browse jewellery
          </Link>
        </div>
      ) : (
        <div className={`ui1-product-grid ${styles.grid}`}>
          {items.map((product) => (
            <ProductCard key={product.id} product={product} showMaterial showRemove />
          ))}
        </div>
      )}
    </div>
  );
}

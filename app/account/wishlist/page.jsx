import styles from '../../../components/AccountPlaceholder.module.css';

export const metadata = { title: 'Wishlist | DAIORUS' };

export default function AccountWishlistPage() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Wishlist</h1>
      <p className={styles.text}>
        Save pieces you love — your wishlist will show here.
      </p>
    </div>
  );
}

import styles from '../../../components/AccountPlaceholder.module.css';

export const metadata = { title: 'Payment Methods | DAIORUS' };

export default function AccountPaymentPage() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Payment Methods</h1>
      <p className={styles.text}>
        Saved cards and payment preferences will appear here.
      </p>
    </div>
  );
}

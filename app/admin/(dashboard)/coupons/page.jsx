import { getAdminCoupons } from '../../../../lib/admin/coupons';
import CouponsEditor from './CouponsEditor';
import styles from '../products/products.module.css';

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Coupons & Discounts</h1>
          <p className={styles.pageSubtitle}>
            Create coupon codes customers can apply at checkout for percent or fixed discounts.
          </p>
        </div>
      </header>

      <CouponsEditor initialCoupons={Array.isArray(coupons) ? coupons : []} />
    </div>
  );
}

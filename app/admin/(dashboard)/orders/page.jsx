import { Download } from 'lucide-react';
import { getAdminOrders } from '../../../../lib/admin/orders';
import { isSequelConfigured } from '../../../../lib/sequel247/config';
import OrdersTable from './OrdersTable';
import styles from './orders.module.css';

export default async function OrdersPage() {
  const { orders, total } = await getAdminOrders();

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSubtitle}>Manage, filter, and track customer purchases.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryBtn}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      <OrdersTable orders={orders} total={total} sequelConfigured={isSequelConfigured()} />
    </div>
  );
}

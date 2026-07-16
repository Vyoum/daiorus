import { getAdminCategories } from '../../../../lib/admin/products';
import CategoriesEditor from './CategoriesEditor';
import styles from '../products/products.module.css';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getAdminCategories();
  const list = Array.isArray(categories) ? categories : [];

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p className={styles.pageSubtitle}>
            Edit cover photos for Shop by Category on the homepage, and the hero image on each
            category page.
          </p>
        </div>
      </header>

      <CategoriesEditor initialCategories={list} />
    </div>
  );
}

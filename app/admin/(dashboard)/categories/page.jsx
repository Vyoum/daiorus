import { getAdminCategories } from '../../../../lib/admin/products';
import CategoriesEditor from './CategoriesEditor';
import styles from '../products/products.module.css';

export default async function CategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p className={styles.pageSubtitle}>
            Edit homepage cover tiles and category page hero images. Changes publish to the
            storefront after you save.
          </p>
        </div>
      </header>

      <CategoriesEditor initialCategories={categories} />
    </div>
  );
}

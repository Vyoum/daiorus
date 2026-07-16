import { getAdminCategories } from '../../../../lib/admin/categories';
import CategoriesEditor from './CategoriesEditor';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoriesEditor initialCategories={categories} />;
}

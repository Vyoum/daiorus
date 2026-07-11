import { getAdminCategories } from '../../../../../lib/admin/products';
import ProductForm from './ProductForm';

export const metadata = {
  title: 'Add New Product | Daiorus Admin',
};

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <ProductForm
      categories={Array.isArray(categories) ? categories : []}
    />
  );
}

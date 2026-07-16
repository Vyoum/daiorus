import { notFound } from 'next/navigation';
import {
  getAdminProduct,
} from '../../../../../../lib/admin/products';
import { getAdminCategories } from '../../../../../../lib/admin/categories';
import ProductForm from '../../new/ProductForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return {
    title: product
      ? `Edit ${product.name} | Daiorus Admin`
      : 'Edit Product | Daiorus Admin',
  };
}

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProduct(id),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      categories={Array.isArray(categories) ? categories : []}
      product={product}
    />
  );
}

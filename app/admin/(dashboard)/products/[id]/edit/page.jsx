import { notFound } from 'next/navigation';
import {
  getAdminCategories,
  getAdminProduct,
} from '../../../../../../lib/admin/products';
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

export default async function EditProductPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProduct(id),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      key={product.id}
      categories={Array.isArray(categories) ? categories : []}
      product={product}
      justSaved={query?.saved === '1' || query?.saved === true}
    />
  );
}

import { notFound } from 'next/navigation';
import SiteShell from '../../../components/SiteShell';
import ProductDetail from '../../../components/ProductDetail';
import { getStorefrontProductBySlug } from '../../../lib/storefront/products';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);
  if (!product) return { title: 'Product | DAIORUS' };
  return {
    title: `${product.name} | DAIORUS`,
    description:
      product.description?.slice(0, 160) ||
      `Shop ${product.name} from the DAIORUS jewellery collection.`,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);
  if (!product) notFound();

  return (
    <SiteShell>
      <ProductDetail product={product} />
    </SiteShell>
  );
}

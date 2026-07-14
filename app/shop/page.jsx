import ShopPage from '../../components/ShopPage';
import { getStorefrontProducts } from '../../lib/storefront/products';

// Always load the full live catalog for Shop All (avoid stale filtered caches)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop All | DAIORUS',
  description: 'Explore the full Daiorus collection of fine jewellery.',
};

export default async function ShopRoutePage() {
  const products = await getStorefrontProducts();
  return <ShopPage initialProducts={products} />;
}

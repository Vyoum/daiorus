import ShopPage from '../../components/ShopPage';
import { getStorefrontProducts } from '../../lib/storefront/products';

export const revalidate = 60;

export const metadata = {
  title: 'Shop All | DAIORUS',
  description: 'Explore the full Daiorus collection of fine jewellery.',
};

export default async function ShopRoutePage() {
  const products = await getStorefrontProducts();
  return <ShopPage initialProducts={products} />;
}

import HomePage from '../components/HomePage';
import { getLandingContent } from '../lib/site-content';
import { getFeaturedStorefrontProducts } from '../lib/storefront/products';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [{ announce, hero, signature }, featuredProducts] = await Promise.all([
    getLandingContent(),
    getFeaturedStorefrontProducts({ take: 4 }),
  ]);

  return (
    <HomePage
      announce={announce}
      hero={hero}
      signature={signature}
      featuredProducts={featuredProducts}
    />
  );
}

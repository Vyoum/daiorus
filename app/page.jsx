import HomePage from '../components/HomePage';
import { getLandingContent } from '../lib/site-content';
import { getFeaturedStorefrontProducts } from '../lib/storefront/products';
import { getStorefrontCategories } from '../lib/storefront/categories';
import prisma from '../lib/prisma';

export const revalidate = 60;

export default async function Page() {
  const [{ announce, hero, signature, curatedSelects, philosophy, social }, featuredProducts, categories] =
    await Promise.all([
      getLandingContent(),
      getFeaturedStorefrontProducts({ take: 4 }),
      getStorefrontCategories(),
    ]);

  const selectedIds = curatedSelects?.productIds || [];
  const selectedProductsRaw = selectedIds.length
    ? await prisma.product.findMany({
        where: {
          id: { in: selectedIds },
          status: 'ACTIVE',
        },
        select: {
          id: true,
          slug: true,
          name: true,
          material: true,
          tag: true,
          description: true,
          imageUrl: true,
          images: true,
        },
      })
    : [];

  const byId = Object.fromEntries(selectedProductsRaw.map((p) => [p.id, p]));
  const curatedSelectProducts = selectedIds.map((id) => byId[id]).filter(Boolean);

  return (
    <HomePage
      announce={announce}
      hero={hero}
      signature={signature}
      philosophy={philosophy}
      social={social}
      featuredProducts={featuredProducts}
      curatedSelectProducts={curatedSelectProducts}
      categories={categories}
    />
  );
}

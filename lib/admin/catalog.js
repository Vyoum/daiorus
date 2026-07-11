import prisma from '../prisma';
import { CATEGORIES, PRODUCTS } from '../data';

/** Upsert storefront catalog into Postgres when tables are empty. */
export async function ensureCatalogSynced() {
  const [categoryCount, productCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);

  if (categoryCount > 0 && productCount > 0) {
    return { synced: false, categories: categoryCount, products: productCount };
  }

  for (const [index, cat] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.intro,
        imageUrl: cat.image,
        heroImageUrl: cat.heroImage,
        sortOrder: index,
        isActive: true,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.intro,
        imageUrl: cat.image,
        heroImageUrl: cat.heroImage,
        sortOrder: index,
        isActive: true,
      },
    });
  }

  const dbCategories = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const categoryBySlug = Object.fromEntries(dbCategories.map((c) => [c.slug, c.id]));

  for (const [slug, items] of Object.entries(PRODUCTS)) {
    const categoryId = categoryBySlug[slug] ?? null;

    for (const item of items) {
      const productSlug = `${slug}-${item.id}`;
      const existing = await prisma.product.findUnique({ where: { slug: productSlug } });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: item.name,
            material: item.material || null,
            tag: item.tag || null,
            priceInr: item.price,
            imageUrl: item.image,
            categoryId,
            status: 'ACTIVE',
          },
        });
        continue;
      }

      await prisma.product.create({
        data: {
          slug: productSlug,
          name: item.name,
          material: item.material || null,
          tag: item.tag || null,
          priceInr: item.price,
          imageUrl: item.image,
          images: item.image ? [item.image] : [],
          status: 'ACTIVE',
          categoryId,
          inventory: {
            create: {
              quantity: 25,
              reserved: 0,
              lowStockAt: 5,
              sku: `DAI-${item.id.toUpperCase()}`,
              trackInventory: true,
            },
          },
        },
      });
    }
  }

  const [categories, products] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);

  return { synced: true, categories, products };
}

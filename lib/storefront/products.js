import prisma from '../prisma';
import { ensureCatalogSynced } from '../admin/catalog';

function mapStorefrontProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.priceInr,
    image: product.imageUrl || '/images/ui1/prod-eclipse.jpg',
    material: product.material || null,
    tag: product.tag || null,
    category: product.category?.slug || null,
    categoryName: product.category?.name || null,
    slug: product.slug,
  };
}

async function queryActiveProducts(where = {}) {
  try {
    await ensureCatalogSynced();
  } catch (err) {
    console.error('[storefront:catalog-sync]', err?.message || err);
  }

  try {
    return await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        ...where,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        category: { select: { slug: true, name: true } },
      },
    });
  } catch (err) {
    console.error('[storefront:products]', err?.message || err);
    return [];
  }
}

export async function getStorefrontProducts() {
  const products = await queryActiveProducts();
  return products.map(mapStorefrontProduct);
}

export async function getStorefrontProductsByCategory(categorySlug) {
  if (!categorySlug) return [];
  const products = await queryActiveProducts({
    category: { is: { slug: categorySlug } },
  });
  return products.map(mapStorefrontProduct);
}

export async function getFeaturedStorefrontProducts({ take = 4 } = {}) {
  try {
    await ensureCatalogSynced();
  } catch (err) {
    console.error('[storefront:catalog-sync]', err?.message || err);
  }

  try {
    const tagged = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { tag: { equals: 'Best Seller', mode: 'insensitive' } },
          { tag: { contains: 'Best', mode: 'insensitive' } },
        ],
      },
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: { select: { slug: true, name: true } },
      },
    });

    if (tagged.length >= take) {
      return tagged.map(mapStorefrontProduct);
    }

    const remaining = take - tagged.length;
    const fallback = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: tagged.map((p) => p.id) },
      },
      take: remaining,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: { select: { slug: true, name: true } },
      },
    });

    return [...tagged, ...fallback].map(mapStorefrontProduct);
  } catch (err) {
    console.error('[storefront:featured]', err?.message || err);
    return [];
  }
}

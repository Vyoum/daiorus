import prisma from '../prisma';
import { ensureCatalogSynced } from '../admin/catalog';

function galleryFor(product) {
  const list = [];
  const primary = product.imageUrl || null;
  const extras = Array.isArray(product.images) ? product.images : [];
  for (const url of [...(primary ? [primary] : []), ...extras]) {
    if (url && !list.includes(url)) list.push(url);
  }
  if (list.length === 0) list.push('/images/ui1/prod-eclipse.jpg');
  return list;
}

function mapStorefrontProduct(product) {
  const images = galleryFor(product);
  return {
    id: product.id,
    name: product.name,
    price: product.priceInr,
    compareAt: product.compareAtInr || null,
    image: images[0],
    images,
    description: product.description || '',
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

export async function getStorefrontProductBySlug(slug) {
  if (!slug) return null;

  try {
    await ensureCatalogSynced();
  } catch (err) {
    console.error('[storefront:catalog-sync]', err?.message || err);
  }

  try {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: 'ACTIVE',
      },
      include: {
        category: { select: { slug: true, name: true } },
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: {
            id: true,
            rating: true,
            title: true,
            body: true,
            authorName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) return null;

    const mapped = mapStorefrontProduct(product);
    const ratings = product.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

    return {
      ...mapped,
      reviews: product.reviews,
      reviewCount: ratings.length,
      avgRating,
    };
  } catch (err) {
    console.error('[storefront:product]', err?.message || err);
    return null;
  }
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

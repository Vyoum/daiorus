import { cache } from 'react';
import prisma from '../prisma';
import { ensureCatalogSynced } from '../admin/catalog';
import { getGoldPricingSettings } from '../gold-pricing';

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
    weightGrams: product.weightGrams ?? null,
    goldWeightGrams: product.goldWeightGrams ?? null,
    goldPricingEnabled: Boolean(product.goldPricingEnabled),
    goldRate24kAtPricingInr: product.goldRate24kAtPricingInr ?? null,
    makingChargeInr: product.makingChargeInr ?? null,
    taxPct: product.taxPct ?? 3,
    diamondCount: product.diamondCount ?? null,
    productInfo: product.productInfo || null,
    tag: product.tag || null,
    category: product.category?.slug || null,
    categoryName: product.category?.name || null,
    slug: product.slug,
  };
}

const productInclude = {
  category: { select: { slug: true, name: true } },
};

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
      include: productInclude,
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

async function loadStorefrontProductBySlug(slug) {
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
        ...productInclude,
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

    // Fall back to today's gold rate so Price Breakup can show weight × karat rate
    // even for products saved before a rate snapshot existed.
    if (mapped.goldWeightGrams) {
      try {
        const settings = await getGoldPricingSettings();
        if (settings.rate24kPerGram) {
          mapped.currentRate24kPerGram = settings.rate24kPerGram;
        }
      } catch (err) {
        console.error('[storefront:gold-rate]', err?.message || err);
      }
    }

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

/** Dedupes metadata + page fetch within one request. */
export const getStorefrontProductBySlug = cache(loadStorefrontProductBySlug);

function isFeaturedTag(tag) {
  if (!tag) return false;
  const value = String(tag).toLowerCase();
  return value === 'best seller' || value.includes('best');
}

export async function getFeaturedStorefrontProducts({ take = 4 } = {}) {
  try {
    await ensureCatalogSynced();
  } catch (err) {
    console.error('[storefront:catalog-sync]', err?.message || err);
  }

  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      take: Math.max(take * 6, 24),
      orderBy: { updatedAt: 'desc' },
      include: productInclude,
    });

    const tagged = products.filter((p) => isFeaturedTag(p.tag));
    const rest = products.filter((p) => !isFeaturedTag(p.tag));
    return [...tagged, ...rest].slice(0, take).map(mapStorefrontProduct);
  } catch (err) {
    console.error('[storefront:featured]', err?.message || err);
    return [];
  }
}

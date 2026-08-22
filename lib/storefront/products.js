import { cache } from 'react';
import prisma from '../prisma';
import { ensureCatalogSynced } from '../admin/catalog';
import { getGoldPricingSettings } from '../gold-pricing';
import { computeProductPriceInr } from '../price-breakup';

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

function mapStorefrontProduct(product, rate24kPerGram = null) {
  const images = galleryFor(product);
  const mapped = {
    id: product.id,
    name: product.name,
    price: product.priceInr,
    compareAt: product.compareAtInr || null,
    discountInr: product.discountInr ?? null,
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
    diamondCarat: product.diamondCarat ?? null,
    diamondCostInr: product.diamondCostInr ?? null,
    diamondQuality: product.diamondQuality || null,
    diamondType: product.diamondType || null,
    stoneCount: product.stoneCount ?? null,
    stoneCarat: product.stoneCarat ?? null,
    stoneCostInr: product.stoneCostInr ?? null,
    heightMm: product.heightMm ?? null,
    widthMm: product.widthMm ?? null,
    lengthMm: product.lengthMm ?? null,
    metalColor: product.metalColor || null,
    sku: product.inventory?.sku || null,
    productInfo: product.productInfo || null,
    tag: product.tag || null,
    category: product.category?.slug || null,
    categoryName: product.category?.name || null,
    slug: product.slug,
  };

  if (rate24kPerGram) {
    mapped.currentRate24kPerGram = rate24kPerGram;
  }

  const computed = computeProductPriceInr({
    ...mapped,
    priceInr: mapped.price,
  });
  if (computed > 0) {
    mapped.price = computed;
  }

  return mapped;
}

const productInclude = {
  category: { select: { slug: true, name: true } },
  inventory: { select: { sku: true } },
};

async function getLiveGoldRate() {
  try {
    const settings = await getGoldPricingSettings();
    return settings.rate24kPerGram || null;
  } catch (err) {
    console.error('[storefront:gold-rate]', err?.message || err);
    return null;
  }
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
      include: productInclude,
    });
  } catch (err) {
    console.error('[storefront:products]', err?.message || err);
    return [];
  }
}

export async function getStorefrontProducts() {
  const [products, rate24kPerGram] = await Promise.all([
    queryActiveProducts(),
    getLiveGoldRate(),
  ]);
  return products.map((product) => mapStorefrontProduct(product, rate24kPerGram));
}

export async function getStorefrontProductsByCategory(categorySlug) {
  if (!categorySlug) return [];
  const [products, rate24kPerGram] = await Promise.all([
    queryActiveProducts({
      category: { is: { slug: categorySlug } },
    }),
    getLiveGoldRate(),
  ]);
  return products.map((product) => mapStorefrontProduct(product, rate24kPerGram));
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

    const rate24kPerGram = await getLiveGoldRate();
    const mapped = mapStorefrontProduct(product, rate24kPerGram);

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
    const [products, rate24kPerGram] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        take: Math.max(take * 6, 24),
        orderBy: { updatedAt: 'desc' },
        include: productInclude,
      }),
      getLiveGoldRate(),
    ]);

    const tagged = products.filter((p) => isFeaturedTag(p.tag));
    const rest = products.filter((p) => !isFeaturedTag(p.tag));
    return [...tagged, ...rest]
      .slice(0, take)
      .map((product) => mapStorefrontProduct(product, rate24kPerGram));
  } catch (err) {
    console.error('[storefront:featured]', err?.message || err);
    return [];
  }
}

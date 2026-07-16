import { cache } from 'react';
import prisma from '../prisma';
import { CATEGORIES } from '../data';
import { ensureCatalogSynced } from '../admin/catalog';

function fallbackCategory(slug) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return null;
  return {
    id: null,
    slug: cat.slug,
    name: cat.name,
    href: cat.href || `/category/${cat.slug}`,
    description: cat.intro || '',
    image: cat.image,
    heroImage: cat.heroImage || cat.image,
    intro: cat.intro || '',
    isActive: true,
  };
}

function mapCategory(row) {
  const fallback = fallbackCategory(row.slug);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    href: `/category/${row.slug}`,
    description: row.description || fallback?.description || '',
    intro: row.description || fallback?.intro || '',
    image: row.imageUrl || fallback?.image || '/images/ui1/cat-earrings.jpg',
    heroImage:
      row.heroImageUrl ||
      row.imageUrl ||
      fallback?.heroImage ||
      fallback?.image ||
      '/images/ui1/hero-earrings.jpg',
    isActive: row.isActive,
  };
}

async function loadStorefrontCategories() {
  try {
    await ensureCatalogSynced();
  } catch (err) {
    console.error('[storefront:categories-sync]', err?.message || err);
  }

  try {
    const rows = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        imageUrl: true,
        heroImageUrl: true,
        isActive: true,
      },
    });

    if (rows.length === 0) {
      return CATEGORIES.map((cat) => fallbackCategory(cat.slug));
    }

    return rows.map(mapCategory);
  } catch (err) {
    console.error('[storefront:categories]', err?.message || err);
    return CATEGORIES.map((cat) => fallbackCategory(cat.slug));
  }
}

export const getStorefrontCategories = cache(loadStorefrontCategories);

export async function getStorefrontCategory(slug) {
  if (!slug) return null;

  const categories = await getStorefrontCategories();
  return categories.find((cat) => cat.slug === slug) || fallbackCategory(slug);
}

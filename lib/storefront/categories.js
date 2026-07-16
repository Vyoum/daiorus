import { cache } from 'react';
import prisma from '../prisma';
import { CATEGORIES as STATIC_CATEGORIES } from '../data';
import { ensureCatalogSynced } from '../admin/catalog';

const staticBySlug = Object.fromEntries(STATIC_CATEGORIES.map((cat) => [cat.slug, cat]));

function mapStorefrontCategory(cat) {
  const fallback = staticBySlug[cat.slug];
  return {
    slug: cat.slug,
    name: cat.name,
    href: `/category/${cat.slug}`,
    image: cat.imageUrl || fallback?.image || '/images/ui1/hero-home.jpg',
    intro: cat.description || fallback?.intro || '',
    heroImage: cat.heroImageUrl || fallback?.heroImage || cat.imageUrl || fallback?.image || '',
  };
}

async function loadStorefrontCategories() {
  try {
    await ensureCatalogSynced();
  } catch (err) {
    console.error('[storefront:categories:sync]', err?.message || err);
  }

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (categories.length > 0) {
      return categories.map(mapStorefrontCategory);
    }
  } catch (err) {
    console.error('[storefront:categories]', err?.message || err);
  }

  return STATIC_CATEGORIES;
}

export const getStorefrontCategories = cache(loadStorefrontCategories);

export async function getStorefrontCategoryBySlug(slug) {
  if (!slug) return null;
  const categories = await getStorefrontCategories();
  return categories.find((cat) => cat.slug === slug) || null;
}

import prisma from '../prisma';
import { ensureCatalogSynced } from './catalog';
import { safeAdminQuery } from './safe';

export async function getAdminCategories() {
  return safeAdminQuery(
    'categories',
    async () => {
      await ensureCatalogSynced();
      const categories = await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { products: true } },
        },
      });

      return categories.map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        heroImageUrl: cat.heroImageUrl,
        isActive: cat.isActive,
        productCount: cat._count.products,
        sortOrder: cat.sortOrder,
      }));
    },
    () => [],
  );
}

export async function updateAdminCategory(id, input) {
  if (!id) throw new Error('Category id is required');

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error('Category not found');

  const imageUrl =
    input.imageUrl === undefined
      ? undefined
      : String(input.imageUrl || '').trim() || null;
  const heroImageUrl =
    input.heroImageUrl === undefined
      ? undefined
      : String(input.heroImageUrl || '').trim() || null;

  return prisma.category.update({
    where: { id },
    data: {
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(heroImageUrl !== undefined ? { heroImageUrl } : {}),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      heroImageUrl: true,
      isActive: true,
      sortOrder: true,
    },
  });
}

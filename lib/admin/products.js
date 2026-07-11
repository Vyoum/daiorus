import prisma from '../prisma';
import { ensureCatalogSynced } from './catalog';

export async function getAdminProducts({ take = 100 } = {}) {
  await ensureCatalogSynced();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        inventory: true,
      },
    }),
    prisma.product.count(),
  ]);

  return {
    total,
    products: products.map((product) => {
      const qty = product.inventory?.quantity ?? 0;
      const lowAt = product.inventory?.lowStockAt ?? 5;
      const maxBar = Math.max(qty, lowAt * 4, 1);
      return {
        id: product.id,
        name: product.name,
        material: product.material,
        slug: product.slug,
        sku: product.inventory?.sku || `DAI-${product.slug.slice(0, 8).toUpperCase()}`,
        category: product.category?.name || 'Uncategorised',
        priceInr: product.priceInr,
        quantity: qty,
        stockPct: Math.min(100, Math.round((qty / maxBar) * 100)),
        status: product.status,
        imageUrl: product.imageUrl,
        updatedAt: product.updatedAt,
        isLow: qty <= lowAt,
      };
    }),
  };
}

export async function getAdminCategories() {
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
    isActive: cat.isActive,
    productCount: cat._count.products,
    sortOrder: cat.sortOrder,
  }));
}

export async function getAdminInventory() {
  await ensureCatalogSynced();

  const rows = await prisma.inventory.findMany({
    orderBy: { quantity: 'asc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          status: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    quantity: row.quantity,
    reserved: row.reserved,
    lowStockAt: row.lowStockAt,
    available: Math.max(0, row.quantity - row.reserved),
    isLow: row.quantity <= row.lowStockAt,
    productName: row.product.name,
    productImage: row.product.imageUrl,
    category: row.product.category?.name || '—',
    status: row.product.status,
    updatedAt: row.updatedAt,
  }));
}

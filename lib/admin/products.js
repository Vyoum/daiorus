import prisma from '../prisma';
import { ensureCatalogSynced } from './catalog';
import { emptyProducts, safeAdminQuery } from './safe';

async function loadAdminProducts({ take = 100 } = {}) {
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
    error: null,
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

export async function getAdminProducts(options) {
  return safeAdminQuery('products', () => loadAdminProducts(options), emptyProducts);
}

export async function getAdminInventory() {
  return safeAdminQuery(
    'inventory',
    async () => {
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
    },
    () => []
  );
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const MAX_PRODUCT_IMAGES = 8;

function normalizeProductImages(input) {
  const fromArray = Array.isArray(input?.images)
    ? input.images.map((url) => String(url || '').trim()).filter(Boolean)
    : [];
  const primary = String(input?.imageUrl || '').trim();
  const merged = [];

  for (const url of [...(primary ? [primary] : []), ...fromArray]) {
    if (url.startsWith('blob:')) continue;
    if (!merged.includes(url)) merged.push(url);
  }

  return merged.slice(0, MAX_PRODUCT_IMAGES);
}

async function uniqueProductSlug(base) {
  let slug = slugify(base) || `product-${Date.now()}`;
  let attempt = slug;
  let i = 2;
  while (await prisma.product.findUnique({ where: { slug: attempt }, select: { id: true } })) {
    attempt = `${slug}-${i}`;
    i += 1;
  }
  return attempt;
}

/** Create a product + inventory row from the admin product editor. */
export async function createAdminProduct(input) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('Product name is required');

  const priceInr = Math.round(Number(input.priceInr));
  if (!Number.isFinite(priceInr) || priceInr < 0) {
    throw new Error('Base price must be a valid amount');
  }

  const compareAtRaw = input.compareAtInr;
  const compareAtInr =
    compareAtRaw === '' || compareAtRaw == null || Number(compareAtRaw) === 0
      ? null
      : Math.round(Number(compareAtRaw));

  if (compareAtInr != null && (!Number.isFinite(compareAtInr) || compareAtInr < 0)) {
    throw new Error('Sale price must be a valid amount');
  }

  const status = input.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE';
  const quantity = Math.max(0, Math.round(Number(input.quantity) || 0));
  const sku = String(input.sku || '').trim() || null;
  const categoryId = input.categoryId || null;
  const images = normalizeProductImages(input);
  const imageUrl = images[0] || null;
  const description = String(input.description || '').trim() || null;
  const material = String(input.material || '').trim() || null;
  const tag = String(input.tag || '').trim() || null;
  const slug = await uniqueProductSlug(input.slug || name);

  if (sku) {
    const existingSku = await prisma.inventory.findUnique({
      where: { sku },
      select: { id: true },
    });
    if (existingSku) throw new Error('SKU is already in use');
  }

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) throw new Error('Category not found');
  }

  return prisma.product.create({
    data: {
      slug,
      name,
      description,
      material,
      tag,
      priceInr,
      compareAtInr,
      imageUrl,
      images,
      status,
      categoryId,
      inventory: {
        create: {
          quantity,
          reserved: 0,
          lowStockAt: 5,
          sku,
          trackInventory: true,
        },
      },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      inventory: true,
    },
  });
}

export async function getAdminProduct(id) {
  if (!id) return null;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      inventory: true,
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    material: product.material || '',
    tag: product.tag || '',
    priceInr: product.priceInr,
    compareAtInr: product.compareAtInr,
    imageUrl: product.imageUrl || '',
    images: normalizeProductImages({
      imageUrl: product.imageUrl,
      images: product.images,
    }),
    status: product.status,
    categoryId: product.categoryId || '',
    sku: product.inventory?.sku || '',
    quantity: product.inventory?.quantity ?? 0,
  };
}

export async function updateAdminProduct(id, input) {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { inventory: true },
  });
  if (!existing) throw new Error('Product not found');

  const name = String(input.name || '').trim();
  if (!name) throw new Error('Product name is required');

  const priceInr = Math.round(Number(input.priceInr));
  if (!Number.isFinite(priceInr) || priceInr < 0) {
    throw new Error('Base price must be a valid amount');
  }

  const compareAtRaw = input.compareAtInr;
  const compareAtInr =
    compareAtRaw === '' || compareAtRaw == null || Number(compareAtRaw) === 0
      ? null
      : Math.round(Number(compareAtRaw));

  if (compareAtInr != null && (!Number.isFinite(compareAtInr) || compareAtInr < 0)) {
    throw new Error('Sale price must be a valid amount');
  }

  const status = input.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE';
  const quantity = Math.max(0, Math.round(Number(input.quantity) || 0));
  const sku = String(input.sku || '').trim() || null;
  const categoryId = input.categoryId || null;
  const images = normalizeProductImages(input);
  const imageUrl = images[0] || null;
  const description = String(input.description || '').trim() || null;
  const material = String(input.material || '').trim() || null;
  const tag = String(input.tag || '').trim() || null;

  if (sku) {
    const existingSku = await prisma.inventory.findFirst({
      where: {
        sku,
        NOT: { productId: id },
      },
      select: { id: true },
    });
    if (existingSku) throw new Error('SKU is already in use');
  }

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) throw new Error('Category not found');
  }

  return prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      material,
      tag,
      priceInr,
      compareAtInr,
      imageUrl,
      images,
      status,
      categoryId,
      inventory: existing.inventory
        ? {
            update: {
              quantity,
              sku,
            },
          }
        : {
            create: {
              quantity,
              reserved: 0,
              lowStockAt: 5,
              sku,
              trackInventory: true,
            },
          },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      inventory: true,
    },
  });
}

export async function deleteAdminProduct(id) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!existing) throw new Error('Product not found');

  await prisma.product.delete({ where: { id } });
  return existing;
}

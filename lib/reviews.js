import prisma from '../prisma';

/**
 * Create a product review from a signed-in customer who purchased the item.
 */
export async function createProductReview({
  userId,
  authorName,
  authorEmail,
  productId,
  rating,
  title,
  body,
}) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, status: true },
  });
  if (!product) throw new Error('Product not found');

  const stars = Math.round(Number(rating));
  if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const text = String(body || '').trim();
  if (text.length < 8) {
    throw new Error('Please write a short review (at least 8 characters)');
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
    },
    select: { id: true },
  });
  if (!purchased) {
    throw new Error('You can only review products you have purchased');
  }

  const existing = await prisma.review.findFirst({
    where: { userId, productId },
    select: { id: true },
  });
  if (existing) {
    throw new Error('You have already reviewed this product');
  }

  return prisma.review.create({
    data: {
      productId,
      userId,
      authorName: String(authorName || 'Customer').trim().slice(0, 80) || 'Customer',
      authorEmail: authorEmail ? String(authorEmail).trim().toLowerCase() : null,
      rating: stars,
      title: title ? String(title).trim().slice(0, 120) : null,
      body: text.slice(0, 2000),
      status: 'APPROVED',
    },
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      status: true,
      createdAt: true,
      productId: true,
    },
  });
}

/**
 * Map of productId -> review id for a user (to hide Write Review when done).
 */
export async function getUserReviewMap(userId) {
  if (!userId) return {};
  const rows = await prisma.review.findMany({
    where: { userId },
    select: { id: true, productId: true, rating: true },
  });
  return Object.fromEntries(rows.map((row) => [row.productId, row]));
}

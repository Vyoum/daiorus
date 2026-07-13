import prisma from '../prisma';
import { safeAdminQuery } from './safe';

function emptyReviews(errorMessage) {
  return { total: 0, reviews: [], error: errorMessage || 'Database unavailable' };
}

async function loadAdminReviews({ take = 100 } = {}) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.review.count(),
  ]);

  return {
    total,
    error: null,
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      status: review.status,
      createdAt: review.createdAt,
      authorName: review.authorName || review.user?.name || 'Customer',
      authorEmail: review.authorEmail || review.user?.email || '—',
      productId: review.productId,
      productName: review.product?.name || 'Deleted product',
      productImage: review.product?.imageUrl || null,
      productSlug: review.product?.slug || null,
    })),
  };
}

export async function getAdminReviews(options) {
  return safeAdminQuery('reviews', () => loadAdminReviews(options), emptyReviews);
}

export async function updateReviewStatus(id, status) {
  const allowed = new Set(['PENDING', 'APPROVED', 'HIDDEN']);
  if (!allowed.has(status)) {
    throw new Error('Invalid review status');
  }

  return prisma.review.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });
}

export async function deleteReview(id) {
  await prisma.review.delete({ where: { id } });
  return { ok: true };
}

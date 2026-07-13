import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/admin/auth';
import { createProductReview } from '@/lib/reviews';

export async function POST(request) {
  try {
    const { authUser, dbUser } = await getSessionUser();
    if (!authUser || !dbUser) {
      return NextResponse.json({ error: 'Please sign in to leave a review' }, { status: 401 });
    }

    const body = await request.json();
    const review = await createProductReview({
      userId: dbUser.id,
      authorName: dbUser.name || authUser.user_metadata?.full_name || dbUser.email.split('@')[0],
      authorEmail: dbUser.email,
      productId: body.productId,
      rating: body.rating,
      title: body.title,
      body: body.body,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error('[reviews:create]', err?.message || err);
    return NextResponse.json(
      { error: err.message || 'Could not submit review' },
      { status: 400 },
    );
  }
}

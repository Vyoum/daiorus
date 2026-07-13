import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { deleteReview, updateReviewStatus } from '@/lib/admin/reviews';

export async function PATCH(request, { params }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const review = await updateReviewStatus(id, body.status);
    return NextResponse.json(review);
  } catch (err) {
    console.error('[admin:review:patch]', err?.message || err);
    return NextResponse.json(
      { error: err.message || 'Could not update review' },
      { status: 400 },
    );
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await deleteReview(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin:review:delete]', err?.message || err);
    return NextResponse.json(
      { error: err.message || 'Could not delete review' },
      { status: 400 },
    );
  }
}

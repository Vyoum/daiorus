import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { updateAdminCategory } from '@/lib/admin/categories';

export async function PATCH(request, { params }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const category = await updateAdminCategory(id, body);
    return NextResponse.json(category);
  } catch (err) {
    console.error('[admin:update-category]', err?.message || err);
    const status = err.message === 'Category not found' ? 404 : 400;
    return NextResponse.json(
      { error: err.message || 'Could not update category' },
      { status },
    );
  }
}

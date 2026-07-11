import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { createAdminProduct } from '@/lib/admin/products';

export async function POST(request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const product = await createAdminProduct(body);
    return NextResponse.json(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        status: product.status,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[admin:create-product]', err?.message || err);
    return NextResponse.json(
      { error: err.message || 'Could not create product' },
      { status: 400 }
    );
  }
}

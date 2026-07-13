import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import {
  deleteAdminProduct,
  getAdminProduct,
  updateAdminProduct,
} from '@/lib/admin/products';

export async function GET(_request, { params }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const product = await getAdminProduct(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error('[admin:get-product]', err?.message || err);
    return NextResponse.json({ error: 'Could not load product' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const product = await updateAdminProduct(id, body);
    return NextResponse.json({
      id: product.id,
      slug: product.slug,
      name: product.name,
      status: product.status,
    });
  } catch (err) {
    console.error('[admin:update-product]', err?.message || err);
    const status = err.message === 'Product not found' ? 404 : 400;
    return NextResponse.json(
      { error: err.message || 'Could not update product' },
      { status },
    );
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const product = await deleteAdminProduct(id);
    return NextResponse.json({
      ok: true,
      id: product.id,
      name: product.name,
    });
  } catch (err) {
    console.error('[admin:delete-product]', err?.message || err);
    const status = err.message === 'Product not found' ? 404 : 400;
    return NextResponse.json(
      { error: err.message || 'Could not delete product' },
      { status },
    );
  }
}

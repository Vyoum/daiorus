import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeProductSpecs } from '@/lib/product-specs';

export async function POST(request) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids)
      ? [...new Set(body.ids.map((id) => String(id || '').trim()).filter(Boolean))]
      : [];

    if (!ids.length) {
      return NextResponse.json({ specs: {} });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids }, status: 'ACTIVE' },
      select: {
        id: true,
        material: true,
        weightGrams: true,
        diamondCount: true,
        productInfo: true,
      },
    });

    const specs = Object.fromEntries(
      products.map((product) => [product.id, normalizeProductSpecs(product)]),
    );

    return NextResponse.json({ specs });
  } catch (err) {
    console.error('[products:specs]', err?.message || err);
    return NextResponse.json({ error: 'Could not load product specs' }, { status: 500 });
  }
}

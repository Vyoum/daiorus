import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { bookShipmentForOrder, cancelShipmentForOrder } from '@/lib/sequel247/shipment';

export async function POST(request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const body = await request.json();
    const orderId = String(body?.orderId || '').trim();
    const force = Boolean(body?.force);

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const result = await bookShipmentForOrder(orderId, { force });
    if (result.skipped) {
      return NextResponse.json({ skipped: true, reason: result.reason, shipment: result.shipment || null });
    }
    if (!result.success) {
      return NextResponse.json({ error: result.error, shipment: result.shipment || null }, { status: 502 });
    }

    return NextResponse.json({ success: true, shipment: result.shipment });
  } catch (err) {
    console.error('[admin:sequel247:shipment:POST]', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Could not book shipment' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const body = await request.json();
    const orderId = String(body?.orderId || '').trim();
    const cancelReason = String(body?.cancelReason || 'Cancelled by admin').trim();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const shipment = await cancelShipmentForOrder(orderId, cancelReason);
    return NextResponse.json({ success: true, shipment });
  } catch (err) {
    console.error('[admin:sequel247:shipment:DELETE]', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Could not cancel shipment' }, { status: 500 });
  }
}

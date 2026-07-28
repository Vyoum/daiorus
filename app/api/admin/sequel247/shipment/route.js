import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { bookShipmentForOrder, cancelShipmentForOrder } from '@/lib/sequel247/shipment';
import { sequelAccountHint } from '@/lib/sequel247/status';
import prisma from '@/lib/prisma';

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

    const result = await bookShipmentForOrder(orderId, { force, allowPendingPayment: true });
    if (result.skipped) {
      const messages = {
        not_configured:
          'Sequel247 is not configured on this server. Add SEQUEL247_* env vars in Vercel/host settings.',
        order_not_bookable: 'This order cannot be shipped (cancelled, refunded, or already fulfilled).',
        order_not_found: 'Order not found.',
        already_booked: 'Shipment is already booked for this order.',
        international_order: 'Sequel247 only supports domestic (India) orders.',
      };
      return NextResponse.json(
        {
          error: messages[result.reason] || result.reason || 'Shipment was not created',
          reason: result.reason,
          shipment: result.shipment || null,
        },
        { status: 400 },
      );
    }
    if (!result.success) {
      const hint = sequelAccountHint(result.error);
      return NextResponse.json(
        { error: result.error, hint, shipment: result.shipment || null },
        { status: 502 },
      );
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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    const shipment = await cancelShipmentForOrder(orderId, cancelReason, {
      preserveOrderStatus: order?.status === 'PENDING',
    });
    return NextResponse.json({ success: true, shipment });
  } catch (err) {
    console.error('[admin:sequel247:shipment:DELETE]', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Could not cancel shipment' }, { status: 500 });
  }
}

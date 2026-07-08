import crypto from 'crypto';
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Payment gateway is not configured' }, { status: 500 });
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, status: true, notes: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'PAID') {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        alreadyPaid: true,
      });
    }

    let storedRazorpayOrderId = null;
    try {
      const parsed = order.notes ? JSON.parse(order.notes) : null;
      storedRazorpayOrderId = parsed?.razorpayOrderId ?? null;
    } catch {
      storedRazorpayOrderId = null;
    }

    if (storedRazorpayOrderId && storedRazorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: 'Order mismatch' }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentRef: razorpay_payment_id,
        notes: JSON.stringify({
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('verify payment error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}

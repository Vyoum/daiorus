import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getRazorpay, getRazorpayKeyId } from '../../../../lib/razorpay';
import { getSessionUser } from '../../../../lib/admin/auth';
import {
  calculateCartTotals,
  generateOrderNumber,
  inrToPaise,
} from '../../../../lib/checkout';
import {
  applySurchargeInr,
  getSurchargePctForRegion,
} from '../../../../lib/overseas-pricing';

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, email, countryCode, currencyCode } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    for (const item of items) {
      if (!item?.id || !item?.name || !item?.price || !item?.qty) {
        return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 });
      }
      if (item.qty < 1 || item.price < 1) {
        return NextResponse.json({ error: 'Invalid quantity or price' }, { status: 400 });
      }
    }

    const regionKey = countryCode || currencyCode || 'IN';
    const surchargePct = await getSurchargePctForRegion(regionKey);

    const pricedItems = items.map((item) => {
      const unitPriceInr = applySurchargeInr(item.price, surchargePct);
      return {
        ...item,
        basePriceInr: Math.round(Number(item.price) || 0),
        price: unitPriceInr,
      };
    });

    const { subtotalInr, shippingInr, totalInr } = calculateCartTotals(pricedItems);
    const orderNumber = generateOrderNumber();
    const amountPaise = inrToPaise(totalInr);

    if (amountPaise < 100) {
      return NextResponse.json({ error: 'Order total is too low' }, { status: 400 });
    }

    let userId = null;
    try {
      const session = await getSessionUser();
      userId = session.dbUser?.id || null;
    } catch {
      userId = null;
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        email,
        orderNumber,
        countryCode: String(regionKey).toUpperCase(),
        surchargePct: String(surchargePct),
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail: email.trim().toLowerCase(),
        status: 'PENDING',
        subtotalInr,
        shippingInr,
        discountInr: 0,
        totalInr,
        currency: 'INR',
        notes: JSON.stringify({
          razorpayOrderId: razorpayOrder.id,
          countryCode: String(regionKey).toUpperCase(),
          surchargePct,
        }),
        items: {
          create: pricedItems.map((item) => ({
            productName: item.name,
            material: item.material || null,
            unitPriceInr: item.price,
            quantity: item.qty,
            lineTotalInr: item.price * item.qty,
            imageUrl: item.image || null,
          })),
        },
      },
      select: { id: true, orderNumber: true },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: getRazorpayKeyId(),
      prefill: { email: email.trim() },
      surchargePct,
    });
  } catch (error) {
    console.error('create-order error:', error);
    const message =
      error.message === 'Razorpay credentials are not configured'
        ? 'Payment gateway is not configured'
        : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

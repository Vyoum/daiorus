import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getRazorpay, getRazorpayKeyId } from '../../../../lib/razorpay';
import { getSessionUser } from '../../../../lib/admin/auth';
import {
  calculateCartTotals,
  generateOrderNumber,
  inrToPaise,
} from '../../../../lib/checkout';
import { getCheckoutErrorMessage } from '../../../../lib/checkout-errors';
import {
  applySurchargeInr,
  getSurchargePctForRegion,
} from '../../../../lib/overseas-pricing';
import { applyCouponToTotals } from '../../../../lib/coupons';

async function resolveShippingAddressId(userId, address) {
  if (!userId || !address.saveAddress) return null;

  try {
    const existingAddress = await prisma.address.findFirst({
      where: {
        userId,
        line1: address.line1,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      select: { id: true },
    });

    if (existingAddress) {
      return existingAddress.id;
    }

    const savedAddress = await prisma.address.create({
      data: {
        userId,
        label: 'Shipping address',
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: false,
      },
      select: { id: true },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: address.fullName,
        phone: address.phone,
      },
    });

    return savedAddress.id;
  } catch (err) {
    console.warn('[create-order] address save failed, continuing checkout:', err?.message || err);
    return null;
  }
}

function buildOrderNotes({
  regionKey,
  surchargePct,
  couponResult,
  discountInr,
  address,
  razorpayOrderId = null,
}) {
  return JSON.stringify({
    razorpayOrderId,
    countryCode: String(regionKey).toUpperCase(),
    surchargePct,
    couponCode: couponResult.coupon?.code || null,
    discountInr,
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    },
  });
}

async function createPendingOrder({
  orderNumber,
  userId,
  email,
  shippingAddressId,
  subtotalInr,
  shippingInr,
  discountInr,
  totalInr,
  notes,
  pricedItems,
}) {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const receipt = attempt === 0 ? orderNumber : generateOrderNumber();

    try {
      return await prisma.order.create({
        data: {
          orderNumber: receipt,
          userId,
          guestEmail: email.trim().toLowerCase(),
          shippingAddressId,
          status: 'PENDING',
          subtotalInr,
          shippingInr,
          discountInr,
          totalInr,
          currency: 'INR',
          notes,
          items: {
            create: pricedItems.map((item) => ({
              productId: item.id || null,
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
    } catch (err) {
      if (err?.code === 'P2002' && attempt < maxAttempts - 1) {
        continue;
      }
      throw err;
    }
  }

  throw new Error('Could not create order');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, email, countryCode, currencyCode, shippingAddress, couponCode } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    for (const item of items) {
      const qty = Number(item?.qty);
      const price = Number(item?.price);

      if (!item?.id || !item?.name || !Number.isFinite(qty) || !Number.isFinite(price)) {
        return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 });
      }
      if (qty < 1 || price < 1) {
        return NextResponse.json({ error: 'Invalid quantity or price' }, { status: 400 });
      }
    }

    const address = {
      fullName: String(shippingAddress?.fullName || '').trim(),
      phone: String(shippingAddress?.phone || '').trim(),
      line1: String(shippingAddress?.line1 || '').trim(),
      line2: String(shippingAddress?.line2 || '').trim() || null,
      city: String(shippingAddress?.city || '').trim(),
      state: String(shippingAddress?.state || '').trim(),
      postalCode: String(shippingAddress?.postalCode || '').trim(),
      country: String(shippingAddress?.country || countryCode || 'IN').trim().toUpperCase(),
      saveAddress: Boolean(shippingAddress?.saveAddress),
    };

    if (
      !address.fullName ||
      !address.phone ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.postalCode
    ) {
      return NextResponse.json(
        { error: 'A phone number and complete delivery address are required' },
        { status: 400 },
      );
    }

    const regionKey = countryCode || currencyCode || 'IN';
    const surchargePct = await getSurchargePctForRegion(regionKey);

    const pricedItems = items.map((item) => {
      const unitPriceInr = applySurchargeInr(Number(item.price), surchargePct);
      return {
        ...item,
        qty: Number(item.qty),
        basePriceInr: Math.round(Number(item.price) || 0),
        price: unitPriceInr,
      };
    });

    const baseTotals = calculateCartTotals(pricedItems);
    const couponResult = applyCouponToTotals({
      subtotalInr: baseTotals.subtotalInr,
      shippingInr: baseTotals.shippingInr,
      couponCode,
    });
    const { subtotalInr, shippingInr, discountInr, totalInr } = calculateCartTotals(
      pricedItems,
      { discountInr: couponResult.discountInr },
    );
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

    const shippingAddressId = await resolveShippingAddressId(userId, address);

    const pendingNotes = buildOrderNotes({
      regionKey,
      surchargePct,
      couponResult,
      discountInr,
      address,
    });

    const order = await createPendingOrder({
      orderNumber,
      userId,
      email,
      shippingAddressId,
      subtotalInr,
      shippingInr,
      discountInr,
      totalInr,
      notes: pendingNotes,
      pricedItems,
    });

    let razorpayOrder;
    try {
      const razorpay = getRazorpay();
      razorpayOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          email,
          orderNumber: order.orderNumber,
          countryCode: String(regionKey).toUpperCase(),
          surchargePct: String(surchargePct),
        },
      });
    } catch (razorpayError) {
      await prisma.order
        .update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        })
        .catch((cancelErr) => {
          console.error('[create-order] failed to cancel pending order:', cancelErr?.message || cancelErr);
        });
      throw razorpayError;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        notes: buildOrderNotes({
          regionKey,
          surchargePct,
          couponResult,
          discountInr,
          address,
          razorpayOrderId: razorpayOrder.id,
        }),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: amountPaise,
      totalInr,
      currency: 'INR',
      keyId: getRazorpayKeyId(),
      prefill: {
        email: email.trim(),
        name: address.fullName,
        contact: address.phone,
      },
      surchargePct,
    });
  } catch (error) {
    console.error('create-order error:', {
      message: error?.message,
      code: error?.code,
      statusCode: error?.statusCode,
      description: error?.error?.description,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: getCheckoutErrorMessage(error) },
      { status: 500 },
    );
  }
}

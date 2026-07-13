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
import { applyCouponToTotals } from '../../../../lib/coupons';

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

    let shippingAddressId = null;
    if (userId && address.saveAddress) {
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
        shippingAddressId = existingAddress.id;
      } else {
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
        shippingAddressId = savedAddress.id;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          name: address.fullName,
          phone: address.phone,
        },
      });
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
        shippingAddressId,
        status: 'PENDING',
        subtotalInr,
        shippingInr,
        discountInr,
        totalInr,
        currency: 'INR',
        notes: JSON.stringify({
          razorpayOrderId: razorpayOrder.id,
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
    console.error('create-order error:', error);
    const message =
      error.message === 'Razorpay credentials are not configured'
        ? 'Payment gateway is not configured'
        : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

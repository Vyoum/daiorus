import prisma from '../prisma';
import { getShippingFromOrder } from '../account/orders';
import { createSequelShipment, cancelSequelShipment } from './client';
import { getSequelConfig, isSequelConfigured } from './config';

function truncate(value, max) {
  return String(value || '').trim().slice(0, max);
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function formatPickupDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function buildToAddress(shipping) {
  const name = truncate(shipping.fullName || 'Customer', 50);
  return {
    consignee_name: name,
    address_line1: truncate(shipping.line1, 50),
    address_line2: truncate(shipping.line2 || shipping.city || '', 50),
    pinCode: String(shipping.postalCode || '').trim(),
    auth_receiver_name: name,
    auth_receiver_phone: normalizePhone(shipping.phone),
  };
}

function buildCreateShipmentPayload(order, shipping) {
  const config = getSequelConfig();
  const boxNumber = `DAI-${order.orderNumber}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);

  return {
    location: 'domestic',
    shipmentType: config.shipmentType,
    serviceType: config.serviceType,
    pickUpDate: config.pickUpDate,
    pickUpTime: config.pickUpTime,
    fromStoreCode: config.fromStoreCode,
    toAddress: buildToAddress(shipping),
    net_weight: String(config.netWeightGrams),
    gross_weight: String(config.grossWeightGrams),
    net_value: String(order.totalInr),
    codValue: '',
    no_of_packages: '1',
    boxes: [
      {
        box_number: boxNumber,
        lock_number: boxNumber,
        length: config.boxLengthCm,
        breadth: config.boxBreadthCm,
        height: config.boxHeightCm,
        gross_weight: String(config.grossWeightGrams),
      },
    ],
    invoice: [order.orderNumber],
    remark: `Daiorus order ${order.orderNumber}`,
  };
}

export async function bookShipmentForOrder(orderId, { force = false, allowPendingPayment = false } = {}) {
  if (!isSequelConfigured()) {
    return { skipped: true, reason: 'not_configured' };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shippingAddress: true,
      shipment: true,
    },
  });

  if (!order) {
    return { skipped: true, reason: 'order_not_found' };
  }

  const bookableStatuses = allowPendingPayment
    ? ['PENDING', 'PAID', 'PROCESSING']
    : ['PAID', 'PROCESSING'];

  if (!bookableStatuses.includes(order.status)) {
    return { skipped: true, reason: 'order_not_bookable' };
  }

  if (order.shipment?.status === 'BOOKED' && order.shipment.docketNumber && !force) {
    return { skipped: true, reason: 'already_booked', shipment: order.shipment };
  }

  const shipping = getShippingFromOrder(order);
  if (!shipping?.postalCode || !shipping.line1) {
    await upsertFailedShipment(order.id, 'Missing shipping address on order.');
    return { success: false, error: 'Missing shipping address on order.' };
  }

  if (!shipping.fullName || !normalizePhone(shipping.phone)) {
    await upsertFailedShipment(order.id, 'Missing customer name or phone on order.');
    return { success: false, error: 'Missing customer name or phone on order.' };
  }

  if (String(shipping.country || 'IN').toUpperCase() !== 'IN') {
    return { skipped: true, reason: 'international_order' };
  }

  const payload = buildCreateShipmentPayload(order, shipping);

  try {
    const response = await createSequelShipment(payload);
    const data = response.data || {};
    const estimatedDelivery =
      data.estimatedDelivery || data.estimated_delivery || data.estiimated_delivery || null;

    const shipment = await prisma.shipment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        docketNumber: data.docketNumber || null,
        brn: data.brn || null,
        status: 'BOOKED',
        estimatedDelivery,
        docketPrintUrl: data.docket_print || null,
        rawResponse: response,
        errorMessage: null,
      },
      update: {
        docketNumber: data.docketNumber || null,
        brn: data.brn || null,
        status: 'BOOKED',
        estimatedDelivery,
        docketPrintUrl: data.docket_print || null,
        rawResponse: response,
        errorMessage: null,
        cancelReason: null,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: order.status === 'PAID' ? 'PROCESSING' : order.status },
    });

    return { success: true, shipment, response, sequelOnly: order.status === 'PENDING' };
  } catch (err) {
    const message = err?.message || 'Could not create Sequel247 shipment';
    const shipment = await upsertFailedShipment(order.id, message);
    return { success: false, error: message, shipment };
  }
}

async function upsertFailedShipment(orderId, errorMessage) {
  return prisma.shipment.upsert({
    where: { orderId },
    create: {
      orderId,
      status: 'FAILED',
      errorMessage,
    },
    update: {
      status: 'FAILED',
      errorMessage,
    },
  });
}

export async function cancelShipmentForOrder(orderId, cancelReason, { preserveOrderStatus = false } = {}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!order) {
    throw new Error('Order not found.');
  }

  const shipment = await prisma.shipment.findUnique({ where: { orderId } });
  if (!shipment?.docketNumber) {
    throw new Error('No booked docket found for this order.');
  }

  const response = await cancelSequelShipment({
    docket: shipment.docketNumber,
    cancelReason,
  });

  const updated = await prisma.shipment.update({
    where: { orderId },
    data: {
      status: 'CANCELLED',
      cancelReason,
      rawResponse: response,
    },
  });

  if (!preserveOrderStatus && order.status !== 'PENDING') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
  }

  return updated;
}

export { formatPickupDate, buildCreateShipmentPayload };

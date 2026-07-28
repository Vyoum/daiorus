import prisma from '../prisma';

const HIDDEN_STATUSES = ['CANCELLED', 'REFUNDED'];

export async function getAccountOrders({ userId, email }) {
  if (!userId && !email) return [];

  const or = [];
  if (userId) or.push({ userId });
  if (email) or.push({ guestEmail: email.trim().toLowerCase() });

  try {
    return await prisma.order.findMany({
      where: {
        OR: or,
        status: { notIn: HIDDEN_STATUSES },
      },
      include: {
        items: {
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[account:orders]', err?.message || err);
    return [];
  }
}

export async function getAccountOrderByNumber({ orderNumber, userId, email }) {
  const number = String(orderNumber || '').trim();
  if (!number || (!userId && !email)) return null;

  const or = [];
  if (userId) or.push({ userId });
  if (email) or.push({ guestEmail: email.trim().toLowerCase() });

  try {
    return await prisma.order.findFirst({
      where: {
        orderNumber: number,
        OR: or,
        status: { notIn: HIDDEN_STATUSES },
      },
      include: {
        items: {
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
        shipment: true,
      },
    });
  } catch (err) {
    console.error('[account:order]', err?.message || err);
    return null;
  }
}

export function getShippingFromOrder(order) {
  let fromNotes = null;
  try {
    const notes = order?.notes ? JSON.parse(order.notes) : null;
    fromNotes = notes?.shippingAddress || null;
  } catch {
    fromNotes = null;
  }

  if (order?.shippingAddress) {
    return {
      fullName: fromNotes?.fullName || null,
      phone: fromNotes?.phone || null,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    };
  }

  if (!fromNotes) return null;

  return {
    fullName: fromNotes.fullName || null,
    phone: fromNotes.phone || null,
    line1: fromNotes.line1 || '',
    line2: fromNotes.line2 || null,
    city: fromNotes.city || '',
    state: fromNotes.state || '',
    postalCode: fromNotes.postalCode || '',
    country: fromNotes.country || 'IN',
  };
}

export function orderStatusLabel(status) {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending', tone: 'pending' };
    case 'PAID':
      return { label: 'Paid', tone: 'paid' };
    case 'PROCESSING':
      return { label: 'Processing', tone: 'processing' };
    case 'SHIPPED':
      return { label: 'Shipped', tone: 'shipped' };
    case 'DELIVERED':
      return { label: 'Delivered', tone: 'delivered' };
    case 'CANCELLED':
      return { label: 'Cancelled', tone: 'cancelled' };
    case 'REFUNDED':
      return { label: 'Refunded', tone: 'cancelled' };
    default:
      return { label: status || '—', tone: 'pending' };
  }
}

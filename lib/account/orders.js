import prisma from '../prisma';

export async function getAccountOrders({ userId, email }) {
  if (!userId && !email) return [];

  const or = [];
  if (userId) or.push({ userId });
  if (email) or.push({ guestEmail: email.trim().toLowerCase() });

  try {
    return await prisma.order.findMany({
      where: { OR: or },
      include: {
        items: {
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[account:orders]', err?.message || err);
    return [];
  }
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

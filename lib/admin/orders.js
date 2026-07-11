import prisma from '../prisma';

export async function getAdminOrders({ take = 50 } = {}) {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { orderBy: { lineTotalInr: 'desc' } },
        user: { select: { id: true, name: true, email: true } },
        shippingAddress: { select: { country: true, city: true } },
      },
    }),
    prisma.order.count(),
  ]);

  return {
    total,
    orders: orders.map((order) => {
      const primary = order.items[0];
      const customerName =
        order.user?.name ||
        (order.guestEmail ? order.guestEmail.split('@')[0] : 'Guest');
      const customerEmail = order.user?.email || order.guestEmail || '—';

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        totalInr: order.totalInr,
        customerName,
        customerEmail,
        productName:
          order.items.length > 1
            ? `${primary?.productName || 'Item'} +${order.items.length - 1}`
            : primary?.productName || '—',
        productImage: primary?.imageUrl || null,
        itemCount: order.items.length,
        country: order.shippingAddress?.country || 'IN',
      };
    }),
  };
}

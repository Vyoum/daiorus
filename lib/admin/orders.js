import prisma from '../prisma';
import { emptyOrders, safeAdminQuery } from './safe';

async function loadAdminOrders({ take = 50 } = {}) {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { orderBy: { lineTotalInr: 'desc' } },
        user: { select: { id: true, name: true, email: true } },
        shippingAddress: { select: { country: true, city: true } },
        shipment: {
          select: {
            status: true,
            docketNumber: true,
            brn: true,
            estimatedDelivery: true,
            docketPrintUrl: true,
            errorMessage: true,
          },
        },
      },
    }),
    prisma.order.count(),
  ]);

  return {
    total,
    error: null,
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
        shipment: order.shipment
          ? {
              status: order.shipment.status,
              docketNumber: order.shipment.docketNumber,
              brn: order.shipment.brn,
              estimatedDelivery: order.shipment.estimatedDelivery,
              docketPrintUrl: order.shipment.docketPrintUrl,
              errorMessage: order.shipment.errorMessage,
            }
          : null,
      };
    }),
  };
}

export async function getAdminOrders(options) {
  return safeAdminQuery('orders', () => loadAdminOrders(options), emptyOrders);
}

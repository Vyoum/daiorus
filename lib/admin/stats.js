import prisma from '../prisma';
import { ensureCatalogSynced } from './catalog';

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n) {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

export async function getDashboardStats() {
  await ensureCatalogSynced();

  const today = startOfDay();
  const weekAgo = daysAgo(6);
  const paidStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const pendingStatuses = ['PENDING', 'PROCESSING'];

  const [
    revenueAgg,
    todayRevenueAgg,
    totalOrders,
    pendingOrders,
    stockAgg,
    lowStockCount,
    overseasOrders,
    recentOrders,
    lowStockProducts,
    recentCustomers,
    cancelledOrders,
    weekOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: paidStatuses } },
      _sum: { totalInr: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: paidStatuses }, createdAt: { gte: today } },
      _sum: { totalInr: true },
      _count: true,
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: pendingStatuses } } }),
    prisma.inventory.aggregate({ _sum: { quantity: true } }),
    prisma.inventory.count({
      where: {
        trackInventory: true,
        quantity: { lte: 5 },
      },
    }),
    prisma.order.count({
      where: {
        shippingAddress: { is: { country: { not: 'IN' } } },
      },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { take: 1 },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.inventory.findMany({
      where: { trackInventory: true },
      include: { product: { select: { name: true } } },
      orderBy: { quantity: 'asc' },
      take: 20,
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { status: 'CANCELLED' },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: { orderNumber: true, updatedAt: true, guestEmail: true },
    }),
    prisma.order.findMany({
      where: {
        status: { in: paidStatuses },
        createdAt: { gte: weekAgo },
      },
      select: { totalInr: true, createdAt: true },
    }),
  ]);

  const lowStock = lowStockProducts.filter((row) => row.quantity <= row.lowStockAt);
  const lowStockTotal = Math.max(lowStockCount, lowStock.length);

  // Returning customers: emails with >1 paid order
  const paidOrders = await prisma.order.findMany({
    where: { status: { in: paidStatuses } },
    select: { guestEmail: true, userId: true },
  });
  const emailCounts = new Map();
  for (const order of paidOrders) {
    const key = order.userId || order.guestEmail;
    if (!key) continue;
    emailCounts.set(key, (emailCounts.get(key) || 0) + 1);
  }
  const returning = [...emailCounts.values()].filter((n) => n > 1).length;
  const uniqueCustomers = emailCounts.size;
  const returningPct =
    uniqueCustomers === 0 ? 0 : Math.round((returning / uniqueCustomers) * 100);

  // Chart: last 7 days revenue
  const dayKeys = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = daysAgo(i);
    dayKeys.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      total: 0,
    });
  }
  for (const order of weekOrders) {
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    const bucket = dayKeys.find((d) => d.key === key);
    if (bucket) bucket.total += order.totalInr || 0;
  }
  const maxDay = Math.max(...dayKeys.map((d) => d.total), 1);
  const chartData = dayKeys.map((d) => ({
    day: d.label,
    total: d.total,
    height: `${Math.max(8, Math.round((d.total / maxDay) * 100))}%`,
    highlight: d.total === maxDay && d.total > 0,
  }));

  const activity = [];

  for (const order of recentOrders.slice(0, 5)) {
    const itemName = order.items[0]?.productName || 'items';
    const customer =
      order.user?.name || order.user?.email || order.guestEmail || 'Guest';
    activity.push({
      type: order.status === 'CANCELLED' ? 'cancelled' : 'order',
      title:
        order.status === 'CANCELLED'
          ? `Order Cancelled ${order.orderNumber}`
          : `New Order ${order.orderNumber}`,
      desc:
        order.status === 'CANCELLED'
          ? `Order for ${customer} was cancelled.`
          : `${customer} purchased "${itemName}"`,
      at: order.createdAt,
    });
  }

  for (const row of lowStock.slice(0, 3)) {
    activity.push({
      type: 'stock',
      title: 'Stock Alert',
      desc: `"${row.product.name}" is running low (${row.quantity} left)`,
      at: row.updatedAt,
    });
  }

  for (const user of recentCustomers.slice(0, 2)) {
    activity.push({
      type: 'customer',
      title: 'New Customer Registration',
      desc: `${user.name || user.email} created an account`,
      at: user.createdAt,
    });
  }

  for (const order of cancelledOrders.slice(0, 2)) {
    if (activity.some((a) => a.title.includes(order.orderNumber))) continue;
    activity.push({
      type: 'cancelled',
      title: `Order Cancelled ${order.orderNumber}`,
      desc: 'Customer requested cancellation.',
      at: order.updatedAt,
    });
  }

  activity.sort((a, b) => new Date(b.at) - new Date(a.at));

  return {
    totalRevenue: revenueAgg._sum.totalInr || 0,
    todaySales: todayRevenueAgg._sum.totalInr || 0,
    todayOrderCount: todayRevenueAgg._count || 0,
    totalOrders,
    pendingOrders,
    productsInStock: stockAgg._sum.quantity || 0,
    lowStock: lowStockTotal,
    overseasOrders,
    returningPct,
    chartData,
    activity: activity.slice(0, 8),
  };
}

import prisma from '../prisma';
import { syncAuthUsersToDatabase } from './users';
import { safeAdminQuery } from './safe';

const PAID = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

async function loadAdminCustomers() {
  // Sync logged-in Supabase Auth users into Prisma (needs service role key)
  try {
    await syncAuthUsersToDatabase();
  } catch (err) {
    console.error('Auth user sync failed:', err.message);
  }

  const [users, guestOrders] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: { totalInr: true, status: true, createdAt: true },
        },
        addresses: { take: 1, orderBy: { isDefault: 'desc' } },
        _count: { select: { wishlist: true, orders: true } },
      },
    }),
    prisma.order.findMany({
      where: { userId: null, guestEmail: { not: null } },
      select: {
        guestEmail: true,
        totalInr: true,
        status: true,
        createdAt: true,
        orderNumber: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const customers = users.map((user) => {
    const paid = user.orders.filter((o) => PAID.includes(o.status));
    const lifetime = paid.reduce((sum, o) => sum + o.totalInr, 0);
    return {
      id: user.id,
      type: 'account',
      role: user.role,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      orderCount: user._count.orders,
      wishlistCount: user._count.wishlist,
      lifetimeValue: lifetime,
      avgOrderValue: paid.length ? Math.round(lifetime / paid.length) : 0,
      country: user.addresses[0]?.country || 'IN',
    };
  });

  const guestMap = new Map();
  for (const order of guestOrders) {
    const email = order.guestEmail;
    if (!email) continue;
    if (customers.some((c) => c.email === email)) continue;

    if (!guestMap.has(email)) {
      guestMap.set(email, {
        id: `guest:${email}`,
        type: 'guest',
        role: null,
        name: email.split('@')[0],
        email,
        phone: null,
        createdAt: order.createdAt,
        orderCount: 0,
        wishlistCount: 0,
        lifetimeValue: 0,
        paidCount: 0,
        country: 'IN',
      });
    }
    const row = guestMap.get(email);
    row.orderCount += 1;
    if (PAID.includes(order.status)) {
      row.lifetimeValue += order.totalInr;
      row.paidCount += 1;
    }
    if (new Date(order.createdAt) < new Date(row.createdAt)) {
      row.createdAt = order.createdAt;
    }
  }

  for (const row of guestMap.values()) {
    row.avgOrderValue = row.paidCount
      ? Math.round(row.lifetimeValue / row.paidCount)
      : 0;
    delete row.paidCount;
    customers.push(row);
  }

  customers.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'account' ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return customers;
}

export async function getAdminCustomers() {
  return safeAdminQuery('customers', loadAdminCustomers, () => []);
}

export async function getAdminCustomerDetail(id) {
  if (!id) return null;

  if (id.startsWith('guest:')) {
    const email = id.slice('guest:'.length);
    const orders = await prisma.order.findMany({
      where: { guestEmail: email },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    if (orders.length === 0) return null;

    const paid = orders.filter((o) => PAID.includes(o.status));
    const lifetime = paid.reduce((sum, o) => sum + o.totalInr, 0);

    return {
      id,
      type: 'guest',
      role: null,
      name: email.split('@')[0],
      email,
      phone: null,
      createdAt: orders[orders.length - 1].createdAt,
      lifetimeValue: lifetime,
      orderCount: orders.length,
      avgOrderValue: paid.length ? Math.round(lifetime / paid.length) : 0,
      addresses: [],
      wishlist: [],
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        status: o.status,
        totalInr: o.totalInr,
      })),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: { isDefault: 'desc' } },
      wishlist: {
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!user) return null;

  const paid = user.orders.filter((o) => PAID.includes(o.status));
  const lifetime = paid.reduce((sum, o) => sum + o.totalInr, 0);

  return {
    id: user.id,
    type: 'account',
    role: user.role,
    name: user.name || user.email.split('@')[0],
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    lifetimeValue: lifetime,
    orderCount: user.orders.length,
    avgOrderValue: paid.length ? Math.round(lifetime / paid.length) : 0,
    addresses: user.addresses,
    wishlist: user.wishlist.map((w) => ({
      id: w.id,
      name: w.product.name,
      priceInr: w.product.priceInr,
      imageUrl: w.product.imageUrl,
      createdAt: w.createdAt,
    })),
    orders: user.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      status: o.status,
      totalInr: o.totalInr,
    })),
  };
}

const EMPTY_STATS = {
  totalRevenue: 0,
  todaySales: 0,
  todayOrderCount: 0,
  totalOrders: 0,
  pendingOrders: 0,
  productsInStock: 0,
  lowStock: 0,
  overseasOrders: 0,
  returningPct: 0,
  chartData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    total: 0,
    height: '8%',
    highlight: false,
  })),
  activity: [],
  error: null,
};

export function emptyDashboardStats(errorMessage) {
  return { ...EMPTY_STATS, error: errorMessage || 'Database unavailable' };
}

export function emptyOrders(errorMessage) {
  return { total: 0, orders: [], error: errorMessage || 'Database unavailable' };
}

export function emptyProducts(errorMessage) {
  return { total: 0, products: [], error: errorMessage || 'Database unavailable' };
}

export async function safeAdminQuery(label, fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.error(`[admin:${label}]`, err?.message || err);
    const message =
      err?.code === 'P1000' ||
      err?.message?.includes('AuthenticationFailed') ||
      err?.message?.includes('credentials')
        ? 'Database authentication failed. Check DATABASE_URL on Vercel.'
        : err?.message || 'Could not load admin data';
    if (typeof fallback === 'function') return fallback(message);
    return { ...fallback, error: message };
  }
}

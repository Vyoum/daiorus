import prisma from '../prisma';
import { emptyNewsletters, safeAdminQuery } from './safe';

async function loadAdminNewsletters({ take = 500 } = {}) {
  const [subscribers, total] = await Promise.all([
    prisma.newsletter.findMany({
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.newsletter.count(),
  ]);

  return {
    total,
    error: null,
    subscribers: subscribers.map((row) => ({
      id: row.id,
      phone: row.phone,
      source: row.source,
      createdAt: row.createdAt,
    })),
  };
}

export async function getAdminNewsletters(options) {
  return safeAdminQuery('newsletters', () => loadAdminNewsletters(options), emptyNewsletters);
}

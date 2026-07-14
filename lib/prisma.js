import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      // Fail fast instead of hanging the page for minutes (EAUTHTIMEOUT)
      connectionTimeoutMillis: 8_000,
      idleTimeoutMillis: 30_000,
      max: 10,
      ssl: { rejectUnauthorized: false },
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pgPool = pool;
  }

  pool.on('error', (err) => {
    console.error('[prisma:pool]', err?.message || err);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

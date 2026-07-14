import prisma from '../prisma';
import { createAdminClient } from '../supabase/admin';

/**
 * Upsert a Prisma user from a Supabase auth user payload.
 * Never changes role — Admin/Customer is set only from the Customers page
 * (or first-admin bootstrap on /api/admin/me).
 */
export async function upsertUserFromAuth(authUser) {
  if (!authUser?.email) return null;

  const email = authUser.email.trim().toLowerCase();
  const name =
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    email.split('@')[0];

  // Case-insensitive match so promoting Admin@x.com still works for admin@x.com
  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, email: true, role: true },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        email,
        ...(name ? { name } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  return prisma.user.create({
    data: {
      email,
      name,
      role: 'CUSTOMER',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

/**
 * Pull all Supabase Auth users into the Prisma users table.
 * Requires SUPABASE_SERVICE_ROLE_KEY.
 */
export async function syncAuthUsersToDatabase() {
  const admin = createAdminClient();
  if (!admin) {
    return { synced: 0, skipped: true };
  }

  let page = 1;
  const perPage = 100;
  let synced = 0;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users || [];
    if (users.length === 0) break;

    for (const authUser of users) {
      if (!authUser.email) continue;
      await upsertUserFromAuth(authUser);
      synced += 1;
    }

    if (users.length < perPage) break;
    page += 1;
  }

  return { synced, skipped: false };
}

export async function updateUserRole(userId, role) {
  if (!['CUSTOMER', 'ADMIN'].includes(role)) {
    throw new Error('Invalid role');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

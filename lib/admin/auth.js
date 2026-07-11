import { NextResponse } from 'next/server';
import { createClient } from '../supabase/server';
import prisma from '../prisma';

/**
 * Resolve the signed-in Supabase user + Prisma profile.
 * Returns null fields when unauthenticated.
 */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return { supabase, authUser: null, dbUser: null };
  }

  const email = user.email.trim().toLowerCase();
  let dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });

  // First sign-in may not have synced yet — upsert as CUSTOMER.
  if (!dbUser) {
    dbUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          email.split('@')[0],
        role: 'CUSTOMER',
      },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  return { supabase, authUser: user, dbUser };
}

/**
 * Returns the admin profile when the current user has role ADMIN.
 * Allows bootstrap when zero admins exist and allowBootstrap is true.
 */
export async function getCurrentAdmin({ allowBootstrap = false } = {}) {
  const { authUser, dbUser } = await getSessionUser();

  if (!authUser || !dbUser) {
    return null;
  }

  if (dbUser.role === 'ADMIN') {
    return { authUser, dbUser, bootstrap: false };
  }

  if (allowBootstrap) {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 0) {
      return { authUser, dbUser, bootstrap: true };
    }
  }

  return null;
}

/**
 * API helper — returns { admin } or { error: NextResponse }.
 */
export async function requireAdminApi({ allowBootstrap = false } = {}) {
  try {
    const { authUser, dbUser } = await getSessionUser();

    if (!authUser || !dbUser) {
      return {
        error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
      };
    }

    if (dbUser.role === 'ADMIN') {
      return { admin: { authUser, dbUser, bootstrap: false } };
    }

    if (allowBootstrap) {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount === 0) {
        return { admin: { authUser, dbUser, bootstrap: true } };
      }
    }

    return {
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  } catch (err) {
    console.error('[admin:auth]', err?.message || err);
    return {
      error: NextResponse.json(
        { error: 'Could not verify admin access' },
        { status: 503 }
      ),
    };
  }
}

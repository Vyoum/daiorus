import { NextResponse } from 'next/server';
import { createClient } from '../supabase/server';
import prisma from '../prisma';
import { upsertUserFromAuth } from './users';

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

  const dbUser = await upsertUserFromAuth(user);
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

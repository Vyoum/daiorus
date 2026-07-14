import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { upsertUserFromAuth } from '@/lib/admin/users';

/**
 * Returns the signed-in store profile (any role).
 * Used by admin login to decide access / bootstrap.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let dbUser = await upsertUserFromAuth(user);

    // First install only: no admins yet → this signed-in user becomes Admin
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 0 && dbUser.role !== 'ADMIN') {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: 'ADMIN' },
        select: { id: true, email: true, name: true, role: true },
      });
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      isAdmin: dbUser.role === 'ADMIN',
      bootstrap: adminCount === 0,
    });
  } catch (err) {
    console.error('[admin:me]', err?.message || err);
    return NextResponse.json(
      { error: 'Could not verify admin access' },
      { status: 503 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { updateUserRole } from '@/lib/admin/users';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email.toLowerCase() },
    select: { id: true, role: true },
  });

  // Allow role changes if caller is ADMIN, or if there are no admins yet (bootstrap).
  if (dbUser?.role === 'ADMIN') {
    return { user, dbUser };
  }

  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount === 0) {
    return { user, dbUser, bootstrap: true };
  }

  return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const role = body?.role;

    if (!['CUSTOMER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Role must be CUSTOMER or ADMIN' }, { status: 400 });
    }

    // Prevent removing the last admin
    if (role === 'CUSTOMER') {
      const target = await prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });
      if (target?.role === 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
        if (adminCount <= 1 && !auth.bootstrap) {
          return NextResponse.json(
            { error: 'Cannot demote the last admin' },
            { status: 400 }
          );
        }
      }
    }

    const updated = await updateUserRole(id, role);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('update role error:', err);
    return NextResponse.json({ error: 'Could not update role' }, { status: 500 });
  }
}

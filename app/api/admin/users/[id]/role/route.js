import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { updateUserRole } from '@/lib/admin/users';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdminApi({ allowBootstrap: true });
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
        if (adminCount <= 1 && !auth.admin.bootstrap) {
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

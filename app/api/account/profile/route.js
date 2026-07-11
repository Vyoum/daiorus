import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request) {
  try {
    const { authUser, dbUser } = await getSessionUser();
    if (!authUser?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body?.name || '').trim();
    const phone = String(body?.phone || '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const email = (dbUser?.email || authUser.email).toLowerCase();

    const updated = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone: phone || null,
      },
      create: {
        email,
        name,
        phone: phone || null,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[account:profile]', err?.message || err);
    return NextResponse.json({ error: 'Could not update profile' }, { status: 500 });
  }
}

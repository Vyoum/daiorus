import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';
import {
  clearDefaultAddresses,
  getAccountAddresses,
  validateAddressBody,
} from '@/lib/account/addresses';

async function requireAccountUser() {
  const { authUser, dbUser } = await getSessionUser();
  if (!authUser?.email || !dbUser?.id) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  }
  return { dbUser };
}

export async function GET() {
  try {
    const auth = await requireAccountUser();
    if (auth.error) return auth.error;

    const addresses = await getAccountAddresses(auth.dbUser.id);
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error('[account:addresses:GET]', err?.message || err);
    return NextResponse.json({ error: 'Could not load addresses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAccountUser();
    if (auth.error) return auth.error;

    const body = await request.json();
    const validated = validateAddressBody(body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { data } = validated;
    if (data.isDefault) {
      await clearDefaultAddresses(auth.dbUser.id);
    } else {
      const count = await prisma.address.count({ where: { userId: auth.dbUser.id } });
      if (count === 0) data.isDefault = true;
    }

    await prisma.address.create({
      data: {
        userId: auth.dbUser.id,
        ...data,
      },
    });

    const addresses = await getAccountAddresses(auth.dbUser.id);
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error('[account:addresses:POST]', err?.message || err);
    return NextResponse.json({ error: 'Could not save address' }, { status: 500 });
  }
}

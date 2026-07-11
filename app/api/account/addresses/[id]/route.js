import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';
import {
  clearDefaultAddresses,
  getAccountAddresses,
  validateAddressBody,
} from '@/lib/account/addresses';

async function requireOwnedAddress(id) {
  const { authUser, dbUser } = await getSessionUser();
  if (!authUser?.email || !dbUser?.id) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  }

  const address = await prisma.address.findFirst({
    where: { id, userId: dbUser.id },
  });

  if (!address) {
    return { error: NextResponse.json({ error: 'Address not found' }, { status: 404 }) };
  }

  return { dbUser, address };
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireOwnedAddress(id);
    if (auth.error) return auth.error;

    const body = await request.json();

    // Allow partial updates (e.g. set default only)
    const isPartialDefault =
      Object.keys(body || {}).length === 1 && typeof body.isDefault === 'boolean';

    let data;
    if (isPartialDefault) {
      data = { isDefault: Boolean(body.isDefault) };
    } else {
      const validated = validateAddressBody(body);
      if (validated.error) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }
      data = validated.data;
    }

    if (data.isDefault) {
      await clearDefaultAddresses(auth.dbUser.id, id);
    }

    await prisma.address.update({
      where: { id },
      data,
    });

    // If we unset default and no other default exists, keep this one default.
    if (data.isDefault === false) {
      const defaults = await prisma.address.count({
        where: { userId: auth.dbUser.id, isDefault: true },
      });
      if (defaults === 0) {
        await prisma.address.update({
          where: { id },
          data: { isDefault: true },
        });
      }
    }

    const addresses = await getAccountAddresses(auth.dbUser.id);
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error('[account:addresses:PATCH]', err?.message || err);
    return NextResponse.json({ error: 'Could not update address' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireOwnedAddress(id);
    if (auth.error) return auth.error;

    const wasDefault = auth.address.isDefault;
    await prisma.address.delete({ where: { id } });

    if (wasDefault) {
      const next = await prisma.address.findFirst({
        where: { userId: auth.dbUser.id },
        orderBy: { id: 'desc' },
      });
      if (next) {
        await prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    const addresses = await getAccountAddresses(auth.dbUser.id);
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error('[account:addresses:DELETE]', err?.message || err);
    return NextResponse.json({ error: 'Could not delete address' }, { status: 500 });
  }
}

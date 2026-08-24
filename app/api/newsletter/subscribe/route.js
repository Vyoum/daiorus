import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/** Digits only; keeps leading country code if present. */
function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return hasPlus ? `+${digits}` : digits;
}

function isValidPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body?.phone);
    const source = String(body?.source || 'inner_circle').trim() || 'inner_circle';

    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number.' },
        { status: 400 },
      );
    }

    await prisma.newsletter.upsert({
      where: { phone },
      create: { phone, source },
      update: { source },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[newsletter:subscribe]', err?.message || err);
    return NextResponse.json({ error: 'Could not subscribe right now.' }, { status: 500 });
  }
}

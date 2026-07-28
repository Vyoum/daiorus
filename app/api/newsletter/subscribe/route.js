import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);
    const source = String(body?.source || 'inner_circle').trim() || 'inner_circle';

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    await prisma.newsletter.upsert({
      where: { email },
      create: { email, source },
      update: { source },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[newsletter:subscribe]', err?.message || err);
    return NextResponse.json({ error: 'Could not subscribe right now.' }, { status: 500 });
  }
}

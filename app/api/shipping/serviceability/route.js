import { NextResponse } from 'next/server';
import { checkSequelServiceability } from '@/lib/sequel247/client';
import { isSequelConfigured } from '@/lib/sequel247/config';

export async function POST(request) {
  try {
    if (!isSequelConfigured()) {
      return NextResponse.json(
        { error: 'Shipping serviceability is not configured yet.' },
        { status: 503 },
      );
    }

    const body = await request.json();
    const pinCode = String(body?.pinCode || body?.postalCode || '').trim();

    if (!/^\d{6}$/.test(pinCode)) {
      return NextResponse.json({ error: 'Enter a valid 6-digit pincode.' }, { status: 400 });
    }

    const result = await checkSequelServiceability(pinCode);
    return NextResponse.json({
      serviceable: true,
      message: result.message,
      data: result.data || null,
    });
  } catch (err) {
    const message = err?.message || 'Could not check serviceability';
    const notServiceable = /not servieceable|not serviceable|pincode not found/i.test(message);
    if (notServiceable) {
      return NextResponse.json({ serviceable: false, message }, { status: 200 });
    }
    console.error('[shipping:serviceability]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

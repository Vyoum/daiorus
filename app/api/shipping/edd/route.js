import { NextResponse } from 'next/server';
import { calculateSequelEdd } from '@/lib/sequel247/client';
import { getSequelConfig, isSequelConfigured } from '@/lib/sequel247/config';
import { formatPickupDate } from '@/lib/sequel247/shipment';

export async function POST(request) {
  try {
    if (!isSequelConfigured()) {
      return NextResponse.json({ error: 'EDD is not configured yet.' }, { status: 503 });
    }

    const body = await request.json();
    const config = getSequelConfig();
    const destinationPincode = String(body?.destinationPincode || body?.postalCode || '').trim();
    const originPincode = String(body?.originPincode || config.originPincode || '').trim();
    const pickupDate = String(body?.pickupDate || formatPickupDate()).trim();

    if (!/^\d{6}$/.test(destinationPincode)) {
      return NextResponse.json({ error: 'Enter a valid destination pincode.' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(originPincode)) {
      return NextResponse.json(
        { error: 'Origin pincode is not configured (SEQUEL247_ORIGIN_PINCODE).' },
        { status: 503 },
      );
    }

    const result = await calculateSequelEdd({
      originPincode,
      destinationPincode,
      pickupDate,
    });

    return NextResponse.json({
      estimatedDelivery: result.data?.estimated_delivery || null,
      estimatedDay: result.data?.estimated_day || null,
    });
  } catch (err) {
    console.error('[shipping:edd]', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Could not calculate EDD' }, { status: 500 });
  }
}

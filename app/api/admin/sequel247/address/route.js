import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { createSequelAddress } from '@/lib/sequel247/client';

export async function POST(request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const body = await request.json();
    const result = await createSequelAddress({
      address_type: body.address_type,
      address_short_code: body.address_short_code,
      nature_of_address: body.nature_of_address,
      gst_in: body.gst_in,
      business_entity_name: body.business_entity_name,
      address_line1: body.address_line1,
      address_line2: body.address_line2,
      pinCode: body.pinCode,
      auth_receiver_name: body.auth_receiver_name,
      auth_receiver_phone: body.auth_receiver_phone,
      auth_receiver_email: body.auth_receiver_email,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin:sequel247:address]', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Could not create Sequel address' }, { status: 500 });
  }
}

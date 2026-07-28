import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { getSequelConnectionStatus } from '@/lib/sequel247/status';

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const status = await getSequelConnectionStatus();
    return NextResponse.json(status);
  } catch (err) {
    console.error('[admin:sequel247:status]', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Could not check Sequel status' }, { status: 500 });
  }
}

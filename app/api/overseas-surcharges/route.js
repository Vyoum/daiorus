import { NextResponse } from 'next/server';
import { getOverseasSurchargeMap } from '@/lib/overseas-pricing';

export async function GET() {
  try {
    const surcharges = await getOverseasSurchargeMap();
    return NextResponse.json(
      { surcharges },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (err) {
    console.error('[overseas-surcharges]', err?.message || err);
    return NextResponse.json({ error: 'Could not load surcharges' }, { status: 500 });
  }
}

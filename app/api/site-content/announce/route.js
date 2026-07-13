import { NextResponse } from 'next/server';
import { getAnnounceBanner } from '@/lib/site-content';

export async function GET() {
  try {
    const announce = await getAnnounceBanner();
    return NextResponse.json(
      { announce },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      },
    );
  } catch (err) {
    console.error('[site-content:announce]', err?.message || err);
    return NextResponse.json({ error: 'Could not load announce banner' }, { status: 500 });
  }
}

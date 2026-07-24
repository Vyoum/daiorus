import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import {
  getMediaLibraryContent,
  saveMediaLibraryContent,
} from '@/lib/site-content';

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const content = await getMediaLibraryContent();
    return NextResponse.json(content);
  } catch (err) {
    console.error('[admin:site-content:GET]', err?.message || err);
    return NextResponse.json({ error: 'Could not load site content' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return auth.error;

    const body = await request.json();
    const content = await saveMediaLibraryContent({
      announce: body?.announce || null,
      hero: body?.hero || null,
      signature: body?.signature || null,
      curatedSelects: body?.curatedSelects || null,
      philosophy: body?.philosophy || null,
      process: body?.process || null,
      social: body?.social || null,
    });

    return NextResponse.json(content);
  } catch (err) {
    console.error('[admin:site-content:PUT]', err?.message || err);
    return NextResponse.json({ error: 'Could not save site content' }, { status: 500 });
  }
}

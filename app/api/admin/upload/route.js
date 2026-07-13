import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const BUCKET = 'product-images';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function extensionFor(mime, filename) {
  const fromName = String(filename || '')
    .split('.')
    .pop()
    ?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  return 'jpg';
}

export async function POST(request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Upload is not configured. Add SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string' || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP, or GIF images are supported.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Image must be 5MB or smaller.' },
        { status: 400 },
      );
    }

    const ext = extensionFor(file.type, file.name);
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[admin:upload]', uploadError.message);
      return NextResponse.json(
        { error: uploadError.message || 'Upload failed' },
        { status: 500 },
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (err) {
    console.error('[admin:upload]', err?.message || err);
    return NextResponse.json(
      { error: err.message || 'Could not upload file' },
      { status: 500 },
    );
  }
}

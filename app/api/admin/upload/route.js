import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const BUCKET = 'product-images';
const MAX_BYTES = 4 * 1024 * 1024; // stay under typical Vercel 4.5MB body limit
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXT_TO_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

function fileExtension(filename = '') {
  return String(filename).split('.').pop()?.toLowerCase() || '';
}

function resolveMime(file) {
  const type = String(file.type || '').toLowerCase().trim();
  if (ALLOWED_TYPES.has(type)) {
    return type === 'image/jpg' || type === 'image/pjpeg' ? 'image/jpeg' : type;
  }
  const ext = fileExtension(file.name);
  return EXT_TO_MIME[ext] || null;
}

async function requireAdminLight() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return {
      error: NextResponse.json(
        { error: 'Not signed in. Refresh and sign in to Admin again.' },
        { status: 401 },
      ),
    };
  }

  const email = user.email.trim().toLowerCase();
  const dbUser = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, email: true, role: true },
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'Admin access required to upload images.' },
        { status: 403 },
      ),
    };
  }

  return { admin: dbUser };
}

async function ensureBucket(supabase) {
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (existing) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });

  // Ignore "already exists" races
  if (error && !/exists|duplicate/i.test(error.message || '')) {
    throw new Error(error.message || 'Could not create storage bucket');
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminLight();
    if (auth.error) return auth.error;

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            'Upload is not configured. Add SUPABASE_SERVICE_ROLE_KEY in .env / Vercel, then restart.',
        },
        { status: 503 },
      );
    }

    await ensureBucket(supabase);

    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string' || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mime = resolveMime(file);
    if (!mime) {
      return NextResponse.json(
        {
          error:
            'Only JPG, PNG, WEBP, or GIF images are supported. Convert HEIC/Phone Live Photos before uploading.',
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Image must be 4MB or smaller.' },
        { status: 400 },
      );
    }

    const ext = fileExtension(file.name) || mime.split('/')[1] || 'jpg';
    const safeExt = EXT_TO_MIME[ext] ? (ext === 'jpeg' ? 'jpg' : ext) : 'jpg';
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: mime,
        upsert: false,
        cacheControl: '31536000',
      });

    if (uploadError) {
      console.error('[admin:upload]', uploadError.message);
      return NextResponse.json(
        { error: uploadError.message || 'Upload failed' },
        { status: 500 },
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      return NextResponse.json(
        { error: 'Upload succeeded but public URL is missing. Check bucket is public.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: data.publicUrl, path });
  } catch (err) {
    console.error('[admin:upload]', err?.message || err);
    const message = err?.message || 'Could not upload file';
    const isDb =
      /timeout|EAUTH|P1001|Can't reach database|Database/i.test(message);
    return NextResponse.json(
      {
        error: isDb
          ? 'Database unavailable while checking admin access. Try again in a moment.'
          : message,
      },
      { status: 500 },
    );
  }
}

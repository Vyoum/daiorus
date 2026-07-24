import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const BUCKET = 'product-images';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const EXT_TO_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

function fileExtension(filename = '') {
  return String(filename).split('.').pop()?.toLowerCase() || '';
}

function resolveMime(filename = '', contentType = '') {
  const type = String(contentType || '').toLowerCase().trim();
  if (ALLOWED_TYPES.has(type)) {
    if (type === 'image/jpg' || type === 'image/pjpeg') return 'image/jpeg';
    return type;
  }
  const ext = fileExtension(filename);
  return EXT_TO_MIME[ext] || null;
}

function isVideoMime(mime) {
  return String(mime || '').startsWith('video/');
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
        { error: 'Admin access required to upload media.' },
        { status: 403 },
      ),
    };
  }

  return { admin: dbUser };
}

async function ensureBucket(supabase) {
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (existing) {
    // Raise limits if bucket already exists with a smaller cap
    await supabase.storage.updateBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_VIDEO_BYTES,
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm',
        'video/quicktime',
      ],
    });
    return;
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_VIDEO_BYTES,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ],
  });

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

    const body = await request.json();
    const filename = String(body?.filename || '').trim();
    const size = Number(body?.size) || 0;
    const mime = resolveMime(filename, body?.contentType);

    if (!filename || !mime) {
      return NextResponse.json(
        {
          error:
            'Only JPG, PNG, WEBP, GIF images or MP4 / WEBM / MOV videos are supported.',
        },
        { status: 400 },
      );
    }

    const maxBytes = isVideoMime(mime) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (size > maxBytes) {
      return NextResponse.json(
        {
          error: isVideoMime(mime)
            ? 'Video must be 40MB or smaller.'
            : 'Image must be 8MB or smaller.',
        },
        { status: 400 },
      );
    }

    const ext = fileExtension(filename) || mime.split('/')[1] || 'bin';
    const safeExt = EXT_TO_MIME[ext]
      ? ext === 'jpeg'
        ? 'jpg'
        : ext
      : isVideoMime(mime)
        ? 'mp4'
        : 'jpg';
    const folder = isVideoMime(mime) ? 'social' : 'products';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      console.error('[admin:upload:sign]', error?.message || error);
      return NextResponse.json(
        { error: error?.message || 'Could not create upload URL' },
        { status: 500 },
      );
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({
      path: data.path || path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: publicData?.publicUrl || null,
      contentType: mime,
    });
  } catch (err) {
    console.error('[admin:upload:sign]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Could not create upload URL' },
      { status: 500 },
    );
  }
}

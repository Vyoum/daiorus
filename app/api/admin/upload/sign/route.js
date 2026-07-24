import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';
import { ensureMediaBucket, getMediaBucketName } from '@/lib/admin/upload-storage';

export const runtime = 'nodejs';

const BUCKET = getMediaBucketName();
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const IMAGE_MAX_BYTES = 4 * 1024 * 1024;

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

function resolveMime({ filename, contentType }) {
  const type = String(contentType || '').toLowerCase().trim();
  if (ALLOWED_TYPES.has(type)) {
    return type === 'image/jpg' || type === 'image/pjpeg' ? 'image/jpeg' : type;
  }
  const ext = fileExtension(filename);
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
        { error: 'Admin access required to upload media.' },
        { status: 403 },
      ),
    };
  }

  return { admin: dbUser };
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

    await ensureMediaBucket(supabase);

    const body = await request.json();
    const filename = String(body?.filename || 'media.bin');
    const size = Number(body?.size) || 0;
    const mime = resolveMime({
      filename,
      contentType: body?.contentType,
    });

    if (!mime) {
      return NextResponse.json(
        {
          error:
            'Only JPG, PNG, WEBP, GIF images or MP4 / WEBM / MOV videos are supported.',
        },
        { status: 400 },
      );
    }

    const isVideo = mime.startsWith('video/');
    const maxBytes = isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
    if (size > maxBytes) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Video must be 50MB or smaller.'
            : 'Image must be 4MB or smaller.',
        },
        { status: 400 },
      );
    }

    const ext = fileExtension(filename) || mime.split('/')[1] || (isVideo ? 'mp4' : 'jpg');
    const safeExt = EXT_TO_MIME[ext]
      ? ext === 'jpeg'
        ? 'jpg'
        : ext
      : isVideo
        ? 'mp4'
        : 'jpg';
    const folder = isVideo ? 'social/videos' : 'social/images';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.token || !data?.path) {
      console.error('[admin:upload:sign]', error?.message || error);
      return NextResponse.json(
        { error: error?.message || 'Could not create signed upload URL' },
        { status: 500 },
      );
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return NextResponse.json({
      bucket: BUCKET,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl || null,
      publicUrl: publicData?.publicUrl || null,
      kind: isVideo ? 'video' : 'image',
    });
  } catch (err) {
    console.error('[admin:upload:sign]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Could not prepare upload' },
      { status: 500 },
    );
  }
}

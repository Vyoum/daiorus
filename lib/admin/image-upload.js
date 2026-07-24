/** Shared helpers for admin image + social media uploads. */

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;
const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export function isAllowedImageFile(file) {
  if (!file) return false;
  const type = String(file.type || '').toLowerCase();
  if (/heic|heif|avif|tiff|svg|bmp/i.test(type) || /\.(heic|heif|avif|tiff|svg|bmp)$/i.test(file.name)) {
    return false;
  }
  if (type.startsWith('image/')) {
    return /jpeg|jpg|pjpeg|png|webp|gif/.test(type);
  }
  return IMAGE_EXT.test(file.name || '');
}

export function isAllowedVideoFile(file) {
  if (!file) return false;
  const type = String(file.type || '').toLowerCase();
  if (type.startsWith('video/')) {
    return /mp4|webm|quicktime/.test(type);
  }
  return VIDEO_EXT.test(file.name || '');
}

export function isAllowedMediaFile(file) {
  return isAllowedImageFile(file) || isAllowedVideoFile(file);
}

export function mediaKindFromFile(file) {
  if (isAllowedVideoFile(file)) return 'video';
  if (isAllowedImageFile(file)) return 'image';
  return null;
}

export function mediaKindFromUrl(url) {
  return VIDEO_EXT.test(String(url || '')) || /\/video\//i.test(String(url || ''))
    ? 'video'
    : 'image';
}

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function uploadAdminImage(file) {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }
  if (!data.url) {
    throw new Error('Upload succeeded but no image URL was returned.');
  }
  return data.url;
}

async function uploadViaSignedUrl(file) {
  const contentType =
    String(file.type || '').trim() ||
    (VIDEO_EXT.test(file.name)
      ? 'video/mp4'
      : IMAGE_EXT.test(file.name)
        ? 'image/jpeg'
        : 'application/octet-stream');

  const signRes = await fetch('/api/admin/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType,
      size: file.size,
    }),
  });
  const signed = await parseJson(signRes);
  if (!signRes.ok) {
    throw new Error(signed.error || `Could not prepare upload (${signRes.status})`);
  }

  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(signed.bucket)
    .uploadToSignedUrl(signed.path, signed.token, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || 'Direct upload failed');
  }

  if (!signed.publicUrl) {
    throw new Error('Upload succeeded but no public URL was returned.');
  }
  return signed.publicUrl;
}

/**
 * Upload images (≤4MB via API) or videos (direct signed upload, ≤50MB).
 * Returns the public URL.
 */
export async function uploadAdminMedia(file) {
  if (!isAllowedMediaFile(file)) {
    throw new Error(
      'Please choose JPG, PNG, WEBP, GIF, MP4, WEBM, or MOV files (HEIC / Live Photos are not supported).',
    );
  }

  if (isAllowedVideoFile(file)) {
    if (file.size > VIDEO_MAX_BYTES) {
      throw new Error('Video must be 50MB or smaller.');
    }
    return uploadViaSignedUrl(file);
  }

  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error('Image must be 4MB or smaller.');
  }

  return uploadAdminImage(file);
}

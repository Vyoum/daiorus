/** Shared helpers for admin media uploads (product form + media library). */

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;
const MEDIA_EXT = /\.(jpe?g|png|webp|gif|mp4|webm|mov)$/i;

const IMAGE_TYPES = /^(image\/(jpeg|jpg|pjpeg|png|webp|gif))$/i;
const VIDEO_TYPES = /^(video\/(mp4|webm|quicktime))$/i;

/** Images only (product gallery, covers, most landing sections). */
export function isAllowedImageFile(file) {
  if (!file) return false;
  const type = String(file.type || '').toLowerCase();
  const name = file.name || '';
  if (/heic|heif|avif|tiff|svg|bmp/i.test(type) || /\.(heic|heif|avif|tiff|svg|bmp)$/i.test(name)) {
    return false;
  }
  if (type.startsWith('image/')) return IMAGE_TYPES.test(type);
  return IMAGE_EXT.test(name);
}

/** Images + short videos (homepage Social grid). */
export function isAllowedMediaFile(file) {
  if (!file) return false;
  const type = String(file.type || '').toLowerCase();
  const name = file.name || '';
  if (/heic|heif|avif|tiff|svg|bmp/i.test(type) || /\.(heic|heif|avif|tiff|svg|bmp)$/i.test(name)) {
    return false;
  }
  if (type.startsWith('image/')) return IMAGE_TYPES.test(type);
  if (type.startsWith('video/')) return VIDEO_TYPES.test(type);
  return MEDIA_EXT.test(name);
}

export function mediaKindFromUrl(url = '') {
  const value = String(url || '').split('?')[0].toLowerCase();
  if (VIDEO_EXT.test(value) || value.includes('/video/')) return 'video';
  return 'image';
}

export function mediaKindFromFile(file) {
  if (!file) return 'image';
  const type = String(file.type || '').toLowerCase();
  if (type.startsWith('video/') || VIDEO_EXT.test(file.name || '')) return 'video';
  return 'image';
}

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/** Direct POST for smaller files (under ~3.5MB). */
async function uploadViaApi(file) {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }
  if (!data.url) {
    throw new Error('Upload succeeded but no media URL was returned.');
  }
  return data.url;
}

/**
 * Signed PUT for larger files / videos (bypasses Vercel body size limits).
 */
async function uploadViaSignedUrl(file) {
  const signRes = await fetch('/api/admin/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || undefined,
      size: file.size,
    }),
  });
  const signData = await parseJson(signRes);
  if (!signRes.ok) {
    throw new Error(signData.error || `Could not start upload (${signRes.status})`);
  }

  const putRes = await fetch(signData.signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': signData.contentType || file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error(`Direct upload failed (${putRes.status}). Try a smaller file.`);
  }

  if (!signData.publicUrl) {
    throw new Error('Upload succeeded but no public URL was returned.');
  }
  return signData.publicUrl;
}

const DIRECT_POST_MAX = 3.5 * 1024 * 1024;

export async function uploadAdminImage(file) {
  if (!isAllowedImageFile(file)) {
    throw new Error(
      'Please choose a JPG, PNG, WEBP, or GIF image (HEIC / Live Photos are not supported).',
    );
  }
  if (file.size > DIRECT_POST_MAX) {
    return uploadViaSignedUrl(file);
  }
  return uploadViaApi(file);
}

export async function uploadAdminMedia(file) {
  if (!isAllowedMediaFile(file)) {
    throw new Error(
      'Please choose a JPG, PNG, WEBP, GIF image or MP4 / WEBM / MOV video.',
    );
  }
  // Videos and larger files always use signed direct upload
  if (mediaKindFromFile(file) === 'video' || file.size > DIRECT_POST_MAX) {
    return uploadViaSignedUrl(file);
  }
  return uploadViaApi(file);
}

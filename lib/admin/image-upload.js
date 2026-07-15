/** Shared helpers for admin image uploads (product form + media library). */

const ALLOWED_EXT = /\.(jpe?g|png|webp|gif)$/i;

export function isAllowedImageFile(file) {
  if (!file) return false;
  const type = String(file.type || '').toLowerCase();
  if (/heic|heif|avif|tiff|svg|bmp/i.test(type) || /\.(heic|heif|avif|tiff|svg|bmp)$/i.test(file.name)) {
    return false;
  }
  if (type.startsWith('image/')) {
    return /jpeg|jpg|pjpeg|png|webp|gif/.test(type);
  }
  // Some OS/browsers leave MIME empty — trust the extension
  return ALLOWED_EXT.test(file.name || '');
}

export async function uploadAdminImage(file) {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body });
  let data = {};
  try {
    data = await res.json();
  } catch {
    // non-JSON body
  }
  if (!res.ok) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }
  if (!data.url) {
    throw new Error('Upload succeeded but no image URL was returned.');
  }
  return data.url;
}

import sharp from 'sharp';

/** Max width stored in Supabase for product / marketing photos. */
export const PRODUCT_IMAGE_MAX_WIDTH = 1600;

/** WebP quality for uploads (jewellery detail). */
export const PRODUCT_IMAGE_QUALITY = 85;

/**
 * Resize and convert uploads to WebP q=85 (animated GIFs are kept as GIF).
 * @returns {{ buffer: Buffer, mime: string, ext: string }}
 */
export async function optimizeProductImage(inputBuffer, inputMime = 'image/jpeg') {
  const mime = String(inputMime || 'image/jpeg').toLowerCase();

  if (mime === 'image/gif') {
    const meta = await sharp(inputBuffer, { animated: true }).metadata();
    if (meta.pages && meta.pages > 1) {
      const buffer = await sharp(inputBuffer, { animated: true })
        .rotate()
        .resize({ width: PRODUCT_IMAGE_MAX_WIDTH, withoutEnlargement: true })
        .gif()
        .toBuffer();
      return { buffer, mime: 'image/gif', ext: 'gif' };
    }
  }

  const buffer = await sharp(inputBuffer)
    .rotate()
    .resize({ width: PRODUCT_IMAGE_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: PRODUCT_IMAGE_QUALITY })
    .toBuffer();

  return { buffer, mime: 'image/webp', ext: 'webp' };
}

export function optimizedStoragePath(folder, ext) {
  return `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

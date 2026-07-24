const BUCKET = 'product-images';
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

export function getMediaBucketName() {
  return BUCKET;
}

export async function ensureMediaBucket(supabase) {
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (existing) {
    const { error } = await supabase.storage.updateBucket(BUCKET, {
      public: true,
      fileSizeLimit: VIDEO_MAX_BYTES,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    });
    if (error && !/exists|duplicate/i.test(error.message || '')) {
      console.warn('[admin:upload] bucket update:', error.message);
    }
    return;
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: VIDEO_MAX_BYTES,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  });

  if (error && !/exists|duplicate/i.test(error.message || '')) {
    throw new Error(error.message || 'Could not create storage bucket');
  }
}

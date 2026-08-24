import Image from 'next/image';
import { IMAGE_QUALITY, isOptimizableImageSrc } from '@/lib/image-delivery';

/**
 * Storefront image: Next.js optimizer (WebP q=85) for local + Supabase URLs;
 * plain img fallback for blob/data/other hosts (admin previews, external URLs).
 */
export default function OptimizedImage({
  src,
  alt = '',
  fill = false,
  width,
  height,
  sizes,
  className,
  priority = false,
  quality = IMAGE_QUALITY,
  loading,
  fetchPriority,
  style,
  unoptimized = false,
  ...rest
}) {
  if (!src) return null;

  const useNext = !unoptimized && isOptimizableImageSrc(src);

  if (!useNext) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={style}
        loading={loading ?? (priority ? 'eager' : 'lazy')}
        decoding="async"
        fetchPriority={fetchPriority}
        {...rest}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || '100vw'}
        className={className}
        quality={quality}
        priority={priority}
        style={style}
        {...rest}
      />
    );
  }

  const dimensionStyle =
    width && height
      ? { objectFit: 'cover', ...style }
      : { width: '100%', height: 'auto', ...style };

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 1600}
      height={height || 1200}
      sizes={sizes}
      className={className}
      quality={quality}
      priority={priority}
      style={dimensionStyle}
      {...rest}
    />
  );
}

'use client';

import { useEffect, useState } from 'react';
import styles from './ProductImageCarousel.module.css';

function Chevron({ dir }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProductImageCarousel({ images = [], alt = 'Product' }) {
  const gallery = images.filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [gallery.join('|')]);

  if (gallery.length === 0) {
    return (
      <div className={styles.root}>
        <div className={styles.stage}>
          <div className={styles.placeholder} />
        </div>
      </div>
    );
  }

  const current = gallery[Math.min(index, gallery.length - 1)];
  const multi = gallery.length > 1;

  const go = (dir) => {
    setIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return gallery.length - 1;
      if (next >= gallery.length) return 0;
      return next;
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.stage}>
        <img
          key={current}
          src={current}
          alt={alt}
          className={styles.mainImage}
          fetchPriority="high"
          decoding="async"
        />

        {multi ? (
          <>
            <button
              type="button"
              className={`${styles.nav} ${styles.navPrev}`}
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              className={`${styles.nav} ${styles.navNext}`}
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <Chevron dir="right" />
            </button>
            <div className={styles.dots} role="tablist" aria-label="Image slides">
              {gallery.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {multi ? (
        <div className={styles.thumbs}>
          {gallery.map((url, i) => (
            <button
              key={url}
              type="button"
              className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Thumbnail ${i + 1}`}
            >
              <img src={url} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ProductImageCarousel.module.css';

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
        />

        {multi ? (
          <>
            <button
              type="button"
              className={`${styles.nav} ${styles.navPrev}`}
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className={`${styles.nav} ${styles.navNext}`}
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
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
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

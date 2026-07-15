'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function HomeHeroCarousel({ images = [], alt = '' }) {
  const slides = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.join('|')]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const multi = slides.length > 1;

  return (
    <>
      {slides.map((src, i) => {
        const active = i === index;
        const local = src.startsWith('/');
        if (local) {
          return (
            <Image
              key={src}
              src={src}
              alt={active ? alt : ''}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`ui1-hero-bg ${active ? 'is-active' : ''}`}
              aria-hidden={!active}
            />
          );
        }
        return (
          <img
            key={src}
            src={src}
            alt={active ? alt : ''}
            className={`ui1-hero-bg ${active ? 'is-active' : ''}`}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            decoding="async"
            aria-hidden={!active}
          />
        );
      })}

      {multi ? (
        <div className="ui1-hero-dots" role="tablist" aria-label="Hero slides">
          {slides.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`ui1-hero-dot ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

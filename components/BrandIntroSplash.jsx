'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import styles from './BrandIntroSplash.module.css';

const STORAGE_KEY = 'daiorus_brand_intro_seen';
const HOLD_MS = 680;
const EXIT_MS = 920;

function shouldSkipIntro() {
  if (typeof window === 'undefined') return true;

  try {
    if (window.sessionStorage.getItem(STORAGE_KEY) === '1') return true;
  } catch {
    return true;
  }

  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  } catch {
    // ignore
  }

  return false;
}

export default function BrandIntroSplash() {
  const [phase, setPhase] = useState('idle');
  const finishedRef = useRef(false);

  useLayoutEffect(() => {
    if (finishedRef.current) return undefined;

    if (shouldSkipIntro()) {
      finishedRef.current = true;
      setPhase('done');
      return undefined;
    }

    setPhase('enter');
    document.body.classList.add('brand-intro-active');

    const exitTimer = window.setTimeout(() => {
      setPhase('exit');
    }, HOLD_MS);

    const doneTimer = window.setTimeout(() => {
      finishedRef.current = true;
      try {
        window.sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // ignore quota / privacy mode
      }
      document.body.classList.remove('brand-intro-active');
      setPhase('done');
    }, HOLD_MS + EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.body.classList.remove('brand-intro-active');
    };
  }, []);

  if (phase === 'idle' || phase === 'done') {
    return null;
  }

  const exiting = phase === 'exit';

  return (
    <div
      className={styles.root}
      aria-hidden="true"
      data-phase={phase}
    >
      <div className={`${styles.markWrap} ${exiting ? styles.markExit : styles.markEnter}`}>
        <img
          src="/images/daiorus-mark.png"
          alt=""
          className={styles.mark}
          width={112}
          height={112}
          decoding="sync"
        />
      </div>
      <div className={`${styles.curtain} ${exiting ? styles.curtainExit : ''}`} />
    </div>
  );
}

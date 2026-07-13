'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_ANNOUNCE,
  DEFAULT_HERO,
  DEFAULT_SIGNATURE,
  MEDIA_PRESETS,
} from '../../../../lib/site-content-defaults';
import styles from './media.module.css';

function Field({ label, children, full }) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function ImagePicker({ value, onChange, presets, tall }) {
  return (
    <>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/ui1/hero-home.jpg"
      />
      {value ? (
        <div className={`${styles.preview} ${tall ? styles.previewTall : ''}`}>
          <img src={value} alt="" />
        </div>
      ) : null}
      <div className={styles.presets}>
        {presets.map((src) => (
          <button
            key={src}
            type="button"
            className={`${styles.preset} ${value === src ? styles.presetActive : ''}`}
            onClick={() => onChange(src)}
            title={src}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
    </>
  );
}

export default function MediaLibraryEditor({ initialContent }) {
  const router = useRouter();
  const [announce, setAnnounce] = useState(initialContent.announce);
  const [hero, setHero] = useState(initialContent.hero);
  const [signature, setSignature] = useState(initialContent.signature);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateAnnounce = (key, value) => {
    setAnnounce((prev) => ({ ...prev, [key]: value }));
  };

  const updateHero = (key, value) => {
    setHero((prev) => ({ ...prev, [key]: value }));
  };

  const updateSignature = (key, value) => {
    setSignature((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setAnnounce({ ...DEFAULT_ANNOUNCE });
    setHero({ ...DEFAULT_HERO });
    setSignature({ ...DEFAULT_SIGNATURE });
    setError('');
    setSuccess('Restored default copy and images in the form. Save to publish.');
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announce, hero, signature }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save');

      setAnnounce(data.announce);
      setHero(data.hero);
      setSignature(data.signature);
      setSuccess('Landing page content saved. Changes are live on the storefront.');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save site content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Media Library</h1>
        <p className={styles.pageSubtitle}>
          Manage the top announce banner, homepage hero, and Signature Line section.
          Use image paths under <code>/images/…</code> or paste a full image URL.
        </p>
      </header>

      {error ? <div className={styles.bannerError}>{error}</div> : null}
      {success ? <div className={styles.bannerSuccess}>{success}</div> : null}

      <div className={styles.stack}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Top announce banner</h2>
              <p className={styles.cardHint}>
                The thin bar above the navigation on every storefront page.
              </p>
            </div>
          </div>

          <Field label="Text before link">
            <input
              className={styles.input}
              value={announce.prefix}
              onChange={(e) => updateAnnounce('prefix', e.target.value)}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="Accent link text">
              <input
                className={styles.input}
                value={announce.linkText}
                onChange={(e) => updateAnnounce('linkText', e.target.value)}
              />
            </Field>
            <Field label="Accent link URL">
              <input
                className={styles.input}
                value={announce.linkUrl}
                onChange={(e) => updateAnnounce('linkUrl', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Text after link">
            <input
              className={styles.input}
              value={announce.suffix}
              onChange={(e) => updateAnnounce('suffix', e.target.value)}
            />
          </Field>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Homepage hero</h2>
              <p className={styles.cardHint}>
                Full-bleed landing hero image, headline, and primary CTA.
              </p>
            </div>
          </div>

          <Field label="Hero image" full>
            <ImagePicker
              value={hero.imageUrl}
              onChange={(v) => updateHero('imageUrl', v)}
              presets={MEDIA_PRESETS}
            />
          </Field>
          <Field label="Image alt text">
            <input
              className={styles.input}
              value={hero.imageAlt}
              onChange={(e) => updateHero('imageAlt', e.target.value)}
            />
          </Field>
          <Field label="Eyebrow">
            <input
              className={styles.input}
              value={hero.eyebrow}
              onChange={(e) => updateHero('eyebrow', e.target.value)}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="Title line 1">
              <input
                className={styles.input}
                value={hero.titleLine1}
                onChange={(e) => updateHero('titleLine1', e.target.value)}
              />
            </Field>
            <Field label="Title line 2">
              <input
                className={styles.input}
                value={hero.titleLine2}
                onChange={(e) => updateHero('titleLine2', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Supporting copy">
            <textarea
              className={styles.textarea}
              value={hero.body}
              onChange={(e) => updateHero('body', e.target.value)}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="CTA label">
              <input
                className={styles.input}
                value={hero.ctaLabel}
                onChange={(e) => updateHero('ctaLabel', e.target.value)}
              />
            </Field>
            <Field label="CTA URL">
              <input
                className={styles.input}
                value={hero.ctaUrl}
                onChange={(e) => updateHero('ctaUrl', e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Signature Line</h2>
              <p className={styles.cardHint}>
                Gold Vermeil block on the landing page — two images plus copy and CTA.
              </p>
            </div>
          </div>

          <div className={styles.grid2}>
            <Field label="Image 1">
              <ImagePicker
                value={signature.imageUrl1}
                onChange={(v) => updateSignature('imageUrl1', v)}
                presets={MEDIA_PRESETS}
                tall
              />
            </Field>
            <Field label="Image 2">
              <ImagePicker
                value={signature.imageUrl2}
                onChange={(v) => updateSignature('imageUrl2', v)}
                presets={MEDIA_PRESETS}
                tall
              />
            </Field>
          </div>
          <Field label="Section label">
            <input
              className={styles.input}
              value={signature.label}
              onChange={(e) => updateSignature('label', e.target.value)}
            />
          </Field>
          <Field label="Title">
            <input
              className={styles.input}
              value={signature.title}
              onChange={(e) => updateSignature('title', e.target.value)}
            />
          </Field>
          <Field label="Description">
            <textarea
              className={styles.textarea}
              value={signature.body}
              onChange={(e) => updateSignature('body', e.target.value)}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="CTA label">
              <input
                className={styles.input}
                value={signature.ctaLabel}
                onChange={(e) => updateSignature('ctaLabel', e.target.value)}
              />
            </Field>
            <Field label="CTA URL">
              <input
                className={styles.input}
                value={signature.ctaUrl}
                onChange={(e) => updateSignature('ctaUrl', e.target.value)}
              />
            </Field>
          </div>
        </section>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.resetBtn} onClick={handleReset} disabled={saving}>
          Reset to defaults
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

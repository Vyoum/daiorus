'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAllowedImageFile, uploadAdminImage } from '../../../lib/admin/image-upload';
import styles from './categories.module.css';

const PRESETS = [
  '/images/ui1/cat-earrings.jpg',
  '/images/ui1/cat-pendants.jpg',
  '/images/ui1/cat-bracelets.jpg',
  '/images/ui1/cat-second.jpg',
  '/images/ui1/hero-earrings.jpg',
];

function CoverPicker({
  label,
  description,
  value,
  onChange,
  uploading,
  onUpload,
}) {
  const fileRef = useRef(null);

  return (
    <div className={styles.coverBlock}>
      <div className={styles.coverCopy}>
        <h3 className={styles.coverLabel}>{label}</h3>
        <p className={styles.coverDesc}>{description}</p>
      </div>

      <button
        type="button"
        className={styles.coverPreviewBtn}
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        aria-label={`Upload ${label}`}
      >
        {value ? (
          <img src={value} alt="" className={styles.coverPreviewImg} />
        ) : (
          <span className={styles.coverPlaceholder}>No image yet</span>
        )}
        <span className={styles.coverOverlay}>
          {uploading ? 'Uploading…' : 'Change photo'}
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className={styles.hiddenFile}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void onUpload(file);
        }}
      />

      <div className={styles.urlRow}>
        <input
          className={styles.input}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL…"
          disabled={uploading}
        />
        <button
          type="button"
          className={styles.secondaryBtn}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          Upload
        </button>
      </div>

      <div className={styles.presets}>
        {PRESETS.map((src) => (
          <button
            key={src}
            type="button"
            className={`${styles.preset} ${value === src ? styles.presetActive : ''}`}
            disabled={uploading}
            onClick={() => onChange(src)}
            title="Use preset"
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ category }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(category.imageUrl || '');
  const [heroImageUrl, setHeroImageUrl] = useState(category.heroImageUrl || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dirty =
    imageUrl !== (category.imageUrl || '') ||
    heroImageUrl !== (category.heroImageUrl || '');

  const handleUpload = async (file, applyUrl) => {
    if (!file || uploading) return;
    if (!isAllowedImageFile(file)) {
      setError('Use JPG, PNG, WEBP, or GIF under 4MB.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const url = await uploadAdminImage(file);
      applyUrl(url);
      setSuccess('Image uploaded. Click Save covers to publish.');
    } catch (err) {
      setError(err.message || 'Could not upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (saving || !dirty) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl.trim() || null,
          heroImageUrl: heroImageUrl.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save category');
      setImageUrl(data.imageUrl || '');
      setHeroImageUrl(data.heroImageUrl || '');
      setSuccess('Cover photos saved.');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>{category.name}</h2>
          <p className={styles.cardMeta}>
            /category/{category.slug} · {category.productCount} products ·{' '}
            {category.isActive ? 'Active' : 'Hidden'}
          </p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={saving || uploading || !dirty}
          onClick={handleSave}
        >
          {saving ? 'Saving…' : dirty ? 'Save covers' : 'Saved'}
        </button>
      </div>

      {error ? <p className={styles.bannerError}>{error}</p> : null}
      {success ? <p className={styles.bannerSuccess}>{success}</p> : null}

      <div className={styles.grid2}>
        <CoverPicker
          label="Homepage cover photo"
          description="Shown in Shop by Category on the landing page"
          value={imageUrl}
          onChange={setImageUrl}
          uploading={uploading}
          onUpload={(file) => handleUpload(file, setImageUrl)}
        />
        <CoverPicker
          label="Category page hero"
          description={`Large banner on /category/${category.slug}`}
          value={heroImageUrl}
          onChange={setHeroImageUrl}
          uploading={uploading}
          onUpload={(file) => handleUpload(file, setHeroImageUrl)}
        />
      </div>
    </article>
  );
}

export default function CategoriesEditor({ initialCategories = [] }) {
  if (!initialCategories.length) {
    return (
      <div className={styles.empty}>
        <strong>No categories loaded.</strong>
        <p>
          Open Products once so the catalogue syncs, then refresh this page. Cover photo
          editing appears here for each category.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <div className={styles.helpBanner}>
        For each category below, click the image preview or <strong>Upload</strong> to change
        the homepage cover and category hero, then click <strong>Save covers</strong>.
      </div>
      {initialCategories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

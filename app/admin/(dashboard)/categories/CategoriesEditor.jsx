'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAllowedImageFile, uploadAdminImage } from '@/lib/admin/image-upload';
import { CATEGORIES } from '@/lib/data';
import styles from './categories.module.css';

function ImageField({ label, hint, value, onChange, uploading, onUpload, presets }) {
  const fileRef = useRef(null);

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      <div className={styles.urlRow}>
        <input
          className={styles.input}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/ui1/cat-earrings.jpg"
          disabled={uploading}
        />
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
        <button
          type="button"
          className={styles.uploadBtn}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {value ? (
        <div className={styles.preview}>
          <img src={value} alt="" />
        </div>
      ) : null}
      {presets?.length ? (
        <div className={styles.presets}>
          {presets.map((src) => (
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
      ) : null}
    </div>
  );
}

function CategoryCard({ category, presets }) {
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
      setSuccess('Image uploaded. Save to publish on the storefront.');
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save category');
      setImageUrl(data.imageUrl || '');
      setHeroImageUrl(data.heroImageUrl || '');
      setSuccess('Cover photos saved. Homepage will update shortly.');
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
            /{category.slug} · {category.productCount} products ·{' '}
            {category.isActive ? 'Active' : 'Hidden'}
          </p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={saving || uploading || !dirty}
          onClick={handleSave}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error ? <p className={styles.bannerError}>{error}</p> : null}
      {success ? <p className={styles.bannerSuccess}>{success}</p> : null}

      <div className={styles.grid2}>
        <ImageField
          label="Homepage cover"
          hint="Shop by Category tile on the landing page"
          value={imageUrl}
          onChange={setImageUrl}
          uploading={uploading}
          presets={presets}
          onUpload={(file) => handleUpload(file, setImageUrl)}
        />
        <ImageField
          label="Category page hero"
          hint="Large banner on /category/{slug}"
          value={heroImageUrl}
          onChange={setHeroImageUrl}
          uploading={uploading}
          presets={presets}
          onUpload={(file) => handleUpload(file, setHeroImageUrl)}
        />
      </div>
    </article>
  );
}

export default function CategoriesEditor({ initialCategories = [] }) {
  const presets = useMemo(() => {
    const urls = new Set();
    for (const cat of CATEGORIES) {
      if (cat.image) urls.add(cat.image);
      if (cat.heroImage) urls.add(cat.heroImage);
    }
    return [...urls];
  }, []);

  if (!initialCategories.length) {
    return (
      <div className={styles.empty}>
        No categories found. Add products or sync the catalogue first.
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      {initialCategories.map((category) => (
        <CategoryCard key={category.id} category={category} presets={presets} />
      ))}
    </div>
  );
}

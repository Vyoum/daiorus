'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAllowedImageFile, uploadAdminImage } from '@/lib/admin/image-upload';
import styles from './categories.module.css';
import tableStyles from '../products/products.module.css';

function CategoryImageField({ label, value, onChange, onUpload, uploading, disabled }) {
  const fileRef = useRef(null);

  return (
    <div className={styles.imageField}>
      <span className={styles.imageLabel}>{label}</span>
      <div className={styles.imageRow}>
        <div className={styles.imagePreview}>
          {value ? <img src={value} alt="" /> : <span className={styles.imagePlaceholder}>No image</span>}
        </div>
        <div className={styles.imageControls}>
          <input
            className={styles.urlInput}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/ui1/cat-earrings.jpg"
            disabled={disabled || uploading}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            className={styles.hiddenFileInput}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void onUpload(file);
            }}
          />
          <button
            type="button"
            className={styles.uploadBtn}
            disabled={disabled || uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesEditor({ initialCategories }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [uploadingKey, setUploadingKey] = useState('');
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateCategoryField = (id, key, value) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, [key]: value } : cat)),
    );
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleUpload = async (categoryId, field, file) => {
    if (!isAllowedImageFile(file)) {
      setError('Please choose a JPG, PNG, WEBP, or GIF image.');
      return;
    }

    const uploadKey = `${categoryId}:${field}`;
    setUploadingKey(uploadKey);
    setError('');
    setSuccess('');

    try {
      const url = await uploadAdminImage(file);
      updateCategoryField(categoryId, field, url);
      setSuccess('Image uploaded. Save to publish on the storefront.');
    } catch (err) {
      setError(err.message || 'Could not upload image');
    } finally {
      setUploadingKey('');
    }
  };

  const handleSave = async (category) => {
    if (savingId || uploadingKey) return;
    setSavingId(category.id);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: category.imageUrl || '',
          heroImageUrl: category.heroImageUrl || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save category');

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === category.id
            ? {
                ...cat,
                imageUrl: data.imageUrl,
                heroImageUrl: data.heroImageUrl,
              }
            : cat,
        ),
      );
      setSuccess(`${category.name} images saved.`);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save category');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div>
      <header className={tableStyles.header}>
        <div>
          <h1 className={tableStyles.pageTitle}>Categories</h1>
          <p className={tableStyles.pageSubtitle}>
            Upload category photos here. Grid images appear on the homepage and shop navigation;
            hero images appear at the top of each category page.
          </p>
        </div>
      </header>

      {error ? <div className={styles.bannerError}>{error}</div> : null}
      {success ? <div className={styles.bannerSuccess}>{success}</div> : null}

      <div className={styles.list}>
        {categories.map((cat) => {
          const isSaving = savingId === cat.id;
          const gridUploading = uploadingKey === `${cat.id}:imageUrl`;
          const heroUploading = uploadingKey === `${cat.id}:heroImageUrl`;

          return (
            <article key={cat.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>{cat.name}</h2>
                  <p className={styles.cardMeta}>
                    /category/{cat.slug} · {cat.productCount} products
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={() => handleSave(cat)}
                  disabled={Boolean(savingId || uploadingKey)}
                >
                  {isSaving ? 'Saving…' : 'Save images'}
                </button>
              </div>

              <div className={styles.imageGrid}>
                <CategoryImageField
                  label="Category photo (grid)"
                  value={cat.imageUrl || ''}
                  onChange={(value) => updateCategoryField(cat.id, 'imageUrl', value)}
                  onUpload={(file) => handleUpload(cat.id, 'imageUrl', file)}
                  uploading={gridUploading}
                  disabled={isSaving}
                />
                <CategoryImageField
                  label="Category hero (page banner)"
                  value={cat.heroImageUrl || ''}
                  onChange={(value) => updateCategoryField(cat.id, 'heroImageUrl', value)}
                  onUpload={(file) => handleUpload(cat.id, 'heroImageUrl', file)}
                  uploading={heroUploading}
                  disabled={isSaving}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

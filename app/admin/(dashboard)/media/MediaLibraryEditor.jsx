'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import {
  DEFAULT_ANNOUNCE,
  DEFAULT_HERO,
  DEFAULT_SIGNATURE,
  DEFAULT_CURATED_SELECTS,
  DEFAULT_PHILOSOPHY,
  DEFAULT_PROCESS,
  DEFAULT_SOCIAL,
  MEDIA_PRESETS,
  MAX_HERO_CAROUSEL_IMAGES,
  MAX_SOCIAL_ITEMS,
} from '../../../../lib/site-content-defaults';
import {
  isAllowedImageFile,
  isAllowedMediaFile,
  mediaKindFromFile,
  mediaKindFromUrl,
  uploadAdminImage,
  uploadAdminMedia,
} from '@/lib/admin/image-upload';
import styles from './media.module.css';

function Field({ label, children, full }) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function ImagePicker({
  value,
  onChange,
  presets,
  tall,
  uploading,
  onUpload,
  accept = 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif',
  allowVideo = false,
}) {
  const inputId = useId();

  return (
    <>
      <div className={styles.urlRow}>
        <input
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            allowVideo
              ? '/images/ui1/ig-1.jpg or video URL'
              : '/images/ui1/hero-home.jpg'
          }
          disabled={uploading}
        />
        <label
          htmlFor={inputId}
          className={`${styles.uploadBtn} ${uploading ? styles.uploadBtnDisabled : ''}`}
        >
          {uploading ? 'Uploading…' : 'Upload'}
          <input
            id={inputId}
            type="file"
            accept={accept}
            className={styles.hiddenFileInput}
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file && onUpload) void onUpload(file);
            }}
          />
        </label>
      </div>
      {value ? (
        <div className={`${styles.preview} ${tall ? styles.previewTall : ''}`}>
          {mediaKindFromUrl(value) === 'video' ? (
            <video src={value} muted playsInline controls className={styles.previewVideo} />
          ) : (
            <img src={value} alt="" />
          )}
        </div>
      ) : null}
      {presets?.length ? (
        <div className={styles.presets}>
          {presets.map((src) => (
            <button
              key={src}
              type="button"
              className={`${styles.preset} ${value === src ? styles.presetActive : ''}`}
              onClick={() => onChange(src)}
              title={src}
              disabled={uploading}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

function CarouselUploader({
  images,
  onChange,
  uploading,
  onUploadFiles,
  uploadError,
  uploadSuccess,
}) {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');

  const remaining = MAX_HERO_CAROUSEL_IMAGES - images.length;

  const addUrl = () => {
    const url = pasteUrl.trim();
    if (!url) return;
    if (images.includes(url)) return;
    if (images.length >= MAX_HERO_CAROUSEL_IMAGES) return;
    onChange([...images, url]);
    setPasteUrl('');
  };

  return (
    <div>
      <input
        id={inputId}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className={styles.hiddenFileInput}
        disabled={uploading || remaining <= 0}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = '';
          if (files.length) void onUploadFiles(files);
        }}
      />
      <label
        htmlFor={remaining > 0 && !uploading ? inputId : undefined}
        className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''} ${
          uploading || remaining <= 0 ? styles.dropzoneDisabled : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) void onUploadFiles(e.dataTransfer.files);
        }}
      >
        <Upload size={28} className={styles.uploadIcon} />
        <p className={styles.dropTitle}>
          {uploading ? 'Uploading…' : 'Upload carousel images'}
        </p>
        <p className={styles.dropText}>
          Click to browse or drag and drop. First image is the primary hero slide.
          JPG, PNG, WEBP, GIF · up to {MAX_HERO_CAROUSEL_IMAGES} images.
        </p>
      </label>

      {uploadError ? (
        <p className={styles.inlineUploadError} role="alert">
          {uploadError}
        </p>
      ) : null}
      {uploadSuccess ? <p className={styles.inlineUploadSuccess}>{uploadSuccess}</p> : null}

      {images.length > 0 ? (
        <div className={styles.galleryGrid}>
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className={styles.galleryItem}>
              <img src={url} alt="" className={styles.galleryImg} />
              {index === 0 ? <span className={styles.coverBadge}>Primary</span> : null}
              <div className={styles.galleryActions}>
                {index !== 0 ? (
                  <button
                    type="button"
                    className={styles.galleryBtn}
                    onClick={() => {
                      const next = [url, ...images.filter((item) => item !== url)];
                      onChange(next);
                    }}
                    disabled={uploading}
                  >
                    Make primary
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`${styles.galleryBtn} ${styles.galleryDanger}`}
                  onClick={() => onChange(images.filter((item) => item !== url))}
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className={styles.urlRow}>
        <input
          className={styles.input}
          value={pasteUrl}
          onChange={(e) => setPasteUrl(e.target.value)}
          placeholder="Or paste an image URL"
          disabled={uploading || remaining <= 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addUrl();
            }
          }}
        />
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={addUrl}
          disabled={uploading || !pasteUrl.trim() || remaining <= 0}
        >
          Add URL
        </button>
      </div>

      <div className={styles.presets}>
        {MEDIA_PRESETS.map((src) => (
          <button
            key={src}
            type="button"
            className={`${styles.preset} ${images.includes(src) ? styles.presetActive : ''}`}
            title={src}
            disabled={uploading || (remaining <= 0 && !images.includes(src))}
            onClick={() => {
              if (images.includes(src)) {
                onChange(images.filter((item) => item !== src));
                return;
              }
              if (remaining <= 0) return;
              onChange([...images, src]);
            }}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

function heroImagesFromState(hero) {
  if (Array.isArray(hero.images) && hero.images.length) {
    return hero.images.filter(Boolean);
  }
  return hero.imageUrl ? [hero.imageUrl] : [...DEFAULT_HERO.images];
}

export default function MediaLibraryEditor({ initialContent, products = [] }) {
  const router = useRouter();
  const [announce, setAnnounce] = useState(initialContent.announce);
  const [hero, setHero] = useState({
    ...initialContent.hero,
    images: heroImagesFromState(initialContent.hero),
  });
  const [signature, setSignature] = useState(initialContent.signature);
  const [philosophy, setPhilosophy] = useState(
    initialContent.philosophy || DEFAULT_PHILOSOPHY,
  );
  const [aboutProcess, setAboutProcess] = useState(
    initialContent.process || DEFAULT_PROCESS,
  );
  const [social, setSocial] = useState(initialContent.social || DEFAULT_SOCIAL);
  const [curatedProductIds, setCuratedProductIds] = useState(
    Array.isArray(initialContent?.curatedSelects?.productIds)
      ? initialContent.curatedSelects.productIds
      : DEFAULT_CURATED_SELECTS.productIds,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const updatePhilosophy = (key, value) => {
    setPhilosophy((prev) => ({ ...prev, [key]: value }));
  };

  const updateAboutProcess = (key, value) => {
    setAboutProcess((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocial = (key, value) => {
    setSocial((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocialItem = (index, patch) => {
    setSocial((prev) => {
      const items = [...(prev.items || DEFAULT_SOCIAL.items)];
      items[index] = { ...items[index], ...patch };
      return { ...prev, items };
    });
  };

  const updateProcessStat = (index, key, value) => {
    setAboutProcess((prev) => {
      const stats = (prev.stats || DEFAULT_PROCESS.stats).map((stat, i) =>
        i === index ? { ...stat, [key]: value } : stat,
      );
      return { ...prev, stats };
    });
  };

  const setCarouselImages = (images) => {
    const next = images.filter(Boolean).slice(0, MAX_HERO_CAROUSEL_IMAGES);
    setHero((prev) => ({
      ...prev,
      images: next,
      imageUrl: next[0] || '',
    }));
  };

  const uploadFiles = async (fileList, { allowVideo = false } = {}) => {
    const picked = Array.from(fileList || []).filter(Boolean);
    const files = picked.filter(allowVideo ? isAllowedMediaFile : isAllowedImageFile);
    if (!files.length) {
      throw new Error(
        picked.length
          ? allowVideo
            ? 'Please choose JPG, PNG, WEBP, GIF images or MP4 / WEBM / MOV videos.'
            : 'Please choose JPG, PNG, WEBP, or GIF images (HEIC / Live Photos are not supported).'
          : 'No media files selected.',
      );
    }

    const uploaded = [];
    for (const file of files) {
      uploaded.push(
        allowVideo ? await uploadAdminMedia(file) : await uploadAdminImage(file),
      );
    }
    return uploaded;
  };

  const handleCarouselUpload = async (fileList) => {
    if (uploading) return;
    const current = heroImagesFromState(hero);
    const room = MAX_HERO_CAROUSEL_IMAGES - current.length;
    if (room <= 0) {
      setError(`You can upload up to ${MAX_HERO_CAROUSEL_IMAGES} carousel images.`);
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const files = Array.from(fileList).slice(0, room);
      const urls = await uploadFiles(files);
      const merged = [...current];
      for (const url of urls) {
        if (!merged.includes(url)) merged.push(url);
      }
      setCarouselImages(merged);
      setSuccess(
        urls.length > 1
          ? `${urls.length} images uploaded. Save changes to publish the carousel.`
          : 'Image uploaded. Save changes to publish the carousel.',
      );
    } catch (err) {
      setError(err.message || 'Could not upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSingleUpload = async (file, applyUrl, { allowVideo = false } = {}) => {
    if (uploading || !file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const [url] = await uploadFiles([file], { allowVideo });
      applyUrl(url, mediaKindFromFile(file));
      setSuccess(
        allowVideo
          ? 'Media uploaded. Save changes to publish it.'
          : 'Image uploaded. Save changes to publish it.',
      );
    } catch (err) {
      setError(err.message || 'Could not upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setAnnounce({ ...DEFAULT_ANNOUNCE });
    setHero({ ...DEFAULT_HERO, images: [...DEFAULT_HERO.images] });
    setSignature({ ...DEFAULT_SIGNATURE });
    setPhilosophy({ ...DEFAULT_PHILOSOPHY });
    setAboutProcess({
      ...DEFAULT_PROCESS,
      stats: DEFAULT_PROCESS.stats.map((stat) => ({ ...stat })),
    });
    setSocial({
      ...DEFAULT_SOCIAL,
      items: DEFAULT_SOCIAL.items.map((item) => ({ ...item })),
    });
    setCuratedProductIds([...DEFAULT_CURATED_SELECTS.productIds]);
    setError('');
    setSuccess(
      'Restored default copy, images, and curated selections in the form. Save to publish.',
    );
  };

  const handleSave = async () => {
    if (saving || uploading) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const images = heroImagesFromState(hero);
      const payload = {
        announce,
        hero: {
          ...hero,
          images,
          imageUrl: images[0] || hero.imageUrl,
        },
        signature,
        philosophy,
        process: aboutProcess,
        social,
        curatedSelects: { productIds: curatedProductIds || [] },
      };

      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save');

      setAnnounce(data.announce);
      setHero({
        ...data.hero,
        images: heroImagesFromState(data.hero),
      });
      setSignature(data.signature);
      setPhilosophy(data.philosophy || DEFAULT_PHILOSOPHY);
      setAboutProcess(data.process || DEFAULT_PROCESS);
      setSocial(data.social || DEFAULT_SOCIAL);
      setCuratedProductIds(data?.curatedSelects?.productIds || []);
      setSuccess('Landing page content saved. Changes are live on the storefront.');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save site content');
    } finally {
      setSaving(false);
    }
  };

  const carouselImages = heroImagesFromState(hero);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Media Library</h1>
          <p className={styles.pageSubtitle}>
            Manage the announce banner, homepage hero, Our Philosophy, Signature Line, Curated
            Selects, Social grid, and About Process. Upload images or videos, then save to publish.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={saving || uploading}
          >
            Reset to defaults
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
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
              <h2 className={styles.cardTitle}>Homepage hero carousel</h2>
              <p className={styles.cardHint}>
                Upload one or more full-bleed slides. Multiple images rotate on the homepage.
              </p>
            </div>
          </div>

          <Field label="Carousel images" full>
            <CarouselUploader
              images={carouselImages}
              onChange={setCarouselImages}
              uploading={uploading}
              onUploadFiles={handleCarouselUpload}
              uploadError={error}
              uploadSuccess={success}
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
              <h2 className={styles.cardTitle}>Our Philosophy</h2>
              <p className={styles.cardHint}>
                Homepage editorial split — copy on one side, photo on the other.
              </p>
            </div>
          </div>

          <Field label="Section photo" full>
            <ImagePicker
              value={philosophy.imageUrl}
              onChange={(v) => updatePhilosophy('imageUrl', v)}
              presets={MEDIA_PRESETS}
              tall
              uploading={uploading}
              onUpload={(file) =>
                handleSingleUpload(file, (url) => updatePhilosophy('imageUrl', url))
              }
            />
          </Field>
          <Field label="Image alt text">
            <input
              className={styles.input}
              value={philosophy.imageAlt}
              onChange={(e) => updatePhilosophy('imageAlt', e.target.value)}
            />
          </Field>
          <Field label="Section label">
            <input
              className={styles.input}
              value={philosophy.label}
              onChange={(e) => updatePhilosophy('label', e.target.value)}
            />
          </Field>
          <Field label="Title">
            <input
              className={styles.input}
              value={philosophy.title}
              onChange={(e) => updatePhilosophy('title', e.target.value)}
            />
          </Field>
          <Field label="Body copy">
            <textarea
              className={styles.textarea}
              value={philosophy.body}
              onChange={(e) => updatePhilosophy('body', e.target.value)}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="CTA label">
              <input
                className={styles.input}
                value={philosophy.ctaLabel}
                onChange={(e) => updatePhilosophy('ctaLabel', e.target.value)}
              />
            </Field>
            <Field label="CTA URL">
              <input
                className={styles.input}
                value={philosophy.ctaUrl}
                onChange={(e) => updatePhilosophy('ctaUrl', e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Signature Line</h2>
              <p className={styles.cardHint}>
                Evil Eye Collection block on the landing page — two images plus copy and CTA.
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
                uploading={uploading}
                onUpload={(file) =>
                  handleSingleUpload(file, (url) => updateSignature('imageUrl1', url))
                }
              />
            </Field>
            <Field label="Image 2">
              <ImagePicker
                value={signature.imageUrl2}
                onChange={(v) => updateSignature('imageUrl2', v)}
                presets={MEDIA_PRESETS}
                tall
                uploading={uploading}
                onUpload={(file) =>
                  handleSingleUpload(file, (url) => updateSignature('imageUrl2', url))
                }
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

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Curated Selects</h2>
              <p className={styles.cardHint}>
                Pick up to 3 products shown on the homepage. The “Shop Now” button opens each
                selected product detail page.
              </p>
            </div>
          </div>

          <div className={styles.grid2} style={{ alignItems: 'start' }}>
            <div>
              <div className={styles.curatedList}>
                {curatedProductIds.length ? (
                  curatedProductIds.map((pid) => {
                    const p = products.find((x) => x.id === pid);
                    if (!p) return null;
                    const img = p.imageUrl || (Array.isArray(p.images) ? p.images[0] : '') || '';
                    return (
                      <div key={pid} className={styles.curatedChip}>
                        {img ? (
                          <img src={img} alt="" className={styles.curatedThumb} />
                        ) : (
                          <div className={styles.curatedThumb} aria-hidden="true" />
                        )}
                        <span className={styles.curatedName}>{p.name}</span>
                        <button
                          type="button"
                          className={styles.curatedRemoveBtn}
                          aria-label={`Remove ${p.name} from curated selects`}
                          title="Remove"
                          onClick={() => {
                            setCuratedProductIds((prev) => prev.filter((id) => id !== pid));
                          }}
                          disabled={saving || uploading}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className={styles.cardHint} style={{ margin: 0 }}>
                    No products selected yet.
                  </p>
                )}
              </div>

              <div>
                <label className={styles.label} style={{ display: 'block', marginBottom: 6 }}>
                  Add a product
                </label>
                <select
                  className={styles.input}
                  value=""
                  disabled={saving || uploading || curatedProductIds.length >= 3 || products.length === 0}
                  onChange={(e) => {
                    const pid = e.target.value;
                    if (!pid) return;
                    setCuratedProductIds((prev) => {
                      if (prev.includes(pid)) return prev;
                      if (prev.length >= 3) return prev;
                      return [...prev, pid];
                    });
                    e.target.value = '';
                  }}
                >
                  <option value="">Select from products…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {curatedProductIds.length >= 3 ? (
                  <p className={styles.cardHint} style={{ marginTop: 8 }}>
                    You can select up to 3 products.
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <p className={styles.cardHint} style={{ marginTop: 0 }}>
                Selected order is preserved and determines the homepage card order.
              </p>
              <p className={styles.cardHint}>
                Use the × button on a product to remove it from Curated Selects.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Social</h2>
              <p className={styles.cardHint}>
                Homepage Instagram grid — up to {MAX_SOCIAL_ITEMS} images or short videos. Upload
                opens your file picker; videos up to 40MB are supported.
              </p>
            </div>
          </div>

          <div className={styles.grid2}>
            <Field label="Section label">
              <input
                className={styles.input}
                value={social.label}
                onChange={(e) => updateSocial('label', e.target.value)}
              />
            </Field>
            <Field label="Title prefix">
              <input
                className={styles.input}
                value={social.titlePrefix}
                onChange={(e) => updateSocial('titlePrefix', e.target.value)}
              />
            </Field>
          </div>

          <div className={styles.socialGrid}>
            {(social.items || DEFAULT_SOCIAL.items).map((item, index) => (
              <div key={`social-${index}`} className={styles.socialItem}>
                <Field label={`Slot ${index + 1}`} full>
                  <ImagePicker
                    value={item.url}
                    onChange={(url) =>
                      updateSocialItem(index, {
                        url,
                        type: mediaKindFromUrl(url),
                      })
                    }
                    presets={MEDIA_PRESETS.filter((src) => src.includes('/ig-'))}
                    tall
                    uploading={uploading}
                    allowVideo
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"
                    onUpload={(file) =>
                      handleSingleUpload(
                        file,
                        (url, kind) =>
                          updateSocialItem(index, {
                            url,
                            type: kind || mediaKindFromFile(file),
                          }),
                        { allowVideo: true },
                      )
                    }
                  />
                </Field>
                <Field label="Alt text">
                  <input
                    className={styles.input}
                    value={item.alt || ''}
                    onChange={(e) => updateSocialItem(index, { alt: e.target.value })}
                  />
                </Field>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>The Process</h2>
              <p className={styles.cardHint}>
                About page process section — copy, purity stats, and mosaic photos.
              </p>
            </div>
          </div>

          <Field label="Section label">
            <input
              className={styles.input}
              value={aboutProcess.label}
              onChange={(e) => updateAboutProcess('label', e.target.value)}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="Title line 1">
              <input
                className={styles.input}
                value={aboutProcess.titleLine1}
                onChange={(e) => updateAboutProcess('titleLine1', e.target.value)}
              />
            </Field>
            <Field label="Title line 2">
              <input
                className={styles.input}
                value={aboutProcess.titleLine2}
                onChange={(e) => updateAboutProcess('titleLine2', e.target.value)}
              />
            </Field>
          </div>
          <Field label="First paragraph">
            <textarea
              className={styles.textarea}
              value={aboutProcess.body1}
              onChange={(e) => updateAboutProcess('body1', e.target.value)}
            />
          </Field>
          <Field label="Second paragraph">
            <textarea
              className={styles.textarea}
              value={aboutProcess.body2}
              onChange={(e) => updateAboutProcess('body2', e.target.value)}
            />
          </Field>

          <div className={styles.grid2}>
            {(aboutProcess.stats || DEFAULT_PROCESS.stats).map((stat, index) => (
              <Field key={`process-stat-${index}`} label={`Stat ${index + 1}`}>
                <input
                  className={styles.input}
                  value={stat.label}
                  onChange={(e) => updateProcessStat(index, 'label', e.target.value)}
                  placeholder="Label (e.g. 18K Gold)"
                  style={{ marginBottom: 8 }}
                />
                <input
                  className={styles.input}
                  value={stat.value}
                  onChange={(e) => updateProcessStat(index, 'value', e.target.value)}
                  placeholder="Value (e.g. BIS 916)"
                />
              </Field>
            ))}
          </div>

          <div className={styles.grid2}>
            <Field label="Mosaic image 1">
              <ImagePicker
                value={aboutProcess.imageUrl1}
                onChange={(v) => updateAboutProcess('imageUrl1', v)}
                presets={MEDIA_PRESETS}
                tall
                uploading={uploading}
                onUpload={(file) =>
                  handleSingleUpload(file, (url) => updateAboutProcess('imageUrl1', url))
                }
              />
            </Field>
            <Field label="Mosaic image 2">
              <ImagePicker
                value={aboutProcess.imageUrl2}
                onChange={(v) => updateAboutProcess('imageUrl2', v)}
                presets={MEDIA_PRESETS}
                tall
                uploading={uploading}
                onUpload={(file) =>
                  handleSingleUpload(file, (url) => updateAboutProcess('imageUrl2', url))
                }
              />
            </Field>
          </div>
          <Field label="Mosaic image 3" full>
            <ImagePicker
              value={aboutProcess.imageUrl3}
              onChange={(v) => updateAboutProcess('imageUrl3', v)}
              presets={MEDIA_PRESETS}
              tall
              uploading={uploading}
              onUpload={(file) =>
                handleSingleUpload(file, (url) => updateAboutProcess('imageUrl3', url))
              }
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="Image 1 alt">
              <input
                className={styles.input}
                value={aboutProcess.imageAlt1}
                onChange={(e) => updateAboutProcess('imageAlt1', e.target.value)}
              />
            </Field>
            <Field label="Image 2 alt">
              <input
                className={styles.input}
                value={aboutProcess.imageAlt2}
                onChange={(e) => updateAboutProcess('imageAlt2', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Image 3 alt">
            <input
              className={styles.input}
              value={aboutProcess.imageAlt3}
              onChange={(e) => updateAboutProcess('imageAlt3', e.target.value)}
            />
          </Field>
        </section>
      </div>

      <div className={styles.footerActions}>
        <button
          type="button"
          className={styles.resetBtn}
          onClick={handleReset}
          disabled={saving || uploading}
        >
          Reset to defaults
        </button>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving || uploading}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

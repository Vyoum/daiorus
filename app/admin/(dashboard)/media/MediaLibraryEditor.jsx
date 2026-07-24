'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import {
  DEFAULT_ANNOUNCE,
  DEFAULT_HERO,
  DEFAULT_SIGNATURE,
  DEFAULT_CURATED_SELECTS,
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

function ImagePicker({ value, onChange, presets, tall, uploading, onUpload }) {
  const fileRef = useRef(null);

  return (
    <>
      <div className={styles.urlRow}>
        <input
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/ui1/hero-home.jpg"
          disabled={uploading}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          className={styles.hiddenFileInput}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file && onUpload) void onUpload(file);
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
            disabled={uploading}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
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
  const fileRef = useRef(null);
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
        ref={fileRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className={styles.hiddenFileInput}
        onChange={(e) => {
          // Copy before resetting the input: resetting can empty FileList in some browsers.
          const files = Array.from(e.target.files || []);
          e.target.value = '';
          if (files.length) void onUploadFiles(files);
        }}
      />
      <div
        role="button"
        tabIndex={0}
        className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
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
        onClick={() => {
          if (!uploading && remaining > 0) fileRef.current?.click();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!uploading && remaining > 0) fileRef.current?.click();
          }
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
      </div>

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

function socialFromState(social) {
  const base = social || DEFAULT_SOCIAL;
  const items = Array.isArray(base.items)
    ? base.items
        .map((item, index) => {
          if (!item) return null;
          if (typeof item === 'string') {
            const url = item.trim();
            if (!url) return null;
            return {
              type: mediaKindFromUrl(url),
              url,
              poster: '',
              alt: `Instagram look ${index + 1}`,
              href: '',
            };
          }
          const url = String(item.url || '').trim();
          if (!url) return null;
          return {
            type: item.type === 'video' || mediaKindFromUrl(url) === 'video' ? 'video' : 'image',
            url,
            poster: String(item.poster || '').trim(),
            alt: String(item.alt || '').trim() || `Instagram look ${index + 1}`,
            href: String(item.href || '').trim(),
          };
        })
        .filter(Boolean)
        .slice(0, MAX_SOCIAL_ITEMS)
    : [];

  return {
    label: base.label || DEFAULT_SOCIAL.label,
    titlePrefix: base.titlePrefix || DEFAULT_SOCIAL.titlePrefix,
    handle: base.handle || DEFAULT_SOCIAL.handle,
    profileUrl: base.profileUrl || DEFAULT_SOCIAL.profileUrl,
    items: items.length ? items : DEFAULT_SOCIAL.items.map((item) => ({ ...item })),
  };
}

function SocialMediaEditor({
  social,
  onChange,
  uploading,
  onUploadFiles,
  uploadError,
  uploadSuccess,
}) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const remaining = MAX_SOCIAL_ITEMS - social.items.length;

  const updateItem = (index, patch) => {
    onChange({
      ...social,
      items: social.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  };

  const removeItem = (index) => {
    onChange({
      ...social,
      items: social.items.filter((_, i) => i !== index),
    });
  };

  const moveItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= social.items.length) return;
    const next = [...social.items];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onChange({ ...social, items: next });
  };

  const addUrl = () => {
    const url = pasteUrl.trim();
    if (!url || remaining <= 0) return;
    if (social.items.some((item) => item.url === url)) return;
    onChange({
      ...social,
      items: [
        ...social.items,
        {
          type: mediaKindFromUrl(url),
          url,
          poster: '',
          alt: `Instagram look ${social.items.length + 1}`,
          href: '',
        },
      ],
    });
    setPasteUrl('');
  };

  return (
    <div>
      <div className={styles.grid2}>
        <Field label="Section label">
          <input
            className={styles.input}
            value={social.label}
            onChange={(e) => onChange({ ...social, label: e.target.value })}
            disabled={uploading}
          />
        </Field>
        <Field label="Title prefix">
          <input
            className={styles.input}
            value={social.titlePrefix}
            onChange={(e) => onChange({ ...social, titlePrefix: e.target.value })}
            disabled={uploading}
          />
        </Field>
      </div>
      <div className={styles.grid2}>
        <Field label="Handle">
          <input
            className={styles.input}
            value={social.handle}
            onChange={(e) => onChange({ ...social, handle: e.target.value })}
            placeholder="@daiorus"
            disabled={uploading}
          />
        </Field>
        <Field label="Profile URL">
          <input
            className={styles.input}
            value={social.profileUrl}
            onChange={(e) => onChange({ ...social, profileUrl: e.target.value })}
            placeholder="https://www.instagram.com/daiorus"
            disabled={uploading}
          />
        </Field>
      </div>

      <Field label="Grid media" full>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"
          className={styles.hiddenFileInput}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = '';
            if (files.length) void onUploadFiles(files);
          }}
        />
        <div
          role="button"
          tabIndex={0}
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
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
          onClick={() => {
            if (!uploading && remaining > 0) fileRef.current?.click();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!uploading && remaining > 0) fileRef.current?.click();
            }
          }}
        >
          <Upload size={28} className={styles.uploadIcon} />
          <p className={styles.dropTitle}>
            {uploading ? 'Uploading…' : 'Upload social images or videos'}
          </p>
          <p className={styles.dropText}>
            Click to browse or drag and drop. JPG, PNG, WEBP, GIF, MP4, WEBM, MOV · up to{' '}
            {MAX_SOCIAL_ITEMS} items. Videos autoplay muted in the homepage grid.
          </p>
        </div>

        {uploadError ? (
          <p className={styles.inlineUploadError} role="alert">
            {uploadError}
          </p>
        ) : null}
        {uploadSuccess ? <p className={styles.inlineUploadSuccess}>{uploadSuccess}</p> : null}

        {social.items.length > 0 ? (
          <div className={styles.galleryGrid}>
            {social.items.map((item, index) => (
              <div key={`${item.url}-${index}`} className={styles.galleryItem}>
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className={styles.galleryImg}
                    muted
                    playsInline
                    loop
                    autoPlay
                    poster={item.poster || undefined}
                  />
                ) : (
                  <img src={item.url} alt="" className={styles.galleryImg} />
                )}
                <span className={styles.coverBadge}>
                  {item.type === 'video' ? 'Video' : 'Image'} {index + 1}
                </span>
                <div className={styles.galleryActions}>
                  <button
                    type="button"
                    className={styles.galleryBtn}
                    onClick={() => moveItem(index, -1)}
                    disabled={uploading || index === 0}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className={styles.galleryBtn}
                    onClick={() => moveItem(index, 1)}
                    disabled={uploading || index === social.items.length - 1}
                  >
                    →
                  </button>
                  <button
                    type="button"
                    className={`${styles.galleryBtn} ${styles.galleryDanger}`}
                    onClick={() => removeItem(index)}
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className={styles.input}
                  style={{ marginTop: 8 }}
                  value={item.alt}
                  onChange={(e) => updateItem(index, { alt: e.target.value })}
                  placeholder="Alt text"
                  disabled={uploading}
                />
                <input
                  className={styles.input}
                  style={{ marginTop: 8 }}
                  value={item.href}
                  onChange={(e) => updateItem(index, { href: e.target.value })}
                  placeholder="Optional link URL (defaults to profile)"
                  disabled={uploading}
                />
                {item.type === 'video' ? (
                  <input
                    className={styles.input}
                    style={{ marginTop: 8 }}
                    value={item.poster}
                    onChange={(e) => updateItem(index, { poster: e.target.value })}
                    placeholder="Optional poster image URL"
                    disabled={uploading}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className={styles.urlRow}>
          <input
            className={styles.input}
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder="Or paste an image / video URL"
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
          {MEDIA_PRESETS.filter((src) => src.includes('/ig-')).map((src) => (
            <button
              key={src}
              type="button"
              className={`${styles.preset} ${
                social.items.some((item) => item.url === src) ? styles.presetActive : ''
              }`}
              title={src}
              disabled={
                uploading ||
                (remaining <= 0 && !social.items.some((item) => item.url === src))
              }
              onClick={() => {
                if (social.items.some((item) => item.url === src)) {
                  onChange({
                    ...social,
                    items: social.items.filter((item) => item.url !== src),
                  });
                  return;
                }
                if (remaining <= 0) return;
                onChange({
                  ...social,
                  items: [
                    ...social.items,
                    {
                      type: 'image',
                      url: src,
                      poster: '',
                      alt: `Instagram look ${social.items.length + 1}`,
                      href: '',
                    },
                  ],
                });
              }}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

export default function MediaLibraryEditor({ initialContent, products = [] }) {
  const router = useRouter();
  const [announce, setAnnounce] = useState(initialContent.announce);
  const [hero, setHero] = useState({
    ...initialContent.hero,
    images: heroImagesFromState(initialContent.hero),
  });
  const [signature, setSignature] = useState(initialContent.signature);
  const [curatedProductIds, setCuratedProductIds] = useState(
    Array.isArray(initialContent?.curatedSelects?.productIds)
      ? initialContent.curatedSelects.productIds
      : DEFAULT_CURATED_SELECTS.productIds,
  );
  const [social, setSocial] = useState(socialFromState(initialContent?.social));
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

  const setCarouselImages = (images) => {
    const next = images.filter(Boolean).slice(0, MAX_HERO_CAROUSEL_IMAGES);
    setHero((prev) => ({
      ...prev,
      images: next,
      imageUrl: next[0] || '',
    }));
  };

  const uploadFiles = async (fileList) => {
    const picked = Array.from(fileList || []).filter(Boolean);
    const files = picked.filter(isAllowedImageFile);
    if (!files.length) {
      throw new Error(
        picked.length
          ? 'Please choose JPG, PNG, WEBP, or GIF images (HEIC / Live Photos are not supported).'
          : 'No image files selected.',
      );
    }

    const uploaded = [];
    for (const file of files) {
      uploaded.push(await uploadAdminImage(file));
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

  const handleSingleUpload = async (file, applyUrl) => {
    if (uploading || !file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const [url] = await uploadFiles([file]);
      applyUrl(url);
      setSuccess('Image uploaded. Save changes to publish it.');
    } catch (err) {
      setError(err.message || 'Could not upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSocialUpload = async (fileList) => {
    if (uploading) return;
    const current = socialFromState(social).items;
    const room = MAX_SOCIAL_ITEMS - current.length;
    if (room <= 0) {
      setError(`You can upload up to ${MAX_SOCIAL_ITEMS} social media items.`);
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const picked = Array.from(fileList || []).filter(Boolean).slice(0, room);
      const files = picked.filter(isAllowedMediaFile);
      if (!files.length) {
        throw new Error(
          picked.length
            ? 'Please choose JPG, PNG, WEBP, GIF, MP4, WEBM, or MOV files.'
            : 'No media files selected.',
        );
      }

      const uploaded = [];
      for (const file of files) {
        const url = await uploadAdminMedia(file);
        uploaded.push({
          type: mediaKindFromFile(file) || mediaKindFromUrl(url),
          url,
          poster: '',
          alt: `Instagram look ${current.length + uploaded.length + 1}`,
          href: '',
        });
      }

      setSocial((prev) => {
        const nextItems = [...socialFromState(prev).items];
        for (const item of uploaded) {
          if (!nextItems.some((existing) => existing.url === item.url)) {
            nextItems.push(item);
          }
        }
        return {
          ...socialFromState(prev),
          items: nextItems.slice(0, MAX_SOCIAL_ITEMS),
        };
      });
      setSuccess(
        uploaded.length > 1
          ? `${uploaded.length} media files uploaded. Save changes to publish the social section.`
          : 'Media uploaded. Save changes to publish the social section.',
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
    setCuratedProductIds([...DEFAULT_CURATED_SELECTS.productIds]);
    setSocial(socialFromState(DEFAULT_SOCIAL));
    setError('');
    setSuccess(
      'Restored default copy, images, social media, and curated selections in the form. Save to publish.',
    );
  };

  const handleSave = async () => {
    if (saving || uploading) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const images = heroImagesFromState(hero);
      const socialPayload = socialFromState(social);
      const payload = {
        announce,
        hero: {
          ...hero,
          images,
          imageUrl: images[0] || hero.imageUrl,
        },
        signature,
        curatedSelects: { productIds: curatedProductIds || [] },
        social: socialPayload,
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
      setCuratedProductIds(data?.curatedSelects?.productIds || []);
      setSocial(socialFromState(data.social));
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
            Manage the announce banner, homepage hero carousel, Curated Selects, Signature Line,
            and Social grid.
            Upload images or videos, paste a URL, then save to publish.
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
              <h2 className={styles.cardTitle}>Social</h2>
              <p className={styles.cardHint}>
                Homepage Instagram-style grid. Upload images or videos, reorder tiles, and edit the
                follow handle.
              </p>
            </div>
          </div>

          <SocialMediaEditor
            social={social}
            onChange={setSocial}
            uploading={uploading}
            onUploadFiles={handleSocialUpload}
            uploadError={error}
            uploadSuccess={success}
          />
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

'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bold,
  Italic,
  Link2,
  List,
  Plane,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import { isAllowedImageFile, uploadAdminImage } from '@/lib/admin/image-upload';
import { GOLD_KARAT_OPTIONS, parseGoldKarat } from '@/lib/product-material';
import styles from './product-form.module.css';

function formatInr(n) {
  const value = Number(n) || 0;
  return `₹${value.toLocaleString('en-IN')}`;
}

const MATERIAL_PRESETS = GOLD_KARAT_OPTIONS;

function resolveMaterialSelection(value) {
  const raw = String(value || '').trim();
  if (!raw) return { mode: '', custom: '' };

  const karat = parseGoldKarat(raw);
  if (karat && MATERIAL_PRESETS.includes(karat)) {
    return { mode: karat, custom: '' };
  }

  const normalized = raw.toUpperCase().replace(/\s+/g, '');
  const preset = MATERIAL_PRESETS.find(
    (item) => item === normalized || normalized === `${item.replace(/K$/, '')}K`,
  );
  if (preset) return { mode: preset, custom: '' };

  const match = normalized.match(/^(\d{1,2})K?$/);
  if (match) {
    const asPreset = `${match[1]}K`;
    if (MATERIAL_PRESETS.includes(asPreset)) {
      return { mode: asPreset, custom: '' };
    }
    return { mode: 'custom', custom: match[1] };
  }

  return { mode: 'custom', custom: raw.replace(/k$/i, '').trim() };
}

function ChipList({ values, onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const next = draft.trim();
    if (!next || values.includes(next)) return;
    onChange([...values, next]);
    setDraft('');
  };

  return (
    <div className={styles.chipRow}>
      {values.map((value) => (
        <button
          key={value}
          type="button"
          className={styles.chip}
          onClick={() => onChange(values.filter((v) => v !== value))}
        >
          {value}
          <X size={12} />
        </button>
      ))}
      <input
        className={styles.chipInput}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

export default function ProductForm({ categories = [], product = null }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const isEdit = Boolean(product?.id);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [categoryId, setCategoryId] = useState(
    product?.categoryId || categories[0]?.id || '',
  );
  const initialMaterial = resolveMaterialSelection(product?.material);
  const [materialMode, setMaterialMode] = useState(initialMaterial.mode);
  const [customMaterial, setCustomMaterial] = useState(initialMaterial.custom);
  const [images, setImages] = useState(() => {
    const list = Array.isArray(product?.images)
      ? product.images.map((url) => String(url || '').trim()).filter(Boolean)
      : [];
    const primary = String(product?.imageUrl || '').trim();
    if (primary && !list.includes(primary)) return [primary, ...list];
    return list;
  });
  const [pasteUrl, setPasteUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [priceInr, setPriceInr] = useState(
    product?.priceInr != null ? String(product.priceInr) : '',
  );
  const [compareAtInr, setCompareAtInr] = useState(
    product?.compareAtInr != null ? String(product.compareAtInr) : '',
  );
  const [quantity, setQuantity] = useState(
    product?.quantity != null ? String(product.quantity) : '25',
  );
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState(product?.description || '');
  const [status, setStatus] = useState(product?.status || 'DRAFT');
  const [publishDate, setPublishDate] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [overseasEnabled, setOverseasEnabled] = useState(true);
  const [surchargeType, setSurchargeType] = useState('percentage');
  const [surchargeValue, setSurchargeValue] = useState('15');
  const [tag, setTag] = useState(product?.tag || '');

  const basePrice = Number(priceInr) || 0;
  const surchargeNum = Number(surchargeValue) || 0;

  const intlPreview = useMemo(() => {
    if (!overseasEnabled || basePrice <= 0) return null;
    if (surchargeType === 'percentage') {
      const intl = Math.round(basePrice * (1 + surchargeNum / 100));
      return { label: `+${surchargeNum}%`, intl };
    }
    const intl = Math.round(basePrice + surchargeNum);
    return { label: `+${formatInr(surchargeNum)}`, intl };
  }, [overseasEnabled, basePrice, surchargeNum, surchargeType]);

  const visibility = status === 'ACTIVE' ? 'Visible' : 'Hidden';
  const pageTitle = seoTitle || name || 'New product';
  const metaDesc =
    seoDescription ||
    shortDescription ||
    'Configure product details, pricing, and media assets.';

  const combinedDescription = [shortDescription, description]
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n\n');

  const materialValue = useMemo(() => {
    if (materialMode === 'custom') {
      const custom = String(customMaterial || '').trim();
      if (!custom) return '';
      if (/^\d{1,2}$/.test(custom)) return `${custom}K`;
      return custom;
    }
    return materialMode || '';
  }, [materialMode, customMaterial]);

  const discard = () => {
    router.push('/admin/products');
  };

  const saveProduct = async (nextStatus = status) => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const base = basePrice;
      const sale = compareAtInr === '' ? null : Number(compareAtInr);
      let priceToSave = base;
      let compareToSave = null;
      if (sale != null && Number.isFinite(sale) && sale > 0) {
        if (sale < base) {
          priceToSave = sale;
          compareToSave = base;
        } else if (sale > base) {
          priceToSave = base;
          compareToSave = sale;
        }
      }

      const res = await fetch(
        isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            sku,
            categoryId: categoryId || null,
            material: materialValue,
            images: images.filter((url) => url && !url.startsWith('blob:')),
            imageUrl: images.find((url) => url && !url.startsWith('blob:')) || '',
            priceInr: priceToSave,
            compareAtInr: compareToSave,
            quantity: Number(quantity) || 0,
            description: combinedDescription,
            status: nextStatus,
            tag: tag || null,
          }),
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save product');

      setSuccess(
        nextStatus === 'ACTIVE'
          ? isEdit
            ? 'Product updated and published.'
            : 'Product published successfully.'
          : isEdit
            ? 'Product updates saved as draft.'
            : 'Product saved as draft.',
      );
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const MAX_IMAGES = 8;

  const uploadImageFiles = async (fileList) => {
    const picked = Array.from(fileList || []).filter(Boolean);
    const files = picked.filter(isAllowedImageFile);
    if (!files.length) {
      setError(
        picked.length
          ? 'Please choose JPG, PNG, WEBP, or GIF images (HEIC / Live Photos are not supported).'
          : 'Please choose JPG, PNG, WEBP, or GIF images. Documents are not supported for product media.',
      );
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`You can upload up to ${MAX_IMAGES} images per product.`);
      return;
    }

    const batch = files.slice(0, remaining);
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const uploaded = [];
      for (const file of batch) {
        uploaded.push(await uploadAdminImage(file));
      }

      setImages((prev) => {
        const next = [...prev];
        for (const url of uploaded) {
          if (!next.includes(url)) next.push(url);
        }
        return next.slice(0, MAX_IMAGES);
      });
      setSuccess(
        uploaded.length > 1
          ? `${uploaded.length} images uploaded. Save the product to publish them.`
          : 'Image uploaded. Save the product to publish it on the storefront.',
      );
    } catch (err) {
      setError(err.message || 'Could not upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    void uploadImageFiles(e.dataTransfer.files);
  };

  const onFilePick = (e) => {
    void uploadImageFiles(e.target.files);
  };

  const addPastedUrl = () => {
    const url = pasteUrl.trim();
    if (!url) return;
    if (images.includes(url)) {
      setError('That image is already in the gallery.');
      return;
    }
    if (images.length >= MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images per product.`);
      return;
    }
    setImages((prev) => [...prev, url]);
    setPasteUrl('');
    setError('');
  };

  const removeImage = (url) => {
    setImages((prev) => prev.filter((item) => item !== url));
  };

  const makePrimary = (url) => {
    setImages((prev) => [url, ...prev.filter((item) => item !== url)]);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className={styles.subtitle}>
            {isEdit
              ? 'Update product details, pricing, and media assets.'
              : 'Configure product details, pricing, and media assets.'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryBtn} onClick={discard} disabled={saving || uploading}>
            Discard
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => saveProduct('DRAFT')}
            disabled={saving || uploading}
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => saveProduct('ACTIVE')}
            disabled={saving || uploading}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Product'}
          </button>
        </div>
      </header>

      {error ? <div className={styles.bannerError}>{error}</div> : null}
      {success ? <div className={styles.bannerSuccess}>{success}</div> : null}

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Basic Information</h2>

            <label className={styles.field}>
              <span>Product Name</span>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Luna Stud Earrings"
              />
            </label>

            <div className={styles.row2}>
              <label className={styles.field}>
                <span>SKU</span>
                <input
                  className={styles.input}
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="DAI-EAR-001"
                />
              </label>
              <label className={styles.field}>
                <span>Category</span>
                <select
                  className={styles.input}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Material</span>
                <select
                  className={styles.input}
                  value={materialMode}
                  onChange={(e) => {
                    const next = e.target.value;
                    setMaterialMode(next);
                    if (next !== 'custom') setCustomMaterial('');
                  }}
                >
                  <option value="">Select karat</option>
                  {MATERIAL_PRESETS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
              </label>
              {materialMode === 'custom' ? (
                <label className={styles.field}>
                  <span>Custom karat</span>
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    max="99"
                    inputMode="numeric"
                    value={customMaterial}
                    onChange={(e) => setCustomMaterial(e.target.value)}
                    placeholder="e.g. 21"
                  />
                </label>
              ) : (
                <div className={styles.field} aria-hidden="true" />
              )}
            </div>

            <div className={styles.field}>
              <span>Upload Media</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                className={styles.hiddenFileInput}
                onChange={onFilePick}
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
                onDrop={onDrop}
                onClick={() => {
                  if (!uploading && images.length < MAX_IMAGES) fileInputRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!uploading && images.length < MAX_IMAGES) fileInputRef.current?.click();
                  }
                }}
              >
                <Upload size={28} className={styles.uploadIcon} />
                <p className={styles.dropTitle}>
                  {uploading ? 'Uploading…' : 'Upload product images'}
                </p>
                <p className={styles.dropText}>
                  Click to browse or drag and drop multiple images.
                  First image is the cover; all images appear as a carousel on the product page.
                  JPG, PNG, WEBP, GIF · up to {MAX_IMAGES} images.
                </p>
              </div>

              {images.length > 0 ? (
                <div className={styles.galleryGrid}>
                  {images.map((url, index) => (
                    <div key={url} className={styles.galleryItem}>
                      <img src={url} alt="" className={styles.galleryImg} />
                      {index === 0 ? <span className={styles.coverBadge}>Cover</span> : null}
                      <div className={styles.galleryActions}>
                        {index !== 0 ? (
                          <button
                            type="button"
                            className={styles.galleryBtn}
                            onClick={() => makePrimary(url)}
                          >
                            Make cover
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className={`${styles.galleryBtn} ${styles.galleryDanger}`}
                          onClick={() => removeImage(url)}
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
                  placeholder="Or paste an image URL /images/ui1/product.jpg"
                  disabled={uploading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPastedUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={addPastedUrl}
                  disabled={uploading || !pasteUrl.trim()}
                >
                  Add URL
                </button>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Pricing Structure</h2>
            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Base Price (INR)</span>
                <div className={styles.prefixInput}>
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={styles.input}
                    value={priceInr}
                    onChange={(e) => setPriceInr(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </label>
              <label className={styles.field}>
                <span>Sale / Compare-at Price (Optional)</span>
                <div className={styles.prefixInput}>
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={styles.input}
                    value={compareAtInr}
                    onChange={(e) => setCompareAtInr(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </label>
            </div>

            <label className={styles.field}>
              <span>Initial Stock Quantity</span>
              <input
                type="number"
                min="0"
                className={styles.input}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>

            <div className={styles.overseasCard}>
              <div className={styles.overseasHead}>
                <div className={styles.overseasTitle}>
                  <Plane size={16} />
                  <div>
                    <strong>Overseas Pricing</strong>
                    <p>Apply a surcharge for international orders.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.toggle} ${overseasEnabled ? styles.toggleOn : ''}`}
                  onClick={() => setOverseasEnabled((v) => !v)}
                  aria-pressed={overseasEnabled}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </div>

              {overseasEnabled ? (
                <>
                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <span>Surcharge Type</span>
                      <div className={styles.segmented}>
                        <button
                          type="button"
                          className={surchargeType === 'percentage' ? styles.segActive : ''}
                          onClick={() => setSurchargeType('percentage')}
                        >
                          Percentage
                        </button>
                        <button
                          type="button"
                          className={surchargeType === 'fixed' ? styles.segActive : ''}
                          onClick={() => setSurchargeType('fixed')}
                        >
                          Fixed Amount
                        </button>
                      </div>
                    </div>
                    <label className={styles.field}>
                      <span>Surcharge Value</span>
                      <input
                        className={styles.input}
                        value={surchargeValue}
                        onChange={(e) => setSurchargeValue(e.target.value)}
                        placeholder={surchargeType === 'percentage' ? '15' : '500'}
                      />
                    </label>
                  </div>

                  <div className={styles.previewStrip}>
                    <div>
                      <span className={styles.previewLabel}>Domestic Preview</span>
                      <strong>{formatInr(basePrice)}</strong>
                    </div>
                    <span className={styles.previewArrow}>{intlPreview?.label || '+0%'}</span>
                    <div>
                      <span className={styles.previewLabel}>Intl. Preview (Est.)</span>
                      <strong>{formatInr(intlPreview?.intl || basePrice)}</strong>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Descriptions</h2>
            <label className={styles.field}>
              <span>Short Description</span>
              <textarea
                className={styles.textarea}
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A brief summary for product cards and listings."
              />
            </label>
            <div className={styles.field}>
              <span>Full Description</span>
              <div className={styles.editor}>
                <div className={styles.toolbar} aria-hidden="true">
                  <button type="button"><Bold size={14} /></button>
                  <button type="button"><Italic size={14} /></button>
                  <button type="button"><List size={14} /></button>
                  <button type="button"><Link2 size={14} /></button>
                </div>
                <textarea
                  className={styles.editorArea}
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell the story of this piece — craft, materials, and how to wear it."
                />
              </div>
            </div>
          </section>
        </div>

        <aside className={styles.sideCol}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Publishing</h2>
            <div className={styles.metaRow}>
              <span>Status</span>
              <strong>{status === 'ACTIVE' ? 'Published' : 'Draft'}</strong>
            </div>
            <div className={styles.metaRow}>
              <span>Visibility</span>
              <strong>{visibility}</strong>
            </div>
            <label className={styles.field}>
              <span>Publish Date</span>
              <input
                type="date"
                className={styles.input}
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </label>
            <div className={styles.field}>
              <span>Set status</span>
              <div className={styles.segmented}>
                <button
                  type="button"
                  className={status === 'DRAFT' ? styles.segActive : ''}
                  onClick={() => setStatus('DRAFT')}
                >
                  Draft
                </button>
                <button
                  type="button"
                  className={status === 'ACTIVE' ? styles.segActive : ''}
                  onClick={() => setStatus('ACTIVE')}
                >
                  Active
                </button>
              </div>
            </div>
            <button
              type="button"
              className={styles.secondaryBtnFull}
              onClick={() => saveProduct('DRAFT')}
              disabled={saving || uploading}
            >
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              className={styles.primaryBtnFull}
              onClick={() => saveProduct('ACTIVE')}
              disabled={saving || uploading}
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Product'}
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle}>Variants</h2>
              <button type="button" className={styles.iconGhost} aria-label="Add variant group">
                <Plus size={16} />
              </button>
            </div>
            <div className={styles.field}>
              <span>Color</span>
              <ChipList
                values={colors}
                onChange={setColors}
                placeholder="Add value…"
              />
            </div>
            <div className={styles.field}>
              <span>Size</span>
              <ChipList
                values={sizes}
                onChange={setSizes}
                placeholder="Add value…"
              />
            </div>
            <p className={styles.hint}>
              Variant options are captured for listing notes. Inventory is tracked as a single SKU for now.
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Search Engine Listing</h2>
            <div className={styles.seoPreview}>
              <p className={styles.seoUrl}>daiorus.in › shop › product</p>
              <p className={styles.seoTitlePreview}>{pageTitle}</p>
              <p className={styles.seoDescPreview}>{metaDesc}</p>
            </div>
            <label className={styles.field}>
              <span>Page Title</span>
              <input
                className={styles.input}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={name || 'Product page title'}
              />
            </label>
            <label className={styles.field}>
              <span>Meta Description</span>
              <textarea
                className={styles.textarea}
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Short description for search results"
              />
            </label>
          </section>

          <Link href="/admin/products" className={styles.backLink}>
            ← Back to catalog
          </Link>
        </aside>
      </div>

      <div className={styles.footerActions}>
        <button type="button" className={styles.secondaryBtn} onClick={discard} disabled={saving || uploading}>
          Discard
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => saveProduct('DRAFT')}
          disabled={saving || uploading}
        >
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => saveProduct('ACTIVE')}
          disabled={saving || uploading}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Product'}
        </button>
      </div>
    </div>
  );
}

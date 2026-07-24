import prisma from './prisma';
import {
  CONTENT_KEYS,
  DEFAULT_ANNOUNCE,
  DEFAULT_HERO,
  DEFAULT_SIGNATURE,
  DEFAULT_CURATED_SELECTS,
  DEFAULT_SOCIAL,
  MAX_SOCIAL_ITEMS,
} from './site-content-defaults';

export {
  CONTENT_KEYS,
  DEFAULT_ANNOUNCE,
  DEFAULT_HERO,
  DEFAULT_SIGNATURE,
  DEFAULT_CURATED_SELECTS,
  DEFAULT_SOCIAL,
  MEDIA_PRESETS,
  MAX_HERO_CAROUSEL_IMAGES,
  MAX_SOCIAL_ITEMS,
} from './site-content-defaults';

function meta(row) {
  if (!row?.metadata || typeof row.metadata !== 'object' || Array.isArray(row.metadata)) {
    return {};
  }
  return row.metadata;
}

function isVideoUrl(url) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(String(url || '')) || /\/video\//i.test(String(url || ''));
}

function normalizeSocialItem(raw, index) {
  if (!raw) return null;

  if (typeof raw === 'string') {
    const url = raw.trim();
    if (!url) return null;
    return {
      type: isVideoUrl(url) ? 'video' : 'image',
      url,
      poster: '',
      alt: `Instagram look ${index + 1}`,
      href: '',
    };
  }

  const url = String(raw.url || '').trim();
  if (!url) return null;
  const type = raw.type === 'video' || isVideoUrl(url) ? 'video' : 'image';

  return {
    type,
    url,
    poster: String(raw.poster || '').trim(),
    alt: String(raw.alt || '').trim() || `Instagram look ${index + 1}`,
    href: String(raw.href || '').trim(),
  };
}

function normalizeSocialItems(rawItems) {
  const list = Array.isArray(rawItems) ? rawItems : [];
  const normalized = list
    .map((item, index) => normalizeSocialItem(item, index))
    .filter(Boolean)
    .slice(0, MAX_SOCIAL_ITEMS);
  return normalized.length ? normalized : DEFAULT_SOCIAL.items.map((item) => ({ ...item }));
}

export function rowToAnnounce(row) {
  const m = meta(row);
  return {
    prefix: m.prefix ?? DEFAULT_ANNOUNCE.prefix,
    linkText: row?.title || m.linkText || DEFAULT_ANNOUNCE.linkText,
    linkUrl: row?.linkUrl || DEFAULT_ANNOUNCE.linkUrl,
    suffix: m.suffix ?? DEFAULT_ANNOUNCE.suffix,
  };
}

function normalizeHeroImages(rawImages, fallbackUrl) {
  const list = Array.isArray(rawImages)
    ? rawImages.map((url) => String(url || '').trim()).filter(Boolean)
    : [];
  const primary = String(fallbackUrl || '').trim();
  if (!list.length && primary) return [primary];
  if (primary && list[0] !== primary) {
    return [primary, ...list.filter((url) => url !== primary)];
  }
  return list.length ? list : [...DEFAULT_HERO.images];
}

export function rowToHero(row) {
  const m = meta(row);
  const imageUrl = row?.imageUrl || DEFAULT_HERO.imageUrl;
  return {
    imageUrl,
    images: normalizeHeroImages(m.images, imageUrl),
    imageAlt: m.imageAlt || DEFAULT_HERO.imageAlt,
    eyebrow: m.eyebrow || DEFAULT_HERO.eyebrow,
    titleLine1: m.titleLine1 || DEFAULT_HERO.titleLine1,
    titleLine2: m.titleLine2 || DEFAULT_HERO.titleLine2,
    body: row?.body || DEFAULT_HERO.body,
    ctaLabel: m.ctaLabel || DEFAULT_HERO.ctaLabel,
    ctaUrl: row?.linkUrl || DEFAULT_HERO.ctaUrl,
  };
}

export function rowToSignature(row) {
  const m = meta(row);
  return {
    label: m.label || DEFAULT_SIGNATURE.label,
    title: row?.title || DEFAULT_SIGNATURE.title,
    body: row?.body || DEFAULT_SIGNATURE.body,
    ctaLabel: m.ctaLabel || DEFAULT_SIGNATURE.ctaLabel,
    ctaUrl: row?.linkUrl || DEFAULT_SIGNATURE.ctaUrl,
    imageUrl1: row?.imageUrl || DEFAULT_SIGNATURE.imageUrl1,
    imageUrl2: m.imageUrl2 || DEFAULT_SIGNATURE.imageUrl2,
    imageAlt1: m.imageAlt1 || DEFAULT_SIGNATURE.imageAlt1,
    imageAlt2: m.imageAlt2 || DEFAULT_SIGNATURE.imageAlt2,
  };
}

export function rowToCuratedSelects(row) {
  const m = meta(row);
  const productIds = Array.isArray(m.productIds)
    ? m.productIds
        .map((id) => String(id || '').trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  return {
    productIds: productIds.length ? productIds : DEFAULT_CURATED_SELECTS.productIds,
  };
}

export function rowToSocial(row) {
  const m = meta(row);
  return {
    label: String(m.label || row?.title || DEFAULT_SOCIAL.label).trim() || DEFAULT_SOCIAL.label,
    titlePrefix:
      String(m.titlePrefix || DEFAULT_SOCIAL.titlePrefix).trim() || DEFAULT_SOCIAL.titlePrefix,
    handle: String(m.handle || DEFAULT_SOCIAL.handle).trim() || DEFAULT_SOCIAL.handle,
    profileUrl:
      String(row?.linkUrl || m.profileUrl || DEFAULT_SOCIAL.profileUrl).trim() ||
      DEFAULT_SOCIAL.profileUrl,
    items: normalizeSocialItems(m.items),
  };
}

async function findByKey(key) {
  try {
    return await prisma.siteContent.findUnique({ where: { key } });
  } catch (err) {
    console.error('[site-content]', key, err?.message || err);
    return null;
  }
}

export async function getAnnounceBanner() {
  return rowToAnnounce(await findByKey(CONTENT_KEYS.ANNOUNCE));
}

export async function getHomeHero() {
  return rowToHero(await findByKey(CONTENT_KEYS.HERO));
}

export async function getHomeSignature() {
  return rowToSignature(await findByKey(CONTENT_KEYS.SIGNATURE));
}

export async function getLandingContent() {
  try {
    const rows = await prisma.siteContent.findMany({
      where: {
        key: {
          in: [
            CONTENT_KEYS.ANNOUNCE,
            CONTENT_KEYS.HERO,
            CONTENT_KEYS.SIGNATURE,
            CONTENT_KEYS.CURATED_SELECTS,
            CONTENT_KEYS.SOCIAL,
          ],
        },
      },
    });
    const byKey = Object.fromEntries(rows.map((row) => [row.key, row]));
    return {
      announce: rowToAnnounce(byKey[CONTENT_KEYS.ANNOUNCE]),
      hero: rowToHero(byKey[CONTENT_KEYS.HERO]),
      signature: rowToSignature(byKey[CONTENT_KEYS.SIGNATURE]),
      curatedSelects: rowToCuratedSelects(byKey[CONTENT_KEYS.CURATED_SELECTS]),
      social: rowToSocial(byKey[CONTENT_KEYS.SOCIAL]),
    };
  } catch (err) {
    console.error('[site-content] landing', err?.message || err);
    return {
      announce: DEFAULT_ANNOUNCE,
      hero: DEFAULT_HERO,
      signature: DEFAULT_SIGNATURE,
      curatedSelects: DEFAULT_CURATED_SELECTS,
      social: DEFAULT_SOCIAL,
    };
  }
}

export async function getMediaLibraryContent() {
  const [announceRow, heroRow, signatureRow, curatedSelectsRow, socialRow] = await Promise.all([
    findByKey(CONTENT_KEYS.ANNOUNCE),
    findByKey(CONTENT_KEYS.HERO),
    findByKey(CONTENT_KEYS.SIGNATURE),
    findByKey(CONTENT_KEYS.CURATED_SELECTS),
    findByKey(CONTENT_KEYS.SOCIAL),
  ]);

  return {
    announce: rowToAnnounce(announceRow),
    hero: rowToHero(heroRow),
    signature: rowToSignature(signatureRow),
    curatedSelects: rowToCuratedSelects(curatedSelectsRow),
    social: rowToSocial(socialRow),
  };
}

function announceToRow(data) {
  return {
    key: CONTENT_KEYS.ANNOUNCE,
    type: 'ANNOUNCEMENT',
    title: String(data.linkText || '').trim() || DEFAULT_ANNOUNCE.linkText,
    body: null,
    imageUrl: null,
    linkUrl: String(data.linkUrl || '').trim() || DEFAULT_ANNOUNCE.linkUrl,
    metadata: {
      prefix: String(data.prefix ?? ''),
      suffix: String(data.suffix ?? ''),
      linkText: String(data.linkText || '').trim() || DEFAULT_ANNOUNCE.linkText,
    },
    isPublished: true,
    sortOrder: 0,
  };
}

function heroToRow(data) {
  const images = normalizeHeroImages(
    data.images,
    String(data.imageUrl || '').trim() || DEFAULT_HERO.imageUrl,
  );
  const imageUrl = images[0] || DEFAULT_HERO.imageUrl;

  return {
    key: CONTENT_KEYS.HERO,
    type: 'BANNER',
    title: [data.titleLine1, data.titleLine2].filter(Boolean).join(' '),
    body: String(data.body || '').trim() || DEFAULT_HERO.body,
    imageUrl,
    linkUrl: String(data.ctaUrl || '').trim() || DEFAULT_HERO.ctaUrl,
    metadata: {
      eyebrow: String(data.eyebrow || '').trim() || DEFAULT_HERO.eyebrow,
      titleLine1: String(data.titleLine1 || '').trim() || DEFAULT_HERO.titleLine1,
      titleLine2: String(data.titleLine2 || '').trim() || DEFAULT_HERO.titleLine2,
      ctaLabel: String(data.ctaLabel || '').trim() || DEFAULT_HERO.ctaLabel,
      imageAlt: String(data.imageAlt || '').trim() || DEFAULT_HERO.imageAlt,
      images,
    },
    isPublished: true,
    sortOrder: 1,
  };
}

function signatureToRow(data) {
  return {
    key: CONTENT_KEYS.SIGNATURE,
    type: 'SECTION',
    title: String(data.title || '').trim() || DEFAULT_SIGNATURE.title,
    body: String(data.body || '').trim() || DEFAULT_SIGNATURE.body,
    imageUrl: String(data.imageUrl1 || '').trim() || DEFAULT_SIGNATURE.imageUrl1,
    linkUrl: String(data.ctaUrl || '').trim() || DEFAULT_SIGNATURE.ctaUrl,
    metadata: {
      label: String(data.label || '').trim() || DEFAULT_SIGNATURE.label,
      ctaLabel: String(data.ctaLabel || '').trim() || DEFAULT_SIGNATURE.ctaLabel,
      imageUrl2: String(data.imageUrl2 || '').trim() || DEFAULT_SIGNATURE.imageUrl2,
      imageAlt1: String(data.imageAlt1 || '').trim() || DEFAULT_SIGNATURE.imageAlt1,
      imageAlt2: String(data.imageAlt2 || '').trim() || DEFAULT_SIGNATURE.imageAlt2,
    },
    isPublished: true,
    sortOrder: 2,
  };
}

function curatedSelectsToRow(data) {
  const productIds = Array.isArray(data?.productIds)
    ? data.productIds.map((id) => String(id || '').trim()).filter(Boolean).slice(0, 3)
    : DEFAULT_CURATED_SELECTS.productIds;

  return {
    key: CONTENT_KEYS.CURATED_SELECTS,
    type: 'SECTION',
    title: 'Curated Selects',
    body: null,
    imageUrl: null,
    linkUrl: null,
    metadata: { productIds },
    isPublished: true,
    sortOrder: 3,
  };
}

function socialToRow(data) {
  const items = normalizeSocialItems(data?.items);
  const firstImage = items.find((item) => item.type === 'image')?.url || items[0]?.url || null;

  return {
    key: CONTENT_KEYS.SOCIAL,
    type: 'SECTION',
    title: String(data?.label || '').trim() || DEFAULT_SOCIAL.label,
    body: null,
    imageUrl: firstImage,
    linkUrl: String(data?.profileUrl || '').trim() || DEFAULT_SOCIAL.profileUrl,
    metadata: {
      label: String(data?.label || '').trim() || DEFAULT_SOCIAL.label,
      titlePrefix: String(data?.titlePrefix || '').trim() || DEFAULT_SOCIAL.titlePrefix,
      handle: String(data?.handle || '').trim() || DEFAULT_SOCIAL.handle,
      profileUrl: String(data?.profileUrl || '').trim() || DEFAULT_SOCIAL.profileUrl,
      items,
    },
    isPublished: true,
    sortOrder: 4,
  };
}

function upsertRow(row) {
  return prisma.siteContent.upsert({
    where: { key: row.key },
    create: row,
    update: {
      type: row.type,
      title: row.title,
      body: row.body,
      imageUrl: row.imageUrl,
      linkUrl: row.linkUrl,
      metadata: row.metadata,
      isPublished: row.isPublished,
      sortOrder: row.sortOrder,
    },
  });
}

export async function saveMediaLibraryContent({
  announce,
  hero,
  signature,
  curatedSelects,
  social,
}) {
  const ops = [];

  if (announce) ops.push(upsertRow(announceToRow(announce)));
  if (hero) ops.push(upsertRow(heroToRow(hero)));
  if (signature) ops.push(upsertRow(signatureToRow(signature)));
  if (curatedSelects) ops.push(upsertRow(curatedSelectsToRow(curatedSelects)));
  if (social) ops.push(upsertRow(socialToRow(social)));

  await Promise.all(ops);
  return getMediaLibraryContent();
}

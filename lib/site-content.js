import prisma from './prisma';
import {
  CONTENT_KEYS,
  DEFAULT_ANNOUNCE,
  DEFAULT_HERO,
  DEFAULT_SIGNATURE,
} from './site-content-defaults';

export {
  CONTENT_KEYS,
  DEFAULT_ANNOUNCE,
  DEFAULT_HERO,
  DEFAULT_SIGNATURE,
  MEDIA_PRESETS,
} from './site-content-defaults';

function meta(row) {
  if (!row?.metadata || typeof row.metadata !== 'object' || Array.isArray(row.metadata)) {
    return {};
  }
  return row.metadata;
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

export function rowToHero(row) {
  const m = meta(row);
  return {
    imageUrl: row?.imageUrl || DEFAULT_HERO.imageUrl,
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
          in: [CONTENT_KEYS.ANNOUNCE, CONTENT_KEYS.HERO, CONTENT_KEYS.SIGNATURE],
        },
      },
    });
    const byKey = Object.fromEntries(rows.map((row) => [row.key, row]));
    return {
      announce: rowToAnnounce(byKey[CONTENT_KEYS.ANNOUNCE]),
      hero: rowToHero(byKey[CONTENT_KEYS.HERO]),
      signature: rowToSignature(byKey[CONTENT_KEYS.SIGNATURE]),
    };
  } catch (err) {
    console.error('[site-content] landing', err?.message || err);
    return {
      announce: DEFAULT_ANNOUNCE,
      hero: DEFAULT_HERO,
      signature: DEFAULT_SIGNATURE,
    };
  }
}

export async function getMediaLibraryContent() {
  const [announceRow, heroRow, signatureRow] = await Promise.all([
    findByKey(CONTENT_KEYS.ANNOUNCE),
    findByKey(CONTENT_KEYS.HERO),
    findByKey(CONTENT_KEYS.SIGNATURE),
  ]);

  return {
    announce: rowToAnnounce(announceRow),
    hero: rowToHero(heroRow),
    signature: rowToSignature(signatureRow),
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
  return {
    key: CONTENT_KEYS.HERO,
    type: 'BANNER',
    title: [data.titleLine1, data.titleLine2].filter(Boolean).join(' '),
    body: String(data.body || '').trim() || DEFAULT_HERO.body,
    imageUrl: String(data.imageUrl || '').trim() || DEFAULT_HERO.imageUrl,
    linkUrl: String(data.ctaUrl || '').trim() || DEFAULT_HERO.ctaUrl,
    metadata: {
      eyebrow: String(data.eyebrow || '').trim() || DEFAULT_HERO.eyebrow,
      titleLine1: String(data.titleLine1 || '').trim() || DEFAULT_HERO.titleLine1,
      titleLine2: String(data.titleLine2 || '').trim() || DEFAULT_HERO.titleLine2,
      ctaLabel: String(data.ctaLabel || '').trim() || DEFAULT_HERO.ctaLabel,
      imageAlt: String(data.imageAlt || '').trim() || DEFAULT_HERO.imageAlt,
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

export async function saveMediaLibraryContent({ announce, hero, signature }) {
  const ops = [];

  if (announce) {
    const row = announceToRow(announce);
    ops.push(
      prisma.siteContent.upsert({
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
      }),
    );
  }

  if (hero) {
    const row = heroToRow(hero);
    ops.push(
      prisma.siteContent.upsert({
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
      }),
    );
  }

  if (signature) {
    const row = signatureToRow(signature);
    ops.push(
      prisma.siteContent.upsert({
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
      }),
    );
  }

  await Promise.all(ops);
  return getMediaLibraryContent();
}

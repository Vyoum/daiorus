import prisma from './prisma';
import {
  CONTENT_KEY_OVERSEAS,
  defaultSurchargeMap,
  normalizeSurchargeMap,
  getSurchargePctFromMap,
} from './overseas-pricing-defaults';

export {
  CONTENT_KEY_OVERSEAS,
  OVERSEAS_REGION_DEFAULTS,
  defaultSurchargeMap,
  normalizeSurchargeMap,
  getSurchargePctFromMap,
  applySurchargeInr,
} from './overseas-pricing-defaults';

async function readStoredMap() {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: CONTENT_KEY_OVERSEAS },
      select: { metadata: true },
    });
    return normalizeSurchargeMap(row?.metadata);
  } catch (err) {
    console.error('[overseas-surcharges]', err?.message || err);
    return defaultSurchargeMap();
  }
}

export async function getOverseasSurchargeMap() {
  return readStoredMap();
}

export async function getSurchargePctForRegion(countryOrCurrencyCode) {
  const map = await getOverseasSurchargeMap();
  return getSurchargePctFromMap(map, countryOrCurrencyCode);
}

export async function saveOverseasSurchargeMap(input) {
  const metadata = normalizeSurchargeMap(input);

  await prisma.siteContent.upsert({
    where: { key: CONTENT_KEY_OVERSEAS },
    create: {
      key: CONTENT_KEY_OVERSEAS,
      type: 'SECTION',
      title: 'Overseas regional surcharges',
      body: null,
      imageUrl: null,
      linkUrl: null,
      metadata,
      isPublished: true,
      sortOrder: 10,
    },
    update: {
      type: 'SECTION',
      title: 'Overseas regional surcharges',
      metadata,
      isPublished: true,
    },
  });

  return metadata;
}

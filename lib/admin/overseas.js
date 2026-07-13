import {
  SHIPPING_FEE_INR,
  SHIPPING_FREE_THRESHOLD_INR,
} from '../checkout';
import { convertFromInr, formatCurrency } from '../currency';
import { getRateFromInr } from '../exchange-rates';
import { OVERSEAS_REGION_DEFAULTS } from '../overseas-pricing-defaults';
import { getOverseasSurchargeMap } from '../overseas-pricing';

export async function getOverseasPricingData() {
  const surchargeMap = await getOverseasSurchargeMap();
  const regions = [];

  for (const region of OVERSEAS_REGION_DEFAULTS) {
    let rate = 1;
    try {
      rate = await getRateFromInr(region.currency);
    } catch {
      rate = region.currency === 'INR' ? 1 : null;
    }

    const surchargePct = Number(surchargeMap[region.code] ?? region.surchargePct) || 0;

    const freeShipLocal =
      rate == null
        ? null
        : convertFromInr(SHIPPING_FREE_THRESHOLD_INR, rate, region.currency);

    regions.push({
      ...region,
      surchargePct,
      rateFromInr: rate,
      freeShippingInr: SHIPPING_FREE_THRESHOLD_INR,
      freeShippingLocal: freeShipLocal,
      freeShippingLabel:
        freeShipLocal == null
          ? '—'
          : formatCurrency(freeShipLocal, region.currency),
      handlingFeeInr: region.code === 'IN' ? SHIPPING_FEE_INR : Math.round(SHIPPING_FEE_INR * 1.5),
    });
  }

  const overseasPcts = regions
    .filter((r) => r.code !== 'IN')
    .map((r) => r.surchargePct);
  const baseSurchargePct =
    overseasPcts.length > 0
      ? Math.round(
          (overseasPcts.reduce((sum, n) => sum + n, 0) / overseasPcts.length) * 10,
        ) / 10
      : 0;

  return {
    baseSurchargePct,
    freeShippingThresholdInr: SHIPPING_FREE_THRESHOLD_INR,
    handlingFeeInr: SHIPPING_FEE_INR,
    regions,
    surchargeMap,
  };
}

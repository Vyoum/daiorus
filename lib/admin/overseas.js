import {
  SHIPPING_FEE_INR,
  SHIPPING_FREE_THRESHOLD_INR,
} from '../checkout';
import { convertFromInr, formatCurrency } from '../currency';
import { getRateFromInr } from '../exchange-rates';

/** Regions shown in overseas pricing — rates are live from FX API. */
export const OVERSEAS_REGIONS = [
  { code: 'US', name: 'United States', currency: 'USD', surchargePct: 12 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', surchargePct: 18 },
  { code: 'AU', name: 'Australia', currency: 'AUD', surchargePct: 20 },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', surchargePct: 15 },
  { code: 'SG', name: 'Singapore', currency: 'SGD', surchargePct: 14 },
  { code: 'IN', name: 'India (Domestic)', currency: 'INR', surchargePct: 0 },
];

export async function getOverseasPricingData() {
  const regions = [];

  for (const region of OVERSEAS_REGIONS) {
    let rate = 1;
    try {
      rate = await getRateFromInr(region.currency);
    } catch {
      rate = region.currency === 'INR' ? 1 : null;
    }

    const freeShipLocal =
      rate == null
        ? null
        : convertFromInr(SHIPPING_FREE_THRESHOLD_INR, rate, region.currency);

    regions.push({
      ...region,
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

  return {
    baseSurchargePct: 15,
    freeShippingThresholdInr: SHIPPING_FREE_THRESHOLD_INR,
    handlingFeeInr: SHIPPING_FEE_INR,
    regions,
  };
}

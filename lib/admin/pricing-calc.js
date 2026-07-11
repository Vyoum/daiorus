import { convertFromInr, formatCurrency } from '../currency';

export function previewOverseasPrice({
  basePriceInr,
  surchargePct,
  rateFromInr,
  currency,
}) {
  const surcharge = Math.round(basePriceInr * (surchargePct / 100));
  const totalInr = basePriceInr + surcharge;
  const localAmount = convertFromInr(totalInr, rateFromInr || 1, currency);

  return {
    basePriceInr,
    surchargeInr: surcharge,
    totalInr,
    localAmount,
    localLabel: formatCurrency(localAmount, currency),
    rateFromInr,
  };
}

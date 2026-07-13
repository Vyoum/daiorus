import { convertFromInr, formatCurrency } from '../currency';
import { applySurchargeInr } from '../overseas-pricing-defaults';

export function previewOverseasPrice({
  basePriceInr,
  surchargePct,
  rateFromInr,
  currency,
}) {
  const totalInr = applySurchargeInr(basePriceInr, surchargePct);
  const surchargeInr = Math.max(0, totalInr - Math.round(Number(basePriceInr) || 0));
  const localAmount = convertFromInr(totalInr, rateFromInr || 1, currency);

  return {
    basePriceInr: Math.round(Number(basePriceInr) || 0),
    surchargeInr,
    totalInr,
    localAmount,
    localLabel: formatCurrency(localAmount, currency),
    rateFromInr,
  };
}

export const BASE_CURRENCY = 'INR';

const ZERO_DECIMAL_CURRENCIES = new Set(['INR', 'JPY', 'KRW', 'VND']);

export function convertFromInr(amountInr, rateFromInr, currencyCode = BASE_CURRENCY) {
  if (!amountInr || currencyCode === BASE_CURRENCY || rateFromInr === 1) {
    return Math.round(amountInr);
  }

  const converted = amountInr * rateFromInr;
  if (ZERO_DECIMAL_CURRENCIES.has(currencyCode)) {
    return Math.round(converted);
  }

  return Math.round(converted * 100) / 100;
}

export function formatCurrency(amount, currencyCode = BASE_CURRENCY) {
  const fractionDigits = ZERO_DECIMAL_CURRENCIES.has(currencyCode) ? 0 : 2;

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString('en')}`;
  }
}

export function formatPriceFromInr(amountInr, currencyCode, rateFromInr) {
  const converted = convertFromInr(amountInr, rateFromInr, currencyCode);
  return formatCurrency(converted, currencyCode);
}

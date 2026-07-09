const CACHE_TTL_MS = 60 * 60 * 1000;

let cachedRates = null;
let cachedAt = 0;

export async function getRateFromInr(currencyCode) {
  if (!currencyCode || currencyCode === 'INR') {
    return 1;
  }

  const rates = await getInrRates();
  return rates[currencyCode] ?? 1;
}

async function getInrRates() {
  const now = Date.now();
  if (cachedRates && now - cachedAt < CACHE_TTL_MS) {
    return cachedRates;
  }

  const response = await fetch('https://open.er-api.com/v6/latest/INR', {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }

  const data = await response.json();
  if (data.result !== 'success' || !data.rates) {
    throw new Error('Invalid exchange rate response');
  }

  cachedRates = data.rates;
  cachedAt = now;
  return cachedRates;
}

import { getRateFromInr } from './exchange-rates';

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return null;
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
    return true;
  }
  return false;
}

const DEFAULT_GEO = {
  countryCode: 'IN',
  countryName: 'India',
  currencyCode: 'INR',
  currencyName: 'Indian Rupee',
  currencySymbol: '₹',
  rateFromInr: 1,
};

export async function resolveUserCurrency(request) {
  const apiKey = process.env.IPGEOLOCATION_API_KEY;
  if (!apiKey) {
    return DEFAULT_GEO;
  }

  const clientIp = getClientIp(request);
  if (isPrivateIp(clientIp)) {
    return DEFAULT_GEO;
  }

  const params = new URLSearchParams({
    apiKey,
    fields: 'location.country_code2,location.country_name,currency',
  });

  if (clientIp) {
    params.set('ip', clientIp);
  }

  const response = await fetch(`https://api.ipgeolocation.io/v3/ipgeo?${params}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return DEFAULT_GEO;
  }

  const data = await response.json();
  const currencyCode = data.currency?.code || DEFAULT_GEO.currencyCode;

  let rateFromInr = 1;
  try {
    rateFromInr = await getRateFromInr(currencyCode);
  } catch {
    rateFromInr = currencyCode === 'INR' ? 1 : DEFAULT_GEO.rateFromInr;
  }

  return {
    countryCode: data.location?.country_code2 || DEFAULT_GEO.countryCode,
    countryName: data.location?.country_name || DEFAULT_GEO.countryName,
    currencyCode,
    currencyName: data.currency?.name || currencyCode,
    currencySymbol: data.currency?.symbol || currencyCode,
    rateFromInr,
  };
}

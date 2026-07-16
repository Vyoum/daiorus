const COUNTRIES_URL = 'https://countriesnow.space/api/v0.1/countries/iso';
const STATES_URL = 'https://countriesnow.space/api/v0.1/countries/states/q';

const FALLBACK_COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'CA', name: 'Canada' },
  { code: 'NZ', name: 'New Zealand' },
];

const INDIA_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

function normalizeCountryCode(code) {
  return String(code || '').trim().toUpperCase();
}

export async function fetchCountries() {
  try {
    const response = await fetch(COUNTRIES_URL, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) {
      return FALLBACK_COUNTRIES;
    }

    const payload = await response.json();
    const rows = Array.isArray(payload?.data) ? payload.data : [];

    const countries = rows
      .map((row) => ({
        code: normalizeCountryCode(row.Iso2 || row.iso2 || row.ISO2),
        name: String(row.name || '').trim(),
      }))
      .filter((row) => row.code.length === 2 && row.name)
      .sort((a, b) => a.name.localeCompare(b.name));

    return countries.length ? countries : FALLBACK_COUNTRIES;
  } catch (error) {
    console.error('[geo-regions] countries fetch failed:', error?.message || error);
    return FALLBACK_COUNTRIES;
  }
}

export async function fetchStatesForCountry(countryCode) {
  const code = normalizeCountryCode(countryCode);
  if (!code) return [];

  try {
    const response = await fetch(`${STATES_URL}?iso2=${encodeURIComponent(code)}`, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) {
      return code === 'IN' ? INDIA_STATES.map((name) => ({ name, code: name })) : [];
    }

    const payload = await response.json();
    const rows = Array.isArray(payload?.data?.states) ? payload.data.states : [];

    const states = rows
      .map((row) => {
        const name = String(row.name || '').trim();
        const stateCode = String(row.state_code || row.stateCode || '').trim();
        if (!name) return null;
        return {
          name,
          code: stateCode || name,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (states.length) return states;
    if (code === 'IN') return INDIA_STATES.map((name) => ({ name, code: name }));
    return [];
  } catch (error) {
    console.error('[geo-regions] states fetch failed:', error?.message || error);
    if (code === 'IN') return INDIA_STATES.map((name) => ({ name, code: name }));
    return [];
  }
}

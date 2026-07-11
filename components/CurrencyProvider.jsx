'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BASE_CURRENCY, formatPriceFromInr } from '../lib/currency';

const STORAGE_KEY = 'daiorus_currency';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const DEFAULT_CURRENCY = {
  countryCode: 'IN',
  countryName: 'India',
  currencyCode: BASE_CURRENCY,
  currencyName: 'Indian Rupee',
  currencySymbol: '₹',
  rateFromInr: 1,
};

const CURRENCY_META = {
  INR: { countryCode: 'IN', countryName: 'India', currencyName: 'Indian Rupee', currencySymbol: '₹' },
  USD: { countryCode: 'US', countryName: 'United States', currencyName: 'US Dollar', currencySymbol: '$' },
  GBP: { countryCode: 'GB', countryName: 'United Kingdom', currencyName: 'British Pound', currencySymbol: '£' },
  AED: { countryCode: 'AE', countryName: 'United Arab Emirates', currencyName: 'UAE Dirham', currencySymbol: 'د.إ' },
  AUD: { countryCode: 'AU', countryName: 'Australia', currencyName: 'Australian Dollar', currencySymbol: 'A$' },
  SGD: { countryCode: 'SG', countryName: 'Singapore', currencyName: 'Singapore Dollar', currencySymbol: 'S$' },
};

const CurrencyContext = createContext({
  ...DEFAULT_CURRENCY,
  loading: true,
  formatPrice: (amount) => `₹${amount.toLocaleString('en-IN')}`,
  isLocalCurrency: true,
  setPreferredCurrency: async () => {},
});

function readCachedCurrency() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.savedAt) return null;
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

function writeCachedCurrency(data) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data, savedAt: Date.now() })
    );
  } catch {
    // ignore quota errors
  }
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = readCachedCurrency();
    if (cached) {
      setCurrency(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch('/api/geoip')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        const next = {
          countryCode: data.countryCode || DEFAULT_CURRENCY.countryCode,
          countryName: data.countryName || DEFAULT_CURRENCY.countryName,
          currencyCode: data.currencyCode || DEFAULT_CURRENCY.currencyCode,
          currencyName: data.currencyName || DEFAULT_CURRENCY.currencyName,
          currencySymbol: data.currencySymbol || DEFAULT_CURRENCY.currencySymbol,
          rateFromInr: data.rateFromInr ?? 1,
        };

        setCurrency(next);
        writeCachedCurrency(next);
      })
      .catch(() => {
        if (!cancelled) setCurrency(DEFAULT_CURRENCY);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatPrice = useCallback(
    (amountInr) =>
      formatPriceFromInr(amountInr, currency.currencyCode, currency.rateFromInr),
    [currency.currencyCode, currency.rateFromInr]
  );

  const setPreferredCurrency = useCallback(async (code) => {
    const meta = CURRENCY_META[code] || CURRENCY_META.INR;
    let rateFromInr = 1;

    if (code !== BASE_CURRENCY) {
      try {
        const res = await fetch(`/api/exchange-rate?currency=${encodeURIComponent(code)}`);
        if (res.ok) {
          const data = await res.json();
          rateFromInr = data.rateFromInr ?? 1;
        }
      } catch {
        rateFromInr = currency.rateFromInr || 1;
      }
    }

    const next = {
      ...meta,
      currencyCode: code,
      rateFromInr,
    };
    setCurrency(next);
    writeCachedCurrency(next);
  }, [currency.rateFromInr]);

  const value = useMemo(
    () => ({
      ...currency,
      loading,
      formatPrice,
      isLocalCurrency: currency.currencyCode === BASE_CURRENCY,
      setPreferredCurrency,
    }),
    [currency, loading, formatPrice, setPreferredCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

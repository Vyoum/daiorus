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

const CurrencyContext = createContext({
  ...DEFAULT_CURRENCY,
  loading: true,
  formatPrice: (amount) => `₹${amount.toLocaleString('en-IN')}`,
  isLocalCurrency: true,
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

  const value = useMemo(
    () => ({
      ...currency,
      loading,
      formatPrice,
      isLocalCurrency: currency.currencyCode === BASE_CURRENCY,
    }),
    [currency, loading, formatPrice]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

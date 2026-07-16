'use client';

import { useEffect, useState } from 'react';

/**
 * Country + state dropdowns. Country defaults from geolocation (IPGEOLOCATION via /api/geoip).
 * States load for the selected country via /api/geo/states.
 */
export default function AddressRegionFields({
  country,
  state,
  onCountryChange,
  onStateChange,
  disabled = false,
  countryLabel = 'Country',
  stateLabel = 'State / Province',
  fieldClassName = '',
  labelClassName = '',
  selectClassName = '',
  required = true,
  idPrefix = 'addr',
}) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoadingCountries(true);
    fetch('/api/geo/countries')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setCountries(Array.isArray(data?.countries) ? data.countries : []);
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCountries(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const code = String(country || '').trim().toUpperCase();
    if (!code) {
      setStates([]);
      return undefined;
    }

    let cancelled = false;
    setLoadingStates(true);

    fetch(`/api/geo/states?country=${encodeURIComponent(code)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const nextStates = Array.isArray(data?.states) ? data.states : [];
        setStates(nextStates);

        if (
          state &&
          nextStates.length > 0 &&
          !nextStates.some((item) => item.name === state || item.code === state)
        ) {
          onStateChange('');
        }
      })
      .catch(() => {
        if (!cancelled) setStates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false);
      });

    return () => {
      cancelled = true;
    };
  }, [country]); // eslint-disable-line react-hooks/exhaustive-deps -- reset only when country changes

  const hasStateOptions = states.length > 0;
  const countryValue = String(country || '').toUpperCase();

  return (
    <>
      <label className={fieldClassName}>
        <span className={labelClassName || undefined}>{countryLabel}</span>
        <select
          id={`${idPrefix}-country`}
          className={selectClassName}
          value={countryValue}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            onCountryChange(next);
            onStateChange('');
          }}
          required={required}
          disabled={disabled || loadingCountries}
          autoComplete="country"
        >
          <option value="" disabled>
            {loadingCountries ? 'Loading countries…' : 'Select country'}
          </option>
          {countryValue &&
          !countries.some((item) => item.code === countryValue) ? (
            <option value={countryValue}>{countryValue}</option>
          ) : null}
          {countries.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldClassName}>
        <span className={labelClassName || undefined}>{stateLabel}</span>
        {hasStateOptions ? (
          <select
            id={`${idPrefix}-state`}
            className={selectClassName}
            value={state || ''}
            onChange={(e) => onStateChange(e.target.value)}
            required={required}
            disabled={disabled || loadingStates || !countryValue}
            autoComplete="address-level1"
          >
            <option value="" disabled>
              {loadingStates ? 'Loading states…' : 'Select state'}
            </option>
            {state &&
            !states.some((item) => item.name === state || item.code === state) ? (
              <option value={state}>{state}</option>
            ) : null}
            {states.map((item) => (
              <option key={`${item.code}-${item.name}`} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`${idPrefix}-state`}
            className={selectClassName}
            value={state || ''}
            onChange={(e) => onStateChange(e.target.value)}
            placeholder={
              loadingStates
                ? 'Loading…'
                : countryValue
                  ? 'Enter state / province'
                  : 'Select a country first'
            }
            required={required}
            disabled={disabled || loadingStates || !countryValue}
            autoComplete="address-level1"
          />
        )}
      </label>
    </>
  );
}

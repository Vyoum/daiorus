'use client';

import { useEffect, useState } from 'react';
import styles from './ProductDeliveryEstimate.module.css';

export default function ProductDeliveryEstimate() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const digits = pincode.replace(/\D/g, '');
    if (digits.length !== 6) {
      setResult(null);
      setError('');
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      setResult(null);

      try {
        const serviceRes = await fetch('/api/shipping/serviceability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pinCode: digits }),
        });
        const serviceData = await serviceRes.json().catch(() => ({}));

        if (serviceRes.status === 503) {
          setUnavailable(true);
          return;
        }

        if (!serviceRes.ok) {
          throw new Error(serviceData.error || 'Could not check delivery');
        }

        if (serviceData.serviceable === false) {
          setError(serviceData.message || 'Delivery is not available for this pincode.');
          return;
        }

        const eddRes = await fetch('/api/shipping/edd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinationPincode: digits }),
        });
        const eddData = await eddRes.json().catch(() => ({}));

        if (eddRes.status === 503) {
          setUnavailable(true);
          return;
        }

        if (!eddRes.ok) {
          throw new Error(eddData.error || 'Could not calculate delivery date');
        }

        if (!eddData.estimatedDelivery) {
          setError('Estimated delivery is not available for this pincode.');
          return;
        }

        setResult({
          estimatedDelivery: eddData.estimatedDelivery,
          estimatedDay: eddData.estimatedDay || null,
          city: serviceData.data?.city || null,
        });
      } catch (err) {
        setError(err.message || 'Could not check delivery. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [pincode]);

  if (unavailable) return null;

  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="product-delivery-pincode">
        Check delivery
      </label>
      <div className={styles.inputRow}>
        <input
          id="product-delivery-pincode"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="Enter pincode"
          className={styles.input}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        {loading ? <span className={styles.loading}>Checking…</span> : null}
      </div>

      {result ? (
        <div className={styles.resultBox} role="status">
          <p className={styles.resultEyebrow}>Estimated delivery</p>
          <p className={styles.resultDate}>{result.estimatedDelivery}</p>
          {result.estimatedDay ? (
            <p className={styles.resultMeta}>{result.estimatedDay}</p>
          ) : null}
          {result.city ? (
            <p className={styles.resultMeta}>Delivering to {result.city}</p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

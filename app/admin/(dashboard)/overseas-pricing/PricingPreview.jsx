'use client';

import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '../../../../lib/currency';
import { previewOverseasPrice } from '../../../../lib/admin/pricing-calc';
import styles from './pricing.module.css';

export default function PricingPreview({ regions }) {
  const [basePrice, setBasePrice] = useState('5000');
  const [regionCode, setRegionCode] = useState(regions.find((r) => r.code !== 'IN')?.code || 'US');

  const region = regions.find((r) => r.code === regionCode) || regions[0];

  const preview = useMemo(() => {
    const basePriceInr = Number(basePrice) || 0;
    if (!region?.rateFromInr) {
      return null;
    }
    return previewOverseasPrice({
      basePriceInr,
      surchargePct: region.surchargePct,
      rateFromInr: region.rateFromInr,
      currency: region.currency,
    });
  }, [basePrice, region]);

  return (
    <div className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <Calculator size={20} />
        <h2 className={styles.previewTitle}>Pricing Preview</h2>
      </div>
      <p className={styles.previewDesc}>
        Test how INR base prices translate across regions using live exchange rates.
      </p>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel} htmlFor="base-price">
          Base Price (INR)
        </label>
        <div className={styles.darkInputWrapper}>
          <span className={styles.currencySymbol}>₹</span>
          <input
            id="base-price"
            type="number"
            min="0"
            className={styles.darkInput}
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel} htmlFor="target-region">
          Target Region
        </label>
        <select
          id="target-region"
          className={styles.darkSelect}
          value={regionCode}
          onChange={(e) => setRegionCode(e.target.value)}
        >
          {regions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {preview ? (
        <div className={styles.calculationArea}>
          <div className={styles.calcRow}>
            <span className={styles.calcLabel}>Base Price</span>
            <span className={styles.calcValue}>{formatCurrency(preview.basePriceInr, 'INR')}</span>
          </div>
          <div className={styles.calcRow}>
            <span className={styles.calcLabel}>Included surcharge ({region.surchargePct}%)</span>
            <span className={styles.calcValue}>{formatCurrency(preview.surchargeInr, 'INR')}</span>
          </div>

          <div className={styles.calcRow}>
            <span className={styles.calcLabel}>Effective INR (single price base)</span>
            <span className={styles.calcValue}>{formatCurrency(preview.totalInr, 'INR')}</span>
          </div>

          <div className={styles.calcDivider} />

          <div className={styles.calcRow}>
            <span className={styles.calcLabel}>Est. Exchange Rate</span>
            <span className={styles.calcValue}>
              × {Number(preview.rateFromInr).toFixed(4)} {region.currency}
              <span className={styles.calcSubtext}>Live Rate</span>
            </span>
          </div>

          <div className={styles.calcDivider} />

          <div className={styles.finalPriceRow}>
            <span className={styles.finalPriceLabel}>Final Display Price</span>
            <span className={styles.finalPriceValue}>{preview.localLabel}</span>
          </div>
        </div>
      ) : (
        <p className={styles.previewDesc}>Exchange rate unavailable for this region right now.</p>
      )}
    </div>
  );
}

import { Flag, Pencil } from 'lucide-react';
import { formatINR } from '../../../../lib/admin/format';
import { getOverseasPricingData } from '../../../../lib/admin/overseas';
import PricingPreview from './PricingPreview';
import styles from './pricing.module.css';

export default async function OverseasPricing() {
  const data = await getOverseasPricingData();

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Overseas Pricing Module</h1>
        <p className={styles.pageSubtitle}>
          Live FX rates with your store&apos;s INR base prices and shipping thresholds.
        </p>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.configCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Global Strategy Baseline</h2>
          </div>

          <div className={styles.baselineGrid}>
            <div className={styles.baselineBox}>
              <span className={styles.baselineLabel}>Base Overseas Surcharge</span>
              <div className={styles.baselineValueRow}>
                <span className={styles.baselineValue}>{data.baseSurchargePct}%</span>
                <span className={styles.baselineDesc}>applied to base price</span>
              </div>
            </div>

            <div className={styles.baselineBox}>
              <span className={styles.baselineLabel}>Free Shipping Threshold</span>
              <div className={styles.baselineValueRow}>
                <span className={styles.baselineValue}>{formatINR(data.freeShippingThresholdInr)}</span>
                <span className={styles.baselineDesc}>store baseline</span>
              </div>
            </div>

            <div className={styles.baselineBox}>
              <span className={styles.baselineLabel}>Standard Handling Fee</span>
              <div className={styles.baselineValueRow}>
                <span className={styles.baselineValue}>{formatINR(data.handlingFeeInr)}</span>
                <span className={styles.baselineDesc}>domestic shipping fee</span>
              </div>
            </div>
          </div>

          <h3 className={styles.subTitle}>Regional Configurations</h3>

          <div className={styles.regionList}>
            {data.regions.map((region) => (
              <div key={region.code} className={styles.regionRow}>
                <div className={styles.regionName}>
                  <Flag className={styles.regionFlag} size={16} />
                  {region.name}
                </div>
                <div className={styles.regionStat}>
                  Surcharge:{' '}
                  <span className={styles.regionStatValue}>
                    {region.surchargePct === 0 ? 'None' : `+${region.surchargePct}%`}
                  </span>
                </div>
                <div className={styles.regionStat}>
                  Free Ship: <span className={styles.regionStatValue}>{region.freeShippingLabel}</span>
                </div>
                <div className={styles.regionStat}>
                  FX:{' '}
                  <span className={styles.regionStatValue}>
                    {region.rateFromInr == null ? '—' : Number(region.rateFromInr).toFixed(4)}
                  </span>
                </div>
                <button type="button" className={styles.regionAction} aria-label={`Edit ${region.name}`}>
                  <Pencil size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <PricingPreview regions={data.regions} />
      </div>
    </div>
  );
}

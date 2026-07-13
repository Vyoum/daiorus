'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag } from 'lucide-react';
import { formatINR } from '../../../../lib/admin/format';
import PricingPreview from './PricingPreview';
import styles from './pricing.module.css';

export default function OverseasPricingEditor({ initialData }) {
  const router = useRouter();
  const [regions, setRegions] = useState(initialData.regions);
  const [saving, setSaving] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [draftPct, setDraftPct] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const baseSurchargePct = useMemo(() => {
    const overseas = regions.filter((r) => r.code !== 'IN').map((r) => Number(r.surchargePct) || 0);
    if (!overseas.length) return 0;
    return Math.round((overseas.reduce((a, b) => a + b, 0) / overseas.length) * 10) / 10;
  }, [regions]);

  const startEdit = (region) => {
    if (region.code === 'IN') return;
    setEditingCode(region.code);
    setDraftPct(String(region.surchargePct ?? 0));
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingCode(null);
    setDraftPct('');
  };

  const saveAll = async (nextRegions = regions) => {
    if (saving) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const surcharges = Object.fromEntries(
        nextRegions.map((r) => [r.code, Number(r.surchargePct) || 0]),
      );

      const res = await fetch('/api/admin/overseas-pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surcharges }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save');

      setRegions(data.regions);
      setSuccess('Regional surcharges saved. Storefront prices update immediately.');
      setEditingCode(null);
      setDraftPct('');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save overseas pricing');
    } finally {
      setSaving(false);
    }
  };

  const commitEdit = async () => {
    if (!editingCode) return;
    const value = Number(draftPct);
    if (!Number.isFinite(value) || value < 0) {
      setError('Enter a valid surcharge percentage (0 or more).');
      return;
    }

    const nextRegions = regions.map((r) =>
      r.code === editingCode ? { ...r, surchargePct: Math.round(value * 100) / 100 } : r,
    );
    setRegions(nextRegions);
    await saveAll(nextRegions);
  };

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Overseas Pricing Module</h1>
          <p className={styles.pageSubtitle}>
            Edit regional surcharges. FX stays live. Display prices include surcharge in one
            amount — never added as a separate fee.
          </p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={() => saveAll()}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save surcharges'}
        </button>
      </header>

      {error ? <div className={styles.bannerError}>{error}</div> : null}
      {success ? <div className={styles.bannerSuccess}>{success}</div> : null}

      <div className={styles.contentGrid}>
        <div className={styles.configCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Global Strategy Baseline</h2>
          </div>

          <div className={styles.baselineGrid}>
            <div className={styles.baselineBox}>
              <span className={styles.baselineLabel}>Avg Overseas Surcharge</span>
              <div className={styles.baselineValueRow}>
                <span className={styles.baselineValue}>{baseSurchargePct}%</span>
                <span className={styles.baselineDesc}>across regions</span>
              </div>
            </div>

            <div className={styles.baselineBox}>
              <span className={styles.baselineLabel}>Free Shipping Threshold</span>
              <div className={styles.baselineValueRow}>
                <span className={styles.baselineValue}>
                  {formatINR(initialData.freeShippingThresholdInr)}
                </span>
                <span className={styles.baselineDesc}>store baseline</span>
              </div>
            </div>

            <div className={styles.baselineBox}>
              <span className={styles.baselineLabel}>Standard Handling Fee</span>
              <div className={styles.baselineValueRow}>
                <span className={styles.baselineValue}>{formatINR(initialData.handlingFeeInr)}</span>
                <span className={styles.baselineDesc}>domestic shipping fee</span>
              </div>
            </div>
          </div>

          <h3 className={styles.subTitle}>Regional Configurations</h3>

          <div className={styles.regionList}>
            {regions.map((region) => {
              const isEditing = editingCode === region.code;
              return (
                <div key={region.code} className={styles.regionRow}>
                  <div className={styles.regionName}>
                    <Flag className={styles.regionFlag} size={16} />
                    {region.name}
                  </div>

                  <div className={styles.regionStat}>
                    Surcharge:{' '}
                    {isEditing ? (
                      <span className={styles.editInline}>
                        <input
                          className={styles.pctInput}
                          type="number"
                          min="0"
                          step="0.1"
                          value={draftPct}
                          onChange={(e) => setDraftPct(e.target.value)}
                          aria-label={`${region.name} surcharge percent`}
                        />
                        <span>%</span>
                        <button
                          type="button"
                          className={styles.inlineSave}
                          onClick={commitEdit}
                          disabled={saving}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className={styles.inlineCancel}
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <span className={styles.regionStatValue}>
                        {region.surchargePct === 0 ? 'None' : `+${region.surchargePct}%`}
                      </span>
                    )}
                  </div>

                  <div className={styles.regionStat}>
                    Free Ship:{' '}
                    <span className={styles.regionStatValue}>{region.freeShippingLabel}</span>
                  </div>

                  <div className={styles.regionStat}>
                    FX:{' '}
                    <span className={styles.regionStatValue}>
                      {region.rateFromInr == null
                        ? '—'
                        : Number(region.rateFromInr).toFixed(4)}
                    </span>
                  </div>

                  {region.code === 'IN' ? (
                    <span className={styles.regionLocked}>Domestic</span>
                  ) : (
                    <button
                      type="button"
                      className={styles.regionAction}
                      aria-label={`Edit ${region.name} surcharge`}
                      onClick={() => startEdit(region)}
                      disabled={saving || isEditing}
                    >
                      Edit
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <PricingPreview regions={regions} />
      </div>
    </div>
  );
}

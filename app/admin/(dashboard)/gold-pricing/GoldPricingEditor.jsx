'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coins } from 'lucide-react';
import { formatINR } from '../../../../lib/admin/format';
import { calculateGoldValue } from '../../../../lib/gold-pricing-calc';
import styles from './gold-pricing.module.css';

function formatDateTime(value) {
  if (!value) return 'Not saved yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not saved yet';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatSourceLabel(source) {
  if (source === 'ibja') return 'IBJA (ibjarates.com)';
  if (source === 'manual') return 'Manual';
  return source || 'Manual';
}

export default function GoldPricingEditor({ initialSettings }) {
  const router = useRouter();
  const [rate24kPerGram, setRate24kPerGram] = useState(
    initialSettings?.rate24kPerGram ? String(initialSettings.rate24kPerGram) : '',
  );
  const [ibjaRate999Per10g, setIbjaRate999Per10g] = useState(
    initialSettings?.ibjaRate999Per10g ? String(initialSettings.ibjaRate999Per10g) : '',
  );
  const [ibjaSession, setIbjaSession] = useState(initialSettings?.ibjaSession || null);
  const [updatedAt, setUpdatedAt] = useState(initialSettings?.updatedAt || null);
  const [source, setSource] = useState(initialSettings?.source || 'manual');
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const preview = useMemo(() => {
    const rate = Number(rate24kPerGram) || 0;
    if (!rate) return null;

    return {
      sample18k4g: calculateGoldValue({
        goldWeightGrams: 4,
        material: '18K',
        rate24kPerGram: rate,
      }),
      sample14k2g: calculateGoldValue({
        goldWeightGrams: 2,
        material: '14K',
        rate24kPerGram: rate,
      }),
    };
  }, [rate24kPerGram]);

  const applySettings = (settings) => {
    if (!settings) return;
    setRate24kPerGram(settings.rate24kPerGram ? String(settings.rate24kPerGram) : '');
    setIbjaRate999Per10g(
      settings.ibjaRate999Per10g ? String(settings.ibjaRate999Per10g) : '',
    );
    setIbjaSession(settings.ibjaSession || null);
    setUpdatedAt(settings.updatedAt || null);
    setSource(settings.source || 'manual');
  };

  const saveSettings = async () => {
    if (saving) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/gold-pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            rate24kPerGram: Number(rate24kPerGram) || 0,
            ibjaRate999Per10g: Number(ibjaRate999Per10g) || 0,
            ibjaSession: ibjaSession || null,
            source: 'manual',
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save gold pricing');

      applySettings(data.settings);
      setSuccess('Gold rate saved.');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save gold pricing');
    } finally {
      setSaving(false);
    }
  };

  const fetchLatest = async () => {
    if (fetching) return;
    setFetching(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/gold-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch-latest' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not fetch the latest gold rate');

      applySettings(data.settings);
      const per10g = data.settings?.ibjaRate999Per10g;
      const session = data.settings?.ibjaSession;
      const final = data.settings?.rate24kPerGram;
      setSuccess(
        `IBJA Gold 999 ${session || ''} ₹${Number(per10g).toLocaleString('en-IN')}/10g → ₹${Number(final).toLocaleString('en-IN')}/g. Updated ${data.updated ?? 0} product${data.updated === 1 ? '' : 's'}.${data.warning ? ` ${data.warning}` : ''}`,
      );
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not fetch the latest gold rate');
    } finally {
      setFetching(false);
    }
  };

  const recalculateAll = async () => {
    if (recalculating) return;
    setRecalculating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/gold-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recalculate' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not recalculate prices');

      setSuccess(
        `Updated ${data.updated} product${data.updated === 1 ? '' : 's'} from today’s gold rate${
          data.skipped ? ` (${data.skipped} skipped — missing karat/weight).` : '.'
        }`,
      );
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not recalculate prices');
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gold Pricing</h1>
          <p className={styles.subtitle}>
            Fetch today’s IBJA Gold 999 benchmark rate (India market) or enter it manually.
            Only each product’s net-gold value changes; fixed non-gold amounts stay the same.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={fetchLatest}
            disabled={fetching || recalculating || saving}
          >
            {fetching ? 'Fetching…' : 'Fetch IBJA rate'}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={recalculateAll}
            disabled={recalculating || saving}
          >
            {recalculating ? 'Recalculating…' : 'Recalculate all products'}
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={saveSettings}
            disabled={saving || recalculating}
          >
            {saving ? 'Saving…' : 'Save gold rate'}
          </button>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <Coins size={18} />
          <div>
            <h2 className={styles.cardTitle}>Today&apos;s gold rate</h2>
            <p className={styles.cardHint}>
              Last updated: {formatDateTime(updatedAt)} · Source: {formatSourceLabel(source)}
              {ibjaSession ? ` · IBJA ${ibjaSession} session` : ''}
            </p>
          </div>
        </div>

        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>24K gold rate (INR per gram)</span>
            <div className={styles.prefixInput}>
              <span>₹</span>
              <input
                type="number"
                min="0"
                step="1"
                className={styles.input}
                value={rate24kPerGram}
                onChange={(e) => setRate24kPerGram(e.target.value)}
                placeholder="15249"
              />
            </div>
          </label>
          {ibjaRate999Per10g ? (
            <label className={styles.field}>
              <span>IBJA Gold 999 (INR per 10g)</span>
              <div className={styles.prefixInput}>
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={styles.input}
                  value={ibjaRate999Per10g}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </label>
          ) : null}
        </div>

        <p className={styles.formula}>
          Fetch reads ibjarates.com (IBJA Gold 999, per 10g) and saves ÷10 as your 24K per-gram
          rate. Rates exclude GST and making charges. You can still override manually above.
        </p>
      </section>

      {preview?.sample18k4g ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Examples</h2>
          <div className={styles.examples}>
            <div className={styles.example}>
              <span className={styles.exampleLabel}>4g · 18K</span>
              <strong>{formatINR(preview.sample18k4g.goldValue)}</strong>
              <span className={styles.exampleMeta}>
                Net-gold value only at {formatINR(preview.sample18k4g.ratePerGram)}/g
              </span>
            </div>
            {preview.sample14k2g ? (
              <div className={styles.example}>
                <span className={styles.exampleLabel}>2g · 14K</span>
                <strong>{formatINR(preview.sample14k2g.goldValue)}</strong>
                <span className={styles.exampleMeta}>
                  Net-gold value only at {formatINR(preview.sample14k2g.ratePerGram)}/g
                </span>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

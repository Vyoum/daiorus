'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './coupons.module.css';

const EMPTY_FORM = {
  code: '',
  label: '',
  type: 'PERCENT',
  value: '',
  freeShipping: false,
  minSubtotalInr: '',
  maxUses: '',
  expiresAt: '',
  isActive: true,
};

function formatDiscount(coupon) {
  if (coupon.type === 'percent') return `${coupon.value}% off`;
  return `₹${coupon.value.toLocaleString('en-IN')} off`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CouponForm({ title, submitLabel, initialValues, saving, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialValues);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      className={styles.formCard}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <h2 className={styles.formTitle}>{title}</h2>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Coupon code</span>
          <input
            className={styles.input}
            value={form.code}
            onChange={(e) => update('code', e.target.value.toUpperCase())}
            placeholder="DAIORUS10"
            required
          />
        </label>
        <label className={styles.field}>
          <span>Label (shown to customer)</span>
          <input
            className={styles.input}
            value={form.label}
            onChange={(e) => update('label', e.target.value)}
            placeholder="10% off"
          />
        </label>
        <label className={styles.field}>
          <span>Discount type</span>
          <select
            className={styles.input}
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
          >
            <option value="PERCENT">Percent (%)</option>
            <option value="FIXED">Fixed amount (₹)</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>{form.type === 'PERCENT' ? 'Percent value' : 'Amount in ₹'}</span>
          <input
            className={styles.input}
            type="number"
            min="1"
            max={form.type === 'PERCENT' ? '100' : undefined}
            value={form.value}
            onChange={(e) => update('value', e.target.value)}
            required
          />
        </label>
        <label className={styles.field}>
          <span>Minimum order (₹)</span>
          <input
            className={styles.input}
            type="number"
            min="0"
            value={form.minSubtotalInr}
            onChange={(e) => update('minSubtotalInr', e.target.value)}
            placeholder="Optional"
          />
        </label>
        <label className={styles.field}>
          <span>Max uses</span>
          <input
            className={styles.input}
            type="number"
            min="1"
            value={form.maxUses}
            onChange={(e) => update('maxUses', e.target.value)}
            placeholder="Unlimited"
          />
        </label>
        <label className={styles.field}>
          <span>Expiry date</span>
          <input
            className={styles.input}
            type="date"
            value={form.expiresAt}
            onChange={(e) => update('expiresAt', e.target.value)}
          />
        </label>
        <label className={`${styles.field} ${styles.checkField}`}>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update('isActive', e.target.checked)}
          />
          Active on storefront
        </label>
        <label className={`${styles.field} ${styles.checkField}`}>
          <input
            type="checkbox"
            checked={form.freeShipping}
            onChange={(e) => update('freeShipping', e.target.checked)}
          />
          Free shipping (when shipping applies)
        </label>
      </div>
      <div className={styles.formActions}>
        {onCancel ? (
          <button type="button" className={styles.secondaryBtn} onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className={styles.primaryBtn} disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function CouponRow({ coupon, savingId, onToggle, onDelete }) {
  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
  const usage =
    coupon.maxUses != null
      ? `${coupon.usedCount || 0} / ${coupon.maxUses}`
      : `${coupon.usedCount || 0} used`;

  return (
    <tr className={styles.tr}>
      <td className={styles.td}>
        <div className={styles.codeCell}>
          <strong>{coupon.code}</strong>
          <span>{coupon.label}</span>
        </div>
      </td>
      <td className={styles.td}>{formatDiscount(coupon)}</td>
      <td className={styles.td}>
        {coupon.minSubtotalInr > 0
          ? `₹${coupon.minSubtotalInr.toLocaleString('en-IN')}+`
          : 'Any order'}
      </td>
      <td className={styles.td}>{usage}</td>
      <td className={styles.td}>{formatDate(coupon.expiresAt)}</td>
      <td className={styles.td}>
        <span
          className={`${styles.badge} ${
            !coupon.isActive ? styles.badgeOff : isExpired ? styles.badgeWarn : styles.badgeOn
          }`}
        >
          {!coupon.isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
        </span>
      </td>
      <td className={styles.td}>
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.linkBtn}
            disabled={savingId === coupon.id}
            onClick={() => onToggle(coupon)}
          >
            {coupon.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            type="button"
            className={styles.dangerBtn}
            disabled={savingId === coupon.id}
            onClick={() => onDelete(coupon)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CouponsEditor({ initialCoupons = [] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const activeCount = useMemo(
    () => coupons.filter((coupon) => coupon.isActive).length,
    [coupons],
  );

  const createCoupon = async (form) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create coupon');
      setCoupons((prev) => [data, ...prev]);
      setSuccess(`Coupon ${data.code} created.`);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (coupon) => {
    setSavingId(coupon.id);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update coupon');
      setCoupons((prev) => prev.map((row) => (row.id === coupon.id ? data : row)));
      setSuccess(`Coupon ${data.code} ${data.isActive ? 'activated' : 'deactivated'}.`);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not update coupon');
    } finally {
      setSavingId(null);
    }
  };

  const deleteCoupon = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    setSavingId(coupon.id);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete coupon');
      setCoupons((prev) => prev.filter((row) => row.id !== coupon.id));
      setSuccess(`Coupon ${coupon.code} deleted.`);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not delete coupon');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span>Total coupons</span>
          <strong>{coupons.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Active now</span>
          <strong>{activeCount}</strong>
        </div>
      </div>

      {error ? <div className={styles.bannerError}>{error}</div> : null}
      {success ? <div className={styles.bannerSuccess}>{success}</div> : null}

      <CouponForm
        title="Create new coupon"
        submitLabel="Create coupon"
        initialValues={EMPTY_FORM}
        saving={saving}
        onSubmit={createCoupon}
      />

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Code</th>
              <th className={styles.th}>Discount</th>
              <th className={styles.th}>Minimum</th>
              <th className={styles.th}>Usage</th>
              <th className={styles.th}>Expires</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr className={styles.tr}>
                <td className={styles.td} colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                  No coupons yet. Create one above for customers to use at checkout.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <CouponRow
                  key={coupon.id}
                  coupon={coupon}
                  savingId={savingId}
                  onToggle={toggleCoupon}
                  onDelete={deleteCoupon}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AccountAddresses.module.css';

const EMPTY_FORM = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'IN',
  isDefault: false,
};

export default function AccountAddresses({ initialAddresses = [] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);

  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formTitle = useMemo(
    () => (editingId ? 'Edit address' : 'Add address'),
    [editingId],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
    setFormOpen(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (address) => {
    setEditingId(address.id);
    setForm({
      label: address.label || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'IN',
      isDefault: Boolean(address.isDefault),
    });
    setFormOpen(true);
    setError('');
    setSuccess('');
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : '/api/account/addresses';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save address');

      setAddresses(data.addresses || []);
      setSuccess(editingId ? 'Address updated.' : 'Address saved.');
      closeForm();
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (saving) return;
    if (!window.confirm('Remove this address?')) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete address');
      setAddresses(data.addresses || []);
      setSuccess('Address removed.');
      if (editingId === id) closeForm();
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not delete address');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    if (saving) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update address');
      setAddresses(data.addresses || []);
      setSuccess('Default address updated.');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not update address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Addresses</h1>
          <p className={styles.lead}>
            Save shipping addresses for faster checkout on your next order.
          </p>
        </div>
        {!formOpen ? (
          <button type="button" className={styles.addBtn} onClick={openCreate}>
            Add address
          </button>
        ) : null}
      </header>

      {error ? <div className={styles.error}>{error}</div> : null}
      {success ? <div className={styles.success}>{success}</div> : null}

      {formOpen ? (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>{formTitle}</h2>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="addr-label">
              Label
            </label>
            <input
              id="addr-label"
              className={styles.input}
              value={form.label}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="Home, Office…"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="addr-line1">
              Address line 1
            </label>
            <input
              id="addr-line1"
              className={styles.input}
              value={form.line1}
              onChange={(e) => updateField('line1', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="addr-line2">
              Address line 2
            </label>
            <input
              id="addr-line2"
              className={styles.input}
              value={form.line2}
              onChange={(e) => updateField('line2', e.target.value)}
              placeholder="Apartment, landmark (optional)"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="addr-city">
                City
              </label>
              <input
                id="addr-city"
                className={styles.input}
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="addr-state">
                State
              </label>
              <input
                id="addr-state"
                className={styles.input}
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="addr-postal">
                Postal code
              </label>
              <input
                id="addr-postal"
                className={styles.input}
                value={form.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="addr-country">
                Country
              </label>
              <input
                id="addr-country"
                className={styles.input}
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
                required
              />
            </div>
          </div>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => updateField('isDefault', e.target.checked)}
            />
            Set as default shipping address
          </label>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Save address'}
            </button>
          </div>
        </form>
      ) : null}

      <div className={styles.grid}>
        {addresses.length === 0 && !formOpen ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>No saved addresses</h2>
            <p className={styles.emptyText}>
              Add a shipping address to keep it ready for your next DAIORUS order.
            </p>
          </div>
        ) : (
          addresses.map((address) => (
            <article key={address.id} className={styles.card}>
              <div className={styles.cardHead}>
                <h2 className={styles.label}>{address.label || 'Address'}</h2>
                {address.isDefault ? (
                  <span className={styles.defaultBadge}>Default</span>
                ) : null}
              </div>
              <p className={styles.addressText}>
                {address.line1}
                {address.line2 ? (
                  <>
                    <br />
                    {address.line2}
                  </>
                ) : null}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => openEdit(address)}
                  disabled={saving}
                >
                  Edit
                </button>
                {!address.isDefault ? (
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => handleSetDefault(address.id)}
                    disabled={saving}
                  >
                    Set default
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionDanger}`}
                  onClick={() => handleDelete(address.id)}
                  disabled={saving}
                >
                  Remove
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

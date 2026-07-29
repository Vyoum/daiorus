'use client';

import { useEffect, useState } from 'react';
import styles from '../orders/orders.module.css';

export default function SequelStatusBanner({ sequelConfigured }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!sequelConfigured) return;
    fetch('/api/admin/sequel247/status')
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => {});
  }, [sequelConfigured]);

  if (!sequelConfigured) {
    return (
      <p className={styles.shipmentWarning}>
        Sequel247 is not configured on this server. Add SEQUEL247_* env vars to enable shipment booking.
      </p>
    );
  }

  if (!status) return null;

  return (
    <div className={styles.sequelStatusBanner}>
      <p>
        <strong>Sequel environment:</strong> {status.env?.toUpperCase() || '—'} ·{' '}
        <code>{status.endpoint}</code> · store <code>{status.fromStoreCode}</code>
      </p>
      {status.serviceability ? (
        <p className={status.serviceability.ok ? styles.sequelStatusOk : styles.sequelStatusBad}>
          Serviceability ({status.originPincode || '110020'}):{' '}
          {status.serviceability.ok ? status.serviceability.message : status.serviceability.message}
        </p>
      ) : null}
      {status.serviceability && !status.serviceability.ok ? (
        <p className={styles.sequelStatusHint}>
          {status.env === 'production' ? (
            <>
              Your server is already on <strong>production</strong>. This error is coming directly
              from Sequel&apos;s live API — not from a wrong env setting. Ask Sequel to activate API
              access for store <code>{status.fromStoreCode}</code> and your production token. If
              wallet balance is zero, recharge that too. For old order errors, click{' '}
              <strong>Retry</strong> after Sequel confirms activation.
            </>
          ) : (
            <>
              If booking says &quot;company not active&quot;, Sequel may have activated{' '}
              <strong>production</strong> while this server uses <strong>{status.env}</strong>. Set{' '}
              <code>SEQUEL247_ENV=production</code> in env and restart, or ask Sequel to activate
              UAT. For old errors on an order, click <strong>Retry</strong>.
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}

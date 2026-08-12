'use client';

import Price from './Price';
import { buildPriceBreakup } from '../lib/price-breakup';
import styles from './ProductPriceBreakup.module.css';

export default function ProductPriceBreakup({ product }) {
  const breakup = buildPriceBreakup(product);

  if (!breakup.hasBreakup) {
    return (
      <p className={styles.empty}>
        Price breakup will appear once this piece has pricing details.
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {breakup.lines.map((line) => (
          <li key={line.key} className={`${styles.row} ${line.muted ? styles.rowMuted : ''}`}>
            <div className={styles.labelBlock}>
              <span className={styles.label}>{line.label}</span>
              {line.detail ? <span className={styles.detail}>{line.detail}</span> : null}
            </div>
            {line.muted ? (
              <span className={styles.mutedAmount}>—</span>
            ) : line.amount < 0 ? (
              <span className={styles.amount}>
                −<Price amount={Math.abs(line.amount)} />
              </span>
            ) : (
              <Price amount={line.amount} className={styles.amount} />
            )}
          </li>
        ))}
      </ul>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <div className={styles.totalPrices}>
          <Price amount={breakup.grandTotal} className={styles.totalAmount} />
        </div>
      </div>
    </div>
  );
}

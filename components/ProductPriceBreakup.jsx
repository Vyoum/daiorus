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
          <li key={line.key} className={styles.row}>
            <span className={styles.label}>{line.label}</span>
            <Price amount={line.amount} className={styles.amount} />
          </li>
        ))}
      </ul>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Grand Total</span>
        <div className={styles.totalPrices}>
          {product.compareAt && product.compareAt > breakup.grandTotal ? (
            <Price amount={product.compareAt} className={styles.compare} />
          ) : null}
          <Price amount={breakup.grandTotal} className={styles.totalAmount} />
        </div>
      </div>
    </div>
  );
}

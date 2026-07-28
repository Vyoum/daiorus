import { getProductSpecLines } from '@/lib/product-specs';
import styles from './ProductSpecs.module.css';

export default function ProductSpecs({
  product,
  lines: linesProp,
  variant = 'detail',
  className = '',
}) {
  const lines = linesProp || getProductSpecLines(product);
  if (!lines.length) return null;

  if (variant === 'inline') {
    return (
      <p className={`${styles.inline} ${className}`.trim()}>
        {lines.map((line) => line.value).join(' · ')}
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <ul className={`${styles.compactList} ${className}`.trim()}>
        {lines.map((line) => (
          <li key={line.label}>
            <span>{line.label}</span> {line.value}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className={`${styles.detailList} ${className}`.trim()}>
      {lines.map((line) => (
        <div key={line.label} className={styles.detailRow}>
          <dt>{line.label}</dt>
          <dd>{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}

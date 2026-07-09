'use client';

import { useCurrency } from './CurrencyProvider';

export default function Price({ amount, className }) {
  const { formatPrice, loading } = useCurrency();

  if (loading) {
    return <span className={className}>—</span>;
  }

  return <span className={className}>{formatPrice(amount)}</span>;
}

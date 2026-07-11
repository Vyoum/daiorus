export function formatOrderDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function maskPaymentRef(ref) {
  if (!ref) return '—';
  if (ref.length <= 8) return ref;
  return `${ref.slice(0, 4)}···${ref.slice(-4)}`;
}

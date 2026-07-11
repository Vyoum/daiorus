import { formatCurrency } from '../currency';

export function formatINR(amount) {
  return formatCurrency(amount ?? 0, 'INR');
}

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date) {
  if (!date) return '—';
  return `${formatDate(date)}, ${formatTime(date)}`;
}

export function relativeTime(date) {
  if (!date) return '';
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(date);
}

export function initials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const base = nameOrEmail.includes('@')
    ? nameOrEmail.split('@')[0]
    : nameOrEmail;
  const parts = base.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export function paymentLabel(status) {
  switch (status) {
    case 'PAID':
    case 'PROCESSING':
    case 'SHIPPED':
    case 'DELIVERED':
      return { label: 'Paid', tone: 'paid' };
    case 'PENDING':
      return { label: 'Pending', tone: 'pending' };
    case 'REFUNDED':
      return { label: 'Refunded', tone: 'refunded' };
    case 'CANCELLED':
      return { label: 'Cancelled', tone: 'refunded' };
    default:
      return { label: status || '—', tone: 'pending' };
  }
}

export function fulfillmentLabel(status) {
  switch (status) {
    case 'PENDING':
      return { label: 'Unfulfilled', tone: 'unfulfilled' };
    case 'PAID':
    case 'PROCESSING':
      return { label: 'Processing', tone: 'processing' };
    case 'SHIPPED':
      return { label: 'Shipped', tone: 'processing' };
    case 'DELIVERED':
      return { label: 'Delivered', tone: 'delivered' };
    case 'CANCELLED':
      return { label: 'Cancelled', tone: 'unfulfilled' };
    case 'REFUNDED':
      return { label: 'Refunded', tone: 'unfulfilled' };
    default:
      return { label: status || '—', tone: 'unfulfilled' };
  }
}

export function productStatusLabel(status) {
  switch (status) {
    case 'ACTIVE':
      return 'Published';
    case 'DRAFT':
      return 'Draft';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return status || '—';
  }
}

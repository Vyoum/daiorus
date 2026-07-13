export const SHIPPING_FREE_THRESHOLD_INR = 0;
export const SHIPPING_FEE_INR = 0;

export function calculateCartTotals(items, { discountInr = 0 } = {}) {
  const subtotalInr = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  // Free standard shipping on all domestic orders — no minimum
  const shippingInr = 0;
  const safeDiscount = Math.min(Math.max(0, Math.round(discountInr || 0)), subtotalInr);
  const totalInr = Math.max(0, subtotalInr + shippingInr - safeDiscount);

  return { subtotalInr, shippingInr, discountInr: safeDiscount, totalInr };
}

export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DAI-${date}-${rand}`;
}

export function inrToPaise(amountInr) {
  return Math.round(amountInr * 100);
}

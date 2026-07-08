export const SHIPPING_FREE_THRESHOLD_INR = 2000;
export const SHIPPING_FEE_INR = 99;

export function calculateCartTotals(items) {
  const subtotalInr = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingInr =
    subtotalInr === 0
      ? 0
      : subtotalInr >= SHIPPING_FREE_THRESHOLD_INR
        ? 0
        : SHIPPING_FEE_INR;
  const totalInr = subtotalInr + shippingInr;

  return { subtotalInr, shippingInr, totalInr };
}

export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DAI-${date}-${rand}`;
}

export function inrToPaise(amountInr) {
  return Math.round(amountInr * 100);
}

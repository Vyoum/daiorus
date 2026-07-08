export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  keyId,
  amount,
  currency,
  orderId,
  razorpayOrderId,
  email,
  orderNumber,
  onSuccess,
  onDismiss,
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error('Could not load Razorpay checkout');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      name: 'DAIORUS',
      description: `Order ${orderNumber}`,
      order_id: razorpayOrderId,
      prefill: { email },
      theme: { color: '#c4973a' },
      handler: async (response) => {
        try {
          const result = await onSuccess(response);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => {
          onDismiss?.();
          reject(new Error('Payment cancelled'));
        },
      },
    });

    rzp.on('payment.failed', (response) => {
      reject(new Error(response.error?.description || 'Payment failed'));
    });

    rzp.open();
  });
}

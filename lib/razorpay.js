import Razorpay from 'razorpay';

function trimEnv(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getRazorpay() {
  const key_id = trimEnv(process.env.RAZORPAY_KEY_ID);
  const key_secret = trimEnv(process.env.RAZORPAY_KEY_SECRET);

  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({ key_id, key_secret });
}

export function getRazorpayKeyId() {
  return (
    trimEnv(process.env.RAZORPAY_KEY_ID) ||
    trimEnv(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
  );
}

/**
 * Map server-side checkout failures to safe customer-facing messages.
 */
export function getCheckoutErrorMessage(error) {
  if (!error) return 'Failed to create order';

  if (error.message === 'Razorpay credentials are not configured') {
    return 'Payment gateway is not configured';
  }

  if (error.message === 'DATABASE_URL is not set') {
    return 'Store is temporarily unavailable. Please try again shortly.';
  }

  if (error.statusCode && error.error?.description) {
    if (error.statusCode === 401) {
      return 'Payment gateway authentication failed. Please contact support.';
    }
    return 'Payment gateway error. Please try again.';
  }

  const code = error.code;
  if (code === 'P1001' || code === 'P1002' || code === 'ETIMEDOUT' || code === 'ECONNREFUSED') {
    return 'Database connection failed. Please try again.';
  }

  if (code === 'P2002') {
    return 'Could not create order. Please try again.';
  }

  return 'Failed to create order';
}

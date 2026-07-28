import { checkSequelServiceability } from './client';
import { getSequelConfig, isSequelConfigured } from './config';

export async function getSequelConnectionStatus() {
  const config = getSequelConfig();

  if (!isSequelConfigured()) {
    return {
      configured: false,
      env: config.env,
      endpoint: config.endpoint || null,
    };
  }

  const status = {
    configured: true,
    env: config.env,
    endpoint: config.endpoint,
    fromStoreCode: config.fromStoreCode,
    originPincode: config.originPincode || null,
    serviceability: null,
  };

  const pin = config.originPincode || '110020';
  try {
    const result = await checkSequelServiceability(pin);
    status.serviceability = {
      ok: true,
      message: result.message || 'Pincode is serviceable',
      city: result.data?.city || null,
    };
  } catch (err) {
    status.serviceability = {
      ok: false,
      message: err?.message || 'Serviceability check failed',
    };
  }

  return status;
}

export function sequelAccountHint(errorMessage) {
  const message = String(errorMessage || '');
  if (!/company status not active/i.test(message)) return null;

  const config = getSequelConfig();
  const otherEnv = config.env === 'production' ? 'uat' : 'production';
  const otherEndpoint =
    otherEnv === 'production' ? 'https://sequel247.com' : 'https://test.sequel247.com';

  return `Sequel returned "company not active" on ${config.env.toUpperCase()} (${config.endpoint}). If Sequel activated your live account, set SEQUEL247_ENV=${otherEnv} or confirm UAT is activated. Other environment: ${otherEndpoint}.`;
}

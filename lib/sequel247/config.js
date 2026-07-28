/** Sequel247 API configuration — server only. */

function sequelEnvName() {
  const raw = String(process.env.SEQUEL247_ENV || 'uat').trim().toLowerCase();
  if (raw === 'production' || raw === 'prod' || raw === 'live') {
    return 'production';
  }
  return 'uat';
}

function readEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

function resolveSequelCredentials() {
  const env = sequelEnvName();
  const isProduction = env === 'production';

  const endpoint =
    readEnv('SEQUEL247_API_ENDPOINT') ||
    readEnv(isProduction ? 'SEQUEL247_PRODUCTION_API_ENDPOINT' : 'SEQUEL247_UAT_API_ENDPOINT') ||
    (isProduction ? 'https://sequel247.com' : 'https://test.sequel247.com');

  const token =
    readEnv('SEQUEL247_TOKEN') ||
    readEnv(isProduction ? 'SEQUEL247_PRODUCTION_TOKEN' : 'SEQUEL247_UAT_TOKEN');

  const fromStoreCode =
    readEnv('SEQUEL247_FROM_STORE_CODE') ||
    readEnv(isProduction ? 'SEQUEL247_PRODUCTION_FROM_STORE_CODE' : 'SEQUEL247_UAT_FROM_STORE_CODE') ||
    'DAI';

  return {
    env,
    endpoint: endpoint.replace(/\/$/, ''),
    token,
    fromStoreCode,
  };
}

export function isSequelConfigured() {
  const { endpoint, token, fromStoreCode } = resolveSequelCredentials();
  return Boolean(endpoint && token && fromStoreCode);
}

export function getSequelConfig() {
  const { env, endpoint, token, fromStoreCode } = resolveSequelCredentials();

  return {
    env,
    endpoint,
    token,
    fromStoreCode,
    originPincode: String(process.env.SEQUEL247_ORIGIN_PINCODE || '').trim(),
    shipmentType: String(process.env.SEQUEL247_SHIPMENT_TYPE || 'D&J').trim(),
    serviceType: String(process.env.SEQUEL247_SERVICE_TYPE || 'valuable').trim(),
    pickUpDate: String(process.env.SEQUEL247_PICKUP_DATE || 'Tomorrow').trim(),
    pickUpTime: String(process.env.SEQUEL247_PICKUP_TIME || '10:00-11:00').trim(),
    autoBookOnPayment: process.env.SEQUEL247_AUTO_BOOK !== 'false',
    netWeightGrams: Number(process.env.SEQUEL247_NET_WEIGHT_GRAMS) || 50,
    grossWeightGrams: Number(process.env.SEQUEL247_GROSS_WEIGHT_GRAMS) || 100,
    boxLengthCm: String(process.env.SEQUEL247_BOX_LENGTH_CM || '12'),
    boxBreadthCm: String(process.env.SEQUEL247_BOX_BREADTH_CM || '10'),
    boxHeightCm: String(process.env.SEQUEL247_BOX_HEIGHT_CM || '8'),
  };
}

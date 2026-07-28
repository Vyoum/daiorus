import { getSequelConfig, isSequelConfigured } from './config';

function sequelStatusOk(status) {
  return String(status || '').toLowerCase() === 'true';
}

async function sequelPost(path, body) {
  if (!isSequelConfigured()) {
    throw new Error('Sequel247 is not configured. Add SEQUEL247_API_ENDPOINT, SEQUEL247_TOKEN, and SEQUEL247_FROM_STORE_CODE.');
  }

  const { endpoint, token } = getSequelConfig();
  const url = `${endpoint}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...body }),
    cache: 'no-store',
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || `Sequel247 request failed (${res.status})`);
  }

  if (!sequelStatusOk(data.status)) {
    const detail =
      data.errorInfo && typeof data.errorInfo === 'object'
        ? Object.values(data.errorInfo).join('; ')
        : '';
    throw new Error([data.message, detail].filter(Boolean).join(' — ') || 'Sequel247 request failed');
  }

  return data;
}

export async function createSequelAddress(payload) {
  return sequelPost('/api/create_address', payload);
}

export async function checkSequelServiceability(pinCode) {
  return sequelPost('/api/checkServiceability', {
    pin_code: String(pinCode || '').trim(),
  });
}

export async function calculateSequelEdd({ originPincode, destinationPincode, pickupDate }) {
  return sequelPost('/api/shipment/calculateEDD', {
    origin_pincode: String(originPincode || '').trim(),
    destination_pincode: String(destinationPincode || '').trim(),
    pickup_date: pickupDate,
  });
}

export async function createSequelShipment(payload) {
  return sequelPost('/api/shipment/create', payload);
}

export async function cancelSequelShipment({ docket, cancelReason }) {
  return sequelPost('/api/cancel', {
    docket: String(docket || '').trim(),
    cancelReason: String(cancelReason || '').trim(),
  });
}

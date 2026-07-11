import { NextResponse } from 'next/server';
import { getRateFromInr } from '@/lib/exchange-rates';

export async function GET(request) {
  const currency = request.nextUrl.searchParams.get('currency') || 'INR';

  try {
    const rateFromInr = await getRateFromInr(currency.toUpperCase());
    return NextResponse.json({ currency: currency.toUpperCase(), rateFromInr });
  } catch (err) {
    console.error('[exchange-rate]', err?.message || err);
    return NextResponse.json({ currency: currency.toUpperCase(), rateFromInr: 1 });
  }
}

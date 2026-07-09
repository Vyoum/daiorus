import { NextResponse } from 'next/server';
import { resolveUserCurrency } from '../../../lib/geoip';

export async function GET(request) {
  try {
    const currency = await resolveUserCurrency(request);
    return NextResponse.json(currency);
  } catch (error) {
    console.error('geoip error:', error);
    return NextResponse.json(
      {
        countryCode: 'IN',
        countryName: 'India',
        currencyCode: 'INR',
        currencyName: 'Indian Rupee',
        currencySymbol: '₹',
        rateFromInr: 1,
      },
      { status: 200 }
    );
  }
}

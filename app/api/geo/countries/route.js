import { NextResponse } from 'next/server';
import { fetchCountries } from '../../../../lib/geo-regions';

export async function GET() {
  try {
    const countries = await fetchCountries();
    return NextResponse.json({ countries });
  } catch (error) {
    console.error('geo/countries error:', error);
    return NextResponse.json(
      { error: 'Could not load countries', countries: [] },
      { status: 500 },
    );
  }
}

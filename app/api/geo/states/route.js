import { NextResponse } from 'next/server';
import { fetchStatesForCountry } from '../../../../lib/geo-regions';

export async function GET(request) {
  try {
    const country = request.nextUrl.searchParams.get('country') || 'IN';
    const states = await fetchStatesForCountry(country);
    return NextResponse.json({
      country: String(country).trim().toUpperCase(),
      states,
    });
  } catch (error) {
    console.error('geo/states error:', error);
    return NextResponse.json(
      { error: 'Could not load states', states: [] },
      { status: 500 },
    );
  }
}

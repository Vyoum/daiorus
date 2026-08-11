/**
 * Internal Daiorus fetcher for IBJA benchmark gold rates (ibjarates.com).
 * Used only from admin gold-pricing and cron — not exposed as a public API.
 * Rates are per 10g for Gold 999 (24K); we convert to INR per gram for pricing.
 */

export const IBJA_RATES_URL = 'https://www.ibjarates.com/';

function parseSpanAmount(html, elementId) {
  const pattern = new RegExp(`id="${elementId}"[^>]*>\\s*([\\d,]+)`, 'i');
  const match = html.match(pattern);
  if (!match) return 0;
  return Math.round(Number(String(match[1]).replace(/,/g, '')) || 0);
}

/**
 * Parse Gold 999 (24K) rate from IBJA homepage HTML.
 * Prefers PM session when published; falls back to AM.
 */
export function parseIbjaGold999FromHtml(html) {
  if (!html || typeof html !== 'string') {
    throw new Error('IBJA rates page returned empty content.');
  }

  const amPer10g = parseSpanAmount(html, 'lblGold999_AM');
  const pmPer10g = parseSpanAmount(html, 'lblGold999_PM');

  let ibjaSession = null;
  let ibjaRate999Per10g = 0;

  if (pmPer10g > 0) {
    ibjaSession = 'PM';
    ibjaRate999Per10g = pmPer10g;
  } else if (amPer10g > 0) {
    ibjaSession = 'AM';
    ibjaRate999Per10g = amPer10g;
  } else {
    const perGramDisplay = parseSpanAmount(html, 'GoldRatesCompare999');
    if (perGramDisplay > 0) {
      ibjaSession = 'AM';
      ibjaRate999Per10g = perGramDisplay * 10;
    }
  }

  if (!ibjaRate999Per10g) {
    throw new Error(
      'Could not parse IBJA Gold 999 rate. The ibjarates.com page layout may have changed.',
    );
  }

  const rate24kPerGram = Math.round(ibjaRate999Per10g / 10);

  if (!Number.isFinite(rate24kPerGram) || rate24kPerGram <= 0) {
    throw new Error('IBJA Gold 999 rate parsed to an invalid per-gram value.');
  }

  return {
    rate24kPerGram,
    ibjaRate999Per10g,
    ibjaSession,
    source: 'ibja',
  };
}

/** Fetch latest IBJA Gold 999 rate (server-side only). */
export async function fetchIbjaGoldRate() {
  const response = await fetch(`${IBJA_RATES_URL}?t=${Date.now()}`, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'DaiorusInternalGoldPricing/1.0',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`IBJA rates page request failed (${response.status}).`);
  }

  const html = await response.text();
  return parseIbjaGold999FromHtml(html);
}

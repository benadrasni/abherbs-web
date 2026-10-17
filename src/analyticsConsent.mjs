// Cloudflare /cdn-cgi/trace reports ISO country codes. GB is the United Kingdom.
// A missing trace, Tor, or an anonymous proxy must ask, so collection stays off.

const CONSENT_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB', 'UK', 'CH', 'EU',
  'AX', 'EA', 'GF', 'GP', 'IC', 'MF', 'MQ', 'RE', 'YT',
]);

const UNKNOWN_CODES = new Set(['', 'XX', 'T1', 'A1', 'A2']);

export function parseCloudflareTrace(text) {
  const body = String(text || '');
  if (body.includes('<')) return '';
  const match = body.match(/(?:^|\n)loc=([A-Za-z0-9]{2})(?:\r?\n|$)/);
  return match ? match[1].toUpperCase() : '';
}

export function decisionFor({ choice, loc }) {
  if (choice === 'granted') return { load: true, ask: false };
  if (choice === 'denied') return { load: false, ask: false };
  const code = String(loc || '').toUpperCase();
  if (UNKNOWN_CODES.has(code) || !/^[A-Z]{2}$/.test(code)) {
    return { load: false, ask: true };
  }
  if (CONSENT_COUNTRIES.has(code)) return { load: false, ask: true };
  return { load: true, ask: false };
}

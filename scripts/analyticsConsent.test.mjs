import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { decisionFor, parseCloudflareTrace } from '../src/analyticsConsent.mjs';

const TRACE = [
  'fl=123',
  'h=whatsthatflower.com',
  'ip=203.0.113.8',
  'loc=SK',
  'tls=TLSv1.3',
  '',
].join('\n');

test('trace loc is the country code', () => {
  assert.equal(parseCloudflareTrace(TRACE), 'SK');
  assert.equal(parseCloudflareTrace('colo=VIE\nloc=us\n'), 'US');
  assert.equal(parseCloudflareTrace('<!doctype html><script>loc=US</script>'), '');
  assert.equal(parseCloudflareTrace(''), '');
});

test('EEA, UK, and Switzerland ask before collection', () => {
  for (const loc of ['DE', 'FR', 'SK', 'IE', 'GR', 'CY', 'NO', 'IS', 'LI', 'GB', 'UK', 'CH', 'AX', 'GP']) {
    assert.deepEqual(decisionFor({ choice: '', loc }), { load: false, ask: true }, loc);
  }
});

test('other countries load with no question', () => {
  for (const loc of ['US', 'JP', 'AU', 'BR', 'IN', 'CA', 'KR', 'TW']) {
    assert.deepEqual(decisionFor({ choice: '', loc }), { load: true, ask: false }, loc);
  }
});

test('a stored choice wins over the country', () => {
  assert.deepEqual(decisionFor({ choice: 'granted', loc: 'DE' }), { load: true, ask: false });
  assert.deepEqual(decisionFor({ choice: 'denied', loc: 'US' }), { load: false, ask: false });
});

test('privacy copy exists in every catalog language', () => {
  const privacy = JSON.parse(readFileSync(new URL('./privacy_locales.json', import.meta.url), 'utf8'));
  const locales = JSON.parse(readFileSync(new URL('../src/locales.json', import.meta.url), 'utf8'));
  const keys = Object.keys(privacy.en);
  assert.deepEqual(Object.keys(privacy).sort(), Object.keys(locales).sort());
  for (const [lang, strings] of Object.entries(privacy)) {
    assert.deepEqual(Object.keys(strings).sort(), keys.slice().sort(), lang);
    for (const key of keys) {
      assert.equal(locales[lang][key], strings[key], `${lang}.${key}`);
    }
  }
});

test('an unknown country asks and does not load', () => {
  for (const loc of ['', 'XX', 'T1', 'A1', 'A2', 'EU']) {
    assert.deepEqual(decisionFor({ choice: '', loc }), { load: false, ask: true }, loc || '(empty)');
  }
});

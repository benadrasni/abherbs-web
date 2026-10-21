import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { appleSmartBanner } from '../src/appLink.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the Smart App Banner names a species and nothing else', () => {
  assert.equal(appleSmartBanner('https://whatsthatflower.com/'), 'app-id=1449982118');
  assert.equal(
    appleSmartBanner('https://whatsthatflower.com/family/Rosaceae/'),
    'app-id=1449982118',
  );
  assert.equal(
    appleSmartBanner('https://whatsthatflower.com/plant/Bellis%20perennis/'),
    'app-id=1449982118, app-argument=https://whatsthatflower.com/plant/Bellis%20perennis/',
  );
  assert.equal(
    appleSmartBanner('https://whatsthatflower.com/de/plant/Bellis%20perennis/'),
    'app-id=1449982118, app-argument=https://whatsthatflower.com/de/plant/Bellis%20perennis/',
  );
});

test('association files claim only this app and species pages', () => {
  const assetlinks = JSON.parse(
    fs.readFileSync(path.join(root, 'public/.well-known/assetlinks.json'), 'utf8'),
  );
  assert.equal(assetlinks.length, 1);
  assert.equal(assetlinks[0].target.package_name, 'sk.ab.herbs');
  assert.deepEqual(assetlinks[0].target.sha256_cert_fingerprints, [
    '05:1A:0F:08:AD:5C:7B:39:DD:B4:10:21:E4:34:1B:DE:1C:BE:EF:12:D4:19:0F:1B:D1:53:4F:5B:6F:12:04:BA',
  ]);

  const aasa = JSON.parse(
    fs.readFileSync(path.join(root, 'public/.well-known/apple-app-site-association'), 'utf8'),
  );
  const detail = aasa.applinks.details[0];
  assert.equal(detail.appID, '7UC4T3C62B.sk.ab.herbs');
  assert.ok(detail.paths.includes('/plant/*'));
  assert.ok(detail.paths.includes('/*/plant/*'));
  assert.equal(detail.paths.includes('/*'), false);
  const open = detail.components.filter((item) => !item.exclude).map((item) => item['/']);
  assert.deepEqual(open, ['/plant/*', '/*/plant/*']);
});

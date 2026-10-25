import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { mushroomUrl } from '../src/mushroomLink.mjs';

test('mushroom link follows languages the sister site publishes', () => {
  assert.equal(mushroomUrl('en'), 'https://whatsthatmushroom.app/');
  assert.equal(mushroomUrl(''), 'https://whatsthatmushroom.app/');
  assert.equal(mushroomUrl('de'), 'https://whatsthatmushroom.app/');
  assert.equal(mushroomUrl('sk'), 'https://whatsthatmushroom.app/sk/');
  assert.equal(mushroomUrl('SK'), 'https://whatsthatmushroom.app/sk/');
});

test('sister copy uses the mushroom site name, and only Slovak is translated', () => {
  const catalogs = JSON.parse(fs.readFileSync(new URL('../src/locales.json', import.meta.url), 'utf8'));
  assert.equal(catalogs.en.sister_site, "What's that mushroom?");
  assert.equal(catalogs.en.about_sister, 'Mushrooms are a separate field guide:');
  assert.equal(catalogs.sk.sister_site, 'Aká je to huba?');
  assert.equal(catalogs.sk.about_sister, 'Huby sú samostatný atlas:');
  for (const [lang, cat] of Object.entries(catalogs)) {
    if (lang === 'sk') continue;
    assert.equal(cat.sister_site, catalogs.en.sister_site, lang);
    assert.equal(cat.about_sister, catalogs.en.about_sister, lang);
  }
});

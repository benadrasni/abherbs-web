import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { mushroomIdentifyUrl, mushroomUrl } from '../src/mushroomLink.mjs';

const PUBLISHED = [
  'sk', 'de', 'fr', 'cs', 'pl', 'ru', 'es', 'pt', 'ja', 'it', 'nl', 'uk', 'hu',
  'da', 'sv', 'no', 'fi', 'et', 'lv', 'lt', 'hr', 'sl', 'sr', 'bg', 'ro', 'hi',
  'ko', 'zh', 'fa', 'he', 'ar', 'id', 'tr',
];

test('mushroom link follows languages the sister site publishes', () => {
  assert.equal(mushroomUrl('en'), 'https://whatsthatmushroom.app/');
  assert.equal(mushroomUrl(''), 'https://whatsthatmushroom.app/');
  assert.equal(mushroomUrl('SK'), 'https://whatsthatmushroom.app/sk/');
  assert.equal(mushroomUrl('xx'), 'https://whatsthatmushroom.app/');
  assert.equal(mushroomIdentifyUrl('en'), 'https://whatsthatmushroom.app/identify/');
  assert.equal(mushroomIdentifyUrl('nope'), 'https://whatsthatmushroom.app/identify/');
  for (const code of PUBLISHED) {
    assert.equal(mushroomUrl(code), `https://whatsthatmushroom.app/${code}/`);
    assert.equal(mushroomIdentifyUrl(code), `https://whatsthatmushroom.app/${code}/identify/`);
  }
});

test('the paired app section names both guides', () => {
  const catalogs = JSON.parse(fs.readFileSync(new URL('../src/locales.json', import.meta.url), 'utf8'));
  assert.equal(catalogs.en.get_the_app, 'Identify plant in the app');
  assert.equal(catalogs.en.mushroom_app, 'Identify mushroom in the app');
  assert.equal(catalogs.en.mushroom_open, 'Identify on mushrooms site');
  assert.match(catalogs.de.mushroom_lede, /Unterseite/);
  assert.equal(catalogs.sk.mushroom_open, 'Určovať na webe húb');
  assert.equal(catalogs.de.mushroom_open, 'Bestimmen auf der Pilzseite');
  assert.notEqual(catalogs.ja.mushroom_app, catalogs.en.mushroom_app);
  assert.equal(catalogs.id.get_the_app, 'Kenali tumbuhan di aplikasi');
  assert.equal(catalogs.tr.mushroom_app, 'Uygulamada mantar tanımla');
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

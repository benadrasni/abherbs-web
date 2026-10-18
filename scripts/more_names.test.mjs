import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

async function loadUiText() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const server = await createServer({
    root,
    configFile: fileURLToPath(new URL('../vite.config.mjs', import.meta.url)),
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });
  const mod = await server.ssrLoadModule('/src/copy.js');
  return { uiText: mod.uiText, close: () => server.close() };
}

test('more names uses 1, 2–4, and 5+ where the language distinguishes them', async () => {
  const { uiText, close } = await loadUiText();
  try {
    const phrase = (lang, n) => uiText(lang).more_names(n);
    const cases = [
      ['sk', 1, 'ešte 1 meno'],
      ['sk', 2, 'ešte 2 mená'],
      ['sk', 4, 'ešte 4 mená'],
      ['sk', 5, 'ešte 5 mien'],
      ['sk', 11, 'ešte 11 mien'],
      ['sk', 22, 'ešte 22 mien'],
      ['cs', 1, 'další 1 jméno'],
      ['cs', 2, 'další 2 jména'],
      ['cs', 4, 'další 4 jména'],
      ['cs', 5, 'dalších 5 jmen'],
      ['cs', 22, 'dalších 22 jmen'],
      ['sl', 1, 'še 1 ime'],
      ['sl', 2, 'še 2 imeni'],
      ['sl', 3, 'še 3 imena'],
      ['sl', 4, 'še 4 imena'],
      ['sl', 5, 'še 5 imen'],
      ['sl', 102, 'še 102 imeni'],
      ['pl', 1, 'jeszcze 1 nazwa'],
      ['pl', 2, 'jeszcze 2 nazwy'],
      ['pl', 5, 'jeszcze 5 nazw'],
      ['pl', 12, 'jeszcze 12 nazw'],
      ['pl', 21, 'jeszcze 21 nazw'],
      ['pl', 22, 'jeszcze 22 nazwy'],
      ['ru', 1, 'ещё 1 имя'],
      ['ru', 2, 'ещё 2 имени'],
      ['ru', 5, 'ещё 5 имён'],
      ['ru', 11, 'ещё 11 имён'],
      ['ru', 21, 'ещё 21 имя'],
      ['ru', 22, 'ещё 22 имени'],
      ['uk', 1, 'ще 1 назва'],
      ['uk', 2, 'ще 2 назви'],
      ['uk', 5, 'ще 5 назв'],
      ['uk', 11, 'ще 11 назв'],
      ['uk', 21, 'ще 21 назва'],
      ['uk', 22, 'ще 22 назви'],
      ['hr', 1, 'još 1 ime'],
      ['hr', 2, 'još 2 imena'],
      ['hr', 5, 'još 5 imena'],
      ['hr', 21, 'još 21 ime'],
      ['hr', 22, 'još 22 imena'],
      ['sr', 1, 'још 1 име'],
      ['sr', 2, 'још 2 имена'],
      ['sr', 5, 'још 5 имена'],
      ['sr', 21, 'још 21 име'],
      ['bg', 1, 'още 1 име'],
      ['bg', 2, 'още 2 имена'],
      ['bg', 5, 'още 5 имена'],
      ['lt', 1, 'dar 1 vardas'],
      ['lt', 2, 'dar 2 vardai'],
      ['lt', 5, 'dar 5 vardai'],
      ['lt', 9, 'dar 9 vardai'],
      ['lt', 10, 'dar 10 vardų'],
      ['lt', 11, 'dar 11 vardų'],
      ['lt', 21, 'dar 21 vardas'],
      ['lt', 22, 'dar 22 vardai'],
      ['lv', 1, 'vēl 1 nosaukums'],
      ['lv', 2, 'vēl 2 nosaukumi'],
      ['lv', 5, 'vēl 5 nosaukumi'],
      ['lv', 10, 'vēl 10 nosaukumu'],
      ['lv', 11, 'vēl 11 nosaukumu'],
      ['lv', 21, 'vēl 21 nosaukums'],
      ['lv', 22, 'vēl 22 nosaukumi'],
      ['en', 1, '1 more name'],
      ['en', 2, '2 more names'],
      ['en', 5, '5 more names'],
      ['de', 1, 'noch 1 Namen'],
      ['de', 2, 'noch 2 Namen'],
      ['de', 5, 'noch 5 Namen'],
      ['ja', 2, 'ほか 2 名'],
    ];
    for (const [lang, n, expected] of cases) {
      assert.equal(phrase(lang, n), expected, `${lang} ${n}`);
    }

    assert.equal(uiText('en').plants_count(1), '1 plant');
    assert.equal(uiText('en').plants_count(2), '2 plants');
    assert.equal(uiText('sk').plants_count(2), '2 rastliny');
    assert.equal(uiText('sk').plants_count(5), '5 rastlín');
    assert.equal(uiText('pl').plants_count(2), '2 rośliny');
    assert.equal(uiText('pl').plants_count(5), '5 roślin');
    assert.equal(uiText('pl').plants_count(22), '22 rośliny');
    assert.equal(uiText('lt').plants_count(1), '1 augalas');
    assert.equal(uiText('lt').plants_count(2), '2 augalai');
    assert.equal(uiText('lt').plants_count(5), '5 augalai');
    assert.equal(uiText('lt').plants_count(11), '11 augalų');
    assert.equal(uiText('lt').plants_count(21), '21 augalas');
    assert.equal(uiText('he').plants_count(1), 'צמח אחד');
    assert.equal(uiText('he').plants_count(2), '2 צמחים');

    const ar = new Intl.PluralRules('ar');
    assert.equal(ar.select(1), 'one');
    assert.equal(ar.select(2), 'two');
    assert.equal(ar.select(4), 'few');
    assert.equal(ar.select(5), 'few');
    assert.equal(ar.select(11), 'many');
    assert.equal(phrase('ar', 2), 'اسمان آخران');
    assert.equal(phrase('ar', 4), `${(4).toLocaleString('ar')} أسماء أخرى`);
    assert.equal(phrase('ar', 5), `${(5).toLocaleString('ar')} أسماء أخرى`);
    assert.equal(phrase('ar', 11), `${(11).toLocaleString('ar')} اسمًا آخر`);
    assert.equal(phrase('ar', 1), `${(1).toLocaleString('ar')} اسم آخر`);
  } finally {
    await close();
  }
});

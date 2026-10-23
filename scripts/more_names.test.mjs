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

    const records = (lang, n) => uiText(lang).public_records(n);
    assert.equal(records('sk', 0), '0 verejných záznamov');
    assert.equal(records('sk', 1), '1 verejný záznam');
    assert.equal(records('sk', 2), '2 verejné záznamy');
    assert.equal(records('sk', 3), '3 verejné záznamy');
    assert.equal(records('sk', 4), '4 verejné záznamy');
    assert.equal(records('sk', 5), '5 verejných záznamov');
    assert.equal(records('sk', 11), '11 verejných záznamov');
    assert.equal(records('sk', 21), '21 verejných záznamov');
    assert.equal(records('sk', 22), '22 verejných záznamov');
    assert.equal(records('en', 1), '1 public record');
    assert.equal(records('en', 2), '2 public records');
    assert.equal(records('en', 5), '5 public records');
    const recordCases = [
      ['cs', 1, '1 veřejný záznam'],
      ['cs', 2, '2 veřejné záznamy'],
      ['cs', 4, '4 veřejné záznamy'],
      ['cs', 5, '5 veřejných záznamů'],
      ['cs', 22, '22 veřejných záznamů'],
      ['pl', 1, '1 publiczny zapis'],
      ['pl', 2, '2 publiczne zapisy'],
      ['pl', 5, '5 publicznych zapisów'],
      ['pl', 12, '12 publicznych zapisów'],
      ['pl', 21, '21 publicznych zapisów'],
      ['pl', 22, '22 publiczne zapisy'],
      ['pl', 24, '24 publiczne zapisy'],
      ['ru', 1, '1 открытая запись'],
      ['ru', 2, '2 открытые записи'],
      ['ru', 5, '5 открытых записей'],
      ['ru', 11, '11 открытых записей'],
      ['ru', 21, '21 открытая запись'],
      ['ru', 22, '22 открытые записи'],
      ['uk', 1, '1 відкритий запис'],
      ['uk', 2, '2 відкриті записи'],
      ['uk', 5, '5 відкритих записів'],
      ['uk', 11, '11 відкритих записів'],
      ['uk', 21, '21 відкритий запис'],
      ['uk', 22, '22 відкриті записи'],
      ['sl', 1, '1 javni zapis'],
      ['sl', 2, '2 javna zapisa'],
      ['sl', 3, '3 javni zapisi'],
      ['sl', 4, '4 javni zapisi'],
      ['sl', 5, '5 javnih zapisov'],
      ['sl', 22, '22 javnih zapisov'],
      ['sl', 101, '101 javni zapis'],
      ['sl', 102, '102 javna zapisa'],
      ['hr', 1, '1 javni zapis'],
      ['hr', 2, '2 javna zapisa'],
      ['hr', 4, '4 javna zapisa'],
      ['hr', 5, '5 javnih zapisa'],
      ['hr', 11, '11 javnih zapisa'],
      ['hr', 21, '21 javni zapis'],
      ['hr', 22, '22 javna zapisa'],
      ['sr', 1, '1 јавни запис'],
      ['sr', 2, '2 јавна записа'],
      ['sr', 5, '5 јавних записа'],
      ['sr', 21, '21 јавни запис'],
      ['sr', 22, '22 јавна записа'],
      ['lt', 1, '1 viešas įrašas'],
      ['lt', 2, '2 vieši įrašai'],
      ['lt', 9, '9 vieši įrašai'],
      ['lt', 10, '10 viešų įrašų'],
      ['lt', 11, '11 viešų įrašų'],
      ['lt', 21, '21 viešas įrašas'],
      ['lt', 22, '22 vieši įrašai'],
      ['lv', 0, '0 publisku ierakstu'],
      ['lv', 1, '1 publisks ieraksts'],
      ['lv', 2, '2 publiski ieraksti'],
      ['lv', 5, '5 publiski ieraksti'],
      ['lv', 10, '10 publisku ierakstu'],
      ['lv', 11, '11 publisku ierakstu'],
      ['lv', 21, '21 publisks ieraksts'],
      ['lv', 22, '22 publiski ieraksti'],
      ['bg', 1, '1 публичен запис'],
      ['bg', 2, '2 публични записа'],
      ['bg', 5, '5 публични записа'],
      ['ar', 2, 'سجلان عامان'],
      ['ar', 5, `${(5).toLocaleString('ar')} سجلات عامة`],
      ['ar', 11, `${(11).toLocaleString('ar')} سجلًا عامًا`],
      ['ar', 101, `${(101).toLocaleString('ar')} سجلات عامة`],
      ['he', 2, '2 רשומות ציבוריות'],
      ['ro', 1, '1 înregistrare publică'],
      ['ro', 2, '2 înregistrări publice'],
      ['ro', 21, '21 înregistrări publice'],
    ];
    for (const [lang, n, expected] of recordCases) {
      assert.equal(records(lang, n), expected, `${lang} records ${n}`);
    }
  } finally {
    await close();
  }
});

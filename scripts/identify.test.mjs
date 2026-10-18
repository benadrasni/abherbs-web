import assert from 'node:assert/strict';
import test from 'node:test';
import {
  attachFilters,
  optionCounts,
  parseSelection,
  plantMatches,
  selectionActive,
  selectionQuery,
} from '../src/identify.mjs';

const maple = {
  name: 'Acer campestre',
  filterColor: [5, 2],
  filterHabitat: [4, 7, 8],
  filterPetal: [2],
  filterDistribution: [11, 13],
};

const daisy = {
  name: 'Bellis perennis',
  filterColor: [1, 3],
  filterHabitat: [1, 8],
  filterPetal: [3],
  filterDistribution: [11],
};

const gardenOnly = {
  name: 'Cultivated example',
  filterColor: [4],
  filterPetal: [4],
  filterDistribution: [11],
};

const plants = [maple, daisy, gardenOnly];

test('a plant matches each of its colors, habitats, petals, and regions', () => {
  assert.equal(plantMatches(maple, parseSelection({ color: '2' })), true);
  assert.equal(plantMatches(maple, parseSelection({ color: '1' })), false);
  assert.equal(plantMatches(maple, parseSelection({ color: '5', habitat: '4', petal: '2', region: '11' })), true);
  assert.equal(plantMatches(maple, parseSelection({ color: '5', region: '20' })), false);
});

test('an empty habitat slot keeps a plant with no wild habitat', () => {
  assert.equal(plantMatches(gardenOnly, parseSelection({ color: '4' })), true);
  assert.equal(plantMatches(gardenOnly, parseSelection({ color: '4', habitat: '1' })), false);
});

test('unknown filter codes are ignored', () => {
  const selection = parseSelection({ color: '9', habitat: '2', petal: 'x', region: '11' });
  assert.deepEqual(selection, { color: '', habitat: '', petal: '', region: '11' });
  assert.equal(selectionActive(selection), true);
  assert.equal(selectionActive(parseSelection({})), false);
});

test('the query round-trips only the chosen slots', () => {
  const selection = parseSelection({ color: '1', petal: '3' });
  const again = parseSelection(selectionQuery(selection));
  assert.deepEqual(again, { color: '1', habitat: '', petal: '3', region: '' });
});

test('option counts follow the other selected slots', () => {
  const open = parseSelection({});
  assert.equal(optionCounts(plants, open, 'color')['2'], 1);
  assert.equal(optionCounts(plants, open, 'color')['1'], 1);
  assert.equal(optionCounts(plants, open, 'color')['5'], 1);
  const middleEurope = parseSelection({ region: '11' });
  assert.equal(optionCounts(plants, middleEurope, 'petal')['2'], 1);
  assert.equal(optionCounts(plants, middleEurope, 'petal')['3'], 1);
  assert.equal(optionCounts(plants, middleEurope, 'petal')['4'], 1);
  assert.equal(optionCounts(plants, parseSelection({ color: '1' }), 'habitat')['4'], 0);
  assert.equal(optionCounts(plants, parseSelection({ color: '1' }), 'habitat')['1'], 1);
});

test('filter rows join the catalog by id, then by name', () => {
  const headers = [
    { id: 0, name: 'Acer campestre', illustrationUrl: 'plate.webp' },
    { id: 9, name: 'Renamed in the book' },
  ];
  const raw = {
    0: { name: 'Acer campestre', filterColor: [5], filterPetal: [2] },
    4: { name: 'Renamed in the book', filterColor: [1], filterHabitat: [8] },
  };
  const joined = attachFilters(headers, raw);
  assert.equal(joined[0].illustrationUrl, 'plate.webp');
  assert.deepEqual(joined[0].filterColor, [5]);
  assert.deepEqual(joined[1].filterColor, [1]);
  assert.deepEqual(joined[1].filterHabitat, [8]);
});

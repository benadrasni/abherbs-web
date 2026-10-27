import assert from 'node:assert/strict';
import test from 'node:test';
import { spokenName } from '../src/spokenName.mjs';

test('spokenName keeps a real vernacular and drops a missing or copied Latin name', () => {
  assert.equal(spokenName('daisy', 'Bellis perennis'), 'daisy');
  assert.equal(spokenName(' iris ', 'Iris'), 'iris');
  assert.equal(spokenName('', 'Bellis perennis'), '');
  assert.equal(spokenName('   ', 'Bellis perennis'), '');
  assert.equal(spokenName('Bellis perennis', 'Bellis perennis'), '');
  assert.equal(spokenName(' Bellis perennis ', 'Bellis perennis'), '');
  assert.equal(spokenName(null, 'Bellis perennis'), '');
});

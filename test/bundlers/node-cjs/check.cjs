// Regression guard: plain Node CJS `require` must resolve the package's `exports` map correctly.
// This is exactly the path that broke under the legacy `browser`-field-remap approach.
const { readFileSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { loadModule } = require('@farscrl/hunspell-wasm');

const fixture = (name) => new Uint8Array(readFileSync(path.join(__dirname, '../../fixtures', name)));

loadModule().then((factory) => {
  const affPath = factory.mountBuffer(fixture('test.aff'), 'test.aff');
  const dicPath = factory.mountBuffer(fixture('test.dic'), 'test.dic');
  const hunspell = factory.create(affPath, dicPath);

  assert.equal(hunspell.spell('hello'), true);
  assert.equal(hunspell.spell('helo'), false);
  assert.deepEqual(hunspell.suggest('helo'), ['hello']);

  hunspell.dispose();
  console.log('node-cjs bundler smoke test OK');
});

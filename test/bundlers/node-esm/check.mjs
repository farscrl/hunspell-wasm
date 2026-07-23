// Regression guard: plain Node ESM `import` must resolve the package's `exports` map correctly.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { loadModule } from '@farscrl/hunspell-wasm';

const fixture = (name) => new Uint8Array(readFileSync(new URL(`../../fixtures/${name}`, import.meta.url)));

const factory = await loadModule();
const affPath = factory.mountBuffer(fixture('test.aff'), 'test.aff');
const dicPath = factory.mountBuffer(fixture('test.dic'), 'test.dic');
const hunspell = factory.create(affPath, dicPath);

assert.equal(hunspell.spell('hello'), true);
assert.equal(hunspell.spell('helo'), false);
assert.deepEqual(hunspell.suggest('helo'), ['hello']);

hunspell.dispose();
console.log('node-esm bundler smoke test OK');

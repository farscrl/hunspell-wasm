// Regression guard: a strict Rollup/Vite bundling pass (noExternal: true) must produce output
// that still correctly loads the wasm module at runtime — this is the exact class of bundler
// that broke under the legacy package's `browser`-field-remap resolution.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { loadModule } from '@farscrl/hunspell-wasm';

// Fixtures are copied next to this file's *output* location by the `check` script (see
// package.json) — a plain relative import.meta.url lookup would break once bundled, since the
// bundled file lives one directory deeper (dist/) than this source file.
const fixture = (name) => new Uint8Array(readFileSync(new URL(`./fixtures/${name}`, import.meta.url)));

const factory = await loadModule();
const affPath = factory.mountBuffer(fixture('test.aff'), 'test.aff');
const dicPath = factory.mountBuffer(fixture('test.dic'), 'test.dic');
const hunspell = factory.create(affPath, dicPath);

assert.equal(hunspell.spell('hello'), true);
assert.equal(hunspell.spell('helo'), false);
assert.deepEqual(hunspell.suggest('helo'), ['hello']);

hunspell.dispose();
console.log('vite bundler smoke test OK');

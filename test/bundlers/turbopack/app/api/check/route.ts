// Regression guard: a Next.js/Turbopack production build must bundle this package without
// choking on its guarded Node-only `require("node:fs")`-style calls (see
// https://github.com/emscripten-core/emscripten/issues/26134 for the class of bug this guards
// against), and the result must still work correctly at runtime.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { loadModule } from '@farscrl/hunspell-wasm';

export const runtime = 'nodejs';

export async function GET() {
  const fixturesDir = path.join(process.cwd(), '..', '..', 'fixtures');
  const aff = new Uint8Array(readFileSync(path.join(fixturesDir, 'test.aff')));
  const dic = new Uint8Array(readFileSync(path.join(fixturesDir, 'test.dic')));

  const factory = await loadModule();
  const affPath = factory.mountBuffer(aff, 'test.aff');
  const dicPath = factory.mountBuffer(dic, 'test.dic');
  const hunspell = factory.create(affPath, dicPath);

  const result = {
    hello: hunspell.spell('hello'),
    helo: hunspell.spell('helo'),
    suggest: hunspell.suggest('helo'),
  };

  hunspell.dispose();
  return NextResponse.json(result);
}

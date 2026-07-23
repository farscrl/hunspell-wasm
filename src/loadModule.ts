import { createHunspellFactory } from './hunspellLoader';
import type { HunspellFactory } from './types';

/**
 * Loads and instantiates the hunspell wasm module.
 *
 * Uses a dynamic `import()` (not a static import) so the same compiled output works whether
 * this package is consumed as CJS or ESM: the wasm glue (`./lib/hunspell.mjs`) is itself an ES
 * module and cannot be `require()`-d, but `import()` is valid from both module systems.
 */
export const loadModule = async (): Promise<HunspellFactory> => {
  const { default: createHunspellModule } = await import('./lib/hunspell.mjs');
  const wasm = await createHunspellModule();
  return createHunspellFactory(wasm);
};

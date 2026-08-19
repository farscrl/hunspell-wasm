import { createHunspellFactory } from './hunspellLoader';
import type { HunspellFactory } from './types';

/**
 * Loads and instantiates the hunspell wasm module.
 *
 * Uses a dynamic `import()` (not a static import) so the same compiled output works whether
 * this package is consumed as CJS or ESM: the wasm glue is itself an ES module and cannot be
 * `require()`-d, but `import()` is valid from both module systems.
 *
 * Imports via the `#hunspell-glue` internal specifier (package.json "imports") rather than a
 * relative path so browser-targeting bundlers (webpack, esbuild with platform:'browser', ...)
 * resolve the "browser" condition to a build with no Node-only branches at all — the isomorphic
 * web+node build's guarded `import("node:module")`/`require("node:fs")` calls are invisible at
 * runtime but still get statically resolved (and hard-error) by bundlers that target the
 * browser. See #17.
 */
export const loadModule = async (): Promise<HunspellFactory> => {
  const { default: createHunspellModule } = await import('#hunspell-glue');
  const wasm = await createHunspellModule();
  return createHunspellFactory(wasm);
};

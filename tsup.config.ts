import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
  dts: true,
  clean: true,
  sourcemap: true,
  // The wasm glue is resolved through the "#hunspell-glue" internal import (package.json
  // "imports" — conditional on "browser" vs. default, see #17) and loaded via dynamic import()
  // at runtime (see loadModule.ts). The resolved files are ES modules copied into dist/lib
  // separately (`pnpm build:lib`) — they must not be bundled or format-converted here, or the
  // CJS build would try to require() an ESM-only file.
  external: ['#hunspell-glue'],
});

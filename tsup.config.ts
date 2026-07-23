import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
  dts: true,
  clean: true,
  sourcemap: true,
  // The wasm glue (./lib/hunspell.mjs) is an ES module loaded via dynamic import() at runtime
  // (see loadModule.ts) and copied into dist/lib separately (`pnpm build:lib`) — it must not be
  // bundled or format-converted here, or the CJS build would try to require() an ESM-only file.
  external: ['./lib/hunspell.mjs'],
});

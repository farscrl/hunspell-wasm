import { defineConfig } from 'vite';

export default defineConfig({
  // noExternal forces Vite/Rollup to actually bundle hunspell-wasm (not just resolve it as an
  // external node_modules import) — the strict scenario that broke the legacy package.
  ssr: { noExternal: true },
  build: {
    ssr: 'main.mjs',
    outDir: 'dist',
    rollupOptions: { output: { format: 'es', entryFileNames: 'main.mjs' } },
  },
});

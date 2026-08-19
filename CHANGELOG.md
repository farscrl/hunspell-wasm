# @farscrl/hunspell-wasm

## 1.0.1

### Patch Changes

- 1355cd3: Fix browser bundlers (webpack, esbuild `platform: 'browser'`, e.g. Angular's builders) failing to resolve `node:module`/`node:fs`/etc. from the wasm glue. The package now ships a separate browser-only build (no Node-only code paths at all) resolved via the `"browser"` condition on an internal `#hunspell-glue` import, alongside the existing isomorphic build used everywhere else. Fixes #17.

## 1.0.0

### Major Changes

- 9233aa6: First stable release.

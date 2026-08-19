---
'@farscrl/hunspell-wasm': patch
---

Fix browser bundlers (webpack, esbuild `platform: 'browser'`, e.g. Angular's builders) failing to resolve `node:module`/`node:fs`/etc. from the wasm glue. The package now ships a separate browser-only build (no Node-only code paths at all) resolved via the `"browser"` condition on an internal `#hunspell-glue` import, alongside the existing isomorphic build used everywhere else. Fixes #17.

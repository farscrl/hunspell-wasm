// Regression guard for #17: a strict *browser-targeting* bundler (platform: 'browser', the same
// mode Angular's esbuild- and webpack-based builders use) must resolve cleanly. Unlike the Vite
// fixture next door — which builds for the 'ssr'/node target and so never exercises the
// "browser" export condition — this reproduces the reported failure directly: the isomorphic
// web+node wasm glue's guarded `import("node:module")` used to get statically resolved (and
// hard-error, "Could not resolve node:module") even though it never executes in a browser.
//
// The signal is simply that the bundle step doesn't throw — that *is* the original bug (esbuild
// hard-erroring on an unresolvable node: specifier). We only need the bundle to succeed; running
// the output requires a real browser/DOM, out of scope for this smoke test. (Don't grep the
// output for the substring "node:" as a belt-and-suspenders check — Emscripten's MEMFS
// implementation legitimately contains object keys like `{ node: { getattr: ... } } }`, which is
// a false positive, not a Node builtin reference.)
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['main.mjs'],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  write: false,
});

console.log('browser-esbuild bundler smoke test OK');

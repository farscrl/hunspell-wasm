// Not run — only ever bundled (see check.mjs). Just needs to pull loadModule into the bundle
// graph so esbuild actually has to resolve everything loadModule() touches.
import { loadModule } from '@farscrl/hunspell-wasm';

await loadModule();

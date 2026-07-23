import type { HunspellWasmModule } from './lib/hunspell.mjs';
import type { HunspellFactory, HunspellInstance } from './types';
import { wrapHunspellInterface } from './wrapHunspellInterface';

const POINTER_SIZE = 4; // wasm32: every pointer/array-of-pointers slot is 4 bytes.

/** Allocates UTF-8 copies of `values` for the duration of `fn`, then frees them. */
const withUTF8 = <T>(
  wasm: Pick<HunspellWasmModule, 'stringToNewUTF8' | '_free'>,
  values: string[],
  fn: (...ptrs: number[]) => T,
): T => {
  // https://mathiasbynens.be/notes/javascript-unicode - normalize before crossing into wasm.
  const ptrs = values.map((value) => wasm.stringToNewUTF8(value.normalize()));
  try {
    return fn(...ptrs);
  } finally {
    ptrs.forEach((ptr) => wasm._free(ptr));
  }
};

/** Reads a hunspell-owned `char**` result array of `count` UTF-8 strings. */
const readStringList = (wasm: HunspellWasmModule, listPtr: number, count: number): string[] => {
  if (count <= 0) {
    return [];
  }
  const arrayPtr = wasm.getValue(listPtr, '*');
  return Array.from({ length: count }, (_, i) => wasm.UTF8ToString(wasm.getValue(arrayPtr + i * POINTER_SIZE, '*')));
};

/** Builds a {@link HunspellFactory} bound to a loaded wasm module. */
export const createHunspellFactory = (wasm: HunspellWasmModule): HunspellFactory => {
  const native = wrapHunspellInterface(wasm.cwrap);
  const mountRoot = `/${crypto.randomUUID()}`;
  wasm.FS.mkdir(mountRoot);

  return {
    mountBuffer: (buffer, fileName) => {
      // Each mount gets its own subdirectory so mounting the same fileName more than once
      // (e.g. two separate hunspell instances) never collides.
      const dir = `${mountRoot}/${crypto.randomUUID()}`;
      wasm.FS.mkdir(dir);
      const path = `${dir}/${fileName}`;
      wasm.FS.writeFile(path, buffer);
      return path;
    },
    unmount: (mountedPath) => {
      wasm.FS.unlink(mountedPath);
      wasm.FS.rmdir(mountedPath.slice(0, mountedPath.lastIndexOf('/')));
    },
    create: (affPath, dictPath) => {
      const hunspellPtr = withUTF8(wasm, [affPath, dictPath], native.create);

      const suggestionsFrom = (word: string, fn: HunspellNativeSuggestFn): string[] => {
        const listPtr = wasm._malloc(POINTER_SIZE);
        try {
          const count = withUTF8(wasm, [word], (wordPtr) => fn(hunspellPtr, listPtr, wordPtr));
          const results = readStringList(wasm, listPtr, count);
          native.freeList(hunspellPtr, listPtr, count);
          return results;
        } finally {
          wasm._free(listPtr);
        }
      };

      const instance: HunspellInstance = {
        spell: (word) => withUTF8(wasm, [word], (wordPtr) => native.spell(hunspellPtr, wordPtr)) !== 0,
        suggest: (word) => suggestionsFrom(word, native.suggest),
        stem: (word) => suggestionsFrom(word, native.stem),
        addWord: (word) => {
          withUTF8(wasm, [word], (wordPtr) => native.add(hunspellPtr, wordPtr));
        },
        addWordWithAffix: (word, example) => {
          withUTF8(wasm, [word, example], (wordPtr, examplePtr) => native.addWithAffix(hunspellPtr, wordPtr, examplePtr));
        },
        removeWord: (word) => {
          withUTF8(wasm, [word], (wordPtr) => native.remove(hunspellPtr, wordPtr));
        },
        addDictionary: (dictPath) =>
          withUTF8(wasm, [dictPath], (dictPathPtr) => native.addDic(hunspellPtr, dictPathPtr)) === 0,
        dispose: () => native.destroy(hunspellPtr),
      };

      return instance;
    },
  };
};

type HunspellNativeSuggestFn = (hunspellPtr: number, outListPtr: number, wordPtr: number) => number;

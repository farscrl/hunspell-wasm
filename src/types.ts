/** A live hunspell instance bound to a specific .aff/.dic pair. */
export interface HunspellInstance {
  /** Checks whether `word` is spelled correctly. */
  spell(word: string): boolean;
  /** Returns spelling suggestions for `word`, best-first. */
  suggest(word: string): string[];
  /** Returns morphological stems for `word`. */
  stem(word: string): string[];
  /** Adds a word to the in-memory dictionary. */
  addWord(word: string): void;
  /** Adds a word with the affix flags taken from `example`. */
  addWordWithAffix(word: string, example: string): void;
  /** Removes a word from the in-memory dictionary. */
  removeWord(word: string): void;
  /** Merges an additional .dic file (already mounted) into this instance. Returns false on failure. */
  addDictionary(dictPath: string): boolean;
  /** Frees the underlying wasm-side hunspell instance. The instance is unusable afterwards. */
  dispose(): void;
}

/** Factory bound to a loaded wasm module: mounts dictionary files and creates hunspell instances. */
export interface HunspellFactory {
  /** Writes `buffer` into the wasm virtual filesystem and returns the path it was mounted at. */
  mountBuffer(buffer: Uint8Array, fileName: string): string;
  /** Removes a previously mounted file. */
  unmount(mountedPath: string): void;
  /** Creates a hunspell instance from a mounted .aff and .dic path. */
  create(affPath: string, dictPath: string): HunspellInstance;
}

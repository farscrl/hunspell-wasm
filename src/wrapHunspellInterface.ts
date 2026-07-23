import type { HunspellWasmModule } from './lib/hunspell.mjs';

export interface HunspellNativeApi {
  create(affPathPtr: number, dictPathPtr: number): number;
  destroy(hunspellPtr: number): void;
  spell(hunspellPtr: number, wordPtr: number): number;
  suggest(hunspellPtr: number, outListPtr: number, wordPtr: number): number;
  stem(hunspellPtr: number, outListPtr: number, wordPtr: number): number;
  freeList(hunspellPtr: number, listPtr: number, count: number): void;
  addDic(hunspellPtr: number, dictPathPtr: number): number;
  add(hunspellPtr: number, wordPtr: number): number;
  remove(hunspellPtr: number, wordPtr: number): number;
  addWithAffix(hunspellPtr: number, wordPtr: number, examplePtr: number): number;
}

/** Binds hunspell's C API (see native/vendor/hunspell/src/hunspell/hunspell.h) via cwrap. */
export const wrapHunspellInterface = (cwrap: HunspellWasmModule['cwrap']): HunspellNativeApi => ({
  create: cwrap('Hunspell_create', 'number', ['number', 'number']),
  destroy: cwrap('Hunspell_destroy', null, ['number']),
  spell: cwrap('Hunspell_spell', 'number', ['number', 'number']),
  suggest: cwrap('Hunspell_suggest', 'number', ['number', 'number', 'number']),
  stem: cwrap('Hunspell_stem', 'number', ['number', 'number', 'number']),
  freeList: cwrap('Hunspell_free_list', null, ['number', 'number', 'number']),
  addDic: cwrap('Hunspell_add_dic', 'number', ['number', 'number']),
  add: cwrap('Hunspell_add', 'number', ['number', 'number']),
  remove: cwrap('Hunspell_remove', 'number', ['number', 'number']),
  addWithAffix: cwrap('Hunspell_add_with_affix', 'number', ['number', 'number', 'number']),
});

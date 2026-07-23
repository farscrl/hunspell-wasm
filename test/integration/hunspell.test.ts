import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { HUNSPELL_VERSION, loadModule } from '../../src/index';
import type { HunspellFactory, HunspellInstance } from '../../src/types';

const fixture = (name: string) => readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)));

describe('hunspell (real wasm)', () => {
  let factory: HunspellFactory;

  beforeAll(async () => {
    factory = await loadModule();
  });

  const withInstance = (fn: (hunspell: HunspellInstance) => void) => {
    const affPath = factory.mountBuffer(new Uint8Array(fixture('test.aff')), 'test.aff');
    const dicPath = factory.mountBuffer(new Uint8Array(fixture('test.dic')), 'test.dic');
    const hunspell = factory.create(affPath, dicPath);
    try {
      fn(hunspell);
    } finally {
      hunspell.dispose();
      factory.unmount(affPath);
      factory.unmount(dicPath);
    }
  };

  it('exposes the compiled hunspell version', () => {
    expect(HUNSPELL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('spells known words correctly', () => {
    withInstance((hunspell) => {
      expect(hunspell.spell('hello')).toBe(true);
      expect(hunspell.spell('world')).toBe(true);
      expect(hunspell.spell('gibberish')).toBe(false);
    });
  });

  it('applies affix rules from the .aff file', () => {
    withInstance((hunspell) => {
      expect(hunspell.spell('hellos')).toBe(true); // SFX S: hello -> hellos
      expect(hunspell.spell('hellox')).toBe(false);
    });
  });

  it('suggests corrections for misspelled words', () => {
    withInstance((hunspell) => {
      expect(hunspell.suggest('helo')).toContain('hello');
    });
  });

  it('stems affixed words back to their root', () => {
    withInstance((hunspell) => {
      expect(hunspell.stem('hellos')).toContain('hello');
    });
  });

  it('adds and removes words at runtime', () => {
    withInstance((hunspell) => {
      expect(hunspell.spell('neologism')).toBe(false);
      hunspell.addWord('neologism');
      expect(hunspell.spell('neologism')).toBe(true);

      expect(hunspell.spell('wasm')).toBe(true);
      hunspell.removeWord('wasm');
      expect(hunspell.spell('wasm')).toBe(false);
    });
  });

  it('handles non-ASCII input safely', () => {
    withInstance((hunspell) => {
      expect(() => hunspell.spell('héllo')).not.toThrow();
      expect(() => hunspell.suggest('wörld')).not.toThrow();
    });
  });

  it('supports multiple independent instances from one factory', () => {
    withInstance((first) => {
      withInstance((second) => {
        first.addWord('onlyfirst');
        expect(first.spell('onlyfirst')).toBe(true);
        expect(second.spell('onlyfirst')).toBe(false);
      });
    });
  });
});

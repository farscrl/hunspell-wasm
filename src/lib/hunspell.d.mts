/**
 * Hand-written type declaration for the generated `hunspell.mjs` glue (native/build.sh).
 * The .mjs itself is a build artifact (gitignored, produced by `pnpm build:wasm`); this file
 * is checked in so the rest of the TS source type-checks without requiring a native build.
 */

export interface HunspellWasmModule {
  cwrap<T extends (...args: any[]) => any>(
    name: string,
    returnType: 'number' | 'string' | null,
    argTypes: Array<'number' | 'string'>,
  ): T;
  getValue(ptr: number, type: '*' | 'i8' | 'i32' | 'i64' | 'float' | 'double'): number;
  UTF8ToString(ptr: number): string;
  stringToNewUTF8(value: string): number;
  _malloc(size: number): number;
  _free(ptr: number): void;
  FS: {
    mkdir(path: string): void;
    writeFile(path: string, data: Uint8Array): void;
    unlink(path: string): void;
    rmdir(path: string): void;
  };
}

declare function createHunspellModule(moduleArg?: Record<string, unknown>): Promise<HunspellWasmModule>;

export default createHunspellModule;

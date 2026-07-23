#!/usr/bin/env bash
# Links the compiled hunspell static lib into a single-file ES module via em++.
# Expected to run inside the Docker build, after `emconfigure`/`emmake` have produced
# native/vendor/hunspell/src/hunspell/.libs/libhunspell-*.a
set -euo pipefail

out="${1:?usage: build.sh <output.mjs>}"
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
lib="$(ls "$here"/vendor/hunspell/src/hunspell/.libs/libhunspell-*.a)"

# C symbols exported from hunspell's C API (src/hunspell/hunspell.h), the surface the
# JS wrapper binds against via cwrap.
HUNSPELL_EXPORT_FUNCTIONS="[\
'_Hunspell_create',\
'_Hunspell_destroy',\
'_Hunspell_spell',\
'_Hunspell_stem',\
'_Hunspell_suggest',\
'_Hunspell_free_list',\
'_Hunspell_add_dic',\
'_Hunspell_add',\
'_Hunspell_remove',\
'_Hunspell_add_with_affix',\
'_malloc',\
'_free']"

# Emscripten runtime helpers the wrapper needs for string/pointer marshalling.
EXPORT_RUNTIME="[\
'cwrap',\
'stringToNewUTF8',\
'getValue',\
'UTF8ToString']"

em++ \
  -O2 \
  -s WASM=1 \
  -s SINGLE_FILE=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME=createHunspellModule \
  -s ENVIRONMENT=web,node \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s NO_EXIT_RUNTIME=1 \
  -s NODEJS_CATCH_REJECTION=0 \
  -s "EXPORTED_FUNCTIONS=$HUNSPELL_EXPORT_FUNCTIONS" \
  -s "EXPORTED_RUNTIME_METHODS=$EXPORT_RUNTIME" \
  --pre-js "$here/preprocessor.js" \
  "$lib" \
  -o "$out"

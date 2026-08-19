# syntax=docker/dockerfile:1
FROM emscripten/emsdk:6.0.6 AS build

# autotools + gettext: hunspell's build still ships configure.ac/Makefile.am, not CMake.
RUN apt-get update && apt-get install -y --no-install-recommends \
    autoconf automake libtool gettext autopoint \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /work/native
COPY native/vendor/hunspell ./vendor/hunspell
COPY native/build.sh native/preprocessor.js ./

RUN cd vendor/hunspell \
    && autoreconf -vfi \
    && emconfigure ./configure --disable-nls --disable-shared --enable-static \
    && emmake make -j"$(nproc)" -C src/hunspell

# Two glue files: the isomorphic web+node build (default/node-facing export) and a browser-only
# build with no Node-only branches at all (browser-facing export) — see #17.
RUN mkdir -p /out \
    && ./build.sh /out/hunspell.mjs web,node \
    && ./build.sh /out/hunspell.web.mjs web

FROM scratch AS export
COPY --from=build /out /

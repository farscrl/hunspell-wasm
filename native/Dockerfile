# syntax=docker/dockerfile:1
FROM emscripten/emsdk:6.0.3 AS build

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

RUN mkdir -p /out && ./build.sh /out/hunspell.mjs

FROM scratch AS export
COPY --from=build /out /

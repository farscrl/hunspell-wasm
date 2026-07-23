// Injected into the compiled glue via --pre-js. `Module` is predefined in this context.
// Exposes the FS methods the JS wrapper needs to mount .aff/.dic buffers.
Module['preRun'] = function () {
  Module.FS = {
    mkdir: FS.mkdir,
    writeFile: FS.writeFile,
    unlink: FS.unlink,
    rmdir: FS.rmdir,
  };
};

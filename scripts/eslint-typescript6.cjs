const Module = require("module");
const path = require("path");

const typescript6 = path.resolve(__dirname, "../node_modules/@typescript/typescript6");
const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (
    request === "typescript" &&
    parent?.filename?.includes(`${path.sep}node_modules${path.sep}`)
  ) {
    return resolveFilename.call(this, typescript6, parent, isMain, options);
  }
  return resolveFilename.call(this, request, parent, isMain, options);
};

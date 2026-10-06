"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  Person: {
    photo: async ({
      photo
    }, args, {
      dataSources: {
        BinaryFiles
      }
    }) => ({
      uri: await BinaryFiles.findOrReturnImageUrl(photo) // protect against passing null photo

    })
  }
};
exports.default = _default;
//# sourceMappingURL=resolver.js.map
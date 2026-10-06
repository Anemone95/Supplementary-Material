"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "schema", {
  enumerable: true,
  get: function () {
    return _dataSchema.sharableSchema;
  }
});
exports.resolver = void 0;

var _dataSchema = require("@apollosproject/data-schema");

const resolver = {
  Sharable: {
    // Implementors must attach __typename to root.
    __resolveType: ({
      __typename
    }) => __typename
  }
};
exports.resolver = resolver;
//# sourceMappingURL=index.js.map
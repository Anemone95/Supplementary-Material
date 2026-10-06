"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "schema", {
  enumerable: true,
  get: function () {
    return _dataSchema.featuresSchema;
  }
});
Object.defineProperty(exports, "dataSource", {
  enumerable: true,
  get: function () {
    return _dataSource2.default;
  }
});
Object.defineProperty(exports, "resolver", {
  enumerable: true,
  get: function () {
    return _resolver2.default;
  }
});

var _dataSchema = require("@apollosproject/data-schema");

var _dataSource2 = _interopRequireDefault(require("./data-source"));

var _resolver2 = _interopRequireDefault(require("./resolver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=index.js.map
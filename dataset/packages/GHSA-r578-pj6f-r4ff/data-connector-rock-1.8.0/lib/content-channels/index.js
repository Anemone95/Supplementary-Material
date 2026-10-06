"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "dataSource", {
  enumerable: true,
  get: function () {
    return _dataSource.default;
  }
});
Object.defineProperty(exports, "schema", {
  enumerable: true,
  get: function () {
    return _dataSchema.contentChannelSchema;
  }
});
Object.defineProperty(exports, "resolver", {
  enumerable: true,
  get: function () {
    return _resolver.default;
  }
});

var _dataSource = _interopRequireDefault(require("./data-source"));

var _dataSchema = require("@apollosproject/data-schema");

var _resolver = _interopRequireDefault(require("./resolver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=index.js.map
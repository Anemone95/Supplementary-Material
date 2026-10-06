"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "registerToken", {
  enumerable: true,
  get: function () {
    return _token.registerToken;
  }
});
Object.defineProperty(exports, "generateToken", {
  enumerable: true,
  get: function () {
    return _token.generateToken;
  }
});
Object.defineProperty(exports, "schema", {
  enumerable: true,
  get: function () {
    return _dataSchema.authSchema;
  }
});
Object.defineProperty(exports, "dataSource", {
  enumerable: true,
  get: function () {
    return _dataSource.default;
  }
});
Object.defineProperty(exports, "resolver", {
  enumerable: true,
  get: function () {
    return _resolver.default;
  }
});
exports.contextMiddleware = void 0;

var _lodash = require("lodash");

var _token = require("./token");

var _dataSchema = require("@apollosproject/data-schema");

var _dataSource = _interopRequireDefault(require("./data-source"));

var _resolver = _interopRequireDefault(require("./resolver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const contextMiddleware = ({
  req,
  context: ctx
}) => {
  if ((0, _lodash.get)(req, 'headers.authorization')) {
    const {
      userToken,
      rockCookie,
      sessionId
    } = (0, _token.registerToken)(req.headers.authorization);

    if (sessionId) {
      return { ...ctx,
        userToken,
        rockCookie,
        sessionId
      };
    }
  }

  return ctx;
};

exports.contextMiddleware = contextMiddleware;
//# sourceMappingURL=index.js.map
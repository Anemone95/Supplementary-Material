"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateToken = exports.registerToken = exports.parseToken = exports.secret = void 0;

var _apolloServer = require("apollo-server");

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const secret = process.env.SECRET || 'ASea$2gadj#asd0';
exports.secret = secret;

const parseToken = token => _jsonwebtoken.default.verify(token, secret);

exports.parseToken = parseToken;

const registerToken = token => {
  try {
    const {
      cookie,
      sessionId
    } = parseToken(token);
    return {
      userToken: token,
      rockCookie: cookie,
      sessionId
    };
  } catch (e) {
    if (e instanceof _jsonwebtoken.default.TokenExpiredError) {
      return {};
    }

    throw new _apolloServer.AuthenticationError('Invalid token');
  }
};

exports.registerToken = registerToken;

const generateToken = params => _jsonwebtoken.default.sign({ ...params
}, secret, {
  expiresIn: '400d'
});

exports.generateToken = generateToken;
//# sourceMappingURL=token.js.map
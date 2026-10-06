"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDPoPTokenBody = exports.isDPoPTokenHeader = exports.isDPoPToken = void 0;
const ts_guards_1 = require("ts-guards");
const types_1 = require("../types");
const DPoPJWKGuard_1 = require("./DPoPJWKGuard");
/**
 * Check valid DPoP JWT
 */
/* eslint-disable no-use-before-define */
function isDPoPToken(x) {
    ts_guards_1.asserts.areObjectPropertiesOf(x, ["header", "payload", "signature"]);
    isDPoPTokenHeader(x.header);
    isDPoPTokenBody(x.payload);
    ts_guards_1.asserts.isString(x.signature);
}
exports.isDPoPToken = isDPoPToken;
function isDPoPTokenHeader(x) {
    ts_guards_1.asserts.areObjectPropertiesOf(x, ["alg", "jwk", "typ"]);
    ts_guards_1.asserts.isLiteralType(x.alg, types_1.asymetricCryptographicAlgorithm);
    DPoPJWKGuard_1.isDPoPPublicJWK(x.jwk);
    ts_guards_1.asserts.isLiteral(x.typ, "dpop+jwt");
}
exports.isDPoPTokenHeader = isDPoPTokenHeader;
function isDPoPTokenBody(x) {
    ts_guards_1.asserts.areObjectPropertiesOf(x, ["htm", "htu", "iat", "jti"]);
    ts_guards_1.asserts.isLiteralType(x.htm, types_1.requestMethod);
    ts_guards_1.asserts.isString(x.htu);
    ts_guards_1.asserts.isNumber(x.iat);
    ts_guards_1.asserts.isString(x.jti);
}
exports.isDPoPTokenBody = isDPoPTokenBody;
/* eslint-enable no-use-before-define */
//# sourceMappingURL=DPoPTokenGuard.js.map
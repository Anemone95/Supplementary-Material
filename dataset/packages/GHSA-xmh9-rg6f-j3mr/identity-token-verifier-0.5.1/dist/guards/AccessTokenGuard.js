"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDPoPBoundAccessTokenPayload = exports.isAccessTokenPayload = exports.isAccessTokenHeader = exports.isAccessToken = void 0;
const ts_guards_1 = require("ts-guards");
const standard_object_1 = require("ts-guards/dist/standard-object");
const types_1 = require("../types");
/**
 * Check valid Access Token
 */
/* eslint-disable no-use-before-define */
function isAccessToken(x) {
    ts_guards_1.asserts.areObjectPropertiesOf(x, ["header", "payload", "signature"]);
    isAccessTokenHeader(x.header);
    isAccessTokenPayload(x.payload);
    ts_guards_1.asserts.isString(x.signature);
}
exports.isAccessToken = isAccessToken;
function isAccessTokenHeader(x) {
    ts_guards_1.asserts.areObjectPropertiesOf(x, ["alg", "kid"]);
    ts_guards_1.asserts.isLiteralType(x.alg, types_1.asymetricCryptographicAlgorithm);
    ts_guards_1.asserts.isString(x.kid);
}
exports.isAccessTokenHeader = isAccessTokenHeader;
function isAccessTokenPayload(x) {
    ts_guards_1.asserts.areObjectPropertiesOf(x, ["aud", "exp", "iat", "iss", "webid"]);
    ts_guards_1.asserts.isLiteral(x.aud, "solid");
    ts_guards_1.asserts.isNumber(x.exp);
    ts_guards_1.asserts.isNumber(x.iat);
    ts_guards_1.asserts.isString(x.iss);
    ts_guards_1.asserts.isString(x.webid);
    if (standard_object_1.isObjectPropertyOf(x, "cnf")) {
        ts_guards_1.asserts.isObjectPropertyOf(x.cnf, "jkt");
        ts_guards_1.asserts.isString(x.cnf.jkt);
    }
}
exports.isAccessTokenPayload = isAccessTokenPayload;
function isDPoPBoundAccessTokenPayload(x) {
    ts_guards_1.asserts.isObjectPropertyOf(x, "cnf");
    ts_guards_1.asserts.isObjectPropertyOf(x.cnf, "jkt");
    ts_guards_1.asserts.isString(x.cnf.jkt);
}
exports.isDPoPBoundAccessTokenPayload = isDPoPBoundAccessTokenPayload;
/* eslint-enable no-use-before-define */
//# sourceMappingURL=AccessTokenGuard.js.map
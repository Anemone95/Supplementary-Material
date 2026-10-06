"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRSAPublicJWK = exports.isECPublicJWK = exports.isDPoPPublicJWK = void 0;
const ts_guards_1 = require("ts-guards");
const types_1 = require("../types");
/**
 * JWK Validation
 */
/* eslint-disable no-use-before-define */
/*
 * export function isDPoPJWK(x: unknown): asserts x is DPoPJWK {
 *   asserts.isObjectPropertyOf(x, "kty");
 *   if (x.kty === "EC") {
 *     isECJWK(x);
 *   } else if (x.kty === "RSA") {
 *     isRSAJWK(x);
 *   } else {
 *     asserts.error("EC or RSA", x.kty);
 *   }
 * }
 */
function isDPoPPublicJWK(x) {
    ts_guards_1.asserts.isObjectPropertyOf(x, "kty");
    if (x.kty === "EC") {
        isECPublicJWK(x);
    }
    else if (x.kty === "RSA") {
        isRSAPublicJWK(x);
    }
    else {
        ts_guards_1.asserts.error("EC or RSA", x.kty);
    }
}
exports.isDPoPPublicJWK = isDPoPPublicJWK;
/*
 * export function isECJWK(x: unknown): asserts x is ECJWK {
 *   isECPublicJWK(x);
 *   asserts.isObjectPropertyOf(x, "d");
 *   asserts.isString(x.d);
 * }
 */
function isECPublicJWK(x) {
    ts_guards_1.asserts.areObjectPropertiesOf(x, ["kid", "kty", "crv", "x", "y"]);
    ts_guards_1.asserts.isString(x.kid);
    ts_guards_1.asserts.isLiteral(x.kty, "EC");
    ts_guards_1.asserts.isLiteralType(x.crv, types_1.curve);
    ts_guards_1.asserts.isString(x.x);
    ts_guards_1.asserts.isString(x.y);
}
exports.isECPublicJWK = isECPublicJWK;
/*
 * export function isRSAJWK(x: unknown): asserts x is RSAJWK {
 *   isRSAPublicJWK(x);
 *   asserts.areObjectPropertiesOf(x, ["d", "p", "q", "dp", "dq", "qi"]);
 *   asserts.isString(x.d);
 *   asserts.isString(x.p);
 *   asserts.isString(x.q);
 *   asserts.isString(x.dp);
 *   asserts.isString(x.dq);
 *   asserts.isString(x.qi);
 * }
 */
function isRSAPublicJWK(x) {
    ts_guards_1.asserts.areObjectPropertiesOf(x, ["alg", "kid", "kty", "n", "e"]);
    ts_guards_1.asserts.isLiteralType(x.alg, types_1.rsaAlgorithm);
    ts_guards_1.asserts.isString(x.kid);
    ts_guards_1.asserts.isLiteral(x.kty, "RSA");
    ts_guards_1.asserts.isString(x.n);
    ts_guards_1.asserts.isString(x.e);
}
exports.isRSAPublicJWK = isRSAPublicJWK;
/* eslint-enable no-use-before-define */
//# sourceMappingURL=DPoPJWKGuard.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const embedded_1 = __importDefault(require("jose/jwk/embedded"));
const verify_1 = __importDefault(require("jose/jwt/verify"));
const ts_guards_1 = require("ts-guards");
const guards_1 = require("../guards");
const types_1 = require("../types");
const Defaults_1 = require("./Defaults");
function isValidProof(accessToken, dpop, method, url, isDuplicateJTI) {
    ts_guards_1.asserts.isObjectPropertyOf(accessToken.payload, "cnf");
    guards_1.isDPoPBoundAccessTokenPayload(accessToken.payload);
    // Check DPoP is bound to the access token
    ts_guards_1.asserts.isLiteral(dpop.header.jwk.kid, accessToken.payload.cnf.jkt);
    // Check DPoP Token claims method, url and unique token id
    ts_guards_1.asserts.isLiteral(dpop.payload.htm, method);
    ts_guards_1.asserts.isLiteral(dpop.payload.htu, url);
    ts_guards_1.asserts.isLiteral(isDuplicateJTI(dpop.payload.jti), false);
}
/**
 * Verify DPoP
 * - Signature of DPoP JWT/JWS matches the key embedded in its header
 * - DPoP max age 60 seconds
 * - Claims:
 *    - algorithm 'alg' is an asymetric cryptographic algorithm
 *    - 'iat' is not too far in the future (clockTolerance) or in the past (maxTokenAge)
 *    - 'typ' is 'dpop+jwt'
 * Note:
 * - The maxTokenAge option makes the iat claim mandatory
 * - DPoP tokens can rely on iat+maxTokenAge to be invalidated since they are specific to a request
 *   (so the exp claim which is not required in DPoP tokens' bodys is also redundant)
 */
async function verify(dpopHeader, accessToken, method, url, isDuplicateJTI) {
    const { payload, protectedHeader } = await verify_1.default(dpopHeader, embedded_1.default, {
        typ: "dpop+jwt",
        algorithms: Array.from(types_1.asymetricCryptographicAlgorithm),
        maxTokenAge: `${Defaults_1.maxAgeInMilliseconds / 1000}s`,
        clockTolerance: `${Defaults_1.clockToleranceInSeconds}s`,
    });
    const dpop = {
        header: protectedHeader,
        payload,
        signature: dpopHeader.split(".")[2],
    };
    guards_1.isDPoPToken(dpop);
    isValidProof(accessToken, dpop, method, url, isDuplicateJTI);
    return dpop;
}
exports.verify = verify;
//# sourceMappingURL=DPoP.js.map
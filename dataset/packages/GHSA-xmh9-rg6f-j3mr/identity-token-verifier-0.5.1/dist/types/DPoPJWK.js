"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateKeyProperties = exports.curve = exports.keyType = exports.symmetricKeyType = exports.asymmetricKeyType = exports.asymetricCryptographicAlgorithm = exports.rsaAlgorithm = void 0;
/**
 * Digital Signature Asymetric Cryptographic Algorithm
 * Note:
 * - ES256 & RS256 are both recommended implementations in JWA libraries
 * - ES256 is likely to become required
 * - Web Cryptography API support (no RSA1_5)
 * See also:
 * - JSON Web Algorithms RFC7518 https://tools.ietf.org/html/rfc7518#section-3
 * - DPoP draft https://tools.ietf.org/html/draft-fett-oauth-dpop-04#section-4.1
 */
exports.rsaAlgorithm = new Set(["RS256", "RS384", "RS512"]);
exports.asymetricCryptographicAlgorithm = new Set([
    "ES256",
    "ES384",
    "ES512",
    "PS256",
    "PS384",
    "PS512",
    ...exports.rsaAlgorithm,
]);
/**
 * JWK Key Type
 * Note:
 * - Web Cryptography API support (no OKP)
 * See also:
 * - JSON Web Algorithm Key Types https://tools.ietf.org/html/rfc7518#section-6.1
 */
exports.asymmetricKeyType = new Set(["EC", "RSA"]);
exports.symmetricKeyType = new Set(["oct"]);
exports.keyType = new Set([
    ...exports.asymmetricKeyType,
    ...exports.symmetricKeyType,
]);
/**
 * JWK EC Curve
 * Note:
 * - Web Cryptography API support (no secp256k1)
 */
exports.curve = new Set(["P-256", "P-384", "P-521"]);
exports.privateKeyProperties = new Set([
    "d",
    "p",
    "q",
    "dp",
    "dq",
    "qi",
]);
//# sourceMappingURL=DPoPJWK.js.map
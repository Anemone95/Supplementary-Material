"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const verify_1 = __importDefault(require("jose/jwt/verify"));
const guards_1 = require("../guards");
const types_1 = require("../types");
const Defaults_1 = require("./Defaults");
const JWT_1 = require("./JWT");
const SolidTokenVerifierError_1 = require("./SolidTokenVerifierError");
/**
 * Remove the Bearer and DPoP prefixes from the authorization header
 * @param token
 */
function value(token) {
    return token.replace(/^(DPoP|Bearer) /, "");
}
/**
 * URL Claims
 * Restricts to HTTPS, TODO: Check if we can restrict to HTTP over TLS if/when in the future
 */
function urlClaim(type, claim) {
    const url = new URL(claim);
    if (url.protocol !== "https:") {
        throw new TypeError(`Verifiable URL claim ${type} needs to use the https protocol.`);
    }
    return url;
}
/**
 * Checks the access token structure and its WebID and Issuer claims
 */
function verifiableClaims(token) {
    const tokenPayload = JSON.parse(JWT_1.decode(token.split(".")[1]));
    guards_1.isAccessTokenPayload(tokenPayload);
    return {
        iss: urlClaim("issuer", tokenPayload.iss),
        webid: urlClaim("web_id", tokenPayload.webid),
    };
}
/**
 * Verify Access Token
 * - Retrieves identity issuers jwk sets using the webID claim
 * - Signature of Access Token JWT/JWS matches a key in the remote jwks
 * - Access Token max age 1 day
 * - Claims:
 *    - audience 'aud' is solid
 *    - algorithm 'alg' is an asymetric cryptographic algorithm
 *    - expiration 'exp' is not in the past
 *    - 'iat' is not in the future
 */
async function verify(authorizationHeader, issuers, keySet, maxAccessTokenAge = Defaults_1.maxAccessTokenAgeInSeconds) {
    // Get JWT value for either DPoP or Bearer tokens
    const token = value(authorizationHeader);
    // Extract webid and issuer claims as URLs from valid Access token payload
    const { iss, webid } = verifiableClaims(token);
    // Check issuer claim against WebID issuers
    if (!(await issuers(webid)).includes(iss.toString())) {
        throw new SolidTokenVerifierError_1.SolidTokenVerifierError("SolidIdentityInvalidIssuerClaim", `Incorrect issuer ${iss.toString()} for WebID ${webid.toString()}`);
    }
    // Check token against issuer's key set
    const { payload, protectedHeader } = await verify_1.default(token, await keySet(iss), {
        audience: "solid",
        algorithms: Array.from(types_1.asymetricCryptographicAlgorithm),
        maxTokenAge: `${maxAccessTokenAge}s`,
        clockTolerance: `${Defaults_1.clockToleranceInSeconds}s`,
    });
    const accessToken = {
        header: protectedHeader,
        payload,
        signature: token.split(".")[2],
    };
    guards_1.isAccessToken(accessToken);
    return accessToken;
}
exports.verify = verify;
//# sourceMappingURL=AccessToken.js.map
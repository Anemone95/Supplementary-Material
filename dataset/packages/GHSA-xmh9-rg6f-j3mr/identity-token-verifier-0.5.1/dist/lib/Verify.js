"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const ts_guards_1 = require("ts-guards");
const primitive_type_1 = require("ts-guards/dist/primitive-type");
const standard_object_1 = require("ts-guards/dist/standard-object");
const AccessToken_1 = require("./AccessToken");
const DPoP_1 = require("./DPoP");
const Issuer_1 = require("./Issuer");
const JTI_1 = require("./JTI");
const SolidTokenVerifierError_1 = require("./SolidTokenVerifierError");
const WebID_1 = require("./WebID");
/**
 * Verify the validity of Solid Identity Access Tokens
 * Validation based on the WebID in the access token payload
 * @param authorizationHeader
 * @param issuers
 * @param keySet
 * @param dpop
 */
async function verify(authorization, dpop) {
    let getIssuersFunction;
    if (primitive_type_1.isNotNullOrUndefined(authorization.issuers)) {
        getIssuersFunction = authorization.issuers;
    }
    else {
        getIssuersFunction = WebID_1.issuers;
    }
    let getKeySetFunction;
    if (primitive_type_1.isNotNullOrUndefined(authorization.keySet)) {
        getKeySetFunction = authorization.keySet;
    }
    else {
        getKeySetFunction = Issuer_1.keySet;
    }
    const accessToken = await AccessToken_1.verify(authorization.header, getIssuersFunction, getKeySetFunction);
    if (authorization.header.startsWith("DPoP ") ||
        standard_object_1.isObjectPropertyOf(accessToken.payload, "cnf")) {
        try {
            ts_guards_1.asserts.isNotNullOrUndefined(dpop);
        }
        catch (_) {
            throw new SolidTokenVerifierError_1.SolidTokenVerifierError("SolidIdentityDPoPError", "DPoP options missing for DPoP bound access token verification");
        }
        let isDuplicateJTIFunction;
        if (!primitive_type_1.isNotNullOrUndefined(dpop.isDuplicateJTI)) {
            isDuplicateJTIFunction = JTI_1.isDuplicate;
        }
        else {
            isDuplicateJTIFunction = dpop.isDuplicateJTI;
        }
        await DPoP_1.verify(dpop.header, accessToken, dpop.method, dpop.url, isDuplicateJTIFunction);
    }
    return accessToken.payload;
}
exports.verify = verify;
//# sourceMappingURL=Verify.js.map
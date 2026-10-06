"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keySet = void 0;
const cross_fetch_1 = require("cross-fetch");
const remote_1 = __importDefault(require("jose/jwks/remote"));
const primitive_type_1 = require("ts-guards/dist/primitive-type");
const standard_object_1 = require("ts-guards/dist/standard-object");
const SolidTokenVerifierError_1 = require("./SolidTokenVerifierError");
/* eslint-disable @typescript-eslint/naming-convention */
const requestInit = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
};
/* eslint-enable @typescript-eslint/naming-convention */
function configUrl(iss) {
    return iss.replace(/\/$/, "").concat("/.well-known/openid-configuration");
}
async function config(iss) {
    const response = await cross_fetch_1.fetch(configUrl(iss.toString()), requestInit);
    if (response.ok) {
        return (await response.json());
    }
    throw new SolidTokenVerifierError_1.SolidTokenVerifierError("SolidIdentityHTTPError", `Failed fetching identity issuer configuration at URL ${iss.toString()}, got HTTP status code ${response.status}`);
}
async function jwksUri(iss) {
    const issuerConfig = await config(iss);
    if (standard_object_1.isObjectPropertyOf(issuerConfig, "jwks_uri") &&
        primitive_type_1.isString(issuerConfig.jwks_uri)) {
        try {
            return new URL(issuerConfig.jwks_uri);
        }
        catch (_) {
            throw new SolidTokenVerifierError_1.SolidTokenVerifierError("SolidIdentityIssuerConfigError", `Failed parsing jwks_uri from identity issuer configuration at URL ${iss.toString()} as a URL`);
        }
    }
    throw new SolidTokenVerifierError_1.SolidTokenVerifierError("SolidIdentityIssuerConfigError", `Failed extracting jwks_uri from identity issuer configuration at URL ${iss.toString()}`);
}
const keySet = async function (iss) {
    return remote_1.default(await jwksUri(iss));
};
exports.keySet = keySet;
//# sourceMappingURL=Issuer.js.map
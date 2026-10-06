import type { SolidTokenVerifierErrorCode } from "../types";
/**
 * Generic Error class for everything DPoP
 */
export declare class SolidTokenVerifierError extends Error {
    code: "SolidIdentityInvalidAcccessToken" | "SolidIdentityInvalidDPoPToken" | "SolidIdentityDPoPError" | "SolidIdentityInvalidIssuerClaim" | "SolidIdentityHTTPError" | "SolidIdentityIssuerConfigError";
    statusCode: number;
    /**
     * Creates a new HTTP error. Subclasses should call this with their fixed status code.
     * @param name - Error name. Useful for logging and stack tracing.
     * @param message - Message to be thrown.
     */
    constructor(code: SolidTokenVerifierErrorCode, message?: string);
}

/**
 * Solid Identity Errors
 */
export declare const solidTokenVerifierErrorCode: Set<"SolidIdentityInvalidAcccessToken" | "SolidIdentityInvalidDPoPToken" | "SolidIdentityDPoPError" | "SolidIdentityInvalidIssuerClaim" | "SolidIdentityHTTPError" | "SolidIdentityIssuerConfigError">;
export declare type SolidTokenVerifierErrorCode = typeof solidTokenVerifierErrorCode extends Set<infer T> ? T : never;

import type { DPoPPublicJWK, ECPublicJWK, RSAPublicJWK } from "../types";
/**
 * JWK Validation
 */
export declare function isDPoPPublicJWK(x: unknown): asserts x is DPoPPublicJWK;
export declare function isECPublicJWK(x: unknown): asserts x is ECPublicJWK;
export declare function isRSAPublicJWK(x: unknown): asserts x is RSAPublicJWK;

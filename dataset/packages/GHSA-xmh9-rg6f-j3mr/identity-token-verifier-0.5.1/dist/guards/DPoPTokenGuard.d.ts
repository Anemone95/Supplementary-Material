import type { DPoPToken, DPoPTokenHeader, DPoPTokenPayload } from "../types";
/**
 * Check valid DPoP JWT
 */
export declare function isDPoPToken(x: unknown): asserts x is DPoPToken;
export declare function isDPoPTokenHeader(x: unknown): asserts x is DPoPTokenHeader;
export declare function isDPoPTokenBody(x: unknown): asserts x is DPoPTokenPayload;

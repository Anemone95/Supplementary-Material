import type { AccessToken, AccessTokenHeader, AccessTokenPayload, DPoPBoundAccessTokenPayload } from "../types";
/**
 * Check valid Access Token
 */
export declare function isAccessToken(x: unknown): asserts x is AccessToken;
export declare function isAccessTokenHeader(x: unknown): asserts x is AccessTokenHeader;
export declare function isAccessTokenPayload(x: unknown): asserts x is AccessTokenPayload;
export declare function isDPoPBoundAccessTokenPayload(x: AccessTokenPayload): asserts x is DPoPBoundAccessTokenPayload;

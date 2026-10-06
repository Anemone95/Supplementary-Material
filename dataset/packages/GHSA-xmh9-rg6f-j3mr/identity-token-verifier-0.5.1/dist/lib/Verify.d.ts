import type { AccessTokenPayload, AuthorizationOptions, DPoPOptions } from "../types";
/**
 * Verify the validity of Solid Identity Access Tokens
 * Validation based on the WebID in the access token payload
 * @param authorizationHeader
 * @param issuers
 * @param keySet
 * @param dpop
 */
export declare function verify(authorization: AuthorizationOptions, dpop?: DPoPOptions): Promise<AccessTokenPayload>;

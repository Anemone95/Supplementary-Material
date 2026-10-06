import type { AccessToken, GetIssuersFunction, GetKeySetFunction } from "../types";
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
export declare function verify(authorizationHeader: string, issuers: GetIssuersFunction, keySet: GetKeySetFunction, maxAccessTokenAge?: number): Promise<AccessToken>;

import type { JWK } from "jose/types";
/**
 * Digital Signature Asymetric Cryptographic Algorithm
 * Note:
 * - ES256 & RS256 are both recommended implementations in JWA libraries
 * - ES256 is likely to become required
 * - Web Cryptography API support (no RSA1_5)
 * See also:
 * - JSON Web Algorithms RFC7518 https://tools.ietf.org/html/rfc7518#section-3
 * - DPoP draft https://tools.ietf.org/html/draft-fett-oauth-dpop-04#section-4.1
 */
export declare const rsaAlgorithm: Set<"RS256" | "RS384" | "RS512">;
export declare type RSAAlgorithm = typeof rsaAlgorithm extends Set<infer T> ? T : never;
export declare const asymetricCryptographicAlgorithm: Set<"RS256" | "RS384" | "RS512" | "ES256" | "ES384" | "ES512" | "PS256" | "PS384" | "PS512">;
export declare type AsymetricCryptographicAlgorithm = typeof asymetricCryptographicAlgorithm extends Set<infer T> ? T : never;
/**
 * JWK Key Type
 * Note:
 * - Web Cryptography API support (no OKP)
 * See also:
 * - JSON Web Algorithm Key Types https://tools.ietf.org/html/rfc7518#section-6.1
 */
export declare const asymmetricKeyType: Set<"EC" | "RSA">;
export declare type AsymmetricKeyType = typeof asymmetricKeyType extends Set<infer T> ? T : never;
export declare const symmetricKeyType: Set<"oct">;
export declare type SymmetricKeyType = typeof symmetricKeyType extends Set<infer T> ? T : never;
export declare const keyType: Set<"EC" | "RSA" | "oct">;
export declare type JWKKeyType = AsymmetricKeyType | SymmetricKeyType;
/**
 * JWK EC Curve
 * Note:
 * - Web Cryptography API support (no secp256k1)
 */
export declare const curve: Set<"P-256" | "P-384" | "P-521">;
export declare type Curve = typeof curve extends Set<infer T> ? T : never;
export declare const privateKeyProperties: Set<"d" | "p" | "q" | "dp" | "dq" | "qi">;
export declare type PrivateKeyProperties = typeof privateKeyProperties extends Set<infer T> ? T : never;
/**
 * Elliptic Curve JSON Web Key
 * - Must have kid, kty, crv, x, y & d
 * - d is the private part of the key, it must be ommited from the public embedded DPoP JWK
 */
export declare type ECJWK = Required<Pick<JWK, "kid" | "kty" | "crv" | "x" | "y" | "d">> & {
    kid: string;
    kty: "EC";
    crv: Curve;
    x: string;
    y: string;
    d: string;
};
export declare type ECPublicJWK = Omit<ECJWK, PrivateKeyProperties>;
/**
 * RSA JSON Web Key
 * - Must have kid, kty, crv, x, y & d
 * - d is the private part of the key, it must be ommited from the public embedded DPoP JWK
 */
export declare type RSAJWK = Required<Pick<JWK, "kid" | "kty" | "alg" | "n" | "e" | "d" | "p" | "q" | "dp" | "dq" | "qi">> & {
    kid: string;
    kty: "RSA";
    alg: RSAAlgorithm;
    n: string;
    e: string;
    d: string;
    p: string;
    q: string;
    dp: string;
    dq: string;
    qi: string;
};
export declare type RSAPublicJWK = Omit<RSAJWK, PrivateKeyProperties>;
/**
 * DPoP JWK as defined in https://tools.ietf.org/html/draft-fett-oauth-dpop-04
 * - Must be an Elliptic Curve or RSA public key
 */
export declare type DPoPJWK = ECJWK | RSAJWK;
export declare type DPoPPublicJWK = ECPublicJWK | RSAPublicJWK;

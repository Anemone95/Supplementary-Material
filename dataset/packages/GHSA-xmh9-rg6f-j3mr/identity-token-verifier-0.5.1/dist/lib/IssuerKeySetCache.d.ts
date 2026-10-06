import type createRemoteJWKSet from "jose/jwks/remote";
import LRUCache from "lru-cache";
import type { GetKeySetFunction } from "../types";
export declare class IssuerKeySetCache extends LRUCache<string, ReturnType<typeof createRemoteJWKSet>> {
    constructor();
    getKeySet(iss: URL): ReturnType<GetKeySetFunction>;
}

import LRUCache from "lru-cache";
import type { JTICheckFunction } from "../types";
export declare class DPoPJTICache extends LRUCache<string, boolean> {
    constructor();
    isDuplicateJTI(jti: string): ReturnType<JTICheckFunction>;
}

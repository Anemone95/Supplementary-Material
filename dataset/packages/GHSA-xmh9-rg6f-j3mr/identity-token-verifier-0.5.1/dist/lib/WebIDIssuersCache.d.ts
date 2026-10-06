import LRUCache from "lru-cache";
import type { GetIssuersFunction } from "../types";
export declare class WebIDIssuersCache extends LRUCache<string, Array<string>> {
    constructor();
    getIssuers(webid: URL): ReturnType<GetIssuersFunction>;
}

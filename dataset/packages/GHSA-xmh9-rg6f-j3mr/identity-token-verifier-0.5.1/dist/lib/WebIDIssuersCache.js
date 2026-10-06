"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebIDIssuersCache = void 0;
const lru_cache_1 = __importDefault(require("lru-cache"));
const Defaults_1 = require("./Defaults");
const WebID_1 = require("./WebID");
class WebIDIssuersCache extends lru_cache_1.default {
    constructor() {
        super({ max: Defaults_1.maxRequestsPerSecond, maxAge: Defaults_1.maxAgeInMilliseconds });
    }
    async getIssuers(webid) {
        const cachedValue = this.get(webid.toString());
        if (cachedValue === undefined) {
            const issuersValue = await WebID_1.issuers(webid);
            this.set(webid.toString(), issuersValue);
            return issuersValue;
        }
        return cachedValue;
    }
}
exports.WebIDIssuersCache = WebIDIssuersCache;
//# sourceMappingURL=WebIDIssuersCache.js.map
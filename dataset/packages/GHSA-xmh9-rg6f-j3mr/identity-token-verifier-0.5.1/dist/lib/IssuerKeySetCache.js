"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuerKeySetCache = void 0;
const lru_cache_1 = __importDefault(require("lru-cache"));
const Defaults_1 = require("./Defaults");
const Issuer_1 = require("./Issuer");
class IssuerKeySetCache extends lru_cache_1.default {
    constructor() {
        super({ max: Defaults_1.maxRequestsPerSecond, maxAge: Defaults_1.maxAgeInMilliseconds });
    }
    async getKeySet(iss) {
        const cachedValue = this.get(iss.toString());
        if (cachedValue === undefined) {
            const keySetValue = await Issuer_1.keySet(iss);
            this.set(iss.toString(), keySetValue);
            return keySetValue;
        }
        return cachedValue;
    }
}
exports.IssuerKeySetCache = IssuerKeySetCache;
//# sourceMappingURL=IssuerKeySetCache.js.map
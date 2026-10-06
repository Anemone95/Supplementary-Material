"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DPoPJTICache = void 0;
const lru_cache_1 = __importDefault(require("lru-cache"));
const Defaults_1 = require("./Defaults");
class DPoPJTICache extends lru_cache_1.default {
    constructor() {
        super({
            max: (Defaults_1.maxRequestsPerSecond * Defaults_1.maxAgeInMilliseconds) / 1000,
            maxAge: Defaults_1.maxAgeInMilliseconds,
        });
    }
    isDuplicateJTI(jti) {
        if (this.get(jti) === undefined) {
            this.set(jti, true);
            return false;
        }
        return true;
    }
}
exports.DPoPJTICache = DPoPJTICache;
//# sourceMappingURL=DPoPJTICache.js.map
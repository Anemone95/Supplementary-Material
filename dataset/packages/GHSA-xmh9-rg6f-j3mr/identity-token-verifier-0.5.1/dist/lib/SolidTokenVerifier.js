"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSolidTokenVerifier = void 0;
const primitive_type_1 = require("ts-guards/dist/primitive-type");
const DPoPJTICache_1 = require("./DPoPJTICache");
const IssuerKeySetCache_1 = require("./IssuerKeySetCache");
const Verify_1 = require("./Verify");
const WebIDIssuersCache_1 = require("./WebIDIssuersCache");
class SolidTokenVerifier {
    constructor() {
        this.dpopJtiCache = new DPoPJTICache_1.DPoPJTICache();
        this.issuerKeySetCache = new IssuerKeySetCache_1.IssuerKeySetCache();
        this.webIDIssuersCache = new WebIDIssuersCache_1.WebIDIssuersCache();
    }
    async verify(authorizationHeader, dpop) {
        let dpopArgs;
        if (primitive_type_1.isNotNullOrUndefined(dpop)) {
            dpopArgs = {
                header: dpop.header,
                method: dpop.method,
                url: dpop.url,
                isDuplicateJTI: this.dpopJtiCache.isDuplicateJTI.bind(this.dpopJtiCache),
            };
        }
        return Verify_1.verify({
            header: authorizationHeader,
            issuers: this.webIDIssuersCache.getIssuers.bind(this.webIDIssuersCache),
            keySet: this.issuerKeySetCache.getKeySet.bind(this.issuerKeySetCache),
        }, dpopArgs);
    }
}
function createSolidTokenVerifier() {
    const cache = new SolidTokenVerifier();
    return cache.verify.bind(cache);
}
exports.createSolidTokenVerifier = createSolidTokenVerifier;
//# sourceMappingURL=SolidTokenVerifier.js.map
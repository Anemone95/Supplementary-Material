"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const base64url_1 = require("jose/util/base64url");
function decode(x) {
    return new TextDecoder().decode(base64url_1.decode(x));
}
exports.decode = decode;
//# sourceMappingURL=JWT.js.map
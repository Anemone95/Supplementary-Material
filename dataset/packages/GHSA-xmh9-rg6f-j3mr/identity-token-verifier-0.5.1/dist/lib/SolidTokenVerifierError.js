"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolidTokenVerifierError = void 0;
/**
 * Generic Error class for everything DPoP
 */
class SolidTokenVerifierError extends Error {
    /**
     * Creates a new HTTP error. Subclasses should call this with their fixed status code.
     * @param name - Error name. Useful for logging and stack tracing.
     * @param message - Message to be thrown.
     */
    constructor(code, message) {
        super(message);
        this.statusCode = 401;
        this.code = code;
    }
}
exports.SolidTokenVerifierError = SolidTokenVerifierError;
//# sourceMappingURL=SolidTokenVerifierError.js.map
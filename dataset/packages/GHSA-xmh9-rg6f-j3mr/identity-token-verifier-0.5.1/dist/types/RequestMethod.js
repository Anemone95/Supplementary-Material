"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestMethod = void 0;
/**
 * Standard HTTP methods
 * As defined in:
 * - HTTP/1.1 Semantics and Content RFC7231 https://tools.ietf.org/html/rfc7231#section-4
 * - PATCH Method for HTTP RFC5789 https://tools.ietf.org/html/rfc5789
 */
exports.requestMethod = new Set([
    "CONNECT",
    "DELETE",
    "GET",
    "HEAD",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
    "TRACE",
]);
//# sourceMappingURL=RequestMethod.js.map
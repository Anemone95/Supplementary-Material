"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxRequestsPerSecond = exports.maxAgeInMilliseconds = exports.maxAccessTokenAgeInSeconds = exports.clockToleranceInSeconds = void 0;
// Clock tolerance for all time based token verifications
exports.clockToleranceInSeconds = 5;
// Limit Access Token Age to 24 Hours, it should probably have an exp claim much shorter than that
exports.maxAccessTokenAgeInSeconds = 86400;
// Default max age for everything else
exports.maxAgeInMilliseconds = 60000;
// Used to calculate the default cache size based on max age
exports.maxRequestsPerSecond = 100;
//# sourceMappingURL=Defaults.js.map
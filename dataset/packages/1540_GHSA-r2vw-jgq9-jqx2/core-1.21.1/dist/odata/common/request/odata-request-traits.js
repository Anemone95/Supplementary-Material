"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
Object.defineProperty(exports, "__esModule", { value: true });
function isWithETag(config) {
    return 'eTag' in config || 'versionIdentifierIgnored' in config;
}
exports.isWithETag = isWithETag;
//# sourceMappingURL=odata-request-traits.js.map
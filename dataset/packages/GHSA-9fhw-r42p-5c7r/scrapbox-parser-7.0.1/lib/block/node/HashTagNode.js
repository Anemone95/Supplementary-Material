"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashTagNodeParser = void 0;
const creator_1 = require("./creator");
const hashTagRegExp = /(?<=^| )#\S+/;
const createHashTagNode = raw => ({
    type: 'hashTag',
    raw,
    href: raw.substring(1)
});
exports.HashTagNodeParser = creator_1.createNodeParser(createHashTagNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [hashTagRegExp]
});
//# sourceMappingURL=HashTagNode.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainNodeParser = void 0;
const creator_1 = require("./creator");
const createPlainNode = raw => ({
    type: 'plain',
    raw,
    text: raw
});
exports.PlainNodeParser = creator_1.createNodeParser(createPlainNode, {
    parseOnNested: true,
    parseOnQuoted: true,
    patterns: [/^()(.*)()$/]
});
//# sourceMappingURL=PlainNode.js.map
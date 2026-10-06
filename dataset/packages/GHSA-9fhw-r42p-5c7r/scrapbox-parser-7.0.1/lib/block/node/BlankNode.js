"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlankNodeParser = void 0;
const creator_1 = require("./creator");
const blankRegExp = /\[\s+\]/;
const createBlankNode = (raw) => ({
    type: 'blank',
    raw,
    text: raw.substring(1, raw.length - 1)
});
exports.BlankNodeParser = creator_1.createNodeParser(createBlankNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [blankRegExp]
});
//# sourceMappingURL=BlankNode.js.map
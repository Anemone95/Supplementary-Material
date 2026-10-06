"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeNodeParser = void 0;
const creator_1 = require("./creator");
const codeRegExp = /`.*?`/;
const createCodeNode = raw => ({
    type: 'code',
    raw,
    text: raw.substring(1, raw.length - 1)
});
exports.CodeNodeParser = creator_1.createNodeParser(createCodeNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [codeRegExp]
});
//# sourceMappingURL=CodeNode.js.map
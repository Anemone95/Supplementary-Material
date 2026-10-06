"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrongNodeParser = void 0;
const creator_1 = require("./creator");
const _1 = require(".");
const strongRegExp = /\[\[.+?[\]]*\]\]/;
const createStrongNode = (raw, opts) => ({
    type: 'strong',
    raw,
    nodes: _1.convertToNodes(raw.substring(2, raw.length - 2), { ...opts, nested: true })
});
exports.StrongNodeParser = creator_1.createNodeParser(createStrongNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [strongRegExp]
});
//# sourceMappingURL=StrongNode.js.map
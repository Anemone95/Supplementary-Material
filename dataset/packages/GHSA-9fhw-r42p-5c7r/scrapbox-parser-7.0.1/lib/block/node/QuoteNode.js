"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteNodeParser = void 0;
const _1 = require(".");
const creator_1 = require("./creator");
const quoteRegExp = /^>.*$/;
const createQuoteNode = (raw, opts) => ({
    type: 'quote',
    raw,
    nodes: _1.convertToNodes(raw.substring(1), { ...opts, quoted: true })
});
exports.QuoteNodeParser = creator_1.createNodeParser(createQuoteNode, {
    parseOnNested: false,
    parseOnQuoted: false,
    patterns: [quoteRegExp]
});
//# sourceMappingURL=QuoteNode.js.map
import { convertToNodes } from '.';
import { createNodeParser } from './creator';
const quoteRegExp = /^>.*$/;
const createQuoteNode = (raw, opts) => ({
    type: 'quote',
    raw,
    nodes: convertToNodes(raw.substring(1), { ...opts, quoted: true })
});
export const QuoteNodeParser = createNodeParser(createQuoteNode, {
    parseOnNested: false,
    parseOnQuoted: false,
    patterns: [quoteRegExp]
});
//# sourceMappingURL=QuoteNode.js.map
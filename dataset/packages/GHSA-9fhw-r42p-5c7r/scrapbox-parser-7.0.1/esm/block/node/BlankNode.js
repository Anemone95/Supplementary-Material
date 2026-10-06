import { createNodeParser } from './creator';
const blankRegExp = /\[\s+\]/;
const createBlankNode = (raw) => ({
    type: 'blank',
    raw,
    text: raw.substring(1, raw.length - 1)
});
export const BlankNodeParser = createNodeParser(createBlankNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [blankRegExp]
});
//# sourceMappingURL=BlankNode.js.map
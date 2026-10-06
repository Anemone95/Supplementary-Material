import { createNodeParser } from './creator';
const createPlainNode = raw => ({
    type: 'plain',
    raw,
    text: raw
});
export const PlainNodeParser = createNodeParser(createPlainNode, {
    parseOnNested: true,
    parseOnQuoted: true,
    patterns: [/^()(.*)()$/]
});
//# sourceMappingURL=PlainNode.js.map
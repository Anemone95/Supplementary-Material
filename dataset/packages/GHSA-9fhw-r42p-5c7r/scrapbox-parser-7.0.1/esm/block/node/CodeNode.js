import { createNodeParser } from './creator';
const codeRegExp = /`.*?`/;
const createCodeNode = raw => ({
    type: 'code',
    raw,
    text: raw.substring(1, raw.length - 1)
});
export const CodeNodeParser = createNodeParser(createCodeNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [codeRegExp]
});
//# sourceMappingURL=CodeNode.js.map
import { createNodeParser } from './creator';
import { convertToNodes } from '.';
const strongRegExp = /\[\[.+?[\]]*\]\]/;
const createStrongNode = (raw, opts) => ({
    type: 'strong',
    raw,
    nodes: convertToNodes(raw.substring(2, raw.length - 2), { ...opts, nested: true })
});
export const StrongNodeParser = createNodeParser(createStrongNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [strongRegExp]
});
//# sourceMappingURL=StrongNode.js.map
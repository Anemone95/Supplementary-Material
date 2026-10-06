import { createNodeParser } from './creator';
const internalLinkRegExp = /\[\/?[^[\]]+\]/;
const createInternalLinkNode = raw => {
    const href = raw.substring(1, raw.length - 1);
    return {
        type: 'link',
        raw,
        pathType: href.startsWith('/') ? 'root' : 'relative',
        href,
        content: ''
    };
};
export const InternalLinkNodeParser = createNodeParser(createInternalLinkNode, {
    parseOnNested: true,
    parseOnQuoted: true,
    patterns: [internalLinkRegExp]
});
//# sourceMappingURL=InternalLinkNode.js.map
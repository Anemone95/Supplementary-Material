import { createNodeParser } from './creator';
const hashTagRegExp = /(?<=^| )#\S+/;
const createHashTagNode = raw => ({
    type: 'hashTag',
    raw,
    href: raw.substring(1)
});
export const HashTagNodeParser = createNodeParser(createHashTagNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [hashTagRegExp]
});
//# sourceMappingURL=HashTagNode.js.map
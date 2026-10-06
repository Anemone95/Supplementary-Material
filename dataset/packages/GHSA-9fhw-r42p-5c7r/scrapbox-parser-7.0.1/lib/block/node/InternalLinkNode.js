"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalLinkNodeParser = void 0;
const creator_1 = require("./creator");
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
exports.InternalLinkNodeParser = creator_1.createNodeParser(createInternalLinkNode, {
    parseOnNested: true,
    parseOnQuoted: true,
    patterns: [internalLinkRegExp]
});
//# sourceMappingURL=InternalLinkNode.js.map
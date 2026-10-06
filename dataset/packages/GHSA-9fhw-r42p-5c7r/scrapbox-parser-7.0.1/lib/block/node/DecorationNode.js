"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationNodeParser = void 0;
const creator_1 = require("./creator");
const _1 = require(".");
const decorationRegExp = /\[[!"#%&'()*+,-./{|}<>_~]+ (?:\[[^[\]]+\]|[^\]])+\]/;
const createDecorationNode = (raw, opts) => {
    const separatorIndex = raw.indexOf(' ');
    const rawDecos = raw.substring(1, separatorIndex);
    const text = raw.substring(separatorIndex + 1, raw.length - 1);
    const decoSet = new Set(rawDecos);
    if (decoSet.has('*')) {
        const asteriskCount = rawDecos.split('*').length - 1;
        decoSet.delete('*');
        decoSet.add(`*-${Math.min(asteriskCount, 10)}`);
    }
    return {
        type: 'decoration',
        raw,
        rawDecos,
        decos: Array.from(decoSet),
        nodes: _1.convertToNodes(text, { ...opts, nested: true })
    };
};
exports.DecorationNodeParser = creator_1.createNodeParser(createDecorationNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [decorationRegExp]
});
//# sourceMappingURL=DecorationNode.js.map
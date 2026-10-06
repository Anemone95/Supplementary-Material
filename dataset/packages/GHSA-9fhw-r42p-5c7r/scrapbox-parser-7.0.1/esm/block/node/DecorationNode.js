import { createNodeParser } from './creator';
import { convertToNodes } from '.';
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
        nodes: convertToNodes(text, { ...opts, nested: true })
    };
};
export const DecorationNodeParser = createNodeParser(createDecorationNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [decorationRegExp]
});
//# sourceMappingURL=DecorationNode.js.map
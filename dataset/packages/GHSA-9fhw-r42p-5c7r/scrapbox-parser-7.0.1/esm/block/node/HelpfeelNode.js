import { createNodeParser } from './creator';
const helpfeelRegExp = /^\? .+$/;
const createHelpfeelNode = raw => ({
    type: 'helpfeel',
    raw,
    text: raw.substring(2)
});
export const HelpfeelNodeParser = createNodeParser(createHelpfeelNode, {
    parseOnNested: false,
    parseOnQuoted: false,
    patterns: [helpfeelRegExp]
});
//# sourceMappingURL=HelpfeelNode.js.map
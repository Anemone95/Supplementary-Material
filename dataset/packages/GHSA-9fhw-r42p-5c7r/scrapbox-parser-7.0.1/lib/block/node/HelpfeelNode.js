"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpfeelNodeParser = void 0;
const creator_1 = require("./creator");
const helpfeelRegExp = /^\? .+$/;
const createHelpfeelNode = raw => ({
    type: 'helpfeel',
    raw,
    text: raw.substring(2)
});
exports.HelpfeelNodeParser = creator_1.createNodeParser(createHelpfeelNode, {
    parseOnNested: false,
    parseOnQuoted: false,
    patterns: [helpfeelRegExp]
});
//# sourceMappingURL=HelpfeelNode.js.map
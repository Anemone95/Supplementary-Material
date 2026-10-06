"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulaNodeParser = void 0;
const creator_1 = require("./creator");
const formulaWithTailHalfSpaceRegExp = /\[\$ .+? \]/;
const formulaRegExp = /\[\$ [^\]]+\]/;
const createFormulaNode = raw => ({
    type: 'formula',
    raw,
    formula: raw.substring(3, raw.length - (raw.endsWith(' ]') ? 2 : 1))
});
exports.FormulaNodeParser = creator_1.createNodeParser(createFormulaNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [formulaWithTailHalfSpaceRegExp, formulaRegExp]
});
//# sourceMappingURL=FormulaNode.js.map
import { createNodeParser } from './creator';
const formulaWithTailHalfSpaceRegExp = /\[\$ .+? \]/;
const formulaRegExp = /\[\$ [^\]]+\]/;
const createFormulaNode = raw => ({
    type: 'formula',
    raw,
    formula: raw.substring(3, raw.length - (raw.endsWith(' ]') ? 2 : 1))
});
export const FormulaNodeParser = createNodeParser(createFormulaNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [formulaWithTailHalfSpaceRegExp, formulaRegExp]
});
//# sourceMappingURL=FormulaNode.js.map
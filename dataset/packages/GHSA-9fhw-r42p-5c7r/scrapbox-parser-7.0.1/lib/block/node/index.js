"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToNodes = void 0;
const QuoteNode_1 = require("./QuoteNode");
const HelpfeelNode_1 = require("./HelpfeelNode");
const StrongImageNode_1 = require("./StrongImageNode");
const StrongIconNode_1 = require("./StrongIconNode");
const StrongNode_1 = require("./StrongNode");
const FormulaNode_1 = require("./FormulaNode");
const DecorationNode_1 = require("./DecorationNode");
const CodeNode_1 = require("./CodeNode");
const CommandLineNode_1 = require("./CommandLineNode");
const BlankNode_1 = require("./BlankNode");
const ImageNode_1 = require("./ImageNode");
const ExternalLinkNode_1 = require("./ExternalLinkNode");
const GoogleMapNode_1 = require("./GoogleMapNode");
const InternalLinkNode_1 = require("./InternalLinkNode");
const IconNode_1 = require("./IconNode");
const HashTagNode_1 = require("./HashTagNode");
const PlainNode_1 = require("./PlainNode");
const FalsyEliminator = (text, _, next) => {
    var _a;
    if (text === '')
        return [];
    return (_a = next === null || next === void 0 ? void 0 : next()) !== null && _a !== void 0 ? _a : [];
};
const combineNodeParsers = (...parsers) => (text = '', opts = { nested: false, quoted: false }) => parsers.reduceRight((acc, parser) => () => parser(text, opts, acc), () => PlainNode_1.PlainNodeParser(text, opts))();
exports.convertToNodes = combineNodeParsers(FalsyEliminator, QuoteNode_1.QuoteNodeParser, HelpfeelNode_1.HelpfeelNodeParser, CodeNode_1.CodeNodeParser, CommandLineNode_1.CommandLineNodeParser, FormulaNode_1.FormulaNodeParser, BlankNode_1.BlankNodeParser, StrongImageNode_1.StrongImageNodeParser, StrongIconNode_1.StrongIconNodeParser, StrongNode_1.StrongNodeParser, DecorationNode_1.DecorationNodeParser, ImageNode_1.ImageNodeParser, ExternalLinkNode_1.ExternalLinkNodeParser, IconNode_1.IconNodeParser, GoogleMapNode_1.GoogleMapNodeParser, InternalLinkNode_1.InternalLinkNodeParser, HashTagNode_1.HashTagNodeParser);
//# sourceMappingURL=index.js.map
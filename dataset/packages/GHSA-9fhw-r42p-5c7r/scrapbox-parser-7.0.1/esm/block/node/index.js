import { QuoteNodeParser } from './QuoteNode';
import { HelpfeelNodeParser } from './HelpfeelNode';
import { StrongImageNodeParser } from './StrongImageNode';
import { StrongIconNodeParser } from './StrongIconNode';
import { StrongNodeParser } from './StrongNode';
import { FormulaNodeParser } from './FormulaNode';
import { DecorationNodeParser } from './DecorationNode';
import { CodeNodeParser } from './CodeNode';
import { CommandLineNodeParser } from './CommandLineNode';
import { BlankNodeParser } from './BlankNode';
import { ImageNodeParser } from './ImageNode';
import { ExternalLinkNodeParser } from './ExternalLinkNode';
import { GoogleMapNodeParser } from './GoogleMapNode';
import { InternalLinkNodeParser } from './InternalLinkNode';
import { IconNodeParser } from './IconNode';
import { HashTagNodeParser } from './HashTagNode';
import { PlainNodeParser } from './PlainNode';
const FalsyEliminator = (text, _, next) => {
    var _a;
    if (text === '')
        return [];
    return (_a = next === null || next === void 0 ? void 0 : next()) !== null && _a !== void 0 ? _a : [];
};
const combineNodeParsers = (...parsers) => (text = '', opts = { nested: false, quoted: false }) => parsers.reduceRight((acc, parser) => () => parser(text, opts, acc), () => PlainNodeParser(text, opts))();
export const convertToNodes = combineNodeParsers(FalsyEliminator, QuoteNodeParser, HelpfeelNodeParser, CodeNodeParser, CommandLineNodeParser, FormulaNodeParser, BlankNodeParser, StrongImageNodeParser, StrongIconNodeParser, StrongNodeParser, DecorationNodeParser, ImageNodeParser, ExternalLinkNodeParser, IconNodeParser, GoogleMapNodeParser, InternalLinkNodeParser, HashTagNodeParser);
//# sourceMappingURL=index.js.map
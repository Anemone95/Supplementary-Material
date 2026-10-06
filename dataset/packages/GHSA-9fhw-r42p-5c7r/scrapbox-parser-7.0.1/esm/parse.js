import { convertToBlock } from './block';
import { parseToRows } from './block/Row';
import { packRows } from './block/Pack';
export const parse = (input, opts) => {
    var _a;
    const rows = parseToRows(input);
    const packs = packRows(rows, { hasTitle: (_a = opts === null || opts === void 0 ? void 0 : opts.hasTitle) !== null && _a !== void 0 ? _a : true });
    return packs.map(convertToBlock);
};
export const getTitle = (input) => {
    const match = /^\s*\S.*\s*$/m.exec(input);
    return match !== null ? match[0].trim() : 'Untitled';
};
//# sourceMappingURL=parse.js.map
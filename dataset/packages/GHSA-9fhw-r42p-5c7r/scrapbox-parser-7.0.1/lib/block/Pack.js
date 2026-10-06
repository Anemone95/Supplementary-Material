"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packRows = void 0;
const isChildRowOfPack = (pack, row) => (pack.type === 'codeBlock' || pack.type === 'table') && row.indent > pack.rows[0].indent;
const packing = (packs, row) => {
    if (packs.length > 0 && isChildRowOfPack(packs[packs.length - 1], row)) {
        packs[packs.length - 1].rows.push(row);
        return packs;
    }
    packs.push({
        type: /^\s*code:/.test(row.text) ? 'codeBlock' : /^\s*table:/.test(row.text) ? 'table' : 'line',
        rows: [row]
    });
    return packs;
};
const packRows = (rows, opts) => {
    var _a;
    if ((_a = opts.hasTitle) !== null && _a !== void 0 ? _a : true) {
        const [title, ...body] = rows;
        return [
            {
                type: 'title',
                rows: [title]
            },
            ...exports.packRows(body, { hasTitle: false })
        ];
    }
    return rows.reduce(packing, []);
};
exports.packRows = packRows;
//# sourceMappingURL=Pack.js.map
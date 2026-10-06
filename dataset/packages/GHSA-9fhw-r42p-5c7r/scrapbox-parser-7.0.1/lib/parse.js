"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitle = exports.parse = void 0;
const block_1 = require("./block");
const Row_1 = require("./block/Row");
const Pack_1 = require("./block/Pack");
const parse = (input, opts) => {
    var _a;
    const rows = Row_1.parseToRows(input);
    const packs = Pack_1.packRows(rows, { hasTitle: (_a = opts === null || opts === void 0 ? void 0 : opts.hasTitle) !== null && _a !== void 0 ? _a : true });
    return packs.map(block_1.convertToBlock);
};
exports.parse = parse;
const getTitle = (input) => {
    const match = /^\s*\S.*\s*$/m.exec(input);
    return match !== null ? match[0].trim() : 'Untitled';
};
exports.getTitle = getTitle;
//# sourceMappingURL=parse.js.map
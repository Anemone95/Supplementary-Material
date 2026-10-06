"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToTable = void 0;
const node_1 = require("./node");
const convertToTable = (pack) => {
    const { rows: [head, ...body] } = pack;
    const { indent, text } = head;
    const fileName = text.replace(/^\s*table:/, '');
    return {
        indent,
        type: 'table',
        fileName,
        cells: body
            .map((row) => row.text.substring(indent + 1))
            .map((text) => text
            .split('\t')
            .map((block) => node_1.convertToNodes(block, { nested: true, quoted: false })))
    };
};
exports.convertToTable = convertToTable;
//# sourceMappingURL=Table.js.map
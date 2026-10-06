"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToLine = void 0;
const node_1 = require("./node");
const convertToLine = (pack) => {
    const { indent, text } = pack.rows[0];
    return {
        indent,
        type: 'line',
        nodes: node_1.convertToNodes(text.substring(indent))
    };
};
exports.convertToLine = convertToLine;
//# sourceMappingURL=Line.js.map
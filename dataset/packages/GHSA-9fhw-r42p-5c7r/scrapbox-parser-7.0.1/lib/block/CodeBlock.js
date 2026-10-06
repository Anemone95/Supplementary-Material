"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToCodeBlock = void 0;
const convertToCodeBlock = (pack) => {
    const { rows: [head, ...body] } = pack;
    const { indent, text } = head;
    const fileName = text.replace(/^\s*code:/, '');
    return {
        indent,
        type: 'codeBlock',
        fileName,
        content: body.map((row) => row.text.substring(indent + 1)).join('\n')
    };
};
exports.convertToCodeBlock = convertToCodeBlock;
//# sourceMappingURL=CodeBlock.js.map
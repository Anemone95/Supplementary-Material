import { convertToNodes } from './node';
export const convertToTable = (pack) => {
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
            .map((block) => convertToNodes(block, { nested: true, quoted: false })))
    };
};
//# sourceMappingURL=Table.js.map
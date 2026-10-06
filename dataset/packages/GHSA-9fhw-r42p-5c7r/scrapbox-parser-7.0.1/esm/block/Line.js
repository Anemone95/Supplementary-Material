import { convertToNodes } from './node';
export const convertToLine = (pack) => {
    const { indent, text } = pack.rows[0];
    return {
        indent,
        type: 'line',
        nodes: convertToNodes(text.substring(indent))
    };
};
//# sourceMappingURL=Line.js.map
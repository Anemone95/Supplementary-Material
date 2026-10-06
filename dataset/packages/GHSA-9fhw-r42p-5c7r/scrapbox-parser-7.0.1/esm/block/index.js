import { convertToTitle } from './Title';
import { convertToCodeBlock } from './CodeBlock';
import { convertToTable } from './Table';
import { convertToLine } from './Line';
export const convertToBlock = (pack) => {
    switch (pack.type) {
        case 'title':
            return convertToTitle(pack);
        case 'codeBlock':
            return convertToCodeBlock(pack);
        case 'table':
            return convertToTable(pack);
        case 'line':
            return convertToLine(pack);
    }
};
//# sourceMappingURL=index.js.map
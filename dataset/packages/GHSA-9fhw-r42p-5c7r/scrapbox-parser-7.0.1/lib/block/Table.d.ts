import type { Row } from './Row';
import type { Node } from './node/type';
export interface TablePack {
    type: 'table';
    rows: Row[];
}
export interface Table {
    indent: number;
    type: 'table';
    fileName: string;
    cells: Node[][][];
}
export declare const convertToTable: (pack: TablePack) => Table;
//# sourceMappingURL=Table.d.ts.map
import type { Row } from './Row';
import type { Node } from './node/type';
export interface LinePack {
    type: 'line';
    rows: [Row];
}
export interface Line {
    indent: number;
    type: 'line';
    nodes: Node[];
}
export declare const convertToLine: (pack: LinePack) => Line;
//# sourceMappingURL=Line.d.ts.map
import type { Node } from './type';
export interface NodeParserOption {
    nested: boolean;
    quoted: boolean;
}
export declare type NextNodeParser = () => Node[];
export declare type NodeParser = (text: string, opts: NodeParserOption, next?: NextNodeParser) => Node[];
export declare const convertToNodes: (text?: string, opts?: NodeParserOption) => Node[];
//# sourceMappingURL=index.d.ts.map
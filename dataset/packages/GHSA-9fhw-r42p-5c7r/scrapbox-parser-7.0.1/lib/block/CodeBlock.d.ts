import type { Row } from './Row';
export interface CodeBlockPack {
    type: 'codeBlock';
    rows: Row[];
}
export interface CodeBlock {
    indent: number;
    type: 'codeBlock';
    fileName: string;
    content: string;
}
export declare const convertToCodeBlock: (pack: CodeBlockPack) => CodeBlock;
//# sourceMappingURL=CodeBlock.d.ts.map
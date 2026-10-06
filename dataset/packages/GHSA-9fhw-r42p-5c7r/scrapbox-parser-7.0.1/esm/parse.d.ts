import type { Block } from './block';
export interface ParserOption {
    hasTitle?: boolean;
}
export declare type Page = Block[];
export declare const parse: (input: string, opts?: ParserOption | undefined) => Page;
export declare const getTitle: (input: string) => string;
//# sourceMappingURL=parse.d.ts.map
declare type DecorationChar = '*' | '!' | '"' | '#' | '%' | '&' | "'" | '(' | ')' | '+' | ',' | '-' | '.' | '/' | '{' | '|' | '}' | '<' | '>' | '_' | '~';
declare type AsteriskDecorationChar = '*-1' | '*-2' | '*-3' | '*-4' | '*-5' | '*-6' | '*-7' | '*-8' | '*-9' | '*-10';
export declare type Decoration = Exclude<DecorationChar, '*'> | AsteriskDecorationChar;
export declare const DecorationNodeParser: import(".").NodeParser;
export {};
//# sourceMappingURL=DecorationNode.d.ts.map
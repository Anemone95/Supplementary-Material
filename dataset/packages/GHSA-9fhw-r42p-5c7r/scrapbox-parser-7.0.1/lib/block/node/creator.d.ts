import type { NodeParser, NodeParserOption } from '.';
import type { Node } from './type';
export declare type NodeCreator<T extends Node> = (target: string, opts: NodeParserOption) => T | T[];
declare type NodeParserCreator<T extends Node> = (nodeCreator: NodeCreator<T>, opts: {
    parseOnNested: boolean;
    parseOnQuoted: boolean;
    patterns: RegExp[];
}) => NodeParser;
export declare const createNodeParser: NodeParserCreator<Node>;
export {};
//# sourceMappingURL=creator.d.ts.map
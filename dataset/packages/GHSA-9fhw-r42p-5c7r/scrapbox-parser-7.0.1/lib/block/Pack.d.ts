import type { ParserOption } from '../parse';
import type { Row } from './Row';
import type { TitlePack } from './Title';
import type { CodeBlockPack } from './CodeBlock';
import type { TablePack } from './Table';
import type { LinePack } from './Line';
export declare type Pack = TitlePack | CodeBlockPack | TablePack | LinePack;
export declare const packRows: (rows: Row[], opts: ParserOption) => Pack[];
//# sourceMappingURL=Pack.d.ts.map
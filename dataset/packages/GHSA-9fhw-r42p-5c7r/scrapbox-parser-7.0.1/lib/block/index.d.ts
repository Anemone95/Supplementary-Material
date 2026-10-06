import type { Pack } from './Pack';
import type { Title } from './Title';
import type { CodeBlock } from './CodeBlock';
import type { Table } from './Table';
import type { Line } from './Line';
export declare type Block = Title | CodeBlock | Table | Line;
export declare const convertToBlock: (pack: Pack) => Block;
//# sourceMappingURL=index.d.ts.map
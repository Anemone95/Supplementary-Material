import type { Row } from './Row';
export interface TitlePack {
    type: 'title';
    rows: [Row];
}
export interface Title {
    type: 'title';
    text: string;
}
export declare const convertToTitle: (pack: TitlePack) => Title;
//# sourceMappingURL=Title.d.ts.map
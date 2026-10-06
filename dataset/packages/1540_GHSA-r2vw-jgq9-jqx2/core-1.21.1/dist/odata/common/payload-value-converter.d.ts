import { EdmTypeSameConverters } from '../common';
declare type EdmTypeMapping = {
    [key in EdmTypeSameConverters]: (value: any) => any;
};
export declare const toGuid: (value: string) => string;
/**
 * @hidden
 */
export declare function parseNumber(value: string | number): number;
export declare const deserializersCommon: EdmTypeMapping;
export declare const serializersCommom: EdmTypeMapping;
export {};
//# sourceMappingURL=payload-value-converter.d.ts.map
export declare type EdmTypeCommon = EdmTypeSameConverters | EdmTypeDifferentConverters;
export declare type EdmTypeSameConverters = 'Edm.String' | 'Edm.Boolean' | 'Edm.Decimal' | 'Edm.Double' | 'Edm.Single' | 'Edm.Float' | 'Edm.Int16' | 'Edm.Int32' | 'Edm.Int64' | 'Edm.SByte' | 'Edm.Binary' | 'Edm.Guid' | 'Edm.Byte';
export declare type EdmTypeDifferentConverters = 'Edm.DateTimeOffset';
export declare type EdmTypeV2 = 'Edm.DateTime' | 'Edm.Time';
export declare type EdmTypeV4 = 'Edm.Date' | 'Edm.Duration' | 'Edm.TimeOfDay';
export declare type EdmTypeShared<VersionT extends 'v2' | 'v4' | 'any'> = EdmTypeCommon | EdmTypeV2 | EdmTypeV4;
export declare type EdmTypeSameConvertersUri = Exclude<EdmTypeSameConverters, 'Edm.Guid'>;
//# sourceMappingURL=edm-types.d.ts.map
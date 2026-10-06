import { MapType } from '@sap-cloud-sdk/util';
import { Constructable, EntityBase } from '../common';
/**
 * @experimental This is experimental and is subject to change. Use with caution.
 */
export declare function entityDeserializer(edmToTs: any): {
    extractCustomFields: <EntityT extends EntityBase, JsonT>(json: Partial<JsonT>, entityConstructor: Constructable<EntityT, {}>) => MapType<any>;
    deserializeEntity: <EntityT_1 extends EntityBase, JsonT_1>(json: Partial<JsonT_1>, entityConstructor: Constructable<EntityT_1, {}>, requestHeader?: any) => EntityT_1;
};
//# sourceMappingURL=entity-deserializer.d.ts.map
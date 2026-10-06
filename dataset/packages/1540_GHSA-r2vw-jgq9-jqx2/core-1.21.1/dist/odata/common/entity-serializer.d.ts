import { MapType } from '@sap-cloud-sdk/util';
import { Constructable, EntityBase } from '../common';
/**
 * @experimental This is experimental and is subject to change. Use with caution.
 */
export declare function entitySerializer(tsToEdm: any): {
    serializeEntity: <EntityT extends EntityBase>(entity: EntityT, entityConstructor: Constructable<EntityT, {}>) => MapType<any>;
    serializeEntityNonCustomFields: <EntityT_1 extends EntityBase>(entity: EntityT_1, entityConstructor: Constructable<EntityT_1, {}>) => MapType<any>;
};
//# sourceMappingURL=entity-serializer.d.ts.map
import { MapType } from '@sap-cloud-sdk/util';
import { EntityBase } from '../entity';
import { Constructable } from '../constructable';
import { FieldType } from '../selectable';
import { UriConverter } from '../../v2';
/**
 * @experimental This is experimental and is subject to change. Use with caution.
 */
export declare function createGetResourcePathForKeys(uriConverter: UriConverter): {
    getResourcePathForKeys: <EntityT extends EntityBase>(keys: MapType<FieldType> | undefined, entityConstructor: Constructable<EntityT, {}>) => string;
};
//# sourceMappingURL=get-resource-path.d.ts.map
import { EntityBase, EntityBuilderType } from './entity';
import { RequestBuilder } from './request-builder/request-builder';
import { CustomFieldBase, Selectable, Field, Link } from './selectable';
/**
 * @hidden
 */
export interface Constructable<EntityT extends EntityBase, EntityTypeForceMandatoryT = {}> {
    _serviceName: string;
    _entityName: string;
    _defaultServicePath: string;
    _allFields: Selectable<EntityT>[] | (Field<EntityT> | Link<EntityT>)[];
    _keyFields: Selectable<EntityT>[] | Field<EntityT>[];
    _keys: {
        [keys: string]: Selectable<EntityT> | Field<EntityT>;
    };
    new (...args: any[]): EntityT;
    requestBuilder(): RequestBuilder<EntityT>;
    builder(): EntityBuilderType<EntityT, EntityTypeForceMandatoryT>;
    customField(fieldName: string): CustomFieldBase<EntityT>;
}
//# sourceMappingURL=constructable.d.ts.map
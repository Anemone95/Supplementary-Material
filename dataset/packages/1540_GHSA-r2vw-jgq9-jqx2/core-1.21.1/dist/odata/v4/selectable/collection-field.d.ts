import { Entity } from '../entity';
import { ComplexTypeField, Field, SelectableEdmTypeField, SimpleTypeFields } from '../../common/selectable';
import { Constructable } from '../../common';
/**
 * @experimental This is experimental and is subject to change. Use with caution.
 */
export declare class CollectionField<EntityT extends Entity> extends Field<EntityT> implements SelectableEdmTypeField {
    readonly _fieldName: string;
    readonly _entityConstructor: Constructable<EntityT>;
    readonly _fieldType: SimpleTypeFields<EntityT> | ComplexTypeField<EntityT>;
    readonly selectable: true;
    constructor(_fieldName: string, _entityConstructor: Constructable<EntityT>, _fieldType: SimpleTypeFields<EntityT> | ComplexTypeField<EntityT>);
}
//# sourceMappingURL=collection-field.d.ts.map
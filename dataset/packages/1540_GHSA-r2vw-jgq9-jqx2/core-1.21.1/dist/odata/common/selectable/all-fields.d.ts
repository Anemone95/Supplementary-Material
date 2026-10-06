import { Constructable } from '../constructable';
import { EntityBase } from '../entity';
export declare class AllFields<EntityT extends EntityBase> {
    _fieldName: string;
    _entityConstructor: Constructable<EntityT>;
    readonly selectable: true;
    constructor(_fieldName: string, _entityConstructor: Constructable<EntityT>);
}
//# sourceMappingURL=all-fields.d.ts.map
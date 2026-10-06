import { EntityBase } from '../entity';
import { Filterable } from '../filter';
import { Constructable } from '../constructable';
import { UriConverter } from '../request';
/**
 * @experimental This is experimental and is subject to change. Use with caution.
 */
export declare function createGetFilter(uriConverter: UriConverter): {
    getFilter: <EntityT extends EntityBase>(filter: Filterable<EntityT>, entityConstructor: Constructable<EntityT, {}>) => Partial<{
        filter: string;
    }>;
};
//# sourceMappingURL=get-filter.d.ts.map
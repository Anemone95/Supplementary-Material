import { EntityBase } from '../entity';
import { Filterable, FilterList } from '../filter';
import { Orderable } from '../order';
import { Link } from './link';
/**
 * @experimental
 */
export declare class OneToManyLink<EntityT extends EntityBase, LinkedEntityT extends EntityBase> extends Link<EntityT, LinkedEntityT> {
    _filters: FilterList<LinkedEntityT>;
    _orderBy: Orderable<LinkedEntityT>[];
    _top: number;
    _skip: number;
    clone(): this;
    /**
     * Add filter statements to the request.
     *
     * @param expressions - Filter expressions to restrict the response
     * @returns The request builder itself, to facilitate method chaining
     */
    filter(...expressions: Filterable<LinkedEntityT>[]): this;
    /**
     * Add order-by statements to the request.
     *
     * @param orderBy - OrderBy statements to order the response by
     * @returns The request builder itself, to facilitate method chaining
     */
    orderBy(...orderBy: Orderable<LinkedEntityT>[]): this;
    /**
     * Limit number of returned entities.
     *
     * @param top - Maximum number of entities to return in the response. Can be less, if less entities match the request
     * @returns The request builder itself, to facilitate method chaining
     */
    top(top: number): this;
    /**
     * Skip number of entities.
     *
     * @param skip - Number of matching entities to skip. Useful for paging
     * @returns The request builder itself, to facilitate method chaining
     */
    skip(skip: number): this;
}
//# sourceMappingURL=one-to-many-link.d.ts.map
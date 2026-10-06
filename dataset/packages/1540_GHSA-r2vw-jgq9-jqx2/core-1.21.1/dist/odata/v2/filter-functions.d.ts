import { Field, StringFilterFunction, BooleanFilterFunction, NumberFilterFunction, FilterFunctionParameterType } from '../common';
import { Entity } from './entity';
/**
 * Build an OData (V2) filter function to test whether a string is a substring of the other. Evaluates to boolean.
 * @param p0 - The substring to test for. This can either be a string, a reference to a field or another filter function.
 * @param p1 - The string to test. This can either be a string, a reference to a field or another filter function.
 *
 * @returns The newly created filter function
 */
export declare function substringOf<EntityT extends Entity>(p0: string | Field<EntityT> | StringFilterFunction<EntityT>, p1: string | Field<EntityT> | StringFilterFunction<EntityT>): BooleanFilterFunction<EntityT>;
/**
 * Build an OData (V2) filter function to get a substring starting from a designated position. Evaluates to string.
 * @param p0 - the original string. This can either be a string, a reference to a field or another filter function.
 * @param pos - the starting position of the original string. This can be either a number, a reference to a field or another filter function.
 * @returns The newly created filter function
 */
export declare function substring<EntityT extends Entity>(p0: string | Field<EntityT> | StringFilterFunction<EntityT>, pos: number | Field<EntityT> | NumberFilterFunction<EntityT>): StringFilterFunction<EntityT>;
/**
 * Build an OData (V2) filter function to get the length of a string.
 * @param p0 - the given string for computing the length
 * @returns The newly created filter function
 */
export declare function length<EntityT extends Entity>(p0: string | Field<EntityT> | StringFilterFunction<EntityT>): NumberFilterFunction<EntityT>;
export declare function filterFunction<EntityT extends Entity>(functionName: string, returnType: 'boolean', ...parameters: FilterFunctionParameterType<EntityT>[]): BooleanFilterFunction<EntityT>;
export declare function filterFunction<EntityT extends Entity>(functionName: string, returnType: 'int' | 'double' | 'decimal', ...parameters: FilterFunctionParameterType<EntityT>[]): NumberFilterFunction<EntityT>;
export declare function filterFunction<EntityT extends Entity>(functionName: string, returnType: 'string', ...parameters: FilterFunctionParameterType<EntityT>[]): StringFilterFunction<EntityT>;
//# sourceMappingURL=filter-functions.d.ts.map
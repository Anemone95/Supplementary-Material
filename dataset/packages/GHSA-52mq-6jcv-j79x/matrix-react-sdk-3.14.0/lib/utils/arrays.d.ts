/**
 * Clones an array as fast as possible, retaining references of the array's values.
 * @param a The array to clone. Must be defined.
 * @returns A copy of the array.
 */
export declare function arrayFastClone(a: any[]): any[];
/**
 * Determines if the two arrays are different either in length, contents,
 * or order of those contents.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns True if they are different, false otherwise.
 */
export declare function arrayHasOrderChange(a: any[], b: any[]): boolean;
/**
 * Determines if two arrays are different through a shallow comparison.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns True if they are different, false otherwise.
 */
export declare function arrayHasDiff(a: any[], b: any[]): boolean;
/**
 * Performs a diff on two arrays. The result is what is different with the
 * first array (`added` in the returned object means objects in B that aren't
 * in A). Shallow comparisons are used to perform the diff.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns The diff between the arrays.
 */
export declare function arrayDiff<T>(a: T[], b: T[]): {
    added: T[];
    removed: T[];
};
/**
 * Returns the union of two arrays.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns The union of the arrays.
 */
export declare function arrayUnion<T>(a: T[], b: T[]): T[];
/**
 * Merges arrays, deduping contents using a Set.
 * @param a The arrays to merge.
 * @returns The merged array.
 */
export declare function arrayMerge<T>(...a: T[][]): T[];
/**
 * Helper functions to perform LINQ-like queries on arrays.
 */
export declare class ArrayUtil<T> {
    private a;
    /**
     * Create a new array helper.
     * @param a The array to help. Can be modified in-place.
     */
    constructor(a: T[]);
    /**
     * The value of this array, after all appropriate alterations.
     */
    get value(): T[];
    /**
     * Groups an array by keys.
     * @param fn The key-finding function.
     * @returns This.
     */
    groupBy<K>(fn: (a: T) => K): GroupedArray<K, T>;
}
/**
 * Helper functions to perform LINQ-like queries on groups (maps).
 */
export declare class GroupedArray<K, T> {
    private val;
    /**
     * Creates a new group helper.
     * @param val The group to help. Can be modified in-place.
     */
    constructor(val: Map<K, T[]>);
    /**
     * Orders the grouping into an array using the provided key order.
     * @param keyOrder The key order.
     * @returns An array helper of the result.
     */
    orderBy(keyOrder: K[]): ArrayUtil<T>;
}

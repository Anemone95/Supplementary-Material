/// <reference types="node" />
import * as child_process from 'child_process';
export declare function exec(command: string, options?: child_process.ExecSyncOptions): Buffer;
/**
 * Executes `command` and returns its value or undefined if the command failed.
 */
export declare function execOrUndefined(command: string, options?: child_process.ExecSyncOptions): string | undefined;
export interface WriteFileOptions {
    /**
     * Whether the generated file should be marked as executable.
     *
     * @default false
     */
    executable?: boolean;
    /**
     * Whether the generated file should be readonly.
     *
     * @default false
     */
    readonly?: boolean;
}
export declare function getFilePermissions(options: WriteFileOptions): string;
export declare function writeFile(filePath: string, data: any, options?: WriteFileOptions): void;
/**
 * Decamelizes the keys of an object structure, recursing through child objects and arrays.
 * @experimental
 */
export interface DecamelizeRecursivelyOptions {
    /**
     * Max depth to recurse before erroring.
     * @default 10
     */
    maxDepth?: number;
    /**
     * Returns true when a key should be decamelized
     * @default - all keys are decamelized
     */
    shouldDecamelize?: (path: string[], value: any) => boolean;
    /**
     * Separator for decamelizing.
     * @default "_"
     */
    separator?: string;
    /**
     * Current path.
     * @internal
     */
    path?: string[];
}
export declare function decamelizeKeysRecursively(input: any, opt?: DecamelizeRecursivelyOptions): any;
/**
 * Returns false if value is unset or a falsey value, and true otherwise.
 * @param value an environment variable
 */
export declare function isTruthy(value: string | undefined): boolean;
/**
 * Type of a map mapping strings to some arbitrary type
 */
export declare type Obj<T> = {
    [key: string]: T;
};
/**
 * Return whether the given value is an object
 *
 * Even though arrays and instances of classes technically are objects, we
 * usually want to treat them differently, so we return false in those cases.
 */
export declare function isObject(x: any): x is Obj<any>;
/**
 * Recursively merge objects together
 *
 * The leftmost object is mutated and returned. Arrays are not merged
 * but overwritten just like scalars.
 *
 * If an object is merged into a non-object, the non-object is lost.
 *
 * `undefined`s will cause a value to be deleted if destructive is enabled.
 */
export declare function deepMerge(objects: Array<Obj<any> | undefined>, destructive?: boolean): Obj<any>;
export declare function dedupArray<T>(array: T[]): T[];
/**
 * Returns a sorted version of `x` or `undefined` if it is an empty array or object.
 */
export declare function sorted<T>(x: T): unknown[] | T | undefined;
export declare function formatAsPythonModule(name: string): string;

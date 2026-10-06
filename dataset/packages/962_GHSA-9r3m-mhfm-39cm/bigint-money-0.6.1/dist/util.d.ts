import { Money } from './money';
export declare const PRECISION_I = 12;
export declare const PRECISION: bigint;
export declare const PRECISION_M: bigint;
export declare enum Round {
    HALF_TO_EVEN = 1,
    BANKERS = 1,
    HALF_AWAY_FROM_0 = 2,
    HALF_TOWARDS_0 = 3,
    TOWARDS_0 = 11,
    TRUNCATE = 11
}
/**
 * This helper function takes a string, number or anything that can
 * be used in the constructor of a Money object, and returns a bigint
 * with adjusted precision.
 */
export declare function moneyValueToBigInt(input: Money | string | number | bigint, round: Round): bigint;
/**
 * This function takes a bigint that was multiplied by PRECISON_M, and returns
 * a human readable string value with a specified precision.
 *
 * Precision is the number of decimals that are returned.
 */
export declare function bigintToFixed(value: bigint, precision: number, round: Round): string;
/**
 * This function takes 2 bigints and divides them.
 *
 * By default ecmascript will round to 0. For example,
 * 5n / 2n yields 2n.
 *
 * This function rounds to the nearest even number, also
 * known as 'bankers rounding'.
 */
export declare function divide(a: bigint, b: bigint, round: Round): bigint;

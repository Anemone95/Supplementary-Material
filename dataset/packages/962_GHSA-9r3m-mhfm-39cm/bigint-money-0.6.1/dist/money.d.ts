import { Round } from './util';
export declare class Money {
    currency: string;
    private value;
    private round;
    constructor(value: number | bigint | string, currency: string, round?: Round);
    /**
     * Return a string representation of the money value.
     *
     * Precision is a number of decimals that was requested. The decimals are
     * always returned, e.g.: new Money(1, 'USD').toFixed(2) returns '1.00'.
     *
     * This function rounds to even, a.k.a. it uses bankers rounding.
     */
    toFixed(precision: number): string;
    add(val: Money | number | string): Money;
    subtract(val: Money | number | string): Money;
    /**
     * Divide the current number with the specified number.
     *
     * This function returns a new Money object with the result.
     */
    divide(val: number | string): Money;
    /**
     * Multiply
     */
    multiply(val: number | string): Money;
    /**
     * Compares this Money object with another value.
     *
     * If the values are equal, 0 is returned.
     * If this object is considered to be lower, -1 is returned.
     * If this object is considered to be higher, 1 is returned.
     */
    compare(val: number | string | Money): -1 | 0 | 1;
    /**
     * Allocate this value to different parts.
     *
     * This is useful in cases no money can be lost when splitting in different
     * parts. For example, when splitting $1 between 3 people, this function will
     * return 3.34, 3.33, 3.33.
     *
     * The remainder of the split will be added round-robin to the results,
     * starting with the first group.
     *
     * The reason precision must be specified, is because under the hood this
     * library uses 12 digits for precision. But when splitting a whole dollar,
     * you might only be interested in cents (precision = 2).
     *
     *
     */
    allocate(parts: number, precision: number): Money[];
    /**
     * Returns the underlying bigint value.
     *
     * This is the current value of the object, multiplied by 10 ** 12.
     */
    toSource(): bigint;
    /**
     * A factory function to construct a Money object a 'source' value.
     *
     * The source value is just the underlying bigint used in the Money
     * class and can be obtained by calling Money.getSource().
     */
    static fromSource(val: bigint, currency: string, round?: Round): Money;
    /**
     * A default output for serializing to JSON
     */
    toJSON(): [string, string];
    /**
     * This function will return a string with all irrelevant 0's removed.
     */
    format(): string;
}

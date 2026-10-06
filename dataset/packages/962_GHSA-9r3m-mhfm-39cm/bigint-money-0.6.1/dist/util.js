"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const money_1 = require("./money");
// How many digits we support
exports.PRECISION_I = 12;
// bigint version. We keep both so there's less conversions.
exports.PRECISION = BigInt(exports.PRECISION_I);
// Multiplication factor for internal values
exports.PRECISION_M = 10n ** exports.PRECISION;
var Round;
(function (Round) {
    // The following rules are round to the nearest integer, but have different
    // rules for when it's right in the middle (.5).
    Round[Round["HALF_TO_EVEN"] = 1] = "HALF_TO_EVEN";
    Round[Round["BANKERS"] = 1] = "BANKERS";
    Round[Round["HALF_AWAY_FROM_0"] = 2] = "HALF_AWAY_FROM_0";
    Round[Round["HALF_TOWARDS_0"] = 3] = "HALF_TOWARDS_0";
    // These cases don't always round to the nearest integer
    Round[Round["TOWARDS_0"] = 11] = "TOWARDS_0";
    Round[Round["TRUNCATE"] = 11] = "TRUNCATE";
})(Round = exports.Round || (exports.Round = {}));
/**
 * This helper function takes a string, number or anything that can
 * be used in the constructor of a Money object, and returns a bigint
 * with adjusted precision.
 */
function moneyValueToBigInt(input, round) {
    if (input instanceof money_1.Money) {
        return input.toSource();
    }
    switch (typeof input) {
        case 'string':
            const parts = input.match(/^(-)?([0-9]*)?(\.([0-9]*))?$/);
            if (!parts) {
                throw new TypeError('Input string must follow the pattern (-)##.## or -##');
            }
            const signPart = parts[1]; // Positive or negative
            const wholePart = parts[2]; // Whole numbers.
            const fracPart = parts[4];
            let output;
            // The whole part
            if (wholePart === undefined) {
                // For numbers like ".04" this part will be undefined.
                output = 0n;
            }
            else {
                output = BigInt(wholePart) * exports.PRECISION_M;
            }
            if (fracPart !== undefined) {
                // The fractional part
                const precisionDifference = (exports.PRECISION - BigInt(fracPart.length));
                if (precisionDifference >= 0) {
                    // Add 0's
                    output += BigInt(fracPart) * 10n ** precisionDifference;
                }
                else {
                    // Remove 0's
                    output += divide(BigInt(fracPart), 10n ** (-precisionDifference), round);
                }
            }
            // negative ?
            if (signPart === '-') {
                output *= -1n;
            }
            return output;
        case 'bigint':
            return input * exports.PRECISION_M;
            break;
        case 'number':
            if (!Number.isSafeInteger(input)) {
                throw new errors_1.UnsafeIntegerError('The number ' + input + ' is not a "safe" integer. It must be converted before passing it');
            }
            return BigInt(input) * exports.PRECISION_M;
            break;
        default:
            throw new TypeError('value must be a safe integer, bigint or string');
    }
}
exports.moneyValueToBigInt = moneyValueToBigInt;
/**
 * This function takes a bigint that was multiplied by PRECISON_M, and returns
 * a human readable string value with a specified precision.
 *
 * Precision is the number of decimals that are returned.
 */
function bigintToFixed(value, precision, round) {
    if (precision === 0) {
        // No decimals were requested.
        return divide(value, exports.PRECISION_M, round).toString();
    }
    const wholePart = (value / exports.PRECISION_M);
    const negative = value < 0;
    let remainder = (value % exports.PRECISION_M);
    if (precision > exports.PRECISION) {
        // More precision was requested than we have, so we multiply
        // to add more 0's
        remainder *= 10n ** (BigInt(precision) - exports.PRECISION);
    }
    else {
        // Less precision was requested, so we round
        remainder = divide(remainder, 10n ** (exports.PRECISION - BigInt(precision)), round);
    }
    if (remainder < 0) {
        remainder *= -1n;
    }
    const remainderStr = remainder.toString().padStart(precision, '0');
    let wholePartStr = wholePart.toString();
    if (wholePartStr === '0' && negative) {
        wholePartStr = '-0';
    }
    return wholePartStr + '.' + remainderStr;
}
exports.bigintToFixed = bigintToFixed;
/**
 * This function takes 2 bigints and divides them.
 *
 * By default ecmascript will round to 0. For example,
 * 5n / 2n yields 2n.
 *
 * This function rounds to the nearest even number, also
 * known as 'bankers rounding'.
 */
function divide(a, b, round) {
    // Get absolute versions. We'll deal with the negatives later.
    const aAbs = a > 0 ? a : -a;
    const bAbs = b > 0 ? b : -b;
    let result = aAbs / bAbs;
    const rem = aAbs % bAbs;
    // if remainder > half divisor
    if (rem * 2n > bAbs) {
        switch (round) {
            case Round.TRUNCATE:
                // do nothing
                break;
            default:
                // We should have rounded up instead of down.
                result++;
                break;
        }
    }
    else if (rem * 2n === bAbs) {
        // If the remainder is exactly half the divisor, it means that the result is
        // exactly in between two numbers and we need to apply a specific rounding
        // method.
        switch (round) {
            case Round.HALF_TO_EVEN:
                // Add 1 if result is odd to get an even return value
                if (result % 2n === 1n) {
                    result++;
                }
                break;
            case Round.HALF_AWAY_FROM_0:
                result++;
                break;
            case Round.TRUNCATE:
            case Round.HALF_TOWARDS_0:
                // Do nothing
                break;
        }
    }
    if (a > 0 !== b > 0) {
        // Either a XOR b is negative
        return -result;
    }
    else {
        return result;
    }
}
exports.divide = divide;
//# sourceMappingURL=util.js.map
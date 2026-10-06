"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rules_1 = require("./rules");
/**
 *
 * @param x
 *
 * Makes sure that a certain field is a rule.
 *
 */
function isRule(x) {
    return x instanceof rules_1.Rule;
}
exports.isRule = isRule;
/**
 *
 * @param x
 *
 * Makes sure that a certain field is a logic rule.
 *
 */
function isLogicRule(x) {
    return x instanceof rules_1.LogicRule;
}
exports.isLogicRule = isLogicRule;
/**
 *
 * @param x
 *
 * Makes sure that a certain field is a rule or a logic rule.
 *
 */
function isRuleFunction(x) {
    return isRule(x) || isLogicRule(x);
}
exports.isRuleFunction = isRuleFunction;
/**
 *
 * @param x
 *
 * Determines whether a certain field is rule field map or not.
 *
 */
function isRuleFieldMap(x) {
    return (typeof x === 'object' &&
        Object.values(x).every(rule => isRuleFunction(rule)));
}
exports.isRuleFieldMap = isRuleFieldMap;
/**
 *
 * @param obj
 * @param func
 *
 * Flattens object of particular type by checking if the leaf
 * evaluates to true from particular function.
 *
 */
function flattenObjectOf(obj, func) {
    const values = Object.keys(obj).reduce((acc, key) => {
        if (func(obj[key])) {
            return [...acc, obj[key]];
        }
        else if (typeof obj[key] === 'object' && !func(obj[key])) {
            return [...acc, ...flattenObjectOf(obj[key], func)];
        }
        else {
            return acc;
        }
    }, []);
    return values;
}
exports.flattenObjectOf = flattenObjectOf;
/**
 *
 * Returns fallback is provided value is undefined
 *
 * @param fallback
 */
function withDefault(fallback) {
    return value => {
        if (value === undefined)
            return fallback;
        return value;
    };
}
exports.withDefault = withDefault;
//# sourceMappingURL=utils.js.map
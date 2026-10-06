"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class Rule {
    constructor(name, func, constructorOptions) {
        const options = this.normalizeOptions(constructorOptions);
        this.name = name;
        this.func = func;
        this.cache = options.cache;
        this.fragment = options.fragment;
    }
    /**
     *
     * @param parent
     * @param args
     * @param ctx
     * @param info
     *
     * Resolves rule and writes to cache its result.
     *
     */
    async resolve(parent, args, ctx, info, options) {
        try {
            // Cache
            const cacheKey = this.generateCacheKey(parent, args, ctx, info);
            if (!ctx._shield.cache[cacheKey]) {
                ctx._shield.cache[cacheKey] = this.func(parent, args, ctx, info);
            }
            // Resolve
            const res = await ctx._shield.cache[cacheKey];
            if (res instanceof Error) {
                return res;
            }
            else if (typeof res === 'string') {
                return new Error(res);
            }
            else if (res === true) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (err) {
            if (options.debug) {
                throw err;
            }
            else {
                return false;
            }
        }
    }
    /**
     *
     * @param rule
     *
     * Compares a given rule with the current one
     * and checks whether their functions are equal.
     *
     */
    equals(rule) {
        return this.func === rule.func;
    }
    /**
     *
     * Extracts fragment from the rule.
     *
     */
    extractFragment() {
        return this.fragment;
    }
    /**
     *
     * @param options
     *
     * Sets default values for options.
     *
     */
    normalizeOptions(options) {
        return {
            cache: options.cache !== undefined
                ? this.normalizeCacheOption(options.cache)
                : 'strict',
            fragment: options.fragment !== undefined ? options.fragment : undefined,
        };
    }
    /**
     *
     * @param cache
     *
     * This ensures backward capability of shield.
     *
     */
    normalizeCacheOption(cache) {
        switch (cache) {
            case true: {
                return 'strict';
            }
            case false: {
                return 'no_cache';
            }
            default: {
                return cache;
            }
        }
    }
    /**
     *
     * @param parent
     * @param args
     * @param ctx
     * @param info
     *
     * Generates cache key based on cache option.
     *
     */
    generateCacheKey(parent, args, ctx, info) {
        if (typeof this.cache === 'function') {
            return `${this.name}-${this.cache(parent, args, ctx, info)}`;
        }
        switch (this.cache) {
            case 'strict': {
                const key = ctx._shield.hashFunction({ parent, args });
                return `${this.name}-${key}`;
            }
            case 'contextual': {
                return this.name;
            }
            case 'no_cache': {
                return `${this.name}-${Math.random()}`;
            }
        }
    }
}
exports.Rule = Rule;
class InputRule extends Rule {
    constructor(name, schema) {
        const validationFunction = (parent, args) => schema
            .validate(args)
            .then(() => true)
            .catch(err => err);
        super(name, validationFunction, { cache: 'strict', fragment: undefined });
    }
}
exports.InputRule = InputRule;
class LogicRule {
    constructor(rules) {
        this.rules = rules;
    }
    /**
     *
     * @param parent
     * @param args
     * @param ctx
     * @param info
     *
     * By default logic rule resolves to false.
     *
     */
    async resolve(parent, args, ctx, info, options) {
        return false;
    }
    /**
     *
     * @param parent
     * @param args
     * @param ctx
     * @param info
     *
     * Evaluates all the rules.
     *
     */
    async evaluate(parent, args, ctx, info, options) {
        const rules = this.getRules();
        const tasks = rules.map(rule => rule.resolve(parent, args, ctx, info, options));
        return Promise.all(tasks);
    }
    /**
     *
     * Returns rules in a logic rule.
     *
     */
    getRules() {
        return this.rules;
    }
    extractFragments() {
        const fragments = this.rules.reduce((fragments, rule) => {
            if (utils_1.isLogicRule(rule)) {
                return fragments.concat(...rule.extractFragments());
            }
            if (rule.extractFragment()) {
                return fragments.concat(rule.extractFragment());
            }
            return fragments;
        }, []);
        return fragments;
    }
}
exports.LogicRule = LogicRule;
// Extended Types
class RuleOr extends LogicRule {
    constructor(rules) {
        super(rules);
    }
    /**
     *
     * @param parent
     * @param args
     * @param ctx
     * @param info
     *
     * Makes sure that at least one of them has evaluated to true.
     *
     */
    async resolve(parent, args, ctx, info, options) {
        const result = await this.evaluate(parent, args, ctx, info, options);
        if (result.every(res => res !== true)) {
            const customError = result.find(res => res instanceof Error);
            return customError || false;
        }
        else {
            return true;
        }
    }
}
exports.RuleOr = RuleOr;
class RuleAnd extends LogicRule {
    constructor(rules) {
        super(rules);
    }
    /**
     *
     * @param parent
     * @param args
     * @param ctx
     * @param info
     *
     * Makes sure that all of them have resolved to true.
     *
     */
    async resolve(parent, args, ctx, info, options) {
        const result = await this.evaluate(parent, args, ctx, info, options);
        if (result.some(res => res !== true)) {
            const customError = result.find(res => res instanceof Error);
            return customError || false;
        }
        else {
            return true;
        }
    }
}
exports.RuleAnd = RuleAnd;
class RuleChain extends LogicRule {
    constructor(rules) {
        super(rules);
    }
    /**
     *
     * @param parent
     * @param args
     * @param ctx
     * @param info
     *
     * Makes sure that all of them have resolved to true.
     *
     */
    async resolve(parent, args, ctx, info, options) {
        const result = await this.evaluate(parent, args, ctx, info, options);
        if (result.some(res => res !== true)) {
            const customError = result.find(res => res instanceof Error);
            return customError || false;
        }
        else {
            return true;
        }
    }
    /**
     *
     * @param parent
     * @param args
     * @param ctx
     * @param info
     *
     * Evaluates all the rules.
     *
     */
    async evaluate(parent, args, ctx, info, options) {
        const rules = this.getRules();
        const tasks = rules.reduce((acc, rule) => acc.then(res => {
            if (res.some(r => r !== true)) {
                return res;
            }
            else {
                return rule
                    .resolve(parent, args, ctx, info, options)
                    .then(task => res.concat(task));
            }
        }), Promise.resolve([]));
        return tasks;
    }
}
exports.RuleChain = RuleChain;
class RuleNot extends LogicRule {
    constructor(rule) {
        super([rule]);
    }
    /**
     *
     * @param parent
     * @param args
     * @param ctx
     * @param info
     *
     * Negates the result.
     *
     */
    async resolve(parent, args, ctx, info, options) {
        const [res] = await this.evaluate(parent, args, ctx, info, options);
        if (res !== true) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.RuleNot = RuleNot;
class RuleTrue extends LogicRule {
    constructor() {
        super([]);
    }
    /**
     *
     * Always true.
     *
     */
    async resolve() {
        return true;
    }
}
exports.RuleTrue = RuleTrue;
class RuleFalse extends LogicRule {
    constructor() {
        super([]);
    }
    /**
     *
     * Always false.
     *
     */
    async resolve() {
        return false;
    }
}
exports.RuleFalse = RuleFalse;
//# sourceMappingURL=rules.js.map
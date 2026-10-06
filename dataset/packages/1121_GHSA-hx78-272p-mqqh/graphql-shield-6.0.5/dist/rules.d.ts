import * as Yup from 'yup';
import { IRule, IFragment, IRuleConstructorOptions, ILogicRule, ShieldRule, IRuleResult, IOptions, IShieldContext } from './types';
export declare class Rule implements IRule {
    readonly name: string;
    private cache;
    private fragment;
    private func;
    constructor(name: string, func: any, constructorOptions: IRuleConstructorOptions);
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
    resolve(parent: any, args: any, ctx: IShieldContext, info: any, options: IOptions): Promise<IRuleResult>;
    /**
     *
     * @param rule
     *
     * Compares a given rule with the current one
     * and checks whether their functions are equal.
     *
     */
    equals(rule: Rule): boolean;
    /**
     *
     * Extracts fragment from the rule.
     *
     */
    extractFragment(): IFragment;
    /**
     *
     * @param options
     *
     * Sets default values for options.
     *
     */
    private normalizeOptions;
    /**
     *
     * @param cache
     *
     * This ensures backward capability of shield.
     *
     */
    private normalizeCacheOption;
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
    private generateCacheKey;
}
export declare class InputRule<Schema> extends Rule {
    constructor(name: string, schema: Yup.Schema<Schema>);
}
export declare class LogicRule implements ILogicRule {
    private rules;
    constructor(rules: ShieldRule[]);
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
    resolve(parent: any, args: any, ctx: any, info: any, options: IOptions): Promise<IRuleResult>;
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
    evaluate(parent: any, args: any, ctx: any, info: any, options: IOptions): Promise<IRuleResult[]>;
    /**
     *
     * Returns rules in a logic rule.
     *
     */
    getRules(): ShieldRule[];
    extractFragments(): IFragment[];
}
export declare class RuleOr extends LogicRule {
    constructor(rules: ShieldRule[]);
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
    resolve(parent: any, args: any, ctx: any, info: any, options: IOptions): Promise<IRuleResult>;
}
export declare class RuleAnd extends LogicRule {
    constructor(rules: ShieldRule[]);
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
    resolve(parent: any, args: any, ctx: any, info: any, options: IOptions): Promise<IRuleResult>;
}
export declare class RuleChain extends LogicRule {
    constructor(rules: ShieldRule[]);
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
    resolve(parent: any, args: any, ctx: any, info: any, options: IOptions): Promise<IRuleResult>;
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
    evaluate(parent: any, args: any, ctx: any, info: any, options: IOptions): Promise<IRuleResult[]>;
}
export declare class RuleNot extends LogicRule {
    constructor(rule: ShieldRule);
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
    resolve(parent: any, args: any, ctx: any, info: any, options: IOptions): Promise<IRuleResult>;
}
export declare class RuleTrue extends LogicRule {
    constructor();
    /**
     *
     * Always true.
     *
     */
    resolve(): Promise<IRuleResult>;
}
export declare class RuleFalse extends LogicRule {
    constructor();
    /**
     *
     * Always false.
     *
     */
    resolve(): Promise<IRuleResult>;
}

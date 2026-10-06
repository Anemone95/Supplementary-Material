import { State } from "./PushRuleVectorState";
import { IExtendedPushRule, IRuleSets } from "./types";
export interface IContentRules {
    vectorState: State;
    rules: IExtendedPushRule[];
    externalRules: IExtendedPushRule[];
}
export declare const SCOPE = "global";
export declare const KIND = "content";
export declare class ContentRules {
    /**
     * Extract the keyword rules from a list of rules, and parse them
     * into a form which is useful for Vector's UI.
     *
     * Returns an object containing:
     *   rules: the primary list of keyword rules
     *   vectorState: a PushRuleVectorState indicating whether those rules are
     *      OFF/ON/LOUD
     *   externalRules: a list of other keyword rules, with states other than
     *      vectorState
     */
    static parseContentRules(rulesets: IRuleSets): IContentRules;
    static _categoriseContentRules(rulesets: IRuleSets): Record<"other" | "on" | "loud" | "on_but_disabled" | "loud_but_disabled", IExtendedPushRule[]>;
}

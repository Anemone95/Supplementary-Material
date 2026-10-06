import { IPushRule } from "./types";
export declare enum State {
    /** The push rule is disabled */
    Off = "off",
    /** The user will receive push notification for this rule */
    On = "on",
    /** The user will receive push notification for this rule with sound and
     highlight if this is legitimate */
    Loud = "loud"
}
export declare class PushRuleVectorState {
    static OFF: State;
    static ON: State;
    static LOUD: State;
    /**
     * Enum for state of a push rule as defined by the Vector UI.
     * @readonly
     * @enum {string}
     */
    static states: typeof State;
    /**
     * Convert a PushRuleVectorState to a list of actions
     *
     * @return [object] list of push-rule actions
     */
    static actionsFor(pushRuleVectorState: State): import("./types").Action[];
    /**
     * Convert a pushrule's actions to a PushRuleVectorState.
     *
     * Determines whether a content rule is in the PushRuleVectorState.ON
     * category or in PushRuleVectorState.LOUD, regardless of its enabled
     * state. Returns null if it does not match these categories.
     */
    static contentRuleVectorStateKind(rule: IPushRule): State;
}

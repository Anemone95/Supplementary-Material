export declare type Effect<TOptions extends {
    [key: string]: any;
}> = {
    /**
     * one or more emojis that will trigger this effect
     */
    emojis: Array<string>;
    /**
     * the matrix message type that will trigger this effect
     */
    msgType: string;
    /**
     * the room command to trigger this effect
     */
    command: string;
    /**
     * a function that returns the translated description of the effect
     */
    description: () => string;
    /**
     * a function that returns the translated fallback message. this message will be shown if the user did not provide a custom message
     */
    fallbackMessage: () => string;
    /**
     * animation options
     */
    options: TOptions;
};
/**
 * This configuration defines room effects that can be triggered by custom message types and emojis
 */
export declare const CHAT_EFFECTS: Array<Effect<{
    [key: string]: any;
}>>;

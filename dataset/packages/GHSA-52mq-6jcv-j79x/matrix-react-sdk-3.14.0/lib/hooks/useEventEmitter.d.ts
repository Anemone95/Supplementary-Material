import type { EventEmitter } from "events";
declare type Handler = (...args: any[]) => void;
export declare const useEventEmitter: (emitter: EventEmitter, eventName: string | symbol, handler: Handler) => void;
export {};

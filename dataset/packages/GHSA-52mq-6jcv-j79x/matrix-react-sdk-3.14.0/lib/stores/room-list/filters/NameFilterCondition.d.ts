/// <reference types="node" />
import { Room } from "matrix-js-sdk/src/models/room";
import { FilterPriority, IFilterCondition } from "./IFilterCondition";
import { EventEmitter } from "events";
/**
 * A filter condition for the room list which reveals rooms of a particular
 * name, or associated name (like a room alias).
 */
export declare class NameFilterCondition extends EventEmitter implements IFilterCondition {
    private _search;
    constructor();
    get relativePriority(): FilterPriority;
    get search(): string;
    set search(val: string);
    private callUpdate;
    isVisible(room: Room): boolean;
    matches(val: string): boolean;
}

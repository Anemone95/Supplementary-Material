import { MatrixClient } from "matrix-js-sdk/src/client";
import { TagID } from "./models";
import { Room } from "matrix-js-sdk/src/models/room";
import { ITagMap, ListAlgorithm, SortAlgorithm } from "./algorithms/models";
import { ActionPayload } from "../../dispatcher/payloads";
import { IFilterCondition } from "./filters/IFilterCondition";
import { AsyncStoreWithClient } from "../AsyncStoreWithClient";
import { NameFilterCondition } from "./filters/NameFilterCondition";
interface IState {
    tagsEnabled?: boolean;
}
/**
 * The event/channel which is called when the room lists have been changed. Raised
 * with one argument: the instance of the store.
 */
export declare const LISTS_UPDATE_EVENT = "lists_update";
export declare class RoomListStoreClass extends AsyncStoreWithClient<IState> {
    /**
     * Set to true if you're running tests on the store. Should not be touched in
     * any other environment.
     */
    static TEST_MODE: boolean;
    private initialListsGenerated;
    private algorithm;
    private filterConditions;
    private tagWatcher;
    private updateFn;
    private readonly watchedSettings;
    constructor();
    get unfilteredLists(): ITagMap;
    get orderedLists(): ITagMap;
    resetStore(): Promise<void>;
    makeReady(forcedClient?: MatrixClient): Promise<void>;
    private checkLoggingEnabled;
    private readAndCacheSettingsFromStore;
    /**
     * Handles suspected RoomViewStore changes.
     * @param trigger Set to false to prevent a list update from being sent. Should only
     * be used if the calling code will manually trigger the update.
     */
    private handleRVSUpdate;
    protected onReady(): Promise<any>;
    protected onNotReady(): Promise<any>;
    protected onAction(payload: ActionPayload): Promise<void>;
    protected onDispatchAsync(payload: ActionPayload): Promise<void>;
    private handleRoomUpdate;
    setTagSorting(tagId: TagID, sort: SortAlgorithm): Promise<void>;
    private setAndPersistTagSorting;
    getTagSorting(tagId: TagID): SortAlgorithm;
    private getStoredTagSorting;
    private calculateTagSorting;
    setListOrder(tagId: TagID, order: ListAlgorithm): Promise<void>;
    private setAndPersistListOrder;
    getListOrder(tagId: TagID): ListAlgorithm;
    private getStoredListOrder;
    private calculateListOrder;
    private updateAlgorithmInstances;
    private onAlgorithmListUpdated;
    private onAlgorithmFilterUpdated;
    /**
     * Regenerates the room whole room list, discarding any previous results.
     *
     * Note: This is only exposed externally for the tests. Do not call this from within
     * the app.
     * @param trigger Set to false to prevent a list update from being sent. Should only
     * be used if the calling code will manually trigger the update.
     */
    regenerateAllLists({ trigger }: {
        trigger?: boolean;
    }): Promise<void>;
    addFilter(filter: IFilterCondition): void;
    removeFilter(filter: IFilterCondition): void;
    /**
     * Gets the first (and ideally only) name filter condition. If one isn't present,
     * this returns null.
     * @returns The first name filter condition, or null if none.
     */
    getFirstNameFilterCondition(): NameFilterCondition | null;
    /**
     * Gets the tags for a room identified by the store. The returned set
     * should never be empty, and will contain DefaultTagID.Untagged if
     * the store is not aware of any tags.
     * @param room The room to get the tags for.
     * @returns The tags for the room.
     */
    getTagsForRoom(room: Room): TagID[];
}
export default class RoomListStore {
    private static internalInstance;
    static get instance(): RoomListStoreClass;
}
export {};

import { RoomListStoreClass } from "./RoomListStore";
/**
 * Watches for changes in spaces to manage the filter on the provided RoomListStore
 */
export declare class SpaceWatcher {
    private store;
    private filter;
    private activeSpace;
    constructor(store: RoomListStoreClass);
    private onSelectedSpaceUpdated;
    private updateFilter;
}

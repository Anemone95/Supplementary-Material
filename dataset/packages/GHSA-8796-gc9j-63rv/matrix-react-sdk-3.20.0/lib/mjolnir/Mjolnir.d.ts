import { BanList } from "./BanList";
export declare class Mjolnir {
    static _instance: Mjolnir;
    _lists: BanList[];
    _roomIds: string[];
    _mjolnirWatchRef: any;
    _dispatcherRef: any;
    constructor();
    get roomIds(): string[];
    get lists(): BanList[];
    start(): void;
    _onAction: (payload: any) => void;
    setup(): void;
    stop(): void;
    getOrCreatePersonalList(): Promise<BanList>;
    getPersonalList(): BanList;
    subscribeToList(roomId: string): Promise<void>;
    unsubscribeFromList(roomId: string): Promise<void>;
    _onEvent: (event: any) => void;
    _onListsChanged(settingName: any, roomId: any, atLevel: any, newValue: any): void;
    _updateLists(listRoomIds: string[]): void;
    isServerBanned(serverName: string): boolean;
    isUserBanned(userId: string): boolean;
    static sharedInstance(): Mjolnir;
}

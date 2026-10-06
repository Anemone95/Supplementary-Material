import { Room } from "matrix-js-sdk/src/models/room";
import { AsyncStoreWithClient } from "./AsyncStoreWithClient";
import { ActionPayload } from "../dispatcher/payloads";
import { SpaceNotificationState } from "./notifications/SpaceNotificationState";
import { ISpaceSummaryEvent, ISpaceSummaryRoom } from "../components/structures/SpaceRoomDirectory";
declare type SpaceKey = string | symbol;
interface IState {
}
export declare const HOME_SPACE: unique symbol;
export declare const SUGGESTED_ROOMS: unique symbol;
export declare const UPDATE_TOP_LEVEL_SPACES: unique symbol;
export declare const UPDATE_INVITED_SPACES: unique symbol;
export declare const UPDATE_SELECTED_SPACE: unique symbol;
export declare class SpaceStoreClass extends AsyncStoreWithClient<IState> {
    constructor();
    private rootSpaces;
    private orphanedRooms;
    private parentMap;
    private notificationStateMap;
    private spaceFilteredRooms;
    private _activeSpace?;
    private _suggestedRooms;
    private _invitedSpaces;
    get invitedSpaces(): Room[];
    get spacePanelSpaces(): Room[];
    get activeSpace(): Room | null;
    get suggestedRooms(): ISpaceSummaryRoom[];
    setActiveSpace(space: Room | null, contextSwitch?: boolean): Promise<void>;
    fetchSuggestedRooms: (space: any, limit?: number) => Promise<{
        rooms: ISpaceSummaryRoom[];
        events: ISpaceSummaryEvent[];
    }>;
    addRoomToSpace(space: Room, roomId: string, via: string[], suggested?: boolean, autoJoin?: boolean): any;
    private getChildren;
    getChildRooms(spaceId: string): Room[];
    getChildSpaces(spaceId: string): Room[];
    getParents(roomId: string, canonicalOnly?: boolean): Room[];
    getCanonicalParent(roomId: string): Room | null;
    getSpaceFilteredRoomIds: (space: Room | null) => Set<string>;
    private rebuild;
    onSpaceUpdate: () => void;
    private showInHomeSpace;
    private onRoomUpdate;
    private onSpaceMembersChange;
    private onRoomsUpdate;
    private onRoom;
    private onRoomState;
    private onRoomAccountData;
    private onAccountData;
    protected reset(): Promise<void>;
    protected onNotReady(): Promise<void>;
    protected onReady(): Promise<void>;
    protected onAction(payload: ActionPayload): Promise<void>;
    getNotificationState(key: SpaceKey): SpaceNotificationState;
    traverseSpace(spaceId: string, fn: (roomId: string) => void, includeRooms?: boolean, parentPath?: Set<string>): void;
}
export default class SpaceStore {
    private static internalInstance;
    static get instance(): SpaceStoreClass;
}
export {};

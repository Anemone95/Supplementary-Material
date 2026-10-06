import { GenericEchoChamber } from "./GenericEchoChamber";
import { RoomEchoContext } from "./RoomEchoContext";
import { Volume } from "../../RoomNotifsTypes";
export declare type CachedRoomValues = Volume;
export declare enum CachedRoomKey {
    NotificationVolume = 0
}
export declare class RoomEchoChamber extends GenericEchoChamber<RoomEchoContext, CachedRoomKey, CachedRoomValues> {
    private properties;
    constructor(context: RoomEchoContext);
    protected onClientChanged(oldClient: any, newClient: any): void;
    private onAccountData;
    private updateNotificationVolume;
    get notificationVolume(): Volume;
    set notificationVolume(v: Volume);
}

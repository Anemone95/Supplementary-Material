import { Room } from "matrix-js-sdk/src/models/room";
import { NotificationState } from "./NotificationState";
import { FetchRoomFn } from "./ListNotificationState";
export declare class SpaceNotificationState extends NotificationState {
    private spaceId;
    private getRoomFn;
    private rooms;
    private states;
    constructor(spaceId: string | symbol, getRoomFn: FetchRoomFn);
    get symbol(): string;
    setRooms(rooms: Room[]): void;
    destroy(): void;
    private onRoomNotificationStateUpdate;
    private calculateTotalState;
}

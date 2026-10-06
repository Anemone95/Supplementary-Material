import { Room } from "matrix-js-sdk/src/models/room";
export declare class VisibilityProvider {
    private static internalInstance;
    private constructor();
    static get instance(): VisibilityProvider;
    isRoomVisible(room: Room): boolean;
}

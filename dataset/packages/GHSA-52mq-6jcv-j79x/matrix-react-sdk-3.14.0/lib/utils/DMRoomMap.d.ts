import { Room } from "matrix-js-sdk/src/models/room";
/**
 * Class that takes a Matrix Client and flips the m.direct map
 * so the operation of mapping a room ID to which user it's a DM
 * with can be performed efficiently.
 *
 * With 'start', this can also keep itself up to date over time.
 */
export default class DMRoomMap {
    private static sharedInstance;
    private matrixClient;
    private roomToUser;
    private userToRooms;
    private hasSentOutPatchDirectAccountDataPatch;
    private mDirectEvent;
    constructor(matrixClient: any);
    /**
     * Makes and returns a new shared instance that can then be accessed
     * with shared(). This returned instance is not automatically started.
     */
    static makeShared(): DMRoomMap;
    /**
     * Returns a shared instance of the class
     * that uses the singleton matrix client
     * The shared instance must be started before use.
     */
    static shared(): DMRoomMap;
    start(): void;
    stop(): void;
    private onAccountData;
    /**
     * some client bug somewhere is causing some DMs to be marked
     * with ourself, not the other user. Fix it by guessing the other user and
     * modifying userToRooms
     */
    private patchUpSelfDMs;
    getDMRoomsForUserId(userId: any): string[];
    /**
     * Gets the DM room which the given IDs share, if any.
     * @param {string[]} ids The identifiers (user IDs and email addresses) to look for.
     * @returns {Room} The DM room which all IDs given share, or falsey if no common room.
     */
    getDMRoomForIdentifiers(ids: string[]): Room;
    getUserIdForRoomId(roomId: string): any;
    getUniqueRoomsWithIndividuals(): {
        [userId: string]: Room;
    };
    private getUserToRooms;
    private populateRoomToUser;
}

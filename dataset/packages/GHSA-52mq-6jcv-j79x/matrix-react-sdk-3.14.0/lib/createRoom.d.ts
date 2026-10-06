import { MatrixClient } from "matrix-js-sdk/src/client";
import { Room } from "matrix-js-sdk/src/models/room";
declare enum Visibility {
    Public = "public",
    Private = "private"
}
declare enum Preset {
    PrivateChat = "private_chat",
    TrustedPrivateChat = "trusted_private_chat",
    PublicChat = "public_chat"
}
interface Invite3PID {
    id_server: string;
    id_access_token?: string;
    medium: string;
    address: string;
}
interface IStateEvent {
    type: string;
    state_key?: string;
    content: object;
}
interface ICreateOpts {
    visibility?: Visibility;
    room_alias_name?: string;
    name?: string;
    topic?: string;
    invite?: string[];
    invite_3pid?: Invite3PID[];
    room_version?: string;
    creation_content?: object;
    initial_state?: IStateEvent[];
    preset?: Preset;
    is_direct?: boolean;
    power_level_content_override?: object;
}
interface IOpts {
    dmUserId?: string;
    createOpts?: ICreateOpts;
    spinner?: boolean;
    guestAccess?: boolean;
    encryption?: boolean;
    inlineErrors?: boolean;
    andView?: boolean;
    associatedWithCommunity?: string;
}
/**
 * Create a new room, and switch to it.
 *
 * @param {object=} opts parameters for creating the room
 * @param {string=} opts.dmUserId If specified, make this a DM room for this user and invite them
 * @param {object=} opts.createOpts set of options to pass to createRoom call.
 * @param {bool=} opts.spinner True to show a modal spinner while the room is created.
 *     Default: True
 * @param {bool=} opts.guestAccess Whether to enable guest access.
 *     Default: True
 * @param {bool=} opts.encryption Whether to enable encryption.
 *     Default: False
 * @param {bool=} opts.inlineErrors True to raise errors off the promise instead of resolving to null.
 *     Default: False
 * @param {bool=} opts.andView True to dispatch an action to view the room once it has been created.
 *
 * @returns {Promise} which resolves to the room id, or null if the
 * action was aborted or failed.
 */
export default function createRoom(opts: IOpts): Promise<string | null>;
export declare function findDMForUser(client: MatrixClient, userId: string): Room;
export declare function _waitForMember(client: MatrixClient, roomId: string, userId: string, opts?: {
    timeout: number;
}): Promise<unknown>;
export declare function canEncryptToAllUsers(client: MatrixClient, userIds: string[]): Promise<boolean>;
export declare function ensureDMExists(client: MatrixClient, userId: string): Promise<string>;
export declare function privateShouldBeEncrypted(): boolean;
export {};

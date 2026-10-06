/// <reference types="node" />
import { UserMembership, UserProfile } from "./membership-cache";
import { unstable } from "../errors";
import BridgeErrorReason = unstable.BridgeErrorReason;
import { ClientEncryptionSession } from "./encryption";
import { ReadStream } from "fs";
export declare type IntentBackingStore = {
    getMembership: (roomId: string, userId: string) => UserMembership;
    getMemberProfile: (roomId: string, userid: string) => UserProfile;
    getPowerLevelContent: (roomId: string) => Record<string, unknown> | undefined;
    setMembership: (roomId: string, userId: string, membership: UserMembership, profile: UserProfile) => void;
    setPowerLevelContent: (roomId: string, content: Record<string, unknown>) => void;
};
export interface IntentOpts {
    backingStore?: IntentBackingStore;
    caching?: {
        ttl?: number;
        size?: number;
    };
    dontCheckPowerLevel?: boolean;
    dontJoin?: boolean;
    enablePresence?: boolean;
    registered?: boolean;
    encryption?: {
        sessionPromise: Promise<ClientEncryptionSession | null>;
        sessionCreatedCallback: (session: ClientEncryptionSession) => Promise<void>;
        ensureClientSyncingCallback: () => Promise<void>;
    };
}
export interface RoomCreationOpts {
    createAsClient?: boolean;
    options: Record<string, unknown>;
}
export interface FileUploadOpts {
    name?: string;
    includeFilename?: boolean;
    type?: string;
}
export declare const APPSERVICE_REGISTER_TYPE = "m.login.application_service";
export declare type PowerLevelContent = {
    state_default?: unknown;
    events_default?: unknown;
    users_default?: unknown;
    users?: {
        [userId: string]: unknown;
    };
    events?: {
        [eventType: string]: unknown;
    };
};
declare type UserProfileKeys = "avatar_url" | "displayname" | null;
export declare class Intent {
    readonly client: any;
    private readonly botClient;
    private _requestCaches;
    private opts;
    private readonly _membershipStates;
    private readonly _powerLevels;
    private readonly encryptedRooms;
    private readonly encryption?;
    private readyPromise?;
    /**
    * Create an entity which can fulfil the intent of a given user.
    * @constructor
    * @param client The matrix client instance whose intent is being
    * fulfilled e.g. the entity joining the room when you call intent.join(roomId).
    * @param botClient The client instance for the AS bot itself.
    * This will be used to perform more priveleged actions such as creating new
    * rooms, sending invites, etc.
    * @param opts Options for this Intent instance.
    * @param opts.registered True to inform this instance that the client
    * is already registered. No registration requests will be made from this Intent.
    * Default: false.
    * @param opts.dontCheckPowerLevel True to not check for the right power
    * level before sending events. Default: false.
    *
    * @param opts.backingStore An object with 4 functions, outlined below.
    * If this Object is supplied, ALL 4 functions must be supplied. If this Object
    * is not supplied, the Intent will maintain its own backing store for membership
    * and power levels, which may scale badly for lots of users.
    *
    * @param opts.backingStore.getMembership A function which is called with a
    * room ID and user ID which should return the membership status of this user as
    * a string e.g "join". `null` should be returned if the membership is unknown.
    *
    * @param opts.backingStore.getPowerLevelContent A function which is called
    * with a room ID which should return the power level content for this room, as an Object.
    * `null` should be returned if there is no known content.
    *
    * @param opts.backingStore.setMembership A function with the signature:
    * function(roomId, userId, membership) which will set the membership of the given user in
    * the given room. This has no return value.
    *
    * @param opts.backingStore.setPowerLevelContent A function with the signature:
    * function(roomId, content) which will set the power level content in the given room.
    * This has no return value.
    *
    * @param opts.dontJoin True to not attempt to join a room before
    * sending messages into it. The surrounding code will have to ensure the correct
    * membership state itself in this case. Default: false.
    *
    * @param opts.enablePresence True to send presence, false to no-op.
    *
    * @param opts.caching.ttl How long requests can stay in the cache, in milliseconds.
    * @param opts.caching.size How many entries should be kept in the cache, before the oldest is dropped.
    */
    constructor(client: any, botClient: any, opts?: IntentOpts);
    /**
     * Return the client this Intent is acting on behalf of.
     * @return The client
     */
    getClient(): any;
    get userId(): string;
    /**
     * Resolve a roomId or alias into a roomId. If a roomId is given, it is immediately returned.
     * @param roomAliasOrId A roomId or alias to resolve.
     * @throws If the provided string was incorrectly formatted or alias does not exist.
     */
    resolveRoom(roomAliasOrId: string): Promise<string>;
    /**
     * <p>Send a plaintext message to a room.</p>
     * This will automatically make the client join the room so they can send the
     * message if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param text The text string to send.
     */
    sendText(roomId: string, text: string): Promise<{
        event_id: string;
    }>;
    /**
     * <p>Set the name of a room.</p>
     * This will automatically make the client join the room so they can set the
     * name if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param name The room name.
     */
    setRoomName(roomId: string, name: string): Promise<{
        event_id: string;
    }>;
    /**
     * <p>Set the topic of a room.</p>
     * This will automatically make the client join the room so they can set the
     * topic if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param topic The room topic.
     */
    setRoomTopic(roomId: string, topic: string): Promise<{
        event_id: string;
    }>;
    /**
     * <p>Set the avatar of a room.</p>
     * This will automatically make the client join the room so they can set the
     * topic if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param avatar The url of the avatar.
     * @param info Extra information about the image. See m.room.avatar for details.
     */
    setRoomAvatar(roomId: string, avatar: string, info?: string): Promise<{
        event_id: string;
    }>;
    /**
     * <p>Send a typing event to a room.</p>
     * This will automatically make the client join the room so they can send the
     * typing event if they are not already joined.
     * @param roomId The room to send to.
     * @param isTyping True if typing
     */
    sendTyping(roomId: string, isTyping: boolean): Promise<any>;
    /**
     * <p>Send a read receipt to a room.</p>
     * This will automatically make the client join the room so they can send the
     * receipt event if they are not already joined.
     * @param roomId The room to send to.
     * @param eventId The event ID to set the receipt mark to.
     */
    sendReadReceipt(roomId: string, eventId: string): Promise<any>;
    /**
     * Set the power level of the given target.
     * @param roomId The room to set the power level in.
     * @param target The target user ID
     * @param level The desired level. Undefined will remove the users custom power level.
     */
    setPowerLevel(roomId: string, target: string, level: number | undefined): Promise<any>;
    /**
     * <p>Send an <code>m.room.message</code> event to a room.</p>
     * This will automatically make the client join the room so they can send the
     * message if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param content The event content
     */
    sendMessage(roomId: string, content: Record<string, unknown>): Promise<{
        event_id: string;
    }>;
    /**
     * <p>Send a message event to a room.</p>
     * This will automatically make the client join the room so they can send the
     * message if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param type The event type
     * @param content The event content
     */
    sendEvent(roomId: string, type: string, content: Record<string, unknown>): Promise<{
        event_id: string;
    }>;
    /**
     * <p>Send a state event to a room.</p>
     * This will automatically make the client join the room so they can send the
     * state if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param type The event type
     * @param skey The state key
     * @param content The event content
     */
    sendStateEvent(roomId: string, type: string, skey: string, content: Record<string, unknown>): Promise<{
        event_id: string;
    }>;
    /**
     * <p>Get the current room state for a room.</p>
     * This will automatically make the client join the room so they can get the
     * state if they are not already joined.
     * @param roomId The room to get the state from.
     * @param useCache Should the request attempt to lookup
     * state from the cache.
     */
    roomState(roomId: string, useCache?: boolean): Promise<any>;
    /**
     * Create a room with a set of options.
     * @param opts Options.
     * @param opts.createAsClient True to create this room as a client and
     * not the bot: the bot will not join. False to create this room as the bot and
     * auto-join the client. Default: false.
     * @param opts.options Options to pass to the client SDK /createRoom API.
     */
    createRoom(opts: RoomCreationOpts): Promise<{
        room_id: string;
    }>;
    /**
     * <p>Invite a user to a room.</p>
     * This will automatically make the client join the room so they can send the
     * invite if they are not already joined.
     * @param roomId The room to invite the user to.
     * @param target The user ID to invite.
     * @return Resolved when invited, else rejected with an error.
     */
    invite(roomId: string, target: string): Promise<any>;
    /**
     * <p>Kick a user from a room.</p>
     * This will automatically make the client join the room so they can send the
     * kick if they are not already joined.
     * @param roomId The room to kick the user from.
     * @param target The target of the kick operation.
     * @param reason Optional. The reason for the kick.
     * @return Resolved when kickked, else rejected with an error.
     */
    kick(roomId: string, target: string, reason?: string): Promise<any>;
    /**
     * <p>Ban a user from a room.</p>
     * This will automatically make the client join the room so they can send the
     * ban if they are not already joined.
     * @param roomId The room to ban the user from.
     * @param target The target of the ban operation.
     * @param reason Optional. The reason for the ban.
     * @return Resolved when banned, else rejected with an error.
     */
    ban(roomId: string, target: string, reason?: string): Promise<any>;
    /**
     * <p>Unban a user from a room.</p>
     * This will automatically make the client join the room so they can send the
     * unban if they are not already joined.
     * @param roomId The room to unban the user from.
     * @param target The target of the unban operation.
     * @return Resolved when unbanned, else rejected with an error.
     */
    unban(roomId: string, target: string): Promise<any>;
    /**
     * <p>Join a room</p>
     * This will automatically send an invite from the bot if it is an invite-only
     * room, which may make the bot attempt to join the room if it isn't already.
     * @param roomIdOrAlias The room ID or room alias to join.
     * @param viaServers The server names to try and join through in
     * addition to those that are automatically chosen.
     */
    join(roomIdOrAlias: string, viaServers?: string[]): Promise<string>;
    /**
     * <p>Leave a room</p>
     * This will no-op if the user isn't in the room.
     * @param roomId The room to leave.
     * @param reason An optional string to explain why the user left the room.
     */
    leave(roomId: string, reason?: string): Promise<any>;
    /**
     * <p>Get a user's profile information</p>
     * @param userId The ID of the user whose profile to return
     * @param info The profile field name to retrieve (e.g. 'displayname'
     * or 'avatar_url'), or null to fetch the entire profile information.
     * @param useCache Should the request attempt to lookup
     * state from the cache.
     * @return A Promise that resolves with the requested user's profile
     * information
     */
    getProfileInfo(userId: string, info?: UserProfileKeys, useCache?: boolean): Promise<any>;
    /**
     * <p>Set the user's display name</p>
     * @param name The new display name
     */
    setDisplayName(name: string): Promise<any>;
    /**
     * <p>Set the user's avatar URL</p>
     * @param url The new avatar URL
     */
    setAvatarUrl(url: string): Promise<any>;
    setRoomUserProfile(roomId: string, profile: UserProfile): Promise<void>;
    /**
     * Create a new alias mapping.
     * @param alias The room alias to create
     * @param roomId The room ID the alias should point at.
     */
    createAlias(alias: string, roomId: string): Promise<any>;
    /**
     * Set the presence of this user.
     * @param presence One of "online", "offline" or "unavailable".
     * @param status_msg The status message to attach.
     * @return Resolves if the presence was set or no-oped, rejects otherwise.
     */
    setPresence(presence: string, status_msg?: string): Promise<any>;
    /**
     * Signals that an error occured while handling an event by the bridge.
     *
     * **Warning**: This function is unstable and is likely to change pending the outcome
     * of https://github.com/matrix-org/matrix-doc/pull/2162.
     * @param roomID ID of the room in which the error occured.
     * @param eventID ID of the event for which the error occured.
     * @param networkName Name of the bridged network.
     * @param reason The reason why the bridge error occured.
     * @param reason_body A human readable string d
     * @param affectedUsers Array of regex matching all affected users.
     */
    unstableSignalBridgeError(roomID: string, eventID: string, networkName: string | undefined, reason: BridgeErrorReason, affectedUsers: string[]): Promise<{
        event_id: string;
    }>;
    /**
     * Get an event in a room.
     * This will automatically make the client join the room so they can get the
     * event if they are not already joined.
     * @param roomId The room to fetch the event from.
     * @param eventId The eventId of the event to fetch.
     * @param useCache Should the request attempt to lookup from the cache.
     * @return Resolves with the content of the event, or rejects if not found.
     */
    getEvent(roomId: string, eventId: string, useCache?: boolean): Promise<any>;
    /**
     * Get a state event in a room.
     * This will automatically make the client join the room so they can get the
     * state if they are not already joined.
     * @param roomId The room to get the state from.
     * @param eventType The event type to fetch.
     * @param stateKey The state key of the event to fetch.
     * @param returnNull Return null on not found, rather than throwing
     */
    getStateEvent(roomId: string, eventType: string, stateKey?: string, returnNull?: boolean): Promise<any>;
    /**
     * Check if a room is encrypted. If it is, return the algorithm.
     * @param roomId The room ID to be checked
     * @returns The encryption algorithm or false
     */
    isRoomEncrypted(roomId: string): Promise<string | false>;
    /**
     * Upload a file to the homeserver.
     * @param content The file contents
     * @param opts Additional options for the upload.
     * @returns A MXC URL pointing to the uploaded data.
     */
    uploadContent(content: Buffer | string | ReadStream, opts?: FileUploadOpts): Promise<string>;
    /**
     * Set the visibility of a room in the homeserver's room directory.
     * @param roomId The room
     * @param visibility Should the room be visible
     */
    setRoomDirectoryVisibility(roomId: string, visibility: "public" | "private"): Promise<any>;
    /**
     * Set the visibility of a room in the appservice's room directory.
     * This only works if you have defined the `protocol` in the registration file.
     * @param roomId The room
     * @param networkId The network (not protocol) that owns this room. E.g. "freenode" (for an IRC bridge)
     * @param visibility Should the room be visible
     */
    setRoomDirectoryVisibilityAppService(roomId: string, networkId: string, visibility: "public" | "private"): Promise<any>;
    /**
     * Inform this Intent class of an incoming event. Various optimisations will be
     * done if this is provided. For example, a /join request won't be sent out if
     * it knows you've already been joined to the room. This function does nothing
     * if a backing store was provided to the Intent.
     * @param event The incoming event JSON
     */
    onEvent(event: {
        type: string;
        content: {
            membership: UserMembership;
            displayname?: string;
            avatar_url?: string;
            algorithm?: string;
        };
        state_key: unknown;
        room_id: string;
    }): void;
    private _joinGuard;
    private _ensureJoined;
    /**
     * Ensures that the client has the required power level to post the event type.
     * @param roomId Required as power levels exist inside a room.
     * @param eventTypes The event type to check the permissions for.
     * @param isState Are we checking for state permissions or regular event permissions.
     * @return If found, the power level event
     */
    private _ensureHasPowerLevelFor;
    private loginForEncryptedClient;
    ensureRegistered(forceRegister?: boolean): Promise<any>;
}
export {};

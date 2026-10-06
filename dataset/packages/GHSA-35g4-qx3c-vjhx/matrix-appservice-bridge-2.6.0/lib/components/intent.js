"use strict";
/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intent = exports.APPSERVICE_REGISTER_TYPE = void 0;
const matrix_1 = require("../models/users/matrix");
const matrix_js_sdk_1 = __importDefault(require("matrix-js-sdk"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { MatrixEvent, RoomMember } = matrix_js_sdk_1.default;
const client_request_cache_1 = require("./client-request-cache");
const promiseutil_1 = require("../utils/promiseutil");
const encryption_1 = require("./encryption");
const logging_1 = __importDefault(require("./logging"));
const log = logging_1.default.get("Intent");
/**
 * Returns the first parameter that is a number or 0.
 */
const returnFirstNumber = (...args) => {
    for (const arg of args) {
        if (typeof arg === "number") {
            return arg;
        }
    }
    return 0;
};
const DEFAULT_CACHE_TTL = 90000;
const DEFAULT_CACHE_SIZE = 1024;
exports.APPSERVICE_REGISTER_TYPE = "m.login.application_service";
class Intent {
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
    constructor(client, botClient, opts = {}) {
        var _a, _b;
        this.client = client;
        this.botClient = botClient;
        // These two are only used if no opts.backingStore is provided to the constructor.
        this._membershipStates = {};
        this._powerLevels = {};
        this.encryptedRooms = new Map();
        if (opts.backingStore) {
            if (!opts.backingStore.setPowerLevelContent ||
                !opts.backingStore.getPowerLevelContent ||
                !opts.backingStore.setMembership ||
                !opts.backingStore.getMembership) {
                throw new Error("Intent backingStore missing required functions");
            }
        }
        this.encryption = opts.encryption;
        this.opts = {
            ...opts,
            backingStore: opts.backingStore ? { ...opts.backingStore } : {
                getMembership: (roomId, userId) => {
                    if (userId !== this.userId) {
                        return null;
                    }
                    return this._membershipStates[roomId] && this._membershipStates[roomId][0];
                },
                getMemberProfile: (roomId, userId) => {
                    if (userId !== this.client.credentials.userId) {
                        return {};
                    }
                    return this._membershipStates[roomId] && this._membershipStates[roomId][1];
                },
                getPowerLevelContent: (roomId) => {
                    return this._powerLevels[roomId];
                },
                setMembership: (roomId, userId, membership, profile) => {
                    if (userId !== this.userId) {
                        return;
                    }
                    this._membershipStates[roomId] = [membership, profile];
                },
                setPowerLevelContent: (roomId, content) => {
                    this._powerLevels[roomId] = content;
                },
            },
            caching: {
                size: ((_a = opts.caching) === null || _a === void 0 ? void 0 : _a.ttl) || DEFAULT_CACHE_SIZE,
                ttl: ((_b = opts.caching) === null || _b === void 0 ? void 0 : _b.ttl) || DEFAULT_CACHE_TTL,
            },
            enablePresence: opts.enablePresence !== false,
        };
        this._requestCaches = {
            profile: new client_request_cache_1.ClientRequestCache(this.opts.caching.ttl, this.opts.caching.size, (_, userId, info) => {
                return this.getProfileInfo(userId, info, false);
            }),
            roomstate: new client_request_cache_1.ClientRequestCache(this.opts.caching.ttl, this.opts.caching.size, (roomId) => {
                return this.roomState(roomId, false);
            }),
            event: new client_request_cache_1.ClientRequestCache(this.opts.caching.ttl, this.opts.caching.size, (_, roomId, eventId) => {
                return this.getEvent(roomId, eventId, false);
            }),
        };
    }
    /**
     * Return the client this Intent is acting on behalf of.
     * @return The client
     */
    getClient() {
        return this.client;
    }
    get userId() {
        return this.client.credentials.userId;
    }
    /**
     * Resolve a roomId or alias into a roomId. If a roomId is given, it is immediately returned.
     * @param roomAliasOrId A roomId or alias to resolve.
     * @throws If the provided string was incorrectly formatted or alias does not exist.
     */
    async resolveRoom(roomAliasOrId) {
        if (roomAliasOrId.startsWith("!")) {
            return roomAliasOrId;
        }
        else if (roomAliasOrId.startsWith("#")) {
            const r = await this.client.resolveRoomAlias(roomAliasOrId);
            return r.room_id;
        }
        throw Error('Invalid roomId/roomAlias provided');
    }
    /**
     * <p>Send a plaintext message to a room.</p>
     * This will automatically make the client join the room so they can send the
     * message if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param text The text string to send.
     */
    sendText(roomId, text) {
        return this.sendMessage(roomId, {
            body: text,
            msgtype: "m.text"
        });
    }
    /**
     * <p>Set the name of a room.</p>
     * This will automatically make the client join the room so they can set the
     * name if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param name The room name.
     */
    setRoomName(roomId, name) {
        return this.sendStateEvent(roomId, "m.room.name", "", {
            name: name
        });
    }
    /**
     * <p>Set the topic of a room.</p>
     * This will automatically make the client join the room so they can set the
     * topic if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param topic The room topic.
     */
    setRoomTopic(roomId, topic) {
        return this.sendStateEvent(roomId, "m.room.topic", "", {
            topic: topic
        });
    }
    /**
     * <p>Set the avatar of a room.</p>
     * This will automatically make the client join the room so they can set the
     * topic if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param avatar The url of the avatar.
     * @param info Extra information about the image. See m.room.avatar for details.
     */
    setRoomAvatar(roomId, avatar, info) {
        const content = {
            info,
            url: avatar,
        };
        return this.sendStateEvent(roomId, "m.room.avatar", "", content);
    }
    /**
     * <p>Send a typing event to a room.</p>
     * This will automatically make the client join the room so they can send the
     * typing event if they are not already joined.
     * @param roomId The room to send to.
     * @param isTyping True if typing
     */
    async sendTyping(roomId, isTyping) {
        await this._ensureJoined(roomId);
        return this.client.sendTyping(roomId, isTyping);
    }
    /**
     * <p>Send a read receipt to a room.</p>
     * This will automatically make the client join the room so they can send the
     * receipt event if they are not already joined.
     * @param roomId The room to send to.
     * @param eventId The event ID to set the receipt mark to.
     */
    async sendReadReceipt(roomId, eventId) {
        const event = new MatrixEvent({
            room_id: roomId,
            event_id: eventId,
        });
        await this._ensureJoined(roomId);
        return this.client.sendReadReceipt(event);
    }
    /**
     * Set the power level of the given target.
     * @param roomId The room to set the power level in.
     * @param target The target user ID
     * @param level The desired level. Undefined will remove the users custom power level.
     */
    async setPowerLevel(roomId, target, level) {
        await this._ensureJoined(roomId);
        const event = await this._ensureHasPowerLevelFor(roomId, "m.room.power_levels", true);
        return this.client.setPowerLevel(roomId, target, level, event);
    }
    /**
     * <p>Send an <code>m.room.message</code> event to a room.</p>
     * This will automatically make the client join the room so they can send the
     * message if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param content The event content
     */
    sendMessage(roomId, content) {
        return this.sendEvent(roomId, "m.room.message", content);
    }
    /**
     * <p>Send a message event to a room.</p>
     * This will automatically make the client join the room so they can send the
     * message if they are not already joined. It will also make sure that the client
     * has sufficient power level to do this.
     * @param roomId The room to send to.
     * @param type The event type
     * @param content The event content
     */
    async sendEvent(roomId, type, content) {
        if (this.encryption) {
            let encrypted = false;
            try {
                encrypted = !!(await this.isRoomEncrypted(roomId));
            }
            catch (ex) {
                // This is unexpected. Fail safe.
                log.debug(`Could not determine if room is encrypted. Assuming yes:`, ex);
                encrypted = true;
            }
            if (encrypted) {
                // We *need* to sync before we can send a message to an encrypted room.
                await this.ensureRegistered();
                await this.encryption.ensureClientSyncingCallback();
            }
        }
        await this._ensureJoined(roomId);
        await this._ensureHasPowerLevelFor(roomId, type, false);
        return this._joinGuard(roomId, async () => 
        // eslint-disable-next-line camelcase
        this.client.sendEvent(roomId, type, content));
    }
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
    async sendStateEvent(roomId, type, skey, content
    // eslint-disable-next-line camelcase
    ) {
        await this._ensureJoined(roomId);
        await this._ensureHasPowerLevelFor(roomId, type, true);
        return this._joinGuard(roomId, async () => 
        // eslint-disable-next-line camelcase
        this.client.sendStateEvent(roomId, type, content, skey));
    }
    /**
     * <p>Get the current room state for a room.</p>
     * This will automatically make the client join the room so they can get the
     * state if they are not already joined.
     * @param roomId The room to get the state from.
     * @param useCache Should the request attempt to lookup
     * state from the cache.
     */
    async roomState(roomId, useCache = false) {
        await this._ensureJoined(roomId);
        if (useCache) {
            return this._requestCaches.roomstate.get(roomId);
        }
        return this.client.roomState(roomId);
    }
    /**
     * Create a room with a set of options.
     * @param opts Options.
     * @param opts.createAsClient True to create this room as a client and
     * not the bot: the bot will not join. False to create this room as the bot and
     * auto-join the client. Default: false.
     * @param opts.options Options to pass to the client SDK /createRoom API.
     */
    // eslint-disable-next-line camelcase
    async createRoom(opts) {
        const cli = opts.createAsClient ? this.client : this.botClient;
        const { userId } = cli.credentials;
        const options = opts.options || {};
        if (!opts.createAsClient) {
            // invite the client if they aren't already
            options.invite = options.invite || [];
            if (Array.isArray(options.invite) && !options.invite.includes(userId)) {
                options.invite.push(userId);
            }
        }
        // make sure that the thing doing the room creation isn't inviting itself
        // else Synapse hard fails the operation with M_FORBIDDEN
        if (Array.isArray(options.invite) && options.invite.includes(userId)) {
            options.invite.splice(options.invite.indexOf(userId), 1);
        }
        await this.ensureRegistered();
        const res = await cli.createRoom(options);
        if (typeof res !== "object" || !res) {
            const type = res === null ? "null" : typeof res;
            throw Error(`Expected Matrix Server to answer createRoom with an object, got ${type}.`);
        }
        const roomId = res.room_id;
        if (typeof roomId !== "string") {
            const type = typeof roomId;
            throw Error(`Expected Matrix Server to answer createRoom with a room_id that is a string, got ${type}.`);
        }
        // create a fake power level event to give the room creator ops if we
        // don't yet have a power level event.
        if (this.opts.backingStore.getPowerLevelContent(roomId)) {
            return res;
        }
        const users = {};
        users[userId] = 100;
        this.opts.backingStore.setPowerLevelContent(roomId, {
            users_default: 0,
            events_default: 0,
            state_default: 50,
            users: users,
            events: {}
        });
        return res;
    }
    /**
     * <p>Invite a user to a room.</p>
     * This will automatically make the client join the room so they can send the
     * invite if they are not already joined.
     * @param roomId The room to invite the user to.
     * @param target The user ID to invite.
     * @return Resolved when invited, else rejected with an error.
     */
    async invite(roomId, target) {
        await this._ensureJoined(roomId);
        return this.client.invite(roomId, target);
    }
    /**
     * <p>Kick a user from a room.</p>
     * This will automatically make the client join the room so they can send the
     * kick if they are not already joined.
     * @param roomId The room to kick the user from.
     * @param target The target of the kick operation.
     * @param reason Optional. The reason for the kick.
     * @return Resolved when kickked, else rejected with an error.
     */
    async kick(roomId, target, reason) {
        if (target !== this.userId) {
            // Only ensure joined if we are not also the kicker
            await this._ensureJoined(roomId);
        }
        return this.client.kick(roomId, target, reason);
    }
    /**
     * <p>Ban a user from a room.</p>
     * This will automatically make the client join the room so they can send the
     * ban if they are not already joined.
     * @param roomId The room to ban the user from.
     * @param target The target of the ban operation.
     * @param reason Optional. The reason for the ban.
     * @return Resolved when banned, else rejected with an error.
     */
    async ban(roomId, target, reason) {
        await this._ensureJoined(roomId);
        return this.client.ban(roomId, target, reason);
    }
    /**
     * <p>Unban a user from a room.</p>
     * This will automatically make the client join the room so they can send the
     * unban if they are not already joined.
     * @param roomId The room to unban the user from.
     * @param target The target of the unban operation.
     * @return Resolved when unbanned, else rejected with an error.
     */
    async unban(roomId, target) {
        await this._ensureJoined(roomId);
        return this.client.unban(roomId, target);
    }
    /**
     * <p>Join a room</p>
     * This will automatically send an invite from the bot if it is an invite-only
     * room, which may make the bot attempt to join the room if it isn't already.
     * @param roomIdOrAlias The room ID or room alias to join.
     * @param viaServers The server names to try and join through in
     * addition to those that are automatically chosen.
     */
    async join(roomIdOrAlias, viaServers) {
        return this._ensureJoined(roomIdOrAlias, false, viaServers);
    }
    /**
     * <p>Leave a room</p>
     * This will no-op if the user isn't in the room.
     * @param roomId The room to leave.
     * @param reason An optional string to explain why the user left the room.
     */
    async leave(roomId, reason) {
        if (reason) {
            return this.kick(roomId, this.userId, reason);
        }
        return this.client.leave(roomId);
    }
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
    async getProfileInfo(userId, info = null, useCache = true) {
        await this.ensureRegistered();
        if (useCache) {
            return this._requestCaches.profile.get(`${userId}:${info}`, userId, info);
        }
        return this.client.getProfileInfo(userId, info);
    }
    /**
     * <p>Set the user's display name</p>
     * @param name The new display name
     */
    async setDisplayName(name) {
        await this.ensureRegistered();
        return this.client.setDisplayName(name);
    }
    /**
     * <p>Set the user's avatar URL</p>
     * @param url The new avatar URL
     */
    async setAvatarUrl(url) {
        await this.ensureRegistered();
        return this.client.setAvatarUrl(url);
    }
    async setRoomUserProfile(roomId, profile) {
        const userId = this.client.getUserId();
        const currProfile = this.opts.backingStore.getMemberProfile(roomId, userId);
        // Compare the user's current profile (from cache) with the profile
        // that is requested.  Only send the state event if something that was
        // requested to change is different from the current value.
        if (("displayname" in profile && currProfile.displayname != profile.displayname) ||
            ("avatar_url" in profile && currProfile.avatar_url != profile.avatar_url)) {
            const content = Object.assign({ membership: "join" }, currProfile, profile);
            await this.client.sendStateEvent(roomId, 'm.room.member', content, userId);
        }
    }
    /**
     * Create a new alias mapping.
     * @param alias The room alias to create
     * @param roomId The room ID the alias should point at.
     */
    async createAlias(alias, roomId) {
        await this.ensureRegistered();
        return this.client.createAlias(alias, roomId);
    }
    /**
     * Set the presence of this user.
     * @param presence One of "online", "offline" or "unavailable".
     * @param status_msg The status message to attach.
     * @return Resolves if the presence was set or no-oped, rejects otherwise.
     */
    // eslint-disable-next-line camelcase
    async setPresence(presence, status_msg) {
        if (!this.opts.enablePresence) {
            return undefined;
        }
        await this.ensureRegistered();
        return this.client.setPresence({ presence, status_msg });
    }
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
    async unstableSignalBridgeError(roomID, eventID, networkName, reason, affectedUsers) {
        return this.sendEvent(roomID, "de.nasnotfound.bridge_error", {
            network_name: networkName,
            reason: reason,
            affected_users: affectedUsers,
            "m.relates_to": {
                rel_type: "m.reference",
                event_id: eventID,
            },
        });
    }
    /**
     * Get an event in a room.
     * This will automatically make the client join the room so they can get the
     * event if they are not already joined.
     * @param roomId The room to fetch the event from.
     * @param eventId The eventId of the event to fetch.
     * @param useCache Should the request attempt to lookup from the cache.
     * @return Resolves with the content of the event, or rejects if not found.
     */
    async getEvent(roomId, eventId, useCache = true) {
        await this.ensureRegistered();
        if (useCache) {
            return this._requestCaches.event.get(`${roomId}:${eventId}`, roomId, eventId);
        }
        return this.client.fetchRoomEvent(roomId, eventId);
    }
    /**
     * Get a state event in a room.
     * This will automatically make the client join the room so they can get the
     * state if they are not already joined.
     * @param roomId The room to get the state from.
     * @param eventType The event type to fetch.
     * @param stateKey The state key of the event to fetch.
     * @param returnNull Return null on not found, rather than throwing
     */
    async getStateEvent(roomId, eventType, stateKey = "", returnNull = false) {
        await this._ensureJoined(roomId);
        try {
            return await this.client.getStateEvent(roomId, eventType, stateKey);
        }
        catch (ex) {
            if (ex.errcode !== "M_NOT_FOUND" || !returnNull) {
                throw ex;
            }
        }
        return null;
    }
    /**
     * Check if a room is encrypted. If it is, return the algorithm.
     * @param roomId The room ID to be checked
     * @returns The encryption algorithm or false
     */
    async isRoomEncrypted(roomId) {
        const existing = this.encryptedRooms.get(roomId);
        if (existing !== undefined) {
            return existing;
        }
        try {
            const ev = await this.getStateEvent(roomId, "m.room.encryption");
            const algo = ev.algorithm;
            if (typeof algo === 'string' && algo) {
                this.encryptedRooms.set(roomId, algo);
                return algo;
            }
            // Return false if missing, not a string or empty.
            return false;
        }
        catch (ex) {
            if (ex.httpStatus == 404) {
                this.encryptedRooms.set(roomId, false);
                return false;
            }
            throw ex;
        }
    }
    /**
     * Upload a file to the homeserver.
     * @param content The file contents
     * @param opts Additional options for the upload.
     * @returns A MXC URL pointing to the uploaded data.
     */
    async uploadContent(content, opts = {}) {
        await this.ensureRegistered();
        return this.client.uploadContent(content, { ...opts, rawResponse: false, onlyContentUri: true });
    }
    /**
     * Set the visibility of a room in the homeserver's room directory.
     * @param roomId The room
     * @param visibility Should the room be visible
     */
    async setRoomDirectoryVisibility(roomId, visibility) {
        await this.ensureRegistered();
        return this.client.setRoomDirectoryVisibility(roomId, visibility);
    }
    /**
     * Set the visibility of a room in the appservice's room directory.
     * This only works if you have defined the `protocol` in the registration file.
     * @param roomId The room
     * @param networkId The network (not protocol) that owns this room. E.g. "freenode" (for an IRC bridge)
     * @param visibility Should the room be visible
     */
    async setRoomDirectoryVisibilityAppService(roomId, networkId, visibility) {
        await this.ensureRegistered();
        return this.client.setRoomDirectoryVisibilityAppService(roomId, visibility, networkId);
    }
    /**
     * Inform this Intent class of an incoming event. Various optimisations will be
     * done if this is provided. For example, a /join request won't be sent out if
     * it knows you've already been joined to the room. This function does nothing
     * if a backing store was provided to the Intent.
     * @param event The incoming event JSON
     */
    onEvent(event) {
        if (event.state_key === undefined) {
            // We MUST operate on state events exclusively
            return;
        }
        // Invalidate the state cache if anything changes in the state.
        this._requestCaches.roomstate.invalidate(event.room_id);
        if (!this._membershipStates || !this._powerLevels) {
            return;
        }
        if (event.type === "m.room.member" &&
            event.state_key === this.userId &&
            event.content.membership) {
            const profile = {};
            if (event.content.displayname) {
                profile.displayname = event.content.displayname;
            }
            if (event.content.avatar_url) {
                profile.avatar_url = event.content.avatar_url;
            }
            this._membershipStates[event.room_id] = [event.content.membership, profile];
        }
        else if (event.type === "m.room.power_levels") {
            this._powerLevels[event.room_id] = event.content;
        }
        else if (event.type === "m.room.encryption" && typeof event.content.algorithm === "string") {
            this.encryptedRooms.set(event.room_id, event.content.algorithm);
        }
    }
    // Guard a function which returns a promise which may reject if the user is not
    // in the room. If the promise rejects, join the room and retry the function.
    async _joinGuard(roomId, promiseFn) {
        try {
            // await so we can handle the error
            return await promiseFn();
        }
        catch (err) {
            if (err.errcode !== "M_FORBIDDEN") {
                // not a guardable error
                throw err;
            }
            await this._ensureJoined(roomId, true);
            return promiseFn();
        }
    }
    async _ensureJoined(roomIdOrAlias, ignoreCache = false, viaServers, passthroughError = false) {
        const isRoomId = roomIdOrAlias.startsWith("!");
        const opts = {
            syncRoom: false,
        };
        if (viaServers) {
            opts.viaServers = viaServers;
        }
        if (isRoomId && this.opts.backingStore.getMembership(roomIdOrAlias, this.userId) === "join" && !ignoreCache) {
            return roomIdOrAlias;
        }
        /* Logic:
        if client /join:
        SUCCESS
        else if bot /invite client:
        if client /join:
            SUCCESS
        else:
            FAIL (client couldn't join)
        else if bot /join:
        if bot /invite client and client /join:
            SUCCESS
        else:
            FAIL (bot couldn't invite)
        else:
        FAIL (bot can't get into the room)
        */
        const deferredPromise = promiseutil_1.defer();
        const mark = (room, state) => {
            this.opts.backingStore.setMembership(room, this.userId, state, {});
            if (state === "join") {
                deferredPromise.resolve(room);
            }
        };
        const dontJoin = this.opts.dontJoin;
        try {
            await this.ensureRegistered();
            if (dontJoin) {
                // XXX: Should we return the passed in parameter if we didn't join, or empty?
                deferredPromise.resolve(roomIdOrAlias);
                return deferredPromise.promise;
            }
            try {
                // eslint-disable-next-line camelcase
                const { roomId } = await this.client.joinRoom(roomIdOrAlias, opts);
                mark(roomId, "join");
            }
            catch (ex) {
                if (ex.errcode !== "M_FORBIDDEN") {
                    throw ex;
                }
                try {
                    if (!isRoomId) {
                        throw Error("Can't invite via an alias");
                    }
                    // Try bot inviting client
                    await this.botClient.invite(roomIdOrAlias, this.userId);
                    // eslint-disable-next-line camelcase
                    const { roomId } = await this.client.joinRoom(roomIdOrAlias, opts);
                    mark(roomId, "join");
                }
                catch (_ex) {
                    // Try bot joining
                    // eslint-disable-next-line camelcase
                    const { roomId } = await this.botClient.joinRoom(roomIdOrAlias, opts);
                    await this.botClient.invite(roomId, this.userId);
                    await this.client.joinRoom(roomId, opts);
                    mark(roomId, "join");
                }
            }
        }
        catch (ex) {
            deferredPromise.reject(passthroughError ? ex : Error("Failed to join room"));
        }
        return deferredPromise.promise;
    }
    /**
     * Ensures that the client has the required power level to post the event type.
     * @param roomId Required as power levels exist inside a room.
     * @param eventTypes The event type to check the permissions for.
     * @param isState Are we checking for state permissions or regular event permissions.
     * @return If found, the power level event
     */
    async _ensureHasPowerLevelFor(roomId, eventType, isState) {
        if (this.opts.dontCheckPowerLevel && eventType !== "m.room.power_levels") {
            return undefined;
        }
        const userId = this.userId;
        const plContent = this.opts.backingStore.getPowerLevelContent(roomId)
            || await this.client.getStateEvent(roomId, "m.room.power_levels", "");
        const eventContent = plContent && typeof plContent === "object" ? plContent : {};
        this.opts.backingStore.setPowerLevelContent(roomId, eventContent);
        const event = {
            content: typeof eventContent === "object" ? eventContent : {},
            room_id: roomId,
            sender: "",
            event_id: "_",
            state_key: "",
            type: "m.room.power_levels"
        };
        const powerLevelEvent = new MatrixEvent(event);
        // What level do we need for this event type?
        const defaultLevel = isState
            ? event.content.state_default
            : event.content.events_default;
        const requiredLevel = returnFirstNumber(
        // If these are invalid or not provided, default to 0 according to the Spec.
        // https://matrix.org/docs/spec/client_server/r0.6.0#m-room-power-levels
        (event.content.events && event.content.events[eventType]), defaultLevel, 0);
        // Parse out what level the client has by abusing the JS SDK
        const roomMember = new RoomMember(roomId, userId);
        roomMember.setPowerLevelEvent(powerLevelEvent);
        if (requiredLevel > roomMember.powerLevel) {
            // can the bot update our power level?
            const bot = new RoomMember(roomId, this.botClient.credentials.userId);
            bot.setPowerLevelEvent(powerLevelEvent);
            const levelRequiredToModifyPowerLevels = returnFirstNumber(
            // If these are invalid or not provided, default to 0 according to the Spec.
            // https://matrix.org/docs/spec/client_server/r0.6.0#m-room-power-levels
            event.content.events && event.content.events["m.room.power_levels"], event.content.state_default, 0);
            if (levelRequiredToModifyPowerLevels > bot.powerLevel) {
                // even the bot has no power here.. give up.
                throw new Error("Cannot ensure client has power level for event " + eventType +
                    " : client has " + roomMember.powerLevel + " and we require " +
                    requiredLevel + " and the bot doesn't have permission to " +
                    "edit the client's power level.");
            }
            // update the client's power level first
            await this.botClient.setPowerLevel(roomId, userId, requiredLevel, powerLevelEvent);
            // tweak the level for the client to reflect the new reality
            const userLevels = powerLevelEvent.getContent().users || {};
            userLevels[userId] = requiredLevel;
            powerLevelEvent.getContent().users = userLevels;
        }
        return powerLevelEvent;
    }
    async loginForEncryptedClient() {
        const userId = this.userId;
        const res = await this.client.login(encryption_1.APPSERVICE_LOGIN_TYPE, {
            identifier: {
                type: "m.id.user",
                user: userId,
            }
        });
        return {
            accessToken: res.access_token,
            deviceId: res.device_id,
        };
    }
    async ensureRegistered(forceRegister = false) {
        const userId = this.client.credentials.userId;
        log.debug(`Checking if user ${this.client.credentials.userId} is registered`);
        // We want to skip if and only if all of these conditions are met.
        // Calling /register twice isn't disasterous, but not calling it *at all* IS.
        if (!forceRegister && this.opts.registered && !this.encryption) {
            log.debug("ensureRegistered: Registered, and not encrypted");
            return "registered=true";
        }
        let registerRes;
        if (forceRegister || !this.opts.registered) {
            const username = (new matrix_1.MatrixUser(userId)).localpart;
            try {
                registerRes = await this.botClient.registerRequest({
                    type: exports.APPSERVICE_REGISTER_TYPE,
                    username,
                });
                this.opts.registered = true;
            }
            catch (err) {
                if (err.errcode === "M_EXCLUSIVE" && this.botClient === this.client) {
                    // Registering the bot will leave it
                    this.opts.registered = true;
                }
                else if (err.errcode === "M_USER_IN_USE") {
                    this.opts.registered = true;
                }
                else {
                    throw err;
                }
            }
        }
        if (!this.encryption) {
            log.debug("ensureRegistered: Registered, and not encrypted");
            // We don't care about encryption, or the encryption is ready.
            return registerRes;
        }
        if (this.readyPromise) {
            log.debug("ensureRegistered: ready promise ongoing");
            try {
                // Should fall through and find the session.
                await this.readyPromise;
            }
            catch (ex) {
                log.debug("ensureRegistered: failed to ready", ex);
                // Failed to ready up - fall through and try again.
            }
        }
        // Encryption enabled, check if we have a session.
        let session = await this.encryption.sessionPromise;
        if (session) {
            log.debug("ensureRegistered: Existing enc session, reusing");
            // We have existing credentials, set them on the client and run away.
            this.client._http.opts.accessToken = session.accessToken;
            if (session.syncToken) {
                this.client.store.setSyncToken(session.syncToken);
            }
        }
        else {
            this.readyPromise = (async () => {
                var _a;
                log.debug("ensureRegistered: Attempting encrypted login");
                // Login as the user
                const result = await this.loginForEncryptedClient();
                session = {
                    userId,
                    ...result,
                    syncToken: null,
                };
                if (this.encryption) {
                    this.encryption.sessionPromise = Promise.resolve(session);
                }
                await ((_a = this.encryption) === null || _a === void 0 ? void 0 : _a.sessionCreatedCallback(session));
            })();
            await this.readyPromise;
        }
        // We are using a real user access token.
        // We delete the whole extraParams object due to a bug with GET requests
        delete this.client._http.opts.extraParams;
        return undefined;
    }
}
exports.Intent = Intent;
//# sourceMappingURL=intent.js.map
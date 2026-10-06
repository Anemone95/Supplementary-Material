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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppServiceBot = void 0;
/**
 * Construct an AS bot user which has various helper methods.
 * @constructor
 * @param {MatrixClient} client The client instance configured for the AS bot.
 * @param registration The registration that the bot
 * is following. Used to determine which user IDs it is controlling.
 * @param memberCache The bridges membership cache instance,
 * for storing membership the bot has discovered.
 */
class AppServiceBot {
    constructor(client, registration, memberCache) {
        var _a;
        this.client = client;
        this.memberCache = memberCache;
        // yank out the exclusive user ID regex strings
        this.exclusiveUserRegexes = [];
        const regOut = registration.getOutput();
        if ((_a = regOut === null || regOut === void 0 ? void 0 : regOut.namespaces) === null || _a === void 0 ? void 0 : _a.users) {
            regOut.namespaces.users.forEach((userEntry) => {
                if (!userEntry.exclusive) {
                    return;
                }
                this.exclusiveUserRegexes.push(new RegExp(userEntry.regex));
            });
        }
    }
    getClient() {
        return this.client;
    }
    getUserId() {
        return this.client.credentials.userId;
    }
    /**
     * Get a list of joined room IDs for the AS bot.
     * @return Resolves to a list of room IDs.
     */
    async getJoinedRooms() {
        return (await this.client.getJoinedRooms()).joined_rooms || [];
    }
    /**
     * Get a map of joined user IDs for the given room ID. The values in the map are objects
     * with a 'display_name' and 'avatar_url' properties. These properties may be null.
     * @param roomId The room to get a list of joined user IDs in.
     * @return Resolves to a map of user ID => display_name avatar_url
     */
    async getJoinedMembers(roomId) {
        // eslint-disable-next-line camelcase
        const res = await this.client.getJoinedRoomMembers(roomId);
        if (!res.joined) {
            return {};
        }
        for (const [member, p] of Object.entries(res.joined)) {
            if (this.isRemoteUser(member)) {
                const profile = {};
                if (p.display_name) {
                    profile.displayname = p.display_name;
                }
                if (p.avatar_url) {
                    profile.avatar_url = p.avatar_url;
                }
                this.memberCache.setMemberEntry(roomId, member, "join", profile);
            }
        }
        return res.joined;
    }
    async getRoomInfo(roomId, joinedRoom = {}) {
        const stateEvents = joinedRoom.state ? joinedRoom.state.events : [];
        const roomInfo = {
            id: roomId,
            state: stateEvents,
            realJoinedUsers: [],
            remoteJoinedUsers: [],
        };
        stateEvents.forEach((event) => {
            if (event.type !== "m.room.member" || event.content.membership !== "join") {
                return;
            }
            const userId = event.state_key;
            if (userId === this.getUserId()) {
                return;
            }
            if (this.isRemoteUser(userId)) {
                roomInfo.remoteJoinedUsers.push(userId);
            }
            else {
                roomInfo.realJoinedUsers.push(userId);
            }
        });
        return roomInfo;
    }
    /**
     * Test a userId to determine if it's a user within the exclusive regexes of the bridge.
     * @return True if it is a remote user, false otherwise.
     */
    isRemoteUser(userId) {
        return this.exclusiveUserRegexes.some((r) => r.test(userId));
    }
}
exports.AppServiceBot = AppServiceBot;
//# sourceMappingURL=app-service-bot.js.map
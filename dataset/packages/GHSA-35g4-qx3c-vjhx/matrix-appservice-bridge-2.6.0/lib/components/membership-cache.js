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
exports.MembershipCache = void 0;
class MembershipCache {
    constructor() {
        this.membershipMap = {};
        this.registeredUsers = new Set();
    }
    /**
     * Gets the *cached* state of a user's membership for a room.
     * This DOES NOT check to verify the value is correct (i.e the
     * room may have state reset and left the user from the room).
     *
     * This only caches users from the appservice.
     *
     * @param roomId Room id to check the state of.
     * @param userId The userid to check the state of.
     * @returns The membership state of the user, e.g. "joined"
     */
    getMemberEntry(roomId, userId) {
        if (this.membershipMap[roomId] === undefined || this.membershipMap[roomId][userId] === undefined) {
            return null;
        }
        return this.membershipMap[roomId][userId][0];
    }
    /**
     * Gets the *cached* state of a user's membership for a room.
     * This DOES NOT check to verify the value is correct (i.e the
     * room may have state reset and left the user from the room).
     *
     * This only caches users from the appservice.
     *
     * @param roomId Room id to check the state of.
     * @param userId The userid to check the state of.
     * @returns The member's profile information.
     */
    getMemberProfile(roomId, userId) {
        if (this.membershipMap[roomId] === undefined || this.membershipMap[roomId][userId] === undefined) {
            return {};
        }
        return this.membershipMap[roomId][userId][1];
    }
    /**
     * Set the *cached* state of a user's membership for a room.
     * Use this to optimise intents so that they do not attempt
     * to join a room if we know they are joined.
     * This DOES NOT set the actual membership of the room.
     *
     * This only caches users from the appservice.
     * @param roomId Room id to set the state of.
     * @param userId The userid to set the state of.
     * @param membership The membership value to set for the user
     *                       e.g joined.
     */
    setMemberEntry(roomId, userId, membership, profile) {
        if (this.membershipMap[roomId] === undefined) {
            this.membershipMap[roomId] = {};
        }
        // Bans and invites do not mean the user exists.
        if (membership === "join" || membership === "leave") {
            this.registeredUsers.add(userId);
        }
        this.membershipMap[roomId][userId] = [membership, profile];
    }
    /**
     * Is a user considered registered with the homeserver.
     * @param userId A Matrix userId
     */
    isUserRegistered(userId) {
        return this.registeredUsers.has(userId);
    }
    getMembersForRoom(roomId, filterFor) {
        if (!this.membershipMap[roomId]) {
            return null;
        }
        if (!filterFor) {
            return Object.keys(this.membershipMap[roomId]);
        }
        const members = [];
        for (const [userId, [membership]] of Object.entries(this.membershipMap[roomId])) {
            if (membership === filterFor) {
                members.push(userId);
            }
        }
        return members;
    }
}
exports.MembershipCache = MembershipCache;
//# sourceMappingURL=membership-cache.js.map
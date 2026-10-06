"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _lodash = require("lodash");

/*
Copyright 2016, 2019, 2021 The Matrix.org Foundation C.I.C.

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

/**
 * Class that takes a Matrix Client and flips the m.direct map
 * so the operation of mapping a room ID to which user it's a DM
 * with can be performed efficiently.
 *
 * With 'start', this can also keep itself up to date over time.
 */
class DMRoomMap {
  // TODO: convert these to maps
  constructor(matrixClient) {
    (0, _defineProperty2.default)(this, "matrixClient", void 0);
    (0, _defineProperty2.default)(this, "roomToUser", null);
    (0, _defineProperty2.default)(this, "userToRooms", null);
    (0, _defineProperty2.default)(this, "hasSentOutPatchDirectAccountDataPatch", void 0);
    (0, _defineProperty2.default)(this, "mDirectEvent", void 0);
    (0, _defineProperty2.default)(this, "onAccountData", ev => {
      if (ev.getType() == 'm.direct') {
        this.mDirectEvent = this.matrixClient.getAccountData('m.direct').getContent() || {};
        this.userToRooms = null;
        this.roomToUser = null;
      }
    });
    this.matrixClient = matrixClient; // see onAccountData

    this.hasSentOutPatchDirectAccountDataPatch = false;
    const mDirectEvent = matrixClient.getAccountData('m.direct');
    this.mDirectEvent = mDirectEvent ? mDirectEvent.getContent() : {};
  }
  /**
   * Makes and returns a new shared instance that can then be accessed
   * with shared(). This returned instance is not automatically started.
   */


  static makeShared()
  /*: DMRoomMap*/
  {
    DMRoomMap.sharedInstance = new DMRoomMap(_MatrixClientPeg.MatrixClientPeg.get());
    return DMRoomMap.sharedInstance;
  }
  /**
   * Returns a shared instance of the class
   * that uses the singleton matrix client
   * The shared instance must be started before use.
   */


  static shared()
  /*: DMRoomMap*/
  {
    return DMRoomMap.sharedInstance;
  }

  start() {
    this.populateRoomToUser();
    this.matrixClient.on("accountData", this.onAccountData);
  }

  stop() {
    this.matrixClient.removeListener("accountData", this.onAccountData);
  }

  /**
   * some client bug somewhere is causing some DMs to be marked
   * with ourself, not the other user. Fix it by guessing the other user and
   * modifying userToRooms
   */
  patchUpSelfDMs(userToRooms) {
    const myUserId = this.matrixClient.getUserId();
    const selfRoomIds = userToRooms[myUserId];

    if (selfRoomIds) {
      // any self-chats that should not be self-chats?
      const guessedUserIdsThatChanged = selfRoomIds.map(roomId => {
        const room = this.matrixClient.getRoom(roomId);

        if (room) {
          const userId = room.guessDMUserId();

          if (userId && userId !== myUserId) {
            return {
              userId,
              roomId
            };
          }
        }
      }).filter(ids => !!ids); //filter out
      // these are actually all legit self-chats
      // bail out

      if (!guessedUserIdsThatChanged.length) {
        return false;
      }

      userToRooms[myUserId] = selfRoomIds.filter(roomId => {
        return !guessedUserIdsThatChanged.some(ids => ids.roomId === roomId);
      });
      guessedUserIdsThatChanged.forEach(({
        userId,
        roomId
      }) => {
        const roomIds = userToRooms[userId];

        if (!roomIds) {
          userToRooms[userId] = [roomId];
        } else {
          roomIds.push(roomId);
          userToRooms[userId] = (0, _lodash.uniq)(roomIds);
        }
      });
      return true;
    }
  }

  getDMRoomsForUserId(userId)
  /*: string[]*/
  {
    // Here, we return the empty list if there are no rooms,
    // since the number of conversations you have with this user is zero.
    return this.getUserToRooms()[userId] || [];
  }
  /**
   * Gets the DM room which the given IDs share, if any.
   * @param {string[]} ids The identifiers (user IDs and email addresses) to look for.
   * @returns {Room} The DM room which all IDs given share, or falsey if no common room.
   */


  getDMRoomForIdentifiers(ids
  /*: string[]*/
  )
  /*: Room*/
  {
    // TODO: [Canonical DMs] Handle lookups for email addresses.
    // For now we'll pretend we only get user IDs and end up returning nothing for email addresses
    let commonRooms = this.getDMRoomsForUserId(ids[0]);

    for (let i = 1; i < ids.length; i++) {
      const userRooms = this.getDMRoomsForUserId(ids[i]);
      commonRooms = commonRooms.filter(r => userRooms.includes(r));
    }

    const joinedRooms = commonRooms.map(r => _MatrixClientPeg.MatrixClientPeg.get().getRoom(r)).filter(r => r && r.getMyMembership() === 'join');
    return joinedRooms[0];
  }

  getUserIdForRoomId(roomId
  /*: string*/
  ) {
    if (this.roomToUser == null) {
      // we lazily populate roomToUser so you can use
      // this class just to call getDMRoomsForUserId
      // which doesn't do very much, but is a fairly
      // convenient wrapper and there's no point
      // iterating through the map if getUserIdForRoomId()
      // is never called.
      this.populateRoomToUser();
    } // Here, we return undefined if the room is not in the map:
    // the room ID you gave is not a DM room for any user.


    if (this.roomToUser[roomId] === undefined) {
      // no entry? if the room is an invite, look for the is_direct hint.
      const room = this.matrixClient.getRoom(roomId);

      if (room) {
        return room.getDMInviter();
      }
    }

    return this.roomToUser[roomId];
  }

  getUniqueRoomsWithIndividuals()
  /*: {[userId: string]: Room}*/
  {
    if (!this.roomToUser) return {}; // No rooms means no map.

    return Object.keys(this.roomToUser).map(r => ({
      userId: this.getUserIdForRoomId(r),
      room: this.matrixClient.getRoom(r)
    })).filter(r => r.userId && r.room && r.room.getInvitedAndJoinedMemberCount() === 2).reduce((obj, r) => (obj[r.userId] = r.room) && obj, {});
  }

  getUserToRooms()
  /*: {[key: string]: string[]}*/
  {
    if (!this.userToRooms) {
      const userToRooms = this.mDirectEvent;
      const myUserId = this.matrixClient.getUserId();
      const selfDMs = userToRooms[myUserId];

      if (selfDMs && selfDMs.length) {
        const neededPatching = this.patchUpSelfDMs(userToRooms); // to avoid multiple devices fighting to correct
        // the account data, only try to send the corrected
        // version once.

        console.warn(`Invalid m.direct account data detected ` + `(self-chats that shouldn't be), patching it up.`);

        if (neededPatching && !this.hasSentOutPatchDirectAccountDataPatch) {
          this.hasSentOutPatchDirectAccountDataPatch = true;
          this.matrixClient.setAccountData('m.direct', userToRooms);
        }
      }

      this.userToRooms = userToRooms;
    }

    return this.userToRooms;
  }

  populateRoomToUser() {
    this.roomToUser = {};

    for (const user of Object.keys(this.getUserToRooms())) {
      for (const roomId of this.userToRooms[user]) {
        this.roomToUser[roomId] = user;
      }
    }
  }

}

exports.default = DMRoomMap;
(0, _defineProperty2.default)(DMRoomMap, "sharedInstance", void 0);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9ETVJvb21NYXAudHMiXSwibmFtZXMiOlsiRE1Sb29tTWFwIiwiY29uc3RydWN0b3IiLCJtYXRyaXhDbGllbnQiLCJldiIsImdldFR5cGUiLCJtRGlyZWN0RXZlbnQiLCJnZXRBY2NvdW50RGF0YSIsImdldENvbnRlbnQiLCJ1c2VyVG9Sb29tcyIsInJvb21Ub1VzZXIiLCJoYXNTZW50T3V0UGF0Y2hEaXJlY3RBY2NvdW50RGF0YVBhdGNoIiwibWFrZVNoYXJlZCIsInNoYXJlZEluc3RhbmNlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic2hhcmVkIiwic3RhcnQiLCJwb3B1bGF0ZVJvb21Ub1VzZXIiLCJvbiIsIm9uQWNjb3VudERhdGEiLCJzdG9wIiwicmVtb3ZlTGlzdGVuZXIiLCJwYXRjaFVwU2VsZkRNcyIsIm15VXNlcklkIiwiZ2V0VXNlcklkIiwic2VsZlJvb21JZHMiLCJndWVzc2VkVXNlcklkc1RoYXRDaGFuZ2VkIiwibWFwIiwicm9vbUlkIiwicm9vbSIsImdldFJvb20iLCJ1c2VySWQiLCJndWVzc0RNVXNlcklkIiwiZmlsdGVyIiwiaWRzIiwibGVuZ3RoIiwic29tZSIsImZvckVhY2giLCJyb29tSWRzIiwicHVzaCIsImdldERNUm9vbXNGb3JVc2VySWQiLCJnZXRVc2VyVG9Sb29tcyIsImdldERNUm9vbUZvcklkZW50aWZpZXJzIiwiY29tbW9uUm9vbXMiLCJpIiwidXNlclJvb21zIiwiciIsImluY2x1ZGVzIiwiam9pbmVkUm9vbXMiLCJnZXRNeU1lbWJlcnNoaXAiLCJnZXRVc2VySWRGb3JSb29tSWQiLCJ1bmRlZmluZWQiLCJnZXRETUludml0ZXIiLCJnZXRVbmlxdWVSb29tc1dpdGhJbmRpdmlkdWFscyIsIk9iamVjdCIsImtleXMiLCJnZXRJbnZpdGVkQW5kSm9pbmVkTWVtYmVyQ291bnQiLCJyZWR1Y2UiLCJvYmoiLCJzZWxmRE1zIiwibmVlZGVkUGF0Y2hpbmciLCJjb25zb2xlIiwid2FybiIsInNl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LENBQWlDLFVBQWpDLEVBQTZDdkQsV0FBN0M7QUFDSDtBQUNKOztBQUNELFdBQUtBLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0g7O0FBQ0QsV0FBTyxLQUFLQSxXQUFaO0FBQ0g7O0FBRU9TLEVBQUFBLGtCQUFSLEdBQTZCO0FBQ3pCLFNBQUtSLFVBQUwsR0FBa0IsRUFBbEI7O0FBQ0EsU0FBSyxNQUFNdUQsSUFBWCxJQUFtQlYsTUFBTSxDQUFDQyxJQUFQLENBQVksS0FBS2QsY0FBTCxFQUFaLENBQW5CLEVBQXVEO0FBQ25ELFdBQUssTUFBTWIsTUFBWCxJQUFxQixLQUFLcEIsV0FBTCxDQUFpQndELElBQWpCLENBQXJCLEVBQTZDO0FBQ3pDLGFBQUt2RCxVQUFMLENBQWdCbUIsTUFBaEIsSUFBMEJvQyxJQUExQjtBQUNIO0FBQ0o7QUFDSjs7QUFyTDBCOzs7OEJBQVZoRSxTIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2LCAyMDE5LCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQge3VuaXF9IGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7Um9vbX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQge0V2ZW50fSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgdGFrZXMgYSBNYXRyaXggQ2xpZW50IGFuZCBmbGlwcyB0aGUgbS5kaXJlY3QgbWFwXG4gKiBzbyB0aGUgb3BlcmF0aW9uIG9mIG1hcHBpbmcgYSByb29tIElEIHRvIHdoaWNoIHVzZXIgaXQncyBhIERNXG4gKiB3aXRoIGNhbiBiZSBwZXJmb3JtZWQgZWZmaWNpZW50bHkuXG4gKlxuICogV2l0aCAnc3RhcnQnLCB0aGlzIGNhbiBhbHNvIGtlZXAgaXRzZWxmIHVwIHRvIGRhdGUgb3ZlciB0aW1lLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBETVJvb21NYXAge1xuICAgIHByaXZhdGUgc3RhdGljIHNoYXJlZEluc3RhbmNlOiBETVJvb21NYXA7XG5cbiAgICBwcml2YXRlIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50O1xuICAgIC8vIFRPRE86IGNvbnZlcnQgdGhlc2UgdG8gbWFwc1xuICAgIHByaXZhdGUgcm9vbVRvVXNlcjoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSBudWxsO1xuICAgIHByaXZhdGUgdXNlclRvUm9vbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0gPSBudWxsO1xuICAgIHByaXZhdGUgaGFzU2VudE91dFBhdGNoRGlyZWN0QWNjb3VudERhdGFQYXRjaDogYm9vbGVhbjtcbiAgICBwcml2YXRlIG1EaXJlY3RFdmVudDogRXZlbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXRyaXhDbGllbnQpIHtcbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQgPSBtYXRyaXhDbGllbnQ7XG4gICAgICAgIC8vIHNlZSBvbkFjY291bnREYXRhXG4gICAgICAgIHRoaXMuaGFzU2VudE91dFBhdGNoRGlyZWN0QWNjb3VudERhdGFQYXRjaCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IG1EaXJlY3RFdmVudCA9IG1hdHJpeENsaWVudC5nZXRBY2NvdW50RGF0YSgnbS5kaXJlY3QnKTtcbiAgICAgICAgdGhpcy5tRGlyZWN0RXZlbnQgPSBtRGlyZWN0RXZlbnQgPyBtRGlyZWN0RXZlbnQuZ2V0Q29udGVudCgpIDoge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYW5kIHJldHVybnMgYSBuZXcgc2hhcmVkIGluc3RhbmNlIHRoYXQgY2FuIHRoZW4gYmUgYWNjZXNzZWRcbiAgICAgKiB3aXRoIHNoYXJlZCgpLiBUaGlzIHJldHVybmVkIGluc3RhbmNlIGlzIG5vdCBhdXRvbWF0aWNhbGx5IHN0YXJ0ZWQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBtYWtlU2hhcmVkKCk6IERNUm9vbU1hcCB7XG4gICAgICAgIERNUm9vbU1hcC5zaGFyZWRJbnN0YW5jZSA9IG5ldyBETVJvb21NYXAoTWF0cml4Q2xpZW50UGVnLmdldCgpKTtcbiAgICAgICAgcmV0dXJuIERNUm9vbU1hcC5zaGFyZWRJbnN0YW5jZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc2hhcmVkIGluc3RhbmNlIG9mIHRoZSBjbGFzc1xuICAgICAqIHRoYXQgdXNlcyB0aGUgc2luZ2xldG9uIG1hdHJpeCBjbGllbnRcbiAgICAgKiBUaGUgc2hhcmVkIGluc3RhbmNlIG11c3QgYmUgc3RhcnRlZCBiZWZvcmUgdXNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgc2hhcmVkKCk6IERNUm9vbU1hcCB7XG4gICAgICAgIHJldHVybiBETVJvb21NYXAuc2hhcmVkSW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXJ0KCkge1xuICAgICAgICB0aGlzLnBvcHVsYXRlUm9vbVRvVXNlcigpO1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5vbihcImFjY291bnREYXRhXCIsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3AoKSB7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiYWNjb3VudERhdGFcIiwgdGhpcy5vbkFjY291bnREYXRhKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWNjb3VudERhdGEgPSAoZXYpID0+IHtcbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PSAnbS5kaXJlY3QnKSB7XG4gICAgICAgICAgICB0aGlzLm1EaXJlY3RFdmVudCA9IHRoaXMubWF0cml4Q2xpZW50LmdldEFjY291bnREYXRhKCdtLmRpcmVjdCcpLmdldENvbnRlbnQoKSB8fCB7fTtcbiAgICAgICAgICAgIHRoaXMudXNlclRvUm9vbXMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yb29tVG9Vc2VyID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNvbWUgY2xpZW50IGJ1ZyBzb21ld2hlcmUgaXMgY2F1c2luZyBzb21lIERNcyB0byBiZSBtYXJrZWRcbiAgICAgKiB3aXRoIG91cnNlbGYsIG5vdCB0aGUgb3RoZXIgdXNlci4gRml4IGl0IGJ5IGd1ZXNzaW5nIHRoZSBvdGhlciB1c2VyIGFuZFxuICAgICAqIG1vZGlmeWluZyB1c2VyVG9Sb29tc1xuICAgICAqL1xuICAgIHByaXZhdGUgcGF0Y2hVcFNlbGZETXModXNlclRvUm9vbXMpIHtcbiAgICAgICAgY29uc3QgbXlVc2VySWQgPSB0aGlzLm1hdHJpeENsaWVudC5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3Qgc2VsZlJvb21JZHMgPSB1c2VyVG9Sb29tc1tteVVzZXJJZF07XG4gICAgICAgIGlmIChzZWxmUm9vbUlkcykge1xuICAgICAgICAgICAgLy8gYW55IHNlbGYtY2hhdHMgdGhhdCBzaG91bGQgbm90IGJlIHNlbGYtY2hhdHM/XG4gICAgICAgICAgICBjb25zdCBndWVzc2VkVXNlcklkc1RoYXRDaGFuZ2VkID0gc2VsZlJvb21JZHMubWFwKChyb29tSWQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHJvb20uZ3Vlc3NETVVzZXJJZCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXNlcklkICYmIHVzZXJJZCAhPT0gbXlVc2VySWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7dXNlcklkLCByb29tSWR9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuZmlsdGVyKChpZHMpID0+ICEhaWRzKTsgLy9maWx0ZXIgb3V0XG4gICAgICAgICAgICAvLyB0aGVzZSBhcmUgYWN0dWFsbHkgYWxsIGxlZ2l0IHNlbGYtY2hhdHNcbiAgICAgICAgICAgIC8vIGJhaWwgb3V0XG4gICAgICAgICAgICBpZiAoIWd1ZXNzZWRVc2VySWRzVGhhdENoYW5nZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlclRvUm9vbXNbbXlVc2VySWRdID0gc2VsZlJvb21JZHMuZmlsdGVyKChyb29tSWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIWd1ZXNzZWRVc2VySWRzVGhhdENoYW5nZWRcbiAgICAgICAgICAgICAgICAgICAgLnNvbWUoKGlkcykgPT4gaWRzLnJvb21JZCA9PT0gcm9vbUlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ3Vlc3NlZFVzZXJJZHNUaGF0Q2hhbmdlZC5mb3JFYWNoKCh7dXNlcklkLCByb29tSWR9KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbUlkcyA9IHVzZXJUb1Jvb21zW3VzZXJJZF07XG4gICAgICAgICAgICAgICAgaWYgKCFyb29tSWRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJUb1Jvb21zW3VzZXJJZF0gPSBbcm9vbUlkXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByb29tSWRzLnB1c2gocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgdXNlclRvUm9vbXNbdXNlcklkXSA9IHVuaXEocm9vbUlkcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRETVJvb21zRm9yVXNlcklkKHVzZXJJZCk6IHN0cmluZ1tdIHtcbiAgICAgICAgLy8gSGVyZSwgd2UgcmV0dXJuIHRoZSBlbXB0eSBsaXN0IGlmIHRoZXJlIGFyZSBubyByb29tcyxcbiAgICAgICAgLy8gc2luY2UgdGhlIG51bWJlciBvZiBjb252ZXJzYXRpb25zIHlvdSBoYXZlIHdpdGggdGhpcyB1c2VyIGlzIHplcm8uXG4gICAgICAgIHJldHVybiB0aGlzLmdldFVzZXJUb1Jvb21zKClbdXNlcklkXSB8fCBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBETSByb29tIHdoaWNoIHRoZSBnaXZlbiBJRHMgc2hhcmUsIGlmIGFueS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBpZHMgVGhlIGlkZW50aWZpZXJzICh1c2VyIElEcyBhbmQgZW1haWwgYWRkcmVzc2VzKSB0byBsb29rIGZvci5cbiAgICAgKiBAcmV0dXJucyB7Um9vbX0gVGhlIERNIHJvb20gd2hpY2ggYWxsIElEcyBnaXZlbiBzaGFyZSwgb3IgZmFsc2V5IGlmIG5vIGNvbW1vbiByb29tLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRETVJvb21Gb3JJZGVudGlmaWVycyhpZHM6IHN0cmluZ1tdKTogUm9vbSB7XG4gICAgICAgIC8vIFRPRE86IFtDYW5vbmljYWwgRE1zXSBIYW5kbGUgbG9va3VwcyBmb3IgZW1haWwgYWRkcmVzc2VzLlxuICAgICAgICAvLyBGb3Igbm93IHdlJ2xsIHByZXRlbmQgd2Ugb25seSBnZXQgdXNlciBJRHMgYW5kIGVuZCB1cCByZXR1cm5pbmcgbm90aGluZyBmb3IgZW1haWwgYWRkcmVzc2VzXG5cbiAgICAgICAgbGV0IGNvbW1vblJvb21zID0gdGhpcy5nZXRETVJvb21zRm9yVXNlcklkKGlkc1swXSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VyUm9vbXMgPSB0aGlzLmdldERNUm9vbXNGb3JVc2VySWQoaWRzW2ldKTtcbiAgICAgICAgICAgIGNvbW1vblJvb21zID0gY29tbW9uUm9vbXMuZmlsdGVyKHIgPT4gdXNlclJvb21zLmluY2x1ZGVzKHIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGpvaW5lZFJvb21zID0gY29tbW9uUm9vbXMubWFwKHIgPT4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocikpXG4gICAgICAgICAgICAuZmlsdGVyKHIgPT4gciAmJiByLmdldE15TWVtYmVyc2hpcCgpID09PSAnam9pbicpO1xuXG4gICAgICAgIHJldHVybiBqb2luZWRSb29tc1swXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VXNlcklkRm9yUm9vbUlkKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb21Ub1VzZXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gd2UgbGF6aWx5IHBvcHVsYXRlIHJvb21Ub1VzZXIgc28geW91IGNhbiB1c2VcbiAgICAgICAgICAgIC8vIHRoaXMgY2xhc3MganVzdCB0byBjYWxsIGdldERNUm9vbXNGb3JVc2VySWRcbiAgICAgICAgICAgIC8vIHdoaWNoIGRvZXNuJ3QgZG8gdmVyeSBtdWNoLCBidXQgaXMgYSBmYWlybHlcbiAgICAgICAgICAgIC8vIGNvbnZlbmllbnQgd3JhcHBlciBhbmQgdGhlcmUncyBubyBwb2ludFxuICAgICAgICAgICAgLy8gaXRlcmF0aW5nIHRocm91Z2ggdGhlIG1hcCBpZiBnZXRVc2VySWRGb3JSb29tSWQoKVxuICAgICAgICAgICAgLy8gaXMgbmV2ZXIgY2FsbGVkLlxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZVJvb21Ub1VzZXIoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIZXJlLCB3ZSByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZSByb29tIGlzIG5vdCBpbiB0aGUgbWFwOlxuICAgICAgICAvLyB0aGUgcm9vbSBJRCB5b3UgZ2F2ZSBpcyBub3QgYSBETSByb29tIGZvciBhbnkgdXNlci5cbiAgICAgICAgaWYgKHRoaXMucm9vbVRvVXNlcltyb29tSWRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIG5vIGVudHJ5PyBpZiB0aGUgcm9vbSBpcyBhbiBpbnZpdGUsIGxvb2sgZm9yIHRoZSBpc19kaXJlY3QgaGludC5cbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByb29tLmdldERNSW52aXRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnJvb21Ub1VzZXJbcm9vbUlkXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VW5pcXVlUm9vbXNXaXRoSW5kaXZpZHVhbHMoKToge1t1c2VySWQ6IHN0cmluZ106IFJvb219IHtcbiAgICAgICAgaWYgKCF0aGlzLnJvb21Ub1VzZXIpIHJldHVybiB7fTsgLy8gTm8gcm9vbXMgbWVhbnMgbm8gbWFwLlxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5yb29tVG9Vc2VyKVxuICAgICAgICAgICAgLm1hcChyID0+ICh7dXNlcklkOiB0aGlzLmdldFVzZXJJZEZvclJvb21JZChyKSwgcm9vbTogdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyKX0pKVxuICAgICAgICAgICAgLmZpbHRlcihyID0+IHIudXNlcklkICYmIHIucm9vbSAmJiByLnJvb20uZ2V0SW52aXRlZEFuZEpvaW5lZE1lbWJlckNvdW50KCkgPT09IDIpXG4gICAgICAgICAgICAucmVkdWNlKChvYmosIHIpID0+IChvYmpbci51c2VySWRdID0gci5yb29tKSAmJiBvYmosIHt9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFVzZXJUb1Jvb21zKCk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0ge1xuICAgICAgICBpZiAoIXRoaXMudXNlclRvUm9vbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJUb1Jvb21zID0gdGhpcy5tRGlyZWN0RXZlbnQgYXMge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfTtcbiAgICAgICAgICAgIGNvbnN0IG15VXNlcklkID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICBjb25zdCBzZWxmRE1zID0gdXNlclRvUm9vbXNbbXlVc2VySWRdO1xuICAgICAgICAgICAgaWYgKHNlbGZETXMgJiYgc2VsZkRNcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZWVkZWRQYXRjaGluZyA9IHRoaXMucGF0Y2hVcFNlbGZETXModXNlclRvUm9vbXMpO1xuICAgICAgICAgICAgICAgIC8vIHRvIGF2b2lkIG11bHRpcGxlIGRldmljZXMgZmlnaHRpbmcgdG8gY29ycmVjdFxuICAgICAgICAgICAgICAgIC8vIHRoZSBhY2NvdW50IGRhdGEsIG9ubHkgdHJ5IHRvIHNlbmQgdGhlIGNvcnJlY3RlZFxuICAgICAgICAgICAgICAgIC8vIHZlcnNpb24gb25jZS5cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEludmFsaWQgbS5kaXJlY3QgYWNjb3VudCBkYXRhIGRldGVjdGVkIGAgK1xuICAgICAgICAgICAgICAgICAgICBgKHNlbGYtY2hhdHMgdGhhdCBzaG91bGRuJ3QgYmUpLCBwYXRjaGluZyBpdCB1cC5gKTtcbiAgICAgICAgICAgICAgICBpZiAobmVlZGVkUGF0Y2hpbmcgJiYgIXRoaXMuaGFzU2VudE91dFBhdGNoRGlyZWN0QWNjb3VudERhdGFQYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc1NlbnRPdXRQYXRjaERpcmVjdEFjY291bnREYXRhUGF0Y2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5zZXRBY2NvdW50RGF0YSgnbS5kaXJlY3QnLCB1c2VyVG9Sb29tcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51c2VyVG9Sb29tcyA9IHVzZXJUb1Jvb21zO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnVzZXJUb1Jvb21zO1xuICAgIH1cblxuICAgIHByaXZhdGUgcG9wdWxhdGVSb29tVG9Vc2VyKCkge1xuICAgICAgICB0aGlzLnJvb21Ub1VzZXIgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB1c2VyIG9mIE9iamVjdC5rZXlzKHRoaXMuZ2V0VXNlclRvUm9vbXMoKSkpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgcm9vbUlkIG9mIHRoaXMudXNlclRvUm9vbXNbdXNlcl0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21Ub1VzZXJbcm9vbUlkXSA9IHVzZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
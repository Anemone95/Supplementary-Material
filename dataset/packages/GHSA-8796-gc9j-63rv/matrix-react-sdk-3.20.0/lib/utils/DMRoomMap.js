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
   * Set the shared instance to the instance supplied
   * Used by tests
   * @param inst the new shared instance
   */


  static setShared(inst
  /*: DMRoomMap*/
  ) {
    DMRoomMap.sharedInstance = inst;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9ETVJvb21NYXAudHMiXSwibmFtZXMiOlsiRE1Sb29tTWFwIiwiY29uc3RydWN0b3IiLCJtYXRyaXhDbGllbnQiLCJldiIsImdldFR5cGUiLCJtRGlyZWN0RXZlbnQiLCJnZXRBY2NvdW50RGF0YSIsImdldENvbnRlbnQiLCJ1c2VyVG9Sb29tcyIsInJvb21Ub1VzZXIiLCJoYXNTZW50T3V0UGF0Y2hEaXJlY3RBY2NvdW50RGF0YVBhdGNoIiwibWFrZVNoYXJlZCIsInNoYXJlZEluc3RhbmNlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic2V0U2hhcmVkIiwiaW5zdCIsInNoYXJlZCIsInN0YXJ0IiwicG9wdWxhdGVSb29tVG9Vc2VyIiwib24iLCJvbkFjY291bnREYXRhIiwic3RvcCIsInJlbW92ZUxpc3RlbmVyIiwicGF0Y2hVcFNlbGZETXMiLCJteVVzZXJJZCIsImdldFVzZXJJZCIsInNlbGZSb29tSWRzIiwiZ3Vlc3NlZFVzZXJJZHNUaGF0Q2hhbmdlZCIsIm1hcCIsInJvb21JZCIsInJvb20iLCJnZXRSb29tIiwidXNlcklkIiwiZ3Vlc3NETVVzZXJJZCIsImZpbHRlciIsImlkcyIsImxlbmd0aCIsInNvbWUiLCJmb3JFYWNoIiwicm9vbUlkcyIsInB1c2giLCJnZXRETVJvb21zRm9yVXNlcklkIiwiZ2V0VXNlclRvUm9vbXMiLCJnZXRETVJvb21Gb3JJZGVudGlmaWVycyIsImNvbW1vblJvb21zIiwiaSIsInVzZXJSb29tcyIsInIiLCJpbmNsdWRlcyIsImpvaW5lZFJvb21zIiwiZ2V0TXlNZW1iZXJzaGlwIiwiZ2V0VXNlcklkRm9yUm9vbUlkIiwidW5kZWZpbmVkIiwiZ2V0RE1JbnZpdGVyIiwiZ2V0VW5pcXVlUm9vbXNXaXRoSW5kaXZpZHVhbHMiLCJPYmplY3QiLCJrZXlzIiwiZ2V0SW52aXRlZEFuZEpvaW5lZE1lbWJlckNvdW50IiwicmVkdWNlIiwib2JqIiwic2VsZkRNcyIsIm5lZWRlZFBhdGNoaW5nIiwi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QU8sQ0FBQ0MsSUFBUixDQUFjLHlDQUFELEdBQ1IsaURBREw7O0FBRUEsWUFBSUYsY0FBYyxJQUFJLENBQUMsS0FBS3BELHFDQUE1QixFQUFtRTtBQUMvRCxlQUFLQSxxQ0FBTCxHQUE2QyxJQUE3QztBQUNBLGVBQUtSLFlBQUwsQ0FBa0IrRCxjQUFsQixDQUFpQyxVQUFqQyxFQUE2Q3pELFdBQTdDO0FBQ0g7QUFDSjs7QUFDRCxXQUFLQSxXQUFMLEdBQW1CQSxXQUFuQjtBQUNIOztBQUNELFdBQU8sS0FBS0EsV0FBWjtBQUNIOztBQUVPVyxFQUFBQSxrQkFBUixHQUE2QjtBQUN6QixTQUFLVixVQUFMLEdBQWtCLEVBQWxCOztBQUNBLFNBQUssTUFBTXlELElBQVgsSUFBbUJWLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLEtBQUtkLGNBQUwsRUFBWixDQUFuQixFQUF1RDtBQUNuRCxXQUFLLE1BQU1iLE1BQVgsSUFBcUIsS0FBS3RCLFdBQUwsQ0FBaUIwRCxJQUFqQixDQUFyQixFQUE2QztBQUN6QyxhQUFLekQsVUFBTCxDQUFnQnFCLE1BQWhCLElBQTBCb0MsSUFBMUI7QUFDSDtBQUNKO0FBQ0o7O0FBOUwwQjs7OzhCQUFWbEUsUyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiwgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHt1bmlxfSBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHtFdmVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnR9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcblxuLyoqXG4gKiBDbGFzcyB0aGF0IHRha2VzIGEgTWF0cml4IENsaWVudCBhbmQgZmxpcHMgdGhlIG0uZGlyZWN0IG1hcFxuICogc28gdGhlIG9wZXJhdGlvbiBvZiBtYXBwaW5nIGEgcm9vbSBJRCB0byB3aGljaCB1c2VyIGl0J3MgYSBETVxuICogd2l0aCBjYW4gYmUgcGVyZm9ybWVkIGVmZmljaWVudGx5LlxuICpcbiAqIFdpdGggJ3N0YXJ0JywgdGhpcyBjYW4gYWxzbyBrZWVwIGl0c2VsZiB1cCB0byBkYXRlIG92ZXIgdGltZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRE1Sb29tTWFwIHtcbiAgICBwcml2YXRlIHN0YXRpYyBzaGFyZWRJbnN0YW5jZTogRE1Sb29tTWFwO1xuXG4gICAgcHJpdmF0ZSBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudDtcbiAgICAvLyBUT0RPOiBjb252ZXJ0IHRoZXNlIHRvIG1hcHNcbiAgICBwcml2YXRlIHJvb21Ub1VzZXI6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0gbnVsbDtcbiAgICBwcml2YXRlIHVzZXJUb1Jvb21zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0gbnVsbDtcbiAgICBwcml2YXRlIGhhc1NlbnRPdXRQYXRjaERpcmVjdEFjY291bnREYXRhUGF0Y2g6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBtRGlyZWN0RXZlbnQ6IEV2ZW50O1xuXG4gICAgY29uc3RydWN0b3IobWF0cml4Q2xpZW50KSB7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50ID0gbWF0cml4Q2xpZW50O1xuICAgICAgICAvLyBzZWUgb25BY2NvdW50RGF0YVxuICAgICAgICB0aGlzLmhhc1NlbnRPdXRQYXRjaERpcmVjdEFjY291bnREYXRhUGF0Y2ggPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBtRGlyZWN0RXZlbnQgPSBtYXRyaXhDbGllbnQuZ2V0QWNjb3VudERhdGEoJ20uZGlyZWN0Jyk7XG4gICAgICAgIHRoaXMubURpcmVjdEV2ZW50ID0gbURpcmVjdEV2ZW50ID8gbURpcmVjdEV2ZW50LmdldENvbnRlbnQoKSA6IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGFuZCByZXR1cm5zIGEgbmV3IHNoYXJlZCBpbnN0YW5jZSB0aGF0IGNhbiB0aGVuIGJlIGFjY2Vzc2VkXG4gICAgICogd2l0aCBzaGFyZWQoKS4gVGhpcyByZXR1cm5lZCBpbnN0YW5jZSBpcyBub3QgYXV0b21hdGljYWxseSBzdGFydGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbWFrZVNoYXJlZCgpOiBETVJvb21NYXAge1xuICAgICAgICBETVJvb21NYXAuc2hhcmVkSW5zdGFuY2UgPSBuZXcgRE1Sb29tTWFwKE1hdHJpeENsaWVudFBlZy5nZXQoKSk7XG4gICAgICAgIHJldHVybiBETVJvb21NYXAuc2hhcmVkSW5zdGFuY2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBzaGFyZWQgaW5zdGFuY2UgdG8gdGhlIGluc3RhbmNlIHN1cHBsaWVkXG4gICAgICogVXNlZCBieSB0ZXN0c1xuICAgICAqIEBwYXJhbSBpbnN0IHRoZSBuZXcgc2hhcmVkIGluc3RhbmNlXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzZXRTaGFyZWQoaW5zdDogRE1Sb29tTWFwKSB7XG4gICAgICAgIERNUm9vbU1hcC5zaGFyZWRJbnN0YW5jZSA9IGluc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHNoYXJlZCBpbnN0YW5jZSBvZiB0aGUgY2xhc3NcbiAgICAgKiB0aGF0IHVzZXMgdGhlIHNpbmdsZXRvbiBtYXRyaXggY2xpZW50XG4gICAgICogVGhlIHNoYXJlZCBpbnN0YW5jZSBtdXN0IGJlIHN0YXJ0ZWQgYmVmb3JlIHVzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHNoYXJlZCgpOiBETVJvb21NYXAge1xuICAgICAgICByZXR1cm4gRE1Sb29tTWFwLnNoYXJlZEluc3RhbmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5wb3B1bGF0ZVJvb21Ub1VzZXIoKTtcbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQub24oXCJhY2NvdW50RGF0YVwiLCB0aGlzLm9uQWNjb3VudERhdGEpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wKCkge1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5yZW1vdmVMaXN0ZW5lcihcImFjY291bnREYXRhXCIsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjY291bnREYXRhID0gKGV2KSA9PiB7XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT0gJ20uZGlyZWN0Jykge1xuICAgICAgICAgICAgdGhpcy5tRGlyZWN0RXZlbnQgPSB0aGlzLm1hdHJpeENsaWVudC5nZXRBY2NvdW50RGF0YSgnbS5kaXJlY3QnKS5nZXRDb250ZW50KCkgfHwge307XG4gICAgICAgICAgICB0aGlzLnVzZXJUb1Jvb21zID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucm9vbVRvVXNlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzb21lIGNsaWVudCBidWcgc29tZXdoZXJlIGlzIGNhdXNpbmcgc29tZSBETXMgdG8gYmUgbWFya2VkXG4gICAgICogd2l0aCBvdXJzZWxmLCBub3QgdGhlIG90aGVyIHVzZXIuIEZpeCBpdCBieSBndWVzc2luZyB0aGUgb3RoZXIgdXNlciBhbmRcbiAgICAgKiBtb2RpZnlpbmcgdXNlclRvUm9vbXNcbiAgICAgKi9cbiAgICBwcml2YXRlIHBhdGNoVXBTZWxmRE1zKHVzZXJUb1Jvb21zKSB7XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VXNlcklkKCk7XG4gICAgICAgIGNvbnN0IHNlbGZSb29tSWRzID0gdXNlclRvUm9vbXNbbXlVc2VySWRdO1xuICAgICAgICBpZiAoc2VsZlJvb21JZHMpIHtcbiAgICAgICAgICAgIC8vIGFueSBzZWxmLWNoYXRzIHRoYXQgc2hvdWxkIG5vdCBiZSBzZWxmLWNoYXRzP1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3NlZFVzZXJJZHNUaGF0Q2hhbmdlZCA9IHNlbGZSb29tSWRzLm1hcCgocm9vbUlkKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSByb29tLmd1ZXNzRE1Vc2VySWQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXJJZCAmJiB1c2VySWQgIT09IG15VXNlcklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge3VzZXJJZCwgcm9vbUlkfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmZpbHRlcigoaWRzKSA9PiAhIWlkcyk7IC8vZmlsdGVyIG91dFxuICAgICAgICAgICAgLy8gdGhlc2UgYXJlIGFjdHVhbGx5IGFsbCBsZWdpdCBzZWxmLWNoYXRzXG4gICAgICAgICAgICAvLyBiYWlsIG91dFxuICAgICAgICAgICAgaWYgKCFndWVzc2VkVXNlcklkc1RoYXRDaGFuZ2VkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXJUb1Jvb21zW215VXNlcklkXSA9IHNlbGZSb29tSWRzLmZpbHRlcigocm9vbUlkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFndWVzc2VkVXNlcklkc1RoYXRDaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgIC5zb21lKChpZHMpID0+IGlkcy5yb29tSWQgPT09IHJvb21JZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGd1ZXNzZWRVc2VySWRzVGhhdENoYW5nZWQuZm9yRWFjaCgoe3VzZXJJZCwgcm9vbUlkfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZHMgPSB1c2VyVG9Sb29tc1t1c2VySWRdO1xuICAgICAgICAgICAgICAgIGlmICghcm9vbUlkcykge1xuICAgICAgICAgICAgICAgICAgICB1c2VyVG9Sb29tc1t1c2VySWRdID0gW3Jvb21JZF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbUlkcy5wdXNoKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJUb1Jvb21zW3VzZXJJZF0gPSB1bmlxKHJvb21JZHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RE1Sb29tc0ZvclVzZXJJZCh1c2VySWQpOiBzdHJpbmdbXSB7XG4gICAgICAgIC8vIEhlcmUsIHdlIHJldHVybiB0aGUgZW1wdHkgbGlzdCBpZiB0aGVyZSBhcmUgbm8gcm9vbXMsXG4gICAgICAgIC8vIHNpbmNlIHRoZSBudW1iZXIgb2YgY29udmVyc2F0aW9ucyB5b3UgaGF2ZSB3aXRoIHRoaXMgdXNlciBpcyB6ZXJvLlxuICAgICAgICByZXR1cm4gdGhpcy5nZXRVc2VyVG9Sb29tcygpW3VzZXJJZF0gfHwgW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgRE0gcm9vbSB3aGljaCB0aGUgZ2l2ZW4gSURzIHNoYXJlLCBpZiBhbnkuXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gaWRzIFRoZSBpZGVudGlmaWVycyAodXNlciBJRHMgYW5kIGVtYWlsIGFkZHJlc3NlcykgdG8gbG9vayBmb3IuXG4gICAgICogQHJldHVybnMge1Jvb219IFRoZSBETSByb29tIHdoaWNoIGFsbCBJRHMgZ2l2ZW4gc2hhcmUsIG9yIGZhbHNleSBpZiBubyBjb21tb24gcm9vbS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RE1Sb29tRm9ySWRlbnRpZmllcnMoaWRzOiBzdHJpbmdbXSk6IFJvb20ge1xuICAgICAgICAvLyBUT0RPOiBbQ2Fub25pY2FsIERNc10gSGFuZGxlIGxvb2t1cHMgZm9yIGVtYWlsIGFkZHJlc3Nlcy5cbiAgICAgICAgLy8gRm9yIG5vdyB3ZSdsbCBwcmV0ZW5kIHdlIG9ubHkgZ2V0IHVzZXIgSURzIGFuZCBlbmQgdXAgcmV0dXJuaW5nIG5vdGhpbmcgZm9yIGVtYWlsIGFkZHJlc3Nlc1xuXG4gICAgICAgIGxldCBjb21tb25Sb29tcyA9IHRoaXMuZ2V0RE1Sb29tc0ZvclVzZXJJZChpZHNbMF0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgdXNlclJvb21zID0gdGhpcy5nZXRETVJvb21zRm9yVXNlcklkKGlkc1tpXSk7XG4gICAgICAgICAgICBjb21tb25Sb29tcyA9IGNvbW1vblJvb21zLmZpbHRlcihyID0+IHVzZXJSb29tcy5pbmNsdWRlcyhyKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBqb2luZWRSb29tcyA9IGNvbW1vblJvb21zLm1hcChyID0+IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHIpKVxuICAgICAgICAgICAgLmZpbHRlcihyID0+IHIgJiYgci5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gJ2pvaW4nKTtcblxuICAgICAgICByZXR1cm4gam9pbmVkUm9vbXNbMF07XG4gICAgfVxuXG4gICAgcHVibGljIGdldFVzZXJJZEZvclJvb21JZChyb29tSWQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5yb29tVG9Vc2VyID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIHdlIGxhemlseSBwb3B1bGF0ZSByb29tVG9Vc2VyIHNvIHlvdSBjYW4gdXNlXG4gICAgICAgICAgICAvLyB0aGlzIGNsYXNzIGp1c3QgdG8gY2FsbCBnZXRETVJvb21zRm9yVXNlcklkXG4gICAgICAgICAgICAvLyB3aGljaCBkb2Vzbid0IGRvIHZlcnkgbXVjaCwgYnV0IGlzIGEgZmFpcmx5XG4gICAgICAgICAgICAvLyBjb252ZW5pZW50IHdyYXBwZXIgYW5kIHRoZXJlJ3Mgbm8gcG9pbnRcbiAgICAgICAgICAgIC8vIGl0ZXJhdGluZyB0aHJvdWdoIHRoZSBtYXAgaWYgZ2V0VXNlcklkRm9yUm9vbUlkKClcbiAgICAgICAgICAgIC8vIGlzIG5ldmVyIGNhbGxlZC5cbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGVSb29tVG9Vc2VyKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSGVyZSwgd2UgcmV0dXJuIHVuZGVmaW5lZCBpZiB0aGUgcm9vbSBpcyBub3QgaW4gdGhlIG1hcDpcbiAgICAgICAgLy8gdGhlIHJvb20gSUQgeW91IGdhdmUgaXMgbm90IGEgRE0gcm9vbSBmb3IgYW55IHVzZXIuXG4gICAgICAgIGlmICh0aGlzLnJvb21Ub1VzZXJbcm9vbUlkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBubyBlbnRyeT8gaWYgdGhlIHJvb20gaXMgYW4gaW52aXRlLCBsb29rIGZvciB0aGUgaXNfZGlyZWN0IGhpbnQuXG4gICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vbS5nZXRETUludml0ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yb29tVG9Vc2VyW3Jvb21JZF07XG4gICAgfVxuXG4gICAgcHVibGljIGdldFVuaXF1ZVJvb21zV2l0aEluZGl2aWR1YWxzKCk6IHtbdXNlcklkOiBzdHJpbmddOiBSb29tfSB7XG4gICAgICAgIGlmICghdGhpcy5yb29tVG9Vc2VyKSByZXR1cm4ge307IC8vIE5vIHJvb21zIG1lYW5zIG5vIG1hcC5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucm9vbVRvVXNlcilcbiAgICAgICAgICAgIC5tYXAociA9PiAoe3VzZXJJZDogdGhpcy5nZXRVc2VySWRGb3JSb29tSWQociksIHJvb206IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocil9KSlcbiAgICAgICAgICAgIC5maWx0ZXIociA9PiByLnVzZXJJZCAmJiByLnJvb20gJiYgci5yb29tLmdldEludml0ZWRBbmRKb2luZWRNZW1iZXJDb3VudCgpID09PSAyKVxuICAgICAgICAgICAgLnJlZHVjZSgob2JqLCByKSA9PiAob2JqW3IudXNlcklkXSA9IHIucm9vbSkgJiYgb2JqLCB7fSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRVc2VyVG9Sb29tcygpOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119IHtcbiAgICAgICAgaWYgKCF0aGlzLnVzZXJUb1Jvb21zKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VyVG9Sb29tcyA9IHRoaXMubURpcmVjdEV2ZW50IGFzIHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX07XG4gICAgICAgICAgICBjb25zdCBteVVzZXJJZCA9IHRoaXMubWF0cml4Q2xpZW50LmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZkRNcyA9IHVzZXJUb1Jvb21zW215VXNlcklkXTtcbiAgICAgICAgICAgIGlmIChzZWxmRE1zICYmIHNlbGZETXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmVlZGVkUGF0Y2hpbmcgPSB0aGlzLnBhdGNoVXBTZWxmRE1zKHVzZXJUb1Jvb21zKTtcbiAgICAgICAgICAgICAgICAvLyB0byBhdm9pZCBtdWx0aXBsZSBkZXZpY2VzIGZpZ2h0aW5nIHRvIGNvcnJlY3RcbiAgICAgICAgICAgICAgICAvLyB0aGUgYWNjb3VudCBkYXRhLCBvbmx5IHRyeSB0byBzZW5kIHRoZSBjb3JyZWN0ZWRcbiAgICAgICAgICAgICAgICAvLyB2ZXJzaW9uIG9uY2UuXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBJbnZhbGlkIG0uZGlyZWN0IGFjY291bnQgZGF0YSBkZXRlY3RlZCBgICtcbiAgICAgICAgICAgICAgICAgICAgYChzZWxmLWNoYXRzIHRoYXQgc2hvdWxkbid0IGJlKSwgcGF0Y2hpbmcgaXQgdXAuYCk7XG4gICAgICAgICAgICAgICAgaWYgKG5lZWRlZFBhdGNoaW5nICYmICF0aGlzLmhhc1NlbnRPdXRQYXRjaERpcmVjdEFjY291bnREYXRhUGF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNTZW50T3V0UGF0Y2hEaXJlY3RBY2NvdW50RGF0YVBhdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQuc2V0QWNjb3VudERhdGEoJ20uZGlyZWN0JywgdXNlclRvUm9vbXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudXNlclRvUm9vbXMgPSB1c2VyVG9Sb29tcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy51c2VyVG9Sb29tcztcbiAgICB9XG5cbiAgICBwcml2YXRlIHBvcHVsYXRlUm9vbVRvVXNlcigpIHtcbiAgICAgICAgdGhpcy5yb29tVG9Vc2VyID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdXNlciBvZiBPYmplY3Qua2V5cyh0aGlzLmdldFVzZXJUb1Jvb21zKCkpKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJvb21JZCBvZiB0aGlzLnVzZXJUb1Jvb21zW3VzZXJdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb29tVG9Vc2VyW3Jvb21JZF0gPSB1c2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19
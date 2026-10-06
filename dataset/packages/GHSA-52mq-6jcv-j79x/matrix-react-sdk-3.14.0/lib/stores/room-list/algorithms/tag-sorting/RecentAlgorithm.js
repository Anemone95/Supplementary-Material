"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RecentAlgorithm = void 0;

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var Unread = _interopRequireWildcard(require("../../../../Unread"));

var _membership = require("../../../../utils/membership");

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

/**
 * Sorts rooms according to the last event's timestamp in each room that seems
 * useful to the user.
 */
class RecentAlgorithm
/*:: implements IAlgorithm*/
{
  async sortRooms(rooms
  /*: Room[]*/
  , tagId
  /*: TagID*/
  )
  /*: Promise<Room[]>*/
  {
    // We cache the timestamp lookup to avoid iterating forever on the timeline
    // of events. This cache only survives a single sort though.
    // We wouldn't need this if `.sort()` didn't constantly try and compare all
    // of the rooms to each other.
    // TODO: We could probably improve the sorting algorithm here by finding changes.
    // See https://github.com/vector-im/element-web/issues/14459
    // For example, if we spent a little bit of time to determine which elements have
    // actually changed (probably needs to be done higher up?) then we could do an
    // insertion sort or similar on the limited set of changes.
    // TODO: Don't assume we're using the same client as the peg
    // See https://github.com/vector-im/element-web/issues/14458
    let myUserId = '';

    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();
    }

    const tsCache
    /*: { [roomId: string]: number }*/
    = {};

    const getLastTs = (r
    /*: Room*/
    ) => {
      if (tsCache[r.roomId]) {
        return tsCache[r.roomId];
      }

      const ts = (() => {
        // Apparently we can have rooms without timelines, at least under testing
        // environments. Just return MAX_INT when this happens.
        if (!r || !r.timeline) {
          return Number.MAX_SAFE_INTEGER;
        } // If the room hasn't been joined yet, it probably won't have a timeline to
        // parse. We'll still fall back to the timeline if this fails, but chances
        // are we'll at least have our own membership event to go off of.


        const effectiveMembership = (0, _membership.getEffectiveMembership)(r.getMyMembership());

        if (effectiveMembership !== _membership.EffectiveMembership.Join) {
          const membershipEvent = r.currentState.getStateEvents("m.room.member", myUserId);

          if (membershipEvent && !Array.isArray(membershipEvent)) {
            return membershipEvent.getTs();
          }
        }

        for (let i = r.timeline.length - 1; i >= 0; --i) {
          const ev = r.timeline[i];
          if (!ev.getTs()) continue; // skip events that don't have timestamps (tests only?)

          if (ev.getSender() === myUserId || Unread.eventTriggersUnreadCount(ev)) {
            return ev.getTs();
          }
        } // we might only have events that don't trigger the unread indicator,
        // in which case use the oldest event even if normally it wouldn't count.
        // This is better than just assuming the last event was forever ago.


        if (r.timeline.length && r.timeline[0].getTs()) {
          return r.timeline[0].getTs();
        } else {
          return Number.MAX_SAFE_INTEGER;
        }
      })();

      tsCache[r.roomId] = ts;
      return ts;
    };

    return rooms.sort((a, b) => {
      return getLastTs(b) - getLastTs(a);
    });
  }

}

exports.RecentAlgorithm = RecentAlgorithm;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvdGFnLXNvcnRpbmcvUmVjZW50QWxnb3JpdGhtLnRzIl0sIm5hbWVzIjpbIlJlY2VudEFsZ29yaXRobSIsInNvcnRSb29tcyIsInJvb21zIiwidGFnSWQiLCJteVVzZXJJZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFVzZXJJZCIsInRzQ2FjaGUiLCJnZXRMYXN0VHMiLCJyIiwicm9vbUlkIiwidHMiLCJ0aW1lbGluZSIsIk51bWJlciIsIk1BWF9TQUZFX0lOVEVHRVIiLCJlZmZlY3RpdmVNZW1iZXJzaGlwIiwiZ2V0TXlNZW1iZXJzaGlwIiwiRWZmZWN0aXZlTWVtYmVyc2hpcCIsIkpvaW4iLCJtZW1iZXJzaGlwRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsIkFycmF5IiwiaXNBcnJheSIsImdldFRzIiwiaSIsImxlbmd0aCIsImV2IiwiZ2V0U2VuZGVyIiwiVW5yZWFkIiwiZXZlbnRUcmlnZ2Vyc1VucmVhZENvdW50Iiwic29ydCIsImEiLCJiIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BO0FBQU47QUFBNEM7QUFDL0MsUUFBYUMsU0FBYixDQUF1QkM7QUFBdkI7QUFBQSxJQUFzQ0M7QUFBdEM7QUFBQTtBQUFBO0FBQXFFO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQSxRQUFJQyxRQUFRLEdBQUcsRUFBZjs7QUFDQSxRQUFJQyxpQ0FBZ0JDLEdBQWhCLEVBQUosRUFBMkI7QUFDdkJGLE1BQUFBLFFBQVEsR0FBR0MsaUNBQWdCQyxHQUFoQixHQUFzQkMsU0FBdEIsRUFBWDtBQUNIOztBQUVELFVBQU1DO0FBQXFDO0FBQUEsTUFBRyxFQUE5Qzs7QUFDQSxVQUFNQyxTQUFTLEdBQUcsQ0FBQ0M7QUFBRDtBQUFBLFNBQWE7QUFDM0IsVUFBSUYsT0FBTyxDQUFDRSxDQUFDLENBQUNDLE1BQUgsQ0FBWCxFQUF1QjtBQUNuQixlQUFPSCxPQUFPLENBQUNFLENBQUMsQ0FBQ0MsTUFBSCxDQUFkO0FBQ0g7O0FBRUQsWUFBTUMsRUFBRSxHQUFHLENBQUMsTUFBTTtBQUNkO0FBQ0E7QUFDQSxZQUFJLENBQUNGLENBQUQsSUFBTSxDQUFDQSxDQUFDLENBQUNHLFFBQWIsRUFBdUI7QUFDbkIsaUJBQU9DLE1BQU0sQ0FBQ0MsZ0JBQWQ7QUFDSCxTQUxhLENBT2Q7QUFDQTtBQUNBOzs7QUFDQSxjQUFNQyxtQkFBbUIsR0FBRyx3Q0FBdUJOLENBQUMsQ0FBQ08sZUFBRixFQUF2QixDQUE1Qjs7QUFDQSxZQUFJRCxtQkFBbUIsS0FBS0UsZ0NBQW9CQyxJQUFoRCxFQUFzRDtBQUNsRCxnQkFBTUMsZUFBZSxHQUFHVixDQUFDLENBQUNXLFlBQUYsQ0FBZUMsY0FBZixDQUE4QixlQUE5QixFQUErQ2xCLFFBQS9DLENBQXhCOztBQUNBLGNBQUlnQixlQUFlLElBQUksQ0FBQ0csS0FBSyxDQUFDQyxPQUFOLENBQWNKLGVBQWQsQ0FBeEIsRUFBd0Q7QUFDcEQsbUJBQU9BLGVBQWUsQ0FBQ0ssS0FBaEIsRUFBUDtBQUNIO0FBQ0o7O0FBRUQsYUFBSyxJQUFJQyxDQUFDLEdBQUdoQixDQUFDLENBQUNHLFFBQUYsQ0FBV2MsTUFBWCxHQUFvQixDQUFqQyxFQUFvQ0QsQ0FBQyxJQUFJLENBQXpDLEVBQTRDLEVBQUVBLENBQTlDLEVBQWlEO0FBQzdDLGdCQUFNRSxFQUFFLEdBQUdsQixDQUFDLENBQUNHLFFBQUYsQ0FBV2EsQ0FBWCxDQUFYO0FBQ0EsY0FBSSxDQUFDRSxFQUFFLENBQUNILEtBQUgsRUFBTCxFQUFpQixTQUY0QixDQUVsQjs7QUFFM0IsY0FBSUcsRUFBRSxDQUFDQyxTQUFILE9BQW1CekIsUUFBbkIsSUFBK0IwQixNQUFNLENBQUNDLHdCQUFQLENBQWdDSCxFQUFoQyxDQUFuQyxFQUF3RTtBQUNwRSxtQkFBT0EsRUFBRSxDQUFDSCxLQUFILEVBQVA7QUFDSDtBQUNKLFNBekJhLENBMkJkO0FBQ0E7QUFDQTs7O0FBQ0EsWUFBSWYsQ0FBQyxDQUFDRyxRQUFGLENBQVdjLE1BQVgsSUFBcUJqQixDQUFDLENBQUNHLFFBQUYsQ0FBVyxDQUFYLEVBQWNZLEtBQWQsRUFBekIsRUFBZ0Q7QUFDNUMsaUJBQU9mLENBQUMsQ0FBQ0csUUFBRixDQUFXLENBQVgsRUFBY1ksS0FBZCxFQUFQO0FBQ0gsU0FGRCxNQUVPO0FBQ0gsaUJBQU9YLE1BQU0sQ0FBQ0MsZ0JBQWQ7QUFDSDtBQUNKLE9BbkNVLEdBQVg7O0FBcUNBUCxNQUFBQSxPQUFPLENBQUNFLENBQUMsQ0FBQ0MsTUFBSCxDQUFQLEdBQW9CQyxFQUFwQjtBQUNBLGFBQU9BLEVBQVA7QUFDSCxLQTVDRDs7QUE4Q0EsV0FBT1YsS0FBSyxDQUFDOEIsSUFBTixDQUFXLENBQUNDLENBQUQsRUFBSUMsQ0FBSixLQUFVO0FBQ3hCLGFBQU96QixTQUFTLENBQUN5QixDQUFELENBQVQsR0FBZXpCLFNBQVMsQ0FBQ3dCLENBQUQsQ0FBL0I7QUFDSCxLQUZNLENBQVA7QUFHSDs7QUF0RThDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgVGFnSUQgfSBmcm9tIFwiLi4vLi4vbW9kZWxzXCI7XG5pbXBvcnQgeyBJQWxnb3JpdGhtIH0gZnJvbSBcIi4vSUFsZ29yaXRobVwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0ICogYXMgVW5yZWFkIGZyb20gXCIuLi8uLi8uLi8uLi9VbnJlYWRcIjtcbmltcG9ydCB7IEVmZmVjdGl2ZU1lbWJlcnNoaXAsIGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAgfSBmcm9tIFwiLi4vLi4vLi4vLi4vdXRpbHMvbWVtYmVyc2hpcFwiO1xuXG4vKipcbiAqIFNvcnRzIHJvb21zIGFjY29yZGluZyB0byB0aGUgbGFzdCBldmVudCdzIHRpbWVzdGFtcCBpbiBlYWNoIHJvb20gdGhhdCBzZWVtc1xuICogdXNlZnVsIHRvIHRoZSB1c2VyLlxuICovXG5leHBvcnQgY2xhc3MgUmVjZW50QWxnb3JpdGhtIGltcGxlbWVudHMgSUFsZ29yaXRobSB7XG4gICAgcHVibGljIGFzeW5jIHNvcnRSb29tcyhyb29tczogUm9vbVtdLCB0YWdJZDogVGFnSUQpOiBQcm9taXNlPFJvb21bXT4ge1xuICAgICAgICAvLyBXZSBjYWNoZSB0aGUgdGltZXN0YW1wIGxvb2t1cCB0byBhdm9pZCBpdGVyYXRpbmcgZm9yZXZlciBvbiB0aGUgdGltZWxpbmVcbiAgICAgICAgLy8gb2YgZXZlbnRzLiBUaGlzIGNhY2hlIG9ubHkgc3Vydml2ZXMgYSBzaW5nbGUgc29ydCB0aG91Z2guXG4gICAgICAgIC8vIFdlIHdvdWxkbid0IG5lZWQgdGhpcyBpZiBgLnNvcnQoKWAgZGlkbid0IGNvbnN0YW50bHkgdHJ5IGFuZCBjb21wYXJlIGFsbFxuICAgICAgICAvLyBvZiB0aGUgcm9vbXMgdG8gZWFjaCBvdGhlci5cblxuICAgICAgICAvLyBUT0RPOiBXZSBjb3VsZCBwcm9iYWJseSBpbXByb3ZlIHRoZSBzb3J0aW5nIGFsZ29yaXRobSBoZXJlIGJ5IGZpbmRpbmcgY2hhbmdlcy5cbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NDU5XG4gICAgICAgIC8vIEZvciBleGFtcGxlLCBpZiB3ZSBzcGVudCBhIGxpdHRsZSBiaXQgb2YgdGltZSB0byBkZXRlcm1pbmUgd2hpY2ggZWxlbWVudHMgaGF2ZVxuICAgICAgICAvLyBhY3R1YWxseSBjaGFuZ2VkIChwcm9iYWJseSBuZWVkcyB0byBiZSBkb25lIGhpZ2hlciB1cD8pIHRoZW4gd2UgY291bGQgZG8gYW5cbiAgICAgICAgLy8gaW5zZXJ0aW9uIHNvcnQgb3Igc2ltaWxhciBvbiB0aGUgbGltaXRlZCBzZXQgb2YgY2hhbmdlcy5cblxuICAgICAgICAvLyBUT0RPOiBEb24ndCBhc3N1bWUgd2UncmUgdXNpbmcgdGhlIHNhbWUgY2xpZW50IGFzIHRoZSBwZWdcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NDU4XG4gICAgICAgIGxldCBteVVzZXJJZCA9ICcnO1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpKSB7XG4gICAgICAgICAgICBteVVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRzQ2FjaGU6IHsgW3Jvb21JZDogc3RyaW5nXTogbnVtYmVyIH0gPSB7fTtcbiAgICAgICAgY29uc3QgZ2V0TGFzdFRzID0gKHI6IFJvb20pID0+IHtcbiAgICAgICAgICAgIGlmICh0c0NhY2hlW3Iucm9vbUlkXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0c0NhY2hlW3Iucm9vbUlkXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdHMgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEFwcGFyZW50bHkgd2UgY2FuIGhhdmUgcm9vbXMgd2l0aG91dCB0aW1lbGluZXMsIGF0IGxlYXN0IHVuZGVyIHRlc3RpbmdcbiAgICAgICAgICAgICAgICAvLyBlbnZpcm9ubWVudHMuIEp1c3QgcmV0dXJuIE1BWF9JTlQgd2hlbiB0aGlzIGhhcHBlbnMuXG4gICAgICAgICAgICAgICAgaWYgKCFyIHx8ICFyLnRpbWVsaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcm9vbSBoYXNuJ3QgYmVlbiBqb2luZWQgeWV0LCBpdCBwcm9iYWJseSB3b24ndCBoYXZlIGEgdGltZWxpbmUgdG9cbiAgICAgICAgICAgICAgICAvLyBwYXJzZS4gV2UnbGwgc3RpbGwgZmFsbCBiYWNrIHRvIHRoZSB0aW1lbGluZSBpZiB0aGlzIGZhaWxzLCBidXQgY2hhbmNlc1xuICAgICAgICAgICAgICAgIC8vIGFyZSB3ZSdsbCBhdCBsZWFzdCBoYXZlIG91ciBvd24gbWVtYmVyc2hpcCBldmVudCB0byBnbyBvZmYgb2YuXG4gICAgICAgICAgICAgICAgY29uc3QgZWZmZWN0aXZlTWVtYmVyc2hpcCA9IGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAoci5nZXRNeU1lbWJlcnNoaXAoKSk7XG4gICAgICAgICAgICAgICAgaWYgKGVmZmVjdGl2ZU1lbWJlcnNoaXAgIT09IEVmZmVjdGl2ZU1lbWJlcnNoaXAuSm9pbikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXJzaGlwRXZlbnQgPSByLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5tZW1iZXJcIiwgbXlVc2VySWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVtYmVyc2hpcEV2ZW50ICYmICFBcnJheS5pc0FycmF5KG1lbWJlcnNoaXBFdmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1iZXJzaGlwRXZlbnQuZ2V0VHMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSByLnRpbWVsaW5lLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ID0gci50aW1lbGluZVtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFldi5nZXRUcygpKSBjb250aW51ZTsgLy8gc2tpcCBldmVudHMgdGhhdCBkb24ndCBoYXZlIHRpbWVzdGFtcHMgKHRlc3RzIG9ubHk/KVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldi5nZXRTZW5kZXIoKSA9PT0gbXlVc2VySWQgfHwgVW5yZWFkLmV2ZW50VHJpZ2dlcnNVbnJlYWRDb3VudChldikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBldi5nZXRUcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gd2UgbWlnaHQgb25seSBoYXZlIGV2ZW50cyB0aGF0IGRvbid0IHRyaWdnZXIgdGhlIHVucmVhZCBpbmRpY2F0b3IsXG4gICAgICAgICAgICAgICAgLy8gaW4gd2hpY2ggY2FzZSB1c2UgdGhlIG9sZGVzdCBldmVudCBldmVuIGlmIG5vcm1hbGx5IGl0IHdvdWxkbid0IGNvdW50LlxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYmV0dGVyIHRoYW4ganVzdCBhc3N1bWluZyB0aGUgbGFzdCBldmVudCB3YXMgZm9yZXZlciBhZ28uXG4gICAgICAgICAgICAgICAgaWYgKHIudGltZWxpbmUubGVuZ3RoICYmIHIudGltZWxpbmVbMF0uZ2V0VHMoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gci50aW1lbGluZVswXS5nZXRUcygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICB0c0NhY2hlW3Iucm9vbUlkXSA9IHRzO1xuICAgICAgICAgICAgcmV0dXJuIHRzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiByb29tcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0TGFzdFRzKGIpIC0gZ2V0TGFzdFRzKGEpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=
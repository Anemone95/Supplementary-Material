"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RecentAlgorithm = exports.sortRooms = void 0;

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
const sortRooms = (rooms
/*: Room[]*/
) =>
/*: Room[]*/
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
};
/**
 * Sorts rooms according to the last event's timestamp in each room that seems
 * useful to the user.
 */


exports.sortRooms = sortRooms;

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
    return sortRooms(rooms);
  }

}

exports.RecentAlgorithm = RecentAlgorithm;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvdGFnLXNvcnRpbmcvUmVjZW50QWxnb3JpdGhtLnRzIl0sIm5hbWVzIjpbInNvcnRSb29tcyIsInJvb21zIiwibXlVc2VySWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRVc2VySWQiLCJ0c0NhY2hlIiwiZ2V0TGFzdFRzIiwiciIsInJvb21JZCIsInRzIiwidGltZWxpbmUiLCJOdW1iZXIiLCJNQVhfU0FGRV9JTlRFR0VSIiwiZWZmZWN0aXZlTWVtYmVyc2hpcCIsImdldE15TWVtYmVyc2hpcCIsIkVmZmVjdGl2ZU1lbWJlcnNoaXAiLCJKb2luIiwibWVtYmVyc2hpcEV2ZW50IiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJBcnJheSIsImlzQXJyYXkiLCJnZXRUcyIsImkiLCJsZW5ndGgiLCJldiIsImdldFNlbmRlciIsIlVucmVhZCIsImV2ZW50VHJpZ2dlcnNVbnJlYWRDb3VudCIsInNvcnQiLCJhIiwiYiIsIlJlY2VudEFsZ29yaXRobSIsInRhZ0lkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNPLE1BQU1BLFNBQVMsR0FBRyxDQUFDQztBQUFEO0FBQUE7QUFBQTtBQUEyQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0EsTUFBSUMsUUFBUSxHQUFHLEVBQWY7O0FBQ0EsTUFBSUMsaUNBQWdCQyxHQUFoQixFQUFKLEVBQTJCO0FBQ3ZCRixJQUFBQSxRQUFRLEdBQUdDLGlDQUFnQkMsR0FBaEIsR0FBc0JDLFNBQXRCLEVBQVg7QUFDSDs7QUFFRCxRQUFNQztBQUFxQztBQUFBLElBQUcsRUFBOUM7O0FBQ0EsUUFBTUMsU0FBUyxHQUFHLENBQUNDO0FBQUQ7QUFBQSxPQUFhO0FBQzNCLFFBQUlGLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDQyxNQUFILENBQVgsRUFBdUI7QUFDbkIsYUFBT0gsT0FBTyxDQUFDRSxDQUFDLENBQUNDLE1BQUgsQ0FBZDtBQUNIOztBQUVELFVBQU1DLEVBQUUsR0FBRyxDQUFDLE1BQU07QUFDZDtBQUNBO0FBQ0EsVUFBSSxDQUFDRixDQUFELElBQU0sQ0FBQ0EsQ0FBQyxDQUFDRyxRQUFiLEVBQXVCO0FBQ25CLGVBQU9DLE1BQU0sQ0FBQ0MsZ0JBQWQ7QUFDSCxPQUxhLENBT2Q7QUFDQTtBQUNBOzs7QUFDQSxZQUFNQyxtQkFBbUIsR0FBRyx3Q0FBdUJOLENBQUMsQ0FBQ08sZUFBRixFQUF2QixDQUE1Qjs7QUFDQSxVQUFJRCxtQkFBbUIsS0FBS0UsZ0NBQW9CQyxJQUFoRCxFQUFzRDtBQUNsRCxjQUFNQyxlQUFlLEdBQUdWLENBQUMsQ0FBQ1csWUFBRixDQUFlQyxjQUFmLENBQThCLGVBQTlCLEVBQStDbEIsUUFBL0MsQ0FBeEI7O0FBQ0EsWUFBSWdCLGVBQWUsSUFBSSxDQUFDRyxLQUFLLENBQUNDLE9BQU4sQ0FBY0osZUFBZCxDQUF4QixFQUF3RDtBQUNwRCxpQkFBT0EsZUFBZSxDQUFDSyxLQUFoQixFQUFQO0FBQ0g7QUFDSjs7QUFFRCxXQUFLLElBQUlDLENBQUMsR0FBR2hCLENBQUMsQ0FBQ0csUUFBRixDQUFXYyxNQUFYLEdBQW9CLENBQWpDLEVBQW9DRCxDQUFDLElBQUksQ0FBekMsRUFBNEMsRUFBRUEsQ0FBOUMsRUFBaUQ7QUFDN0MsY0FBTUUsRUFBRSxHQUFHbEIsQ0FBQyxDQUFDRyxRQUFGLENBQVdhLENBQVgsQ0FBWDtBQUNBLFlBQUksQ0FBQ0UsRUFBRSxDQUFDSCxLQUFILEVBQUwsRUFBaUIsU0FGNEIsQ0FFbEI7O0FBRTNCLFlBQUlHLEVBQUUsQ0FBQ0MsU0FBSCxPQUFtQnpCLFFBQW5CLElBQStCMEIsTUFBTSxDQUFDQyx3QkFBUCxDQUFnQ0gsRUFBaEMsQ0FBbkMsRUFBd0U7QUFDcEUsaUJBQU9BLEVBQUUsQ0FBQ0gsS0FBSCxFQUFQO0FBQ0g7QUFDSixPQXpCYSxDQTJCZDtBQUNBO0FBQ0E7OztBQUNBLFVBQUlmLENBQUMsQ0FBQ0csUUFBRixDQUFXYyxNQUFYLElBQXFCakIsQ0FBQyxDQUFDRyxRQUFGLENBQVcsQ0FBWCxFQUFjWSxLQUFkLEVBQXpCLEVBQWdEO0FBQzVDLGVBQU9mLENBQUMsQ0FBQ0csUUFBRixDQUFXLENBQVgsRUFBY1ksS0FBZCxFQUFQO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsZUFBT1gsTUFBTSxDQUFDQyxnQkFBZDtBQUNIO0FBQ0osS0FuQ1UsR0FBWDs7QUFxQ0FQLElBQUFBLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDQyxNQUFILENBQVAsR0FBb0JDLEVBQXBCO0FBQ0EsV0FBT0EsRUFBUDtBQUNILEdBNUNEOztBQThDQSxTQUFPVCxLQUFLLENBQUM2QixJQUFOLENBQVcsQ0FBQ0MsQ0FBRCxFQUFJQyxDQUFKLEtBQVU7QUFDeEIsV0FBT3pCLFNBQVMsQ0FBQ3lCLENBQUQsQ0FBVCxHQUFlekIsU0FBUyxDQUFDd0IsQ0FBRCxDQUEvQjtBQUNILEdBRk0sQ0FBUDtBQUdILENBckVNO0FBdUVQO0FBQ0E7QUFDQTtBQUNBOzs7OztBQUNPLE1BQU1FO0FBQU47QUFBNEM7QUFDL0MsUUFBYWpDLFNBQWIsQ0FBdUJDO0FBQXZCO0FBQUEsSUFBc0NpQztBQUF0QztBQUFBO0FBQUE7QUFBcUU7QUFDakUsV0FBT2xDLFNBQVMsQ0FBQ0MsS0FBRCxDQUFoQjtBQUNIOztBQUg4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IFRhZ0lEIH0gZnJvbSBcIi4uLy4uL21vZGVsc1wiO1xuaW1wb3J0IHsgSUFsZ29yaXRobSB9IGZyb20gXCIuL0lBbGdvcml0aG1cIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCAqIGFzIFVucmVhZCBmcm9tIFwiLi4vLi4vLi4vLi4vVW5yZWFkXCI7XG5pbXBvcnQgeyBFZmZlY3RpdmVNZW1iZXJzaGlwLCBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3V0aWxzL21lbWJlcnNoaXBcIjtcblxuZXhwb3J0IGNvbnN0IHNvcnRSb29tcyA9IChyb29tczogUm9vbVtdKTogUm9vbVtdID0+IHtcbiAgICAvLyBXZSBjYWNoZSB0aGUgdGltZXN0YW1wIGxvb2t1cCB0byBhdm9pZCBpdGVyYXRpbmcgZm9yZXZlciBvbiB0aGUgdGltZWxpbmVcbiAgICAvLyBvZiBldmVudHMuIFRoaXMgY2FjaGUgb25seSBzdXJ2aXZlcyBhIHNpbmdsZSBzb3J0IHRob3VnaC5cbiAgICAvLyBXZSB3b3VsZG4ndCBuZWVkIHRoaXMgaWYgYC5zb3J0KClgIGRpZG4ndCBjb25zdGFudGx5IHRyeSBhbmQgY29tcGFyZSBhbGxcbiAgICAvLyBvZiB0aGUgcm9vbXMgdG8gZWFjaCBvdGhlci5cblxuICAgIC8vIFRPRE86IFdlIGNvdWxkIHByb2JhYmx5IGltcHJvdmUgdGhlIHNvcnRpbmcgYWxnb3JpdGhtIGhlcmUgYnkgZmluZGluZyBjaGFuZ2VzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDQ1OVxuICAgIC8vIEZvciBleGFtcGxlLCBpZiB3ZSBzcGVudCBhIGxpdHRsZSBiaXQgb2YgdGltZSB0byBkZXRlcm1pbmUgd2hpY2ggZWxlbWVudHMgaGF2ZVxuICAgIC8vIGFjdHVhbGx5IGNoYW5nZWQgKHByb2JhYmx5IG5lZWRzIHRvIGJlIGRvbmUgaGlnaGVyIHVwPykgdGhlbiB3ZSBjb3VsZCBkbyBhblxuICAgIC8vIGluc2VydGlvbiBzb3J0IG9yIHNpbWlsYXIgb24gdGhlIGxpbWl0ZWQgc2V0IG9mIGNoYW5nZXMuXG5cbiAgICAvLyBUT0RPOiBEb24ndCBhc3N1bWUgd2UncmUgdXNpbmcgdGhlIHNhbWUgY2xpZW50IGFzIHRoZSBwZWdcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ0NThcbiAgICBsZXQgbXlVc2VySWQgPSAnJztcbiAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpKSB7XG4gICAgICAgIG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHRzQ2FjaGU6IHsgW3Jvb21JZDogc3RyaW5nXTogbnVtYmVyIH0gPSB7fTtcbiAgICBjb25zdCBnZXRMYXN0VHMgPSAocjogUm9vbSkgPT4ge1xuICAgICAgICBpZiAodHNDYWNoZVtyLnJvb21JZF0pIHtcbiAgICAgICAgICAgIHJldHVybiB0c0NhY2hlW3Iucm9vbUlkXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRzID0gKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEFwcGFyZW50bHkgd2UgY2FuIGhhdmUgcm9vbXMgd2l0aG91dCB0aW1lbGluZXMsIGF0IGxlYXN0IHVuZGVyIHRlc3RpbmdcbiAgICAgICAgICAgIC8vIGVudmlyb25tZW50cy4gSnVzdCByZXR1cm4gTUFYX0lOVCB3aGVuIHRoaXMgaGFwcGVucy5cbiAgICAgICAgICAgIGlmICghciB8fCAhci50aW1lbGluZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgdGhlIHJvb20gaGFzbid0IGJlZW4gam9pbmVkIHlldCwgaXQgcHJvYmFibHkgd29uJ3QgaGF2ZSBhIHRpbWVsaW5lIHRvXG4gICAgICAgICAgICAvLyBwYXJzZS4gV2UnbGwgc3RpbGwgZmFsbCBiYWNrIHRvIHRoZSB0aW1lbGluZSBpZiB0aGlzIGZhaWxzLCBidXQgY2hhbmNlc1xuICAgICAgICAgICAgLy8gYXJlIHdlJ2xsIGF0IGxlYXN0IGhhdmUgb3VyIG93biBtZW1iZXJzaGlwIGV2ZW50IHRvIGdvIG9mZiBvZi5cbiAgICAgICAgICAgIGNvbnN0IGVmZmVjdGl2ZU1lbWJlcnNoaXAgPSBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwKHIuZ2V0TXlNZW1iZXJzaGlwKCkpO1xuICAgICAgICAgICAgaWYgKGVmZmVjdGl2ZU1lbWJlcnNoaXAgIT09IEVmZmVjdGl2ZU1lbWJlcnNoaXAuSm9pbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlcnNoaXBFdmVudCA9IHIuY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLm1lbWJlclwiLCBteVVzZXJJZCk7XG4gICAgICAgICAgICAgICAgaWYgKG1lbWJlcnNoaXBFdmVudCAmJiAhQXJyYXkuaXNBcnJheShtZW1iZXJzaGlwRXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1iZXJzaGlwRXZlbnQuZ2V0VHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSByLnRpbWVsaW5lLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXYgPSByLnRpbWVsaW5lW2ldO1xuICAgICAgICAgICAgICAgIGlmICghZXYuZ2V0VHMoKSkgY29udGludWU7IC8vIHNraXAgZXZlbnRzIHRoYXQgZG9uJ3QgaGF2ZSB0aW1lc3RhbXBzICh0ZXN0cyBvbmx5PylcblxuICAgICAgICAgICAgICAgIGlmIChldi5nZXRTZW5kZXIoKSA9PT0gbXlVc2VySWQgfHwgVW5yZWFkLmV2ZW50VHJpZ2dlcnNVbnJlYWRDb3VudChldikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2LmdldFRzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB3ZSBtaWdodCBvbmx5IGhhdmUgZXZlbnRzIHRoYXQgZG9uJ3QgdHJpZ2dlciB0aGUgdW5yZWFkIGluZGljYXRvcixcbiAgICAgICAgICAgIC8vIGluIHdoaWNoIGNhc2UgdXNlIHRoZSBvbGRlc3QgZXZlbnQgZXZlbiBpZiBub3JtYWxseSBpdCB3b3VsZG4ndCBjb3VudC5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYmV0dGVyIHRoYW4ganVzdCBhc3N1bWluZyB0aGUgbGFzdCBldmVudCB3YXMgZm9yZXZlciBhZ28uXG4gICAgICAgICAgICBpZiAoci50aW1lbGluZS5sZW5ndGggJiYgci50aW1lbGluZVswXS5nZXRUcygpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIudGltZWxpbmVbMF0uZ2V0VHMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSgpO1xuXG4gICAgICAgIHRzQ2FjaGVbci5yb29tSWRdID0gdHM7XG4gICAgICAgIHJldHVybiB0cztcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJvb21zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldExhc3RUcyhiKSAtIGdldExhc3RUcyhhKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogU29ydHMgcm9vbXMgYWNjb3JkaW5nIHRvIHRoZSBsYXN0IGV2ZW50J3MgdGltZXN0YW1wIGluIGVhY2ggcm9vbSB0aGF0IHNlZW1zXG4gKiB1c2VmdWwgdG8gdGhlIHVzZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWNlbnRBbGdvcml0aG0gaW1wbGVtZW50cyBJQWxnb3JpdGhtIHtcbiAgICBwdWJsaWMgYXN5bmMgc29ydFJvb21zKHJvb21zOiBSb29tW10sIHRhZ0lkOiBUYWdJRCk6IFByb21pc2U8Um9vbVtdPiB7XG4gICAgICAgIHJldHVybiBzb3J0Um9vbXMocm9vbXMpO1xuICAgIH1cbn1cbiJdfQ==
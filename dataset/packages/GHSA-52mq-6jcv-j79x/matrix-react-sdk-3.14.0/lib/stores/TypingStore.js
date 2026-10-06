"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _MatrixClientPeg = require("../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _Timer = _interopRequireDefault(require("../utils/Timer"));

/*
Copyright 2019 The Matrix.org Foundation C.I.C.

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
const TYPING_USER_TIMEOUT = 10000;
const TYPING_SERVER_TIMEOUT = 30000;
/**
 * Tracks typing state for users.
 */

class TypingStore {
  constructor() {
    this.reset();
  }

  static sharedInstance()
  /*: TypingStore*/
  {
    if (global.mxTypingStore === undefined) {
      global.mxTypingStore = new TypingStore();
    }

    return global.mxTypingStore;
  }
  /**
   * Clears all cached typing states. Intended to be called when the
   * MatrixClientPeg client changes.
   */


  reset() {
    this._typingStates = {// "roomId": {
      //     isTyping: bool,     // Whether the user is typing or not
      //     userTimer: Timer,   // Local timeout for "user has stopped typing"
      //     serverTimer: Timer, // Maximum timeout for the typing state
      // },
    };
  }
  /**
   * Changes the typing status for the MatrixClientPeg user.
   * @param {string} roomId The room ID to set the typing state in.
   * @param {boolean} isTyping Whether the user is typing or not.
   */


  setSelfTyping(roomId
  /*: string*/
  , isTyping
  /*: boolean*/
  )
  /*: void*/
  {
    if (!_SettingsStore.default.getValue('sendTypingNotifications')) return;
    if (_SettingsStore.default.getValue('lowBandwidth')) return;
    let currentTyping = this._typingStates[roomId];

    if (!isTyping && !currentTyping || currentTyping && currentTyping.isTyping === isTyping) {
      // No change in state, so don't do anything. We'll let the timer run its course.
      return;
    }

    if (!currentTyping) {
      currentTyping = this._typingStates[roomId] = {
        isTyping: isTyping,
        serverTimer: new _Timer.default(TYPING_SERVER_TIMEOUT),
        userTimer: new _Timer.default(TYPING_USER_TIMEOUT)
      };
    }

    currentTyping.isTyping = isTyping;

    if (isTyping) {
      if (!currentTyping.serverTimer.isRunning()) {
        currentTyping.serverTimer.restart().finished().then(() => {
          const currentTyping = this._typingStates[roomId];
          if (currentTyping) currentTyping.isTyping = false; // The server will (should) time us out on typing, so we don't
          // need to advertise a stop of typing.
        });
      } else currentTyping.serverTimer.restart();

      if (!currentTyping.userTimer.isRunning()) {
        currentTyping.userTimer.restart().finished().then(() => {
          this.setSelfTyping(roomId, false);
        });
      } else currentTyping.userTimer.restart();
    }

    _MatrixClientPeg.MatrixClientPeg.get().sendTyping(roomId, isTyping, TYPING_SERVER_TIMEOUT);
  }

}

exports.default = TypingStore;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZXMvVHlwaW5nU3RvcmUuanMiXSwibmFtZXMiOlsiVFlQSU5HX1VTRVJfVElNRU9VVCIsIlRZUElOR19TRVJWRVJfVElNRU9VVCIsIlR5cGluZ1N0b3JlIiwiY29uc3RydWN0b3IiLCJyZXNldCIsInNoYXJlZEluc3RhbmNlIiwiZ2xvYmFsIiwibXhUeXBpbmdTdG9yZSIsInVuZGVmaW5lZCIsIl90eXBpbmdTdGF0ZXMiLCJzZXRTZWxmVHlwaW5nIiwicm9vbUlkIiwiaXNUeXBpbmciLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJjdXJyZW50VHlwaW5nIiwic2VydmVyVGltZXIiLCJUaW1lciIsInVzZXJUaW1lciIsImlzUnVubmluZyIsInJlc3RhcnQiLCJmaW5pc2hlZCIsInRoZW4iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJzZW5kVHlwaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU1BLE1BQU1BLG1CQUFtQixHQUFHLEtBQTVCO0FBQ0EsTUFBTUMscUJBQXFCLEdBQUcsS0FBOUI7QUFFQTtBQUNBO0FBQ0E7O0FBQ2UsTUFBTUMsV0FBTixDQUFrQjtBQUM3QkMsRUFBQUEsV0FBVyxHQUFHO0FBQ1YsU0FBS0MsS0FBTDtBQUNIOztBQUVELFNBQU9DLGNBQVA7QUFBQTtBQUFxQztBQUNqQyxRQUFJQyxNQUFNLENBQUNDLGFBQVAsS0FBeUJDLFNBQTdCLEVBQXdDO0FBQ3BDRixNQUFBQSxNQUFNLENBQUNDLGFBQVAsR0FBdUIsSUFBSUwsV0FBSixFQUF2QjtBQUNIOztBQUNELFdBQU9JLE1BQU0sQ0FBQ0MsYUFBZDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7OztBQUNJSCxFQUFBQSxLQUFLLEdBQUc7QUFDSixTQUFLSyxhQUFMLEdBQXFCLENBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMaUIsS0FBckI7QUFPSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztBQUNJQyxFQUFBQSxhQUFhLENBQUNDO0FBQUQ7QUFBQSxJQUFpQkM7QUFBakI7QUFBQTtBQUFBO0FBQTBDO0FBQ25ELFFBQUksQ0FBQ0MsdUJBQWNDLFFBQWQsQ0FBdUIseUJBQXZCLENBQUwsRUFBd0Q7QUFDeEQsUUFBSUQsdUJBQWNDLFFBQWQsQ0FBdUIsY0FBdkIsQ0FBSixFQUE0QztBQUU1QyxRQUFJQyxhQUFhLEdBQUcsS0FBS04sYUFBTCxDQUFtQkUsTUFBbkIsQ0FBcEI7O0FBQ0EsUUFBSyxDQUFDQyxRQUFELElBQWEsQ0FBQ0csYUFBZixJQUFrQ0EsYUFBYSxJQUFJQSxhQUFhLENBQUNILFFBQWQsS0FBMkJBLFFBQWxGLEVBQTZGO0FBQ3pGO0FBQ0E7QUFDSDs7QUFFRCxRQUFJLENBQUNHLGFBQUwsRUFBb0I7QUFDaEJBLE1BQUFBLGFBQWEsR0FBRyxLQUFLTixhQUFMLENBQW1CRSxNQUFuQixJQUE2QjtBQUN6Q0MsUUFBQUEsUUFBUSxFQUFFQSxRQUQrQjtBQUV6Q0ksUUFBQUEsV0FBVyxFQUFFLElBQUlDLGNBQUosQ0FBVWhCLHFCQUFWLENBRjRCO0FBR3pDaUIsUUFBQUEsU0FBUyxFQUFFLElBQUlELGNBQUosQ0FBVWpCLG1CQUFWO0FBSDhCLE9BQTdDO0FBS0g7O0FBRURlLElBQUFBLGFBQWEsQ0FBQ0gsUUFBZCxHQUF5QkEsUUFBekI7O0FBRUEsUUFBSUEsUUFBSixFQUFjO0FBQ1YsVUFBSSxDQUFDRyxhQUFhLENBQUNDLFdBQWQsQ0FBMEJHLFNBQTFCLEVBQUwsRUFBNEM7QUFDeENKLFFBQUFBLGFBQWEsQ0FBQ0MsV0FBZCxDQUEwQkksT0FBMUIsR0FBb0NDLFFBQXBDLEdBQStDQyxJQUEvQyxDQUFvRCxNQUFNO0FBQ3RELGdCQUFNUCxhQUFhLEdBQUcsS0FBS04sYUFBTCxDQUFtQkUsTUFBbkIsQ0FBdEI7QUFDQSxjQUFJSSxhQUFKLEVBQW1CQSxhQUFhLENBQUNILFFBQWQsR0FBeUIsS0FBekIsQ0FGbUMsQ0FJdEQ7QUFDQTtBQUNILFNBTkQ7QUFPSCxPQVJELE1BUU9HLGFBQWEsQ0FBQ0MsV0FBZCxDQUEwQkksT0FBMUI7O0FBRVAsVUFBSSxDQUFDTCxhQUFhLENBQUNHLFNBQWQsQ0FBd0JDLFNBQXhCLEVBQUwsRUFBMEM7QUFDdENKLFFBQUFBLGFBQWEsQ0FBQ0csU0FBZCxDQUF3QkUsT0FBeEIsR0FBa0NDLFFBQWxDLEdBQTZDQyxJQUE3QyxDQUFrRCxNQUFNO0FBQ3BELGVBQUtaLGFBQUwsQ0FBbUJDLE1BQW5CLEVBQTJCLEtBQTNCO0FBQ0gsU0FGRDtBQUdILE9BSkQsTUFJT0ksYUFBYSxDQUFDRyxTQUFkLENBQXdCRSxPQUF4QjtBQUNWOztBQUVERyxxQ0FBZ0JDLEdBQWhCLEdBQXNCQyxVQUF0QixDQUFpQ2QsTUFBakMsRUFBeUNDLFFBQXpDLEVBQW1EWCxxQkFBbkQ7QUFDSDs7QUF0RTRCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgVGltZXIgZnJvbSBcIi4uL3V0aWxzL1RpbWVyXCI7XG5cbmNvbnN0IFRZUElOR19VU0VSX1RJTUVPVVQgPSAxMDAwMDtcbmNvbnN0IFRZUElOR19TRVJWRVJfVElNRU9VVCA9IDMwMDAwO1xuXG4vKipcbiAqIFRyYWNrcyB0eXBpbmcgc3RhdGUgZm9yIHVzZXJzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBpbmdTdG9yZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc2hhcmVkSW5zdGFuY2UoKTogVHlwaW5nU3RvcmUge1xuICAgICAgICBpZiAoZ2xvYmFsLm14VHlwaW5nU3RvcmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZ2xvYmFsLm14VHlwaW5nU3RvcmUgPSBuZXcgVHlwaW5nU3RvcmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2xvYmFsLm14VHlwaW5nU3RvcmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdHlwaW5nIHN0YXRlcy4gSW50ZW5kZWQgdG8gYmUgY2FsbGVkIHdoZW4gdGhlXG4gICAgICogTWF0cml4Q2xpZW50UGVnIGNsaWVudCBjaGFuZ2VzLlxuICAgICAqL1xuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLl90eXBpbmdTdGF0ZXMgPSB7XG4gICAgICAgICAgICAvLyBcInJvb21JZFwiOiB7XG4gICAgICAgICAgICAvLyAgICAgaXNUeXBpbmc6IGJvb2wsICAgICAvLyBXaGV0aGVyIHRoZSB1c2VyIGlzIHR5cGluZyBvciBub3RcbiAgICAgICAgICAgIC8vICAgICB1c2VyVGltZXI6IFRpbWVyLCAgIC8vIExvY2FsIHRpbWVvdXQgZm9yIFwidXNlciBoYXMgc3RvcHBlZCB0eXBpbmdcIlxuICAgICAgICAgICAgLy8gICAgIHNlcnZlclRpbWVyOiBUaW1lciwgLy8gTWF4aW11bSB0aW1lb3V0IGZvciB0aGUgdHlwaW5nIHN0YXRlXG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoYW5nZXMgdGhlIHR5cGluZyBzdGF0dXMgZm9yIHRoZSBNYXRyaXhDbGllbnRQZWcgdXNlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm9vbUlkIFRoZSByb29tIElEIHRvIHNldCB0aGUgdHlwaW5nIHN0YXRlIGluLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNUeXBpbmcgV2hldGhlciB0aGUgdXNlciBpcyB0eXBpbmcgb3Igbm90LlxuICAgICAqL1xuICAgIHNldFNlbGZUeXBpbmcocm9vbUlkOiBzdHJpbmcsIGlzVHlwaW5nOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSgnc2VuZFR5cGluZ05vdGlmaWNhdGlvbnMnKSkgcmV0dXJuO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSgnbG93QmFuZHdpZHRoJykpIHJldHVybjtcblxuICAgICAgICBsZXQgY3VycmVudFR5cGluZyA9IHRoaXMuX3R5cGluZ1N0YXRlc1tyb29tSWRdO1xuICAgICAgICBpZiAoKCFpc1R5cGluZyAmJiAhY3VycmVudFR5cGluZykgfHwgKGN1cnJlbnRUeXBpbmcgJiYgY3VycmVudFR5cGluZy5pc1R5cGluZyA9PT0gaXNUeXBpbmcpKSB7XG4gICAgICAgICAgICAvLyBObyBjaGFuZ2UgaW4gc3RhdGUsIHNvIGRvbid0IGRvIGFueXRoaW5nLiBXZSdsbCBsZXQgdGhlIHRpbWVyIHJ1biBpdHMgY291cnNlLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjdXJyZW50VHlwaW5nKSB7XG4gICAgICAgICAgICBjdXJyZW50VHlwaW5nID0gdGhpcy5fdHlwaW5nU3RhdGVzW3Jvb21JZF0gPSB7XG4gICAgICAgICAgICAgICAgaXNUeXBpbmc6IGlzVHlwaW5nLFxuICAgICAgICAgICAgICAgIHNlcnZlclRpbWVyOiBuZXcgVGltZXIoVFlQSU5HX1NFUlZFUl9USU1FT1VUKSxcbiAgICAgICAgICAgICAgICB1c2VyVGltZXI6IG5ldyBUaW1lcihUWVBJTkdfVVNFUl9USU1FT1VUKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50VHlwaW5nLmlzVHlwaW5nID0gaXNUeXBpbmc7XG5cbiAgICAgICAgaWYgKGlzVHlwaW5nKSB7XG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRUeXBpbmcuc2VydmVyVGltZXIuaXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHlwaW5nLnNlcnZlclRpbWVyLnJlc3RhcnQoKS5maW5pc2hlZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50VHlwaW5nID0gdGhpcy5fdHlwaW5nU3RhdGVzW3Jvb21JZF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VHlwaW5nKSBjdXJyZW50VHlwaW5nLmlzVHlwaW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHNlcnZlciB3aWxsIChzaG91bGQpIHRpbWUgdXMgb3V0IG9uIHR5cGluZywgc28gd2UgZG9uJ3RcbiAgICAgICAgICAgICAgICAgICAgLy8gbmVlZCB0byBhZHZlcnRpc2UgYSBzdG9wIG9mIHR5cGluZy5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBjdXJyZW50VHlwaW5nLnNlcnZlclRpbWVyLnJlc3RhcnQoKTtcblxuICAgICAgICAgICAgaWYgKCFjdXJyZW50VHlwaW5nLnVzZXJUaW1lci5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUeXBpbmcudXNlclRpbWVyLnJlc3RhcnQoKS5maW5pc2hlZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFNlbGZUeXBpbmcocm9vbUlkLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgY3VycmVudFR5cGluZy51c2VyVGltZXIucmVzdGFydCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRUeXBpbmcocm9vbUlkLCBpc1R5cGluZywgVFlQSU5HX1NFUlZFUl9USU1FT1VUKTtcbiAgICB9XG59XG4iXX0=
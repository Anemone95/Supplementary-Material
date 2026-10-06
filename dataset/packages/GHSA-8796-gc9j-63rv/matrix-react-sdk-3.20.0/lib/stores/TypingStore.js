"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _Timer = _interopRequireDefault(require("../utils/Timer"));

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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
    (0, _defineProperty2.default)(this, "typingStates", void 0);
    this.reset();
  }

  static sharedInstance()
  /*: TypingStore*/
  {
    if (window.mxTypingStore === undefined) {
      window.mxTypingStore = new TypingStore();
    }

    return window.mxTypingStore;
  }
  /**
   * Clears all cached typing states. Intended to be called when the
   * MatrixClientPeg client changes.
   */


  reset() {
    this.typingStates = {// "roomId": {
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
    let currentTyping = this.typingStates[roomId];

    if (!isTyping && !currentTyping || currentTyping && currentTyping.isTyping === isTyping) {
      // No change in state, so don't do anything. We'll let the timer run its course.
      return;
    }

    if (!currentTyping) {
      currentTyping = this.typingStates[roomId] = {
        isTyping: isTyping,
        serverTimer: new _Timer.default(TYPING_SERVER_TIMEOUT),
        userTimer: new _Timer.default(TYPING_USER_TIMEOUT)
      };
    }

    currentTyping.isTyping = isTyping;

    if (isTyping) {
      if (!currentTyping.serverTimer.isRunning()) {
        currentTyping.serverTimer.restart().finished().then(() => {
          const currentTyping = this.typingStates[roomId];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZXMvVHlwaW5nU3RvcmUudHMiXSwibmFtZXMiOlsiVFlQSU5HX1VTRVJfVElNRU9VVCIsIlRZUElOR19TRVJWRVJfVElNRU9VVCIsIlR5cGluZ1N0b3JlIiwiY29uc3RydWN0b3IiLCJyZXNldCIsInNoYXJlZEluc3RhbmNlIiwid2luZG93IiwibXhUeXBpbmdTdG9yZSIsInVuZGVmaW5lZCIsInR5cGluZ1N0YXRlcyIsInNldFNlbGZUeXBpbmciLCJyb29tSWQiLCJpc1R5cGluZyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImN1cnJlbnRUeXBpbmciLCJzZXJ2ZXJUaW1lciIsIlRpbWVyIiwidXNlclRpbWVyIiwiaXNSdW5uaW5nIiwicmVzdGFydCIsImZpbmlzaGVkIiwidGhlbiIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInNlbmRUeXBpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQWxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNQSxNQUFNQSxtQkFBbUIsR0FBRyxLQUE1QjtBQUNBLE1BQU1DLHFCQUFxQixHQUFHLEtBQTlCO0FBRUE7QUFDQTtBQUNBOztBQUNlLE1BQU1DLFdBQU4sQ0FBa0I7QUFTN0JDLEVBQUFBLFdBQVcsR0FBRztBQUFBO0FBQ1YsU0FBS0MsS0FBTDtBQUNIOztBQUVELFNBQU9DLGNBQVA7QUFBQTtBQUFxQztBQUNqQyxRQUFJQyxNQUFNLENBQUNDLGFBQVAsS0FBeUJDLFNBQTdCLEVBQXdDO0FBQ3BDRixNQUFBQSxNQUFNLENBQUNDLGFBQVAsR0FBdUIsSUFBSUwsV0FBSixFQUF2QjtBQUNIOztBQUNELFdBQU9JLE1BQU0sQ0FBQ0MsYUFBZDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7OztBQUNJSCxFQUFBQSxLQUFLLEdBQUc7QUFDSixTQUFLSyxZQUFMLEdBQW9CLENBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMZ0IsS0FBcEI7QUFPSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztBQUNJQyxFQUFBQSxhQUFhLENBQUNDO0FBQUQ7QUFBQSxJQUFpQkM7QUFBakI7QUFBQTtBQUFBO0FBQTBDO0FBQ25ELFFBQUksQ0FBQ0MsdUJBQWNDLFFBQWQsQ0FBdUIseUJBQXZCLENBQUwsRUFBd0Q7QUFDeEQsUUFBSUQsdUJBQWNDLFFBQWQsQ0FBdUIsY0FBdkIsQ0FBSixFQUE0QztBQUU1QyxRQUFJQyxhQUFhLEdBQUcsS0FBS04sWUFBTCxDQUFrQkUsTUFBbEIsQ0FBcEI7O0FBQ0EsUUFBSyxDQUFDQyxRQUFELElBQWEsQ0FBQ0csYUFBZixJQUFrQ0EsYUFBYSxJQUFJQSxhQUFhLENBQUNILFFBQWQsS0FBMkJBLFFBQWxGLEVBQTZGO0FBQ3pGO0FBQ0E7QUFDSDs7QUFFRCxRQUFJLENBQUNHLGFBQUwsRUFBb0I7QUFDaEJBLE1BQUFBLGFBQWEsR0FBRyxLQUFLTixZQUFMLENBQWtCRSxNQUFsQixJQUE0QjtBQUN4Q0MsUUFBQUEsUUFBUSxFQUFFQSxRQUQ4QjtBQUV4Q0ksUUFBQUEsV0FBVyxFQUFFLElBQUlDLGNBQUosQ0FBVWhCLHFCQUFWLENBRjJCO0FBR3hDaUIsUUFBQUEsU0FBUyxFQUFFLElBQUlELGNBQUosQ0FBVWpCLG1CQUFWO0FBSDZCLE9BQTVDO0FBS0g7O0FBRURlLElBQUFBLGFBQWEsQ0FBQ0gsUUFBZCxHQUF5QkEsUUFBekI7O0FBRUEsUUFBSUEsUUFBSixFQUFjO0FBQ1YsVUFBSSxDQUFDRyxhQUFhLENBQUNDLFdBQWQsQ0FBMEJHLFNBQTFCLEVBQUwsRUFBNEM7QUFDeENKLFFBQUFBLGFBQWEsQ0FBQ0MsV0FBZCxDQUEwQkksT0FBMUIsR0FBb0NDLFFBQXBDLEdBQStDQyxJQUEvQyxDQUFvRCxNQUFNO0FBQ3RELGdCQUFNUCxhQUFhLEdBQUcsS0FBS04sWUFBTCxDQUFrQkUsTUFBbEIsQ0FBdEI7QUFDQSxjQUFJSSxhQUFKLEVBQW1CQSxhQUFhLENBQUNILFFBQWQsR0FBeUIsS0FBekIsQ0FGbUMsQ0FJdEQ7QUFDQTtBQUNILFNBTkQ7QUFPSCxPQVJELE1BUU9HLGFBQWEsQ0FBQ0MsV0FBZCxDQUEwQkksT0FBMUI7O0FBRVAsVUFBSSxDQUFDTCxhQUFhLENBQUNHLFNBQWQsQ0FBd0JDLFNBQXhCLEVBQUwsRUFBMEM7QUFDdENKLFFBQUFBLGFBQWEsQ0FBQ0csU0FBZCxDQUF3QkUsT0FBeEIsR0FBa0NDLFFBQWxDLEdBQTZDQyxJQUE3QyxDQUFrRCxNQUFNO0FBQ3BELGVBQUtaLGFBQUwsQ0FBbUJDLE1BQW5CLEVBQTJCLEtBQTNCO0FBQ0gsU0FGRDtBQUdILE9BSkQsTUFJT0ksYUFBYSxDQUFDRyxTQUFkLENBQXdCRSxPQUF4QjtBQUNWOztBQUVERyxxQ0FBZ0JDLEdBQWhCLEdBQXNCQyxVQUF0QixDQUFpQ2QsTUFBakMsRUFBeUNDLFFBQXpDLEVBQW1EWCxxQkFBbkQ7QUFDSDs7QUE5RTRCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgVGltZXIgZnJvbSBcIi4uL3V0aWxzL1RpbWVyXCI7XG5cbmNvbnN0IFRZUElOR19VU0VSX1RJTUVPVVQgPSAxMDAwMDtcbmNvbnN0IFRZUElOR19TRVJWRVJfVElNRU9VVCA9IDMwMDAwO1xuXG4vKipcbiAqIFRyYWNrcyB0eXBpbmcgc3RhdGUgZm9yIHVzZXJzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBpbmdTdG9yZSB7XG4gICAgcHJpdmF0ZSB0eXBpbmdTdGF0ZXM6IHtcbiAgICAgICAgW3Jvb21JZDogc3RyaW5nXToge1xuICAgICAgICAgICAgaXNUeXBpbmc6IGJvb2xlYW4sXG4gICAgICAgICAgICB1c2VyVGltZXI6IFRpbWVyLFxuICAgICAgICAgICAgc2VydmVyVGltZXI6IFRpbWVyLFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBzaGFyZWRJbnN0YW5jZSgpOiBUeXBpbmdTdG9yZSB7XG4gICAgICAgIGlmICh3aW5kb3cubXhUeXBpbmdTdG9yZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3aW5kb3cubXhUeXBpbmdTdG9yZSA9IG5ldyBUeXBpbmdTdG9yZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aW5kb3cubXhUeXBpbmdTdG9yZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgYWxsIGNhY2hlZCB0eXBpbmcgc3RhdGVzLiBJbnRlbmRlZCB0byBiZSBjYWxsZWQgd2hlbiB0aGVcbiAgICAgKiBNYXRyaXhDbGllbnRQZWcgY2xpZW50IGNoYW5nZXMuXG4gICAgICovXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMudHlwaW5nU3RhdGVzID0ge1xuICAgICAgICAgICAgLy8gXCJyb29tSWRcIjoge1xuICAgICAgICAgICAgLy8gICAgIGlzVHlwaW5nOiBib29sLCAgICAgLy8gV2hldGhlciB0aGUgdXNlciBpcyB0eXBpbmcgb3Igbm90XG4gICAgICAgICAgICAvLyAgICAgdXNlclRpbWVyOiBUaW1lciwgICAvLyBMb2NhbCB0aW1lb3V0IGZvciBcInVzZXIgaGFzIHN0b3BwZWQgdHlwaW5nXCJcbiAgICAgICAgICAgIC8vICAgICBzZXJ2ZXJUaW1lcjogVGltZXIsIC8vIE1heGltdW0gdGltZW91dCBmb3IgdGhlIHR5cGluZyBzdGF0ZVxuICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2VzIHRoZSB0eXBpbmcgc3RhdHVzIGZvciB0aGUgTWF0cml4Q2xpZW50UGVnIHVzZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJvb21JZCBUaGUgcm9vbSBJRCB0byBzZXQgdGhlIHR5cGluZyBzdGF0ZSBpbi5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVHlwaW5nIFdoZXRoZXIgdGhlIHVzZXIgaXMgdHlwaW5nIG9yIG5vdC5cbiAgICAgKi9cbiAgICBzZXRTZWxmVHlwaW5nKHJvb21JZDogc3RyaW5nLCBpc1R5cGluZzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ3NlbmRUeXBpbmdOb3RpZmljYXRpb25zJykpIHJldHVybjtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ2xvd0JhbmR3aWR0aCcpKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGN1cnJlbnRUeXBpbmcgPSB0aGlzLnR5cGluZ1N0YXRlc1tyb29tSWRdO1xuICAgICAgICBpZiAoKCFpc1R5cGluZyAmJiAhY3VycmVudFR5cGluZykgfHwgKGN1cnJlbnRUeXBpbmcgJiYgY3VycmVudFR5cGluZy5pc1R5cGluZyA9PT0gaXNUeXBpbmcpKSB7XG4gICAgICAgICAgICAvLyBObyBjaGFuZ2UgaW4gc3RhdGUsIHNvIGRvbid0IGRvIGFueXRoaW5nLiBXZSdsbCBsZXQgdGhlIHRpbWVyIHJ1biBpdHMgY291cnNlLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjdXJyZW50VHlwaW5nKSB7XG4gICAgICAgICAgICBjdXJyZW50VHlwaW5nID0gdGhpcy50eXBpbmdTdGF0ZXNbcm9vbUlkXSA9IHtcbiAgICAgICAgICAgICAgICBpc1R5cGluZzogaXNUeXBpbmcsXG4gICAgICAgICAgICAgICAgc2VydmVyVGltZXI6IG5ldyBUaW1lcihUWVBJTkdfU0VSVkVSX1RJTUVPVVQpLFxuICAgICAgICAgICAgICAgIHVzZXJUaW1lcjogbmV3IFRpbWVyKFRZUElOR19VU0VSX1RJTUVPVVQpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRUeXBpbmcuaXNUeXBpbmcgPSBpc1R5cGluZztcblxuICAgICAgICBpZiAoaXNUeXBpbmcpIHtcbiAgICAgICAgICAgIGlmICghY3VycmVudFR5cGluZy5zZXJ2ZXJUaW1lci5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUeXBpbmcuc2VydmVyVGltZXIucmVzdGFydCgpLmZpbmlzaGVkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUeXBpbmcgPSB0aGlzLnR5cGluZ1N0YXRlc1tyb29tSWRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFR5cGluZykgY3VycmVudFR5cGluZy5pc1R5cGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBzZXJ2ZXIgd2lsbCAoc2hvdWxkKSB0aW1lIHVzIG91dCBvbiB0eXBpbmcsIHNvIHdlIGRvbid0XG4gICAgICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gYWR2ZXJ0aXNlIGEgc3RvcCBvZiB0eXBpbmcuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgY3VycmVudFR5cGluZy5zZXJ2ZXJUaW1lci5yZXN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGlmICghY3VycmVudFR5cGluZy51c2VyVGltZXIuaXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHlwaW5nLnVzZXJUaW1lci5yZXN0YXJ0KCkuZmluaXNoZWQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTZWxmVHlwaW5nKHJvb21JZCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGN1cnJlbnRUeXBpbmcudXNlclRpbWVyLnJlc3RhcnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZW5kVHlwaW5nKHJvb21JZCwgaXNUeXBpbmcsIFRZUElOR19TRVJWRVJfVElNRU9VVCk7XG4gICAgfVxufVxuIl19
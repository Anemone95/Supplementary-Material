"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _Timer = _interopRequireDefault(require("./utils/Timer"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
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
// Time in ms after that a user is considered as unavailable/away
const UNAVAILABLE_TIME_MS = 3 * 60 * 1000; // 3 mins

var State;

(function (State) {
  State["Online"] = "online";
  State["Offline"] = "offline";
  State["Unavailable"] = "unavailable";
})(State || (State = {}));

class Presence {
  constructor() {
    (0, _defineProperty2.default)(this, "unavailableTimer", null);
    (0, _defineProperty2.default)(this, "dispatcherRef", null);
    (0, _defineProperty2.default)(this, "state", null);
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      if (payload.action === 'user_activity') {
        this.setState(State.Online);
        this.unavailableTimer.restart();
      }
    });
  }

  /**
   * Start listening the user activity to evaluate his presence state.
   * Any state change will be sent to the homeserver.
   */
  async start() {
    this.unavailableTimer = new _Timer.default(UNAVAILABLE_TIME_MS); // the user_activity_start action starts the timer

    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    while (this.unavailableTimer) {
      try {
        await this.unavailableTimer.finished();
        this.setState(State.Unavailable);
      } catch (e) {
        /* aborted, stop got called */
      }
    }
  }
  /**
   * Stop tracking user activity
   */


  stop() {
    if (this.dispatcherRef) {
      _dispatcher.default.unregister(this.dispatcherRef);

      this.dispatcherRef = null;
    }

    if (this.unavailableTimer) {
      this.unavailableTimer.abort();
      this.unavailableTimer = null;
    }
  }
  /**
   * Get the current presence state.
   * @returns {string} the presence state (see PRESENCE enum)
   */


  getState() {
    return this.state;
  }

  /**
   * Set the presence state.
   * If the state has changed, the homeserver will be notified.
   * @param {string} newState the new presence state (see PRESENCE enum)
   */
  async setState(newState
  /*: State*/
  ) {
    if (newState === this.state) {
      return;
    }

    const oldState = this.state;
    this.state = newState;

    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
      return; // don't try to set presence when a guest; it won't work.
    }

    try {
      await _MatrixClientPeg.MatrixClientPeg.get().setPresence(this.state);
      console.info("Presence: %s", newState);
    } catch (err) {
      console.error("Failed to set presence: %s", err);
      this.state = oldState;
    }
  }

}

var _default = new Presence();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9QcmVzZW5jZS50cyJdLCJuYW1lcyI6WyJVTkFWQUlMQUJMRV9USU1FX01TIiwiU3RhdGUiLCJQcmVzZW5jZSIsInBheWxvYWQiLCJhY3Rpb24iLCJzZXRTdGF0ZSIsIk9ubGluZSIsInVuYXZhaWxhYmxlVGltZXIiLCJyZXN0YXJ0Iiwic3RhcnQiLCJUaW1lciIsImRpc3BhdGNoZXJSZWYiLCJkaXMiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiZmluaXNoZWQiLCJVbmF2YWlsYWJsZSIsImUiLCJzdG9wIiwidW5yZWdpc3RlciIsImFib3J0IiwiZ2V0U3RhdGUiLCJzdGF0ZSIsIm5ld1N0YXRlIiwib2xkU3RhdGUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc0d1ZXN0Iiwic2V0UHJlc2VuY2UiLCJjb25zb2xlIiwiaW5mbyIsImVyciIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU9BO0FBQ0EsTUFBTUEsbUJBQW1CLEdBQUcsSUFBSSxFQUFKLEdBQVMsSUFBckMsQyxDQUEyQzs7SUFFdENDLEs7O1dBQUFBLEs7QUFBQUEsRUFBQUEsSztBQUFBQSxFQUFBQSxLO0FBQUFBLEVBQUFBLEs7R0FBQUEsSyxLQUFBQSxLOztBQU1MLE1BQU1DLFFBQU4sQ0FBZTtBQUFBO0FBQUEsNERBQ3VCLElBRHZCO0FBQUEseURBRXFCLElBRnJCO0FBQUEsaURBR1ksSUFIWjtBQUFBLG9EQTJDUSxDQUFDQztBQUFEO0FBQUEsU0FBNEI7QUFDM0MsVUFBSUEsT0FBTyxDQUFDQyxNQUFSLEtBQW1CLGVBQXZCLEVBQXdDO0FBQ3BDLGFBQUtDLFFBQUwsQ0FBY0osS0FBSyxDQUFDSyxNQUFwQjtBQUNBLGFBQUtDLGdCQUFMLENBQXNCQyxPQUF0QjtBQUNIO0FBQ0osS0FoRFU7QUFBQTs7QUFLWDtBQUNKO0FBQ0E7QUFDQTtBQUNJLFFBQWFDLEtBQWIsR0FBcUI7QUFDakIsU0FBS0YsZ0JBQUwsR0FBd0IsSUFBSUcsY0FBSixDQUFVVixtQkFBVixDQUF4QixDQURpQixDQUVqQjs7QUFDQSxTQUFLVyxhQUFMLEdBQXFCQyxvQkFBSUMsUUFBSixDQUFhLEtBQUtDLFFBQWxCLENBQXJCOztBQUNBLFdBQU8sS0FBS1AsZ0JBQVosRUFBOEI7QUFDMUIsVUFBSTtBQUNBLGNBQU0sS0FBS0EsZ0JBQUwsQ0FBc0JRLFFBQXRCLEVBQU47QUFDQSxhQUFLVixRQUFMLENBQWNKLEtBQUssQ0FBQ2UsV0FBcEI7QUFDSCxPQUhELENBR0UsT0FBT0MsQ0FBUCxFQUFVO0FBQUU7QUFBZ0M7QUFDakQ7QUFDSjtBQUVEO0FBQ0o7QUFDQTs7O0FBQ1dDLEVBQUFBLElBQVAsR0FBYztBQUNWLFFBQUksS0FBS1AsYUFBVCxFQUF3QjtBQUNwQkMsMEJBQUlPLFVBQUosQ0FBZSxLQUFLUixhQUFwQjs7QUFDQSxXQUFLQSxhQUFMLEdBQXFCLElBQXJCO0FBQ0g7O0FBQ0QsUUFBSSxLQUFLSixnQkFBVCxFQUEyQjtBQUN2QixXQUFLQSxnQkFBTCxDQUFzQmEsS0FBdEI7QUFDQSxXQUFLYixnQkFBTCxHQUF3QixJQUF4QjtBQUNIO0FBQ0o7QUFFRDtBQUNKO0FBQ0E7QUFDQTs7O0FBQ1djLEVBQUFBLFFBQVAsR0FBa0I7QUFDZCxXQUFPLEtBQUtDLEtBQVo7QUFDSDs7QUFTRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0ksUUFBY2pCLFFBQWQsQ0FBdUJrQjtBQUF2QjtBQUFBLElBQXdDO0FBQ3BDLFFBQUlBLFFBQVEsS0FBSyxLQUFLRCxLQUF0QixFQUE2QjtBQUN6QjtBQUNIOztBQUVELFVBQU1FLFFBQVEsR0FBRyxLQUFLRixLQUF0QjtBQUNBLFNBQUtBLEtBQUwsR0FBYUMsUUFBYjs7QUFFQSxRQUFJRSxpQ0FBZ0JDLEdBQWhCLEdBQXNCQyxPQUF0QixFQUFKLEVBQXFDO0FBQ2pDLGFBRGlDLENBQ3pCO0FBQ1g7O0FBRUQsUUFBSTtBQUNBLFlBQU1GLGlDQUFnQkMsR0FBaEIsR0FBc0JFLFdBQXRCLENBQWtDLEtBQUtOLEtBQXZDLENBQU47QUFDQU8sTUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQWEsY0FBYixFQUE2QlAsUUFBN0I7QUFDSCxLQUhELENBR0UsT0FBT1EsR0FBUCxFQUFZO0FBQ1ZGLE1BQUFBLE9BQU8sQ0FBQ0csS0FBUixDQUFjLDRCQUFkLEVBQTRDRCxHQUE1QztBQUNBLFdBQUtULEtBQUwsR0FBYUUsUUFBYjtBQUNIO0FBQ0o7O0FBMUVVOztlQTZFQSxJQUFJdEIsUUFBSixFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IFRpbWVyIGZyb20gJy4vdXRpbHMvVGltZXInO1xuaW1wb3J0IHtBY3Rpb25QYXlsb2FkfSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5cbi8vIFRpbWUgaW4gbXMgYWZ0ZXIgdGhhdCBhIHVzZXIgaXMgY29uc2lkZXJlZCBhcyB1bmF2YWlsYWJsZS9hd2F5XG5jb25zdCBVTkFWQUlMQUJMRV9USU1FX01TID0gMyAqIDYwICogMTAwMDsgLy8gMyBtaW5zXG5cbmVudW0gU3RhdGUge1xuICAgIE9ubGluZSA9IFwib25saW5lXCIsXG4gICAgT2ZmbGluZSA9IFwib2ZmbGluZVwiLFxuICAgIFVuYXZhaWxhYmxlID0gXCJ1bmF2YWlsYWJsZVwiLFxufVxuXG5jbGFzcyBQcmVzZW5jZSB7XG4gICAgcHJpdmF0ZSB1bmF2YWlsYWJsZVRpbWVyOiBUaW1lciA9IG51bGw7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmcgPSBudWxsO1xuICAgIHByaXZhdGUgc3RhdGU6IFN0YXRlID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGxpc3RlbmluZyB0aGUgdXNlciBhY3Rpdml0eSB0byBldmFsdWF0ZSBoaXMgcHJlc2VuY2Ugc3RhdGUuXG4gICAgICogQW55IHN0YXRlIGNoYW5nZSB3aWxsIGJlIHNlbnQgdG8gdGhlIGhvbWVzZXJ2ZXIuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHN0YXJ0KCkge1xuICAgICAgICB0aGlzLnVuYXZhaWxhYmxlVGltZXIgPSBuZXcgVGltZXIoVU5BVkFJTEFCTEVfVElNRV9NUyk7XG4gICAgICAgIC8vIHRoZSB1c2VyX2FjdGl2aXR5X3N0YXJ0IGFjdGlvbiBzdGFydHMgdGhlIHRpbWVyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgd2hpbGUgKHRoaXMudW5hdmFpbGFibGVUaW1lcikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnVuYXZhaWxhYmxlVGltZXIuZmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKFN0YXRlLlVuYXZhaWxhYmxlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgLyogYWJvcnRlZCwgc3RvcCBnb3QgY2FsbGVkICovIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3AgdHJhY2tpbmcgdXNlciBhY3Rpdml0eVxuICAgICAqL1xuICAgIHB1YmxpYyBzdG9wKCkge1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVyUmVmKSB7XG4gICAgICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy51bmF2YWlsYWJsZVRpbWVyKSB7XG4gICAgICAgICAgICB0aGlzLnVuYXZhaWxhYmxlVGltZXIuYWJvcnQoKTtcbiAgICAgICAgICAgIHRoaXMudW5hdmFpbGFibGVUaW1lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgcHJlc2VuY2Ugc3RhdGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHByZXNlbmNlIHN0YXRlIChzZWUgUFJFU0VOQ0UgZW51bSlcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICd1c2VyX2FjdGl2aXR5Jykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShTdGF0ZS5PbmxpbmUpO1xuICAgICAgICAgICAgdGhpcy51bmF2YWlsYWJsZVRpbWVyLnJlc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgcHJlc2VuY2Ugc3RhdGUuXG4gICAgICogSWYgdGhlIHN0YXRlIGhhcyBjaGFuZ2VkLCB0aGUgaG9tZXNlcnZlciB3aWxsIGJlIG5vdGlmaWVkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdTdGF0ZSB0aGUgbmV3IHByZXNlbmNlIHN0YXRlIChzZWUgUFJFU0VOQ0UgZW51bSlcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHNldFN0YXRlKG5ld1N0YXRlOiBTdGF0ZSkge1xuICAgICAgICBpZiAobmV3U3RhdGUgPT09IHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9sZFN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IG5ld1N0YXRlO1xuXG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIGRvbid0IHRyeSB0byBzZXQgcHJlc2VuY2Ugd2hlbiBhIGd1ZXN0OyBpdCB3b24ndCB3b3JrLlxuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRQcmVzZW5jZSh0aGlzLnN0YXRlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIlByZXNlbmNlOiAlc1wiLCBuZXdTdGF0ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzZXQgcHJlc2VuY2U6ICVzXCIsIGVycik7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gb2xkU3RhdGU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBQcmVzZW5jZSgpO1xuIl19
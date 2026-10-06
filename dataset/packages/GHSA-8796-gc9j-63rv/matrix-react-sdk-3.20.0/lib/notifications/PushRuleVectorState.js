"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PushRuleVectorState = exports.State = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _StandardActions = require("./StandardActions");

var _NotificationUtils = require("./NotificationUtils");

/*
Copyright 2016 OpenMarket Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
let State;
exports.State = State;

(function (State) {
  State["Off"] = "off";
  State["On"] = "on";
  State["Loud"] = "loud";
})(State || (exports.State = State = {}));

class PushRuleVectorState {
  // Backwards compatibility (things should probably be using the enum above instead)

  /**
   * Enum for state of a push rule as defined by the Vector UI.
   * @readonly
   * @enum {string}
   */

  /**
   * Convert a PushRuleVectorState to a list of actions
   *
   * @return [object] list of push-rule actions
   */
  static actionsFor(pushRuleVectorState
  /*: State*/
  ) {
    if (pushRuleVectorState === State.On) {
      return _StandardActions.StandardActions.ACTION_NOTIFY;
    } else if (pushRuleVectorState === State.Loud) {
      return _StandardActions.StandardActions.ACTION_HIGHLIGHT_DEFAULT_SOUND;
    }
  }
  /**
   * Convert a pushrule's actions to a PushRuleVectorState.
   *
   * Determines whether a content rule is in the PushRuleVectorState.ON
   * category or in PushRuleVectorState.LOUD, regardless of its enabled
   * state. Returns null if it does not match these categories.
   */


  static contentRuleVectorStateKind(rule
  /*: IPushRule*/
  )
  /*: State*/
  {
    const decoded = _NotificationUtils.NotificationUtils.decodeActions(rule.actions);

    if (!decoded) {
      return null;
    } // Count tweaks to determine if it is a ON or LOUD rule


    let tweaks = 0;

    if (decoded.sound) {
      tweaks++;
    }

    if (decoded.highlight) {
      tweaks++;
    }

    let stateKind = null;

    switch (tweaks) {
      case 0:
        stateKind = State.On;
        break;

      case 2:
        stateKind = State.Loud;
        break;
    }

    return stateKind;
  }

}

exports.PushRuleVectorState = PushRuleVectorState;
(0, _defineProperty2.default)(PushRuleVectorState, "OFF", State.Off);
(0, _defineProperty2.default)(PushRuleVectorState, "ON", State.On);
(0, _defineProperty2.default)(PushRuleVectorState, "LOUD", State.Loud);
(0, _defineProperty2.default)(PushRuleVectorState, "states", State);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub3RpZmljYXRpb25zL1B1c2hSdWxlVmVjdG9yU3RhdGUudHMiXSwibmFtZXMiOlsiU3RhdGUiLCJQdXNoUnVsZVZlY3RvclN0YXRlIiwiYWN0aW9uc0ZvciIsInB1c2hSdWxlVmVjdG9yU3RhdGUiLCJPbiIsIlN0YW5kYXJkQWN0aW9ucyIsIkFDVElPTl9OT1RJRlkiLCJMb3VkIiwiQUNUSU9OX0hJR0hMSUdIVF9ERUZBVUxUX1NPVU5EIiwiY29udGVudFJ1bGVWZWN0b3JTdGF0ZUtpbmQiLCJydWxlIiwiZGVjb2RlZCIsIk5vdGlmaWNhdGlvblV0aWxzIiwiZGVjb2RlQWN0aW9ucyIsImFjdGlvbnMiLCJ0d2Vha3MiLCJzb3VuZCIsImhpZ2hsaWdodCIsInN0YXRlS2luZCIsIk9mZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBTVlBLEs7OztXQUFBQSxLO0FBQUFBLEVBQUFBLEs7QUFBQUEsRUFBQUEsSztBQUFBQSxFQUFBQSxLO0dBQUFBLEsscUJBQUFBLEs7O0FBVUwsTUFBTUMsbUJBQU4sQ0FBMEI7QUFDN0I7O0FBS0E7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFHSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0ksU0FBT0MsVUFBUCxDQUFrQkM7QUFBbEI7QUFBQSxJQUE4QztBQUMxQyxRQUFJQSxtQkFBbUIsS0FBS0gsS0FBSyxDQUFDSSxFQUFsQyxFQUFzQztBQUNsQyxhQUFPQyxpQ0FBZ0JDLGFBQXZCO0FBQ0gsS0FGRCxNQUVPLElBQUlILG1CQUFtQixLQUFLSCxLQUFLLENBQUNPLElBQWxDLEVBQXdDO0FBQzNDLGFBQU9GLGlDQUFnQkcsOEJBQXZCO0FBQ0g7QUFDSjtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSSxTQUFPQywwQkFBUCxDQUFrQ0M7QUFBbEM7QUFBQTtBQUFBO0FBQTBEO0FBQ3RELFVBQU1DLE9BQU8sR0FBR0MscUNBQWtCQyxhQUFsQixDQUFnQ0gsSUFBSSxDQUFDSSxPQUFyQyxDQUFoQjs7QUFFQSxRQUFJLENBQUNILE9BQUwsRUFBYztBQUNWLGFBQU8sSUFBUDtBQUNILEtBTHFELENBT3REOzs7QUFDQSxRQUFJSSxNQUFNLEdBQUcsQ0FBYjs7QUFDQSxRQUFJSixPQUFPLENBQUNLLEtBQVosRUFBbUI7QUFDZkQsTUFBQUEsTUFBTTtBQUNUOztBQUNELFFBQUlKLE9BQU8sQ0FBQ00sU0FBWixFQUF1QjtBQUNuQkYsTUFBQUEsTUFBTTtBQUNUOztBQUNELFFBQUlHLFNBQVMsR0FBRyxJQUFoQjs7QUFDQSxZQUFRSCxNQUFSO0FBQ0ksV0FBSyxDQUFMO0FBQ0lHLFFBQUFBLFNBQVMsR0FBR2xCLEtBQUssQ0FBQ0ksRUFBbEI7QUFDQTs7QUFDSixXQUFLLENBQUw7QUFDSWMsUUFBQUEsU0FBUyxHQUFHbEIsS0FBSyxDQUFDTyxJQUFsQjtBQUNBO0FBTlI7O0FBUUEsV0FBT1csU0FBUDtBQUNIOztBQTFENEI7Ozs4QkFBcEJqQixtQixTQUVJRCxLQUFLLENBQUNtQixHOzhCQUZWbEIsbUIsUUFHR0QsS0FBSyxDQUFDSSxFOzhCQUhUSCxtQixVQUlLRCxLQUFLLENBQUNPLEk7OEJBSlhOLG1CLFlBV09ELEsiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtTdGFuZGFyZEFjdGlvbnN9IGZyb20gXCIuL1N0YW5kYXJkQWN0aW9uc1wiO1xuaW1wb3J0IHtOb3RpZmljYXRpb25VdGlsc30gZnJvbSBcIi4vTm90aWZpY2F0aW9uVXRpbHNcIjtcbmltcG9ydCB7SVB1c2hSdWxlfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgZW51bSBTdGF0ZSB7XG4gICAgLyoqIFRoZSBwdXNoIHJ1bGUgaXMgZGlzYWJsZWQgKi9cbiAgICBPZmYgPSBcIm9mZlwiLFxuICAgIC8qKiBUaGUgdXNlciB3aWxsIHJlY2VpdmUgcHVzaCBub3RpZmljYXRpb24gZm9yIHRoaXMgcnVsZSAqL1xuICAgIE9uID0gXCJvblwiLFxuICAgIC8qKiBUaGUgdXNlciB3aWxsIHJlY2VpdmUgcHVzaCBub3RpZmljYXRpb24gZm9yIHRoaXMgcnVsZSB3aXRoIHNvdW5kIGFuZFxuICAgICBoaWdobGlnaHQgaWYgdGhpcyBpcyBsZWdpdGltYXRlICovXG4gICAgTG91ZCA9IFwibG91ZFwiLFxufVxuXG5leHBvcnQgY2xhc3MgUHVzaFJ1bGVWZWN0b3JTdGF0ZSB7XG4gICAgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHkgKHRoaW5ncyBzaG91bGQgcHJvYmFibHkgYmUgdXNpbmcgdGhlIGVudW0gYWJvdmUgaW5zdGVhZClcbiAgICBzdGF0aWMgT0ZGID0gU3RhdGUuT2ZmO1xuICAgIHN0YXRpYyBPTiA9IFN0YXRlLk9uO1xuICAgIHN0YXRpYyBMT1VEID0gU3RhdGUuTG91ZDtcblxuICAgIC8qKlxuICAgICAqIEVudW0gZm9yIHN0YXRlIG9mIGEgcHVzaCBydWxlIGFzIGRlZmluZWQgYnkgdGhlIFZlY3RvciBVSS5cbiAgICAgKiBAcmVhZG9ubHlcbiAgICAgKiBAZW51bSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHN0YXRpYyBzdGF0ZXMgPSBTdGF0ZTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgYSBQdXNoUnVsZVZlY3RvclN0YXRlIHRvIGEgbGlzdCBvZiBhY3Rpb25zXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIFtvYmplY3RdIGxpc3Qgb2YgcHVzaC1ydWxlIGFjdGlvbnNcbiAgICAgKi9cbiAgICBzdGF0aWMgYWN0aW9uc0ZvcihwdXNoUnVsZVZlY3RvclN0YXRlOiBTdGF0ZSkge1xuICAgICAgICBpZiAocHVzaFJ1bGVWZWN0b3JTdGF0ZSA9PT0gU3RhdGUuT24pIHtcbiAgICAgICAgICAgIHJldHVybiBTdGFuZGFyZEFjdGlvbnMuQUNUSU9OX05PVElGWTtcbiAgICAgICAgfSBlbHNlIGlmIChwdXNoUnVsZVZlY3RvclN0YXRlID09PSBTdGF0ZS5Mb3VkKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RhbmRhcmRBY3Rpb25zLkFDVElPTl9ISUdITElHSFRfREVGQVVMVF9TT1VORDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgYSBwdXNocnVsZSdzIGFjdGlvbnMgdG8gYSBQdXNoUnVsZVZlY3RvclN0YXRlLlxuICAgICAqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgY29udGVudCBydWxlIGlzIGluIHRoZSBQdXNoUnVsZVZlY3RvclN0YXRlLk9OXG4gICAgICogY2F0ZWdvcnkgb3IgaW4gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5MT1VELCByZWdhcmRsZXNzIG9mIGl0cyBlbmFibGVkXG4gICAgICogc3RhdGUuIFJldHVybnMgbnVsbCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB0aGVzZSBjYXRlZ29yaWVzLlxuICAgICAqL1xuICAgIHN0YXRpYyBjb250ZW50UnVsZVZlY3RvclN0YXRlS2luZChydWxlOiBJUHVzaFJ1bGUpOiBTdGF0ZSB7XG4gICAgICAgIGNvbnN0IGRlY29kZWQgPSBOb3RpZmljYXRpb25VdGlscy5kZWNvZGVBY3Rpb25zKHJ1bGUuYWN0aW9ucyk7XG5cbiAgICAgICAgaWYgKCFkZWNvZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvdW50IHR3ZWFrcyB0byBkZXRlcm1pbmUgaWYgaXQgaXMgYSBPTiBvciBMT1VEIHJ1bGVcbiAgICAgICAgbGV0IHR3ZWFrcyA9IDA7XG4gICAgICAgIGlmIChkZWNvZGVkLnNvdW5kKSB7XG4gICAgICAgICAgICB0d2Vha3MrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVjb2RlZC5oaWdobGlnaHQpIHtcbiAgICAgICAgICAgIHR3ZWFrcysrO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzdGF0ZUtpbmQgPSBudWxsO1xuICAgICAgICBzd2l0Y2ggKHR3ZWFrcykge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHN0YXRlS2luZCA9IFN0YXRlLk9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHN0YXRlS2luZCA9IFN0YXRlLkxvdWQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRlS2luZDtcbiAgICB9XG59XG4iXX0=
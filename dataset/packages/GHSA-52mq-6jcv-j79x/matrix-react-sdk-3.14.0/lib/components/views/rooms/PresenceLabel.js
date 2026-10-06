"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2015, 2016 OpenMarket Ltd

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
class PresenceLabel extends _react.default.Component {
  // Return duration as a string using appropriate time units
  // XXX: This would be better handled using a culture-aware library, but we don't use one yet.
  getDuration(time) {
    if (!time) return;
    const t = parseInt(time / 1000);
    const s = t % 60;
    const m = parseInt(t / 60) % 60;
    const h = parseInt(t / (60 * 60)) % 24;
    const d = parseInt(t / (60 * 60 * 24));

    if (t < 60) {
      if (t < 0) {
        return (0, _languageHandler._t)("%(duration)ss", {
          duration: 0
        });
      }

      return (0, _languageHandler._t)("%(duration)ss", {
        duration: s
      });
    }

    if (t < 60 * 60) {
      return (0, _languageHandler._t)("%(duration)sm", {
        duration: m
      });
    }

    if (t < 24 * 60 * 60) {
      return (0, _languageHandler._t)("%(duration)sh", {
        duration: h
      });
    }

    return (0, _languageHandler._t)("%(duration)sd", {
      duration: d
    });
  }

  getPrettyPresence(presence, activeAgo, currentlyActive) {
    if (!currentlyActive && activeAgo !== undefined && activeAgo > 0) {
      const duration = this.getDuration(activeAgo);
      if (presence === "online") return (0, _languageHandler._t)("Online for %(duration)s", {
        duration: duration
      });
      if (presence === "unavailable") return (0, _languageHandler._t)("Idle for %(duration)s", {
        duration: duration
      }); // XXX: is this actually right?

      if (presence === "offline") return (0, _languageHandler._t)("Offline for %(duration)s", {
        duration: duration
      });
      return (0, _languageHandler._t)("Unknown for %(duration)s", {
        duration: duration
      });
    } else {
      if (presence === "online") return (0, _languageHandler._t)("Online");
      if (presence === "unavailable") return (0, _languageHandler._t)("Idle"); // XXX: is this actually right?

      if (presence === "offline") return (0, _languageHandler._t)("Offline");
      return (0, _languageHandler._t)("Unknown");
    }
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PresenceLabel"
    }, this.getPrettyPresence(this.props.presenceState, this.props.activeAgo, this.props.currentlyActive));
  }

}

exports.default = PresenceLabel;
(0, _defineProperty2.default)(PresenceLabel, "propTypes", {
  // number of milliseconds ago this user was last active.
  // zero = unknown
  activeAgo: _propTypes.default.number,
  // if true, activeAgo is an approximation and "Now" should
  // be shown instead
  currentlyActive: _propTypes.default.bool,
  // offline, online, etc
  presenceState: _propTypes.default.string
});
(0, _defineProperty2.default)(PresenceLabel, "defaultProps", {
  activeAgo: -1,
  presenceState: null
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1ByZXNlbmNlTGFiZWwuanMiXSwibmFtZXMiOlsiUHJlc2VuY2VMYWJlbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZ2V0RHVyYXRpb24iLCJ0aW1lIiwidCIsInBhcnNlSW50IiwicyIsIm0iLCJoIiwiZCIsImR1cmF0aW9uIiwiZ2V0UHJldHR5UHJlc2VuY2UiLCJwcmVzZW5jZSIsImFjdGl2ZUFnbyIsImN1cnJlbnRseUFjdGl2ZSIsInVuZGVmaW5lZCIsInJlbmRlciIsInByb3BzIiwicHJlc2VuY2VTdGF0ZSIsIlByb3BUeXBlcyIsIm51bWJlciIsImJvb2wiLCJzdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRZSxNQUFNQSxhQUFOLFNBQTRCQyxlQUFNQyxTQUFsQyxDQUE0QztBQW1CdkQ7QUFDQTtBQUNBQyxFQUFBQSxXQUFXLENBQUNDLElBQUQsRUFBTztBQUNkLFFBQUksQ0FBQ0EsSUFBTCxFQUFXO0FBQ1gsVUFBTUMsQ0FBQyxHQUFHQyxRQUFRLENBQUNGLElBQUksR0FBRyxJQUFSLENBQWxCO0FBQ0EsVUFBTUcsQ0FBQyxHQUFHRixDQUFDLEdBQUcsRUFBZDtBQUNBLFVBQU1HLENBQUMsR0FBR0YsUUFBUSxDQUFDRCxDQUFDLEdBQUcsRUFBTCxDQUFSLEdBQW1CLEVBQTdCO0FBQ0EsVUFBTUksQ0FBQyxHQUFHSCxRQUFRLENBQUNELENBQUMsSUFBSSxLQUFLLEVBQVQsQ0FBRixDQUFSLEdBQTBCLEVBQXBDO0FBQ0EsVUFBTUssQ0FBQyxHQUFHSixRQUFRLENBQUNELENBQUMsSUFBSSxLQUFLLEVBQUwsR0FBVSxFQUFkLENBQUYsQ0FBbEI7O0FBQ0EsUUFBSUEsQ0FBQyxHQUFHLEVBQVIsRUFBWTtBQUNSLFVBQUlBLENBQUMsR0FBRyxDQUFSLEVBQVc7QUFDUCxlQUFPLHlCQUFHLGVBQUgsRUFBb0I7QUFBQ00sVUFBQUEsUUFBUSxFQUFFO0FBQVgsU0FBcEIsQ0FBUDtBQUNIOztBQUNELGFBQU8seUJBQUcsZUFBSCxFQUFvQjtBQUFDQSxRQUFBQSxRQUFRLEVBQUVKO0FBQVgsT0FBcEIsQ0FBUDtBQUNIOztBQUNELFFBQUlGLENBQUMsR0FBRyxLQUFLLEVBQWIsRUFBaUI7QUFDYixhQUFPLHlCQUFHLGVBQUgsRUFBb0I7QUFBQ00sUUFBQUEsUUFBUSxFQUFFSDtBQUFYLE9BQXBCLENBQVA7QUFDSDs7QUFDRCxRQUFJSCxDQUFDLEdBQUcsS0FBSyxFQUFMLEdBQVUsRUFBbEIsRUFBc0I7QUFDbEIsYUFBTyx5QkFBRyxlQUFILEVBQW9CO0FBQUNNLFFBQUFBLFFBQVEsRUFBRUY7QUFBWCxPQUFwQixDQUFQO0FBQ0g7O0FBQ0QsV0FBTyx5QkFBRyxlQUFILEVBQW9CO0FBQUNFLE1BQUFBLFFBQVEsRUFBRUQ7QUFBWCxLQUFwQixDQUFQO0FBQ0g7O0FBRURFLEVBQUFBLGlCQUFpQixDQUFDQyxRQUFELEVBQVdDLFNBQVgsRUFBc0JDLGVBQXRCLEVBQXVDO0FBQ3BELFFBQUksQ0FBQ0EsZUFBRCxJQUFvQkQsU0FBUyxLQUFLRSxTQUFsQyxJQUErQ0YsU0FBUyxHQUFHLENBQS9ELEVBQWtFO0FBQzlELFlBQU1ILFFBQVEsR0FBRyxLQUFLUixXQUFMLENBQWlCVyxTQUFqQixDQUFqQjtBQUNBLFVBQUlELFFBQVEsS0FBSyxRQUFqQixFQUEyQixPQUFPLHlCQUFHLHlCQUFILEVBQThCO0FBQUVGLFFBQUFBLFFBQVEsRUFBRUE7QUFBWixPQUE5QixDQUFQO0FBQzNCLFVBQUlFLFFBQVEsS0FBSyxhQUFqQixFQUFnQyxPQUFPLHlCQUFHLHVCQUFILEVBQTRCO0FBQUVGLFFBQUFBLFFBQVEsRUFBRUE7QUFBWixPQUE1QixDQUFQLENBSDhCLENBRzhCOztBQUM1RixVQUFJRSxRQUFRLEtBQUssU0FBakIsRUFBNEIsT0FBTyx5QkFBRywwQkFBSCxFQUErQjtBQUFFRixRQUFBQSxRQUFRLEVBQUVBO0FBQVosT0FBL0IsQ0FBUDtBQUM1QixhQUFPLHlCQUFHLDBCQUFILEVBQStCO0FBQUVBLFFBQUFBLFFBQVEsRUFBRUE7QUFBWixPQUEvQixDQUFQO0FBQ0gsS0FORCxNQU1PO0FBQ0gsVUFBSUUsUUFBUSxLQUFLLFFBQWpCLEVBQTJCLE9BQU8seUJBQUcsUUFBSCxDQUFQO0FBQzNCLFVBQUlBLFFBQVEsS0FBSyxhQUFqQixFQUFnQyxPQUFPLHlCQUFHLE1BQUgsQ0FBUCxDQUY3QixDQUVnRDs7QUFDbkQsVUFBSUEsUUFBUSxLQUFLLFNBQWpCLEVBQTRCLE9BQU8seUJBQUcsU0FBSCxDQUFQO0FBQzVCLGFBQU8seUJBQUcsU0FBSCxDQUFQO0FBQ0g7QUFDSjs7QUFFREksRUFBQUEsTUFBTSxHQUFHO0FBQ0wsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ00sS0FBS0wsaUJBQUwsQ0FBdUIsS0FBS00sS0FBTCxDQUFXQyxhQUFsQyxFQUFpRCxLQUFLRCxLQUFMLENBQVdKLFNBQTVELEVBQXVFLEtBQUtJLEtBQUwsQ0FBV0gsZUFBbEYsQ0FETixDQURKO0FBS0g7O0FBaEVzRDs7OzhCQUF0Q2YsYSxlQUNFO0FBQ2Y7QUFDQTtBQUNBYyxFQUFBQSxTQUFTLEVBQUVNLG1CQUFVQyxNQUhOO0FBS2Y7QUFDQTtBQUNBTixFQUFBQSxlQUFlLEVBQUVLLG1CQUFVRSxJQVBaO0FBU2Y7QUFDQUgsRUFBQUEsYUFBYSxFQUFFQyxtQkFBVUc7QUFWVixDOzhCQURGdkIsYSxrQkFjSztBQUNsQmMsRUFBQUEsU0FBUyxFQUFFLENBQUMsQ0FETTtBQUVsQkssRUFBQUEsYUFBYSxFQUFFO0FBRkcsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlc2VuY2VMYWJlbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLy8gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBhZ28gdGhpcyB1c2VyIHdhcyBsYXN0IGFjdGl2ZS5cbiAgICAgICAgLy8gemVybyA9IHVua25vd25cbiAgICAgICAgYWN0aXZlQWdvOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gICAgICAgIC8vIGlmIHRydWUsIGFjdGl2ZUFnbyBpcyBhbiBhcHByb3hpbWF0aW9uIGFuZCBcIk5vd1wiIHNob3VsZFxuICAgICAgICAvLyBiZSBzaG93biBpbnN0ZWFkXG4gICAgICAgIGN1cnJlbnRseUFjdGl2ZTogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLy8gb2ZmbGluZSwgb25saW5lLCBldGNcbiAgICAgICAgcHJlc2VuY2VTdGF0ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgYWN0aXZlQWdvOiAtMSxcbiAgICAgICAgcHJlc2VuY2VTdGF0ZTogbnVsbCxcbiAgICB9O1xuXG4gICAgLy8gUmV0dXJuIGR1cmF0aW9uIGFzIGEgc3RyaW5nIHVzaW5nIGFwcHJvcHJpYXRlIHRpbWUgdW5pdHNcbiAgICAvLyBYWFg6IFRoaXMgd291bGQgYmUgYmV0dGVyIGhhbmRsZWQgdXNpbmcgYSBjdWx0dXJlLWF3YXJlIGxpYnJhcnksIGJ1dCB3ZSBkb24ndCB1c2Ugb25lIHlldC5cbiAgICBnZXREdXJhdGlvbih0aW1lKSB7XG4gICAgICAgIGlmICghdGltZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB0ID0gcGFyc2VJbnQodGltZSAvIDEwMDApO1xuICAgICAgICBjb25zdCBzID0gdCAlIDYwO1xuICAgICAgICBjb25zdCBtID0gcGFyc2VJbnQodCAvIDYwKSAlIDYwO1xuICAgICAgICBjb25zdCBoID0gcGFyc2VJbnQodCAvICg2MCAqIDYwKSkgJSAyNDtcbiAgICAgICAgY29uc3QgZCA9IHBhcnNlSW50KHQgLyAoNjAgKiA2MCAqIDI0KSk7XG4gICAgICAgIGlmICh0IDwgNjApIHtcbiAgICAgICAgICAgIGlmICh0IDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdChcIiUoZHVyYXRpb24pc3NcIiwge2R1cmF0aW9uOiAwfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3QoXCIlKGR1cmF0aW9uKXNzXCIsIHtkdXJhdGlvbjogc30pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0IDwgNjAgKiA2MCkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiJShkdXJhdGlvbilzbVwiLCB7ZHVyYXRpb246IG19KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA8IDI0ICogNjAgKiA2MCkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiJShkdXJhdGlvbilzaFwiLCB7ZHVyYXRpb246IGh9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3QoXCIlKGR1cmF0aW9uKXNkXCIsIHtkdXJhdGlvbjogZH0pO1xuICAgIH1cblxuICAgIGdldFByZXR0eVByZXNlbmNlKHByZXNlbmNlLCBhY3RpdmVBZ28sIGN1cnJlbnRseUFjdGl2ZSkge1xuICAgICAgICBpZiAoIWN1cnJlbnRseUFjdGl2ZSAmJiBhY3RpdmVBZ28gIT09IHVuZGVmaW5lZCAmJiBhY3RpdmVBZ28gPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuZ2V0RHVyYXRpb24oYWN0aXZlQWdvKTtcbiAgICAgICAgICAgIGlmIChwcmVzZW5jZSA9PT0gXCJvbmxpbmVcIikgcmV0dXJuIF90KFwiT25saW5lIGZvciAlKGR1cmF0aW9uKXNcIiwgeyBkdXJhdGlvbjogZHVyYXRpb24gfSk7XG4gICAgICAgICAgICBpZiAocHJlc2VuY2UgPT09IFwidW5hdmFpbGFibGVcIikgcmV0dXJuIF90KFwiSWRsZSBmb3IgJShkdXJhdGlvbilzXCIsIHsgZHVyYXRpb246IGR1cmF0aW9uIH0pOyAvLyBYWFg6IGlzIHRoaXMgYWN0dWFsbHkgcmlnaHQ/XG4gICAgICAgICAgICBpZiAocHJlc2VuY2UgPT09IFwib2ZmbGluZVwiKSByZXR1cm4gX3QoXCJPZmZsaW5lIGZvciAlKGR1cmF0aW9uKXNcIiwgeyBkdXJhdGlvbjogZHVyYXRpb24gfSk7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJVbmtub3duIGZvciAlKGR1cmF0aW9uKXNcIiwgeyBkdXJhdGlvbjogZHVyYXRpb24gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocHJlc2VuY2UgPT09IFwib25saW5lXCIpIHJldHVybiBfdChcIk9ubGluZVwiKTtcbiAgICAgICAgICAgIGlmIChwcmVzZW5jZSA9PT0gXCJ1bmF2YWlsYWJsZVwiKSByZXR1cm4gX3QoXCJJZGxlXCIpOyAvLyBYWFg6IGlzIHRoaXMgYWN0dWFsbHkgcmlnaHQ/XG4gICAgICAgICAgICBpZiAocHJlc2VuY2UgPT09IFwib2ZmbGluZVwiKSByZXR1cm4gX3QoXCJPZmZsaW5lXCIpO1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiVW5rbm93blwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUHJlc2VuY2VMYWJlbFwiPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5nZXRQcmV0dHlQcmVzZW5jZSh0aGlzLnByb3BzLnByZXNlbmNlU3RhdGUsIHRoaXMucHJvcHMuYWN0aXZlQWdvLCB0aGlzLnByb3BzLmN1cnJlbnRseUFjdGl2ZSkgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
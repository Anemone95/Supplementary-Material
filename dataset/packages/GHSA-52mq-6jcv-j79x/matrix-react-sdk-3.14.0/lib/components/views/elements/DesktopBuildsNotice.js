"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DesktopBuildsNotice;
exports.WarningKind = void 0;

var _EventIndexPeg = _interopRequireDefault(require("../../../indexing/EventIndexPeg"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _react = _interopRequireDefault(require("react"));

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
let WarningKind;
exports.WarningKind = WarningKind;

(function (WarningKind) {
  WarningKind[WarningKind["Files"] = 0] = "Files";
  WarningKind[WarningKind["Search"] = 1] = "Search";
})(WarningKind || (exports.WarningKind = WarningKind = {}));

function DesktopBuildsNotice({
  isRoomEncrypted,
  kind
}
/*: IProps*/
) {
  if (!isRoomEncrypted) return null;
  if (_EventIndexPeg.default.get()) return null;

  const {
    desktopBuilds,
    brand
  } = _SdkConfig.default.get();

  let text = null;
  let logo = null;

  if (desktopBuilds.available) {
    logo = /*#__PURE__*/_react.default.createElement("img", {
      src: desktopBuilds.logo
    });

    switch (kind) {
      case WarningKind.Files:
        text = (0, _languageHandler._t)("Use the <a>Desktop app</a> to see all encrypted files", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: desktopBuilds.url,
            target: "_blank",
            rel: "noreferrer noopener"
          }, sub)
        });
        break;

      case WarningKind.Search:
        text = (0, _languageHandler._t)("Use the <a>Desktop app</a> to search encrypted messages", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: desktopBuilds.url,
            target: "_blank",
            rel: "noreferrer noopener"
          }, sub)
        });
        break;
    }
  } else {
    switch (kind) {
      case WarningKind.Files:
        text = (0, _languageHandler._t)("This version of %(brand)s does not support viewing some encrypted files", {
          brand
        });
        break;

      case WarningKind.Search:
        text = (0, _languageHandler._t)("This version of %(brand)s does not support searching encrypted messages", {
          brand
        });
        break;
    }
  } // for safety


  if (!text) {
    console.warn("Unknown desktop builds warning kind: ", kind);
    return null;
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DesktopBuildsNotice"
  }, logo, /*#__PURE__*/_react.default.createElement("span", null, text));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0Rlc2t0b3BCdWlsZHNOb3RpY2UudHN4Il0sIm5hbWVzIjpbIldhcm5pbmdLaW5kIiwiRGVza3RvcEJ1aWxkc05vdGljZSIsImlzUm9vbUVuY3J5cHRlZCIsImtpbmQiLCJFdmVudEluZGV4UGVnIiwiZ2V0IiwiZGVza3RvcEJ1aWxkcyIsImJyYW5kIiwiU2RrQ29uZmlnIiwidGV4dCIsImxvZ28iLCJhdmFpbGFibGUiLCJGaWxlcyIsImEiLCJzdWIiLCJ1cmwiLCJTZWFyY2giLCJjb25zb2xlIiwid2FybiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBT1lBLFc7OztXQUFBQSxXO0FBQUFBLEVBQUFBLFcsQ0FBQUEsVztBQUFBQSxFQUFBQSxXLENBQUFBLFc7R0FBQUEsVywyQkFBQUEsVzs7QUFVRyxTQUFTQyxtQkFBVCxDQUE2QjtBQUFDQyxFQUFBQSxlQUFEO0FBQWtCQyxFQUFBQTtBQUFsQjtBQUE3QjtBQUFBLEVBQThEO0FBQ3pFLE1BQUksQ0FBQ0QsZUFBTCxFQUFzQixPQUFPLElBQVA7QUFDdEIsTUFBSUUsdUJBQWNDLEdBQWQsRUFBSixFQUF5QixPQUFPLElBQVA7O0FBRXpCLFFBQU07QUFBQ0MsSUFBQUEsYUFBRDtBQUFnQkMsSUFBQUE7QUFBaEIsTUFBeUJDLG1CQUFVSCxHQUFWLEVBQS9COztBQUVBLE1BQUlJLElBQUksR0FBRyxJQUFYO0FBQ0EsTUFBSUMsSUFBSSxHQUFHLElBQVg7O0FBQ0EsTUFBSUosYUFBYSxDQUFDSyxTQUFsQixFQUE2QjtBQUN6QkQsSUFBQUEsSUFBSSxnQkFBRztBQUFLLE1BQUEsR0FBRyxFQUFFSixhQUFhLENBQUNJO0FBQXhCLE1BQVA7O0FBQ0EsWUFBUVAsSUFBUjtBQUNJLFdBQUtILFdBQVcsQ0FBQ1ksS0FBakI7QUFDSUgsUUFBQUEsSUFBSSxHQUFHLHlCQUFHLHVEQUFILEVBQTRELEVBQTVELEVBQWdFO0FBQ25FSSxVQUFBQSxDQUFDLEVBQUVDLEdBQUcsaUJBQUs7QUFBRyxZQUFBLElBQUksRUFBRVIsYUFBYSxDQUFDUyxHQUF2QjtBQUE0QixZQUFBLE1BQU0sRUFBQyxRQUFuQztBQUE0QyxZQUFBLEdBQUcsRUFBQztBQUFoRCxhQUF1RUQsR0FBdkU7QUFEd0QsU0FBaEUsQ0FBUDtBQUdBOztBQUNKLFdBQUtkLFdBQVcsQ0FBQ2dCLE1BQWpCO0FBQ0lQLFFBQUFBLElBQUksR0FBRyx5QkFBRyx5REFBSCxFQUE4RCxFQUE5RCxFQUFrRTtBQUNyRUksVUFBQUEsQ0FBQyxFQUFFQyxHQUFHLGlCQUFLO0FBQUcsWUFBQSxJQUFJLEVBQUVSLGFBQWEsQ0FBQ1MsR0FBdkI7QUFBNEIsWUFBQSxNQUFNLEVBQUMsUUFBbkM7QUFBNEMsWUFBQSxHQUFHLEVBQUM7QUFBaEQsYUFBdUVELEdBQXZFO0FBRDBELFNBQWxFLENBQVA7QUFHQTtBQVZSO0FBWUgsR0FkRCxNQWNPO0FBQ0gsWUFBUVgsSUFBUjtBQUNJLFdBQUtILFdBQVcsQ0FBQ1ksS0FBakI7QUFDSUgsUUFBQUEsSUFBSSxHQUFHLHlCQUFHLHlFQUFILEVBQThFO0FBQUNGLFVBQUFBO0FBQUQsU0FBOUUsQ0FBUDtBQUNBOztBQUNKLFdBQUtQLFdBQVcsQ0FBQ2dCLE1BQWpCO0FBQ0lQLFFBQUFBLElBQUksR0FBRyx5QkFBRyx5RUFBSCxFQUE4RTtBQUFDRixVQUFBQTtBQUFELFNBQTlFLENBQVA7QUFDQTtBQU5SO0FBUUgsR0EvQndFLENBaUN6RTs7O0FBQ0EsTUFBSSxDQUFDRSxJQUFMLEVBQVc7QUFDUFEsSUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQWEsdUNBQWIsRUFBc0RmLElBQXREO0FBQ0EsV0FBTyxJQUFQO0FBQ0g7O0FBRUQsc0JBQ0k7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLEtBQ0tPLElBREwsZUFFSSwyQ0FBT0QsSUFBUCxDQUZKLENBREo7QUFNSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBFdmVudEluZGV4UGVnIGZyb20gXCIuLi8uLi8uLi9pbmRleGluZy9FdmVudEluZGV4UGVnXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgZW51bSBXYXJuaW5nS2luZCB7XG4gICAgRmlsZXMsXG4gICAgU2VhcmNoLFxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBpc1Jvb21FbmNyeXB0ZWQ6IGJvb2xlYW47XG4gICAga2luZDogV2FybmluZ0tpbmQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERlc2t0b3BCdWlsZHNOb3RpY2Uoe2lzUm9vbUVuY3J5cHRlZCwga2luZH06IElQcm9wcykge1xuICAgIGlmICghaXNSb29tRW5jcnlwdGVkKSByZXR1cm4gbnVsbDtcbiAgICBpZiAoRXZlbnRJbmRleFBlZy5nZXQoKSkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCB7ZGVza3RvcEJ1aWxkcywgYnJhbmR9ID0gU2RrQ29uZmlnLmdldCgpO1xuXG4gICAgbGV0IHRleHQgPSBudWxsO1xuICAgIGxldCBsb2dvID0gbnVsbDtcbiAgICBpZiAoZGVza3RvcEJ1aWxkcy5hdmFpbGFibGUpIHtcbiAgICAgICAgbG9nbyA9IDxpbWcgc3JjPXtkZXNrdG9wQnVpbGRzLmxvZ299IC8+O1xuICAgICAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgV2FybmluZ0tpbmQuRmlsZXM6XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiVXNlIHRoZSA8YT5EZXNrdG9wIGFwcDwvYT4gdG8gc2VlIGFsbCBlbmNyeXB0ZWQgZmlsZXNcIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+ICg8YSBocmVmPXtkZXNrdG9wQnVpbGRzLnVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPntzdWJ9PC9hPiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFdhcm5pbmdLaW5kLlNlYXJjaDpcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJVc2UgdGhlIDxhPkRlc2t0b3AgYXBwPC9hPiB0byBzZWFyY2ggZW5jcnlwdGVkIG1lc3NhZ2VzXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiAoPGEgaHJlZj17ZGVza3RvcEJ1aWxkcy51cmx9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj57c3VifTwvYT4pLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3dpdGNoIChraW5kKSB7XG4gICAgICAgICAgICBjYXNlIFdhcm5pbmdLaW5kLkZpbGVzOlxuICAgICAgICAgICAgICAgIHRleHQgPSBfdChcIlRoaXMgdmVyc2lvbiBvZiAlKGJyYW5kKXMgZG9lcyBub3Qgc3VwcG9ydCB2aWV3aW5nIHNvbWUgZW5jcnlwdGVkIGZpbGVzXCIsIHticmFuZH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBXYXJuaW5nS2luZC5TZWFyY2g6XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiVGhpcyB2ZXJzaW9uIG9mICUoYnJhbmQpcyBkb2VzIG5vdCBzdXBwb3J0IHNlYXJjaGluZyBlbmNyeXB0ZWQgbWVzc2FnZXNcIiwge2JyYW5kfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmb3Igc2FmZXR5XG4gICAgaWYgKCF0ZXh0KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIlVua25vd24gZGVza3RvcCBidWlsZHMgd2FybmluZyBraW5kOiBcIiwga2luZCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGVza3RvcEJ1aWxkc05vdGljZVwiPlxuICAgICAgICAgICAge2xvZ299XG4gICAgICAgICAgICA8c3Bhbj57dGV4dH08L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iXX0=
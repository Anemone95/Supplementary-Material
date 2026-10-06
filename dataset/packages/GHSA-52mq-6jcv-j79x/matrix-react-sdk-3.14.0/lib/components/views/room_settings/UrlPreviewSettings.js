"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _actions = require("../../../dispatcher/actions");

var _SettingLevel = require("../../../settings/SettingLevel");

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Travis Ralston
Copyright 2018, 2019 New Vector Ltd
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
class UrlPreviewSettings extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onClickUserSettings", e => {
      e.preventDefault();
      e.stopPropagation();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
  }

  render() {
    const SettingsFlag = sdk.getComponent("elements.SettingsFlag");
    const roomId = this.props.room.roomId;

    const isEncrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(roomId);

    let previewsForAccount = null;
    let previewsForRoom = null;

    if (!isEncrypted) {
      // Only show account setting state and room state setting state in non-e2ee rooms where they apply
      const accountEnabled = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.ACCOUNT, "urlPreviewsEnabled");

      if (accountEnabled) {
        previewsForAccount = (0, _languageHandler._t)("You have <a>enabled</a> URL previews by default.", {}, {
          'a': sub => /*#__PURE__*/_react.default.createElement("a", {
            onClick: this._onClickUserSettings,
            href: ""
          }, sub)
        });
      } else {
        previewsForAccount = (0, _languageHandler._t)("You have <a>disabled</a> URL previews by default.", {}, {
          'a': sub => /*#__PURE__*/_react.default.createElement("a", {
            onClick: this._onClickUserSettings,
            href: ""
          }, sub)
        });
      }

      if (_SettingsStore.default.canSetValue("urlPreviewsEnabled", roomId, "room")) {
        previewsForRoom = /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement(SettingsFlag, {
          name: "urlPreviewsEnabled",
          level: _SettingLevel.SettingLevel.ROOM,
          roomId: roomId,
          isExplicit: true
        }));
      } else {
        let str = (0, _languageHandler._td)("URL previews are enabled by default for participants in this room.");

        if (!_SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.ROOM, "urlPreviewsEnabled", roomId,
        /*explicit=*/
        true)) {
          str = (0, _languageHandler._td)("URL previews are disabled by default for participants in this room.");
        }

        previewsForRoom = /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)(str));
      }
    } else {
      previewsForAccount = (0, _languageHandler._t)("In encrypted rooms, like this one, URL previews are disabled by default to ensure that your " + "homeserver (where the previews are generated) cannot gather information about links you see in " + "this room.");
    }

    const previewsForRoomAccount =
    /*#__PURE__*/
    // in an e2ee room we use a special key to enforce per-room opt-in
    _react.default.createElement(SettingsFlag, {
      name: isEncrypted ? 'urlPreviewsEnabled_e2ee' : 'urlPreviewsEnabled',
      level: _SettingLevel.SettingLevel.ROOM_ACCOUNT,
      roomId: roomId
    });

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)('When someone puts a URL in their message, a URL preview can be shown to give more ' + 'information about that link such as the title, description, and an image from the website.')), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, previewsForAccount), previewsForRoom, /*#__PURE__*/_react.default.createElement("label", null, previewsForRoomAccount));
  }

}

exports.default = UrlPreviewSettings;
(0, _defineProperty2.default)(UrlPreviewSettings, "propTypes", {
  room: _propTypes.default.object
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21fc2V0dGluZ3MvVXJsUHJldmlld1NldHRpbmdzLmpzIl0sIm5hbWVzIjpbIlVybFByZXZpZXdTZXR0aW5ncyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiZGlzIiwiZmlyZSIsIkFjdGlvbiIsIlZpZXdVc2VyU2V0dGluZ3MiLCJyZW5kZXIiLCJTZXR0aW5nc0ZsYWciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJyb29tSWQiLCJwcm9wcyIsInJvb20iLCJpc0VuY3J5cHRlZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImlzUm9vbUVuY3J5cHRlZCIsInByZXZpZXdzRm9yQWNjb3VudCIsInByZXZpZXdzRm9yUm9vbSIsImFjY291bnRFbmFibGVkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlQXQiLCJTZXR0aW5nTGV2ZWwiLCJBQ0NPVU5UIiwic3ViIiwiX29uQ2xpY2tVc2VyU2V0dGluZ3MiLCJjYW5TZXRWYWx1ZSIsIlJPT00iLCJzdHIiLCJwcmV2aWV3c0ZvclJvb21BY2NvdW50IiwiUk9PTV9BQ0NPVU5UIiwiUHJvcFR5cGVzIiwib2JqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFhZSxNQUFNQSxrQkFBTixTQUFpQ0MsZUFBTUMsU0FBdkMsQ0FBaUQ7QUFBQTtBQUFBO0FBQUEsZ0VBS3BDQyxDQUFELElBQU87QUFDMUJBLE1BQUFBLENBQUMsQ0FBQ0MsY0FBRjtBQUNBRCxNQUFBQSxDQUFDLENBQUNFLGVBQUY7O0FBQ0FDLDBCQUFJQyxJQUFK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IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uL2luZGV4XCI7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHtTZXR0aW5nTGV2ZWx9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVcmxQcmV2aWV3U2V0dGluZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QsXG4gICAgfTtcblxuICAgIF9vbkNsaWNrVXNlclNldHRpbmdzID0gKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgU2V0dGluZ3NGbGFnID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNldHRpbmdzRmxhZ1wiKTtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5yb29tLnJvb21JZDtcbiAgICAgICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNSb29tRW5jcnlwdGVkKHJvb21JZCk7XG5cbiAgICAgICAgbGV0IHByZXZpZXdzRm9yQWNjb3VudCA9IG51bGw7XG4gICAgICAgIGxldCBwcmV2aWV3c0ZvclJvb20gPSBudWxsO1xuXG4gICAgICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgc2hvdyBhY2NvdW50IHNldHRpbmcgc3RhdGUgYW5kIHJvb20gc3RhdGUgc2V0dGluZyBzdGF0ZSBpbiBub24tZTJlZSByb29tcyB3aGVyZSB0aGV5IGFwcGx5XG4gICAgICAgICAgICBjb25zdCBhY2NvdW50RW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgXCJ1cmxQcmV2aWV3c0VuYWJsZWRcIik7XG4gICAgICAgICAgICBpZiAoYWNjb3VudEVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBwcmV2aWV3c0ZvckFjY291bnQgPSAoXG4gICAgICAgICAgICAgICAgICAgIF90KFwiWW91IGhhdmUgPGE+ZW5hYmxlZDwvYT4gVVJMIHByZXZpZXdzIGJ5IGRlZmF1bHQuXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpPT48YSBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrVXNlclNldHRpbmdzfSBocmVmPScnPnsgc3ViIH08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZXZpZXdzRm9yQWNjb3VudCA9IChcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJZb3UgaGF2ZSA8YT5kaXNhYmxlZDwvYT4gVVJMIHByZXZpZXdzIGJ5IGRlZmF1bHQuXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpPT48YSBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrVXNlclNldHRpbmdzfSBocmVmPScnPnsgc3ViIH08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmNhblNldFZhbHVlKFwidXJsUHJldmlld3NFbmFibGVkXCIsIHJvb21JZCwgXCJyb29tXCIpKSB7XG4gICAgICAgICAgICAgICAgcHJldmlld3NGb3JSb29tID0gKFxuICAgICAgICAgICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnIG5hbWU9XCJ1cmxQcmV2aWV3c0VuYWJsZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXZlbD17U2V0dGluZ0xldmVsLlJPT019XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21JZD17cm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0V4cGxpY2l0PXt0cnVlfSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBzdHIgPSBfdGQoXCJVUkwgcHJldmlld3MgYXJlIGVuYWJsZWQgYnkgZGVmYXVsdCBmb3IgcGFydGljaXBhbnRzIGluIHRoaXMgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoU2V0dGluZ0xldmVsLlJPT00sIFwidXJsUHJldmlld3NFbmFibGVkXCIsIHJvb21JZCwgLypleHBsaWNpdD0qL3RydWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IF90ZChcIlVSTCBwcmV2aWV3cyBhcmUgZGlzYWJsZWQgYnkgZGVmYXVsdCBmb3IgcGFydGljaXBhbnRzIGluIHRoaXMgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXZpZXdzRm9yUm9vbSA9ICg8bGFiZWw+eyBfdChzdHIpIH08L2xhYmVsPik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmV2aWV3c0ZvckFjY291bnQgPSAoXG4gICAgICAgICAgICAgICAgX3QoXCJJbiBlbmNyeXB0ZWQgcm9vbXMsIGxpa2UgdGhpcyBvbmUsIFVSTCBwcmV2aWV3cyBhcmUgZGlzYWJsZWQgYnkgZGVmYXVsdCB0byBlbnN1cmUgdGhhdCB5b3VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJob21lc2VydmVyICh3aGVyZSB0aGUgcHJldmlld3MgYXJlIGdlbmVyYXRlZCkgY2Fubm90IGdhdGhlciBpbmZvcm1hdGlvbiBhYm91dCBsaW5rcyB5b3Ugc2VlIGluIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGlzIHJvb20uXCIpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJldmlld3NGb3JSb29tQWNjb3VudCA9ICggLy8gaW4gYW4gZTJlZSByb29tIHdlIHVzZSBhIHNwZWNpYWwga2V5IHRvIGVuZm9yY2UgcGVyLXJvb20gb3B0LWluXG4gICAgICAgICAgICA8U2V0dGluZ3NGbGFnIG5hbWU9e2lzRW5jcnlwdGVkID8gJ3VybFByZXZpZXdzRW5hYmxlZF9lMmVlJyA6ICd1cmxQcmV2aWV3c0VuYWJsZWQnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBsZXZlbD17U2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUlkPXtyb29tSWR9IC8+XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnV2hlbiBzb21lb25lIHB1dHMgYSBVUkwgaW4gdGhlaXIgbWVzc2FnZSwgYSBVUkwgcHJldmlldyBjYW4gYmUgc2hvd24gdG8gZ2l2ZSBtb3JlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2luZm9ybWF0aW9uIGFib3V0IHRoYXQgbGluayBzdWNoIGFzIHRoZSB0aXRsZSwgZGVzY3JpcHRpb24sIGFuZCBhbiBpbWFnZSBmcm9tIHRoZSB3ZWJzaXRlLicpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICB7IHByZXZpZXdzRm9yQWNjb3VudCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBwcmV2aWV3c0ZvclJvb20gfVxuICAgICAgICAgICAgICAgIDxsYWJlbD57IHByZXZpZXdzRm9yUm9vbUFjY291bnQgfTwvbGFiZWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
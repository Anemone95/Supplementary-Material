"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _strings = require("../../../utils/strings");

var _promise = require("../../../utils/promise");

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _RoomInvite = require("../../../RoomInvite");

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
const SpacePublicShare = ({
  space,
  onFinished
}
/*: IProps*/
) => {
  const [copiedText, setCopiedText] = (0, _react.useState)((0, _languageHandler._t)("Click to copy"));
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpacePublicShare"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpacePublicShare_shareButton",
    onClick: async () => {
      const permalinkCreator = new _Permalinks.RoomPermalinkCreator(space);
      permalinkCreator.load();
      const success = await (0, _strings.copyPlaintext)(permalinkCreator.forRoom());
      const text = success ? (0, _languageHandler._t)("Copied!") : (0, _languageHandler._t)("Failed to copy");
      setCopiedText(text);
      await (0, _promise.sleep)(5000);

      if (copiedText === text) {
        // if the text hasn't changed by another click then clear it after some time
        setCopiedText((0, _languageHandler._t)("Click to copy"));
      }
    }
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Share invite link")), /*#__PURE__*/_react.default.createElement("span", null, copiedText)), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpacePublicShare_inviteButton",
    onClick: () => {
      (0, _RoomInvite.showRoomInviteDialog)(space.roomId);
      if (onFinished) onFinished();
    }
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Invite people")), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Invite with email or username"))));
};

var _default = SpacePublicShare;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NwYWNlcy9TcGFjZVB1YmxpY1NoYXJlLnRzeCJdLCJuYW1lcyI6WyJTcGFjZVB1YmxpY1NoYXJlIiwic3BhY2UiLCJvbkZpbmlzaGVkIiwiY29waWVkVGV4dCIsInNldENvcGllZFRleHQiLCJwZXJtYWxpbmtDcmVhdG9yIiwiUm9vbVBlcm1hbGlua0NyZWF0b3IiLCJsb2FkIiwic3VjY2VzcyIsImZvclJvb20iLCJ0ZXh0Iiwicm9vbUlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaUJBLE1BQU1BLGdCQUFnQixHQUFHLENBQUM7QUFBRUMsRUFBQUEsS0FBRjtBQUFTQyxFQUFBQTtBQUFUO0FBQUQ7QUFBQSxLQUFtQztBQUN4RCxRQUFNLENBQUNDLFVBQUQsRUFBYUMsYUFBYixJQUE4QixxQkFBUyx5QkFBRyxlQUFILENBQVQsQ0FBcEM7QUFFQSxzQkFBTztBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsa0JBQ0gsNkJBQUMseUJBQUQ7QUFDSSxJQUFBLFNBQVMsRUFBQyxpQ0FEZDtBQUVJLElBQUEsT0FBTyxFQUFFLFlBQVk7QUFDakIsWUFBTUMsZ0JBQWdCLEdBQUcsSUFBSUMsZ0NBQUosQ0FBeUJMLEtBQXpCLENBQXpCO0FBQ0FJLE1BQUFBLGdCQUFnQixDQUFDRSxJQUFqQjtBQUNBLFlBQU1DLE9BQU8sR0FBRyxNQUFNLDRCQUFjSCxnQkFBZ0IsQ0FBQ0ksT0FBakIsRUFBZCxDQUF0QjtBQUNBLFlBQU1DLElBQUksR0FBR0YsT0FBTyxHQUFHLHlCQUFHLFNBQUgsQ0FBSCxHQUFtQix5QkFBRyxnQkFBSCxDQUF2QztBQUNBSixNQUFBQSxhQUFhLENBQUNNLElBQUQsQ0FBYjtBQUNBLFlBQU0sb0JBQU0sSUFBTixDQUFOOztBQUNBLFVBQUlQLFVBQVUsS0FBS08sSUFBbkIsRUFBeUI7QUFBRTtBQUN2Qk4sUUFBQUEsYUFBYSxDQUFDLHlCQUFHLGVBQUgsQ0FBRCxDQUFiO0FBQ0g7QUFDSjtBQVpMLGtCQWNJLHlDQUFNLHlCQUFHLG1CQUFILENBQU4sQ0FkSixlQWVJLDJDQUFRRCxVQUFSLENBZkosQ0FERyxlQWtCSCw2QkFBQyx5QkFBRDtBQUNJLElBQUEsU0FBUyxFQUFDLGtDQURkO0FBRUksSUFBQSxPQUFPLEVBQUUsTUFBTTtBQUNYLDRDQUFxQkYsS0FBSyxDQUFDVSxNQUEzQjtBQUNBLFVBQUlULFVBQUosRUFBZ0JBLFVBQVU7QUFDN0I7QUFMTCxrQkFPSSx5Q0FBTSx5QkFBRyxlQUFILENBQU4sQ0FQSixlQVFJLDJDQUFRLHlCQUFHLCtCQUFILENBQVIsQ0FSSixDQWxCRyxDQUFQO0FBNkJILENBaENEOztlQWtDZUYsZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHt1c2VTdGF0ZX0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuXG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHtjb3B5UGxhaW50ZXh0fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc3RyaW5nc1wiO1xuaW1wb3J0IHtzbGVlcH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Byb21pc2VcIjtcbmltcG9ydCB7Um9vbVBlcm1hbGlua0NyZWF0b3J9IGZyb20gXCIuLi8uLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7c2hvd1Jvb21JbnZpdGVEaWFsb2d9IGZyb20gXCIuLi8uLi8uLi9Sb29tSW52aXRlXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHNwYWNlOiBSb29tO1xuICAgIG9uRmluaXNoZWQ/KCk6IHZvaWQ7XG59XG5cbmNvbnN0IFNwYWNlUHVibGljU2hhcmUgPSAoeyBzcGFjZSwgb25GaW5pc2hlZCB9OiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBbY29waWVkVGV4dCwgc2V0Q29waWVkVGV4dF0gPSB1c2VTdGF0ZShfdChcIkNsaWNrIHRvIGNvcHlcIikpO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VQdWJsaWNTaGFyZVwiPlxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VQdWJsaWNTaGFyZV9zaGFyZUJ1dHRvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGVybWFsaW5rQ3JlYXRvciA9IG5ldyBSb29tUGVybWFsaW5rQ3JlYXRvcihzcGFjZSk7XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvci5sb2FkKCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IGNvcHlQbGFpbnRleHQocGVybWFsaW5rQ3JlYXRvci5mb3JSb29tKCkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBzdWNjZXNzID8gX3QoXCJDb3BpZWQhXCIpIDogX3QoXCJGYWlsZWQgdG8gY29weVwiKTtcbiAgICAgICAgICAgICAgICBzZXRDb3BpZWRUZXh0KHRleHQpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKDUwMDApO1xuICAgICAgICAgICAgICAgIGlmIChjb3BpZWRUZXh0ID09PSB0ZXh0KSB7IC8vIGlmIHRoZSB0ZXh0IGhhc24ndCBjaGFuZ2VkIGJ5IGFub3RoZXIgY2xpY2sgdGhlbiBjbGVhciBpdCBhZnRlciBzb21lIHRpbWVcbiAgICAgICAgICAgICAgICAgICAgc2V0Q29waWVkVGV4dChfdChcIkNsaWNrIHRvIGNvcHlcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICAgIDxoMz57IF90KFwiU2hhcmUgaW52aXRlIGxpbmtcIikgfTwvaDM+XG4gICAgICAgICAgICA8c3Bhbj57IGNvcGllZFRleHQgfTwvc3Bhbj5cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VQdWJsaWNTaGFyZV9pbnZpdGVCdXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNob3dSb29tSW52aXRlRGlhbG9nKHNwYWNlLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgaWYgKG9uRmluaXNoZWQpIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICAgIDxoMz57IF90KFwiSW52aXRlIHBlb3BsZVwiKSB9PC9oMz5cbiAgICAgICAgICAgIDxzcGFuPnsgX3QoXCJJbnZpdGUgd2l0aCBlbWFpbCBvciB1c2VybmFtZVwiKSB9PC9zcGFuPlxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgPC9kaXY+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU3BhY2VQdWJsaWNTaGFyZTtcbiJdfQ==
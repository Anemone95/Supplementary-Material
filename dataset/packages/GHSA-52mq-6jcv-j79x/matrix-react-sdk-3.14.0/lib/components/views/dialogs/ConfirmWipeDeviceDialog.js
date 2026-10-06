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

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

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
class ConfirmWipeDeviceDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onConfirm", () => {
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "_onDecline", () => {
      this.props.onFinished(false);
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_ConfirmWipeDeviceDialog",
      hasCancel: true,
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Clear all data in this session?")
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ConfirmWipeDeviceDialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Clearing all data from this session is permanent. Encrypted messages will be lost " + "unless their keys have been backed up."))), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)("Clear all data"),
      onPrimaryButtonClick: this._onConfirm,
      primaryButtonClass: "danger",
      cancelButton: (0, _languageHandler._t)("Cancel"),
      onCancel: this._onDecline
    }));
  }

}

exports.default = ConfirmWipeDeviceDialog;
(0, _defineProperty2.default)(ConfirmWipeDeviceDialog, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ29uZmlybVdpcGVEZXZpY2VEaWFsb2cuanMiXSwibmFtZXMiOlsiQ29uZmlybVdpcGVEZXZpY2VEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsInByb3BzIiwib25GaW5pc2hlZCIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJEaWFsb2dCdXR0b25zIiwiX29uQ29uZmlybSIsIl9vbkRlY2xpbmUiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBT2UsTUFBTUEsdUJBQU4sU0FBc0NDLGVBQU1DLFNBQTVDLENBQXNEO0FBQUE7QUFBQTtBQUFBLHNEQUtwRCxNQUFNO0FBQ2YsV0FBS0MsS0FBTCxDQUFXQyxVQUFYLENBQXNCLElBQXRCO0FBQ0gsS0FQZ0U7QUFBQSxzREFTcEQsTUFBTTtBQUNmLFdBQUtELEtBQUwsQ0FBV0MsVUFBWCxDQUFzQixLQUF0QjtBQUNILEtBWGdFO0FBQUE7O0FBYWpFQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxVQUFVLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwwQkFBakIsQ0FBbkI7QUFDQSxVQUFNQyxhQUFhLEdBQUdGLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw4QkFBakIsQ0FBdEI7QUFFQSx3QkFDSSw2QkFBQyxVQUFEO0FBQVksTUFBQSxTQUFTLEVBQUMsNEJBQXRCO0FBQW1ELE1BQUEsU0FBUyxFQUFFLElBQTlEO0FBQ1ksTUFBQSxVQUFVLEVBQUUsS0FBS0wsS0FBTCxDQUFXQyxVQURuQztBQUVZLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGlDQUFIO0FBRm5CLG9CQUdJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSx3Q0FDSyx5QkFDRyx1RkFDQSx3Q0FGSCxDQURMLENBREosQ0FISixlQVdJLDZCQUFDLGFBQUQ7QUFDSSxNQUFBLGFBQWEsRUFBRSx5QkFBRyxnQkFBSCxDQURuQjtBQUVJLE1BQUEsb0JBQW9CLEVBQUUsS0FBS00sVUFGL0I7QUFHSSxNQUFBLGtCQUFrQixFQUFDLFFBSHZCO0FBSUksTUFBQSxZQUFZLEVBQUUseUJBQUcsUUFBSCxDQUpsQjtBQUtJLE1BQUEsUUFBUSxFQUFFLEtBQUtDO0FBTG5CLE1BWEosQ0FESjtBQXFCSDs7QUF0Q2dFOzs7OEJBQWhEWCx1QixlQUNFO0FBQ2ZJLEVBQUFBLFVBQVUsRUFBRVEsbUJBQVVDLElBQVYsQ0FBZUM7QUFEWixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpcm1XaXBlRGV2aWNlRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBfb25Db25maXJtID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgfTtcblxuICAgIF9vbkRlY2xpbmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9J214X0NvbmZpcm1XaXBlRGV2aWNlRGlhbG9nJyBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJDbGVhciBhbGwgZGF0YSBpbiB0aGlzIHNlc3Npb24/XCIpfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfQ29uZmlybVdpcGVEZXZpY2VEaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ2xlYXJpbmcgYWxsIGRhdGEgZnJvbSB0aGlzIHNlc3Npb24gaXMgcGVybWFuZW50LiBFbmNyeXB0ZWQgbWVzc2FnZXMgd2lsbCBiZSBsb3N0IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInVubGVzcyB0aGVpciBrZXlzIGhhdmUgYmVlbiBiYWNrZWQgdXAuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoXCJDbGVhciBhbGwgZGF0YVwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uQ29uZmlybX1cbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbkNsYXNzPVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uPXtfdChcIkNhbmNlbFwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMuX29uRGVjbGluZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
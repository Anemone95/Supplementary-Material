"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard3(require("../../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _actions = require("../../../../dispatcher/actions");

/*
Copyright 2019 New Vector Ltd
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
class RecoveryMethodRemovedDialog extends _react.default.PureComponent {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onGoToSettingsClick", () => {
      this.props.onFinished();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
    (0, _defineProperty2.default)(this, "onSetupClick", () => {
      this.props.onFinished();

      _Modal.default.createTrackedDialogAsync("Key Backup", "Key Backup", Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require("./CreateKeyBackupDialog"))), null, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
  }

  render() {
    const BaseDialog = sdk.getComponent("views.dialogs.BaseDialog");
    const DialogButtons = sdk.getComponent("views.elements.DialogButtons");

    const title = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_KeyBackupFailedDialog_title"
    }, (0, _languageHandler._t)("Recovery Method Removed"));

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_KeyBackupFailedDialog",
      onFinished: this.props.onFinished,
      title: title
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This session has detected that your Security Phrase and key " + "for Secure Messages have been removed.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you did this accidentally, you can setup Secure Messages on " + "this session which will re-encrypt this session's message " + "history with a new recovery method.")), /*#__PURE__*/_react.default.createElement("p", {
      className: "warning"
    }, (0, _languageHandler._t)("If you didn't remove the recovery method, an " + "attacker may be trying to access your account. " + "Change your account password and set a new recovery " + "method immediately in Settings.")), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)("Set up Secure Messages"),
      onPrimaryButtonClick: this.onSetupClick,
      cancelButton: (0, _languageHandler._t)("Go to Settings"),
      onCancel: this.onGoToSettingsClick
    })));
  }

}

exports.default = RecoveryMethodRemovedDialog;
(0, _defineProperty2.default)(RecoveryMethodRemovedDialog, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvUmVjb3ZlcnlNZXRob2RSZW1vdmVkRGlhbG9nLmpzIl0sIm5hbWVzIjpbIlJlY292ZXJ5TWV0aG9kUmVtb3ZlZERpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsInByb3BzIiwib25GaW5pc2hlZCIsImRpcyIsImZpcmUiLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRGlhbG9nQnV0dG9ucyIsInRpdGxlIiwib25TZXR1cENsaWNrIiwib25Hb1RvU2V0dGluZ3NDbGljayIsIlByb3BUeXBlcyIsImZ1bmMiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVWUsTUFBTUEsMkJBQU4sU0FBMENDLGVBQU1DLGFBQWhELENBQThEO0FBQUE7QUFBQTtBQUFBLCtEQUtuRCxNQUFNO0FBQ3hCLFdBQUtDLEtBQUwsQ0FBV0MsVUFBWDs7QUFDQUMsMEJBQUlDLElBQUosQ0FBU0MsZ0JBQU9DLGdCQUFoQjtBQUNILEtBUndFO0FBQUEsd0RBVTFELE1BQU07QUFDakIsV0FBS0wsS0FBTCxDQUFXQyxVQUFYOztBQUNBSyxxQkFBTUMsd0JBQU4sQ0FBK0IsWUFBL0IsRUFBNkMsWUFBN0MsNkVBQ1cseUJBRFgsS0FFSSxJQUZKLEVBRVUsSUFGVjtBQUVnQjtBQUFpQixXQUZqQztBQUV3QztBQUFlLFVBRnZEO0FBSUgsS0FoQndFO0FBQUE7O0FBa0J6RUMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsVUFBVSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMEJBQWpCLENBQW5CO0FBQ0EsVUFBTUMsYUFBYSxHQUFHRixHQUFHLENBQUNDLFlBQUosQ0FBaUIsOEJBQWpCLENBQXRCOztBQUVBLFVBQU1FLEtBQUssZ0JBQUc7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixPQUNULHlCQUFHLHlCQUFILENBRFMsQ0FBZDs7QUFJQSx3QkFDSSw2QkFBQyxVQUFEO0FBQVksTUFBQSxTQUFTLEVBQUMsMEJBQXRCO0FBQ0ksTUFBQSxVQUFVLEVBQUUsS0FBS2IsS0FBTCxDQUFXQyxVQUQzQjtBQUVJLE1BQUEsS0FBSyxFQUFFWTtBQUZYLG9CQUlJLHVEQUNJLHdDQUFJLHlCQUNBLGlFQUNBLHdDQUZBLENBQUosQ0FESixlQUtJLHdDQUFJLHlCQUNBLG9FQUNBLDREQURBLEdBRUEscUNBSEEsQ0FBSixDQUxKLGVBVUk7QUFBRyxNQUFBLFNBQVMsRUFBQztBQUFiLE9BQXdCLHlCQUNwQixrREFDQSxpREFEQSxHQUVBLHNEQUZBLEdBR0EsaUNBSm9CLENBQXhCLENBVkosZUFnQkksNkJBQUMsYUFBRDtBQUNJLE1BQUEsYUFBYSxFQUFFLHlCQUFHLHdCQUFILENBRG5CO0FBRUksTUFBQSxvQkFBb0IsRUFBRSxLQUFLQyxZQUYvQjtBQUdJLE1BQUEsWUFBWSxFQUFFLHlCQUFHLGdCQUFILENBSGxCO0FBSUksTUFBQSxRQUFRLEVBQUUsS0FBS0M7QUFKbkIsTUFoQkosQ0FKSixDQURKO0FBOEJIOztBQXhEd0U7Ozs4QkFBeERsQiwyQixlQUNFO0FBQ2ZJLEVBQUFBLFVBQVUsRUFBRWUsbUJBQVVDLElBQVYsQ0FBZUM7QUFEWixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWNvdmVyeU1ldGhvZFJlbW92ZWREaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIG9uR29Ub1NldHRpbmdzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgb25TZXR1cENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jKFwiS2V5IEJhY2t1cFwiLCBcIktleSBCYWNrdXBcIixcbiAgICAgICAgICAgIGltcG9ydChcIi4vQ3JlYXRlS2V5QmFja3VwRGlhbG9nXCIpLFxuICAgICAgICAgICAgbnVsbCwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnNcIik7XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSA8c3BhbiBjbGFzc05hbWU9XCJteF9LZXlCYWNrdXBGYWlsZWREaWFsb2dfdGl0bGVcIj5cbiAgICAgICAgICAgIHtfdChcIlJlY292ZXJ5IE1ldGhvZCBSZW1vdmVkXCIpfVxuICAgICAgICA8L3NwYW4+O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9XCJteF9LZXlCYWNrdXBGYWlsZWREaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHNlc3Npb24gaGFzIGRldGVjdGVkIHRoYXQgeW91ciBTZWN1cml0eSBQaHJhc2UgYW5kIGtleSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZvciBTZWN1cmUgTWVzc2FnZXMgaGF2ZSBiZWVuIHJlbW92ZWQuXCIsXG4gICAgICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSBkaWQgdGhpcyBhY2NpZGVudGFsbHksIHlvdSBjYW4gc2V0dXAgU2VjdXJlIE1lc3NhZ2VzIG9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhpcyBzZXNzaW9uIHdoaWNoIHdpbGwgcmUtZW5jcnlwdCB0aGlzIHNlc3Npb24ncyBtZXNzYWdlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGlzdG9yeSB3aXRoIGEgbmV3IHJlY292ZXJ5IG1ldGhvZC5cIixcbiAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndhcm5pbmdcIj57X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSBkaWRuJ3QgcmVtb3ZlIHRoZSByZWNvdmVyeSBtZXRob2QsIGFuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXR0YWNrZXIgbWF5IGJlIHRyeWluZyB0byBhY2Nlc3MgeW91ciBhY2NvdW50LiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkNoYW5nZSB5b3VyIGFjY291bnQgcGFzc3dvcmQgYW5kIHNldCBhIG5ldyByZWNvdmVyeSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZCBpbW1lZGlhdGVseSBpbiBTZXR0aW5ncy5cIixcbiAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIlNldCB1cCBTZWN1cmUgTWVzc2FnZXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vblNldHVwQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b249e190KFwiR28gdG8gU2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkdvVG9TZXR0aW5nc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
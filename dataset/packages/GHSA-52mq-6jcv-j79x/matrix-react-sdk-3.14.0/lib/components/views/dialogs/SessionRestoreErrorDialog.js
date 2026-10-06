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

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd
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
class SessionRestoreErrorDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_sendBugReport", () => {
      const BugReportDialog = sdk.getComponent("dialogs.BugReportDialog");

      _Modal.default.createTrackedDialog('Session Restore Error', 'Send Bug Report Dialog', BugReportDialog, {});
    });
    (0, _defineProperty2.default)(this, "_onClearStorageClick", () => {
      const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

      _Modal.default.createTrackedDialog('Session Restore Confirm Logout', '', QuestionDialog, {
        title: (0, _languageHandler._t)("Sign out"),
        description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Sign out and remove encryption keys?")),
        button: (0, _languageHandler._t)("Sign out"),
        danger: true,
        onFinished: this.props.onFinished
      });
    });
    (0, _defineProperty2.default)(this, "_onRefreshClick", () => {
      // Is this likely to help? Probably not, but giving only one button
      // that clears your storage seems awful.
      window.location.reload(true);
    });
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');

    const clearStorageButton = /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._onClearStorageClick,
      className: "danger"
    }, (0, _languageHandler._t)("Clear Storage and Sign Out"));

    let dialogButtons;

    if (_SdkConfig.default.get().bug_report_endpoint_url) {
      dialogButtons = /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)("Send Logs"),
        onPrimaryButtonClick: this._sendBugReport,
        focus: true,
        hasCancel: false
      }, clearStorageButton);
    } else {
      dialogButtons = /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)("Refresh"),
        onPrimaryButtonClick: this._onRefreshClick,
        focus: true,
        hasCancel: false
      }, clearStorageButton);
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_ErrorDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)('Unable to restore session'),
      contentId: "mx_Dialog_content",
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content",
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We encountered an error trying to restore your previous session.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you have previously used a more recent version of %(brand)s, your session " + "may be incompatible with this version. Close this window and return " + "to the more recent version.", {
      brand
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Clearing your browser's storage may fix the problem, but will sign you " + "out and cause any encrypted chat history to become unreadable."))), dialogButtons);
  }

}

exports.default = SessionRestoreErrorDialog;
(0, _defineProperty2.default)(SessionRestoreErrorDialog, "propTypes", {
  error: _propTypes.default.string.isRequired,
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2Vzc2lvblJlc3RvcmVFcnJvckRpYWxvZy5qcyJdLCJuYW1lcyI6WyJTZXNzaW9uUmVzdG9yZUVycm9yRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJCdWdSZXBvcnREaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJkYW5nZXIiLCJvbkZpbmlzaGVkIiwicHJvcHMiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInJlbG9hZCIsInJlbmRlciIsImJyYW5kIiwiU2RrQ29uZmlnIiwiZ2V0IiwiQmFzZURpYWxvZyIsIkRpYWxvZ0J1dHRvbnMiLCJjbGVhclN0b3JhZ2VCdXR0b24iLCJfb25DbGVhclN0b3JhZ2VDbGljayIsImRpYWxvZ0J1dHRvbnMiLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsIl9zZW5kQnVnUmVwb3J0IiwiX29uUmVmcmVzaENsaWNrIiwiZXJyb3IiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVlLE1BQU1BLHlCQUFOLFNBQXdDQyxlQUFNQyxTQUE5QyxDQUF3RDtBQUFBO0FBQUE7QUFBQSwwREFNbEQsTUFBTTtBQUNuQixZQUFNQyxlQUFlLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix5QkFBakIsQ0FBeEI7O0FBQ0FDLHFCQUFNQyxtQkFBTixDQUEwQix1QkFBMUIsRUFBbUQsd0JBQW5ELEVBQTZFSixlQUE3RSxF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ZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXNzaW9uUmVzdG9yZUVycm9yRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBlcnJvcjogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBfc2VuZEJ1Z1JlcG9ydCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgQnVnUmVwb3J0RGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuQnVnUmVwb3J0RGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTZXNzaW9uIFJlc3RvcmUgRXJyb3InLCAnU2VuZCBCdWcgUmVwb3J0IERpYWxvZycsIEJ1Z1JlcG9ydERpYWxvZywge30pO1xuICAgIH07XG5cbiAgICBfb25DbGVhclN0b3JhZ2VDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5RdWVzdGlvbkRpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2Vzc2lvbiBSZXN0b3JlIENvbmZpcm0gTG9nb3V0JywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJTaWduIG91dFwiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgIDxkaXY+eyBfdChcIlNpZ24gb3V0IGFuZCByZW1vdmUgZW5jcnlwdGlvbiBrZXlzP1wiKSB9PC9kaXY+LFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIlNpZ24gb3V0XCIpLFxuICAgICAgICAgICAgZGFuZ2VyOiB0cnVlLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogdGhpcy5wcm9wcy5vbkZpbmlzaGVkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uUmVmcmVzaENsaWNrID0gKCkgPT4ge1xuICAgICAgICAvLyBJcyB0aGlzIGxpa2VseSB0byBoZWxwPyBQcm9iYWJseSBub3QsIGJ1dCBnaXZpbmcgb25seSBvbmUgYnV0dG9uXG4gICAgICAgIC8vIHRoYXQgY2xlYXJzIHlvdXIgc3RvcmFnZSBzZWVtcyBhd2Z1bC5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuXG4gICAgICAgIGNvbnN0IGNsZWFyU3RvcmFnZUJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fb25DbGVhclN0b3JhZ2VDbGlja30gY2xhc3NOYW1lPVwiZGFuZ2VyXCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIkNsZWFyIFN0b3JhZ2UgYW5kIFNpZ24gT3V0XCIpIH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBkaWFsb2dCdXR0b25zO1xuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsKSB7XG4gICAgICAgICAgICBkaWFsb2dCdXR0b25zID0gPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoXCJTZW5kIExvZ3NcIil9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX3NlbmRCdWdSZXBvcnR9XG4gICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGNsZWFyU3RvcmFnZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L0RpYWxvZ0J1dHRvbnM+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlhbG9nQnV0dG9ucyA9IDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KFwiUmVmcmVzaFwiKX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5fb25SZWZyZXNoQ2xpY2t9XG4gICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGNsZWFyU3RvcmFnZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L0RpYWxvZ0J1dHRvbnM+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT1cIm14X0Vycm9yRGlhbG9nXCIgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnVW5hYmxlIHRvIHJlc3RvcmUgc2Vzc2lvbicpfVxuICAgICAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfRGlhbG9nX2NvbnRlbnQnXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCIgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcIldlIGVuY291bnRlcmVkIGFuIGVycm9yIHRyeWluZyB0byByZXN0b3JlIHlvdXIgcHJldmlvdXMgc2Vzc2lvbi5cIikgfTwvcD5cblxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UgaGF2ZSBwcmV2aW91c2x5IHVzZWQgYSBtb3JlIHJlY2VudCB2ZXJzaW9uIG9mICUoYnJhbmQpcywgeW91ciBzZXNzaW9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWF5IGJlIGluY29tcGF0aWJsZSB3aXRoIHRoaXMgdmVyc2lvbi4gQ2xvc2UgdGhpcyB3aW5kb3cgYW5kIHJldHVybiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvIHRoZSBtb3JlIHJlY2VudCB2ZXJzaW9uLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICAgICAgKSB9PC9wPlxuXG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkNsZWFyaW5nIHlvdXIgYnJvd3NlcidzIHN0b3JhZ2UgbWF5IGZpeCB0aGUgcHJvYmxlbSwgYnV0IHdpbGwgc2lnbiB5b3UgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJvdXQgYW5kIGNhdXNlIGFueSBlbmNyeXB0ZWQgY2hhdCBoaXN0b3J5IHRvIGJlY29tZSB1bnJlYWRhYmxlLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBkaWFsb2dCdXR0b25zIH1cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
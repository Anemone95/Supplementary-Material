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

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

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
class IntegrationsDisabledDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onAcknowledgeClick", () => {
      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "_onOpenSettingsClick", () => {
      this.props.onFinished();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_IntegrationsDisabledDialog",
      hasCancel: true,
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Integrations are disabled")
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_IntegrationsDisabledDialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Enable 'Manage Integrations' in Settings to do this."))), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)("Settings"),
      onPrimaryButtonClick: this._onOpenSettingsClick,
      cancelButton: (0, _languageHandler._t)("OK"),
      onCancel: this._onAcknowledgeClick
    }));
  }

}

exports.default = IntegrationsDisabledDialog;
(0, _defineProperty2.default)(IntegrationsDisabledDialog, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvSW50ZWdyYXRpb25zRGlzYWJsZWREaWFsb2cuanMiXSwibmFtZXMiOlsiSW50ZWdyYXRpb25zRGlzYWJsZWREaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsInByb3BzIiwib25GaW5pc2hlZCIsImRpcyIsImZpcmUiLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwicmVuZGVyIiwiQmFzZURpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIkRpYWxvZ0J1dHRvbnMiLCJfb25PcGVuU2V0dGluZ3NDbGljayIsIl9vbkFja25vd2xlZGdlQ2xpY2siLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU2UsTUFBTUEsMEJBQU4sU0FBeUNDLGVBQU1DLFNBQS9DLENBQXlEO0FBQUE7QUFBQTtBQUFBLCtEQUs5QyxNQUFNO0FBQ3hCLFdBQUtDLEtBQUwsQ0FBV0MsVUFBWDtBQUNILEtBUG1FO0FBQUEsZ0VBUzdDLE1BQU07QUFDekIsV0FBS0QsS0FBTCxDQUFXQyxVQUFYOztBQUNBQywwQkFBSUMsSUFBSixDQUFTQyxnQkFBT0MsZ0JBQWhCO0FBQ0gsS0FabUU7QUFBQTs7QUFjcEVDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLFVBQVUsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDBCQUFqQixDQUFuQjtBQUNBLFVBQU1DLGFBQWEsR0FBR0YsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDhCQUFqQixDQUF0QjtBQUVBLHdCQUNJLDZCQUFDLFVBQUQ7QUFBWSxNQUFBLFNBQVMsRUFBQywrQkFBdEI7QUFBc0QsTUFBQSxTQUFTLEVBQUUsSUFBakU7QUFDWSxNQUFBLFVBQVUsRUFBRSxLQUFLVCxLQUFMLENBQVdDLFVBRG5DO0FBRVksTUFBQSxLQUFLLEVBQUUseUJBQUcsMkJBQUg7QUFGbkIsb0JBR0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLHdDQUFJLHlCQUFHLHNEQUFILENBQUosQ0FESixDQUhKLGVBTUksNkJBQUMsYUFBRDtBQUNJLE1BQUEsYUFBYSxFQUFFLHlCQUFHLFVBQUgsQ0FEbkI7QUFFSSxNQUFBLG9CQUFvQixFQUFFLEtBQUtVLG9CQUYvQjtBQUdJLE1BQUEsWUFBWSxFQUFFLHlCQUFHLElBQUgsQ0FIbEI7QUFJSSxNQUFBLFFBQVEsRUFBRSxLQUFLQztBQUpuQixNQU5KLENBREo7QUFlSDs7QUFqQ21FOzs7OEJBQW5EZiwwQixlQUNFO0FBQ2ZJLEVBQUFBLFVBQVUsRUFBRVksbUJBQVVDLElBQVYsQ0FBZUM7QUFEWixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uL2luZGV4XCI7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlZ3JhdGlvbnNEaXNhYmxlZERpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgX29uQWNrbm93bGVkZ2VDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIF9vbk9wZW5TZXR0aW5nc0NsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPSdteF9JbnRlZ3JhdGlvbnNEaXNhYmxlZERpYWxvZycgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiSW50ZWdyYXRpb25zIGFyZSBkaXNhYmxlZFwiKX0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludGVncmF0aW9uc0Rpc2FibGVkRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXCJFbmFibGUgJ01hbmFnZSBJbnRlZ3JhdGlvbnMnIGluIFNldHRpbmdzIHRvIGRvIHRoaXMuXCIpfTwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIlNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5fb25PcGVuU2V0dGluZ3NDbGlja31cbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uPXtfdChcIk9LXCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25BY2tub3dsZWRnZUNsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
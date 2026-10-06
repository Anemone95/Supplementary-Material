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
Copyright 2019 New Vector Ltd

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
class StorageEvictedDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_sendBugReport", ev => {
      ev.preventDefault();
      const BugReportDialog = sdk.getComponent("dialogs.BugReportDialog");

      _Modal.default.createTrackedDialog('Storage evicted', 'Send Bug Report Dialog', BugReportDialog, {});
    });
    (0, _defineProperty2.default)(this, "_onSignOutClick", () => {
      this.props.onFinished(true);
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    let logRequest;

    if (_SdkConfig.default.get().bug_report_endpoint_url) {
      logRequest = (0, _languageHandler._t)("To help us prevent this in future, please <a>send us logs</a>.", {}, {
        a: text => /*#__PURE__*/_react.default.createElement("a", {
          href: "#",
          onClick: this._sendBugReport
        }, text)
      });
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_ErrorDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)('Missing session data'),
      contentId: "mx_Dialog_content",
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content",
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Some session data, including encrypted message keys, is " + "missing. Sign out and sign in to fix this, restoring keys " + "from backup.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your browser likely removed this data when running low on " + "disk space."), " ", logRequest)), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)("Sign out"),
      onPrimaryButtonClick: this._onSignOutClick,
      focus: true,
      hasCancel: false
    }));
  }

}

exports.default = StorageEvictedDialog;
(0, _defineProperty2.default)(StorageEvictedDialog, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU3RvcmFnZUV2aWN0ZWREaWFsb2cuanMiXSwibmFtZXMiOlsiU3RvcmFnZUV2aWN0ZWREaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImV2IiwicHJldmVudERlZmF1bHQiLCJCdWdSZXBvcnREaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwiRGlhbG9nQnV0dG9ucyIsImxvZ1JlcXVlc3QiLCJTZGtDb25maWciLCJnZXQiLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsImEiLCJ0ZXh0IiwiX3NlbmRCdWdSZXBvcnQiLCJfb25TaWduT3V0Q2xpY2siLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU2UsTUFBTUEsb0JBQU4sU0FBbUNDLGVBQU1DLFNBQXpDLENBQW1EO0FBQUE7QUFBQTtBQUFBLDBEQUs3Q0MsRUFBRSxJQUFJO0FBQ25CQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFDQSxZQUFNQyxlQUFlLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix5QkFBakIsQ0FBeEI7O0FBQ0FDLHFCQUFNQyxtQkFBTixDQUEwQixpQkFBMUIsRUFBNkMsd0JBQTdDLEVBQXVFSixlQUF2RSxFQUF3RixFQUF4RjtBQUNILEtBVDZEO0FBQUEsMkRBVzVDLE1BQU07QUFDcEIsV0FBS0ssS0FBTCxDQUFXQyxVQUFYLENBQXNCLElBQXRCO0FBQ0gsS0FiNkQ7QUFBQTs7QUFlOURDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLFVBQVUsR0FBR1AsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDBCQUFqQixDQUFuQjtBQUNBLFVBQU1PLGFBQWEsR0FBR1IsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDhCQUFqQixDQUF0QjtBQUVBLFFBQUlRLFVBQUo7O0FBQ0EsUUFBSUMsbUJBQVVDLEdBQVYsR0FBZ0JDLHVCQUFwQixFQUE2QztBQUN6Q0gsTUFBQUEsVUFBVSxHQUFHLHlCQUNULGdFQURTLEVBQ3lELEVBRHpELEVBRWI7QUFDSUksUUFBQUEsQ0FBQyxFQUFFQyxJQUFJLGlCQUFJO0FBQUcsVUFBQSxJQUFJLEVBQUMsR0FBUjtBQUFZLFVBQUEsT0FBTyxFQUFFLEtBQUtDO0FBQTFCLFdBQTJDRCxJQUEzQztBQURmLE9BRmEsQ0FBYjtBQUtIOztBQUVELHdCQUNJLDZCQUFDLFVBQUQ7QUFBWSxNQUFBLFNBQVMsRUFBQyxnQkFBdEI7QUFBdUMsTUFBQSxVQUFVLEVBQUUsS0FBS1YsS0FBTCxDQUFXQyxVQUE5RDtBQUNJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLHNCQUFILENBRFg7QUFFSSxNQUFBLFNBQVMsRUFBQyxtQkFGZDtBQUdJLE1BQUEsU0FBUyxFQUFFO0FBSGYsb0JBS0k7QUFBSyxNQUFBLFNBQVMsRUFBQyxtQkFBZjtBQUFtQyxNQUFBLEVBQUUsRUFBQztBQUF0QyxvQkFDSSx3Q0FBSSx5QkFDQSw2REFDQSw0REFEQSxHQUVBLGNBSEEsQ0FBSixDQURKLGVBTUksd0NBQUkseUJBQ0EsK0RBQ0EsYUFGQSxDQUFKLE9BR0lJLFVBSEosQ0FOSixDQUxKLGVBZ0JJLDZCQUFDLGFBQUQ7QUFBZSxNQUFBLGFBQWEsRUFBRSx5QkFBRyxVQUFILENBQTlCO0FBQ0ksTUFBQSxvQkFBb0IsRUFBRSxLQUFLTyxlQUQvQjtBQUVJLE1BQUEsS0FBSyxFQUFFLElBRlg7QUFHSSxNQUFBLFNBQVMsRUFBRTtBQUhmLE1BaEJKLENBREo7QUF3Qkg7O0FBcEQ2RDs7OzhCQUE3Q3RCLG9CLGVBQ0U7QUFDZlcsRUFBQUEsVUFBVSxFQUFFWSxtQkFBVUMsSUFBVixDQUFlQztBQURaLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uLy4uLy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9yYWdlRXZpY3RlZERpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgX3NlbmRCdWdSZXBvcnQgPSBldiA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IEJ1Z1JlcG9ydERpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkJ1Z1JlcG9ydERpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU3RvcmFnZSBldmljdGVkJywgJ1NlbmQgQnVnIFJlcG9ydCBEaWFsb2cnLCBCdWdSZXBvcnREaWFsb2csIHt9KTtcbiAgICB9O1xuXG4gICAgX29uU2lnbk91dENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuXG4gICAgICAgIGxldCBsb2dSZXF1ZXN0O1xuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsKSB7XG4gICAgICAgICAgICBsb2dSZXF1ZXN0ID0gX3QoXG4gICAgICAgICAgICAgICAgXCJUbyBoZWxwIHVzIHByZXZlbnQgdGhpcyBpbiBmdXR1cmUsIHBsZWFzZSA8YT5zZW5kIHVzIGxvZ3M8L2E+LlwiLCB7fSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhOiB0ZXh0ID0+IDxhIGhyZWY9XCIjXCIgb25DbGljaz17dGhpcy5fc2VuZEJ1Z1JlcG9ydH0+e3RleHR9PC9hPixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT1cIm14X0Vycm9yRGlhbG9nXCIgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnTWlzc2luZyBzZXNzaW9uIGRhdGEnKX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiIGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiU29tZSBzZXNzaW9uIGRhdGEsIGluY2x1ZGluZyBlbmNyeXB0ZWQgbWVzc2FnZSBrZXlzLCBpcyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1pc3NpbmcuIFNpZ24gb3V0IGFuZCBzaWduIGluIHRvIGZpeCB0aGlzLCByZXN0b3Jpbmcga2V5cyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZyb20gYmFja3VwLlwiLFxuICAgICAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJZb3VyIGJyb3dzZXIgbGlrZWx5IHJlbW92ZWQgdGhpcyBkYXRhIHdoZW4gcnVubmluZyBsb3cgb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNrIHNwYWNlLlwiLFxuICAgICAgICAgICAgICAgICAgICApfSB7bG9nUmVxdWVzdH08L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoXCJTaWduIG91dFwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uU2lnbk91dENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBmb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
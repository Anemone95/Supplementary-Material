"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let StorageEvictedDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.StorageEvictedDialog"), _dec(_class = (_temp = _class2 = class StorageEvictedDialog extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = StorageEvictedDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU3RvcmFnZUV2aWN0ZWREaWFsb2cuanMiXSwibmFtZXMiOlsiU3RvcmFnZUV2aWN0ZWREaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImV2IiwicHJldmVudERlZmF1bHQiLCJCdWdSZXBvcnREaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwiRGlhbG9nQnV0dG9ucyIsImxvZ1JlcXVlc3QiLCJTZGtDb25maWciLCJnZXQiLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsImEiLCJ0ZXh0IiwiX3NlbmRCdWdSZXBvcnQiLCJfb25TaWduT3V0Q2xpY2siLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsb0IsV0FEcEIsZ0RBQXFCLG9DQUFyQixDLG1DQUFELE1BQ3FCQSxvQkFEckIsU0FDa0RDLGVBQU1DLFNBRHhELENBQ2tFO0FBQUE7QUFBQTtBQUFBLDBEQUs3Q0MsRUFBRSxJQUFJO0FBQ25CQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFDQSxZQUFNQyxlQUFlLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix5QkFBakIsQ0FBeEI7O0FBQ0FDLHFCQUFNQyxtQkFBTixDQUEwQixpQkFBMUIsRUFBNkMsd0JBQTdDLEVBQXVFSixlQUF2RSxFQUF3RixFQUF4RjtBQUNILEtBVDZEO0FBQUEsMkRBVzVDLE1BQU07QUFDcEIsV0FBS0ssS0FBTCxDQUFXQyxVQUFYLENBQXNCLElBQXRCO0FBQ0gsS0FiNkQ7QUFBQTs7QUFlOURDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLFVBQVUsR0FBR1AsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDBCQUFqQixDQUFuQjtBQUNBLFVBQU1PLGFBQWEsR0FBR1IsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDhCQUFqQixDQUF0QjtBQUVBLFFBQUlRLFVBQUo7O0FBQ0EsUUFBSUMsbUJBQVVDLEdBQVYsR0FBZ0JDLHVCQUFwQixFQUE2QztBQUN6Q0gsTUFBQUEsVUFBVSxHQUFHLHlCQUNULGdFQURTLEVBRVQsRUFGUyxFQUdUO0FBQ0lJLFFBQUFBLENBQUMsRUFBRUMsSUFBSSxpQkFBSTtBQUFHLFVBQUEsSUFBSSxFQUFDLEdBQVI7QUFBWSxVQUFBLE9BQU8sRUFBRSxLQUFLQztBQUExQixXQUEyQ0QsSUFBM0M7QUFEZixPQUhTLENBQWI7QUFPSDs7QUFFRCx3QkFDSSw2QkFBQyxVQUFEO0FBQVksTUFBQSxTQUFTLEVBQUMsZ0JBQXRCO0FBQXVDLE1BQUEsVUFBVSxFQUFFLEtBQUtWLEtBQUwsQ0FBV0MsVUFBOUQ7QUFDSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxzQkFBSCxDQURYO0FBRUksTUFBQSxTQUFTLEVBQUMsbUJBRmQ7QUFHSSxNQUFBLFNBQVMsRUFBRTtBQUhmLG9CQUtJO0FBQUssTUFBQSxTQUFTLEVBQUMsbUJBQWY7QUFBbUMsTUFBQSxFQUFFLEVBQUM7QUFBdEMsb0JBQ0ksd0NBQUkseUJBQ0EsNkRBQ0EsNERBREEsR0FFQSxjQUhBLENBQUosQ0FESixlQU1JLHdDQUFJLHlCQUNBLCtEQUNBLGFBRkEsQ0FBSixPQUdJSSxVQUhKLENBTkosQ0FMSixlQWdCSSw2QkFBQyxhQUFEO0FBQWUsTUFBQSxhQUFhLEVBQUUseUJBQUcsVUFBSCxDQUE5QjtBQUNJLE1BQUEsb0JBQW9CLEVBQUUsS0FBS08sZUFEL0I7QUFFSSxNQUFBLEtBQUssRUFBRSxJQUZYO0FBR0ksTUFBQSxTQUFTLEVBQUU7QUFIZixNQWhCSixDQURKO0FBd0JIOztBQXRENkQsQyxzREFDM0M7QUFDZlgsRUFBQUEsVUFBVSxFQUFFWSxtQkFBVUMsSUFBVixDQUFlQztBQURaLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uLy4uLy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuU3RvcmFnZUV2aWN0ZWREaWFsb2dcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JhZ2VFdmljdGVkRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBfc2VuZEJ1Z1JlcG9ydCA9IGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgQnVnUmVwb3J0RGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuQnVnUmVwb3J0RGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTdG9yYWdlIGV2aWN0ZWQnLCAnU2VuZCBCdWcgUmVwb3J0IERpYWxvZycsIEJ1Z1JlcG9ydERpYWxvZywge30pO1xuICAgIH07XG5cbiAgICBfb25TaWduT3V0Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG5cbiAgICAgICAgbGV0IGxvZ1JlcXVlc3Q7XG4gICAgICAgIGlmIChTZGtDb25maWcuZ2V0KCkuYnVnX3JlcG9ydF9lbmRwb2ludF91cmwpIHtcbiAgICAgICAgICAgIGxvZ1JlcXVlc3QgPSBfdChcbiAgICAgICAgICAgICAgICBcIlRvIGhlbHAgdXMgcHJldmVudCB0aGlzIGluIGZ1dHVyZSwgcGxlYXNlIDxhPnNlbmQgdXMgbG9nczwvYT4uXCIsXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBhOiB0ZXh0ID0+IDxhIGhyZWY9XCIjXCIgb25DbGljaz17dGhpcy5fc2VuZEJ1Z1JlcG9ydH0+e3RleHR9PC9hPixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9XCJteF9FcnJvckRpYWxvZ1wiIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoJ01pc3Npbmcgc2Vzc2lvbiBkYXRhJyl9XG4gICAgICAgICAgICAgICAgY29udGVudElkPSdteF9EaWFsb2dfY29udGVudCdcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIiBpZD0nbXhfRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlNvbWUgc2Vzc2lvbiBkYXRhLCBpbmNsdWRpbmcgZW5jcnlwdGVkIG1lc3NhZ2Uga2V5cywgaXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJtaXNzaW5nLiBTaWduIG91dCBhbmQgc2lnbiBpbiB0byBmaXggdGhpcywgcmVzdG9yaW5nIGtleXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJmcm9tIGJhY2t1cC5cIixcbiAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiWW91ciBicm93c2VyIGxpa2VseSByZW1vdmVkIHRoaXMgZGF0YSB3aGVuIHJ1bm5pbmcgbG93IG9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzayBzcGFjZS5cIixcbiAgICAgICAgICAgICAgICAgICAgKX0ge2xvZ1JlcXVlc3R9PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KFwiU2lnbiBvdXRcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vblNpZ25PdXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
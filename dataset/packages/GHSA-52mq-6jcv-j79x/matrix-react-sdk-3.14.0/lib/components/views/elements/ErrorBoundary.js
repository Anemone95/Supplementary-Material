"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

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

/**
 * This error boundary component can be used to wrap large content areas and
 * catch exceptions during rendering in the component tree below them.
 */
class ErrorBoundary extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onClearCacheAndReload", () => {
      if (!_PlatformPeg.default.get()) return;

      _MatrixClientPeg.MatrixClientPeg.get().stopClient();

      _MatrixClientPeg.MatrixClientPeg.get().store.deleteAllData().then(() => {
        _PlatformPeg.default.get().reload();
      });
    });
    (0, _defineProperty2.default)(this, "_onBugReport", () => {
      const BugReportDialog = sdk.getComponent("dialogs.BugReportDialog");

      if (!BugReportDialog) {
        return;
      }

      _Modal.default.createTrackedDialog('Bug Report Dialog', '', BugReportDialog, {
        label: 'react-soft-crash'
      });
    });
    this.state = {
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    // Side effects are not permitted here, so we only update the state so
    // that the next render shows an error message.
    return {
      error
    };
  }

  componentDidCatch(error, {
    componentStack
  }) {
    // Browser consoles are better at formatting output when native errors are passed
    // in their own `console.error` invocation.
    console.error(error);
    console.error("The above error occured while React was rendering the following components:", componentStack);
  }

  render() {
    if (this.state.error) {
      const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
      const newIssueUrl = "https://github.com/vector-im/element-web/issues/new";
      let bugReportSection;

      if (_SdkConfig.default.get().bug_report_endpoint_url) {
        bugReportSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please <newIssueLink>create a new issue</newIssueLink> " + "on GitHub so that we can investigate this bug.", {}, {
          newIssueLink: sub => {
            return /*#__PURE__*/_react.default.createElement("a", {
              target: "_blank",
              rel: "noreferrer noopener",
              href: newIssueUrl
            }, sub);
          }
        })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you've submitted a bug via GitHub, debug logs can help " + "us track down the problem. Debug logs contain application " + "usage data including your username, the IDs or aliases of " + "the rooms or groups you have visited and the usernames of " + "other users. They do not contain messages.")), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          onClick: this._onBugReport,
          kind: "primary"
        }, (0, _languageHandler._t)("Submit debug logs")));
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ErrorBoundary"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ErrorBoundary_body"
      }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Something went wrong!")), bugReportSection, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        onClick: this._onClearCacheAndReload,
        kind: "danger"
      }, (0, _languageHandler._t)("Clear cache and reload"))));
    }

    return this.props.children;
  }

}

exports.default = ErrorBoundary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0Vycm9yQm91bmRhcnkuanMiXSwibmFtZXMiOlsiRXJyb3JCb3VuZGFyeSIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJQbGF0Zm9ybVBlZyIsImdldCIsIk1hdHJpeENsaWVudFBlZyIsInN0b3BDbGllbnQiLCJzdG9yZSIsImRlbGV0ZUFsbERhdGEiLCJ0aGVuIiwicmVsb2FkIiwiQnVnUmVwb3J0RGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwibGFiZWwiLCJzdGF0ZSIsImVycm9yIiwiZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yIiwiY29tcG9uZW50RGlkQ2F0Y2giLCJjb21wb25lbnRTdGFjayIsImNvbnNvbGUiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwibmV3SXNzdWVVcmwiLCJidWdSZXBvcnRTZWN0aW9uIiwiU2RrQ29uZmlnIiwiYnVnX3JlcG9ydF9lbmRwb2ludF91cmwiLCJuZXdJc3N1ZUxpbmsiLCJzdWIiLCJfb25CdWdSZXBvcnQiLCJfb25DbGVhckNhY2hlQW5kUmVsb2FkIiwiY2hpbGRyZW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLGFBQU4sU0FBNEJDLGVBQU1DLGFBQWxDLENBQWdEO0FBQzNEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSxrRUF3Qk0sTUFBTTtBQUMzQixVQUFJLENBQUNDLHFCQUFZQyxHQUFaLEVBQUwsRUFBd0I7O0FBRXhCQyx1Q0FBZ0JELEdBQWhCLEdBQXNCRSxVQUF0Qjs7QUFDQUQsdUNBQWdCRCxHQUFoQixHQUFzQkcsS0FBdEIsQ0FBNEJDLGFBQTVCLEdBQTRDQyxJQUE1QyxDQUFpRCxNQUFNO0FBQ25ETiw2QkFBWUMsR0FBWixHQUFrQk0sTUFBbEI7QUFDSCxPQUZEO0FBR0gsS0EvQmtCO0FBQUEsd0RBaUNKLE1BQU07QUFDakIsWUFBTUMsZUFBZSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIseUJBQWpCLENBQXhCOztBQUNBLFVBQUksQ0FBQ0YsZUFBTCxFQUFzQjtBQUNsQjtBQUNIOztBQUNERyxxQkFBTUMsbUJBQU4sQ0FBMEIsbUJBQTFCLEVBQStDLEVBQS9DLEVBQW1ESixlQUFuRCxFQUFvRTtBQUNoRUssUUFBQUEsS0FBSyxFQUFFO0FBRHlELE9BQXBFO0FBR0gsS0F6Q2tCO0FBR2YsU0FBS0MsS0FBTCxHQUFhO0FBQ1RDLE1BQUFBLEtBQUssRUFBRTtBQURFLEtBQWI7QUFHSDs7QUFFRCxTQUFPQyx3QkFBUCxDQUFnQ0QsS0FBaEMsRUFBdUM7QUFDbkM7QUFDQTtBQUNBLFdBQU87QUFBRUEsTUFBQUE7QUFBRixLQUFQO0FBQ0g7O0FBRURFLEVBQUFBLGlCQUFpQixDQUFDRixLQUFELEVBQVE7QUFBRUcsSUFBQUE7QUFBRixHQUFSLEVBQTRCO0FBQ3pDO0FBQ0E7QUFDQUMsSUFBQUEsT0FBTyxDQUFDSixLQUFSLENBQWNBLEtBQWQ7QUFDQUksSUFBQUEsT0FBTyxDQUFDSixLQUFSLENBQ0ksNkVBREosRUFFSUcsY0FGSjtBQUlIOztBQXFCREUsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSSxLQUFLTixLQUFMLENBQVdDLEtBQWYsRUFBc0I7QUFDbEIsWUFBTU0sZ0JBQWdCLEdBQUdaLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwyQkFBakIsQ0FBekI7QUFDQSxZQUFNWSxXQUFXLEdBQUcscURBQXBCO0FBRUEsVUFBSUMsZ0JBQUo7O0FBQ0EsVUFBSUMsbUJBQVV2QixHQUFWLEdBQWdCd0IsdUJBQXBCLEVBQTZDO0FBQ3pDRixRQUFBQSxnQkFBZ0IsZ0JBQUcsNkJBQUMsY0FBRCxDQUFPLFFBQVAscUJBQ2Ysd0NBQUkseUJBQ0EsNERBQ0EsZ0RBRkEsRUFFa0QsRUFGbEQsRUFFc0Q7QUFDbERHLFVBQUFBLFlBQVksRUFBR0MsR0FBRCxJQUFTO0FBQ25CLGdDQUFPO0FBQUcsY0FBQSxNQUFNLEVBQUMsUUFBVjtBQUFtQixjQUFBLEdBQUcsRUFBQyxxQkFBdkI7QUFBNkMsY0FBQSxJQUFJLEVBQUVMO0FBQW5ELGVBQWtFSyxHQUFsRSxDQUFQO0FBQ0g7QUFIaUQsU0FGdEQsQ0FBSixDQURlLGVBU2Ysd0NBQUkseUJBQ0EsK0RBQ0EsNERBREEsR0FFQSw0REFGQSxHQUdBLDREQUhBLEdBSUEsNENBTEEsQ0FBSixDQVRlLGVBZ0JmLDZCQUFDLGdCQUFEO0FBQWtCLFVBQUEsT0FBTyxFQUFFLEtBQUtDLFlBQWhDO0FBQThDLFVBQUEsSUFBSSxFQUFDO0FBQW5ELFdBQ0sseUJBQUcsbUJBQUgsQ0FETCxDQWhCZSxDQUFuQjtBQW9CSDs7QUFFRCwwQkFBTztBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0g7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLHlDQUFLLHlCQUFHLHVCQUFILENBQUwsQ0FESixFQUVNTCxnQkFGTixlQUdJLDZCQUFDLGdCQUFEO0FBQWtCLFFBQUEsT0FBTyxFQUFFLEtBQUtNLHNCQUFoQztBQUF3RCxRQUFBLElBQUksRUFBQztBQUE3RCxTQUNLLHlCQUFHLHdCQUFILENBREwsQ0FISixDQURHLENBQVA7QUFTSDs7QUFFRCxXQUFPLEtBQUs5QixLQUFMLENBQVcrQixRQUFsQjtBQUNIOztBQXJGMEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gJy4uLy4uLy4uL1BsYXRmb3JtUGVnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcblxuLyoqXG4gKiBUaGlzIGVycm9yIGJvdW5kYXJ5IGNvbXBvbmVudCBjYW4gYmUgdXNlZCB0byB3cmFwIGxhcmdlIGNvbnRlbnQgYXJlYXMgYW5kXG4gKiBjYXRjaCBleGNlcHRpb25zIGR1cmluZyByZW5kZXJpbmcgaW4gdGhlIGNvbXBvbmVudCB0cmVlIGJlbG93IHRoZW0uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgLy8gU2lkZSBlZmZlY3RzIGFyZSBub3QgcGVybWl0dGVkIGhlcmUsIHNvIHdlIG9ubHkgdXBkYXRlIHRoZSBzdGF0ZSBzb1xuICAgICAgICAvLyB0aGF0IHRoZSBuZXh0IHJlbmRlciBzaG93cyBhbiBlcnJvciBtZXNzYWdlLlxuICAgICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZENhdGNoKGVycm9yLCB7IGNvbXBvbmVudFN0YWNrIH0pIHtcbiAgICAgICAgLy8gQnJvd3NlciBjb25zb2xlcyBhcmUgYmV0dGVyIGF0IGZvcm1hdHRpbmcgb3V0cHV0IHdoZW4gbmF0aXZlIGVycm9ycyBhcmUgcGFzc2VkXG4gICAgICAgIC8vIGluIHRoZWlyIG93biBgY29uc29sZS5lcnJvcmAgaW52b2NhdGlvbi5cbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICBcIlRoZSBhYm92ZSBlcnJvciBvY2N1cmVkIHdoaWxlIFJlYWN0IHdhcyByZW5kZXJpbmcgdGhlIGZvbGxvd2luZyBjb21wb25lbnRzOlwiLFxuICAgICAgICAgICAgY29tcG9uZW50U3RhY2ssXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX29uQ2xlYXJDYWNoZUFuZFJlbG9hZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFQbGF0Zm9ybVBlZy5nZXQoKSkgcmV0dXJuO1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zdG9wQ2xpZW50KCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zdG9yZS5kZWxldGVBbGxEYXRhKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5yZWxvYWQoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkJ1Z1JlcG9ydCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgQnVnUmVwb3J0RGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuQnVnUmVwb3J0RGlhbG9nXCIpO1xuICAgICAgICBpZiAoIUJ1Z1JlcG9ydERpYWxvZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0J1ZyBSZXBvcnQgRGlhbG9nJywgJycsIEJ1Z1JlcG9ydERpYWxvZywge1xuICAgICAgICAgICAgbGFiZWw6ICdyZWFjdC1zb2Z0LWNyYXNoJyxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG4gICAgICAgICAgICBjb25zdCBuZXdJc3N1ZVVybCA9IFwiaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvbmV3XCI7XG5cbiAgICAgICAgICAgIGxldCBidWdSZXBvcnRTZWN0aW9uO1xuICAgICAgICAgICAgaWYgKFNka0NvbmZpZy5nZXQoKS5idWdfcmVwb3J0X2VuZHBvaW50X3VybCkge1xuICAgICAgICAgICAgICAgIGJ1Z1JlcG9ydFNlY3Rpb24gPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUGxlYXNlIDxuZXdJc3N1ZUxpbms+Y3JlYXRlIGEgbmV3IGlzc3VlPC9uZXdJc3N1ZUxpbms+IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwib24gR2l0SHViIHNvIHRoYXQgd2UgY2FuIGludmVzdGlnYXRlIHRoaXMgYnVnLlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0lzc3VlTGluazogKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGEgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIGhyZWY9e25ld0lzc3VlVXJsfT57IHN1YiB9PC9hPjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSWYgeW91J3ZlIHN1Ym1pdHRlZCBhIGJ1ZyB2aWEgR2l0SHViLCBkZWJ1ZyBsb2dzIGNhbiBoZWxwIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidXMgdHJhY2sgZG93biB0aGUgcHJvYmxlbS4gRGVidWcgbG9ncyBjb250YWluIGFwcGxpY2F0aW9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidXNhZ2UgZGF0YSBpbmNsdWRpbmcgeW91ciB1c2VybmFtZSwgdGhlIElEcyBvciBhbGlhc2VzIG9mIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlIHJvb21zIG9yIGdyb3VwcyB5b3UgaGF2ZSB2aXNpdGVkIGFuZCB0aGUgdXNlcm5hbWVzIG9mIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwib3RoZXIgdXNlcnMuIFRoZXkgZG8gbm90IGNvbnRhaW4gbWVzc2FnZXMuXCIsXG4gICAgICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkJ1Z1JlcG9ydH0ga2luZD0ncHJpbWFyeSc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJTdWJtaXQgZGVidWcgbG9nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9FcnJvckJvdW5kYXJ5XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FcnJvckJvdW5kYXJ5X2JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgPGgxPntfdChcIlNvbWV0aGluZyB3ZW50IHdyb25nIVwiKX08L2gxPlxuICAgICAgICAgICAgICAgICAgICB7IGJ1Z1JlcG9ydFNlY3Rpb24gfVxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkNsZWFyQ2FjaGVBbmRSZWxvYWR9IGtpbmQ9J2Rhbmdlcic+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJDbGVhciBjYWNoZSBhbmQgcmVsb2FkXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB9XG59XG4iXX0=
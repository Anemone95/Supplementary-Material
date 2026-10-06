"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let ErrorBoundary = (
/**
 * This error boundary component can be used to wrap large content areas and
 * catch exceptions during rendering in the component tree below them.
 */
_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.ErrorBoundary"), _dec(_class = (_temp = class ErrorBoundary extends _react.default.PureComponent {
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

}, _temp)) || _class);
exports.default = ErrorBoundary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0Vycm9yQm91bmRhcnkuanMiXSwibmFtZXMiOlsiRXJyb3JCb3VuZGFyeSIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJQbGF0Zm9ybVBlZyIsImdldCIsIk1hdHJpeENsaWVudFBlZyIsInN0b3BDbGllbnQiLCJzdG9yZSIsImRlbGV0ZUFsbERhdGEiLCJ0aGVuIiwicmVsb2FkIiwiQnVnUmVwb3J0RGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwibGFiZWwiLCJzdGF0ZSIsImVycm9yIiwiZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yIiwiY29tcG9uZW50RGlkQ2F0Y2giLCJjb21wb25lbnRTdGFjayIsImNvbnNvbGUiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwibmV3SXNzdWVVcmwiLCJidWdSZXBvcnRTZWN0aW9uIiwiU2RrQ29uZmlnIiwiYnVnX3JlcG9ydF9lbmRwb2ludF91cmwiLCJuZXdJc3N1ZUxpbmsiLCJzdWIiLCJfb25CdWdSZXBvcnQiLCJfb25DbGVhckNhY2hlQW5kUmVsb2FkIiwiY2hpbGRyZW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFPcUJBLGE7QUFMckI7QUFDQTtBQUNBO0FBQ0E7T0FDQyxnREFBcUIsOEJBQXJCLEMseUJBQUQsTUFDcUJBLGFBRHJCLFNBQzJDQyxlQUFNQyxhQURqRCxDQUMrRDtBQUMzREMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsa0VBd0JNLE1BQU07QUFDM0IsVUFBSSxDQUFDQyxxQkFBWUMsR0FBWixFQUFMLEVBQXdCOztBQUV4QkMsdUNBQWdCRCxHQUFoQixHQUFzQkUsVUFBdEI7O0FBQ0FELHVDQUFnQkQsR0FBaEIsR0FBc0JHLEtBQXRCLENBQTRCQyxhQUE1QixHQUE0Q0MsSUFBNUMsQ0FBaUQsTUFBTTtBQUNuRE4sNkJBQVlDLEdBQVosR0FBa0JNLE1BQWxCO0FBQ0gsT0FGRDtBQUdILEtBL0JrQjtBQUFBLHdEQWlDSixNQUFNO0FBQ2pCLFlBQU1DLGVBQWUsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHlCQUFqQixDQUF4Qjs7QUFDQSxVQUFJLENBQUNGLGVBQUwsRUFBc0I7QUFDbEI7QUFDSDs7QUFDREcscUJBQU1DLG1CQUFOLENBQTBCLG1CQUExQixFQUErQyxFQUEvQyxFQUFtREosZUFBbkQsRUFBb0U7QUFDaEVLLFFBQUFBLEtBQUssRUFBRTtBQUR5RCxPQUFwRTtBQUdILEtBekNrQjtBQUdmLFNBQUtDLEtBQUwsR0FBYTtBQUNUQyxNQUFBQSxLQUFLLEVBQUU7QUFERSxLQUFiO0FBR0g7O0FBRUQsU0FBT0Msd0JBQVAsQ0FBZ0NELEtBQWhDLEVBQXVDO0FBQ25DO0FBQ0E7QUFDQSxXQUFPO0FBQUVBLE1BQUFBO0FBQUYsS0FBUDtBQUNIOztBQUVERSxFQUFBQSxpQkFBaUIsQ0FBQ0YsS0FBRCxFQUFRO0FBQUVHLElBQUFBO0FBQUYsR0FBUixFQUE0QjtBQUN6QztBQUNBO0FBQ0FDLElBQUFBLE9BQU8sQ0FBQ0osS0FBUixDQUFjQSxLQUFkO0FBQ0FJLElBQUFBLE9BQU8sQ0FBQ0osS0FBUixDQUNJLDZFQURKLEVBRUlHLGNBRko7QUFJSDs7QUFxQkRFLEVBQUFBLE1BQU0sR0FBRztBQUNMLFFBQUksS0FBS04sS0FBTCxDQUFXQyxLQUFmLEVBQXNCO0FBQ2xCLFlBQU1NLGdCQUFnQixHQUFHWixHQUFHLENBQUNDLFlBQUosQ0FBaUIsMkJBQWpCLENBQXpCO0FBQ0EsWUFBTVksV0FBVyxHQUFHLHFEQUFwQjtBQUVBLFVBQUlDLGdCQUFKOztBQUNBLFVBQUlDLG1CQUFVdkIsR0FBVixHQUFnQndCLHVCQUFwQixFQUE2QztBQUN6Q0YsUUFBQUEsZ0JBQWdCLGdCQUFHLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLHFCQUNmLHdDQUFJLHlCQUNBLDREQUNBLGdEQUZBLEVBRWtELEVBRmxELEVBRXNEO0FBQ2xERyxVQUFBQSxZQUFZLEVBQUdDLEdBQUQsSUFBUztBQUNuQixnQ0FBTztBQUFHLGNBQUEsTUFBTSxFQUFDLFFBQVY7QUFBbUIsY0FBQSxHQUFHLEVBQUMscUJBQXZCO0FBQTZDLGNBQUEsSUFBSSxFQUFFTDtBQUFuRCxlQUFrRUssR0FBbEUsQ0FBUDtBQUNIO0FBSGlELFNBRnRELENBQUosQ0FEZSxlQVNmLHdDQUFJLHlCQUNBLCtEQUNBLDREQURBLEdBRUEsNERBRkEsR0FHQSw0REFIQSxHQUlBLDRDQUxBLENBQUosQ0FUZSxlQWdCZiw2QkFBQyxnQkFBRDtBQUFrQixVQUFBLE9BQU8sRUFBRSxLQUFLQyxZQUFoQztBQUE4QyxVQUFBLElBQUksRUFBQztBQUFuRCxXQUNLLHlCQUFHLG1CQUFILENBREwsQ0FoQmUsQ0FBbkI7QUFvQkg7O0FBRUQsMEJBQU87QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNIO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixzQkFDSSx5Q0FBSyx5QkFBRyx1QkFBSCxDQUFMLENBREosRUFFTUwsZ0JBRk4sZUFHSSw2QkFBQyxnQkFBRDtBQUFrQixRQUFBLE9BQU8sRUFBRSxLQUFLTSxzQkFBaEM7QUFBd0QsUUFBQSxJQUFJLEVBQUM7QUFBN0QsU0FDSyx5QkFBRyx3QkFBSCxDQURMLENBSEosQ0FERyxDQUFQO0FBU0g7O0FBRUQsV0FBTyxLQUFLOUIsS0FBTCxDQUFXK0IsUUFBbEI7QUFDSDs7QUFyRjBELEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gJy4uLy4uLy4uL1BsYXRmb3JtUGVnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG4vKipcbiAqIFRoaXMgZXJyb3IgYm91bmRhcnkgY29tcG9uZW50IGNhbiBiZSB1c2VkIHRvIHdyYXAgbGFyZ2UgY29udGVudCBhcmVhcyBhbmRcbiAqIGNhdGNoIGV4Y2VwdGlvbnMgZHVyaW5nIHJlbmRlcmluZyBpbiB0aGUgY29tcG9uZW50IHRyZWUgYmVsb3cgdGhlbS5cbiAqL1xuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZWxlbWVudHMuRXJyb3JCb3VuZGFyeVwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JCb3VuZGFyeSBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihlcnJvcikge1xuICAgICAgICAvLyBTaWRlIGVmZmVjdHMgYXJlIG5vdCBwZXJtaXR0ZWQgaGVyZSwgc28gd2Ugb25seSB1cGRhdGUgdGhlIHN0YXRlIHNvXG4gICAgICAgIC8vIHRoYXQgdGhlIG5leHQgcmVuZGVyIHNob3dzIGFuIGVycm9yIG1lc3NhZ2UuXG4gICAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3IsIHsgY29tcG9uZW50U3RhY2sgfSkge1xuICAgICAgICAvLyBCcm93c2VyIGNvbnNvbGVzIGFyZSBiZXR0ZXIgYXQgZm9ybWF0dGluZyBvdXRwdXQgd2hlbiBuYXRpdmUgZXJyb3JzIGFyZSBwYXNzZWRcbiAgICAgICAgLy8gaW4gdGhlaXIgb3duIGBjb25zb2xlLmVycm9yYCBpbnZvY2F0aW9uLlxuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIFwiVGhlIGFib3ZlIGVycm9yIG9jY3VyZWQgd2hpbGUgUmVhY3Qgd2FzIHJlbmRlcmluZyB0aGUgZm9sbG93aW5nIGNvbXBvbmVudHM6XCIsXG4gICAgICAgICAgICBjb21wb25lbnRTdGFjayxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfb25DbGVhckNhY2hlQW5kUmVsb2FkID0gKCkgPT4ge1xuICAgICAgICBpZiAoIVBsYXRmb3JtUGVnLmdldCgpKSByZXR1cm47XG5cbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnN0b3BDbGllbnQoKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnN0b3JlLmRlbGV0ZUFsbERhdGEoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLnJlbG9hZCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQnVnUmVwb3J0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBCdWdSZXBvcnREaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5CdWdSZXBvcnREaWFsb2dcIik7XG4gICAgICAgIGlmICghQnVnUmVwb3J0RGlhbG9nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQnVnIFJlcG9ydCBEaWFsb2cnLCAnJywgQnVnUmVwb3J0RGlhbG9nLCB7XG4gICAgICAgICAgICBsYWJlbDogJ3JlYWN0LXNvZnQtY3Jhc2gnLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0lzc3VlVXJsID0gXCJodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy9uZXdcIjtcblxuICAgICAgICAgICAgbGV0IGJ1Z1JlcG9ydFNlY3Rpb247XG4gICAgICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsKSB7XG4gICAgICAgICAgICAgICAgYnVnUmVwb3J0U2VjdGlvbiA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJQbGVhc2UgPG5ld0lzc3VlTGluaz5jcmVhdGUgYSBuZXcgaXNzdWU8L25ld0lzc3VlTGluaz4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJvbiBHaXRIdWIgc28gdGhhdCB3ZSBjYW4gaW52ZXN0aWdhdGUgdGhpcyBidWcuXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXNzdWVMaW5rOiAoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgaHJlZj17bmV3SXNzdWVVcmx9Pnsgc3ViIH08L2E+O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UndmUgc3VibWl0dGVkIGEgYnVnIHZpYSBHaXRIdWIsIGRlYnVnIGxvZ3MgY2FuIGhlbHAgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1cyB0cmFjayBkb3duIHRoZSBwcm9ibGVtLiBEZWJ1ZyBsb2dzIGNvbnRhaW4gYXBwbGljYXRpb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1c2FnZSBkYXRhIGluY2x1ZGluZyB5b3VyIHVzZXJuYW1lLCB0aGUgSURzIG9yIGFsaWFzZXMgb2YgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGUgcm9vbXMgb3IgZ3JvdXBzIHlvdSBoYXZlIHZpc2l0ZWQgYW5kIHRoZSB1c2VybmFtZXMgb2YgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJvdGhlciB1c2Vycy4gVGhleSBkbyBub3QgY29udGFpbiBtZXNzYWdlcy5cIixcbiAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uQnVnUmVwb3J0fSBraW5kPSdwcmltYXJ5Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlN1Ym1pdCBkZWJ1ZyBsb2dzXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0Vycm9yQm91bmRhcnlcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0Vycm9yQm91bmRhcnlfYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICA8aDE+e190KFwiU29tZXRoaW5nIHdlbnQgd3JvbmchXCIpfTwvaDE+XG4gICAgICAgICAgICAgICAgICAgIHsgYnVnUmVwb3J0U2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uQ2xlYXJDYWNoZUFuZFJlbG9hZH0ga2luZD0nZGFuZ2VyJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkNsZWFyIGNhY2hlIGFuZCByZWxvYWRcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIH1cbn1cbiJdfQ==
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let TileErrorBoundary = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.TileErrorBoundary"), _dec(_class = (_temp = class TileErrorBoundary extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onBugReport", () => {
      const BugReportDialog = sdk.getComponent("dialogs.BugReportDialog");

      if (!BugReportDialog) {
        return;
      }

      _Modal.default.createTrackedDialog('Bug Report Dialog', '', BugReportDialog, {
        label: 'react-soft-crash-tile'
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

  render() {
    if (this.state.error) {
      const {
        mxEvent
      } = this.props;
      const classes = {
        mx_EventTile: true,
        mx_EventTile_info: true,
        mx_EventTile_content: true,
        mx_EventTile_tileError: true
      };
      let submitLogsButton;

      if (_SdkConfig.default.get().bug_report_endpoint_url) {
        submitLogsButton = /*#__PURE__*/_react.default.createElement("a", {
          onClick: this._onBugReport,
          href: "#"
        }, (0, _languageHandler._t)("Submit logs"));
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: (0, _classnames.default)(classes)
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EventTile_line"
      }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Can't load this message"), mxEvent && ` (${mxEvent.getType()})`, submitLogsButton)));
    }

    return this.props.children;
  }

}, _temp)) || _class);
exports.default = TileErrorBoundary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1RpbGVFcnJvckJvdW5kYXJ5LmpzIl0sIm5hbWVzIjpbIlRpbGVFcnJvckJvdW5kYXJ5IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiQnVnUmVwb3J0RGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwibGFiZWwiLCJzdGF0ZSIsImVycm9yIiwiZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yIiwicmVuZGVyIiwibXhFdmVudCIsImNsYXNzZXMiLCJteF9FdmVudFRpbGUiLCJteF9FdmVudFRpbGVfaW5mbyIsIm14X0V2ZW50VGlsZV9jb250ZW50IiwibXhfRXZlbnRUaWxlX3RpbGVFcnJvciIsInN1Ym1pdExvZ3NCdXR0b24iLCJTZGtDb25maWciLCJnZXQiLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsIl9vbkJ1Z1JlcG9ydCIsImdldFR5cGUiLCJjaGlsZHJlbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsaUIsV0FEcEIsZ0RBQXFCLGtDQUFyQixDLHlCQUFELE1BQ3FCQSxpQkFEckIsU0FDK0NDLGVBQU1DLFNBRHJELENBQytEO0FBQzNEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSx3REFjSixNQUFNO0FBQ2pCLFlBQU1DLGVBQWUsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHlCQUFqQixDQUF4Qjs7QUFDQSxVQUFJLENBQUNGLGVBQUwsRUFBc0I7QUFDbEI7QUFDSDs7QUFDREcscUJBQU1DLG1CQUFOLENBQTBCLG1CQUExQixFQUErQyxFQUEvQyxFQUFtREosZUFBbkQsRUFBb0U7QUFDaEVLLFFBQUFBLEtBQUssRUFBRTtBQUR5RCxPQUFwRTtBQUdILEtBdEJrQjtBQUdmLFNBQUtDLEtBQUwsR0FBYTtBQUNUQyxNQUFBQSxLQUFLLEVBQUU7QUFERSxLQUFiO0FBR0g7O0FBRUQsU0FBT0Msd0JBQVAsQ0FBZ0NELEtBQWhDLEVBQXVDO0FBQ25DO0FBQ0E7QUFDQSxXQUFPO0FBQUVBLE1BQUFBO0FBQUYsS0FBUDtBQUNIOztBQVlERSxFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJLEtBQUtILEtBQUwsQ0FBV0MsS0FBZixFQUFzQjtBQUNsQixZQUFNO0FBQUVHLFFBQUFBO0FBQUYsVUFBYyxLQUFLWCxLQUF6QjtBQUNBLFlBQU1ZLE9BQU8sR0FBRztBQUNaQyxRQUFBQSxZQUFZLEVBQUUsSUFERjtBQUVaQyxRQUFBQSxpQkFBaUIsRUFBRSxJQUZQO0FBR1pDLFFBQUFBLG9CQUFvQixFQUFFLElBSFY7QUFJWkMsUUFBQUEsc0JBQXNCLEVBQUU7QUFKWixPQUFoQjtBQU9BLFVBQUlDLGdCQUFKOztBQUNBLFVBQUlDLG1CQUFVQyxHQUFWLEdBQWdCQyx1QkFBcEIsRUFBNkM7QUFDekNILFFBQUFBLGdCQUFnQixnQkFBRztBQUFHLFVBQUEsT0FBTyxFQUFFLEtBQUtJLFlBQWpCO0FBQStCLFVBQUEsSUFBSSxFQUFDO0FBQXBDLFdBQ2QseUJBQUcsYUFBSCxDQURjLENBQW5CO0FBR0g7O0FBRUQsMEJBQVE7QUFBSyxRQUFBLFNBQVMsRUFBRSx5QkFBV1QsT0FBWDtBQUFoQixzQkFDSjtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0ksMkNBQ0sseUJBQUcseUJBQUgsQ0FETCxFQUVNRCxPQUFPLElBQUssS0FBSUEsT0FBTyxDQUFDVyxPQUFSLEVBQWtCLEdBRnhDLEVBR01MLGdCQUhOLENBREosQ0FESSxDQUFSO0FBU0g7O0FBRUQsV0FBTyxLQUFLakIsS0FBTCxDQUFXdUIsUUFBbEI7QUFDSDs7QUF0RDBELEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLm1lc3NhZ2VzLlRpbGVFcnJvckJvdW5kYXJ5XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaWxlRXJyb3JCb3VuZGFyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgICAgIC8vIFNpZGUgZWZmZWN0cyBhcmUgbm90IHBlcm1pdHRlZCBoZXJlLCBzbyB3ZSBvbmx5IHVwZGF0ZSB0aGUgc3RhdGUgc29cbiAgICAgICAgLy8gdGhhdCB0aGUgbmV4dCByZW5kZXIgc2hvd3MgYW4gZXJyb3IgbWVzc2FnZS5cbiAgICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG5cbiAgICBfb25CdWdSZXBvcnQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IEJ1Z1JlcG9ydERpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkJ1Z1JlcG9ydERpYWxvZ1wiKTtcbiAgICAgICAgaWYgKCFCdWdSZXBvcnREaWFsb2cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdCdWcgUmVwb3J0IERpYWxvZycsICcnLCBCdWdSZXBvcnREaWFsb2csIHtcbiAgICAgICAgICAgIGxhYmVsOiAncmVhY3Qtc29mdC1jcmFzaC10aWxlJyxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgbXhFdmVudCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSB7XG4gICAgICAgICAgICAgICAgbXhfRXZlbnRUaWxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG14X0V2ZW50VGlsZV9pbmZvOiB0cnVlLFxuICAgICAgICAgICAgICAgIG14X0V2ZW50VGlsZV9jb250ZW50OiB0cnVlLFxuICAgICAgICAgICAgICAgIG14X0V2ZW50VGlsZV90aWxlRXJyb3I6IHRydWUsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsZXQgc3VibWl0TG9nc0J1dHRvbjtcbiAgICAgICAgICAgIGlmIChTZGtDb25maWcuZ2V0KCkuYnVnX3JlcG9ydF9lbmRwb2ludF91cmwpIHtcbiAgICAgICAgICAgICAgICBzdWJtaXRMb2dzQnV0dG9uID0gPGEgb25DbGljaz17dGhpcy5fb25CdWdSZXBvcnR9IGhyZWY9XCIjXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlN1Ym1pdCBsb2dzXCIpfVxuICAgICAgICAgICAgICAgIDwvYT47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAoPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoY2xhc3Nlcyl9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2xpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJDYW4ndCBsb2FkIHRoaXMgbWVzc2FnZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbXhFdmVudCAmJiBgICgke214RXZlbnQuZ2V0VHlwZSgpfSlgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3VibWl0TG9nc0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2Pik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB9XG59XG4iXX0=
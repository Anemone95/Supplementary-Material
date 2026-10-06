"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
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
class TileErrorBoundary extends _react.default.Component {
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

}

exports.default = TileErrorBoundary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1RpbGVFcnJvckJvdW5kYXJ5LmpzIl0sIm5hbWVzIjpbIlRpbGVFcnJvckJvdW5kYXJ5IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiQnVnUmVwb3J0RGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwibGFiZWwiLCJzdGF0ZSIsImVycm9yIiwiZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yIiwicmVuZGVyIiwibXhFdmVudCIsImNsYXNzZXMiLCJteF9FdmVudFRpbGUiLCJteF9FdmVudFRpbGVfaW5mbyIsIm14X0V2ZW50VGlsZV9jb250ZW50IiwibXhfRXZlbnRUaWxlX3RpbGVFcnJvciIsInN1Ym1pdExvZ3NCdXR0b24iLCJTZGtDb25maWciLCJnZXQiLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsIl9vbkJ1Z1JlcG9ydCIsImdldFR5cGUiLCJjaGlsZHJlbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU2UsTUFBTUEsaUJBQU4sU0FBZ0NDLGVBQU1DLFNBQXRDLENBQWdEO0FBQzNEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSx3REFjSixNQUFNO0FBQ2pCLFlBQU1DLGVBQWUsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHlCQUFqQixDQUF4Qjs7QUFDQSxVQUFJLENBQUNGLGVBQUwsRUFBc0I7QUFDbEI7QUFDSDs7QUFDREcscUJBQU1DLG1CQUFOLENBQTBCLG1CQUExQixFQUErQyxFQUEvQyxFQUFtREosZUFBbkQsRUFBb0U7QUFDaEVLLFFBQUFBLEtBQUssRUFBRTtBQUR5RCxPQUFwRTtBQUdILEtBdEJrQjtBQUdmLFNBQUtDLEtBQUwsR0FBYTtBQUNUQyxNQUFBQSxLQUFLLEVBQUU7QUFERSxLQUFiO0FBR0g7O0FBRUQsU0FBT0Msd0JBQVAsQ0FBZ0NELEtBQWhDLEVBQXVDO0FBQ25DO0FBQ0E7QUFDQSxXQUFPO0FBQUVBLE1BQUFBO0FBQUYsS0FBUDtBQUNIOztBQVlERSxFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJLEtBQUtILEtBQUwsQ0FBV0MsS0FBZixFQUFzQjtBQUNsQixZQUFNO0FBQUVHLFFBQUFBO0FBQUYsVUFBYyxLQUFLWCxLQUF6QjtBQUNBLFlBQU1ZLE9BQU8sR0FBRztBQUNaQyxRQUFBQSxZQUFZLEVBQUUsSUFERjtBQUVaQyxRQUFBQSxpQkFBaUIsRUFBRSxJQUZQO0FBR1pDLFFBQUFBLG9CQUFvQixFQUFFLElBSFY7QUFJWkMsUUFBQUEsc0JBQXNCLEVBQUU7QUFKWixPQUFoQjtBQU9BLFVBQUlDLGdCQUFKOztBQUNBLFVBQUlDLG1CQUFVQyxHQUFWLEdBQWdCQyx1QkFBcEIsRUFBNkM7QUFDekNILFFBQUFBLGdCQUFnQixnQkFBRztBQUFHLFVBQUEsT0FBTyxFQUFFLEtBQUtJLFlBQWpCO0FBQStCLFVBQUEsSUFBSSxFQUFDO0FBQXBDLFdBQ2QseUJBQUcsYUFBSCxDQURjLENBQW5CO0FBR0g7O0FBRUQsMEJBQVE7QUFBSyxRQUFBLFNBQVMsRUFBRSx5QkFBV1QsT0FBWDtBQUFoQixzQkFDSjtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0ksMkNBQ0sseUJBQUcseUJBQUgsQ0FETCxFQUVNRCxPQUFPLElBQUssS0FBSUEsT0FBTyxDQUFDVyxPQUFSLEVBQWtCLEdBRnhDLEVBR01MLGdCQUhOLENBREosQ0FESSxDQUFSO0FBU0g7O0FBRUQsV0FBTyxLQUFLakIsS0FBTCxDQUFXdUIsUUFBbEI7QUFDSDs7QUF0RDBEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGlsZUVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihlcnJvcikge1xuICAgICAgICAvLyBTaWRlIGVmZmVjdHMgYXJlIG5vdCBwZXJtaXR0ZWQgaGVyZSwgc28gd2Ugb25seSB1cGRhdGUgdGhlIHN0YXRlIHNvXG4gICAgICAgIC8vIHRoYXQgdGhlIG5leHQgcmVuZGVyIHNob3dzIGFuIGVycm9yIG1lc3NhZ2UuXG4gICAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgfVxuXG4gICAgX29uQnVnUmVwb3J0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBCdWdSZXBvcnREaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5CdWdSZXBvcnREaWFsb2dcIik7XG4gICAgICAgIGlmICghQnVnUmVwb3J0RGlhbG9nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQnVnIFJlcG9ydCBEaWFsb2cnLCAnJywgQnVnUmVwb3J0RGlhbG9nLCB7XG4gICAgICAgICAgICBsYWJlbDogJ3JlYWN0LXNvZnQtY3Jhc2gtdGlsZScsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCB7IG14RXZlbnQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgIG14X0V2ZW50VGlsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBteF9FdmVudFRpbGVfaW5mbzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBteF9FdmVudFRpbGVfY29udGVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBteF9FdmVudFRpbGVfdGlsZUVycm9yOiB0cnVlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGV0IHN1Ym1pdExvZ3NCdXR0b247XG4gICAgICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsKSB7XG4gICAgICAgICAgICAgICAgc3VibWl0TG9nc0J1dHRvbiA9IDxhIG9uQ2xpY2s9e3RoaXMuX29uQnVnUmVwb3J0fSBocmVmPVwiI1wiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJTdWJtaXQgbG9nc1wiKX1cbiAgICAgICAgICAgICAgICA8L2E+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzKGNsYXNzZXMpfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9saW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQ2FuJ3QgbG9hZCB0aGlzIG1lc3NhZ2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IG14RXZlbnQgJiYgYCAoJHtteEV2ZW50LmdldFR5cGUoKX0pYCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN1Ym1pdExvZ3NCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxufVxuIl19
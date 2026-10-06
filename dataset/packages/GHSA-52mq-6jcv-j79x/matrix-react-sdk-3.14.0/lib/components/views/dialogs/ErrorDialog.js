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

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2015, 2016 OpenMarket Ltd

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

/*
 * Usage:
 * Modal.createTrackedDialog('An Identifier', 'some detail', ErrorDialog, {
 *   title: "some text", (default: "Error")
 *   description: "some more text",
 *   button: "Button Text",
 *   onFinished: someFunction,
 *   focus: true|false (default: true)
 * });
 */
class ErrorDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onClick", () => {
      this.props.onFinished(true);
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_ErrorDialog",
      onFinished: this.props.onFinished,
      title: this.props.title || (0, _languageHandler._t)('Error'),
      headerImage: this.props.headerImage,
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content",
      id: "mx_Dialog_content"
    }, this.props.description || (0, _languageHandler._t)('An error has occurred.')), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "mx_Dialog_primary",
      onClick: this.onClick,
      autoFocus: this.props.focus
    }, this.props.button || (0, _languageHandler._t)('OK'))));
  }

}

exports.default = ErrorDialog;
(0, _defineProperty2.default)(ErrorDialog, "propTypes", {
  title: _propTypes.default.string,
  description: _propTypes.default.oneOfType([_propTypes.default.element, _propTypes.default.string]),
  button: _propTypes.default.string,
  focus: _propTypes.default.bool,
  onFinished: _propTypes.default.func.isRequired,
  headerImage: _propTypes.default.string
});
(0, _defineProperty2.default)(ErrorDialog, "defaultProps", {
  focus: true,
  title: null,
  description: null,
  button: null
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRXJyb3JEaWFsb2cuanMiXSwibmFtZXMiOlsiRXJyb3JEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsInByb3BzIiwib25GaW5pc2hlZCIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJ0aXRsZSIsImhlYWRlckltYWdlIiwiZGVzY3JpcHRpb24iLCJvbkNsaWNrIiwiZm9jdXMiLCJidXR0b24iLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJvbmVPZlR5cGUiLCJlbGVtZW50IiwiYm9vbCIsImZ1bmMiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBMkJBOztBQUNBOztBQUNBOztBQUNBOztBQTlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPZSxNQUFNQSxXQUFOLFNBQTBCQyxlQUFNQyxTQUFoQyxDQUEwQztBQUFBO0FBQUE7QUFBQSxtREFvQjNDLE1BQU07QUFDWixXQUFLQyxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsSUFBdEI7QUFDSCxLQXRCb0Q7QUFBQTs7QUF3QnJEQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxVQUFVLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwwQkFBakIsQ0FBbkI7QUFDQSx3QkFDSSw2QkFBQyxVQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUMsZ0JBRGQ7QUFFSSxNQUFBLFVBQVUsRUFBRSxLQUFLTCxLQUFMLENBQVdDLFVBRjNCO0FBR0ksTUFBQSxLQUFLLEVBQUUsS0FBS0QsS0FBTCxDQUFXTSxLQUFYLElBQW9CLHlCQUFHLE9BQUgsQ0FIL0I7QUFJSSxNQUFBLFdBQVcsRUFBRSxLQUFLTixLQUFMLENBQVdPLFdBSjVCO0FBS0ksTUFBQSxTQUFTLEVBQUM7QUFMZCxvQkFPSTtBQUFLLE1BQUEsU0FBUyxFQUFDLG1CQUFmO0FBQW1DLE1BQUEsRUFBRSxFQUFDO0FBQXRDLE9BQ00sS0FBS1AsS0FBTCxDQUFXUSxXQUFYLElBQTBCLHlCQUFHLHdCQUFILENBRGhDLENBUEosZUFVSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBUSxNQUFBLFNBQVMsRUFBQyxtQkFBbEI7QUFBc0MsTUFBQSxPQUFPLEVBQUUsS0FBS0MsT0FBcEQ7QUFBNkQsTUFBQSxTQUFTLEVBQUUsS0FBS1QsS0FBTCxDQUFXVTtBQUFuRixPQUNNLEtBQUtWLEtBQUwsQ0FBV1csTUFBWCxJQUFxQix5QkFBRyxJQUFILENBRDNCLENBREosQ0FWSixDQURKO0FBa0JIOztBQTVDb0Q7Ozs4QkFBcENkLFcsZUFDRTtBQUNmUyxFQUFBQSxLQUFLLEVBQUVNLG1CQUFVQyxNQURGO0FBRWZMLEVBQUFBLFdBQVcsRUFBRUksbUJBQVVFLFNBQVYsQ0FBb0IsQ0FDN0JGLG1CQUFVRyxPQURtQixFQUU3QkgsbUJBQVVDLE1BRm1CLENBQXBCLENBRkU7QUFNZkYsRUFBQUEsTUFBTSxFQUFFQyxtQkFBVUMsTUFOSDtBQU9mSCxFQUFBQSxLQUFLLEVBQUVFLG1CQUFVSSxJQVBGO0FBUWZmLEVBQUFBLFVBQVUsRUFBRVcsbUJBQVVLLElBQVYsQ0FBZUMsVUFSWjtBQVNmWCxFQUFBQSxXQUFXLEVBQUVLLG1CQUFVQztBQVRSLEM7OEJBREZoQixXLGtCQWFLO0FBQ2xCYSxFQUFBQSxLQUFLLEVBQUUsSUFEVztBQUVsQkosRUFBQUEsS0FBSyxFQUFFLElBRlc7QUFHbEJFLEVBQUFBLFdBQVcsRUFBRSxJQUhLO0FBSWxCRyxFQUFBQSxNQUFNLEVBQUU7QUFKVSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLypcbiAqIFVzYWdlOlxuICogTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQW4gSWRlbnRpZmllcicsICdzb21lIGRldGFpbCcsIEVycm9yRGlhbG9nLCB7XG4gKiAgIHRpdGxlOiBcInNvbWUgdGV4dFwiLCAoZGVmYXVsdDogXCJFcnJvclwiKVxuICogICBkZXNjcmlwdGlvbjogXCJzb21lIG1vcmUgdGV4dFwiLFxuICogICBidXR0b246IFwiQnV0dG9uIFRleHRcIixcbiAqICAgb25GaW5pc2hlZDogc29tZUZ1bmN0aW9uLFxuICogICBmb2N1czogdHJ1ZXxmYWxzZSAoZGVmYXVsdDogdHJ1ZSlcbiAqIH0pO1xuICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBkZXNjcmlwdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICAgICAgICBQcm9wVHlwZXMuZWxlbWVudCxcbiAgICAgICAgICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIF0pLFxuICAgICAgICBidXR0b246IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGZvY3VzOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgaGVhZGVySW1hZ2U6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGZvY3VzOiB0cnVlLFxuICAgICAgICB0aXRsZTogbnVsbCxcbiAgICAgICAgZGVzY3JpcHRpb246IG51bGwsXG4gICAgICAgIGJ1dHRvbjogbnVsbCxcbiAgICB9O1xuXG4gICAgb25DbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXJyb3JEaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy50aXRsZSB8fCBfdCgnRXJyb3InKX1cbiAgICAgICAgICAgICAgICBoZWFkZXJJbWFnZT17dGhpcy5wcm9wcy5oZWFkZXJJbWFnZX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIiBpZD0nbXhfRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuZGVzY3JpcHRpb24gfHwgX3QoJ0FuIGVycm9yIGhhcyBvY2N1cnJlZC4nKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5XCIgb25DbGljaz17dGhpcy5vbkNsaWNrfSBhdXRvRm9jdXM9e3RoaXMucHJvcHMuZm9jdXN9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmJ1dHRvbiB8fCBfdCgnT0snKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
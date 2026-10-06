"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuItem = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _AccessibleButton = _interopRequireDefault(require("../../components/views/elements/AccessibleButton"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../../components/views/elements/AccessibleTooltipButton"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
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
// Semantic component for representing a role=menuitem
const MenuItem
/*: React.FC<IProps>*/
= (_ref) => {
  let {
    children,
    label,
    tooltip
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["children", "label", "tooltip"]);
  const ariaLabel = props["aria-label"] || label;

  if (tooltip) {
    return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, (0, _extends2.default)({}, props, {
      role: "menuitem",
      tabIndex: -1,
      "aria-label": ariaLabel,
      title: tooltip
    }), children);
  }

  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({}, props, {
    role: "menuitem",
    tabIndex: -1,
    "aria-label": ariaLabel
  }), children);
};

exports.MenuItem = MenuItem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51SXRlbS50c3giXSwibmFtZXMiOlsiTWVudUl0ZW0iLCJjaGlsZHJlbiIsImxhYmVsIiwidG9vbHRpcCIsInByb3BzIiwiYXJpYUxhYmVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUVBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWUE7QUFDTyxNQUFNQTtBQUEwQjtBQUFBLEVBQUcsVUFBMEM7QUFBQSxNQUF6QztBQUFDQyxJQUFBQSxRQUFEO0FBQVdDLElBQUFBLEtBQVg7QUFBa0JDLElBQUFBO0FBQWxCLEdBQXlDO0FBQUEsTUFBWEMsS0FBVztBQUNoRixRQUFNQyxTQUFTLEdBQUdELEtBQUssQ0FBQyxZQUFELENBQUwsSUFBdUJGLEtBQXpDOztBQUVBLE1BQUlDLE9BQUosRUFBYTtBQUNULHdCQUFPLDZCQUFDLGdDQUFELDZCQUE2QkMsS0FBN0I7QUFBb0MsTUFBQSxJQUFJLEVBQUMsVUFBekM7QUFBb0QsTUFBQSxRQUFRLEVBQUUsQ0FBQyxDQUEvRDtBQUFrRSxvQkFBWUMsU0FBOUU7QUFBeUYsTUFBQSxLQUFLLEVBQUVGO0FBQWhHLFFBQ0RGLFFBREMsQ0FBUDtBQUdIOztBQUVELHNCQUNJLDZCQUFDLHlCQUFELDZCQUFzQkcsS0FBdEI7QUFBNkIsSUFBQSxJQUFJLEVBQUMsVUFBbEM7QUFBNkMsSUFBQSxRQUFRLEVBQUUsQ0FBQyxDQUF4RDtBQUEyRCxrQkFBWUM7QUFBdkUsTUFDTUosUUFETixDQURKO0FBS0gsQ0FkTSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBY2Nlc3NpYmxlQnV0dG9uPiB7XG4gICAgbGFiZWw/OiBzdHJpbmc7XG4gICAgdG9vbHRpcD86IHN0cmluZztcbn1cblxuLy8gU2VtYW50aWMgY29tcG9uZW50IGZvciByZXByZXNlbnRpbmcgYSByb2xlPW1lbnVpdGVtXG5leHBvcnQgY29uc3QgTWVudUl0ZW06IFJlYWN0LkZDPElQcm9wcz4gPSAoe2NoaWxkcmVuLCBsYWJlbCwgdG9vbHRpcCwgLi4ucHJvcHN9KSA9PiB7XG4gICAgY29uc3QgYXJpYUxhYmVsID0gcHJvcHNbXCJhcmlhLWxhYmVsXCJdIHx8IGxhYmVsO1xuXG4gICAgaWYgKHRvb2x0aXApIHtcbiAgICAgICAgcmV0dXJuIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiB7Li4ucHJvcHN9IHJvbGU9XCJtZW51aXRlbVwiIHRhYkluZGV4PXstMX0gYXJpYS1sYWJlbD17YXJpYUxhYmVsfSB0aXRsZT17dG9vbHRpcH0+XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj47XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gey4uLnByb3BzfSByb2xlPVwibWVudWl0ZW1cIiB0YWJJbmRleD17LTF9IGFyaWEtbGFiZWw9e2FyaWFMYWJlbH0+XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICk7XG59O1xuXG4iXX0=
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
    label
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["children", "label"]);
  const ariaLabel = props["aria-label"] || label;
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({}, props, {
    role: "menuitem",
    tabIndex: -1,
    "aria-label": ariaLabel
  }), children);
};

exports.MenuItem = MenuItem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51SXRlbS50c3giXSwibmFtZXMiOlsiTWVudUl0ZW0iLCJjaGlsZHJlbiIsImxhYmVsIiwicHJvcHMiLCJhcmlhTGFiZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBRUE7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVQTtBQUNPLE1BQU1BO0FBQTBCO0FBQUEsRUFBRyxVQUFpQztBQUFBLE1BQWhDO0FBQUNDLElBQUFBLFFBQUQ7QUFBV0MsSUFBQUE7QUFBWCxHQUFnQztBQUFBLE1BQVhDLEtBQVc7QUFDdkUsUUFBTUMsU0FBUyxHQUFHRCxLQUFLLENBQUMsWUFBRCxDQUFMLElBQXVCRCxLQUF6QztBQUNBLHNCQUNJLDZCQUFDLHlCQUFELDZCQUFzQkMsS0FBdEI7QUFBNkIsSUFBQSxJQUFJLEVBQUMsVUFBbEM7QUFBNkMsSUFBQSxRQUFRLEVBQUUsQ0FBQyxDQUF4RDtBQUEyRCxrQkFBWUM7QUFBdkUsTUFDTUgsUUFETixDQURKO0FBS0gsQ0FQTSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQWNjZXNzaWJsZUJ1dHRvbj4ge1xuICAgIGxhYmVsPzogc3RyaW5nO1xufVxuXG4vLyBTZW1hbnRpYyBjb21wb25lbnQgZm9yIHJlcHJlc2VudGluZyBhIHJvbGU9bWVudWl0ZW1cbmV4cG9ydCBjb25zdCBNZW51SXRlbTogUmVhY3QuRkM8SVByb3BzPiA9ICh7Y2hpbGRyZW4sIGxhYmVsLCAuLi5wcm9wc30pID0+IHtcbiAgICBjb25zdCBhcmlhTGFiZWwgPSBwcm9wc1tcImFyaWEtbGFiZWxcIl0gfHwgbGFiZWw7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gey4uLnByb3BzfSByb2xlPVwibWVudWl0ZW1cIiB0YWJJbmRleD17LTF9IGFyaWEtbGFiZWw9e2FyaWFMYWJlbH0+XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICk7XG59O1xuXG4iXX0=
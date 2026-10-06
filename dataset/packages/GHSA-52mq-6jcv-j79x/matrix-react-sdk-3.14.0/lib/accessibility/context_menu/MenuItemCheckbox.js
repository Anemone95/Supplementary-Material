"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuItemCheckbox = void 0;

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
// Semantic component for representing a role=menuitemcheckbox
const MenuItemCheckbox
/*: React.FC<IProps>*/
= (_ref) => {
  let {
    children,
    label,
    active,
    disabled
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["children", "label", "active", "disabled"]);
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({}, props, {
    role: "menuitemcheckbox",
    "aria-checked": active,
    "aria-disabled": disabled,
    disabled: disabled,
    tabIndex: -1,
    "aria-label": label
  }), children);
};

exports.MenuItemCheckbox = MenuItemCheckbox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51SXRlbUNoZWNrYm94LnRzeCJdLCJuYW1lcyI6WyJNZW51SXRlbUNoZWNrYm94IiwiY2hpbGRyZW4iLCJsYWJlbCIsImFjdGl2ZSIsImRpc2FibGVkIiwicHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBRUE7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFXQTtBQUNPLE1BQU1BO0FBQWtDO0FBQUEsRUFBRyxVQUFtRDtBQUFBLE1BQWxEO0FBQUNDLElBQUFBLFFBQUQ7QUFBV0MsSUFBQUEsS0FBWDtBQUFrQkMsSUFBQUEsTUFBbEI7QUFBMEJDLElBQUFBO0FBQTFCLEdBQWtEO0FBQUEsTUFBWEMsS0FBVztBQUNqRyxzQkFDSSw2QkFBQyx5QkFBRCw2QkFDUUEsS0FEUjtBQUVJLElBQUEsSUFBSSxFQUFDLGtCQUZUO0FBR0ksb0JBQWNGLE1BSGxCO0FBSUkscUJBQWVDLFFBSm5CO0FBS0ksSUFBQSxRQUFRLEVBQUVBLFFBTGQ7QUFNSSxJQUFBLFFBQVEsRUFBRSxDQUFDLENBTmY7QUFPSSxrQkFBWUY7QUFQaEIsTUFTTUQsUUFUTixDQURKO0FBYUgsQ0FkTSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQWNjZXNzaWJsZUJ1dHRvbj4ge1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIGFjdGl2ZTogYm9vbGVhbjtcbn1cblxuLy8gU2VtYW50aWMgY29tcG9uZW50IGZvciByZXByZXNlbnRpbmcgYSByb2xlPW1lbnVpdGVtY2hlY2tib3hcbmV4cG9ydCBjb25zdCBNZW51SXRlbUNoZWNrYm94OiBSZWFjdC5GQzxJUHJvcHM+ID0gKHtjaGlsZHJlbiwgbGFiZWwsIGFjdGl2ZSwgZGlzYWJsZWQsIC4uLnByb3BzfSkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAgICAgICByb2xlPVwibWVudWl0ZW1jaGVja2JveFwiXG4gICAgICAgICAgICBhcmlhLWNoZWNrZWQ9e2FjdGl2ZX1cbiAgICAgICAgICAgIGFyaWEtZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICAgID5cbiAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgKTtcbn07XG4iXX0=
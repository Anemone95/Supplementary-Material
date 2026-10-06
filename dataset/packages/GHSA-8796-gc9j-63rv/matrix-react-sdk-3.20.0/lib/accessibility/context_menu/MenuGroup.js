"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuGroup = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

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
// Semantic component for representing a role=group for grouping menu radios/checkboxes
const MenuGroup
/*: React.FC<IProps>*/
= (_ref) => {
  let {
    children,
    label
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["children", "label"]);
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, props, {
    role: "group",
    "aria-label": label
  }), children);
};

exports.MenuGroup = MenuGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51R3JvdXAudHN4Il0sIm5hbWVzIjpbIk1lbnVHcm91cCIsImNoaWxkcmVuIiwibGFiZWwiLCJwcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFBO0FBQ08sTUFBTUE7QUFBMkI7QUFBQSxFQUFHLFVBQWlDO0FBQUEsTUFBaEM7QUFBQ0MsSUFBQUEsUUFBRDtBQUFXQyxJQUFBQTtBQUFYLEdBQWdDO0FBQUEsTUFBWEMsS0FBVztBQUN4RSxzQkFBTywrREFBU0EsS0FBVDtBQUFnQixJQUFBLElBQUksRUFBQyxPQUFyQjtBQUE2QixrQkFBWUQ7QUFBekMsTUFDREQsUUFEQyxDQUFQO0FBR0gsQ0FKTSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgUmVhY3QuSFRNTEF0dHJpYnV0ZXM8SFRNTERpdkVsZW1lbnQ+IHtcbiAgICBsYWJlbDogc3RyaW5nO1xufVxuXG4vLyBTZW1hbnRpYyBjb21wb25lbnQgZm9yIHJlcHJlc2VudGluZyBhIHJvbGU9Z3JvdXAgZm9yIGdyb3VwaW5nIG1lbnUgcmFkaW9zL2NoZWNrYm94ZXNcbmV4cG9ydCBjb25zdCBNZW51R3JvdXA6IFJlYWN0LkZDPElQcm9wcz4gPSAoe2NoaWxkcmVuLCBsYWJlbCwgLi4ucHJvcHN9KSA9PiB7XG4gICAgcmV0dXJuIDxkaXYgey4uLnByb3BzfSByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPXtsYWJlbH0+XG4gICAgICAgIHsgY2hpbGRyZW4gfVxuICAgIDwvZGl2Pjtcbn07XG4iXX0=
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuItemRadio = void 0;

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
// Semantic component for representing a role=menuitemradio
const MenuItemRadio
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
    role: "menuitemradio",
    "aria-checked": active,
    "aria-disabled": disabled,
    disabled: disabled,
    tabIndex: -1,
    "aria-label": label
  }), children);
};

exports.MenuItemRadio = MenuItemRadio;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51SXRlbVJhZGlvLnRzeCJdLCJuYW1lcyI6WyJNZW51SXRlbVJhZGlvIiwiY2hpbGRyZW4iLCJsYWJlbCIsImFjdGl2ZSIsImRpc2FibGVkIiwicHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBRUE7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFXQTtBQUNPLE1BQU1BO0FBQStCO0FBQUEsRUFBRyxVQUFtRDtBQUFBLE1BQWxEO0FBQUNDLElBQUFBLFFBQUQ7QUFBV0MsSUFBQUEsS0FBWDtBQUFrQkMsSUFBQUEsTUFBbEI7QUFBMEJDLElBQUFBO0FBQTFCLEdBQWtEO0FBQUEsTUFBWEMsS0FBVztBQUM5RixzQkFDSSw2QkFBQyx5QkFBRCw2QkFDUUEsS0FEUjtBQUVJLElBQUEsSUFBSSxFQUFDLGVBRlQ7QUFHSSxvQkFBY0YsTUFIbEI7QUFJSSxxQkFBZUMsUUFKbkI7QUFLSSxJQUFBLFFBQVEsRUFBRUEsUUFMZDtBQU1JLElBQUEsUUFBUSxFQUFFLENBQUMsQ0FOZjtBQU9JLGtCQUFZRjtBQVBoQixNQVNNRCxRQVROLENBREo7QUFhSCxDQWRNIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBY2Nlc3NpYmxlQnV0dG9uPiB7XG4gICAgbGFiZWw/OiBzdHJpbmc7XG4gICAgYWN0aXZlOiBib29sZWFuO1xufVxuXG4vLyBTZW1hbnRpYyBjb21wb25lbnQgZm9yIHJlcHJlc2VudGluZyBhIHJvbGU9bWVudWl0ZW1yYWRpb1xuZXhwb3J0IGNvbnN0IE1lbnVJdGVtUmFkaW86IFJlYWN0LkZDPElQcm9wcz4gPSAoe2NoaWxkcmVuLCBsYWJlbCwgYWN0aXZlLCBkaXNhYmxlZCwgLi4ucHJvcHN9KSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICAgIHJvbGU9XCJtZW51aXRlbXJhZGlvXCJcbiAgICAgICAgICAgIGFyaWEtY2hlY2tlZD17YWN0aXZlfVxuICAgICAgICAgICAgYXJpYS1kaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgICAgICB0YWJJbmRleD17LTF9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtsYWJlbH1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICApO1xufTtcbiJdfQ==
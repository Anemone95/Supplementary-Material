"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

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
const ProgressBar
/*: React.FC<IProps>*/
= ({
  value,
  max
}) => {
  return /*#__PURE__*/_react.default.createElement("progress", {
    className: "mx_ProgressBar",
    max: max,
    value: value
  });
};

var _default = ProgressBar;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1Byb2dyZXNzQmFyLnRzeCJdLCJuYW1lcyI6WyJQcm9ncmVzc0JhciIsInZhbHVlIiwibWF4Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNBLE1BQU1BO0FBQTZCO0FBQUEsRUFBRyxDQUFDO0FBQUNDLEVBQUFBLEtBQUQ7QUFBUUMsRUFBQUE7QUFBUixDQUFELEtBQWtCO0FBQ3BELHNCQUFPO0FBQVUsSUFBQSxTQUFTLEVBQUMsZ0JBQXBCO0FBQXFDLElBQUEsR0FBRyxFQUFFQSxHQUExQztBQUErQyxJQUFBLEtBQUssRUFBRUQ7QUFBdEQsSUFBUDtBQUNILENBRkQ7O2VBSWVELFciLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHZhbHVlOiBudW1iZXI7XG4gICAgbWF4OiBudW1iZXI7XG59XG5cbmNvbnN0IFByb2dyZXNzQmFyOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHt2YWx1ZSwgbWF4fSkgPT4ge1xuICAgIHJldHVybiA8cHJvZ3Jlc3MgY2xhc3NOYW1lPVwibXhfUHJvZ3Jlc3NCYXJcIiBtYXg9e21heH0gdmFsdWU9e3ZhbHVlfSAvPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFByb2dyZXNzQmFyO1xuIl19
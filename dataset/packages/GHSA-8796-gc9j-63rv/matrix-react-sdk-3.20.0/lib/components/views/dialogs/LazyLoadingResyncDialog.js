"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

/*
Copyright 2018 New Vector Ltd
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
var _default = props => {
  const brand = _SdkConfig.default.get().brand;

  const description = (0, _languageHandler._t)("%(brand)s now uses 3-5x less memory, by only loading information " + "about other users when needed. Please wait whilst we resynchronise " + "with the server!", {
    brand
  });
  return /*#__PURE__*/_react.default.createElement(_QuestionDialog.default, {
    hasCancelButton: false,
    title: (0, _languageHandler._t)("Updating %(brand)s", {
      brand
    }),
    description: /*#__PURE__*/_react.default.createElement("div", null, description),
    button: (0, _languageHandler._t)("OK"),
    onFinished: props.onFinished
  });
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTGF6eUxvYWRpbmdSZXN5bmNEaWFsb2cuanMiXSwibmFtZXMiOlsicHJvcHMiLCJicmFuZCIsIlNka0NvbmZpZyIsImdldCIsImRlc2NyaXB0aW9uIiwib25GaW5pc2hlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtlQU9nQkEsS0FBRCxJQUFXO0FBQ3RCLFFBQU1DLEtBQUssR0FBR0MsbUJBQVVDLEdBQVYsR0FBZ0JGLEtBQTlCOztBQUNBLFFBQU1HLFdBQVcsR0FDYix5QkFDSSxzRUFDQSxxRUFEQSxHQUVBLGtCQUhKLEVBSUk7QUFBRUgsSUFBQUE7QUFBRixHQUpKLENBREo7QUFRQSxzQkFBUSw2QkFBQyx1QkFBRDtBQUNKLElBQUEsZUFBZSxFQUFFLEtBRGI7QUFFSixJQUFBLEtBQUssRUFBRSx5QkFBRyxvQkFBSCxFQUF5QjtBQUFFQSxNQUFBQTtBQUFGLEtBQXpCLENBRkg7QUFHSixJQUFBLFdBQVcsZUFBRSwwQ0FBTUcsV0FBTixDQUhUO0FBSUosSUFBQSxNQUFNLEVBQUUseUJBQUcsSUFBSCxDQUpKO0FBS0osSUFBQSxVQUFVLEVBQUVKLEtBQUssQ0FBQ0s7QUFMZCxJQUFSO0FBT0gsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gJy4vUXVlc3Rpb25EaWFsb2cnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuXG5leHBvcnQgZGVmYXVsdCAocHJvcHMpID0+IHtcbiAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9XG4gICAgICAgIF90KFxuICAgICAgICAgICAgXCIlKGJyYW5kKXMgbm93IHVzZXMgMy01eCBsZXNzIG1lbW9yeSwgYnkgb25seSBsb2FkaW5nIGluZm9ybWF0aW9uIFwiICtcbiAgICAgICAgICAgIFwiYWJvdXQgb3RoZXIgdXNlcnMgd2hlbiBuZWVkZWQuIFBsZWFzZSB3YWl0IHdoaWxzdCB3ZSByZXN5bmNocm9uaXNlIFwiICtcbiAgICAgICAgICAgIFwid2l0aCB0aGUgc2VydmVyIVwiLFxuICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICApO1xuXG4gICAgcmV0dXJuICg8UXVlc3Rpb25EaWFsb2dcbiAgICAgICAgaGFzQ2FuY2VsQnV0dG9uPXtmYWxzZX1cbiAgICAgICAgdGl0bGU9e190KFwiVXBkYXRpbmcgJShicmFuZClzXCIsIHsgYnJhbmQgfSl9XG4gICAgICAgIGRlc2NyaXB0aW9uPXs8ZGl2PntkZXNjcmlwdGlvbn08L2Rpdj59XG4gICAgICAgIGJ1dHRvbj17X3QoXCJPS1wiKX1cbiAgICAgICAgb25GaW5pc2hlZD17cHJvcHMub25GaW5pc2hlZH1cbiAgICAvPik7XG59O1xuIl19
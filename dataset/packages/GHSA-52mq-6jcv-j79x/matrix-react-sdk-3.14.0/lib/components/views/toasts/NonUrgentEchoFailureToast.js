"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ServerOfflineDialog = _interopRequireDefault(require("../dialogs/ServerOfflineDialog"));

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
class NonUrgentEchoFailureToast extends _react.default.PureComponent {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "openDialog", () => {
      _Modal.default.createTrackedDialog('Local Echo Server Error', '', _ServerOfflineDialog.default, {});
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_NonUrgentEchoFailureToast"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_NonUrgentEchoFailureToast_icon"
    }), (0, _languageHandler._t)("Your server isn't responding to some <a>requests</a>.", {}, {
      'a': sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: this.openDialog
      }, sub)
    }));
  }

}

exports.default = NonUrgentEchoFailureToast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3RvYXN0cy9Ob25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0LnRzeCJdLCJuYW1lcyI6WyJOb25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiU2VydmVyT2ZmbGluZURpYWxvZyIsInJlbmRlciIsInN1YiIsIm9wZW5EaWFsb2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRZSxNQUFNQSx5QkFBTixTQUF3Q0MsZUFBTUMsYUFBOUMsQ0FBNEQ7QUFBQTtBQUFBO0FBQUEsc0RBQ2xELE1BQU07QUFDdkJDLHFCQUFNQyxtQkFBTixDQUEwQix5QkFBMUIsRUFBcUQsRUFBckQsRUFBeURDLDRCQUF6RCxFQUE4RSxFQUE5RTtBQUNILEtBSHNFO0FBQUE7O0FBS2hFQyxFQUFBQSxNQUFQLEdBQWdCO0FBQ1osd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsTUFESixFQUVLLHlCQUFHLHVEQUFILEVBQTRELEVBQTVELEVBQWdFO0FBQzdELFdBQU1DLEdBQUQsaUJBQ0QsNkJBQUMseUJBQUQ7QUFBa0IsUUFBQSxJQUFJLEVBQUMsTUFBdkI7QUFBOEIsUUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFBNUMsU0FBeURELEdBQXpEO0FBRnlELEtBQWhFLENBRkwsQ0FESjtBQVVIOztBQWhCc0UiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG5odHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBTZXJ2ZXJPZmZsaW5lRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL1NlcnZlck9mZmxpbmVEaWFsb2dcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm9uVXJnZW50RWNob0ZhaWx1cmVUb2FzdCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHByaXZhdGUgb3BlbkRpYWxvZyA9ICgpID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnTG9jYWwgRWNobyBTZXJ2ZXIgRXJyb3InLCAnJywgU2VydmVyT2ZmbGluZURpYWxvZywge30pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ob25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTm9uVXJnZW50RWNob0ZhaWx1cmVUb2FzdF9pY29uXCIgLz5cbiAgICAgICAgICAgICAgICB7X3QoXCJZb3VyIHNlcnZlciBpc24ndCByZXNwb25kaW5nIHRvIHNvbWUgPGE+cmVxdWVzdHM8L2E+LlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rXCIgb25DbGljaz17dGhpcy5vcGVuRGlhbG9nfT57c3VifTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgfVxufVxuIl19
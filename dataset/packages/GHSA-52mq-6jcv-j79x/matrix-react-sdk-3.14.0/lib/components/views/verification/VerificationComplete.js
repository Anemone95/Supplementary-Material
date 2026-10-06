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
Copyright 2019 Vector Creations Ltd

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
class VerificationComplete extends _react.default.Component {
  render() {
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Verified!")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You've successfully verified this user.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Secure messages with this user are end-to-end encrypted and not able to be " + "read by third parties.")), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      onPrimaryButtonClick: this.props.onDone,
      primaryButton: (0, _languageHandler._t)("Got It"),
      hasCancel: false
    }));
  }

}

exports.default = VerificationComplete;
(0, _defineProperty2.default)(VerificationComplete, "propTypes", {
  onDone: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZlcmlmaWNhdGlvbi9WZXJpZmljYXRpb25Db21wbGV0ZS5qcyJdLCJuYW1lcyI6WyJWZXJpZmljYXRpb25Db21wbGV0ZSIsIlJlYWN0IiwiQ29tcG9uZW50IiwicmVuZGVyIiwiRGlhbG9nQnV0dG9ucyIsInNkayIsImdldENvbXBvbmVudCIsInByb3BzIiwib25Eb25lIiwiUHJvcFR5cGVzIiwiZnVuYyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU9lLE1BQU1BLG9CQUFOLFNBQW1DQyxlQUFNQyxTQUF6QyxDQUFtRDtBQUs5REMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsYUFBYSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsOEJBQWpCLENBQXRCO0FBQ0Esd0JBQU8sdURBQ0gseUNBQUsseUJBQUcsV0FBSCxDQUFMLENBREcsZUFFSCx3Q0FBSSx5QkFBRyx5Q0FBSCxDQUFKLENBRkcsZUFHSCx3Q0FBSSx5QkFDQSxnRkFDQSx3QkFGQSxDQUFKLENBSEcsZUFPSCw2QkFBQyxhQUFEO0FBQWUsTUFBQSxvQkFBb0IsRUFBRSxLQUFLQyxLQUFMLENBQVdDLE1BQWhEO0FBQ0ksTUFBQSxhQUFhLEVBQUUseUJBQUcsUUFBSCxDQURuQjtBQUVJLE1BQUEsU0FBUyxFQUFFO0FBRmYsTUFQRyxDQUFQO0FBWUg7O0FBbkI2RDs7OzhCQUE3Q1Isb0IsZUFDRTtBQUNmUSxFQUFBQSxNQUFNLEVBQUVDLG1CQUFVQyxJQUFWLENBQWVDO0FBRFIsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVyaWZpY2F0aW9uQ29tcGxldGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uRG9uZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPGgyPntfdChcIlZlcmlmaWVkIVwiKX08L2gyPlxuICAgICAgICAgICAgPHA+e190KFwiWW91J3ZlIHN1Y2Nlc3NmdWxseSB2ZXJpZmllZCB0aGlzIHVzZXIuXCIpfTwvcD5cbiAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICBcIlNlY3VyZSBtZXNzYWdlcyB3aXRoIHRoaXMgdXNlciBhcmUgZW5kLXRvLWVuZCBlbmNyeXB0ZWQgYW5kIG5vdCBhYmxlIHRvIGJlIFwiICtcbiAgICAgICAgICAgICAgICBcInJlYWQgYnkgdGhpcmQgcGFydGllcy5cIixcbiAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMucHJvcHMub25Eb25lfVxuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiR290IEl0XCIpfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuIl19
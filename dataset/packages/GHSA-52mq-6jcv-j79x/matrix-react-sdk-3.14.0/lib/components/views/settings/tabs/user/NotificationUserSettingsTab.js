"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../../../index"));

/*
Copyright 2019 New Vector Ltd

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
class NotificationUserSettingsTab extends _react.default.Component {
  constructor() {
    super();
  }

  render() {
    const Notifications = sdk.getComponent("views.settings.Notifications");
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_NotificationUserSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Notifications")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement(Notifications, null)));
  }

}

exports.default = NotificationUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9Ob3RpZmljYXRpb25Vc2VyU2V0dGluZ3NUYWIuanMiXSwibmFtZXMiOlsiTm90aWZpY2F0aW9uVXNlclNldHRpbmdzVGFiIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInJlbmRlciIsIk5vdGlmaWNhdGlvbnMiLCJzZGsiLCJnZXRDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQWxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNZSxNQUFNQSwyQkFBTixTQUEwQ0MsZUFBTUMsU0FBaEQsQ0FBMEQ7QUFDckVDLEVBQUFBLFdBQVcsR0FBRztBQUNWO0FBQ0g7O0FBRURDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLGFBQWEsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDhCQUFqQixDQUF0QjtBQUNBLHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FBeUMseUJBQUcsZUFBSCxDQUF6QyxDQURKLGVBRUk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLDZCQUFDLGFBQUQsT0FESixDQUZKLENBREo7QUFRSDs7QUFmb0UiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9pbmRleFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb3RpZmljYXRpb25Vc2VyU2V0dGluZ3NUYWIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgTm90aWZpY2F0aW9ucyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5Ob3RpZmljYXRpb25zXCIpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYiBteF9Ob3RpZmljYXRpb25Vc2VyU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJOb3RpZmljYXRpb25zXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICA8Tm90aWZpY2F0aW9ucyAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
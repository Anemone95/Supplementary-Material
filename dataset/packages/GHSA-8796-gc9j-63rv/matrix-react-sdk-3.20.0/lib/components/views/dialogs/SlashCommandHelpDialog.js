"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SlashCommands = require("../../../SlashCommands");

var sdk = _interopRequireWildcard(require("../../../index"));

/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
var _default = ({
  onFinished
}) => {
  const InfoDialog = sdk.getComponent('dialogs.InfoDialog');
  const categories = {};

  _SlashCommands.Commands.forEach(cmd => {
    if (!cmd.isEnabled()) return;

    if (!categories[cmd.category]) {
      categories[cmd.category] = [];
    }

    categories[cmd.category].push(cmd);
  });

  const body = Object.values(_SlashCommands.CommandCategories).filter(c => categories[c]).map(category => {
    const rows = [/*#__PURE__*/_react.default.createElement("tr", {
      key: "_category_" + category,
      className: "mx_SlashCommandHelpDialog_headerRow"
    }, /*#__PURE__*/_react.default.createElement("td", {
      colSpan: 3
    }, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)(category))))];
    categories[category].forEach(cmd => {
      rows.push( /*#__PURE__*/_react.default.createElement("tr", {
        key: cmd.command
      }, /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("strong", null, cmd.getCommand())), /*#__PURE__*/_react.default.createElement("td", null, cmd.args), /*#__PURE__*/_react.default.createElement("td", null, cmd.description)));
    });
    return rows;
  });
  return /*#__PURE__*/_react.default.createElement(InfoDialog, {
    className: "mx_SlashCommandHelpDialog",
    title: (0, _languageHandler._t)("Command Help"),
    description: /*#__PURE__*/_react.default.createElement("table", null, /*#__PURE__*/_react.default.createElement("tbody", null, body)),
    hasCloseButton: true,
    onFinished: onFinished
  });
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2xhc2hDb21tYW5kSGVscERpYWxvZy5qcyJdLCJuYW1lcyI6WyJvbkZpbmlzaGVkIiwiSW5mb0RpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsImNhdGVnb3JpZXMiLCJDb21tYW5kcyIsImZvckVhY2giLCJjbWQiLCJpc0VuYWJsZWQiLCJjYXRlZ29yeSIsInB1c2giLCJib2R5IiwiT2JqZWN0IiwidmFsdWVzIiwiQ29tbWFuZENhdGVnb3JpZXMiLCJmaWx0ZXIiLCJjIiwibWFwIiwicm93cyIsImNvbW1hbmQiLCJnZXRDb21tYW5kIiwiYXJncyIsImRlc2NyaXB0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO2VBT2UsQ0FBQztBQUFDQSxFQUFBQTtBQUFELENBQUQsS0FBa0I7QUFDN0IsUUFBTUMsVUFBVSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsb0JBQWpCLENBQW5CO0FBRUEsUUFBTUMsVUFBVSxHQUFHLEVBQW5COztBQUNBQywwQkFBU0MsT0FBVCxDQUFpQkMsR0FBRyxJQUFJO0FBQ3BCLFFBQUksQ0FBQ0EsR0FBRyxDQUFDQyxTQUFKLEVBQUwsRUFBc0I7O0FBQ3RCLFFBQUksQ0FBQ0osVUFBVSxDQUFDRyxHQUFHLENBQUNFLFFBQUwsQ0FBZixFQUErQjtBQUMzQkwsTUFBQUEsVUFBVSxDQUFDRyxHQUFHLENBQUNFLFFBQUwsQ0FBVixHQUEyQixFQUEzQjtBQUNIOztBQUNETCxJQUFBQSxVQUFVLENBQUNHLEdBQUcsQ0FBQ0UsUUFBTCxDQUFWLENBQXlCQyxJQUF6QixDQUE4QkgsR0FBOUI7QUFDSCxHQU5EOztBQVFBLFFBQU1JLElBQUksR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWNDLGdDQUFkLEVBQWlDQyxNQUFqQyxDQUF3Q0MsQ0FBQyxJQUFJWixVQUFVLENBQUNZLENBQUQsQ0FBdkQsRUFBNERDLEdBQTVELENBQWlFUixRQUFELElBQWM7QUFDdkYsVUFBTVMsSUFBSSxHQUFHLGNBQ1Q7QUFBSSxNQUFBLEdBQUcsRUFBRSxlQUFlVCxRQUF4QjtBQUFrQyxNQUFBLFNBQVMsRUFBQztBQUE1QyxvQkFDSTtBQUFJLE1BQUEsT0FBTyxFQUFFO0FBQWIsb0JBQ0kseUNBQUsseUJBQUdBLFFBQUgsQ0FBTCxDQURKLENBREosQ0FEUyxDQUFiO0FBUUFMLElBQUFBLFVBQVUsQ0FBQ0ssUUFBRCxDQUFWLENBQXFCSCxPQUFyQixDQUE2QkMsR0FBRyxJQUFJO0FBQ2hDVyxNQUFBQSxJQUFJLENBQUNSLElBQUwsZUFBVTtBQUFJLFFBQUEsR0FBRyxFQUFFSCxHQUFHLENBQUNZO0FBQWIsc0JBQ04sc0RBQUksNkNBQVNaLEdBQUcsQ0FBQ2EsVUFBSixFQUFULENBQUosQ0FETSxlQUVOLHlDQUFLYixHQUFHLENBQUNjLElBQVQsQ0FGTSxlQUdOLHlDQUFLZCxHQUFHLENBQUNlLFdBQVQsQ0FITSxDQUFWO0FBS0gsS0FORDtBQVFBLFdBQU9KLElBQVA7QUFDSCxHQWxCWSxDQUFiO0FBb0JBLHNCQUFPLDZCQUFDLFVBQUQ7QUFDSCxJQUFBLFNBQVMsRUFBQywyQkFEUDtBQUVILElBQUEsS0FBSyxFQUFFLHlCQUFHLGNBQUgsQ0FGSjtBQUdILElBQUEsV0FBVyxlQUFFLHlEQUNULDRDQUNLUCxJQURMLENBRFMsQ0FIVjtBQVFILElBQUEsY0FBYyxFQUFFLElBUmI7QUFTSCxJQUFBLFVBQVUsRUFBRVg7QUFUVCxJQUFQO0FBVUgsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHtDb21tYW5kQ2F0ZWdvcmllcywgQ29tbWFuZHN9IGZyb20gXCIuLi8uLi8uLi9TbGFzaENvbW1hbmRzXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0ICh7b25GaW5pc2hlZH0pID0+IHtcbiAgICBjb25zdCBJbmZvRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5JbmZvRGlhbG9nJyk7XG5cbiAgICBjb25zdCBjYXRlZ29yaWVzID0ge307XG4gICAgQ29tbWFuZHMuZm9yRWFjaChjbWQgPT4ge1xuICAgICAgICBpZiAoIWNtZC5pc0VuYWJsZWQoKSkgcmV0dXJuO1xuICAgICAgICBpZiAoIWNhdGVnb3JpZXNbY21kLmNhdGVnb3J5XSkge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tjbWQuY2F0ZWdvcnldID0gW107XG4gICAgICAgIH1cbiAgICAgICAgY2F0ZWdvcmllc1tjbWQuY2F0ZWdvcnldLnB1c2goY21kKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGJvZHkgPSBPYmplY3QudmFsdWVzKENvbW1hbmRDYXRlZ29yaWVzKS5maWx0ZXIoYyA9PiBjYXRlZ29yaWVzW2NdKS5tYXAoKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBbXG4gICAgICAgICAgICA8dHIga2V5PXtcIl9jYXRlZ29yeV9cIiArIGNhdGVnb3J5fSBjbGFzc05hbWU9XCJteF9TbGFzaENvbW1hbmRIZWxwRGlhbG9nX2hlYWRlclJvd1wiPlxuICAgICAgICAgICAgICAgIDx0ZCBjb2xTcGFuPXszfT5cbiAgICAgICAgICAgICAgICAgICAgPGgyPntfdChjYXRlZ29yeSl9PC9oMj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj4sXG4gICAgICAgIF07XG5cbiAgICAgICAgY2F0ZWdvcmllc1tjYXRlZ29yeV0uZm9yRWFjaChjbWQgPT4ge1xuICAgICAgICAgICAgcm93cy5wdXNoKDx0ciBrZXk9e2NtZC5jb21tYW5kfT5cbiAgICAgICAgICAgICAgICA8dGQ+PHN0cm9uZz57Y21kLmdldENvbW1hbmQoKX08L3N0cm9uZz48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD57Y21kLmFyZ3N9PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+e2NtZC5kZXNjcmlwdGlvbn08L3RkPlxuICAgICAgICAgICAgPC90cj4pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcm93cztcbiAgICB9KTtcblxuICAgIHJldHVybiA8SW5mb0RpYWxvZ1xuICAgICAgICBjbGFzc05hbWU9XCJteF9TbGFzaENvbW1hbmRIZWxwRGlhbG9nXCJcbiAgICAgICAgdGl0bGU9e190KFwiQ29tbWFuZCBIZWxwXCIpfVxuICAgICAgICBkZXNjcmlwdGlvbj17PHRhYmxlPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgIHtib2R5fVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgPC90YWJsZT59XG4gICAgICAgIGhhc0Nsb3NlQnV0dG9uPXt0cnVlfVxuICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfSAvPjtcbn07XG4iXX0=
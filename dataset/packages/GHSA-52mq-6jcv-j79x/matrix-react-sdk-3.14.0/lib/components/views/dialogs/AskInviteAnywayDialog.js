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

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _SettingLevel = require("../../../settings/SettingLevel");

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
class AskInviteAnywayDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onInviteClicked", () => {
      this.props.onInviteAnyways();
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "_onInviteNeverWarnClicked", () => {
      _SettingsStore.default.setValue("promptBeforeInviteUnknownUsers", null, _SettingLevel.SettingLevel.ACCOUNT, false);

      this.props.onInviteAnyways();
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "_onGiveUpClicked", () => {
      this.props.onGiveUp();
      this.props.onFinished(false);
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const errorList = this.props.unknownProfileUsers.map(address => /*#__PURE__*/_react.default.createElement("li", {
      key: address.userId
    }, address.userId, ": ", address.errorText));
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_RetryInvitesDialog",
      onFinished: this._onGiveUpClicked,
      title: (0, _languageHandler._t)('The following users may not exist'),
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to find profiles for the Matrix IDs listed below - would you like to invite them anyway?")), /*#__PURE__*/_react.default.createElement("ul", null, errorList)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._onGiveUpClicked
    }, (0, _languageHandler._t)('Close')), /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._onInviteNeverWarnClicked
    }, (0, _languageHandler._t)('Invite anyway and never warn me again')), /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._onInviteClicked,
      autoFocus: true
    }, (0, _languageHandler._t)('Invite anyway'))));
  }

}

exports.default = AskInviteAnywayDialog;
(0, _defineProperty2.default)(AskInviteAnywayDialog, "propTypes", {
  unknownProfileUsers: _propTypes.default.array.isRequired,
  // [ {userId, errorText}... ]
  onInviteAnyways: _propTypes.default.func.isRequired,
  onGiveUp: _propTypes.default.func.isRequired,
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQXNrSW52aXRlQW55d2F5RGlhbG9nLmpzIl0sIm5hbWVzIjpbIkFza0ludml0ZUFueXdheURpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwicHJvcHMiLCJvbkludml0ZUFueXdheXMiLCJvbkZpbmlzaGVkIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiQUNDT1VOVCIsIm9uR2l2ZVVwIiwicmVuZGVyIiwiQmFzZURpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsImVycm9yTGlzdCIsInVua25vd25Qcm9maWxlVXNlcnMiLCJtYXAiLCJhZGRyZXNzIiwidXNlcklkIiwiZXJyb3JUZXh0IiwiX29uR2l2ZVVwQ2xpY2tlZCIsIl9vbkludml0ZU5ldmVyV2FybkNsaWNrZWQiLCJfb25JbnZpdGVDbGlja2VkIiwiUHJvcFR5cGVzIiwiYXJyYXkiLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU2UsTUFBTUEscUJBQU4sU0FBb0NDLGVBQU1DLFNBQTFDLENBQW9EO0FBQUE7QUFBQTtBQUFBLDREQVE1QyxNQUFNO0FBQ3JCLFdBQUtDLEtBQUwsQ0FBV0MsZUFBWDtBQUNBLFdBQUtELEtBQUwsQ0FBV0UsVUFBWCxDQUFzQixJQUF0QjtBQUNILEtBWDhEO0FBQUEscUVBYW5DLE1BQU07QUFDOUJDLDZCQUFjQyxRQUFkLENBQXVCLGdDQUF2QixFQUF5RCxJQUF6RCxFQUErREMsMkJBQWFDLE9BQTVFLEVBQXFGLEtBQXJGOztBQUNBLFdBQUtOLEtBQUwsQ0FBV0MsZUFBWDtBQUNBLFdBQUtELEtBQUwsQ0FBV0UsVUFBWCxDQUFzQixJQUF0QjtBQUNILEtBakI4RDtBQUFBLDREQW1CNUMsTUFBTTtBQUNyQixXQUFLRixLQUFMLENBQVdPLFFBQVg7QUFDQSxXQUFLUCxLQUFMLENBQVdFLFVBQVgsQ0FBc0IsS0FBdEI7QUFDSCxLQXRCOEQ7QUFBQTs7QUF3Qi9ETSxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxVQUFVLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwwQkFBakIsQ0FBbkI7QUFFQSxVQUFNQyxTQUFTLEdBQUcsS0FBS1osS0FBTCxDQUFXYSxtQkFBWCxDQUNiQyxHQURhLENBQ1RDLE9BQU8saUJBQUk7QUFBSSxNQUFBLEdBQUcsRUFBRUEsT0FBTyxDQUFDQztBQUFqQixPQUEwQkQsT0FBTyxDQUFDQyxNQUFsQyxRQUE0Q0QsT0FBTyxDQUFDRSxTQUFwRCxDQURGLENBQWxCO0FBR0Esd0JBQ0ksNkJBQUMsVUFBRDtBQUFZLE1BQUEsU0FBUyxFQUFDLHVCQUF0QjtBQUNJLE1BQUEsVUFBVSxFQUFFLEtBQUtDLGdCQURyQjtBQUVJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLG1DQUFILENBRlg7QUFHSSxNQUFBLFNBQVMsRUFBQztBQUhkLG9CQUtJO0FBQUssTUFBQSxFQUFFLEVBQUM7QUFBUixvQkFDSSx3Q0FBSSx5QkFBRyxpR0FBSCxDQUFKLENBREosZUFFSSx5Q0FDTU4sU0FETixDQUZKLENBTEosZUFZSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLTTtBQUF0QixPQUNNLHlCQUFHLE9BQUgsQ0FETixDQURKLGVBSUk7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLQztBQUF0QixPQUNNLHlCQUFHLHVDQUFILENBRE4sQ0FKSixlQU9JO0FBQVEsTUFBQSxPQUFPLEVBQUUsS0FBS0MsZ0JBQXRCO0FBQXdDLE1BQUEsU0FBUyxFQUFFO0FBQW5ELE9BQ00seUJBQUcsZUFBSCxDQUROLENBUEosQ0FaSixDQURKO0FBMEJIOztBQXhEOEQ7Ozs4QkFBOUN2QixxQixlQUNFO0FBQ2ZnQixFQUFBQSxtQkFBbUIsRUFBRVEsbUJBQVVDLEtBQVYsQ0FBZ0JDLFVBRHRCO0FBQ2tDO0FBQ2pEdEIsRUFBQUEsZUFBZSxFQUFFb0IsbUJBQVVHLElBQVYsQ0FBZUQsVUFGakI7QUFHZmhCLEVBQUFBLFFBQVEsRUFBRWMsbUJBQVVHLElBQVYsQ0FBZUQsVUFIVjtBQUlmckIsRUFBQUEsVUFBVSxFQUFFbUIsbUJBQVVHLElBQVYsQ0FBZUQ7QUFKWixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7U2V0dGluZ0xldmVsfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFza0ludml0ZUFueXdheURpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgdW5rbm93blByb2ZpbGVVc2VyczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsIC8vIFsge3VzZXJJZCwgZXJyb3JUZXh0fS4uLiBdXG4gICAgICAgIG9uSW52aXRlQW55d2F5czogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgb25HaXZlVXA6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIF9vbkludml0ZUNsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25JbnZpdGVBbnl3YXlzKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9O1xuXG4gICAgX29uSW52aXRlTmV2ZXJXYXJuQ2xpY2tlZCA9ICgpID0+IHtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInByb21wdEJlZm9yZUludml0ZVVua25vd25Vc2Vyc1wiLCBudWxsLCBTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgZmFsc2UpO1xuICAgICAgICB0aGlzLnByb3BzLm9uSW52aXRlQW55d2F5cygpO1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgfTtcblxuICAgIF9vbkdpdmVVcENsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25HaXZlVXAoKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG5cbiAgICAgICAgY29uc3QgZXJyb3JMaXN0ID0gdGhpcy5wcm9wcy51bmtub3duUHJvZmlsZVVzZXJzXG4gICAgICAgICAgICAubWFwKGFkZHJlc3MgPT4gPGxpIGtleT17YWRkcmVzcy51c2VySWR9PnthZGRyZXNzLnVzZXJJZH06IHthZGRyZXNzLmVycm9yVGV4dH08L2xpPik7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfUmV0cnlJbnZpdGVzRGlhbG9nJ1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMuX29uR2l2ZVVwQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoJ1RoZSBmb2xsb3dpbmcgdXNlcnMgbWF5IG5vdCBleGlzdCcpfVxuICAgICAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfRGlhbG9nX2NvbnRlbnQnXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD0nbXhfRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXCJVbmFibGUgdG8gZmluZCBwcm9maWxlcyBmb3IgdGhlIE1hdHJpeCBJRHMgbGlzdGVkIGJlbG93IC0gd291bGQgeW91IGxpa2UgdG8gaW52aXRlIHRoZW0gYW55d2F5P1wiKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZXJyb3JMaXN0IH1cbiAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkdpdmVVcENsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnQ2xvc2UnKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uSW52aXRlTmV2ZXJXYXJuQ2xpY2tlZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdJbnZpdGUgYW55d2F5IGFuZCBuZXZlciB3YXJuIG1lIGFnYWluJykgfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkludml0ZUNsaWNrZWR9IGF1dG9Gb2N1cz17dHJ1ZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdJbnZpdGUgYW55d2F5JykgfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
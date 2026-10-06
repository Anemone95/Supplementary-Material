"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

/*
Copyright 2017 New Vector Ltd

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
class GroupUserSettings extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      error: null,
      groups: null
    });
  }

  componentDidMount() {
    this.context.getJoinedGroups().then(result => {
      this.setState({
        groups: result.groups || [],
        error: null
      });
    }, err => {
      console.error(err);
      this.setState({
        groups: null,
        error: err
      });
    });
  }

  render() {
    let text = "";
    let groupPublicityToggles = null;
    const groups = this.state.groups;

    if (this.state.error) {
      text = (0, _languageHandler._t)('Something went wrong when trying to get your communities.');
    } else if (groups === null) {
      text = (0, _languageHandler._t)('Loading...');
    } else if (groups.length > 0) {
      const GroupPublicityToggle = sdk.getComponent('groups.GroupPublicityToggle');
      groupPublicityToggles = groups.map((groupId, index) => {
        return /*#__PURE__*/_react.default.createElement(GroupPublicityToggle, {
          key: index,
          groupId: groupId
        });
      });
      text = (0, _languageHandler._t)('Display your community flair in rooms configured to show it.');
    } else {
      text = (0, _languageHandler._t)("You're not currently a member of any communities.");
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_SettingsTab_subsectionText"
    }, text), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, groupPublicityToggles));
  }

}

exports.default = GroupUserSettings;
(0, _defineProperty2.default)(GroupUserSettings, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2dyb3Vwcy9Hcm91cFVzZXJTZXR0aW5ncy5qcyJdLCJuYW1lcyI6WyJHcm91cFVzZXJTZXR0aW5ncyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZXJyb3IiLCJncm91cHMiLCJjb21wb25lbnREaWRNb3VudCIsImNvbnRleHQiLCJnZXRKb2luZWRHcm91cHMiLCJ0aGVuIiwicmVzdWx0Iiwic2V0U3RhdGUiLCJlcnIiLCJjb25zb2xlIiwicmVuZGVyIiwidGV4dCIsImdyb3VwUHVibGljaXR5VG9nZ2xlcyIsInN0YXRlIiwibGVuZ3RoIiwiR3JvdXBQdWJsaWNpdHlUb2dnbGUiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJtYXAiLCJncm91cElkIiwiaW5kZXgiLCJNYXRyaXhDbGllbnRDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPZSxNQUFNQSxpQkFBTixTQUFnQ0MsZUFBTUMsU0FBdEMsQ0FBZ0Q7QUFBQTtBQUFBO0FBQUEsaURBR25EO0FBQ0pDLE1BQUFBLEtBQUssRUFBRSxJQURIO0FBRUpDLE1BQUFBLE1BQU0sRUFBRTtBQUZKLEtBSG1EO0FBQUE7O0FBUTNEQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNoQixTQUFLQyxPQUFMLENBQWFDLGVBQWIsR0FBK0JDLElBQS9CLENBQXFDQyxNQUFELElBQVk7QUFDNUMsV0FBS0MsUUFBTCxDQUFjO0FBQUNOLFFBQUFBLE1BQU0sRUFBRUssTUFBTSxDQUFDTCxNQUFQLElBQWlCLEVBQTFCO0FBQThCRCxRQUFBQSxLQUFLLEVBQUU7QUFBckMsT0FBZDtBQUNILEtBRkQsRUFFSVEsR0FBRCxJQUFTO0FBQ1JDLE1BQUFBLE9BQU8sQ0FBQ1QsS0FBUixDQUFjUSxHQUFkO0FBQ0EsV0FBS0QsUUFBTCxDQUFjO0FBQUNOLFFBQUFBLE1BQU0sRUFBRSxJQUFUO0FBQWVELFFBQUFBLEtBQUssRUFBRVE7QUFBdEIsT0FBZDtBQUNILEtBTEQ7QUFNSDs7QUFFREUsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSUMsSUFBSSxHQUFHLEVBQVg7QUFDQSxRQUFJQyxxQkFBcUIsR0FBRyxJQUE1QjtBQUNBLFVBQU1YLE1BQU0sR0FBRyxLQUFLWSxLQUFMLENBQVdaLE1BQTFCOztBQUVBLFFBQUksS0FBS1ksS0FBTCxDQUFXYixLQUFmLEVBQXNCO0FBQ2xCVyxNQUFBQSxJQUFJLEdBQUcseUJBQUcsMkRBQUgsQ0FBUDtBQUNILEtBRkQsTUFFTyxJQUFJVixNQUFNLEtBQUssSUFBZixFQUFxQjtBQUN4QlUsTUFBQUEsSUFBSSxHQUFHLHlCQUFHLFlBQUgsQ0FBUDtBQUNILEtBRk0sTUFFQSxJQUFJVixNQUFNLENBQUNhLE1BQVAsR0FBZ0IsQ0FBcEIsRUFBdUI7QUFDMUIsWUFBTUMsb0JBQW9CLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw2QkFBakIsQ0FBN0I7QUFDQUwsTUFBQUEscUJBQXFCLEdBQUdYLE1BQU0sQ0FBQ2lCLEdBQVAsQ0FBVyxDQUFDQyxPQUFELEVBQVVDLEtBQVYsS0FBb0I7QUFDbkQsNEJBQU8sNkJBQUMsb0JBQUQ7QUFBc0IsVUFBQSxHQUFHLEVBQUVBLEtBQTNCO0FBQWtDLFVBQUEsT0FBTyxFQUFFRDtBQUEzQyxVQUFQO0FBQ0gsT0FGdUIsQ0FBeEI7QUFHQVIsTUFBQUEsSUFBSSxHQUFHLHlCQUFHLDhEQUFILENBQVA7QUFDSCxLQU5NLE1BTUE7QUFDSEEsTUFBQUEsSUFBSSxHQUFHLHlCQUFHLG1EQUFILENBQVA7QUFDSDs7QUFFRCx3QkFDSSx1REFDSTtBQUFHLE1BQUEsU0FBUyxFQUFDO0FBQWIsT0FBK0NBLElBQS9DLENBREosZUFFSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTUMscUJBRE4sQ0FGSixDQURKO0FBUUg7O0FBNUMwRDs7OzhCQUExQ2YsaUIsaUJBQ0l3Qiw0QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JvdXBVc2VyU2V0dGluZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIGdyb3VwczogbnVsbCxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5nZXRKb2luZWRHcm91cHMoKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2dyb3VwczogcmVzdWx0Lmdyb3VwcyB8fCBbXSwgZXJyb3I6IG51bGx9KTtcbiAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z3JvdXBzOiBudWxsLCBlcnJvcjogZXJyfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHRleHQgPSBcIlwiO1xuICAgICAgICBsZXQgZ3JvdXBQdWJsaWNpdHlUb2dnbGVzID0gbnVsbDtcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gdGhpcy5zdGF0ZS5ncm91cHM7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIHRleHQgPSBfdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hlbiB0cnlpbmcgdG8gZ2V0IHlvdXIgY29tbXVuaXRpZXMuJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZ3JvdXBzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0ZXh0ID0gX3QoJ0xvYWRpbmcuLi4nKTtcbiAgICAgICAgfSBlbHNlIGlmIChncm91cHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgR3JvdXBQdWJsaWNpdHlUb2dnbGUgPSBzZGsuZ2V0Q29tcG9uZW50KCdncm91cHMuR3JvdXBQdWJsaWNpdHlUb2dnbGUnKTtcbiAgICAgICAgICAgIGdyb3VwUHVibGljaXR5VG9nZ2xlcyA9IGdyb3Vwcy5tYXAoKGdyb3VwSWQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxHcm91cFB1YmxpY2l0eVRvZ2dsZSBrZXk9e2luZGV4fSBncm91cElkPXtncm91cElkfSAvPjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGV4dCA9IF90KCdEaXNwbGF5IHlvdXIgY29tbXVuaXR5IGZsYWlyIGluIHJvb21zIGNvbmZpZ3VyZWQgdG8gc2hvdyBpdC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHQgPSBfdChcIllvdSdyZSBub3QgY3VycmVudGx5IGEgbWVtYmVyIG9mIGFueSBjb21tdW5pdGllcy5cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dFwiPnsgdGV4dCB9PC9wPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIHsgZ3JvdXBQdWJsaWNpdHlUb2dnbGVzIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LabsSettingToggle = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _LabelledToggleSwitch = _interopRequireDefault(require("../../../elements/LabelledToggleSwitch"));

var sdk = _interopRequireWildcard(require("../../../../../index"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

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
class LabsSettingToggle extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onChange", async checked => {
      await _SettingsStore.default.setValue(this.props.featureId, null, _SettingLevel.SettingLevel.DEVICE, checked);
      this.forceUpdate();
    });
  }

  render() {
    const label = _SettingsStore.default.getDisplayName(this.props.featureId);

    const value = _SettingsStore.default.getValue(this.props.featureId);

    const canChange = _SettingsStore.default.canSetValue(this.props.featureId, null, _SettingLevel.SettingLevel.DEVICE);

    return /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: value,
      label: label,
      onChange: this._onChange,
      disabled: !canChange
    });
  }

}

exports.LabsSettingToggle = LabsSettingToggle;
(0, _defineProperty2.default)(LabsSettingToggle, "propTypes", {
  featureId: _propTypes.default.string.isRequired
});

class LabsUserSettingsTab extends _react.default.Component {
  constructor() {
    super();
  }

  render() {
    const SettingsFlag = sdk.getComponent("views.elements.SettingsFlag");

    const flags = _SettingsStore.default.getFeatureSettingNames().map(f => /*#__PURE__*/_react.default.createElement(LabsSettingToggle, {
      featureId: f,
      key: f
    }));

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Labs")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)('Customise your experience with experimental labs features. ' + '<a>Learn more</a>.', {}, {
      'a': sub => {
        return /*#__PURE__*/_react.default.createElement("a", {
          href: "https://github.com/vector-im/element-web/blob/develop/docs/labs.md",
          rel: "noreferrer noopener",
          target: "_blank"
        }, sub);
      }
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, flags, /*#__PURE__*/_react.default.createElement(SettingsFlag, {
      name: "enableWidgetScreenshots",
      level: _SettingLevel.SettingLevel.ACCOUNT
    }), /*#__PURE__*/_react.default.createElement(SettingsFlag, {
      name: "showHiddenEventsInTimeline",
      level: _SettingLevel.SettingLevel.DEVICE
    }), /*#__PURE__*/_react.default.createElement(SettingsFlag, {
      name: "lowBandwidth",
      level: _SettingLevel.SettingLevel.DEVICE
    }), /*#__PURE__*/_react.default.createElement(SettingsFlag, {
      name: "advancedRoomListLogging",
      level: _SettingLevel.SettingLevel.DEVICE
    })));
  }

}

exports.default = LabsUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9MYWJzVXNlclNldHRpbmdzVGFiLmpzIl0sIm5hbWVzIjpbIkxhYnNTZXR0aW5nVG9nZ2xlIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjaGVja2VkIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwicHJvcHMiLCJmZWF0dXJlSWQiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJmb3JjZVVwZGF0ZSIsInJlbmRlciIsImxhYmVsIiwiZ2V0RGlzcGxheU5hbWUiLCJ2YWx1ZSIsImdldFZhbHVlIiwiY2FuQ2hhbmdlIiwiY2FuU2V0VmFsdWUiLCJfb25DaGFuZ2UiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiTGFic1VzZXJTZXR0aW5nc1RhYiIsImNvbnN0cnVjdG9yIiwiU2V0dGluZ3NGbGFnIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiZmxhZ3MiLCJnZXRGZWF0dXJlU2V0dGluZ05hbWVzIiwibWFwIiwiZiIsInN1YiIsIkFDQ09VTlQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVPLE1BQU1BLGlCQUFOLFNBQWdDQyxlQUFNQyxTQUF0QyxDQUFnRDtBQUFBO0FBQUE7QUFBQSxxREFLdkMsTUFBT0MsT0FBUCxJQUFtQjtBQUMzQixZQUFNQyx1QkFBY0MsUUFBZCxDQUF1QixLQUFLQyxLQUFMLENBQVdDLFNBQWxDLEVBQTZDLElBQTdDLEVBQW1EQywyQkFBYUMsTUFBaEUsRUFBd0VOLE9BQXhFLENBQU47QUFDQSxXQUFLTyxXQUFMO0FBQ0gsS0FSa0Q7QUFBQTs7QUFVbkRDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLEtBQUssR0FBR1IsdUJBQWNTLGNBQWQsQ0FBNkIsS0FBS1AsS0FBTCxDQUFXQyxTQUF4QyxDQUFkOztBQUNBLFVBQU1PLEtBQUssR0FBR1YsdUJBQWNXLFFBQWQsQ0FBdUIsS0FBS1QsS0FBTCxDQUFXQyxTQUFsQyxDQUFkOztBQUNBLFVBQU1TLFNBQVMsR0FBR1osdUJBQWNhLFdBQWQsQ0FBMEIsS0FBS1gsS0FBTCxDQUFXQyxTQUFyQyxFQUFnRCxJQUFoRCxFQUFzREMsMkJBQWFDLE1BQW5FLENBQWxCOztBQUNBLHdCQUFPLDZCQUFDLDZCQUFEO0FBQXNCLE1BQUEsS0FBSyxFQUFFSyxLQUE3QjtBQUFvQyxNQUFBLEtBQUssRUFBRUYsS0FBM0M7QUFBa0QsTUFBQSxRQUFRLEVBQUUsS0FBS00sU0FBakU7QUFBNEUsTUFBQSxRQUFRLEVBQUUsQ0FBQ0Y7QUFBdkYsTUFBUDtBQUNIOztBQWZrRDs7OzhCQUExQ2hCLGlCLGVBQ1U7QUFDZk8sRUFBQUEsU0FBUyxFQUFFWSxtQkFBVUMsTUFBVixDQUFpQkM7QUFEYixDOztBQWlCUixNQUFNQyxtQkFBTixTQUFrQ3JCLGVBQU1DLFNBQXhDLENBQWtEO0FBQzdEcUIsRUFBQUEsV0FBVyxHQUFHO0FBQ1Y7QUFDSDs7QUFFRFosRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTWEsWUFBWSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsNkJBQWpCLENBQXJCOztBQUNBLFVBQU1DLEtBQUssR0FBR3ZCLHVCQUFjd0Isc0JBQWQsR0FBdUNDLEdBQXZDLENBQTJDQyxDQUFDLGlCQUFJLDZCQUFDLGlCQUFEO0FBQW1CLE1BQUEsU0FBUyxFQUFFQSxDQUE5QjtBQUFpQyxNQUFBLEdBQUcsRUFBRUE7QUFBdEMsTUFBaEQsQ0FBZDs7QUFDQSx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQXlDLHlCQUFHLE1BQUgsQ0FBekMsQ0FESixlQUVJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUVRLHlCQUFHLGdFQUNDLG9CQURKLEVBQzBCLEVBRDFCLEVBQzhCO0FBQzFCLFdBQU1DLEdBQUQsSUFBUztBQUNWLDRCQUFPO0FBQUcsVUFBQSxJQUFJLEVBQUMsb0VBQVI7QUFDSCxVQUFBLEdBQUcsRUFBQyxxQkFERDtBQUN1QixVQUFBLE1BQU0sRUFBQztBQUQ5QixXQUN3Q0EsR0FEeEMsQ0FBUDtBQUVIO0FBSnlCLEtBRDlCLENBRlIsQ0FGSixlQWFJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLSixLQURMLGVBRUksNkJBQUMsWUFBRDtBQUFjLE1BQUEsSUFBSSxFQUFFLHlCQUFwQjtBQUErQyxNQUFBLEtBQUssRUFBRW5CLDJCQUFhd0I7QUFBbkUsTUFGSixlQUdJLDZCQUFDLFlBQUQ7QUFBYyxNQUFBLElBQUksRUFBRSw0QkFBcEI7QUFBa0QsTUFBQSxLQUFLLEVBQUV4QiwyQkFBYUM7QUFBdEUsTUFISixlQUlJLDZCQUFDLFlBQUQ7QUFBYyxNQUFBLElBQUksRUFBRSxjQUFwQjtBQUFvQyxNQUFBLEtBQUssRUFBRUQsMkJBQWFDO0FBQXhELE1BSkosZUFLSSw2QkFBQyxZQUFEO0FBQWMsTUFBQSxJQUFJLEVBQUUseUJBQXBCO0FBQStDLE1BQUEsS0FBSyxFQUFFRCwyQkFBYUM7QUFBbkUsTUFMSixDQWJKLENBREo7QUF1Qkg7O0FBL0I0RCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IExhYmVsbGVkVG9nZ2xlU3dpdGNoIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9MYWJlbGxlZFRvZ2dsZVN3aXRjaFwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IHtTZXR0aW5nTGV2ZWx9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcblxuZXhwb3J0IGNsYXNzIExhYnNTZXR0aW5nVG9nZ2xlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBmZWF0dXJlSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgX29uQ2hhbmdlID0gYXN5bmMgKGNoZWNrZWQpID0+IHtcbiAgICAgICAgYXdhaXQgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZSh0aGlzLnByb3BzLmZlYXR1cmVJZCwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgY2hlY2tlZCk7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBsYWJlbCA9IFNldHRpbmdzU3RvcmUuZ2V0RGlzcGxheU5hbWUodGhpcy5wcm9wcy5mZWF0dXJlSWQpO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUodGhpcy5wcm9wcy5mZWF0dXJlSWQpO1xuICAgICAgICBjb25zdCBjYW5DaGFuZ2UgPSBTZXR0aW5nc1N0b3JlLmNhblNldFZhbHVlKHRoaXMucHJvcHMuZmVhdHVyZUlkLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFKTtcbiAgICAgICAgcmV0dXJuIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaCB2YWx1ZT17dmFsdWV9IGxhYmVsPXtsYWJlbH0gb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfSBkaXNhYmxlZD17IWNhbkNoYW5nZX0gLz47XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYWJzVXNlclNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IFNldHRpbmdzRmxhZyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5TZXR0aW5nc0ZsYWdcIik7XG4gICAgICAgIGNvbnN0IGZsYWdzID0gU2V0dGluZ3NTdG9yZS5nZXRGZWF0dXJlU2V0dGluZ05hbWVzKCkubWFwKGYgPT4gPExhYnNTZXR0aW5nVG9nZ2xlIGZlYXR1cmVJZD17Zn0ga2V5PXtmfSAvPik7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiTGFic1wiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdCgnQ3VzdG9taXNlIHlvdXIgZXhwZXJpZW5jZSB3aXRoIGV4cGVyaW1lbnRhbCBsYWJzIGZlYXR1cmVzLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGE+TGVhcm4gbW9yZTwvYT4uJywge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2Jsb2IvZGV2ZWxvcC9kb2NzL2xhYnMubWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPSdub3JlZmVycmVyIG5vb3BlbmVyJyB0YXJnZXQ9J19ibGFuayc+e3N1Yn08L2E+O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIHtmbGFnc31cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBuYW1lPXtcImVuYWJsZVdpZGdldFNjcmVlbnNob3RzXCJ9IGxldmVsPXtTZXR0aW5nTGV2ZWwuQUNDT1VOVH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBuYW1lPXtcInNob3dIaWRkZW5FdmVudHNJblRpbWVsaW5lXCJ9IGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfSAvPlxuICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnIG5hbWU9e1wibG93QmFuZHdpZHRoXCJ9IGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfSAvPlxuICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnIG5hbWU9e1wiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIn0gbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
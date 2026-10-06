"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class;

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
let LabsUserSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.user.LabsUserSettingsTab"), _dec(_class = class LabsUserSettingsTab extends _react.default.Component {
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

}) || _class);
exports.default = LabsUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9MYWJzVXNlclNldHRpbmdzVGFiLmpzIl0sIm5hbWVzIjpbIkxhYnNTZXR0aW5nVG9nZ2xlIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjaGVja2VkIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwicHJvcHMiLCJmZWF0dXJlSWQiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJmb3JjZVVwZGF0ZSIsInJlbmRlciIsImxhYmVsIiwiZ2V0RGlzcGxheU5hbWUiLCJ2YWx1ZSIsImdldFZhbHVlIiwiY2FuQ2hhbmdlIiwiY2FuU2V0VmFsdWUiLCJfb25DaGFuZ2UiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiTGFic1VzZXJTZXR0aW5nc1RhYiIsImNvbnN0cnVjdG9yIiwiU2V0dGluZ3NGbGFnIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiZmxhZ3MiLCJnZXRGZWF0dXJlU2V0dGluZ05hbWVzIiwibWFwIiwiZiIsInN1YiIsIkFDQ09VTlQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFTyxNQUFNQSxpQkFBTixTQUFnQ0MsZUFBTUMsU0FBdEMsQ0FBZ0Q7QUFBQTtBQUFBO0FBQUEscURBS3ZDLE1BQU9DLE9BQVAsSUFBbUI7QUFDM0IsWUFBTUMsdUJBQWNDLFFBQWQsQ0FBdUIsS0FBS0MsS0FBTCxDQUFXQyxTQUFsQyxFQUE2QyxJQUE3QyxFQUFtREMsMkJBQWFDLE1BQWhFLEVBQXdFTixPQUF4RSxDQUFOO0FBQ0EsV0FBS08sV0FBTDtBQUNILEtBUmtEO0FBQUE7O0FBVW5EQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxLQUFLLEdBQUdSLHVCQUFjUyxjQUFkLENBQTZCLEtBQUtQLEtBQUwsQ0FBV0MsU0FBeEMsQ0FBZDs7QUFDQSxVQUFNTyxLQUFLLEdBQUdWLHVCQUFjVyxRQUFkLENBQXVCLEtBQUtULEtBQUwsQ0FBV0MsU0FBbEMsQ0FBZDs7QUFDQSxVQUFNUyxTQUFTLEdBQUdaLHVCQUFjYSxXQUFkLENBQTBCLEtBQUtYLEtBQUwsQ0FBV0MsU0FBckMsRUFBZ0QsSUFBaEQsRUFBc0RDLDJCQUFhQyxNQUFuRSxDQUFsQjs7QUFDQSx3QkFBTyw2QkFBQyw2QkFBRDtBQUFzQixNQUFBLEtBQUssRUFBRUssS0FBN0I7QUFBb0MsTUFBQSxLQUFLLEVBQUVGLEtBQTNDO0FBQWtELE1BQUEsUUFBUSxFQUFFLEtBQUtNLFNBQWpFO0FBQTRFLE1BQUEsUUFBUSxFQUFFLENBQUNGO0FBQXZGLE1BQVA7QUFDSDs7QUFma0Q7Ozs4QkFBMUNoQixpQixlQUNVO0FBQ2ZPLEVBQUFBLFNBQVMsRUFBRVksbUJBQVVDLE1BQVYsQ0FBaUJDO0FBRGIsQztJQWtCRkMsbUIsV0FEcEIsZ0RBQXFCLDhDQUFyQixDLGdCQUFELE1BQ3FCQSxtQkFEckIsU0FDaURyQixlQUFNQyxTQUR2RCxDQUNpRTtBQUM3RHFCLEVBQUFBLFdBQVcsR0FBRztBQUNWO0FBQ0g7O0FBRURaLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1hLFlBQVksR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDZCQUFqQixDQUFyQjs7QUFDQSxVQUFNQyxLQUFLLEdBQUd2Qix1QkFBY3dCLHNCQUFkLEdBQXVDQyxHQUF2QyxDQUEyQ0MsQ0FBQyxpQkFBSSw2QkFBQyxpQkFBRDtBQUFtQixNQUFBLFNBQVMsRUFBRUEsQ0FBOUI7QUFBaUMsTUFBQSxHQUFHLEVBQUVBO0FBQXRDLE1BQWhELENBQWQ7O0FBQ0Esd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUF5Qyx5QkFBRyxNQUFILENBQXpDLENBREosZUFFSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FFUSx5QkFBRyxnRUFDQyxvQkFESixFQUMwQixFQUQxQixFQUM4QjtBQUMxQixXQUFNQyxHQUFELElBQVM7QUFDViw0QkFBTztBQUFHLFVBQUEsSUFBSSxFQUFDLG9FQUFSO0FBQ0gsVUFBQSxHQUFHLEVBQUMscUJBREQ7QUFDdUIsVUFBQSxNQUFNLEVBQUM7QUFEOUIsV0FDd0NBLEdBRHhDLENBQVA7QUFFSDtBQUp5QixLQUQ5QixDQUZSLENBRkosZUFhSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDS0osS0FETCxlQUVJLDZCQUFDLFlBQUQ7QUFBYyxNQUFBLElBQUksRUFBRSx5QkFBcEI7QUFBK0MsTUFBQSxLQUFLLEVBQUVuQiwyQkFBYXdCO0FBQW5FLE1BRkosZUFHSSw2QkFBQyxZQUFEO0FBQWMsTUFBQSxJQUFJLEVBQUUsNEJBQXBCO0FBQWtELE1BQUEsS0FBSyxFQUFFeEIsMkJBQWFDO0FBQXRFLE1BSEosZUFJSSw2QkFBQyxZQUFEO0FBQWMsTUFBQSxJQUFJLEVBQUUsY0FBcEI7QUFBb0MsTUFBQSxLQUFLLEVBQUVELDJCQUFhQztBQUF4RCxNQUpKLGVBS0ksNkJBQUMsWUFBRDtBQUFjLE1BQUEsSUFBSSxFQUFFLHlCQUFwQjtBQUErQyxNQUFBLEtBQUssRUFBRUQsMkJBQWFDO0FBQW5FLE1BTEosQ0FiSixDQURKO0FBdUJIOztBQS9CNEQsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IExhYmVsbGVkVG9nZ2xlU3dpdGNoIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9MYWJlbGxlZFRvZ2dsZVN3aXRjaFwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IHtTZXR0aW5nTGV2ZWx9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5leHBvcnQgY2xhc3MgTGFic1NldHRpbmdUb2dnbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGZlYXR1cmVJZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBfb25DaGFuZ2UgPSBhc3luYyAoY2hlY2tlZCkgPT4ge1xuICAgICAgICBhd2FpdCBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKHRoaXMucHJvcHMuZmVhdHVyZUlkLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBjaGVja2VkKTtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gU2V0dGluZ3NTdG9yZS5nZXREaXNwbGF5TmFtZSh0aGlzLnByb3BzLmZlYXR1cmVJZCk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSh0aGlzLnByb3BzLmZlYXR1cmVJZCk7XG4gICAgICAgIGNvbnN0IGNhbkNoYW5nZSA9IFNldHRpbmdzU3RvcmUuY2FuU2V0VmFsdWUodGhpcy5wcm9wcy5mZWF0dXJlSWQsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UpO1xuICAgICAgICByZXR1cm4gPExhYmVsbGVkVG9nZ2xlU3dpdGNoIHZhbHVlPXt2YWx1ZX0gbGFiZWw9e2xhYmVsfSBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9IGRpc2FibGVkPXshY2FuQ2hhbmdlfSAvPjtcbiAgICB9XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnNldHRpbmdzLnRhYnMudXNlci5MYWJzVXNlclNldHRpbmdzVGFiXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYWJzVXNlclNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IFNldHRpbmdzRmxhZyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5TZXR0aW5nc0ZsYWdcIik7XG4gICAgICAgIGNvbnN0IGZsYWdzID0gU2V0dGluZ3NTdG9yZS5nZXRGZWF0dXJlU2V0dGluZ05hbWVzKCkubWFwKGYgPT4gPExhYnNTZXR0aW5nVG9nZ2xlIGZlYXR1cmVJZD17Zn0ga2V5PXtmfSAvPik7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiTGFic1wiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdCgnQ3VzdG9taXNlIHlvdXIgZXhwZXJpZW5jZSB3aXRoIGV4cGVyaW1lbnRhbCBsYWJzIGZlYXR1cmVzLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGE+TGVhcm4gbW9yZTwvYT4uJywge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2Jsb2IvZGV2ZWxvcC9kb2NzL2xhYnMubWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPSdub3JlZmVycmVyIG5vb3BlbmVyJyB0YXJnZXQ9J19ibGFuayc+e3N1Yn08L2E+O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIHtmbGFnc31cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBuYW1lPXtcImVuYWJsZVdpZGdldFNjcmVlbnNob3RzXCJ9IGxldmVsPXtTZXR0aW5nTGV2ZWwuQUNDT1VOVH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBuYW1lPXtcInNob3dIaWRkZW5FdmVudHNJblRpbWVsaW5lXCJ9IGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfSAvPlxuICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnIG5hbWU9e1wibG93QmFuZHdpZHRoXCJ9IGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfSAvPlxuICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnIG5hbWU9e1wiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIn0gbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
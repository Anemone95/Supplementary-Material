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

var Roles = _interopRequireWildcard(require("../../../Roles"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("./Field"));

var _Keyboard = require("../../../Keyboard");

/*
Copyright 2015, 2016 OpenMarket Ltd

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
class PowerSelector extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onSelectChange", event => {
      const isCustom = event.target.value === "SELECT_VALUE_CUSTOM";

      if (isCustom) {
        this.setState({
          custom: true
        });
      } else {
        this.props.onChange(event.target.value, this.props.powerLevelKey);
        this.setState({
          selectValue: event.target.value
        });
      }
    });
    (0, _defineProperty2.default)(this, "onCustomChange", event => {
      this.setState({
        customValue: event.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onCustomBlur", event => {
      event.preventDefault();
      event.stopPropagation();
      this.props.onChange(parseInt(this.state.customValue), this.props.powerLevelKey);
    });
    (0, _defineProperty2.default)(this, "onCustomKeyDown", event => {
      if (event.key === _Keyboard.Key.ENTER) {
        event.preventDefault();
        event.stopPropagation(); // Do not call the onChange handler directly here - it can cause an infinite loop.
        // Long story short, a user hits Enter to submit the value which onChange handles as
        // raising a dialog which causes a blur which causes a dialog which causes a blur and
        // so on. By not causing the onChange to be called here, we avoid the loop because we
        // handle the onBlur safely.

        event.target.blur();
      }
    });
    this.state = {
      levelRoleMap: {},
      // List of power levels to show in the drop-down
      options: [],
      customValue: this.props.value,
      selectValue: 0
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillMount() {
    this._initStateFromProps(this.props);
  } // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(newProps) {
    this._initStateFromProps(newProps);
  }

  _initStateFromProps(newProps) {
    // This needs to be done now because levelRoleMap has translated strings
    const levelRoleMap = Roles.levelRoleMap(newProps.usersDefault);
    const options = Object.keys(levelRoleMap).filter(level => {
      return level === undefined || level <= newProps.maxValue || level == newProps.value;
    });
    const isCustom = levelRoleMap[newProps.value] === undefined;
    this.setState({
      levelRoleMap,
      options,
      custom: isCustom,
      customLevel: newProps.value,
      selectValue: isCustom ? "SELECT_VALUE_CUSTOM" : newProps.value
    });
  }

  render() {
    let picker;
    const label = typeof this.props.label === "undefined" ? (0, _languageHandler._t)("Power level") : this.props.label;

    if (this.state.custom) {
      picker = /*#__PURE__*/_react.default.createElement(_Field.default, {
        type: "number",
        label: label,
        max: this.props.maxValue,
        onBlur: this.onCustomBlur,
        onKeyDown: this.onCustomKeyDown,
        onChange: this.onCustomChange,
        value: String(this.state.customValue),
        disabled: this.props.disabled
      });
    } else {
      // Each level must have a definition in this.state.levelRoleMap
      let options = this.state.options.map(level => {
        return {
          value: level,
          text: Roles.textualPowerLevel(level, this.props.usersDefault)
        };
      });
      options.push({
        value: "SELECT_VALUE_CUSTOM",
        text: (0, _languageHandler._t)("Custom level")
      });
      options = options.map(op => {
        return /*#__PURE__*/_react.default.createElement("option", {
          value: op.value,
          key: op.value
        }, op.text);
      });
      picker = /*#__PURE__*/_react.default.createElement(_Field.default, {
        element: "select",
        label: label,
        onChange: this.onSelectChange,
        value: String(this.state.selectValue),
        disabled: this.props.disabled
      }, options);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PowerSelector"
    }, picker);
  }

}

exports.default = PowerSelector;
(0, _defineProperty2.default)(PowerSelector, "propTypes", {
  value: _propTypes.default.number.isRequired,
  // The maximum value that can be set with the power selector
  maxValue: _propTypes.default.number.isRequired,
  // Default user power level for the room
  usersDefault: _propTypes.default.number.isRequired,
  // should the user be able to change the value? false by default.
  disabled: _propTypes.default.bool,
  onChange: _propTypes.default.func,
  // Optional key to pass as the second argument to `onChange`
  powerLevelKey: _propTypes.default.string,
  // The name to annotate the selector with
  label: _propTypes.default.string
});
(0, _defineProperty2.default)(PowerSelector, "defaultProps", {
  maxValue: Infinity,
  usersDefault: 0
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1Bvd2VyU2VsZWN0b3IuanMiXSwibmFtZXMiOlsiUG93ZXJTZWxlY3RvciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV2ZW50IiwiaXNDdXN0b20iLCJ0YXJnZXQiLCJ2YWx1ZSIsInNldFN0YXRlIiwiY3VzdG9tIiwib25DaGFuZ2UiLCJwb3dlckxldmVsS2V5Iiwic2VsZWN0VmFsdWUiLCJjdXN0b21WYWx1ZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwicGFyc2VJbnQiLCJzdGF0ZSIsImtleSIsIktleSIsIkVOVEVSIiwiYmx1ciIsImxldmVsUm9sZU1hcCIsIm9wdGlvbnMiLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50IiwiX2luaXRTdGF0ZUZyb21Qcm9wcyIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV3UHJvcHMiLCJSb2xlcyIsInVzZXJzRGVmYXVsdCIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJsZXZlbCIsInVuZGVmaW5lZCIsIm1heFZhbHVlIiwiY3VzdG9tTGV2ZWwiLCJyZW5kZXIiLCJwaWNrZXIiLCJsYWJlbCIsIm9uQ3VzdG9tQmx1ciIsIm9uQ3VzdG9tS2V5RG93biIsIm9uQ3VzdG9tQ2hhbmdlIiwiU3RyaW5nIiwiZGlzYWJsZWQiLCJtYXAiLCJ0ZXh0IiwidGV4dHVhbFBvd2VyTGV2ZWwiLCJwdXNoIiwib3AiLCJvblNlbGVjdENoYW5nZSIsIlByb3BUeXBlcyIsIm51bWJlciIsImlzUmVxdWlyZWQiLCJib29sIiwiZnVuYyIsInN0cmluZyIsIkluZmluaXR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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SyxNQWJWO0FBZWY7QUFDQWpCLEVBQUFBLEtBQUssRUFBRVksbUJBQVVLO0FBaEJGLEM7OEJBREZ6RCxhLGtCQW9CSztBQUNsQm9DLEVBQUFBLFFBQVEsRUFBRXNCLFFBRFE7QUFFbEI1QixFQUFBQSxZQUFZLEVBQUU7QUFGSSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBSb2xlcyBmcm9tICcuLi8uLi8uLi9Sb2xlcyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4vRmllbGRcIjtcbmltcG9ydCB7S2V5fSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG93ZXJTZWxlY3RvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgdmFsdWU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICAgICAgLy8gVGhlIG1heGltdW0gdmFsdWUgdGhhdCBjYW4gYmUgc2V0IHdpdGggdGhlIHBvd2VyIHNlbGVjdG9yXG4gICAgICAgIG1heFZhbHVlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG5cbiAgICAgICAgLy8gRGVmYXVsdCB1c2VyIHBvd2VyIGxldmVsIGZvciB0aGUgcm9vbVxuICAgICAgICB1c2Vyc0RlZmF1bHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcblxuICAgICAgICAvLyBzaG91bGQgdGhlIHVzZXIgYmUgYWJsZSB0byBjaGFuZ2UgdGhlIHZhbHVlPyBmYWxzZSBieSBkZWZhdWx0LlxuICAgICAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyBPcHRpb25hbCBrZXkgdG8gcGFzcyBhcyB0aGUgc2Vjb25kIGFyZ3VtZW50IHRvIGBvbkNoYW5nZWBcbiAgICAgICAgcG93ZXJMZXZlbEtleTogUHJvcFR5cGVzLnN0cmluZyxcblxuICAgICAgICAvLyBUaGUgbmFtZSB0byBhbm5vdGF0ZSB0aGUgc2VsZWN0b3Igd2l0aFxuICAgICAgICBsYWJlbDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB9XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBtYXhWYWx1ZTogSW5maW5pdHksXG4gICAgICAgIHVzZXJzRGVmYXVsdDogMCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBsZXZlbFJvbGVNYXA6IHt9LFxuICAgICAgICAgICAgLy8gTGlzdCBvZiBwb3dlciBsZXZlbHMgdG8gc2hvdyBpbiB0aGUgZHJvcC1kb3duXG4gICAgICAgICAgICBvcHRpb25zOiBbXSxcblxuICAgICAgICAgICAgY3VzdG9tVmFsdWU6IHRoaXMucHJvcHMudmFsdWUsXG4gICAgICAgICAgICBzZWxlY3RWYWx1ZTogMCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICB0aGlzLl9pbml0U3RhdGVGcm9tUHJvcHModGhpcy5wcm9wcyk7XG4gICAgfVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIHRoaXMuX2luaXRTdGF0ZUZyb21Qcm9wcyhuZXdQcm9wcyk7XG4gICAgfVxuXG4gICAgX2luaXRTdGF0ZUZyb21Qcm9wcyhuZXdQcm9wcykge1xuICAgICAgICAvLyBUaGlzIG5lZWRzIHRvIGJlIGRvbmUgbm93IGJlY2F1c2UgbGV2ZWxSb2xlTWFwIGhhcyB0cmFuc2xhdGVkIHN0cmluZ3NcbiAgICAgICAgY29uc3QgbGV2ZWxSb2xlTWFwID0gUm9sZXMubGV2ZWxSb2xlTWFwKG5ld1Byb3BzLnVzZXJzRGVmYXVsdCk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3Qua2V5cyhsZXZlbFJvbGVNYXApLmZpbHRlcihsZXZlbCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIGxldmVsID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgICAgICBsZXZlbCA8PSBuZXdQcm9wcy5tYXhWYWx1ZSB8fFxuICAgICAgICAgICAgICAgIGxldmVsID09IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBpc0N1c3RvbSA9IGxldmVsUm9sZU1hcFtuZXdQcm9wcy52YWx1ZV0gPT09IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxldmVsUm9sZU1hcCxcbiAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICBjdXN0b206IGlzQ3VzdG9tLFxuICAgICAgICAgICAgY3VzdG9tTGV2ZWw6IG5ld1Byb3BzLnZhbHVlLFxuICAgICAgICAgICAgc2VsZWN0VmFsdWU6IGlzQ3VzdG9tID8gXCJTRUxFQ1RfVkFMVUVfQ1VTVE9NXCIgOiBuZXdQcm9wcy52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25TZWxlY3RDaGFuZ2UgPSBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGlzQ3VzdG9tID0gZXZlbnQudGFyZ2V0LnZhbHVlID09PSBcIlNFTEVDVF9WQUxVRV9DVVNUT01cIjtcbiAgICAgICAgaWYgKGlzQ3VzdG9tKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjdXN0b206IHRydWV9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlLCB0aGlzLnByb3BzLnBvd2VyTGV2ZWxLZXkpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZX0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uQ3VzdG9tQ2hhbmdlID0gZXZlbnQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjdXN0b21WYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlfSk7XG4gICAgfTtcblxuICAgIG9uQ3VzdG9tQmx1ciA9IGV2ZW50ID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShwYXJzZUludCh0aGlzLnN0YXRlLmN1c3RvbVZhbHVlKSwgdGhpcy5wcm9wcy5wb3dlckxldmVsS2V5KTtcbiAgICB9O1xuXG4gICAgb25DdXN0b21LZXlEb3duID0gZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBLZXkuRU5URVIpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgLy8gRG8gbm90IGNhbGwgdGhlIG9uQ2hhbmdlIGhhbmRsZXIgZGlyZWN0bHkgaGVyZSAtIGl0IGNhbiBjYXVzZSBhbiBpbmZpbml0ZSBsb29wLlxuICAgICAgICAgICAgLy8gTG9uZyBzdG9yeSBzaG9ydCwgYSB1c2VyIGhpdHMgRW50ZXIgdG8gc3VibWl0IHRoZSB2YWx1ZSB3aGljaCBvbkNoYW5nZSBoYW5kbGVzIGFzXG4gICAgICAgICAgICAvLyByYWlzaW5nIGEgZGlhbG9nIHdoaWNoIGNhdXNlcyBhIGJsdXIgd2hpY2ggY2F1c2VzIGEgZGlhbG9nIHdoaWNoIGNhdXNlcyBhIGJsdXIgYW5kXG4gICAgICAgICAgICAvLyBzbyBvbi4gQnkgbm90IGNhdXNpbmcgdGhlIG9uQ2hhbmdlIHRvIGJlIGNhbGxlZCBoZXJlLCB3ZSBhdm9pZCB0aGUgbG9vcCBiZWNhdXNlIHdlXG4gICAgICAgICAgICAvLyBoYW5kbGUgdGhlIG9uQmx1ciBzYWZlbHkuXG4gICAgICAgICAgICBldmVudC50YXJnZXQuYmx1cigpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHBpY2tlcjtcbiAgICAgICAgY29uc3QgbGFiZWwgPSB0eXBlb2YgdGhpcy5wcm9wcy5sYWJlbCA9PT0gXCJ1bmRlZmluZWRcIiA/IF90KFwiUG93ZXIgbGV2ZWxcIikgOiB0aGlzLnByb3BzLmxhYmVsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXN0b20pIHtcbiAgICAgICAgICAgIHBpY2tlciA9IChcbiAgICAgICAgICAgICAgICA8RmllbGQgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtsYWJlbH0gbWF4PXt0aGlzLnByb3BzLm1heFZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25DdXN0b21CbHVyfSBvbktleURvd249e3RoaXMub25DdXN0b21LZXlEb3dufSBvbkNoYW5nZT17dGhpcy5vbkN1c3RvbUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e1N0cmluZyh0aGlzLnN0YXRlLmN1c3RvbVZhbHVlKX0gZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9IC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRWFjaCBsZXZlbCBtdXN0IGhhdmUgYSBkZWZpbml0aW9uIGluIHRoaXMuc3RhdGUubGV2ZWxSb2xlTWFwXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHRoaXMuc3RhdGUub3B0aW9ucy5tYXAoKGxldmVsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGxldmVsLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBSb2xlcy50ZXh0dWFsUG93ZXJMZXZlbChsZXZlbCwgdGhpcy5wcm9wcy51c2Vyc0RlZmF1bHQpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG9wdGlvbnMucHVzaCh7IHZhbHVlOiBcIlNFTEVDVF9WQUxVRV9DVVNUT01cIiwgdGV4dDogX3QoXCJDdXN0b20gbGV2ZWxcIikgfSk7XG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5tYXAoKG9wKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxvcHRpb24gdmFsdWU9e29wLnZhbHVlfSBrZXk9e29wLnZhbHVlfT57IG9wLnRleHQgfTwvb3B0aW9uPjtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBwaWNrZXIgPSAoXG4gICAgICAgICAgICAgICAgPEZpZWxkIGVsZW1lbnQ9XCJzZWxlY3RcIlxuICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17bGFiZWx9IG9uQ2hhbmdlPXt0aGlzLm9uU2VsZWN0Q2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17U3RyaW5nKHRoaXMuc3RhdGUuc2VsZWN0VmFsdWUpfSBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH0+XG4gICAgICAgICAgICAgICAgICAgIHtvcHRpb25zfVxuICAgICAgICAgICAgICAgIDwvRmllbGQ+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUG93ZXJTZWxlY3RvclwiPlxuICAgICAgICAgICAgICAgIHsgcGlja2VyIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
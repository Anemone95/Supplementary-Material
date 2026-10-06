"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

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
class StyledRadioButton extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  render() {
    const _this$props = this.props,
          {
      children,
      className,
      disabled,
      outlined
    } = _this$props,
          otherProps = (0, _objectWithoutProperties2.default)(_this$props, ["children", "className", "disabled", "outlined"]);

    const _className = (0, _classnames.default)('mx_RadioButton', className, {
      "mx_RadioButton_disabled": disabled,
      "mx_RadioButton_enabled": !disabled,
      "mx_RadioButton_checked": this.props.checked,
      "mx_RadioButton_outlined": outlined
    });

    return /*#__PURE__*/_react.default.createElement("label", {
      className: _className
    }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({
      type: "radio",
      disabled: disabled
    }, otherProps)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RadioButton_content"
    }, children), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RadioButton_spacer"
    }));
  }

}

exports.default = StyledRadioButton;
(0, _defineProperty2.default)(StyledRadioButton, "defaultProps", {
  className: ''
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1N0eWxlZFJhZGlvQnV0dG9uLnRzeCJdLCJuYW1lcyI6WyJTdHlsZWRSYWRpb0J1dHRvbiIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsInJlbmRlciIsInByb3BzIiwiY2hpbGRyZW4iLCJjbGFzc05hbWUiLCJkaXNhYmxlZCIsIm91dGxpbmVkIiwib3RoZXJQcm9wcyIsIl9jbGFzc05hbWUiLCJjaGVja2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVllLE1BQU1BLGlCQUFOLFNBQWdDQyxlQUFNQztBQUF0QztBQUFvRTtBQUt4RUMsRUFBQUEsTUFBUCxHQUFnQjtBQUNaLHdCQUFtRSxLQUFLQyxLQUF4RTtBQUFBLFVBQU07QUFBRUMsTUFBQUEsUUFBRjtBQUFZQyxNQUFBQSxTQUFaO0FBQXVCQyxNQUFBQSxRQUF2QjtBQUFpQ0MsTUFBQUE7QUFBakMsS0FBTjtBQUFBLFVBQW9EQyxVQUFwRDs7QUFDQSxVQUFNQyxVQUFVLEdBQUcseUJBQ2YsZ0JBRGUsRUFFZkosU0FGZSxFQUdmO0FBQ0ksaUNBQTJCQyxRQUQvQjtBQUVJLGdDQUEwQixDQUFDQSxRQUYvQjtBQUdJLGdDQUEwQixLQUFLSCxLQUFMLENBQVdPLE9BSHpDO0FBSUksaUNBQTJCSDtBQUovQixLQUhlLENBQW5COztBQVNBLHdCQUFPO0FBQU8sTUFBQSxTQUFTLEVBQUVFO0FBQWxCLG9CQUNIO0FBQU8sTUFBQSxJQUFJLEVBQUMsT0FBWjtBQUFvQixNQUFBLFFBQVEsRUFBRUg7QUFBOUIsT0FBNENFLFVBQTVDLEVBREcsZUFHSCx1REFBSyx5Q0FBTCxDQUhHLGVBSUg7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQXlDSixRQUF6QyxDQUpHLGVBS0g7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE1BTEcsQ0FBUDtBQU9IOztBQXZCOEU7Ozs4QkFBOURMLGlCLGtCQUNxQjtBQUNsQ00sRUFBQUEsU0FBUyxFQUFFO0FBRHVCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBSZWFjdC5JbnB1dEhUTUxBdHRyaWJ1dGVzPEhUTUxJbnB1dEVsZW1lbnQ+IHtcbiAgICBvdXRsaW5lZD86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdHlsZWRSYWRpb0J1dHRvbiBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgY2xhc3NOYW1lOiAnJyxcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgeyBjaGlsZHJlbiwgY2xhc3NOYW1lLCBkaXNhYmxlZCwgb3V0bGluZWQsIC4uLm90aGVyUHJvcHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IF9jbGFzc05hbWUgPSBjbGFzc25hbWVzKFxuICAgICAgICAgICAgJ214X1JhZGlvQnV0dG9uJyxcbiAgICAgICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIm14X1JhZGlvQnV0dG9uX2Rpc2FibGVkXCI6IGRpc2FibGVkLFxuICAgICAgICAgICAgICAgIFwibXhfUmFkaW9CdXR0b25fZW5hYmxlZFwiOiAhZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgXCJteF9SYWRpb0J1dHRvbl9jaGVja2VkXCI6IHRoaXMucHJvcHMuY2hlY2tlZCxcbiAgICAgICAgICAgICAgICBcIm14X1JhZGlvQnV0dG9uX291dGxpbmVkXCI6IG91dGxpbmVkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiA8bGFiZWwgY2xhc3NOYW1lPXtfY2xhc3NOYW1lfT5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSdyYWRpbycgZGlzYWJsZWQ9e2Rpc2FibGVkfSB7Li4ub3RoZXJQcm9wc30gLz5cbiAgICAgICAgICAgIHsvKiBVc2VkIHRvIHJlbmRlciB0aGUgcmFkaW8gYnV0dG9uIGNpcmNsZSAqL31cbiAgICAgICAgICAgIDxkaXY+PGRpdiAvPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9SYWRpb0J1dHRvbl9jb250ZW50XCI+e2NoaWxkcmVufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9SYWRpb0J1dHRvbl9zcGFjZXJcIiAvPlxuICAgICAgICA8L2xhYmVsPjtcbiAgICB9XG59XG4iXX0=
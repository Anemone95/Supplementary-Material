"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _ContextMenu = require("../../structures/ContextMenu");

var _DialPad = _interopRequireDefault(require("../voip/DialPad"));

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
class DialpadContextMenu extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onDigitPress", digit => {
      this.props.call.sendDtmfDigit(digit);
      this.setState({
        value: this.state.value + digit
      });
    });
    this.state = {
      value: ''
    };
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenu, this.props, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DialPadContextMenu_header"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_DialPadContextMenu_title"
    }, (0, _languageHandler._t)("Dial pad"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DialPadContextMenu_dialled"
    }, this.state.value)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DialPadContextMenu_horizSep"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DialPadContextMenu_dialPad"
    }, /*#__PURE__*/_react.default.createElement(_DialPad.default, {
      onDigitPress: this.onDigitPress,
      hasDialAndDelete: false
    })));
  }

}

exports.default = DialpadContextMenu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2NvbnRleHRfbWVudXMvRGlhbHBhZENvbnRleHRNZW51LnRzeCJdLCJuYW1lcyI6WyJEaWFscGFkQ29udGV4dE1lbnUiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJkaWdpdCIsImNhbGwiLCJzZW5kRHRtZkRpZ2l0Iiwic2V0U3RhdGUiLCJ2YWx1ZSIsInN0YXRlIiwicmVuZGVyIiwib25EaWdpdFByZXNzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZ0JlLE1BQU1BLGtCQUFOLFNBQWlDQyxlQUFNQztBQUF2QztBQUFpRTtBQUM1RUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsd0RBUUhDLEtBQUQsSUFBVztBQUN0QixXQUFLRCxLQUFMLENBQVdFLElBQVgsQ0FBZ0JDLGFBQWhCLENBQThCRixLQUE5QjtBQUNBLFdBQUtHLFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxLQUFLLEVBQUUsS0FBS0MsS0FBTCxDQUFXRCxLQUFYLEdBQW1CSjtBQUEzQixPQUFkO0FBQ0gsS0FYa0I7QUFHZixTQUFLSyxLQUFMLEdBQWE7QUFDVEQsTUFBQUEsS0FBSyxFQUFFO0FBREUsS0FBYjtBQUdIOztBQU9ERSxFQUFBQSxNQUFNLEdBQUc7QUFDTCx3QkFBTyw2QkFBQyx3QkFBRCxFQUFpQixLQUFLUCxLQUF0QixlQUNIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSx1REFDSTtBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLE9BQStDLHlCQUFHLFVBQUgsQ0FBL0MsQ0FESixDQURKLGVBSUk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQWdELEtBQUtNLEtBQUwsQ0FBV0QsS0FBM0QsQ0FKSixDQURHLGVBT0g7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE1BUEcsZUFRSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMsZ0JBQUQ7QUFBUyxNQUFBLFlBQVksRUFBRSxLQUFLRyxZQUE1QjtBQUEwQyxNQUFBLGdCQUFnQixFQUFFO0FBQTVELE1BREosQ0FSRyxDQUFQO0FBWUg7O0FBM0IyRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBDb250ZXh0TWVudSwgSVByb3BzIGFzIElDb250ZXh0TWVudVByb3BzIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudSc7XG5pbXBvcnQgeyBNYXRyaXhDYWxsIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGwnO1xuaW1wb3J0IERpYWxwYWQgZnJvbSAnLi4vdm9pcC9EaWFsUGFkJztcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElDb250ZXh0TWVudVByb3BzIHtcbiAgICBjYWxsOiBNYXRyaXhDYWxsO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICB2YWx1ZTogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWFscGFkQ29udGV4dE1lbnUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uRGlnaXRQcmVzcyA9IChkaWdpdCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLmNhbGwuc2VuZER0bWZEaWdpdChkaWdpdCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlICsgZGlnaXR9KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8Q29udGV4dE1lbnUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkQ29udGV4dE1lbnVfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRGlhbFBhZENvbnRleHRNZW51X3RpdGxlXCI+e190KFwiRGlhbCBwYWRcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbFBhZENvbnRleHRNZW51X2RpYWxsZWRcIj57dGhpcy5zdGF0ZS52YWx1ZX08L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkQ29udGV4dE1lbnVfaG9yaXpTZXBcIiAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkQ29udGV4dE1lbnVfZGlhbFBhZFwiPlxuICAgICAgICAgICAgICAgIDxEaWFscGFkIG9uRGlnaXRQcmVzcz17dGhpcy5vbkRpZ2l0UHJlc3N9IGhhc0RpYWxBbmREZWxldGU9e2ZhbHNlfSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQ29udGV4dE1lbnU+O1xuICAgIH1cbn1cbiJdfQ==
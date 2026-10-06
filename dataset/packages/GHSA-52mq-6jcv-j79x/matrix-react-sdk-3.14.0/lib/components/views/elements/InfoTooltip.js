"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _Tooltip = _interopRequireDefault(require("./Tooltip"));

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019 The Matrix.org Foundation C.I.C.

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
class InfoTooltip extends _react.default.PureComponent
/*:: <ITooltipProps, IState>*/
{
  constructor(props
  /*: ITooltipProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "onMouseOver", () => {
      this.setState({
        hover: true
      });
    });
    (0, _defineProperty2.default)(this, "onMouseLeave", () => {
      this.setState({
        hover: false
      });
    });
    this.state = {
      hover: false
    };
  }

  render() {
    const {
      tooltip,
      children,
      tooltipClassName
    } = this.props;
    const title = (0, _languageHandler._t)("Information"); // Tooltip are forced on the right for a more natural feel to them on info icons

    const tip = this.state.hover ? /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
      className: "mx_InfoTooltip_container",
      tooltipClassName: (0, _classnames.default)("mx_InfoTooltip_tooltip", tooltipClassName),
      label: tooltip || title,
      forceOnRight: true
    }) : /*#__PURE__*/_react.default.createElement("div", null);
    return /*#__PURE__*/_react.default.createElement("div", {
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave,
      className: "mx_InfoTooltip"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InfoTooltip_icon",
      "aria-label": title
    }), children, tip);
  }

}

exports.default = InfoTooltip;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0luZm9Ub29sdGlwLnRzeCJdLCJuYW1lcyI6WyJJbmZvVG9vbHRpcCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzZXRTdGF0ZSIsImhvdmVyIiwic3RhdGUiLCJyZW5kZXIiLCJ0b29sdGlwIiwiY2hpbGRyZW4iLCJ0b29sdGlwQ2xhc3NOYW1lIiwidGl0bGUiLCJ0aXAiLCJvbk1vdXNlT3ZlciIsIm9uTW91c2VMZWF2ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaUJlLE1BQU1BLFdBQU4sU0FBMEJDLGVBQU1DO0FBQWhDO0FBQXFFO0FBQ2hGQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUF1QjtBQUM5QixVQUFNQSxLQUFOO0FBRDhCLHVEQU9wQixNQUFNO0FBQ2hCLFdBQUtDLFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxLQUFLLEVBQUU7QUFERyxPQUFkO0FBR0gsS0FYaUM7QUFBQSx3REFhbkIsTUFBTTtBQUNqQixXQUFLRCxRQUFMLENBQWM7QUFDVkMsUUFBQUEsS0FBSyxFQUFFO0FBREcsT0FBZDtBQUdILEtBakJpQztBQUU5QixTQUFLQyxLQUFMLEdBQWE7QUFDVEQsTUFBQUEsS0FBSyxFQUFFO0FBREUsS0FBYjtBQUdIOztBQWNERSxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNO0FBQUNDLE1BQUFBLE9BQUQ7QUFBVUMsTUFBQUEsUUFBVjtBQUFvQkMsTUFBQUE7QUFBcEIsUUFBd0MsS0FBS1AsS0FBbkQ7QUFDQSxVQUFNUSxLQUFLLEdBQUcseUJBQUcsYUFBSCxDQUFkLENBRkssQ0FJTDs7QUFDQSxVQUFNQyxHQUFHLEdBQUcsS0FBS04sS0FBTCxDQUFXRCxLQUFYLGdCQUFtQiw2QkFBQyxnQkFBRDtBQUMzQixNQUFBLFNBQVMsRUFBQywwQkFEaUI7QUFFM0IsTUFBQSxnQkFBZ0IsRUFBRSx5QkFBVyx3QkFBWCxFQUFxQ0ssZ0JBQXJDLENBRlM7QUFHM0IsTUFBQSxLQUFLLEVBQUVGLE9BQU8sSUFBSUcsS0FIUztBQUkzQixNQUFBLFlBQVksRUFBRTtBQUphLE1BQW5CLGdCQUtQLHlDQUxMO0FBTUEsd0JBQ0k7QUFBSyxNQUFBLFdBQVcsRUFBRSxLQUFLRSxXQUF2QjtBQUFvQyxNQUFBLFlBQVksRUFBRSxLQUFLQyxZQUF2RDtBQUFxRSxNQUFBLFNBQVMsRUFBQztBQUEvRSxvQkFDSTtBQUFNLE1BQUEsU0FBUyxFQUFDLHFCQUFoQjtBQUFzQyxvQkFBWUg7QUFBbEQsTUFESixFQUVLRixRQUZMLEVBR0tHLEdBSEwsQ0FESjtBQU9IOztBQXRDK0UiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi9Ub29sdGlwJztcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5pbnRlcmZhY2UgSVRvb2x0aXBQcm9wcyB7XG4gICAgdG9vbHRpcD86IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICB0b29sdGlwQ2xhc3NOYW1lPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBob3ZlcjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5mb1Rvb2x0aXAgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElUb29sdGlwUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJVG9vbHRpcFByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbk1vdXNlT3ZlciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBob3ZlcjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uTW91c2VMZWF2ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHt0b29sdGlwLCBjaGlsZHJlbiwgdG9vbHRpcENsYXNzTmFtZX0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCB0aXRsZSA9IF90KFwiSW5mb3JtYXRpb25cIik7XG5cbiAgICAgICAgLy8gVG9vbHRpcCBhcmUgZm9yY2VkIG9uIHRoZSByaWdodCBmb3IgYSBtb3JlIG5hdHVyYWwgZmVlbCB0byB0aGVtIG9uIGluZm8gaWNvbnNcbiAgICAgICAgY29uc3QgdGlwID0gdGhpcy5zdGF0ZS5ob3ZlciA/IDxUb29sdGlwXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbmZvVG9vbHRpcF9jb250YWluZXJcIlxuICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0luZm9Ub29sdGlwX3Rvb2x0aXBcIiwgdG9vbHRpcENsYXNzTmFtZSl9XG4gICAgICAgICAgICBsYWJlbD17dG9vbHRpcCB8fCB0aXRsZX1cbiAgICAgICAgICAgIGZvcmNlT25SaWdodD17dHJ1ZX1cbiAgICAgICAgLz4gOiA8ZGl2IC8+O1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBvbk1vdXNlT3Zlcj17dGhpcy5vbk1vdXNlT3Zlcn0gb25Nb3VzZUxlYXZlPXt0aGlzLm9uTW91c2VMZWF2ZX0gY2xhc3NOYW1lPVwibXhfSW5mb1Rvb2x0aXBcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9JbmZvVG9vbHRpcF9pY29uXCIgYXJpYS1sYWJlbD17dGl0bGV9IC8+XG4gICAgICAgICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICAgICAgICAgIHt0aXB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
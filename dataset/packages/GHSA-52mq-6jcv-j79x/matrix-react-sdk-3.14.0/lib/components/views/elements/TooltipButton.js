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

/*
Copyright 2017 New Vector Ltd.
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
class TooltipButton extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      hover: false
    });
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
  }

  render() {
    const Tooltip = sdk.getComponent("elements.Tooltip");
    const tip = this.state.hover ? /*#__PURE__*/_react.default.createElement(Tooltip, {
      className: "mx_TooltipButton_container",
      tooltipClassName: "mx_TooltipButton_helpText",
      label: this.props.helpText
    }) : /*#__PURE__*/_react.default.createElement("div", null);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_TooltipButton",
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave
    }, "?", tip);
  }

}

exports.default = TooltipButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1Rvb2x0aXBCdXR0b24uanMiXSwibmFtZXMiOlsiVG9vbHRpcEJ1dHRvbiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiaG92ZXIiLCJzZXRTdGF0ZSIsInJlbmRlciIsIlRvb2x0aXAiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJ0aXAiLCJzdGF0ZSIsInByb3BzIiwiaGVscFRleHQiLCJvbk1vdXNlT3ZlciIsIm9uTW91c2VMZWF2ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLZSxNQUFNQSxhQUFOLFNBQTRCQyxlQUFNQyxTQUFsQyxDQUE0QztBQUFBO0FBQUE7QUFBQSxpREFDL0M7QUFDSkMsTUFBQUEsS0FBSyxFQUFFO0FBREgsS0FEK0M7QUFBQSx1REFLekMsTUFBTTtBQUNoQixXQUFLQyxRQUFMLENBQWM7QUFDVkQsUUFBQUEsS0FBSyxFQUFFO0FBREcsT0FBZDtBQUdILEtBVHNEO0FBQUEsd0RBV3hDLE1BQU07QUFDakIsV0FBS0MsUUFBTCxDQUFjO0FBQ1ZELFFBQUFBLEtBQUssRUFBRTtBQURHLE9BQWQ7QUFHSCxLQWZzRDtBQUFBOztBQWlCdkRFLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLE9BQU8sR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLGtCQUFqQixDQUFoQjtBQUNBLFVBQU1DLEdBQUcsR0FBRyxLQUFLQyxLQUFMLENBQVdQLEtBQVgsZ0JBQW1CLDZCQUFDLE9BQUQ7QUFDM0IsTUFBQSxTQUFTLEVBQUMsNEJBRGlCO0FBRTNCLE1BQUEsZ0JBQWdCLEVBQUMsMkJBRlU7QUFHM0IsTUFBQSxLQUFLLEVBQUUsS0FBS1EsS0FBTCxDQUFXQztBQUhTLE1BQW5CLGdCQUlQLHlDQUpMO0FBS0Esd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQyxrQkFBZjtBQUFrQyxNQUFBLFdBQVcsRUFBRSxLQUFLQyxXQUFwRDtBQUFpRSxNQUFBLFlBQVksRUFBRSxLQUFLQztBQUFwRixZQUVNTCxHQUZOLENBREo7QUFNSDs7QUE5QnNEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkLlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9vbHRpcEJ1dHRvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGUgPSB7XG4gICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgb25Nb3VzZU92ZXIgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaG92ZXI6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbk1vdXNlTGVhdmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBUb29sdGlwID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlRvb2x0aXBcIik7XG4gICAgICAgIGNvbnN0IHRpcCA9IHRoaXMuc3RhdGUuaG92ZXIgPyA8VG9vbHRpcFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVG9vbHRpcEJ1dHRvbl9jb250YWluZXJcIlxuICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1Rvb2x0aXBCdXR0b25faGVscFRleHRcIlxuICAgICAgICAgICAgbGFiZWw9e3RoaXMucHJvcHMuaGVscFRleHR9XG4gICAgICAgIC8+IDogPGRpdiAvPjtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVG9vbHRpcEJ1dHRvblwiIG9uTW91c2VPdmVyPXt0aGlzLm9uTW91c2VPdmVyfSBvbk1vdXNlTGVhdmU9e3RoaXMub25Nb3VzZUxlYXZlfT5cbiAgICAgICAgICAgICAgICA/XG4gICAgICAgICAgICAgICAgeyB0aXAgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
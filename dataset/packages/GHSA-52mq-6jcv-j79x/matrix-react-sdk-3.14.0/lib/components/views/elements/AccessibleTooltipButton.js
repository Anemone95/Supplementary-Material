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

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _Tooltip = _interopRequireDefault(require("./Tooltip"));

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
class AccessibleTooltipButton extends _react.default.PureComponent
/*:: <ITooltipProps, IState>*/
{
  constructor(props
  /*: ITooltipProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "onMouseOver", () => {
      if (this.props.forceHide) return;
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

  componentDidUpdate(prevProps
  /*: Readonly<ITooltipProps>*/
  ) {
    if (!prevProps.forceHide && this.props.forceHide && this.state.hover) {
      this.setState({
        hover: false
      });
    }
  }

  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _this$props = this.props,
          {
      title,
      tooltip,
      children,
      tooltipClassName,
      forceHide,
      yOffset
    } = _this$props,
          props = (0, _objectWithoutProperties2.default)(_this$props, ["title", "tooltip", "children", "tooltipClassName", "forceHide", "yOffset"]);
    const tip = this.state.hover ? /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
      className: "mx_AccessibleTooltipButton_container",
      tooltipClassName: (0, _classnames.default)("mx_AccessibleTooltipButton_tooltip", tooltipClassName),
      label: tooltip || title,
      yOffset: yOffset
    }) : /*#__PURE__*/_react.default.createElement("div", null);
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({}, props, {
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave,
      "aria-label": title
    }), children, tip);
  }

}

exports.default = AccessibleTooltipButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uLnRzeCJdLCJuYW1lcyI6WyJBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJmb3JjZUhpZGUiLCJzZXRTdGF0ZSIsImhvdmVyIiwic3RhdGUiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJyZW5kZXIiLCJ0aXRsZSIsInRvb2x0aXAiLCJjaGlsZHJlbiIsInRvb2x0aXBDbGFzc05hbWUiLCJ5T2Zmc2V0IiwidGlwIiwib25Nb3VzZU92ZXIiLCJvbk1vdXNlTGVhdmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFvQmUsTUFBTUEsdUJBQU4sU0FBc0NDLGVBQU1DO0FBQTVDO0FBQWlGO0FBQzVGQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUF1QjtBQUM5QixVQUFNQSxLQUFOO0FBRDhCLHVEQWVwQixNQUFNO0FBQ2hCLFVBQUksS0FBS0EsS0FBTCxDQUFXQyxTQUFmLEVBQTBCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxLQUFLLEVBQUU7QUFERyxPQUFkO0FBR0gsS0FwQmlDO0FBQUEsd0RBc0JuQixNQUFNO0FBQ2pCLFdBQUtELFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxLQUFLLEVBQUU7QUFERyxPQUFkO0FBR0gsS0ExQmlDO0FBRTlCLFNBQUtDLEtBQUwsR0FBYTtBQUNURCxNQUFBQSxLQUFLLEVBQUU7QUFERSxLQUFiO0FBR0g7O0FBRURFLEVBQUFBLGtCQUFrQixDQUFDQztBQUFEO0FBQUEsSUFBcUM7QUFDbkQsUUFBSSxDQUFDQSxTQUFTLENBQUNMLFNBQVgsSUFBd0IsS0FBS0QsS0FBTCxDQUFXQyxTQUFuQyxJQUFnRCxLQUFLRyxLQUFMLENBQVdELEtBQS9ELEVBQXNFO0FBQ2xFLFdBQUtELFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxLQUFLLEVBQUU7QUFERyxPQUFkO0FBR0g7QUFDSjs7QUFlREksRUFBQUEsTUFBTSxHQUFHO0FBQ0w7QUFDQSx3QkFBbUYsS0FBS1AsS0FBeEY7QUFBQSxVQUFNO0FBQUNRLE1BQUFBLEtBQUQ7QUFBUUMsTUFBQUEsT0FBUjtBQUFpQkMsTUFBQUEsUUFBakI7QUFBMkJDLE1BQUFBLGdCQUEzQjtBQUE2Q1YsTUFBQUEsU0FBN0M7QUFBd0RXLE1BQUFBO0FBQXhELEtBQU47QUFBQSxVQUEwRVosS0FBMUU7QUFFQSxVQUFNYSxHQUFHLEdBQUcsS0FBS1QsS0FBTCxDQUFXRCxLQUFYLGdCQUFtQiw2QkFBQyxnQkFBRDtBQUMzQixNQUFBLFNBQVMsRUFBQyxzQ0FEaUI7QUFFM0IsTUFBQSxnQkFBZ0IsRUFBRSx5QkFBVyxvQ0FBWCxFQUFpRFEsZ0JBQWpELENBRlM7QUFHM0IsTUFBQSxLQUFLLEVBQUVGLE9BQU8sSUFBSUQsS0FIUztBQUkzQixNQUFBLE9BQU8sRUFBRUk7QUFKa0IsTUFBbkIsZ0JBS1AseUNBTEw7QUFNQSx3QkFDSSw2QkFBQyx5QkFBRCw2QkFDUVosS0FEUjtBQUVJLE1BQUEsV0FBVyxFQUFFLEtBQUtjLFdBRnRCO0FBR0ksTUFBQSxZQUFZLEVBQUUsS0FBS0MsWUFIdkI7QUFJSSxvQkFBWVA7QUFKaEIsUUFNTUUsUUFOTixFQU9NRyxHQVBOLENBREo7QUFXSDs7QUFsRDJGIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBUb29sdGlwIGZyb20gJy4vVG9vbHRpcCc7XG5cbmludGVyZmFjZSBJVG9vbHRpcFByb3BzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEFjY2Vzc2libGVCdXR0b24+IHtcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIHRvb2x0aXA/OiBSZWFjdC5SZWFjdE5vZGU7XG4gICAgdG9vbHRpcENsYXNzTmFtZT86IHN0cmluZztcbiAgICBmb3JjZUhpZGU/OiBib29sZWFuO1xuICAgIHlPZmZzZXQ/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGhvdmVyOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVRvb2x0aXBQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElUb29sdGlwUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFJlYWRvbmx5PElUb29sdGlwUHJvcHM+KSB7XG4gICAgICAgIGlmICghcHJldlByb3BzLmZvcmNlSGlkZSAmJiB0aGlzLnByb3BzLmZvcmNlSGlkZSAmJiB0aGlzLnN0YXRlLmhvdmVyKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uTW91c2VPdmVyID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5mb3JjZUhpZGUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBob3ZlcjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uTW91c2VMZWF2ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgY29uc3Qge3RpdGxlLCB0b29sdGlwLCBjaGlsZHJlbiwgdG9vbHRpcENsYXNzTmFtZSwgZm9yY2VIaWRlLCB5T2Zmc2V0LCAuLi5wcm9wc30gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIGNvbnN0IHRpcCA9IHRoaXMuc3RhdGUuaG92ZXIgPyA8VG9vbHRpcFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25fY29udGFpbmVyXCJcbiAgICAgICAgICAgIHRvb2x0aXBDbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbl90b29sdGlwXCIsIHRvb2x0aXBDbGFzc05hbWUpfVxuICAgICAgICAgICAgbGFiZWw9e3Rvb2x0aXAgfHwgdGl0bGV9XG4gICAgICAgICAgICB5T2Zmc2V0PXt5T2Zmc2V0fVxuICAgICAgICAvPiA6IDxkaXYgLz47XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICAgICAgICBvbk1vdXNlT3Zlcj17dGhpcy5vbk1vdXNlT3Zlcn1cbiAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9e3RoaXMub25Nb3VzZUxlYXZlfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3RpdGxlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICAgICAgICAgIHsgdGlwIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
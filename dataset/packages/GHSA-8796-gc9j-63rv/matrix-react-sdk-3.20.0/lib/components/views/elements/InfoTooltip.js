"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _Tooltip = _interopRequireWildcard(require("./Tooltip"));

var _languageHandler = require("../../../languageHandler");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let InfoTooltip = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.InfoTooltip"), _dec(_class = (_temp = class InfoTooltip extends _react.default.PureComponent
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
      alignment: _Tooltip.Alignment.Right
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

}, _temp)) || _class);
exports.default = InfoTooltip;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0luZm9Ub29sdGlwLnRzeCJdLCJuYW1lcyI6WyJJbmZvVG9vbHRpcCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzZXRTdGF0ZSIsImhvdmVyIiwic3RhdGUiLCJyZW5kZXIiLCJ0b29sdGlwIiwiY2hpbGRyZW4iLCJ0b29sdGlwQ2xhc3NOYW1lIiwidGl0bGUiLCJ0aXAiLCJBbGlnbm1lbnQiLCJSaWdodCIsIm9uTW91c2VPdmVyIiwib25Nb3VzZUxlYXZlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7O0lBWXFCQSxXLFdBRHBCLGdEQUFxQiw0QkFBckIsQyx5QkFBRCxNQUNxQkEsV0FEckIsU0FDeUNDLGVBQU1DO0FBRC9DO0FBQ29GO0FBQ2hGQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUF1QjtBQUM5QixVQUFNQSxLQUFOO0FBRDhCLHVEQU9wQixNQUFNO0FBQ2hCLFdBQUtDLFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxLQUFLLEVBQUU7QUFERyxPQUFkO0FBR0gsS0FYaUM7QUFBQSx3REFhbkIsTUFBTTtBQUNqQixXQUFLRCxRQUFMLENBQWM7QUFDVkMsUUFBQUEsS0FBSyxFQUFFO0FBREcsT0FBZDtBQUdILEtBakJpQztBQUU5QixTQUFLQyxLQUFMLEdBQWE7QUFDVEQsTUFBQUEsS0FBSyxFQUFFO0FBREUsS0FBYjtBQUdIOztBQWNERSxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNO0FBQUNDLE1BQUFBLE9BQUQ7QUFBVUMsTUFBQUEsUUFBVjtBQUFvQkMsTUFBQUE7QUFBcEIsUUFBd0MsS0FBS1AsS0FBbkQ7QUFDQSxVQUFNUSxLQUFLLEdBQUcseUJBQUcsYUFBSCxDQUFkLENBRkssQ0FJTDs7QUFDQSxVQUFNQyxHQUFHLEdBQUcsS0FBS04sS0FBTCxDQUFXRCxLQUFYLGdCQUFtQiw2QkFBQyxnQkFBRDtBQUMzQixNQUFBLFNBQVMsRUFBQywwQkFEaUI7QUFFM0IsTUFBQSxnQkFBZ0IsRUFBRSx5QkFBVyx3QkFBWCxFQUFxQ0ssZ0JBQXJDLENBRlM7QUFHM0IsTUFBQSxLQUFLLEVBQUVGLE9BQU8sSUFBSUcsS0FIUztBQUkzQixNQUFBLFNBQVMsRUFBRUUsbUJBQVVDO0FBSk0sTUFBbkIsZ0JBS1AseUNBTEw7QUFNQSx3QkFDSTtBQUFLLE1BQUEsV0FBVyxFQUFFLEtBQUtDLFdBQXZCO0FBQW9DLE1BQUEsWUFBWSxFQUFFLEtBQUtDLFlBQXZEO0FBQXFFLE1BQUEsU0FBUyxFQUFDO0FBQS9FLG9CQUNJO0FBQU0sTUFBQSxTQUFTLEVBQUMscUJBQWhCO0FBQXNDLG9CQUFZTDtBQUFsRCxNQURKLEVBRUtGLFFBRkwsRUFHS0csR0FITCxDQURKO0FBT0g7O0FBdEMrRSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCBUb29sdGlwLCB7QWxpZ25tZW50fSBmcm9tICcuL1Rvb2x0aXAnO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmludGVyZmFjZSBJVG9vbHRpcFByb3BzIHtcbiAgICB0b29sdGlwPzogUmVhY3QuUmVhY3ROb2RlO1xuICAgIHRvb2x0aXBDbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGhvdmVyOiBib29sZWFuO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5JbmZvVG9vbHRpcFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5mb1Rvb2x0aXAgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElUb29sdGlwUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJVG9vbHRpcFByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbk1vdXNlT3ZlciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBob3ZlcjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uTW91c2VMZWF2ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHt0b29sdGlwLCBjaGlsZHJlbiwgdG9vbHRpcENsYXNzTmFtZX0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCB0aXRsZSA9IF90KFwiSW5mb3JtYXRpb25cIik7XG5cbiAgICAgICAgLy8gVG9vbHRpcCBhcmUgZm9yY2VkIG9uIHRoZSByaWdodCBmb3IgYSBtb3JlIG5hdHVyYWwgZmVlbCB0byB0aGVtIG9uIGluZm8gaWNvbnNcbiAgICAgICAgY29uc3QgdGlwID0gdGhpcy5zdGF0ZS5ob3ZlciA/IDxUb29sdGlwXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbmZvVG9vbHRpcF9jb250YWluZXJcIlxuICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0luZm9Ub29sdGlwX3Rvb2x0aXBcIiwgdG9vbHRpcENsYXNzTmFtZSl9XG4gICAgICAgICAgICBsYWJlbD17dG9vbHRpcCB8fCB0aXRsZX1cbiAgICAgICAgICAgIGFsaWdubWVudD17QWxpZ25tZW50LlJpZ2h0fVxuICAgICAgICAvPiA6IDxkaXYgLz47XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IG9uTW91c2VPdmVyPXt0aGlzLm9uTW91c2VPdmVyfSBvbk1vdXNlTGVhdmU9e3RoaXMub25Nb3VzZUxlYXZlfSBjbGFzc05hbWU9XCJteF9JbmZvVG9vbHRpcFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0luZm9Ub29sdGlwX2ljb25cIiBhcmlhLWxhYmVsPXt0aXRsZX0gLz5cbiAgICAgICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgICAgICAge3RpcH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
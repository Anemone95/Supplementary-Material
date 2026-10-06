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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let AccessibleTooltipButton = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.AccessibleTooltipButton"), _dec(_class = (_temp = class AccessibleTooltipButton extends _react.default.PureComponent
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

}, _temp)) || _class);
exports.default = AccessibleTooltipButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uLnRzeCJdLCJuYW1lcyI6WyJBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJmb3JjZUhpZGUiLCJzZXRTdGF0ZSIsImhvdmVyIiwic3RhdGUiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJyZW5kZXIiLCJ0aXRsZSIsInRvb2x0aXAiLCJjaGlsZHJlbiIsInRvb2x0aXBDbGFzc05hbWUiLCJ5T2Zmc2V0IiwidGlwIiwib25Nb3VzZU92ZXIiLCJvbk1vdXNlTGVhdmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7OztJQWVxQkEsdUIsV0FEcEIsZ0RBQXFCLHdDQUFyQixDLHlCQUFELE1BQ3FCQSx1QkFEckIsU0FDcURDLGVBQU1DO0FBRDNEO0FBQ2dHO0FBQzVGQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUF1QjtBQUM5QixVQUFNQSxLQUFOO0FBRDhCLHVEQWVwQixNQUFNO0FBQ2hCLFVBQUksS0FBS0EsS0FBTCxDQUFXQyxTQUFmLEVBQTBCO0FBQzFCLFdBQUtDLFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxLQUFLLEVBQUU7QUFERyxPQUFkO0FBR0gsS0FwQmlDO0FBQUEsd0RBc0JuQixNQUFNO0FBQ2pCLFdBQUtELFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxLQUFLLEVBQUU7QUFERyxPQUFkO0FBR0gsS0ExQmlDO0FBRTlCLFNBQUtDLEtBQUwsR0FBYTtBQUNURCxNQUFBQSxLQUFLLEVBQUU7QUFERSxLQUFiO0FBR0g7O0FBRURFLEVBQUFBLGtCQUFrQixDQUFDQztBQUFEO0FBQUEsSUFBcUM7QUFDbkQsUUFBSSxDQUFDQSxTQUFTLENBQUNMLFNBQVgsSUFBd0IsS0FBS0QsS0FBTCxDQUFXQyxTQUFuQyxJQUFnRCxLQUFLRyxLQUFMLENBQVdELEtBQS9ELEVBQXNFO0FBQ2xFLFdBQUtELFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxLQUFLLEVBQUU7QUFERyxPQUFkO0FBR0g7QUFDSjs7QUFlREksRUFBQUEsTUFBTSxHQUFHO0FBQ0w7QUFDQSx3QkFBbUYsS0FBS1AsS0FBeEY7QUFBQSxVQUFNO0FBQUNRLE1BQUFBLEtBQUQ7QUFBUUMsTUFBQUEsT0FBUjtBQUFpQkMsTUFBQUEsUUFBakI7QUFBMkJDLE1BQUFBLGdCQUEzQjtBQUE2Q1YsTUFBQUEsU0FBN0M7QUFBd0RXLE1BQUFBO0FBQXhELEtBQU47QUFBQSxVQUEwRVosS0FBMUU7QUFFQSxVQUFNYSxHQUFHLEdBQUcsS0FBS1QsS0FBTCxDQUFXRCxLQUFYLGdCQUFtQiw2QkFBQyxnQkFBRDtBQUMzQixNQUFBLFNBQVMsRUFBQyxzQ0FEaUI7QUFFM0IsTUFBQSxnQkFBZ0IsRUFBRSx5QkFBVyxvQ0FBWCxFQUFpRFEsZ0JBQWpELENBRlM7QUFHM0IsTUFBQSxLQUFLLEVBQUVGLE9BQU8sSUFBSUQsS0FIUztBQUkzQixNQUFBLE9BQU8sRUFBRUk7QUFKa0IsTUFBbkIsZ0JBS1AseUNBTEw7QUFNQSx3QkFDSSw2QkFBQyx5QkFBRCw2QkFDUVosS0FEUjtBQUVJLE1BQUEsV0FBVyxFQUFFLEtBQUtjLFdBRnRCO0FBR0ksTUFBQSxZQUFZLEVBQUUsS0FBS0MsWUFIdkI7QUFJSSxvQkFBWVA7QUFKaEIsUUFNTUUsUUFOTixFQU9NRyxHQVBOLENBREo7QUFXSDs7QUFsRDJGLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4vQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi9Ub29sdGlwJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5pbnRlcmZhY2UgSVRvb2x0aXBQcm9wcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBY2Nlc3NpYmxlQnV0dG9uPiB7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICB0b29sdGlwPzogUmVhY3QuUmVhY3ROb2RlO1xuICAgIHRvb2x0aXBDbGFzc05hbWU/OiBzdHJpbmc7XG4gICAgZm9yY2VIaWRlPzogYm9vbGVhbjtcbiAgICB5T2Zmc2V0PzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBob3ZlcjogYm9vbGVhbjtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZWxlbWVudHMuQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJVG9vbHRpcFByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVRvb2x0aXBQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUmVhZG9ubHk8SVRvb2x0aXBQcm9wcz4pIHtcbiAgICAgICAgaWYgKCFwcmV2UHJvcHMuZm9yY2VIaWRlICYmIHRoaXMucHJvcHMuZm9yY2VIaWRlICYmIHRoaXMuc3RhdGUuaG92ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Nb3VzZU92ZXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZvcmNlSGlkZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhvdmVyOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25Nb3VzZUxlYXZlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgICBjb25zdCB7dGl0bGUsIHRvb2x0aXAsIGNoaWxkcmVuLCB0b29sdGlwQ2xhc3NOYW1lLCBmb3JjZUhpZGUsIHlPZmZzZXQsIC4uLnByb3BzfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgY29uc3QgdGlwID0gdGhpcy5zdGF0ZS5ob3ZlciA/IDxUb29sdGlwXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbl9jb250YWluZXJcIlxuICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0FjY2Vzc2libGVUb29sdGlwQnV0dG9uX3Rvb2x0aXBcIiwgdG9vbHRpcENsYXNzTmFtZSl9XG4gICAgICAgICAgICBsYWJlbD17dG9vbHRpcCB8fCB0aXRsZX1cbiAgICAgICAgICAgIHlPZmZzZXQ9e3lPZmZzZXR9XG4gICAgICAgIC8+IDogPGRpdiAvPjtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLm9uTW91c2VPdmVyfVxuICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbk1vdXNlTGVhdmV9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGl0bGV9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgeyB0aXAgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
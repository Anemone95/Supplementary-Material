"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let TooltipButton = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.TooltipButton"), _dec(_class = (_temp = class TooltipButton extends _react.default.Component {
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

}, _temp)) || _class);
exports.default = TooltipButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1Rvb2x0aXBCdXR0b24uanMiXSwibmFtZXMiOlsiVG9vbHRpcEJ1dHRvbiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiaG92ZXIiLCJzZXRTdGF0ZSIsInJlbmRlciIsIlRvb2x0aXAiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJ0aXAiLCJzdGF0ZSIsInByb3BzIiwiaGVscFRleHQiLCJvbk1vdXNlT3ZlciIsIm9uTW91c2VMZWF2ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsYSxXQURwQixnREFBcUIsOEJBQXJCLEMseUJBQUQsTUFDcUJBLGFBRHJCLFNBQzJDQyxlQUFNQyxTQURqRCxDQUMyRDtBQUFBO0FBQUE7QUFBQSxpREFDL0M7QUFDSkMsTUFBQUEsS0FBSyxFQUFFO0FBREgsS0FEK0M7QUFBQSx1REFLekMsTUFBTTtBQUNoQixXQUFLQyxRQUFMLENBQWM7QUFDVkQsUUFBQUEsS0FBSyxFQUFFO0FBREcsT0FBZDtBQUdILEtBVHNEO0FBQUEsd0RBV3hDLE1BQU07QUFDakIsV0FBS0MsUUFBTCxDQUFjO0FBQ1ZELFFBQUFBLEtBQUssRUFBRTtBQURHLE9BQWQ7QUFHSCxLQWZzRDtBQUFBOztBQWlCdkRFLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLE9BQU8sR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLGtCQUFqQixDQUFoQjtBQUNBLFVBQU1DLEdBQUcsR0FBRyxLQUFLQyxLQUFMLENBQVdQLEtBQVgsZ0JBQW1CLDZCQUFDLE9BQUQ7QUFDM0IsTUFBQSxTQUFTLEVBQUMsNEJBRGlCO0FBRTNCLE1BQUEsZ0JBQWdCLEVBQUMsMkJBRlU7QUFHM0IsTUFBQSxLQUFLLEVBQUUsS0FBS1EsS0FBTCxDQUFXQztBQUhTLE1BQW5CLGdCQUlQLHlDQUpMO0FBS0Esd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQyxrQkFBZjtBQUFrQyxNQUFBLFdBQVcsRUFBRSxLQUFLQyxXQUFwRDtBQUFpRSxNQUFBLFlBQVksRUFBRSxLQUFLQztBQUFwRixZQUVNTCxHQUZOLENBREo7QUFNSDs7QUE5QnNELEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTmV3IFZlY3RvciBMdGQuXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmVsZW1lbnRzLlRvb2x0aXBCdXR0b25cIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvb2x0aXBCdXR0b24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRlID0ge1xuICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgfTtcblxuICAgIG9uTW91c2VPdmVyID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhvdmVyOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25Nb3VzZUxlYXZlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgVG9vbHRpcCA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5Ub29sdGlwXCIpO1xuICAgICAgICBjb25zdCB0aXAgPSB0aGlzLnN0YXRlLmhvdmVyID8gPFRvb2x0aXBcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBCdXR0b25fY29udGFpbmVyXCJcbiAgICAgICAgICAgIHRvb2x0aXBDbGFzc05hbWU9XCJteF9Ub29sdGlwQnV0dG9uX2hlbHBUZXh0XCJcbiAgICAgICAgICAgIGxhYmVsPXt0aGlzLnByb3BzLmhlbHBUZXh0fVxuICAgICAgICAvPiA6IDxkaXYgLz47XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBCdXR0b25cIiBvbk1vdXNlT3Zlcj17dGhpcy5vbk1vdXNlT3Zlcn0gb25Nb3VzZUxlYXZlPXt0aGlzLm9uTW91c2VMZWF2ZX0+XG4gICAgICAgICAgICAgICAgP1xuICAgICAgICAgICAgICAgIHsgdGlwIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
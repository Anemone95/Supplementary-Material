"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let TextWithTooltip = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.TextWithTooltip"), _dec(_class = (_temp = _class2 = class TextWithTooltip extends _react.default.Component {
  constructor() {
    super();
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
    const Tooltip = sdk.getComponent("elements.Tooltip");
    const _this$props = this.props,
          {
      class: className,
      children,
      tooltip,
      tooltipClass,
      tooltipProps
    } = _this$props,
          props = (0, _objectWithoutProperties2.default)(_this$props, ["class", "children", "tooltip", "tooltipClass", "tooltipProps"]);
    return /*#__PURE__*/_react.default.createElement("span", (0, _extends2.default)({}, props, {
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave,
      className: className
    }), children, this.state.hover && /*#__PURE__*/_react.default.createElement(Tooltip, (0, _extends2.default)({}, tooltipProps, {
      label: tooltip,
      tooltipClassName: tooltipClass,
      className: "mx_TextWithTooltip_tooltip"
    })));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  class: _propTypes.default.string,
  tooltipClass: _propTypes.default.string,
  tooltip: _propTypes.default.node.isRequired,
  tooltipProps: _propTypes.default.object
}), _temp)) || _class);
exports.default = TextWithTooltip;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1RleHRXaXRoVG9vbHRpcC5qcyJdLCJuYW1lcyI6WyJUZXh0V2l0aFRvb2x0aXAiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwic2V0U3RhdGUiLCJob3ZlciIsInN0YXRlIiwicmVuZGVyIiwiVG9vbHRpcCIsInNkayIsImdldENvbXBvbmVudCIsInByb3BzIiwiY2xhc3MiLCJjbGFzc05hbWUiLCJjaGlsZHJlbiIsInRvb2x0aXAiLCJ0b29sdGlwQ2xhc3MiLCJ0b29sdGlwUHJvcHMiLCJvbk1vdXNlT3ZlciIsIm9uTW91c2VMZWF2ZSIsIlByb3BUeXBlcyIsInN0cmluZyIsIm5vZGUiLCJpc1JlcXVpcmVkIiwib2JqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsZSxXQURwQixnREFBcUIsZ0NBQXJCLEMsbUNBQUQsTUFDcUJBLGVBRHJCLFNBQzZDQyxlQUFNQyxTQURuRCxDQUM2RDtBQVF6REMsRUFBQUEsV0FBVyxHQUFHO0FBQ1Y7QUFEVSx1REFRQSxNQUFNO0FBQ2hCLFdBQUtDLFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxLQUFLLEVBQUU7QUFBUixPQUFkO0FBQ0gsS0FWYTtBQUFBLHdEQVlDLE1BQU07QUFDakIsV0FBS0QsUUFBTCxDQUFjO0FBQUNDLFFBQUFBLEtBQUssRUFBRTtBQUFSLE9BQWQ7QUFDSCxLQWRhO0FBR1YsU0FBS0MsS0FBTCxHQUFhO0FBQ1RELE1BQUFBLEtBQUssRUFBRTtBQURFLEtBQWI7QUFHSDs7QUFVREUsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsT0FBTyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsa0JBQWpCLENBQWhCO0FBRUEsd0JBQW9GLEtBQUtDLEtBQXpGO0FBQUEsVUFBTTtBQUFDQyxNQUFBQSxLQUFLLEVBQUVDLFNBQVI7QUFBbUJDLE1BQUFBLFFBQW5CO0FBQTZCQyxNQUFBQSxPQUE3QjtBQUFzQ0MsTUFBQUEsWUFBdEM7QUFBb0RDLE1BQUFBO0FBQXBELEtBQU47QUFBQSxVQUEyRU4sS0FBM0U7QUFFQSx3QkFDSSxnRUFBVUEsS0FBVjtBQUFpQixNQUFBLFdBQVcsRUFBRSxLQUFLTyxXQUFuQztBQUFnRCxNQUFBLFlBQVksRUFBRSxLQUFLQyxZQUFuRTtBQUFpRixNQUFBLFNBQVMsRUFBRU47QUFBNUYsUUFDS0MsUUFETCxFQUVLLEtBQUtSLEtBQUwsQ0FBV0QsS0FBWCxpQkFBb0IsNkJBQUMsT0FBRCw2QkFDYlksWUFEYTtBQUVqQixNQUFBLEtBQUssRUFBRUYsT0FGVTtBQUdqQixNQUFBLGdCQUFnQixFQUFFQyxZQUhEO0FBSWpCLE1BQUEsU0FBUyxFQUFFO0FBSk0sT0FGekIsQ0FESjtBQVdIOztBQXhDd0QsQyxzREFDdEM7QUFDZkosRUFBQUEsS0FBSyxFQUFFUSxtQkFBVUMsTUFERjtBQUVmTCxFQUFBQSxZQUFZLEVBQUVJLG1CQUFVQyxNQUZUO0FBR2ZOLEVBQUFBLE9BQU8sRUFBRUssbUJBQVVFLElBQVYsQ0FBZUMsVUFIVDtBQUlmTixFQUFBQSxZQUFZLEVBQUVHLG1CQUFVSTtBQUpULEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkLlxuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5UZXh0V2l0aFRvb2x0aXBcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHRXaXRoVG9vbHRpcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgY2xhc3M6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIHRvb2x0aXBDbGFzczogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgdG9vbHRpcDogUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcbiAgICAgICAgdG9vbHRpcFByb3BzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uTW91c2VPdmVyID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtob3ZlcjogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICBvbk1vdXNlTGVhdmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2hvdmVyOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IFRvb2x0aXAgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVG9vbHRpcFwiKTtcblxuICAgICAgICBjb25zdCB7Y2xhc3M6IGNsYXNzTmFtZSwgY2hpbGRyZW4sIHRvb2x0aXAsIHRvb2x0aXBDbGFzcywgdG9vbHRpcFByb3BzLCAuLi5wcm9wc30gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3BhbiB7Li4ucHJvcHN9IG9uTW91c2VPdmVyPXt0aGlzLm9uTW91c2VPdmVyfSBvbk1vdXNlTGVhdmU9e3RoaXMub25Nb3VzZUxlYXZlfSBjbGFzc05hbWU9e2NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmhvdmVyICYmIDxUb29sdGlwXG4gICAgICAgICAgICAgICAgICAgIHsuLi50b29sdGlwUHJvcHN9XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXt0b29sdGlwfVxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwQ2xhc3NOYW1lPXt0b29sdGlwQ2xhc3N9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17XCJteF9UZXh0V2l0aFRvb2x0aXBfdG9vbHRpcFwifVxuICAgICAgICAgICAgICAgIC8+IH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
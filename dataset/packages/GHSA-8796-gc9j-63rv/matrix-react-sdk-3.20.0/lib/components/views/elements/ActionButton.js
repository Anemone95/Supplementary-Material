"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _Analytics = _interopRequireDefault(require("../../../Analytics"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let ActionButton = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.ActionButton"), _dec(_class = (_temp = _class2 = class ActionButton extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      showTooltip: false
    });
    (0, _defineProperty2.default)(this, "_onClick", ev => {
      ev.stopPropagation();

      _Analytics.default.trackEvent('Action Button', 'click', this.props.action);

      _dispatcher.default.dispatch({
        action: this.props.action
      });
    });
    (0, _defineProperty2.default)(this, "_onMouseEnter", () => {
      if (this.props.tooltip) this.setState({
        showTooltip: true
      });

      if (this.props.mouseOverAction) {
        _dispatcher.default.dispatch({
          action: this.props.mouseOverAction
        });
      }
    });
    (0, _defineProperty2.default)(this, "_onMouseLeave", () => {
      this.setState({
        showTooltip: false
      });
    });
  }

  render() {
    const TintableSvg = sdk.getComponent("elements.TintableSvg");
    let tooltip;

    if (this.state.showTooltip) {
      const Tooltip = sdk.getComponent("elements.Tooltip");
      tooltip = /*#__PURE__*/_react.default.createElement(Tooltip, {
        className: "mx_RoleButton_tooltip",
        label: this.props.label
      });
    }

    const icon = this.props.iconPath ? /*#__PURE__*/_react.default.createElement(TintableSvg, {
      src: this.props.iconPath,
      width: this.props.size,
      height: this.props.size
    }) : undefined;
    const classNames = ["mx_RoleButton"];

    if (this.props.className) {
      classNames.push(this.props.className);
    }

    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: classNames.join(" "),
      onClick: this._onClick,
      onMouseEnter: this._onMouseEnter,
      onMouseLeave: this._onMouseLeave,
      "aria-label": this.props.label
    }, icon, tooltip);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  size: _propTypes.default.string,
  tooltip: _propTypes.default.bool,
  action: _propTypes.default.string.isRequired,
  mouseOverAction: _propTypes.default.string,
  label: _propTypes.default.string.isRequired,
  iconPath: _propTypes.default.string,
  className: _propTypes.default.string
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  size: "25",
  tooltip: false
}), _temp)) || _class);
exports.default = ActionButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FjdGlvbkJ1dHRvbi5qcyJdLCJuYW1lcyI6WyJBY3Rpb25CdXR0b24iLCJSZWFjdCIsIkNvbXBvbmVudCIsInNob3dUb29sdGlwIiwiZXYiLCJzdG9wUHJvcGFnYXRpb24iLCJBbmFseXRpY3MiLCJ0cmFja0V2ZW50IiwicHJvcHMiLCJhY3Rpb24iLCJkaXMiLCJkaXNwYXRjaCIsInRvb2x0aXAiLCJzZXRTdGF0ZSIsIm1vdXNlT3ZlckFjdGlvbiIsInJlbmRlciIsIlRpbnRhYmxlU3ZnIiwic2RrIiwiZ2V0Q29tcG9uZW50Iiwic3RhdGUiLCJUb29sdGlwIiwibGFiZWwiLCJpY29uIiwiaWNvblBhdGgiLCJzaXplIiwidW5kZWZpbmVkIiwiY2xhc3NOYW1lcyIsImNsYXNzTmFtZSIsInB1c2giLCJqb2luIiwiX29uQ2xpY2siLCJfb25Nb3VzZUVudGVyIiwiX29uTW91c2VMZWF2ZSIsIlByb3BUeXBlcyIsInN0cmluZyIsImJvb2wiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSxZLFdBRHBCLGdEQUFxQiw2QkFBckIsQyxtQ0FBRCxNQUNxQkEsWUFEckIsU0FDMENDLGVBQU1DLFNBRGhELENBQzBEO0FBQUE7QUFBQTtBQUFBLGlEQWdCOUM7QUFDSkMsTUFBQUEsV0FBVyxFQUFFO0FBRFQsS0FoQjhDO0FBQUEsb0RBb0IxQ0MsRUFBRCxJQUFRO0FBQ2ZBLE1BQUFBLEVBQUUsQ0FBQ0MsZUFBSDs7QUFDQUMseUJBQVVDLFVBQVYsQ0FBcUIsZUFBckIsRUFBc0MsT0FBdEMsRUFBK0MsS0FBS0MsS0FBTCxDQUFXQyxNQUExRDs7QUFDQUMsMEJBQUlDLFFBQUosQ0FBYTtBQUFDRixRQUFBQSxNQUFNLEVBQUUsS0FBS0QsS0FBTCxDQUFXQztBQUFwQixPQUFiO0FBQ0gsS0F4QnFEO0FBQUEseURBMEJ0QyxNQUFNO0FBQ2xCLFVBQUksS0FBS0QsS0FBTCxDQUFXSSxPQUFmLEVBQXdCLEtBQUtDLFFBQUwsQ0FBYztBQUFDVixRQUFBQSxXQUFXLEVBQUU7QUFBZCxPQUFkOztBQUN4QixVQUFJLEtBQUtLLEtBQUwsQ0FBV00sZUFBZixFQUFnQztBQUM1QkosNEJBQUlDLFFBQUosQ0FBYTtBQUFDRixVQUFBQSxNQUFNLEVBQUUsS0FBS0QsS0FBTCxDQUFXTTtBQUFwQixTQUFiO0FBQ0g7QUFDSixLQS9CcUQ7QUFBQSx5REFpQ3RDLE1BQU07QUFDbEIsV0FBS0QsUUFBTCxDQUFjO0FBQUNWLFFBQUFBLFdBQVcsRUFBRTtBQUFkLE9BQWQ7QUFDSCxLQW5DcUQ7QUFBQTs7QUFxQ3REWSxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxXQUFXLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixzQkFBakIsQ0FBcEI7QUFFQSxRQUFJTixPQUFKOztBQUNBLFFBQUksS0FBS08sS0FBTCxDQUFXaEIsV0FBZixFQUE0QjtBQUN4QixZQUFNaUIsT0FBTyxHQUFHSCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsa0JBQWpCLENBQWhCO0FBQ0FOLE1BQUFBLE9BQU8sZ0JBQUcsNkJBQUMsT0FBRDtBQUFTLFFBQUEsU0FBUyxFQUFDLHVCQUFuQjtBQUEyQyxRQUFBLEtBQUssRUFBRSxLQUFLSixLQUFMLENBQVdhO0FBQTdELFFBQVY7QUFDSDs7QUFFRCxVQUFNQyxJQUFJLEdBQUcsS0FBS2QsS0FBTCxDQUFXZSxRQUFYLGdCQUNSLDZCQUFDLFdBQUQ7QUFBYSxNQUFBLEdBQUcsRUFBRSxLQUFLZixLQUFMLENBQVdlLFFBQTdCO0FBQXVDLE1BQUEsS0FBSyxFQUFFLEtBQUtmLEtBQUwsQ0FBV2dCLElBQXpEO0FBQStELE1BQUEsTUFBTSxFQUFFLEtBQUtoQixLQUFMLENBQVdnQjtBQUFsRixNQURRLEdBRVRDLFNBRko7QUFJQSxVQUFNQyxVQUFVLEdBQUcsQ0FBQyxlQUFELENBQW5COztBQUNBLFFBQUksS0FBS2xCLEtBQUwsQ0FBV21CLFNBQWYsRUFBMEI7QUFDdEJELE1BQUFBLFVBQVUsQ0FBQ0UsSUFBWCxDQUFnQixLQUFLcEIsS0FBTCxDQUFXbUIsU0FBM0I7QUFDSDs7QUFFRCx3QkFDSSw2QkFBQyx5QkFBRDtBQUFrQixNQUFBLFNBQVMsRUFBRUQsVUFBVSxDQUFDRyxJQUFYLENBQWdCLEdBQWhCLENBQTdCO0FBQ0ksTUFBQSxPQUFPLEVBQUUsS0FBS0MsUUFEbEI7QUFFSSxNQUFBLFlBQVksRUFBRSxLQUFLQyxhQUZ2QjtBQUdJLE1BQUEsWUFBWSxFQUFFLEtBQUtDLGFBSHZCO0FBSUksb0JBQVksS0FBS3hCLEtBQUwsQ0FBV2E7QUFKM0IsT0FNTUMsSUFOTixFQU9NVixPQVBOLENBREo7QUFXSDs7QUFsRXFELEMsc0RBQ25DO0FBQ2ZZLEVBQUFBLElBQUksRUFBRVMsbUJBQVVDLE1BREQ7QUFFZnRCLEVBQUFBLE9BQU8sRUFBRXFCLG1CQUFVRSxJQUZKO0FBR2YxQixFQUFBQSxNQUFNLEVBQUV3QixtQkFBVUMsTUFBVixDQUFpQkUsVUFIVjtBQUlmdEIsRUFBQUEsZUFBZSxFQUFFbUIsbUJBQVVDLE1BSlo7QUFLZmIsRUFBQUEsS0FBSyxFQUFFWSxtQkFBVUMsTUFBVixDQUFpQkUsVUFMVDtBQU1mYixFQUFBQSxRQUFRLEVBQUVVLG1CQUFVQyxNQU5MO0FBT2ZQLEVBQUFBLFNBQVMsRUFBRU0sbUJBQVVDO0FBUE4sQywwREFVRztBQUNsQlYsRUFBQUEsSUFBSSxFQUFFLElBRFk7QUFFbEJaLEVBQUFBLE9BQU8sRUFBRTtBQUZTLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4vQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuLi8uLi8uLi9BbmFseXRpY3MnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmVsZW1lbnRzLkFjdGlvbkJ1dHRvblwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWN0aW9uQnV0dG9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBzaXplOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICB0b29sdGlwOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgYWN0aW9uOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIG1vdXNlT3ZlckFjdGlvbjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgbGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgaWNvblBhdGg6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgc2l6ZTogXCIyNVwiLFxuICAgICAgICB0b29sdGlwOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHNob3dUb29sdGlwOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgX29uQ2xpY2sgPSAoZXYpID0+IHtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCdBY3Rpb24gQnV0dG9uJywgJ2NsaWNrJywgdGhpcy5wcm9wcy5hY3Rpb24pO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogdGhpcy5wcm9wcy5hY3Rpb259KTtcbiAgICB9O1xuXG4gICAgX29uTW91c2VFbnRlciA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMudG9vbHRpcCkgdGhpcy5zZXRTdGF0ZSh7c2hvd1Rvb2x0aXA6IHRydWV9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubW91c2VPdmVyQWN0aW9uKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogdGhpcy5wcm9wcy5tb3VzZU92ZXJBY3Rpb259KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25Nb3VzZUxlYXZlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93VG9vbHRpcDogZmFsc2V9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBUaW50YWJsZVN2ZyA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5UaW50YWJsZVN2Z1wiKTtcblxuICAgICAgICBsZXQgdG9vbHRpcDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd1Rvb2x0aXApIHtcbiAgICAgICAgICAgIGNvbnN0IFRvb2x0aXAgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVG9vbHRpcFwiKTtcbiAgICAgICAgICAgIHRvb2x0aXAgPSA8VG9vbHRpcCBjbGFzc05hbWU9XCJteF9Sb2xlQnV0dG9uX3Rvb2x0aXBcIiBsYWJlbD17dGhpcy5wcm9wcy5sYWJlbH0gLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpY29uID0gdGhpcy5wcm9wcy5pY29uUGF0aCA/XG4gICAgICAgICAgICAoPFRpbnRhYmxlU3ZnIHNyYz17dGhpcy5wcm9wcy5pY29uUGF0aH0gd2lkdGg9e3RoaXMucHJvcHMuc2l6ZX0gaGVpZ2h0PXt0aGlzLnByb3BzLnNpemV9IC8+KSA6XG4gICAgICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgICAgY29uc3QgY2xhc3NOYW1lcyA9IFtcIm14X1JvbGVCdXR0b25cIl07XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgY2xhc3NOYW1lcy5wdXNoKHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9e2NsYXNzTmFtZXMuam9pbihcIiBcIil9XG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMuX29uTW91c2VFbnRlcn1cbiAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9e3RoaXMuX29uTW91c2VMZWF2ZX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgaWNvbiB9XG4gICAgICAgICAgICAgICAgeyB0b29sdGlwIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
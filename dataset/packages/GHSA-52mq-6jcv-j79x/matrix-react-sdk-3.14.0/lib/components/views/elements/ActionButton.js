"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2017 Vector Creations Ltd

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
class ActionButton extends _react.default.Component {
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

}

exports.default = ActionButton;
(0, _defineProperty2.default)(ActionButton, "propTypes", {
  size: _propTypes.default.string,
  tooltip: _propTypes.default.bool,
  action: _propTypes.default.string.isRequired,
  mouseOverAction: _propTypes.default.string,
  label: _propTypes.default.string.isRequired,
  iconPath: _propTypes.default.string,
  className: _propTypes.default.string
});
(0, _defineProperty2.default)(ActionButton, "defaultProps", {
  size: "25",
  tooltip: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FjdGlvbkJ1dHRvbi5qcyJdLCJuYW1lcyI6WyJBY3Rpb25CdXR0b24iLCJSZWFjdCIsIkNvbXBvbmVudCIsInNob3dUb29sdGlwIiwiZXYiLCJzdG9wUHJvcGFnYXRpb24iLCJBbmFseXRpY3MiLCJ0cmFja0V2ZW50IiwicHJvcHMiLCJhY3Rpb24iLCJkaXMiLCJkaXNwYXRjaCIsInRvb2x0aXAiLCJzZXRTdGF0ZSIsIm1vdXNlT3ZlckFjdGlvbiIsInJlbmRlciIsIlRpbnRhYmxlU3ZnIiwic2RrIiwiZ2V0Q29tcG9uZW50Iiwic3RhdGUiLCJUb29sdGlwIiwibGFiZWwiLCJpY29uIiwiaWNvblBhdGgiLCJzaXplIiwidW5kZWZpbmVkIiwiY2xhc3NOYW1lcyIsImNsYXNzTmFtZSIsInB1c2giLCJqb2luIiwiX29uQ2xpY2siLCJfb25Nb3VzZUVudGVyIiwiX29uTW91c2VMZWF2ZSIsIlByb3BUeXBlcyIsInN0cmluZyIsImJvb2wiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFTZSxNQUFNQSxZQUFOLFNBQTJCQyxlQUFNQyxTQUFqQyxDQUEyQztBQUFBO0FBQUE7QUFBQSxpREFnQjlDO0FBQ0pDLE1BQUFBLFdBQVcsRUFBRTtBQURULEtBaEI4QztBQUFBLG9EQW9CMUNDLEVBQUQsSUFBUTtBQUNmQSxNQUFBQSxFQUFFLENBQUNDLGVBQUg7O0FBQ0FDLHlCQUFVQyxVQUFWLENBQXFCLGVBQXJCLEVBQXNDLE9BQXRDLEVBQStDLEtBQUtDLEtBQUwsQ0FBV0MsTUFBMUQ7O0FBQ0FDLDBCQUFJQyxRQUFKLENBQWE7QUFBQ0YsUUFBQUEsTUFBTSxFQUFFLEtBQUtELEtBQUwsQ0FBV0M7QUFBcEIsT0FBYjtBQUNILEtBeEJxRDtBQUFBLHlEQTBCdEMsTUFBTTtBQUNsQixVQUFJLEtBQUtELEtBQUwsQ0FBV0ksT0FBZixFQUF3QixLQUFLQyxRQUFMLENBQWM7QUFBQ1YsUUFBQUEsV0FBVyxFQUFFO0FBQWQsT0FBZDs7QUFDeEIsVUFBSSxLQUFLSyxLQUFMLENBQVdNLGVBQWYsRUFBZ0M7QUFDNUJKLDRCQUFJQyxRQUFKLENBQWE7QUFBQ0YsVUFBQUEsTUFBTSxFQUFFLEtBQUtELEtBQUwsQ0FBV007QUFBcEIsU0FBYjtBQUNIO0FBQ0osS0EvQnFEO0FBQUEseURBaUN0QyxNQUFNO0FBQ2xCLFdBQUtELFFBQUwsQ0FBYztBQUFDVixRQUFBQSxXQUFXLEVBQUU7QUFBZCxPQUFkO0FBQ0gsS0FuQ3FEO0FBQUE7O0FBcUN0RFksRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsV0FBVyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsc0JBQWpCLENBQXBCO0FBRUEsUUFBSU4sT0FBSjs7QUFDQSxRQUFJLEtBQUtPLEtBQUwsQ0FBV2hCLFdBQWYsRUFBNEI7QUFDeEIsWUFBTWlCLE9BQU8sR0FBR0gsR0FBRyxDQUFDQyxZQUFKLENBQWlCLGtCQUFqQixDQUFoQjtBQUNBTixNQUFBQSxPQUFPLGdCQUFHLDZCQUFDLE9BQUQ7QUFBUyxRQUFBLFNBQVMsRUFBQyx1QkFBbkI7QUFBMkMsUUFBQSxLQUFLLEVBQUUsS0FBS0osS0FBTCxDQUFXYTtBQUE3RCxRQUFWO0FBQ0g7O0FBRUQsVUFBTUMsSUFBSSxHQUFHLEtBQUtkLEtBQUwsQ0FBV2UsUUFBWCxnQkFDSiw2QkFBQyxXQUFEO0FBQWEsTUFBQSxHQUFHLEVBQUUsS0FBS2YsS0FBTCxDQUFXZSxRQUE3QjtBQUF1QyxNQUFBLEtBQUssRUFBRSxLQUFLZixLQUFMLENBQVdnQixJQUF6RDtBQUErRCxNQUFBLE1BQU0sRUFBRSxLQUFLaEIsS0FBTCxDQUFXZ0I7QUFBbEYsTUFESSxHQUVMQyxTQUZSO0FBSUEsVUFBTUMsVUFBVSxHQUFHLENBQUMsZUFBRCxDQUFuQjs7QUFDQSxRQUFJLEtBQUtsQixLQUFMLENBQVdtQixTQUFmLEVBQTBCO0FBQ3RCRCxNQUFBQSxVQUFVLENBQUNFLElBQVgsQ0FBZ0IsS0FBS3BCLEtBQUwsQ0FBV21CLFNBQTNCO0FBQ0g7O0FBRUQsd0JBQ0ksNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxTQUFTLEVBQUVELFVBQVUsQ0FBQ0csSUFBWCxDQUFnQixHQUFoQixDQUE3QjtBQUNJLE1BQUEsT0FBTyxFQUFFLEtBQUtDLFFBRGxCO0FBRUksTUFBQSxZQUFZLEVBQUUsS0FBS0MsYUFGdkI7QUFHSSxNQUFBLFlBQVksRUFBRSxLQUFLQyxhQUh2QjtBQUlJLG9CQUFZLEtBQUt4QixLQUFMLENBQVdhO0FBSjNCLE9BTU1DLElBTk4sRUFPTVYsT0FQTixDQURKO0FBV0g7O0FBbEVxRDs7OzhCQUFyQ1osWSxlQUNFO0FBQ2Z3QixFQUFBQSxJQUFJLEVBQUVTLG1CQUFVQyxNQUREO0FBRWZ0QixFQUFBQSxPQUFPLEVBQUVxQixtQkFBVUUsSUFGSjtBQUdmMUIsRUFBQUEsTUFBTSxFQUFFd0IsbUJBQVVDLE1BQVYsQ0FBaUJFLFVBSFY7QUFJZnRCLEVBQUFBLGVBQWUsRUFBRW1CLG1CQUFVQyxNQUpaO0FBS2ZiLEVBQUFBLEtBQUssRUFBRVksbUJBQVVDLE1BQVYsQ0FBaUJFLFVBTFQ7QUFNZmIsRUFBQUEsUUFBUSxFQUFFVSxtQkFBVUMsTUFOTDtBQU9mUCxFQUFBQSxTQUFTLEVBQUVNLG1CQUFVQztBQVBOLEM7OEJBREZsQyxZLGtCQVdLO0FBQ2xCd0IsRUFBQUEsSUFBSSxFQUFFLElBRFk7QUFFbEJaLEVBQUFBLE9BQU8sRUFBRTtBQUZTLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4vQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuLi8uLi8uLi9BbmFseXRpY3MnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY3Rpb25CdXR0b24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHNpemU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIHRvb2x0aXA6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICBhY3Rpb246IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgbW91c2VPdmVyQWN0aW9uOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBpY29uUGF0aDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBzaXplOiBcIjI1XCIsXG4gICAgICAgIHRvb2x0aXA6IGZhbHNlLFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgc2hvd1Rvb2x0aXA6IGZhbHNlLFxuICAgIH07XG5cbiAgICBfb25DbGljayA9IChldikgPT4ge1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoJ0FjdGlvbiBCdXR0b24nLCAnY2xpY2snLCB0aGlzLnByb3BzLmFjdGlvbik7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiB0aGlzLnByb3BzLmFjdGlvbn0pO1xuICAgIH07XG5cbiAgICBfb25Nb3VzZUVudGVyID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy50b29sdGlwKSB0aGlzLnNldFN0YXRlKHtzaG93VG9vbHRpcDogdHJ1ZX0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tb3VzZU92ZXJBY3Rpb24pIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiB0aGlzLnByb3BzLm1vdXNlT3ZlckFjdGlvbn0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vbk1vdXNlTGVhdmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dUb29sdGlwOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IFRpbnRhYmxlU3ZnID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlRpbnRhYmxlU3ZnXCIpO1xuXG4gICAgICAgIGxldCB0b29sdGlwO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93VG9vbHRpcCkge1xuICAgICAgICAgICAgY29uc3QgVG9vbHRpcCA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5Ub29sdGlwXCIpO1xuICAgICAgICAgICAgdG9vbHRpcCA9IDxUb29sdGlwIGNsYXNzTmFtZT1cIm14X1JvbGVCdXR0b25fdG9vbHRpcFwiIGxhYmVsPXt0aGlzLnByb3BzLmxhYmVsfSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGljb24gPSB0aGlzLnByb3BzLmljb25QYXRoID9cbiAgICAgICAgICAgICAgICAoPFRpbnRhYmxlU3ZnIHNyYz17dGhpcy5wcm9wcy5pY29uUGF0aH0gd2lkdGg9e3RoaXMucHJvcHMuc2l6ZX0gaGVpZ2h0PXt0aGlzLnByb3BzLnNpemV9IC8+KSA6XG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZXMgPSBbXCJteF9Sb2xlQnV0dG9uXCJdO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZXMucHVzaCh0aGlzLnByb3BzLmNsYXNzTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPXtjbGFzc05hbWVzLmpvaW4oXCIgXCIpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9XG4gICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLl9vbk1vdXNlRW50ZXJ9XG4gICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLl9vbk1vdXNlTGVhdmV9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGljb24gfVxuICAgICAgICAgICAgICAgIHsgdG9vbHRpcCB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
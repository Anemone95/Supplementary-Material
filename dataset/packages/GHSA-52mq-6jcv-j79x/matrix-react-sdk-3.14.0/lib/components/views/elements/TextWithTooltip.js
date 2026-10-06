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

var sdk = _interopRequireWildcard(require("../../../index"));

/*
 Copyright 2019 New Vector Ltd.

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
class TextWithTooltip extends _react.default.Component {
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
    return /*#__PURE__*/_react.default.createElement("span", {
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave,
      className: this.props.class
    }, this.props.children, this.state.hover && /*#__PURE__*/_react.default.createElement(Tooltip, {
      label: this.props.tooltip,
      tooltipClassName: this.props.tooltipClass,
      className: "mx_TextWithTooltip_tooltip"
    }));
  }

}

exports.default = TextWithTooltip;
(0, _defineProperty2.default)(TextWithTooltip, "propTypes", {
  class: _propTypes.default.string,
  tooltipClass: _propTypes.default.string,
  tooltip: _propTypes.default.node.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1RleHRXaXRoVG9vbHRpcC5qcyJdLCJuYW1lcyI6WyJUZXh0V2l0aFRvb2x0aXAiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwic2V0U3RhdGUiLCJob3ZlciIsInN0YXRlIiwicmVuZGVyIiwiVG9vbHRpcCIsInNkayIsImdldENvbXBvbmVudCIsIm9uTW91c2VPdmVyIiwib25Nb3VzZUxlYXZlIiwicHJvcHMiLCJjbGFzcyIsImNoaWxkcmVuIiwidG9vbHRpcCIsInRvb2x0aXBDbGFzcyIsIlByb3BUeXBlcyIsInN0cmluZyIsIm5vZGUiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQWxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNZSxNQUFNQSxlQUFOLFNBQThCQyxlQUFNQyxTQUFwQyxDQUE4QztBQU96REMsRUFBQUEsV0FBVyxHQUFHO0FBQ1Y7QUFEVSx1REFRQSxNQUFNO0FBQ2hCLFdBQUtDLFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxLQUFLLEVBQUU7QUFBUixPQUFkO0FBQ0gsS0FWYTtBQUFBLHdEQVlDLE1BQU07QUFDakIsV0FBS0QsUUFBTCxDQUFjO0FBQUNDLFFBQUFBLEtBQUssRUFBRTtBQUFSLE9BQWQ7QUFDSCxLQWRhO0FBR1YsU0FBS0MsS0FBTCxHQUFhO0FBQ1RELE1BQUFBLEtBQUssRUFBRTtBQURFLEtBQWI7QUFHSDs7QUFVREUsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsT0FBTyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsa0JBQWpCLENBQWhCO0FBRUEsd0JBQ0k7QUFBTSxNQUFBLFdBQVcsRUFBRSxLQUFLQyxXQUF4QjtBQUFxQyxNQUFBLFlBQVksRUFBRSxLQUFLQyxZQUF4RDtBQUFzRSxNQUFBLFNBQVMsRUFBRSxLQUFLQyxLQUFMLENBQVdDO0FBQTVGLE9BQ0ssS0FBS0QsS0FBTCxDQUFXRSxRQURoQixFQUVLLEtBQUtULEtBQUwsQ0FBV0QsS0FBWCxpQkFBb0IsNkJBQUMsT0FBRDtBQUNqQixNQUFBLEtBQUssRUFBRSxLQUFLUSxLQUFMLENBQVdHLE9BREQ7QUFFakIsTUFBQSxnQkFBZ0IsRUFBRSxLQUFLSCxLQUFMLENBQVdJLFlBRlo7QUFHakIsTUFBQSxTQUFTLEVBQUU7QUFITSxNQUZ6QixDQURKO0FBU0g7O0FBbkN3RDs7OzhCQUF4Q2pCLGUsZUFDRTtBQUNmYyxFQUFBQSxLQUFLLEVBQUVJLG1CQUFVQyxNQURGO0FBRWZGLEVBQUFBLFlBQVksRUFBRUMsbUJBQVVDLE1BRlQ7QUFHZkgsRUFBQUEsT0FBTyxFQUFFRSxtQkFBVUUsSUFBVixDQUFlQztBQUhULEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkLlxuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dFdpdGhUb29sdGlwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBjbGFzczogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgdG9vbHRpcENsYXNzOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICB0b29sdGlwOiBQcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uTW91c2VPdmVyID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtob3ZlcjogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICBvbk1vdXNlTGVhdmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2hvdmVyOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IFRvb2x0aXAgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVG9vbHRpcFwiKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNwYW4gb25Nb3VzZU92ZXI9e3RoaXMub25Nb3VzZU92ZXJ9IG9uTW91c2VMZWF2ZT17dGhpcy5vbk1vdXNlTGVhdmV9IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc30+XG4gICAgICAgICAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuaG92ZXIgJiYgPFRvb2x0aXBcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e3RoaXMucHJvcHMudG9vbHRpcH1cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT17dGhpcy5wcm9wcy50b29sdGlwQ2xhc3N9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17XCJteF9UZXh0V2l0aFRvb2x0aXBfdG9vbHRpcFwifSAvPiB9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
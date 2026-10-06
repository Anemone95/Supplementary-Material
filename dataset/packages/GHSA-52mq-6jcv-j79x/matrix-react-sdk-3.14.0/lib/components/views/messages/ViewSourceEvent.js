"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

/*
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
class ViewSourceEvent extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onToggle", ev => {
      ev.preventDefault();
      const {
        expanded
      } = this.state;
      this.setState({
        expanded: !expanded
      });
    });
    this.state = {
      expanded: false
    };
  }

  componentDidMount() {
    const {
      mxEvent
    } = this.props;

    if (mxEvent.isBeingDecrypted()) {
      mxEvent.once("Event.decrypted", () => this.forceUpdate());
    }
  }

  render() {
    const {
      mxEvent
    } = this.props;
    const {
      expanded
    } = this.state;
    let content;

    if (expanded) {
      content = /*#__PURE__*/_react.default.createElement("pre", null, JSON.stringify(mxEvent, null, 4));
    } else {
      content = /*#__PURE__*/_react.default.createElement("code", null, `{ "type": ${mxEvent.getType()} }`);
    }

    const classes = (0, _classnames.default)("mx_ViewSourceEvent mx_EventTile_content", {
      mx_ViewSourceEvent_expanded: expanded
    });
    return /*#__PURE__*/_react.default.createElement("span", {
      className: classes
    }, content, /*#__PURE__*/_react.default.createElement("a", {
      className: "mx_ViewSourceEvent_toggle",
      href: "#",
      onClick: this.onToggle
    }));
  }

}

exports.default = ViewSourceEvent;
(0, _defineProperty2.default)(ViewSourceEvent, "propTypes", {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1ZpZXdTb3VyY2VFdmVudC5qcyJdLCJuYW1lcyI6WyJWaWV3U291cmNlRXZlbnQiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsImV4cGFuZGVkIiwic3RhdGUiLCJzZXRTdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwibXhFdmVudCIsImlzQmVpbmdEZWNyeXB0ZWQiLCJvbmNlIiwiZm9yY2VVcGRhdGUiLCJyZW5kZXIiLCJjb250ZW50IiwiSlNPTiIsInN0cmluZ2lmeSIsImdldFR5cGUiLCJjbGFzc2VzIiwibXhfVmlld1NvdXJjZUV2ZW50X2V4cGFuZGVkIiwib25Ub2dnbGUiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTWUsTUFBTUEsZUFBTixTQUE4QkMsZUFBTUMsYUFBcEMsQ0FBa0Q7QUFNN0RDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLG9EQWVQQyxFQUFELElBQVE7QUFDZkEsTUFBQUEsRUFBRSxDQUFDQyxjQUFIO0FBQ0EsWUFBTTtBQUFFQyxRQUFBQTtBQUFGLFVBQWUsS0FBS0MsS0FBMUI7QUFDQSxXQUFLQyxRQUFMLENBQWM7QUFDVkYsUUFBQUEsUUFBUSxFQUFFLENBQUNBO0FBREQsT0FBZDtBQUdILEtBckJrQjtBQUdmLFNBQUtDLEtBQUwsR0FBYTtBQUNURCxNQUFBQSxRQUFRLEVBQUU7QUFERCxLQUFiO0FBR0g7O0FBRURHLEVBQUFBLGlCQUFpQixHQUFHO0FBQ2hCLFVBQU07QUFBQ0MsTUFBQUE7QUFBRCxRQUFZLEtBQUtQLEtBQXZCOztBQUNBLFFBQUlPLE9BQU8sQ0FBQ0MsZ0JBQVIsRUFBSixFQUFnQztBQUM1QkQsTUFBQUEsT0FBTyxDQUFDRSxJQUFSLENBQWEsaUJBQWIsRUFBZ0MsTUFBTSxLQUFLQyxXQUFMLEVBQXRDO0FBQ0g7QUFDSjs7QUFVREMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTTtBQUFFSixNQUFBQTtBQUFGLFFBQWMsS0FBS1AsS0FBekI7QUFDQSxVQUFNO0FBQUVHLE1BQUFBO0FBQUYsUUFBZSxLQUFLQyxLQUExQjtBQUVBLFFBQUlRLE9BQUo7O0FBQ0EsUUFBSVQsUUFBSixFQUFjO0FBQ1ZTLE1BQUFBLE9BQU8sZ0JBQUcsMENBQU1DLElBQUksQ0FBQ0MsU0FBTCxDQUFlUCxPQUFmLEVBQXdCLElBQXhCLEVBQThCLENBQTlCLENBQU4sQ0FBVjtBQUNILEtBRkQsTUFFTztBQUNISyxNQUFBQSxPQUFPLGdCQUFHLDJDQUFRLGFBQVlMLE9BQU8sQ0FBQ1EsT0FBUixFQUFrQixJQUF0QyxDQUFWO0FBQ0g7O0FBRUQsVUFBTUMsT0FBTyxHQUFHLHlCQUFXLHlDQUFYLEVBQXNEO0FBQ2xFQyxNQUFBQSwyQkFBMkIsRUFBRWQ7QUFEcUMsS0FBdEQsQ0FBaEI7QUFJQSx3QkFBTztBQUFNLE1BQUEsU0FBUyxFQUFFYTtBQUFqQixPQUNGSixPQURFLGVBRUg7QUFDSSxNQUFBLFNBQVMsRUFBQywyQkFEZDtBQUVJLE1BQUEsSUFBSSxFQUFDLEdBRlQ7QUFHSSxNQUFBLE9BQU8sRUFBRSxLQUFLTTtBQUhsQixNQUZHLENBQVA7QUFRSDs7QUFwRDREOzs7OEJBQTVDdEIsZSxlQUNFO0FBQ2Y7QUFDQVcsRUFBQUEsT0FBTyxFQUFFWSxtQkFBVUMsTUFBVixDQUFpQkM7QUFGWCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlld1NvdXJjZUV2ZW50IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLyogdGhlIE1hdHJpeEV2ZW50IHRvIHNob3cgKi9cbiAgICAgICAgbXhFdmVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3Qge214RXZlbnR9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKG14RXZlbnQuaXNCZWluZ0RlY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICBteEV2ZW50Lm9uY2UoXCJFdmVudC5kZWNyeXB0ZWRcIiwgKCkgPT4gdGhpcy5mb3JjZVVwZGF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uVG9nZ2xlID0gKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHsgZXhwYW5kZWQgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZXhwYW5kZWQ6ICFleHBhbmRlZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IG14RXZlbnQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHsgZXhwYW5kZWQgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgICAgICAgY29udGVudCA9IDxwcmU+e0pTT04uc3RyaW5naWZ5KG14RXZlbnQsIG51bGwsIDQpfTwvcHJlPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8Y29kZT57YHsgXCJ0eXBlXCI6ICR7bXhFdmVudC5nZXRUeXBlKCl9IH1gfTwvY29kZT47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1ZpZXdTb3VyY2VFdmVudCBteF9FdmVudFRpbGVfY29udGVudFwiLCB7XG4gICAgICAgICAgICBteF9WaWV3U291cmNlRXZlbnRfZXhwYW5kZWQ6IGV4cGFuZGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9WaWV3U291cmNlRXZlbnRfdG9nZ2xlXCJcbiAgICAgICAgICAgICAgICBocmVmPVwiI1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblRvZ2dsZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvc3Bhbj47XG4gICAgfVxufVxuIl19
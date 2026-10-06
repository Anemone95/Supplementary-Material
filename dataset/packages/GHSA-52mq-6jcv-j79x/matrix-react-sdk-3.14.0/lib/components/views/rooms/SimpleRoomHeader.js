"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CancelButton = CancelButton;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2016 OpenMarket Ltd

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
// cancel button which is shared between room header and simple room header
function CancelButton(props) {
  const {
    onClick
  } = props;
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_RoomHeader_cancelButton",
    onClick: onClick
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: require("../../../../res/img/cancel.svg"),
    className: "mx_filterFlipColor",
    width: "18",
    height: "18",
    alt: (0, _languageHandler._t)("Cancel")
  }));
}
/*
 * A stripped-down room header used for things like the user settings
 * and room directory.
 */


class SimpleRoomHeader extends _react.default.Component {
  render() {
    let cancelButton;
    let icon;

    if (this.props.onCancelClick) {
      cancelButton = /*#__PURE__*/_react.default.createElement(CancelButton, {
        onClick: this.props.onCancelClick
      });
    }

    if (this.props.icon) {
      const TintableSvg = sdk.getComponent('elements.TintableSvg');
      icon = /*#__PURE__*/_react.default.createElement(TintableSvg, {
        className: "mx_RoomHeader_icon",
        src: this.props.icon,
        width: "25",
        height: "25"
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomHeader"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomHeader_wrapper"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomHeader_simpleHeader"
    }, icon, this.props.title, cancelButton)));
  }

}

exports.default = SimpleRoomHeader;
(0, _defineProperty2.default)(SimpleRoomHeader, "propTypes", {
  title: _propTypes.default.string,
  onCancelClick: _propTypes.default.func,
  // `src` to a TintableSvg. Optional.
  icon: _propTypes.default.string
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1NpbXBsZVJvb21IZWFkZXIuanMiXSwibmFtZXMiOlsiQ2FuY2VsQnV0dG9uIiwicHJvcHMiLCJvbkNsaWNrIiwicmVxdWlyZSIsIlNpbXBsZVJvb21IZWFkZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsInJlbmRlciIsImNhbmNlbEJ1dHRvbiIsImljb24iLCJvbkNhbmNlbENsaWNrIiwiVGludGFibGVTdmciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJ0aXRsZSIsIlByb3BUeXBlcyIsInN0cmluZyIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRQTtBQUNPLFNBQVNBLFlBQVQsQ0FBc0JDLEtBQXRCLEVBQTZCO0FBQ2hDLFFBQU07QUFBQ0MsSUFBQUE7QUFBRCxNQUFZRCxLQUFsQjtBQUVBLHNCQUNJLDZCQUFDLHlCQUFEO0FBQWtCLElBQUEsU0FBUyxFQUFDLDRCQUE1QjtBQUF5RCxJQUFBLE9BQU8sRUFBRUM7QUFBbEUsa0JBQ0k7QUFBSyxJQUFBLEdBQUcsRUFBRUMsT0FBTyxDQUFDLGdDQUFELENBQWpCO0FBQXFELElBQUEsU0FBUyxFQUFDLG9CQUEvRDtBQUNJLElBQUEsS0FBSyxFQUFDLElBRFY7QUFDZSxJQUFBLE1BQU0sRUFBQyxJQUR0QjtBQUMyQixJQUFBLEdBQUcsRUFBRSx5QkFBRyxRQUFIO0FBRGhDLElBREosQ0FESjtBQU1IO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7OztBQUNlLE1BQU1DLGdCQUFOLFNBQStCQyxlQUFNQyxTQUFyQyxDQUErQztBQVMxREMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSUMsWUFBSjtBQUNBLFFBQUlDLElBQUo7O0FBQ0EsUUFBSSxLQUFLUixLQUFMLENBQVdTLGFBQWYsRUFBOEI7QUFDMUJGLE1BQUFBLFlBQVksZ0JBQUcsNkJBQUMsWUFBRDtBQUFjLFFBQUEsT0FBTyxFQUFFLEtBQUtQLEtBQUwsQ0FBV1M7QUFBbEMsUUFBZjtBQUNIOztBQUNELFFBQUksS0FBS1QsS0FBTCxDQUFXUSxJQUFmLEVBQXFCO0FBQ2pCLFlBQU1FLFdBQVcsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHNCQUFqQixDQUFwQjtBQUNBSixNQUFBQSxJQUFJLGdCQUFHLDZCQUFDLFdBQUQ7QUFDSCxRQUFBLFNBQVMsRUFBQyxvQkFEUDtBQUM0QixRQUFBLEdBQUcsRUFBRSxLQUFLUixLQUFMLENBQVdRLElBRDVDO0FBRUgsUUFBQSxLQUFLLEVBQUMsSUFGSDtBQUVRLFFBQUEsTUFBTSxFQUFDO0FBRmYsUUFBUDtBQUlIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ01BLElBRE4sRUFFTSxLQUFLUixLQUFMLENBQVdhLEtBRmpCLEVBR01OLFlBSE4sQ0FESixDQURKLENBREo7QUFXSDs7QUFsQ3lEOzs7OEJBQXpDSixnQixlQUNFO0FBQ2ZVLEVBQUFBLEtBQUssRUFBRUMsbUJBQVVDLE1BREY7QUFFZk4sRUFBQUEsYUFBYSxFQUFFSyxtQkFBVUUsSUFGVjtBQUlmO0FBQ0FSLEVBQUFBLElBQUksRUFBRU0sbUJBQVVDO0FBTEQsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuXG4vLyBjYW5jZWwgYnV0dG9uIHdoaWNoIGlzIHNoYXJlZCBiZXR3ZWVuIHJvb20gaGVhZGVyIGFuZCBzaW1wbGUgcm9vbSBoZWFkZXJcbmV4cG9ydCBmdW5jdGlvbiBDYW5jZWxCdXR0b24ocHJvcHMpIHtcbiAgICBjb25zdCB7b25DbGlja30gPSBwcm9wcztcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT0nbXhfUm9vbUhlYWRlcl9jYW5jZWxCdXR0b24nIG9uQ2xpY2s9e29uQ2xpY2t9PlxuICAgICAgICAgICAgPGltZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2NhbmNlbC5zdmdcIil9IGNsYXNzTmFtZT0nbXhfZmlsdGVyRmxpcENvbG9yJ1xuICAgICAgICAgICAgICAgIHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIGFsdD17X3QoXCJDYW5jZWxcIil9IC8+XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICApO1xufVxuXG4vKlxuICogQSBzdHJpcHBlZC1kb3duIHJvb20gaGVhZGVyIHVzZWQgZm9yIHRoaW5ncyBsaWtlIHRoZSB1c2VyIHNldHRpbmdzXG4gKiBhbmQgcm9vbSBkaXJlY3RvcnkuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZVJvb21IZWFkZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBvbkNhbmNlbENsaWNrOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyBgc3JjYCB0byBhIFRpbnRhYmxlU3ZnLiBPcHRpb25hbC5cbiAgICAgICAgaWNvbjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY2FuY2VsQnV0dG9uO1xuICAgICAgICBsZXQgaWNvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DYW5jZWxDbGljaykge1xuICAgICAgICAgICAgY2FuY2VsQnV0dG9uID0gPENhbmNlbEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2FuY2VsQ2xpY2t9IC8+O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmljb24pIHtcbiAgICAgICAgICAgIGNvbnN0IFRpbnRhYmxlU3ZnID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuVGludGFibGVTdmcnKTtcbiAgICAgICAgICAgIGljb24gPSA8VGludGFibGVTdmdcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX2ljb25cIiBzcmM9e3RoaXMucHJvcHMuaWNvbn1cbiAgICAgICAgICAgICAgICB3aWR0aD1cIjI1XCIgaGVpZ2h0PVwiMjVcIlxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyXCIgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbUhlYWRlcl93cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbUhlYWRlcl9zaW1wbGVIZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaWNvbiB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMudGl0bGUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjYW5jZWxCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
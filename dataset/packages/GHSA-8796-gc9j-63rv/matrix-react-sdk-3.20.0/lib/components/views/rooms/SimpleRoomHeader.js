"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

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


let SimpleRoomHeader = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.SimpleRoomHeader"), _dec(_class = (_temp = _class2 = class SimpleRoomHeader extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  title: _propTypes.default.string,
  onCancelClick: _propTypes.default.func,
  // `src` to a TintableSvg. Optional.
  icon: _propTypes.default.string
}), _temp)) || _class);
exports.default = SimpleRoomHeader;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1NpbXBsZVJvb21IZWFkZXIuanMiXSwibmFtZXMiOlsiQ2FuY2VsQnV0dG9uIiwicHJvcHMiLCJvbkNsaWNrIiwicmVxdWlyZSIsIlNpbXBsZVJvb21IZWFkZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsInJlbmRlciIsImNhbmNlbEJ1dHRvbiIsImljb24iLCJvbkNhbmNlbENsaWNrIiwiVGludGFibGVTdmciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJ0aXRsZSIsIlByb3BUeXBlcyIsInN0cmluZyIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUE7QUFDTyxTQUFTQSxZQUFULENBQXNCQyxLQUF0QixFQUE2QjtBQUNoQyxRQUFNO0FBQUNDLElBQUFBO0FBQUQsTUFBWUQsS0FBbEI7QUFFQSxzQkFDSSw2QkFBQyx5QkFBRDtBQUFrQixJQUFBLFNBQVMsRUFBQyw0QkFBNUI7QUFBeUQsSUFBQSxPQUFPLEVBQUVDO0FBQWxFLGtCQUNJO0FBQUssSUFBQSxHQUFHLEVBQUVDLE9BQU8sQ0FBQyxnQ0FBRCxDQUFqQjtBQUFxRCxJQUFBLFNBQVMsRUFBQyxvQkFBL0Q7QUFDSSxJQUFBLEtBQUssRUFBQyxJQURWO0FBQ2UsSUFBQSxNQUFNLEVBQUMsSUFEdEI7QUFDMkIsSUFBQSxHQUFHLEVBQUUseUJBQUcsUUFBSDtBQURoQyxJQURKLENBREo7QUFNSDtBQUVEO0FBQ0E7QUFDQTtBQUNBOzs7SUFFcUJDLGdCLFdBRHBCLGdEQUFxQiw4QkFBckIsQyxtQ0FBRCxNQUNxQkEsZ0JBRHJCLFNBQzhDQyxlQUFNQyxTQURwRCxDQUM4RDtBQVMxREMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSUMsWUFBSjtBQUNBLFFBQUlDLElBQUo7O0FBQ0EsUUFBSSxLQUFLUixLQUFMLENBQVdTLGFBQWYsRUFBOEI7QUFDMUJGLE1BQUFBLFlBQVksZ0JBQUcsNkJBQUMsWUFBRDtBQUFjLFFBQUEsT0FBTyxFQUFFLEtBQUtQLEtBQUwsQ0FBV1M7QUFBbEMsUUFBZjtBQUNIOztBQUNELFFBQUksS0FBS1QsS0FBTCxDQUFXUSxJQUFmLEVBQXFCO0FBQ2pCLFlBQU1FLFdBQVcsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHNCQUFqQixDQUFwQjtBQUNBSixNQUFBQSxJQUFJLGdCQUFHLDZCQUFDLFdBQUQ7QUFDSCxRQUFBLFNBQVMsRUFBQyxvQkFEUDtBQUM0QixRQUFBLEdBQUcsRUFBRSxLQUFLUixLQUFMLENBQVdRLElBRDVDO0FBRUgsUUFBQSxLQUFLLEVBQUMsSUFGSDtBQUVRLFFBQUEsTUFBTSxFQUFDO0FBRmYsUUFBUDtBQUlIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ01BLElBRE4sRUFFTSxLQUFLUixLQUFMLENBQVdhLEtBRmpCLEVBR01OLFlBSE4sQ0FESixDQURKLENBREo7QUFXSDs7QUFsQ3lELEMsc0RBQ3ZDO0FBQ2ZNLEVBQUFBLEtBQUssRUFBRUMsbUJBQVVDLE1BREY7QUFFZk4sRUFBQUEsYUFBYSxFQUFFSyxtQkFBVUUsSUFGVjtBQUlmO0FBQ0FSLEVBQUFBLElBQUksRUFBRU0sbUJBQVVDO0FBTEQsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8vIGNhbmNlbCBidXR0b24gd2hpY2ggaXMgc2hhcmVkIGJldHdlZW4gcm9vbSBoZWFkZXIgYW5kIHNpbXBsZSByb29tIGhlYWRlclxuZXhwb3J0IGZ1bmN0aW9uIENhbmNlbEJ1dHRvbihwcm9wcykge1xuICAgIGNvbnN0IHtvbkNsaWNrfSA9IHByb3BzO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPSdteF9Sb29tSGVhZGVyX2NhbmNlbEJ1dHRvbicgb25DbGljaz17b25DbGlja30+XG4gICAgICAgICAgICA8aW1nIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvY2FuY2VsLnN2Z1wiKX0gY2xhc3NOYW1lPSdteF9maWx0ZXJGbGlwQ29sb3InXG4gICAgICAgICAgICAgICAgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgYWx0PXtfdChcIkNhbmNlbFwiKX0gLz5cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICk7XG59XG5cbi8qXG4gKiBBIHN0cmlwcGVkLWRvd24gcm9vbSBoZWFkZXIgdXNlZCBmb3IgdGhpbmdzIGxpa2UgdGhlIHVzZXIgc2V0dGluZ3NcbiAqIGFuZCByb29tIGRpcmVjdG9yeS5cbiAqL1xuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Mucm9vbXMuU2ltcGxlUm9vbUhlYWRlclwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2ltcGxlUm9vbUhlYWRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG9uQ2FuY2VsQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIC8vIGBzcmNgIHRvIGEgVGludGFibGVTdmcuIE9wdGlvbmFsLlxuICAgICAgICBpY29uOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBjYW5jZWxCdXR0b247XG4gICAgICAgIGxldCBpY29uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNhbmNlbENsaWNrKSB7XG4gICAgICAgICAgICBjYW5jZWxCdXR0b24gPSA8Q2FuY2VsQnV0dG9uIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DYW5jZWxDbGlja30gLz47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaWNvbikge1xuICAgICAgICAgICAgY29uc3QgVGludGFibGVTdmcgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5UaW50YWJsZVN2ZycpO1xuICAgICAgICAgICAgaWNvbiA9IDxUaW50YWJsZVN2Z1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21IZWFkZXJfaWNvblwiIHNyYz17dGhpcy5wcm9wcy5pY29ufVxuICAgICAgICAgICAgICAgIHdpZHRoPVwiMjVcIiBoZWlnaHQ9XCIyNVwiXG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21IZWFkZXJcIiA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX3dyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX3NpbXBsZUhlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBpY29uIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy50aXRsZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNhbmNlbEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _BaseAvatar = _interopRequireDefault(require("./BaseAvatar"));

var _Media = require("../../../customisations/Media");

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const WidgetAvatar
/*: React.FC<IProps>*/
= (_ref) => {
  let {
    app,
    className,
    width = 20,
    height = 20
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["app", "className", "width", "height"]);
  let iconUrls = [require("../../../../res/img/element-icons/room/default_app.svg")]; // heuristics for some better icons until Widgets support their own icons

  if (app.type.includes("jitsi")) {
    iconUrls = [require("../../../../res/img/element-icons/room/default_video.svg")];
  } else if (app.type.includes("meeting") || app.type.includes("calendar")) {
    iconUrls = [require("../../../../res/img/element-icons/room/default_cal.svg")];
  } else if (app.type.includes("pad") || app.type.includes("doc") || app.type.includes("calc")) {
    iconUrls = [require("../../../../res/img/element-icons/room/default_doc.svg")];
  } else if (app.type.includes("clock")) {
    iconUrls = [require("../../../../res/img/element-icons/room/default_clock.svg")];
  }

  return /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, (0, _extends2.default)({}, props, {
    name: app.id,
    className: (0, _classnames.default)("mx_WidgetAvatar", className) // MSC2765
    ,
    url: app.avatar_url ? (0, _Media.mediaFromMxc)(app.avatar_url).getSquareThumbnailHttp(20) : undefined,
    urls: iconUrls,
    width: width,
    height: height
  }));
};

var _default = WidgetAvatar;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F2YXRhcnMvV2lkZ2V0QXZhdGFyLnRzeCJdLCJuYW1lcyI6WyJXaWRnZXRBdmF0YXIiLCJhcHAiLCJjbGFzc05hbWUiLCJ3aWR0aCIsImhlaWdodCIsInByb3BzIiwiaWNvblVybHMiLCJyZXF1aXJlIiwidHlwZSIsImluY2x1ZGVzIiwiaWQiLCJhdmF0YXJfdXJsIiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsInVuZGVmaW5lZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYUEsTUFBTUE7QUFBOEI7QUFBQSxFQUFHLFVBQTJEO0FBQUEsTUFBMUQ7QUFBRUMsSUFBQUEsR0FBRjtBQUFPQyxJQUFBQSxTQUFQO0FBQWtCQyxJQUFBQSxLQUFLLEdBQUcsRUFBMUI7QUFBOEJDLElBQUFBLE1BQU0sR0FBRztBQUF2QyxHQUEwRDtBQUFBLE1BQVpDLEtBQVk7QUFDOUYsTUFBSUMsUUFBUSxHQUFHLENBQUNDLE9BQU8sQ0FBQyx3REFBRCxDQUFSLENBQWYsQ0FEOEYsQ0FFOUY7O0FBQ0EsTUFBSU4sR0FBRyxDQUFDTyxJQUFKLENBQVNDLFFBQVQsQ0FBa0IsT0FBbEIsQ0FBSixFQUFnQztBQUM1QkgsSUFBQUEsUUFBUSxHQUFHLENBQUNDLE9BQU8sQ0FBQywwREFBRCxDQUFSLENBQVg7QUFDSCxHQUZELE1BRU8sSUFBSU4sR0FBRyxDQUFDTyxJQUFKLENBQVNDLFFBQVQsQ0FBa0IsU0FBbEIsS0FBZ0NSLEdBQUcsQ0FBQ08sSUFBSixDQUFTQyxRQUFULENBQWtCLFVBQWxCLENBQXBDLEVBQW1FO0FBQ3RFSCxJQUFBQSxRQUFRLEdBQUcsQ0FBQ0MsT0FBTyxDQUFDLHdEQUFELENBQVIsQ0FBWDtBQUNILEdBRk0sTUFFQSxJQUFJTixHQUFHLENBQUNPLElBQUosQ0FBU0MsUUFBVCxDQUFrQixLQUFsQixLQUE0QlIsR0FBRyxDQUFDTyxJQUFKLENBQVNDLFFBQVQsQ0FBa0IsS0FBbEIsQ0FBNUIsSUFBd0RSLEdBQUcsQ0FBQ08sSUFBSixDQUFTQyxRQUFULENBQWtCLE1BQWxCLENBQTVELEVBQXVGO0FBQzFGSCxJQUFBQSxRQUFRLEdBQUcsQ0FBQ0MsT0FBTyxDQUFDLHdEQUFELENBQVIsQ0FBWDtBQUNILEdBRk0sTUFFQSxJQUFJTixHQUFHLENBQUNPLElBQUosQ0FBU0MsUUFBVCxDQUFrQixPQUFsQixDQUFKLEVBQWdDO0FBQ25DSCxJQUFBQSxRQUFRLEdBQUcsQ0FBQ0MsT0FBTyxDQUFDLDBEQUFELENBQVIsQ0FBWDtBQUNIOztBQUVELHNCQUNJLDZCQUFDLG1CQUFELDZCQUNRRixLQURSO0FBRUksSUFBQSxJQUFJLEVBQUVKLEdBQUcsQ0FBQ1MsRUFGZDtBQUdJLElBQUEsU0FBUyxFQUFFLHlCQUFXLGlCQUFYLEVBQThCUixTQUE5QixDQUhmLENBSUk7QUFKSjtBQUtJLElBQUEsR0FBRyxFQUFFRCxHQUFHLENBQUNVLFVBQUosR0FBaUIseUJBQWFWLEdBQUcsQ0FBQ1UsVUFBakIsRUFBNkJDLHNCQUE3QixDQUFvRCxFQUFwRCxDQUFqQixHQUEyRUMsU0FMcEY7QUFNSSxJQUFBLElBQUksRUFBRVAsUUFOVjtBQU9JLElBQUEsS0FBSyxFQUFFSCxLQVBYO0FBUUksSUFBQSxNQUFNLEVBQUVDO0FBUlosS0FESjtBQVlILENBekJEOztlQTJCZUosWSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudFByb3BzfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IHtJQXBwfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1dpZGdldFN0b3JlXCI7XG5pbXBvcnQgQmFzZUF2YXRhciwge0Jhc2VBdmF0YXJUeXBlfSBmcm9tIFwiLi9CYXNlQXZhdGFyXCI7XG5pbXBvcnQge21lZGlhRnJvbU14Y30gZnJvbSBcIi4uLy4uLy4uL2N1c3RvbWlzYXRpb25zL01lZGlhXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBPbWl0PENvbXBvbmVudFByb3BzPEJhc2VBdmF0YXJUeXBlPiwgXCJuYW1lXCIgfCBcInVybFwiIHwgXCJ1cmxzXCI+IHtcbiAgICBhcHA6IElBcHA7XG59XG5cbmNvbnN0IFdpZGdldEF2YXRhcjogUmVhY3QuRkM8SVByb3BzPiA9ICh7IGFwcCwgY2xhc3NOYW1lLCB3aWR0aCA9IDIwLCBoZWlnaHQgPSAyMCwgLi4ucHJvcHMgfSkgPT4ge1xuICAgIGxldCBpY29uVXJscyA9IFtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGVtZW50LWljb25zL3Jvb20vZGVmYXVsdF9hcHAuc3ZnXCIpXTtcbiAgICAvLyBoZXVyaXN0aWNzIGZvciBzb21lIGJldHRlciBpY29ucyB1bnRpbCBXaWRnZXRzIHN1cHBvcnQgdGhlaXIgb3duIGljb25zXG4gICAgaWYgKGFwcC50eXBlLmluY2x1ZGVzKFwiaml0c2lcIikpIHtcbiAgICAgICAgaWNvblVybHMgPSBbcmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9yb29tL2RlZmF1bHRfdmlkZW8uc3ZnXCIpXTtcbiAgICB9IGVsc2UgaWYgKGFwcC50eXBlLmluY2x1ZGVzKFwibWVldGluZ1wiKSB8fCBhcHAudHlwZS5pbmNsdWRlcyhcImNhbGVuZGFyXCIpKSB7XG4gICAgICAgIGljb25VcmxzID0gW3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvcm9vbS9kZWZhdWx0X2NhbC5zdmdcIildO1xuICAgIH0gZWxzZSBpZiAoYXBwLnR5cGUuaW5jbHVkZXMoXCJwYWRcIikgfHwgYXBwLnR5cGUuaW5jbHVkZXMoXCJkb2NcIikgfHwgYXBwLnR5cGUuaW5jbHVkZXMoXCJjYWxjXCIpKSB7XG4gICAgICAgIGljb25VcmxzID0gW3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvcm9vbS9kZWZhdWx0X2RvYy5zdmdcIildO1xuICAgIH0gZWxzZSBpZiAoYXBwLnR5cGUuaW5jbHVkZXMoXCJjbG9ja1wiKSkge1xuICAgICAgICBpY29uVXJscyA9IFtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGVtZW50LWljb25zL3Jvb20vZGVmYXVsdF9jbG9jay5zdmdcIildO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICAgIDxCYXNlQXZhdGFyXG4gICAgICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAgICAgICBuYW1lPXthcHAuaWR9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9XaWRnZXRBdmF0YXJcIiwgY2xhc3NOYW1lKX1cbiAgICAgICAgICAgIC8vIE1TQzI3NjVcbiAgICAgICAgICAgIHVybD17YXBwLmF2YXRhcl91cmwgPyBtZWRpYUZyb21NeGMoYXBwLmF2YXRhcl91cmwpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoMjApIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgdXJscz17aWNvblVybHN9XG4gICAgICAgICAgICB3aWR0aD17d2lkdGh9XG4gICAgICAgICAgICBoZWlnaHQ9e2hlaWdodH1cbiAgICAgICAgLz5cbiAgICApXG59O1xuXG5leHBvcnQgZGVmYXVsdCBXaWRnZXRBdmF0YXI7XG4iXX0=
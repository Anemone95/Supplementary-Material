"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IconizedContextMenuOptionList = exports.IconizedContextMenuOption = exports.IconizedContextMenuCheckbox = exports.IconizedContextMenuRadio = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _ContextMenu = require("../../structures/ContextMenu");

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
const IconizedContextMenuRadio
/*: React.FC<IRadioProps>*/
= (_ref) => {
  let {
    label,
    iconClassName,
    active,
    className
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["label", "iconClassName", "active", "className"]);
  return /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItemRadio, (0, _extends2.default)({}, props, {
    className: (0, _classnames.default)(className, {
      mx_IconizedContextMenu_active: active
    }),
    active: active,
    label: label
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _classnames.default)("mx_IconizedContextMenu_icon", iconClassName)
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_label"
  }, label), active && /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_icon mx_IconizedContextMenu_checked"
  }));
};

exports.IconizedContextMenuRadio = IconizedContextMenuRadio;

const IconizedContextMenuCheckbox
/*: React.FC<ICheckboxProps>*/
= (_ref2) => {
  let {
    label,
    iconClassName,
    active,
    className
  } = _ref2,
      props = (0, _objectWithoutProperties2.default)(_ref2, ["label", "iconClassName", "active", "className"]);
  return /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItemCheckbox, (0, _extends2.default)({}, props, {
    className: (0, _classnames.default)(className, {
      mx_IconizedContextMenu_active: active
    }),
    active: active,
    label: label
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _classnames.default)("mx_IconizedContextMenu_icon", iconClassName)
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_label"
  }, label), active && /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_icon mx_IconizedContextMenu_checked"
  }));
};

exports.IconizedContextMenuCheckbox = IconizedContextMenuCheckbox;

const IconizedContextMenuOption
/*: React.FC<IOptionProps>*/
= (_ref3) => {
  let {
    label,
    iconClassName
  } = _ref3,
      props = (0, _objectWithoutProperties2.default)(_ref3, ["label", "iconClassName"]);
  return /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, (0, _extends2.default)({}, props, {
    label: label
  }), iconClassName && /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _classnames.default)("mx_IconizedContextMenu_icon", iconClassName)
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_label"
  }, label));
};

exports.IconizedContextMenuOption = IconizedContextMenuOption;

const IconizedContextMenuOptionList
/*: React.FC<IOptionListProps>*/
= ({
  first,
  red,
  className,
  children
}) => {
  const classes = (0, _classnames.default)("mx_IconizedContextMenu_optionList", className, {
    mx_IconizedContextMenu_optionList_notFirst: !first,
    mx_IconizedContextMenu_optionList_red: red
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: classes
  }, children);
};

exports.IconizedContextMenuOptionList = IconizedContextMenuOptionList;

const IconizedContextMenu
/*: React.FC<IProps>*/
= (_ref4) => {
  let {
    className,
    children,
    compact
  } = _ref4,
      props = (0, _objectWithoutProperties2.default)(_ref4, ["className", "children", "compact"]);
  const classes = (0, _classnames.default)("mx_IconizedContextMenu", className, {
    mx_IconizedContextMenu_compact: compact
  });
  return /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenu, (0, _extends2.default)({
    chevronFace: _ContextMenu.ChevronFace.None
  }, props), /*#__PURE__*/_react.default.createElement("div", {
    className: classes
  }, children));
};

var _default = IconizedContextMenu;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudS50c3giXSwibmFtZXMiOlsiSWNvbml6ZWRDb250ZXh0TWVudVJhZGlvIiwibGFiZWwiLCJpY29uQ2xhc3NOYW1lIiwiYWN0aXZlIiwiY2xhc3NOYW1lIiwicHJvcHMiLCJteF9JY29uaXplZENvbnRleHRNZW51X2FjdGl2ZSIsIkljb25pemVkQ29udGV4dE1lbnVDaGVja2JveCIsIkljb25pemVkQ29udGV4dE1lbnVPcHRpb24iLCJJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCIsImZpcnN0IiwicmVkIiwiY2hpbGRyZW4iLCJjbGFzc2VzIiwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9vcHRpb25MaXN0X25vdEZpcnN0IiwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9vcHRpb25MaXN0X3JlZCIsIkljb25pemVkQ29udGV4dE1lbnUiLCJjb21wYWN0IiwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9jb21wYWN0IiwiQ2hldnJvbkZhY2UiLCJOb25lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFvQ08sTUFBTUE7QUFBK0M7QUFBQSxFQUFHLFVBTXpEO0FBQUEsTUFOMEQ7QUFDNURDLElBQUFBLEtBRDREO0FBRTVEQyxJQUFBQSxhQUY0RDtBQUc1REMsSUFBQUEsTUFINEQ7QUFJNURDLElBQUFBO0FBSjRELEdBTTFEO0FBQUEsTUFEQ0MsS0FDRDtBQUNGLHNCQUFPLDZCQUFDLDBCQUFELDZCQUNDQSxLQUREO0FBRUgsSUFBQSxTQUFTLEVBQUUseUJBQVdELFNBQVgsRUFBc0I7QUFDN0JFLE1BQUFBLDZCQUE2QixFQUFFSDtBQURGLEtBQXRCLENBRlI7QUFLSCxJQUFBLE1BQU0sRUFBRUEsTUFMTDtBQU1ILElBQUEsS0FBSyxFQUFFRjtBQU5KLG1CQVFIO0FBQU0sSUFBQSxTQUFTLEVBQUUseUJBQVcsNkJBQVgsRUFBMENDLGFBQTFDO0FBQWpCLElBUkcsZUFTSDtBQUFNLElBQUEsU0FBUyxFQUFDO0FBQWhCLEtBQWdERCxLQUFoRCxDQVRHLEVBVUZFLE1BQU0saUJBQUk7QUFBTSxJQUFBLFNBQVMsRUFBQztBQUFoQixJQVZSLENBQVA7QUFZSCxDQW5CTTs7OztBQXFCQSxNQUFNSTtBQUFxRDtBQUFBLEVBQUcsV0FNL0Q7QUFBQSxNQU5nRTtBQUNsRU4sSUFBQUEsS0FEa0U7QUFFbEVDLElBQUFBLGFBRmtFO0FBR2xFQyxJQUFBQSxNQUhrRTtBQUlsRUMsSUFBQUE7QUFKa0UsR0FNaEU7QUFBQSxNQURDQyxLQUNEO0FBQ0Ysc0JBQU8sNkJBQUMsNkJBQUQsNkJBQ0NBLEtBREQ7QUFFSCxJQUFBLFNBQVMsRUFBRSx5QkFBV0QsU0FBWCxFQUFzQjtBQUM3QkUsTUFBQUEsNkJBQTZCLEVBQUVIO0FBREYsS0FBdEIsQ0FGUjtBQUtILElBQUEsTUFBTSxFQUFFQSxNQUxMO0FBTUgsSUFBQSxLQUFLLEVBQUVGO0FBTkosbUJBUUg7QUFBTSxJQUFBLFNBQVMsRUFBRSx5QkFBVyw2QkFBWCxFQUEwQ0MsYUFBMUM7QUFBakIsSUFSRyxlQVNIO0FBQU0sSUFBQSxTQUFTLEVBQUM7QUFBaEIsS0FBZ0RELEtBQWhELENBVEcsRUFVRkUsTUFBTSxpQkFBSTtBQUFNLElBQUEsU0FBUyxFQUFDO0FBQWhCLElBVlIsQ0FBUDtBQVlILENBbkJNOzs7O0FBcUJBLE1BQU1LO0FBQWlEO0FBQUEsRUFBRyxXQUFzQztBQUFBLE1BQXJDO0FBQUNQLElBQUFBLEtBQUQ7QUFBUUMsSUFBQUE7QUFBUixHQUFxQztBQUFBLE1BQVhHLEtBQVc7QUFDbkcsc0JBQU8sNkJBQUMscUJBQUQsNkJBQWNBLEtBQWQ7QUFBcUIsSUFBQSxLQUFLLEVBQUVKO0FBQTVCLE1BQ0RDLGFBQWEsaUJBQUk7QUFBTSxJQUFBLFNBQVMsRUFBRSx5QkFBVyw2QkFBWCxFQUEwQ0EsYUFBMUM7QUFBakIsSUFEaEIsZUFFSDtBQUFNLElBQUEsU0FBUyxFQUFDO0FBQWhCLEtBQWdERCxLQUFoRCxDQUZHLENBQVA7QUFJSCxDQUxNOzs7O0FBT0EsTUFBTVE7QUFBeUQ7QUFBQSxFQUFHLENBQUM7QUFBQ0MsRUFBQUEsS0FBRDtBQUFRQyxFQUFBQSxHQUFSO0FBQWFQLEVBQUFBLFNBQWI7QUFBd0JRLEVBQUFBO0FBQXhCLENBQUQsS0FBdUM7QUFDNUcsUUFBTUMsT0FBTyxHQUFHLHlCQUFXLG1DQUFYLEVBQWdEVCxTQUFoRCxFQUEyRDtBQUN2RVUsSUFBQUEsMENBQTBDLEVBQUUsQ0FBQ0osS0FEMEI7QUFFdkVLLElBQUFBLHFDQUFxQyxFQUFFSjtBQUZnQyxHQUEzRCxDQUFoQjtBQUtBLHNCQUFPO0FBQUssSUFBQSxTQUFTLEVBQUVFO0FBQWhCLEtBQ0ZELFFBREUsQ0FBUDtBQUdILENBVE07Ozs7QUFXUCxNQUFNSTtBQUFxQztBQUFBLEVBQUcsV0FBOEM7QUFBQSxNQUE3QztBQUFDWixJQUFBQSxTQUFEO0FBQVlRLElBQUFBLFFBQVo7QUFBc0JLLElBQUFBO0FBQXRCLEdBQTZDO0FBQUEsTUFBWFosS0FBVztBQUN4RixRQUFNUSxPQUFPLEdBQUcseUJBQVcsd0JBQVgsRUFBcUNULFNBQXJDLEVBQWdEO0FBQzVEYyxJQUFBQSw4QkFBOEIsRUFBRUQ7QUFENEIsR0FBaEQsQ0FBaEI7QUFJQSxzQkFBTyw2QkFBQyx3QkFBRDtBQUFhLElBQUEsV0FBVyxFQUFFRSx5QkFBWUM7QUFBdEMsS0FBZ0RmLEtBQWhELGdCQUNIO0FBQUssSUFBQSxTQUFTLEVBQUVRO0FBQWhCLEtBQ01ELFFBRE4sQ0FERyxDQUFQO0FBS0gsQ0FWRDs7ZUFZZUksbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG5pbXBvcnQge1xuICAgIENoZXZyb25GYWNlLFxuICAgIENvbnRleHRNZW51LFxuICAgIElQcm9wcyBhcyBJQ29udGV4dE1lbnVQcm9wcyxcbiAgICBNZW51SXRlbSxcbiAgICBNZW51SXRlbUNoZWNrYm94LCBNZW51SXRlbVJhZGlvLFxufSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSUNvbnRleHRNZW51UHJvcHMge1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBjb21wYWN0PzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElPcHRpb25MaXN0UHJvcHMge1xuICAgIGZpcnN0PzogYm9vbGVhbjtcbiAgICByZWQ/OiBib29sZWFuO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElPcHRpb25Qcm9wcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBNZW51SXRlbT4ge1xuICAgIGljb25DbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJQ2hlY2tib3hQcm9wcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBNZW51SXRlbUNoZWNrYm94PiB7XG4gICAgaWNvbkNsYXNzTmFtZTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVJhZGlvUHJvcHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgTWVudUl0ZW1SYWRpbz4ge1xuICAgIGljb25DbGFzc05hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IEljb25pemVkQ29udGV4dE1lbnVSYWRpbzogUmVhY3QuRkM8SVJhZGlvUHJvcHM+ID0gKHtcbiAgICBsYWJlbCxcbiAgICBpY29uQ2xhc3NOYW1lLFxuICAgIGFjdGl2ZSxcbiAgICBjbGFzc05hbWUsXG4gICAgLi4ucHJvcHNcbn0pID0+IHtcbiAgICByZXR1cm4gPE1lbnVJdGVtUmFkaW9cbiAgICAgICAgey4uLnByb3BzfVxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoY2xhc3NOYW1lLCB7XG4gICAgICAgICAgICBteF9JY29uaXplZENvbnRleHRNZW51X2FjdGl2ZTogYWN0aXZlLFxuICAgICAgICB9KX1cbiAgICAgICAgYWN0aXZlPXthY3RpdmV9XG4gICAgICAgIGxhYmVsPXtsYWJlbH1cbiAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0ljb25pemVkQ29udGV4dE1lbnVfaWNvblwiLCBpY29uQ2xhc3NOYW1lKX0gLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9sYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgICAgIHthY3RpdmUgJiYgPHNwYW4gY2xhc3NOYW1lPVwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9pY29uIG14X0ljb25pemVkQ29udGV4dE1lbnVfY2hlY2tlZFwiIC8+fVxuICAgIDwvTWVudUl0ZW1SYWRpbz47XG59O1xuXG5leHBvcnQgY29uc3QgSWNvbml6ZWRDb250ZXh0TWVudUNoZWNrYm94OiBSZWFjdC5GQzxJQ2hlY2tib3hQcm9wcz4gPSAoe1xuICAgIGxhYmVsLFxuICAgIGljb25DbGFzc05hbWUsXG4gICAgYWN0aXZlLFxuICAgIGNsYXNzTmFtZSxcbiAgICAuLi5wcm9wc1xufSkgPT4ge1xuICAgIHJldHVybiA8TWVudUl0ZW1DaGVja2JveFxuICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhjbGFzc05hbWUsIHtcbiAgICAgICAgICAgIG14X0ljb25pemVkQ29udGV4dE1lbnVfYWN0aXZlOiBhY3RpdmUsXG4gICAgICAgIH0pfVxuICAgICAgICBhY3RpdmU9e2FjdGl2ZX1cbiAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9pY29uXCIsIGljb25DbGFzc05hbWUpfSAvPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9JY29uaXplZENvbnRleHRNZW51X2xhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cbiAgICAgICAge2FjdGl2ZSAmJiA8c3BhbiBjbGFzc05hbWU9XCJteF9JY29uaXplZENvbnRleHRNZW51X2ljb24gbXhfSWNvbml6ZWRDb250ZXh0TWVudV9jaGVja2VkXCIgLz59XG4gICAgPC9NZW51SXRlbUNoZWNrYm94Pjtcbn07XG5cbmV4cG9ydCBjb25zdCBJY29uaXplZENvbnRleHRNZW51T3B0aW9uOiBSZWFjdC5GQzxJT3B0aW9uUHJvcHM+ID0gKHtsYWJlbCwgaWNvbkNsYXNzTmFtZSwgLi4ucHJvcHN9KSA9PiB7XG4gICAgcmV0dXJuIDxNZW51SXRlbSB7Li4ucHJvcHN9IGxhYmVsPXtsYWJlbH0+XG4gICAgICAgIHsgaWNvbkNsYXNzTmFtZSAmJiA8c3BhbiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9JY29uaXplZENvbnRleHRNZW51X2ljb25cIiwgaWNvbkNsYXNzTmFtZSl9IC8+IH1cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9sYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgPC9NZW51SXRlbT47XG59O1xuXG5leHBvcnQgY29uc3QgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q6IFJlYWN0LkZDPElPcHRpb25MaXN0UHJvcHM+ID0gKHtmaXJzdCwgcmVkLCBjbGFzc05hbWUsIGNoaWxkcmVufSkgPT4ge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9vcHRpb25MaXN0XCIsIGNsYXNzTmFtZSwge1xuICAgICAgICBteF9JY29uaXplZENvbnRleHRNZW51X29wdGlvbkxpc3Rfbm90Rmlyc3Q6ICFmaXJzdCxcbiAgICAgICAgbXhfSWNvbml6ZWRDb250ZXh0TWVudV9vcHRpb25MaXN0X3JlZDogcmVkLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2Pjtcbn07XG5cbmNvbnN0IEljb25pemVkQ29udGV4dE1lbnU6IFJlYWN0LkZDPElQcm9wcz4gPSAoe2NsYXNzTmFtZSwgY2hpbGRyZW4sIGNvbXBhY3QsIC4uLnByb3BzfSkgPT4ge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfSWNvbml6ZWRDb250ZXh0TWVudVwiLCBjbGFzc05hbWUsIHtcbiAgICAgICAgbXhfSWNvbml6ZWRDb250ZXh0TWVudV9jb21wYWN0OiBjb21wYWN0LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIDxDb250ZXh0TWVudSBjaGV2cm9uRmFjZT17Q2hldnJvbkZhY2UuTm9uZX0gey4uLnByb3BzfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgIDwvZGl2PlxuICAgIDwvQ29udGV4dE1lbnU+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSWNvbml6ZWRDb250ZXh0TWVudTtcblxuIl19
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var sdk = _interopRequireWildcard(require("../../../index"));

/*
Copyright 2019 New Vector Ltd
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
// Controlled Toggle Switch element, written with Accessibility in mind
var _default = (_ref) => {
  let {
    checked,
    disabled = false,
    onChange
  }
  /*: IProps*/
  = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["checked", "disabled", "onChange"]);

  const _onClick = () => {
    if (disabled) return;
    onChange(!checked);
  };

  const classes = (0, _classnames.default)({
    "mx_ToggleSwitch": true,
    "mx_ToggleSwitch_on": checked,
    "mx_ToggleSwitch_enabled": !disabled
  });
  const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
  return /*#__PURE__*/_react.default.createElement(AccessibleButton, (0, _extends2.default)({}, props, {
    className: classes,
    onClick: _onClick,
    role: "switch",
    "aria-checked": checked,
    "aria-disabled": disabled
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ToggleSwitch_ball"
  }));
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1RvZ2dsZVN3aXRjaC50c3giXSwibmFtZXMiOlsiY2hlY2tlZCIsImRpc2FibGVkIiwib25DaGFuZ2UiLCJwcm9wcyIsIl9vbkNsaWNrIiwiY2xhc3NlcyIsIkFjY2Vzc2libGVCdXR0b24iLCJzZGsiLCJnZXRDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQkE7ZUFDZSxVQUE2RDtBQUFBLE1BQTVEO0FBQUNBLElBQUFBLE9BQUQ7QUFBVUMsSUFBQUEsUUFBUSxHQUFHLEtBQXJCO0FBQTRCQyxJQUFBQTtBQUE1QjtBQUE0RDtBQUFBO0FBQUEsTUFBbkJDLEtBQW1COztBQUN4RSxRQUFNQyxRQUFRLEdBQUcsTUFBTTtBQUNuQixRQUFJSCxRQUFKLEVBQWM7QUFDZEMsSUFBQUEsUUFBUSxDQUFDLENBQUNGLE9BQUYsQ0FBUjtBQUNILEdBSEQ7O0FBS0EsUUFBTUssT0FBTyxHQUFHLHlCQUFXO0FBQ3ZCLHVCQUFtQixJQURJO0FBRXZCLDBCQUFzQkwsT0FGQztBQUd2QiwrQkFBMkIsQ0FBQ0M7QUFITCxHQUFYLENBQWhCO0FBTUEsUUFBTUssZ0JBQWdCLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwyQkFBakIsQ0FBekI7QUFDQSxzQkFDSSw2QkFBQyxnQkFBRCw2QkFBc0JMLEtBQXRCO0FBQ0ksSUFBQSxTQUFTLEVBQUVFLE9BRGY7QUFFSSxJQUFBLE9BQU8sRUFBRUQsUUFGYjtBQUdJLElBQUEsSUFBSSxFQUFDLFFBSFQ7QUFJSSxvQkFBY0osT0FKbEI7QUFLSSxxQkFBZUM7QUFMbkIsbUJBT0k7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLElBUEosQ0FESjtBQVdILEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vaW5kZXhcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLy8gV2hldGhlciBvciBub3QgdGhpcyB0b2dnbGUgaXMgaW4gdGhlICdvbicgcG9zaXRpb24uXG4gICAgY2hlY2tlZDogYm9vbGVhbjtcblxuICAgIC8vIFdoZXRoZXIgb3Igbm90IHRoZSB1c2VyIGNhbiBpbnRlcmFjdCB3aXRoIHRoZSBzd2l0Y2hcbiAgICBkaXNhYmxlZDogYm9vbGVhbjtcblxuICAgIC8vIENhbGxlZCB3aGVuIHRoZSBjaGVja2VkIHN0YXRlIGNoYW5nZXMuIEZpcnN0IGFyZ3VtZW50IHdpbGwgYmUgdGhlIG5ldyBzdGF0ZS5cbiAgICBvbkNoYW5nZShjaGVja2VkOiBib29sZWFuKTogdm9pZDtcbn1cblxuLy8gQ29udHJvbGxlZCBUb2dnbGUgU3dpdGNoIGVsZW1lbnQsIHdyaXR0ZW4gd2l0aCBBY2Nlc3NpYmlsaXR5IGluIG1pbmRcbmV4cG9ydCBkZWZhdWx0ICh7Y2hlY2tlZCwgZGlzYWJsZWQgPSBmYWxzZSwgb25DaGFuZ2UsIC4uLnByb3BzfTogSVByb3BzKSA9PiB7XG4gICAgY29uc3QgX29uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmIChkaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICBvbkNoYW5nZSghY2hlY2tlZCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgXCJteF9Ub2dnbGVTd2l0Y2hcIjogdHJ1ZSxcbiAgICAgICAgXCJteF9Ub2dnbGVTd2l0Y2hfb25cIjogY2hlY2tlZCxcbiAgICAgICAgXCJteF9Ub2dnbGVTd2l0Y2hfZW5hYmxlZFwiOiAhZGlzYWJsZWQsXG4gICAgfSk7XG5cbiAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkFjY2Vzc2libGVCdXR0b25cIik7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gey4uLnByb3BzfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgb25DbGljaz17X29uQ2xpY2t9XG4gICAgICAgICAgICByb2xlPVwic3dpdGNoXCJcbiAgICAgICAgICAgIGFyaWEtY2hlY2tlZD17Y2hlY2tlZH1cbiAgICAgICAgICAgIGFyaWEtZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1RvZ2dsZVN3aXRjaF9iYWxsXCIgLz5cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICk7XG59O1xuIl19
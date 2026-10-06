"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StyledMenuItemCheckbox = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _Keyboard = require("../../Keyboard");

var _StyledCheckbox = _interopRequireDefault(require("../../components/views/elements/StyledCheckbox"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
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
// Semantic component for representing a styled role=menuitemcheckbox
const StyledMenuItemCheckbox
/*: React.FC<IProps>*/
= (_ref) => {
  let {
    children,
    label,
    onChange,
    onClose
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["children", "label", "onChange", "onClose"]);

  const onKeyDown = (e
  /*: React.KeyboardEvent*/
  ) => {
    if (e.key === _Keyboard.Key.ENTER || e.key === _Keyboard.Key.SPACE) {
      e.stopPropagation();
      e.preventDefault();
      onChange(); // Implements https://www.w3.org/TR/wai-aria-practices/#keyboard-interaction-12

      if (e.key === _Keyboard.Key.ENTER) {
        onClose();
      }
    }
  };

  const onKeyUp = (e
  /*: React.KeyboardEvent*/
  ) => {
    // prevent the input default handler as we handle it on keydown to match
    // https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-2/menubar-2.html
    if (e.key === _Keyboard.Key.SPACE || e.key === _Keyboard.Key.ENTER) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, (0, _extends2.default)({}, props, {
    role: "menuitemcheckbox",
    tabIndex: -1,
    "aria-label": label,
    onChange: onChange,
    onKeyDown: onKeyDown,
    onKeyUp: onKeyUp
  }), children);
};

exports.StyledMenuItemCheckbox = StyledMenuItemCheckbox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9TdHlsZWRNZW51SXRlbUNoZWNrYm94LnRzeCJdLCJuYW1lcyI6WyJTdHlsZWRNZW51SXRlbUNoZWNrYm94IiwiY2hpbGRyZW4iLCJsYWJlbCIsIm9uQ2hhbmdlIiwib25DbG9zZSIsInByb3BzIiwib25LZXlEb3duIiwiZSIsImtleSIsIktleSIsIkVOVEVSIiwiU1BBQ0UiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIm9uS2V5VXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBRUE7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFhQTtBQUNPLE1BQU1BO0FBQXdDO0FBQUEsRUFBRyxVQUFvRDtBQUFBLE1BQW5EO0FBQUNDLElBQUFBLFFBQUQ7QUFBV0MsSUFBQUEsS0FBWDtBQUFrQkMsSUFBQUEsUUFBbEI7QUFBNEJDLElBQUFBO0FBQTVCLEdBQW1EO0FBQUEsTUFBWEMsS0FBVzs7QUFDeEcsUUFBTUMsU0FBUyxHQUFHLENBQUNDO0FBQUQ7QUFBQSxPQUE0QjtBQUMxQyxRQUFJQSxDQUFDLENBQUNDLEdBQUYsS0FBVUMsY0FBSUMsS0FBZCxJQUF1QkgsQ0FBQyxDQUFDQyxHQUFGLEtBQVVDLGNBQUlFLEtBQXpDLEVBQWdEO0FBQzVDSixNQUFBQSxDQUFDLENBQUNLLGVBQUY7QUFDQUwsTUFBQUEsQ0FBQyxDQUFDTSxjQUFGO0FBQ0FWLE1BQUFBLFFBQVEsR0FIb0MsQ0FJNUM7O0FBQ0EsVUFBSUksQ0FBQyxDQUFDQyxHQUFGLEtBQVVDLGNBQUlDLEtBQWxCLEVBQXlCO0FBQ3JCTixRQUFBQSxPQUFPO0FBQ1Y7QUFDSjtBQUNKLEdBVkQ7O0FBV0EsUUFBTVUsT0FBTyxHQUFHLENBQUNQO0FBQUQ7QUFBQSxPQUE0QjtBQUN4QztBQUNBO0FBQ0EsUUFBSUEsQ0FBQyxDQUFDQyxHQUFGLEtBQVVDLGNBQUlFLEtBQWQsSUFBdUJKLENBQUMsQ0FBQ0MsR0FBRixLQUFVQyxjQUFJQyxLQUF6QyxFQUFnRDtBQUM1Q0gsTUFBQUEsQ0FBQyxDQUFDSyxlQUFGO0FBQ0FMLE1BQUFBLENBQUMsQ0FBQ00sY0FBRjtBQUNIO0FBQ0osR0FQRDs7QUFRQSxzQkFDSSw2QkFBQyx1QkFBRCw2QkFDUVIsS0FEUjtBQUVJLElBQUEsSUFBSSxFQUFDLGtCQUZUO0FBR0ksSUFBQSxRQUFRLEVBQUUsQ0FBQyxDQUhmO0FBSUksa0JBQVlILEtBSmhCO0FBS0ksSUFBQSxRQUFRLEVBQUVDLFFBTGQ7QUFNSSxJQUFBLFNBQVMsRUFBRUcsU0FOZjtBQU9JLElBQUEsT0FBTyxFQUFFUTtBQVBiLE1BU01iLFFBVE4sQ0FESjtBQWFILENBakNNIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7S2V5fSBmcm9tIFwiLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9TdHlsZWRDaGVja2JveFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIFN0eWxlZENoZWNrYm94PiB7XG4gICAgbGFiZWw/OiBzdHJpbmc7XG4gICAgb25DaGFuZ2UoKTsgLy8gd2UgaGFuZGxlIGtleXVwL2Rvd24gb3Vyc2VsdmVzIHNvIGxvc2UgdGhlIENoYW5nZUV2ZW50XG4gICAgb25DbG9zZSgpOiB2b2lkOyAvLyBnZXRzIGNhbGxlZCBhZnRlciBvbkNoYW5nZSBvbiBLZXkuRU5URVJcbn1cblxuLy8gU2VtYW50aWMgY29tcG9uZW50IGZvciByZXByZXNlbnRpbmcgYSBzdHlsZWQgcm9sZT1tZW51aXRlbWNoZWNrYm94XG5leHBvcnQgY29uc3QgU3R5bGVkTWVudUl0ZW1DaGVja2JveDogUmVhY3QuRkM8SVByb3BzPiA9ICh7Y2hpbGRyZW4sIGxhYmVsLCBvbkNoYW5nZSwgb25DbG9zZSwgLi4ucHJvcHN9KSA9PiB7XG4gICAgY29uc3Qgb25LZXlEb3duID0gKGU6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGUua2V5ID09PSBLZXkuRU5URVIgfHwgZS5rZXkgPT09IEtleS5TUEFDRSkge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIG9uQ2hhbmdlKCk7XG4gICAgICAgICAgICAvLyBJbXBsZW1lbnRzIGh0dHBzOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS1wcmFjdGljZXMvI2tleWJvYXJkLWludGVyYWN0aW9uLTEyXG4gICAgICAgICAgICBpZiAoZS5rZXkgPT09IEtleS5FTlRFUikge1xuICAgICAgICAgICAgICAgIG9uQ2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgb25LZXlVcCA9IChlOiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIC8vIHByZXZlbnQgdGhlIGlucHV0IGRlZmF1bHQgaGFuZGxlciBhcyB3ZSBoYW5kbGUgaXQgb24ga2V5ZG93biB0byBtYXRjaFxuICAgICAgICAvLyBodHRwczovL3d3dy53My5vcmcvVFIvd2FpLWFyaWEtcHJhY3RpY2VzL2V4YW1wbGVzL21lbnViYXIvbWVudWJhci0yL21lbnViYXItMi5odG1sXG4gICAgICAgIGlmIChlLmtleSA9PT0gS2V5LlNQQUNFIHx8IGUua2V5ID09PSBLZXkuRU5URVIpIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiAoXG4gICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgcm9sZT1cIm1lbnVpdGVtY2hlY2tib3hcIlxuICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICAgICAgICBvbkNoYW5nZT17b25DaGFuZ2V9XG4gICAgICAgICAgICBvbktleURvd249e29uS2V5RG93bn1cbiAgICAgICAgICAgIG9uS2V5VXA9e29uS2V5VXB9XG4gICAgICAgID5cbiAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICk7XG59O1xuIl19
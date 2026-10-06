"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StyledMenuItemRadio = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _Keyboard = require("../../Keyboard");

var _StyledRadioButton = _interopRequireDefault(require("../../components/views/elements/StyledRadioButton"));

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
// Semantic component for representing a styled role=menuitemradio
const StyledMenuItemRadio
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

  return /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, (0, _extends2.default)({}, props, {
    role: "menuitemradio",
    tabIndex: -1,
    "aria-label": label,
    onChange: onChange,
    onKeyDown: onKeyDown,
    onKeyUp: onKeyUp
  }), children);
};

exports.StyledMenuItemRadio = StyledMenuItemRadio;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9TdHlsZWRNZW51SXRlbVJhZGlvLnRzeCJdLCJuYW1lcyI6WyJTdHlsZWRNZW51SXRlbVJhZGlvIiwiY2hpbGRyZW4iLCJsYWJlbCIsIm9uQ2hhbmdlIiwib25DbG9zZSIsInByb3BzIiwib25LZXlEb3duIiwiZSIsImtleSIsIktleSIsIkVOVEVSIiwiU1BBQ0UiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIm9uS2V5VXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBRUE7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFhQTtBQUNPLE1BQU1BO0FBQXFDO0FBQUEsRUFBRyxVQUFvRDtBQUFBLE1BQW5EO0FBQUNDLElBQUFBLFFBQUQ7QUFBV0MsSUFBQUEsS0FBWDtBQUFrQkMsSUFBQUEsUUFBbEI7QUFBNEJDLElBQUFBO0FBQTVCLEdBQW1EO0FBQUEsTUFBWEMsS0FBVzs7QUFDckcsUUFBTUMsU0FBUyxHQUFHLENBQUNDO0FBQUQ7QUFBQSxPQUE0QjtBQUMxQyxRQUFJQSxDQUFDLENBQUNDLEdBQUYsS0FBVUMsY0FBSUMsS0FBZCxJQUF1QkgsQ0FBQyxDQUFDQyxHQUFGLEtBQVVDLGNBQUlFLEtBQXpDLEVBQWdEO0FBQzVDSixNQUFBQSxDQUFDLENBQUNLLGVBQUY7QUFDQUwsTUFBQUEsQ0FBQyxDQUFDTSxjQUFGO0FBQ0FWLE1BQUFBLFFBQVEsR0FIb0MsQ0FJNUM7O0FBQ0EsVUFBSUksQ0FBQyxDQUFDQyxHQUFGLEtBQVVDLGNBQUlDLEtBQWxCLEVBQXlCO0FBQ3JCTixRQUFBQSxPQUFPO0FBQ1Y7QUFDSjtBQUNKLEdBVkQ7O0FBV0EsUUFBTVUsT0FBTyxHQUFHLENBQUNQO0FBQUQ7QUFBQSxPQUE0QjtBQUN4QztBQUNBO0FBQ0EsUUFBSUEsQ0FBQyxDQUFDQyxHQUFGLEtBQVVDLGNBQUlFLEtBQWQsSUFBdUJKLENBQUMsQ0FBQ0MsR0FBRixLQUFVQyxjQUFJQyxLQUF6QyxFQUFnRDtBQUM1Q0gsTUFBQUEsQ0FBQyxDQUFDSyxlQUFGO0FBQ0FMLE1BQUFBLENBQUMsQ0FBQ00sY0FBRjtBQUNIO0FBQ0osR0FQRDs7QUFRQSxzQkFDSSw2QkFBQywwQkFBRCw2QkFDUVIsS0FEUjtBQUVJLElBQUEsSUFBSSxFQUFDLGVBRlQ7QUFHSSxJQUFBLFFBQVEsRUFBRSxDQUFDLENBSGY7QUFJSSxrQkFBWUgsS0FKaEI7QUFLSSxJQUFBLFFBQVEsRUFBRUMsUUFMZDtBQU1JLElBQUEsU0FBUyxFQUFFRyxTQU5mO0FBT0ksSUFBQSxPQUFPLEVBQUVRO0FBUGIsTUFTTWIsUUFUTixDQURKO0FBYUgsQ0FqQ00iLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHtLZXl9IGZyb20gXCIuLi8uLi9LZXlib2FyZFwiO1xuaW1wb3J0IFN0eWxlZFJhZGlvQnV0dG9uIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1N0eWxlZFJhZGlvQnV0dG9uXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgU3R5bGVkUmFkaW9CdXR0b24+IHtcbiAgICBsYWJlbD86IHN0cmluZztcbiAgICBvbkNoYW5nZSgpOyAvLyB3ZSBoYW5kbGUga2V5dXAvZG93biBvdXJzZWx2ZXMgc28gbG9zZSB0aGUgQ2hhbmdlRXZlbnRcbiAgICBvbkNsb3NlKCk6IHZvaWQ7IC8vIGdldHMgY2FsbGVkIGFmdGVyIG9uQ2hhbmdlIG9uIEtleS5FTlRFUlxufVxuXG4vLyBTZW1hbnRpYyBjb21wb25lbnQgZm9yIHJlcHJlc2VudGluZyBhIHN0eWxlZCByb2xlPW1lbnVpdGVtcmFkaW9cbmV4cG9ydCBjb25zdCBTdHlsZWRNZW51SXRlbVJhZGlvOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHtjaGlsZHJlbiwgbGFiZWwsIG9uQ2hhbmdlLCBvbkNsb3NlLCAuLi5wcm9wc30pID0+IHtcbiAgICBjb25zdCBvbktleURvd24gPSAoZTogUmVhY3QuS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZS5rZXkgPT09IEtleS5FTlRFUiB8fCBlLmtleSA9PT0gS2V5LlNQQUNFKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgb25DaGFuZ2UoKTtcbiAgICAgICAgICAgIC8vIEltcGxlbWVudHMgaHR0cHM6Ly93d3cudzMub3JnL1RSL3dhaS1hcmlhLXByYWN0aWNlcy8ja2V5Ym9hcmQtaW50ZXJhY3Rpb24tMTJcbiAgICAgICAgICAgIGlmIChlLmtleSA9PT0gS2V5LkVOVEVSKSB7XG4gICAgICAgICAgICAgICAgb25DbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBvbktleVVwID0gKGU6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgLy8gcHJldmVudCB0aGUgaW5wdXQgZGVmYXVsdCBoYW5kbGVyIGFzIHdlIGhhbmRsZSBpdCBvbiBrZXlkb3duIHRvIG1hdGNoXG4gICAgICAgIC8vIGh0dHBzOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS1wcmFjdGljZXMvZXhhbXBsZXMvbWVudWJhci9tZW51YmFyLTIvbWVudWJhci0yLmh0bWxcbiAgICAgICAgaWYgKGUua2V5ID09PSBLZXkuU1BBQ0UgfHwgZS5rZXkgPT09IEtleS5FTlRFUikge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIChcbiAgICAgICAgPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAgICAgICByb2xlPVwibWVudWl0ZW1yYWRpb1wiXG4gICAgICAgICAgICB0YWJJbmRleD17LTF9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtsYWJlbH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZX1cbiAgICAgICAgICAgIG9uS2V5RG93bj17b25LZXlEb3dufVxuICAgICAgICAgICAgb25LZXlVcD17b25LZXlVcH1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgIDwvU3R5bGVkUmFkaW9CdXR0b24+XG4gICAgKTtcbn07XG4iXX0=
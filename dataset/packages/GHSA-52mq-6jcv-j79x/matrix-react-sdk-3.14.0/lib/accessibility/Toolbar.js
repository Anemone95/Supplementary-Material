"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _RovingTabIndex = require("./RovingTabIndex");

var _Keyboard = require("../Keyboard");

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
// This component implements the Toolbar design pattern from the WAI-ARIA Authoring Practices guidelines.
// https://www.w3.org/TR/wai-aria-practices-1.1/#toolbar
// All buttons passed in children must use RovingTabIndex to set `onFocus`, `isActive`, `ref`
const Toolbar
/*: React.FC<IProps>*/
= (_ref) => {
  let {
    children
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["children"]);

  const onKeyDown = (ev
  /*: React.KeyboardEvent*/
  , state
  /*: IState*/
  ) => {
    const target = ev.target; // Don't interfere with input default keydown behaviour

    if (target.tagName === "INPUT") return;
    let handled = true; // HOME and END are handled by RovingTabIndexProvider

    switch (ev.key) {
      case _Keyboard.Key.ARROW_UP:
      case _Keyboard.Key.ARROW_DOWN:
        if (target.hasAttribute('aria-haspopup')) {
          target.click();
        }

        break;

      case _Keyboard.Key.ARROW_LEFT:
      case _Keyboard.Key.ARROW_RIGHT:
        if (state.refs.length > 0) {
          const i = state.refs.findIndex(r => r === state.activeRef);
          const delta = ev.key === _Keyboard.Key.ARROW_RIGHT ? 1 : -1;
          state.refs.slice((i + delta) % state.refs.length)[0].current.focus();
        }

        break;

      default:
        handled = false;
    }

    if (handled) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  };

  return /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingTabIndexProvider, {
    handleHomeEnd: true,
    onKeyDown: onKeyDown
  }, ({
    onKeyDownHandler
  }) => /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, props, {
    onKeyDown: onKeyDownHandler,
    role: "toolbar"
  }), children));
};

var _default = Toolbar;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L1Rvb2xiYXIudHN4Il0sIm5hbWVzIjpbIlRvb2xiYXIiLCJjaGlsZHJlbiIsInByb3BzIiwib25LZXlEb3duIiwiZXYiLCJzdGF0ZSIsInRhcmdldCIsInRhZ05hbWUiLCJoYW5kbGVkIiwia2V5IiwiS2V5IiwiQVJST1dfVVAiLCJBUlJPV19ET1dOIiwiaGFzQXR0cmlidXRlIiwiY2xpY2siLCJBUlJPV19MRUZUIiwiQVJST1dfUklHSFQiLCJyZWZzIiwibGVuZ3RoIiwiaSIsImZpbmRJbmRleCIsInIiLCJhY3RpdmVSZWYiLCJkZWx0YSIsInNsaWNlIiwiY3VycmVudCIsImZvY3VzIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJvbktleURvd25IYW5kbGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQTtBQUF5QjtBQUFBLEVBQUcsVUFBMEI7QUFBQSxNQUF6QjtBQUFDQyxJQUFBQTtBQUFELEdBQXlCO0FBQUEsTUFBWEMsS0FBVzs7QUFDeEQsUUFBTUMsU0FBUyxHQUFHLENBQUNDO0FBQUQ7QUFBQSxJQUEwQkM7QUFBMUI7QUFBQSxPQUE0QztBQUMxRCxVQUFNQyxNQUFNLEdBQUdGLEVBQUUsQ0FBQ0UsTUFBbEIsQ0FEMEQsQ0FFMUQ7O0FBQ0EsUUFBSUEsTUFBTSxDQUFDQyxPQUFQLEtBQW1CLE9BQXZCLEVBQWdDO0FBRWhDLFFBQUlDLE9BQU8sR0FBRyxJQUFkLENBTDBELENBTzFEOztBQUNBLFlBQVFKLEVBQUUsQ0FBQ0ssR0FBWDtBQUNJLFdBQUtDLGNBQUlDLFFBQVQ7QUFDQSxXQUFLRCxjQUFJRSxVQUFUO0FBQ0ksWUFBSU4sTUFBTSxDQUFDTyxZQUFQLENBQW9CLGVBQXBCLENBQUosRUFBMEM7QUFDdENQLFVBQUFBLE1BQU0sQ0FBQ1EsS0FBUDtBQUNIOztBQUNEOztBQUVKLFdBQUtKLGNBQUlLLFVBQVQ7QUFDQSxXQUFLTCxjQUFJTSxXQUFUO0FBQ0ksWUFBSVgsS0FBSyxDQUFDWSxJQUFOLENBQVdDLE1BQVgsR0FBb0IsQ0FBeEIsRUFBMkI7QUFDdkIsZ0JBQU1DLENBQUMsR0FBR2QsS0FBSyxDQUFDWSxJQUFOLENBQVdHLFNBQVgsQ0FBcUJDLENBQUMsSUFBSUEsQ0FBQyxLQUFLaEIsS0FBSyxDQUFDaUIsU0FBdEMsQ0FBVjtBQUNBLGdCQUFNQyxLQUFLLEdBQUduQixFQUFFLENBQUNLLEdBQUgsS0FBV0MsY0FBSU0sV0FBZixHQUE2QixDQUE3QixHQUFpQyxDQUFDLENBQWhEO0FBQ0FYLFVBQUFBLEtBQUssQ0FBQ1ksSUFBTixDQUFXTyxLQUFYLENBQWlCLENBQUNMLENBQUMsR0FBR0ksS0FBTCxJQUFjbEIsS0FBSyxDQUFDWSxJQUFOLENBQVdDLE1BQTFDLEVBQWtELENBQWxELEVBQXFETyxPQUFyRCxDQUE2REMsS0FBN0Q7QUFDSDs7QUFDRDs7QUFFSjtBQUNJbEIsUUFBQUEsT0FBTyxHQUFHLEtBQVY7QUFsQlI7O0FBcUJBLFFBQUlBLE9BQUosRUFBYTtBQUNUSixNQUFBQSxFQUFFLENBQUN1QixjQUFIO0FBQ0F2QixNQUFBQSxFQUFFLENBQUN3QixlQUFIO0FBQ0g7QUFDSixHQWpDRDs7QUFtQ0Esc0JBQU8sNkJBQUMsc0NBQUQ7QUFBd0IsSUFBQSxhQUFhLEVBQUUsSUFBdkM7QUFBNkMsSUFBQSxTQUFTLEVBQUV6QjtBQUF4RCxLQUNGLENBQUM7QUFBQzBCLElBQUFBO0FBQUQsR0FBRCxrQkFBd0IsK0RBQVMzQixLQUFUO0FBQWdCLElBQUEsU0FBUyxFQUFFMkIsZ0JBQTNCO0FBQTZDLElBQUEsSUFBSSxFQUFDO0FBQWxELE1BQ25CNUIsUUFEbUIsQ0FEdEIsQ0FBUDtBQUtILENBekNEOztlQTJDZUQsTyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHtJU3RhdGUsIFJvdmluZ1RhYkluZGV4UHJvdmlkZXJ9IGZyb20gXCIuL1JvdmluZ1RhYkluZGV4XCI7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uL0tleWJvYXJkXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBPbWl0PFJlYWN0LkhUTUxQcm9wczxIVE1MRGl2RWxlbWVudD4sIFwib25LZXlEb3duXCI+IHtcbn1cblxuLy8gVGhpcyBjb21wb25lbnQgaW1wbGVtZW50cyB0aGUgVG9vbGJhciBkZXNpZ24gcGF0dGVybiBmcm9tIHRoZSBXQUktQVJJQSBBdXRob3JpbmcgUHJhY3RpY2VzIGd1aWRlbGluZXMuXG4vLyBodHRwczovL3d3dy53My5vcmcvVFIvd2FpLWFyaWEtcHJhY3RpY2VzLTEuMS8jdG9vbGJhclxuLy8gQWxsIGJ1dHRvbnMgcGFzc2VkIGluIGNoaWxkcmVuIG11c3QgdXNlIFJvdmluZ1RhYkluZGV4IHRvIHNldCBgb25Gb2N1c2AsIGBpc0FjdGl2ZWAsIGByZWZgXG5jb25zdCBUb29sYmFyOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHtjaGlsZHJlbiwgLi4ucHJvcHN9KSA9PiB7XG4gICAgY29uc3Qgb25LZXlEb3duID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50LCBzdGF0ZTogSVN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgLy8gRG9uJ3QgaW50ZXJmZXJlIHdpdGggaW5wdXQgZGVmYXVsdCBrZXlkb3duIGJlaGF2aW91clxuICAgICAgICBpZiAodGFyZ2V0LnRhZ05hbWUgPT09IFwiSU5QVVRcIikgcmV0dXJuO1xuXG4gICAgICAgIGxldCBoYW5kbGVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBIT01FIGFuZCBFTkQgYXJlIGhhbmRsZWQgYnkgUm92aW5nVGFiSW5kZXhQcm92aWRlclxuICAgICAgICBzd2l0Y2ggKGV2LmtleSkge1xuICAgICAgICAgICAgY2FzZSBLZXkuQVJST1dfVVA6XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19ET1dOOlxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzQXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19MRUZUOlxuICAgICAgICAgICAgY2FzZSBLZXkuQVJST1dfUklHSFQ6XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnJlZnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpID0gc3RhdGUucmVmcy5maW5kSW5kZXgociA9PiByID09PSBzdGF0ZS5hY3RpdmVSZWYpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWx0YSA9IGV2LmtleSA9PT0gS2V5LkFSUk9XX1JJR0hUID8gMSA6IC0xO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5yZWZzLnNsaWNlKChpICsgZGVsdGEpICUgc3RhdGUucmVmcy5sZW5ndGgpWzBdLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gPFJvdmluZ1RhYkluZGV4UHJvdmlkZXIgaGFuZGxlSG9tZUVuZD17dHJ1ZX0gb25LZXlEb3duPXtvbktleURvd259PlxuICAgICAgICB7KHtvbktleURvd25IYW5kbGVyfSkgPT4gPGRpdiB7Li4ucHJvcHN9IG9uS2V5RG93bj17b25LZXlEb3duSGFuZGxlcn0gcm9sZT1cInRvb2xiYXJcIj5cbiAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICA8L2Rpdj59XG4gICAgPC9Sb3ZpbmdUYWJJbmRleFByb3ZpZGVyPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRvb2xiYXI7XG4iXX0=
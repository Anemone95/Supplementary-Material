"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

/*
Copyright 2017 New Vector Ltd.

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
class InlineSpinner extends _react.default.Component {
  render() {
    const w = this.props.w || 16;
    const h = this.props.h || 16;
    const imgClass = this.props.imgClassName || "";
    let imageSource;

    if (_SettingsStore.default.getValue('feature_new_spinner')) {
      imageSource = require("../../../../res/img/spinner.svg");
    } else {
      imageSource = require("../../../../res/img/spinner.gif");
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InlineSpinner"
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: imageSource,
      width: w,
      height: h,
      className: imgClass,
      "aria-label": (0, _languageHandler._t)("Loading...")
    }));
  }

}

exports.default = InlineSpinner;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0lubGluZVNwaW5uZXIuanMiXSwibmFtZXMiOlsiSW5saW5lU3Bpbm5lciIsIlJlYWN0IiwiQ29tcG9uZW50IiwicmVuZGVyIiwidyIsInByb3BzIiwiaCIsImltZ0NsYXNzIiwiaW1nQ2xhc3NOYW1lIiwiaW1hZ2VTb3VyY2UiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJyZXF1aXJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU1lLE1BQU1BLGFBQU4sU0FBNEJDLGVBQU1DLFNBQWxDLENBQTRDO0FBQ3ZEQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxDQUFDLEdBQUcsS0FBS0MsS0FBTCxDQUFXRCxDQUFYLElBQWdCLEVBQTFCO0FBQ0EsVUFBTUUsQ0FBQyxHQUFHLEtBQUtELEtBQUwsQ0FBV0MsQ0FBWCxJQUFnQixFQUExQjtBQUNBLFVBQU1DLFFBQVEsR0FBRyxLQUFLRixLQUFMLENBQVdHLFlBQVgsSUFBMkIsRUFBNUM7QUFFQSxRQUFJQyxXQUFKOztBQUNBLFFBQUlDLHVCQUFjQyxRQUFkLENBQXVCLHFCQUF2QixDQUFKLEVBQW1EO0FBQy9DRixNQUFBQSxXQUFXLEdBQUdHLE9BQU8sQ0FBQyxpQ0FBRCxDQUFyQjtBQUNILEtBRkQsTUFFTztBQUNISCxNQUFBQSxXQUFXLEdBQUdHLE9BQU8sQ0FBQyxpQ0FBRCxDQUFyQjtBQUNIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUNJLE1BQUEsR0FBRyxFQUFFSCxXQURUO0FBRUksTUFBQSxLQUFLLEVBQUVMLENBRlg7QUFHSSxNQUFBLE1BQU0sRUFBRUUsQ0FIWjtBQUlJLE1BQUEsU0FBUyxFQUFFQyxRQUpmO0FBS0ksb0JBQVkseUJBQUcsWUFBSDtBQUxoQixNQURKLENBREo7QUFXSDs7QUF4QnNEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElubGluZVNwaW5uZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgdyA9IHRoaXMucHJvcHMudyB8fCAxNjtcbiAgICAgICAgY29uc3QgaCA9IHRoaXMucHJvcHMuaCB8fCAxNjtcbiAgICAgICAgY29uc3QgaW1nQ2xhc3MgPSB0aGlzLnByb3BzLmltZ0NsYXNzTmFtZSB8fCBcIlwiO1xuXG4gICAgICAgIGxldCBpbWFnZVNvdXJjZTtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ2ZlYXR1cmVfbmV3X3NwaW5uZXInKSkge1xuICAgICAgICAgICAgaW1hZ2VTb3VyY2UgPSByZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9zcGlubmVyLnN2Z1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGltYWdlU291cmNlID0gcmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvc3Bpbm5lci5naWZcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbmxpbmVTcGlubmVyXCI+XG4gICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBzcmM9e2ltYWdlU291cmNlfVxuICAgICAgICAgICAgICAgICAgICB3aWR0aD17d31cbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXtofVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2ltZ0NsYXNzfVxuICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIkxvYWRpbmcuLi5cIil9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
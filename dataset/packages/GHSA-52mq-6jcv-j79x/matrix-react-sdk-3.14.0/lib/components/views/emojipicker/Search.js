"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _Keyboard = require("../../../Keyboard");

/*
Copyright 2019 Tulir Asokan <tulir@maunium.net>
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
class Search extends _react.default.PureComponent
/*:: <IProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "inputRef", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onKeyDown", (ev
    /*: React.KeyboardEvent*/
    ) => {
      if (ev.key === _Keyboard.Key.ENTER) {
        this.props.onEnter();
        ev.stopPropagation();
        ev.preventDefault();
      }
    });
  }

  componentDidMount() {
    // For some reason, neither the autoFocus nor just calling focus() here worked, so here's a setTimeout
    setTimeout(() => this.inputRef.current.focus(), 0);
  }

  render() {
    let rightButton;

    if (this.props.query) {
      rightButton = /*#__PURE__*/_react.default.createElement("button", {
        onClick: () => this.props.onChange(""),
        className: "mx_EmojiPicker_search_icon mx_EmojiPicker_search_clear",
        title: (0, _languageHandler._t)("Cancel search")
      });
    } else {
      rightButton = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_EmojiPicker_search_icon"
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EmojiPicker_search"
    }, /*#__PURE__*/_react.default.createElement("input", {
      autoFocus: true,
      type: "text",
      placeholder: "Search",
      value: this.props.query,
      onChange: ev => this.props.onChange(ev.target.value),
      onKeyDown: this.onKeyDown,
      ref: this.inputRef
    }), rightButton);
  }

}

var _default = Search;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2Vtb2ppcGlja2VyL1NlYXJjaC50c3giXSwibmFtZXMiOlsiU2VhcmNoIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY3JlYXRlUmVmIiwiZXYiLCJrZXkiLCJLZXkiLCJFTlRFUiIsInByb3BzIiwib25FbnRlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiY29tcG9uZW50RGlkTW91bnQiLCJzZXRUaW1lb3V0IiwiaW5wdXRSZWYiLCJjdXJyZW50IiwiZm9jdXMiLCJyZW5kZXIiLCJyaWdodEJ1dHRvbiIsInF1ZXJ5Iiwib25DaGFuZ2UiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9uS2V5RG93biJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBQ0E7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYUEsTUFBTUEsTUFBTixTQUFxQkMsZUFBTUM7QUFBM0I7QUFBaUQ7QUFBQTtBQUFBO0FBQUEsaUVBQzFCRCxlQUFNRSxTQUFOLEVBRDBCO0FBQUEscURBUXpCLENBQUNDO0FBQUQ7QUFBQSxTQUE2QjtBQUM3QyxVQUFJQSxFQUFFLENBQUNDLEdBQUgsS0FBV0MsY0FBSUMsS0FBbkIsRUFBMEI7QUFDdEIsYUFBS0MsS0FBTCxDQUFXQyxPQUFYO0FBQ0FMLFFBQUFBLEVBQUUsQ0FBQ00sZUFBSDtBQUNBTixRQUFBQSxFQUFFLENBQUNPLGNBQUg7QUFDSDtBQUNKLEtBZDRDO0FBQUE7O0FBRzdDQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNoQjtBQUNBQyxJQUFBQSxVQUFVLENBQUMsTUFBTSxLQUFLQyxRQUFMLENBQWNDLE9BQWQsQ0FBc0JDLEtBQXRCLEVBQVAsRUFBc0MsQ0FBdEMsQ0FBVjtBQUNIOztBQVVEQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJQyxXQUFKOztBQUNBLFFBQUksS0FBS1YsS0FBTCxDQUFXVyxLQUFmLEVBQXNCO0FBQ2xCRCxNQUFBQSxXQUFXLGdCQUNQO0FBQ0ksUUFBQSxPQUFPLEVBQUUsTUFBTSxLQUFLVixLQUFMLENBQVdZLFFBQVgsQ0FBb0IsRUFBcEIsQ0FEbkI7QUFFSSxRQUFBLFNBQVMsRUFBQyx3REFGZDtBQUdJLFFBQUEsS0FBSyxFQUFFLHlCQUFHLGVBQUg7QUFIWCxRQURKO0FBT0gsS0FSRCxNQVFPO0FBQ0hGLE1BQUFBLFdBQVcsZ0JBQUc7QUFBTSxRQUFBLFNBQVMsRUFBQztBQUFoQixRQUFkO0FBQ0g7O0FBRUQsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQ0ksTUFBQSxTQUFTLE1BRGI7QUFFSSxNQUFBLElBQUksRUFBQyxNQUZUO0FBR0ksTUFBQSxXQUFXLEVBQUMsUUFIaEI7QUFJSSxNQUFBLEtBQUssRUFBRSxLQUFLVixLQUFMLENBQVdXLEtBSnRCO0FBS0ksTUFBQSxRQUFRLEVBQUVmLEVBQUUsSUFBSSxLQUFLSSxLQUFMLENBQVdZLFFBQVgsQ0FBb0JoQixFQUFFLENBQUNpQixNQUFILENBQVVDLEtBQTlCLENBTHBCO0FBTUksTUFBQSxTQUFTLEVBQUUsS0FBS0MsU0FOcEI7QUFPSSxNQUFBLEdBQUcsRUFBRSxLQUFLVDtBQVBkLE1BREosRUFVS0ksV0FWTCxDQURKO0FBY0g7O0FBNUM0Qzs7ZUErQ2xDbEIsTSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUdWxpciBBc29rYW4gPHR1bGlyQG1hdW5pdW0ubmV0PlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHF1ZXJ5OiBzdHJpbmc7XG4gICAgb25DaGFuZ2UodmFsdWU6IHN0cmluZyk6IHZvaWQ7XG4gICAgb25FbnRlcigpOiB2b2lkO1xufVxuXG5jbGFzcyBTZWFyY2ggZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHByaXZhdGUgaW5wdXRSZWYgPSBSZWFjdC5jcmVhdGVSZWY8SFRNTElucHV0RWxlbWVudD4oKTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAvLyBGb3Igc29tZSByZWFzb24sIG5laXRoZXIgdGhlIGF1dG9Gb2N1cyBub3IganVzdCBjYWxsaW5nIGZvY3VzKCkgaGVyZSB3b3JrZWQsIHNvIGhlcmUncyBhIHNldFRpbWVvdXRcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmlucHV0UmVmLmN1cnJlbnQuZm9jdXMoKSwgMCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2LmtleSA9PT0gS2V5LkVOVEVSKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRW50ZXIoKTtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCByaWdodEJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucXVlcnkpIHtcbiAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5wcm9wcy5vbkNoYW5nZShcIlwiKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRW1vamlQaWNrZXJfc2VhcmNoX2ljb24gbXhfRW1vamlQaWNrZXJfc2VhcmNoX2NsZWFyXCJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiQ2FuY2VsIHNlYXJjaFwiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfRW1vamlQaWNrZXJfc2VhcmNoX2ljb25cIiAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0Vtb2ppUGlja2VyX3NlYXJjaFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXNcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaFwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnF1ZXJ5fVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZXYgPT4gdGhpcy5wcm9wcy5vbkNoYW5nZShldi50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuaW5wdXRSZWZ9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7cmlnaHRCdXR0b259XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaDtcbiJdfQ==
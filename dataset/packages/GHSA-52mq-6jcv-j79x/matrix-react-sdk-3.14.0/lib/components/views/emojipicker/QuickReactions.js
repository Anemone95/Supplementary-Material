"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _emoji = require("../../../emoji");

var _Emoji = _interopRequireDefault(require("./Emoji"));

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
// We use the variation-selector Heart in Quick Reactions for some reason
const QUICK_REACTIONS = ["👍", "👎", "😄", "🎉", "😕", "❤️", "🚀", "👀"].map(emoji => {
  const data = (0, _emoji.getEmojiFromUnicode)(emoji);

  if (!data) {
    throw new Error(`Emoji ${emoji} doesn't exist in emojibase`);
  }

  return data;
});

class QuickReactions extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onMouseEnter", (emoji
    /*: IEmoji*/
    ) => {
      this.setState({
        hover: emoji
      });
    });
    (0, _defineProperty2.default)(this, "onMouseLeave", () => {
      this.setState({
        hover: null
      });
    });
    this.state = {
      hover: null
    };
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("section", {
      className: "mx_EmojiPicker_footer mx_EmojiPicker_quick mx_EmojiPicker_category"
    }, /*#__PURE__*/_react.default.createElement("h2", {
      className: "mx_EmojiPicker_quick_header mx_EmojiPicker_category_label"
    }, !this.state.hover ? (0, _languageHandler._t)("Quick Reactions") : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EmojiPicker_name"
    }, this.state.hover.annotation), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EmojiPicker_shortcode"
    }, this.state.hover.shortcodes[0]))), /*#__PURE__*/_react.default.createElement("ul", {
      className: "mx_EmojiPicker_list",
      "aria-label": (0, _languageHandler._t)("Quick Reactions")
    }, QUICK_REACTIONS.map(emoji => /*#__PURE__*/_react.default.createElement(_Emoji.default, {
      key: emoji.hexcode,
      emoji: emoji,
      onClick: this.props.onClick,
      onMouseEnter: this.onMouseEnter,
      onMouseLeave: this.onMouseLeave,
      selectedEmojis: this.props.selectedEmojis
    }))));
  }

}

var _default = QuickReactions;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2Vtb2ppcGlja2VyL1F1aWNrUmVhY3Rpb25zLnRzeCJdLCJuYW1lcyI6WyJRVUlDS19SRUFDVElPTlMiLCJtYXAiLCJlbW9qaSIsImRhdGEiLCJFcnJvciIsIlF1aWNrUmVhY3Rpb25zIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic2V0U3RhdGUiLCJob3ZlciIsInN0YXRlIiwicmVuZGVyIiwiYW5ub3RhdGlvbiIsInNob3J0Y29kZXMiLCJoZXhjb2RlIiwib25DbGljayIsIm9uTW91c2VFbnRlciIsIm9uTW91c2VMZWF2ZSIsInNlbGVjdGVkRW1vamlzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRQTtBQUNBLE1BQU1BLGVBQWUsR0FBRyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixFQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixJQUEvQixFQUFxQyxJQUFyQyxFQUEyQyxJQUEzQyxFQUFpREMsR0FBakQsQ0FBcURDLEtBQUssSUFBSTtBQUNsRixRQUFNQyxJQUFJLEdBQUcsZ0NBQW9CRCxLQUFwQixDQUFiOztBQUNBLE1BQUksQ0FBQ0MsSUFBTCxFQUFXO0FBQ1AsVUFBTSxJQUFJQyxLQUFKLENBQVcsU0FBUUYsS0FBTSw2QkFBekIsQ0FBTjtBQUNIOztBQUNELFNBQU9DLElBQVA7QUFDSCxDQU51QixDQUF4Qjs7QUFpQkEsTUFBTUUsY0FBTixTQUE2QkMsZUFBTUM7QUFBbkM7QUFBNkQ7QUFDekRDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHdEQU9JLENBQUNQO0FBQUQ7QUFBQSxTQUFtQjtBQUN0QyxXQUFLUSxRQUFMLENBQWM7QUFDVkMsUUFBQUEsS0FBSyxFQUFFVDtBQURHLE9BQWQ7QUFHSCxLQVhrQjtBQUFBLHdEQWFJLE1BQU07QUFDekIsV0FBS1EsUUFBTCxDQUFjO0FBQ1ZDLFFBQUFBLEtBQUssRUFBRTtBQURHLE9BQWQ7QUFHSCxLQWpCa0I7QUFFZixTQUFLQyxLQUFMLEdBQWE7QUFDVEQsTUFBQUEsS0FBSyxFQUFFO0FBREUsS0FBYjtBQUdIOztBQWNERSxFQUFBQSxNQUFNLEdBQUc7QUFDTCx3QkFDSTtBQUFTLE1BQUEsU0FBUyxFQUFDO0FBQW5CLG9CQUNJO0FBQUksTUFBQSxTQUFTLEVBQUM7QUFBZCxPQUNLLENBQUMsS0FBS0QsS0FBTCxDQUFXRCxLQUFaLEdBQ0sseUJBQUcsaUJBQUgsQ0FETCxnQkFFSyw2QkFBQyxjQUFELENBQU8sUUFBUCxxQkFDRTtBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLE9BQXVDLEtBQUtDLEtBQUwsQ0FBV0QsS0FBWCxDQUFpQkcsVUFBeEQsQ0FERixlQUVFO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FBNEMsS0FBS0YsS0FBTCxDQUFXRCxLQUFYLENBQWlCSSxVQUFqQixDQUE0QixDQUE1QixDQUE1QyxDQUZGLENBSFYsQ0FESixlQVVJO0FBQUksTUFBQSxTQUFTLEVBQUMscUJBQWQ7QUFBb0Msb0JBQVkseUJBQUcsaUJBQUg7QUFBaEQsT0FDS2YsZUFBZSxDQUFDQyxHQUFoQixDQUFvQkMsS0FBSyxpQkFDdEIsNkJBQUMsY0FBRDtBQUNJLE1BQUEsR0FBRyxFQUFFQSxLQUFLLENBQUNjLE9BRGY7QUFFSSxNQUFBLEtBQUssRUFBRWQsS0FGWDtBQUdJLE1BQUEsT0FBTyxFQUFFLEtBQUtPLEtBQUwsQ0FBV1EsT0FIeEI7QUFJSSxNQUFBLFlBQVksRUFBRSxLQUFLQyxZQUp2QjtBQUtJLE1BQUEsWUFBWSxFQUFFLEtBQUtDLFlBTHZCO0FBTUksTUFBQSxjQUFjLEVBQUUsS0FBS1YsS0FBTCxDQUFXVztBQU4vQixNQURILENBREwsQ0FWSixDQURKO0FBeUJIOztBQTlDd0Q7O2VBaUQ5Q2YsYyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUdWxpciBBc29rYW4gPHR1bGlyQG1hdW5pdW0ubmV0PlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge2dldEVtb2ppRnJvbVVuaWNvZGUsIElFbW9qaX0gZnJvbSBcIi4uLy4uLy4uL2Vtb2ppXCI7XG5pbXBvcnQgRW1vamkgZnJvbSBcIi4vRW1vamlcIjtcblxuLy8gV2UgdXNlIHRoZSB2YXJpYXRpb24tc2VsZWN0b3IgSGVhcnQgaW4gUXVpY2sgUmVhY3Rpb25zIGZvciBzb21lIHJlYXNvblxuY29uc3QgUVVJQ0tfUkVBQ1RJT05TID0gW1wi8J+RjVwiLCBcIvCfkY5cIiwgXCLwn5iEXCIsIFwi8J+OiVwiLCBcIvCfmJVcIiwgXCLinaTvuI9cIiwgXCLwn5qAXCIsIFwi8J+RgFwiXS5tYXAoZW1vamkgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSBnZXRFbW9qaUZyb21Vbmljb2RlKGVtb2ppKTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbW9qaSAke2Vtb2ppfSBkb2Vzbid0IGV4aXN0IGluIGVtb2ppYmFzZWApO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbn0pO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBzZWxlY3RlZEVtb2ppcz86IFNldDxzdHJpbmc+O1xuICAgIG9uQ2xpY2soZW1vamk6IElFbW9qaSk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGhvdmVyPzogSUVtb2ppO1xufVxuXG5jbGFzcyBRdWlja1JlYWN0aW9ucyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGhvdmVyOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZUVudGVyID0gKGVtb2ppOiBJRW1vamkpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBob3ZlcjogZW1vamksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTW91c2VMZWF2ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBob3ZlcjogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIm14X0Vtb2ppUGlja2VyX2Zvb3RlciBteF9FbW9qaVBpY2tlcl9xdWljayBteF9FbW9qaVBpY2tlcl9jYXRlZ29yeVwiPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJteF9FbW9qaVBpY2tlcl9xdWlja19oZWFkZXIgbXhfRW1vamlQaWNrZXJfY2F0ZWdvcnlfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgeyF0aGlzLnN0YXRlLmhvdmVyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiUXVpY2sgUmVhY3Rpb25zXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9FbW9qaVBpY2tlcl9uYW1lXCI+e3RoaXMuc3RhdGUuaG92ZXIuYW5ub3RhdGlvbn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRW1vamlQaWNrZXJfc2hvcnRjb2RlXCI+e3RoaXMuc3RhdGUuaG92ZXIuc2hvcnRjb2Rlc1swXX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9oMj5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwibXhfRW1vamlQaWNrZXJfbGlzdFwiIGFyaWEtbGFiZWw9e190KFwiUXVpY2sgUmVhY3Rpb25zXCIpfT5cbiAgICAgICAgICAgICAgICAgICAge1FVSUNLX1JFQUNUSU9OUy5tYXAoZW1vamkgPT4gKChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxFbW9qaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17ZW1vamkuaGV4Y29kZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbW9qaT17ZW1vaml9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5vbk1vdXNlRW50ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLm9uTW91c2VMZWF2ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEVtb2ppcz17dGhpcy5wcm9wcy5zZWxlY3RlZEVtb2ppc31cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICkpKX1cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUXVpY2tSZWFjdGlvbnM7XG4iXX0=
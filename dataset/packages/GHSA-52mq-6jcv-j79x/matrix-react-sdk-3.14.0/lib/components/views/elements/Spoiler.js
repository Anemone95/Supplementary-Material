"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

/*
 Copyright 2019 Sorunome

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
class Spoiler extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  toggleVisible(e) {
    if (!this.state.visible) {
      // we are un-blurring, we don't want this click to propagate to potential child pills
      e.preventDefault();
      e.stopPropagation();
    }

    this.setState({
      visible: !this.state.visible
    });
  }

  render() {
    const reason = this.props.reason ? /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_spoiler_reason"
    }, "(" + this.props.reason + ")") : null; // react doesn't allow appending a DOM node as child.
    // as such, we pass the this.props.contentHtml instead and then set the raw
    // HTML content. This is secure as the contents have already been parsed previously

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_spoiler" + (this.state.visible ? " visible" : ""),
      onClick: this.toggleVisible.bind(this)
    }, reason, "\xA0", /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_spoiler_content",
      dangerouslySetInnerHTML: {
        __html: this.props.contentHtml
      }
    }));
  }

}

exports.default = Spoiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1Nwb2lsZXIuanMiXSwibmFtZXMiOlsiU3BvaWxlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwidmlzaWJsZSIsInRvZ2dsZVZpc2libGUiLCJlIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzZXRTdGF0ZSIsInJlbmRlciIsInJlYXNvbiIsImJpbmQiLCJfX2h0bWwiLCJjb250ZW50SHRtbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJZSxNQUFNQSxPQUFOLFNBQXNCQyxlQUFNQyxTQUE1QixDQUFzQztBQUNqREMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBQ0EsU0FBS0MsS0FBTCxHQUFhO0FBQ1RDLE1BQUFBLE9BQU8sRUFBRTtBQURBLEtBQWI7QUFHSDs7QUFFREMsRUFBQUEsYUFBYSxDQUFDQyxDQUFELEVBQUk7QUFDYixRQUFJLENBQUMsS0FBS0gsS0FBTCxDQUFXQyxPQUFoQixFQUF5QjtBQUNyQjtBQUNBRSxNQUFBQSxDQUFDLENBQUNDLGNBQUY7QUFDQUQsTUFBQUEsQ0FBQyxDQUFDRSxlQUFGO0FBQ0g7O0FBQ0QsU0FBS0MsUUFBTCxDQUFjO0FBQUVMLE1BQUFBLE9BQU8sRUFBRSxDQUFDLEtBQUtELEtBQUwsQ0FBV0M7QUFBdkIsS0FBZDtBQUNIOztBQUVETSxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxNQUFNLEdBQUcsS0FBS1QsS0FBTCxDQUFXUyxNQUFYLGdCQUNYO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FBK0MsTUFBTSxLQUFLVCxLQUFMLENBQVdTLE1BQWpCLEdBQTBCLEdBQXpFLENBRFcsR0FFWCxJQUZKLENBREssQ0FJTDtBQUNBO0FBQ0E7O0FBQ0Esd0JBQ0k7QUFBTSxNQUFBLFNBQVMsRUFBRSwwQkFBMEIsS0FBS1IsS0FBTCxDQUFXQyxPQUFYLEdBQXFCLFVBQXJCLEdBQWtDLEVBQTVELENBQWpCO0FBQWtGLE1BQUEsT0FBTyxFQUFFLEtBQUtDLGFBQUwsQ0FBbUJPLElBQW5CLENBQXdCLElBQXhCO0FBQTNGLE9BQ01ELE1BRE4sdUJBR0k7QUFBTSxNQUFBLFNBQVMsRUFBQyw4QkFBaEI7QUFBK0MsTUFBQSx1QkFBdUIsRUFBRTtBQUFFRSxRQUFBQSxNQUFNLEVBQUUsS0FBS1gsS0FBTCxDQUFXWTtBQUFyQjtBQUF4RSxNQUhKLENBREo7QUFPSDs7QUEvQmdEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiBDb3B5cmlnaHQgMjAxOSBTb3J1bm9tZVxuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwb2lsZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHRvZ2dsZVZpc2libGUoZSkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUudmlzaWJsZSkge1xuICAgICAgICAgICAgLy8gd2UgYXJlIHVuLWJsdXJyaW5nLCB3ZSBkb24ndCB3YW50IHRoaXMgY2xpY2sgdG8gcHJvcGFnYXRlIHRvIHBvdGVudGlhbCBjaGlsZCBwaWxsc1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmlzaWJsZTogIXRoaXMuc3RhdGUudmlzaWJsZSB9KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHJlYXNvbiA9IHRoaXMucHJvcHMucmVhc29uID8gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX3Nwb2lsZXJfcmVhc29uXCI+e1wiKFwiICsgdGhpcy5wcm9wcy5yZWFzb24gKyBcIilcIn08L3NwYW4+XG4gICAgICAgICkgOiBudWxsO1xuICAgICAgICAvLyByZWFjdCBkb2Vzbid0IGFsbG93IGFwcGVuZGluZyBhIERPTSBub2RlIGFzIGNoaWxkLlxuICAgICAgICAvLyBhcyBzdWNoLCB3ZSBwYXNzIHRoZSB0aGlzLnByb3BzLmNvbnRlbnRIdG1sIGluc3RlYWQgYW5kIHRoZW4gc2V0IHRoZSByYXdcbiAgICAgICAgLy8gSFRNTCBjb250ZW50LiBUaGlzIGlzIHNlY3VyZSBhcyB0aGUgY29udGVudHMgaGF2ZSBhbHJlYWR5IGJlZW4gcGFyc2VkIHByZXZpb3VzbHlcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17XCJteF9FdmVudFRpbGVfc3BvaWxlclwiICsgKHRoaXMuc3RhdGUudmlzaWJsZSA/IFwiIHZpc2libGVcIiA6IFwiXCIpfSBvbkNsaWNrPXt0aGlzLnRvZ2dsZVZpc2libGUuYmluZCh0aGlzKX0+XG4gICAgICAgICAgICAgICAgeyByZWFzb24gfVxuICAgICAgICAgICAgICAgICZuYnNwO1xuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9zcG9pbGVyX2NvbnRlbnRcIiBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6IHRoaXMucHJvcHMuY29udGVudEh0bWwgfX0gLz5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
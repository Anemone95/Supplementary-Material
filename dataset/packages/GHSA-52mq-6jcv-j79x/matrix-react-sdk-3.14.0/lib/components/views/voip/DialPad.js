"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

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
const BUTTONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
var DialPadButtonKind;

(function (DialPadButtonKind) {
  DialPadButtonKind[DialPadButtonKind["Digit"] = 0] = "Digit";
  DialPadButtonKind[DialPadButtonKind["Delete"] = 1] = "Delete";
  DialPadButtonKind[DialPadButtonKind["Dial"] = 2] = "Dial";
})(DialPadButtonKind || (DialPadButtonKind = {}));

class DialPadButton extends React.PureComponent
/*:: <IButtonProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onClick", () => {
      this.props.onButtonPress(this.props.digit);
    });
  }

  render() {
    switch (this.props.kind) {
      case DialPadButtonKind.Digit:
        return /*#__PURE__*/React.createElement(_AccessibleButton.default, {
          className: "mx_DialPad_button",
          onClick: this.onClick
        }, this.props.digit);

      case DialPadButtonKind.Delete:
        return /*#__PURE__*/React.createElement(_AccessibleButton.default, {
          className: "mx_DialPad_button mx_DialPad_deleteButton",
          onClick: this.onClick
        });

      case DialPadButtonKind.Dial:
        return /*#__PURE__*/React.createElement(_AccessibleButton.default, {
          className: "mx_DialPad_button mx_DialPad_dialButton",
          onClick: this.onClick
        });
    }
  }

}

class Dialpad extends React.PureComponent
/*:: <IProps>*/
{
  render() {
    const buttonNodes = [];

    for (const button of BUTTONS) {
      buttonNodes.push( /*#__PURE__*/React.createElement(DialPadButton, {
        key: button,
        kind: DialPadButtonKind.Digit,
        digit: button,
        onButtonPress: this.props.onDigitPress
      }));
    }

    if (this.props.hasDialAndDelete) {
      buttonNodes.push( /*#__PURE__*/React.createElement(DialPadButton, {
        key: "del",
        kind: DialPadButtonKind.Delete,
        onButtonPress: this.props.onDeletePress
      }));
      buttonNodes.push( /*#__PURE__*/React.createElement(DialPadButton, {
        key: "dial",
        kind: DialPadButtonKind.Dial,
        onButtonPress: this.props.onDialPress
      }));
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPad"
    }, buttonNodes);
  }

}

exports.default = Dialpad;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvRGlhbFBhZC50c3giXSwibmFtZXMiOlsiQlVUVE9OUyIsIkRpYWxQYWRCdXR0b25LaW5kIiwiRGlhbFBhZEJ1dHRvbiIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsInByb3BzIiwib25CdXR0b25QcmVzcyIsImRpZ2l0IiwicmVuZGVyIiwia2luZCIsIkRpZ2l0Iiwib25DbGljayIsIkRlbGV0ZSIsIkRpYWwiLCJEaWFscGFkIiwiYnV0dG9uTm9kZXMiLCJidXR0b24iLCJwdXNoIiwib25EaWdpdFByZXNzIiwiaGFzRGlhbEFuZERlbGV0ZSIsIm9uRGVsZXRlUHJlc3MiLCJvbkRpYWxQcmVzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS0EsTUFBTUEsT0FBTyxHQUFHLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELEdBQW5ELEVBQXdELEdBQXhELENBQWhCO0lBRUtDLGlCOztXQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtHQUFBQSxpQixLQUFBQSxpQjs7QUFZTCxNQUFNQyxhQUFOLFNBQTRCQyxLQUFLLENBQUNDO0FBQWxDO0FBQThEO0FBQUE7QUFBQTtBQUFBLG1EQUNoRCxNQUFNO0FBQ1osV0FBS0MsS0FBTCxDQUFXQyxhQUFYLENBQXlCLEtBQUtELEtBQUwsQ0FBV0UsS0FBcEM7QUFDSCxLQUh5RDtBQUFBOztBQUsxREMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsWUFBUSxLQUFLSCxLQUFMLENBQVdJLElBQW5CO0FBQ0ksV0FBS1IsaUJBQWlCLENBQUNTLEtBQXZCO0FBQ0ksNEJBQU8sb0JBQUMseUJBQUQ7QUFBa0IsVUFBQSxTQUFTLEVBQUMsbUJBQTVCO0FBQWdELFVBQUEsT0FBTyxFQUFFLEtBQUtDO0FBQTlELFdBQ0YsS0FBS04sS0FBTCxDQUFXRSxLQURULENBQVA7O0FBR0osV0FBS04saUJBQWlCLENBQUNXLE1BQXZCO0FBQ0ksNEJBQU8sb0JBQUMseUJBQUQ7QUFBa0IsVUFBQSxTQUFTLEVBQUMsMkNBQTVCO0FBQ0gsVUFBQSxPQUFPLEVBQUUsS0FBS0Q7QUFEWCxVQUFQOztBQUdKLFdBQUtWLGlCQUFpQixDQUFDWSxJQUF2QjtBQUNJLDRCQUFPLG9CQUFDLHlCQUFEO0FBQWtCLFVBQUEsU0FBUyxFQUFDLHlDQUE1QjtBQUFzRSxVQUFBLE9BQU8sRUFBRSxLQUFLRjtBQUFwRixVQUFQO0FBVlI7QUFZSDs7QUFsQnlEOztBQTRCL0MsTUFBTUcsT0FBTixTQUFzQlgsS0FBSyxDQUFDQztBQUE1QjtBQUFrRDtBQUM3REksRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTU8sV0FBVyxHQUFHLEVBQXBCOztBQUVBLFNBQUssTUFBTUMsTUFBWCxJQUFxQmhCLE9BQXJCLEVBQThCO0FBQzFCZSxNQUFBQSxXQUFXLENBQUNFLElBQVosZUFBaUIsb0JBQUMsYUFBRDtBQUFlLFFBQUEsR0FBRyxFQUFFRCxNQUFwQjtBQUE0QixRQUFBLElBQUksRUFBRWYsaUJBQWlCLENBQUNTLEtBQXBEO0FBQ2IsUUFBQSxLQUFLLEVBQUVNLE1BRE07QUFDRSxRQUFBLGFBQWEsRUFBRSxLQUFLWCxLQUFMLENBQVdhO0FBRDVCLFFBQWpCO0FBR0g7O0FBRUQsUUFBSSxLQUFLYixLQUFMLENBQVdjLGdCQUFmLEVBQWlDO0FBQzdCSixNQUFBQSxXQUFXLENBQUNFLElBQVosZUFBaUIsb0JBQUMsYUFBRDtBQUFlLFFBQUEsR0FBRyxFQUFDLEtBQW5CO0FBQXlCLFFBQUEsSUFBSSxFQUFFaEIsaUJBQWlCLENBQUNXLE1BQWpEO0FBQ2IsUUFBQSxhQUFhLEVBQUUsS0FBS1AsS0FBTCxDQUFXZTtBQURiLFFBQWpCO0FBR0FMLE1BQUFBLFdBQVcsQ0FBQ0UsSUFBWixlQUFpQixvQkFBQyxhQUFEO0FBQWUsUUFBQSxHQUFHLEVBQUMsTUFBbkI7QUFBMEIsUUFBQSxJQUFJLEVBQUVoQixpQkFBaUIsQ0FBQ1ksSUFBbEQ7QUFDYixRQUFBLGFBQWEsRUFBRSxLQUFLUixLQUFMLENBQVdnQjtBQURiLFFBQWpCO0FBR0g7O0FBRUQsd0JBQU87QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0ZOLFdBREUsQ0FBUDtBQUdIOztBQXRCNEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5cbmNvbnN0IEJVVFRPTlMgPSBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJyonLCAnMCcsICcjJ107XG5cbmVudW0gRGlhbFBhZEJ1dHRvbktpbmQge1xuICAgIERpZ2l0LFxuICAgIERlbGV0ZSxcbiAgICBEaWFsLFxufVxuXG5pbnRlcmZhY2UgSUJ1dHRvblByb3BzIHtcbiAgICBraW5kOiBEaWFsUGFkQnV0dG9uS2luZDtcbiAgICBkaWdpdD86IHN0cmluZztcbiAgICBvbkJ1dHRvblByZXNzOiAoc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5jbGFzcyBEaWFsUGFkQnV0dG9uIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJQnV0dG9uUHJvcHM+IHtcbiAgICBvbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uQnV0dG9uUHJlc3ModGhpcy5wcm9wcy5kaWdpdCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMucHJvcHMua2luZCkge1xuICAgICAgICAgICAgY2FzZSBEaWFsUGFkQnV0dG9uS2luZC5EaWdpdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfRGlhbFBhZF9idXR0b25cIiBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5kaWdpdH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICAgICAgY2FzZSBEaWFsUGFkQnV0dG9uS2luZC5EZWxldGU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0RpYWxQYWRfYnV0dG9uIG14X0RpYWxQYWRfZGVsZXRlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgY2FzZSBEaWFsUGFkQnV0dG9uS2luZC5EaWFsOlxuICAgICAgICAgICAgICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9EaWFsUGFkX2J1dHRvbiBteF9EaWFsUGFkX2RpYWxCdXR0b25cIiBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9IC8+O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBvbkRpZ2l0UHJlc3M6IChzdHJpbmcpID0+IHZvaWQ7XG4gICAgaGFzRGlhbEFuZERlbGV0ZTogYm9vbGVhbjtcbiAgICBvbkRlbGV0ZVByZXNzPzogKHN0cmluZykgPT4gdm9pZDtcbiAgICBvbkRpYWxQcmVzcz86IChzdHJpbmcpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpYWxwYWQgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uTm9kZXMgPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBCVVRUT05TKSB7XG4gICAgICAgICAgICBidXR0b25Ob2Rlcy5wdXNoKDxEaWFsUGFkQnV0dG9uIGtleT17YnV0dG9ufSBraW5kPXtEaWFsUGFkQnV0dG9uS2luZC5EaWdpdH1cbiAgICAgICAgICAgICAgICBkaWdpdD17YnV0dG9ufSBvbkJ1dHRvblByZXNzPXt0aGlzLnByb3BzLm9uRGlnaXRQcmVzc31cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmhhc0RpYWxBbmREZWxldGUpIHtcbiAgICAgICAgICAgIGJ1dHRvbk5vZGVzLnB1c2goPERpYWxQYWRCdXR0b24ga2V5PVwiZGVsXCIga2luZD17RGlhbFBhZEJ1dHRvbktpbmQuRGVsZXRlfVxuICAgICAgICAgICAgICAgIG9uQnV0dG9uUHJlc3M9e3RoaXMucHJvcHMub25EZWxldGVQcmVzc31cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgICAgIGJ1dHRvbk5vZGVzLnB1c2goPERpYWxQYWRCdXR0b24ga2V5PVwiZGlhbFwiIGtpbmQ9e0RpYWxQYWRCdXR0b25LaW5kLkRpYWx9XG4gICAgICAgICAgICAgICAgb25CdXR0b25QcmVzcz17dGhpcy5wcm9wcy5vbkRpYWxQcmVzc31cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxQYWRcIj5cbiAgICAgICAgICAgIHtidXR0b25Ob2Rlc31cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdfQ==
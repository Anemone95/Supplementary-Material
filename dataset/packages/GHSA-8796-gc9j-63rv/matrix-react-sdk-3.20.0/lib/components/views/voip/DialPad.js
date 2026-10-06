"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class;

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

let Dialpad = (_dec = (0, _replaceableComponent.replaceableComponent)("views.voip.DialPad"), _dec(_class = class Dialpad extends React.PureComponent
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

}) || _class);
exports.default = Dialpad;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvRGlhbFBhZC50c3giXSwibmFtZXMiOlsiQlVUVE9OUyIsIkRpYWxQYWRCdXR0b25LaW5kIiwiRGlhbFBhZEJ1dHRvbiIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsInByb3BzIiwib25CdXR0b25QcmVzcyIsImRpZ2l0IiwicmVuZGVyIiwia2luZCIsIkRpZ2l0Iiwib25DbGljayIsIkRlbGV0ZSIsIkRpYWwiLCJEaWFscGFkIiwiYnV0dG9uTm9kZXMiLCJidXR0b24iLCJwdXNoIiwib25EaWdpdFByZXNzIiwiaGFzRGlhbEFuZERlbGV0ZSIsIm9uRGVsZXRlUHJlc3MiLCJvbkRpYWxQcmVzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLE9BQU8sR0FBRyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxHQUFuRCxFQUF3RCxHQUF4RCxDQUFoQjtJQUVLQyxpQjs7V0FBQUEsaUI7QUFBQUEsRUFBQUEsaUIsQ0FBQUEsaUI7QUFBQUEsRUFBQUEsaUIsQ0FBQUEsaUI7QUFBQUEsRUFBQUEsaUIsQ0FBQUEsaUI7R0FBQUEsaUIsS0FBQUEsaUI7O0FBWUwsTUFBTUMsYUFBTixTQUE0QkMsS0FBSyxDQUFDQztBQUFsQztBQUE4RDtBQUFBO0FBQUE7QUFBQSxtREFDaEQsTUFBTTtBQUNaLFdBQUtDLEtBQUwsQ0FBV0MsYUFBWCxDQUF5QixLQUFLRCxLQUFMLENBQVdFLEtBQXBDO0FBQ0gsS0FIeUQ7QUFBQTs7QUFLMURDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFlBQVEsS0FBS0gsS0FBTCxDQUFXSSxJQUFuQjtBQUNJLFdBQUtSLGlCQUFpQixDQUFDUyxLQUF2QjtBQUNJLDRCQUFPLG9CQUFDLHlCQUFEO0FBQWtCLFVBQUEsU0FBUyxFQUFDLG1CQUE1QjtBQUFnRCxVQUFBLE9BQU8sRUFBRSxLQUFLQztBQUE5RCxXQUNGLEtBQUtOLEtBQUwsQ0FBV0UsS0FEVCxDQUFQOztBQUdKLFdBQUtOLGlCQUFpQixDQUFDVyxNQUF2QjtBQUNJLDRCQUFPLG9CQUFDLHlCQUFEO0FBQWtCLFVBQUEsU0FBUyxFQUFDLDJDQUE1QjtBQUNILFVBQUEsT0FBTyxFQUFFLEtBQUtEO0FBRFgsVUFBUDs7QUFHSixXQUFLVixpQkFBaUIsQ0FBQ1ksSUFBdkI7QUFDSSw0QkFBTyxvQkFBQyx5QkFBRDtBQUFrQixVQUFBLFNBQVMsRUFBQyx5Q0FBNUI7QUFBc0UsVUFBQSxPQUFPLEVBQUUsS0FBS0Y7QUFBcEYsVUFBUDtBQVZSO0FBWUg7O0FBbEJ5RDs7SUE2QnpDRyxPLFdBRHBCLGdEQUFxQixvQkFBckIsQyxnQkFBRCxNQUNxQkEsT0FEckIsU0FDcUNYLEtBQUssQ0FBQ0M7QUFEM0M7QUFDaUU7QUFDN0RJLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1PLFdBQVcsR0FBRyxFQUFwQjs7QUFFQSxTQUFLLE1BQU1DLE1BQVgsSUFBcUJoQixPQUFyQixFQUE4QjtBQUMxQmUsTUFBQUEsV0FBVyxDQUFDRSxJQUFaLGVBQWlCLG9CQUFDLGFBQUQ7QUFBZSxRQUFBLEdBQUcsRUFBRUQsTUFBcEI7QUFBNEIsUUFBQSxJQUFJLEVBQUVmLGlCQUFpQixDQUFDUyxLQUFwRDtBQUNiLFFBQUEsS0FBSyxFQUFFTSxNQURNO0FBQ0UsUUFBQSxhQUFhLEVBQUUsS0FBS1gsS0FBTCxDQUFXYTtBQUQ1QixRQUFqQjtBQUdIOztBQUVELFFBQUksS0FBS2IsS0FBTCxDQUFXYyxnQkFBZixFQUFpQztBQUM3QkosTUFBQUEsV0FBVyxDQUFDRSxJQUFaLGVBQWlCLG9CQUFDLGFBQUQ7QUFBZSxRQUFBLEdBQUcsRUFBQyxLQUFuQjtBQUF5QixRQUFBLElBQUksRUFBRWhCLGlCQUFpQixDQUFDVyxNQUFqRDtBQUNiLFFBQUEsYUFBYSxFQUFFLEtBQUtQLEtBQUwsQ0FBV2U7QUFEYixRQUFqQjtBQUdBTCxNQUFBQSxXQUFXLENBQUNFLElBQVosZUFBaUIsb0JBQUMsYUFBRDtBQUFlLFFBQUEsR0FBRyxFQUFDLE1BQW5CO0FBQTBCLFFBQUEsSUFBSSxFQUFFaEIsaUJBQWlCLENBQUNZLElBQWxEO0FBQ2IsUUFBQSxhQUFhLEVBQUUsS0FBS1IsS0FBTCxDQUFXZ0I7QUFEYixRQUFqQjtBQUdIOztBQUVELHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNGTixXQURFLENBQVA7QUFHSDs7QUF0QjRELEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuY29uc3QgQlVUVE9OUyA9IFsnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnKicsICcwJywgJyMnXTtcblxuZW51bSBEaWFsUGFkQnV0dG9uS2luZCB7XG4gICAgRGlnaXQsXG4gICAgRGVsZXRlLFxuICAgIERpYWwsXG59XG5cbmludGVyZmFjZSBJQnV0dG9uUHJvcHMge1xuICAgIGtpbmQ6IERpYWxQYWRCdXR0b25LaW5kO1xuICAgIGRpZ2l0Pzogc3RyaW5nO1xuICAgIG9uQnV0dG9uUHJlc3M6IChzdHJpbmcpID0+IHZvaWQ7XG59XG5cbmNsYXNzIERpYWxQYWRCdXR0b24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElCdXR0b25Qcm9wcz4ge1xuICAgIG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25CdXR0b25QcmVzcyh0aGlzLnByb3BzLmRpZ2l0KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5wcm9wcy5raW5kKSB7XG4gICAgICAgICAgICBjYXNlIERpYWxQYWRCdXR0b25LaW5kLkRpZ2l0OlxuICAgICAgICAgICAgICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9EaWFsUGFkX2J1dHRvblwiIG9uQ2xpY2s9e3RoaXMub25DbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmRpZ2l0fVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgICAgICBjYXNlIERpYWxQYWRCdXR0b25LaW5kLkRlbGV0ZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfRGlhbFBhZF9idXR0b24gbXhfRGlhbFBhZF9kZWxldGVCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBjYXNlIERpYWxQYWRCdXR0b25LaW5kLkRpYWw6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0RpYWxQYWRfYnV0dG9uIG14X0RpYWxQYWRfZGlhbEJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMub25DbGlja30gLz47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG9uRGlnaXRQcmVzczogKHN0cmluZykgPT4gdm9pZDtcbiAgICBoYXNEaWFsQW5kRGVsZXRlOiBib29sZWFuO1xuICAgIG9uRGVsZXRlUHJlc3M/OiAoc3RyaW5nKSA9PiB2b2lkO1xuICAgIG9uRGlhbFByZXNzPzogKHN0cmluZykgPT4gdm9pZDtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Mudm9pcC5EaWFsUGFkXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWFscGFkIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbk5vZGVzID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBidXR0b24gb2YgQlVUVE9OUykge1xuICAgICAgICAgICAgYnV0dG9uTm9kZXMucHVzaCg8RGlhbFBhZEJ1dHRvbiBrZXk9e2J1dHRvbn0ga2luZD17RGlhbFBhZEJ1dHRvbktpbmQuRGlnaXR9XG4gICAgICAgICAgICAgICAgZGlnaXQ9e2J1dHRvbn0gb25CdXR0b25QcmVzcz17dGhpcy5wcm9wcy5vbkRpZ2l0UHJlc3N9XG4gICAgICAgICAgICAvPik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5oYXNEaWFsQW5kRGVsZXRlKSB7XG4gICAgICAgICAgICBidXR0b25Ob2Rlcy5wdXNoKDxEaWFsUGFkQnV0dG9uIGtleT1cImRlbFwiIGtpbmQ9e0RpYWxQYWRCdXR0b25LaW5kLkRlbGV0ZX1cbiAgICAgICAgICAgICAgICBvbkJ1dHRvblByZXNzPXt0aGlzLnByb3BzLm9uRGVsZXRlUHJlc3N9XG4gICAgICAgICAgICAvPik7XG4gICAgICAgICAgICBidXR0b25Ob2Rlcy5wdXNoKDxEaWFsUGFkQnV0dG9uIGtleT1cImRpYWxcIiBraW5kPXtEaWFsUGFkQnV0dG9uS2luZC5EaWFsfVxuICAgICAgICAgICAgICAgIG9uQnV0dG9uUHJlc3M9e3RoaXMucHJvcHMub25EaWFsUHJlc3N9XG4gICAgICAgICAgICAvPik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkXCI+XG4gICAgICAgICAgICB7YnV0dG9uTm9kZXN9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG4iXX0=
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ServerOfflineDialog = _interopRequireDefault(require("../dialogs/ServerOfflineDialog"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let NonUrgentEchoFailureToast = (_dec = (0, _replaceableComponent.replaceableComponent)("views.toasts.NonUrgentEchoFailureToast"), _dec(_class = (_temp = class NonUrgentEchoFailureToast extends _react.default.PureComponent {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "openDialog", () => {
      _Modal.default.createTrackedDialog('Local Echo Server Error', '', _ServerOfflineDialog.default, {});
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_NonUrgentEchoFailureToast"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_NonUrgentEchoFailureToast_icon"
    }), (0, _languageHandler._t)("Your server isn't responding to some <a>requests</a>.", {}, {
      'a': sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: this.openDialog
      }, sub)
    }));
  }

}, _temp)) || _class);
exports.default = NonUrgentEchoFailureToast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3RvYXN0cy9Ob25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0LnRzeCJdLCJuYW1lcyI6WyJOb25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiU2VydmVyT2ZmbGluZURpYWxvZyIsInJlbmRlciIsInN1YiIsIm9wZW5EaWFsb2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSx5QixXQURwQixnREFBcUIsd0NBQXJCLEMseUJBQUQsTUFDcUJBLHlCQURyQixTQUN1REMsZUFBTUMsYUFEN0QsQ0FDMkU7QUFBQTtBQUFBO0FBQUEsc0RBQ2xELE1BQU07QUFDdkJDLHFCQUFNQyxtQkFBTixDQUEwQix5QkFBMUIsRUFBcUQsRUFBckQsRUFBeURDLDRCQUF6RCxFQUE4RSxFQUE5RTtBQUNILEtBSHNFO0FBQUE7O0FBS2hFQyxFQUFBQSxNQUFQLEdBQWdCO0FBQ1osd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsTUFESixFQUVLLHlCQUFHLHVEQUFILEVBQTRELEVBQTVELEVBQWdFO0FBQzdELFdBQU1DLEdBQUQsaUJBQ0QsNkJBQUMseUJBQUQ7QUFBa0IsUUFBQSxJQUFJLEVBQUMsTUFBdkI7QUFBOEIsUUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFBNUMsU0FBeURELEdBQXpEO0FBRnlELEtBQWhFLENBRkwsQ0FESjtBQVVIOztBQWhCc0UsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbmh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFNlcnZlck9mZmxpbmVEaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvU2VydmVyT2ZmbGluZURpYWxvZ1wiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnRvYXN0cy5Ob25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSBvcGVuRGlhbG9nID0gKCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdMb2NhbCBFY2hvIFNlcnZlciBFcnJvcicsICcnLCBTZXJ2ZXJPZmZsaW5lRGlhbG9nLCB7fSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X05vblVyZ2VudEVjaG9GYWlsdXJlVG9hc3RcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Ob25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0X2ljb25cIiAvPlxuICAgICAgICAgICAgICAgIHtfdChcIllvdXIgc2VydmVyIGlzbid0IHJlc3BvbmRpbmcgdG8gc29tZSA8YT5yZXF1ZXN0czwvYT4uXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXt0aGlzLm9wZW5EaWFsb2d9PntzdWJ9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9XG59XG4iXX0=
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var FormattingUtils = _interopRequireWildcard(require("../../../utils/FormattingUtils"));

var _languageHandler = require("../../../languageHandler");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let ManualDeviceKeyVerificationDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.ManualDeviceKeyVerificationDialog"), _dec(_class = (_temp = _class2 = class ManualDeviceKeyVerificationDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onLegacyFinished", confirm => {
      if (confirm) {
        _MatrixClientPeg.MatrixClientPeg.get().setDeviceVerified(this.props.userId, this.props.device.deviceId, true);
      }

      this.props.onFinished(confirm);
    });
  }

  render() {
    const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");
    let text;

    if (_MatrixClientPeg.MatrixClientPeg.get().getUserId() === this.props.userId) {
      text = (0, _languageHandler._t)("Confirm by comparing the following with the User Settings in your other session:");
    } else {
      text = (0, _languageHandler._t)("Confirm this user's session by comparing the following with their User Settings:");
    }

    const key = FormattingUtils.formatCryptoKey(this.props.device.getFingerprint());

    const body = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, text), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DeviceVerifyDialog_cryptoSection"
    }, /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)("Session name"), ":"), " ", /*#__PURE__*/_react.default.createElement("span", null, this.props.device.getDisplayName())), /*#__PURE__*/_react.default.createElement("li", null, /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)("Session ID"), ":"), " ", /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("code", null, this.props.device.deviceId))), /*#__PURE__*/_react.default.createElement("li", null, /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)("Session key"), ":"), " ", /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("code", null, /*#__PURE__*/_react.default.createElement("b", null, key)))))), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If they don't match, the security of your communication may be compromised.")));

    return /*#__PURE__*/_react.default.createElement(QuestionDialog, {
      title: (0, _languageHandler._t)("Verify session"),
      description: body,
      button: (0, _languageHandler._t)("Verify session"),
      onFinished: this._onLegacyFinished
    });
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  userId: _propTypes.default.string.isRequired,
  device: _propTypes.default.object.isRequired,
  onFinished: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = ManualDeviceKeyVerificationDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTWFudWFsRGV2aWNlS2V5VmVyaWZpY2F0aW9uRGlhbG9nLmpzIl0sIm5hbWVzIjpbIk1hbnVhbERldmljZUtleVZlcmlmaWNhdGlvbkRpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwicHJvcHMiLCJvbkZpbmlzaGVkIiwiY29uZmlybSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInNldERldmljZVZlcmlmaWVkIiwidXNlcklkIiwiZGV2aWNlIiwiZGV2aWNlSWQiLCJyZW5kZXIiLCJRdWVzdGlvbkRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsInRleHQiLCJnZXRVc2VySWQiLCJrZXkiLCJGb3JtYXR0aW5nVXRpbHMiLCJmb3JtYXRDcnlwdG9LZXkiLCJnZXRGaW5nZXJwcmludCIsImJvZHkiLCJnZXREaXNwbGF5TmFtZSIsIl9vbkxlZ2FjeUZpbmlzaGVkIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiaXNSZXF1aXJlZCIsIm9iamVjdCIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFHcUJBLGlDLFdBRHBCLGdEQUFxQixpREFBckIsQyxtQ0FBRCxNQUNxQkEsaUNBRHJCLFNBQytEQyxlQUFNQyxTQURyRSxDQUMrRTtBQUFBO0FBQUE7QUFBQSwwREFPMUQsTUFBTTtBQUNuQixXQUFLQyxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsS0FBdEI7QUFDSCxLQVQwRTtBQUFBLDZEQVd0REMsT0FBRCxJQUFhO0FBQzdCLFVBQUlBLE9BQUosRUFBYTtBQUNUQyx5Q0FBZ0JDLEdBQWhCLEdBQXNCQyxpQkFBdEIsQ0FDSSxLQUFLTCxLQUFMLENBQVdNLE1BRGYsRUFDdUIsS0FBS04sS0FBTCxDQUFXTyxNQUFYLENBQWtCQyxRQUR6QyxFQUNtRCxJQURuRDtBQUdIOztBQUNELFdBQUtSLEtBQUwsQ0FBV0MsVUFBWCxDQUFzQkMsT0FBdEI7QUFDSCxLQWxCMEU7QUFBQTs7QUFvQjNFTyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxjQUFjLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix3QkFBakIsQ0FBdkI7QUFFQSxRQUFJQyxJQUFKOztBQUNBLFFBQUlWLGlDQUFnQkMsR0FBaEIsR0FBc0JVLFNBQXRCLE9BQXNDLEtBQUtkLEtBQUwsQ0FBV00sTUFBckQsRUFBNkQ7QUFDekRPLE1BQUFBLElBQUksR0FBRyx5QkFBRyxrRkFBSCxDQUFQO0FBQ0gsS0FGRCxNQUVPO0FBQ0hBLE1BQUFBLElBQUksR0FBRyx5QkFBRyxrRkFBSCxDQUFQO0FBQ0g7O0FBRUQsVUFBTUUsR0FBRyxHQUFHQyxlQUFlLENBQUNDLGVBQWhCLENBQWdDLEtBQUtqQixLQUFMLENBQVdPLE1BQVgsQ0FBa0JXLGNBQWxCLEVBQWhDLENBQVo7O0FBQ0EsVUFBTUMsSUFBSSxnQkFDTix1REFDSSx3Q0FDTU4sSUFETixDQURKLGVBSUk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLHNEQUNJLHNEQUFJLDRDQUFTLHlCQUFHLGNBQUgsQ0FBVCxNQUFKLG9CQUEyQywyQ0FBUSxLQUFLYixLQUFMLENBQVdPLE1BQVgsQ0FBa0JhLGNBQWxCLEVBQVIsQ0FBM0MsQ0FESixlQUVJLHNEQUFJLDRDQUFTLHlCQUFHLFlBQUgsQ0FBVCxNQUFKLG9CQUF5Qyx3REFBTSwyQ0FBUSxLQUFLcEIsS0FBTCxDQUFXTyxNQUFYLENBQWtCQyxRQUExQixDQUFOLENBQXpDLENBRkosZUFHSSxzREFBSSw0Q0FBUyx5QkFBRyxhQUFILENBQVQsTUFBSixvQkFBMEMsd0RBQU0sd0RBQU0sd0NBQUtPLEdBQUwsQ0FBTixDQUFOLENBQTFDLENBSEosQ0FESixDQUpKLGVBV0ksd0NBQ00seUJBQUcsNkVBQUgsQ0FETixDQVhKLENBREo7O0FBa0JBLHdCQUNJLDZCQUFDLGNBQUQ7QUFDSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxnQkFBSCxDQURYO0FBRUksTUFBQSxXQUFXLEVBQUVJLElBRmpCO0FBR0ksTUFBQSxNQUFNLEVBQUUseUJBQUcsZ0JBQUgsQ0FIWjtBQUlJLE1BQUEsVUFBVSxFQUFFLEtBQUtFO0FBSnJCLE1BREo7QUFRSDs7QUF6RDBFLEMsc0RBQ3hEO0FBQ2ZmLEVBQUFBLE1BQU0sRUFBRWdCLG1CQUFVQyxNQUFWLENBQWlCQyxVQURWO0FBRWZqQixFQUFBQSxNQUFNLEVBQUVlLG1CQUFVRyxNQUFWLENBQWlCRCxVQUZWO0FBR2Z2QixFQUFBQSxVQUFVLEVBQUVxQixtQkFBVUksSUFBVixDQUFlRjtBQUhaLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRm9ybWF0dGluZ1V0aWxzIGZyb20gJy4uLy4uLy4uL3V0aWxzL0Zvcm1hdHRpbmdVdGlscyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5NYW51YWxEZXZpY2VLZXlWZXJpZmljYXRpb25EaWFsb2dcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hbnVhbERldmljZUtleVZlcmlmaWNhdGlvbkRpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgdXNlcklkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGRldmljZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBfb25DYW5jZWxDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9XG5cbiAgICBfb25MZWdhY3lGaW5pc2hlZCA9IChjb25maXJtKSA9PiB7XG4gICAgICAgIGlmIChjb25maXJtKSB7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0RGV2aWNlVmVyaWZpZWQoXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy51c2VySWQsIHRoaXMucHJvcHMuZGV2aWNlLmRldmljZUlkLCB0cnVlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoY29uZmlybSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuXG4gICAgICAgIGxldCB0ZXh0O1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpID09PSB0aGlzLnByb3BzLnVzZXJJZCkge1xuICAgICAgICAgICAgdGV4dCA9IF90KFwiQ29uZmlybSBieSBjb21wYXJpbmcgdGhlIGZvbGxvd2luZyB3aXRoIHRoZSBVc2VyIFNldHRpbmdzIGluIHlvdXIgb3RoZXIgc2Vzc2lvbjpcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZXh0ID0gX3QoXCJDb25maXJtIHRoaXMgdXNlcidzIHNlc3Npb24gYnkgY29tcGFyaW5nIHRoZSBmb2xsb3dpbmcgd2l0aCB0aGVpciBVc2VyIFNldHRpbmdzOlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGtleSA9IEZvcm1hdHRpbmdVdGlscy5mb3JtYXRDcnlwdG9LZXkodGhpcy5wcm9wcy5kZXZpY2UuZ2V0RmluZ2VycHJpbnQoKSk7XG4gICAgICAgIGNvbnN0IGJvZHkgPSAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICB7IHRleHQgfVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldmljZVZlcmlmeURpYWxvZ19jcnlwdG9TZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaT48bGFiZWw+eyBfdChcIlNlc3Npb24gbmFtZVwiKSB9OjwvbGFiZWw+IDxzcGFuPnsgdGhpcy5wcm9wcy5kZXZpY2UuZ2V0RGlzcGxheU5hbWUoKSB9PC9zcGFuPjwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGk+PGxhYmVsPnsgX3QoXCJTZXNzaW9uIElEXCIpIH06PC9sYWJlbD4gPHNwYW4+PGNvZGU+eyB0aGlzLnByb3BzLmRldmljZS5kZXZpY2VJZCB9PC9jb2RlPjwvc3Bhbj48L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPjxsYWJlbD57IF90KFwiU2Vzc2lvbiBrZXlcIikgfTo8L2xhYmVsPiA8c3Bhbj48Y29kZT48Yj57IGtleSB9PC9iPjwvY29kZT48L3NwYW4+PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIklmIHRoZXkgZG9uJ3QgbWF0Y2gsIHRoZSBzZWN1cml0eSBvZiB5b3VyIGNvbW11bmljYXRpb24gbWF5IGJlIGNvbXByb21pc2VkLlwiKSB9XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxRdWVzdGlvbkRpYWxvZ1xuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlZlcmlmeSBzZXNzaW9uXCIpfVxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtib2R5fVxuICAgICAgICAgICAgICAgIGJ1dHRvbj17X3QoXCJWZXJpZnkgc2Vzc2lvblwiKX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLl9vbkxlZ2FjeUZpbmlzaGVkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
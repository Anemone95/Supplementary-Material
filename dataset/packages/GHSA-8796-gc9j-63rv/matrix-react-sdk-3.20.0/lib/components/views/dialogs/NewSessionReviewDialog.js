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

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _VerificationRequestDialog = _interopRequireDefault(require("./VerificationRequestDialog"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _dec, _class, _class2, _temp;

let NewSessionReviewDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.NewSessionReviewDialog"), _dec(_class = (_temp = _class2 = class NewSessionReviewDialog extends _react.default.PureComponent {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

      _Modal.default.createTrackedDialog("Verification failed", "insecure", ErrorDialog, {
        headerImage: require("../../../../res/img/e2e/warning.svg"),
        title: (0, _languageHandler._t)("Your account is not secure"),
        description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("One of the following may be compromised:"), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your password")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your homeserver")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("This session, or the other session")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("The internet connection either session is using"))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("We recommend you change your password and Security Key in Settings immediately"))),
        onFinished: () => this.props.onFinished(false)
      });
    });
    (0, _defineProperty2.default)(this, "onContinueClick", () => {
      const {
        userId,
        device
      } = this.props;

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const requestPromise = cli.requestVerification(userId, [device.deviceId]);
      this.props.onFinished(true);

      _Modal.default.createTrackedDialog('New Session Verification', 'Starting dialog', _VerificationRequestDialog.default, {
        verificationRequestPromise: requestPromise,
        member: cli.getUser(userId),
        onFinished: async () => {
          const request = await requestPromise;
          request.cancel();
        }
      });
    });
  }

  render() {
    const {
      device
    } = this.props;

    const icon = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_NewSessionReviewDialog_headerIcon mx_E2EIcon_warning"
    });

    const titleText = (0, _languageHandler._t)("New session");

    const title = /*#__PURE__*/_react.default.createElement("h2", {
      className: "mx_NewSessionReviewDialog_header"
    }, icon, titleText);

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      title: title,
      onFinished: this.props.onFinished
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_NewSessionReviewDialog_body"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Use this session to verify your new one, " + "granting it access to encrypted messages:")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_NewSessionReviewDialog_deviceInfo"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_NewSessionReviewDialog_deviceName"
    }, device.getDisplayName()), " ", /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_NewSessionReviewDialog_deviceID"
    }, "(", device.deviceId, ")"))), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you didn’t sign in to this session, " + "your account may be compromised.")), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      cancelButton: (0, _languageHandler._t)("This wasn't me"),
      cancelButtonClass: "danger",
      primaryButton: (0, _languageHandler._t)("Continue"),
      onCancel: this.onCancelClick,
      onPrimaryButtonClick: this.onContinueClick
    })));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  userId: _propTypes.default.string.isRequired,
  device: _propTypes.default.object.isRequired,
  onFinished: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = NewSessionReviewDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTmV3U2Vzc2lvblJldmlld0RpYWxvZy5qcyJdLCJuYW1lcyI6WyJOZXdTZXNzaW9uUmV2aWV3RGlhbG9nIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJoZWFkZXJJbWFnZSIsInJlcXVpcmUiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwib25GaW5pc2hlZCIsInByb3BzIiwidXNlcklkIiwiZGV2aWNlIiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwicmVxdWVzdFByb21pc2UiLCJyZXF1ZXN0VmVyaWZpY2F0aW9uIiwiZGV2aWNlSWQiLCJWZXJpZmljYXRpb25SZXF1ZXN0RGlhbG9nIiwidmVyaWZpY2F0aW9uUmVxdWVzdFByb21pc2UiLCJtZW1iZXIiLCJnZXRVc2VyIiwicmVxdWVzdCIsImNhbmNlbCIsInJlbmRlciIsImljb24iLCJ0aXRsZVRleHQiLCJnZXREaXNwbGF5TmFtZSIsIm9uQ2FuY2VsQ2xpY2siLCJvbkNvbnRpbnVlQ2xpY2siLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwib2JqZWN0IiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsc0IsV0FEcEIsZ0RBQXFCLHNDQUFyQixDLG1DQUFELE1BQ3FCQSxzQkFEckIsU0FDb0RDLGVBQU1DLGFBRDFELENBQ3dFO0FBQUE7QUFBQTtBQUFBLHlEQU9wRCxNQUFNO0FBQ2xCLFlBQU1DLFdBQVcsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUFwQjs7QUFDQUMscUJBQU1DLG1CQUFOLENBQTBCLHFCQUExQixFQUFpRCxVQUFq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Q2ZuQixFQUFBQSxNQUFNLEVBQUVvQixtQkFBVUMsTUFBVixDQUFpQkMsVUFEVjtBQUVmckIsRUFBQUEsTUFBTSxFQUFFbUIsbUJBQVVHLE1BQVYsQ0FBaUJELFVBRlY7QUFHZnhCLEVBQUFBLFVBQVUsRUFBRXNCLG1CQUFVSSxJQUFWLENBQWVGO0FBSFosQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IHJlcGxhY2VhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnQnO1xuaW1wb3J0IFZlcmlmaWNhdGlvblJlcXVlc3REaWFsb2cgZnJvbSAnLi9WZXJpZmljYXRpb25SZXF1ZXN0RGlhbG9nJztcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gJy4vQmFzZURpYWxvZyc7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tICcuLi9lbGVtZW50cy9EaWFsb2dCdXR0b25zJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLk5ld1Nlc3Npb25SZXZpZXdEaWFsb2dcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ld1Nlc3Npb25SZXZpZXdEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICB1c2VySWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgZGV2aWNlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfVxuXG4gICAgb25DYW5jZWxDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcIlZlcmlmaWNhdGlvbiBmYWlsZWRcIiwgXCJpbnNlY3VyZVwiLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgaGVhZGVySW1hZ2U6IHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2UyZS93YXJuaW5nLnN2Z1wiKSxcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIllvdXIgYWNjb3VudCBpcyBub3Qgc2VjdXJlXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXY+XG4gICAgICAgICAgICAgICAge190KFwiT25lIG9mIHRoZSBmb2xsb3dpbmcgbWF5IGJlIGNvbXByb21pc2VkOlwiKX1cbiAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJZb3VyIHBhc3N3b3JkXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJZb3VyIGhvbWVzZXJ2ZXJcIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIlRoaXMgc2Vzc2lvbiwgb3IgdGhlIG90aGVyIHNlc3Npb25cIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIlRoZSBpbnRlcm5ldCBjb25uZWN0aW9uIGVpdGhlciBzZXNzaW9uIGlzIHVzaW5nXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJXZSByZWNvbW1lbmQgeW91IGNoYW5nZSB5b3VyIHBhc3N3b3JkIGFuZCBTZWN1cml0eSBLZXkgaW4gU2V0dGluZ3MgaW1tZWRpYXRlbHlcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAoKSA9PiB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkNvbnRpbnVlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdXNlcklkLCBkZXZpY2UgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdFByb21pc2UgPSBjbGkucmVxdWVzdFZlcmlmaWNhdGlvbihcbiAgICAgICAgICAgIHVzZXJJZCxcbiAgICAgICAgICAgIFtkZXZpY2UuZGV2aWNlSWRdLFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnTmV3IFNlc3Npb24gVmVyaWZpY2F0aW9uJywgJ1N0YXJ0aW5nIGRpYWxvZycsIFZlcmlmaWNhdGlvblJlcXVlc3REaWFsb2csIHtcbiAgICAgICAgICAgIHZlcmlmaWNhdGlvblJlcXVlc3RQcm9taXNlOiByZXF1ZXN0UHJvbWlzZSxcbiAgICAgICAgICAgIG1lbWJlcjogY2xpLmdldFVzZXIodXNlcklkKSxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gYXdhaXQgcmVxdWVzdFByb21pc2U7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5jYW5jZWwoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgeyBkZXZpY2UgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgY29uc3QgaWNvbiA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X05ld1Nlc3Npb25SZXZpZXdEaWFsb2dfaGVhZGVySWNvbiBteF9FMkVJY29uX3dhcm5pbmdcIj48L3NwYW4+O1xuICAgICAgICBjb25zdCB0aXRsZVRleHQgPSBfdChcIk5ldyBzZXNzaW9uXCIpO1xuXG4gICAgICAgIGNvbnN0IHRpdGxlID0gPGgyIGNsYXNzTmFtZT1cIm14X05ld1Nlc3Npb25SZXZpZXdEaWFsb2dfaGVhZGVyXCI+XG4gICAgICAgICAgICB7aWNvbn1cbiAgICAgICAgICAgIHt0aXRsZVRleHR9XG4gICAgICAgIDwvaDI+O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9OZXdTZXNzaW9uUmV2aWV3RGlhbG9nX2JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJVc2UgdGhpcyBzZXNzaW9uIHRvIHZlcmlmeSB5b3VyIG5ldyBvbmUsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZ3JhbnRpbmcgaXQgYWNjZXNzIHRvIGVuY3J5cHRlZCBtZXNzYWdlczpcIixcbiAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTmV3U2Vzc2lvblJldmlld0RpYWxvZ19kZXZpY2VJbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X05ld1Nlc3Npb25SZXZpZXdEaWFsb2dfZGV2aWNlTmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZGV2aWNlLmdldERpc3BsYXlOYW1lKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJteF9OZXdTZXNzaW9uUmV2aWV3RGlhbG9nX2RldmljZUlEXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh7ZGV2aWNlLmRldmljZUlkfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSWYgeW91IGRpZG7igJl0IHNpZ24gaW4gdG8gdGhpcyBzZXNzaW9uLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInlvdXIgYWNjb3VudCBtYXkgYmUgY29tcHJvbWlzZWQuXCIsXG4gICAgICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uPXtfdChcIlRoaXMgd2Fzbid0IG1lXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uQ2xhc3M9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoXCJDb250aW51ZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbkNvbnRpbnVlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
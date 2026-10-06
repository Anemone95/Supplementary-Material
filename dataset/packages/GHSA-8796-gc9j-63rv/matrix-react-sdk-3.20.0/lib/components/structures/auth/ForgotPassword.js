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

var sdk = _interopRequireWildcard(require("../../../index"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _PasswordReset = _interopRequireDefault(require("../../../PasswordReset"));

var _AutoDiscoveryUtils = _interopRequireWildcard(require("../../../utils/AutoDiscoveryUtils"));

var _classnames = _interopRequireDefault(require("classnames"));

var _AuthPage = _interopRequireDefault(require("../../views/auth/AuthPage"));

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _ServerPicker = _interopRequireDefault(require("../../views/elements/ServerPicker"));

var _PassphraseField = _interopRequireDefault(require("../../views/auth/PassphraseField"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _RegistrationForm = require("../../views/auth/RegistrationForm");

var _dec, _class, _class2, _temp;

// Phases
// Show the forgot password inputs
const PHASE_FORGOT = 1; // Email is in the process of being sent

const PHASE_SENDING_EMAIL = 2; // Email has been sent

const PHASE_EMAIL_SENT = 3; // User has clicked the link in email and completed reset

const PHASE_DONE = 4;
let ForgotPassword = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.auth.ForgotPassword"), _dec(_class = (_temp = _class2 = class ForgotPassword extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "state", {
      phase: PHASE_FORGOT,
      email: "",
      password: "",
      password2: "",
      errorText: null,
      // We perform liveliness checks later, but for now suppress the errors.
      // We also track the server dead errors independently of the regular errors so
      // that we can render it differently, and override any other error the user may
      // be seeing.
      serverIsAlive: true,
      serverErrorIsFatal: false,
      serverDeadError: ""
    });
    (0, _defineProperty2.default)(this, "onVerify", async ev => {
      ev.preventDefault();

      if (!this.reset) {
        console.error("onVerify called before submitPasswordReset!");
        return;
      }

      try {
        await this.reset.checkEmailLinkClicked();
        this.setState({
          phase: PHASE_DONE
        });
      } catch (err) {
        this.showErrorDialog(err.message);
      }
    });
    (0, _defineProperty2.default)(this, "onSubmitForm", async ev => {
      ev.preventDefault(); // refresh the server errors, just in case the server came back online

      await this._checkServerLiveliness(this.props.serverConfig);
      await this['password_field'].validate({
        allowEmpty: false
      });

      if (!this.state.email) {
        this.showErrorDialog((0, _languageHandler._t)('The email address linked to your account must be entered.'));
      } else if (!this.state.password || !this.state.password2) {
        this.showErrorDialog((0, _languageHandler._t)('A new password must be entered.'));
      } else if (!this.state.passwordFieldValid) {
        this.showErrorDialog((0, _languageHandler._t)('Please choose a strong password'));
      } else if (this.state.password !== this.state.password2) {
        this.showErrorDialog((0, _languageHandler._t)('New passwords must match each other.'));
      } else {
        const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

        _Modal.default.createTrackedDialog('Forgot Password Warning', '', QuestionDialog, {
          title: (0, _languageHandler._t)('Warning!'),
          description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Changing your password will reset any end-to-end encryption keys " + "on all of your sessions, making encrypted chat history unreadable. Set up " + "Key Backup or export your room keys from another session before resetting your " + "password.")),
          button: (0, _languageHandler._t)('Continue'),
          onFinished: confirmed => {
            if (confirmed) {
              this.submitPasswordReset(this.state.email, this.state.password);
            }
          }
        });
      }
    });
    (0, _defineProperty2.default)(this, "onInputChanged", (stateKey, ev) => {
      this.setState({
        [stateKey]: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onLoginClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onLoginClick();
    });

    _CountlyAnalytics.default.instance.track("onboarding_forgot_password_begin");
  }

  componentDidMount() {
    this.reset = null;

    this._checkServerLiveliness(this.props.serverConfig);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.serverConfig.hsUrl === this.props.serverConfig.hsUrl && newProps.serverConfig.isUrl === this.props.serverConfig.isUrl) return; // Do a liveliness check on the new URLs

    this._checkServerLiveliness(newProps.serverConfig);
  }

  async _checkServerLiveliness(serverConfig) {
    try {
      await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(serverConfig.hsUrl, serverConfig.isUrl);
      this.setState({
        serverIsAlive: true
      });
    } catch (e) {
      this.setState(_AutoDiscoveryUtils.default.authComponentStateForError(e, "forgot_password"));
    }
  }

  submitPasswordReset(email, password) {
    this.setState({
      phase: PHASE_SENDING_EMAIL
    });
    this.reset = new _PasswordReset.default(this.props.serverConfig.hsUrl, this.props.serverConfig.isUrl);
    this.reset.resetPassword(email, password).then(() => {
      this.setState({
        phase: PHASE_EMAIL_SENT
      });
    }, err => {
      this.showErrorDialog((0, _languageHandler._t)('Failed to send email') + ": " + err.message);
      this.setState({
        phase: PHASE_FORGOT
      });
    });
  }

  showErrorDialog(body, title) {
    const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

    _Modal.default.createTrackedDialog('Forgot Password Error', '', ErrorDialog, {
      title: title,
      description: body
    });
  }

  onPasswordValidate(result) {
    this.setState({
      passwordFieldValid: result.valid
    });
  }

  renderForgot() {
    const Field = sdk.getComponent('elements.Field');
    let errorText = null;
    const err = this.state.errorText;

    if (err) {
      errorText = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Login_error"
      }, err);
    }

    let serverDeadSection;

    if (!this.state.serverIsAlive) {
      const classes = (0, _classnames.default)({
        "mx_Login_error": true,
        "mx_Login_serverError": true,
        "mx_Login_serverErrorNonFatal": !this.state.serverErrorIsFatal
      });
      serverDeadSection = /*#__PURE__*/_react.default.createElement("div", {
        className: classes
      }, this.state.serverDeadError);
    }

    return /*#__PURE__*/_react.default.createElement("div", null, errorText, serverDeadSection, /*#__PURE__*/_react.default.createElement(_ServerPicker.default, {
      serverConfig: this.props.serverConfig,
      onServerConfigChange: this.props.onServerConfigChange
    }), /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmitForm
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, /*#__PURE__*/_react.default.createElement(Field, {
      name: "reset_email" // define a name so browser's password autofill gets less confused
      ,
      type: "text",
      label: (0, _languageHandler._t)('Email'),
      value: this.state.email,
      onChange: this.onInputChanged.bind(this, "email"),
      autoFocus: true,
      onFocus: () => _CountlyAnalytics.default.instance.track("onboarding_forgot_password_email_focus"),
      onBlur: () => _CountlyAnalytics.default.instance.track("onboarding_forgot_password_email_blur")
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
      name: "reset_password",
      type: "password",
      label: (0, _languageHandler._td)('New Password'),
      value: this.state.password,
      minScore: _RegistrationForm.PASSWORD_MIN_SCORE,
      onChange: this.onInputChanged.bind(this, "password"),
      fieldRef: field => this['password_field'] = field,
      onValidate: result => this.onPasswordValidate(result),
      onFocus: () => _CountlyAnalytics.default.instance.track("onboarding_forgot_password_newPassword_focus"),
      onBlur: () => _CountlyAnalytics.default.instance.track("onboarding_forgot_password_newPassword_blur"),
      autoComplete: "new-password"
    }), /*#__PURE__*/_react.default.createElement(Field, {
      name: "reset_password_confirm",
      type: "password",
      label: (0, _languageHandler._t)('Confirm'),
      value: this.state.password2,
      onChange: this.onInputChanged.bind(this, "password2"),
      onFocus: () => _CountlyAnalytics.default.instance.track("onboarding_forgot_password_newPassword2_focus"),
      onBlur: () => _CountlyAnalytics.default.instance.track("onboarding_forgot_password_newPassword2_blur"),
      autoComplete: "new-password"
    })), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)('A verification email will be sent to your inbox to confirm ' + 'setting your new password.')), /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "submit",
      value: (0, _languageHandler._t)('Send Reset Email')
    })), /*#__PURE__*/_react.default.createElement("a", {
      className: "mx_AuthBody_changeFlow",
      onClick: this.onLoginClick,
      href: "#"
    }, (0, _languageHandler._t)('Sign in instead')));
  }

  renderSendingEmail() {
    const Spinner = sdk.getComponent("elements.Spinner");
    return /*#__PURE__*/_react.default.createElement(Spinner, null);
  }

  renderEmailSent() {
    return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("An email has been sent to %(emailAddress)s. Once you've followed the " + "link it contains, click below.", {
      emailAddress: this.state.email
    }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "button",
      onClick: this.onVerify,
      value: (0, _languageHandler._t)('I have verified my email address')
    }));
  }

  renderDone() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your password has been reset.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You have been logged out of all sessions and will no longer receive " + "push notifications. To re-enable notifications, sign in again on each " + "device.")), /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "button",
      onClick: this.props.onComplete,
      value: (0, _languageHandler._t)('Return to login screen')
    }));
  }

  render() {
    const AuthHeader = sdk.getComponent("auth.AuthHeader");
    const AuthBody = sdk.getComponent("auth.AuthBody");
    let resetPasswordJsx;

    switch (this.state.phase) {
      case PHASE_FORGOT:
        resetPasswordJsx = this.renderForgot();
        break;

      case PHASE_SENDING_EMAIL:
        resetPasswordJsx = this.renderSendingEmail();
        break;

      case PHASE_EMAIL_SENT:
        resetPasswordJsx = this.renderEmailSent();
        break;

      case PHASE_DONE:
        resetPasswordJsx = this.renderDone();
        break;
    }

    return /*#__PURE__*/_react.default.createElement(_AuthPage.default, null, /*#__PURE__*/_react.default.createElement(AuthHeader, null), /*#__PURE__*/_react.default.createElement(AuthBody, null, /*#__PURE__*/_react.default.createElement("h2", null, " ", (0, _languageHandler._t)('Set a new password'), " "), resetPasswordJsx));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  serverConfig: _propTypes.default.instanceOf(_AutoDiscoveryUtils.ValidatedServerConfig).isRequired,
  onServerConfigChange: _propTypes.default.func.isRequired,
  onLoginClick: _propTypes.default.func,
  onComplete: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = ForgotPassword;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvYXV0aC9Gb3Jnb3RQYXNzd29yZC5qcyJdLCJuYW1lcyI6WyJQSEFTRV9GT1JHT1QiLCJQSEFTRV9TRU5ESU5HX0VNQUlMIiwiUEhBU0VfRU1BSUxfU0VOVCIsIlBIQVNFX0RPTkUiLCJGb3Jnb3RQYXNzd29yZCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInBoYXNlIiwiZW1haWwiLCJwYXNzd29yZCIsInBhc3N3b3JkMiIsImVycm9yVGV4dCIsInNlcnZlcklzQWxpdmUiLCJzZXJ2ZXJFcnJvcklzRmF0YWwiLCJzZXJ2ZXJEZWFkRXJyb3IiLCJldiIsInByZXZlbnREZWZhdWx0IiwicmVzZXQiLCJjb25zb2xlIiwiZXJyb3IiLCJjaGVja0VtYWlsTGlua0NsaWNrZWQiLCJzZXRTdGF0ZSIsImVyciIsInNob3dFcnJvckRpYWxvZyIsIm1lc3NhZ2UiLCJfY2hlY2tTZXJ2ZXJMaXZlbGluZXNzIiwic2VydmVyQ29uZmlnIiwidmFsaWRhdGUiLCJhbGxvd0VtcHR5Iiwic3RhdGUiLCJwYXNzd29yZEZpZWxkVmFsaWQiLCJRdWVzdGlvbkRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJvbkZpbmlzaGVkIiwiY29uZmlybWVkIiwic3VibWl0UGFzc3dvcmRSZXNldCIsInN0YXRlS2V5IiwidGFyZ2V0IiwidmFsdWUiLCJzdG9wUHJvcGFnYXRpb24iLCJvbkxvZ2luQ2xpY2siLCJDb3VudGx5QW5hbHl0aWNzIiwiaW5zdGFuY2UiLCJ0cmFjayIsImNvbXBvbmVudERpZE1vdW50IiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsImhzVXJsIiwiaXNVcmwiLCJBdXRvRGlzY292ZXJ5VXRpbHMiLCJ2YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzIiwiZSIsImF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yIiwiUGFzc3dvcmRSZXNldCIsInJlc2V0UGFzc3dvcmQiLCJ0aGVuIiwiYm9keSIsIkVycm9yRGlhbG9nIiwib25QYXNzd29yZFZhbGlkYXRlIiwicmVzdWx0IiwidmFsaWQiLCJyZW5kZXJGb3Jnb3QiLCJGaWVsZCIsInNlcnZlckRlYWRTZWN0aW9uIiwiY2xhc3NlcyIsIm9uU2VydmVyQ29uZmlnQ2hhbmdlIiwib25TdWJtaXRGb3JtIiwib25JbnB1dENoYW5nZWQiLCJiaW5kIiwiUEFTU1dPUkRfTUlOX1NDT1JFIiwiZmllbGQiLCJyZW5kZXJTZW5kaW5nRW1haWwiLCJTcGlubmVyIiwicmVuZGVyRW1haWxTZW50IiwiZW1haWxBZGRyZXNzIiwib25WZXJpZnkiLCJyZW5kZXJEb25lIiwib25Db21wbGV0ZSIsInJlbmRlciIsIkF1dGhIZWFkZXIiLCJBdXRoQm9keSIsInJlc2V0UGFzc3dvcmRKc3giLCJQcm9wVHlwZXMiLCJpbnN0YW5jZU9mIiwiVmFsaWRhdGVkU2VydmVyQ29uZmlnIiwiaXNSZXF1aXJlZCIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTtBQUNBO0FBQ0EsTUFBTUEsWUFBWSxHQUFHLENBQXJCLEMsQ0FDQTs7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxDQUE1QixDLENBQ0E7O0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsQ0FBekIsQyxDQUNBOztBQUNBLE1BQU1DLFVBQVUsR0FBRyxDQUFuQjtJQUdxQkMsYyxXQURwQixnREFBcUIsZ0NBQXJCLEMsbUNBQUQsTUFDcUJBLGNBRHJCLFNBQzRDQyxlQUFNQyxTQURsRCxDQUM0RDtBQXdCeERDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFB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QUFELHFCQUNJLDhDQUFPLHlCQUFHLG9CQUFILENBQVAsTUFESixFQUVLSyxnQkFGTCxDQUZKLENBREo7QUFTSDs7QUF6U3VELEMsc0RBQ3JDO0FBQ2Y3RCxFQUFBQSxZQUFZLEVBQUU4RCxtQkFBVUMsVUFBVixDQUFxQkMseUNBQXJCLEVBQTRDQyxVQUQzQztBQUVmcEIsRUFBQUEsb0JBQW9CLEVBQUVpQixtQkFBVUksSUFBVixDQUFlRCxVQUZ0QjtBQUdmN0MsRUFBQUEsWUFBWSxFQUFFMEMsbUJBQVVJLElBSFQ7QUFJZlQsRUFBQUEsVUFBVSxFQUFFSyxtQkFBVUksSUFBVixDQUFlRDtBQUpaLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFBhc3N3b3JkUmVzZXQgZnJvbSBcIi4uLy4uLy4uL1Bhc3N3b3JkUmVzZXRcIjtcbmltcG9ydCBBdXRvRGlzY292ZXJ5VXRpbHMsIHtWYWxpZGF0ZWRTZXJ2ZXJDb25maWd9IGZyb20gXCIuLi8uLi8uLi91dGlscy9BdXRvRGlzY292ZXJ5VXRpbHNcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IEF1dGhQYWdlIGZyb20gXCIuLi8uLi92aWV3cy9hdXRoL0F1dGhQYWdlXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vLi4vLi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IFNlcnZlclBpY2tlciBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvU2VydmVyUGlja2VyXCI7XG5pbXBvcnQgUGFzc3BocmFzZUZpZWxkIGZyb20gJy4uLy4uL3ZpZXdzL2F1dGgvUGFzc3BocmFzZUZpZWxkJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IHsgUEFTU1dPUkRfTUlOX1NDT1JFIH0gZnJvbSAnLi4vLi4vdmlld3MvYXV0aC9SZWdpc3RyYXRpb25Gb3JtJztcblxuLy8gUGhhc2VzXG4vLyBTaG93IHRoZSBmb3Jnb3QgcGFzc3dvcmQgaW5wdXRzXG5jb25zdCBQSEFTRV9GT1JHT1QgPSAxO1xuLy8gRW1haWwgaXMgaW4gdGhlIHByb2Nlc3Mgb2YgYmVpbmcgc2VudFxuY29uc3QgUEhBU0VfU0VORElOR19FTUFJTCA9IDI7XG4vLyBFbWFpbCBoYXMgYmVlbiBzZW50XG5jb25zdCBQSEFTRV9FTUFJTF9TRU5UID0gMztcbi8vIFVzZXIgaGFzIGNsaWNrZWQgdGhlIGxpbmsgaW4gZW1haWwgYW5kIGNvbXBsZXRlZCByZXNldFxuY29uc3QgUEhBU0VfRE9ORSA9IDQ7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInN0cnVjdHVyZXMuYXV0aC5Gb3Jnb3RQYXNzd29yZFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRm9yZ290UGFzc3dvcmQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHNlcnZlckNvbmZpZzogUHJvcFR5cGVzLmluc3RhbmNlT2YoVmFsaWRhdGVkU2VydmVyQ29uZmlnKS5pc1JlcXVpcmVkLFxuICAgICAgICBvblNlcnZlckNvbmZpZ0NoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Mb2dpbkNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25Db21wbGV0ZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHBoYXNlOiBQSEFTRV9GT1JHT1QsXG4gICAgICAgIGVtYWlsOiBcIlwiLFxuICAgICAgICBwYXNzd29yZDogXCJcIixcbiAgICAgICAgcGFzc3dvcmQyOiBcIlwiLFxuICAgICAgICBlcnJvclRleHQ6IG51bGwsXG5cbiAgICAgICAgLy8gV2UgcGVyZm9ybSBsaXZlbGluZXNzIGNoZWNrcyBsYXRlciwgYnV0IGZvciBub3cgc3VwcHJlc3MgdGhlIGVycm9ycy5cbiAgICAgICAgLy8gV2UgYWxzbyB0cmFjayB0aGUgc2VydmVyIGRlYWQgZXJyb3JzIGluZGVwZW5kZW50bHkgb2YgdGhlIHJlZ3VsYXIgZXJyb3JzIHNvXG4gICAgICAgIC8vIHRoYXQgd2UgY2FuIHJlbmRlciBpdCBkaWZmZXJlbnRseSwgYW5kIG92ZXJyaWRlIGFueSBvdGhlciBlcnJvciB0aGUgdXNlciBtYXlcbiAgICAgICAgLy8gYmUgc2VlaW5nLlxuICAgICAgICBzZXJ2ZXJJc0FsaXZlOiB0cnVlLFxuICAgICAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGZhbHNlLFxuICAgICAgICBzZXJ2ZXJEZWFkRXJyb3I6IFwiXCIsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19mb3Jnb3RfcGFzc3dvcmRfYmVnaW5cIik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMucmVzZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9jaGVja1NlcnZlckxpdmVsaW5lc3ModGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIGlmIChuZXdQcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmwgPT09IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsICYmXG4gICAgICAgICAgICBuZXdQcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwgPT09IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmlzVXJsKSByZXR1cm47XG5cbiAgICAgICAgLy8gRG8gYSBsaXZlbGluZXNzIGNoZWNrIG9uIHRoZSBuZXcgVVJMc1xuICAgICAgICB0aGlzLl9jaGVja1NlcnZlckxpdmVsaW5lc3MobmV3UHJvcHMuc2VydmVyQ29uZmlnKTtcbiAgICB9XG5cbiAgICBhc3luYyBfY2hlY2tTZXJ2ZXJMaXZlbGluZXNzKHNlcnZlckNvbmZpZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgQXV0b0Rpc2NvdmVyeVV0aWxzLnZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMoXG4gICAgICAgICAgICAgICAgc2VydmVyQ29uZmlnLmhzVXJsLFxuICAgICAgICAgICAgICAgIHNlcnZlckNvbmZpZy5pc1VybCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShBdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IoZSwgXCJmb3Jnb3RfcGFzc3dvcmRcIikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3VibWl0UGFzc3dvcmRSZXNldChlbWFpbCwgcGFzc3dvcmQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogUEhBU0VfU0VORElOR19FTUFJTCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVzZXQgPSBuZXcgUGFzc3dvcmRSZXNldCh0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybCwgdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwpO1xuICAgICAgICB0aGlzLnJlc2V0LnJlc2V0UGFzc3dvcmQoZW1haWwsIHBhc3N3b3JkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9FTUFJTF9TRU5ULFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9yRGlhbG9nKF90KCdGYWlsZWQgdG8gc2VuZCBlbWFpbCcpICsgXCI6IFwiICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IFBIQVNFX0ZPUkdPVCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblZlcmlmeSA9IGFzeW5jIGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCF0aGlzLnJlc2V0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwib25WZXJpZnkgY2FsbGVkIGJlZm9yZSBzdWJtaXRQYXNzd29yZFJlc2V0IVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZXNldC5jaGVja0VtYWlsTGlua0NsaWNrZWQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUEhBU0VfRE9ORSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvckRpYWxvZyhlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25TdWJtaXRGb3JtID0gYXN5bmMgZXYgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIC8vIHJlZnJlc2ggdGhlIHNlcnZlciBlcnJvcnMsIGp1c3QgaW4gY2FzZSB0aGUgc2VydmVyIGNhbWUgYmFjayBvbmxpbmVcbiAgICAgICAgYXdhaXQgdGhpcy5fY2hlY2tTZXJ2ZXJMaXZlbGluZXNzKHRoaXMucHJvcHMuc2VydmVyQ29uZmlnKTtcblxuICAgICAgICBhd2FpdCB0aGlzWydwYXNzd29yZF9maWVsZCddLnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmVtYWlsKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvckRpYWxvZyhfdCgnVGhlIGVtYWlsIGFkZHJlc3MgbGlua2VkIHRvIHlvdXIgYWNjb3VudCBtdXN0IGJlIGVudGVyZWQuJykpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnN0YXRlLnBhc3N3b3JkIHx8ICF0aGlzLnN0YXRlLnBhc3N3b3JkMikge1xuICAgICAgICAgICAgdGhpcy5zaG93RXJyb3JEaWFsb2coX3QoJ0EgbmV3IHBhc3N3b3JkIG11c3QgYmUgZW50ZXJlZC4nKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUucGFzc3dvcmRGaWVsZFZhbGlkKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvckRpYWxvZyhfdCgnUGxlYXNlIGNob29zZSBhIHN0cm9uZyBwYXNzd29yZCcpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnBhc3N3b3JkICE9PSB0aGlzLnN0YXRlLnBhc3N3b3JkMikge1xuICAgICAgICAgICAgdGhpcy5zaG93RXJyb3JEaWFsb2coX3QoJ05ldyBwYXNzd29yZHMgbXVzdCBtYXRjaCBlYWNoIG90aGVyLicpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGb3Jnb3QgUGFzc3dvcmQgV2FybmluZycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnV2FybmluZyEnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJDaGFuZ2luZyB5b3VyIHBhc3N3b3JkIHdpbGwgcmVzZXQgYW55IGVuZC10by1lbmQgZW5jcnlwdGlvbiBrZXlzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm9uIGFsbCBvZiB5b3VyIHNlc3Npb25zLCBtYWtpbmcgZW5jcnlwdGVkIGNoYXQgaGlzdG9yeSB1bnJlYWRhYmxlLiBTZXQgdXAgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiS2V5IEJhY2t1cCBvciBleHBvcnQgeW91ciByb29tIGtleXMgZnJvbSBhbm90aGVyIHNlc3Npb24gYmVmb3JlIHJlc2V0dGluZyB5b3VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhc3N3b3JkLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICAgICBidXR0b246IF90KCdDb250aW51ZScpLFxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IChjb25maXJtZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtaXRQYXNzd29yZFJlc2V0KHRoaXMuc3RhdGUuZW1haWwsIHRoaXMuc3RhdGUucGFzc3dvcmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uSW5wdXRDaGFuZ2VkID0gKHN0YXRlS2V5LCBldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIFtzdGF0ZUtleV06IGV2LnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uTG9naW5DbGljayA9IGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25Mb2dpbkNsaWNrKCk7XG4gICAgfTtcblxuICAgIHNob3dFcnJvckRpYWxvZyhib2R5LCB0aXRsZSkge1xuICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGb3Jnb3QgUGFzc3dvcmQgRXJyb3InLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBib2R5LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblBhc3N3b3JkVmFsaWRhdGUocmVzdWx0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFzc3dvcmRGaWVsZFZhbGlkOiByZXN1bHQudmFsaWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlckZvcmdvdCgpIHtcbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5GaWVsZCcpO1xuXG4gICAgICAgIGxldCBlcnJvclRleHQgPSBudWxsO1xuICAgICAgICBjb25zdCBlcnIgPSB0aGlzLnN0YXRlLmVycm9yVGV4dDtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgZXJyb3JUZXh0ID0gPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9lcnJvclwiPnsgZXJyIH08L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2VydmVyRGVhZFNlY3Rpb247XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zZXJ2ZXJJc0FsaXZlKSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgXCJteF9Mb2dpbl9lcnJvclwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwibXhfTG9naW5fc2VydmVyRXJyb3JcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0xvZ2luX3NlcnZlckVycm9yTm9uRmF0YWxcIjogIXRoaXMuc3RhdGUuc2VydmVyRXJyb3JJc0ZhdGFsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXJ2ZXJEZWFkU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLnNlcnZlckRlYWRFcnJvcn1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIHtlcnJvclRleHR9XG4gICAgICAgICAgICB7c2VydmVyRGVhZFNlY3Rpb259XG4gICAgICAgICAgICA8U2VydmVyUGlja2VyXG4gICAgICAgICAgICAgICAgc2VydmVyQ29uZmlnPXt0aGlzLnByb3BzLnNlcnZlckNvbmZpZ31cbiAgICAgICAgICAgICAgICBvblNlcnZlckNvbmZpZ0NoYW5nZT17dGhpcy5wcm9wcy5vblNlcnZlckNvbmZpZ0NoYW5nZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdEZvcm19PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfZmllbGRSb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwicmVzZXRfZW1haWxcIiAvLyBkZWZpbmUgYSBuYW1lIHNvIGJyb3dzZXIncyBwYXNzd29yZCBhdXRvZmlsbCBnZXRzIGxlc3MgY29uZnVzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnRW1haWwnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmVtYWlsfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25JbnB1dENoYW5nZWQuYmluZCh0aGlzLCBcImVtYWlsXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZvY3VzPXsoKSA9PiBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19mb3Jnb3RfcGFzc3dvcmRfZW1haWxfZm9jdXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkJsdXI9eygpID0+IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX2ZvcmdvdF9wYXNzd29yZF9lbWFpbF9ibHVyXCIpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfZmllbGRSb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgPFBhc3NwaHJhc2VGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInJlc2V0X3Bhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3RkKCdOZXcgUGFzc3dvcmQnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICAgICAgbWluU2NvcmU9e1BBU1NXT1JEX01JTl9TQ09SRX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uSW5wdXRDaGFuZ2VkLmJpbmQodGhpcywgXCJwYXNzd29yZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkUmVmPXtmaWVsZCA9PiB0aGlzWydwYXNzd29yZF9maWVsZCddID0gZmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXsocmVzdWx0KSA9PiB0aGlzLm9uUGFzc3dvcmRWYWxpZGF0ZShyZXN1bHQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2N1cz17KCkgPT4gQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfZm9yZ290X3Bhc3N3b3JkX25ld1Bhc3N3b3JkX2ZvY3VzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25CbHVyPXsoKSA9PiBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19mb3Jnb3RfcGFzc3dvcmRfbmV3UGFzc3dvcmRfYmx1clwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInJlc2V0X3Bhc3N3b3JkX2NvbmZpcm1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnQ29uZmlybScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc3dvcmQyfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25JbnB1dENoYW5nZWQuYmluZCh0aGlzLCBcInBhc3N3b3JkMlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9eygpID0+IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX2ZvcmdvdF9wYXNzd29yZF9uZXdQYXNzd29yZDJfZm9jdXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkJsdXI9eygpID0+IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX2ZvcmdvdF9wYXNzd29yZF9uZXdQYXNzd29yZDJfYmx1clwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4+e190KFxuICAgICAgICAgICAgICAgICAgICAnQSB2ZXJpZmljYXRpb24gZW1haWwgd2lsbCBiZSBzZW50IHRvIHlvdXIgaW5ib3ggdG8gY29uZmlybSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ3NldHRpbmcgeW91ciBuZXcgcGFzc3dvcmQuJyxcbiAgICAgICAgICAgICAgICApfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTG9naW5fc3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtfdCgnU2VuZCBSZXNldCBFbWFpbCcpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8YSBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9jaGFuZ2VGbG93XCIgb25DbGljaz17dGhpcy5vbkxvZ2luQ2xpY2t9IGhyZWY9XCIjXCI+XG4gICAgICAgICAgICAgICAge190KCdTaWduIGluIGluc3RlYWQnKX1cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHJlbmRlclNlbmRpbmdFbWFpbCgpIHtcbiAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICByZXR1cm4gPFNwaW5uZXIgLz47XG4gICAgfVxuXG4gICAgcmVuZGVyRW1haWxTZW50KCkge1xuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIHtfdChcIkFuIGVtYWlsIGhhcyBiZWVuIHNlbnQgdG8gJShlbWFpbEFkZHJlc3Mpcy4gT25jZSB5b3UndmUgZm9sbG93ZWQgdGhlIFwiICtcbiAgICAgICAgICAgICAgICBcImxpbmsgaXQgY29udGFpbnMsIGNsaWNrIGJlbG93LlwiLCB7IGVtYWlsQWRkcmVzczogdGhpcy5zdGF0ZS5lbWFpbCB9KX1cbiAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIm14X0xvZ2luX3N1Ym1pdFwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLm9uVmVyaWZ5fVxuICAgICAgICAgICAgICAgIHZhbHVlPXtfdCgnSSBoYXZlIHZlcmlmaWVkIG15IGVtYWlsIGFkZHJlc3MnKX0gLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHJlbmRlckRvbmUoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPHA+e190KFwiWW91ciBwYXNzd29yZCBoYXMgYmVlbiByZXNldC5cIil9PC9wPlxuICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgIFwiWW91IGhhdmUgYmVlbiBsb2dnZWQgb3V0IG9mIGFsbCBzZXNzaW9ucyBhbmQgd2lsbCBubyBsb25nZXIgcmVjZWl2ZSBcIiArXG4gICAgICAgICAgICAgICAgXCJwdXNoIG5vdGlmaWNhdGlvbnMuIFRvIHJlLWVuYWJsZSBub3RpZmljYXRpb25zLCBzaWduIGluIGFnYWluIG9uIGVhY2ggXCIgK1xuICAgICAgICAgICAgICAgIFwiZGV2aWNlLlwiLFxuICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICA8aW5wdXQgY2xhc3NOYW1lPVwibXhfTG9naW5fc3VibWl0XCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucHJvcHMub25Db21wbGV0ZX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17X3QoJ1JldHVybiB0byBsb2dpbiBzY3JlZW4nKX0gLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQXV0aEhlYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJhdXRoLkF1dGhIZWFkZXJcIik7XG4gICAgICAgIGNvbnN0IEF1dGhCb2R5ID0gc2RrLmdldENvbXBvbmVudChcImF1dGguQXV0aEJvZHlcIik7XG5cbiAgICAgICAgbGV0IHJlc2V0UGFzc3dvcmRKc3g7XG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5waGFzZSkge1xuICAgICAgICAgICAgY2FzZSBQSEFTRV9GT1JHT1Q6XG4gICAgICAgICAgICAgICAgcmVzZXRQYXNzd29yZEpzeCA9IHRoaXMucmVuZGVyRm9yZ290KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX1NFTkRJTkdfRU1BSUw6XG4gICAgICAgICAgICAgICAgcmVzZXRQYXNzd29yZEpzeCA9IHRoaXMucmVuZGVyU2VuZGluZ0VtYWlsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX0VNQUlMX1NFTlQ6XG4gICAgICAgICAgICAgICAgcmVzZXRQYXNzd29yZEpzeCA9IHRoaXMucmVuZGVyRW1haWxTZW50KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX0RPTkU6XG4gICAgICAgICAgICAgICAgcmVzZXRQYXNzd29yZEpzeCA9IHRoaXMucmVuZGVyRG9uZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBdXRoUGFnZT5cbiAgICAgICAgICAgICAgICA8QXV0aEhlYWRlciAvPlxuICAgICAgICAgICAgICAgIDxBdXRoQm9keT5cbiAgICAgICAgICAgICAgICAgICAgPGgyPiB7IF90KCdTZXQgYSBuZXcgcGFzc3dvcmQnKSB9IDwvaDI+XG4gICAgICAgICAgICAgICAgICAgIHtyZXNldFBhc3N3b3JkSnN4fVxuICAgICAgICAgICAgICAgIDwvQXV0aEJvZHk+XG4gICAgICAgICAgICA8L0F1dGhQYWdlPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
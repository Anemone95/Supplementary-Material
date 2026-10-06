"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018, 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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
// Phases
// Show the forgot password inputs
const PHASE_FORGOT = 1; // Email is in the process of being sent

const PHASE_SENDING_EMAIL = 2; // Email has been sent

const PHASE_EMAIL_SENT = 3; // User has clicked the link in email and completed reset

const PHASE_DONE = 4;

class ForgotPassword extends _react.default.Component {
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

      if (!this.state.email) {
        this.showErrorDialog((0, _languageHandler._t)('The email address linked to your account must be entered.'));
      } else if (!this.state.password || !this.state.password2) {
        this.showErrorDialog((0, _languageHandler._t)('A new password must be entered.'));
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
    }, /*#__PURE__*/_react.default.createElement(Field, {
      name: "reset_password",
      type: "password",
      label: (0, _languageHandler._t)('New Password'),
      value: this.state.password,
      onChange: this.onInputChanged.bind(this, "password"),
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

}

exports.default = ForgotPassword;
(0, _defineProperty2.default)(ForgotPassword, "propTypes", {
  serverConfig: _propTypes.default.instanceOf(_AutoDiscoveryUtils.ValidatedServerConfig).isRequired,
  onServerConfigChange: _propTypes.default.func.isRequired,
  onLoginClick: _propTypes.default.func,
  onComplete: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvYXV0aC9Gb3Jnb3RQYXNzd29yZC5qcyJdLCJuYW1lcyI6WyJQSEFTRV9GT1JHT1QiLCJQSEFTRV9TRU5ESU5HX0VNQUlMIiwiUEhBU0VfRU1BSUxfU0VOVCIsIlBIQVNFX0RPTkUiLCJGb3Jnb3RQYXNzd29yZCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInBoYXNlIiwiZW1haWwiLCJwYXNzd29yZCIsInBhc3N3b3JkMiIsImVycm9yVGV4dCIsInNlcnZlcklzQWxpdmUiLCJzZXJ2ZXJFcnJvcklzRmF0YWwiLCJzZXJ2ZXJEZWFkRXJyb3IiLCJldiIsInByZXZlbnREZWZhdWx0IiwicmVzZXQiLCJjb25zb2xlIiwiZXJyb3IiLCJjaGVja0VtYWlsTGlua0NsaWNrZWQiLCJzZXRTdGF0ZSIsImVyciIsInNob3dFcnJvckRpYWxvZyIsIm1lc3NhZ2UiLCJfY2hlY2tTZXJ2ZXJMaXZlbGluZXNzIiwic2VydmVyQ29uZmlnIiwic3RhdGUiLCJRdWVzdGlvbkRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJvbkZpbmlzaGVkIiwiY29uZmlybWVkIiwic3VibWl0UGFzc3dvcmRSZXNldCIsInN0YXRlS2V5IiwidGFyZ2V0IiwidmFsdWUiLCJzdG9wUHJvcGFnYXRpb24iLCJvbkxvZ2luQ2xpY2siLCJDb3VudGx5QW5hbHl0aWNzIiwiaW5zdGFuY2UiLCJ0cmFjayIsImNvbXBvbmVudERpZE1vdW50IiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsImhzVXJsIiwiaXNVcmwiLCJBdXRvRGlzY292ZXJ5VXRpbHMiLCJ2YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzIiwiZSIsImF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yIiwiUGFzc3dvcmRSZXNldCIsInJlc2V0UGFzc3dvcmQiLCJ0aGVuIiwiYm9keSIsIkVycm9yRGlhbG9nIiwicmVuZGVyRm9yZ290IiwiRmllbGQiLCJzZXJ2ZXJEZWFkU2VjdGlvbiIsImNsYXNzZXMiLCJvblNlcnZlckNvbmZpZ0NoYW5nZSIsIm9uU3VibWl0Rm9ybSIsIm9uSW5wdXRDaGFuZ2VkIiwiYmluZCIsInJlbmRlclNlbmRpbmdFbWFpbCIsIlNwaW5uZXIiLCJyZW5kZXJFbWFpbFNlbnQiLCJlbWFpbEFkZHJlc3MiLCJvblZlcmlmeSIsInJlbmRlckRvbmUiLCJvbkNvbXBsZXRlIiwicmVuZGVyIiwiQXV0aEhlYWRlciIsIkF1dGhCb2R5IiwicmVzZXRQYXNzd29yZEpzeCIsIlByb3BUeXBlcyIsImluc3RhbmNlT2YiLCJWYWxpZGF0ZWRTZXJ2ZXJDb25maWciLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWNBO0FBQ0E7QUFDQSxNQUFNQSxZQUFZLEdBQUcsQ0FBckIsQyxDQUNBOztBQUNBLE1BQU1DLG1CQUFtQixHQUFHLENBQTVCLEMsQ0FDQTs7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxDQUF6QixDLENBQ0E7O0FBQ0EsTUFBTUMsVUFBVSxHQUFHLENBQW5COztBQUVlLE1BQU1DLGNBQU4sU0FBNkJDLGVBQU1DLFNBQW5DLENBQTZDO0FBd0J4REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsaURBaEJYO0FBQ0pDLE1BQUFBLEtBQUssRUFBRVQsWUFESDtBQUVKVSxNQUFBQSxLQUFLLEVBQUUsRUFGSDtBQUdK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akIsQ0FBakI7QUFFQSxRQUFJaUQsZ0JBQUo7O0FBQ0EsWUFBUSxLQUFLcEQsS0FBTCxDQUFXcEIsS0FBbkI7QUFDSSxXQUFLVCxZQUFMO0FBQ0lpRixRQUFBQSxnQkFBZ0IsR0FBRyxLQUFLbEIsWUFBTCxFQUFuQjtBQUNBOztBQUNKLFdBQUs5RCxtQkFBTDtBQUNJZ0YsUUFBQUEsZ0JBQWdCLEdBQUcsS0FBS1Ysa0JBQUwsRUFBbkI7QUFDQTs7QUFDSixXQUFLckUsZ0JBQUw7QUFDSStFLFFBQUFBLGdCQUFnQixHQUFHLEtBQUtSLGVBQUwsRUFBbkI7QUFDQTs7QUFDSixXQUFLdEUsVUFBTDtBQUNJOEUsUUFBQUEsZ0JBQWdCLEdBQUcsS0FBS0wsVUFBTCxFQUFuQjtBQUNBO0FBWlI7O0FBZUEsd0JBQ0ksNkJBQUMsaUJBQUQscUJBQ0ksNkJBQUMsVUFBRCxPQURKLGVBRUksNkJBQUMsUUFBRCxxQkFDSSw4Q0FBTyx5QkFBRyxvQkFBSCxDQUFQLE1BREosRUFFS0ssZ0JBRkwsQ0FGSixDQURKO0FBU0g7O0FBNVJ1RDs7OzhCQUF2QzdFLGMsZUFDRTtBQUNmd0IsRUFBQUEsWUFBWSxFQUFFc0QsbUJBQVVDLFVBQVYsQ0FBcUJDLHlDQUFyQixFQUE0Q0MsVUFEM0M7QUFFZmxCLEVBQUFBLG9CQUFvQixFQUFFZSxtQkFBVUksSUFBVixDQUFlRCxVQUZ0QjtBQUdmeEMsRUFBQUEsWUFBWSxFQUFFcUMsbUJBQVVJLElBSFQ7QUFJZlQsRUFBQUEsVUFBVSxFQUFFSyxtQkFBVUksSUFBVixDQUFlRDtBQUpaLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBQYXNzd29yZFJlc2V0IGZyb20gXCIuLi8uLi8uLi9QYXNzd29yZFJlc2V0XCI7XG5pbXBvcnQgQXV0b0Rpc2NvdmVyeVV0aWxzLCB7VmFsaWRhdGVkU2VydmVyQ29uZmlnfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvQXV0b0Rpc2NvdmVyeVV0aWxzXCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBBdXRoUGFnZSBmcm9tIFwiLi4vLi4vdmlld3MvYXV0aC9BdXRoUGFnZVwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4uLy4uLy4uL0NvdW50bHlBbmFseXRpY3NcIjtcbmltcG9ydCBTZXJ2ZXJQaWNrZXIgZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL1NlcnZlclBpY2tlclwiO1xuXG4vLyBQaGFzZXNcbi8vIFNob3cgdGhlIGZvcmdvdCBwYXNzd29yZCBpbnB1dHNcbmNvbnN0IFBIQVNFX0ZPUkdPVCA9IDE7XG4vLyBFbWFpbCBpcyBpbiB0aGUgcHJvY2VzcyBvZiBiZWluZyBzZW50XG5jb25zdCBQSEFTRV9TRU5ESU5HX0VNQUlMID0gMjtcbi8vIEVtYWlsIGhhcyBiZWVuIHNlbnRcbmNvbnN0IFBIQVNFX0VNQUlMX1NFTlQgPSAzO1xuLy8gVXNlciBoYXMgY2xpY2tlZCB0aGUgbGluayBpbiBlbWFpbCBhbmQgY29tcGxldGVkIHJlc2V0XG5jb25zdCBQSEFTRV9ET05FID0gNDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRm9yZ290UGFzc3dvcmQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHNlcnZlckNvbmZpZzogUHJvcFR5cGVzLmluc3RhbmNlT2YoVmFsaWRhdGVkU2VydmVyQ29uZmlnKS5pc1JlcXVpcmVkLFxuICAgICAgICBvblNlcnZlckNvbmZpZ0NoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Mb2dpbkNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25Db21wbGV0ZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHBoYXNlOiBQSEFTRV9GT1JHT1QsXG4gICAgICAgIGVtYWlsOiBcIlwiLFxuICAgICAgICBwYXNzd29yZDogXCJcIixcbiAgICAgICAgcGFzc3dvcmQyOiBcIlwiLFxuICAgICAgICBlcnJvclRleHQ6IG51bGwsXG5cbiAgICAgICAgLy8gV2UgcGVyZm9ybSBsaXZlbGluZXNzIGNoZWNrcyBsYXRlciwgYnV0IGZvciBub3cgc3VwcHJlc3MgdGhlIGVycm9ycy5cbiAgICAgICAgLy8gV2UgYWxzbyB0cmFjayB0aGUgc2VydmVyIGRlYWQgZXJyb3JzIGluZGVwZW5kZW50bHkgb2YgdGhlIHJlZ3VsYXIgZXJyb3JzIHNvXG4gICAgICAgIC8vIHRoYXQgd2UgY2FuIHJlbmRlciBpdCBkaWZmZXJlbnRseSwgYW5kIG92ZXJyaWRlIGFueSBvdGhlciBlcnJvciB0aGUgdXNlciBtYXlcbiAgICAgICAgLy8gYmUgc2VlaW5nLlxuICAgICAgICBzZXJ2ZXJJc0FsaXZlOiB0cnVlLFxuICAgICAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGZhbHNlLFxuICAgICAgICBzZXJ2ZXJEZWFkRXJyb3I6IFwiXCIsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19mb3Jnb3RfcGFzc3dvcmRfYmVnaW5cIik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMucmVzZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9jaGVja1NlcnZlckxpdmVsaW5lc3ModGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIGlmIChuZXdQcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmwgPT09IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsICYmXG4gICAgICAgICAgICBuZXdQcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwgPT09IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmlzVXJsKSByZXR1cm47XG5cbiAgICAgICAgLy8gRG8gYSBsaXZlbGluZXNzIGNoZWNrIG9uIHRoZSBuZXcgVVJMc1xuICAgICAgICB0aGlzLl9jaGVja1NlcnZlckxpdmVsaW5lc3MobmV3UHJvcHMuc2VydmVyQ29uZmlnKTtcbiAgICB9XG5cbiAgICBhc3luYyBfY2hlY2tTZXJ2ZXJMaXZlbGluZXNzKHNlcnZlckNvbmZpZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgQXV0b0Rpc2NvdmVyeVV0aWxzLnZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMoXG4gICAgICAgICAgICAgICAgc2VydmVyQ29uZmlnLmhzVXJsLFxuICAgICAgICAgICAgICAgIHNlcnZlckNvbmZpZy5pc1VybCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShBdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IoZSwgXCJmb3Jnb3RfcGFzc3dvcmRcIikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3VibWl0UGFzc3dvcmRSZXNldChlbWFpbCwgcGFzc3dvcmQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogUEhBU0VfU0VORElOR19FTUFJTCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVzZXQgPSBuZXcgUGFzc3dvcmRSZXNldCh0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybCwgdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwpO1xuICAgICAgICB0aGlzLnJlc2V0LnJlc2V0UGFzc3dvcmQoZW1haWwsIHBhc3N3b3JkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9FTUFJTF9TRU5ULFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9yRGlhbG9nKF90KCdGYWlsZWQgdG8gc2VuZCBlbWFpbCcpICsgXCI6IFwiICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IFBIQVNFX0ZPUkdPVCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblZlcmlmeSA9IGFzeW5jIGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCF0aGlzLnJlc2V0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwib25WZXJpZnkgY2FsbGVkIGJlZm9yZSBzdWJtaXRQYXNzd29yZFJlc2V0IVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZXNldC5jaGVja0VtYWlsTGlua0NsaWNrZWQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUEhBU0VfRE9ORSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvckRpYWxvZyhlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25TdWJtaXRGb3JtID0gYXN5bmMgZXYgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIC8vIHJlZnJlc2ggdGhlIHNlcnZlciBlcnJvcnMsIGp1c3QgaW4gY2FzZSB0aGUgc2VydmVyIGNhbWUgYmFjayBvbmxpbmVcbiAgICAgICAgYXdhaXQgdGhpcy5fY2hlY2tTZXJ2ZXJMaXZlbGluZXNzKHRoaXMucHJvcHMuc2VydmVyQ29uZmlnKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZW1haWwpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9yRGlhbG9nKF90KCdUaGUgZW1haWwgYWRkcmVzcyBsaW5rZWQgdG8geW91ciBhY2NvdW50IG11c3QgYmUgZW50ZXJlZC4nKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUucGFzc3dvcmQgfHwgIXRoaXMuc3RhdGUucGFzc3dvcmQyKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvckRpYWxvZyhfdCgnQSBuZXcgcGFzc3dvcmQgbXVzdCBiZSBlbnRlcmVkLicpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnBhc3N3b3JkICE9PSB0aGlzLnN0YXRlLnBhc3N3b3JkMikge1xuICAgICAgICAgICAgdGhpcy5zaG93RXJyb3JEaWFsb2coX3QoJ05ldyBwYXNzd29yZHMgbXVzdCBtYXRjaCBlYWNoIG90aGVyLicpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGb3Jnb3QgUGFzc3dvcmQgV2FybmluZycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnV2FybmluZyEnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJDaGFuZ2luZyB5b3VyIHBhc3N3b3JkIHdpbGwgcmVzZXQgYW55IGVuZC10by1lbmQgZW5jcnlwdGlvbiBrZXlzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm9uIGFsbCBvZiB5b3VyIHNlc3Npb25zLCBtYWtpbmcgZW5jcnlwdGVkIGNoYXQgaGlzdG9yeSB1bnJlYWRhYmxlLiBTZXQgdXAgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiS2V5IEJhY2t1cCBvciBleHBvcnQgeW91ciByb29tIGtleXMgZnJvbSBhbm90aGVyIHNlc3Npb24gYmVmb3JlIHJlc2V0dGluZyB5b3VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhc3N3b3JkLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICAgICBidXR0b246IF90KCdDb250aW51ZScpLFxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IChjb25maXJtZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtaXRQYXNzd29yZFJlc2V0KHRoaXMuc3RhdGUuZW1haWwsIHRoaXMuc3RhdGUucGFzc3dvcmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uSW5wdXRDaGFuZ2VkID0gKHN0YXRlS2V5LCBldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIFtzdGF0ZUtleV06IGV2LnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uTG9naW5DbGljayA9IGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25Mb2dpbkNsaWNrKCk7XG4gICAgfTtcblxuICAgIHNob3dFcnJvckRpYWxvZyhib2R5LCB0aXRsZSkge1xuICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGb3Jnb3QgUGFzc3dvcmQgRXJyb3InLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBib2R5LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXJGb3Jnb3QoKSB7XG4gICAgICAgIGNvbnN0IEZpZWxkID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuRmllbGQnKTtcblxuICAgICAgICBsZXQgZXJyb3JUZXh0ID0gbnVsbDtcbiAgICAgICAgY29uc3QgZXJyID0gdGhpcy5zdGF0ZS5lcnJvclRleHQ7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGVycm9yVGV4dCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfTG9naW5fZXJyb3JcIj57IGVyciB9PC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlcnZlckRlYWRTZWN0aW9uO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VydmVySXNBbGl2ZSkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIFwibXhfTG9naW5fZXJyb3JcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0xvZ2luX3NlcnZlckVycm9yXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJteF9Mb2dpbl9zZXJ2ZXJFcnJvck5vbkZhdGFsXCI6ICF0aGlzLnN0YXRlLnNlcnZlckVycm9ySXNGYXRhbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VydmVyRGVhZFNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5zZXJ2ZXJEZWFkRXJyb3J9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICB7ZXJyb3JUZXh0fVxuICAgICAgICAgICAge3NlcnZlckRlYWRTZWN0aW9ufVxuICAgICAgICAgICAgPFNlcnZlclBpY2tlclxuICAgICAgICAgICAgICAgIHNlcnZlckNvbmZpZz17dGhpcy5wcm9wcy5zZXJ2ZXJDb25maWd9XG4gICAgICAgICAgICAgICAgb25TZXJ2ZXJDb25maWdDaGFuZ2U9e3RoaXMucHJvcHMub25TZXJ2ZXJDb25maWdDaGFuZ2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25TdWJtaXRGb3JtfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2ZpZWxkUm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInJlc2V0X2VtYWlsXCIgLy8gZGVmaW5lIGEgbmFtZSBzbyBicm93c2VyJ3MgcGFzc3dvcmQgYXV0b2ZpbGwgZ2V0cyBsZXNzIGNvbmZ1c2VkXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ0VtYWlsJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5lbWFpbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uSW5wdXRDaGFuZ2VkLmJpbmQodGhpcywgXCJlbWFpbFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2N1cz17KCkgPT4gQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfZm9yZ290X3Bhc3N3b3JkX2VtYWlsX2ZvY3VzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25CbHVyPXsoKSA9PiBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19mb3Jnb3RfcGFzc3dvcmRfZW1haWxfYmx1clwiKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2ZpZWxkUm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInJlc2V0X3Bhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ05ldyBQYXNzd29yZCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbklucHV0Q2hhbmdlZC5iaW5kKHRoaXMsIFwicGFzc3dvcmRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZvY3VzPXsoKSA9PiBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19mb3Jnb3RfcGFzc3dvcmRfbmV3UGFzc3dvcmRfZm9jdXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkJsdXI9eygpID0+IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX2ZvcmdvdF9wYXNzd29yZF9uZXdQYXNzd29yZF9ibHVyXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwicmVzZXRfcGFzc3dvcmRfY29uZmlybVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KCdDb25maXJtJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzd29yZDJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbklucHV0Q2hhbmdlZC5iaW5kKHRoaXMsIFwicGFzc3dvcmQyXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2N1cz17KCkgPT4gQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfZm9yZ290X3Bhc3N3b3JkX25ld1Bhc3N3b3JkMl9mb2N1c1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQmx1cj17KCkgPT4gQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfZm9yZ290X3Bhc3N3b3JkX25ld1Bhc3N3b3JkMl9ibHVyXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c3Bhbj57X3QoXG4gICAgICAgICAgICAgICAgICAgICdBIHZlcmlmaWNhdGlvbiBlbWFpbCB3aWxsIGJlIHNlbnQgdG8geW91ciBpbmJveCB0byBjb25maXJtICcgK1xuICAgICAgICAgICAgICAgICAgICAnc2V0dGluZyB5b3VyIG5ldyBwYXNzd29yZC4nLFxuICAgICAgICAgICAgICAgICl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Mb2dpbl9zdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e190KCdTZW5kIFJlc2V0IEVtYWlsJyl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDxhIGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2NoYW5nZUZsb3dcIiBvbkNsaWNrPXt0aGlzLm9uTG9naW5DbGlja30gaHJlZj1cIiNcIj5cbiAgICAgICAgICAgICAgICB7X3QoJ1NpZ24gaW4gaW5zdGVhZCcpfVxuICAgICAgICAgICAgPC9hPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcmVuZGVyU2VuZGluZ0VtYWlsKCkge1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgIHJldHVybiA8U3Bpbm5lciAvPjtcbiAgICB9XG5cbiAgICByZW5kZXJFbWFpbFNlbnQoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAge190KFwiQW4gZW1haWwgaGFzIGJlZW4gc2VudCB0byAlKGVtYWlsQWRkcmVzcylzLiBPbmNlIHlvdSd2ZSBmb2xsb3dlZCB0aGUgXCIgK1xuICAgICAgICAgICAgICAgIFwibGluayBpdCBjb250YWlucywgY2xpY2sgYmVsb3cuXCIsIHsgZW1haWxBZGRyZXNzOiB0aGlzLnN0YXRlLmVtYWlsIH0pfVxuICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICA8aW5wdXQgY2xhc3NOYW1lPVwibXhfTG9naW5fc3VibWl0XCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMub25WZXJpZnl9XG4gICAgICAgICAgICAgICAgdmFsdWU9e190KCdJIGhhdmUgdmVyaWZpZWQgbXkgZW1haWwgYWRkcmVzcycpfSAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcmVuZGVyRG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8cD57X3QoXCJZb3VyIHBhc3N3b3JkIGhhcyBiZWVuIHJlc2V0LlwiKX08L3A+XG4gICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgXCJZb3UgaGF2ZSBiZWVuIGxvZ2dlZCBvdXQgb2YgYWxsIHNlc3Npb25zIGFuZCB3aWxsIG5vIGxvbmdlciByZWNlaXZlIFwiICtcbiAgICAgICAgICAgICAgICBcInB1c2ggbm90aWZpY2F0aW9ucy4gVG8gcmUtZW5hYmxlIG5vdGlmaWNhdGlvbnMsIHNpZ24gaW4gYWdhaW4gb24gZWFjaCBcIiArXG4gICAgICAgICAgICAgICAgXCJkZXZpY2UuXCIsXG4gICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJteF9Mb2dpbl9zdWJtaXRcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5wcm9wcy5vbkNvbXBsZXRlfVxuICAgICAgICAgICAgICAgIHZhbHVlPXtfdCgnUmV0dXJuIHRvIGxvZ2luIHNjcmVlbicpfSAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBBdXRoSGVhZGVyID0gc2RrLmdldENvbXBvbmVudChcImF1dGguQXV0aEhlYWRlclwiKTtcbiAgICAgICAgY29uc3QgQXV0aEJvZHkgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXV0aC5BdXRoQm9keVwiKTtcblxuICAgICAgICBsZXQgcmVzZXRQYXNzd29yZEpzeDtcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLnBoYXNlKSB7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX0ZPUkdPVDpcbiAgICAgICAgICAgICAgICByZXNldFBhc3N3b3JkSnN4ID0gdGhpcy5yZW5kZXJGb3Jnb3QoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfU0VORElOR19FTUFJTDpcbiAgICAgICAgICAgICAgICByZXNldFBhc3N3b3JkSnN4ID0gdGhpcy5yZW5kZXJTZW5kaW5nRW1haWwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfRU1BSUxfU0VOVDpcbiAgICAgICAgICAgICAgICByZXNldFBhc3N3b3JkSnN4ID0gdGhpcy5yZW5kZXJFbWFpbFNlbnQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfRE9ORTpcbiAgICAgICAgICAgICAgICByZXNldFBhc3N3b3JkSnN4ID0gdGhpcy5yZW5kZXJEb25lKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEF1dGhQYWdlPlxuICAgICAgICAgICAgICAgIDxBdXRoSGVhZGVyIC8+XG4gICAgICAgICAgICAgICAgPEF1dGhCb2R5PlxuICAgICAgICAgICAgICAgICAgICA8aDI+IHsgX3QoJ1NldCBhIG5ldyBwYXNzd29yZCcpIH0gPC9oMj5cbiAgICAgICAgICAgICAgICAgICAge3Jlc2V0UGFzc3dvcmRKc3h9XG4gICAgICAgICAgICAgICAgPC9BdXRoQm9keT5cbiAgICAgICAgICAgIDwvQXV0aFBhZ2U+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var Email = _interopRequireWildcard(require("../../../email"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _CountryDropdown = _interopRequireDefault(require("./CountryDropdown"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

// For validating phone numbers without country codes
const PHONE_NUMBER_REGEX = /^[0-9()\-\s]*$/;
var LoginField;
/*
 * A pure UI component which displays a username/password form.
 * The email/username/phone fields are fully-controlled, the password field is not.
 */

(function (LoginField) {
  LoginField["Email"] = "login_field_email";
  LoginField["MatrixId"] = "login_field_mxid";
  LoginField["Phone"] = "login_field_phone";
  LoginField["Password"] = "login_field_phone";
})(LoginField || (LoginField = {}));

let PasswordLogin = (_dec = (0, _replaceableComponent.replaceableComponent)("views.auth.PasswordLogin"), _dec(_class = (_temp = _class2 = class PasswordLogin extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onForgotPasswordClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onForgotPasswordClick();
    });
    (0, _defineProperty2.default)(this, "onSubmitForm", async ev => {
      ev.preventDefault();
      const allFieldsValid = await this.verifyFieldsBeforeSubmit();

      if (!allFieldsValid) {
        _CountlyAnalytics.default.instance.track("onboarding_registration_submit_failed");

        return;
      }

      let username = ''; // XXX: Synapse breaks if you send null here:

      let phoneCountry = null;
      let phoneNumber = null;

      switch (this.state.loginType) {
        case LoginField.Email:
        case LoginField.MatrixId:
          username = this.props.username;
          break;

        case LoginField.Phone:
          phoneCountry = this.props.phoneCountry;
          phoneNumber = this.props.phoneNumber;
          break;
      }

      this.props.onSubmit(username, phoneCountry, phoneNumber, this.state.password);
    });
    (0, _defineProperty2.default)(this, "onUsernameChanged", ev => {
      this.props.onUsernameChanged(ev.target.value);
    });
    (0, _defineProperty2.default)(this, "onUsernameFocus", () => {
      if (this.state.loginType === LoginField.MatrixId) {
        _CountlyAnalytics.default.instance.track("onboarding_login_mxid_focus");
      } else {
        _CountlyAnalytics.default.instance.track("onboarding_login_email_focus");
      }
    });
    (0, _defineProperty2.default)(this, "onUsernameBlur", ev => {
      if (this.state.loginType === LoginField.MatrixId) {
        _CountlyAnalytics.default.instance.track("onboarding_login_mxid_blur");
      } else {
        _CountlyAnalytics.default.instance.track("onboarding_login_email_blur");
      }

      this.props.onUsernameBlur(ev.target.value);
    });
    (0, _defineProperty2.default)(this, "onLoginTypeChange", ev => {
      const loginType = ev.target.value;
      this.setState({
        loginType
      });
      this.props.onUsernameChanged(""); // Reset because email and username use the same state

      _CountlyAnalytics.default.instance.track("onboarding_login_type_changed", {
        loginType
      });
    });
    (0, _defineProperty2.default)(this, "onPhoneCountryChanged", country => {
      this.props.onPhoneCountryChanged(country.iso2);
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberChanged", ev => {
      this.props.onPhoneNumberChanged(ev.target.value);
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberFocus", () => {
      _CountlyAnalytics.default.instance.track("onboarding_login_phone_number_focus");
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberBlur", ev => {
      _CountlyAnalytics.default.instance.track("onboarding_login_phone_number_blur");
    });
    (0, _defineProperty2.default)(this, "onPasswordChanged", ev => {
      this.setState({
        password: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "validateUsernameRules", (0, _Validation.default)({
      rules: [{
        key: "required",

        test({
          value,
          allowEmpty
        }) {
          return allowEmpty || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter username")
      }]
    }));
    (0, _defineProperty2.default)(this, "onUsernameValidate", async fieldState => {
      const result = await this.validateUsernameRules(fieldState);
      this.markFieldValid(LoginField.MatrixId, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validateEmailRules", (0, _Validation.default)({
      rules: [{
        key: "required",

        test({
          value,
          allowEmpty
        }) {
          return allowEmpty || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter email address")
      }, {
        key: "email",
        test: ({
          value
        }) => !value || Email.looksValid(value),
        invalid: () => (0, _languageHandler._t)("Doesn't look like a valid email address")
      }]
    }));
    (0, _defineProperty2.default)(this, "onEmailValidate", async fieldState => {
      const result = await this.validateEmailRules(fieldState);
      this.markFieldValid(LoginField.Email, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validatePhoneNumberRules", (0, _Validation.default)({
      rules: [{
        key: "required",

        test({
          value,
          allowEmpty
        }) {
          return allowEmpty || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter phone number")
      }, {
        key: "number",
        test: ({
          value
        }) => !value || PHONE_NUMBER_REGEX.test(value),
        invalid: () => (0, _languageHandler._t)("That phone number doesn't look quite right, please check and try again")
      }]
    }));
    (0, _defineProperty2.default)(this, "onPhoneNumberValidate", async fieldState => {
      const result = await this.validatePhoneNumberRules(fieldState);
      this.markFieldValid(LoginField.Password, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validatePasswordRules", (0, _Validation.default)({
      rules: [{
        key: "required",

        test({
          value,
          allowEmpty
        }) {
          return allowEmpty || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter password")
      }]
    }));
    (0, _defineProperty2.default)(this, "onPasswordValidate", async fieldState => {
      const result = await this.validatePasswordRules(fieldState);
      this.markFieldValid(LoginField.Password, result.valid);
      return result;
    });
    this.state = {
      // Field error codes by field ID
      fieldValid: {},
      loginType: LoginField.MatrixId,
      password: ""
    };
  }

  async verifyFieldsBeforeSubmit() {
    // Blur the active element if any, so we first run its blur validation,
    // which is less strict than the pass we're about to do below for all fields.
    const activeElement = document.activeElement;

    if (activeElement) {
      activeElement.blur();
    }

    const fieldIDsInDisplayOrder = [this.state.loginType, LoginField.Password]; // Run all fields with stricter validation that no longer allows empty
    // values for required fields.

    for (const fieldID of fieldIDsInDisplayOrder) {
      const field = this[fieldID];

      if (!field) {
        continue;
      } // We must wait for these validations to finish before queueing
      // up the setState below so our setState goes in the queue after
      // all the setStates from these validate calls (that's how we
      // know they've finished).


      await field.validate({
        allowEmpty: false
      });
    } // Validation and state updates are async, so we need to wait for them to complete
    // first. Queue a `setState` callback and wait for it to resolve.


    await new Promise(resolve => this.setState({}, resolve));

    if (this.allFieldsValid()) {
      return true;
    }

    const invalidField = this.findFirstInvalidField(fieldIDsInDisplayOrder);

    if (!invalidField) {
      return true;
    } // Focus the first invalid field and show feedback in the stricter mode
    // that no longer allows empty values for required fields.


    invalidField.focus();
    invalidField.validate({
      allowEmpty: false,
      focused: true
    });
    return false;
  }

  allFieldsValid() {
    const keys = Object.keys(this.state.fieldValid);

    for (let i = 0; i < keys.length; ++i) {
      if (!this.state.fieldValid[keys[i]]) {
        return false;
      }
    }

    return true;
  }

  findFirstInvalidField(fieldIDs
  /*: LoginField[]*/
  ) {
    for (const fieldID of fieldIDs) {
      if (!this.state.fieldValid[fieldID] && this[fieldID]) {
        return this[fieldID];
      }
    }

    return null;
  }

  markFieldValid(fieldID
  /*: LoginField*/
  , valid
  /*: boolean*/
  ) {
    const {
      fieldValid
    } = this.state;
    fieldValid[fieldID] = valid;
    this.setState({
      fieldValid
    });
  }

  renderLoginField(loginType
  /*: IState["loginType"]*/
  , autoFocus
  /*: boolean*/
  ) {
    const classes = {
      error: false
    };

    switch (loginType) {
      case LoginField.Email:
        classes.error = this.props.loginIncorrect && !this.props.username;
        return /*#__PURE__*/_react.default.createElement(_Field.default, {
          className: (0, _classnames.default)(classes),
          name: "username" // make it a little easier for browser's remember-password
          ,
          key: "email_input",
          type: "text",
          label: (0, _languageHandler._t)("Email"),
          placeholder: "joe@example.com",
          value: this.props.username,
          onChange: this.onUsernameChanged,
          onFocus: this.onUsernameFocus,
          onBlur: this.onUsernameBlur,
          disabled: this.props.disableSubmit,
          autoFocus: autoFocus,
          onValidate: this.onEmailValidate,
          ref: field => this[LoginField.Email] = field
        });

      case LoginField.MatrixId:
        classes.error = this.props.loginIncorrect && !this.props.username;
        return /*#__PURE__*/_react.default.createElement(_Field.default, {
          className: (0, _classnames.default)(classes),
          name: "username" // make it a little easier for browser's remember-password
          ,
          key: "username_input",
          type: "text",
          label: (0, _languageHandler._t)("Username"),
          placeholder: (0, _languageHandler._t)("Username").toLocaleLowerCase(),
          value: this.props.username,
          onChange: this.onUsernameChanged,
          onFocus: this.onUsernameFocus,
          onBlur: this.onUsernameBlur,
          disabled: this.props.disableSubmit,
          autoFocus: autoFocus,
          onValidate: this.onUsernameValidate,
          ref: field => this[LoginField.MatrixId] = field
        });

      case LoginField.Phone:
        {
          classes.error = this.props.loginIncorrect && !this.props.phoneNumber;

          const phoneCountry = /*#__PURE__*/_react.default.createElement(_CountryDropdown.default, {
            value: this.props.phoneCountry,
            isSmall: true,
            showPrefix: true,
            onOptionChange: this.onPhoneCountryChanged
          });

          return /*#__PURE__*/_react.default.createElement(_Field.default, {
            className: (0, _classnames.default)(classes),
            name: "phoneNumber",
            key: "phone_input",
            type: "text",
            label: (0, _languageHandler._t)("Phone"),
            value: this.props.phoneNumber,
            prefixComponent: phoneCountry,
            onChange: this.onPhoneNumberChanged,
            onFocus: this.onPhoneNumberFocus,
            onBlur: this.onPhoneNumberBlur,
            disabled: this.props.disableSubmit,
            autoFocus: autoFocus,
            onValidate: this.onPhoneNumberValidate,
            ref: field => this[LoginField.Password] = field
          });
        }
    }
  }

  isLoginEmpty() {
    switch (this.state.loginType) {
      case LoginField.Email:
      case LoginField.MatrixId:
        return !this.props.username;

      case LoginField.Phone:
        return !this.props.phoneCountry || !this.props.phoneNumber;
    }
  }

  render() {
    let forgotPasswordJsx;

    if (this.props.onForgotPasswordClick) {
      forgotPasswordJsx = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_Login_forgot",
        disabled: this.props.busy,
        kind: "link",
        onClick: this.onForgotPasswordClick
      }, (0, _languageHandler._t)("Forgot password?"));
    }

    const pwFieldClass = (0, _classnames.default)({
      error: this.props.loginIncorrect && !this.isLoginEmpty() // only error password if error isn't top field

    }); // If login is empty, autoFocus login, otherwise autoFocus password.
    // this is for when auto server discovery remounts us when the user tries to tab from username to password

    const autoFocusPassword = !this.isLoginEmpty();
    const loginField = this.renderLoginField(this.state.loginType, !autoFocusPassword);
    let loginType;

    if (!_SdkConfig.default.get().disable_3pid_login) {
      loginType = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Login_type_container"
      }, /*#__PURE__*/_react.default.createElement("label", {
        className: "mx_Login_type_label"
      }, (0, _languageHandler._t)('Sign in with')), /*#__PURE__*/_react.default.createElement(_Field.default, {
        element: "select",
        value: this.state.loginType,
        onChange: this.onLoginTypeChange,
        disabled: this.props.disableSubmit
      }, /*#__PURE__*/_react.default.createElement("option", {
        key: LoginField.MatrixId,
        value: LoginField.MatrixId
      }, (0, _languageHandler._t)('Username')), /*#__PURE__*/_react.default.createElement("option", {
        key: LoginField.Email,
        value: LoginField.Email
      }, (0, _languageHandler._t)('Email address')), /*#__PURE__*/_react.default.createElement("option", {
        key: LoginField.Password,
        value: LoginField.Password
      }, (0, _languageHandler._t)('Phone'))));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmitForm
    }, loginType, loginField, /*#__PURE__*/_react.default.createElement(_Field.default, {
      className: pwFieldClass,
      type: "password",
      name: "password",
      label: (0, _languageHandler._t)('Password'),
      value: this.state.password,
      onChange: this.onPasswordChanged,
      disabled: this.props.disableSubmit,
      autoFocus: autoFocusPassword,
      onValidate: this.onPasswordValidate,
      ref: field => this[LoginField.Password] = field
    }), forgotPasswordJsx, !this.props.busy && /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "submit",
      value: (0, _languageHandler._t)('Sign in'),
      disabled: this.props.disableSubmit
    })));
  }

}, (0, _defineProperty2.default)(_class2, "defaultProps", {
  onUsernameChanged: function () {},
  onUsernameBlur: function () {},
  onPhoneCountryChanged: function () {},
  onPhoneNumberChanged: function () {},
  loginIncorrect: false,
  disableSubmit: false
}), _temp)) || _class);
exports.default = PasswordLogin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvUGFzc3dvcmRMb2dpbi50c3giXSwibmFtZXMiOlsiUEhPTkVfTlVNQkVSX1JFR0VYIiwiTG9naW5GaWVsZCIsIlBhc3N3b3JkTG9naW4iLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIm9uRm9yZ290UGFzc3dvcmRDbGljayIsImFsbEZpZWxkc1ZhbGlkIiwidmVyaWZ5RmllbGRzQmVmb3JlU3VibWl0IiwiQ291bnRseUFuYWx5dGljcyIsImluc3RhbmNlIiwidHJhY2siLCJ1c2VybmFtZSIsInBob25lQ291bnRyeSIsInBob25lTnVtYmVyIiwic3RhdGUiLCJsb2dpblR5cGUiLCJFbWFpbCIsIk1hdHJpeElkIiwiUGhvbmUiLCJvblN1Ym1pdCIsInBhc3N3b3JkIiwib25Vc2VybmFtZUNoYW5nZWQiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9uVXNlcm5hbWVCbHVyIiwic2V0U3RhdGUiLCJjb3VudHJ5Iiwib25QaG9uZUNvdW50cnlDaGFuZ2VkIiwiaXNvMiIsIm9uUGhvbmVOdW1iZXJDaGFuZ2VkIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiYWxsb3dFbXB0eSIsImludmFsaWQiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGVVc2VybmFtZVJ1bGVzIiwibWFya0ZpZWxkVmFsaWQiLCJ2YWxpZCIsImxvb2tzVmFsaWQiLCJ2YWxpZGF0ZUVtYWlsUnVsZXMiLCJ2YWxpZGF0ZVBob25lTnVtYmVyUnVsZXMiLCJQYXNzd29yZCIsInZhbGlkYXRlUGFzc3dvcmRSdWxlcyIsImZpZWxkVmFsaWQiLCJhY3RpdmVFbGVtZW50IiwiZG9jdW1lbnQiLCJibHVyIiwiZmllbGRJRHNJbkRpc3BsYXlPcmRlciIsImZpZWxkSUQiLCJmaWVsZCIsInZhbGlkYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbnZhbGlkRmllbGQiLCJmaW5kRmlyc3RJbnZhbGlkRmllbGQiLCJmb2N1cyIsImZvY3VzZWQiLCJrZXlzIiwiT2JqZWN0IiwiaSIsImxlbmd0aCIsImZpZWxkSURzIiwicmVuZGVyTG9naW5GaWVsZCIsImF1dG9Gb2N1cyIsImNsYXNzZXMiLCJlcnJvciIsImxvZ2luSW5jb3JyZWN0Iiwib25Vc2VybmFtZUZvY3VzIiwiZGlzYWJsZVN1Ym1pdCIsIm9uRW1haWxWYWxpZGF0ZSIsInRvTG9jYWxlTG93ZXJDYXNlIiwib25Vc2VybmFtZVZhbGlkYXRlIiwib25QaG9uZU51bWJlckZvY3VzIiwib25QaG9uZU51bWJlckJsdXIiLCJvblBob25lTnVtYmVyVmFsaWRhdGUiLCJpc0xvZ2luRW1wdHkiLCJyZW5kZXIiLCJmb3Jnb3RQYXNzd29yZEpzeCIsImJ1c3kiLCJwd0ZpZWxkQ2xhc3MiLCJhdXRvRm9jdXNQYXNzd29yZCIsImxvZ2luRmllbGQiLCJTZGtDb25maWciLCJnZXQiLCJkaXNhYmxlXzNwaWRfbG9naW4iLCJvbkxvZ2luVHlwZUNoYW5nZSIsIm9uU3VibWl0Rm9ybSIsIm9uUGFzc3dvcmRDaGFuZ2VkIiwib25QYXNzd29yZFZhbGlkYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQSxNQUFNQSxrQkFBa0IsR0FBRyxnQkFBM0I7SUEyQktDLFU7QUFPTDtBQUNBO0FBQ0E7QUFDQTs7V0FWS0EsVTtBQUFBQSxFQUFBQSxVO0FBQUFBLEVBQUFBLFU7QUFBQUEsRUFBQUEsVTtBQUFBQSxFQUFBQSxVO0dBQUFBLFUsS0FBQUEsVTs7SUFZZ0JDLGEsV0FEcEIsZ0RBQXFCLDBCQUFyQixDLG1DQUFELE1BQ3FCQSxhQURyQixTQUMyQ0MsZUFBTUM7QUFEakQ7QUFDK0U7QUFVM0VDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLGlFQVVhQyxFQUFFLElBQUk7QUFDbENBLE1BQUFBLEVBQUUsQ0FBQ0MsY0FBSDtBQUNBRCxNQUFBQSxFQUFFLENBQUNFLGVBQUg7QUFDQSxXQUFLSCxLQUFMLENBQVdJLHFCQUFYO0FBQ0gsS0Fka0I7QUFBQSx3REFnQkksTUFBTUgsRUFBTixJQUFZO0FBQy9CQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFFQSxZQUFNRyxjQUFjLEdBQUcsTUFBTSxLQUFLQyx3QkFBTCxFQUE3Qjs7QUFDQSxVQUFJLENBQUNELGNBQUwsRUFBcUI7QUFDakJFLGtDQUFpQkMsUUFBakIsQ0FBMEJDLEtBQTFCLENBQWdDLHVDQUFoQzs7QUFDQTtBQUNIOztBQUVELFVBQUlDLFFBQVEsR0FBRyxFQUFmLENBVCtCLENBU1o7O0FBQ25CLFVBQUlDLFlBQVksR0FBRyxJQUFuQjtBQUNBLFVBQUlDLFdBQVcsR0FBRyxJQUFsQjs7QUFFQSxjQUFRLEtBQUtDLEtBQUwsQ0FBV0MsU0FBbkI7QUFDSSxhQUFLbkIsVUFBVSxDQUFDb0IsS0FBaEI7QUFDQSxhQUFLcEIsVUFBVSxDQUFDcUIsUUFBaEI7QUFDSU4sVUFBQUEsUUFBUSxHQUFHLEtBQUtWLEtBQUwsQ0FBV1UsUUFBdEI7QUFDQTs7QUFDSixhQUFLZixVQUFVLENBQUNzQixLQUFoQjtBQUNJTixVQUFBQSxZQUFZLEdBQUcsS0FBS1gsS0FBTCxDQUFXVyxZQUExQjtBQUNBQyxVQUFBQSxXQUFXLEdBQUcsS0FBS1osS0FBTCxDQUFXWSxXQUF6QjtBQUNBO0FBUlI7O0FBV0EsV0FBS1osS0FBTCxDQUFXa0IsUUFBWCxDQUFvQlIsUUFBcEIsRUFBOEJDLFlBQTlCLEVBQTRDQyxXQUE1QyxFQUF5RCxLQUFLQyxLQUFMLENBQVdNLFFBQXBFO0FBQ0gsS0F6Q2tCO0FBQUEsNkRBMkNTbEIsRUFBRSxJQUFJO0FBQzlCLFdBQUtELEtBQUwsQ0FBV29CLGlCQUFYLENBQTZCbkIsRUFBRSxDQUFDb0IsTUFBSCxDQUFVQyxLQUF2QztBQUNILEtBN0NrQjtBQUFBLDJEQStDTyxNQUFNO0FBQzVCLFVBQUksS0FBS1QsS0FBTCxDQUFXQyxTQUFYLEtBQXlCbkIsVUFBVSxDQUFDcUIsUUFBeEMsRUFBa0Q7QUFDOUNULGtDQUFpQkMsUUFBakIsQ0FBMEJDLEtBQTFCLENBQWdDLDZCQUFoQztBQUNILE9BRkQsTUFFTztBQUNIRixrQ0FBaUJDLFFBQWpCLENBQTBCQyxLQUExQixDQUFnQyw4QkFBaEM7QUFDSDtBQUNKLEtBckRrQjtBQUFBLDBEQXVETVIsRUFBRSxJQUFJO0FBQzNCLFVBQUksS0FBS1ksS0FBTCxDQUFXQyxTQUFYLEtBQXlCbkIsVUFBVSxDQUFDcUIsUUFBeEMsRUFBa0Q7QUFDOUNULGtDQUFpQkMsUUFBakIsQ0FBMEJDLEtBQTFCLENBQWdDLDRCQUFoQztBQUNILE9BRkQsTUFFTztBQUNIRixrQ0FBaUJDLFFBQWpCLENBQTBCQyxLQUExQixDQUFnQyw2QkFBaEM7QUFDSDs7QUFDRCxXQUFLVCxLQUFMLENBQVd1QixjQUFYLENBQTBCdEIsRUFBRSxDQUFDb0IsTUFBSCxDQUFVQyxLQUFwQztBQUNILEtBOURrQjtBQUFBLDZEQWdFU3JCLEVBQUUsSUFBSTtBQUM5QixZQUFNYSxTQUFTLEdBQUdiLEVBQUUsQ0FBQ29CLE1BQUgsQ0FBVUMsS0FBNUI7QUFDQSxXQUFLRSxRQUFMLENBQWM7QUFBRVYsUUFBQUE7QUFBRixPQUFkO0FBQ0EsV0FBS2QsS0FBTCxDQUFXb0IsaUJBQVgsQ0FBNkIsRUFBN0IsRUFIOEIsQ0FHSTs7QUFDbENiLGdDQUFpQkMsUUFBakIsQ0FBMEJDLEtBQTFCLENBQWdDLCtCQUFoQyxFQUFpRTtBQUFFSyxRQUFBQTtBQUFGLE9BQWpFO0FBQ0gsS0FyRWtCO0FBQUEsaUVBdUVhVyxPQUFPLElBQUk7QUFDdkMsV0FBS3pCLEtBQUwsQ0FBVzBCLHFCQUFYLENBQWlDRCxPQUFPLENBQUNFLElBQXpDO0FBQ0gsS0F6RWtCO0FBQUEsZ0VBMkVZMUIsRUFBRSxJQUFJO0FBQ2pDLFdBQUtELEtBQUwsQ0FBVzRCLG9CQUFYLENBQWdDM0IsRUFBRSxDQUFDb0IsTUFBSCxDQUFVQyxLQUExQztBQUNILEtBN0VrQjtBQUFBLDhEQStFVSxNQUFNO0FBQy9CZixnQ0FBaUJDLFFBQWpCLENBQTBCQyxLQUExQixDQUFnQyxxQ0FBaEM7QUFDSCxLQWpGa0I7QUFBQSw2REFtRlNSLEVBQUUsSUFBSTtBQUM5Qk0sZ0NBQWlCQyxRQUFqQixDQUEwQkMsS0FBMUIsQ0FBZ0Msb0NBQWhDO0FBQ0gsS0FyRmtCO0FBQUEsNkRBdUZTUixFQUFFLElBQUk7QUFDOUIsV0FBS3VCLFFBQUwsQ0FBYztBQUFDTCxRQUFBQSxRQUFRLEVBQUVsQixFQUFFLENBQUNvQixNQUFILENBQVVDO0FBQXJCLE9BQWQ7QUFDSCxLQXpGa0I7QUFBQSxpRUFzS2EseUJBQWU7QUFDM0NPLE1BQUFBLEtBQUssRUFBRSxDQUNIO0FBQ0lDLFFBQUFBLEdBQUcsRUFBRSxVQURUOztBQUVJQyxRQUFBQSxJQUFJLENBQUM7QUFBRVQsVUFBQUEsS0FBRjtBQUFTVSxVQUFBQTtBQUFULFNBQUQsRUFBd0I7QUFDeEIsaUJBQU9BLFVBQVUsSUFBSSxDQUFDLENBQUNWLEtBQXZCO0FBQ0gsU0FKTDs7QUFLSVcsUUFBQUEsT0FBTyxFQUFFLE1BQU0seUJBQUcsZ0JBQUg7QUFMbkIsT0FERztBQURvQyxLQUFmLENBdEtiO0FBQUEsOERBa0xVLE1BQU9DLFVBQVAsSUFBc0I7QUFDL0MsWUFBTUMsTUFBTSxHQUFHLE1BQU0sS0FBS0MscUJBQUwsQ0FBMkJGLFVBQTNCLENBQXJCO0FBQ0EsV0FBS0csY0FBTCxDQUFvQjFDLFVBQVUsQ0FBQ3FCLFFBQS9CLEVBQXlDbUIsTUFBTSxDQUFDRyxLQUFoRDtBQUNBLGFBQU9ILE1BQVA7QUFDSCxLQXRMa0I7QUFBQSw4REF3TFUseUJBQWU7QUFDeENOLE1BQUFBLEtBQUssRUFBRSxDQUNIO0FBQ0lDLFFBQUFBLEdBQUcsRUFBRSxVQURUOztBQUVJQyxRQUFBQSxJQUFJLENBQUM7QUFBRVQsVUFBQUEsS0FBRjtBQUFTVSxVQUFBQTtBQUFULFNBQUQsRUFBd0I7QUFDeEIsaUJBQU9BLFVBQVUsSUFBSSxDQUFDLENBQUNWLEtBQXZCO0FBQ0gsU0FKTDs7QUFLSVcsUUFBQUEsT0FBTyxFQUFFLE1BQU0seUJBQUcscUJBQUg7QUFMbkIsT0FERyxFQU9BO0FBQ0NILFFBQUFBLEdBQUcsRUFBRSxPQUROO0FBRUNDLFFBQUFBLElBQUksRUFBRSxDQUFDO0FBQUVULFVBQUFBO0FBQUYsU0FBRCxLQUFlLENBQUNBLEtBQUQsSUFBVVAsS0FBSyxDQUFDd0IsVUFBTixDQUFpQmpCLEtBQWpCLENBRmhDO0FBR0NXLFFBQUFBLE9BQU8sRUFBRSxNQUFNLHlCQUFHLHlDQUFIO0FBSGhCLE9BUEE7QUFEaUMsS0FBZixDQXhMVjtBQUFBLDJEQXdNTyxNQUFPQyxVQUFQLElBQXNCO0FBQzVDLFlBQU1DLE1BQU0sR0FBRyxNQUFNLEtBQUtLLGtCQUFMLENBQXdCTixVQUF4QixDQUFyQjtBQUNBLFdBQUtHLGNBQUwsQ0FBb0IxQyxVQUFVLENBQUNvQixLQUEvQixFQUFzQ29CLE1BQU0sQ0FBQ0csS0FBN0M7QUFDQSxhQUFPSCxNQUFQO0FBQ0gsS0E1TWtCO0FBQUEsb0VBOE1nQix5QkFBZTtBQUM5Q04sTUFBQUEsS0FBSyxFQUFFLENBQ0g7QUFDSUMsUUFBQUEsR0FBRyxFQUFFLFVBRFQ7O0FBRUlDLFFBQUFBLElBQUksQ0FBQztBQUFFVCxVQUFBQSxLQUFGO0FBQVNVLFVBQUFBO0FBQVQsU0FBRCxFQUF3QjtBQUN4QixpQkFBT0EsVUFBVSxJQUFJLENBQUMsQ0FBQ1YsS0FBdkI7QUFDSCxTQUpMOztBQUtJVyxRQUFBQSxPQUFPLEVBQUUsTUFBTSx5QkFBRyxvQkFBSDtBQUxuQixPQURHLEVBT0E7QUFDQ0gsUUFBQUEsR0FBRyxFQUFFLFFBRE47QUFFQ0MsUUFBQUEsSUFBSSxFQUFFLENBQUM7QUFBRVQsVUFBQUE7QUFBRixTQUFELEtBQWUsQ0FBQ0EsS0FBRCxJQUFVNUIsa0JBQWtCLENBQUNxQyxJQUFuQixDQUF3QlQsS0FBeEIsQ0FGaEM7QUFHQ1csUUFBQUEsT0FBTyxFQUFFLE1BQU0seUJBQUcsd0VBQUg7QUFIaEIsT0FQQTtBQUR1QyxLQUFmLENBOU1oQjtBQUFBLGlFQThOYSxNQUFPQyxVQUFQLElBQXNCO0FBQ2xELFlBQU1DLE1BQU0sR0FBRyxNQUFNLEtBQUtNLHdCQUFMLENBQThCUCxVQUE5QixDQUFyQjtBQUNBLFdBQUtHLGNBQUwsQ0FBb0IxQyxVQUFVLENBQUMrQyxRQUEvQixFQUF5Q1AsTUFBTSxDQUFDRyxLQUFoRDtBQUNBLGFBQU9ILE1BQVA7QUFDSCxLQWxPa0I7QUFBQSxpRUFvT2EseUJBQWU7QUFDM0NOLE1BQUFBLEtBQUssRUFBRSxDQUNIO0FBQ0lDLFFBQUFBLEdBQUcsRUFBRSxVQURUOztBQUVJQyxRQUFBQSxJQUFJLENBQUM7QUFBRVQsVUFBQUEsS0FBRjtBQUFTVSxVQUFBQTtBQUFULFNBQUQsRUFBd0I7QUFDeEIsaUJBQU9BLFVBQVUsSUFBSSxDQUFDLENBQUNWLEtBQXZCO0FBQ0gsU0FKTDs7QUFLSVcsUUFBQUEsT0FBTyxFQUFFLE1BQU0seUJBQUcsZ0JBQUg7QUFMbkIsT0FERztBQURvQyxLQUFmLENBcE9iO0FBQUEsOERBZ1BVLE1BQU9DLFVBQVAsSUFBc0I7QUFDL0MsWUFBTUMsTUFBTSxHQUFHLE1BQU0sS0FBS1EscUJBQUwsQ0FBMkJULFVBQTNCLENBQXJCO0FBQ0EsV0FBS0csY0FBTCxDQUFvQjFDLFVBQVUsQ0FBQytDLFFBQS9CLEVBQXlDUCxNQUFNLENBQUNHLEtBQWhEO0FBQ0EsYUFBT0gsTUFBUDtBQUNILEtBcFBrQjtBQUVmLFNBQUt0QixLQUFMLEdBQWE7QUFDVDtBQUNBK0IsTUFBQUEsVUFBVSxFQUFFLEVBRkg7QUFHVDlCLE1BQUFBLFNBQVMsRUFBRW5CLFVBQVUsQ0FBQ3FCLFFBSGI7QUFJVEcsTUFBQUEsUUFBUSxFQUFFO0FBSkQsS0FBYjtBQU1IOztBQW1GRCxRQUFjYix3QkFBZCxHQUF5QztBQUNyQztBQUNBO0FBQ0EsVUFBTXVDLGFBQWEsR0FBR0MsUUFBUSxDQUFDRCxhQUEvQjs7QUFDQSxRQUFJQSxhQUFKLEVBQW1CO0FBQ2ZBLE1BQUFBLGFBQWEsQ0FBQ0UsSUFBZDtBQUNIOztBQUVELFVBQU1DLHNCQUFzQixHQUFHLENBQzNCLEtBQUtuQyxLQUFMLENBQVdDLFNBRGdCLEVBRTNCbkIsVUFBVSxDQUFDK0MsUUFGZ0IsQ0FBL0IsQ0FScUMsQ0FhckM7QUFDQTs7QUFDQSxTQUFLLE1BQU1PLE9BQVgsSUFBc0JELHNCQUF0QixFQUE4QztBQUMxQyxZQUFNRSxLQUFLLEdBQUcsS0FBS0QsT0FBTCxDQUFkOztBQUNBLFVBQUksQ0FBQ0MsS0FBTCxFQUFZO0FBQ1I7QUFDSCxPQUp5QyxDQUsxQztBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsWUFBTUEsS0FBSyxDQUFDQyxRQUFOLENBQWU7QUFBRW5CLFFBQUFBLFVBQVUsRUFBRTtBQUFkLE9BQWYsQ0FBTjtBQUNILEtBekJvQyxDQTJCckM7QUFDQTs7O0FBQ0EsVUFBTSxJQUFJb0IsT0FBSixDQUFrQkMsT0FBTyxJQUFJLEtBQUs3QixRQUFMLENBQWMsRUFBZCxFQUFrQjZCLE9BQWxCLENBQTdCLENBQU47O0FBRUEsUUFBSSxLQUFLaEQsY0FBTCxFQUFKLEVBQTJCO0FBQ3ZCLGFBQU8sSUFBUDtBQUNIOztBQUVELFVBQU1pRCxZQUFZLEdBQUcsS0FBS0MscUJBQUwsQ0FBMkJQLHNCQUEzQixDQUFyQjs7QUFFQSxRQUFJLENBQUNNLFlBQUwsRUFBbUI7QUFDZixhQUFPLElBQVA7QUFDSCxLQXZDb0MsQ0F5Q3JDO0FBQ0E7OztBQUNBQSxJQUFBQSxZQUFZLENBQUNFLEtBQWI7QUFDQUYsSUFBQUEsWUFBWSxDQUFDSCxRQUFiLENBQXNCO0FBQUVuQixNQUFBQSxVQUFVLEVBQUUsS0FBZDtBQUFxQnlCLE1BQUFBLE9BQU8sRUFBRTtBQUE5QixLQUF0QjtBQUNBLFdBQU8sS0FBUDtBQUNIOztBQUVPcEQsRUFBQUEsY0FBUixHQUF5QjtBQUNyQixVQUFNcUQsSUFBSSxHQUFHQyxNQUFNLENBQUNELElBQVAsQ0FBWSxLQUFLN0MsS0FBTCxDQUFXK0IsVUFBdkIsQ0FBYjs7QUFDQSxTQUFLLElBQUlnQixDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHRixJQUFJLENBQUNHLE1BQXpCLEVBQWlDLEVBQUVELENBQW5DLEVBQXNDO0FBQ2xDLFVBQUksQ0FBQyxLQUFLL0MsS0FBTCxDQUFXK0IsVUFBWCxDQUFzQmMsSUFBSSxDQUFDRSxDQUFELENBQTFCLENBQUwsRUFBcUM7QUFDakMsZUFBTyxLQUFQO0FBQ0g7QUFDSjs7QUFDRCxXQUFPLElBQVA7QUFDSDs7QUFFT0wsRUFBQUEscUJBQVIsQ0FBOEJPO0FBQTlCO0FBQUEsSUFBc0Q7QUFDbEQsU0FBSyxNQUFNYixPQUFYLElBQXNCYSxRQUF0QixFQUFnQztBQUM1QixVQUFJLENBQUMsS0FBS2pELEtBQUwsQ0FBVytCLFVBQVgsQ0FBc0JLLE9BQXRCLENBQUQsSUFBbUMsS0FBS0EsT0FBTCxDQUF2QyxFQUFzRDtBQUNsRCxlQUFPLEtBQUtBLE9BQUwsQ0FBUDtBQUNIO0FBQ0o7O0FBQ0QsV0FBTyxJQUFQO0FBQ0g7O0FBRU9aLEVBQUFBLGNBQVIsQ0FBdUJZO0FBQXZCO0FBQUEsSUFBNENYO0FBQTVDO0FBQUEsSUFBNEQ7QUFDeEQsVUFBTTtBQUFFTSxNQUFBQTtBQUFGLFFBQWlCLEtBQUsvQixLQUE1QjtBQUNBK0IsSUFBQUEsVUFBVSxDQUFDSyxPQUFELENBQVYsR0FBc0JYLEtBQXRCO0FBQ0EsU0FBS2QsUUFBTCxDQUFjO0FBQ1ZvQixNQUFBQTtBQURVLEtBQWQ7QUFHSDs7QUFrRk9tQixFQUFBQSxnQkFBUixDQUF5QmpEO0FBQXpCO0FBQUEsSUFBeURrRDtBQUF6RDtBQUFBLElBQTZFO0FBQ3pFLFVBQU1DLE9BQU8sR0FBRztBQUNaQyxNQUFBQSxLQUFLLEVBQUU7QUFESyxLQUFoQjs7QUFJQSxZQUFRcEQsU0FBUjtBQUNJLFdBQUtuQixVQUFVLENBQUNvQixLQUFoQjtBQUNJa0QsUUFBQUEsT0FBTyxDQUFDQyxLQUFSLEdBQWdCLEtBQUtsRSxLQUFMLENBQVdtRSxjQUFYLElBQTZCLENBQUMsS0FBS25FLEtBQUwsQ0FBV1UsUUFBekQ7QUFDQSw0QkFBTyw2QkFBQyxjQUFEO0FBQ0gsVUFBQSxTQUFTLEVBQUUseUJBQVd1RCxPQUFYLENBRFI7QUFFSCxVQUFBLElBQUksRUFBQyxVQUZGLENBRWE7QUFGYjtBQUdILFVBQUEsR0FBRyxFQUFDLGFBSEQ7QUFJSCxVQUFBLElBQUksRUFBQyxNQUpGO0FBS0gsVUFBQSxLQUFLLEVBQUUseUJBQUcsT0FBSCxDQUxKO0FBTUgsVUFBQSxXQUFXLEVBQUMsaUJBTlQ7QUFPSCxVQUFBLEtBQUssRUFBRSxLQUFLakUsS0FBTCxDQUFXVSxRQVBmO0FBUUgsVUFBQSxRQUFRLEVBQUUsS0FBS1UsaUJBUlo7QUFTSCxVQUFBLE9BQU8sRUFBRSxLQUFLZ0QsZUFUWDtBQVVILFVBQUEsTUFBTSxFQUFFLEtBQUs3QyxjQVZWO0FBV0gsVUFBQSxRQUFRLEVBQUUsS0FBS3ZCLEtBQUwsQ0FBV3FFLGFBWGxCO0FBWUgsVUFBQSxTQUFTLEVBQUVMLFNBWlI7QUFhSCxVQUFBLFVBQVUsRUFBRSxLQUFLTSxlQWJkO0FBY0gsVUFBQSxHQUFHLEVBQUVwQixLQUFLLElBQUksS0FBS3ZELFVBQVUsQ0FBQ29CLEtBQWhCLElBQXlCbUM7QUFkcEMsVUFBUDs7QUFnQkosV0FBS3ZELFVBQVUsQ0FBQ3FCLFFBQWhCO0FBQ0lpRCxRQUFBQSxPQUFPLENBQUNDLEtBQVIsR0FBZ0IsS0FBS2xFLEtBQUwsQ0FBV21FLGNBQVgsSUFBNkIsQ0FBQyxLQUFLbkUsS0FBTCxDQUFXVSxRQUF6RDtBQUNBLDRCQUFPLDZCQUFDLGNBQUQ7QUFDSCxVQUFBLFNBQVMsRUFBRSx5QkFBV3VELE9BQVgsQ0FEUjtBQUVILFVBQUEsSUFBSSxFQUFDLFVBRkYsQ0FFYTtBQUZiO0FBR0gsVUFBQSxHQUFHLEVBQUMsZ0JBSEQ7QUFJSCxVQUFBLElBQUksRUFBQyxNQUpGO0FBS0gsVUFBQSxLQUFLLEVBQUUseUJBQUcsVUFBSCxDQUxKO0FBTUgsVUFBQSxXQUFXLEVBQUUseUJBQUcsVUFBSCxFQUFlTSxpQkFBZixFQU5WO0FBT0gsVUFBQSxLQUFLLEVBQUUsS0FBS3ZFLEtBQUwsQ0FBV1UsUUFQZjtBQVFILFVBQUEsUUFBUSxFQUFFLEtBQUtVLGlCQVJaO0FBU0gsVUFBQSxPQUFPLEVBQUUsS0FBS2dELGVBVFg7QUFVSCxVQUFBLE1BQU0sRUFBRSxLQUFLN0MsY0FWVjtBQVdILFVBQUEsUUFBUSxFQUFFLEtBQUt2QixLQUFMLENBQVdxRSxhQVhsQjtBQVlILFVBQUEsU0FBUyxFQUFFTCxTQVpSO0FBYUgsVUFBQSxVQUFVLEVBQUUsS0FBS1Esa0JBYmQ7QUFjSCxVQUFBLEdBQUcsRUFBRXRCLEtBQUssSUFBSSxLQUFLdkQsVUFBVSxDQUFDcUIsUUFBaEIsSUFBNEJrQztBQWR2QyxVQUFQOztBQWdCSixXQUFLdkQsVUFBVSxDQUFDc0IsS0FBaEI7QUFBdUI7QUFDbkJnRCxVQUFBQSxPQUFPLENBQUNDLEtBQVIsR0FBZ0IsS0FBS2xFLEtBQUwsQ0FBV21FLGNBQVgsSUFBNkIsQ0FBQyxLQUFLbkUsS0FBTCxDQUFXWSxXQUF6RDs7QUFFQSxnQkFBTUQsWUFBWSxnQkFBRyw2QkFBQyx3QkFBRDtBQUNqQixZQUFBLEtBQUssRUFBRSxLQUFLWCxLQUFMLENBQVdXLFlBREQ7QUFFakIsWUFBQSxPQUFPLEVBQUUsSUFGUTtBQUdqQixZQUFBLFVBQVUsRUFBRSxJQUhLO0FBSWpCLFlBQUEsY0FBYyxFQUFFLEtBQUtlO0FBSkosWUFBckI7O0FBT0EsOEJBQU8sNkJBQUMsY0FBRDtBQUNILFlBQUEsU0FBUyxFQUFFLHlCQUFXdUMsT0FBWCxDQURSO0FBRUgsWUFBQSxJQUFJLEVBQUMsYUFGRjtBQUdILFlBQUEsR0FBRyxFQUFDLGFBSEQ7QUFJSCxZQUFBLElBQUksRUFBQyxNQUpGO0FBS0gsWUFBQSxLQUFLLEVBQUUseUJBQUcsT0FBSCxDQUxKO0FBTUgsWUFBQSxLQUFLLEVBQUUsS0FBS2pFLEtBQUwsQ0FBV1ksV0FOZjtBQU9ILFlBQUEsZUFBZSxFQUFFRCxZQVBkO0FBUUgsWUFBQSxRQUFRLEVBQUUsS0FBS2lCLG9CQVJaO0FBU0gsWUFBQSxPQUFPLEVBQUUsS0FBSzZDLGtCQVRYO0FBVUgsWUFBQSxNQUFNLEVBQUUsS0FBS0MsaUJBVlY7QUFXSCxZQUFBLFFBQVEsRUFBRSxLQUFLMUUsS0FBTCxDQUFXcUUsYUFYbEI7QUFZSCxZQUFBLFNBQVMsRUFBRUwsU0FaUjtBQWFILFlBQUEsVUFBVSxFQUFFLEtBQUtXLHFCQWJkO0FBY0gsWUFBQSxHQUFHLEVBQUV6QixLQUFLLElBQUksS0FBS3ZELFVBQVUsQ0FBQytDLFFBQWhCLElBQTRCUTtBQWR2QyxZQUFQO0FBZ0JIO0FBL0RMO0FBaUVIOztBQUVPMEIsRUFBQUEsWUFBUixHQUF1QjtBQUNuQixZQUFRLEtBQUsvRCxLQUFMLENBQVdDLFNBQW5CO0FBQ0ksV0FBS25CLFVBQVUsQ0FBQ29CLEtBQWhCO0FBQ0EsV0FBS3BCLFVBQVUsQ0FBQ3FCLFFBQWhCO0FBQ0ksZUFBTyxDQUFDLEtBQUtoQixLQUFMLENBQVdVLFFBQW5COztBQUNKLFdBQUtmLFVBQVUsQ0FBQ3NCLEtBQWhCO0FBQ0ksZUFBTyxDQUFDLEtBQUtqQixLQUFMLENBQVdXLFlBQVosSUFBNEIsQ0FBQyxLQUFLWCxLQUFMLENBQVdZLFdBQS9DO0FBTFI7QUFPSDs7QUFFRGlFLEVBQUFBLE1BQU0sR0FBRztBQUNMLFFBQUlDLGlCQUFKOztBQUVBLFFBQUksS0FBSzlFLEtBQUwsQ0FBV0kscUJBQWYsRUFBc0M7QUFDbEMwRSxNQUFBQSxpQkFBaUIsZ0JBQUcsNkJBQUMseUJBQUQ7QUFDaEIsUUFBQSxTQUFTLEVBQUMsaUJBRE07QUFFaEIsUUFBQSxRQUFRLEVBQUUsS0FBSzlFLEtBQUwsQ0FBVytFLElBRkw7QUFHaEIsUUFBQSxJQUFJLEVBQUMsTUFIVztBQUloQixRQUFBLE9BQU8sRUFBRSxLQUFLM0U7QUFKRSxTQU1mLHlCQUFHLGtCQUFILENBTmUsQ0FBcEI7QUFRSDs7QUFFRCxVQUFNNEUsWUFBWSxHQUFHLHlCQUFXO0FBQzVCZCxNQUFBQSxLQUFLLEVBQUUsS0FBS2xFLEtBQUwsQ0FBV21FLGNBQVgsSUFBNkIsQ0FBQyxLQUFLUyxZQUFMLEVBRFQsQ0FDOEI7O0FBRDlCLEtBQVgsQ0FBckIsQ0FkSyxDQWtCTDtBQUNBOztBQUNBLFVBQU1LLGlCQUFpQixHQUFHLENBQUMsS0FBS0wsWUFBTCxFQUEzQjtBQUNBLFVBQU1NLFVBQVUsR0FBRyxLQUFLbkIsZ0JBQUwsQ0FBc0IsS0FBS2xELEtBQUwsQ0FBV0MsU0FBakMsRUFBNEMsQ0FBQ21FLGlCQUE3QyxDQUFuQjtBQUVBLFFBQUluRSxTQUFKOztBQUNBLFFBQUksQ0FBQ3FFLG1CQUFVQyxHQUFWLEdBQWdCQyxrQkFBckIsRUFBeUM7QUFDckN2RSxNQUFBQSxTQUFTLGdCQUNMO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixzQkFDSTtBQUFPLFFBQUEsU0FBUyxFQUFDO0FBQWpCLFNBQXlDLHlCQUFHLGNBQUgsQ0FBekMsQ0FESixlQUVJLDZCQUFDLGNBQUQ7QUFDSSxRQUFBLE9BQU8sRUFBQyxRQURaO0FBRUksUUFBQSxLQUFLLEVBQUUsS0FBS0QsS0FBTCxDQUFXQyxTQUZ0QjtBQUdJLFFBQUEsUUFBUSxFQUFFLEtBQUt3RSxpQkFIbkI7QUFJSSxRQUFBLFFBQVEsRUFBRSxLQUFLdEYsS0FBTCxDQUFXcUU7QUFKekIsc0JBTUk7QUFBUSxRQUFBLEdBQUcsRUFBRTFFLFVBQVUsQ0FBQ3FCLFFBQXhCO0FBQWtDLFFBQUEsS0FBSyxFQUFFckIsVUFBVSxDQUFDcUI7QUFBcEQsU0FDSyx5QkFBRyxVQUFILENBREwsQ0FOSixlQVNJO0FBQ0ksUUFBQSxHQUFHLEVBQUVyQixVQUFVLENBQUNvQixLQURwQjtBQUVJLFFBQUEsS0FBSyxFQUFFcEIsVUFBVSxDQUFDb0I7QUFGdEIsU0FJSyx5QkFBRyxlQUFILENBSkwsQ0FUSixlQWVJO0FBQVEsUUFBQSxHQUFHLEVBQUVwQixVQUFVLENBQUMrQyxRQUF4QjtBQUFrQyxRQUFBLEtBQUssRUFBRS9DLFVBQVUsQ0FBQytDO0FBQXBELFNBQ0sseUJBQUcsT0FBSCxDQURMLENBZkosQ0FGSixDQURKO0FBd0JIOztBQUVELHdCQUNJLHVEQUNJO0FBQU0sTUFBQSxRQUFRLEVBQUUsS0FBSzZDO0FBQXJCLE9BQ0t6RSxTQURMLEVBRUtvRSxVQUZMLGVBR0ksNkJBQUMsY0FBRDtBQUNJLE1BQUEsU0FBUyxFQUFFRixZQURmO0FBRUksTUFBQSxJQUFJLEVBQUMsVUFGVDtBQUdJLE1BQUEsSUFBSSxFQUFDLFVBSFQ7QUFJSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxVQUFILENBSlg7QUFLSSxNQUFBLEtBQUssRUFBRSxLQUFLbkUsS0FBTCxDQUFXTSxRQUx0QjtBQU1JLE1BQUEsUUFBUSxFQUFFLEtBQUtxRSxpQkFObkI7QUFPSSxNQUFBLFFBQVEsRUFBRSxLQUFLeEYsS0FBTCxDQUFXcUUsYUFQekI7QUFRSSxNQUFBLFNBQVMsRUFBRVksaUJBUmY7QUFTSSxNQUFBLFVBQVUsRUFBRSxLQUFLUSxrQkFUckI7QUFVSSxNQUFBLEdBQUcsRUFBRXZDLEtBQUssSUFBSSxLQUFLdkQsVUFBVSxDQUFDK0MsUUFBaEIsSUFBNEJRO0FBVjlDLE1BSEosRUFlSzRCLGlCQWZMLEVBZ0JNLENBQUMsS0FBSzlFLEtBQUwsQ0FBVytFLElBQVosaUJBQW9CO0FBQU8sTUFBQSxTQUFTLEVBQUMsaUJBQWpCO0FBQ2xCLE1BQUEsSUFBSSxFQUFDLFFBRGE7QUFFbEIsTUFBQSxLQUFLLEVBQUUseUJBQUcsU0FBSCxDQUZXO0FBR2xCLE1BQUEsUUFBUSxFQUFFLEtBQUsvRSxLQUFMLENBQVdxRTtBQUhILE1BaEIxQixDQURKLENBREo7QUEwQkg7O0FBL1owRSxDLHlEQUNyRDtBQUNsQmpELEVBQUFBLGlCQUFpQixFQUFFLFlBQVcsQ0FBRSxDQURkO0FBRWxCRyxFQUFBQSxjQUFjLEVBQUUsWUFBVyxDQUFFLENBRlg7QUFHbEJHLEVBQUFBLHFCQUFxQixFQUFFLFlBQVcsQ0FBRSxDQUhsQjtBQUlsQkUsRUFBQUEsb0JBQW9CLEVBQUUsWUFBVyxDQUFFLENBSmpCO0FBS2xCdUMsRUFBQUEsY0FBYyxFQUFFLEtBTEU7QUFNbEJFLEVBQUFBLGFBQWEsRUFBRTtBQU5HLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYsIDIwMTcsIDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB7VmFsaWRhdGVkU2VydmVyQ29uZmlnfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvQXV0b0Rpc2NvdmVyeVV0aWxzXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4uLy4uLy4uL0NvdW50bHlBbmFseXRpY3NcIjtcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiBmcm9tIFwiLi4vZWxlbWVudHMvVmFsaWRhdGlvblwiO1xuaW1wb3J0ICogYXMgRW1haWwgZnJvbSBcIi4uLy4uLy4uL2VtYWlsXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQ291bnRyeURyb3Bkb3duIGZyb20gXCIuL0NvdW50cnlEcm9wZG93blwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8vIEZvciB2YWxpZGF0aW5nIHBob25lIG51bWJlcnMgd2l0aG91dCBjb3VudHJ5IGNvZGVzXG5jb25zdCBQSE9ORV9OVU1CRVJfUkVHRVggPSAvXlswLTkoKVxcLVxcc10qJC87XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHVzZXJuYW1lOiBzdHJpbmc7IC8vIGFsc28gdXNlZCBmb3IgZW1haWwgYWRkcmVzc1xuICAgIHBob25lQ291bnRyeTogc3RyaW5nO1xuICAgIHBob25lTnVtYmVyOiBzdHJpbmc7XG5cbiAgICBzZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcbiAgICBsb2dpbkluY29ycmVjdD86IGJvb2xlYW47XG4gICAgZGlzYWJsZVN1Ym1pdD86IGJvb2xlYW47XG4gICAgYnVzeT86IGJvb2xlYW47XG5cbiAgICBvblN1Ym1pdCh1c2VybmFtZTogc3RyaW5nLCBwaG9uZUNvdW50cnk6IHZvaWQsIHBob25lTnVtYmVyOiB2b2lkLCBwYXNzd29yZDogc3RyaW5nKTogdm9pZDtcbiAgICBvblN1Ym1pdCh1c2VybmFtZTogdm9pZCwgcGhvbmVDb3VudHJ5OiBzdHJpbmcsIHBob25lTnVtYmVyOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiB2b2lkO1xuICAgIG9uVXNlcm5hbWVDaGFuZ2VkPyh1c2VybmFtZTogc3RyaW5nKTogdm9pZDtcbiAgICBvblVzZXJuYW1lQmx1cj8odXNlcm5hbWU6IHN0cmluZyk6IHZvaWQ7XG4gICAgb25QaG9uZUNvdW50cnlDaGFuZ2VkPyhwaG9uZUNvdW50cnk6IHN0cmluZyk6IHZvaWQ7XG4gICAgb25QaG9uZU51bWJlckNoYW5nZWQ/KHBob25lTnVtYmVyOiBzdHJpbmcpOiB2b2lkO1xuICAgIG9uRm9yZ290UGFzc3dvcmRDbGljaz8oKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgZmllbGRWYWxpZDogUGFydGlhbDxSZWNvcmQ8TG9naW5GaWVsZCwgYm9vbGVhbj4+O1xuICAgIGxvZ2luVHlwZTogTG9naW5GaWVsZC5FbWFpbCB8IExvZ2luRmllbGQuTWF0cml4SWQgfCBMb2dpbkZpZWxkLlBob25lLFxuICAgIHBhc3N3b3JkOiBcIlwiLFxufVxuXG5lbnVtIExvZ2luRmllbGQge1xuICAgIEVtYWlsID0gXCJsb2dpbl9maWVsZF9lbWFpbFwiLFxuICAgIE1hdHJpeElkID0gXCJsb2dpbl9maWVsZF9teGlkXCIsXG4gICAgUGhvbmUgPSBcImxvZ2luX2ZpZWxkX3Bob25lXCIsXG4gICAgUGFzc3dvcmQgPSBcImxvZ2luX2ZpZWxkX3Bob25lXCIsXG59XG5cbi8qXG4gKiBBIHB1cmUgVUkgY29tcG9uZW50IHdoaWNoIGRpc3BsYXlzIGEgdXNlcm5hbWUvcGFzc3dvcmQgZm9ybS5cbiAqIFRoZSBlbWFpbC91c2VybmFtZS9waG9uZSBmaWVsZHMgYXJlIGZ1bGx5LWNvbnRyb2xsZWQsIHRoZSBwYXNzd29yZCBmaWVsZCBpcyBub3QuXG4gKi9cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmF1dGguUGFzc3dvcmRMb2dpblwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFzc3dvcmRMb2dpbiBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBvblVzZXJuYW1lQ2hhbmdlZDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgb25Vc2VybmFtZUJsdXI6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIG9uUGhvbmVDb3VudHJ5Q2hhbmdlZDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgb25QaG9uZU51bWJlckNoYW5nZWQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIGxvZ2luSW5jb3JyZWN0OiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZVN1Ym1pdDogZmFsc2UsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIEZpZWxkIGVycm9yIGNvZGVzIGJ5IGZpZWxkIElEXG4gICAgICAgICAgICBmaWVsZFZhbGlkOiB7fSxcbiAgICAgICAgICAgIGxvZ2luVHlwZTogTG9naW5GaWVsZC5NYXRyaXhJZCxcbiAgICAgICAgICAgIHBhc3N3b3JkOiBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Gb3Jnb3RQYXNzd29yZENsaWNrID0gZXYgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZvcmdvdFBhc3N3b3JkQ2xpY2soKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN1Ym1pdEZvcm0gPSBhc3luYyBldiA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgYWxsRmllbGRzVmFsaWQgPSBhd2FpdCB0aGlzLnZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpO1xuICAgICAgICBpZiAoIWFsbEZpZWxkc1ZhbGlkKSB7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19yZWdpc3RyYXRpb25fc3VibWl0X2ZhaWxlZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1c2VybmFtZSA9ICcnOyAvLyBYWFg6IFN5bmFwc2UgYnJlYWtzIGlmIHlvdSBzZW5kIG51bGwgaGVyZTpcbiAgICAgICAgbGV0IHBob25lQ291bnRyeSA9IG51bGw7XG4gICAgICAgIGxldCBwaG9uZU51bWJlciA9IG51bGw7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLmxvZ2luVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBMb2dpbkZpZWxkLkVtYWlsOlxuICAgICAgICAgICAgY2FzZSBMb2dpbkZpZWxkLk1hdHJpeElkOlxuICAgICAgICAgICAgICAgIHVzZXJuYW1lID0gdGhpcy5wcm9wcy51c2VybmFtZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5QaG9uZTpcbiAgICAgICAgICAgICAgICBwaG9uZUNvdW50cnkgPSB0aGlzLnByb3BzLnBob25lQ291bnRyeTtcbiAgICAgICAgICAgICAgICBwaG9uZU51bWJlciA9IHRoaXMucHJvcHMucGhvbmVOdW1iZXI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByb3BzLm9uU3VibWl0KHVzZXJuYW1lLCBwaG9uZUNvdW50cnksIHBob25lTnVtYmVyLCB0aGlzLnN0YXRlLnBhc3N3b3JkKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzZXJuYW1lQ2hhbmdlZCA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblVzZXJuYW1lQ2hhbmdlZChldi50YXJnZXQudmFsdWUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlcm5hbWVGb2N1cyA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubG9naW5UeXBlID09PSBMb2dpbkZpZWxkLk1hdHJpeElkKSB7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19sb2dpbl9teGlkX2ZvY3VzXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfbG9naW5fZW1haWxfZm9jdXNcIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzZXJuYW1lQmx1ciA9IGV2ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubG9naW5UeXBlID09PSBMb2dpbkZpZWxkLk1hdHJpeElkKSB7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19sb2dpbl9teGlkX2JsdXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19sb2dpbl9lbWFpbF9ibHVyXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMub25Vc2VybmFtZUJsdXIoZXYudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkxvZ2luVHlwZUNoYW5nZSA9IGV2ID0+IHtcbiAgICAgICAgY29uc3QgbG9naW5UeXBlID0gZXYudGFyZ2V0LnZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9naW5UeXBlIH0pO1xuICAgICAgICB0aGlzLnByb3BzLm9uVXNlcm5hbWVDaGFuZ2VkKFwiXCIpOyAvLyBSZXNldCBiZWNhdXNlIGVtYWlsIGFuZCB1c2VybmFtZSB1c2UgdGhlIHNhbWUgc3RhdGVcbiAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfbG9naW5fdHlwZV9jaGFuZ2VkXCIsIHsgbG9naW5UeXBlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGhvbmVDb3VudHJ5Q2hhbmdlZCA9IGNvdW50cnkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhvbmVDb3VudHJ5Q2hhbmdlZChjb3VudHJ5LmlzbzIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGhvbmVOdW1iZXJDaGFuZ2VkID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhvbmVOdW1iZXJDaGFuZ2VkKGV2LnRhcmdldC52YWx1ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QaG9uZU51bWJlckZvY3VzID0gKCkgPT4ge1xuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19sb2dpbl9waG9uZV9udW1iZXJfZm9jdXNcIik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QaG9uZU51bWJlckJsdXIgPSBldiA9PiB7XG4gICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX2xvZ2luX3Bob25lX251bWJlcl9ibHVyXCIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzc3dvcmRDaGFuZ2VkID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtwYXNzd29yZDogZXYudGFyZ2V0LnZhbHVlfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXN5bmMgdmVyaWZ5RmllbGRzQmVmb3JlU3VibWl0KCkge1xuICAgICAgICAvLyBCbHVyIHRoZSBhY3RpdmUgZWxlbWVudCBpZiBhbnksIHNvIHdlIGZpcnN0IHJ1biBpdHMgYmx1ciB2YWxpZGF0aW9uLFxuICAgICAgICAvLyB3aGljaCBpcyBsZXNzIHN0cmljdCB0aGFuIHRoZSBwYXNzIHdlJ3JlIGFib3V0IHRvIGRvIGJlbG93IGZvciBhbGwgZmllbGRzLlxuICAgICAgICBjb25zdCBhY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgaWYgKGFjdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmllbGRJRHNJbkRpc3BsYXlPcmRlciA9IFtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubG9naW5UeXBlLFxuICAgICAgICAgICAgTG9naW5GaWVsZC5QYXNzd29yZCxcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBSdW4gYWxsIGZpZWxkcyB3aXRoIHN0cmljdGVyIHZhbGlkYXRpb24gdGhhdCBubyBsb25nZXIgYWxsb3dzIGVtcHR5XG4gICAgICAgIC8vIHZhbHVlcyBmb3IgcmVxdWlyZWQgZmllbGRzLlxuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkSUQgb2YgZmllbGRJRHNJbkRpc3BsYXlPcmRlcikge1xuICAgICAgICAgICAgY29uc3QgZmllbGQgPSB0aGlzW2ZpZWxkSURdO1xuICAgICAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2UgbXVzdCB3YWl0IGZvciB0aGVzZSB2YWxpZGF0aW9ucyB0byBmaW5pc2ggYmVmb3JlIHF1ZXVlaW5nXG4gICAgICAgICAgICAvLyB1cCB0aGUgc2V0U3RhdGUgYmVsb3cgc28gb3VyIHNldFN0YXRlIGdvZXMgaW4gdGhlIHF1ZXVlIGFmdGVyXG4gICAgICAgICAgICAvLyBhbGwgdGhlIHNldFN0YXRlcyBmcm9tIHRoZXNlIHZhbGlkYXRlIGNhbGxzICh0aGF0J3MgaG93IHdlXG4gICAgICAgICAgICAvLyBrbm93IHRoZXkndmUgZmluaXNoZWQpLlxuICAgICAgICAgICAgYXdhaXQgZmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRpb24gYW5kIHN0YXRlIHVwZGF0ZXMgYXJlIGFzeW5jLCBzbyB3ZSBuZWVkIHRvIHdhaXQgZm9yIHRoZW0gdG8gY29tcGxldGVcbiAgICAgICAgLy8gZmlyc3QuIFF1ZXVlIGEgYHNldFN0YXRlYCBjYWxsYmFjayBhbmQgd2FpdCBmb3IgaXQgdG8gcmVzb2x2ZS5cbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB0aGlzLnNldFN0YXRlKHt9LCByZXNvbHZlKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWxsRmllbGRzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbnZhbGlkRmllbGQgPSB0aGlzLmZpbmRGaXJzdEludmFsaWRGaWVsZChmaWVsZElEc0luRGlzcGxheU9yZGVyKTtcblxuICAgICAgICBpZiAoIWludmFsaWRGaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb2N1cyB0aGUgZmlyc3QgaW52YWxpZCBmaWVsZCBhbmQgc2hvdyBmZWVkYmFjayBpbiB0aGUgc3RyaWN0ZXIgbW9kZVxuICAgICAgICAvLyB0aGF0IG5vIGxvbmdlciBhbGxvd3MgZW1wdHkgdmFsdWVzIGZvciByZXF1aXJlZCBmaWVsZHMuXG4gICAgICAgIGludmFsaWRGaWVsZC5mb2N1cygpO1xuICAgICAgICBpbnZhbGlkRmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWxsRmllbGRzVmFsaWQoKSB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLmZpZWxkVmFsaWQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5maWVsZFZhbGlkW2tleXNbaV1dKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZEZpcnN0SW52YWxpZEZpZWxkKGZpZWxkSURzOiBMb2dpbkZpZWxkW10pIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZElEIG9mIGZpZWxkSURzKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmllbGRWYWxpZFtmaWVsZElEXSAmJiB0aGlzW2ZpZWxkSURdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbZmllbGRJRF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtYXJrRmllbGRWYWxpZChmaWVsZElEOiBMb2dpbkZpZWxkLCB2YWxpZDogYm9vbGVhbikge1xuICAgICAgICBjb25zdCB7IGZpZWxkVmFsaWQgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIGZpZWxkVmFsaWRbZmllbGRJRF0gPSB2YWxpZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBmaWVsZFZhbGlkLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlVXNlcm5hbWVSdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0KHsgdmFsdWUsIGFsbG93RW1wdHkgfSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWxsb3dFbXB0eSB8fCAhIXZhbHVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJFbnRlciB1c2VybmFtZVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBwcml2YXRlIG9uVXNlcm5hbWVWYWxpZGF0ZSA9IGFzeW5jIChmaWVsZFN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVVc2VybmFtZVJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKExvZ2luRmllbGQuTWF0cml4SWQsIHJlc3VsdC52YWxpZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdmFsaWRhdGVFbWFpbFJ1bGVzID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3QoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbGxvd0VtcHR5IHx8ICEhdmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIkVudGVyIGVtYWlsIGFkZHJlc3NcIiksXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiBcImVtYWlsXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogKHsgdmFsdWUgfSkgPT4gIXZhbHVlIHx8IEVtYWlsLmxvb2tzVmFsaWQodmFsdWUpLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRG9lc24ndCBsb29rIGxpa2UgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIHByaXZhdGUgb25FbWFpbFZhbGlkYXRlID0gYXN5bmMgKGZpZWxkU3RhdGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZUVtYWlsUnVsZXMoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoTG9naW5GaWVsZC5FbWFpbCwgcmVzdWx0LnZhbGlkKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVBob25lTnVtYmVyUnVsZXMgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdCh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93RW1wdHkgfHwgISF2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRW50ZXIgcGhvbmUgbnVtYmVyXCIpLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSB9KSA9PiAhdmFsdWUgfHwgUEhPTkVfTlVNQkVSX1JFR0VYLnRlc3QodmFsdWUpLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiVGhhdCBwaG9uZSBudW1iZXIgZG9lc24ndCBsb29rIHF1aXRlIHJpZ2h0LCBwbGVhc2UgY2hlY2sgYW5kIHRyeSBhZ2FpblwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBwcml2YXRlIG9uUGhvbmVOdW1iZXJWYWxpZGF0ZSA9IGFzeW5jIChmaWVsZFN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVQaG9uZU51bWJlclJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKExvZ2luRmllbGQuUGFzc3dvcmQsIHJlc3VsdC52YWxpZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdmFsaWRhdGVQYXNzd29yZFJ1bGVzID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3QoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbGxvd0VtcHR5IHx8ICEhdmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIkVudGVyIHBhc3N3b3JkXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIHByaXZhdGUgb25QYXNzd29yZFZhbGlkYXRlID0gYXN5bmMgKGZpZWxkU3RhdGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZVBhc3N3b3JkUnVsZXMoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoTG9naW5GaWVsZC5QYXNzd29yZCwgcmVzdWx0LnZhbGlkKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckxvZ2luRmllbGQobG9naW5UeXBlOiBJU3RhdGVbXCJsb2dpblR5cGVcIl0sIGF1dG9Gb2N1czogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBjbGFzc2VzID0ge1xuICAgICAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHN3aXRjaCAobG9naW5UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIExvZ2luRmllbGQuRW1haWw6XG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5lcnJvciA9IHRoaXMucHJvcHMubG9naW5JbmNvcnJlY3QgJiYgIXRoaXMucHJvcHMudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoY2xhc3Nlcyl9XG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ1c2VybmFtZVwiIC8vIG1ha2UgaXQgYSBsaXR0bGUgZWFzaWVyIGZvciBicm93c2VyJ3MgcmVtZW1iZXItcGFzc3dvcmRcbiAgICAgICAgICAgICAgICAgICAga2V5PVwiZW1haWxfaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkVtYWlsXCIpfVxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImpvZUBleGFtcGxlLmNvbVwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnVzZXJuYW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVzZXJuYW1lQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgb25Gb2N1cz17dGhpcy5vblVzZXJuYW1lRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vblVzZXJuYW1lQmx1cn1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZVN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXthdXRvRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMub25FbWFpbFZhbGlkYXRlfVxuICAgICAgICAgICAgICAgICAgICByZWY9e2ZpZWxkID0+IHRoaXNbTG9naW5GaWVsZC5FbWFpbF0gPSBmaWVsZH1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5NYXRyaXhJZDpcbiAgICAgICAgICAgICAgICBjbGFzc2VzLmVycm9yID0gdGhpcy5wcm9wcy5sb2dpbkluY29ycmVjdCAmJiAhdGhpcy5wcm9wcy51c2VybmFtZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhjbGFzc2VzKX1cbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cInVzZXJuYW1lXCIgLy8gbWFrZSBpdCBhIGxpdHRsZSBlYXNpZXIgZm9yIGJyb3dzZXIncyByZW1lbWJlci1wYXNzd29yZFxuICAgICAgICAgICAgICAgICAgICBrZXk9XCJ1c2VybmFtZV9pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiVXNlcm5hbWVcIil9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIlVzZXJuYW1lXCIpLnRvTG9jYWxlTG93ZXJDYXNlKCl9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnVzZXJuYW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVzZXJuYW1lQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgb25Gb2N1cz17dGhpcy5vblVzZXJuYW1lRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vblVzZXJuYW1lQmx1cn1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZVN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXthdXRvRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMub25Vc2VybmFtZVZhbGlkYXRlfVxuICAgICAgICAgICAgICAgICAgICByZWY9e2ZpZWxkID0+IHRoaXNbTG9naW5GaWVsZC5NYXRyaXhJZF0gPSBmaWVsZH1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5QaG9uZToge1xuICAgICAgICAgICAgICAgIGNsYXNzZXMuZXJyb3IgPSB0aGlzLnByb3BzLmxvZ2luSW5jb3JyZWN0ICYmICF0aGlzLnByb3BzLnBob25lTnVtYmVyO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGhvbmVDb3VudHJ5ID0gPENvdW50cnlEcm9wZG93blxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy5waG9uZUNvdW50cnl9XG4gICAgICAgICAgICAgICAgICAgIGlzU21hbGw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIHNob3dQcmVmaXg9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIG9uT3B0aW9uQ2hhbmdlPXt0aGlzLm9uUGhvbmVDb3VudHJ5Q2hhbmdlZH1cbiAgICAgICAgICAgICAgICAvPjtcblxuICAgICAgICAgICAgICAgIHJldHVybiA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKGNsYXNzZXMpfVxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwicGhvbmVOdW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICBrZXk9XCJwaG9uZV9pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiUGhvbmVcIil9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnBob25lTnVtYmVyfVxuICAgICAgICAgICAgICAgICAgICBwcmVmaXhDb21wb25lbnQ9e3Bob25lQ291bnRyeX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25QaG9uZU51bWJlckNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25QaG9uZU51bWJlckZvY3VzfVxuICAgICAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25QaG9uZU51bWJlckJsdXJ9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVTdWJtaXR9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17YXV0b0ZvY3VzfVxuICAgICAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uUGhvbmVOdW1iZXJWYWxpZGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXtmaWVsZCA9PiB0aGlzW0xvZ2luRmllbGQuUGFzc3dvcmRdID0gZmllbGR9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTG9naW5FbXB0eSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLmxvZ2luVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBMb2dpbkZpZWxkLkVtYWlsOlxuICAgICAgICAgICAgY2FzZSBMb2dpbkZpZWxkLk1hdHJpeElkOlxuICAgICAgICAgICAgICAgIHJldHVybiAhdGhpcy5wcm9wcy51c2VybmFtZTtcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5QaG9uZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMucHJvcHMucGhvbmVDb3VudHJ5IHx8ICF0aGlzLnByb3BzLnBob25lTnVtYmVyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZm9yZ290UGFzc3dvcmRKc3g7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25Gb3Jnb3RQYXNzd29yZENsaWNrKSB7XG4gICAgICAgICAgICBmb3Jnb3RQYXNzd29yZEpzeCA9IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTG9naW5fZm9yZ290XCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5idXN5fVxuICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRm9yZ290UGFzc3dvcmRDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7X3QoXCJGb3Jnb3QgcGFzc3dvcmQ/XCIpfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHB3RmllbGRDbGFzcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgZXJyb3I6IHRoaXMucHJvcHMubG9naW5JbmNvcnJlY3QgJiYgIXRoaXMuaXNMb2dpbkVtcHR5KCksIC8vIG9ubHkgZXJyb3IgcGFzc3dvcmQgaWYgZXJyb3IgaXNuJ3QgdG9wIGZpZWxkXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIElmIGxvZ2luIGlzIGVtcHR5LCBhdXRvRm9jdXMgbG9naW4sIG90aGVyd2lzZSBhdXRvRm9jdXMgcGFzc3dvcmQuXG4gICAgICAgIC8vIHRoaXMgaXMgZm9yIHdoZW4gYXV0byBzZXJ2ZXIgZGlzY292ZXJ5IHJlbW91bnRzIHVzIHdoZW4gdGhlIHVzZXIgdHJpZXMgdG8gdGFiIGZyb20gdXNlcm5hbWUgdG8gcGFzc3dvcmRcbiAgICAgICAgY29uc3QgYXV0b0ZvY3VzUGFzc3dvcmQgPSAhdGhpcy5pc0xvZ2luRW1wdHkoKTtcbiAgICAgICAgY29uc3QgbG9naW5GaWVsZCA9IHRoaXMucmVuZGVyTG9naW5GaWVsZCh0aGlzLnN0YXRlLmxvZ2luVHlwZSwgIWF1dG9Gb2N1c1Bhc3N3b3JkKTtcblxuICAgICAgICBsZXQgbG9naW5UeXBlO1xuICAgICAgICBpZiAoIVNka0NvbmZpZy5nZXQoKS5kaXNhYmxlXzNwaWRfbG9naW4pIHtcbiAgICAgICAgICAgIGxvZ2luVHlwZSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xvZ2luX3R5cGVfY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJteF9Mb2dpbl90eXBlX2xhYmVsXCI+eyBfdCgnU2lnbiBpbiB3aXRoJykgfTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInNlbGVjdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5sb2dpblR5cGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkxvZ2luVHlwZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVTdWJtaXR9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtMb2dpbkZpZWxkLk1hdHJpeElkfSB2YWx1ZT17TG9naW5GaWVsZC5NYXRyaXhJZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KCdVc2VybmFtZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtMb2dpbkZpZWxkLkVtYWlsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtMb2dpbkZpZWxkLkVtYWlsfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdCgnRW1haWwgYWRkcmVzcycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17TG9naW5GaWVsZC5QYXNzd29yZH0gdmFsdWU9e0xvZ2luRmllbGQuUGFzc3dvcmR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdCgnUGhvbmUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8L0ZpZWxkPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0Rm9ybX0+XG4gICAgICAgICAgICAgICAgICAgIHtsb2dpblR5cGV9XG4gICAgICAgICAgICAgICAgICAgIHtsb2dpbkZpZWxkfVxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17cHdGaWVsZENsYXNzfVxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ1Bhc3N3b3JkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUGFzc3dvcmRDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZVN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17YXV0b0ZvY3VzUGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uUGFzc3dvcmRWYWxpZGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tMb2dpbkZpZWxkLlBhc3N3b3JkXSA9IGZpZWxkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7Zm9yZ290UGFzc3dvcmRKc3h9XG4gICAgICAgICAgICAgICAgICAgIHsgIXRoaXMucHJvcHMuYnVzeSAmJiA8aW5wdXQgY2xhc3NOYW1lPVwibXhfTG9naW5fc3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e190KCdTaWduIGluJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICAvPiB9XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
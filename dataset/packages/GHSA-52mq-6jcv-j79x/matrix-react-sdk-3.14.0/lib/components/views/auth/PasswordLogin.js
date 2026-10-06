"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2015, 2016, 2017, 2019 The Matrix.org Foundation C.I.C.

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

class PasswordLogin extends _react.default.PureComponent
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

}

exports.default = PasswordLogin;
(0, _defineProperty2.default)(PasswordLogin, "defaultProps", {
  onUsernameChanged: function () {},
  onUsernameBlur: function () {},
  onPhoneCountryChanged: function () {},
  onPhoneNumberChanged: function () {},
  loginIncorrect: false,
  disableSubmit: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvUGFzc3dvcmRMb2dpbi50c3giXSwibmFtZXMiOlsiUEhPTkVfTlVNQkVSX1JFR0VYIiwiTG9naW5GaWVsZCIsIlBhc3N3b3JkTG9naW4iLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIm9uRm9yZ290UGFzc3dvcmRDbGljayIsImFsbEZpZWxkc1ZhbGlkIiwidmVyaWZ5RmllbGRzQmVmb3JlU3VibWl0IiwiQ291bnRseUFuYWx5dGljcyIsImluc3RhbmNlIiwidHJhY2siLCJ1c2VybmFtZSIsInBob25lQ291bnRyeSIsInBob25lTnVtYmVyIiwic3RhdGUiLCJsb2dpblR5cGUiLCJFbWFpbCIsIk1hdHJpeElkIiwiUGhvbmUiLCJvblN1Ym1pdCIsInBhc3N3b3JkIiwib25Vc2VybmFtZUNoYW5nZWQiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9uVXNlcm5hbWVCbHVyIiwic2V0U3RhdGUiLCJjb3VudHJ5Iiwib25QaG9uZUNvdW50cnlDaGFuZ2VkIiwiaXNvMiIsIm9uUGhvbmVOdW1iZXJDaGFuZ2VkIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiYWxsb3dFbXB0eSIsImludmFsaWQiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGVVc2VybmFtZVJ1bGVzIiwibWFya0ZpZWxkVmFsaWQiLCJ2YWxpZCIsImxvb2tzVmFsaWQiLCJ2YWxpZGF0ZUVtYWlsUnVsZXMiLCJ2YWxpZGF0ZVBob25lTnVtYmVyUnVsZXMiLCJQYXNzd29yZCIsInZhbGlkYXRlUGFzc3dvcmRSdWxlcyIsImZpZWxkVmFsaWQiLCJhY3RpdmVFbGVtZW50IiwiZG9jdW1lbnQiLCJibHVyIiwiZmllbGRJRHNJbkRpc3BsYXlPcmRlciIsImZpZWxkSUQiLCJmaWVsZCIsInZhbGlkYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbnZhbGlkRmllbGQiLCJmaW5kRmlyc3RJbnZhbGlkRmllbGQiLCJmb2N1cyIsImZvY3VzZWQiLCJrZXlzIiwiT2JqZWN0IiwiaSIsImxlbmd0aCIsImZpZWxkSURzIiwicmVuZGVyTG9naW5GaWVsZCIsImF1dG9Gb2N1cyIsImNsYXNzZXMiLCJlcnJvciIsImxvZ2luSW5jb3JyZWN0Iiwib25Vc2VybmFtZUZvY3VzIiwiZGlzYWJsZVN1Ym1pdCIsIm9uRW1haWxWYWxpZGF0ZSIsInRvTG9jYWxlTG93ZXJDYXNlIiwib25Vc2VybmFtZVZhbGlkYXRlIiwib25QaG9uZU51bWJlckZvY3VzIiwib25QaG9uZU51bWJlckJsdXIiLCJvblBob25lTnVtYmVyVmFsaWRhdGUiLCJpc0xvZ2luRW1wdHkiLCJyZW5kZXIiLCJmb3Jnb3RQYXNzd29yZEpzeCIsImJ1c3kiLCJwd0ZpZWxkQ2xhc3MiLCJhdXRvRm9jdXNQYXNzd29yZCIsImxvZ2luRmllbGQiLCJTZGtDb25maWciLCJnZXQiLCJkaXNhYmxlXzNwaWRfbG9naW4iLCJvbkxvZ2luVHlwZUNoYW5nZSIsIm9uU3VibWl0Rm9ybSIsIm9uUGFzc3dvcmRDaGFuZ2VkIiwib25QYXNzd29yZFZhbGlkYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFlQTtBQUNBLE1BQU1BLGtCQUFrQixHQUFHLGdCQUEzQjtJQTJCS0MsVTtBQU9MO0FBQ0E7QUFDQTtBQUNBOztXQVZLQSxVO0FBQUFBLEVBQUFBLFU7QUFBQUEsRUFBQUEsVTtBQUFBQSxFQUFBQSxVO0FBQUFBLEVBQUFBLFU7R0FBQUEsVSxLQUFBQSxVOztBQVdVLE1BQU1DLGFBQU4sU0FBNEJDLGVBQU1DO0FBQWxDO0FBQWdFO0FBVTNFQyxFQUFB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QyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiwgMjAxNywgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IHtWYWxpZGF0ZWRTZXJ2ZXJDb25maWd9IGZyb20gXCIuLi8uLi8uLi91dGlscy9BdXRvRGlzY292ZXJ5VXRpbHNcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vLi4vLi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uIGZyb20gXCIuLi9lbGVtZW50cy9WYWxpZGF0aW9uXCI7XG5pbXBvcnQgKiBhcyBFbWFpbCBmcm9tIFwiLi4vLi4vLi4vZW1haWxcIjtcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBDb3VudHJ5RHJvcGRvd24gZnJvbSBcIi4vQ291bnRyeURyb3Bkb3duXCI7XG5cbi8vIEZvciB2YWxpZGF0aW5nIHBob25lIG51bWJlcnMgd2l0aG91dCBjb3VudHJ5IGNvZGVzXG5jb25zdCBQSE9ORV9OVU1CRVJfUkVHRVggPSAvXlswLTkoKVxcLVxcc10qJC87XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHVzZXJuYW1lOiBzdHJpbmc7IC8vIGFsc28gdXNlZCBmb3IgZW1haWwgYWRkcmVzc1xuICAgIHBob25lQ291bnRyeTogc3RyaW5nO1xuICAgIHBob25lTnVtYmVyOiBzdHJpbmc7XG5cbiAgICBzZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcbiAgICBsb2dpbkluY29ycmVjdD86IGJvb2xlYW47XG4gICAgZGlzYWJsZVN1Ym1pdD86IGJvb2xlYW47XG4gICAgYnVzeT86IGJvb2xlYW47XG5cbiAgICBvblN1Ym1pdCh1c2VybmFtZTogc3RyaW5nLCBwaG9uZUNvdW50cnk6IHZvaWQsIHBob25lTnVtYmVyOiB2b2lkLCBwYXNzd29yZDogc3RyaW5nKTogdm9pZDtcbiAgICBvblN1Ym1pdCh1c2VybmFtZTogdm9pZCwgcGhvbmVDb3VudHJ5OiBzdHJpbmcsIHBob25lTnVtYmVyOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiB2b2lkO1xuICAgIG9uVXNlcm5hbWVDaGFuZ2VkPyh1c2VybmFtZTogc3RyaW5nKTogdm9pZDtcbiAgICBvblVzZXJuYW1lQmx1cj8odXNlcm5hbWU6IHN0cmluZyk6IHZvaWQ7XG4gICAgb25QaG9uZUNvdW50cnlDaGFuZ2VkPyhwaG9uZUNvdW50cnk6IHN0cmluZyk6IHZvaWQ7XG4gICAgb25QaG9uZU51bWJlckNoYW5nZWQ/KHBob25lTnVtYmVyOiBzdHJpbmcpOiB2b2lkO1xuICAgIG9uRm9yZ290UGFzc3dvcmRDbGljaz8oKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgZmllbGRWYWxpZDogUGFydGlhbDxSZWNvcmQ8TG9naW5GaWVsZCwgYm9vbGVhbj4+O1xuICAgIGxvZ2luVHlwZTogTG9naW5GaWVsZC5FbWFpbCB8IExvZ2luRmllbGQuTWF0cml4SWQgfCBMb2dpbkZpZWxkLlBob25lLFxuICAgIHBhc3N3b3JkOiBcIlwiLFxufVxuXG5lbnVtIExvZ2luRmllbGQge1xuICAgIEVtYWlsID0gXCJsb2dpbl9maWVsZF9lbWFpbFwiLFxuICAgIE1hdHJpeElkID0gXCJsb2dpbl9maWVsZF9teGlkXCIsXG4gICAgUGhvbmUgPSBcImxvZ2luX2ZpZWxkX3Bob25lXCIsXG4gICAgUGFzc3dvcmQgPSBcImxvZ2luX2ZpZWxkX3Bob25lXCIsXG59XG5cbi8qXG4gKiBBIHB1cmUgVUkgY29tcG9uZW50IHdoaWNoIGRpc3BsYXlzIGEgdXNlcm5hbWUvcGFzc3dvcmQgZm9ybS5cbiAqIFRoZSBlbWFpbC91c2VybmFtZS9waG9uZSBmaWVsZHMgYXJlIGZ1bGx5LWNvbnRyb2xsZWQsIHRoZSBwYXNzd29yZCBmaWVsZCBpcyBub3QuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhc3N3b3JkTG9naW4gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgb25Vc2VybmFtZUNoYW5nZWQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIG9uVXNlcm5hbWVCbHVyOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICBvblBob25lQ291bnRyeUNoYW5nZWQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIG9uUGhvbmVOdW1iZXJDaGFuZ2VkOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICBsb2dpbkluY29ycmVjdDogZmFsc2UsXG4gICAgICAgIGRpc2FibGVTdWJtaXQ6IGZhbHNlLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAvLyBGaWVsZCBlcnJvciBjb2RlcyBieSBmaWVsZCBJRFxuICAgICAgICAgICAgZmllbGRWYWxpZDoge30sXG4gICAgICAgICAgICBsb2dpblR5cGU6IExvZ2luRmllbGQuTWF0cml4SWQsXG4gICAgICAgICAgICBwYXNzd29yZDogXCJcIixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRm9yZ290UGFzc3dvcmRDbGljayA9IGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25Gb3Jnb3RQYXNzd29yZENsaWNrKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TdWJtaXRGb3JtID0gYXN5bmMgZXYgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IGFsbEZpZWxkc1ZhbGlkID0gYXdhaXQgdGhpcy52ZXJpZnlGaWVsZHNCZWZvcmVTdWJtaXQoKTtcbiAgICAgICAgaWYgKCFhbGxGaWVsZHNWYWxpZCkge1xuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfcmVnaXN0cmF0aW9uX3N1Ym1pdF9mYWlsZWRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXNlcm5hbWUgPSAnJzsgLy8gWFhYOiBTeW5hcHNlIGJyZWFrcyBpZiB5b3Ugc2VuZCBudWxsIGhlcmU6XG4gICAgICAgIGxldCBwaG9uZUNvdW50cnkgPSBudWxsO1xuICAgICAgICBsZXQgcGhvbmVOdW1iZXIgPSBudWxsO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5sb2dpblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5FbWFpbDpcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5NYXRyaXhJZDpcbiAgICAgICAgICAgICAgICB1c2VybmFtZSA9IHRoaXMucHJvcHMudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExvZ2luRmllbGQuUGhvbmU6XG4gICAgICAgICAgICAgICAgcGhvbmVDb3VudHJ5ID0gdGhpcy5wcm9wcy5waG9uZUNvdW50cnk7XG4gICAgICAgICAgICAgICAgcGhvbmVOdW1iZXIgPSB0aGlzLnByb3BzLnBob25lTnVtYmVyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vblN1Ym1pdCh1c2VybmFtZSwgcGhvbmVDb3VudHJ5LCBwaG9uZU51bWJlciwgdGhpcy5zdGF0ZS5wYXNzd29yZCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Vc2VybmFtZUNoYW5nZWQgPSBldiA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25Vc2VybmFtZUNoYW5nZWQoZXYudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzZXJuYW1lRm9jdXMgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmxvZ2luVHlwZSA9PT0gTG9naW5GaWVsZC5NYXRyaXhJZCkge1xuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfbG9naW5fbXhpZF9mb2N1c1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX2xvZ2luX2VtYWlsX2ZvY3VzXCIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Vc2VybmFtZUJsdXIgPSBldiA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmxvZ2luVHlwZSA9PT0gTG9naW5GaWVsZC5NYXRyaXhJZCkge1xuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfbG9naW5fbXhpZF9ibHVyXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfbG9naW5fZW1haWxfYmx1clwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzLm9uVXNlcm5hbWVCbHVyKGV2LnRhcmdldC52YWx1ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Mb2dpblR5cGVDaGFuZ2UgPSBldiA9PiB7XG4gICAgICAgIGNvbnN0IGxvZ2luVHlwZSA9IGV2LnRhcmdldC52YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvZ2luVHlwZSB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblVzZXJuYW1lQ2hhbmdlZChcIlwiKTsgLy8gUmVzZXQgYmVjYXVzZSBlbWFpbCBhbmQgdXNlcm5hbWUgdXNlIHRoZSBzYW1lIHN0YXRlXG4gICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX2xvZ2luX3R5cGVfY2hhbmdlZFwiLCB7IGxvZ2luVHlwZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBob25lQ291bnRyeUNoYW5nZWQgPSBjb3VudHJ5ID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBob25lQ291bnRyeUNoYW5nZWQoY291bnRyeS5pc28yKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBob25lTnVtYmVyQ2hhbmdlZCA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBob25lTnVtYmVyQ2hhbmdlZChldi50YXJnZXQudmFsdWUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGhvbmVOdW1iZXJGb2N1cyA9ICgpID0+IHtcbiAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfbG9naW5fcGhvbmVfbnVtYmVyX2ZvY3VzXCIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGhvbmVOdW1iZXJCbHVyID0gZXYgPT4ge1xuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19sb2dpbl9waG9uZV9udW1iZXJfYmx1clwiKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3N3b3JkQ2hhbmdlZCA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGFzc3dvcmQ6IGV2LnRhcmdldC52YWx1ZX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIHZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpIHtcbiAgICAgICAgLy8gQmx1ciB0aGUgYWN0aXZlIGVsZW1lbnQgaWYgYW55LCBzbyB3ZSBmaXJzdCBydW4gaXRzIGJsdXIgdmFsaWRhdGlvbixcbiAgICAgICAgLy8gd2hpY2ggaXMgbGVzcyBzdHJpY3QgdGhhbiB0aGUgcGFzcyB3ZSdyZSBhYm91dCB0byBkbyBiZWxvdyBmb3IgYWxsIGZpZWxkcy5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpZWxkSURzSW5EaXNwbGF5T3JkZXIgPSBbXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmxvZ2luVHlwZSxcbiAgICAgICAgICAgIExvZ2luRmllbGQuUGFzc3dvcmQsXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gUnVuIGFsbCBmaWVsZHMgd2l0aCBzdHJpY3RlciB2YWxpZGF0aW9uIHRoYXQgbm8gbG9uZ2VyIGFsbG93cyBlbXB0eVxuICAgICAgICAvLyB2YWx1ZXMgZm9yIHJlcXVpcmVkIGZpZWxkcy5cbiAgICAgICAgZm9yIChjb25zdCBmaWVsZElEIG9mIGZpZWxkSURzSW5EaXNwbGF5T3JkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gdGhpc1tmaWVsZElEXTtcbiAgICAgICAgICAgIGlmICghZmllbGQpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlIG11c3Qgd2FpdCBmb3IgdGhlc2UgdmFsaWRhdGlvbnMgdG8gZmluaXNoIGJlZm9yZSBxdWV1ZWluZ1xuICAgICAgICAgICAgLy8gdXAgdGhlIHNldFN0YXRlIGJlbG93IHNvIG91ciBzZXRTdGF0ZSBnb2VzIGluIHRoZSBxdWV1ZSBhZnRlclxuICAgICAgICAgICAgLy8gYWxsIHRoZSBzZXRTdGF0ZXMgZnJvbSB0aGVzZSB2YWxpZGF0ZSBjYWxscyAodGhhdCdzIGhvdyB3ZVxuICAgICAgICAgICAgLy8ga25vdyB0aGV5J3ZlIGZpbmlzaGVkKS5cbiAgICAgICAgICAgIGF3YWl0IGZpZWxkLnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0aW9uIGFuZCBzdGF0ZSB1cGRhdGVzIGFyZSBhc3luYywgc28gd2UgbmVlZCB0byB3YWl0IGZvciB0aGVtIHRvIGNvbXBsZXRlXG4gICAgICAgIC8vIGZpcnN0LiBRdWV1ZSBhIGBzZXRTdGF0ZWAgY2FsbGJhY2sgYW5kIHdhaXQgZm9yIGl0IHRvIHJlc29sdmUuXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7fSwgcmVzb2x2ZSkpO1xuXG4gICAgICAgIGlmICh0aGlzLmFsbEZpZWxkc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW52YWxpZEZpZWxkID0gdGhpcy5maW5kRmlyc3RJbnZhbGlkRmllbGQoZmllbGRJRHNJbkRpc3BsYXlPcmRlcik7XG5cbiAgICAgICAgaWYgKCFpbnZhbGlkRmllbGQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm9jdXMgdGhlIGZpcnN0IGludmFsaWQgZmllbGQgYW5kIHNob3cgZmVlZGJhY2sgaW4gdGhlIHN0cmljdGVyIG1vZGVcbiAgICAgICAgLy8gdGhhdCBubyBsb25nZXIgYWxsb3dzIGVtcHR5IHZhbHVlcyBmb3IgcmVxdWlyZWQgZmllbGRzLlxuICAgICAgICBpbnZhbGlkRmllbGQuZm9jdXMoKTtcbiAgICAgICAgaW52YWxpZEZpZWxkLnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFsbEZpZWxkc1ZhbGlkKCkge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5zdGF0ZS5maWVsZFZhbGlkKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmllbGRWYWxpZFtrZXlzW2ldXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRGaXJzdEludmFsaWRGaWVsZChmaWVsZElEczogTG9naW5GaWVsZFtdKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmllbGRJRCBvZiBmaWVsZElEcykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmZpZWxkVmFsaWRbZmllbGRJRF0gJiYgdGhpc1tmaWVsZElEXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzW2ZpZWxkSURdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgbWFya0ZpZWxkVmFsaWQoZmllbGRJRDogTG9naW5GaWVsZCwgdmFsaWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgeyBmaWVsZFZhbGlkIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBmaWVsZFZhbGlkW2ZpZWxkSURdID0gdmFsaWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZmllbGRWYWxpZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVVzZXJuYW1lUnVsZXMgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdCh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93RW1wdHkgfHwgISF2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRW50ZXIgdXNlcm5hbWVcIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgcHJpdmF0ZSBvblVzZXJuYW1lVmFsaWRhdGUgPSBhc3luYyAoZmllbGRTdGF0ZSkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnZhbGlkYXRlVXNlcm5hbWVSdWxlcyhmaWVsZFN0YXRlKTtcbiAgICAgICAgdGhpcy5tYXJrRmllbGRWYWxpZChMb2dpbkZpZWxkLk1hdHJpeElkLCByZXN1bHQudmFsaWQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlRW1haWxSdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0KHsgdmFsdWUsIGFsbG93RW1wdHkgfSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWxsb3dFbXB0eSB8fCAhIXZhbHVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJFbnRlciBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogXCJlbWFpbFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlIH0pID0+ICF2YWx1ZSB8fCBFbWFpbC5sb29rc1ZhbGlkKHZhbHVlKSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIkRvZXNuJ3QgbG9vayBsaWtlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBwcml2YXRlIG9uRW1haWxWYWxpZGF0ZSA9IGFzeW5jIChmaWVsZFN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVFbWFpbFJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKExvZ2luRmllbGQuRW1haWwsIHJlc3VsdC52YWxpZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdmFsaWRhdGVQaG9uZU51bWJlclJ1bGVzID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3QoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbGxvd0VtcHR5IHx8ICEhdmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIkVudGVyIHBob25lIG51bWJlclwiKSxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwibnVtYmVyXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogKHsgdmFsdWUgfSkgPT4gIXZhbHVlIHx8IFBIT05FX05VTUJFUl9SRUdFWC50ZXN0KHZhbHVlKSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlRoYXQgcGhvbmUgbnVtYmVyIGRvZXNuJ3QgbG9vayBxdWl0ZSByaWdodCwgcGxlYXNlIGNoZWNrIGFuZCB0cnkgYWdhaW5cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgcHJpdmF0ZSBvblBob25lTnVtYmVyVmFsaWRhdGUgPSBhc3luYyAoZmllbGRTdGF0ZSkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnZhbGlkYXRlUGhvbmVOdW1iZXJSdWxlcyhmaWVsZFN0YXRlKTtcbiAgICAgICAgdGhpcy5tYXJrRmllbGRWYWxpZChMb2dpbkZpZWxkLlBhc3N3b3JkLCByZXN1bHQudmFsaWQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlUGFzc3dvcmRSdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0KHsgdmFsdWUsIGFsbG93RW1wdHkgfSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWxsb3dFbXB0eSB8fCAhIXZhbHVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJFbnRlciBwYXNzd29yZFwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBwcml2YXRlIG9uUGFzc3dvcmRWYWxpZGF0ZSA9IGFzeW5jIChmaWVsZFN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVQYXNzd29yZFJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKExvZ2luRmllbGQuUGFzc3dvcmQsIHJlc3VsdC52YWxpZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJMb2dpbkZpZWxkKGxvZ2luVHlwZTogSVN0YXRlW1wibG9naW5UeXBlXCJdLCBhdXRvRm9jdXM6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICBzd2l0Y2ggKGxvZ2luVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBMb2dpbkZpZWxkLkVtYWlsOlxuICAgICAgICAgICAgICAgIGNsYXNzZXMuZXJyb3IgPSB0aGlzLnByb3BzLmxvZ2luSW5jb3JyZWN0ICYmICF0aGlzLnByb3BzLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIHJldHVybiA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKGNsYXNzZXMpfVxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwidXNlcm5hbWVcIiAvLyBtYWtlIGl0IGEgbGl0dGxlIGVhc2llciBmb3IgYnJvd3NlcidzIHJlbWVtYmVyLXBhc3N3b3JkXG4gICAgICAgICAgICAgICAgICAgIGtleT1cImVtYWlsX2lucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJFbWFpbFwiKX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJqb2VAZXhhbXBsZS5jb21cIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy51c2VybmFtZX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Vc2VybmFtZUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Vc2VybmFtZUZvY3VzfVxuICAgICAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25Vc2VybmFtZUJsdXJ9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVTdWJtaXR9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17YXV0b0ZvY3VzfVxuICAgICAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uRW1haWxWYWxpZGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXtmaWVsZCA9PiB0aGlzW0xvZ2luRmllbGQuRW1haWxdID0gZmllbGR9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBjYXNlIExvZ2luRmllbGQuTWF0cml4SWQ6XG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5lcnJvciA9IHRoaXMucHJvcHMubG9naW5JbmNvcnJlY3QgJiYgIXRoaXMucHJvcHMudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoY2xhc3Nlcyl9XG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ1c2VybmFtZVwiIC8vIG1ha2UgaXQgYSBsaXR0bGUgZWFzaWVyIGZvciBicm93c2VyJ3MgcmVtZW1iZXItcGFzc3dvcmRcbiAgICAgICAgICAgICAgICAgICAga2V5PVwidXNlcm5hbWVfaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlVzZXJuYW1lXCIpfVxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJVc2VybmFtZVwiKS50b0xvY2FsZUxvd2VyQ2FzZSgpfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy51c2VybmFtZX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Vc2VybmFtZUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Vc2VybmFtZUZvY3VzfVxuICAgICAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25Vc2VybmFtZUJsdXJ9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVTdWJtaXR9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17YXV0b0ZvY3VzfVxuICAgICAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uVXNlcm5hbWVWYWxpZGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXtmaWVsZCA9PiB0aGlzW0xvZ2luRmllbGQuTWF0cml4SWRdID0gZmllbGR9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBjYXNlIExvZ2luRmllbGQuUGhvbmU6IHtcbiAgICAgICAgICAgICAgICBjbGFzc2VzLmVycm9yID0gdGhpcy5wcm9wcy5sb2dpbkluY29ycmVjdCAmJiAhdGhpcy5wcm9wcy5waG9uZU51bWJlcjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHBob25lQ291bnRyeSA9IDxDb3VudHJ5RHJvcGRvd25cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMucHJvcHMucGhvbmVDb3VudHJ5fVxuICAgICAgICAgICAgICAgICAgICBpc1NtYWxsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBzaG93UHJlZml4PXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBvbk9wdGlvbkNoYW5nZT17dGhpcy5vblBob25lQ291bnRyeUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgLz47XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhjbGFzc2VzKX1cbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cInBob25lTnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAga2V5PVwicGhvbmVfaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlBob25lXCIpfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy5waG9uZU51bWJlcn1cbiAgICAgICAgICAgICAgICAgICAgcHJlZml4Q29tcG9uZW50PXtwaG9uZUNvdW50cnl9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUGhvbmVOdW1iZXJDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICBvbkZvY3VzPXt0aGlzLm9uUGhvbmVOdW1iZXJGb2N1c31cbiAgICAgICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uUGhvbmVOdW1iZXJCbHVyfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e2F1dG9Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblBob25lTnVtYmVyVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tMb2dpbkZpZWxkLlBhc3N3b3JkXSA9IGZpZWxkfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0xvZ2luRW1wdHkoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5sb2dpblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5FbWFpbDpcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5NYXRyaXhJZDpcbiAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMucHJvcHMudXNlcm5hbWU7XG4gICAgICAgICAgICBjYXNlIExvZ2luRmllbGQuUGhvbmU6XG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aGlzLnByb3BzLnBob25lQ291bnRyeSB8fCAhdGhpcy5wcm9wcy5waG9uZU51bWJlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGZvcmdvdFBhc3N3b3JkSnN4O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRm9yZ290UGFzc3dvcmRDbGljaykge1xuICAgICAgICAgICAgZm9yZ290UGFzc3dvcmRKc3ggPSA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xvZ2luX2ZvcmdvdFwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuYnVzeX1cbiAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkZvcmdvdFBhc3N3b3JkQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge190KFwiRm9yZ290IHBhc3N3b3JkP1wiKX1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwd0ZpZWxkQ2xhc3MgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIGVycm9yOiB0aGlzLnByb3BzLmxvZ2luSW5jb3JyZWN0ICYmICF0aGlzLmlzTG9naW5FbXB0eSgpLCAvLyBvbmx5IGVycm9yIHBhc3N3b3JkIGlmIGVycm9yIGlzbid0IHRvcCBmaWVsZFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJZiBsb2dpbiBpcyBlbXB0eSwgYXV0b0ZvY3VzIGxvZ2luLCBvdGhlcndpc2UgYXV0b0ZvY3VzIHBhc3N3b3JkLlxuICAgICAgICAvLyB0aGlzIGlzIGZvciB3aGVuIGF1dG8gc2VydmVyIGRpc2NvdmVyeSByZW1vdW50cyB1cyB3aGVuIHRoZSB1c2VyIHRyaWVzIHRvIHRhYiBmcm9tIHVzZXJuYW1lIHRvIHBhc3N3b3JkXG4gICAgICAgIGNvbnN0IGF1dG9Gb2N1c1Bhc3N3b3JkID0gIXRoaXMuaXNMb2dpbkVtcHR5KCk7XG4gICAgICAgIGNvbnN0IGxvZ2luRmllbGQgPSB0aGlzLnJlbmRlckxvZ2luRmllbGQodGhpcy5zdGF0ZS5sb2dpblR5cGUsICFhdXRvRm9jdXNQYXNzd29yZCk7XG5cbiAgICAgICAgbGV0IGxvZ2luVHlwZTtcbiAgICAgICAgaWYgKCFTZGtDb25maWcuZ2V0KCkuZGlzYWJsZV8zcGlkX2xvZ2luKSB7XG4gICAgICAgICAgICBsb2dpblR5cGUgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl90eXBlX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwibXhfTG9naW5fdHlwZV9sYWJlbFwiPnsgX3QoJ1NpZ24gaW4gd2l0aCcpIH08L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJzZWxlY3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubG9naW5UeXBlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Mb2dpblR5cGVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17TG9naW5GaWVsZC5NYXRyaXhJZH0gdmFsdWU9e0xvZ2luRmllbGQuTWF0cml4SWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdCgnVXNlcm5hbWUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17TG9naW5GaWVsZC5FbWFpbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17TG9naW5GaWVsZC5FbWFpbH1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoJ0VtYWlsIGFkZHJlc3MnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e0xvZ2luRmllbGQuUGFzc3dvcmR9IHZhbHVlPXtMb2dpbkZpZWxkLlBhc3N3b3JkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoJ1Bob25lJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9GaWVsZD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdEZvcm19PlxuICAgICAgICAgICAgICAgICAgICB7bG9naW5UeXBlfVxuICAgICAgICAgICAgICAgICAgICB7bG9naW5GaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3B3RmllbGRDbGFzc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KCdQYXNzd29yZCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBhc3N3b3JkQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVTdWJtaXR9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e2F1dG9Gb2N1c1Bhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblBhc3N3b3JkVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9e2ZpZWxkID0+IHRoaXNbTG9naW5GaWVsZC5QYXNzd29yZF0gPSBmaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAge2ZvcmdvdFBhc3N3b3JkSnN4fVxuICAgICAgICAgICAgICAgICAgICB7ICF0aGlzLnByb3BzLmJ1c3kgJiYgPGlucHV0IGNsYXNzTmFtZT1cIm14X0xvZ2luX3N1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtfdCgnU2lnbiBpbicpfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZVN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgLz4gfVxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
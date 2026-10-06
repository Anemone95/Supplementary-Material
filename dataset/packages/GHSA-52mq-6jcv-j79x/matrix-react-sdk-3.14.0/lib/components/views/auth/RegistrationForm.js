"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var Email = _interopRequireWildcard(require("../../../email"));

var _phonenumber = require("../../../phonenumber");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Registration = require("../../../Registration");

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _PassphraseField = _interopRequireDefault(require("./PassphraseField"));

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _RegistrationEmailPromptDialog = _interopRequireDefault(require("../dialogs/RegistrationEmailPromptDialog"));

/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2015, 2016, 2017, 2018, 2019, 2020 The Matrix.org Foundation C.I.C.

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
var RegistrationField;

(function (RegistrationField) {
  RegistrationField["Email"] = "field_email";
  RegistrationField["PhoneNumber"] = "field_phone_number";
  RegistrationField["Username"] = "field_username";
  RegistrationField["Password"] = "field_password";
  RegistrationField["PasswordConfirm"] = "field_password_confirm";
})(RegistrationField || (RegistrationField = {}));

const PASSWORD_MIN_SCORE = 3; // safely unguessable: moderate protection from offline slow-hash scenario.

/*
 * A pure UI component which displays a registration form.
 */
class RegistrationForm extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onSubmit", async ev => {
      ev.preventDefault();
      ev.persist();
      if (!this.props.canSubmit) return;
      const allFieldsValid = await this.verifyFieldsBeforeSubmit();

      if (!allFieldsValid) {
        _CountlyAnalytics.default.instance.track("onboarding_registration_submit_failed");

        return;
      }

      if (this.state.email === '') {
        if (this.showEmail()) {
          _CountlyAnalytics.default.instance.track("onboarding_registration_submit_warn");

          _Modal.default.createTrackedDialog("Email prompt dialog", '', _RegistrationEmailPromptDialog.default, {
            onFinished: async (confirmed
            /*: boolean*/
            , email
            /*: string*/
            ) => {
              if (confirmed) {
                this.setState({
                  email
                }, () => {
                  this.doSubmit(ev);
                });
              }
            }
          });
        } else {
          // user can't set an e-mail so don't prompt them to
          this.doSubmit(ev);
          return;
        }
      } else {
        this.doSubmit(ev);
      }
    });
    (0, _defineProperty2.default)(this, "onEmailChange", ev => {
      this.setState({
        email: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onEmailValidate", async fieldState => {
      const result = await this.validateEmailRules(fieldState);
      this.markFieldValid(RegistrationField.Email, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validateEmailRules", (0, _Validation.default)({
      description: () => (0, _languageHandler._t)("Use an email address to recover your account"),
      hideDescriptionIfValid: true,
      rules: [{
        key: "required",

        test({
          value,
          allowEmpty
        }) {
          return allowEmpty || !this.authStepIsRequired('m.login.email.identity') || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter email address (required on this homeserver)")
      }, {
        key: "email",
        test: ({
          value
        }) => !value || Email.looksValid(value),
        invalid: () => (0, _languageHandler._t)("Doesn't look like a valid email address")
      }]
    }));
    (0, _defineProperty2.default)(this, "onPasswordChange", ev => {
      this.setState({
        password: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onPasswordValidate", result => {
      this.markFieldValid(RegistrationField.Password, result.valid);
    });
    (0, _defineProperty2.default)(this, "onPasswordConfirmChange", ev => {
      this.setState({
        passwordConfirm: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onPasswordConfirmValidate", async fieldState => {
      const result = await this.validatePasswordConfirmRules(fieldState);
      this.markFieldValid(RegistrationField.PasswordConfirm, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validatePasswordConfirmRules", (0, _Validation.default)({
      rules: [{
        key: "required",
        test: ({
          value,
          allowEmpty
        }) => allowEmpty || !!value,
        invalid: () => (0, _languageHandler._t)("Confirm password")
      }, {
        key: "match",

        test({
          value
        }) {
          return !value || value === this.state.password;
        },

        invalid: () => (0, _languageHandler._t)("Passwords don't match")
      }]
    }));
    (0, _defineProperty2.default)(this, "onPhoneCountryChange", newVal => {
      this.setState({
        phoneCountry: newVal.iso2
      });
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberChange", ev => {
      this.setState({
        phoneNumber: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberValidate", async fieldState => {
      const result = await this.validatePhoneNumberRules(fieldState);
      this.markFieldValid(RegistrationField.PhoneNumber, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validatePhoneNumberRules", (0, _Validation.default)({
      description: () => (0, _languageHandler._t)("Other users can invite you to rooms using your contact details"),
      hideDescriptionIfValid: true,
      rules: [{
        key: "required",

        test({
          value,
          allowEmpty
        }) {
          return allowEmpty || !this.authStepIsRequired('m.login.msisdn') || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter phone number (required on this homeserver)")
      }, {
        key: "email",
        test: ({
          value
        }) => !value || (0, _phonenumber.looksValid)(value),
        invalid: () => (0, _languageHandler._t)("That phone number doesn't look quite right, please check and try again")
      }]
    }));
    (0, _defineProperty2.default)(this, "onUsernameChange", ev => {
      this.setState({
        username: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onUsernameValidate", async fieldState => {
      const result = await this.validateUsernameRules(fieldState);
      this.markFieldValid(RegistrationField.Username, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validateUsernameRules", (0, _Validation.default)({
      description: () => (0, _languageHandler._t)("Use lowercase letters, numbers, dashes and underscores only"),
      hideDescriptionIfValid: true,
      rules: [{
        key: "required",
        test: ({
          value,
          allowEmpty
        }) => allowEmpty || !!value,
        invalid: () => (0, _languageHandler._t)("Enter username")
      }, {
        key: "safeLocalpart",
        test: ({
          value
        }) => !value || _Registration.SAFE_LOCALPART_REGEX.test(value),
        invalid: () => (0, _languageHandler._t)("Some characters not allowed")
      }]
    }));
    this.state = {
      fieldValid: {},
      phoneCountry: this.props.defaultPhoneCountry,
      username: this.props.defaultUsername || "",
      email: this.props.defaultEmail || "",
      phoneNumber: this.props.defaultPhoneNumber || "",
      password: this.props.defaultPassword || "",
      passwordConfirm: this.props.defaultPassword || "",
      passwordComplexity: null
    };

    _CountlyAnalytics.default.instance.track("onboarding_registration_begin");
  }

  doSubmit(ev) {
    const email = this.state.email.trim();

    _CountlyAnalytics.default.instance.track("onboarding_registration_submit_ok", {
      email: !!email
    });

    const promise = this.props.onRegisterClick({
      username: this.state.username.trim(),
      password: this.state.password.trim(),
      email: email,
      phoneCountry: this.state.phoneCountry,
      phoneNumber: this.state.phoneNumber
    });

    if (promise) {
      ev.target.disabled = true;
      promise.finally(function () {
        ev.target.disabled = false;
      });
    }
  }

  async verifyFieldsBeforeSubmit() {
    // Blur the active element if any, so we first run its blur validation,
    // which is less strict than the pass we're about to do below for all fields.
    const activeElement = document.activeElement;

    if (activeElement) {
      activeElement.blur();
    }

    const fieldIDsInDisplayOrder = [RegistrationField.Username, RegistrationField.Password, RegistrationField.PasswordConfirm, RegistrationField.Email, RegistrationField.PhoneNumber]; // Run all fields with stricter validation that no longer allows empty
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
  /**
   * @returns {boolean} true if all fields were valid last time they were validated.
   */


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
  /*: RegistrationField[]*/
  ) {
    for (const fieldID of fieldIDs) {
      if (!this.state.fieldValid[fieldID] && this[fieldID]) {
        return this[fieldID];
      }
    }

    return null;
  }

  markFieldValid(fieldID
  /*: RegistrationField*/
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

  /**
   * A step is required if all flows include that step.
   *
   * @param {string} step A stage name to check
   * @returns {boolean} Whether it is required
   */
  authStepIsRequired(step
  /*: string*/
  ) {
    return this.props.flows.every(flow => {
      return flow.stages.includes(step);
    });
  }
  /**
   * A step is used if any flows include that step.
   *
   * @param {string} step A stage name to check
   * @returns {boolean} Whether it is used
   */


  authStepIsUsed(step
  /*: string*/
  ) {
    return this.props.flows.some(flow => {
      return flow.stages.includes(step);
    });
  }

  showEmail() {
    if (!this.authStepIsUsed('m.login.email.identity')) {
      return false;
    }

    return true;
  }

  showPhoneNumber() {
    const threePidLogin = !_SdkConfig.default.get().disable_3pid_login;

    if (!threePidLogin || !this.authStepIsUsed('m.login.msisdn')) {
      return false;
    }

    return true;
  }

  renderEmail() {
    if (!this.showEmail()) {
      return null;
    }

    const emailPlaceholder = this.authStepIsRequired('m.login.email.identity') ? (0, _languageHandler._t)("Email") : (0, _languageHandler._t)("Email (optional)");
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      ref: field => this[RegistrationField.Email] = field,
      type: "text",
      label: emailPlaceholder,
      value: this.state.email,
      onChange: this.onEmailChange,
      onValidate: this.onEmailValidate,
      onFocus: () => _CountlyAnalytics.default.instance.track("onboarding_registration_email_focus"),
      onBlur: () => _CountlyAnalytics.default.instance.track("onboarding_registration_email_blur")
    });
  }

  renderPassword() {
    return /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
      id: "mx_RegistrationForm_password",
      fieldRef: field => this[RegistrationField.Password] = field,
      minScore: PASSWORD_MIN_SCORE,
      value: this.state.password,
      onChange: this.onPasswordChange,
      onValidate: this.onPasswordValidate,
      onFocus: () => _CountlyAnalytics.default.instance.track("onboarding_registration_password_focus"),
      onBlur: () => _CountlyAnalytics.default.instance.track("onboarding_registration_password_blur")
    });
  }

  renderPasswordConfirm() {
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "mx_RegistrationForm_passwordConfirm",
      ref: field => this[RegistrationField.PasswordConfirm] = field,
      type: "password",
      autoComplete: "new-password",
      label: (0, _languageHandler._t)("Confirm password"),
      value: this.state.passwordConfirm,
      onChange: this.onPasswordConfirmChange,
      onValidate: this.onPasswordConfirmValidate,
      onFocus: () => _CountlyAnalytics.default.instance.track("onboarding_registration_passwordConfirm_focus"),
      onBlur: () => _CountlyAnalytics.default.instance.track("onboarding_registration_passwordConfirm_blur")
    });
  }

  renderPhoneNumber() {
    if (!this.showPhoneNumber()) {
      return null;
    }

    const CountryDropdown = sdk.getComponent('views.auth.CountryDropdown');
    const phoneLabel = this.authStepIsRequired('m.login.msisdn') ? (0, _languageHandler._t)("Phone") : (0, _languageHandler._t)("Phone (optional)");

    const phoneCountry = /*#__PURE__*/_react.default.createElement(CountryDropdown, {
      value: this.state.phoneCountry,
      isSmall: true,
      showPrefix: true,
      onOptionChange: this.onPhoneCountryChange
    });

    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      ref: field => this[RegistrationField.PhoneNumber] = field,
      type: "text",
      label: phoneLabel,
      value: this.state.phoneNumber,
      prefixComponent: phoneCountry,
      onChange: this.onPhoneNumberChange,
      onValidate: this.onPhoneNumberValidate
    });
  }

  renderUsername() {
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "mx_RegistrationForm_username",
      ref: field => this[RegistrationField.Username] = field,
      type: "text",
      autoFocus: true,
      label: (0, _languageHandler._t)("Username"),
      placeholder: (0, _languageHandler._t)("Username").toLocaleLowerCase(),
      value: this.state.username,
      onChange: this.onUsernameChange,
      onValidate: this.onUsernameValidate,
      onFocus: () => _CountlyAnalytics.default.instance.track("onboarding_registration_username_focus"),
      onBlur: () => _CountlyAnalytics.default.instance.track("onboarding_registration_username_blur")
    });
  }

  render() {
    const registerButton = /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "submit",
      value: (0, _languageHandler._t)("Register"),
      disabled: !this.props.canSubmit
    });

    let emailHelperText = null;

    if (this.showEmail()) {
      if (this.showPhoneNumber()) {
        emailHelperText = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Add an email to be able to reset your password."), " ", (0, _languageHandler._t)("Use email or phone to optionally be discoverable by existing contacts."));
      } else {
        emailHelperText = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Add an email to be able to reset your password."), " ", (0, _languageHandler._t)("Use email to optionally be discoverable by existing contacts."));
      }
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmit
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, this.renderUsername()), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, this.renderPassword(), this.renderPasswordConfirm()), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, this.renderEmail(), this.renderPhoneNumber()), emailHelperText, registerButton));
  }

}

exports.default = RegistrationForm;
(0, _defineProperty2.default)(RegistrationForm, "defaultProps", {
  onValidationChange: console.error,
  canSubmit: true
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvUmVnaXN0cmF0aW9uRm9ybS50c3giXSwibmFtZXMiOlsiUmVnaXN0cmF0aW9uRmllbGQiLCJQQVNTV09SRF9NSU5fU0NPUkUiLCJSZWdpc3RyYXRpb25Gb3JtIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV2IiwicHJldmVudERlZmF1bHQiLCJwZXJzaXN0IiwiY2FuU3VibWl0IiwiYWxsRmllbGRzVmFsaWQiLCJ2ZXJpZnlGaWVsZHNCZWZvcmVTdWJtaXQiLCJDb3VudGx5QW5hbHl0aWNzIiwiaW5zdGFuY2UiLCJ0cmFjayIsInN0YXRlIiwiZW1haWwiLCJzaG93RW1haWwiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJSZWdpc3RyYXRpb25FbWFpbFByb21wdERpYWxvZyIsIm9uRmluaXNoZWQiLCJjb25maXJtZWQiLCJzZXRTdGF0ZSIsImRvU3VibWl0IiwidGFyZ2V0IiwidmFsdWUiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGVFbWFpbFJ1bGVzIiwibWFya0ZpZWxkVmFsaWQiLCJFbWFpbCIsInZhbGlkIiwiZGVzY3JpcHRpb24iLCJoaWRlRGVzY3JpcHRpb25JZlZhbGlkIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiYWxsb3dFbXB0eSIsImF1dGhTdGVwSXNSZXF1aXJlZCIsImludmFsaWQiLCJsb29rc1ZhbGlkIiwicGFzc3dvcmQiLCJQYXNzd29yZCIsInBhc3N3b3JkQ29uZmlybSIsInZhbGlkYXRlUGFzc3dvcmRDb25maXJtUnVsZXMiLCJQYXNzd29yZENvbmZpcm0iLCJuZXdWYWwiLCJwaG9uZUNvdW50cnkiLCJpc28yIiwicGhvbmVOdW1iZXIiLCJ2YWxpZGF0ZVBob25lTnVtYmVyUnVsZXMiLCJQaG9uZU51bWJlciIsInVzZXJuYW1lIiwidmFsaWRhdGVVc2VybmFtZVJ1bGVzIiwiVXNlcm5hbWUiLCJTQUZFX0xPQ0FMUEFSVF9SRUdFWCIsImZpZWxkVmFsaWQiLCJkZWZhdWx0UGhvbmVDb3VudHJ5IiwiZGVmYXVsdFVzZXJuYW1lIiwiZGVmYXVsdEVtYWlsIiwiZGVmYXVsdFBob25lTnVtYmVyIiwiZGVmYXVsdFBhc3N3b3JkIiwicGFzc3dvcmRDb21wbGV4aXR5IiwidHJpbSIsInByb21pc2UiLCJvblJlZ2lzdGVyQ2xpY2siLCJkaXNhYmxlZCIsImZpbmFsbHkiLCJhY3RpdmVFbGVtZW50IiwiZG9jdW1lbnQiLCJibHVyIiwiZmllbGRJRHNJbkRpc3BsYXlPcmRlciIsImZpZWxkSUQiLCJmaWVsZCIsInZhbGlkYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbnZhbGlkRmllbGQiLCJmaW5kRmlyc3RJbnZhbGlkRmllbGQiLCJmb2N1cyIsImZvY3VzZWQiLCJrZXlzIiwiT2JqZWN0IiwiaSIsImxlbmd0aCIsImZpZWxkSURzIiwic3RlcCIsImZsb3dzIiwiZXZlcnkiLCJmbG93Iiwic3RhZ2VzIiwiaW5jbHVkZXMiLCJhdXRoU3RlcElzVXNlZCIsInNvbWUiLCJzaG93UGhvbmVOdW1iZXIiLCJ0aHJlZVBpZExvZ2luIiwiU2RrQ29uZmlnIiwiZ2V0IiwiZGlzYWJsZV8zcGlkX2xvZ2luIiwicmVuZGVyRW1haWwiLCJlbWFpbFBsYWNlaG9sZGVyIiwib25FbWFpbENoYW5nZSIsIm9uRW1haWxWYWxpZGF0ZSIsInJlbmRlclBhc3N3b3JkIiwib25QYXNzd29yZENoYW5nZSIsIm9uUGFzc3dvcmRWYWxpZGF0ZSIsInJlbmRlclBhc3N3b3JkQ29uZmlybSIsIm9uUGFzc3dvcmRDb25maXJtQ2hhbmdlIiwib25QYXNzd29yZENvbmZpcm1WYWxpZGF0ZSIsInJlbmRlclBob25lTnVtYmVyIiwiQ291bnRyeURyb3Bkb3duIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwicGhvbmVMYWJlbCIsIm9uUGhvbmVDb3VudHJ5Q2hhbmdlIiwib25QaG9uZU51bWJlckNoYW5nZSIsIm9uUGhvbmVOdW1iZXJWYWxpZGF0ZSIsInJlbmRlclVzZXJuYW1lIiwidG9Mb2NhbGVMb3dlckNhc2UiLCJvblVzZXJuYW1lQ2hhbmdlIiwib25Vc2VybmFtZVZhbGlkYXRlIiwicmVuZGVyIiwicmVnaXN0ZXJCdXR0b24iLCJlbWFpbEhlbHBlclRleHQiLCJvblN1Ym1pdCIsIm9uVmFsaWRhdGlvbkNoYW5nZSIsImNvbnNvbGUiLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUEvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFrQktBLGlCOztXQUFBQSxpQjtBQUFBQSxFQUFBQSxpQjtBQUFBQSxFQUFBQSxpQjtBQUFBQSxFQUFBQSxpQjtBQUFBQSxFQUFBQSxpQjtBQUFBQSxFQUFBQSxpQjtHQUFBQSxpQixLQUFBQSxpQjs7QUFRTCxNQUFNQyxrQkFBa0IsR0FBRyxDQUEzQixDLENBQThCOztBQXNDOUI7QUFDQTtBQUNBO0FBQ2UsTUFBTUMsZ0JBQU4sU0FBK0JDLGVBQU1DO0FBQXJDO0FBQW1FO0FBTTlFQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSxvREFpQkEsTUFBTUMsRUFBTixJQUFZO0FBQzNCQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFDQUQsTUFBQUEsRUFBRSxDQUFDRSxPQUFIO0FBRUEsVUFBSSxDQUFDLEtBQUtILEtBQUwsQ0FBV0ksU0FBaEIsRUFBMkI7QUFFM0IsWUFBTUMsY0FBYyxHQUFHLE1BQU0sS0FBS0Msd0JBQUwsRUFBN0I7O0FBQ0EsVUFBSSxDQUFDRCxjQUFMLEVBQXFCO0FBQ2pCRSxrQ0FBaUJDLFFBQWpCLENBQTBCQyxLQUExQixDQUFnQyx1Q0FBaEM7O0FBQ0E7QUFDSDs7QUFFRCxVQUFJLEtBQUtDLEtBQUwsQ0FB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QjtBQUNsQixVQUFJLEtBQUs4RSxlQUFMLEVBQUosRUFBNEI7QUFDeEI2QixRQUFBQSxlQUFlLGdCQUFHLDBDQUVWLHlCQUFHLGlEQUFILENBRlUsT0FJVix5QkFBRyx3RUFBSCxDQUpVLENBQWxCO0FBT0gsT0FSRCxNQVFPO0FBQ0hBLFFBQUFBLGVBQWUsZ0JBQUcsMENBRVYseUJBQUcsaURBQUgsQ0FGVSxPQUlWLHlCQUFHLCtEQUFILENBSlUsQ0FBbEI7QUFPSDtBQUNKOztBQUVELHdCQUNJLHVEQUNJO0FBQU0sTUFBQSxRQUFRLEVBQUUsS0FBS0M7QUFBckIsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0ssS0FBS1AsY0FBTCxFQURMLENBREosZUFJSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDSyxLQUFLZCxjQUFMLEVBREwsRUFFSyxLQUFLRyxxQkFBTCxFQUZMLENBSkosZUFRSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDSyxLQUFLUCxXQUFMLEVBREwsRUFFSyxLQUFLVSxpQkFBTCxFQUZMLENBUkosRUFZTWMsZUFaTixFQWFNRCxjQWJOLENBREosQ0FESjtBQW1CSDs7QUF2ZDZFOzs7OEJBQTdEMUgsZ0Isa0JBQ0s7QUFDbEI2SCxFQUFBQSxrQkFBa0IsRUFBRUMsT0FBTyxDQUFDQyxLQURWO0FBRWxCdkgsRUFBQUEsU0FBUyxFQUFFO0FBRk8sQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDE1LCAyMDE2LCAyMDE3LCAyMDE4LCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCAqIGFzIEVtYWlsIGZyb20gJy4uLy4uLy4uL2VtYWlsJztcbmltcG9ydCB7IGxvb2tzVmFsaWQgYXMgcGhvbmVOdW1iZXJMb29rc1ZhbGlkIH0gZnJvbSAnLi4vLi4vLi4vcGhvbmVudW1iZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB7IFNBRkVfTE9DQUxQQVJUX1JFR0VYIH0gZnJvbSAnLi4vLi4vLi4vUmVnaXN0cmF0aW9uJztcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiBmcm9tICcuLi9lbGVtZW50cy9WYWxpZGF0aW9uJztcbmltcG9ydCB7VmFsaWRhdGVkU2VydmVyQ29uZmlnfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvQXV0b0Rpc2NvdmVyeVV0aWxzXCI7XG5pbXBvcnQgUGFzc3BocmFzZUZpZWxkIGZyb20gXCIuL1Bhc3NwaHJhc2VGaWVsZFwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4uLy4uLy4uL0NvdW50bHlBbmFseXRpY3NcIjtcbmltcG9ydCBGaWVsZCBmcm9tICcuLi9lbGVtZW50cy9GaWVsZCc7XG5pbXBvcnQgUmVnaXN0cmF0aW9uRW1haWxQcm9tcHREaWFsb2cgZnJvbSAnLi4vZGlhbG9ncy9SZWdpc3RyYXRpb25FbWFpbFByb21wdERpYWxvZyc7XG5cbmVudW0gUmVnaXN0cmF0aW9uRmllbGQge1xuICAgIEVtYWlsID0gXCJmaWVsZF9lbWFpbFwiLFxuICAgIFBob25lTnVtYmVyID0gXCJmaWVsZF9waG9uZV9udW1iZXJcIixcbiAgICBVc2VybmFtZSA9IFwiZmllbGRfdXNlcm5hbWVcIixcbiAgICBQYXNzd29yZCA9IFwiZmllbGRfcGFzc3dvcmRcIixcbiAgICBQYXNzd29yZENvbmZpcm0gPSBcImZpZWxkX3Bhc3N3b3JkX2NvbmZpcm1cIixcbn1cblxuY29uc3QgUEFTU1dPUkRfTUlOX1NDT1JFID0gMzsgLy8gc2FmZWx5IHVuZ3Vlc3NhYmxlOiBtb2RlcmF0ZSBwcm90ZWN0aW9uIGZyb20gb2ZmbGluZSBzbG93LWhhc2ggc2NlbmFyaW8uXG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIFZhbHVlcyBwcmUtZmlsbGVkIGluIHRoZSBpbnB1dCBib3hlcyB3aGVuIHRoZSBjb21wb25lbnQgbG9hZHNcbiAgICBkZWZhdWx0RW1haWw/OiBzdHJpbmc7XG4gICAgZGVmYXVsdFBob25lQ291bnRyeT86IHN0cmluZztcbiAgICBkZWZhdWx0UGhvbmVOdW1iZXI/OiBzdHJpbmc7XG4gICAgZGVmYXVsdFVzZXJuYW1lPzogc3RyaW5nO1xuICAgIGRlZmF1bHRQYXNzd29yZD86IHN0cmluZztcbiAgICBmbG93czoge1xuICAgICAgICBzdGFnZXM6IHN0cmluZ1tdO1xuICAgIH1bXTtcbiAgICBzZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcbiAgICBjYW5TdWJtaXQ/OiBib29sZWFuO1xuXG4gICAgb25SZWdpc3RlckNsaWNrKHBhcmFtczoge1xuICAgICAgICB1c2VybmFtZTogc3RyaW5nO1xuICAgICAgICBwYXNzd29yZDogc3RyaW5nO1xuICAgICAgICBlbWFpbD86IHN0cmluZztcbiAgICAgICAgcGhvbmVDb3VudHJ5Pzogc3RyaW5nO1xuICAgICAgICBwaG9uZU51bWJlcj86IHN0cmluZztcbiAgICB9KTogUHJvbWlzZTx2b2lkPjtcbiAgICBvbkVkaXRTZXJ2ZXJEZXRhaWxzQ2xpY2s/KCk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIC8vIEZpZWxkIGVycm9yIGNvZGVzIGJ5IGZpZWxkIElEXG4gICAgZmllbGRWYWxpZDogUGFydGlhbDxSZWNvcmQ8UmVnaXN0cmF0aW9uRmllbGQsIGJvb2xlYW4+PjtcbiAgICAvLyBUaGUgSVNPMiBjb3VudHJ5IGNvZGUgc2VsZWN0ZWQgaW4gdGhlIHBob25lIG51bWJlciBlbnRyeVxuICAgIHBob25lQ291bnRyeTogc3RyaW5nO1xuICAgIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgZW1haWw6IHN0cmluZztcbiAgICBwaG9uZU51bWJlcjogc3RyaW5nO1xuICAgIHBhc3N3b3JkOiBzdHJpbmc7XG4gICAgcGFzc3dvcmRDb25maXJtOiBzdHJpbmc7XG4gICAgcGFzc3dvcmRDb21wbGV4aXR5PzogbnVtYmVyO1xufVxuXG4vKlxuICogQSBwdXJlIFVJIGNvbXBvbmVudCB3aGljaCBkaXNwbGF5cyBhIHJlZ2lzdHJhdGlvbiBmb3JtLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWdpc3RyYXRpb25Gb3JtIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIG9uVmFsaWRhdGlvbkNoYW5nZTogY29uc29sZS5lcnJvcixcbiAgICAgICAgY2FuU3VibWl0OiB0cnVlLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGZpZWxkVmFsaWQ6IHt9LFxuICAgICAgICAgICAgcGhvbmVDb3VudHJ5OiB0aGlzLnByb3BzLmRlZmF1bHRQaG9uZUNvdW50cnksXG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5wcm9wcy5kZWZhdWx0VXNlcm5hbWUgfHwgXCJcIixcbiAgICAgICAgICAgIGVtYWlsOiB0aGlzLnByb3BzLmRlZmF1bHRFbWFpbCB8fCBcIlwiLFxuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IHRoaXMucHJvcHMuZGVmYXVsdFBob25lTnVtYmVyIHx8IFwiXCIsXG4gICAgICAgICAgICBwYXNzd29yZDogdGhpcy5wcm9wcy5kZWZhdWx0UGFzc3dvcmQgfHwgXCJcIixcbiAgICAgICAgICAgIHBhc3N3b3JkQ29uZmlybTogdGhpcy5wcm9wcy5kZWZhdWx0UGFzc3dvcmQgfHwgXCJcIixcbiAgICAgICAgICAgIHBhc3N3b3JkQ29tcGxleGl0eTogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19yZWdpc3RyYXRpb25fYmVnaW5cIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN1Ym1pdCA9IGFzeW5jIGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYucGVyc2lzdCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5jYW5TdWJtaXQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhbGxGaWVsZHNWYWxpZCA9IGF3YWl0IHRoaXMudmVyaWZ5RmllbGRzQmVmb3JlU3VibWl0KCk7XG4gICAgICAgIGlmICghYWxsRmllbGRzVmFsaWQpIHtcbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX3JlZ2lzdHJhdGlvbl9zdWJtaXRfZmFpbGVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZW1haWwgPT09ICcnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaG93RW1haWwoKSkge1xuICAgICAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX3JlZ2lzdHJhdGlvbl9zdWJtaXRfd2FyblwiKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFwiRW1haWwgcHJvbXB0IGRpYWxvZ1wiLCAnJywgUmVnaXN0cmF0aW9uRW1haWxQcm9tcHREaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZDogYXN5bmMgKGNvbmZpcm1lZDogYm9vbGVhbiwgZW1haWw/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maXJtZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvU3VibWl0KGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gdXNlciBjYW4ndCBzZXQgYW4gZS1tYWlsIHNvIGRvbid0IHByb21wdCB0aGVtIHRvXG4gICAgICAgICAgICAgICAgdGhpcy5kb1N1Ym1pdChldik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kb1N1Ym1pdChldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBkb1N1Ym1pdChldikge1xuICAgICAgICBjb25zdCBlbWFpbCA9IHRoaXMuc3RhdGUuZW1haWwudHJpbSgpO1xuXG4gICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX3JlZ2lzdHJhdGlvbl9zdWJtaXRfb2tcIiwge1xuICAgICAgICAgICAgZW1haWw6ICEhZW1haWwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLnByb3BzLm9uUmVnaXN0ZXJDbGljayh7XG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5zdGF0ZS51c2VybmFtZS50cmltKCksXG4gICAgICAgICAgICBwYXNzd29yZDogdGhpcy5zdGF0ZS5wYXNzd29yZC50cmltKCksXG4gICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICBwaG9uZUNvdW50cnk6IHRoaXMuc3RhdGUucGhvbmVDb3VudHJ5LFxuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IHRoaXMuc3RhdGUucGhvbmVOdW1iZXIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChwcm9taXNlKSB7XG4gICAgICAgICAgICBldi50YXJnZXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgcHJvbWlzZS5maW5hbGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGV2LnRhcmdldC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpIHtcbiAgICAgICAgLy8gQmx1ciB0aGUgYWN0aXZlIGVsZW1lbnQgaWYgYW55LCBzbyB3ZSBmaXJzdCBydW4gaXRzIGJsdXIgdmFsaWRhdGlvbixcbiAgICAgICAgLy8gd2hpY2ggaXMgbGVzcyBzdHJpY3QgdGhhbiB0aGUgcGFzcyB3ZSdyZSBhYm91dCB0byBkbyBiZWxvdyBmb3IgYWxsIGZpZWxkcy5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpZWxkSURzSW5EaXNwbGF5T3JkZXIgPSBbXG4gICAgICAgICAgICBSZWdpc3RyYXRpb25GaWVsZC5Vc2VybmFtZSxcbiAgICAgICAgICAgIFJlZ2lzdHJhdGlvbkZpZWxkLlBhc3N3b3JkLFxuICAgICAgICAgICAgUmVnaXN0cmF0aW9uRmllbGQuUGFzc3dvcmRDb25maXJtLFxuICAgICAgICAgICAgUmVnaXN0cmF0aW9uRmllbGQuRW1haWwsXG4gICAgICAgICAgICBSZWdpc3RyYXRpb25GaWVsZC5QaG9uZU51bWJlcixcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBSdW4gYWxsIGZpZWxkcyB3aXRoIHN0cmljdGVyIHZhbGlkYXRpb24gdGhhdCBubyBsb25nZXIgYWxsb3dzIGVtcHR5XG4gICAgICAgIC8vIHZhbHVlcyBmb3IgcmVxdWlyZWQgZmllbGRzLlxuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkSUQgb2YgZmllbGRJRHNJbkRpc3BsYXlPcmRlcikge1xuICAgICAgICAgICAgY29uc3QgZmllbGQgPSB0aGlzW2ZpZWxkSURdO1xuICAgICAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2UgbXVzdCB3YWl0IGZvciB0aGVzZSB2YWxpZGF0aW9ucyB0byBmaW5pc2ggYmVmb3JlIHF1ZXVlaW5nXG4gICAgICAgICAgICAvLyB1cCB0aGUgc2V0U3RhdGUgYmVsb3cgc28gb3VyIHNldFN0YXRlIGdvZXMgaW4gdGhlIHF1ZXVlIGFmdGVyXG4gICAgICAgICAgICAvLyBhbGwgdGhlIHNldFN0YXRlcyBmcm9tIHRoZXNlIHZhbGlkYXRlIGNhbGxzICh0aGF0J3MgaG93IHdlXG4gICAgICAgICAgICAvLyBrbm93IHRoZXkndmUgZmluaXNoZWQpLlxuICAgICAgICAgICAgYXdhaXQgZmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRpb24gYW5kIHN0YXRlIHVwZGF0ZXMgYXJlIGFzeW5jLCBzbyB3ZSBuZWVkIHRvIHdhaXQgZm9yIHRoZW0gdG8gY29tcGxldGVcbiAgICAgICAgLy8gZmlyc3QuIFF1ZXVlIGEgYHNldFN0YXRlYCBjYWxsYmFjayBhbmQgd2FpdCBmb3IgaXQgdG8gcmVzb2x2ZS5cbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB0aGlzLnNldFN0YXRlKHt9LCByZXNvbHZlKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWxsRmllbGRzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbnZhbGlkRmllbGQgPSB0aGlzLmZpbmRGaXJzdEludmFsaWRGaWVsZChmaWVsZElEc0luRGlzcGxheU9yZGVyKTtcblxuICAgICAgICBpZiAoIWludmFsaWRGaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb2N1cyB0aGUgZmlyc3QgaW52YWxpZCBmaWVsZCBhbmQgc2hvdyBmZWVkYmFjayBpbiB0aGUgc3RyaWN0ZXIgbW9kZVxuICAgICAgICAvLyB0aGF0IG5vIGxvbmdlciBhbGxvd3MgZW1wdHkgdmFsdWVzIGZvciByZXF1aXJlZCBmaWVsZHMuXG4gICAgICAgIGludmFsaWRGaWVsZC5mb2N1cygpO1xuICAgICAgICBpbnZhbGlkRmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGFsbCBmaWVsZHMgd2VyZSB2YWxpZCBsYXN0IHRpbWUgdGhleSB3ZXJlIHZhbGlkYXRlZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGFsbEZpZWxkc1ZhbGlkKCkge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5zdGF0ZS5maWVsZFZhbGlkKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmllbGRWYWxpZFtrZXlzW2ldXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRGaXJzdEludmFsaWRGaWVsZChmaWVsZElEczogUmVnaXN0cmF0aW9uRmllbGRbXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkSUQgb2YgZmllbGRJRHMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5maWVsZFZhbGlkW2ZpZWxkSURdICYmIHRoaXNbZmllbGRJRF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1tmaWVsZElEXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1hcmtGaWVsZFZhbGlkKGZpZWxkSUQ6IFJlZ2lzdHJhdGlvbkZpZWxkLCB2YWxpZDogYm9vbGVhbikge1xuICAgICAgICBjb25zdCB7IGZpZWxkVmFsaWQgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIGZpZWxkVmFsaWRbZmllbGRJRF0gPSB2YWxpZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBmaWVsZFZhbGlkLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRW1haWxDaGFuZ2UgPSBldiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZW1haWw6IGV2LnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FbWFpbFZhbGlkYXRlID0gYXN5bmMgZmllbGRTdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVFbWFpbFJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKFJlZ2lzdHJhdGlvbkZpZWxkLkVtYWlsLCByZXN1bHQudmFsaWQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlRW1haWxSdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgZGVzY3JpcHRpb246ICgpID0+IF90KFwiVXNlIGFuIGVtYWlsIGFkZHJlc3MgdG8gcmVjb3ZlciB5b3VyIGFjY291bnRcIiksXG4gICAgICAgIGhpZGVEZXNjcmlwdGlvbklmVmFsaWQ6IHRydWUsXG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdCh0aGlzOiBSZWdpc3RyYXRpb25Gb3JtLCB7IHZhbHVlLCBhbGxvd0VtcHR5IH0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93RW1wdHkgfHwgIXRoaXMuYXV0aFN0ZXBJc1JlcXVpcmVkKCdtLmxvZ2luLmVtYWlsLmlkZW50aXR5JykgfHwgISF2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRW50ZXIgZW1haWwgYWRkcmVzcyAocmVxdWlyZWQgb24gdGhpcyBob21lc2VydmVyKVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcImVtYWlsXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogKHsgdmFsdWUgfSkgPT4gIXZhbHVlIHx8IEVtYWlsLmxvb2tzVmFsaWQodmFsdWUpLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRG9lc24ndCBsb29rIGxpa2UgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIHByaXZhdGUgb25QYXNzd29yZENoYW5nZSA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzd29yZDogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3N3b3JkVmFsaWRhdGUgPSByZXN1bHQgPT4ge1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKFJlZ2lzdHJhdGlvbkZpZWxkLlBhc3N3b3JkLCByZXN1bHQudmFsaWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzc3dvcmRDb25maXJtQ2hhbmdlID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3N3b3JkQ29uZmlybTogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3N3b3JkQ29uZmlybVZhbGlkYXRlID0gYXN5bmMgZmllbGRTdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVQYXNzd29yZENvbmZpcm1SdWxlcyhmaWVsZFN0YXRlKTtcbiAgICAgICAgdGhpcy5tYXJrRmllbGRWYWxpZChSZWdpc3RyYXRpb25GaWVsZC5QYXNzd29yZENvbmZpcm0sIHJlc3VsdC52YWxpZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdmFsaWRhdGVQYXNzd29yZENvbmZpcm1SdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSA9PiBhbGxvd0VtcHR5IHx8ICEhdmFsdWUsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJDb25maXJtIHBhc3N3b3JkXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwibWF0Y2hcIixcbiAgICAgICAgICAgICAgICB0ZXN0KHRoaXM6IFJlZ2lzdHJhdGlvbkZvcm0sIHsgdmFsdWUgfSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXZhbHVlIHx8IHZhbHVlID09PSB0aGlzLnN0YXRlLnBhc3N3b3JkO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJQYXNzd29yZHMgZG9uJ3QgbWF0Y2hcIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgcHJpdmF0ZSBvblBob25lQ291bnRyeUNoYW5nZSA9IG5ld1ZhbCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhvbmVDb3VudHJ5OiBuZXdWYWwuaXNvMixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QaG9uZU51bWJlckNoYW5nZSA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaG9uZU51bWJlcjogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBob25lTnVtYmVyVmFsaWRhdGUgPSBhc3luYyBmaWVsZFN0YXRlID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZVBob25lTnVtYmVyUnVsZXMoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoUmVnaXN0cmF0aW9uRmllbGQuUGhvbmVOdW1iZXIsIHJlc3VsdC52YWxpZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdmFsaWRhdGVQaG9uZU51bWJlclJ1bGVzID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBkZXNjcmlwdGlvbjogKCkgPT4gX3QoXCJPdGhlciB1c2VycyBjYW4gaW52aXRlIHlvdSB0byByb29tcyB1c2luZyB5b3VyIGNvbnRhY3QgZGV0YWlsc1wiKSxcbiAgICAgICAgaGlkZURlc2NyaXB0aW9uSWZWYWxpZDogdHJ1ZSxcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0KHRoaXM6IFJlZ2lzdHJhdGlvbkZvcm0sIHsgdmFsdWUsIGFsbG93RW1wdHkgfSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWxsb3dFbXB0eSB8fCAhdGhpcy5hdXRoU3RlcElzUmVxdWlyZWQoJ20ubG9naW4ubXNpc2RuJykgfHwgISF2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRW50ZXIgcGhvbmUgbnVtYmVyIChyZXF1aXJlZCBvbiB0aGlzIGhvbWVzZXJ2ZXIpXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwiZW1haWxcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSB9KSA9PiAhdmFsdWUgfHwgcGhvbmVOdW1iZXJMb29rc1ZhbGlkKHZhbHVlKSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlRoYXQgcGhvbmUgbnVtYmVyIGRvZXNuJ3QgbG9vayBxdWl0ZSByaWdodCwgcGxlYXNlIGNoZWNrIGFuZCB0cnkgYWdhaW5cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgcHJpdmF0ZSBvblVzZXJuYW1lQ2hhbmdlID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHVzZXJuYW1lOiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlcm5hbWVWYWxpZGF0ZSA9IGFzeW5jIGZpZWxkU3RhdGUgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnZhbGlkYXRlVXNlcm5hbWVSdWxlcyhmaWVsZFN0YXRlKTtcbiAgICAgICAgdGhpcy5tYXJrRmllbGRWYWxpZChSZWdpc3RyYXRpb25GaWVsZC5Vc2VybmFtZSwgcmVzdWx0LnZhbGlkKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVVzZXJuYW1lUnVsZXMgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAoKSA9PiBfdChcIlVzZSBsb3dlcmNhc2UgbGV0dGVycywgbnVtYmVycywgZGFzaGVzIGFuZCB1bmRlcnNjb3JlcyBvbmx5XCIpLFxuICAgICAgICBoaWRlRGVzY3JpcHRpb25JZlZhbGlkOiB0cnVlLFxuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pID0+IGFsbG93RW1wdHkgfHwgISF2YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIkVudGVyIHVzZXJuYW1lXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwic2FmZUxvY2FscGFydFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlIH0pID0+ICF2YWx1ZSB8fCBTQUZFX0xPQ0FMUEFSVF9SRUdFWC50ZXN0KHZhbHVlKSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlNvbWUgY2hhcmFjdGVycyBub3QgYWxsb3dlZFwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBIHN0ZXAgaXMgcmVxdWlyZWQgaWYgYWxsIGZsb3dzIGluY2x1ZGUgdGhhdCBzdGVwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0ZXAgQSBzdGFnZSBuYW1lIHRvIGNoZWNrXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgaXQgaXMgcmVxdWlyZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGF1dGhTdGVwSXNSZXF1aXJlZChzdGVwOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZmxvd3MuZXZlcnkoKGZsb3cpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbG93LnN0YWdlcy5pbmNsdWRlcyhzdGVwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBzdGVwIGlzIHVzZWQgaWYgYW55IGZsb3dzIGluY2x1ZGUgdGhhdCBzdGVwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0ZXAgQSBzdGFnZSBuYW1lIHRvIGNoZWNrXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgaXQgaXMgdXNlZFxuICAgICAqL1xuICAgIHByaXZhdGUgYXV0aFN0ZXBJc1VzZWQoc3RlcDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmZsb3dzLnNvbWUoKGZsb3cpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbG93LnN0YWdlcy5pbmNsdWRlcyhzdGVwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93RW1haWwoKSB7XG4gICAgICAgIGlmICghdGhpcy5hdXRoU3RlcElzVXNlZCgnbS5sb2dpbi5lbWFpbC5pZGVudGl0eScpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93UGhvbmVOdW1iZXIoKSB7XG4gICAgICAgIGNvbnN0IHRocmVlUGlkTG9naW4gPSAhU2RrQ29uZmlnLmdldCgpLmRpc2FibGVfM3BpZF9sb2dpbjtcbiAgICAgICAgaWYgKCF0aHJlZVBpZExvZ2luIHx8ICF0aGlzLmF1dGhTdGVwSXNVc2VkKCdtLmxvZ2luLm1zaXNkbicpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJFbWFpbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3dFbWFpbCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbWFpbFBsYWNlaG9sZGVyID0gdGhpcy5hdXRoU3RlcElzUmVxdWlyZWQoJ20ubG9naW4uZW1haWwuaWRlbnRpdHknKSA/XG4gICAgICAgICAgICBfdChcIkVtYWlsXCIpIDpcbiAgICAgICAgICAgIF90KFwiRW1haWwgKG9wdGlvbmFsKVwiKTtcbiAgICAgICAgcmV0dXJuIDxGaWVsZFxuICAgICAgICAgICAgcmVmPXtmaWVsZCA9PiB0aGlzW1JlZ2lzdHJhdGlvbkZpZWxkLkVtYWlsXSA9IGZpZWxkfVxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgbGFiZWw9e2VtYWlsUGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5lbWFpbH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRW1haWxDaGFuZ2V9XG4gICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uRW1haWxWYWxpZGF0ZX1cbiAgICAgICAgICAgIG9uRm9jdXM9eygpID0+IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX3JlZ2lzdHJhdGlvbl9lbWFpbF9mb2N1c1wiKX1cbiAgICAgICAgICAgIG9uQmx1cj17KCkgPT4gQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfcmVnaXN0cmF0aW9uX2VtYWlsX2JsdXJcIil9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUGFzc3dvcmQoKSB7XG4gICAgICAgIHJldHVybiA8UGFzc3BocmFzZUZpZWxkXG4gICAgICAgICAgICBpZD1cIm14X1JlZ2lzdHJhdGlvbkZvcm1fcGFzc3dvcmRcIlxuICAgICAgICAgICAgZmllbGRSZWY9e2ZpZWxkID0+IHRoaXNbUmVnaXN0cmF0aW9uRmllbGQuUGFzc3dvcmRdID0gZmllbGR9XG4gICAgICAgICAgICBtaW5TY29yZT17UEFTU1dPUkRfTUlOX1NDT1JFfVxuICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc3dvcmR9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBhc3N3b3JkQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblBhc3N3b3JkVmFsaWRhdGV9XG4gICAgICAgICAgICBvbkZvY3VzPXsoKSA9PiBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19yZWdpc3RyYXRpb25fcGFzc3dvcmRfZm9jdXNcIil9XG4gICAgICAgICAgICBvbkJsdXI9eygpID0+IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX3JlZ2lzdHJhdGlvbl9wYXNzd29yZF9ibHVyXCIpfVxuICAgICAgICAvPjtcbiAgICB9XG5cbiAgICByZW5kZXJQYXNzd29yZENvbmZpcm0oKSB7XG4gICAgICAgIHJldHVybiA8RmllbGRcbiAgICAgICAgICAgIGlkPVwibXhfUmVnaXN0cmF0aW9uRm9ybV9wYXNzd29yZENvbmZpcm1cIlxuICAgICAgICAgICAgcmVmPXtmaWVsZCA9PiB0aGlzW1JlZ2lzdHJhdGlvbkZpZWxkLlBhc3N3b3JkQ29uZmlybV0gPSBmaWVsZH1cbiAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAgICAgbGFiZWw9e190KFwiQ29uZmlybSBwYXNzd29yZFwiKX1cbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBhc3N3b3JkQ29uZmlybX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUGFzc3dvcmRDb25maXJtQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblBhc3N3b3JkQ29uZmlybVZhbGlkYXRlfVxuICAgICAgICAgICAgb25Gb2N1cz17KCkgPT4gQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfcmVnaXN0cmF0aW9uX3Bhc3N3b3JkQ29uZmlybV9mb2N1c1wiKX1cbiAgICAgICAgICAgIG9uQmx1cj17KCkgPT4gQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfcmVnaXN0cmF0aW9uX3Bhc3N3b3JkQ29uZmlybV9ibHVyXCIpfVxuICAgICAgICAvPjtcbiAgICB9XG5cbiAgICByZW5kZXJQaG9uZU51bWJlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3dQaG9uZU51bWJlcigpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBDb3VudHJ5RHJvcGRvd24gPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5hdXRoLkNvdW50cnlEcm9wZG93bicpO1xuICAgICAgICBjb25zdCBwaG9uZUxhYmVsID0gdGhpcy5hdXRoU3RlcElzUmVxdWlyZWQoJ20ubG9naW4ubXNpc2RuJykgP1xuICAgICAgICAgICAgX3QoXCJQaG9uZVwiKSA6XG4gICAgICAgICAgICBfdChcIlBob25lIChvcHRpb25hbClcIik7XG4gICAgICAgIGNvbnN0IHBob25lQ291bnRyeSA9IDxDb3VudHJ5RHJvcGRvd25cbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBob25lQ291bnRyeX1cbiAgICAgICAgICAgIGlzU21hbGw9e3RydWV9XG4gICAgICAgICAgICBzaG93UHJlZml4PXt0cnVlfVxuICAgICAgICAgICAgb25PcHRpb25DaGFuZ2U9e3RoaXMub25QaG9uZUNvdW50cnlDaGFuZ2V9XG4gICAgICAgIC8+O1xuICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICByZWY9e2ZpZWxkID0+IHRoaXNbUmVnaXN0cmF0aW9uRmllbGQuUGhvbmVOdW1iZXJdID0gZmllbGR9XG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICBsYWJlbD17cGhvbmVMYWJlbH1cbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBob25lTnVtYmVyfVxuICAgICAgICAgICAgcHJlZml4Q29tcG9uZW50PXtwaG9uZUNvdW50cnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBob25lTnVtYmVyQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblBob25lTnVtYmVyVmFsaWRhdGV9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIHJlbmRlclVzZXJuYW1lKCkge1xuICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICBpZD1cIm14X1JlZ2lzdHJhdGlvbkZvcm1fdXNlcm5hbWVcIlxuICAgICAgICAgICAgcmVmPXtmaWVsZCA9PiB0aGlzW1JlZ2lzdHJhdGlvbkZpZWxkLlVzZXJuYW1lXSA9IGZpZWxkfVxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgbGFiZWw9e190KFwiVXNlcm5hbWVcIil9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJVc2VybmFtZVwiKS50b0xvY2FsZUxvd2VyQ2FzZSgpfVxuICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudXNlcm5hbWV9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVzZXJuYW1lQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblVzZXJuYW1lVmFsaWRhdGV9XG4gICAgICAgICAgICBvbkZvY3VzPXsoKSA9PiBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19yZWdpc3RyYXRpb25fdXNlcm5hbWVfZm9jdXNcIil9XG4gICAgICAgICAgICBvbkJsdXI9eygpID0+IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX3JlZ2lzdHJhdGlvbl91c2VybmFtZV9ibHVyXCIpfVxuICAgICAgICAvPjtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHJlZ2lzdGVyQnV0dG9uID0gKFxuICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIm14X0xvZ2luX3N1Ym1pdFwiIHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT17X3QoXCJSZWdpc3RlclwiKX0gZGlzYWJsZWQ9eyF0aGlzLnByb3BzLmNhblN1Ym1pdH0gLz5cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgZW1haWxIZWxwZXJUZXh0ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc2hvd0VtYWlsKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dQaG9uZU51bWJlcigpKSB7XG4gICAgICAgICAgICAgICAgZW1haWxIZWxwZXJUZXh0ID0gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3QoXCJBZGQgYW4gZW1haWwgdG8gYmUgYWJsZSB0byByZXNldCB5b3VyIHBhc3N3b3JkLlwiKVxuICAgICAgICAgICAgICAgICAgICB9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90KFwiVXNlIGVtYWlsIG9yIHBob25lIHRvIG9wdGlvbmFsbHkgYmUgZGlzY292ZXJhYmxlIGJ5IGV4aXN0aW5nIGNvbnRhY3RzLlwiKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbWFpbEhlbHBlclRleHQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdChcIkFkZCBhbiBlbWFpbCB0byBiZSBhYmxlIHRvIHJlc2V0IHlvdXIgcGFzc3dvcmQuXCIpXG4gICAgICAgICAgICAgICAgICAgIH0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3QoXCJVc2UgZW1haWwgdG8gb3B0aW9uYWxseSBiZSBkaXNjb3ZlcmFibGUgYnkgZXhpc3RpbmcgY29udGFjdHMuXCIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfZmllbGRSb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlclVzZXJuYW1lKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2ZpZWxkUm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJQYXNzd29yZCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyUGFzc3dvcmRDb25maXJtKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2ZpZWxkUm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJFbWFpbCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyUGhvbmVOdW1iZXIoKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgZW1haWxIZWxwZXJUZXh0IH1cbiAgICAgICAgICAgICAgICAgICAgeyByZWdpc3RlckJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
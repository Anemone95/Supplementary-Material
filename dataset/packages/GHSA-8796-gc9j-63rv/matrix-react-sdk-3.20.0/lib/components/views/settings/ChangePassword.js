"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard3(require("../../../index"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _PassphraseField = _interopRequireDefault(require("../auth/PassphraseField"));

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _RegistrationForm = require("../auth/RegistrationForm");

var _dec, _class, _class2, _temp;

const FIELD_OLD_PASSWORD = 'field_old_password';
const FIELD_NEW_PASSWORD = 'field_new_password';
const FIELD_NEW_PASSWORD_CONFIRM = 'field_new_password_confirm';
let ChangePassword = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.ChangePassword"), _dec(_class = (_temp = _class2 = class ChangePassword extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      fieldValid: {},
      phase: ChangePassword.Phases.Edit,
      oldPassword: "",
      newPassword: "",
      newPasswordConfirm: ""
    });
    (0, _defineProperty2.default)(this, "_onExportE2eKeysClicked", () => {
      _Modal.default.createTrackedDialogAsync('Export E2E Keys', 'Change Password', Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../../async-components/views/dialogs/security/ExportE2eKeysDialog'))), {
        matrixClient: _MatrixClientPeg.MatrixClientPeg.get()
      });
    });
    (0, _defineProperty2.default)(this, "onChangeOldPassword", ev => {
      this.setState({
        oldPassword: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onOldPasswordValidate", async fieldState => {
      const result = await this.validateOldPasswordRules(fieldState);
      this.markFieldValid(FIELD_OLD_PASSWORD, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validateOldPasswordRules", (0, _Validation.default)({
      rules: [{
        key: "required",
        test: ({
          value,
          allowEmpty
        }) => allowEmpty || !!value,
        invalid: () => (0, _languageHandler._t)("Passwords can't be empty")
      }]
    }));
    (0, _defineProperty2.default)(this, "onChangeNewPassword", ev => {
      this.setState({
        newPassword: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onNewPasswordValidate", result => {
      this.markFieldValid(FIELD_NEW_PASSWORD, result.valid);
    });
    (0, _defineProperty2.default)(this, "onChangeNewPasswordConfirm", ev => {
      this.setState({
        newPasswordConfirm: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onNewPasswordConfirmValidate", async fieldState => {
      const result = await this.validatePasswordConfirmRules(fieldState);
      this.markFieldValid(FIELD_NEW_PASSWORD_CONFIRM, result.valid);
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
          return !value || value === this.state.newPassword;
        },

        invalid: () => (0, _languageHandler._t)("Passwords don't match")
      }]
    }));
    (0, _defineProperty2.default)(this, "onClickChange", async ev => {
      ev.preventDefault();
      const allFieldsValid = await this.verifyFieldsBeforeSubmit();

      if (!allFieldsValid) {
        _CountlyAnalytics.default.instance.track("onboarding_registration_submit_failed");

        return;
      }

      const oldPassword = this.state.oldPassword;
      const newPassword = this.state.newPassword;
      const confirmPassword = this.state.newPasswordConfirm;
      const err = this.props.onCheckPassword(oldPassword, newPassword, confirmPassword);

      if (err) {
        this.props.onError(err);
      } else {
        this.changePassword(oldPassword, newPassword);
      }
    });
  }

  changePassword(oldPassword, newPassword) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (!this.props.confirm) {
      this._changePassword(cli, oldPassword, newPassword);

      return;
    }

    const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

    _Modal.default.createTrackedDialog('Change Password', '', QuestionDialog, {
      title: (0, _languageHandler._t)("Warning!"),
      description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('Changing password will currently reset any end-to-end encryption keys on all sessions, ' + 'making encrypted chat history unreadable, unless you first export your room keys ' + 'and re-import them afterwards. ' + 'In future this will be improved.'), ' ', /*#__PURE__*/_react.default.createElement("a", {
        href: "https://github.com/vector-im/element-web/issues/2671",
        target: "_blank",
        rel: "noreferrer noopener"
      }, "https://github.com/vector-im/element-web/issues/2671")),
      button: (0, _languageHandler._t)("Continue"),
      extraButtons: [/*#__PURE__*/_react.default.createElement("button", {
        key: "exportRoomKeys",
        className: "mx_Dialog_primary",
        onClick: this._onExportE2eKeysClicked
      }, (0, _languageHandler._t)('Export E2E room keys'))],
      onFinished: confirmed => {
        if (confirmed) {
          this._changePassword(cli, oldPassword, newPassword);
        }
      }
    });
  }

  _changePassword(cli, oldPassword, newPassword) {
    const authDict = {
      type: 'm.login.password',
      identifier: {
        type: 'm.id.user',
        user: cli.credentials.userId
      },
      // TODO: Remove `user` once servers support proper UIA
      // See https://github.com/matrix-org/synapse/issues/5665
      user: cli.credentials.userId,
      password: oldPassword
    };
    this.setState({
      phase: ChangePassword.Phases.Uploading
    });
    cli.setPassword(authDict, newPassword).then(() => {
      if (this.props.shouldAskForEmail) {
        return this._optionallySetEmail().then(confirmed => {
          this.props.onFinished({
            didSetEmail: confirmed
          });
        });
      } else {
        this.props.onFinished();
      }
    }, err => {
      this.props.onError(err);
    }).finally(() => {
      this.setState({
        phase: ChangePassword.Phases.Edit,
        oldPassword: "",
        newPassword: "",
        newPasswordConfirm: ""
      });
    });
  }

  _optionallySetEmail() {
    // Ask for an email otherwise the user has no way to reset their password
    const SetEmailDialog = sdk.getComponent("dialogs.SetEmailDialog");

    const modal = _Modal.default.createTrackedDialog('Do you want to set an email address?', '', SetEmailDialog, {
      title: (0, _languageHandler._t)('Do you want to set an email address?')
    });

    return modal.finished.then(([confirmed]) => confirmed);
  }

  markFieldValid(fieldID, valid) {
    const {
      fieldValid
    } = this.state;
    fieldValid[fieldID] = valid;
    this.setState({
      fieldValid
    });
  }

  async verifyFieldsBeforeSubmit() {
    // Blur the active element if any, so we first run its blur validation,
    // which is less strict than the pass we're about to do below for all fields.
    const activeElement = document.activeElement;

    if (activeElement) {
      activeElement.blur();
    }

    const fieldIDsInDisplayOrder = [FIELD_OLD_PASSWORD, FIELD_NEW_PASSWORD, FIELD_NEW_PASSWORD_CONFIRM]; // Run all fields with stricter validation that no longer allows empty
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

  findFirstInvalidField(fieldIDs) {
    for (const fieldID of fieldIDs) {
      if (!this.state.fieldValid[fieldID] && this[fieldID]) {
        return this[fieldID];
      }
    }

    return null;
  }

  render() {
    const rowClassName = this.props.rowClassName;
    const buttonClassName = this.props.buttonClassName;

    switch (this.state.phase) {
      case ChangePassword.Phases.Edit:
        return /*#__PURE__*/_react.default.createElement("form", {
          className: this.props.className,
          onSubmit: this.onClickChange
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: rowClassName
        }, /*#__PURE__*/_react.default.createElement(_Field.default, {
          ref: field => this[FIELD_OLD_PASSWORD] = field,
          type: "password",
          label: (0, _languageHandler._t)('Current password'),
          value: this.state.oldPassword,
          onChange: this.onChangeOldPassword,
          onValidate: this.onOldPasswordValidate
        })), /*#__PURE__*/_react.default.createElement("div", {
          className: rowClassName
        }, /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
          fieldRef: field => this[FIELD_NEW_PASSWORD] = field,
          type: "password",
          label: "New Password",
          minScore: _RegistrationForm.PASSWORD_MIN_SCORE,
          value: this.state.newPassword,
          autoFocus: this.props.autoFocusNewPasswordInput,
          onChange: this.onChangeNewPassword,
          onValidate: this.onNewPasswordValidate,
          autoComplete: "new-password"
        })), /*#__PURE__*/_react.default.createElement("div", {
          className: rowClassName
        }, /*#__PURE__*/_react.default.createElement(_Field.default, {
          ref: field => this[FIELD_NEW_PASSWORD_CONFIRM] = field,
          type: "password",
          label: (0, _languageHandler._t)("Confirm password"),
          value: this.state.newPasswordConfirm,
          onChange: this.onChangeNewPasswordConfirm,
          onValidate: this.onNewPasswordConfirmValidate,
          autoComplete: "new-password"
        })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: buttonClassName,
          kind: this.props.buttonKind,
          onClick: this.onClickChange
        }, this.props.buttonLabel || (0, _languageHandler._t)('Change Password')));

      case ChangePassword.Phases.Uploading:
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_Dialog_content"
        }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  onFinished: _propTypes.default.func,
  onError: _propTypes.default.func,
  onCheckPassword: _propTypes.default.func,
  rowClassName: _propTypes.default.string,
  buttonClassName: _propTypes.default.string,
  buttonKind: _propTypes.default.string,
  buttonLabel: _propTypes.default.string,
  confirm: _propTypes.default.bool,
  // Whether to autoFocus the new password input
  autoFocusNewPasswordInput: _propTypes.default.bool
}), (0, _defineProperty2.default)(_class2, "Phases", {
  Edit: "edit",
  Uploading: "uploading",
  Error: "error"
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  onFinished() {},

  onError() {},

  onCheckPassword(oldPass, newPass, confirmPass) {
    if (newPass !== confirmPass) {
      return {
        error: (0, _languageHandler._t)("New passwords don't match")
      };
    } else if (!newPass || newPass.length === 0) {
      return {
        error: (0, _languageHandler._t)("Passwords can't be empty")
      };
    }
  },

  confirm: true
}), _temp)) || _class);
exports.default = ChangePassword;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0NoYW5nZVBhc3N3b3JkLmpzIl0sIm5hbWVzIjpbIkZJRUxEX09MRF9QQVNTV09SRCIsIkZJRUxEX05FV19QQVNTV09SRCIsIkZJRUxEX05FV19QQVNTV09SRF9DT05GSVJNIiwiQ2hhbmdlUGFzc3dvcmQiLCJSZWFjdCIsIkNvbXBvbmVudCIsImZpZWxkVmFsaWQiLCJwaGFzZSIsIlBoYXNlcyIsIkVkaXQiLCJvbGRQYXNzd29yZCIsIm5ld1Bhc3N3b3JkIiwibmV3UGFzc3dvcmRDb25maXJtIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMiLCJtYXRyaXhDbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJldiIsInNldFN0YXRlIiwidGFyZ2V0IiwidmFsdWUiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGVPbGRQYXNzd29yZFJ1bGVzIiwibWFya0ZpZWxkVmFsaWQiLCJ2YWxpZCIsInJ1bGVzIiwia2V5IiwidGVzdCIsImFsbG93RW1wdHkiLCJpbnZhbGlkIiwidmFsaWRhdGVQYXNzd29yZENvbmZpcm1SdWxlcyIsInN0YXRlIiwicHJldmVudERlZmF1bHQiLCJhbGxGaWVsZHNWYWxpZCIsInZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCIsIkNvdW50bHlBbmFseXRpY3MiLCJpbnN0YW5jZSIsInRyYWNrIiwiY29uZmlybVBhc3N3b3JkIiwiZXJyIiwicHJvcHMiLCJvbkNoZWNrUGFzc3dvcmQiLCJvbkVycm9yIiwiY2hhbmdlUGFzc3dvcmQiLCJjbGkiLCJjb25maXJtIiwiX2NoYW5nZVBhc3N3b3JkIiwiUXVlc3Rpb25EaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImJ1dHRvbiIsImV4dHJhQnV0dG9ucyIsIl9vbkV4cG9ydEUyZUtleXNDbGlja2VkIiwib25GaW5pc2hlZCIsImNvbmZpcm1lZCIsImF1dGhEaWN0IiwidHlwZSIsImlkZW50aWZpZXIiLCJ1c2VyIiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJwYXNzd29yZCIsIlVwbG9hZGluZyIsInNldFBhc3N3b3JkIiwidGhlbiIsInNob3VsZEFza0ZvckVtYWlsIiwiX29wdGlvbmFsbHlTZXRFbWFpbCIsImRpZFNldEVtYWlsIiwiZmluYWxseSIsIlNldEVtYWlsRGlhbG9nIiwibW9kYWwiLCJmaW5pc2hlZCIsImZpZWxkSUQiLCJhY3RpdmVFbGVtZW50IiwiZG9jdW1lbnQiLCJibHVyIiwiZmllbGRJRHNJbkRpc3BsYXlPcmRlciIsImZpZWxkIiwidmFsaWRhdGUiLCJQcm9taXNlIiwicmVzb2x2ZSIsImludmFsaWRGaWVsZCIsImZpbmRGaXJzdEludmFsaWRGaWVsZCIsImZvY3VzIiwiZm9jdXNlZCIsImtleXMiLCJPYmplY3QiLCJpIiwibGVuZ3RoIiwiZmllbGRJRHMiLCJyZW5kZXIiLCJyb3dDbGFzc05hbWUiLCJidXR0b25DbGFzc05hbWUiLCJjbGFzc05hbWUiLCJvbkNsaWNrQ2hhbmdlIiwib25DaGFuZ2VPbGRQYXNzd29yZCIsIm9uT2xkUGFzc3dvcmRWYWxpZGF0ZSIsIlBBU1NXT1JEX01JTl9TQ09SRSIsImF1dG9Gb2N1c05ld1Bhc3N3b3JkSW5wdXQiLCJvbkNoYW5nZU5ld1Bhc3N3b3JkIiwib25OZXdQYXNzd29yZFZhbGlkYXRlIiwib25DaGFuZ2VOZXdQYXNzd29yZENvbmZpcm0iLCJvbk5ld1Bhc3N3b3JkQ29uZmlybVZhbGlkYXRlIiwiYnV0dG9uS2luZCIsImJ1dHRvbkxhYmVsIiwiUHJvcFR5cGVzIiwiZnVuYyIsInN0cmluZyIsImJvb2wiLCJFcnJvciIsIm9sZFBhc3MiLCJuZXdQYXNzIiwiY29uZmlybVBhc3MiLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztB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ZmYsRUFBQUEsZUFBZSxFQUFFYSxtQkFBVUUsTUFMWjtBQU1mSixFQUFBQSxVQUFVLEVBQUVFLG1CQUFVRSxNQU5QO0FBT2ZILEVBQUFBLFdBQVcsRUFBRUMsbUJBQVVFLE1BUFI7QUFRZmpFLEVBQUFBLE9BQU8sRUFBRStELG1CQUFVRyxJQVJKO0FBU2Y7QUFDQVYsRUFBQUEseUJBQXlCLEVBQUVPLG1CQUFVRztBQVZ0QixDLG9EQWFIO0FBQ1p4RyxFQUFBQSxJQUFJLEVBQUUsTUFETTtBQUVaMEQsRUFBQUEsU0FBUyxFQUFFLFdBRkM7QUFHWitDLEVBQUFBLEtBQUssRUFBRTtBQUhLLEMsMERBTU07QUFDbEJ4RCxFQUFBQSxVQUFVLEdBQUcsQ0FBRSxDQURHOztBQUVsQmQsRUFBQUEsT0FBTyxHQUFHLENBQUUsQ0FGTTs7QUFHbEJELEVBQUFBLGVBQWUsQ0FBQ3dFLE9BQUQsRUFBVUMsT0FBVixFQUFtQkMsV0FBbkIsRUFBZ0M7QUFDM0MsUUFBSUQsT0FBTyxLQUFLQyxXQUFoQixFQUE2QjtBQUN6QixhQUFPO0FBQ0hDLFFBQUFBLEtBQUssRUFBRSx5QkFBRywyQkFBSDtBQURKLE9BQVA7QUFHSCxLQUpELE1BSU8sSUFBSSxDQUFDRixPQUFELElBQVlBLE9BQU8sQ0FBQ3ZCLE1BQVIsS0FBbUIsQ0FBbkMsRUFBc0M7QUFDekMsYUFBTztBQUNIeUIsUUFBQUEsS0FBSyxFQUFFLHlCQUFHLDBCQUFIO0FBREosT0FBUDtBQUdIO0FBQ0osR0FiaUI7O0FBY2xCdkUsRUFBQUEsT0FBTyxFQUFFO0FBZFMsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTgtMjAxOSBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSAnLi4vZWxlbWVudHMvU3Bpbm5lcic7XG5pbXBvcnQgd2l0aFZhbGlkYXRpb24gZnJvbSAnLi4vZWxlbWVudHMvVmFsaWRhdGlvbic7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uL2luZGV4XCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgUGFzc3BocmFzZUZpZWxkIGZyb20gXCIuLi9hdXRoL1Bhc3NwaHJhc2VGaWVsZFwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4uLy4uLy4uL0NvdW50bHlBbmFseXRpY3NcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IHsgUEFTU1dPUkRfTUlOX1NDT1JFIH0gZnJvbSAnLi4vYXV0aC9SZWdpc3RyYXRpb25Gb3JtJztcblxuY29uc3QgRklFTERfT0xEX1BBU1NXT1JEID0gJ2ZpZWxkX29sZF9wYXNzd29yZCc7XG5jb25zdCBGSUVMRF9ORVdfUEFTU1dPUkQgPSAnZmllbGRfbmV3X3Bhc3N3b3JkJztcbmNvbnN0IEZJRUxEX05FV19QQVNTV09SRF9DT05GSVJNID0gJ2ZpZWxkX25ld19wYXNzd29yZF9jb25maXJtJztcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MuQ2hhbmdlUGFzc3dvcmRcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYW5nZVBhc3N3b3JkIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25FcnJvcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uQ2hlY2tQYXNzd29yZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIHJvd0NsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgYnV0dG9uQ2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBidXR0b25LaW5kOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBidXR0b25MYWJlbDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgY29uZmlybTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIC8vIFdoZXRoZXIgdG8gYXV0b0ZvY3VzIHRoZSBuZXcgcGFzc3dvcmQgaW5wdXRcbiAgICAgICAgYXV0b0ZvY3VzTmV3UGFzc3dvcmRJbnB1dDogUHJvcFR5cGVzLmJvb2wsXG4gICAgfTtcblxuICAgIHN0YXRpYyBQaGFzZXMgPSB7XG4gICAgICAgIEVkaXQ6IFwiZWRpdFwiLFxuICAgICAgICBVcGxvYWRpbmc6IFwidXBsb2FkaW5nXCIsXG4gICAgICAgIEVycm9yOiBcImVycm9yXCIsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIG9uRmluaXNoZWQoKSB7fSxcbiAgICAgICAgb25FcnJvcigpIHt9LFxuICAgICAgICBvbkNoZWNrUGFzc3dvcmQob2xkUGFzcywgbmV3UGFzcywgY29uZmlybVBhc3MpIHtcbiAgICAgICAgICAgIGlmIChuZXdQYXNzICE9PSBjb25maXJtUGFzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBfdChcIk5ldyBwYXNzd29yZHMgZG9uJ3QgbWF0Y2hcIiksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW5ld1Bhc3MgfHwgbmV3UGFzcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcjogX3QoXCJQYXNzd29yZHMgY2FuJ3QgYmUgZW1wdHlcIiksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlybTogdHJ1ZSxcbiAgICB9XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgZmllbGRWYWxpZDoge30sXG4gICAgICAgIHBoYXNlOiBDaGFuZ2VQYXNzd29yZC5QaGFzZXMuRWRpdCxcbiAgICAgICAgb2xkUGFzc3dvcmQ6IFwiXCIsXG4gICAgICAgIG5ld1Bhc3N3b3JkOiBcIlwiLFxuICAgICAgICBuZXdQYXNzd29yZENvbmZpcm06IFwiXCIsXG4gICAgfTtcblxuICAgIGNoYW5nZVBhc3N3b3JkKG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmNvbmZpcm0pIHtcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZVBhc3N3b3JkKGNsaSwgb2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0NoYW5nZSBQYXNzd29yZCcsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiV2FybmluZyFcIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NoYW5naW5nIHBhc3N3b3JkIHdpbGwgY3VycmVudGx5IHJlc2V0IGFueSBlbmQtdG8tZW5kIGVuY3J5cHRpb24ga2V5cyBvbiBhbGwgc2Vzc2lvbnMsICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ21ha2luZyBlbmNyeXB0ZWQgY2hhdCBoaXN0b3J5IHVucmVhZGFibGUsIHVubGVzcyB5b3UgZmlyc3QgZXhwb3J0IHlvdXIgcm9vbSBrZXlzICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FuZCByZS1pbXBvcnQgdGhlbSBhZnRlcndhcmRzLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbiBmdXR1cmUgdGhpcyB3aWxsIGJlIGltcHJvdmVkLicsXG4gICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICB7JyAnfVxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMjY3MVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzI2NzFcbiAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDb250aW51ZVwiKSxcbiAgICAgICAgICAgIGV4dHJhQnV0dG9uczogW1xuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAga2V5PVwiZXhwb3J0Um9vbUtleXNcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9EaWFsb2dfcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uRXhwb3J0RTJlS2V5c0NsaWNrZWR9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdFeHBvcnQgRTJFIHJvb20ga2V5cycpIH1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj4sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKGNvbmZpcm1lZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjb25maXJtZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlUGFzc3dvcmQoY2xpLCBvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9jaGFuZ2VQYXNzd29yZChjbGksIG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCkge1xuICAgICAgICBjb25zdCBhdXRoRGljdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdtLmxvZ2luLnBhc3N3b3JkJyxcbiAgICAgICAgICAgIGlkZW50aWZpZXI6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbS5pZC51c2VyJyxcbiAgICAgICAgICAgICAgICB1c2VyOiBjbGkuY3JlZGVudGlhbHMudXNlcklkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBgdXNlcmAgb25jZSBzZXJ2ZXJzIHN1cHBvcnQgcHJvcGVyIFVJQVxuICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL3N5bmFwc2UvaXNzdWVzLzU2NjVcbiAgICAgICAgICAgIHVzZXI6IGNsaS5jcmVkZW50aWFscy51c2VySWQsXG4gICAgICAgICAgICBwYXNzd29yZDogb2xkUGFzc3dvcmQsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogQ2hhbmdlUGFzc3dvcmQuUGhhc2VzLlVwbG9hZGluZyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2xpLnNldFBhc3N3b3JkKGF1dGhEaWN0LCBuZXdQYXNzd29yZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG91bGRBc2tGb3JFbWFpbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25hbGx5U2V0RW1haWwoKS50aGVuKChjb25maXJtZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZFNldEVtYWlsOiBjb25maXJtZWQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkVycm9yKGVycik7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IENoYW5nZVBhc3N3b3JkLlBoYXNlcy5FZGl0LFxuICAgICAgICAgICAgICAgIG9sZFBhc3N3b3JkOiBcIlwiLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBcIlwiLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkQ29uZmlybTogXCJcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfb3B0aW9uYWxseVNldEVtYWlsKCkge1xuICAgICAgICAvLyBBc2sgZm9yIGFuIGVtYWlsIG90aGVyd2lzZSB0aGUgdXNlciBoYXMgbm8gd2F5IHRvIHJlc2V0IHRoZWlyIHBhc3N3b3JkXG4gICAgICAgIGNvbnN0IFNldEVtYWlsRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuU2V0RW1haWxEaWFsb2dcIik7XG4gICAgICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRG8geW91IHdhbnQgdG8gc2V0IGFuIGVtYWlsIGFkZHJlc3M/JywgJycsIFNldEVtYWlsRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoJ0RvIHlvdSB3YW50IHRvIHNldCBhbiBlbWFpbCBhZGRyZXNzPycpLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1vZGFsLmZpbmlzaGVkLnRoZW4oKFtjb25maXJtZWRdKSA9PiBjb25maXJtZWQpO1xuICAgIH1cblxuICAgIF9vbkV4cG9ydEUyZUtleXNDbGlja2VkID0gKCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMoJ0V4cG9ydCBFMkUgS2V5cycsICdDaGFuZ2UgUGFzc3dvcmQnLFxuICAgICAgICAgICAgaW1wb3J0KCcuLi8uLi8uLi9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvRXhwb3J0RTJlS2V5c0RpYWxvZycpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50UGVnLmdldCgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgbWFya0ZpZWxkVmFsaWQoZmllbGRJRCwgdmFsaWQpIHtcbiAgICAgICAgY29uc3QgeyBmaWVsZFZhbGlkIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBmaWVsZFZhbGlkW2ZpZWxkSURdID0gdmFsaWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZmllbGRWYWxpZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25DaGFuZ2VPbGRQYXNzd29yZCA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG9sZFBhc3N3b3JkOiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbk9sZFBhc3N3b3JkVmFsaWRhdGUgPSBhc3luYyBmaWVsZFN0YXRlID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZU9sZFBhc3N3b3JkUnVsZXMoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoRklFTERfT0xEX1BBU1NXT1JELCByZXN1bHQudmFsaWQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICB2YWxpZGF0ZU9sZFBhc3N3b3JkUnVsZXMgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogKHsgdmFsdWUsIGFsbG93RW1wdHkgfSkgPT4gYWxsb3dFbXB0eSB8fCAhIXZhbHVlLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiUGFzc3dvcmRzIGNhbid0IGJlIGVtcHR5XCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIG9uQ2hhbmdlTmV3UGFzc3dvcmQgPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBuZXdQYXNzd29yZDogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25OZXdQYXNzd29yZFZhbGlkYXRlID0gcmVzdWx0ID0+IHtcbiAgICAgICAgdGhpcy5tYXJrRmllbGRWYWxpZChGSUVMRF9ORVdfUEFTU1dPUkQsIHJlc3VsdC52YWxpZCk7XG4gICAgfTtcblxuICAgIG9uQ2hhbmdlTmV3UGFzc3dvcmRDb25maXJtID0gKGV2KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbmV3UGFzc3dvcmRDb25maXJtOiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbk5ld1Bhc3N3b3JkQ29uZmlybVZhbGlkYXRlID0gYXN5bmMgZmllbGRTdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVQYXNzd29yZENvbmZpcm1SdWxlcyhmaWVsZFN0YXRlKTtcbiAgICAgICAgdGhpcy5tYXJrRmllbGRWYWxpZChGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTSwgcmVzdWx0LnZhbGlkKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdGVQYXNzd29yZENvbmZpcm1SdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSA9PiBhbGxvd0VtcHR5IHx8ICEhdmFsdWUsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJDb25maXJtIHBhc3N3b3JkXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwibWF0Y2hcIixcbiAgICAgICAgICAgICAgICB0ZXN0KHsgdmFsdWUgfSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXZhbHVlIHx8IHZhbHVlID09PSB0aGlzLnN0YXRlLm5ld1Bhc3N3b3JkO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJQYXNzd29yZHMgZG9uJ3QgbWF0Y2hcIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgb25DbGlja0NoYW5nZSA9IGFzeW5jIChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IGFsbEZpZWxkc1ZhbGlkID0gYXdhaXQgdGhpcy52ZXJpZnlGaWVsZHNCZWZvcmVTdWJtaXQoKTtcbiAgICAgICAgaWYgKCFhbGxGaWVsZHNWYWxpZCkge1xuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfcmVnaXN0cmF0aW9uX3N1Ym1pdF9mYWlsZWRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvbGRQYXNzd29yZCA9IHRoaXMuc3RhdGUub2xkUGFzc3dvcmQ7XG4gICAgICAgIGNvbnN0IG5ld1Bhc3N3b3JkID0gdGhpcy5zdGF0ZS5uZXdQYXNzd29yZDtcbiAgICAgICAgY29uc3QgY29uZmlybVBhc3N3b3JkID0gdGhpcy5zdGF0ZS5uZXdQYXNzd29yZENvbmZpcm07XG4gICAgICAgIGNvbnN0IGVyciA9IHRoaXMucHJvcHMub25DaGVja1Bhc3N3b3JkKFxuICAgICAgICAgICAgb2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkLCBjb25maXJtUGFzc3dvcmQsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25FcnJvcihlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VQYXNzd29yZChvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jIHZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpIHtcbiAgICAgICAgLy8gQmx1ciB0aGUgYWN0aXZlIGVsZW1lbnQgaWYgYW55LCBzbyB3ZSBmaXJzdCBydW4gaXRzIGJsdXIgdmFsaWRhdGlvbixcbiAgICAgICAgLy8gd2hpY2ggaXMgbGVzcyBzdHJpY3QgdGhhbiB0aGUgcGFzcyB3ZSdyZSBhYm91dCB0byBkbyBiZWxvdyBmb3IgYWxsIGZpZWxkcy5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpZWxkSURzSW5EaXNwbGF5T3JkZXIgPSBbXG4gICAgICAgICAgICBGSUVMRF9PTERfUEFTU1dPUkQsXG4gICAgICAgICAgICBGSUVMRF9ORVdfUEFTU1dPUkQsXG4gICAgICAgICAgICBGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTSxcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBSdW4gYWxsIGZpZWxkcyB3aXRoIHN0cmljdGVyIHZhbGlkYXRpb24gdGhhdCBubyBsb25nZXIgYWxsb3dzIGVtcHR5XG4gICAgICAgIC8vIHZhbHVlcyBmb3IgcmVxdWlyZWQgZmllbGRzLlxuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkSUQgb2YgZmllbGRJRHNJbkRpc3BsYXlPcmRlcikge1xuICAgICAgICAgICAgY29uc3QgZmllbGQgPSB0aGlzW2ZpZWxkSURdO1xuICAgICAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2UgbXVzdCB3YWl0IGZvciB0aGVzZSB2YWxpZGF0aW9ucyB0byBmaW5pc2ggYmVmb3JlIHF1ZXVlaW5nXG4gICAgICAgICAgICAvLyB1cCB0aGUgc2V0U3RhdGUgYmVsb3cgc28gb3VyIHNldFN0YXRlIGdvZXMgaW4gdGhlIHF1ZXVlIGFmdGVyXG4gICAgICAgICAgICAvLyBhbGwgdGhlIHNldFN0YXRlcyBmcm9tIHRoZXNlIHZhbGlkYXRlIGNhbGxzICh0aGF0J3MgaG93IHdlXG4gICAgICAgICAgICAvLyBrbm93IHRoZXkndmUgZmluaXNoZWQpLlxuICAgICAgICAgICAgYXdhaXQgZmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRpb24gYW5kIHN0YXRlIHVwZGF0ZXMgYXJlIGFzeW5jLCBzbyB3ZSBuZWVkIHRvIHdhaXQgZm9yIHRoZW0gdG8gY29tcGxldGVcbiAgICAgICAgLy8gZmlyc3QuIFF1ZXVlIGEgYHNldFN0YXRlYCBjYWxsYmFjayBhbmQgd2FpdCBmb3IgaXQgdG8gcmVzb2x2ZS5cbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB0aGlzLnNldFN0YXRlKHt9LCByZXNvbHZlKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWxsRmllbGRzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbnZhbGlkRmllbGQgPSB0aGlzLmZpbmRGaXJzdEludmFsaWRGaWVsZChmaWVsZElEc0luRGlzcGxheU9yZGVyKTtcblxuICAgICAgICBpZiAoIWludmFsaWRGaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb2N1cyB0aGUgZmlyc3QgaW52YWxpZCBmaWVsZCBhbmQgc2hvdyBmZWVkYmFjayBpbiB0aGUgc3RyaWN0ZXIgbW9kZVxuICAgICAgICAvLyB0aGF0IG5vIGxvbmdlciBhbGxvd3MgZW1wdHkgdmFsdWVzIGZvciByZXF1aXJlZCBmaWVsZHMuXG4gICAgICAgIGludmFsaWRGaWVsZC5mb2N1cygpO1xuICAgICAgICBpbnZhbGlkRmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGFsbEZpZWxkc1ZhbGlkKCkge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5zdGF0ZS5maWVsZFZhbGlkKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmllbGRWYWxpZFtrZXlzW2ldXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmaW5kRmlyc3RJbnZhbGlkRmllbGQoZmllbGRJRHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZElEIG9mIGZpZWxkSURzKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmllbGRWYWxpZFtmaWVsZElEXSAmJiB0aGlzW2ZpZWxkSURdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbZmllbGRJRF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCByb3dDbGFzc05hbWUgPSB0aGlzLnByb3BzLnJvd0NsYXNzTmFtZTtcbiAgICAgICAgY29uc3QgYnV0dG9uQ2xhc3NOYW1lID0gdGhpcy5wcm9wcy5idXR0b25DbGFzc05hbWU7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLnBoYXNlKSB7XG4gICAgICAgICAgICBjYXNlIENoYW5nZVBhc3N3b3JkLlBoYXNlcy5FZGl0OlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9IG9uU3VibWl0PXt0aGlzLm9uQ2xpY2tDaGFuZ2V9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvd0NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tGSUVMRF9PTERfUEFTU1dPUkRdID0gZmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnQ3VycmVudCBwYXNzd29yZCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5vbGRQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2VPbGRQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbk9sZFBhc3N3b3JkVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvd0NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFBhc3NwaHJhc2VGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFJlZj17ZmllbGQgPT4gdGhpc1tGSUVMRF9ORVdfUEFTU1dPUkRdID0gZmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPSdOZXcgUGFzc3dvcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblNjb3JlPXtQQVNTV09SRF9NSU5fU0NPUkV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld1Bhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RoaXMucHJvcHMuYXV0b0ZvY3VzTmV3UGFzc3dvcmRJbnB1dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2VOZXdQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbk5ld1Bhc3N3b3JkVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvd0NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTV0gPSBmaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiQ29uZmlybSBwYXNzd29yZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubmV3UGFzc3dvcmRDb25maXJtfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZU5ld1Bhc3N3b3JkQ29uZmlybX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbk5ld1Bhc3N3b3JkQ29uZmlybVZhbGlkYXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT17YnV0dG9uQ2xhc3NOYW1lfSBraW5kPXt0aGlzLnByb3BzLmJ1dHRvbktpbmR9IG9uQ2xpY2s9e3RoaXMub25DbGlja0NoYW5nZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmJ1dHRvbkxhYmVsIHx8IF90KCdDaGFuZ2UgUGFzc3dvcmQnKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FzZSBDaGFuZ2VQYXNzd29yZC5QaGFzZXMuVXBsb2FkaW5nOlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
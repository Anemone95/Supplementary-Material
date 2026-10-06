"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018-2019 New Vector Ltd

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
const FIELD_OLD_PASSWORD = 'field_old_password';
const FIELD_NEW_PASSWORD = 'field_new_password';
const FIELD_NEW_PASSWORD_CONFIRM = 'field_new_password_confirm';
const PASSWORD_MIN_SCORE = 3; // safely unguessable: moderate protection from offline slow-hash scenario.

class ChangePassword extends _react.default.Component {
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
          minScore: PASSWORD_MIN_SCORE,
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

}

exports.default = ChangePassword;
(0, _defineProperty2.default)(ChangePassword, "propTypes", {
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
});
(0, _defineProperty2.default)(ChangePassword, "Phases", {
  Edit: "edit",
  Uploading: "uploading",
  Error: "error"
});
(0, _defineProperty2.default)(ChangePassword, "defaultProps", {
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
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0NoYW5nZVBhc3N3b3JkLmpzIl0sIm5hbWVzIjpbIkZJRUxEX09MRF9QQVNTV09SRCIsIkZJRUxEX05FV19QQVNTV09SRCIsIkZJRUxEX05FV19QQVNTV09SRF9DT05GSVJNIiwiUEFTU1dPUkRfTUlOX1NDT1JFIiwiQ2hhbmdlUGFzc3dvcmQiLCJSZWFjdCIsIkNvbXBvbmVudCIsImZpZWxkVmFsaWQiLCJwaGFzZSIsIlBoYXNlcyIsIkVkaXQiLCJvbGRQYXNzd29yZCIsIm5ld1Bhc3N3b3JkIiwibmV3UGFzc3dvcmRDb25maXJtIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMiLCJtYXRyaXhDbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJldiIsInNldFN0YXRlIiwidGFyZ2V0IiwidmFsdWUiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGVPbGRQYXNzd29yZFJ1bGVzIiwibWFya0ZpZWxkVmFsaWQiLCJ2YWxpZCIsInJ1bGVzIiwia2V5IiwidGVzdCIsImFsbG93RW1wdHkiLCJpbnZhbGlkIiwidmFsaWRhdGVQYXNzd29yZENvbmZpcm1SdWxlcyIsInN0YXRlIiwicHJldmVudERlZmF1bHQiLCJhbGxGaWVsZHNWYWxpZCIsInZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCIsIkNvdW50bHlBbmFseXRpY3MiLCJpbnN0YW5jZSIsInRyYWNrIiwiY29uZmlybVBhc3N3b3JkIiwiZXJyIiwicHJvcHMiLCJvbkNoZWNrUGFzc3dvcmQiLCJvbkVycm9yIiwiY2hhbmdlUGFzc3dvcmQiLCJjbGkiLCJjb25maXJtIiwiX2NoYW5nZVBhc3N3b3JkIiwiUXVlc3Rpb25EaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImJ1dHRvbiIsImV4dHJhQnV0dG9ucyIsIl9vbkV4cG9ydEUyZUtleXNDbGlja2VkIiwib25GaW5pc2hlZCIsImNvbmZpcm1lZCIsImF1dGhEaWN0IiwidHlwZSIsImlkZW50aWZpZXIiLCJ1c2VyIiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJwYXNzd29yZCIsIlVwbG9hZGluZyIsInNldFBhc3N3b3JkIiwidGhlbiIsInNob3VsZEFza0ZvckVtYWlsIiwiX29wdGlvbmFsbHlTZXRFbWFpbCIsImRpZFNldEVtYWlsIiwiZmluYWxseSIsIlNldEVtYWlsRGlhbG9nIiwibW9kYWwiLCJmaW5pc2hlZCIsImZpZWxkSUQiLCJhY3RpdmVFbGVtZW50IiwiZG9jdW1lbnQiLCJibHVyIiwiZmllbGRJRHNJbkRpc3BsYXlPcmRlciIsImZpZWxkIiwidmFsaWRhdGUiLCJQcm9taXNlIiwicmVzb2x2ZSIsImludmFsaWRGaWVsZCIsImZpbmRGaXJzdEludmFsaWRGaWVsZCIsImZvY3VzIiwiZm9jdXNlZCIsImtleXMiLCJPYmplY3QiLCJpIiwibGVuZ3RoIiwiZmllbGRJRHMiLCJyZW5kZXIiLCJyb3dDbGFzc05hbWUiLCJidXR0b25DbGFzc05hbWUiLCJjbGFzc05hbWUiLCJvbkNsaWNrQ2hhbmdlIiwib25DaGFuZ2VPbGRQYXNzd29yZCIsIm9uT2xkUGFzc3dvcmRWYWxpZGF0ZSIsImF1dG9Gb2N1c05ld1Bhc3N3b3JkSW5wdXQiLCJvbkNoYW5nZU5ld1Bhc3N3b3JkIiwib25OZXdQYXNzd29yZFZhbGlkYXRlIiwib25DaGFuZ2VOZXdQYXNzd29yZENvbmZpcm0iLCJvbk5ld1Bhc3N3b3JkQ29uZmlybVZhbGlkYXRlIiwiYnV0dG9uS2luZCIsImJ1dHRvbkxhYmVsIiwiUHJvcFR5cGVzIiwiZnVuYyIsInN0cmluZyIsImJvb2wiLCJFcnJvciIsIm9sZFBhc3MiLCJuZXdQYXNzIiwiY29uZmlybVBhc3MiLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztB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LElBRko7QUFHZm5FLEVBQUFBLGVBQWUsRUFBRWtFLG1CQUFVQyxJQUhaO0FBSWZkLEVBQUFBLFlBQVksRUFBRWEsbUJBQVVFLE1BSlQ7QUFLZmQsRUFBQUEsZUFBZSxFQUFFWSxtQkFBVUUsTUFMWjtBQU1mSixFQUFBQSxVQUFVLEVBQUVFLG1CQUFVRSxNQU5QO0FBT2ZILEVBQUFBLFdBQVcsRUFBRUMsbUJBQVVFLE1BUFI7QUFRZmhFLEVBQUFBLE9BQU8sRUFBRThELG1CQUFVRyxJQVJKO0FBU2Y7QUFDQVYsRUFBQUEseUJBQXlCLEVBQUVPLG1CQUFVRztBQVZ0QixDOzhCQURGN0csYyxZQWNEO0FBQ1pNLEVBQUFBLElBQUksRUFBRSxNQURNO0FBRVowRCxFQUFBQSxTQUFTLEVBQUUsV0FGQztBQUdaOEMsRUFBQUEsS0FBSyxFQUFFO0FBSEssQzs4QkFkQzlHLGMsa0JBb0JLO0FBQ2xCdUQsRUFBQUEsVUFBVSxHQUFHLENBQUUsQ0FERzs7QUFFbEJkLEVBQUFBLE9BQU8sR0FBRyxDQUFFLENBRk07O0FBR2xCRCxFQUFBQSxlQUFlLENBQUN1RSxPQUFELEVBQVVDLE9BQVYsRUFBbUJDLFdBQW5CLEVBQWdDO0FBQzNDLFFBQUlELE9BQU8sS0FBS0MsV0FBaEIsRUFBNkI7QUFDekIsYUFBTztBQUNIQyxRQUFBQSxLQUFLLEVBQUUseUJBQUcsMkJBQUg7QUFESixPQUFQO0FBR0gsS0FKRCxNQUlPLElBQUksQ0FBQ0YsT0FBRCxJQUFZQSxPQUFPLENBQUN0QixNQUFSLEtBQW1CLENBQW5DLEVBQXNDO0FBQ3pDLGFBQU87QUFDSHdCLFFBQUFBLEtBQUssRUFBRSx5QkFBRywwQkFBSDtBQURKLE9BQVA7QUFHSDtBQUNKLEdBYmlCOztBQWNsQnRFLEVBQUFBLE9BQU8sRUFBRTtBQWRTLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE4LTIwMTkgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBTcGlubmVyIGZyb20gJy4uL2VsZW1lbnRzL1NwaW5uZXInO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uIGZyb20gJy4uL2VsZW1lbnRzL1ZhbGlkYXRpb24nO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFBhc3NwaHJhc2VGaWVsZCBmcm9tIFwiLi4vYXV0aC9QYXNzcGhyYXNlRmllbGRcIjtcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuLi8uLi8uLi9Db3VudGx5QW5hbHl0aWNzXCI7XG5cbmNvbnN0IEZJRUxEX09MRF9QQVNTV09SRCA9ICdmaWVsZF9vbGRfcGFzc3dvcmQnO1xuY29uc3QgRklFTERfTkVXX1BBU1NXT1JEID0gJ2ZpZWxkX25ld19wYXNzd29yZCc7XG5jb25zdCBGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTSA9ICdmaWVsZF9uZXdfcGFzc3dvcmRfY29uZmlybSc7XG5cbmNvbnN0IFBBU1NXT1JEX01JTl9TQ09SRSA9IDM7IC8vIHNhZmVseSB1bmd1ZXNzYWJsZTogbW9kZXJhdGUgcHJvdGVjdGlvbiBmcm9tIG9mZmxpbmUgc2xvdy1oYXNoIHNjZW5hcmlvLlxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFuZ2VQYXNzd29yZCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uRXJyb3I6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvbkNoZWNrUGFzc3dvcmQ6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICByb3dDbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGJ1dHRvbkNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgYnV0dG9uS2luZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgYnV0dG9uTGFiZWw6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGNvbmZpcm06IFByb3BUeXBlcy5ib29sLFxuICAgICAgICAvLyBXaGV0aGVyIHRvIGF1dG9Gb2N1cyB0aGUgbmV3IHBhc3N3b3JkIGlucHV0XG4gICAgICAgIGF1dG9Gb2N1c05ld1Bhc3N3b3JkSW5wdXQ6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBzdGF0aWMgUGhhc2VzID0ge1xuICAgICAgICBFZGl0OiBcImVkaXRcIixcbiAgICAgICAgVXBsb2FkaW5nOiBcInVwbG9hZGluZ1wiLFxuICAgICAgICBFcnJvcjogXCJlcnJvclwiLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBvbkZpbmlzaGVkKCkge30sXG4gICAgICAgIG9uRXJyb3IoKSB7fSxcbiAgICAgICAgb25DaGVja1Bhc3N3b3JkKG9sZFBhc3MsIG5ld1Bhc3MsIGNvbmZpcm1QYXNzKSB7XG4gICAgICAgICAgICBpZiAobmV3UGFzcyAhPT0gY29uZmlybVBhc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcjogX3QoXCJOZXcgcGFzc3dvcmRzIGRvbid0IG1hdGNoXCIpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFuZXdQYXNzIHx8IG5ld1Bhc3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IF90KFwiUGFzc3dvcmRzIGNhbid0IGJlIGVtcHR5XCIpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpcm06IHRydWUsXG4gICAgfVxuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIGZpZWxkVmFsaWQ6IHt9LFxuICAgICAgICBwaGFzZTogQ2hhbmdlUGFzc3dvcmQuUGhhc2VzLkVkaXQsXG4gICAgICAgIG9sZFBhc3N3b3JkOiBcIlwiLFxuICAgICAgICBuZXdQYXNzd29yZDogXCJcIixcbiAgICAgICAgbmV3UGFzc3dvcmRDb25maXJtOiBcIlwiLFxuICAgIH07XG5cbiAgICBjaGFuZ2VQYXNzd29yZChvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5jb25maXJtKSB7XG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VQYXNzd29yZChjbGksIG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDaGFuZ2UgUGFzc3dvcmQnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIldhcm5pbmchXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICdDaGFuZ2luZyBwYXNzd29yZCB3aWxsIGN1cnJlbnRseSByZXNldCBhbnkgZW5kLXRvLWVuZCBlbmNyeXB0aW9uIGtleXMgb24gYWxsIHNlc3Npb25zLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYWtpbmcgZW5jcnlwdGVkIGNoYXQgaGlzdG9yeSB1bnJlYWRhYmxlLCB1bmxlc3MgeW91IGZpcnN0IGV4cG9ydCB5b3VyIHJvb20ga2V5cyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhbmQgcmUtaW1wb3J0IHRoZW0gYWZ0ZXJ3YXJkcy4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnSW4gZnV0dXJlIHRoaXMgd2lsbCBiZSBpbXByb3ZlZC4nLFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgeycgJ31cbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzI2NzFcIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8yNjcxXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICBidXR0b246IF90KFwiQ29udGludWVcIiksXG4gICAgICAgICAgICBleHRyYUJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGtleT1cImV4cG9ydFJvb21LZXlzXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRGlhbG9nX3ByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkV4cG9ydEUyZUtleXNDbGlja2VkfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnRXhwb3J0IEUyRSByb29tIGtleXMnKSB9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChjb25maXJtZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlybWVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZVBhc3N3b3JkKGNsaSwgb2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY2hhbmdlUGFzc3dvcmQoY2xpLCBvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpIHtcbiAgICAgICAgY29uc3QgYXV0aERpY3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAnbS5sb2dpbi5wYXNzd29yZCcsXG4gICAgICAgICAgICBpZGVudGlmaWVyOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ20uaWQudXNlcicsXG4gICAgICAgICAgICAgICAgdXNlcjogY2xpLmNyZWRlbnRpYWxzLnVzZXJJZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgYHVzZXJgIG9uY2Ugc2VydmVycyBzdXBwb3J0IHByb3BlciBVSUFcbiAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9zeW5hcHNlL2lzc3Vlcy81NjY1XG4gICAgICAgICAgICB1c2VyOiBjbGkuY3JlZGVudGlhbHMudXNlcklkLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IG9sZFBhc3N3b3JkLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhhc2U6IENoYW5nZVBhc3N3b3JkLlBoYXNlcy5VcGxvYWRpbmcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNsaS5zZXRQYXNzd29yZChhdXRoRGljdCwgbmV3UGFzc3dvcmQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2hvdWxkQXNrRm9yRW1haWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uYWxseVNldEVtYWlsKCkudGhlbigoY29uZmlybWVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaWRTZXRFbWFpbDogY29uZmlybWVkLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25FcnJvcihlcnIpO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHBoYXNlOiBDaGFuZ2VQYXNzd29yZC5QaGFzZXMuRWRpdCxcbiAgICAgICAgICAgICAgICBvbGRQYXNzd29yZDogXCJcIixcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZDogXCJcIixcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZENvbmZpcm06IFwiXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29wdGlvbmFsbHlTZXRFbWFpbCgpIHtcbiAgICAgICAgLy8gQXNrIGZvciBhbiBlbWFpbCBvdGhlcndpc2UgdGhlIHVzZXIgaGFzIG5vIHdheSB0byByZXNldCB0aGVpciBwYXNzd29yZFxuICAgICAgICBjb25zdCBTZXRFbWFpbERpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlNldEVtYWlsRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCBtb2RhbCA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0RvIHlvdSB3YW50IHRvIHNldCBhbiBlbWFpbCBhZGRyZXNzPycsICcnLCBTZXRFbWFpbERpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KCdEbyB5b3Ugd2FudCB0byBzZXQgYW4gZW1haWwgYWRkcmVzcz8nKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtb2RhbC5maW5pc2hlZC50aGVuKChbY29uZmlybWVkXSkgPT4gY29uZmlybWVkKTtcbiAgICB9XG5cbiAgICBfb25FeHBvcnRFMmVLZXlzQ2xpY2tlZCA9ICgpID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jKCdFeHBvcnQgRTJFIEtleXMnLCAnQ2hhbmdlIFBhc3N3b3JkJyxcbiAgICAgICAgICAgIGltcG9ydCgnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0V4cG9ydEUyZUtleXNEaWFsb2cnKSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudFBlZy5nZXQoKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIG1hcmtGaWVsZFZhbGlkKGZpZWxkSUQsIHZhbGlkKSB7XG4gICAgICAgIGNvbnN0IHsgZmllbGRWYWxpZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgZmllbGRWYWxpZFtmaWVsZElEXSA9IHZhbGlkO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGZpZWxkVmFsaWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uQ2hhbmdlT2xkUGFzc3dvcmQgPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBvbGRQYXNzd29yZDogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25PbGRQYXNzd29yZFZhbGlkYXRlID0gYXN5bmMgZmllbGRTdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVPbGRQYXNzd29yZFJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKEZJRUxEX09MRF9QQVNTV09SRCwgcmVzdWx0LnZhbGlkKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdGVPbGRQYXNzd29yZFJ1bGVzID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pID0+IGFsbG93RW1wdHkgfHwgISF2YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlBhc3N3b3JkcyBjYW4ndCBiZSBlbXB0eVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgb25DaGFuZ2VOZXdQYXNzd29yZCA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbk5ld1Bhc3N3b3JkVmFsaWRhdGUgPSByZXN1bHQgPT4ge1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKEZJRUxEX05FV19QQVNTV09SRCwgcmVzdWx0LnZhbGlkKTtcbiAgICB9O1xuXG4gICAgb25DaGFuZ2VOZXdQYXNzd29yZENvbmZpcm0gPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBuZXdQYXNzd29yZENvbmZpcm06IGV2LnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uTmV3UGFzc3dvcmRDb25maXJtVmFsaWRhdGUgPSBhc3luYyBmaWVsZFN0YXRlID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZVBhc3N3b3JkQ29uZmlybVJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKEZJRUxEX05FV19QQVNTV09SRF9DT05GSVJNLCByZXN1bHQudmFsaWQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICB2YWxpZGF0ZVBhc3N3b3JkQ29uZmlybVJ1bGVzID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pID0+IGFsbG93RW1wdHkgfHwgISF2YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIkNvbmZpcm0gcGFzc3dvcmRcIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJtYXRjaFwiLFxuICAgICAgICAgICAgICAgIHRlc3QoeyB2YWx1ZSB9KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhdmFsdWUgfHwgdmFsdWUgPT09IHRoaXMuc3RhdGUubmV3UGFzc3dvcmQ7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlBhc3N3b3JkcyBkb24ndCBtYXRjaFwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgb25DbGlja0NoYW5nZSA9IGFzeW5jIChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IGFsbEZpZWxkc1ZhbGlkID0gYXdhaXQgdGhpcy52ZXJpZnlGaWVsZHNCZWZvcmVTdWJtaXQoKTtcbiAgICAgICAgaWYgKCFhbGxGaWVsZHNWYWxpZCkge1xuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfcmVnaXN0cmF0aW9uX3N1Ym1pdF9mYWlsZWRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvbGRQYXNzd29yZCA9IHRoaXMuc3RhdGUub2xkUGFzc3dvcmQ7XG4gICAgICAgIGNvbnN0IG5ld1Bhc3N3b3JkID0gdGhpcy5zdGF0ZS5uZXdQYXNzd29yZDtcbiAgICAgICAgY29uc3QgY29uZmlybVBhc3N3b3JkID0gdGhpcy5zdGF0ZS5uZXdQYXNzd29yZENvbmZpcm07XG4gICAgICAgIGNvbnN0IGVyciA9IHRoaXMucHJvcHMub25DaGVja1Bhc3N3b3JkKFxuICAgICAgICAgICAgb2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkLCBjb25maXJtUGFzc3dvcmQsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25FcnJvcihlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VQYXNzd29yZChvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jIHZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpIHtcbiAgICAgICAgLy8gQmx1ciB0aGUgYWN0aXZlIGVsZW1lbnQgaWYgYW55LCBzbyB3ZSBmaXJzdCBydW4gaXRzIGJsdXIgdmFsaWRhdGlvbixcbiAgICAgICAgLy8gd2hpY2ggaXMgbGVzcyBzdHJpY3QgdGhhbiB0aGUgcGFzcyB3ZSdyZSBhYm91dCB0byBkbyBiZWxvdyBmb3IgYWxsIGZpZWxkcy5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpZWxkSURzSW5EaXNwbGF5T3JkZXIgPSBbXG4gICAgICAgICAgICBGSUVMRF9PTERfUEFTU1dPUkQsXG4gICAgICAgICAgICBGSUVMRF9ORVdfUEFTU1dPUkQsXG4gICAgICAgICAgICBGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTSxcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBSdW4gYWxsIGZpZWxkcyB3aXRoIHN0cmljdGVyIHZhbGlkYXRpb24gdGhhdCBubyBsb25nZXIgYWxsb3dzIGVtcHR5XG4gICAgICAgIC8vIHZhbHVlcyBmb3IgcmVxdWlyZWQgZmllbGRzLlxuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkSUQgb2YgZmllbGRJRHNJbkRpc3BsYXlPcmRlcikge1xuICAgICAgICAgICAgY29uc3QgZmllbGQgPSB0aGlzW2ZpZWxkSURdO1xuICAgICAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2UgbXVzdCB3YWl0IGZvciB0aGVzZSB2YWxpZGF0aW9ucyB0byBmaW5pc2ggYmVmb3JlIHF1ZXVlaW5nXG4gICAgICAgICAgICAvLyB1cCB0aGUgc2V0U3RhdGUgYmVsb3cgc28gb3VyIHNldFN0YXRlIGdvZXMgaW4gdGhlIHF1ZXVlIGFmdGVyXG4gICAgICAgICAgICAvLyBhbGwgdGhlIHNldFN0YXRlcyBmcm9tIHRoZXNlIHZhbGlkYXRlIGNhbGxzICh0aGF0J3MgaG93IHdlXG4gICAgICAgICAgICAvLyBrbm93IHRoZXkndmUgZmluaXNoZWQpLlxuICAgICAgICAgICAgYXdhaXQgZmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRpb24gYW5kIHN0YXRlIHVwZGF0ZXMgYXJlIGFzeW5jLCBzbyB3ZSBuZWVkIHRvIHdhaXQgZm9yIHRoZW0gdG8gY29tcGxldGVcbiAgICAgICAgLy8gZmlyc3QuIFF1ZXVlIGEgYHNldFN0YXRlYCBjYWxsYmFjayBhbmQgd2FpdCBmb3IgaXQgdG8gcmVzb2x2ZS5cbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB0aGlzLnNldFN0YXRlKHt9LCByZXNvbHZlKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWxsRmllbGRzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbnZhbGlkRmllbGQgPSB0aGlzLmZpbmRGaXJzdEludmFsaWRGaWVsZChmaWVsZElEc0luRGlzcGxheU9yZGVyKTtcblxuICAgICAgICBpZiAoIWludmFsaWRGaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb2N1cyB0aGUgZmlyc3QgaW52YWxpZCBmaWVsZCBhbmQgc2hvdyBmZWVkYmFjayBpbiB0aGUgc3RyaWN0ZXIgbW9kZVxuICAgICAgICAvLyB0aGF0IG5vIGxvbmdlciBhbGxvd3MgZW1wdHkgdmFsdWVzIGZvciByZXF1aXJlZCBmaWVsZHMuXG4gICAgICAgIGludmFsaWRGaWVsZC5mb2N1cygpO1xuICAgICAgICBpbnZhbGlkRmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGFsbEZpZWxkc1ZhbGlkKCkge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5zdGF0ZS5maWVsZFZhbGlkKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmllbGRWYWxpZFtrZXlzW2ldXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmaW5kRmlyc3RJbnZhbGlkRmllbGQoZmllbGRJRHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZElEIG9mIGZpZWxkSURzKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmllbGRWYWxpZFtmaWVsZElEXSAmJiB0aGlzW2ZpZWxkSURdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbZmllbGRJRF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCByb3dDbGFzc05hbWUgPSB0aGlzLnByb3BzLnJvd0NsYXNzTmFtZTtcbiAgICAgICAgY29uc3QgYnV0dG9uQ2xhc3NOYW1lID0gdGhpcy5wcm9wcy5idXR0b25DbGFzc05hbWU7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLnBoYXNlKSB7XG4gICAgICAgICAgICBjYXNlIENoYW5nZVBhc3N3b3JkLlBoYXNlcy5FZGl0OlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9IG9uU3VibWl0PXt0aGlzLm9uQ2xpY2tDaGFuZ2V9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvd0NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tGSUVMRF9PTERfUEFTU1dPUkRdID0gZmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnQ3VycmVudCBwYXNzd29yZCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5vbGRQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2VPbGRQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbk9sZFBhc3N3b3JkVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvd0NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFBhc3NwaHJhc2VGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFJlZj17ZmllbGQgPT4gdGhpc1tGSUVMRF9ORVdfUEFTU1dPUkRdID0gZmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPSdOZXcgUGFzc3dvcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblNjb3JlPXtQQVNTV09SRF9NSU5fU0NPUkV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld1Bhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RoaXMucHJvcHMuYXV0b0ZvY3VzTmV3UGFzc3dvcmRJbnB1dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2VOZXdQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbk5ld1Bhc3N3b3JkVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvd0NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTV0gPSBmaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiQ29uZmlybSBwYXNzd29yZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubmV3UGFzc3dvcmRDb25maXJtfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZU5ld1Bhc3N3b3JkQ29uZmlybX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbk5ld1Bhc3N3b3JkQ29uZmlybVZhbGlkYXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT17YnV0dG9uQ2xhc3NOYW1lfSBraW5kPXt0aGlzLnByb3BzLmJ1dHRvbktpbmR9IG9uQ2xpY2s9e3RoaXMub25DbGlja0NoYW5nZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmJ1dHRvbkxhYmVsIHx8IF90KCdDaGFuZ2UgUGFzc3dvcmQnKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FzZSBDaGFuZ2VQYXNzd29yZC5QaGFzZXMuVXBsb2FkaW5nOlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
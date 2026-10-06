"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _classnames = _interopRequireDefault(require("classnames"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../../index"));

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var _languageHandler = require("../../../../languageHandler");

var _SecurityManager = require("../../../../SecurityManager");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

/*
Copyright 2018-2021 The Matrix.org Foundation C.I.C.

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
// Maximum acceptable size of a key file. It's 59 characters including the spaces we encode,
// so this should be plenty and allow for people putting extra whitespace in the file because
// maybe that's a thing people would do?
const KEY_FILE_MAX_SIZE = 128; // Don't shout at the user that their key is invalid every time they type a key: wait a short time

const VALIDATION_THROTTLE_MS = 200;

/*
 * Access Secure Secret Storage by requesting the user's passphrase.
 */
class AccessSecretStorageDialog extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "fileUpload", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onCancel", () => {
      if (this.state.resetting) {
        this.setState({
          resetting: false
        });
      }

      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onUseRecoveryKeyClick", () => {
      this.setState({
        forceRecoveryKey: true
      });
    });
    (0, _defineProperty2.default)(this, "validateRecoveryKeyOnChange", (0, _lodash.debounce)(async () => {
      await this.validateRecoveryKey();
    }, VALIDATION_THROTTLE_MS));
    (0, _defineProperty2.default)(this, "onRecoveryKeyChange", (ev
    /*: ChangeEvent<HTMLInputElement>*/
    ) => {
      this.setState({
        recoveryKey: ev.target.value,
        recoveryKeyFileError: null
      }); // also clear the file upload control so that the user can upload the same file
      // the did before (otherwise the onchange wouldn't fire)

      if (this.fileUpload.current) this.fileUpload.current.value = null; // We don't use Field's validation here because a) we want it in a separate place rather
      // than in a tooltip and b) we want it to display feedback based on the uploaded file
      // as well as the text box. Ideally we would refactor Field's validation logic so we could
      // re-use some of it.

      this.validateRecoveryKeyOnChange();
    });
    (0, _defineProperty2.default)(this, "onRecoveryKeyFileChange", async (ev
    /*: ChangeEvent<HTMLInputElement>*/
    ) => {
      if (ev.target.files.length === 0) return;
      const f = ev.target.files[0];

      if (f.size > KEY_FILE_MAX_SIZE) {
        this.setState({
          recoveryKeyFileError: true,
          recoveryKeyCorrect: false,
          recoveryKeyValid: false
        });
      } else {
        const contents = await f.text(); // test it's within the base58 alphabet. We could be more strict here, eg. require the
        // right number of characters, but it's really just to make sure that what we're reading is
        // text because we'll put it in the text field.

        if (/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz\s]+$/.test(contents)) {
          this.setState({
            recoveryKeyFileError: null,
            recoveryKey: contents.trim()
          });
          await this.validateRecoveryKey();
        } else {
          this.setState({
            recoveryKeyFileError: true,
            recoveryKeyCorrect: false,
            recoveryKeyValid: false,
            recoveryKey: ''
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "onRecoveryKeyFileUploadClick", () => {
      this.fileUpload.current.click();
    });
    (0, _defineProperty2.default)(this, "onPassPhraseNext", async (ev
    /*: FormEvent<HTMLFormElement>*/
    ) => {
      ev.preventDefault();
      if (this.state.passPhrase.length <= 0) return;
      this.setState({
        keyMatches: null
      });
      const input = {
        passphrase: this.state.passPhrase
      };
      const keyMatches = await this.props.checkPrivateKey(input);

      if (keyMatches) {
        this.props.onFinished(input);
      } else {
        this.setState({
          keyMatches
        });
      }
    });
    (0, _defineProperty2.default)(this, "onRecoveryKeyNext", async (ev
    /*: FormEvent<HTMLFormElement>*/
    ) => {
      ev.preventDefault();
      if (!this.state.recoveryKeyValid) return;
      this.setState({
        keyMatches: null
      });
      const input = {
        recoveryKey: this.state.recoveryKey
      };
      const keyMatches = await this.props.checkPrivateKey(input);

      if (keyMatches) {
        this.props.onFinished(input);
      } else {
        this.setState({
          keyMatches
        });
      }
    });
    (0, _defineProperty2.default)(this, "onPassPhraseChange", (ev
    /*: ChangeEvent<HTMLInputElement>*/
    ) => {
      this.setState({
        passPhrase: ev.target.value,
        keyMatches: null
      });
    });
    (0, _defineProperty2.default)(this, "onResetAllClick", (ev
    /*: React.MouseEvent<HTMLAnchorElement>*/
    ) => {
      ev.preventDefault();
      this.setState({
        resetting: true
      });
    });
    (0, _defineProperty2.default)(this, "onConfirmResetAllClick", async () => {
      // Hide ourselves so the user can interact with the reset dialogs.
      // We don't conclude the promise chain (onFinished) yet to avoid confusing
      // any upstream code flows.
      //
      // Note: this will unmount us, so don't call `setState` or anything in the
      // rest of this function.
      _Modal.default.toggleCurrentDialogVisibility();

      try {
        // Force reset secret storage (which resets the key backup)
        await (0, _SecurityManager.accessSecretStorage)(async () => {
          // Now reset cross-signing so everything Just Works™ again.
          const cli = _MatrixClientPeg.MatrixClientPeg.get();

          await cli.bootstrapCrossSigning({
            authUploadDeviceSigningKeys: async makeRequest => {
              // XXX: Making this an import breaks the app.
              const InteractiveAuthDialog = sdk.getComponent("views.dialogs.InteractiveAuthDialog");

              const {
                finished
              } = _Modal.default.createTrackedDialog('Cross-signing keys dialog', '', InteractiveAuthDialog, {
                title: (0, _languageHandler._t)("Setting up keys"),
                matrixClient: cli,
                makeRequest
              });

              const [confirmed] = await finished;

              if (!confirmed) {
                throw new Error("Cross-signing key upload auth canceled");
              }
            },
            setupNewCrossSigning: true
          }); // Now we can indicate that the user is done pressing buttons, finally.
          // Upstream flows will detect the new secret storage, key backup, etc and use it.

          this.props.onFinished(true);
        }, true);
      } catch (e) {
        console.error(e);
        this.props.onFinished(false);
      }
    });
    this.state = {
      recoveryKey: "",
      recoveryKeyValid: null,
      recoveryKeyCorrect: null,
      recoveryKeyFileError: null,
      forceRecoveryKey: false,
      passPhrase: '',
      keyMatches: null,
      resetting: false
    };
  }

  async validateRecoveryKey() {
    if (this.state.recoveryKey === '') {
      this.setState({
        recoveryKeyValid: null,
        recoveryKeyCorrect: null
      });
      return;
    }

    try {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const decodedKey = cli.keyBackupKeyFromRecoveryKey(this.state.recoveryKey);
      const correct = await cli.checkSecretStorageKey(decodedKey, this.props.keyInfo);
      this.setState({
        recoveryKeyValid: true,
        recoveryKeyCorrect: correct
      });
    } catch (e) {
      this.setState({
        recoveryKeyValid: false,
        recoveryKeyCorrect: false
      });
    }
  }

  getKeyValidationText()
  /*: string*/
  {
    if (this.state.recoveryKeyFileError) {
      return (0, _languageHandler._t)("Wrong file type");
    } else if (this.state.recoveryKeyCorrect) {
      return (0, _languageHandler._t)("Looks good!");
    } else if (this.state.recoveryKeyValid) {
      return (0, _languageHandler._t)("Wrong Security Key");
    } else if (this.state.recoveryKeyValid === null) {
      return '';
    } else {
      return (0, _languageHandler._t)("Invalid Security Key");
    }
  }

  render() {
    // Caution: Making these an import will break tests.
    const BaseDialog = sdk.getComponent("views.dialogs.BaseDialog");
    const DialogButtons = sdk.getComponent("views.elements.DialogButtons");
    const hasPassphrase = this.props.keyInfo && this.props.keyInfo.passphrase && this.props.keyInfo.passphrase.salt && this.props.keyInfo.passphrase.iterations;

    const resetButton = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AccessSecretStorageDialog_reset"
    }, (0, _languageHandler._t)("Forgotten or lost all recovery methods? <a>Reset all</a>", null, {
      a: sub => /*#__PURE__*/_react.default.createElement("a", {
        href: "",
        onClick: this.onResetAllClick,
        className: "mx_AccessSecretStorageDialog_reset_link"
      }, sub)
    }));

    let content;
    let title;
    let titleClass;

    if (this.state.resetting) {
      title = (0, _languageHandler._t)("Reset everything");
      titleClass = ['mx_AccessSecretStorageDialog_titleWithIcon mx_AccessSecretStorageDialog_resetBadge'];
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Only do this if you have no other device to complete verification with.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you reset everything, you will restart with no trusted sessions, no trusted users, and " + "might not be able to see past messages.")), /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Reset'),
        onPrimaryButtonClick: this.onConfirmResetAllClick,
        hasCancel: true,
        onCancel: this.onCancel,
        focus: false,
        primaryButtonClass: "danger"
      }));
    } else if (hasPassphrase && !this.state.forceRecoveryKey) {
      const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
      title = (0, _languageHandler._t)("Security Phrase");
      titleClass = ['mx_AccessSecretStorageDialog_titleWithIcon mx_AccessSecretStorageDialog_securePhraseTitle'];
      let keyStatus;

      if (this.state.keyMatches === false) {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_AccessSecretStorageDialog_keyStatus"
        }, "\uD83D\uDC4E ", (0, _languageHandler._t)("Unable to access secret storage. " + "Please verify that you entered the correct Security Phrase."));
      } else {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_AccessSecretStorageDialog_keyStatus"
        });
      }

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Enter your Security Phrase or <button>Use your Security Key</button> to continue.", {}, {
        button: s => /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          className: "mx_linkButton",
          element: "span",
          onClick: this.onUseRecoveryKeyClick
        }, s)
      })), /*#__PURE__*/_react.default.createElement("form", {
        className: "mx_AccessSecretStorageDialog_primaryContainer",
        onSubmit: this.onPassPhraseNext
      }, /*#__PURE__*/_react.default.createElement("input", {
        type: "password",
        className: "mx_AccessSecretStorageDialog_passPhraseInput",
        onChange: this.onPassPhraseChange,
        value: this.state.passPhrase,
        autoFocus: true,
        autoComplete: "new-password",
        placeholder: (0, _languageHandler._t)("Security Phrase")
      }), keyStatus, /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Continue'),
        onPrimaryButtonClick: this.onPassPhraseNext,
        hasCancel: true,
        onCancel: this.onCancel,
        focus: false,
        primaryDisabled: this.state.passPhrase.length === 0,
        additive: resetButton
      })));
    } else {
      title = (0, _languageHandler._t)("Security Key");
      titleClass = ['mx_AccessSecretStorageDialog_titleWithIcon mx_AccessSecretStorageDialog_secureBackupTitle'];
      const feedbackClasses = (0, _classnames.default)({
        'mx_AccessSecretStorageDialog_recoveryKeyFeedback': true,
        'mx_AccessSecretStorageDialog_recoveryKeyFeedback_valid': this.state.recoveryKeyCorrect === true,
        'mx_AccessSecretStorageDialog_recoveryKeyFeedback_invalid': this.state.recoveryKeyCorrect === false
      });

      const recoveryKeyFeedback = /*#__PURE__*/_react.default.createElement("div", {
        className: feedbackClasses
      }, this.getKeyValidationText());

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Use your Security Key to continue.")), /*#__PURE__*/_react.default.createElement("form", {
        className: "mx_AccessSecretStorageDialog_primaryContainer",
        onSubmit: this.onRecoveryKeyNext,
        spellCheck: false,
        autoComplete: "off"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry_textInput"
      }, /*#__PURE__*/_react.default.createElement(_Field.default, {
        type: "password",
        label: (0, _languageHandler._t)('Security Key'),
        value: this.state.recoveryKey,
        onChange: this.onRecoveryKeyChange,
        forceValidity: this.state.recoveryKeyCorrect,
        autoComplete: "off"
      })), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry_entryControlSeparatorText"
      }, (0, _languageHandler._t)("or")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("input", {
        type: "file",
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry_fileInput",
        ref: this.fileUpload,
        onChange: this.onRecoveryKeyFileChange
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this.onRecoveryKeyFileUploadClick
      }, (0, _languageHandler._t)("Upload")))), recoveryKeyFeedback, /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Continue'),
        onPrimaryButtonClick: this.onRecoveryKeyNext,
        hasCancel: true,
        cancelButton: (0, _languageHandler._t)("Go Back"),
        cancelButtonClass: "danger",
        onCancel: this.onCancel,
        focus: false,
        primaryDisabled: !this.state.recoveryKeyValid,
        additive: resetButton
      })));
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_AccessSecretStorageDialog",
      onFinished: this.props.onFinished,
      title: title,
      titleClass: titleClass
    }, /*#__PURE__*/_react.default.createElement("div", null, content));
  }

}

exports.default = AccessSecretStorageDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZy50c3giXSwibmFtZXMiOlsiS0VZX0ZJTEVfTUFYX1NJWkUiLCJWQUxJREFUSU9OX1RIUk9UVExFX01TIiwiQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJzdGF0ZSIsInJlc2V0dGluZyIsInNldFN0YXRlIiwib25GaW5pc2hlZCIsImZvcmNlUmVjb3ZlcnlLZXkiLCJ2YWxpZGF0ZVJlY292ZXJ5S2V5IiwiZXYiLCJyZWNvdmVyeUtleSIsInRhcmdldCIsInZhbHVlIiwicmVjb3ZlcnlLZXlGaWxlRXJyb3IiLCJmaWxlVXBsb2FkIiwiY3VycmVudCIsInZhbGlkYXRlUmVjb3ZlcnlLZXlPbkNoYW5nZSIsImZpbGVzIiwibGVuZ3RoIiwiZiIsInNpemUiLCJyZWNvdmVyeUtleUNvcnJlY3QiLCJyZWNvdmVyeUtleVZhbGlkIiwiY29udGVudHMiLCJ0ZXh0IiwidGVzdCIsInRyaW0iLCJjbGljayIsInByZXZlbnREZWZhdWx0IiwicGFzc1BocmFzZSIsImtleU1hdGNoZXMiLCJpbnB1dCIsInBhc3NwaHJhc2UiLCJjaGVja1ByaXZhdGVLZXkiLCJNb2RhbCIsInRvZ2dsZUN1cnJlbnREaWFsb2dWaXNpYmlsaXR5IiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiYm9vdHN0cmFwQ3Jvc3NTaWduaW5nIiwiYXV0aFVwbG9hZERldmljZVNpZ25pbmdLZXlzIiwibWFrZVJlcXVlc3QiLCJJbnRlcmFjdGl2ZUF1dGhEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJmaW5pc2hlZCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsIm1hdHJpeENsaWVudCIsImNvbmZpcm1lZCIsIkVycm9yIiwic2V0dXBOZXdDcm9zc1NpZ25pbmciLCJlIiwiY29uc29sZSIsImVycm9yIiwiZGVjb2RlZEtleSIsImtleUJhY2t1cEtleUZyb21SZWNvdmVyeUtleSIsImNvcnJlY3QiLCJjaGVja1NlY3JldFN0b3JhZ2VLZXkiLCJrZXlJbmZvIiwiZ2V0S2V5VmFsaWRhdGlvblRleHQiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwiRGlhbG9nQnV0dG9ucyIsImhhc1Bhc3NwaHJhc2UiLCJzYWx0IiwiaXRlcmF0aW9ucyIsInJlc2V0QnV0dG9uIiwiYSIsInN1YiIsIm9uUmVzZXRBbGxDbGljayIsImNvbnRlbnQiLCJ0aXRsZUNsYXNzIiwib25Db25maXJtUmVzZXRBbGxDbGljayIsIm9uQ2FuY2VsIiwiQWNjZXNzaWJsZUJ1dHRvbiIsImtleVN0YXR1cyIsImJ1dHRvbiIsInMiLCJvblVzZVJlY292ZXJ5S2V5Q2xpY2siLCJvblBhc3NQaHJhc2VOZXh0Iiwib25QYXNzUGhyYXNlQ2hhbmdlIiwiZmVlZGJhY2tDbGFzc2VzIiwicmVjb3ZlcnlLZXlGZWVkYmFjayIsIm9uUmVjb3ZlcnlLZXlOZXh0Iiwib25SZWNvdmVyeUtleUNoYW5nZSIsIm9uUmVjb3ZlcnlLZXlGaWxlQ2hhbmdlIiwib25SZWNvdmVyeUtleUZpbGVVcGxvYWRDbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLGlCQUFpQixHQUFHLEdBQTFCLEMsQ0FFQTs7QUFDQSxNQUFNQyxzQkFBc0IsR0FBRyxHQUEvQjs7QUFrQkE7QUFDQTtBQUNBO0FBQ2UsTUFBTUMseUJBQU4sU0FBd0NDLGVBQU1DO0FBQTlDO0FBQTRFO0FBR3ZGQyxFQUFBQSxXQUFXLENBQUND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QUEsU0FBUyxFQUFDLHlEQURkO0FBRUksUUFBQSxHQUFHLEVBQUUsS0FBS1AsVUFGZDtBQUdJLFFBQUEsUUFBUSxFQUFFLEtBQUt3RTtBQUhuQixRQURKLGVBTUksNkJBQUMseUJBQUQ7QUFBa0IsUUFBQSxJQUFJLEVBQUMsU0FBdkI7QUFBaUMsUUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFBL0MsU0FDSyx5QkFBRyxRQUFILENBREwsQ0FOSixDQWRKLENBTkosRUErQktKLG1CQS9CTCxlQWdDSSw2QkFBQyxhQUFEO0FBQ0ksUUFBQSxhQUFhLEVBQUUseUJBQUcsVUFBSCxDQURuQjtBQUVJLFFBQUEsb0JBQW9CLEVBQUUsS0FBS0MsaUJBRi9CO0FBR0ksUUFBQSxTQUFTLEVBQUUsSUFIZjtBQUlJLFFBQUEsWUFBWSxFQUFFLHlCQUFHLFNBQUgsQ0FKbEI7QUFLSSxRQUFBLGlCQUFpQixFQUFDLFFBTHRCO0FBTUksUUFBQSxRQUFRLEVBQUUsS0FBS1YsUUFObkI7QUFPSSxRQUFBLEtBQUssRUFBRSxLQVBYO0FBUUksUUFBQSxlQUFlLEVBQUUsQ0FBQyxLQUFLdkUsS0FBTCxDQUFXbUIsZ0JBUmpDO0FBU0ksUUFBQSxRQUFRLEVBQUU2QztBQVRkLFFBaENKLENBSE0sQ0FBVjtBQWdESDs7QUFFRCx3QkFDSSw2QkFBQyxVQUFEO0FBQVksTUFBQSxTQUFTLEVBQUMsOEJBQXRCO0FBQ0ksTUFBQSxVQUFVLEVBQUUsS0FBS2xFLEtBQUwsQ0FBV0ssVUFEM0I7QUFFSSxNQUFBLEtBQUssRUFBRXlDLEtBRlg7QUFHSSxNQUFBLFVBQVUsRUFBRXlCO0FBSGhCLG9CQUtJLDBDQUNLRCxPQURMLENBTEosQ0FESjtBQVdIOztBQS9Yc0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTgtMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFJlYWN0LCB7Q2hhbmdlRXZlbnQsIEZvcm1FdmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtJU2VjcmV0U3RvcmFnZUtleUluZm99IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyY1wiO1xuXG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgRmllbGQgZnJvbSAnLi4vLi4vZWxlbWVudHMvRmllbGQnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQge190fSBmcm9tICcuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtJRGlhbG9nUHJvcHN9IGZyb20gXCIuLi9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCB7YWNjZXNzU2VjcmV0U3RvcmFnZX0gZnJvbSBcIi4uLy4uLy4uLy4uL1NlY3VyaXR5TWFuYWdlclwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi8uLi9Nb2RhbFwiO1xuXG4vLyBNYXhpbXVtIGFjY2VwdGFibGUgc2l6ZSBvZiBhIGtleSBmaWxlLiBJdCdzIDU5IGNoYXJhY3RlcnMgaW5jbHVkaW5nIHRoZSBzcGFjZXMgd2UgZW5jb2RlLFxuLy8gc28gdGhpcyBzaG91bGQgYmUgcGxlbnR5IGFuZCBhbGxvdyBmb3IgcGVvcGxlIHB1dHRpbmcgZXh0cmEgd2hpdGVzcGFjZSBpbiB0aGUgZmlsZSBiZWNhdXNlXG4vLyBtYXliZSB0aGF0J3MgYSB0aGluZyBwZW9wbGUgd291bGQgZG8/XG5jb25zdCBLRVlfRklMRV9NQVhfU0laRSA9IDEyODtcblxuLy8gRG9uJ3Qgc2hvdXQgYXQgdGhlIHVzZXIgdGhhdCB0aGVpciBrZXkgaXMgaW52YWxpZCBldmVyeSB0aW1lIHRoZXkgdHlwZSBhIGtleTogd2FpdCBhIHNob3J0IHRpbWVcbmNvbnN0IFZBTElEQVRJT05fVEhST1RUTEVfTVMgPSAyMDA7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIGtleUluZm86IElTZWNyZXRTdG9yYWdlS2V5SW5mbztcbiAgICBjaGVja1ByaXZhdGVLZXk6IChrOiB7cGFzc3BocmFzZT86IHN0cmluZywgcmVjb3ZlcnlLZXk/OiBzdHJpbmd9KSA9PiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICByZWNvdmVyeUtleTogc3RyaW5nO1xuICAgIHJlY292ZXJ5S2V5VmFsaWQ6IGJvb2xlYW4gfCBudWxsO1xuICAgIHJlY292ZXJ5S2V5Q29ycmVjdDogYm9vbGVhbiB8IG51bGw7XG4gICAgcmVjb3ZlcnlLZXlGaWxlRXJyb3I6IGJvb2xlYW4gfCBudWxsO1xuICAgIGZvcmNlUmVjb3ZlcnlLZXk6IGJvb2xlYW47XG4gICAgcGFzc1BocmFzZTogc3RyaW5nO1xuICAgIGtleU1hdGNoZXM6IGJvb2xlYW4gfCBudWxsO1xuICAgIHJlc2V0dGluZzogYm9vbGVhbjtcbn1cblxuLypcbiAqIEFjY2VzcyBTZWN1cmUgU2VjcmV0IFN0b3JhZ2UgYnkgcmVxdWVzdGluZyB0aGUgdXNlcidzIHBhc3NwaHJhc2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBmaWxlVXBsb2FkID0gUmVhY3QuY3JlYXRlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5OiBcIlwiLFxuICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogbnVsbCxcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5Q29ycmVjdDogbnVsbCxcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5RmlsZUVycm9yOiBudWxsLFxuICAgICAgICAgICAgZm9yY2VSZWNvdmVyeUtleTogZmFsc2UsXG4gICAgICAgICAgICBwYXNzUGhyYXNlOiAnJyxcbiAgICAgICAgICAgIGtleU1hdGNoZXM6IG51bGwsXG4gICAgICAgICAgICByZXNldHRpbmc6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlc2V0dGluZykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVzZXR0aW5nOiBmYWxzZX0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Vc2VSZWNvdmVyeUtleUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGZvcmNlUmVjb3ZlcnlLZXk6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlUmVjb3ZlcnlLZXlPbkNoYW5nZSA9IGRlYm91bmNlKGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy52YWxpZGF0ZVJlY292ZXJ5S2V5KCk7XG4gICAgfSwgVkFMSURBVElPTl9USFJPVFRMRV9NUyk7XG5cbiAgICBwcml2YXRlIGFzeW5jIHZhbGlkYXRlUmVjb3ZlcnlLZXkoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5ID09PSAnJykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogbnVsbCxcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleUNvcnJlY3Q6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCBkZWNvZGVkS2V5ID0gY2xpLmtleUJhY2t1cEtleUZyb21SZWNvdmVyeUtleSh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5KTtcbiAgICAgICAgICAgIGNvbnN0IGNvcnJlY3QgPSBhd2FpdCBjbGkuY2hlY2tTZWNyZXRTdG9yYWdlS2V5KFxuICAgICAgICAgICAgICAgIGRlY29kZWRLZXksIHRoaXMucHJvcHMua2V5SW5mbyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleVZhbGlkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5Q29ycmVjdDogY29ycmVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleVZhbGlkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleUNvcnJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmVjb3ZlcnlLZXlDaGFuZ2UgPSAoZXY6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmVjb3ZlcnlLZXk6IGV2LnRhcmdldC52YWx1ZSxcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5RmlsZUVycm9yOiBudWxsLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBhbHNvIGNsZWFyIHRoZSBmaWxlIHVwbG9hZCBjb250cm9sIHNvIHRoYXQgdGhlIHVzZXIgY2FuIHVwbG9hZCB0aGUgc2FtZSBmaWxlXG4gICAgICAgIC8vIHRoZSBkaWQgYmVmb3JlIChvdGhlcndpc2UgdGhlIG9uY2hhbmdlIHdvdWxkbid0IGZpcmUpXG4gICAgICAgIGlmICh0aGlzLmZpbGVVcGxvYWQuY3VycmVudCkgdGhpcy5maWxlVXBsb2FkLmN1cnJlbnQudmFsdWUgPSBudWxsO1xuXG4gICAgICAgIC8vIFdlIGRvbid0IHVzZSBGaWVsZCdzIHZhbGlkYXRpb24gaGVyZSBiZWNhdXNlIGEpIHdlIHdhbnQgaXQgaW4gYSBzZXBhcmF0ZSBwbGFjZSByYXRoZXJcbiAgICAgICAgLy8gdGhhbiBpbiBhIHRvb2x0aXAgYW5kIGIpIHdlIHdhbnQgaXQgdG8gZGlzcGxheSBmZWVkYmFjayBiYXNlZCBvbiB0aGUgdXBsb2FkZWQgZmlsZVxuICAgICAgICAvLyBhcyB3ZWxsIGFzIHRoZSB0ZXh0IGJveC4gSWRlYWxseSB3ZSB3b3VsZCByZWZhY3RvciBGaWVsZCdzIHZhbGlkYXRpb24gbG9naWMgc28gd2UgY291bGRcbiAgICAgICAgLy8gcmUtdXNlIHNvbWUgb2YgaXQuXG4gICAgICAgIHRoaXMudmFsaWRhdGVSZWNvdmVyeUtleU9uQ2hhbmdlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWNvdmVyeUtleUZpbGVDaGFuZ2UgPSBhc3luYyAoZXY6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIGlmIChldi50YXJnZXQuZmlsZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZiA9IGV2LnRhcmdldC5maWxlc1swXTtcblxuICAgICAgICBpZiAoZi5zaXplID4gS0VZX0ZJTEVfTUFYX1NJWkUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5RmlsZUVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5Q29ycmVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRzID0gYXdhaXQgZi50ZXh0KCk7XG4gICAgICAgICAgICAvLyB0ZXN0IGl0J3Mgd2l0aGluIHRoZSBiYXNlNTggYWxwaGFiZXQuIFdlIGNvdWxkIGJlIG1vcmUgc3RyaWN0IGhlcmUsIGVnLiByZXF1aXJlIHRoZVxuICAgICAgICAgICAgLy8gcmlnaHQgbnVtYmVyIG9mIGNoYXJhY3RlcnMsIGJ1dCBpdCdzIHJlYWxseSBqdXN0IHRvIG1ha2Ugc3VyZSB0aGF0IHdoYXQgd2UncmUgcmVhZGluZyBpc1xuICAgICAgICAgICAgLy8gdGV4dCBiZWNhdXNlIHdlJ2xsIHB1dCBpdCBpbiB0aGUgdGV4dCBmaWVsZC5cbiAgICAgICAgICAgIGlmICgvXlsxMjM0NTY3ODlBQkNERUZHSEpLTE1OUFFSU1RVVldYWVphYmNkZWZnaGlqa21ub3BxcnN0dXZ3eHl6XFxzXSskLy50ZXN0KGNvbnRlbnRzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICByZWNvdmVyeUtleUZpbGVFcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXk6IGNvbnRlbnRzLnRyaW0oKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnZhbGlkYXRlUmVjb3ZlcnlLZXkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5RmlsZUVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByZWNvdmVyeUtleUNvcnJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICByZWNvdmVyeUtleVZhbGlkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXk6ICcnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWNvdmVyeUtleUZpbGVVcGxvYWRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5maWxlVXBsb2FkLmN1cnJlbnQuY2xpY2soKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUGFzc1BocmFzZU5leHQgPSBhc3luYyAoZXY6IEZvcm1FdmVudDxIVE1MRm9ybUVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGFzc1BocmFzZS5sZW5ndGggPD0gMCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBrZXlNYXRjaGVzOiBudWxsIH0pO1xuICAgICAgICBjb25zdCBpbnB1dCA9IHsgcGFzc3BocmFzZTogdGhpcy5zdGF0ZS5wYXNzUGhyYXNlIH07XG4gICAgICAgIGNvbnN0IGtleU1hdGNoZXMgPSBhd2FpdCB0aGlzLnByb3BzLmNoZWNrUHJpdmF0ZUtleShpbnB1dCk7XG4gICAgICAgIGlmIChrZXlNYXRjaGVzKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoaW5wdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGtleU1hdGNoZXMgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlY292ZXJ5S2V5TmV4dCA9IGFzeW5jIChldjogRm9ybUV2ZW50PEhUTUxGb3JtRWxlbWVudD4pID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBrZXlNYXRjaGVzOiBudWxsIH0pO1xuICAgICAgICBjb25zdCBpbnB1dCA9IHsgcmVjb3ZlcnlLZXk6IHRoaXMuc3RhdGUucmVjb3ZlcnlLZXkgfTtcbiAgICAgICAgY29uc3Qga2V5TWF0Y2hlcyA9IGF3YWl0IHRoaXMucHJvcHMuY2hlY2tQcml2YXRlS2V5KGlucHV0KTtcbiAgICAgICAgaWYgKGtleU1hdGNoZXMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChpbnB1dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsga2V5TWF0Y2hlcyB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzc1BocmFzZUNoYW5nZSA9IChldjogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlOiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgICAgICBrZXlNYXRjaGVzOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlc2V0QWxsQ2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQ8SFRNTEFuY2hvckVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Jlc2V0dGluZzogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29uZmlybVJlc2V0QWxsQ2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIEhpZGUgb3Vyc2VsdmVzIHNvIHRoZSB1c2VyIGNhbiBpbnRlcmFjdCB3aXRoIHRoZSByZXNldCBkaWFsb2dzLlxuICAgICAgICAvLyBXZSBkb24ndCBjb25jbHVkZSB0aGUgcHJvbWlzZSBjaGFpbiAob25GaW5pc2hlZCkgeWV0IHRvIGF2b2lkIGNvbmZ1c2luZ1xuICAgICAgICAvLyBhbnkgdXBzdHJlYW0gY29kZSBmbG93cy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm90ZTogdGhpcyB3aWxsIHVubW91bnQgdXMsIHNvIGRvbid0IGNhbGwgYHNldFN0YXRlYCBvciBhbnl0aGluZyBpbiB0aGVcbiAgICAgICAgLy8gcmVzdCBvZiB0aGlzIGZ1bmN0aW9uLlxuICAgICAgICBNb2RhbC50b2dnbGVDdXJyZW50RGlhbG9nVmlzaWJpbGl0eSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBGb3JjZSByZXNldCBzZWNyZXQgc3RvcmFnZSAod2hpY2ggcmVzZXRzIHRoZSBrZXkgYmFja3VwKVxuICAgICAgICAgICAgYXdhaXQgYWNjZXNzU2VjcmV0U3RvcmFnZShhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gTm93IHJlc2V0IGNyb3NzLXNpZ25pbmcgc28gZXZlcnl0aGluZyBKdXN0IFdvcmtz4oSiIGFnYWluLlxuICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGkuYm9vdHN0cmFwQ3Jvc3NTaWduaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aFVwbG9hZERldmljZVNpZ25pbmdLZXlzOiBhc3luYyAobWFrZVJlcXVlc3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFhYWDogTWFraW5nIHRoaXMgYW4gaW1wb3J0IGJyZWFrcyB0aGUgYXBwLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgSW50ZXJhY3RpdmVBdXRoRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuSW50ZXJhY3RpdmVBdXRoRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Nyb3NzLXNpZ25pbmcga2V5cyBkaWFsb2cnLCAnJywgSW50ZXJhY3RpdmVBdXRoRGlhbG9nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiU2V0dGluZyB1cCBrZXlzXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ6IGNsaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFrZVJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDcm9zcy1zaWduaW5nIGtleSB1cGxvYWQgYXV0aCBjYW5jZWxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc2V0dXBOZXdDcm9zc1NpZ25pbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBOb3cgd2UgY2FuIGluZGljYXRlIHRoYXQgdGhlIHVzZXIgaXMgZG9uZSBwcmVzc2luZyBidXR0b25zLCBmaW5hbGx5LlxuICAgICAgICAgICAgICAgIC8vIFVwc3RyZWFtIGZsb3dzIHdpbGwgZGV0ZWN0IHRoZSBuZXcgc2VjcmV0IHN0b3JhZ2UsIGtleSBiYWNrdXAsIGV0YyBhbmQgdXNlIGl0LlxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGdldEtleVZhbGlkYXRpb25UZXh0KCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5RmlsZUVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJXcm9uZyBmaWxlIHR5cGVcIik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5yZWNvdmVyeUtleUNvcnJlY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIkxvb2tzIGdvb2QhXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiV3JvbmcgU2VjdXJpdHkgS2V5XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiSW52YWxpZCBTZWN1cml0eSBLZXlcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIENhdXRpb246IE1ha2luZyB0aGVzZSBhbiBpbXBvcnQgd2lsbCBicmVhayB0ZXN0cy5cbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2dcIik7XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9uc1wiKTtcblxuICAgICAgICBjb25zdCBoYXNQYXNzcGhyYXNlID0gKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlJbmZvICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLmtleUluZm8ucGFzc3BocmFzZSAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlJbmZvLnBhc3NwaHJhc2Uuc2FsdCAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlJbmZvLnBhc3NwaHJhc2UuaXRlcmF0aW9uc1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHJlc2V0QnV0dG9uID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3Jlc2V0XCI+XG4gICAgICAgICAgICAgICAge190KFwiRm9yZ290dGVuIG9yIGxvc3QgYWxsIHJlY292ZXJ5IG1ldGhvZHM/IDxhPlJlc2V0IGFsbDwvYT5cIiwgbnVsbCwge1xuICAgICAgICAgICAgICAgICAgICBhOiAoc3ViKSA9PiA8YVxuICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj1cIlwiIG9uQ2xpY2s9e3RoaXMub25SZXNldEFsbENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19yZXNldF9saW5rXCI+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGxldCB0aXRsZTtcbiAgICAgICAgbGV0IHRpdGxlQ2xhc3M7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlc2V0dGluZykge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlJlc2V0IGV2ZXJ5dGhpbmdcIik7XG4gICAgICAgICAgICB0aXRsZUNsYXNzID0gWydteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3RpdGxlV2l0aEljb24gbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19yZXNldEJhZGdlJ107XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJPbmx5IGRvIHRoaXMgaWYgeW91IGhhdmUgbm8gb3RoZXIgZGV2aWNlIHRvIGNvbXBsZXRlIHZlcmlmaWNhdGlvbiB3aXRoLlwiKX08L3A+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiSWYgeW91IHJlc2V0IGV2ZXJ5dGhpbmcsIHlvdSB3aWxsIHJlc3RhcnQgd2l0aCBubyB0cnVzdGVkIHNlc3Npb25zLCBubyB0cnVzdGVkIHVzZXJzLCBhbmQgXCJcbiAgICAgICAgICAgICAgICAgICAgKyBcIm1pZ2h0IG5vdCBiZSBhYmxlIHRvIHNlZSBwYXN0IG1lc3NhZ2VzLlwiKX08L3A+XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ1Jlc2V0Jyl9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uQ29uZmlybVJlc2V0QWxsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgIGZvY3VzPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbkNsYXNzPVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKGhhc1Bhc3NwaHJhc2UgJiYgIXRoaXMuc3RhdGUuZm9yY2VSZWNvdmVyeUtleSkge1xuICAgICAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJTZWN1cml0eSBQaHJhc2VcIik7XG4gICAgICAgICAgICB0aXRsZUNsYXNzID0gWydteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3RpdGxlV2l0aEljb24gbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19zZWN1cmVQaHJhc2VUaXRsZSddO1xuXG4gICAgICAgICAgICBsZXQga2V5U3RhdHVzO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUua2V5TWF0Y2hlcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBrZXlTdGF0dXMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfa2V5U3RhdHVzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtcIlxcdUQ4M0RcXHVEQzRFIFwifXtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVW5hYmxlIHRvIGFjY2VzcyBzZWNyZXQgc3RvcmFnZS4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJQbGVhc2UgdmVyaWZ5IHRoYXQgeW91IGVudGVyZWQgdGhlIGNvcnJlY3QgU2VjdXJpdHkgUGhyYXNlLlwiLFxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX2tleVN0YXR1c1wiIC8+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiRW50ZXIgeW91ciBTZWN1cml0eSBQaHJhc2Ugb3IgPGJ1dHRvbj5Vc2UgeW91ciBTZWN1cml0eSBLZXk8L2J1dHRvbj4gdG8gY29udGludWUuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b246IHMgPT4gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfbGlua0J1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInNwYW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Vc2VSZWNvdmVyeUtleUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApfTwvcD5cblxuICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcHJpbWFyeUNvbnRhaW5lclwiIG9uU3VibWl0PXt0aGlzLm9uUGFzc1BocmFzZU5leHR9PlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3Bhc3NQaHJhc2VJbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBhc3NQaHJhc2VDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIlNlY3VyaXR5IFBocmFzZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAge2tleVN0YXR1c31cbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdDb250aW51ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25QYXNzUGhyYXNlTmV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXt0aGlzLnN0YXRlLnBhc3NQaHJhc2UubGVuZ3RoID09PSAwfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpdmU9e3Jlc2V0QnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJTZWN1cml0eSBLZXlcIik7XG4gICAgICAgICAgICB0aXRsZUNsYXNzID0gWydteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3RpdGxlV2l0aEljb24gbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19zZWN1cmVCYWNrdXBUaXRsZSddO1xuXG4gICAgICAgICAgICBjb25zdCBmZWVkYmFja0NsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICAnbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19yZWNvdmVyeUtleUZlZWRiYWNrJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19yZWNvdmVyeUtleUZlZWRiYWNrX3ZhbGlkJzogdGhpcy5zdGF0ZS5yZWNvdmVyeUtleUNvcnJlY3QgPT09IHRydWUsXG4gICAgICAgICAgICAgICAgJ214X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlGZWVkYmFja19pbnZhbGlkJzogdGhpcy5zdGF0ZS5yZWNvdmVyeUtleUNvcnJlY3QgPT09IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCByZWNvdmVyeUtleUZlZWRiYWNrID0gPGRpdiBjbGFzc05hbWU9e2ZlZWRiYWNrQ2xhc3Nlc30+XG4gICAgICAgICAgICAgICAge3RoaXMuZ2V0S2V5VmFsaWRhdGlvblRleHQoKX1cbiAgICAgICAgICAgIDwvZGl2PjtcblxuICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiVXNlIHlvdXIgU2VjdXJpdHkgS2V5IHRvIGNvbnRpbnVlLlwiKX08L3A+XG5cbiAgICAgICAgICAgICAgICA8Zm9ybVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3ByaW1hcnlDb250YWluZXJcIlxuICAgICAgICAgICAgICAgICAgICBvblN1Ym1pdD17dGhpcy5vblJlY292ZXJ5S2V5TmV4dH1cbiAgICAgICAgICAgICAgICAgICAgc3BlbGxDaGVjaz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlFbnRyeVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5RW50cnlfdGV4dElucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnU2VjdXJpdHkgS2V5Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnJlY292ZXJ5S2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblJlY292ZXJ5S2V5Q2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbGlkaXR5PXt0aGlzLnN0YXRlLnJlY292ZXJ5S2V5Q29ycmVjdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5RW50cnlfZW50cnlDb250cm9sU2VwYXJhdG9yVGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIm9yXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5RW50cnlfZmlsZUlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmZpbGVVcGxvYWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUmVjb3ZlcnlLZXlGaWxlQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLm9uUmVjb3ZlcnlLZXlGaWxlVXBsb2FkQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJVcGxvYWRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7cmVjb3ZlcnlLZXlGZWVkYmFja31cbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdDb250aW51ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25SZWNvdmVyeUtleU5leHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b249e190KFwiR28gQmFja1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbkNsYXNzPSdkYW5nZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkNhbmNlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlEaXNhYmxlZD17IXRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aXZlPXtyZXNldEJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPSdteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nJ1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICAgICAgdGl0bGVDbGFzcz17dGl0bGVDbGFzc31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
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

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../../index"));

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var _languageHandler = require("../../../../languageHandler");

/*
Copyright 2018, 2019 New Vector Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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

class AccessSecretStorageDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onUseRecoveryKeyClick", () => {
      this.setState({
        forceRecoveryKey: true
      });
    });
    (0, _defineProperty2.default)(this, "_validateRecoveryKeyOnChange", (0, _lodash.debounce)(() => {
      this._validateRecoveryKey();
    }, VALIDATION_THROTTLE_MS));
    (0, _defineProperty2.default)(this, "_onRecoveryKeyChange", e => {
      this.setState({
        recoveryKey: e.target.value,
        recoveryKeyFileError: null
      }); // also clear the file upload control so that the user can upload the same file
      // the did before (otherwise the onchange wouldn't fire)

      if (this._fileUpload.current) this._fileUpload.current.value = null; // We don't use Field's validation here because a) we want it in a separate place rather
      // than in a tooltip and b) we want it to display feedback based on the uploaded file
      // as well as the text box. Ideally we would refactor Field's validation logic so we could
      // re-use some of it.

      this._validateRecoveryKeyOnChange();
    });
    (0, _defineProperty2.default)(this, "_onRecoveryKeyFileChange", async e => {
      if (e.target.files.length === 0) return;
      const f = e.target.files[0];

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

          this._validateRecoveryKey();
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
    (0, _defineProperty2.default)(this, "_onRecoveryKeyFileUploadClick", () => {
      this._fileUpload.current.click();
    });
    (0, _defineProperty2.default)(this, "_onPassPhraseNext", async e => {
      e.preventDefault();
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
    (0, _defineProperty2.default)(this, "_onRecoveryKeyNext", async e => {
      e.preventDefault();
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
    (0, _defineProperty2.default)(this, "_onPassPhraseChange", e => {
      this.setState({
        passPhrase: e.target.value,
        keyMatches: null
      });
    });
    this._fileUpload = /*#__PURE__*/_react.default.createRef();
    this.state = {
      recoveryKey: "",
      recoveryKeyValid: null,
      recoveryKeyCorrect: null,
      recoveryKeyFileError: null,
      forceRecoveryKey: false,
      passPhrase: '',
      keyMatches: null
    };
  }

  async _validateRecoveryKey() {
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

  getKeyValidationText() {
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
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const hasPassphrase = this.props.keyInfo && this.props.keyInfo.passphrase && this.props.keyInfo.passphrase.salt && this.props.keyInfo.passphrase.iterations;
    let content;
    let title;
    let titleClass;

    if (hasPassphrase && !this.state.forceRecoveryKey) {
      const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
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
          onClick: this._onUseRecoveryKeyClick
        }, s)
      })), /*#__PURE__*/_react.default.createElement("form", {
        className: "mx_AccessSecretStorageDialog_primaryContainer",
        onSubmit: this._onPassPhraseNext
      }, /*#__PURE__*/_react.default.createElement("input", {
        type: "password",
        className: "mx_AccessSecretStorageDialog_passPhraseInput",
        onChange: this._onPassPhraseChange,
        value: this.state.passPhrase,
        autoFocus: true,
        autoComplete: "new-password",
        placeholder: (0, _languageHandler._t)("Security Phrase")
      }), keyStatus, /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Continue'),
        onPrimaryButtonClick: this._onPassPhraseNext,
        hasCancel: true,
        onCancel: this._onCancel,
        focus: false,
        primaryDisabled: this.state.passPhrase.length === 0
      })));
    } else {
      title = (0, _languageHandler._t)("Security Key");
      titleClass = ['mx_AccessSecretStorageDialog_titleWithIcon mx_AccessSecretStorageDialog_secureBackupTitle'];
      const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
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
        onSubmit: this._onRecoveryKeyNext,
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
        onChange: this._onRecoveryKeyChange,
        forceValidity: this.state.recoveryKeyCorrect,
        autoComplete: "off"
      })), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry_entryControlSeparatorText"
      }, (0, _languageHandler._t)("or")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("input", {
        type: "file",
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry_fileInput",
        ref: this._fileUpload,
        onChange: this._onRecoveryKeyFileChange
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this._onRecoveryKeyFileUploadClick
      }, (0, _languageHandler._t)("Upload")))), recoveryKeyFeedback, /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Continue'),
        onPrimaryButtonClick: this._onRecoveryKeyNext,
        hasCancel: true,
        cancelButton: (0, _languageHandler._t)("Go Back"),
        cancelButtonClass: "danger",
        onCancel: this._onCancel,
        focus: false,
        primaryDisabled: !this.state.recoveryKeyValid
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
(0, _defineProperty2.default)(AccessSecretStorageDialog, "propTypes", {
  // { passphrase, pubkey }
  keyInfo: _propTypes.default.object.isRequired,
  // Function from one of { passphrase, recoveryKey } -> boolean
  checkPrivateKey: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZy5qcyJdLCJuYW1lcyI6WyJLRVlfRklMRV9NQVhfU0laRSIsIlZBTElEQVRJT05fVEhST1RUTEVfTVMiLCJBY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJzZXRTdGF0ZSIsImZvcmNlUmVjb3ZlcnlLZXkiLCJfdmFsaWRhdGVSZWNvdmVyeUtleSIsImUiLCJyZWNvdmVyeUtleSIsInRhcmdldCIsInZhbHVlIiwicmVjb3ZlcnlLZXlGaWxlRXJyb3IiLCJfZmlsZVVwbG9hZCIsImN1cnJlbnQiLCJfdmFsaWRhdGVSZWNvdmVyeUtleU9uQ2hhbmdlIiwiZmlsZXMiLCJsZW5ndGgiLCJmIiwic2l6ZSIsInJlY292ZXJ5S2V5Q29ycmVjdCIsInJlY292ZXJ5S2V5VmFsaWQiLCJjb250ZW50cyIsInRleHQiLCJ0ZXN0IiwidHJpbSIsImNsaWNrIiwicHJldmVudERlZmF1bHQiLCJzdGF0ZSIsInBhc3NQaHJhc2UiLCJrZXlNYXRjaGVzIiwiaW5wdXQiLCJwYXNzcGhyYXNlIiwiY2hlY2tQcml2YXRlS2V5IiwiY3JlYXRlUmVmIiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZGVjb2RlZEtleSIsImtleUJhY2t1cEtleUZyb21SZWNvdmVyeUtleSIsImNvcnJlY3QiLCJjaGVja1NlY3JldFN0b3JhZ2VLZXkiLCJrZXlJbmZvIiwiZ2V0S2V5VmFsaWRhdGlvblRleHQiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiaGFzUGFzc3BocmFzZSIsInNhbHQiLCJpdGVyYXRpb25zIiwiY29udGVudCIsInRpdGxlIiwidGl0bGVDbGFzcyIsIkRpYWxvZ0J1dHRvbnMiLCJBY2Nlc3NpYmxlQnV0dG9uIiwia2V5U3RhdHVzIiwiYnV0dG9uIiwicyIsIl9vblVzZVJlY292ZXJ5S2V5Q2xpY2siLCJfb25QYXNzUGhyYXNlTmV4dCIsIl9vblBhc3NQaHJhc2VDaGFuZ2UiLCJfb25DYW5jZWwiLCJmZWVkYmFja0NsYXNzZXMiLCJyZWNvdmVyeUtleUZlZWRiYWNrIiwiX29uUmVjb3ZlcnlLZXlOZXh0IiwiX29uUmVjb3ZlcnlLZXlDaGFuZ2UiLCJfb25SZWNvdmVyeUtleUZpbGVDaGFuZ2UiLCJfb25SZWNvdmVyeUtleUZpbGVVcGxvYWRDbGljayIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLGlCQUFpQixHQUFHLEdBQTFCLEMsQ0FFQTs7QUFDQSxNQUFNQyxzQkFBc0IsR0FBRyxHQUEvQjtBQUVBO0FBQ0E7QUFDQTs7QUFDZSxNQUFNQyx5QkFBTixTQUF3Q0MsZUFBTUMsYUFBOUMsQ0FBNEQ7QUFRdkVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHFEQWdCUCxNQUFNO0FBQ2QsV0FBS0EsS0FBTCxDQUFXQyxVQUFYLENBQXNCLEtBQXRCO0FBQ0gsS0FsQmtCO0FBQUEsa0VBb0JNLE1BQU07QUFDM0IsV0FBS0MsUUFBTCxDQUFjO0FBQ1ZDLFFBQUFBLGdCQUFnQixFQUFFO0FBRFIsT0FBZDtBQUdILEtBeEJrQjtBQUFBLHdFQTBCWSxzQkFBUyxNQUFNO0FBQzFDLFdBQUtDLG9CQUFMO0FBQ0gsS0FGOEIsRUFFNUJULHNCQUY0QixDQTFCWjtBQUFBLGdFQXlES1UsQ0FBRCxJQUFPO0FBQzFCLFdBQUtILFFBQUwsQ0FBYztBQUNWSSxRQUFBQSxXQUFXLEVBQUVELENBQUMsQ0FBQ0UsTUFBRixDQUFTQyxLQURaO0FBRVZDLFFBQUFBLG9CQUFvQixFQUFFO0FBRlosT0FBZCxFQUQwQixDQU0xQjtBQUNBOztBQUNBLFVBQUksS0FBS0MsV0FBTCxDQUFpQkMsT0FBckIsRUFBOEIsS0FBS0QsV0FBTCxDQUFpQkMsT0FBakIsQ0FBeUJILEtBQXpCLEdBQWlDLElBQWpDLENBUkosQ0FVMUI7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsV0FBS0ksNEJBQUw7QUFDSCxLQXhFa0I7QUFBQSxvRUEwRVEsTUFBTVAsQ0FBTixJQUFXO0FBQ2xDLFVBQUlBLENBQUMsQ0FBQ0UsTUFBRixDQUFTTSxLQUFULENBQWVDLE1BQWYsS0FBMEIsQ0FBOUIsRUFBaUM7QUFFakMsWUFBTUMsQ0FBQyxHQUFHVixDQUFDLENBQUNFLE1BQUYsQ0FBU00sS0FBVCxDQUFlLENBQWYsQ0FBVjs7QUFFQSxVQUFJRSxDQUFDLENBQUNDLElBQUYsR0FBU3RCLGlCQUFiLEVBQWdDO0FBQzVCLGFBQUtRLFFBQUwsQ0FBYztBQUNWTyxVQUFBQSxvQkFBb0IsRUFBRSxJQURaO0FBRVZRLFVBQUFBLGtCQUFrQixFQUFFLEtBRlY7QUFHVkMsVUFBQUEsZ0JBQWdCLEVBQUU7QUFIUixTQUFkO0FBS0gsT0FORCxNQU1PO0FBQ0gsY0FBTUMsUUFBUSxHQUFHLE1BQU1KLENBQUMsQ0FBQ0ssSUFBRixFQUF2QixDQURHLENBRUg7QUFDQTtBQUNBOztBQUNBLFlBQUksb0VBQW9FQyxJQUFwRSxDQUF5RUYsUUFBekUsQ0FBSixFQUF3RjtBQUNwRixlQUFLakIsUUFBTCxDQUFjO0FBQ1ZPLFlBQUFBLG9CQUFvQixFQUFFLElBRFo7QUFFVkgsWUFBQUEsV0FBVyxFQUFFYSxRQUFRLENBQUNHLElBQVQ7QUFGSCxXQUFkOztBQUlBLGVBQUtsQixvQkFBTDtBQUNILFNBTkQsTUFNTztBQUNILGVBQUtGLFFBQUwsQ0FBYztBQUNWTyxZQUFBQSxvQkFBb0IsRUFBRSxJQURaO0FBRVZRLFlBQUFBLGtCQUFrQixFQUFFLEtBRlY7QUFHVkMsWUFBQUEsZ0JBQWdCLEVBQUUsS0FIUjtBQUlWWixZQUFBQSxXQUFXLEVBQUU7QUFKSCxXQUFkO0FBTUg7QUFDSjtBQUNKLEtBekdrQjtBQUFBLHlFQTJHYSxNQUFNO0FBQ2xDLFdBQUtJLFdBQUwsQ0FBaUJDLE9BQWpCLENBQXlCWSxLQUF6QjtBQUNILEtBN0drQjtBQUFBLDZEQStHQyxNQUFPbEIsQ0FBUCxJQUFhO0FBQzdCQSxNQUFBQSxDQUFDLENBQUNtQixjQUFGO0FBRUEsVUFBSSxLQUFLQyxLQUFMLENBQVdDLFVBQVgsQ0FBc0JaLE1BQXRCLElBQWdDLENBQXBDLEVBQXVDO0FBRXZDLFdBQUtaLFFBQUwsQ0FBYztBQUFFeUIsUUFBQUEsVUFBVSxFQUFFO0FBQWQsT0FBZDtBQUNBLFlBQU1DLEtBQUssR0FBRztBQUFFQyxRQUFBQSxVQUFVLEVBQUUsS0FBS0osS0FBTCxDQUFXQztBQUF6QixPQUFkO0FBQ0EsWUFBTUMsVUFBVSxHQUFHLE1BQU0sS0FBSzNCLEtBQUwsQ0FBVzhCLGVBQVgsQ0FBMkJGLEtBQTNCLENBQXpCOztBQUNBLFVBQUlELFVBQUosRUFBZ0I7QUFDWixhQUFLM0IsS0FBTCxDQUFXQyxVQUFYLENBQXNCMkIsS0FBdEI7QUFDSCxPQUZELE1BRU87QUFDSCxhQUFLMUIsUUFBTCxDQUFjO0FBQUV5QixVQUFBQTtBQUFGLFNBQWQ7QUFDSDtBQUNKLEtBNUhrQjtBQUFBLDhEQThIRSxNQUFPdEIsQ0FBUCxJQUFhO0FBQzlCQSxNQUFBQSxDQUFDLENBQUNtQixjQUFGO0FBRUEsVUFBSSxDQUFDLEtBQUtDLEtBQUwsQ0FBV1AsZ0JBQWhCLEVBQWtDO0FBRWxDLFdBQUtoQixRQUFMLENBQWM7QUFBRXlCLFFBQUFBLFVBQVUsRUFBRTtBQUFkLE9BQWQ7QUFDQSxZQUFNQyxLQUFLLEdBQUc7QUFBRXRCLFFBQUFBLFdBQVcsRUFBRSxLQUFLbUIsS0FBTCxDQUFXbkI7QUFBMUIsT0FBZDtBQUNBLFlBQU1xQixVQUFVLEdBQUcsTUFBTSxLQUFLM0IsS0FBTCxDQUFXOEIsZUFBWCxDQUEyQkYsS0FBM0IsQ0FBekI7O0FBQ0EsVUFBSUQsVUFBSixFQUFnQjtBQUNaLGFBQUszQixLQUFMLENBQVdDLFVBQVgsQ0FBc0IyQixLQUF0QjtBQUNILE9BRkQsTUFFTztBQUNILGFBQUsxQixRQUFMLENBQWM7QUFBRXlCLFVBQUFBO0FBQUYsU0FBZDtBQUNIO0FBQ0osS0EzSWtCO0FBQUEsK0RBNklJdEIsQ0FBRCxJQUFPO0FBQ3pCLFdBQUtILFFBQUwsQ0FBYztBQUNWd0IsUUFBQUEsVUFBVSxFQUFFckIsQ0FBQyxDQUFDRSxNQUFGLENBQVNDLEtBRFg7QUFFVm1CLFFBQUFBLFVBQVUsRUFBRTtBQUZGLE9BQWQ7QUFJSCxLQWxKa0I7QUFHZixTQUFLakIsV0FBTCxnQkFBbUJiLGVBQU1rQyxTQUFOLEVBQW5CO0FBRUEsU0FBS04sS0FBTCxHQUFhO0FBQ1RuQixNQUFBQSxXQUFXLEVBQUUsRUFESjtBQUVUWSxNQUFBQSxnQkFBZ0IsRUFBRSxJQUZUO0FBR1RELE1BQUFBLGtCQUFrQixFQUFFLElBSFg7QUFJVFIsTUFBQUEsb0JBQW9CLEVBQUUsSUFKYjtBQUtUTixNQUFBQSxnQkFBZ0IsRUFBRSxLQUxUO0FBTVR1QixNQUFBQSxVQUFVLEVBQUUsRUFOSDtBQU9UQyxNQUFBQSxVQUFVLEVBQUU7QUFQSCxLQUFiO0FBU0g7O0FBZ0JELFFBQU12QixvQkFBTixHQUE2QjtBQUN6QixRQUFJLEtBQUtxQixLQUFMLENBQVduQixXQUFYLEtBQTJCLEVBQS9CLEVBQW1DO0FBQy9CLFdBQUtKLFFBQUwsQ0FBYztBQUNWZ0IsUUFBQUEsZ0JBQWdCLEVBQUUsSUFEUjtBQUVWRCxRQUFBQSxrQkFBa0IsRUFBRTtBQUZWLE9BQWQ7QUFJQTtBQUNIOztBQUVELFFBQUk7QUFDQSxZQUFNZSxHQUFHLEdBQUdDLGlDQUFnQkMsR0FBaEIsRUFBWjs7QUFDQSxZQUFNQyxVQUFVLEdBQUdILEdBQUcsQ0FBQ0ksMkJBQUosQ0FBZ0MsS0FBS1gsS0FBTCxDQUFXbkIsV0FBM0MsQ0FBbkI7QUFDQSxZQUFNK0IsT0FBTyxHQUFHLE1BQU1MLEdBQUcsQ0FBQ00scUJBQUosQ0FDbEJILFVBRGtCLEVBQ04sS0FBS25DLEtBQUwsQ0FBV3VDLE9BREwsQ0FBdEI7QUFHQSxXQUFLckMsUUFBTCxDQUFjO0FBQ1ZnQixRQUFBQSxnQkFBZ0IsRUFBRSxJQURSO0FBRVZELFFBQUFBLGtCQUFrQixFQUFFb0I7QUFGVixPQUFkO0FBSUgsS0FWRCxDQVVFLE9BQU9oQyxDQUFQLEVBQVU7QUFDUixXQUFLSCxRQUFMLENBQWM7QUFDVmdCLFFBQUFBLGdCQUFnQixFQUFFLEtBRFI7QUFFVkQsUUFBQUEsa0JBQWtCLEVBQUU7QUFGVixPQUFkO0FBSUg7QUFDSjs7QUE2RkR1QixFQUFBQSxvQkFBb0IsR0FBRztBQUNuQixRQUFJLEtBQUtmLEtBQUwsQ0FBV2hCLG9CQUFmLEVBQXFDO0FBQ2pDLGFBQU8seUJBQUcsaUJBQUgsQ0FBUDtBQUNILEtBRkQsTUFFTyxJQUFJLEtBQUtnQixLQUFMLENBQVdSLGtCQUFmLEVBQW1DO0FBQ3RDLGFBQU8seUJBQUcsYUFBSCxDQUFQO0FBQ0gsS0FGTSxNQUVBLElBQUksS0FBS1EsS0FBTCxDQUFXUCxnQkFBZixFQUFpQztBQUNwQyxhQUFPLHlCQUFHLG9CQUFILENBQVA7QUFDSCxLQUZNLE1BRUEsSUFBSSxLQUFLTyxLQUFMLENBQVdQLGdCQUFYLEtBQWdDLElBQXBDLEVBQTBDO0FBQzdDLGFBQU8sRUFBUDtBQUNILEtBRk0sTUFFQTtBQUNILGFBQU8seUJBQUcsc0JBQUgsQ0FBUDtBQUNIO0FBQ0o7O0FBRUR1QixFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxVQUFVLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwwQkFBakIsQ0FBbkI7QUFFQSxVQUFNQyxhQUFhLEdBQ2YsS0FBSzdDLEtBQUwsQ0FBV3VDLE9BQVgsSUFDQSxLQUFLdkMsS0FBTCxDQUFXdUMsT0FBWCxDQUFtQlYsVUFEbkIsSUFFQSxLQUFLN0IsS0FBTCxDQUFXdUMsT0FBWCxDQUFtQlYsVUFBbkIsQ0FBOEJpQixJQUY5QixJQUdBLEtBQUs5QyxLQUFMLENBQVd1QyxPQUFYLENBQW1CVixVQUFuQixDQUE4QmtCLFVBSmxDO0FBT0EsUUFBSUMsT0FBSjtBQUNBLFFBQUlDLEtBQUo7QUFDQSxRQUFJQyxVQUFKOztBQUNBLFFBQUlMLGFBQWEsSUFBSSxDQUFDLEtBQUtwQixLQUFMLENBQVd0QixnQkFBakMsRUFBbUQ7QUFDL0MsWUFBTWdELGFBQWEsR0FBR1IsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDhCQUFqQixDQUF0QjtBQUNBLFlBQU1RLGdCQUFnQixHQUFHVCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMkJBQWpCLENBQXpCO0FBQ0FLLE1BQUFBLEtBQUssR0FBRyx5QkFBRyxpQkFBSCxDQUFSO0FBQ0FDLE1BQUFBLFVBQVUsR0FBRyxDQUFDLDJGQUFELENBQWI7QUFFQSxVQUFJRyxTQUFKOztBQUNBLFVBQUksS0FBSzVCLEtBQUwsQ0FBV0UsVUFBWCxLQUEwQixLQUE5QixFQUFxQztBQUNqQzBCLFFBQUFBLFNBQVMsZ0JBQUc7QUFBSyxVQUFBLFNBQVMsRUFBQztBQUFmLFdBQ1AsZUFETyxFQUNVLHlCQUNkLHNDQUNBLDZEQUZjLENBRFYsQ0FBWjtBQU1ILE9BUEQsTUFPTztBQUNIQSxRQUFBQSxTQUFTLGdCQUFHO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZixVQUFaO0FBQ0g7O0FBRURMLE1BQUFBLE9BQU8sZ0JBQUcsdURBQ04sd0NBQUkseUJBQ0EsbUZBREEsRUFDcUYsRUFEckYsRUFFQTtBQUNJTSxRQUFBQSxNQUFNLEVBQUVDLENBQUMsaUJBQUksNkJBQUMsZ0JBQUQ7QUFBa0IsVUFBQSxTQUFTLEVBQUMsZUFBNUI7QUFDVCxVQUFBLE9BQU8sRUFBQyxNQURDO0FBRVQsVUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFGTCxXQUlSRCxDQUpRO0FBRGpCLE9BRkEsQ0FBSixDQURNLGVBYU47QUFBTSxRQUFBLFNBQVMsRUFBQywrQ0FBaEI7QUFBZ0UsUUFBQSxRQUFRLEVBQUUsS0FBS0U7QUFBL0Usc0JBQ0k7QUFDSSxRQUFBLElBQUksRUFBQyxVQURUO0FBRUksUUFBQSxTQUFTLEVBQUMsOENBRmQ7QUFHSSxRQUFBLFFBQVEsRUFBRSxLQUFLQyxtQkFIbkI7QUFJSSxRQUFBLEtBQUssRUFBRSxLQUFLakMsS0FBTCxDQUFXQyxVQUp0QjtBQUtJLFFBQUEsU0FBUyxFQUFFLElBTGY7QUFNSSxRQUFBLFlBQVksRUFBQyxjQU5qQjtBQU9JLFFBQUEsV0FBVyxFQUFFLHlCQUFHLGlCQUFIO0FBUGpCLFFBREosRUFVSzJCLFNBVkwsZUFXSSw2QkFBQyxhQUFEO0FBQ0ksUUFBQSxhQUFhLEVBQUUseUJBQUcsVUFBSCxDQURuQjtBQUVJLFFBQUEsb0JBQW9CLEVBQUUsS0FBS0ksaUJBRi9CO0FBR0ksUUFBQSxTQUFTLEVBQUUsSUFIZjtBQUlJLFFBQUEsUUFBUSxFQUFFLEtBQUtFLFNBSm5CO0FBS0ksUUFBQSxLQUFLLEVBQUUsS0FMWDtBQU1JLFFBQUEsZUFBZSxFQUFFLEtBQUtsQyxLQUFMLENBQVdDLFVBQVgsQ0FBc0JaLE1BQXRCLEtBQWlDO0FBTnRELFFBWEosQ0FiTSxDQUFWO0FBa0NILEtBcERELE1Bb0RPO0FBQ0htQyxNQUFBQSxLQUFLLEdBQUcseUJBQUcsY0FBSCxDQUFSO0FBQ0FDLE1BQUFBLFVBQVUsR0FBRyxDQUFDLDJGQUFELENBQWI7QUFDQSxZQUFNQyxhQUFhLEdBQUdSLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw4QkFBakIsQ0FBdEI7QUFFQSxZQUFNZ0IsZUFBZSxHQUFHLHlCQUFXO0FBQy9CLDREQUFvRCxJQURyQjtBQUUvQixrRUFBMEQsS0FBS25DLEtBQUwsQ0FBV1Isa0JBQVgsS0FBa0MsSUFGN0Q7QUFHL0Isb0VBQTRELEtBQUtRLEtBQUwsQ0FBV1Isa0JBQVgsS0FBa0M7QUFIL0QsT0FBWCxDQUF4Qjs7QUFLQSxZQUFNNEMsbUJBQW1CLGdCQUFHO0FBQUssUUFBQSxTQUFTLEVBQUVEO0FBQWhCLFNBQ3ZCLEtBQUtwQixvQkFBTCxFQUR1QixDQUE1Qjs7QUFJQVEsTUFBQUEsT0FBTyxnQkFBRyx1REFDTix3Q0FBSSx5QkFBRyxvQ0FBSCxDQUFKLENBRE0sZUFHTjtBQUNJLFFBQUEsU0FBUyxFQUFDLCtDQURkO0FBRUksUUFBQSxRQUFRLEVBQUUsS0FBS2Msa0JBRm5CO0FBR0ksUUFBQSxVQUFVLEVBQUUsS0FIaEI7QUFJSSxRQUFBLFlBQVksRUFBQztBQUpqQixzQkFNSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLDZCQUFDLGNBQUQ7QUFDSSxRQUFBLElBQUksRUFBQyxVQURUO0FBRUksUUFBQSxLQUFLLEVBQUUseUJBQUcsY0FBSCxDQUZYO0FBR0ksUUFBQSxLQUFLLEVBQUUsS0FBS3JDLEtBQUwsQ0FBV25CLFdBSHRCO0FBSUksUUFBQSxRQUFRLEVBQUUsS0FBS3lELG9CQUpuQjtBQUtJLFFBQUEsYUFBYSxFQUFFLEtBQUt0QyxLQUFMLENBQVdSLGtCQUw5QjtBQU1JLFFBQUEsWUFBWSxFQUFDO0FBTmpCLFFBREosQ0FESixlQVdJO0FBQU0sUUFBQSxTQUFTLEVBQUM7QUFBaEIsU0FDSyx5QkFBRyxJQUFILENBREwsQ0FYSixlQWNJLHVEQUNJO0FBQU8sUUFBQSxJQUFJLEVBQUMsTUFBWjtBQUNJLFFBQUEsU0FBUyxFQUFDLHlEQURkO0FBRUksUUFBQSxHQUFHLEVBQUUsS0FBS1AsV0FGZDtBQUdJLFFBQUEsUUFBUSxFQUFFLEtBQUtzRDtBQUhuQixRQURKLGVBTUksNkJBQUMseUJBQUQ7QUFBa0IsUUFBQSxJQUFJLEVBQUMsU0FBdkI7QUFBaUMsUUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFBL0MsU0FDSyx5QkFBRyxRQUFILENBREwsQ0FOSixDQWRKLENBTkosRUErQktKLG1CQS9CTCxlQWdDSSw2QkFBQyxhQUFEO0FBQ0ksUUFBQSxhQUFhLEVBQUUseUJBQUcsVUFBSCxDQURuQjtBQUVJLFFBQUEsb0JBQW9CLEVBQUUsS0FBS0Msa0JBRi9CO0FBR0ksUUFBQSxTQUFTLEVBQUUsSUFIZjtBQUlJLFFBQUEsWUFBWSxFQUFFLHlCQUFHLFNBQUgsQ0FKbEI7QUFLSSxRQUFBLGlCQUFpQixFQUFDLFFBTHRCO0FBTUksUUFBQSxRQUFRLEVBQUUsS0FBS0gsU0FObkI7QUFPSSxRQUFBLEtBQUssRUFBRSxLQVBYO0FBUUksUUFBQSxlQUFlLEVBQUUsQ0FBQyxLQUFLbEMsS0FBTCxDQUFXUDtBQVJqQyxRQWhDSixDQUhNLENBQVY7QUErQ0g7O0FBRUQsd0JBQ0ksNkJBQUMsVUFBRDtBQUFZLE1BQUEsU0FBUyxFQUFDLDhCQUF0QjtBQUNJLE1BQUEsVUFBVSxFQUFFLEtBQUtsQixLQUFMLENBQVdDLFVBRDNCO0FBRUksTUFBQSxLQUFLLEVBQUVnRCxLQUZYO0FBR0ksTUFBQSxVQUFVLEVBQUVDO0FBSGhCLG9CQUtBLDBDQUNLRixPQURMLENBTEEsQ0FESjtBQVdIOztBQXJUc0U7Ozs4QkFBdERwRCx5QixlQUNFO0FBQ2Y7QUFDQTJDLEVBQUFBLE9BQU8sRUFBRTJCLG1CQUFVQyxNQUFWLENBQWlCQyxVQUZYO0FBR2Y7QUFDQXRDLEVBQUFBLGVBQWUsRUFBRW9DLG1CQUFVRyxJQUFWLENBQWVEO0FBSmpCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtkZWJvdW5jZX0gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tIFwicHJvcC10eXBlc1wiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IEZpZWxkIGZyb20gJy4uLy4uL2VsZW1lbnRzL0ZpZWxkJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5cbi8vIE1heGltdW0gYWNjZXB0YWJsZSBzaXplIG9mIGEga2V5IGZpbGUuIEl0J3MgNTkgY2hhcmFjdGVycyBpbmNsdWRpbmcgdGhlIHNwYWNlcyB3ZSBlbmNvZGUsXG4vLyBzbyB0aGlzIHNob3VsZCBiZSBwbGVudHkgYW5kIGFsbG93IGZvciBwZW9wbGUgcHV0dGluZyBleHRyYSB3aGl0ZXNwYWNlIGluIHRoZSBmaWxlIGJlY2F1c2Vcbi8vIG1heWJlIHRoYXQncyBhIHRoaW5nIHBlb3BsZSB3b3VsZCBkbz9cbmNvbnN0IEtFWV9GSUxFX01BWF9TSVpFID0gMTI4O1xuXG4vLyBEb24ndCBzaG91dCBhdCB0aGUgdXNlciB0aGF0IHRoZWlyIGtleSBpcyBpbnZhbGlkIGV2ZXJ5IHRpbWUgdGhleSB0eXBlIGEga2V5OiB3YWl0IGEgc2hvcnQgdGltZVxuY29uc3QgVkFMSURBVElPTl9USFJPVFRMRV9NUyA9IDIwMDtcblxuLypcbiAqIEFjY2VzcyBTZWN1cmUgU2VjcmV0IFN0b3JhZ2UgYnkgcmVxdWVzdGluZyB0aGUgdXNlcidzIHBhc3NwaHJhc2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyB7IHBhc3NwaHJhc2UsIHB1YmtleSB9XG4gICAgICAgIGtleUluZm86IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgLy8gRnVuY3Rpb24gZnJvbSBvbmUgb2YgeyBwYXNzcGhyYXNlLCByZWNvdmVyeUtleSB9IC0+IGJvb2xlYW5cbiAgICAgICAgY2hlY2tQcml2YXRlS2V5OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl9maWxlVXBsb2FkID0gUmVhY3QuY3JlYXRlUmVmKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5OiBcIlwiLFxuICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogbnVsbCxcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5Q29ycmVjdDogbnVsbCxcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5RmlsZUVycm9yOiBudWxsLFxuICAgICAgICAgICAgZm9yY2VSZWNvdmVyeUtleTogZmFsc2UsXG4gICAgICAgICAgICBwYXNzUGhyYXNlOiAnJyxcbiAgICAgICAgICAgIGtleU1hdGNoZXM6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX29uQ2FuY2VsID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH1cblxuICAgIF9vblVzZVJlY292ZXJ5S2V5Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZm9yY2VSZWNvdmVyeUtleTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3ZhbGlkYXRlUmVjb3ZlcnlLZXlPbkNoYW5nZSA9IGRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fdmFsaWRhdGVSZWNvdmVyeUtleSgpO1xuICAgIH0sIFZBTElEQVRJT05fVEhST1RUTEVfTVMpO1xuXG4gICAgYXN5bmMgX3ZhbGlkYXRlUmVjb3ZlcnlLZXkoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5ID09PSAnJykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogbnVsbCxcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleUNvcnJlY3Q6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCBkZWNvZGVkS2V5ID0gY2xpLmtleUJhY2t1cEtleUZyb21SZWNvdmVyeUtleSh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5KTtcbiAgICAgICAgICAgIGNvbnN0IGNvcnJlY3QgPSBhd2FpdCBjbGkuY2hlY2tTZWNyZXRTdG9yYWdlS2V5KFxuICAgICAgICAgICAgICAgIGRlY29kZWRLZXksIHRoaXMucHJvcHMua2V5SW5mbyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleVZhbGlkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5Q29ycmVjdDogY29ycmVjdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleVZhbGlkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleUNvcnJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25SZWNvdmVyeUtleUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmVjb3ZlcnlLZXk6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICAgICAgcmVjb3ZlcnlLZXlGaWxlRXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGFsc28gY2xlYXIgdGhlIGZpbGUgdXBsb2FkIGNvbnRyb2wgc28gdGhhdCB0aGUgdXNlciBjYW4gdXBsb2FkIHRoZSBzYW1lIGZpbGVcbiAgICAgICAgLy8gdGhlIGRpZCBiZWZvcmUgKG90aGVyd2lzZSB0aGUgb25jaGFuZ2Ugd291bGRuJ3QgZmlyZSlcbiAgICAgICAgaWYgKHRoaXMuX2ZpbGVVcGxvYWQuY3VycmVudCkgdGhpcy5fZmlsZVVwbG9hZC5jdXJyZW50LnZhbHVlID0gbnVsbDtcblxuICAgICAgICAvLyBXZSBkb24ndCB1c2UgRmllbGQncyB2YWxpZGF0aW9uIGhlcmUgYmVjYXVzZSBhKSB3ZSB3YW50IGl0IGluIGEgc2VwYXJhdGUgcGxhY2UgcmF0aGVyXG4gICAgICAgIC8vIHRoYW4gaW4gYSB0b29sdGlwIGFuZCBiKSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgZmVlZGJhY2sgYmFzZWQgb24gdGhlIHVwbG9hZGVkIGZpbGVcbiAgICAgICAgLy8gYXMgd2VsbCBhcyB0aGUgdGV4dCBib3guIElkZWFsbHkgd2Ugd291bGQgcmVmYWN0b3IgRmllbGQncyB2YWxpZGF0aW9uIGxvZ2ljIHNvIHdlIGNvdWxkXG4gICAgICAgIC8vIHJlLXVzZSBzb21lIG9mIGl0LlxuICAgICAgICB0aGlzLl92YWxpZGF0ZVJlY292ZXJ5S2V5T25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBfb25SZWNvdmVyeUtleUZpbGVDaGFuZ2UgPSBhc3luYyBlID0+IHtcbiAgICAgICAgaWYgKGUudGFyZ2V0LmZpbGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGYgPSBlLnRhcmdldC5maWxlc1swXTtcblxuICAgICAgICBpZiAoZi5zaXplID4gS0VZX0ZJTEVfTUFYX1NJWkUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5RmlsZUVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5Q29ycmVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRzID0gYXdhaXQgZi50ZXh0KCk7XG4gICAgICAgICAgICAvLyB0ZXN0IGl0J3Mgd2l0aGluIHRoZSBiYXNlNTggYWxwaGFiZXQuIFdlIGNvdWxkIGJlIG1vcmUgc3RyaWN0IGhlcmUsIGVnLiByZXF1aXJlIHRoZVxuICAgICAgICAgICAgLy8gcmlnaHQgbnVtYmVyIG9mIGNoYXJhY3RlcnMsIGJ1dCBpdCdzIHJlYWxseSBqdXN0IHRvIG1ha2Ugc3VyZSB0aGF0IHdoYXQgd2UncmUgcmVhZGluZyBpc1xuICAgICAgICAgICAgLy8gdGV4dCBiZWNhdXNlIHdlJ2xsIHB1dCBpdCBpbiB0aGUgdGV4dCBmaWVsZC5cbiAgICAgICAgICAgIGlmICgvXlsxMjM0NTY3ODlBQkNERUZHSEpLTE1OUFFSU1RVVldYWVphYmNkZWZnaGlqa21ub3BxcnN0dXZ3eHl6XFxzXSskLy50ZXN0KGNvbnRlbnRzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICByZWNvdmVyeUtleUZpbGVFcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXk6IGNvbnRlbnRzLnRyaW0oKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl92YWxpZGF0ZVJlY292ZXJ5S2V5KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICByZWNvdmVyeUtleUZpbGVFcnJvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlDb3JyZWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5OiAnJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblJlY292ZXJ5S2V5RmlsZVVwbG9hZENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl9maWxlVXBsb2FkLmN1cnJlbnQuY2xpY2soKTtcbiAgICB9XG5cbiAgICBfb25QYXNzUGhyYXNlTmV4dCA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wYXNzUGhyYXNlLmxlbmd0aCA8PSAwKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGtleU1hdGNoZXM6IG51bGwgfSk7XG4gICAgICAgIGNvbnN0IGlucHV0ID0geyBwYXNzcGhyYXNlOiB0aGlzLnN0YXRlLnBhc3NQaHJhc2UgfTtcbiAgICAgICAgY29uc3Qga2V5TWF0Y2hlcyA9IGF3YWl0IHRoaXMucHJvcHMuY2hlY2tQcml2YXRlS2V5KGlucHV0KTtcbiAgICAgICAgaWYgKGtleU1hdGNoZXMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChpbnB1dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsga2V5TWF0Y2hlcyB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblJlY292ZXJ5S2V5TmV4dCA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBrZXlNYXRjaGVzOiBudWxsIH0pO1xuICAgICAgICBjb25zdCBpbnB1dCA9IHsgcmVjb3ZlcnlLZXk6IHRoaXMuc3RhdGUucmVjb3ZlcnlLZXkgfTtcbiAgICAgICAgY29uc3Qga2V5TWF0Y2hlcyA9IGF3YWl0IHRoaXMucHJvcHMuY2hlY2tQcml2YXRlS2V5KGlucHV0KTtcbiAgICAgICAgaWYgKGtleU1hdGNoZXMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChpbnB1dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsga2V5TWF0Y2hlcyB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblBhc3NQaHJhc2VDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2U6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICAgICAga2V5TWF0Y2hlczogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0S2V5VmFsaWRhdGlvblRleHQoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5RmlsZUVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJXcm9uZyBmaWxlIHR5cGVcIik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5yZWNvdmVyeUtleUNvcnJlY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIkxvb2tzIGdvb2QhXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiV3JvbmcgU2VjdXJpdHkgS2V5XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiSW52YWxpZCBTZWN1cml0eSBLZXlcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcblxuICAgICAgICBjb25zdCBoYXNQYXNzcGhyYXNlID0gKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlJbmZvICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLmtleUluZm8ucGFzc3BocmFzZSAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlJbmZvLnBhc3NwaHJhc2Uuc2FsdCAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlJbmZvLnBhc3NwaHJhc2UuaXRlcmF0aW9uc1xuICAgICAgICApO1xuXG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBsZXQgdGl0bGU7XG4gICAgICAgIGxldCB0aXRsZUNsYXNzO1xuICAgICAgICBpZiAoaGFzUGFzc3BocmFzZSAmJiAhdGhpcy5zdGF0ZS5mb3JjZVJlY292ZXJ5S2V5KSB7XG4gICAgICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuICAgICAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJTZWN1cml0eSBQaHJhc2VcIik7XG4gICAgICAgICAgICB0aXRsZUNsYXNzID0gWydteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3RpdGxlV2l0aEljb24gbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19zZWN1cmVQaHJhc2VUaXRsZSddO1xuXG4gICAgICAgICAgICBsZXQga2V5U3RhdHVzO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUua2V5TWF0Y2hlcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBrZXlTdGF0dXMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfa2V5U3RhdHVzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtcIlxcdUQ4M0RcXHVEQzRFIFwifXtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVW5hYmxlIHRvIGFjY2VzcyBzZWNyZXQgc3RvcmFnZS4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJQbGVhc2UgdmVyaWZ5IHRoYXQgeW91IGVudGVyZWQgdGhlIGNvcnJlY3QgU2VjdXJpdHkgUGhyYXNlLlwiLFxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX2tleVN0YXR1c1wiIC8+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiRW50ZXIgeW91ciBTZWN1cml0eSBQaHJhc2Ugb3IgPGJ1dHRvbj5Vc2UgeW91ciBTZWN1cml0eSBLZXk8L2J1dHRvbj4gdG8gY29udGludWUuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b246IHMgPT4gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfbGlua0J1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInNwYW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uVXNlUmVjb3ZlcnlLZXlDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c31cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKX08L3A+XG5cbiAgICAgICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3ByaW1hcnlDb250YWluZXJcIiBvblN1Ym1pdD17dGhpcy5fb25QYXNzUGhyYXNlTmV4dH0+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcGFzc1BocmFzZUlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vblBhc3NQaHJhc2VDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIlNlY3VyaXR5IFBocmFzZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAge2tleVN0YXR1c31cbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdDb250aW51ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uUGFzc1BocmFzZU5leHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1cz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5RGlzYWJsZWQ9e3RoaXMuc3RhdGUucGFzc1BocmFzZS5sZW5ndGggPT09IDB9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlNlY3VyaXR5IEtleVwiKTtcbiAgICAgICAgICAgIHRpdGxlQ2xhc3MgPSBbJ214X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfdGl0bGVXaXRoSWNvbiBteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3NlY3VyZUJhY2t1cFRpdGxlJ107XG4gICAgICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuXG4gICAgICAgICAgICBjb25zdCBmZWVkYmFja0NsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICAnbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19yZWNvdmVyeUtleUZlZWRiYWNrJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19yZWNvdmVyeUtleUZlZWRiYWNrX3ZhbGlkJzogdGhpcy5zdGF0ZS5yZWNvdmVyeUtleUNvcnJlY3QgPT09IHRydWUsXG4gICAgICAgICAgICAgICAgJ214X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlGZWVkYmFja19pbnZhbGlkJzogdGhpcy5zdGF0ZS5yZWNvdmVyeUtleUNvcnJlY3QgPT09IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCByZWNvdmVyeUtleUZlZWRiYWNrID0gPGRpdiBjbGFzc05hbWU9e2ZlZWRiYWNrQ2xhc3Nlc30+XG4gICAgICAgICAgICAgICAge3RoaXMuZ2V0S2V5VmFsaWRhdGlvblRleHQoKX1cbiAgICAgICAgICAgIDwvZGl2PjtcblxuICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiVXNlIHlvdXIgU2VjdXJpdHkgS2V5IHRvIGNvbnRpbnVlLlwiKX08L3A+XG5cbiAgICAgICAgICAgICAgICA8Zm9ybVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3ByaW1hcnlDb250YWluZXJcIlxuICAgICAgICAgICAgICAgICAgICBvblN1Ym1pdD17dGhpcy5fb25SZWNvdmVyeUtleU5leHR9XG4gICAgICAgICAgICAgICAgICAgIHNwZWxsQ2hlY2s9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5RW50cnlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19yZWNvdmVyeUtleUVudHJ5X3RleHRJbnB1dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ1NlY3VyaXR5IEtleScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5yZWNvdmVyeUtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uUmVjb3ZlcnlLZXlDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlVmFsaWRpdHk9e3RoaXMuc3RhdGUucmVjb3ZlcnlLZXlDb3JyZWN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlFbnRyeV9lbnRyeUNvbnRyb2xTZXBhcmF0b3JUZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwib3JcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlFbnRyeV9maWxlSW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuX2ZpbGVVcGxvYWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vblJlY292ZXJ5S2V5RmlsZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5fb25SZWNvdmVyeUtleUZpbGVVcGxvYWRDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlVwbG9hZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtyZWNvdmVyeUtleUZlZWRiYWNrfVxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ0NvbnRpbnVlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5fb25SZWNvdmVyeUtleU5leHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b249e190KFwiR28gQmFja1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbkNsYXNzPSdkYW5nZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1cz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5RGlzYWJsZWQ9eyF0aGlzLnN0YXRlLnJlY292ZXJ5S2V5VmFsaWR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZydcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgICAgIHRpdGxlQ2xhc3M9e3RpdGxlQ2xhc3N9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
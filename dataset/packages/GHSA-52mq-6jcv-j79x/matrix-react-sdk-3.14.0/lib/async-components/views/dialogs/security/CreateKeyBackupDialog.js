"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _fileSaver = _interopRequireDefault(require("file-saver"));

var sdk = _interopRequireWildcard(require("../../../../index"));

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../../languageHandler");

var _SecurityManager = require("../../../../SecurityManager");

var _AccessibleButton = _interopRequireDefault(require("../../../../components/views/elements/AccessibleButton"));

var _strings = require("../../../../utils/strings");

var _PassphraseField = _interopRequireDefault(require("../../../../components/views/auth/PassphraseField"));

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
const PHASE_PASSPHRASE = 0;
const PHASE_PASSPHRASE_CONFIRM = 1;
const PHASE_SHOWKEY = 2;
const PHASE_KEEPITSAFE = 3;
const PHASE_BACKINGUP = 4;
const PHASE_DONE = 5;
const PHASE_OPTOUT_CONFIRM = 6;
const PASSWORD_MIN_SCORE = 4; // So secure, many characters, much complex, wow, etc, etc.

/*
 * Walks the user through the process of creating an e2e key backup
 * on the server.
 */

class CreateKeyBackupDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_collectRecoveryKeyNode", n => {
      this._recoveryKeyNode = n;
    });
    (0, _defineProperty2.default)(this, "_onCopyClick", () => {
      const successful = (0, _strings.copyNode)(this._recoveryKeyNode);

      if (successful) {
        this.setState({
          copied: true,
          phase: PHASE_KEEPITSAFE
        });
      }
    });
    (0, _defineProperty2.default)(this, "_onDownloadClick", () => {
      const blob = new Blob([this._keyBackupInfo.recovery_key], {
        type: 'text/plain;charset=us-ascii'
      });

      _fileSaver.default.saveAs(blob, 'security-key.txt');

      this.setState({
        downloaded: true,
        phase: PHASE_KEEPITSAFE
      });
    });
    (0, _defineProperty2.default)(this, "_createBackup", async () => {
      const {
        secureSecretStorage
      } = this.state;
      this.setState({
        phase: PHASE_BACKINGUP,
        error: null
      });
      let info;

      try {
        if (secureSecretStorage) {
          await (0, _SecurityManager.accessSecretStorage)(async () => {
            info = await _MatrixClientPeg.MatrixClientPeg.get().prepareKeyBackupVersion(null
            /* random key */
            , {
              secureSecretStorage: true
            });
            info = await _MatrixClientPeg.MatrixClientPeg.get().createKeyBackupVersion(info);
          });
        } else {
          info = await _MatrixClientPeg.MatrixClientPeg.get().createKeyBackupVersion(this._keyBackupInfo);
        }

        await _MatrixClientPeg.MatrixClientPeg.get().scheduleAllGroupSessionsForBackup();
        this.setState({
          phase: PHASE_DONE
        });
      } catch (e) {
        console.error("Error creating key backup", e); // TODO: If creating a version succeeds, but backup fails, should we
        // delete the version, disable backup, or do nothing?  If we just
        // disable without deleting, we'll enable on next app reload since
        // it is trusted.

        if (info) {
          _MatrixClientPeg.MatrixClientPeg.get().deleteKeyBackupVersion(info.version);
        }

        this.setState({
          error: e
        });
      }
    });
    (0, _defineProperty2.default)(this, "_onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onDone", () => {
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "_onOptOutClick", () => {
      this.setState({
        phase: PHASE_OPTOUT_CONFIRM
      });
    });
    (0, _defineProperty2.default)(this, "_onSetUpClick", () => {
      this.setState({
        phase: PHASE_PASSPHRASE
      });
    });
    (0, _defineProperty2.default)(this, "_onSkipPassPhraseClick", async () => {
      this._keyBackupInfo = await _MatrixClientPeg.MatrixClientPeg.get().prepareKeyBackupVersion();
      this.setState({
        copied: false,
        downloaded: false,
        phase: PHASE_SHOWKEY
      });
    });
    (0, _defineProperty2.default)(this, "_onPassPhraseNextClick", async e => {
      e.preventDefault();
      if (!this._passphraseField.current) return; // unmounting

      await this._passphraseField.current.validate({
        allowEmpty: false
      });

      if (!this._passphraseField.current.state.valid) {
        this._passphraseField.current.focus();

        this._passphraseField.current.validate({
          allowEmpty: false,
          focused: true
        });

        return;
      }

      this.setState({
        phase: PHASE_PASSPHRASE_CONFIRM
      });
    });
    (0, _defineProperty2.default)(this, "_onPassPhraseConfirmNextClick", async e => {
      e.preventDefault();
      if (this.state.passPhrase !== this.state.passPhraseConfirm) return;
      this._keyBackupInfo = await _MatrixClientPeg.MatrixClientPeg.get().prepareKeyBackupVersion(this.state.passPhrase);
      this.setState({
        copied: false,
        downloaded: false,
        phase: PHASE_SHOWKEY
      });
    });
    (0, _defineProperty2.default)(this, "_onSetAgainClick", () => {
      this.setState({
        passPhrase: '',
        passPhraseValid: false,
        passPhraseConfirm: '',
        phase: PHASE_PASSPHRASE
      });
    });
    (0, _defineProperty2.default)(this, "_onKeepItSafeBackClick", () => {
      this.setState({
        phase: PHASE_SHOWKEY
      });
    });
    (0, _defineProperty2.default)(this, "_onPassPhraseValidate", result => {
      this.setState({
        passPhraseValid: result.valid
      });
    });
    (0, _defineProperty2.default)(this, "_onPassPhraseChange", e => {
      this.setState({
        passPhrase: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_onPassPhraseConfirmChange", e => {
      this.setState({
        passPhraseConfirm: e.target.value
      });
    });
    this._recoveryKeyNode = null;
    this._keyBackupInfo = null;
    this.state = {
      secureSecretStorage: null,
      phase: PHASE_PASSPHRASE,
      passPhrase: '',
      passPhraseValid: false,
      passPhraseConfirm: '',
      copied: false,
      downloaded: false
    };
    this._passphraseField = /*#__PURE__*/(0, _react.createRef)();
  }

  async componentDidMount() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const secureSecretStorage = await cli.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing");
    this.setState({
      secureSecretStorage
    }); // If we're using secret storage, skip ahead to the backing up step, as
    // `accessSecretStorage` will handle passphrases as needed.

    if (secureSecretStorage) {
      this.setState({
        phase: PHASE_BACKINGUP
      });

      this._createBackup();
    }
  }

  _renderPhasePassPhrase() {
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onPassPhraseNextClick
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("<b>Warning</b>: You should only set up key backup from a trusted computer.", {}, {
      b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We'll store an encrypted copy of your keys on our server. " + "Secure your backup with a Security Phrase.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("For maximum security, this should be different from your account password.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_primaryContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_passPhraseContainer"
    }, /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
      className: "mx_CreateKeyBackupDialog_passPhraseInput",
      onChange: this._onPassPhraseChange,
      minScore: PASSWORD_MIN_SCORE,
      value: this.state.passPhrase,
      onValidate: this._onPassPhraseValidate,
      fieldRef: this._passphraseField,
      autoFocus: true,
      label: (0, _languageHandler._td)("Enter a Security Phrase"),
      labelEnterPassword: (0, _languageHandler._td)("Enter a Security Phrase"),
      labelStrongPassword: (0, _languageHandler._td)("Great! This Security Phrase looks strong enough."),
      labelAllowedButUnsafe: (0, _languageHandler._td)("Great! This Security Phrase looks strong enough.")
    }))), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)('Next'),
      onPrimaryButtonClick: this._onPassPhraseNextClick,
      hasCancel: false,
      disabled: !this.state.passPhraseValid
    }), /*#__PURE__*/_react.default.createElement("details", null, /*#__PURE__*/_react.default.createElement("summary", null, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: this._onSkipPassPhraseClick
    }, (0, _languageHandler._t)("Set up with a Security Key"))));
  }

  _renderPhasePassPhraseConfirm() {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    let matchText;
    let changeText;

    if (this.state.passPhraseConfirm === this.state.passPhrase) {
      matchText = (0, _languageHandler._t)("That matches!");
      changeText = (0, _languageHandler._t)("Use a different passphrase?");
    } else if (!this.state.passPhrase.startsWith(this.state.passPhraseConfirm)) {
      // only tell them they're wrong if they've actually gone wrong.
      // Security concious readers will note that if you left element-web unattended
      // on this screen, this would make it easy for a malicious person to guess
      // your passphrase one letter at a time, but they could get this faster by
      // just opening the browser's developer tools and reading it.
      // Note that not having typed anything at all will not hit this clause and
      // fall through so empty box === no hint.
      matchText = (0, _languageHandler._t)("That doesn't match.");
      changeText = (0, _languageHandler._t)("Go back to set it again.");
    }

    let passPhraseMatch = null;

    if (matchText) {
      passPhraseMatch = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CreateKeyBackupDialog_passPhraseMatch"
      }, /*#__PURE__*/_react.default.createElement("div", null, matchText), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        element: "span",
        className: "mx_linkButton",
        onClick: this._onSetAgainClick
      }, changeText)));
    }

    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onPassPhraseConfirmNextClick
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please enter your Security Phrase a second time to confirm.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_primaryContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_passPhraseContainer"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("input", {
      type: "password",
      onChange: this._onPassPhraseConfirmChange,
      value: this.state.passPhraseConfirm,
      className: "mx_CreateKeyBackupDialog_passPhraseInput",
      placeholder: (0, _languageHandler._t)("Repeat your Security Phrase..."),
      autoFocus: true
    })), passPhraseMatch)), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)('Next'),
      onPrimaryButtonClick: this._onPassPhraseConfirmNextClick,
      hasCancel: false,
      disabled: this.state.passPhrase !== this.state.passPhraseConfirm
    }));
  }

  _renderPhaseShowKey() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your Security Key is a safety net - you can use it to restore " + "access to your encrypted messages if you forget your Security Phrase.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Keep a copy of it somewhere secure, like a password manager or even a safe.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_primaryContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_recoveryKeyHeader"
    }, (0, _languageHandler._t)("Your Security Key")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_recoveryKeyContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_recoveryKey"
    }, /*#__PURE__*/_react.default.createElement("code", {
      ref: this._collectRecoveryKeyNode
    }, this._keyBackupInfo.recovery_key)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_recoveryKeyButtons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "mx_Dialog_primary",
      onClick: this._onCopyClick
    }, (0, _languageHandler._t)("Copy")), /*#__PURE__*/_react.default.createElement("button", {
      className: "mx_Dialog_primary",
      onClick: this._onDownloadClick
    }, (0, _languageHandler._t)("Download"))))));
  }

  _renderPhaseKeepItSafe() {
    let introText;

    if (this.state.copied) {
      introText = (0, _languageHandler._t)("Your Security Key has been <b>copied to your clipboard</b>, paste it to:", {}, {
        b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
      });
    } else if (this.state.downloaded) {
      introText = (0, _languageHandler._t)("Your Security Key is in your <b>Downloads</b> folder.", {}, {
        b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
      });
    }

    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    return /*#__PURE__*/_react.default.createElement("div", null, introText, /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("<b>Print it</b> and store it somewhere safe", {}, {
      b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
    })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("<b>Save it</b> on a USB key or backup drive", {}, {
      b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
    })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("<b>Copy it</b> to your personal cloud storage", {}, {
      b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
    }))), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)("Continue"),
      onPrimaryButtonClick: this._createBackup,
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._onKeepItSafeBackClick
    }, (0, _languageHandler._t)("Back"))));
  }

  _renderBusyPhase(text) {
    const Spinner = sdk.getComponent('views.elements.Spinner');
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Spinner, null));
  }

  _renderPhaseDone() {
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your keys are being backed up (the first backup could take a few minutes).")), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)('OK'),
      onPrimaryButtonClick: this._onDone,
      hasCancel: false
    }));
  }

  _renderPhaseOptOutConfirm() {
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Without setting up Secure Message Recovery, you won't be able to restore your " + "encrypted message history if you log out or use another session."), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)('Set up Secure Message Recovery'),
      onPrimaryButtonClick: this._onSetUpClick,
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._onCancel
    }, "I understand, continue without")));
  }

  _titleForPhase(phase) {
    switch (phase) {
      case PHASE_PASSPHRASE:
        return (0, _languageHandler._t)('Secure your backup with a Security Phrase');

      case PHASE_PASSPHRASE_CONFIRM:
        return (0, _languageHandler._t)('Confirm your Security Phrase');

      case PHASE_OPTOUT_CONFIRM:
        return (0, _languageHandler._t)('Warning!');

      case PHASE_SHOWKEY:
      case PHASE_KEEPITSAFE:
        return (0, _languageHandler._t)('Make a copy of your Security Key');

      case PHASE_BACKINGUP:
        return (0, _languageHandler._t)('Starting backup...');

      case PHASE_DONE:
        return (0, _languageHandler._t)('Success!');

      default:
        return (0, _languageHandler._t)("Create key backup");
    }
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    let content;

    if (this.state.error) {
      const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to create key backup")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Retry'),
        onPrimaryButtonClick: this._createBackup,
        hasCancel: true,
        onCancel: this._onCancel
      })));
    } else {
      switch (this.state.phase) {
        case PHASE_PASSPHRASE:
          content = this._renderPhasePassPhrase();
          break;

        case PHASE_PASSPHRASE_CONFIRM:
          content = this._renderPhasePassPhraseConfirm();
          break;

        case PHASE_SHOWKEY:
          content = this._renderPhaseShowKey();
          break;

        case PHASE_KEEPITSAFE:
          content = this._renderPhaseKeepItSafe();
          break;

        case PHASE_BACKINGUP:
          content = this._renderBusyPhase();
          break;

        case PHASE_DONE:
          content = this._renderPhaseDone();
          break;

        case PHASE_OPTOUT_CONFIRM:
          content = this._renderPhaseOptOutConfirm();
          break;
      }
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_CreateKeyBackupDialog",
      onFinished: this.props.onFinished,
      title: this._titleForPhase(this.state.phase),
      hasCancel: [PHASE_PASSPHRASE, PHASE_DONE].includes(this.state.phase)
    }, /*#__PURE__*/_react.default.createElement("div", null, content));
  }

}

exports.default = CreateKeyBackupDialog;
(0, _defineProperty2.default)(CreateKeyBackupDialog, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQ3JlYXRlS2V5QmFja3VwRGlhbG9nLmpzIl0sIm5hbWVzIjpbIlBIQVNFX1BBU1NQSFJBU0UiLCJQSEFTRV9QQVNTUEhSQVNFX0NPTkZJUk0iLCJQSEFTRV9TSE9XS0VZIiwiUEhBU0VfS0VFUElUU0FGRSIsIlBIQVNFX0JBQ0tJTkdVUCIsIlBIQVNFX0RPTkUiLCJQSEFTRV9PUFRPVVRfQ09ORklSTSIsIlBBU1NXT1JEX01JTl9TQ09SRSIsIkNyZWF0ZUtleUJhY2t1cERpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJuIiwiX3JlY292ZXJ5S2V5Tm9kZSIsInN1Y2Nlc3NmdWwiLCJzZXRTdGF0ZSIsImNvcGllZCIsInBoYXNlIiwiYmxvYiIsIkJsb2IiLCJfa2V5QmFja3VwSW5mbyIsInJlY292ZXJ5X2tleSIsInR5cGUiLCJGaWxlU2F2ZXIiLCJzYXZlQXMiLCJkb3dubG9hZGVkIiwic2VjdXJlU2VjcmV0U3RvcmFnZSIsInN0YXRlIiwiZXJyb3IiLCJpbmZvIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwicHJlcGFyZUtleUJhY2t1cFZlcnNpb24iLCJjcmVhdGVLZXlCYWNrdXBWZXJzaW9uIiwic2NoZWR1bGVBbGxHcm91cFNlc3Npb25zRm9yQmFja3VwIiwiZSIsImNvbnNvbGUiLCJkZWxldGVLZXlCYWNrdXBWZXJzaW9uIiwidmVyc2lvbiIsIm9uRmluaXNoZWQiLCJwcmV2ZW50RGVmYXVsdCIsIl9wYXNzcGhyYXNlRmllbGQiLCJjdXJyZW50IiwidmFsaWRhdGUiLCJhbGxvd0VtcHR5IiwidmFsaWQiLCJmb2N1cyIsImZvY3VzZWQiLCJwYXNzUGhyYXNlIiwicGFzc1BocmFzZUNvbmZpcm0iLCJwYXNzUGhyYXNlVmFsaWQiLCJyZXN1bHQiLCJ0YXJnZXQiLCJ2YWx1ZSIsImNvbXBvbmVudERpZE1vdW50IiwiY2xpIiwiZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUiLCJfY3JlYXRlQmFja3VwIiwiX3JlbmRlclBoYXNlUGFzc1BocmFzZSIsIkRpYWxvZ0J1dHRvbnMiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJfb25QYXNzUGhyYXNlTmV4dENsaWNrIiwiYiIsInN1YiIsIl9vblBhc3NQaHJhc2VDaGFuZ2UiLCJfb25QYXNzUGhyYXNlVmFsaWRhdGUiLCJfb25Ta2lwUGFzc1BocmFzZUNsaWNrIiwiX3JlbmRlclBoYXNlUGFzc1BocmFzZUNvbmZpcm0iLCJBY2Nlc3NpYmxlQnV0dG9uIiwibWF0Y2hUZXh0IiwiY2hhbmdlVGV4dCIsInN0YXJ0c1dpdGgiLCJwYXNzUGhyYXNlTWF0Y2giLCJfb25TZXRBZ2FpbkNsaWNrIiwiX29uUGFzc1BocmFzZUNvbmZpcm1OZXh0Q2xpY2siLCJfb25QYXNzUGhyYXNlQ29uZmlybUNoYW5nZSIsIl9yZW5kZXJQaGFzZVNob3dLZXkiLCJfY29sbGVjdFJlY292ZXJ5S2V5Tm9kZSIsIl9vbkNvcHlDbGljayIsIl9vbkRvd25sb2FkQ2xpY2siLCJfcmVuZGVyUGhhc2VLZWVwSXRTYWZlIiwiaW50cm9UZXh0IiwicyIsIl9vbktlZXBJdFNhZmVCYWNrQ2xpY2siLCJfcmVuZGVyQnVzeVBoYXNlIiwidGV4dCIsIlNwaW5uZXIiLCJfcmVuZGVyUGhhc2VEb25lIiwiX29uRG9uZSIsIl9yZW5kZXJQaGFzZU9wdE91dENvbmZpcm0iLCJfb25TZXRVcENsaWNrIiwiX29uQ2FuY2VsIiwiX3RpdGxlRm9yUGhhc2UiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwiY29udGVudCIsImluY2x1ZGVzIiwiUHJvcFR5cGVzIiwiZnVuYyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYUEsTUFBTUEsZ0JBQWdCLEdBQUcsQ0FBekI7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxDQUFqQztBQUNBLE1BQU1DLGFBQWEsR0FBRyxDQUF0QjtBQUNBLE1BQU1DLGdCQUFnQixHQUFHLENBQXpCO0FBQ0EsTUFBTUMsZUFBZSxHQUFHLENBQXhCO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLENBQW5CO0FBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsQ0FBN0I7QUFFQSxNQUFNQyxrQkFBa0IsR0FBRyxDQUEzQixDLENBQThCOztBQUU5QjtBQUNBO0FBQ0E7QUFDQTs7QUFDZSxNQUFNQyxxQkFBTixTQUFvQ0MsZUFBTUMsYUFBMUMsQ0FBd0Q7QUFLbkVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLG1FQWdDUUMsQ0FBRCxJQUFPO0FBQzdCLFdBQUtDLGdCQUFMLEdBQXdCRCxDQUF4QjtBQUNILEtBbENrQjtBQUFBLHdEQW9DSixNQUFNO0FBQ2pCLFlBQU1FLFVBQVUsR0FBRyx1QkFBUyxLQUFLRCxnQkFBZCxDQUFuQjs7QUFDQSxVQUFJQyxVQUFKLEVBQWdCO0FBQ1osYUFBS0MsUUFBTCxDQUFjO0FBQ1ZDLFVBQUFBLE1BQU0sRUFBRSxJQURFO0FBRVZDLFVBQUFBLEtBQUssRUFBRWY7QUFGRyxTQUFkO0FBSUg7QUFDSixLQTVDa0I7QUFBQSw0REE4Q0EsTUFBTTtBQUNyQixZQUFNZ0IsSUFBSSxHQUFHLElBQUlDLElBQUosQ0FBUyxDQUFDLEtBQUtDLGNBQUwsQ0FBb0JDLFlBQXJCLENBQVQsRUFBNkM7QUFDdERDLFFBQUFBLElBQUksRUFBRTtBQURnRCxPQUE3QyxDQUFiOztBQUdBQyx5QkFBVUMsTUFBVixDQUFpQk4sSUFBakIsRUFBdUIsa0JBQXZCOztBQUVBLFdBQUtILFFBQUwsQ0FBYztBQUNWVSxRQUFBQSxVQUFVLEVBQUUsSUFERjtBQUVWUixRQUFBQSxLQUFLLEVBQUVmO0FBRkcsT0FBZDtBQUlILEtBeERrQjtBQUFBLHlEQTBESCxZQUFZO0FBQ3hCLFlBQU07QUFBRXdCLFFBQUFBO0FBQUYsVUFBMEIsS0FBS0MsS0FBckM7QUFDQSxXQUFLWixRQUFMLENBQWM7QUFDVkUsUUFBQUEsS0FBSyxFQUFFZCxlQURHO0FBRVZ5QixRQUFBQSxLQUFLLEVBQUU7QUFGRyxPQUFkO0FBSUEsVUFBSUMsSUFBSjs7QUFDQSxVQUFJO0FBQ0EsWUFBSUgsbUJBQUosRUFBeUI7QUFDckIsZ0JBQU0sMENBQW9CLFlBQVk7QUFDbENHLFlBQUFBLElBQUksR0FBRyxNQUFNQyxpQ0FBZ0JDLEdBQWhCLEdBQXNCQyx1QkFBdEIsQ0FDVDtBQUFLO0FBREksY0FFVDtBQUFFTixjQUFBQSxtQkFBbUIsRUFBRTtBQUF2QixhQUZTLENBQWI7QUFJQUcsWUFBQUEsSUFBSSxHQUFHLE1BQU1DLGlDQUFnQkMsR0FBaEIsR0FBc0JFLHNCQUF0QixDQUE2Q0osSUFBN0MsQ0FBYjtBQUNILFdBTkssQ0FBTjtBQU9ILFNBUkQsTUFRTztBQUNIQSxVQUFBQSxJQUFJLEdBQUcsTUFBTUMsaUNBQWdCQyxHQUFoQixHQUFzQkUsc0JBQXRCLENBQ1QsS0FBS2IsY0FESSxDQUFiO0FBR0g7O0FBQ0QsY0FBTVUsaUNBQWdCQyxHQUFoQixHQUFzQkcsaUNBQXRCLEVBQU47QUFDQSxhQUFLbkIsUUFBTCxDQUFjO0FBQ1ZFLFVBQUFBLEtBQUssRUFBRWI7QUFERyxTQUFkO0FBR0gsT0FsQkQsQ0FrQkUsT0FBTytCLENBQVAsRUFBVTtBQUNSQyxRQUFBQSxPQUFPLENBQUNSLEtBQVIsQ0FBYywyQkFBZCxFQUEyQ08sQ0FBM0MsRUFEUSxDQUVSO0FBQ0E7QUFDQTtBQUNBOztBQUNBLFlBQUlOLElBQUosRUFBVTtBQUNOQywyQ0FBZ0JDLEdBQWhCLEdBQXNCTSxzQkFBdEIsQ0FBNkNSLElBQUksQ0FBQ1MsT0FBbEQ7QUFDSDs7QUFDRCxhQUFLdkIsUUFBTCxDQUFjO0FBQ1ZhLFVBQUFBLEtBQUssRUFBRU87QUFERyxTQUFkO0FBR0g7QUFDSixLQWhHa0I7QUFBQSxxREFrR1AsTUFBTTtBQUNkLFdBQUt4QixLQUFMLENBQVc0QixVQUFYLENBQXNCLEtBQXRCO0FBQ0gsS0FwR2tCO0FBQUEsbURBc0dULE1BQU07QUFDWixXQUFLNUIsS0FBTCxDQUFXNEIsVUFBWCxDQUFzQixJQUF0QjtBQUNILEtBeEdrQjtBQUFBLDBEQTBHRixNQUFNO0FBQ25CLFdBQUt4QixRQUFMLENBQWM7QUFBQ0UsUUFBQUEsS0FBSyxFQUFFWjtBQUFSLE9BQWQ7QUFDSCxLQTVHa0I7QUFBQSx5REE4R0gsTUFBTTtBQUNsQixXQUFLVSxRQUFMLENBQWM7QUFBQ0UsUUFBQUEsS0FBSyxFQUFFbEI7QUFBUixPQUFkO0FBQ0gsS0FoSGtCO0FBQUEsa0VBa0hNLFlBQVk7QUFDakMsV0FBS3FCLGNBQUwsR0FBc0IsTUFBTVUsaUNBQWdCQyxHQUFoQixHQUFzQkMsdUJBQXRCLEVBQTVCO0FBQ0EsV0FBS2pCLFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxNQUFNLEVBQUUsS0FERTtBQUVWUyxRQUFBQSxVQUFVLEVBQUUsS0FGRjtBQUdWUixRQUFBQSxLQUFLLEVBQUVoQjtBQUhHLE9BQWQ7QUFLSCxLQXpIa0I7QUFBQSxrRUEySE0sTUFBT2tDLENBQVAsSUFBYTtBQUNsQ0EsTUFBQUEsQ0FBQyxDQUFDSyxjQUFGO0FBQ0EsVUFBSSxDQUFDLEtBQUtDLGdCQUFMLENBQXNCQyxPQUEzQixFQUFvQyxPQUZGLENBRVU7O0FBRTVDLFlBQU0sS0FBS0QsZ0JBQUwsQ0FBc0JDLE9BQXRCLENBQThCQyxRQUE5QixDQUF1QztBQUFFQyxRQUFBQSxVQUFVLEVBQUU7QUFBZCxPQUF2QyxDQUFOOztBQUNBLFVBQUksQ0FBQyxLQUFLSCxnQkFBTCxDQUFzQkMsT0FBdEIsQ0FBOEJmLEtBQTlCLENBQW9Da0IsS0FBekMsRUFBZ0Q7QUFDNUMsYUFBS0osZ0JBQUwsQ0FBc0JDLE9BQXRCLENBQThCSSxLQUE5Qjs7QUFDQSxhQUFLTCxnQkFBTCxDQUFzQkMsT0FBdEIsQ0FBOEJDLFFBQTlCLENBQXVDO0FBQUVDLFVBQUFBLFVBQVUsRUFBRSxLQUFkO0FBQXFCRyxVQUFBQSxPQUFPLEVBQUU7QUFBOUIsU0FBdkM7O0FBQ0E7QUFDSDs7QUFFRCxXQUFLaEMsUUFBTCxDQUFjO0FBQUNFLFFBQUFBLEtBQUssRUFBRWpCO0FBQVIsT0FBZDtBQUNILEtBdklrQjtBQUFBLHlFQXlJYSxNQUFPbUMsQ0FBUCxJQUFhO0FBQ3pDQSxNQUFBQSxDQUFDLENBQUNLLGNBQUY7QUFFQSxVQUFJLEtBQUtiLEtBQUwsQ0FBV3FCLFVBQVgsS0FBMEIsS0FBS3JCLEtBQUwsQ0FBV3NCLGlCQUF6QyxFQUE0RDtBQUU1RCxXQUFLN0IsY0FBTCxHQUFzQixNQUFNVSxpQ0FBZ0JDLEdBQWhCLEdBQXNCQyx1QkFBdEIsQ0FBOEMsS0FBS0wsS0FBTCxDQUFXcUIsVUFBekQsQ0FBNUI7QUFDQSxXQUFLakMsUUFBTCxDQUFjO0FBQ1ZDLFFBQUFBLE1BQU0sRUFBRSxLQURFO0FBRVZTLFFBQUFBLFVBQVUsRUFBRSxLQUZGO0FBR1ZSLFFBQUFBLEtBQUssRUFBRWhCO0FBSEcsT0FBZDtBQUtILEtBcEprQjtBQUFBLDREQXNKQSxNQUFNO0FBQ3JCLFdBQUtjLFFBQUwsQ0FBYztBQUNWaUMsUUFBQUEsVUFBVSxFQUFFLEVBREY7QUFFVkUsUUFBQUEsZUFBZSxFQUFFLEtBRlA7QUFHVkQsUUFBQUEsaUJBQWlCLEVBQUUsRUFIVDtBQUlWaEMsUUFBQUEsS0FBSyxFQUFFbEI7QUFKRyxPQUFkO0FBTUgsS0E3SmtCO0FBQUEsa0VBK0pNLE1BQU07QUFDM0IsV0FBS2dCLFFBQUwsQ0FBYztBQUNWRSxRQUFBQSxLQUFLLEVBQUVoQjtBQURHLE9BQWQ7QUFHSCxLQW5La0I7QUFBQSxpRUFxS01rRCxNQUFELElBQVk7QUFDaEMsV0FBS3BDLFFBQUwsQ0FBYztBQUNWbUMsUUFBQUEsZUFBZSxFQUFFQyxNQUFNLENBQUNOO0FBRGQsT0FBZDtBQUdILEtBektrQjtBQUFBLCtEQTJLSVYsQ0FBRCxJQUFPO0FBQ3pCLFdBQUtwQixRQUFMLENBQWM7QUFDVmlDLFFBQUFBLFVBQVUsRUFBRWIsQ0FBQyxDQUFDaUIsTUFBRixDQUFTQztBQURYLE9BQWQ7QUFHSCxLQS9La0I7QUFBQSxzRUFpTFdsQixDQUFELElBQU87QUFDaEMsV0FBS3BCLFFBQUwsQ0FBYztBQUNWa0MsUUFBQUEsaUJBQWlCLEVBQUVkLENBQUMsQ0FBQ2lCLE1BQUYsQ0FBU0M7QUFEbEIsT0FBZDtBQUdILEtBckxrQjtBQUdmLFNBQUt4QyxnQkFBTCxHQUF3QixJQUF4QjtBQUNBLFNBQUtPLGNBQUwsR0FBc0IsSUFBdEI7QUFFQSxTQUFLTyxLQUFMLEdBQWE7QUFDVEQsTUFBQUEsbUJBQW1CLEVBQUUsSUFEWjtBQUVUVCxNQUFBQSxLQUFLLEVBQUVsQixnQkFGRTtBQUdUaUQsTUFBQUEsVUFBVSxFQUFFLEVBSEg7QUFJVEUsTUFBQUEsZUFBZSxFQUFFLEtBSlI7QUFLVEQsTUFBQUEsaUJBQWlCLEVBQUUsRUFMVjtBQU1UakMsTUFBQUEsTUFBTSxFQUFFLEtBTkM7QUFPVFMsTUFBQUEsVUFBVSxFQUFFO0FBUEgsS0FBYjtBQVVBLFNBQUtnQixnQkFBTCxnQkFBd0IsdUJBQXhCO0FBQ0g7O0FBRUQsUUFBTWEsaUJBQU4sR0FBMEI7QUFDdEIsVUFBTUMsR0FBRyxHQUFHekIsaUNBQWdCQyxHQUFoQixFQUFaOztBQUNBLFVBQU1MLG1CQUFtQixHQUFHLE1BQU02QixHQUFHLENBQUNDLGdDQUFKLENBQXFDLDhCQUFyQyxDQUFsQztBQUNBLFNBQUt6QyxRQUFMLENBQWM7QUFBRVcsTUFBQUE7QUFBRixLQUFkLEVBSHNCLENBS3RCO0FBQ0E7O0FBQ0EsUUFBSUEsbUJBQUosRUFBeUI7QUFDckIsV0FBS1gsUUFBTCxDQUFjO0FBQUVFLFFBQUFBLEtBQUssRUFBRWQ7QUFBVCxPQUFkOztBQUNBLFdBQUtzRCxhQUFMO0FBQ0g7QUFDSjs7QUF5SkRDLEVBQUFBLHNCQUFzQixHQUFHO0FBQ3JCLFVBQU1DLGFBQWEsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDhCQUFqQixDQUF0QjtBQUVBLHdCQUFPO0FBQU0sTUFBQSxRQUFRLEVBQUUsS0FBS0M7QUFBckIsb0JBQ0gsd0NBQUkseUJBQ0EsNEVBREEsRUFDOEUsRUFEOUUsRUFFQTtBQUFFQyxNQUFBQSxDQUFDLEVBQUVDLEdBQUcsaUJBQUksd0NBQUlBLEdBQUo7QUFBWixLQUZBLENBQUosQ0FERyxlQUtILHdDQUFJLHlCQUNBLCtEQUNBLDRDQUZBLENBQUosQ0FMRyxlQVNILHdDQUFJLHlCQUFHLDRFQUFILENBQUosQ0FURyxlQVdIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMsd0JBQUQ7QUFDSSxNQUFBLFNBQVMsRUFBQywwQ0FEZDtBQUVJLE1BQUEsUUFBUSxFQUFFLEtBQUtDLG1CQUZuQjtBQUdJLE1BQUEsUUFBUSxFQUFFM0Qsa0JBSGQ7QUFJSSxNQUFBLEtBQUssRUFBRSxLQUFLcUIsS0FBTCxDQUFXcUIsVUFKdEI7QUFLSSxNQUFBLFVBQVUsRUFBRSxLQUFLa0IscUJBTHJCO0FBTUksTUFBQSxRQUFRLEVBQUUsS0FBS3pCLGdCQU5uQjtBQU9JLE1BQUEsU0FBUyxFQUFFLElBUGY7QUFRSSxNQUFBLEtBQUssRUFBRSwwQkFBSSx5QkFBSixDQVJYO0FBU0ksTUFBQSxrQkFBa0IsRUFBRSwwQkFBSSx5QkFBSixDQVR4QjtBQVVJLE1BQUEsbUJBQW1CLEVBQUUsMEJBQUksa0RBQUosQ0FWekI7QUFXSSxNQUFBLHFCQUFxQixFQUFFLDBCQUFJLGtEQUFKO0FBWDNCLE1BREosQ0FESixDQVhHLGVBNkJILDZCQUFDLGFBQUQ7QUFDSSxNQUFBLGFBQWEsRUFBRSx5QkFBRyxNQUFILENBRG5CO0FBRUksTUFBQSxvQkFBb0IsRUFBRSxLQUFLcUIsc0JBRi9CO0FBR0ksTUFBQSxTQUFTLEVBQUUsS0FIZjtBQUlJLE1BQUEsUUFBUSxFQUFFLENBQUMsS0FBS25DLEtBQUwsQ0FBV3VCO0FBSjFCLE1BN0JHLGVBb0NILDJEQUNJLDhDQUFVLHlCQUFHLFVBQUgsQ0FBVixDQURKLGVBRUksNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxJQUFJLEVBQUMsU0FBdkI7QUFBaUMsTUFBQSxPQUFPLEVBQUUsS0FBS2lCO0FBQS9DLE9BQ0sseUJBQUcsNEJBQUgsQ0FETCxDQUZKLENBcENHLENBQVA7QUEyQ0g7O0FBRURDLEVBQUFBLDZCQUE2QixHQUFHO0FBQzVCLFVBQU1DLGdCQUFnQixHQUFHVCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMkJBQWpCLENBQXpCO0FBRUEsUUFBSVMsU0FBSjtBQUNBLFFBQUlDLFVBQUo7O0FBQ0EsUUFBSSxLQUFLNUMsS0FBTCxDQUFXc0IsaUJBQVgsS0FBaUMsS0FBS3RCLEtBQUwsQ0FBV3FCLFVBQWhELEVBQTREO0FBQ3hEc0IsTUFBQUEsU0FBUyxHQUFHLHlCQUFHLGVBQUgsQ0FBWjtBQUNBQyxNQUFBQSxVQUFVLEdBQUcseUJBQUcsNkJBQUgsQ0FBYjtBQUNILEtBSEQsTUFHTyxJQUFJLENBQUMsS0FBSzVDLEtBQUwsQ0FBV3FCLFVBQVgsQ0FBc0J3QixVQUF0QixDQUFpQyxLQUFLN0MsS0FBTCxDQUFXc0IsaUJBQTVDLENBQUwsRUFBcUU7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQXFCLE1BQUFBLFNBQVMsR0FBRyx5QkFBRyxxQkFBSCxDQUFaO0FBQ0FDLE1BQUFBLFVBQVUsR0FBRyx5QkFBRywwQkFBSCxDQUFiO0FBQ0g7O0FBRUQsUUFBSUUsZUFBZSxHQUFHLElBQXRCOztBQUNBLFFBQUlILFNBQUosRUFBZTtBQUNYRyxNQUFBQSxlQUFlLGdCQUFHO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixzQkFDZCwwQ0FBTUgsU0FBTixDQURjLGVBRWQsdURBQ0ksNkJBQUMsZ0JBQUQ7QUFBa0IsUUFBQSxPQUFPLEVBQUMsTUFBMUI7QUFBaUMsUUFBQSxTQUFTLEVBQUMsZUFBM0M7QUFBMkQsUUFBQSxPQUFPLEVBQUUsS0FBS0k7QUFBekUsU0FDS0gsVUFETCxDQURKLENBRmMsQ0FBbEI7QUFRSDs7QUFDRCxVQUFNWixhQUFhLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw4QkFBakIsQ0FBdEI7QUFDQSx3QkFBTztBQUFNLE1BQUEsUUFBUSxFQUFFLEtBQUtjO0FBQXJCLG9CQUNILHdDQUFJLHlCQUNBLDZEQURBLENBQUosQ0FERyxlQUlIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksdURBQ0k7QUFBTyxNQUFBLElBQUksRUFBQyxVQUFaO0FBQ0ksTUFBQSxRQUFRLEVBQUUsS0FBS0MsMEJBRG5CO0FBRUksTUFBQSxLQUFLLEVBQUUsS0FBS2pELEtBQUwsQ0FBV3NCLGlCQUZ0QjtBQUdJLE1BQUEsU0FBUyxFQUFDLDBDQUhkO0FBSUksTUFBQSxXQUFXLEVBQUUseUJBQUcsZ0NBQUgsQ0FKakI7QUFLSSxNQUFBLFNBQVMsRUFBRTtBQUxmLE1BREosQ0FESixFQVVLd0IsZUFWTCxDQURKLENBSkcsZUFrQkgsNkJBQUMsYUFBRDtBQUNJLE1BQUEsYUFBYSxFQUFFLHlCQUFHLE1BQUgsQ0FEbkI7QUFFSSxNQUFBLG9CQUFvQixFQUFFLEtBQUtFLDZCQUYvQjtBQUdJLE1BQUEsU0FBUyxFQUFFLEtBSGY7QUFJSSxNQUFBLFFBQVEsRUFBRSxLQUFLaEQsS0FBTCxDQUFXcUIsVUFBWCxLQUEwQixLQUFLckIsS0FBTCxDQUFXc0I7QUFKbkQsTUFsQkcsQ0FBUDtBQXlCSDs7QUFFRDRCLEVBQUFBLG1CQUFtQixHQUFHO0FBQ2xCLHdCQUFPLHVEQUNILHdDQUFJLHlCQUNBLG1FQUNBLHVFQUZBLENBQUosQ0FERyxlQUtILHdDQUFJLHlCQUNBLDZFQURBLENBQUosQ0FMRyxlQVFIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDSyx5QkFBRyxtQkFBSCxDQURMLENBREosZUFJSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQU0sTUFBQSxHQUFHLEVBQUUsS0FBS0M7QUFBaEIsT0FBMEMsS0FBSzFELGNBQUwsQ0FBb0JDLFlBQTlELENBREosQ0FESixlQUlJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFRLE1BQUEsU0FBUyxFQUFDLG1CQUFsQjtBQUFzQyxNQUFBLE9BQU8sRUFBRSxLQUFLMEQ7QUFBcEQsT0FDSyx5QkFBRyxNQUFILENBREwsQ0FESixlQUlJO0FBQVEsTUFBQSxTQUFTLEVBQUMsbUJBQWxCO0FBQXNDLE1BQUEsT0FBTyxFQUFFLEtBQUtDO0FBQXBELE9BQ0sseUJBQUcsVUFBSCxDQURMLENBSkosQ0FKSixDQUpKLENBUkcsQ0FBUDtBQTJCSDs7QUFFREMsRUFBQUEsc0JBQXNCLEdBQUc7QUFDckIsUUFBSUMsU0FBSjs7QUFDQSxRQUFJLEtBQUt2RCxLQUFMLENBQVdYLE1BQWYsRUFBdUI7QUFDbkJrRSxNQUFBQSxTQUFTLEdBQUcseUJBQ1IsMEVBRFEsRUFFUixFQUZRLEVBRUo7QUFBQ25CLFFBQUFBLENBQUMsRUFBRW9CLENBQUMsaUJBQUksd0NBQUlBLENBQUo7QUFBVCxPQUZJLENBQVo7QUFJSCxLQUxELE1BS08sSUFBSSxLQUFLeEQsS0FBTCxDQUFXRixVQUFmLEVBQTJCO0FBQzlCeUQsTUFBQUEsU0FBUyxHQUFHLHlCQUNSLHVEQURRLEVBRVIsRUFGUSxFQUVKO0FBQUNuQixRQUFBQSxDQUFDLEVBQUVvQixDQUFDLGlCQUFJLHdDQUFJQSxDQUFKO0FBQVQsT0FGSSxDQUFaO0FBSUg7O0FBQ0QsVUFBTXhCLGFBQWEsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDhCQUFqQixDQUF0QjtBQUNBLHdCQUFPLDBDQUNGcUIsU0FERSxlQUVILHNEQUNJLHlDQUFLLHlCQUFHLDZDQUFILEVBQWtELEVBQWxELEVBQXNEO0FBQUNuQixNQUFBQSxDQUFDLEVBQUVvQixDQUFDLGlCQUFJLHdDQUFJQSxDQUFKO0FBQVQsS0FBdEQsQ0FBTCxDQURKLGVBRUkseUNBQUsseUJBQUcsNkNBQUgsRUFBa0QsRUFBbEQsRUFBc0Q7QUFBQ3BCLE1BQUFBLENBQUMsRUFBRW9CLENBQUMsaUJBQUksd0NBQUlBLENBQUo7QUFBVCxLQUF0RCxDQUFMLENBRkosZUFHSSx5Q0FBSyx5QkFBRywrQ0FBSCxFQUFvRCxFQUFwRCxFQUF3RDtBQUFDcEIsTUFBQUEsQ0FBQyxFQUFFb0IsQ0FBQyxpQkFBSSx3Q0FBSUEsQ0FBSjtBQUFULEtBQXhELENBQUwsQ0FISixDQUZHLGVBT0gsNkJBQUMsYUFBRDtBQUFlLE1BQUEsYUFBYSxFQUFFLHlCQUFHLFVBQUgsQ0FBOUI7QUFDSSxNQUFBLG9CQUFvQixFQUFFLEtBQUsxQixhQUQvQjtBQUVJLE1BQUEsU0FBUyxFQUFFO0FBRmYsb0JBR0k7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLMkI7QUFBdEIsT0FBK0MseUJBQUcsTUFBSCxDQUEvQyxDQUhKLENBUEcsQ0FBUDtBQWFIOztBQUVEQyxFQUFBQSxnQkFBZ0IsQ0FBQ0MsSUFBRCxFQUFPO0FBQ25CLFVBQU1DLE9BQU8sR0FBRzNCLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix3QkFBakIsQ0FBaEI7QUFDQSx3QkFBTyx1REFDSCw2QkFBQyxPQUFELE9BREcsQ0FBUDtBQUdIOztBQUVEMkIsRUFBQUEsZ0JBQWdCLEdBQUc7QUFDZixVQUFNN0IsYUFBYSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsOEJBQWpCLENBQXRCO0FBQ0Esd0JBQU8sdURBQ0gsd0NBQUkseUJBQ0EsNEVBREEsQ0FBSixDQURHLGVBSUgsNkJBQUMsYUFBRDtBQUFlLE1BQUEsYUFBYSxFQUFFLHlCQUFHLElBQUgsQ0FBOUI7QUFDSSxNQUFBLG9CQUFvQixFQUFFLEtBQUs0QixPQUQvQjtBQUVJLE1BQUEsU0FBUyxFQUFFO0FBRmYsTUFKRyxDQUFQO0FBU0g7O0FBRURDLEVBQUFBLHlCQUF5QixHQUFHO0FBQ3hCLFVBQU0vQixhQUFhLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw4QkFBakIsQ0FBdEI7QUFDQSx3QkFBTywwQ0FDRix5QkFDRyxtRkFDQSxrRUFGSCxDQURFLGVBS0gsNkJBQUMsYUFBRDtBQUFlLE1BQUEsYUFBYSxFQUFFLHlCQUFHLGdDQUFILENBQTlCO0FBQ0ksTUFBQSxvQkFBb0IsRUFBRSxLQUFLOEIsYUFEL0I7QUFFSSxNQUFBLFNBQVMsRUFBRTtBQUZmLG9CQUlJO0FBQVEsTUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFBdEIsd0NBSkosQ0FMRyxDQUFQO0FBWUg7O0FBRURDLEVBQUFBLGNBQWMsQ0FBQzVFLEtBQUQsRUFBUTtBQUNsQixZQUFRQSxLQUFSO0FBQ0ksV0FBS2xCLGdCQUFMO0FBQ0ksZUFBTyx5QkFBRywyQ0FBSCxDQUFQOztBQUNKLFdBQUtDLHdCQUFMO0FBQ0ksZUFBTyx5QkFBRyw4QkFBSCxDQUFQOztBQUNKLFdBQUtLLG9CQUFMO0FBQ0ksZUFBTyx5QkFBRyxVQUFILENBQVA7O0FBQ0osV0FBS0osYUFBTDtBQUNBLFdBQUtDLGdCQUFMO0FBQ0ksZUFBTyx5QkFBRyxrQ0FBSCxDQUFQOztBQUNKLFdBQUtDLGVBQUw7QUFDSSxlQUFPLHlCQUFHLG9CQUFILENBQVA7O0FBQ0osV0FBS0MsVUFBTDtBQUNJLGVBQU8seUJBQUcsVUFBSCxDQUFQOztBQUNKO0FBQ0ksZUFBTyx5QkFBRyxtQkFBSCxDQUFQO0FBZlI7QUFpQkg7O0FBRUQwRixFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxVQUFVLEdBQUduQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMEJBQWpCLENBQW5CO0FBRUEsUUFBSW1DLE9BQUo7O0FBQ0EsUUFBSSxLQUFLckUsS0FBTCxDQUFXQyxLQUFmLEVBQXNCO0FBQ2xCLFlBQU0rQixhQUFhLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw4QkFBakIsQ0FBdEI7QUFDQW1DLE1BQUFBLE9BQU8sZ0JBQUcsdURBQ04sd0NBQUkseUJBQUcsNkJBQUgsQ0FBSixDQURNLGVBRU47QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLDZCQUFDLGFBQUQ7QUFBZSxRQUFBLGFBQWEsRUFBRSx5QkFBRyxPQUFILENBQTlCO0FBQ0ksUUFBQSxvQkFBb0IsRUFBRSxLQUFLdkMsYUFEL0I7QUFFSSxRQUFBLFNBQVMsRUFBRSxJQUZmO0FBR0ksUUFBQSxRQUFRLEVBQUUsS0FBS21DO0FBSG5CLFFBREosQ0FGTSxDQUFWO0FBVUgsS0FaRCxNQVlPO0FBQ0gsY0FBUSxLQUFLakUsS0FBTCxDQUFXVixLQUFuQjtBQUNJLGFBQUtsQixnQkFBTDtBQUNJaUcsVUFBQUEsT0FBTyxHQUFHLEtBQUt0QyxzQkFBTCxFQUFWO0FBQ0E7O0FBQ0osYUFBSzFELHdCQUFMO0FBQ0lnRyxVQUFBQSxPQUFPLEdBQUcsS0FBSzVCLDZCQUFMLEVBQVY7QUFDQTs7QUFDSixhQUFLbkUsYUFBTDtBQUNJK0YsVUFBQUEsT0FBTyxHQUFHLEtBQUtuQixtQkFBTCxFQUFWO0FBQ0E7O0FBQ0osYUFBSzNFLGdCQUFMO0FBQ0k4RixVQUFBQSxPQUFPLEdBQUcsS0FBS2Ysc0JBQUwsRUFBVjtBQUNBOztBQUNKLGFBQUs5RSxlQUFMO0FBQ0k2RixVQUFBQSxPQUFPLEdBQUcsS0FBS1gsZ0JBQUwsRUFBVjtBQUNBOztBQUNKLGFBQUtqRixVQUFMO0FBQ0k0RixVQUFBQSxPQUFPLEdBQUcsS0FBS1IsZ0JBQUwsRUFBVjtBQUNBOztBQUNKLGFBQUtuRixvQkFBTDtBQUNJMkYsVUFBQUEsT0FBTyxHQUFHLEtBQUtOLHlCQUFMLEVBQVY7QUFDQTtBQXJCUjtBQXVCSDs7QUFFRCx3QkFDSSw2QkFBQyxVQUFEO0FBQVksTUFBQSxTQUFTLEVBQUMsMEJBQXRCO0FBQ0ksTUFBQSxVQUFVLEVBQUUsS0FBSy9FLEtBQUwsQ0FBVzRCLFVBRDNCO0FBRUksTUFBQSxLQUFLLEVBQUUsS0FBS3NELGNBQUwsQ0FBb0IsS0FBS2xFLEtBQUwsQ0FBV1YsS0FBL0IsQ0FGWDtBQUdJLE1BQUEsU0FBUyxFQUFFLENBQUNsQixnQkFBRCxFQUFtQkssVUFBbkIsRUFBK0I2RixRQUEvQixDQUF3QyxLQUFLdEUsS0FBTCxDQUFXVixLQUFuRDtBQUhmLG9CQUtBLDBDQUNLK0UsT0FETCxDQUxBLENBREo7QUFXSDs7QUEvY2tFOzs7OEJBQWxEekYscUIsZUFDRTtBQUNmZ0MsRUFBQUEsVUFBVSxFQUFFMkQsbUJBQVVDLElBQVYsQ0FBZUM7QUFEWixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge2NyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IEZpbGVTYXZlciBmcm9tICdmaWxlLXNhdmVyJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190LCBfdGR9IGZyb20gJy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBhY2Nlc3NTZWNyZXRTdG9yYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vU2VjdXJpdHlNYW5hZ2VyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7Y29weU5vZGV9IGZyb20gXCIuLi8uLi8uLi8uLi91dGlscy9zdHJpbmdzXCI7XG5pbXBvcnQgUGFzc3BocmFzZUZpZWxkIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2F1dGgvUGFzc3BocmFzZUZpZWxkXCI7XG5cbmNvbnN0IFBIQVNFX1BBU1NQSFJBU0UgPSAwO1xuY29uc3QgUEhBU0VfUEFTU1BIUkFTRV9DT05GSVJNID0gMTtcbmNvbnN0IFBIQVNFX1NIT1dLRVkgPSAyO1xuY29uc3QgUEhBU0VfS0VFUElUU0FGRSA9IDM7XG5jb25zdCBQSEFTRV9CQUNLSU5HVVAgPSA0O1xuY29uc3QgUEhBU0VfRE9ORSA9IDU7XG5jb25zdCBQSEFTRV9PUFRPVVRfQ09ORklSTSA9IDY7XG5cbmNvbnN0IFBBU1NXT1JEX01JTl9TQ09SRSA9IDQ7IC8vIFNvIHNlY3VyZSwgbWFueSBjaGFyYWN0ZXJzLCBtdWNoIGNvbXBsZXgsIHdvdywgZXRjLCBldGMuXG5cbi8qXG4gKiBXYWxrcyB0aGUgdXNlciB0aHJvdWdoIHRoZSBwcm9jZXNzIG9mIGNyZWF0aW5nIGFuIGUyZSBrZXkgYmFja3VwXG4gKiBvbiB0aGUgc2VydmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDcmVhdGVLZXlCYWNrdXBEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl9yZWNvdmVyeUtleU5vZGUgPSBudWxsO1xuICAgICAgICB0aGlzLl9rZXlCYWNrdXBJbmZvID0gbnVsbDtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2VjdXJlU2VjcmV0U3RvcmFnZTogbnVsbCxcbiAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9QQVNTUEhSQVNFLFxuICAgICAgICAgICAgcGFzc1BocmFzZTogJycsXG4gICAgICAgICAgICBwYXNzUGhyYXNlVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGFzc1BocmFzZUNvbmZpcm06ICcnLFxuICAgICAgICAgICAgY29waWVkOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd25sb2FkZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX3Bhc3NwaHJhc2VGaWVsZCA9IGNyZWF0ZVJlZigpO1xuICAgIH1cblxuICAgIGFzeW5jIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHNlY3VyZVNlY3JldFN0b3JhZ2UgPSBhd2FpdCBjbGkuZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUoXCJvcmcubWF0cml4LmUyZV9jcm9zc19zaWduaW5nXCIpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VjdXJlU2VjcmV0U3RvcmFnZSB9KTtcblxuICAgICAgICAvLyBJZiB3ZSdyZSB1c2luZyBzZWNyZXQgc3RvcmFnZSwgc2tpcCBhaGVhZCB0byB0aGUgYmFja2luZyB1cCBzdGVwLCBhc1xuICAgICAgICAvLyBgYWNjZXNzU2VjcmV0U3RvcmFnZWAgd2lsbCBoYW5kbGUgcGFzc3BocmFzZXMgYXMgbmVlZGVkLlxuICAgICAgICBpZiAoc2VjdXJlU2VjcmV0U3RvcmFnZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQSEFTRV9CQUNLSU5HVVAgfSk7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVCYWNrdXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jb2xsZWN0UmVjb3ZlcnlLZXlOb2RlID0gKG4pID0+IHtcbiAgICAgICAgdGhpcy5fcmVjb3ZlcnlLZXlOb2RlID0gbjtcbiAgICB9XG5cbiAgICBfb25Db3B5Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NmdWwgPSBjb3B5Tm9kZSh0aGlzLl9yZWNvdmVyeUtleU5vZGUpO1xuICAgICAgICBpZiAoc3VjY2Vzc2Z1bCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY29waWVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9LRUVQSVRTQUZFLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25Eb3dubG9hZENsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RoaXMuX2tleUJhY2t1cEluZm8ucmVjb3Zlcnlfa2V5XSwge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQvcGxhaW47Y2hhcnNldD11cy1hc2NpaScsXG4gICAgICAgIH0pO1xuICAgICAgICBGaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsICdzZWN1cml0eS1rZXkudHh0Jyk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkb3dubG9hZGVkOiB0cnVlLFxuICAgICAgICAgICAgcGhhc2U6IFBIQVNFX0tFRVBJVFNBRkUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9jcmVhdGVCYWNrdXAgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgc2VjdXJlU2VjcmV0U3RvcmFnZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogUEhBU0VfQkFDS0lOR1VQLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgaW5mbztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChzZWN1cmVTZWNyZXRTdG9yYWdlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgYWNjZXNzU2VjcmV0U3RvcmFnZShhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucHJlcGFyZUtleUJhY2t1cFZlcnNpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsIC8qIHJhbmRvbSBrZXkgKi8sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNlY3VyZVNlY3JldFN0b3JhZ2U6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgaW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVhdGVLZXlCYWNrdXBWZXJzaW9uKGluZm8pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWF0ZUtleUJhY2t1cFZlcnNpb24oXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleUJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zY2hlZHVsZUFsbEdyb3VwU2Vzc2lvbnNGb3JCYWNrdXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9ET05FLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBjcmVhdGluZyBrZXkgYmFja3VwXCIsIGUpO1xuICAgICAgICAgICAgLy8gVE9ETzogSWYgY3JlYXRpbmcgYSB2ZXJzaW9uIHN1Y2NlZWRzLCBidXQgYmFja3VwIGZhaWxzLCBzaG91bGQgd2VcbiAgICAgICAgICAgIC8vIGRlbGV0ZSB0aGUgdmVyc2lvbiwgZGlzYWJsZSBiYWNrdXAsIG9yIGRvIG5vdGhpbmc/ICBJZiB3ZSBqdXN0XG4gICAgICAgICAgICAvLyBkaXNhYmxlIHdpdGhvdXQgZGVsZXRpbmcsIHdlJ2xsIGVuYWJsZSBvbiBuZXh0IGFwcCByZWxvYWQgc2luY2VcbiAgICAgICAgICAgIC8vIGl0IGlzIHRydXN0ZWQuXG4gICAgICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5kZWxldGVLZXlCYWNrdXBWZXJzaW9uKGluZm8udmVyc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uQ2FuY2VsID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH1cblxuICAgIF9vbkRvbmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9XG5cbiAgICBfb25PcHRPdXRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGhhc2U6IFBIQVNFX09QVE9VVF9DT05GSVJNfSk7XG4gICAgfVxuXG4gICAgX29uU2V0VXBDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGhhc2U6IFBIQVNFX1BBU1NQSFJBU0V9KTtcbiAgICB9XG5cbiAgICBfb25Ta2lwUGFzc1BocmFzZUNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLl9rZXlCYWNrdXBJbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnByZXBhcmVLZXlCYWNrdXBWZXJzaW9uKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29waWVkOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd25sb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGhhc2U6IFBIQVNFX1NIT1dLRVksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vblBhc3NQaHJhc2VOZXh0Q2xpY2sgPSBhc3luYyAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICghdGhpcy5fcGFzc3BocmFzZUZpZWxkLmN1cnJlbnQpIHJldHVybjsgLy8gdW5tb3VudGluZ1xuXG4gICAgICAgIGF3YWl0IHRoaXMuX3Bhc3NwaHJhc2VGaWVsZC5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG4gICAgICAgIGlmICghdGhpcy5fcGFzc3BocmFzZUZpZWxkLmN1cnJlbnQuc3RhdGUudmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bhc3NwaHJhc2VGaWVsZC5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgICAgICB0aGlzLl9wYXNzcGhyYXNlRmllbGQuY3VycmVudC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IGZhbHNlLCBmb2N1c2VkOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGhhc2U6IFBIQVNFX1BBU1NQSFJBU0VfQ09ORklSTX0pO1xuICAgIH07XG5cbiAgICBfb25QYXNzUGhyYXNlQ29uZmlybU5leHRDbGljayA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wYXNzUGhyYXNlICE9PSB0aGlzLnN0YXRlLnBhc3NQaHJhc2VDb25maXJtKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fa2V5QmFja3VwSW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5wcmVwYXJlS2V5QmFja3VwVmVyc2lvbih0aGlzLnN0YXRlLnBhc3NQaHJhc2UpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvcGllZDogZmFsc2UsXG4gICAgICAgICAgICBkb3dubG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9TSE9XS0VZLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uU2V0QWdhaW5DbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlOiAnJyxcbiAgICAgICAgICAgIHBhc3NQaHJhc2VWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICBwYXNzUGhyYXNlQ29uZmlybTogJycsXG4gICAgICAgICAgICBwaGFzZTogUEhBU0VfUEFTU1BIUkFTRSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uS2VlcEl0U2FmZUJhY2tDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogUEhBU0VfU0hPV0tFWSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uUGFzc1BocmFzZVZhbGlkYXRlID0gKHJlc3VsdCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2VWYWxpZDogcmVzdWx0LnZhbGlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uUGFzc1BocmFzZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFzc1BocmFzZTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vblBhc3NQaHJhc2VDb25maXJtQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlQ29uZmlybTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9yZW5kZXJQaGFzZVBhc3NQaHJhc2UoKSB7XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG5cbiAgICAgICAgcmV0dXJuIDxmb3JtIG9uU3VibWl0PXt0aGlzLl9vblBhc3NQaHJhc2VOZXh0Q2xpY2t9PlxuICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgIFwiPGI+V2FybmluZzwvYj46IFlvdSBzaG91bGQgb25seSBzZXQgdXAga2V5IGJhY2t1cCBmcm9tIGEgdHJ1c3RlZCBjb21wdXRlci5cIiwge30sXG4gICAgICAgICAgICAgICAgeyBiOiBzdWIgPT4gPGI+e3N1Yn08L2I+IH0sXG4gICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICBcIldlJ2xsIHN0b3JlIGFuIGVuY3J5cHRlZCBjb3B5IG9mIHlvdXIga2V5cyBvbiBvdXIgc2VydmVyLiBcIiArXG4gICAgICAgICAgICAgICAgXCJTZWN1cmUgeW91ciBiYWNrdXAgd2l0aCBhIFNlY3VyaXR5IFBocmFzZS5cIixcbiAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgPHA+e190KFwiRm9yIG1heGltdW0gc2VjdXJpdHksIHRoaXMgc2hvdWxkIGJlIGRpZmZlcmVudCBmcm9tIHlvdXIgYWNjb3VudCBwYXNzd29yZC5cIil9PC9wPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUtleUJhY2t1cERpYWxvZ19wcmltYXJ5Q29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcGFzc1BocmFzZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8UGFzc3BocmFzZUZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcGFzc1BocmFzZUlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vblBhc3NQaHJhc2VDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5TY29yZT17UEFTU1dPUkRfTUlOX1NDT1JFfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc1BocmFzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMuX29uUGFzc1BocmFzZVZhbGlkYXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRSZWY9e3RoaXMuX3Bhc3NwaHJhc2VGaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdGQoXCJFbnRlciBhIFNlY3VyaXR5IFBocmFzZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRW50ZXJQYXNzd29yZD17X3RkKFwiRW50ZXIgYSBTZWN1cml0eSBQaHJhc2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cm9uZ1Bhc3N3b3JkPXtfdGQoXCJHcmVhdCEgVGhpcyBTZWN1cml0eSBQaHJhc2UgbG9va3Mgc3Ryb25nIGVub3VnaC5cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEFsbG93ZWRCdXRVbnNhZmU9e190ZChcIkdyZWF0ISBUaGlzIFNlY3VyaXR5IFBocmFzZSBsb29rcyBzdHJvbmcgZW5vdWdoLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdOZXh0Jyl9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uUGFzc1BocmFzZU5leHRDbGlja31cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5wYXNzUGhyYXNlVmFsaWR9XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICA8ZGV0YWlscz5cbiAgICAgICAgICAgICAgICA8c3VtbWFyeT57X3QoXCJBZHZhbmNlZFwiKX08L3N1bW1hcnk+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0ncHJpbWFyeScgb25DbGljaz17dGhpcy5fb25Ta2lwUGFzc1BocmFzZUNsaWNrfSA+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlNldCB1cCB3aXRoIGEgU2VjdXJpdHkgS2V5XCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGV0YWlscz5cbiAgICAgICAgPC9mb3JtPjtcbiAgICB9XG5cbiAgICBfcmVuZGVyUGhhc2VQYXNzUGhyYXNlQ29uZmlybSgpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcblxuICAgICAgICBsZXQgbWF0Y2hUZXh0O1xuICAgICAgICBsZXQgY2hhbmdlVGV4dDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGFzc1BocmFzZUNvbmZpcm0gPT09IHRoaXMuc3RhdGUucGFzc1BocmFzZSkge1xuICAgICAgICAgICAgbWF0Y2hUZXh0ID0gX3QoXCJUaGF0IG1hdGNoZXMhXCIpO1xuICAgICAgICAgICAgY2hhbmdlVGV4dCA9IF90KFwiVXNlIGEgZGlmZmVyZW50IHBhc3NwaHJhc2U/XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnN0YXRlLnBhc3NQaHJhc2Uuc3RhcnRzV2l0aCh0aGlzLnN0YXRlLnBhc3NQaHJhc2VDb25maXJtKSkge1xuICAgICAgICAgICAgLy8gb25seSB0ZWxsIHRoZW0gdGhleSdyZSB3cm9uZyBpZiB0aGV5J3ZlIGFjdHVhbGx5IGdvbmUgd3JvbmcuXG4gICAgICAgICAgICAvLyBTZWN1cml0eSBjb25jaW91cyByZWFkZXJzIHdpbGwgbm90ZSB0aGF0IGlmIHlvdSBsZWZ0IGVsZW1lbnQtd2ViIHVuYXR0ZW5kZWRcbiAgICAgICAgICAgIC8vIG9uIHRoaXMgc2NyZWVuLCB0aGlzIHdvdWxkIG1ha2UgaXQgZWFzeSBmb3IgYSBtYWxpY2lvdXMgcGVyc29uIHRvIGd1ZXNzXG4gICAgICAgICAgICAvLyB5b3VyIHBhc3NwaHJhc2Ugb25lIGxldHRlciBhdCBhIHRpbWUsIGJ1dCB0aGV5IGNvdWxkIGdldCB0aGlzIGZhc3RlciBieVxuICAgICAgICAgICAgLy8ganVzdCBvcGVuaW5nIHRoZSBicm93c2VyJ3MgZGV2ZWxvcGVyIHRvb2xzIGFuZCByZWFkaW5nIGl0LlxuICAgICAgICAgICAgLy8gTm90ZSB0aGF0IG5vdCBoYXZpbmcgdHlwZWQgYW55dGhpbmcgYXQgYWxsIHdpbGwgbm90IGhpdCB0aGlzIGNsYXVzZSBhbmRcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCBzbyBlbXB0eSBib3ggPT09IG5vIGhpbnQuXG4gICAgICAgICAgICBtYXRjaFRleHQgPSBfdChcIlRoYXQgZG9lc24ndCBtYXRjaC5cIik7XG4gICAgICAgICAgICBjaGFuZ2VUZXh0ID0gX3QoXCJHbyBiYWNrIHRvIHNldCBpdCBhZ2Fpbi5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFzc1BocmFzZU1hdGNoID0gbnVsbDtcbiAgICAgICAgaWYgKG1hdGNoVGV4dCkge1xuICAgICAgICAgICAgcGFzc1BocmFzZU1hdGNoID0gPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcGFzc1BocmFzZU1hdGNoXCI+XG4gICAgICAgICAgICAgICAgPGRpdj57bWF0Y2hUZXh0fTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGVsZW1lbnQ9XCJzcGFuXCIgY2xhc3NOYW1lPVwibXhfbGlua0J1dHRvblwiIG9uQ2xpY2s9e3RoaXMuX29uU2V0QWdhaW5DbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y2hhbmdlVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgIHJldHVybiA8Zm9ybSBvblN1Ym1pdD17dGhpcy5fb25QYXNzUGhyYXNlQ29uZmlybU5leHRDbGlja30+XG4gICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgZW50ZXIgeW91ciBTZWN1cml0eSBQaHJhc2UgYSBzZWNvbmQgdGltZSB0byBjb25maXJtLlwiLFxuICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUtleUJhY2t1cERpYWxvZ19wcmltYXJ5Q29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcGFzc1BocmFzZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uUGFzc1BocmFzZUNvbmZpcm1DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc1BocmFzZUNvbmZpcm19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlS2V5QmFja3VwRGlhbG9nX3Bhc3NQaHJhc2VJbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiUmVwZWF0IHlvdXIgU2VjdXJpdHkgUGhyYXNlLi4uXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7cGFzc1BocmFzZU1hdGNofVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdOZXh0Jyl9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uUGFzc1BocmFzZUNvbmZpcm1OZXh0Q2xpY2t9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlICE9PSB0aGlzLnN0YXRlLnBhc3NQaHJhc2VDb25maXJtfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9mb3JtPjtcbiAgICB9XG5cbiAgICBfcmVuZGVyUGhhc2VTaG93S2V5KCkge1xuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICBcIllvdXIgU2VjdXJpdHkgS2V5IGlzIGEgc2FmZXR5IG5ldCAtIHlvdSBjYW4gdXNlIGl0IHRvIHJlc3RvcmUgXCIgK1xuICAgICAgICAgICAgICAgIFwiYWNjZXNzIHRvIHlvdXIgZW5jcnlwdGVkIG1lc3NhZ2VzIGlmIHlvdSBmb3JnZXQgeW91ciBTZWN1cml0eSBQaHJhc2UuXCIsXG4gICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICBcIktlZXAgYSBjb3B5IG9mIGl0IHNvbWV3aGVyZSBzZWN1cmUsIGxpa2UgYSBwYXNzd29yZCBtYW5hZ2VyIG9yIGV2ZW4gYSBzYWZlLlwiLFxuICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUtleUJhY2t1cERpYWxvZ19wcmltYXJ5Q29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcmVjb3ZlcnlLZXlIZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiWW91ciBTZWN1cml0eSBLZXlcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcmVjb3ZlcnlLZXlDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcmVjb3ZlcnlLZXlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxjb2RlIHJlZj17dGhpcy5fY29sbGVjdFJlY292ZXJ5S2V5Tm9kZX0+e3RoaXMuX2tleUJhY2t1cEluZm8ucmVjb3Zlcnlfa2V5fTwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlS2V5QmFja3VwRGlhbG9nX3JlY292ZXJ5S2V5QnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJteF9EaWFsb2dfcHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX29uQ29weUNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJDb3B5XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5XCIgb25DbGljaz17dGhpcy5fb25Eb3dubG9hZENsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJEb3dubG9hZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgX3JlbmRlclBoYXNlS2VlcEl0U2FmZSgpIHtcbiAgICAgICAgbGV0IGludHJvVGV4dDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY29waWVkKSB7XG4gICAgICAgICAgICBpbnRyb1RleHQgPSBfdChcbiAgICAgICAgICAgICAgICBcIllvdXIgU2VjdXJpdHkgS2V5IGhhcyBiZWVuIDxiPmNvcGllZCB0byB5b3VyIGNsaXBib2FyZDwvYj4sIHBhc3RlIGl0IHRvOlwiLFxuICAgICAgICAgICAgICAgIHt9LCB7YjogcyA9PiA8Yj57c308L2I+fSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5kb3dubG9hZGVkKSB7XG4gICAgICAgICAgICBpbnRyb1RleHQgPSBfdChcbiAgICAgICAgICAgICAgICBcIllvdXIgU2VjdXJpdHkgS2V5IGlzIGluIHlvdXIgPGI+RG93bmxvYWRzPC9iPiBmb2xkZXIuXCIsXG4gICAgICAgICAgICAgICAge30sIHtiOiBzID0+IDxiPntzfTwvYj59LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIHtpbnRyb1RleHR9XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPntfdChcIjxiPlByaW50IGl0PC9iPiBhbmQgc3RvcmUgaXQgc29tZXdoZXJlIHNhZmVcIiwge30sIHtiOiBzID0+IDxiPntzfTwvYj59KX08L2xpPlxuICAgICAgICAgICAgICAgIDxsaT57X3QoXCI8Yj5TYXZlIGl0PC9iPiBvbiBhIFVTQiBrZXkgb3IgYmFja3VwIGRyaXZlXCIsIHt9LCB7YjogcyA9PiA8Yj57c308L2I+fSl9PC9saT5cbiAgICAgICAgICAgICAgICA8bGk+e190KFwiPGI+Q29weSBpdDwvYj4gdG8geW91ciBwZXJzb25hbCBjbG91ZCBzdG9yYWdlXCIsIHt9LCB7YjogcyA9PiA8Yj57c308L2I+fSl9PC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdChcIkNvbnRpbnVlXCIpfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9jcmVhdGVCYWNrdXB9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX0+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbktlZXBJdFNhZmVCYWNrQ2xpY2t9PntfdChcIkJhY2tcIil9PC9idXR0b24+XG4gICAgICAgICAgICA8L0RpYWxvZ0J1dHRvbnM+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICBfcmVuZGVyQnVzeVBoYXNlKHRleHQpIHtcbiAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLlNwaW5uZXInKTtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgX3JlbmRlclBoYXNlRG9uZSgpIHtcbiAgICAgICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgXCJZb3VyIGtleXMgYXJlIGJlaW5nIGJhY2tlZCB1cCAodGhlIGZpcnN0IGJhY2t1cCBjb3VsZCB0YWtlIGEgZmV3IG1pbnV0ZXMpLlwiLFxuICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnT0snKX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5fb25Eb25lfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgX3JlbmRlclBoYXNlT3B0T3V0Q29uZmlybSgpIHtcbiAgICAgICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgXCJXaXRob3V0IHNldHRpbmcgdXAgU2VjdXJlIE1lc3NhZ2UgUmVjb3ZlcnksIHlvdSB3b24ndCBiZSBhYmxlIHRvIHJlc3RvcmUgeW91ciBcIiArXG4gICAgICAgICAgICAgICAgXCJlbmNyeXB0ZWQgbWVzc2FnZSBoaXN0b3J5IGlmIHlvdSBsb2cgb3V0IG9yIHVzZSBhbm90aGVyIHNlc3Npb24uXCIsXG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ1NldCB1cCBTZWN1cmUgTWVzc2FnZSBSZWNvdmVyeScpfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vblNldFVwQ2xpY2t9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uQ2FuY2VsfT5JIHVuZGVyc3RhbmQsIGNvbnRpbnVlIHdpdGhvdXQ8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvRGlhbG9nQnV0dG9ucz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIF90aXRsZUZvclBoYXNlKHBoYXNlKSB7XG4gICAgICAgIHN3aXRjaCAocGhhc2UpIHtcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfUEFTU1BIUkFTRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1NlY3VyZSB5b3VyIGJhY2t1cCB3aXRoIGEgU2VjdXJpdHkgUGhyYXNlJyk7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX1BBU1NQSFJBU0VfQ09ORklSTTpcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ0NvbmZpcm0geW91ciBTZWN1cml0eSBQaHJhc2UnKTtcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfT1BUT1VUX0NPTkZJUk06XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdXYXJuaW5nIScpO1xuICAgICAgICAgICAgY2FzZSBQSEFTRV9TSE9XS0VZOlxuICAgICAgICAgICAgY2FzZSBQSEFTRV9LRUVQSVRTQUZFOlxuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnTWFrZSBhIGNvcHkgb2YgeW91ciBTZWN1cml0eSBLZXknKTtcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfQkFDS0lOR1VQOlxuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnU3RhcnRpbmcgYmFja3VwLi4uJyk7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX0RPTkU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTdWNjZXNzIScpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoXCJDcmVhdGUga2V5IGJhY2t1cFwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuXG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPntfdChcIlVuYWJsZSB0byBjcmVhdGUga2V5IGJhY2t1cFwiKX08L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnUmV0cnknKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9jcmVhdGVCYWNrdXB9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUucGhhc2UpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFBIQVNFX1BBU1NQSFJBU0U6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl9yZW5kZXJQaGFzZVBhc3NQaHJhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQSEFTRV9QQVNTUEhSQVNFX0NPTkZJUk06XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl9yZW5kZXJQaGFzZVBhc3NQaHJhc2VDb25maXJtKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUEhBU0VfU0hPV0tFWTpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMuX3JlbmRlclBoYXNlU2hvd0tleSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBIQVNFX0tFRVBJVFNBRkU6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl9yZW5kZXJQaGFzZUtlZXBJdFNhZmUoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQSEFTRV9CQUNLSU5HVVA6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl9yZW5kZXJCdXN5UGhhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQSEFTRV9ET05FOlxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy5fcmVuZGVyUGhhc2VEb25lKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUEhBU0VfT1BUT1VUX0NPTkZJUk06XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl9yZW5kZXJQaGFzZU9wdE91dENvbmZpcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPSdteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2cnXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLl90aXRsZUZvclBoYXNlKHRoaXMuc3RhdGUucGhhc2UpfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17W1BIQVNFX1BBU1NQSFJBU0UsIFBIQVNFX0RPTkVdLmluY2x1ZGVzKHRoaXMuc3RhdGUucGhhc2UpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
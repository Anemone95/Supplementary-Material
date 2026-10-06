"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../../index"));

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _fileSaver = _interopRequireDefault(require("file-saver"));

var _languageHandler = require("../../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _SecurityManager = require("../../../../SecurityManager");

var _strings = require("../../../../utils/strings");

var _InteractiveAuthEntryComponents = require("../../../../components/views/auth/InteractiveAuthEntryComponents");

var _PassphraseField = _interopRequireDefault(require("../../../../components/views/auth/PassphraseField"));

var _StyledRadioButton = _interopRequireDefault(require("../../../../components/views/elements/StyledRadioButton"));

var _AccessibleButton = _interopRequireDefault(require("../../../../components/views/elements/AccessibleButton"));

var _DialogButtons = _interopRequireDefault(require("../../../../components/views/elements/DialogButtons"));

var _InlineSpinner = _interopRequireDefault(require("../../../../components/views/elements/InlineSpinner"));

var _RestoreKeyBackupDialog = _interopRequireDefault(require("../../../../components/views/dialogs/security/RestoreKeyBackupDialog"));

var _WellKnownUtils = require("../../../../utils/WellKnownUtils");

var _Security = _interopRequireDefault(require("../../../../customisations/Security"));

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
const PHASE_LOADING = 0;
const PHASE_LOADERROR = 1;
const PHASE_CHOOSE_KEY_PASSPHRASE = 2;
const PHASE_MIGRATE = 3;
const PHASE_PASSPHRASE = 4;
const PHASE_PASSPHRASE_CONFIRM = 5;
const PHASE_SHOWKEY = 6;
const PHASE_STORING = 8;
const PHASE_CONFIRM_SKIP = 10;
const PASSWORD_MIN_SCORE = 4; // So secure, many characters, much complex, wow, etc, etc.
// these end up as strings from being values in the radio buttons, so just use strings

const CREATE_STORAGE_OPTION_KEY = 'key';
const CREATE_STORAGE_OPTION_PASSPHRASE = 'passphrase';
/*
 * Walks the user through the process of creating a passphrase to guard Secure
 * Secret Storage in account data.
 */

class CreateSecretStorageDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onKeyBackupStatusChange", () => {
      if (this.state.phase === PHASE_MIGRATE) this._fetchBackupInfo();
    });
    (0, _defineProperty2.default)(this, "_onKeyPassphraseChange", e => {
      this.setState({
        passPhraseKeySelected: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_collectRecoveryKeyNode", n => {
      this._recoveryKeyNode = n;
    });
    (0, _defineProperty2.default)(this, "_onChooseKeyPassphraseFormSubmit", async () => {
      if (this.state.passPhraseKeySelected === CREATE_STORAGE_OPTION_KEY) {
        this._recoveryKey = await _MatrixClientPeg.MatrixClientPeg.get().createRecoveryKeyFromPassphrase();
        this.setState({
          copied: false,
          downloaded: false,
          setPassphrase: false,
          phase: PHASE_SHOWKEY
        });
      } else {
        this.setState({
          copied: false,
          downloaded: false,
          phase: PHASE_PASSPHRASE
        });
      }
    });
    (0, _defineProperty2.default)(this, "_onMigrateFormSubmit", e => {
      e.preventDefault();

      if (this.state.backupSigStatus.usable) {
        this._bootstrapSecretStorage();
      } else {
        this._restoreBackup();
      }
    });
    (0, _defineProperty2.default)(this, "_onCopyClick", () => {
      const successful = (0, _strings.copyNode)(this._recoveryKeyNode);

      if (successful) {
        this.setState({
          copied: true
        });
      }
    });
    (0, _defineProperty2.default)(this, "_onDownloadClick", () => {
      const blob = new Blob([this._recoveryKey.encodedPrivateKey], {
        type: 'text/plain;charset=us-ascii'
      });

      _fileSaver.default.saveAs(blob, 'security-key.txt');

      this.setState({
        downloaded: true
      });
    });
    (0, _defineProperty2.default)(this, "_doBootstrapUIAuth", async makeRequest => {
      if (this.state.canUploadKeysWithPasswordOnly && this.state.accountPassword) {
        await makeRequest({
          type: 'm.login.password',
          identifier: {
            type: 'm.id.user',
            user: _MatrixClientPeg.MatrixClientPeg.get().getUserId()
          },
          // TODO: Remove `user` once servers support proper UIA
          // See https://github.com/matrix-org/synapse/issues/5665
          user: _MatrixClientPeg.MatrixClientPeg.get().getUserId(),
          password: this.state.accountPassword
        });
      } else {
        const InteractiveAuthDialog = sdk.getComponent("dialogs.InteractiveAuthDialog");
        const dialogAesthetics = {
          [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_PREAUTH]: {
            title: (0, _languageHandler._t)("Use Single Sign On to continue"),
            body: (0, _languageHandler._t)("To continue, use Single Sign On to prove your identity."),
            continueText: (0, _languageHandler._t)("Single Sign On"),
            continueKind: "primary"
          },
          [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_POSTAUTH]: {
            title: (0, _languageHandler._t)("Confirm encryption setup"),
            body: (0, _languageHandler._t)("Click the button below to confirm setting up encryption."),
            continueText: (0, _languageHandler._t)("Confirm"),
            continueKind: "primary"
          }
        };

        const {
          finished
        } = _Modal.default.createTrackedDialog('Cross-signing keys dialog', '', InteractiveAuthDialog, {
          title: (0, _languageHandler._t)("Setting up keys"),
          matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
          makeRequest,
          aestheticsForStagePhases: {
            [_InteractiveAuthEntryComponents.SSOAuthEntry.LOGIN_TYPE]: dialogAesthetics,
            [_InteractiveAuthEntryComponents.SSOAuthEntry.UNSTABLE_LOGIN_TYPE]: dialogAesthetics
          }
        });

        const [confirmed] = await finished;

        if (!confirmed) {
          throw new Error("Cross-signing key upload auth canceled");
        }
      }
    });
    (0, _defineProperty2.default)(this, "_bootstrapSecretStorage", async () => {
      this.setState({
        phase: PHASE_STORING,
        error: null
      });

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const {
        forceReset
      } = this.props;

      try {
        if (forceReset) {
          console.log("Forcing secret storage reset");
          await cli.bootstrapSecretStorage({
            createSecretStorageKey: async () => this._recoveryKey,
            setupNewKeyBackup: true,
            setupNewSecretStorage: true
          });
        } else {
          // For password authentication users after 2020-09, this cross-signing
          // step will be a no-op since it is now setup during registration or login
          // when needed. We should keep this here to cover other cases such as:
          //   * Users with existing sessions prior to 2020-09 changes
          //   * SSO authentication users which require interactive auth to upload
          //     keys (and also happen to skip all post-authentication flows at the
          //     moment via token login)
          await cli.bootstrapCrossSigning({
            authUploadDeviceSigningKeys: this._doBootstrapUIAuth
          });
          await cli.bootstrapSecretStorage({
            createSecretStorageKey: async () => this._recoveryKey,
            keyBackupInfo: this.state.backupInfo,
            setupNewKeyBackup: !this.state.backupInfo,
            getKeyBackupPassphrase: () => {
              // We may already have the backup key if we earlier went
              // through the restore backup path, so pass it along
              // rather than prompting again.
              if (this._backupKey) {
                return this._backupKey;
              }

              return (0, _SecurityManager.promptForBackupPassphrase)();
            }
          });
        }

        this.props.onFinished(true);
      } catch (e) {
        if (this.state.canUploadKeysWithPasswordOnly && e.httpStatus === 401 && e.data.flows) {
          this.setState({
            accountPassword: '',
            accountPasswordCorrect: false,
            phase: PHASE_MIGRATE
          });
        } else {
          this.setState({
            error: e
          });
        }

        console.error("Error bootstrapping secret storage", e);
      }
    });
    (0, _defineProperty2.default)(this, "_onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onDone", () => {
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "_restoreBackup", async () => {
      // It's possible we'll need the backup key later on for bootstrapping,
      // so let's stash it here, rather than prompting for it twice.
      const keyCallback = k => this._backupKey = k;

      const {
        finished
      } = _Modal.default.createTrackedDialog('Restore Backup', '', _RestoreKeyBackupDialog.default, {
        showSummary: false,
        keyCallback
      }, null,
      /* priority = */
      false,
      /* static = */
      false);

      await finished;
      const {
        backupSigStatus
      } = await this._fetchBackupInfo();

      if (backupSigStatus.usable && this.state.canUploadKeysWithPasswordOnly && this.state.accountPassword) {
        this._bootstrapSecretStorage();
      }
    });
    (0, _defineProperty2.default)(this, "_onLoadRetryClick", () => {
      this.setState({
        phase: PHASE_LOADING
      });

      this._fetchBackupInfo();
    });
    (0, _defineProperty2.default)(this, "_onShowKeyContinueClick", () => {
      this._bootstrapSecretStorage();
    });
    (0, _defineProperty2.default)(this, "_onCancelClick", () => {
      this.setState({
        phase: PHASE_CONFIRM_SKIP
      });
    });
    (0, _defineProperty2.default)(this, "_onGoBackClick", () => {
      this.setState({
        phase: PHASE_CHOOSE_KEY_PASSPHRASE
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
      this._recoveryKey = await _MatrixClientPeg.MatrixClientPeg.get().createRecoveryKeyFromPassphrase(this.state.passPhrase);
      this.setState({
        copied: false,
        downloaded: false,
        setPassphrase: true,
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
    (0, _defineProperty2.default)(this, "_onAccountPasswordChange", e => {
      this.setState({
        accountPassword: e.target.value
      });
    });
    this._recoveryKey = null;
    this._recoveryKeyNode = null;
    this._backupKey = null;
    this.state = {
      phase: PHASE_LOADING,
      passPhrase: '',
      passPhraseValid: false,
      passPhraseConfirm: '',
      copied: false,
      downloaded: false,
      setPassphrase: false,
      backupInfo: null,
      backupSigStatus: null,
      // does the server offer a UI auth flow with just m.login.password
      // for /keys/device_signing/upload?
      canUploadKeysWithPasswordOnly: null,
      accountPassword: props.accountPassword || "",
      accountPasswordCorrect: null,
      canSkip: !(0, _WellKnownUtils.isSecureBackupRequired)()
    };
    const setupMethods = (0, _WellKnownUtils.getSecureBackupSetupMethods)();

    if (setupMethods.includes("key")) {
      this.state.passPhraseKeySelected = CREATE_STORAGE_OPTION_KEY;
    } else {
      this.state.passPhraseKeySelected = CREATE_STORAGE_OPTION_PASSPHRASE;
    }

    this._passphraseField = /*#__PURE__*/(0, _react.createRef)();

    _MatrixClientPeg.MatrixClientPeg.get().on('crypto.keyBackupStatus', this._onKeyBackupStatusChange);

    if (this.state.accountPassword) {
      // If we have an account password in memory, let's simplify and
      // assume it means password auth is also supported for device
      // signing key upload as well. This avoids hitting the server to
      // test auth flows, which may be slow under high load.
      this.state.canUploadKeysWithPasswordOnly = true;
    } else {
      this._queryKeyUploadAuth();
    }

    this._getInitialPhase();
  }

  componentWillUnmount() {
    _MatrixClientPeg.MatrixClientPeg.get().removeListener('crypto.keyBackupStatus', this._onKeyBackupStatusChange);
  }

  _getInitialPhase() {
    const keyFromCustomisations = _Security.default.createSecretStorageKey?.();

    if (keyFromCustomisations) {
      console.log("Created key via customisations, jumping to bootstrap step");
      this._recoveryKey = {
        privateKey: keyFromCustomisations
      };

      this._bootstrapSecretStorage();

      return;
    }

    this._fetchBackupInfo();
  }

  async _fetchBackupInfo() {
    try {
      const backupInfo = await _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupVersion();
      const backupSigStatus = // we may not have started crypto yet, in which case we definitely don't trust the backup
      _MatrixClientPeg.MatrixClientPeg.get().isCryptoEnabled() && (await _MatrixClientPeg.MatrixClientPeg.get().isKeyBackupTrusted(backupInfo));
      const {
        forceReset
      } = this.props;
      const phase = backupInfo && !forceReset ? PHASE_MIGRATE : PHASE_CHOOSE_KEY_PASSPHRASE;
      this.setState({
        phase,
        backupInfo,
        backupSigStatus
      });
      return {
        backupInfo,
        backupSigStatus
      };
    } catch (e) {
      this.setState({
        phase: PHASE_LOADERROR
      });
    }
  }

  async _queryKeyUploadAuth() {
    try {
      await _MatrixClientPeg.MatrixClientPeg.get().uploadDeviceSigningKeys(null, {}); // We should never get here: the server should always require
      // UI auth to upload device signing keys. If we do, we upload
      // no keys which would be a no-op.

      console.log("uploadDeviceSigningKeys unexpectedly succeeded without UI auth!");
    } catch (error) {
      if (!error.data || !error.data.flows) {
        console.log("uploadDeviceSigningKeys advertised no flows!");
        return;
      }

      const canUploadKeysWithPasswordOnly = error.data.flows.some(f => {
        return f.stages.length === 1 && f.stages[0] === 'm.login.password';
      });
      this.setState({
        canUploadKeysWithPasswordOnly
      });
    }
  }

  _renderOptionKey() {
    return /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
      key: CREATE_STORAGE_OPTION_KEY,
      value: CREATE_STORAGE_OPTION_KEY,
      name: "keyPassphrase",
      checked: this.state.passPhraseKeySelected === CREATE_STORAGE_OPTION_KEY,
      onChange: this._onKeyPassphraseChange,
      outlined: true
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_optionTitle"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CreateSecretStorageDialog_optionIcon mx_CreateSecretStorageDialog_optionIcon_secureBackup"
    }), (0, _languageHandler._t)("Generate a Security Key")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("We’ll generate a Security Key for you to store somewhere safe, like a password manager or a safe.")));
  }

  _renderOptionPassphrase() {
    return /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
      key: CREATE_STORAGE_OPTION_PASSPHRASE,
      value: CREATE_STORAGE_OPTION_PASSPHRASE,
      name: "keyPassphrase",
      checked: this.state.passPhraseKeySelected === CREATE_STORAGE_OPTION_PASSPHRASE,
      onChange: this._onKeyPassphraseChange,
      outlined: true
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_optionTitle"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CreateSecretStorageDialog_optionIcon mx_CreateSecretStorageDialog_optionIcon_securePhrase"
    }), (0, _languageHandler._t)("Enter a Security Phrase")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Use a secret phrase only you know, and optionally save a Security Key to use for backup.")));
  }

  _renderPhaseChooseKeyPassphrase() {
    const setupMethods = (0, _WellKnownUtils.getSecureBackupSetupMethods)();
    const optionKey = setupMethods.includes("key") ? this._renderOptionKey() : null;
    const optionPassphrase = setupMethods.includes("passphrase") ? this._renderOptionPassphrase() : null;
    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onChooseKeyPassphraseFormSubmit
    }, /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_CreateSecretStorageDialog_centeredBody"
    }, (0, _languageHandler._t)("Safeguard against losing access to encrypted messages & data by " + "backing up encryption keys on your server.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_primaryContainer",
      role: "radiogroup"
    }, optionKey, optionPassphrase), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Continue"),
      onPrimaryButtonClick: this._onChooseKeyPassphraseFormSubmit,
      onCancel: this._onCancelClick,
      hasCancel: this.state.canSkip
    }));
  }

  _renderPhaseMigrate() {
    // TODO: This is a temporary screen so people who have the labs flag turned on and
    // click the button are aware they're making a change to their account.
    // Once we're confident enough in this (and it's supported enough) we can do
    // it automatically.
    // https://github.com/vector-im/element-web/issues/11696
    const Field = sdk.getComponent('views.elements.Field');
    let authPrompt;
    let nextCaption = (0, _languageHandler._t)("Next");

    if (this.state.canUploadKeysWithPasswordOnly) {
      authPrompt = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Enter your account password to confirm the upgrade:")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Field, {
        type: "password",
        label: (0, _languageHandler._t)("Password"),
        value: this.state.accountPassword,
        onChange: this._onAccountPasswordChange,
        forceValidity: this.state.accountPasswordCorrect === false ? false : null,
        autoFocus: true
      })));
    } else if (!this.state.backupSigStatus.usable) {
      authPrompt = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Restore your key backup to upgrade your encryption")));
      nextCaption = (0, _languageHandler._t)("Restore");
    } else {
      authPrompt = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You'll need to authenticate with the server to confirm the upgrade."));
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onMigrateFormSubmit
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Upgrade this session to allow it to verify other sessions, " + "granting them access to encrypted messages and marking them " + "as trusted for other users.")), /*#__PURE__*/_react.default.createElement("div", null, authPrompt), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: nextCaption,
      onPrimaryButtonClick: this._onMigrateFormSubmit,
      hasCancel: false,
      primaryDisabled: this.state.canUploadKeysWithPasswordOnly && !this.state.accountPassword
    }, /*#__PURE__*/_react.default.createElement("button", {
      type: "button",
      className: "danger",
      onClick: this._onCancelClick
    }, (0, _languageHandler._t)('Skip'))));
  }

  _renderPhasePassPhrase() {
    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onPassPhraseNextClick
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Enter a security phrase only you know, as it’s used to safeguard your data. " + "To be secure, you shouldn’t re-use your account password.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_passPhraseContainer"
    }, /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
      className: "mx_CreateSecretStorageDialog_passPhraseField",
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
    })), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Continue'),
      onPrimaryButtonClick: this._onPassPhraseNextClick,
      hasCancel: false,
      disabled: !this.state.passPhraseValid
    }, /*#__PURE__*/_react.default.createElement("button", {
      type: "button",
      onClick: this._onCancelClick,
      className: "danger"
    }, (0, _languageHandler._t)("Cancel"))));
  }

  _renderPhasePassPhraseConfirm() {
    const Field = sdk.getComponent('views.elements.Field');
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
      passPhraseMatch = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, matchText), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        element: "span",
        className: "mx_linkButton",
        onClick: this._onSetAgainClick
      }, changeText)));
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onPassPhraseConfirmNextClick
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Enter your recovery passphrase a second time to confirm it.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_passPhraseContainer"
    }, /*#__PURE__*/_react.default.createElement(Field, {
      type: "password",
      onChange: this._onPassPhraseConfirmChange,
      value: this.state.passPhraseConfirm,
      className: "mx_CreateSecretStorageDialog_passPhraseField",
      label: (0, _languageHandler._t)("Confirm your recovery passphrase"),
      autoFocus: true,
      autoComplete: "new-password"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_passPhraseMatch"
    }, passPhraseMatch)), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Continue'),
      onPrimaryButtonClick: this._onPassPhraseConfirmNextClick,
      hasCancel: false,
      disabled: this.state.passPhrase !== this.state.passPhraseConfirm
    }, /*#__PURE__*/_react.default.createElement("button", {
      type: "button",
      onClick: this._onCancelClick,
      className: "danger"
    }, (0, _languageHandler._t)("Skip"))));
  }

  _renderPhaseShowKey() {
    let continueButton;

    if (this.state.phase === PHASE_SHOWKEY) {
      continueButton = /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)("Continue"),
        disabled: !this.state.downloaded && !this.state.copied && !this.state.setPassphrase,
        onPrimaryButtonClick: this._onShowKeyContinueClick,
        hasCancel: false
      });
    } else {
      continueButton = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CreateSecretStorageDialog_continueSpinner"
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Store your Security Key somewhere safe, like a password manager or a safe, " + "as it’s used to safeguard your encrypted data.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_primaryContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_recoveryKeyContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_recoveryKey"
    }, /*#__PURE__*/_react.default.createElement("code", {
      ref: this._collectRecoveryKeyNode
    }, this._recoveryKey.encodedPrivateKey)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_recoveryKeyButtons"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      className: "mx_Dialog_primary",
      onClick: this._onDownloadClick,
      disabled: this.state.phase === PHASE_STORING
    }, (0, _languageHandler._t)("Download")), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("or")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      className: "mx_Dialog_primary mx_CreateSecretStorageDialog_recoveryKeyButtons_copyBtn",
      onClick: this._onCopyClick,
      disabled: this.state.phase === PHASE_STORING
    }, this.state.copied ? (0, _languageHandler._t)("Copied!") : (0, _languageHandler._t)("Copy"))))), continueButton);
  }

  _renderBusyPhase() {
    const Spinner = sdk.getComponent('views.elements.Spinner');
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Spinner, null));
  }

  _renderPhaseLoadError() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to query secret storage status")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Retry'),
      onPrimaryButtonClick: this._onLoadRetryClick,
      hasCancel: this.state.canSkip,
      onCancel: this._onCancel
    })));
  }

  _renderPhaseSkipConfirm() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you cancel now, you may lose encrypted messages & data if you lose access to your logins.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You can also set up Secure Backup & manage your keys in Settings.")), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Go back'),
      onPrimaryButtonClick: this._onGoBackClick,
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("button", {
      type: "button",
      className: "danger",
      onClick: this._onCancel
    }, (0, _languageHandler._t)('Cancel'))));
  }

  _titleForPhase(phase) {
    switch (phase) {
      case PHASE_CHOOSE_KEY_PASSPHRASE:
        return (0, _languageHandler._t)('Set up Secure Backup');

      case PHASE_MIGRATE:
        return (0, _languageHandler._t)('Upgrade your encryption');

      case PHASE_PASSPHRASE:
        return (0, _languageHandler._t)('Set a Security Phrase');

      case PHASE_PASSPHRASE_CONFIRM:
        return (0, _languageHandler._t)('Confirm Security Phrase');

      case PHASE_CONFIRM_SKIP:
        return (0, _languageHandler._t)('Are you sure?');

      case PHASE_SHOWKEY:
        return (0, _languageHandler._t)('Save your Security Key');

      case PHASE_STORING:
        return (0, _languageHandler._t)('Setting up keys');

      default:
        return '';
    }
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    let content;

    if (this.state.error) {
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to set up secret storage")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Retry'),
        onPrimaryButtonClick: this._bootstrapSecretStorage,
        hasCancel: this.state.canSkip,
        onCancel: this._onCancel
      })));
    } else {
      switch (this.state.phase) {
        case PHASE_LOADING:
          content = this._renderBusyPhase();
          break;

        case PHASE_LOADERROR:
          content = this._renderPhaseLoadError();
          break;

        case PHASE_CHOOSE_KEY_PASSPHRASE:
          content = this._renderPhaseChooseKeyPassphrase();
          break;

        case PHASE_MIGRATE:
          content = this._renderPhaseMigrate();
          break;

        case PHASE_PASSPHRASE:
          content = this._renderPhasePassPhrase();
          break;

        case PHASE_PASSPHRASE_CONFIRM:
          content = this._renderPhasePassPhraseConfirm();
          break;

        case PHASE_SHOWKEY:
          content = this._renderPhaseShowKey();
          break;

        case PHASE_STORING:
          content = this._renderBusyPhase();
          break;

        case PHASE_CONFIRM_SKIP:
          content = this._renderPhaseSkipConfirm();
          break;
      }
    }

    let titleClass = null;

    switch (this.state.phase) {
      case PHASE_PASSPHRASE:
      case PHASE_PASSPHRASE_CONFIRM:
        titleClass = ['mx_CreateSecretStorageDialog_titleWithIcon', 'mx_CreateSecretStorageDialog_securePhraseTitle'];
        break;

      case PHASE_SHOWKEY:
        titleClass = ['mx_CreateSecretStorageDialog_titleWithIcon', 'mx_CreateSecretStorageDialog_secureBackupTitle'];
        break;

      case PHASE_CHOOSE_KEY_PASSPHRASE:
        titleClass = 'mx_CreateSecretStorageDialog_centeredTitle';
        break;
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_CreateSecretStorageDialog",
      onFinished: this.props.onFinished,
      title: this._titleForPhase(this.state.phase),
      titleClass: titleClass,
      hasCancel: this.props.hasCancel && [PHASE_PASSPHRASE].includes(this.state.phase),
      fixedWidth: false
    }, /*#__PURE__*/_react.default.createElement("div", null, content));
  }

}

exports.default = CreateSecretStorageDialog;
(0, _defineProperty2.default)(CreateSecretStorageDialog, "propTypes", {
  hasCancel: _propTypes.default.bool,
  accountPassword: _propTypes.default.string,
  forceReset: _propTypes.default.bool
});
(0, _defineProperty2.default)(CreateSecretStorageDialog, "defaultProps", {
  hasCancel: true,
  forceReset: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZy5qcyJdLCJuYW1lcyI6WyJQSEFTRV9MT0FESU5HIiwiUEhBU0VfTE9BREVSUk9SIiwiUEhBU0VfQ0hPT1NFX0tFWV9QQVNTUEhSQVNFIiwiUEhBU0VfTUlHUkFURSIsIlBIQVNFX1BBU1NQSFJBU0UiLCJQSEFTRV9QQVNTUEhSQVNFX0NPTkZJUk0iLCJQSEFTRV9TSE9XS0VZIiwiUEhBU0VfU1RPUklORyIsIlBIQVNFX0NPTkZJUk1fU0tJUCIsIlBBU1NXT1JEX01JTl9TQ09SRSIsIkNSRUFURV9TVE9SQUdFX09QVElPTl9LRVkiLCJDUkVBVEVfU1RPUkFHRV9PUFRJT05fUEFTU1BIUkFTRSIsIkNyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3RhdGUiLCJwaGFzZSIsIl9mZXRjaEJhY2t1cEluZm8iLCJlIiwic2V0U3RhdGUiLCJwYXNzUGhyYXNlS2V5U2VsZWN0ZWQiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm4iLCJfcmVjb3ZlcnlLZXlOb2RlIiwiX3JlY292ZXJ5S2V5IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiY3JlYXRlUmVjb3ZlcnlLZXlGcm9tUGFzc3BocmFzZSIsImNvcGllZCIsImRvd25sb2FkZWQiLCJzZXRQYXNzcGhyYXNlIiwicHJldmVudERlZmF1bHQiLCJiYWNrdXBTaWdTdGF0dXMiLCJ1c2FibGUiLCJfYm9vdHN0cmFwU2VjcmV0U3RvcmFnZSIsIl9yZXN0b3JlQmFja3VwIiwic3VjY2Vzc2Z1bCIsImJsb2IiLCJCbG9iIiwiZW5jb2RlZFByaXZhdGVLZXkiLCJ0eXBlIiwiRmlsZVNhdmVyIiwic2F2ZUFzIiwibWFrZVJlcXVlc3QiLCJjYW5VcGxvYWRLZXlzV2l0aFBhc3N3b3JkT25seSIsImFjY291bnRQYXNzd29yZCIsImlkZW50aWZpZXIiLCJ1c2VyIiwiZ2V0VXNlcklkIiwicGFzc3dvcmQiLCJJbnRlcmFjdGl2ZUF1dGhEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJkaWFsb2dBZXN0aGV0aWNzIiwiU1NPQXV0aEVudHJ5IiwiUEhBU0VfUFJFQVVUSCIsInRpdGxlIiwiYm9keSIsImNvbnRpbnVlVGV4dCIsImNvbnRpbnVlS2luZCIsIlBIQVNFX1BPU1RBVVRIIiwiZmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJtYXRyaXhDbGllbnQiLCJhZXN0aGV0aWNzRm9yU3RhZ2VQaGFzZXMiLCJMT0dJTl9UWVBFIiwiVU5TVEFCTEVfTE9HSU5fVFlQRSIsImNvbmZpcm1lZCIsIkVycm9yIiwiZXJyb3IiLCJjbGkiLCJmb3JjZVJlc2V0IiwiY29uc29sZSIsImxvZyIsImJvb3RzdHJhcFNlY3JldFN0b3JhZ2UiLCJjcmVhdGVTZWNyZXRTdG9yYWdlS2V5Iiwic2V0dXBOZXdLZXlCYWNrdXAiLCJzZXR1cE5ld1NlY3JldFN0b3JhZ2UiLCJib290c3RyYXBDcm9zc1NpZ25pbmciLCJhdXRoVXBsb2FkRGV2aWNlU2lnbmluZ0tleXMiLCJfZG9Cb290c3RyYXBVSUF1dGgiLCJrZXlCYWNrdXBJbmZvIiwiYmFja3VwSW5mbyIsImdldEtleUJhY2t1cFBhc3NwaHJhc2UiLCJfYmFja3VwS2V5Iiwib25GaW5pc2hlZCIsImh0dHBTdGF0dXMiLCJkYXRhIiwiZmxvd3MiLCJhY2NvdW50UGFzc3dvcmRDb3JyZWN0Iiwia2V5Q2FsbGJhY2siLCJrIiwiUmVzdG9yZUtleUJhY2t1cERpYWxvZyIsInNob3dTdW1tYXJ5IiwiX3Bhc3NwaHJhc2VGaWVsZCIsImN1cnJlbnQiLCJ2YWxpZGF0ZSIsImFsbG93RW1wdHkiLCJ2YWxpZCIsImZvY3VzIiwiZm9jdXNlZCIsInBhc3NQaHJhc2UiLCJwYXNzUGhyYXNlQ29uZmlybSIsInBhc3NQaHJhc2VWYWxpZCIsInJlc3VsdCIsImNhblNraXAiLCJzZXR1cE1ldGhvZHMiLCJpbmNsdWRlcyIsIm9uIiwiX29uS2V5QmFja3VwU3RhdHVzQ2hhbmdlIiwiX3F1ZXJ5S2V5VXBsb2FkQXV0aCIsIl9nZXRJbml0aWFsUGhhc2UiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwia2V5RnJvbUN1c3RvbWlzYXRpb25zIiwiU2VjdXJpdHlDdXN0b21pc2F0aW9ucyIsInByaXZhdGVLZXkiLCJnZXRLZXlCYWNrdXBWZXJzaW9uIiwiaXNDcnlwdG9FbmFibGVkIiwiaXNLZXlCYWNrdXBUcnVzdGVkIiwidXBsb2FkRGV2aWNlU2lnbmluZ0tleXMiLCJzb21lIiwiZiIsInN0YWdlcyIsImxlbmd0aCIsIl9yZW5kZXJPcHRpb25LZXkiLCJfb25LZXlQYXNzcGhyYXNlQ2hhbmdlIiwiX3JlbmRlck9wdGlvblBhc3NwaHJhc2UiLCJfcmVuZGVyUGhhc2VDaG9vc2VLZXlQYXNzcGhyYXNlIiwib3B0aW9uS2V5Iiwib3B0aW9uUGFzc3BocmFzZSIsIl9vbkNob29zZUtleVBhc3NwaHJhc2VGb3JtU3VibWl0IiwiX29uQ2FuY2VsQ2xpY2siLCJfcmVuZGVyUGhhc2VNaWdyYXRlIiwiRmllbGQiLCJhdXRoUHJvbXB0IiwibmV4dENhcHRpb24iLCJfb25BY2NvdW50UGFzc3dvcmRDaGFuZ2UiLCJfb25NaWdyYXRlRm9ybVN1Ym1pdCIsIl9yZW5kZXJQaGFzZVBhc3NQaHJhc2UiLCJfb25QYXNzUGhyYXNlTmV4dENsaWNrIiwiX29uUGFzc1BocmFzZUNoYW5nZSIsIl9vblBhc3NQaHJhc2VWYWxpZGF0ZSIsIl9yZW5kZXJQaGFzZVBhc3NQaHJhc2VDb25maXJtIiwibWF0Y2hUZXh0IiwiY2hhbmdlVGV4dCIsInN0YXJ0c1dpdGgiLCJwYXNzUGhyYXNlTWF0Y2giLCJfb25TZXRBZ2FpbkNsaWNrIiwiX29uUGFzc1BocmFzZUNvbmZpcm1OZXh0Q2xpY2siLCJfb25QYXNzUGhyYXNlQ29uZmlybUNoYW5nZSIsIl9yZW5kZXJQaGFzZVNob3dLZXkiLCJjb250aW51ZUJ1dHRvbiIsIl9vblNob3dLZXlDb250aW51ZUNsaWNrIiwiX2NvbGxlY3RSZWNvdmVyeUtleU5vZGUiLCJfb25Eb3dubG9hZENsaWNrIiwiX29uQ29weUNsaWNrIiwiX3JlbmRlckJ1c3lQaGFzZSIsIlNwaW5uZXIiLCJfcmVuZGVyUGhhc2VMb2FkRXJyb3IiLCJfb25Mb2FkUmV0cnlDbGljayIsIl9vbkNhbmNlbCIsIl9yZW5kZXJQaGFzZVNraXBDb25maXJtIiwiX29uR29CYWNrQ2xpY2siLCJfdGl0bGVGb3JQaGFzZSIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJjb250ZW50IiwidGl0bGVDbGFzcyIsImhhc0NhbmNlbCIsIlByb3BUeXBlcyIsImJvb2wiLCJzdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBcUJBLE1BQU1BLGFBQWEsR0FBRyxDQUF0QjtBQUNBLE1BQU1DLGVBQWUsR0FBRyxDQUF4QjtBQUNBLE1BQU1DLDJCQUEyQixHQUFHLENBQXBDO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLENBQXRCO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsQ0FBekI7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxDQUFqQztBQUNBLE1BQU1DLGFBQWEsR0FBRyxDQUF0QjtBQUNBLE1BQU1DLGFBQWEsR0FBRyxDQUF0QjtBQUNBLE1BQU1DLGtCQUFrQixHQUFHLEVBQTNCO0FBRUEsTUFBTUMsa0JBQWtCLEdBQUcsQ0FBM0IsQyxDQUE4QjtBQUU5Qjs7QUFDQSxNQUFNQyx5QkFBeUIsR0FBRyxLQUFsQztBQUNBLE1BQU1DLGdDQUFnQyxHQUFHLFlBQXpD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LG1CQUFVQztBQUhQLEM7OEJBREZuSyx5QixrQkFPSztBQUNsQmlLLEVBQUFBLFNBQVMsRUFBRSxJQURPO0FBRWxCbEcsRUFBQUEsVUFBVSxFQUFFO0FBRk0sQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgRmlsZVNhdmVyIGZyb20gJ2ZpbGUtc2F2ZXInO1xuaW1wb3J0IHtfdCwgX3RkfSBmcm9tICcuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IHByb21wdEZvckJhY2t1cFBhc3NwaHJhc2UgfSBmcm9tICcuLi8uLi8uLi8uLi9TZWN1cml0eU1hbmFnZXInO1xuaW1wb3J0IHtjb3B5Tm9kZX0gZnJvbSBcIi4uLy4uLy4uLy4uL3V0aWxzL3N0cmluZ3NcIjtcbmltcG9ydCB7U1NPQXV0aEVudHJ5fSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9hdXRoL0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c1wiO1xuaW1wb3J0IFBhc3NwaHJhc2VGaWVsZCBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9hdXRoL1Bhc3NwaHJhc2VGaWVsZFwiO1xuaW1wb3J0IFN0eWxlZFJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvU3R5bGVkUmFkaW9CdXR0b24nO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvSW5saW5lU3Bpbm5lclwiO1xuaW1wb3J0IFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9SZXN0b3JlS2V5QmFja3VwRGlhbG9nXCI7XG5pbXBvcnQgeyBnZXRTZWN1cmVCYWNrdXBTZXR1cE1ldGhvZHMsIGlzU2VjdXJlQmFja3VwUmVxdWlyZWQgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9XZWxsS25vd25VdGlscyc7XG5pbXBvcnQgU2VjdXJpdHlDdXN0b21pc2F0aW9ucyBmcm9tIFwiLi4vLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvU2VjdXJpdHlcIjtcblxuY29uc3QgUEhBU0VfTE9BRElORyA9IDA7XG5jb25zdCBQSEFTRV9MT0FERVJST1IgPSAxO1xuY29uc3QgUEhBU0VfQ0hPT1NFX0tFWV9QQVNTUEhSQVNFID0gMjtcbmNvbnN0IFBIQVNFX01JR1JBVEUgPSAzO1xuY29uc3QgUEhBU0VfUEFTU1BIUkFTRSA9IDQ7XG5jb25zdCBQSEFTRV9QQVNTUEhSQVNFX0NPTkZJUk0gPSA1O1xuY29uc3QgUEhBU0VfU0hPV0tFWSA9IDY7XG5jb25zdCBQSEFTRV9TVE9SSU5HID0gODtcbmNvbnN0IFBIQVNFX0NPTkZJUk1fU0tJUCA9IDEwO1xuXG5jb25zdCBQQVNTV09SRF9NSU5fU0NPUkUgPSA0OyAvLyBTbyBzZWN1cmUsIG1hbnkgY2hhcmFjdGVycywgbXVjaCBjb21wbGV4LCB3b3csIGV0YywgZXRjLlxuXG4vLyB0aGVzZSBlbmQgdXAgYXMgc3RyaW5ncyBmcm9tIGJlaW5nIHZhbHVlcyBpbiB0aGUgcmFkaW8gYnV0dG9ucywgc28ganVzdCB1c2Ugc3RyaW5nc1xuY29uc3QgQ1JFQVRFX1NUT1JBR0VfT1BUSU9OX0tFWSA9ICdrZXknO1xuY29uc3QgQ1JFQVRFX1NUT1JBR0VfT1BUSU9OX1BBU1NQSFJBU0UgPSAncGFzc3BocmFzZSc7XG5cbi8qXG4gKiBXYWxrcyB0aGUgdXNlciB0aHJvdWdoIHRoZSBwcm9jZXNzIG9mIGNyZWF0aW5nIGEgcGFzc3BocmFzZSB0byBndWFyZCBTZWN1cmVcbiAqIFNlY3JldCBTdG9yYWdlIGluIGFjY291bnQgZGF0YS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGhhc0NhbmNlbDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGFjY291bnRQYXNzd29yZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgZm9yY2VSZXNldDogUHJvcFR5cGVzLmJvb2wsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGhhc0NhbmNlbDogdHJ1ZSxcbiAgICAgICAgZm9yY2VSZXNldDogZmFsc2UsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl9yZWNvdmVyeUtleSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3JlY292ZXJ5S2V5Tm9kZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2JhY2t1cEtleSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9MT0FESU5HLFxuICAgICAgICAgICAgcGFzc1BocmFzZTogJycsXG4gICAgICAgICAgICBwYXNzUGhyYXNlVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGFzc1BocmFzZUNvbmZpcm06ICcnLFxuICAgICAgICAgICAgY29waWVkOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd25sb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgc2V0UGFzc3BocmFzZTogZmFsc2UsXG4gICAgICAgICAgICBiYWNrdXBJbmZvOiBudWxsLFxuICAgICAgICAgICAgYmFja3VwU2lnU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgLy8gZG9lcyB0aGUgc2VydmVyIG9mZmVyIGEgVUkgYXV0aCBmbG93IHdpdGgganVzdCBtLmxvZ2luLnBhc3N3b3JkXG4gICAgICAgICAgICAvLyBmb3IgL2tleXMvZGV2aWNlX3NpZ25pbmcvdXBsb2FkP1xuICAgICAgICAgICAgY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHk6IG51bGwsXG4gICAgICAgICAgICBhY2NvdW50UGFzc3dvcmQ6IHByb3BzLmFjY291bnRQYXNzd29yZCB8fCBcIlwiLFxuICAgICAgICAgICAgYWNjb3VudFBhc3N3b3JkQ29ycmVjdDogbnVsbCxcbiAgICAgICAgICAgIGNhblNraXA6ICFpc1NlY3VyZUJhY2t1cFJlcXVpcmVkKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgc2V0dXBNZXRob2RzID0gZ2V0U2VjdXJlQmFja3VwU2V0dXBNZXRob2RzKCk7XG4gICAgICAgIGlmIChzZXR1cE1ldGhvZHMuaW5jbHVkZXMoXCJrZXlcIikpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucGFzc1BocmFzZUtleVNlbGVjdGVkID0gQ1JFQVRFX1NUT1JBR0VfT1BUSU9OX0tFWTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucGFzc1BocmFzZUtleVNlbGVjdGVkID0gQ1JFQVRFX1NUT1JBR0VfT1BUSU9OX1BBU1NQSFJBU0U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYXNzcGhyYXNlRmllbGQgPSBjcmVhdGVSZWYoKTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oJ2NyeXB0by5rZXlCYWNrdXBTdGF0dXMnLCB0aGlzLl9vbktleUJhY2t1cFN0YXR1c0NoYW5nZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWNjb3VudFBhc3N3b3JkKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGFjY291bnQgcGFzc3dvcmQgaW4gbWVtb3J5LCBsZXQncyBzaW1wbGlmeSBhbmRcbiAgICAgICAgICAgIC8vIGFzc3VtZSBpdCBtZWFucyBwYXNzd29yZCBhdXRoIGlzIGFsc28gc3VwcG9ydGVkIGZvciBkZXZpY2VcbiAgICAgICAgICAgIC8vIHNpZ25pbmcga2V5IHVwbG9hZCBhcyB3ZWxsLiBUaGlzIGF2b2lkcyBoaXR0aW5nIHRoZSBzZXJ2ZXIgdG9cbiAgICAgICAgICAgIC8vIHRlc3QgYXV0aCBmbG93cywgd2hpY2ggbWF5IGJlIHNsb3cgdW5kZXIgaGlnaCBsb2FkLlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5jYW5VcGxvYWRLZXlzV2l0aFBhc3N3b3JkT25seSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9xdWVyeUtleVVwbG9hZEF1dGgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2dldEluaXRpYWxQaGFzZSgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoJ2NyeXB0by5rZXlCYWNrdXBTdGF0dXMnLCB0aGlzLl9vbktleUJhY2t1cFN0YXR1c0NoYW5nZSk7XG4gICAgfVxuXG4gICAgX2dldEluaXRpYWxQaGFzZSgpIHtcbiAgICAgICAgY29uc3Qga2V5RnJvbUN1c3RvbWlzYXRpb25zID0gU2VjdXJpdHlDdXN0b21pc2F0aW9ucy5jcmVhdGVTZWNyZXRTdG9yYWdlS2V5Py4oKTtcbiAgICAgICAgaWYgKGtleUZyb21DdXN0b21pc2F0aW9ucykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDcmVhdGVkIGtleSB2aWEgY3VzdG9taXNhdGlvbnMsIGp1bXBpbmcgdG8gYm9vdHN0cmFwIHN0ZXBcIik7XG4gICAgICAgICAgICB0aGlzLl9yZWNvdmVyeUtleSA9IHtcbiAgICAgICAgICAgICAgICBwcml2YXRlS2V5OiBrZXlGcm9tQ3VzdG9taXNhdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5fYm9vdHN0cmFwU2VjcmV0U3RvcmFnZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZmV0Y2hCYWNrdXBJbmZvKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2ZldGNoQmFja3VwSW5mbygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cEluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwVmVyc2lvbigpO1xuICAgICAgICAgICAgY29uc3QgYmFja3VwU2lnU3RhdHVzID0gKFxuICAgICAgICAgICAgICAgIC8vIHdlIG1heSBub3QgaGF2ZSBzdGFydGVkIGNyeXB0byB5ZXQsIGluIHdoaWNoIGNhc2Ugd2UgZGVmaW5pdGVseSBkb24ndCB0cnVzdCB0aGUgYmFja3VwXG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzQ3J5cHRvRW5hYmxlZCgpICYmIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0tleUJhY2t1cFRydXN0ZWQoYmFja3VwSW5mbylcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IHsgZm9yY2VSZXNldCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IHBoYXNlID0gKGJhY2t1cEluZm8gJiYgIWZvcmNlUmVzZXQpID8gUEhBU0VfTUlHUkFURSA6IFBIQVNFX0NIT09TRV9LRVlfUEFTU1BIUkFTRTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbyxcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXMsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBiYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgIGJhY2t1cFNpZ1N0YXR1cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3BoYXNlOiBQSEFTRV9MT0FERVJST1J9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9xdWVyeUtleVVwbG9hZEF1dGgoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudXBsb2FkRGV2aWNlU2lnbmluZ0tleXMobnVsbCwge30pO1xuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIG5ldmVyIGdldCBoZXJlOiB0aGUgc2VydmVyIHNob3VsZCBhbHdheXMgcmVxdWlyZVxuICAgICAgICAgICAgLy8gVUkgYXV0aCB0byB1cGxvYWQgZGV2aWNlIHNpZ25pbmcga2V5cy4gSWYgd2UgZG8sIHdlIHVwbG9hZFxuICAgICAgICAgICAgLy8gbm8ga2V5cyB3aGljaCB3b3VsZCBiZSBhIG5vLW9wLlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ1cGxvYWREZXZpY2VTaWduaW5nS2V5cyB1bmV4cGVjdGVkbHkgc3VjY2VlZGVkIHdpdGhvdXQgVUkgYXV0aCFcIik7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoIWVycm9yLmRhdGEgfHwgIWVycm9yLmRhdGEuZmxvd3MpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInVwbG9hZERldmljZVNpZ25pbmdLZXlzIGFkdmVydGlzZWQgbm8gZmxvd3MhXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5ID0gZXJyb3IuZGF0YS5mbG93cy5zb21lKGYgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBmLnN0YWdlcy5sZW5ndGggPT09IDEgJiYgZi5zdGFnZXNbMF0gPT09ICdtLmxvZ2luLnBhc3N3b3JkJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbktleUJhY2t1cFN0YXR1c0NoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGhhc2UgPT09IFBIQVNFX01JR1JBVEUpIHRoaXMuX2ZldGNoQmFja3VwSW5mbygpO1xuICAgIH1cblxuICAgIF9vbktleVBhc3NwaHJhc2VDaGFuZ2UgPSBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlS2V5U2VsZWN0ZWQ6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY29sbGVjdFJlY292ZXJ5S2V5Tm9kZSA9IChuKSA9PiB7XG4gICAgICAgIHRoaXMuX3JlY292ZXJ5S2V5Tm9kZSA9IG47XG4gICAgfVxuXG4gICAgX29uQ2hvb3NlS2V5UGFzc3BocmFzZUZvcm1TdWJtaXQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBhc3NQaHJhc2VLZXlTZWxlY3RlZCA9PT0gQ1JFQVRFX1NUT1JBR0VfT1BUSU9OX0tFWSkge1xuICAgICAgICAgICAgdGhpcy5fcmVjb3ZlcnlLZXkgPVxuICAgICAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVhdGVSZWNvdmVyeUtleUZyb21QYXNzcGhyYXNlKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBjb3BpZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvd25sb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNldFBhc3NwaHJhc2U6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9TSE9XS0VZLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBjb3BpZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvd25sb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9QQVNTUEhSQVNFLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25NaWdyYXRlRm9ybVN1Ym1pdCA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYmFja3VwU2lnU3RhdHVzLnVzYWJsZSkge1xuICAgICAgICAgICAgdGhpcy5fYm9vdHN0cmFwU2VjcmV0U3RvcmFnZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVzdG9yZUJhY2t1cCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uQ29weUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWNjZXNzZnVsID0gY29weU5vZGUodGhpcy5fcmVjb3ZlcnlLZXlOb2RlKTtcbiAgICAgICAgaWYgKHN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNvcGllZDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uRG93bmxvYWRDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt0aGlzLl9yZWNvdmVyeUtleS5lbmNvZGVkUHJpdmF0ZUtleV0sIHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0L3BsYWluO2NoYXJzZXQ9dXMtYXNjaWknLFxuICAgICAgICB9KTtcbiAgICAgICAgRmlsZVNhdmVyLnNhdmVBcyhibG9iLCAnc2VjdXJpdHkta2V5LnR4dCcpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZG93bmxvYWRlZDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2RvQm9vdHN0cmFwVUlBdXRoID0gYXN5bmMgKG1ha2VSZXF1ZXN0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5ICYmIHRoaXMuc3RhdGUuYWNjb3VudFBhc3N3b3JkKSB7XG4gICAgICAgICAgICBhd2FpdCBtYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ20ubG9naW4ucGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgIGlkZW50aWZpZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ20uaWQudXNlcicsXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBgdXNlcmAgb25jZSBzZXJ2ZXJzIHN1cHBvcnQgcHJvcGVyIFVJQVxuICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9zeW5hcHNlL2lzc3Vlcy81NjY1XG4gICAgICAgICAgICAgICAgdXNlcjogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLnN0YXRlLmFjY291bnRQYXNzd29yZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgSW50ZXJhY3RpdmVBdXRoRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuSW50ZXJhY3RpdmVBdXRoRGlhbG9nXCIpO1xuXG4gICAgICAgICAgICBjb25zdCBkaWFsb2dBZXN0aGV0aWNzID0ge1xuICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUFJFQVVUSF06IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVXNlIFNpbmdsZSBTaWduIE9uIHRvIGNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBfdChcIlRvIGNvbnRpbnVlLCB1c2UgU2luZ2xlIFNpZ24gT24gdG8gcHJvdmUgeW91ciBpZGVudGl0eS5cIiksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlVGV4dDogX3QoXCJTaW5nbGUgU2lnbiBPblwiKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVLaW5kOiBcInByaW1hcnlcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUE9TVEFVVEhdOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkNvbmZpcm0gZW5jcnlwdGlvbiBzZXR1cFwiKSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogX3QoXCJDbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIGNvbmZpcm0gc2V0dGluZyB1cCBlbmNyeXB0aW9uLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVUZXh0OiBfdChcIkNvbmZpcm1cIiksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlS2luZDogXCJwcmltYXJ5XCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAgICAgJ0Nyb3NzLXNpZ25pbmcga2V5cyBkaWFsb2cnLCAnJywgSW50ZXJhY3RpdmVBdXRoRGlhbG9nLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiU2V0dGluZyB1cCBrZXlzXCIpLFxuICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudFBlZy5nZXQoKSxcbiAgICAgICAgICAgICAgICAgICAgbWFrZVJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgIGFlc3RoZXRpY3NGb3JTdGFnZVBoYXNlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgW1NTT0F1dGhFbnRyeS5MT0dJTl9UWVBFXTogZGlhbG9nQWVzdGhldGljcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuVU5TVEFCTEVfTE9HSU5fVFlQRV06IGRpYWxvZ0Flc3RoZXRpY3MsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDcm9zcy1zaWduaW5nIGtleSB1cGxvYWQgYXV0aCBjYW5jZWxlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9ib290c3RyYXBTZWNyZXRTdG9yYWdlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9TVE9SSU5HLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBjb25zdCB7IGZvcmNlUmVzZXQgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmb3JjZVJlc2V0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJGb3JjaW5nIHNlY3JldCBzdG9yYWdlIHJlc2V0XCIpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5ib290c3RyYXBTZWNyZXRTdG9yYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlU2VjcmV0U3RvcmFnZUtleTogYXN5bmMgKCkgPT4gdGhpcy5fcmVjb3ZlcnlLZXksXG4gICAgICAgICAgICAgICAgICAgIHNldHVwTmV3S2V5QmFja3VwOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzZXR1cE5ld1NlY3JldFN0b3JhZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZvciBwYXNzd29yZCBhdXRoZW50aWNhdGlvbiB1c2VycyBhZnRlciAyMDIwLTA5LCB0aGlzIGNyb3NzLXNpZ25pbmdcbiAgICAgICAgICAgICAgICAvLyBzdGVwIHdpbGwgYmUgYSBuby1vcCBzaW5jZSBpdCBpcyBub3cgc2V0dXAgZHVyaW5nIHJlZ2lzdHJhdGlvbiBvciBsb2dpblxuICAgICAgICAgICAgICAgIC8vIHdoZW4gbmVlZGVkLiBXZSBzaG91bGQga2VlcCB0aGlzIGhlcmUgdG8gY292ZXIgb3RoZXIgY2FzZXMgc3VjaCBhczpcbiAgICAgICAgICAgICAgICAvLyAgICogVXNlcnMgd2l0aCBleGlzdGluZyBzZXNzaW9ucyBwcmlvciB0byAyMDIwLTA5IGNoYW5nZXNcbiAgICAgICAgICAgICAgICAvLyAgICogU1NPIGF1dGhlbnRpY2F0aW9uIHVzZXJzIHdoaWNoIHJlcXVpcmUgaW50ZXJhY3RpdmUgYXV0aCB0byB1cGxvYWRcbiAgICAgICAgICAgICAgICAvLyAgICAga2V5cyAoYW5kIGFsc28gaGFwcGVuIHRvIHNraXAgYWxsIHBvc3QtYXV0aGVudGljYXRpb24gZmxvd3MgYXQgdGhlXG4gICAgICAgICAgICAgICAgLy8gICAgIG1vbWVudCB2aWEgdG9rZW4gbG9naW4pXG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpLmJvb3RzdHJhcENyb3NzU2lnbmluZyh7XG4gICAgICAgICAgICAgICAgICAgIGF1dGhVcGxvYWREZXZpY2VTaWduaW5nS2V5czogdGhpcy5fZG9Cb290c3RyYXBVSUF1dGgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpLmJvb3RzdHJhcFNlY3JldFN0b3JhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVTZWNyZXRTdG9yYWdlS2V5OiBhc3luYyAoKSA9PiB0aGlzLl9yZWNvdmVyeUtleSxcbiAgICAgICAgICAgICAgICAgICAga2V5QmFja3VwSW5mbzogdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgICAgICBzZXR1cE5ld0tleUJhY2t1cDogIXRoaXMuc3RhdGUuYmFja3VwSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgZ2V0S2V5QmFja3VwUGFzc3BocmFzZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgbWF5IGFscmVhZHkgaGF2ZSB0aGUgYmFja3VwIGtleSBpZiB3ZSBlYXJsaWVyIHdlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRocm91Z2ggdGhlIHJlc3RvcmUgYmFja3VwIHBhdGgsIHNvIHBhc3MgaXQgYWxvbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJhdGhlciB0aGFuIHByb21wdGluZyBhZ2Fpbi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9iYWNrdXBLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYmFja3VwS2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb21wdEZvckJhY2t1cFBhc3NwaHJhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHkgJiYgZS5odHRwU3RhdHVzID09PSA0MDEgJiYgZS5kYXRhLmZsb3dzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRQYXNzd29yZDogJycsXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRQYXNzd29yZENvcnJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwaGFzZTogUEhBU0VfTUlHUkFURSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGJvb3RzdHJhcHBpbmcgc2VjcmV0IHN0b3JhZ2VcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgX29uRG9uZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH1cblxuICAgIF9yZXN0b3JlQmFja3VwID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBJdCdzIHBvc3NpYmxlIHdlJ2xsIG5lZWQgdGhlIGJhY2t1cCBrZXkgbGF0ZXIgb24gZm9yIGJvb3RzdHJhcHBpbmcsXG4gICAgICAgIC8vIHNvIGxldCdzIHN0YXNoIGl0IGhlcmUsIHJhdGhlciB0aGFuIHByb21wdGluZyBmb3IgaXQgdHdpY2UuXG4gICAgICAgIGNvbnN0IGtleUNhbGxiYWNrID0gayA9PiB0aGlzLl9iYWNrdXBLZXkgPSBrO1xuXG4gICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAnUmVzdG9yZSBCYWNrdXAnLCAnJywgUmVzdG9yZUtleUJhY2t1cERpYWxvZyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzaG93U3VtbWFyeTogZmFsc2UsXG4gICAgICAgICAgICAgICAga2V5Q2FsbGJhY2ssXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gZmFsc2UsXG4gICAgICAgICk7XG5cbiAgICAgICAgYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgIGNvbnN0IHsgYmFja3VwU2lnU3RhdHVzIH0gPSBhd2FpdCB0aGlzLl9mZXRjaEJhY2t1cEluZm8oKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgYmFja3VwU2lnU3RhdHVzLnVzYWJsZSAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5jYW5VcGxvYWRLZXlzV2l0aFBhc3N3b3JkT25seSAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5hY2NvdW50UGFzc3dvcmRcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLl9ib290c3RyYXBTZWNyZXRTdG9yYWdlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25Mb2FkUmV0cnlDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGhhc2U6IFBIQVNFX0xPQURJTkd9KTtcbiAgICAgICAgdGhpcy5fZmV0Y2hCYWNrdXBJbmZvKCk7XG4gICAgfVxuXG4gICAgX29uU2hvd0tleUNvbnRpbnVlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2Jvb3RzdHJhcFNlY3JldFN0b3JhZ2UoKTtcbiAgICB9XG5cbiAgICBfb25DYW5jZWxDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGhhc2U6IFBIQVNFX0NPTkZJUk1fU0tJUH0pO1xuICAgIH1cblxuICAgIF9vbkdvQmFja0NsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtwaGFzZTogUEhBU0VfQ0hPT1NFX0tFWV9QQVNTUEhSQVNFfSk7XG4gICAgfVxuXG4gICAgX29uUGFzc1BocmFzZU5leHRDbGljayA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCF0aGlzLl9wYXNzcGhyYXNlRmllbGQuY3VycmVudCkgcmV0dXJuOyAvLyB1bm1vdW50aW5nXG5cbiAgICAgICAgYXdhaXQgdGhpcy5fcGFzc3BocmFzZUZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcbiAgICAgICAgaWYgKCF0aGlzLl9wYXNzcGhyYXNlRmllbGQuY3VycmVudC5zdGF0ZS52YWxpZCkge1xuICAgICAgICAgICAgdGhpcy5fcGFzc3BocmFzZUZpZWxkLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuX3Bhc3NwaHJhc2VGaWVsZC5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtwaGFzZTogUEhBU0VfUEFTU1BIUkFTRV9DT05GSVJNfSk7XG4gICAgfTtcblxuICAgIF9vblBhc3NQaHJhc2VDb25maXJtTmV4dENsaWNrID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBhc3NQaHJhc2UgIT09IHRoaXMuc3RhdGUucGFzc1BocmFzZUNvbmZpcm0pIHJldHVybjtcblxuICAgICAgICB0aGlzLl9yZWNvdmVyeUtleSA9XG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlYXRlUmVjb3ZlcnlLZXlGcm9tUGFzc3BocmFzZSh0aGlzLnN0YXRlLnBhc3NQaHJhc2UpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvcGllZDogZmFsc2UsXG4gICAgICAgICAgICBkb3dubG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHNldFBhc3NwaHJhc2U6IHRydWUsXG4gICAgICAgICAgICBwaGFzZTogUEhBU0VfU0hPV0tFWSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uU2V0QWdhaW5DbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlOiAnJyxcbiAgICAgICAgICAgIHBhc3NQaHJhc2VWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICBwYXNzUGhyYXNlQ29uZmlybTogJycsXG4gICAgICAgICAgICBwaGFzZTogUEhBU0VfUEFTU1BIUkFTRSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uUGFzc1BocmFzZVZhbGlkYXRlID0gKHJlc3VsdCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2VWYWxpZDogcmVzdWx0LnZhbGlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uUGFzc1BocmFzZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFzc1BocmFzZTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vblBhc3NQaHJhc2VDb25maXJtQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlQ29uZmlybTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vbkFjY291bnRQYXNzd29yZENoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWNjb3VudFBhc3N3b3JkOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3JlbmRlck9wdGlvbktleSgpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxTdHlsZWRSYWRpb0J1dHRvblxuICAgICAgICAgICAgICAgIGtleT17Q1JFQVRFX1NUT1JBR0VfT1BUSU9OX0tFWX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17Q1JFQVRFX1NUT1JBR0VfT1BUSU9OX0tFWX1cbiAgICAgICAgICAgICAgICBuYW1lPVwia2V5UGFzc3BocmFzZVwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlS2V5U2VsZWN0ZWQgPT09IENSRUFURV9TVE9SQUdFX09QVElPTl9LRVl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uS2V5UGFzc3BocmFzZUNoYW5nZX1cbiAgICAgICAgICAgICAgICBvdXRsaW5lZFxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19vcHRpb25UaXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX29wdGlvbkljb24gbXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19vcHRpb25JY29uX3NlY3VyZUJhY2t1cFwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiR2VuZXJhdGUgYSBTZWN1cml0eSBLZXlcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57X3QoXCJXZeKAmWxsIGdlbmVyYXRlIGEgU2VjdXJpdHkgS2V5IGZvciB5b3UgdG8gc3RvcmUgc29tZXdoZXJlIHNhZmUsIGxpa2UgYSBwYXNzd29yZCBtYW5hZ2VyIG9yIGEgc2FmZS5cIil9PC9kaXY+XG4gICAgICAgICAgICA8L1N0eWxlZFJhZGlvQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJPcHRpb25QYXNzcGhyYXNlKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXtDUkVBVEVfU1RPUkFHRV9PUFRJT05fUEFTU1BIUkFTRX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17Q1JFQVRFX1NUT1JBR0VfT1BUSU9OX1BBU1NQSFJBU0V9XG4gICAgICAgICAgICAgICAgbmFtZT1cImtleVBhc3NwaHJhc2VcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuc3RhdGUucGFzc1BocmFzZUtleVNlbGVjdGVkID09PSBDUkVBVEVfU1RPUkFHRV9PUFRJT05fUEFTU1BIUkFTRX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25LZXlQYXNzcGhyYXNlQ2hhbmdlfVxuICAgICAgICAgICAgICAgIG91dGxpbmVkXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX29wdGlvblRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfb3B0aW9uSWNvbiBteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX29wdGlvbkljb25fc2VjdXJlUGhyYXNlXCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJFbnRlciBhIFNlY3VyaXR5IFBocmFzZVwiKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PntfdChcIlVzZSBhIHNlY3JldCBwaHJhc2Ugb25seSB5b3Uga25vdywgYW5kIG9wdGlvbmFsbHkgc2F2ZSBhIFNlY3VyaXR5IEtleSB0byB1c2UgZm9yIGJhY2t1cC5cIil9PC9kaXY+XG4gICAgICAgICAgICA8L1N0eWxlZFJhZGlvQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJQaGFzZUNob29zZUtleVBhc3NwaHJhc2UoKSB7XG4gICAgICAgIGNvbnN0IHNldHVwTWV0aG9kcyA9IGdldFNlY3VyZUJhY2t1cFNldHVwTWV0aG9kcygpO1xuICAgICAgICBjb25zdCBvcHRpb25LZXkgPSBzZXR1cE1ldGhvZHMuaW5jbHVkZXMoXCJrZXlcIikgPyB0aGlzLl9yZW5kZXJPcHRpb25LZXkoKSA6IG51bGw7XG4gICAgICAgIGNvbnN0IG9wdGlvblBhc3NwaHJhc2UgPSBzZXR1cE1ldGhvZHMuaW5jbHVkZXMoXCJwYXNzcGhyYXNlXCIpID8gdGhpcy5fcmVuZGVyT3B0aW9uUGFzc3BocmFzZSgpIDogbnVsbDtcblxuICAgICAgICByZXR1cm4gPGZvcm0gb25TdWJtaXQ9e3RoaXMuX29uQ2hvb3NlS2V5UGFzc3BocmFzZUZvcm1TdWJtaXR9PlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19jZW50ZXJlZEJvZHlcIj57X3QoXG4gICAgICAgICAgICAgICAgXCJTYWZlZ3VhcmQgYWdhaW5zdCBsb3NpbmcgYWNjZXNzIHRvIGVuY3J5cHRlZCBtZXNzYWdlcyAmIGRhdGEgYnkgXCIgK1xuICAgICAgICAgICAgICAgIFwiYmFja2luZyB1cCBlbmNyeXB0aW9uIGtleXMgb24geW91ciBzZXJ2ZXIuXCIsXG4gICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19wcmltYXJ5Q29udGFpbmVyXCIgcm9sZT1cInJhZGlvZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICB7b3B0aW9uS2V5fVxuICAgICAgICAgICAgICAgIHtvcHRpb25QYXNzcGhyYXNlfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiQ29udGludWVcIil9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uQ2hvb3NlS2V5UGFzc3BocmFzZUZvcm1TdWJtaXR9XG4gICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMuX29uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0aGlzLnN0YXRlLmNhblNraXB9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Zvcm0+O1xuICAgIH1cblxuICAgIF9yZW5kZXJQaGFzZU1pZ3JhdGUoKSB7XG4gICAgICAgIC8vIFRPRE86IFRoaXMgaXMgYSB0ZW1wb3Jhcnkgc2NyZWVuIHNvIHBlb3BsZSB3aG8gaGF2ZSB0aGUgbGFicyBmbGFnIHR1cm5lZCBvbiBhbmRcbiAgICAgICAgLy8gY2xpY2sgdGhlIGJ1dHRvbiBhcmUgYXdhcmUgdGhleSdyZSBtYWtpbmcgYSBjaGFuZ2UgdG8gdGhlaXIgYWNjb3VudC5cbiAgICAgICAgLy8gT25jZSB3ZSdyZSBjb25maWRlbnQgZW5vdWdoIGluIHRoaXMgKGFuZCBpdCdzIHN1cHBvcnRlZCBlbm91Z2gpIHdlIGNhbiBkb1xuICAgICAgICAvLyBpdCBhdXRvbWF0aWNhbGx5LlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMTY5NlxuICAgICAgICBjb25zdCBGaWVsZCA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkZpZWxkJyk7XG5cbiAgICAgICAgbGV0IGF1dGhQcm9tcHQ7XG4gICAgICAgIGxldCBuZXh0Q2FwdGlvbiA9IF90KFwiTmV4dFwiKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHkpIHtcbiAgICAgICAgICAgIGF1dGhQcm9tcHQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+e190KFwiRW50ZXIgeW91ciBhY2NvdW50IHBhc3N3b3JkIHRvIGNvbmZpcm0gdGhlIHVwZ3JhZGU6XCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+PEZpZWxkXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlBhc3N3b3JkXCIpfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5hY2NvdW50UGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkFjY291bnRQYXNzd29yZENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgZm9yY2VWYWxpZGl0eT17dGhpcy5zdGF0ZS5hY2NvdW50UGFzc3dvcmRDb3JyZWN0ID09PSBmYWxzZSA/IGZhbHNlIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgIC8+PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUuYmFja3VwU2lnU3RhdHVzLnVzYWJsZSkge1xuICAgICAgICAgICAgYXV0aFByb21wdCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57X3QoXCJSZXN0b3JlIHlvdXIga2V5IGJhY2t1cCB0byB1cGdyYWRlIHlvdXIgZW5jcnlwdGlvblwiKX08L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIG5leHRDYXB0aW9uID0gX3QoXCJSZXN0b3JlXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXV0aFByb21wdCA9IDxwPlxuICAgICAgICAgICAgICAgIHtfdChcIllvdSdsbCBuZWVkIHRvIGF1dGhlbnRpY2F0ZSB3aXRoIHRoZSBzZXJ2ZXIgdG8gY29uZmlybSB0aGUgdXBncmFkZS5cIil9XG4gICAgICAgICAgICA8L3A+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxmb3JtIG9uU3VibWl0PXt0aGlzLl9vbk1pZ3JhdGVGb3JtU3VibWl0fT5cbiAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICBcIlVwZ3JhZGUgdGhpcyBzZXNzaW9uIHRvIGFsbG93IGl0IHRvIHZlcmlmeSBvdGhlciBzZXNzaW9ucywgXCIgK1xuICAgICAgICAgICAgICAgIFwiZ3JhbnRpbmcgdGhlbSBhY2Nlc3MgdG8gZW5jcnlwdGVkIG1lc3NhZ2VzIGFuZCBtYXJraW5nIHRoZW0gXCIgK1xuICAgICAgICAgICAgICAgIFwiYXMgdHJ1c3RlZCBmb3Igb3RoZXIgdXNlcnMuXCIsXG4gICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgIDxkaXY+e2F1dGhQcm9tcHR9PC9kaXY+XG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e25leHRDYXB0aW9ufVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vbk1pZ3JhdGVGb3JtU3VibWl0fVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXt0aGlzLnN0YXRlLmNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5ICYmICF0aGlzLnN0YXRlLmFjY291bnRQYXNzd29yZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkYW5nZXJcIiBvbkNsaWNrPXt0aGlzLl9vbkNhbmNlbENsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAge190KCdTa2lwJyl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L0RpYWxvZ0J1dHRvbnM+XG4gICAgICAgIDwvZm9ybT47XG4gICAgfVxuXG4gICAgX3JlbmRlclBoYXNlUGFzc1BocmFzZSgpIHtcbiAgICAgICAgcmV0dXJuIDxmb3JtIG9uU3VibWl0PXt0aGlzLl9vblBhc3NQaHJhc2VOZXh0Q2xpY2t9PlxuICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgIFwiRW50ZXIgYSBzZWN1cml0eSBwaHJhc2Ugb25seSB5b3Uga25vdywgYXMgaXTigJlzIHVzZWQgdG8gc2FmZWd1YXJkIHlvdXIgZGF0YS4gXCIgK1xuICAgICAgICAgICAgICAgIFwiVG8gYmUgc2VjdXJlLCB5b3Ugc2hvdWxkbuKAmXQgcmUtdXNlIHlvdXIgYWNjb3VudCBwYXNzd29yZC5cIixcbiAgICAgICAgICAgICl9PC9wPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcGFzc1BocmFzZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxQYXNzcGhyYXNlRmllbGRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19wYXNzUGhyYXNlRmllbGRcIlxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25QYXNzUGhyYXNlQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBtaW5TY29yZT17UEFTU1dPUkRfTUlOX1NDT1JFfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlfVxuICAgICAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLl9vblBhc3NQaHJhc2VWYWxpZGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgZmllbGRSZWY9e3RoaXMuX3Bhc3NwaHJhc2VGaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3RkKFwiRW50ZXIgYSBTZWN1cml0eSBQaHJhc2VcIil9XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsRW50ZXJQYXNzd29yZD17X3RkKFwiRW50ZXIgYSBTZWN1cml0eSBQaHJhc2VcIil9XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsU3Ryb25nUGFzc3dvcmQ9e190ZChcIkdyZWF0ISBUaGlzIFNlY3VyaXR5IFBocmFzZSBsb29rcyBzdHJvbmcgZW5vdWdoLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWxBbGxvd2VkQnV0VW5zYWZlPXtfdGQoXCJHcmVhdCEgVGhpcyBTZWN1cml0eSBQaHJhc2UgbG9va3Mgc3Ryb25nIGVub3VnaC5cIil9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdDb250aW51ZScpfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vblBhc3NQaHJhc2VOZXh0Q2xpY2t9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUucGFzc1BocmFzZVZhbGlkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgPntfdChcIkNhbmNlbFwiKX08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvRGlhbG9nQnV0dG9ucz5cbiAgICAgICAgPC9mb3JtPjtcbiAgICB9XG5cbiAgICBfcmVuZGVyUGhhc2VQYXNzUGhyYXNlQ29uZmlybSgpIHtcbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5GaWVsZCcpO1xuXG4gICAgICAgIGxldCBtYXRjaFRleHQ7XG4gICAgICAgIGxldCBjaGFuZ2VUZXh0O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wYXNzUGhyYXNlQ29uZmlybSA9PT0gdGhpcy5zdGF0ZS5wYXNzUGhyYXNlKSB7XG4gICAgICAgICAgICBtYXRjaFRleHQgPSBfdChcIlRoYXQgbWF0Y2hlcyFcIik7XG4gICAgICAgICAgICBjaGFuZ2VUZXh0ID0gX3QoXCJVc2UgYSBkaWZmZXJlbnQgcGFzc3BocmFzZT9cIik7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUucGFzc1BocmFzZS5zdGFydHNXaXRoKHRoaXMuc3RhdGUucGFzc1BocmFzZUNvbmZpcm0pKSB7XG4gICAgICAgICAgICAvLyBvbmx5IHRlbGwgdGhlbSB0aGV5J3JlIHdyb25nIGlmIHRoZXkndmUgYWN0dWFsbHkgZ29uZSB3cm9uZy5cbiAgICAgICAgICAgIC8vIFNlY3VyaXR5IGNvbmNpb3VzIHJlYWRlcnMgd2lsbCBub3RlIHRoYXQgaWYgeW91IGxlZnQgZWxlbWVudC13ZWIgdW5hdHRlbmRlZFxuICAgICAgICAgICAgLy8gb24gdGhpcyBzY3JlZW4sIHRoaXMgd291bGQgbWFrZSBpdCBlYXN5IGZvciBhIG1hbGljaW91cyBwZXJzb24gdG8gZ3Vlc3NcbiAgICAgICAgICAgIC8vIHlvdXIgcGFzc3BocmFzZSBvbmUgbGV0dGVyIGF0IGEgdGltZSwgYnV0IHRoZXkgY291bGQgZ2V0IHRoaXMgZmFzdGVyIGJ5XG4gICAgICAgICAgICAvLyBqdXN0IG9wZW5pbmcgdGhlIGJyb3dzZXIncyBkZXZlbG9wZXIgdG9vbHMgYW5kIHJlYWRpbmcgaXQuXG4gICAgICAgICAgICAvLyBOb3RlIHRoYXQgbm90IGhhdmluZyB0eXBlZCBhbnl0aGluZyBhdCBhbGwgd2lsbCBub3QgaGl0IHRoaXMgY2xhdXNlIGFuZFxuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHNvIGVtcHR5IGJveCA9PT0gbm8gaGludC5cbiAgICAgICAgICAgIG1hdGNoVGV4dCA9IF90KFwiVGhhdCBkb2Vzbid0IG1hdGNoLlwiKTtcbiAgICAgICAgICAgIGNoYW5nZVRleHQgPSBfdChcIkdvIGJhY2sgdG8gc2V0IGl0IGFnYWluLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXNzUGhyYXNlTWF0Y2ggPSBudWxsO1xuICAgICAgICBpZiAobWF0Y2hUZXh0KSB7XG4gICAgICAgICAgICBwYXNzUGhyYXNlTWF0Y2ggPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+e21hdGNoVGV4dH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBlbGVtZW50PVwic3BhblwiIGNsYXNzTmFtZT1cIm14X2xpbmtCdXR0b25cIiBvbkNsaWNrPXt0aGlzLl9vblNldEFnYWluQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAge2NoYW5nZVRleHR9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gPGZvcm0gb25TdWJtaXQ9e3RoaXMuX29uUGFzc1BocmFzZUNvbmZpcm1OZXh0Q2xpY2t9PlxuICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgIFwiRW50ZXIgeW91ciByZWNvdmVyeSBwYXNzcGhyYXNlIGEgc2Vjb25kIHRpbWUgdG8gY29uZmlybSBpdC5cIixcbiAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX3Bhc3NQaHJhc2VDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uUGFzc1BocmFzZUNvbmZpcm1DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBhc3NQaHJhc2VDb25maXJtfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX3Bhc3NQaHJhc2VGaWVsZFwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkNvbmZpcm0geW91ciByZWNvdmVyeSBwYXNzcGhyYXNlXCIpfVxuICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcGFzc1BocmFzZU1hdGNoXCI+XG4gICAgICAgICAgICAgICAgICAgIHtwYXNzUGhyYXNlTWF0Y2h9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ0NvbnRpbnVlJyl9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uUGFzc1BocmFzZUNvbmZpcm1OZXh0Q2xpY2t9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlICE9PSB0aGlzLnN0YXRlLnBhc3NQaHJhc2VDb25maXJtfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgPntfdChcIlNraXBcIil9PC9idXR0b24+XG4gICAgICAgICAgICA8L0RpYWxvZ0J1dHRvbnM+XG4gICAgICAgIDwvZm9ybT47XG4gICAgfVxuXG4gICAgX3JlbmRlclBoYXNlU2hvd0tleSgpIHtcbiAgICAgICAgbGV0IGNvbnRpbnVlQnV0dG9uO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5waGFzZSA9PT0gUEhBU0VfU0hPV0tFWSkge1xuICAgICAgICAgICAgY29udGludWVCdXR0b24gPSA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdChcIkNvbnRpbnVlXCIpfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5kb3dubG9hZGVkICYmICF0aGlzLnN0YXRlLmNvcGllZCAmJiAhdGhpcy5zdGF0ZS5zZXRQYXNzcGhyYXNlfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vblNob3dLZXlDb250aW51ZUNsaWNrfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRpbnVlQnV0dG9uID0gPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX2NvbnRpbnVlU3Bpbm5lclwiPlxuICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgXCJTdG9yZSB5b3VyIFNlY3VyaXR5IEtleSBzb21ld2hlcmUgc2FmZSwgbGlrZSBhIHBhc3N3b3JkIG1hbmFnZXIgb3IgYSBzYWZlLCBcIiArXG4gICAgICAgICAgICAgICAgXCJhcyBpdOKAmXMgdXNlZCB0byBzYWZlZ3VhcmQgeW91ciBlbmNyeXB0ZWQgZGF0YS5cIixcbiAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX3ByaW1hcnlDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Y29kZSByZWY9e3RoaXMuX2NvbGxlY3RSZWNvdmVyeUtleU5vZGV9Pnt0aGlzLl9yZWNvdmVyeUtleS5lbmNvZGVkUHJpdmF0ZUtleX08L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlCdXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPSdwcmltYXJ5JyBjbGFzc05hbWU9XCJteF9EaWFsb2dfcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25Eb3dubG9hZENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnBoYXNlID09PSBQSEFTRV9TVE9SSU5HfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkRvd25sb2FkXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e190KFwib3JcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPSdwcmltYXJ5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5IG14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlCdXR0b25zX2NvcHlCdG5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ29weUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnBoYXNlID09PSBQSEFTRV9TVE9SSU5HfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmNvcGllZCA/IF90KFwiQ29waWVkIVwiKSA6IF90KFwiQ29weVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtjb250aW51ZUJ1dHRvbn1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIF9yZW5kZXJCdXN5UGhhc2UoKSB7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5TcGlubmVyJyk7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIF9yZW5kZXJQaGFzZUxvYWRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8cD57X3QoXCJVbmFibGUgdG8gcXVlcnkgc2VjcmV0IHN0b3JhZ2Ugc3RhdHVzXCIpfTwvcD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnUmV0cnknKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uTG9hZFJldHJ5Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dGhpcy5zdGF0ZS5jYW5Ta2lwfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWx9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgX3JlbmRlclBoYXNlU2tpcENvbmZpcm0oKSB7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgIFwiSWYgeW91IGNhbmNlbCBub3csIHlvdSBtYXkgbG9zZSBlbmNyeXB0ZWQgbWVzc2FnZXMgJiBkYXRhIGlmIHlvdSBsb3NlIGFjY2VzcyB0byB5b3VyIGxvZ2lucy5cIixcbiAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgIFwiWW91IGNhbiBhbHNvIHNldCB1cCBTZWN1cmUgQmFja3VwICYgbWFuYWdlIHlvdXIga2V5cyBpbiBTZXR0aW5ncy5cIixcbiAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ0dvIGJhY2snKX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5fb25Hb0JhY2tDbGlja31cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRhbmdlclwiIG9uQ2xpY2s9e3RoaXMuX29uQ2FuY2VsfT57X3QoJ0NhbmNlbCcpfTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9EaWFsb2dCdXR0b25zPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgX3RpdGxlRm9yUGhhc2UocGhhc2UpIHtcbiAgICAgICAgc3dpdGNoIChwaGFzZSkge1xuICAgICAgICAgICAgY2FzZSBQSEFTRV9DSE9PU0VfS0VZX1BBU1NQSFJBU0U6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTZXQgdXAgU2VjdXJlIEJhY2t1cCcpO1xuICAgICAgICAgICAgY2FzZSBQSEFTRV9NSUdSQVRFOlxuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnVXBncmFkZSB5b3VyIGVuY3J5cHRpb24nKTtcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfUEFTU1BIUkFTRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1NldCBhIFNlY3VyaXR5IFBocmFzZScpO1xuICAgICAgICAgICAgY2FzZSBQSEFTRV9QQVNTUEhSQVNFX0NPTkZJUk06XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdDb25maXJtIFNlY3VyaXR5IFBocmFzZScpO1xuICAgICAgICAgICAgY2FzZSBQSEFTRV9DT05GSVJNX1NLSVA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdBcmUgeW91IHN1cmU/Jyk7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX1NIT1dLRVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTYXZlIHlvdXIgU2VjdXJpdHkgS2V5Jyk7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX1NUT1JJTkc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTZXR0aW5nIHVwIGtleXMnKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJVbmFibGUgdG8gc2V0IHVwIHNlY3JldCBzdG9yYWdlXCIpfTwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KCdSZXRyeScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX2Jvb3RzdHJhcFNlY3JldFN0b3JhZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RoaXMuc3RhdGUuY2FuU2tpcH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLl9vbkNhbmNlbH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5waGFzZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUEhBU0VfTE9BRElORzpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMuX3JlbmRlckJ1c3lQaGFzZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBIQVNFX0xPQURFUlJPUjpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMuX3JlbmRlclBoYXNlTG9hZEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUEhBU0VfQ0hPT1NFX0tFWV9QQVNTUEhSQVNFOlxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy5fcmVuZGVyUGhhc2VDaG9vc2VLZXlQYXNzcGhyYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUEhBU0VfTUlHUkFURTpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMuX3JlbmRlclBoYXNlTWlncmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBIQVNFX1BBU1NQSFJBU0U6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl9yZW5kZXJQaGFzZVBhc3NQaHJhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQSEFTRV9QQVNTUEhSQVNFX0NPTkZJUk06XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl9yZW5kZXJQaGFzZVBhc3NQaHJhc2VDb25maXJtKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUEhBU0VfU0hPV0tFWTpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMuX3JlbmRlclBoYXNlU2hvd0tleSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBIQVNFX1NUT1JJTkc6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl9yZW5kZXJCdXN5UGhhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQSEFTRV9DT05GSVJNX1NLSVA6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLl9yZW5kZXJQaGFzZVNraXBDb25maXJtKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRpdGxlQ2xhc3MgPSBudWxsO1xuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUucGhhc2UpIHtcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfUEFTU1BIUkFTRTpcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfUEFTU1BIUkFTRV9DT05GSVJNOlxuICAgICAgICAgICAgICAgIHRpdGxlQ2xhc3MgPSBbXG4gICAgICAgICAgICAgICAgICAgICdteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX3RpdGxlV2l0aEljb24nLFxuICAgICAgICAgICAgICAgICAgICAnbXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19zZWN1cmVQaHJhc2VUaXRsZScsXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfU0hPV0tFWTpcbiAgICAgICAgICAgICAgICB0aXRsZUNsYXNzID0gW1xuICAgICAgICAgICAgICAgICAgICAnbXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ190aXRsZVdpdGhJY29uJyxcbiAgICAgICAgICAgICAgICAgICAgJ214X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfc2VjdXJlQmFja3VwVGl0bGUnLFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX0NIT09TRV9LRVlfUEFTU1BIUkFTRTpcbiAgICAgICAgICAgICAgICB0aXRsZUNsYXNzID0gJ214X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfY2VudGVyZWRUaXRsZSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPSdteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nJ1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5fdGl0bGVGb3JQaGFzZSh0aGlzLnN0YXRlLnBoYXNlKX1cbiAgICAgICAgICAgICAgICB0aXRsZUNsYXNzPXt0aXRsZUNsYXNzfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dGhpcy5wcm9wcy5oYXNDYW5jZWwgJiYgW1BIQVNFX1BBU1NQSFJBU0VdLmluY2x1ZGVzKHRoaXMuc3RhdGUucGhhc2UpfVxuICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg9e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _WellKnownUtils = require("../../../utils/WellKnownUtils");

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _QuestionDialog = _interopRequireDefault(require("../dialogs/QuestionDialog"));

var _RestoreKeyBackupDialog = _interopRequireDefault(require("../dialogs/security/RestoreKeyBackupDialog"));

var _SecurityManager = require("../../../SecurityManager");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let SecureBackupPanel = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.SecureBackupPanel"), _dec(_class = (_temp = class SecureBackupPanel extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onKeyBackupSessionsRemaining", sessionsRemaining => {
      this.setState({
        sessionsRemaining
      });
    });
    (0, _defineProperty2.default)(this, "_onKeyBackupStatus", () => {
      // This just loads the current backup status rather than forcing
      // a re-check otherwise we risk causing infinite loops
      this._loadBackupStatus();
    });
    (0, _defineProperty2.default)(this, "_startNewBackup", () => {
      _Modal.default.createTrackedDialogAsync('Key Backup', 'Key Backup', Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../../async-components/views/dialogs/security/CreateKeyBackupDialog'))), {
        onFinished: () => {
          this._loadBackupStatus();
        }
      }, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "_deleteBackup", () => {
      _Modal.default.createTrackedDialog('Delete Backup', '', _QuestionDialog.default, {
        title: (0, _languageHandler._t)('Delete Backup'),
        description: (0, _languageHandler._t)("Are you sure? You will lose your encrypted messages if your " + "keys are not backed up properly."),
        button: (0, _languageHandler._t)('Delete Backup'),
        danger: true,
        onFinished: proceed => {
          if (!proceed) return;
          this.setState({
            loading: true
          });

          _MatrixClientPeg.MatrixClientPeg.get().deleteKeyBackupVersion(this.state.backupInfo.version).then(() => {
            this._loadBackupStatus();
          });
        }
      });
    });
    (0, _defineProperty2.default)(this, "_restoreBackup", async () => {
      _Modal.default.createTrackedDialog('Restore Backup', '', _RestoreKeyBackupDialog.default, null, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "_resetSecretStorage", async () => {
      this.setState({
        error: null
      });

      try {
        await (0, _SecurityManager.accessSecretStorage)(() => {},
        /* forceReset = */
        true);
      } catch (e) {
        console.error("Error resetting secret storage", e);
        if (this._unmounted) return;
        this.setState({
          error: e
        });
      }

      if (this._unmounted) return;

      this._loadBackupStatus();
    });
    this._unmounted = false;
    this.state = {
      loading: true,
      error: null,
      backupKeyStored: null,
      backupKeyCached: null,
      backupKeyWellFormed: null,
      secretStorageKeyInAccount: null,
      secretStorageReady: null,
      backupInfo: null,
      backupSigStatus: null,
      sessionsRemaining: 0
    };
  }

  componentDidMount() {
    this._checkKeyBackupStatus();

    _MatrixClientPeg.MatrixClientPeg.get().on('crypto.keyBackupStatus', this._onKeyBackupStatus);

    _MatrixClientPeg.MatrixClientPeg.get().on('crypto.keyBackupSessionsRemaining', this._onKeyBackupSessionsRemaining);
  }

  componentWillUnmount() {
    this._unmounted = true;

    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().removeListener('crypto.keyBackupStatus', this._onKeyBackupStatus);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener('crypto.keyBackupSessionsRemaining', this._onKeyBackupSessionsRemaining);
    }
  }

  async _checkKeyBackupStatus() {
    this._getUpdatedDiagnostics();

    try {
      const {
        backupInfo,
        trustInfo
      } = await _MatrixClientPeg.MatrixClientPeg.get().checkKeyBackup();
      this.setState({
        loading: false,
        error: null,
        backupInfo,
        backupSigStatus: trustInfo
      });
    } catch (e) {
      console.log("Unable to fetch check backup status", e);
      if (this._unmounted) return;
      this.setState({
        loading: false,
        error: e,
        backupInfo: null,
        backupSigStatus: null
      });
    }
  }

  async _loadBackupStatus() {
    this.setState({
      loading: true
    });

    this._getUpdatedDiagnostics();

    try {
      const backupInfo = await _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupVersion();
      const backupSigStatus = await _MatrixClientPeg.MatrixClientPeg.get().isKeyBackupTrusted(backupInfo);
      if (this._unmounted) return;
      this.setState({
        loading: false,
        error: null,
        backupInfo,
        backupSigStatus
      });
    } catch (e) {
      console.log("Unable to fetch key backup status", e);
      if (this._unmounted) return;
      this.setState({
        loading: false,
        error: e,
        backupInfo: null,
        backupSigStatus: null
      });
    }
  }

  async _getUpdatedDiagnostics() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const secretStorage = cli._crypto._secretStorage;
    const backupKeyStored = !!(await cli.isKeyBackupKeyStored());
    const backupKeyFromCache = await cli._crypto.getSessionBackupPrivateKey();
    const backupKeyCached = !!backupKeyFromCache;
    const backupKeyWellFormed = backupKeyFromCache instanceof Uint8Array;
    const secretStorageKeyInAccount = await secretStorage.hasKey();
    const secretStorageReady = await cli.isSecretStorageReady();
    if (this._unmounted) return;
    this.setState({
      backupKeyStored,
      backupKeyCached,
      backupKeyWellFormed,
      secretStorageKeyInAccount,
      secretStorageReady
    });
  }

  render() {
    const {
      loading,
      error,
      backupKeyStored,
      backupKeyCached,
      backupKeyWellFormed,
      secretStorageKeyInAccount,
      secretStorageReady,
      backupInfo,
      backupSigStatus,
      sessionsRemaining
    } = this.state;
    let statusDescription;
    let extraDetailsTableRows;
    let extraDetails;
    const actions = [];

    if (error) {
      statusDescription = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, (0, _languageHandler._t)("Unable to load key backup status"));
    } else if (loading) {
      statusDescription = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else if (backupInfo) {
      let restoreButtonCaption = (0, _languageHandler._t)("Restore from Backup");

      if (_MatrixClientPeg.MatrixClientPeg.get().getKeyBackupEnabled()) {
        statusDescription = /*#__PURE__*/_react.default.createElement("p", null, "\u2705 ", (0, _languageHandler._t)("This session is backing up your keys. "));
      } else {
        statusDescription = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This session is <b>not backing up your keys</b>, " + "but you do have an existing backup you can restore from " + "and add to going forward.", {}, {
          b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
        })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Connect this session to key backup before signing out to avoid " + "losing any keys that may only be on this session.")));
        restoreButtonCaption = (0, _languageHandler._t)("Connect this session to Key Backup");
      }

      let uploadStatus;

      if (!_MatrixClientPeg.MatrixClientPeg.get().getKeyBackupEnabled()) {
        // No upload status to show when backup disabled.
        uploadStatus = "";
      } else if (sessionsRemaining > 0) {
        uploadStatus = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Backing up %(sessionsRemaining)s keys...", {
          sessionsRemaining
        }), " ", /*#__PURE__*/_react.default.createElement("br", null));
      } else {
        uploadStatus = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("All keys backed up"), " ", /*#__PURE__*/_react.default.createElement("br", null));
      }

      let backupSigStatuses = backupSigStatus.sigs.map((sig, i) => {
        const deviceName = sig.device ? sig.device.getDisplayName() || sig.device.deviceId : null;

        const validity = sub => /*#__PURE__*/_react.default.createElement("span", {
          className: sig.valid ? 'mx_SecureBackupPanel_sigValid' : 'mx_SecureBackupPanel_sigInvalid'
        }, sub);

        const verify = sub => /*#__PURE__*/_react.default.createElement("span", {
          className: sig.device && sig.deviceTrust.isVerified() ? 'mx_SecureBackupPanel_deviceVerified' : 'mx_SecureBackupPanel_deviceNotVerified'
        }, sub);

        const device = sub => /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_SecureBackupPanel_deviceName"
        }, deviceName);

        const fromThisDevice = sig.device && sig.device.getFingerprint() === _MatrixClientPeg.MatrixClientPeg.get().getDeviceEd25519Key();

        const fromThisUser = sig.crossSigningId && sig.deviceId === _MatrixClientPeg.MatrixClientPeg.get().getCrossSigningId();

        let sigStatus;

        if (sig.valid && fromThisUser) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>valid</validity> signature from this user", {}, {
            validity
          });
        } else if (!sig.valid && fromThisUser) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>invalid</validity> signature from this user", {}, {
            validity
          });
        } else if (sig.crossSigningId) {
          sigStatus = (0, _languageHandler._t)("Backup has a signature from <verify>unknown</verify> user with ID %(deviceId)s", {
            deviceId: sig.deviceId
          }, {
            verify
          });
        } else if (!sig.device) {
          sigStatus = (0, _languageHandler._t)("Backup has a signature from <verify>unknown</verify> session with ID %(deviceId)s", {
            deviceId: sig.deviceId
          }, {
            verify
          });
        } else if (sig.valid && fromThisDevice) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>valid</validity> signature from this session", {}, {
            validity
          });
        } else if (!sig.valid && fromThisDevice) {
          // it can happen...
          sigStatus = (0, _languageHandler._t)("Backup has an <validity>invalid</validity> signature from this session", {}, {
            validity
          });
        } else if (sig.valid && sig.deviceTrust.isVerified()) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>valid</validity> signature from " + "<verify>verified</verify> session <device></device>", {}, {
            validity,
            verify,
            device
          });
        } else if (sig.valid && !sig.deviceTrust.isVerified()) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>valid</validity> signature from " + "<verify>unverified</verify> session <device></device>", {}, {
            validity,
            verify,
            device
          });
        } else if (!sig.valid && sig.deviceTrust.isVerified()) {
          sigStatus = (0, _languageHandler._t)("Backup has an <validity>invalid</validity> signature from " + "<verify>verified</verify> session <device></device>", {}, {
            validity,
            verify,
            device
          });
        } else if (!sig.valid && !sig.deviceTrust.isVerified()) {
          sigStatus = (0, _languageHandler._t)("Backup has an <validity>invalid</validity> signature from " + "<verify>unverified</verify> session <device></device>", {}, {
            validity,
            verify,
            device
          });
        }

        return /*#__PURE__*/_react.default.createElement("div", {
          key: i
        }, sigStatus);
      });

      if (backupSigStatus.sigs.length === 0) {
        backupSigStatuses = (0, _languageHandler._t)("Backup is not signed by any of your sessions");
      }

      let trustedLocally;

      if (backupSigStatus.trusted_locally) {
        trustedLocally = (0, _languageHandler._t)("This backup is trusted because it has been restored on this session");
      }

      extraDetailsTableRows = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Backup version:")), /*#__PURE__*/_react.default.createElement("td", null, backupInfo.version)), /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Algorithm:")), /*#__PURE__*/_react.default.createElement("td", null, backupInfo.algorithm)));
      extraDetails = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, uploadStatus, /*#__PURE__*/_react.default.createElement("div", null, backupSigStatuses), /*#__PURE__*/_react.default.createElement("div", null, trustedLocally));
      actions.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "restore",
        kind: "primary",
        onClick: this._restoreBackup
      }, restoreButtonCaption));

      if (!(0, _WellKnownUtils.isSecureBackupRequired)()) {
        actions.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          key: "delete",
          kind: "danger",
          onClick: this._deleteBackup
        }, (0, _languageHandler._t)("Delete Backup")));
      }
    } else {
      statusDescription = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your keys are <b>not being backed up from this session</b>.", {}, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Back up your keys before signing out to avoid losing them.")));
      actions.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "setup",
        kind: "primary",
        onClick: this._startNewBackup
      }, (0, _languageHandler._t)("Set up")));
    }

    if (secretStorageKeyInAccount) {
      actions.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "reset",
        kind: "danger",
        onClick: this._resetSecretStorage
      }, (0, _languageHandler._t)("Reset")));
    }

    let backupKeyWellFormedText = "";

    if (backupKeyCached) {
      backupKeyWellFormedText = ", ";

      if (backupKeyWellFormed) {
        backupKeyWellFormedText += (0, _languageHandler._t)("well formed");
      } else {
        backupKeyWellFormedText += (0, _languageHandler._t)("unexpected type");
      }
    }

    let actionRow;

    if (actions.length) {
      actionRow = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SecureBackupPanel_buttonRow"
      }, actions);
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Back up your encryption keys with your account data in case you " + "lose access to your sessions. Your keys will be secured with a " + "unique Security Key.")), statusDescription, /*#__PURE__*/_react.default.createElement("details", null, /*#__PURE__*/_react.default.createElement("summary", null, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("table", {
      className: "mx_SecureBackupPanel_statusList"
    }, /*#__PURE__*/_react.default.createElement("tbody", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Backup key stored:")), /*#__PURE__*/_react.default.createElement("td", null, backupKeyStored === true ? (0, _languageHandler._t)("in secret storage") : (0, _languageHandler._t)("not stored"))), /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Backup key cached:")), /*#__PURE__*/_react.default.createElement("td", null, backupKeyCached ? (0, _languageHandler._t)("cached locally") : (0, _languageHandler._t)("not found locally"), backupKeyWellFormedText)), /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Secret storage public key:")), /*#__PURE__*/_react.default.createElement("td", null, secretStorageKeyInAccount ? (0, _languageHandler._t)("in account data") : (0, _languageHandler._t)("not found"))), /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Secret storage:")), /*#__PURE__*/_react.default.createElement("td", null, secretStorageReady ? (0, _languageHandler._t)("ready") : (0, _languageHandler._t)("not ready"))), extraDetailsTableRows)), extraDetails), actionRow);
  }

}, _temp)) || _class);
exports.default = SecureBackupPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL1NlY3VyZUJhY2t1cFBhbmVsLmpzIl0sIm5hbWVzIjpbIlNlY3VyZUJhY2t1cFBhbmVsIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNlc3Npb25zUmVtYWluaW5nIiwic2V0U3RhdGUiLCJfbG9hZEJhY2t1cFN0YXR1cyIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jIiwib25GaW5pc2hlZCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJkYW5nZXIiLCJwcm9jZWVkIiwibG9hZGluZyIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImRlbGV0ZUtleUJhY2t1cFZlcnNpb24iLCJzdGF0ZSIsImJhY2t1cEluZm8iLCJ2ZXJzaW9uIiwidGhlbiIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJlcnJvciIsImUiLCJjb25zb2xlIiwiX3VubW91bnRlZCIsImJhY2t1cEtleVN0b3JlZCIsImJhY2t1cEtleUNhY2hlZCIsImJhY2t1cEtleVdlbGxGb3JtZWQiLCJzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50Iiwic2VjcmV0U3RvcmFnZVJlYWR5IiwiYmFja3VwU2lnU3RhdHVzIiwiY29tcG9uZW50RGlkTW91bnQiLCJfY2hlY2tLZXlCYWNrdXBTdGF0dXMiLCJvbiIsIl9vbktleUJhY2t1cFN0YXR1cyIsIl9vbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsIl9nZXRVcGRhdGVkRGlhZ25vc3RpY3MiLCJ0cnVzdEluZm8iLCJjaGVja0tleUJhY2t1cCIsImxvZyIsImdldEtleUJhY2t1cFZlcnNpb24iLCJpc0tleUJhY2t1cFRydXN0ZWQiLCJjbGkiLCJzZWNyZXRTdG9yYWdlIiwiX2NyeXB0byIsIl9zZWNyZXRTdG9yYWdlIiwiaXNLZXlCYWNrdXBLZXlTdG9yZWQiLCJiYWNrdXBLZXlGcm9tQ2FjaGUiLCJnZXRTZXNzaW9uQmFja3VwUHJpdmF0ZUtleSIsIlVpbnQ4QXJyYXkiLCJoYXNLZXkiLCJpc1NlY3JldFN0b3JhZ2VSZWFkeSIsInJlbmRlciIsInN0YXR1c0Rlc2NyaXB0aW9uIiwiZXh0cmFEZXRhaWxzVGFibGVSb3dzIiwiZXh0cmFEZXRhaWxzIiwiYWN0aW9ucyIsInJlc3RvcmVCdXR0b25DYXB0aW9uIiwiZ2V0S2V5QmFja3VwRW5hYmxlZCIsImIiLCJzdWIiLCJ1cGxvYWRTdGF0dXMiLCJiYWNrdXBTaWdTdGF0dXNlcyIsInNpZ3MiLCJtYXAiLCJzaWciLCJpIiwiZGV2aWNlTmFtZSIsImRldmljZSIsImdldERpc3BsYXlOYW1lIiwiZGV2aWNlSWQiLCJ2YWxpZGl0eSIsInZhbGlkIiwidmVyaWZ5IiwiZGV2aWNlVHJ1c3QiLCJpc1ZlcmlmaWVkIiwiZnJvbVRoaXNEZXZpY2UiLCJnZXRGaW5nZXJwcmludCIsImdldERldmljZUVkMjU1MTlLZXkiLCJmcm9tVGhpc1VzZXIiLCJjcm9zc1NpZ25pbmdJZCIsImdldENyb3NzU2lnbmluZ0lkIiwic2lnU3RhdHVzIiwibGVuZ3RoIiwidHJ1c3RlZExvY2FsbHkiLCJ0cnVzdGVkX2xvY2FsbHkiLCJhbGdvcml0aG0iLCJwdXNoIiwiX3Jlc3RvcmVCYWNrdXAiLCJfZGVsZXRlQmFja3VwIiwiX3N0YXJ0TmV3QmFja3VwIiwiX3Jlc2V0U2VjcmV0U3RvcmFnZSIsImJhY2t1cEtleVdlbGxGb3JtZWRUZXh0IiwiYWN0aW9uUm93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSxpQixXQURwQixnREFBcUIsa0NBQXJCLEMseUJBQUQsTUFDcUJBLGlCQURyQixTQUMrQ0MsZUFBTUMsYUFE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RkosQ0FQK0MsZUFjL0Msc0RBQ0kseUNBQUsseUJBQUcsNEJBQUgsQ0FBTCxDQURKLGVBRUkseUNBQUtsRSx5QkFBeUIsR0FBRyx5QkFBRyxpQkFBSCxDQUFILEdBQTJCLHlCQUFHLFdBQUgsQ0FBekQsQ0FGSixDQWQrQyxlQWtCL0Msc0RBQ0kseUNBQUsseUJBQUcsaUJBQUgsQ0FBTCxDQURKLGVBRUkseUNBQUtDLGtCQUFrQixHQUFHLHlCQUFHLE9BQUgsQ0FBSCxHQUFpQix5QkFBRyxXQUFILENBQXhDLENBRkosQ0FsQitDLEVBc0I5QzJCLHFCQXRCOEMsQ0FBbkQsQ0FGSixFQTBCS0MsWUExQkwsQ0FQSixFQW1DS3NDLFNBbkNMLENBREo7QUF1Q0g7O0FBL2E4RCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IGlzU2VjdXJlQmFja3VwUmVxdWlyZWQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9XZWxsS25vd25VdGlscyc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuLi9lbGVtZW50cy9TcGlubmVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2cnO1xuaW1wb3J0IFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZnJvbSAnLi4vZGlhbG9ncy9zZWN1cml0eS9SZXN0b3JlS2V5QmFja3VwRGlhbG9nJztcbmltcG9ydCB7IGFjY2Vzc1NlY3JldFN0b3JhZ2UgfSBmcm9tICcuLi8uLi8uLi9TZWN1cml0eU1hbmFnZXInO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnNldHRpbmdzLlNlY3VyZUJhY2t1cFBhbmVsXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWN1cmVCYWNrdXBQYW5lbCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cEtleVN0b3JlZDogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cEtleUNhY2hlZDogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cEtleVdlbGxGb3JtZWQ6IG51bGwsXG4gICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50OiBudWxsLFxuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZVJlYWR5OiBudWxsLFxuICAgICAgICAgICAgYmFja3VwSW5mbzogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cFNpZ1N0YXR1czogbnVsbCxcbiAgICAgICAgICAgIHNlc3Npb25zUmVtYWluaW5nOiAwLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9jaGVja0tleUJhY2t1cFN0YXR1cygpO1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignY3J5cHRvLmtleUJhY2t1cFN0YXR1cycsIHRoaXMuX29uS2V5QmFja3VwU3RhdHVzKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFxuICAgICAgICAgICAgJ2NyeXB0by5rZXlCYWNrdXBTZXNzaW9uc1JlbWFpbmluZycsXG4gICAgICAgICAgICB0aGlzLl9vbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcignY3J5cHRvLmtleUJhY2t1cFN0YXR1cycsIHRoaXMuX29uS2V5QmFja3VwU3RhdHVzKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAnY3J5cHRvLmtleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nJyxcbiAgICAgICAgICAgICAgICB0aGlzLl9vbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nID0gKHNlc3Npb25zUmVtYWluaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2Vzc2lvbnNSZW1haW5pbmcsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vbktleUJhY2t1cFN0YXR1cyA9ICgpID0+IHtcbiAgICAgICAgLy8gVGhpcyBqdXN0IGxvYWRzIHRoZSBjdXJyZW50IGJhY2t1cCBzdGF0dXMgcmF0aGVyIHRoYW4gZm9yY2luZ1xuICAgICAgICAvLyBhIHJlLWNoZWNrIG90aGVyd2lzZSB3ZSByaXNrIGNhdXNpbmcgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgdGhpcy5fbG9hZEJhY2t1cFN0YXR1cygpO1xuICAgIH1cblxuICAgIGFzeW5jIF9jaGVja0tleUJhY2t1cFN0YXR1cygpIHtcbiAgICAgICAgdGhpcy5fZ2V0VXBkYXRlZERpYWdub3N0aWNzKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7YmFja3VwSW5mbywgdHJ1c3RJbmZvfSA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jaGVja0tleUJhY2t1cCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbyxcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXM6IHRydXN0SW5mbyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBmZXRjaCBjaGVjayBiYWNrdXAgc3RhdHVzXCIsIGUpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGUsXG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbzogbnVsbCxcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9sb2FkQmFja3VwU3RhdHVzKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5fZ2V0VXBkYXRlZERpYWdub3N0aWNzKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBiYWNrdXBJbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldEtleUJhY2t1cFZlcnNpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cFNpZ1N0YXR1cyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0tleUJhY2t1cFRydXN0ZWQoYmFja3VwSW5mbyk7XG4gICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBiYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgIGJhY2t1cFNpZ1N0YXR1cyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBmZXRjaCBrZXkgYmFja3VwIHN0YXR1c1wiLCBlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlLFxuICAgICAgICAgICAgICAgIGJhY2t1cEluZm86IG51bGwsXG4gICAgICAgICAgICAgICAgYmFja3VwU2lnU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfZ2V0VXBkYXRlZERpYWdub3N0aWNzKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHNlY3JldFN0b3JhZ2UgPSBjbGkuX2NyeXB0by5fc2VjcmV0U3RvcmFnZTtcblxuICAgICAgICBjb25zdCBiYWNrdXBLZXlTdG9yZWQgPSAhIShhd2FpdCBjbGkuaXNLZXlCYWNrdXBLZXlTdG9yZWQoKSk7XG4gICAgICAgIGNvbnN0IGJhY2t1cEtleUZyb21DYWNoZSA9IGF3YWl0IGNsaS5fY3J5cHRvLmdldFNlc3Npb25CYWNrdXBQcml2YXRlS2V5KCk7XG4gICAgICAgIGNvbnN0IGJhY2t1cEtleUNhY2hlZCA9ICEhKGJhY2t1cEtleUZyb21DYWNoZSk7XG4gICAgICAgIGNvbnN0IGJhY2t1cEtleVdlbGxGb3JtZWQgPSBiYWNrdXBLZXlGcm9tQ2FjaGUgaW5zdGFuY2VvZiBVaW50OEFycmF5O1xuICAgICAgICBjb25zdCBzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50ID0gYXdhaXQgc2VjcmV0U3RvcmFnZS5oYXNLZXkoKTtcbiAgICAgICAgY29uc3Qgc2VjcmV0U3RvcmFnZVJlYWR5ID0gYXdhaXQgY2xpLmlzU2VjcmV0U3RvcmFnZVJlYWR5KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJhY2t1cEtleVN0b3JlZCxcbiAgICAgICAgICAgIGJhY2t1cEtleUNhY2hlZCxcbiAgICAgICAgICAgIGJhY2t1cEtleVdlbGxGb3JtZWQsXG4gICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50LFxuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZVJlYWR5LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfc3RhcnROZXdCYWNrdXAgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYygnS2V5IEJhY2t1cCcsICdLZXkgQmFja3VwJyxcbiAgICAgICAgICAgIGltcG9ydCgnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0NyZWF0ZUtleUJhY2t1cERpYWxvZycpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZEJhY2t1cFN0YXR1cygpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LCBudWxsLCAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9kZWxldGVCYWNrdXAgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0RlbGV0ZSBCYWNrdXAnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdCgnRGVsZXRlIEJhY2t1cCcpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgIFwiQXJlIHlvdSBzdXJlPyBZb3Ugd2lsbCBsb3NlIHlvdXIgZW5jcnlwdGVkIG1lc3NhZ2VzIGlmIHlvdXIgXCIgK1xuICAgICAgICAgICAgICAgIFwia2V5cyBhcmUgbm90IGJhY2tlZCB1cCBwcm9wZXJseS5cIixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBidXR0b246IF90KCdEZWxldGUgQmFja3VwJyksXG4gICAgICAgICAgICBkYW5nZXI6IHRydWUsXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAocHJvY2VlZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvYWRpbmc6IHRydWV9KTtcbiAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlS2V5QmFja3VwVmVyc2lvbih0aGlzLnN0YXRlLmJhY2t1cEluZm8udmVyc2lvbikudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRCYWNrdXBTdGF0dXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9yZXN0b3JlQmFja3VwID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgJ1Jlc3RvcmUgQmFja3VwJywgJycsIFJlc3RvcmVLZXlCYWNrdXBEaWFsb2csIG51bGwsIG51bGwsXG4gICAgICAgICAgICAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZXNldFNlY3JldFN0b3JhZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGFjY2Vzc1NlY3JldFN0b3JhZ2UoKCkgPT4geyB9LCAvKiBmb3JjZVJlc2V0ID0gKi8gdHJ1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciByZXNldHRpbmcgc2VjcmV0IHN0b3JhZ2VcIiwgZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IGUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sb2FkQmFja3VwU3RhdHVzKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBsb2FkaW5nLFxuICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICBiYWNrdXBLZXlTdG9yZWQsXG4gICAgICAgICAgICBiYWNrdXBLZXlDYWNoZWQsXG4gICAgICAgICAgICBiYWNrdXBLZXlXZWxsRm9ybWVkLFxuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleUluQWNjb3VudCxcbiAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VSZWFkeSxcbiAgICAgICAgICAgIGJhY2t1cEluZm8sXG4gICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXMsXG4gICAgICAgICAgICBzZXNzaW9uc1JlbWFpbmluZyxcbiAgICAgICAgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgbGV0IHN0YXR1c0Rlc2NyaXB0aW9uO1xuICAgICAgICBsZXQgZXh0cmFEZXRhaWxzVGFibGVSb3dzO1xuICAgICAgICBsZXQgZXh0cmFEZXRhaWxzO1xuICAgICAgICBjb25zdCBhY3Rpb25zID0gW107XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJVbmFibGUgdG8gbG9hZCBrZXkgYmFja3VwIHN0YXR1c1wiKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAobG9hZGluZykge1xuICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb24gPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIGlmIChiYWNrdXBJbmZvKSB7XG4gICAgICAgICAgICBsZXQgcmVzdG9yZUJ1dHRvbkNhcHRpb24gPSBfdChcIlJlc3RvcmUgZnJvbSBCYWNrdXBcIik7XG5cbiAgICAgICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb24gPSA8cD7inIUge190KFwiVGhpcyBzZXNzaW9uIGlzIGJhY2tpbmcgdXAgeW91ciBrZXlzLiBcIil9PC9wPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb24gPSA8PlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgc2Vzc2lvbiBpcyA8Yj5ub3QgYmFja2luZyB1cCB5b3VyIGtleXM8L2I+LCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImJ1dCB5b3UgZG8gaGF2ZSBhbiBleGlzdGluZyBiYWNrdXAgeW91IGNhbiByZXN0b3JlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhbmQgYWRkIHRvIGdvaW5nIGZvcndhcmQuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAge2I6IHN1YiA9PiA8Yj57c3VifTwvYj59LFxuICAgICAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJDb25uZWN0IHRoaXMgc2Vzc2lvbiB0byBrZXkgYmFja3VwIGJlZm9yZSBzaWduaW5nIG91dCB0byBhdm9pZCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxvc2luZyBhbnkga2V5cyB0aGF0IG1heSBvbmx5IGJlIG9uIHRoaXMgc2Vzc2lvbi5cIixcbiAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgICAgIHJlc3RvcmVCdXR0b25DYXB0aW9uID0gX3QoXCJDb25uZWN0IHRoaXMgc2Vzc2lvbiB0byBLZXkgQmFja3VwXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdXBsb2FkU3RhdHVzO1xuICAgICAgICAgICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gdXBsb2FkIHN0YXR1cyB0byBzaG93IHdoZW4gYmFja3VwIGRpc2FibGVkLlxuICAgICAgICAgICAgICAgIHVwbG9hZFN0YXR1cyA9IFwiXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNlc3Npb25zUmVtYWluaW5nID4gMCkge1xuICAgICAgICAgICAgICAgIHVwbG9hZFN0YXR1cyA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkJhY2tpbmcgdXAgJShzZXNzaW9uc1JlbWFpbmluZylzIGtleXMuLi5cIiwgeyBzZXNzaW9uc1JlbWFpbmluZyB9KX0gPGJyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1cGxvYWRTdGF0dXMgPSA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJBbGwga2V5cyBiYWNrZWQgdXBcIil9IDxiciAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGJhY2t1cFNpZ1N0YXR1c2VzID0gYmFja3VwU2lnU3RhdHVzLnNpZ3MubWFwKChzaWcsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VOYW1lID0gc2lnLmRldmljZSA/IChzaWcuZGV2aWNlLmdldERpc3BsYXlOYW1lKCkgfHwgc2lnLmRldmljZS5kZXZpY2VJZCkgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkaXR5ID0gc3ViID0+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c2lnLnZhbGlkID8gJ214X1NlY3VyZUJhY2t1cFBhbmVsX3NpZ1ZhbGlkJyA6ICdteF9TZWN1cmVCYWNrdXBQYW5lbF9zaWdJbnZhbGlkJ30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICAgICAgICAgIGNvbnN0IHZlcmlmeSA9IHN1YiA9PlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3NpZy5kZXZpY2UgJiYgc2lnLmRldmljZVRydXN0LmlzVmVyaWZpZWQoKSA/ICdteF9TZWN1cmVCYWNrdXBQYW5lbF9kZXZpY2VWZXJpZmllZCcgOiAnbXhfU2VjdXJlQmFja3VwUGFuZWxfZGV2aWNlTm90VmVyaWZpZWQnfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzdWJ9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlID0gc3ViID0+IDxzcGFuIGNsYXNzTmFtZT1cIm14X1NlY3VyZUJhY2t1cFBhbmVsX2RldmljZU5hbWVcIj57ZGV2aWNlTmFtZX08L3NwYW4+O1xuICAgICAgICAgICAgICAgIGNvbnN0IGZyb21UaGlzRGV2aWNlID0gKFxuICAgICAgICAgICAgICAgICAgICBzaWcuZGV2aWNlICYmXG4gICAgICAgICAgICAgICAgICAgIHNpZy5kZXZpY2UuZ2V0RmluZ2VycHJpbnQoKSA9PT0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERldmljZUVkMjU1MTlLZXkoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgZnJvbVRoaXNVc2VyID0gKFxuICAgICAgICAgICAgICAgICAgICBzaWcuY3Jvc3NTaWduaW5nSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgc2lnLmRldmljZUlkID09PSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Q3Jvc3NTaWduaW5nSWQoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgbGV0IHNpZ1N0YXR1cztcbiAgICAgICAgICAgICAgICBpZiAoc2lnLnZhbGlkICYmIGZyb21UaGlzVXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhIDx2YWxpZGl0eT52YWxpZDwvdmFsaWRpdHk+IHNpZ25hdHVyZSBmcm9tIHRoaXMgdXNlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzaWcudmFsaWQgJiYgZnJvbVRoaXNVc2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGEgPHZhbGlkaXR5PmludmFsaWQ8L3ZhbGlkaXR5PiBzaWduYXR1cmUgZnJvbSB0aGlzIHVzZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9LCB7IHZhbGlkaXR5IH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaWcuY3Jvc3NTaWduaW5nSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2lnU3RhdHVzID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkJhY2t1cCBoYXMgYSBzaWduYXR1cmUgZnJvbSA8dmVyaWZ5PnVua25vd248L3ZlcmlmeT4gdXNlciB3aXRoIElEICUoZGV2aWNlSWQpc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBkZXZpY2VJZDogc2lnLmRldmljZUlkIH0sIHsgdmVyaWZ5IH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lnLmRldmljZSkge1xuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhIHNpZ25hdHVyZSBmcm9tIDx2ZXJpZnk+dW5rbm93bjwvdmVyaWZ5PiBzZXNzaW9uIHdpdGggSUQgJShkZXZpY2VJZClzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGRldmljZUlkOiBzaWcuZGV2aWNlSWQgfSwgeyB2ZXJpZnkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpZy52YWxpZCAmJiBmcm9tVGhpc0RldmljZSkge1xuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhIDx2YWxpZGl0eT52YWxpZDwvdmFsaWRpdHk+IHNpZ25hdHVyZSBmcm9tIHRoaXMgc2Vzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzaWcudmFsaWQgJiYgZnJvbVRoaXNEZXZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaXQgY2FuIGhhcHBlbi4uLlxuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhbiA8dmFsaWRpdHk+aW52YWxpZDwvdmFsaWRpdHk+IHNpZ25hdHVyZSBmcm9tIHRoaXMgc2Vzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpZy52YWxpZCAmJiBzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGEgPHZhbGlkaXR5PnZhbGlkPC92YWxpZGl0eT4gc2lnbmF0dXJlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8dmVyaWZ5PnZlcmlmaWVkPC92ZXJpZnk+IHNlc3Npb24gPGRldmljZT48L2RldmljZT5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9LCB7IHZhbGlkaXR5LCB2ZXJpZnksIGRldmljZSB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2lnLnZhbGlkICYmICFzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGEgPHZhbGlkaXR5PnZhbGlkPC92YWxpZGl0eT4gc2lnbmF0dXJlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8dmVyaWZ5PnVudmVyaWZpZWQ8L3ZlcmlmeT4gc2Vzc2lvbiA8ZGV2aWNlPjwvZGV2aWNlPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHksIHZlcmlmeSwgZGV2aWNlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lnLnZhbGlkICYmIHNpZy5kZXZpY2VUcnVzdC5pc1ZlcmlmaWVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2lnU3RhdHVzID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkJhY2t1cCBoYXMgYW4gPHZhbGlkaXR5PmludmFsaWQ8L3ZhbGlkaXR5PiBzaWduYXR1cmUgZnJvbSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjx2ZXJpZnk+dmVyaWZpZWQ8L3ZlcmlmeT4gc2Vzc2lvbiA8ZGV2aWNlPjwvZGV2aWNlPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHksIHZlcmlmeSwgZGV2aWNlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lnLnZhbGlkICYmICFzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGFuIDx2YWxpZGl0eT5pbnZhbGlkPC92YWxpZGl0eT4gc2lnbmF0dXJlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8dmVyaWZ5PnVudmVyaWZpZWQ8L3ZlcmlmeT4gc2Vzc2lvbiA8ZGV2aWNlPjwvZGV2aWNlPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHksIHZlcmlmeSwgZGV2aWNlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXYga2V5PXtpfT5cbiAgICAgICAgICAgICAgICAgICAge3NpZ1N0YXR1c31cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChiYWNrdXBTaWdTdGF0dXMuc2lncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXNlcyA9IF90KFwiQmFja3VwIGlzIG5vdCBzaWduZWQgYnkgYW55IG9mIHlvdXIgc2Vzc2lvbnNcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB0cnVzdGVkTG9jYWxseTtcbiAgICAgICAgICAgIGlmIChiYWNrdXBTaWdTdGF0dXMudHJ1c3RlZF9sb2NhbGx5KSB7XG4gICAgICAgICAgICAgICAgdHJ1c3RlZExvY2FsbHkgPSBfdChcIlRoaXMgYmFja3VwIGlzIHRydXN0ZWQgYmVjYXVzZSBpdCBoYXMgYmVlbiByZXN0b3JlZCBvbiB0aGlzIHNlc3Npb25cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhRGV0YWlsc1RhYmxlUm93cyA9IDw+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+e190KFwiQmFja3VwIHZlcnNpb246XCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57YmFja3VwSW5mby52ZXJzaW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57X3QoXCJBbGdvcml0aG06XCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57YmFja3VwSW5mby5hbGdvcml0aG19PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC8+O1xuXG4gICAgICAgICAgICBleHRyYURldGFpbHMgPSA8PlxuICAgICAgICAgICAgICAgIHt1cGxvYWRTdGF0dXN9XG4gICAgICAgICAgICAgICAgPGRpdj57YmFja3VwU2lnU3RhdHVzZXN9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57dHJ1c3RlZExvY2FsbHl9PC9kaXY+XG4gICAgICAgICAgICA8Lz47XG5cbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBrZXk9XCJyZXN0b3JlXCIga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLl9yZXN0b3JlQmFja3VwfT5cbiAgICAgICAgICAgICAgICAgICAge3Jlc3RvcmVCdXR0b25DYXB0aW9ufVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoIWlzU2VjdXJlQmFja3VwUmVxdWlyZWQoKSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2V5PVwiZGVsZXRlXCIga2luZD1cImRhbmdlclwiIG9uQ2xpY2s9e3RoaXMuX2RlbGV0ZUJhY2t1cH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJEZWxldGUgQmFja3VwXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0dXNEZXNjcmlwdGlvbiA9IDw+XG4gICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIllvdXIga2V5cyBhcmUgPGI+bm90IGJlaW5nIGJhY2tlZCB1cCBmcm9tIHRoaXMgc2Vzc2lvbjwvYj4uXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7Yjogc3ViID0+IDxiPntzdWJ9PC9iPn0sXG4gICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiQmFjayB1cCB5b3VyIGtleXMgYmVmb3JlIHNpZ25pbmcgb3V0IHRvIGF2b2lkIGxvc2luZyB0aGVtLlwiKX08L3A+XG4gICAgICAgICAgICA8Lz47XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2V5PVwic2V0dXBcIiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX3N0YXJ0TmV3QmFja3VwfT5cbiAgICAgICAgICAgICAgICAgICAge190KFwiU2V0IHVwXCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlY3JldFN0b3JhZ2VLZXlJbkFjY291bnQpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBrZXk9XCJyZXNldFwiIGtpbmQ9XCJkYW5nZXJcIiBvbkNsaWNrPXt0aGlzLl9yZXNldFNlY3JldFN0b3JhZ2V9PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZXNldFwiKX1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBiYWNrdXBLZXlXZWxsRm9ybWVkVGV4dCA9IFwiXCI7XG4gICAgICAgIGlmIChiYWNrdXBLZXlDYWNoZWQpIHtcbiAgICAgICAgICAgIGJhY2t1cEtleVdlbGxGb3JtZWRUZXh0ID0gXCIsIFwiO1xuICAgICAgICAgICAgaWYgKGJhY2t1cEtleVdlbGxGb3JtZWQpIHtcbiAgICAgICAgICAgICAgICBiYWNrdXBLZXlXZWxsRm9ybWVkVGV4dCArPSBfdChcIndlbGwgZm9ybWVkXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYWNrdXBLZXlXZWxsRm9ybWVkVGV4dCArPSBfdChcInVuZXhwZWN0ZWQgdHlwZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhY3Rpb25Sb3c7XG4gICAgICAgIGlmIChhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgYWN0aW9uUm93ID0gPGRpdiBjbGFzc05hbWU9XCJteF9TZWN1cmVCYWNrdXBQYW5lbF9idXR0b25Sb3dcIj5cbiAgICAgICAgICAgICAgICB7YWN0aW9uc31cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJCYWNrIHVwIHlvdXIgZW5jcnlwdGlvbiBrZXlzIHdpdGggeW91ciBhY2NvdW50IGRhdGEgaW4gY2FzZSB5b3UgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImxvc2UgYWNjZXNzIHRvIHlvdXIgc2Vzc2lvbnMuIFlvdXIga2V5cyB3aWxsIGJlIHNlY3VyZWQgd2l0aCBhIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ1bmlxdWUgU2VjdXJpdHkgS2V5LlwiLFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgIHtzdGF0dXNEZXNjcmlwdGlvbn1cbiAgICAgICAgICAgICAgICA8ZGV0YWlscz5cbiAgICAgICAgICAgICAgICAgICAgPHN1bW1hcnk+e190KFwiQWR2YW5jZWRcIil9PC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwibXhfU2VjdXJlQmFja3VwUGFuZWxfc3RhdHVzTGlzdFwiPjx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e190KFwiQmFja3VwIGtleSBzdG9yZWQ6XCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja3VwS2V5U3RvcmVkID09PSB0cnVlID8gX3QoXCJpbiBzZWNyZXQgc3RvcmFnZVwiKSA6IF90KFwibm90IHN0b3JlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e190KFwiQmFja3VwIGtleSBjYWNoZWQ6XCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmFja3VwS2V5Q2FjaGVkID8gX3QoXCJjYWNoZWQgbG9jYWxseVwiKSA6IF90KFwibm90IGZvdW5kIGxvY2FsbHlcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtiYWNrdXBLZXlXZWxsRm9ybWVkVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e190KFwiU2VjcmV0IHN0b3JhZ2UgcHVibGljIGtleTpcIil9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3NlY3JldFN0b3JhZ2VLZXlJbkFjY291bnQgPyBfdChcImluIGFjY291bnQgZGF0YVwiKSA6IF90KFwibm90IGZvdW5kXCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD57X3QoXCJTZWNyZXQgc3RvcmFnZTpcIil9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3NlY3JldFN0b3JhZ2VSZWFkeSA/IF90KFwicmVhZHlcIikgOiBfdChcIm5vdCByZWFkeVwiKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtleHRyYURldGFpbHNUYWJsZVJvd3N9XG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+PC90YWJsZT5cbiAgICAgICAgICAgICAgICAgICAge2V4dHJhRGV0YWlsc31cbiAgICAgICAgICAgICAgICA8L2RldGFpbHM+XG4gICAgICAgICAgICAgICAge2FjdGlvblJvd31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
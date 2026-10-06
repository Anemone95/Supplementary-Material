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

/*
Copyright 2018 New Vector Ltd
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
class SecureBackupPanel extends _react.default.PureComponent {
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

}

exports.default = SecureBackupPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL1NlY3VyZUJhY2t1cFBhbmVsLmpzIl0sIm5hbWVzIjpbIlNlY3VyZUJhY2t1cFBhbmVsIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNlc3Npb25zUmVtYWluaW5nIiwic2V0U3RhdGUiLCJfbG9hZEJhY2t1cFN0YXR1cyIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jIiwib25GaW5pc2hlZCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJkYW5nZXIiLCJwcm9jZWVkIiwibG9hZGluZyIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImRlbGV0ZUtleUJhY2t1cFZlcnNpb24iLCJzdGF0ZSIsImJhY2t1cEluZm8iLCJ2ZXJzaW9uIiwidGhlbiIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJlcnJvciIsImUiLCJjb25zb2xlIiwiX3VubW91bnRlZCIsImJhY2t1cEtleVN0b3JlZCIsImJhY2t1cEtleUNhY2hlZCIsImJhY2t1cEtleVdlbGxGb3JtZWQiLCJzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50Iiwic2VjcmV0U3RvcmFnZVJlYWR5IiwiYmFja3VwU2lnU3RhdHVzIiwiY29tcG9uZW50RGlkTW91bnQiLCJfY2hlY2tLZXlCYWNrdXBTdGF0dXMiLCJvbiIsIl9vbktleUJhY2t1cFN0YXR1cyIsIl9vbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsIl9nZXRVcGRhdGVkRGlhZ25vc3RpY3MiLCJ0cnVzdEluZm8iLCJjaGVja0tleUJhY2t1cCIsImxvZyIsImdldEtleUJhY2t1cFZlcnNpb24iLCJpc0tleUJhY2t1cFRydXN0ZWQiLCJjbGkiLCJzZWNyZXRTdG9yYWdlIiwiX2NyeXB0byIsIl9zZWNyZXRTdG9yYWdlIiwiaXNLZXlCYWNrdXBLZXlTdG9yZWQiLCJiYWNrdXBLZXlGcm9tQ2FjaGUiLCJnZXRTZXNzaW9uQmFja3VwUHJpdmF0ZUtleSIsIlVpbnQ4QXJyYXkiLCJoYXNLZXkiLCJpc1NlY3JldFN0b3JhZ2VSZWFkeSIsInJlbmRlciIsInN0YXR1c0Rlc2NyaXB0aW9uIiwiZXh0cmFEZXRhaWxzVGFibGVSb3dzIiwiZXh0cmFEZXRhaWxzIiwiYWN0aW9ucyIsInJlc3RvcmVCdXR0b25DYXB0aW9uIiwiZ2V0S2V5QmFja3VwRW5hYmxlZCIsImIiLCJzdWIiLCJ1cGxvYWRTdGF0dXMiLCJiYWNrdXBTaWdTdGF0dXNlcyIsInNpZ3MiLCJtYXAiLCJzaWciLCJpIiwiZGV2aWNlTmFtZSIsImRldmljZSIsImdldERpc3BsYXlOYW1lIiwiZGV2aWNlSWQiLCJ2YWxpZGl0eSIsInZhbGlkIiwidmVyaWZ5IiwiZGV2aWNlVHJ1c3QiLCJpc1ZlcmlmaWVkIiwiZnJvbVRoaXNEZXZpY2UiLCJnZXRGaW5nZXJwcmludCIsImdldERldmljZUVkMjU1MTlLZXkiLCJmcm9tVGhpc1VzZXIiLCJjcm9zc1NpZ25pbmdJZCIsImdldENyb3NzU2lnbmluZ0lkIiwic2lnU3RhdHVzIiwibGVuZ3RoIiwidHJ1c3RlZExvY2FsbHkiLCJ0cnVzdGVkX2xvY2FsbHkiLCJhbGdvcml0aG0iLCJwdXNoIiwiX3Jlc3RvcmVCYWNrdXAiLCJfZGVsZXRlQmFja3VwIiwiX3N0YXJ0TmV3QmFja3VwIiwiX3Jlc2V0U2VjcmV0U3RvcmFnZSIsImJhY2t1cEtleVdlbGxGb3JtZWRUZXh0IiwiYWN0aW9uUm93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUEwQix5QkFBRyxtQkFBSCxDQUQ5QyxFQUVLb0UsdUJBRkwsQ0FGSixDQVArQyxlQWMvQyxzREFDSSx5Q0FBSyx5QkFBRyw0QkFBSCxDQUFMLENBREosZUFFSSx5Q0FBS2xFLHlCQUF5QixHQUFHLHlCQUFHLGlCQUFILENBQUgsR0FBMkIseUJBQUcsV0FBSCxDQUF6RCxDQUZKLENBZCtDLGVBa0IvQyxzREFDSSx5Q0FBSyx5QkFBRyxpQkFBSCxDQUFMLENBREosZUFFSSx5Q0FBS0Msa0JBQWtCLEdBQUcseUJBQUcsT0FBSCxDQUFILEdBQWlCLHlCQUFHLFdBQUgsQ0FBeEMsQ0FGSixDQWxCK0MsRUFzQjlDMkIscUJBdEI4QyxDQUFuRCxDQUZKLEVBMEJLQyxZQTFCTCxDQVBKLEVBbUNLc0MsU0FuQ0wsQ0FESjtBQXVDSDs7QUEvYThEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IGlzU2VjdXJlQmFja3VwUmVxdWlyZWQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9XZWxsS25vd25VdGlscyc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuLi9lbGVtZW50cy9TcGlubmVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2cnO1xuaW1wb3J0IFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZnJvbSAnLi4vZGlhbG9ncy9zZWN1cml0eS9SZXN0b3JlS2V5QmFja3VwRGlhbG9nJztcbmltcG9ydCB7IGFjY2Vzc1NlY3JldFN0b3JhZ2UgfSBmcm9tICcuLi8uLi8uLi9TZWN1cml0eU1hbmFnZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWN1cmVCYWNrdXBQYW5lbCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cEtleVN0b3JlZDogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cEtleUNhY2hlZDogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cEtleVdlbGxGb3JtZWQ6IG51bGwsXG4gICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50OiBudWxsLFxuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZVJlYWR5OiBudWxsLFxuICAgICAgICAgICAgYmFja3VwSW5mbzogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cFNpZ1N0YXR1czogbnVsbCxcbiAgICAgICAgICAgIHNlc3Npb25zUmVtYWluaW5nOiAwLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9jaGVja0tleUJhY2t1cFN0YXR1cygpO1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignY3J5cHRvLmtleUJhY2t1cFN0YXR1cycsIHRoaXMuX29uS2V5QmFja3VwU3RhdHVzKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFxuICAgICAgICAgICAgJ2NyeXB0by5rZXlCYWNrdXBTZXNzaW9uc1JlbWFpbmluZycsXG4gICAgICAgICAgICB0aGlzLl9vbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcignY3J5cHRvLmtleUJhY2t1cFN0YXR1cycsIHRoaXMuX29uS2V5QmFja3VwU3RhdHVzKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAnY3J5cHRvLmtleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nJyxcbiAgICAgICAgICAgICAgICB0aGlzLl9vbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nID0gKHNlc3Npb25zUmVtYWluaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2Vzc2lvbnNSZW1haW5pbmcsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vbktleUJhY2t1cFN0YXR1cyA9ICgpID0+IHtcbiAgICAgICAgLy8gVGhpcyBqdXN0IGxvYWRzIHRoZSBjdXJyZW50IGJhY2t1cCBzdGF0dXMgcmF0aGVyIHRoYW4gZm9yY2luZ1xuICAgICAgICAvLyBhIHJlLWNoZWNrIG90aGVyd2lzZSB3ZSByaXNrIGNhdXNpbmcgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgdGhpcy5fbG9hZEJhY2t1cFN0YXR1cygpO1xuICAgIH1cblxuICAgIGFzeW5jIF9jaGVja0tleUJhY2t1cFN0YXR1cygpIHtcbiAgICAgICAgdGhpcy5fZ2V0VXBkYXRlZERpYWdub3N0aWNzKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7YmFja3VwSW5mbywgdHJ1c3RJbmZvfSA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jaGVja0tleUJhY2t1cCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbyxcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXM6IHRydXN0SW5mbyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBmZXRjaCBjaGVjayBiYWNrdXAgc3RhdHVzXCIsIGUpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGUsXG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbzogbnVsbCxcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9sb2FkQmFja3VwU3RhdHVzKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5fZ2V0VXBkYXRlZERpYWdub3N0aWNzKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBiYWNrdXBJbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldEtleUJhY2t1cFZlcnNpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cFNpZ1N0YXR1cyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0tleUJhY2t1cFRydXN0ZWQoYmFja3VwSW5mbyk7XG4gICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBiYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgIGJhY2t1cFNpZ1N0YXR1cyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBmZXRjaCBrZXkgYmFja3VwIHN0YXR1c1wiLCBlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlLFxuICAgICAgICAgICAgICAgIGJhY2t1cEluZm86IG51bGwsXG4gICAgICAgICAgICAgICAgYmFja3VwU2lnU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfZ2V0VXBkYXRlZERpYWdub3N0aWNzKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHNlY3JldFN0b3JhZ2UgPSBjbGkuX2NyeXB0by5fc2VjcmV0U3RvcmFnZTtcblxuICAgICAgICBjb25zdCBiYWNrdXBLZXlTdG9yZWQgPSAhIShhd2FpdCBjbGkuaXNLZXlCYWNrdXBLZXlTdG9yZWQoKSk7XG4gICAgICAgIGNvbnN0IGJhY2t1cEtleUZyb21DYWNoZSA9IGF3YWl0IGNsaS5fY3J5cHRvLmdldFNlc3Npb25CYWNrdXBQcml2YXRlS2V5KCk7XG4gICAgICAgIGNvbnN0IGJhY2t1cEtleUNhY2hlZCA9ICEhKGJhY2t1cEtleUZyb21DYWNoZSk7XG4gICAgICAgIGNvbnN0IGJhY2t1cEtleVdlbGxGb3JtZWQgPSBiYWNrdXBLZXlGcm9tQ2FjaGUgaW5zdGFuY2VvZiBVaW50OEFycmF5O1xuICAgICAgICBjb25zdCBzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50ID0gYXdhaXQgc2VjcmV0U3RvcmFnZS5oYXNLZXkoKTtcbiAgICAgICAgY29uc3Qgc2VjcmV0U3RvcmFnZVJlYWR5ID0gYXdhaXQgY2xpLmlzU2VjcmV0U3RvcmFnZVJlYWR5KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJhY2t1cEtleVN0b3JlZCxcbiAgICAgICAgICAgIGJhY2t1cEtleUNhY2hlZCxcbiAgICAgICAgICAgIGJhY2t1cEtleVdlbGxGb3JtZWQsXG4gICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50LFxuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZVJlYWR5LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfc3RhcnROZXdCYWNrdXAgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYygnS2V5IEJhY2t1cCcsICdLZXkgQmFja3VwJyxcbiAgICAgICAgICAgIGltcG9ydCgnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0NyZWF0ZUtleUJhY2t1cERpYWxvZycpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZEJhY2t1cFN0YXR1cygpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LCBudWxsLCAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9kZWxldGVCYWNrdXAgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0RlbGV0ZSBCYWNrdXAnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdCgnRGVsZXRlIEJhY2t1cCcpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgIFwiQXJlIHlvdSBzdXJlPyBZb3Ugd2lsbCBsb3NlIHlvdXIgZW5jcnlwdGVkIG1lc3NhZ2VzIGlmIHlvdXIgXCIgK1xuICAgICAgICAgICAgICAgIFwia2V5cyBhcmUgbm90IGJhY2tlZCB1cCBwcm9wZXJseS5cIixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBidXR0b246IF90KCdEZWxldGUgQmFja3VwJyksXG4gICAgICAgICAgICBkYW5nZXI6IHRydWUsXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAocHJvY2VlZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvYWRpbmc6IHRydWV9KTtcbiAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlS2V5QmFja3VwVmVyc2lvbih0aGlzLnN0YXRlLmJhY2t1cEluZm8udmVyc2lvbikudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRCYWNrdXBTdGF0dXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9yZXN0b3JlQmFja3VwID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgJ1Jlc3RvcmUgQmFja3VwJywgJycsIFJlc3RvcmVLZXlCYWNrdXBEaWFsb2csIG51bGwsIG51bGwsXG4gICAgICAgICAgICAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZXNldFNlY3JldFN0b3JhZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGFjY2Vzc1NlY3JldFN0b3JhZ2UoKCkgPT4geyB9LCAvKiBmb3JjZVJlc2V0ID0gKi8gdHJ1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciByZXNldHRpbmcgc2VjcmV0IHN0b3JhZ2VcIiwgZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IGUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sb2FkQmFja3VwU3RhdHVzKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBsb2FkaW5nLFxuICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICBiYWNrdXBLZXlTdG9yZWQsXG4gICAgICAgICAgICBiYWNrdXBLZXlDYWNoZWQsXG4gICAgICAgICAgICBiYWNrdXBLZXlXZWxsRm9ybWVkLFxuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleUluQWNjb3VudCxcbiAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VSZWFkeSxcbiAgICAgICAgICAgIGJhY2t1cEluZm8sXG4gICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXMsXG4gICAgICAgICAgICBzZXNzaW9uc1JlbWFpbmluZyxcbiAgICAgICAgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgbGV0IHN0YXR1c0Rlc2NyaXB0aW9uO1xuICAgICAgICBsZXQgZXh0cmFEZXRhaWxzVGFibGVSb3dzO1xuICAgICAgICBsZXQgZXh0cmFEZXRhaWxzO1xuICAgICAgICBjb25zdCBhY3Rpb25zID0gW107XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJVbmFibGUgdG8gbG9hZCBrZXkgYmFja3VwIHN0YXR1c1wiKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAobG9hZGluZykge1xuICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb24gPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIGlmIChiYWNrdXBJbmZvKSB7XG4gICAgICAgICAgICBsZXQgcmVzdG9yZUJ1dHRvbkNhcHRpb24gPSBfdChcIlJlc3RvcmUgZnJvbSBCYWNrdXBcIik7XG5cbiAgICAgICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb24gPSA8cD7inIUge190KFwiVGhpcyBzZXNzaW9uIGlzIGJhY2tpbmcgdXAgeW91ciBrZXlzLiBcIil9PC9wPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb24gPSA8PlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgc2Vzc2lvbiBpcyA8Yj5ub3QgYmFja2luZyB1cCB5b3VyIGtleXM8L2I+LCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImJ1dCB5b3UgZG8gaGF2ZSBhbiBleGlzdGluZyBiYWNrdXAgeW91IGNhbiByZXN0b3JlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhbmQgYWRkIHRvIGdvaW5nIGZvcndhcmQuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAge2I6IHN1YiA9PiA8Yj57c3VifTwvYj59LFxuICAgICAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJDb25uZWN0IHRoaXMgc2Vzc2lvbiB0byBrZXkgYmFja3VwIGJlZm9yZSBzaWduaW5nIG91dCB0byBhdm9pZCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxvc2luZyBhbnkga2V5cyB0aGF0IG1heSBvbmx5IGJlIG9uIHRoaXMgc2Vzc2lvbi5cIixcbiAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgICAgIHJlc3RvcmVCdXR0b25DYXB0aW9uID0gX3QoXCJDb25uZWN0IHRoaXMgc2Vzc2lvbiB0byBLZXkgQmFja3VwXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdXBsb2FkU3RhdHVzO1xuICAgICAgICAgICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gdXBsb2FkIHN0YXR1cyB0byBzaG93IHdoZW4gYmFja3VwIGRpc2FibGVkLlxuICAgICAgICAgICAgICAgIHVwbG9hZFN0YXR1cyA9IFwiXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNlc3Npb25zUmVtYWluaW5nID4gMCkge1xuICAgICAgICAgICAgICAgIHVwbG9hZFN0YXR1cyA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkJhY2tpbmcgdXAgJShzZXNzaW9uc1JlbWFpbmluZylzIGtleXMuLi5cIiwgeyBzZXNzaW9uc1JlbWFpbmluZyB9KX0gPGJyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1cGxvYWRTdGF0dXMgPSA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJBbGwga2V5cyBiYWNrZWQgdXBcIil9IDxiciAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGJhY2t1cFNpZ1N0YXR1c2VzID0gYmFja3VwU2lnU3RhdHVzLnNpZ3MubWFwKChzaWcsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VOYW1lID0gc2lnLmRldmljZSA/IChzaWcuZGV2aWNlLmdldERpc3BsYXlOYW1lKCkgfHwgc2lnLmRldmljZS5kZXZpY2VJZCkgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkaXR5ID0gc3ViID0+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c2lnLnZhbGlkID8gJ214X1NlY3VyZUJhY2t1cFBhbmVsX3NpZ1ZhbGlkJyA6ICdteF9TZWN1cmVCYWNrdXBQYW5lbF9zaWdJbnZhbGlkJ30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICAgICAgICAgIGNvbnN0IHZlcmlmeSA9IHN1YiA9PlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3NpZy5kZXZpY2UgJiYgc2lnLmRldmljZVRydXN0LmlzVmVyaWZpZWQoKSA/ICdteF9TZWN1cmVCYWNrdXBQYW5lbF9kZXZpY2VWZXJpZmllZCcgOiAnbXhfU2VjdXJlQmFja3VwUGFuZWxfZGV2aWNlTm90VmVyaWZpZWQnfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzdWJ9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlID0gc3ViID0+IDxzcGFuIGNsYXNzTmFtZT1cIm14X1NlY3VyZUJhY2t1cFBhbmVsX2RldmljZU5hbWVcIj57ZGV2aWNlTmFtZX08L3NwYW4+O1xuICAgICAgICAgICAgICAgIGNvbnN0IGZyb21UaGlzRGV2aWNlID0gKFxuICAgICAgICAgICAgICAgICAgICBzaWcuZGV2aWNlICYmXG4gICAgICAgICAgICAgICAgICAgIHNpZy5kZXZpY2UuZ2V0RmluZ2VycHJpbnQoKSA9PT0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERldmljZUVkMjU1MTlLZXkoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgZnJvbVRoaXNVc2VyID0gKFxuICAgICAgICAgICAgICAgICAgICBzaWcuY3Jvc3NTaWduaW5nSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgc2lnLmRldmljZUlkID09PSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Q3Jvc3NTaWduaW5nSWQoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgbGV0IHNpZ1N0YXR1cztcbiAgICAgICAgICAgICAgICBpZiAoc2lnLnZhbGlkICYmIGZyb21UaGlzVXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhIDx2YWxpZGl0eT52YWxpZDwvdmFsaWRpdHk+IHNpZ25hdHVyZSBmcm9tIHRoaXMgdXNlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzaWcudmFsaWQgJiYgZnJvbVRoaXNVc2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGEgPHZhbGlkaXR5PmludmFsaWQ8L3ZhbGlkaXR5PiBzaWduYXR1cmUgZnJvbSB0aGlzIHVzZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9LCB7IHZhbGlkaXR5IH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaWcuY3Jvc3NTaWduaW5nSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2lnU3RhdHVzID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkJhY2t1cCBoYXMgYSBzaWduYXR1cmUgZnJvbSA8dmVyaWZ5PnVua25vd248L3ZlcmlmeT4gdXNlciB3aXRoIElEICUoZGV2aWNlSWQpc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBkZXZpY2VJZDogc2lnLmRldmljZUlkIH0sIHsgdmVyaWZ5IH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lnLmRldmljZSkge1xuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhIHNpZ25hdHVyZSBmcm9tIDx2ZXJpZnk+dW5rbm93bjwvdmVyaWZ5PiBzZXNzaW9uIHdpdGggSUQgJShkZXZpY2VJZClzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGRldmljZUlkOiBzaWcuZGV2aWNlSWQgfSwgeyB2ZXJpZnkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpZy52YWxpZCAmJiBmcm9tVGhpc0RldmljZSkge1xuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhIDx2YWxpZGl0eT52YWxpZDwvdmFsaWRpdHk+IHNpZ25hdHVyZSBmcm9tIHRoaXMgc2Vzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzaWcudmFsaWQgJiYgZnJvbVRoaXNEZXZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaXQgY2FuIGhhcHBlbi4uLlxuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhbiA8dmFsaWRpdHk+aW52YWxpZDwvdmFsaWRpdHk+IHNpZ25hdHVyZSBmcm9tIHRoaXMgc2Vzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpZy52YWxpZCAmJiBzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGEgPHZhbGlkaXR5PnZhbGlkPC92YWxpZGl0eT4gc2lnbmF0dXJlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8dmVyaWZ5PnZlcmlmaWVkPC92ZXJpZnk+IHNlc3Npb24gPGRldmljZT48L2RldmljZT5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9LCB7IHZhbGlkaXR5LCB2ZXJpZnksIGRldmljZSB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2lnLnZhbGlkICYmICFzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGEgPHZhbGlkaXR5PnZhbGlkPC92YWxpZGl0eT4gc2lnbmF0dXJlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8dmVyaWZ5PnVudmVyaWZpZWQ8L3ZlcmlmeT4gc2Vzc2lvbiA8ZGV2aWNlPjwvZGV2aWNlPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHksIHZlcmlmeSwgZGV2aWNlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lnLnZhbGlkICYmIHNpZy5kZXZpY2VUcnVzdC5pc1ZlcmlmaWVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2lnU3RhdHVzID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkJhY2t1cCBoYXMgYW4gPHZhbGlkaXR5PmludmFsaWQ8L3ZhbGlkaXR5PiBzaWduYXR1cmUgZnJvbSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjx2ZXJpZnk+dmVyaWZpZWQ8L3ZlcmlmeT4gc2Vzc2lvbiA8ZGV2aWNlPjwvZGV2aWNlPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHksIHZlcmlmeSwgZGV2aWNlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lnLnZhbGlkICYmICFzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGFuIDx2YWxpZGl0eT5pbnZhbGlkPC92YWxpZGl0eT4gc2lnbmF0dXJlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8dmVyaWZ5PnVudmVyaWZpZWQ8L3ZlcmlmeT4gc2Vzc2lvbiA8ZGV2aWNlPjwvZGV2aWNlPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHksIHZlcmlmeSwgZGV2aWNlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXYga2V5PXtpfT5cbiAgICAgICAgICAgICAgICAgICAge3NpZ1N0YXR1c31cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChiYWNrdXBTaWdTdGF0dXMuc2lncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXNlcyA9IF90KFwiQmFja3VwIGlzIG5vdCBzaWduZWQgYnkgYW55IG9mIHlvdXIgc2Vzc2lvbnNcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB0cnVzdGVkTG9jYWxseTtcbiAgICAgICAgICAgIGlmIChiYWNrdXBTaWdTdGF0dXMudHJ1c3RlZF9sb2NhbGx5KSB7XG4gICAgICAgICAgICAgICAgdHJ1c3RlZExvY2FsbHkgPSBfdChcIlRoaXMgYmFja3VwIGlzIHRydXN0ZWQgYmVjYXVzZSBpdCBoYXMgYmVlbiByZXN0b3JlZCBvbiB0aGlzIHNlc3Npb25cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4dHJhRGV0YWlsc1RhYmxlUm93cyA9IDw+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+e190KFwiQmFja3VwIHZlcnNpb246XCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57YmFja3VwSW5mby52ZXJzaW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57X3QoXCJBbGdvcml0aG06XCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57YmFja3VwSW5mby5hbGdvcml0aG19PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC8+O1xuXG4gICAgICAgICAgICBleHRyYURldGFpbHMgPSA8PlxuICAgICAgICAgICAgICAgIHt1cGxvYWRTdGF0dXN9XG4gICAgICAgICAgICAgICAgPGRpdj57YmFja3VwU2lnU3RhdHVzZXN9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57dHJ1c3RlZExvY2FsbHl9PC9kaXY+XG4gICAgICAgICAgICA8Lz47XG5cbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBrZXk9XCJyZXN0b3JlXCIga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLl9yZXN0b3JlQmFja3VwfT5cbiAgICAgICAgICAgICAgICAgICAge3Jlc3RvcmVCdXR0b25DYXB0aW9ufVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoIWlzU2VjdXJlQmFja3VwUmVxdWlyZWQoKSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2V5PVwiZGVsZXRlXCIga2luZD1cImRhbmdlclwiIG9uQ2xpY2s9e3RoaXMuX2RlbGV0ZUJhY2t1cH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJEZWxldGUgQmFja3VwXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0dXNEZXNjcmlwdGlvbiA9IDw+XG4gICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIllvdXIga2V5cyBhcmUgPGI+bm90IGJlaW5nIGJhY2tlZCB1cCBmcm9tIHRoaXMgc2Vzc2lvbjwvYj4uXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7Yjogc3ViID0+IDxiPntzdWJ9PC9iPn0sXG4gICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiQmFjayB1cCB5b3VyIGtleXMgYmVmb3JlIHNpZ25pbmcgb3V0IHRvIGF2b2lkIGxvc2luZyB0aGVtLlwiKX08L3A+XG4gICAgICAgICAgICA8Lz47XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2V5PVwic2V0dXBcIiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX3N0YXJ0TmV3QmFja3VwfT5cbiAgICAgICAgICAgICAgICAgICAge190KFwiU2V0IHVwXCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlY3JldFN0b3JhZ2VLZXlJbkFjY291bnQpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBrZXk9XCJyZXNldFwiIGtpbmQ9XCJkYW5nZXJcIiBvbkNsaWNrPXt0aGlzLl9yZXNldFNlY3JldFN0b3JhZ2V9PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZXNldFwiKX1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBiYWNrdXBLZXlXZWxsRm9ybWVkVGV4dCA9IFwiXCI7XG4gICAgICAgIGlmIChiYWNrdXBLZXlDYWNoZWQpIHtcbiAgICAgICAgICAgIGJhY2t1cEtleVdlbGxGb3JtZWRUZXh0ID0gXCIsIFwiO1xuICAgICAgICAgICAgaWYgKGJhY2t1cEtleVdlbGxGb3JtZWQpIHtcbiAgICAgICAgICAgICAgICBiYWNrdXBLZXlXZWxsRm9ybWVkVGV4dCArPSBfdChcIndlbGwgZm9ybWVkXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYWNrdXBLZXlXZWxsRm9ybWVkVGV4dCArPSBfdChcInVuZXhwZWN0ZWQgdHlwZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhY3Rpb25Sb3c7XG4gICAgICAgIGlmIChhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgYWN0aW9uUm93ID0gPGRpdiBjbGFzc05hbWU9XCJteF9TZWN1cmVCYWNrdXBQYW5lbF9idXR0b25Sb3dcIj5cbiAgICAgICAgICAgICAgICB7YWN0aW9uc31cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJCYWNrIHVwIHlvdXIgZW5jcnlwdGlvbiBrZXlzIHdpdGggeW91ciBhY2NvdW50IGRhdGEgaW4gY2FzZSB5b3UgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImxvc2UgYWNjZXNzIHRvIHlvdXIgc2Vzc2lvbnMuIFlvdXIga2V5cyB3aWxsIGJlIHNlY3VyZWQgd2l0aCBhIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ1bmlxdWUgU2VjdXJpdHkgS2V5LlwiLFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgIHtzdGF0dXNEZXNjcmlwdGlvbn1cbiAgICAgICAgICAgICAgICA8ZGV0YWlscz5cbiAgICAgICAgICAgICAgICAgICAgPHN1bW1hcnk+e190KFwiQWR2YW5jZWRcIil9PC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwibXhfU2VjdXJlQmFja3VwUGFuZWxfc3RhdHVzTGlzdFwiPjx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e190KFwiQmFja3VwIGtleSBzdG9yZWQ6XCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja3VwS2V5U3RvcmVkID09PSB0cnVlID8gX3QoXCJpbiBzZWNyZXQgc3RvcmFnZVwiKSA6IF90KFwibm90IHN0b3JlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e190KFwiQmFja3VwIGtleSBjYWNoZWQ6XCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmFja3VwS2V5Q2FjaGVkID8gX3QoXCJjYWNoZWQgbG9jYWxseVwiKSA6IF90KFwibm90IGZvdW5kIGxvY2FsbHlcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtiYWNrdXBLZXlXZWxsRm9ybWVkVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e190KFwiU2VjcmV0IHN0b3JhZ2UgcHVibGljIGtleTpcIil9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3NlY3JldFN0b3JhZ2VLZXlJbkFjY291bnQgPyBfdChcImluIGFjY291bnQgZGF0YVwiKSA6IF90KFwibm90IGZvdW5kXCIpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD57X3QoXCJTZWNyZXQgc3RvcmFnZTpcIil9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e3NlY3JldFN0b3JhZ2VSZWFkeSA/IF90KFwicmVhZHlcIikgOiBfdChcIm5vdCByZWFkeVwiKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtleHRyYURldGFpbHNUYWJsZVJvd3N9XG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+PC90YWJsZT5cbiAgICAgICAgICAgICAgICAgICAge2V4dHJhRGV0YWlsc31cbiAgICAgICAgICAgICAgICA8L2RldGFpbHM+XG4gICAgICAgICAgICAgICAge2FjdGlvblJvd31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
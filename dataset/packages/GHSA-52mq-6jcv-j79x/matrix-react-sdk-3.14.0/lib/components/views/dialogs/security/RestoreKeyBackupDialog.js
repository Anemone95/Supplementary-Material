"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../../index"));

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _matrixJsSdk = require("matrix-js-sdk");

var _languageHandler = require("../../../../languageHandler");

var _SecurityManager = require("../../../../SecurityManager");

/*
Copyright 2018, 2019 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const RESTORE_TYPE_PASSPHRASE = 0;
const RESTORE_TYPE_RECOVERYKEY = 1;
const RESTORE_TYPE_SECRET_STORAGE = 2;
/*
 * Dialog for restoring e2e keys from a backup and the user's recovery key
 */

class RestoreKeyBackupDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onDone", () => {
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "_onUseRecoveryKeyClick", () => {
      this.setState({
        forceRecoveryKey: true
      });
    });
    (0, _defineProperty2.default)(this, "_progressCallback", data => {
      this.setState({
        progress: data
      });
    });
    (0, _defineProperty2.default)(this, "_onResetRecoveryClick", () => {
      this.props.onFinished(false);
      (0, _SecurityManager.accessSecretStorage)(() => {},
      /* forceReset = */
      true);
    });
    (0, _defineProperty2.default)(this, "_onRecoveryKeyChange", e => {
      this.setState({
        recoveryKey: e.target.value,
        recoveryKeyValid: _MatrixClientPeg.MatrixClientPeg.get().isValidRecoveryKey(e.target.value)
      });
    });
    (0, _defineProperty2.default)(this, "_onPassPhraseNext", async () => {
      this.setState({
        loading: true,
        restoreError: null,
        restoreType: RESTORE_TYPE_PASSPHRASE
      });

      try {
        // We do still restore the key backup: we must ensure that the key backup key
        // is the right one and restoring it is currently the only way we can do this.
        const recoverInfo = await _MatrixClientPeg.MatrixClientPeg.get().restoreKeyBackupWithPassword(this.state.passPhrase, undefined, undefined, this.state.backupInfo, {
          progressCallback: this._progressCallback
        });

        if (this.props.keyCallback) {
          const key = await _MatrixClientPeg.MatrixClientPeg.get().keyBackupKeyFromPassword(this.state.passPhrase, this.state.backupInfo);
          this.props.keyCallback(key);
        }

        if (!this.props.showSummary) {
          this.props.onFinished(true);
          return;
        }

        this.setState({
          loading: false,
          recoverInfo
        });
      } catch (e) {
        console.log("Error restoring backup", e);
        this.setState({
          loading: false,
          restoreError: e
        });
      }
    });
    (0, _defineProperty2.default)(this, "_onRecoveryKeyNext", async () => {
      if (!this.state.recoveryKeyValid) return;
      this.setState({
        loading: true,
        restoreError: null,
        restoreType: RESTORE_TYPE_RECOVERYKEY
      });

      try {
        const recoverInfo = await _MatrixClientPeg.MatrixClientPeg.get().restoreKeyBackupWithRecoveryKey(this.state.recoveryKey, undefined, undefined, this.state.backupInfo, {
          progressCallback: this._progressCallback
        });

        if (this.props.keyCallback) {
          const key = _MatrixClientPeg.MatrixClientPeg.get().keyBackupKeyFromRecoveryKey(this.state.recoveryKey);

          this.props.keyCallback(key);
        }

        if (!this.props.showSummary) {
          this.props.onFinished(true);
          return;
        }

        this.setState({
          loading: false,
          recoverInfo
        });
      } catch (e) {
        console.log("Error restoring backup", e);
        this.setState({
          loading: false,
          restoreError: e
        });
      }
    });
    (0, _defineProperty2.default)(this, "_onPassPhraseChange", e => {
      this.setState({
        passPhrase: e.target.value
      });
    });
    this.state = {
      backupInfo: null,
      backupKeyStored: null,
      loading: false,
      loadError: null,
      restoreError: null,
      recoveryKey: "",
      recoverInfo: null,
      recoveryKeyValid: false,
      forceRecoveryKey: false,
      passPhrase: '',
      restoreType: null,
      progress: {
        stage: "prefetch"
      }
    };
  }

  componentDidMount() {
    this._loadBackupStatus();
  }

  async _restoreWithSecretStorage() {
    this.setState({
      loading: true,
      restoreError: null,
      restoreType: RESTORE_TYPE_SECRET_STORAGE
    });

    try {
      // `accessSecretStorage` may prompt for storage access as needed.
      const recoverInfo = await (0, _SecurityManager.accessSecretStorage)(async () => {
        return _MatrixClientPeg.MatrixClientPeg.get().restoreKeyBackupWithSecretStorage(this.state.backupInfo, undefined, undefined, {
          progressCallback: this._progressCallback
        });
      });
      this.setState({
        loading: false,
        recoverInfo
      });
    } catch (e) {
      console.log("Error restoring backup", e);
      this.setState({
        restoreError: e,
        loading: false
      });
    }
  }

  async _restoreWithCachedKey(backupInfo) {
    if (!backupInfo) return false;

    try {
      const recoverInfo = await _MatrixClientPeg.MatrixClientPeg.get().restoreKeyBackupWithCache(undefined,
      /* targetRoomId */
      undefined,
      /* targetSessionId */
      backupInfo, {
        progressCallback: this._progressCallback
      });
      this.setState({
        recoverInfo
      });
      return true;
    } catch (e) {
      console.log("restoreWithCachedKey failed:", e);
      return false;
    }
  }

  async _loadBackupStatus() {
    this.setState({
      loading: true,
      loadError: null
    });

    try {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const backupInfo = await cli.getKeyBackupVersion();
      const has4S = await cli.hasSecretStorageKey();
      const backupKeyStored = has4S && (await cli.isKeyBackupKeyStored());
      this.setState({
        backupInfo,
        backupKeyStored
      });
      const gotCache = await this._restoreWithCachedKey(backupInfo);

      if (gotCache) {
        console.log("RestoreKeyBackupDialog: found cached backup key");
        this.setState({
          loading: false
        });
        return;
      } // If the backup key is stored, we can proceed directly to restore.


      if (backupKeyStored) {
        return this._restoreWithSecretStorage();
      }

      this.setState({
        loadError: null,
        loading: false
      });
    } catch (e) {
      console.log("Error loading backup status", e);
      this.setState({
        loadError: e,
        loading: false
      });
    }
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const Spinner = sdk.getComponent("elements.Spinner");
    const backupHasPassphrase = this.state.backupInfo && this.state.backupInfo.auth_data && this.state.backupInfo.auth_data.private_key_salt && this.state.backupInfo.auth_data.private_key_iterations;
    let content;
    let title;

    if (this.state.loading) {
      title = (0, _languageHandler._t)("Restoring keys from backup");
      let details;

      if (this.state.progress.stage === "fetch") {
        details = (0, _languageHandler._t)("Fetching keys from server...");
      } else if (this.state.progress.stage === "load_keys") {
        const {
          total,
          successes,
          failures
        } = this.state.progress;
        details = (0, _languageHandler._t)("%(completed)s of %(total)s keys restored", {
          total,
          completed: successes + failures
        });
      } else if (this.state.progress.stage === "prefetch") {
        details = (0, _languageHandler._t)("Fetching keys from server...");
      }

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, details), /*#__PURE__*/_react.default.createElement(Spinner, null));
    } else if (this.state.loadError) {
      title = (0, _languageHandler._t)("Error");
      content = (0, _languageHandler._t)("Unable to load backup status");
    } else if (this.state.restoreError) {
      if (this.state.restoreError.errcode === _matrixJsSdk.MatrixClient.RESTORE_BACKUP_ERROR_BAD_KEY) {
        if (this.state.restoreType === RESTORE_TYPE_RECOVERYKEY) {
          title = (0, _languageHandler._t)("Security Key mismatch");
          content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Backup could not be decrypted with this Security Key: " + "please verify that you entered the correct Security Key.")));
        } else {
          title = (0, _languageHandler._t)("Incorrect Security Phrase");
          content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Backup could not be decrypted with this Security Phrase: " + "please verify that you entered the correct Security Phrase.")));
        }
      } else {
        title = (0, _languageHandler._t)("Error");
        content = (0, _languageHandler._t)("Unable to restore backup");
      }
    } else if (this.state.backupInfo === null) {
      title = (0, _languageHandler._t)("Error");
      content = (0, _languageHandler._t)("No backup found!");
    } else if (this.state.recoverInfo) {
      const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
      title = (0, _languageHandler._t)("Keys restored");
      let failedToDecrypt;

      if (this.state.recoverInfo.total > this.state.recoverInfo.imported) {
        failedToDecrypt = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Failed to decrypt %(failedCount)s sessions!", {
          failedCount: this.state.recoverInfo.total - this.state.recoverInfo.imported
        }));
      }

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Successfully restored %(sessionCount)s keys", {
        sessionCount: this.state.recoverInfo.imported
      })), failedToDecrypt, /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('OK'),
        onPrimaryButtonClick: this._onDone,
        hasCancel: false,
        focus: true
      }));
    } else if (backupHasPassphrase && !this.state.forceRecoveryKey) {
      const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
      const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
      title = (0, _languageHandler._t)("Enter Security Phrase");
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("<b>Warning</b>: you should only set up key backup " + "from a trusted computer.", {}, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Access your secure message history and set up secure " + "messaging by entering your Security Phrase.")), /*#__PURE__*/_react.default.createElement("form", {
        className: "mx_RestoreKeyBackupDialog_primaryContainer"
      }, /*#__PURE__*/_react.default.createElement("input", {
        type: "password",
        className: "mx_RestoreKeyBackupDialog_passPhraseInput",
        onChange: this._onPassPhraseChange,
        value: this.state.passPhrase,
        autoFocus: true
      }), /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Next'),
        onPrimaryButtonClick: this._onPassPhraseNext,
        primaryIsSubmit: true,
        hasCancel: true,
        onCancel: this._onCancel,
        focus: false
      })), (0, _languageHandler._t)("If you've forgotten your Security Phrase you can " + "<button1>use your Security Key</button1> or " + "<button2>set up new recovery options</button2>", {}, {
        button1: s => /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          className: "mx_linkButton",
          element: "span",
          onClick: this._onUseRecoveryKeyClick
        }, s),
        button2: s => /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          className: "mx_linkButton",
          element: "span",
          onClick: this._onResetRecoveryClick
        }, s)
      }));
    } else {
      title = (0, _languageHandler._t)("Enter Security Key");
      const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
      const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
      let keyStatus;

      if (this.state.recoveryKey.length === 0) {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RestoreKeyBackupDialog_keyStatus"
        });
      } else if (this.state.recoveryKeyValid) {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RestoreKeyBackupDialog_keyStatus"
        }, "\uD83D\uDC4D ", (0, _languageHandler._t)("This looks like a valid Security Key!"));
      } else {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RestoreKeyBackupDialog_keyStatus"
        }, "\uD83D\uDC4E ", (0, _languageHandler._t)("Not a valid Security Key"));
      }

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("<b>Warning</b>: You should only set up key backup " + "from a trusted computer.", {}, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Access your secure message history and set up secure " + "messaging by entering your Security Key.")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RestoreKeyBackupDialog_primaryContainer"
      }, /*#__PURE__*/_react.default.createElement("input", {
        className: "mx_RestoreKeyBackupDialog_recoveryKeyInput",
        onChange: this._onRecoveryKeyChange,
        value: this.state.recoveryKey,
        autoFocus: true
      }), keyStatus, /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Next'),
        onPrimaryButtonClick: this._onRecoveryKeyNext,
        hasCancel: true,
        onCancel: this._onCancel,
        focus: false,
        primaryDisabled: !this.state.recoveryKeyValid
      })), (0, _languageHandler._t)("If you've forgotten your Security Key you can " + "<button>set up new recovery options</button>", {}, {
        button: s => /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          className: "mx_linkButton",
          element: "span",
          onClick: this._onResetRecoveryClick
        }, s)
      }));
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_RestoreKeyBackupDialog",
      onFinished: this.props.onFinished,
      title: title
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RestoreKeyBackupDialog_content"
    }, content));
  }

}

exports.default = RestoreKeyBackupDialog;
(0, _defineProperty2.default)(RestoreKeyBackupDialog, "propTypes", {
  // if false, will close the dialog as soon as the restore completes succesfully
  // default: true
  showSummary: _propTypes.default.bool,
  // If specified, gather the key from the user but then call the function with the backup
  // key rather than actually (necessarily) restoring the backup.
  keyCallback: _propTypes.default.func
});
(0, _defineProperty2.default)(RestoreKeyBackupDialog, "defaultProps", {
  showSummary: true
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvUmVzdG9yZUtleUJhY2t1cERpYWxvZy5qcyJdLCJuYW1lcyI6WyJSRVNUT1JFX1RZUEVfUEFTU1BIUkFTRSIsIlJFU1RPUkVfVFlQRV9SRUNPVkVSWUtFWSIsIlJFU1RPUkVfVFlQRV9TRUNSRVRfU1RPUkFHRSIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwib25GaW5pc2hlZCIsInNldFN0YXRlIiwiZm9yY2VSZWNvdmVyeUtleSIsImRhdGEiLCJwcm9ncmVzcyIsImUiLCJyZWNvdmVyeUtleSIsInRhcmdldCIsInZhbHVlIiwicmVjb3ZlcnlLZXlWYWxpZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImlzVmFsaWRSZWNvdmVyeUtleSIsImxvYWRpbmciLCJyZXN0b3JlRXJyb3IiLCJyZXN0b3JlVHlwZSIsInJlY292ZXJJbmZvIiwicmVzdG9yZUtleUJhY2t1cFdpdGhQYXNzd29yZCIsInN0YXRlIiwicGFzc1BocmFzZSIsInVuZGVmaW5lZCIsImJhY2t1cEluZm8iLCJwcm9ncmVzc0NhbGxiYWNrIiwiX3Byb2dyZXNzQ2FsbGJhY2siLCJrZXlDYWxsYmFjayIsImtleSIsImtleUJhY2t1cEtleUZyb21QYXNzd29yZCIsInNob3dTdW1tYXJ5IiwiY29uc29sZSIsImxvZyIsInJlc3RvcmVLZXlCYWNrdXBXaXRoUmVjb3ZlcnlLZXkiLCJrZXlCYWNrdXBLZXlGcm9tUmVjb3ZlcnlLZXkiLCJiYWNrdXBLZXlTdG9yZWQiLCJsb2FkRXJyb3IiLCJzdGFnZSIsImNvbXBvbmVudERpZE1vdW50IiwiX2xvYWRCYWNrdXBTdGF0dXMiLCJfcmVzdG9yZVdpdGhTZWNyZXRTdG9yYWdlIiwicmVzdG9yZUtleUJhY2t1cFdpdGhTZWNyZXRTdG9yYWdlIiwiX3Jlc3RvcmVXaXRoQ2FjaGVkS2V5IiwicmVzdG9yZUtleUJhY2t1cFdpdGhDYWNoZSIsImNsaSIsImdldEtleUJhY2t1cFZlcnNpb24iLCJoYXM0UyIsImhhc1NlY3JldFN0b3JhZ2VLZXkiLCJpc0tleUJhY2t1cEtleVN0b3JlZCIsImdvdENhY2hlIiwicmVuZGVyIiwiQmFzZURpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIlNwaW5uZXIiLCJiYWNrdXBIYXNQYXNzcGhyYXNlIiwiYXV0aF9kYXRhIiwicHJpdmF0ZV9rZXlfc2FsdCIsInByaXZhdGVfa2V5X2l0ZXJhdGlvbnMiLCJjb250ZW50IiwidGl0bGUiLCJkZXRhaWxzIiwidG90YWwiLCJzdWNjZXNzZXMiLCJmYWlsdXJlcyIsImNvbXBsZXRlZCIsImVycmNvZGUiLCJNYXRyaXhDbGllbnQiLCJSRVNUT1JFX0JBQ0tVUF9FUlJPUl9CQURfS0VZIiwiRGlhbG9nQnV0dG9ucyIsImZhaWxlZFRvRGVjcnlwdCIsImltcG9ydGVkIiwiZmFpbGVkQ291bnQiLCJzZXNzaW9uQ291bnQiLCJfb25Eb25lIiwiQWNjZXNzaWJsZUJ1dHRvbiIsImIiLCJzdWIiLCJfb25QYXNzUGhyYXNlQ2hhbmdlIiwiX29uUGFzc1BocmFzZU5leHQiLCJfb25DYW5jZWwiLCJidXR0b24xIiwicyIsIl9vblVzZVJlY292ZXJ5S2V5Q2xpY2siLCJidXR0b24yIiwiX29uUmVzZXRSZWNvdmVyeUNsaWNrIiwia2V5U3RhdHVzIiwibGVuZ3RoIiwiX29uUmVjb3ZlcnlLZXlDaGFuZ2UiLCJfb25SZWNvdmVyeUtleU5leHQiLCJidXR0b24iLCJQcm9wVHlwZXMiLCJib29sIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVQSxNQUFNQSx1QkFBdUIsR0FBRyxDQUFo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QUFBLGVBQWUsRUFBRSxDQUFDLEtBQUszRCxLQUFMLENBQVdUO0FBTGpDLFFBUEosQ0FYTSxFQTBCTCx5QkFDRyxtREFDQSw4Q0FGSCxFQUdDLEVBSEQsRUFHSztBQUNGOEUsUUFBQUEsTUFBTSxFQUFFUixDQUFDLGlCQUFJLDZCQUFDLGdCQUFEO0FBQWtCLFVBQUEsU0FBUyxFQUFDLGVBQTVCO0FBQ1QsVUFBQSxPQUFPLEVBQUMsTUFEQztBQUVULFVBQUEsT0FBTyxFQUFFLEtBQUtHO0FBRkwsV0FJUkgsQ0FKUTtBQURYLE9BSEwsQ0ExQkssQ0FBVjtBQXNDSDs7QUFFRCx3QkFDSSw2QkFBQyxVQUFEO0FBQVksTUFBQSxTQUFTLEVBQUMsMkJBQXRCO0FBQ0ksTUFBQSxVQUFVLEVBQUUsS0FBS2hGLEtBQUwsQ0FBV0MsVUFEM0I7QUFFSSxNQUFBLEtBQUssRUFBRXlEO0FBRlgsb0JBSUE7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0tELE9BREwsQ0FKQSxDQURKO0FBVUg7O0FBM2FtRTs7OzhCQUFuRDdELHNCLGVBQ0U7QUFDZjtBQUNBO0FBQ0FnQyxFQUFBQSxXQUFXLEVBQUU2RCxtQkFBVUMsSUFIUjtBQUlmO0FBQ0E7QUFDQWpFLEVBQUFBLFdBQVcsRUFBRWdFLG1CQUFVRTtBQU5SLEM7OEJBREYvRixzQixrQkFVSztBQUNsQmdDLEVBQUFBLFdBQVcsRUFBRTtBQURLLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IGFjY2Vzc1NlY3JldFN0b3JhZ2UgfSBmcm9tICcuLi8uLi8uLi8uLi9TZWN1cml0eU1hbmFnZXInO1xuXG5jb25zdCBSRVNUT1JFX1RZUEVfUEFTU1BIUkFTRSA9IDA7XG5jb25zdCBSRVNUT1JFX1RZUEVfUkVDT1ZFUllLRVkgPSAxO1xuY29uc3QgUkVTVE9SRV9UWVBFX1NFQ1JFVF9TVE9SQUdFID0gMjtcblxuLypcbiAqIERpYWxvZyBmb3IgcmVzdG9yaW5nIGUyZSBrZXlzIGZyb20gYSBiYWNrdXAgYW5kIHRoZSB1c2VyJ3MgcmVjb3Zlcnkga2V5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyBpZiBmYWxzZSwgd2lsbCBjbG9zZSB0aGUgZGlhbG9nIGFzIHNvb24gYXMgdGhlIHJlc3RvcmUgY29tcGxldGVzIHN1Y2Nlc2Z1bGx5XG4gICAgICAgIC8vIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgc2hvd1N1bW1hcnk6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICAvLyBJZiBzcGVjaWZpZWQsIGdhdGhlciB0aGUga2V5IGZyb20gdGhlIHVzZXIgYnV0IHRoZW4gY2FsbCB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgYmFja3VwXG4gICAgICAgIC8vIGtleSByYXRoZXIgdGhhbiBhY3R1YWxseSAobmVjZXNzYXJpbHkpIHJlc3RvcmluZyB0aGUgYmFja3VwLlxuICAgICAgICBrZXlDYWxsYmFjazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIHNob3dTdW1tYXJ5OiB0cnVlLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBiYWNrdXBJbmZvOiBudWxsLFxuICAgICAgICAgICAgYmFja3VwS2V5U3RvcmVkOiBudWxsLFxuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBsb2FkRXJyb3I6IG51bGwsXG4gICAgICAgICAgICByZXN0b3JlRXJyb3I6IG51bGwsXG4gICAgICAgICAgICByZWNvdmVyeUtleTogXCJcIixcbiAgICAgICAgICAgIHJlY292ZXJJbmZvOiBudWxsLFxuICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICBmb3JjZVJlY292ZXJ5S2V5OiBmYWxzZSxcbiAgICAgICAgICAgIHBhc3NQaHJhc2U6ICcnLFxuICAgICAgICAgICAgcmVzdG9yZVR5cGU6IG51bGwsXG4gICAgICAgICAgICBwcm9ncmVzczogeyBzdGFnZTogXCJwcmVmZXRjaFwiIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX2xvYWRCYWNrdXBTdGF0dXMoKTtcbiAgICB9XG5cbiAgICBfb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgX29uRG9uZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH1cblxuICAgIF9vblVzZVJlY292ZXJ5S2V5Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZm9yY2VSZWNvdmVyeUtleTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3Byb2dyZXNzQ2FsbGJhY2sgPSAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByb2dyZXNzOiBkYXRhLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfb25SZXNldFJlY292ZXJ5Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgICAgIGFjY2Vzc1NlY3JldFN0b3JhZ2UoKCkgPT4ge30sIC8qIGZvcmNlUmVzZXQgPSAqLyB0cnVlKTtcbiAgICB9XG5cbiAgICBfb25SZWNvdmVyeUtleUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmVjb3ZlcnlLZXk6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzVmFsaWRSZWNvdmVyeUtleShlLnRhcmdldC52YWx1ZSksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vblBhc3NQaHJhc2VOZXh0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICByZXN0b3JlRXJyb3I6IG51bGwsXG4gICAgICAgICAgICByZXN0b3JlVHlwZTogUkVTVE9SRV9UWVBFX1BBU1NQSFJBU0UsXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2UgZG8gc3RpbGwgcmVzdG9yZSB0aGUga2V5IGJhY2t1cDogd2UgbXVzdCBlbnN1cmUgdGhhdCB0aGUga2V5IGJhY2t1cCBrZXlcbiAgICAgICAgICAgIC8vIGlzIHRoZSByaWdodCBvbmUgYW5kIHJlc3RvcmluZyBpdCBpcyBjdXJyZW50bHkgdGhlIG9ubHkgd2F5IHdlIGNhbiBkbyB0aGlzLlxuICAgICAgICAgICAgY29uc3QgcmVjb3ZlckluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVzdG9yZUtleUJhY2t1cFdpdGhQYXNzd29yZChcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnBhc3NQaHJhc2UsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0aGlzLnN0YXRlLmJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgeyBwcm9ncmVzc0NhbGxiYWNrOiB0aGlzLl9wcm9ncmVzc0NhbGxiYWNrIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMua2V5Q2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkua2V5QmFja3VwS2V5RnJvbVBhc3N3b3JkKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnBhc3NQaHJhc2UsIHRoaXMuc3RhdGUuYmFja3VwSW5mbyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMua2V5Q2FsbGJhY2soa2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLnNob3dTdW1tYXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlY292ZXJJbmZvLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgcmVzdG9yaW5nIGJhY2t1cFwiLCBlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlc3RvcmVFcnJvcjogZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uUmVjb3ZlcnlLZXlOZXh0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIHJlc3RvcmVFcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHJlc3RvcmVUeXBlOiBSRVNUT1JFX1RZUEVfUkVDT1ZFUllLRVksXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVjb3ZlckluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVzdG9yZUtleUJhY2t1cFdpdGhSZWNvdmVyeUtleShcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnJlY292ZXJ5S2V5LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgIHsgcHJvZ3Jlc3NDYWxsYmFjazogdGhpcy5fcHJvZ3Jlc3NDYWxsYmFjayB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmtleUNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmtleUJhY2t1cEtleUZyb21SZWNvdmVyeUtleSh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmtleUNhbGxiYWNrKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMuc2hvd1N1bW1hcnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVjb3ZlckluZm8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciByZXN0b3JpbmcgYmFja3VwXCIsIGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzdG9yZUVycm9yOiBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25QYXNzUGhyYXNlQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3Jlc3RvcmVXaXRoU2VjcmV0U3RvcmFnZSgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgcmVzdG9yZUVycm9yOiBudWxsLFxuICAgICAgICAgICAgcmVzdG9yZVR5cGU6IFJFU1RPUkVfVFlQRV9TRUNSRVRfU1RPUkFHRSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBgYWNjZXNzU2VjcmV0U3RvcmFnZWAgbWF5IHByb21wdCBmb3Igc3RvcmFnZSBhY2Nlc3MgYXMgbmVlZGVkLlxuICAgICAgICAgICAgY29uc3QgcmVjb3ZlckluZm8gPSBhd2FpdCBhY2Nlc3NTZWNyZXRTdG9yYWdlKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlc3RvcmVLZXlCYWNrdXBXaXRoU2VjcmV0U3RvcmFnZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLCB1bmRlZmluZWQsIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgeyBwcm9ncmVzc0NhbGxiYWNrOiB0aGlzLl9wcm9ncmVzc0NhbGxiYWNrIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVjb3ZlckluZm8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciByZXN0b3JpbmcgYmFja3VwXCIsIGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVzdG9yZUVycm9yOiBlLFxuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfcmVzdG9yZVdpdGhDYWNoZWRLZXkoYmFja3VwSW5mbykge1xuICAgICAgICBpZiAoIWJhY2t1cEluZm8pIHJldHVybiBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlY292ZXJJbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlc3RvcmVLZXlCYWNrdXBXaXRoQ2FjaGUoXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCAvKiB0YXJnZXRSb29tSWQgKi9cbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsIC8qIHRhcmdldFNlc3Npb25JZCAqL1xuICAgICAgICAgICAgICAgIGJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgeyBwcm9ncmVzc0NhbGxiYWNrOiB0aGlzLl9wcm9ncmVzc0NhbGxiYWNrIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVjb3ZlckluZm8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlc3RvcmVXaXRoQ2FjaGVkS2V5IGZhaWxlZDpcIiwgZSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfbG9hZEJhY2t1cFN0YXR1cygpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgbG9hZEVycm9yOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cEluZm8gPSBhd2FpdCBjbGkuZ2V0S2V5QmFja3VwVmVyc2lvbigpO1xuICAgICAgICAgICAgY29uc3QgaGFzNFMgPSBhd2FpdCBjbGkuaGFzU2VjcmV0U3RvcmFnZUtleSgpO1xuICAgICAgICAgICAgY29uc3QgYmFja3VwS2V5U3RvcmVkID0gaGFzNFMgJiYgYXdhaXQgY2xpLmlzS2V5QmFja3VwS2V5U3RvcmVkKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBiYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgIGJhY2t1cEtleVN0b3JlZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBnb3RDYWNoZSA9IGF3YWl0IHRoaXMuX3Jlc3RvcmVXaXRoQ2FjaGVkS2V5KGJhY2t1cEluZm8pO1xuICAgICAgICAgICAgaWYgKGdvdENhY2hlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZXN0b3JlS2V5QmFja3VwRGlhbG9nOiBmb3VuZCBjYWNoZWQgYmFja3VwIGtleVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiB0aGUgYmFja3VwIGtleSBpcyBzdG9yZWQsIHdlIGNhbiBwcm9jZWVkIGRpcmVjdGx5IHRvIHJlc3RvcmUuXG4gICAgICAgICAgICBpZiAoYmFja3VwS2V5U3RvcmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc3RvcmVXaXRoU2VjcmV0U3RvcmFnZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkRXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBsb2FkaW5nIGJhY2t1cCBzdGF0dXNcIiwgZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkRXJyb3I6IGUsXG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG5cbiAgICAgICAgY29uc3QgYmFja3VwSGFzUGFzc3BocmFzZSA9IChcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmFja3VwSW5mbyAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLmF1dGhfZGF0YSAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLmF1dGhfZGF0YS5wcml2YXRlX2tleV9zYWx0ICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJhY2t1cEluZm8uYXV0aF9kYXRhLnByaXZhdGVfa2V5X2l0ZXJhdGlvbnNcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiUmVzdG9yaW5nIGtleXMgZnJvbSBiYWNrdXBcIik7XG4gICAgICAgICAgICBsZXQgZGV0YWlscztcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnByb2dyZXNzLnN0YWdlID09PSBcImZldGNoXCIpIHtcbiAgICAgICAgICAgICAgICBkZXRhaWxzID0gX3QoXCJGZXRjaGluZyBrZXlzIGZyb20gc2VydmVyLi4uXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnByb2dyZXNzLnN0YWdlID09PSBcImxvYWRfa2V5c1wiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyB0b3RhbCwgc3VjY2Vzc2VzLCBmYWlsdXJlcyB9ID0gdGhpcy5zdGF0ZS5wcm9ncmVzcztcbiAgICAgICAgICAgICAgICBkZXRhaWxzID0gX3QoXCIlKGNvbXBsZXRlZClzIG9mICUodG90YWwpcyBrZXlzIHJlc3RvcmVkXCIsIHsgdG90YWwsIGNvbXBsZXRlZDogc3VjY2Vzc2VzICsgZmFpbHVyZXMgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucHJvZ3Jlc3Muc3RhZ2UgPT09IFwicHJlZmV0Y2hcIikge1xuICAgICAgICAgICAgICAgIGRldGFpbHMgPSBfdChcIkZldGNoaW5nIGtleXMgZnJvbSBzZXJ2ZXIuLi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PntkZXRhaWxzfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5sb2FkRXJyb3IpIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJFcnJvclwiKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBfdChcIlVuYWJsZSB0byBsb2FkIGJhY2t1cCBzdGF0dXNcIik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5yZXN0b3JlRXJyb3IpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnJlc3RvcmVFcnJvci5lcnJjb2RlID09PSBNYXRyaXhDbGllbnQuUkVTVE9SRV9CQUNLVVBfRVJST1JfQkFEX0tFWSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnJlc3RvcmVUeXBlID09PSBSRVNUT1JFX1RZUEVfUkVDT1ZFUllLRVkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIlNlY3VyaXR5IEtleSBtaXNtYXRjaFwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgY291bGQgbm90IGJlIGRlY3J5cHRlZCB3aXRoIHRoaXMgU2VjdXJpdHkgS2V5OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwbGVhc2UgdmVyaWZ5IHRoYXQgeW91IGVudGVyZWQgdGhlIGNvcnJlY3QgU2VjdXJpdHkgS2V5LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiSW5jb3JyZWN0IFNlY3VyaXR5IFBocmFzZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgY291bGQgbm90IGJlIGRlY3J5cHRlZCB3aXRoIHRoaXMgU2VjdXJpdHkgUGhyYXNlOiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwbGVhc2UgdmVyaWZ5IHRoYXQgeW91IGVudGVyZWQgdGhlIGNvcnJlY3QgU2VjdXJpdHkgUGhyYXNlLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJFcnJvclwiKTtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gX3QoXCJVbmFibGUgdG8gcmVzdG9yZSBiYWNrdXBcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5iYWNrdXBJbmZvID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiRXJyb3JcIik7XG4gICAgICAgICAgICBjb250ZW50ID0gX3QoXCJObyBiYWNrdXAgZm91bmQhXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucmVjb3ZlckluZm8pIHtcbiAgICAgICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiS2V5cyByZXN0b3JlZFwiKTtcbiAgICAgICAgICAgIGxldCBmYWlsZWRUb0RlY3J5cHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWNvdmVySW5mby50b3RhbCA+IHRoaXMuc3RhdGUucmVjb3ZlckluZm8uaW1wb3J0ZWQpIHtcbiAgICAgICAgICAgICAgICBmYWlsZWRUb0RlY3J5cHQgPSA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIGRlY3J5cHQgJShmYWlsZWRDb3VudClzIHNlc3Npb25zIVwiLFxuICAgICAgICAgICAgICAgICAgICB7ZmFpbGVkQ291bnQ6IHRoaXMuc3RhdGUucmVjb3ZlckluZm8udG90YWwgLSB0aGlzLnN0YXRlLnJlY292ZXJJbmZvLmltcG9ydGVkfSxcbiAgICAgICAgICAgICAgICApfTwvcD47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJTdWNjZXNzZnVsbHkgcmVzdG9yZWQgJShzZXNzaW9uQ291bnQpcyBrZXlzXCIsIHtzZXNzaW9uQ291bnQ6IHRoaXMuc3RhdGUucmVjb3ZlckluZm8uaW1wb3J0ZWR9KX08L3A+XG4gICAgICAgICAgICAgICAge2ZhaWxlZFRvRGVjcnlwdH1cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnT0snKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uRG9uZX1cbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmIChiYWNrdXBIYXNQYXNzcGhyYXNlICYmICF0aGlzLnN0YXRlLmZvcmNlUmVjb3ZlcnlLZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIkVudGVyIFNlY3VyaXR5IFBocmFzZVwiKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCI8Yj5XYXJuaW5nPC9iPjogeW91IHNob3VsZCBvbmx5IHNldCB1cCBrZXkgYmFja3VwIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJmcm9tIGEgdHJ1c3RlZCBjb21wdXRlci5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgIHsgYjogc3ViID0+IDxiPntzdWJ9PC9iPiB9LFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJBY2Nlc3MgeW91ciBzZWN1cmUgbWVzc2FnZSBoaXN0b3J5IGFuZCBzZXQgdXAgc2VjdXJlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdpbmcgYnkgZW50ZXJpbmcgeW91ciBTZWN1cml0eSBQaHJhc2UuXCIsXG4gICAgICAgICAgICAgICAgKX08L3A+XG5cbiAgICAgICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX3ByaW1hcnlDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX3Bhc3NQaHJhc2VJbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25QYXNzUGhyYXNlQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc1BocmFzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdOZXh0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5fb25QYXNzUGhyYXNlTmV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlJc1N1Ym1pdD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLl9vbkNhbmNlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSd2ZSBmb3Jnb3R0ZW4geW91ciBTZWN1cml0eSBQaHJhc2UgeW91IGNhbiBcIitcbiAgICAgICAgICAgICAgICAgICAgXCI8YnV0dG9uMT51c2UgeW91ciBTZWN1cml0eSBLZXk8L2J1dHRvbjE+IG9yIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8YnV0dG9uMj5zZXQgdXAgbmV3IHJlY292ZXJ5IG9wdGlvbnM8L2J1dHRvbjI+XCJcbiAgICAgICAgICAgICAgICAsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbjE6IHMgPT4gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfbGlua0J1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50PVwic3BhblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vblVzZVJlY292ZXJ5S2V5Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICBidXR0b24yOiBzID0+IDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X2xpbmtCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInNwYW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25SZXNldFJlY292ZXJ5Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIkVudGVyIFNlY3VyaXR5IEtleVwiKTtcbiAgICAgICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuXG4gICAgICAgICAgICBsZXQga2V5U3RhdHVzO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVjb3ZlcnlLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX2tleVN0YXR1c1wiPjwvZGl2PjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5yZWNvdmVyeUtleVZhbGlkKSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX2tleVN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICB7XCJcXHVEODNEXFx1REM0RCBcIn17X3QoXCJUaGlzIGxvb2tzIGxpa2UgYSB2YWxpZCBTZWN1cml0eSBLZXkhXCIpfVxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX2tleVN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICB7XCJcXHVEODNEXFx1REM0RSBcIn17X3QoXCJOb3QgYSB2YWxpZCBTZWN1cml0eSBLZXlcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiPGI+V2FybmluZzwvYj46IFlvdSBzaG91bGQgb25seSBzZXQgdXAga2V5IGJhY2t1cCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiZnJvbSBhIHRydXN0ZWQgY29tcHV0ZXIuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7IGI6IHN1YiA9PiA8Yj57c3VifTwvYj4gfSxcbiAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQWNjZXNzIHlvdXIgc2VjdXJlIG1lc3NhZ2UgaGlzdG9yeSBhbmQgc2V0IHVwIHNlY3VyZSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwibWVzc2FnaW5nIGJ5IGVudGVyaW5nIHlvdXIgU2VjdXJpdHkgS2V5LlwiLFxuICAgICAgICAgICAgICAgICl9PC9wPlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX3ByaW1hcnlDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIm14X1Jlc3RvcmVLZXlCYWNrdXBEaWFsb2dfcmVjb3ZlcnlLZXlJbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25SZWNvdmVyeUtleUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnJlY292ZXJ5S2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7a2V5U3RhdHVzfVxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnTmV4dCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uUmVjb3ZlcnlLZXlOZXh0fVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMuX29uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXshdGhpcy5zdGF0ZS5yZWNvdmVyeUtleVZhbGlkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UndmUgZm9yZ290dGVuIHlvdXIgU2VjdXJpdHkgS2V5IHlvdSBjYW4gXCIrXG4gICAgICAgICAgICAgICAgICAgIFwiPGJ1dHRvbj5zZXQgdXAgbmV3IHJlY292ZXJ5IG9wdGlvbnM8L2J1dHRvbj5cIlxuICAgICAgICAgICAgICAgICwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiBzID0+IDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X2xpbmtCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInNwYW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25SZXNldFJlY292ZXJ5Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfUmVzdG9yZUtleUJhY2t1cERpYWxvZydcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1Jlc3RvcmVLZXlCYWNrdXBEaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
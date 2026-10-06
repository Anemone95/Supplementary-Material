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

var _client = require("matrix-js-sdk/src/client");

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
      if (this.state.restoreError.errcode === _client.MatrixClient.RESTORE_BACKUP_ERROR_BAD_KEY) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvUmVzdG9yZUtleUJhY2t1cERpYWxvZy5qcyJdLCJuYW1lcyI6WyJSRVNUT1JFX1RZUEVfUEFTU1BIUkFTRSIsIlJFU1RPUkVfVFlQRV9SRUNPVkVSWUtFWSIsIlJFU1RPUkVfVFlQRV9TRUNSRVRfU1RPUkFHRSIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwib25GaW5pc2hlZCIsInNldFN0YXRlIiwiZm9yY2VSZWNvdmVyeUtleSIsImRhdGEiLCJwcm9ncmVzcyIsImUiLCJyZWNvdmVyeUtleSIsInRhcmdldCIsInZhbHVlIiwicmVjb3ZlcnlLZXlWYWxpZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImlzVmFsaWRSZWNvdmVyeUtleSIsImxvYWRpbmciLCJyZXN0b3JlRXJyb3IiLCJyZXN0b3JlVHlwZSIsInJlY292ZXJJbmZvIiwicmVzdG9yZUtleUJhY2t1cFdpdGhQYXNzd29yZCIsInN0YXRlIiwicGFzc1BocmFzZSIsInVuZGVmaW5lZCIsImJhY2t1cEluZm8iLCJwcm9ncmVzc0NhbGxiYWNrIiwiX3Byb2dyZXNzQ2FsbGJhY2siLCJrZXlDYWxsYmFjayIsImtleSIsImtleUJhY2t1cEtleUZyb21QYXNzd29yZCIsInNob3dTdW1tYXJ5IiwiY29uc29sZSIsImxvZyIsInJlc3RvcmVLZXlCYWNrdXBXaXRoUmVjb3ZlcnlLZXkiLCJrZXlCYWNrdXBLZXlGcm9tUmVjb3ZlcnlLZXkiLCJiYWNrdXBLZXlTdG9yZWQiLCJsb2FkRXJyb3IiLCJzdGFnZSIsImNvbXBvbmVudERpZE1vdW50IiwiX2xvYWRCYWNrdXBTdGF0dXMiLCJfcmVzdG9yZVdpdGhTZWNyZXRTdG9yYWdlIiwicmVzdG9yZUtleUJhY2t1cFdpdGhTZWNyZXRTdG9yYWdlIiwiX3Jlc3RvcmVXaXRoQ2FjaGVkS2V5IiwicmVzdG9yZUtleUJhY2t1cFdpdGhDYWNoZSIsImNsaSIsImdldEtleUJhY2t1cFZlcnNpb24iLCJoYXM0UyIsImhhc1NlY3JldFN0b3JhZ2VLZXkiLCJpc0tleUJhY2t1cEtleVN0b3JlZCIsImdvdENhY2hlIiwicmVuZGVyIiwiQmFzZURpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIlNwaW5uZXIiLCJiYWNrdXBIYXNQYXNzcGhyYXNlIiwiYXV0aF9kYXRhIiwicHJpdmF0ZV9rZXlfc2FsdCIsInByaXZhdGVfa2V5X2l0ZXJhdGlvbnMiLCJjb250ZW50IiwidGl0bGUiLCJkZXRhaWxzIiwidG90YWwiLCJzdWNjZXNzZXMiLCJmYWlsdXJlcyIsImNvbXBsZXRlZCIsImVycmNvZGUiLCJNYXRyaXhDbGllbnQiLCJSRVNUT1JFX0JBQ0tVUF9FUlJPUl9CQURfS0VZIiwiRGlhbG9nQnV0dG9ucyIsImZhaWxlZFRvRGVjcnlwdCIsImltcG9ydGVkIiwiZmFpbGVkQ291bnQiLCJzZXNzaW9uQ291bnQiLCJfb25Eb25lIiwiQWNjZXNzaWJsZUJ1dHRvbiIsImIiLCJzdWIiLCJfb25QYXNzUGhyYXNlQ2hhbmdlIiwiX29uUGFzc1BocmFzZU5leHQiLCJfb25DYW5jZWwiLCJidXR0b24xIiwicyIsIl9vblVzZVJlY292ZXJ5S2V5Q2xpY2siLCJidXR0b24yIiwiX29uUmVzZXRSZWNvdmVyeUNsaWNrIiwia2V5U3RhdHVzIiwibGVuZ3RoIiwiX29uUmVjb3ZlcnlLZXlDaGFuZ2UiLCJfb25SZWNvdmVyeUtleU5leHQiLCJidXR0b24iLCJQcm9wVHlwZXMiLCJib29sIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVQSxNQUFNQSx1QkFBdUIsR0FBRyxDQUFo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QSxlQUFlLEVBQUUsQ0FBQyxLQUFLM0QsS0FBTCxDQUFXVDtBQUxqQyxRQVBKLENBWE0sRUEwQkwseUJBQ0csbURBQ0EsOENBRkgsRUFHRyxFQUhILEVBSUc7QUFDSThFLFFBQUFBLE1BQU0sRUFBRVIsQ0FBQyxpQkFBSSw2QkFBQyxnQkFBRDtBQUFrQixVQUFBLFNBQVMsRUFBQyxlQUE1QjtBQUNULFVBQUEsT0FBTyxFQUFDLE1BREM7QUFFVCxVQUFBLE9BQU8sRUFBRSxLQUFLRztBQUZMLFdBSVJILENBSlE7QUFEakIsT0FKSCxDQTFCSyxDQUFWO0FBd0NIOztBQUVELHdCQUNJLDZCQUFDLFVBQUQ7QUFBWSxNQUFBLFNBQVMsRUFBQywyQkFBdEI7QUFDSSxNQUFBLFVBQVUsRUFBRSxLQUFLaEYsS0FBTCxDQUFXQyxVQUQzQjtBQUVJLE1BQUEsS0FBSyxFQUFFeUQ7QUFGWCxvQkFJSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDS0QsT0FETCxDQUpKLENBREo7QUFVSDs7QUFoYm1FOzs7OEJBQW5EN0Qsc0IsZUFDRTtBQUNmO0FBQ0E7QUFDQWdDLEVBQUFBLFdBQVcsRUFBRTZELG1CQUFVQyxJQUhSO0FBSWY7QUFDQTtBQUNBakUsRUFBQUEsV0FBVyxFQUFFZ0UsbUJBQVVFO0FBTlIsQzs4QkFERi9GLHNCLGtCQVVLO0FBQ2xCZ0MsRUFBQUEsV0FBVyxFQUFFO0FBREssQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NsaWVudCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBhY2Nlc3NTZWNyZXRTdG9yYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vU2VjdXJpdHlNYW5hZ2VyJztcblxuY29uc3QgUkVTVE9SRV9UWVBFX1BBU1NQSFJBU0UgPSAwO1xuY29uc3QgUkVTVE9SRV9UWVBFX1JFQ09WRVJZS0VZID0gMTtcbmNvbnN0IFJFU1RPUkVfVFlQRV9TRUNSRVRfU1RPUkFHRSA9IDI7XG5cbi8qXG4gKiBEaWFsb2cgZm9yIHJlc3RvcmluZyBlMmUga2V5cyBmcm9tIGEgYmFja3VwIGFuZCB0aGUgdXNlcidzIHJlY292ZXJ5IGtleVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXN0b3JlS2V5QmFja3VwRGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLy8gaWYgZmFsc2UsIHdpbGwgY2xvc2UgdGhlIGRpYWxvZyBhcyBzb29uIGFzIHRoZSByZXN0b3JlIGNvbXBsZXRlcyBzdWNjZXNmdWxseVxuICAgICAgICAvLyBkZWZhdWx0OiB0cnVlXG4gICAgICAgIHNob3dTdW1tYXJ5OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgLy8gSWYgc3BlY2lmaWVkLCBnYXRoZXIgdGhlIGtleSBmcm9tIHRoZSB1c2VyIGJ1dCB0aGVuIGNhbGwgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIGJhY2t1cFxuICAgICAgICAvLyBrZXkgcmF0aGVyIHRoYW4gYWN0dWFsbHkgKG5lY2Vzc2FyaWx5KSByZXN0b3JpbmcgdGhlIGJhY2t1cC5cbiAgICAgICAga2V5Q2FsbGJhY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBzaG93U3VtbWFyeTogdHJ1ZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgYmFja3VwSW5mbzogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cEtleVN0b3JlZDogbnVsbCxcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgbG9hZEVycm9yOiBudWxsLFxuICAgICAgICAgICAgcmVzdG9yZUVycm9yOiBudWxsLFxuICAgICAgICAgICAgcmVjb3ZlcnlLZXk6IFwiXCIsXG4gICAgICAgICAgICByZWNvdmVySW5mbzogbnVsbCxcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5VmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgZm9yY2VSZWNvdmVyeUtleTogZmFsc2UsXG4gICAgICAgICAgICBwYXNzUGhyYXNlOiAnJyxcbiAgICAgICAgICAgIHJlc3RvcmVUeXBlOiBudWxsLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IHsgc3RhZ2U6IFwicHJlZmV0Y2hcIiB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9sb2FkQmFja3VwU3RhdHVzKCk7XG4gICAgfVxuXG4gICAgX29uQ2FuY2VsID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH1cblxuICAgIF9vbkRvbmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9XG5cbiAgICBfb25Vc2VSZWNvdmVyeUtleUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGZvcmNlUmVjb3ZlcnlLZXk6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9wcm9ncmVzc0NhbGxiYWNrID0gKGRhdGEpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcm9ncmVzczogZGF0YSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uUmVzZXRSZWNvdmVyeUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgICAgICBhY2Nlc3NTZWNyZXRTdG9yYWdlKCgpID0+IHt9LCAvKiBmb3JjZVJlc2V0ID0gKi8gdHJ1ZSk7XG4gICAgfVxuXG4gICAgX29uUmVjb3ZlcnlLZXlDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5OiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5VmFsaWQ6IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1ZhbGlkUmVjb3ZlcnlLZXkoZS50YXJnZXQudmFsdWUpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfb25QYXNzUGhyYXNlTmV4dCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgcmVzdG9yZUVycm9yOiBudWxsLFxuICAgICAgICAgICAgcmVzdG9yZVR5cGU6IFJFU1RPUkVfVFlQRV9QQVNTUEhSQVNFLFxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdlIGRvIHN0aWxsIHJlc3RvcmUgdGhlIGtleSBiYWNrdXA6IHdlIG11c3QgZW5zdXJlIHRoYXQgdGhlIGtleSBiYWNrdXAga2V5XG4gICAgICAgICAgICAvLyBpcyB0aGUgcmlnaHQgb25lIGFuZCByZXN0b3JpbmcgaXQgaXMgY3VycmVudGx5IHRoZSBvbmx5IHdheSB3ZSBjYW4gZG8gdGhpcy5cbiAgICAgICAgICAgIGNvbnN0IHJlY292ZXJJbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlc3RvcmVLZXlCYWNrdXBXaXRoUGFzc3dvcmQoXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5wYXNzUGhyYXNlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgIHsgcHJvZ3Jlc3NDYWxsYmFjazogdGhpcy5fcHJvZ3Jlc3NDYWxsYmFjayB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmtleUNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmtleUJhY2t1cEtleUZyb21QYXNzd29yZChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5wYXNzUGhyYXNlLCB0aGlzLnN0YXRlLmJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmtleUNhbGxiYWNrKGtleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5zaG93U3VtbWFyeSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZWNvdmVySW5mbyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIHJlc3RvcmluZyBiYWNrdXBcIiwgZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXN0b3JlRXJyb3I6IGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblJlY292ZXJ5S2V5TmV4dCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJlY292ZXJ5S2V5VmFsaWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICByZXN0b3JlRXJyb3I6IG51bGwsXG4gICAgICAgICAgICByZXN0b3JlVHlwZTogUkVTVE9SRV9UWVBFX1JFQ09WRVJZS0VZLFxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlY292ZXJJbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlc3RvcmVLZXlCYWNrdXBXaXRoUmVjb3ZlcnlLZXkoXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5yZWNvdmVyeUtleSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHRoaXMuc3RhdGUuYmFja3VwSW5mbyxcbiAgICAgICAgICAgICAgICB7IHByb2dyZXNzQ2FsbGJhY2s6IHRoaXMuX3Byb2dyZXNzQ2FsbGJhY2sgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5rZXlDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5rZXlCYWNrdXBLZXlGcm9tUmVjb3ZlcnlLZXkodGhpcy5zdGF0ZS5yZWNvdmVyeUtleSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlDYWxsYmFjayhrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLnNob3dTdW1tYXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlY292ZXJJbmZvLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgcmVzdG9yaW5nIGJhY2t1cFwiLCBlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlc3RvcmVFcnJvcjogZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uUGFzc1BocmFzZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFzc1BocmFzZTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIF9yZXN0b3JlV2l0aFNlY3JldFN0b3JhZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIHJlc3RvcmVFcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHJlc3RvcmVUeXBlOiBSRVNUT1JFX1RZUEVfU0VDUkVUX1NUT1JBR0UsXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gYGFjY2Vzc1NlY3JldFN0b3JhZ2VgIG1heSBwcm9tcHQgZm9yIHN0b3JhZ2UgYWNjZXNzIGFzIG5lZWRlZC5cbiAgICAgICAgICAgIGNvbnN0IHJlY292ZXJJbmZvID0gYXdhaXQgYWNjZXNzU2VjcmV0U3RvcmFnZShhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZXN0b3JlS2V5QmFja3VwV2l0aFNlY3JldFN0b3JhZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuYmFja3VwSW5mbywgdW5kZWZpbmVkLCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHsgcHJvZ3Jlc3NDYWxsYmFjazogdGhpcy5fcHJvZ3Jlc3NDYWxsYmFjayB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlY292ZXJJbmZvLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgcmVzdG9yaW5nIGJhY2t1cFwiLCBlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlc3RvcmVFcnJvcjogZSxcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgX3Jlc3RvcmVXaXRoQ2FjaGVkS2V5KGJhY2t1cEluZm8pIHtcbiAgICAgICAgaWYgKCFiYWNrdXBJbmZvKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZWNvdmVySW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZXN0b3JlS2V5QmFja3VwV2l0aENhY2hlKFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgLyogdGFyZ2V0Um9vbUlkICovXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCAvKiB0YXJnZXRTZXNzaW9uSWQgKi9cbiAgICAgICAgICAgICAgICBiYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgIHsgcHJvZ3Jlc3NDYWxsYmFjazogdGhpcy5fcHJvZ3Jlc3NDYWxsYmFjayB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlY292ZXJJbmZvLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXN0b3JlV2l0aENhY2hlZEtleSBmYWlsZWQ6XCIsIGUpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgX2xvYWRCYWNrdXBTdGF0dXMoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIGxvYWRFcnJvcjogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCBiYWNrdXBJbmZvID0gYXdhaXQgY2xpLmdldEtleUJhY2t1cFZlcnNpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IGhhczRTID0gYXdhaXQgY2xpLmhhc1NlY3JldFN0b3JhZ2VLZXkoKTtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cEtleVN0b3JlZCA9IGhhczRTICYmIGF3YWl0IGNsaS5pc0tleUJhY2t1cEtleVN0b3JlZCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbyxcbiAgICAgICAgICAgICAgICBiYWNrdXBLZXlTdG9yZWQsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZ290Q2FjaGUgPSBhd2FpdCB0aGlzLl9yZXN0b3JlV2l0aENhY2hlZEtleShiYWNrdXBJbmZvKTtcbiAgICAgICAgICAgIGlmIChnb3RDYWNoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVzdG9yZUtleUJhY2t1cERpYWxvZzogZm91bmQgY2FjaGVkIGJhY2t1cCBrZXlcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgdGhlIGJhY2t1cCBrZXkgaXMgc3RvcmVkLCB3ZSBjYW4gcHJvY2VlZCBkaXJlY3RseSB0byByZXN0b3JlLlxuICAgICAgICAgICAgaWYgKGJhY2t1cEtleVN0b3JlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXN0b3JlV2l0aFNlY3JldFN0b3JhZ2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZEVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgbG9hZGluZyBiYWNrdXAgc3RhdHVzXCIsIGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZEVycm9yOiBlLFxuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuXG4gICAgICAgIGNvbnN0IGJhY2t1cEhhc1Bhc3NwaHJhc2UgPSAoXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJhY2t1cEluZm8gJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmFja3VwSW5mby5hdXRoX2RhdGEgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmFja3VwSW5mby5hdXRoX2RhdGEucHJpdmF0ZV9rZXlfc2FsdCAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLmF1dGhfZGF0YS5wcml2YXRlX2tleV9pdGVyYXRpb25zXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGxldCB0aXRsZTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubG9hZGluZykge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlJlc3RvcmluZyBrZXlzIGZyb20gYmFja3VwXCIpO1xuICAgICAgICAgICAgbGV0IGRldGFpbHM7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5wcm9ncmVzcy5zdGFnZSA9PT0gXCJmZXRjaFwiKSB7XG4gICAgICAgICAgICAgICAgZGV0YWlscyA9IF90KFwiRmV0Y2hpbmcga2V5cyBmcm9tIHNlcnZlci4uLlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5wcm9ncmVzcy5zdGFnZSA9PT0gXCJsb2FkX2tleXNcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgdG90YWwsIHN1Y2Nlc3NlcywgZmFpbHVyZXMgfSA9IHRoaXMuc3RhdGUucHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgZGV0YWlscyA9IF90KFwiJShjb21wbGV0ZWQpcyBvZiAlKHRvdGFsKXMga2V5cyByZXN0b3JlZFwiLCB7IHRvdGFsLCBjb21wbGV0ZWQ6IHN1Y2Nlc3NlcyArIGZhaWx1cmVzIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnByb2dyZXNzLnN0YWdlID09PSBcInByZWZldGNoXCIpIHtcbiAgICAgICAgICAgICAgICBkZXRhaWxzID0gX3QoXCJGZXRjaGluZyBrZXlzIGZyb20gc2VydmVyLi4uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57ZGV0YWlsc308L2Rpdj5cbiAgICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUubG9hZEVycm9yKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiRXJyb3JcIik7XG4gICAgICAgICAgICBjb250ZW50ID0gX3QoXCJVbmFibGUgdG8gbG9hZCBiYWNrdXAgc3RhdHVzXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucmVzdG9yZUVycm9yKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZXN0b3JlRXJyb3IuZXJyY29kZSA9PT0gTWF0cml4Q2xpZW50LlJFU1RPUkVfQkFDS1VQX0VSUk9SX0JBRF9LRVkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZXN0b3JlVHlwZSA9PT0gUkVTVE9SRV9UWVBFX1JFQ09WRVJZS0VZKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJTZWN1cml0eSBLZXkgbWlzbWF0Y2hcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgd2l0aCB0aGlzIFNlY3VyaXR5IEtleTogXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGxlYXNlIHZlcmlmeSB0aGF0IHlvdSBlbnRlcmVkIHRoZSBjb3JyZWN0IFNlY3VyaXR5IEtleS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIkluY29ycmVjdCBTZWN1cml0eSBQaHJhc2VcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgd2l0aCB0aGlzIFNlY3VyaXR5IFBocmFzZTogXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGxlYXNlIHZlcmlmeSB0aGF0IHlvdSBlbnRlcmVkIHRoZSBjb3JyZWN0IFNlY3VyaXR5IFBocmFzZS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiRXJyb3JcIik7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IF90KFwiVW5hYmxlIHRvIHJlc3RvcmUgYmFja3VwXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYmFja3VwSW5mbyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIkVycm9yXCIpO1xuICAgICAgICAgICAgY29udGVudCA9IF90KFwiTm8gYmFja3VwIGZvdW5kIVwiKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnJlY292ZXJJbmZvKSB7XG4gICAgICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIktleXMgcmVzdG9yZWRcIik7XG4gICAgICAgICAgICBsZXQgZmFpbGVkVG9EZWNyeXB0O1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVjb3ZlckluZm8udG90YWwgPiB0aGlzLnN0YXRlLnJlY292ZXJJbmZvLmltcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgZmFpbGVkVG9EZWNyeXB0ID0gPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byBkZWNyeXB0ICUoZmFpbGVkQ291bnQpcyBzZXNzaW9ucyFcIixcbiAgICAgICAgICAgICAgICAgICAge2ZhaWxlZENvdW50OiB0aGlzLnN0YXRlLnJlY292ZXJJbmZvLnRvdGFsIC0gdGhpcy5zdGF0ZS5yZWNvdmVySW5mby5pbXBvcnRlZH0sXG4gICAgICAgICAgICAgICAgKX08L3A+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiU3VjY2Vzc2Z1bGx5IHJlc3RvcmVkICUoc2Vzc2lvbkNvdW50KXMga2V5c1wiLCB7c2Vzc2lvbkNvdW50OiB0aGlzLnN0YXRlLnJlY292ZXJJbmZvLmltcG9ydGVkfSl9PC9wPlxuICAgICAgICAgICAgICAgIHtmYWlsZWRUb0RlY3J5cHR9XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ09LJyl9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vbkRvbmV9XG4gICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAoYmFja3VwSGFzUGFzc3BocmFzZSAmJiAhdGhpcy5zdGF0ZS5mb3JjZVJlY292ZXJ5S2V5KSB7XG4gICAgICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuICAgICAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJFbnRlciBTZWN1cml0eSBQaHJhc2VcIik7XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiPGI+V2FybmluZzwvYj46IHlvdSBzaG91bGQgb25seSBzZXQgdXAga2V5IGJhY2t1cCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiZnJvbSBhIHRydXN0ZWQgY29tcHV0ZXIuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7IGI6IHN1YiA9PiA8Yj57c3VifTwvYj4gfSxcbiAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQWNjZXNzIHlvdXIgc2VjdXJlIG1lc3NhZ2UgaGlzdG9yeSBhbmQgc2V0IHVwIHNlY3VyZSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwibWVzc2FnaW5nIGJ5IGVudGVyaW5nIHlvdXIgU2VjdXJpdHkgUGhyYXNlLlwiLFxuICAgICAgICAgICAgICAgICl9PC9wPlxuXG4gICAgICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwibXhfUmVzdG9yZUtleUJhY2t1cERpYWxvZ19wcmltYXJ5Q29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUmVzdG9yZUtleUJhY2t1cERpYWxvZ19wYXNzUGhyYXNlSW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uUGFzc1BocmFzZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBhc3NQaHJhc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdCgnTmV4dCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uUGFzc1BocmFzZU5leHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5SXNTdWJtaXQ9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1cz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UndmUgZm9yZ290dGVuIHlvdXIgU2VjdXJpdHkgUGhyYXNlIHlvdSBjYW4gXCIrXG4gICAgICAgICAgICAgICAgICAgIFwiPGJ1dHRvbjE+dXNlIHlvdXIgU2VjdXJpdHkgS2V5PC9idXR0b24xPiBvciBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGJ1dHRvbjI+c2V0IHVwIG5ldyByZWNvdmVyeSBvcHRpb25zPC9idXR0b24yPlwiLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uMTogcyA9PiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X2xpbmtCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJzcGFuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vblVzZVJlY292ZXJ5S2V5Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3N9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uMjogcyA9PiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X2xpbmtCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJzcGFuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vblJlc2V0UmVjb3ZlcnlDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c31cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIkVudGVyIFNlY3VyaXR5IEtleVwiKTtcbiAgICAgICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuXG4gICAgICAgICAgICBsZXQga2V5U3RhdHVzO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVjb3ZlcnlLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX2tleVN0YXR1c1wiPjwvZGl2PjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5yZWNvdmVyeUtleVZhbGlkKSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX2tleVN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICB7XCJcXHVEODNEXFx1REM0RCBcIn17X3QoXCJUaGlzIGxvb2tzIGxpa2UgYSB2YWxpZCBTZWN1cml0eSBLZXkhXCIpfVxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX2tleVN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICB7XCJcXHVEODNEXFx1REM0RSBcIn17X3QoXCJOb3QgYSB2YWxpZCBTZWN1cml0eSBLZXlcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiPGI+V2FybmluZzwvYj46IFlvdSBzaG91bGQgb25seSBzZXQgdXAga2V5IGJhY2t1cCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiZnJvbSBhIHRydXN0ZWQgY29tcHV0ZXIuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7IGI6IHN1YiA9PiA8Yj57c3VifTwvYj4gfSxcbiAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQWNjZXNzIHlvdXIgc2VjdXJlIG1lc3NhZ2UgaGlzdG9yeSBhbmQgc2V0IHVwIHNlY3VyZSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwibWVzc2FnaW5nIGJ5IGVudGVyaW5nIHlvdXIgU2VjdXJpdHkgS2V5LlwiLFxuICAgICAgICAgICAgICAgICl9PC9wPlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX3ByaW1hcnlDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIm14X1Jlc3RvcmVLZXlCYWNrdXBEaWFsb2dfcmVjb3ZlcnlLZXlJbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25SZWNvdmVyeUtleUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnJlY292ZXJ5S2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7a2V5U3RhdHVzfVxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnTmV4dCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uUmVjb3ZlcnlLZXlOZXh0fVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMuX29uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXshdGhpcy5zdGF0ZS5yZWNvdmVyeUtleVZhbGlkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UndmUgZm9yZ290dGVuIHlvdXIgU2VjdXJpdHkgS2V5IHlvdSBjYW4gXCIrXG4gICAgICAgICAgICAgICAgICAgIFwiPGJ1dHRvbj5zZXQgdXAgbmV3IHJlY292ZXJ5IG9wdGlvbnM8L2J1dHRvbj5cIixcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvbjogcyA9PiA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9saW5rQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50PVwic3BhblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25SZXNldFJlY292ZXJ5Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3N9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPSdteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nJ1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1Jlc3RvcmVLZXlCYWNrdXBEaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
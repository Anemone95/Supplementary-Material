"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var sdk = _interopRequireWildcard3(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _RestoreKeyBackupDialog = _interopRequireDefault(require("./security/RestoreKeyBackupDialog"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let LogoutDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.LogoutDialog"), _dec(_class = (_temp = class LogoutDialog extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "defaultProps", {
      onFinished: function () {}
    });
    this._onSettingsLinkClick = this._onSettingsLinkClick.bind(this);
    this._onExportE2eKeysClicked = this._onExportE2eKeysClicked.bind(this);
    this._onFinished = this._onFinished.bind(this);
    this._onSetRecoveryMethodClick = this._onSetRecoveryMethodClick.bind(this);
    this._onLogoutConfirm = this._onLogoutConfirm.bind(this);

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const shouldLoadBackupStatus = cli.isCryptoEnabled() && !cli.getKeyBackupEnabled();
    this.state = {
      shouldLoadBackupStatus: shouldLoadBackupStatus,
      loading: shouldLoadBackupStatus,
      backupInfo: null,
      error: null
    };

    if (shouldLoadBackupStatus) {
      this._loadBackupStatus();
    }
  }

  async _loadBackupStatus() {
    try {
      const backupInfo = await _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupVersion();
      this.setState({
        loading: false,
        backupInfo
      });
    } catch (e) {
      console.log("Unable to fetch key backup status", e);
      this.setState({
        loading: false,
        error: e
      });
    }
  }

  _onSettingsLinkClick() {
    // close dialog
    this.props.onFinished();
  }

  _onExportE2eKeysClicked() {
    _Modal.default.createTrackedDialogAsync('Export E2E Keys', '', Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../../async-components/views/dialogs/security/ExportE2eKeysDialog'))), {
      matrixClient: _MatrixClientPeg.MatrixClientPeg.get()
    });
  }

  _onFinished(confirmed) {
    if (confirmed) {
      _dispatcher.default.dispatch({
        action: 'logout'
      });
    } // close dialog


    this.props.onFinished();
  }

  _onSetRecoveryMethodClick() {
    if (this.state.backupInfo) {
      // A key backup exists for this account, but the creating device is not
      // verified, so restore the backup which will give us the keys from it and
      // allow us to trust it (ie. upload keys to it)
      _Modal.default.createTrackedDialog('Restore Backup', '', _RestoreKeyBackupDialog.default, null, null,
      /* priority = */
      false,
      /* static = */
      true);
    } else {
      _Modal.default.createTrackedDialogAsync("Key Backup", "Key Backup", Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require("../../../async-components/views/dialogs/security/CreateKeyBackupDialog"))), null, null,
      /* priority = */
      false,
      /* static = */
      true);
    } // close dialog


    this.props.onFinished();
  }

  _onLogoutConfirm() {
    _dispatcher.default.dispatch({
      action: 'logout'
    }); // close dialog


    this.props.onFinished();
  }

  render() {
    if (this.state.shouldLoadBackupStatus) {
      const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');

      const description = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Encrypted messages are secured with end-to-end encryption. " + "Only you and the recipient(s) have the keys to read these messages.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Back up your keys before signing out to avoid losing them.")));

      let dialogContent;

      if (this.state.loading) {
        const Spinner = sdk.getComponent('views.elements.Spinner');
        dialogContent = /*#__PURE__*/_react.default.createElement(Spinner, null);
      } else {
        const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
        let setupButtonCaption;

        if (this.state.backupInfo) {
          setupButtonCaption = (0, _languageHandler._t)("Connect this session to Key Backup");
        } else {
          // if there's an error fetching the backup info, we'll just assume there's
          // no backup for the purpose of the button caption
          setupButtonCaption = (0, _languageHandler._t)("Start using Key Backup");
        }

        dialogContent = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_Dialog_content",
          id: "mx_Dialog_content"
        }, description), /*#__PURE__*/_react.default.createElement(DialogButtons, {
          primaryButton: setupButtonCaption,
          hasCancel: false,
          onPrimaryButtonClick: this._onSetRecoveryMethodClick,
          focus: true
        }, /*#__PURE__*/_react.default.createElement("button", {
          onClick: this._onLogoutConfirm
        }, (0, _languageHandler._t)("I don't want my encrypted messages"))), /*#__PURE__*/_react.default.createElement("details", null, /*#__PURE__*/_react.default.createElement("summary", null, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement("button", {
          onClick: this._onExportE2eKeysClicked
        }, (0, _languageHandler._t)("Manually export keys")))));
      } // Not quite a standard question dialog as the primary button cancels
      // the action and does something else instead, whilst non-default button
      // confirms the action.


      return /*#__PURE__*/_react.default.createElement(BaseDialog, {
        title: (0, _languageHandler._t)("You'll lose access to your encrypted messages"),
        contentId: "mx_Dialog_content",
        hasCancel: true,
        onFinished: this._onFinished
      }, dialogContent);
    } else {
      const QuestionDialog = sdk.getComponent('views.dialogs.QuestionDialog');
      return /*#__PURE__*/_react.default.createElement(QuestionDialog, {
        hasCancelButton: true,
        title: (0, _languageHandler._t)("Sign out"),
        description: (0, _languageHandler._t)("Are you sure you want to sign out?"),
        button: (0, _languageHandler._t)("Sign out"),
        onFinished: this._onFinished
      });
    }
  }

}, _temp)) || _class);
exports.default = LogoutDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTG9nb3V0RGlhbG9nLmpzIl0sIm5hbWVzIjpbIkxvZ291dERpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJvbkZpbmlzaGVkIiwiX29uU2V0dGluZ3NMaW5rQ2xpY2siLCJiaW5kIiwiX29uRXhwb3J0RTJlS2V5c0NsaWNrZWQiLCJfb25GaW5pc2hlZCIsIl9vblNldFJlY292ZXJ5TWV0aG9kQ2xpY2siLCJfb25Mb2dvdXRDb25maXJtIiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic2hvdWxkTG9hZEJhY2t1cFN0YXR1cyIsImlzQ3J5cHRvRW5hYmxlZCIsImdldEtleUJhY2t1cEVuYWJsZWQiLCJzdGF0ZSIsImxvYWRpbmciLCJiYWNrdXBJbmZvIiwiZXJyb3IiLCJfbG9hZEJhY2t1cFN0YXR1cyIsImdldEtleUJhY2t1cFZlcnNpb24iLCJzZXRTdGF0ZSIsImUiLCJjb25zb2xlIiwibG9nIiwicHJvcHMiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYyIsIm1hdHJpeENsaWVudCIsImNvbmZpcm1lZCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiZGVzY3JpcHRpb24iLCJkaWFsb2dDb250ZW50IiwiU3Bpbm5lciIsIkRpYWxvZ0J1dHRvbnMiLCJzZXR1cEJ1dHRvbkNhcHRpb24iLCJRdWVzdGlvbkRpYWxvZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSxZLFdBRHBCLGdEQUFxQiw0QkFBckIsQyx5QkFBRCxNQUNxQkEsWUFEckIsU0FDMENDLGVBQU1D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YSxFQUFFSSxrQkFBOUI7QUFDSSxVQUFBLFNBQVMsRUFBRSxLQURmO0FBRUksVUFBQSxvQkFBb0IsRUFBRSxLQUFLcEMseUJBRi9CO0FBR0ksVUFBQSxLQUFLLEVBQUU7QUFIWCx3QkFLSTtBQUFRLFVBQUEsT0FBTyxFQUFFLEtBQUtDO0FBQXRCLFdBQ0sseUJBQUcsb0NBQUgsQ0FETCxDQUxKLENBSlksZUFhWiwyREFDSSw4Q0FBVSx5QkFBRyxVQUFILENBQVYsQ0FESixlQUVJLHFEQUFHO0FBQVEsVUFBQSxPQUFPLEVBQUUsS0FBS0g7QUFBdEIsV0FDRSx5QkFBRyxzQkFBSCxDQURGLENBQUgsQ0FGSixDQWJZLENBQWhCO0FBb0JILE9BL0NrQyxDQWdEbkM7QUFDQTtBQUNBOzs7QUFDQSwwQkFBUSw2QkFBQyxVQUFEO0FBQ0osUUFBQSxLQUFLLEVBQUUseUJBQUcsK0NBQUgsQ0FESDtBQUVKLFFBQUEsU0FBUyxFQUFDLG1CQUZOO0FBR0osUUFBQSxTQUFTLEVBQUUsSUFIUDtBQUlKLFFBQUEsVUFBVSxFQUFFLEtBQUtDO0FBSmIsU0FNSGtDLGFBTkcsQ0FBUjtBQVFILEtBM0RELE1BMkRPO0FBQ0gsWUFBTUksY0FBYyxHQUFHUCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsOEJBQWpCLENBQXZCO0FBQ0EsMEJBQVEsNkJBQUMsY0FBRDtBQUNKLFFBQUEsZUFBZSxFQUFFLElBRGI7QUFFSixRQUFBLEtBQUssRUFBRSx5QkFBRyxVQUFILENBRkg7QUFHSixRQUFBLFdBQVcsRUFBRSx5QkFDVCxvQ0FEUyxDQUhUO0FBTUosUUFBQSxNQUFNLEVBQUUseUJBQUcsVUFBSCxDQU5KO0FBT0osUUFBQSxVQUFVLEVBQUUsS0FBS2hDO0FBUGIsUUFBUjtBQVNIO0FBQ0o7O0FBcktxRCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgUmVzdG9yZUtleUJhY2t1cERpYWxvZyBmcm9tICcuL3NlY3VyaXR5L1Jlc3RvcmVLZXlCYWNrdXBEaWFsb2cnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuTG9nb3V0RGlhbG9nXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dvdXREaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgb25GaW5pc2hlZDogZnVuY3Rpb24oKSB7fSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX29uU2V0dGluZ3NMaW5rQ2xpY2sgPSB0aGlzLl9vblNldHRpbmdzTGlua0NsaWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uRXhwb3J0RTJlS2V5c0NsaWNrZWQgPSB0aGlzLl9vbkV4cG9ydEUyZUtleXNDbGlja2VkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uRmluaXNoZWQgPSB0aGlzLl9vbkZpbmlzaGVkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uU2V0UmVjb3ZlcnlNZXRob2RDbGljayA9IHRoaXMuX29uU2V0UmVjb3ZlcnlNZXRob2RDbGljay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkxvZ291dENvbmZpcm0gPSB0aGlzLl9vbkxvZ291dENvbmZpcm0uYmluZCh0aGlzKTtcblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHNob3VsZExvYWRCYWNrdXBTdGF0dXMgPSBjbGkuaXNDcnlwdG9FbmFibGVkKCkgJiYgIWNsaS5nZXRLZXlCYWNrdXBFbmFibGVkKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNob3VsZExvYWRCYWNrdXBTdGF0dXM6IHNob3VsZExvYWRCYWNrdXBTdGF0dXMsXG4gICAgICAgICAgICBsb2FkaW5nOiBzaG91bGRMb2FkQmFja3VwU3RhdHVzLFxuICAgICAgICAgICAgYmFja3VwSW5mbzogbnVsbCxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChzaG91bGRMb2FkQmFja3VwU3RhdHVzKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkQmFja3VwU3RhdHVzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfbG9hZEJhY2t1cFN0YXR1cygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cEluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwVmVyc2lvbigpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBmZXRjaCBrZXkgYmFja3VwIHN0YXR1c1wiLCBlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25TZXR0aW5nc0xpbmtDbGljaygpIHtcbiAgICAgICAgLy8gY2xvc2UgZGlhbG9nXG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH1cblxuICAgIF9vbkV4cG9ydEUyZUtleXNDbGlja2VkKCkge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMoJ0V4cG9ydCBFMkUgS2V5cycsICcnLFxuICAgICAgICAgICAgaW1wb3J0KCcuLi8uLi8uLi9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvRXhwb3J0RTJlS2V5c0RpYWxvZycpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50UGVnLmdldCgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfb25GaW5pc2hlZChjb25maXJtZWQpIHtcbiAgICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdsb2dvdXQnfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2xvc2UgZGlhbG9nXG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH1cblxuICAgIF9vblNldFJlY292ZXJ5TWV0aG9kQ2xpY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmJhY2t1cEluZm8pIHtcbiAgICAgICAgICAgIC8vIEEga2V5IGJhY2t1cCBleGlzdHMgZm9yIHRoaXMgYWNjb3VudCwgYnV0IHRoZSBjcmVhdGluZyBkZXZpY2UgaXMgbm90XG4gICAgICAgICAgICAvLyB2ZXJpZmllZCwgc28gcmVzdG9yZSB0aGUgYmFja3VwIHdoaWNoIHdpbGwgZ2l2ZSB1cyB0aGUga2V5cyBmcm9tIGl0IGFuZFxuICAgICAgICAgICAgLy8gYWxsb3cgdXMgdG8gdHJ1c3QgaXQgKGllLiB1cGxvYWQga2V5cyB0byBpdClcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAgICAgJ1Jlc3RvcmUgQmFja3VwJywgJycsIFJlc3RvcmVLZXlCYWNrdXBEaWFsb2csIG51bGwsIG51bGwsXG4gICAgICAgICAgICAgICAgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMoXCJLZXkgQmFja3VwXCIsIFwiS2V5IEJhY2t1cFwiLFxuICAgICAgICAgICAgICAgIGltcG9ydChcIi4uLy4uLy4uL2FzeW5jLWNvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9DcmVhdGVLZXlCYWNrdXBEaWFsb2dcIiksXG4gICAgICAgICAgICAgICAgbnVsbCwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbG9zZSBkaWFsb2dcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfVxuXG4gICAgX29uTG9nb3V0Q29uZmlybSgpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdsb2dvdXQnfSk7XG5cbiAgICAgICAgLy8gY2xvc2UgZGlhbG9nXG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvdWxkTG9hZEJhY2t1cFN0YXR1cykge1xuICAgICAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuXG4gICAgICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIkVuY3J5cHRlZCBtZXNzYWdlcyBhcmUgc2VjdXJlZCB3aXRoIGVuZC10by1lbmQgZW5jcnlwdGlvbi4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIk9ubHkgeW91IGFuZCB0aGUgcmVjaXBpZW50KHMpIGhhdmUgdGhlIGtleXMgdG8gcmVhZCB0aGVzZSBtZXNzYWdlcy5cIixcbiAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJCYWNrIHVwIHlvdXIga2V5cyBiZWZvcmUgc2lnbmluZyBvdXQgdG8gYXZvaWQgbG9zaW5nIHRoZW0uXCIpfTwvcD5cbiAgICAgICAgICAgIDwvZGl2PjtcblxuICAgICAgICAgICAgbGV0IGRpYWxvZ0NvbnRlbnQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLlNwaW5uZXInKTtcblxuICAgICAgICAgICAgICAgIGRpYWxvZ0NvbnRlbnQgPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcbiAgICAgICAgICAgICAgICBsZXQgc2V0dXBCdXR0b25DYXB0aW9uO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmJhY2t1cEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0dXBCdXR0b25DYXB0aW9uID0gX3QoXCJDb25uZWN0IHRoaXMgc2Vzc2lvbiB0byBLZXkgQmFja3VwXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlJ3MgYW4gZXJyb3IgZmV0Y2hpbmcgdGhlIGJhY2t1cCBpbmZvLCB3ZSdsbCBqdXN0IGFzc3VtZSB0aGVyZSdzXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vIGJhY2t1cCBmb3IgdGhlIHB1cnBvc2Ugb2YgdGhlIGJ1dHRvbiBjYXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIHNldHVwQnV0dG9uQ2FwdGlvbiA9IF90KFwiU3RhcnQgdXNpbmcgS2V5IEJhY2t1cFwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkaWFsb2dDb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiIGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGRlc2NyaXB0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e3NldHVwQnV0dG9uQ2FwdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5fb25TZXRSZWNvdmVyeU1ldGhvZENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fb25Mb2dvdXRDb25maXJtfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJJIGRvbid0IHdhbnQgbXkgZW5jcnlwdGVkIG1lc3NhZ2VzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvRGlhbG9nQnV0dG9ucz5cbiAgICAgICAgICAgICAgICAgICAgPGRldGFpbHM+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3VtbWFyeT57X3QoXCJBZHZhbmNlZFwiKX08L3N1bW1hcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD48YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uRXhwb3J0RTJlS2V5c0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIk1hbnVhbGx5IGV4cG9ydCBrZXlzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2RldGFpbHM+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm90IHF1aXRlIGEgc3RhbmRhcmQgcXVlc3Rpb24gZGlhbG9nIGFzIHRoZSBwcmltYXJ5IGJ1dHRvbiBjYW5jZWxzXG4gICAgICAgICAgICAvLyB0aGUgYWN0aW9uIGFuZCBkb2VzIHNvbWV0aGluZyBlbHNlIGluc3RlYWQsIHdoaWxzdCBub24tZGVmYXVsdCBidXR0b25cbiAgICAgICAgICAgIC8vIGNvbmZpcm1zIHRoZSBhY3Rpb24uXG4gICAgICAgICAgICByZXR1cm4gKDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiWW91J2xsIGxvc2UgYWNjZXNzIHRvIHlvdXIgZW5jcnlwdGVkIG1lc3NhZ2VzXCIpfVxuICAgICAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfRGlhbG9nX2NvbnRlbnQnXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMuX29uRmluaXNoZWR9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2RpYWxvZ0NvbnRlbnR9XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5RdWVzdGlvbkRpYWxvZycpO1xuICAgICAgICAgICAgcmV0dXJuICg8UXVlc3Rpb25EaWFsb2dcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWxCdXR0b249e3RydWV9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiU2lnbiBvdXRcIil9XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb249e190KFxuICAgICAgICAgICAgICAgICAgICBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzaWduIG91dD9cIixcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIGJ1dHRvbj17X3QoXCJTaWduIG91dFwiKX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLl9vbkZpbmlzaGVkfVxuICAgICAgICAgICAgLz4pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
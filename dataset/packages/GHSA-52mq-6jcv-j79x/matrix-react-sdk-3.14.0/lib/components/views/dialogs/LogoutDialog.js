"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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
class LogoutDialog extends _react.default.Component {
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

}

exports.default = LogoutDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTG9nb3V0RGlhbG9nLmpzIl0sIm5hbWVzIjpbIkxvZ291dERpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJvbkZpbmlzaGVkIiwiX29uU2V0dGluZ3NMaW5rQ2xpY2siLCJiaW5kIiwiX29uRXhwb3J0RTJlS2V5c0NsaWNrZWQiLCJfb25GaW5pc2hlZCIsIl9vblNldFJlY292ZXJ5TWV0aG9kQ2xpY2siLCJfb25Mb2dvdXRDb25maXJtIiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic2hvdWxkTG9hZEJhY2t1cFN0YXR1cyIsImlzQ3J5cHRvRW5hYmxlZCIsImdldEtleUJhY2t1cEVuYWJsZWQiLCJzdGF0ZSIsImxvYWRpbmciLCJiYWNrdXBJbmZvIiwiZXJyb3IiLCJfbG9hZEJhY2t1cFN0YXR1cyIsImdldEtleUJhY2t1cFZlcnNpb24iLCJzZXRTdGF0ZSIsImUiLCJjb25zb2xlIiwibG9nIiwicHJvcHMiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYyIsIm1hdHJpeENsaWVudCIsImNvbmZpcm1lZCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiZGVzY3JpcHRpb24iLCJkaWFsb2dDb250ZW50IiwiU3Bpbm5lciIsIkRpYWxvZ0J1dHRvbnMiLCJzZXR1cEJ1dHRvbkNhcHRpb24iLCJRdWVzdGlvbkRpYWxvZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVlLE1BQU1BLFlBQU4sU0FBMkJDLGVBQU1DLFNBQWpDLENBQTJDO0FBS3REQyxFQUFBQSxXQUFXLEdBQUc7QUFDVjtBQURVLHdEQUpDO0FBQ1hDLE1BQUFBLFVBQVUsRUFBRSxZQUFXLENBQUU7QUFEZCxLQUlEO0FBRVYsU0FBS0Msb0JBQUwsR0FBNEIsS0FBS0Esb0JBQUwsQ0FBMEJDLElBQTFCLENBQStCLElBQS9CLENBQTVCO0FBQ0EsU0FBS0MsdUJBQUwsR0FBK0IsS0FBS0EsdUJBQUwsQ0FBNkJELElBQTdCLENBQWtDLElBQWxDLENBQS9CO0FBQ0EsU0FBS0UsV0FBTCxHQUFtQixLQUFLQSxXQUFMLENBQWlCRixJQUFqQixDQUFzQixJQUF0QixDQUFuQjtBQUNBLFNBQUtHLHlCQUFMLEdBQWlDLEtBQUtBLHlCQUFMLENBQStCSCxJQUEvQixDQUFvQyxJQUFwQyxDQUFqQztBQUNBLFNBQUtJLGdCQUFMLEdBQXdCLEtBQUtBLGdCQUFMLENBQXNCSixJQUF0QixDQUEyQixJQUEzQixDQUF4Qjs7QUFFQSxVQUFNSyxHQUFHLEdBQUdDLGlDQUFnQkMsR0FBaEIsRUFBWjs7QUFDQSxVQUFNQyxzQkFBc0IsR0FBR0gsR0FBRyxDQUFDSSxlQUFKLE1BQXlCLENBQUNKLEdBQUcsQ0FBQ0ssbUJBQUosRUFBekQ7QUFFQSxTQUFLQyxLQUFMLEdBQWE7QUFDVEgsTUFBQUEsc0JBQXNCLEVBQUVBLHNCQURmO0FBRVRJLE1BQUFBLE9BQU8sRUFBRUosc0JBRkE7QUFHVEssTUFBQUEsVUFBVSxFQUFFLElBSEg7QUFJVEMsTUFBQUEsS0FBSyxFQUFFO0FBSkUsS0FBYjs7QUFPQSxRQUFJTixzQkFBSixFQUE0QjtBQUN4QixXQUFLTyxpQkFBTDtBQUNIO0FBQ0o7O0FBRUQsUUFBTUEsaUJBQU4sR0FBMEI7QUFDdEIsUUFBSTtBQUNBLFlBQU1GLFVBQVUsR0FBRyxNQUFNUCxpQ0FBZ0JDLEdBQWhCLEdBQXNCUyxtQkFBdEIsRUFBekI7QUFDQSxXQUFLQyxRQUFMLENBQWM7QUFDVkwsUUFBQUEsT0FBTyxFQUFFLEtBREM7QUFFVkMsUUFBQUE7QUFGVSxPQUFkO0FBSUgsS0FORCxDQU1FLE9BQU9LLENBQVAsRUFBVTtBQUNSQyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxtQ0FBWixFQUFpREYsQ0FBakQ7QUFDQSxXQUFLRCxRQUFMLENBQWM7QUFDVkwsUUFBQUEsT0FBTyxFQUFFLEtBREM7QUFFVkUsUUFBQUEsS0FBSyxFQUFFSTtBQUZHLE9BQWQ7QUFJSDtBQUNKOztBQUVEbkIsRUFBQUEsb0JBQW9CLEdBQUc7QUFDbkI7QUFDQSxTQUFLc0IsS0FBTCxDQUFXdkIsVUFBWDtBQUNIOztBQUVERyxFQUFBQSx1QkFBdUIsR0FBRztBQUN0QnFCLG1CQUFNQyx3QkFBTixDQUErQixpQkFBL0IsRUFBa0QsRUFBbEQsNkVBQ1csc0VBRFgsS0FFSTtBQUNJQyxNQUFBQSxZQUFZLEVBQUVsQixpQ0FBZ0JDLEdBQWhCO0FBRGxCLEtBRko7QUFNSDs7QUFFREwsRUFBQUEsV0FBVyxDQUFDdUIsU0FBRCxFQUFZO0FBQ25CLFFBQUlBLFNBQUosRUFBZTtBQUNYQywwQkFBSUMsUUFBSixDQUFhO0FBQUNDLFFBQUFBLE1BQU0sRUFBRTtBQUFULE9BQWI7QUFDSCxLQUhrQixDQUluQjs7O0FBQ0EsU0FBS1AsS0FBTCxDQUFXdkIsVUFBWDtBQUNIOztBQUVESyxFQUFBQSx5QkFBeUIsR0FBRztBQUN4QixRQUFJLEtBQUtRLEtBQUwsQ0FBV0UsVUFBZixFQUEyQjtBQUN2QjtBQUNBO0FBQ0E7QUFDQVMscUJBQU1PLG1CQUFOLENBQ0ksZ0JBREosRUFDc0IsRUFEdEIsRUFDMEJDLCtCQUQxQixFQUNrRCxJQURsRCxFQUN3RCxJQUR4RDtBQUVJO0FBQWlCLFdBRnJCO0FBRTRCO0FBQWUsVUFGM0M7QUFJSCxLQVJELE1BUU87QUFDSFIscUJBQU1DLHdCQUFOLENBQStCLFlBQS9CLEVBQTZDLFlBQTdDLDZFQUNXLHdFQURYLEtBRUksSUFGSixFQUVVLElBRlY7QUFFZ0I7QUFBaUIsV0FGakM7QUFFd0M7QUFBZSxVQUZ2RDtBQUlILEtBZHVCLENBZ0J4Qjs7O0FBQ0EsU0FBS0YsS0FBTCxDQUFXdkIsVUFBWDtBQUNIOztBQUVETSxFQUFBQSxnQkFBZ0IsR0FBRztBQUNmc0Isd0JBQUlDLFFBQUosQ0FBYTtBQUFDQyxNQUFBQSxNQUFNLEVBQUU7QUFBVCxLQUFiLEVBRGUsQ0FHZjs7O0FBQ0EsU0FBS1AsS0FBTCxDQUFXdkIsVUFBWDtBQUNIOztBQUVEaUMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSSxLQUFLcEIsS0FBTCxDQUFXSCxzQkFBZixFQUF1QztBQUNuQyxZQUFNd0IsVUFBVSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMEJBQWpCLENBQW5COztBQUVBLFlBQU1DLFdBQVcsZ0JBQUcsdURBQ2hCLHdDQUFJLHlCQUNBLGdFQUNBLHFFQUZBLENBQUosQ0FEZ0IsZUFLaEIsd0NBQUkseUJBQUcsNERBQUgsQ0FBSixDQUxnQixDQUFwQjs7QUFRQSxVQUFJQyxhQUFKOztBQUNBLFVBQUksS0FBS3pCLEtBQUwsQ0FBV0MsT0FBZixFQUF3QjtBQUNwQixjQUFNeUIsT0FBTyxHQUFHSixHQUFHLENBQUNDLFlBQUosQ0FBaUIsd0JBQWpCLENBQWhCO0FBRUFFLFFBQUFBLGFBQWEsZ0JBQUcsNkJBQUMsT0FBRCxPQUFoQjtBQUNILE9BSkQsTUFJTztBQUNILGNBQU1FLGFBQWEsR0FBR0wsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDhCQUFqQixDQUF0QjtBQUNBLFlBQUlLLGtCQUFKOztBQUNBLFlBQUksS0FBSzVCLEtBQUwsQ0FBV0UsVUFBZixFQUEyQjtBQUN2QjBCLFVBQUFBLGtCQUFrQixHQUFHLHlCQUFHLG9DQUFILENBQXJCO0FBQ0gsU0FGRCxNQUVPO0FBQ0g7QUFDQTtBQUNBQSxVQUFBQSxrQkFBa0IsR0FBRyx5QkFBRyx3QkFBSCxDQUFyQjtBQUNIOztBQUVESCxRQUFBQSxhQUFhLGdCQUFHLHVEQUNaO0FBQUssVUFBQSxTQUFTLEVBQUMsbUJBQWY7QUFBbUMsVUFBQSxFQUFFLEVBQUM7QUFBdEMsV0FDTUQsV0FETixDQURZLGVBSVosNkJBQUMsYUFBRDtBQUFlLFVBQUEsYUFBYSxFQUFFSSxrQkFBOUI7QUFDSSxVQUFBLFNBQVMsRUFBRSxLQURmO0FBRUksVUFBQSxvQkFBb0IsRUFBRSxLQUFLcEMseUJBRi9CO0FBR0ksVUFBQSxLQUFLLEVBQUU7QUFIWCx3QkFLSTtBQUFRLFVBQUEsT0FBTyxFQUFFLEtBQUtDO0FBQXRCLFdBQ0sseUJBQUcsb0NBQUgsQ0FETCxDQUxKLENBSlksZUFhWiwyREFDSSw4Q0FBVSx5QkFBRyxVQUFILENBQVYsQ0FESixlQUVJLHFEQUFHO0FBQVEsVUFBQSxPQUFPLEVBQUUsS0FBS0g7QUFBdEIsV0FDRSx5QkFBRyxzQkFBSCxDQURGLENBQUgsQ0FGSixDQWJZLENBQWhCO0FBb0JILE9BL0NrQyxDQWdEbkM7QUFDQTtBQUNBOzs7QUFDQSwwQkFBUSw2QkFBQyxVQUFEO0FBQ0osUUFBQSxLQUFLLEVBQUUseUJBQUcsK0NBQUgsQ0FESDtBQUVKLFFBQUEsU0FBUyxFQUFDLG1CQUZOO0FBR0osUUFBQSxTQUFTLEVBQUUsSUFIUDtBQUlKLFFBQUEsVUFBVSxFQUFFLEtBQUtDO0FBSmIsU0FNSGtDLGFBTkcsQ0FBUjtBQVFILEtBM0RELE1BMkRPO0FBQ0gsWUFBTUksY0FBYyxHQUFHUCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsOEJBQWpCLENBQXZCO0FBQ0EsMEJBQVEsNkJBQUMsY0FBRDtBQUNKLFFBQUEsZUFBZSxFQUFFLElBRGI7QUFFSixRQUFBLEtBQUssRUFBRSx5QkFBRyxVQUFILENBRkg7QUFHSixRQUFBLFdBQVcsRUFBRSx5QkFDVCxvQ0FEUyxDQUhUO0FBTUosUUFBQSxNQUFNLEVBQUUseUJBQUcsVUFBSCxDQU5KO0FBT0osUUFBQSxVQUFVLEVBQUUsS0FBS2hDO0FBUGIsUUFBUjtBQVNIO0FBQ0o7O0FBcktxRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZnJvbSAnLi9zZWN1cml0eS9SZXN0b3JlS2V5QmFja3VwRGlhbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9nb3V0RGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIG9uRmluaXNoZWQ6IGZ1bmN0aW9uKCkge30sXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9vblNldHRpbmdzTGlua0NsaWNrID0gdGhpcy5fb25TZXR0aW5nc0xpbmtDbGljay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkV4cG9ydEUyZUtleXNDbGlja2VkID0gdGhpcy5fb25FeHBvcnRFMmVLZXlzQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkZpbmlzaGVkID0gdGhpcy5fb25GaW5pc2hlZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vblNldFJlY292ZXJ5TWV0aG9kQ2xpY2sgPSB0aGlzLl9vblNldFJlY292ZXJ5TWV0aG9kQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25Mb2dvdXRDb25maXJtID0gdGhpcy5fb25Mb2dvdXRDb25maXJtLmJpbmQodGhpcyk7XG5cbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBzaG91bGRMb2FkQmFja3VwU3RhdHVzID0gY2xpLmlzQ3J5cHRvRW5hYmxlZCgpICYmICFjbGkuZ2V0S2V5QmFja3VwRW5hYmxlZCgpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaG91bGRMb2FkQmFja3VwU3RhdHVzOiBzaG91bGRMb2FkQmFja3VwU3RhdHVzLFxuICAgICAgICAgICAgbG9hZGluZzogc2hvdWxkTG9hZEJhY2t1cFN0YXR1cyxcbiAgICAgICAgICAgIGJhY2t1cEluZm86IG51bGwsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoc2hvdWxkTG9hZEJhY2t1cFN0YXR1cykge1xuICAgICAgICAgICAgdGhpcy5fbG9hZEJhY2t1cFN0YXR1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgX2xvYWRCYWNrdXBTdGF0dXMoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBiYWNrdXBJbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldEtleUJhY2t1cFZlcnNpb24oKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJhY2t1cEluZm8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmFibGUgdG8gZmV0Y2gga2V5IGJhY2t1cCBzdGF0dXNcIiwgZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uU2V0dGluZ3NMaW5rQ2xpY2soKSB7XG4gICAgICAgIC8vIGNsb3NlIGRpYWxvZ1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9XG5cbiAgICBfb25FeHBvcnRFMmVLZXlzQ2xpY2tlZCgpIHtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jKCdFeHBvcnQgRTJFIEtleXMnLCAnJyxcbiAgICAgICAgICAgIGltcG9ydCgnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0V4cG9ydEUyZUtleXNEaWFsb2cnKSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudFBlZy5nZXQoKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX29uRmluaXNoZWQoY29uZmlybWVkKSB7XG4gICAgICAgIGlmIChjb25maXJtZWQpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnbG9nb3V0J30pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNsb3NlIGRpYWxvZ1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9XG5cbiAgICBfb25TZXRSZWNvdmVyeU1ldGhvZENsaWNrKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5iYWNrdXBJbmZvKSB7XG4gICAgICAgICAgICAvLyBBIGtleSBiYWNrdXAgZXhpc3RzIGZvciB0aGlzIGFjY291bnQsIGJ1dCB0aGUgY3JlYXRpbmcgZGV2aWNlIGlzIG5vdFxuICAgICAgICAgICAgLy8gdmVyaWZpZWQsIHNvIHJlc3RvcmUgdGhlIGJhY2t1cCB3aGljaCB3aWxsIGdpdmUgdXMgdGhlIGtleXMgZnJvbSBpdCBhbmRcbiAgICAgICAgICAgIC8vIGFsbG93IHVzIHRvIHRydXN0IGl0IChpZS4gdXBsb2FkIGtleXMgdG8gaXQpXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgICAgICdSZXN0b3JlIEJhY2t1cCcsICcnLCBSZXN0b3JlS2V5QmFja3VwRGlhbG9nLCBudWxsLCBudWxsLFxuICAgICAgICAgICAgICAgIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIHRydWUsXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jKFwiS2V5IEJhY2t1cFwiLCBcIktleSBCYWNrdXBcIixcbiAgICAgICAgICAgICAgICBpbXBvcnQoXCIuLi8uLi8uLi9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQ3JlYXRlS2V5QmFja3VwRGlhbG9nXCIpLFxuICAgICAgICAgICAgICAgIG51bGwsIG51bGwsIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIHRydWUsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2xvc2UgZGlhbG9nXG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH1cblxuICAgIF9vbkxvZ291dENvbmZpcm0oKSB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnbG9nb3V0J30pO1xuXG4gICAgICAgIC8vIGNsb3NlIGRpYWxvZ1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3VsZExvYWRCYWNrdXBTdGF0dXMpIHtcbiAgICAgICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcblxuICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJFbmNyeXB0ZWQgbWVzc2FnZXMgYXJlIHNlY3VyZWQgd2l0aCBlbmQtdG8tZW5kIGVuY3J5cHRpb24uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJPbmx5IHlvdSBhbmQgdGhlIHJlY2lwaWVudChzKSBoYXZlIHRoZSBrZXlzIHRvIHJlYWQgdGhlc2UgbWVzc2FnZXMuXCIsXG4gICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiQmFjayB1cCB5b3VyIGtleXMgYmVmb3JlIHNpZ25pbmcgb3V0IHRvIGF2b2lkIGxvc2luZyB0aGVtLlwiKX08L3A+XG4gICAgICAgICAgICA8L2Rpdj47XG5cbiAgICAgICAgICAgIGxldCBkaWFsb2dDb250ZW50O1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubG9hZGluZykge1xuICAgICAgICAgICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5TcGlubmVyJyk7XG5cbiAgICAgICAgICAgICAgICBkaWFsb2dDb250ZW50ID0gPFNwaW5uZXIgLz47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgICAgICAgICAgbGV0IHNldHVwQnV0dG9uQ2FwdGlvbjtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5iYWNrdXBJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldHVwQnV0dG9uQ2FwdGlvbiA9IF90KFwiQ29ubmVjdCB0aGlzIHNlc3Npb24gdG8gS2V5IEJhY2t1cFwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSdzIGFuIGVycm9yIGZldGNoaW5nIHRoZSBiYWNrdXAgaW5mbywgd2UnbGwganVzdCBhc3N1bWUgdGhlcmUnc1xuICAgICAgICAgICAgICAgICAgICAvLyBubyBiYWNrdXAgZm9yIHRoZSBwdXJwb3NlIG9mIHRoZSBidXR0b24gY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICBzZXR1cEJ1dHRvbkNhcHRpb24gPSBfdChcIlN0YXJ0IHVzaW5nIEtleSBCYWNrdXBcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGlhbG9nQ29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIiBpZD0nbXhfRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBkZXNjcmlwdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtzZXR1cEJ1dHRvbkNhcHRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uU2V0UmVjb3ZlcnlNZXRob2RDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uTG9nb3V0Q29uZmlybX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiSSBkb24ndCB3YW50IG15IGVuY3J5cHRlZCBtZXNzYWdlc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L0RpYWxvZ0J1dHRvbnM+XG4gICAgICAgICAgICAgICAgICAgIDxkZXRhaWxzPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHN1bW1hcnk+e190KFwiQWR2YW5jZWRcIil9PC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+PGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkV4cG9ydEUyZUtleXNDbGlja2VkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJNYW51YWxseSBleHBvcnQga2V5c1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPC9kZXRhaWxzPlxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE5vdCBxdWl0ZSBhIHN0YW5kYXJkIHF1ZXN0aW9uIGRpYWxvZyBhcyB0aGUgcHJpbWFyeSBidXR0b24gY2FuY2Vsc1xuICAgICAgICAgICAgLy8gdGhlIGFjdGlvbiBhbmQgZG9lcyBzb21ldGhpbmcgZWxzZSBpbnN0ZWFkLCB3aGlsc3Qgbm9uLWRlZmF1bHQgYnV0dG9uXG4gICAgICAgICAgICAvLyBjb25maXJtcyB0aGUgYWN0aW9uLlxuICAgICAgICAgICAgcmV0dXJuICg8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIllvdSdsbCBsb3NlIGFjY2VzcyB0byB5b3VyIGVuY3J5cHRlZCBtZXNzYWdlc1wiKX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLl9vbkZpbmlzaGVkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtkaWFsb2dDb250ZW50fVxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuUXVlc3Rpb25EaWFsb2cnKTtcbiAgICAgICAgICAgIHJldHVybiAoPFF1ZXN0aW9uRGlhbG9nXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsQnV0dG9uPXt0cnVlfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlNpZ24gb3V0XCIpfVxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtfdChcbiAgICAgICAgICAgICAgICAgICAgXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc2lnbiBvdXQ/XCIsXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICBidXR0b249e190KFwiU2lnbiBvdXRcIil9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5fb25GaW5pc2hlZH1cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
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

var _dispatcher = _interopRequireDefault(require("../../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _RestoreKeyBackupDialog = _interopRequireDefault(require("../../../../components/views/dialogs/security/RestoreKeyBackupDialog"));

var _actions = require("../../../../dispatcher/actions");

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
class NewRecoveryMethodDialog extends _react.default.PureComponent {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onOkClick", () => {
      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onGoToSettingsClick", () => {
      this.props.onFinished();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
    (0, _defineProperty2.default)(this, "onSetupClick", async () => {
      _Modal.default.createTrackedDialog('Restore Backup', '', _RestoreKeyBackupDialog.default, {
        onFinished: this.props.onFinished
      }, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
  }

  render() {
    const BaseDialog = sdk.getComponent("views.dialogs.BaseDialog");
    const DialogButtons = sdk.getComponent("views.elements.DialogButtons");

    const title = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_KeyBackupFailedDialog_title"
    }, (0, _languageHandler._t)("New Recovery Method"));

    const newMethodDetected = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("A new Security Phrase and key for Secure Messages have been detected."));

    const hackWarning = /*#__PURE__*/_react.default.createElement("p", {
      className: "warning"
    }, (0, _languageHandler._t)("If you didn't set the new recovery method, an " + "attacker may be trying to access your account. " + "Change your account password and set a new recovery " + "method immediately in Settings."));

    let content;

    if (_MatrixClientPeg.MatrixClientPeg.get().getKeyBackupEnabled()) {
      content = /*#__PURE__*/_react.default.createElement("div", null, newMethodDetected, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This session is encrypting history using the new recovery method.")), hackWarning, /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)("OK"),
        onPrimaryButtonClick: this.onOkClick,
        cancelButton: (0, _languageHandler._t)("Go to Settings"),
        onCancel: this.onGoToSettingsClick
      }));
    } else {
      content = /*#__PURE__*/_react.default.createElement("div", null, newMethodDetected, hackWarning, /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)("Set up Secure Messages"),
        onPrimaryButtonClick: this.onSetupClick,
        cancelButton: (0, _languageHandler._t)("Go to Settings"),
        onCancel: this.onGoToSettingsClick
      }));
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_KeyBackupFailedDialog",
      onFinished: this.props.onFinished,
      title: title
    }, content);
  }

}

exports.default = NewRecoveryMethodDialog;
(0, _defineProperty2.default)(NewRecoveryMethodDialog, "propTypes", {
  // As returned by js-sdk getKeyBackupVersion()
  newVersionInfo: _propTypes.default.object,
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvTmV3UmVjb3ZlcnlNZXRob2REaWFsb2cuanMiXSwibmFtZXMiOlsiTmV3UmVjb3ZlcnlNZXRob2REaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJkaXMiLCJmaXJlIiwiQWN0aW9uIiwiVmlld1VzZXJTZXR0aW5ncyIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRGlhbG9nQnV0dG9ucyIsInRpdGxlIiwibmV3TWV0aG9kRGV0ZWN0ZWQiLCJoYWNrV2FybmluZyIsImNvbnRlbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRLZXlCYWNrdXBFbmFibGVkIiwib25Pa0NsaWNrIiwib25Hb1RvU2V0dGluZ3NDbGljayIsIm9uU2V0dXBDbGljayIsIm5ld1ZlcnNpb25JbmZvIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiZnVuYyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWWUsTUFBTUEsdUJBQU4sU0FBc0NDLGVBQU1DLGFBQTVDLENBQTBEO0FBQUE7QUFBQTtBQUFBLHFEQU96RCxNQUFNO0FBQ2QsV0FBS0MsS0FBTCxDQUFXQyxVQUFYO0FBQ0gsS0FUb0U7QUFBQSwrREFXL0MsTUFBTTtBQUN4QixXQUFLRCxLQUFMLENBQVdDLFVBQVg7O0FBQ0FDLDBCQUFJQyxJQUFKLENBQVNDLGdCQUFPQyxnQkFBaEI7QUFDSCxLQWRvRTtBQUFBLHdEQWdCdEQsWUFBWTtBQUN2QkMscUJBQU1DLG1CQUFOLENBQ0ksZ0JBREosRUFDc0IsRUFEdEIsRUFDMEJDLCtCQUQxQixFQUNrRDtBQUMxQ1AsUUFBQUEsVUFBVSxFQUFFLEtBQUtELEtBQUwsQ0FBV0M7QUFEbUIsT0FEbEQsRUFHTyxJQUhQO0FBR2E7QUFBaUIsV0FIOUI7QUFHcUM7QUFBZSxVQUhwRDtBQUtILEtBdEJvRTtBQUFBOztBQXdCckVRLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLFVBQVUsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDBCQUFqQixDQUFuQjtBQUNBLFVBQU1DLGFBQWEsR0FBR0YsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDhCQUFqQixDQUF0Qjs7QUFFQSxVQUFNRSxLQUFLLGdCQUFHO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FDVCx5QkFBRyxxQkFBSCxDQURTLENBQWQ7O0FBSUEsVUFBTUMsaUJBQWlCLGdCQUFHLHdDQUFJLHlCQUMxQix1RUFEMEIsQ0FBSixDQUExQjs7QUFJQSxVQUFNQyxXQUFXLGdCQUFHO0FBQUcsTUFBQSxTQUFTLEVBQUM7QUFBYixPQUF3Qix5QkFDeEMsbURBQ0EsaURBREEsR0FFQSxzREFGQSxHQUdBLGlDQUp3QyxDQUF4QixDQUFwQjs7QUFPQSxRQUFJQyxPQUFKOztBQUNBLFFBQUlDLGlDQUFnQkMsR0FBaEIsR0FBc0JDLG1CQUF0QixFQUFKLEVBQWlEO0FBQzdDSCxNQUFBQSxPQUFPLGdCQUFHLDBDQUNMRixpQkFESyxlQUVOLHdDQUFJLHlCQUNBLG1FQURBLENBQUosQ0FGTSxFQUtMQyxXQUxLLGVBTU4sNkJBQUMsYUFBRDtBQUNJLFFBQUEsYUFBYSxFQUFFLHlCQUFHLElBQUgsQ0FEbkI7QUFFSSxRQUFBLG9CQUFvQixFQUFFLEtBQUtLLFNBRi9CO0FBR0ksUUFBQSxZQUFZLEVBQUUseUJBQUcsZ0JBQUgsQ0FIbEI7QUFJSSxRQUFBLFFBQVEsRUFBRSxLQUFLQztBQUpuQixRQU5NLENBQVY7QUFhSCxLQWRELE1BY087QUFDSEwsTUFBQUEsT0FBTyxnQkFBRywwQ0FDTEYsaUJBREssRUFFTEMsV0FGSyxlQUdOLDZCQUFDLGFBQUQ7QUFDSSxRQUFBLGFBQWEsRUFBRSx5QkFBRyx3QkFBSCxDQURuQjtBQUVJLFFBQUEsb0JBQW9CLEVBQUUsS0FBS08sWUFGL0I7QUFHSSxRQUFBLFlBQVksRUFBRSx5QkFBRyxnQkFBSCxDQUhsQjtBQUlJLFFBQUEsUUFBUSxFQUFFLEtBQUtEO0FBSm5CLFFBSE0sQ0FBVjtBQVVIOztBQUVELHdCQUNJLDZCQUFDLFVBQUQ7QUFBWSxNQUFBLFNBQVMsRUFBQywwQkFBdEI7QUFDSSxNQUFBLFVBQVUsRUFBRSxLQUFLdEIsS0FBTCxDQUFXQyxVQUQzQjtBQUVJLE1BQUEsS0FBSyxFQUFFYTtBQUZYLE9BSUtHLE9BSkwsQ0FESjtBQVFIOztBQS9Fb0U7Ozs4QkFBcERwQix1QixlQUNFO0FBQ2Y7QUFDQTJCLEVBQUFBLGNBQWMsRUFBRUMsbUJBQVVDLE1BRlg7QUFHZnpCLEVBQUFBLFVBQVUsRUFBRXdCLG1CQUFVRSxJQUFWLENBQWVDO0FBSFosQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uLy4uL2luZGV4XCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgUmVzdG9yZUtleUJhY2t1cERpYWxvZyBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L1Jlc3RvcmVLZXlCYWNrdXBEaWFsb2dcIjtcbmltcG9ydCB7QWN0aW9ufSBmcm9tIFwiLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ld1JlY292ZXJ5TWV0aG9kRGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLy8gQXMgcmV0dXJuZWQgYnkganMtc2RrIGdldEtleUJhY2t1cFZlcnNpb24oKVxuICAgICAgICBuZXdWZXJzaW9uSW5mbzogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9XG5cbiAgICBvbk9rQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH1cblxuICAgIG9uR29Ub1NldHRpbmdzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgb25TZXR1cENsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgJ1Jlc3RvcmUgQmFja3VwJywgJycsIFJlc3RvcmVLZXlCYWNrdXBEaWFsb2csIHtcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiB0aGlzLnByb3BzLm9uRmluaXNoZWQsXG4gICAgICAgICAgICB9LCBudWxsLCAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2dcIik7XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9uc1wiKTtcblxuICAgICAgICBjb25zdCB0aXRsZSA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X0tleUJhY2t1cEZhaWxlZERpYWxvZ190aXRsZVwiPlxuICAgICAgICAgICAge190KFwiTmV3IFJlY292ZXJ5IE1ldGhvZFwiKX1cbiAgICAgICAgPC9zcGFuPjtcblxuICAgICAgICBjb25zdCBuZXdNZXRob2REZXRlY3RlZCA9IDxwPntfdChcbiAgICAgICAgICAgIFwiQSBuZXcgU2VjdXJpdHkgUGhyYXNlIGFuZCBrZXkgZm9yIFNlY3VyZSBNZXNzYWdlcyBoYXZlIGJlZW4gZGV0ZWN0ZWQuXCIsXG4gICAgICAgICl9PC9wPjtcblxuICAgICAgICBjb25zdCBoYWNrV2FybmluZyA9IDxwIGNsYXNzTmFtZT1cIndhcm5pbmdcIj57X3QoXG4gICAgICAgICAgICBcIklmIHlvdSBkaWRuJ3Qgc2V0IHRoZSBuZXcgcmVjb3ZlcnkgbWV0aG9kLCBhbiBcIiArXG4gICAgICAgICAgICBcImF0dGFja2VyIG1heSBiZSB0cnlpbmcgdG8gYWNjZXNzIHlvdXIgYWNjb3VudC4gXCIgK1xuICAgICAgICAgICAgXCJDaGFuZ2UgeW91ciBhY2NvdW50IHBhc3N3b3JkIGFuZCBzZXQgYSBuZXcgcmVjb3ZlcnkgXCIgK1xuICAgICAgICAgICAgXCJtZXRob2QgaW1tZWRpYXRlbHkgaW4gU2V0dGluZ3MuXCIsXG4gICAgICAgICl9PC9wPjtcblxuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRLZXlCYWNrdXBFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIHtuZXdNZXRob2REZXRlY3RlZH1cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVGhpcyBzZXNzaW9uIGlzIGVuY3J5cHRpbmcgaGlzdG9yeSB1c2luZyB0aGUgbmV3IHJlY292ZXJ5IG1ldGhvZC5cIixcbiAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICB7aGFja1dhcm5pbmd9XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoXCJPS1wiKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25Pa0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b249e190KFwiR28gdG8gU2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uR29Ub1NldHRpbmdzQ2xpY2t9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIHtuZXdNZXRob2REZXRlY3RlZH1cbiAgICAgICAgICAgICAgICB7aGFja1dhcm5pbmd9XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoXCJTZXQgdXAgU2VjdXJlIE1lc3NhZ2VzXCIpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vblNldHVwQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbj17X3QoXCJHbyB0byBTZXR0aW5nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25Hb1RvU2V0dGluZ3NDbGlja31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT1cIm14X0tleUJhY2t1cEZhaWxlZERpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
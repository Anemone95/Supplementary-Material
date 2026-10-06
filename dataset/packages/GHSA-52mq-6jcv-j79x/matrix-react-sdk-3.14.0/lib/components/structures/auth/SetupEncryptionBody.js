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

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _SetupEncryptionStore = require("../../../stores/SetupEncryptionStore");

/*
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
function keyHasPassphrase(keyInfo) {
  return keyInfo.passphrase && keyInfo.passphrase.salt && keyInfo.passphrase.iterations;
}

class SetupEncryptionBody extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_onStoreUpdate", () => {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      if (store.phase === _SetupEncryptionStore.PHASE_FINISHED) {
        this.props.onFinished();
        return;
      }

      this.setState({
        phase: store.phase,
        verificationRequest: store.verificationRequest,
        backupInfo: store.backupInfo
      });
    });
    (0, _defineProperty2.default)(this, "_onUsePassphraseClick", async () => {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      store.usePassPhrase();
    });
    (0, _defineProperty2.default)(this, "onSkipClick", () => {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      store.skip();
    });
    (0, _defineProperty2.default)(this, "onSkipConfirmClick", () => {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      store.skipConfirm();
    });
    (0, _defineProperty2.default)(this, "onSkipBackClick", () => {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      store.returnAfterSkip();
    });
    (0, _defineProperty2.default)(this, "onDoneClick", () => {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      store.done();
    });

    const _store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

    _store.on("update", this._onStoreUpdate);

    _store.start();

    this.state = {
      phase: _store.phase,
      // this serves dual purpose as the object for the request logic and
      // the presence of it indicating that we're in 'verify mode'.
      // Because of the latter, it lives in the state.
      verificationRequest: _store.verificationRequest,
      backupInfo: _store.backupInfo
    };
  }

  componentWillUnmount() {
    const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

    store.off("update", this._onStoreUpdate);
    store.stop();
  }

  render() {
    const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
    const {
      phase
    } = this.state;

    if (this.state.verificationRequest) {
      const EncryptionPanel = sdk.getComponent("views.right_panel.EncryptionPanel");
      return /*#__PURE__*/_react.default.createElement(EncryptionPanel, {
        layout: "dialog",
        verificationRequest: this.state.verificationRequest,
        onClose: this.props.onFinished,
        member: _MatrixClientPeg.MatrixClientPeg.get().getUser(this.state.verificationRequest.otherUserId)
      });
    } else if (phase === _SetupEncryptionStore.PHASE_INTRO) {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      let recoveryKeyPrompt;

      if (store.keyInfo && keyHasPassphrase(store.keyInfo)) {
        recoveryKeyPrompt = (0, _languageHandler._t)("Use Security Key or Phrase");
      } else if (store.keyInfo) {
        recoveryKeyPrompt = (0, _languageHandler._t)("Use Security Key");
      }

      let useRecoveryKeyButton;

      if (recoveryKeyPrompt) {
        useRecoveryKeyButton = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          kind: "link",
          onClick: this._onUsePassphraseClick
        }, recoveryKeyPrompt);
      }

      const brand = _SdkConfig.default.get().brand;

      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Confirm your identity by verifying this login from one of your other sessions, " + "granting it access to encrypted messages.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This requires the latest %(brand)s on your other devices:", {
        brand
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CompleteSecurity_clients"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CompleteSecurity_clients_desktop"
      }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("%(brand)s Web", {
        brand
      })), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("%(brand)s Desktop", {
        brand
      }))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CompleteSecurity_clients_mobile"
      }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("%(brand)s iOS", {
        brand
      })), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("%(brand)s Android", {
        brand
      }))), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("or another cross-signing capable Matrix client"))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CompleteSecurity_actionRow"
      }, useRecoveryKeyButton, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "danger",
        onClick: this.onSkipClick
      }, (0, _languageHandler._t)("Skip"))));
    } else if (phase === _SetupEncryptionStore.PHASE_DONE) {
      let message;

      if (this.state.backupInfo) {
        message = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your new session is now verified. It has access to your " + "encrypted messages, and other users will see it as trusted."));
      } else {
        message = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your new session is now verified. Other users will see it as trusted."));
      }

      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CompleteSecurity_heroIcon mx_E2EIcon_verified"
      }), message, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CompleteSecurity_actionRow"
      }, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "primary",
        onClick: this.onDoneClick
      }, (0, _languageHandler._t)("Done"))));
    } else if (phase === _SetupEncryptionStore.PHASE_CONFIRM_SKIP) {
      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Without completing security on this session, it won’t have " + "access to encrypted messages.")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CompleteSecurity_actionRow"
      }, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: "warning",
        kind: "secondary",
        onClick: this.onSkipConfirmClick
      }, (0, _languageHandler._t)("Skip")), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "danger",
        onClick: this.onSkipBackClick
      }, (0, _languageHandler._t)("Go Back"))));
    } else if (phase === _SetupEncryptionStore.PHASE_BUSY) {
      const Spinner = sdk.getComponent('views.elements.Spinner');
      return /*#__PURE__*/_react.default.createElement(Spinner, null);
    } else {
      console.log(`SetupEncryptionBody: Unknown phase ${phase}`);
    }
  }

}

exports.default = SetupEncryptionBody;
(0, _defineProperty2.default)(SetupEncryptionBody, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvYXV0aC9TZXR1cEVuY3J5cHRpb25Cb2R5LmpzIl0sIm5hbWVzIjpbImtleUhhc1Bhc3NwaHJhc2UiLCJrZXlJbmZvIiwicGFzc3BocmFzZSIsInNhbHQiLCJpdGVyYXRpb25zIiwiU2V0dXBFbmNyeXB0aW9uQm9keSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJzdG9yZSIsIlNldHVwRW5jcnlwdGlvblN0b3JlIiwic2hhcmVkSW5zdGFuY2UiLCJwaGFzZSIsIlBIQVNFX0ZJTklTSEVEIiwicHJvcHMiLCJvbkZpbmlzaGVkIiwic2V0U3RhdGUiLCJ2ZXJpZmljYXRpb25SZXF1ZXN0IiwiYmFja3VwSW5mbyIsInVzZVBhc3NQaHJhc2UiLCJza2lwIiwic2tpcENvbmZpcm0iLCJyZXR1cm5BZnRlclNraXAiLCJkb25lIiwib24iLCJfb25TdG9yZVVwZGF0ZSIsInN0YXJ0Iiwic3RhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInN0b3AiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRW5jcnlwdGlvblBhbmVsIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0VXNlciIsIm90aGVyVXNlcklkIiwiUEhBU0VfSU5UUk8iLCJyZWNvdmVyeUtleVByb21wdCIsInVzZVJlY292ZXJ5S2V5QnV0dG9uIiwiX29uVXNlUGFzc3BocmFzZUNsaWNrIiwiYnJhbmQiLCJTZGtDb25maWciLCJvblNraXBDbGljayIsIlBIQVNFX0RPTkUiLCJtZXNzYWdlIiwib25Eb25lQ2xpY2siLCJQSEFTRV9DT05GSVJNX1NLSVAiLCJvblNraXBDb25maXJtQ2xpY2siLCJvblNraXBCYWNrQ2xpY2siLCJQSEFTRV9CVVNZIiwiU3Bpbm5lciIsImNvbnNvbGUiLCJsb2ciLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBw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QkFBRDtBQUNJLFFBQUEsSUFBSSxFQUFDLFNBRFQ7QUFFSSxRQUFBLE9BQU8sRUFBRSxLQUFLQztBQUZsQixTQUlLLHlCQUFHLE1BQUgsQ0FKTCxDQURKLENBSEosQ0FESjtBQWNILEtBMUJNLE1BMEJBLElBQUlyQyxLQUFLLEtBQUtzQyx3Q0FBZCxFQUFrQztBQUNyQywwQkFDSSx1REFDSSx3Q0FBSSx5QkFDQSxnRUFDQSwrQkFGQSxDQUFKLENBREosZUFLSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0ksNkJBQUMsZ0JBQUQ7QUFDSSxRQUFBLFNBQVMsRUFBQyxTQURkO0FBRUksUUFBQSxJQUFJLEVBQUMsV0FGVDtBQUdJLFFBQUEsT0FBTyxFQUFFLEtBQUtDO0FBSGxCLFNBS0sseUJBQUcsTUFBSCxDQUxMLENBREosZUFRSSw2QkFBQyxnQkFBRDtBQUNJLFFBQUEsSUFBSSxFQUFDLFFBRFQ7QUFFSSxRQUFBLE9BQU8sRUFBRSxLQUFLQztBQUZsQixTQUlLLHlCQUFHLFNBQUgsQ0FKTCxDQVJKLENBTEosQ0FESjtBQXVCSCxLQXhCTSxNQXdCQSxJQUFJeEMsS0FBSyxLQUFLeUMsZ0NBQWQsRUFBMEI7QUFDN0IsWUFBTUMsT0FBTyxHQUFHckIsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHdCQUFqQixDQUFoQjtBQUNBLDBCQUFPLDZCQUFDLE9BQUQsT0FBUDtBQUNILEtBSE0sTUFHQTtBQUNIcUIsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQWEsc0NBQXFDNUMsS0FBTSxFQUF4RDtBQUNIO0FBQ0o7O0FBeEw0RDs7OzhCQUE1Q1AsbUIsZUFDRTtBQUNmVSxFQUFBQSxVQUFVLEVBQUUwQyxtQkFBVUMsSUFBVixDQUFlQztBQURaLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtcbiAgICBTZXR1cEVuY3J5cHRpb25TdG9yZSxcbiAgICBQSEFTRV9JTlRSTyxcbiAgICBQSEFTRV9CVVNZLFxuICAgIFBIQVNFX0RPTkUsXG4gICAgUEhBU0VfQ09ORklSTV9TS0lQLFxuICAgIFBIQVNFX0ZJTklTSEVELFxufSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvU2V0dXBFbmNyeXB0aW9uU3RvcmUnO1xuXG5mdW5jdGlvbiBrZXlIYXNQYXNzcGhyYXNlKGtleUluZm8pIHtcbiAgICByZXR1cm4gKFxuICAgICAgICBrZXlJbmZvLnBhc3NwaHJhc2UgJiZcbiAgICAgICAga2V5SW5mby5wYXNzcGhyYXNlLnNhbHQgJiZcbiAgICAgICAga2V5SW5mby5wYXNzcGhyYXNlLml0ZXJhdGlvbnNcbiAgICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXR1cEVuY3J5cHRpb25Cb2R5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBTZXR1cEVuY3J5cHRpb25TdG9yZS5zaGFyZWRJbnN0YW5jZSgpO1xuICAgICAgICBzdG9yZS5vbihcInVwZGF0ZVwiLCB0aGlzLl9vblN0b3JlVXBkYXRlKTtcbiAgICAgICAgc3RvcmUuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBoYXNlOiBzdG9yZS5waGFzZSxcbiAgICAgICAgICAgIC8vIHRoaXMgc2VydmVzIGR1YWwgcHVycG9zZSBhcyB0aGUgb2JqZWN0IGZvciB0aGUgcmVxdWVzdCBsb2dpYyBhbmRcbiAgICAgICAgICAgIC8vIHRoZSBwcmVzZW5jZSBvZiBpdCBpbmRpY2F0aW5nIHRoYXQgd2UncmUgaW4gJ3ZlcmlmeSBtb2RlJy5cbiAgICAgICAgICAgIC8vIEJlY2F1c2Ugb2YgdGhlIGxhdHRlciwgaXQgbGl2ZXMgaW4gdGhlIHN0YXRlLlxuICAgICAgICAgICAgdmVyaWZpY2F0aW9uUmVxdWVzdDogc3RvcmUudmVyaWZpY2F0aW9uUmVxdWVzdCxcbiAgICAgICAgICAgIGJhY2t1cEluZm86IHN0b3JlLmJhY2t1cEluZm8sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX29uU3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gU2V0dXBFbmNyeXB0aW9uU3RvcmUuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgaWYgKHN0b3JlLnBoYXNlID09PSBQSEFTRV9GSU5JU0hFRCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogc3RvcmUucGhhc2UsXG4gICAgICAgICAgICB2ZXJpZmljYXRpb25SZXF1ZXN0OiBzdG9yZS52ZXJpZmljYXRpb25SZXF1ZXN0LFxuICAgICAgICAgICAgYmFja3VwSW5mbzogc3RvcmUuYmFja3VwSW5mbyxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjb25zdCBzdG9yZSA9IFNldHVwRW5jcnlwdGlvblN0b3JlLnNoYXJlZEluc3RhbmNlKCk7XG4gICAgICAgIHN0b3JlLm9mZihcInVwZGF0ZVwiLCB0aGlzLl9vblN0b3JlVXBkYXRlKTtcbiAgICAgICAgc3RvcmUuc3RvcCgpO1xuICAgIH1cblxuICAgIF9vblVzZVBhc3NwaHJhc2VDbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBTZXR1cEVuY3J5cHRpb25TdG9yZS5zaGFyZWRJbnN0YW5jZSgpO1xuICAgICAgICBzdG9yZS51c2VQYXNzUGhyYXNlKCk7XG4gICAgfVxuXG4gICAgb25Ta2lwQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gU2V0dXBFbmNyeXB0aW9uU3RvcmUuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgc3RvcmUuc2tpcCgpO1xuICAgIH1cblxuICAgIG9uU2tpcENvbmZpcm1DbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBTZXR1cEVuY3J5cHRpb25TdG9yZS5zaGFyZWRJbnN0YW5jZSgpO1xuICAgICAgICBzdG9yZS5za2lwQ29uZmlybSgpO1xuICAgIH1cblxuICAgIG9uU2tpcEJhY2tDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBTZXR1cEVuY3J5cHRpb25TdG9yZS5zaGFyZWRJbnN0YW5jZSgpO1xuICAgICAgICBzdG9yZS5yZXR1cm5BZnRlclNraXAoKTtcbiAgICB9XG5cbiAgICBvbkRvbmVDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBTZXR1cEVuY3J5cHRpb25TdG9yZS5zaGFyZWRJbnN0YW5jZSgpO1xuICAgICAgICBzdG9yZS5kb25lKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkFjY2Vzc2libGVCdXR0b25cIik7XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZlcmlmaWNhdGlvblJlcXVlc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IEVuY3J5cHRpb25QYW5lbCA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5yaWdodF9wYW5lbC5FbmNyeXB0aW9uUGFuZWxcIik7XG4gICAgICAgICAgICByZXR1cm4gPEVuY3J5cHRpb25QYW5lbFxuICAgICAgICAgICAgICAgIGxheW91dD1cImRpYWxvZ1wiXG4gICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uUmVxdWVzdD17dGhpcy5zdGF0ZS52ZXJpZmljYXRpb25SZXF1ZXN0fVxuICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICBtZW1iZXI9e01hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VyKHRoaXMuc3RhdGUudmVyaWZpY2F0aW9uUmVxdWVzdC5vdGhlclVzZXJJZCl9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfSBlbHNlIGlmIChwaGFzZSA9PT0gUEhBU0VfSU5UUk8pIHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gU2V0dXBFbmNyeXB0aW9uU3RvcmUuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgICAgIGxldCByZWNvdmVyeUtleVByb21wdDtcbiAgICAgICAgICAgIGlmIChzdG9yZS5rZXlJbmZvICYmIGtleUhhc1Bhc3NwaHJhc2Uoc3RvcmUua2V5SW5mbykpIHtcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleVByb21wdCA9IF90KFwiVXNlIFNlY3VyaXR5IEtleSBvciBQaHJhc2VcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0b3JlLmtleUluZm8pIHtcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleVByb21wdCA9IF90KFwiVXNlIFNlY3VyaXR5IEtleVwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHVzZVJlY292ZXJ5S2V5QnV0dG9uO1xuICAgICAgICAgICAgaWYgKHJlY292ZXJ5S2V5UHJvbXB0KSB7XG4gICAgICAgICAgICAgICAgdXNlUmVjb3ZlcnlLZXlCdXR0b24gPSA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua1wiIG9uQ2xpY2s9e3RoaXMuX29uVXNlUGFzc3BocmFzZUNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAge3JlY292ZXJ5S2V5UHJvbXB0fVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29uZmlybSB5b3VyIGlkZW50aXR5IGJ5IHZlcmlmeWluZyB0aGlzIGxvZ2luIGZyb20gb25lIG9mIHlvdXIgb3RoZXIgc2Vzc2lvbnMsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZ3JhbnRpbmcgaXQgYWNjZXNzIHRvIGVuY3J5cHRlZCBtZXNzYWdlcy5cIixcbiAgICAgICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyByZXF1aXJlcyB0aGUgbGF0ZXN0ICUoYnJhbmQpcyBvbiB5b3VyIG90aGVyIGRldmljZXM6XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGJyYW5kIH0sXG4gICAgICAgICAgICAgICAgICAgICl9PC9wPlxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ29tcGxldGVTZWN1cml0eV9jbGllbnRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NvbXBsZXRlU2VjdXJpdHlfY2xpZW50c19kZXNrdG9wXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj57X3QoXCIlKGJyYW5kKXMgV2ViXCIsIHsgYnJhbmQgfSl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj57X3QoXCIlKGJyYW5kKXMgRGVza3RvcFwiLCB7IGJyYW5kIH0pfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NvbXBsZXRlU2VjdXJpdHlfY2xpZW50c19tb2JpbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PntfdChcIiUoYnJhbmQpcyBpT1NcIiwgeyBicmFuZCB9KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PntfdChcIiUoYnJhbmQpcyBBbmRyb2lkXCIsIHsgYnJhbmQgfSl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPntfdChcIm9yIGFub3RoZXIgY3Jvc3Mtc2lnbmluZyBjYXBhYmxlIE1hdHJpeCBjbGllbnRcIil9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NvbXBsZXRlU2VjdXJpdHlfYWN0aW9uUm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dXNlUmVjb3ZlcnlLZXlCdXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwiZGFuZ2VyXCIgb25DbGljaz17dGhpcy5vblNraXBDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiU2tpcFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHBoYXNlID09PSBQSEFTRV9ET05FKSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmJhY2t1cEluZm8pIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIllvdXIgbmV3IHNlc3Npb24gaXMgbm93IHZlcmlmaWVkLiBJdCBoYXMgYWNjZXNzIHRvIHlvdXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImVuY3J5cHRlZCBtZXNzYWdlcywgYW5kIG90aGVyIHVzZXJzIHdpbGwgc2VlIGl0IGFzIHRydXN0ZWQuXCIsXG4gICAgICAgICAgICAgICAgKX08L3A+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIllvdXIgbmV3IHNlc3Npb24gaXMgbm93IHZlcmlmaWVkLiBPdGhlciB1c2VycyB3aWxsIHNlZSBpdCBhcyB0cnVzdGVkLlwiLFxuICAgICAgICAgICAgICAgICl9PC9wPjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Db21wbGV0ZVNlY3VyaXR5X2hlcm9JY29uIG14X0UyRUljb25fdmVyaWZpZWRcIiAvPlxuICAgICAgICAgICAgICAgICAgICB7bWVzc2FnZX1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Db21wbGV0ZVNlY3VyaXR5X2FjdGlvblJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkRvbmVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJEb25lXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAocGhhc2UgPT09IFBIQVNFX0NPTkZJUk1fU0tJUCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIldpdGhvdXQgY29tcGxldGluZyBzZWN1cml0eSBvbiB0aGlzIHNlc3Npb24sIGl0IHdvbuKAmXQgaGF2ZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImFjY2VzcyB0byBlbmNyeXB0ZWQgbWVzc2FnZXMuXCIsXG4gICAgICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NvbXBsZXRlU2VjdXJpdHlfYWN0aW9uUm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndhcm5pbmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJzZWNvbmRhcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Ta2lwQ29uZmlybUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlNraXBcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Ta2lwQmFja0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkdvIEJhY2tcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChwaGFzZSA9PT0gUEhBU0VfQlVTWSkge1xuICAgICAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLlNwaW5uZXInKTtcbiAgICAgICAgICAgIHJldHVybiA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTZXR1cEVuY3J5cHRpb25Cb2R5OiBVbmtub3duIHBoYXNlICR7cGhhc2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
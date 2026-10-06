"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _crypto = require("matrix-js-sdk/src/crypto");

var _QRCode = require("matrix-js-sdk/src/crypto/verification/QRCode");

var _VerificationQRCode = _interopRequireDefault(require("../elements/crypto/VerificationQRCode"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _E2EIcon = _interopRequireDefault(require("../rooms/E2EIcon"));

var _VerificationRequest = require("matrix-js-sdk/src/crypto/verification/request/VerificationRequest");

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

/*
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
// XXX: Should be defined in matrix-js-sdk
var VerificationPhase;

(function (VerificationPhase) {
  VerificationPhase[VerificationPhase["PHASE_UNSENT"] = 0] = "PHASE_UNSENT";
  VerificationPhase[VerificationPhase["PHASE_REQUESTED"] = 1] = "PHASE_REQUESTED";
  VerificationPhase[VerificationPhase["PHASE_READY"] = 2] = "PHASE_READY";
  VerificationPhase[VerificationPhase["PHASE_DONE"] = 3] = "PHASE_DONE";
  VerificationPhase[VerificationPhase["PHASE_STARTED"] = 4] = "PHASE_STARTED";
  VerificationPhase[VerificationPhase["PHASE_CANCELLED"] = 5] = "PHASE_CANCELLED";
})(VerificationPhase || (VerificationPhase = {}));

class VerificationPanel extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "hasVerifier", void 0);
    (0, _defineProperty2.default)(this, "onReciprocateYesClick", () => {
      this.setState({
        reciprocateButtonClicked: true
      });
      this.state.reciprocateQREvent.confirm();
    });
    (0, _defineProperty2.default)(this, "onReciprocateNoClick", () => {
      this.setState({
        reciprocateButtonClicked: true
      });
      this.state.reciprocateQREvent.cancel();
    });
    (0, _defineProperty2.default)(this, "startSAS", async () => {
      this.setState({
        emojiButtonClicked: true
      });
      const verifier = this.props.request.beginKeyVerification(_crypto.verificationMethods.SAS);

      try {
        await verifier.verify();
      } catch (err) {
        console.error(err);
      }
    });
    (0, _defineProperty2.default)(this, "onSasMatchesClick", () => {
      this.state.sasEvent.confirm();
    });
    (0, _defineProperty2.default)(this, "onSasMismatchesClick", () => {
      this.state.sasEvent.mismatch();
    });
    (0, _defineProperty2.default)(this, "updateVerifierState", () => {
      const {
        request
      } = this.props;
      const {
        sasEvent,
        reciprocateQREvent
      } = request.verifier;
      request.verifier.off('show_sas', this.updateVerifierState);
      request.verifier.off('show_reciprocate_qr', this.updateVerifierState);
      this.setState({
        sasEvent,
        reciprocateQREvent
      });
    });
    (0, _defineProperty2.default)(this, "onRequestChange", async () => {
      const {
        request
      } = this.props;
      const hadVerifier = this.hasVerifier;
      this.hasVerifier = !!request.verifier;

      if (!hadVerifier && this.hasVerifier) {
        request.verifier.on('show_sas', this.updateVerifierState);
        request.verifier.on('show_reciprocate_qr', this.updateVerifierState);

        try {
          // on the requester side, this is also awaited in startSAS,
          // but that's ok as verify should return the same promise.
          await request.verifier.verify();
        } catch (err) {
          console.error("error verify", err);
        }
      }
    });
    this.state = {};
    this.hasVerifier = false;
  }

  renderQRPhase() {
    const {
      member,
      request
    } = this.props;
    const showSAS
    /*: boolean*/
    = request.otherPartySupportsMethod(_crypto.verificationMethods.SAS);
    const showQR
    /*: boolean*/
    = request.otherPartySupportsMethod(_QRCode.SCAN_QR_CODE_METHOD);
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');

    const brand = _SdkConfig.default.get().brand;

    const noCommonMethodError
    /*: JSX.Element*/
    = !showSAS && !showQR ? /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("The session you are trying to verify doesn't support scanning a " + "QR code or emoji verification, which is what %(brand)s supports. Try " + "with a different client.", {
      brand
    })) : null;

    if (this.props.layout === 'dialog') {
      // HACK: This is a terrible idea.
      let qrBlockDialog
      /*: JSX.Element*/
      ;
      let sasBlockDialog
      /*: JSX.Element*/
      ;

      if (showQR) {
        qrBlockDialog = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_VerificationPanel_QRPhase_startOption"
        }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Scan this unique code")), /*#__PURE__*/_react.default.createElement(_VerificationQRCode.default, {
          qrCodeData: request.qrCodeData
        }));
      }

      if (showSAS) {
        sasBlockDialog = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_VerificationPanel_QRPhase_startOption"
        }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Compare unique emoji")), /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_VerificationPanel_QRPhase_helpText"
        }, (0, _languageHandler._t)("Compare a unique set of emoji if you don't have a camera on either device")), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          disabled: this.state.emojiButtonClicked,
          onClick: this.startSAS,
          kind: "primary"
        }, (0, _languageHandler._t)("Start")));
      }

      const or = qrBlockDialog && sasBlockDialog ? /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationPanel_QRPhase_betweenText"
      }, (0, _languageHandler._t)("or")) : null;
      return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Verify this session by completing one of the following:"), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationPanel_QRPhase_startOptions"
      }, qrBlockDialog, or, sasBlockDialog, noCommonMethodError));
    }

    let qrBlock
    /*: JSX.Element*/
    ;

    if (showQR) {
      qrBlock = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserInfo_container"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verify by scanning")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Ask %(displayName)s to scan your code:", {
        displayName: member.displayName || member.name || member.userId
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationPanel_qrCode"
      }, /*#__PURE__*/_react.default.createElement(_VerificationQRCode.default, {
        qrCodeData: request.qrCodeData
      })));
    }

    let sasBlock
    /*: JSX.Element*/
    ;

    if (showSAS) {
      const disabled = this.state.emojiButtonClicked;
      const sasLabel = showQR ? (0, _languageHandler._t)("If you can't scan the code above, verify by comparing unique emoji.") : (0, _languageHandler._t)("Verify by comparing unique emoji."); // Note: mx_VerificationPanel_verifyByEmojiButton is for the end-to-end tests

      sasBlock = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserInfo_container"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verify by emoji")), /*#__PURE__*/_react.default.createElement("p", null, sasLabel), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        disabled: disabled,
        kind: "primary",
        className: "mx_UserInfo_wideButton mx_VerificationPanel_verifyByEmojiButton",
        onClick: this.startSAS
      }, (0, _languageHandler._t)("Verify by emoji")));
    }

    const noCommonMethodBlock = noCommonMethodError ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_container"
    }, noCommonMethodError) : null; // TODO: add way to open camera to scan a QR code

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, qrBlock, sasBlock, noCommonMethodBlock);
  }

  getDevice() {
    const deviceId = this.props.request && this.props.request.channel.deviceId;
    return _MatrixClientPeg.MatrixClientPeg.get().getStoredDevice(_MatrixClientPeg.MatrixClientPeg.get().getUserId(), deviceId);
  }

  renderQRReciprocatePhase() {
    const {
      member,
      request
    } = this.props;
    let Button; // a bit of a hack, but the FormButton should only be used in the right panel
    // they should probably just be the same component with a css class applied to it?

    if (this.props.inDialog) {
      Button = sdk.getComponent("elements.AccessibleButton");
    } else {
      Button = sdk.getComponent("elements.FormButton");
    }

    const description = request.isSelfVerification ? (0, _languageHandler._t)("Almost there! Is your other session showing the same shield?") : (0, _languageHandler._t)("Almost there! Is %(displayName)s showing the same shield?", {
      displayName: member.displayName || member.name || member.userId
    });
    let body
    /*: JSX.Element*/
    ;

    if (this.state.reciprocateQREvent) {
      // Element Web doesn't support scanning yet, so assume here we're the client being scanned.
      //
      // we're passing both a label and a child string to Button as
      // FormButton and AccessibleButton expect this differently
      body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, description), /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
        isUser: true,
        status: "verified",
        size: 128,
        hideTooltip: true
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationPanel_reciprocateButtons"
      }, /*#__PURE__*/_react.default.createElement(Button, {
        label: (0, _languageHandler._t)("No"),
        kind: "danger",
        disabled: this.state.reciprocateButtonClicked,
        onClick: this.onReciprocateNoClick
      }, (0, _languageHandler._t)("No")), /*#__PURE__*/_react.default.createElement(Button, {
        label: (0, _languageHandler._t)("Yes"),
        kind: "primary",
        disabled: this.state.reciprocateButtonClicked,
        onClick: this.onReciprocateYesClick
      }, (0, _languageHandler._t)("Yes"))));
    } else {
      body = /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_container mx_VerificationPanel_reciprocate_section"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verify by scanning")), body);
  }

  renderVerifiedPhase() {
    const {
      member,
      request
    } = this.props;
    let text
    /*: string*/
    ;

    if (!request.isSelfVerification) {
      if (this.props.isRoomEncrypted) {
        text = (0, _languageHandler._t)("Verify all users in a room to ensure it's secure.");
      } else {
        text = (0, _languageHandler._t)("In encrypted rooms, verify all users to ensure it’s secure.");
      }
    }

    let description
    /*: string*/
    ;

    if (request.isSelfVerification) {
      const device = this.getDevice();

      if (!device) {
        // This can happen if the device is logged out while we're still showing verification
        // UI for it.
        console.warn("Verified device we don't know about: " + this.props.request.channel.deviceId);
        description = (0, _languageHandler._t)("You've successfully verified your device!");
      } else {
        description = (0, _languageHandler._t)("You've successfully verified %(deviceName)s (%(deviceId)s)!", {
          deviceName: device ? device.getDisplayName() : '',
          deviceId: this.props.request.channel.deviceId
        });
      }
    } else {
      description = (0, _languageHandler._t)("You've successfully verified %(displayName)s!", {
        displayName: member.displayName || member.name || member.userId
      });
    }

    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_container mx_VerificationPanel_verified_section"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verified")), /*#__PURE__*/_react.default.createElement("p", null, description), /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
      isUser: true,
      status: "verified",
      size: 128,
      hideTooltip: true
    }), text ? /*#__PURE__*/_react.default.createElement("p", null, text) : null, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      kind: "primary",
      className: "mx_UserInfo_wideButton",
      onClick: this.props.onClose
    }, (0, _languageHandler._t)("Got it")));
  }

  renderCancelledPhase() {
    const {
      member,
      request
    } = this.props;
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    let startAgainInstruction
    /*: string*/
    ;

    if (request.isSelfVerification) {
      startAgainInstruction = (0, _languageHandler._t)("Start verification again from the notification.");
    } else {
      startAgainInstruction = (0, _languageHandler._t)("Start verification again from their profile.");
    }

    let text
    /*: string*/
    ;

    if (request.cancellationCode === "m.timeout") {
      text = (0, _languageHandler._t)("Verification timed out.") + ` ${startAgainInstruction}`;
    } else if (request.cancellingUserId === request.otherUserId) {
      if (request.isSelfVerification) {
        text = (0, _languageHandler._t)("You cancelled verification on your other session.");
      } else {
        text = (0, _languageHandler._t)("%(displayName)s cancelled verification.", {
          displayName: member.displayName || member.name || member.userId
        });
      }

      text = `${text} ${startAgainInstruction}`;
    } else {
      text = (0, _languageHandler._t)("You cancelled verification.") + ` ${startAgainInstruction}`;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_container"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verification cancelled")), /*#__PURE__*/_react.default.createElement("p", null, text), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      kind: "primary",
      className: "mx_UserInfo_wideButton",
      onClick: this.props.onClose
    }, (0, _languageHandler._t)("Got it")));
  }

  render() {
    const {
      member,
      phase,
      request
    } = this.props;
    const displayName = member.displayName || member.name || member.userId;

    switch (phase) {
      case _VerificationRequest.PHASE_READY:
        return this.renderQRPhase();

      case _VerificationRequest.PHASE_STARTED:
        switch (request.chosenMethod) {
          case _crypto.verificationMethods.RECIPROCATE_QR_CODE:
            return this.renderQRReciprocatePhase();

          case _crypto.verificationMethods.SAS:
            {
              const VerificationShowSas = sdk.getComponent('views.verification.VerificationShowSas');
              const emojis = this.state.sasEvent ? /*#__PURE__*/_react.default.createElement(VerificationShowSas, {
                displayName: displayName,
                device: this.getDevice(),
                sas: this.state.sasEvent.sas,
                onCancel: this.onSasMismatchesClick,
                onDone: this.onSasMatchesClick,
                inDialog: this.props.inDialog,
                isSelf: request.isSelfVerification
              }) : /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
              return /*#__PURE__*/_react.default.createElement("div", {
                className: "mx_UserInfo_container"
              }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Compare emoji")), emojis);
            }

          default:
            return null;
        }

      case _VerificationRequest.PHASE_DONE:
        return this.renderVerifiedPhase();

      case _VerificationRequest.PHASE_CANCELLED:
        return this.renderCancelledPhase();
    }

    console.error("VerificationPanel unhandled phase:", phase);
    return null;
  }

  componentDidMount() {
    const {
      request
    } = this.props;
    request.on("change", this.onRequestChange);

    if (request.verifier) {
      const {
        sasEvent,
        reciprocateQREvent
      } = request.verifier;
      this.setState({
        sasEvent,
        reciprocateQREvent
      });
    }

    this.onRequestChange();
  }

  componentWillUnmount() {
    const {
      request
    } = this.props;

    if (request.verifier) {
      request.verifier.off('show_sas', this.updateVerifierState);
      request.verifier.off('show_reciprocate_qr', this.updateVerifierState);
    }

    request.off("change", this.onRequestChange);
  }

}

exports.default = VerificationPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3JpZ2h0X3BhbmVsL1ZlcmlmaWNhdGlvblBhbmVsLnRzeCJdLCJuYW1lcyI6WyJWZXJpZmljYXRpb25QaGFzZSIsIlZlcmlmaWNhdGlvblBhbmVsIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNldFN0YXRlIiwicmVjaXByb2NhdGVCdXR0b25DbGlja2VkIiwic3RhdGUiLCJyZWNpcHJvY2F0ZVFSRXZlbnQiLCJjb25maXJtIiwiY2FuY2VsIiwiZW1vamlCdXR0b25DbGlja2VkIiwidmVyaWZpZXIiLCJyZXF1ZXN0IiwiYmVnaW5LZXlWZXJpZmljYXRpb24iLCJ2ZXJpZmljYXRpb25NZXRob2RzIiwiU0FTIiwidmVyaWZ5IiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwic2FzRXZlbnQiLCJtaXNtYXRjaCIsIm9mZiIsInVwZGF0ZVZlcmlmaWVyU3RhdGUiLCJoYWRWZXJpZmllciIsImhhc1ZlcmlmaWVyIiwib24iLCJyZW5kZXJRUlBoYXNlIiwibWVtYmVyIiwic2hvd1NBUyIsIm90aGVyUGFydHlTdXBwb3J0c01ldGhvZCIsInNob3dRUiIsIlNDQU5fUVJfQ09ERV9NRVRIT0QiLCJBY2Nlc3NpYmxlQnV0dG9uIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiYnJhbmQiLCJTZGtDb25maWciLCJnZXQiLCJub0NvbW1vbk1ldGhvZEVycm9yIiwibGF5b3V0IiwicXJCbG9ja0RpYWxvZyIsInNhc0Jsb2NrRGlhbG9nIiwicXJDb2RlRGF0YSIsInN0YXJ0U0FTIiwib3IiLCJxckJsb2NrIiwiZGlzcGxheU5hbWUiLCJuYW1lIiwidXNlcklkIiwic2FzQmxvY2siLCJkaXNhYmxlZCIsInNhc0xhYmVsIiwibm9Db21tb25NZXRob2RCbG9jayIsImdldERldmljZSIsImRldmljZUlkIiwiY2hhbm5lbCIsIk1hdHJpeENsaWVudFBlZyIsImdldFN0b3JlZERldmljZSIsImdldFVzZXJJZCIsInJlbmRlclFSUmVjaXByb2NhdGVQaGFzZSIsIkJ1dHRvbiIsImluRGlhbG9nIiwiZGVzY3JpcHRpb24iLCJpc1NlbGZWZXJpZmljYXRpb24iLCJib2R5Iiwib25SZWNpcHJvY2F0ZU5vQ2xpY2siLCJvblJlY2lwcm9jYXRlWWVzQ2xpY2siLCJyZW5kZXJWZXJpZmllZFBoYXNlIiwidGV4dCIsImlzUm9vbUVuY3J5cHRlZCIsImRldmljZSIsIndhcm4iLCJkZXZpY2VOYW1lIiwiZ2V0RGlzcGxheU5hbWUiLCJvbkNsb3NlIiwicmVuZGVyQ2FuY2VsbGVkUGhhc2UiLCJzdGFydEFnYWluSW5zdHJ1Y3Rpb24iLCJjYW5jZWxsYXRpb25Db2RlIiwiY2FuY2VsbGluZ1VzZXJJZCIsIm90aGVyVXNlcklkIiwicmVuZGVyIiwicGhhc2UiLCJQSEFTRV9SRUFEWSIsIlBIQVNFX1NUQVJURUQiLCJjaG9zZW5NZXRob2QiLCJSRUNJUFJPQ0FURV9RUl9DT0RFIiwiVmVyaWZpY2F0aW9uU2hvd1NhcyIsImVtb2ppcyIsInNhcyIsIm9uU2FzTWlzbWF0Y2hlc0NsaWNrIiwib25TYXNNYXRjaGVzQ2xpY2siLCJQSEFTRV9ET05FIiwiUEhBU0VfQ0FOQ0VMTEVEIiwiY29tcG9uZW50RGlkTW91bnQiLCJvblJlcXVlc3RDaGFuZ2UiLCJjb21wb25lbnRXaWxsVW5tb3VudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFNQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFNQTs7QUFyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBeUJBO0lBQ0tBLGlCOztXQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFB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QVgsTUFBQUEsT0FBTyxDQUFDRCxRQUFSLENBQWlCVyxHQUFqQixDQUFxQixxQkFBckIsRUFBNEMsS0FBS0MsbUJBQWpEO0FBQ0g7O0FBQ0RYLElBQUFBLE9BQU8sQ0FBQ1UsR0FBUixDQUFZLFFBQVosRUFBc0IsS0FBS3lFLGVBQTNCO0FBQ0g7O0FBcFc4RSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQge3ZlcmlmaWNhdGlvbk1ldGhvZHN9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NyeXB0byc7XG5pbXBvcnQge1NDQU5fUVJfQ09ERV9NRVRIT0R9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vdmVyaWZpY2F0aW9uL1FSQ29kZVwiO1xuaW1wb3J0IHtWZXJpZmljYXRpb25SZXF1ZXN0fSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL3ZlcmlmaWNhdGlvbi9yZXF1ZXN0L1ZlcmlmaWNhdGlvblJlcXVlc3RcIjtcbmltcG9ydCB7Um9vbU1lbWJlcn0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHtSZWNpcHJvY2F0ZVFSQ29kZX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vUVJDb2RlXCI7XG5pbXBvcnQge1NBU30gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vU0FTXCI7XG5cbmltcG9ydCBWZXJpZmljYXRpb25RUkNvZGUgZnJvbSBcIi4uL2VsZW1lbnRzL2NyeXB0by9WZXJpZmljYXRpb25RUkNvZGVcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IEUyRUljb24gZnJvbSBcIi4uL3Jvb21zL0UyRUljb25cIjtcbmltcG9ydCB7XG4gICAgUEhBU0VfUkVBRFksXG4gICAgUEhBU0VfRE9ORSxcbiAgICBQSEFTRV9TVEFSVEVELFxuICAgIFBIQVNFX0NBTkNFTExFRCxcbn0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vcmVxdWVzdC9WZXJpZmljYXRpb25SZXF1ZXN0XCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuXG4vLyBYWFg6IFNob3VsZCBiZSBkZWZpbmVkIGluIG1hdHJpeC1qcy1zZGtcbmVudW0gVmVyaWZpY2F0aW9uUGhhc2Uge1xuICAgIFBIQVNFX1VOU0VOVCxcbiAgICBQSEFTRV9SRVFVRVNURUQsXG4gICAgUEhBU0VfUkVBRFksXG4gICAgUEhBU0VfRE9ORSxcbiAgICBQSEFTRV9TVEFSVEVELFxuICAgIFBIQVNFX0NBTkNFTExFRCxcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbGF5b3V0OiBzdHJpbmc7XG4gICAgcmVxdWVzdDogVmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICBtZW1iZXI6IFJvb21NZW1iZXI7XG4gICAgcGhhc2U6IFZlcmlmaWNhdGlvblBoYXNlO1xuICAgIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG4gICAgaXNSb29tRW5jcnlwdGVkOiBib29sZWFuO1xuICAgIGluRGlhbG9nOiBib29sZWFuO1xuICAgIGtleTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzYXNFdmVudD86IFNBUztcbiAgICBlbW9qaUJ1dHRvbkNsaWNrZWQ/OiBib29sZWFuO1xuICAgIHJlY2lwcm9jYXRlQnV0dG9uQ2xpY2tlZD86IGJvb2xlYW47XG4gICAgcmVjaXByb2NhdGVRUkV2ZW50PzogUmVjaXByb2NhdGVRUkNvZGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlcmlmaWNhdGlvblBhbmVsIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgaGFzVmVyaWZpZXI6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgICAgICB0aGlzLmhhc1ZlcmlmaWVyID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJRUlBoYXNlKCkge1xuICAgICAgICBjb25zdCB7bWVtYmVyLCByZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHNob3dTQVM6IGJvb2xlYW4gPSByZXF1ZXN0Lm90aGVyUGFydHlTdXBwb3J0c01ldGhvZCh2ZXJpZmljYXRpb25NZXRob2RzLlNBUyk7XG4gICAgICAgIGNvbnN0IHNob3dRUjogYm9vbGVhbiA9IHJlcXVlc3Qub3RoZXJQYXJ0eVN1cHBvcnRzTWV0aG9kKFNDQU5fUVJfQ09ERV9NRVRIT0QpO1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcblxuICAgICAgICBjb25zdCBub0NvbW1vbk1ldGhvZEVycm9yOiBKU1guRWxlbWVudCA9ICFzaG93U0FTICYmICFzaG93UVIgP1xuICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgIFwiVGhlIHNlc3Npb24geW91IGFyZSB0cnlpbmcgdG8gdmVyaWZ5IGRvZXNuJ3Qgc3VwcG9ydCBzY2FubmluZyBhIFwiICtcbiAgICAgICAgICAgICAgICBcIlFSIGNvZGUgb3IgZW1vamkgdmVyaWZpY2F0aW9uLCB3aGljaCBpcyB3aGF0ICUoYnJhbmQpcyBzdXBwb3J0cy4gVHJ5IFwiICtcbiAgICAgICAgICAgICAgICBcIndpdGggYSBkaWZmZXJlbnQgY2xpZW50LlwiLFxuICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICl9PC9wPiA6XG4gICAgICAgICAgICBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmxheW91dCA9PT0gJ2RpYWxvZycpIHtcbiAgICAgICAgICAgIC8vIEhBQ0s6IFRoaXMgaXMgYSB0ZXJyaWJsZSBpZGVhLlxuICAgICAgICAgICAgbGV0IHFyQmxvY2tEaWFsb2c6IEpTWC5FbGVtZW50O1xuICAgICAgICAgICAgbGV0IHNhc0Jsb2NrRGlhbG9nOiBKU1guRWxlbWVudDtcbiAgICAgICAgICAgIGlmIChzaG93UVIpIHtcbiAgICAgICAgICAgICAgICBxckJsb2NrRGlhbG9nID1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1ZlcmlmaWNhdGlvblBhbmVsX1FSUGhhc2Vfc3RhcnRPcHRpb24nPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+e190KFwiU2NhbiB0aGlzIHVuaXF1ZSBjb2RlXCIpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxWZXJpZmljYXRpb25RUkNvZGUgcXJDb2RlRGF0YT17cmVxdWVzdC5xckNvZGVEYXRhfSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2hvd1NBUykge1xuICAgICAgICAgICAgICAgIHNhc0Jsb2NrRGlhbG9nID0gPGRpdiBjbGFzc05hbWU9J214X1ZlcmlmaWNhdGlvblBhbmVsX1FSUGhhc2Vfc3RhcnRPcHRpb24nPlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXCJDb21wYXJlIHVuaXF1ZSBlbW9qaVwiKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfVmVyaWZpY2F0aW9uUGFuZWxfUVJQaGFzZV9oZWxwVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJDb21wYXJlIGEgdW5pcXVlIHNldCBvZiBlbW9qaSBpZiB5b3UgZG9uJ3QgaGF2ZSBhIGNhbWVyYSBvbiBlaXRoZXIgZGV2aWNlXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGRpc2FibGVkPXt0aGlzLnN0YXRlLmVtb2ppQnV0dG9uQ2xpY2tlZH0gb25DbGljaz17dGhpcy5zdGFydFNBU30ga2luZD0ncHJpbWFyeSc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJTdGFydFwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9yID0gcXJCbG9ja0RpYWxvZyAmJiBzYXNCbG9ja0RpYWxvZyA/XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1ZlcmlmaWNhdGlvblBhbmVsX1FSUGhhc2VfYmV0d2VlblRleHQnPntfdChcIm9yXCIpfTwvZGl2PiA6IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlZlcmlmeSB0aGlzIHNlc3Npb24gYnkgY29tcGxldGluZyBvbmUgb2YgdGhlIGZvbGxvd2luZzpcIil9XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9WZXJpZmljYXRpb25QYW5lbF9RUlBoYXNlX3N0YXJ0T3B0aW9ucyc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cXJCbG9ja0RpYWxvZ31cbiAgICAgICAgICAgICAgICAgICAgICAgIHtvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzYXNCbG9ja0RpYWxvZ31cbiAgICAgICAgICAgICAgICAgICAgICAgIHtub0NvbW1vbk1ldGhvZEVycm9yfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcXJCbG9jazogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChzaG93UVIpIHtcbiAgICAgICAgICAgIHFyQmxvY2sgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxoMz57X3QoXCJWZXJpZnkgYnkgc2Nhbm5pbmdcIil9PC9oMz5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJBc2sgJShkaXNwbGF5TmFtZSlzIHRvIHNjYW4geW91ciBjb2RlOlwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBtZW1iZXIuZGlzcGxheU5hbWUgfHwgbWVtYmVyLm5hbWUgfHwgbWVtYmVyLnVzZXJJZCxcbiAgICAgICAgICAgICAgICB9KX08L3A+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1ZlcmlmaWNhdGlvblBhbmVsX3FyQ29kZVwiPlxuICAgICAgICAgICAgICAgICAgICA8VmVyaWZpY2F0aW9uUVJDb2RlIHFyQ29kZURhdGE9e3JlcXVlc3QucXJDb2RlRGF0YX0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzYXNCbG9jazogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChzaG93U0FTKSB7XG4gICAgICAgICAgICBjb25zdCBkaXNhYmxlZCA9IHRoaXMuc3RhdGUuZW1vamlCdXR0b25DbGlja2VkO1xuICAgICAgICAgICAgY29uc3Qgc2FzTGFiZWwgPSBzaG93UVIgP1xuICAgICAgICAgICAgICAgIF90KFwiSWYgeW91IGNhbid0IHNjYW4gdGhlIGNvZGUgYWJvdmUsIHZlcmlmeSBieSBjb21wYXJpbmcgdW5pcXVlIGVtb2ppLlwiKSA6XG4gICAgICAgICAgICAgICAgX3QoXCJWZXJpZnkgYnkgY29tcGFyaW5nIHVuaXF1ZSBlbW9qaS5cIik7XG5cbiAgICAgICAgICAgIC8vIE5vdGU6IG14X1ZlcmlmaWNhdGlvblBhbmVsX3ZlcmlmeUJ5RW1vamlCdXR0b24gaXMgZm9yIHRoZSBlbmQtdG8tZW5kIHRlc3RzXG4gICAgICAgICAgICBzYXNCbG9jayA9IDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGgzPntfdChcIlZlcmlmeSBieSBlbW9qaVwiKX08L2gzPlxuICAgICAgICAgICAgICAgIDxwPntzYXNMYWJlbH08L3A+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3dpZGVCdXR0b24gbXhfVmVyaWZpY2F0aW9uUGFuZWxfdmVyaWZ5QnlFbW9qaUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuc3RhcnRTQVN9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJWZXJpZnkgYnkgZW1vamlcIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgbm9Db21tb25NZXRob2RCbG9jayA9IG5vQ29tbW9uTWV0aG9kRXJyb3IgP1xuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJcIj57bm9Db21tb25NZXRob2RFcnJvcn08L2Rpdj4gOlxuICAgICAgICAgICAgbnVsbDtcblxuICAgICAgICAvLyBUT0RPOiBhZGQgd2F5IHRvIG9wZW4gY2FtZXJhIHRvIHNjYW4gYSBRUiBjb2RlXG4gICAgICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICB7cXJCbG9ja31cbiAgICAgICAgICAgIHtzYXNCbG9ja31cbiAgICAgICAgICAgIHtub0NvbW1vbk1ldGhvZEJsb2NrfVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmVjaXByb2NhdGVZZXNDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVjaXByb2NhdGVCdXR0b25DbGlja2VkOiB0cnVlfSk7XG4gICAgICAgIHRoaXMuc3RhdGUucmVjaXByb2NhdGVRUkV2ZW50LmNvbmZpcm0oKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlY2lwcm9jYXRlTm9DbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVjaXByb2NhdGVCdXR0b25DbGlja2VkOiB0cnVlfSk7XG4gICAgICAgIHRoaXMuc3RhdGUucmVjaXByb2NhdGVRUkV2ZW50LmNhbmNlbCgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldERldmljZSgpIHtcbiAgICAgICAgY29uc3QgZGV2aWNlSWQgPSB0aGlzLnByb3BzLnJlcXVlc3QgJiYgdGhpcy5wcm9wcy5yZXF1ZXN0LmNoYW5uZWwuZGV2aWNlSWQ7XG4gICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0U3RvcmVkRGV2aWNlKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSwgZGV2aWNlSWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUVJSZWNpcHJvY2F0ZVBoYXNlKCkge1xuICAgICAgICBjb25zdCB7bWVtYmVyLCByZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGxldCBCdXR0b247XG4gICAgICAgIC8vIGEgYml0IG9mIGEgaGFjaywgYnV0IHRoZSBGb3JtQnV0dG9uIHNob3VsZCBvbmx5IGJlIHVzZWQgaW4gdGhlIHJpZ2h0IHBhbmVsXG4gICAgICAgIC8vIHRoZXkgc2hvdWxkIHByb2JhYmx5IGp1c3QgYmUgdGhlIHNhbWUgY29tcG9uZW50IHdpdGggYSBjc3MgY2xhc3MgYXBwbGllZCB0byBpdD9cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaW5EaWFsb2cpIHtcbiAgICAgICAgICAgIEJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQnV0dG9uID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkZvcm1CdXR0b25cIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSByZXF1ZXN0LmlzU2VsZlZlcmlmaWNhdGlvbiA/XG4gICAgICAgICAgICBfdChcIkFsbW9zdCB0aGVyZSEgSXMgeW91ciBvdGhlciBzZXNzaW9uIHNob3dpbmcgdGhlIHNhbWUgc2hpZWxkP1wiKSA6XG4gICAgICAgICAgICBfdChcIkFsbW9zdCB0aGVyZSEgSXMgJShkaXNwbGF5TmFtZSlzIHNob3dpbmcgdGhlIHNhbWUgc2hpZWxkP1wiLCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IG1lbWJlci5kaXNwbGF5TmFtZSB8fCBtZW1iZXIubmFtZSB8fCBtZW1iZXIudXNlcklkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGxldCBib2R5OiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVjaXByb2NhdGVRUkV2ZW50KSB7XG4gICAgICAgICAgICAvLyBFbGVtZW50IFdlYiBkb2Vzbid0IHN1cHBvcnQgc2Nhbm5pbmcgeWV0LCBzbyBhc3N1bWUgaGVyZSB3ZSdyZSB0aGUgY2xpZW50IGJlaW5nIHNjYW5uZWQuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gd2UncmUgcGFzc2luZyBib3RoIGEgbGFiZWwgYW5kIGEgY2hpbGQgc3RyaW5nIHRvIEJ1dHRvbiBhc1xuICAgICAgICAgICAgLy8gRm9ybUJ1dHRvbiBhbmQgQWNjZXNzaWJsZUJ1dHRvbiBleHBlY3QgdGhpcyBkaWZmZXJlbnRseVxuICAgICAgICAgICAgYm9keSA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8cD57ZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgICAgIDxFMkVJY29uIGlzVXNlcj17dHJ1ZX0gc3RhdHVzPVwidmVyaWZpZWRcIiBzaXplPXsxMjh9IGhpZGVUb29sdGlwPXt0cnVlfSAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uUGFuZWxfcmVjaXByb2NhdGVCdXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk5vXCIpfSBraW5kPVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnJlY2lwcm9jYXRlQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZWNpcHJvY2F0ZU5vQ2xpY2t9PntfdChcIk5vXCIpfTwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJZZXNcIil9IGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnJlY2lwcm9jYXRlQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZWNpcHJvY2F0ZVllc0NsaWNrfT57X3QoXCJZZXNcIil9PC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSA8cD48U3Bpbm5lciAvPjwvcD47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyIG14X1ZlcmlmaWNhdGlvblBhbmVsX3JlY2lwcm9jYXRlX3NlY3Rpb25cIj5cbiAgICAgICAgICAgIDxoMz57X3QoXCJWZXJpZnkgYnkgc2Nhbm5pbmdcIil9PC9oMz5cbiAgICAgICAgICAgIHsgYm9keSB9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclZlcmlmaWVkUGhhc2UoKSB7XG4gICAgICAgIGNvbnN0IHttZW1iZXIsIHJlcXVlc3R9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICBsZXQgdGV4dDogc3RyaW5nO1xuICAgICAgICBpZiAoIXJlcXVlc3QuaXNTZWxmVmVyaWZpY2F0aW9uKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5pc1Jvb21FbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJWZXJpZnkgYWxsIHVzZXJzIGluIGEgcm9vbSB0byBlbnN1cmUgaXQncyBzZWN1cmUuXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJJbiBlbmNyeXB0ZWQgcm9vbXMsIHZlcmlmeSBhbGwgdXNlcnMgdG8gZW5zdXJlIGl04oCZcyBzZWN1cmUuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgICAgIGlmIChyZXF1ZXN0LmlzU2VsZlZlcmlmaWNhdGlvbikge1xuICAgICAgICAgICAgY29uc3QgZGV2aWNlID0gdGhpcy5nZXREZXZpY2UoKTtcbiAgICAgICAgICAgIGlmICghZGV2aWNlKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZSBkZXZpY2UgaXMgbG9nZ2VkIG91dCB3aGlsZSB3ZSdyZSBzdGlsbCBzaG93aW5nIHZlcmlmaWNhdGlvblxuICAgICAgICAgICAgICAgIC8vIFVJIGZvciBpdC5cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJWZXJpZmllZCBkZXZpY2Ugd2UgZG9uJ3Qga25vdyBhYm91dDogXCIgKyB0aGlzLnByb3BzLnJlcXVlc3QuY2hhbm5lbC5kZXZpY2VJZCk7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIllvdSd2ZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgeW91ciBkZXZpY2UhXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiWW91J3ZlIHN1Y2Nlc3NmdWxseSB2ZXJpZmllZCAlKGRldmljZU5hbWUpcyAoJShkZXZpY2VJZClzKSFcIiwge1xuICAgICAgICAgICAgICAgICAgICBkZXZpY2VOYW1lOiBkZXZpY2UgPyBkZXZpY2UuZ2V0RGlzcGxheU5hbWUoKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VJZDogdGhpcy5wcm9wcy5yZXF1ZXN0LmNoYW5uZWwuZGV2aWNlSWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiWW91J3ZlIHN1Y2Nlc3NmdWxseSB2ZXJpZmllZCAlKGRpc3BsYXlOYW1lKXMhXCIsIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogbWVtYmVyLmRpc3BsYXlOYW1lIHx8IG1lbWJlci5uYW1lIHx8IG1lbWJlci51c2VySWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lciBteF9WZXJpZmljYXRpb25QYW5lbF92ZXJpZmllZF9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPGgzPntfdChcIlZlcmlmaWVkXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgPHA+e2Rlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICA8RTJFSWNvbiBpc1VzZXI9e3RydWV9IHN0YXR1cz1cInZlcmlmaWVkXCIgc2l6ZT17MTI4fSBoaWRlVG9vbHRpcD17dHJ1ZX0gLz5cbiAgICAgICAgICAgICAgICB7IHRleHQgPyA8cD57IHRleHQgfTwvcD4gOiBudWxsIH1cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3dpZGVCdXR0b25cIiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xvc2V9PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJHb3QgaXRcIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJDYW5jZWxsZWRQaGFzZSgpIHtcbiAgICAgICAgY29uc3Qge21lbWJlciwgcmVxdWVzdH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG5cbiAgICAgICAgbGV0IHN0YXJ0QWdhaW5JbnN0cnVjdGlvbjogc3RyaW5nO1xuICAgICAgICBpZiAocmVxdWVzdC5pc1NlbGZWZXJpZmljYXRpb24pIHtcbiAgICAgICAgICAgIHN0YXJ0QWdhaW5JbnN0cnVjdGlvbiA9IF90KFwiU3RhcnQgdmVyaWZpY2F0aW9uIGFnYWluIGZyb20gdGhlIG5vdGlmaWNhdGlvbi5cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGFydEFnYWluSW5zdHJ1Y3Rpb24gPSBfdChcIlN0YXJ0IHZlcmlmaWNhdGlvbiBhZ2FpbiBmcm9tIHRoZWlyIHByb2ZpbGUuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRleHQ6IHN0cmluZztcbiAgICAgICAgaWYgKHJlcXVlc3QuY2FuY2VsbGF0aW9uQ29kZSA9PT0gXCJtLnRpbWVvdXRcIikge1xuICAgICAgICAgICAgdGV4dCA9IF90KFwiVmVyaWZpY2F0aW9uIHRpbWVkIG91dC5cIikgKyBgICR7c3RhcnRBZ2Fpbkluc3RydWN0aW9ufWA7XG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5jYW5jZWxsaW5nVXNlcklkID09PSByZXF1ZXN0Lm90aGVyVXNlcklkKSB7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5pc1NlbGZWZXJpZmljYXRpb24pIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJZb3UgY2FuY2VsbGVkIHZlcmlmaWNhdGlvbiBvbiB5b3VyIG90aGVyIHNlc3Npb24uXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCIlKGRpc3BsYXlOYW1lKXMgY2FuY2VsbGVkIHZlcmlmaWNhdGlvbi5cIiwge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogbWVtYmVyLmRpc3BsYXlOYW1lIHx8IG1lbWJlci5uYW1lIHx8IG1lbWJlci51c2VySWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZXh0ID0gYCR7dGV4dH0gJHtzdGFydEFnYWluSW5zdHJ1Y3Rpb259YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHQgPSBfdChcIllvdSBjYW5jZWxsZWQgdmVyaWZpY2F0aW9uLlwiKSArIGAgJHtzdGFydEFnYWluSW5zdHJ1Y3Rpb259YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxoMz57X3QoXCJWZXJpZmljYXRpb24gY2FuY2VsbGVkXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgPHA+eyB0ZXh0IH08L3A+XG5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3dpZGVCdXR0b25cIiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xvc2V9PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJHb3QgaXRcIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3Qge21lbWJlciwgcGhhc2UsIHJlcXVlc3R9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IG1lbWJlci5kaXNwbGF5TmFtZSB8fCBtZW1iZXIubmFtZSB8fCBtZW1iZXIudXNlcklkO1xuXG4gICAgICAgIHN3aXRjaCAocGhhc2UpIHtcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfUkVBRFk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyUVJQaGFzZSgpO1xuICAgICAgICAgICAgY2FzZSBQSEFTRV9TVEFSVEVEOlxuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVxdWVzdC5jaG9zZW5NZXRob2QpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSB2ZXJpZmljYXRpb25NZXRob2RzLlJFQ0lQUk9DQVRFX1FSX0NPREU6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJRUlJlY2lwcm9jYXRlUGhhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSB2ZXJpZmljYXRpb25NZXRob2RzLlNBUzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgVmVyaWZpY2F0aW9uU2hvd1NhcyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLnZlcmlmaWNhdGlvbi5WZXJpZmljYXRpb25TaG93U2FzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbW9qaXMgPSB0aGlzLnN0YXRlLnNhc0V2ZW50ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VmVyaWZpY2F0aW9uU2hvd1Nhc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZT17ZGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZT17dGhpcy5nZXREZXZpY2UoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2FzPXt0aGlzLnN0YXRlLnNhc0V2ZW50LnNhc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25TYXNNaXNtYXRjaGVzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRG9uZT17dGhpcy5vblNhc01hdGNoZXNDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5EaWFsb2c9e3RoaXMucHJvcHMuaW5EaWFsb2d9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZj17cmVxdWVzdC5pc1NlbGZWZXJpZmljYXRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz4gOiA8U3Bpbm5lciAvPjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz57X3QoXCJDb21wYXJlIGVtb2ppXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBlbW9qaXMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFBIQVNFX0RPTkU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVmVyaWZpZWRQaGFzZSgpO1xuICAgICAgICAgICAgY2FzZSBQSEFTRV9DQU5DRUxMRUQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyQ2FuY2VsbGVkUGhhc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmVycm9yKFwiVmVyaWZpY2F0aW9uUGFuZWwgdW5oYW5kbGVkIHBoYXNlOlwiLCBwaGFzZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhcnRTQVMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2Vtb2ppQnV0dG9uQ2xpY2tlZDogdHJ1ZX0pO1xuICAgICAgICBjb25zdCB2ZXJpZmllciA9IHRoaXMucHJvcHMucmVxdWVzdC5iZWdpbktleVZlcmlmaWNhdGlvbih2ZXJpZmljYXRpb25NZXRob2RzLlNBUyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB2ZXJpZmllci52ZXJpZnkoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNhc01hdGNoZXNDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zdGF0ZS5zYXNFdmVudC5jb25maXJtKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TYXNNaXNtYXRjaGVzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdGUuc2FzRXZlbnQubWlzbWF0Y2goKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVWZXJpZmllclN0YXRlID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB7cmVxdWVzdH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCB7c2FzRXZlbnQsIHJlY2lwcm9jYXRlUVJFdmVudH0gPSByZXF1ZXN0LnZlcmlmaWVyO1xuICAgICAgICByZXF1ZXN0LnZlcmlmaWVyLm9mZignc2hvd19zYXMnLCB0aGlzLnVwZGF0ZVZlcmlmaWVyU3RhdGUpO1xuICAgICAgICByZXF1ZXN0LnZlcmlmaWVyLm9mZignc2hvd19yZWNpcHJvY2F0ZV9xcicsIHRoaXMudXBkYXRlVmVyaWZpZXJTdGF0ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nhc0V2ZW50LCByZWNpcHJvY2F0ZVFSRXZlbnR9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlcXVlc3RDaGFuZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtyZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IGhhZFZlcmlmaWVyID0gdGhpcy5oYXNWZXJpZmllcjtcbiAgICAgICAgdGhpcy5oYXNWZXJpZmllciA9ICEhcmVxdWVzdC52ZXJpZmllcjtcbiAgICAgICAgaWYgKCFoYWRWZXJpZmllciAmJiB0aGlzLmhhc1ZlcmlmaWVyKSB7XG4gICAgICAgICAgICByZXF1ZXN0LnZlcmlmaWVyLm9uKCdzaG93X3NhcycsIHRoaXMudXBkYXRlVmVyaWZpZXJTdGF0ZSk7XG4gICAgICAgICAgICByZXF1ZXN0LnZlcmlmaWVyLm9uKCdzaG93X3JlY2lwcm9jYXRlX3FyJywgdGhpcy51cGRhdGVWZXJpZmllclN0YXRlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gb24gdGhlIHJlcXVlc3RlciBzaWRlLCB0aGlzIGlzIGFsc28gYXdhaXRlZCBpbiBzdGFydFNBUyxcbiAgICAgICAgICAgICAgICAvLyBidXQgdGhhdCdzIG9rIGFzIHZlcmlmeSBzaG91bGQgcmV0dXJuIHRoZSBzYW1lIHByb21pc2UuXG4gICAgICAgICAgICAgICAgYXdhaXQgcmVxdWVzdC52ZXJpZmllci52ZXJpZnkoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvciB2ZXJpZnlcIiwgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHtyZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHJlcXVlc3Qub24oXCJjaGFuZ2VcIiwgdGhpcy5vblJlcXVlc3RDaGFuZ2UpO1xuICAgICAgICBpZiAocmVxdWVzdC52ZXJpZmllcikge1xuICAgICAgICAgICAgY29uc3Qge3Nhc0V2ZW50LCByZWNpcHJvY2F0ZVFSRXZlbnR9ID0gcmVxdWVzdC52ZXJpZmllcjtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nhc0V2ZW50LCByZWNpcHJvY2F0ZVFSRXZlbnR9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uUmVxdWVzdENoYW5nZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY29uc3Qge3JlcXVlc3R9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKHJlcXVlc3QudmVyaWZpZXIpIHtcbiAgICAgICAgICAgIHJlcXVlc3QudmVyaWZpZXIub2ZmKCdzaG93X3NhcycsIHRoaXMudXBkYXRlVmVyaWZpZXJTdGF0ZSk7XG4gICAgICAgICAgICByZXF1ZXN0LnZlcmlmaWVyLm9mZignc2hvd19yZWNpcHJvY2F0ZV9xcicsIHRoaXMudXBkYXRlVmVyaWZpZXJTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdC5vZmYoXCJjaGFuZ2VcIiwgdGhpcy5vblJlcXVlc3RDaGFuZ2UpO1xuICAgIH1cbn1cbiJdfQ==
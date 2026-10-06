"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

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

let VerificationPanel = (_dec = (0, _replaceableComponent.replaceableComponent)("views.right_panel.VerificationPanel"), _dec(_class = (_temp = class VerificationPanel extends _react.default.PureComponent
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

}, _temp)) || _class);
exports.default = VerificationPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3JpZ2h0X3BhbmVsL1ZlcmlmaWNhdGlvblBhbmVsLnRzeCJdLCJuYW1lcyI6WyJWZXJpZmljYXRpb25QaGFzZSIsIlZlcmlmaWNhdGlvblBhbmVsIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNldFN0YXRlIiwicmVjaXByb2NhdGVCdXR0b25DbGlja2VkIiwic3RhdGUiLCJyZWNpcHJvY2F0ZVFSRXZlbnQiLCJjb25maXJtIiwiY2FuY2VsIiwiZW1vamlCdXR0b25DbGlja2VkIiwidmVyaWZpZXIiLCJyZXF1ZXN0IiwiYmVnaW5LZXlWZXJpZmljYXRpb24iLCJ2ZXJpZmljYXRpb25NZXRob2RzIiwiU0FTIiwidmVyaWZ5IiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwic2FzRXZlbnQiLCJtaXNtYXRjaCIsIm9mZiIsInVwZGF0ZVZlcmlmaWVyU3RhdGUiLCJoYWRWZXJpZmllciIsImhhc1ZlcmlmaWVyIiwib24iLCJyZW5kZXJRUlBoYXNlIiwibWVtYmVyIiwic2hvd1NBUyIsIm90aGVyUGFydHlTdXBwb3J0c01ldGhvZCIsInNob3dRUiIsIlNDQU5fUVJfQ09ERV9NRVRIT0QiLCJBY2Nlc3NpYmxlQnV0dG9uIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiYnJhbmQiLCJTZGtDb25maWciLCJnZXQiLCJub0NvbW1vbk1ldGhvZEVycm9yIiwibGF5b3V0IiwicXJCbG9ja0RpYWxvZyIsInNhc0Jsb2NrRGlhbG9nIiwicXJDb2RlRGF0YSIsInN0YXJ0U0FTIiwib3IiLCJxckJsb2NrIiwiZGlzcGxheU5hbWUiLCJuYW1lIiwidXNlcklkIiwic2FzQmxvY2siLCJkaXNhYmxlZCIsInNhc0xhYmVsIiwibm9Db21tb25NZXRob2RCbG9jayIsImdldERldmljZSIsImRldmljZUlkIiwiY2hhbm5lbCIsIk1hdHJpeENsaWVudFBlZyIsImdldFN0b3JlZERldmljZSIsImdldFVzZXJJZCIsInJlbmRlclFSUmVjaXByb2NhdGVQaGFzZSIsIkJ1dHRvbiIsImluRGlhbG9nIiwiZGVzY3JpcHRpb24iLCJpc1NlbGZWZXJpZmljYXRpb24iLCJib2R5Iiwib25SZWNpcHJvY2F0ZU5vQ2xpY2siLCJvblJlY2lwcm9jYXRlWWVzQ2xpY2siLCJyZW5kZXJWZXJpZmllZFBoYXNlIiwidGV4dCIsImlzUm9vbUVuY3J5cHRlZCIsImRldmljZSIsIndhcm4iLCJkZXZpY2VOYW1lIiwiZ2V0RGlzcGxheU5hbWUiLCJvbkNsb3NlIiwicmVuZGVyQ2FuY2VsbGVkUGhhc2UiLCJzdGFydEFnYWluSW5zdHJ1Y3Rpb24iLCJjYW5jZWxsYXRpb25Db2RlIiwiY2FuY2VsbGluZ1VzZXJJZCIsIm90aGVyVXNlcklkIiwicmVuZGVyIiwicGhhc2UiLCJQSEFTRV9SRUFEWSIsIlBIQVNFX1NUQVJURUQiLCJjaG9zZW5NZXRob2QiLCJSRUNJUFJPQ0FURV9RUl9DT0RFIiwiVmVyaWZpY2F0aW9uU2hvd1NhcyIsImVtb2ppcyIsInNhcyIsIm9uU2FzTWlzbWF0Y2hlc0NsaWNrIiwib25TYXNNYXRjaGVzQ2xpY2siLCJQSEFTRV9ET05FIiwiUEhBU0VfQ0FOQ0VMTEVEIiwiY29tcG9uZW50RGlkTW91bnQiLCJvblJlcXVlc3RDaGFuZ2UiLCJjb21wb25lbnRXaWxsVW5tb3VudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFNQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFNQTs7QUFDQTs7OztBQUVBO0lBQ0tBLGlCOztXQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtBQUFBQSxFQUFBQSxpQixDQUFBQSxpQjtHQUFBQSxpQixLQUFBQSxpQjs7SUE0QmdC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QWpCLENBQXFCLHFCQUFyQixFQUE0QyxLQUFLQyxtQkFBakQ7QUFDSDs7QUFDRFgsSUFBQUEsT0FBTyxDQUFDVSxHQUFSLENBQVksUUFBWixFQUFzQixLQUFLeUUsZUFBM0I7QUFDSDs7QUFwVzhFLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHt2ZXJpZmljYXRpb25NZXRob2RzfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8nO1xuaW1wb3J0IHtTQ0FOX1FSX0NPREVfTUVUSE9EfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL3ZlcmlmaWNhdGlvbi9RUkNvZGVcIjtcbmltcG9ydCB7VmVyaWZpY2F0aW9uUmVxdWVzdH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vcmVxdWVzdC9WZXJpZmljYXRpb25SZXF1ZXN0XCI7XG5pbXBvcnQge1Jvb21NZW1iZXJ9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCB7UmVjaXByb2NhdGVRUkNvZGV9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vdmVyaWZpY2F0aW9uL1FSQ29kZVwiO1xuaW1wb3J0IHtTQVN9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vdmVyaWZpY2F0aW9uL1NBU1wiO1xuXG5pbXBvcnQgVmVyaWZpY2F0aW9uUVJDb2RlIGZyb20gXCIuLi9lbGVtZW50cy9jcnlwdG8vVmVyaWZpY2F0aW9uUVJDb2RlXCI7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBFMkVJY29uIGZyb20gXCIuLi9yb29tcy9FMkVJY29uXCI7XG5pbXBvcnQge1xuICAgIFBIQVNFX1JFQURZLFxuICAgIFBIQVNFX0RPTkUsXG4gICAgUEhBU0VfU1RBUlRFRCxcbiAgICBQSEFTRV9DQU5DRUxMRUQsXG59IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vdmVyaWZpY2F0aW9uL3JlcXVlc3QvVmVyaWZpY2F0aW9uUmVxdWVzdFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG4vLyBYWFg6IFNob3VsZCBiZSBkZWZpbmVkIGluIG1hdHJpeC1qcy1zZGtcbmVudW0gVmVyaWZpY2F0aW9uUGhhc2Uge1xuICAgIFBIQVNFX1VOU0VOVCxcbiAgICBQSEFTRV9SRVFVRVNURUQsXG4gICAgUEhBU0VfUkVBRFksXG4gICAgUEhBU0VfRE9ORSxcbiAgICBQSEFTRV9TVEFSVEVELFxuICAgIFBIQVNFX0NBTkNFTExFRCxcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbGF5b3V0OiBzdHJpbmc7XG4gICAgcmVxdWVzdDogVmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICBtZW1iZXI6IFJvb21NZW1iZXI7XG4gICAgcGhhc2U6IFZlcmlmaWNhdGlvblBoYXNlO1xuICAgIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG4gICAgaXNSb29tRW5jcnlwdGVkOiBib29sZWFuO1xuICAgIGluRGlhbG9nOiBib29sZWFuO1xuICAgIGtleTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzYXNFdmVudD86IFNBUztcbiAgICBlbW9qaUJ1dHRvbkNsaWNrZWQ/OiBib29sZWFuO1xuICAgIHJlY2lwcm9jYXRlQnV0dG9uQ2xpY2tlZD86IGJvb2xlYW47XG4gICAgcmVjaXByb2NhdGVRUkV2ZW50PzogUmVjaXByb2NhdGVRUkNvZGU7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnJpZ2h0X3BhbmVsLlZlcmlmaWNhdGlvblBhbmVsXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJpZmljYXRpb25QYW5lbCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGhhc1ZlcmlmaWVyOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICAgICAgdGhpcy5oYXNWZXJpZmllciA9IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUVJQaGFzZSgpIHtcbiAgICAgICAgY29uc3Qge21lbWJlciwgcmVxdWVzdH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBzaG93U0FTOiBib29sZWFuID0gcmVxdWVzdC5vdGhlclBhcnR5U3VwcG9ydHNNZXRob2QodmVyaWZpY2F0aW9uTWV0aG9kcy5TQVMpO1xuICAgICAgICBjb25zdCBzaG93UVI6IGJvb2xlYW4gPSByZXF1ZXN0Lm90aGVyUGFydHlTdXBwb3J0c01ldGhvZChTQ0FOX1FSX0NPREVfTUVUSE9EKTtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG5cbiAgICAgICAgY29uc3Qgbm9Db21tb25NZXRob2RFcnJvcjogSlNYLkVsZW1lbnQgPSAhc2hvd1NBUyAmJiAhc2hvd1FSID9cbiAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICBcIlRoZSBzZXNzaW9uIHlvdSBhcmUgdHJ5aW5nIHRvIHZlcmlmeSBkb2Vzbid0IHN1cHBvcnQgc2Nhbm5pbmcgYSBcIiArXG4gICAgICAgICAgICAgICAgXCJRUiBjb2RlIG9yIGVtb2ppIHZlcmlmaWNhdGlvbiwgd2hpY2ggaXMgd2hhdCAlKGJyYW5kKXMgc3VwcG9ydHMuIFRyeSBcIiArXG4gICAgICAgICAgICAgICAgXCJ3aXRoIGEgZGlmZmVyZW50IGNsaWVudC5cIixcbiAgICAgICAgICAgICAgICB7IGJyYW5kIH0sXG4gICAgICAgICAgICApfTwvcD4gOlxuICAgICAgICAgICAgbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5sYXlvdXQgPT09ICdkaWFsb2cnKSB7XG4gICAgICAgICAgICAvLyBIQUNLOiBUaGlzIGlzIGEgdGVycmlibGUgaWRlYS5cbiAgICAgICAgICAgIGxldCBxckJsb2NrRGlhbG9nOiBKU1guRWxlbWVudDtcbiAgICAgICAgICAgIGxldCBzYXNCbG9ja0RpYWxvZzogSlNYLkVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoc2hvd1FSKSB7XG4gICAgICAgICAgICAgICAgcXJCbG9ja0RpYWxvZyA9XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9WZXJpZmljYXRpb25QYW5lbF9RUlBoYXNlX3N0YXJ0T3B0aW9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPntfdChcIlNjYW4gdGhpcyB1bmlxdWUgY29kZVwiKX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VmVyaWZpY2F0aW9uUVJDb2RlIHFyQ29kZURhdGE9e3JlcXVlc3QucXJDb2RlRGF0YX0gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNob3dTQVMpIHtcbiAgICAgICAgICAgICAgICBzYXNCbG9ja0RpYWxvZyA9IDxkaXYgY2xhc3NOYW1lPSdteF9WZXJpZmljYXRpb25QYW5lbF9RUlBoYXNlX3N0YXJ0T3B0aW9uJz5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFwiQ29tcGFyZSB1bmlxdWUgZW1vamlcIil9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1ZlcmlmaWNhdGlvblBhbmVsX1FSUGhhc2VfaGVscFRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQ29tcGFyZSBhIHVuaXF1ZSBzZXQgb2YgZW1vamkgaWYgeW91IGRvbid0IGhhdmUgYSBjYW1lcmEgb24gZWl0aGVyIGRldmljZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBkaXNhYmxlZD17dGhpcy5zdGF0ZS5lbW9qaUJ1dHRvbkNsaWNrZWR9IG9uQ2xpY2s9e3RoaXMuc3RhcnRTQVN9IGtpbmQ9J3ByaW1hcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiU3RhcnRcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvciA9IHFyQmxvY2tEaWFsb2cgJiYgc2FzQmxvY2tEaWFsb2cgP1xuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9WZXJpZmljYXRpb25QYW5lbF9RUlBoYXNlX2JldHdlZW5UZXh0Jz57X3QoXCJvclwiKX08L2Rpdj4gOiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJWZXJpZnkgdGhpcyBzZXNzaW9uIGJ5IGNvbXBsZXRpbmcgb25lIG9mIHRoZSBmb2xsb3dpbmc6XCIpfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfVmVyaWZpY2F0aW9uUGFuZWxfUVJQaGFzZV9zdGFydE9wdGlvbnMnPlxuICAgICAgICAgICAgICAgICAgICAgICAge3FyQmxvY2tEaWFsb2d9XG4gICAgICAgICAgICAgICAgICAgICAgICB7b3J9XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2FzQmxvY2tEaWFsb2d9XG4gICAgICAgICAgICAgICAgICAgICAgICB7bm9Db21tb25NZXRob2RFcnJvcn1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHFyQmxvY2s6IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoc2hvd1FSKSB7XG4gICAgICAgICAgICBxckJsb2NrID0gPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8aDM+e190KFwiVmVyaWZ5IGJ5IHNjYW5uaW5nXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiQXNrICUoZGlzcGxheU5hbWUpcyB0byBzY2FuIHlvdXIgY29kZTpcIiwge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogbWVtYmVyLmRpc3BsYXlOYW1lIHx8IG1lbWJlci5uYW1lIHx8IG1lbWJlci51c2VySWQsXG4gICAgICAgICAgICAgICAgfSl9PC9wPlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9WZXJpZmljYXRpb25QYW5lbF9xckNvZGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPFZlcmlmaWNhdGlvblFSQ29kZSBxckNvZGVEYXRhPXtyZXF1ZXN0LnFyQ29kZURhdGF9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2FzQmxvY2s6IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoc2hvd1NBUykge1xuICAgICAgICAgICAgY29uc3QgZGlzYWJsZWQgPSB0aGlzLnN0YXRlLmVtb2ppQnV0dG9uQ2xpY2tlZDtcbiAgICAgICAgICAgIGNvbnN0IHNhc0xhYmVsID0gc2hvd1FSID9cbiAgICAgICAgICAgICAgICBfdChcIklmIHlvdSBjYW4ndCBzY2FuIHRoZSBjb2RlIGFib3ZlLCB2ZXJpZnkgYnkgY29tcGFyaW5nIHVuaXF1ZSBlbW9qaS5cIikgOlxuICAgICAgICAgICAgICAgIF90KFwiVmVyaWZ5IGJ5IGNvbXBhcmluZyB1bmlxdWUgZW1vamkuXCIpO1xuXG4gICAgICAgICAgICAvLyBOb3RlOiBteF9WZXJpZmljYXRpb25QYW5lbF92ZXJpZnlCeUVtb2ppQnV0dG9uIGlzIGZvciB0aGUgZW5kLXRvLWVuZCB0ZXN0c1xuICAgICAgICAgICAgc2FzQmxvY2sgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxoMz57X3QoXCJWZXJpZnkgYnkgZW1vamlcIil9PC9oMz5cbiAgICAgICAgICAgICAgICA8cD57c2FzTGFiZWx9PC9wPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VySW5mb193aWRlQnV0dG9uIG14X1ZlcmlmaWNhdGlvblBhbmVsX3ZlcmlmeUJ5RW1vamlCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnN0YXJ0U0FTfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge190KFwiVmVyaWZ5IGJ5IGVtb2ppXCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vQ29tbW9uTWV0aG9kQmxvY2sgPSBub0NvbW1vbk1ldGhvZEVycm9yID9cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+e25vQ29tbW9uTWV0aG9kRXJyb3J9PC9kaXY+IDpcbiAgICAgICAgICAgIG51bGw7XG5cbiAgICAgICAgLy8gVE9ETzogYWRkIHdheSB0byBvcGVuIGNhbWVyYSB0byBzY2FuIGEgUVIgY29kZVxuICAgICAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAge3FyQmxvY2t9XG4gICAgICAgICAgICB7c2FzQmxvY2t9XG4gICAgICAgICAgICB7bm9Db21tb25NZXRob2RCbG9ja31cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlY2lwcm9jYXRlWWVzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3JlY2lwcm9jYXRlQnV0dG9uQ2xpY2tlZDogdHJ1ZX0pO1xuICAgICAgICB0aGlzLnN0YXRlLnJlY2lwcm9jYXRlUVJFdmVudC5jb25maXJtKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWNpcHJvY2F0ZU5vQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3JlY2lwcm9jYXRlQnV0dG9uQ2xpY2tlZDogdHJ1ZX0pO1xuICAgICAgICB0aGlzLnN0YXRlLnJlY2lwcm9jYXRlUVJFdmVudC5jYW5jZWwoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXREZXZpY2UoKSB7XG4gICAgICAgIGNvbnN0IGRldmljZUlkID0gdGhpcy5wcm9wcy5yZXF1ZXN0ICYmIHRoaXMucHJvcHMucmVxdWVzdC5jaGFubmVsLmRldmljZUlkO1xuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFN0b3JlZERldmljZShNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCksIGRldmljZUlkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclFSUmVjaXByb2NhdGVQaGFzZSgpIHtcbiAgICAgICAgY29uc3Qge21lbWJlciwgcmVxdWVzdH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBsZXQgQnV0dG9uO1xuICAgICAgICAvLyBhIGJpdCBvZiBhIGhhY2ssIGJ1dCB0aGUgRm9ybUJ1dHRvbiBzaG91bGQgb25seSBiZSB1c2VkIGluIHRoZSByaWdodCBwYW5lbFxuICAgICAgICAvLyB0aGV5IHNob3VsZCBwcm9iYWJseSBqdXN0IGJlIHRoZSBzYW1lIGNvbXBvbmVudCB3aXRoIGEgY3NzIGNsYXNzIGFwcGxpZWQgdG8gaXQ/XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmluRGlhbG9nKSB7XG4gICAgICAgICAgICBCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvblwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5Gb3JtQnV0dG9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gcmVxdWVzdC5pc1NlbGZWZXJpZmljYXRpb24gP1xuICAgICAgICAgICAgX3QoXCJBbG1vc3QgdGhlcmUhIElzIHlvdXIgb3RoZXIgc2Vzc2lvbiBzaG93aW5nIHRoZSBzYW1lIHNoaWVsZD9cIikgOlxuICAgICAgICAgICAgX3QoXCJBbG1vc3QgdGhlcmUhIElzICUoZGlzcGxheU5hbWUpcyBzaG93aW5nIHRoZSBzYW1lIHNoaWVsZD9cIiwge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBtZW1iZXIuZGlzcGxheU5hbWUgfHwgbWVtYmVyLm5hbWUgfHwgbWVtYmVyLnVzZXJJZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBsZXQgYm9keTogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlY2lwcm9jYXRlUVJFdmVudCkge1xuICAgICAgICAgICAgLy8gRWxlbWVudCBXZWIgZG9lc24ndCBzdXBwb3J0IHNjYW5uaW5nIHlldCwgc28gYXNzdW1lIGhlcmUgd2UncmUgdGhlIGNsaWVudCBiZWluZyBzY2FubmVkLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIHdlJ3JlIHBhc3NpbmcgYm90aCBhIGxhYmVsIGFuZCBhIGNoaWxkIHN0cmluZyB0byBCdXR0b24gYXNcbiAgICAgICAgICAgIC8vIEZvcm1CdXR0b24gYW5kIEFjY2Vzc2libGVCdXR0b24gZXhwZWN0IHRoaXMgZGlmZmVyZW50bHlcbiAgICAgICAgICAgIGJvZHkgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPHA+e2Rlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICA8RTJFSWNvbiBpc1VzZXI9e3RydWV9IHN0YXR1cz1cInZlcmlmaWVkXCIgc2l6ZT17MTI4fSBoaWRlVG9vbHRpcD17dHJ1ZX0gLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1ZlcmlmaWNhdGlvblBhbmVsX3JlY2lwcm9jYXRlQnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJOb1wiKX0ga2luZD1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5yZWNpcHJvY2F0ZUJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUmVjaXByb2NhdGVOb0NsaWNrfT57X3QoXCJOb1wiKX08L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiWWVzXCIpfSBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5yZWNpcHJvY2F0ZUJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUmVjaXByb2NhdGVZZXNDbGlja30+e190KFwiWWVzXCIpfTwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0gPHA+PFNwaW5uZXIgLz48L3A+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lciBteF9WZXJpZmljYXRpb25QYW5lbF9yZWNpcHJvY2F0ZV9zZWN0aW9uXCI+XG4gICAgICAgICAgICA8aDM+e190KFwiVmVyaWZ5IGJ5IHNjYW5uaW5nXCIpfTwvaDM+XG4gICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJWZXJpZmllZFBoYXNlKCkge1xuICAgICAgICBjb25zdCB7bWVtYmVyLCByZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgbGV0IHRleHQ6IHN0cmluZztcbiAgICAgICAgaWYgKCFyZXF1ZXN0LmlzU2VsZlZlcmlmaWNhdGlvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNSb29tRW5jcnlwdGVkKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiVmVyaWZ5IGFsbCB1c2VycyBpbiBhIHJvb20gdG8gZW5zdXJlIGl0J3Mgc2VjdXJlLlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiSW4gZW5jcnlwdGVkIHJvb21zLCB2ZXJpZnkgYWxsIHVzZXJzIHRvIGVuc3VyZSBpdOKAmXMgc2VjdXJlLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgICAgICBpZiAocmVxdWVzdC5pc1NlbGZWZXJpZmljYXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IHRoaXMuZ2V0RGV2aWNlKCk7XG4gICAgICAgICAgICBpZiAoIWRldmljZSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiBpZiB0aGUgZGV2aWNlIGlzIGxvZ2dlZCBvdXQgd2hpbGUgd2UncmUgc3RpbGwgc2hvd2luZyB2ZXJpZmljYXRpb25cbiAgICAgICAgICAgICAgICAvLyBVSSBmb3IgaXQuXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVmVyaWZpZWQgZGV2aWNlIHdlIGRvbid0IGtub3cgYWJvdXQ6IFwiICsgdGhpcy5wcm9wcy5yZXF1ZXN0LmNoYW5uZWwuZGV2aWNlSWQpO1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gX3QoXCJZb3UndmUgc3VjY2Vzc2Z1bGx5IHZlcmlmaWVkIHlvdXIgZGV2aWNlIVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIllvdSd2ZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgJShkZXZpY2VOYW1lKXMgKCUoZGV2aWNlSWQpcykhXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlTmFtZTogZGV2aWNlID8gZGV2aWNlLmdldERpc3BsYXlOYW1lKCkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlSWQ6IHRoaXMucHJvcHMucmVxdWVzdC5jaGFubmVsLmRldmljZUlkLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIllvdSd2ZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgJShkaXNwbGF5TmFtZSlzIVwiLCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IG1lbWJlci5kaXNwbGF5TmFtZSB8fCBtZW1iZXIubmFtZSB8fCBtZW1iZXIudXNlcklkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXIgbXhfVmVyaWZpY2F0aW9uUGFuZWxfdmVyaWZpZWRfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIDxoMz57X3QoXCJWZXJpZmllZFwiKX08L2gzPlxuICAgICAgICAgICAgICAgIDxwPntkZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgPEUyRUljb24gaXNVc2VyPXt0cnVlfSBzdGF0dXM9XCJ2ZXJpZmllZFwiIHNpemU9ezEyOH0gaGlkZVRvb2x0aXA9e3RydWV9IC8+XG4gICAgICAgICAgICAgICAgeyB0ZXh0ID8gPHA+eyB0ZXh0IH08L3A+IDogbnVsbCB9XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb193aWRlQnV0dG9uXCIgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsb3NlfT5cbiAgICAgICAgICAgICAgICAgICAge190KFwiR290IGl0XCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyQ2FuY2VsbGVkUGhhc2UoKSB7XG4gICAgICAgIGNvbnN0IHttZW1iZXIsIHJlcXVlc3R9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuXG4gICAgICAgIGxldCBzdGFydEFnYWluSW5zdHJ1Y3Rpb246IHN0cmluZztcbiAgICAgICAgaWYgKHJlcXVlc3QuaXNTZWxmVmVyaWZpY2F0aW9uKSB7XG4gICAgICAgICAgICBzdGFydEFnYWluSW5zdHJ1Y3Rpb24gPSBfdChcIlN0YXJ0IHZlcmlmaWNhdGlvbiBhZ2FpbiBmcm9tIHRoZSBub3RpZmljYXRpb24uXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnRBZ2Fpbkluc3RydWN0aW9uID0gX3QoXCJTdGFydCB2ZXJpZmljYXRpb24gYWdhaW4gZnJvbSB0aGVpciBwcm9maWxlLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0ZXh0OiBzdHJpbmc7XG4gICAgICAgIGlmIChyZXF1ZXN0LmNhbmNlbGxhdGlvbkNvZGUgPT09IFwibS50aW1lb3V0XCIpIHtcbiAgICAgICAgICAgIHRleHQgPSBfdChcIlZlcmlmaWNhdGlvbiB0aW1lZCBvdXQuXCIpICsgYCAke3N0YXJ0QWdhaW5JbnN0cnVjdGlvbn1gO1xuICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3QuY2FuY2VsbGluZ1VzZXJJZCA9PT0gcmVxdWVzdC5vdGhlclVzZXJJZCkge1xuICAgICAgICAgICAgaWYgKHJlcXVlc3QuaXNTZWxmVmVyaWZpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiWW91IGNhbmNlbGxlZCB2ZXJpZmljYXRpb24gb24geW91ciBvdGhlciBzZXNzaW9uLlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiJShkaXNwbGF5TmFtZSlzIGNhbmNlbGxlZCB2ZXJpZmljYXRpb24uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IG1lbWJlci5kaXNwbGF5TmFtZSB8fCBtZW1iZXIubmFtZSB8fCBtZW1iZXIudXNlcklkLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGV4dCA9IGAke3RleHR9ICR7c3RhcnRBZ2Fpbkluc3RydWN0aW9ufWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZXh0ID0gX3QoXCJZb3UgY2FuY2VsbGVkIHZlcmlmaWNhdGlvbi5cIikgKyBgICR7c3RhcnRBZ2Fpbkluc3RydWN0aW9ufWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8aDM+e190KFwiVmVyaWZpY2F0aW9uIGNhbmNlbGxlZFwiKX08L2gzPlxuICAgICAgICAgICAgICAgIDxwPnsgdGV4dCB9PC9wPlxuXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb193aWRlQnV0dG9uXCIgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsb3NlfT5cbiAgICAgICAgICAgICAgICAgICAge190KFwiR290IGl0XCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHttZW1iZXIsIHBoYXNlLCByZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSBtZW1iZXIuZGlzcGxheU5hbWUgfHwgbWVtYmVyLm5hbWUgfHwgbWVtYmVyLnVzZXJJZDtcblxuICAgICAgICBzd2l0Y2ggKHBoYXNlKSB7XG4gICAgICAgICAgICBjYXNlIFBIQVNFX1JFQURZOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlclFSUGhhc2UoKTtcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfU1RBUlRFRDpcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHJlcXVlc3QuY2hvc2VuTWV0aG9kKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdmVyaWZpY2F0aW9uTWV0aG9kcy5SRUNJUFJPQ0FURV9RUl9DT0RFOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyUVJSZWNpcHJvY2F0ZVBoYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdmVyaWZpY2F0aW9uTWV0aG9kcy5TQVM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFZlcmlmaWNhdGlvblNob3dTYXMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy52ZXJpZmljYXRpb24uVmVyaWZpY2F0aW9uU2hvd1NhcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1vamlzID0gdGhpcy5zdGF0ZS5zYXNFdmVudCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFZlcmlmaWNhdGlvblNob3dTYXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU9e2Rpc3BsYXlOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2U9e3RoaXMuZ2V0RGV2aWNlKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhcz17dGhpcy5zdGF0ZS5zYXNFdmVudC5zYXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uU2FzTWlzbWF0Y2hlc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRvbmU9e3RoaXMub25TYXNNYXRjaGVzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluRGlhbG9nPXt0aGlzLnByb3BzLmluRGlhbG9nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGY9e3JlcXVlc3QuaXNTZWxmVmVyaWZpY2F0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+IDogPFNwaW5uZXIgLz47XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+e190KFwiQ29tcGFyZSBlbW9qaVwiKX08L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZW1vamlzIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBQSEFTRV9ET05FOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlclZlcmlmaWVkUGhhc2UoKTtcbiAgICAgICAgICAgIGNhc2UgUEhBU0VfQ0FOQ0VMTEVEOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlckNhbmNlbGxlZFBoYXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5lcnJvcihcIlZlcmlmaWNhdGlvblBhbmVsIHVuaGFuZGxlZCBwaGFzZTpcIiwgcGhhc2UpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXJ0U0FTID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtlbW9qaUJ1dHRvbkNsaWNrZWQ6IHRydWV9KTtcbiAgICAgICAgY29uc3QgdmVyaWZpZXIgPSB0aGlzLnByb3BzLnJlcXVlc3QuYmVnaW5LZXlWZXJpZmljYXRpb24odmVyaWZpY2F0aW9uTWV0aG9kcy5TQVMpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdmVyaWZpZXIudmVyaWZ5KCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TYXNNYXRjaGVzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdGUuc2FzRXZlbnQuY29uZmlybSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2FzTWlzbWF0Y2hlc0NsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnN0YXRlLnNhc0V2ZW50Lm1pc21hdGNoKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlVmVyaWZpZXJTdGF0ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qge3JlcXVlc3R9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3Qge3Nhc0V2ZW50LCByZWNpcHJvY2F0ZVFSRXZlbnR9ID0gcmVxdWVzdC52ZXJpZmllcjtcbiAgICAgICAgcmVxdWVzdC52ZXJpZmllci5vZmYoJ3Nob3dfc2FzJywgdGhpcy51cGRhdGVWZXJpZmllclN0YXRlKTtcbiAgICAgICAgcmVxdWVzdC52ZXJpZmllci5vZmYoJ3Nob3dfcmVjaXByb2NhdGVfcXInLCB0aGlzLnVwZGF0ZVZlcmlmaWVyU3RhdGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzYXNFdmVudCwgcmVjaXByb2NhdGVRUkV2ZW50fSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXF1ZXN0Q2hhbmdlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB7cmVxdWVzdH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBoYWRWZXJpZmllciA9IHRoaXMuaGFzVmVyaWZpZXI7XG4gICAgICAgIHRoaXMuaGFzVmVyaWZpZXIgPSAhIXJlcXVlc3QudmVyaWZpZXI7XG4gICAgICAgIGlmICghaGFkVmVyaWZpZXIgJiYgdGhpcy5oYXNWZXJpZmllcikge1xuICAgICAgICAgICAgcmVxdWVzdC52ZXJpZmllci5vbignc2hvd19zYXMnLCB0aGlzLnVwZGF0ZVZlcmlmaWVyU3RhdGUpO1xuICAgICAgICAgICAgcmVxdWVzdC52ZXJpZmllci5vbignc2hvd19yZWNpcHJvY2F0ZV9xcicsIHRoaXMudXBkYXRlVmVyaWZpZXJTdGF0ZSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIG9uIHRoZSByZXF1ZXN0ZXIgc2lkZSwgdGhpcyBpcyBhbHNvIGF3YWl0ZWQgaW4gc3RhcnRTQVMsXG4gICAgICAgICAgICAgICAgLy8gYnV0IHRoYXQncyBvayBhcyB2ZXJpZnkgc2hvdWxkIHJldHVybiB0aGUgc2FtZSBwcm9taXNlLlxuICAgICAgICAgICAgICAgIGF3YWl0IHJlcXVlc3QudmVyaWZpZXIudmVyaWZ5KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3IgdmVyaWZ5XCIsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCB7cmVxdWVzdH0gPSB0aGlzLnByb3BzO1xuICAgICAgICByZXF1ZXN0Lm9uKFwiY2hhbmdlXCIsIHRoaXMub25SZXF1ZXN0Q2hhbmdlKTtcbiAgICAgICAgaWYgKHJlcXVlc3QudmVyaWZpZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHtzYXNFdmVudCwgcmVjaXByb2NhdGVRUkV2ZW50fSA9IHJlcXVlc3QudmVyaWZpZXI7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzYXNFdmVudCwgcmVjaXByb2NhdGVRUkV2ZW50fSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vblJlcXVlc3RDaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHtyZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmIChyZXF1ZXN0LnZlcmlmaWVyKSB7XG4gICAgICAgICAgICByZXF1ZXN0LnZlcmlmaWVyLm9mZignc2hvd19zYXMnLCB0aGlzLnVwZGF0ZVZlcmlmaWVyU3RhdGUpO1xuICAgICAgICAgICAgcmVxdWVzdC52ZXJpZmllci5vZmYoJ3Nob3dfcmVjaXByb2NhdGVfcXInLCB0aGlzLnVwZGF0ZVZlcmlmaWVyU3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3Qub2ZmKFwiY2hhbmdlXCIsIHRoaXMub25SZXF1ZXN0Q2hhbmdlKTtcbiAgICB9XG59XG4iXX0=
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

var sdk = _interopRequireWildcard(require("../../../index"));

var _Analytics = _interopRequireDefault(require("../../../Analytics"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var Lifecycle = _interopRequireWildcard(require("../../../Lifecycle"));

var _languageHandler = require("../../../languageHandler");

var _InteractiveAuth = _interopRequireWildcard(require("../../structures/InteractiveAuth"));

var _InteractiveAuthEntryComponents = require("../auth/InteractiveAuthEntryComponents");

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

/*
Copyright 2016 OpenMarket Ltd
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
class DeactivateAccountDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onStagePhaseChange", (stage, phase) => {
      const dialogAesthetics = {
        [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_PREAUTH]: {
          body: (0, _languageHandler._t)("Confirm your account deactivation by using Single Sign On to prove your identity."),
          continueText: (0, _languageHandler._t)("Single Sign On"),
          continueKind: "danger"
        },
        [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_POSTAUTH]: {
          body: (0, _languageHandler._t)("Are you sure you want to deactivate your account? This is irreversible."),
          continueText: (0, _languageHandler._t)("Confirm account deactivation"),
          continueKind: "danger"
        }
      }; // This is the same as aestheticsForStagePhases in InteractiveAuthDialog minus the `title`

      const DEACTIVATE_AESTHETICS = {
        [_InteractiveAuthEntryComponents.SSOAuthEntry.LOGIN_TYPE]: dialogAesthetics,
        [_InteractiveAuthEntryComponents.SSOAuthEntry.UNSTABLE_LOGIN_TYPE]: dialogAesthetics,
        [_InteractiveAuthEntryComponents.PasswordAuthEntry.LOGIN_TYPE]: {
          [_InteractiveAuthEntryComponents.DEFAULT_PHASE]: {
            body: (0, _languageHandler._t)("To continue, please enter your password:")
          }
        }
      };
      const aesthetics = DEACTIVATE_AESTHETICS[stage];
      let bodyText = null;
      let continueText = null;
      let continueKind = null;

      if (aesthetics) {
        const phaseAesthetics = aesthetics[phase];
        if (phaseAesthetics && phaseAesthetics.body) bodyText = phaseAesthetics.body;
        if (phaseAesthetics && phaseAesthetics.continueText) continueText = phaseAesthetics.continueText;
        if (phaseAesthetics && phaseAesthetics.continueKind) continueKind = phaseAesthetics.continueKind;
      }

      this.setState({
        bodyText,
        continueText,
        continueKind
      });
    });
    (0, _defineProperty2.default)(this, "_onUIAuthFinished", (success, result, extra) => {
      if (success) return; // great! makeRequest() will be called too.

      if (result === _InteractiveAuth.ERROR_USER_CANCELLED) {
        this._onCancel();

        return;
      }

      console.error("Error during UI Auth:", {
        result,
        extra
      });
      this.setState({
        errStr: (0, _languageHandler._t)("There was a problem communicating with the server. Please try again.")
      });
    });
    (0, _defineProperty2.default)(this, "_onUIAuthComplete", auth => {
      _MatrixClientPeg.MatrixClientPeg.get().deactivateAccount(auth, this.state.shouldErase).then(r => {
        // Deactivation worked - logout & close this dialog
        _Analytics.default.trackEvent('Account', 'Deactivate Account');

        Lifecycle.onLoggedOut();
        this.props.onFinished(true);
      }).catch(e => {
        console.error(e);
        this.setState({
          errStr: (0, _languageHandler._t)("There was a problem communicating with the server. Please try again.")
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onEraseFieldChange", ev => {
      this.setState({
        shouldErase: ev.target.checked,
        // Disable the auth form because we're going to have to reinitialize the auth
        // information. We do this because we can't modify the parameters in the UIA
        // session, and the user will have selected something which changes the request.
        // Therefore, we throw away the last auth session and try a new one.
        authEnabled: false
      }); // As mentioned above, set up for auth again to get updated UIA session info

      this._initAuth(
      /* shouldErase= */
      ev.target.checked);
    });
    this.state = {
      shouldErase: false,
      errStr: null,
      authData: null,
      // for UIA
      authEnabled: true,
      // see usages for information
      // A few strings that are passed to InteractiveAuth for design or are displayed
      // next to the InteractiveAuth component.
      bodyText: null,
      continueText: null,
      continueKind: null
    };

    this._initAuth(
    /* shouldErase= */
    false);
  }

  _onCancel() {
    this.props.onFinished(false);
  }

  _initAuth(shouldErase) {
    _MatrixClientPeg.MatrixClientPeg.get().deactivateAccount(null, shouldErase).then(r => {
      // If we got here, oops. The server didn't require any auth.
      // Our application lifecycle will catch the error and do the logout bits.
      // We'll try to log something in an vain attempt to record what happened (storage
      // is also obliterated on logout).
      console.warn("User's account got deactivated without confirmation: Server had no auth");
      this.setState({
        errStr: (0, _languageHandler._t)("Server did not require any authentication")
      });
    }).catch(e => {
      if (e && e.httpStatus === 401 && e.data) {
        // Valid UIA response
        this.setState({
          authData: e.data,
          authEnabled: true
        });
      } else {
        this.setState({
          errStr: (0, _languageHandler._t)("Server did not return valid authentication information.")
        });
      }
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    let error = null;

    if (this.state.errStr) {
      error = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, this.state.errStr);
    }

    let auth = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Loading..."));

    if (this.state.authData && this.state.authEnabled) {
      auth = /*#__PURE__*/_react.default.createElement("div", null, this.state.bodyText, /*#__PURE__*/_react.default.createElement(_InteractiveAuth.default, {
        matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
        authData: this.state.authData,
        makeRequest: this._onUIAuthComplete,
        onAuthFinished: this._onUIAuthFinished,
        onStagePhaseChange: this._onStagePhaseChange,
        continueText: this.state.continueText,
        continueKind: this.state.continueKind
      }));
    } // this is on purpose not a <form /> to prevent Enter triggering submission, to further prevent accidents


    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_DeactivateAccountDialog",
      onFinished: this.props.onFinished,
      titleClass: "danger",
      title: (0, _languageHandler._t)("Deactivate Account")
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This will make your account permanently unusable. " + "You will not be able to log in, and no one will be able to re-register the same " + "user ID. " + "This will cause your account to leave all rooms it is participating in, and it " + "will remove your account details from your identity server. " + "<b>This action is irreversible.</b>", {}, {
      b: sub => /*#__PURE__*/_react.default.createElement("b", null, " ", sub, " ")
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Deactivating your account <b>does not by default cause us to forget messages you " + "have sent.</b> " + "If you would like us to forget your messages, please tick the box below.", {}, {
      b: sub => /*#__PURE__*/_react.default.createElement("b", null, " ", sub, " ")
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Message visibility in Matrix is similar to email. " + "Our forgetting your messages means that messages you have sent will not be shared " + "with any new or unregistered users, but registered users who already have access " + "to these messages will still have access to their copy.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DeactivateAccountDialog_input_section"
    }, /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      checked: this.state.shouldErase,
      onChange: this._onEraseFieldChange
    }, (0, _languageHandler._t)("Please forget all messages I have sent when my account is deactivated " + "(<b>Warning:</b> this will cause future users to see an incomplete view " + "of conversations)", {}, {
      b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
    }))), error, auth)));
  }

}

exports.default = DeactivateAccountDialog;
DeactivateAccountDialog.propTypes = {
  onFinished: _propTypes.default.func.isRequired
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRGVhY3RpdmF0ZUFjY291bnREaWFsb2cuanMiXSwibmFtZXMiOlsiRGVhY3RpdmF0ZUFjY291bnREaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzdGFnZSIsInBoYXNlIiwiZGlhbG9nQWVzdGhldGljcyIsIlNTT0F1dGhFbnRyeSIsIlBIQVNFX1BSRUFVVEgiLCJib2R5IiwiY29udGludWVUZXh0IiwiY29udGludWVLaW5kIiwiUEhBU0VfUE9TVEFVVEgiLCJERUFDVElWQVRFX0FFU1RIRVRJQ1MiLCJMT0dJTl9UWVBFIiwiVU5TVEFCTEVfTE9HSU5fVFlQRSIsIlBhc3N3b3JkQXV0aEVudHJ5IiwiREVGQVVMVF9QSEFTRSIsImFlc3RoZXRpY3MiLCJib2R5VGV4dCIsInBoYXNlQWVzdGhldGljcyIsInNldFN0YXRlIiwic3VjY2VzcyIsInJlc3VsdCIsImV4dHJhIiwiRVJST1JfVVNFUl9DQU5DRUxMRUQiLCJfb25DYW5jZWwiLCJjb25zb2xlIiwiZXJyb3IiLCJlcnJTdHIiLCJhdXRoIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZGVhY3RpdmF0ZUFjY291bnQiLCJzdGF0ZSIsInNob3VsZEVyYXNlIiwidGhlbiIsInIiLCJBbmFseXRpY3MiLCJ0cmFja0V2ZW50IiwiTGlmZWN5Y2xlIiwib25Mb2dnZWRPdXQiLCJvbkZpbmlzaGVkIiwiY2F0Y2giLCJlIiwiZXYiLCJ0YXJnZXQiLCJjaGVja2VkIiwiYXV0aEVuYWJsZWQiLCJfaW5pdEF1dGgiLCJhdXRoRGF0YSIsIndhcm4iLCJodHRwU3RhdHVzIiwiZGF0YSIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJfb25VSUF1dGhDb21wbGV0ZSIsIl9vblVJQXV0aEZpbmlzaGVkIiwiX29uU3RhZ2VQaGFzZUNoYW5nZSIsImIiLCJzdWIiLCJfb25FcmFz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Syx5QkFDRCx1REFDQSxvRkFEQSxHQUVBLG1GQUZBLEdBR0EseURBSkMsQ0FBTCxDQXBCSixlQTJCSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0kscURBQ0ksNkJBQUMsdUJBQUQ7QUFDSSxNQUFBLE9BQU8sRUFBRSxLQUFLNUIsS0FBTCxDQUFXQyxXQUR4QjtBQUVJLE1BQUEsUUFBUSxFQUFFLEtBQUs0QjtBQUZuQixPQUlLLHlCQUNHLDJFQUNBLDBFQURBLEdBRUEsbUJBSEgsRUFJRyxFQUpILEVBS0c7QUFBRUYsTUFBQUEsQ0FBQyxFQUFHQyxHQUFELGlCQUFTLHdDQUFLQSxHQUFMO0FBQWQsS0FMSCxDQUpMLENBREosQ0FESixFQWdCS2xDLEtBaEJMLEVBaUJLRSxJQWpCTCxDQTNCSixDQUxKLENBREo7QUF3REg7O0FBNU1nRTs7O0FBK01yRS9CLHVCQUF1QixDQUFDaUUsU0FBeEIsR0FBb0M7QUFDaEN0QixFQUFBQSxVQUFVLEVBQUV1QixtQkFBVUMsSUFBVixDQUFlQztBQURLLENBQXBDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuLi8uLi8uLi9BbmFseXRpY3MnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgKiBhcyBMaWZlY3ljbGUgZnJvbSAnLi4vLi4vLi4vTGlmZWN5Y2xlJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBJbnRlcmFjdGl2ZUF1dGgsIHtFUlJPUl9VU0VSX0NBTkNFTExFRH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvSW50ZXJhY3RpdmVBdXRoXCI7XG5pbXBvcnQge0RFRkFVTFRfUEhBU0UsIFBhc3N3b3JkQXV0aEVudHJ5LCBTU09BdXRoRW50cnl9IGZyb20gXCIuLi9hdXRoL0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c1wiO1xuaW1wb3J0IFN0eWxlZENoZWNrYm94IGZyb20gXCIuLi9lbGVtZW50cy9TdHlsZWRDaGVja2JveFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWFjdGl2YXRlQWNjb3VudERpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaG91bGRFcmFzZTogZmFsc2UsXG4gICAgICAgICAgICBlcnJTdHI6IG51bGwsXG4gICAgICAgICAgICBhdXRoRGF0YTogbnVsbCwgLy8gZm9yIFVJQVxuICAgICAgICAgICAgYXV0aEVuYWJsZWQ6IHRydWUsIC8vIHNlZSB1c2FnZXMgZm9yIGluZm9ybWF0aW9uXG5cbiAgICAgICAgICAgIC8vIEEgZmV3IHN0cmluZ3MgdGhhdCBhcmUgcGFzc2VkIHRvIEludGVyYWN0aXZlQXV0aCBmb3IgZGVzaWduIG9yIGFyZSBkaXNwbGF5ZWRcbiAgICAgICAgICAgIC8vIG5leHQgdG8gdGhlIEludGVyYWN0aXZlQXV0aCBjb21wb25lbnQuXG4gICAgICAgICAgICBib2R5VGV4dDogbnVsbCxcbiAgICAgICAgICAgIGNvbnRpbnVlVGV4dDogbnVsbCxcbiAgICAgICAgICAgIGNvbnRpbnVlS2luZDogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9pbml0QXV0aCgvKiBzaG91bGRFcmFzZT0gKi9mYWxzZSk7XG4gICAgfVxuXG4gICAgX29uU3RhZ2VQaGFzZUNoYW5nZSA9IChzdGFnZSwgcGhhc2UpID0+IHtcbiAgICAgICAgY29uc3QgZGlhbG9nQWVzdGhldGljcyA9IHtcbiAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUFJFQVVUSF06IHtcbiAgICAgICAgICAgICAgICBib2R5OiBfdChcIkNvbmZpcm0geW91ciBhY2NvdW50IGRlYWN0aXZhdGlvbiBieSB1c2luZyBTaW5nbGUgU2lnbiBPbiB0byBwcm92ZSB5b3VyIGlkZW50aXR5LlwiKSxcbiAgICAgICAgICAgICAgICBjb250aW51ZVRleHQ6IF90KFwiU2luZ2xlIFNpZ24gT25cIiksXG4gICAgICAgICAgICAgICAgY29udGludWVLaW5kOiBcImRhbmdlclwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUE9TVEFVVEhdOiB7XG4gICAgICAgICAgICAgICAgYm9keTogX3QoXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVhY3RpdmF0ZSB5b3VyIGFjY291bnQ/IFRoaXMgaXMgaXJyZXZlcnNpYmxlLlwiKSxcbiAgICAgICAgICAgICAgICBjb250aW51ZVRleHQ6IF90KFwiQ29uZmlybSBhY2NvdW50IGRlYWN0aXZhdGlvblwiKSxcbiAgICAgICAgICAgICAgICBjb250aW51ZUtpbmQ6IFwiZGFuZ2VyXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIHNhbWUgYXMgYWVzdGhldGljc0ZvclN0YWdlUGhhc2VzIGluIEludGVyYWN0aXZlQXV0aERpYWxvZyBtaW51cyB0aGUgYHRpdGxlYFxuICAgICAgICBjb25zdCBERUFDVElWQVRFX0FFU1RIRVRJQ1MgPSB7XG4gICAgICAgICAgICBbU1NPQXV0aEVudHJ5LkxPR0lOX1RZUEVdOiBkaWFsb2dBZXN0aGV0aWNzLFxuICAgICAgICAgICAgW1NTT0F1dGhFbnRyeS5VTlNUQUJMRV9MT0dJTl9UWVBFXTogZGlhbG9nQWVzdGhldGljcyxcbiAgICAgICAgICAgIFtQYXNzd29yZEF1dGhFbnRyeS5MT0dJTl9UWVBFXToge1xuICAgICAgICAgICAgICAgIFtERUZBVUxUX1BIQVNFXToge1xuICAgICAgICAgICAgICAgICAgICBib2R5OiBfdChcIlRvIGNvbnRpbnVlLCBwbGVhc2UgZW50ZXIgeW91ciBwYXNzd29yZDpcIiksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYWVzdGhldGljcyA9IERFQUNUSVZBVEVfQUVTVEhFVElDU1tzdGFnZV07XG4gICAgICAgIGxldCBib2R5VGV4dCA9IG51bGw7XG4gICAgICAgIGxldCBjb250aW51ZVRleHQgPSBudWxsO1xuICAgICAgICBsZXQgY29udGludWVLaW5kID0gbnVsbDtcbiAgICAgICAgaWYgKGFlc3RoZXRpY3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHBoYXNlQWVzdGhldGljcyA9IGFlc3RoZXRpY3NbcGhhc2VdO1xuICAgICAgICAgICAgaWYgKHBoYXNlQWVzdGhldGljcyAmJiBwaGFzZUFlc3RoZXRpY3MuYm9keSkgYm9keVRleHQgPSBwaGFzZUFlc3RoZXRpY3MuYm9keTtcbiAgICAgICAgICAgIGlmIChwaGFzZUFlc3RoZXRpY3MgJiYgcGhhc2VBZXN0aGV0aWNzLmNvbnRpbnVlVGV4dCkgY29udGludWVUZXh0ID0gcGhhc2VBZXN0aGV0aWNzLmNvbnRpbnVlVGV4dDtcbiAgICAgICAgICAgIGlmIChwaGFzZUFlc3RoZXRpY3MgJiYgcGhhc2VBZXN0aGV0aWNzLmNvbnRpbnVlS2luZCkgY29udGludWVLaW5kID0gcGhhc2VBZXN0aGV0aWNzLmNvbnRpbnVlS2luZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtib2R5VGV4dCwgY29udGludWVUZXh0LCBjb250aW51ZUtpbmR9KTtcbiAgICB9O1xuXG4gICAgX29uVUlBdXRoRmluaXNoZWQgPSAoc3VjY2VzcywgcmVzdWx0LCBleHRyYSkgPT4ge1xuICAgICAgICBpZiAoc3VjY2VzcykgcmV0dXJuOyAvLyBncmVhdCEgbWFrZVJlcXVlc3QoKSB3aWxsIGJlIGNhbGxlZCB0b28uXG5cbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gRVJST1JfVVNFUl9DQU5DRUxMRUQpIHtcbiAgICAgICAgICAgIHRoaXMuX29uQ2FuY2VsKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZHVyaW5nIFVJIEF1dGg6XCIsIHtyZXN1bHQsIGV4dHJhfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2VyclN0cjogX3QoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGNvbW11bmljYXRpbmcgd2l0aCB0aGUgc2VydmVyLiBQbGVhc2UgdHJ5IGFnYWluLlwiKX0pO1xuICAgIH07XG5cbiAgICBfb25VSUF1dGhDb21wbGV0ZSA9IChhdXRoKSA9PiB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5kZWFjdGl2YXRlQWNjb3VudChhdXRoLCB0aGlzLnN0YXRlLnNob3VsZEVyYXNlKS50aGVuKHIgPT4ge1xuICAgICAgICAgICAgLy8gRGVhY3RpdmF0aW9uIHdvcmtlZCAtIGxvZ291dCAmIGNsb3NlIHRoaXMgZGlhbG9nXG4gICAgICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgnQWNjb3VudCcsICdEZWFjdGl2YXRlIEFjY291bnQnKTtcbiAgICAgICAgICAgIExpZmVjeWNsZS5vbkxvZ2dlZE91dCgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlcnJTdHI6IF90KFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBjb21tdW5pY2F0aW5nIHdpdGggdGhlIHNlcnZlci4gUGxlYXNlIHRyeSBhZ2Fpbi5cIil9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkVyYXNlRmllbGRDaGFuZ2UgPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaG91bGRFcmFzZTogZXYudGFyZ2V0LmNoZWNrZWQsXG5cbiAgICAgICAgICAgIC8vIERpc2FibGUgdGhlIGF1dGggZm9ybSBiZWNhdXNlIHdlJ3JlIGdvaW5nIHRvIGhhdmUgdG8gcmVpbml0aWFsaXplIHRoZSBhdXRoXG4gICAgICAgICAgICAvLyBpbmZvcm1hdGlvbi4gV2UgZG8gdGhpcyBiZWNhdXNlIHdlIGNhbid0IG1vZGlmeSB0aGUgcGFyYW1ldGVycyBpbiB0aGUgVUlBXG4gICAgICAgICAgICAvLyBzZXNzaW9uLCBhbmQgdGhlIHVzZXIgd2lsbCBoYXZlIHNlbGVjdGVkIHNvbWV0aGluZyB3aGljaCBjaGFuZ2VzIHRoZSByZXF1ZXN0LlxuICAgICAgICAgICAgLy8gVGhlcmVmb3JlLCB3ZSB0aHJvdyBhd2F5IHRoZSBsYXN0IGF1dGggc2Vzc2lvbiBhbmQgdHJ5IGEgbmV3IG9uZS5cbiAgICAgICAgICAgIGF1dGhFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQXMgbWVudGlvbmVkIGFib3ZlLCBzZXQgdXAgZm9yIGF1dGggYWdhaW4gdG8gZ2V0IHVwZGF0ZWQgVUlBIHNlc3Npb24gaW5mb1xuICAgICAgICB0aGlzLl9pbml0QXV0aCgvKiBzaG91bGRFcmFzZT0gKi9ldi50YXJnZXQuY2hlY2tlZCk7XG4gICAgfTtcblxuICAgIF9vbkNhbmNlbCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9XG5cbiAgICBfaW5pdEF1dGgoc2hvdWxkRXJhc2UpIHtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmRlYWN0aXZhdGVBY2NvdW50KG51bGwsIHNob3VsZEVyYXNlKS50aGVuKHIgPT4ge1xuICAgICAgICAgICAgLy8gSWYgd2UgZ290IGhlcmUsIG9vcHMuIFRoZSBzZXJ2ZXIgZGlkbid0IHJlcXVpcmUgYW55IGF1dGguXG4gICAgICAgICAgICAvLyBPdXIgYXBwbGljYXRpb24gbGlmZWN5Y2xlIHdpbGwgY2F0Y2ggdGhlIGVycm9yIGFuZCBkbyB0aGUgbG9nb3V0IGJpdHMuXG4gICAgICAgICAgICAvLyBXZSdsbCB0cnkgdG8gbG9nIHNvbWV0aGluZyBpbiBhbiB2YWluIGF0dGVtcHQgdG8gcmVjb3JkIHdoYXQgaGFwcGVuZWQgKHN0b3JhZ2VcbiAgICAgICAgICAgIC8vIGlzIGFsc28gb2JsaXRlcmF0ZWQgb24gbG9nb3V0KS5cbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlVzZXIncyBhY2NvdW50IGdvdCBkZWFjdGl2YXRlZCB3aXRob3V0IGNvbmZpcm1hdGlvbjogU2VydmVyIGhhZCBubyBhdXRoXCIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXJyU3RyOiBfdChcIlNlcnZlciBkaWQgbm90IHJlcXVpcmUgYW55IGF1dGhlbnRpY2F0aW9uXCIpfSk7XG4gICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgaWYgKGUgJiYgZS5odHRwU3RhdHVzID09PSA0MDEgJiYgZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gVmFsaWQgVUlBIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YXV0aERhdGE6IGUuZGF0YSwgYXV0aEVuYWJsZWQ6IHRydWV9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXJyU3RyOiBfdChcIlNlcnZlciBkaWQgbm90IHJldHVybiB2YWxpZCBhdXRoZW50aWNhdGlvbiBpbmZvcm1hdGlvbi5cIil9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG5cbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyU3RyKSB7XG4gICAgICAgICAgICBlcnJvciA9IDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIj5cbiAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuZXJyU3RyIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhdXRoID0gPGRpdj57X3QoXCJMb2FkaW5nLi4uXCIpfTwvZGl2PjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXV0aERhdGEgJiYgdGhpcy5zdGF0ZS5hdXRoRW5hYmxlZCkge1xuICAgICAgICAgICAgYXV0aCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5ib2R5VGV4dH1cbiAgICAgICAgICAgICAgICAgICAgPEludGVyYWN0aXZlQXV0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50PXtNYXRyaXhDbGllbnRQZWcuZ2V0KCl9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRoRGF0YT17dGhpcy5zdGF0ZS5hdXRoRGF0YX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1ha2VSZXF1ZXN0PXt0aGlzLl9vblVJQXV0aENvbXBsZXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25BdXRoRmluaXNoZWQ9e3RoaXMuX29uVUlBdXRoRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YWdlUGhhc2VDaGFuZ2U9e3RoaXMuX29uU3RhZ2VQaGFzZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlVGV4dD17dGhpcy5zdGF0ZS5jb250aW51ZVRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZUtpbmQ9e3RoaXMuc3RhdGUuY29udGludWVLaW5kfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoaXMgaXMgb24gcHVycG9zZSBub3QgYSA8Zm9ybSAvPiB0byBwcmV2ZW50IEVudGVyIHRyaWdnZXJpbmcgc3VibWlzc2lvbiwgdG8gZnVydGhlciBwcmV2ZW50IGFjY2lkZW50c1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfRGVhY3RpdmF0ZUFjY291bnREaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZUNsYXNzPVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJEZWFjdGl2YXRlIEFjY291bnRcIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHdpbGwgbWFrZSB5b3VyIGFjY291bnQgcGVybWFuZW50bHkgdW51c2FibGUuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiWW91IHdpbGwgbm90IGJlIGFibGUgdG8gbG9nIGluLCBhbmQgbm8gb25lIHdpbGwgYmUgYWJsZSB0byByZS1yZWdpc3RlciB0aGUgc2FtZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInVzZXIgSUQuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyB3aWxsIGNhdXNlIHlvdXIgYWNjb3VudCB0byBsZWF2ZSBhbGwgcm9vbXMgaXQgaXMgcGFydGljaXBhdGluZyBpbiwgYW5kIGl0IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2lsbCByZW1vdmUgeW91ciBhY2NvdW50IGRldGFpbHMgZnJvbSB5b3VyIGlkZW50aXR5IHNlcnZlci4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8Yj5UaGlzIGFjdGlvbiBpcyBpcnJldmVyc2libGUuPC9iPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGI6IChzdWIpID0+IDxiPiB7IHN1YiB9IDwvYj4gfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9PC9wPlxuXG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkRlYWN0aXZhdGluZyB5b3VyIGFjY291bnQgPGI+ZG9lcyBub3QgYnkgZGVmYXVsdCBjYXVzZSB1cyB0byBmb3JnZXQgbWVzc2FnZXMgeW91IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGF2ZSBzZW50LjwvYj4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3Ugd291bGQgbGlrZSB1cyB0byBmb3JnZXQgeW91ciBtZXNzYWdlcywgcGxlYXNlIHRpY2sgdGhlIGJveCBiZWxvdy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBiOiAoc3ViKSA9PiA8Yj4geyBzdWIgfSA8L2I+IH0sXG4gICAgICAgICAgICAgICAgICAgICkgfTwvcD5cblxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJNZXNzYWdlIHZpc2liaWxpdHkgaW4gTWF0cml4IGlzIHNpbWlsYXIgdG8gZW1haWwuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3VyIGZvcmdldHRpbmcgeW91ciBtZXNzYWdlcyBtZWFucyB0aGF0IG1lc3NhZ2VzIHlvdSBoYXZlIHNlbnQgd2lsbCBub3QgYmUgc2hhcmVkIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2l0aCBhbnkgbmV3IG9yIHVucmVnaXN0ZXJlZCB1c2VycywgYnV0IHJlZ2lzdGVyZWQgdXNlcnMgd2hvIGFscmVhZHkgaGF2ZSBhY2Nlc3MgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0byB0aGVzZSBtZXNzYWdlcyB3aWxsIHN0aWxsIGhhdmUgYWNjZXNzIHRvIHRoZWlyIGNvcHkuXCIsXG4gICAgICAgICAgICAgICAgICAgICkgfTwvcD5cblxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RlYWN0aXZhdGVBY2NvdW50RGlhbG9nX2lucHV0X3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnN0YXRlLnNob3VsZEVyYXNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25FcmFzZUZpZWxkQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJQbGVhc2UgZm9yZ2V0IGFsbCBtZXNzYWdlcyBJIGhhdmUgc2VudCB3aGVuIG15IGFjY291bnQgaXMgZGVhY3RpdmF0ZWQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIoPGI+V2FybmluZzo8L2I+IHRoaXMgd2lsbCBjYXVzZSBmdXR1cmUgdXNlcnMgdG8gc2VlIGFuIGluY29tcGxldGUgdmlldyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm9mIGNvbnZlcnNhdGlvbnMpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYjogKHN1YikgPT4gPGI+eyBzdWIgfTwvYj4gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICB7ZXJyb3J9XG4gICAgICAgICAgICAgICAgICAgICAgICB7YXV0aH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbkRlYWN0aXZhdGVBY2NvdW50RGlhbG9nLnByb3BUeXBlcyA9IHtcbiAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxufTtcbiJdfQ==
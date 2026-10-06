"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getEntryComponentForLoginType;
exports.FallbackAuthEntry = exports.SSOAuthEntry = exports.MsisdnAuthEntry = exports.EmailIdentityAuthEntry = exports.TermsAuthEntry = exports.RecaptchaAuthEntry = exports.PasswordAuthEntry = exports.DEFAULT_PHASE = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
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

/* This file contains a collection of components which are used by the
 * InteractiveAuth to prompt the user to enter the information needed
 * for an auth stage. (The intention is that they could also be used for other
 * components, such as the registration flow).
 *
 * Call getEntryComponentForLoginType() to get a component suitable for a
 * particular login type. Each component requires the same properties:
 *
 * matrixClient:           A matrix client. May be a different one to the one
 *                         currently being used generally (eg. to register with
 *                         one HS whilst beign a guest on another).
 * loginType:              the login type of the auth stage being attempted
 * authSessionId:          session id from the server
 * clientSecret:           The client secret in use for ID server auth sessions
 * stageParams:            params from the server for the stage being attempted
 * errorText:              error message from a previous attempt to authenticate
 * submitAuthDict:         a function which will be called with the new auth dict
 * busy:                   a boolean indicating whether the auth logic is doing something
 *                         the user needs to wait for.
 * inputs:                 Object of inputs provided by the user, as in js-sdk
 *                         interactive-auth
 * stageState:             Stage-specific object used for communicating state information
 *                         to the UI from the state-specific auth logic.
 *                         Defined keys for stages are:
 *                             m.login.email.identity:
 *                              * emailSid: string representing the sid of the active
 *                                          verification session from the ID server, or
 *                                          null if no session is active.
 * fail:                   a function which should be called with an error object if an
 *                         error occurred during the auth stage. This will cause the auth
 *                         session to be failed and the process to go back to the start.
 * setEmailSid:            m.login.email.identity only: a function to be called with the
 *                         email sid after a token is requested.
 * onPhaseChange:          A function which is called when the stage's phase changes. If
 *                         the stage has no phases, call this with DEFAULT_PHASE. Takes
 *                         one argument, the phase, and is always defined/required.
 * continueText:           For stages which have a continue button, the text to use.
 * continueKind:           For stages which have a continue button, the style of button to
 *                         use. For example, 'danger' or 'primary'.
 * onCancel                A function with no arguments which is called by the stage if the
 *                         user knowingly cancelled/dismissed the authentication attempt.
 *
 * Each component may also provide the following functions (beyond the standard React ones):
 *    focus: set the input focus appropriately in the form.
 */
const DEFAULT_PHASE = 0;
exports.DEFAULT_PHASE = DEFAULT_PHASE;

class PasswordAuthEntry extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      password: ""
    });
    (0, _defineProperty2.default)(this, "_onSubmit", e => {
      e.preventDefault();
      if (this.props.busy) return;
      this.props.submitAuthDict({
        type: PasswordAuthEntry.LOGIN_TYPE,
        // TODO: Remove `user` once servers support proper UIA
        // See https://github.com/vector-im/element-web/issues/10312
        user: this.props.matrixClient.credentials.userId,
        identifier: {
          type: "m.id.user",
          user: this.props.matrixClient.credentials.userId
        },
        password: this.state.password
      });
    });
    (0, _defineProperty2.default)(this, "_onPasswordFieldChange", ev => {
      // enable the submit button iff the password is non-empty
      this.setState({
        password: ev.target.value
      });
    });
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  render() {
    const passwordBoxClass = (0, _classnames.default)({
      "error": this.props.errorText
    });
    let submitButtonOrSpinner;

    if (this.props.busy) {
      const Loader = sdk.getComponent("elements.Spinner");
      submitButtonOrSpinner = /*#__PURE__*/_react.default.createElement(Loader, null);
    } else {
      submitButtonOrSpinner = /*#__PURE__*/_react.default.createElement("input", {
        type: "submit",
        className: "mx_Dialog_primary",
        disabled: !this.state.password,
        value: (0, _languageHandler._t)("Continue")
      });
    }

    let errorSection;

    if (this.props.errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, this.props.errorText);
    }

    const Field = sdk.getComponent('elements.Field');
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Confirm your identity by entering your account password below.")), /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onSubmit,
      className: "mx_InteractiveAuthEntryComponents_passwordSection"
    }, /*#__PURE__*/_react.default.createElement(Field, {
      className: passwordBoxClass,
      type: "password",
      name: "passwordField",
      label: (0, _languageHandler._t)('Password'),
      autoFocus: true,
      value: this.state.password,
      onChange: this._onPasswordFieldChange
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_button_row"
    }, submitButtonOrSpinner)), errorSection);
  }

}

exports.PasswordAuthEntry = PasswordAuthEntry;
(0, _defineProperty2.default)(PasswordAuthEntry, "LOGIN_TYPE", "m.login.password");
(0, _defineProperty2.default)(PasswordAuthEntry, "propTypes", {
  matrixClient: _propTypes.default.object.isRequired,
  submitAuthDict: _propTypes.default.func.isRequired,
  errorText: _propTypes.default.string,
  // is the auth logic currently waiting for something to
  // happen?
  busy: _propTypes.default.bool,
  onPhaseChange: _propTypes.default.func.isRequired
});

class RecaptchaAuthEntry extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onCaptchaResponse", response => {
      _CountlyAnalytics.default.instance.track("onboarding_grecaptcha_submit");

      this.props.submitAuthDict({
        type: RecaptchaAuthEntry.LOGIN_TYPE,
        response: response
      });
    });
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  render() {
    if (this.props.busy) {
      const Loader = sdk.getComponent("elements.Spinner");
      return /*#__PURE__*/_react.default.createElement(Loader, null);
    }

    let errorText = this.props.errorText;
    const CaptchaForm = sdk.getComponent("views.auth.CaptchaForm");
    let sitePublicKey;

    if (!this.props.stageParams || !this.props.stageParams.public_key) {
      errorText = (0, _languageHandler._t)("Missing captcha public key in homeserver configuration. Please report " + "this to your homeserver administrator.");
    } else {
      sitePublicKey = this.props.stageParams.public_key;
    }

    let errorSection;

    if (errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, errorText);
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(CaptchaForm, {
      sitePublicKey: sitePublicKey,
      onCaptchaResponse: this._onCaptchaResponse
    }), errorSection);
  }

}

exports.RecaptchaAuthEntry = RecaptchaAuthEntry;
(0, _defineProperty2.default)(RecaptchaAuthEntry, "LOGIN_TYPE", "m.login.recaptcha");
(0, _defineProperty2.default)(RecaptchaAuthEntry, "propTypes", {
  submitAuthDict: _propTypes.default.func.isRequired,
  stageParams: _propTypes.default.object.isRequired,
  errorText: _propTypes.default.string,
  busy: _propTypes.default.bool,
  onPhaseChange: _propTypes.default.func.isRequired
});

class TermsAuthEntry extends _react.default.Component {
  constructor(props) {
    super(props); // example stageParams:
    //
    // {
    //     "policies": {
    //         "privacy_policy": {
    //             "version": "1.0",
    //             "en": {
    //                 "name": "Privacy Policy",
    //                 "url": "https://example.org/privacy-1.0-en.html",
    //             },
    //             "fr": {
    //                 "name": "Politique de confidentialité",
    //                 "url": "https://example.org/privacy-1.0-fr.html",
    //             },
    //         },
    //         "other_policy": { ... },
    //     }
    // }

    (0, _defineProperty2.default)(this, "tryContinue", () => {
      this._trySubmit();
    });
    (0, _defineProperty2.default)(this, "_trySubmit", () => {
      let allChecked = true;

      for (const policy of this.state.policies) {
        const checked = this.state.toggledPolicies[policy.id];
        allChecked = allChecked && checked;
      }

      if (allChecked) {
        this.props.submitAuthDict({
          type: TermsAuthEntry.LOGIN_TYPE
        });

        _CountlyAnalytics.default.instance.track("onboarding_terms_complete");
      } else {
        this.setState({
          errorText: (0, _languageHandler._t)("Please review and accept all of the homeserver's policies")
        });
      }
    });
    const allPolicies = this.props.stageParams.policies || {};

    const prefLang = _SettingsStore.default.getValue("language");

    const initToggles = {};
    const pickedPolicies = [];

    for (const policyId of Object.keys(allPolicies)) {
      const policy = allPolicies[policyId]; // Pick a language based on the user's language, falling back to english,
      // and finally to the first language available. If there's still no policy
      // available then the homeserver isn't respecting the spec.

      let langPolicy = policy[prefLang];
      if (!langPolicy) langPolicy = policy["en"];

      if (!langPolicy) {
        // last resort
        const firstLang = Object.keys(policy).find(e => e !== "version");
        langPolicy = policy[firstLang];
      }

      if (!langPolicy) throw new Error("Failed to find a policy to show the user");
      initToggles[policyId] = false;
      langPolicy.id = policyId;
      pickedPolicies.push(langPolicy);
    }

    this.state = {
      toggledPolicies: initToggles,
      policies: pickedPolicies
    };

    _CountlyAnalytics.default.instance.track("onboarding_terms_begin");
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  _togglePolicy(policyId) {
    const newToggles = {};

    for (const policy of this.state.policies) {
      let checked = this.state.toggledPolicies[policy.id];
      if (policy.id === policyId) checked = !checked;
      newToggles[policy.id] = checked;
    }

    this.setState({
      "toggledPolicies": newToggles
    });
  }

  render() {
    if (this.props.busy) {
      const Loader = sdk.getComponent("elements.Spinner");
      return /*#__PURE__*/_react.default.createElement(Loader, null);
    }

    const checkboxes = [];
    let allChecked = true;

    for (const policy of this.state.policies) {
      const checked = this.state.toggledPolicies[policy.id];
      allChecked = allChecked && checked;
      checkboxes.push(
      /*#__PURE__*/
      // XXX: replace with StyledCheckbox
      _react.default.createElement("label", {
        key: "policy_checkbox_" + policy.id,
        className: "mx_InteractiveAuthEntryComponents_termsPolicy"
      }, /*#__PURE__*/_react.default.createElement("input", {
        type: "checkbox",
        onChange: () => this._togglePolicy(policy.id),
        checked: checked
      }), /*#__PURE__*/_react.default.createElement("a", {
        href: policy.url,
        target: "_blank",
        rel: "noreferrer noopener"
      }, policy.name)));
    }

    let errorSection;

    if (this.props.errorText || this.state.errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, this.props.errorText || this.state.errorText);
    }

    let submitButton;

    if (this.props.showContinue !== false) {
      // XXX: button classes
      submitButton = /*#__PURE__*/_react.default.createElement("button", {
        className: "mx_InteractiveAuthEntryComponents_termsSubmit mx_GeneralButton",
        onClick: this._trySubmit,
        disabled: !allChecked
      }, (0, _languageHandler._t)("Accept"));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please review and accept the policies of this homeserver:")), checkboxes, errorSection, submitButton);
  }

}

exports.TermsAuthEntry = TermsAuthEntry;
(0, _defineProperty2.default)(TermsAuthEntry, "LOGIN_TYPE", "m.login.terms");
(0, _defineProperty2.default)(TermsAuthEntry, "propTypes", {
  submitAuthDict: _propTypes.default.func.isRequired,
  stageParams: _propTypes.default.object.isRequired,
  errorText: _propTypes.default.string,
  busy: _propTypes.default.bool,
  showContinue: _propTypes.default.bool,
  onPhaseChange: _propTypes.default.func.isRequired
});

class EmailIdentityAuthEntry extends _react.default.Component {
  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  render() {
    // This component is now only displayed once the token has been requested,
    // so we know the email has been sent. It can also get loaded after the user
    // has clicked the validation link if the server takes a while to propagate
    // the validation internally. If we're in the session spawned from clicking
    // the validation link, we won't know the email address, so if we don't have it,
    // assume that the link has been clicked and the server will realise when we poll.
    if (this.props.inputs.emailAddress === undefined) {
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else if (this.props.stageState?.emailSid) {
      // we only have a session ID if the user has clicked the link in their email,
      // so show a loading state instead of "an email has been sent to..." because
      // that's confusing when you've already read that email.
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InteractiveAuthEntryComponents_emailWrapper"
      }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("A confirmation email has been sent to %(emailAddress)s", {
        emailAddress: sub => /*#__PURE__*/_react.default.createElement("b", null, this.props.inputs.emailAddress)
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Open the link in the email to continue registration.")));
    }
  }

}

exports.EmailIdentityAuthEntry = EmailIdentityAuthEntry;
(0, _defineProperty2.default)(EmailIdentityAuthEntry, "LOGIN_TYPE", "m.login.email.identity");
(0, _defineProperty2.default)(EmailIdentityAuthEntry, "propTypes", {
  matrixClient: _propTypes.default.object.isRequired,
  submitAuthDict: _propTypes.default.func.isRequired,
  authSessionId: _propTypes.default.string.isRequired,
  clientSecret: _propTypes.default.string.isRequired,
  inputs: _propTypes.default.object.isRequired,
  stageState: _propTypes.default.object.isRequired,
  fail: _propTypes.default.func.isRequired,
  setEmailSid: _propTypes.default.func.isRequired,
  onPhaseChange: _propTypes.default.func.isRequired
});

class MsisdnAuthEntry extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      token: '',
      requestingToken: false
    });
    (0, _defineProperty2.default)(this, "_onTokenChange", e => {
      this.setState({
        token: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_onFormSubmit", async e => {
      e.preventDefault();
      if (this.state.token == '') return;
      this.setState({
        errorText: null
      });

      try {
        let result;

        if (this._submitUrl) {
          result = await this.props.matrixClient.submitMsisdnTokenOtherUrl(this._submitUrl, this._sid, this.props.clientSecret, this.state.token);
        } else {
          throw new Error("The registration with MSISDN flow is misconfigured");
        }

        if (result.success) {
          const creds = {
            sid: this._sid,
            client_secret: this.props.clientSecret
          };
          this.props.submitAuthDict({
            type: MsisdnAuthEntry.LOGIN_TYPE,
            // TODO: Remove `threepid_creds` once servers support proper UIA
            // See https://github.com/vector-im/element-web/issues/10312
            // See https://github.com/matrix-org/matrix-doc/issues/2220
            threepid_creds: creds,
            threepidCreds: creds
          });
        } else {
          this.setState({
            errorText: (0, _languageHandler._t)("Token incorrect")
          });
        }
      } catch (e) {
        this.props.fail(e);
        console.log("Failed to submit msisdn token");
      }
    });
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
    this._submitUrl = null;
    this._sid = null;
    this._msisdn = null;
    this._tokenBox = null;
    this.setState({
      requestingToken: true
    });

    this._requestMsisdnToken().catch(e => {
      this.props.fail(e);
    }).finally(() => {
      this.setState({
        requestingToken: false
      });
    });
  }
  /*
   * Requests a verification token by SMS.
   */


  _requestMsisdnToken() {
    return this.props.matrixClient.requestRegisterMsisdnToken(this.props.inputs.phoneCountry, this.props.inputs.phoneNumber, this.props.clientSecret, 1 // TODO: Multiple send attempts?
    ).then(result => {
      this._submitUrl = result.submit_url;
      this._sid = result.sid;
      this._msisdn = result.msisdn;
    });
  }

  render() {
    if (this.state.requestingToken) {
      const Loader = sdk.getComponent("elements.Spinner");
      return /*#__PURE__*/_react.default.createElement(Loader, null);
    } else {
      const enableSubmit = Boolean(this.state.token);
      const submitClasses = (0, _classnames.default)({
        mx_InteractiveAuthEntryComponents_msisdnSubmit: true,
        mx_GeneralButton: true
      });
      let errorSection;

      if (this.state.errorText) {
        errorSection = /*#__PURE__*/_react.default.createElement("div", {
          className: "error",
          role: "alert"
        }, this.state.errorText);
      }

      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("A text message has been sent to %(msisdn)s", {
        msisdn: /*#__PURE__*/_react.default.createElement("i", null, this._msisdn)
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please enter the code it contains:")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InteractiveAuthEntryComponents_msisdnWrapper"
      }, /*#__PURE__*/_react.default.createElement("form", {
        onSubmit: this._onFormSubmit
      }, /*#__PURE__*/_react.default.createElement("input", {
        type: "text",
        className: "mx_InteractiveAuthEntryComponents_msisdnEntry",
        value: this.state.token,
        onChange: this._onTokenChange,
        "aria-label": (0, _languageHandler._t)("Code")
      }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("input", {
        type: "submit",
        value: (0, _languageHandler._t)("Submit"),
        className: submitClasses,
        disabled: !enableSubmit
      })), errorSection));
    }
  }

}

exports.MsisdnAuthEntry = MsisdnAuthEntry;
(0, _defineProperty2.default)(MsisdnAuthEntry, "LOGIN_TYPE", "m.login.msisdn");
(0, _defineProperty2.default)(MsisdnAuthEntry, "propTypes", {
  inputs: _propTypes.default.shape({
    phoneCountry: _propTypes.default.string,
    phoneNumber: _propTypes.default.string
  }),
  fail: _propTypes.default.func,
  clientSecret: _propTypes.default.func,
  submitAuthDict: _propTypes.default.func.isRequired,
  matrixClient: _propTypes.default.object,
  onPhaseChange: _propTypes.default.func.isRequired
});

class SSOAuthEntry extends _react.default.Component {
  // button to start SSO
  // button to confirm SSO completed
  constructor(props) {
    super(props); // We actually send the user through fallback auth so we don't have to
    // deal with a redirect back to us, losing application context.

    (0, _defineProperty2.default)(this, "_ssoUrl", void 0);
    (0, _defineProperty2.default)(this, "attemptFailed", () => {
      this.setState({
        attemptFailed: true
      });
    });
    (0, _defineProperty2.default)(this, "_onReceiveMessage", event => {
      if (event.data === "authDone" && event.origin === this.props.matrixClient.getHomeserverUrl()) {
        if (this._popupWindow) {
          this._popupWindow.close();

          this._popupWindow = null;
        }
      }
    });
    (0, _defineProperty2.default)(this, "onStartAuthClick", () => {
      // Note: We don't use PlatformPeg's startSsoAuth functions because we almost
      // certainly will need to open the thing in a new tab to avoid losing application
      // context.
      this._popupWindow = window.open(this._ssoUrl, "_blank");
      this.setState({
        phase: SSOAuthEntry.PHASE_POSTAUTH
      });
      this.props.onPhaseChange(SSOAuthEntry.PHASE_POSTAUTH);
    });
    (0, _defineProperty2.default)(this, "onConfirmClick", () => {
      this.props.submitAuthDict({});
    });
    this._ssoUrl = props.matrixClient.getFallbackAuthUrl(this.props.loginType, this.props.authSessionId);
    this._popupWindow = null;
    window.addEventListener("message", this._onReceiveMessage);
    this.state = {
      phase: SSOAuthEntry.PHASE_PREAUTH,
      attemptFailed: false
    };
  }

  componentDidMount()
  /*: void*/
  {
    this.props.onPhaseChange(SSOAuthEntry.PHASE_PREAUTH);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this._onReceiveMessage);

    if (this._popupWindow) {
      this._popupWindow.close();

      this._popupWindow = null;
    }
  }

  render() {
    let continueButton = null;

    const cancelButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.props.onCancel,
      kind: this.props.continueKind ? this.props.continueKind + '_outline' : 'primary_outline'
    }, (0, _languageHandler._t)("Cancel"));

    if (this.state.phase === SSOAuthEntry.PHASE_PREAUTH) {
      continueButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onStartAuthClick,
        kind: this.props.continueKind || 'primary'
      }, this.props.continueText || (0, _languageHandler._t)("Single Sign On"));
    } else {
      continueButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onConfirmClick,
        kind: this.props.continueKind || 'primary'
      }, this.props.continueText || (0, _languageHandler._t)("Confirm"));
    }

    let errorSection;

    if (this.props.errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, this.props.errorText);
    } else if (this.state.attemptFailed) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, (0, _languageHandler._t)("Something went wrong in confirming your identity. Cancel and try again."));
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, errorSection, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InteractiveAuthEntryComponents_sso_buttons"
    }, cancelButton, continueButton));
  }

}

exports.SSOAuthEntry = SSOAuthEntry;
(0, _defineProperty2.default)(SSOAuthEntry, "propTypes", {
  matrixClient: _propTypes.default.object.isRequired,
  authSessionId: _propTypes.default.string.isRequired,
  loginType: _propTypes.default.string.isRequired,
  submitAuthDict: _propTypes.default.func.isRequired,
  errorText: _propTypes.default.string,
  onPhaseChange: _propTypes.default.func.isRequired,
  continueText: _propTypes.default.string,
  continueKind: _propTypes.default.string,
  onCancel: _propTypes.default.func
});
(0, _defineProperty2.default)(SSOAuthEntry, "LOGIN_TYPE", "m.login.sso");
(0, _defineProperty2.default)(SSOAuthEntry, "UNSTABLE_LOGIN_TYPE", "org.matrix.login.sso");
(0, _defineProperty2.default)(SSOAuthEntry, "PHASE_PREAUTH", 1);
(0, _defineProperty2.default)(SSOAuthEntry, "PHASE_POSTAUTH", 2);

class FallbackAuthEntry extends _react.default.Component {
  constructor(props) {
    super(props); // we have to make the user click a button, as browsers will block
    // the popup if we open it immediately.

    (0, _defineProperty2.default)(this, "focus", () => {
      if (this._fallbackButton.current) {
        this._fallbackButton.current.focus();
      }
    });
    (0, _defineProperty2.default)(this, "_onShowFallbackClick", e => {
      e.preventDefault();
      e.stopPropagation();
      const url = this.props.matrixClient.getFallbackAuthUrl(this.props.loginType, this.props.authSessionId);
      this._popupWindow = window.open(url, "_blank");
    });
    (0, _defineProperty2.default)(this, "_onReceiveMessage", event => {
      if (event.data === "authDone" && event.origin === this.props.matrixClient.getHomeserverUrl()) {
        this.props.submitAuthDict({});
      }
    });
    this._popupWindow = null;
    window.addEventListener("message", this._onReceiveMessage);
    this._fallbackButton = /*#__PURE__*/(0, _react.createRef)();
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this._onReceiveMessage);

    if (this._popupWindow) {
      this._popupWindow.close();
    }
  }

  render() {
    let errorSection;

    if (this.props.errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, this.props.errorText);
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("a", {
      href: "",
      ref: this._fallbackButton,
      onClick: this._onShowFallbackClick
    }, (0, _languageHandler._t)("Start authentication")), errorSection);
  }

}

exports.FallbackAuthEntry = FallbackAuthEntry;
(0, _defineProperty2.default)(FallbackAuthEntry, "propTypes", {
  matrixClient: _propTypes.default.object.isRequired,
  authSessionId: _propTypes.default.string.isRequired,
  loginType: _propTypes.default.string.isRequired,
  submitAuthDict: _propTypes.default.func.isRequired,
  errorText: _propTypes.default.string,
  onPhaseChange: _propTypes.default.func.isRequired
});
const AuthEntryComponents = [PasswordAuthEntry, RecaptchaAuthEntry, EmailIdentityAuthEntry, MsisdnAuthEntry, TermsAuthEntry, SSOAuthEntry];

function getEntryComponentForLoginType(loginType) {
  for (const c of AuthEntryComponents) {
    if (c.LOGIN_TYPE === loginType || c.UNSTABLE_LOGIN_TYPE === loginType) {
      return c;
    }
  }

  return FallbackAuthEntry;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRfUEhBU0UiLCJQYXNzd29yZEF1dGhFbnRyeSIsIlJlYWN0IiwiQ29tcG9uZW50IiwicGFzc3dvcmQiLCJlIiwicHJldmVudERlZmF1bHQiLCJwcm9wcyIsImJ1c3kiLCJzdWJtaXRBdXRoRGljdCIsInR5cGUiLCJMT0dJTl9UWVBFIiwidXNlciIsIm1hdHJpeENsaWVudCIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwiaWRlbnRpZmllciIsInN0YXRlIiwiZXYiLCJzZXRTdGF0ZSIsInRhcmdldCIsInZhbHVlIiwiY29tcG9uZW50RGlkTW91bnQiLCJvblBoYXNlQ2hhbmdlIiwicmVuZGVyIiwicGFzc3dvcmRCb3hDbGFzcyIsImVycm9yVGV4dCIsInN1Ym1pdEJ1dHRvbk9yU3Bpbm5lciIsIkxvYWRlciIsInNkayIsImdldENvbXBvbmVudCIsImVycm9yU2VjdGlvbiIsIkZpZWxkIiwiX29uU3VibWl0IiwiX29uUGFzc3dvcmRGaWVsZENoYW5nZSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJmdW5jIiwic3RyaW5nIiwiYm9vbCIsIlJlY2FwdGNoYUF1dGhFbnRyeSIsInJlc3BvbnNlIiwiQ291bnRseUFuYWx5dGljcyIsImluc3RhbmNlIiwidHJhY2siLCJDYXB0Y2hhRm9ybSIsInNpdGVQdWJsaWNLZXkiLCJzdGFnZVBhcmFtcyIsInB1YmxpY19rZXkiLCJfb25DYXB0Y2hhUmVzcG9uc2UiLCJUZXJtc0F1dGhFbnRyeSIsImNvbnN0cnVjdG9yIiwiX3RyeVN1Ym1pdCIsImFsbENoZWNrZWQiLCJwb2xpY3kiLCJwb2xpY2llcyIsImNoZWNrZWQiLCJ0b2dnbGVkUG9saWNpZXMiLCJpZCIsImFsbFBvbGljaWVzIiwicHJlZkxhbmciLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJpbml0VG9nZ2xlcyIsInBpY2tlZFBvbGljaWVzIiwicG9saWN5SWQiLCJPYmplY3QiLCJrZXlzIiwibGFuZ1BvbGljeSIsImZpcnN0TGFuZyIsImZpbmQiLCJFcnJvciIsInB1c2giLCJfdG9nZ2xlUG9saWN5IiwibmV3VG9nZ2xlcyIsImNoZWNrYm94ZXMiLCJ1cmwiLCJuYW1lIiwic3VibWl0QnV0dG9uIiwic2hvd0NvbnRpbnVlIiwiRW1haWxJZGVudGl0eUF1dGhFbnRyeSIsImlucHV0cyIsImVtYWlsQWRkcmVzcyIsInVuZGVmaW5lZCIsInN0YWdlU3RhdGUiLCJlbWFpbFNpZCIsInN1YiIsImF1dGhTZXNzaW9uSWQiLCJjbGllbnRTZWNyZXQiLCJmYWlsIiwic2V0RW1haWxTaWQiLCJNc2lzZG5BdXRoRW50cnkiLCJ0b2tlbiIsInJlcXVlc3RpbmdUb2tlbiIsInJlc3VsdCIsIl9zdWJtaXRVcmwiLCJzdWJtaXRNc2lzZG5Ub2tlbk90aGVyVXJsIiwiX3NpZCIsInN1Y2Nlc3MiLCJjcmVkcyIsInNpZCIsImNsaWVudF9zZWNyZXQiLCJ0aHJlZXBpZF9jcmVkcyIsInRocmVlcGlkQ3JlZHMiLCJjb25zb2xlIiwibG9nIiwiX21zaXNkbiIsIl90b2tlbkJveCIsIl9yZXF1ZXN0TXNpc2RuVG9rZW4iLCJjYXRjaCIsImZpbmFsbHkiLCJyZXF1ZXN0UmVnaXN0ZXJNc2lzZG5Ub2tlbiIsInBob25lQ291bnRyeSIsInBob25lTnVtYmVyIiwidGhlbiIsInN1Ym1pdF91cmwiLCJtc2lzZG4iLCJlbmFibGVTdWJtaXQiLCJCb29sZWFuIiwic3VibWl0Q2xhc3NlcyIsIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19tc2lzZG5TdWJtaXQiLCJteF9HZW5lcmFsQnV0dG9uIiwiX29uRm9ybVN1Ym1pdCIsIl9vblRva2VuQ2hhbmdlIiwic2hhcGUiLCJTU09BdXRoRW50cnkiLCJhdHRlbXB0RmFpbGVkIiwiZXZlbnQiLCJkYXRhIiwib3JpZ2luIiwiZ2V0SG9tZXNlcnZlclVybCIsIl9wb3B1cFdpbmRvdyIsImNsb3NlIiwid2luZG93Iiwib3BlbiIsIl9zc29VcmwiLCJwaGFzZSIsIlBIQVNFX1BPU1RBVVRIIiwiZ2V0RmFsbGJhY2tBdXRoVXJsIiwibG9naW5UeXBlIiwiYWRkRXZlbnRMaXN0ZW5lciIsIl9vblJlY2VpdmVNZXNzYWdlIiwiUEhBU0VfUFJFQVVUSCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNvbnRpbnVlQnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwib25DYW5jZWwiLCJjb250aW51ZUtpbmQiLCJvblN0YXJ0QXV0aENsaWNrIiwiY29udGludWVUZXh0Iiwib25Db25maXJtQ2xpY2siLCJGYWxsYmFja0F1dGhFbnRyeSIsIl9mYWxsYmFja0J1dHRvbiIsImN1cnJlbnQiLCJmb2N1cyIsInN0b3BQcm9wYWdhdGlvbiIsIl9vblNob3dGYWxsYmFja0NsaWNrIiwiQXV0aEVudHJ5Q29tcG9uZW50cyIsImdldEVudHJ5Q29tcG9uZW50Rm9yTG9naW5UeXBlIiwiYyIsIlVOU1RBQkxFX0xPR0lOX1RZUEUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVPLE1BQU1BLGFB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QUNVO0FBQ2Y1SSxFQUFBQSxZQUFZLEVBQUVzQixtQkFBVUMsTUFBVixDQUFpQkMsVUFEaEI7QUFFZm1ELEVBQUFBLGFBQWEsRUFBRXJELG1CQUFVSSxNQUFWLENBQWlCRixVQUZqQjtBQUdmdUcsRUFBQUEsU0FBUyxFQUFFekcsbUJBQVVJLE1BQVYsQ0FBaUJGLFVBSGI7QUFJZjVCLEVBQUFBLGNBQWMsRUFBRTBCLG1CQUFVRyxJQUFWLENBQWVELFVBSmhCO0FBS2ZYLEVBQUFBLFNBQVMsRUFBRVMsbUJBQVVJLE1BTE47QUFNZmhCLEVBQUFBLGFBQWEsRUFBRVksbUJBQVVHLElBQVYsQ0FBZUQ7QUFOZixDO0FBNEV2QixNQUFNMEgsbUJBQW1CLEdBQUcsQ0FDeEI5SixpQkFEd0IsRUFFeEJ3QyxrQkFGd0IsRUFHeEJ3QyxzQkFId0IsRUFJeEJXLGVBSndCLEVBS3hCekMsY0FMd0IsRUFNeEIyRSxZQU53QixDQUE1Qjs7QUFTZSxTQUFTa0MsNkJBQVQsQ0FBdUNwQixTQUF2QyxFQUFrRDtBQUM3RCxPQUFLLE1BQU1xQixDQUFYLElBQWdCRixtQkFBaEIsRUFBcUM7QUFDakMsUUFBSUUsQ0FBQyxDQUFDdEosVUFBRixLQUFpQmlJLFNBQWpCLElBQThCcUIsQ0FBQyxDQUFDQyxtQkFBRixLQUEwQnRCLFNBQTVELEVBQXVFO0FBQ25FLGFBQU9xQixDQUFQO0FBQ0g7QUFDSjs7QUFDRCxTQUFPUixpQkFBUDtBQUNIIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuLi8uLi8uLi9Db3VudGx5QW5hbHl0aWNzXCI7XG5cbi8qIFRoaXMgZmlsZSBjb250YWlucyBhIGNvbGxlY3Rpb24gb2YgY29tcG9uZW50cyB3aGljaCBhcmUgdXNlZCBieSB0aGVcbiAqIEludGVyYWN0aXZlQXV0aCB0byBwcm9tcHQgdGhlIHVzZXIgdG8gZW50ZXIgdGhlIGluZm9ybWF0aW9uIG5lZWRlZFxuICogZm9yIGFuIGF1dGggc3RhZ2UuIChUaGUgaW50ZW50aW9uIGlzIHRoYXQgdGhleSBjb3VsZCBhbHNvIGJlIHVzZWQgZm9yIG90aGVyXG4gKiBjb21wb25lbnRzLCBzdWNoIGFzIHRoZSByZWdpc3RyYXRpb24gZmxvdykuXG4gKlxuICogQ2FsbCBnZXRFbnRyeUNvbXBvbmVudEZvckxvZ2luVHlwZSgpIHRvIGdldCBhIGNvbXBvbmVudCBzdWl0YWJsZSBmb3IgYVxuICogcGFydGljdWxhciBsb2dpbiB0eXBlLiBFYWNoIGNvbXBvbmVudCByZXF1aXJlcyB0aGUgc2FtZSBwcm9wZXJ0aWVzOlxuICpcbiAqIG1hdHJpeENsaWVudDogICAgICAgICAgIEEgbWF0cml4IGNsaWVudC4gTWF5IGJlIGEgZGlmZmVyZW50IG9uZSB0byB0aGUgb25lXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50bHkgYmVpbmcgdXNlZCBnZW5lcmFsbHkgKGVnLiB0byByZWdpc3RlciB3aXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBvbmUgSFMgd2hpbHN0IGJlaWduIGEgZ3Vlc3Qgb24gYW5vdGhlcikuXG4gKiBsb2dpblR5cGU6ICAgICAgICAgICAgICB0aGUgbG9naW4gdHlwZSBvZiB0aGUgYXV0aCBzdGFnZSBiZWluZyBhdHRlbXB0ZWRcbiAqIGF1dGhTZXNzaW9uSWQ6ICAgICAgICAgIHNlc3Npb24gaWQgZnJvbSB0aGUgc2VydmVyXG4gKiBjbGllbnRTZWNyZXQ6ICAgICAgICAgICBUaGUgY2xpZW50IHNlY3JldCBpbiB1c2UgZm9yIElEIHNlcnZlciBhdXRoIHNlc3Npb25zXG4gKiBzdGFnZVBhcmFtczogICAgICAgICAgICBwYXJhbXMgZnJvbSB0aGUgc2VydmVyIGZvciB0aGUgc3RhZ2UgYmVpbmcgYXR0ZW1wdGVkXG4gKiBlcnJvclRleHQ6ICAgICAgICAgICAgICBlcnJvciBtZXNzYWdlIGZyb20gYSBwcmV2aW91cyBhdHRlbXB0IHRvIGF1dGhlbnRpY2F0ZVxuICogc3VibWl0QXV0aERpY3Q6ICAgICAgICAgYSBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBuZXcgYXV0aCBkaWN0XG4gKiBidXN5OiAgICAgICAgICAgICAgICAgICBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBhdXRoIGxvZ2ljIGlzIGRvaW5nIHNvbWV0aGluZ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHVzZXIgbmVlZHMgdG8gd2FpdCBmb3IuXG4gKiBpbnB1dHM6ICAgICAgICAgICAgICAgICBPYmplY3Qgb2YgaW5wdXRzIHByb3ZpZGVkIGJ5IHRoZSB1c2VyLCBhcyBpbiBqcy1zZGtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIGludGVyYWN0aXZlLWF1dGhcbiAqIHN0YWdlU3RhdGU6ICAgICAgICAgICAgIFN0YWdlLXNwZWNpZmljIG9iamVjdCB1c2VkIGZvciBjb21tdW5pY2F0aW5nIHN0YXRlIGluZm9ybWF0aW9uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB0byB0aGUgVUkgZnJvbSB0aGUgc3RhdGUtc3BlY2lmaWMgYXV0aCBsb2dpYy5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgIERlZmluZWQga2V5cyBmb3Igc3RhZ2VzIGFyZTpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmxvZ2luLmVtYWlsLmlkZW50aXR5OlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGVtYWlsU2lkOiBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBzaWQgb2YgdGhlIGFjdGl2ZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb24gc2Vzc2lvbiBmcm9tIHRoZSBJRCBzZXJ2ZXIsIG9yXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwgaWYgbm8gc2Vzc2lvbiBpcyBhY3RpdmUuXG4gKiBmYWlsOiAgICAgICAgICAgICAgICAgICBhIGZ1bmN0aW9uIHdoaWNoIHNob3VsZCBiZSBjYWxsZWQgd2l0aCBhbiBlcnJvciBvYmplY3QgaWYgYW5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIG9jY3VycmVkIGR1cmluZyB0aGUgYXV0aCBzdGFnZS4gVGhpcyB3aWxsIGNhdXNlIHRoZSBhdXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uIHRvIGJlIGZhaWxlZCBhbmQgdGhlIHByb2Nlc3MgdG8gZ28gYmFjayB0byB0aGUgc3RhcnQuXG4gKiBzZXRFbWFpbFNpZDogICAgICAgICAgICBtLmxvZ2luLmVtYWlsLmlkZW50aXR5IG9ubHk6IGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbCBzaWQgYWZ0ZXIgYSB0b2tlbiBpcyByZXF1ZXN0ZWQuXG4gKiBvblBoYXNlQ2hhbmdlOiAgICAgICAgICBBIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSBzdGFnZSdzIHBoYXNlIGNoYW5nZXMuIElmXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgc3RhZ2UgaGFzIG5vIHBoYXNlcywgY2FsbCB0aGlzIHdpdGggREVGQVVMVF9QSEFTRS4gVGFrZXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIG9uZSBhcmd1bWVudCwgdGhlIHBoYXNlLCBhbmQgaXMgYWx3YXlzIGRlZmluZWQvcmVxdWlyZWQuXG4gKiBjb250aW51ZVRleHQ6ICAgICAgICAgICBGb3Igc3RhZ2VzIHdoaWNoIGhhdmUgYSBjb250aW51ZSBidXR0b24sIHRoZSB0ZXh0IHRvIHVzZS5cbiAqIGNvbnRpbnVlS2luZDogICAgICAgICAgIEZvciBzdGFnZXMgd2hpY2ggaGF2ZSBhIGNvbnRpbnVlIGJ1dHRvbiwgdGhlIHN0eWxlIG9mIGJ1dHRvbiB0b1xuICogICAgICAgICAgICAgICAgICAgICAgICAgdXNlLiBGb3IgZXhhbXBsZSwgJ2Rhbmdlcicgb3IgJ3ByaW1hcnknLlxuICogb25DYW5jZWwgICAgICAgICAgICAgICAgQSBmdW5jdGlvbiB3aXRoIG5vIGFyZ3VtZW50cyB3aGljaCBpcyBjYWxsZWQgYnkgdGhlIHN0YWdlIGlmIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgdXNlciBrbm93aW5nbHkgY2FuY2VsbGVkL2Rpc21pc3NlZCB0aGUgYXV0aGVudGljYXRpb24gYXR0ZW1wdC5cbiAqXG4gKiBFYWNoIGNvbXBvbmVudCBtYXkgYWxzbyBwcm92aWRlIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIChiZXlvbmQgdGhlIHN0YW5kYXJkIFJlYWN0IG9uZXMpOlxuICogICAgZm9jdXM6IHNldCB0aGUgaW5wdXQgZm9jdXMgYXBwcm9wcmlhdGVseSBpbiB0aGUgZm9ybS5cbiAqL1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QSEFTRSA9IDA7XG5cbmV4cG9ydCBjbGFzcyBQYXNzd29yZEF1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIExPR0lOX1RZUEUgPSBcIm0ubG9naW4ucGFzc3dvcmRcIjtcblxuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1hdHJpeENsaWVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBzdWJtaXRBdXRoRGljdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgZXJyb3JUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAvLyBpcyB0aGUgYXV0aCBsb2dpYyBjdXJyZW50bHkgd2FpdGluZyBmb3Igc29tZXRoaW5nIHRvXG4gICAgICAgIC8vIGhhcHBlbj9cbiAgICAgICAgYnVzeTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uUGhhc2VDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhhc2VDaGFuZ2UoREVGQVVMVF9QSEFTRSk7XG4gICAgfVxuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHBhc3N3b3JkOiBcIlwiLFxuICAgIH07XG5cbiAgICBfb25TdWJtaXQgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5idXN5KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5wcm9wcy5zdWJtaXRBdXRoRGljdCh7XG4gICAgICAgICAgICB0eXBlOiBQYXNzd29yZEF1dGhFbnRyeS5MT0dJTl9UWVBFLFxuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGB1c2VyYCBvbmNlIHNlcnZlcnMgc3VwcG9ydCBwcm9wZXIgVUlBXG4gICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTAzMTJcbiAgICAgICAgICAgIHVzZXI6IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZCxcbiAgICAgICAgICAgIGlkZW50aWZpZXI6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm0uaWQudXNlclwiLFxuICAgICAgICAgICAgICAgIHVzZXI6IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXNzd29yZDogdGhpcy5zdGF0ZS5wYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vblBhc3N3b3JkRmllbGRDaGFuZ2UgPSBldiA9PiB7XG4gICAgICAgIC8vIGVuYWJsZSB0aGUgc3VibWl0IGJ1dHRvbiBpZmYgdGhlIHBhc3N3b3JkIGlzIG5vbi1lbXB0eVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3N3b3JkOiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHBhc3N3b3JkQm94Q2xhc3MgPSBjbGFzc25hbWVzKHtcbiAgICAgICAgICAgIFwiZXJyb3JcIjogdGhpcy5wcm9wcy5lcnJvclRleHQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBzdWJtaXRCdXR0b25PclNwaW5uZXI7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmJ1c3kpIHtcbiAgICAgICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgc3VibWl0QnV0dG9uT3JTcGlubmVyID0gPExvYWRlciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbk9yU3Bpbm5lciA9IChcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLnBhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17X3QoXCJDb250aW51ZVwiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlcnJvclNlY3Rpb247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVycm9yVGV4dCkge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5GaWVsZCcpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJDb25maXJtIHlvdXIgaWRlbnRpdHkgYnkgZW50ZXJpbmcgeW91ciBhY2NvdW50IHBhc3N3b3JkIGJlbG93LlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLl9vblN1Ym1pdH0gY2xhc3NOYW1lPVwibXhfSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzX3Bhc3N3b3JkU2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17cGFzc3dvcmRCb3hDbGFzc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwicGFzc3dvcmRGaWVsZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ1Bhc3N3b3JkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vblBhc3N3b3JkRmllbGRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfYnV0dG9uX3Jvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWJtaXRCdXR0b25PclNwaW5uZXIgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICB7IGVycm9yU2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWNhcHRjaGFBdXRoRW50cnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBMT0dJTl9UWVBFID0gXCJtLmxvZ2luLnJlY2FwdGNoYVwiO1xuXG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgc3VibWl0QXV0aERpY3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIHN0YWdlUGFyYW1zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIGVycm9yVGV4dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgYnVzeTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uUGhhc2VDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhhc2VDaGFuZ2UoREVGQVVMVF9QSEFTRSk7XG4gICAgfVxuXG4gICAgX29uQ2FwdGNoYVJlc3BvbnNlID0gcmVzcG9uc2UgPT4ge1xuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19ncmVjYXB0Y2hhX3N1Ym1pdFwiKTtcbiAgICAgICAgdGhpcy5wcm9wcy5zdWJtaXRBdXRoRGljdCh7XG4gICAgICAgICAgICB0eXBlOiBSZWNhcHRjaGFBdXRoRW50cnkuTE9HSU5fVFlQRSxcbiAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYnVzeSkge1xuICAgICAgICAgICAgY29uc3QgTG9hZGVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgICAgICByZXR1cm4gPExvYWRlciAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlcnJvclRleHQgPSB0aGlzLnByb3BzLmVycm9yVGV4dDtcblxuICAgICAgICBjb25zdCBDYXB0Y2hhRm9ybSA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5hdXRoLkNhcHRjaGFGb3JtXCIpO1xuICAgICAgICBsZXQgc2l0ZVB1YmxpY0tleTtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnN0YWdlUGFyYW1zIHx8ICF0aGlzLnByb3BzLnN0YWdlUGFyYW1zLnB1YmxpY19rZXkpIHtcbiAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KFxuICAgICAgICAgICAgICAgIFwiTWlzc2luZyBjYXB0Y2hhIHB1YmxpYyBrZXkgaW4gaG9tZXNlcnZlciBjb25maWd1cmF0aW9uLiBQbGVhc2UgcmVwb3J0IFwiICtcbiAgICAgICAgICAgICAgICBcInRoaXMgdG8geW91ciBob21lc2VydmVyIGFkbWluaXN0cmF0b3IuXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2l0ZVB1YmxpY0tleSA9IHRoaXMucHJvcHMuc3RhZ2VQYXJhbXMucHVibGljX2tleTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlcnJvclNlY3Rpb247XG4gICAgICAgIGlmIChlcnJvclRleHQpIHtcbiAgICAgICAgICAgIGVycm9yU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVycm9yXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgZXJyb3JUZXh0IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8Q2FwdGNoYUZvcm0gc2l0ZVB1YmxpY0tleT17c2l0ZVB1YmxpY0tleX1cbiAgICAgICAgICAgICAgICAgICAgb25DYXB0Y2hhUmVzcG9uc2U9e3RoaXMuX29uQ2FwdGNoYVJlc3BvbnNlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgeyBlcnJvclNlY3Rpb24gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGVybXNBdXRoRW50cnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBMT0dJTl9UWVBFID0gXCJtLmxvZ2luLnRlcm1zXCI7XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBzdWJtaXRBdXRoRGljdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgc3RhZ2VQYXJhbXM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgZXJyb3JUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBidXN5OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgc2hvd0NvbnRpbnVlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgb25QaGFzZUNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIC8vIGV4YW1wbGUgc3RhZ2VQYXJhbXM6XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHtcbiAgICAgICAgLy8gICAgIFwicG9saWNpZXNcIjoge1xuICAgICAgICAvLyAgICAgICAgIFwicHJpdmFjeV9wb2xpY3lcIjoge1xuICAgICAgICAvLyAgICAgICAgICAgICBcInZlcnNpb25cIjogXCIxLjBcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJlblwiOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJQcml2YWN5IFBvbGljeVwiLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL2V4YW1wbGUub3JnL3ByaXZhY3ktMS4wLWVuLmh0bWxcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgfSxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmclwiOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJQb2xpdGlxdWUgZGUgY29uZmlkZW50aWFsaXTDqVwiLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL2V4YW1wbGUub3JnL3ByaXZhY3ktMS4wLWZyLmh0bWxcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgfSxcbiAgICAgICAgLy8gICAgICAgICB9LFxuICAgICAgICAvLyAgICAgICAgIFwib3RoZXJfcG9saWN5XCI6IHsgLi4uIH0sXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cblxuICAgICAgICBjb25zdCBhbGxQb2xpY2llcyA9IHRoaXMucHJvcHMuc3RhZ2VQYXJhbXMucG9saWNpZXMgfHwge307XG4gICAgICAgIGNvbnN0IHByZWZMYW5nID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImxhbmd1YWdlXCIpO1xuICAgICAgICBjb25zdCBpbml0VG9nZ2xlcyA9IHt9O1xuICAgICAgICBjb25zdCBwaWNrZWRQb2xpY2llcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBvbGljeUlkIG9mIE9iamVjdC5rZXlzKGFsbFBvbGljaWVzKSkge1xuICAgICAgICAgICAgY29uc3QgcG9saWN5ID0gYWxsUG9saWNpZXNbcG9saWN5SWRdO1xuXG4gICAgICAgICAgICAvLyBQaWNrIGEgbGFuZ3VhZ2UgYmFzZWQgb24gdGhlIHVzZXIncyBsYW5ndWFnZSwgZmFsbGluZyBiYWNrIHRvIGVuZ2xpc2gsXG4gICAgICAgICAgICAvLyBhbmQgZmluYWxseSB0byB0aGUgZmlyc3QgbGFuZ3VhZ2UgYXZhaWxhYmxlLiBJZiB0aGVyZSdzIHN0aWxsIG5vIHBvbGljeVxuICAgICAgICAgICAgLy8gYXZhaWxhYmxlIHRoZW4gdGhlIGhvbWVzZXJ2ZXIgaXNuJ3QgcmVzcGVjdGluZyB0aGUgc3BlYy5cbiAgICAgICAgICAgIGxldCBsYW5nUG9saWN5ID0gcG9saWN5W3ByZWZMYW5nXTtcbiAgICAgICAgICAgIGlmICghbGFuZ1BvbGljeSkgbGFuZ1BvbGljeSA9IHBvbGljeVtcImVuXCJdO1xuICAgICAgICAgICAgaWYgKCFsYW5nUG9saWN5KSB7XG4gICAgICAgICAgICAgICAgLy8gbGFzdCByZXNvcnRcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdExhbmcgPSBPYmplY3Qua2V5cyhwb2xpY3kpLmZpbmQoZSA9PiBlICE9PSBcInZlcnNpb25cIik7XG4gICAgICAgICAgICAgICAgbGFuZ1BvbGljeSA9IHBvbGljeVtmaXJzdExhbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFsYW5nUG9saWN5KSB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmluZCBhIHBvbGljeSB0byBzaG93IHRoZSB1c2VyXCIpO1xuXG4gICAgICAgICAgICBpbml0VG9nZ2xlc1twb2xpY3lJZF0gPSBmYWxzZTtcblxuICAgICAgICAgICAgbGFuZ1BvbGljeS5pZCA9IHBvbGljeUlkO1xuICAgICAgICAgICAgcGlja2VkUG9saWNpZXMucHVzaChsYW5nUG9saWN5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB0b2dnbGVkUG9saWNpZXM6IGluaXRUb2dnbGVzLFxuICAgICAgICAgICAgcG9saWNpZXM6IHBpY2tlZFBvbGljaWVzLFxuICAgICAgICB9O1xuXG4gICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX3Rlcm1zX2JlZ2luXCIpO1xuICAgIH1cblxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25QaGFzZUNoYW5nZShERUZBVUxUX1BIQVNFKTtcbiAgICB9XG5cbiAgICB0cnlDb250aW51ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fdHJ5U3VibWl0KCk7XG4gICAgfTtcblxuICAgIF90b2dnbGVQb2xpY3kocG9saWN5SWQpIHtcbiAgICAgICAgY29uc3QgbmV3VG9nZ2xlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHBvbGljeSBvZiB0aGlzLnN0YXRlLnBvbGljaWVzKSB7XG4gICAgICAgICAgICBsZXQgY2hlY2tlZCA9IHRoaXMuc3RhdGUudG9nZ2xlZFBvbGljaWVzW3BvbGljeS5pZF07XG4gICAgICAgICAgICBpZiAocG9saWN5LmlkID09PSBwb2xpY3lJZCkgY2hlY2tlZCA9ICFjaGVja2VkO1xuXG4gICAgICAgICAgICBuZXdUb2dnbGVzW3BvbGljeS5pZF0gPSBjaGVja2VkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1widG9nZ2xlZFBvbGljaWVzXCI6IG5ld1RvZ2dsZXN9KTtcbiAgICB9XG5cbiAgICBfdHJ5U3VibWl0ID0gKCkgPT4ge1xuICAgICAgICBsZXQgYWxsQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgIGZvciAoY29uc3QgcG9saWN5IG9mIHRoaXMuc3RhdGUucG9saWNpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSB0aGlzLnN0YXRlLnRvZ2dsZWRQb2xpY2llc1twb2xpY3kuaWRdO1xuICAgICAgICAgICAgYWxsQ2hlY2tlZCA9IGFsbENoZWNrZWQgJiYgY2hlY2tlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhbGxDaGVja2VkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnN1Ym1pdEF1dGhEaWN0KHt0eXBlOiBUZXJtc0F1dGhFbnRyeS5MT0dJTl9UWVBFfSk7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ190ZXJtc19jb21wbGV0ZVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2Vycm9yVGV4dDogX3QoXCJQbGVhc2UgcmV2aWV3IGFuZCBhY2NlcHQgYWxsIG9mIHRoZSBob21lc2VydmVyJ3MgcG9saWNpZXNcIil9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmJ1c3kpIHtcbiAgICAgICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDxMb2FkZXIgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGVja2JveGVzID0gW107XG4gICAgICAgIGxldCBhbGxDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgZm9yIChjb25zdCBwb2xpY3kgb2YgdGhpcy5zdGF0ZS5wb2xpY2llcykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tlZCA9IHRoaXMuc3RhdGUudG9nZ2xlZFBvbGljaWVzW3BvbGljeS5pZF07XG4gICAgICAgICAgICBhbGxDaGVja2VkID0gYWxsQ2hlY2tlZCAmJiBjaGVja2VkO1xuXG4gICAgICAgICAgICBjaGVja2JveGVzLnB1c2goXG4gICAgICAgICAgICAgICAgLy8gWFhYOiByZXBsYWNlIHdpdGggU3R5bGVkQ2hlY2tib3hcbiAgICAgICAgICAgICAgICA8bGFiZWwga2V5PXtcInBvbGljeV9jaGVja2JveF9cIiArIHBvbGljeS5pZH0gY2xhc3NOYW1lPVwibXhfSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzX3Rlcm1zUG9saWN5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBvbkNoYW5nZT17KCkgPT4gdGhpcy5fdG9nZ2xlUG9saWN5KHBvbGljeS5pZCl9IGNoZWNrZWQ9e2NoZWNrZWR9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e3BvbGljeS51cmx9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj57IHBvbGljeS5uYW1lIH08L2E+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yU2VjdGlvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZXJyb3JUZXh0IHx8IHRoaXMuc3RhdGUuZXJyb3JUZXh0KSB7XG4gICAgICAgICAgICBlcnJvclNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuZXJyb3JUZXh0IHx8IHRoaXMuc3RhdGUuZXJyb3JUZXh0IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3VibWl0QnV0dG9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93Q29udGludWUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvLyBYWFg6IGJ1dHRvbiBjbGFzc2VzXG4gICAgICAgICAgICBzdWJtaXRCdXR0b24gPSA8YnV0dG9uIGNsYXNzTmFtZT1cIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c190ZXJtc1N1Ym1pdCBteF9HZW5lcmFsQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fdHJ5U3VibWl0fSBkaXNhYmxlZD17IWFsbENoZWNrZWR9PntfdChcIkFjY2VwdFwiKX08L2J1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJQbGVhc2UgcmV2aWV3IGFuZCBhY2NlcHQgdGhlIHBvbGljaWVzIG9mIHRoaXMgaG9tZXNlcnZlcjpcIil9PC9wPlxuICAgICAgICAgICAgICAgIHsgY2hlY2tib3hlcyB9XG4gICAgICAgICAgICAgICAgeyBlcnJvclNlY3Rpb24gfVxuICAgICAgICAgICAgICAgIHsgc3VibWl0QnV0dG9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVtYWlsSWRlbnRpdHlBdXRoRW50cnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBMT0dJTl9UWVBFID0gXCJtLmxvZ2luLmVtYWlsLmlkZW50aXR5XCI7XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBtYXRyaXhDbGllbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgc3VibWl0QXV0aERpY3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGF1dGhTZXNzaW9uSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgY2xpZW50U2VjcmV0OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGlucHV0czogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBzdGFnZVN0YXRlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIGZhaWw6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIHNldEVtYWlsU2lkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBvblBoYXNlQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKERFRkFVTFRfUEhBU0UpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gVGhpcyBjb21wb25lbnQgaXMgbm93IG9ubHkgZGlzcGxheWVkIG9uY2UgdGhlIHRva2VuIGhhcyBiZWVuIHJlcXVlc3RlZCxcbiAgICAgICAgLy8gc28gd2Uga25vdyB0aGUgZW1haWwgaGFzIGJlZW4gc2VudC4gSXQgY2FuIGFsc28gZ2V0IGxvYWRlZCBhZnRlciB0aGUgdXNlclxuICAgICAgICAvLyBoYXMgY2xpY2tlZCB0aGUgdmFsaWRhdGlvbiBsaW5rIGlmIHRoZSBzZXJ2ZXIgdGFrZXMgYSB3aGlsZSB0byBwcm9wYWdhdGVcbiAgICAgICAgLy8gdGhlIHZhbGlkYXRpb24gaW50ZXJuYWxseS4gSWYgd2UncmUgaW4gdGhlIHNlc3Npb24gc3Bhd25lZCBmcm9tIGNsaWNraW5nXG4gICAgICAgIC8vIHRoZSB2YWxpZGF0aW9uIGxpbmssIHdlIHdvbid0IGtub3cgdGhlIGVtYWlsIGFkZHJlc3MsIHNvIGlmIHdlIGRvbid0IGhhdmUgaXQsXG4gICAgICAgIC8vIGFzc3VtZSB0aGF0IHRoZSBsaW5rIGhhcyBiZWVuIGNsaWNrZWQgYW5kIHRoZSBzZXJ2ZXIgd2lsbCByZWFsaXNlIHdoZW4gd2UgcG9sbC5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaW5wdXRzLmVtYWlsQWRkcmVzcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gPFNwaW5uZXIgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zdGFnZVN0YXRlPy5lbWFpbFNpZCkge1xuICAgICAgICAgICAgLy8gd2Ugb25seSBoYXZlIGEgc2Vzc2lvbiBJRCBpZiB0aGUgdXNlciBoYXMgY2xpY2tlZCB0aGUgbGluayBpbiB0aGVpciBlbWFpbCxcbiAgICAgICAgICAgIC8vIHNvIHNob3cgYSBsb2FkaW5nIHN0YXRlIGluc3RlYWQgb2YgXCJhbiBlbWFpbCBoYXMgYmVlbiBzZW50IHRvLi4uXCIgYmVjYXVzZVxuICAgICAgICAgICAgLy8gdGhhdCdzIGNvbmZ1c2luZyB3aGVuIHlvdSd2ZSBhbHJlYWR5IHJlYWQgdGhhdCBlbWFpbC5cbiAgICAgICAgICAgIHJldHVybiA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfZW1haWxXcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJBIGNvbmZpcm1hdGlvbiBlbWFpbCBoYXMgYmVlbiBzZW50IHRvICUoZW1haWxBZGRyZXNzKXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZW1haWxBZGRyZXNzOiAoc3ViKSA9PiA8Yj57IHRoaXMucHJvcHMuaW5wdXRzLmVtYWlsQWRkcmVzcyB9PC9iPiB9LFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiT3BlbiB0aGUgbGluayBpbiB0aGUgZW1haWwgdG8gY29udGludWUgcmVnaXN0cmF0aW9uLlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1zaXNkbkF1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIExPR0lOX1RZUEUgPSBcIm0ubG9naW4ubXNpc2RuXCI7XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBpbnB1dHM6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgICBwaG9uZUNvdW50cnk6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgICAgICBwaG9uZU51bWJlcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgfSksXG4gICAgICAgIGZhaWw6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBjbGllbnRTZWNyZXQ6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBzdWJtaXRBdXRoRGljdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgbWF0cml4Q2xpZW50OiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBvblBoYXNlQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgdG9rZW46ICcnLFxuICAgICAgICByZXF1ZXN0aW5nVG9rZW46IGZhbHNlLFxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKERFRkFVTFRfUEhBU0UpO1xuXG4gICAgICAgIHRoaXMuX3N1Ym1pdFVybCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3NpZCA9IG51bGw7XG4gICAgICAgIHRoaXMuX21zaXNkbiA9IG51bGw7XG4gICAgICAgIHRoaXMuX3Rva2VuQm94ID0gbnVsbDtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtyZXF1ZXN0aW5nVG9rZW46IHRydWV9KTtcbiAgICAgICAgdGhpcy5fcmVxdWVzdE1zaXNkblRva2VuKCkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZmFpbChlKTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtyZXF1ZXN0aW5nVG9rZW46IGZhbHNlfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogUmVxdWVzdHMgYSB2ZXJpZmljYXRpb24gdG9rZW4gYnkgU01TLlxuICAgICAqL1xuICAgIF9yZXF1ZXN0TXNpc2RuVG9rZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLm1hdHJpeENsaWVudC5yZXF1ZXN0UmVnaXN0ZXJNc2lzZG5Ub2tlbihcbiAgICAgICAgICAgIHRoaXMucHJvcHMuaW5wdXRzLnBob25lQ291bnRyeSxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuaW5wdXRzLnBob25lTnVtYmVyLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5jbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAxLCAvLyBUT0RPOiBNdWx0aXBsZSBzZW5kIGF0dGVtcHRzP1xuICAgICAgICApLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fc3VibWl0VXJsID0gcmVzdWx0LnN1Ym1pdF91cmw7XG4gICAgICAgICAgICB0aGlzLl9zaWQgPSByZXN1bHQuc2lkO1xuICAgICAgICAgICAgdGhpcy5fbXNpc2RuID0gcmVzdWx0Lm1zaXNkbjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uVG9rZW5DaGFuZ2UgPSBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0b2tlbjogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25Gb3JtU3VibWl0ID0gYXN5bmMgZSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudG9rZW4gPT0gJycpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVycm9yVGV4dDogbnVsbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3VibWl0VXJsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5wcm9wcy5tYXRyaXhDbGllbnQuc3VibWl0TXNpc2RuVG9rZW5PdGhlclVybChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3VibWl0VXJsLCB0aGlzLl9zaWQsIHRoaXMucHJvcHMuY2xpZW50U2VjcmV0LCB0aGlzLnN0YXRlLnRva2VuLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSByZWdpc3RyYXRpb24gd2l0aCBNU0lTRE4gZmxvdyBpcyBtaXNjb25maWd1cmVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3JlZHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZDogdGhpcy5fc2lkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfc2VjcmV0OiB0aGlzLnByb3BzLmNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc3VibWl0QXV0aERpY3Qoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBNc2lzZG5BdXRoRW50cnkuTE9HSU5fVFlQRSxcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGB0aHJlZXBpZF9jcmVkc2Agb25jZSBzZXJ2ZXJzIHN1cHBvcnQgcHJvcGVyIFVJQVxuICAgICAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTAzMTJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvaXNzdWVzLzIyMjBcbiAgICAgICAgICAgICAgICAgICAgdGhyZWVwaWRfY3JlZHM6IGNyZWRzLFxuICAgICAgICAgICAgICAgICAgICB0aHJlZXBpZENyZWRzOiBjcmVkcyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXCJUb2tlbiBpbmNvcnJlY3RcIiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZmFpbChlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIHN1Ym1pdCBtc2lzZG4gdG9rZW5cIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZXF1ZXN0aW5nVG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDxMb2FkZXIgLz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlbmFibGVTdWJtaXQgPSBCb29sZWFuKHRoaXMuc3RhdGUudG9rZW4pO1xuICAgICAgICAgICAgY29uc3Qgc3VibWl0Q2xhc3NlcyA9IGNsYXNzbmFtZXMoe1xuICAgICAgICAgICAgICAgIG14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19tc2lzZG5TdWJtaXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbXhfR2VuZXJhbEJ1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IGVycm9yU2VjdGlvbjtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yVGV4dCkge1xuICAgICAgICAgICAgICAgIGVycm9yU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJBIHRleHQgbWVzc2FnZSBoYXMgYmVlbiBzZW50IHRvICUobXNpc2RuKXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbXNpc2RuOiA8aT57IHRoaXMuX21zaXNkbiB9PC9pPiB9LFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiUGxlYXNlIGVudGVyIHRoZSBjb2RlIGl0IGNvbnRhaW5zOlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19tc2lzZG5XcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5fb25Gb3JtU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfbXNpc2RuRW50cnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS50b2tlbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uVG9rZW5DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9eyBfdChcIkNvZGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPXtfdChcIlN1Ym1pdFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzdWJtaXRDbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWVuYWJsZVN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgICAgICAgICAge2Vycm9yU2VjdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU1NPQXV0aEVudHJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBtYXRyaXhDbGllbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgYXV0aFNlc3Npb25JZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBsb2dpblR5cGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgc3VibWl0QXV0aERpY3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGVycm9yVGV4dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgb25QaGFzZUNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgY29udGludWVUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBjb250aW51ZUtpbmQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG9uQ2FuY2VsOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB9O1xuXG4gICAgc3RhdGljIExPR0lOX1RZUEUgPSBcIm0ubG9naW4uc3NvXCI7XG4gICAgc3RhdGljIFVOU1RBQkxFX0xPR0lOX1RZUEUgPSBcIm9yZy5tYXRyaXgubG9naW4uc3NvXCI7XG5cbiAgICBzdGF0aWMgUEhBU0VfUFJFQVVUSCA9IDE7IC8vIGJ1dHRvbiB0byBzdGFydCBTU09cbiAgICBzdGF0aWMgUEhBU0VfUE9TVEFVVEggPSAyOyAvLyBidXR0b24gdG8gY29uZmlybSBTU08gY29tcGxldGVkXG5cbiAgICBfc3NvVXJsOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgLy8gV2UgYWN0dWFsbHkgc2VuZCB0aGUgdXNlciB0aHJvdWdoIGZhbGxiYWNrIGF1dGggc28gd2UgZG9uJ3QgaGF2ZSB0b1xuICAgICAgICAvLyBkZWFsIHdpdGggYSByZWRpcmVjdCBiYWNrIHRvIHVzLCBsb3NpbmcgYXBwbGljYXRpb24gY29udGV4dC5cbiAgICAgICAgdGhpcy5fc3NvVXJsID0gcHJvcHMubWF0cml4Q2xpZW50LmdldEZhbGxiYWNrQXV0aFVybChcbiAgICAgICAgICAgIHRoaXMucHJvcHMubG9naW5UeXBlLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5hdXRoU2Vzc2lvbklkLFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuX3BvcHVwV2luZG93ID0gbnVsbDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMuX29uUmVjZWl2ZU1lc3NhZ2UpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwaGFzZTogU1NPQXV0aEVudHJ5LlBIQVNFX1BSRUFVVEgsXG4gICAgICAgICAgICBhdHRlbXB0RmFpbGVkOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKFNTT0F1dGhFbnRyeS5QSEFTRV9QUkVBVVRIKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMuX29uUmVjZWl2ZU1lc3NhZ2UpO1xuICAgICAgICBpZiAodGhpcy5fcG9wdXBXaW5kb3cpIHtcbiAgICAgICAgICAgIHRoaXMuX3BvcHVwV2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLl9wb3B1cFdpbmRvdyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhdHRlbXB0RmFpbGVkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGF0dGVtcHRGYWlsZWQ6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25SZWNlaXZlTWVzc2FnZSA9IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09IFwiYXV0aERvbmVcIiAmJiBldmVudC5vcmlnaW4gPT09IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmdldEhvbWVzZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BvcHVwV2luZG93KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcG9wdXBXaW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3B1cFdpbmRvdyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25TdGFydEF1dGhDbGljayA9ICgpID0+IHtcbiAgICAgICAgLy8gTm90ZTogV2UgZG9uJ3QgdXNlIFBsYXRmb3JtUGVnJ3Mgc3RhcnRTc29BdXRoIGZ1bmN0aW9ucyBiZWNhdXNlIHdlIGFsbW9zdFxuICAgICAgICAvLyBjZXJ0YWlubHkgd2lsbCBuZWVkIHRvIG9wZW4gdGhlIHRoaW5nIGluIGEgbmV3IHRhYiB0byBhdm9pZCBsb3NpbmcgYXBwbGljYXRpb25cbiAgICAgICAgLy8gY29udGV4dC5cblxuICAgICAgICB0aGlzLl9wb3B1cFdpbmRvdyA9IHdpbmRvdy5vcGVuKHRoaXMuX3Nzb1VybCwgXCJfYmxhbmtcIik7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3BoYXNlOiBTU09BdXRoRW50cnkuUEhBU0VfUE9TVEFVVEh9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKFNTT0F1dGhFbnRyeS5QSEFTRV9QT1NUQVVUSCk7XG4gICAgfTtcblxuICAgIG9uQ29uZmlybUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLnN1Ym1pdEF1dGhEaWN0KHt9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY29udGludWVCdXR0b24gPSBudWxsO1xuICAgICAgICBjb25zdCBjYW5jZWxCdXR0b24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAga2luZD17dGhpcy5wcm9wcy5jb250aW51ZUtpbmQgPyAodGhpcy5wcm9wcy5jb250aW51ZUtpbmQgKyAnX291dGxpbmUnKSA6ICdwcmltYXJ5X291dGxpbmUnfVxuICAgICAgICAgICAgPntfdChcIkNhbmNlbFwiKX08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBoYXNlID09PSBTU09BdXRoRW50cnkuUEhBU0VfUFJFQVVUSCkge1xuICAgICAgICAgICAgY29udGludWVCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblN0YXJ0QXV0aENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBraW5kPXt0aGlzLnByb3BzLmNvbnRpbnVlS2luZCB8fCAncHJpbWFyeSd9XG4gICAgICAgICAgICAgICAgPnt0aGlzLnByb3BzLmNvbnRpbnVlVGV4dCB8fCBfdChcIlNpbmdsZSBTaWduIE9uXCIpfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250aW51ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ29uZmlybUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBraW5kPXt0aGlzLnByb3BzLmNvbnRpbnVlS2luZCB8fCAncHJpbWFyeSd9XG4gICAgICAgICAgICAgICAgPnt0aGlzLnByb3BzLmNvbnRpbnVlVGV4dCB8fCBfdChcIkNvbmZpcm1cIil9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlcnJvclNlY3Rpb247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVycm9yVGV4dCkge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYXR0ZW1wdEZhaWxlZCkge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlNvbWV0aGluZyB3ZW50IHdyb25nIGluIGNvbmZpcm1pbmcgeW91ciBpZGVudGl0eS4gQ2FuY2VsIGFuZCB0cnkgYWdhaW4uXCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgeyBlcnJvclNlY3Rpb24gfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfc3NvX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICB7Y2FuY2VsQnV0dG9ufVxuICAgICAgICAgICAgICAgIHtjb250aW51ZUJ1dHRvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGYWxsYmFja0F1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgbWF0cml4Q2xpZW50OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIGF1dGhTZXNzaW9uSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgbG9naW5UeXBlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIHN1Ym1pdEF1dGhEaWN0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBlcnJvclRleHQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG9uUGhhc2VDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICAvLyB3ZSBoYXZlIHRvIG1ha2UgdGhlIHVzZXIgY2xpY2sgYSBidXR0b24sIGFzIGJyb3dzZXJzIHdpbGwgYmxvY2tcbiAgICAgICAgLy8gdGhlIHBvcHVwIGlmIHdlIG9wZW4gaXQgaW1tZWRpYXRlbHkuXG4gICAgICAgIHRoaXMuX3BvcHVwV2luZG93ID0gbnVsbDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMuX29uUmVjZWl2ZU1lc3NhZ2UpO1xuXG4gICAgICAgIHRoaXMuX2ZhbGxiYWNrQnV0dG9uID0gY3JlYXRlUmVmKCk7XG4gICAgfVxuXG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKERFRkFVTFRfUEhBU0UpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5fb25SZWNlaXZlTWVzc2FnZSk7XG4gICAgICAgIGlmICh0aGlzLl9wb3B1cFdpbmRvdykge1xuICAgICAgICAgICAgdGhpcy5fcG9wdXBXaW5kb3cuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvY3VzID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fZmFsbGJhY2tCdXR0b24uY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fZmFsbGJhY2tCdXR0b24uY3VycmVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vblNob3dGYWxsYmFja0NsaWNrID0gZSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBjb25zdCB1cmwgPSB0aGlzLnByb3BzLm1hdHJpeENsaWVudC5nZXRGYWxsYmFja0F1dGhVcmwoXG4gICAgICAgICAgICB0aGlzLnByb3BzLmxvZ2luVHlwZSxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuYXV0aFNlc3Npb25JZCxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fcG9wdXBXaW5kb3cgPSB3aW5kb3cub3Blbih1cmwsIFwiX2JsYW5rXCIpO1xuICAgIH07XG5cbiAgICBfb25SZWNlaXZlTWVzc2FnZSA9IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgZXZlbnQuZGF0YSA9PT0gXCJhdXRoRG9uZVwiICYmXG4gICAgICAgICAgICBldmVudC5vcmlnaW4gPT09IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmdldEhvbWVzZXJ2ZXJVcmwoKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc3VibWl0QXV0aERpY3Qoe30pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGVycm9yU2VjdGlvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZXJyb3JUZXh0KSB7XG4gICAgICAgICAgICBlcnJvclNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuZXJyb3JUZXh0IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIlwiIHJlZj17dGhpcy5fZmFsbGJhY2tCdXR0b259IG9uQ2xpY2s9e3RoaXMuX29uU2hvd0ZhbGxiYWNrQ2xpY2t9PnsgX3QoXCJTdGFydCBhdXRoZW50aWNhdGlvblwiKSB9PC9hPlxuICAgICAgICAgICAgICAgIHtlcnJvclNlY3Rpb259XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNvbnN0IEF1dGhFbnRyeUNvbXBvbmVudHMgPSBbXG4gICAgUGFzc3dvcmRBdXRoRW50cnksXG4gICAgUmVjYXB0Y2hhQXV0aEVudHJ5LFxuICAgIEVtYWlsSWRlbnRpdHlBdXRoRW50cnksXG4gICAgTXNpc2RuQXV0aEVudHJ5LFxuICAgIFRlcm1zQXV0aEVudHJ5LFxuICAgIFNTT0F1dGhFbnRyeSxcbl07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEVudHJ5Q29tcG9uZW50Rm9yTG9naW5UeXBlKGxvZ2luVHlwZSkge1xuICAgIGZvciAoY29uc3QgYyBvZiBBdXRoRW50cnlDb21wb25lbnRzKSB7XG4gICAgICAgIGlmIChjLkxPR0lOX1RZUEUgPT09IGxvZ2luVHlwZSB8fCBjLlVOU1RBQkxFX0xPR0lOX1RZUEUgPT09IGxvZ2luVHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEZhbGxiYWNrQXV0aEVudHJ5O1xufVxuIl19
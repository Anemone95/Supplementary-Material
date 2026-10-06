"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp, _dec2, _class3, _class4, _temp2, _dec3, _class5, _class6, _temp3, _dec4, _class7, _class8, _temp4, _dec5, _class9, _class10, _temp5, _dec6, _class11, _class12, _temp6, _dec7, _class13, _class14, _temp7;

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
let PasswordAuthEntry = (_dec = (0, _replaceableComponent.replaceableComponent)("views.auth.PasswordAuthEntry"), _dec(_class = (_temp = _class2 = class PasswordAuthEntry extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "LOGIN_TYPE", "m.login.password"), (0, _defineProperty2.default)(_class2, "propTypes", {
  matrixClient: _propTypes.default.object.isRequired,
  submitAuthDict: _propTypes.default.func.isRequired,
  errorText: _propTypes.default.string,
  // is the auth logic currently waiting for something to
  // happen?
  busy: _propTypes.default.bool,
  onPhaseChange: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.PasswordAuthEntry = PasswordAuthEntry;
let RecaptchaAuthEntry = (_dec2 = (0, _replaceableComponent.replaceableComponent)("views.auth.RecaptchaAuthEntry"), _dec2(_class3 = (_temp2 = _class4 = class RecaptchaAuthEntry extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class4, "LOGIN_TYPE", "m.login.recaptcha"), (0, _defineProperty2.default)(_class4, "propTypes", {
  submitAuthDict: _propTypes.default.func.isRequired,
  stageParams: _propTypes.default.object.isRequired,
  errorText: _propTypes.default.string,
  busy: _propTypes.default.bool,
  onPhaseChange: _propTypes.default.func.isRequired
}), _temp2)) || _class3);
exports.RecaptchaAuthEntry = RecaptchaAuthEntry;
let TermsAuthEntry = (_dec3 = (0, _replaceableComponent.replaceableComponent)("views.auth.TermsAuthEntry"), _dec3(_class5 = (_temp3 = _class6 = class TermsAuthEntry extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class6, "LOGIN_TYPE", "m.login.terms"), (0, _defineProperty2.default)(_class6, "propTypes", {
  submitAuthDict: _propTypes.default.func.isRequired,
  stageParams: _propTypes.default.object.isRequired,
  errorText: _propTypes.default.string,
  busy: _propTypes.default.bool,
  showContinue: _propTypes.default.bool,
  onPhaseChange: _propTypes.default.func.isRequired
}), _temp3)) || _class5);
exports.TermsAuthEntry = TermsAuthEntry;
let EmailIdentityAuthEntry = (_dec4 = (0, _replaceableComponent.replaceableComponent)("views.auth.EmailIdentityAuthEntry"), _dec4(_class7 = (_temp4 = _class8 = class EmailIdentityAuthEntry extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class8, "LOGIN_TYPE", "m.login.email.identity"), (0, _defineProperty2.default)(_class8, "propTypes", {
  matrixClient: _propTypes.default.object.isRequired,
  submitAuthDict: _propTypes.default.func.isRequired,
  authSessionId: _propTypes.default.string.isRequired,
  clientSecret: _propTypes.default.string.isRequired,
  inputs: _propTypes.default.object.isRequired,
  stageState: _propTypes.default.object.isRequired,
  fail: _propTypes.default.func.isRequired,
  setEmailSid: _propTypes.default.func.isRequired,
  onPhaseChange: _propTypes.default.func.isRequired
}), _temp4)) || _class7);
exports.EmailIdentityAuthEntry = EmailIdentityAuthEntry;
let MsisdnAuthEntry = (_dec5 = (0, _replaceableComponent.replaceableComponent)("views.auth.MsisdnAuthEntry"), _dec5(_class9 = (_temp5 = _class10 = class MsisdnAuthEntry extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class10, "LOGIN_TYPE", "m.login.msisdn"), (0, _defineProperty2.default)(_class10, "propTypes", {
  inputs: _propTypes.default.shape({
    phoneCountry: _propTypes.default.string,
    phoneNumber: _propTypes.default.string
  }),
  fail: _propTypes.default.func,
  clientSecret: _propTypes.default.func,
  submitAuthDict: _propTypes.default.func.isRequired,
  matrixClient: _propTypes.default.object,
  onPhaseChange: _propTypes.default.func.isRequired
}), _temp5)) || _class9);
exports.MsisdnAuthEntry = MsisdnAuthEntry;
let SSOAuthEntry = (_dec6 = (0, _replaceableComponent.replaceableComponent)("views.auth.SSOAuthEntry"), _dec6(_class11 = (_temp6 = _class12 = class SSOAuthEntry extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class12, "propTypes", {
  matrixClient: _propTypes.default.object.isRequired,
  authSessionId: _propTypes.default.string.isRequired,
  loginType: _propTypes.default.string.isRequired,
  submitAuthDict: _propTypes.default.func.isRequired,
  errorText: _propTypes.default.string,
  onPhaseChange: _propTypes.default.func.isRequired,
  continueText: _propTypes.default.string,
  continueKind: _propTypes.default.string,
  onCancel: _propTypes.default.func
}), (0, _defineProperty2.default)(_class12, "LOGIN_TYPE", "m.login.sso"), (0, _defineProperty2.default)(_class12, "UNSTABLE_LOGIN_TYPE", "org.matrix.login.sso"), (0, _defineProperty2.default)(_class12, "PHASE_PREAUTH", 1), (0, _defineProperty2.default)(_class12, "PHASE_POSTAUTH", 2), _temp6)) || _class11);
exports.SSOAuthEntry = SSOAuthEntry;
let FallbackAuthEntry = (_dec7 = (0, _replaceableComponent.replaceableComponent)("views.auth.FallbackAuthEntry"), _dec7(_class13 = (_temp7 = _class14 = class FallbackAuthEntry extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class14, "propTypes", {
  matrixClient: _propTypes.default.object.isRequired,
  authSessionId: _propTypes.default.string.isRequired,
  loginType: _propTypes.default.string.isRequired,
  submitAuthDict: _propTypes.default.func.isRequired,
  errorText: _propTypes.default.string,
  onPhaseChange: _propTypes.default.func.isRequired
}), _temp7)) || _class13);
exports.FallbackAuthEntry = FallbackAuthEntry;
const AuthEntryComponents = [PasswordAuthEntry, RecaptchaAuthEntry, EmailIdentityAuthEntry, MsisdnAuthEntry, TermsAuthEntry, SSOAuthEntry];

function getEntryComponentForLoginType(loginType) {
  for (const c of AuthEntryComponents) {
    if (c.LOGIN_TYPE === loginType || c.UNSTABLE_LOGIN_TYPE === loginType) {
      return c;
    }
  }

  return FallbackAuthEntry;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRfUEhBU0UiLCJQYXNzd29yZEF1dGhFbnRyeSIsIlJlYWN0IiwiQ29tcG9uZW50IiwicGFzc3dvcmQiLCJlIiwicHJldmVudERlZmF1bHQiLCJwcm9wcyIsImJ1c3kiLCJzdWJtaXRBdXRoRGljdCIsInR5cGUiLCJMT0dJTl9UWVBFIiwidXNlciIsIm1hdHJpeENsaWVudCIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwiaWRlbnRpZmllciIsInN0YXRlIiwiZXYiLCJzZXRTdGF0ZSIsInRhcmdldCIsInZhbHVlIiwiY29tcG9uZW50RGlkTW91bnQiLCJvblBoYXNlQ2hhbmdlIiwicmVuZGVyIiwicGFzc3dvcmRCb3hDbGFzcyIsImVycm9yVGV4dCIsInN1Ym1pdEJ1dHRvbk9yU3Bpbm5lciIsIkxvYWRlciIsInNkayIsImdldENvbXBvbmVudCIsImVycm9yU2VjdGlvbiIsIkZpZWxkIiwiX29uU3VibWl0IiwiX29uUGFzc3dvcmRGaWVsZENoYW5nZSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJmdW5jIiwic3RyaW5nIiwiYm9vbCIsIlJlY2FwdGNoYUF1dGhFbnRyeSIsInJlc3BvbnNlIiwiQ291bnRseUFuYWx5dGljcyIsImluc3RhbmNlIiwidHJhY2siLCJDYXB0Y2hhRm9ybSIsInNpdGVQdWJsaWNLZXkiLCJzdGFnZVBhcmFtcyIsInB1YmxpY19rZXkiLCJfb25DYXB0Y2hhUmVzcG9uc2UiLCJUZXJtc0F1dGhFbnRyeSIsImNvbnN0cnVjdG9yIiwiX3RyeVN1Ym1pdCIsImFsbENoZWNrZWQiLCJwb2xpY3kiLCJwb2xpY2llcyIsImNoZWNrZWQiLCJ0b2dnbGVkUG9saWNpZXMiLCJpZCIsImFsbFBvbGljaWVzIiwicHJlZkxhbmciLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJpbml0VG9nZ2xlcyIsInBpY2tlZFBvbGljaWVzIiwicG9saWN5SWQiLCJPYmplY3QiLCJrZXlzIiwibGFuZ1BvbGljeSIsImZpcnN0TGFuZyIsImZpbmQiLCJFcnJvciIsInB1c2giLCJfdG9nZ2xlUG9saWN5IiwibmV3VG9nZ2xlcyIsImNoZWNrYm94ZXMiLCJ1cmwiLCJuYW1lIiwic3VibWl0QnV0dG9uIiwic2hvd0NvbnRpbnVlIiwiRW1haWxJZGVudGl0eUF1dGhFbnRyeSIsImlucHV0cyIsImVtYWlsQWRkcmVzcyIsInVuZGVmaW5lZCIsInN0YWdlU3RhdGUiLCJlbWFpbFNpZCIsInN1YiIsImF1dGhTZXNzaW9uSWQiLCJjbGllbnRTZWNyZXQiLCJmYWlsIiwic2V0RW1haWxTaWQiLCJNc2lzZG5BdXRoRW50cnkiLCJ0b2tlbiIsInJlcXVlc3RpbmdUb2tlbiIsInJlc3VsdCIsIl9zdWJtaXRVcmwiLCJzdWJtaXRNc2lzZG5Ub2tlbk90aGVyVXJsIiwiX3NpZCIsInN1Y2Nlc3MiLCJjcmVkcyIsInNpZCIsImNsaWVudF9zZWNyZXQiLCJ0aHJlZXBpZF9jcmVkcyIsInRocmVlcGlkQ3JlZHMiLCJjb25zb2xlIiwibG9nIiwiX21zaXNkbiIsIl90b2tlbkJveCIsIl9yZXF1ZXN0TXNpc2RuVG9rZW4iLCJjYXRjaCIsImZpbmFsbHkiLCJyZXF1ZXN0UmVnaXN0ZXJNc2lzZG5Ub2tlbiIsInBob25lQ291bnRyeSIsInBob25lTnVtYmVyIiwidGhlbiIsInN1Ym1pdF91cmwiLCJtc2lzZG4iLCJlbmFibGVTdWJtaXQiLCJCb29sZWFuIiwic3VibWl0Q2xhc3NlcyIsIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19tc2lzZG5TdWJtaXQiLCJteF9HZW5lcmFsQnV0dG9uIiwiX29uRm9ybVN1Ym1pdCIsIl9vblRva2VuQ2hhbmdlIiwic2hhcGUiLCJTU09BdXRoRW50cnkiLCJhdHRlbXB0RmFpbGVkIiwiZXZlbnQiLCJkYXRhIiwib3JpZ2luIiwiZ2V0SG9tZXNlcnZlclVybCIsIl9wb3B1cFdpbmRvdyIsImNsb3NlIiwid2luZG93Iiwib3BlbiIsIl9zc29VcmwiLCJwaGFzZSIsIlBIQVNFX1BPU1RBVVRIIiwiZ2V0RmFsbGJhY2tBdXRoVXJsIiwibG9naW5UeXBlIiwiYWRkRXZlbnRMaXN0ZW5lciIsIl9vblJlY2VpdmVNZXNzYWdlIiwiUEhBU0VfUFJFQVVUSCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNvbnRpbnVlQnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwib25DYW5jZWwiLCJjb250aW51ZUtpbmQiLCJvblN0YXJ0QXV0aENsaWNrIiwiY29udGludWVUZXh0Iiwib25Db25maXJtQ2xpY2siLCJGYWxsYmFja0F1dGhFbnRyeSIsIl9mYWxsYmFja0J1dHRvbiIsImN1cnJlbnQiLCJmb2N1cyIsInN0b3BQcm9wYWdhdGlvbiIsIl9vblNob3dGYWxsYmFja0NsaWNrIiwiQXV0aEVudHJ5Q29tcG9uZW50cyIsImdldEVudHJ5Q29tcG9uZW50Rm9yTG9naW5UeXBlIiwiYyIsIlVOU1RBQkxFX0xPR0lOX1RZUEUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRU8sTUFBTUEsYUFBYSxHQUFHLENBQXRCOztJQUdNQyxpQixXQURaLGdEQUFxQiw4QkFBckIsQyxtQ0FBRCxNQUNhQSxpQkFEYixTQUN1Q0MsZUFBTUMsU0FE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QixtQkFBVUMsTUFBVixDQUFpQkMsVUFEaEI7QUFFZm1ELEVBQUFBLGFBQWEsRUFBRXJELG1CQUFVSSxNQUFWLENBQWlCRixVQUZqQjtBQUdmdUcsRUFBQUEsU0FBUyxFQUFFekcsbUJBQVVJLE1BQVYsQ0FBaUJGLFVBSGI7QUFJZjVCLEVBQUFBLGNBQWMsRUFBRTBCLG1CQUFVRyxJQUFWLENBQWVELFVBSmhCO0FBS2ZYLEVBQUFBLFNBQVMsRUFBRVMsbUJBQVVJLE1BTE47QUFNZmhCLEVBQUFBLGFBQWEsRUFBRVksbUJBQVVHLElBQVYsQ0FBZUQ7QUFOZixDOztBQTRFdkIsTUFBTTBILG1CQUFtQixHQUFHLENBQ3hCOUosaUJBRHdCLEVBRXhCd0Msa0JBRndCLEVBR3hCd0Msc0JBSHdCLEVBSXhCVyxlQUp3QixFQUt4QnpDLGNBTHdCLEVBTXhCMkUsWUFOd0IsQ0FBNUI7O0FBU2UsU0FBU2tDLDZCQUFULENBQXVDcEIsU0FBdkMsRUFBa0Q7QUFDN0QsT0FBSyxNQUFNcUIsQ0FBWCxJQUFnQkYsbUJBQWhCLEVBQXFDO0FBQ2pDLFFBQUlFLENBQUMsQ0FBQ3RKLFVBQUYsS0FBaUJpSSxTQUFqQixJQUE4QnFCLENBQUMsQ0FBQ0MsbUJBQUYsS0FBMEJ0QixTQUE1RCxFQUF1RTtBQUNuRSxhQUFPcUIsQ0FBUDtBQUNIO0FBQ0o7O0FBQ0QsU0FBT1IsaUJBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vLi4vLi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8qIFRoaXMgZmlsZSBjb250YWlucyBhIGNvbGxlY3Rpb24gb2YgY29tcG9uZW50cyB3aGljaCBhcmUgdXNlZCBieSB0aGVcbiAqIEludGVyYWN0aXZlQXV0aCB0byBwcm9tcHQgdGhlIHVzZXIgdG8gZW50ZXIgdGhlIGluZm9ybWF0aW9uIG5lZWRlZFxuICogZm9yIGFuIGF1dGggc3RhZ2UuIChUaGUgaW50ZW50aW9uIGlzIHRoYXQgdGhleSBjb3VsZCBhbHNvIGJlIHVzZWQgZm9yIG90aGVyXG4gKiBjb21wb25lbnRzLCBzdWNoIGFzIHRoZSByZWdpc3RyYXRpb24gZmxvdykuXG4gKlxuICogQ2FsbCBnZXRFbnRyeUNvbXBvbmVudEZvckxvZ2luVHlwZSgpIHRvIGdldCBhIGNvbXBvbmVudCBzdWl0YWJsZSBmb3IgYVxuICogcGFydGljdWxhciBsb2dpbiB0eXBlLiBFYWNoIGNvbXBvbmVudCByZXF1aXJlcyB0aGUgc2FtZSBwcm9wZXJ0aWVzOlxuICpcbiAqIG1hdHJpeENsaWVudDogICAgICAgICAgIEEgbWF0cml4IGNsaWVudC4gTWF5IGJlIGEgZGlmZmVyZW50IG9uZSB0byB0aGUgb25lXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50bHkgYmVpbmcgdXNlZCBnZW5lcmFsbHkgKGVnLiB0byByZWdpc3RlciB3aXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBvbmUgSFMgd2hpbHN0IGJlaWduIGEgZ3Vlc3Qgb24gYW5vdGhlcikuXG4gKiBsb2dpblR5cGU6ICAgICAgICAgICAgICB0aGUgbG9naW4gdHlwZSBvZiB0aGUgYXV0aCBzdGFnZSBiZWluZyBhdHRlbXB0ZWRcbiAqIGF1dGhTZXNzaW9uSWQ6ICAgICAgICAgIHNlc3Npb24gaWQgZnJvbSB0aGUgc2VydmVyXG4gKiBjbGllbnRTZWNyZXQ6ICAgICAgICAgICBUaGUgY2xpZW50IHNlY3JldCBpbiB1c2UgZm9yIElEIHNlcnZlciBhdXRoIHNlc3Npb25zXG4gKiBzdGFnZVBhcmFtczogICAgICAgICAgICBwYXJhbXMgZnJvbSB0aGUgc2VydmVyIGZvciB0aGUgc3RhZ2UgYmVpbmcgYXR0ZW1wdGVkXG4gKiBlcnJvclRleHQ6ICAgICAgICAgICAgICBlcnJvciBtZXNzYWdlIGZyb20gYSBwcmV2aW91cyBhdHRlbXB0IHRvIGF1dGhlbnRpY2F0ZVxuICogc3VibWl0QXV0aERpY3Q6ICAgICAgICAgYSBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBuZXcgYXV0aCBkaWN0XG4gKiBidXN5OiAgICAgICAgICAgICAgICAgICBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBhdXRoIGxvZ2ljIGlzIGRvaW5nIHNvbWV0aGluZ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHVzZXIgbmVlZHMgdG8gd2FpdCBmb3IuXG4gKiBpbnB1dHM6ICAgICAgICAgICAgICAgICBPYmplY3Qgb2YgaW5wdXRzIHByb3ZpZGVkIGJ5IHRoZSB1c2VyLCBhcyBpbiBqcy1zZGtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIGludGVyYWN0aXZlLWF1dGhcbiAqIHN0YWdlU3RhdGU6ICAgICAgICAgICAgIFN0YWdlLXNwZWNpZmljIG9iamVjdCB1c2VkIGZvciBjb21tdW5pY2F0aW5nIHN0YXRlIGluZm9ybWF0aW9uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB0byB0aGUgVUkgZnJvbSB0aGUgc3RhdGUtc3BlY2lmaWMgYXV0aCBsb2dpYy5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgIERlZmluZWQga2V5cyBmb3Igc3RhZ2VzIGFyZTpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmxvZ2luLmVtYWlsLmlkZW50aXR5OlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGVtYWlsU2lkOiBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBzaWQgb2YgdGhlIGFjdGl2ZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb24gc2Vzc2lvbiBmcm9tIHRoZSBJRCBzZXJ2ZXIsIG9yXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwgaWYgbm8gc2Vzc2lvbiBpcyBhY3RpdmUuXG4gKiBmYWlsOiAgICAgICAgICAgICAgICAgICBhIGZ1bmN0aW9uIHdoaWNoIHNob3VsZCBiZSBjYWxsZWQgd2l0aCBhbiBlcnJvciBvYmplY3QgaWYgYW5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIG9jY3VycmVkIGR1cmluZyB0aGUgYXV0aCBzdGFnZS4gVGhpcyB3aWxsIGNhdXNlIHRoZSBhdXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uIHRvIGJlIGZhaWxlZCBhbmQgdGhlIHByb2Nlc3MgdG8gZ28gYmFjayB0byB0aGUgc3RhcnQuXG4gKiBzZXRFbWFpbFNpZDogICAgICAgICAgICBtLmxvZ2luLmVtYWlsLmlkZW50aXR5IG9ubHk6IGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbCBzaWQgYWZ0ZXIgYSB0b2tlbiBpcyByZXF1ZXN0ZWQuXG4gKiBvblBoYXNlQ2hhbmdlOiAgICAgICAgICBBIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSBzdGFnZSdzIHBoYXNlIGNoYW5nZXMuIElmXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgc3RhZ2UgaGFzIG5vIHBoYXNlcywgY2FsbCB0aGlzIHdpdGggREVGQVVMVF9QSEFTRS4gVGFrZXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIG9uZSBhcmd1bWVudCwgdGhlIHBoYXNlLCBhbmQgaXMgYWx3YXlzIGRlZmluZWQvcmVxdWlyZWQuXG4gKiBjb250aW51ZVRleHQ6ICAgICAgICAgICBGb3Igc3RhZ2VzIHdoaWNoIGhhdmUgYSBjb250aW51ZSBidXR0b24sIHRoZSB0ZXh0IHRvIHVzZS5cbiAqIGNvbnRpbnVlS2luZDogICAgICAgICAgIEZvciBzdGFnZXMgd2hpY2ggaGF2ZSBhIGNvbnRpbnVlIGJ1dHRvbiwgdGhlIHN0eWxlIG9mIGJ1dHRvbiB0b1xuICogICAgICAgICAgICAgICAgICAgICAgICAgdXNlLiBGb3IgZXhhbXBsZSwgJ2Rhbmdlcicgb3IgJ3ByaW1hcnknLlxuICogb25DYW5jZWwgICAgICAgICAgICAgICAgQSBmdW5jdGlvbiB3aXRoIG5vIGFyZ3VtZW50cyB3aGljaCBpcyBjYWxsZWQgYnkgdGhlIHN0YWdlIGlmIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgdXNlciBrbm93aW5nbHkgY2FuY2VsbGVkL2Rpc21pc3NlZCB0aGUgYXV0aGVudGljYXRpb24gYXR0ZW1wdC5cbiAqXG4gKiBFYWNoIGNvbXBvbmVudCBtYXkgYWxzbyBwcm92aWRlIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIChiZXlvbmQgdGhlIHN0YW5kYXJkIFJlYWN0IG9uZXMpOlxuICogICAgZm9jdXM6IHNldCB0aGUgaW5wdXQgZm9jdXMgYXBwcm9wcmlhdGVseSBpbiB0aGUgZm9ybS5cbiAqL1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QSEFTRSA9IDA7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmF1dGguUGFzc3dvcmRBdXRoRW50cnlcIilcbmV4cG9ydCBjbGFzcyBQYXNzd29yZEF1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIExPR0lOX1RZUEUgPSBcIm0ubG9naW4ucGFzc3dvcmRcIjtcblxuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1hdHJpeENsaWVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBzdWJtaXRBdXRoRGljdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgZXJyb3JUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAvLyBpcyB0aGUgYXV0aCBsb2dpYyBjdXJyZW50bHkgd2FpdGluZyBmb3Igc29tZXRoaW5nIHRvXG4gICAgICAgIC8vIGhhcHBlbj9cbiAgICAgICAgYnVzeTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uUGhhc2VDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhhc2VDaGFuZ2UoREVGQVVMVF9QSEFTRSk7XG4gICAgfVxuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHBhc3N3b3JkOiBcIlwiLFxuICAgIH07XG5cbiAgICBfb25TdWJtaXQgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5idXN5KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5wcm9wcy5zdWJtaXRBdXRoRGljdCh7XG4gICAgICAgICAgICB0eXBlOiBQYXNzd29yZEF1dGhFbnRyeS5MT0dJTl9UWVBFLFxuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGB1c2VyYCBvbmNlIHNlcnZlcnMgc3VwcG9ydCBwcm9wZXIgVUlBXG4gICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTAzMTJcbiAgICAgICAgICAgIHVzZXI6IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZCxcbiAgICAgICAgICAgIGlkZW50aWZpZXI6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm0uaWQudXNlclwiLFxuICAgICAgICAgICAgICAgIHVzZXI6IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXNzd29yZDogdGhpcy5zdGF0ZS5wYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vblBhc3N3b3JkRmllbGRDaGFuZ2UgPSBldiA9PiB7XG4gICAgICAgIC8vIGVuYWJsZSB0aGUgc3VibWl0IGJ1dHRvbiBpZmYgdGhlIHBhc3N3b3JkIGlzIG5vbi1lbXB0eVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3N3b3JkOiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHBhc3N3b3JkQm94Q2xhc3MgPSBjbGFzc25hbWVzKHtcbiAgICAgICAgICAgIFwiZXJyb3JcIjogdGhpcy5wcm9wcy5lcnJvclRleHQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBzdWJtaXRCdXR0b25PclNwaW5uZXI7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmJ1c3kpIHtcbiAgICAgICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgc3VibWl0QnV0dG9uT3JTcGlubmVyID0gPExvYWRlciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbk9yU3Bpbm5lciA9IChcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLnBhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17X3QoXCJDb250aW51ZVwiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlcnJvclNlY3Rpb247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVycm9yVGV4dCkge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5GaWVsZCcpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJDb25maXJtIHlvdXIgaWRlbnRpdHkgYnkgZW50ZXJpbmcgeW91ciBhY2NvdW50IHBhc3N3b3JkIGJlbG93LlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLl9vblN1Ym1pdH0gY2xhc3NOYW1lPVwibXhfSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzX3Bhc3N3b3JkU2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17cGFzc3dvcmRCb3hDbGFzc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwicGFzc3dvcmRGaWVsZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ1Bhc3N3b3JkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vblBhc3N3b3JkRmllbGRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfYnV0dG9uX3Jvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWJtaXRCdXR0b25PclNwaW5uZXIgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgeyBlcnJvclNlY3Rpb24gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5hdXRoLlJlY2FwdGNoYUF1dGhFbnRyeVwiKVxuZXhwb3J0IGNsYXNzIFJlY2FwdGNoYUF1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIExPR0lOX1RZUEUgPSBcIm0ubG9naW4ucmVjYXB0Y2hhXCI7XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBzdWJtaXRBdXRoRGljdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgc3RhZ2VQYXJhbXM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgZXJyb3JUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBidXN5OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgb25QaGFzZUNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25QaGFzZUNoYW5nZShERUZBVUxUX1BIQVNFKTtcbiAgICB9XG5cbiAgICBfb25DYXB0Y2hhUmVzcG9uc2UgPSByZXNwb25zZSA9PiB7XG4gICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX2dyZWNhcHRjaGFfc3VibWl0XCIpO1xuICAgICAgICB0aGlzLnByb3BzLnN1Ym1pdEF1dGhEaWN0KHtcbiAgICAgICAgICAgIHR5cGU6IFJlY2FwdGNoYUF1dGhFbnRyeS5MT0dJTl9UWVBFLFxuICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5idXN5KSB7XG4gICAgICAgICAgICBjb25zdCBMb2FkZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgIHJldHVybiA8TG9hZGVyIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yVGV4dCA9IHRoaXMucHJvcHMuZXJyb3JUZXh0O1xuXG4gICAgICAgIGNvbnN0IENhcHRjaGFGb3JtID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmF1dGguQ2FwdGNoYUZvcm1cIik7XG4gICAgICAgIGxldCBzaXRlUHVibGljS2V5O1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuc3RhZ2VQYXJhbXMgfHwgIXRoaXMucHJvcHMuc3RhZ2VQYXJhbXMucHVibGljX2tleSkge1xuICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgXCJNaXNzaW5nIGNhcHRjaGEgcHVibGljIGtleSBpbiBob21lc2VydmVyIGNvbmZpZ3VyYXRpb24uIFBsZWFzZSByZXBvcnQgXCIgK1xuICAgICAgICAgICAgICAgIFwidGhpcyB0byB5b3VyIGhvbWVzZXJ2ZXIgYWRtaW5pc3RyYXRvci5cIixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaXRlUHVibGljS2V5ID0gdGhpcy5wcm9wcy5zdGFnZVBhcmFtcy5wdWJsaWNfa2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yU2VjdGlvbjtcbiAgICAgICAgaWYgKGVycm9yVGV4dCkge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBlcnJvclRleHQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxDYXB0Y2hhRm9ybSBzaXRlUHVibGljS2V5PXtzaXRlUHVibGljS2V5fVxuICAgICAgICAgICAgICAgICAgICBvbkNhcHRjaGFSZXNwb25zZT17dGhpcy5fb25DYXB0Y2hhUmVzcG9uc2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7IGVycm9yU2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmF1dGguVGVybXNBdXRoRW50cnlcIilcbmV4cG9ydCBjbGFzcyBUZXJtc0F1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIExPR0lOX1RZUEUgPSBcIm0ubG9naW4udGVybXNcIjtcblxuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHN1Ym1pdEF1dGhEaWN0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBzdGFnZVBhcmFtczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBlcnJvclRleHQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGJ1c3k6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICBzaG93Q29udGludWU6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICBvblBoYXNlQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgLy8gZXhhbXBsZSBzdGFnZVBhcmFtczpcbiAgICAgICAgLy9cbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgXCJwb2xpY2llc1wiOiB7XG4gICAgICAgIC8vICAgICAgICAgXCJwcml2YWN5X3BvbGljeVwiOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgIFwidmVyc2lvblwiOiBcIjEuMFwiLFxuICAgICAgICAvLyAgICAgICAgICAgICBcImVuXCI6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcIlByaXZhY3kgUG9saWN5XCIsXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vZXhhbXBsZS5vcmcvcHJpdmFjeS0xLjAtZW4uaHRtbFwiLFxuICAgICAgICAvLyAgICAgICAgICAgICB9LFxuICAgICAgICAvLyAgICAgICAgICAgICBcImZyXCI6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcIlBvbGl0aXF1ZSBkZSBjb25maWRlbnRpYWxpdMOpXCIsXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vZXhhbXBsZS5vcmcvcHJpdmFjeS0xLjAtZnIuaHRtbFwiLFxuICAgICAgICAvLyAgICAgICAgICAgICB9LFxuICAgICAgICAvLyAgICAgICAgIH0sXG4gICAgICAgIC8vICAgICAgICAgXCJvdGhlcl9wb2xpY3lcIjogeyAuLi4gfSxcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGNvbnN0IGFsbFBvbGljaWVzID0gdGhpcy5wcm9wcy5zdGFnZVBhcmFtcy5wb2xpY2llcyB8fCB7fTtcbiAgICAgICAgY29uc3QgcHJlZkxhbmcgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibGFuZ3VhZ2VcIik7XG4gICAgICAgIGNvbnN0IGluaXRUb2dnbGVzID0ge307XG4gICAgICAgIGNvbnN0IHBpY2tlZFBvbGljaWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgcG9saWN5SWQgb2YgT2JqZWN0LmtleXMoYWxsUG9saWNpZXMpKSB7XG4gICAgICAgICAgICBjb25zdCBwb2xpY3kgPSBhbGxQb2xpY2llc1twb2xpY3lJZF07XG5cbiAgICAgICAgICAgIC8vIFBpY2sgYSBsYW5ndWFnZSBiYXNlZCBvbiB0aGUgdXNlcidzIGxhbmd1YWdlLCBmYWxsaW5nIGJhY2sgdG8gZW5nbGlzaCxcbiAgICAgICAgICAgIC8vIGFuZCBmaW5hbGx5IHRvIHRoZSBmaXJzdCBsYW5ndWFnZSBhdmFpbGFibGUuIElmIHRoZXJlJ3Mgc3RpbGwgbm8gcG9saWN5XG4gICAgICAgICAgICAvLyBhdmFpbGFibGUgdGhlbiB0aGUgaG9tZXNlcnZlciBpc24ndCByZXNwZWN0aW5nIHRoZSBzcGVjLlxuICAgICAgICAgICAgbGV0IGxhbmdQb2xpY3kgPSBwb2xpY3lbcHJlZkxhbmddO1xuICAgICAgICAgICAgaWYgKCFsYW5nUG9saWN5KSBsYW5nUG9saWN5ID0gcG9saWN5W1wiZW5cIl07XG4gICAgICAgICAgICBpZiAoIWxhbmdQb2xpY3kpIHtcbiAgICAgICAgICAgICAgICAvLyBsYXN0IHJlc29ydFxuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0TGFuZyA9IE9iamVjdC5rZXlzKHBvbGljeSkuZmluZChlID0+IGUgIT09IFwidmVyc2lvblwiKTtcbiAgICAgICAgICAgICAgICBsYW5nUG9saWN5ID0gcG9saWN5W2ZpcnN0TGFuZ107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWxhbmdQb2xpY3kpIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmaW5kIGEgcG9saWN5IHRvIHNob3cgdGhlIHVzZXJcIik7XG5cbiAgICAgICAgICAgIGluaXRUb2dnbGVzW3BvbGljeUlkXSA9IGZhbHNlO1xuXG4gICAgICAgICAgICBsYW5nUG9saWN5LmlkID0gcG9saWN5SWQ7XG4gICAgICAgICAgICBwaWNrZWRQb2xpY2llcy5wdXNoKGxhbmdQb2xpY3kpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHRvZ2dsZWRQb2xpY2llczogaW5pdFRvZ2dsZXMsXG4gICAgICAgICAgICBwb2xpY2llczogcGlja2VkUG9saWNpZXMsXG4gICAgICAgIH07XG5cbiAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfdGVybXNfYmVnaW5cIik7XG4gICAgfVxuXG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKERFRkFVTFRfUEhBU0UpO1xuICAgIH1cblxuICAgIHRyeUNvbnRpbnVlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl90cnlTdWJtaXQoKTtcbiAgICB9O1xuXG4gICAgX3RvZ2dsZVBvbGljeShwb2xpY3lJZCkge1xuICAgICAgICBjb25zdCBuZXdUb2dnbGVzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgcG9saWN5IG9mIHRoaXMuc3RhdGUucG9saWNpZXMpIHtcbiAgICAgICAgICAgIGxldCBjaGVja2VkID0gdGhpcy5zdGF0ZS50b2dnbGVkUG9saWNpZXNbcG9saWN5LmlkXTtcbiAgICAgICAgICAgIGlmIChwb2xpY3kuaWQgPT09IHBvbGljeUlkKSBjaGVja2VkID0gIWNoZWNrZWQ7XG5cbiAgICAgICAgICAgIG5ld1RvZ2dsZXNbcG9saWN5LmlkXSA9IGNoZWNrZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XCJ0b2dnbGVkUG9saWNpZXNcIjogbmV3VG9nZ2xlc30pO1xuICAgIH1cblxuICAgIF90cnlTdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgIGxldCBhbGxDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgZm9yIChjb25zdCBwb2xpY3kgb2YgdGhpcy5zdGF0ZS5wb2xpY2llcykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tlZCA9IHRoaXMuc3RhdGUudG9nZ2xlZFBvbGljaWVzW3BvbGljeS5pZF07XG4gICAgICAgICAgICBhbGxDaGVja2VkID0gYWxsQ2hlY2tlZCAmJiBjaGVja2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFsbENoZWNrZWQpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc3VibWl0QXV0aERpY3Qoe3R5cGU6IFRlcm1zQXV0aEVudHJ5LkxPR0lOX1RZUEV9KTtcbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX3Rlcm1zX2NvbXBsZXRlXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXJyb3JUZXh0OiBfdChcIlBsZWFzZSByZXZpZXcgYW5kIGFjY2VwdCBhbGwgb2YgdGhlIGhvbWVzZXJ2ZXIncyBwb2xpY2llc1wiKX0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYnVzeSkge1xuICAgICAgICAgICAgY29uc3QgTG9hZGVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgICAgICByZXR1cm4gPExvYWRlciAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNoZWNrYm94ZXMgPSBbXTtcbiAgICAgICAgbGV0IGFsbENoZWNrZWQgPSB0cnVlO1xuICAgICAgICBmb3IgKGNvbnN0IHBvbGljeSBvZiB0aGlzLnN0YXRlLnBvbGljaWVzKSB7XG4gICAgICAgICAgICBjb25zdCBjaGVja2VkID0gdGhpcy5zdGF0ZS50b2dnbGVkUG9saWNpZXNbcG9saWN5LmlkXTtcbiAgICAgICAgICAgIGFsbENoZWNrZWQgPSBhbGxDaGVja2VkICYmIGNoZWNrZWQ7XG5cbiAgICAgICAgICAgIGNoZWNrYm94ZXMucHVzaChcbiAgICAgICAgICAgICAgICAvLyBYWFg6IHJlcGxhY2Ugd2l0aCBTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgIDxsYWJlbCBrZXk9e1wicG9saWN5X2NoZWNrYm94X1wiICsgcG9saWN5LmlkfSBjbGFzc05hbWU9XCJteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfdGVybXNQb2xpY3lcIj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG9uQ2hhbmdlPXsoKSA9PiB0aGlzLl90b2dnbGVQb2xpY3kocG9saWN5LmlkKX0gY2hlY2tlZD17Y2hlY2tlZH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17cG9saWN5LnVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPnsgcG9saWN5Lm5hbWUgfTwvYT5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZXJyb3JTZWN0aW9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lcnJvclRleHQgfHwgdGhpcy5zdGF0ZS5lcnJvclRleHQpIHtcbiAgICAgICAgICAgIGVycm9yU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVycm9yXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5lcnJvclRleHQgfHwgdGhpcy5zdGF0ZS5lcnJvclRleHQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdWJtaXRCdXR0b247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNob3dDb250aW51ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vIFhYWDogYnV0dG9uIGNsYXNzZXNcbiAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbiA9IDxidXR0b24gY2xhc3NOYW1lPVwibXhfSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzX3Rlcm1zU3VibWl0IG14X0dlbmVyYWxCdXR0b25cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX3RyeVN1Ym1pdH0gZGlzYWJsZWQ9eyFhbGxDaGVja2VkfT57X3QoXCJBY2NlcHRcIil9PC9idXR0b24+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiUGxlYXNlIHJldmlldyBhbmQgYWNjZXB0IHRoZSBwb2xpY2llcyBvZiB0aGlzIGhvbWVzZXJ2ZXI6XCIpfTwvcD5cbiAgICAgICAgICAgICAgICB7IGNoZWNrYm94ZXMgfVxuICAgICAgICAgICAgICAgIHsgZXJyb3JTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICB7IHN1Ym1pdEJ1dHRvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmF1dGguRW1haWxJZGVudGl0eUF1dGhFbnRyeVwiKVxuZXhwb3J0IGNsYXNzIEVtYWlsSWRlbnRpdHlBdXRoRW50cnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBMT0dJTl9UWVBFID0gXCJtLmxvZ2luLmVtYWlsLmlkZW50aXR5XCI7XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBtYXRyaXhDbGllbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgc3VibWl0QXV0aERpY3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGF1dGhTZXNzaW9uSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgY2xpZW50U2VjcmV0OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGlucHV0czogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBzdGFnZVN0YXRlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIGZhaWw6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIHNldEVtYWlsU2lkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBvblBoYXNlQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKERFRkFVTFRfUEhBU0UpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gVGhpcyBjb21wb25lbnQgaXMgbm93IG9ubHkgZGlzcGxheWVkIG9uY2UgdGhlIHRva2VuIGhhcyBiZWVuIHJlcXVlc3RlZCxcbiAgICAgICAgLy8gc28gd2Uga25vdyB0aGUgZW1haWwgaGFzIGJlZW4gc2VudC4gSXQgY2FuIGFsc28gZ2V0IGxvYWRlZCBhZnRlciB0aGUgdXNlclxuICAgICAgICAvLyBoYXMgY2xpY2tlZCB0aGUgdmFsaWRhdGlvbiBsaW5rIGlmIHRoZSBzZXJ2ZXIgdGFrZXMgYSB3aGlsZSB0byBwcm9wYWdhdGVcbiAgICAgICAgLy8gdGhlIHZhbGlkYXRpb24gaW50ZXJuYWxseS4gSWYgd2UncmUgaW4gdGhlIHNlc3Npb24gc3Bhd25lZCBmcm9tIGNsaWNraW5nXG4gICAgICAgIC8vIHRoZSB2YWxpZGF0aW9uIGxpbmssIHdlIHdvbid0IGtub3cgdGhlIGVtYWlsIGFkZHJlc3MsIHNvIGlmIHdlIGRvbid0IGhhdmUgaXQsXG4gICAgICAgIC8vIGFzc3VtZSB0aGF0IHRoZSBsaW5rIGhhcyBiZWVuIGNsaWNrZWQgYW5kIHRoZSBzZXJ2ZXIgd2lsbCByZWFsaXNlIHdoZW4gd2UgcG9sbC5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaW5wdXRzLmVtYWlsQWRkcmVzcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gPFNwaW5uZXIgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zdGFnZVN0YXRlPy5lbWFpbFNpZCkge1xuICAgICAgICAgICAgLy8gd2Ugb25seSBoYXZlIGEgc2Vzc2lvbiBJRCBpZiB0aGUgdXNlciBoYXMgY2xpY2tlZCB0aGUgbGluayBpbiB0aGVpciBlbWFpbCxcbiAgICAgICAgICAgIC8vIHNvIHNob3cgYSBsb2FkaW5nIHN0YXRlIGluc3RlYWQgb2YgXCJhbiBlbWFpbCBoYXMgYmVlbiBzZW50IHRvLi4uXCIgYmVjYXVzZVxuICAgICAgICAgICAgLy8gdGhhdCdzIGNvbmZ1c2luZyB3aGVuIHlvdSd2ZSBhbHJlYWR5IHJlYWQgdGhhdCBlbWFpbC5cbiAgICAgICAgICAgIHJldHVybiA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfZW1haWxXcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJBIGNvbmZpcm1hdGlvbiBlbWFpbCBoYXMgYmVlbiBzZW50IHRvICUoZW1haWxBZGRyZXNzKXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZW1haWxBZGRyZXNzOiAoc3ViKSA9PiA8Yj57IHRoaXMucHJvcHMuaW5wdXRzLmVtYWlsQWRkcmVzcyB9PC9iPiB9LFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiT3BlbiB0aGUgbGluayBpbiB0aGUgZW1haWwgdG8gY29udGludWUgcmVnaXN0cmF0aW9uLlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuYXV0aC5Nc2lzZG5BdXRoRW50cnlcIilcbmV4cG9ydCBjbGFzcyBNc2lzZG5BdXRoRW50cnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBMT0dJTl9UWVBFID0gXCJtLmxvZ2luLm1zaXNkblwiO1xuXG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgaW5wdXRzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgICAgICAgcGhvbmVDb3VudHJ5OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIH0pLFxuICAgICAgICBmYWlsOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgY2xpZW50U2VjcmV0OiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgc3VibWl0QXV0aERpY3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIG1hdHJpeENsaWVudDogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgb25QaGFzZUNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHRva2VuOiAnJyxcbiAgICAgICAgcmVxdWVzdGluZ1Rva2VuOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25QaGFzZUNoYW5nZShERUZBVUxUX1BIQVNFKTtcblxuICAgICAgICB0aGlzLl9zdWJtaXRVcmwgPSBudWxsO1xuICAgICAgICB0aGlzLl9zaWQgPSBudWxsO1xuICAgICAgICB0aGlzLl9tc2lzZG4gPSBudWxsO1xuICAgICAgICB0aGlzLl90b2tlbkJveCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVxdWVzdGluZ1Rva2VuOiB0cnVlfSk7XG4gICAgICAgIHRoaXMuX3JlcXVlc3RNc2lzZG5Ub2tlbigpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLmZhaWwoZSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVxdWVzdGluZ1Rva2VuOiBmYWxzZX0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFJlcXVlc3RzIGEgdmVyaWZpY2F0aW9uIHRva2VuIGJ5IFNNUy5cbiAgICAgKi9cbiAgICBfcmVxdWVzdE1zaXNkblRva2VuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5tYXRyaXhDbGllbnQucmVxdWVzdFJlZ2lzdGVyTXNpc2RuVG9rZW4oXG4gICAgICAgICAgICB0aGlzLnByb3BzLmlucHV0cy5waG9uZUNvdW50cnksXG4gICAgICAgICAgICB0aGlzLnByb3BzLmlucHV0cy5waG9uZU51bWJlcixcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgMSwgLy8gVE9ETzogTXVsdGlwbGUgc2VuZCBhdHRlbXB0cz9cbiAgICAgICAgKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3N1Ym1pdFVybCA9IHJlc3VsdC5zdWJtaXRfdXJsO1xuICAgICAgICAgICAgdGhpcy5fc2lkID0gcmVzdWx0LnNpZDtcbiAgICAgICAgICAgIHRoaXMuX21zaXNkbiA9IHJlc3VsdC5tc2lzZG47XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vblRva2VuQ2hhbmdlID0gZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdG9rZW46IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uRm9ybVN1Ym1pdCA9IGFzeW5jIGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRva2VuID09ICcnKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlcnJvclRleHQ6IG51bGwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N1Ym1pdFVybCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LnN1Ym1pdE1zaXNkblRva2VuT3RoZXJVcmwoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N1Ym1pdFVybCwgdGhpcy5fc2lkLCB0aGlzLnByb3BzLmNsaWVudFNlY3JldCwgdGhpcy5zdGF0ZS50b2tlbixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgcmVnaXN0cmF0aW9uIHdpdGggTVNJU0ROIGZsb3cgaXMgbWlzY29uZmlndXJlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyZWRzID0ge1xuICAgICAgICAgICAgICAgICAgICBzaWQ6IHRoaXMuX3NpZCxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X3NlY3JldDogdGhpcy5wcm9wcy5jbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnN1Ym1pdEF1dGhEaWN0KHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogTXNpc2RuQXV0aEVudHJ5LkxPR0lOX1RZUEUsXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBgdGhyZWVwaWRfY3JlZHNgIG9uY2Ugc2VydmVycyBzdXBwb3J0IHByb3BlciBVSUFcbiAgICAgICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEwMzEyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9tYXRyaXgtZG9jL2lzc3Vlcy8yMjIwXG4gICAgICAgICAgICAgICAgICAgIHRocmVlcGlkX2NyZWRzOiBjcmVkcyxcbiAgICAgICAgICAgICAgICAgICAgdGhyZWVwaWRDcmVkczogY3JlZHMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IF90KFwiVG9rZW4gaW5jb3JyZWN0XCIpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLmZhaWwoZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBzdWJtaXQgbXNpc2RuIHRva2VuXCIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVxdWVzdGluZ1Rva2VuKSB7XG4gICAgICAgICAgICBjb25zdCBMb2FkZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgIHJldHVybiA8TG9hZGVyIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZW5hYmxlU3VibWl0ID0gQm9vbGVhbih0aGlzLnN0YXRlLnRva2VuKTtcbiAgICAgICAgICAgIGNvbnN0IHN1Ym1pdENsYXNzZXMgPSBjbGFzc25hbWVzKHtcbiAgICAgICAgICAgICAgICBteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfbXNpc2RuU3VibWl0OiB0cnVlLFxuICAgICAgICAgICAgICAgIG14X0dlbmVyYWxCdXR0b246IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBlcnJvclNlY3Rpb247XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvclRleHQpIHtcbiAgICAgICAgICAgICAgICBlcnJvclNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5lcnJvclRleHQgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiQSB0ZXh0IG1lc3NhZ2UgaGFzIGJlZW4gc2VudCB0byAlKG1zaXNkbilzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG1zaXNkbjogPGk+eyB0aGlzLl9tc2lzZG4gfTwvaT4gfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcIlBsZWFzZSBlbnRlciB0aGUgY29kZSBpdCBjb250YWluczpcIikgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfbXNpc2RuV3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMuX29uRm9ybVN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzX21zaXNkbkVudHJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudG9rZW59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vblRva2VuQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXsgX3QoXCJDb2RlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT17X3QoXCJTdWJtaXRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c3VibWl0Q2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFlbmFibGVTdWJtaXR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlcnJvclNlY3Rpb259XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuYXV0aC5TU09BdXRoRW50cnlcIilcbmV4cG9ydCBjbGFzcyBTU09BdXRoRW50cnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1hdHJpeENsaWVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBhdXRoU2Vzc2lvbklkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGxvZ2luVHlwZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBzdWJtaXRBdXRoRGljdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgZXJyb3JUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBvblBoYXNlQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBjb250aW51ZVRleHQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGNvbnRpbnVlS2luZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgb25DYW5jZWw6IFByb3BUeXBlcy5mdW5jLFxuICAgIH07XG5cbiAgICBzdGF0aWMgTE9HSU5fVFlQRSA9IFwibS5sb2dpbi5zc29cIjtcbiAgICBzdGF0aWMgVU5TVEFCTEVfTE9HSU5fVFlQRSA9IFwib3JnLm1hdHJpeC5sb2dpbi5zc29cIjtcblxuICAgIHN0YXRpYyBQSEFTRV9QUkVBVVRIID0gMTsgLy8gYnV0dG9uIHRvIHN0YXJ0IFNTT1xuICAgIHN0YXRpYyBQSEFTRV9QT1NUQVVUSCA9IDI7IC8vIGJ1dHRvbiB0byBjb25maXJtIFNTTyBjb21wbGV0ZWRcblxuICAgIF9zc29Vcmw6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICAvLyBXZSBhY3R1YWxseSBzZW5kIHRoZSB1c2VyIHRocm91Z2ggZmFsbGJhY2sgYXV0aCBzbyB3ZSBkb24ndCBoYXZlIHRvXG4gICAgICAgIC8vIGRlYWwgd2l0aCBhIHJlZGlyZWN0IGJhY2sgdG8gdXMsIGxvc2luZyBhcHBsaWNhdGlvbiBjb250ZXh0LlxuICAgICAgICB0aGlzLl9zc29VcmwgPSBwcm9wcy5tYXRyaXhDbGllbnQuZ2V0RmFsbGJhY2tBdXRoVXJsKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5sb2dpblR5cGUsXG4gICAgICAgICAgICB0aGlzLnByb3BzLmF1dGhTZXNzaW9uSWQsXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5fcG9wdXBXaW5kb3cgPSBudWxsO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5fb25SZWNlaXZlTWVzc2FnZSk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBoYXNlOiBTU09BdXRoRW50cnkuUEhBU0VfUFJFQVVUSCxcbiAgICAgICAgICAgIGF0dGVtcHRGYWlsZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhhc2VDaGFuZ2UoU1NPQXV0aEVudHJ5LlBIQVNFX1BSRUFVVEgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5fb25SZWNlaXZlTWVzc2FnZSk7XG4gICAgICAgIGlmICh0aGlzLl9wb3B1cFdpbmRvdykge1xuICAgICAgICAgICAgdGhpcy5fcG9wdXBXaW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX3BvcHVwV2luZG93ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGF0dGVtcHRGYWlsZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYXR0ZW1wdEZhaWxlZDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vblJlY2VpdmVNZXNzYWdlID0gZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gXCJhdXRoRG9uZVwiICYmIGV2ZW50Lm9yaWdpbiA9PT0gdGhpcy5wcm9wcy5tYXRyaXhDbGllbnQuZ2V0SG9tZXNlcnZlclVybCgpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fcG9wdXBXaW5kb3cpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3B1cFdpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3BvcHVwV2luZG93ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvblN0YXJ0QXV0aENsaWNrID0gKCkgPT4ge1xuICAgICAgICAvLyBOb3RlOiBXZSBkb24ndCB1c2UgUGxhdGZvcm1QZWcncyBzdGFydFNzb0F1dGggZnVuY3Rpb25zIGJlY2F1c2Ugd2UgYWxtb3N0XG4gICAgICAgIC8vIGNlcnRhaW5seSB3aWxsIG5lZWQgdG8gb3BlbiB0aGUgdGhpbmcgaW4gYSBuZXcgdGFiIHRvIGF2b2lkIGxvc2luZyBhcHBsaWNhdGlvblxuICAgICAgICAvLyBjb250ZXh0LlxuXG4gICAgICAgIHRoaXMuX3BvcHVwV2luZG93ID0gd2luZG93Lm9wZW4odGhpcy5fc3NvVXJsLCBcIl9ibGFua1wiKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGhhc2U6IFNTT0F1dGhFbnRyeS5QSEFTRV9QT1NUQVVUSH0pO1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhhc2VDaGFuZ2UoU1NPQXV0aEVudHJ5LlBIQVNFX1BPU1RBVVRIKTtcbiAgICB9O1xuXG4gICAgb25Db25maXJtQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMuc3VibWl0QXV0aERpY3Qoe30pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBjb250aW51ZUJ1dHRvbiA9IG51bGw7XG4gICAgICAgIGNvbnN0IGNhbmNlbEJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNhbmNlbH1cbiAgICAgICAgICAgICAgICBraW5kPXt0aGlzLnByb3BzLmNvbnRpbnVlS2luZCA/ICh0aGlzLnByb3BzLmNvbnRpbnVlS2luZCArICdfb3V0bGluZScpIDogJ3ByaW1hcnlfb3V0bGluZSd9XG4gICAgICAgICAgICA+e190KFwiQ2FuY2VsXCIpfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGhhc2UgPT09IFNTT0F1dGhFbnRyeS5QSEFTRV9QUkVBVVRIKSB7XG4gICAgICAgICAgICBjb250aW51ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU3RhcnRBdXRoQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9e3RoaXMucHJvcHMuY29udGludWVLaW5kIHx8ICdwcmltYXJ5J31cbiAgICAgICAgICAgICAgICA+e3RoaXMucHJvcHMuY29udGludWVUZXh0IHx8IF90KFwiU2luZ2xlIFNpZ24gT25cIil9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRpbnVlQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db25maXJtQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9e3RoaXMucHJvcHMuY29udGludWVLaW5kIHx8ICdwcmltYXJ5J31cbiAgICAgICAgICAgICAgICA+e3RoaXMucHJvcHMuY29udGludWVUZXh0IHx8IF90KFwiQ29uZmlybVwiKX08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yU2VjdGlvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZXJyb3JUZXh0KSB7XG4gICAgICAgICAgICBlcnJvclNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuZXJyb3JUZXh0IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hdHRlbXB0RmFpbGVkKSB7XG4gICAgICAgICAgICBlcnJvclNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiU29tZXRoaW5nIHdlbnQgd3JvbmcgaW4gY29uZmlybWluZyB5b3VyIGlkZW50aXR5LiBDYW5jZWwgYW5kIHRyeSBhZ2Fpbi5cIikgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICB7IGVycm9yU2VjdGlvbiB9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19zc29fYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIHtjYW5jZWxCdXR0b259XG4gICAgICAgICAgICAgICAge2NvbnRpbnVlQnV0dG9ufVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgIH1cbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuYXV0aC5GYWxsYmFja0F1dGhFbnRyeVwiKVxuZXhwb3J0IGNsYXNzIEZhbGxiYWNrQXV0aEVudHJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBtYXRyaXhDbGllbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgYXV0aFNlc3Npb25JZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBsb2dpblR5cGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgc3VibWl0QXV0aERpY3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGVycm9yVGV4dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgb25QaGFzZUNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIC8vIHdlIGhhdmUgdG8gbWFrZSB0aGUgdXNlciBjbGljayBhIGJ1dHRvbiwgYXMgYnJvd3NlcnMgd2lsbCBibG9ja1xuICAgICAgICAvLyB0aGUgcG9wdXAgaWYgd2Ugb3BlbiBpdCBpbW1lZGlhdGVseS5cbiAgICAgICAgdGhpcy5fcG9wdXBXaW5kb3cgPSBudWxsO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5fb25SZWNlaXZlTWVzc2FnZSk7XG5cbiAgICAgICAgdGhpcy5fZmFsbGJhY2tCdXR0b24gPSBjcmVhdGVSZWYoKTtcbiAgICB9XG5cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhhc2VDaGFuZ2UoREVGQVVMVF9QSEFTRSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLl9vblJlY2VpdmVNZXNzYWdlKTtcbiAgICAgICAgaWYgKHRoaXMuX3BvcHVwV2luZG93KSB7XG4gICAgICAgICAgICB0aGlzLl9wb3B1cFdpbmRvdy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9jdXMgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9mYWxsYmFja0J1dHRvbi5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9mYWxsYmFja0J1dHRvbi5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uU2hvd0ZhbGxiYWNrQ2xpY2sgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IHVybCA9IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmdldEZhbGxiYWNrQXV0aFVybChcbiAgICAgICAgICAgIHRoaXMucHJvcHMubG9naW5UeXBlLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5hdXRoU2Vzc2lvbklkLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9wb3B1cFdpbmRvdyA9IHdpbmRvdy5vcGVuKHVybCwgXCJfYmxhbmtcIik7XG4gICAgfTtcblxuICAgIF9vblJlY2VpdmVNZXNzYWdlID0gZXZlbnQgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICBldmVudC5kYXRhID09PSBcImF1dGhEb25lXCIgJiZcbiAgICAgICAgICAgIGV2ZW50Lm9yaWdpbiA9PT0gdGhpcy5wcm9wcy5tYXRyaXhDbGllbnQuZ2V0SG9tZXNlcnZlclVybCgpXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5zdWJtaXRBdXRoRGljdCh7fSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZXJyb3JTZWN0aW9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lcnJvclRleHQpIHtcbiAgICAgICAgICAgIGVycm9yU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVycm9yXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5lcnJvclRleHQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiXCIgcmVmPXt0aGlzLl9mYWxsYmFja0J1dHRvbn0gb25DbGljaz17dGhpcy5fb25TaG93RmFsbGJhY2tDbGlja30+eyBfdChcIlN0YXJ0IGF1dGhlbnRpY2F0aW9uXCIpIH08L2E+XG4gICAgICAgICAgICAgICAge2Vycm9yU2VjdGlvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY29uc3QgQXV0aEVudHJ5Q29tcG9uZW50cyA9IFtcbiAgICBQYXNzd29yZEF1dGhFbnRyeSxcbiAgICBSZWNhcHRjaGFBdXRoRW50cnksXG4gICAgRW1haWxJZGVudGl0eUF1dGhFbnRyeSxcbiAgICBNc2lzZG5BdXRoRW50cnksXG4gICAgVGVybXNBdXRoRW50cnksXG4gICAgU1NPQXV0aEVudHJ5LFxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0RW50cnlDb21wb25lbnRGb3JMb2dpblR5cGUobG9naW5UeXBlKSB7XG4gICAgZm9yIChjb25zdCBjIG9mIEF1dGhFbnRyeUNvbXBvbmVudHMpIHtcbiAgICAgICAgaWYgKGMuTE9HSU5fVFlQRSA9PT0gbG9naW5UeXBlIHx8IGMuVU5TVEFCTEVfTE9HSU5fVFlQRSA9PT0gbG9naW5UeXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gRmFsbGJhY2tBdXRoRW50cnk7XG59XG4iXX0=
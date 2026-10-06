"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

var _Login = _interopRequireDefault(require("../../../Login"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _ErrorUtils = require("../../../utils/ErrorUtils");

var _AutoDiscoveryUtils = _interopRequireDefault(require("../../../utils/AutoDiscoveryUtils"));

var _classnames = _interopRequireDefault(require("classnames"));

var _AuthPage = _interopRequireDefault(require("../../views/auth/AuthPage"));

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _PasswordLogin = _interopRequireDefault(require("../../views/auth/PasswordLogin"));

var _InlineSpinner = _interopRequireDefault(require("../../views/elements/InlineSpinner"));

var _Spinner = _interopRequireDefault(require("../../views/elements/Spinner"));

var _SSOButtons = _interopRequireDefault(require("../../views/elements/SSOButtons"));

var _ServerPicker = _interopRequireDefault(require("../../views/elements/ServerPicker"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// These are used in several places, and come from the js-sdk's autodiscovery
// stuff. We define them here so that they'll be picked up by i18n.
(0, _languageHandler._td)("Invalid homeserver discovery response");
(0, _languageHandler._td)("Failed to get autodiscovery configuration from server");
(0, _languageHandler._td)("Invalid base_url for m.homeserver");
(0, _languageHandler._td)("Homeserver URL does not appear to be a valid Matrix homeserver");
(0, _languageHandler._td)("Invalid identity server discovery response");
(0, _languageHandler._td)("Invalid base_url for m.identity_server");
(0, _languageHandler._td)("Identity server URL does not appear to be a valid identity server");
(0, _languageHandler._td)("General failure");

/*
 * A wire component which glues together login UI components and Login logic
 */
class LoginComponent extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "loginLogic", void 0);
    (0, _defineProperty2.default)(this, "stepRendererMap", void 0);
    (0, _defineProperty2.default)(this, "isBusy", () => this.state.busy || this.props.busy);
    (0, _defineProperty2.default)(this, "onPasswordLogin", async (username, phoneCountry, phoneNumber, password) => {
      if (!this.state.serverIsAlive) {
        this.setState({
          busy: true
        }); // Do a quick liveliness check on the URLs

        let aliveAgain = true;

        try {
          await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(this.props.serverConfig.hsUrl, this.props.serverConfig.isUrl);
          this.setState({
            serverIsAlive: true,
            errorText: ""
          });
        } catch (e) {
          const componentState = _AutoDiscoveryUtils.default.authComponentStateForError(e);

          this.setState(_objectSpread({
            busy: false,
            busyLoggingIn: false
          }, componentState));
          aliveAgain = !componentState.serverErrorIsFatal;
        } // Prevent people from submitting their password when something isn't right.


        if (!aliveAgain) {
          return;
        }
      }

      this.setState({
        busy: true,
        busyLoggingIn: true,
        errorText: null,
        loginIncorrect: false
      });
      this.loginLogic.loginViaPassword(username, phoneCountry, phoneNumber, password).then(data => {
        this.setState({
          serverIsAlive: true
        }); // it must be, we logged in.

        this.props.onLoggedIn(data, password);
      }, error => {
        if (this.unmounted) {
          return;
        }

        let errorText; // Some error strings only apply for logging in

        const usingEmail = username.indexOf("@") > 0;

        if (error.httpStatus === 400 && usingEmail) {
          errorText = (0, _languageHandler._t)('This homeserver does not support login using email address.');
        } else if (error.errcode === 'M_RESOURCE_LIMIT_EXCEEDED') {
          const errorTop = (0, _ErrorUtils.messageForResourceLimitError)(error.data.limit_type, error.data.admin_contact, {
            'monthly_active_user': (0, _languageHandler._td)("This homeserver has hit its Monthly Active User limit."),
            '': (0, _languageHandler._td)("This homeserver has exceeded one of its resource limits.")
          });
          const errorDetail = (0, _ErrorUtils.messageForResourceLimitError)(error.data.limit_type, error.data.admin_contact, {
            '': (0, _languageHandler._td)("Please <a>contact your service administrator</a> to continue using this service.")
          });
          errorText = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, errorTop), /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_Login_smallError"
          }, errorDetail));
        } else if (error.httpStatus === 401 || error.httpStatus === 403) {
          if (error.errcode === 'M_USER_DEACTIVATED') {
            errorText = (0, _languageHandler._t)('This account has been deactivated.');
          } else if (_SdkConfig.default.get()['disable_custom_urls']) {
            errorText = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('Incorrect username and/or password.')), /*#__PURE__*/_react.default.createElement("div", {
              className: "mx_Login_smallError"
            }, (0, _languageHandler._t)('Please note you are logging into the %(hs)s server, not matrix.org.', {
              hs: this.props.serverConfig.hsName
            })));
          } else {
            errorText = (0, _languageHandler._t)('Incorrect username and/or password.');
          }
        } else {
          // other errors, not specific to doing a password login
          errorText = this.errorTextFromError(error);
        }

        this.setState({
          busy: false,
          busyLoggingIn: false,
          errorText: errorText,
          // 401 would be the sensible status code for 'incorrect password'
          // but the login API gives a 403 https://matrix.org/jira/browse/SYN-744
          // mentions this (although the bug is for UI auth which is not this)
          // We treat both as an incorrect password
          loginIncorrect: error.httpStatus === 401 || error.httpStatus === 403
        });
      });
    });
    (0, _defineProperty2.default)(this, "onUsernameChanged", username => {
      this.setState({
        username: username
      });
    });
    (0, _defineProperty2.default)(this, "onUsernameBlur", async username => {
      const doWellknownLookup = username[0] === "@";
      this.setState({
        username: username,
        busy: doWellknownLookup,
        errorText: null,
        canTryLogin: true
      });

      if (doWellknownLookup) {
        const serverName = username.split(':').slice(1).join(':');

        try {
          const result = await _AutoDiscoveryUtils.default.validateServerName(serverName);
          this.props.onServerConfigChange(result); // We'd like to rely on new props coming in via `onServerConfigChange`
          // so that we know the servers have definitely updated before clearing
          // the busy state. In the case of a full MXID that resolves to the same
          // HS as Element's default HS though, there may not be any server change.
          // To avoid this trap, we clear busy here. For cases where the server
          // actually has changed, `initLoginLogic` will be called and manages
          // busy state for its own liveness check.

          this.setState({
            busy: false
          });
        } catch (e) {
          console.error("Problem parsing URL or unhandled error doing .well-known discovery:", e);
          let message = (0, _languageHandler._t)("Failed to perform homeserver discovery");

          if (e.translatedMessage) {
            message = e.translatedMessage;
          }

          let errorText
          /*: ReactNode*/
          = message;
          let discoveryState = {};

          if (_AutoDiscoveryUtils.default.isLivelinessError(e)) {
            errorText = this.state.errorText;
            discoveryState = _AutoDiscoveryUtils.default.authComponentStateForError(e);
          }

          this.setState(_objectSpread({
            busy: false,
            errorText
          }, discoveryState));
        }
      }
    });
    (0, _defineProperty2.default)(this, "onPhoneCountryChanged", phoneCountry => {
      this.setState({
        phoneCountry: phoneCountry
      });
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberChanged", phoneNumber => {
      this.setState({
        phoneNumber: phoneNumber
      });
    });
    (0, _defineProperty2.default)(this, "onRegisterClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onRegisterClick();
    });
    (0, _defineProperty2.default)(this, "onTryRegisterClick", ev => {
      const hasPasswordFlow = this.state.flows?.find(flow => flow.type === "m.login.password");
      const ssoFlow = this.state.flows?.find(flow => flow.type === "m.login.sso" || flow.type === "m.login.cas"); // If has no password flow but an SSO flow guess that the user wants to register with SSO.
      // TODO: instead hide the Register button if registration is disabled by checking with the server,
      // has no specific errCode currently and uses M_FORBIDDEN.

      if (ssoFlow && !hasPasswordFlow) {
        ev.preventDefault();
        ev.stopPropagation();
        const ssoKind = ssoFlow.type === 'm.login.sso' ? 'sso' : 'cas';

        _PlatformPeg.default.get().startSingleSignOn(this.loginLogic.createTemporaryClient(), ssoKind, this.props.fragmentAfterLogin);
      } else {
        // Don't intercept - just go through to the register page
        this.onRegisterClick(ev);
      }
    });
    (0, _defineProperty2.default)(this, "isSupportedFlow", (flow
    /*: LoginFlow*/
    ) =>
    /*: boolean*/
    {
      // technically the flow can have multiple steps, but no one does this
      // for login and loginLogic doesn't support it so we can ignore it.
      if (!this.stepRendererMap[flow.type]) {
        console.log("Skipping flow", flow, "due to unsupported login type", flow.type);
        return false;
      }

      return true;
    });
    (0, _defineProperty2.default)(this, "renderPasswordStep", () => {
      return /*#__PURE__*/_react.default.createElement(_PasswordLogin.default, {
        onSubmit: this.onPasswordLogin,
        username: this.state.username,
        phoneCountry: this.state.phoneCountry,
        phoneNumber: this.state.phoneNumber,
        onUsernameChanged: this.onUsernameChanged,
        onUsernameBlur: this.onUsernameBlur,
        onPhoneCountryChanged: this.onPhoneCountryChanged,
        onPhoneNumberChanged: this.onPhoneNumberChanged,
        onForgotPasswordClick: this.props.onForgotPasswordClick,
        loginIncorrect: this.state.loginIncorrect,
        serverConfig: this.props.serverConfig,
        disableSubmit: this.isBusy(),
        busy: this.props.isSyncing || this.state.busyLoggingIn
      });
    });
    (0, _defineProperty2.default)(this, "renderSsoStep", loginType => {
      const flow = this.state.flows.find(flow => flow.type === "m.login." + loginType);
      return /*#__PURE__*/_react.default.createElement(_SSOButtons.default, {
        matrixClient: this.loginLogic.createTemporaryClient(),
        flow: flow,
        loginType: loginType,
        fragmentAfterLogin: this.props.fragmentAfterLogin,
        primary: !this.state.flows.find(flow => flow.type === "m.login.password")
      });
    });
    this.state = {
      busy: false,
      busyLoggingIn: null,
      errorText: null,
      loginIncorrect: false,
      canTryLogin: true,
      flows: null,
      username: "",
      phoneCountry: null,
      phoneNumber: "",
      serverIsAlive: true,
      serverErrorIsFatal: false,
      serverDeadError: ""
    }; // map from login step type to a function which will render a control
    // letting you do that login type

    this.stepRendererMap = {
      'm.login.password': this.renderPasswordStep,
      // CAS and SSO are the same thing, modulo the url we link to
      'm.login.cas': () => this.renderSsoStep("cas"),
      'm.login.sso': () => this.renderSsoStep("sso")
    };

    _CountlyAnalytics.default.instance.track("onboarding_login_begin");
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillMount() {
    this.initLoginLogic(this.props.serverConfig);
  }

  componentWillUnmount() {
    this.unmounted = true;
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.serverConfig.hsUrl === this.props.serverConfig.hsUrl && newProps.serverConfig.isUrl === this.props.serverConfig.isUrl) return; // Ensure that we end up actually logging in to the right place

    this.initLoginLogic(newProps.serverConfig);
  }

  async initLoginLogic({
    hsUrl,
    isUrl
  }
  /*: ValidatedServerConfig*/
  ) {
    let isDefaultServer = false;

    if (this.props.serverConfig.isDefault && hsUrl === this.props.serverConfig.hsUrl && isUrl === this.props.serverConfig.isUrl) {
      isDefaultServer = true;
    }

    const fallbackHsUrl = isDefaultServer ? this.props.fallbackHsUrl : null;
    const loginLogic = new _Login.default(hsUrl, isUrl, fallbackHsUrl, {
      defaultDeviceDisplayName: this.props.defaultDeviceDisplayName
    });
    this.loginLogic = loginLogic;
    this.setState({
      busy: true,
      loginIncorrect: false
    }); // Do a quick liveliness check on the URLs

    try {
      const {
        warning
      } = await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(hsUrl, isUrl);

      if (warning) {
        this.setState(_objectSpread(_objectSpread({}, _AutoDiscoveryUtils.default.authComponentStateForError(warning)), {}, {
          errorText: ""
        }));
      } else {
        this.setState({
          serverIsAlive: true,
          errorText: ""
        });
      }
    } catch (e) {
      this.setState(_objectSpread({
        busy: false
      }, _AutoDiscoveryUtils.default.authComponentStateForError(e)));
    }

    loginLogic.getFlows().then(flows => {
      // look for a flow where we understand all of the steps.
      const supportedFlows = flows.filter(this.isSupportedFlow);

      if (supportedFlows.length > 0) {
        this.setState({
          flows: supportedFlows
        });
        return;
      } // we got to the end of the list without finding a suitable flow.


      this.setState({
        errorText: (0, _languageHandler._t)("This homeserver doesn't offer any login flows which are supported by this client.")
      });
    }, err => {
      this.setState({
        errorText: this.errorTextFromError(err),
        loginIncorrect: false,
        canTryLogin: false
      });
    }).finally(() => {
      this.setState({
        busy: false
      });
    });
  }

  errorTextFromError(err
  /*: MatrixError*/
  )
  /*: ReactNode*/
  {
    let errCode = err.errcode;

    if (!errCode && err.httpStatus) {
      errCode = "HTTP " + err.httpStatus;
    }

    let errorText
    /*: ReactNode*/
    = (0, _languageHandler._t)("There was a problem communicating with the homeserver, " + "please try again later.") + (errCode ? " (" + errCode + ")" : "");

    if (err.cors === 'rejected') {
      if (window.location.protocol === 'https:' && (this.props.serverConfig.hsUrl.startsWith("http:") || !this.props.serverConfig.hsUrl.startsWith("http"))) {
        errorText = /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Can't connect to homeserver via HTTP when an HTTPS URL is in your browser bar. " + "Either use HTTPS or <a>enable unsafe scripts</a>.", {}, {
          'a': sub => {
            return /*#__PURE__*/_react.default.createElement("a", {
              target: "_blank",
              rel: "noreferrer noopener",
              href: "https://www.google.com/search?&q=enable%20unsafe%20scripts"
            }, sub);
          }
        }));
      } else {
        errorText = /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Can't connect to homeserver - please check your connectivity, ensure your " + "<a>homeserver's SSL certificate</a> is trusted, and that a browser extension " + "is not blocking requests.", {}, {
          'a': sub => /*#__PURE__*/_react.default.createElement("a", {
            target: "_blank",
            rel: "noreferrer noopener",
            href: this.props.serverConfig.hsUrl
          }, sub)
        }));
      }
    }

    return errorText;
  }

  renderLoginComponentForFlows() {
    if (!this.state.flows) return null; // this is the ideal order we want to show the flows in

    const order = ["m.login.password", "m.login.sso"];
    const flows = order.map(type => this.state.flows.find(flow => flow.type === type)).filter(Boolean);
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, flows.map(flow => {
      const stepRenderer = this.stepRendererMap[flow.type];
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
        key: flow.type
      }, stepRenderer());
    }));
  }

  render() {
    const AuthHeader = sdk.getComponent("auth.AuthHeader");
    const AuthBody = sdk.getComponent("auth.AuthBody");
    const loader = this.isBusy() && !this.state.busyLoggingIn ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Login_loader"
    }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null)) : null;
    const errorText = this.state.errorText;
    let errorTextSection;

    if (errorText) {
      errorTextSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Login_error"
      }, errorText);
    }

    let serverDeadSection;

    if (!this.state.serverIsAlive) {
      const classes = (0, _classnames.default)({
        "mx_Login_error": true,
        "mx_Login_serverError": true,
        "mx_Login_serverErrorNonFatal": !this.state.serverErrorIsFatal
      });
      serverDeadSection = /*#__PURE__*/_react.default.createElement("div", {
        className: classes
      }, this.state.serverDeadError);
    }

    let footer;

    if (this.props.isSyncing || this.state.busyLoggingIn) {
      footer = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AuthBody_paddedFooter"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AuthBody_paddedFooter_title"
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, {
        w: 20,
        h: 20
      }), this.props.isSyncing ? (0, _languageHandler._t)("Syncing...") : (0, _languageHandler._t)("Signing In...")), this.props.isSyncing && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AuthBody_paddedFooter_subtitle"
      }, (0, _languageHandler._t)("If you've joined lots of rooms, this might take a while")));
    } else if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Registration)) {
      footer = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_AuthBody_changeFlow"
      }, (0, _languageHandler._t)("New? <a>Create account</a>", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          onClick: this.onTryRegisterClick,
          href: "#"
        }, sub)
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_AuthPage.default, null, /*#__PURE__*/_react.default.createElement(AuthHeader, {
      disableLanguageSelector: this.props.isSyncing || this.state.busyLoggingIn
    }), /*#__PURE__*/_react.default.createElement(AuthBody, null, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)('Sign in'), loader), errorTextSection, serverDeadSection, /*#__PURE__*/_react.default.createElement(_ServerPicker.default, {
      serverConfig: this.props.serverConfig,
      onServerConfigChange: this.props.onServerConfigChange
    }), this.renderLoginComponentForFlows(), footer));
  }

}

exports.default = LoginComponent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvYXV0aC9Mb2dpbi50c3giXSwibmFtZXMiOlsiTG9naW5Db21wb25lbnQiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3RhdGUiLCJidXN5IiwidXNlcm5hbWUiLCJwaG9uZUNvdW50cnkiLCJwaG9uZU51bWJlciIsInBhc3N3b3JkIiwic2VydmVySXNBbGl2ZSIsInNldFN0YXRlIiwiYWxpdmVBZ2FpbiIsIkF1dG9EaXNjb3ZlcnlVdGlscyIsInZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMiLCJzZXJ2ZXJDb25maWciLCJoc1VybCIsImlzVXJsIiwiZXJyb3JUZXh0IiwiZSIsImNvbXBvbmVudFN0YXRlIiwiYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IiLCJidXN5TG9nZ2luZ0luIiwic2VydmVyRXJyb3JJc0ZhdGFsIiwibG9naW5JbmNvcnJlY3QiLCJsb2dpbkxvZ2ljIiwibG9naW5WaWFQYXNzd29yZCIsInRoZW4iLCJkYXRhIiwib25Mb2dnZWRJbiIsImVycm9yIiwidW5tb3VudGVkIiwidXNpbmdFbWFpbCIsImluZGV4T2YiLCJodHRwU3RhdHVzIiwiZXJyY29kZSIsImVycm9yVG9wIiwibGltaXRfdHlwZSIsImFkbWluX2NvbnRhY3QiLCJlcnJvckRldGFpbCIsIlNka0NvbmZpZyIsImdldCIsImhzIiwiaHNOYW1lIiwiZXJyb3JUZXh0RnJvbUVycm9yIiwiZG9XZWxsa25vd25Mb29rdXAiLCJjYW5UcnlMb2dpbiIsInNlcnZlck5hbWUiLCJzcGxpdCIsInNsaWNlIiwiam9pbiIsInJlc3VsdCIsInZhbGlkYXRlU2VydmVyTmFtZSIsIm9uU2VydmVyQ29uZmlnQ2hhbmdlIiwiY29uc29sZSIsIm1lc3NhZ2UiLCJ0cmFuc2xhdGVkTWVzc2FnZSIsImRpc2NvdmVyeVN0YXRlIiwiaXNMaXZlbGluZXNzRXJyb3IiLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwib25SZWdpc3RlckNsaWNrIiwiaGFzUGFzc3dvcmRGbG93IiwiZmxvd3MiLCJmaW5kIiwiZmxvdyIsInR5cGUiLCJzc29GbG93Iiwic3NvS2luZCIsIlBsYXRmb3JtUGVnIiwic3RhcnRTaW5nbGVTaWduT24iLCJjcmVhdGVUZW1wb3JhcnlDbGllbnQiLCJmcmFnbWVudEFmdGVyTG9naW4iLCJzdGVwUmVuZGVyZXJNYXAiLCJsb2ciLCJvblBhc3N3b3JkTG9naW4iLCJvblVzZXJuYW1lQ2hhbmdlZCIsIm9uVXNlcm5hbWVCbHVyIiwib25QaG9uZUNvdW50cnlDaGFuZ2VkIiwib25QaG9uZU51bWJlckNoYW5nZWQiLCJvbkZvcmdvdFBhc3N3b3JkQ2xpY2siLCJpc0J1c3kiLCJpc1N5bmNpbmciLCJsb2dpblR5cGUiLCJzZXJ2ZXJEZWFkRXJyb3IiLCJyZW5kZXJQYXNzd29yZFN0ZXAiLCJyZW5kZXJTc29TdGVwIiwiQ291bnRseUFuYWx5dGljcyIsImluc3RhbmNlIiwidHJhY2siLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50IiwiaW5pdExvZ2luTG9naWMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV3UHJvcHMiLCJpc0RlZmF1bHRTZXJ2ZXIiLCJpc0RlZmF1bHQiLCJmYWxsYmFja0hzVXJsIiwiTG9naW4iLCJkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUiLCJ3YXJuaW5nIiwiZ2V0Rmxvd3MiLCJzdXBwb3J0ZWRGbG93cyIsImZpbHRlciIsImlzU3VwcG9ydGVkRmxvdyIsImxlbmd0aCIsImVyciIsImZpbmFsbHkiLCJlcnJDb2RlIiwiY29ycyIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJzdGFydHNXaXRoIiwic3ViIiwicmVuZGVyTG9naW5Db21wb25lbnRGb3JGbG93cyIsIm9yZGVyIiwibWFwIiwiQm9vbGVhbiIsInN0ZXBSZW5kZXJlciIsInJlbmRlciIsIkF1dGhIZWFkZXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJBdXRoQm9keSIsImxvYWRlciIsImVycm9yVGV4dFNlY3Rpb24iLCJzZXJ2ZXJEZWFkU2VjdGlvbiIsImNsYXNzZXMiLCJmb290ZXIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJVSUZlYXR1cmUiLCJSZWdpc3RyYXRpb24iLCJhIiwib25UcnlSZWdpc3RlckNsaWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQTtBQUNBO0FBQ0EsMEJBQUksdUNBQUo7QUFDQSwwQkFBSSx1REFBSjtBQUNBLDBCQUFJLG1DQUFKO0FBQ0EsMEJBQUksZ0VBQUo7QUFDQSwwQkFBSSw0Q0FBSjtBQUNBLDBCQUFJLHdDQUFKO0FBQ0EsMEJBQUksbUVBQUo7QUFDQSwwQkFBSSxpQkFBSjs7QUFtREE7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsY0FBTixTQUE2QkMsZUFBTUM7QUFBbkM7QUFBaUU7QUFNNUVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHFEQUxDLEtBS0Q7QUFBQTtBQUFBO0FBQUEsa0RBc0RWLE1BQU0sS0FBS0MsS0FBTCxDQUFXQyxJQUFYLElBQW1CLEtBQUtGLEtBQUwsQ0FBV0UsSUF0RDFCO0FBQUEsMkRBd0RELE9BQU9DLFFBQVAsRUFBaUJDLFlBQWpCLEVBQStCQyxXQUEvQixFQUE0Q0MsUUFBNUMsS0FBeUQ7QUFDdkUsVUFBSSxDQUFDLEtBQUtMLEtBQUwsQ0FBV00sYUFBaEIsRUFBK0I7QUFDM0IsYUFBS0MsUUFBTCxDQUFjO0FBQUNOLFVBQUFBLElBQUksRUFBRTtBQUFQLFNBQWQsRUFEMkIsQ0FFM0I7O0FBQ0EsWUFBSU8sVUFBVSxHQUFHLElBQWpCOztBQUNBLFlB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UUFBRCxxQkFDSSx5Q0FDSyx5QkFBRyxTQUFILENBREwsRUFFS3dHLE1BRkwsQ0FESixFQUtNQyxnQkFMTixFQU1NQyxpQkFOTixlQU9JLDZCQUFDLHFCQUFEO0FBQ0ksTUFBQSxZQUFZLEVBQUUsS0FBSzdILEtBQUwsQ0FBV1ksWUFEN0I7QUFFSSxNQUFBLG9CQUFvQixFQUFFLEtBQUtaLEtBQUwsQ0FBV2tEO0FBRnJDLE1BUEosRUFXTSxLQUFLK0QsNEJBQUwsRUFYTixFQVlNYyxNQVpOLENBRkosQ0FESjtBQW1CSDs7QUExZjJFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2LCAyMDE3LCAyMDE4LCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7UmVhY3ROb2RlfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge01hdHJpeEVycm9yfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvaHR0cC1hcGlcIjtcblxuaW1wb3J0IHtfdCwgX3RkfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBMb2dpbiwge0lTU09GbG93LCBMb2dpbkZsb3d9IGZyb20gJy4uLy4uLy4uL0xvZ2luJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB7IG1lc3NhZ2VGb3JSZXNvdXJjZUxpbWl0RXJyb3IgfSBmcm9tICcuLi8uLi8uLi91dGlscy9FcnJvclV0aWxzJztcbmltcG9ydCBBdXRvRGlzY292ZXJ5VXRpbHMsIHtWYWxpZGF0ZWRTZXJ2ZXJDb25maWd9IGZyb20gXCIuLi8uLi8uLi91dGlscy9BdXRvRGlzY292ZXJ5VXRpbHNcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgQXV0aFBhZ2UgZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvQXV0aFBhZ2VcIjtcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tICcuLi8uLi8uLi9QbGF0Zm9ybVBlZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtVSUZlYXR1cmV9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuLi8uLi8uLi9Db3VudGx5QW5hbHl0aWNzXCI7XG5pbXBvcnQge0lNYXRyaXhDbGllbnRDcmVkc30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFBhc3N3b3JkTG9naW4gZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvUGFzc3dvcmRMb2dpblwiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL0lubGluZVNwaW5uZXJcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi8uLi92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgU1NPQnV0dG9ucyBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvU1NPQnV0dG9uc1wiO1xuaW1wb3J0IFNlcnZlclBpY2tlciBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvU2VydmVyUGlja2VyXCI7XG5cbi8vIFRoZXNlIGFyZSB1c2VkIGluIHNldmVyYWwgcGxhY2VzLCBhbmQgY29tZSBmcm9tIHRoZSBqcy1zZGsncyBhdXRvZGlzY292ZXJ5XG4vLyBzdHVmZi4gV2UgZGVmaW5lIHRoZW0gaGVyZSBzbyB0aGF0IHRoZXknbGwgYmUgcGlja2VkIHVwIGJ5IGkxOG4uXG5fdGQoXCJJbnZhbGlkIGhvbWVzZXJ2ZXIgZGlzY292ZXJ5IHJlc3BvbnNlXCIpO1xuX3RkKFwiRmFpbGVkIHRvIGdldCBhdXRvZGlzY292ZXJ5IGNvbmZpZ3VyYXRpb24gZnJvbSBzZXJ2ZXJcIik7XG5fdGQoXCJJbnZhbGlkIGJhc2VfdXJsIGZvciBtLmhvbWVzZXJ2ZXJcIik7XG5fdGQoXCJIb21lc2VydmVyIFVSTCBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSB2YWxpZCBNYXRyaXggaG9tZXNlcnZlclwiKTtcbl90ZChcIkludmFsaWQgaWRlbnRpdHkgc2VydmVyIGRpc2NvdmVyeSByZXNwb25zZVwiKTtcbl90ZChcIkludmFsaWQgYmFzZV91cmwgZm9yIG0uaWRlbnRpdHlfc2VydmVyXCIpO1xuX3RkKFwiSWRlbnRpdHkgc2VydmVyIFVSTCBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSB2YWxpZCBpZGVudGl0eSBzZXJ2ZXJcIik7XG5fdGQoXCJHZW5lcmFsIGZhaWx1cmVcIik7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHNlcnZlckNvbmZpZzogVmFsaWRhdGVkU2VydmVyQ29uZmlnO1xuICAgIC8vIElmIHRydWUsIHRoZSBjb21wb25lbnQgd2lsbCBjb25zaWRlciBpdHNlbGYgYnVzeS5cbiAgICBidXN5PzogYm9vbGVhbjtcbiAgICBpc1N5bmNpbmc/OiBib29sZWFuO1xuICAgIC8vIFNlY29uZGFyeSBIUyB3aGljaCB3ZSB0cnkgdG8gbG9nIGludG8gaWYgdGhlIHVzZXIgaXMgdXNpbmdcbiAgICAvLyB0aGUgZGVmYXVsdCBIUyBidXQgbG9naW4gZmFpbHMuIFVzZWZ1bCBmb3IgbWlncmF0aW5nIHRvIGFcbiAgICAvLyBkaWZmZXJlbnQgaG9tZXNlcnZlciB3aXRob3V0IGNvbmZ1c2luZyB1c2Vycy5cbiAgICBmYWxsYmFja0hzVXJsPzogc3RyaW5nO1xuICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZT86IHN0cmluZztcbiAgICBmcmFnbWVudEFmdGVyTG9naW4/OiBzdHJpbmc7XG5cbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBoYXMgbG9nZ2VkIGluLiBQYXJhbXM6XG4gICAgLy8gLSBUaGUgb2JqZWN0IHJldHVybmVkIGJ5IHRoZSBsb2dpbiBBUElcbiAgICAvLyAtIFRoZSB1c2VyJ3MgcGFzc3dvcmQsIGlmIGFwcGxpY2FibGUsIChtYXkgYmUgY2FjaGVkIGluIG1lbW9yeSBmb3IgYVxuICAgIC8vICAgc2hvcnQgdGltZSBzbyB0aGUgdXNlciBpcyBub3QgcmVxdWlyZWQgdG8gcmUtZW50ZXIgdGhlaXIgcGFzc3dvcmRcbiAgICAvLyAgIGZvciBvcGVyYXRpb25zIGxpa2UgdXBsb2FkaW5nIGNyb3NzLXNpZ25pbmcga2V5cykuXG4gICAgb25Mb2dnZWRJbihkYXRhOiBJTWF0cml4Q2xpZW50Q3JlZHMsIHBhc3N3b3JkOiBzdHJpbmcpOiB2b2lkO1xuXG4gICAgLy8gbG9naW4gc2hvdWxkbid0IGtub3cgb3IgY2FyZSBob3cgcmVnaXN0cmF0aW9uLCBwYXNzd29yZCByZWNvdmVyeSwgZXRjIGlzIGRvbmUuXG4gICAgb25SZWdpc3RlckNsaWNrKCk6IHZvaWQ7XG4gICAgb25Gb3Jnb3RQYXNzd29yZENsaWNrPygpOiB2b2lkO1xuICAgIG9uU2VydmVyQ29uZmlnQ2hhbmdlKGNvbmZpZzogVmFsaWRhdGVkU2VydmVyQ29uZmlnKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgYnVzeTogYm9vbGVhbjtcbiAgICBidXN5TG9nZ2luZ0luPzogYm9vbGVhbjtcbiAgICBlcnJvclRleHQ/OiBSZWFjdE5vZGU7XG4gICAgbG9naW5JbmNvcnJlY3Q6IGJvb2xlYW47XG4gICAgLy8gY2FuIHdlIGF0dGVtcHQgdG8gbG9nIGluIG9yIGFyZSB0aGVyZSB2YWxpZGF0aW9uIGVycm9ycz9cbiAgICBjYW5UcnlMb2dpbjogYm9vbGVhbjtcblxuICAgIGZsb3dzPzogTG9naW5GbG93W107XG5cbiAgICAvLyB1c2VkIGZvciBwcmVzZXJ2aW5nIGZvcm0gdmFsdWVzIHdoZW4gY2hhbmdpbmcgaG9tZXNlcnZlclxuICAgIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgcGhvbmVDb3VudHJ5Pzogc3RyaW5nO1xuICAgIHBob25lTnVtYmVyOiBzdHJpbmc7XG5cbiAgICAvLyBXZSBwZXJmb3JtIGxpdmVsaW5lc3MgY2hlY2tzIGxhdGVyLCBidXQgZm9yIG5vdyBzdXBwcmVzcyB0aGUgZXJyb3JzLlxuICAgIC8vIFdlIGFsc28gdHJhY2sgdGhlIHNlcnZlciBkZWFkIGVycm9ycyBpbmRlcGVuZGVudGx5IG9mIHRoZSByZWd1bGFyIGVycm9ycyBzb1xuICAgIC8vIHRoYXQgd2UgY2FuIHJlbmRlciBpdCBkaWZmZXJlbnRseSwgYW5kIG92ZXJyaWRlIGFueSBvdGhlciBlcnJvciB0aGUgdXNlciBtYXlcbiAgICAvLyBiZSBzZWVpbmcuXG4gICAgc2VydmVySXNBbGl2ZTogYm9vbGVhbjtcbiAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGJvb2xlYW47XG4gICAgc2VydmVyRGVhZEVycm9yOiBzdHJpbmc7XG59XG5cbi8qXG4gKiBBIHdpcmUgY29tcG9uZW50IHdoaWNoIGdsdWVzIHRvZ2V0aGVyIGxvZ2luIFVJIGNvbXBvbmVudHMgYW5kIExvZ2luIGxvZ2ljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvZ2luQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgdW5tb3VudGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBsb2dpbkxvZ2ljOiBMb2dpbjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RlcFJlbmRlcmVyTWFwOiBSZWNvcmQ8c3RyaW5nLCAoKSA9PiBSZWFjdE5vZGU+O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGJ1c3lMb2dnaW5nSW46IG51bGwsXG4gICAgICAgICAgICBlcnJvclRleHQ6IG51bGwsXG4gICAgICAgICAgICBsb2dpbkluY29ycmVjdDogZmFsc2UsXG4gICAgICAgICAgICBjYW5UcnlMb2dpbjogdHJ1ZSxcblxuICAgICAgICAgICAgZmxvd3M6IG51bGwsXG5cbiAgICAgICAgICAgIHVzZXJuYW1lOiBcIlwiLFxuICAgICAgICAgICAgcGhvbmVDb3VudHJ5OiBudWxsLFxuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IFwiXCIsXG5cbiAgICAgICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGZhbHNlLFxuICAgICAgICAgICAgc2VydmVyRGVhZEVycm9yOiBcIlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIG1hcCBmcm9tIGxvZ2luIHN0ZXAgdHlwZSB0byBhIGZ1bmN0aW9uIHdoaWNoIHdpbGwgcmVuZGVyIGEgY29udHJvbFxuICAgICAgICAvLyBsZXR0aW5nIHlvdSBkbyB0aGF0IGxvZ2luIHR5cGVcbiAgICAgICAgdGhpcy5zdGVwUmVuZGVyZXJNYXAgPSB7XG4gICAgICAgICAgICAnbS5sb2dpbi5wYXNzd29yZCc6IHRoaXMucmVuZGVyUGFzc3dvcmRTdGVwLFxuXG4gICAgICAgICAgICAvLyBDQVMgYW5kIFNTTyBhcmUgdGhlIHNhbWUgdGhpbmcsIG1vZHVsbyB0aGUgdXJsIHdlIGxpbmsgdG9cbiAgICAgICAgICAgICdtLmxvZ2luLmNhcyc6ICgpID0+IHRoaXMucmVuZGVyU3NvU3RlcChcImNhc1wiKSxcbiAgICAgICAgICAgICdtLmxvZ2luLnNzbyc6ICgpID0+IHRoaXMucmVuZGVyU3NvU3RlcChcInNzb1wiKSxcbiAgICAgICAgfTtcblxuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19sb2dpbl9iZWdpblwiKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICB0aGlzLmluaXRMb2dpbkxvZ2ljKHRoaXMucHJvcHMuc2VydmVyQ29uZmlnKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIGlmIChuZXdQcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmwgPT09IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsICYmXG4gICAgICAgICAgICBuZXdQcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwgPT09IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmlzVXJsKSByZXR1cm47XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgd2UgZW5kIHVwIGFjdHVhbGx5IGxvZ2dpbmcgaW4gdG8gdGhlIHJpZ2h0IHBsYWNlXG4gICAgICAgIHRoaXMuaW5pdExvZ2luTG9naWMobmV3UHJvcHMuc2VydmVyQ29uZmlnKTtcbiAgICB9XG5cbiAgICBpc0J1c3kgPSAoKSA9PiB0aGlzLnN0YXRlLmJ1c3kgfHwgdGhpcy5wcm9wcy5idXN5O1xuXG4gICAgb25QYXNzd29yZExvZ2luID0gYXN5bmMgKHVzZXJuYW1lLCBwaG9uZUNvdW50cnksIHBob25lTnVtYmVyLCBwYXNzd29yZCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VydmVySXNBbGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuICAgICAgICAgICAgLy8gRG8gYSBxdWljayBsaXZlbGluZXNzIGNoZWNrIG9uIHRoZSBVUkxzXG4gICAgICAgICAgICBsZXQgYWxpdmVBZ2FpbiA9IHRydWU7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IEF1dG9EaXNjb3ZlcnlVdGlscy52YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzZXJ2ZXJJc0FsaXZlOiB0cnVlLCBlcnJvclRleHQ6IFwiXCJ9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRTdGF0ZSA9IEF1dG9EaXNjb3ZlcnlVdGlscy5hdXRoQ29tcG9uZW50U3RhdGVGb3JFcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGJ1c3lMb2dnaW5nSW46IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAuLi5jb21wb25lbnRTdGF0ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhbGl2ZUFnYWluID0gIWNvbXBvbmVudFN0YXRlLnNlcnZlckVycm9ySXNGYXRhbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHJldmVudCBwZW9wbGUgZnJvbSBzdWJtaXR0aW5nIHRoZWlyIHBhc3N3b3JkIHdoZW4gc29tZXRoaW5nIGlzbid0IHJpZ2h0LlxuICAgICAgICAgICAgaWYgKCFhbGl2ZUFnYWluKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBidXN5OiB0cnVlLFxuICAgICAgICAgICAgYnVzeUxvZ2dpbmdJbjogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yVGV4dDogbnVsbCxcbiAgICAgICAgICAgIGxvZ2luSW5jb3JyZWN0OiBmYWxzZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5sb2dpbkxvZ2ljLmxvZ2luVmlhUGFzc3dvcmQoXG4gICAgICAgICAgICB1c2VybmFtZSwgcGhvbmVDb3VudHJ5LCBwaG9uZU51bWJlciwgcGFzc3dvcmQsXG4gICAgICAgICkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VydmVySXNBbGl2ZTogdHJ1ZX0pOyAvLyBpdCBtdXN0IGJlLCB3ZSBsb2dnZWQgaW4uXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uTG9nZ2VkSW4oZGF0YSwgcGFzc3dvcmQpO1xuICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBlcnJvclRleHQ7XG5cbiAgICAgICAgICAgIC8vIFNvbWUgZXJyb3Igc3RyaW5ncyBvbmx5IGFwcGx5IGZvciBsb2dnaW5nIGluXG4gICAgICAgICAgICBjb25zdCB1c2luZ0VtYWlsID0gdXNlcm5hbWUuaW5kZXhPZihcIkBcIikgPiAwO1xuICAgICAgICAgICAgaWYgKGVycm9yLmh0dHBTdGF0dXMgPT09IDQwMCAmJiB1c2luZ0VtYWlsKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoJ1RoaXMgaG9tZXNlcnZlciBkb2VzIG5vdCBzdXBwb3J0IGxvZ2luIHVzaW5nIGVtYWlsIGFkZHJlc3MuJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLmVycmNvZGUgPT09ICdNX1JFU09VUkNFX0xJTUlUX0VYQ0VFREVEJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yVG9wID0gbWVzc2FnZUZvclJlc291cmNlTGltaXRFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuZGF0YS5saW1pdF90eXBlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvci5kYXRhLmFkbWluX2NvbnRhY3QsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdtb250aGx5X2FjdGl2ZV91c2VyJzogX3RkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyBob21lc2VydmVyIGhhcyBoaXQgaXRzIE1vbnRobHkgQWN0aXZlIFVzZXIgbGltaXQuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyc6IF90ZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaG9tZXNlcnZlciBoYXMgZXhjZWVkZWQgb25lIG9mIGl0cyByZXNvdXJjZSBsaW1pdHMuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JEZXRhaWwgPSBtZXNzYWdlRm9yUmVzb3VyY2VMaW1pdEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBlcnJvci5kYXRhLmxpbWl0X3R5cGUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yLmRhdGEuYWRtaW5fY29udGFjdCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgJyc6IF90ZChcIlBsZWFzZSA8YT5jb250YWN0IHlvdXIgc2VydmljZSBhZG1pbmlzdHJhdG9yPC9hPiB0byBjb250aW51ZSB1c2luZyB0aGlzIHNlcnZpY2UuXCIpLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj57ZXJyb3JUb3B9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xvZ2luX3NtYWxsRXJyb3JcIj57ZXJyb3JEZXRhaWx9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLmh0dHBTdGF0dXMgPT09IDQwMSB8fCBlcnJvci5odHRwU3RhdHVzID09PSA0MDMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IuZXJyY29kZSA9PT0gJ01fVVNFUl9ERUFDVElWQVRFRCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoJ1RoaXMgYWNjb3VudCBoYXMgYmVlbiBkZWFjdGl2YXRlZC4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFNka0NvbmZpZy5nZXQoKVsnZGlzYWJsZV9jdXN0b21fdXJscyddKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj57IF90KCdJbmNvcnJlY3QgdXNlcm5hbWUgYW5kL29yIHBhc3N3b3JkLicpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xvZ2luX3NtYWxsRXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BsZWFzZSBub3RlIHlvdSBhcmUgbG9nZ2luZyBpbnRvIHRoZSAlKGhzKXMgc2VydmVyLCBub3QgbWF0cml4Lm9yZy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2hzOiB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc05hbWV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoJ0luY29ycmVjdCB1c2VybmFtZSBhbmQvb3IgcGFzc3dvcmQuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBvdGhlciBlcnJvcnMsIG5vdCBzcGVjaWZpYyB0byBkb2luZyBhIHBhc3N3b3JkIGxvZ2luXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gdGhpcy5lcnJvclRleHRGcm9tRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBidXN5TG9nZ2luZ0luOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IGVycm9yVGV4dCxcbiAgICAgICAgICAgICAgICAvLyA0MDEgd291bGQgYmUgdGhlIHNlbnNpYmxlIHN0YXR1cyBjb2RlIGZvciAnaW5jb3JyZWN0IHBhc3N3b3JkJ1xuICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGUgbG9naW4gQVBJIGdpdmVzIGEgNDAzIGh0dHBzOi8vbWF0cml4Lm9yZy9qaXJhL2Jyb3dzZS9TWU4tNzQ0XG4gICAgICAgICAgICAgICAgLy8gbWVudGlvbnMgdGhpcyAoYWx0aG91Z2ggdGhlIGJ1ZyBpcyBmb3IgVUkgYXV0aCB3aGljaCBpcyBub3QgdGhpcylcbiAgICAgICAgICAgICAgICAvLyBXZSB0cmVhdCBib3RoIGFzIGFuIGluY29ycmVjdCBwYXNzd29yZFxuICAgICAgICAgICAgICAgIGxvZ2luSW5jb3JyZWN0OiBlcnJvci5odHRwU3RhdHVzID09PSA0MDEgfHwgZXJyb3IuaHR0cFN0YXR1cyA9PT0gNDAzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvblVzZXJuYW1lQ2hhbmdlZCA9IHVzZXJuYW1lID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVzZXJuYW1lOiB1c2VybmFtZSB9KTtcbiAgICB9O1xuXG4gICAgb25Vc2VybmFtZUJsdXIgPSBhc3luYyB1c2VybmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGRvV2VsbGtub3duTG9va3VwID0gdXNlcm5hbWVbMF0gPT09IFwiQFwiO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgICAgIGJ1c3k6IGRvV2VsbGtub3duTG9va3VwLFxuICAgICAgICAgICAgZXJyb3JUZXh0OiBudWxsLFxuICAgICAgICAgICAgY2FuVHJ5TG9naW46IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZG9XZWxsa25vd25Mb29rdXApIHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlck5hbWUgPSB1c2VybmFtZS5zcGxpdCgnOicpLnNsaWNlKDEpLmpvaW4oJzonKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQXV0b0Rpc2NvdmVyeVV0aWxzLnZhbGlkYXRlU2VydmVyTmFtZShzZXJ2ZXJOYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uU2VydmVyQ29uZmlnQ2hhbmdlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgLy8gV2UnZCBsaWtlIHRvIHJlbHkgb24gbmV3IHByb3BzIGNvbWluZyBpbiB2aWEgYG9uU2VydmVyQ29uZmlnQ2hhbmdlYFxuICAgICAgICAgICAgICAgIC8vIHNvIHRoYXQgd2Uga25vdyB0aGUgc2VydmVycyBoYXZlIGRlZmluaXRlbHkgdXBkYXRlZCBiZWZvcmUgY2xlYXJpbmdcbiAgICAgICAgICAgICAgICAvLyB0aGUgYnVzeSBzdGF0ZS4gSW4gdGhlIGNhc2Ugb2YgYSBmdWxsIE1YSUQgdGhhdCByZXNvbHZlcyB0byB0aGUgc2FtZVxuICAgICAgICAgICAgICAgIC8vIEhTIGFzIEVsZW1lbnQncyBkZWZhdWx0IEhTIHRob3VnaCwgdGhlcmUgbWF5IG5vdCBiZSBhbnkgc2VydmVyIGNoYW5nZS5cbiAgICAgICAgICAgICAgICAvLyBUbyBhdm9pZCB0aGlzIHRyYXAsIHdlIGNsZWFyIGJ1c3kgaGVyZS4gRm9yIGNhc2VzIHdoZXJlIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgICAgICAvLyBhY3R1YWxseSBoYXMgY2hhbmdlZCwgYGluaXRMb2dpbkxvZ2ljYCB3aWxsIGJlIGNhbGxlZCBhbmQgbWFuYWdlc1xuICAgICAgICAgICAgICAgIC8vIGJ1c3kgc3RhdGUgZm9yIGl0cyBvd24gbGl2ZW5lc3MgY2hlY2suXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJQcm9ibGVtIHBhcnNpbmcgVVJMIG9yIHVuaGFuZGxlZCBlcnJvciBkb2luZyAud2VsbC1rbm93biBkaXNjb3Zlcnk6XCIsIGUpO1xuXG4gICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBfdChcIkZhaWxlZCB0byBwZXJmb3JtIGhvbWVzZXJ2ZXIgZGlzY292ZXJ5XCIpO1xuICAgICAgICAgICAgICAgIGlmIChlLnRyYW5zbGF0ZWRNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBlLnRyYW5zbGF0ZWRNZXNzYWdlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBlcnJvclRleHQ6IFJlYWN0Tm9kZSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgbGV0IGRpc2NvdmVyeVN0YXRlID0ge307XG4gICAgICAgICAgICAgICAgaWYgKEF1dG9EaXNjb3ZlcnlVdGlscy5pc0xpdmVsaW5lc3NFcnJvcihlKSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQgPSB0aGlzLnN0YXRlLmVycm9yVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgZGlzY292ZXJ5U3RhdGUgPSBBdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQsXG4gICAgICAgICAgICAgICAgICAgIC4uLmRpc2NvdmVyeVN0YXRlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uUGhvbmVDb3VudHJ5Q2hhbmdlZCA9IHBob25lQ291bnRyeSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaG9uZUNvdW50cnk6IHBob25lQ291bnRyeSB9KTtcbiAgICB9O1xuXG4gICAgb25QaG9uZU51bWJlckNoYW5nZWQgPSBwaG9uZU51bWJlciA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IHBob25lTnVtYmVyLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25SZWdpc3RlckNsaWNrID0gZXYgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblJlZ2lzdGVyQ2xpY2soKTtcbiAgICB9O1xuXG4gICAgb25UcnlSZWdpc3RlckNsaWNrID0gZXYgPT4ge1xuICAgICAgICBjb25zdCBoYXNQYXNzd29yZEZsb3cgPSB0aGlzLnN0YXRlLmZsb3dzPy5maW5kKGZsb3cgPT4gZmxvdy50eXBlID09PSBcIm0ubG9naW4ucGFzc3dvcmRcIik7XG4gICAgICAgIGNvbnN0IHNzb0Zsb3cgPSB0aGlzLnN0YXRlLmZsb3dzPy5maW5kKGZsb3cgPT4gZmxvdy50eXBlID09PSBcIm0ubG9naW4uc3NvXCIgfHwgZmxvdy50eXBlID09PSBcIm0ubG9naW4uY2FzXCIpO1xuICAgICAgICAvLyBJZiBoYXMgbm8gcGFzc3dvcmQgZmxvdyBidXQgYW4gU1NPIGZsb3cgZ3Vlc3MgdGhhdCB0aGUgdXNlciB3YW50cyB0byByZWdpc3RlciB3aXRoIFNTTy5cbiAgICAgICAgLy8gVE9ETzogaW5zdGVhZCBoaWRlIHRoZSBSZWdpc3RlciBidXR0b24gaWYgcmVnaXN0cmF0aW9uIGlzIGRpc2FibGVkIGJ5IGNoZWNraW5nIHdpdGggdGhlIHNlcnZlcixcbiAgICAgICAgLy8gaGFzIG5vIHNwZWNpZmljIGVyckNvZGUgY3VycmVudGx5IGFuZCB1c2VzIE1fRk9SQklEREVOLlxuICAgICAgICBpZiAoc3NvRmxvdyAmJiAhaGFzUGFzc3dvcmRGbG93KSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBzc29LaW5kID0gc3NvRmxvdy50eXBlID09PSAnbS5sb2dpbi5zc28nID8gJ3NzbycgOiAnY2FzJztcbiAgICAgICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLnN0YXJ0U2luZ2xlU2lnbk9uKHRoaXMubG9naW5Mb2dpYy5jcmVhdGVUZW1wb3JhcnlDbGllbnQoKSwgc3NvS2luZCxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZyYWdtZW50QWZ0ZXJMb2dpbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBEb24ndCBpbnRlcmNlcHQgLSBqdXN0IGdvIHRocm91Z2ggdG8gdGhlIHJlZ2lzdGVyIHBhZ2VcbiAgICAgICAgICAgIHRoaXMub25SZWdpc3RlckNsaWNrKGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIGluaXRMb2dpbkxvZ2ljKHtoc1VybCwgaXNVcmx9OiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWcpIHtcbiAgICAgICAgbGV0IGlzRGVmYXVsdFNlcnZlciA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNEZWZhdWx0XG4gICAgICAgICAgICAmJiBoc1VybCA9PT0gdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmxcbiAgICAgICAgICAgICYmIGlzVXJsID09PSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5pc1VybCkge1xuICAgICAgICAgICAgaXNEZWZhdWx0U2VydmVyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZhbGxiYWNrSHNVcmwgPSBpc0RlZmF1bHRTZXJ2ZXIgPyB0aGlzLnByb3BzLmZhbGxiYWNrSHNVcmwgOiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGxvZ2luTG9naWMgPSBuZXcgTG9naW4oaHNVcmwsIGlzVXJsLCBmYWxsYmFja0hzVXJsLCB7XG4gICAgICAgICAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU6IHRoaXMucHJvcHMuZGVmYXVsdERldmljZURpc3BsYXlOYW1lLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5sb2dpbkxvZ2ljID0gbG9naW5Mb2dpYztcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBsb2dpbkluY29ycmVjdDogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERvIGEgcXVpY2sgbGl2ZWxpbmVzcyBjaGVjayBvbiB0aGUgVVJMc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyB3YXJuaW5nIH0gPVxuICAgICAgICAgICAgICAgIGF3YWl0IEF1dG9EaXNjb3ZlcnlVdGlscy52YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzKGhzVXJsLCBpc1VybCk7XG4gICAgICAgICAgICBpZiAod2FybmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAuLi5BdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3Iod2FybmluZyksXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogXCJcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogXCJcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgLi4uQXV0b0Rpc2NvdmVyeVV0aWxzLmF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yKGUpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dpbkxvZ2ljLmdldEZsb3dzKCkudGhlbigoZmxvd3MpID0+IHtcbiAgICAgICAgICAgIC8vIGxvb2sgZm9yIGEgZmxvdyB3aGVyZSB3ZSB1bmRlcnN0YW5kIGFsbCBvZiB0aGUgc3RlcHMuXG4gICAgICAgICAgICBjb25zdCBzdXBwb3J0ZWRGbG93cyA9IGZsb3dzLmZpbHRlcih0aGlzLmlzU3VwcG9ydGVkRmxvdyk7XG5cbiAgICAgICAgICAgIGlmIChzdXBwb3J0ZWRGbG93cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGZsb3dzOiBzdXBwb3J0ZWRGbG93cyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdlIGdvdCB0byB0aGUgZW5kIG9mIHRoZSBsaXN0IHdpdGhvdXQgZmluZGluZyBhIHN1aXRhYmxlIGZsb3cuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IF90KFwiVGhpcyBob21lc2VydmVyIGRvZXNuJ3Qgb2ZmZXIgYW55IGxvZ2luIGZsb3dzIHdoaWNoIGFyZSBzdXBwb3J0ZWQgYnkgdGhpcyBjbGllbnQuXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogdGhpcy5lcnJvclRleHRGcm9tRXJyb3IoZXJyKSxcbiAgICAgICAgICAgICAgICBsb2dpbkluY29ycmVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2FuVHJ5TG9naW46IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1N1cHBvcnRlZEZsb3cgPSAoZmxvdzogTG9naW5GbG93KTogYm9vbGVhbiA9PiB7XG4gICAgICAgIC8vIHRlY2huaWNhbGx5IHRoZSBmbG93IGNhbiBoYXZlIG11bHRpcGxlIHN0ZXBzLCBidXQgbm8gb25lIGRvZXMgdGhpc1xuICAgICAgICAvLyBmb3IgbG9naW4gYW5kIGxvZ2luTG9naWMgZG9lc24ndCBzdXBwb3J0IGl0IHNvIHdlIGNhbiBpZ25vcmUgaXQuXG4gICAgICAgIGlmICghdGhpcy5zdGVwUmVuZGVyZXJNYXBbZmxvdy50eXBlXSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTa2lwcGluZyBmbG93XCIsIGZsb3csIFwiZHVlIHRvIHVuc3VwcG9ydGVkIGxvZ2luIHR5cGVcIiwgZmxvdy50eXBlKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBlcnJvclRleHRGcm9tRXJyb3IoZXJyOiBNYXRyaXhFcnJvcik6IFJlYWN0Tm9kZSB7XG4gICAgICAgIGxldCBlcnJDb2RlID0gZXJyLmVycmNvZGU7XG4gICAgICAgIGlmICghZXJyQ29kZSAmJiBlcnIuaHR0cFN0YXR1cykge1xuICAgICAgICAgICAgZXJyQ29kZSA9IFwiSFRUUCBcIiArIGVyci5odHRwU3RhdHVzO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yVGV4dDogUmVhY3ROb2RlID0gX3QoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGNvbW11bmljYXRpbmcgd2l0aCB0aGUgaG9tZXNlcnZlciwgXCIgK1xuICAgICAgICAgICAgXCJwbGVhc2UgdHJ5IGFnYWluIGxhdGVyLlwiKSArIChlcnJDb2RlID8gXCIgKFwiICsgZXJyQ29kZSArIFwiKVwiIDogXCJcIik7XG5cbiAgICAgICAgaWYgKGVyci5jb3JzID09PSAncmVqZWN0ZWQnKSB7XG4gICAgICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyAmJlxuICAgICAgICAgICAgICAgICh0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybC5zdGFydHNXaXRoKFwiaHR0cDpcIikgfHxcbiAgICAgICAgICAgICAgICAgIXRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsLnN0YXJ0c1dpdGgoXCJodHRwXCIpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDYW4ndCBjb25uZWN0IHRvIGhvbWVzZXJ2ZXIgdmlhIEhUVFAgd2hlbiBhbiBIVFRQUyBVUkwgaXMgaW4geW91ciBicm93c2VyIGJhci4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJFaXRoZXIgdXNlIEhUVFBTIG9yIDxhPmVuYWJsZSB1bnNhZmUgc2NyaXB0czwvYT4uXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGEgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9XCJodHRwczovL3d3dy5nb29nbGUuY29tL3NlYXJjaD8mcT1lbmFibGUlMjB1bnNhZmUlMjBzY3JpcHRzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2FuJ3QgY29ubmVjdCB0byBob21lc2VydmVyIC0gcGxlYXNlIGNoZWNrIHlvdXIgY29ubmVjdGl2aXR5LCBlbnN1cmUgeW91ciBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjxhPmhvbWVzZXJ2ZXIncyBTU0wgY2VydGlmaWNhdGU8L2E+IGlzIHRydXN0ZWQsIGFuZCB0aGF0IGEgYnJvd3NlciBleHRlbnNpb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJpcyBub3QgYmxvY2tpbmcgcmVxdWVzdHMuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIGhyZWY9e3RoaXMucHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVycm9yVGV4dDtcbiAgICB9XG5cbiAgICByZW5kZXJMb2dpbkNvbXBvbmVudEZvckZsb3dzKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmxvd3MpIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIHRoaXMgaXMgdGhlIGlkZWFsIG9yZGVyIHdlIHdhbnQgdG8gc2hvdyB0aGUgZmxvd3MgaW5cbiAgICAgICAgY29uc3Qgb3JkZXIgPSBbXG4gICAgICAgICAgICBcIm0ubG9naW4ucGFzc3dvcmRcIixcbiAgICAgICAgICAgIFwibS5sb2dpbi5zc29cIixcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCBmbG93cyA9IG9yZGVyLm1hcCh0eXBlID0+IHRoaXMuc3RhdGUuZmxvd3MuZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gdHlwZSkpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIHsgZmxvd3MubWFwKGZsb3cgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0ZXBSZW5kZXJlciA9IHRoaXMuc3RlcFJlbmRlcmVyTWFwW2Zsb3cudHlwZV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudCBrZXk9e2Zsb3cudHlwZX0+eyBzdGVwUmVuZGVyZXIoKSB9PC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIH0pIH1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclBhc3N3b3JkU3RlcCA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxQYXNzd29yZExvZ2luXG4gICAgICAgICAgICAgICAgb25TdWJtaXQ9e3RoaXMub25QYXNzd29yZExvZ2lufVxuICAgICAgICAgICAgICAgIHVzZXJuYW1lPXt0aGlzLnN0YXRlLnVzZXJuYW1lfVxuICAgICAgICAgICAgICAgIHBob25lQ291bnRyeT17dGhpcy5zdGF0ZS5waG9uZUNvdW50cnl9XG4gICAgICAgICAgICAgICAgcGhvbmVOdW1iZXI9e3RoaXMuc3RhdGUucGhvbmVOdW1iZXJ9XG4gICAgICAgICAgICAgICAgb25Vc2VybmFtZUNoYW5nZWQ9e3RoaXMub25Vc2VybmFtZUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgb25Vc2VybmFtZUJsdXI9e3RoaXMub25Vc2VybmFtZUJsdXJ9XG4gICAgICAgICAgICAgICAgb25QaG9uZUNvdW50cnlDaGFuZ2VkPXt0aGlzLm9uUGhvbmVDb3VudHJ5Q2hhbmdlZH1cbiAgICAgICAgICAgICAgICBvblBob25lTnVtYmVyQ2hhbmdlZD17dGhpcy5vblBob25lTnVtYmVyQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICBvbkZvcmdvdFBhc3N3b3JkQ2xpY2s9e3RoaXMucHJvcHMub25Gb3Jnb3RQYXNzd29yZENsaWNrfVxuICAgICAgICAgICAgICAgIGxvZ2luSW5jb3JyZWN0PXt0aGlzLnN0YXRlLmxvZ2luSW5jb3JyZWN0fVxuICAgICAgICAgICAgICAgIHNlcnZlckNvbmZpZz17dGhpcy5wcm9wcy5zZXJ2ZXJDb25maWd9XG4gICAgICAgICAgICAgICAgZGlzYWJsZVN1Ym1pdD17dGhpcy5pc0J1c3koKX1cbiAgICAgICAgICAgICAgICBidXN5PXt0aGlzLnByb3BzLmlzU3luY2luZyB8fCB0aGlzLnN0YXRlLmJ1c3lMb2dnaW5nSW59XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlclNzb1N0ZXAgPSBsb2dpblR5cGUgPT4ge1xuICAgICAgICBjb25zdCBmbG93ID0gdGhpcy5zdGF0ZS5mbG93cy5maW5kKGZsb3cgPT4gZmxvdy50eXBlID09PSBcIm0ubG9naW4uXCIgKyBsb2dpblR5cGUpIGFzIElTU09GbG93O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8U1NPQnV0dG9uc1xuICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudD17dGhpcy5sb2dpbkxvZ2ljLmNyZWF0ZVRlbXBvcmFyeUNsaWVudCgpfVxuICAgICAgICAgICAgICAgIGZsb3c9e2Zsb3d9XG4gICAgICAgICAgICAgICAgbG9naW5UeXBlPXtsb2dpblR5cGV9XG4gICAgICAgICAgICAgICAgZnJhZ21lbnRBZnRlckxvZ2luPXt0aGlzLnByb3BzLmZyYWdtZW50QWZ0ZXJMb2dpbn1cbiAgICAgICAgICAgICAgICBwcmltYXJ5PXshdGhpcy5zdGF0ZS5mbG93cy5maW5kKGZsb3cgPT4gZmxvdy50eXBlID09PSBcIm0ubG9naW4ucGFzc3dvcmRcIil9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEF1dGhIZWFkZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXV0aC5BdXRoSGVhZGVyXCIpO1xuICAgICAgICBjb25zdCBBdXRoQm9keSA9IHNkay5nZXRDb21wb25lbnQoXCJhdXRoLkF1dGhCb2R5XCIpO1xuICAgICAgICBjb25zdCBsb2FkZXIgPSB0aGlzLmlzQnVzeSgpICYmICF0aGlzLnN0YXRlLmJ1c3lMb2dnaW5nSW4gP1xuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9sb2FkZXJcIj48U3Bpbm5lciAvPjwvZGl2PiA6IG51bGw7XG5cbiAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gdGhpcy5zdGF0ZS5lcnJvclRleHQ7XG5cbiAgICAgICAgbGV0IGVycm9yVGV4dFNlY3Rpb247XG4gICAgICAgIGlmIChlcnJvclRleHQpIHtcbiAgICAgICAgICAgIGVycm9yVGV4dFNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9lcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICB7IGVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlcnZlckRlYWRTZWN0aW9uO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VydmVySXNBbGl2ZSkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIFwibXhfTG9naW5fZXJyb3JcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0xvZ2luX3NlcnZlckVycm9yXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJteF9Mb2dpbl9zZXJ2ZXJFcnJvck5vbkZhdGFsXCI6ICF0aGlzLnN0YXRlLnNlcnZlckVycm9ySXNGYXRhbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VydmVyRGVhZFNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5zZXJ2ZXJEZWFkRXJyb3J9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZvb3RlcjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNTeW5jaW5nIHx8IHRoaXMuc3RhdGUuYnVzeUxvZ2dpbmdJbikge1xuICAgICAgICAgICAgZm9vdGVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9wYWRkZWRGb290ZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X3BhZGRlZEZvb3Rlcl90aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8SW5saW5lU3Bpbm5lciB3PXsyMH0gaD17MjB9IC8+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5pc1N5bmNpbmcgPyBfdChcIlN5bmNpbmcuLi5cIikgOiBfdChcIlNpZ25pbmcgSW4uLi5cIikgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5pc1N5bmNpbmcgJiYgPGRpdiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9wYWRkZWRGb290ZXJfc3VidGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiSWYgeW91J3ZlIGpvaW5lZCBsb3RzIG9mIHJvb21zLCB0aGlzIG1pZ2h0IHRha2UgYSB3aGlsZVwiKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj4gfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlJlZ2lzdHJhdGlvbikpIHtcbiAgICAgICAgICAgIGZvb3RlciA9IChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9jaGFuZ2VGbG93XCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIk5ldz8gPGE+Q3JlYXRlIGFjY291bnQ8L2E+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPGEgb25DbGljaz17dGhpcy5vblRyeVJlZ2lzdGVyQ2xpY2t9IGhyZWY9XCIjXCI+eyBzdWIgfTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEF1dGhQYWdlPlxuICAgICAgICAgICAgICAgIDxBdXRoSGVhZGVyIGRpc2FibGVMYW5ndWFnZVNlbGVjdG9yPXt0aGlzLnByb3BzLmlzU3luY2luZyB8fCB0aGlzLnN0YXRlLmJ1c3lMb2dnaW5nSW59IC8+XG4gICAgICAgICAgICAgICAgPEF1dGhCb2R5PlxuICAgICAgICAgICAgICAgICAgICA8aDI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoJ1NpZ24gaW4nKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtsb2FkZXJ9XG4gICAgICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgICAgIHsgZXJyb3JUZXh0U2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgIHsgc2VydmVyRGVhZFNlY3Rpb24gfVxuICAgICAgICAgICAgICAgICAgICA8U2VydmVyUGlja2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJDb25maWc9e3RoaXMucHJvcHMuc2VydmVyQ29uZmlnfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZXJ2ZXJDb25maWdDaGFuZ2U9e3RoaXMucHJvcHMub25TZXJ2ZXJDb25maWdDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJMb2dpbkNvbXBvbmVudEZvckZsb3dzKCkgfVxuICAgICAgICAgICAgICAgICAgICB7IGZvb3RlciB9XG4gICAgICAgICAgICAgICAgPC9BdXRoQm9keT5cbiAgICAgICAgICAgIDwvQXV0aFBhZ2U+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
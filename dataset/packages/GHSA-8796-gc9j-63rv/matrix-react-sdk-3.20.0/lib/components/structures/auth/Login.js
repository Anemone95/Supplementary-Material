"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

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
let LoginComponent = (
/*
 * A wire component which glues together login UI components and Login logic
 */
_dec = (0, _replaceableComponent.replaceableComponent)("structures.auth.LoginComponent"), _dec(_class = (_temp = class LoginComponent extends _react.default.PureComponent
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
            'hs_blocked': (0, _languageHandler._td)("This homeserver has been blocked by it's administrator."),
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

}, _temp)) || _class);
exports.default = LoginComponent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvYXV0aC9Mb2dpbi50c3giXSwibmFtZXMiOlsiTG9naW5Db21wb25lbnQiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3RhdGUiLCJidXN5IiwidXNlcm5hbWUiLCJwaG9uZUNvdW50cnkiLCJwaG9uZU51bWJlciIsInBhc3N3b3JkIiwic2VydmVySXNBbGl2ZSIsInNldFN0YXRlIiwiYWxpdmVBZ2FpbiIsIkF1dG9EaXNjb3ZlcnlVdGlscyIsInZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMiLCJzZXJ2ZXJDb25maWciLCJoc1VybCIsImlzVXJsIiwiZXJyb3JUZXh0IiwiZSIsImNvbXBvbmVudFN0YXRlIiwiYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IiLCJidXN5TG9nZ2luZ0luIiwic2VydmVyRXJyb3JJc0ZhdGFsIiwibG9naW5JbmNvcnJlY3QiLCJsb2dpbkxvZ2ljIiwibG9naW5WaWFQYXNzd29yZCIsInRoZW4iLCJkYXRhIiwib25Mb2dnZWRJbiIsImVycm9yIiwidW5tb3VudGVkIiwidXNpbmdFbWFpbCIsImluZGV4T2YiLCJodHRwU3RhdHVzIiwiZXJyY29kZSIsImVycm9yVG9wIiwibGltaXRfdHlwZSIsImFkbWluX2NvbnRhY3QiLCJlcnJvckRldGFpbCIsIlNka0NvbmZpZyIsImdldCIsImhzIiwiaHNOYW1lIiwiZXJyb3JUZXh0RnJvbUVycm9yIiwiZG9XZWxsa25vd25Mb29rdXAiLCJjYW5UcnlMb2dpbiIsInNlcnZlck5hbWUiLCJzcGxpdCIsInNsaWNlIiwiam9pbiIsInJlc3VsdCIsInZhbGlkYXRlU2VydmVyTmFtZSIsIm9uU2VydmVyQ29uZmlnQ2hhbmdlIiwiY29uc29sZSIsIm1lc3NhZ2UiLCJ0cmFuc2xhdGVkTWVzc2FnZSIsImRpc2NvdmVyeVN0YXRlIiwiaXNMaXZlbGluZXNzRXJyb3IiLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwib25SZWdpc3RlckNsaWNrIiwiaGFzUGFzc3dvcmRGbG93IiwiZmxvd3MiLCJmaW5kIiwiZmxvdyIsInR5cGUiLCJzc29GbG93Iiwic3NvS2luZCIsIlBsYXRmb3JtUGVnIiwic3RhcnRTaW5nbGVTaWduT24iLCJjcmVhdGVUZW1wb3JhcnlDbGllbnQiLCJmcmFnbWVudEFmdGVyTG9naW4iLCJzdGVwUmVuZGVyZXJNYXAiLCJsb2ciLCJvblBhc3N3b3JkTG9naW4iLCJvblVzZXJuYW1lQ2hhbmdlZCIsIm9uVXNlcm5hbWVCbHVyIiwib25QaG9uZUNvdW50cnlDaGFuZ2VkIiwib25QaG9uZU51bWJlckNoYW5nZWQiLCJvbkZvcmdvdFBhc3N3b3JkQ2xpY2siLCJpc0J1c3kiLCJpc1N5bmNpbmciLCJsb2dpblR5cGUiLCJzZXJ2ZXJEZWFkRXJyb3IiLCJyZW5kZXJQYXNzd29yZFN0ZXAiLCJyZW5kZXJTc29TdGVwIiwiQ291bnRseUFuYWx5dGljcyIsImluc3RhbmNlIiwidHJhY2siLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50IiwiaW5pdExvZ2luTG9naWMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV3UHJvcHMiLCJpc0RlZmF1bHRTZXJ2ZXIiLCJpc0RlZmF1bHQiLCJmYWxsYmFja0hzVXJsIiwiTG9naW4iLCJkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUiLCJ3YXJuaW5nIiwiZ2V0Rmxvd3MiLCJzdXBwb3J0ZWRGbG93cyIsImZpbHRlciIsImlzU3VwcG9ydGVkRmxvdyIsImxlbmd0aCIsImVyciIsImZpbmFsbHkiLCJlcnJDb2RlIiwiY29ycyIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJzdGFydHNXaXRoIiwic3ViIiwicmVuZGVyTG9naW5Db21wb25lbnRGb3JGbG93cyIsIm9yZGVyIiwibWFwIiwiQm9vbGVhbiIsInN0ZXBSZW5kZXJlciIsInJlbmRlciIsIkF1dGhIZWFkZXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJBdXRoQm9keSIsImxvYWRlciIsImVycm9yVGV4dFNlY3Rpb24iLCJzZXJ2ZXJEZWFkU2VjdGlvbiIsImNsYXNzZXMiLCJmb290ZXIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJVSUZlYXR1cmUiLCJSZWdpc3RyYXRpb24iLCJhIiwib25UcnlSZWdpc3RlckNsaWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVBO0FBQ0E7QUFDQSwwQkFBSSx1Q0FBSjtBQUNBLDBCQUFJLHVEQUFKO0FBQ0EsMEJBQUksbUNBQUo7QUFDQSwwQkFBSSxnRUFBSjtBQUNBLDBCQUFJLDRDQUFKO0FBQ0EsMEJBQUksd0NBQUo7QUFDQSwwQkFBSSxtRUFBSjtBQUNBLDBCQUFJLGlCQUFKO0lBdURxQkEsYztBQUpyQjtBQUNBO0FBQ0E7T0FDQyxnREFBcUIsZ0NBQXJCLEMseUJBQUQsTUFDcUJBLGNBRHJCLFNBQzRDQyxlQUFNQztBQURsRDtBQUNnRjtBQU01RUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUscURBTEMsS0FLRDtBQUFBO0FBQUE7QUFBQSxrREFzRFYsTUFBTSxLQUFLQyxLQUFMLENBQVdDLElBQVgsSUFBbUIsS0FBS0YsS0FBTCxDQUFXRSxJQXREMUI7QUFBQSwyREF3REQsT0FBT0MsUUFBUCxFQUFpQkMsWUFBakIsRUFBK0JDLFdBQS9CLEVBQTRDQyxRQUE1QyxLQUF5RDtBQUN2RSxVQUFJLENBQUMsS0FBS0wsS0FBTCxDQUFXTSxhQUFoQixFQUErQjtBQUMzQixhQUFLQyxRQUFMLENBQWM7QUFBQ04sVUFBQUEsSUFBSSxFQUFFO0FBQVAsU0FBZCxFQUQyQixD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QUFLaEgsS0FBTCxDQUFXZ0YsU0FBWCxJQUF3QixLQUFLL0UsS0FBTCxDQUFXa0I7QUFBeEUsTUFESixlQUVJLDZCQUFDLFFBQUQscUJBQ0kseUNBQ0sseUJBQUcsU0FBSCxDQURMLEVBRUt3RyxNQUZMLENBREosRUFLTUMsZ0JBTE4sRUFNTUMsaUJBTk4sZUFPSSw2QkFBQyxxQkFBRDtBQUNJLE1BQUEsWUFBWSxFQUFFLEtBQUs3SCxLQUFMLENBQVdZLFlBRDdCO0FBRUksTUFBQSxvQkFBb0IsRUFBRSxLQUFLWixLQUFMLENBQVdrRDtBQUZyQyxNQVBKLEVBV00sS0FBSytELDRCQUFMLEVBWE4sRUFZTWMsTUFaTixDQUZKLENBREo7QUFtQkg7O0FBN2YyRSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtSZWFjdE5vZGV9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7TWF0cml4RXJyb3J9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9odHRwLWFwaVwiO1xuXG5pbXBvcnQge190LCBfdGR9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IExvZ2luLCB7SVNTT0Zsb3csIExvZ2luRmxvd30gZnJvbSAnLi4vLi4vLi4vTG9naW4nO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IHsgbWVzc2FnZUZvclJlc291cmNlTGltaXRFcnJvciB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0Vycm9yVXRpbHMnO1xuaW1wb3J0IEF1dG9EaXNjb3ZlcnlVdGlscywge1ZhbGlkYXRlZFNlcnZlckNvbmZpZ30gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0F1dG9EaXNjb3ZlcnlVdGlsc1wiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCBBdXRoUGFnZSBmcm9tIFwiLi4vLi4vdmlld3MvYXV0aC9BdXRoUGFnZVwiO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gJy4uLy4uLy4uL1BsYXRmb3JtUGVnJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge1VJRmVhdHVyZX0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4uLy4uLy4uL0NvdW50bHlBbmFseXRpY3NcIjtcbmltcG9ydCB7SU1hdHJpeENsaWVudENyZWRzfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgUGFzc3dvcmRMb2dpbiBmcm9tIFwiLi4vLi4vdmlld3MvYXV0aC9QYXNzd29yZExvZ2luXCI7XG5pbXBvcnQgSW5saW5lU3Bpbm5lciBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvSW5saW5lU3Bpbm5lclwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCBTU09CdXR0b25zIGZyb20gXCIuLi8uLi92aWV3cy9lbGVtZW50cy9TU09CdXR0b25zXCI7XG5pbXBvcnQgU2VydmVyUGlja2VyIGZyb20gXCIuLi8uLi92aWV3cy9lbGVtZW50cy9TZXJ2ZXJQaWNrZXJcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG4vLyBUaGVzZSBhcmUgdXNlZCBpbiBzZXZlcmFsIHBsYWNlcywgYW5kIGNvbWUgZnJvbSB0aGUganMtc2RrJ3MgYXV0b2Rpc2NvdmVyeVxuLy8gc3R1ZmYuIFdlIGRlZmluZSB0aGVtIGhlcmUgc28gdGhhdCB0aGV5J2xsIGJlIHBpY2tlZCB1cCBieSBpMThuLlxuX3RkKFwiSW52YWxpZCBob21lc2VydmVyIGRpc2NvdmVyeSByZXNwb25zZVwiKTtcbl90ZChcIkZhaWxlZCB0byBnZXQgYXV0b2Rpc2NvdmVyeSBjb25maWd1cmF0aW9uIGZyb20gc2VydmVyXCIpO1xuX3RkKFwiSW52YWxpZCBiYXNlX3VybCBmb3IgbS5ob21lc2VydmVyXCIpO1xuX3RkKFwiSG9tZXNlcnZlciBVUkwgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGEgdmFsaWQgTWF0cml4IGhvbWVzZXJ2ZXJcIik7XG5fdGQoXCJJbnZhbGlkIGlkZW50aXR5IHNlcnZlciBkaXNjb3ZlcnkgcmVzcG9uc2VcIik7XG5fdGQoXCJJbnZhbGlkIGJhc2VfdXJsIGZvciBtLmlkZW50aXR5X3NlcnZlclwiKTtcbl90ZChcIklkZW50aXR5IHNlcnZlciBVUkwgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGEgdmFsaWQgaWRlbnRpdHkgc2VydmVyXCIpO1xuX3RkKFwiR2VuZXJhbCBmYWlsdXJlXCIpO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBzZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcbiAgICAvLyBJZiB0cnVlLCB0aGUgY29tcG9uZW50IHdpbGwgY29uc2lkZXIgaXRzZWxmIGJ1c3kuXG4gICAgYnVzeT86IGJvb2xlYW47XG4gICAgaXNTeW5jaW5nPzogYm9vbGVhbjtcbiAgICAvLyBTZWNvbmRhcnkgSFMgd2hpY2ggd2UgdHJ5IHRvIGxvZyBpbnRvIGlmIHRoZSB1c2VyIGlzIHVzaW5nXG4gICAgLy8gdGhlIGRlZmF1bHQgSFMgYnV0IGxvZ2luIGZhaWxzLiBVc2VmdWwgZm9yIG1pZ3JhdGluZyB0byBhXG4gICAgLy8gZGlmZmVyZW50IGhvbWVzZXJ2ZXIgd2l0aG91dCBjb25mdXNpbmcgdXNlcnMuXG4gICAgZmFsbGJhY2tIc1VybD86IHN0cmluZztcbiAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU/OiBzdHJpbmc7XG4gICAgZnJhZ21lbnRBZnRlckxvZ2luPzogc3RyaW5nO1xuXG4gICAgLy8gQ2FsbGVkIHdoZW4gdGhlIHVzZXIgaGFzIGxvZ2dlZCBpbi4gUGFyYW1zOlxuICAgIC8vIC0gVGhlIG9iamVjdCByZXR1cm5lZCBieSB0aGUgbG9naW4gQVBJXG4gICAgLy8gLSBUaGUgdXNlcidzIHBhc3N3b3JkLCBpZiBhcHBsaWNhYmxlLCAobWF5IGJlIGNhY2hlZCBpbiBtZW1vcnkgZm9yIGFcbiAgICAvLyAgIHNob3J0IHRpbWUgc28gdGhlIHVzZXIgaXMgbm90IHJlcXVpcmVkIHRvIHJlLWVudGVyIHRoZWlyIHBhc3N3b3JkXG4gICAgLy8gICBmb3Igb3BlcmF0aW9ucyBsaWtlIHVwbG9hZGluZyBjcm9zcy1zaWduaW5nIGtleXMpLlxuICAgIG9uTG9nZ2VkSW4oZGF0YTogSU1hdHJpeENsaWVudENyZWRzLCBwYXNzd29yZDogc3RyaW5nKTogdm9pZDtcblxuICAgIC8vIGxvZ2luIHNob3VsZG4ndCBrbm93IG9yIGNhcmUgaG93IHJlZ2lzdHJhdGlvbiwgcGFzc3dvcmQgcmVjb3ZlcnksIGV0YyBpcyBkb25lLlxuICAgIG9uUmVnaXN0ZXJDbGljaygpOiB2b2lkO1xuICAgIG9uRm9yZ290UGFzc3dvcmRDbGljaz8oKTogdm9pZDtcbiAgICBvblNlcnZlckNvbmZpZ0NoYW5nZShjb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZyk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGJ1c3k6IGJvb2xlYW47XG4gICAgYnVzeUxvZ2dpbmdJbj86IGJvb2xlYW47XG4gICAgZXJyb3JUZXh0PzogUmVhY3ROb2RlO1xuICAgIGxvZ2luSW5jb3JyZWN0OiBib29sZWFuO1xuICAgIC8vIGNhbiB3ZSBhdHRlbXB0IHRvIGxvZyBpbiBvciBhcmUgdGhlcmUgdmFsaWRhdGlvbiBlcnJvcnM/XG4gICAgY2FuVHJ5TG9naW46IGJvb2xlYW47XG5cbiAgICBmbG93cz86IExvZ2luRmxvd1tdO1xuXG4gICAgLy8gdXNlZCBmb3IgcHJlc2VydmluZyBmb3JtIHZhbHVlcyB3aGVuIGNoYW5naW5nIGhvbWVzZXJ2ZXJcbiAgICB1c2VybmFtZTogc3RyaW5nO1xuICAgIHBob25lQ291bnRyeT86IHN0cmluZztcbiAgICBwaG9uZU51bWJlcjogc3RyaW5nO1xuXG4gICAgLy8gV2UgcGVyZm9ybSBsaXZlbGluZXNzIGNoZWNrcyBsYXRlciwgYnV0IGZvciBub3cgc3VwcHJlc3MgdGhlIGVycm9ycy5cbiAgICAvLyBXZSBhbHNvIHRyYWNrIHRoZSBzZXJ2ZXIgZGVhZCBlcnJvcnMgaW5kZXBlbmRlbnRseSBvZiB0aGUgcmVndWxhciBlcnJvcnMgc29cbiAgICAvLyB0aGF0IHdlIGNhbiByZW5kZXIgaXQgZGlmZmVyZW50bHksIGFuZCBvdmVycmlkZSBhbnkgb3RoZXIgZXJyb3IgdGhlIHVzZXIgbWF5XG4gICAgLy8gYmUgc2VlaW5nLlxuICAgIHNlcnZlcklzQWxpdmU6IGJvb2xlYW47XG4gICAgc2VydmVyRXJyb3JJc0ZhdGFsOiBib29sZWFuO1xuICAgIHNlcnZlckRlYWRFcnJvcj86IFJlYWN0Tm9kZTtcbn1cblxuLypcbiAqIEEgd2lyZSBjb21wb25lbnQgd2hpY2ggZ2x1ZXMgdG9nZXRoZXIgbG9naW4gVUkgY29tcG9uZW50cyBhbmQgTG9naW4gbG9naWNcbiAqL1xuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwic3RydWN0dXJlcy5hdXRoLkxvZ2luQ29tcG9uZW50XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dpbkNvbXBvbmVudCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHVubW91bnRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgbG9naW5Mb2dpYzogTG9naW47XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZXBSZW5kZXJlck1hcDogUmVjb3JkPHN0cmluZywgKCkgPT4gUmVhY3ROb2RlPjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBidXN5TG9nZ2luZ0luOiBudWxsLFxuICAgICAgICAgICAgZXJyb3JUZXh0OiBudWxsLFxuICAgICAgICAgICAgbG9naW5JbmNvcnJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgY2FuVHJ5TG9naW46IHRydWUsXG5cbiAgICAgICAgICAgIGZsb3dzOiBudWxsLFxuXG4gICAgICAgICAgICB1c2VybmFtZTogXCJcIixcbiAgICAgICAgICAgIHBob25lQ291bnRyeTogbnVsbCxcbiAgICAgICAgICAgIHBob25lTnVtYmVyOiBcIlwiLFxuXG4gICAgICAgICAgICBzZXJ2ZXJJc0FsaXZlOiB0cnVlLFxuICAgICAgICAgICAgc2VydmVyRXJyb3JJc0ZhdGFsOiBmYWxzZSxcbiAgICAgICAgICAgIHNlcnZlckRlYWRFcnJvcjogXCJcIixcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBtYXAgZnJvbSBsb2dpbiBzdGVwIHR5cGUgdG8gYSBmdW5jdGlvbiB3aGljaCB3aWxsIHJlbmRlciBhIGNvbnRyb2xcbiAgICAgICAgLy8gbGV0dGluZyB5b3UgZG8gdGhhdCBsb2dpbiB0eXBlXG4gICAgICAgIHRoaXMuc3RlcFJlbmRlcmVyTWFwID0ge1xuICAgICAgICAgICAgJ20ubG9naW4ucGFzc3dvcmQnOiB0aGlzLnJlbmRlclBhc3N3b3JkU3RlcCxcblxuICAgICAgICAgICAgLy8gQ0FTIGFuZCBTU08gYXJlIHRoZSBzYW1lIHRoaW5nLCBtb2R1bG8gdGhlIHVybCB3ZSBsaW5rIHRvXG4gICAgICAgICAgICAnbS5sb2dpbi5jYXMnOiAoKSA9PiB0aGlzLnJlbmRlclNzb1N0ZXAoXCJjYXNcIiksXG4gICAgICAgICAgICAnbS5sb2dpbi5zc28nOiAoKSA9PiB0aGlzLnJlbmRlclNzb1N0ZXAoXCJzc29cIiksXG4gICAgICAgIH07XG5cbiAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFjayhcIm9uYm9hcmRpbmdfbG9naW5fYmVnaW5cIik7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2Ugd2l0aCBhcHByb3ByaWF0ZSBsaWZlY3ljbGUgZXZlbnRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgdGhpcy5pbml0TG9naW5Mb2dpYyh0aGlzLnByb3BzLnNlcnZlckNvbmZpZyk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICBpZiAobmV3UHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsID09PSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybCAmJlxuICAgICAgICAgICAgbmV3UHJvcHMuc2VydmVyQ29uZmlnLmlzVXJsID09PSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5pc1VybCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHdlIGVuZCB1cCBhY3R1YWxseSBsb2dnaW5nIGluIHRvIHRoZSByaWdodCBwbGFjZVxuICAgICAgICB0aGlzLmluaXRMb2dpbkxvZ2ljKG5ld1Byb3BzLnNlcnZlckNvbmZpZyk7XG4gICAgfVxuXG4gICAgaXNCdXN5ID0gKCkgPT4gdGhpcy5zdGF0ZS5idXN5IHx8IHRoaXMucHJvcHMuYnVzeTtcblxuICAgIG9uUGFzc3dvcmRMb2dpbiA9IGFzeW5jICh1c2VybmFtZSwgcGhvbmVDb3VudHJ5LCBwaG9uZU51bWJlciwgcGFzc3dvcmQpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNlcnZlcklzQWxpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgICAgIC8vIERvIGEgcXVpY2sgbGl2ZWxpbmVzcyBjaGVjayBvbiB0aGUgVVJMc1xuICAgICAgICAgICAgbGV0IGFsaXZlQWdhaW4gPSB0cnVlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBBdXRvRGlzY292ZXJ5VXRpbHMudmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyhcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmwsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmlzVXJsLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VydmVySXNBbGl2ZTogdHJ1ZSwgZXJyb3JUZXh0OiBcIlwifSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50U3RhdGUgPSBBdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBidXN5TG9nZ2luZ0luOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgLi4uY29tcG9uZW50U3RhdGUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYWxpdmVBZ2FpbiA9ICFjb21wb25lbnRTdGF0ZS5zZXJ2ZXJFcnJvcklzRmF0YWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFByZXZlbnQgcGVvcGxlIGZyb20gc3VibWl0dGluZyB0aGVpciBwYXNzd29yZCB3aGVuIHNvbWV0aGluZyBpc24ndCByaWdodC5cbiAgICAgICAgICAgIGlmICghYWxpdmVBZ2Fpbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogdHJ1ZSxcbiAgICAgICAgICAgIGJ1c3lMb2dnaW5nSW46IHRydWUsXG4gICAgICAgICAgICBlcnJvclRleHQ6IG51bGwsXG4gICAgICAgICAgICBsb2dpbkluY29ycmVjdDogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubG9naW5Mb2dpYy5sb2dpblZpYVBhc3N3b3JkKFxuICAgICAgICAgICAgdXNlcm5hbWUsIHBob25lQ291bnRyeSwgcGhvbmVOdW1iZXIsIHBhc3N3b3JkLFxuICAgICAgICApLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3NlcnZlcklzQWxpdmU6IHRydWV9KTsgLy8gaXQgbXVzdCBiZSwgd2UgbG9nZ2VkIGluLlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkxvZ2dlZEluKGRhdGEsIHBhc3N3b3JkKTtcbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZXJyb3JUZXh0O1xuXG4gICAgICAgICAgICAvLyBTb21lIGVycm9yIHN0cmluZ3Mgb25seSBhcHBseSBmb3IgbG9nZ2luZyBpblxuICAgICAgICAgICAgY29uc3QgdXNpbmdFbWFpbCA9IHVzZXJuYW1lLmluZGV4T2YoXCJAXCIpID4gMDtcbiAgICAgICAgICAgIGlmIChlcnJvci5odHRwU3RhdHVzID09PSA0MDAgJiYgdXNpbmdFbWFpbCkge1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KCdUaGlzIGhvbWVzZXJ2ZXIgZG9lcyBub3Qgc3VwcG9ydCBsb2dpbiB1c2luZyBlbWFpbCBhZGRyZXNzLicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5lcnJjb2RlID09PSAnTV9SRVNPVVJDRV9MSU1JVF9FWENFRURFRCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvclRvcCA9IG1lc3NhZ2VGb3JSZXNvdXJjZUxpbWl0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGVycm9yLmRhdGEubGltaXRfdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuZGF0YS5hZG1pbl9jb250YWN0LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbW9udGhseV9hY3RpdmVfdXNlcic6IF90ZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaG9tZXNlcnZlciBoYXMgaGl0IGl0cyBNb250aGx5IEFjdGl2ZSBVc2VyIGxpbWl0LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdoc19ibG9ja2VkJzogX3RkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyBob21lc2VydmVyIGhhcyBiZWVuIGJsb2NrZWQgYnkgaXQncyBhZG1pbmlzdHJhdG9yLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcnOiBfdGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGlzIGhvbWVzZXJ2ZXIgaGFzIGV4Y2VlZGVkIG9uZSBvZiBpdHMgcmVzb3VyY2UgbGltaXRzLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yRGV0YWlsID0gbWVzc2FnZUZvclJlc291cmNlTGltaXRFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuZGF0YS5saW1pdF90eXBlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvci5kYXRhLmFkbWluX2NvbnRhY3QsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICcnOiBfdGQoXCJQbGVhc2UgPGE+Y29udGFjdCB5b3VyIHNlcnZpY2UgYWRtaW5pc3RyYXRvcjwvYT4gdG8gY29udGludWUgdXNpbmcgdGhpcyBzZXJ2aWNlLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+e2Vycm9yVG9wfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9zbWFsbEVycm9yXCI+e2Vycm9yRGV0YWlsfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5odHRwU3RhdHVzID09PSA0MDEgfHwgZXJyb3IuaHR0cFN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLmVycmNvZGUgPT09ICdNX1VTRVJfREVBQ1RJVkFURUQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KCdUaGlzIGFjY291bnQgaGFzIGJlZW4gZGVhY3RpdmF0ZWQuJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChTZGtDb25maWcuZ2V0KClbJ2Rpc2FibGVfY3VzdG9tX3VybHMnXSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+eyBfdCgnSW5jb3JyZWN0IHVzZXJuYW1lIGFuZC9vciBwYXNzd29yZC4nKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9zbWFsbEVycm9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQbGVhc2Ugbm90ZSB5b3UgYXJlIGxvZ2dpbmcgaW50byB0aGUgJShocylzIHNlcnZlciwgbm90IG1hdHJpeC5vcmcuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtoczogdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaHNOYW1lfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KCdJbmNvcnJlY3QgdXNlcm5hbWUgYW5kL29yIHBhc3N3b3JkLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gb3RoZXIgZXJyb3JzLCBub3Qgc3BlY2lmaWMgdG8gZG9pbmcgYSBwYXNzd29yZCBsb2dpblxuICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IHRoaXMuZXJyb3JUZXh0RnJvbUVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgYnVzeUxvZ2dpbmdJbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBlcnJvclRleHQsXG4gICAgICAgICAgICAgICAgLy8gNDAxIHdvdWxkIGJlIHRoZSBzZW5zaWJsZSBzdGF0dXMgY29kZSBmb3IgJ2luY29ycmVjdCBwYXNzd29yZCdcbiAgICAgICAgICAgICAgICAvLyBidXQgdGhlIGxvZ2luIEFQSSBnaXZlcyBhIDQwMyBodHRwczovL21hdHJpeC5vcmcvamlyYS9icm93c2UvU1lOLTc0NFxuICAgICAgICAgICAgICAgIC8vIG1lbnRpb25zIHRoaXMgKGFsdGhvdWdoIHRoZSBidWcgaXMgZm9yIFVJIGF1dGggd2hpY2ggaXMgbm90IHRoaXMpXG4gICAgICAgICAgICAgICAgLy8gV2UgdHJlYXQgYm90aCBhcyBhbiBpbmNvcnJlY3QgcGFzc3dvcmRcbiAgICAgICAgICAgICAgICBsb2dpbkluY29ycmVjdDogZXJyb3IuaHR0cFN0YXR1cyA9PT0gNDAxIHx8IGVycm9yLmh0dHBTdGF0dXMgPT09IDQwMyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25Vc2VybmFtZUNoYW5nZWQgPSB1c2VybmFtZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1c2VybmFtZTogdXNlcm5hbWUgfSk7XG4gICAgfTtcblxuICAgIG9uVXNlcm5hbWVCbHVyID0gYXN5bmMgdXNlcm5hbWUgPT4ge1xuICAgICAgICBjb25zdCBkb1dlbGxrbm93bkxvb2t1cCA9IHVzZXJuYW1lWzBdID09PSBcIkBcIjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgICBidXN5OiBkb1dlbGxrbm93bkxvb2t1cCxcbiAgICAgICAgICAgIGVycm9yVGV4dDogbnVsbCxcbiAgICAgICAgICAgIGNhblRyeUxvZ2luOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGRvV2VsbGtub3duTG9va3VwKSB7XG4gICAgICAgICAgICBjb25zdCBzZXJ2ZXJOYW1lID0gdXNlcm5hbWUuc3BsaXQoJzonKS5zbGljZSgxKS5qb2luKCc6Jyk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEF1dG9EaXNjb3ZlcnlVdGlscy52YWxpZGF0ZVNlcnZlck5hbWUoc2VydmVyTmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblNlcnZlckNvbmZpZ0NoYW5nZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIC8vIFdlJ2QgbGlrZSB0byByZWx5IG9uIG5ldyBwcm9wcyBjb21pbmcgaW4gdmlhIGBvblNlcnZlckNvbmZpZ0NoYW5nZWBcbiAgICAgICAgICAgICAgICAvLyBzbyB0aGF0IHdlIGtub3cgdGhlIHNlcnZlcnMgaGF2ZSBkZWZpbml0ZWx5IHVwZGF0ZWQgYmVmb3JlIGNsZWFyaW5nXG4gICAgICAgICAgICAgICAgLy8gdGhlIGJ1c3kgc3RhdGUuIEluIHRoZSBjYXNlIG9mIGEgZnVsbCBNWElEIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAvLyBIUyBhcyBFbGVtZW50J3MgZGVmYXVsdCBIUyB0aG91Z2gsIHRoZXJlIG1heSBub3QgYmUgYW55IHNlcnZlciBjaGFuZ2UuXG4gICAgICAgICAgICAgICAgLy8gVG8gYXZvaWQgdGhpcyB0cmFwLCB3ZSBjbGVhciBidXN5IGhlcmUuIEZvciBjYXNlcyB3aGVyZSB0aGUgc2VydmVyXG4gICAgICAgICAgICAgICAgLy8gYWN0dWFsbHkgaGFzIGNoYW5nZWQsIGBpbml0TG9naW5Mb2dpY2Agd2lsbCBiZSBjYWxsZWQgYW5kIG1hbmFnZXNcbiAgICAgICAgICAgICAgICAvLyBidXN5IHN0YXRlIGZvciBpdHMgb3duIGxpdmVuZXNzIGNoZWNrLlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiUHJvYmxlbSBwYXJzaW5nIFVSTCBvciB1bmhhbmRsZWQgZXJyb3IgZG9pbmcgLndlbGwta25vd24gZGlzY292ZXJ5OlwiLCBlKTtcblxuICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gX3QoXCJGYWlsZWQgdG8gcGVyZm9ybSBob21lc2VydmVyIGRpc2NvdmVyeVwiKTtcbiAgICAgICAgICAgICAgICBpZiAoZS50cmFuc2xhdGVkTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gZS50cmFuc2xhdGVkTWVzc2FnZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZXJyb3JUZXh0OiBSZWFjdE5vZGUgPSBtZXNzYWdlO1xuICAgICAgICAgICAgICAgIGxldCBkaXNjb3ZlcnlTdGF0ZSA9IHt9O1xuICAgICAgICAgICAgICAgIGlmIChBdXRvRGlzY292ZXJ5VXRpbHMuaXNMaXZlbGluZXNzRXJyb3IoZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gdGhpcy5zdGF0ZS5lcnJvclRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGRpc2NvdmVyeVN0YXRlID0gQXV0b0Rpc2NvdmVyeVV0aWxzLmF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0LFxuICAgICAgICAgICAgICAgICAgICAuLi5kaXNjb3ZlcnlTdGF0ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvblBob25lQ291bnRyeUNoYW5nZWQgPSBwaG9uZUNvdW50cnkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGhvbmVDb3VudHJ5OiBwaG9uZUNvdW50cnkgfSk7XG4gICAgfTtcblxuICAgIG9uUGhvbmVOdW1iZXJDaGFuZ2VkID0gcGhvbmVOdW1iZXIgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBob25lTnVtYmVyOiBwaG9uZU51bWJlcixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uUmVnaXN0ZXJDbGljayA9IGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25SZWdpc3RlckNsaWNrKCk7XG4gICAgfTtcblxuICAgIG9uVHJ5UmVnaXN0ZXJDbGljayA9IGV2ID0+IHtcbiAgICAgICAgY29uc3QgaGFzUGFzc3dvcmRGbG93ID0gdGhpcy5zdGF0ZS5mbG93cz8uZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLnBhc3N3b3JkXCIpO1xuICAgICAgICBjb25zdCBzc29GbG93ID0gdGhpcy5zdGF0ZS5mbG93cz8uZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLnNzb1wiIHx8IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLmNhc1wiKTtcbiAgICAgICAgLy8gSWYgaGFzIG5vIHBhc3N3b3JkIGZsb3cgYnV0IGFuIFNTTyBmbG93IGd1ZXNzIHRoYXQgdGhlIHVzZXIgd2FudHMgdG8gcmVnaXN0ZXIgd2l0aCBTU08uXG4gICAgICAgIC8vIFRPRE86IGluc3RlYWQgaGlkZSB0aGUgUmVnaXN0ZXIgYnV0dG9uIGlmIHJlZ2lzdHJhdGlvbiBpcyBkaXNhYmxlZCBieSBjaGVja2luZyB3aXRoIHRoZSBzZXJ2ZXIsXG4gICAgICAgIC8vIGhhcyBubyBzcGVjaWZpYyBlcnJDb2RlIGN1cnJlbnRseSBhbmQgdXNlcyBNX0ZPUkJJRERFTi5cbiAgICAgICAgaWYgKHNzb0Zsb3cgJiYgIWhhc1Bhc3N3b3JkRmxvdykge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY29uc3Qgc3NvS2luZCA9IHNzb0Zsb3cudHlwZSA9PT0gJ20ubG9naW4uc3NvJyA/ICdzc28nIDogJ2Nhcyc7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zdGFydFNpbmdsZVNpZ25Pbih0aGlzLmxvZ2luTG9naWMuY3JlYXRlVGVtcG9yYXJ5Q2xpZW50KCksIHNzb0tpbmQsXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5mcmFnbWVudEFmdGVyTG9naW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRG9uJ3QgaW50ZXJjZXB0IC0ganVzdCBnbyB0aHJvdWdoIHRvIHRoZSByZWdpc3RlciBwYWdlXG4gICAgICAgICAgICB0aGlzLm9uUmVnaXN0ZXJDbGljayhldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyBpbml0TG9naW5Mb2dpYyh7aHNVcmwsIGlzVXJsfTogVmFsaWRhdGVkU2VydmVyQ29uZmlnKSB7XG4gICAgICAgIGxldCBpc0RlZmF1bHRTZXJ2ZXIgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmlzRGVmYXVsdFxuICAgICAgICAgICAgJiYgaHNVcmwgPT09IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsXG4gICAgICAgICAgICAmJiBpc1VybCA9PT0gdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwpIHtcbiAgICAgICAgICAgIGlzRGVmYXVsdFNlcnZlciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmYWxsYmFja0hzVXJsID0gaXNEZWZhdWx0U2VydmVyID8gdGhpcy5wcm9wcy5mYWxsYmFja0hzVXJsIDogbnVsbDtcblxuICAgICAgICBjb25zdCBsb2dpbkxvZ2ljID0gbmV3IExvZ2luKGhzVXJsLCBpc1VybCwgZmFsbGJhY2tIc1VybCwge1xuICAgICAgICAgICAgZGVmYXVsdERldmljZURpc3BsYXlOYW1lOiB0aGlzLnByb3BzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubG9naW5Mb2dpYyA9IGxvZ2luTG9naWM7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBidXN5OiB0cnVlLFxuICAgICAgICAgICAgbG9naW5JbmNvcnJlY3Q6IGZhbHNlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEbyBhIHF1aWNrIGxpdmVsaW5lc3MgY2hlY2sgb24gdGhlIFVSTHNcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgd2FybmluZyB9ID1cbiAgICAgICAgICAgICAgICBhd2FpdCBBdXRvRGlzY292ZXJ5VXRpbHMudmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyhoc1VybCwgaXNVcmwpO1xuICAgICAgICAgICAgaWYgKHdhcm5pbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgLi4uQXV0b0Rpc2NvdmVyeVV0aWxzLmF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yKHdhcm5pbmcpLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJJc0FsaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIC4uLkF1dG9EaXNjb3ZlcnlVdGlscy5hdXRoQ29tcG9uZW50U3RhdGVGb3JFcnJvcihlKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9naW5Mb2dpYy5nZXRGbG93cygpLnRoZW4oKGZsb3dzKSA9PiB7XG4gICAgICAgICAgICAvLyBsb29rIGZvciBhIGZsb3cgd2hlcmUgd2UgdW5kZXJzdGFuZCBhbGwgb2YgdGhlIHN0ZXBzLlxuICAgICAgICAgICAgY29uc3Qgc3VwcG9ydGVkRmxvd3MgPSBmbG93cy5maWx0ZXIodGhpcy5pc1N1cHBvcnRlZEZsb3cpO1xuXG4gICAgICAgICAgICBpZiAoc3VwcG9ydGVkRmxvd3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBmbG93czogc3VwcG9ydGVkRmxvd3MsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB3ZSBnb3QgdG8gdGhlIGVuZCBvZiB0aGUgbGlzdCB3aXRob3V0IGZpbmRpbmcgYSBzdWl0YWJsZSBmbG93LlxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIlRoaXMgaG9tZXNlcnZlciBkb2Vzbid0IG9mZmVyIGFueSBsb2dpbiBmbG93cyB3aGljaCBhcmUgc3VwcG9ydGVkIGJ5IHRoaXMgY2xpZW50LlwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMuZXJyb3JUZXh0RnJvbUVycm9yKGVyciksXG4gICAgICAgICAgICAgICAgbG9naW5JbmNvcnJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNhblRyeUxvZ2luOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNTdXBwb3J0ZWRGbG93ID0gKGZsb3c6IExvZ2luRmxvdyk6IGJvb2xlYW4gPT4ge1xuICAgICAgICAvLyB0ZWNobmljYWxseSB0aGUgZmxvdyBjYW4gaGF2ZSBtdWx0aXBsZSBzdGVwcywgYnV0IG5vIG9uZSBkb2VzIHRoaXNcbiAgICAgICAgLy8gZm9yIGxvZ2luIGFuZCBsb2dpbkxvZ2ljIGRvZXNuJ3Qgc3VwcG9ydCBpdCBzbyB3ZSBjYW4gaWdub3JlIGl0LlxuICAgICAgICBpZiAoIXRoaXMuc3RlcFJlbmRlcmVyTWFwW2Zsb3cudHlwZV0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2tpcHBpbmcgZmxvd1wiLCBmbG93LCBcImR1ZSB0byB1bnN1cHBvcnRlZCBsb2dpbiB0eXBlXCIsIGZsb3cudHlwZSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZXJyb3JUZXh0RnJvbUVycm9yKGVycjogTWF0cml4RXJyb3IpOiBSZWFjdE5vZGUge1xuICAgICAgICBsZXQgZXJyQ29kZSA9IGVyci5lcnJjb2RlO1xuICAgICAgICBpZiAoIWVyckNvZGUgJiYgZXJyLmh0dHBTdGF0dXMpIHtcbiAgICAgICAgICAgIGVyckNvZGUgPSBcIkhUVFAgXCIgKyBlcnIuaHR0cFN0YXR1cztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlcnJvclRleHQ6IFJlYWN0Tm9kZSA9IF90KFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBjb21tdW5pY2F0aW5nIHdpdGggdGhlIGhvbWVzZXJ2ZXIsIFwiICtcbiAgICAgICAgICAgIFwicGxlYXNlIHRyeSBhZ2FpbiBsYXRlci5cIikgKyAoZXJyQ29kZSA/IFwiIChcIiArIGVyckNvZGUgKyBcIilcIiA6IFwiXCIpO1xuXG4gICAgICAgIGlmIChlcnIuY29ycyA9PT0gJ3JlamVjdGVkJykge1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHBzOicgJiZcbiAgICAgICAgICAgICAgICAodGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmwuc3RhcnRzV2l0aChcImh0dHA6XCIpIHx8XG4gICAgICAgICAgICAgICAgICF0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybC5zdGFydHNXaXRoKFwiaHR0cFwiKSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2FuJ3QgY29ubmVjdCB0byBob21lc2VydmVyIHZpYSBIVFRQIHdoZW4gYW4gSFRUUFMgVVJMIGlzIGluIHlvdXIgYnJvd3NlciBiYXIuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRWl0aGVyIHVzZSBIVFRQUyBvciA8YT5lbmFibGUgdW5zYWZlIHNjcmlwdHM8L2E+LlwiLCB7fSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2EnOiAoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxhIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPVwiaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9zZWFyY2g/JnE9ZW5hYmxlJTIwdW5zYWZlJTIwc2NyaXB0c1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvclRleHQgPSA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNhbid0IGNvbm5lY3QgdG8gaG9tZXNlcnZlciAtIHBsZWFzZSBjaGVjayB5b3VyIGNvbm5lY3Rpdml0eSwgZW5zdXJlIHlvdXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8YT5ob21lc2VydmVyJ3MgU1NMIGNlcnRpZmljYXRlPC9hPiBpcyB0cnVzdGVkLCBhbmQgdGhhdCBhIGJyb3dzZXIgZXh0ZW5zaW9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaXMgbm90IGJsb2NraW5nIHJlcXVlc3RzLlwiLCB7fSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2EnOiAoc3ViKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiBocmVmPXt0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+LFxuICAgICAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlcnJvclRleHQ7XG4gICAgfVxuXG4gICAgcmVuZGVyTG9naW5Db21wb25lbnRGb3JGbG93cygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmZsb3dzKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyB0aGlzIGlzIHRoZSBpZGVhbCBvcmRlciB3ZSB3YW50IHRvIHNob3cgdGhlIGZsb3dzIGluXG4gICAgICAgIGNvbnN0IG9yZGVyID0gW1xuICAgICAgICAgICAgXCJtLmxvZ2luLnBhc3N3b3JkXCIsXG4gICAgICAgICAgICBcIm0ubG9naW4uc3NvXCIsXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgZmxvd3MgPSBvcmRlci5tYXAodHlwZSA9PiB0aGlzLnN0YXRlLmZsb3dzLmZpbmQoZmxvdyA9PiBmbG93LnR5cGUgPT09IHR5cGUpKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICB7IGZsb3dzLm1hcChmbG93ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGVwUmVuZGVyZXIgPSB0aGlzLnN0ZXBSZW5kZXJlck1hcFtmbG93LnR5cGVdO1xuICAgICAgICAgICAgICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQga2V5PXtmbG93LnR5cGV9Pnsgc3RlcFJlbmRlcmVyKCkgfTwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICB9KSB9XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJQYXNzd29yZFN0ZXAgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UGFzc3dvcmRMb2dpblxuICAgICAgICAgICAgICAgIG9uU3VibWl0PXt0aGlzLm9uUGFzc3dvcmRMb2dpbn1cbiAgICAgICAgICAgICAgICB1c2VybmFtZT17dGhpcy5zdGF0ZS51c2VybmFtZX1cbiAgICAgICAgICAgICAgICBwaG9uZUNvdW50cnk9e3RoaXMuc3RhdGUucGhvbmVDb3VudHJ5fVxuICAgICAgICAgICAgICAgIHBob25lTnVtYmVyPXt0aGlzLnN0YXRlLnBob25lTnVtYmVyfVxuICAgICAgICAgICAgICAgIG9uVXNlcm5hbWVDaGFuZ2VkPXt0aGlzLm9uVXNlcm5hbWVDaGFuZ2VkfVxuICAgICAgICAgICAgICAgIG9uVXNlcm5hbWVCbHVyPXt0aGlzLm9uVXNlcm5hbWVCbHVyfVxuICAgICAgICAgICAgICAgIG9uUGhvbmVDb3VudHJ5Q2hhbmdlZD17dGhpcy5vblBob25lQ291bnRyeUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgb25QaG9uZU51bWJlckNoYW5nZWQ9e3RoaXMub25QaG9uZU51bWJlckNoYW5nZWR9XG4gICAgICAgICAgICAgICAgb25Gb3Jnb3RQYXNzd29yZENsaWNrPXt0aGlzLnByb3BzLm9uRm9yZ290UGFzc3dvcmRDbGlja31cbiAgICAgICAgICAgICAgICBsb2dpbkluY29ycmVjdD17dGhpcy5zdGF0ZS5sb2dpbkluY29ycmVjdH1cbiAgICAgICAgICAgICAgICBzZXJ2ZXJDb25maWc9e3RoaXMucHJvcHMuc2VydmVyQ29uZmlnfVxuICAgICAgICAgICAgICAgIGRpc2FibGVTdWJtaXQ9e3RoaXMuaXNCdXN5KCl9XG4gICAgICAgICAgICAgICAgYnVzeT17dGhpcy5wcm9wcy5pc1N5bmNpbmcgfHwgdGhpcy5zdGF0ZS5idXN5TG9nZ2luZ0lufVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJTc29TdGVwID0gbG9naW5UeXBlID0+IHtcbiAgICAgICAgY29uc3QgZmxvdyA9IHRoaXMuc3RhdGUuZmxvd3MuZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLlwiICsgbG9naW5UeXBlKSBhcyBJU1NPRmxvdztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFNTT0J1dHRvbnNcbiAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ9e3RoaXMubG9naW5Mb2dpYy5jcmVhdGVUZW1wb3JhcnlDbGllbnQoKX1cbiAgICAgICAgICAgICAgICBmbG93PXtmbG93fVxuICAgICAgICAgICAgICAgIGxvZ2luVHlwZT17bG9naW5UeXBlfVxuICAgICAgICAgICAgICAgIGZyYWdtZW50QWZ0ZXJMb2dpbj17dGhpcy5wcm9wcy5mcmFnbWVudEFmdGVyTG9naW59XG4gICAgICAgICAgICAgICAgcHJpbWFyeT17IXRoaXMuc3RhdGUuZmxvd3MuZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLnBhc3N3b3JkXCIpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBBdXRoSGVhZGVyID0gc2RrLmdldENvbXBvbmVudChcImF1dGguQXV0aEhlYWRlclwiKTtcbiAgICAgICAgY29uc3QgQXV0aEJvZHkgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXV0aC5BdXRoQm9keVwiKTtcbiAgICAgICAgY29uc3QgbG9hZGVyID0gdGhpcy5pc0J1c3koKSAmJiAhdGhpcy5zdGF0ZS5idXN5TG9nZ2luZ0luID9cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTG9naW5fbG9hZGVyXCI+PFNwaW5uZXIgLz48L2Rpdj4gOiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGVycm9yVGV4dCA9IHRoaXMuc3RhdGUuZXJyb3JUZXh0O1xuXG4gICAgICAgIGxldCBlcnJvclRleHRTZWN0aW9uO1xuICAgICAgICBpZiAoZXJyb3JUZXh0KSB7XG4gICAgICAgICAgICBlcnJvclRleHRTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTG9naW5fZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBlcnJvclRleHQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzZXJ2ZXJEZWFkU2VjdGlvbjtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNlcnZlcklzQWxpdmUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICBcIm14X0xvZ2luX2Vycm9yXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJteF9Mb2dpbl9zZXJ2ZXJFcnJvclwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwibXhfTG9naW5fc2VydmVyRXJyb3JOb25GYXRhbFwiOiAhdGhpcy5zdGF0ZS5zZXJ2ZXJFcnJvcklzRmF0YWwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNlcnZlckRlYWRTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuc2VydmVyRGVhZEVycm9yfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmb290ZXI7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlzU3luY2luZyB8fCB0aGlzLnN0YXRlLmJ1c3lMb2dnaW5nSW4pIHtcbiAgICAgICAgICAgIGZvb3RlciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfcGFkZGVkRm9vdGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9wYWRkZWRGb290ZXJfdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPElubGluZVNwaW5uZXIgdz17MjB9IGg9ezIwfSAvPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuaXNTeW5jaW5nID8gX3QoXCJTeW5jaW5nLi4uXCIpIDogX3QoXCJTaWduaW5nIEluLi4uXCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuaXNTeW5jaW5nICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfcGFkZGVkRm9vdGVyX3N1YnRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIklmIHlvdSd2ZSBqb2luZWQgbG90cyBvZiByb29tcywgdGhpcyBtaWdodCB0YWtlIGEgd2hpbGVcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+IH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5SZWdpc3RyYXRpb24pKSB7XG4gICAgICAgICAgICBmb290ZXIgPSAoXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfY2hhbmdlRmxvd1wiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJOZXc/IDxhPkNyZWF0ZSBhY2NvdW50PC9hPlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IDxhIG9uQ2xpY2s9e3RoaXMub25UcnlSZWdpc3RlckNsaWNrfSBocmVmPVwiI1wiPnsgc3ViIH08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBdXRoUGFnZT5cbiAgICAgICAgICAgICAgICA8QXV0aEhlYWRlciBkaXNhYmxlTGFuZ3VhZ2VTZWxlY3Rvcj17dGhpcy5wcm9wcy5pc1N5bmNpbmcgfHwgdGhpcy5zdGF0ZS5idXN5TG9nZ2luZ0lufSAvPlxuICAgICAgICAgICAgICAgIDxBdXRoQm9keT5cbiAgICAgICAgICAgICAgICAgICAgPGgyPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KCdTaWduIGluJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7bG9hZGVyfVxuICAgICAgICAgICAgICAgICAgICA8L2gyPlxuICAgICAgICAgICAgICAgICAgICB7IGVycm9yVGV4dFNlY3Rpb24gfVxuICAgICAgICAgICAgICAgICAgICB7IHNlcnZlckRlYWRTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgPFNlcnZlclBpY2tlclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyQ29uZmlnPXt0aGlzLnByb3BzLnNlcnZlckNvbmZpZ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VydmVyQ29uZmlnQ2hhbmdlPXt0aGlzLnByb3BzLm9uU2VydmVyQ29uZmlnQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyTG9naW5Db21wb25lbnRGb3JGbG93cygpIH1cbiAgICAgICAgICAgICAgICAgICAgeyBmb290ZXIgfVxuICAgICAgICAgICAgICAgIDwvQXV0aEJvZHk+XG4gICAgICAgICAgICA8L0F1dGhQYWdlPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
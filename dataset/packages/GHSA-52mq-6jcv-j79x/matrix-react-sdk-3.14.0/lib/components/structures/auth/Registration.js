"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrixJsSdk = _interopRequireDefault(require("matrix-js-sdk"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _ErrorUtils = require("../../../utils/ErrorUtils");

var _AutoDiscoveryUtils = _interopRequireDefault(require("../../../utils/AutoDiscoveryUtils"));

var _classnames = _interopRequireDefault(require("classnames"));

var Lifecycle = _interopRequireWildcard(require("../../../Lifecycle"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _AuthPage = _interopRequireDefault(require("../../views/auth/AuthPage"));

var _Login = _interopRequireDefault(require("../../../Login"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _SSOButtons = _interopRequireDefault(require("../../views/elements/SSOButtons"));

var _ServerPicker = _interopRequireDefault(require("../../views/elements/ServerPicker"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class Registration extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "loginLogic", void 0);
    (0, _defineProperty2.default)(this, "onFormSubmit", formVals => {
      this.setState({
        errorText: "",
        busy: true,
        formVals: formVals,
        doingUIAuth: true
      });
    });
    (0, _defineProperty2.default)(this, "requestEmailToken", (emailAddress, clientSecret, sendAttempt, sessionId) => {
      return this.state.matrixClient.requestRegisterEmailToken(emailAddress, clientSecret, sendAttempt, this.props.makeRegistrationUrl({
        client_secret: clientSecret,
        hs_url: this.state.matrixClient.getHomeserverUrl(),
        is_url: this.state.matrixClient.getIdentityServerUrl(),
        session_id: sessionId
      }));
    });
    (0, _defineProperty2.default)(this, "onUIAuthFinished", async (success, response, extra) => {
      if (!success) {
        let msg = response.message || response.toString(); // can we give a better error message?

        if (response.errcode === 'M_RESOURCE_LIMIT_EXCEEDED') {
          const errorTop = (0, _ErrorUtils.messageForResourceLimitError)(response.data.limit_type, response.data.admin_contact, {
            'monthly_active_user': (0, _languageHandler._td)("This homeserver has hit its Monthly Active User limit."),
            '': (0, _languageHandler._td)("This homeserver has exceeded one of its resource limits.")
          });
          const errorDetail = (0, _ErrorUtils.messageForResourceLimitError)(response.data.limit_type, response.data.admin_contact, {
            '': (0, _languageHandler._td)("Please <a>contact your service administrator</a> to continue using this service.")
          });
          msg = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, errorTop), /*#__PURE__*/_react.default.createElement("p", null, errorDetail));
        } else if (response.required_stages && response.required_stages.indexOf('m.login.msisdn') > -1) {
          let msisdnAvailable = false;

          for (const flow of response.available_flows) {
            msisdnAvailable = msisdnAvailable || flow.stages.includes('m.login.msisdn');
          }

          if (!msisdnAvailable) {
            msg = (0, _languageHandler._t)('This server does not support authentication with a phone number.');
          }
        } else if (response.errcode === "M_USER_IN_USE") {
          msg = (0, _languageHandler._t)("That username already exists, please try another.");
        }

        this.setState({
          busy: false,
          doingUIAuth: false,
          errorText: msg
        });
        return;
      }

      _MatrixClientPeg.MatrixClientPeg.setJustRegisteredUserId(response.user_id);

      const newState = {
        doingUIAuth: false,
        registeredUsername: response.user_id,
        differentLoggedInUserId: null,
        completedNoSignin: false,
        // we're still busy until we get unmounted: don't show the registration form again
        busy: true
      }; // The user came in through an email validation link. To avoid overwriting
      // their session, check to make sure the session isn't someone else, and
      // isn't a guest user since we'll usually have set a guest user session before
      // starting the registration process. This isn't perfect since it's possible
      // the user had a separate guest session they didn't actually mean to replace.

      const [sessionOwner, sessionIsGuest] = await Lifecycle.getStoredSessionOwner();

      if (sessionOwner && !sessionIsGuest && sessionOwner !== response.userId) {
        console.log(`Found a session for ${sessionOwner} but ${response.userId} has just registered.`);
        newState.differentLoggedInUserId = sessionOwner;
      }

      if (response.access_token) {
        await this.props.onLoggedIn({
          userId: response.user_id,
          deviceId: response.device_id,
          homeserverUrl: this.state.matrixClient.getHomeserverUrl(),
          identityServerUrl: this.state.matrixClient.getIdentityServerUrl(),
          accessToken: response.access_token
        }, this.state.formVals.password);
        this.setupPushers();
      } else {
        newState.busy = false;
        newState.completedNoSignin = true;
      }

      this.setState(newState);
    });
    (0, _defineProperty2.default)(this, "onLoginClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onLoginClick();
    });
    (0, _defineProperty2.default)(this, "onGoToFormClicked", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.replaceClient(this.props.serverConfig);
      this.setState({
        busy: false,
        doingUIAuth: false
      });
    });
    (0, _defineProperty2.default)(this, "makeRegisterRequest", auth => {
      // We inhibit login if we're trying to register with an email address: this
      // avoids a lot of complex race conditions that can occur if we try to log
      // the user in one one or both of the tabs they might end up with after
      // clicking the email link.
      let inhibitLogin = Boolean(this.state.formVals.email); // Only send inhibitLogin if we're sending username / pw params
      // (Since we need to send no params at all to use the ones saved in the
      // session).

      if (!this.state.formVals.password) inhibitLogin = null;
      const registerParams = {
        username: this.state.formVals.username,
        password: this.state.formVals.password,
        initial_device_display_name: this.props.defaultDeviceDisplayName,
        auth: undefined,
        inhibit_login: undefined
      };
      if (auth) registerParams.auth = auth;
      if (inhibitLogin !== undefined && inhibitLogin !== null) registerParams.inhibit_login = inhibitLogin;
      return this.state.matrixClient.registerRequest(registerParams);
    });
    (0, _defineProperty2.default)(this, "onLoginClickWithCheck", async ev => {
      ev.preventDefault();
      const sessionLoaded = await Lifecycle.loadSession({
        ignoreGuest: true
      });

      if (!sessionLoaded) {
        // ok fine, there's still no session: really go to the login page
        this.props.onLoginClick();
      }
    });
    this.state = {
      busy: false,
      errorText: null,
      formVals: {
        email: this.props.email
      },
      doingUIAuth: Boolean(this.props.sessionId),
      flows: null,
      completedNoSignin: false,
      serverIsAlive: true,
      serverErrorIsFatal: false,
      serverDeadError: ""
    };
    const {
      hsUrl,
      isUrl
    } = this.props.serverConfig;
    this.loginLogic = new _Login.default(hsUrl, isUrl, null, {
      defaultDeviceDisplayName: "Element login check" // We shouldn't ever be used

    });
  }

  componentDidMount() {
    this.replaceClient(this.props.serverConfig);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.serverConfig.hsUrl === this.props.serverConfig.hsUrl && newProps.serverConfig.isUrl === this.props.serverConfig.isUrl) return;
    this.replaceClient(newProps.serverConfig);
  }

  async replaceClient(serverConfig
  /*: ValidatedServerConfig*/
  ) {
    this.setState({
      errorText: null,
      serverDeadError: null,
      serverErrorIsFatal: false,
      // busy while we do liveness check (we need to avoid trying to render
      // the UI auth component while we don't have a matrix client)
      busy: true
    }); // Do a liveliness check on the URLs

    try {
      await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(serverConfig.hsUrl, serverConfig.isUrl);
      this.setState({
        serverIsAlive: true,
        serverErrorIsFatal: false
      });
    } catch (e) {
      this.setState(_objectSpread({
        busy: false
      }, _AutoDiscoveryUtils.default.authComponentStateForError(e, "register")));

      if (this.state.serverErrorIsFatal) {
        return; // Server is dead - do not continue.
      }
    }

    const {
      hsUrl,
      isUrl
    } = serverConfig;

    const cli = _matrixJsSdk.default.createClient({
      baseUrl: hsUrl,
      idBaseUrl: isUrl
    });

    this.loginLogic.setHomeserverUrl(hsUrl);
    this.loginLogic.setIdentityServerUrl(isUrl);
    let ssoFlow
    /*: ISSOFlow*/
    ;

    try {
      const loginFlows = await this.loginLogic.getFlows();
      ssoFlow = loginFlows.find(f => f.type === "m.login.sso" || f.type === "m.login.cas");
    } catch (e) {
      console.error("Failed to get login flows to check for SSO support", e);
    }

    this.setState({
      matrixClient: cli,
      ssoFlow,
      busy: false
    });

    const showGenericError = e => {
      this.setState({
        errorText: (0, _languageHandler._t)("Unable to query for supported registration methods."),
        // add empty flows array to get rid of spinner
        flows: []
      });
    };

    try {
      // We do the first registration request ourselves to discover whether we need to
      // do SSO instead. If we've already started the UI Auth process though, we don't
      // need to.
      if (!this.state.doingUIAuth) {
        await this.makeRegisterRequest(null); // This should never succeed since we specified no auth object.

        console.log("Expecting 401 from register request but got success!");
      }
    } catch (e) {
      if (e.httpStatus === 401) {
        this.setState({
          flows: e.data.flows
        });
      } else if (e.httpStatus === 403 && e.errcode === "M_UNKNOWN") {
        // At this point registration is pretty much disabled, but before we do that let's
        // quickly check to see if the server supports SSO instead. If it does, we'll send
        // the user off to the login page to figure their account out.
        if (ssoFlow) {
          // Redirect to login page - server probably expects SSO only
          _dispatcher.default.dispatch({
            action: 'start_login'
          });
        } else {
          this.setState({
            serverErrorIsFatal: true,
            // fatal because user cannot continue on this server
            errorText: (0, _languageHandler._t)("Registration has been disabled on this homeserver."),
            // add empty flows array to get rid of spinner
            flows: []
          });
        }
      } else {
        console.log("Unable to query for supported registration methods.", e);
        showGenericError(e);
      }
    }
  }

  setupPushers() {
    if (!this.props.brand) {
      return Promise.resolve();
    }

    const matrixClient = _MatrixClientPeg.MatrixClientPeg.get();

    return matrixClient.getPushers().then(resp => {
      const pushers = resp.pushers;

      for (let i = 0; i < pushers.length; ++i) {
        if (pushers[i].kind === 'email') {
          const emailPusher = pushers[i];
          emailPusher.data = {
            brand: this.props.brand
          };
          matrixClient.setPusher(emailPusher).then(() => {
            console.log("Set email branding to " + this.props.brand);
          }, error => {
            console.error("Couldn't set email branding: " + error);
          });
        }
      }
    }, error => {
      console.error("Couldn't get pushers: " + error);
    });
  }

  getUIAuthInputs() {
    return {
      emailAddress: this.state.formVals.email,
      phoneCountry: this.state.formVals.phoneCountry,
      phoneNumber: this.state.formVals.phoneNumber
    };
  } // Links to the login page shown after registration is completed are routed through this
  // which checks the user hasn't already logged in somewhere else (perhaps we should do
  // this more generally?)


  renderRegisterComponent() {
    const InteractiveAuth = sdk.getComponent('structures.InteractiveAuth');
    const Spinner = sdk.getComponent('elements.Spinner');
    const RegistrationForm = sdk.getComponent('auth.RegistrationForm');

    if (this.state.matrixClient && this.state.doingUIAuth) {
      return /*#__PURE__*/_react.default.createElement(InteractiveAuth, {
        matrixClient: this.state.matrixClient,
        makeRequest: this.makeRegisterRequest,
        onAuthFinished: this.onUIAuthFinished,
        inputs: this.getUIAuthInputs(),
        requestEmailToken: this.requestEmailToken,
        sessionId: this.props.sessionId,
        clientSecret: this.props.clientSecret,
        emailSid: this.props.idSid,
        poll: true
      });
    } else if (!this.state.matrixClient && !this.state.busy) {
      return null;
    } else if (this.state.busy || !this.state.flows) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AuthBody_spinner"
      }, /*#__PURE__*/_react.default.createElement(Spinner, null));
    } else if (this.state.flows.length) {
      let ssoSection;

      if (this.state.ssoFlow) {
        let continueWithSection;
        const providers = this.state.ssoFlow["org.matrix.msc2858.identity_providers"] || []; // when there is only a single (or 0) providers we show a wide button with `Continue with X` text

        if (providers.length > 1) {
          // i18n: ssoButtons is a placeholder to help translators understand context
          continueWithSection = /*#__PURE__*/_react.default.createElement("h3", {
            className: "mx_AuthBody_centered"
          }, (0, _languageHandler._t)("Continue with %(ssoButtons)s", {
            ssoButtons: ""
          }).trim());
        } // i18n: ssoButtons & usernamePassword are placeholders to help translators understand context


        ssoSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, continueWithSection, /*#__PURE__*/_react.default.createElement(_SSOButtons.default, {
          matrixClient: this.loginLogic.createTemporaryClient(),
          flow: this.state.ssoFlow,
          loginType: this.state.ssoFlow.type === "m.login.sso" ? "sso" : "cas",
          fragmentAfterLogin: this.props.fragmentAfterLogin
        }), /*#__PURE__*/_react.default.createElement("h3", {
          className: "mx_AuthBody_centered"
        }, (0, _languageHandler._t)("%(ssoButtons)s Or %(usernamePassword)s", {
          ssoButtons: "",
          usernamePassword: ""
        }).trim()));
      }

      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, ssoSection, /*#__PURE__*/_react.default.createElement(RegistrationForm, {
        defaultUsername: this.state.formVals.username,
        defaultEmail: this.state.formVals.email,
        defaultPhoneCountry: this.state.formVals.phoneCountry,
        defaultPhoneNumber: this.state.formVals.phoneNumber,
        defaultPassword: this.state.formVals.password,
        onRegisterClick: this.onFormSubmit,
        flows: this.state.flows,
        serverConfig: this.props.serverConfig,
        canSubmit: !this.state.serverErrorIsFatal
      }));
    }
  }

  render() {
    const AuthHeader = sdk.getComponent('auth.AuthHeader');
    const AuthBody = sdk.getComponent("auth.AuthBody");
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    let errorText;
    const err = this.state.errorText;

    if (err) {
      errorText = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Login_error"
      }, err);
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

    const signIn = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_AuthBody_changeFlow"
    }, (0, _languageHandler._t)("Already have an account? <a>Sign in here</a>", {}, {
      a: sub => /*#__PURE__*/_react.default.createElement("a", {
        onClick: this.onLoginClick,
        href: "#"
      }, sub)
    })); // Only show the 'go back' button if you're not looking at the form


    let goBack;

    if (this.state.doingUIAuth) {
      goBack = /*#__PURE__*/_react.default.createElement("a", {
        className: "mx_AuthBody_changeFlow",
        onClick: this.onGoToFormClicked,
        href: "#"
      }, (0, _languageHandler._t)('Go back'));
    }

    let body;

    if (this.state.completedNoSignin) {
      let regDoneText;

      if (this.state.differentLoggedInUserId) {
        regDoneText = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your new account (%(newAccountId)s) is registered, but you're already " + "logged into a different account (%(loggedInUserId)s).", {
          newAccountId: this.state.registeredUsername,
          loggedInUserId: this.state.differentLoggedInUserId
        })), /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          element: "span",
          className: "mx_linkButton",
          onClick: this.onLoginClickWithCheck
        }, (0, _languageHandler._t)("Continue with previous account"))));
      } else if (this.state.formVals.password) {
        // We're the client that started the registration
        regDoneText = /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("<a>Log in</a> to your new account.", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: "#/login",
            onClick: this.onLoginClickWithCheck
          }, sub)
        }));
      } else {
        // We're not the original client: the user probably got to us by clicking the
        // email validation link. We can't offer a 'go straight to your account' link
        // as we don't have the original creds.
        regDoneText = /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("You can now close this window or <a>log in</a> to your new account.", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: "#/login",
            onClick: this.onLoginClickWithCheck
          }, sub)
        }));
      }

      body = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Registration Successful")), regDoneText);
    } else {
      body = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)('Create account')), errorText, serverDeadSection, /*#__PURE__*/_react.default.createElement(_ServerPicker.default, {
        title: (0, _languageHandler._t)("Host account on"),
        dialogTitle: (0, _languageHandler._t)("Decide where your account is hosted"),
        serverConfig: this.props.serverConfig,
        onServerConfigChange: this.state.doingUIAuth ? undefined : this.props.onServerConfigChange
      }), this.renderRegisterComponent(), goBack, signIn);
    }

    return /*#__PURE__*/_react.default.createElement(_AuthPage.default, null, /*#__PURE__*/_react.default.createElement(AuthHeader, null), /*#__PURE__*/_react.default.createElement(AuthBody, null, body));
  }

}

exports.default = Registration;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvYXV0aC9SZWdpc3RyYXRpb24udHN4Il0sIm5hbWVzIjpbIlJlZ2lzdHJhdGlvbiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImZvcm1WYWxzIiwic2V0U3RhdGUiLCJlcnJvclRleHQiLCJidXN5IiwiZG9pbmdVSUF1dGgiLCJlbWFpbEFkZHJlc3MiLCJjbGllbnRTZWNyZXQiLCJzZW5kQXR0ZW1wdCIsInNlc3Npb25JZCIsInN0YXRlIiwibWF0cml4Q2xpZW50IiwicmVxdWVzdFJlZ2lzdGVyRW1haWxUb2tlbiIsIm1ha2VSZWdpc3RyYXRpb25VcmwiLCJjbGllbnRfc2VjcmV0IiwiaHNfdXJsIiwiZ2V0SG9tZXNlcnZlclVybCIsImlzX3VybCIsImdldElkZW50aXR5U2VydmVyVXJsIiwic2Vzc2lvbl9pZCIsInN1Y2Nlc3MiLCJyZXNwb25zZSIsImV4dHJhIiwibXNnIiwibWVzc2FnZSIsInRvU3RyaW5nIiwiZXJyY29kZSIsImVycm9yVG9wIiwiZGF0YSIsImxpbWl0X3R5cGUiLCJhZG1pbl9jb250YWN0IiwiZXJyb3JEZXRhaWwiLCJyZXF1aXJlZF9zdGFnZXMiLCJpbmRleE9mIiwibXNpc2RuQXZhaWxhYmxlIiwiZmxvdyIsImF2YWlsYWJsZV9mbG93cyIsInN0YWdlcyIsImluY2x1ZGVzIiwiTWF0cml4Q2xpZW50UGVnIiwic2V0SnVzdFJlZ2lzdGVyZWRVc2VySWQiLCJ1c2VyX2lkIiwibmV3U3RhdGUiLCJyZWdpc3RlcmVkVXNlcm5hbWUiLCJkaWZmZXJlbnRMb2dnZWRJblVzZXJJZCIsImNvbXBsZXRlZE5vU2lnbmluIiwic2Vzc2lvbk93bmVyIiwic2Vzc2lvbklzR3Vlc3QiLCJMaWZlY3ljbGUiLCJnZXRTdG9yZWRTZXNzaW9uT3duZXIiLCJ1c2VySWQiLCJjb25zb2xlIiwibG9nIiwiYWNjZXNzX3Rva2VuIiwib25Mb2dnZWRJbiIsImRldmljZUlkIiwiZGV2aWNlX2lkIiwiaG9tZXNlcnZlclVybCIsImlkZW50aXR5U2VydmVyVXJsIiwiYWNjZXNzVG9rZW4iLCJwYXNzd29yZCIsInNldHVwUHVzaGVycyIsImV2IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJvbkxvZ2luQ2xpY2siLCJyZXBsYWNlQ2xpZW50Iiwic2VydmVyQ29uZmlnIiwiYXV0aCIsImluaGliaXRMb2dpbiIsIkJvb2xlYW4iLCJlbWFpbCIsInJlZ2lzdGVyUGFyYW1zIiwidXNlcm5hbWUiLCJpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWUiLCJkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUiLCJ1bmRlZmluZWQiLCJpbmhpYml0X2xvZ2luIiwicmVnaXN0ZXJSZXF1ZXN0Iiwic2Vzc2lvbkxvYWRlZCIsImxvYWRTZXNzaW9uIiwiaWdub3JlR3Vlc3QiLCJmbG93cyIsInNlcnZlcklzQWxpdmUiLCJzZXJ2ZXJFcnJvcklzRmF0YWwiLCJzZXJ2ZXJEZWFkRXJyb3IiLCJoc1VybCIsImlzVXJsIiwibG9naW5Mb2dpYyIsIkxvZ2luIiwiY29tcG9uZW50RGlkTW91bnQiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5ld1Byb3BzIiwiQXV0b0Rpc2NvdmVyeVV0aWxzIiwidmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyIsImUiLCJhdXRoQ29tcG9uZW50U3RhdGVGb3JFcnJvciIsImNsaSIsIk1hdHJpeCIsImNyZWF0ZUNsaWVudCIsImJhc2VVcmwiLCJpZEJhc2VVcmwiLCJzZXRIb21lc2VydmVyVXJsIiwic2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJzc29GbG93IiwibG9naW5GbG93cyIsImdldEZsb3dzIiwiZmluZCIsImYiLCJ0eXBlIiwiZXJyb3IiLCJzaG93R2VuZXJpY0Vycm9yIiwibWFrZVJlZ2lzdGVyUmVxdWVzdCIsImh0dHBTdGF0dXMiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsImJyYW5kIiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXQiLCJnZXRQdXNoZXJzIiwidGhlbiIsInJlc3AiLCJwdXNoZXJzIiwiaSIsImxlbmd0aCIsImtpbmQiLCJlbWFpbFB1c2hlciIsInNldFB1c2hlciIsImdldFVJQXV0aElucHV0cyIsInBob25lQ291bnRyeSIsInBob25lTnVtYmVyIiwicmVuZGVyUmVnaXN0ZXJDb21wb25lbnQiLCJJbnRlcmFjdGl2ZUF1dGgiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJTcGlubmVyIiwiUmVnaXN0cmF0aW9uRm9ybSIsIm9uVUlBdXRoRmluaXNoZWQiLCJyZXF1ZXN0RW1haWxUb2tlbiIsImlkU2lkIiwic3NvU2VjdGlvbiIsImNvbnRpbnVlV2l0aFNlY3Rpb24iLCJwcm92aWRlcnMiLCJzc29CdXR0b25zIiwidHJpbSIsImNyZWF0ZVRlbXBvcmFyeUNsaWVudCIsImZyYWdtZW50QWZ0ZXJMb2dpbiIsInVzZXJuYW1lUGFzc3dvcmQiLCJvbkZvcm1TdWJtaXQiLCJyZW5kZXIiLCJBdXRoSGVhZGVyIiwiQXV0aEJvZHkiLCJBY2Nlc3NpYmxlQnV0dG9uIiwiZXJyIiwic2VydmVyRGVhZFNlY3Rpb24iLCJjbGFzc2VzIiwic2lnbkluIiwiYSIsInN1YiIsImdvQmFjayIsIm9uR29Ub0Zvcm1DbGlja2VkIiwiYm9keSIsInJlZ0RvbmVUZXh0IiwibmV3QWNjb3VudElkIiwibG9nZ2VkSW5Vc2VySWQiLCJvbkxvZ2luQ2xpY2tXaXRoQ2hlY2siLCJvblNlcnZlckNvbmZpZ0NoYW5nZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBZ0ZlLE1BQU1BLFlBQU4sU0FBMkJDLGVBQU1DO0FBQWpDO0FBQTJEO0FBR3RFQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZTtBQUFBLHdEQW1JSUMsUUFBUSxJQUFJO0FBQy9CLFdBQUtDLFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxTQUFTLEVBQUUsRUFERDtBQUVWQyxRQUFBQSxJQUFJLEVBQUUsSUFGSTtBQUdWSCxRQUFBQSxRQUFRLEVBQUVBLFFBSEE7QUFJVkksUUFBQUEsV0FBVyxFQUFFO0FBSkgsT0FBZDtBQU1ILEtBMUlrQjtBQUFBLDZEQTRJUyxDQUFDQyxZQUFELEVBQWVDLFlBQWYsRUFBNkJDLFdBQTdCLEVBQTBDQyxTQUExQyxLQUF3RDtBQUNoRixhQUFPLEtBQUtDLEtBQUwsQ0FBV0MsWUFBWCxDQUF3QkMseUJBQXhCLENBQ0hOLFlBREcsRUFFSEMsWUFGRyxFQUdIQyxXQUhHLEVBSUgsS0FBS1IsS0FBTCxDQUFXYSxtQkFBWCxDQUErQjtBQUMzQkMsUUFBQUEsYUFBYSxFQUFFUCxZQURZO0FBRTNCUSxRQUFBQSxNQUFNLEVBQUUsS0FBS0wsS0FBTCxDQUFXQyxZQUFYLENBQXdCSyxnQkFBeEIsRUFGbUI7QUFHM0JDLFFBQUFBLE1BQU0sRUFBRSxLQUFLUCxLQUFMLENBQVdDLFlBQVgsQ0FBd0JPLG9CQUF4QixFQUhtQjtBQUkzQkMsUUFBQUEsVUFBVSxFQUFFVjtBQUplLE9BQS9CLENBSkcsQ0FBUDtBQVdILEtBeEprQjtBQUFBLDREQTBKUSxPQUFPVyxPQUFQLEVBQWdCQyxRQUFoQixFQUEwQkMsS0FBMUIsS0FBb0M7QUFDM0QsVUFBSSxDQUFDRixPQUFMLEVBQWM7QUFDVixZQUFJRyxHQUFHLEdBQUdGLFFBQVEsQ0FBQ0csT0FBVCxJQUFvQkgsUUFBUSxDQUFDSSxRQUFULEVBQTlCLENBRFUsQ0FFVjs7QUFDQSxZQUFJSixRQUFRLENBQUNLLE9BQVQsS0FBcUIsMkJBQXpCLEVBQXNEO0FBQ2xELGdCQUFNQyxRQUFRLEdBQUcsOENBQ2JOLFFBQVEsQ0FBQ08sSUFBVCxDQUFjQyxVQURELEVBRWJSLFFBQVEsQ0FBQ08sSUFBVCxDQUFjRSxhQUZELEVBR2I7QUFDSSxtQ0FBdUIsMEJBQUksd0RBQUosQ0FEM0I7QUFFSSxnQkFBSSwwQkFBSSwwREFBSjtBQUZSLFdBSGEsQ0FBakI7QUFRQSxnQkFBTUMsV0FBVyxHQUFHLDhDQUNoQlYsUUFBUSxDQUFDTyxJQUFULENBQWNDLFVBREUsRUFFaEJSLFFBQVEsQ0FBQ08sSUFBVCxDQUFjRSxhQUZFLEVBR2hCO0FBQ0ksZ0JBQUksMEJBQUksa0ZBQUo7QUFEUixXQUhnQixDQUFwQjtBQU9BUCxVQUFBQSxHQUFHLGdCQUFHLHVEQUNGLHdDQUFJSSxRQUFKLENBREUsZUFFRix3Q0FBSUksV0FBSixDQUZFLENBQU47QUFJSCxTQXBCRCxNQW9CTyxJQUFJVixRQUFRLENBQUNXLGVBQVQsSUFBNEJYLFFBQVEsQ0FBQ1csZUFBVCxDQUF5QkMsT0FBekIsQ0FBaUMsZ0JBQWpDLElBQXFELENBQUMsQ0FBdEYsRUFBeUY7QUFDNUYsY0FBSUMsZUFBZSxHQUFHLEtBQXRCOztBQUNBLGVBQUssTUFBTUMsSUFBWCxJQUFtQmQsUUFBUSxDQUFDZSxlQUE1QixFQUE2QztBQUN6Q0YsWUFBQUEsZUFBZSxHQUFHQSxlQUFlLElBQUlDLElBQUksQ0FBQ0UsTUFBTCxDQUFZQyxRQUFaLENBQXFCLGdCQUFyQixDQUFyQztBQUNIOztBQUNELGNBQUksQ0FBQ0osZUFBTCxFQUFzQjtBQUNsQlgsWUFBQUEsR0FBRyxHQUFHLHlCQUFHLGtFQUFILENBQU47QUFDSDtBQUNKLFNBUk0sTUFRQSxJQUFJRixRQUFRLENBQUNLLE9BQVQsS0FBcUIsZUFBekIsRUFBMEM7QUFDN0NILFVBQUFBLEdBQUcsR0FBRyx5QkFBRyxtREFBSCxDQUFOO0FBQ0g7O0FBQ0QsYUFBS3JCLFFBQUwsQ0FBYztBQUNWRSxVQUFBQSxJQUFJLEVBQUUsS0FESTtBQUVWQyxVQUFBQSxXQUFXLEVBQUUsS0FGSDtBQUdWRixVQUFBQSxTQUFTLEVBQUVvQjtBQUhELFNBQWQ7QUFLQTtBQUNIOztBQUVEZ0IsdUNBQWdCQyx1QkFBaEIsQ0FBd0NuQixRQUFRLENBQUNvQixPQUFqRDs7QUFFQSxZQUFNQyxRQUFRLEdBQUc7QUFDYnJDLFFBQUFBLFdBQVcsRUFBRSxLQURBO0FBRWJzQyxRQUFBQSxrQkFBa0IsRUFBRXRCLFFBQVEsQ0FBQ29CLE9BRmhCO0FBR2JHLFFBQUFBLHVCQUF1QixFQUFFLElBSFo7QUFJYkMsUUFBQUEsaUJBQWlCLEVBQUUsS0FKTjtBQUtiO0FBQ0F6QyxRQUFBQSxJQUFJLEVBQUU7QUFOTyxPQUFqQixDQTdDMkQsQ0FzRDNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsWUFBTSxDQUFDMEMsWUFBRCxFQUFlQyxjQUFmLElBQWlDLE1BQU1DLFNBQVMsQ0FBQ0MscUJBQVYsRUFBN0M7O0FBQ0EsVUFBSUgsWUFBWSxJQUFJLENBQUNDLGNBQWpCLElBQW1DRCxZQUFZLEtBQUt6QixRQUFRLENBQUM2QixNQUFqRSxFQUF5RTtBQUNyRUMsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQ0ssdUJBQXNCTixZQUFhLFFBQU96QixRQUFRLENBQUM2QixNQUFPLHVCQUQvRDtBQUdBUixRQUFBQSxRQUFRLENBQUNFLHVCQUFULEdBQW1DRSxZQUFuQztBQUNIOztBQUVELFVBQUl6QixRQUFRLENBQUNnQyxZQUFiLEVBQTJCO0FBQ3ZCLGNBQU0sS0FBS3JELEtBQUwsQ0FBV3NELFVBQVgsQ0FBc0I7QUFDeEJKLFVBQUFBLE1BQU0sRUFBRTdCLFFBQVEsQ0FBQ29CLE9BRE87QUFFeEJjLFVBQUFBLFFBQVEsRUFBRWxDLFFBQVEsQ0FBQ21DLFNBRks7QUFHeEJDLFVBQUFBLGFBQWEsRUFBRSxLQUFLL0MsS0FBTCxDQUFXQyxZQUFYLENBQXdCSyxnQkFBeEIsRUFIUztBQUl4QjBDLFVBQUFBLGlCQUFpQixFQUFFLEtBQUtoRCxLQUFMLENBQVdDLFlBQVgsQ0FBd0JPLG9CQUF4QixFQUpLO0FBS3hCeUMsVUFBQUEsV0FBVyxFQUFFdEMsUUFBUSxDQUFDZ0M7QUFMRSxTQUF0QixFQU1ILEtBQUszQyxLQUFMLENBQVdULFFBQVgsQ0FBb0IyRCxRQU5qQixDQUFOO0FBUUEsYUFBS0MsWUFBTDtBQUNILE9BVkQsTUFVTztBQUNIbkIsUUFBQUEsUUFBUSxDQUFDdEMsSUFBVCxHQUFnQixLQUFoQjtBQUNBc0MsUUFBQUEsUUFBUSxDQUFDRyxpQkFBVCxHQUE2QixJQUE3QjtBQUNIOztBQUVELFdBQUszQyxRQUFMLENBQWN3QyxRQUFkO0FBQ0gsS0E3T2tCO0FBQUEsd0RBc1FJb0IsRUFBRSxJQUFJO0FBQ3pCQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFDQUQsTUFBQUEsRUFBRSxDQUFDRSxlQUFIO0FBQ0EsV0FBS2hFLEtBQUwsQ0FBV2lFLFlBQVg7QUFDSCxLQTFRa0I7QUFBQSw2REE0UVNILEVBQUUsSUFBSTtBQUM5QkEsTUFBQUEsRUFBRSxDQUFDQyxjQUFIO0FBQ0FELE1BQUFBLEVBQUUsQ0FBQ0UsZUFBSDtBQUNBLFdBQUtFLGFBQUwsQ0FBbUIsS0FBS2xFLEtBQUwsQ0FBV21FLFlBQTlCO0FBQ0EsV0FBS2pFLFFBQUwsQ0FBYztBQUNWRSxRQUFBQSxJQUFJLEVBQUUsS0FESTtBQUVWQyxRQUFBQSxXQUFXLEVBQUU7QUFGSCxPQUFkO0FBSUgsS0FwUmtCO0FBQUEsK0RBc1JXK0QsSUFBSSxJQUFJO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBSUMsWUFBWSxHQUFHQyxPQUFPLENBQUMsS0FBSzVELEtBQUwsQ0FBV1QsUUFBWCxDQUFvQnNFLEtBQXJCLENBQTFCLENBTGtDLENBT2xDO0FBQ0E7QUFDQTs7QUFDQSxVQUFJLENBQUMsS0FBSzdELEtBQUwsQ0FBV1QsUUFBWCxDQUFvQjJELFFBQXpCLEVBQW1DUyxZQUFZLEdBQUcsSUFBZjtBQUVuQyxZQUFNRyxjQUFjLEdBQUc7QUFDbkJDLFFBQUFBLFFBQVEsRUFBRSxLQUFLL0QsS0FBTCxDQUFXVCxRQUFYLENBQW9Cd0UsUUFEWDtBQUVuQmIsUUFBQUEsUUFBUSxFQUFFLEtBQUtsRCxLQUFMLENBQVdULFFBQVgsQ0FBb0IyRCxRQUZYO0FBR25CYyxRQUFBQSwyQkFBMkIsRUFBRSxLQUFLMUUsS0FBTCxDQUFXMkUsd0JBSHJCO0FBSW5CUCxRQUFBQSxJQUFJLEVBQUVRLFNBSmE7QUFLbkJDLFFBQUFBLGFBQWEsRUFBRUQ7QUFMSSxPQUF2QjtBQU9BLFVBQUlSLElBQUosRUFBVUksY0FBYyxDQUFDSixJQUFmLEdBQXNCQSxJQUF0QjtBQUNWLFVBQUlDLFlBQVksS0FBS08sU0FBakIsSUFBOEJQLFlBQVksS0FBSyxJQUFuRCxFQUF5REcsY0FBYyxDQUFDSyxhQUFmLEdBQStCUixZQUEvQjtBQUN6RCxhQUFPLEtBQUszRCxLQUFMLENBQVdDLFlBQVgsQ0FBd0JtRSxlQUF4QixDQUF3Q04sY0FBeEMsQ0FBUDtBQUNILEtBNVNrQjtBQUFBLGlFQXlUYSxNQUFNVixFQUFOLElBQVk7QUFDeENBLE1BQUFBLEVBQUUsQ0FBQ0MsY0FBSDtBQUVBLFlBQU1nQixhQUFhLEdBQUcsTUFBTS9CLFNBQVMsQ0FBQ2dDLFdBQVYsQ0FBc0I7QUFBQ0MsUUFBQUEsV0FBVyxFQUFFO0FBQWQsT0FBdEIsQ0FBNUI7O0FBQ0EsVUFBSSxDQUFDRixhQUFMLEVBQW9CO0FBQ2hCO0FBQ0EsYUFBSy9FLEtBQUwsQ0FBV2lFLFlBQVg7QUFDSDtBQUNKLEtBalVrQjtBQUdmLFNBQUt2RCxLQUFMLEdBQWE7QUFDVE4sTUFBQUEsSUFBSSxFQUFFLEtBREc7QUFFVEQsTUFBQUEsU0FBUyxFQUFFLElBRkY7QUFHVEYsTUFBQUEsUUFBUSxFQUFFO0FBQ05zRSxRQUFBQSxLQUFLLEVBQUUsS0FBS3ZFLEtBQUwsQ0FBV3VFO0FBRFosT0FIRDtBQU1UbEUsTUFBQUEsV0FBVyxFQUFFaUUsT0FBTyxDQUFDLEtBQUt0RSxLQUFMLENBQVdTLFNBQVosQ0FOWDtBQU9UeUUsTUFBQUEsS0FBSyxFQUFFLElBUEU7QUFRVHJDLE1BQUFBLGlCQUFpQixFQUFFLEtBUlY7QUFTVHNDLE1BQUFBLGFBQWEsRUFBRSxJQVROO0FBVVRDLE1BQUFBLGtCQUFrQixFQUFFLEtBVlg7QUFXVEMsTUFBQUEsZUFBZSxFQUFFO0FBWFIsS0FBYjtBQWNBLFVBQU07QUFBQ0MsTUFBQUEsS0FBRDtBQUFRQyxNQUFBQTtBQUFSLFFBQWlCLEtBQUt2RixLQUFMLENBQVdtRSxZQUFsQztBQUNBLFNBQUtxQixVQUFMLEdBQWtCLElBQUlDLGNBQUosQ0FBVUgsS0FBVixFQUFpQkMsS0FBakIsRUFBd0IsSUFBeEIsRUFBOEI7QUFDNUNaLE1BQUFBLHdCQUF3QixFQUFFLHFCQURrQixDQUNLOztBQURMLEtBQTlCLENBQWxCO0FBR0g7O0FBRURlLEVBQUFBLGlCQUFpQixHQUFHO0FBQ2hCLFNBQUt4QixhQUFMLENBQW1CLEtBQUtsRSxLQUFMLENBQVdtRSxZQUE5QjtBQUNILEdBNUJxRSxDQThCdEU7QUFDQTs7O0FBQ0F3QixFQUFBQSxnQ0FBZ0MsQ0FBQ0MsUUFBRCxFQUFXO0FBQ3ZDLFFBQUlBLFFBQVEsQ0FBQ3pCLFlBQVQsQ0FBc0JtQixLQUF0QixLQUFnQyxLQUFLdEYsS0FBTCxDQUFXbUUsWUFBWCxDQUF3Qm1CLEtBQXhELElBQ0FNLFFBQVEsQ0FBQ3pCLFlBQVQsQ0FBc0JvQixLQUF0QixLQUFnQyxLQUFLdkYsS0FBTCxDQUFXbUUsWUFBWCxDQUF3Qm9CLEtBRDVELEVBQ21FO0FBRW5FLFNBQUtyQixhQUFMLENBQW1CMEIsUUFBUSxDQUFDekIsWUFBNUI7QUFDSDs7QUFFRCxRQUFjRCxhQUFkLENBQTRCQztBQUE1QjtBQUFBLElBQWlFO0FBQzdELFNBQUtqRSxRQUFMLENBQWM7QUFDVkMsTUFBQUEsU0FBUyxFQUFFLElBREQ7QUFFVmtGLE1BQUFBLGVBQWUsRUFBRSxJQUZQO0FBR1ZELE1BQUFBLGtCQUFrQixFQUFFLEtBSFY7QUFJVjtBQUNBO0FBQ0FoRixNQUFBQSxJQUFJLEVBQUU7QUFOSSxLQUFkLEVBRDZELENBVTdEOztBQUNBLFFBQUk7QUFDQSxZQUFNeUYsNEJBQW1CQyxrQ0FBbkIsQ0FDRjNCLFlBQVksQ0FBQ21CLEtBRFgsRUFFRm5CLFlBQVksQ0FBQ29CLEtBRlgsQ0FBTjtBQUlBLFdBQUtyRixRQUFMLENBQWM7QUFDVmlGLFFBQUFBLGFBQWEsRUFBRSxJQURMO0FBRVZDLFFBQUFBLGtCQUFrQixFQUFFO0FBRlYsT0FBZDtBQUlILEtBVEQsQ0FTRSxPQUFPVyxDQUFQLEVBQVU7QUFDUixXQUFLN0YsUUFBTDtBQUNJRSxRQUFBQSxJQUFJLEVBQUU7QUFEVixTQUVPeUYsNEJBQW1CRywwQkFBbkIsQ0FBOENELENBQTlDLEVBQWlELFVBQWpELENBRlA7O0FBSUEsVUFBSSxLQUFLckYsS0FBTCxDQUFXMEUsa0JBQWYsRUFBbUM7QUFDL0IsZUFEK0IsQ0FDdkI7QUFDWDtBQUNKOztBQUVELFVBQU07QUFBQ0UsTUFBQUEsS0FBRDtBQUFRQyxNQUFBQTtBQUFSLFFBQWlCcEIsWUFBdkI7O0FBQ0EsVUFBTThCLEdBQUcsR0FBR0MscUJBQU9DLFlBQVAsQ0FBb0I7QUFDNUJDLE1BQUFBLE9BQU8sRUFBRWQsS0FEbUI7QUFFNUJlLE1BQUFBLFNBQVMsRUFBRWQ7QUFGaUIsS0FBcEIsQ0FBWjs7QUFLQSxTQUFLQyxVQUFMLENBQWdCYyxnQkFBaEIsQ0FBaUNoQixLQUFqQztBQUNBLFNBQUtFLFVBQUwsQ0FBZ0JlLG9CQUFoQixDQUFxQ2hCLEtBQXJDO0FBRUEsUUFBSWlCO0FBQWlCO0FBQXJCOztBQUNBLFFBQUk7QUFDQSxZQUFNQyxVQUFVLEdBQUcsTUFBTSxLQUFLakIsVUFBTCxDQUFnQmtCLFFBQWhCLEVBQXpCO0FBQ0FGLE1BQUFBLE9BQU8sR0FBR0MsVUFBVSxDQUFDRSxJQUFYLENBQWdCQyxDQUFDLElBQUlBLENBQUMsQ0FBQ0MsSUFBRixLQUFXLGFBQVgsSUFBNEJELENBQUMsQ0FBQ0MsSUFBRixLQUFXLGFBQTVELENBQVY7QUFDSCxLQUhELENBR0UsT0FBT2QsQ0FBUCxFQUFVO0FBQ1I1QyxNQUFBQSxPQUFPLENBQUMyRCxLQUFSLENBQWMsb0RBQWQsRUFBb0VmLENBQXBFO0FBQ0g7O0FBRUQsU0FBSzdGLFFBQUwsQ0FBYztBQUNWUyxNQUFBQSxZQUFZLEVBQUVzRixHQURKO0FBRVZPLE1BQUFBLE9BRlU7QUFHVnBHLE1BQUFBLElBQUksRUFBRTtBQUhJLEtBQWQ7O0FBS0EsVUFBTTJHLGdCQUFnQixHQUFJaEIsQ0FBRCxJQUFPO0FBQzVCLFdBQUs3RixRQUFMLENBQWM7QUFDVkMsUUFBQUEsU0FBUyxFQUFFLHlCQUFHLHFEQUFILENBREQ7QUFFVjtBQUNBK0UsUUFBQUEsS0FBSyxFQUFFO0FBSEcsT0FBZDtBQUtILEtBTkQ7O0FBT0EsUUFBSTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQUksQ0FBQyxLQUFLeEUsS0FBTCxDQUFXTCxXQUFoQixFQUE2QjtBQUN6QixjQUFNLEtBQUsyRyxtQkFBTCxDQUF5QixJQUF6QixDQUFOLENBRHlCLENBRXpCOztBQUNBN0QsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksc0RBQVo7QUFDSDtBQUNKLEtBVEQsQ0FTRSxPQUFPMkMsQ0FBUCxFQUFVO0FBQ1IsVUFBSUEsQ0FBQyxDQUFDa0IsVUFBRixLQUFpQixHQUFyQixFQUEwQjtBQUN0QixhQUFLL0csUUFBTCxDQUFjO0FBQ1ZnRixVQUFBQSxLQUFLLEVBQUVhLENBQUMsQ0FBQ25FLElBQUYsQ0FBT3NEO0FBREosU0FBZDtBQUdILE9BSkQsTUFJTyxJQUFJYSxDQUFDLENBQUNrQixVQUFGLEtBQWlCLEdBQWpCLElBQXdCbEIsQ0FBQyxDQUFDckUsT0FBRixLQUFjLFdBQTFDLEVBQXVEO0FBQzFEO0FBQ0E7QUFDQTtBQUNBLFlBQUk4RSxPQUFKLEVBQWE7QUFDVDtBQUNBVSw4QkFBSUMsUUFBSixDQUFhO0FBQUNDLFlBQUFBLE1BQU0sRUFBRTtBQUFULFdBQWI7QUFDSCxTQUhELE1BR087QUFDSCxlQUFLbEgsUUFBTCxDQUFjO0FBQ1ZrRixZQUFBQSxrQkFBa0IsRUFBRSxJQURWO0FBQ2dCO0FBQzFCakYsWUFBQUEsU0FBUyxFQUFFLHlCQUFHLG9EQUFILENBRkQ7QUFHVjtBQUNBK0UsWUFBQUEsS0FBSyxFQUFFO0FBSkcsV0FBZDtBQU1IO0FBQ0osT0FmTSxNQWVBO0FBQ0gvQixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxxREFBWixFQUFtRTJDLENBQW5FO0FBQ0FnQixRQUFBQSxnQkFBZ0IsQ0FBQ2hCLENBQUQsQ0FBaEI7QUFDSDtBQUNKO0FBQ0o7O0FBOEdPbEMsRUFBQUEsWUFBUixHQUF1QjtBQUNuQixRQUFJLENBQUMsS0FBSzdELEtBQUwsQ0FBV3FILEtBQWhCLEVBQXVCO0FBQ25CLGFBQU9DLE9BQU8sQ0FBQ0MsT0FBUixFQUFQO0FBQ0g7O0FBQ0QsVUFBTTVHLFlBQVksR0FBRzRCLGlDQUFnQmlGLEdBQWhCLEVBQXJCOztBQUNBLFdBQU83RyxZQUFZLENBQUM4RyxVQUFiLEdBQTBCQyxJQUExQixDQUFnQ0MsSUFBRCxJQUFRO0FBQzFDLFlBQU1DLE9BQU8sR0FBR0QsSUFBSSxDQUFDQyxPQUFyQjs7QUFDQSxXQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdELE9BQU8sQ0FBQ0UsTUFBNUIsRUFBb0MsRUFBRUQsQ0FBdEMsRUFBeUM7QUFDckMsWUFBSUQsT0FBTyxDQUFDQyxDQUFELENBQVAsQ0FBV0UsSUFBWCxLQUFvQixPQUF4QixFQUFpQztBQUM3QixnQkFBTUMsV0FBVyxHQUFHSixPQUFPLENBQUNDLENBQUQsQ0FBM0I7QUFDQUcsVUFBQUEsV0FBVyxDQUFDcEcsSUFBWixHQUFtQjtBQUFFeUYsWUFBQUEsS0FBSyxFQUFFLEtBQUtySCxLQUFMLENBQVdxSDtBQUFwQixXQUFuQjtBQUNBMUcsVUFBQUEsWUFBWSxDQUFDc0gsU0FBYixDQUF1QkQsV0FBdkIsRUFBb0NOLElBQXBDLENBQXlDLE1BQU07QUFDM0N2RSxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSwyQkFBMkIsS0FBS3BELEtBQUwsQ0FBV3FILEtBQWxEO0FBQ0gsV0FGRCxFQUVJUCxLQUFELElBQVc7QUFDVjNELFlBQUFBLE9BQU8sQ0FBQzJELEtBQVIsQ0FBYyxrQ0FBa0NBLEtBQWhEO0FBQ0gsV0FKRDtBQUtIO0FBQ0o7QUFDSixLQWJNLEVBYUhBLEtBQUQsSUFBVztBQUNWM0QsTUFBQUEsT0FBTyxDQUFDMkQsS0FBUixDQUFjLDJCQUEyQkEsS0FBekM7QUFDSCxLQWZNLENBQVA7QUFnQkg7O0FBMENPb0IsRUFBQUEsZUFBUixHQUEwQjtBQUN0QixXQUFPO0FBQ0g1SCxNQUFBQSxZQUFZLEVBQUUsS0FBS0ksS0FBTCxDQUFXVCxRQUFYLENBQW9Cc0UsS0FEL0I7QUFFSDRELE1BQUFBLFlBQVksRUFBRSxLQUFLekgsS0FBTCxDQUFXVCxRQUFYLENBQW9Ca0ksWUFGL0I7QUFHSEMsTUFBQUEsV0FBVyxFQUFFLEtBQUsxSCxLQUFMLENBQVdULFFBQVgsQ0FBb0JtSTtBQUg5QixLQUFQO0FBS0gsR0F2VHFFLENBeVR0RTtBQUNBO0FBQ0E7OztBQVdRQyxFQUFBQSx1QkFBUixHQUFrQztBQUM5QixVQUFNQyxlQUFlLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw0QkFBakIsQ0FBeEI7QUFDQSxVQUFNQyxPQUFPLEdBQUdGLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixrQkFBakIsQ0FBaEI7QUFDQSxVQUFNRSxnQkFBZ0IsR0FBR0gsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHVCQUFqQixDQUF6Qjs7QUFFQSxRQUFJLEtBQUs5SCxLQUFMLENBQVdDLFlBQVgsSUFBMkIsS0FBS0QsS0FBTCxDQUFXTCxXQUExQyxFQUF1RDtBQUNuRCwwQkFBTyw2QkFBQyxlQUFEO0FBQ0gsUUFBQSxZQUFZLEVBQUUsS0FBS0ssS0FBTCxDQUFXQyxZQUR0QjtBQUVILFFBQUEsV0FBVyxFQUFFLEtBQUtxRyxtQkFGZjtBQUdILFFBQUEsY0FBYyxFQUFFLEtBQUsyQixnQkFIbEI7QUFJSCxRQUFBLE1BQU0sRUFBRSxLQUFLVCxlQUFMLEVBSkw7QUFLSCxRQUFBLGlCQUFpQixFQUFFLEtBQUtVLGlCQUxyQjtBQU1ILFFBQUEsU0FBUyxFQUFFLEtBQUs1SSxLQUFMLENBQVdTLFNBTm5CO0FBT0gsUUFBQSxZQUFZLEVBQUUsS0FBS1QsS0FBTCxDQUFXTyxZQVB0QjtBQVFILFFBQUEsUUFBUSxFQUFFLEtBQUtQLEtBQUwsQ0FBVzZJLEtBUmxCO0FBU0gsUUFBQSxJQUFJLEVBQUU7QUFUSCxRQUFQO0FBV0gsS0FaRCxNQVlPLElBQUksQ0FBQyxLQUFLbkksS0FBTCxDQUFXQyxZQUFaLElBQTRCLENBQUMsS0FBS0QsS0FBTCxDQUFXTixJQUE1QyxFQUFrRDtBQUNyRCxhQUFPLElBQVA7QUFDSCxLQUZNLE1BRUEsSUFBSSxLQUFLTSxLQUFMLENBQVdOLElBQVgsSUFBbUIsQ0FBQyxLQUFLTSxLQUFMLENBQVd3RSxLQUFuQyxFQUEwQztBQUM3QywwQkFBTztBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0gsNkJBQUMsT0FBRCxPQURHLENBQVA7QUFHSCxLQUpNLE1BSUEsSUFBSSxLQUFLeEUsS0FBTCxDQUFXd0UsS0FBWCxDQUFpQjRDLE1BQXJCLEVBQTZCO0FBQ2hDLFVBQUlnQixVQUFKOztBQUNBLFVBQUksS0FBS3BJLEtBQUwsQ0FBVzhGLE9BQWYsRUFBd0I7QUFDcEIsWUFBSXVDLG1CQUFKO0FBQ0EsY0FBTUMsU0FBUyxHQUFHLEtBQUt0SSxLQUFMLENBQVc4RixPQUFYLENBQW1CLHVDQUFuQixLQUErRCxFQUFqRixDQUZvQixDQUdwQjs7QUFDQSxZQUFJd0MsU0FBUyxDQUFDbEIsTUFBVixHQUFtQixDQUF2QixFQUEwQjtBQUN0QjtBQUNBaUIsVUFBQUEsbUJBQW1CLGdCQUFHO0FBQUksWUFBQSxTQUFTLEVBQUM7QUFBZCxhQUNoQix5QkFBRyw4QkFBSCxFQUFtQztBQUFFRSxZQUFBQSxVQUFVLEVBQUU7QUFBZCxXQUFuQyxFQUF1REMsSUFBdkQsRUFEZ0IsQ0FBdEI7QUFHSCxTQVRtQixDQVdwQjs7O0FBQ0FKLFFBQUFBLFVBQVUsZ0JBQUcsNkJBQUMsY0FBRCxDQUFPLFFBQVAsUUFDUEMsbUJBRE8sZUFFVCw2QkFBQyxtQkFBRDtBQUNJLFVBQUEsWUFBWSxFQUFFLEtBQUt2RCxVQUFMLENBQWdCMkQscUJBQWhCLEVBRGxCO0FBRUksVUFBQSxJQUFJLEVBQUUsS0FBS3pJLEtBQUwsQ0FBVzhGLE9BRnJCO0FBR0ksVUFBQSxTQUFTLEVBQUUsS0FBSzlGLEtBQUwsQ0FBVzhGLE9BQVgsQ0FBbUJLLElBQW5CLEtBQTRCLGFBQTVCLEdBQTRDLEtBQTVDLEdBQW9ELEtBSG5FO0FBSUksVUFBQSxrQkFBa0IsRUFBRSxLQUFLN0csS0FBTCxDQUFXb0o7QUFKbkMsVUFGUyxlQVFUO0FBQUksVUFBQSxTQUFTLEVBQUM7QUFBZCxXQUNNLHlCQUFHLHdDQUFILEVBQTZDO0FBQUVILFVBQUFBLFVBQVUsRUFBRSxFQUFkO0FBQWtCSSxVQUFBQSxnQkFBZ0IsRUFBRTtBQUFwQyxTQUE3QyxFQUFzRkgsSUFBdEYsRUFETixDQVJTLENBQWI7QUFZSDs7QUFFRCwwQkFBTyw2QkFBQyxjQUFELENBQU8sUUFBUCxRQUNESixVQURDLGVBRUgsNkJBQUMsZ0JBQUQ7QUFDSSxRQUFBLGVBQWUsRUFBRSxLQUFLcEksS0FBTCxDQUFXVCxRQUFYLENBQW9Cd0UsUUFEekM7QUFFSSxRQUFBLFlBQVksRUFBRSxLQUFLL0QsS0FBTCxDQUFXVCxRQUFYLENBQW9Cc0UsS0FGdEM7QUFHSSxRQUFBLG1CQUFtQixFQUFFLEtBQUs3RCxLQUFMLENBQVdULFFBQVgsQ0FBb0JrSSxZQUg3QztBQUlJLFFBQUEsa0JBQWtCLEVBQUUsS0FBS3pILEtBQUwsQ0FBV1QsUUFBWCxDQUFvQm1JLFdBSjVDO0FBS0ksUUFBQSxlQUFlLEVBQUUsS0FBSzFILEtBQUwsQ0FBV1QsUUFBWCxDQUFvQjJELFFBTHpDO0FBTUksUUFBQSxlQUFlLEVBQUUsS0FBSzBGLFlBTjFCO0FBT0ksUUFBQSxLQUFLLEVBQUUsS0FBSzVJLEtBQUwsQ0FBV3dFLEtBUHRCO0FBUUksUUFBQSxZQUFZLEVBQUUsS0FBS2xGLEtBQUwsQ0FBV21FLFlBUjdCO0FBU0ksUUFBQSxTQUFTLEVBQUUsQ0FBQyxLQUFLekQsS0FBTCxDQUFXMEU7QUFUM0IsUUFGRyxDQUFQO0FBY0g7QUFDSjs7QUFFRG1FLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLFVBQVUsR0FBR2pCLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixpQkFBakIsQ0FBbkI7QUFDQSxVQUFNaUIsUUFBUSxHQUFHbEIsR0FBRyxDQUFDQyxZQUFKLENBQWlCLGVBQWpCLENBQWpCO0FBQ0EsVUFBTWtCLGdCQUFnQixHQUFHbkIsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDJCQUFqQixDQUF6QjtBQUVBLFFBQUlySSxTQUFKO0FBQ0EsVUFBTXdKLEdBQUcsR0FBRyxLQUFLakosS0FBTCxDQUFXUCxTQUF2Qjs7QUFDQSxRQUFJd0osR0FBSixFQUFTO0FBQ0x4SixNQUFBQSxTQUFTLGdCQUFHO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUFrQ3dKLEdBQWxDLENBQVo7QUFDSDs7QUFFRCxRQUFJQyxpQkFBSjs7QUFDQSxRQUFJLENBQUMsS0FBS2xKLEtBQUwsQ0FBV3lFLGFBQWhCLEVBQStCO0FBQzNCLFlBQU0wRSxPQUFPLEdBQUcseUJBQVc7QUFDdkIsMEJBQWtCLElBREs7QUFFdkIsZ0NBQXdCLElBRkQ7QUFHdkIsd0NBQWdDLENBQUMsS0FBS25KLEtBQUwsQ0FBVzBFO0FBSHJCLE9BQVgsQ0FBaEI7QUFLQXdFLE1BQUFBLGlCQUFpQixnQkFDYjtBQUFLLFFBQUEsU0FBUyxFQUFFQztBQUFoQixTQUNLLEtBQUtuSixLQUFMLENBQVcyRSxlQURoQixDQURKO0FBS0g7O0FBRUQsVUFBTXlFLE1BQU0sZ0JBQUc7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixPQUNWLHlCQUFHLDhDQUFILEVBQW1ELEVBQW5ELEVBQXVEO0FBQ3BEQyxNQUFBQSxDQUFDLEVBQUVDLEdBQUcsaUJBQUk7QUFBRyxRQUFBLE9BQU8sRUFBRSxLQUFLL0YsWUFBakI7QUFBK0IsUUFBQSxJQUFJLEVBQUM7QUFBcEMsU0FBMEMrRixHQUExQztBQUQwQyxLQUF2RCxDQURVLENBQWYsQ0F6QkssQ0ErQkw7OztBQUNBLFFBQUlDLE1BQUo7O0FBQ0EsUUFBSSxLQUFLdkosS0FBTCxDQUFXTCxXQUFmLEVBQTRCO0FBQ3hCNEosTUFBQUEsTUFBTSxnQkFBRztBQUFHLFFBQUEsU0FBUyxFQUFDLHdCQUFiO0FBQXNDLFFBQUEsT0FBTyxFQUFFLEtBQUtDLGlCQUFwRDtBQUF1RSxRQUFBLElBQUksRUFBQztBQUE1RSxTQUNILHlCQUFHLFNBQUgsQ0FERyxDQUFUO0FBR0g7O0FBRUQsUUFBSUMsSUFBSjs7QUFDQSxRQUFJLEtBQUt6SixLQUFMLENBQVdtQyxpQkFBZixFQUFrQztBQUM5QixVQUFJdUgsV0FBSjs7QUFDQSxVQUFJLEtBQUsxSixLQUFMLENBQVdrQyx1QkFBZixFQUF3QztBQUNwQ3dILFFBQUFBLFdBQVcsZ0JBQUcsdURBQ1Ysd0NBQUkseUJBQ0EsMkVBQ0EsdURBRkEsRUFFeUQ7QUFDckRDLFVBQUFBLFlBQVksRUFBRSxLQUFLM0osS0FBTCxDQUFXaUMsa0JBRDRCO0FBRXJEMkgsVUFBQUEsY0FBYyxFQUFFLEtBQUs1SixLQUFMLENBQVdrQztBQUYwQixTQUZ6RCxDQUFKLENBRFUsZUFRVixxREFBRyw2QkFBQyxnQkFBRDtBQUFrQixVQUFBLE9BQU8sRUFBQyxNQUExQjtBQUFpQyxVQUFBLFNBQVMsRUFBQyxlQUEzQztBQUEyRCxVQUFBLE9BQU8sRUFBRSxLQUFLMkg7QUFBekUsV0FDRSx5QkFBRyxnQ0FBSCxDQURGLENBQUgsQ0FSVSxDQUFkO0FBWUgsT0FiRCxNQWFPLElBQUksS0FBSzdKLEtBQUwsQ0FBV1QsUUFBWCxDQUFvQjJELFFBQXhCLEVBQWtDO0FBQ3JDO0FBQ0F3RyxRQUFBQSxXQUFXLGdCQUFHLHlDQUFLLHlCQUNmLG9DQURlLEVBQ3VCLEVBRHZCLEVBRWY7QUFDSUwsVUFBQUEsQ0FBQyxFQUFHQyxHQUFELGlCQUFTO0FBQUcsWUFBQSxJQUFJLEVBQUMsU0FBUjtBQUFrQixZQUFBLE9BQU8sRUFBRSxLQUFLTztBQUFoQyxhQUF3RFAsR0FBeEQ7QUFEaEIsU0FGZSxDQUFMLENBQWQ7QUFNSCxPQVJNLE1BUUE7QUFDSDtBQUNBO0FBQ0E7QUFDQUksUUFBQUEsV0FBVyxnQkFBRyx5Q0FBSyx5QkFDZixxRUFEZSxFQUN3RCxFQUR4RCxFQUVmO0FBQ0lMLFVBQUFBLENBQUMsRUFBR0MsR0FBRCxpQkFBUztBQUFHLFlBQUEsSUFBSSxFQUFDLFNBQVI7QUFBa0IsWUFBQSxPQUFPLEVBQUUsS0FBS087QUFBaEMsYUFBd0RQLEdBQXhEO0FBRGhCLFNBRmUsQ0FBTCxDQUFkO0FBTUg7O0FBQ0RHLE1BQUFBLElBQUksZ0JBQUcsdURBQ0gseUNBQUsseUJBQUcseUJBQUgsQ0FBTCxDQURHLEVBRURDLFdBRkMsQ0FBUDtBQUlILEtBdENELE1Bc0NPO0FBQ0hELE1BQUFBLElBQUksZ0JBQUcsdURBQ0gseUNBQU0seUJBQUcsZ0JBQUgsQ0FBTixDQURHLEVBRURoSyxTQUZDLEVBR0R5SixpQkFIQyxlQUlILDZCQUFDLHFCQUFEO0FBQ0ksUUFBQSxLQUFLLEVBQUUseUJBQUcsaUJBQUgsQ0FEWDtBQUVJLFFBQUEsV0FBVyxFQUFFLHlCQUFHLHFDQUFILENBRmpCO0FBR0ksUUFBQSxZQUFZLEVBQUUsS0FBSzVKLEtBQUwsQ0FBV21FLFlBSDdCO0FBSUksUUFBQSxvQkFBb0IsRUFBRSxLQUFLekQsS0FBTCxDQUFXTCxXQUFYLEdBQXlCdUUsU0FBekIsR0FBcUMsS0FBSzVFLEtBQUwsQ0FBV3dLO0FBSjFFLFFBSkcsRUFVRCxLQUFLbkMsdUJBQUwsRUFWQyxFQVdENEIsTUFYQyxFQVlESCxNQVpDLENBQVA7QUFjSDs7QUFFRCx3QkFDSSw2QkFBQyxpQkFBRCxxQkFDSSw2QkFBQyxVQUFELE9BREosZUFFSSw2QkFBQyxRQUFELFFBQ01LLElBRE4sQ0FGSixDQURKO0FBUUg7O0FBamZxRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiwgMjAxNywgMjAxOCwgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBNYXRyaXggZnJvbSAnbWF0cml4LWpzLXNkayc7XG5pbXBvcnQgUmVhY3QsIHtSZWFjdE5vZGV9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7TWF0cml4Q2xpZW50fSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5cbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IG1lc3NhZ2VGb3JSZXNvdXJjZUxpbWl0RXJyb3IgfSBmcm9tICcuLi8uLi8uLi91dGlscy9FcnJvclV0aWxzJztcbmltcG9ydCBBdXRvRGlzY292ZXJ5VXRpbHMsIHtWYWxpZGF0ZWRTZXJ2ZXJDb25maWd9IGZyb20gXCIuLi8uLi8uLi91dGlscy9BdXRvRGlzY292ZXJ5VXRpbHNcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgKiBhcyBMaWZlY3ljbGUgZnJvbSAnLi4vLi4vLi4vTGlmZWN5Y2xlJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgQXV0aFBhZ2UgZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvQXV0aFBhZ2VcIjtcbmltcG9ydCBMb2dpbiwge0lTU09GbG93fSBmcm9tIFwiLi4vLi4vLi4vTG9naW5cIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IFNTT0J1dHRvbnMgZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL1NTT0J1dHRvbnNcIjtcbmltcG9ydCBTZXJ2ZXJQaWNrZXIgZnJvbSAnLi4vLi4vdmlld3MvZWxlbWVudHMvU2VydmVyUGlja2VyJztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgc2VydmVyQ29uZmlnOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWc7XG4gICAgZGVmYXVsdERldmljZURpc3BsYXlOYW1lOiBzdHJpbmc7XG4gICAgZW1haWw/OiBzdHJpbmc7XG4gICAgYnJhbmQ/OiBzdHJpbmc7XG4gICAgY2xpZW50U2VjcmV0Pzogc3RyaW5nO1xuICAgIHNlc3Npb25JZD86IHN0cmluZztcbiAgICBpZFNpZD86IHN0cmluZztcbiAgICBmcmFnbWVudEFmdGVyTG9naW4/OiBzdHJpbmc7XG5cbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBoYXMgbG9nZ2VkIGluLiBQYXJhbXM6XG4gICAgLy8gLSBvYmplY3Qgd2l0aCB1c2VySWQsIGRldmljZUlkLCBob21lc2VydmVyVXJsLCBpZGVudGl0eVNlcnZlclVybCwgYWNjZXNzVG9rZW5cbiAgICAvLyAtIFRoZSB1c2VyJ3MgcGFzc3dvcmQsIGlmIGF2YWlsYWJsZSBhbmQgYXBwbGljYWJsZSAobWF5IGJlIGNhY2hlZCBpbiBtZW1vcnlcbiAgICAvLyAgIGZvciBhIHNob3J0IHRpbWUgc28gdGhlIHVzZXIgaXMgbm90IHJlcXVpcmVkIHRvIHJlLWVudGVyIHRoZWlyIHBhc3N3b3JkXG4gICAgLy8gICBmb3Igb3BlcmF0aW9ucyBsaWtlIHVwbG9hZGluZyBjcm9zcy1zaWduaW5nIGtleXMpLlxuICAgIG9uTG9nZ2VkSW4ocGFyYW1zOiB7XG4gICAgICAgIHVzZXJJZDogc3RyaW5nO1xuICAgICAgICBkZXZpY2VJZDogc3RyaW5nXG4gICAgICAgIGhvbWVzZXJ2ZXJVcmw6IHN0cmluZztcbiAgICAgICAgaWRlbnRpdHlTZXJ2ZXJVcmw/OiBzdHJpbmc7XG4gICAgICAgIGFjY2Vzc1Rva2VuOiBzdHJpbmc7XG4gICAgfSwgcGFzc3dvcmQ6IHN0cmluZyk6IHZvaWQ7XG4gICAgbWFrZVJlZ2lzdHJhdGlvblVybChwYXJhbXM6IHtcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG4gICAgICAgIGNsaWVudF9zZWNyZXQ6IHN0cmluZztcbiAgICAgICAgaHNfdXJsOiBzdHJpbmc7XG4gICAgICAgIGlzX3VybD86IHN0cmluZztcbiAgICAgICAgc2Vzc2lvbl9pZDogc3RyaW5nO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGNhbWVsY2FzZSAqL1xuICAgIH0pOiB2b2lkO1xuICAgIC8vIHJlZ2lzdHJhdGlvbiBzaG91bGRuJ3Qga25vdyBvciBjYXJlIGhvdyBsb2dpbiBpcyBkb25lLlxuICAgIG9uTG9naW5DbGljaygpOiB2b2lkO1xuICAgIG9uU2VydmVyQ29uZmlnQ2hhbmdlKGNvbmZpZzogVmFsaWRhdGVkU2VydmVyQ29uZmlnKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgYnVzeTogYm9vbGVhbjtcbiAgICBlcnJvclRleHQ/OiBSZWFjdE5vZGU7XG4gICAgLy8gdHJ1ZSBpZiB3ZSdyZSB3YWl0aW5nIGZvciB0aGUgdXNlciB0byBjb21wbGV0ZVxuICAgIC8vIFdlIHJlbWVtYmVyIHRoZSB2YWx1ZXMgZW50ZXJlZCBieSB0aGUgdXNlciBiZWNhdXNlXG4gICAgLy8gdGhlIHJlZ2lzdHJhdGlvbiBmb3JtIHdpbGwgYmUgdW5tb3VudGVkIGR1cmluZyB0aGVcbiAgICAvLyBjb3Vyc2Ugb2YgcmVnaXN0cmF0aW9uLCBidXQgaWYgdGhlcmUncyBhbiBlcnJvciB3ZVxuICAgIC8vIHdhbnQgdG8gYnJpbmcgYmFjayB0aGUgcmVnaXN0cmF0aW9uIGZvcm0gd2l0aCB0aGVcbiAgICAvLyB2YWx1ZXMgdGhlIHVzZXIgZW50ZXJlZCBzdGlsbCBpbiBpdC4gV2UgY2FuIGtlZXBcbiAgICAvLyB0aGVtIGluIHRoaXMgY29tcG9uZW50J3Mgc3RhdGUgc2luY2UgdGhpcyBjb21wb25lbnRcbiAgICAvLyBwZXJzaXN0IGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIHJlZ2lzdHJhdGlvbiBwcm9jZXNzLlxuICAgIGZvcm1WYWxzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIC8vIHVzZXItaW50ZXJhY3RpdmUgYXV0aFxuICAgIC8vIElmIHdlJ3ZlIGJlZW4gZ2l2ZW4gYSBzZXNzaW9uIElELCB3ZSdyZSByZXN1bWluZ1xuICAgIC8vIHN0cmFpZ2h0IGJhY2sgaW50byBVSSBhdXRoXG4gICAgZG9pbmdVSUF1dGg6IGJvb2xlYW47XG4gICAgLy8gSWYgc2V0LCB3ZSd2ZSByZWdpc3RlcmVkIGJ1dCBhcmUgbm90IGdvaW5nIHRvIGxvZ1xuICAgIC8vIHRoZSB1c2VyIGluIHRvIHRoZWlyIG5ldyBhY2NvdW50IGF1dG9tYXRpY2FsbHkuXG4gICAgY29tcGxldGVkTm9TaWduaW46IGJvb2xlYW47XG4gICAgZmxvd3M6IHtcbiAgICAgICAgc3RhZ2VzOiBzdHJpbmdbXTtcbiAgICB9W107XG4gICAgLy8gV2UgcGVyZm9ybSBsaXZlbGluZXNzIGNoZWNrcyBsYXRlciwgYnV0IGZvciBub3cgc3VwcHJlc3MgdGhlIGVycm9ycy5cbiAgICAvLyBXZSBhbHNvIHRyYWNrIHRoZSBzZXJ2ZXIgZGVhZCBlcnJvcnMgaW5kZXBlbmRlbnRseSBvZiB0aGUgcmVndWxhciBlcnJvcnMgc29cbiAgICAvLyB0aGF0IHdlIGNhbiByZW5kZXIgaXQgZGlmZmVyZW50bHksIGFuZCBvdmVycmlkZSBhbnkgb3RoZXIgZXJyb3IgdGhlIHVzZXIgbWF5XG4gICAgLy8gYmUgc2VlaW5nLlxuICAgIHNlcnZlcklzQWxpdmU6IGJvb2xlYW47XG4gICAgc2VydmVyRXJyb3JJc0ZhdGFsOiBib29sZWFuO1xuICAgIHNlcnZlckRlYWRFcnJvcjogc3RyaW5nO1xuXG4gICAgLy8gT3VyIG1hdHJpeCBjbGllbnQgLSBwYXJ0IG9mIHN0YXRlIGJlY2F1c2Ugd2UgY2FuJ3QgcmVuZGVyIHRoZSBVSSBhdXRoXG4gICAgLy8gY29tcG9uZW50IHdpdGhvdXQgaXQuXG4gICAgbWF0cml4Q2xpZW50PzogTWF0cml4Q2xpZW50O1xuICAgIC8vIFRoZSB1c2VyIElEIHdlJ3ZlIGp1c3QgcmVnaXN0ZXJlZFxuICAgIHJlZ2lzdGVyZWRVc2VybmFtZT86IHN0cmluZztcbiAgICAvLyBpZiBhIGRpZmZlcmVudCB1c2VyIElEIHRvIHRoZSBvbmUgd2UganVzdCByZWdpc3RlcmVkIGlzIGxvZ2dlZCBpbixcbiAgICAvLyB0aGlzIGlzIHRoZSB1c2VyIElEIHRoYXQncyBsb2dnZWQgaW4uXG4gICAgZGlmZmVyZW50TG9nZ2VkSW5Vc2VySWQ/OiBzdHJpbmc7XG4gICAgLy8gdGhlIFNTTyBmbG93IGRlZmluaXRpb24sIHRoaXMgaXMgZmV0Y2hlZCBmcm9tIC9sb2dpbiBhcyB0aGF0J3MgdGhlIG9ubHlcbiAgICAvLyBwbGFjZSBpdCBpcyBleHBvc2VkLlxuICAgIHNzb0Zsb3c/OiBJU1NPRmxvdztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVnaXN0cmF0aW9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgbG9naW5Mb2dpYzogTG9naW47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3JUZXh0OiBudWxsLFxuICAgICAgICAgICAgZm9ybVZhbHM6IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5wcm9wcy5lbWFpbCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkb2luZ1VJQXV0aDogQm9vbGVhbih0aGlzLnByb3BzLnNlc3Npb25JZCksXG4gICAgICAgICAgICBmbG93czogbnVsbCxcbiAgICAgICAgICAgIGNvbXBsZXRlZE5vU2lnbmluOiBmYWxzZSxcbiAgICAgICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGZhbHNlLFxuICAgICAgICAgICAgc2VydmVyRGVhZEVycm9yOiBcIlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHtoc1VybCwgaXNVcmx9ID0gdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWc7XG4gICAgICAgIHRoaXMubG9naW5Mb2dpYyA9IG5ldyBMb2dpbihoc1VybCwgaXNVcmwsIG51bGwsIHtcbiAgICAgICAgICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZTogXCJFbGVtZW50IGxvZ2luIGNoZWNrXCIsIC8vIFdlIHNob3VsZG4ndCBldmVyIGJlIHVzZWRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMucmVwbGFjZUNsaWVudCh0aGlzLnByb3BzLnNlcnZlckNvbmZpZyk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2Ugd2l0aCBhcHByb3ByaWF0ZSBsaWZlY3ljbGUgZXZlbnRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgaWYgKG5ld1Byb3BzLnNlcnZlckNvbmZpZy5oc1VybCA9PT0gdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmwgJiZcbiAgICAgICAgICAgIG5ld1Byb3BzLnNlcnZlckNvbmZpZy5pc1VybCA9PT0gdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJlcGxhY2VDbGllbnQobmV3UHJvcHMuc2VydmVyQ29uZmlnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlcGxhY2VDbGllbnQoc2VydmVyQ29uZmlnOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWcpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlcnJvclRleHQ6IG51bGwsXG4gICAgICAgICAgICBzZXJ2ZXJEZWFkRXJyb3I6IG51bGwsXG4gICAgICAgICAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGZhbHNlLFxuICAgICAgICAgICAgLy8gYnVzeSB3aGlsZSB3ZSBkbyBsaXZlbmVzcyBjaGVjayAod2UgbmVlZCB0byBhdm9pZCB0cnlpbmcgdG8gcmVuZGVyXG4gICAgICAgICAgICAvLyB0aGUgVUkgYXV0aCBjb21wb25lbnQgd2hpbGUgd2UgZG9uJ3QgaGF2ZSBhIG1hdHJpeCBjbGllbnQpXG4gICAgICAgICAgICBidXN5OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEbyBhIGxpdmVsaW5lc3MgY2hlY2sgb24gdGhlIFVSTHNcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IEF1dG9EaXNjb3ZlcnlVdGlscy52YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzKFxuICAgICAgICAgICAgICAgIHNlcnZlckNvbmZpZy5oc1VybCxcbiAgICAgICAgICAgICAgICBzZXJ2ZXJDb25maWcuaXNVcmwsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2VydmVySXNBbGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIC4uLkF1dG9EaXNjb3ZlcnlVdGlscy5hdXRoQ29tcG9uZW50U3RhdGVGb3JFcnJvcihlLCBcInJlZ2lzdGVyXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZXJ2ZXJFcnJvcklzRmF0YWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIFNlcnZlciBpcyBkZWFkIC0gZG8gbm90IGNvbnRpbnVlLlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge2hzVXJsLCBpc1VybH0gPSBzZXJ2ZXJDb25maWc7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeC5jcmVhdGVDbGllbnQoe1xuICAgICAgICAgICAgYmFzZVVybDogaHNVcmwsXG4gICAgICAgICAgICBpZEJhc2VVcmw6IGlzVXJsLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxvZ2luTG9naWMuc2V0SG9tZXNlcnZlclVybChoc1VybCk7XG4gICAgICAgIHRoaXMubG9naW5Mb2dpYy5zZXRJZGVudGl0eVNlcnZlclVybChpc1VybCk7XG5cbiAgICAgICAgbGV0IHNzb0Zsb3c6IElTU09GbG93O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbG9naW5GbG93cyA9IGF3YWl0IHRoaXMubG9naW5Mb2dpYy5nZXRGbG93cygpO1xuICAgICAgICAgICAgc3NvRmxvdyA9IGxvZ2luRmxvd3MuZmluZChmID0+IGYudHlwZSA9PT0gXCJtLmxvZ2luLnNzb1wiIHx8IGYudHlwZSA9PT0gXCJtLmxvZ2luLmNhc1wiKSBhcyBJU1NPRmxvdztcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBnZXQgbG9naW4gZmxvd3MgdG8gY2hlY2sgZm9yIFNTTyBzdXBwb3J0XCIsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBtYXRyaXhDbGllbnQ6IGNsaSxcbiAgICAgICAgICAgIHNzb0Zsb3csXG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHNob3dHZW5lcmljRXJyb3IgPSAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIlVuYWJsZSB0byBxdWVyeSBmb3Igc3VwcG9ydGVkIHJlZ2lzdHJhdGlvbiBtZXRob2RzLlwiKSxcbiAgICAgICAgICAgICAgICAvLyBhZGQgZW1wdHkgZmxvd3MgYXJyYXkgdG8gZ2V0IHJpZCBvZiBzcGlubmVyXG4gICAgICAgICAgICAgICAgZmxvd3M6IFtdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXZSBkbyB0aGUgZmlyc3QgcmVnaXN0cmF0aW9uIHJlcXVlc3Qgb3Vyc2VsdmVzIHRvIGRpc2NvdmVyIHdoZXRoZXIgd2UgbmVlZCB0b1xuICAgICAgICAgICAgLy8gZG8gU1NPIGluc3RlYWQuIElmIHdlJ3ZlIGFscmVhZHkgc3RhcnRlZCB0aGUgVUkgQXV0aCBwcm9jZXNzIHRob3VnaCwgd2UgZG9uJ3RcbiAgICAgICAgICAgIC8vIG5lZWQgdG8uXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZG9pbmdVSUF1dGgpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1ha2VSZWdpc3RlclJlcXVlc3QobnVsbCk7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgc3VjY2VlZCBzaW5jZSB3ZSBzcGVjaWZpZWQgbm8gYXV0aCBvYmplY3QuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFeHBlY3RpbmcgNDAxIGZyb20gcmVnaXN0ZXIgcmVxdWVzdCBidXQgZ290IHN1Y2Nlc3MhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5odHRwU3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZmxvd3M6IGUuZGF0YS5mbG93cyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5odHRwU3RhdHVzID09PSA0MDMgJiYgZS5lcnJjb2RlID09PSBcIk1fVU5LTk9XTlwiKSB7XG4gICAgICAgICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCByZWdpc3RyYXRpb24gaXMgcHJldHR5IG11Y2ggZGlzYWJsZWQsIGJ1dCBiZWZvcmUgd2UgZG8gdGhhdCBsZXQnc1xuICAgICAgICAgICAgICAgIC8vIHF1aWNrbHkgY2hlY2sgdG8gc2VlIGlmIHRoZSBzZXJ2ZXIgc3VwcG9ydHMgU1NPIGluc3RlYWQuIElmIGl0IGRvZXMsIHdlJ2xsIHNlbmRcbiAgICAgICAgICAgICAgICAvLyB0aGUgdXNlciBvZmYgdG8gdGhlIGxvZ2luIHBhZ2UgdG8gZmlndXJlIHRoZWlyIGFjY291bnQgb3V0LlxuICAgICAgICAgICAgICAgIGlmIChzc29GbG93KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlZGlyZWN0IHRvIGxvZ2luIHBhZ2UgLSBzZXJ2ZXIgcHJvYmFibHkgZXhwZWN0cyBTU08gb25seVxuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3N0YXJ0X2xvZ2luJ30pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyRXJyb3JJc0ZhdGFsOiB0cnVlLCAvLyBmYXRhbCBiZWNhdXNlIHVzZXIgY2Fubm90IGNvbnRpbnVlIG9uIHRoaXMgc2VydmVyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IF90KFwiUmVnaXN0cmF0aW9uIGhhcyBiZWVuIGRpc2FibGVkIG9uIHRoaXMgaG9tZXNlcnZlci5cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgZW1wdHkgZmxvd3MgYXJyYXkgdG8gZ2V0IHJpZCBvZiBzcGlubmVyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG93czogW10sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmFibGUgdG8gcXVlcnkgZm9yIHN1cHBvcnRlZCByZWdpc3RyYXRpb24gbWV0aG9kcy5cIiwgZSk7XG4gICAgICAgICAgICAgICAgc2hvd0dlbmVyaWNFcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Gb3JtU3VibWl0ID0gZm9ybVZhbHMgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVycm9yVGV4dDogXCJcIixcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBmb3JtVmFsczogZm9ybVZhbHMsXG4gICAgICAgICAgICBkb2luZ1VJQXV0aDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVxdWVzdEVtYWlsVG9rZW4gPSAoZW1haWxBZGRyZXNzLCBjbGllbnRTZWNyZXQsIHNlbmRBdHRlbXB0LCBzZXNzaW9uSWQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUubWF0cml4Q2xpZW50LnJlcXVlc3RSZWdpc3RlckVtYWlsVG9rZW4oXG4gICAgICAgICAgICBlbWFpbEFkZHJlc3MsXG4gICAgICAgICAgICBjbGllbnRTZWNyZXQsXG4gICAgICAgICAgICBzZW5kQXR0ZW1wdCxcbiAgICAgICAgICAgIHRoaXMucHJvcHMubWFrZVJlZ2lzdHJhdGlvblVybCh7XG4gICAgICAgICAgICAgICAgY2xpZW50X3NlY3JldDogY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgICAgIGhzX3VybDogdGhpcy5zdGF0ZS5tYXRyaXhDbGllbnQuZ2V0SG9tZXNlcnZlclVybCgpLFxuICAgICAgICAgICAgICAgIGlzX3VybDogdGhpcy5zdGF0ZS5tYXRyaXhDbGllbnQuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgICAgICAgICBzZXNzaW9uX2lkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVUlBdXRoRmluaXNoZWQgPSBhc3luYyAoc3VjY2VzcywgcmVzcG9uc2UsIGV4dHJhKSA9PiB7XG4gICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgbGV0IG1zZyA9IHJlc3BvbnNlLm1lc3NhZ2UgfHwgcmVzcG9uc2UudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIC8vIGNhbiB3ZSBnaXZlIGEgYmV0dGVyIGVycm9yIG1lc3NhZ2U/XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyY29kZSA9PT0gJ01fUkVTT1VSQ0VfTElNSVRfRVhDRUVERUQnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JUb3AgPSBtZXNzYWdlRm9yUmVzb3VyY2VMaW1pdEVycm9yKFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5kYXRhLmxpbWl0X3R5cGUsXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEuYWRtaW5fY29udGFjdCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ21vbnRobHlfYWN0aXZlX3VzZXInOiBfdGQoXCJUaGlzIGhvbWVzZXJ2ZXIgaGFzIGhpdCBpdHMgTW9udGhseSBBY3RpdmUgVXNlciBsaW1pdC5cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAnJzogX3RkKFwiVGhpcyBob21lc2VydmVyIGhhcyBleGNlZWRlZCBvbmUgb2YgaXRzIHJlc291cmNlIGxpbWl0cy5cIiksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvckRldGFpbCA9IG1lc3NhZ2VGb3JSZXNvdXJjZUxpbWl0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEubGltaXRfdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuZGF0YS5hZG1pbl9jb250YWN0LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnJzogX3RkKFwiUGxlYXNlIDxhPmNvbnRhY3QgeW91ciBzZXJ2aWNlIGFkbWluaXN0cmF0b3I8L2E+IHRvIGNvbnRpbnVlIHVzaW5nIHRoaXMgc2VydmljZS5cIiksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBtc2cgPSA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8cD57ZXJyb3JUb3B9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD57ZXJyb3JEZXRhaWx9PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UucmVxdWlyZWRfc3RhZ2VzICYmIHJlc3BvbnNlLnJlcXVpcmVkX3N0YWdlcy5pbmRleE9mKCdtLmxvZ2luLm1zaXNkbicpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsZXQgbXNpc2RuQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmbG93IG9mIHJlc3BvbnNlLmF2YWlsYWJsZV9mbG93cykge1xuICAgICAgICAgICAgICAgICAgICBtc2lzZG5BdmFpbGFibGUgPSBtc2lzZG5BdmFpbGFibGUgfHwgZmxvdy5zdGFnZXMuaW5jbHVkZXMoJ20ubG9naW4ubXNpc2RuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghbXNpc2RuQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZyA9IF90KCdUaGlzIHNlcnZlciBkb2VzIG5vdCBzdXBwb3J0IGF1dGhlbnRpY2F0aW9uIHdpdGggYSBwaG9uZSBudW1iZXIuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5lcnJjb2RlID09PSBcIk1fVVNFUl9JTl9VU0VcIikge1xuICAgICAgICAgICAgICAgIG1zZyA9IF90KFwiVGhhdCB1c2VybmFtZSBhbHJlYWR5IGV4aXN0cywgcGxlYXNlIHRyeSBhbm90aGVyLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvaW5nVUlBdXRoOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IG1zZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLnNldEp1c3RSZWdpc3RlcmVkVXNlcklkKHJlc3BvbnNlLnVzZXJfaWQpO1xuXG4gICAgICAgIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgICAgICAgICAgZG9pbmdVSUF1dGg6IGZhbHNlLFxuICAgICAgICAgICAgcmVnaXN0ZXJlZFVzZXJuYW1lOiByZXNwb25zZS51c2VyX2lkLFxuICAgICAgICAgICAgZGlmZmVyZW50TG9nZ2VkSW5Vc2VySWQ6IG51bGwsXG4gICAgICAgICAgICBjb21wbGV0ZWROb1NpZ25pbjogZmFsc2UsXG4gICAgICAgICAgICAvLyB3ZSdyZSBzdGlsbCBidXN5IHVudGlsIHdlIGdldCB1bm1vdW50ZWQ6IGRvbid0IHNob3cgdGhlIHJlZ2lzdHJhdGlvbiBmb3JtIGFnYWluXG4gICAgICAgICAgICBidXN5OiB0cnVlLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRoZSB1c2VyIGNhbWUgaW4gdGhyb3VnaCBhbiBlbWFpbCB2YWxpZGF0aW9uIGxpbmsuIFRvIGF2b2lkIG92ZXJ3cml0aW5nXG4gICAgICAgIC8vIHRoZWlyIHNlc3Npb24sIGNoZWNrIHRvIG1ha2Ugc3VyZSB0aGUgc2Vzc2lvbiBpc24ndCBzb21lb25lIGVsc2UsIGFuZFxuICAgICAgICAvLyBpc24ndCBhIGd1ZXN0IHVzZXIgc2luY2Ugd2UnbGwgdXN1YWxseSBoYXZlIHNldCBhIGd1ZXN0IHVzZXIgc2Vzc2lvbiBiZWZvcmVcbiAgICAgICAgLy8gc3RhcnRpbmcgdGhlIHJlZ2lzdHJhdGlvbiBwcm9jZXNzLiBUaGlzIGlzbid0IHBlcmZlY3Qgc2luY2UgaXQncyBwb3NzaWJsZVxuICAgICAgICAvLyB0aGUgdXNlciBoYWQgYSBzZXBhcmF0ZSBndWVzdCBzZXNzaW9uIHRoZXkgZGlkbid0IGFjdHVhbGx5IG1lYW4gdG8gcmVwbGFjZS5cbiAgICAgICAgY29uc3QgW3Nlc3Npb25Pd25lciwgc2Vzc2lvbklzR3Vlc3RdID0gYXdhaXQgTGlmZWN5Y2xlLmdldFN0b3JlZFNlc3Npb25Pd25lcigpO1xuICAgICAgICBpZiAoc2Vzc2lvbk93bmVyICYmICFzZXNzaW9uSXNHdWVzdCAmJiBzZXNzaW9uT3duZXIgIT09IHJlc3BvbnNlLnVzZXJJZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgYEZvdW5kIGEgc2Vzc2lvbiBmb3IgJHtzZXNzaW9uT3duZXJ9IGJ1dCAke3Jlc3BvbnNlLnVzZXJJZH0gaGFzIGp1c3QgcmVnaXN0ZXJlZC5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG5ld1N0YXRlLmRpZmZlcmVudExvZ2dlZEluVXNlcklkID0gc2Vzc2lvbk93bmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wcm9wcy5vbkxvZ2dlZEluKHtcbiAgICAgICAgICAgICAgICB1c2VySWQ6IHJlc3BvbnNlLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgZGV2aWNlSWQ6IHJlc3BvbnNlLmRldmljZV9pZCxcbiAgICAgICAgICAgICAgICBob21lc2VydmVyVXJsOiB0aGlzLnN0YXRlLm1hdHJpeENsaWVudC5nZXRIb21lc2VydmVyVXJsKCksXG4gICAgICAgICAgICAgICAgaWRlbnRpdHlTZXJ2ZXJVcmw6IHRoaXMuc3RhdGUubWF0cml4Q2xpZW50LmdldElkZW50aXR5U2VydmVyVXJsKCksXG4gICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IHJlc3BvbnNlLmFjY2Vzc190b2tlbixcbiAgICAgICAgICAgIH0sIHRoaXMuc3RhdGUuZm9ybVZhbHMucGFzc3dvcmQpO1xuXG4gICAgICAgICAgICB0aGlzLnNldHVwUHVzaGVycygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3U3RhdGUuYnVzeSA9IGZhbHNlO1xuICAgICAgICAgICAgbmV3U3RhdGUuY29tcGxldGVkTm9TaWduaW4gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2V0dXBQdXNoZXJzKCkge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuYnJhbmQpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXRyaXhDbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIHJldHVybiBtYXRyaXhDbGllbnQuZ2V0UHVzaGVycygpLnRoZW4oKHJlc3ApPT57XG4gICAgICAgICAgICBjb25zdCBwdXNoZXJzID0gcmVzcC5wdXNoZXJzO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwdXNoZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHB1c2hlcnNbaV0ua2luZCA9PT0gJ2VtYWlsJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbWFpbFB1c2hlciA9IHB1c2hlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsUHVzaGVyLmRhdGEgPSB7IGJyYW5kOiB0aGlzLnByb3BzLmJyYW5kIH07XG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudC5zZXRQdXNoZXIoZW1haWxQdXNoZXIpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTZXQgZW1haWwgYnJhbmRpbmcgdG8gXCIgKyB0aGlzLnByb3BzLmJyYW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ291bGRuJ3Qgc2V0IGVtYWlsIGJyYW5kaW5nOiBcIiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb3VsZG4ndCBnZXQgcHVzaGVyczogXCIgKyBlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Mb2dpbkNsaWNrID0gZXYgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkxvZ2luQ2xpY2soKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkdvVG9Gb3JtQ2xpY2tlZCA9IGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucmVwbGFjZUNsaWVudCh0aGlzLnByb3BzLnNlcnZlckNvbmZpZyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBkb2luZ1VJQXV0aDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG1ha2VSZWdpc3RlclJlcXVlc3QgPSBhdXRoID0+IHtcbiAgICAgICAgLy8gV2UgaW5oaWJpdCBsb2dpbiBpZiB3ZSdyZSB0cnlpbmcgdG8gcmVnaXN0ZXIgd2l0aCBhbiBlbWFpbCBhZGRyZXNzOiB0aGlzXG4gICAgICAgIC8vIGF2b2lkcyBhIGxvdCBvZiBjb21wbGV4IHJhY2UgY29uZGl0aW9ucyB0aGF0IGNhbiBvY2N1ciBpZiB3ZSB0cnkgdG8gbG9nXG4gICAgICAgIC8vIHRoZSB1c2VyIGluIG9uZSBvbmUgb3IgYm90aCBvZiB0aGUgdGFicyB0aGV5IG1pZ2h0IGVuZCB1cCB3aXRoIGFmdGVyXG4gICAgICAgIC8vIGNsaWNraW5nIHRoZSBlbWFpbCBsaW5rLlxuICAgICAgICBsZXQgaW5oaWJpdExvZ2luID0gQm9vbGVhbih0aGlzLnN0YXRlLmZvcm1WYWxzLmVtYWlsKTtcblxuICAgICAgICAvLyBPbmx5IHNlbmQgaW5oaWJpdExvZ2luIGlmIHdlJ3JlIHNlbmRpbmcgdXNlcm5hbWUgLyBwdyBwYXJhbXNcbiAgICAgICAgLy8gKFNpbmNlIHdlIG5lZWQgdG8gc2VuZCBubyBwYXJhbXMgYXQgYWxsIHRvIHVzZSB0aGUgb25lcyBzYXZlZCBpbiB0aGVcbiAgICAgICAgLy8gc2Vzc2lvbikuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5mb3JtVmFscy5wYXNzd29yZCkgaW5oaWJpdExvZ2luID0gbnVsbDtcblxuICAgICAgICBjb25zdCByZWdpc3RlclBhcmFtcyA9IHtcbiAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLnN0YXRlLmZvcm1WYWxzLnVzZXJuYW1lLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMuc3RhdGUuZm9ybVZhbHMucGFzc3dvcmQsXG4gICAgICAgICAgICBpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWU6IHRoaXMucHJvcHMuZGVmYXVsdERldmljZURpc3BsYXlOYW1lLFxuICAgICAgICAgICAgYXV0aDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgaW5oaWJpdF9sb2dpbjogdW5kZWZpbmVkLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoYXV0aCkgcmVnaXN0ZXJQYXJhbXMuYXV0aCA9IGF1dGg7XG4gICAgICAgIGlmIChpbmhpYml0TG9naW4gIT09IHVuZGVmaW5lZCAmJiBpbmhpYml0TG9naW4gIT09IG51bGwpIHJlZ2lzdGVyUGFyYW1zLmluaGliaXRfbG9naW4gPSBpbmhpYml0TG9naW47XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLm1hdHJpeENsaWVudC5yZWdpc3RlclJlcXVlc3QocmVnaXN0ZXJQYXJhbXMpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFVJQXV0aElucHV0cygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVtYWlsQWRkcmVzczogdGhpcy5zdGF0ZS5mb3JtVmFscy5lbWFpbCxcbiAgICAgICAgICAgIHBob25lQ291bnRyeTogdGhpcy5zdGF0ZS5mb3JtVmFscy5waG9uZUNvdW50cnksXG4gICAgICAgICAgICBwaG9uZU51bWJlcjogdGhpcy5zdGF0ZS5mb3JtVmFscy5waG9uZU51bWJlcixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBMaW5rcyB0byB0aGUgbG9naW4gcGFnZSBzaG93biBhZnRlciByZWdpc3RyYXRpb24gaXMgY29tcGxldGVkIGFyZSByb3V0ZWQgdGhyb3VnaCB0aGlzXG4gICAgLy8gd2hpY2ggY2hlY2tzIHRoZSB1c2VyIGhhc24ndCBhbHJlYWR5IGxvZ2dlZCBpbiBzb21ld2hlcmUgZWxzZSAocGVyaGFwcyB3ZSBzaG91bGQgZG9cbiAgICAvLyB0aGlzIG1vcmUgZ2VuZXJhbGx5PylcbiAgICBwcml2YXRlIG9uTG9naW5DbGlja1dpdGhDaGVjayA9IGFzeW5jIGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBzZXNzaW9uTG9hZGVkID0gYXdhaXQgTGlmZWN5Y2xlLmxvYWRTZXNzaW9uKHtpZ25vcmVHdWVzdDogdHJ1ZX0pO1xuICAgICAgICBpZiAoIXNlc3Npb25Mb2FkZWQpIHtcbiAgICAgICAgICAgIC8vIG9rIGZpbmUsIHRoZXJlJ3Mgc3RpbGwgbm8gc2Vzc2lvbjogcmVhbGx5IGdvIHRvIHRoZSBsb2dpbiBwYWdlXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uTG9naW5DbGljaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyUmVnaXN0ZXJDb21wb25lbnQoKSB7XG4gICAgICAgIGNvbnN0IEludGVyYWN0aXZlQXV0aCA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuSW50ZXJhY3RpdmVBdXRoJyk7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5TcGlubmVyJyk7XG4gICAgICAgIGNvbnN0IFJlZ2lzdHJhdGlvbkZvcm0gPSBzZGsuZ2V0Q29tcG9uZW50KCdhdXRoLlJlZ2lzdHJhdGlvbkZvcm0nKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tYXRyaXhDbGllbnQgJiYgdGhpcy5zdGF0ZS5kb2luZ1VJQXV0aCkge1xuICAgICAgICAgICAgcmV0dXJuIDxJbnRlcmFjdGl2ZUF1dGhcbiAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ9e3RoaXMuc3RhdGUubWF0cml4Q2xpZW50fVxuICAgICAgICAgICAgICAgIG1ha2VSZXF1ZXN0PXt0aGlzLm1ha2VSZWdpc3RlclJlcXVlc3R9XG4gICAgICAgICAgICAgICAgb25BdXRoRmluaXNoZWQ9e3RoaXMub25VSUF1dGhGaW5pc2hlZH1cbiAgICAgICAgICAgICAgICBpbnB1dHM9e3RoaXMuZ2V0VUlBdXRoSW5wdXRzKCl9XG4gICAgICAgICAgICAgICAgcmVxdWVzdEVtYWlsVG9rZW49e3RoaXMucmVxdWVzdEVtYWlsVG9rZW59XG4gICAgICAgICAgICAgICAgc2Vzc2lvbklkPXt0aGlzLnByb3BzLnNlc3Npb25JZH1cbiAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ9e3RoaXMucHJvcHMuY2xpZW50U2VjcmV0fVxuICAgICAgICAgICAgICAgIGVtYWlsU2lkPXt0aGlzLnByb3BzLmlkU2lkfVxuICAgICAgICAgICAgICAgIHBvbGw9e3RydWV9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5zdGF0ZS5tYXRyaXhDbGllbnQgJiYgIXRoaXMuc3RhdGUuYnVzeSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5idXN5IHx8ICF0aGlzLnN0YXRlLmZsb3dzKSB7XG4gICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9zcGlubmVyXCI+XG4gICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmZsb3dzLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHNzb1NlY3Rpb247XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zc29GbG93KSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRpbnVlV2l0aFNlY3Rpb247XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvdmlkZXJzID0gdGhpcy5zdGF0ZS5zc29GbG93W1wib3JnLm1hdHJpeC5tc2MyODU4LmlkZW50aXR5X3Byb3ZpZGVyc1wiXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHRoZXJlIGlzIG9ubHkgYSBzaW5nbGUgKG9yIDApIHByb3ZpZGVycyB3ZSBzaG93IGEgd2lkZSBidXR0b24gd2l0aCBgQ29udGludWUgd2l0aCBYYCB0ZXh0XG4gICAgICAgICAgICAgICAgaWYgKHByb3ZpZGVycy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGkxOG46IHNzb0J1dHRvbnMgaXMgYSBwbGFjZWhvbGRlciB0byBoZWxwIHRyYW5zbGF0b3JzIHVuZGVyc3RhbmQgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVdpdGhTZWN0aW9uID0gPGgzIGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2NlbnRlcmVkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ29udGludWUgd2l0aCAlKHNzb0J1dHRvbnMpc1wiLCB7IHNzb0J1dHRvbnM6IFwiXCIgfSkudHJpbSgpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9oMz47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gaTE4bjogc3NvQnV0dG9ucyAmIHVzZXJuYW1lUGFzc3dvcmQgYXJlIHBsYWNlaG9sZGVycyB0byBoZWxwIHRyYW5zbGF0b3JzIHVuZGVyc3RhbmQgY29udGV4dFxuICAgICAgICAgICAgICAgIHNzb1NlY3Rpb24gPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIHsgY29udGludWVXaXRoU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgIDxTU09CdXR0b25zXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ9e3RoaXMubG9naW5Mb2dpYy5jcmVhdGVUZW1wb3JhcnlDbGllbnQoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb3c9e3RoaXMuc3RhdGUuc3NvRmxvd31cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2luVHlwZT17dGhpcy5zdGF0ZS5zc29GbG93LnR5cGUgPT09IFwibS5sb2dpbi5zc29cIiA/IFwic3NvXCIgOiBcImNhc1wifVxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBZnRlckxvZ2luPXt0aGlzLnByb3BzLmZyYWdtZW50QWZ0ZXJMb2dpbn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2NlbnRlcmVkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiJShzc29CdXR0b25zKXMgT3IgJSh1c2VybmFtZVBhc3N3b3JkKXNcIiwgeyBzc29CdXR0b25zOiBcIlwiLCB1c2VybmFtZVBhc3N3b3JkOiBcIlwifSkudHJpbSgpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICB7IHNzb1NlY3Rpb24gfVxuICAgICAgICAgICAgICAgIDxSZWdpc3RyYXRpb25Gb3JtXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRVc2VybmFtZT17dGhpcy5zdGF0ZS5mb3JtVmFscy51c2VybmFtZX1cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdEVtYWlsPXt0aGlzLnN0YXRlLmZvcm1WYWxzLmVtYWlsfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0UGhvbmVDb3VudHJ5PXt0aGlzLnN0YXRlLmZvcm1WYWxzLnBob25lQ291bnRyeX1cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFBob25lTnVtYmVyPXt0aGlzLnN0YXRlLmZvcm1WYWxzLnBob25lTnVtYmVyfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0UGFzc3dvcmQ9e3RoaXMuc3RhdGUuZm9ybVZhbHMucGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgIG9uUmVnaXN0ZXJDbGljaz17dGhpcy5vbkZvcm1TdWJtaXR9XG4gICAgICAgICAgICAgICAgICAgIGZsb3dzPXt0aGlzLnN0YXRlLmZsb3dzfVxuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJDb25maWc9e3RoaXMucHJvcHMuc2VydmVyQ29uZmlnfVxuICAgICAgICAgICAgICAgICAgICBjYW5TdWJtaXQ9eyF0aGlzLnN0YXRlLnNlcnZlckVycm9ySXNGYXRhbH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEF1dGhIZWFkZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdhdXRoLkF1dGhIZWFkZXInKTtcbiAgICAgICAgY29uc3QgQXV0aEJvZHkgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXV0aC5BdXRoQm9keVwiKTtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcblxuICAgICAgICBsZXQgZXJyb3JUZXh0O1xuICAgICAgICBjb25zdCBlcnIgPSB0aGlzLnN0YXRlLmVycm9yVGV4dDtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgZXJyb3JUZXh0ID0gPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9lcnJvclwiPnsgZXJyIH08L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2VydmVyRGVhZFNlY3Rpb247XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zZXJ2ZXJJc0FsaXZlKSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgXCJteF9Mb2dpbl9lcnJvclwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwibXhfTG9naW5fc2VydmVyRXJyb3JcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0xvZ2luX3NlcnZlckVycm9yTm9uRmF0YWxcIjogIXRoaXMuc3RhdGUuc2VydmVyRXJyb3JJc0ZhdGFsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXJ2ZXJEZWFkU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLnNlcnZlckRlYWRFcnJvcn1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaWduSW4gPSA8c3BhbiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9jaGFuZ2VGbG93XCI+XG4gICAgICAgICAgICB7X3QoXCJBbHJlYWR5IGhhdmUgYW4gYWNjb3VudD8gPGE+U2lnbiBpbiBoZXJlPC9hPlwiLCB7fSwge1xuICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8YSBvbkNsaWNrPXt0aGlzLm9uTG9naW5DbGlja30gaHJlZj1cIiNcIj57IHN1YiB9PC9hPixcbiAgICAgICAgICAgIH0pfVxuICAgICAgICA8L3NwYW4+O1xuXG4gICAgICAgIC8vIE9ubHkgc2hvdyB0aGUgJ2dvIGJhY2snIGJ1dHRvbiBpZiB5b3UncmUgbm90IGxvb2tpbmcgYXQgdGhlIGZvcm1cbiAgICAgICAgbGV0IGdvQmFjaztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZG9pbmdVSUF1dGgpIHtcbiAgICAgICAgICAgIGdvQmFjayA9IDxhIGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2NoYW5nZUZsb3dcIiBvbkNsaWNrPXt0aGlzLm9uR29Ub0Zvcm1DbGlja2VkfSBocmVmPVwiI1wiPlxuICAgICAgICAgICAgICAgIHsgX3QoJ0dvIGJhY2snKSB9XG4gICAgICAgICAgICA8L2E+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJvZHk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNvbXBsZXRlZE5vU2lnbmluKSB7XG4gICAgICAgICAgICBsZXQgcmVnRG9uZVRleHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5kaWZmZXJlbnRMb2dnZWRJblVzZXJJZCkge1xuICAgICAgICAgICAgICAgIHJlZ0RvbmVUZXh0ID0gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJZb3VyIG5ldyBhY2NvdW50ICglKG5ld0FjY291bnRJZClzKSBpcyByZWdpc3RlcmVkLCBidXQgeW91J3JlIGFscmVhZHkgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJsb2dnZWQgaW50byBhIGRpZmZlcmVudCBhY2NvdW50ICglKGxvZ2dlZEluVXNlcklkKXMpLlwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QWNjb3VudElkOiB0aGlzLnN0YXRlLnJlZ2lzdGVyZWRVc2VybmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZWRJblVzZXJJZDogdGhpcy5zdGF0ZS5kaWZmZXJlbnRMb2dnZWRJblVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD48QWNjZXNzaWJsZUJ1dHRvbiBlbGVtZW50PVwic3BhblwiIGNsYXNzTmFtZT1cIm14X2xpbmtCdXR0b25cIiBvbkNsaWNrPXt0aGlzLm9uTG9naW5DbGlja1dpdGhDaGVja30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJDb250aW51ZSB3aXRoIHByZXZpb3VzIGFjY291bnRcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj48L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmZvcm1WYWxzLnBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgdGhlIGNsaWVudCB0aGF0IHN0YXJ0ZWQgdGhlIHJlZ2lzdHJhdGlvblxuICAgICAgICAgICAgICAgIHJlZ0RvbmVUZXh0ID0gPGgzPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCI8YT5Mb2cgaW48L2E+IHRvIHlvdXIgbmV3IGFjY291bnQuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhOiAoc3ViKSA9PiA8YSBocmVmPVwiIy9sb2dpblwiIG9uQ2xpY2s9e3RoaXMub25Mb2dpbkNsaWNrV2l0aENoZWNrfT57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKX08L2gzPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgbm90IHRoZSBvcmlnaW5hbCBjbGllbnQ6IHRoZSB1c2VyIHByb2JhYmx5IGdvdCB0byB1cyBieSBjbGlja2luZyB0aGVcbiAgICAgICAgICAgICAgICAvLyBlbWFpbCB2YWxpZGF0aW9uIGxpbmsuIFdlIGNhbid0IG9mZmVyIGEgJ2dvIHN0cmFpZ2h0IHRvIHlvdXIgYWNjb3VudCcgbGlua1xuICAgICAgICAgICAgICAgIC8vIGFzIHdlIGRvbid0IGhhdmUgdGhlIG9yaWdpbmFsIGNyZWRzLlxuICAgICAgICAgICAgICAgIHJlZ0RvbmVUZXh0ID0gPGgzPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJZb3UgY2FuIG5vdyBjbG9zZSB0aGlzIHdpbmRvdyBvciA8YT5sb2cgaW48L2E+IHRvIHlvdXIgbmV3IGFjY291bnQuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhOiAoc3ViKSA9PiA8YSBocmVmPVwiIy9sb2dpblwiIG9uQ2xpY2s9e3RoaXMub25Mb2dpbkNsaWNrV2l0aENoZWNrfT57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKX08L2gzPjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvZHkgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxoMj57X3QoXCJSZWdpc3RyYXRpb24gU3VjY2Vzc2Z1bFwiKX08L2gyPlxuICAgICAgICAgICAgICAgIHsgcmVnRG9uZVRleHQgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm9keSA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPGgyPnsgX3QoJ0NyZWF0ZSBhY2NvdW50JykgfTwvaDI+XG4gICAgICAgICAgICAgICAgeyBlcnJvclRleHQgfVxuICAgICAgICAgICAgICAgIHsgc2VydmVyRGVhZFNlY3Rpb24gfVxuICAgICAgICAgICAgICAgIDxTZXJ2ZXJQaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiSG9zdCBhY2NvdW50IG9uXCIpfVxuICAgICAgICAgICAgICAgICAgICBkaWFsb2dUaXRsZT17X3QoXCJEZWNpZGUgd2hlcmUgeW91ciBhY2NvdW50IGlzIGhvc3RlZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgc2VydmVyQ29uZmlnPXt0aGlzLnByb3BzLnNlcnZlckNvbmZpZ31cbiAgICAgICAgICAgICAgICAgICAgb25TZXJ2ZXJDb25maWdDaGFuZ2U9e3RoaXMuc3RhdGUuZG9pbmdVSUF1dGggPyB1bmRlZmluZWQgOiB0aGlzLnByb3BzLm9uU2VydmVyQ29uZmlnQ2hhbmdlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlclJlZ2lzdGVyQ29tcG9uZW50KCkgfVxuICAgICAgICAgICAgICAgIHsgZ29CYWNrIH1cbiAgICAgICAgICAgICAgICB7IHNpZ25JbiB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEF1dGhQYWdlPlxuICAgICAgICAgICAgICAgIDxBdXRoSGVhZGVyIC8+XG4gICAgICAgICAgICAgICAgPEF1dGhCb2R5PlxuICAgICAgICAgICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICAgICAgICAgIDwvQXV0aEJvZHk+XG4gICAgICAgICAgICA8L0F1dGhQYWdlPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
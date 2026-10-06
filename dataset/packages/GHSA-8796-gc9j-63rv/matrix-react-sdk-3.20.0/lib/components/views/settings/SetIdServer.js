"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _boundThreepids = require("../../../boundThreepids");

var _IdentityAuthClient = _interopRequireDefault(require("../../../IdentityAuthClient"));

var _UrlUtils = require("../../../utils/UrlUtils");

var _IdentityServerUtils = require("../../../utils/IdentityServerUtils");

var _promise = require("../../../utils/promise");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

// We'll wait up to this long when checking for 3PID bindings on the IS.
const REACHABILITY_TIMEOUT = 10000; // ms

/**
 * Check an IS URL is valid, including liveness check
 *
 * @param {string} u The url to check
 * @returns {string} null if url passes all checks, otherwise i18ned error string
 */

async function checkIdentityServerUrl(u) {
  const parsedUrl = _url.default.parse(u);

  if (parsedUrl.protocol !== 'https:') return (0, _languageHandler._t)("Identity Server URL must be HTTPS"); // XXX: duplicated logic from js-sdk but it's quite tied up in the validation logic in the
  // js-sdk so probably as easy to duplicate it than to separate it out so we can reuse it

  try {
    const response = await fetch(u + '/_matrix/identity/api/v1');

    if (response.ok) {
      return null;
    } else if (response.status < 200 || response.status >= 300) {
      return (0, _languageHandler._t)("Not a valid Identity Server (status code %(code)s)", {
        code: response.status
      });
    } else {
      return (0, _languageHandler._t)("Could not connect to Identity Server");
    }
  } catch (e) {
    return (0, _languageHandler._t)("Could not connect to Identity Server");
  }
}

let SetIdServer = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.SetIdServer"), _dec(_class = (_temp = class SetIdServer extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      // We react to changes in the ID server in the event the user is staring at this form
      // when changing their identity server on another device.
      if (payload.action !== "id_server_changed") return;
      this.setState({
        currentClientIdServer: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()
      });
    });
    (0, _defineProperty2.default)(this, "onIdentityServerChanged", ev => {
      const u = ev.target.value;
      this.setState({
        idServer: u
      });
    });
    (0, _defineProperty2.default)(this, "getTooltip", () => {
      if (this.state.checking) {
        const InlineSpinner = sdk.getComponent('views.elements.InlineSpinner');
        return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(InlineSpinner, null), (0, _languageHandler._t)("Checking server"));
      } else if (this.state.error) {
        return /*#__PURE__*/_react.default.createElement("span", {
          className: "warning"
        }, this.state.error);
      } else {
        return null;
      }
    });
    (0, _defineProperty2.default)(this, "idServerChangeEnabled", () => {
      return !!this.state.idServer && !this.state.busy;
    });
    (0, _defineProperty2.default)(this, "saveIdServer", fullUrl => {
      // Account data change will update localstorage, client, etc through dispatcher
      _MatrixClientPeg.MatrixClientPeg.get().setAccountData("m.identity_server", {
        base_url: fullUrl
      });

      this.setState({
        busy: false,
        error: null,
        currentClientIdServer: fullUrl,
        idServer: ''
      });
    });
    (0, _defineProperty2.default)(this, "checkIdServer", async e => {
      e.preventDefault();
      const {
        idServer,
        currentClientIdServer
      } = this.state;
      this.setState({
        busy: true,
        checking: true,
        error: null
      });
      const fullUrl = (0, _UrlUtils.unabbreviateUrl)(idServer);
      let errStr = await checkIdentityServerUrl(fullUrl);

      if (!errStr) {
        try {
          this.setState({
            checking: false
          }); // clear tooltip
          // Test the identity server by trying to register with it. This
          // may result in a terms of service prompt.

          const authClient = new _IdentityAuthClient.default(fullUrl);
          await authClient.getAccessToken();
          let save = true; // Double check that the identity server even has terms of service.

          const hasTerms = await (0, _IdentityServerUtils.doesIdentityServerHaveTerms)(fullUrl);

          if (!hasTerms) {
            const [confirmed] = await this.showNoTermsWarning(fullUrl);
            save = confirmed;
          } // Show a general warning, possibly with details about any bound
          // 3PIDs that would be left behind.


          if (save && currentClientIdServer && fullUrl !== currentClientIdServer) {
            const [confirmed] = await this.showServerChangeWarning({
              title: (0, _languageHandler._t)("Change identity server"),
              unboundMessage: (0, _languageHandler._t)("Disconnect from the identity server <current /> and " + "connect to <new /> instead?", {}, {
                current: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(currentClientIdServer)),
                new: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(idServer))
              }),
              button: (0, _languageHandler._t)("Continue")
            });
            save = confirmed;
          }

          if (save) {
            this.saveIdServer(fullUrl);
          }
        } catch (e) {
          console.error(e);
          errStr = (0, _languageHandler._t)("Terms of service not accepted or the identity server is invalid.");
        }
      }

      this.setState({
        busy: false,
        checking: false,
        error: errStr,
        currentClientIdServer: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()
      });
    });
    (0, _defineProperty2.default)(this, "onDisconnectClicked", async () => {
      this.setState({
        disconnectBusy: true
      });

      try {
        const [confirmed] = await this.showServerChangeWarning({
          title: (0, _languageHandler._t)("Disconnect identity server"),
          unboundMessage: (0, _languageHandler._t)("Disconnect from the identity server <idserver />?", {}, {
            idserver: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(this.state.currentClientIdServer))
          }),
          button: (0, _languageHandler._t)("Disconnect")
        });

        if (confirmed) {
          this.disconnectIdServer();
        }
      } finally {
        this.setState({
          disconnectBusy: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "disconnectIdServer", () => {
      // Account data change will update localstorage, client, etc through dispatcher
      _MatrixClientPeg.MatrixClientPeg.get().setAccountData("m.identity_server", {
        base_url: null // clear

      });

      let newFieldVal = '';

      if ((0, _IdentityServerUtils.getDefaultIdentityServerUrl)()) {
        // Prepopulate the client's default so the user at least has some idea of
        // a valid value they might enter
        newFieldVal = (0, _UrlUtils.abbreviateUrl)((0, _IdentityServerUtils.getDefaultIdentityServerUrl)());
      }

      this.setState({
        busy: false,
        error: null,
        currentClientIdServer: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl(),
        idServer: newFieldVal
      });
    });
    let defaultIdServer = '';

    if (!_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl() && (0, _IdentityServerUtils.getDefaultIdentityServerUrl)()) {
      // If no ID server is configured but there's one in the config, prepopulate
      // the field to help the user.
      defaultIdServer = (0, _UrlUtils.abbreviateUrl)((0, _IdentityServerUtils.getDefaultIdentityServerUrl)());
    }

    this.state = {
      defaultIdServer,
      currentClientIdServer: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl(),
      idServer: "",
      error: null,
      busy: false,
      disconnectBusy: false,
      checking: false
    };
  }

  componentDidMount()
  /*: void*/
  {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount()
  /*: void*/
  {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  showNoTermsWarning(fullUrl) {
    const QuestionDialog = sdk.getComponent("views.dialogs.QuestionDialog");

    const {
      finished
    } = _Modal.default.createTrackedDialog('No Terms Warning', '', QuestionDialog, {
      title: (0, _languageHandler._t)("Identity server has no terms of service"),
      description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
        className: "warning"
      }, (0, _languageHandler._t)("The identity server you have chosen does not have any terms of service.")), /*#__PURE__*/_react.default.createElement("span", null, "\xA0", (0, _languageHandler._t)("Only continue if you trust the owner of the server."))),
      button: (0, _languageHandler._t)("Continue")
    });

    return finished;
  }

  async showServerChangeWarning({
    title,
    unboundMessage,
    button
  }) {
    const {
      currentClientIdServer
    } = this.state;
    let threepids = [];
    let currentServerReachable = true;

    try {
      threepids = await (0, _promise.timeout)((0, _boundThreepids.getThreepidsWithBindStatus)(_MatrixClientPeg.MatrixClientPeg.get()), Promise.reject(new Error("Timeout attempting to reach identity server")), REACHABILITY_TIMEOUT);
    } catch (e) {
      currentServerReachable = false;
      console.warn(`Unable to reach identity server at ${currentClientIdServer} to check ` + `for 3PIDs during IS change flow`);
      console.warn(e);
    }

    const boundThreepids = threepids.filter(tp => tp.bound);
    let message;
    let danger = false;
    const messageElements = {
      idserver: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(currentClientIdServer)),
      b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
    };

    if (!currentServerReachable) {
      message = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You should <b>remove your personal data</b> from identity server " + "<idserver /> before disconnecting. Unfortunately, identity server " + "<idserver /> is currently offline or cannot be reached.", {}, messageElements)), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You should:")), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("check your browser plugins for anything that might block " + "the identity server (such as Privacy Badger)")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("contact the administrators of identity server <idserver />", {}, {
        idserver: messageElements.idserver
      })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("wait and try again later"))));
      danger = true;
      button = (0, _languageHandler._t)("Disconnect anyway");
    } else if (boundThreepids.length) {
      message = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are still <b>sharing your personal data</b> on the identity " + "server <idserver />.", {}, messageElements)), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We recommend that you remove your email addresses and phone numbers " + "from the identity server before disconnecting.")));
      danger = true;
      button = (0, _languageHandler._t)("Disconnect anyway");
    } else {
      message = unboundMessage;
    }

    const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

    const {
      finished
    } = _Modal.default.createTrackedDialog('Identity Server Bound Warning', '', QuestionDialog, {
      title,
      description: message,
      button,
      cancelButton: (0, _languageHandler._t)("Go back"),
      danger
    });

    return finished;
  }

  render() {
    const AccessibleButton = sdk.getComponent('views.elements.AccessibleButton');
    const Field = sdk.getComponent('elements.Field');
    const idServerUrl = this.state.currentClientIdServer;
    let sectionTitle;
    let bodyText;

    if (idServerUrl) {
      sectionTitle = (0, _languageHandler._t)("Identity Server (%(server)s)", {
        server: (0, _UrlUtils.abbreviateUrl)(idServerUrl)
      });
      bodyText = (0, _languageHandler._t)("You are currently using <server></server> to discover and be discoverable by " + "existing contacts you know. You can change your identity server below.", {}, {
        server: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(idServerUrl))
      });

      if (this.props.missingTerms) {
        bodyText = (0, _languageHandler._t)("If you don't want to use <server /> to discover and be discoverable by existing " + "contacts you know, enter another identity server below.", {}, {
          server: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(idServerUrl))
        });
      }
    } else {
      sectionTitle = (0, _languageHandler._t)("Identity Server");
      bodyText = (0, _languageHandler._t)("You are not currently using an identity server. " + "To discover and be discoverable by existing contacts you know, " + "add one below.");
    }

    let discoSection;

    if (idServerUrl) {
      let discoButtonContent
      /*: React.ReactNode*/
      = (0, _languageHandler._t)("Disconnect");
      let discoBodyText = (0, _languageHandler._t)("Disconnecting from your identity server will mean you " + "won't be discoverable by other users and you won't be " + "able to invite others by email or phone.");

      if (this.props.missingTerms) {
        discoBodyText = (0, _languageHandler._t)("Using an identity server is optional. If you choose not to " + "use an identity server, you won't be discoverable by other users " + "and you won't be able to invite others by email or phone.");
        discoButtonContent = (0, _languageHandler._t)("Do not use an identity server");
      }

      if (this.state.disconnectBusy) {
        const InlineSpinner = sdk.getComponent('views.elements.InlineSpinner');
        discoButtonContent = /*#__PURE__*/_react.default.createElement(InlineSpinner, null);
      }

      discoSection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subsectionText"
      }, discoBodyText), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        onClick: this.onDisconnectClicked,
        kind: "danger_sm"
      }, discoButtonContent));
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      className: "mx_SettingsTab_section mx_SetIdServer",
      onSubmit: this.checkIdServer
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, sectionTitle), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subsectionText"
    }, bodyText), /*#__PURE__*/_react.default.createElement(Field, {
      label: (0, _languageHandler._t)("Enter a new identity server"),
      type: "text",
      autoComplete: "off",
      placeholder: this.state.defaultIdServer,
      value: this.state.idServer,
      onChange: this.onIdentityServerChanged,
      tooltipContent: this.getTooltip(),
      tooltipClassName: "mx_SetIdServer_tooltip",
      disabled: this.state.busy,
      forceValidity: this.state.error ? false : null
    }), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      type: "submit",
      kind: "primary_sm",
      onClick: this.checkIdServer,
      disabled: !this.idServerChangeEnabled()
    }, (0, _languageHandler._t)("Change")), discoSection);
  }

}, _temp)) || _class);
exports.default = SetIdServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL1NldElkU2VydmVyLnRzeCJdLCJuYW1lcyI6WyJSRUFDSEFCSUxJVFlfVElNRU9VVCIsImNoZWNrSWRlbnRpdHlTZXJ2ZXJVcmwiLCJ1IiwicGFyc2VkVXJsIiwidXJsIiwicGFyc2UiLCJwcm90b2NvbCIsInJlc3BvbnNlIiwiZmV0Y2giLCJvayIsInN0YXR1cyIsImNvZGUiLCJlIiwiU2V0SWRTZXJ2ZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJwYXlsb2FkIiwiYWN0aW9uIiwic2V0U3RhdGUiLCJjdXJyZW50Q2xpZW50SWRTZXJ2ZXIiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRJZGVudGl0eVNlcnZlclVybCIsImV2IiwidGFyZ2V0IiwidmFsdWUiLCJpZFNlcnZlciIsInN0YXRlIiwiY2hlY2tpbmciLCJJbmxpbmVTcGlubmVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiZXJyb3IiLCJidXN5IiwiZnVsbFVybCIsInNldEFjY291bnREYXRhIiwiYmFzZV91cmwiLCJwcmV2ZW50RGVmYXVsdCIsImVyclN0ciIsImF1dGhDbGllbnQiLCJJZGVudGl0eUF1dGhDbGllbnQiLCJnZXRBY2Nlc3NUb2tlbiIsInNhdmUiLCJoYXNUZXJtcyIsImNvbmZpcm1lZCIsInNob3dOb1Rlcm1zV2FybmluZyIsInNob3dTZXJ2ZXJDaGFuZ2VXYXJuaW5nIiwidGl0bGUiLCJ1bmJvdW5kTWVzc2FnZSIsImN1cnJlbnQiLCJzdWIiLCJuZXciLCJidXR0b24iLCJzYXZlSWRTZXJ2ZXIiLCJjb25zb2xlIiwiZGlzY29ubmVjdEJ1c3kiLCJpZHNlcnZlciIsImRpc2Nvbm5lY3RJZFNlcnZlciIsIm5ld0ZpZWxkVmFsIiwiZGVmYXVsdElkU2VydmVyIiwiY29tcG9uZW50RGlkTW91bnQiLCJkaXNwYXRjaGVyUmVmIiwiZGlzIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsIlF1ZXN0aW9uRGlhbG9nIiwiZmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJkZXNjcmlwdGlvbiIsInRocmVlcGlkcyIsImN1cnJlbnRTZXJ2ZXJSZWFjaGFibGUiLCJQcm9taXNlIiwicmVqZWN0IiwiRXJyb3IiLCJ3YXJuIiwiYm91bmRUaHJlZXBpZHMiLCJmaWx0ZXIiLCJ0cCIsImJvdW5kIiwibWVzc2FnZSIsImRhbmdlciIsIm1lc3NhZ2VFbGVtZW50cyIsImIiLCJsZW5ndGgiLCJjYW5jZWxCdXR0b24iLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwiRmllbGQiLCJpZFNlcnZlclVybCIsInNlY3Rpb25UaXRsZSIsImJvZHlUZXh0Iiwic2VydmVyIiwibWlzc2luZ1Rlcm1zIiwiZGlzY29TZWN0aW9uIiwiZGlzY29CdXR0b25Db250ZW50IiwiZGlzY29Cb2R5VGV4dCIsIm9uRGlzY29ubmVjdENsaWNrZWQiLCJjaGVja0lkU2VydmVyIiwib25JZGVudGl0eVNlcnZlckNoYW5nZWQiLCJnZXRUb29sdGlwIiwiaWRTZXJ2ZXJDaGFuZ2VFbmFibGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBR0E7QUFDQSxNQUFNQSxvQkFBb0IsR0FBRyxLQUE3QixDLENBQW9DOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsZUFBZUMsc0JBQWYsQ0FBc0NDLENBQXRDLEVBQXlDO0FBQ3JDLFFBQU1DLFNBQVMsR0FBR0MsYUFBSUMsS0FBSixDQUFVSCxDQUFWLENBQWxCOztBQUVBLE1BQUlDLFNBQVMsQ0FBQ0csUUFBVixLQUF1QixRQUEzQixFQUFxQyxPQUFPLHlCQUFHLG1DQUFILENBQVAsQ0FIQSxDQUtyQztBQUNBOztBQUNB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QXVCS1AsWUF2QkwsQ0FESjtBQTJCSDs7QUF4V29FLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTktMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IGdldFRocmVlcGlkc1dpdGhCaW5kU3RhdHVzIH0gZnJvbSAnLi4vLi4vLi4vYm91bmRUaHJlZXBpZHMnO1xuaW1wb3J0IElkZW50aXR5QXV0aENsaWVudCBmcm9tIFwiLi4vLi4vLi4vSWRlbnRpdHlBdXRoQ2xpZW50XCI7XG5pbXBvcnQge2FiYnJldmlhdGVVcmwsIHVuYWJicmV2aWF0ZVVybH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL1VybFV0aWxzXCI7XG5pbXBvcnQgeyBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwsIGRvZXNJZGVudGl0eVNlcnZlckhhdmVUZXJtcyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0lkZW50aXR5U2VydmVyVXRpbHMnO1xuaW1wb3J0IHt0aW1lb3V0fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcHJvbWlzZVwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcyc7XG5cbi8vIFdlJ2xsIHdhaXQgdXAgdG8gdGhpcyBsb25nIHdoZW4gY2hlY2tpbmcgZm9yIDNQSUQgYmluZGluZ3Mgb24gdGhlIElTLlxuY29uc3QgUkVBQ0hBQklMSVRZX1RJTUVPVVQgPSAxMDAwMDsgLy8gbXNcblxuLyoqXG4gKiBDaGVjayBhbiBJUyBVUkwgaXMgdmFsaWQsIGluY2x1ZGluZyBsaXZlbmVzcyBjaGVja1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1IFRoZSB1cmwgdG8gY2hlY2tcbiAqIEByZXR1cm5zIHtzdHJpbmd9IG51bGwgaWYgdXJsIHBhc3NlcyBhbGwgY2hlY2tzLCBvdGhlcndpc2UgaTE4bmVkIGVycm9yIHN0cmluZ1xuICovXG5hc3luYyBmdW5jdGlvbiBjaGVja0lkZW50aXR5U2VydmVyVXJsKHUpIHtcbiAgICBjb25zdCBwYXJzZWRVcmwgPSB1cmwucGFyc2UodSk7XG5cbiAgICBpZiAocGFyc2VkVXJsLnByb3RvY29sICE9PSAnaHR0cHM6JykgcmV0dXJuIF90KFwiSWRlbnRpdHkgU2VydmVyIFVSTCBtdXN0IGJlIEhUVFBTXCIpO1xuXG4gICAgLy8gWFhYOiBkdXBsaWNhdGVkIGxvZ2ljIGZyb20ganMtc2RrIGJ1dCBpdCdzIHF1aXRlIHRpZWQgdXAgaW4gdGhlIHZhbGlkYXRpb24gbG9naWMgaW4gdGhlXG4gICAgLy8ganMtc2RrIHNvIHByb2JhYmx5IGFzIGVhc3kgdG8gZHVwbGljYXRlIGl0IHRoYW4gdG8gc2VwYXJhdGUgaXQgb3V0IHNvIHdlIGNhbiByZXVzZSBpdFxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godSArICcvX21hdHJpeC9pZGVudGl0eS9hcGkvdjEnKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiTm90IGEgdmFsaWQgSWRlbnRpdHkgU2VydmVyIChzdGF0dXMgY29kZSAlKGNvZGUpcylcIiwge2NvZGU6IHJlc3BvbnNlLnN0YXR1c30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiQ291bGQgbm90IGNvbm5lY3QgdG8gSWRlbnRpdHkgU2VydmVyXCIpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gX3QoXCJDb3VsZCBub3QgY29ubmVjdCB0byBJZGVudGl0eSBTZXJ2ZXJcIik7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvLyBXaGV0aGVyIG9yIG5vdCB0aGUgSUQgc2VydmVyIGlzIG1pc3NpbmcgdGVybXMuIFRoaXMgYWZmZWN0cyB0aGUgdGV4dFxuICAgIC8vIHNob3duIHRvIHRoZSB1c2VyLlxuICAgIG1pc3NpbmdUZXJtczogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgZGVmYXVsdElkU2VydmVyPzogc3RyaW5nO1xuICAgIGN1cnJlbnRDbGllbnRJZFNlcnZlcjogc3RyaW5nO1xuICAgIGlkU2VydmVyPzogc3RyaW5nO1xuICAgIGVycm9yPzogc3RyaW5nO1xuICAgIGJ1c3k6IGJvb2xlYW47XG4gICAgZGlzY29ubmVjdEJ1c3k6IGJvb2xlYW47XG4gICAgY2hlY2tpbmc6IGJvb2xlYW47XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnNldHRpbmdzLlNldElkU2VydmVyXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXRJZFNlcnZlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGxldCBkZWZhdWx0SWRTZXJ2ZXIgPSAnJztcbiAgICAgICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSAmJiBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgLy8gSWYgbm8gSUQgc2VydmVyIGlzIGNvbmZpZ3VyZWQgYnV0IHRoZXJlJ3Mgb25lIGluIHRoZSBjb25maWcsIHByZXBvcHVsYXRlXG4gICAgICAgICAgICAvLyB0aGUgZmllbGQgdG8gaGVscCB0aGUgdXNlci5cbiAgICAgICAgICAgIGRlZmF1bHRJZFNlcnZlciA9IGFiYnJldmlhdGVVcmwoZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGRlZmF1bHRJZFNlcnZlcixcbiAgICAgICAgICAgIGN1cnJlbnRDbGllbnRJZFNlcnZlcjogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCksXG4gICAgICAgICAgICBpZFNlcnZlcjogXCJcIixcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBkaXNjb25uZWN0QnVzeTogZmFsc2UsXG4gICAgICAgICAgICBjaGVja2luZzogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgLy8gV2UgcmVhY3QgdG8gY2hhbmdlcyBpbiB0aGUgSUQgc2VydmVyIGluIHRoZSBldmVudCB0aGUgdXNlciBpcyBzdGFyaW5nIGF0IHRoaXMgZm9ybVxuICAgICAgICAvLyB3aGVuIGNoYW5naW5nIHRoZWlyIGlkZW50aXR5IHNlcnZlciBvbiBhbm90aGVyIGRldmljZS5cbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uICE9PSBcImlkX3NlcnZlcl9jaGFuZ2VkXCIpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGN1cnJlbnRDbGllbnRJZFNlcnZlcjogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSWRlbnRpdHlTZXJ2ZXJDaGFuZ2VkID0gKGV2KSA9PiB7XG4gICAgICAgIGNvbnN0IHUgPSBldi50YXJnZXQudmFsdWU7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aWRTZXJ2ZXI6IHV9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRUb29sdGlwID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jaGVja2luZykge1xuICAgICAgICAgICAgY29uc3QgSW5saW5lU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLklubGluZVNwaW5uZXInKTtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgeyBfdChcIkNoZWNraW5nIHNlcnZlclwiKSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT0nd2FybmluZyc+e3RoaXMuc3RhdGUuZXJyb3J9PC9zcGFuPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgaWRTZXJ2ZXJDaGFuZ2VFbmFibGVkID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLnN0YXRlLmlkU2VydmVyICYmICF0aGlzLnN0YXRlLmJ1c3k7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2F2ZUlkU2VydmVyID0gKGZ1bGxVcmwpID0+IHtcbiAgICAgICAgLy8gQWNjb3VudCBkYXRhIGNoYW5nZSB3aWxsIHVwZGF0ZSBsb2NhbHN0b3JhZ2UsIGNsaWVudCwgZXRjIHRocm91Z2ggZGlzcGF0Y2hlclxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0QWNjb3VudERhdGEoXCJtLmlkZW50aXR5X3NlcnZlclwiLCB7XG4gICAgICAgICAgICBiYXNlX3VybDogZnVsbFVybCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGN1cnJlbnRDbGllbnRJZFNlcnZlcjogZnVsbFVybCxcbiAgICAgICAgICAgIGlkU2VydmVyOiAnJyxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY2hlY2tJZFNlcnZlciA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgeyBpZFNlcnZlciwgY3VycmVudENsaWVudElkU2VydmVyIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWUsIGNoZWNraW5nOiB0cnVlLCBlcnJvcjogbnVsbH0pO1xuXG4gICAgICAgIGNvbnN0IGZ1bGxVcmwgPSB1bmFiYnJldmlhdGVVcmwoaWRTZXJ2ZXIpO1xuXG4gICAgICAgIGxldCBlcnJTdHIgPSBhd2FpdCBjaGVja0lkZW50aXR5U2VydmVyVXJsKGZ1bGxVcmwpO1xuICAgICAgICBpZiAoIWVyclN0cikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjaGVja2luZzogZmFsc2V9KTsgLy8gY2xlYXIgdG9vbHRpcFxuXG4gICAgICAgICAgICAgICAgLy8gVGVzdCB0aGUgaWRlbnRpdHkgc2VydmVyIGJ5IHRyeWluZyB0byByZWdpc3RlciB3aXRoIGl0LiBUaGlzXG4gICAgICAgICAgICAgICAgLy8gbWF5IHJlc3VsdCBpbiBhIHRlcm1zIG9mIHNlcnZpY2UgcHJvbXB0LlxuICAgICAgICAgICAgICAgIGNvbnN0IGF1dGhDbGllbnQgPSBuZXcgSWRlbnRpdHlBdXRoQ2xpZW50KGZ1bGxVcmwpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGF1dGhDbGllbnQuZ2V0QWNjZXNzVG9rZW4oKTtcblxuICAgICAgICAgICAgICAgIGxldCBzYXZlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIC8vIERvdWJsZSBjaGVjayB0aGF0IHRoZSBpZGVudGl0eSBzZXJ2ZXIgZXZlbiBoYXMgdGVybXMgb2Ygc2VydmljZS5cbiAgICAgICAgICAgICAgICBjb25zdCBoYXNUZXJtcyA9IGF3YWl0IGRvZXNJZGVudGl0eVNlcnZlckhhdmVUZXJtcyhmdWxsVXJsKTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1Rlcm1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtjb25maXJtZWRdID0gYXdhaXQgdGhpcy5zaG93Tm9UZXJtc1dhcm5pbmcoZnVsbFVybCk7XG4gICAgICAgICAgICAgICAgICAgIHNhdmUgPSBjb25maXJtZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU2hvdyBhIGdlbmVyYWwgd2FybmluZywgcG9zc2libHkgd2l0aCBkZXRhaWxzIGFib3V0IGFueSBib3VuZFxuICAgICAgICAgICAgICAgIC8vIDNQSURzIHRoYXQgd291bGQgYmUgbGVmdCBiZWhpbmQuXG4gICAgICAgICAgICAgICAgaWYgKHNhdmUgJiYgY3VycmVudENsaWVudElkU2VydmVyICYmIGZ1bGxVcmwgIT09IGN1cnJlbnRDbGllbnRJZFNlcnZlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IHRoaXMuc2hvd1NlcnZlckNoYW5nZVdhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQ2hhbmdlIGlkZW50aXR5IHNlcnZlclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuYm91bmRNZXNzYWdlOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkRpc2Nvbm5lY3QgZnJvbSB0aGUgaWRlbnRpdHkgc2VydmVyIDxjdXJyZW50IC8+IGFuZCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb25uZWN0IHRvIDxuZXcgLz4gaW5zdGVhZD9cIiwge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBzdWIgPT4gPGI+e2FiYnJldmlhdGVVcmwoY3VycmVudENsaWVudElkU2VydmVyKX08L2I+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXc6IHN1YiA9PiA8Yj57YWJicmV2aWF0ZVVybChpZFNlcnZlcil9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDb250aW51ZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNhdmUgPSBjb25maXJtZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNhdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlSWRTZXJ2ZXIoZnVsbFVybCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgZXJyU3RyID0gX3QoXCJUZXJtcyBvZiBzZXJ2aWNlIG5vdCBhY2NlcHRlZCBvciB0aGUgaWRlbnRpdHkgc2VydmVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBjaGVja2luZzogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogZXJyU3RyLFxuICAgICAgICAgICAgY3VycmVudENsaWVudElkU2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2hvd05vVGVybXNXYXJuaW5nKGZ1bGxVcmwpIHtcbiAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5RdWVzdGlvbkRpYWxvZ1wiKTtcbiAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnTm8gVGVybXMgV2FybmluZycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiSWRlbnRpdHkgc2VydmVyIGhhcyBubyB0ZXJtcyBvZiBzZXJ2aWNlXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3YXJuaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJUaGUgaWRlbnRpdHkgc2VydmVyIHlvdSBoYXZlIGNob3NlbiBkb2VzIG5vdCBoYXZlIGFueSB0ZXJtcyBvZiBzZXJ2aWNlLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICZuYnNwO3tfdChcIk9ubHkgY29udGludWUgaWYgeW91IHRydXN0IHRoZSBvd25lciBvZiB0aGUgc2VydmVyLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDb250aW51ZVwiKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmaW5pc2hlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGlzY29ubmVjdENsaWNrZWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2Rpc2Nvbm5lY3RCdXN5OiB0cnVlfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IHRoaXMuc2hvd1NlcnZlckNoYW5nZVdhcm5pbmcoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkRpc2Nvbm5lY3QgaWRlbnRpdHkgc2VydmVyXCIpLFxuICAgICAgICAgICAgICAgIHVuYm91bmRNZXNzYWdlOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJEaXNjb25uZWN0IGZyb20gdGhlIGlkZW50aXR5IHNlcnZlciA8aWRzZXJ2ZXIgLz4/XCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7aWRzZXJ2ZXI6IHN1YiA9PiA8Yj57YWJicmV2aWF0ZVVybCh0aGlzLnN0YXRlLmN1cnJlbnRDbGllbnRJZFNlcnZlcil9PC9iPn0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBidXR0b246IF90KFwiRGlzY29ubmVjdFwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzY29ubmVjdElkU2VydmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtkaXNjb25uZWN0QnVzeTogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIHNob3dTZXJ2ZXJDaGFuZ2VXYXJuaW5nKHsgdGl0bGUsIHVuYm91bmRNZXNzYWdlLCBidXR0b24gfSkge1xuICAgICAgICBjb25zdCB7IGN1cnJlbnRDbGllbnRJZFNlcnZlciB9ID0gdGhpcy5zdGF0ZTtcblxuICAgICAgICBsZXQgdGhyZWVwaWRzID0gW107XG4gICAgICAgIGxldCBjdXJyZW50U2VydmVyUmVhY2hhYmxlID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocmVlcGlkcyA9IGF3YWl0IHRpbWVvdXQoXG4gICAgICAgICAgICAgICAgZ2V0VGhyZWVwaWRzV2l0aEJpbmRTdGF0dXMoTWF0cml4Q2xpZW50UGVnLmdldCgpKSxcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJUaW1lb3V0IGF0dGVtcHRpbmcgdG8gcmVhY2ggaWRlbnRpdHkgc2VydmVyXCIpKSxcbiAgICAgICAgICAgICAgICBSRUFDSEFCSUxJVFlfVElNRU9VVCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGN1cnJlbnRTZXJ2ZXJSZWFjaGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICBgVW5hYmxlIHRvIHJlYWNoIGlkZW50aXR5IHNlcnZlciBhdCAke2N1cnJlbnRDbGllbnRJZFNlcnZlcn0gdG8gY2hlY2sgYCArXG4gICAgICAgICAgICAgICAgYGZvciAzUElEcyBkdXJpbmcgSVMgY2hhbmdlIGZsb3dgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib3VuZFRocmVlcGlkcyA9IHRocmVlcGlkcy5maWx0ZXIodHAgPT4gdHAuYm91bmQpO1xuICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgbGV0IGRhbmdlciA9IGZhbHNlO1xuICAgICAgICBjb25zdCBtZXNzYWdlRWxlbWVudHMgPSB7XG4gICAgICAgICAgICBpZHNlcnZlcjogc3ViID0+IDxiPnthYmJyZXZpYXRlVXJsKGN1cnJlbnRDbGllbnRJZFNlcnZlcil9PC9iPixcbiAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57c3VifTwvYj4sXG4gICAgICAgIH07XG4gICAgICAgIGlmICghY3VycmVudFNlcnZlclJlYWNoYWJsZSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIllvdSBzaG91bGQgPGI+cmVtb3ZlIHlvdXIgcGVyc29uYWwgZGF0YTwvYj4gZnJvbSBpZGVudGl0eSBzZXJ2ZXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIjxpZHNlcnZlciAvPiBiZWZvcmUgZGlzY29ubmVjdGluZy4gVW5mb3J0dW5hdGVseSwgaWRlbnRpdHkgc2VydmVyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8aWRzZXJ2ZXIgLz4gaXMgY3VycmVudGx5IG9mZmxpbmUgb3IgY2Fubm90IGJlIHJlYWNoZWQuXCIsXG4gICAgICAgICAgICAgICAgICAgIHt9LCBtZXNzYWdlRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiWW91IHNob3VsZDpcIil9PC9wPlxuICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2hlY2sgeW91ciBicm93c2VyIHBsdWdpbnMgZm9yIGFueXRoaW5nIHRoYXQgbWlnaHQgYmxvY2sgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGUgaWRlbnRpdHkgc2VydmVyIChzdWNoIGFzIFByaXZhY3kgQmFkZ2VyKVwiLFxuICAgICAgICAgICAgICAgICAgICApfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJjb250YWN0IHRoZSBhZG1pbmlzdHJhdG9ycyBvZiBpZGVudGl0eSBzZXJ2ZXIgPGlkc2VydmVyIC8+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZHNlcnZlcjogbWVzc2FnZUVsZW1lbnRzLmlkc2VydmVyLFxuICAgICAgICAgICAgICAgICAgICB9KX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwid2FpdCBhbmQgdHJ5IGFnYWluIGxhdGVyXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIGRhbmdlciA9IHRydWU7XG4gICAgICAgICAgICBidXR0b24gPSBfdChcIkRpc2Nvbm5lY3QgYW55d2F5XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKGJvdW5kVGhyZWVwaWRzLmxlbmd0aCkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIllvdSBhcmUgc3RpbGwgPGI+c2hhcmluZyB5b3VyIHBlcnNvbmFsIGRhdGE8L2I+IG9uIHRoZSBpZGVudGl0eSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwic2VydmVyIDxpZHNlcnZlciAvPi5cIiwge30sIG1lc3NhZ2VFbGVtZW50cyxcbiAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiV2UgcmVjb21tZW5kIHRoYXQgeW91IHJlbW92ZSB5b3VyIGVtYWlsIGFkZHJlc3NlcyBhbmQgcGhvbmUgbnVtYmVycyBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiZnJvbSB0aGUgaWRlbnRpdHkgc2VydmVyIGJlZm9yZSBkaXNjb25uZWN0aW5nLlwiLFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgZGFuZ2VyID0gdHJ1ZTtcbiAgICAgICAgICAgIGJ1dHRvbiA9IF90KFwiRGlzY29ubmVjdCBhbnl3YXlcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gdW5ib3VuZE1lc3NhZ2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdJZGVudGl0eSBTZXJ2ZXIgQm91bmQgV2FybmluZycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWVzc2FnZSxcbiAgICAgICAgICAgIGJ1dHRvbixcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbjogX3QoXCJHbyBiYWNrXCIpLFxuICAgICAgICAgICAgZGFuZ2VyLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZpbmlzaGVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGlzY29ubmVjdElkU2VydmVyID0gKCkgPT4ge1xuICAgICAgICAvLyBBY2NvdW50IGRhdGEgY2hhbmdlIHdpbGwgdXBkYXRlIGxvY2Fsc3RvcmFnZSwgY2xpZW50LCBldGMgdGhyb3VnaCBkaXNwYXRjaGVyXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRBY2NvdW50RGF0YShcIm0uaWRlbnRpdHlfc2VydmVyXCIsIHtcbiAgICAgICAgICAgIGJhc2VfdXJsOiBudWxsLCAvLyBjbGVhclxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgbmV3RmllbGRWYWwgPSAnJztcbiAgICAgICAgaWYgKGdldERlZmF1bHRJZGVudGl0eVNlcnZlclVybCgpKSB7XG4gICAgICAgICAgICAvLyBQcmVwb3B1bGF0ZSB0aGUgY2xpZW50J3MgZGVmYXVsdCBzbyB0aGUgdXNlciBhdCBsZWFzdCBoYXMgc29tZSBpZGVhIG9mXG4gICAgICAgICAgICAvLyBhIHZhbGlkIHZhbHVlIHRoZXkgbWlnaHQgZW50ZXJcbiAgICAgICAgICAgIG5ld0ZpZWxkVmFsID0gYWJicmV2aWF0ZVVybChnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwoKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBjdXJyZW50Q2xpZW50SWRTZXJ2ZXI6IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpLFxuICAgICAgICAgICAgaWRTZXJ2ZXI6IG5ld0ZpZWxkVmFsLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuICAgICAgICBjb25zdCBGaWVsZCA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkZpZWxkJyk7XG4gICAgICAgIGNvbnN0IGlkU2VydmVyVXJsID0gdGhpcy5zdGF0ZS5jdXJyZW50Q2xpZW50SWRTZXJ2ZXI7XG4gICAgICAgIGxldCBzZWN0aW9uVGl0bGU7XG4gICAgICAgIGxldCBib2R5VGV4dDtcbiAgICAgICAgaWYgKGlkU2VydmVyVXJsKSB7XG4gICAgICAgICAgICBzZWN0aW9uVGl0bGUgPSBfdChcIklkZW50aXR5IFNlcnZlciAoJShzZXJ2ZXIpcylcIiwgeyBzZXJ2ZXI6IGFiYnJldmlhdGVVcmwoaWRTZXJ2ZXJVcmwpIH0pO1xuICAgICAgICAgICAgYm9keVRleHQgPSBfdChcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgY3VycmVudGx5IHVzaW5nIDxzZXJ2ZXI+PC9zZXJ2ZXI+IHRvIGRpc2NvdmVyIGFuZCBiZSBkaXNjb3ZlcmFibGUgYnkgXCIgK1xuICAgICAgICAgICAgICAgIFwiZXhpc3RpbmcgY29udGFjdHMgeW91IGtub3cuIFlvdSBjYW4gY2hhbmdlIHlvdXIgaWRlbnRpdHkgc2VydmVyIGJlbG93LlwiLFxuICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgIHsgc2VydmVyOiBzdWIgPT4gPGI+e2FiYnJldmlhdGVVcmwoaWRTZXJ2ZXJVcmwpfTwvYj4gfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5taXNzaW5nVGVybXMpIHtcbiAgICAgICAgICAgICAgICBib2R5VGV4dCA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSBkb24ndCB3YW50IHRvIHVzZSA8c2VydmVyIC8+IHRvIGRpc2NvdmVyIGFuZCBiZSBkaXNjb3ZlcmFibGUgYnkgZXhpc3RpbmcgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImNvbnRhY3RzIHlvdSBrbm93LCBlbnRlciBhbm90aGVyIGlkZW50aXR5IHNlcnZlciBiZWxvdy5cIixcbiAgICAgICAgICAgICAgICAgICAge30sIHtzZXJ2ZXI6IHN1YiA9PiA8Yj57YWJicmV2aWF0ZVVybChpZFNlcnZlclVybCl9PC9iPn0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlY3Rpb25UaXRsZSA9IF90KFwiSWRlbnRpdHkgU2VydmVyXCIpO1xuICAgICAgICAgICAgYm9keVRleHQgPSBfdChcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgbm90IGN1cnJlbnRseSB1c2luZyBhbiBpZGVudGl0eSBzZXJ2ZXIuIFwiICtcbiAgICAgICAgICAgICAgICBcIlRvIGRpc2NvdmVyIGFuZCBiZSBkaXNjb3ZlcmFibGUgYnkgZXhpc3RpbmcgY29udGFjdHMgeW91IGtub3csIFwiICtcbiAgICAgICAgICAgICAgICBcImFkZCBvbmUgYmVsb3cuXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRpc2NvU2VjdGlvbjtcbiAgICAgICAgaWYgKGlkU2VydmVyVXJsKSB7XG4gICAgICAgICAgICBsZXQgZGlzY29CdXR0b25Db250ZW50OiBSZWFjdC5SZWFjdE5vZGUgPSBfdChcIkRpc2Nvbm5lY3RcIik7XG4gICAgICAgICAgICBsZXQgZGlzY29Cb2R5VGV4dCA9IF90KFxuICAgICAgICAgICAgICAgIFwiRGlzY29ubmVjdGluZyBmcm9tIHlvdXIgaWRlbnRpdHkgc2VydmVyIHdpbGwgbWVhbiB5b3UgXCIgK1xuICAgICAgICAgICAgICAgIFwid29uJ3QgYmUgZGlzY292ZXJhYmxlIGJ5IG90aGVyIHVzZXJzIGFuZCB5b3Ugd29uJ3QgYmUgXCIgK1xuICAgICAgICAgICAgICAgIFwiYWJsZSB0byBpbnZpdGUgb3RoZXJzIGJ5IGVtYWlsIG9yIHBob25lLlwiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm1pc3NpbmdUZXJtcykge1xuICAgICAgICAgICAgICAgIGRpc2NvQm9keVRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJVc2luZyBhbiBpZGVudGl0eSBzZXJ2ZXIgaXMgb3B0aW9uYWwuIElmIHlvdSBjaG9vc2Ugbm90IHRvIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ1c2UgYW4gaWRlbnRpdHkgc2VydmVyLCB5b3Ugd29uJ3QgYmUgZGlzY292ZXJhYmxlIGJ5IG90aGVyIHVzZXJzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJhbmQgeW91IHdvbid0IGJlIGFibGUgdG8gaW52aXRlIG90aGVycyBieSBlbWFpbCBvciBwaG9uZS5cIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGRpc2NvQnV0dG9uQ29udGVudCA9IF90KFwiRG8gbm90IHVzZSBhbiBpZGVudGl0eSBzZXJ2ZXJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5kaXNjb25uZWN0QnVzeSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IElubGluZVNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5JbmxpbmVTcGlubmVyJyk7XG4gICAgICAgICAgICAgICAgZGlzY29CdXR0b25Db250ZW50ID0gPElubGluZVNwaW5uZXIgLz47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXNjb1NlY3Rpb24gPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0XCI+e2Rpc2NvQm9keVRleHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25EaXNjb25uZWN0Q2xpY2tlZH0ga2luZD1cImRhbmdlcl9zbVwiPlxuICAgICAgICAgICAgICAgICAgICB7ZGlzY29CdXR0b25Db250ZW50fVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldElkU2VydmVyXCIgb25TdWJtaXQ9e3RoaXMuY2hlY2tJZFNlcnZlcn0+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPlxuICAgICAgICAgICAgICAgICAgICB7c2VjdGlvblRpdGxlfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7Ym9keVRleHR9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJFbnRlciBhIG5ldyBpZGVudGl0eSBzZXJ2ZXJcIil9XG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMuc3RhdGUuZGVmYXVsdElkU2VydmVyfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5pZFNlcnZlcn1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25JZGVudGl0eVNlcnZlckNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBDb250ZW50PXt0aGlzLmdldFRvb2x0aXAoKX1cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1NldElkU2VydmVyX3Rvb2x0aXBcIlxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbGlkaXR5PXt0aGlzLnN0YXRlLmVycm9yID8gZmFsc2UgOiBudWxsfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gdHlwZT1cInN1Ym1pdFwiIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5jaGVja0lkU2VydmVyfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuaWRTZXJ2ZXJDaGFuZ2VFbmFibGVkKCl9XG4gICAgICAgICAgICAgICAgPntfdChcIkNoYW5nZVwiKX08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAge2Rpc2NvU2VjdGlvbn1cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
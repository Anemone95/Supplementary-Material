"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

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

/*
Copyright 2019 The Matrix.org Foundation C.I.C.

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

class SetIdServer extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "onAction", payload => {
      // We react to changes in the ID server in the event the user is staring at this form
      // when changing their identity server on another device.
      if (payload.action !== "id_server_changed") return;
      this.setState({
        currentClientIdServer: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()
      });
    });
    (0, _defineProperty2.default)(this, "_onIdentityServerChanged", ev => {
      const u = ev.target.value;
      this.setState({
        idServer: u
      });
    });
    (0, _defineProperty2.default)(this, "_getTooltip", () => {
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
    (0, _defineProperty2.default)(this, "_idServerChangeEnabled", () => {
      return !!this.state.idServer && !this.state.busy;
    });
    (0, _defineProperty2.default)(this, "_saveIdServer", fullUrl => {
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
    (0, _defineProperty2.default)(this, "_checkIdServer", async e => {
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
            const [confirmed] = await this._showNoTermsWarning(fullUrl);
            save = confirmed;
          } // Show a general warning, possibly with details about any bound
          // 3PIDs that would be left behind.


          if (save && currentClientIdServer && fullUrl !== currentClientIdServer) {
            const [confirmed] = await this._showServerChangeWarning({
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
            this._saveIdServer(fullUrl);
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
    (0, _defineProperty2.default)(this, "_onDisconnectClicked", async () => {
      this.setState({
        disconnectBusy: true
      });

      try {
        const [confirmed] = await this._showServerChangeWarning({
          title: (0, _languageHandler._t)("Disconnect identity server"),
          unboundMessage: (0, _languageHandler._t)("Disconnect from the identity server <idserver />?", {}, {
            idserver: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(this.state.currentClientIdServer))
          }),
          button: (0, _languageHandler._t)("Disconnect")
        });

        if (confirmed) {
          this._disconnectIdServer();
        }
      } finally {
        this.setState({
          disconnectBusy: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "_disconnectIdServer", () => {
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

  _showNoTermsWarning(fullUrl) {
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

  async _showServerChangeWarning({
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
      let discoButtonContent = (0, _languageHandler._t)("Disconnect");
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
        onClick: this._onDisconnectClicked,
        kind: "danger_sm"
      }, discoButtonContent));
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      className: "mx_SettingsTab_section mx_SetIdServer",
      onSubmit: this._checkIdServer
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
      onChange: this._onIdentityServerChanged,
      tooltipContent: this._getTooltip(),
      tooltipClassName: "mx_SetIdServer_tooltip",
      disabled: this.state.busy,
      forceValidity: this.state.error ? false : null
    }), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      type: "submit",
      kind: "primary_sm",
      onClick: this._checkIdServer,
      disabled: !this._idServerChangeEnabled()
    }, (0, _languageHandler._t)("Change")), discoSection);
  }

}

exports.default = SetIdServer;
(0, _defineProperty2.default)(SetIdServer, "propTypes", {
  // Whether or not the ID server is missing terms. This affects the text
  // shown to the user.
  missingTerms: _propTypes.default.bool
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL1NldElkU2VydmVyLmpzIl0sIm5hbWVzIjpbIlJFQUNIQUJJTElUWV9USU1FT1VUIiwiY2hlY2tJZGVudGl0eVNlcnZlclVybCIsInUiLCJwYXJzZWRVcmwiLCJ1cmwiLCJwYXJzZSIsInByb3RvY29sIiwicmVzcG9uc2UiLCJmZXRjaCIsIm9rIiwic3RhdHVzIiwiY29kZSIsImUiLCJTZXRJZFNlcnZlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwYXlsb2FkIiwiYWN0aW9uIiwic2V0U3RhdGUiLCJjdXJyZW50Q2xpZW50SWRTZXJ2ZXIiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRJZGVudGl0eVNlcnZlclVybCIsImV2IiwidGFyZ2V0IiwidmFsdWUiLCJpZFNlcnZlciIsInN0YXRlIiwiY2hlY2tpbmciLCJJbmxpbmVTcGlubmVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiZXJyb3IiLCJidXN5IiwiZnVsbFVybCIsInNldEFjY291bnREYXRhIiwiYmFzZV91cmwiLCJwcmV2ZW50RGVmYXVsdCIsImVyclN0ciIsImF1dGhDbGllbnQiLCJJZGVudGl0eUF1dGhDbGllbnQiLCJnZXRBY2Nlc3NUb2tlbiIsInNhdmUiLCJoYXNUZXJtcyIsImNvbmZpcm1lZCIsIl9zaG93Tm9UZXJtc1dhcm5pbmciLCJfc2hvd1NlcnZlckNoYW5nZVdhcm5pbmciLCJ0aXRsZSIsInVuYm91bmRNZXNzYWdlIiwiY3VycmVudCIsInN1YiIsIm5ldyIsImJ1dHRvbiIsIl9zYXZlSWRTZXJ2ZXIiLCJjb25zb2xlIiwiZGlzY29ubmVjdEJ1c3kiLCJpZHNlcnZlciIsIl9kaXNjb25uZWN0SWRTZXJ2ZXIiLCJuZXdGaWVsZFZhbCIsImRlZmF1bHRJZFNlcnZlciIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJRdWVzdGlvbkRpYWxvZyIsImZpbmlzaGVkIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiZGVzY3JpcHRpb24iLCJ0aHJlZXBpZHMiLCJjdXJyZW50U2VydmVyUmVhY2hhYmxlIiwiUHJvbWlzZSIsInJlamVjdCIsIkVycm9yIiwid2FybiIsImJvdW5kVGhyZWVwaWRzIiwiZmlsdGVyIiwidHAiLCJib3VuZCIsIm1lc3NhZ2UiLCJkYW5nZXIiLCJtZXNzYWdlRWxlbWVudHMiLCJiIiwibGVuZ3RoIiwiY2FuY2VsQnV0dG9uIiwicmVuZGVyIiwiQWNjZXNzaWJsZUJ1dHRvbiIsIkZpZWxkIiwiaWRTZXJ2ZXJVcmwiLCJzZWN0aW9uVGl0bGUiLCJib2R5VGV4dCIsInNlcnZlciIsInByb3BzIiwibWlzc2luZ1Rlcm1zIiwiZGlzY29TZWN0aW9uIiwiZGlzY29CdXR0b25Db250ZW50IiwiZGlzY29Cb2R5VGV4dCIsIl9vbkRpc2Nvbm5lY3RDbGlja2VkIiwiX2NoZWNrSWRTZXJ2ZXIiLCJfb25JZGVudGl0eVNlcnZlckNoYW5nZWQiLCJfZ2V0VG9vbHRpcCIsIl9pZFNlcnZlckNoYW5nZUVuYWJsZWQiLCJQcm9wVHlwZXMiLCJib29sIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFnQkE7QUFDQSxNQUFNQSxvQkFBb0IsR0FBRyxLQUE3QixDLENBQW9DOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsZUFBZUMsc0JBQWYsQ0FBc0NDLENBQXRDLEVBQXlDO0FBQ3JDLFFBQU1DLFNBQVMsR0FBR0MsYUFBSUMsS0FBSixDQUFV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RixDQW5CSixFQXVCS1AsWUF2QkwsQ0FESjtBQTJCSDs7QUE1V29EOzs7OEJBQXBDckYsVyxlQUNFO0FBQ2Y7QUFDQTtBQUNBb0YsRUFBQUEsWUFBWSxFQUFFUyxtQkFBVUM7QUFIVCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IGdldFRocmVlcGlkc1dpdGhCaW5kU3RhdHVzIH0gZnJvbSAnLi4vLi4vLi4vYm91bmRUaHJlZXBpZHMnO1xuaW1wb3J0IElkZW50aXR5QXV0aENsaWVudCBmcm9tIFwiLi4vLi4vLi4vSWRlbnRpdHlBdXRoQ2xpZW50XCI7XG5pbXBvcnQge2FiYnJldmlhdGVVcmwsIHVuYWJicmV2aWF0ZVVybH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL1VybFV0aWxzXCI7XG5pbXBvcnQgeyBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwsIGRvZXNJZGVudGl0eVNlcnZlckhhdmVUZXJtcyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0lkZW50aXR5U2VydmVyVXRpbHMnO1xuaW1wb3J0IHt0aW1lb3V0fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcHJvbWlzZVwiO1xuXG4vLyBXZSdsbCB3YWl0IHVwIHRvIHRoaXMgbG9uZyB3aGVuIGNoZWNraW5nIGZvciAzUElEIGJpbmRpbmdzIG9uIHRoZSBJUy5cbmNvbnN0IFJFQUNIQUJJTElUWV9USU1FT1VUID0gMTAwMDA7IC8vIG1zXG5cbi8qKlxuICogQ2hlY2sgYW4gSVMgVVJMIGlzIHZhbGlkLCBpbmNsdWRpbmcgbGl2ZW5lc3MgY2hlY2tcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdSBUaGUgdXJsIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBudWxsIGlmIHVybCBwYXNzZXMgYWxsIGNoZWNrcywgb3RoZXJ3aXNlIGkxOG5lZCBlcnJvciBzdHJpbmdcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY2hlY2tJZGVudGl0eVNlcnZlclVybCh1KSB7XG4gICAgY29uc3QgcGFyc2VkVXJsID0gdXJsLnBhcnNlKHUpO1xuXG4gICAgaWYgKHBhcnNlZFVybC5wcm90b2NvbCAhPT0gJ2h0dHBzOicpIHJldHVybiBfdChcIklkZW50aXR5IFNlcnZlciBVUkwgbXVzdCBiZSBIVFRQU1wiKTtcblxuICAgIC8vIFhYWDogZHVwbGljYXRlZCBsb2dpYyBmcm9tIGpzLXNkayBidXQgaXQncyBxdWl0ZSB0aWVkIHVwIGluIHRoZSB2YWxpZGF0aW9uIGxvZ2ljIGluIHRoZVxuICAgIC8vIGpzLXNkayBzbyBwcm9iYWJseSBhcyBlYXN5IHRvIGR1cGxpY2F0ZSBpdCB0aGFuIHRvIHNlcGFyYXRlIGl0IG91dCBzbyB3ZSBjYW4gcmV1c2UgaXRcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHUgKyAnL19tYXRyaXgvaWRlbnRpdHkvYXBpL3YxJyk7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIk5vdCBhIHZhbGlkIElkZW50aXR5IFNlcnZlciAoc3RhdHVzIGNvZGUgJShjb2RlKXMpXCIsIHtjb2RlOiByZXNwb25zZS5zdGF0dXN9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIkNvdWxkIG5vdCBjb25uZWN0IHRvIElkZW50aXR5IFNlcnZlclwiKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIF90KFwiQ291bGQgbm90IGNvbm5lY3QgdG8gSWRlbnRpdHkgU2VydmVyXCIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2V0SWRTZXJ2ZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8vIFdoZXRoZXIgb3Igbm90IHRoZSBJRCBzZXJ2ZXIgaXMgbWlzc2luZyB0ZXJtcy4gVGhpcyBhZmZlY3RzIHRoZSB0ZXh0XG4gICAgICAgIC8vIHNob3duIHRvIHRoZSB1c2VyLlxuICAgICAgICBtaXNzaW5nVGVybXM6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBsZXQgZGVmYXVsdElkU2VydmVyID0gJyc7XG4gICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCkgJiYgZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsKCkpIHtcbiAgICAgICAgICAgIC8vIElmIG5vIElEIHNlcnZlciBpcyBjb25maWd1cmVkIGJ1dCB0aGVyZSdzIG9uZSBpbiB0aGUgY29uZmlnLCBwcmVwb3B1bGF0ZVxuICAgICAgICAgICAgLy8gdGhlIGZpZWxkIHRvIGhlbHAgdGhlIHVzZXIuXG4gICAgICAgICAgICBkZWZhdWx0SWRTZXJ2ZXIgPSBhYmJyZXZpYXRlVXJsKGdldERlZmF1bHRJZGVudGl0eVNlcnZlclVybCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBkZWZhdWx0SWRTZXJ2ZXIsXG4gICAgICAgICAgICBjdXJyZW50Q2xpZW50SWRTZXJ2ZXI6IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpLFxuICAgICAgICAgICAgaWRTZXJ2ZXI6IFwiXCIsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgZGlzY29ubmVjdEJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgY2hlY2tpbmc6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgb25BY3Rpb24gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICAvLyBXZSByZWFjdCB0byBjaGFuZ2VzIGluIHRoZSBJRCBzZXJ2ZXIgaW4gdGhlIGV2ZW50IHRoZSB1c2VyIGlzIHN0YXJpbmcgYXQgdGhpcyBmb3JtXG4gICAgICAgIC8vIHdoZW4gY2hhbmdpbmcgdGhlaXIgaWRlbnRpdHkgc2VydmVyIG9uIGFub3RoZXIgZGV2aWNlLlxuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gIT09IFwiaWRfc2VydmVyX2NoYW5nZWRcIikgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY3VycmVudENsaWVudElkU2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbklkZW50aXR5U2VydmVyQ2hhbmdlZCA9IChldikgPT4ge1xuICAgICAgICBjb25zdCB1ID0gZXYudGFyZ2V0LnZhbHVlO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lkU2VydmVyOiB1fSk7XG4gICAgfTtcblxuICAgIF9nZXRUb29sdGlwID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jaGVja2luZykge1xuICAgICAgICAgICAgY29uc3QgSW5saW5lU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLklubGluZVNwaW5uZXInKTtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgeyBfdChcIkNoZWNraW5nIHNlcnZlclwiKSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT0nd2FybmluZyc+e3RoaXMuc3RhdGUuZXJyb3J9PC9zcGFuPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9pZFNlcnZlckNoYW5nZUVuYWJsZWQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuc3RhdGUuaWRTZXJ2ZXIgJiYgIXRoaXMuc3RhdGUuYnVzeTtcbiAgICB9O1xuXG4gICAgX3NhdmVJZFNlcnZlciA9IChmdWxsVXJsKSA9PiB7XG4gICAgICAgIC8vIEFjY291bnQgZGF0YSBjaGFuZ2Ugd2lsbCB1cGRhdGUgbG9jYWxzdG9yYWdlLCBjbGllbnQsIGV0YyB0aHJvdWdoIGRpc3BhdGNoZXJcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldEFjY291bnREYXRhKFwibS5pZGVudGl0eV9zZXJ2ZXJcIiwge1xuICAgICAgICAgICAgYmFzZV91cmw6IGZ1bGxVcmwsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBjdXJyZW50Q2xpZW50SWRTZXJ2ZXI6IGZ1bGxVcmwsXG4gICAgICAgICAgICBpZFNlcnZlcjogJycsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfY2hlY2tJZFNlcnZlciA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgeyBpZFNlcnZlciwgY3VycmVudENsaWVudElkU2VydmVyIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWUsIGNoZWNraW5nOiB0cnVlLCBlcnJvcjogbnVsbH0pO1xuXG4gICAgICAgIGNvbnN0IGZ1bGxVcmwgPSB1bmFiYnJldmlhdGVVcmwoaWRTZXJ2ZXIpO1xuXG4gICAgICAgIGxldCBlcnJTdHIgPSBhd2FpdCBjaGVja0lkZW50aXR5U2VydmVyVXJsKGZ1bGxVcmwpO1xuICAgICAgICBpZiAoIWVyclN0cikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjaGVja2luZzogZmFsc2V9KTsgLy8gY2xlYXIgdG9vbHRpcFxuXG4gICAgICAgICAgICAgICAgLy8gVGVzdCB0aGUgaWRlbnRpdHkgc2VydmVyIGJ5IHRyeWluZyB0byByZWdpc3RlciB3aXRoIGl0LiBUaGlzXG4gICAgICAgICAgICAgICAgLy8gbWF5IHJlc3VsdCBpbiBhIHRlcm1zIG9mIHNlcnZpY2UgcHJvbXB0LlxuICAgICAgICAgICAgICAgIGNvbnN0IGF1dGhDbGllbnQgPSBuZXcgSWRlbnRpdHlBdXRoQ2xpZW50KGZ1bGxVcmwpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGF1dGhDbGllbnQuZ2V0QWNjZXNzVG9rZW4oKTtcblxuICAgICAgICAgICAgICAgIGxldCBzYXZlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIC8vIERvdWJsZSBjaGVjayB0aGF0IHRoZSBpZGVudGl0eSBzZXJ2ZXIgZXZlbiBoYXMgdGVybXMgb2Ygc2VydmljZS5cbiAgICAgICAgICAgICAgICBjb25zdCBoYXNUZXJtcyA9IGF3YWl0IGRvZXNJZGVudGl0eVNlcnZlckhhdmVUZXJtcyhmdWxsVXJsKTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1Rlcm1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtjb25maXJtZWRdID0gYXdhaXQgdGhpcy5fc2hvd05vVGVybXNXYXJuaW5nKGZ1bGxVcmwpO1xuICAgICAgICAgICAgICAgICAgICBzYXZlID0gY29uZmlybWVkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFNob3cgYSBnZW5lcmFsIHdhcm5pbmcsIHBvc3NpYmx5IHdpdGggZGV0YWlscyBhYm91dCBhbnkgYm91bmRcbiAgICAgICAgICAgICAgICAvLyAzUElEcyB0aGF0IHdvdWxkIGJlIGxlZnQgYmVoaW5kLlxuICAgICAgICAgICAgICAgIGlmIChzYXZlICYmIGN1cnJlbnRDbGllbnRJZFNlcnZlciAmJiBmdWxsVXJsICE9PSBjdXJyZW50Q2xpZW50SWRTZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW2NvbmZpcm1lZF0gPSBhd2FpdCB0aGlzLl9zaG93U2VydmVyQ2hhbmdlV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJDaGFuZ2UgaWRlbnRpdHkgc2VydmVyXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5ib3VuZE1lc3NhZ2U6IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRGlzY29ubmVjdCBmcm9tIHRoZSBpZGVudGl0eSBzZXJ2ZXIgPGN1cnJlbnQgLz4gYW5kIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbm5lY3QgdG8gPG5ldyAvPiBpbnN0ZWFkP1wiLCB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IHN1YiA9PiA8Yj57YWJicmV2aWF0ZVVybChjdXJyZW50Q2xpZW50SWRTZXJ2ZXIpfTwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldzogc3ViID0+IDxiPnthYmJyZXZpYXRlVXJsKGlkU2VydmVyKX08L2I+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiBfdChcIkNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2F2ZSA9IGNvbmZpcm1lZDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2F2ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zYXZlSWRTZXJ2ZXIoZnVsbFVybCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgZXJyU3RyID0gX3QoXCJUZXJtcyBvZiBzZXJ2aWNlIG5vdCBhY2NlcHRlZCBvciB0aGUgaWRlbnRpdHkgc2VydmVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBjaGVja2luZzogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogZXJyU3RyLFxuICAgICAgICAgICAgY3VycmVudENsaWVudElkU2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9zaG93Tm9UZXJtc1dhcm5pbmcoZnVsbFVybCkge1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdObyBUZXJtcyBXYXJuaW5nJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJJZGVudGl0eSBzZXJ2ZXIgaGFzIG5vIHRlcm1zIG9mIHNlcnZpY2VcIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndhcm5pbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlRoZSBpZGVudGl0eSBzZXJ2ZXIgeW91IGhhdmUgY2hvc2VuIGRvZXMgbm90IGhhdmUgYW55IHRlcm1zIG9mIHNlcnZpY2UuXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgJm5ic3A7e190KFwiT25seSBjb250aW51ZSBpZiB5b3UgdHJ1c3QgdGhlIG93bmVyIG9mIHRoZSBzZXJ2ZXIuXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIkNvbnRpbnVlXCIpLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZpbmlzaGVkO1xuICAgIH1cblxuICAgIF9vbkRpc2Nvbm5lY3RDbGlja2VkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtkaXNjb25uZWN0QnVzeTogdHJ1ZX0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgW2NvbmZpcm1lZF0gPSBhd2FpdCB0aGlzLl9zaG93U2VydmVyQ2hhbmdlV2FybmluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRGlzY29ubmVjdCBpZGVudGl0eSBzZXJ2ZXJcIiksXG4gICAgICAgICAgICAgICAgdW5ib3VuZE1lc3NhZ2U6IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkRpc2Nvbm5lY3QgZnJvbSB0aGUgaWRlbnRpdHkgc2VydmVyIDxpZHNlcnZlciAvPj9cIiwge30sXG4gICAgICAgICAgICAgICAgICAgIHtpZHNlcnZlcjogc3ViID0+IDxiPnthYmJyZXZpYXRlVXJsKHRoaXMuc3RhdGUuY3VycmVudENsaWVudElkU2VydmVyKX08L2I+fSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJEaXNjb25uZWN0XCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY29uZmlybWVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzY29ubmVjdElkU2VydmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtkaXNjb25uZWN0QnVzeTogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYyBfc2hvd1NlcnZlckNoYW5nZVdhcm5pbmcoeyB0aXRsZSwgdW5ib3VuZE1lc3NhZ2UsIGJ1dHRvbiB9KSB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudENsaWVudElkU2VydmVyIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGxldCB0aHJlZXBpZHMgPSBbXTtcbiAgICAgICAgbGV0IGN1cnJlbnRTZXJ2ZXJSZWFjaGFibGUgPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyZWVwaWRzID0gYXdhaXQgdGltZW91dChcbiAgICAgICAgICAgICAgICBnZXRUaHJlZXBpZHNXaXRoQmluZFN0YXR1cyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkpLFxuICAgICAgICAgICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIlRpbWVvdXQgYXR0ZW1wdGluZyB0byByZWFjaCBpZGVudGl0eSBzZXJ2ZXJcIikpLFxuICAgICAgICAgICAgICAgIFJFQUNIQUJJTElUWV9USU1FT1VULFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY3VycmVudFNlcnZlclJlYWNoYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgIGBVbmFibGUgdG8gcmVhY2ggaWRlbnRpdHkgc2VydmVyIGF0ICR7Y3VycmVudENsaWVudElkU2VydmVyfSB0byBjaGVjayBgICtcbiAgICAgICAgICAgICAgICBgZm9yIDNQSURzIGR1cmluZyBJUyBjaGFuZ2UgZmxvd2AsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvdW5kVGhyZWVwaWRzID0gdGhyZWVwaWRzLmZpbHRlcih0cCA9PiB0cC5ib3VuZCk7XG4gICAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgICBsZXQgZGFuZ2VyID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VFbGVtZW50cyA9IHtcbiAgICAgICAgICAgIGlkc2VydmVyOiBzdWIgPT4gPGI+e2FiYnJldmlhdGVVcmwoY3VycmVudENsaWVudElkU2VydmVyKX08L2I+LFxuICAgICAgICAgICAgYjogc3ViID0+IDxiPntzdWJ9PC9iPixcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFjdXJyZW50U2VydmVyUmVhY2hhYmxlKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiWW91IHNob3VsZCA8Yj5yZW1vdmUgeW91ciBwZXJzb25hbCBkYXRhPC9iPiBmcm9tIGlkZW50aXR5IHNlcnZlciBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGlkc2VydmVyIC8+IGJlZm9yZSBkaXNjb25uZWN0aW5nLiBVbmZvcnR1bmF0ZWx5LCBpZGVudGl0eSBzZXJ2ZXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIjxpZHNlcnZlciAvPiBpcyBjdXJyZW50bHkgb2ZmbGluZSBvciBjYW5ub3QgYmUgcmVhY2hlZC5cIixcbiAgICAgICAgICAgICAgICAgICAge30sIG1lc3NhZ2VFbGVtZW50cyxcbiAgICAgICAgICAgICAgICApfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJZb3Ugc2hvdWxkOlwiKX08L3A+XG4gICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjaGVjayB5b3VyIGJyb3dzZXIgcGx1Z2lucyBmb3IgYW55dGhpbmcgdGhhdCBtaWdodCBibG9jayBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZSBpZGVudGl0eSBzZXJ2ZXIgKHN1Y2ggYXMgUHJpdmFjeSBCYWRnZXIpXCIsXG4gICAgICAgICAgICAgICAgICAgICl9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcImNvbnRhY3QgdGhlIGFkbWluaXN0cmF0b3JzIG9mIGlkZW50aXR5IHNlcnZlciA8aWRzZXJ2ZXIgLz5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkc2VydmVyOiBtZXNzYWdlRWxlbWVudHMuaWRzZXJ2ZXIsXG4gICAgICAgICAgICAgICAgICAgIH0pfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJ3YWl0IGFuZCB0cnkgYWdhaW4gbGF0ZXJcIil9PC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgZGFuZ2VyID0gdHJ1ZTtcbiAgICAgICAgICAgIGJ1dHRvbiA9IF90KFwiRGlzY29ubmVjdCBhbnl3YXlcIik7XG4gICAgICAgIH0gZWxzZSBpZiAoYm91bmRUaHJlZXBpZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiWW91IGFyZSBzdGlsbCA8Yj5zaGFyaW5nIHlvdXIgcGVyc29uYWwgZGF0YTwvYj4gb24gdGhlIGlkZW50aXR5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJzZXJ2ZXIgPGlkc2VydmVyIC8+LlwiLCB7fSwgbWVzc2FnZUVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJXZSByZWNvbW1lbmQgdGhhdCB5b3UgcmVtb3ZlIHlvdXIgZW1haWwgYWRkcmVzc2VzIGFuZCBwaG9uZSBudW1iZXJzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJmcm9tIHRoZSBpZGVudGl0eSBzZXJ2ZXIgYmVmb3JlIGRpc2Nvbm5lY3RpbmcuXCIsXG4gICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICBkYW5nZXIgPSB0cnVlO1xuICAgICAgICAgICAgYnV0dG9uID0gX3QoXCJEaXNjb25uZWN0IGFueXdheVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSB1bmJvdW5kTWVzc2FnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0lkZW50aXR5IFNlcnZlciBCb3VuZCBXYXJuaW5nJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtZXNzYWdlLFxuICAgICAgICAgICAgYnV0dG9uLFxuICAgICAgICAgICAgY2FuY2VsQnV0dG9uOiBfdChcIkdvIGJhY2tcIiksXG4gICAgICAgICAgICBkYW5nZXIsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmluaXNoZWQ7XG4gICAgfVxuXG4gICAgX2Rpc2Nvbm5lY3RJZFNlcnZlciA9ICgpID0+IHtcbiAgICAgICAgLy8gQWNjb3VudCBkYXRhIGNoYW5nZSB3aWxsIHVwZGF0ZSBsb2NhbHN0b3JhZ2UsIGNsaWVudCwgZXRjIHRocm91Z2ggZGlzcGF0Y2hlclxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0QWNjb3VudERhdGEoXCJtLmlkZW50aXR5X3NlcnZlclwiLCB7XG4gICAgICAgICAgICBiYXNlX3VybDogbnVsbCwgLy8gY2xlYXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IG5ld0ZpZWxkVmFsID0gJyc7XG4gICAgICAgIGlmIChnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgLy8gUHJlcG9wdWxhdGUgdGhlIGNsaWVudCdzIGRlZmF1bHQgc28gdGhlIHVzZXIgYXQgbGVhc3QgaGFzIHNvbWUgaWRlYSBvZlxuICAgICAgICAgICAgLy8gYSB2YWxpZCB2YWx1ZSB0aGV5IG1pZ2h0IGVudGVyXG4gICAgICAgICAgICBuZXdGaWVsZFZhbCA9IGFiYnJldmlhdGVVcmwoZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgY3VycmVudENsaWVudElkU2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgICAgIGlkU2VydmVyOiBuZXdGaWVsZFZhbCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5GaWVsZCcpO1xuICAgICAgICBjb25zdCBpZFNlcnZlclVybCA9IHRoaXMuc3RhdGUuY3VycmVudENsaWVudElkU2VydmVyO1xuICAgICAgICBsZXQgc2VjdGlvblRpdGxlO1xuICAgICAgICBsZXQgYm9keVRleHQ7XG4gICAgICAgIGlmIChpZFNlcnZlclVybCkge1xuICAgICAgICAgICAgc2VjdGlvblRpdGxlID0gX3QoXCJJZGVudGl0eSBTZXJ2ZXIgKCUoc2VydmVyKXMpXCIsIHsgc2VydmVyOiBhYmJyZXZpYXRlVXJsKGlkU2VydmVyVXJsKSB9KTtcbiAgICAgICAgICAgIGJvZHlUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGN1cnJlbnRseSB1c2luZyA8c2VydmVyPjwvc2VydmVyPiB0byBkaXNjb3ZlciBhbmQgYmUgZGlzY292ZXJhYmxlIGJ5IFwiICtcbiAgICAgICAgICAgICAgICBcImV4aXN0aW5nIGNvbnRhY3RzIHlvdSBrbm93LiBZb3UgY2FuIGNoYW5nZSB5b3VyIGlkZW50aXR5IHNlcnZlciBiZWxvdy5cIixcbiAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICB7IHNlcnZlcjogc3ViID0+IDxiPnthYmJyZXZpYXRlVXJsKGlkU2VydmVyVXJsKX08L2I+IH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubWlzc2luZ1Rlcm1zKSB7XG4gICAgICAgICAgICAgICAgYm9keVRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgPHNlcnZlciAvPiB0byBkaXNjb3ZlciBhbmQgYmUgZGlzY292ZXJhYmxlIGJ5IGV4aXN0aW5nIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJjb250YWN0cyB5b3Uga25vdywgZW50ZXIgYW5vdGhlciBpZGVudGl0eSBzZXJ2ZXIgYmVsb3cuXCIsXG4gICAgICAgICAgICAgICAgICAgIHt9LCB7c2VydmVyOiBzdWIgPT4gPGI+e2FiYnJldmlhdGVVcmwoaWRTZXJ2ZXJVcmwpfTwvYj59LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWN0aW9uVGl0bGUgPSBfdChcIklkZW50aXR5IFNlcnZlclwiKTtcbiAgICAgICAgICAgIGJvZHlUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIG5vdCBjdXJyZW50bHkgdXNpbmcgYW4gaWRlbnRpdHkgc2VydmVyLiBcIiArXG4gICAgICAgICAgICAgICAgXCJUbyBkaXNjb3ZlciBhbmQgYmUgZGlzY292ZXJhYmxlIGJ5IGV4aXN0aW5nIGNvbnRhY3RzIHlvdSBrbm93LCBcIiArXG4gICAgICAgICAgICAgICAgXCJhZGQgb25lIGJlbG93LlwiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkaXNjb1NlY3Rpb247XG4gICAgICAgIGlmIChpZFNlcnZlclVybCkge1xuICAgICAgICAgICAgbGV0IGRpc2NvQnV0dG9uQ29udGVudCA9IF90KFwiRGlzY29ubmVjdFwiKTtcbiAgICAgICAgICAgIGxldCBkaXNjb0JvZHlUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgXCJEaXNjb25uZWN0aW5nIGZyb20geW91ciBpZGVudGl0eSBzZXJ2ZXIgd2lsbCBtZWFuIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgXCJ3b24ndCBiZSBkaXNjb3ZlcmFibGUgYnkgb3RoZXIgdXNlcnMgYW5kIHlvdSB3b24ndCBiZSBcIiArXG4gICAgICAgICAgICAgICAgXCJhYmxlIHRvIGludml0ZSBvdGhlcnMgYnkgZW1haWwgb3IgcGhvbmUuXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubWlzc2luZ1Rlcm1zKSB7XG4gICAgICAgICAgICAgICAgZGlzY29Cb2R5VGV4dCA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlVzaW5nIGFuIGlkZW50aXR5IHNlcnZlciBpcyBvcHRpb25hbC4gSWYgeW91IGNob29zZSBub3QgdG8gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIsIHlvdSB3b24ndCBiZSBkaXNjb3ZlcmFibGUgYnkgb3RoZXIgdXNlcnMgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImFuZCB5b3Ugd29uJ3QgYmUgYWJsZSB0byBpbnZpdGUgb3RoZXJzIGJ5IGVtYWlsIG9yIHBob25lLlwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgZGlzY29CdXR0b25Db250ZW50ID0gX3QoXCJEbyBub3QgdXNlIGFuIGlkZW50aXR5IHNlcnZlclwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmRpc2Nvbm5lY3RCdXN5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgSW5saW5lU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLklubGluZVNwaW5uZXInKTtcbiAgICAgICAgICAgICAgICBkaXNjb0J1dHRvbkNvbnRlbnQgPSA8SW5saW5lU3Bpbm5lciAvPjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpc2NvU2VjdGlvbiA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj57ZGlzY29Cb2R5VGV4dH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25EaXNjb25uZWN0Q2xpY2tlZH0ga2luZD1cImRhbmdlcl9zbVwiPlxuICAgICAgICAgICAgICAgICAgICB7ZGlzY29CdXR0b25Db250ZW50fVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldElkU2VydmVyXCIgb25TdWJtaXQ9e3RoaXMuX2NoZWNrSWRTZXJ2ZXJ9PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj5cbiAgICAgICAgICAgICAgICAgICAge3NlY3Rpb25UaXRsZX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAge2JvZHlUZXh0fVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRW50ZXIgYSBuZXcgaWRlbnRpdHkgc2VydmVyXCIpfVxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnN0YXRlLmRlZmF1bHRJZFNlcnZlcn1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuaWRTZXJ2ZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbklkZW50aXR5U2VydmVyQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENvbnRlbnQ9e3RoaXMuX2dldFRvb2x0aXAoKX1cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1NldElkU2VydmVyX3Rvb2x0aXBcIlxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbGlkaXR5PXt0aGlzLnN0YXRlLmVycm9yID8gZmFsc2UgOiBudWxsfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gdHlwZT1cInN1Ym1pdFwiIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fY2hlY2tJZFNlcnZlcn1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLl9pZFNlcnZlckNoYW5nZUVuYWJsZWQoKX1cbiAgICAgICAgICAgICAgICA+e190KFwiQ2hhbmdlXCIpfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICB7ZGlzY29TZWN0aW9ufVxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
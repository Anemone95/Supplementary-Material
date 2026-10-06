"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var languageHandler = _interopRequireWildcard(require("../../../../../languageHandler"));

var _ProfileSettings = _interopRequireDefault(require("../../ProfileSettings"));

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _LanguageDropdown = _interopRequireDefault(require("../../../elements/LanguageDropdown"));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _DeactivateAccountDialog = _interopRequireDefault(require("../../../dialogs/DeactivateAccountDialog"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _PlatformPeg = _interopRequireDefault(require("../../../../../PlatformPeg"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../.."));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _Terms = require("../../../../../Terms");

var _matrixJsSdk = require("matrix-js-sdk");

var _IdentityAuthClient = _interopRequireDefault(require("../../../../../IdentityAuthClient"));

var _UrlUtils = require("../../../../../utils/UrlUtils");

var _boundThreepids = require("../../../../../boundThreepids");

var _Spinner = _interopRequireDefault(require("../../../elements/Spinner"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _UIFeature = require("../../../../../settings/UIFeature");

/*
Copyright 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
class GeneralUserSettingsTab extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_onAction", payload => {
      if (payload.action === 'id_server_changed') {
        this.setState({
          haveIdServer: Boolean(_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl())
        });

        this._getThreepidState();
      }
    });
    (0, _defineProperty2.default)(this, "_onEmailsChange", emails => {
      this.setState({
        emails
      });
    });
    (0, _defineProperty2.default)(this, "_onMsisdnsChange", msisdns => {
      this.setState({
        msisdns
      });
    });
    (0, _defineProperty2.default)(this, "_onLanguageChange", newLanguage => {
      if (this.state.language === newLanguage) return;

      _SettingsStore.default.setValue("language", null, _SettingLevel.SettingLevel.DEVICE, newLanguage);

      this.setState({
        language: newLanguage
      });

      _PlatformPeg.default.get().reload();
    });
    (0, _defineProperty2.default)(this, "_onPasswordChangeError", err => {
      // TODO: Figure out a design that doesn't involve replacing the current dialog
      let errMsg = err.error || "";

      if (err.httpStatus === 403) {
        errMsg = (0, languageHandler._t)("Failed to change password. Is your password correct?");
      } else if (err.httpStatus) {
        errMsg += ` (HTTP status ${err.httpStatus})`;
      }

      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      console.error("Failed to change password: " + errMsg);

      _Modal.default.createTrackedDialog('Failed to change password', '', ErrorDialog, {
        title: (0, languageHandler._t)("Error"),
        description: errMsg
      });
    });
    (0, _defineProperty2.default)(this, "_onPasswordChanged", () => {
      // TODO: Figure out a design that doesn't involve replacing the current dialog
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

      _Modal.default.createTrackedDialog('Password changed', '', ErrorDialog, {
        title: (0, languageHandler._t)("Success"),
        description: (0, languageHandler._t)("Your password was successfully changed. You will not receive " + "push notifications on other sessions until you log back in to them") + "."
      });
    });
    (0, _defineProperty2.default)(this, "_onDeactivateClicked", () => {
      _Modal.default.createTrackedDialog('Deactivate Account', '', _DeactivateAccountDialog.default, {
        onFinished: success => {
          if (success) this.props.closeSettingsFn();
        }
      });
    });
    this.state = {
      language: languageHandler.getCurrentLanguage(),
      haveIdServer: Boolean(_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()),
      serverSupportsSeparateAddAndBind: null,
      idServerHasUnsignedTerms: false,
      requiredPolicyInfo: {
        // This object is passed along to a component for handling
        hasTerms: false // policiesAndServices, // From the startTermsFlow callback
        // agreedUrls,          // From the startTermsFlow callback
        // resolve,             // Promise resolve function for startTermsFlow callback

      },
      emails: [],
      msisdns: [],
      loading3pids: true // whether or not the emails and msisdns have been loaded

    };
    this.dispatcherRef = _dispatcher.default.register(this._onAction);
  } // TODO: [REACT-WARNING] Move this to constructor


  async UNSAFE_componentWillMount() {
    // eslint-disable-line camelcase
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const serverSupportsSeparateAddAndBind = await cli.doesServerSupportSeparateAddAndBind();
    const capabilities = await cli.getCapabilities(); // this is cached

    const changePasswordCap = capabilities['m.change_password']; // You can change your password so long as the capability isn't explicitly disabled. The implicit
    // behaviour is you can change your password when the capability is missing or has not-false as
    // the enabled flag value.

    const canChangePassword = !changePasswordCap || changePasswordCap['enabled'] !== false;
    this.setState({
      serverSupportsSeparateAddAndBind,
      canChangePassword
    });

    this._getThreepidState();
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  async _getThreepidState() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get(); // Check to see if terms need accepting


    this._checkTerms(); // Need to get 3PIDs generally for Account section and possibly also for
    // Discovery (assuming we have an IS and terms are agreed).


    let threepids = [];

    try {
      threepids = await (0, _boundThreepids.getThreepidsWithBindStatus)(cli);
    } catch (e) {
      const idServerUrl = _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl();

      console.warn(`Unable to reach identity server at ${idServerUrl} to check ` + `for 3PIDs bindings in Settings`);
      console.warn(e);
    }

    this.setState({
      emails: threepids.filter(a => a.medium === 'email'),
      msisdns: threepids.filter(a => a.medium === 'msisdn'),
      loading3pids: false
    });
  }

  async _checkTerms() {
    if (!this.state.haveIdServer) {
      this.setState({
        idServerHasUnsignedTerms: false
      });
      return;
    } // By starting the terms flow we get the logic for checking which terms the user has signed
    // for free. So we might as well use that for our own purposes.


    const idServerUrl = _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl();

    const authClient = new _IdentityAuthClient.default();

    try {
      const idAccessToken = await authClient.getAccessToken({
        check: false
      });
      await (0, _Terms.startTermsFlow)([new _Terms.Service(_matrixJsSdk.SERVICE_TYPES.IS, idServerUrl, idAccessToken)], (policiesAndServices, agreedUrls, extraClassNames) => {
        return new Promise((resolve, reject) => {
          this.setState({
            idServerName: (0, _UrlUtils.abbreviateUrl)(idServerUrl),
            requiredPolicyInfo: {
              hasTerms: true,
              policiesAndServices,
              agreedUrls,
              resolve
            }
          });
        });
      }); // User accepted all terms

      this.setState({
        requiredPolicyInfo: {
          hasTerms: false
        }
      });
    } catch (e) {
      console.warn(`Unable to reach identity server at ${idServerUrl} to check ` + `for terms in Settings`);
      console.warn(e);
    }
  }

  _renderProfileSection() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement(_ProfileSettings.default, null));
  }

  _renderAccountSection() {
    const ChangePassword = sdk.getComponent("views.settings.ChangePassword");
    const EmailAddresses = sdk.getComponent("views.settings.account.EmailAddresses");
    const PhoneNumbers = sdk.getComponent("views.settings.account.PhoneNumbers");

    let passwordChangeForm = /*#__PURE__*/_react.default.createElement(ChangePassword, {
      className: "mx_GeneralUserSettingsTab_changePassword",
      rowClassName: "",
      buttonKind: "primary",
      onError: this._onPasswordChangeError,
      onFinished: this._onPasswordChanged
    });

    let threepidSection = null; // For older homeservers without separate 3PID add and bind methods (MSC2290),
    // we use a combo add with bind option API which requires an identity server to
    // validate 3PID ownership even if we're just adding to the homeserver only.
    // For newer homeservers with separate 3PID add and bind methods (MSC2290),
    // there is no such concern, so we can always show the HS account 3PIDs.

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.ThirdPartyID) && (this.state.haveIdServer || this.state.serverSupportsSeparateAddAndBind === true)) {
      const emails = this.state.loading3pids ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement(EmailAddresses, {
        emails: this.state.emails,
        onEmailsChange: this._onEmailsChange
      });
      const msisdns = this.state.loading3pids ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement(PhoneNumbers, {
        msisdns: this.state.msisdns,
        onMsisdnsChange: this._onMsisdnsChange
      });
      threepidSection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subheading"
      }, (0, languageHandler._t)("Email addresses")), emails, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subheading"
      }, (0, languageHandler._t)("Phone numbers")), msisdns);
    } else if (this.state.serverSupportsSeparateAddAndBind === null) {
      threepidSection = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }

    let passwordChangeText = (0, languageHandler._t)("Set a new account password...");

    if (!this.state.canChangePassword) {
      // Just don't show anything if you can't do anything.
      passwordChangeText = null;
      passwordChangeForm = null;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_GeneralUserSettingsTab_accountSection"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Account")), /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_SettingsTab_subsectionText"
    }, passwordChangeText), passwordChangeForm, threepidSection);
  }

  _renderLanguageSection() {
    // TODO: Convert to new-styled Field
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Language and region")), /*#__PURE__*/_react.default.createElement(_LanguageDropdown.default, {
      className: "mx_GeneralUserSettingsTab_languageInput",
      onOptionChange: this._onLanguageChange,
      value: this.state.language
    }));
  }

  _renderDiscoverySection() {
    const SetIdServer = sdk.getComponent("views.settings.SetIdServer");

    if (this.state.requiredPolicyInfo.hasTerms) {
      const InlineTermsAgreement = sdk.getComponent("views.terms.InlineTermsAgreement");

      const intro = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, languageHandler._t)("Agree to the identity server (%(serverName)s) Terms of Service to " + "allow yourself to be discoverable by email address or phone number.", {
        serverName: this.state.idServerName
      }));

      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(InlineTermsAgreement, {
        policiesAndServicePairs: this.state.requiredPolicyInfo.policiesAndServices,
        agreedUrls: this.state.requiredPolicyInfo.agreedUrls,
        onFinished: this.state.requiredPolicyInfo.resolve,
        introElement: intro
      }), /*#__PURE__*/_react.default.createElement(SetIdServer, {
        missingTerms: true
      }));
    }

    const EmailAddresses = sdk.getComponent("views.settings.discovery.EmailAddresses");
    const PhoneNumbers = sdk.getComponent("views.settings.discovery.PhoneNumbers");
    const emails = this.state.loading3pids ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement(EmailAddresses, {
      emails: this.state.emails
    });
    const msisdns = this.state.loading3pids ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement(PhoneNumbers, {
      msisdns: this.state.msisdns
    });
    const threepidSection = this.state.haveIdServer ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GeneralUserSettingsTab_discovery"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Email addresses")), emails, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Phone numbers")), msisdns) : null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, threepidSection, /*#__PURE__*/_react.default.createElement(SetIdServer, null));
  }

  _renderManagementSection() {
    // TODO: Improve warning text for account deactivation
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Account management")), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, languageHandler._t)("Deactivating your account is a permanent action - be careful!")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._onDeactivateClicked,
      kind: "danger"
    }, (0, languageHandler._t)("Deactivate Account")));
  }

  _renderIntegrationManagerSection() {
    if (!_SettingsStore.default.getValue(_UIFeature.UIFeature.Widgets)) return null;
    const SetIntegrationManager = sdk.getComponent("views.settings.SetIntegrationManager");
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement(SetIntegrationManager, null));
  }

  render() {
    const discoWarning = this.state.requiredPolicyInfo.hasTerms ? /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_GeneralUserSettingsTab_warningIcon",
      src: require("../../../../../../res/img/feather-customised/warning-triangle.svg"),
      width: "18",
      height: "18",
      alt: (0, languageHandler._t)("Warning")
    }) : null;
    let accountManagementSection;

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Deactivate)) {
      accountManagementSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_heading"
      }, (0, languageHandler._t)("Deactivate account")), this._renderManagementSection());
    }

    let discoverySection;

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer)) {
      discoverySection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_heading"
      }, discoWarning, " ", (0, languageHandler._t)("Discovery")), this._renderDiscoverySection());
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, languageHandler._t)("General")), this._renderProfileSection(), this._renderAccountSection(), this._renderLanguageSection(), discoverySection, this._renderIntegrationManagerSection()
    /* Has its own title */
    , accountManagementSection);
  }

}

exports.default = GeneralUserSettingsTab;
(0, _defineProperty2.default)(GeneralUserSettingsTab, "propTypes", {
  closeSettingsFn: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9HZW5lcmFsVXNlclNldHRpbmdzVGFiLmpzIl0sIm5hbWVzIjpbIkdlbmVyYWxVc2VyU2V0dGluZ3NUYWIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicGF5bG9hZCIsImFjdGlvbiIsInNldFN0YXRlIiwiaGF2ZUlkU2VydmVyIiwiQm9vbGVhbiIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldElkZW50aXR5U2VydmVyVXJsIiwiX2dldFRocmVlcGlkU3RhdGUiLCJlbWFpbHMiLCJtc2lzZG5zIiwibmV3TGFuZ3VhZ2UiLCJzdGF0ZSIsImxhbmd1YWdlIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwiUGxhdGZvcm1QZWciLCJyZWxvYWQiLCJlcnIiLCJlcnJNc2ciLCJlcnJvciIsImh0dHBTdGF0dXMiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsImNvbnNvbGUiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiRGVhY3RpdmF0ZUFjY291bnREaWFsb2ciLCJvbkZpbmlzaGVkIiwic3VjY2VzcyIsInByb3BzIiwiY2xvc2VTZXR0aW5nc0ZuIiwibGFuZ3VhZ2VIYW5kbGVyIiwiZ2V0Q3VycmVudExhbmd1YWdlIiwic2VydmVyU3VwcG9ydHNTZXBhcmF0ZUFkZEFuZEJpbmQiLCJpZFNlcnZlckhhc1Vuc2lnbmVkVGVybXMiLCJyZXF1aXJlZFBvbGljeUluZm8iLCJoYXNUZXJtcyIsImxvYWRpbmczcGlkcyIsImRpc3BhdGNoZXJSZWYiLCJkaXMiLCJyZWdpc3RlciIsIl9vbkFjdGlvbiIsIlVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQiLCJjbGkiLCJkb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCIsImNhcGFiaWxpdGllcyIsImdldENhcGFiaWxpdGllcyIsImNoYW5nZVBhc3N3b3JkQ2FwIiwiY2FuQ2hhbmdlUGFzc3dvcmQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJfY2hlY2tUZXJtcyIsInRocmVlcGlkcyIsImUiLCJpZFNlcnZlclVybCIsIndhcm4iLCJmaWx0ZXIiLCJhIiwibWVkaXVtIiwiYXV0aENsaWVudCIsIklkZW50aXR5QXV0aENsaWVudCIsImlkQWNjZXNzVG9rZW4iLCJnZXRBY2Nlc3NUb2tlbiIsImNoZWNrIiwiU2VydmljZSIsIlNFUlZJQ0VfVFlQRVMiLCJJUyIsInBvbGljaWVzQW5kU2VydmljZXMiLCJhZ3JlZWRVcmxzIiwiZXh0cmFDbGFzc05hbWVzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJpZFNlcnZlck5hbWUiLCJfcmVuZGVyUHJvZmlsZVNlY3Rpb24iLCJfcmVuZGVyQWNjb3VudFNlY3Rpb24iLCJDaGFuZ2VQYXNzd29yZCIsIkVtYWlsQWRkcmVzc2VzIiwiUGhvbmVOdW1iZXJzIiwicGFzc3dvcmRDaGFuZ2VGb3JtIiwiX29uUGFzc3dvcmRDaGFuZ2VFcnJvciIsIl9vblBhc3N3b3JkQ2hhbmdlZCIsInRocmVlcGlkU2VjdGlvbiIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiVGhpcmRQYXJ0eUlEIiwiX29uRW1haWxzQ2hhbmdlIiwiX29uTXNpc2Ruc0NoYW5nZSIsInBhc3N3b3JkQ2hhbmdlVGV4dCIsIl9yZW5kZXJMYW5ndWFnZVNlY3Rpb24iLCJfb25MYW5ndWFnZUNoYW5nZSIsIl9yZW5kZXJEaXNjb3ZlcnlTZWN0aW9uIiwiU2V0SWRTZXJ2ZXIiLCJJbmxpbmVUZXJtc0FncmVlbWVudCIsImludHJvIiwic2VydmVyTmFtZSIsIl9yZW5kZXJNYW5hZ2VtZW50U2VjdGlvbiIsIl9vbkRlYWN0aXZhdGVDbGlja2VkIiwiX3JlbmRlckludGVncmF0aW9uTWFuYWdlclNlY3Rpb24iLCJXaWRnZXRzIiwiU2V0SW50ZWdyYXRpb25NYW5hZ2VyIiwicmVuZGVyIiwiZGlzY29XYXJuaW5nIiwicmVxdWlyZSIsImFjY291bnRNYW5hZ2VtZW50U2VjdGlvbiIsIkRlYWN0aXZhdGUiLCJkaXNjb3ZlcnlTZWN0aW9uIiwiSWRlbnRpdHlTZXJ2ZXIiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXlCZSxNQUFNQSxzQkFBTixTQUFxQ0MsZUFBTUMsU0FBM0MsQ0FBcUQ7QUFLaEVDLEVBQUFBLFdBQVcsR0FBRztBQUNWO0FBRFUscURBNkNEQyxPQUFELElBQWE7QUFDckIsVUFBSUEsT0FBTyxDQUFDQyxNQUFSLEtBQW1CLG1CQUF2QixFQUE0QztBQUN4QyxhQUFLQyxRQUFMLENBQWM7QUFBQ0MsVUFBQUEsWUFBWSxFQUFFQyxPQUFPLENBQUNDLGlDQUFnQkMsR0FBaEIsR0FBc0JDLG9CQUF0QixFQUFEO0FBQXRCLFNBQWQ7O0FBQ0EsYUFBS0MsaUJBQUw7QUFDSDtBQUNKLEtBbERhO0FBQUEsMkRBb0RLQyxNQUFELElBQVk7QUFDMUIsV0FBS1AsUUFBTCxDQUFjO0FBQUVPLFFBQUFBO0FBQUYsT0FBZDtBQUNILEtBdERhO0FBQUEsNERBd0RNQyxPQUFELElBQWE7QUFDNUIsV0FBS1IsUUFBTCxDQUFjO0FBQUVRLFFBQUFBO0FBQUYsT0FBZDtBQUNILEtBMURhO0FBQUEsNkRBa0lPQyxXQUFELElBQWlCO0FBQ2pDLFVBQUksS0FBS0MsS0FBTCxDQUFXQyxRQUFYLEtBQXdCRixXQUE1QixFQUF5Qzs7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QUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUF5Q0osWUFBekMsT0FBd0Qsd0JBQUcsV0FBSCxDQUF4RCxDQURlLEVBRWQsS0FBS1gsdUJBQUwsRUFGYyxDQUFuQjtBQUlIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FBeUMsd0JBQUcsU0FBSCxDQUF6QyxDQURKLEVBRUssS0FBS2pCLHFCQUFMLEVBRkwsRUFHSyxLQUFLQyxxQkFBTCxFQUhMLEVBSUssS0FBS2Msc0JBQUwsRUFKTCxFQUtNaUIsZ0JBTE4sRUFNSyxLQUFLUixnQ0FBTDtBQUF3QztBQU43QyxNQU9NTSx3QkFQTixDQURKO0FBV0g7O0FBdlgrRDs7OzhCQUEvQ2xILHNCLGVBQ0U7QUFDZndDLEVBQUFBLGVBQWUsRUFBRThFLG1CQUFVQyxJQUFWLENBQWVDO0FBRGpCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFByb2ZpbGVTZXR0aW5ncyBmcm9tIFwiLi4vLi4vUHJvZmlsZVNldHRpbmdzXCI7XG5pbXBvcnQgKiBhcyBsYW5ndWFnZUhhbmRsZXIgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBMYW5ndWFnZURyb3Bkb3duIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9MYW5ndWFnZURyb3Bkb3duXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IERlYWN0aXZhdGVBY2NvdW50RGlhbG9nIGZyb20gXCIuLi8uLi8uLi9kaWFsb2dzL0RlYWN0aXZhdGVBY2NvdW50RGlhbG9nXCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi8uLi8uLlwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQge1NlcnZpY2UsIHN0YXJ0VGVybXNGbG93fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vVGVybXNcIjtcbmltcG9ydCB7U0VSVklDRV9UWVBFU30gZnJvbSBcIm1hdHJpeC1qcy1zZGtcIjtcbmltcG9ydCBJZGVudGl0eUF1dGhDbGllbnQgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL0lkZW50aXR5QXV0aENsaWVudFwiO1xuaW1wb3J0IHthYmJyZXZpYXRlVXJsfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vdXRpbHMvVXJsVXRpbHNcIjtcbmltcG9ydCB7IGdldFRocmVlcGlkc1dpdGhCaW5kU3RhdHVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vYm91bmRUaHJlZXBpZHMnO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCB7U2V0dGluZ0xldmVsfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQge1VJRmVhdHVyZX0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHZW5lcmFsVXNlclNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBjbG9zZVNldHRpbmdzRm46IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBsYW5ndWFnZTogbGFuZ3VhZ2VIYW5kbGVyLmdldEN1cnJlbnRMYW5ndWFnZSgpLFxuICAgICAgICAgICAgaGF2ZUlkU2VydmVyOiBCb29sZWFuKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpKSxcbiAgICAgICAgICAgIHNlcnZlclN1cHBvcnRzU2VwYXJhdGVBZGRBbmRCaW5kOiBudWxsLFxuICAgICAgICAgICAgaWRTZXJ2ZXJIYXNVbnNpZ25lZFRlcm1zOiBmYWxzZSxcbiAgICAgICAgICAgIHJlcXVpcmVkUG9saWN5SW5mbzogeyAgICAgICAvLyBUaGlzIG9iamVjdCBpcyBwYXNzZWQgYWxvbmcgdG8gYSBjb21wb25lbnQgZm9yIGhhbmRsaW5nXG4gICAgICAgICAgICAgICAgaGFzVGVybXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIC8vIHBvbGljaWVzQW5kU2VydmljZXMsIC8vIEZyb20gdGhlIHN0YXJ0VGVybXNGbG93IGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgLy8gYWdyZWVkVXJscywgICAgICAgICAgLy8gRnJvbSB0aGUgc3RhcnRUZXJtc0Zsb3cgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAvLyByZXNvbHZlLCAgICAgICAgICAgICAvLyBQcm9taXNlIHJlc29sdmUgZnVuY3Rpb24gZm9yIHN0YXJ0VGVybXNGbG93IGNhbGxiYWNrXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW1haWxzOiBbXSxcbiAgICAgICAgICAgIG1zaXNkbnM6IFtdLFxuICAgICAgICAgICAgbG9hZGluZzNwaWRzOiB0cnVlLCAvLyB3aGV0aGVyIG9yIG5vdCB0aGUgZW1haWxzIGFuZCBtc2lzZG5zIGhhdmUgYmVlbiBsb2FkZWRcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5fb25BY3Rpb24pO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBNb3ZlIHRoaXMgdG8gY29uc3RydWN0b3JcbiAgICBhc3luYyBVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgY29uc3Qgc2VydmVyU3VwcG9ydHNTZXBhcmF0ZUFkZEFuZEJpbmQgPSBhd2FpdCBjbGkuZG9lc1NlcnZlclN1cHBvcnRTZXBhcmF0ZUFkZEFuZEJpbmQoKTtcblxuICAgICAgICBjb25zdCBjYXBhYmlsaXRpZXMgPSBhd2FpdCBjbGkuZ2V0Q2FwYWJpbGl0aWVzKCk7IC8vIHRoaXMgaXMgY2FjaGVkXG4gICAgICAgIGNvbnN0IGNoYW5nZVBhc3N3b3JkQ2FwID0gY2FwYWJpbGl0aWVzWydtLmNoYW5nZV9wYXNzd29yZCddO1xuXG4gICAgICAgIC8vIFlvdSBjYW4gY2hhbmdlIHlvdXIgcGFzc3dvcmQgc28gbG9uZyBhcyB0aGUgY2FwYWJpbGl0eSBpc24ndCBleHBsaWNpdGx5IGRpc2FibGVkLiBUaGUgaW1wbGljaXRcbiAgICAgICAgLy8gYmVoYXZpb3VyIGlzIHlvdSBjYW4gY2hhbmdlIHlvdXIgcGFzc3dvcmQgd2hlbiB0aGUgY2FwYWJpbGl0eSBpcyBtaXNzaW5nIG9yIGhhcyBub3QtZmFsc2UgYXNcbiAgICAgICAgLy8gdGhlIGVuYWJsZWQgZmxhZyB2YWx1ZS5cbiAgICAgICAgY29uc3QgY2FuQ2hhbmdlUGFzc3dvcmQgPSAhY2hhbmdlUGFzc3dvcmRDYXAgfHwgY2hhbmdlUGFzc3dvcmRDYXBbJ2VuYWJsZWQnXSAhPT0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VydmVyU3VwcG9ydHNTZXBhcmF0ZUFkZEFuZEJpbmQsIGNhbkNoYW5nZVBhc3N3b3JkfSk7XG5cbiAgICAgICAgdGhpcy5fZ2V0VGhyZWVwaWRTdGF0ZSgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIF9vbkFjdGlvbiA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ2lkX3NlcnZlcl9jaGFuZ2VkJykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGF2ZUlkU2VydmVyOiBCb29sZWFuKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpKX0pO1xuICAgICAgICAgICAgdGhpcy5fZ2V0VGhyZWVwaWRTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vbkVtYWlsc0NoYW5nZSA9IChlbWFpbHMpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVtYWlscyB9KTtcbiAgICB9O1xuXG4gICAgX29uTXNpc2Ruc0NoYW5nZSA9IChtc2lzZG5zKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtc2lzZG5zIH0pO1xuICAgIH07XG5cbiAgICBhc3luYyBfZ2V0VGhyZWVwaWRTdGF0ZSgpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0ZXJtcyBuZWVkIGFjY2VwdGluZ1xuICAgICAgICB0aGlzLl9jaGVja1Rlcm1zKCk7XG5cbiAgICAgICAgLy8gTmVlZCB0byBnZXQgM1BJRHMgZ2VuZXJhbGx5IGZvciBBY2NvdW50IHNlY3Rpb24gYW5kIHBvc3NpYmx5IGFsc28gZm9yXG4gICAgICAgIC8vIERpc2NvdmVyeSAoYXNzdW1pbmcgd2UgaGF2ZSBhbiBJUyBhbmQgdGVybXMgYXJlIGFncmVlZCkuXG4gICAgICAgIGxldCB0aHJlZXBpZHMgPSBbXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocmVlcGlkcyA9IGF3YWl0IGdldFRocmVlcGlkc1dpdGhCaW5kU3RhdHVzKGNsaSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkU2VydmVyVXJsID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgYFVuYWJsZSB0byByZWFjaCBpZGVudGl0eSBzZXJ2ZXIgYXQgJHtpZFNlcnZlclVybH0gdG8gY2hlY2sgYCArXG4gICAgICAgICAgICAgICAgYGZvciAzUElEcyBiaW5kaW5ncyBpbiBTZXR0aW5nc2AsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZW1haWxzOiB0aHJlZXBpZHMuZmlsdGVyKChhKSA9PiBhLm1lZGl1bSA9PT0gJ2VtYWlsJyksXG4gICAgICAgICAgICBtc2lzZG5zOiB0aHJlZXBpZHMuZmlsdGVyKChhKSA9PiBhLm1lZGl1bSA9PT0gJ21zaXNkbicpLFxuICAgICAgICAgICAgbG9hZGluZzNwaWRzOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2NoZWNrVGVybXMoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5oYXZlSWRTZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2lkU2VydmVySGFzVW5zaWduZWRUZXJtczogZmFsc2V9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ5IHN0YXJ0aW5nIHRoZSB0ZXJtcyBmbG93IHdlIGdldCB0aGUgbG9naWMgZm9yIGNoZWNraW5nIHdoaWNoIHRlcm1zIHRoZSB1c2VyIGhhcyBzaWduZWRcbiAgICAgICAgLy8gZm9yIGZyZWUuIFNvIHdlIG1pZ2h0IGFzIHdlbGwgdXNlIHRoYXQgZm9yIG91ciBvd24gcHVycG9zZXMuXG4gICAgICAgIGNvbnN0IGlkU2VydmVyVXJsID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCk7XG4gICAgICAgIGNvbnN0IGF1dGhDbGllbnQgPSBuZXcgSWRlbnRpdHlBdXRoQ2xpZW50KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBpZEFjY2Vzc1Rva2VuID0gYXdhaXQgYXV0aENsaWVudC5nZXRBY2Nlc3NUb2tlbih7IGNoZWNrOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGF3YWl0IHN0YXJ0VGVybXNGbG93KFtuZXcgU2VydmljZShcbiAgICAgICAgICAgICAgICBTRVJWSUNFX1RZUEVTLklTLFxuICAgICAgICAgICAgICAgIGlkU2VydmVyVXJsLFxuICAgICAgICAgICAgICAgIGlkQWNjZXNzVG9rZW4sXG4gICAgICAgICAgICApXSwgKHBvbGljaWVzQW5kU2VydmljZXMsIGFncmVlZFVybHMsIGV4dHJhQ2xhc3NOYW1lcykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRTZXJ2ZXJOYW1lOiBhYmJyZXZpYXRlVXJsKGlkU2VydmVyVXJsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkUG9saWN5SW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1Rlcm1zOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvbGljaWVzQW5kU2VydmljZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdyZWVkVXJscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFVzZXIgYWNjZXB0ZWQgYWxsIHRlcm1zXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZXF1aXJlZFBvbGljeUluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgaGFzVGVybXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgIGBVbmFibGUgdG8gcmVhY2ggaWRlbnRpdHkgc2VydmVyIGF0ICR7aWRTZXJ2ZXJVcmx9IHRvIGNoZWNrIGAgK1xuICAgICAgICAgICAgICAgIGBmb3IgdGVybXMgaW4gU2V0dGluZ3NgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbkxhbmd1YWdlQ2hhbmdlID0gKG5ld0xhbmd1YWdlKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmxhbmd1YWdlID09PSBuZXdMYW5ndWFnZSkgcmV0dXJuO1xuXG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJsYW5ndWFnZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBuZXdMYW5ndWFnZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2xhbmd1YWdlOiBuZXdMYW5ndWFnZX0pO1xuICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5yZWxvYWQoKTtcbiAgICB9O1xuXG4gICAgX29uUGFzc3dvcmRDaGFuZ2VFcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgLy8gVE9ETzogRmlndXJlIG91dCBhIGRlc2lnbiB0aGF0IGRvZXNuJ3QgaW52b2x2ZSByZXBsYWNpbmcgdGhlIGN1cnJlbnQgZGlhbG9nXG4gICAgICAgIGxldCBlcnJNc2cgPSBlcnIuZXJyb3IgfHwgXCJcIjtcbiAgICAgICAgaWYgKGVyci5odHRwU3RhdHVzID09PSA0MDMpIHtcbiAgICAgICAgICAgIGVyck1zZyA9IF90KFwiRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZC4gSXMgeW91ciBwYXNzd29yZCBjb3JyZWN0P1wiKTtcbiAgICAgICAgfSBlbHNlIGlmIChlcnIuaHR0cFN0YXR1cykge1xuICAgICAgICAgICAgZXJyTXNnICs9IGAgKEhUVFAgc3RhdHVzICR7ZXJyLmh0dHBTdGF0dXN9KWA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQ6IFwiICsgZXJyTXNnKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiRXJyb3JcIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyTXNnLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uUGFzc3dvcmRDaGFuZ2VkID0gKCkgPT4ge1xuICAgICAgICAvLyBUT0RPOiBGaWd1cmUgb3V0IGEgZGVzaWduIHRoYXQgZG9lc24ndCBpbnZvbHZlIHJlcGxhY2luZyB0aGUgY3VycmVudCBkaWFsb2dcbiAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnUGFzc3dvcmQgY2hhbmdlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiU3VjY2Vzc1wiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICBcIllvdXIgcGFzc3dvcmQgd2FzIHN1Y2Nlc3NmdWxseSBjaGFuZ2VkLiBZb3Ugd2lsbCBub3QgcmVjZWl2ZSBcIiArXG4gICAgICAgICAgICAgICAgXCJwdXNoIG5vdGlmaWNhdGlvbnMgb24gb3RoZXIgc2Vzc2lvbnMgdW50aWwgeW91IGxvZyBiYWNrIGluIHRvIHRoZW1cIixcbiAgICAgICAgICAgICkgKyBcIi5cIixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkRlYWN0aXZhdGVDbGlja2VkID0gKCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdEZWFjdGl2YXRlIEFjY291bnQnLCAnJywgRGVhY3RpdmF0ZUFjY291bnREaWFsb2csIHtcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHRoaXMucHJvcHMuY2xvc2VTZXR0aW5nc0ZuKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX3JlbmRlclByb2ZpbGVTZWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPFByb2ZpbGVTZXR0aW5ncyAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX3JlbmRlckFjY291bnRTZWN0aW9uKCkge1xuICAgICAgICBjb25zdCBDaGFuZ2VQYXNzd29yZCA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5DaGFuZ2VQYXNzd29yZFwiKTtcbiAgICAgICAgY29uc3QgRW1haWxBZGRyZXNzZXMgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MuYWNjb3VudC5FbWFpbEFkZHJlc3Nlc1wiKTtcbiAgICAgICAgY29uc3QgUGhvbmVOdW1iZXJzID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLnNldHRpbmdzLmFjY291bnQuUGhvbmVOdW1iZXJzXCIpO1xuXG4gICAgICAgIGxldCBwYXNzd29yZENoYW5nZUZvcm0gPSAoXG4gICAgICAgICAgICA8Q2hhbmdlUGFzc3dvcmRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9HZW5lcmFsVXNlclNldHRpbmdzVGFiX2NoYW5nZVBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICByb3dDbGFzc05hbWU9XCJcIlxuICAgICAgICAgICAgICAgIGJ1dHRvbktpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkVycm9yPXt0aGlzLl9vblBhc3N3b3JkQ2hhbmdlRXJyb3J9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5fb25QYXNzd29yZENoYW5nZWR9IC8+XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IHRocmVlcGlkU2VjdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLy8gRm9yIG9sZGVyIGhvbWVzZXJ2ZXJzIHdpdGhvdXQgc2VwYXJhdGUgM1BJRCBhZGQgYW5kIGJpbmQgbWV0aG9kcyAoTVNDMjI5MCksXG4gICAgICAgIC8vIHdlIHVzZSBhIGNvbWJvIGFkZCB3aXRoIGJpbmQgb3B0aW9uIEFQSSB3aGljaCByZXF1aXJlcyBhbiBpZGVudGl0eSBzZXJ2ZXIgdG9cbiAgICAgICAgLy8gdmFsaWRhdGUgM1BJRCBvd25lcnNoaXAgZXZlbiBpZiB3ZSdyZSBqdXN0IGFkZGluZyB0byB0aGUgaG9tZXNlcnZlciBvbmx5LlxuICAgICAgICAvLyBGb3IgbmV3ZXIgaG9tZXNlcnZlcnMgd2l0aCBzZXBhcmF0ZSAzUElEIGFkZCBhbmQgYmluZCBtZXRob2RzIChNU0MyMjkwKSxcbiAgICAgICAgLy8gdGhlcmUgaXMgbm8gc3VjaCBjb25jZXJuLCBzbyB3ZSBjYW4gYWx3YXlzIHNob3cgdGhlIEhTIGFjY291bnQgM1BJRHMuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5UaGlyZFBhcnR5SUQpICYmXG4gICAgICAgICAgICAodGhpcy5zdGF0ZS5oYXZlSWRTZXJ2ZXIgfHwgdGhpcy5zdGF0ZS5zZXJ2ZXJTdXBwb3J0c1NlcGFyYXRlQWRkQW5kQmluZCA9PT0gdHJ1ZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zdCBlbWFpbHMgPSB0aGlzLnN0YXRlLmxvYWRpbmczcGlkc1xuICAgICAgICAgICAgICAgID8gPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICA6IDxFbWFpbEFkZHJlc3Nlc1xuICAgICAgICAgICAgICAgICAgICBlbWFpbHM9e3RoaXMuc3RhdGUuZW1haWxzfVxuICAgICAgICAgICAgICAgICAgICBvbkVtYWlsc0NoYW5nZT17dGhpcy5fb25FbWFpbHNDaGFuZ2V9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBjb25zdCBtc2lzZG5zID0gdGhpcy5zdGF0ZS5sb2FkaW5nM3BpZHNcbiAgICAgICAgICAgICAgICA/IDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgOiA8UGhvbmVOdW1iZXJzXG4gICAgICAgICAgICAgICAgICAgIG1zaXNkbnM9e3RoaXMuc3RhdGUubXNpc2Ruc31cbiAgICAgICAgICAgICAgICAgICAgb25Nc2lzZG5zQ2hhbmdlPXt0aGlzLl9vbk1zaXNkbnNDaGFuZ2V9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICB0aHJlZXBpZFNlY3Rpb24gPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJFbWFpbCBhZGRyZXNzZXNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIHtlbWFpbHN9XG5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiUGhvbmUgbnVtYmVyc1wiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAge21zaXNkbnN9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zZXJ2ZXJTdXBwb3J0c1NlcGFyYXRlQWRkQW5kQmluZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyZWVwaWRTZWN0aW9uID0gPFNwaW5uZXIgLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFzc3dvcmRDaGFuZ2VUZXh0ID0gX3QoXCJTZXQgYSBuZXcgYWNjb3VudCBwYXNzd29yZC4uLlwiKTtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNhbkNoYW5nZVBhc3N3b3JkKSB7XG4gICAgICAgICAgICAvLyBKdXN0IGRvbid0IHNob3cgYW55dGhpbmcgaWYgeW91IGNhbid0IGRvIGFueXRoaW5nLlxuICAgICAgICAgICAgcGFzc3dvcmRDaGFuZ2VUZXh0ID0gbnVsbDtcbiAgICAgICAgICAgIHBhc3N3b3JkQ2hhbmdlRm9ybSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X0dlbmVyYWxVc2VyU2V0dGluZ3NUYWJfYWNjb3VudFNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiQWNjb3VudFwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAge3Bhc3N3b3JkQ2hhbmdlVGV4dH1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAge3Bhc3N3b3JkQ2hhbmdlRm9ybX1cbiAgICAgICAgICAgICAgICB7dGhyZWVwaWRTZWN0aW9ufVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX3JlbmRlckxhbmd1YWdlU2VjdGlvbigpIHtcbiAgICAgICAgLy8gVE9ETzogQ29udmVydCB0byBuZXctc3R5bGVkIEZpZWxkXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiTGFuZ3VhZ2UgYW5kIHJlZ2lvblwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPExhbmd1YWdlRHJvcGRvd24gY2xhc3NOYW1lPVwibXhfR2VuZXJhbFVzZXJTZXR0aW5nc1RhYl9sYW5ndWFnZUlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk9wdGlvbkNoYW5nZT17dGhpcy5fb25MYW5ndWFnZUNoYW5nZX0gdmFsdWU9e3RoaXMuc3RhdGUubGFuZ3VhZ2V9IC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfcmVuZGVyRGlzY292ZXJ5U2VjdGlvbigpIHtcbiAgICAgICAgY29uc3QgU2V0SWRTZXJ2ZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MuU2V0SWRTZXJ2ZXJcIik7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVxdWlyZWRQb2xpY3lJbmZvLmhhc1Rlcm1zKSB7XG4gICAgICAgICAgICBjb25zdCBJbmxpbmVUZXJtc0FncmVlbWVudCA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy50ZXJtcy5JbmxpbmVUZXJtc0FncmVlbWVudFwiKTtcbiAgICAgICAgICAgIGNvbnN0IGludHJvID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQWdyZWUgdG8gdGhlIGlkZW50aXR5IHNlcnZlciAoJShzZXJ2ZXJOYW1lKXMpIFRlcm1zIG9mIFNlcnZpY2UgdG8gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImFsbG93IHlvdXJzZWxmIHRvIGJlIGRpc2NvdmVyYWJsZSBieSBlbWFpbCBhZGRyZXNzIG9yIHBob25lIG51bWJlci5cIixcbiAgICAgICAgICAgICAgICAgICAge3NlcnZlck5hbWU6IHRoaXMuc3RhdGUuaWRTZXJ2ZXJOYW1lfSxcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPElubGluZVRlcm1zQWdyZWVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2xpY2llc0FuZFNlcnZpY2VQYWlycz17dGhpcy5zdGF0ZS5yZXF1aXJlZFBvbGljeUluZm8ucG9saWNpZXNBbmRTZXJ2aWNlc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGFncmVlZFVybHM9e3RoaXMuc3RhdGUucmVxdWlyZWRQb2xpY3lJbmZvLmFncmVlZFVybHN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnN0YXRlLnJlcXVpcmVkUG9saWN5SW5mby5yZXNvbHZlfVxuICAgICAgICAgICAgICAgICAgICAgICAgaW50cm9FbGVtZW50PXtpbnRyb31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgeyAvKiBoYXMgaXRzIG93biBoZWFkaW5nIGFzIGl0IGluY2x1ZGVzIHRoZSBjdXJyZW50IElEIHNlcnZlciAqLyB9XG4gICAgICAgICAgICAgICAgICAgIDxTZXRJZFNlcnZlciBtaXNzaW5nVGVybXM9e3RydWV9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgRW1haWxBZGRyZXNzZXMgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MuZGlzY292ZXJ5LkVtYWlsQWRkcmVzc2VzXCIpO1xuICAgICAgICBjb25zdCBQaG9uZU51bWJlcnMgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MuZGlzY292ZXJ5LlBob25lTnVtYmVyc1wiKTtcblxuICAgICAgICBjb25zdCBlbWFpbHMgPSB0aGlzLnN0YXRlLmxvYWRpbmczcGlkcyA/IDxTcGlubmVyIC8+IDogPEVtYWlsQWRkcmVzc2VzIGVtYWlscz17dGhpcy5zdGF0ZS5lbWFpbHN9IC8+O1xuICAgICAgICBjb25zdCBtc2lzZG5zID0gdGhpcy5zdGF0ZS5sb2FkaW5nM3BpZHMgPyA8U3Bpbm5lciAvPiA6IDxQaG9uZU51bWJlcnMgbXNpc2Rucz17dGhpcy5zdGF0ZS5tc2lzZG5zfSAvPjtcblxuICAgICAgICBjb25zdCB0aHJlZXBpZFNlY3Rpb24gPSB0aGlzLnN0YXRlLmhhdmVJZFNlcnZlciA/IDxkaXYgY2xhc3NOYW1lPSdteF9HZW5lcmFsVXNlclNldHRpbmdzVGFiX2Rpc2NvdmVyeSc+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiRW1haWwgYWRkcmVzc2VzXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgIHtlbWFpbHN9XG5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJQaG9uZSBudW1iZXJzXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgIHttc2lzZG5zfVxuICAgICAgICA8L2Rpdj4gOiBudWxsO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICB7dGhyZWVwaWRTZWN0aW9ufVxuICAgICAgICAgICAgICAgIHsgLyogaGFzIGl0cyBvd24gaGVhZGluZyBhcyBpdCBpbmNsdWRlcyB0aGUgY3VycmVudCBJRCBzZXJ2ZXIgKi8gfVxuICAgICAgICAgICAgICAgIDxTZXRJZFNlcnZlciAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX3JlbmRlck1hbmFnZW1lbnRTZWN0aW9uKCkge1xuICAgICAgICAvLyBUT0RPOiBJbXByb3ZlIHdhcm5pbmcgdGV4dCBmb3IgYWNjb3VudCBkZWFjdGl2YXRpb25cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJBY2NvdW50IG1hbmFnZW1lbnRcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkRlYWN0aXZhdGluZyB5b3VyIGFjY291bnQgaXMgYSBwZXJtYW5lbnQgYWN0aW9uIC0gYmUgY2FyZWZ1bCFcIil9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uRGVhY3RpdmF0ZUNsaWNrZWR9IGtpbmQ9XCJkYW5nZXJcIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiRGVhY3RpdmF0ZSBBY2NvdW50XCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJJbnRlZ3JhdGlvbk1hbmFnZXJTZWN0aW9uKCkge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLldpZGdldHMpKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBTZXRJbnRlZ3JhdGlvbk1hbmFnZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MuU2V0SW50ZWdyYXRpb25NYW5hZ2VyXCIpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICB7IC8qIGhhcyBpdHMgb3duIGhlYWRpbmcgYXMgaXQgaW5jbHVkZXMgdGhlIGN1cnJlbnQgaW50ZWdyYXRpb24gbWFuYWdlciAqLyB9XG4gICAgICAgICAgICAgICAgPFNldEludGVncmF0aW9uTWFuYWdlciAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBkaXNjb1dhcm5pbmcgPSB0aGlzLnN0YXRlLnJlcXVpcmVkUG9saWN5SW5mby5oYXNUZXJtc1xuICAgICAgICAgICAgPyA8aW1nIGNsYXNzTmFtZT0nbXhfR2VuZXJhbFVzZXJTZXR0aW5nc1RhYl93YXJuaW5nSWNvbidcbiAgICAgICAgICAgICAgICBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi8uLi8uLi9yZXMvaW1nL2ZlYXRoZXItY3VzdG9taXNlZC93YXJuaW5nLXRyaWFuZ2xlLnN2Z1wiKX1cbiAgICAgICAgICAgICAgICB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiBhbHQ9e190KFwiV2FybmluZ1wiKX0gLz5cbiAgICAgICAgICAgIDogbnVsbDtcblxuICAgICAgICBsZXQgYWNjb3VudE1hbmFnZW1lbnRTZWN0aW9uO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuRGVhY3RpdmF0ZSkpIHtcbiAgICAgICAgICAgIGFjY291bnRNYW5hZ2VtZW50U2VjdGlvbiA9IDw+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiRGVhY3RpdmF0ZSBhY2NvdW50XCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJNYW5hZ2VtZW50U2VjdGlvbigpfVxuICAgICAgICAgICAgPC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRpc2NvdmVyeVNlY3Rpb247XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5JZGVudGl0eVNlcnZlcikpIHtcbiAgICAgICAgICAgIGRpc2NvdmVyeVNlY3Rpb24gPSA8PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntkaXNjb1dhcm5pbmd9IHtfdChcIkRpc2NvdmVyeVwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyRGlzY292ZXJ5U2VjdGlvbigpfVxuICAgICAgICAgICAgPC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJHZW5lcmFsXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJQcm9maWxlU2VjdGlvbigpfVxuICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJBY2NvdW50U2VjdGlvbigpfVxuICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJMYW5ndWFnZVNlY3Rpb24oKX1cbiAgICAgICAgICAgICAgICB7IGRpc2NvdmVyeVNlY3Rpb24gfVxuICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJJbnRlZ3JhdGlvbk1hbmFnZXJTZWN0aW9uKCkgLyogSGFzIGl0cyBvd24gdGl0bGUgKi99XG4gICAgICAgICAgICAgICAgeyBhY2NvdW50TWFuYWdlbWVudFNlY3Rpb24gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
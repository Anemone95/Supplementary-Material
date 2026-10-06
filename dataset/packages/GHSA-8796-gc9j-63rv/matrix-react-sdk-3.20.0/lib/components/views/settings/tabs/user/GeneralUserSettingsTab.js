"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _SpellCheckSettings = _interopRequireDefault(require("../../SpellCheckSettings"));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _DeactivateAccountDialog = _interopRequireDefault(require("../../../dialogs/DeactivateAccountDialog"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _PlatformPeg = _interopRequireDefault(require("../../../../../PlatformPeg"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../.."));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _Terms = require("../../../../../Terms");

var _serviceTypes = require("matrix-js-sdk/src/service-types");

var _IdentityAuthClient = _interopRequireDefault(require("../../../../../IdentityAuthClient"));

var _UrlUtils = require("../../../../../utils/UrlUtils");

var _boundThreepids = require("../../../../../boundThreepids");

var _Spinner = _interopRequireDefault(require("../../../elements/Spinner"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _UIFeature = require("../../../../../settings/UIFeature");

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let GeneralUserSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.user.GeneralUserSettingsTab"), _dec(_class = (_temp = _class2 = class GeneralUserSettingsTab extends _react.default.Component {
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

      const platform = _PlatformPeg.default.get();

      if (platform) {
        platform.setLanguage(newLanguage);
        platform.reload();
      }
    });
    (0, _defineProperty2.default)(this, "_onSpellCheckLanguagesChange", languages => {
      this.setState({
        spellCheckLanguages: languages
      });

      const plaf = _PlatformPeg.default.get();

      if (plaf) {
        plaf.setSpellCheckLanguages(languages);
      }
    });
    (0, _defineProperty2.default)(this, "_onPasswordChangeError", err => {
      // TODO: Figure out a design that doesn't involve replacing the current dialog
      let errMsg = err.error || err.message || "";

      if (err.httpStatus === 403) {
        errMsg = (0, languageHandler._t)("Failed to change password. Is your password correct?");
      } else if (!errMsg) {
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
      spellCheckLanguages: [],
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

  async componentDidMount() {
    const plaf = _PlatformPeg.default.get();

    if (plaf) {
      this.setState({
        spellCheckLanguages: await plaf.getSpellCheckLanguages()
      });
    }
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
      await (0, _Terms.startTermsFlow)([new _Terms.Service(_serviceTypes.SERVICE_TYPES.IS, idServerUrl, idAccessToken)], (policiesAndServices, agreedUrls, extraClassNames) => {
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

  _renderSpellCheckSection() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Spell check dictionaries")), /*#__PURE__*/_react.default.createElement(_SpellCheckSettings.default, {
      languages: this.state.spellCheckLanguages,
      onLanguagesChange: this._onSpellCheckLanguagesChange
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
    const plaf = _PlatformPeg.default.get();

    const supportsMultiLanguageSpellCheck = plaf.supportsMultiLanguageSpellCheck();
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
    }, (0, languageHandler._t)("General")), this._renderProfileSection(), this._renderAccountSection(), this._renderLanguageSection(), supportsMultiLanguageSpellCheck ? this._renderSpellCheckSection() : null, discoverySection, this._renderIntegrationManagerSection()
    /* Has its own title */
    , accountManagementSection);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  closeSettingsFn: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = GeneralUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9HZW5lcmFsVXNlclNldHRpbmdzVGFiLmpzIl0sIm5hbWVzIjpbIkdlbmVyYWxVc2VyU2V0dGluZ3NUYWIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicGF5bG9hZCIsImFjdGlvbiIsInNldFN0YXRlIiwiaGF2ZUlkU2VydmVyIiwiQm9vbGVhbiIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldElkZW50aXR5U2VydmVyVXJsIiwiX2dldFRocmVlcGlkU3RhdGUiLCJlbWFpbHMiLCJtc2lzZG5zIiwibmV3TGFuZ3VhZ2UiLCJzdGF0ZSIsImxhbmd1YWdlIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwicGxhdGZvcm0iLCJQbGF0Zm9ybVBlZyIsInNldExhbmd1YWdlIiwicmVsb2FkIiwibGFuZ3VhZ2VzIiwic3BlbGxDaGVja0xhbmd1YWdlcyIsInBsYWYiLCJzZXRTcGVsbENoZWNrTGFuZ3VhZ2VzIiwiZXJyIiwiZXJyTXNnIiwiZXJyb3IiLCJtZXNzYWdlIiwiaHR0cFN0YXR1cyIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiY29uc29sZSIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJEZWFjdGl2YXRlQWNjb3VudERpYWxvZyIsIm9uRmluaXNoZWQiLCJzdWNjZXNzIiwicHJvcHMiLCJjbG9zZVNldHRpbmdzRm4iLCJsYW5ndWFnZUhhbmRsZXIiLCJnZXRDdXJyZW50TGFuZ3VhZ2UiLCJzZXJ2ZXJTdXBwb3J0c1NlcGFyYXRlQWRkQW5kQmluZCIsImlkU2VydmVySGFzVW5zaWduZWRUZXJtcyIsInJlcXVpcmVkUG9saWN5SW5mbyIsImhhc1Rlcm1zIiwibG9hZGluZzNwaWRzIiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwiX29uQWN0aW9uIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsImNsaSIsImRvZXNTZXJ2ZXJTdXBwb3J0U2VwYXJhdGVBZGRBbmRCaW5kIiwiY2FwYWJpbGl0aWVzIiwiZ2V0Q2FwYWJpbGl0aWVzIiwiY2hhbmdlUGFzc3dvcmRDYXAiLCJjYW5DaGFuZ2VQYXNzd29yZCIsImNvbXBvbmVudERpZE1vdW50IiwiZ2V0U3BlbGxDaGVja0xhbmd1YWdlcyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsIl9jaGVja1Rlcm1zIiwidGhyZWVwaWRzIiwiZSIsImlkU2VydmVyVXJsIiwid2FybiIsImZpbHRlciIsImEiLCJtZWRpdW0iLCJhdXRoQ2xpZW50IiwiSWRlbnRpdHlBdXRoQ2xpZW50IiwiaWRBY2Nlc3NUb2tlbiIsImdldEFjY2Vzc1Rva2VuIiwiY2hlY2siLCJTZXJ2aWNlIiwiU0VSVklDRV9UWVBFUyIsIklTIiwicG9saWNpZXNBbmRTZXJ2aWNlcyIsImFncmVlZFVybHMiLCJleHRyYUNsYXNzTmFtZXMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImlkU2VydmVyTmFtZSIsIl9yZW5kZXJQcm9maWxlU2VjdGlvbiIsIl9yZW5kZXJBY2NvdW50U2VjdGlvbiIsIkNoYW5nZVBhc3N3b3JkIiwiRW1haWxBZGRyZXNzZXMiLCJQaG9uZU51bWJlcnMiLCJwYXNzd29yZENoYW5nZUZvcm0iLCJfb25QYXNzd29yZENoYW5nZUVycm9yIiwiX29uUGFzc3dvcmRDaGFuZ2VkIiwidGhyZWVwaWRTZWN0aW9uIiwiZ2V0VmFsdWUiLCJVSUZlYXR1cmUiLCJUaGlyZFBhcnR5SUQiLCJfb25FbWFpbHNDaGFuZ2UiLCJfb25Nc2lzZG5zQ2hhbmdlIiwicGFzc3dvcmRDaGFuZ2VUZXh0IiwiX3JlbmRlckxhbmd1YWdlU2VjdGlvbiIsIl9vbkxhbmd1YWdlQ2hhbmdlIiwiX3JlbmRlclNwZWxsQ2hlY2tTZWN0aW9uIiwiX29uU3BlbGxDaGVja0xhbmd1YWdlc0NoYW5nZSIsIl9yZW5kZXJEaXNjb3ZlcnlTZWN0aW9uIiwiU2V0SWRTZXJ2ZXIiLCJJbmxpbmVUZXJtc0FncmVlbWVudCIsImludHJvIiwic2VydmVyTmFtZSIsIl9yZW5kZXJNYW5hZ2VtZW50U2VjdGlvbiIsIl9vbkRlYWN0aXZhdGVDbGlja2VkIiwiX3JlbmRlckludGVncmF0aW9uTWFuYWdlclNlY3Rpb24iLCJXaWRnZXRzIiwiU2V0SW50ZWdyYXRpb25NYW5hZ2VyIiwicmVuZGVyIiwic3VwcG9ydHNNdWx0aUxhbmd1YWdlU3BlbGxDaGVjayIsImRpc2NvV2FybmluZyIsInJlcXVpcmUiLCJhY2NvdW50TWFuYWdlbWVudFNlY3Rpb24iLCJEZWFjdGl2YXRlIiwiZGlzY292ZXJ5U2VjdGlvbiIsIklkZW50aXR5U2VydmVyIiwiUHJvcFR5cGVzIiwiZnVuYyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFHcUJBLHNCLFdBRHBCLGdEQUFxQixpREFBckIsQyxtQ0FBRCxNQUNxQkEsc0JBRHJCLFNBQ29EQyxlQUFNQyxTQUQxRCxDQUNvRTtBQUtoRUMsRUFBQUEsV0FBVyxHQUFHO0FBQ1Y7QUFEVSxxREF1RERDLE9BQUQsSUFBYTtBQUNyQixVQUFJQSxPQUFPLENBQUNDLE1BQVIsS0FBbUIsbUJBQXZCLEVBQTRDO0FBQ3hDLGFBQUtDLFFBQUwsQ0FBYztBQUFDQyxVQUFBQSxZQUFZLEVBQUVDLE9BQU8sQ0FBQ0MsaUNBQWdCQyxHQUFoQixHQUFzQkMsb0JBQXRCLEVBQUQ7QUFBdEIsU0FBZDs7QUFDQSxhQUFLQyxpQkFBTDtBQUNIO0FBQ0osS0E1RGE7QUFBQSwyREE4REtDLE1BQUQsSUFBWTtBQUMxQixXQUFL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b0JBQUgsQ0FBekMsQ0FEdUIsRUFFdEIsS0FBS1Qsd0JBQUwsRUFGc0IsQ0FBM0I7QUFJSDs7QUFFRCxRQUFJVyxnQkFBSjs7QUFDQSxRQUFJOUcsdUJBQWNvRixRQUFkLENBQXVCQyxxQkFBVTBCLGNBQWpDLENBQUosRUFBc0Q7QUFDbERELE1BQUFBLGdCQUFnQixnQkFBRyx5RUFDZjtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsU0FBeUNKLFlBQXpDLE9BQXdELHdCQUFHLFdBQUgsQ0FBeEQsQ0FEZSxFQUVkLEtBQUtaLHVCQUFMLEVBRmMsQ0FBbkI7QUFJSDs7QUFFRCx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQXlDLHdCQUFHLFNBQUgsQ0FBekMsQ0FESixFQUVLLEtBQUtuQixxQkFBTCxFQUZMLEVBR0ssS0FBS0MscUJBQUwsRUFITCxFQUlLLEtBQUtjLHNCQUFMLEVBSkwsRUFLS2UsK0JBQStCLEdBQUcsS0FBS2Isd0JBQUwsRUFBSCxHQUFxQyxJQUx6RSxFQU1Na0IsZ0JBTk4sRUFPSyxLQUFLVCxnQ0FBTDtBQUF3QztBQVA3QyxNQVFNTyx3QkFSTixDQURKO0FBWUg7O0FBamErRCxDLHNEQUM3QztBQUNmL0UsRUFBQUEsZUFBZSxFQUFFbUYsbUJBQVVDLElBQVYsQ0FBZUM7QUFEakIsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUHJvZmlsZVNldHRpbmdzIGZyb20gXCIuLi8uLi9Qcm9maWxlU2V0dGluZ3NcIjtcbmltcG9ydCAqIGFzIGxhbmd1YWdlSGFuZGxlciBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IExhbmd1YWdlRHJvcGRvd24gZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0xhbmd1YWdlRHJvcGRvd25cIjtcbmltcG9ydCBTcGVsbENoZWNrU2V0dGluZ3MgZnJvbSBcIi4uLy4uL1NwZWxsQ2hlY2tTZXR0aW5nc1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBEZWFjdGl2YXRlQWNjb3VudERpYWxvZyBmcm9tIFwiLi4vLi4vLi4vZGlhbG9ncy9EZWFjdGl2YXRlQWNjb3VudERpYWxvZ1wiO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tIFwicHJvcC10eXBlc1wiO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9QbGF0Zm9ybVBlZ1wiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vLi4vLi5cIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtTZXJ2aWNlLCBzdGFydFRlcm1zRmxvd30gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1Rlcm1zXCI7XG5pbXBvcnQge1NFUlZJQ0VfVFlQRVN9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9zZXJ2aWNlLXR5cGVzXCI7XG5pbXBvcnQgSWRlbnRpdHlBdXRoQ2xpZW50IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9JZGVudGl0eUF1dGhDbGllbnRcIjtcbmltcG9ydCB7YWJicmV2aWF0ZVVybH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3V0aWxzL1VybFV0aWxzXCI7XG5pbXBvcnQgeyBnZXRUaHJlZXBpZHNXaXRoQmluZFN0YXR1cyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2JvdW5kVGhyZWVwaWRzJztcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQge1NldHRpbmdMZXZlbH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IHtVSUZlYXR1cmV9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy50YWJzLnVzZXIuR2VuZXJhbFVzZXJTZXR0aW5nc1RhYlwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2VuZXJhbFVzZXJTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgY2xvc2VTZXR0aW5nc0ZuOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbGFuZ3VhZ2U6IGxhbmd1YWdlSGFuZGxlci5nZXRDdXJyZW50TGFuZ3VhZ2UoKSxcbiAgICAgICAgICAgIHNwZWxsQ2hlY2tMYW5ndWFnZXM6IFtdLFxuICAgICAgICAgICAgaGF2ZUlkU2VydmVyOiBCb29sZWFuKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpKSxcbiAgICAgICAgICAgIHNlcnZlclN1cHBvcnRzU2VwYXJhdGVBZGRBbmRCaW5kOiBudWxsLFxuICAgICAgICAgICAgaWRTZXJ2ZXJIYXNVbnNpZ25lZFRlcm1zOiBmYWxzZSxcbiAgICAgICAgICAgIHJlcXVpcmVkUG9saWN5SW5mbzogeyAgICAgICAvLyBUaGlzIG9iamVjdCBpcyBwYXNzZWQgYWxvbmcgdG8gYSBjb21wb25lbnQgZm9yIGhhbmRsaW5nXG4gICAgICAgICAgICAgICAgaGFzVGVybXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIC8vIHBvbGljaWVzQW5kU2VydmljZXMsIC8vIEZyb20gdGhlIHN0YXJ0VGVybXNGbG93IGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgLy8gYWdyZWVkVXJscywgICAgICAgICAgLy8gRnJvbSB0aGUgc3RhcnRUZXJtc0Zsb3cgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAvLyByZXNvbHZlLCAgICAgICAgICAgICAvLyBQcm9taXNlIHJlc29sdmUgZnVuY3Rpb24gZm9yIHN0YXJ0VGVybXNGbG93IGNhbGxiYWNrXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW1haWxzOiBbXSxcbiAgICAgICAgICAgIG1zaXNkbnM6IFtdLFxuICAgICAgICAgICAgbG9hZGluZzNwaWRzOiB0cnVlLCAvLyB3aGV0aGVyIG9yIG5vdCB0aGUgZW1haWxzIGFuZCBtc2lzZG5zIGhhdmUgYmVlbiBsb2FkZWRcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5fb25BY3Rpb24pO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBNb3ZlIHRoaXMgdG8gY29uc3RydWN0b3JcbiAgICBhc3luYyBVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgY29uc3Qgc2VydmVyU3VwcG9ydHNTZXBhcmF0ZUFkZEFuZEJpbmQgPSBhd2FpdCBjbGkuZG9lc1NlcnZlclN1cHBvcnRTZXBhcmF0ZUFkZEFuZEJpbmQoKTtcblxuICAgICAgICBjb25zdCBjYXBhYmlsaXRpZXMgPSBhd2FpdCBjbGkuZ2V0Q2FwYWJpbGl0aWVzKCk7IC8vIHRoaXMgaXMgY2FjaGVkXG4gICAgICAgIGNvbnN0IGNoYW5nZVBhc3N3b3JkQ2FwID0gY2FwYWJpbGl0aWVzWydtLmNoYW5nZV9wYXNzd29yZCddO1xuXG4gICAgICAgIC8vIFlvdSBjYW4gY2hhbmdlIHlvdXIgcGFzc3dvcmQgc28gbG9uZyBhcyB0aGUgY2FwYWJpbGl0eSBpc24ndCBleHBsaWNpdGx5IGRpc2FibGVkLiBUaGUgaW1wbGljaXRcbiAgICAgICAgLy8gYmVoYXZpb3VyIGlzIHlvdSBjYW4gY2hhbmdlIHlvdXIgcGFzc3dvcmQgd2hlbiB0aGUgY2FwYWJpbGl0eSBpcyBtaXNzaW5nIG9yIGhhcyBub3QtZmFsc2UgYXNcbiAgICAgICAgLy8gdGhlIGVuYWJsZWQgZmxhZyB2YWx1ZS5cbiAgICAgICAgY29uc3QgY2FuQ2hhbmdlUGFzc3dvcmQgPSAhY2hhbmdlUGFzc3dvcmRDYXAgfHwgY2hhbmdlUGFzc3dvcmRDYXBbJ2VuYWJsZWQnXSAhPT0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VydmVyU3VwcG9ydHNTZXBhcmF0ZUFkZEFuZEJpbmQsIGNhbkNoYW5nZVBhc3N3b3JkfSk7XG5cbiAgICAgICAgdGhpcy5fZ2V0VGhyZWVwaWRTdGF0ZSgpO1xuICAgIH1cblxuICAgIGFzeW5jIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCBwbGFmID0gUGxhdGZvcm1QZWcuZ2V0KCk7XG4gICAgICAgIGlmIChwbGFmKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzcGVsbENoZWNrTGFuZ3VhZ2VzOiBhd2FpdCBwbGFmLmdldFNwZWxsQ2hlY2tMYW5ndWFnZXMoKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgX29uQWN0aW9uID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnaWRfc2VydmVyX2NoYW5nZWQnKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtoYXZlSWRTZXJ2ZXI6IEJvb2xlYW4oTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCkpfSk7XG4gICAgICAgICAgICB0aGlzLl9nZXRUaHJlZXBpZFN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uRW1haWxzQ2hhbmdlID0gKGVtYWlscykgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZW1haWxzIH0pO1xuICAgIH07XG5cbiAgICBfb25Nc2lzZG5zQ2hhbmdlID0gKG1zaXNkbnMpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1zaXNkbnMgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jIF9nZXRUaHJlZXBpZFN0YXRlKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRlcm1zIG5lZWQgYWNjZXB0aW5nXG4gICAgICAgIHRoaXMuX2NoZWNrVGVybXMoKTtcblxuICAgICAgICAvLyBOZWVkIHRvIGdldCAzUElEcyBnZW5lcmFsbHkgZm9yIEFjY291bnQgc2VjdGlvbiBhbmQgcG9zc2libHkgYWxzbyBmb3JcbiAgICAgICAgLy8gRGlzY292ZXJ5IChhc3N1bWluZyB3ZSBoYXZlIGFuIElTIGFuZCB0ZXJtcyBhcmUgYWdyZWVkKS5cbiAgICAgICAgbGV0IHRocmVlcGlkcyA9IFtdO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyZWVwaWRzID0gYXdhaXQgZ2V0VGhyZWVwaWRzV2l0aEJpbmRTdGF0dXMoY2xpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc3QgaWRTZXJ2ZXJVcmwgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICBgVW5hYmxlIHRvIHJlYWNoIGlkZW50aXR5IHNlcnZlciBhdCAke2lkU2VydmVyVXJsfSB0byBjaGVjayBgICtcbiAgICAgICAgICAgICAgICBgZm9yIDNQSURzIGJpbmRpbmdzIGluIFNldHRpbmdzYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlbWFpbHM6IHRocmVlcGlkcy5maWx0ZXIoKGEpID0+IGEubWVkaXVtID09PSAnZW1haWwnKSxcbiAgICAgICAgICAgIG1zaXNkbnM6IHRocmVlcGlkcy5maWx0ZXIoKGEpID0+IGEubWVkaXVtID09PSAnbXNpc2RuJyksXG4gICAgICAgICAgICBsb2FkaW5nM3BpZHM6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBfY2hlY2tUZXJtcygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmhhdmVJZFNlcnZlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aWRTZXJ2ZXJIYXNVbnNpZ25lZFRlcm1zOiBmYWxzZX0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnkgc3RhcnRpbmcgdGhlIHRlcm1zIGZsb3cgd2UgZ2V0IHRoZSBsb2dpYyBmb3IgY2hlY2tpbmcgd2hpY2ggdGVybXMgdGhlIHVzZXIgaGFzIHNpZ25lZFxuICAgICAgICAvLyBmb3IgZnJlZS4gU28gd2UgbWlnaHQgYXMgd2VsbCB1c2UgdGhhdCBmb3Igb3VyIG93biBwdXJwb3Nlcy5cbiAgICAgICAgY29uc3QgaWRTZXJ2ZXJVcmwgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKTtcbiAgICAgICAgY29uc3QgYXV0aENsaWVudCA9IG5ldyBJZGVudGl0eUF1dGhDbGllbnQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGlkQWNjZXNzVG9rZW4gPSBhd2FpdCBhdXRoQ2xpZW50LmdldEFjY2Vzc1Rva2VuKHsgY2hlY2s6IGZhbHNlIH0pO1xuICAgICAgICAgICAgYXdhaXQgc3RhcnRUZXJtc0Zsb3coW25ldyBTZXJ2aWNlKFxuICAgICAgICAgICAgICAgIFNFUlZJQ0VfVFlQRVMuSVMsXG4gICAgICAgICAgICAgICAgaWRTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgaWRBY2Nlc3NUb2tlbixcbiAgICAgICAgICAgICldLCAocG9saWNpZXNBbmRTZXJ2aWNlcywgYWdyZWVkVXJscywgZXh0cmFDbGFzc05hbWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZFNlcnZlck5hbWU6IGFiYnJldmlhdGVVcmwoaWRTZXJ2ZXJVcmwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRQb2xpY3lJbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzVGVybXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9saWNpZXNBbmRTZXJ2aWNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ3JlZWRVcmxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVXNlciBhY2NlcHRlZCBhbGwgdGVybXNcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkUG9saWN5SW5mbzoge1xuICAgICAgICAgICAgICAgICAgICBoYXNUZXJtczogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgYFVuYWJsZSB0byByZWFjaCBpZGVudGl0eSBzZXJ2ZXIgYXQgJHtpZFNlcnZlclVybH0gdG8gY2hlY2sgYCArXG4gICAgICAgICAgICAgICAgYGZvciB0ZXJtcyBpbiBTZXR0aW5nc2AsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uTGFuZ3VhZ2VDaGFuZ2UgPSAobmV3TGFuZ3VhZ2UpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubGFuZ3VhZ2UgPT09IG5ld0xhbmd1YWdlKSByZXR1cm47XG5cbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcImxhbmd1YWdlXCIsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIG5ld0xhbmd1YWdlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bGFuZ3VhZ2U6IG5ld0xhbmd1YWdlfSk7XG4gICAgICAgIGNvbnN0IHBsYXRmb3JtID0gUGxhdGZvcm1QZWcuZ2V0KCk7XG4gICAgICAgIGlmIChwbGF0Zm9ybSkge1xuICAgICAgICAgICAgcGxhdGZvcm0uc2V0TGFuZ3VhZ2UobmV3TGFuZ3VhZ2UpO1xuICAgICAgICAgICAgcGxhdGZvcm0ucmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uU3BlbGxDaGVja0xhbmd1YWdlc0NoYW5nZSA9IChsYW5ndWFnZXMpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c3BlbGxDaGVja0xhbmd1YWdlczogbGFuZ3VhZ2VzfSk7XG5cbiAgICAgICAgY29uc3QgcGxhZiA9IFBsYXRmb3JtUGVnLmdldCgpO1xuICAgICAgICBpZiAocGxhZikge1xuICAgICAgICAgICAgcGxhZi5zZXRTcGVsbENoZWNrTGFuZ3VhZ2VzKGxhbmd1YWdlcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uUGFzc3dvcmRDaGFuZ2VFcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgLy8gVE9ETzogRmlndXJlIG91dCBhIGRlc2lnbiB0aGF0IGRvZXNuJ3QgaW52b2x2ZSByZXBsYWNpbmcgdGhlIGN1cnJlbnQgZGlhbG9nXG4gICAgICAgIGxldCBlcnJNc2cgPSBlcnIuZXJyb3IgfHwgZXJyLm1lc3NhZ2UgfHwgXCJcIjtcbiAgICAgICAgaWYgKGVyci5odHRwU3RhdHVzID09PSA0MDMpIHtcbiAgICAgICAgICAgIGVyck1zZyA9IF90KFwiRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZC4gSXMgeW91ciBwYXNzd29yZCBjb3JyZWN0P1wiKTtcbiAgICAgICAgfSBlbHNlIGlmICghZXJyTXNnKSB7XG4gICAgICAgICAgICBlcnJNc2cgKz0gYCAoSFRUUCBzdGF0dXMgJHtlcnIuaHR0cFN0YXR1c30pYDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZDogXCIgKyBlcnJNc2cpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gY2hhbmdlIHBhc3N3b3JkJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlcnJNc2csXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25QYXNzd29yZENoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIFRPRE86IEZpZ3VyZSBvdXQgYSBkZXNpZ24gdGhhdCBkb2Vzbid0IGludm9sdmUgcmVwbGFjaW5nIHRoZSBjdXJyZW50IGRpYWxvZ1xuICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdQYXNzd29yZCBjaGFuZ2VkJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJTdWNjZXNzXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgIFwiWW91ciBwYXNzd29yZCB3YXMgc3VjY2Vzc2Z1bGx5IGNoYW5nZWQuIFlvdSB3aWxsIG5vdCByZWNlaXZlIFwiICtcbiAgICAgICAgICAgICAgICBcInB1c2ggbm90aWZpY2F0aW9ucyBvbiBvdGhlciBzZXNzaW9ucyB1bnRpbCB5b3UgbG9nIGJhY2sgaW4gdG8gdGhlbVwiLFxuICAgICAgICAgICAgKSArIFwiLlwiLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uRGVhY3RpdmF0ZUNsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0RlYWN0aXZhdGUgQWNjb3VudCcsICcnLCBEZWFjdGl2YXRlQWNjb3VudERpYWxvZywge1xuICAgICAgICAgICAgb25GaW5pc2hlZDogKHN1Y2Nlc3MpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3VjY2VzcykgdGhpcy5wcm9wcy5jbG9zZVNldHRpbmdzRm4oKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfcmVuZGVyUHJvZmlsZVNlY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8UHJvZmlsZVNldHRpbmdzIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfcmVuZGVyQWNjb3VudFNlY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IENoYW5nZVBhc3N3b3JkID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLnNldHRpbmdzLkNoYW5nZVBhc3N3b3JkXCIpO1xuICAgICAgICBjb25zdCBFbWFpbEFkZHJlc3NlcyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5hY2NvdW50LkVtYWlsQWRkcmVzc2VzXCIpO1xuICAgICAgICBjb25zdCBQaG9uZU51bWJlcnMgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MuYWNjb3VudC5QaG9uZU51bWJlcnNcIik7XG5cbiAgICAgICAgbGV0IHBhc3N3b3JkQ2hhbmdlRm9ybSA9IChcbiAgICAgICAgICAgIDxDaGFuZ2VQYXNzd29yZFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0dlbmVyYWxVc2VyU2V0dGluZ3NUYWJfY2hhbmdlUGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgIHJvd0NsYXNzTmFtZT1cIlwiXG4gICAgICAgICAgICAgICAgYnV0dG9uS2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgIG9uRXJyb3I9e3RoaXMuX29uUGFzc3dvcmRDaGFuZ2VFcnJvcn1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLl9vblBhc3N3b3JkQ2hhbmdlZH0gLz5cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgdGhyZWVwaWRTZWN0aW9uID0gbnVsbDtcblxuICAgICAgICAvLyBGb3Igb2xkZXIgaG9tZXNlcnZlcnMgd2l0aG91dCBzZXBhcmF0ZSAzUElEIGFkZCBhbmQgYmluZCBtZXRob2RzIChNU0MyMjkwKSxcbiAgICAgICAgLy8gd2UgdXNlIGEgY29tYm8gYWRkIHdpdGggYmluZCBvcHRpb24gQVBJIHdoaWNoIHJlcXVpcmVzIGFuIGlkZW50aXR5IHNlcnZlciB0b1xuICAgICAgICAvLyB2YWxpZGF0ZSAzUElEIG93bmVyc2hpcCBldmVuIGlmIHdlJ3JlIGp1c3QgYWRkaW5nIHRvIHRoZSBob21lc2VydmVyIG9ubHkuXG4gICAgICAgIC8vIEZvciBuZXdlciBob21lc2VydmVycyB3aXRoIHNlcGFyYXRlIDNQSUQgYWRkIGFuZCBiaW5kIG1ldGhvZHMgKE1TQzIyOTApLFxuICAgICAgICAvLyB0aGVyZSBpcyBubyBzdWNoIGNvbmNlcm4sIHNvIHdlIGNhbiBhbHdheXMgc2hvdyB0aGUgSFMgYWNjb3VudCAzUElEcy5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlRoaXJkUGFydHlJRCkgJiZcbiAgICAgICAgICAgICh0aGlzLnN0YXRlLmhhdmVJZFNlcnZlciB8fCB0aGlzLnN0YXRlLnNlcnZlclN1cHBvcnRzU2VwYXJhdGVBZGRBbmRCaW5kID09PSB0cnVlKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IGVtYWlscyA9IHRoaXMuc3RhdGUubG9hZGluZzNwaWRzXG4gICAgICAgICAgICAgICAgPyA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgICAgIDogPEVtYWlsQWRkcmVzc2VzXG4gICAgICAgICAgICAgICAgICAgIGVtYWlscz17dGhpcy5zdGF0ZS5lbWFpbHN9XG4gICAgICAgICAgICAgICAgICAgIG9uRW1haWxzQ2hhbmdlPXt0aGlzLl9vbkVtYWlsc0NoYW5nZX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIGNvbnN0IG1zaXNkbnMgPSB0aGlzLnN0YXRlLmxvYWRpbmczcGlkc1xuICAgICAgICAgICAgICAgID8gPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICA6IDxQaG9uZU51bWJlcnNcbiAgICAgICAgICAgICAgICAgICAgbXNpc2Rucz17dGhpcy5zdGF0ZS5tc2lzZG5zfVxuICAgICAgICAgICAgICAgICAgICBvbk1zaXNkbnNDaGFuZ2U9e3RoaXMuX29uTXNpc2Ruc0NoYW5nZX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIHRocmVlcGlkU2VjdGlvbiA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPntfdChcIkVtYWlsIGFkZHJlc3Nlc1wiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAge2VtYWlsc31cblxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJQaG9uZSBudW1iZXJzXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICB7bXNpc2Ruc31cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnNlcnZlclN1cHBvcnRzU2VwYXJhdGVBZGRBbmRCaW5kID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJlZXBpZFNlY3Rpb24gPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXNzd29yZENoYW5nZVRleHQgPSBfdChcIlNldCBhIG5ldyBhY2NvdW50IHBhc3N3b3JkLi4uXCIpO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuY2FuQ2hhbmdlUGFzc3dvcmQpIHtcbiAgICAgICAgICAgIC8vIEp1c3QgZG9uJ3Qgc2hvdyBhbnl0aGluZyBpZiB5b3UgY2FuJ3QgZG8gYW55dGhpbmcuXG4gICAgICAgICAgICBwYXNzd29yZENoYW5nZVRleHQgPSBudWxsO1xuICAgICAgICAgICAgcGFzc3dvcmRDaGFuZ2VGb3JtID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfR2VuZXJhbFVzZXJTZXR0aW5nc1RhYl9hY2NvdW50U2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJBY2NvdW50XCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7cGFzc3dvcmRDaGFuZ2VUZXh0fVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICB7cGFzc3dvcmRDaGFuZ2VGb3JtfVxuICAgICAgICAgICAgICAgIHt0aHJlZXBpZFNlY3Rpb259XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfcmVuZGVyTGFuZ3VhZ2VTZWN0aW9uKCkge1xuICAgICAgICAvLyBUT0RPOiBDb252ZXJ0IHRvIG5ldy1zdHlsZWQgRmllbGRcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJMYW5ndWFnZSBhbmQgcmVnaW9uXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8TGFuZ3VhZ2VEcm9wZG93blxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9HZW5lcmFsVXNlclNldHRpbmdzVGFiX2xhbmd1YWdlSW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICBvbk9wdGlvbkNoYW5nZT17dGhpcy5fb25MYW5ndWFnZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubGFuZ3VhZ2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJTcGVsbENoZWNrU2VjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJTcGVsbCBjaGVjayBkaWN0aW9uYXJpZXNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxTcGVsbENoZWNrU2V0dGluZ3NcbiAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2VzPXt0aGlzLnN0YXRlLnNwZWxsQ2hlY2tMYW5ndWFnZXN9XG4gICAgICAgICAgICAgICAgICAgIG9uTGFuZ3VhZ2VzQ2hhbmdlPXt0aGlzLl9vblNwZWxsQ2hlY2tMYW5ndWFnZXNDaGFuZ2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJEaXNjb3ZlcnlTZWN0aW9uKCkge1xuICAgICAgICBjb25zdCBTZXRJZFNlcnZlciA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5TZXRJZFNlcnZlclwiKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZXF1aXJlZFBvbGljeUluZm8uaGFzVGVybXMpIHtcbiAgICAgICAgICAgIGNvbnN0IElubGluZVRlcm1zQWdyZWVtZW50ID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLnRlcm1zLklubGluZVRlcm1zQWdyZWVtZW50XCIpO1xuICAgICAgICAgICAgY29uc3QgaW50cm8gPSA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dFwiPlxuICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgXCJBZ3JlZSB0byB0aGUgaWRlbnRpdHkgc2VydmVyICglKHNlcnZlck5hbWUpcykgVGVybXMgb2YgU2VydmljZSB0byBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiYWxsb3cgeW91cnNlbGYgdG8gYmUgZGlzY292ZXJhYmxlIGJ5IGVtYWlsIGFkZHJlc3Mgb3IgcGhvbmUgbnVtYmVyLlwiLFxuICAgICAgICAgICAgICAgICAgICB7c2VydmVyTmFtZTogdGhpcy5zdGF0ZS5pZFNlcnZlck5hbWV9LFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8SW5saW5lVGVybXNBZ3JlZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvbGljaWVzQW5kU2VydmljZVBhaXJzPXt0aGlzLnN0YXRlLnJlcXVpcmVkUG9saWN5SW5mby5wb2xpY2llc0FuZFNlcnZpY2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWdyZWVkVXJscz17dGhpcy5zdGF0ZS5yZXF1aXJlZFBvbGljeUluZm8uYWdyZWVkVXJsc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMuc3RhdGUucmVxdWlyZWRQb2xpY3lJbmZvLnJlc29sdmV9XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRyb0VsZW1lbnQ9e2ludHJvfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7IC8qIGhhcyBpdHMgb3duIGhlYWRpbmcgYXMgaXQgaW5jbHVkZXMgdGhlIGN1cnJlbnQgSUQgc2VydmVyICovIH1cbiAgICAgICAgICAgICAgICAgICAgPFNldElkU2VydmVyIG1pc3NpbmdUZXJtcz17dHJ1ZX0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBFbWFpbEFkZHJlc3NlcyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5kaXNjb3ZlcnkuRW1haWxBZGRyZXNzZXNcIik7XG4gICAgICAgIGNvbnN0IFBob25lTnVtYmVycyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5kaXNjb3ZlcnkuUGhvbmVOdW1iZXJzXCIpO1xuXG4gICAgICAgIGNvbnN0IGVtYWlscyA9IHRoaXMuc3RhdGUubG9hZGluZzNwaWRzID8gPFNwaW5uZXIgLz4gOiA8RW1haWxBZGRyZXNzZXMgZW1haWxzPXt0aGlzLnN0YXRlLmVtYWlsc30gLz47XG4gICAgICAgIGNvbnN0IG1zaXNkbnMgPSB0aGlzLnN0YXRlLmxvYWRpbmczcGlkcyA/IDxTcGlubmVyIC8+IDogPFBob25lTnVtYmVycyBtc2lzZG5zPXt0aGlzLnN0YXRlLm1zaXNkbnN9IC8+O1xuXG4gICAgICAgIGNvbnN0IHRocmVlcGlkU2VjdGlvbiA9IHRoaXMuc3RhdGUuaGF2ZUlkU2VydmVyID8gPGRpdiBjbGFzc05hbWU9J214X0dlbmVyYWxVc2VyU2V0dGluZ3NUYWJfZGlzY292ZXJ5Jz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJFbWFpbCBhZGRyZXNzZXNcIil9PC9zcGFuPlxuICAgICAgICAgICAge2VtYWlsc31cblxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPntfdChcIlBob25lIG51bWJlcnNcIil9PC9zcGFuPlxuICAgICAgICAgICAge21zaXNkbnN9XG4gICAgICAgIDwvZGl2PiA6IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIHt0aHJlZXBpZFNlY3Rpb259XG4gICAgICAgICAgICAgICAgeyAvKiBoYXMgaXRzIG93biBoZWFkaW5nIGFzIGl0IGluY2x1ZGVzIHRoZSBjdXJyZW50IElEIHNlcnZlciAqLyB9XG4gICAgICAgICAgICAgICAgPFNldElkU2VydmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfcmVuZGVyTWFuYWdlbWVudFNlY3Rpb24oKSB7XG4gICAgICAgIC8vIFRPRE86IEltcHJvdmUgd2FybmluZyB0ZXh0IGZvciBhY2NvdW50IGRlYWN0aXZhdGlvblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPntfdChcIkFjY291bnQgbWFuYWdlbWVudFwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiRGVhY3RpdmF0aW5nIHlvdXIgYWNjb3VudCBpcyBhIHBlcm1hbmVudCBhY3Rpb24gLSBiZSBjYXJlZnVsIVwiKX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25EZWFjdGl2YXRlQ2xpY2tlZH0ga2luZD1cImRhbmdlclwiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJEZWFjdGl2YXRlIEFjY291bnRcIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX3JlbmRlckludGVncmF0aW9uTWFuYWdlclNlY3Rpb24oKSB7XG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuV2lkZ2V0cykpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IFNldEludGVncmF0aW9uTWFuYWdlciA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5TZXRJbnRlZ3JhdGlvbk1hbmFnZXJcIik7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIHsgLyogaGFzIGl0cyBvd24gaGVhZGluZyBhcyBpdCBpbmNsdWRlcyB0aGUgY3VycmVudCBpbnRlZ3JhdGlvbiBtYW5hZ2VyICovIH1cbiAgICAgICAgICAgICAgICA8U2V0SW50ZWdyYXRpb25NYW5hZ2VyIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHBsYWYgPSBQbGF0Zm9ybVBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgc3VwcG9ydHNNdWx0aUxhbmd1YWdlU3BlbGxDaGVjayA9IHBsYWYuc3VwcG9ydHNNdWx0aUxhbmd1YWdlU3BlbGxDaGVjaygpO1xuXG4gICAgICAgIGNvbnN0IGRpc2NvV2FybmluZyA9IHRoaXMuc3RhdGUucmVxdWlyZWRQb2xpY3lJbmZvLmhhc1Rlcm1zXG4gICAgICAgICAgICA/IDxpbWcgY2xhc3NOYW1lPSdteF9HZW5lcmFsVXNlclNldHRpbmdzVGFiX3dhcm5pbmdJY29uJ1xuICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uLy4uLy4uL3Jlcy9pbWcvZmVhdGhlci1jdXN0b21pc2VkL3dhcm5pbmctdHJpYW5nbGUuc3ZnXCIpfVxuICAgICAgICAgICAgICAgIHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIGFsdD17X3QoXCJXYXJuaW5nXCIpfSAvPlxuICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIGxldCBhY2NvdW50TWFuYWdlbWVudFNlY3Rpb247XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5EZWFjdGl2YXRlKSkge1xuICAgICAgICAgICAgYWNjb3VudE1hbmFnZW1lbnRTZWN0aW9uID0gPD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJEZWFjdGl2YXRlIGFjY291bnRcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlck1hbmFnZW1lbnRTZWN0aW9uKCl9XG4gICAgICAgICAgICA8Lz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGlzY292ZXJ5U2VjdGlvbjtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLklkZW50aXR5U2VydmVyKSkge1xuICAgICAgICAgICAgZGlzY292ZXJ5U2VjdGlvbiA9IDw+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e2Rpc2NvV2FybmluZ30ge190KFwiRGlzY292ZXJ5XCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJEaXNjb3ZlcnlTZWN0aW9uKCl9XG4gICAgICAgICAgICA8Lz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntfdChcIkdlbmVyYWxcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlclByb2ZpbGVTZWN0aW9uKCl9XG4gICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckFjY291bnRTZWN0aW9uKCl9XG4gICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckxhbmd1YWdlU2VjdGlvbigpfVxuICAgICAgICAgICAgICAgIHtzdXBwb3J0c011bHRpTGFuZ3VhZ2VTcGVsbENoZWNrID8gdGhpcy5fcmVuZGVyU3BlbGxDaGVja1NlY3Rpb24oKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgeyBkaXNjb3ZlcnlTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVySW50ZWdyYXRpb25NYW5hZ2VyU2VjdGlvbigpIC8qIEhhcyBpdHMgb3duIHRpdGxlICovfVxuICAgICAgICAgICAgICAgIHsgYWNjb3VudE1hbmFnZW1lbnRTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
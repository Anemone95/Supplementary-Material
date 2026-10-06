"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IgnoredUser = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var FormattingUtils = _interopRequireWildcard3(require("../../../../../utils/FormattingUtils"));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _Analytics = _interopRequireDefault(require("../../../../../Analytics"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var sdk = _interopRequireWildcard3(require("../../../../.."));

var _promise = require("../../../../../utils/promise");

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _createRoom = require("../../../../../createRoom");

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _SecureBackupPanel = _interopRequireDefault(require("../../SecureBackupPanel"));

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _UIFeature = require("../../../../../settings/UIFeature");

var _E2eAdvancedPanel = require("../../E2eAdvancedPanel");

var _CountlyAnalytics = _interopRequireDefault(require("../../../../../CountlyAnalytics"));

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

class IgnoredUser extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onUnignoreClicked", e => {
      this.props.onUnignored(this.props.userId);
    });
  }

  render() {
    const id = `mx_SecurityUserSettingsTab_ignoredUser_${this.props.userId}`;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SecurityUserSettingsTab_ignoredUser"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._onUnignoreClicked,
      kind: "primary_sm",
      "aria-describedby": id,
      disabled: this.props.inProgress
    }, (0, _languageHandler._t)('Unignore')), /*#__PURE__*/_react.default.createElement("span", {
      id: id
    }, this.props.userId));
  }

}

exports.IgnoredUser = IgnoredUser;
(0, _defineProperty2.default)(IgnoredUser, "propTypes", {
  userId: _propTypes.default.string.isRequired,
  onUnignored: _propTypes.default.func.isRequired,
  inProgress: _propTypes.default.bool.isRequired
});
let SecurityUserSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.user.SecurityUserSettingsTab"), _dec(_class = (_temp = _class2 = class SecurityUserSettingsTab extends _react.default.Component {
  constructor() {
    super(); // Get number of rooms we're invited to

    (0, _defineProperty2.default)(this, "_updateBlacklistDevicesFlag", checked => {
      _MatrixClientPeg.MatrixClientPeg.get().setGlobalBlacklistUnverifiedDevices(checked);
    });
    (0, _defineProperty2.default)(this, "_updateAnalytics", checked => {
      checked ? _Analytics.default.enable() : _Analytics.default.disable();

      _CountlyAnalytics.default.instance.enable(
      /* anonymous = */
      !checked);
    });
    (0, _defineProperty2.default)(this, "_onExportE2eKeysClicked", () => {
      _Modal.default.createTrackedDialogAsync('Export E2E Keys', '', Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../../../../async-components/views/dialogs/security/ExportE2eKeysDialog'))), {
        matrixClient: _MatrixClientPeg.MatrixClientPeg.get()
      });
    });
    (0, _defineProperty2.default)(this, "_onImportE2eKeysClicked", () => {
      _Modal.default.createTrackedDialogAsync('Import E2E Keys', '', Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../../../../async-components/views/dialogs/security/ImportE2eKeysDialog'))), {
        matrixClient: _MatrixClientPeg.MatrixClientPeg.get()
      });
    });
    (0, _defineProperty2.default)(this, "_onGoToUserProfileClick", () => {
      _dispatcher.default.dispatch({
        action: 'view_user_info',
        userId: _MatrixClientPeg.MatrixClientPeg.get().getUserId()
      });

      this.props.closeSettingsFn();
    });
    (0, _defineProperty2.default)(this, "_onUserUnignored", async userId => {
      const {
        ignoredUserIds,
        waitingUnignored
      } = this.state;
      const currentlyIgnoredUserIds = ignoredUserIds.filter(e => !waitingUnignored.includes(e));
      const index = currentlyIgnoredUserIds.indexOf(userId);

      if (index !== -1) {
        currentlyIgnoredUserIds.splice(index, 1);
        this.setState(({
          waitingUnignored
        }) => ({
          waitingUnignored: [...waitingUnignored, userId]
        }));

        _MatrixClientPeg.MatrixClientPeg.get().setIgnoredUsers(currentlyIgnoredUserIds);
      }
    });
    (0, _defineProperty2.default)(this, "_getInvitedRooms", () => {
      return _MatrixClientPeg.MatrixClientPeg.get().getRooms().filter(r => {
        return r.hasMembershipState(_MatrixClientPeg.MatrixClientPeg.get().getUserId(), "invite");
      });
    });
    (0, _defineProperty2.default)(this, "_manageInvites", async accept => {
      this.setState({
        managingInvites: true
      }); // Compile array of invitation room ids

      const invitedRoomIds = this._getInvitedRooms().map(room => {
        return room.roomId;
      }); // Execute all acceptances/rejections sequentially


      const self = this;

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const action = accept ? cli.joinRoom.bind(cli) : cli.leave.bind(cli);

      for (let i = 0; i < invitedRoomIds.length; i++) {
        const roomId = invitedRoomIds[i]; // Accept/reject invite

        await action(roomId).then(() => {
          // No error, update invited rooms button
          this.setState({
            invitedRoomAmt: self.state.invitedRoomAmt - 1
          });
        }, async e => {
          // Action failure
          if (e.errcode === "M_LIMIT_EXCEEDED") {
            // Add a delay between each invite change in order to avoid rate
            // limiting by the server.
            await (0, _promise.sleep)(e.retry_after_ms || 2500); // Redo last action

            i--;
          } else {
            // Print out error with joining/leaving room
            console.warn(e);
          }
        });
      }

      this.setState({
        managingInvites: false
      });
    });
    (0, _defineProperty2.default)(this, "_onAcceptAllInvitesClicked", ev => {
      this._manageInvites(true);
    });
    (0, _defineProperty2.default)(this, "_onRejectAllInvitesClicked", ev => {
      this._manageInvites(false);
    });

    const invitedRooms = this._getInvitedRooms();

    this.state = {
      ignoredUserIds: _MatrixClientPeg.MatrixClientPeg.get().getIgnoredUsers(),
      waitingUnignored: [],
      managingInvites: false,
      invitedRoomAmt: invitedRooms.length
    };
    this._onAction = this._onAction.bind(this);
  }

  _onAction({
    action
  }) {
    if (action === "ignore_state_changed") {
      const ignoredUserIds = _MatrixClientPeg.MatrixClientPeg.get().getIgnoredUsers();

      const newWaitingUnignored = this.state.waitingUnignored.filter(e => ignoredUserIds.includes(e));
      this.setState({
        ignoredUserIds,
        waitingUnignored: newWaitingUnignored
      });
    }
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this._onAction);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  _renderCurrentDeviceInfo() {
    const SettingsFlag = sdk.getComponent('views.elements.SettingsFlag');

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const deviceId = client.deviceId;
    let identityKey = client.getDeviceEd25519Key();

    if (!identityKey) {
      identityKey = (0, _languageHandler._t)("<not supported>");
    } else {
      identityKey = FormattingUtils.formatCryptoKey(identityKey);
    }

    let importExportButtons = null;

    if (client.isCryptoEnabled()) {
      importExportButtons = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SecurityUserSettingsTab_importExportButtons"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this._onExportE2eKeysClicked
      }, (0, _languageHandler._t)("Export E2E room keys")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this._onImportE2eKeysClicked
      }, (0, _languageHandler._t)("Import E2E room keys")));
    }

    let noSendUnverifiedSetting;

    if (_SettingsStore.default.isEnabled("blacklistUnverifiedDevices")) {
      noSendUnverifiedSetting = /*#__PURE__*/_react.default.createElement(SettingsFlag, {
        name: "blacklistUnverifiedDevices",
        level: _SettingLevel.SettingLevel.DEVICE,
        onChange: this._updateBlacklistDevicesFlag
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Cryptography")), /*#__PURE__*/_react.default.createElement("ul", {
      className: "mx_SettingsTab_subsectionText mx_SecurityUserSettingsTab_deviceInfo"
    }, /*#__PURE__*/_react.default.createElement("li", null, /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)("Session ID:")), /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("code", null, deviceId))), /*#__PURE__*/_react.default.createElement("li", null, /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)("Session key:")), /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("code", null, /*#__PURE__*/_react.default.createElement("b", null, identityKey))))), importExportButtons, noSendUnverifiedSetting);
  }

  _renderIgnoredUsers() {
    const {
      waitingUnignored,
      ignoredUserIds
    } = this.state;
    const userIds = !ignoredUserIds?.length ? (0, _languageHandler._t)('You have no ignored users.') : ignoredUserIds.map(u => {
      return /*#__PURE__*/_react.default.createElement(IgnoredUser, {
        userId: u,
        onUnignored: this._onUserUnignored,
        key: u,
        inProgress: waitingUnignored.includes(u)
      });
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)('Ignored users')), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, userIds));
  }

  _renderManageInvites() {
    if (this.state.invitedRoomAmt === 0) {
      return null;
    }

    const invitedRooms = this._getInvitedRooms();

    const InlineSpinner = sdk.getComponent('elements.InlineSpinner');

    const onClickAccept = this._onAcceptAllInvitesClicked.bind(this, invitedRooms);

    const onClickReject = this._onRejectAllInvitesClicked.bind(this, invitedRooms);

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SecurityUserSettingsTab_bulkOptions"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)('Bulk options')), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onClickAccept,
      kind: "primary",
      disabled: this.state.managingInvites
    }, (0, _languageHandler._t)("Accept all %(invitedRooms)s invites", {
      invitedRooms: this.state.invitedRoomAmt
    })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onClickReject,
      kind: "danger",
      disabled: this.state.managingInvites
    }, (0, _languageHandler._t)("Reject all %(invitedRooms)s invites", {
      invitedRooms: this.state.invitedRoomAmt
    })), this.state.managingInvites ? /*#__PURE__*/_react.default.createElement(InlineSpinner, null) : /*#__PURE__*/_react.default.createElement("div", null));
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    const DevicesPanel = sdk.getComponent('views.settings.DevicesPanel');
    const SettingsFlag = sdk.getComponent('views.elements.SettingsFlag');
    const EventIndexPanel = sdk.getComponent('views.settings.EventIndexPanel');

    const secureBackup = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Secure Backup")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement(_SecureBackupPanel.default, null)));

    const eventIndex = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Message search")), /*#__PURE__*/_react.default.createElement(EventIndexPanel, null)); // XXX: There's no such panel in the current cross-signing designs, but
    // it's useful to have for testing the feature. If there's no interest
    // in having advanced details here once all flows are implemented, we
    // can remove this.


    const CrossSigningPanel = sdk.getComponent('views.settings.CrossSigningPanel');

    const crossSigning = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Cross-signing")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement(CrossSigningPanel, null)));

    let warning;

    if (!(0, _createRoom.privateShouldBeEncrypted)()) {
      warning = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SecurityUserSettingsTab_warning"
      }, (0, _languageHandler._t)("Your server admin has disabled end-to-end encryption by default " + "in private rooms & Direct Messages."));
    }

    let privacySection;

    if (_Analytics.default.canEnable() || _CountlyAnalytics.default.instance.canEnable()) {
      privacySection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_heading"
      }, (0, _languageHandler._t)("Privacy")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subheading"
      }, (0, _languageHandler._t)("Analytics")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("%(brand)s collects anonymous analytics to allow us to improve the application.", {
        brand
      }), "\xA0", (0, _languageHandler._t)("Privacy is important to us, so we don't collect any personal or " + "identifiable data for our analytics."), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_SettingsTab_linkBtn",
        onClick: _Analytics.default.showDetailsModal
      }, (0, _languageHandler._t)("Learn more about how we use analytics."))), /*#__PURE__*/_react.default.createElement(SettingsFlag, {
        name: "analyticsOptIn",
        level: _SettingLevel.SettingLevel.DEVICE,
        onChange: this._updateAnalytics
      })));
    }

    const E2eAdvancedPanel = sdk.getComponent('views.settings.E2eAdvancedPanel');
    let advancedSection;

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.AdvancedSettings)) {
      const ignoreUsersPanel = this._renderIgnoredUsers();

      const invitesPanel = this._renderManageInvites();

      const e2ePanel = (0, _E2eAdvancedPanel.isE2eAdvancedPanelPossible)() ? /*#__PURE__*/_react.default.createElement(E2eAdvancedPanel, null) : null; // only show the section if there's something to show

      if (ignoreUsersPanel || invitesPanel || e2ePanel) {
        advancedSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SettingsTab_heading"
        }, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SettingsTab_section"
        }, ignoreUsersPanel, invitesPanel, e2ePanel));
      }
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_SecurityUserSettingsTab"
    }, warning, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Where you’re logged in")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Manage the names of and sign out of your sessions below or " + "<a>verify them in your User Profile</a>.", {}, {
      a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: this._onGoToUserProfileClick
      }, sub)
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)("A session's public name is visible to people you communicate with"), /*#__PURE__*/_react.default.createElement(DevicesPanel, null))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Encryption")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, secureBackup, eventIndex, crossSigning, this._renderCurrentDeviceInfo()), privacySection, advancedSection);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  closeSettingsFn: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = SecurityUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9TZWN1cml0eVVzZXJTZXR0aW5nc1RhYi5qcyJdLCJuYW1lcyI6WyJJZ25vcmVkVXNlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZSIsInByb3BzIiwib25Vbmlnbm9yZWQiLCJ1c2VySWQiLCJyZW5kZXIiLCJpZCIsIl9vblVuaWdub3JlQ2xpY2tlZCIsImluUHJvZ3Jlc3MiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiZnVuYyIsImJvb2wiLCJTZWN1cml0eVVzZXJTZXR0aW5nc1RhYiIsImNvbnN0cnVjdG9yIiwiY2hlY2tlZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInNldEdsb2JhbEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzIiwiQW5hbHl0aWNzIiwiZW5hYmxlIiwiZGlzYWJsZSIsIkNvdW50bHlBbmFseXRpY3MiLCJpbnN0YW5jZSIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jIiwibWF0cml4Q2xpZW50IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJnZXRVc2VySWQiLCJjbG9zZVNldHRpbmdzRm4iLCJpZ25vcmVkVXNlcklkcyIsIndhaXRpbmdVbmlnbm9yZWQiLCJzdGF0ZSIsImN1cnJlbnRseUlnbm9yZWRVc2VySWRzIiwiZmlsdGVyIiwiaW5jbHVkZXMiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJzZXRTdGF0ZSIsInNldElnbm9yZWRVc2VycyIsImdldFJvb21zIiwiciIsImhhc01lbWJlcnNoaXBTdGF0ZSIsImFjY2VwdCIsIm1hbmFnaW5nSW52aXRlcyIsImludml0ZWRSb29tSWRzIiwiX2dldEludml0ZWRSb29tcyIsIm1hcCIsInJvb20iLCJyb29tSWQiLCJzZWxmIiwiY2xpIiwiam9pblJvb20iLCJiaW5kIiwibGVhdmUiLCJpIiwibGVuZ3RoIiwidGhlbiIsImludml0ZWRSb29tQW10IiwiZXJyY29kZSIsInJldHJ5X2FmdGVyX21zIiwiY29uc29sZSIsIndhcm4iLCJldiIsIl9tYW5hZ2VJbnZpdGVzIiwiaW52aXRlZFJvb21zIiwiZ2V0SWdub3JlZFVzZXJzIiwiX29uQWN0aW9uIiwibmV3V2FpdGluZ1VuaWdub3JlZCIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwiX3JlbmRlckN1cnJlbnREZXZpY2VJbmZvIiwiU2V0dGluZ3NGbGFnIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiY2xpZW50IiwiZGV2aWNlSWQiLCJpZGVudGl0eUtleSIsImdldERldmljZUVkMjU1MTlLZXkiLCJGb3JtYXR0aW5nVXRpbHMiLCJmb3JtYXRDcnlwdG9LZXkiLCJpbXBvcnRFeHBvcnRCdXR0b25zIiwiaXNDcnlwdG9FbmFibGVkIiwiX29uRXhwb3J0RTJlS2V5c0NsaWNrZWQiLCJfb25JbXBvcnRFMmVLZXlzQ2xpY2tlZCIsIm5vU2VuZFVudmVyaWZpZWRTZXR0aW5nIiwiU2V0dGluZ3NTdG9yZSIsImlzRW5hYmxlZCIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsIl91cGRhdGVCbGFja2xpc3REZXZpY2VzRmxhZyIsIl9yZW5kZXJJZ25vcmVkVXNlcnMiLCJ1c2VySWRzIiwidSIsIl9vblVzZXJVbmlnbm9yZWQiLCJfcmVuZGVyTWFuYWdlSW52aXRlcyIsIklubGluZVNwaW5uZXIiLCJvbkNsaWNrQWNjZXB0IiwiX29uQWNjZXB0QWxsSW52aXRlc0NsaWNrZWQiLCJvbkNsaWNrUmVqZWN0IiwiX29uUmVqZWN0QWxsSW52aXRlc0NsaWNrZWQiLCJicmFuZCIsIlNka0NvbmZpZyIsIkRldmljZXNQYW5lbCIsIkV2ZW50SW5kZXhQYW5lbCIsInNlY3VyZUJhY2t1cCIsImV2ZW50SW5kZXgiLCJDcm9zc1NpZ25pbmdQYW5lbCIsImNyb3NzU2lnbmluZyIsIndhcm5pbmciLCJwcml2YWN5U2VjdGlvbiIsImNhbkVuYWJsZSIsInNob3dEZXRhaWxzTW9kYWwiLCJfdXBkYXRlQW5hbHl0aWNzIiwiRTJlQWR2YW5jZWRQYW5lbCIsImFkdmFuY2VkU2VjdGlvbiIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiQWR2YW5jZWRTZXR0aW5ncyIsImlnbm9yZVVzZXJzUGFuZWwiLCJpbnZpdGVzUGFuZWwiLCJlMmVQYW5lbCIsImEiLCJzdWIiLCJfb25Hb1RvVXNlclByb2ZpbGVDbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRU8sTUFBTUEsV0FBTixTQUEwQkMsZUFBTUMsU0FBaEMsQ0FBMEM7QUFBQTtBQUFBO0FBQUEsOERBT3ZCQyxDQUFELElBQU87QUFDeEIsV0FBS0MsS0FBTCxDQUFXQyxXQUFYLENBQXVCLEtBQUtELEtBQUwsQ0FBV0UsTUFBbEM7QUFDSCxLQVQ0QztBQUFBOztBQVc3Q0MsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsRUFBRSxHQUFJLDBDQUF5QyxLQUFLSixLQUFMLENBQVdFLE1BQU8sRUFBdkU7QUFDQSx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxPQUFPLEVBQUUsS0FBS0csa0JBQWhDO0FBQW9ELE1BQUEsSUFBSSxFQUFDLFlBQXpEO0FBQXNFLDBCQUFrQkQsRUFBeEY7QUFBNEYsTUFBQSxRQUFRLEVBQUUsS0FBS0osS0FBTCxDQUFXTTtBQUFqSCxPQUNNLHlCQUFHLFVBQUgsQ0FETixDQURKLGVBSUk7QUFBTSxNQUFBLEVBQUUsRUFBRUY7QUFBVixPQUFnQixLQUFLSixLQUFMLENBQVdFLE1BQTNCLENBSkosQ0FESjtBQVFIOztBQXJCNEM7Ozs4QkFBcENOLFcsZUFDVTtB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bEIsWUFETCxFQUVLQyxVQUZMLEVBR0tFLFlBSEwsRUFJSyxLQUFLckMsd0JBQUwsRUFKTCxDQXJCSixFQTJCTXVDLGNBM0JOLEVBNEJNSyxlQTVCTixDQURKO0FBZ0NIOztBQXRXZ0UsQyxzREFDOUM7QUFDZjFGLEVBQUFBLGVBQWUsRUFBRXZCLG1CQUFVRyxJQUFWLENBQWVEO0FBRGpCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBGb3JtYXR0aW5nVXRpbHMgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3V0aWxzL0Zvcm1hdHRpbmdVdGlsc1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBBbmFseXRpY3MgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL0FuYWx5dGljc1wiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi8uLi8uLlwiO1xuaW1wb3J0IHtzbGVlcH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3V0aWxzL3Byb21pc2VcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWR9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQge1NldHRpbmdMZXZlbH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IFNlY3VyZUJhY2t1cFBhbmVsIGZyb20gXCIuLi8uLi9TZWN1cmVCYWNrdXBQYW5lbFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQge2lzRTJlQWR2YW5jZWRQYW5lbFBvc3NpYmxlfSBmcm9tIFwiLi4vLi4vRTJlQWR2YW5jZWRQYW5lbFwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL0NvdW50bHlBbmFseXRpY3NcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5leHBvcnQgY2xhc3MgSWdub3JlZFVzZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHVzZXJJZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBvblVuaWdub3JlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgaW5Qcm9ncmVzczogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgX29uVW5pZ25vcmVDbGlja2VkID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblVuaWdub3JlZCh0aGlzLnByb3BzLnVzZXJJZCk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgaWQgPSBgbXhfU2VjdXJpdHlVc2VyU2V0dGluZ3NUYWJfaWdub3JlZFVzZXJfJHt0aGlzLnByb3BzLnVzZXJJZH1gO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NlY3VyaXR5VXNlclNldHRpbmdzVGFiX2lnbm9yZWRVc2VyJz5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vblVuaWdub3JlQ2xpY2tlZH0ga2luZD0ncHJpbWFyeV9zbScgYXJpYS1kZXNjcmliZWRieT17aWR9IGRpc2FibGVkPXt0aGlzLnByb3BzLmluUHJvZ3Jlc3N9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdVbmlnbm9yZScpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPHNwYW4gaWQ9e2lkfT57IHRoaXMucHJvcHMudXNlcklkIH08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnNldHRpbmdzLnRhYnMudXNlci5TZWN1cml0eVVzZXJTZXR0aW5nc1RhYlwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VjdXJpdHlVc2VyU2V0dGluZ3NUYWIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGNsb3NlU2V0dGluZ3NGbjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLy8gR2V0IG51bWJlciBvZiByb29tcyB3ZSdyZSBpbnZpdGVkIHRvXG4gICAgICAgIGNvbnN0IGludml0ZWRSb29tcyA9IHRoaXMuX2dldEludml0ZWRSb29tcygpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpZ25vcmVkVXNlcklkczogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElnbm9yZWRVc2VycygpLFxuICAgICAgICAgICAgd2FpdGluZ1VuaWdub3JlZDogW10sXG4gICAgICAgICAgICBtYW5hZ2luZ0ludml0ZXM6IGZhbHNlLFxuICAgICAgICAgICAgaW52aXRlZFJvb21BbXQ6IGludml0ZWRSb29tcy5sZW5ndGgsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fb25BY3Rpb24gPSB0aGlzLl9vbkFjdGlvbi5iaW5kKHRoaXMpO1xuICAgIH1cblxuXG4gICAgX29uQWN0aW9uKHthY3Rpb259KSB7XG4gICAgICAgIGlmIChhY3Rpb24gPT09IFwiaWdub3JlX3N0YXRlX2NoYW5nZWRcIikge1xuICAgICAgICAgICAgY29uc3QgaWdub3JlZFVzZXJJZHMgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWdub3JlZFVzZXJzKCk7XG4gICAgICAgICAgICBjb25zdCBuZXdXYWl0aW5nVW5pZ25vcmVkID0gdGhpcy5zdGF0ZS53YWl0aW5nVW5pZ25vcmVkLmZpbHRlcihlPT4gaWdub3JlZFVzZXJJZHMuaW5jbHVkZXMoZSkpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aWdub3JlZFVzZXJJZHMsIHdhaXRpbmdVbmlnbm9yZWQ6IG5ld1dhaXRpbmdVbmlnbm9yZWR9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5fb25BY3Rpb24pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIF91cGRhdGVCbGFja2xpc3REZXZpY2VzRmxhZyA9IChjaGVja2VkKSA9PiB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRHbG9iYWxCbGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlcyhjaGVja2VkKTtcbiAgICB9O1xuXG4gICAgX3VwZGF0ZUFuYWx5dGljcyA9IChjaGVja2VkKSA9PiB7XG4gICAgICAgIGNoZWNrZWQgPyBBbmFseXRpY3MuZW5hYmxlKCkgOiBBbmFseXRpY3MuZGlzYWJsZSgpO1xuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLmVuYWJsZSgvKiBhbm9ueW1vdXMgPSAqLyAhY2hlY2tlZCk7XG4gICAgfTtcblxuICAgIF9vbkV4cG9ydEUyZUtleXNDbGlja2VkID0gKCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMoJ0V4cG9ydCBFMkUgS2V5cycsICcnLFxuICAgICAgICAgICAgaW1wb3J0KCcuLi8uLi8uLi8uLi8uLi9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvRXhwb3J0RTJlS2V5c0RpYWxvZycpLFxuICAgICAgICAgICAge21hdHJpeENsaWVudDogTWF0cml4Q2xpZW50UGVnLmdldCgpfSxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgX29uSW1wb3J0RTJlS2V5c0NsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYygnSW1wb3J0IEUyRSBLZXlzJywgJycsXG4gICAgICAgICAgICBpbXBvcnQoJy4uLy4uLy4uLy4uLy4uL2FzeW5jLWNvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9JbXBvcnRFMmVLZXlzRGlhbG9nJyksXG4gICAgICAgICAgICB7bWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnRQZWcuZ2V0KCl9LFxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBfb25Hb1RvVXNlclByb2ZpbGVDbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfdXNlcl9pbmZvJyxcbiAgICAgICAgICAgIHVzZXJJZDogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5jbG9zZVNldHRpbmdzRm4oKTtcbiAgICB9XG5cbiAgICBfb25Vc2VyVW5pZ25vcmVkID0gYXN5bmMgKHVzZXJJZCkgPT4ge1xuICAgICAgICBjb25zdCB7aWdub3JlZFVzZXJJZHMsIHdhaXRpbmdVbmlnbm9yZWR9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgY29uc3QgY3VycmVudGx5SWdub3JlZFVzZXJJZHMgPSBpZ25vcmVkVXNlcklkcy5maWx0ZXIoZSA9PiAhd2FpdGluZ1VuaWdub3JlZC5pbmNsdWRlcyhlKSk7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSBjdXJyZW50bHlJZ25vcmVkVXNlcklkcy5pbmRleE9mKHVzZXJJZCk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGN1cnJlbnRseUlnbm9yZWRVc2VySWRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKCh7d2FpdGluZ1VuaWdub3JlZH0pID0+ICh7d2FpdGluZ1VuaWdub3JlZDogWy4uLndhaXRpbmdVbmlnbm9yZWQsIHVzZXJJZF19KSk7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0SWdub3JlZFVzZXJzKGN1cnJlbnRseUlnbm9yZWRVc2VySWRzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfZ2V0SW52aXRlZFJvb21zID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb21zKCkuZmlsdGVyKChyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gci5oYXNNZW1iZXJzaGlwU3RhdGUoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLCBcImludml0ZVwiKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9tYW5hZ2VJbnZpdGVzID0gYXN5bmMgKGFjY2VwdCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG1hbmFnaW5nSW52aXRlczogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ29tcGlsZSBhcnJheSBvZiBpbnZpdGF0aW9uIHJvb20gaWRzXG4gICAgICAgIGNvbnN0IGludml0ZWRSb29tSWRzID0gdGhpcy5fZ2V0SW52aXRlZFJvb21zKCkubWFwKChyb29tKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcm9vbS5yb29tSWQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEV4ZWN1dGUgYWxsIGFjY2VwdGFuY2VzL3JlamVjdGlvbnMgc2VxdWVudGlhbGx5XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGFjY2VwdCA/IGNsaS5qb2luUm9vbS5iaW5kKGNsaSkgOiBjbGkubGVhdmUuYmluZChjbGkpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGludml0ZWRSb29tSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBpbnZpdGVkUm9vbUlkc1tpXTtcblxuICAgICAgICAgICAgLy8gQWNjZXB0L3JlamVjdCBpbnZpdGVcbiAgICAgICAgICAgIGF3YWl0IGFjdGlvbihyb29tSWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE5vIGVycm9yLCB1cGRhdGUgaW52aXRlZCByb29tcyBidXR0b25cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtpbnZpdGVkUm9vbUFtdDogc2VsZi5zdGF0ZS5pbnZpdGVkUm9vbUFtdCAtIDF9KTtcbiAgICAgICAgICAgIH0sIGFzeW5jIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQWN0aW9uIGZhaWx1cmVcbiAgICAgICAgICAgICAgICBpZiAoZS5lcnJjb2RlID09PSBcIk1fTElNSVRfRVhDRUVERURcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBkZWxheSBiZXR3ZWVuIGVhY2ggaW52aXRlIGNoYW5nZSBpbiBvcmRlciB0byBhdm9pZCByYXRlXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpbWl0aW5nIGJ5IHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKGUucmV0cnlfYWZ0ZXJfbXMgfHwgMjUwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVkbyBsYXN0IGFjdGlvblxuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJpbnQgb3V0IGVycm9yIHdpdGggam9pbmluZy9sZWF2aW5nIHJvb21cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBtYW5hZ2luZ0ludml0ZXM6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQWNjZXB0QWxsSW52aXRlc0NsaWNrZWQgPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5fbWFuYWdlSW52aXRlcyh0cnVlKTtcbiAgICB9O1xuXG4gICAgX29uUmVqZWN0QWxsSW52aXRlc0NsaWNrZWQgPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5fbWFuYWdlSW52aXRlcyhmYWxzZSk7XG4gICAgfTtcblxuICAgIF9yZW5kZXJDdXJyZW50RGV2aWNlSW5mbygpIHtcbiAgICAgICAgY29uc3QgU2V0dGluZ3NGbGFnID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuU2V0dGluZ3NGbGFnJyk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBkZXZpY2VJZCA9IGNsaWVudC5kZXZpY2VJZDtcbiAgICAgICAgbGV0IGlkZW50aXR5S2V5ID0gY2xpZW50LmdldERldmljZUVkMjU1MTlLZXkoKTtcbiAgICAgICAgaWYgKCFpZGVudGl0eUtleSkge1xuICAgICAgICAgICAgaWRlbnRpdHlLZXkgPSBfdChcIjxub3Qgc3VwcG9ydGVkPlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlkZW50aXR5S2V5ID0gRm9ybWF0dGluZ1V0aWxzLmZvcm1hdENyeXB0b0tleShpZGVudGl0eUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW1wb3J0RXhwb3J0QnV0dG9ucyA9IG51bGw7XG4gICAgICAgIGlmIChjbGllbnQuaXNDcnlwdG9FbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGltcG9ydEV4cG9ydEJ1dHRvbnMgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NlY3VyaXR5VXNlclNldHRpbmdzVGFiX2ltcG9ydEV4cG9ydEJ1dHRvbnMnPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPSdwcmltYXJ5JyBvbkNsaWNrPXt0aGlzLl9vbkV4cG9ydEUyZUtleXNDbGlja2VkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkV4cG9ydCBFMkUgcm9vbSBrZXlzXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J3ByaW1hcnknIG9uQ2xpY2s9e3RoaXMuX29uSW1wb3J0RTJlS2V5c0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiSW1wb3J0IEUyRSByb29tIGtleXNcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbm9TZW5kVW52ZXJpZmllZFNldHRpbmc7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmlzRW5hYmxlZChcImJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzXCIpKSB7XG4gICAgICAgICAgICBub1NlbmRVbnZlcmlmaWVkU2V0dGluZyA9IDxTZXR0aW5nc0ZsYWdcbiAgICAgICAgICAgICAgICBuYW1lPSdibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlcydcbiAgICAgICAgICAgICAgICBsZXZlbD17U2V0dGluZ0xldmVsLkRFVklDRX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fdXBkYXRlQmxhY2tsaXN0RGV2aWNlc0ZsYWd9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbic+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJDcnlwdG9ncmFwaHlcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0IG14X1NlY3VyaXR5VXNlclNldHRpbmdzVGFiX2RldmljZUluZm8nPlxuICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+e190KFwiU2Vzc2lvbiBJRDpcIil9PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPjxjb2RlPntkZXZpY2VJZH08L2NvZGU+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+e190KFwiU2Vzc2lvbiBrZXk6XCIpfTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj48Y29kZT48Yj57aWRlbnRpdHlLZXl9PC9iPjwvY29kZT48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICB7aW1wb3J0RXhwb3J0QnV0dG9uc31cbiAgICAgICAgICAgICAgICB7bm9TZW5kVW52ZXJpZmllZFNldHRpbmd9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfcmVuZGVySWdub3JlZFVzZXJzKCkge1xuICAgICAgICBjb25zdCB7d2FpdGluZ1VuaWdub3JlZCwgaWdub3JlZFVzZXJJZHN9ID0gdGhpcy5zdGF0ZTtcblxuICAgICAgICBjb25zdCB1c2VySWRzID0gIWlnbm9yZWRVc2VySWRzPy5sZW5ndGhcbiAgICAgICAgICAgID8gX3QoJ1lvdSBoYXZlIG5vIGlnbm9yZWQgdXNlcnMuJylcbiAgICAgICAgICAgIDogaWdub3JlZFVzZXJJZHMubWFwKCh1KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPElnbm9yZWRVc2VyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ9e3V9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblVuaWdub3JlZD17dGhpcy5fb25Vc2VyVW5pZ25vcmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt1fVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5Qcm9ncmVzcz17d2FpdGluZ1VuaWdub3JlZC5pbmNsdWRlcyh1KX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdCgnSWdub3JlZCB1c2VycycpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICB7dXNlcklkc31cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJNYW5hZ2VJbnZpdGVzKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pbnZpdGVkUm9vbUFtdCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbnZpdGVkUm9vbXMgPSB0aGlzLl9nZXRJbnZpdGVkUm9vbXMoKTtcbiAgICAgICAgY29uc3QgSW5saW5lU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLklubGluZVNwaW5uZXInKTtcbiAgICAgICAgY29uc3Qgb25DbGlja0FjY2VwdCA9IHRoaXMuX29uQWNjZXB0QWxsSW52aXRlc0NsaWNrZWQuYmluZCh0aGlzLCBpbnZpdGVkUm9vbXMpO1xuICAgICAgICBjb25zdCBvbkNsaWNrUmVqZWN0ID0gdGhpcy5fb25SZWplY3RBbGxJbnZpdGVzQ2xpY2tlZC5iaW5kKHRoaXMsIGludml0ZWRSb29tcyk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZWN1cml0eVVzZXJTZXR0aW5nc1RhYl9idWxrT3B0aW9ucyc+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoJ0J1bGsgb3B0aW9ucycpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXtvbkNsaWNrQWNjZXB0fSBraW5kPSdwcmltYXJ5JyBkaXNhYmxlZD17dGhpcy5zdGF0ZS5tYW5hZ2luZ0ludml0ZXN9PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJBY2NlcHQgYWxsICUoaW52aXRlZFJvb21zKXMgaW52aXRlc1wiLCB7aW52aXRlZFJvb21zOiB0aGlzLnN0YXRlLmludml0ZWRSb29tQW10fSl9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e29uQ2xpY2tSZWplY3R9IGtpbmQ9J2RhbmdlcicgZGlzYWJsZWQ9e3RoaXMuc3RhdGUubWFuYWdpbmdJbnZpdGVzfT5cbiAgICAgICAgICAgICAgICAgICAge190KFwiUmVqZWN0IGFsbCAlKGludml0ZWRSb29tcylzIGludml0ZXNcIiwge2ludml0ZWRSb29tczogdGhpcy5zdGF0ZS5pbnZpdGVkUm9vbUFtdH0pfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5tYW5hZ2luZ0ludml0ZXMgPyA8SW5saW5lU3Bpbm5lciAvPiA6IDxkaXYgLz59XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICBjb25zdCBEZXZpY2VzUGFuZWwgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5zZXR0aW5ncy5EZXZpY2VzUGFuZWwnKTtcbiAgICAgICAgY29uc3QgU2V0dGluZ3NGbGFnID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuU2V0dGluZ3NGbGFnJyk7XG4gICAgICAgIGNvbnN0IEV2ZW50SW5kZXhQYW5lbCA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLnNldHRpbmdzLkV2ZW50SW5kZXhQYW5lbCcpO1xuXG4gICAgICAgIGNvbnN0IHNlY3VyZUJhY2t1cCA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiU2VjdXJlIEJhY2t1cFwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgPFNlY3VyZUJhY2t1cFBhbmVsIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBldmVudEluZGV4ID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPntfdChcIk1lc3NhZ2Ugc2VhcmNoXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8RXZlbnRJbmRleFBhbmVsIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBYWFg6IFRoZXJlJ3Mgbm8gc3VjaCBwYW5lbCBpbiB0aGUgY3VycmVudCBjcm9zcy1zaWduaW5nIGRlc2lnbnMsIGJ1dFxuICAgICAgICAvLyBpdCdzIHVzZWZ1bCB0byBoYXZlIGZvciB0ZXN0aW5nIHRoZSBmZWF0dXJlLiBJZiB0aGVyZSdzIG5vIGludGVyZXN0XG4gICAgICAgIC8vIGluIGhhdmluZyBhZHZhbmNlZCBkZXRhaWxzIGhlcmUgb25jZSBhbGwgZmxvd3MgYXJlIGltcGxlbWVudGVkLCB3ZVxuICAgICAgICAvLyBjYW4gcmVtb3ZlIHRoaXMuXG4gICAgICAgIGNvbnN0IENyb3NzU2lnbmluZ1BhbmVsID0gc2RrLmdldENvbXBvbmVudCgndmlld3Muc2V0dGluZ3MuQ3Jvc3NTaWduaW5nUGFuZWwnKTtcbiAgICAgICAgY29uc3QgY3Jvc3NTaWduaW5nID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24nPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJDcm9zcy1zaWduaW5nXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICA8Q3Jvc3NTaWduaW5nUGFuZWwgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuXG4gICAgICAgIGxldCB3YXJuaW5nO1xuICAgICAgICBpZiAoIXByaXZhdGVTaG91bGRCZUVuY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICB3YXJuaW5nID0gPGRpdiBjbGFzc05hbWU9XCJteF9TZWN1cml0eVVzZXJTZXR0aW5nc1RhYl93YXJuaW5nXCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIllvdXIgc2VydmVyIGFkbWluIGhhcyBkaXNhYmxlZCBlbmQtdG8tZW5kIGVuY3J5cHRpb24gYnkgZGVmYXVsdCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiaW4gcHJpdmF0ZSByb29tcyAmIERpcmVjdCBNZXNzYWdlcy5cIikgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHByaXZhY3lTZWN0aW9uO1xuICAgICAgICBpZiAoQW5hbHl0aWNzLmNhbkVuYWJsZSgpIHx8IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UuY2FuRW5hYmxlKCkpIHtcbiAgICAgICAgICAgIHByaXZhY3lTZWN0aW9uID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntfdChcIlByaXZhY3lcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJBbmFseXRpY3NcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIlKGJyYW5kKXMgY29sbGVjdHMgYW5vbnltb3VzIGFuYWx5dGljcyB0byBhbGxvdyB1cyB0byBpbXByb3ZlIHRoZSBhcHBsaWNhdGlvbi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGJyYW5kIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJQcml2YWN5IGlzIGltcG9ydGFudCB0byB1cywgc28gd2UgZG9uJ3QgY29sbGVjdCBhbnkgcGVyc29uYWwgb3IgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRlbnRpZmlhYmxlIGRhdGEgZm9yIG91ciBhbmFseXRpY3MuXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfbGlua0J0blwiIG9uQ2xpY2s9e0FuYWx5dGljcy5zaG93RGV0YWlsc01vZGFsfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJMZWFybiBtb3JlIGFib3V0IGhvdyB3ZSB1c2UgYW5hbHl0aWNzLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxTZXR0aW5nc0ZsYWcgbmFtZT1cImFuYWx5dGljc09wdEluXCIgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9IG9uQ2hhbmdlPXt0aGlzLl91cGRhdGVBbmFseXRpY3N9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEUyZUFkdmFuY2VkUGFuZWwgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5zZXR0aW5ncy5FMmVBZHZhbmNlZFBhbmVsJyk7XG4gICAgICAgIGxldCBhZHZhbmNlZFNlY3Rpb247XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5BZHZhbmNlZFNldHRpbmdzKSkge1xuICAgICAgICAgICAgY29uc3QgaWdub3JlVXNlcnNQYW5lbCA9IHRoaXMuX3JlbmRlcklnbm9yZWRVc2VycygpO1xuICAgICAgICAgICAgY29uc3QgaW52aXRlc1BhbmVsID0gdGhpcy5fcmVuZGVyTWFuYWdlSW52aXRlcygpO1xuICAgICAgICAgICAgY29uc3QgZTJlUGFuZWwgPSBpc0UyZUFkdmFuY2VkUGFuZWxQb3NzaWJsZSgpID8gPEUyZUFkdmFuY2VkUGFuZWwgLz4gOiBudWxsO1xuICAgICAgICAgICAgLy8gb25seSBzaG93IHRoZSBzZWN0aW9uIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHRvIHNob3dcbiAgICAgICAgICAgIGlmIChpZ25vcmVVc2Vyc1BhbmVsIHx8IGludml0ZXNQYW5lbCB8fCBlMmVQYW5lbCkge1xuICAgICAgICAgICAgICAgIGFkdmFuY2VkU2VjdGlvbiA9IDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntfdChcIkFkdmFuY2VkXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtpZ25vcmVVc2Vyc1BhbmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAge2ludml0ZXNQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlMmVQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWIgbXhfU2VjdXJpdHlVc2VyU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICB7d2FybmluZ31cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJXaGVyZSB5b3XigJlyZSBsb2dnZWQgaW5cIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTWFuYWdlIHRoZSBuYW1lcyBvZiBhbmQgc2lnbiBvdXQgb2YgeW91ciBzZXNzaW9ucyBiZWxvdyBvciBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8YT52ZXJpZnkgdGhlbSBpbiB5b3VyIFVzZXIgUHJvZmlsZTwvYT4uXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rXCIgb25DbGljaz17dGhpcy5fb25Hb1RvVXNlclByb2ZpbGVDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJBIHNlc3Npb24ncyBwdWJsaWMgbmFtZSBpcyB2aXNpYmxlIHRvIHBlb3BsZSB5b3UgY29tbXVuaWNhdGUgd2l0aFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxEZXZpY2VzUGFuZWwgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiRW5jcnlwdGlvblwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAge3NlY3VyZUJhY2t1cH1cbiAgICAgICAgICAgICAgICAgICAge2V2ZW50SW5kZXh9XG4gICAgICAgICAgICAgICAgICAgIHtjcm9zc1NpZ25pbmd9XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJDdXJyZW50RGV2aWNlSW5mbygpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgcHJpdmFjeVNlY3Rpb24gfVxuICAgICAgICAgICAgICAgIHsgYWR2YW5jZWRTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
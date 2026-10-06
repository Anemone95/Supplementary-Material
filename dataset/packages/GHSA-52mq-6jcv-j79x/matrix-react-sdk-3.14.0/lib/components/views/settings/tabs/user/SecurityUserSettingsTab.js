"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2019 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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

class SecurityUserSettingsTab extends _react.default.Component {
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
    if (!ignoredUserIds || ignoredUserIds.length === 0) return null;
    const userIds = ignoredUserIds.map(u => /*#__PURE__*/_react.default.createElement(IgnoredUser, {
      userId: u,
      onUnignored: this._onUserUnignored,
      key: u,
      inProgress: waitingUnignored.includes(u)
    }));
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

}

exports.default = SecurityUserSettingsTab;
(0, _defineProperty2.default)(SecurityUserSettingsTab, "propTypes", {
  closeSettingsFn: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9TZWN1cml0eVVzZXJTZXR0aW5nc1RhYi5qcyJdLCJuYW1lcyI6WyJJZ25vcmVkVXNlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZSIsInByb3BzIiwib25Vbmlnbm9yZWQiLCJ1c2VySWQiLCJyZW5kZXIiLCJpZCIsIl9vblVuaWdub3JlQ2xpY2tlZCIsImluUHJvZ3Jlc3MiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiZnVuYyIsImJvb2wiLCJTZWN1cml0eVVzZXJTZXR0aW5nc1RhYiIsImNvbnN0cnVjdG9yIiwiY2hlY2tlZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInNldEdsb2JhbEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzIiwiQW5hbHl0aWNzIiwiZW5hYmxlIiwiZGlzYWJsZSIsIkNvdW50bHlBbmFseXRpY3MiLCJpbnN0YW5jZSIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jIiwibWF0cml4Q2xpZW50IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJnZXRVc2VySWQiLCJjbG9zZVNldHRpbmdzRm4iLCJpZ25vcmVkVXNlcklkcyIsIndhaXRpbmdVbmlnbm9yZWQiLCJzdGF0ZSIsImN1cnJlbnRseUlnbm9yZWRVc2VySWRzIiwiZmlsdGVyIiwiaW5jbHVkZXMiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJzZXRTdGF0ZSIsInNldElnbm9yZWRVc2VycyIsImdldFJvb21zIiwiciIsImhhc01lbWJlcnNoaXBTdGF0ZSIsImFjY2VwdCIsIm1hbmFnaW5nSW52aXRlcyIsImludml0ZWRSb29tSWRzIiwiX2dldEludml0ZWRSb29tcyIsIm1hcCIsInJvb20iLCJyb29tSWQiLCJzZWxmIiwiY2xpIiwiam9pblJvb20iLCJiaW5kIiwibGVhdmUiLCJpIiwibGVuZ3RoIiwidGhlbiIsImludml0ZWRSb29tQW10IiwiZXJyY29kZSIsInJldHJ5X2FmdGVyX21zIiwiY29uc29sZSIsIndhcm4iLCJldiIsIl9tYW5hZ2VJbnZpdGVzIiwiaW52aXRlZFJvb21zIiwiZ2V0SWdub3JlZFVzZXJzIiwiX29uQWN0aW9uIiwibmV3V2FpdGluZ1VuaWdub3JlZCIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwiX3JlbmRlckN1cnJlbnREZXZpY2VJbmZvIiwiU2V0dGluZ3NGbGFnIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiY2xpZW50IiwiZGV2aWNlSWQiLCJpZGVudGl0eUtleSIsImdldERldmljZUVkMjU1MTlLZXkiLCJGb3JtYXR0aW5nVXRpbHMiLCJmb3JtYXRDcnlwdG9LZXkiLCJpbXBvcnRFeHBvcnRCdXR0b25zIiwiaXNDcnlwdG9FbmFibGVkIiwiX29uRXhwb3J0RTJlS2V5c0NsaWNrZWQiLCJfb25JbXBvcnRFMmVLZXlzQ2xpY2tlZCIsIm5vU2VuZFVudmVyaWZpZWRTZXR0aW5nIiwiU2V0dGluZ3NTdG9yZSIsImlzRW5hYmxlZCIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsIl91cGRhdGVCbGFja2xpc3REZXZpY2VzRmxhZyIsIl9yZW5kZXJJZ25vcmVkVXNlcnMiLCJ1c2VySWRzIiwidSIsIl9vblVzZXJVbmlnbm9yZWQiLCJfcmVuZGVyTWFuYWdlSW52aXRlcyIsIklubGluZVNwaW5uZXIiLCJvbkNsaWNrQWNjZXB0IiwiX29uQWNjZXB0QWxsSW52aXRlc0NsaWNrZWQiLCJvbkNsaWNrUmVqZWN0IiwiX29uUmVqZWN0QWxsSW52aXRlc0NsaWNrZWQiLCJicmFuZCIsIlNka0NvbmZpZyIsIkRldmljZXNQYW5lbCIsIkV2ZW50SW5kZXhQYW5lbCIsInNlY3VyZUJhY2t1cCIsImV2ZW50SW5kZXgiLCJDcm9zc1NpZ25pbmdQYW5lbCIsImNyb3NzU2lnbmluZyIsIndhcm5pbmciLCJwcml2YWN5U2VjdGlvbiIsImNhbkVuYWJsZSIsInNob3dEZXRhaWxzTW9kYWwiLCJfdXBkYXRlQW5hbHl0aWNzIiwiRTJlQWR2YW5jZWRQYW5lbCIsImFkdmFuY2VkU2VjdGlvbiIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiQWR2YW5jZWRTZXR0aW5ncyIsImlnbm9yZVVzZXJzUGFuZWwiLCJpbnZpdGVzUGFuZWwiLCJlMmVQYW5lbCIsImEiLCJzdWIiLCJfb25Hb1RvVXNlclByb2ZpbGVDbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQW5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXNCTyxNQUFNQSxXQUFOLFNBQTBCQyxlQUFNQyxTQUFoQyxDQUEwQztBQUFBO0FBQUE7QUFBQSw4REFPdkJDLENBQUQsSUFBTztBQUN4QixXQUFLQyxLQUFMLENBQVdDLFdBQVgsQ0FBdUIsS0FBS0QsS0FBTCxDQUFXRSxNQUFsQztBQUNILEtBVDRDO0FBQUE7O0FBVzdDQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxFQUFFLEdBQUksMENBQXlDLEtBQUtKLEtBQUwsQ0FBV0UsTUFBTyxFQUF2RTtBQUNBLHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSw2QkFBQyx5QkFBRDtBQUFrQixNQUFBLE9BQU8sRUFBRSxLQUFLRyxrQkFBaEM7QUFBb0QsTUFBQSxJQUFJLEVBQUMsWUFBekQ7QUFBc0UsMEJBQWtCRCxFQUF4RjtBQUE0RixNQUFBLFFBQVEsRUFBRSxLQUFLSixLQUFMLENBQVdNO0FBQWpILE9BQ00seUJBQUcsVUFBSCxDQUROLENBREosZUFJSTtBQUFNLE1BQUEsRUFBRSxFQUFFRjtB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Q0FwQkosZUFxQkk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0tsQixZQURMLEVBRUtDLFVBRkwsRUFHS0UsWUFITCxFQUlLLEtBQUtyQyx3QkFBTCxFQUpMLENBckJKLEVBMkJNdUMsY0EzQk4sRUE0Qk1LLGVBNUJOLENBREo7QUFnQ0g7O0FBbldnRTs7OzhCQUFoRDVHLHVCLGVBQ0U7QUFDZmtCLEVBQUFBLGVBQWUsRUFBRXZCLG1CQUFVRyxJQUFWLENBQWVEO0FBRGpCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBGb3JtYXR0aW5nVXRpbHMgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3V0aWxzL0Zvcm1hdHRpbmdVdGlsc1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBBbmFseXRpY3MgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL0FuYWx5dGljc1wiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi8uLi8uLlwiO1xuaW1wb3J0IHtzbGVlcH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3V0aWxzL3Byb21pc2VcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWR9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQge1NldHRpbmdMZXZlbH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IFNlY3VyZUJhY2t1cFBhbmVsIGZyb20gXCIuLi8uLi9TZWN1cmVCYWNrdXBQYW5lbFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQge2lzRTJlQWR2YW5jZWRQYW5lbFBvc3NpYmxlfSBmcm9tIFwiLi4vLi4vRTJlQWR2YW5jZWRQYW5lbFwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL0NvdW50bHlBbmFseXRpY3NcIjtcblxuZXhwb3J0IGNsYXNzIElnbm9yZWRVc2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICB1c2VySWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Vbmlnbm9yZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGluUHJvZ3Jlc3M6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIF9vblVuaWdub3JlQ2xpY2tlZCA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25Vbmlnbm9yZWQodGhpcy5wcm9wcy51c2VySWQpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGlkID0gYG14X1NlY3VyaXR5VXNlclNldHRpbmdzVGFiX2lnbm9yZWRVc2VyXyR7dGhpcy5wcm9wcy51c2VySWR9YDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZWN1cml0eVVzZXJTZXR0aW5nc1RhYl9pZ25vcmVkVXNlcic+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25Vbmlnbm9yZUNsaWNrZWR9IGtpbmQ9J3ByaW1hcnlfc20nIGFyaWEtZGVzY3JpYmVkYnk9e2lkfSBkaXNhYmxlZD17dGhpcy5wcm9wcy5pblByb2dyZXNzfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnVW5pZ25vcmUnKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxzcGFuIGlkPXtpZH0+eyB0aGlzLnByb3BzLnVzZXJJZCB9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWN1cml0eVVzZXJTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgY2xvc2VTZXR0aW5nc0ZuOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvLyBHZXQgbnVtYmVyIG9mIHJvb21zIHdlJ3JlIGludml0ZWQgdG9cbiAgICAgICAgY29uc3QgaW52aXRlZFJvb21zID0gdGhpcy5fZ2V0SW52aXRlZFJvb21zKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGlnbm9yZWRVc2VySWRzOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWdub3JlZFVzZXJzKCksXG4gICAgICAgICAgICB3YWl0aW5nVW5pZ25vcmVkOiBbXSxcbiAgICAgICAgICAgIG1hbmFnaW5nSW52aXRlczogZmFsc2UsXG4gICAgICAgICAgICBpbnZpdGVkUm9vbUFtdDogaW52aXRlZFJvb21zLmxlbmd0aCxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9vbkFjdGlvbiA9IHRoaXMuX29uQWN0aW9uLmJpbmQodGhpcyk7XG4gICAgfVxuXG5cbiAgICBfb25BY3Rpb24oe2FjdGlvbn0pIHtcbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gXCJpZ25vcmVfc3RhdGVfY2hhbmdlZFwiKSB7XG4gICAgICAgICAgICBjb25zdCBpZ25vcmVkVXNlcklkcyA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZ25vcmVkVXNlcnMoKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1dhaXRpbmdVbmlnbm9yZWQgPSB0aGlzLnN0YXRlLndhaXRpbmdVbmlnbm9yZWQuZmlsdGVyKGU9PiBpZ25vcmVkVXNlcklkcy5pbmNsdWRlcyhlKSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtpZ25vcmVkVXNlcklkcywgd2FpdGluZ1VuaWdub3JlZDogbmV3V2FpdGluZ1VuaWdub3JlZH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLl9vbkFjdGlvbik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgX3VwZGF0ZUJsYWNrbGlzdERldmljZXNGbGFnID0gKGNoZWNrZWQpID0+IHtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldEdsb2JhbEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzKGNoZWNrZWQpO1xuICAgIH07XG5cbiAgICBfdXBkYXRlQW5hbHl0aWNzID0gKGNoZWNrZWQpID0+IHtcbiAgICAgICAgY2hlY2tlZCA/IEFuYWx5dGljcy5lbmFibGUoKSA6IEFuYWx5dGljcy5kaXNhYmxlKCk7XG4gICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UuZW5hYmxlKC8qIGFub255bW91cyA9ICovICFjaGVja2VkKTtcbiAgICB9O1xuXG4gICAgX29uRXhwb3J0RTJlS2V5c0NsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYygnRXhwb3J0IEUyRSBLZXlzJywgJycsXG4gICAgICAgICAgICBpbXBvcnQoJy4uLy4uLy4uLy4uLy4uL2FzeW5jLWNvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9FeHBvcnRFMmVLZXlzRGlhbG9nJyksXG4gICAgICAgICAgICB7bWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnRQZWcuZ2V0KCl9LFxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBfb25JbXBvcnRFMmVLZXlzQ2xpY2tlZCA9ICgpID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jKCdJbXBvcnQgRTJFIEtleXMnLCAnJyxcbiAgICAgICAgICAgIGltcG9ydCgnLi4vLi4vLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0ltcG9ydEUyZUtleXNEaWFsb2cnKSxcbiAgICAgICAgICAgIHttYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudFBlZy5nZXQoKX0sXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIF9vbkdvVG9Vc2VyUHJvZmlsZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld191c2VyX2luZm8nLFxuICAgICAgICAgICAgdXNlcklkOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb3BzLmNsb3NlU2V0dGluZ3NGbigpO1xuICAgIH1cblxuICAgIF9vblVzZXJVbmlnbm9yZWQgPSBhc3luYyAodXNlcklkKSA9PiB7XG4gICAgICAgIGNvbnN0IHtpZ25vcmVkVXNlcklkcywgd2FpdGluZ1VuaWdub3JlZH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBjb25zdCBjdXJyZW50bHlJZ25vcmVkVXNlcklkcyA9IGlnbm9yZWRVc2VySWRzLmZpbHRlcihlID0+ICF3YWl0aW5nVW5pZ25vcmVkLmluY2x1ZGVzKGUpKTtcblxuICAgICAgICBjb25zdCBpbmRleCA9IGN1cnJlbnRseUlnbm9yZWRVc2VySWRzLmluZGV4T2YodXNlcklkKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgY3VycmVudGx5SWdub3JlZFVzZXJJZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoKHt3YWl0aW5nVW5pZ25vcmVkfSkgPT4gKHt3YWl0aW5nVW5pZ25vcmVkOiBbLi4ud2FpdGluZ1VuaWdub3JlZCwgdXNlcklkXX0pKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRJZ25vcmVkVXNlcnMoY3VycmVudGx5SWdub3JlZFVzZXJJZHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9nZXRJbnZpdGVkUm9vbXMgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbXMoKS5maWx0ZXIoKHIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByLmhhc01lbWJlcnNoaXBTdGF0ZShNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCksIFwiaW52aXRlXCIpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX21hbmFnZUludml0ZXMgPSBhc3luYyAoYWNjZXB0KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbWFuYWdpbmdJbnZpdGVzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDb21waWxlIGFycmF5IG9mIGludml0YXRpb24gcm9vbSBpZHNcbiAgICAgICAgY29uc3QgaW52aXRlZFJvb21JZHMgPSB0aGlzLl9nZXRJbnZpdGVkUm9vbXMoKS5tYXAoKHJvb20pID0+IHtcbiAgICAgICAgICAgIHJldHVybiByb29tLnJvb21JZDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRXhlY3V0ZSBhbGwgYWNjZXB0YW5jZXMvcmVqZWN0aW9ucyBzZXF1ZW50aWFsbHlcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gYWNjZXB0ID8gY2xpLmpvaW5Sb29tLmJpbmQoY2xpKSA6IGNsaS5sZWF2ZS5iaW5kKGNsaSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW52aXRlZFJvb21JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IGludml0ZWRSb29tSWRzW2ldO1xuXG4gICAgICAgICAgICAvLyBBY2NlcHQvcmVqZWN0IGludml0ZVxuICAgICAgICAgICAgYXdhaXQgYWN0aW9uKHJvb21JZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gTm8gZXJyb3IsIHVwZGF0ZSBpbnZpdGVkIHJvb21zIGJ1dHRvblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2ludml0ZWRSb29tQW10OiBzZWxmLnN0YXRlLmludml0ZWRSb29tQW10IC0gMX0pO1xuICAgICAgICAgICAgfSwgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBBY3Rpb24gZmFpbHVyZVxuICAgICAgICAgICAgICAgIGlmIChlLmVycmNvZGUgPT09IFwiTV9MSU1JVF9FWENFRURFRFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBhIGRlbGF5IGJldHdlZW4gZWFjaCBpbnZpdGUgY2hhbmdlIGluIG9yZGVyIHRvIGF2b2lkIHJhdGVcbiAgICAgICAgICAgICAgICAgICAgLy8gbGltaXRpbmcgYnkgdGhlIHNlcnZlci5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoZS5yZXRyeV9hZnRlcl9tcyB8fCAyNTAwKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBSZWRvIGxhc3QgYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBQcmludCBvdXQgZXJyb3Igd2l0aCBqb2luaW5nL2xlYXZpbmcgcm9vbVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG1hbmFnaW5nSW52aXRlczogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25BY2NlcHRBbGxJbnZpdGVzQ2xpY2tlZCA9IChldikgPT4ge1xuICAgICAgICB0aGlzLl9tYW5hZ2VJbnZpdGVzKHRydWUpO1xuICAgIH07XG5cbiAgICBfb25SZWplY3RBbGxJbnZpdGVzQ2xpY2tlZCA9IChldikgPT4ge1xuICAgICAgICB0aGlzLl9tYW5hZ2VJbnZpdGVzKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgX3JlbmRlckN1cnJlbnREZXZpY2VJbmZvKCkge1xuICAgICAgICBjb25zdCBTZXR0aW5nc0ZsYWcgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5TZXR0aW5nc0ZsYWcnKTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGRldmljZUlkID0gY2xpZW50LmRldmljZUlkO1xuICAgICAgICBsZXQgaWRlbnRpdHlLZXkgPSBjbGllbnQuZ2V0RGV2aWNlRWQyNTUxOUtleSgpO1xuICAgICAgICBpZiAoIWlkZW50aXR5S2V5KSB7XG4gICAgICAgICAgICBpZGVudGl0eUtleSA9IF90KFwiPG5vdCBzdXBwb3J0ZWQ+XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWRlbnRpdHlLZXkgPSBGb3JtYXR0aW5nVXRpbHMuZm9ybWF0Q3J5cHRvS2V5KGlkZW50aXR5S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbXBvcnRFeHBvcnRCdXR0b25zID0gbnVsbDtcbiAgICAgICAgaWYgKGNsaWVudC5pc0NyeXB0b0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgaW1wb3J0RXhwb3J0QnV0dG9ucyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2VjdXJpdHlVc2VyU2V0dGluZ3NUYWJfaW1wb3J0RXhwb3J0QnV0dG9ucyc+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J3ByaW1hcnknIG9uQ2xpY2s9e3RoaXMuX29uRXhwb3J0RTJlS2V5c0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiRXhwb3J0IEUyRSByb29tIGtleXNcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0ncHJpbWFyeScgb25DbGljaz17dGhpcy5fb25JbXBvcnRFMmVLZXlzQ2xpY2tlZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJJbXBvcnQgRTJFIHJvb20ga2V5c1wiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub1NlbmRVbnZlcmlmaWVkU2V0dGluZztcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuaXNFbmFibGVkKFwiYmxhY2tsaXN0VW52ZXJpZmllZERldmljZXNcIikpIHtcbiAgICAgICAgICAgIG5vU2VuZFVudmVyaWZpZWRTZXR0aW5nID0gPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgIG5hbWU9J2JsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzJ1xuICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl91cGRhdGVCbGFja2xpc3REZXZpY2VzRmxhZ31cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdChcIkNyeXB0b2dyYXBoeVwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQgbXhfU2VjdXJpdHlVc2VyU2V0dGluZ3NUYWJfZGV2aWNlSW5mbyc+XG4gICAgICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD57X3QoXCJTZXNzaW9uIElEOlwiKX08L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+PGNvZGU+e2RldmljZUlkfTwvY29kZT48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD57X3QoXCJTZXNzaW9uIGtleTpcIil9PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPjxjb2RlPjxiPntpZGVudGl0eUtleX08L2I+PC9jb2RlPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIHtpbXBvcnRFeHBvcnRCdXR0b25zfVxuICAgICAgICAgICAgICAgIHtub1NlbmRVbnZlcmlmaWVkU2V0dGluZ31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJJZ25vcmVkVXNlcnMoKSB7XG4gICAgICAgIGNvbnN0IHt3YWl0aW5nVW5pZ25vcmVkLCBpZ25vcmVkVXNlcklkc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGlmICghaWdub3JlZFVzZXJJZHMgfHwgaWdub3JlZFVzZXJJZHMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCB1c2VySWRzID0gaWdub3JlZFVzZXJJZHNcbiAgICAgICAgICAgIC5tYXAoKHUpID0+IDxJZ25vcmVkVXNlclxuICAgICAgICAgICAgIHVzZXJJZD17dX1cbiAgICAgICAgICAgICBvblVuaWdub3JlZD17dGhpcy5fb25Vc2VyVW5pZ25vcmVkfVxuICAgICAgICAgICAgIGtleT17dX1cbiAgICAgICAgICAgICBpblByb2dyZXNzPXt3YWl0aW5nVW5pZ25vcmVkLmluY2x1ZGVzKHUpfVxuICAgICAgICAgICAgIC8+KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24nPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+e190KCdJZ25vcmVkIHVzZXJzJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIHt1c2VySWRzfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX3JlbmRlck1hbmFnZUludml0ZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmludml0ZWRSb29tQW10ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGludml0ZWRSb29tcyA9IHRoaXMuX2dldEludml0ZWRSb29tcygpO1xuICAgICAgICBjb25zdCBJbmxpbmVTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuSW5saW5lU3Bpbm5lcicpO1xuICAgICAgICBjb25zdCBvbkNsaWNrQWNjZXB0ID0gdGhpcy5fb25BY2NlcHRBbGxJbnZpdGVzQ2xpY2tlZC5iaW5kKHRoaXMsIGludml0ZWRSb29tcyk7XG4gICAgICAgIGNvbnN0IG9uQ2xpY2tSZWplY3QgPSB0aGlzLl9vblJlamVjdEFsbEludml0ZXNDbGlja2VkLmJpbmQodGhpcywgaW52aXRlZFJvb21zKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NlY3VyaXR5VXNlclNldHRpbmdzVGFiX2J1bGtPcHRpb25zJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdCgnQnVsayBvcHRpb25zJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e29uQ2xpY2tBY2NlcHR9IGtpbmQ9J3ByaW1hcnknIGRpc2FibGVkPXt0aGlzLnN0YXRlLm1hbmFnaW5nSW52aXRlc30+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkFjY2VwdCBhbGwgJShpbnZpdGVkUm9vbXMpcyBpbnZpdGVzXCIsIHtpbnZpdGVkUm9vbXM6IHRoaXMuc3RhdGUuaW52aXRlZFJvb21BbXR9KX1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25DbGlja1JlamVjdH0ga2luZD0nZGFuZ2VyJyBkaXNhYmxlZD17dGhpcy5zdGF0ZS5tYW5hZ2luZ0ludml0ZXN9PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZWplY3QgYWxsICUoaW52aXRlZFJvb21zKXMgaW52aXRlc1wiLCB7aW52aXRlZFJvb21zOiB0aGlzLnN0YXRlLmludml0ZWRSb29tQW10fSl9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLm1hbmFnaW5nSW52aXRlcyA/IDxJbmxpbmVTcGlubmVyIC8+IDogPGRpdiAvPn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgIGNvbnN0IERldmljZXNQYW5lbCA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLnNldHRpbmdzLkRldmljZXNQYW5lbCcpO1xuICAgICAgICBjb25zdCBTZXR0aW5nc0ZsYWcgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5TZXR0aW5nc0ZsYWcnKTtcbiAgICAgICAgY29uc3QgRXZlbnRJbmRleFBhbmVsID0gc2RrLmdldENvbXBvbmVudCgndmlld3Muc2V0dGluZ3MuRXZlbnRJbmRleFBhbmVsJyk7XG5cbiAgICAgICAgY29uc3Qgc2VjdXJlQmFja3VwID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24nPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJTZWN1cmUgQmFja3VwXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICA8U2VjdXJlQmFja3VwUGFuZWwgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50SW5kZXggPSAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiTWVzc2FnZSBzZWFyY2hcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxFdmVudEluZGV4UGFuZWwgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFhYWDogVGhlcmUncyBubyBzdWNoIHBhbmVsIGluIHRoZSBjdXJyZW50IGNyb3NzLXNpZ25pbmcgZGVzaWducywgYnV0XG4gICAgICAgIC8vIGl0J3MgdXNlZnVsIHRvIGhhdmUgZm9yIHRlc3RpbmcgdGhlIGZlYXR1cmUuIElmIHRoZXJlJ3Mgbm8gaW50ZXJlc3RcbiAgICAgICAgLy8gaW4gaGF2aW5nIGFkdmFuY2VkIGRldGFpbHMgaGVyZSBvbmNlIGFsbCBmbG93cyBhcmUgaW1wbGVtZW50ZWQsIHdlXG4gICAgICAgIC8vIGNhbiByZW1vdmUgdGhpcy5cbiAgICAgICAgY29uc3QgQ3Jvc3NTaWduaW5nUGFuZWwgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5zZXR0aW5ncy5Dcm9zc1NpZ25pbmdQYW5lbCcpO1xuICAgICAgICBjb25zdCBjcm9zc1NpZ25pbmcgPSAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbic+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPntfdChcIkNyb3NzLXNpZ25pbmdcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIDxDcm9zc1NpZ25pbmdQYW5lbCAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IHdhcm5pbmc7XG4gICAgICAgIGlmICghcHJpdmF0ZVNob3VsZEJlRW5jcnlwdGVkKCkpIHtcbiAgICAgICAgICAgIHdhcm5pbmcgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlY3VyaXR5VXNlclNldHRpbmdzVGFiX3dhcm5pbmdcIj5cbiAgICAgICAgICAgICAgICB7IF90KFwiWW91ciBzZXJ2ZXIgYWRtaW4gaGFzIGRpc2FibGVkIGVuZC10by1lbmQgZW5jcnlwdGlvbiBieSBkZWZhdWx0IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJpbiBwcml2YXRlIHJvb21zICYgRGlyZWN0IE1lc3NhZ2VzLlwiKSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJpdmFjeVNlY3Rpb247XG4gICAgICAgIGlmIChBbmFseXRpY3MuY2FuRW5hYmxlKCkgfHwgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS5jYW5FbmFibGUoKSkge1xuICAgICAgICAgICAgcHJpdmFjeVNlY3Rpb24gPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiUHJpdmFjeVwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPntfdChcIkFuYWx5dGljc1wiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiUoYnJhbmQpcyBjb2xsZWN0cyBhbm9ueW1vdXMgYW5hbHl0aWNzIHRvIGFsbG93IHVzIHRvIGltcHJvdmUgdGhlIGFwcGxpY2F0aW9uLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlByaXZhY3kgaXMgaW1wb3J0YW50IHRvIHVzLCBzbyB3ZSBkb24ndCBjb2xsZWN0IGFueSBwZXJzb25hbCBvciBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZGVudGlmaWFibGUgZGF0YSBmb3Igb3VyIGFuYWx5dGljcy5cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9saW5rQnRuXCIgb25DbGljaz17QW5hbHl0aWNzLnNob3dEZXRhaWxzTW9kYWx9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkxlYXJuIG1vcmUgYWJvdXQgaG93IHdlIHVzZSBhbmFseXRpY3MuXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBuYW1lPVwiYW5hbHl0aWNzT3B0SW5cIiBsZXZlbD17U2V0dGluZ0xldmVsLkRFVklDRX0gb25DaGFuZ2U9e3RoaXMuX3VwZGF0ZUFuYWx5dGljc30gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgRTJlQWR2YW5jZWRQYW5lbCA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLnNldHRpbmdzLkUyZUFkdmFuY2VkUGFuZWwnKTtcbiAgICAgICAgbGV0IGFkdmFuY2VkU2VjdGlvbjtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLkFkdmFuY2VkU2V0dGluZ3MpKSB7XG4gICAgICAgICAgICBjb25zdCBpZ25vcmVVc2Vyc1BhbmVsID0gdGhpcy5fcmVuZGVySWdub3JlZFVzZXJzKCk7XG4gICAgICAgICAgICBjb25zdCBpbnZpdGVzUGFuZWwgPSB0aGlzLl9yZW5kZXJNYW5hZ2VJbnZpdGVzKCk7XG4gICAgICAgICAgICBjb25zdCBlMmVQYW5lbCA9IGlzRTJlQWR2YW5jZWRQYW5lbFBvc3NpYmxlKCkgPyA8RTJlQWR2YW5jZWRQYW5lbCAvPiA6IG51bGw7XG4gICAgICAgICAgICAvLyBvbmx5IHNob3cgdGhlIHNlY3Rpb24gaWYgdGhlcmUncyBzb21ldGhpbmcgdG8gc2hvd1xuICAgICAgICAgICAgaWYgKGlnbm9yZVVzZXJzUGFuZWwgfHwgaW52aXRlc1BhbmVsIHx8IGUyZVBhbmVsKSB7XG4gICAgICAgICAgICAgICAgYWR2YW5jZWRTZWN0aW9uID0gPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiQWR2YW5jZWRcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2lnbm9yZVVzZXJzUGFuZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICB7aW52aXRlc1BhbmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAge2UyZVBhbmVsfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8Lz47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYiBteF9TZWN1cml0eVVzZXJTZXR0aW5nc1RhYlwiPlxuICAgICAgICAgICAgICAgIHt3YXJuaW5nfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntfdChcIldoZXJlIHlvdeKAmXJlIGxvZ2dlZCBpblwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJNYW5hZ2UgdGhlIG5hbWVzIG9mIGFuZCBzaWduIG91dCBvZiB5b3VyIHNlc3Npb25zIGJlbG93IG9yIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxhPnZlcmlmeSB0aGVtIGluIHlvdXIgVXNlciBQcm9maWxlPC9hPi5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXt0aGlzLl9vbkdvVG9Vc2VyUHJvZmlsZUNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzdWJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkEgc2Vzc2lvbidzIHB1YmxpYyBuYW1lIGlzIHZpc2libGUgdG8gcGVvcGxlIHlvdSBjb21tdW5pY2F0ZSB3aXRoXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPERldmljZXNQYW5lbCAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJFbmNyeXB0aW9uXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICB7c2VjdXJlQmFja3VwfVxuICAgICAgICAgICAgICAgICAgICB7ZXZlbnRJbmRleH1cbiAgICAgICAgICAgICAgICAgICAge2Nyb3NzU2lnbmluZ31cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckN1cnJlbnREZXZpY2VJbmZvKCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBwcml2YWN5U2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgeyBhZHZhbmNlZFNlY3Rpb24gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../.."));

var _LabelledToggleSwitch = _interopRequireDefault(require("../../../elements/LabelledToggleSwitch"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _QuestionDialog = _interopRequireDefault(require("../../../dialogs/QuestionDialog"));

var _StyledRadioGroup = _interopRequireDefault(require("../../../elements/StyledRadioGroup"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _UIFeature = require("../../../../../settings/UIFeature");

/*
Copyright 2019 New Vector Ltd

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
class SecurityRoomSettingsTab extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_onStateEvent", e => {
      const refreshWhenTypes = ['m.room.join_rules', 'm.room.guest_access', 'm.room.history_visibility', 'm.room.encryption'];
      if (refreshWhenTypes.includes(e.getType())) this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "_onEncryptionChange", e => {
      _Modal.default.createTrackedDialog('Enable encryption', '', _QuestionDialog.default, {
        title: (0, _languageHandler._t)('Enable encryption?'),
        description: (0, _languageHandler._t)("Once enabled, encryption for a room cannot be disabled. Messages sent in an encrypted " + "room cannot be seen by the server, only by the participants of the room. Enabling encryption " + "may prevent many bots and bridges from working correctly. <a>Learn more about encryption.</a>", {}, {
          'a': sub => {
            return /*#__PURE__*/_react.default.createElement("a", {
              rel: "noreferrer noopener",
              target: "_blank",
              href: "https://element.io/help#encryption"
            }, sub);
          }
        }),
        onFinished: confirm => {
          if (!confirm) {
            this.setState({
              encrypted: false
            });
            return;
          }

          const beforeEncrypted = this.state.encrypted;
          this.setState({
            encrypted: true
          });

          _MatrixClientPeg.MatrixClientPeg.get().sendStateEvent(this.props.roomId, "m.room.encryption", {
            algorithm: "m.megolm.v1.aes-sha2"
          }).catch(e => {
            console.error(e);
            this.setState({
              encrypted: beforeEncrypted
            });
          });
        }
      });
    });
    (0, _defineProperty2.default)(this, "_fixGuestAccess", e => {
      e.preventDefault();
      e.stopPropagation();
      const joinRule = "invite";
      const guestAccess = "can_join";
      const beforeJoinRule = this.state.joinRule;
      const beforeGuestAccess = this.state.guestAccess;
      this.setState({
        joinRule,
        guestAccess
      });

      const client = _MatrixClientPeg.MatrixClientPeg.get();

      client.sendStateEvent(this.props.roomId, "m.room.join_rules", {
        join_rule: joinRule
      }, "").catch(e => {
        console.error(e);
        this.setState({
          joinRule: beforeJoinRule
        });
      });
      client.sendStateEvent(this.props.roomId, "m.room.guest_access", {
        guest_access: guestAccess
      }, "").catch(e => {
        console.error(e);
        this.setState({
          guestAccess: beforeGuestAccess
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onRoomAccessRadioToggle", roomAccess => {
      //                         join_rule
      //                      INVITE  |  PUBLIC
      //        ----------------------+----------------
      // guest  CAN_JOIN   | inv_only | pub_with_guest
      // access ----------------------+----------------
      //        FORBIDDEN  | inv_only | pub_no_guest
      //        ----------------------+----------------
      // we always set guests can_join here as it makes no sense to have
      // an invite-only room that guests can't join.  If you explicitly
      // invite them, you clearly want them to join, whether they're a
      // guest or not.  In practice, guest_access should probably have
      // been implemented as part of the join_rules enum.
      let joinRule = "invite";
      let guestAccess = "can_join";

      switch (roomAccess) {
        case "invite_only":
          // no change - use defaults above
          break;

        case "public_no_guests":
          joinRule = "public";
          guestAccess = "forbidden";
          break;

        case "public_with_guests":
          joinRule = "public";
          guestAccess = "can_join";
          break;
      }

      const beforeJoinRule = this.state.joinRule;
      const beforeGuestAccess = this.state.guestAccess;
      this.setState({
        joinRule,
        guestAccess
      });

      const client = _MatrixClientPeg.MatrixClientPeg.get();

      client.sendStateEvent(this.props.roomId, "m.room.join_rules", {
        join_rule: joinRule
      }, "").catch(e => {
        console.error(e);
        this.setState({
          joinRule: beforeJoinRule
        });
      });
      client.sendStateEvent(this.props.roomId, "m.room.guest_access", {
        guest_access: guestAccess
      }, "").catch(e => {
        console.error(e);
        this.setState({
          guestAccess: beforeGuestAccess
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onHistoryRadioToggle", history => {
      const beforeHistory = this.state.history;
      this.setState({
        history: history
      });

      _MatrixClientPeg.MatrixClientPeg.get().sendStateEvent(this.props.roomId, "m.room.history_visibility", {
        history_visibility: history
      }, "").catch(e => {
        console.error(e);
        this.setState({
          history: beforeHistory
        });
      });
    });
    (0, _defineProperty2.default)(this, "_updateBlacklistDevicesFlag", checked => {
      _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId).setBlacklistUnverifiedDevices(checked);
    });
    this.state = {
      joinRule: "invite",
      guestAccess: "can_join",
      history: "shared",
      hasAliases: false,
      encrypted: false
    };
  } // TODO: [REACT-WARNING] Move this to constructor


  async UNSAFE_componentWillMount()
  /*: void*/
  {
    // eslint-disable-line camelcase
    _MatrixClientPeg.MatrixClientPeg.get().on("RoomState.events", this._onStateEvent);

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

    const state = room.currentState;

    const joinRule = this._pullContentPropertyFromEvent(state.getStateEvents("m.room.join_rules", ""), 'join_rule', 'invite');

    const guestAccess = this._pullContentPropertyFromEvent(state.getStateEvents("m.room.guest_access", ""), 'guest_access', 'forbidden');

    const history = this._pullContentPropertyFromEvent(state.getStateEvents("m.room.history_visibility", ""), 'history_visibility', 'shared');

    const encrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(this.props.roomId);

    this.setState({
      joinRule,
      guestAccess,
      history,
      encrypted
    });
    const hasAliases = await this._hasAliases();
    this.setState({
      hasAliases
    });
  }

  _pullContentPropertyFromEvent(event, key, defaultValue) {
    if (!event || !event.getContent()) return defaultValue;
    return event.getContent()[key] || defaultValue;
  }

  componentWillUnmount()
  /*: void*/
  {
    _MatrixClientPeg.MatrixClientPeg.get().removeListener("RoomState.events", this._onStateEvent);
  }

  async _hasAliases() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (await cli.doesServerSupportUnstableFeature("org.matrix.msc2432")) {
      const response = await cli.unstableGetLocalAliases(this.props.roomId);
      const localAliases = response.aliases;
      return Array.isArray(localAliases) && localAliases.length !== 0;
    } else {
      const room = cli.getRoom(this.props.roomId);
      const aliasEvents = room.currentState.getStateEvents("m.room.aliases") || [];
      const hasAliases = !!aliasEvents.find(ev => (ev.getContent().aliases || []).length > 0);
      return hasAliases;
    }
  }

  _renderRoomAccess() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(this.props.roomId);
    const joinRule = this.state.joinRule;
    const guestAccess = this.state.guestAccess;
    const canChangeAccess = room.currentState.mayClientSendStateEvent("m.room.join_rules", client) && room.currentState.mayClientSendStateEvent("m.room.guest_access", client);
    let guestWarning = null;

    if (joinRule !== 'public' && guestAccess === 'forbidden') {
      guestWarning = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SecurityRoomSettingsTab_warning"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../../../../res/img/warning.svg"),
        width: 15,
        height: 15
      }), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Guests cannot join this room even if explicitly invited."), "\xA0", /*#__PURE__*/_react.default.createElement("a", {
        href: "",
        onClick: this._fixGuestAccess
      }, (0, _languageHandler._t)("Click here to fix"))));
    }

    let aliasWarning = null;

    if (joinRule === 'public' && !this.state.hasAliases) {
      aliasWarning = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SecurityRoomSettingsTab_warning"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../../../../res/img/warning.svg"),
        width: 15,
        height: 15
      }), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("To link to this room, please add an address.")));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, guestWarning, aliasWarning, /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
      name: "roomVis",
      value: joinRule,
      onChange: this._onRoomAccessRadioToggle,
      definitions: [{
        value: "invite_only",
        disabled: !canChangeAccess,
        label: (0, _languageHandler._t)('Only people who have been invited'),
        checked: joinRule !== "public"
      }, {
        value: "public_no_guests",
        disabled: !canChangeAccess,
        label: (0, _languageHandler._t)('Anyone who knows the room\'s link, apart from guests'),
        checked: joinRule === "public" && guestAccess !== "can_join"
      }, {
        value: "public_with_guests",
        disabled: !canChangeAccess,
        label: (0, _languageHandler._t)("Anyone who knows the room's link, including guests"),
        checked: joinRule === "public" && guestAccess === "can_join"
      }]
    }));
  }

  _renderHistory() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const history = this.state.history;
    const state = client.getRoom(this.props.roomId).currentState;
    const canChangeHistory = state.mayClientSendStateEvent('m.room.history_visibility', client);
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('Changes to who can read history will only apply to future messages in this room. ' + 'The visibility of existing history will be unchanged.')), /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
      name: "historyVis",
      value: history,
      onChange: this._onHistoryRadioToggle,
      definitions: [{
        value: "world_readable",
        disabled: !canChangeHistory,
        label: (0, _languageHandler._t)("Anyone")
      }, {
        value: "shared",
        disabled: !canChangeHistory,
        label: (0, _languageHandler._t)('Members only (since the point in time of selecting this option)')
      }, {
        value: "invited",
        disabled: !canChangeHistory,
        label: (0, _languageHandler._t)('Members only (since they were invited)')
      }, {
        value: "joined",
        disabled: !canChangeHistory,
        label: (0, _languageHandler._t)('Members only (since they joined)')
      }]
    }));
  }

  render() {
    const SettingsFlag = sdk.getComponent("elements.SettingsFlag");

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(this.props.roomId);
    const isEncrypted = this.state.encrypted;
    const hasEncryptionPermission = room.currentState.mayClientSendStateEvent("m.room.encryption", client);
    const canEnableEncryption = !isEncrypted && hasEncryptionPermission;
    let encryptionSettings = null;

    if (isEncrypted && _SettingsStore.default.isEnabled("blacklistUnverifiedDevices")) {
      encryptionSettings = /*#__PURE__*/_react.default.createElement(SettingsFlag, {
        name: "blacklistUnverifiedDevices",
        level: _SettingLevel.SettingLevel.ROOM_DEVICE,
        onChange: this._updateBlacklistDevicesFlag,
        roomId: this.props.roomId
      });
    }

    let historySection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Who can read history?")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, this._renderHistory()));

    if (!_SettingsStore.default.getValue(_UIFeature.UIFeature.RoomHistorySettings)) {
      historySection = null;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_SecurityRoomSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Security & Privacy")), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Encryption")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SecurityRoomSettingsTab_encryptionSection"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Once enabled, encryption cannot be disabled."))), /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: isEncrypted,
      onChange: this._onEncryptionChange,
      label: (0, _languageHandler._t)("Encrypted"),
      disabled: !canEnableEncryption
    })), encryptionSettings), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Who can access this room?")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, this._renderRoomAccess()), historySection);
  }

}

exports.default = SecurityRoomSettingsTab;
(0, _defineProperty2.default)(SecurityRoomSettingsTab, "propTypes", {
  roomId: _propTypes.default.string.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9TZWN1cml0eVJvb21TZXR0aW5nc1RhYi5qcyJdLCJuYW1lcyI6WyJTZWN1cml0eVJvb21TZXR0aW5nc1RhYiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJlIiwicmVmcmVzaFdoZW5UeXBlcyIsImluY2x1ZGVzIiwiZ2V0VHlwZSIsImZvcmNlVXBkYXRlIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiUXVlc3Rpb25EaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwic3ViIiwib25GaW5pc2hlZCIsImNvbmZpcm0iLCJzZXRTdGF0ZSIsImVuY3J5cHRlZCIsImJlZm9yZUVuY3J5cHRlZCIsInN0YXRlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic2VuZFN0YXRlRXZlbnQiLCJwcm9wcyIsInJvb21JZCIsImFsZ29yaXRobSIsImNhdGNoIiwiY29uc29sZSIsImVycm9yIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJqb2luUnVsZSIsImd1ZXN0QWNjZXNzIiwiYmVmb3JlSm9pblJ1bGUiLCJiZWZvcmVHdWVzdEFjY2VzcyIsImNsaWVudCIsImpvaW5fcnVsZSIsImd1ZXN0X2FjY2VzcyIsInJvb21BY2Nlc3MiLCJoaXN0b3J5IiwiYmVmb3JlSGlzdG9yeSIsImhpc3RvcnlfdmlzaWJpbGl0eSIsImNoZWNrZWQiLCJnZXRSb29tIiwic2V0QmxhY2tsaXN0VW52ZXJpZmllZERldmljZXMiLCJoYXNBbGlhc2VzIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsIm9uIiwiX29uU3RhdGVFdmVudCIsInJvb20iLCJjdXJyZW50U3RhdGUiLCJfcHVsbENvbnRlbnRQcm9wZXJ0eUZyb21FdmVudCIsImdldFN0YXRlRXZlbnRzIiwiaXNSb29tRW5jcnlwdGVkIiwiX2hhc0FsaWFzZXMiLCJldmVudCIsImtleSIsImRlZmF1bHRWYWx1ZSIsImdldENvbnRlbnQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwiY2xpIiwiZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUiLCJyZXNwb25zZSIsInVuc3RhYmxlR2V0TG9jYWxBbGlhc2VzIiwibG9jYWxBbGlhc2VzIiwiYWxpYXNlcyIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsImFsaWFzRXZlbnRzIiwiZmluZCIsImV2IiwiX3JlbmRlclJvb21BY2Nlc3MiLCJjYW5DaGFuZ2VBY2Nlc3MiLCJtYXlDbGllbnRTZW5kU3RhdGVFdmVudCIsImd1ZXN0V2FybmluZyIsInJlcXVpcmUiLCJfZml4R3Vlc3RBY2Nlc3MiLCJhbGlhc1dhcm5pbmciLCJfb25Sb29tQWNjZXNzUmFkaW9Ub2dnbGUiLCJ2YWx1ZSIsImRpc2FibGVkIiwibGFiZWwiLCJfcmVuZGVySGlzdG9yeSIsImNhbkNoYW5nZUhpc3RvcnkiLCJfb25IaXN0b3J5UmFkaW9Ub2dnbGUiLCJyZW5kZXIiLCJTZXR0aW5nc0ZsYWciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJpc0VuY3J5cHRlZCIsImhhc0VuY3J5cHRpb25QZXJtaXNzaW9uIiwiY2FuRW5hYmxlRW5jcnlwdGlvbiIsImVuY3J5cHRpb25TZXR0aW5ncyIsIlNldHRpbmdzU3RvcmUiLCJpc0VuYWJsZWQiLCJTZXR0aW5nTGV2ZWwiLCJST09NX0RFVklDRSIsIl91cGRhdGVCbGFja2xpc3REZXZpY2VzRmxhZyIsImhpc3RvcnlTZWN0aW9uIiwiZ2V0VmFsdWUiLCJVSUZlYXR1cmUiLCJSb29tSGlzdG9yeVNldHRpbmdzIiwiX29uRW5jcnlwdGlvbkNoYW5nZSIsIlByb3BUeXBlcyIsInN0cmluZyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FB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dGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uLy4uLy4uXCI7XG5pbXBvcnQgTGFiZWxsZWRUb2dnbGVTd2l0Y2ggZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0xhYmVsbGVkVG9nZ2xlU3dpdGNoXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4uLy4uLy4uL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBTdHlsZWRSYWRpb0dyb3VwIGZyb20gJy4uLy4uLy4uL2VsZW1lbnRzL1N0eWxlZFJhZGlvR3JvdXAnO1xuaW1wb3J0IHtTZXR0aW5nTGV2ZWx9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge1VJRmVhdHVyZX0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWN1cml0eVJvb21TZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgcm9vbUlkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBqb2luUnVsZTogXCJpbnZpdGVcIixcbiAgICAgICAgICAgIGd1ZXN0QWNjZXNzOiBcImNhbl9qb2luXCIsXG4gICAgICAgICAgICBoaXN0b3J5OiBcInNoYXJlZFwiLFxuICAgICAgICAgICAgaGFzQWxpYXNlczogZmFsc2UsXG4gICAgICAgICAgICBlbmNyeXB0ZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBNb3ZlIHRoaXMgdG8gY29uc3RydWN0b3JcbiAgICBhc3luYyBVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCk6IHZvaWQgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMuX29uU3RhdGVFdmVudCk7XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSByb29tLmN1cnJlbnRTdGF0ZTtcblxuICAgICAgICBjb25zdCBqb2luUnVsZSA9IHRoaXMuX3B1bGxDb250ZW50UHJvcGVydHlGcm9tRXZlbnQoXG4gICAgICAgICAgICBzdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5qb2luX3J1bGVzXCIsIFwiXCIpLFxuICAgICAgICAgICAgJ2pvaW5fcnVsZScsXG4gICAgICAgICAgICAnaW52aXRlJyxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgZ3Vlc3RBY2Nlc3MgPSB0aGlzLl9wdWxsQ29udGVudFByb3BlcnR5RnJvbUV2ZW50KFxuICAgICAgICAgICAgc3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20uZ3Vlc3RfYWNjZXNzXCIsIFwiXCIpLFxuICAgICAgICAgICAgJ2d1ZXN0X2FjY2VzcycsXG4gICAgICAgICAgICAnZm9yYmlkZGVuJyxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaGlzdG9yeSA9IHRoaXMuX3B1bGxDb250ZW50UHJvcGVydHlGcm9tRXZlbnQoXG4gICAgICAgICAgICBzdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5oaXN0b3J5X3Zpc2liaWxpdHlcIiwgXCJcIiksXG4gICAgICAgICAgICAnaGlzdG9yeV92aXNpYmlsaXR5JyxcbiAgICAgICAgICAgICdzaGFyZWQnLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBlbmNyeXB0ZWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNSb29tRW5jcnlwdGVkKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7am9pblJ1bGUsIGd1ZXN0QWNjZXNzLCBoaXN0b3J5LCBlbmNyeXB0ZWR9KTtcbiAgICAgICAgY29uc3QgaGFzQWxpYXNlcyA9IGF3YWl0IHRoaXMuX2hhc0FsaWFzZXMoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGFzQWxpYXNlc30pO1xuICAgIH1cblxuICAgIF9wdWxsQ29udGVudFByb3BlcnR5RnJvbUV2ZW50KGV2ZW50LCBrZXksIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICBpZiAoIWV2ZW50IHx8ICFldmVudC5nZXRDb250ZW50KCkpIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgIHJldHVybiBldmVudC5nZXRDb250ZW50KClba2V5XSB8fCBkZWZhdWx0VmFsdWU7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5fb25TdGF0ZUV2ZW50KTtcbiAgICB9XG5cbiAgICBfb25TdGF0ZUV2ZW50ID0gKGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVmcmVzaFdoZW5UeXBlcyA9IFtcbiAgICAgICAgICAgICdtLnJvb20uam9pbl9ydWxlcycsXG4gICAgICAgICAgICAnbS5yb29tLmd1ZXN0X2FjY2VzcycsXG4gICAgICAgICAgICAnbS5yb29tLmhpc3RvcnlfdmlzaWJpbGl0eScsXG4gICAgICAgICAgICAnbS5yb29tLmVuY3J5cHRpb24nLFxuICAgICAgICBdO1xuICAgICAgICBpZiAocmVmcmVzaFdoZW5UeXBlcy5pbmNsdWRlcyhlLmdldFR5cGUoKSkpIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgX29uRW5jcnlwdGlvbkNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0VuYWJsZSBlbmNyeXB0aW9uJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoJ0VuYWJsZSBlbmNyeXB0aW9uPycpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgIFwiT25jZSBlbmFibGVkLCBlbmNyeXB0aW9uIGZvciBhIHJvb20gY2Fubm90IGJlIGRpc2FibGVkLiBNZXNzYWdlcyBzZW50IGluIGFuIGVuY3J5cHRlZCBcIiArXG4gICAgICAgICAgICAgICAgXCJyb29tIGNhbm5vdCBiZSBzZWVuIGJ5IHRoZSBzZXJ2ZXIsIG9ubHkgYnkgdGhlIHBhcnRpY2lwYW50cyBvZiB0aGUgcm9vbS4gRW5hYmxpbmcgZW5jcnlwdGlvbiBcIiArXG4gICAgICAgICAgICAgICAgXCJtYXkgcHJldmVudCBtYW55IGJvdHMgYW5kIGJyaWRnZXMgZnJvbSB3b3JraW5nIGNvcnJlY3RseS4gPGE+TGVhcm4gbW9yZSBhYm91dCBlbmNyeXB0aW9uLjwvYT5cIixcbiAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxhIHJlbD0nbm9yZWZlcnJlciBub29wZW5lcicgdGFyZ2V0PSdfYmxhbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj0naHR0cHM6Ly9lbGVtZW50LmlvL2hlbHAjZW5jcnlwdGlvbic+e3N1Yn08L2E+O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKGNvbmZpcm0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZW5jcnlwdGVkOiBmYWxzZX0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgYmVmb3JlRW5jcnlwdGVkID0gdGhpcy5zdGF0ZS5lbmNyeXB0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZW5jcnlwdGVkOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRTdGF0ZUV2ZW50KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnJvb21JZCwgXCJtLnJvb20uZW5jcnlwdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICB7IGFsZ29yaXRobTogXCJtLm1lZ29sbS52MS5hZXMtc2hhMlwiIH0sXG4gICAgICAgICAgICAgICAgKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlbmNyeXB0ZWQ6IGJlZm9yZUVuY3J5cHRlZH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9maXhHdWVzdEFjY2VzcyA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBjb25zdCBqb2luUnVsZSA9IFwiaW52aXRlXCI7XG4gICAgICAgIGNvbnN0IGd1ZXN0QWNjZXNzID0gXCJjYW5fam9pblwiO1xuXG4gICAgICAgIGNvbnN0IGJlZm9yZUpvaW5SdWxlID0gdGhpcy5zdGF0ZS5qb2luUnVsZTtcbiAgICAgICAgY29uc3QgYmVmb3JlR3Vlc3RBY2Nlc3MgPSB0aGlzLnN0YXRlLmd1ZXN0QWNjZXNzO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtqb2luUnVsZSwgZ3Vlc3RBY2Nlc3N9KTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNsaWVudC5zZW5kU3RhdGVFdmVudCh0aGlzLnByb3BzLnJvb21JZCwgXCJtLnJvb20uam9pbl9ydWxlc1wiLCB7am9pbl9ydWxlOiBqb2luUnVsZX0sIFwiXCIpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7am9pblJ1bGU6IGJlZm9yZUpvaW5SdWxlfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjbGllbnQuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLmd1ZXN0X2FjY2Vzc1wiLCB7Z3Vlc3RfYWNjZXNzOiBndWVzdEFjY2Vzc30sIFwiXCIpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z3Vlc3RBY2Nlc3M6IGJlZm9yZUd1ZXN0QWNjZXNzfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25Sb29tQWNjZXNzUmFkaW9Ub2dnbGUgPSAocm9vbUFjY2VzcykgPT4ge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBqb2luX3J1bGVcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgSU5WSVRFICB8ICBQVUJMSUNcbiAgICAgICAgLy8gICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBndWVzdCAgQ0FOX0pPSU4gICB8IGludl9vbmx5IHwgcHViX3dpdGhfZ3Vlc3RcbiAgICAgICAgLy8gYWNjZXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyAgICAgICAgRk9SQklEREVOICB8IGludl9vbmx5IHwgcHViX25vX2d1ZXN0XG4gICAgICAgIC8vICAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAvLyB3ZSBhbHdheXMgc2V0IGd1ZXN0cyBjYW5fam9pbiBoZXJlIGFzIGl0IG1ha2VzIG5vIHNlbnNlIHRvIGhhdmVcbiAgICAgICAgLy8gYW4gaW52aXRlLW9ubHkgcm9vbSB0aGF0IGd1ZXN0cyBjYW4ndCBqb2luLiAgSWYgeW91IGV4cGxpY2l0bHlcbiAgICAgICAgLy8gaW52aXRlIHRoZW0sIHlvdSBjbGVhcmx5IHdhbnQgdGhlbSB0byBqb2luLCB3aGV0aGVyIHRoZXkncmUgYVxuICAgICAgICAvLyBndWVzdCBvciBub3QuICBJbiBwcmFjdGljZSwgZ3Vlc3RfYWNjZXNzIHNob3VsZCBwcm9iYWJseSBoYXZlXG4gICAgICAgIC8vIGJlZW4gaW1wbGVtZW50ZWQgYXMgcGFydCBvZiB0aGUgam9pbl9ydWxlcyBlbnVtLlxuICAgICAgICBsZXQgam9pblJ1bGUgPSBcImludml0ZVwiO1xuICAgICAgICBsZXQgZ3Vlc3RBY2Nlc3MgPSBcImNhbl9qb2luXCI7XG5cbiAgICAgICAgc3dpdGNoIChyb29tQWNjZXNzKSB7XG4gICAgICAgICAgICBjYXNlIFwiaW52aXRlX29ubHlcIjpcbiAgICAgICAgICAgICAgICAvLyBubyBjaGFuZ2UgLSB1c2UgZGVmYXVsdHMgYWJvdmVcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJwdWJsaWNfbm9fZ3Vlc3RzXCI6XG4gICAgICAgICAgICAgICAgam9pblJ1bGUgPSBcInB1YmxpY1wiO1xuICAgICAgICAgICAgICAgIGd1ZXN0QWNjZXNzID0gXCJmb3JiaWRkZW5cIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJwdWJsaWNfd2l0aF9ndWVzdHNcIjpcbiAgICAgICAgICAgICAgICBqb2luUnVsZSA9IFwicHVibGljXCI7XG4gICAgICAgICAgICAgICAgZ3Vlc3RBY2Nlc3MgPSBcImNhbl9qb2luXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBiZWZvcmVKb2luUnVsZSA9IHRoaXMuc3RhdGUuam9pblJ1bGU7XG4gICAgICAgIGNvbnN0IGJlZm9yZUd1ZXN0QWNjZXNzID0gdGhpcy5zdGF0ZS5ndWVzdEFjY2VzcztcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7am9pblJ1bGUsIGd1ZXN0QWNjZXNzfSk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjbGllbnQuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLmpvaW5fcnVsZXNcIiwge2pvaW5fcnVsZTogam9pblJ1bGV9LCBcIlwiKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2pvaW5SdWxlOiBiZWZvcmVKb2luUnVsZX0pO1xuICAgICAgICB9KTtcbiAgICAgICAgY2xpZW50LnNlbmRTdGF0ZUV2ZW50KHRoaXMucHJvcHMucm9vbUlkLCBcIm0ucm9vbS5ndWVzdF9hY2Nlc3NcIiwge2d1ZXN0X2FjY2VzczogZ3Vlc3RBY2Nlc3N9LCBcIlwiKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2d1ZXN0QWNjZXNzOiBiZWZvcmVHdWVzdEFjY2Vzc30pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uSGlzdG9yeVJhZGlvVG9nZ2xlID0gKGhpc3RvcnkpID0+IHtcbiAgICAgICAgY29uc3QgYmVmb3JlSGlzdG9yeSA9IHRoaXMuc3RhdGUuaGlzdG9yeTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGlzdG9yeTogaGlzdG9yeX0pO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLmhpc3RvcnlfdmlzaWJpbGl0eVwiLCB7XG4gICAgICAgICAgICBoaXN0b3J5X3Zpc2liaWxpdHk6IGhpc3RvcnksXG4gICAgICAgIH0sIFwiXCIpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGlzdG9yeTogYmVmb3JlSGlzdG9yeX0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX3VwZGF0ZUJsYWNrbGlzdERldmljZXNGbGFnID0gKGNoZWNrZWQpID0+IHtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpLnNldEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzKGNoZWNrZWQpO1xuICAgIH07XG5cbiAgICBhc3luYyBfaGFzQWxpYXNlcygpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoYXdhaXQgY2xpLmRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlKFwib3JnLm1hdHJpeC5tc2MyNDMyXCIpKSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNsaS51bnN0YWJsZUdldExvY2FsQWxpYXNlcyh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbEFsaWFzZXMgPSByZXNwb25zZS5hbGlhc2VzO1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkobG9jYWxBbGlhc2VzKSAmJiBsb2NhbEFsaWFzZXMubGVuZ3RoICE9PSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGFsaWFzRXZlbnRzID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20uYWxpYXNlc1wiKSB8fCBbXTtcbiAgICAgICAgICAgIGNvbnN0IGhhc0FsaWFzZXMgPSAhIWFsaWFzRXZlbnRzLmZpbmQoKGV2KSA9PiAoZXYuZ2V0Q29udGVudCgpLmFsaWFzZXMgfHwgW10pLmxlbmd0aCA+IDApO1xuICAgICAgICAgICAgcmV0dXJuIGhhc0FsaWFzZXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcmVuZGVyUm9vbUFjY2VzcygpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICBjb25zdCBqb2luUnVsZSA9IHRoaXMuc3RhdGUuam9pblJ1bGU7XG4gICAgICAgIGNvbnN0IGd1ZXN0QWNjZXNzID0gdGhpcy5zdGF0ZS5ndWVzdEFjY2VzcztcblxuICAgICAgICBjb25zdCBjYW5DaGFuZ2VBY2Nlc3MgPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudChcIm0ucm9vbS5qb2luX3J1bGVzXCIsIGNsaWVudClcbiAgICAgICAgICAgICYmIHJvb20uY3VycmVudFN0YXRlLm1heUNsaWVudFNlbmRTdGF0ZUV2ZW50KFwibS5yb29tLmd1ZXN0X2FjY2Vzc1wiLCBjbGllbnQpO1xuXG4gICAgICAgIGxldCBndWVzdFdhcm5pbmcgPSBudWxsO1xuICAgICAgICBpZiAoam9pblJ1bGUgIT09ICdwdWJsaWMnICYmIGd1ZXN0QWNjZXNzID09PSAnZm9yYmlkZGVuJykge1xuICAgICAgICAgICAgZ3Vlc3RXYXJuaW5nID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZWN1cml0eVJvb21TZXR0aW5nc1RhYl93YXJuaW5nJz5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi8uLi8uLi9yZXMvaW1nL3dhcm5pbmcuc3ZnXCIpfSB3aWR0aD17MTV9IGhlaWdodD17MTV9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiR3Vlc3RzIGNhbm5vdCBqb2luIHRoaXMgcm9vbSBldmVuIGlmIGV4cGxpY2l0bHkgaW52aXRlZC5cIil9Jm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiXCIgb25DbGljaz17dGhpcy5fZml4R3Vlc3RBY2Nlc3N9PntfdChcIkNsaWNrIGhlcmUgdG8gZml4XCIpfTwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhbGlhc1dhcm5pbmcgPSBudWxsO1xuICAgICAgICBpZiAoam9pblJ1bGUgPT09ICdwdWJsaWMnICYmICF0aGlzLnN0YXRlLmhhc0FsaWFzZXMpIHtcbiAgICAgICAgICAgIGFsaWFzV2FybmluZyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2VjdXJpdHlSb29tU2V0dGluZ3NUYWJfd2FybmluZyc+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vLi4vLi4vcmVzL2ltZy93YXJuaW5nLnN2Z1wiKX0gd2lkdGg9ezE1fSBoZWlnaHQ9ezE1fSAvPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlRvIGxpbmsgdG8gdGhpcyByb29tLCBwbGVhc2UgYWRkIGFuIGFkZHJlc3MuXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAge2d1ZXN0V2FybmluZ31cbiAgICAgICAgICAgICAgICB7YWxpYXNXYXJuaW5nfVxuICAgICAgICAgICAgICAgIDxTdHlsZWRSYWRpb0dyb3VwXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJyb29tVmlzXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2pvaW5SdWxlfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25Sb29tQWNjZXNzUmFkaW9Ub2dnbGV9XG4gICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb25zPXtbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiaW52aXRlX29ubHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogIWNhbkNoYW5nZUFjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogX3QoJ09ubHkgcGVvcGxlIHdobyBoYXZlIGJlZW4gaW52aXRlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IGpvaW5SdWxlICE9PSBcInB1YmxpY1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJwdWJsaWNfbm9fZ3Vlc3RzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICFjYW5DaGFuZ2VBY2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IF90KCdBbnlvbmUgd2hvIGtub3dzIHRoZSByb29tXFwncyBsaW5rLCBhcGFydCBmcm9tIGd1ZXN0cycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IGpvaW5SdWxlID09PSBcInB1YmxpY1wiICYmIGd1ZXN0QWNjZXNzICE9PSBcImNhbl9qb2luXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcInB1YmxpY193aXRoX2d1ZXN0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAhY2FuQ2hhbmdlQWNjZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBfdChcIkFueW9uZSB3aG8ga25vd3MgdGhlIHJvb20ncyBsaW5rLCBpbmNsdWRpbmcgZ3Vlc3RzXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IGpvaW5SdWxlID09PSBcInB1YmxpY1wiICYmIGd1ZXN0QWNjZXNzID09PSBcImNhbl9qb2luXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfcmVuZGVySGlzdG9yeSgpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBoaXN0b3J5ID0gdGhpcy5zdGF0ZS5oaXN0b3J5O1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGNsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKS5jdXJyZW50U3RhdGU7XG4gICAgICAgIGNvbnN0IGNhbkNoYW5nZUhpc3RvcnkgPSBzdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudCgnbS5yb29tLmhpc3RvcnlfdmlzaWJpbGl0eScsIGNsaWVudCk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAge190KCdDaGFuZ2VzIHRvIHdobyBjYW4gcmVhZCBoaXN0b3J5IHdpbGwgb25seSBhcHBseSB0byBmdXR1cmUgbWVzc2FnZXMgaW4gdGhpcyByb29tLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdUaGUgdmlzaWJpbGl0eSBvZiBleGlzdGluZyBoaXN0b3J5IHdpbGwgYmUgdW5jaGFuZ2VkLicpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxTdHlsZWRSYWRpb0dyb3VwXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJoaXN0b3J5VmlzXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2hpc3Rvcnl9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkhpc3RvcnlSYWRpb1RvZ2dsZX1cbiAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbnM9e1tcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJ3b3JsZF9yZWFkYWJsZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAhY2FuQ2hhbmdlSGlzdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogX3QoXCJBbnlvbmVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcInNoYXJlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAhY2FuQ2hhbmdlSGlzdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogX3QoJ01lbWJlcnMgb25seSAoc2luY2UgdGhlIHBvaW50IGluIHRpbWUgb2Ygc2VsZWN0aW5nIHRoaXMgb3B0aW9uKScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJpbnZpdGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICFjYW5DaGFuZ2VIaXN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBfdCgnTWVtYmVycyBvbmx5IChzaW5jZSB0aGV5IHdlcmUgaW52aXRlZCknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiam9pbmVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICFjYW5DaGFuZ2VIaXN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBfdCgnTWVtYmVycyBvbmx5IChzaW5jZSB0aGV5IGpvaW5lZCknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgU2V0dGluZ3NGbGFnID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNldHRpbmdzRmxhZ1wiKTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gdGhpcy5zdGF0ZS5lbmNyeXB0ZWQ7XG4gICAgICAgIGNvbnN0IGhhc0VuY3J5cHRpb25QZXJtaXNzaW9uID0gcm9vbS5jdXJyZW50U3RhdGUubWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQoXCJtLnJvb20uZW5jcnlwdGlvblwiLCBjbGllbnQpO1xuICAgICAgICBjb25zdCBjYW5FbmFibGVFbmNyeXB0aW9uID0gIWlzRW5jcnlwdGVkICYmIGhhc0VuY3J5cHRpb25QZXJtaXNzaW9uO1xuXG4gICAgICAgIGxldCBlbmNyeXB0aW9uU2V0dGluZ3MgPSBudWxsO1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWQgJiYgU2V0dGluZ3NTdG9yZS5pc0VuYWJsZWQoXCJibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlc1wiKSkge1xuICAgICAgICAgICAgZW5jcnlwdGlvblNldHRpbmdzID0gPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgIG5hbWU9XCJibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlc1wiXG4gICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ST09NX0RFVklDRX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fdXBkYXRlQmxhY2tsaXN0RGV2aWNlc0ZsYWd9XG4gICAgICAgICAgICAgICAgcm9vbUlkPXt0aGlzLnByb3BzLnJvb21JZH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhpc3RvcnlTZWN0aW9uID0gKDw+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdChcIldobyBjYW4gcmVhZCBoaXN0b3J5P1wiKX08L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckhpc3RvcnkoKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8Lz4pO1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlJvb21IaXN0b3J5U2V0dGluZ3MpKSB7XG4gICAgICAgICAgICBoaXN0b3J5U2VjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYiBteF9TZWN1cml0eVJvb21TZXR0aW5nc1RhYlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntfdChcIlNlY3VyaXR5ICYgUHJpdmFjeVwiKX08L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+e190KFwiRW5jcnlwdGlvblwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfU2VjdXJpdHlSb29tU2V0dGluZ3NUYWJfZW5jcnlwdGlvblNlY3Rpb24nPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57X3QoXCJPbmNlIGVuYWJsZWQsIGVuY3J5cHRpb24gY2Fubm90IGJlIGRpc2FibGVkLlwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaCB2YWx1ZT17aXNFbmNyeXB0ZWR9IG9uQ2hhbmdlPXt0aGlzLl9vbkVuY3J5cHRpb25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRW5jcnlwdGVkXCIpfSBkaXNhYmxlZD17IWNhbkVuYWJsZUVuY3J5cHRpb259IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7ZW5jcnlwdGlvblNldHRpbmdzfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJXaG8gY2FuIGFjY2VzcyB0aGlzIHJvb20/XCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJSb29tQWNjZXNzKCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICB7aGlzdG9yeVNlY3Rpb259XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
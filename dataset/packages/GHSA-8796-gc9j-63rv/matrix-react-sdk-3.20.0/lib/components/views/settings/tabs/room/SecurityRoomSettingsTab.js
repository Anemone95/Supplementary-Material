"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

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

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class, _temp;

// Knock and private are reserved keywords which are not yet implemented.
var JoinRule;

(function (JoinRule) {
  JoinRule["Public"] = "public";
  JoinRule["Knock"] = "knock";
  JoinRule["Invite"] = "invite";
  JoinRule["Private"] = "private";
})(JoinRule || (JoinRule = {}));

var GuestAccess;

(function (GuestAccess) {
  GuestAccess["CanJoin"] = "can_join";
  GuestAccess["Forbidden"] = "forbidden";
})(GuestAccess || (GuestAccess = {}));

var HistoryVisibility;

(function (HistoryVisibility) {
  HistoryVisibility["Invited"] = "invited";
  HistoryVisibility["Joined"] = "joined";
  HistoryVisibility["Shared"] = "shared";
  HistoryVisibility["WorldReadable"] = "world_readable";
})(HistoryVisibility || (HistoryVisibility = {}));

let SecurityRoomSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.room.SecurityRoomSettingsTab"), _dec(_class = (_temp = class SecurityRoomSettingsTab extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onStateEvent", (e
    /*: MatrixEvent*/
    ) => {
      const refreshWhenTypes = ['m.room.join_rules', 'm.room.guest_access', 'm.room.history_visibility', 'm.room.encryption'];
      if (refreshWhenTypes.includes(e.getType())) this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onEncryptionChange", (e
    /*: React.ChangeEvent*/
    ) => {
      _Modal.default.createTrackedDialog('Enable encryption', '', _QuestionDialog.default, {
        title: (0, _languageHandler._t)('Enable encryption?'),
        description: (0, _languageHandler._t)("Once enabled, encryption for a room cannot be disabled. Messages sent in an encrypted " + "room cannot be seen by the server, only by the participants of the room. Enabling encryption " + "may prevent many bots and bridges from working correctly. <a>Learn more about encryption.</a>", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: "https://element.io/help#encryption",
            rel: "noreferrer noopener",
            target: "_blank"
          }, sub)
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
    (0, _defineProperty2.default)(this, "fixGuestAccess", (e
    /*: React.MouseEvent*/
    ) => {
      e.preventDefault();
      e.stopPropagation();
      const joinRule = JoinRule.Invite;
      const guestAccess = GuestAccess.CanJoin;
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
    (0, _defineProperty2.default)(this, "onRoomAccessRadioToggle", (roomAccess
    /*: string*/
    ) => {
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
      let joinRule = JoinRule.Invite;
      let guestAccess = GuestAccess.CanJoin;

      switch (roomAccess) {
        case "invite_only":
          // no change - use defaults above
          break;

        case "public_no_guests":
          joinRule = JoinRule.Public;
          guestAccess = GuestAccess.Forbidden;
          break;

        case "public_with_guests":
          joinRule = JoinRule.Public;
          guestAccess = GuestAccess.CanJoin;
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
    (0, _defineProperty2.default)(this, "onHistoryRadioToggle", (history
    /*: HistoryVisibility*/
    ) => {
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
    (0, _defineProperty2.default)(this, "updateBlacklistDevicesFlag", (checked
    /*: boolean*/
    ) => {
      _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId).setBlacklistUnverifiedDevices(checked);
    });
    this.state = {
      joinRule: JoinRule.Invite,
      guestAccess: GuestAccess.CanJoin,
      history: HistoryVisibility.Shared,
      hasAliases: false,
      encrypted: false
    };
  } // TODO: [REACT-WARNING] Move this to constructor


  async UNSAFE_componentWillMount() {
    // eslint-disable-line camelcase
    _MatrixClientPeg.MatrixClientPeg.get().on("RoomState.events", this.onStateEvent);

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

    const state = room.currentState;
    const joinRule
    /*: JoinRule*/
    = this.pullContentPropertyFromEvent(state.getStateEvents("m.room.join_rules", ""), 'join_rule', JoinRule.Invite);
    const guestAccess
    /*: GuestAccess*/
    = this.pullContentPropertyFromEvent(state.getStateEvents("m.room.guest_access", ""), 'guest_access', GuestAccess.Forbidden);
    const history
    /*: HistoryVisibility*/
    = this.pullContentPropertyFromEvent(state.getStateEvents("m.room.history_visibility", ""), 'history_visibility', HistoryVisibility.Shared);

    const encrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(this.props.roomId);

    this.setState({
      joinRule,
      guestAccess,
      history,
      encrypted
    });
    const hasAliases = await this.hasAliases();
    this.setState({
      hasAliases
    });
  }

  pullContentPropertyFromEvent(event
  /*: MatrixEvent*/
  , key
  /*: string*/
  , defaultValue
  /*: T*/
  )
  /*: T*/
  {
    if (!event || !event.getContent()) return defaultValue;
    return event.getContent()[key] || defaultValue;
  }

  componentWillUnmount() {
    _MatrixClientPeg.MatrixClientPeg.get().removeListener("RoomState.events", this.onStateEvent);
  }

  async hasAliases()
  /*: Promise<boolean>*/
  {
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

  renderRoomAccess() {
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
        onClick: this.fixGuestAccess
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
      onChange: this.onRoomAccessRadioToggle,
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

  renderHistory() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const history = this.state.history;
    const state = client.getRoom(this.props.roomId).currentState;
    const canChangeHistory = state.mayClientSendStateEvent('m.room.history_visibility', client);
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('Changes to who can read history will only apply to future messages in this room. ' + 'The visibility of existing history will be unchanged.')), /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
      name: "historyVis",
      value: history,
      onChange: this.onHistoryRadioToggle,
      definitions: [{
        value: HistoryVisibility.WorldReadable,
        disabled: !canChangeHistory,
        label: (0, _languageHandler._t)("Anyone")
      }, {
        value: HistoryVisibility.Shared,
        disabled: !canChangeHistory,
        label: (0, _languageHandler._t)('Members only (since the point in time of selecting this option)')
      }, {
        value: HistoryVisibility.Invited,
        disabled: !canChangeHistory,
        label: (0, _languageHandler._t)('Members only (since they were invited)')
      }, {
        value: HistoryVisibility.Joined,
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
        onChange: this.updateBlacklistDevicesFlag,
        roomId: this.props.roomId
      });
    }

    let historySection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Who can read history?")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, this.renderHistory()));

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
      onChange: this.onEncryptionChange,
      label: (0, _languageHandler._t)("Encrypted"),
      disabled: !canEnableEncryption
    })), encryptionSettings), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Who can access this room?")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, this.renderRoomAccess()), historySection);
  }

}, _temp)) || _class);
exports.default = SecurityRoomSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9TZWN1cml0eVJvb21TZXR0aW5nc1RhYi50c3giXSwibmFtZXMiOlsiSm9pblJ1bGUiLCJHdWVzdEFjY2VzcyIsIkhpc3RvcnlWaXNpYmlsaXR5IiwiU2VjdXJpdHlSb29tU2V0dGluZ3NUYWIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJlIiwicmVmcmVzaFdoZW5UeXBlcyIsImluY2x1ZGVzIiwiZ2V0VHlwZSIsImZvcmNlVXBkYXRlIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiUXVlc3Rpb25EaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiYSIsInN1YiIsIm9uRmluaXNoZWQiLCJjb25maXJtIiwic2V0U3RhdGUiLCJlbmNyeXB0ZWQiLCJiZWZvcmVFbmNyeXB0ZWQiLCJzdGF0ZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInNlbmRTdGF0ZUV2ZW50Iiwicm9vbUlkIiwiYWxnb3JpdGhtIiwiY2F0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImpvaW5SdWxlIiwiSW52aXRlIiwiZ3Vlc3RBY2Nlc3MiLCJDYW5Kb2luIiwiYmVmb3JlSm9pblJ1bGUiLCJiZWZvcmVHdWVzdEFjY2VzcyIsImNsaWVudCIsImpvaW5fcnVsZSIsImd1ZXN0X2FjY2VzcyIsInJvb21BY2Nlc3MiLCJQdWJsaWMiLCJGb3JiaWRkZW4iLCJoaXN0b3J5IiwiYmVmb3JlSGlzdG9yeSIsImhpc3RvcnlfdmlzaWJpbGl0eSIsImNoZWNrZWQiLCJnZXRSb29tIiwic2V0QmxhY2tsaXN0VW52ZXJpZmllZERldmljZXMiLCJTaGFyZWQiLCJoYXNBbGlhc2VzIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsIm9uIiwib25TdGF0ZUV2ZW50Iiwicm9vbSIsImN1cnJlbnRTdGF0ZSIsInB1bGxDb250ZW50UHJvcGVydHlGcm9tRXZlbnQiLCJnZXRTdGF0ZUV2ZW50cyIsImlzUm9vbUVuY3J5cHRlZCIsImV2ZW50Iiwia2V5IiwiZGVmYXVsdFZhbHVlIiwiZ2V0Q29udGVudCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJjbGkiLCJkb2VzU2VydmVyU3VwcG9ydFVuc3RhYmxlRmVhdHVyZSIsInJlc3BvbnNlIiwidW5zdGFibGVHZXRMb2NhbEFsaWFzZXMiLCJsb2NhbEFsaWFzZXMiLCJhbGlhc2VzIiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwiYWxpYXNFdmVudHMiLCJmaW5kIiwiZXYiLCJyZW5kZXJSb29tQWNjZXNzIiwiY2FuQ2hhbmdlQWNjZXNzIiwibWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQiLCJndWVzdFdhcm5pbmciLCJyZXF1aXJlIiwiZml4R3Vlc3RBY2Nlc3MiLCJhbGlhc1dhcm5pbmciLCJvblJvb21BY2Nlc3NSYWRpb1RvZ2dsZSIsInZhbHVlIiwiZGlzYWJsZWQiLCJsYWJlbCIsInJlbmRlckhpc3RvcnkiLCJjYW5DaGFuZ2VIaXN0b3J5Iiwib25IaXN0b3J5UmFkaW9Ub2dnbGUiLCJXb3JsZFJlYWRhYmxlIiwiSW52aXRlZCIsIkpvaW5lZCIsInJlbmRlciIsIlNldHRpbmdzRmxhZyIsInNkayIsImdldENvbXBvbmVudCIsImlzRW5jcnlwdGVkIiwiaGFzRW5jcnlwdGlvblBlcm1pc3Npb24iLCJjYW5FbmFibGVFbmNyeXB0aW9uIiwiZW5jcnlwdGlvblNldHRpbmdzIiwiU2V0dGluZ3NTdG9yZSIsImlzRW5hYmxlZCIsIlNldHRpbmdMZXZlbCIsIlJPT01fREVWSUNFIiwidXBkYXRlQmxhY2tsaXN0RGV2aWNlc0ZsYWciLCJoaXN0b3J5U2VjdGlvbiIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiUm9vbUhpc3RvcnlTZXR0aW5ncyIsIm9uRW5jcnlwdGlvbkNoYW5nZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7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YyxHQUFHLElBQWpCO0FBQ0g7O0FBRUQsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUF5Qyx5QkFBRyxvQkFBSCxDQUF6QyxDQURKLGVBR0k7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixPQUE2Qyx5QkFBRyxZQUFILENBQTdDLENBSEosZUFJSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksdURBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLDJDQUFPLHlCQUFHLDhDQUFILENBQVAsQ0FESixDQURKLGVBSUksNkJBQUMsNkJBQUQ7QUFBc0IsTUFBQSxLQUFLLEVBQUVULFdBQTdCO0FBQTBDLE1BQUEsUUFBUSxFQUFFLEtBQUthLGtCQUF6RDtBQUNJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLFdBQUgsQ0FEWDtBQUM0QixNQUFBLFFBQVEsRUFBRSxDQUFDWDtBQUR2QyxNQUpKLENBREosRUFTS0Msa0JBVEwsQ0FKSixlQWdCSTtBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLE9BQTZDLHlCQUFHLDJCQUFILENBQTdDLENBaEJKLGVBaUJJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLLEtBQUt4QixnQkFBTCxFQURMLENBakJKLEVBcUJLOEIsY0FyQkwsQ0FESjtBQXlCSDs7QUFsV2dGLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTktMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uLy4uLy4uXCI7XG5pbXBvcnQgTGFiZWxsZWRUb2dnbGVTd2l0Y2ggZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0xhYmVsbGVkVG9nZ2xlU3dpdGNoXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4uLy4uLy4uL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBTdHlsZWRSYWRpb0dyb3VwIGZyb20gJy4uLy4uLy4uL2VsZW1lbnRzL1N0eWxlZFJhZGlvR3JvdXAnO1xuaW1wb3J0IHtTZXR0aW5nTGV2ZWx9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge1VJRmVhdHVyZX0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IHsgcmVwbGFjZWFibGVDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuLy8gS25vY2sgYW5kIHByaXZhdGUgYXJlIHJlc2VydmVkIGtleXdvcmRzIHdoaWNoIGFyZSBub3QgeWV0IGltcGxlbWVudGVkLlxuZW51bSBKb2luUnVsZSB7XG4gICAgUHVibGljID0gXCJwdWJsaWNcIixcbiAgICBLbm9jayA9IFwia25vY2tcIixcbiAgICBJbnZpdGUgPSBcImludml0ZVwiLFxuICAgIFByaXZhdGUgPSBcInByaXZhdGVcIixcbn1cblxuZW51bSBHdWVzdEFjY2VzcyB7XG4gICAgQ2FuSm9pbiA9IFwiY2FuX2pvaW5cIixcbiAgICBGb3JiaWRkZW4gPSBcImZvcmJpZGRlblwiLFxufVxuXG5lbnVtIEhpc3RvcnlWaXNpYmlsaXR5IHtcbiAgICBJbnZpdGVkID0gXCJpbnZpdGVkXCIsXG4gICAgSm9pbmVkID0gXCJqb2luZWRcIixcbiAgICBTaGFyZWQgPSBcInNoYXJlZFwiLFxuICAgIFdvcmxkUmVhZGFibGUgPSBcIndvcmxkX3JlYWRhYmxlXCIsXG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21JZDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBqb2luUnVsZTogSm9pblJ1bGU7XG4gICAgZ3Vlc3RBY2Nlc3M6IEd1ZXN0QWNjZXNzO1xuICAgIGhpc3Rvcnk6IEhpc3RvcnlWaXNpYmlsaXR5O1xuICAgIGhhc0FsaWFzZXM6IGJvb2xlYW47XG4gICAgZW5jcnlwdGVkOiBib29sZWFuO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy50YWJzLnJvb20uU2VjdXJpdHlSb29tU2V0dGluZ3NUYWJcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlY3VyaXR5Um9vbVNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBqb2luUnVsZTogSm9pblJ1bGUuSW52aXRlLFxuICAgICAgICAgICAgZ3Vlc3RBY2Nlc3M6IEd1ZXN0QWNjZXNzLkNhbkpvaW4sXG4gICAgICAgICAgICBoaXN0b3J5OiBIaXN0b3J5VmlzaWJpbGl0eS5TaGFyZWQsXG4gICAgICAgICAgICBoYXNBbGlhc2VzOiBmYWxzZSxcbiAgICAgICAgICAgIGVuY3J5cHRlZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIE1vdmUgdGhpcyB0byBjb25zdHJ1Y3RvclxuICAgIGFzeW5jIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5vblN0YXRlRXZlbnQpO1xuXG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gcm9vbS5jdXJyZW50U3RhdGU7XG5cbiAgICAgICAgY29uc3Qgam9pblJ1bGU6IEpvaW5SdWxlID0gdGhpcy5wdWxsQ29udGVudFByb3BlcnR5RnJvbUV2ZW50KFxuICAgICAgICAgICAgc3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20uam9pbl9ydWxlc1wiLCBcIlwiKSxcbiAgICAgICAgICAgICdqb2luX3J1bGUnLFxuICAgICAgICAgICAgSm9pblJ1bGUuSW52aXRlLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBndWVzdEFjY2VzczogR3Vlc3RBY2Nlc3MgPSB0aGlzLnB1bGxDb250ZW50UHJvcGVydHlGcm9tRXZlbnQoXG4gICAgICAgICAgICBzdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5ndWVzdF9hY2Nlc3NcIiwgXCJcIiksXG4gICAgICAgICAgICAnZ3Vlc3RfYWNjZXNzJyxcbiAgICAgICAgICAgIEd1ZXN0QWNjZXNzLkZvcmJpZGRlbixcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaGlzdG9yeTogSGlzdG9yeVZpc2liaWxpdHkgPSB0aGlzLnB1bGxDb250ZW50UHJvcGVydHlGcm9tRXZlbnQoXG4gICAgICAgICAgICBzdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5oaXN0b3J5X3Zpc2liaWxpdHlcIiwgXCJcIiksXG4gICAgICAgICAgICAnaGlzdG9yeV92aXNpYmlsaXR5JyxcbiAgICAgICAgICAgIEhpc3RvcnlWaXNpYmlsaXR5LlNoYXJlZCxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgZW5jcnlwdGVkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzUm9vbUVuY3J5cHRlZCh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2pvaW5SdWxlLCBndWVzdEFjY2VzcywgaGlzdG9yeSwgZW5jcnlwdGVkfSk7XG4gICAgICAgIGNvbnN0IGhhc0FsaWFzZXMgPSBhd2FpdCB0aGlzLmhhc0FsaWFzZXMoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGFzQWxpYXNlc30pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcHVsbENvbnRlbnRQcm9wZXJ0eUZyb21FdmVudDxUPihldmVudDogTWF0cml4RXZlbnQsIGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IFQpOiBUIHtcbiAgICAgICAgaWYgKCFldmVudCB8fCAhZXZlbnQuZ2V0Q29udGVudCgpKSByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICByZXR1cm4gZXZlbnQuZ2V0Q29udGVudCgpW2tleV0gfHwgZGVmYXVsdFZhbHVlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMub25TdGF0ZUV2ZW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RhdGVFdmVudCA9IChlOiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCByZWZyZXNoV2hlblR5cGVzID0gW1xuICAgICAgICAgICAgJ20ucm9vbS5qb2luX3J1bGVzJyxcbiAgICAgICAgICAgICdtLnJvb20uZ3Vlc3RfYWNjZXNzJyxcbiAgICAgICAgICAgICdtLnJvb20uaGlzdG9yeV92aXNpYmlsaXR5JyxcbiAgICAgICAgICAgICdtLnJvb20uZW5jcnlwdGlvbicsXG4gICAgICAgIF07XG4gICAgICAgIGlmIChyZWZyZXNoV2hlblR5cGVzLmluY2x1ZGVzKGUuZ2V0VHlwZSgpKSkgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRW5jcnlwdGlvbkNoYW5nZSA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdFbmFibGUgZW5jcnlwdGlvbicsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KCdFbmFibGUgZW5jcnlwdGlvbj8nKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICBcIk9uY2UgZW5hYmxlZCwgZW5jcnlwdGlvbiBmb3IgYSByb29tIGNhbm5vdCBiZSBkaXNhYmxlZC4gTWVzc2FnZXMgc2VudCBpbiBhbiBlbmNyeXB0ZWQgXCIgK1xuICAgICAgICAgICAgICAgIFwicm9vbSBjYW5ub3QgYmUgc2VlbiBieSB0aGUgc2VydmVyLCBvbmx5IGJ5IHRoZSBwYXJ0aWNpcGFudHMgb2YgdGhlIHJvb20uIEVuYWJsaW5nIGVuY3J5cHRpb24gXCIgK1xuICAgICAgICAgICAgICAgIFwibWF5IHByZXZlbnQgbWFueSBib3RzIGFuZCBicmlkZ2VzIGZyb20gd29ya2luZyBjb3JyZWN0bHkuIDxhPkxlYXJuIG1vcmUgYWJvdXQgZW5jcnlwdGlvbi48L2E+XCIsXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPGEgaHJlZj1cImh0dHBzOi8vZWxlbWVudC5pby9oZWxwI2VuY3J5cHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgID57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAoY29uZmlybSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghY29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlbmNyeXB0ZWQ6IGZhbHNlfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBiZWZvcmVFbmNyeXB0ZWQgPSB0aGlzLnN0YXRlLmVuY3J5cHRlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlbmNyeXB0ZWQ6IHRydWV9KTtcbiAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFN0YXRlRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbUlkLCBcIm0ucm9vbS5lbmNyeXB0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgYWxnb3JpdGhtOiBcIm0ubWVnb2xtLnYxLmFlcy1zaGEyXCIgfSxcbiAgICAgICAgICAgICAgICApLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2VuY3J5cHRlZDogYmVmb3JlRW5jcnlwdGVkfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBmaXhHdWVzdEFjY2VzcyA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBjb25zdCBqb2luUnVsZSA9IEpvaW5SdWxlLkludml0ZTtcbiAgICAgICAgY29uc3QgZ3Vlc3RBY2Nlc3MgPSBHdWVzdEFjY2Vzcy5DYW5Kb2luO1xuXG4gICAgICAgIGNvbnN0IGJlZm9yZUpvaW5SdWxlID0gdGhpcy5zdGF0ZS5qb2luUnVsZTtcbiAgICAgICAgY29uc3QgYmVmb3JlR3Vlc3RBY2Nlc3MgPSB0aGlzLnN0YXRlLmd1ZXN0QWNjZXNzO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtqb2luUnVsZSwgZ3Vlc3RBY2Nlc3N9KTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNsaWVudC5zZW5kU3RhdGVFdmVudCh0aGlzLnByb3BzLnJvb21JZCwgXCJtLnJvb20uam9pbl9ydWxlc1wiLCB7am9pbl9ydWxlOiBqb2luUnVsZX0sIFwiXCIpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7am9pblJ1bGU6IGJlZm9yZUpvaW5SdWxlfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjbGllbnQuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLmd1ZXN0X2FjY2Vzc1wiLCB7Z3Vlc3RfYWNjZXNzOiBndWVzdEFjY2Vzc30sIFwiXCIpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z3Vlc3RBY2Nlc3M6IGJlZm9yZUd1ZXN0QWNjZXNzfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbUFjY2Vzc1JhZGlvVG9nZ2xlID0gKHJvb21BY2Nlc3M6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBqb2luX3J1bGVcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgSU5WSVRFICB8ICBQVUJMSUNcbiAgICAgICAgLy8gICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBndWVzdCAgQ0FOX0pPSU4gICB8IGludl9vbmx5IHwgcHViX3dpdGhfZ3Vlc3RcbiAgICAgICAgLy8gYWNjZXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyAgICAgICAgRk9SQklEREVOICB8IGludl9vbmx5IHwgcHViX25vX2d1ZXN0XG4gICAgICAgIC8vICAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAvLyB3ZSBhbHdheXMgc2V0IGd1ZXN0cyBjYW5fam9pbiBoZXJlIGFzIGl0IG1ha2VzIG5vIHNlbnNlIHRvIGhhdmVcbiAgICAgICAgLy8gYW4gaW52aXRlLW9ubHkgcm9vbSB0aGF0IGd1ZXN0cyBjYW4ndCBqb2luLiAgSWYgeW91IGV4cGxpY2l0bHlcbiAgICAgICAgLy8gaW52aXRlIHRoZW0sIHlvdSBjbGVhcmx5IHdhbnQgdGhlbSB0byBqb2luLCB3aGV0aGVyIHRoZXkncmUgYVxuICAgICAgICAvLyBndWVzdCBvciBub3QuICBJbiBwcmFjdGljZSwgZ3Vlc3RfYWNjZXNzIHNob3VsZCBwcm9iYWJseSBoYXZlXG4gICAgICAgIC8vIGJlZW4gaW1wbGVtZW50ZWQgYXMgcGFydCBvZiB0aGUgam9pbl9ydWxlcyBlbnVtLlxuICAgICAgICBsZXQgam9pblJ1bGUgPSBKb2luUnVsZS5JbnZpdGU7XG4gICAgICAgIGxldCBndWVzdEFjY2VzcyA9IEd1ZXN0QWNjZXNzLkNhbkpvaW47XG5cbiAgICAgICAgc3dpdGNoIChyb29tQWNjZXNzKSB7XG4gICAgICAgICAgICBjYXNlIFwiaW52aXRlX29ubHlcIjpcbiAgICAgICAgICAgICAgICAvLyBubyBjaGFuZ2UgLSB1c2UgZGVmYXVsdHMgYWJvdmVcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJwdWJsaWNfbm9fZ3Vlc3RzXCI6XG4gICAgICAgICAgICAgICAgam9pblJ1bGUgPSBKb2luUnVsZS5QdWJsaWM7XG4gICAgICAgICAgICAgICAgZ3Vlc3RBY2Nlc3MgPSBHdWVzdEFjY2Vzcy5Gb3JiaWRkZW47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwicHVibGljX3dpdGhfZ3Vlc3RzXCI6XG4gICAgICAgICAgICAgICAgam9pblJ1bGUgPSBKb2luUnVsZS5QdWJsaWM7XG4gICAgICAgICAgICAgICAgZ3Vlc3RBY2Nlc3MgPSBHdWVzdEFjY2Vzcy5DYW5Kb2luO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYmVmb3JlSm9pblJ1bGUgPSB0aGlzLnN0YXRlLmpvaW5SdWxlO1xuICAgICAgICBjb25zdCBiZWZvcmVHdWVzdEFjY2VzcyA9IHRoaXMuc3RhdGUuZ3Vlc3RBY2Nlc3M7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2pvaW5SdWxlLCBndWVzdEFjY2Vzc30pO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY2xpZW50LnNlbmRTdGF0ZUV2ZW50KHRoaXMucHJvcHMucm9vbUlkLCBcIm0ucm9vbS5qb2luX3J1bGVzXCIsIHtqb2luX3J1bGU6IGpvaW5SdWxlfSwgXCJcIikuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtqb2luUnVsZTogYmVmb3JlSm9pblJ1bGV9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNsaWVudC5zZW5kU3RhdGVFdmVudCh0aGlzLnByb3BzLnJvb21JZCwgXCJtLnJvb20uZ3Vlc3RfYWNjZXNzXCIsIHtndWVzdF9hY2Nlc3M6IGd1ZXN0QWNjZXNzfSwgXCJcIikuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtndWVzdEFjY2VzczogYmVmb3JlR3Vlc3RBY2Nlc3N9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25IaXN0b3J5UmFkaW9Ub2dnbGUgPSAoaGlzdG9yeTogSGlzdG9yeVZpc2liaWxpdHkpID0+IHtcbiAgICAgICAgY29uc3QgYmVmb3JlSGlzdG9yeSA9IHRoaXMuc3RhdGUuaGlzdG9yeTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGlzdG9yeTogaGlzdG9yeX0pO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLmhpc3RvcnlfdmlzaWJpbGl0eVwiLCB7XG4gICAgICAgICAgICBoaXN0b3J5X3Zpc2liaWxpdHk6IGhpc3RvcnksXG4gICAgICAgIH0sIFwiXCIpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGlzdG9yeTogYmVmb3JlSGlzdG9yeX0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVCbGFja2xpc3REZXZpY2VzRmxhZyA9IChjaGVja2VkOiBib29sZWFuKSA9PiB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKS5zZXRCbGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlcyhjaGVja2VkKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyBoYXNBbGlhc2VzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmIChhd2FpdCBjbGkuZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUoXCJvcmcubWF0cml4Lm1zYzI0MzJcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpLnVuc3RhYmxlR2V0TG9jYWxBbGlhc2VzKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsQWxpYXNlcyA9IHJlc3BvbnNlLmFsaWFzZXM7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShsb2NhbEFsaWFzZXMpICYmIGxvY2FsQWxpYXNlcy5sZW5ndGggIT09IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICAgICAgY29uc3QgYWxpYXNFdmVudHMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5hbGlhc2VzXCIpIHx8IFtdO1xuICAgICAgICAgICAgY29uc3QgaGFzQWxpYXNlcyA9ICEhYWxpYXNFdmVudHMuZmluZCgoZXYpID0+IChldi5nZXRDb250ZW50KCkuYWxpYXNlcyB8fCBbXSkubGVuZ3RoID4gMCk7XG4gICAgICAgICAgICByZXR1cm4gaGFzQWxpYXNlcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUm9vbUFjY2VzcygpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICBjb25zdCBqb2luUnVsZSA9IHRoaXMuc3RhdGUuam9pblJ1bGU7XG4gICAgICAgIGNvbnN0IGd1ZXN0QWNjZXNzID0gdGhpcy5zdGF0ZS5ndWVzdEFjY2VzcztcblxuICAgICAgICBjb25zdCBjYW5DaGFuZ2VBY2Nlc3MgPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudChcIm0ucm9vbS5qb2luX3J1bGVzXCIsIGNsaWVudClcbiAgICAgICAgICAgICYmIHJvb20uY3VycmVudFN0YXRlLm1heUNsaWVudFNlbmRTdGF0ZUV2ZW50KFwibS5yb29tLmd1ZXN0X2FjY2Vzc1wiLCBjbGllbnQpO1xuXG4gICAgICAgIGxldCBndWVzdFdhcm5pbmcgPSBudWxsO1xuICAgICAgICBpZiAoam9pblJ1bGUgIT09ICdwdWJsaWMnICYmIGd1ZXN0QWNjZXNzID09PSAnZm9yYmlkZGVuJykge1xuICAgICAgICAgICAgZ3Vlc3RXYXJuaW5nID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZWN1cml0eVJvb21TZXR0aW5nc1RhYl93YXJuaW5nJz5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi8uLi8uLi9yZXMvaW1nL3dhcm5pbmcuc3ZnXCIpfSB3aWR0aD17MTV9IGhlaWdodD17MTV9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiR3Vlc3RzIGNhbm5vdCBqb2luIHRoaXMgcm9vbSBldmVuIGlmIGV4cGxpY2l0bHkgaW52aXRlZC5cIil9Jm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiXCIgb25DbGljaz17dGhpcy5maXhHdWVzdEFjY2Vzc30+e190KFwiQ2xpY2sgaGVyZSB0byBmaXhcIil9PC9hPlxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFsaWFzV2FybmluZyA9IG51bGw7XG4gICAgICAgIGlmIChqb2luUnVsZSA9PT0gJ3B1YmxpYycgJiYgIXRoaXMuc3RhdGUuaGFzQWxpYXNlcykge1xuICAgICAgICAgICAgYWxpYXNXYXJuaW5nID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZWN1cml0eVJvb21TZXR0aW5nc1RhYl93YXJuaW5nJz5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi8uLi8uLi9yZXMvaW1nL3dhcm5pbmcuc3ZnXCIpfSB3aWR0aD17MTV9IGhlaWdodD17MTV9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiVG8gbGluayB0byB0aGlzIHJvb20sIHBsZWFzZSBhZGQgYW4gYWRkcmVzcy5cIil9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICB7Z3Vlc3RXYXJuaW5nfVxuICAgICAgICAgICAgICAgIHthbGlhc1dhcm5pbmd9XG4gICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvR3JvdXBcbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cInJvb21WaXNcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17am9pblJ1bGV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUm9vbUFjY2Vzc1JhZGlvVG9nZ2xlfVxuICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9ucz17W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcImludml0ZV9vbmx5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICFjYW5DaGFuZ2VBY2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IF90KCdPbmx5IHBlb3BsZSB3aG8gaGF2ZSBiZWVuIGludml0ZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiBqb2luUnVsZSAhPT0gXCJwdWJsaWNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwicHVibGljX25vX2d1ZXN0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAhY2FuQ2hhbmdlQWNjZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBfdCgnQW55b25lIHdobyBrbm93cyB0aGUgcm9vbVxcJ3MgbGluaywgYXBhcnQgZnJvbSBndWVzdHMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiBqb2luUnVsZSA9PT0gXCJwdWJsaWNcIiAmJiBndWVzdEFjY2VzcyAhPT0gXCJjYW5fam9pblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJwdWJsaWNfd2l0aF9ndWVzdHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogIWNhbkNoYW5nZUFjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogX3QoXCJBbnlvbmUgd2hvIGtub3dzIHRoZSByb29tJ3MgbGluaywgaW5jbHVkaW5nIGd1ZXN0c1wiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiBqb2luUnVsZSA9PT0gXCJwdWJsaWNcIiAmJiBndWVzdEFjY2VzcyA9PT0gXCJjYW5fam9pblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJIaXN0b3J5KCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGhpc3RvcnkgPSB0aGlzLnN0YXRlLmhpc3Rvcnk7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gY2xpZW50LmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpLmN1cnJlbnRTdGF0ZTtcbiAgICAgICAgY29uc3QgY2FuQ2hhbmdlSGlzdG9yeSA9IHN0YXRlLm1heUNsaWVudFNlbmRTdGF0ZUV2ZW50KCdtLnJvb20uaGlzdG9yeV92aXNpYmlsaXR5JywgY2xpZW50KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7X3QoJ0NoYW5nZXMgdG8gd2hvIGNhbiByZWFkIGhpc3Rvcnkgd2lsbCBvbmx5IGFwcGx5IHRvIGZ1dHVyZSBtZXNzYWdlcyBpbiB0aGlzIHJvb20uICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1RoZSB2aXNpYmlsaXR5IG9mIGV4aXN0aW5nIGhpc3Rvcnkgd2lsbCBiZSB1bmNoYW5nZWQuJyl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvR3JvdXBcbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cImhpc3RvcnlWaXNcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17aGlzdG9yeX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25IaXN0b3J5UmFkaW9Ub2dnbGV9XG4gICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb25zPXtbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IEhpc3RvcnlWaXNpYmlsaXR5LldvcmxkUmVhZGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICFjYW5DaGFuZ2VIaXN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBfdChcIkFueW9uZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IEhpc3RvcnlWaXNpYmlsaXR5LlNoYXJlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogIWNhbkNoYW5nZUhpc3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IF90KCdNZW1iZXJzIG9ubHkgKHNpbmNlIHRoZSBwb2ludCBpbiB0aW1lIG9mIHNlbGVjdGluZyB0aGlzIG9wdGlvbiknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IEhpc3RvcnlWaXNpYmlsaXR5Lkludml0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICFjYW5DaGFuZ2VIaXN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBfdCgnTWVtYmVycyBvbmx5IChzaW5jZSB0aGV5IHdlcmUgaW52aXRlZCknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IEhpc3RvcnlWaXNpYmlsaXR5LkpvaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogIWNhbkNoYW5nZUhpc3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IF90KCdNZW1iZXJzIG9ubHkgKHNpbmNlIHRoZXkgam9pbmVkKScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBTZXR0aW5nc0ZsYWcgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU2V0dGluZ3NGbGFnXCIpO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgY29uc3QgaXNFbmNyeXB0ZWQgPSB0aGlzLnN0YXRlLmVuY3J5cHRlZDtcbiAgICAgICAgY29uc3QgaGFzRW5jcnlwdGlvblBlcm1pc3Npb24gPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudChcIm0ucm9vbS5lbmNyeXB0aW9uXCIsIGNsaWVudCk7XG4gICAgICAgIGNvbnN0IGNhbkVuYWJsZUVuY3J5cHRpb24gPSAhaXNFbmNyeXB0ZWQgJiYgaGFzRW5jcnlwdGlvblBlcm1pc3Npb247XG5cbiAgICAgICAgbGV0IGVuY3J5cHRpb25TZXR0aW5ncyA9IG51bGw7XG4gICAgICAgIGlmIChpc0VuY3J5cHRlZCAmJiBTZXR0aW5nc1N0b3JlLmlzRW5hYmxlZChcImJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzXCIpKSB7XG4gICAgICAgICAgICBlbmNyeXB0aW9uU2V0dGluZ3MgPSA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgbmFtZT1cImJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzXCJcbiAgICAgICAgICAgICAgICBsZXZlbD17U2V0dGluZ0xldmVsLlJPT01fREVWSUNFfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnVwZGF0ZUJsYWNrbGlzdERldmljZXNGbGFnfVxuICAgICAgICAgICAgICAgIHJvb21JZD17dGhpcy5wcm9wcy5yb29tSWR9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBoaXN0b3J5U2VjdGlvbiA9ICg8PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJXaG8gY2FuIHJlYWQgaGlzdG9yeT9cIil9PC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlckhpc3RvcnkoKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8Lz4pO1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlJvb21IaXN0b3J5U2V0dGluZ3MpKSB7XG4gICAgICAgICAgICBoaXN0b3J5U2VjdGlvbiA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYiBteF9TZWN1cml0eVJvb21TZXR0aW5nc1RhYlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntfdChcIlNlY3VyaXR5ICYgUHJpdmFjeVwiKX08L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+e190KFwiRW5jcnlwdGlvblwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfU2VjdXJpdHlSb29tU2V0dGluZ3NUYWJfZW5jcnlwdGlvblNlY3Rpb24nPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57X3QoXCJPbmNlIGVuYWJsZWQsIGVuY3J5cHRpb24gY2Fubm90IGJlIGRpc2FibGVkLlwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaCB2YWx1ZT17aXNFbmNyeXB0ZWR9IG9uQ2hhbmdlPXt0aGlzLm9uRW5jcnlwdGlvbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJFbmNyeXB0ZWRcIil9IGRpc2FibGVkPXshY2FuRW5hYmxlRW5jcnlwdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7ZW5jcnlwdGlvblNldHRpbmdzfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJXaG8gY2FuIGFjY2VzcyB0aGlzIHJvb20/XCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlclJvb21BY2Nlc3MoKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIHtoaXN0b3J5U2VjdGlvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
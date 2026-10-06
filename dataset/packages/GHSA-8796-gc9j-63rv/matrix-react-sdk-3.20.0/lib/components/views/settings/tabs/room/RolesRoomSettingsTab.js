"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BannedUser = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../.."));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _event = require("matrix-js-sdk/src/@types/event");

var _dec, _class, _temp;

const plEventsToLabels = {
  // These will be translated for us later.
  [_event.EventType.RoomAvatar]: (0, _languageHandler._td)("Change room avatar"),
  [_event.EventType.RoomName]: (0, _languageHandler._td)("Change room name"),
  [_event.EventType.RoomCanonicalAlias]: (0, _languageHandler._td)("Change main address for the room"),
  [_event.EventType.RoomHistoryVisibility]: (0, _languageHandler._td)("Change history visibility"),
  [_event.EventType.RoomPowerLevels]: (0, _languageHandler._td)("Change permissions"),
  [_event.EventType.RoomTopic]: (0, _languageHandler._td)("Change topic"),
  [_event.EventType.RoomTombstone]: (0, _languageHandler._td)("Upgrade the room"),
  [_event.EventType.RoomEncryption]: (0, _languageHandler._td)("Enable room encryption"),
  [_event.EventType.RoomServerAcl]: (0, _languageHandler._td)("Change server ACLs"),
  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  "im.vector.modular.widgets": (0, _languageHandler._td)("Modify widgets")
};
const plEventsToShow = {
  // If an event is listed here, it will be shown in the PL settings. Defaults will be calculated.
  [_event.EventType.RoomAvatar]: {
    isState: true
  },
  [_event.EventType.RoomName]: {
    isState: true
  },
  [_event.EventType.RoomCanonicalAlias]: {
    isState: true
  },
  [_event.EventType.RoomHistoryVisibility]: {
    isState: true
  },
  [_event.EventType.RoomPowerLevels]: {
    isState: true
  },
  [_event.EventType.RoomTopic]: {
    isState: true
  },
  [_event.EventType.RoomTombstone]: {
    isState: true
  },
  [_event.EventType.RoomEncryption]: {
    isState: true
  },
  [_event.EventType.RoomServerAcl]: {
    isState: true
  },
  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  "im.vector.modular.widgets": {
    isState: true
  }
}; // parse a string as an integer; if the input is undefined, or cannot be parsed
// as an integer, return a default.

function parseIntWithDefault(val, def) {
  const res = parseInt(val);
  return isNaN(res) ? def : res;
}

class BannedUser extends _react.default.Component
/*:: <IBannedUserProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onUnbanClick", e => {
      _MatrixClientPeg.MatrixClientPeg.get().unban(this.props.member.roomId, this.props.member.userId).catch(err => {
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
        console.error("Failed to unban: " + err);

        _Modal.default.createTrackedDialog('Failed to unban', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Error'),
          description: (0, _languageHandler._t)('Failed to unban')
        });
      });
    });
  }

  render() {
    let unbanButton;

    if (this.props.canUnban) {
      unbanButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_RolesRoomSettingsTab_unbanBtn",
        kind: "danger_sm",
        onClick: this.onUnbanClick
      }, (0, _languageHandler._t)('Unban'));
    }

    const userId = this.props.member.name === this.props.member.userId ? null : this.props.member.userId;
    return /*#__PURE__*/_react.default.createElement("li", null, unbanButton, /*#__PURE__*/_react.default.createElement("span", {
      title: (0, _languageHandler._t)("Banned by %(displayName)s", {
        displayName: this.props.by
      })
    }, /*#__PURE__*/_react.default.createElement("strong", null, this.props.member.name), " ", userId, this.props.reason ? " " + (0, _languageHandler._t)('Reason') + ": " + this.props.reason : ""));
  }

}

exports.BannedUser = BannedUser;
let RolesRoomSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.room.RolesRoomSettingsTab"), _dec(_class = (_temp = class RolesRoomSettingsTab extends _react.default.Component
/*:: <IProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onRoomMembership", (event
    /*: MatrixEvent*/
    , state
    /*: RoomState*/
    , member
    /*: RoomMember*/
    ) => {
      if (state.roomId !== this.props.roomId) return;
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onPowerLevelsChanged", (inputValue
    /*: string*/
    , powerLevelKey
    /*: string*/
    ) => {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const room = client.getRoom(this.props.roomId);
      const plEvent = room.currentState.getStateEvents('m.room.power_levels', '');
      let plContent = plEvent ? plEvent.getContent() || {} : {}; // Clone the power levels just in case

      plContent = Object.assign({}, plContent);
      const eventsLevelPrefix = "event_levels_";
      const value = parseInt(inputValue);

      if (powerLevelKey.startsWith(eventsLevelPrefix)) {
        // deep copy "events" object, Object.assign itself won't deep copy
        plContent["events"] = Object.assign({}, plContent["events"] || {});
        plContent["events"][powerLevelKey.slice(eventsLevelPrefix.length)] = value;
      } else {
        const keyPath = powerLevelKey.split('.');
        let parentObj;
        let currentObj = plContent;

        for (const key of keyPath) {
          if (!currentObj[key]) {
            currentObj[key] = {};
          }

          parentObj = currentObj;
          currentObj = currentObj[key];
        }

        parentObj[keyPath[keyPath.length - 1]] = value;
      }

      client.sendStateEvent(this.props.roomId, "m.room.power_levels", plContent).catch(e => {
        console.error(e);
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Power level requirement change failed', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Error changing power level requirement'),
          description: (0, _languageHandler._t)("An error occurred changing the room's power level requirements. Ensure you have sufficient " + "permissions and try again.")
        });
      });
    });
    (0, _defineProperty2.default)(this, "onUserPowerLevelChanged", (value
    /*: string*/
    , powerLevelKey
    /*: string*/
    ) => {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const room = client.getRoom(this.props.roomId);
      const plEvent = room.currentState.getStateEvents('m.room.power_levels', '');
      let plContent = plEvent ? plEvent.getContent() || {} : {}; // Clone the power levels just in case

      plContent = Object.assign({}, plContent); // powerLevelKey should be a user ID

      if (!plContent['users']) plContent['users'] = {};
      plContent['users'][powerLevelKey] = value;
      client.sendStateEvent(this.props.roomId, "m.room.power_levels", plContent).catch(e => {
        console.error(e);
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Power level change failed', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Error changing power level'),
          description: (0, _languageHandler._t)("An error occurred changing the user's power level. Ensure you have sufficient " + "permissions and try again.")
        });
      });
    });
  }

  componentDidMount() {
    _MatrixClientPeg.MatrixClientPeg.get().on("RoomState.members", this.onRoomMembership);
  }

  componentWillUnmount() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client) {
      client.removeListener("RoomState.members", this.onRoomMembership);
    }
  }

  populateDefaultPlEvents(eventsSection
  /*: Record<string, number>*/
  , stateLevel
  /*: number*/
  , eventsLevel
  /*: number*/
  ) {
    for (const desiredEvent of Object.keys(plEventsToShow)) {
      if (!(desiredEvent in eventsSection)) {
        eventsSection[desiredEvent] = plEventsToShow[desiredEvent].isState ? stateLevel : eventsLevel;
      }
    }
  }

  render() {
    const PowerSelector = sdk.getComponent('elements.PowerSelector');

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(this.props.roomId);
    const plEvent = room.currentState.getStateEvents('m.room.power_levels', '');
    const plContent = plEvent ? plEvent.getContent() || {} : {};
    const canChangeLevels = room.currentState.mayClientSendStateEvent('m.room.power_levels', client);
    const powerLevelDescriptors = {
      "users_default": {
        desc: (0, _languageHandler._t)('Default role'),
        defaultValue: 0
      },
      "events_default": {
        desc: (0, _languageHandler._t)('Send messages'),
        defaultValue: 0
      },
      "invite": {
        desc: (0, _languageHandler._t)('Invite users'),
        defaultValue: 50
      },
      "state_default": {
        desc: (0, _languageHandler._t)('Change settings'),
        defaultValue: 50
      },
      "kick": {
        desc: (0, _languageHandler._t)('Kick users'),
        defaultValue: 50
      },
      "ban": {
        desc: (0, _languageHandler._t)('Ban users'),
        defaultValue: 50
      },
      "redact": {
        desc: (0, _languageHandler._t)('Remove messages sent by others'),
        defaultValue: 50
      },
      "notifications.room": {
        desc: (0, _languageHandler._t)('Notify everyone'),
        defaultValue: 50
      }
    };
    const eventsLevels = plContent.events || {};
    const userLevels = plContent.users || {};
    const banLevel = parseIntWithDefault(plContent.ban, powerLevelDescriptors.ban.defaultValue);
    const defaultUserLevel = parseIntWithDefault(plContent.users_default, powerLevelDescriptors.users_default.defaultValue);
    let currentUserLevel = userLevels[client.getUserId()];

    if (currentUserLevel === undefined) {
      currentUserLevel = defaultUserLevel;
    }

    this.populateDefaultPlEvents(eventsLevels, parseIntWithDefault(plContent.state_default, powerLevelDescriptors.state_default.defaultValue), parseIntWithDefault(plContent.events_default, powerLevelDescriptors.events_default.defaultValue));

    let privilegedUsersSection = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('No users have specific privileges in this room'));

    let mutedUsersSection;

    if (Object.keys(userLevels).length) {
      const privilegedUsers = [];
      const mutedUsers = [];
      Object.keys(userLevels).forEach(user => {
        const canChange = userLevels[user] < currentUserLevel && canChangeLevels;

        if (userLevels[user] > defaultUserLevel) {
          // privileged
          privilegedUsers.push( /*#__PURE__*/_react.default.createElement(PowerSelector, {
            value: userLevels[user],
            disabled: !canChange,
            label: user,
            key: user,
            powerLevelKey: user // Will be sent as the second parameter to `onChange`
            ,
            onChange: this.onUserPowerLevelChanged
          }));
        } else if (userLevels[user] < defaultUserLevel) {
          // muted
          mutedUsers.push( /*#__PURE__*/_react.default.createElement(PowerSelector, {
            value: userLevels[user],
            disabled: !canChange,
            label: user,
            key: user,
            powerLevelKey: user // Will be sent as the second parameter to `onChange`
            ,
            onChange: this.onUserPowerLevelChanged
          }));
        }
      }); // comparator for sorting PL users lexicographically on PL descending, MXID ascending. (case-insensitive)

      const comparator = (a, b) => {
        const plDiff = userLevels[b.key] - userLevels[a.key];
        return plDiff !== 0 ? plDiff : a.key.toLocaleLowerCase().localeCompare(b.key.toLocaleLowerCase());
      };

      privilegedUsers.sort(comparator);
      mutedUsers.sort(comparator);

      if (privilegedUsers.length) {
        privilegedUsersSection = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SettingsTab_subheading"
        }, (0, _languageHandler._t)('Privileged Users')), privilegedUsers);
      }

      if (mutedUsers.length) {
        mutedUsersSection = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SettingsTab_subheading"
        }, (0, _languageHandler._t)('Muted Users')), mutedUsers);
      }
    }

    const banned = room.getMembersWithMembership("ban");
    let bannedUsersSection;

    if (banned.length) {
      const canBanUsers = currentUserLevel >= banLevel;
      bannedUsersSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subheading"
      }, (0, _languageHandler._t)('Banned users')), /*#__PURE__*/_react.default.createElement("ul", null, banned.map(member => {
        const banEvent = member.events.member.getContent();
        const sender = room.getMember(member.events.member.getSender());
        let bannedBy = member.events.member.getSender(); // start by falling back to mxid

        if (sender) bannedBy = sender.name;
        return /*#__PURE__*/_react.default.createElement(BannedUser, {
          key: member.userId,
          canUnban: canBanUsers,
          member: member,
          reason: banEvent.reason,
          by: bannedBy
        });
      })));
    }

    const powerSelectors = Object.keys(powerLevelDescriptors).map((key, index) => {
      const descriptor = powerLevelDescriptors[key];
      const keyPath = key.split('.');
      let currentObj = plContent;

      for (const prop of keyPath) {
        if (currentObj === undefined) {
          break;
        }

        currentObj = currentObj[prop];
      }

      const value = parseIntWithDefault(currentObj, descriptor.defaultValue);
      return /*#__PURE__*/_react.default.createElement("div", {
        key: index,
        className: ""
      }, /*#__PURE__*/_react.default.createElement(PowerSelector, {
        label: descriptor.desc,
        value: value,
        usersDefault: defaultUserLevel,
        disabled: !canChangeLevels || currentUserLevel < value,
        powerLevelKey: key // Will be sent as the second parameter to `onChange`
        ,
        onChange: this.onPowerLevelsChanged
      }));
    }); // hide the power level selector for enabling E2EE if it the room is already encrypted

    if (client.isRoomEncrypted(this.props.roomId)) {
      delete eventsLevels["m.room.encryption"];
    }

    const eventPowerSelectors = Object.keys(eventsLevels).map((eventType, i) => {
      let label = plEventsToLabels[eventType];

      if (label) {
        label = (0, _languageHandler._t)(label);
      } else {
        label = (0, _languageHandler._t)("Send %(eventType)s events", {
          eventType
        });
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "",
        key: eventType
      }, /*#__PURE__*/_react.default.createElement(PowerSelector, {
        label: label,
        value: eventsLevels[eventType],
        usersDefault: defaultUserLevel,
        disabled: !canChangeLevels || currentUserLevel < eventsLevels[eventType],
        powerLevelKey: "event_levels_" + eventType,
        onChange: this.onPowerLevelsChanged
      }));
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_RolesRoomSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Roles & Permissions")), privilegedUsersSection, mutedUsersSection, bannedUsersSection, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Permissions")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('Select the roles required to change various parts of the room')), powerSelectors, eventPowerSelectors));
  }

}, _temp)) || _class);
exports.default = RolesRoomSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9Sb2xlc1Jvb21TZXR0aW5nc1RhYi50c3giXSwibmFtZXMiOlsicGxFdmVudHNUb0xhYmVscyIsIkV2ZW50VHlwZSIsIlJvb21BdmF0YXIiLCJSb29tTmFtZSIsIlJvb21DYW5vbmljYWxBbGlhcyIsIlJvb21IaXN0b3J5VmlzaWJpbGl0eSIsIlJvb21Qb3dlckxldmVscyIsIlJvb21Ub3BpYyIsIlJvb21Ub21ic3RvbmUiLCJSb29tRW5jcnlwdGlvbiIsIlJvb21TZXJ2ZXJBY2wiLCJwbEV2ZW50c1RvU2hvdyIsImlzU3RhdGUiLCJwYXJzZUludFdpdGhEZWZhdWx0IiwidmFsIiwiZGVmIiwicmVzIiwicGFyc2VJbnQiLCJpc05hTiIsIkJhbm5lZFVzZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJ1bmJhbiIsInByb3BzIiwibWVtYmVyIiwicm9vbUlkIiwidXNlcklkIiwiY2F0Y2giLCJlcnIiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsImNvbnNvbGUiLCJlcnJvciIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJyZW5kZXIiLCJ1bmJhbkJ1dHRvbiIsImNhblVuYmFuIiwib25VbmJhbkNsaWNrIiwibmFtZSIsImRpc3BsYXlOYW1lIiwiYnkiLCJyZWFzb24iLCJSb2xlc1Jvb21TZXR0aW5nc1RhYiIsImV2ZW50Iiwic3RhdGUiLCJmb3JjZVVwZGF0ZSIsImlucHV0VmFsdWUiLCJwb3dlckxldmVsS2V5IiwiY2xpZW50Iiwicm9vbSIsImdldFJvb20iLCJwbEV2ZW50IiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJwbENvbnRlbnQiLCJnZXRDb250ZW50IiwiT2JqZWN0IiwiYXNzaWduIiwiZXZlbnRzTGV2ZWxQcmVmaXgiLCJ2YWx1ZSIsInN0YXJ0c1dpdGgiLCJzbGljZSIsImxlbmd0aCIsImtleVBhdGgiLCJzcGxpdCIsInBhcmVudE9iaiIsImN1cnJlbnRPYmoiLCJrZXkiLCJzZW5kU3RhdGVFdmVudCIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJvblJvb21NZW1iZXJzaGlwIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsInBvcHVsYXRlRGVmYXVsdFBsRXZlbnRzIiwiZXZlbnRzU2VjdGlvbiIsInN0YXRlTGV2ZWwiLCJldmVudHNMZXZlbCIsImRlc2lyZWRFdmVudCIsImtleXMiLCJQb3dlclNlbGVjdG9yIiwiY2FuQ2hhbmdlTGV2ZWxzIiwibWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQiLCJwb3dlckxldmVsRGVzY3JpcHRvcnMiLCJkZXNjIiwiZGVmYXVsdFZhbHVlIiwiZXZlbnRzTGV2ZWxzIiwiZXZlbnRzIiwidXNlckxldmVscyIsInVzZXJzIiwiYmFuTGV2ZWwiLCJiYW4iLCJkZWZhdWx0VXNlckxldmVsIiwidXNlcnNfZGVmYXVsdCIsImN1cnJlbnRVc2VyTGV2ZWwiLCJnZXRVc2VySWQiLCJ1bmRlZmluZWQiLCJzdGF0ZV9kZWZhdWx0IiwiZXZlbnRzX2RlZmF1bHQiLCJwcml2aWxlZ2VkVXNlcnNTZWN0aW9uIiwibXV0ZWRVc2Vyc1NlY3Rpb24iLCJwcml2aWxlZ2VkVXNlcnMiLCJtdXRlZFVzZXJzIiwiZm9yRWFjaCIsInVzZXIiLCJjYW5DaGFuZ2UiLCJwdXNoIiwib25Vc2VyUG93ZXJMZXZlbENoYW5nZWQiLCJjb21wYXJhdG9yIiwiYSIsImIiLCJwbERpZmYiLCJ0b0xvY2FsZUxvd2VyQ2FzZSIsImxvY2FsZUNvbXBhcmUiLCJzb3J0IiwiYmFubmVkIiwiZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwIiwiYmFubmVkVXNlcnNTZWN0aW9uIiwiY2FuQmFuVXNlcnMiLCJtYXAiLCJiYW5FdmVudCIsInNlbmRlciIsImdldE1lbWJlciIsImdldFNlbmRlciIsImJhbm5lZEJ5IiwicG93ZXJTZWxlY3RvcnMiLCJpbmRleCIsImRlc2NyaXB0b3IiLCJwcm9wIiwib25Qb3dlckxldmVsc0NoYW5nZWQiLCJpc1Jvb21FbmNyeXB0ZWQiLCJldmVudFBvd2VyU2VsZWN0b3JzIiwiZXZlbnRUeXBlIiwiaSIsImxhYmVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBS0EsTUFBTUEsZ0JBQWdCLEdBQUc7QUFDckI7QUFDQSxHQUFDQyxpQkFBVUMsVUFBWCxHQUF3QiwwQkFBSSxvQkFBSixDQUZIO0FBR3JCLEdBQUNELGlCQUFVRSxRQUFYLEdBQXNCLDBCQUFJLGtCQUFKLENBSEQ7QUFJckIsR0FBQ0YsaUJBQVVHLGtCQUFYLEdBQWdDLDBCQUFJLGtDQUFKLENBSlg7QUFLckIsR0FBQ0gsaUJBQVVJLHFCQUFYLEdBQW1DLDBCQUFJLDJCQUFKLENBTGQ7QUFNckIsR0FBQ0osaUJBQVVLLGVBQVgsR0FBNkIsMEJBQUksb0JBQUosQ0FOUjtBQU9yQixHQUFDTCxpQkFBVU0sU0FBWCxHQUF1QiwwQkFBSSxjQUFKLENBUEY7QUFRckIsR0FBQ04saUJBQVVPLGFBQVgsR0FBMkIsMEJBQUksa0JBQUosQ0FSTjtBQVNyQixHQUFDUCxpQkFBVVEsY0FBWCxHQUE0QiwwQkFBSSx3QkFBSixDQVRQO0FBVXJCLEdBQUNSLGlCQUFVUyxhQUFYLEdBQTJCLDBCQUFJLG9CQUFKLENBVk47QUFZckI7QUFDQSwrQkFBNkIsMEJBQUksZ0JBQUo7QUFiUixDQUF6QjtBQWdCQSxNQUFNQyxjQUFjLEdBQUc7QUFDbkI7QUFDQSxHQUFDVixpQkFBVUMsVUFBWCxHQUF3QjtBQUFDVSxJQUFBQSxPQUFPLEVBQUU7QUFBVixHQUZMO0FBR25CLEdBQUNYLGlCQUFVRSxRQUFYLEdBQXNCO0FBQUNTLElBQUFBLE9BQU8sRUFBRTtBQUFWLEdBSEg7QUFJbkIsR0FBQ1gsaUJBQVVHLGtCQUFYLEdBQWdDO0FBQUNRLElBQUFB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RUFBRUE7QUFBdkIsc0JBQ0ksNkJBQUMsYUFBRDtBQUNJLFFBQUEsS0FBSyxFQUFFRSxLQURYO0FBRUksUUFBQSxLQUFLLEVBQUVoRCxZQUFZLENBQUM4QyxTQUFELENBRnZCO0FBR0ksUUFBQSxZQUFZLEVBQUV4QyxnQkFIbEI7QUFJSSxRQUFBLFFBQVEsRUFBRSxDQUFDWCxlQUFELElBQW9CYSxnQkFBZ0IsR0FBR1IsWUFBWSxDQUFDOEMsU0FBRCxDQUpqRTtBQUtJLFFBQUEsYUFBYSxFQUFFLGtCQUFrQkEsU0FMckM7QUFNSSxRQUFBLFFBQVEsRUFBRSxLQUFLSDtBQU5uQixRQURKLENBREo7QUFZSCxLQW5CMkIsQ0FBNUI7QUFxQkEsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUF5Qyx5QkFBRyxxQkFBSCxDQUF6QyxDQURKLEVBRUs5QixzQkFGTCxFQUdLQyxpQkFITCxFQUlLaUIsa0JBSkwsZUFLSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixPQUE2Qyx5QkFBRyxhQUFILENBQTdDLENBREosZUFFSSx3Q0FBSSx5QkFBRywrREFBSCxDQUFKLENBRkosRUFHS1EsY0FITCxFQUlLTSxtQkFKTCxDQUxKLENBREo7QUFjSDs7QUFuVHFFLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTktMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge190LCBfdGR9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uLy4uLy4uXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5pbXBvcnQge0V2ZW50VHlwZX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbVN0YXRlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLXN0YXRlXCI7XG5cbmNvbnN0IHBsRXZlbnRzVG9MYWJlbHMgPSB7XG4gICAgLy8gVGhlc2Ugd2lsbCBiZSB0cmFuc2xhdGVkIGZvciB1cyBsYXRlci5cbiAgICBbRXZlbnRUeXBlLlJvb21BdmF0YXJdOiBfdGQoXCJDaGFuZ2Ugcm9vbSBhdmF0YXJcIiksXG4gICAgW0V2ZW50VHlwZS5Sb29tTmFtZV06IF90ZChcIkNoYW5nZSByb29tIG5hbWVcIiksXG4gICAgW0V2ZW50VHlwZS5Sb29tQ2Fub25pY2FsQWxpYXNdOiBfdGQoXCJDaGFuZ2UgbWFpbiBhZGRyZXNzIGZvciB0aGUgcm9vbVwiKSxcbiAgICBbRXZlbnRUeXBlLlJvb21IaXN0b3J5VmlzaWJpbGl0eV06IF90ZChcIkNoYW5nZSBoaXN0b3J5IHZpc2liaWxpdHlcIiksXG4gICAgW0V2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHNdOiBfdGQoXCJDaGFuZ2UgcGVybWlzc2lvbnNcIiksXG4gICAgW0V2ZW50VHlwZS5Sb29tVG9waWNdOiBfdGQoXCJDaGFuZ2UgdG9waWNcIiksXG4gICAgW0V2ZW50VHlwZS5Sb29tVG9tYnN0b25lXTogX3RkKFwiVXBncmFkZSB0aGUgcm9vbVwiKSxcbiAgICBbRXZlbnRUeXBlLlJvb21FbmNyeXB0aW9uXTogX3RkKFwiRW5hYmxlIHJvb20gZW5jcnlwdGlvblwiKSxcbiAgICBbRXZlbnRUeXBlLlJvb21TZXJ2ZXJBY2xdOiBfdGQoXCJDaGFuZ2Ugc2VydmVyIEFDTHNcIiksXG5cbiAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgXCJpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzXCI6IF90ZChcIk1vZGlmeSB3aWRnZXRzXCIpLFxufTtcblxuY29uc3QgcGxFdmVudHNUb1Nob3cgPSB7XG4gICAgLy8gSWYgYW4gZXZlbnQgaXMgbGlzdGVkIGhlcmUsIGl0IHdpbGwgYmUgc2hvd24gaW4gdGhlIFBMIHNldHRpbmdzLiBEZWZhdWx0cyB3aWxsIGJlIGNhbGN1bGF0ZWQuXG4gICAgW0V2ZW50VHlwZS5Sb29tQXZhdGFyXToge2lzU3RhdGU6IHRydWV9LFxuICAgIFtFdmVudFR5cGUuUm9vbU5hbWVdOiB7aXNTdGF0ZTogdHJ1ZX0sXG4gICAgW0V2ZW50VHlwZS5Sb29tQ2Fub25pY2FsQWxpYXNdOiB7aXNTdGF0ZTogdHJ1ZX0sXG4gICAgW0V2ZW50VHlwZS5Sb29tSGlzdG9yeVZpc2liaWxpdHldOiB7aXNTdGF0ZTogdHJ1ZX0sXG4gICAgW0V2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHNdOiB7aXNTdGF0ZTogdHJ1ZX0sXG4gICAgW0V2ZW50VHlwZS5Sb29tVG9waWNdOiB7aXNTdGF0ZTogdHJ1ZX0sXG4gICAgW0V2ZW50VHlwZS5Sb29tVG9tYnN0b25lXToge2lzU3RhdGU6IHRydWV9LFxuICAgIFtFdmVudFR5cGUuUm9vbUVuY3J5cHRpb25dOiB7aXNTdGF0ZTogdHJ1ZX0sXG4gICAgW0V2ZW50VHlwZS5Sb29tU2VydmVyQWNsXToge2lzU3RhdGU6IHRydWV9LFxuXG4gICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgIFwiaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0c1wiOiB7aXNTdGF0ZTogdHJ1ZX0sXG59O1xuXG4vLyBwYXJzZSBhIHN0cmluZyBhcyBhbiBpbnRlZ2VyOyBpZiB0aGUgaW5wdXQgaXMgdW5kZWZpbmVkLCBvciBjYW5ub3QgYmUgcGFyc2VkXG4vLyBhcyBhbiBpbnRlZ2VyLCByZXR1cm4gYSBkZWZhdWx0LlxuZnVuY3Rpb24gcGFyc2VJbnRXaXRoRGVmYXVsdCh2YWwsIGRlZikge1xuICAgIGNvbnN0IHJlcyA9IHBhcnNlSW50KHZhbCk7XG4gICAgcmV0dXJuIGlzTmFOKHJlcykgPyBkZWYgOiByZXM7XG59XG5cbmludGVyZmFjZSBJQmFubmVkVXNlclByb3BzIHtcbiAgICBjYW5VbmJhbj86IGJvb2xlYW47XG4gICAgbWVtYmVyOiBSb29tTWVtYmVyO1xuICAgIGJ5OiBzdHJpbmc7XG4gICAgcmVhc29uPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQmFubmVkVXNlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJQmFubmVkVXNlclByb3BzPiB7XG4gICAgcHJpdmF0ZSBvblVuYmFuQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudW5iYW4odGhpcy5wcm9wcy5tZW1iZXIucm9vbUlkLCB0aGlzLnByb3BzLm1lbWJlci51c2VySWQpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHVuYmFuOiBcIiArIGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gdW5iYW4nLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdGYWlsZWQgdG8gdW5iYW4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgdW5iYW5CdXR0b247XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY2FuVW5iYW4pIHtcbiAgICAgICAgICAgIHVuYmFuQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT0nbXhfUm9sZXNSb29tU2V0dGluZ3NUYWJfdW5iYW5CdG4nXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9J2Rhbmdlcl9zbSdcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblVuYmFuQ2xpY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdVbmJhbicpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5wcm9wcy5tZW1iZXIubmFtZSA9PT0gdGhpcy5wcm9wcy5tZW1iZXIudXNlcklkID8gbnVsbCA6IHRoaXMucHJvcHMubWVtYmVyLnVzZXJJZDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICB7dW5iYW5CdXR0b259XG4gICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9e190KFwiQmFubmVkIGJ5ICUoZGlzcGxheU5hbWUpc1wiLCB7ZGlzcGxheU5hbWU6IHRoaXMucHJvcHMuYnl9KX0+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+eyB0aGlzLnByb3BzLm1lbWJlci5uYW1lIH08L3N0cm9uZz4ge3VzZXJJZH1cbiAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMucmVhc29uID8gXCIgXCIgKyBfdCgnUmVhc29uJykgKyBcIjogXCIgKyB0aGlzLnByb3BzLnJlYXNvbiA6IFwiXCJ9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21JZDogc3RyaW5nO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy50YWJzLnJvb20uUm9sZXNSb29tU2V0dGluZ3NUYWJcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvbGVzUm9vbVNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tU3RhdGUubWVtYmVyc1wiLCB0aGlzLm9uUm9vbU1lbWJlcnNoaXApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmIChjbGllbnQpIHtcbiAgICAgICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihcIlJvb21TdGF0ZS5tZW1iZXJzXCIsIHRoaXMub25Sb29tTWVtYmVyc2hpcCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUm9vbU1lbWJlcnNoaXAgPSAoZXZlbnQ6IE1hdHJpeEV2ZW50LCBzdGF0ZTogUm9vbVN0YXRlLCBtZW1iZXI6IFJvb21NZW1iZXIpID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLnJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tSWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHBvcHVsYXRlRGVmYXVsdFBsRXZlbnRzKGV2ZW50c1NlY3Rpb246IFJlY29yZDxzdHJpbmcsIG51bWJlcj4sIHN0YXRlTGV2ZWw6IG51bWJlciwgZXZlbnRzTGV2ZWw6IG51bWJlcikge1xuICAgICAgICBmb3IgKGNvbnN0IGRlc2lyZWRFdmVudCBvZiBPYmplY3Qua2V5cyhwbEV2ZW50c1RvU2hvdykpIHtcbiAgICAgICAgICAgIGlmICghKGRlc2lyZWRFdmVudCBpbiBldmVudHNTZWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGV2ZW50c1NlY3Rpb25bZGVzaXJlZEV2ZW50XSA9IChwbEV2ZW50c1RvU2hvd1tkZXNpcmVkRXZlbnRdLmlzU3RhdGUgPyBzdGF0ZUxldmVsIDogZXZlbnRzTGV2ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblBvd2VyTGV2ZWxzQ2hhbmdlZCA9IChpbnB1dFZhbHVlOiBzdHJpbmcsIHBvd2VyTGV2ZWxLZXk6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IHBsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnBvd2VyX2xldmVscycsICcnKTtcbiAgICAgICAgbGV0IHBsQ29udGVudCA9IHBsRXZlbnQgPyAocGxFdmVudC5nZXRDb250ZW50KCkgfHwge30pIDoge307XG5cbiAgICAgICAgLy8gQ2xvbmUgdGhlIHBvd2VyIGxldmVscyBqdXN0IGluIGNhc2VcbiAgICAgICAgcGxDb250ZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgcGxDb250ZW50KTtcblxuICAgICAgICBjb25zdCBldmVudHNMZXZlbFByZWZpeCA9IFwiZXZlbnRfbGV2ZWxzX1wiO1xuXG4gICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VJbnQoaW5wdXRWYWx1ZSk7XG5cbiAgICAgICAgaWYgKHBvd2VyTGV2ZWxLZXkuc3RhcnRzV2l0aChldmVudHNMZXZlbFByZWZpeCkpIHtcbiAgICAgICAgICAgIC8vIGRlZXAgY29weSBcImV2ZW50c1wiIG9iamVjdCwgT2JqZWN0LmFzc2lnbiBpdHNlbGYgd29uJ3QgZGVlcCBjb3B5XG4gICAgICAgICAgICBwbENvbnRlbnRbXCJldmVudHNcIl0gPSBPYmplY3QuYXNzaWduKHt9LCBwbENvbnRlbnRbXCJldmVudHNcIl0gfHwge30pO1xuICAgICAgICAgICAgcGxDb250ZW50W1wiZXZlbnRzXCJdW3Bvd2VyTGV2ZWxLZXkuc2xpY2UoZXZlbnRzTGV2ZWxQcmVmaXgubGVuZ3RoKV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGtleVBhdGggPSBwb3dlckxldmVsS2V5LnNwbGl0KCcuJyk7XG4gICAgICAgICAgICBsZXQgcGFyZW50T2JqO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRPYmogPSBwbENvbnRlbnQ7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlQYXRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50T2JqW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE9ialtrZXldID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhcmVudE9iaiA9IGN1cnJlbnRPYmo7XG4gICAgICAgICAgICAgICAgY3VycmVudE9iaiA9IGN1cnJlbnRPYmpba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmVudE9ialtrZXlQYXRoW2tleVBhdGgubGVuZ3RoIC0gMV1dID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBjbGllbnQuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBwbENvbnRlbnQpLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcblxuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1Bvd2VyIGxldmVsIHJlcXVpcmVtZW50IGNoYW5nZSBmYWlsZWQnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIGNoYW5naW5nIHBvd2VyIGxldmVsIHJlcXVpcmVtZW50JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkFuIGVycm9yIG9jY3VycmVkIGNoYW5naW5nIHRoZSByb29tJ3MgcG93ZXIgbGV2ZWwgcmVxdWlyZW1lbnRzLiBFbnN1cmUgeW91IGhhdmUgc3VmZmljaWVudCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwicGVybWlzc2lvbnMgYW5kIHRyeSBhZ2Fpbi5cIixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlclBvd2VyTGV2ZWxDaGFuZ2VkID0gKHZhbHVlOiBzdHJpbmcsIHBvd2VyTGV2ZWxLZXk6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IHBsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnBvd2VyX2xldmVscycsICcnKTtcbiAgICAgICAgbGV0IHBsQ29udGVudCA9IHBsRXZlbnQgPyAocGxFdmVudC5nZXRDb250ZW50KCkgfHwge30pIDoge307XG5cbiAgICAgICAgLy8gQ2xvbmUgdGhlIHBvd2VyIGxldmVscyBqdXN0IGluIGNhc2VcbiAgICAgICAgcGxDb250ZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgcGxDb250ZW50KTtcblxuICAgICAgICAvLyBwb3dlckxldmVsS2V5IHNob3VsZCBiZSBhIHVzZXIgSURcbiAgICAgICAgaWYgKCFwbENvbnRlbnRbJ3VzZXJzJ10pIHBsQ29udGVudFsndXNlcnMnXSA9IHt9O1xuICAgICAgICBwbENvbnRlbnRbJ3VzZXJzJ11bcG93ZXJMZXZlbEtleV0gPSB2YWx1ZTtcblxuICAgICAgICBjbGllbnQuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBwbENvbnRlbnQpLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcblxuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1Bvd2VyIGxldmVsIGNoYW5nZSBmYWlsZWQnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIGNoYW5naW5nIHBvd2VyIGxldmVsJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkFuIGVycm9yIG9jY3VycmVkIGNoYW5naW5nIHRoZSB1c2VyJ3MgcG93ZXIgbGV2ZWwuIEVuc3VyZSB5b3UgaGF2ZSBzdWZmaWNpZW50IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJwZXJtaXNzaW9ucyBhbmQgdHJ5IGFnYWluLlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgUG93ZXJTZWxlY3RvciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlBvd2VyU2VsZWN0b3InKTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IHBsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnBvd2VyX2xldmVscycsICcnKTtcbiAgICAgICAgY29uc3QgcGxDb250ZW50ID0gcGxFdmVudCA/IChwbEV2ZW50LmdldENvbnRlbnQoKSB8fCB7fSkgOiB7fTtcbiAgICAgICAgY29uc3QgY2FuQ2hhbmdlTGV2ZWxzID0gcm9vbS5jdXJyZW50U3RhdGUubWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQoJ20ucm9vbS5wb3dlcl9sZXZlbHMnLCBjbGllbnQpO1xuXG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxEZXNjcmlwdG9ycyA9IHtcbiAgICAgICAgICAgIFwidXNlcnNfZGVmYXVsdFwiOiB7XG4gICAgICAgICAgICAgICAgZGVzYzogX3QoJ0RlZmF1bHQgcm9sZScpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImV2ZW50c19kZWZhdWx0XCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnU2VuZCBtZXNzYWdlcycpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImludml0ZVwiOiB7XG4gICAgICAgICAgICAgICAgZGVzYzogX3QoJ0ludml0ZSB1c2VycycpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogNTAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzdGF0ZV9kZWZhdWx0XCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnQ2hhbmdlIHNldHRpbmdzJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiA1MCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImtpY2tcIjoge1xuICAgICAgICAgICAgICAgIGRlc2M6IF90KCdLaWNrIHVzZXJzJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiA1MCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImJhblwiOiB7XG4gICAgICAgICAgICAgICAgZGVzYzogX3QoJ0JhbiB1c2VycycpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogNTAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJyZWRhY3RcIjoge1xuICAgICAgICAgICAgICAgIGRlc2M6IF90KCdSZW1vdmUgbWVzc2FnZXMgc2VudCBieSBvdGhlcnMnKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDUwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwibm90aWZpY2F0aW9ucy5yb29tXCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnTm90aWZ5IGV2ZXJ5b25lJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiA1MCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZXZlbnRzTGV2ZWxzID0gcGxDb250ZW50LmV2ZW50cyB8fCB7fTtcbiAgICAgICAgY29uc3QgdXNlckxldmVscyA9IHBsQ29udGVudC51c2VycyB8fCB7fTtcbiAgICAgICAgY29uc3QgYmFuTGV2ZWwgPSBwYXJzZUludFdpdGhEZWZhdWx0KHBsQ29udGVudC5iYW4sIHBvd2VyTGV2ZWxEZXNjcmlwdG9ycy5iYW4uZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgY29uc3QgZGVmYXVsdFVzZXJMZXZlbCA9IHBhcnNlSW50V2l0aERlZmF1bHQoXG4gICAgICAgICAgICBwbENvbnRlbnQudXNlcnNfZGVmYXVsdCxcbiAgICAgICAgICAgIHBvd2VyTGV2ZWxEZXNjcmlwdG9ycy51c2Vyc19kZWZhdWx0LmRlZmF1bHRWYWx1ZSxcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgY3VycmVudFVzZXJMZXZlbCA9IHVzZXJMZXZlbHNbY2xpZW50LmdldFVzZXJJZCgpXTtcbiAgICAgICAgaWYgKGN1cnJlbnRVc2VyTGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY3VycmVudFVzZXJMZXZlbCA9IGRlZmF1bHRVc2VyTGV2ZWw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBvcHVsYXRlRGVmYXVsdFBsRXZlbnRzKFxuICAgICAgICAgICAgZXZlbnRzTGV2ZWxzLFxuICAgICAgICAgICAgcGFyc2VJbnRXaXRoRGVmYXVsdChwbENvbnRlbnQuc3RhdGVfZGVmYXVsdCwgcG93ZXJMZXZlbERlc2NyaXB0b3JzLnN0YXRlX2RlZmF1bHQuZGVmYXVsdFZhbHVlKSxcbiAgICAgICAgICAgIHBhcnNlSW50V2l0aERlZmF1bHQocGxDb250ZW50LmV2ZW50c19kZWZhdWx0LCBwb3dlckxldmVsRGVzY3JpcHRvcnMuZXZlbnRzX2RlZmF1bHQuZGVmYXVsdFZhbHVlKSxcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgcHJpdmlsZWdlZFVzZXJzU2VjdGlvbiA9IDxkaXY+e190KCdObyB1c2VycyBoYXZlIHNwZWNpZmljIHByaXZpbGVnZXMgaW4gdGhpcyByb29tJyl9PC9kaXY+O1xuICAgICAgICBsZXQgbXV0ZWRVc2Vyc1NlY3Rpb247XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh1c2VyTGV2ZWxzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IHByaXZpbGVnZWRVc2VycyA9IFtdO1xuICAgICAgICAgICAgY29uc3QgbXV0ZWRVc2VycyA9IFtdO1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyh1c2VyTGV2ZWxzKS5mb3JFYWNoKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuQ2hhbmdlID0gdXNlckxldmVsc1t1c2VyXSA8IGN1cnJlbnRVc2VyTGV2ZWwgJiYgY2FuQ2hhbmdlTGV2ZWxzO1xuICAgICAgICAgICAgICAgIGlmICh1c2VyTGV2ZWxzW3VzZXJdID4gZGVmYXVsdFVzZXJMZXZlbCkgeyAvLyBwcml2aWxlZ2VkXG4gICAgICAgICAgICAgICAgICAgIHByaXZpbGVnZWRVc2Vycy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFBvd2VyU2VsZWN0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dXNlckxldmVsc1t1c2VyXX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWNhbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17dXNlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3VzZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG93ZXJMZXZlbEtleT17dXNlcn0gLy8gV2lsbCBiZSBzZW50IGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIGBvbkNoYW5nZWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVzZXJQb3dlckxldmVsQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXNlckxldmVsc1t1c2VyXSA8IGRlZmF1bHRVc2VyTGV2ZWwpIHsgLy8gbXV0ZWRcbiAgICAgICAgICAgICAgICAgICAgbXV0ZWRVc2Vycy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFBvd2VyU2VsZWN0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dXNlckxldmVsc1t1c2VyXX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWNhbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17dXNlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3VzZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG93ZXJMZXZlbEtleT17dXNlcn0gLy8gV2lsbCBiZSBzZW50IGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIGBvbkNoYW5nZWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVzZXJQb3dlckxldmVsQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBjb21wYXJhdG9yIGZvciBzb3J0aW5nIFBMIHVzZXJzIGxleGljb2dyYXBoaWNhbGx5IG9uIFBMIGRlc2NlbmRpbmcsIE1YSUQgYXNjZW5kaW5nLiAoY2FzZS1pbnNlbnNpdGl2ZSlcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmF0b3IgPSAoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsRGlmZiA9IHVzZXJMZXZlbHNbYi5rZXldIC0gdXNlckxldmVsc1thLmtleV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBsRGlmZiAhPT0gMCA/IHBsRGlmZiA6IGEua2V5LnRvTG9jYWxlTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLmtleS50b0xvY2FsZUxvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHByaXZpbGVnZWRVc2Vycy5zb3J0KGNvbXBhcmF0b3IpO1xuICAgICAgICAgICAgbXV0ZWRVc2Vycy5zb3J0KGNvbXBhcmF0b3IpO1xuXG4gICAgICAgICAgICBpZiAocHJpdmlsZWdlZFVzZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHByaXZpbGVnZWRVc2Vyc1NlY3Rpb24gPVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+eyBfdCgnUHJpdmlsZWdlZCBVc2VycycpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwcml2aWxlZ2VkVXNlcnN9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtdXRlZFVzZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG11dGVkVXNlcnNTZWN0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPnsgX3QoJ011dGVkIFVzZXJzJykgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge211dGVkVXNlcnN9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJhbm5lZCA9IHJvb20uZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwKFwiYmFuXCIpO1xuICAgICAgICBsZXQgYmFubmVkVXNlcnNTZWN0aW9uO1xuICAgICAgICBpZiAoYmFubmVkLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgY2FuQmFuVXNlcnMgPSBjdXJyZW50VXNlckxldmVsID49IGJhbkxldmVsO1xuICAgICAgICAgICAgYmFubmVkVXNlcnNTZWN0aW9uID1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57IF90KCdCYW5uZWQgdXNlcnMnKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtiYW5uZWQubWFwKChtZW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiYW5FdmVudCA9IG1lbWJlci5ldmVudHMubWVtYmVyLmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZW5kZXIgPSByb29tLmdldE1lbWJlcihtZW1iZXIuZXZlbnRzLm1lbWJlci5nZXRTZW5kZXIoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJhbm5lZEJ5ID0gbWVtYmVyLmV2ZW50cy5tZW1iZXIuZ2V0U2VuZGVyKCk7IC8vIHN0YXJ0IGJ5IGZhbGxpbmcgYmFjayB0byBteGlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbmRlcikgYmFubmVkQnkgPSBzZW5kZXIubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QmFubmVkVXNlciBrZXk9e21lbWJlci51c2VySWR9IGNhblVuYmFuPXtjYW5CYW5Vc2Vyc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyfSByZWFzb249e2JhbkV2ZW50LnJlYXNvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5PXtiYW5uZWRCeX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcG93ZXJTZWxlY3RvcnMgPSBPYmplY3Qua2V5cyhwb3dlckxldmVsRGVzY3JpcHRvcnMpLm1hcCgoa2V5LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRvciA9IHBvd2VyTGV2ZWxEZXNjcmlwdG9yc1trZXldO1xuXG4gICAgICAgICAgICBjb25zdCBrZXlQYXRoID0ga2V5LnNwbGl0KCcuJyk7XG4gICAgICAgICAgICBsZXQgY3VycmVudE9iaiA9IHBsQ29udGVudDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBrZXlQYXRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRPYmogPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VycmVudE9iaiA9IGN1cnJlbnRPYmpbcHJvcF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VJbnRXaXRoRGVmYXVsdChjdXJyZW50T2JqLCBkZXNjcmlwdG9yLmRlZmF1bHRWYWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gPGRpdiBrZXk9e2luZGV4fSBjbGFzc05hbWU9XCJcIj5cbiAgICAgICAgICAgICAgICA8UG93ZXJTZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17ZGVzY3JpcHRvci5kZXNjfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgICAgICAgICAgIHVzZXJzRGVmYXVsdD17ZGVmYXVsdFVzZXJMZXZlbH1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5DaGFuZ2VMZXZlbHMgfHwgY3VycmVudFVzZXJMZXZlbCA8IHZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBwb3dlckxldmVsS2V5PXtrZXl9IC8vIFdpbGwgYmUgc2VudCBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBgb25DaGFuZ2VgXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUG93ZXJMZXZlbHNDaGFuZ2VkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGhpZGUgdGhlIHBvd2VyIGxldmVsIHNlbGVjdG9yIGZvciBlbmFibGluZyBFMkVFIGlmIGl0IHRoZSByb29tIGlzIGFscmVhZHkgZW5jcnlwdGVkXG4gICAgICAgIGlmIChjbGllbnQuaXNSb29tRW5jcnlwdGVkKHRoaXMucHJvcHMucm9vbUlkKSkge1xuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c0xldmVsc1tcIm0ucm9vbS5lbmNyeXB0aW9uXCJdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXZlbnRQb3dlclNlbGVjdG9ycyA9IE9iamVjdC5rZXlzKGV2ZW50c0xldmVscykubWFwKChldmVudFR5cGUsIGkpID0+IHtcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IHBsRXZlbnRzVG9MYWJlbHNbZXZlbnRUeXBlXTtcbiAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gX3QobGFiZWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IF90KFwiU2VuZCAlKGV2ZW50VHlwZSlzIGV2ZW50c1wiLCB7ZXZlbnRUeXBlfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiXCIga2V5PXtldmVudFR5cGV9PlxuICAgICAgICAgICAgICAgICAgICA8UG93ZXJTZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2V2ZW50c0xldmVsc1tldmVudFR5cGVdfVxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcnNEZWZhdWx0PXtkZWZhdWx0VXNlckxldmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5DaGFuZ2VMZXZlbHMgfHwgY3VycmVudFVzZXJMZXZlbCA8IGV2ZW50c0xldmVsc1tldmVudFR5cGVdfVxuICAgICAgICAgICAgICAgICAgICAgICAgcG93ZXJMZXZlbEtleT17XCJldmVudF9sZXZlbHNfXCIgKyBldmVudFR5cGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBvd2VyTGV2ZWxzQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiIG14X1JvbGVzUm9vbVNldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiUm9sZXMgJiBQZXJtaXNzaW9uc1wiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICB7cHJpdmlsZWdlZFVzZXJzU2VjdGlvbn1cbiAgICAgICAgICAgICAgICB7bXV0ZWRVc2Vyc1NlY3Rpb259XG4gICAgICAgICAgICAgICAge2Jhbm5lZFVzZXJzU2VjdGlvbn1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+e190KFwiUGVybWlzc2lvbnNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoJ1NlbGVjdCB0aGUgcm9sZXMgcmVxdWlyZWQgdG8gY2hhbmdlIHZhcmlvdXMgcGFydHMgb2YgdGhlIHJvb20nKX08L3A+XG4gICAgICAgICAgICAgICAgICAgIHtwb3dlclNlbGVjdG9yc31cbiAgICAgICAgICAgICAgICAgICAge2V2ZW50UG93ZXJTZWxlY3RvcnN9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BannedUser = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../.."));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

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
const plEventsToLabels = {
  // These will be translated for us later.
  "m.room.avatar": (0, _languageHandler._td)("Change room avatar"),
  "m.room.name": (0, _languageHandler._td)("Change room name"),
  "m.room.canonical_alias": (0, _languageHandler._td)("Change main address for the room"),
  "m.room.history_visibility": (0, _languageHandler._td)("Change history visibility"),
  "m.room.power_levels": (0, _languageHandler._td)("Change permissions"),
  "m.room.topic": (0, _languageHandler._td)("Change topic"),
  "m.room.tombstone": (0, _languageHandler._td)("Upgrade the room"),
  "m.room.encryption": (0, _languageHandler._td)("Enable room encryption"),
  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  "im.vector.modular.widgets": (0, _languageHandler._td)("Modify widgets")
};
const plEventsToShow = {
  // If an event is listed here, it will be shown in the PL settings. Defaults will be calculated.
  "m.room.avatar": {
    isState: true
  },
  "m.room.name": {
    isState: true
  },
  "m.room.canonical_alias": {
    isState: true
  },
  "m.room.history_visibility": {
    isState: true
  },
  "m.room.power_levels": {
    isState: true
  },
  "m.room.topic": {
    isState: true
  },
  "m.room.tombstone": {
    isState: true
  },
  "m.room.encryption": {
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

class BannedUser extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onUnbanClick", e => {
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
        kind: "danger_sm",
        onClick: this._onUnbanClick,
        className: "mx_RolesRoomSettingsTab_unbanBtn"
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
(0, _defineProperty2.default)(BannedUser, "propTypes", {
  canUnban: _propTypes.default.bool,
  member: _propTypes.default.object.isRequired,
  // js-sdk RoomMember
  by: _propTypes.default.string.isRequired,
  reason: _propTypes.default.string
});

class RolesRoomSettingsTab extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onRoomMembership", (event, state, member) => {
      if (state.roomId !== this.props.roomId) return;
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "_onPowerLevelsChanged", (value, powerLevelKey) => {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const room = client.getRoom(this.props.roomId);
      const plEvent = room.currentState.getStateEvents('m.room.power_levels', '');
      let plContent = plEvent ? plEvent.getContent() || {} : {}; // Clone the power levels just in case

      plContent = Object.assign({}, plContent);
      const eventsLevelPrefix = "event_levels_";
      value = parseInt(value);

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
    (0, _defineProperty2.default)(this, "_onUserPowerLevelChanged", (value, powerLevelKey) => {
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

  componentDidMount()
  /*: void*/
  {
    _MatrixClientPeg.MatrixClientPeg.get().on("RoomState.members", this._onRoomMembership);
  }

  componentWillUnmount()
  /*: void*/
  {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client) {
      client.removeListener("RoomState.members", this._onRoomMembership);
    }
  }

  _populateDefaultPlEvents(eventsSection, stateLevel, eventsLevel) {
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

    this._populateDefaultPlEvents(eventsLevels, parseIntWithDefault(plContent.state_default, powerLevelDescriptors.state_default.defaultValue), parseIntWithDefault(plContent.events_default, powerLevelDescriptors.events_default.defaultValue));

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
            onChange: this._onUserPowerLevelChanged
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
            onChange: this._onUserPowerLevelChanged
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
        onChange: this._onPowerLevelsChanged
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
        onChange: this._onPowerLevelsChanged
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

}

exports.default = RolesRoomSettingsTab;
(0, _defineProperty2.default)(RolesRoomSettingsTab, "propTypes", {
  roomId: _propTypes.default.string.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9Sb2xlc1Jvb21TZXR0aW5nc1RhYi5qcyJdLCJuYW1lcyI6WyJwbEV2ZW50c1RvTGFiZWxzIiwicGxFdmVudHNUb1Nob3ciLCJpc1N0YXRlIiwicGFyc2VJbnRXaXRoRGVmYXVsdCIsInZhbCIsImRlZiIsInJlcyIsInBhcnNlSW50IiwiaXNOYU4iLCJCYW5uZWRVc2VyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwidW5iYW4iLCJwcm9wcyIsIm1lbWJlciIsInJvb21JZCIsInVzZXJJZCIsImNhdGNoIiwiZXJyIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwicmVuZGVyIiwidW5iYW5CdXR0b24iLCJjYW5VbmJhbiIsIl9vblVuYmFuQ2xpY2siLCJuYW1lIiwiZGlzcGxheU5hbWUiLCJieSIsInJlYXNvbiIsIlByb3BUeXBlcyIsImJvb2wiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwic3RyaW5nIiwiUm9sZXNSb29tU2V0dGluZ3NUYWIiLCJldmVudCIsInN0YXRlIiwiZm9yY2VVcGRhdGUiLCJ2YWx1ZSIsInBvd2VyTGV2ZWxLZXkiLCJjbGllbnQiLCJyb29tIiwiZ2V0Um9vbSIsInBsRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsInBsQ29udGVudCIsImdldENvbnRlbnQiLCJPYmplY3QiLCJhc3NpZ24iLCJldmVudHNMZXZlbFByZWZpeCIsInN0YXJ0c1dpdGgiLCJzbGljZSIsImxlbmd0aCIsImtleVBhdGgiLCJzcGxpdCIsInBhcmVudE9iaiIsImN1cnJlbnRPYmoiLCJrZXkiLCJzZW5kU3RhdGVFdmVudCIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJfb25Sb29tTWVtYmVyc2hpcCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJfcG9wdWxhdGVEZWZhdWx0UGxFdmVudHMiLCJldmVudHNTZWN0aW9uIiwic3RhdGVMZXZlbCIsImV2ZW50c0xldmVsIiwiZGVzaXJlZEV2ZW50Iiwia2V5cyIsIlBvd2VyU2VsZWN0b3IiLCJjYW5DaGFuZ2VMZXZlbHMiLCJtYXlDbGllbnRTZW5kU3RhdGVFdmVudCIsInBvd2VyTGV2ZWxEZXNjcmlwdG9ycyIsImRlc2MiLCJkZWZhdWx0VmFsdWUiLCJldmVudHNMZXZlbHMiLCJldmVudHMiLCJ1c2VyTGV2ZWxzIiwidXNlcnMiLCJiYW5MZXZlbCIsImJhbiIsImRlZmF1bHRVc2VyTGV2ZWwiLCJ1c2Vyc19kZWZhdWx0IiwiY3VycmVudFVzZXJMZXZlbCIsImdldFVzZXJJZCIsInVuZGVmaW5lZCIsInN0YXRlX2RlZmF1bHQiLCJldmVudHNfZGVmYXVsdCIsInByaXZpbGVnZWRVc2Vyc1NlY3Rpb24iLCJtdXRlZFVzZXJzU2VjdGlvbiIsInByaXZpbGVnZWRVc2VycyIsIm11dGVkVXNlcnMiLCJmb3JFYWNoIiwidXNlciIsImNhbkNoYW5nZSIsInB1c2giLCJfb25Vc2VyUG93ZXJMZXZlbENoYW5nZWQiLCJjb21wYXJhdG9yIiwiYSIsImIiLCJwbERpZmYiLCJ0b0xvY2FsZUxvd2VyQ2FzZSIsImxvY2FsZUNvbXBhcmUiLCJzb3J0IiwiYmFubmVkIiwiZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwIiwiYmFubmVkVXNlcnNTZWN0aW9uIiwiY2FuQmFuVXNlcnMiLCJtYXAiLCJiYW5FdmVudCIsInNlbmRlciIsImdldE1lbWJlciIsImdldFNlbmRlciIsImJhbm5lZEJ5IiwicG93ZXJTZWxlY3RvcnMiLCJpbmRleCIsImRlc2NyaXB0b3IiLCJwcm9wIiwiX29uUG93ZXJMZXZlbHNDaGFuZ2VkIiwiaXNSb29tRW5jcnlwdGVkIiwiZXZlbnRQb3dlclNlbGVjdG9ycyIsImV2ZW50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UyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQXlDLHlCQUFHLHFCQUFILENBQXpDLENBREosRUFFSzlCLHNCQUZMLEVBR0tDLGlCQUhMLEVBSUtpQixrQkFKTCxlQUtJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLE9BQTZDLHlCQUFHLGFBQUgsQ0FBN0MsQ0FESixlQUVJLHdDQUFJLHlCQUFHLCtEQUFILENBQUosQ0FGSixFQUdLUSxjQUhMLEVBSUtNLG1CQUpMLENBTEosQ0FESjtBQWNIOztBQXRUNkQ7Ozs4QkFBN0N4RixvQixlQUNFO0FBQ2YxQixFQUFBQSxNQUFNLEVBQUVxQixtQkFBVUksTUFBVixDQUFpQkQ7QUFEVixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190LCBfdGR9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uLy4uLy4uXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9Nb2RhbFwiO1xuXG5jb25zdCBwbEV2ZW50c1RvTGFiZWxzID0ge1xuICAgIC8vIFRoZXNlIHdpbGwgYmUgdHJhbnNsYXRlZCBmb3IgdXMgbGF0ZXIuXG4gICAgXCJtLnJvb20uYXZhdGFyXCI6IF90ZChcIkNoYW5nZSByb29tIGF2YXRhclwiKSxcbiAgICBcIm0ucm9vbS5uYW1lXCI6IF90ZChcIkNoYW5nZSByb29tIG5hbWVcIiksXG4gICAgXCJtLnJvb20uY2Fub25pY2FsX2FsaWFzXCI6IF90ZChcIkNoYW5nZSBtYWluIGFkZHJlc3MgZm9yIHRoZSByb29tXCIpLFxuICAgIFwibS5yb29tLmhpc3RvcnlfdmlzaWJpbGl0eVwiOiBfdGQoXCJDaGFuZ2UgaGlzdG9yeSB2aXNpYmlsaXR5XCIpLFxuICAgIFwibS5yb29tLnBvd2VyX2xldmVsc1wiOiBfdGQoXCJDaGFuZ2UgcGVybWlzc2lvbnNcIiksXG4gICAgXCJtLnJvb20udG9waWNcIjogX3RkKFwiQ2hhbmdlIHRvcGljXCIpLFxuICAgIFwibS5yb29tLnRvbWJzdG9uZVwiOiBfdGQoXCJVcGdyYWRlIHRoZSByb29tXCIpLFxuICAgIFwibS5yb29tLmVuY3J5cHRpb25cIjogX3RkKFwiRW5hYmxlIHJvb20gZW5jcnlwdGlvblwiKSxcblxuICAgIC8vIFRPRE86IEVuYWJsZSBzdXBwb3J0IGZvciBtLndpZGdldCBldmVudCB0eXBlIChodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMzExMSlcbiAgICBcImltLnZlY3Rvci5tb2R1bGFyLndpZGdldHNcIjogX3RkKFwiTW9kaWZ5IHdpZGdldHNcIiksXG59O1xuXG5jb25zdCBwbEV2ZW50c1RvU2hvdyA9IHtcbiAgICAvLyBJZiBhbiBldmVudCBpcyBsaXN0ZWQgaGVyZSwgaXQgd2lsbCBiZSBzaG93biBpbiB0aGUgUEwgc2V0dGluZ3MuIERlZmF1bHRzIHdpbGwgYmUgY2FsY3VsYXRlZC5cbiAgICBcIm0ucm9vbS5hdmF0YXJcIjoge2lzU3RhdGU6IHRydWV9LFxuICAgIFwibS5yb29tLm5hbWVcIjoge2lzU3RhdGU6IHRydWV9LFxuICAgIFwibS5yb29tLmNhbm9uaWNhbF9hbGlhc1wiOiB7aXNTdGF0ZTogdHJ1ZX0sXG4gICAgXCJtLnJvb20uaGlzdG9yeV92aXNpYmlsaXR5XCI6IHtpc1N0YXRlOiB0cnVlfSxcbiAgICBcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIjoge2lzU3RhdGU6IHRydWV9LFxuICAgIFwibS5yb29tLnRvcGljXCI6IHtpc1N0YXRlOiB0cnVlfSxcbiAgICBcIm0ucm9vbS50b21ic3RvbmVcIjoge2lzU3RhdGU6IHRydWV9LFxuICAgIFwibS5yb29tLmVuY3J5cHRpb25cIjoge2lzU3RhdGU6IHRydWV9LFxuXG4gICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgIFwiaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0c1wiOiB7aXNTdGF0ZTogdHJ1ZX0sXG59O1xuXG4vLyBwYXJzZSBhIHN0cmluZyBhcyBhbiBpbnRlZ2VyOyBpZiB0aGUgaW5wdXQgaXMgdW5kZWZpbmVkLCBvciBjYW5ub3QgYmUgcGFyc2VkXG4vLyBhcyBhbiBpbnRlZ2VyLCByZXR1cm4gYSBkZWZhdWx0LlxuZnVuY3Rpb24gcGFyc2VJbnRXaXRoRGVmYXVsdCh2YWwsIGRlZikge1xuICAgIGNvbnN0IHJlcyA9IHBhcnNlSW50KHZhbCk7XG4gICAgcmV0dXJuIGlzTmFOKHJlcykgPyBkZWYgOiByZXM7XG59XG5cbmV4cG9ydCBjbGFzcyBCYW5uZWRVc2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBjYW5VbmJhbjogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG1lbWJlcjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAvLyBqcy1zZGsgUm9vbU1lbWJlclxuICAgICAgICBieTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICByZWFzb246IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgfTtcblxuICAgIF9vblVuYmFuQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudW5iYW4odGhpcy5wcm9wcy5tZW1iZXIucm9vbUlkLCB0aGlzLnByb3BzLm1lbWJlci51c2VySWQpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHVuYmFuOiBcIiArIGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gdW5iYW4nLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdGYWlsZWQgdG8gdW5iYW4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgdW5iYW5CdXR0b247XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY2FuVW5iYW4pIHtcbiAgICAgICAgICAgIHVuYmFuQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2Rhbmdlcl9zbScgb25DbGljaz17dGhpcy5fb25VbmJhbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfUm9sZXNSb29tU2V0dGluZ3NUYWJfdW5iYW5CdG4nPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdVbmJhbicpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5wcm9wcy5tZW1iZXIubmFtZSA9PT0gdGhpcy5wcm9wcy5tZW1iZXIudXNlcklkID8gbnVsbCA6IHRoaXMucHJvcHMubWVtYmVyLnVzZXJJZDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICB7dW5iYW5CdXR0b259XG4gICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9e190KFwiQmFubmVkIGJ5ICUoZGlzcGxheU5hbWUpc1wiLCB7ZGlzcGxheU5hbWU6IHRoaXMucHJvcHMuYnl9KX0+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+eyB0aGlzLnByb3BzLm1lbWJlci5uYW1lIH08L3N0cm9uZz4ge3VzZXJJZH1cbiAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMucmVhc29uID8gXCIgXCIgKyBfdCgnUmVhc29uJykgKyBcIjogXCIgKyB0aGlzLnByb3BzLnJlYXNvbiA6IFwiXCJ9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvbGVzUm9vbVNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICByb29tSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIlJvb21TdGF0ZS5tZW1iZXJzXCIsIHRoaXMuX29uUm9vbU1lbWJlcnNoaXApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmIChjbGllbnQpIHtcbiAgICAgICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihcIlJvb21TdGF0ZS5tZW1iZXJzXCIsIHRoaXMuX29uUm9vbU1lbWJlcnNoaXApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uUm9vbU1lbWJlcnNoaXAgPSAoZXZlbnQsIHN0YXRlLCBtZW1iZXIpID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLnJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tSWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBfcG9wdWxhdGVEZWZhdWx0UGxFdmVudHMoZXZlbnRzU2VjdGlvbiwgc3RhdGVMZXZlbCwgZXZlbnRzTGV2ZWwpIHtcbiAgICAgICAgZm9yIChjb25zdCBkZXNpcmVkRXZlbnQgb2YgT2JqZWN0LmtleXMocGxFdmVudHNUb1Nob3cpKSB7XG4gICAgICAgICAgICBpZiAoIShkZXNpcmVkRXZlbnQgaW4gZXZlbnRzU2VjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBldmVudHNTZWN0aW9uW2Rlc2lyZWRFdmVudF0gPSAocGxFdmVudHNUb1Nob3dbZGVzaXJlZEV2ZW50XS5pc1N0YXRlID8gc3RhdGVMZXZlbCA6IGV2ZW50c0xldmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblBvd2VyTGV2ZWxzQ2hhbmdlZCA9ICh2YWx1ZSwgcG93ZXJMZXZlbEtleSkgPT4ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IHBsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnBvd2VyX2xldmVscycsICcnKTtcbiAgICAgICAgbGV0IHBsQ29udGVudCA9IHBsRXZlbnQgPyAocGxFdmVudC5nZXRDb250ZW50KCkgfHwge30pIDoge307XG5cbiAgICAgICAgLy8gQ2xvbmUgdGhlIHBvd2VyIGxldmVscyBqdXN0IGluIGNhc2VcbiAgICAgICAgcGxDb250ZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgcGxDb250ZW50KTtcblxuICAgICAgICBjb25zdCBldmVudHNMZXZlbFByZWZpeCA9IFwiZXZlbnRfbGV2ZWxzX1wiO1xuXG4gICAgICAgIHZhbHVlID0gcGFyc2VJbnQodmFsdWUpO1xuXG4gICAgICAgIGlmIChwb3dlckxldmVsS2V5LnN0YXJ0c1dpdGgoZXZlbnRzTGV2ZWxQcmVmaXgpKSB7XG4gICAgICAgICAgICAvLyBkZWVwIGNvcHkgXCJldmVudHNcIiBvYmplY3QsIE9iamVjdC5hc3NpZ24gaXRzZWxmIHdvbid0IGRlZXAgY29weVxuICAgICAgICAgICAgcGxDb250ZW50W1wiZXZlbnRzXCJdID0gT2JqZWN0LmFzc2lnbih7fSwgcGxDb250ZW50W1wiZXZlbnRzXCJdIHx8IHt9KTtcbiAgICAgICAgICAgIHBsQ29udGVudFtcImV2ZW50c1wiXVtwb3dlckxldmVsS2V5LnNsaWNlKGV2ZW50c0xldmVsUHJlZml4Lmxlbmd0aCldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBrZXlQYXRoID0gcG93ZXJMZXZlbEtleS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgbGV0IHBhcmVudE9iajtcbiAgICAgICAgICAgIGxldCBjdXJyZW50T2JqID0gcGxDb250ZW50O1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2Yga2V5UGF0aCkge1xuICAgICAgICAgICAgICAgIGlmICghY3VycmVudE9ialtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPYmpba2V5XSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXJlbnRPYmogPSBjdXJyZW50T2JqO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRPYmogPSBjdXJyZW50T2JqW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnRPYmpba2V5UGF0aFtrZXlQYXRoLmxlbmd0aCAtIDFdXSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xpZW50LnNlbmRTdGF0ZUV2ZW50KHRoaXMucHJvcHMucm9vbUlkLCBcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIiwgcGxDb250ZW50KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdQb3dlciBsZXZlbCByZXF1aXJlbWVudCBjaGFuZ2UgZmFpbGVkJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdFcnJvciBjaGFuZ2luZyBwb3dlciBsZXZlbCByZXF1aXJlbWVudCcpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJBbiBlcnJvciBvY2N1cnJlZCBjaGFuZ2luZyB0aGUgcm9vbSdzIHBvd2VyIGxldmVsIHJlcXVpcmVtZW50cy4gRW5zdXJlIHlvdSBoYXZlIHN1ZmZpY2llbnQgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInBlcm1pc3Npb25zIGFuZCB0cnkgYWdhaW4uXCIsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uVXNlclBvd2VyTGV2ZWxDaGFuZ2VkID0gKHZhbHVlLCBwb3dlckxldmVsS2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgY29uc3QgcGxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20ucG93ZXJfbGV2ZWxzJywgJycpO1xuICAgICAgICBsZXQgcGxDb250ZW50ID0gcGxFdmVudCA/IChwbEV2ZW50LmdldENvbnRlbnQoKSB8fCB7fSkgOiB7fTtcblxuICAgICAgICAvLyBDbG9uZSB0aGUgcG93ZXIgbGV2ZWxzIGp1c3QgaW4gY2FzZVxuICAgICAgICBwbENvbnRlbnQgPSBPYmplY3QuYXNzaWduKHt9LCBwbENvbnRlbnQpO1xuXG4gICAgICAgIC8vIHBvd2VyTGV2ZWxLZXkgc2hvdWxkIGJlIGEgdXNlciBJRFxuICAgICAgICBpZiAoIXBsQ29udGVudFsndXNlcnMnXSkgcGxDb250ZW50Wyd1c2VycyddID0ge307XG4gICAgICAgIHBsQ29udGVudFsndXNlcnMnXVtwb3dlckxldmVsS2V5XSA9IHZhbHVlO1xuXG4gICAgICAgIGNsaWVudC5zZW5kU3RhdGVFdmVudCh0aGlzLnByb3BzLnJvb21JZCwgXCJtLnJvb20ucG93ZXJfbGV2ZWxzXCIsIHBsQ29udGVudCkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnUG93ZXIgbGV2ZWwgY2hhbmdlIGZhaWxlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3IgY2hhbmdpbmcgcG93ZXIgbGV2ZWwnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQW4gZXJyb3Igb2NjdXJyZWQgY2hhbmdpbmcgdGhlIHVzZXIncyBwb3dlciBsZXZlbC4gRW5zdXJlIHlvdSBoYXZlIHN1ZmZpY2llbnQgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInBlcm1pc3Npb25zIGFuZCB0cnkgYWdhaW4uXCIsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBQb3dlclNlbGVjdG9yID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuUG93ZXJTZWxlY3RvcicpO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgY29uc3QgcGxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20ucG93ZXJfbGV2ZWxzJywgJycpO1xuICAgICAgICBjb25zdCBwbENvbnRlbnQgPSBwbEV2ZW50ID8gKHBsRXZlbnQuZ2V0Q29udGVudCgpIHx8IHt9KSA6IHt9O1xuICAgICAgICBjb25zdCBjYW5DaGFuZ2VMZXZlbHMgPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudCgnbS5yb29tLnBvd2VyX2xldmVscycsIGNsaWVudCk7XG5cbiAgICAgICAgY29uc3QgcG93ZXJMZXZlbERlc2NyaXB0b3JzID0ge1xuICAgICAgICAgICAgXCJ1c2Vyc19kZWZhdWx0XCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnRGVmYXVsdCByb2xlJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZXZlbnRzX2RlZmF1bHRcIjoge1xuICAgICAgICAgICAgICAgIGRlc2M6IF90KCdTZW5kIG1lc3NhZ2VzJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiaW52aXRlXCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnSW52aXRlIHVzZXJzJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiA1MCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInN0YXRlX2RlZmF1bHRcIjoge1xuICAgICAgICAgICAgICAgIGRlc2M6IF90KCdDaGFuZ2Ugc2V0dGluZ3MnKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDUwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwia2lja1wiOiB7XG4gICAgICAgICAgICAgICAgZGVzYzogX3QoJ0tpY2sgdXNlcnMnKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDUwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiYmFuXCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnQmFuIHVzZXJzJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiA1MCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInJlZGFjdFwiOiB7XG4gICAgICAgICAgICAgICAgZGVzYzogX3QoJ1JlbW92ZSBtZXNzYWdlcyBzZW50IGJ5IG90aGVycycpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogNTAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJub3RpZmljYXRpb25zLnJvb21cIjoge1xuICAgICAgICAgICAgICAgIGRlc2M6IF90KCdOb3RpZnkgZXZlcnlvbmUnKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDUwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBldmVudHNMZXZlbHMgPSBwbENvbnRlbnQuZXZlbnRzIHx8IHt9O1xuICAgICAgICBjb25zdCB1c2VyTGV2ZWxzID0gcGxDb250ZW50LnVzZXJzIHx8IHt9O1xuICAgICAgICBjb25zdCBiYW5MZXZlbCA9IHBhcnNlSW50V2l0aERlZmF1bHQocGxDb250ZW50LmJhbiwgcG93ZXJMZXZlbERlc2NyaXB0b3JzLmJhbi5kZWZhdWx0VmFsdWUpO1xuICAgICAgICBjb25zdCBkZWZhdWx0VXNlckxldmVsID0gcGFyc2VJbnRXaXRoRGVmYXVsdChcbiAgICAgICAgICAgIHBsQ29udGVudC51c2Vyc19kZWZhdWx0LFxuICAgICAgICAgICAgcG93ZXJMZXZlbERlc2NyaXB0b3JzLnVzZXJzX2RlZmF1bHQuZGVmYXVsdFZhbHVlLFxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBjdXJyZW50VXNlckxldmVsID0gdXNlckxldmVsc1tjbGllbnQuZ2V0VXNlcklkKCldO1xuICAgICAgICBpZiAoY3VycmVudFVzZXJMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjdXJyZW50VXNlckxldmVsID0gZGVmYXVsdFVzZXJMZXZlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BvcHVsYXRlRGVmYXVsdFBsRXZlbnRzKFxuICAgICAgICAgICAgZXZlbnRzTGV2ZWxzLFxuICAgICAgICAgICAgcGFyc2VJbnRXaXRoRGVmYXVsdChwbENvbnRlbnQuc3RhdGVfZGVmYXVsdCwgcG93ZXJMZXZlbERlc2NyaXB0b3JzLnN0YXRlX2RlZmF1bHQuZGVmYXVsdFZhbHVlKSxcbiAgICAgICAgICAgIHBhcnNlSW50V2l0aERlZmF1bHQocGxDb250ZW50LmV2ZW50c19kZWZhdWx0LCBwb3dlckxldmVsRGVzY3JpcHRvcnMuZXZlbnRzX2RlZmF1bHQuZGVmYXVsdFZhbHVlKSxcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgcHJpdmlsZWdlZFVzZXJzU2VjdGlvbiA9IDxkaXY+e190KCdObyB1c2VycyBoYXZlIHNwZWNpZmljIHByaXZpbGVnZXMgaW4gdGhpcyByb29tJyl9PC9kaXY+O1xuICAgICAgICBsZXQgbXV0ZWRVc2Vyc1NlY3Rpb247XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh1c2VyTGV2ZWxzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IHByaXZpbGVnZWRVc2VycyA9IFtdO1xuICAgICAgICAgICAgY29uc3QgbXV0ZWRVc2VycyA9IFtdO1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyh1c2VyTGV2ZWxzKS5mb3JFYWNoKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuQ2hhbmdlID0gdXNlckxldmVsc1t1c2VyXSA8IGN1cnJlbnRVc2VyTGV2ZWwgJiYgY2FuQ2hhbmdlTGV2ZWxzO1xuICAgICAgICAgICAgICAgIGlmICh1c2VyTGV2ZWxzW3VzZXJdID4gZGVmYXVsdFVzZXJMZXZlbCkgeyAvLyBwcml2aWxlZ2VkXG4gICAgICAgICAgICAgICAgICAgIHByaXZpbGVnZWRVc2Vycy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFBvd2VyU2VsZWN0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dXNlckxldmVsc1t1c2VyXX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWNhbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17dXNlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3VzZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG93ZXJMZXZlbEtleT17dXNlcn0gLy8gV2lsbCBiZSBzZW50IGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIGBvbkNoYW5nZWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25Vc2VyUG93ZXJMZXZlbENoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPixcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVzZXJMZXZlbHNbdXNlcl0gPCBkZWZhdWx0VXNlckxldmVsKSB7IC8vIG11dGVkXG4gICAgICAgICAgICAgICAgICAgIG11dGVkVXNlcnMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxQb3dlclNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3VzZXJMZXZlbHNbdXNlcl19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e3VzZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt1c2VyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvd2VyTGV2ZWxLZXk9e3VzZXJ9IC8vIFdpbGwgYmUgc2VudCBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBgb25DaGFuZ2VgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uVXNlclBvd2VyTGV2ZWxDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGNvbXBhcmF0b3IgZm9yIHNvcnRpbmcgUEwgdXNlcnMgbGV4aWNvZ3JhcGhpY2FsbHkgb24gUEwgZGVzY2VuZGluZywgTVhJRCBhc2NlbmRpbmcuIChjYXNlLWluc2Vuc2l0aXZlKVxuICAgICAgICAgICAgY29uc3QgY29tcGFyYXRvciA9IChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGxEaWZmID0gdXNlckxldmVsc1tiLmtleV0gLSB1c2VyTGV2ZWxzW2Eua2V5XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGxEaWZmICE9PSAwID8gcGxEaWZmIDogYS5rZXkudG9Mb2NhbGVMb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIua2V5LnRvTG9jYWxlTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcHJpdmlsZWdlZFVzZXJzLnNvcnQoY29tcGFyYXRvcik7XG4gICAgICAgICAgICBtdXRlZFVzZXJzLnNvcnQoY29tcGFyYXRvcik7XG5cbiAgICAgICAgICAgIGlmIChwcml2aWxlZ2VkVXNlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcHJpdmlsZWdlZFVzZXJzU2VjdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57IF90KCdQcml2aWxlZ2VkIFVzZXJzJykgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge3ByaXZpbGVnZWRVc2Vyc31cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG11dGVkVXNlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbXV0ZWRVc2Vyc1NlY3Rpb24gPVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+eyBfdCgnTXV0ZWQgVXNlcnMnKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bXV0ZWRVc2Vyc31cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYmFubmVkID0gcm9vbS5nZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAoXCJiYW5cIik7XG4gICAgICAgIGxldCBiYW5uZWRVc2Vyc1NlY3Rpb247XG4gICAgICAgIGlmIChiYW5uZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBjYW5CYW5Vc2VycyA9IGN1cnJlbnRVc2VyTGV2ZWwgPj0gYmFuTGV2ZWw7XG4gICAgICAgICAgICBiYW5uZWRVc2Vyc1NlY3Rpb24gPVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPnsgX3QoJ0Jhbm5lZCB1c2VycycpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAge2Jhbm5lZC5tYXAoKG1lbWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhbkV2ZW50ID0gbWVtYmVyLmV2ZW50cy5tZW1iZXIuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbmRlciA9IHJvb20uZ2V0TWVtYmVyKG1lbWJlci5ldmVudHMubWVtYmVyLmdldFNlbmRlcigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYmFubmVkQnkgPSBtZW1iZXIuZXZlbnRzLm1lbWJlci5nZXRTZW5kZXIoKTsgLy8gc3RhcnQgYnkgZmFsbGluZyBiYWNrIHRvIG14aWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VuZGVyKSBiYW5uZWRCeSA9IHNlbmRlci5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCYW5uZWRVc2VyIGtleT17bWVtYmVyLnVzZXJJZH0gY2FuVW5iYW49e2NhbkJhblVzZXJzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXI9e21lbWJlcn0gcmVhc29uPXtiYW5FdmVudC5yZWFzb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5PXtiYW5uZWRCeX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcG93ZXJTZWxlY3RvcnMgPSBPYmplY3Qua2V5cyhwb3dlckxldmVsRGVzY3JpcHRvcnMpLm1hcCgoa2V5LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRvciA9IHBvd2VyTGV2ZWxEZXNjcmlwdG9yc1trZXldO1xuXG4gICAgICAgICAgICBjb25zdCBrZXlQYXRoID0ga2V5LnNwbGl0KCcuJyk7XG4gICAgICAgICAgICBsZXQgY3VycmVudE9iaiA9IHBsQ29udGVudDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBrZXlQYXRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRPYmogPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VycmVudE9iaiA9IGN1cnJlbnRPYmpbcHJvcF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VJbnRXaXRoRGVmYXVsdChjdXJyZW50T2JqLCBkZXNjcmlwdG9yLmRlZmF1bHRWYWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gPGRpdiBrZXk9e2luZGV4fSBjbGFzc05hbWU9XCJcIj5cbiAgICAgICAgICAgICAgICA8UG93ZXJTZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17ZGVzY3JpcHRvci5kZXNjfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgICAgICAgICAgIHVzZXJzRGVmYXVsdD17ZGVmYXVsdFVzZXJMZXZlbH1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5DaGFuZ2VMZXZlbHMgfHwgY3VycmVudFVzZXJMZXZlbCA8IHZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBwb3dlckxldmVsS2V5PXtrZXl9IC8vIFdpbGwgYmUgc2VudCBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBgb25DaGFuZ2VgXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vblBvd2VyTGV2ZWxzQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBoaWRlIHRoZSBwb3dlciBsZXZlbCBzZWxlY3RvciBmb3IgZW5hYmxpbmcgRTJFRSBpZiBpdCB0aGUgcm9vbSBpcyBhbHJlYWR5IGVuY3J5cHRlZFxuICAgICAgICBpZiAoY2xpZW50LmlzUm9vbUVuY3J5cHRlZCh0aGlzLnByb3BzLnJvb21JZCkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNMZXZlbHNbXCJtLnJvb20uZW5jcnlwdGlvblwiXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV2ZW50UG93ZXJTZWxlY3RvcnMgPSBPYmplY3Qua2V5cyhldmVudHNMZXZlbHMpLm1hcCgoZXZlbnRUeXBlLCBpKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBwbEV2ZW50c1RvTGFiZWxzW2V2ZW50VHlwZV07XG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IF90KGxhYmVsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSBfdChcIlNlbmQgJShldmVudFR5cGUpcyBldmVudHNcIiwge2V2ZW50VHlwZX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIlwiIGtleT17ZXZlbnRUeXBlfT5cbiAgICAgICAgICAgICAgICAgICAgPFBvd2VyU2VsZWN0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtsYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtldmVudHNMZXZlbHNbZXZlbnRUeXBlXX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJzRGVmYXVsdD17ZGVmYXVsdFVzZXJMZXZlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshY2FuQ2hhbmdlTGV2ZWxzIHx8IGN1cnJlbnRVc2VyTGV2ZWwgPCBldmVudHNMZXZlbHNbZXZlbnRUeXBlXX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvd2VyTGV2ZWxLZXk9e1wiZXZlbnRfbGV2ZWxzX1wiICsgZXZlbnRUeXBlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uUG93ZXJMZXZlbHNDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWIgbXhfUm9sZXNSb29tU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJSb2xlcyAmIFBlcm1pc3Npb25zXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIHtwcml2aWxlZ2VkVXNlcnNTZWN0aW9ufVxuICAgICAgICAgICAgICAgIHttdXRlZFVzZXJzU2VjdGlvbn1cbiAgICAgICAgICAgICAgICB7YmFubmVkVXNlcnNTZWN0aW9ufVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJQZXJtaXNzaW9uc1wiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdCgnU2VsZWN0IHRoZSByb2xlcyByZXF1aXJlZCB0byBjaGFuZ2UgdmFyaW91cyBwYXJ0cyBvZiB0aGUgcm9vbScpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAge3Bvd2VyU2VsZWN0b3JzfVxuICAgICAgICAgICAgICAgICAgICB7ZXZlbnRQb3dlclNlbGVjdG9yc31cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
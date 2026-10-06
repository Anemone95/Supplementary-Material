"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.useDevices = exports.useRoomPowerLevels = exports.getE2EStatus = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _createRoom = _interopRequireWildcard(require("../../../createRoom"));

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _RoomViewStore = _interopRequireDefault(require("../../../stores/RoomViewStore"));

var _MultiInviter = _interopRequireDefault(require("../../../utils/MultiInviter"));

var _GroupStore = _interopRequireDefault(require("../../../stores/GroupStore"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _E2EIcon = _interopRequireDefault(require("../rooms/E2EIcon"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _Roles = require("../../../Roles");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _RightPanelStorePhases = require("../../../stores/RightPanelStorePhases");

var _EncryptionPanel = _interopRequireDefault(require("./EncryptionPanel"));

var _useAsyncMemo = require("../../../hooks/useAsyncMemo");

var _verification = require("../../../verification");

var _actions = require("../../../dispatcher/actions");

var _UserSettingsDialog = require("../dialogs/UserSettingsDialog");

var _useIsEncrypted = require("../../../hooks/useIsEncrypted");

var _BaseCard = _interopRequireDefault(require("./BaseCard"));

var _ShieldUtils = require("../../../utils/ShieldUtils");

var _ImageView = _interopRequireDefault(require("../elements/ImageView"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _PowerSelector = _interopRequireDefault(require("../elements/PowerSelector"));

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _PresenceLabel = _interopRequireDefault(require("../rooms/PresenceLabel"));

var _ShareDialog = _interopRequireDefault(require("../dialogs/ShareDialog"));

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _QuestionDialog = _interopRequireDefault(require("../dialogs/QuestionDialog"));

var _ConfirmUserActionDialog = _interopRequireDefault(require("../dialogs/ConfirmUserActionDialog"));

var _InfoDialog = _interopRequireDefault(require("../dialogs/InfoDialog"));

var _event = require("matrix-js-sdk/src/@types/event");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _RoomName = _interopRequireDefault(require("../elements/RoomName"));

var _Media = require("../../../customisations/Media");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018 Vector Creations Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const disambiguateDevices = (devices
/*: IDevice[]*/
) => {
  const names = Object.create(null);

  for (let i = 0; i < devices.length; i++) {
    const name = devices[i].getDisplayName();
    const indexList = names[name] || [];
    indexList.push(i);
    names[name] = indexList;
  }

  for (const name in names) {
    if (names[name].length > 1) {
      names[name].forEach(j => {
        devices[j].ambiguous = true;
      });
    }
  }
};

const getE2EStatus = (cli
/*: MatrixClient*/
, userId
/*: string*/
, devices
/*: IDevice[]*/
) =>
/*: E2EStatus*/
{
  const isMe = userId === cli.getUserId();
  const userTrust = cli.checkUserTrust(userId);

  if (!userTrust.isCrossSigningVerified()) {
    return userTrust.wasCrossSigningVerified() ? _ShieldUtils.E2EStatus.Warning : _ShieldUtils.E2EStatus.Normal;
  }

  const anyDeviceUnverified = devices.some(device => {
    const {
      deviceId
    } = device; // For your own devices, we use the stricter check of cross-signing
    // verification to encourage everyone to trust their own devices via
    // cross-signing so that other users can then safely trust you.
    // For other people's devices, the more general verified check that
    // includes locally verified devices can be used.

    const deviceTrust = cli.checkDeviceTrust(userId, deviceId);
    return isMe ? !deviceTrust.isCrossSigningVerified() : !deviceTrust.isVerified();
  });
  return anyDeviceUnverified ? _ShieldUtils.E2EStatus.Warning : _ShieldUtils.E2EStatus.Verified;
};

exports.getE2EStatus = getE2EStatus;

async function openDMForUser(matrixClient
/*: MatrixClient*/
, userId
/*: string*/
) {
  const lastActiveRoom = (0, _createRoom.findDMForUser)(matrixClient, userId);

  if (lastActiveRoom) {
    _dispatcher.default.dispatch({
      action: 'view_room',
      room_id: lastActiveRoom.roomId
    });

    return;
  }

  const createRoomOptions = {
    dmUserId: userId,
    encryption: undefined
  };

  if ((0, _createRoom.privateShouldBeEncrypted)()) {
    // Check whether all users have uploaded device keys before.
    // If so, enable encryption in the new room.
    const usersToDevicesMap = await matrixClient.downloadKeys([userId]);
    const allHaveDeviceKeys = Object.values(usersToDevicesMap).every(devices => {
      // `devices` is an object of the form { deviceId: deviceInfo, ... }.
      return Object.keys(devices).length > 0;
    });

    if (allHaveDeviceKeys) {
      createRoomOptions.encryption = true;
    }
  }

  return (0, _createRoom.default)(createRoomOptions);
}

function useHasCrossSigningKeys(cli
/*: MatrixClient*/
, member
/*: RoomMember*/
, canVerify
/*: boolean*/
, setUpdating
/*: SetUpdating*/
) {
  return (0, _useAsyncMemo.useAsyncMemo)(async () => {
    if (!canVerify) {
      return undefined;
    }

    setUpdating(true);

    try {
      await cli.downloadKeys([member.userId]);
      const xsi = cli.getStoredCrossSigningForUser(member.userId);
      const key = xsi && xsi.getId();
      return !!key;
    } finally {
      setUpdating(false);
    }
  }, [cli, member, canVerify], undefined);
}

function DeviceItem({
  userId,
  device
}
/*: {userId: string, device: IDevice}*/
) {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const isMe = userId === cli.getUserId();
  const deviceTrust = cli.checkDeviceTrust(userId, device.deviceId);
  const userTrust = cli.checkUserTrust(userId); // For your own devices, we use the stricter check of cross-signing
  // verification to encourage everyone to trust their own devices via
  // cross-signing so that other users can then safely trust you.
  // For other people's devices, the more general verified check that
  // includes locally verified devices can be used.

  const isVerified = isMe ? deviceTrust.isCrossSigningVerified() : deviceTrust.isVerified();
  const classes = (0, _classnames.default)("mx_UserInfo_device", {
    mx_UserInfo_device_verified: isVerified,
    mx_UserInfo_device_unverified: !isVerified
  });
  const iconClasses = (0, _classnames.default)("mx_E2EIcon", {
    mx_E2EIcon_normal: !userTrust.isVerified(),
    mx_E2EIcon_verified: isVerified,
    mx_E2EIcon_warning: userTrust.isVerified() && !isVerified
  });

  const onDeviceClick = () => {
    (0, _verification.verifyDevice)(cli.getUser(userId), device);
  };

  const deviceName = device.ambiguous ? (device.getDisplayName() ? device.getDisplayName() : "") + " (" + device.deviceId + ")" : device.getDisplayName();
  let trustedLabel = null;
  if (userTrust.isVerified()) trustedLabel = isVerified ? (0, _languageHandler._t)("Trusted") : (0, _languageHandler._t)("Not trusted");

  if (isVerified) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      title: device.deviceId
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: iconClasses
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_device_name"
    }, deviceName), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_device_trusted"
    }, trustedLabel));
  } else {
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: classes,
      title: device.deviceId,
      onClick: onDeviceClick
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: iconClasses
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_device_name"
    }, deviceName), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_device_trusted"
    }, trustedLabel));
  }
}

function DevicesSection({
  devices,
  userId,
  loading
}
/*: {devices: IDevice[], userId: string, loading: boolean}*/
) {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const userTrust = cli.checkUserTrust(userId);
  const [isExpanded, setExpanded] = (0, _react.useState)(false);

  if (loading) {
    // still loading
    return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
  }

  if (devices === null) {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("Unable to load session list"));
  }

  const isMe = userId === cli.getUserId();
  const deviceTrusts = devices.map(d => cli.checkDeviceTrust(userId, d.deviceId));
  let expandSectionDevices = [];
  const unverifiedDevices = [];
  let expandCountCaption;
  let expandHideCaption;
  let expandIconClasses = "mx_E2EIcon";

  if (userTrust.isVerified()) {
    for (let i = 0; i < devices.length; ++i) {
      const device = devices[i];
      const deviceTrust = deviceTrusts[i]; // For your own devices, we use the stricter check of cross-signing
      // verification to encourage everyone to trust their own devices via
      // cross-signing so that other users can then safely trust you.
      // For other people's devices, the more general verified check that
      // includes locally verified devices can be used.

      const isVerified = isMe ? deviceTrust.isCrossSigningVerified() : deviceTrust.isVerified();

      if (isVerified) {
        expandSectionDevices.push(device);
      } else {
        unverifiedDevices.push(device);
      }
    }

    expandCountCaption = (0, _languageHandler._t)("%(count)s verified sessions", {
      count: expandSectionDevices.length
    });
    expandHideCaption = (0, _languageHandler._t)("Hide verified sessions");
    expandIconClasses += " mx_E2EIcon_verified";
  } else {
    expandSectionDevices = devices;
    expandCountCaption = (0, _languageHandler._t)("%(count)s sessions", {
      count: devices.length
    });
    expandHideCaption = (0, _languageHandler._t)("Hide sessions");
    expandIconClasses += " mx_E2EIcon_normal";
  }

  let expandButton;

  if (expandSectionDevices.length) {
    if (isExpanded) {
      expandButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_UserInfo_expand mx_linkButton",
        onClick: () => setExpanded(false)
      }, /*#__PURE__*/_react.default.createElement("div", null, expandHideCaption));
    } else {
      expandButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_UserInfo_expand mx_linkButton",
        onClick: () => setExpanded(true)
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: expandIconClasses
      }), /*#__PURE__*/_react.default.createElement("div", null, expandCountCaption));
    }
  }

  let deviceList = unverifiedDevices.map((device, i) => {
    return /*#__PURE__*/_react.default.createElement(DeviceItem, {
      key: i,
      userId: userId,
      device: device
    });
  });

  if (isExpanded) {
    const keyStart = unverifiedDevices.length;
    deviceList = deviceList.concat(expandSectionDevices.map((device, i) => {
      return /*#__PURE__*/_react.default.createElement(DeviceItem, {
        key: i + keyStart,
        userId: userId,
        device: device
      });
    }));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_devices"
  }, /*#__PURE__*/_react.default.createElement("div", null, deviceList), /*#__PURE__*/_react.default.createElement("div", null, expandButton));
}

const UserOptionsSection
/*: React.FC<{
    member: RoomMember;
    isIgnored: boolean;
    canInvite: boolean;
    isSpace?: boolean;
}>*/
= ({
  member,
  isIgnored,
  canInvite,
  isSpace
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  let ignoreButton = null;
  let insertPillButton = null;
  let inviteUserButton = null;
  let readReceiptButton = null;
  const isMe = member.userId === cli.getUserId();

  const onShareUserClick = () => {
    _Modal.default.createTrackedDialog('share room member dialog', '', _ShareDialog.default, {
      target: member
    });
  }; // Only allow the user to ignore the user if its not ourselves
  // same goes for jumping to read receipt


  if (!isMe) {
    const onIgnoreToggle = () => {
      const ignoredUsers = cli.getIgnoredUsers();

      if (isIgnored) {
        const index = ignoredUsers.indexOf(member.userId);
        if (index !== -1) ignoredUsers.splice(index, 1);
      } else {
        ignoredUsers.push(member.userId);
      }

      cli.setIgnoredUsers(ignoredUsers);
    };

    ignoreButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onIgnoreToggle,
      className: (0, _classnames.default)("mx_UserInfo_field", {
        mx_UserInfo_destructive: !isIgnored
      })
    }, isIgnored ? (0, _languageHandler._t)("Unignore") : (0, _languageHandler._t)("Ignore"));

    if (member.roomId && !isSpace) {
      const onReadReceiptButton = function () {
        const room = cli.getRoom(member.roomId);

        _dispatcher.default.dispatch({
          action: 'view_room',
          highlighted: true,
          event_id: room.getEventReadUpTo(member.userId),
          room_id: member.roomId
        });
      };

      const onInsertPillButton = function () {
        _dispatcher.default.dispatch({
          action: 'insert_mention',
          user_id: member.userId
        });
      };

      const room = cli.getRoom(member.roomId);

      if (room?.getEventReadUpTo(member.userId)) {
        readReceiptButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: onReadReceiptButton,
          className: "mx_UserInfo_field"
        }, (0, _languageHandler._t)('Jump to read receipt'));
      }

      insertPillButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: onInsertPillButton,
        className: "mx_UserInfo_field"
      }, (0, _languageHandler._t)('Mention'));
    }

    if (canInvite && (!member || !member.membership || member.membership === 'leave')) {
      const roomId = member && member.roomId ? member.roomId : _RoomViewStore.default.getRoomId();

      const onInviteUserButton = async () => {
        try {
          // We use a MultiInviter to re-use the invite logic, even though
          // we're only inviting one user.
          const inviter = new _MultiInviter.default(roomId);
          await inviter.invite([member.userId]).then(() => {
            if (inviter.getCompletionState(member.userId) !== "invited") {
              throw new Error(inviter.getErrorText(member.userId));
            }
          });
        } catch (err) {
          _Modal.default.createTrackedDialog('Failed to invite', '', _ErrorDialog.default, {
            title: (0, _languageHandler._t)('Failed to invite'),
            description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
          });
        }
      };

      inviteUserButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: onInviteUserButton,
        className: "mx_UserInfo_field"
      }, (0, _languageHandler._t)('Invite'));
    }
  }

  const shareUserButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    onClick: onShareUserClick,
    className: "mx_UserInfo_field"
  }, (0, _languageHandler._t)('Share Link to User'));

  let directMessageButton;

  if (!isMe) {
    directMessageButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: () => openDMForUser(cli, member.userId),
      className: "mx_UserInfo_field"
    }, (0, _languageHandler._t)('Direct message'));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Options")), /*#__PURE__*/_react.default.createElement("div", null, directMessageButton, readReceiptButton, shareUserButton, insertPillButton, inviteUserButton, ignoreButton));
};

const warnSelfDemote = async isSpace => {
  const {
    finished
  } = _Modal.default.createTrackedDialog('Demoting Self', '', _QuestionDialog.default, {
    title: (0, _languageHandler._t)("Demote yourself?"),
    description: /*#__PURE__*/_react.default.createElement("div", null, isSpace ? (0, _languageHandler._t)("You will not be able to undo this change as you are demoting yourself, " + "if you are the last privileged user in the space it will be impossible " + "to regain privileges.") : (0, _languageHandler._t)("You will not be able to undo this change as you are demoting yourself, " + "if you are the last privileged user in the room it will be impossible " + "to regain privileges.")),
    button: (0, _languageHandler._t)("Demote")
  });

  const [confirmed] = await finished;
  return confirmed;
};

const GenericAdminToolsContainer
/*: React.FC<{}>*/
= ({
  children
}) => {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Admin Tools")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_buttons"
  }, children));
};

const isMuted = (member
/*: RoomMember*/
, powerLevelContent
/*: IPowerLevelsContent*/
) => {
  if (!powerLevelContent || !member) return false;
  const levelToSend = (powerLevelContent.events ? powerLevelContent.events["m.room.message"] : null) || powerLevelContent.events_default;
  return member.powerLevel < levelToSend;
};

const useRoomPowerLevels = (cli
/*: MatrixClient*/
, room
/*: Room*/
) => {
  const [powerLevels, setPowerLevels] = (0, _react.useState)({});
  const update = (0, _react.useCallback)((ev
  /*: MatrixEvent*/
  ) => {
    if (!room) return;
    if (ev && ev.getType() !== _event.EventType.RoomPowerLevels) return;
    const event = room.currentState.getStateEvents(_event.EventType.RoomPowerLevels, "");

    if (event) {
      setPowerLevels(event.getContent());
    } else {
      setPowerLevels({});
    }

    return () => {
      setPowerLevels({});
    };
  }, [room]);
  (0, _useEventEmitter.useEventEmitter)(cli, "RoomState.events", update);
  (0, _react.useEffect)(() => {
    update();
    return () => {
      setPowerLevels({});
    };
  }, [update]);
  return powerLevels;
};

exports.useRoomPowerLevels = useRoomPowerLevels;

const RoomKickButton
/*: React.FC<IBaseProps>*/
= ({
  member,
  startUpdating,
  stopUpdating
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default); // check if user can be kicked/disinvited

  if (member.membership !== "invite" && member.membership !== "join") return null;

  const onKick = async () => {
    const {
      finished
    } = _Modal.default.createTrackedDialog('Confirm User Action Dialog', 'onKick', _ConfirmUserActionDialog.default, {
      member,
      action: member.membership === "invite" ? (0, _languageHandler._t)("Disinvite") : (0, _languageHandler._t)("Kick"),
      title: member.membership === "invite" ? (0, _languageHandler._t)("Disinvite this user?") : (0, _languageHandler._t)("Kick this user?"),
      askReason: member.membership === "join",
      danger: true
    });

    const [proceed, reason] = await finished;
    if (!proceed) return;
    startUpdating();
    cli.kick(member.roomId, member.userId, reason || undefined).then(() => {
      // NO-OP; rely on the m.room.member event coming down else we could
      // get out of sync if we force setState here!
      console.log("Kick success");
    }, function (err) {
      console.error("Kick error: " + err);

      _Modal.default.createTrackedDialog('Failed to kick', '', _ErrorDialog.default, {
        title: (0, _languageHandler._t)("Failed to kick"),
        description: err && err.message ? err.message : "Operation failed"
      });
    }).finally(() => {
      stopUpdating();
    });
  };

  const kickLabel = member.membership === "invite" ? (0, _languageHandler._t)("Disinvite") : (0, _languageHandler._t)("Kick");
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_UserInfo_field mx_UserInfo_destructive",
    onClick: onKick
  }, kickLabel);
};

const RedactMessagesButton
/*: React.FC<IBaseProps>*/
= ({
  member
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);

  const onRedactAllMessages = async () => {
    const {
      roomId,
      userId
    } = member;
    const room = cli.getRoom(roomId);

    if (!room) {
      return;
    }

    let timeline = room.getLiveTimeline();
    let eventsToRedact = [];

    while (timeline) {
      eventsToRedact = timeline.getEvents().reduce((events, event) => {
        if (event.getSender() === userId && !event.isRedacted() && !event.isRedaction() && event.getType() !== _event.EventType.RoomCreate && // Don't redact ACLs because that'll obliterate the room
        // See https://github.com/matrix-org/synapse/issues/4042 for details.
        event.getType() !== _event.EventType.RoomServerAcl) {
          return events.concat(event);
        } else {
          return events;
        }
      }, eventsToRedact);
      timeline = timeline.getNeighbouringTimeline(_eventTimeline.EventTimeline.BACKWARDS);
    }

    const count = eventsToRedact.length;
    const user = member.name;

    if (count === 0) {
      _Modal.default.createTrackedDialog('No user messages found to remove', '', _InfoDialog.default, {
        title: (0, _languageHandler._t)("No recent messages by %(user)s found", {
          user
        }),
        description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Try scrolling up in the timeline to see if there are any earlier ones.")))
      });
    } else {
      const {
        finished
      } = _Modal.default.createTrackedDialog('Remove recent messages by user', '', _QuestionDialog.default, {
        title: (0, _languageHandler._t)("Remove recent messages by %(user)s", {
          user
        }),
        description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are about to remove %(count)s messages by %(user)s. " + "This cannot be undone. Do you wish to continue?", {
          count,
          user
        })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("For a large amount of messages, this might take some time. " + "Please don't refresh your client in the meantime."))),
        button: (0, _languageHandler._t)("Remove %(count)s messages", {
          count
        })
      });

      const [confirmed] = await finished;

      if (!confirmed) {
        return;
      } // Submitting a large number of redactions freezes the UI,
      // so first yield to allow to rerender after closing the dialog.


      await Promise.resolve();
      console.info(`Started redacting recent ${count} messages for ${user} in ${roomId}`);
      await Promise.all(eventsToRedact.map(async event => {
        try {
          await cli.redactEvent(roomId, event.getId());
        } catch (err) {
          // log and swallow errors
          console.error("Could not redact", event.getId());
          console.error(err);
        }
      }));
      console.info(`Finished redacting recent ${count} messages for ${user} in ${roomId}`);
    }
  };

  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_UserInfo_field mx_UserInfo_destructive",
    onClick: onRedactAllMessages
  }, (0, _languageHandler._t)("Remove recent messages"));
};

const BanToggleButton
/*: React.FC<IBaseProps>*/
= ({
  member,
  startUpdating,
  stopUpdating
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);

  const onBanOrUnban = async () => {
    const {
      finished
    } = _Modal.default.createTrackedDialog('Confirm User Action Dialog', 'onBanOrUnban', _ConfirmUserActionDialog.default, {
      member,
      action: member.membership === 'ban' ? (0, _languageHandler._t)("Unban") : (0, _languageHandler._t)("Ban"),
      title: member.membership === 'ban' ? (0, _languageHandler._t)("Unban this user?") : (0, _languageHandler._t)("Ban this user?"),
      askReason: member.membership !== 'ban',
      danger: member.membership !== 'ban'
    });

    const [proceed, reason] = await finished;
    if (!proceed) return;
    startUpdating();
    let promise;

    if (member.membership === 'ban') {
      promise = cli.unban(member.roomId, member.userId);
    } else {
      promise = cli.ban(member.roomId, member.userId, reason || undefined);
    }

    promise.then(() => {
      // NO-OP; rely on the m.room.member event coming down else we could
      // get out of sync if we force setState here!
      console.log("Ban success");
    }, function (err) {
      console.error("Ban error: " + err);

      _Modal.default.createTrackedDialog('Failed to ban user', '', _ErrorDialog.default, {
        title: (0, _languageHandler._t)("Error"),
        description: (0, _languageHandler._t)("Failed to ban user")
      });
    }).finally(() => {
      stopUpdating();
    });
  };

  let label = (0, _languageHandler._t)("Ban");

  if (member.membership === 'ban') {
    label = (0, _languageHandler._t)("Unban");
  }

  const classes = (0, _classnames.default)("mx_UserInfo_field", {
    mx_UserInfo_destructive: member.membership !== 'ban'
  });
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: classes,
    onClick: onBanOrUnban
  }, label);
};

const MuteToggleButton
/*: React.FC<IBaseRoomProps>*/
= ({
  member,
  room,
  powerLevels,
  startUpdating,
  stopUpdating
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default); // Don't show the mute/unmute option if the user is not in the room

  if (member.membership !== "join") return null;
  const muted = isMuted(member, powerLevels);

  const onMuteToggle = async () => {
    const roomId = member.roomId;
    const target = member.userId; // if muting self, warn as it may be irreversible

    if (target === cli.getUserId()) {
      try {
        if (!(await warnSelfDemote(room?.isSpaceRoom()))) return;
      } catch (e) {
        console.error("Failed to warn about self demotion: ", e);
        return;
      }
    }

    const powerLevelEvent = room.currentState.getStateEvents("m.room.power_levels", "");
    if (!powerLevelEvent) return;
    const powerLevels = powerLevelEvent.getContent();
    const levelToSend = (powerLevels.events ? powerLevels.events["m.room.message"] : null) || powerLevels.events_default;
    let level;

    if (muted) {
      // unmute
      level = levelToSend;
    } else {
      // mute
      level = levelToSend - 1;
    }

    level = parseInt(level);

    if (!isNaN(level)) {
      startUpdating();
      cli.setPowerLevel(roomId, target, level, powerLevelEvent).then(() => {
        // NO-OP; rely on the m.room.member event coming down else we could
        // get out of sync if we force setState here!
        console.log("Mute toggle success");
      }, function (err) {
        console.error("Mute error: " + err);

        _Modal.default.createTrackedDialog('Failed to mute user', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error"),
          description: (0, _languageHandler._t)("Failed to mute user")
        });
      }).finally(() => {
        stopUpdating();
      });
    }
  };

  const classes = (0, _classnames.default)("mx_UserInfo_field", {
    mx_UserInfo_destructive: !muted
  });
  const muteLabel = muted ? (0, _languageHandler._t)("Unmute") : (0, _languageHandler._t)("Mute");
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: classes,
    onClick: onMuteToggle
  }, muteLabel);
};

const RoomAdminToolsContainer
/*: React.FC<IBaseRoomProps>*/
= ({
  room,
  children,
  member,
  startUpdating,
  stopUpdating,
  powerLevels
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  let kickButton;
  let banButton;
  let muteButton;
  let redactButton;
  const editPowerLevel = (powerLevels.events ? powerLevels.events["m.room.power_levels"] : null) || powerLevels.state_default; // if these do not exist in the event then they should default to 50 as per the spec

  const {
    ban: banPowerLevel = 50,
    kick: kickPowerLevel = 50,
    redact: redactPowerLevel = 50
  } = powerLevels;
  const me = room.getMember(cli.getUserId());

  if (!me) {
    // we aren't in the room, so return no admin tooling
    return /*#__PURE__*/_react.default.createElement("div", null);
  }

  const isMe = me.userId === member.userId;
  const canAffectUser = member.powerLevel < me.powerLevel || isMe;

  if (canAffectUser && me.powerLevel >= kickPowerLevel) {
    kickButton = /*#__PURE__*/_react.default.createElement(RoomKickButton, {
      member: member,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    });
  }

  if (me.powerLevel >= redactPowerLevel && !room.isSpaceRoom()) {
    redactButton = /*#__PURE__*/_react.default.createElement(RedactMessagesButton, {
      member: member,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    });
  }

  if (canAffectUser && me.powerLevel >= banPowerLevel) {
    banButton = /*#__PURE__*/_react.default.createElement(BanToggleButton, {
      member: member,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    });
  }

  if (canAffectUser && me.powerLevel >= editPowerLevel) {
    muteButton = /*#__PURE__*/_react.default.createElement(MuteToggleButton, {
      member: member,
      room: room,
      powerLevels: powerLevels,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    });
  }

  if (kickButton || banButton || muteButton || redactButton || children) {
    return /*#__PURE__*/_react.default.createElement(GenericAdminToolsContainer, null, muteButton, kickButton, banButton, redactButton, children);
  }

  return /*#__PURE__*/_react.default.createElement("div", null);
};

const GroupAdminToolsSection
/*: React.FC<{
    groupId: string;
    groupMember: GroupMember;
    startUpdating(): void;
    stopUpdating(): void;
}>*/
= ({
  children,
  groupId,
  groupMember,
  startUpdating,
  stopUpdating
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [isPrivileged, setIsPrivileged] = (0, _react.useState)(false);
  const [isInvited, setIsInvited] = (0, _react.useState)(false); // Listen to group store changes

  (0, _react.useEffect)(() => {
    let unmounted = false;

    const onGroupStoreUpdated = () => {
      if (unmounted) return;
      setIsPrivileged(_GroupStore.default.isUserPrivileged(groupId));
      setIsInvited(_GroupStore.default.getGroupInvitedMembers(groupId).some(m => m.userId === groupMember.userId));
    };

    _GroupStore.default.registerListener(groupId, onGroupStoreUpdated);

    onGroupStoreUpdated(); // Handle unmount

    return () => {
      unmounted = true;

      _GroupStore.default.unregisterListener(onGroupStoreUpdated);
    };
  }, [groupId, groupMember.userId]);

  if (isPrivileged) {
    const onKick = async () => {
      const {
        finished
      } = _Modal.default.createDialog(_ConfirmUserActionDialog.default, {
        matrixClient: cli,
        groupMember,
        action: isInvited ? (0, _languageHandler._t)('Disinvite') : (0, _languageHandler._t)('Remove from community'),
        title: isInvited ? (0, _languageHandler._t)('Disinvite this user from community?') : (0, _languageHandler._t)('Remove this user from community?'),
        danger: true
      });

      const [proceed] = await finished;
      if (!proceed) return;
      startUpdating();
      cli.removeUserFromGroup(groupId, groupMember.userId).then(() => {
        // return to the user list
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewUser,
          member: null
        });
      }).catch(e => {
        _Modal.default.createTrackedDialog('Failed to remove user from group', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)('Error'),
          description: isInvited ? (0, _languageHandler._t)('Failed to withdraw invitation') : (0, _languageHandler._t)('Failed to remove user from community')
        });

        console.log(e);
      }).finally(() => {
        stopUpdating();
      });
    };

    const kickButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_UserInfo_field mx_UserInfo_destructive",
      onClick: onKick
    }, isInvited ? (0, _languageHandler._t)('Disinvite') : (0, _languageHandler._t)('Remove from community')); // No make/revoke admin API yet

    /*const opLabel = this.state.isTargetMod ? _t("Revoke Moderator") : _t("Make Moderator");
    giveModButton = <AccessibleButton className="mx_UserInfo_field" onClick={this.onModToggle}>
        {giveOpLabel}
    </AccessibleButton>;*/


    return /*#__PURE__*/_react.default.createElement(GenericAdminToolsContainer, null, kickButton, children);
  }

  return /*#__PURE__*/_react.default.createElement("div", null);
};

const useIsSynapseAdmin = (cli
/*: MatrixClient*/
) => {
  const [isAdmin, setIsAdmin] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    cli.isSynapseAdministrator().then(isAdmin => {
      setIsAdmin(isAdmin);
    }, () => {
      setIsAdmin(false);
    });
  }, [cli]);
  return isAdmin;
};

const useHomeserverSupportsCrossSigning = (cli
/*: MatrixClient*/
) => {
  return (0, _useAsyncMemo.useAsyncMemo)(async () => {
    return cli.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing");
  }, [cli], false);
};

function useRoomPermissions(cli
/*: MatrixClient*/
, room
/*: Room*/
, user
/*: User*/
)
/*: IRoomPermissions*/
{
  const [roomPermissions, setRoomPermissions] = (0, _react.useState)({
    // modifyLevelMax is the max PL we can set this user to, typically min(their PL, our PL) && canSetPL
    modifyLevelMax: -1,
    canEdit: false,
    canInvite: false
  });
  const updateRoomPermissions = (0, _react.useCallback)(() => {
    if (!room) {
      return;
    }

    const powerLevelEvent = room.currentState.getStateEvents("m.room.power_levels", "");
    if (!powerLevelEvent) return;
    const powerLevels = powerLevelEvent.getContent();
    if (!powerLevels) return;
    const me = room.getMember(cli.getUserId());
    if (!me) return;
    const them = user;
    const isMe = me.userId === them.userId;
    const canAffectUser = them.powerLevel < me.powerLevel || isMe;
    let modifyLevelMax = -1;

    if (canAffectUser) {
      const editPowerLevel = (powerLevels.events ? powerLevels.events["m.room.power_levels"] : null) || powerLevels.state_default;

      if (me.powerLevel >= editPowerLevel && (isMe || me.powerLevel > them.powerLevel)) {
        modifyLevelMax = me.powerLevel;
      }
    }

    setRoomPermissions({
      canInvite: me.powerLevel >= powerLevels.invite,
      canEdit: modifyLevelMax >= 0,
      modifyLevelMax
    });
  }, [cli, user, room]);
  (0, _useEventEmitter.useEventEmitter)(cli, "RoomState.members", updateRoomPermissions);
  (0, _react.useEffect)(() => {
    updateRoomPermissions();
    return () => {
      setRoomPermissions({
        modifyLevelMax: -1,
        canEdit: false,
        canInvite: false
      });
    };
  }, [updateRoomPermissions]);
  return roomPermissions;
}

const PowerLevelSection
/*: React.FC<{
    user: User;
    room: Room;
    roomPermissions: IRoomPermissions;
    powerLevels: IPowerLevelsContent;
}>*/
= ({
  user,
  room,
  roomPermissions,
  powerLevels
}) => {
  if (roomPermissions.canEdit) {
    return /*#__PURE__*/_react.default.createElement(PowerLevelEditor, {
      user: user,
      room: room,
      roomPermissions: roomPermissions
    });
  } else {
    const powerLevelUsersDefault = powerLevels.users_default || 0;
    const powerLevel = parseInt(user.powerLevel, 10);
    const role = (0, _Roles.textualPowerLevel)(powerLevel, powerLevelUsersDefault);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_profileField"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_roleDescription"
    }, role));
  }
};

const PowerLevelEditor
/*: React.FC<{
    user: User;
    room: Room;
    roomPermissions: IRoomPermissions;
}>*/
= ({
  user,
  room,
  roomPermissions
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [selectedPowerLevel, setSelectedPowerLevel] = (0, _react.useState)(parseInt(user.powerLevel, 10));
  const onPowerChange = (0, _react.useCallback)(async (powerLevelStr
  /*: string*/
  ) => {
    const powerLevel = parseInt(powerLevelStr, 10);
    setSelectedPowerLevel(powerLevel);

    const applyPowerChange = (roomId, target, powerLevel, powerLevelEvent) => {
      return cli.setPowerLevel(roomId, target, parseInt(powerLevel), powerLevelEvent).then(function () {
        // NO-OP; rely on the m.room.member event coming down else we could
        // get out of sync if we force setState here!
        console.log("Power change success");
      }, function (err) {
        console.error("Failed to change power level " + err);

        _Modal.default.createTrackedDialog('Failed to change power level', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error"),
          description: (0, _languageHandler._t)("Failed to change power level")
        });
      });
    };

    const roomId = user.roomId;
    const target = user.userId;
    const powerLevelEvent = room.currentState.getStateEvents("m.room.power_levels", "");
    if (!powerLevelEvent) return;
    const myUserId = cli.getUserId();
    const myPower = powerLevelEvent.getContent().users[myUserId];

    if (myPower && parseInt(myPower) === powerLevel) {
      const {
        finished
      } = _Modal.default.createTrackedDialog('Promote to PL100 Warning', '', _QuestionDialog.default, {
        title: (0, _languageHandler._t)("Warning!"),
        description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("You will not be able to undo this change as you are promoting the user " + "to have the same power level as yourself."), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Are you sure?")),
        button: (0, _languageHandler._t)("Continue")
      });

      const [confirmed] = await finished;
      if (!confirmed) return;
    } else if (myUserId === target) {
      // If we are changing our own PL it can only ever be decreasing, which we cannot reverse.
      try {
        if (!(await warnSelfDemote(room?.isSpaceRoom()))) return;
      } catch (e) {
        console.error("Failed to warn about self demotion: ", e);
      }
    }

    await applyPowerChange(roomId, target, powerLevel, powerLevelEvent);
  }, [user.roomId, user.userId, cli, room]);
  const powerLevelEvent = room.currentState.getStateEvents("m.room.power_levels", "");
  const powerLevelUsersDefault = powerLevelEvent ? powerLevelEvent.getContent().users_default : 0;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_profileField"
  }, /*#__PURE__*/_react.default.createElement(_PowerSelector.default, {
    label: null,
    value: selectedPowerLevel,
    maxValue: roomPermissions.modifyLevelMax,
    usersDefault: powerLevelUsersDefault,
    onChange: onPowerChange
  }));
};

const useDevices = (userId
/*: string*/
) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default); // undefined means yet to be loaded, null means failed to load, otherwise list of devices

  const [devices, setDevices] = (0, _react.useState)(undefined); // Download device lists

  (0, _react.useEffect)(() => {
    setDevices(undefined);
    let cancelled = false;

    async function downloadDeviceList() {
      try {
        await cli.downloadKeys([userId], true);
        const devices = cli.getStoredDevicesForUser(userId);

        if (cancelled) {
          // we got cancelled - presumably a different user now
          return;
        }

        disambiguateDevices(devices);
        setDevices(devices);
      } catch (err) {
        setDevices(null);
      }
    }

    downloadDeviceList(); // Handle being unmounted

    return () => {
      cancelled = true;
    };
  }, [cli, userId]); // Listen to changes

  (0, _react.useEffect)(() => {
    let cancel = false;

    const updateDevices = async () => {
      const newDevices = cli.getStoredDevicesForUser(userId);
      if (cancel) return;
      setDevices(newDevices);
    };

    const onDevicesUpdated = users => {
      if (!users.includes(userId)) return;
      updateDevices();
    };

    const onDeviceVerificationChanged = (_userId, device) => {
      if (_userId !== userId) return;
      updateDevices();
    };

    const onUserTrustStatusChanged = (_userId, trustStatus) => {
      if (_userId !== userId) return;
      updateDevices();
    };

    cli.on("crypto.devicesUpdated", onDevicesUpdated);
    cli.on("deviceVerificationChanged", onDeviceVerificationChanged);
    cli.on("userTrustStatusChanged", onUserTrustStatusChanged); // Handle being unmounted

    return () => {
      cancel = true;
      cli.removeListener("crypto.devicesUpdated", onDevicesUpdated);
      cli.removeListener("deviceVerificationChanged", onDeviceVerificationChanged);
      cli.removeListener("userTrustStatusChanged", onUserTrustStatusChanged);
    };
  }, [cli, userId]);
  return devices;
};

exports.useDevices = useDevices;

const BasicUserInfo
/*: React.FC<{
    room: Room;
    member: User | RoomMember;
    groupId: string;
    devices: IDevice[];
    isRoomEncrypted: boolean;
}>*/
= ({
  room,
  member,
  groupId,
  devices,
  isRoomEncrypted
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const powerLevels = useRoomPowerLevels(cli, room); // Load whether or not we are a Synapse Admin

  const isSynapseAdmin = useIsSynapseAdmin(cli); // Check whether the user is ignored

  const [isIgnored, setIsIgnored] = (0, _react.useState)(cli.isUserIgnored(member.userId)); // Recheck if the user or client changes

  (0, _react.useEffect)(() => {
    setIsIgnored(cli.isUserIgnored(member.userId));
  }, [cli, member.userId]); // Recheck also if we receive new accountData m.ignored_user_list

  const accountDataHandler = (0, _react.useCallback)(ev => {
    if (ev.getType() === "m.ignored_user_list") {
      setIsIgnored(cli.isUserIgnored(member.userId));
    }
  }, [cli, member.userId]);
  (0, _useEventEmitter.useEventEmitter)(cli, "accountData", accountDataHandler); // Count of how many operations are currently in progress, if > 0 then show a Spinner

  const [pendingUpdateCount, setPendingUpdateCount] = (0, _react.useState)(0);
  const startUpdating = (0, _react.useCallback)(() => {
    setPendingUpdateCount(pendingUpdateCount + 1);
  }, [pendingUpdateCount]);
  const stopUpdating = (0, _react.useCallback)(() => {
    setPendingUpdateCount(pendingUpdateCount - 1);
  }, [pendingUpdateCount]);
  const roomPermissions = useRoomPermissions(cli, room, member);
  const onSynapseDeactivate = (0, _react.useCallback)(async () => {
    const {
      finished
    } = _Modal.default.createTrackedDialog('Synapse User Deactivation', '', _QuestionDialog.default, {
      title: (0, _languageHandler._t)("Deactivate user?"),
      description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Deactivating this user will log them out and prevent them from logging back in. Additionally, " + "they will leave all the rooms they are in. This action cannot be reversed. Are you sure you " + "want to deactivate this user?")),
      button: (0, _languageHandler._t)("Deactivate user"),
      danger: true
    });

    const [accepted] = await finished;
    if (!accepted) return;

    try {
      await cli.deactivateSynapseUser(member.userId);
    } catch (err) {
      console.error("Failed to deactivate user");
      console.error(err);

      _Modal.default.createTrackedDialog('Failed to deactivate Synapse user', '', _ErrorDialog.default, {
        title: (0, _languageHandler._t)('Failed to deactivate user'),
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });
    }
  }, [cli, member.userId]);
  let synapseDeactivateButton;
  let spinner; // We don't need a perfect check here, just something to pass as "probably not our homeserver". If
  // someone does figure out how to bypass this check the worst that happens is an error.
  // FIXME this should be using cli instead of MatrixClientPeg.matrixClient

  if (isSynapseAdmin && member.userId.endsWith(`:${_MatrixClientPeg.MatrixClientPeg.getHomeserverName()}`)) {
    synapseDeactivateButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onSynapseDeactivate,
      className: "mx_UserInfo_field mx_UserInfo_destructive"
    }, (0, _languageHandler._t)("Deactivate user"));
  }

  let adminToolsContainer;

  if (room && member.roomId) {
    adminToolsContainer = /*#__PURE__*/_react.default.createElement(RoomAdminToolsContainer, {
      powerLevels: powerLevels,
      member: member,
      room: room,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    }, synapseDeactivateButton);
  } else if (groupId) {
    adminToolsContainer = /*#__PURE__*/_react.default.createElement(GroupAdminToolsSection, {
      groupId: groupId,
      groupMember: member,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    }, synapseDeactivateButton);
  } else if (synapseDeactivateButton) {
    adminToolsContainer = /*#__PURE__*/_react.default.createElement(GenericAdminToolsContainer, null, synapseDeactivateButton);
  }

  if (pendingUpdateCount > 0) {
    spinner = /*#__PURE__*/_react.default.createElement(_Spinner.default, {
      imgClassName: "mx_ContextualMenu_spinner"
    });
  }

  let memberDetails; // hide the Roles section for DMs as it doesn't make sense there

  if (room && member.roomId && !_DMRoomMap.default.shared().getUserIdForRoomId(member.roomId)) {
    memberDetails = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_container"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Role")), /*#__PURE__*/_react.default.createElement(PowerLevelSection, {
      powerLevels: powerLevels,
      user: member,
      room: room,
      roomPermissions: roomPermissions
    }));
  } // only display the devices list if our client supports E2E


  const cryptoEnabled = cli.isCryptoEnabled();
  let text;

  if (!isRoomEncrypted) {
    if (!cryptoEnabled) {
      text = (0, _languageHandler._t)("This client does not support end-to-end encryption.");
    } else if (room && !room.isSpaceRoom()) {
      text = (0, _languageHandler._t)("Messages in this room are not end-to-end encrypted.");
    }
  } else if (!room.isSpaceRoom()) {
    text = (0, _languageHandler._t)("Messages in this room are end-to-end encrypted.");
  }

  let verifyButton;
  const homeserverSupportsCrossSigning = useHomeserverSupportsCrossSigning(cli);
  const userTrust = cryptoEnabled && cli.checkUserTrust(member.userId);
  const userVerified = cryptoEnabled && userTrust.isCrossSigningVerified();
  const isMe = member.userId === cli.getUserId();
  const canVerify = cryptoEnabled && homeserverSupportsCrossSigning && !userVerified && !isMe && devices && devices.length > 0;

  const setUpdating = updating => {
    setPendingUpdateCount(count => count + (updating ? 1 : -1));
  };

  const hasCrossSigningKeys = useHasCrossSigningKeys(cli, member, canVerify, setUpdating);
  const showDeviceListSpinner = devices === undefined;

  if (canVerify) {
    if (hasCrossSigningKeys !== undefined) {
      // Note: mx_UserInfo_verifyButton is for the end-to-end tests
      verifyButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_UserInfo_field mx_UserInfo_verifyButton",
        onClick: () => {
          if (hasCrossSigningKeys) {
            (0, _verification.verifyUser)(member);
          } else {
            (0, _verification.legacyVerifyUser)(member);
          }
        }
      }, (0, _languageHandler._t)("Verify"));
    } else if (!showDeviceListSpinner) {
      // HACK: only show a spinner if the device section spinner is not shown,
      // to avoid showing a double spinner
      // We should ask for a design that includes all the different loading states here
      verifyButton = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }
  }

  let editDevices;

  if (member.userId == cli.getUserId()) {
    editDevices = /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_UserInfo_field",
      onClick: () => {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewUserSettings,
          initialTabId: _UserSettingsDialog.USER_SECURITY_TAB
        });
      }
    }, (0, _languageHandler._t)("Edit devices")));
  }

  const securitySection = /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Security")), /*#__PURE__*/_react.default.createElement("p", null, text), verifyButton, cryptoEnabled && /*#__PURE__*/_react.default.createElement(DevicesSection, {
    loading: showDeviceListSpinner,
    devices: devices,
    userId: member.userId
  }), editDevices);

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, memberDetails, securitySection, /*#__PURE__*/_react.default.createElement(UserOptionsSection, {
    canInvite: roomPermissions.canInvite,
    isIgnored: isIgnored,
    member: member,
    isSpace: room?.isSpaceRoom()
  }), adminToolsContainer, spinner);
};

const UserInfoHeader
/*: React.FC<{
    member: Member;
    e2eStatus: E2EStatus;
}>*/
= ({
  member,
  e2eStatus
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const onMemberAvatarClick = (0, _react.useCallback)(() => {
    const avatarUrl = member.getMxcAvatarUrl ? member.getMxcAvatarUrl() : member.avatarUrl;
    if (!avatarUrl) return;
    const httpUrl = (0, _Media.mediaFromMxc)(avatarUrl).srcHttp;
    const params = {
      src: httpUrl,
      name: member.name
    };

    _Modal.default.createDialog(_ImageView.default, params, "mx_Dialog_lightbox", null, true);
  }, [member]);

  const avatarElement = /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_avatar"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
    key: member.userId // to instantly blank the avatar when UserInfo changes members
    ,
    member: member,
    width: 2 * 0.3 * window.innerHeight // 2x@30vh
    ,
    height: 2 * 0.3 * window.innerHeight // 2x@30vh
    ,
    resizeMethod: "scale",
    fallbackUserId: member.userId,
    onClick: onMemberAvatarClick,
    urls: member.avatarUrl ? [member.avatarUrl] : undefined
  }))));

  let presenceState;
  let presenceLastActiveAgo;
  let presenceCurrentlyActive;
  let statusMessage;

  if (member instanceof _roomMember.RoomMember && member.user) {
    presenceState = member.user.presence;
    presenceLastActiveAgo = member.user.lastActiveAgo;
    presenceCurrentlyActive = member.user.currentlyActive;

    if (_SettingsStore.default.getValue("feature_custom_status")) {
      statusMessage = member.user._unstable_statusMessage;
    }
  }

  const enablePresenceByHsUrl = _SdkConfig.default.get()["enable_presence_by_hs_url"];

  let showPresence = true;

  if (enablePresenceByHsUrl && enablePresenceByHsUrl[cli.baseUrl] !== undefined) {
    showPresence = enablePresenceByHsUrl[cli.baseUrl];
  }

  let presenceLabel = null;

  if (showPresence) {
    presenceLabel = /*#__PURE__*/_react.default.createElement(_PresenceLabel.default, {
      activeAgo: presenceLastActiveAgo,
      currentlyActive: presenceCurrentlyActive,
      presenceState: presenceState
    });
  }

  let statusLabel = null;

  if (statusMessage) {
    statusLabel = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UserInfo_statusMessage"
    }, statusMessage);
  }

  let e2eIcon;

  if (e2eStatus) {
    e2eIcon = /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
      size: 18,
      status: e2eStatus,
      isUser: true
    });
  }

  const displayName = member.rawDisplayName || member.displayname;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, avatarElement, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container mx_UserInfo_separator"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_profile"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h2", null, e2eIcon, /*#__PURE__*/_react.default.createElement("span", {
    title: displayName,
    "aria-label": displayName
  }, displayName))), /*#__PURE__*/_react.default.createElement("div", null, member.userId), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_profileStatus"
  }, presenceLabel, statusLabel))));
};

const UserInfo
/*: React.FC<Props>*/
= (_ref) => {
  let {
    user,
    groupId,
    room,
    onClose,
    phase = _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, ["user", "groupId", "room", "onClose", "phase"]);
  const cli = (0, _react.useContext)(_MatrixClientContext.default); // fetch latest room member if we have a room, so we don't show historical information, falling back to user

  const member = (0, _react.useMemo)(() => room ? room.getMember(user.userId) || user : user, [room, user]);
  const isRoomEncrypted = (0, _useIsEncrypted.useIsEncrypted)(cli, room);
  const devices = useDevices(user.userId);
  let e2eStatus;

  if (isRoomEncrypted && devices) {
    e2eStatus = getE2EStatus(cli, user.userId, devices);
  }

  const classes = ["mx_UserInfo"];
  let refireParams;
  let previousPhase
  /*: RightPanelPhases*/
  ; // We have no previousPhase for when viewing a UserInfo from a Group or without a Room at this time

  if (room && phase === _RightPanelStorePhases.RightPanelPhases.EncryptionPanel) {
    previousPhase = _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo;
    refireParams = {
      member: member
    };
  } else if (room) {
    previousPhase = previousPhase = room.isSpaceRoom() ? _RightPanelStorePhases.RightPanelPhases.SpaceMemberList : _RightPanelStorePhases.RightPanelPhases.RoomMemberList;
  }

  const onEncryptionPanelClose = () => {
    _dispatcher.default.dispatch({
      action: _actions.Action.SetRightPanelPhase,
      phase: previousPhase,
      refireParams: refireParams
    });
  };

  let content;

  switch (phase) {
    case _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo:
    case _RightPanelStorePhases.RightPanelPhases.GroupMemberInfo:
    case _RightPanelStorePhases.RightPanelPhases.SpaceMemberInfo:
      content = /*#__PURE__*/_react.default.createElement(BasicUserInfo, {
        room: room,
        member: member,
        groupId: groupId,
        devices: devices,
        isRoomEncrypted: isRoomEncrypted
      });
      break;

    case _RightPanelStorePhases.RightPanelPhases.EncryptionPanel:
      classes.push("mx_UserInfo_smallAvatar");
      content = /*#__PURE__*/_react.default.createElement(_EncryptionPanel.default, (0, _extends2.default)({}, props, {
        member: member,
        onClose: onEncryptionPanelClose,
        isRoomEncrypted: isRoomEncrypted
      }));
      break;
  }

  let closeLabel = undefined;

  if (phase === _RightPanelStorePhases.RightPanelPhases.EncryptionPanel) {
    const verificationRequest = props.verificationRequest;

    if (verificationRequest && verificationRequest.pending) {
      closeLabel = (0, _languageHandler._t)("Cancel");
    }
  }

  let scopeHeader;

  if (room?.isSpaceRoom()) {
    scopeHeader = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RightPanel_scopeHeader"
    }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      height: 32,
      width: 32
    }), /*#__PURE__*/_react.default.createElement(_RoomName.default, {
      room: room
    }));
  }

  const header = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, scopeHeader, /*#__PURE__*/_react.default.createElement(UserInfoHeader, {
    member: member,
    e2eStatus: e2eStatus
  }));

  return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
    className: classes.join(" "),
    header: header,
    onClose: onClose,
    closeLabel: closeLabel,
    previousPhase: previousPhase,
    refireParams: refireParams
  }, content);
};

var _default = UserInfo;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3JpZ2h0X3BhbmVsL1VzZXJJbmZvLnRzeCJdLCJuYW1lcyI6WyJkaXNhbWJpZ3VhdGVEZXZpY2VzIiwiZGV2aWNlcyIsIm5hbWVzIiwiT2JqZWN0IiwiY3JlYXRlIiwiaSIsImxlbmd0aCIsIm5hbWUiLCJnZXREaXNwbGF5TmFtZSIsImluZGV4TGlzdCIsInB1c2giLCJmb3JFYWNoIiwiaiIsImFtYmlndW91cyIsImdldEUyRVN0YXR1cyIsImNsaSIsInVzZXJJZCIsImlzTWUiLCJnZXRVc2VySWQiLCJ1c2VyVHJ1c3QiLCJjaGVja1VzZXJUcnVzdCIsImlzQ3Jvc3NTaWduaW5nVmVyaWZpZWQiLCJ3YXNDcm9zc1NpZ25pbmdWZXJpZmllZCIsIkUyRVN0YXR1cyIsIldhcm5pbmciLCJOb3JtYWwiLCJhbnlEZXZpY2VVbnZlcmlmaWVkIiwic29tZSIsImRldmljZSIsImRldmljZUlkIiwiZGV2aWNlVHJ1c3QiLCJjaGVja0RldmljZVRydXN0IiwiaXNWZXJpZmllZCIsIlZlcmlmaWVkIiwib3BlbkRNRm9yVXNlciIsIm1hdHJpeENsaWVudCIsImxhc3RBY3RpdmVSb29tIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJyb29tX2lkIiwicm9vbUlkIiwiY3JlYXRlUm9vbU9wdGlvbnMiLCJkbVVzZXJJZCIsImVuY3J5cHRpb24iLCJ1bmRlZmluZWQiLCJ1c2Vyc1RvRGV2aWNlc01hcCIsImRvd25sb2FkS2V5cyIsImFsbEhhdmVEZXZpY2VLZXlzIiwidmFsdWVzIiwiZXZlcnkiLCJrZXlzIiwidXNlSGFzQ3Jvc3NTaWduaW5nS2V5cyIsIm1lbWJlciIsImNhblZlcmlmeSIsInNldFVwZGF0aW5nIiwieHNpIiwiZ2V0U3RvcmVkQ3Jvc3NTaWduaW5nRm9yVXNlciIsImtleSIsImdldElkIiwiRGV2aWNlSXRlbSIsIk1hdHJpeENsaWVudENvbnRleHQiLCJjbGFzc2VzIiwibXhfVXNlckluZm9fZGV2aWNlX3ZlcmlmaWVkIiwibXhfVXNlckluZm9fZGV2aWNlX3VudmVyaWZpZWQiLCJpY29uQ2xhc3NlcyIsIm14X0UyRUljb25fbm9ybWFsIiwibXhfRTJFSWNvbl92ZXJpZmllZCIsIm14X0UyRUljb25fd2FybmluZyIsIm9uRGV2aWNlQ2xpY2siLCJnZXRVc2VyIiwiZGV2aWNlTmFtZSIsInRydXN0ZWRMYWJlbCIsIkRldmljZXNTZWN0aW9uIiwibG9hZGluZyIsImlzRXhwYW5kZWQiLCJzZXRFeHBhbmRlZCIsImRldmljZVRydXN0cyIsIm1hcCIsImQiLCJleHBhbmRTZWN0aW9uRGV2aWNlcyIsInVudmVyaWZpZWREZXZpY2VzIiwiZXhwYW5kQ291bnRDYXB0aW9uIiwiZXhwYW5kSGlkZUNhcHRpb24iLCJleHBhbmRJY29uQ2xhc3NlcyIsImNvdW50IiwiZXhwYW5kQnV0dG9uIiwiZGV2aWNlTGlzdCIsImtleVN0YXJ0IiwiY29uY2F0IiwiVXNlck9wdGlvbnNTZWN0aW9uIiwiaXNJZ25vcmVkIiwiY2FuSW52aXRlIiwiaXNTcGFjZSIsImlnbm9yZUJ1dHRvbiIsImluc2VydFBpbGxCdXR0b24iLCJpbnZpdGVVc2VyQnV0dG9uIiwicmVhZFJlY2VpcHRCdXR0b24iLCJvblNoYXJlVXNlckNsaWNrIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiU2hhcmVEaWFsb2ciLCJ0YXJnZXQiLCJvbklnbm9yZVRvZ2dsZSIsImlnbm9yZWRVc2VycyIsImdldElnbm9yZWRVc2VycyIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInNldElnbm9yZWRVc2VycyIsIm14X1VzZXJJbmZvX2Rlc3RydWN0aXZlIiwib25SZWFkUmVjZWlwdEJ1dHRvbiIsInJvb20iLCJnZXRSb29tIiwiaGlnaGxpZ2h0ZWQiLCJldmVudF9pZCIsImdldEV2ZW50UmVhZFVwVG8iLCJvbkluc2VydFBpbGxCdXR0b24iLCJ1c2VyX2lkIiwibWVtYmVyc2hpcCIsIlJvb21WaWV3U3RvcmUiLCJnZXRSb29tSWQiLCJvbkludml0ZVVzZXJCdXR0b24iLCJpbnZpdGVyIiwiTXVsdGlJbnZpdGVyIiwiaW52aXRlIiwidGhlbiIsImdldENvbXBsZXRpb25TdGF0ZSIsIkVycm9yIiwiZ2V0RXJyb3JUZXh0IiwiZXJyIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsInNoYXJlVXNlckJ1dHRvbiIsImRpcmVjdE1lc3NhZ2VCdXR0b24iLCJ3YXJuU2VsZkRlbW90ZSIsImZpbmlzaGVkIiwiUXVlc3Rpb25EaWFsb2ciLCJidXR0b24iLCJjb25maXJtZWQiLCJHZW5lcmljQWRtaW5Ub29sc0NvbnRhaW5lciIsImNoaWxkcmVuIiwiaXNNdXRlZCIsInBvd2VyTGV2ZWxDb250ZW50IiwibGV2ZWxUb1NlbmQiLCJldmVudHMiLCJldmVudHNfZGVmYXVsdCIsInBvd2VyTGV2ZWwiLCJ1c2VSb29tUG93ZXJMZXZlbHMiLCJwb3dlckxldmVscyIsInNldFBvd2VyTGV2ZWxzIiwidXBkYXRlIiwiZXYiLCJnZXRUeXBlIiwiRXZlbnRUeXBlIiwiUm9vbVBvd2VyTGV2ZWxzIiwiZXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsImdldENvbnRlbnQiLCJSb29tS2lja0J1dHRvbiIsInN0YXJ0VXBkYXRpbmciLCJzdG9wVXBkYXRpbmciLCJvbktpY2siLCJDb25maXJtVXNlckFjdGlvbkRpYWxvZyIsImFza1JlYXNvbiIsImRhbmdlciIsInByb2NlZWQiLCJyZWFzb24iLCJraWNrIiwiY29uc29sZSIsImxvZyIsImVycm9yIiwiZmluYWxseSIsImtpY2tMYWJlbCIsIlJlZGFjdE1lc3NhZ2VzQnV0dG9uIiwib25SZWRhY3RBbGxNZXNzYWdlcyIsInRpbWVsaW5lIiwiZ2V0TGl2ZVRpbWVsaW5lIiwiZXZlbnRzVG9SZWRhY3QiLCJnZXRFdmVudHMiLCJyZWR1Y2UiLCJnZXRTZW5kZXIiLCJpc1JlZGFjdGVkIiwiaXNSZWRhY3Rpb24iLCJSb29tQ3JlYXRlIiwiUm9vbVNlcnZlckFjbCIsImdldE5laWdoYm91cmluZ1RpbWVsaW5lIiwiRXZlbnRUaW1lbGluZSIsIkJBQ0tXQVJEUyIsInVzZXIiLCJJbmZvRGlhbG9nIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbmZvIiwiYWxsIiwicmVkYWN0RXZlbnQiLCJCYW5Ub2dnbGVCdXR0b24iLCJvbkJhbk9yVW5iYW4iLCJwcm9taXNlIiwidW5iYW4iLCJiYW4iLCJsYWJlbCIsIk11dGVUb2dnbGVCdXR0b24iLCJtdXRlZCIsIm9uTXV0ZVRvZ2dsZSIsImlzU3BhY2VSb29tIiwiZSIsInBvd2VyTGV2ZWxFdmVudCIsImxldmVsIiwicGFyc2VJbnQiLCJpc05hTiIsInNldFBvd2VyTGV2ZWwiLCJtdXRlTGFiZWwiLCJSb29tQWRtaW5Ub29sc0NvbnRhaW5lciIsImtpY2tCdXR0b24iLCJiYW5CdXR0b24iLCJtdXRlQnV0dG9uIiwicmVkYWN0QnV0dG9uIiwiZWRpdFBvd2VyTGV2ZWwiLCJzdGF0ZV9kZWZhdWx0IiwiYmFuUG93ZXJMZXZlbCIsImtpY2tQb3dlckxldmVsIiwicmVkYWN0IiwicmVkYWN0UG93ZXJMZXZlbCIsIm1lIiwiZ2V0TWVtYmVyIiwiY2FuQWZmZWN0VXNlciIsIkdyb3VwQWRtaW5Ub29sc1NlY3Rpb24iLCJncm91cElkIiwiZ3JvdXBNZW1iZXIiLCJpc1ByaXZpbGVnZWQiLCJzZXRJc1ByaXZpbGVnZWQiLCJpc0ludml0ZWQiLCJzZXRJc0ludml0ZWQiLCJ1bm1vdW50ZWQiLCJvbkdyb3VwU3RvcmVVcGRhdGVkIiwiR3JvdXBTdG9yZSIsImlzVXNlclByaXZpbGVnZWQiLCJnZXRHcm91cEludml0ZWRNZW1iZXJzIiwibSIsInJlZ2lzdGVyTGlzdGVuZXIiLCJ1bnJlZ2lzdGVyTGlzdGVuZXIiLCJjcmVhdGVEaWFsb2ciLCJyZW1vdmVVc2VyRnJvbUdyb3VwIiwiQWN0aW9uIiwiVmlld1VzZXIiLCJjYXRjaCIsInVzZUlzU3luYXBzZUFkbWluIiwiaXNBZG1pbiIsInNldElzQWRtaW4iLCJpc1N5bmFwc2VBZG1pbmlzdHJhdG9yIiwidXNlSG9tZXNlcnZlclN1cHBvcnRzQ3Jvc3NTaWduaW5nIiwiZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUiLCJ1c2VSb29tUGVybWlzc2lvbnMiLCJyb29tUGVybWlzc2lvbnMiLCJzZXRSb29tUGVybWlzc2lvbnMiLCJtb2RpZnlMZXZlbE1heCIsImNhbkVkaXQiLCJ1cGRhdGVSb29tUGVybWlzc2lvbnMiLCJ0aGVtIiwiUG93ZXJMZXZlbFNlY3Rpb24iLCJwb3dlckxldmVsVXNlcnNEZWZhdWx0IiwidXNlcnNfZGVmYXVsdCIsInJvbGUiLCJQb3dlckxldmVsRWRpdG9yIiwic2VsZWN0ZWRQb3dlckxldmVsIiwic2V0U2VsZWN0ZWRQb3dlckxldmVsIiwib25Qb3dlckNoYW5nZSIsInBvd2VyTGV2ZWxTdHIiLCJhcHBseVBvd2VyQ2hhbmdlIiwibXlVc2VySWQiLCJteVBvd2VyIiwidXNlcnMiLCJ1c2VEZXZpY2VzIiwic2V0RGV2aWNlcyIsImNhbmNlbGxlZCIsImRvd25sb2FkRGV2aWNlTGlzdCIsImdldFN0b3JlZERldmljZXNGb3JVc2VyIiwiY2FuY2VsIiwidXBkYXRlRGV2aWNlcyIsIm5ld0RldmljZXMiLCJvbkRldmljZXNVcGRhdGVkIiwiaW5jbHVkZXMiLCJvbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQiLCJfdXNlcklkIiwib25Vc2VyVHJ1c3RTdGF0dXNDaGFuZ2VkIiwidHJ1c3RTdGF0dXMiLCJvbiIsInJlbW92ZUxpc3RlbmVyIiwiQmFzaWNVc2VySW5mbyIsImlzUm9vbUVuY3J5cHRlZCIsImlzU3luYXBzZUFkbWluIiwic2V0SXNJZ25vcmVkIiwiaXNVc2VySWdub3JlZCIsImFjY291bnREYXRhSGFuZGxlciIsInBlbmRpbmdVcGRhdGVDb3VudCIsInNldFBlbmRpbmdVcGRhdGVDb3VudCIsIm9uU3luYXBzZURlYWN0aXZhdGUiLCJhY2NlcHRlZCIsImRlYWN0aXZhdGVTeW5hcHNlVXNlciIsInN5bmFwc2VEZWFjdGl2YXRlQnV0dG9uIiwic3Bpbm5lciIsImVuZHNXaXRoIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJhZG1pblRvb2xzQ29udGFpbmVyIiwibWVtYmVyRGV0YWlscyIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsImNyeXB0b0VuYWJsZWQiLCJpc0NyeXB0b0VuYWJsZWQiLCJ0ZXh0IiwidmVyaWZ5QnV0dG9uIiwiaG9tZXNlcnZlclN1cHBvcnRzQ3Jvc3NTaWduaW5nIiwidXNlclZlcmlmaWVkIiwidXBkYXRpbmciLCJoYXNDcm9zc1NpZ25pbmdLZXlzIiwic2hvd0RldmljZUxpc3RTcGlubmVyIiwiZWRpdERldmljZXMiLCJWaWV3VXNlclNldHRpbmdzIiwiaW5pdGlhbFRhYklkIiwiVVNFUl9TRUNVUklUWV9UQUIiLCJzZWN1cml0eVNlY3Rpb24iLCJVc2VySW5mb0hlYWRlciIsImUyZVN0YXR1cyIsIm9uTWVtYmVyQXZhdGFyQ2xpY2siLCJhdmF0YXJVcmwiLCJnZXRNeGNBdmF0YXJVcmwiLCJodHRwVXJsIiwic3JjSHR0cCIsInBhcmFtcyIsInNyYyIsIkltYWdlVmlldyIsImF2YXRhckVsZW1lbnQiLCJ3aW5kb3ciLCJpbm5lckhlaWdodCIsInByZXNlbmNlU3RhdGUiLCJwcmVzZW5jZUxhc3RBY3RpdmVBZ28iLCJwcmVzZW5jZUN1cnJlbnRseUFjdGl2ZSIsInN0YXR1c01lc3NhZ2UiLCJSb29tTWVtYmVyIiwicHJlc2VuY2UiLCJsYXN0QWN0aXZlQWdvIiwiY3VycmVudGx5QWN0aXZlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiX3Vuc3RhYmxlX3N0YXR1c01lc3NhZ2UiLCJlbmFibGVQcmVzZW5jZUJ5SHNVcmwiLCJTZGtDb25maWciLCJnZXQiLCJzaG93UHJlc2VuY2UiLCJiYXNlVXJsIiwicHJlc2VuY2VMYWJlbCIsInN0YXR1c0xhYmVsIiwiZTJlSWNvbiIsImRpc3BsYXlOYW1lIiwicmF3RGlzcGxheU5hbWUiLCJkaXNwbGF5bmFtZSIsIlVzZXJJbmZvIiwib25DbG9zZSIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIlJvb21NZW1iZXJJbmZvIiwicHJvcHMiLCJyZWZpcmVQYXJhbXMiLCJwcmV2aW91c1BoYXNlIiwiRW5jcnlwdGlvblBhbmVsIiwiU3BhY2VNZW1iZXJMaXN0IiwiUm9vbU1lbWJlckxpc3QiLCJvbkVuY3J5cHRpb25QYW5lbENsb3NlIiwiU2V0UmlnaHRQYW5lbFBoYXNlIiwiY29udGVudCIsIkdyb3VwTWVtYmVySW5mbyIsIlNwYWNlTWVtYmVySW5mbyIsImNsb3NlTGFiZWwiLCJ2ZXJpZmljYXRpb25SZXF1ZXN0IiwicGVuZGluZyIsInNjb3BlSGVhZGVyIiwiaGVhZGVyIiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUVBOztBQUdBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQW5FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUEwREEsTUFBTUEsbUJBQW1CLEdBQUcsQ0FBQ0M7QUFBRDtBQUFBLEtBQXdCO0FBQ2hELFFBQU1DLEtBQUssR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWMsSUFBZCxDQUFkOztBQUNBLE9BQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0osT0FBTyxDQUFDSyxNQUE1QixFQUFvQ0QsQ0FBQyxFQUFyQyxFQUF5QztBQUNyQyxVQUFNRSxJQUFJLEdBQUdOLE9B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OztlQXNHZWIsUSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTggVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHt1c2VDYWxsYmFjaywgdXNlQ29udGV4dCwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZX0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcbmltcG9ydCB7Um9vbU1lbWJlcn0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyJztcbmltcG9ydCB7VXNlcn0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3VzZXInO1xuaW1wb3J0IHtSb29tfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbSc7XG5pbXBvcnQge0V2ZW50VGltZWxpbmV9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudC10aW1lbGluZSc7XG5pbXBvcnQge01hdHJpeEV2ZW50fSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQnO1xuXG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHtfdH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBjcmVhdGVSb29tLCB7IGZpbmRETUZvclVzZXIsIHByaXZhdGVTaG91bGRCZUVuY3J5cHRlZCB9IGZyb20gJy4uLy4uLy4uL2NyZWF0ZVJvb20nO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tICcuLi8uLi8uLi91dGlscy9ETVJvb21NYXAnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uLy4uLy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IFJvb21WaWV3U3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Sb29tVmlld1N0b3JlXCI7XG5pbXBvcnQgTXVsdGlJbnZpdGVyIGZyb20gXCIuLi8uLi8uLi91dGlscy9NdWx0aUludml0ZXJcIjtcbmltcG9ydCBHcm91cFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvR3JvdXBTdG9yZVwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBFMkVJY29uIGZyb20gXCIuLi9yb29tcy9FMkVJY29uXCI7XG5pbXBvcnQge3VzZUV2ZW50RW1pdHRlcn0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlclwiO1xuaW1wb3J0IHt0ZXh0dWFsUG93ZXJMZXZlbH0gZnJvbSAnLi4vLi4vLi4vUm9sZXMnO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7UmlnaHRQYW5lbFBoYXNlc30gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9SaWdodFBhbmVsU3RvcmVQaGFzZXNcIjtcbmltcG9ydCBFbmNyeXB0aW9uUGFuZWwgZnJvbSBcIi4vRW5jcnlwdGlvblBhbmVsXCI7XG5pbXBvcnQge3VzZUFzeW5jTWVtb30gZnJvbSAnLi4vLi4vLi4vaG9va3MvdXNlQXN5bmNNZW1vJztcbmltcG9ydCB7bGVnYWN5VmVyaWZ5VXNlciwgdmVyaWZ5RGV2aWNlLCB2ZXJpZnlVc2VyfSBmcm9tICcuLi8uLi8uLi92ZXJpZmljYXRpb24nO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IFVTRVJfU0VDVVJJVFlfVEFCIH0gZnJvbSBcIi4uL2RpYWxvZ3MvVXNlclNldHRpbmdzRGlhbG9nXCI7XG5pbXBvcnQge3VzZUlzRW5jcnlwdGVkfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlSXNFbmNyeXB0ZWRcIjtcbmltcG9ydCBCYXNlQ2FyZCBmcm9tIFwiLi9CYXNlQ2FyZFwiO1xuaW1wb3J0IHtFMkVTdGF0dXN9IGZyb20gXCIuLi8uLi8uLi91dGlscy9TaGllbGRVdGlsc1wiO1xuaW1wb3J0IEltYWdlVmlldyBmcm9tIFwiLi4vZWxlbWVudHMvSW1hZ2VWaWV3XCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IFBvd2VyU2VsZWN0b3IgZnJvbSBcIi4uL2VsZW1lbnRzL1Bvd2VyU2VsZWN0b3JcIjtcbmltcG9ydCBNZW1iZXJBdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvTWVtYmVyQXZhdGFyXCI7XG5pbXBvcnQgUHJlc2VuY2VMYWJlbCBmcm9tIFwiLi4vcm9vbXMvUHJlc2VuY2VMYWJlbFwiO1xuaW1wb3J0IFNoYXJlRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL1NoYXJlRGlhbG9nXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9RdWVzdGlvbkRpYWxvZ1wiO1xuaW1wb3J0IENvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL0NvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgSW5mb0RpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9JbmZvRGlhbG9nXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBTZXRSaWdodFBhbmVsUGhhc2VQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvU2V0UmlnaHRQYW5lbFBoYXNlUGF5bG9hZFwiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvUm9vbUF2YXRhclwiO1xuaW1wb3J0IFJvb21OYW1lIGZyb20gXCIuLi9lbGVtZW50cy9Sb29tTmFtZVwiO1xuaW1wb3J0IHttZWRpYUZyb21NeGN9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuXG5pbnRlcmZhY2UgSURldmljZSB7XG4gICAgZGV2aWNlSWQ6IHN0cmluZztcbiAgICBhbWJpZ3VvdXM/OiBib29sZWFuO1xuICAgIGdldERpc3BsYXlOYW1lKCk6IHN0cmluZztcbn1cblxuY29uc3QgZGlzYW1iaWd1YXRlRGV2aWNlcyA9IChkZXZpY2VzOiBJRGV2aWNlW10pID0+IHtcbiAgICBjb25zdCBuYW1lcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXZpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBkZXZpY2VzW2ldLmdldERpc3BsYXlOYW1lKCk7XG4gICAgICAgIGNvbnN0IGluZGV4TGlzdCA9IG5hbWVzW25hbWVdIHx8IFtdO1xuICAgICAgICBpbmRleExpc3QucHVzaChpKTtcbiAgICAgICAgbmFtZXNbbmFtZV0gPSBpbmRleExpc3Q7XG4gICAgfVxuICAgIGZvciAoY29uc3QgbmFtZSBpbiBuYW1lcykge1xuICAgICAgICBpZiAobmFtZXNbbmFtZV0ubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgbmFtZXNbbmFtZV0uZm9yRWFjaCgoaik9PntcbiAgICAgICAgICAgICAgICBkZXZpY2VzW2pdLmFtYmlndW91cyA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRFMkVTdGF0dXMgPSAoY2xpOiBNYXRyaXhDbGllbnQsIHVzZXJJZDogc3RyaW5nLCBkZXZpY2VzOiBJRGV2aWNlW10pOiBFMkVTdGF0dXMgPT4ge1xuICAgIGNvbnN0IGlzTWUgPSB1c2VySWQgPT09IGNsaS5nZXRVc2VySWQoKTtcbiAgICBjb25zdCB1c2VyVHJ1c3QgPSBjbGkuY2hlY2tVc2VyVHJ1c3QodXNlcklkKTtcbiAgICBpZiAoIXVzZXJUcnVzdC5pc0Nyb3NzU2lnbmluZ1ZlcmlmaWVkKCkpIHtcbiAgICAgICAgcmV0dXJuIHVzZXJUcnVzdC53YXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpID8gRTJFU3RhdHVzLldhcm5pbmcgOiBFMkVTdGF0dXMuTm9ybWFsO1xuICAgIH1cblxuICAgIGNvbnN0IGFueURldmljZVVudmVyaWZpZWQgPSBkZXZpY2VzLnNvbWUoZGV2aWNlID0+IHtcbiAgICAgICAgY29uc3QgeyBkZXZpY2VJZCB9ID0gZGV2aWNlO1xuICAgICAgICAvLyBGb3IgeW91ciBvd24gZGV2aWNlcywgd2UgdXNlIHRoZSBzdHJpY3RlciBjaGVjayBvZiBjcm9zcy1zaWduaW5nXG4gICAgICAgIC8vIHZlcmlmaWNhdGlvbiB0byBlbmNvdXJhZ2UgZXZlcnlvbmUgdG8gdHJ1c3QgdGhlaXIgb3duIGRldmljZXMgdmlhXG4gICAgICAgIC8vIGNyb3NzLXNpZ25pbmcgc28gdGhhdCBvdGhlciB1c2VycyBjYW4gdGhlbiBzYWZlbHkgdHJ1c3QgeW91LlxuICAgICAgICAvLyBGb3Igb3RoZXIgcGVvcGxlJ3MgZGV2aWNlcywgdGhlIG1vcmUgZ2VuZXJhbCB2ZXJpZmllZCBjaGVjayB0aGF0XG4gICAgICAgIC8vIGluY2x1ZGVzIGxvY2FsbHkgdmVyaWZpZWQgZGV2aWNlcyBjYW4gYmUgdXNlZC5cbiAgICAgICAgY29uc3QgZGV2aWNlVHJ1c3QgPSBjbGkuY2hlY2tEZXZpY2VUcnVzdCh1c2VySWQsIGRldmljZUlkKTtcbiAgICAgICAgcmV0dXJuIGlzTWUgPyAhZGV2aWNlVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpIDogIWRldmljZVRydXN0LmlzVmVyaWZpZWQoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYW55RGV2aWNlVW52ZXJpZmllZCA/IEUyRVN0YXR1cy5XYXJuaW5nIDogRTJFU3RhdHVzLlZlcmlmaWVkO1xufTtcblxuYXN5bmMgZnVuY3Rpb24gb3BlbkRNRm9yVXNlcihtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudCwgdXNlcklkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsYXN0QWN0aXZlUm9vbSA9IGZpbmRETUZvclVzZXIobWF0cml4Q2xpZW50LCB1c2VySWQpO1xuXG4gICAgaWYgKGxhc3RBY3RpdmVSb29tKSB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogbGFzdEFjdGl2ZVJvb20ucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZVJvb21PcHRpb25zID0ge1xuICAgICAgICBkbVVzZXJJZDogdXNlcklkLFxuICAgICAgICBlbmNyeXB0aW9uOiB1bmRlZmluZWQsXG4gICAgfTtcblxuICAgIGlmIChwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQoKSkge1xuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIGFsbCB1c2VycyBoYXZlIHVwbG9hZGVkIGRldmljZSBrZXlzIGJlZm9yZS5cbiAgICAgICAgLy8gSWYgc28sIGVuYWJsZSBlbmNyeXB0aW9uIGluIHRoZSBuZXcgcm9vbS5cbiAgICAgICAgY29uc3QgdXNlcnNUb0RldmljZXNNYXAgPSBhd2FpdCBtYXRyaXhDbGllbnQuZG93bmxvYWRLZXlzKFt1c2VySWRdKTtcbiAgICAgICAgY29uc3QgYWxsSGF2ZURldmljZUtleXMgPSBPYmplY3QudmFsdWVzKHVzZXJzVG9EZXZpY2VzTWFwKS5ldmVyeShkZXZpY2VzID0+IHtcbiAgICAgICAgICAgIC8vIGBkZXZpY2VzYCBpcyBhbiBvYmplY3Qgb2YgdGhlIGZvcm0geyBkZXZpY2VJZDogZGV2aWNlSW5mbywgLi4uIH0uXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoZGV2aWNlcykubGVuZ3RoID4gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChhbGxIYXZlRGV2aWNlS2V5cykge1xuICAgICAgICAgICAgY3JlYXRlUm9vbU9wdGlvbnMuZW5jcnlwdGlvbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlUm9vbShjcmVhdGVSb29tT3B0aW9ucyk7XG59XG5cbnR5cGUgU2V0VXBkYXRpbmcgPSAodXBkYXRpbmc6IGJvb2xlYW4pID0+IHZvaWQ7XG5cbmZ1bmN0aW9uIHVzZUhhc0Nyb3NzU2lnbmluZ0tleXMoY2xpOiBNYXRyaXhDbGllbnQsIG1lbWJlcjogUm9vbU1lbWJlciwgY2FuVmVyaWZ5OiBib29sZWFuLCBzZXRVcGRhdGluZzogU2V0VXBkYXRpbmcpIHtcbiAgICByZXR1cm4gdXNlQXN5bmNNZW1vKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFjYW5WZXJpZnkpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VXBkYXRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBjbGkuZG93bmxvYWRLZXlzKFttZW1iZXIudXNlcklkXSk7XG4gICAgICAgICAgICBjb25zdCB4c2kgPSBjbGkuZ2V0U3RvcmVkQ3Jvc3NTaWduaW5nRm9yVXNlcihtZW1iZXIudXNlcklkKTtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHhzaSAmJiB4c2kuZ2V0SWQoKTtcbiAgICAgICAgICAgIHJldHVybiAhIWtleTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldFVwZGF0aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtjbGksIG1lbWJlciwgY2FuVmVyaWZ5XSwgdW5kZWZpbmVkKTtcbn1cblxuZnVuY3Rpb24gRGV2aWNlSXRlbSh7dXNlcklkLCBkZXZpY2V9OiB7dXNlcklkOiBzdHJpbmcsIGRldmljZTogSURldmljZX0pIHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IGlzTWUgPSB1c2VySWQgPT09IGNsaS5nZXRVc2VySWQoKTtcbiAgICBjb25zdCBkZXZpY2VUcnVzdCA9IGNsaS5jaGVja0RldmljZVRydXN0KHVzZXJJZCwgZGV2aWNlLmRldmljZUlkKTtcbiAgICBjb25zdCB1c2VyVHJ1c3QgPSBjbGkuY2hlY2tVc2VyVHJ1c3QodXNlcklkKTtcbiAgICAvLyBGb3IgeW91ciBvd24gZGV2aWNlcywgd2UgdXNlIHRoZSBzdHJpY3RlciBjaGVjayBvZiBjcm9zcy1zaWduaW5nXG4gICAgLy8gdmVyaWZpY2F0aW9uIHRvIGVuY291cmFnZSBldmVyeW9uZSB0byB0cnVzdCB0aGVpciBvd24gZGV2aWNlcyB2aWFcbiAgICAvLyBjcm9zcy1zaWduaW5nIHNvIHRoYXQgb3RoZXIgdXNlcnMgY2FuIHRoZW4gc2FmZWx5IHRydXN0IHlvdS5cbiAgICAvLyBGb3Igb3RoZXIgcGVvcGxlJ3MgZGV2aWNlcywgdGhlIG1vcmUgZ2VuZXJhbCB2ZXJpZmllZCBjaGVjayB0aGF0XG4gICAgLy8gaW5jbHVkZXMgbG9jYWxseSB2ZXJpZmllZCBkZXZpY2VzIGNhbiBiZSB1c2VkLlxuICAgIGNvbnN0IGlzVmVyaWZpZWQgPSBpc01lID8gZGV2aWNlVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpIDogZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpO1xuXG4gICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9Vc2VySW5mb19kZXZpY2VcIiwge1xuICAgICAgICBteF9Vc2VySW5mb19kZXZpY2VfdmVyaWZpZWQ6IGlzVmVyaWZpZWQsXG4gICAgICAgIG14X1VzZXJJbmZvX2RldmljZV91bnZlcmlmaWVkOiAhaXNWZXJpZmllZCxcbiAgICB9KTtcbiAgICBjb25zdCBpY29uQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9FMkVJY29uXCIsIHtcbiAgICAgICAgbXhfRTJFSWNvbl9ub3JtYWw6ICF1c2VyVHJ1c3QuaXNWZXJpZmllZCgpLFxuICAgICAgICBteF9FMkVJY29uX3ZlcmlmaWVkOiBpc1ZlcmlmaWVkLFxuICAgICAgICBteF9FMkVJY29uX3dhcm5pbmc6IHVzZXJUcnVzdC5pc1ZlcmlmaWVkKCkgJiYgIWlzVmVyaWZpZWQsXG4gICAgfSk7XG5cbiAgICBjb25zdCBvbkRldmljZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB2ZXJpZnlEZXZpY2UoY2xpLmdldFVzZXIodXNlcklkKSwgZGV2aWNlKTtcbiAgICB9O1xuXG4gICAgY29uc3QgZGV2aWNlTmFtZSA9IGRldmljZS5hbWJpZ3VvdXMgP1xuICAgICAgICAoZGV2aWNlLmdldERpc3BsYXlOYW1lKCkgPyBkZXZpY2UuZ2V0RGlzcGxheU5hbWUoKSA6IFwiXCIpICsgXCIgKFwiICsgZGV2aWNlLmRldmljZUlkICsgXCIpXCIgOlxuICAgICAgICBkZXZpY2UuZ2V0RGlzcGxheU5hbWUoKTtcbiAgICBsZXQgdHJ1c3RlZExhYmVsID0gbnVsbDtcbiAgICBpZiAodXNlclRydXN0LmlzVmVyaWZpZWQoKSkgdHJ1c3RlZExhYmVsID0gaXNWZXJpZmllZCA/IF90KFwiVHJ1c3RlZFwiKSA6IF90KFwiTm90IHRydXN0ZWRcIik7XG5cblxuICAgIGlmIChpc1ZlcmlmaWVkKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30gdGl0bGU9e2RldmljZS5kZXZpY2VJZH0gPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtpY29uQ2xhc3Nlc30gLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2RldmljZV9uYW1lXCI+e2RldmljZU5hbWV9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19kZXZpY2VfdHJ1c3RlZFwiPnt0cnVzdGVkTGFiZWx9PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2RldmljZS5kZXZpY2VJZH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbkRldmljZUNsaWNrfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtpY29uQ2xhc3Nlc30gLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2RldmljZV9uYW1lXCI+e2RldmljZU5hbWV9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19kZXZpY2VfdHJ1c3RlZFwiPnt0cnVzdGVkTGFiZWx9PC9kaXY+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBEZXZpY2VzU2VjdGlvbih7ZGV2aWNlcywgdXNlcklkLCBsb2FkaW5nfToge2RldmljZXM6IElEZXZpY2VbXSwgdXNlcklkOiBzdHJpbmcsIGxvYWRpbmc6IGJvb2xlYW59KSB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCB1c2VyVHJ1c3QgPSBjbGkuY2hlY2tVc2VyVHJ1c3QodXNlcklkKTtcblxuICAgIGNvbnN0IFtpc0V4cGFuZGVkLCBzZXRFeHBhbmRlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgICBpZiAobG9hZGluZykge1xuICAgICAgICAvLyBzdGlsbCBsb2FkaW5nXG4gICAgICAgIHJldHVybiA8U3Bpbm5lciAvPjtcbiAgICB9XG4gICAgaWYgKGRldmljZXMgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIDw+e190KFwiVW5hYmxlIHRvIGxvYWQgc2Vzc2lvbiBsaXN0XCIpfTwvPjtcbiAgICB9XG4gICAgY29uc3QgaXNNZSA9IHVzZXJJZCA9PT0gY2xpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IGRldmljZVRydXN0cyA9IGRldmljZXMubWFwKGQgPT4gY2xpLmNoZWNrRGV2aWNlVHJ1c3QodXNlcklkLCBkLmRldmljZUlkKSk7XG5cbiAgICBsZXQgZXhwYW5kU2VjdGlvbkRldmljZXMgPSBbXTtcbiAgICBjb25zdCB1bnZlcmlmaWVkRGV2aWNlcyA9IFtdO1xuXG4gICAgbGV0IGV4cGFuZENvdW50Q2FwdGlvbjtcbiAgICBsZXQgZXhwYW5kSGlkZUNhcHRpb247XG4gICAgbGV0IGV4cGFuZEljb25DbGFzc2VzID0gXCJteF9FMkVJY29uXCI7XG5cbiAgICBpZiAodXNlclRydXN0LmlzVmVyaWZpZWQoKSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRldmljZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IGRldmljZXNbaV07XG4gICAgICAgICAgICBjb25zdCBkZXZpY2VUcnVzdCA9IGRldmljZVRydXN0c1tpXTtcbiAgICAgICAgICAgIC8vIEZvciB5b3VyIG93biBkZXZpY2VzLCB3ZSB1c2UgdGhlIHN0cmljdGVyIGNoZWNrIG9mIGNyb3NzLXNpZ25pbmdcbiAgICAgICAgICAgIC8vIHZlcmlmaWNhdGlvbiB0byBlbmNvdXJhZ2UgZXZlcnlvbmUgdG8gdHJ1c3QgdGhlaXIgb3duIGRldmljZXMgdmlhXG4gICAgICAgICAgICAvLyBjcm9zcy1zaWduaW5nIHNvIHRoYXQgb3RoZXIgdXNlcnMgY2FuIHRoZW4gc2FmZWx5IHRydXN0IHlvdS5cbiAgICAgICAgICAgIC8vIEZvciBvdGhlciBwZW9wbGUncyBkZXZpY2VzLCB0aGUgbW9yZSBnZW5lcmFsIHZlcmlmaWVkIGNoZWNrIHRoYXRcbiAgICAgICAgICAgIC8vIGluY2x1ZGVzIGxvY2FsbHkgdmVyaWZpZWQgZGV2aWNlcyBjYW4gYmUgdXNlZC5cbiAgICAgICAgICAgIGNvbnN0IGlzVmVyaWZpZWQgPSBpc01lID8gZGV2aWNlVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpIDogZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpO1xuXG4gICAgICAgICAgICBpZiAoaXNWZXJpZmllZCkge1xuICAgICAgICAgICAgICAgIGV4cGFuZFNlY3Rpb25EZXZpY2VzLnB1c2goZGV2aWNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdW52ZXJpZmllZERldmljZXMucHVzaChkZXZpY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV4cGFuZENvdW50Q2FwdGlvbiA9IF90KFwiJShjb3VudClzIHZlcmlmaWVkIHNlc3Npb25zXCIsIHtjb3VudDogZXhwYW5kU2VjdGlvbkRldmljZXMubGVuZ3RofSk7XG4gICAgICAgIGV4cGFuZEhpZGVDYXB0aW9uID0gX3QoXCJIaWRlIHZlcmlmaWVkIHNlc3Npb25zXCIpO1xuICAgICAgICBleHBhbmRJY29uQ2xhc3NlcyArPSBcIiBteF9FMkVJY29uX3ZlcmlmaWVkXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZXhwYW5kU2VjdGlvbkRldmljZXMgPSBkZXZpY2VzO1xuICAgICAgICBleHBhbmRDb3VudENhcHRpb24gPSBfdChcIiUoY291bnQpcyBzZXNzaW9uc1wiLCB7Y291bnQ6IGRldmljZXMubGVuZ3RofSk7XG4gICAgICAgIGV4cGFuZEhpZGVDYXB0aW9uID0gX3QoXCJIaWRlIHNlc3Npb25zXCIpO1xuICAgICAgICBleHBhbmRJY29uQ2xhc3NlcyArPSBcIiBteF9FMkVJY29uX25vcm1hbFwiO1xuICAgIH1cblxuICAgIGxldCBleHBhbmRCdXR0b247XG4gICAgaWYgKGV4cGFuZFNlY3Rpb25EZXZpY2VzLmxlbmd0aCkge1xuICAgICAgICBpZiAoaXNFeHBhbmRlZCkge1xuICAgICAgICAgICAgZXhwYW5kQnV0dG9uID0gKDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2V4cGFuZCBteF9saW5rQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRFeHBhbmRlZChmYWxzZSl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdj57ZXhwYW5kSGlkZUNhcHRpb259PC9kaXY+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4cGFuZEJ1dHRvbiA9ICg8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19leHBhbmQgbXhfbGlua0J1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RXhwYW5kZWQodHJ1ZSl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2V4cGFuZEljb25DbGFzc2VzfSAvPlxuICAgICAgICAgICAgICAgIDxkaXY+e2V4cGFuZENvdW50Q2FwdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGRldmljZUxpc3QgPSB1bnZlcmlmaWVkRGV2aWNlcy5tYXAoKGRldmljZSwgaSkgPT4ge1xuICAgICAgICByZXR1cm4gKDxEZXZpY2VJdGVtIGtleT17aX0gdXNlcklkPXt1c2VySWR9IGRldmljZT17ZGV2aWNlfSAvPik7XG4gICAgfSk7XG4gICAgaWYgKGlzRXhwYW5kZWQpIHtcbiAgICAgICAgY29uc3Qga2V5U3RhcnQgPSB1bnZlcmlmaWVkRGV2aWNlcy5sZW5ndGg7XG4gICAgICAgIGRldmljZUxpc3QgPSBkZXZpY2VMaXN0LmNvbmNhdChleHBhbmRTZWN0aW9uRGV2aWNlcy5tYXAoKGRldmljZSwgaSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICg8RGV2aWNlSXRlbSBrZXk9e2kgKyBrZXlTdGFydH0gdXNlcklkPXt1c2VySWR9IGRldmljZT17ZGV2aWNlfSAvPik7XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2RldmljZXNcIj5cbiAgICAgICAgICAgIDxkaXY+e2RldmljZUxpc3R9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2PntleHBhbmRCdXR0b259PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG5cbmNvbnN0IFVzZXJPcHRpb25zU2VjdGlvbjogUmVhY3QuRkM8e1xuICAgIG1lbWJlcjogUm9vbU1lbWJlcjtcbiAgICBpc0lnbm9yZWQ6IGJvb2xlYW47XG4gICAgY2FuSW52aXRlOiBib29sZWFuO1xuICAgIGlzU3BhY2U/OiBib29sZWFuO1xufT4gPSAoe21lbWJlciwgaXNJZ25vcmVkLCBjYW5JbnZpdGUsIGlzU3BhY2V9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGxldCBpZ25vcmVCdXR0b24gPSBudWxsO1xuICAgIGxldCBpbnNlcnRQaWxsQnV0dG9uID0gbnVsbDtcbiAgICBsZXQgaW52aXRlVXNlckJ1dHRvbiA9IG51bGw7XG4gICAgbGV0IHJlYWRSZWNlaXB0QnV0dG9uID0gbnVsbDtcblxuICAgIGNvbnN0IGlzTWUgPSBtZW1iZXIudXNlcklkID09PSBjbGkuZ2V0VXNlcklkKCk7XG5cbiAgICBjb25zdCBvblNoYXJlVXNlckNsaWNrID0gKCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdzaGFyZSByb29tIG1lbWJlciBkaWFsb2cnLCAnJywgU2hhcmVEaWFsb2csIHtcbiAgICAgICAgICAgIHRhcmdldDogbWVtYmVyLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gT25seSBhbGxvdyB0aGUgdXNlciB0byBpZ25vcmUgdGhlIHVzZXIgaWYgaXRzIG5vdCBvdXJzZWx2ZXNcbiAgICAvLyBzYW1lIGdvZXMgZm9yIGp1bXBpbmcgdG8gcmVhZCByZWNlaXB0XG4gICAgaWYgKCFpc01lKSB7XG4gICAgICAgIGNvbnN0IG9uSWdub3JlVG9nZ2xlID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWdub3JlZFVzZXJzID0gY2xpLmdldElnbm9yZWRVc2VycygpO1xuICAgICAgICAgICAgaWYgKGlzSWdub3JlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gaWdub3JlZFVzZXJzLmluZGV4T2YobWVtYmVyLnVzZXJJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkgaWdub3JlZFVzZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlnbm9yZWRVc2Vycy5wdXNoKG1lbWJlci51c2VySWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGkuc2V0SWdub3JlZFVzZXJzKGlnbm9yZWRVc2Vycyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWdub3JlQnV0dG9uID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbklnbm9yZVRvZ2dsZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9Vc2VySW5mb19maWVsZFwiLCB7bXhfVXNlckluZm9fZGVzdHJ1Y3RpdmU6ICFpc0lnbm9yZWR9KX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGlzSWdub3JlZCA/IF90KFwiVW5pZ25vcmVcIikgOiBfdChcIklnbm9yZVwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKG1lbWJlci5yb29tSWQgJiYgIWlzU3BhY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG9uUmVhZFJlY2VpcHRCdXR0b24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20obWVtYmVyLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50X2lkOiByb29tLmdldEV2ZW50UmVhZFVwVG8obWVtYmVyLnVzZXJJZCksXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IG1lbWJlci5yb29tSWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBvbkluc2VydFBpbGxCdXR0b24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdpbnNlcnRfbWVudGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IG1lbWJlci51c2VySWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20obWVtYmVyLnJvb21JZCk7XG4gICAgICAgICAgICBpZiAocm9vbT8uZ2V0RXZlbnRSZWFkVXBUbyhtZW1iZXIudXNlcklkKSkge1xuICAgICAgICAgICAgICAgIHJlYWRSZWNlaXB0QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXtvblJlYWRSZWNlaXB0QnV0dG9ufSBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnSnVtcCB0byByZWFkIHJlY2VpcHQnKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbnNlcnRQaWxsQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e29uSW5zZXJ0UGlsbEJ1dHRvbn0gY2xhc3NOYW1lPXtcIm14X1VzZXJJbmZvX2ZpZWxkXCJ9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdNZW50aW9uJykgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FuSW52aXRlICYmICghbWVtYmVyIHx8ICFtZW1iZXIubWVtYmVyc2hpcCB8fCBtZW1iZXIubWVtYmVyc2hpcCA9PT0gJ2xlYXZlJykpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IG1lbWJlciAmJiBtZW1iZXIucm9vbUlkID8gbWVtYmVyLnJvb21JZCA6IFJvb21WaWV3U3RvcmUuZ2V0Um9vbUlkKCk7XG4gICAgICAgICAgICBjb25zdCBvbkludml0ZVVzZXJCdXR0b24gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgdXNlIGEgTXVsdGlJbnZpdGVyIHRvIHJlLXVzZSB0aGUgaW52aXRlIGxvZ2ljLCBldmVuIHRob3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBvbmx5IGludml0aW5nIG9uZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnZpdGVyID0gbmV3IE11bHRpSW52aXRlcihyb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBpbnZpdGVyLmludml0ZShbbWVtYmVyLnVzZXJJZF0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludml0ZXIuZ2V0Q29tcGxldGlvblN0YXRlKG1lbWJlci51c2VySWQpICE9PSBcImludml0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihpbnZpdGVyLmdldEVycm9yVGV4dChtZW1iZXIudXNlcklkKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gaW52aXRlJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZhaWxlZCB0byBpbnZpdGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGludml0ZVVzZXJCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25JbnZpdGVVc2VyQnV0dG9ufSBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdJbnZpdGUnKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNoYXJlVXNlckJ1dHRvbiA9IChcbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25TaGFyZVVzZXJDbGlja30gY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZmllbGRcIj5cbiAgICAgICAgICAgIHsgX3QoJ1NoYXJlIExpbmsgdG8gVXNlcicpIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICk7XG5cbiAgICBsZXQgZGlyZWN0TWVzc2FnZUJ1dHRvbjtcbiAgICBpZiAoIWlzTWUpIHtcbiAgICAgICAgZGlyZWN0TWVzc2FnZUJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9eygpID0+IG9wZW5ETUZvclVzZXIoY2xpLCBtZW1iZXIudXNlcklkKX0gY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZmllbGRcIj5cbiAgICAgICAgICAgICAgICB7IF90KCdEaXJlY3QgbWVzc2FnZScpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGgzPnsgX3QoXCJPcHRpb25zXCIpIH08L2gzPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICB7IGRpcmVjdE1lc3NhZ2VCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgcmVhZFJlY2VpcHRCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgc2hhcmVVc2VyQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IGluc2VydFBpbGxCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgaW52aXRlVXNlckJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBpZ25vcmVCdXR0b24gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59O1xuXG5jb25zdCB3YXJuU2VsZkRlbW90ZSA9IGFzeW5jIChpc1NwYWNlKSA9PiB7XG4gICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0RlbW90aW5nIFNlbGYnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgdGl0bGU6IF90KFwiRGVtb3RlIHlvdXJzZWxmP1wiKSxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIHsgaXNTcGFjZVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiWW91IHdpbGwgbm90IGJlIGFibGUgdG8gdW5kbyB0aGlzIGNoYW5nZSBhcyB5b3UgYXJlIGRlbW90aW5nIHlvdXJzZWxmLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImlmIHlvdSBhcmUgdGhlIGxhc3QgcHJpdmlsZWdlZCB1c2VyIGluIHRoZSBzcGFjZSBpdCB3aWxsIGJlIGltcG9zc2libGUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0byByZWdhaW4gcHJpdmlsZWdlcy5cIilcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIllvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIHVuZG8gdGhpcyBjaGFuZ2UgYXMgeW91IGFyZSBkZW1vdGluZyB5b3Vyc2VsZiwgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJpZiB5b3UgYXJlIHRoZSBsYXN0IHByaXZpbGVnZWQgdXNlciBpbiB0aGUgcm9vbSBpdCB3aWxsIGJlIGltcG9zc2libGUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0byByZWdhaW4gcHJpdmlsZWdlcy5cIikgfVxuICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICBidXR0b246IF90KFwiRGVtb3RlXCIpLFxuICAgIH0pO1xuXG4gICAgY29uc3QgW2NvbmZpcm1lZF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICByZXR1cm4gY29uZmlybWVkO1xufTtcblxuY29uc3QgR2VuZXJpY0FkbWluVG9vbHNDb250YWluZXI6IFJlYWN0LkZDPHt9PiA9ICh7Y2hpbGRyZW59KSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxoMz57IF90KFwiQWRtaW4gVG9vbHNcIikgfTwvaDM+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufTtcblxuaW50ZXJmYWNlIElQb3dlckxldmVsc0NvbnRlbnQge1xuICAgIGV2ZW50cz86IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHVzZXJzX2RlZmF1bHQ/OiBudW1iZXI7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIGV2ZW50c19kZWZhdWx0PzogbnVtYmVyO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBzdGF0ZV9kZWZhdWx0PzogbnVtYmVyO1xuICAgIGJhbj86IG51bWJlcjtcbiAgICBraWNrPzogbnVtYmVyO1xuICAgIHJlZGFjdD86IG51bWJlcjtcbn1cblxuY29uc3QgaXNNdXRlZCA9IChtZW1iZXI6IFJvb21NZW1iZXIsIHBvd2VyTGV2ZWxDb250ZW50OiBJUG93ZXJMZXZlbHNDb250ZW50KSA9PiB7XG4gICAgaWYgKCFwb3dlckxldmVsQ29udGVudCB8fCAhbWVtYmVyKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBsZXZlbFRvU2VuZCA9IChcbiAgICAgICAgKHBvd2VyTGV2ZWxDb250ZW50LmV2ZW50cyA/IHBvd2VyTGV2ZWxDb250ZW50LmV2ZW50c1tcIm0ucm9vbS5tZXNzYWdlXCJdIDogbnVsbCkgfHxcbiAgICAgICAgcG93ZXJMZXZlbENvbnRlbnQuZXZlbnRzX2RlZmF1bHRcbiAgICApO1xuICAgIHJldHVybiBtZW1iZXIucG93ZXJMZXZlbCA8IGxldmVsVG9TZW5kO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZVJvb21Qb3dlckxldmVscyA9IChjbGk6IE1hdHJpeENsaWVudCwgcm9vbTogUm9vbSkgPT4ge1xuICAgIGNvbnN0IFtwb3dlckxldmVscywgc2V0UG93ZXJMZXZlbHNdID0gdXNlU3RhdGU8SVBvd2VyTGV2ZWxzQ29udGVudD4oe30pO1xuXG4gICAgY29uc3QgdXBkYXRlID0gdXNlQ2FsbGJhY2soKGV2PzogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFyb29tKSByZXR1cm47XG4gICAgICAgIGlmIChldiAmJiBldi5nZXRUeXBlKCkgIT09IEV2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHMpIHJldHVybjtcblxuICAgICAgICBjb25zdCBldmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHMsIFwiXCIpO1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNldFBvd2VyTGV2ZWxzKGV2ZW50LmdldENvbnRlbnQoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRQb3dlckxldmVscyh7fSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHNldFBvd2VyTGV2ZWxzKHt9KTtcbiAgICAgICAgfTtcbiAgICB9LCBbcm9vbV0pO1xuXG4gICAgdXNlRXZlbnRFbWl0dGVyKGNsaSwgXCJSb29tU3RhdGUuZXZlbnRzXCIsIHVwZGF0ZSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQb3dlckxldmVscyh7fSk7XG4gICAgICAgIH07XG4gICAgfSwgW3VwZGF0ZV0pO1xuICAgIHJldHVybiBwb3dlckxldmVscztcbn07XG5cbmludGVyZmFjZSBJQmFzZVByb3BzIHtcbiAgICBtZW1iZXI6IFJvb21NZW1iZXI7XG4gICAgc3RhcnRVcGRhdGluZygpOiB2b2lkO1xuICAgIHN0b3BVcGRhdGluZygpOiB2b2lkO1xufVxuXG5jb25zdCBSb29tS2lja0J1dHRvbjogUmVhY3QuRkM8SUJhc2VQcm9wcz4gPSAoe21lbWJlciwgc3RhcnRVcGRhdGluZywgc3RvcFVwZGF0aW5nfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICAvLyBjaGVjayBpZiB1c2VyIGNhbiBiZSBraWNrZWQvZGlzaW52aXRlZFxuICAgIGlmIChtZW1iZXIubWVtYmVyc2hpcCAhPT0gXCJpbnZpdGVcIiAmJiBtZW1iZXIubWVtYmVyc2hpcCAhPT0gXCJqb2luXCIpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3Qgb25LaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB7ZmluaXNoZWR9ID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcbiAgICAgICAgICAgICdDb25maXJtIFVzZXIgQWN0aW9uIERpYWxvZycsXG4gICAgICAgICAgICAnb25LaWNrJyxcbiAgICAgICAgICAgIENvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lbWJlcixcbiAgICAgICAgICAgICAgICBhY3Rpb246IG1lbWJlci5tZW1iZXJzaGlwID09PSBcImludml0ZVwiID8gX3QoXCJEaXNpbnZpdGVcIikgOiBfdChcIktpY2tcIiksXG4gICAgICAgICAgICAgICAgdGl0bGU6IG1lbWJlci5tZW1iZXJzaGlwID09PSBcImludml0ZVwiID8gX3QoXCJEaXNpbnZpdGUgdGhpcyB1c2VyP1wiKSA6IF90KFwiS2ljayB0aGlzIHVzZXI/XCIpLFxuICAgICAgICAgICAgICAgIGFza1JlYXNvbjogbWVtYmVyLm1lbWJlcnNoaXAgPT09IFwiam9pblwiLFxuICAgICAgICAgICAgICAgIGRhbmdlcjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgW3Byb2NlZWQsIHJlYXNvbl0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgaWYgKCFwcm9jZWVkKSByZXR1cm47XG5cbiAgICAgICAgc3RhcnRVcGRhdGluZygpO1xuICAgICAgICBjbGkua2ljayhtZW1iZXIucm9vbUlkLCBtZW1iZXIudXNlcklkLCByZWFzb24gfHwgdW5kZWZpbmVkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIE5PLU9QOyByZWx5IG9uIHRoZSBtLnJvb20ubWVtYmVyIGV2ZW50IGNvbWluZyBkb3duIGVsc2Ugd2UgY291bGRcbiAgICAgICAgICAgIC8vIGdldCBvdXQgb2Ygc3luYyBpZiB3ZSBmb3JjZSBzZXRTdGF0ZSBoZXJlIVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJLaWNrIHN1Y2Nlc3NcIik7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIktpY2sgZXJyb3I6IFwiICsgZXJyKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byBraWNrJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbGVkIHRvIGtpY2tcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogXCJPcGVyYXRpb24gZmFpbGVkXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgc3RvcFVwZGF0aW5nKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBraWNrTGFiZWwgPSBtZW1iZXIubWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIiA/IF90KFwiRGlzaW52aXRlXCIpIDogX3QoXCJLaWNrXCIpO1xuICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZCBteF9Vc2VySW5mb19kZXN0cnVjdGl2ZVwiIG9uQ2xpY2s9e29uS2lja30+XG4gICAgICAgIHsga2lja0xhYmVsIH1cbiAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xufTtcblxuY29uc3QgUmVkYWN0TWVzc2FnZXNCdXR0b246IFJlYWN0LkZDPElCYXNlUHJvcHM+ID0gKHttZW1iZXJ9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IG9uUmVkYWN0QWxsTWVzc2FnZXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtyb29tSWQsIHVzZXJJZH0gPSBtZW1iZXI7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGltZWxpbmUgPSByb29tLmdldExpdmVUaW1lbGluZSgpO1xuICAgICAgICBsZXQgZXZlbnRzVG9SZWRhY3QgPSBbXTtcbiAgICAgICAgd2hpbGUgKHRpbWVsaW5lKSB7XG4gICAgICAgICAgICBldmVudHNUb1JlZGFjdCA9IHRpbWVsaW5lLmdldEV2ZW50cygpLnJlZHVjZSgoZXZlbnRzLCBldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5nZXRTZW5kZXIoKSA9PT0gdXNlcklkICYmICFldmVudC5pc1JlZGFjdGVkKCkgJiYgIWV2ZW50LmlzUmVkYWN0aW9uKCkgJiZcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZ2V0VHlwZSgpICE9PSBFdmVudFR5cGUuUm9vbUNyZWF0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCByZWRhY3QgQUNMcyBiZWNhdXNlIHRoYXQnbGwgb2JsaXRlcmF0ZSB0aGUgcm9vbVxuICAgICAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvc3luYXBzZS9pc3N1ZXMvNDA0MiBmb3IgZGV0YWlscy5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZ2V0VHlwZSgpICE9PSBFdmVudFR5cGUuUm9vbVNlcnZlckFjbFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnRzLmNvbmNhdChldmVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBldmVudHNUb1JlZGFjdCk7XG4gICAgICAgICAgICB0aW1lbGluZSA9IHRpbWVsaW5lLmdldE5laWdoYm91cmluZ1RpbWVsaW5lKEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvdW50ID0gZXZlbnRzVG9SZWRhY3QubGVuZ3RoO1xuICAgICAgICBjb25zdCB1c2VyID0gbWVtYmVyLm5hbWU7XG5cbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdObyB1c2VyIG1lc3NhZ2VzIGZvdW5kIHRvIHJlbW92ZScsICcnLCBJbmZvRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiTm8gcmVjZW50IG1lc3NhZ2VzIGJ5ICUodXNlcilzIGZvdW5kXCIsIHt1c2VyfSksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiVHJ5IHNjcm9sbGluZyB1cCBpbiB0aGUgdGltZWxpbmUgdG8gc2VlIGlmIHRoZXJlIGFyZSBhbnkgZWFybGllciBvbmVzLlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdSZW1vdmUgcmVjZW50IG1lc3NhZ2VzIGJ5IHVzZXInLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJSZW1vdmUgcmVjZW50IG1lc3NhZ2VzIGJ5ICUodXNlcilzXCIsIHt1c2VyfSksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiWW91IGFyZSBhYm91dCB0byByZW1vdmUgJShjb3VudClzIG1lc3NhZ2VzIGJ5ICUodXNlcilzLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGlzIGNhbm5vdCBiZSB1bmRvbmUuIERvIHlvdSB3aXNoIHRvIGNvbnRpbnVlP1wiLCB7Y291bnQsIHVzZXJ9KSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcIkZvciBhIGxhcmdlIGFtb3VudCBvZiBtZXNzYWdlcywgdGhpcyBtaWdodCB0YWtlIHNvbWUgdGltZS4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiUGxlYXNlIGRvbid0IHJlZnJlc2ggeW91ciBjbGllbnQgaW4gdGhlIG1lYW50aW1lLlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdChcIlJlbW92ZSAlKGNvdW50KXMgbWVzc2FnZXNcIiwge2NvdW50fSksXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgW2NvbmZpcm1lZF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgICAgIGlmICghY29uZmlybWVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdWJtaXR0aW5nIGEgbGFyZ2UgbnVtYmVyIG9mIHJlZGFjdGlvbnMgZnJlZXplcyB0aGUgVUksXG4gICAgICAgICAgICAvLyBzbyBmaXJzdCB5aWVsZCB0byBhbGxvdyB0byByZXJlbmRlciBhZnRlciBjbG9zaW5nIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBTdGFydGVkIHJlZGFjdGluZyByZWNlbnQgJHtjb3VudH0gbWVzc2FnZXMgZm9yICR7dXNlcn0gaW4gJHtyb29tSWR9YCk7XG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChldmVudHNUb1JlZGFjdC5tYXAoYXN5bmMgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5yZWRhY3RFdmVudChyb29tSWQsIGV2ZW50LmdldElkKCkpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAvLyBsb2cgYW5kIHN3YWxsb3cgZXJyb3JzXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb3VsZCBub3QgcmVkYWN0XCIsIGV2ZW50LmdldElkKCkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBGaW5pc2hlZCByZWRhY3RpbmcgcmVjZW50ICR7Y291bnR9IG1lc3NhZ2VzIGZvciAke3VzZXJ9IGluICR7cm9vbUlkfWApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZCBteF9Vc2VySW5mb19kZXN0cnVjdGl2ZVwiIG9uQ2xpY2s9e29uUmVkYWN0QWxsTWVzc2FnZXN9PlxuICAgICAgICB7IF90KFwiUmVtb3ZlIHJlY2VudCBtZXNzYWdlc1wiKSB9XG4gICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbn07XG5cbmNvbnN0IEJhblRvZ2dsZUJ1dHRvbjogUmVhY3QuRkM8SUJhc2VQcm9wcz4gPSAoe21lbWJlciwgc3RhcnRVcGRhdGluZywgc3RvcFVwZGF0aW5nfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBvbkJhbk9yVW5iYW4gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgJ0NvbmZpcm0gVXNlciBBY3Rpb24gRGlhbG9nJyxcbiAgICAgICAgICAgICdvbkJhbk9yVW5iYW4nLFxuICAgICAgICAgICAgQ29uZmlybVVzZXJBY3Rpb25EaWFsb2csXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVtYmVyLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogbWVtYmVyLm1lbWJlcnNoaXAgPT09ICdiYW4nID8gX3QoXCJVbmJhblwiKSA6IF90KFwiQmFuXCIpLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBtZW1iZXIubWVtYmVyc2hpcCA9PT0gJ2JhbicgPyBfdChcIlVuYmFuIHRoaXMgdXNlcj9cIikgOiBfdChcIkJhbiB0aGlzIHVzZXI/XCIpLFxuICAgICAgICAgICAgICAgIGFza1JlYXNvbjogbWVtYmVyLm1lbWJlcnNoaXAgIT09ICdiYW4nLFxuICAgICAgICAgICAgICAgIGRhbmdlcjogbWVtYmVyLm1lbWJlcnNoaXAgIT09ICdiYW4nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBbcHJvY2VlZCwgcmVhc29uXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICBpZiAoIXByb2NlZWQpIHJldHVybjtcblxuICAgICAgICBzdGFydFVwZGF0aW5nKCk7XG4gICAgICAgIGxldCBwcm9taXNlO1xuICAgICAgICBpZiAobWVtYmVyLm1lbWJlcnNoaXAgPT09ICdiYW4nKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gY2xpLnVuYmFuKG1lbWJlci5yb29tSWQsIG1lbWJlci51c2VySWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZSA9IGNsaS5iYW4obWVtYmVyLnJvb21JZCwgbWVtYmVyLnVzZXJJZCwgcmVhc29uIHx8IHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIE5PLU9QOyByZWx5IG9uIHRoZSBtLnJvb20ubWVtYmVyIGV2ZW50IGNvbWluZyBkb3duIGVsc2Ugd2UgY291bGRcbiAgICAgICAgICAgIC8vIGdldCBvdXQgb2Ygc3luYyBpZiB3ZSBmb3JjZSBzZXRTdGF0ZSBoZXJlIVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJCYW4gc3VjY2Vzc1wiKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQmFuIGVycm9yOiBcIiArIGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gYmFuIHVzZXInLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJGYWlsZWQgdG8gYmFuIHVzZXJcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBzdG9wVXBkYXRpbmcoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxldCBsYWJlbCA9IF90KFwiQmFuXCIpO1xuICAgIGlmIChtZW1iZXIubWVtYmVyc2hpcCA9PT0gJ2JhbicpIHtcbiAgICAgICAgbGFiZWwgPSBfdChcIlVuYmFuXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfVXNlckluZm9fZmllbGRcIiwge1xuICAgICAgICBteF9Vc2VySW5mb19kZXN0cnVjdGl2ZTogbWVtYmVyLm1lbWJlcnNoaXAgIT09ICdiYW4nLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT17Y2xhc3Nlc30gb25DbGljaz17b25CYW5PclVuYmFufT5cbiAgICAgICAgeyBsYWJlbCB9XG4gICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbn07XG5cbmludGVyZmFjZSBJQmFzZVJvb21Qcm9wcyBleHRlbmRzIElCYXNlUHJvcHMge1xuICAgIHJvb206IFJvb207XG4gICAgcG93ZXJMZXZlbHM6IElQb3dlckxldmVsc0NvbnRlbnQ7XG59XG5cbmNvbnN0IE11dGVUb2dnbGVCdXR0b246IFJlYWN0LkZDPElCYXNlUm9vbVByb3BzPiA9ICh7bWVtYmVyLCByb29tLCBwb3dlckxldmVscywgc3RhcnRVcGRhdGluZywgc3RvcFVwZGF0aW5nfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICAvLyBEb24ndCBzaG93IHRoZSBtdXRlL3VubXV0ZSBvcHRpb24gaWYgdGhlIHVzZXIgaXMgbm90IGluIHRoZSByb29tXG4gICAgaWYgKG1lbWJlci5tZW1iZXJzaGlwICE9PSBcImpvaW5cIikgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBtdXRlZCA9IGlzTXV0ZWQobWVtYmVyLCBwb3dlckxldmVscyk7XG4gICAgY29uc3Qgb25NdXRlVG9nZ2xlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCByb29tSWQgPSBtZW1iZXIucm9vbUlkO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBtZW1iZXIudXNlcklkO1xuXG4gICAgICAgIC8vIGlmIG11dGluZyBzZWxmLCB3YXJuIGFzIGl0IG1heSBiZSBpcnJldmVyc2libGVcbiAgICAgICAgaWYgKHRhcmdldCA9PT0gY2xpLmdldFVzZXJJZCgpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghKGF3YWl0IHdhcm5TZWxmRGVtb3RlKHJvb20/LmlzU3BhY2VSb29tKCkpKSkgcmV0dXJuO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gd2FybiBhYm91dCBzZWxmIGRlbW90aW9uOiBcIiwgZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcG93ZXJMZXZlbEV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20ucG93ZXJfbGV2ZWxzXCIsIFwiXCIpO1xuICAgICAgICBpZiAoIXBvd2VyTGV2ZWxFdmVudCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxzID0gcG93ZXJMZXZlbEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgY29uc3QgbGV2ZWxUb1NlbmQgPSAoXG4gICAgICAgICAgICAocG93ZXJMZXZlbHMuZXZlbnRzID8gcG93ZXJMZXZlbHMuZXZlbnRzW1wibS5yb29tLm1lc3NhZ2VcIl0gOiBudWxsKSB8fFxuICAgICAgICAgICAgcG93ZXJMZXZlbHMuZXZlbnRzX2RlZmF1bHRcbiAgICAgICAgKTtcbiAgICAgICAgbGV0IGxldmVsO1xuICAgICAgICBpZiAobXV0ZWQpIHsgLy8gdW5tdXRlXG4gICAgICAgICAgICBsZXZlbCA9IGxldmVsVG9TZW5kO1xuICAgICAgICB9IGVsc2UgeyAvLyBtdXRlXG4gICAgICAgICAgICBsZXZlbCA9IGxldmVsVG9TZW5kIC0gMTtcbiAgICAgICAgfVxuICAgICAgICBsZXZlbCA9IHBhcnNlSW50KGxldmVsKTtcblxuICAgICAgICBpZiAoIWlzTmFOKGxldmVsKSkge1xuICAgICAgICAgICAgc3RhcnRVcGRhdGluZygpO1xuICAgICAgICAgICAgY2xpLnNldFBvd2VyTGV2ZWwocm9vbUlkLCB0YXJnZXQsIGxldmVsLCBwb3dlckxldmVsRXZlbnQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE5PLU9QOyByZWx5IG9uIHRoZSBtLnJvb20ubWVtYmVyIGV2ZW50IGNvbWluZyBkb3duIGVsc2Ugd2UgY291bGRcbiAgICAgICAgICAgICAgICAvLyBnZXQgb3V0IG9mIHN5bmMgaWYgd2UgZm9yY2Ugc2V0U3RhdGUgaGVyZSFcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk11dGUgdG9nZ2xlIHN1Y2Nlc3NcIik7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiTXV0ZSBlcnJvcjogXCIgKyBlcnIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byBtdXRlIHVzZXInLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRXJyb3JcIiksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIkZhaWxlZCB0byBtdXRlIHVzZXJcIiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICBzdG9wVXBkYXRpbmcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfVXNlckluZm9fZmllbGRcIiwge1xuICAgICAgICBteF9Vc2VySW5mb19kZXN0cnVjdGl2ZTogIW11dGVkLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbXV0ZUxhYmVsID0gbXV0ZWQgPyBfdChcIlVubXV0ZVwiKSA6IF90KFwiTXV0ZVwiKTtcbiAgICByZXR1cm4gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPXtjbGFzc2VzfSBvbkNsaWNrPXtvbk11dGVUb2dnbGV9PlxuICAgICAgICB7IG11dGVMYWJlbCB9XG4gICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbn07XG5cbmNvbnN0IFJvb21BZG1pblRvb2xzQ29udGFpbmVyOiBSZWFjdC5GQzxJQmFzZVJvb21Qcm9wcz4gPSAoe1xuICAgIHJvb20sXG4gICAgY2hpbGRyZW4sXG4gICAgbWVtYmVyLFxuICAgIHN0YXJ0VXBkYXRpbmcsXG4gICAgc3RvcFVwZGF0aW5nLFxuICAgIHBvd2VyTGV2ZWxzLFxufSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgbGV0IGtpY2tCdXR0b247XG4gICAgbGV0IGJhbkJ1dHRvbjtcbiAgICBsZXQgbXV0ZUJ1dHRvbjtcbiAgICBsZXQgcmVkYWN0QnV0dG9uO1xuXG4gICAgY29uc3QgZWRpdFBvd2VyTGV2ZWwgPSAoXG4gICAgICAgIChwb3dlckxldmVscy5ldmVudHMgPyBwb3dlckxldmVscy5ldmVudHNbXCJtLnJvb20ucG93ZXJfbGV2ZWxzXCJdIDogbnVsbCkgfHxcbiAgICAgICAgcG93ZXJMZXZlbHMuc3RhdGVfZGVmYXVsdFxuICAgICk7XG5cbiAgICAvLyBpZiB0aGVzZSBkbyBub3QgZXhpc3QgaW4gdGhlIGV2ZW50IHRoZW4gdGhleSBzaG91bGQgZGVmYXVsdCB0byA1MCBhcyBwZXIgdGhlIHNwZWNcbiAgICBjb25zdCB7XG4gICAgICAgIGJhbjogYmFuUG93ZXJMZXZlbCA9IDUwLFxuICAgICAgICBraWNrOiBraWNrUG93ZXJMZXZlbCA9IDUwLFxuICAgICAgICByZWRhY3Q6IHJlZGFjdFBvd2VyTGV2ZWwgPSA1MCxcbiAgICB9ID0gcG93ZXJMZXZlbHM7XG5cbiAgICBjb25zdCBtZSA9IHJvb20uZ2V0TWVtYmVyKGNsaS5nZXRVc2VySWQoKSk7XG4gICAgaWYgKCFtZSkge1xuICAgICAgICAvLyB3ZSBhcmVuJ3QgaW4gdGhlIHJvb20sIHNvIHJldHVybiBubyBhZG1pbiB0b29saW5nXG4gICAgICAgIHJldHVybiA8ZGl2IC8+O1xuICAgIH1cblxuICAgIGNvbnN0IGlzTWUgPSBtZS51c2VySWQgPT09IG1lbWJlci51c2VySWQ7XG4gICAgY29uc3QgY2FuQWZmZWN0VXNlciA9IG1lbWJlci5wb3dlckxldmVsIDwgbWUucG93ZXJMZXZlbCB8fCBpc01lO1xuXG4gICAgaWYgKGNhbkFmZmVjdFVzZXIgJiYgbWUucG93ZXJMZXZlbCA+PSBraWNrUG93ZXJMZXZlbCkge1xuICAgICAgICBraWNrQnV0dG9uID0gPFJvb21LaWNrQnV0dG9uIG1lbWJlcj17bWVtYmVyfSBzdGFydFVwZGF0aW5nPXtzdGFydFVwZGF0aW5nfSBzdG9wVXBkYXRpbmc9e3N0b3BVcGRhdGluZ30gLz47XG4gICAgfVxuICAgIGlmIChtZS5wb3dlckxldmVsID49IHJlZGFjdFBvd2VyTGV2ZWwgJiYgIXJvb20uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICByZWRhY3RCdXR0b24gPSAoXG4gICAgICAgICAgICA8UmVkYWN0TWVzc2FnZXNCdXR0b24gbWVtYmVyPXttZW1iZXJ9IHN0YXJ0VXBkYXRpbmc9e3N0YXJ0VXBkYXRpbmd9IHN0b3BVcGRhdGluZz17c3RvcFVwZGF0aW5nfSAvPlxuICAgICAgICApO1xuICAgIH1cbiAgICBpZiAoY2FuQWZmZWN0VXNlciAmJiBtZS5wb3dlckxldmVsID49IGJhblBvd2VyTGV2ZWwpIHtcbiAgICAgICAgYmFuQnV0dG9uID0gPEJhblRvZ2dsZUJ1dHRvbiBtZW1iZXI9e21lbWJlcn0gc3RhcnRVcGRhdGluZz17c3RhcnRVcGRhdGluZ30gc3RvcFVwZGF0aW5nPXtzdG9wVXBkYXRpbmd9IC8+O1xuICAgIH1cbiAgICBpZiAoY2FuQWZmZWN0VXNlciAmJiBtZS5wb3dlckxldmVsID49IGVkaXRQb3dlckxldmVsKSB7XG4gICAgICAgIG11dGVCdXR0b24gPSAoXG4gICAgICAgICAgICA8TXV0ZVRvZ2dsZUJ1dHRvblxuICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyfVxuICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgcG93ZXJMZXZlbHM9e3Bvd2VyTGV2ZWxzfVxuICAgICAgICAgICAgICAgIHN0YXJ0VXBkYXRpbmc9e3N0YXJ0VXBkYXRpbmd9XG4gICAgICAgICAgICAgICAgc3RvcFVwZGF0aW5nPXtzdG9wVXBkYXRpbmd9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGlmIChraWNrQnV0dG9uIHx8IGJhbkJ1dHRvbiB8fCBtdXRlQnV0dG9uIHx8IHJlZGFjdEJ1dHRvbiB8fCBjaGlsZHJlbikge1xuICAgICAgICByZXR1cm4gPEdlbmVyaWNBZG1pblRvb2xzQ29udGFpbmVyPlxuICAgICAgICAgICAgeyBtdXRlQnV0dG9uIH1cbiAgICAgICAgICAgIHsga2lja0J1dHRvbiB9XG4gICAgICAgICAgICB7IGJhbkJ1dHRvbiB9XG4gICAgICAgICAgICB7IHJlZGFjdEJ1dHRvbiB9XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPC9HZW5lcmljQWRtaW5Ub29sc0NvbnRhaW5lcj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXYgLz47XG59O1xuXG5pbnRlcmZhY2UgR3JvdXBNZW1iZXIge1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICAgIGRpc3BsYXluYW1lPzogc3RyaW5nOyAvLyBYWFg6IEdyb3VwTWVtYmVyIG9iamVjdHMgYXJlIGluY29uc2lzdGVudCA6KChcbiAgICBhdmF0YXJVcmw/OiBzdHJpbmc7XG59XG5cbmNvbnN0IEdyb3VwQWRtaW5Ub29sc1NlY3Rpb246IFJlYWN0LkZDPHtcbiAgICBncm91cElkOiBzdHJpbmc7XG4gICAgZ3JvdXBNZW1iZXI6IEdyb3VwTWVtYmVyO1xuICAgIHN0YXJ0VXBkYXRpbmcoKTogdm9pZDtcbiAgICBzdG9wVXBkYXRpbmcoKTogdm9pZDtcbn0+ID0gKHtjaGlsZHJlbiwgZ3JvdXBJZCwgZ3JvdXBNZW1iZXIsIHN0YXJ0VXBkYXRpbmcsIHN0b3BVcGRhdGluZ30pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgY29uc3QgW2lzUHJpdmlsZWdlZCwgc2V0SXNQcml2aWxlZ2VkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbaXNJbnZpdGVkLCBzZXRJc0ludml0ZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gICAgLy8gTGlzdGVuIHRvIGdyb3VwIHN0b3JlIGNoYW5nZXNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsZXQgdW5tb3VudGVkID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3Qgb25Hcm91cFN0b3JlVXBkYXRlZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh1bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgICAgIHNldElzUHJpdmlsZWdlZChHcm91cFN0b3JlLmlzVXNlclByaXZpbGVnZWQoZ3JvdXBJZCkpO1xuICAgICAgICAgICAgc2V0SXNJbnZpdGVkKEdyb3VwU3RvcmUuZ2V0R3JvdXBJbnZpdGVkTWVtYmVycyhncm91cElkKS5zb21lKFxuICAgICAgICAgICAgICAgIChtKSA9PiBtLnVzZXJJZCA9PT0gZ3JvdXBNZW1iZXIudXNlcklkLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgR3JvdXBTdG9yZS5yZWdpc3Rlckxpc3RlbmVyKGdyb3VwSWQsIG9uR3JvdXBTdG9yZVVwZGF0ZWQpO1xuICAgICAgICBvbkdyb3VwU3RvcmVVcGRhdGVkKCk7XG4gICAgICAgIC8vIEhhbmRsZSB1bm1vdW50XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB1bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgR3JvdXBTdG9yZS51bnJlZ2lzdGVyTGlzdGVuZXIob25Hcm91cFN0b3JlVXBkYXRlZCk7XG4gICAgICAgIH07XG4gICAgfSwgW2dyb3VwSWQsIGdyb3VwTWVtYmVyLnVzZXJJZF0pO1xuXG4gICAgaWYgKGlzUHJpdmlsZWdlZCkge1xuICAgICAgICBjb25zdCBvbktpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7ZmluaXNoZWR9ID0gTW9kYWwuY3JlYXRlRGlhbG9nKENvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50OiBjbGksXG4gICAgICAgICAgICAgICAgZ3JvdXBNZW1iZXIsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBpc0ludml0ZWQgPyBfdCgnRGlzaW52aXRlJykgOiBfdCgnUmVtb3ZlIGZyb20gY29tbXVuaXR5JyksXG4gICAgICAgICAgICAgICAgdGl0bGU6IGlzSW52aXRlZCA/IF90KCdEaXNpbnZpdGUgdGhpcyB1c2VyIGZyb20gY29tbXVuaXR5PycpXG4gICAgICAgICAgICAgICAgICAgIDogX3QoJ1JlbW92ZSB0aGlzIHVzZXIgZnJvbSBjb21tdW5pdHk/JyksXG4gICAgICAgICAgICAgICAgZGFuZ2VyOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IFtwcm9jZWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFwcm9jZWVkKSByZXR1cm47XG5cbiAgICAgICAgICAgIHN0YXJ0VXBkYXRpbmcoKTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVVc2VyRnJvbUdyb3VwKGdyb3VwSWQsIGdyb3VwTWVtYmVyLnVzZXJJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRvIHRoZSB1c2VyIGxpc3RcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3VXNlcixcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyOiBudWxsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gcmVtb3ZlIHVzZXIgZnJvbSBncm91cCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yJyksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpc0ludml0ZWQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgX3QoJ0ZhaWxlZCB0byB3aXRoZHJhdyBpbnZpdGF0aW9uJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgX3QoJ0ZhaWxlZCB0byByZW1vdmUgdXNlciBmcm9tIGNvbW11bml0eScpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RvcFVwZGF0aW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBraWNrQnV0dG9uID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZmllbGQgbXhfVXNlckluZm9fZGVzdHJ1Y3RpdmVcIiBvbkNsaWNrPXtvbktpY2t9PlxuICAgICAgICAgICAgICAgIHsgaXNJbnZpdGVkID8gX3QoJ0Rpc2ludml0ZScpIDogX3QoJ1JlbW92ZSBmcm9tIGNvbW11bml0eScpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBObyBtYWtlL3Jldm9rZSBhZG1pbiBBUEkgeWV0XG4gICAgICAgIC8qY29uc3Qgb3BMYWJlbCA9IHRoaXMuc3RhdGUuaXNUYXJnZXRNb2QgPyBfdChcIlJldm9rZSBNb2RlcmF0b3JcIikgOiBfdChcIk1ha2UgTW9kZXJhdG9yXCIpO1xuICAgICAgICBnaXZlTW9kQnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZmllbGRcIiBvbkNsaWNrPXt0aGlzLm9uTW9kVG9nZ2xlfT5cbiAgICAgICAgICAgIHtnaXZlT3BMYWJlbH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjsqL1xuXG4gICAgICAgIHJldHVybiA8R2VuZXJpY0FkbWluVG9vbHNDb250YWluZXI+XG4gICAgICAgICAgICB7IGtpY2tCdXR0b24gfVxuICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgIDwvR2VuZXJpY0FkbWluVG9vbHNDb250YWluZXI+O1xuICAgIH1cblxuICAgIHJldHVybiA8ZGl2IC8+O1xufTtcblxuY29uc3QgdXNlSXNTeW5hcHNlQWRtaW4gPSAoY2xpOiBNYXRyaXhDbGllbnQpID0+IHtcbiAgICBjb25zdCBbaXNBZG1pbiwgc2V0SXNBZG1pbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY2xpLmlzU3luYXBzZUFkbWluaXN0cmF0b3IoKS50aGVuKChpc0FkbWluKSA9PiB7XG4gICAgICAgICAgICBzZXRJc0FkbWluKGlzQWRtaW4pO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRJc0FkbWluKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfSwgW2NsaV0pO1xuICAgIHJldHVybiBpc0FkbWluO1xufTtcblxuY29uc3QgdXNlSG9tZXNlcnZlclN1cHBvcnRzQ3Jvc3NTaWduaW5nID0gKGNsaTogTWF0cml4Q2xpZW50KSA9PiB7XG4gICAgcmV0dXJuIHVzZUFzeW5jTWVtbzxib29sZWFuPihhc3luYyAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjbGkuZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUoXCJvcmcubWF0cml4LmUyZV9jcm9zc19zaWduaW5nXCIpO1xuICAgIH0sIFtjbGldLCBmYWxzZSk7XG59O1xuXG5pbnRlcmZhY2UgSVJvb21QZXJtaXNzaW9ucyB7XG4gICAgbW9kaWZ5TGV2ZWxNYXg6IG51bWJlcjtcbiAgICBjYW5FZGl0OiBib29sZWFuO1xuICAgIGNhbkludml0ZTogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gdXNlUm9vbVBlcm1pc3Npb25zKGNsaTogTWF0cml4Q2xpZW50LCByb29tOiBSb29tLCB1c2VyOiBVc2VyKTogSVJvb21QZXJtaXNzaW9ucyB7XG4gICAgY29uc3QgW3Jvb21QZXJtaXNzaW9ucywgc2V0Um9vbVBlcm1pc3Npb25zXSA9IHVzZVN0YXRlPElSb29tUGVybWlzc2lvbnM+KHtcbiAgICAgICAgLy8gbW9kaWZ5TGV2ZWxNYXggaXMgdGhlIG1heCBQTCB3ZSBjYW4gc2V0IHRoaXMgdXNlciB0bywgdHlwaWNhbGx5IG1pbih0aGVpciBQTCwgb3VyIFBMKSAmJiBjYW5TZXRQTFxuICAgICAgICBtb2RpZnlMZXZlbE1heDogLTEsXG4gICAgICAgIGNhbkVkaXQ6IGZhbHNlLFxuICAgICAgICBjYW5JbnZpdGU6IGZhbHNlLFxuICAgIH0pO1xuICAgIGNvbnN0IHVwZGF0ZVJvb21QZXJtaXNzaW9ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwb3dlckxldmVsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIiwgXCJcIik7XG4gICAgICAgIGlmICghcG93ZXJMZXZlbEV2ZW50KSByZXR1cm47XG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxzID0gcG93ZXJMZXZlbEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgaWYgKCFwb3dlckxldmVscykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG1lID0gcm9vbS5nZXRNZW1iZXIoY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgaWYgKCFtZSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHRoZW0gPSB1c2VyO1xuICAgICAgICBjb25zdCBpc01lID0gbWUudXNlcklkID09PSB0aGVtLnVzZXJJZDtcbiAgICAgICAgY29uc3QgY2FuQWZmZWN0VXNlciA9IHRoZW0ucG93ZXJMZXZlbCA8IG1lLnBvd2VyTGV2ZWwgfHwgaXNNZTtcblxuICAgICAgICBsZXQgbW9kaWZ5TGV2ZWxNYXggPSAtMTtcbiAgICAgICAgaWYgKGNhbkFmZmVjdFVzZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVkaXRQb3dlckxldmVsID0gKFxuICAgICAgICAgICAgICAgIChwb3dlckxldmVscy5ldmVudHMgPyBwb3dlckxldmVscy5ldmVudHNbXCJtLnJvb20ucG93ZXJfbGV2ZWxzXCJdIDogbnVsbCkgfHxcbiAgICAgICAgICAgICAgICBwb3dlckxldmVscy5zdGF0ZV9kZWZhdWx0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG1lLnBvd2VyTGV2ZWwgPj0gZWRpdFBvd2VyTGV2ZWwgJiYgKGlzTWUgfHwgbWUucG93ZXJMZXZlbCA+IHRoZW0ucG93ZXJMZXZlbCkpIHtcbiAgICAgICAgICAgICAgICBtb2RpZnlMZXZlbE1heCA9IG1lLnBvd2VyTGV2ZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXRSb29tUGVybWlzc2lvbnMoe1xuICAgICAgICAgICAgY2FuSW52aXRlOiBtZS5wb3dlckxldmVsID49IHBvd2VyTGV2ZWxzLmludml0ZSxcbiAgICAgICAgICAgIGNhbkVkaXQ6IG1vZGlmeUxldmVsTWF4ID49IDAsXG4gICAgICAgICAgICBtb2RpZnlMZXZlbE1heCxcbiAgICAgICAgfSk7XG4gICAgfSwgW2NsaSwgdXNlciwgcm9vbV0pO1xuICAgIHVzZUV2ZW50RW1pdHRlcihjbGksIFwiUm9vbVN0YXRlLm1lbWJlcnNcIiwgdXBkYXRlUm9vbVBlcm1pc3Npb25zKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICB1cGRhdGVSb29tUGVybWlzc2lvbnMoKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHNldFJvb21QZXJtaXNzaW9ucyh7XG4gICAgICAgICAgICAgICAgbW9kaWZ5TGV2ZWxNYXg6IC0xLFxuICAgICAgICAgICAgICAgIGNhbkVkaXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNhbkludml0ZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9LCBbdXBkYXRlUm9vbVBlcm1pc3Npb25zXSk7XG5cbiAgICByZXR1cm4gcm9vbVBlcm1pc3Npb25zO1xufVxuXG5jb25zdCBQb3dlckxldmVsU2VjdGlvbjogUmVhY3QuRkM8e1xuICAgIHVzZXI6IFVzZXI7XG4gICAgcm9vbTogUm9vbTtcbiAgICByb29tUGVybWlzc2lvbnM6IElSb29tUGVybWlzc2lvbnM7XG4gICAgcG93ZXJMZXZlbHM6IElQb3dlckxldmVsc0NvbnRlbnQ7XG59PiA9ICh7dXNlciwgcm9vbSwgcm9vbVBlcm1pc3Npb25zLCBwb3dlckxldmVsc30pID0+IHtcbiAgICBpZiAocm9vbVBlcm1pc3Npb25zLmNhbkVkaXQpIHtcbiAgICAgICAgcmV0dXJuICg8UG93ZXJMZXZlbEVkaXRvciB1c2VyPXt1c2VyfSByb29tPXtyb29tfSByb29tUGVybWlzc2lvbnM9e3Jvb21QZXJtaXNzaW9uc30gLz4pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxVc2Vyc0RlZmF1bHQgPSBwb3dlckxldmVscy51c2Vyc19kZWZhdWx0IHx8IDA7XG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWwgPSBwYXJzZUludCh1c2VyLnBvd2VyTGV2ZWwsIDEwKTtcbiAgICAgICAgY29uc3Qgcm9sZSA9IHRleHR1YWxQb3dlckxldmVsKHBvd2VyTGV2ZWwsIHBvd2VyTGV2ZWxVc2Vyc0RlZmF1bHQpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19wcm9maWxlRmllbGRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3JvbGVEZXNjcmlwdGlvblwiPntyb2xlfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufTtcblxuY29uc3QgUG93ZXJMZXZlbEVkaXRvcjogUmVhY3QuRkM8e1xuICAgIHVzZXI6IFVzZXI7XG4gICAgcm9vbTogUm9vbTtcbiAgICByb29tUGVybWlzc2lvbnM6IElSb29tUGVybWlzc2lvbnM7XG59PiA9ICh7dXNlciwgcm9vbSwgcm9vbVBlcm1pc3Npb25zfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBbc2VsZWN0ZWRQb3dlckxldmVsLCBzZXRTZWxlY3RlZFBvd2VyTGV2ZWxdID0gdXNlU3RhdGUocGFyc2VJbnQodXNlci5wb3dlckxldmVsLCAxMCkpO1xuICAgIGNvbnN0IG9uUG93ZXJDaGFuZ2UgPSB1c2VDYWxsYmFjayhhc3luYyAocG93ZXJMZXZlbFN0cjogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWwgPSBwYXJzZUludChwb3dlckxldmVsU3RyLCAxMCk7XG4gICAgICAgIHNldFNlbGVjdGVkUG93ZXJMZXZlbChwb3dlckxldmVsKTtcblxuICAgICAgICBjb25zdCBhcHBseVBvd2VyQ2hhbmdlID0gKHJvb21JZCwgdGFyZ2V0LCBwb3dlckxldmVsLCBwb3dlckxldmVsRXZlbnQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjbGkuc2V0UG93ZXJMZXZlbChyb29tSWQsIHRhcmdldCwgcGFyc2VJbnQocG93ZXJMZXZlbCksIHBvd2VyTGV2ZWxFdmVudCkudGhlbihcbiAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTk8tT1A7IHJlbHkgb24gdGhlIG0ucm9vbS5tZW1iZXIgZXZlbnQgY29taW5nIGRvd24gZWxzZSB3ZSBjb3VsZFxuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgb3V0IG9mIHN5bmMgaWYgd2UgZm9yY2Ugc2V0U3RhdGUgaGVyZSFcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQb3dlciBjaGFuZ2Ugc3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBjaGFuZ2UgcG93ZXIgbGV2ZWwgXCIgKyBlcnIpO1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gY2hhbmdlIHBvd2VyIGxldmVsJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIkZhaWxlZCB0byBjaGFuZ2UgcG93ZXIgbGV2ZWxcIiksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHVzZXIucm9vbUlkO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSB1c2VyLnVzZXJJZDtcblxuICAgICAgICBjb25zdCBwb3dlckxldmVsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIiwgXCJcIik7XG4gICAgICAgIGlmICghcG93ZXJMZXZlbEV2ZW50KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbXlVc2VySWQgPSBjbGkuZ2V0VXNlcklkKCk7XG4gICAgICAgIGNvbnN0IG15UG93ZXIgPSBwb3dlckxldmVsRXZlbnQuZ2V0Q29udGVudCgpLnVzZXJzW215VXNlcklkXTtcbiAgICAgICAgaWYgKG15UG93ZXIgJiYgcGFyc2VJbnQobXlQb3dlcikgPT09IHBvd2VyTGV2ZWwpIHtcbiAgICAgICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdQcm9tb3RlIHRvIFBMMTAwIFdhcm5pbmcnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJXYXJuaW5nIVwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byB1bmRvIHRoaXMgY2hhbmdlIGFzIHlvdSBhcmUgcHJvbW90aW5nIHRoZSB1c2VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRvIGhhdmUgdGhlIHNhbWUgcG93ZXIgbGV2ZWwgYXMgeW91cnNlbGYuXCIpIH08YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBcmUgeW91IHN1cmU/XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDb250aW51ZVwiKSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChteVVzZXJJZCA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBhcmUgY2hhbmdpbmcgb3VyIG93biBQTCBpdCBjYW4gb25seSBldmVyIGJlIGRlY3JlYXNpbmcsIHdoaWNoIHdlIGNhbm5vdCByZXZlcnNlLlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIShhd2FpdCB3YXJuU2VsZkRlbW90ZShyb29tPy5pc1NwYWNlUm9vbSgpKSkpIHJldHVybjtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHdhcm4gYWJvdXQgc2VsZiBkZW1vdGlvbjogXCIsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgYXBwbHlQb3dlckNoYW5nZShyb29tSWQsIHRhcmdldCwgcG93ZXJMZXZlbCwgcG93ZXJMZXZlbEV2ZW50KTtcbiAgICB9LCBbdXNlci5yb29tSWQsIHVzZXIudXNlcklkLCBjbGksIHJvb21dKTtcblxuICAgIGNvbnN0IHBvd2VyTGV2ZWxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBcIlwiKTtcbiAgICBjb25zdCBwb3dlckxldmVsVXNlcnNEZWZhdWx0ID0gcG93ZXJMZXZlbEV2ZW50ID8gcG93ZXJMZXZlbEV2ZW50LmdldENvbnRlbnQoKS51c2Vyc19kZWZhdWx0IDogMDtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fcHJvZmlsZUZpZWxkXCI+XG4gICAgICAgICAgICA8UG93ZXJTZWxlY3RvclxuICAgICAgICAgICAgICAgIGxhYmVsPXtudWxsfVxuICAgICAgICAgICAgICAgIHZhbHVlPXtzZWxlY3RlZFBvd2VyTGV2ZWx9XG4gICAgICAgICAgICAgICAgbWF4VmFsdWU9e3Jvb21QZXJtaXNzaW9ucy5tb2RpZnlMZXZlbE1heH1cbiAgICAgICAgICAgICAgICB1c2Vyc0RlZmF1bHQ9e3Bvd2VyTGV2ZWxVc2Vyc0RlZmF1bHR9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e29uUG93ZXJDaGFuZ2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZURldmljZXMgPSAodXNlcklkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgLy8gdW5kZWZpbmVkIG1lYW5zIHlldCB0byBiZSBsb2FkZWQsIG51bGwgbWVhbnMgZmFpbGVkIHRvIGxvYWQsIG90aGVyd2lzZSBsaXN0IG9mIGRldmljZXNcbiAgICBjb25zdCBbZGV2aWNlcywgc2V0RGV2aWNlc10gPSB1c2VTdGF0ZSh1bmRlZmluZWQpO1xuICAgIC8vIERvd25sb2FkIGRldmljZSBsaXN0c1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHNldERldmljZXModW5kZWZpbmVkKTtcblxuICAgICAgICBsZXQgY2FuY2VsbGVkID0gZmFsc2U7XG5cbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWREZXZpY2VMaXN0KCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGkuZG93bmxvYWRLZXlzKFt1c2VySWRdLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VzID0gY2xpLmdldFN0b3JlZERldmljZXNGb3JVc2VyKHVzZXJJZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGdvdCBjYW5jZWxsZWQgLSBwcmVzdW1hYmx5IGEgZGlmZmVyZW50IHVzZXIgbm93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkaXNhbWJpZ3VhdGVEZXZpY2VzKGRldmljZXMpO1xuICAgICAgICAgICAgICAgIHNldERldmljZXMoZGV2aWNlcyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBzZXREZXZpY2VzKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRvd25sb2FkRGV2aWNlTGlzdCgpO1xuXG4gICAgICAgIC8vIEhhbmRsZSBiZWluZyB1bm1vdW50ZWRcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNhbmNlbGxlZCA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfSwgW2NsaSwgdXNlcklkXSk7XG5cbiAgICAvLyBMaXN0ZW4gdG8gY2hhbmdlc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxldCBjYW5jZWwgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdXBkYXRlRGV2aWNlcyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld0RldmljZXMgPSBjbGkuZ2V0U3RvcmVkRGV2aWNlc0ZvclVzZXIodXNlcklkKTtcbiAgICAgICAgICAgIGlmIChjYW5jZWwpIHJldHVybjtcbiAgICAgICAgICAgIHNldERldmljZXMobmV3RGV2aWNlcyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9uRGV2aWNlc1VwZGF0ZWQgPSAodXNlcnMpID0+IHtcbiAgICAgICAgICAgIGlmICghdXNlcnMuaW5jbHVkZXModXNlcklkKSkgcmV0dXJuO1xuICAgICAgICAgICAgdXBkYXRlRGV2aWNlcygpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBvbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQgPSAoX3VzZXJJZCwgZGV2aWNlKSA9PiB7XG4gICAgICAgICAgICBpZiAoX3VzZXJJZCAhPT0gdXNlcklkKSByZXR1cm47XG4gICAgICAgICAgICB1cGRhdGVEZXZpY2VzKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9uVXNlclRydXN0U3RhdHVzQ2hhbmdlZCA9IChfdXNlcklkLCB0cnVzdFN0YXR1cykgPT4ge1xuICAgICAgICAgICAgaWYgKF91c2VySWQgIT09IHVzZXJJZCkgcmV0dXJuO1xuICAgICAgICAgICAgdXBkYXRlRGV2aWNlcygpO1xuICAgICAgICB9O1xuICAgICAgICBjbGkub24oXCJjcnlwdG8uZGV2aWNlc1VwZGF0ZWRcIiwgb25EZXZpY2VzVXBkYXRlZCk7XG4gICAgICAgIGNsaS5vbihcImRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWRcIiwgb25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgY2xpLm9uKFwidXNlclRydXN0U3RhdHVzQ2hhbmdlZFwiLCBvblVzZXJUcnVzdFN0YXR1c0NoYW5nZWQpO1xuICAgICAgICAvLyBIYW5kbGUgYmVpbmcgdW5tb3VudGVkXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjYW5jZWwgPSB0cnVlO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFwiY3J5cHRvLmRldmljZXNVcGRhdGVkXCIsIG9uRGV2aWNlc1VwZGF0ZWQpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFwiZGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZFwiLCBvbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFwidXNlclRydXN0U3RhdHVzQ2hhbmdlZFwiLCBvblVzZXJUcnVzdFN0YXR1c0NoYW5nZWQpO1xuICAgICAgICB9O1xuICAgIH0sIFtjbGksIHVzZXJJZF0pO1xuXG4gICAgcmV0dXJuIGRldmljZXM7XG59O1xuXG5jb25zdCBCYXNpY1VzZXJJbmZvOiBSZWFjdC5GQzx7XG4gICAgcm9vbTogUm9vbTtcbiAgICBtZW1iZXI6IFVzZXIgfCBSb29tTWVtYmVyO1xuICAgIGdyb3VwSWQ6IHN0cmluZztcbiAgICBkZXZpY2VzOiBJRGV2aWNlW107XG4gICAgaXNSb29tRW5jcnlwdGVkOiBib29sZWFuO1xufT4gPSAoe3Jvb20sIG1lbWJlciwgZ3JvdXBJZCwgZGV2aWNlcywgaXNSb29tRW5jcnlwdGVkfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBwb3dlckxldmVscyA9IHVzZVJvb21Qb3dlckxldmVscyhjbGksIHJvb20pO1xuICAgIC8vIExvYWQgd2hldGhlciBvciBub3Qgd2UgYXJlIGEgU3luYXBzZSBBZG1pblxuICAgIGNvbnN0IGlzU3luYXBzZUFkbWluID0gdXNlSXNTeW5hcHNlQWRtaW4oY2xpKTtcblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHVzZXIgaXMgaWdub3JlZFxuICAgIGNvbnN0IFtpc0lnbm9yZWQsIHNldElzSWdub3JlZF0gPSB1c2VTdGF0ZShjbGkuaXNVc2VySWdub3JlZChtZW1iZXIudXNlcklkKSk7XG4gICAgLy8gUmVjaGVjayBpZiB0aGUgdXNlciBvciBjbGllbnQgY2hhbmdlc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHNldElzSWdub3JlZChjbGkuaXNVc2VySWdub3JlZChtZW1iZXIudXNlcklkKSk7XG4gICAgfSwgW2NsaSwgbWVtYmVyLnVzZXJJZF0pO1xuICAgIC8vIFJlY2hlY2sgYWxzbyBpZiB3ZSByZWNlaXZlIG5ldyBhY2NvdW50RGF0YSBtLmlnbm9yZWRfdXNlcl9saXN0XG4gICAgY29uc3QgYWNjb3VudERhdGFIYW5kbGVyID0gdXNlQ2FsbGJhY2soKGV2KSA9PiB7XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IFwibS5pZ25vcmVkX3VzZXJfbGlzdFwiKSB7XG4gICAgICAgICAgICBzZXRJc0lnbm9yZWQoY2xpLmlzVXNlcklnbm9yZWQobWVtYmVyLnVzZXJJZCkpO1xuICAgICAgICB9XG4gICAgfSwgW2NsaSwgbWVtYmVyLnVzZXJJZF0pO1xuICAgIHVzZUV2ZW50RW1pdHRlcihjbGksIFwiYWNjb3VudERhdGFcIiwgYWNjb3VudERhdGFIYW5kbGVyKTtcblxuICAgIC8vIENvdW50IG9mIGhvdyBtYW55IG9wZXJhdGlvbnMgYXJlIGN1cnJlbnRseSBpbiBwcm9ncmVzcywgaWYgPiAwIHRoZW4gc2hvdyBhIFNwaW5uZXJcbiAgICBjb25zdCBbcGVuZGluZ1VwZGF0ZUNvdW50LCBzZXRQZW5kaW5nVXBkYXRlQ291bnRdID0gdXNlU3RhdGUoMCk7XG4gICAgY29uc3Qgc3RhcnRVcGRhdGluZyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0UGVuZGluZ1VwZGF0ZUNvdW50KHBlbmRpbmdVcGRhdGVDb3VudCArIDEpO1xuICAgIH0sIFtwZW5kaW5nVXBkYXRlQ291bnRdKTtcbiAgICBjb25zdCBzdG9wVXBkYXRpbmcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFBlbmRpbmdVcGRhdGVDb3VudChwZW5kaW5nVXBkYXRlQ291bnQgLSAxKTtcbiAgICB9LCBbcGVuZGluZ1VwZGF0ZUNvdW50XSk7XG5cbiAgICBjb25zdCByb29tUGVybWlzc2lvbnMgPSB1c2VSb29tUGVybWlzc2lvbnMoY2xpLCByb29tLCBtZW1iZXIpO1xuXG4gICAgY29uc3Qgb25TeW5hcHNlRGVhY3RpdmF0ZSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1N5bmFwc2UgVXNlciBEZWFjdGl2YXRpb24nLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIkRlYWN0aXZhdGUgdXNlcj9cIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICA8ZGl2PnsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiRGVhY3RpdmF0aW5nIHRoaXMgdXNlciB3aWxsIGxvZyB0aGVtIG91dCBhbmQgcHJldmVudCB0aGVtIGZyb20gbG9nZ2luZyBiYWNrIGluLiBBZGRpdGlvbmFsbHksIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGV5IHdpbGwgbGVhdmUgYWxsIHRoZSByb29tcyB0aGV5IGFyZSBpbi4gVGhpcyBhY3Rpb24gY2Fubm90IGJlIHJldmVyc2VkLiBBcmUgeW91IHN1cmUgeW91IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ3YW50IHRvIGRlYWN0aXZhdGUgdGhpcyB1c2VyP1wiLFxuICAgICAgICAgICAgICAgICkgfTwvZGl2PixcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJEZWFjdGl2YXRlIHVzZXJcIiksXG4gICAgICAgICAgICBkYW5nZXI6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IFthY2NlcHRlZF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgaWYgKCFhY2NlcHRlZCkgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgY2xpLmRlYWN0aXZhdGVTeW5hcHNlVXNlcihtZW1iZXIudXNlcklkKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlYWN0aXZhdGUgdXNlclwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcblxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIGRlYWN0aXZhdGUgU3luYXBzZSB1c2VyJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdGYWlsZWQgdG8gZGVhY3RpdmF0ZSB1c2VyJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2NsaSwgbWVtYmVyLnVzZXJJZF0pO1xuXG4gICAgbGV0IHN5bmFwc2VEZWFjdGl2YXRlQnV0dG9uO1xuICAgIGxldCBzcGlubmVyO1xuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCBhIHBlcmZlY3QgY2hlY2sgaGVyZSwganVzdCBzb21ldGhpbmcgdG8gcGFzcyBhcyBcInByb2JhYmx5IG5vdCBvdXIgaG9tZXNlcnZlclwiLiBJZlxuICAgIC8vIHNvbWVvbmUgZG9lcyBmaWd1cmUgb3V0IGhvdyB0byBieXBhc3MgdGhpcyBjaGVjayB0aGUgd29yc3QgdGhhdCBoYXBwZW5zIGlzIGFuIGVycm9yLlxuICAgIC8vIEZJWE1FIHRoaXMgc2hvdWxkIGJlIHVzaW5nIGNsaSBpbnN0ZWFkIG9mIE1hdHJpeENsaWVudFBlZy5tYXRyaXhDbGllbnRcbiAgICBpZiAoaXNTeW5hcHNlQWRtaW4gJiYgbWVtYmVyLnVzZXJJZC5lbmRzV2l0aChgOiR7TWF0cml4Q2xpZW50UGVnLmdldEhvbWVzZXJ2ZXJOYW1lKCl9YCkpIHtcbiAgICAgICAgc3luYXBzZURlYWN0aXZhdGVCdXR0b24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXtvblN5bmFwc2VEZWFjdGl2YXRlfSBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZCBteF9Vc2VySW5mb19kZXN0cnVjdGl2ZVwiPlxuICAgICAgICAgICAgICAgIHtfdChcIkRlYWN0aXZhdGUgdXNlclwiKX1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgYWRtaW5Ub29sc0NvbnRhaW5lcjtcbiAgICBpZiAocm9vbSAmJiBtZW1iZXIucm9vbUlkKSB7XG4gICAgICAgIGFkbWluVG9vbHNDb250YWluZXIgPSAoXG4gICAgICAgICAgICA8Um9vbUFkbWluVG9vbHNDb250YWluZXJcbiAgICAgICAgICAgICAgICBwb3dlckxldmVscz17cG93ZXJMZXZlbHN9XG4gICAgICAgICAgICAgICAgbWVtYmVyPXttZW1iZXJ9XG4gICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICBzdGFydFVwZGF0aW5nPXtzdGFydFVwZGF0aW5nfVxuICAgICAgICAgICAgICAgIHN0b3BVcGRhdGluZz17c3RvcFVwZGF0aW5nfT5cbiAgICAgICAgICAgICAgICB7IHN5bmFwc2VEZWFjdGl2YXRlQnV0dG9uIH1cbiAgICAgICAgICAgIDwvUm9vbUFkbWluVG9vbHNDb250YWluZXI+XG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChncm91cElkKSB7XG4gICAgICAgIGFkbWluVG9vbHNDb250YWluZXIgPSAoXG4gICAgICAgICAgICA8R3JvdXBBZG1pblRvb2xzU2VjdGlvblxuICAgICAgICAgICAgICAgIGdyb3VwSWQ9e2dyb3VwSWR9XG4gICAgICAgICAgICAgICAgZ3JvdXBNZW1iZXI9e21lbWJlcn1cbiAgICAgICAgICAgICAgICBzdGFydFVwZGF0aW5nPXtzdGFydFVwZGF0aW5nfVxuICAgICAgICAgICAgICAgIHN0b3BVcGRhdGluZz17c3RvcFVwZGF0aW5nfT5cbiAgICAgICAgICAgICAgICB7IHN5bmFwc2VEZWFjdGl2YXRlQnV0dG9uIH1cbiAgICAgICAgICAgIDwvR3JvdXBBZG1pblRvb2xzU2VjdGlvbj5cbiAgICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHN5bmFwc2VEZWFjdGl2YXRlQnV0dG9uKSB7XG4gICAgICAgIGFkbWluVG9vbHNDb250YWluZXIgPSAoXG4gICAgICAgICAgICA8R2VuZXJpY0FkbWluVG9vbHNDb250YWluZXI+XG4gICAgICAgICAgICAgICAgeyBzeW5hcHNlRGVhY3RpdmF0ZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L0dlbmVyaWNBZG1pblRvb2xzQ29udGFpbmVyPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGlmIChwZW5kaW5nVXBkYXRlQ291bnQgPiAwKSB7XG4gICAgICAgIHNwaW5uZXIgPSA8U3Bpbm5lciBpbWdDbGFzc05hbWU9XCJteF9Db250ZXh0dWFsTWVudV9zcGlubmVyXCIgLz47XG4gICAgfVxuXG4gICAgbGV0IG1lbWJlckRldGFpbHM7XG4gICAgLy8gaGlkZSB0aGUgUm9sZXMgc2VjdGlvbiBmb3IgRE1zIGFzIGl0IGRvZXNuJ3QgbWFrZSBzZW5zZSB0aGVyZVxuICAgIGlmIChyb29tICYmIG1lbWJlci5yb29tSWQgJiYgIURNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQobWVtYmVyLnJvb21JZCkpIHtcbiAgICAgICAgbWVtYmVyRGV0YWlscyA9IDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8aDM+eyBfdChcIlJvbGVcIikgfTwvaDM+XG4gICAgICAgICAgICA8UG93ZXJMZXZlbFNlY3Rpb25cbiAgICAgICAgICAgICAgICBwb3dlckxldmVscz17cG93ZXJMZXZlbHN9XG4gICAgICAgICAgICAgICAgdXNlcj17bWVtYmVyfVxuICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgcm9vbVBlcm1pc3Npb25zPXtyb29tUGVybWlzc2lvbnN9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgLy8gb25seSBkaXNwbGF5IHRoZSBkZXZpY2VzIGxpc3QgaWYgb3VyIGNsaWVudCBzdXBwb3J0cyBFMkVcbiAgICBjb25zdCBjcnlwdG9FbmFibGVkID0gY2xpLmlzQ3J5cHRvRW5hYmxlZCgpO1xuXG4gICAgbGV0IHRleHQ7XG4gICAgaWYgKCFpc1Jvb21FbmNyeXB0ZWQpIHtcbiAgICAgICAgaWYgKCFjcnlwdG9FbmFibGVkKSB7XG4gICAgICAgICAgICB0ZXh0ID0gX3QoXCJUaGlzIGNsaWVudCBkb2VzIG5vdCBzdXBwb3J0IGVuZC10by1lbmQgZW5jcnlwdGlvbi5cIik7XG4gICAgICAgIH0gZWxzZSBpZiAocm9vbSAmJiAhcm9vbS5pc1NwYWNlUm9vbSgpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gX3QoXCJNZXNzYWdlcyBpbiB0aGlzIHJvb20gYXJlIG5vdCBlbmQtdG8tZW5kIGVuY3J5cHRlZC5cIik7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyb29tLmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgdGV4dCA9IF90KFwiTWVzc2FnZXMgaW4gdGhpcyByb29tIGFyZSBlbmQtdG8tZW5kIGVuY3J5cHRlZC5cIik7XG4gICAgfVxuXG4gICAgbGV0IHZlcmlmeUJ1dHRvbjtcbiAgICBjb25zdCBob21lc2VydmVyU3VwcG9ydHNDcm9zc1NpZ25pbmcgPSB1c2VIb21lc2VydmVyU3VwcG9ydHNDcm9zc1NpZ25pbmcoY2xpKTtcblxuICAgIGNvbnN0IHVzZXJUcnVzdCA9IGNyeXB0b0VuYWJsZWQgJiYgY2xpLmNoZWNrVXNlclRydXN0KG1lbWJlci51c2VySWQpO1xuICAgIGNvbnN0IHVzZXJWZXJpZmllZCA9IGNyeXB0b0VuYWJsZWQgJiYgdXNlclRydXN0LmlzQ3Jvc3NTaWduaW5nVmVyaWZpZWQoKTtcbiAgICBjb25zdCBpc01lID0gbWVtYmVyLnVzZXJJZCA9PT0gY2xpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IGNhblZlcmlmeSA9IGNyeXB0b0VuYWJsZWQgJiYgaG9tZXNlcnZlclN1cHBvcnRzQ3Jvc3NTaWduaW5nICYmICF1c2VyVmVyaWZpZWQgJiYgIWlzTWUgJiZcbiAgICAgICAgZGV2aWNlcyAmJiBkZXZpY2VzLmxlbmd0aCA+IDA7XG5cbiAgICBjb25zdCBzZXRVcGRhdGluZyA9ICh1cGRhdGluZykgPT4ge1xuICAgICAgICBzZXRQZW5kaW5nVXBkYXRlQ291bnQoY291bnQgPT4gY291bnQgKyAodXBkYXRpbmcgPyAxIDogLTEpKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhc0Nyb3NzU2lnbmluZ0tleXMgPVxuICAgICAgICB1c2VIYXNDcm9zc1NpZ25pbmdLZXlzKGNsaSwgbWVtYmVyLCBjYW5WZXJpZnksIHNldFVwZGF0aW5nICk7XG5cbiAgICBjb25zdCBzaG93RGV2aWNlTGlzdFNwaW5uZXIgPSBkZXZpY2VzID09PSB1bmRlZmluZWQ7XG4gICAgaWYgKGNhblZlcmlmeSkge1xuICAgICAgICBpZiAoaGFzQ3Jvc3NTaWduaW5nS2V5cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBOb3RlOiBteF9Vc2VySW5mb192ZXJpZnlCdXR0b24gaXMgZm9yIHRoZSBlbmQtdG8tZW5kIHRlc3RzXG4gICAgICAgICAgICB2ZXJpZnlCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZmllbGQgbXhfVXNlckluZm9fdmVyaWZ5QnV0dG9uXCIgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQ3Jvc3NTaWduaW5nS2V5cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZ5VXNlcihtZW1iZXIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVnYWN5VmVyaWZ5VXNlcihtZW1iZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlZlcmlmeVwiKX1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKCFzaG93RGV2aWNlTGlzdFNwaW5uZXIpIHtcbiAgICAgICAgICAgIC8vIEhBQ0s6IG9ubHkgc2hvdyBhIHNwaW5uZXIgaWYgdGhlIGRldmljZSBzZWN0aW9uIHNwaW5uZXIgaXMgbm90IHNob3duLFxuICAgICAgICAgICAgLy8gdG8gYXZvaWQgc2hvd2luZyBhIGRvdWJsZSBzcGlubmVyXG4gICAgICAgICAgICAvLyBXZSBzaG91bGQgYXNrIGZvciBhIGRlc2lnbiB0aGF0IGluY2x1ZGVzIGFsbCB0aGUgZGlmZmVyZW50IGxvYWRpbmcgc3RhdGVzIGhlcmVcbiAgICAgICAgICAgIHZlcmlmeUJ1dHRvbiA9IDxTcGlubmVyIC8+O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGVkaXREZXZpY2VzO1xuICAgIGlmIChtZW1iZXIudXNlcklkID09IGNsaS5nZXRVc2VySWQoKSkge1xuICAgICAgICBlZGl0RGV2aWNlcyA9ICg8cD5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2ZpZWxkXCIgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxUYWJJZDogVVNFUl9TRUNVUklUWV9UQUIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICB7IF90KFwiRWRpdCBkZXZpY2VzXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPC9wPilcbiAgICB9XG5cbiAgICBjb25zdCBzZWN1cml0eVNlY3Rpb24gPSAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8aDM+eyBfdChcIlNlY3VyaXR5XCIpIH08L2gzPlxuICAgICAgICAgICAgPHA+eyB0ZXh0IH08L3A+XG4gICAgICAgICAgICB7IHZlcmlmeUJ1dHRvbiB9XG4gICAgICAgICAgICB7IGNyeXB0b0VuYWJsZWQgJiYgPERldmljZXNTZWN0aW9uXG4gICAgICAgICAgICAgICAgbG9hZGluZz17c2hvd0RldmljZUxpc3RTcGlubmVyfVxuICAgICAgICAgICAgICAgIGRldmljZXM9e2RldmljZXN9XG4gICAgICAgICAgICAgICAgdXNlcklkPXttZW1iZXIudXNlcklkfSAvPiB9XG4gICAgICAgICAgICB7IGVkaXREZXZpY2VzIH1cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcblxuICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIHsgbWVtYmVyRGV0YWlscyB9XG5cbiAgICAgICAgeyBzZWN1cml0eVNlY3Rpb24gfVxuICAgICAgICA8VXNlck9wdGlvbnNTZWN0aW9uXG4gICAgICAgICAgICBjYW5JbnZpdGU9e3Jvb21QZXJtaXNzaW9ucy5jYW5JbnZpdGV9XG4gICAgICAgICAgICBpc0lnbm9yZWQ9e2lzSWdub3JlZH1cbiAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyfVxuICAgICAgICAgICAgaXNTcGFjZT17cm9vbT8uaXNTcGFjZVJvb20oKX1cbiAgICAgICAgLz5cblxuICAgICAgICB7IGFkbWluVG9vbHNDb250YWluZXIgfVxuXG4gICAgICAgIHsgc3Bpbm5lciB9XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG59O1xuXG50eXBlIE1lbWJlciA9IFVzZXIgfCBSb29tTWVtYmVyIHwgR3JvdXBNZW1iZXI7XG5cbmNvbnN0IFVzZXJJbmZvSGVhZGVyOiBSZWFjdC5GQzx7XG4gICAgbWVtYmVyOiBNZW1iZXI7XG4gICAgZTJlU3RhdHVzOiBFMkVTdGF0dXM7XG59PiA9ICh7bWVtYmVyLCBlMmVTdGF0dXN9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IG9uTWVtYmVyQXZhdGFyQ2xpY2sgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGF2YXRhclVybCA9IG1lbWJlci5nZXRNeGNBdmF0YXJVcmwgPyBtZW1iZXIuZ2V0TXhjQXZhdGFyVXJsKCkgOiBtZW1iZXIuYXZhdGFyVXJsO1xuICAgICAgICBpZiAoIWF2YXRhclVybCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGh0dHBVcmwgPSBtZWRpYUZyb21NeGMoYXZhdGFyVXJsKS5zcmNIdHRwO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBzcmM6IGh0dHBVcmwsXG4gICAgICAgICAgICBuYW1lOiBtZW1iZXIubmFtZSxcbiAgICAgICAgfTtcblxuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW1hZ2VWaWV3LCBwYXJhbXMsIFwibXhfRGlhbG9nX2xpZ2h0Ym94XCIsIG51bGwsIHRydWUpO1xuICAgIH0sIFttZW1iZXJdKTtcblxuICAgIGNvbnN0IGF2YXRhckVsZW1lbnQgPSAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fYXZhdGFyXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxNZW1iZXJBdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17bWVtYmVyLnVzZXJJZH0gLy8gdG8gaW5zdGFudGx5IGJsYW5rIHRoZSBhdmF0YXIgd2hlbiBVc2VySW5mbyBjaGFuZ2VzIG1lbWJlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezIgKiAwLjMgKiB3aW5kb3cuaW5uZXJIZWlnaHR9IC8vIDJ4QDMwdmhcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD17MiAqIDAuMyAqIHdpbmRvdy5pbm5lckhlaWdodH0gLy8gMnhAMzB2aFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzaXplTWV0aG9kPVwic2NhbGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGJhY2tVc2VySWQ9e21lbWJlci51c2VySWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbk1lbWJlckF2YXRhckNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgdXJscz17bWVtYmVyLmF2YXRhclVybCA/IFttZW1iZXIuYXZhdGFyVXJsXSA6IHVuZGVmaW5lZH0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgbGV0IHByZXNlbmNlU3RhdGU7XG4gICAgbGV0IHByZXNlbmNlTGFzdEFjdGl2ZUFnbztcbiAgICBsZXQgcHJlc2VuY2VDdXJyZW50bHlBY3RpdmU7XG4gICAgbGV0IHN0YXR1c01lc3NhZ2U7XG5cbiAgICBpZiAobWVtYmVyIGluc3RhbmNlb2YgUm9vbU1lbWJlciAmJiBtZW1iZXIudXNlcikge1xuICAgICAgICBwcmVzZW5jZVN0YXRlID0gbWVtYmVyLnVzZXIucHJlc2VuY2U7XG4gICAgICAgIHByZXNlbmNlTGFzdEFjdGl2ZUFnbyA9IG1lbWJlci51c2VyLmxhc3RBY3RpdmVBZ287XG4gICAgICAgIHByZXNlbmNlQ3VycmVudGx5QWN0aXZlID0gbWVtYmVyLnVzZXIuY3VycmVudGx5QWN0aXZlO1xuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9jdXN0b21fc3RhdHVzXCIpKSB7XG4gICAgICAgICAgICBzdGF0dXNNZXNzYWdlID0gbWVtYmVyLnVzZXIuX3Vuc3RhYmxlX3N0YXR1c01lc3NhZ2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVQcmVzZW5jZUJ5SHNVcmwgPSBTZGtDb25maWcuZ2V0KClbXCJlbmFibGVfcHJlc2VuY2VfYnlfaHNfdXJsXCJdO1xuICAgIGxldCBzaG93UHJlc2VuY2UgPSB0cnVlO1xuICAgIGlmIChlbmFibGVQcmVzZW5jZUJ5SHNVcmwgJiYgZW5hYmxlUHJlc2VuY2VCeUhzVXJsW2NsaS5iYXNlVXJsXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNob3dQcmVzZW5jZSA9IGVuYWJsZVByZXNlbmNlQnlIc1VybFtjbGkuYmFzZVVybF07XG4gICAgfVxuXG4gICAgbGV0IHByZXNlbmNlTGFiZWwgPSBudWxsO1xuICAgIGlmIChzaG93UHJlc2VuY2UpIHtcbiAgICAgICAgcHJlc2VuY2VMYWJlbCA9IChcbiAgICAgICAgICAgIDxQcmVzZW5jZUxhYmVsXG4gICAgICAgICAgICAgICAgYWN0aXZlQWdvPXtwcmVzZW5jZUxhc3RBY3RpdmVBZ299XG4gICAgICAgICAgICAgICAgY3VycmVudGx5QWN0aXZlPXtwcmVzZW5jZUN1cnJlbnRseUFjdGl2ZX1cbiAgICAgICAgICAgICAgICBwcmVzZW5jZVN0YXRlPXtwcmVzZW5jZVN0YXRlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgc3RhdHVzTGFiZWwgPSBudWxsO1xuICAgIGlmIChzdGF0dXNNZXNzYWdlKSB7XG4gICAgICAgIHN0YXR1c0xhYmVsID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlckluZm9fc3RhdHVzTWVzc2FnZVwiPnsgc3RhdHVzTWVzc2FnZSB9PC9zcGFuPjtcbiAgICB9XG5cbiAgICBsZXQgZTJlSWNvbjtcbiAgICBpZiAoZTJlU3RhdHVzKSB7XG4gICAgICAgIGUyZUljb24gPSA8RTJFSWNvbiBzaXplPXsxOH0gc3RhdHVzPXtlMmVTdGF0dXN9IGlzVXNlcj17dHJ1ZX0gLz47XG4gICAgfVxuXG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSBtZW1iZXIucmF3RGlzcGxheU5hbWUgfHwgbWVtYmVyLmRpc3BsYXluYW1lO1xuICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIHsgYXZhdGFyRWxlbWVudCB9XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXIgbXhfVXNlckluZm9fc2VwYXJhdG9yXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3Byb2ZpbGVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGUyZUljb24gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9e2Rpc3BsYXlOYW1lfSBhcmlhLWxhYmVsPXtkaXNwbGF5TmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBkaXNwbGF5TmFtZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57IG1lbWJlci51c2VySWQgfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fcHJvZmlsZVN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICB7cHJlc2VuY2VMYWJlbH1cbiAgICAgICAgICAgICAgICAgICAge3N0YXR1c0xhYmVsfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xufTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdXNlcjogTWVtYmVyO1xuICAgIGdyb3VwSWQ/OiBzdHJpbmc7XG4gICAgcm9vbT86IFJvb207XG4gICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm8gfCBSaWdodFBhbmVsUGhhc2VzLkdyb3VwTWVtYmVySW5mbyB8IFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2VNZW1iZXJJbmZvO1xuICAgIG9uQ2xvc2UoKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElQcm9wc1dpdGhFbmNyeXB0aW9uUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgRW5jcnlwdGlvblBhbmVsPiB7XG4gICAgdXNlcjogTWVtYmVyO1xuICAgIGdyb3VwSWQ6IHZvaWQ7XG4gICAgcm9vbTogUm9vbTtcbiAgICBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWw7XG4gICAgb25DbG9zZSgpOiB2b2lkO1xufVxuXG50eXBlIFByb3BzID0gSVByb3BzIHwgSVByb3BzV2l0aEVuY3J5cHRpb25QYW5lbDtcblxuY29uc3QgVXNlckluZm86IFJlYWN0LkZDPFByb3BzPiA9ICh7XG4gICAgdXNlcixcbiAgICBncm91cElkLFxuICAgIHJvb20sXG4gICAgb25DbG9zZSxcbiAgICBwaGFzZSA9IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm8sXG4gICAgLi4ucHJvcHNcbn0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgLy8gZmV0Y2ggbGF0ZXN0IHJvb20gbWVtYmVyIGlmIHdlIGhhdmUgYSByb29tLCBzbyB3ZSBkb24ndCBzaG93IGhpc3RvcmljYWwgaW5mb3JtYXRpb24sIGZhbGxpbmcgYmFjayB0byB1c2VyXG4gICAgY29uc3QgbWVtYmVyID0gdXNlTWVtbygoKSA9PiByb29tID8gKHJvb20uZ2V0TWVtYmVyKHVzZXIudXNlcklkKSB8fCB1c2VyKSA6IHVzZXIsIFtyb29tLCB1c2VyXSk7XG5cbiAgICBjb25zdCBpc1Jvb21FbmNyeXB0ZWQgPSB1c2VJc0VuY3J5cHRlZChjbGksIHJvb20pO1xuICAgIGNvbnN0IGRldmljZXMgPSB1c2VEZXZpY2VzKHVzZXIudXNlcklkKTtcblxuICAgIGxldCBlMmVTdGF0dXM7XG4gICAgaWYgKGlzUm9vbUVuY3J5cHRlZCAmJiBkZXZpY2VzKSB7XG4gICAgICAgIGUyZVN0YXR1cyA9IGdldEUyRVN0YXR1cyhjbGksIHVzZXIudXNlcklkLCBkZXZpY2VzKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc2VzID0gW1wibXhfVXNlckluZm9cIl07XG5cbiAgICBsZXQgcmVmaXJlUGFyYW1zO1xuICAgIGxldCBwcmV2aW91c1BoYXNlOiBSaWdodFBhbmVsUGhhc2VzO1xuICAgIC8vIFdlIGhhdmUgbm8gcHJldmlvdXNQaGFzZSBmb3Igd2hlbiB2aWV3aW5nIGEgVXNlckluZm8gZnJvbSBhIEdyb3VwIG9yIHdpdGhvdXQgYSBSb29tIGF0IHRoaXMgdGltZVxuICAgIGlmIChyb29tICYmIHBoYXNlID09PSBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbCkge1xuICAgICAgICBwcmV2aW91c1BoYXNlID0gUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVySW5mbztcbiAgICAgICAgcmVmaXJlUGFyYW1zID0ge21lbWJlcjogbWVtYmVyfTtcbiAgICB9IGVsc2UgaWYgKHJvb20pIHtcbiAgICAgICAgcHJldmlvdXNQaGFzZSA9IHByZXZpb3VzUGhhc2UgPSByb29tLmlzU3BhY2VSb29tKClcbiAgICAgICAgICAgID8gUmlnaHRQYW5lbFBoYXNlcy5TcGFjZU1lbWJlckxpc3RcbiAgICAgICAgICAgIDogUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVyTGlzdDtcbiAgICB9XG5cbiAgICBjb25zdCBvbkVuY3J5cHRpb25QYW5lbENsb3NlID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2g8U2V0UmlnaHRQYW5lbFBoYXNlUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uU2V0UmlnaHRQYW5lbFBoYXNlLFxuICAgICAgICAgICAgcGhhc2U6IHByZXZpb3VzUGhhc2UsXG4gICAgICAgICAgICByZWZpcmVQYXJhbXM6IHJlZmlyZVBhcmFtcyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbGV0IGNvbnRlbnQ7XG4gICAgc3dpdGNoIChwaGFzZSkge1xuICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm86XG4gICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Hcm91cE1lbWJlckluZm86XG4gICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5TcGFjZU1lbWJlckluZm86XG4gICAgICAgICAgICBjb250ZW50ID0gKFxuICAgICAgICAgICAgICAgIDxCYXNpY1VzZXJJbmZvXG4gICAgICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyfVxuICAgICAgICAgICAgICAgICAgICBncm91cElkPXtncm91cElkIGFzIHN0cmluZ31cbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlcz17ZGV2aWNlc31cbiAgICAgICAgICAgICAgICAgICAgaXNSb29tRW5jcnlwdGVkPXtpc1Jvb21FbmNyeXB0ZWR9IC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWw6XG4gICAgICAgICAgICBjbGFzc2VzLnB1c2goXCJteF9Vc2VySW5mb19zbWFsbEF2YXRhclwiKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgICAgICAgICAgPEVuY3J5cHRpb25QYW5lbFxuICAgICAgICAgICAgICAgICAgICB7Li4ucHJvcHMgYXMgUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEVuY3J5cHRpb25QYW5lbD59XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyfVxuICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXtvbkVuY3J5cHRpb25QYW5lbENsb3NlfVxuICAgICAgICAgICAgICAgICAgICBpc1Jvb21FbmNyeXB0ZWQ9e2lzUm9vbUVuY3J5cHRlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBjbG9zZUxhYmVsID0gdW5kZWZpbmVkO1xuICAgIGlmIChwaGFzZSA9PT0gUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWwpIHtcbiAgICAgICAgY29uc3QgdmVyaWZpY2F0aW9uUmVxdWVzdCA9IChwcm9wcyBhcyBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgRW5jcnlwdGlvblBhbmVsPikudmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICAgICAgaWYgKHZlcmlmaWNhdGlvblJlcXVlc3QgJiYgdmVyaWZpY2F0aW9uUmVxdWVzdC5wZW5kaW5nKSB7XG4gICAgICAgICAgICBjbG9zZUxhYmVsID0gX3QoXCJDYW5jZWxcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgc2NvcGVIZWFkZXI7XG4gICAgaWYgKHJvb20/LmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgc2NvcGVIZWFkZXIgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1JpZ2h0UGFuZWxfc2NvcGVIZWFkZXJcIj5cbiAgICAgICAgICAgIDxSb29tQXZhdGFyIHJvb209e3Jvb219IGhlaWdodD17MzJ9IHdpZHRoPXszMn0gLz5cbiAgICAgICAgICAgIDxSb29tTmFtZSByb29tPXtyb29tfSAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICB7IHNjb3BlSGVhZGVyIH1cbiAgICAgICAgPFVzZXJJbmZvSGVhZGVyIG1lbWJlcj17bWVtYmVyfSBlMmVTdGF0dXM9e2UyZVN0YXR1c30gLz5cbiAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICByZXR1cm4gPEJhc2VDYXJkXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlcy5qb2luKFwiIFwiKX1cbiAgICAgICAgaGVhZGVyPXtoZWFkZXJ9XG4gICAgICAgIG9uQ2xvc2U9e29uQ2xvc2V9XG4gICAgICAgIGNsb3NlTGFiZWw9e2Nsb3NlTGFiZWx9XG4gICAgICAgIHByZXZpb3VzUGhhc2U9e3ByZXZpb3VzUGhhc2V9XG4gICAgICAgIHJlZmlyZVBhcmFtcz17cmVmaXJlUGFyYW1zfVxuICAgID5cbiAgICAgICAgeyBjb250ZW50IH1cbiAgICA8L0Jhc2VDYXJkPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFVzZXJJbmZvO1xuIl19
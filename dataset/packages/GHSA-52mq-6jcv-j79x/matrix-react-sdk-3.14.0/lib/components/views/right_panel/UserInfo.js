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
}>*/
= ({
  member,
  isIgnored,
  canInvite
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

    if (member.roomId) {
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

const warnSelfDemote = async () => {
  const {
    finished
  } = _Modal.default.createTrackedDialog('Demoting Self', '', _QuestionDialog.default, {
    title: (0, _languageHandler._t)("Demote yourself?"),
    description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("You will not be able to undo this change as you are demoting yourself, " + "if you are the last privileged user in the room it will be impossible " + "to regain privileges.")),
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
  const update = (0, _react.useCallback)(() => {
    if (!room) {
      return;
    }

    const event = room.currentState.getStateEvents("m.room.power_levels", "");

    if (event) {
      setPowerLevels(event.getContent());
    } else {
      setPowerLevels({});
    }

    return () => {
      setPowerLevels({});
    };
  }, [room]);
  (0, _useEventEmitter.useEventEmitter)(cli, "RoomState.members", update);
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
        if (!(await warnSelfDemote())) return;
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

  if (me.powerLevel >= redactPowerLevel) {
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
        if (!(await warnSelfDemote())) return;
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
    } else if (room) {
      text = (0, _languageHandler._t)("Messages in this room are not end-to-end encrypted.");
    } else {// TODO what to render for GroupMember
    }
  } else {
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

  const securitySection = /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Security")), /*#__PURE__*/_react.default.createElement("p", null, text), verifyButton, cryptoEnabled && /*#__PURE__*/_react.default.createElement(DevicesSection, {
    loading: showDeviceListSpinner,
    devices: devices,
    userId: member.userId
  }));

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, memberDetails, securitySection, /*#__PURE__*/_react.default.createElement(UserOptionsSection, {
    canInvite: roomPermissions.canInvite,
    isIgnored: isIgnored,
    member: member
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
    const httpUrl = cli.mxcUrlToHttp(avatarUrl);
    const params = {
      src: httpUrl,
      name: member.name
    };

    _Modal.default.createDialog(_ImageView.default, params, "mx_Dialog_lightbox");
  }, [cli, member]);

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

  const displayName = member.name || member.displayname;
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
    previousPhase = _RightPanelStorePhases.RightPanelPhases.RoomMemberList;
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

  const header = /*#__PURE__*/_react.default.createElement(UserInfoHeader, {
    member: member,
    e2eStatus: e2eStatus
  });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3JpZ2h0X3BhbmVsL1VzZXJJbmZvLnRzeCJdLCJuYW1lcyI6WyJkaXNhbWJpZ3VhdGVEZXZpY2VzIiwiZGV2aWNlcyIsIm5hbWVzIiwiT2JqZWN0IiwiY3JlYXRlIiwiaSIsImxlbmd0aCIsIm5hbWUiLCJnZXREaXNwbGF5TmFtZSIsImluZGV4TGlzdCIsInB1c2giLCJmb3JFYWNoIiwiaiIsImFtYmlndW91cyIsImdldEUyRVN0YXR1cyIsImNsaSIsInVzZXJJZCIsImlzTWUiLCJnZXRVc2VySWQiLCJ1c2VyVHJ1c3QiLCJjaGVja1VzZXJUcnVzdCIsImlzQ3Jvc3NTaWduaW5nVmVyaWZpZWQiLCJ3YXNDcm9zc1NpZ25pbmdWZXJpZmllZCIsIkUyRVN0YXR1cyIsIldhcm5pbmciLCJOb3JtYWwiLCJhbnlEZXZpY2VVbnZlcmlmaWVkIiwic29tZSIsImRldmljZSIsImRldmljZUlkIiwiZGV2aWNlVHJ1c3QiLCJjaGVja0RldmljZVRydXN0IiwiaXNWZXJpZmllZCIsIlZlcmlmaWVkIiwib3BlbkRNRm9yVXNlciIsIm1hdHJpeENsaWVudCIsImxhc3RBY3RpdmVSb29tIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJyb29tX2lkIiwicm9vbUlkIiwiY3JlYXRlUm9vbU9wdGlvbnMiLCJkbVVzZXJJZCIsImVuY3J5cHRpb24iLCJ1bmRlZmluZWQiLCJ1c2Vyc1RvRGV2aWNlc01hcCIsImRvd25sb2FkS2V5cyIsImFsbEhhdmVEZXZpY2VLZXlzIiwidmFsdWVzIiwiZXZlcnkiLCJrZXlzIiwidXNlSGFzQ3Jvc3NTaWduaW5nS2V5cyIsIm1lbWJlciIsImNhblZlcmlmeSIsInNldFVwZGF0aW5nIiwieHNpIiwiZ2V0U3RvcmVkQ3Jvc3NTaWduaW5nRm9yVXNlciIsImtleSIsImdldElkIiwiRGV2aWNlSXRlbSIsIk1hdHJpeENsaWVudENvbnRleHQiLCJjbGFzc2VzIiwibXhfVXNlckluZm9fZGV2aWNlX3ZlcmlmaWVkIiwibXhfVXNlckluZm9fZGV2aWNlX3VudmVyaWZpZWQiLCJpY29uQ2xhc3NlcyIsIm14X0UyRUljb25fbm9ybWFsIiwibXhfRTJFSWNvbl92ZXJpZmllZCIsIm14X0UyRUljb25fd2FybmluZyIsIm9uRGV2aWNlQ2xpY2siLCJnZXRVc2VyIiwiZGV2aWNlTmFtZSIsInRydXN0ZWRMYWJlbCIsIkRldmljZXNTZWN0aW9uIiwibG9hZGluZyIsImlzRXhwYW5kZWQiLCJzZXRFeHBhbmRlZCIsImRldmljZVRydXN0cyIsIm1hcCIsImQiLCJleHBhbmRTZWN0aW9uRGV2aWNlcyIsInVudmVyaWZpZWREZXZpY2VzIiwiZXhwYW5kQ291bnRDYXB0aW9uIiwiZXhwYW5kSGlkZUNhcHRpb24iLCJleHBhbmRJY29uQ2xhc3NlcyIsImNvdW50IiwiZXhwYW5kQnV0dG9uIiwiZGV2aWNlTGlzdCIsImtleVN0YXJ0IiwiY29uY2F0IiwiVXNlck9wdGlvbnNTZWN0aW9uIiwiaXNJZ25vcmVkIiwiY2FuSW52aXRlIiwiaWdub3JlQnV0dG9uIiwiaW5zZXJ0UGlsbEJ1dHRvbiIsImludml0ZVVzZXJCdXR0b24iLCJyZWFkUmVjZWlwdEJ1dHRvbiIsIm9uU2hhcmVVc2VyQ2xpY2siLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJTaGFyZURpYWxvZyIsInRhcmdldCIsIm9uSWdub3JlVG9nZ2xlIiwiaWdub3JlZFVzZXJzIiwiZ2V0SWdub3JlZFVzZXJzIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwic2V0SWdub3JlZFVzZXJzIiwibXhfVXNlckluZm9fZGVzdHJ1Y3RpdmUiLCJvblJlYWRSZWNlaXB0QnV0dG9uIiwicm9vbSIsImdldFJvb20iLCJoaWdobGlnaHRlZCIsImV2ZW50X2lkIiwiZ2V0RXZlbnRSZWFkVXBUbyIsIm9uSW5zZXJ0UGlsbEJ1dHRvbiIsInVzZXJfaWQiLCJtZW1iZXJzaGlwIiwiUm9vbVZpZXdTdG9yZSIsImdldFJvb21JZCIsIm9uSW52aXRlVXNlckJ1dHRvbiIsImludml0ZXIiLCJNdWx0aUludml0ZXIiLCJpbnZpdGUiLCJ0aGVuIiwiZ2V0Q29tcGxldGlvblN0YXRlIiwiRXJyb3IiLCJnZXRFcnJvclRleHQiLCJlcnIiLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwic2hhcmVVc2VyQnV0dG9uIiwiZGlyZWN0TWVzc2FnZUJ1dHRvbiIsIndhcm5TZWxmRGVtb3RlIiwiZmluaXNoZWQiLCJRdWVzdGlvbkRpYWxvZyIsImJ1dHRvbiIsImNvbmZpcm1lZCIsIkdlbmVyaWNBZG1pblRvb2xzQ29udGFpbmVyIiwiY2hpbGRyZW4iLCJpc011dGVkIiwicG93ZXJMZXZlbENvbnRlbnQiLCJsZXZlbFRvU2VuZCIsImV2ZW50cyIsImV2ZW50c19kZWZhdWx0IiwicG93ZXJMZXZlbCIsInVzZVJvb21Qb3dlckxldmVscyIsInBvd2VyTGV2ZWxzIiwic2V0UG93ZXJMZXZlbHMiLCJ1cGRhdGUiLCJldmVudCIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiZ2V0Q29udGVudCIsIlJvb21LaWNrQnV0dG9uIiwic3RhcnRVcGRhdGluZyIsInN0b3BVcGRhdGluZyIsIm9uS2ljayIsIkNvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nIiwiYXNrUmVhc29uIiwiZGFuZ2VyIiwicHJvY2VlZCIsInJlYXNvbiIsImtpY2siLCJjb25zb2xlIiwibG9nIiwiZXJyb3IiLCJmaW5hbGx5Iiwia2lja0xhYmVsIiwiUmVkYWN0TWVzc2FnZXNCdXR0b24iLCJvblJlZGFjdEFsbE1lc3NhZ2VzIiwidGltZWxpbmUiLCJnZXRMaXZlVGltZWxpbmUiLCJldmVudHNUb1JlZGFjdCIsImdldEV2ZW50cyIsInJlZHVjZSIsImdldFNlbmRlciIsImlzUmVkYWN0ZWQiLCJpc1JlZGFjdGlvbiIsImdldFR5cGUiLCJFdmVudFR5cGUiLCJSb29tQ3JlYXRlIiwiUm9vbVNlcnZlckFjbCIsImdldE5laWdoYm91cmluZ1RpbWVsaW5lIiwiRXZlbnRUaW1lbGluZSIsIkJBQ0tXQVJEUyIsInVzZXIiLCJJbmZvRGlhbG9nIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbmZvIiwiYWxsIiwicmVkYWN0RXZlbnQiLCJCYW5Ub2dnbGVCdXR0b24iLCJvbkJhbk9yVW5iYW4iLCJwcm9taXNlIiwidW5iYW4iLCJiYW4iLCJsYWJlbCIsIk11dGVUb2dnbGVCdXR0b24iLCJtdXRlZCIsIm9uTXV0ZVRvZ2dsZSIsImUiLCJwb3dlckxldmVsRXZlbnQiLCJsZXZlbCIsInBhcnNlSW50IiwiaXNOYU4iLCJzZXRQb3dlckxldmVsIiwibXV0ZUxhYmVsIiwiUm9vbUFkbWluVG9vbHNDb250YWluZXIiLCJraWNrQnV0dG9uIiwiYmFuQnV0dG9uIiwibXV0ZUJ1dHRvbiIsInJlZGFjdEJ1dHRvbiIsImVkaXRQb3dlckxldmVsIiwic3RhdGVfZGVmYXVsdCIsImJhblBvd2VyTGV2ZWwiLCJraWNrUG93ZXJMZXZlbCIsInJlZGFjdCIsInJlZGFjdFBvd2VyTGV2ZWwiLCJtZSIsImdldE1lbWJlciIsImNhbkFmZmVjdFVzZXIiLCJHcm91cEFkbWluVG9vbHNTZWN0aW9uIiwiZ3JvdXBJZCIsImdyb3VwTWVtYmVyIiwiaXNQcml2aWxlZ2VkIiwic2V0SXNQcml2aWxlZ2VkIiwiaXNJbnZpdGVkIiwic2V0SXNJbnZpdGVkIiwidW5tb3VudGVkIiwib25Hcm91cFN0b3JlVXBkYXRlZCIsIkdyb3VwU3RvcmUiLCJpc1VzZXJQcml2aWxlZ2VkIiwiZ2V0R3JvdXBJbnZpdGVkTWVtYmVycyIsIm0iLCJyZWdpc3Rlckxpc3RlbmVyIiwidW5yZWdpc3Rlckxpc3RlbmVyIiwiY3JlYXRlRGlhbG9nIiwicmVtb3ZlVXNlckZyb21Hcm91cCIsIkFjdGlvbiIsIlZpZXdVc2VyIiwiY2F0Y2giLCJ1c2VJc1N5bmFwc2VBZG1pbiIsImlzQWRtaW4iLCJzZXRJc0FkbWluIiwiaXNTeW5hcHNlQWRtaW5pc3RyYXRvciIsInVzZUhvbWVzZXJ2ZXJTdXBwb3J0c0Nyb3NzU2lnbmluZyIsImRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlIiwidXNlUm9vbVBlcm1pc3Npb25zIiwicm9vbVBlcm1pc3Npb25zIiwic2V0Um9vbVBlcm1pc3Npb25zIiwibW9kaWZ5TGV2ZWxNYXgiLCJjYW5FZGl0IiwidXBkYXRlUm9vbVBlcm1pc3Npb25zIiwidGhlbSIsIlBvd2VyTGV2ZWxTZWN0aW9uIiwicG93ZXJMZXZlbFVzZXJzRGVmYXVsdCIsInVzZXJzX2RlZmF1bHQiLCJyb2xlIiwiUG93ZXJMZXZlbEVkaXRvciIsInNlbGVjdGVkUG93ZXJMZXZlbCIsInNldFNlbGVjdGVkUG93ZXJMZXZlbCIsIm9uUG93ZXJDaGFuZ2UiLCJwb3dlckxldmVsU3RyIiwiYXBwbHlQb3dlckNoYW5nZSIsIm15VXNlcklkIiwibXlQb3dlciIsInVzZXJzIiwidXNlRGV2aWNlcyIsInNldERldmljZXMiLCJjYW5jZWxsZWQiLCJkb3dubG9hZERldmljZUxpc3QiLCJnZXRTdG9yZWREZXZpY2VzRm9yVXNlciIsImNhbmNlbCIsInVwZGF0ZURldmljZXMiLCJuZXdEZXZpY2VzIiwib25EZXZpY2VzVXBkYXRlZCIsImluY2x1ZGVzIiwib25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkIiwiX3VzZXJJZCIsIm9uVXNlclRydXN0U3RhdHVzQ2hhbmdlZCIsInRydXN0U3RhdHVzIiwib24iLCJyZW1vdmVMaXN0ZW5lciIsIkJhc2ljVXNlckluZm8iLCJpc1Jvb21FbmNyeXB0ZWQiLCJpc1N5bmFwc2VBZG1pbiIsInNldElzSWdub3JlZCIsImlzVXNlcklnbm9yZWQiLCJhY2NvdW50RGF0YUhhbmRsZXIiLCJldiIsInBlbmRpbmdVcGRhdGVDb3VudCIsInNldFBlbmRpbmdVcGRhdGVDb3VudCIsIm9uU3luYXBzZURlYWN0aXZhdGUiLCJhY2NlcHRlZCIsImRlYWN0aXZhdGVTeW5hcHNlVXNlciIsInN5bmFwc2VEZWFjdGl2YXRlQnV0dG9uIiwic3Bpbm5lciIsImVuZHNXaXRoIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJhZG1pblRvb2xzQ29udGFpbmVyIiwibWVtYmVyRGV0YWlscyIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsImNyeXB0b0VuYWJsZWQiLCJpc0NyeXB0b0VuYWJsZWQiLCJ0ZXh0IiwidmVyaWZ5QnV0dG9uIiwiaG9tZXNlcnZlclN1cHBvcnRzQ3Jvc3NTaWduaW5nIiwidXNlclZlcmlmaWVkIiwidXBkYXRpbmciLCJoYXNDcm9zc1NpZ25pbmdLZXlzIiwic2hvd0RldmljZUxpc3RTcGlubmVyIiwic2VjdXJpdHlTZWN0aW9uIiwiVXNlckluZm9IZWFkZXIiLCJlMmVTdGF0dXMiLCJvbk1lbWJlckF2YXRhckNsaWNrIiwiYXZhdGFyVXJsIiwiZ2V0TXhjQXZhdGFyVXJsIiwiaHR0cFVybCIsIm14Y1VybFRvSHR0cCIsInBhcmFtcyIsInNyYyIsIkltYWdlVmlldyIsImF2YXRhckVsZW1lbnQiLCJ3aW5kb3ciLCJpbm5lckhlaWdodCIsInByZXNlbmNlU3RhdGUiLCJwcmVzZW5jZUxhc3RBY3RpdmVBZ28iLCJwcmVzZW5jZUN1cnJlbnRseUFjdGl2ZSIsInN0YXR1c01lc3NhZ2UiLCJSb29tTWVtYmVyIiwicHJlc2VuY2UiLCJsYXN0QWN0aXZlQWdvIiwiY3VycmVudGx5QWN0aXZlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiX3Vuc3RhYmxlX3N0YXR1c01lc3NhZ2UiLCJlbmFibGVQcmVzZW5jZUJ5SHNVcmwiLCJTZGtDb25maWciLCJnZXQiLCJzaG93UHJlc2VuY2UiLCJiYXNlVXJsIiwicHJlc2VuY2VMYWJlbCIsInN0YXR1c0xhYmVsIiwiZTJlSWNvbiIsImRpc3BsYXlOYW1lIiwiZGlzcGxheW5hbWUiLCJVc2VySW5mbyIsIm9uQ2xvc2UiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJSb29tTWVtYmVySW5mbyIsInByb3BzIiwicmVmaXJlUGFyYW1zIiwicHJldmlvdXNQaGFzZSIsIkVuY3J5cHRpb25QYW5lbCIsIlJvb21NZW1iZXJMaXN0Iiwib25FbmNyeXB0aW9uUGFuZWxDbG9zZSIsIlNldFJpZ2h0UGFuZWxQaGFzZSIsImNvbnRlbnQiLCJHcm91cE1lbWJlckluZm8iLCJjbG9zZUxhYmVsIiwidmVyaWZpY2F0aW9uUmVxdWVzdCIsInBlbmRpbmciLCJoZWFkZXIiLCJqb2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBRUE7O0FBR0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXFEQSxNQUFNQSxtQkFBbUIsR0FBRyxDQUFDQztBQUFEO0FBQUEsS0FBd0I7QUFDaEQsUUFBTUMsS0FBSyxHQUFHQyxNQUFNLENBQUNDLE1BQVAsQ0FBYyxJQUFkLENBQWQ7O0FBQ0EsT0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHSixPQUFPLENBQUNLLE1BQTVCLEVBQW9DRCxDQUFDLEVBQXJDLEVBQXlDO0FBQ3JDLFVBQU1FLElBQUksR0FBR04sT0FBTyxDQUFDSSxDQUFELENBQVAsQ0FBV0csY0FBWCxFQUFiO0FBQ0EsVUFBTUMsU0FBUyxHQUFHUCxLQUFLLENBQUNLLElBQUQsQ0FBTCxJQUFlLEVBQWpDO0FBQ0FFLElBQUFBLFNBQVMsQ0FBQ0MsSUFBVixDQUFlTCxDQUFmO0FBQ0FILElBQUFBLEtBQUssQ0FBQ0ssSUFBRCxDQUFMLEdBQWNFLFNBQWQ7QUFDSDs7QUFDRCxPQUFLLE1BQU1GLElB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QWlCSyxlQUEvQixFQUFnRDtBQUM1QyxVQUFNTyxtQkFBbUIsR0FBSVYsS0FBRCxDQUF3RFUsbUJBQXBGOztBQUNBLFFBQUlBLG1CQUFtQixJQUFJQSxtQkFBbUIsQ0FBQ0MsT0FBL0MsRUFBd0Q7QUFDcERGLE1BQUFBLFVBQVUsR0FBRyx5QkFBRyxRQUFILENBQWI7QUFDSDtBQUNKOztBQUVELFFBQU1HLE1BQU0sZ0JBQUcsNkJBQUMsY0FBRDtBQUFnQixJQUFBLE1BQU0sRUFBRTlULE1BQXhCO0FBQWdDLElBQUEsU0FBUyxFQUFFNFE7QUFBM0MsSUFBZjs7QUFDQSxzQkFBTyw2QkFBQyxpQkFBRDtBQUNILElBQUEsU0FBUyxFQUFFblEsT0FBTyxDQUFDc1QsSUFBUixDQUFhLEdBQWIsQ0FEUjtBQUVILElBQUEsTUFBTSxFQUFFRCxNQUZMO0FBR0gsSUFBQSxPQUFPLEVBQUVoQixPQUhOO0FBSUgsSUFBQSxVQUFVLEVBQUVhLFVBSlQ7QUFLSCxJQUFBLGFBQWEsRUFBRVAsYUFMWjtBQU1ILElBQUEsWUFBWSxFQUFFRDtBQU5YLEtBUURNLE9BUkMsQ0FBUDtBQVVILENBdEZEOztlQXdGZVosUSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTggVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHt1c2VDYWxsYmFjaywgdXNlQ29udGV4dCwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZX0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcbmltcG9ydCB7Um9vbU1lbWJlcn0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyJztcbmltcG9ydCB7VXNlcn0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3VzZXInO1xuaW1wb3J0IHtSb29tfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbSc7XG5pbXBvcnQge0V2ZW50VGltZWxpbmV9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudC10aW1lbGluZSc7XG5cbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQge190fSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IGNyZWF0ZVJvb20sIHsgZmluZERNRm9yVXNlciwgcHJpdmF0ZVNob3VsZEJlRW5jcnlwdGVkIH0gZnJvbSAnLi4vLi4vLi4vY3JlYXRlUm9vbSc7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gJy4uLy4uLy4uL3V0aWxzL0RNUm9vbU1hcCc7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgUm9vbVZpZXdTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCBNdWx0aUludml0ZXIgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL011bHRpSW52aXRlclwiO1xuaW1wb3J0IEdyb3VwU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Hcm91cFN0b3JlXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEUyRUljb24gZnJvbSBcIi4uL3Jvb21zL0UyRUljb25cIjtcbmltcG9ydCB7dXNlRXZlbnRFbWl0dGVyfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlRXZlbnRFbWl0dGVyXCI7XG5pbXBvcnQge3RleHR1YWxQb3dlckxldmVsfSBmcm9tICcuLi8uLi8uLi9Sb2xlcyc7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHtSaWdodFBhbmVsUGhhc2VzfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1JpZ2h0UGFuZWxTdG9yZVBoYXNlc1wiO1xuaW1wb3J0IEVuY3J5cHRpb25QYW5lbCBmcm9tIFwiLi9FbmNyeXB0aW9uUGFuZWxcIjtcbmltcG9ydCB7dXNlQXN5bmNNZW1vfSBmcm9tICcuLi8uLi8uLi9ob29rcy91c2VBc3luY01lbW8nO1xuaW1wb3J0IHtsZWdhY3lWZXJpZnlVc2VyLCB2ZXJpZnlEZXZpY2UsIHZlcmlmeVVzZXJ9IGZyb20gJy4uLy4uLy4uL3ZlcmlmaWNhdGlvbic7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHt1c2VJc0VuY3J5cHRlZH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUlzRW5jcnlwdGVkXCI7XG5pbXBvcnQgQmFzZUNhcmQgZnJvbSBcIi4vQmFzZUNhcmRcIjtcbmltcG9ydCB7RTJFU3RhdHVzfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvU2hpZWxkVXRpbHNcIjtcbmltcG9ydCBJbWFnZVZpZXcgZnJvbSBcIi4uL2VsZW1lbnRzL0ltYWdlVmlld1wiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCBQb3dlclNlbGVjdG9yIGZyb20gXCIuLi9lbGVtZW50cy9Qb3dlclNlbGVjdG9yXCI7XG5pbXBvcnQgTWVtYmVyQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL01lbWJlckF2YXRhclwiO1xuaW1wb3J0IFByZXNlbmNlTGFiZWwgZnJvbSBcIi4uL3Jvb21zL1ByZXNlbmNlTGFiZWxcIjtcbmltcG9ydCBTaGFyZURpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9TaGFyZURpYWxvZ1wiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBDb25maXJtVXNlckFjdGlvbkRpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9Db25maXJtVXNlckFjdGlvbkRpYWxvZ1wiO1xuaW1wb3J0IEluZm9EaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvSW5mb0RpYWxvZ1wiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHtTZXRSaWdodFBhbmVsUGhhc2VQYXlsb2FkfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9TZXRSaWdodFBhbmVsUGhhc2VQYXlsb2FkXCI7XG5cbmludGVyZmFjZSBJRGV2aWNlIHtcbiAgICBkZXZpY2VJZDogc3RyaW5nO1xuICAgIGFtYmlndW91cz86IGJvb2xlYW47XG4gICAgZ2V0RGlzcGxheU5hbWUoKTogc3RyaW5nO1xufVxuXG5jb25zdCBkaXNhbWJpZ3VhdGVEZXZpY2VzID0gKGRldmljZXM6IElEZXZpY2VbXSkgPT4ge1xuICAgIGNvbnN0IG5hbWVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRldmljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGRldmljZXNbaV0uZ2V0RGlzcGxheU5hbWUoKTtcbiAgICAgICAgY29uc3QgaW5kZXhMaXN0ID0gbmFtZXNbbmFtZV0gfHwgW107XG4gICAgICAgIGluZGV4TGlzdC5wdXNoKGkpO1xuICAgICAgICBuYW1lc1tuYW1lXSA9IGluZGV4TGlzdDtcbiAgICB9XG4gICAgZm9yIChjb25zdCBuYW1lIGluIG5hbWVzKSB7XG4gICAgICAgIGlmIChuYW1lc1tuYW1lXS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBuYW1lc1tuYW1lXS5mb3JFYWNoKChqKT0+e1xuICAgICAgICAgICAgICAgIGRldmljZXNbal0uYW1iaWd1b3VzID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEUyRVN0YXR1cyA9IChjbGk6IE1hdHJpeENsaWVudCwgdXNlcklkOiBzdHJpbmcsIGRldmljZXM6IElEZXZpY2VbXSk6IEUyRVN0YXR1cyA9PiB7XG4gICAgY29uc3QgaXNNZSA9IHVzZXJJZCA9PT0gY2xpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IHVzZXJUcnVzdCA9IGNsaS5jaGVja1VzZXJUcnVzdCh1c2VySWQpO1xuICAgIGlmICghdXNlclRydXN0LmlzQ3Jvc3NTaWduaW5nVmVyaWZpZWQoKSkge1xuICAgICAgICByZXR1cm4gdXNlclRydXN0Lndhc0Nyb3NzU2lnbmluZ1ZlcmlmaWVkKCkgPyBFMkVTdGF0dXMuV2FybmluZyA6IEUyRVN0YXR1cy5Ob3JtYWw7XG4gICAgfVxuXG4gICAgY29uc3QgYW55RGV2aWNlVW52ZXJpZmllZCA9IGRldmljZXMuc29tZShkZXZpY2UgPT4ge1xuICAgICAgICBjb25zdCB7IGRldmljZUlkIH0gPSBkZXZpY2U7XG4gICAgICAgIC8vIEZvciB5b3VyIG93biBkZXZpY2VzLCB3ZSB1c2UgdGhlIHN0cmljdGVyIGNoZWNrIG9mIGNyb3NzLXNpZ25pbmdcbiAgICAgICAgLy8gdmVyaWZpY2F0aW9uIHRvIGVuY291cmFnZSBldmVyeW9uZSB0byB0cnVzdCB0aGVpciBvd24gZGV2aWNlcyB2aWFcbiAgICAgICAgLy8gY3Jvc3Mtc2lnbmluZyBzbyB0aGF0IG90aGVyIHVzZXJzIGNhbiB0aGVuIHNhZmVseSB0cnVzdCB5b3UuXG4gICAgICAgIC8vIEZvciBvdGhlciBwZW9wbGUncyBkZXZpY2VzLCB0aGUgbW9yZSBnZW5lcmFsIHZlcmlmaWVkIGNoZWNrIHRoYXRcbiAgICAgICAgLy8gaW5jbHVkZXMgbG9jYWxseSB2ZXJpZmllZCBkZXZpY2VzIGNhbiBiZSB1c2VkLlxuICAgICAgICBjb25zdCBkZXZpY2VUcnVzdCA9IGNsaS5jaGVja0RldmljZVRydXN0KHVzZXJJZCwgZGV2aWNlSWQpO1xuICAgICAgICByZXR1cm4gaXNNZSA/ICFkZXZpY2VUcnVzdC5pc0Nyb3NzU2lnbmluZ1ZlcmlmaWVkKCkgOiAhZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpO1xuICAgIH0pO1xuICAgIHJldHVybiBhbnlEZXZpY2VVbnZlcmlmaWVkID8gRTJFU3RhdHVzLldhcm5pbmcgOiBFMkVTdGF0dXMuVmVyaWZpZWQ7XG59O1xuXG5hc3luYyBmdW5jdGlvbiBvcGVuRE1Gb3JVc2VyKG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LCB1c2VySWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGxhc3RBY3RpdmVSb29tID0gZmluZERNRm9yVXNlcihtYXRyaXhDbGllbnQsIHVzZXJJZCk7XG5cbiAgICBpZiAobGFzdEFjdGl2ZVJvb20pIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICByb29tX2lkOiBsYXN0QWN0aXZlUm9vbS5yb29tSWQsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlUm9vbU9wdGlvbnMgPSB7XG4gICAgICAgIGRtVXNlcklkOiB1c2VySWQsXG4gICAgICAgIGVuY3J5cHRpb246IHVuZGVmaW5lZCxcbiAgICB9O1xuXG4gICAgaWYgKHByaXZhdGVTaG91bGRCZUVuY3J5cHRlZCgpKSB7XG4gICAgICAgIC8vIENoZWNrIHdoZXRoZXIgYWxsIHVzZXJzIGhhdmUgdXBsb2FkZWQgZGV2aWNlIGtleXMgYmVmb3JlLlxuICAgICAgICAvLyBJZiBzbywgZW5hYmxlIGVuY3J5cHRpb24gaW4gdGhlIG5ldyByb29tLlxuICAgICAgICBjb25zdCB1c2Vyc1RvRGV2aWNlc01hcCA9IGF3YWl0IG1hdHJpeENsaWVudC5kb3dubG9hZEtleXMoW3VzZXJJZF0pO1xuICAgICAgICBjb25zdCBhbGxIYXZlRGV2aWNlS2V5cyA9IE9iamVjdC52YWx1ZXModXNlcnNUb0RldmljZXNNYXApLmV2ZXJ5KGRldmljZXMgPT4ge1xuICAgICAgICAgICAgLy8gYGRldmljZXNgIGlzIGFuIG9iamVjdCBvZiB0aGUgZm9ybSB7IGRldmljZUlkOiBkZXZpY2VJbmZvLCAuLi4gfS5cbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhkZXZpY2VzKS5sZW5ndGggPiAwO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGFsbEhhdmVEZXZpY2VLZXlzKSB7XG4gICAgICAgICAgICBjcmVhdGVSb29tT3B0aW9ucy5lbmNyeXB0aW9uID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVSb29tKGNyZWF0ZVJvb21PcHRpb25zKTtcbn1cblxudHlwZSBTZXRVcGRhdGluZyA9ICh1cGRhdGluZzogYm9vbGVhbikgPT4gdm9pZDtcblxuZnVuY3Rpb24gdXNlSGFzQ3Jvc3NTaWduaW5nS2V5cyhjbGk6IE1hdHJpeENsaWVudCwgbWVtYmVyOiBSb29tTWVtYmVyLCBjYW5WZXJpZnk6IGJvb2xlYW4sIHNldFVwZGF0aW5nOiBTZXRVcGRhdGluZykge1xuICAgIHJldHVybiB1c2VBc3luY01lbW8oYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWNhblZlcmlmeSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBzZXRVcGRhdGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGNsaS5kb3dubG9hZEtleXMoW21lbWJlci51c2VySWRdKTtcbiAgICAgICAgICAgIGNvbnN0IHhzaSA9IGNsaS5nZXRTdG9yZWRDcm9zc1NpZ25pbmdGb3JVc2VyKG1lbWJlci51c2VySWQpO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0geHNpICYmIHhzaS5nZXRJZCgpO1xuICAgICAgICAgICAgcmV0dXJuICEha2V5O1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0VXBkYXRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW2NsaSwgbWVtYmVyLCBjYW5WZXJpZnldLCB1bmRlZmluZWQpO1xufVxuXG5mdW5jdGlvbiBEZXZpY2VJdGVtKHt1c2VySWQsIGRldmljZX06IHt1c2VySWQ6IHN0cmluZywgZGV2aWNlOiBJRGV2aWNlfSkge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgaXNNZSA9IHVzZXJJZCA9PT0gY2xpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IGRldmljZVRydXN0ID0gY2xpLmNoZWNrRGV2aWNlVHJ1c3QodXNlcklkLCBkZXZpY2UuZGV2aWNlSWQpO1xuICAgIGNvbnN0IHVzZXJUcnVzdCA9IGNsaS5jaGVja1VzZXJUcnVzdCh1c2VySWQpO1xuICAgIC8vIEZvciB5b3VyIG93biBkZXZpY2VzLCB3ZSB1c2UgdGhlIHN0cmljdGVyIGNoZWNrIG9mIGNyb3NzLXNpZ25pbmdcbiAgICAvLyB2ZXJpZmljYXRpb24gdG8gZW5jb3VyYWdlIGV2ZXJ5b25lIHRvIHRydXN0IHRoZWlyIG93biBkZXZpY2VzIHZpYVxuICAgIC8vIGNyb3NzLXNpZ25pbmcgc28gdGhhdCBvdGhlciB1c2VycyBjYW4gdGhlbiBzYWZlbHkgdHJ1c3QgeW91LlxuICAgIC8vIEZvciBvdGhlciBwZW9wbGUncyBkZXZpY2VzLCB0aGUgbW9yZSBnZW5lcmFsIHZlcmlmaWVkIGNoZWNrIHRoYXRcbiAgICAvLyBpbmNsdWRlcyBsb2NhbGx5IHZlcmlmaWVkIGRldmljZXMgY2FuIGJlIHVzZWQuXG4gICAgY29uc3QgaXNWZXJpZmllZCA9IGlzTWUgPyBkZXZpY2VUcnVzdC5pc0Nyb3NzU2lnbmluZ1ZlcmlmaWVkKCkgOiBkZXZpY2VUcnVzdC5pc1ZlcmlmaWVkKCk7XG5cbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1VzZXJJbmZvX2RldmljZVwiLCB7XG4gICAgICAgIG14X1VzZXJJbmZvX2RldmljZV92ZXJpZmllZDogaXNWZXJpZmllZCxcbiAgICAgICAgbXhfVXNlckluZm9fZGV2aWNlX3VudmVyaWZpZWQ6ICFpc1ZlcmlmaWVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGljb25DbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X0UyRUljb25cIiwge1xuICAgICAgICBteF9FMkVJY29uX25vcm1hbDogIXVzZXJUcnVzdC5pc1ZlcmlmaWVkKCksXG4gICAgICAgIG14X0UyRUljb25fdmVyaWZpZWQ6IGlzVmVyaWZpZWQsXG4gICAgICAgIG14X0UyRUljb25fd2FybmluZzogdXNlclRydXN0LmlzVmVyaWZpZWQoKSAmJiAhaXNWZXJpZmllZCxcbiAgICB9KTtcblxuICAgIGNvbnN0IG9uRGV2aWNlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHZlcmlmeURldmljZShjbGkuZ2V0VXNlcih1c2VySWQpLCBkZXZpY2UpO1xuICAgIH07XG5cbiAgICBjb25zdCBkZXZpY2VOYW1lID0gZGV2aWNlLmFtYmlndW91cyA/XG4gICAgICAgIChkZXZpY2UuZ2V0RGlzcGxheU5hbWUoKSA/IGRldmljZS5nZXREaXNwbGF5TmFtZSgpIDogXCJcIikgKyBcIiAoXCIgKyBkZXZpY2UuZGV2aWNlSWQgKyBcIilcIiA6XG4gICAgICAgIGRldmljZS5nZXREaXNwbGF5TmFtZSgpO1xuICAgIGxldCB0cnVzdGVkTGFiZWwgPSBudWxsO1xuICAgIGlmICh1c2VyVHJ1c3QuaXNWZXJpZmllZCgpKSB0cnVzdGVkTGFiZWwgPSBpc1ZlcmlmaWVkID8gX3QoXCJUcnVzdGVkXCIpIDogX3QoXCJOb3QgdHJ1c3RlZFwiKTtcblxuXG4gICAgaWYgKGlzVmVyaWZpZWQpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSB0aXRsZT17ZGV2aWNlLmRldmljZUlkfSA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2ljb25DbGFzc2VzfSAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZGV2aWNlX25hbWVcIj57ZGV2aWNlTmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2RldmljZV90cnVzdGVkXCI+e3RydXN0ZWRMYWJlbH08L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICB0aXRsZT17ZGV2aWNlLmRldmljZUlkfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uRGV2aWNlQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2ljb25DbGFzc2VzfSAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZGV2aWNlX25hbWVcIj57ZGV2aWNlTmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2RldmljZV90cnVzdGVkXCI+e3RydXN0ZWRMYWJlbH08L2Rpdj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIERldmljZXNTZWN0aW9uKHtkZXZpY2VzLCB1c2VySWQsIGxvYWRpbmd9OiB7ZGV2aWNlczogSURldmljZVtdLCB1c2VySWQ6IHN0cmluZywgbG9hZGluZzogYm9vbGVhbn0pIHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IHVzZXJUcnVzdCA9IGNsaS5jaGVja1VzZXJUcnVzdCh1c2VySWQpO1xuXG4gICAgY29uc3QgW2lzRXhwYW5kZWQsIHNldEV4cGFuZGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIGlmIChsb2FkaW5nKSB7XG4gICAgICAgIC8vIHN0aWxsIGxvYWRpbmdcbiAgICAgICAgcmV0dXJuIDxTcGlubmVyIC8+O1xuICAgIH1cbiAgICBpZiAoZGV2aWNlcyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gPD57X3QoXCJVbmFibGUgdG8gbG9hZCBzZXNzaW9uIGxpc3RcIil9PC8+O1xuICAgIH1cbiAgICBjb25zdCBpc01lID0gdXNlcklkID09PSBjbGkuZ2V0VXNlcklkKCk7XG4gICAgY29uc3QgZGV2aWNlVHJ1c3RzID0gZGV2aWNlcy5tYXAoZCA9PiBjbGkuY2hlY2tEZXZpY2VUcnVzdCh1c2VySWQsIGQuZGV2aWNlSWQpKTtcblxuICAgIGxldCBleHBhbmRTZWN0aW9uRGV2aWNlcyA9IFtdO1xuICAgIGNvbnN0IHVudmVyaWZpZWREZXZpY2VzID0gW107XG5cbiAgICBsZXQgZXhwYW5kQ291bnRDYXB0aW9uO1xuICAgIGxldCBleHBhbmRIaWRlQ2FwdGlvbjtcbiAgICBsZXQgZXhwYW5kSWNvbkNsYXNzZXMgPSBcIm14X0UyRUljb25cIjtcblxuICAgIGlmICh1c2VyVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGV2aWNlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgZGV2aWNlID0gZGV2aWNlc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGRldmljZVRydXN0ID0gZGV2aWNlVHJ1c3RzW2ldO1xuICAgICAgICAgICAgLy8gRm9yIHlvdXIgb3duIGRldmljZXMsIHdlIHVzZSB0aGUgc3RyaWN0ZXIgY2hlY2sgb2YgY3Jvc3Mtc2lnbmluZ1xuICAgICAgICAgICAgLy8gdmVyaWZpY2F0aW9uIHRvIGVuY291cmFnZSBldmVyeW9uZSB0byB0cnVzdCB0aGVpciBvd24gZGV2aWNlcyB2aWFcbiAgICAgICAgICAgIC8vIGNyb3NzLXNpZ25pbmcgc28gdGhhdCBvdGhlciB1c2VycyBjYW4gdGhlbiBzYWZlbHkgdHJ1c3QgeW91LlxuICAgICAgICAgICAgLy8gRm9yIG90aGVyIHBlb3BsZSdzIGRldmljZXMsIHRoZSBtb3JlIGdlbmVyYWwgdmVyaWZpZWQgY2hlY2sgdGhhdFxuICAgICAgICAgICAgLy8gaW5jbHVkZXMgbG9jYWxseSB2ZXJpZmllZCBkZXZpY2VzIGNhbiBiZSB1c2VkLlxuICAgICAgICAgICAgY29uc3QgaXNWZXJpZmllZCA9IGlzTWUgPyBkZXZpY2VUcnVzdC5pc0Nyb3NzU2lnbmluZ1ZlcmlmaWVkKCkgOiBkZXZpY2VUcnVzdC5pc1ZlcmlmaWVkKCk7XG5cbiAgICAgICAgICAgIGlmIChpc1ZlcmlmaWVkKSB7XG4gICAgICAgICAgICAgICAgZXhwYW5kU2VjdGlvbkRldmljZXMucHVzaChkZXZpY2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1bnZlcmlmaWVkRGV2aWNlcy5wdXNoKGRldmljZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXhwYW5kQ291bnRDYXB0aW9uID0gX3QoXCIlKGNvdW50KXMgdmVyaWZpZWQgc2Vzc2lvbnNcIiwge2NvdW50OiBleHBhbmRTZWN0aW9uRGV2aWNlcy5sZW5ndGh9KTtcbiAgICAgICAgZXhwYW5kSGlkZUNhcHRpb24gPSBfdChcIkhpZGUgdmVyaWZpZWQgc2Vzc2lvbnNcIik7XG4gICAgICAgIGV4cGFuZEljb25DbGFzc2VzICs9IFwiIG14X0UyRUljb25fdmVyaWZpZWRcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBleHBhbmRTZWN0aW9uRGV2aWNlcyA9IGRldmljZXM7XG4gICAgICAgIGV4cGFuZENvdW50Q2FwdGlvbiA9IF90KFwiJShjb3VudClzIHNlc3Npb25zXCIsIHtjb3VudDogZGV2aWNlcy5sZW5ndGh9KTtcbiAgICAgICAgZXhwYW5kSGlkZUNhcHRpb24gPSBfdChcIkhpZGUgc2Vzc2lvbnNcIik7XG4gICAgICAgIGV4cGFuZEljb25DbGFzc2VzICs9IFwiIG14X0UyRUljb25fbm9ybWFsXCI7XG4gICAgfVxuXG4gICAgbGV0IGV4cGFuZEJ1dHRvbjtcbiAgICBpZiAoZXhwYW5kU2VjdGlvbkRldmljZXMubGVuZ3RoKSB7XG4gICAgICAgIGlmIChpc0V4cGFuZGVkKSB7XG4gICAgICAgICAgICBleHBhbmRCdXR0b24gPSAoPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZXhwYW5kIG14X2xpbmtCdXR0b25cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEV4cGFuZGVkKGZhbHNlKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2PntleHBhbmRIaWRlQ2FwdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhwYW5kQnV0dG9uID0gKDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2V4cGFuZCBteF9saW5rQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRFeHBhbmRlZCh0cnVlKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17ZXhwYW5kSWNvbkNsYXNzZXN9IC8+XG4gICAgICAgICAgICAgICAgPGRpdj57ZXhwYW5kQ291bnRDYXB0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZGV2aWNlTGlzdCA9IHVudmVyaWZpZWREZXZpY2VzLm1hcCgoZGV2aWNlLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiAoPERldmljZUl0ZW0ga2V5PXtpfSB1c2VySWQ9e3VzZXJJZH0gZGV2aWNlPXtkZXZpY2V9IC8+KTtcbiAgICB9KTtcbiAgICBpZiAoaXNFeHBhbmRlZCkge1xuICAgICAgICBjb25zdCBrZXlTdGFydCA9IHVudmVyaWZpZWREZXZpY2VzLmxlbmd0aDtcbiAgICAgICAgZGV2aWNlTGlzdCA9IGRldmljZUxpc3QuY29uY2F0KGV4cGFuZFNlY3Rpb25EZXZpY2VzLm1hcCgoZGV2aWNlLCBpKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKDxEZXZpY2VJdGVtIGtleT17aSArIGtleVN0YXJ0fSB1c2VySWQ9e3VzZXJJZH0gZGV2aWNlPXtkZXZpY2V9IC8+KTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZGV2aWNlc1wiPlxuICAgICAgICAgICAgPGRpdj57ZGV2aWNlTGlzdH08L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+e2V4cGFuZEJ1dHRvbn08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cblxuY29uc3QgVXNlck9wdGlvbnNTZWN0aW9uOiBSZWFjdC5GQzx7XG4gICAgbWVtYmVyOiBSb29tTWVtYmVyO1xuICAgIGlzSWdub3JlZDogYm9vbGVhbjtcbiAgICBjYW5JbnZpdGU6IGJvb2xlYW47XG59PiA9ICh7bWVtYmVyLCBpc0lnbm9yZWQsIGNhbkludml0ZX0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgbGV0IGlnbm9yZUJ1dHRvbiA9IG51bGw7XG4gICAgbGV0IGluc2VydFBpbGxCdXR0b24gPSBudWxsO1xuICAgIGxldCBpbnZpdGVVc2VyQnV0dG9uID0gbnVsbDtcbiAgICBsZXQgcmVhZFJlY2VpcHRCdXR0b24gPSBudWxsO1xuXG4gICAgY29uc3QgaXNNZSA9IG1lbWJlci51c2VySWQgPT09IGNsaS5nZXRVc2VySWQoKTtcblxuICAgIGNvbnN0IG9uU2hhcmVVc2VyQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ3NoYXJlIHJvb20gbWVtYmVyIGRpYWxvZycsICcnLCBTaGFyZURpYWxvZywge1xuICAgICAgICAgICAgdGFyZ2V0OiBtZW1iZXIsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBPbmx5IGFsbG93IHRoZSB1c2VyIHRvIGlnbm9yZSB0aGUgdXNlciBpZiBpdHMgbm90IG91cnNlbHZlc1xuICAgIC8vIHNhbWUgZ29lcyBmb3IganVtcGluZyB0byByZWFkIHJlY2VpcHRcbiAgICBpZiAoIWlzTWUpIHtcbiAgICAgICAgY29uc3Qgb25JZ25vcmVUb2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZ25vcmVkVXNlcnMgPSBjbGkuZ2V0SWdub3JlZFVzZXJzKCk7XG4gICAgICAgICAgICBpZiAoaXNJZ25vcmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBpZ25vcmVkVXNlcnMuaW5kZXhPZihtZW1iZXIudXNlcklkKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSBpZ25vcmVkVXNlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWdub3JlZFVzZXJzLnB1c2gobWVtYmVyLnVzZXJJZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsaS5zZXRJZ25vcmVkVXNlcnMoaWdub3JlZFVzZXJzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZ25vcmVCdXR0b24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uSWdub3JlVG9nZ2xlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1VzZXJJbmZvX2ZpZWxkXCIsIHtteF9Vc2VySW5mb19kZXN0cnVjdGl2ZTogIWlzSWdub3JlZH0pfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgaXNJZ25vcmVkID8gX3QoXCJVbmlnbm9yZVwiKSA6IF90KFwiSWdub3JlXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobWVtYmVyLnJvb21JZCkge1xuICAgICAgICAgICAgY29uc3Qgb25SZWFkUmVjZWlwdEJ1dHRvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShtZW1iZXIucm9vbUlkKTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRfaWQ6IHJvb20uZ2V0RXZlbnRSZWFkVXBUbyhtZW1iZXIudXNlcklkKSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogbWVtYmVyLnJvb21JZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IG9uSW5zZXJ0UGlsbEJ1dHRvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2luc2VydF9tZW50aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogbWVtYmVyLnVzZXJJZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShtZW1iZXIucm9vbUlkKTtcbiAgICAgICAgICAgIGlmIChyb29tPy5nZXRFdmVudFJlYWRVcFRvKG1lbWJlci51c2VySWQpKSB7XG4gICAgICAgICAgICAgICAgcmVhZFJlY2VpcHRCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e29uUmVhZFJlY2VpcHRCdXR0b259IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2ZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdKdW1wIHRvIHJlYWQgcmVjZWlwdCcpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGluc2VydFBpbGxCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25JbnNlcnRQaWxsQnV0dG9ufSBjbGFzc05hbWU9e1wibXhfVXNlckluZm9fZmllbGRcIn0+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ01lbnRpb24nKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYW5JbnZpdGUgJiYgKCFtZW1iZXIgfHwgIW1lbWJlci5tZW1iZXJzaGlwIHx8IG1lbWJlci5tZW1iZXJzaGlwID09PSAnbGVhdmUnKSkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gbWVtYmVyICYmIG1lbWJlci5yb29tSWQgPyBtZW1iZXIucm9vbUlkIDogUm9vbVZpZXdTdG9yZS5nZXRSb29tSWQoKTtcbiAgICAgICAgICAgIGNvbnN0IG9uSW52aXRlVXNlckJ1dHRvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSB1c2UgYSBNdWx0aUludml0ZXIgdG8gcmUtdXNlIHRoZSBpbnZpdGUgbG9naWMsIGV2ZW4gdGhvdWdoXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIG9ubHkgaW52aXRpbmcgb25lIHVzZXIuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZXIgPSBuZXcgTXVsdGlJbnZpdGVyKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGludml0ZXIuaW52aXRlKFttZW1iZXIudXNlcklkXSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW52aXRlci5nZXRDb21wbGV0aW9uU3RhdGUobWVtYmVyLnVzZXJJZCkgIT09IFwiaW52aXRlZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGludml0ZXIuZ2V0RXJyb3JUZXh0KG1lbWJlci51c2VySWQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byBpbnZpdGUnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRmFpbGVkIHRvIGludml0ZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaW52aXRlVXNlckJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXtvbkludml0ZVVzZXJCdXR0b259IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2ZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ0ludml0ZScpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc2hhcmVVc2VyQnV0dG9uID0gKFxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXtvblNoYXJlVXNlckNsaWNrfSBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiPlxuICAgICAgICAgICAgeyBfdCgnU2hhcmUgTGluayB0byBVc2VyJykgfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgKTtcblxuICAgIGxldCBkaXJlY3RNZXNzYWdlQnV0dG9uO1xuICAgIGlmICghaXNNZSkge1xuICAgICAgICBkaXJlY3RNZXNzYWdlQnV0dG9uID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17KCkgPT4gb3BlbkRNRm9yVXNlcihjbGksIG1lbWJlci51c2VySWQpfSBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiPlxuICAgICAgICAgICAgICAgIHsgX3QoJ0RpcmVjdCBtZXNzYWdlJykgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8aDM+eyBfdChcIk9wdGlvbnNcIikgfTwvaDM+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIHsgZGlyZWN0TWVzc2FnZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyByZWFkUmVjZWlwdEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBzaGFyZVVzZXJCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgaW5zZXJ0UGlsbEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBpbnZpdGVVc2VyQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IGlnbm9yZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn07XG5cbmNvbnN0IHdhcm5TZWxmRGVtb3RlID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdEZW1vdGluZyBTZWxmJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgIHRpdGxlOiBfdChcIkRlbW90ZSB5b3Vyc2VsZj9cIiksXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICB7IF90KFwiWW91IHdpbGwgbm90IGJlIGFibGUgdG8gdW5kbyB0aGlzIGNoYW5nZSBhcyB5b3UgYXJlIGRlbW90aW5nIHlvdXJzZWxmLCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiaWYgeW91IGFyZSB0aGUgbGFzdCBwcml2aWxlZ2VkIHVzZXIgaW4gdGhlIHJvb20gaXQgd2lsbCBiZSBpbXBvc3NpYmxlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ0byByZWdhaW4gcHJpdmlsZWdlcy5cIikgfVxuICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICBidXR0b246IF90KFwiRGVtb3RlXCIpLFxuICAgIH0pO1xuXG4gICAgY29uc3QgW2NvbmZpcm1lZF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICByZXR1cm4gY29uZmlybWVkO1xufTtcblxuY29uc3QgR2VuZXJpY0FkbWluVG9vbHNDb250YWluZXI6IFJlYWN0LkZDPHt9PiA9ICh7Y2hpbGRyZW59KSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxoMz57IF90KFwiQWRtaW4gVG9vbHNcIikgfTwvaDM+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufTtcblxuaW50ZXJmYWNlIElQb3dlckxldmVsc0NvbnRlbnQge1xuICAgIGV2ZW50cz86IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHVzZXJzX2RlZmF1bHQ/OiBudW1iZXI7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIGV2ZW50c19kZWZhdWx0PzogbnVtYmVyO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBzdGF0ZV9kZWZhdWx0PzogbnVtYmVyO1xuICAgIGJhbj86IG51bWJlcjtcbiAgICBraWNrPzogbnVtYmVyO1xuICAgIHJlZGFjdD86IG51bWJlcjtcbn1cblxuY29uc3QgaXNNdXRlZCA9IChtZW1iZXI6IFJvb21NZW1iZXIsIHBvd2VyTGV2ZWxDb250ZW50OiBJUG93ZXJMZXZlbHNDb250ZW50KSA9PiB7XG4gICAgaWYgKCFwb3dlckxldmVsQ29udGVudCB8fCAhbWVtYmVyKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBsZXZlbFRvU2VuZCA9IChcbiAgICAgICAgKHBvd2VyTGV2ZWxDb250ZW50LmV2ZW50cyA/IHBvd2VyTGV2ZWxDb250ZW50LmV2ZW50c1tcIm0ucm9vbS5tZXNzYWdlXCJdIDogbnVsbCkgfHxcbiAgICAgICAgcG93ZXJMZXZlbENvbnRlbnQuZXZlbnRzX2RlZmF1bHRcbiAgICApO1xuICAgIHJldHVybiBtZW1iZXIucG93ZXJMZXZlbCA8IGxldmVsVG9TZW5kO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZVJvb21Qb3dlckxldmVscyA9IChjbGk6IE1hdHJpeENsaWVudCwgcm9vbTogUm9vbSkgPT4ge1xuICAgIGNvbnN0IFtwb3dlckxldmVscywgc2V0UG93ZXJMZXZlbHNdID0gdXNlU3RhdGU8SVBvd2VyTGV2ZWxzQ29udGVudD4oe30pO1xuXG4gICAgY29uc3QgdXBkYXRlID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBldmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICBzZXRQb3dlckxldmVscyhldmVudC5nZXRDb250ZW50KCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0UG93ZXJMZXZlbHMoe30pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQb3dlckxldmVscyh7fSk7XG4gICAgICAgIH07XG4gICAgfSwgW3Jvb21dKTtcblxuICAgIHVzZUV2ZW50RW1pdHRlcihjbGksIFwiUm9vbVN0YXRlLm1lbWJlcnNcIiwgdXBkYXRlKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHNldFBvd2VyTGV2ZWxzKHt9KTtcbiAgICAgICAgfTtcbiAgICB9LCBbdXBkYXRlXSk7XG4gICAgcmV0dXJuIHBvd2VyTGV2ZWxzO1xufTtcblxuaW50ZXJmYWNlIElCYXNlUHJvcHMge1xuICAgIG1lbWJlcjogUm9vbU1lbWJlcjtcbiAgICBzdGFydFVwZGF0aW5nKCk6IHZvaWQ7XG4gICAgc3RvcFVwZGF0aW5nKCk6IHZvaWQ7XG59XG5cbmNvbnN0IFJvb21LaWNrQnV0dG9uOiBSZWFjdC5GQzxJQmFzZVByb3BzPiA9ICh7bWVtYmVyLCBzdGFydFVwZGF0aW5nLCBzdG9wVXBkYXRpbmd9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIC8vIGNoZWNrIGlmIHVzZXIgY2FuIGJlIGtpY2tlZC9kaXNpbnZpdGVkXG4gICAgaWYgKG1lbWJlci5tZW1iZXJzaGlwICE9PSBcImludml0ZVwiICYmIG1lbWJlci5tZW1iZXJzaGlwICE9PSBcImpvaW5cIikgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBvbktpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgJ0NvbmZpcm0gVXNlciBBY3Rpb24gRGlhbG9nJyxcbiAgICAgICAgICAgICdvbktpY2snLFxuICAgICAgICAgICAgQ29uZmlybVVzZXJBY3Rpb25EaWFsb2csXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVtYmVyLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogbWVtYmVyLm1lbWJlcnNoaXAgPT09IFwiaW52aXRlXCIgPyBfdChcIkRpc2ludml0ZVwiKSA6IF90KFwiS2lja1wiKSxcbiAgICAgICAgICAgICAgICB0aXRsZTogbWVtYmVyLm1lbWJlcnNoaXAgPT09IFwiaW52aXRlXCIgPyBfdChcIkRpc2ludml0ZSB0aGlzIHVzZXI/XCIpIDogX3QoXCJLaWNrIHRoaXMgdXNlcj9cIiksXG4gICAgICAgICAgICAgICAgYXNrUmVhc29uOiBtZW1iZXIubWVtYmVyc2hpcCA9PT0gXCJqb2luXCIsXG4gICAgICAgICAgICAgICAgZGFuZ2VyOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBbcHJvY2VlZCwgcmVhc29uXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICBpZiAoIXByb2NlZWQpIHJldHVybjtcblxuICAgICAgICBzdGFydFVwZGF0aW5nKCk7XG4gICAgICAgIGNsaS5raWNrKG1lbWJlci5yb29tSWQsIG1lbWJlci51c2VySWQsIHJlYXNvbiB8fCB1bmRlZmluZWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gTk8tT1A7IHJlbHkgb24gdGhlIG0ucm9vbS5tZW1iZXIgZXZlbnQgY29taW5nIGRvd24gZWxzZSB3ZSBjb3VsZFxuICAgICAgICAgICAgLy8gZ2V0IG91dCBvZiBzeW5jIGlmIHdlIGZvcmNlIHNldFN0YXRlIGhlcmUhXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIktpY2sgc3VjY2Vzc1wiKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiS2ljayBlcnJvcjogXCIgKyBlcnIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIGtpY2snLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJGYWlsZWQgdG8ga2lja1wiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBcIk9wZXJhdGlvbiBmYWlsZWRcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBzdG9wVXBkYXRpbmcoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGtpY2tMYWJlbCA9IG1lbWJlci5tZW1iZXJzaGlwID09PSBcImludml0ZVwiID8gX3QoXCJEaXNpbnZpdGVcIikgOiBfdChcIktpY2tcIik7XG4gICAgcmV0dXJuIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2ZpZWxkIG14X1VzZXJJbmZvX2Rlc3RydWN0aXZlXCIgb25DbGljaz17b25LaWNrfT5cbiAgICAgICAgeyBraWNrTGFiZWwgfVxuICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG59O1xuXG5jb25zdCBSZWRhY3RNZXNzYWdlc0J1dHRvbjogUmVhY3QuRkM8SUJhc2VQcm9wcz4gPSAoe21lbWJlcn0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgY29uc3Qgb25SZWRhY3RBbGxNZXNzYWdlcyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qge3Jvb21JZCwgdXNlcklkfSA9IG1lbWJlcjtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0aW1lbGluZSA9IHJvb20uZ2V0TGl2ZVRpbWVsaW5lKCk7XG4gICAgICAgIGxldCBldmVudHNUb1JlZGFjdCA9IFtdO1xuICAgICAgICB3aGlsZSAodGltZWxpbmUpIHtcbiAgICAgICAgICAgIGV2ZW50c1RvUmVkYWN0ID0gdGltZWxpbmUuZ2V0RXZlbnRzKCkucmVkdWNlKChldmVudHMsIGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmdldFNlbmRlcigpID09PSB1c2VySWQgJiYgIWV2ZW50LmlzUmVkYWN0ZWQoKSAmJiAhZXZlbnQuaXNSZWRhY3Rpb24oKSAmJlxuICAgICAgICAgICAgICAgICAgICBldmVudC5nZXRUeXBlKCkgIT09IEV2ZW50VHlwZS5Sb29tQ3JlYXRlICYmXG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IHJlZGFjdCBBQ0xzIGJlY2F1c2UgdGhhdCdsbCBvYmxpdGVyYXRlIHRoZSByb29tXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9zeW5hcHNlL2lzc3Vlcy80MDQyIGZvciBkZXRhaWxzLlxuICAgICAgICAgICAgICAgICAgICBldmVudC5nZXRUeXBlKCkgIT09IEV2ZW50VHlwZS5Sb29tU2VydmVyQWNsXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldmVudHMuY29uY2F0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnRzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGV2ZW50c1RvUmVkYWN0KTtcbiAgICAgICAgICAgIHRpbWVsaW5lID0gdGltZWxpbmUuZ2V0TmVpZ2hib3VyaW5nVGltZWxpbmUoRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY291bnQgPSBldmVudHNUb1JlZGFjdC5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHVzZXIgPSBtZW1iZXIubmFtZTtcblxuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ05vIHVzZXIgbWVzc2FnZXMgZm91bmQgdG8gcmVtb3ZlJywgJycsIEluZm9EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJObyByZWNlbnQgbWVzc2FnZXMgYnkgJSh1c2VyKXMgZm91bmRcIiwge3VzZXJ9KSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJUcnkgc2Nyb2xsaW5nIHVwIGluIHRoZSB0aW1lbGluZSB0byBzZWUgaWYgdGhlcmUgYXJlIGFueSBlYXJsaWVyIG9uZXMuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1JlbW92ZSByZWNlbnQgbWVzc2FnZXMgYnkgdXNlcicsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlJlbW92ZSByZWNlbnQgbWVzc2FnZXMgYnkgJSh1c2VyKXNcIiwge3VzZXJ9KSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJZb3UgYXJlIGFib3V0IHRvIHJlbW92ZSAlKGNvdW50KXMgbWVzc2FnZXMgYnkgJSh1c2VyKXMuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgY2Fubm90IGJlIHVuZG9uZS4gRG8geW91IHdpc2ggdG8gY29udGludWU/XCIsIHtjb3VudCwgdXNlcn0pIH08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiRm9yIGEgbGFyZ2UgYW1vdW50IG9mIG1lc3NhZ2VzLCB0aGlzIG1pZ2h0IHRha2Ugc29tZSB0aW1lLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJQbGVhc2UgZG9uJ3QgcmVmcmVzaCB5b3VyIGNsaWVudCBpbiB0aGUgbWVhbnRpbWUuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICAgICBidXR0b246IF90KFwiUmVtb3ZlICUoY291bnQpcyBtZXNzYWdlc1wiLCB7Y291bnR9KSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN1Ym1pdHRpbmcgYSBsYXJnZSBudW1iZXIgb2YgcmVkYWN0aW9ucyBmcmVlemVzIHRoZSBVSSxcbiAgICAgICAgICAgIC8vIHNvIGZpcnN0IHlpZWxkIHRvIGFsbG93IHRvIHJlcmVuZGVyIGFmdGVyIGNsb3NpbmcgdGhlIGRpYWxvZy5cbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYFN0YXJ0ZWQgcmVkYWN0aW5nIHJlY2VudCAke2NvdW50fSBtZXNzYWdlcyBmb3IgJHt1c2VyfSBpbiAke3Jvb21JZH1gKTtcbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGV2ZW50c1RvUmVkYWN0Lm1hcChhc3luYyBldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnJlZGFjdEV2ZW50KHJvb21JZCwgZXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGxvZyBhbmQgc3dhbGxvdyBlcnJvcnNcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCByZWRhY3RcIiwgZXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYEZpbmlzaGVkIHJlZGFjdGluZyByZWNlbnQgJHtjb3VudH0gbWVzc2FnZXMgZm9yICR7dXNlcn0gaW4gJHtyb29tSWR9YCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2ZpZWxkIG14X1VzZXJJbmZvX2Rlc3RydWN0aXZlXCIgb25DbGljaz17b25SZWRhY3RBbGxNZXNzYWdlc30+XG4gICAgICAgIHsgX3QoXCJSZW1vdmUgcmVjZW50IG1lc3NhZ2VzXCIpIH1cbiAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xufTtcblxuY29uc3QgQmFuVG9nZ2xlQnV0dG9uOiBSZWFjdC5GQzxJQmFzZVByb3BzPiA9ICh7bWVtYmVyLCBzdGFydFVwZGF0aW5nLCBzdG9wVXBkYXRpbmd9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IG9uQmFuT3JVbmJhbiA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAnQ29uZmlybSBVc2VyIEFjdGlvbiBEaWFsb2cnLFxuICAgICAgICAgICAgJ29uQmFuT3JVbmJhbicsXG4gICAgICAgICAgICBDb25maXJtVXNlckFjdGlvbkRpYWxvZyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZW1iZXIsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBtZW1iZXIubWVtYmVyc2hpcCA9PT0gJ2JhbicgPyBfdChcIlVuYmFuXCIpIDogX3QoXCJCYW5cIiksXG4gICAgICAgICAgICAgICAgdGl0bGU6IG1lbWJlci5tZW1iZXJzaGlwID09PSAnYmFuJyA/IF90KFwiVW5iYW4gdGhpcyB1c2VyP1wiKSA6IF90KFwiQmFuIHRoaXMgdXNlcj9cIiksXG4gICAgICAgICAgICAgICAgYXNrUmVhc29uOiBtZW1iZXIubWVtYmVyc2hpcCAhPT0gJ2JhbicsXG4gICAgICAgICAgICAgICAgZGFuZ2VyOiBtZW1iZXIubWVtYmVyc2hpcCAhPT0gJ2JhbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IFtwcm9jZWVkLCByZWFzb25dID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN0YXJ0VXBkYXRpbmcoKTtcbiAgICAgICAgbGV0IHByb21pc2U7XG4gICAgICAgIGlmIChtZW1iZXIubWVtYmVyc2hpcCA9PT0gJ2JhbicpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBjbGkudW5iYW4obWVtYmVyLnJvb21JZCwgbWVtYmVyLnVzZXJJZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9taXNlID0gY2xpLmJhbihtZW1iZXIucm9vbUlkLCBtZW1iZXIudXNlcklkLCByZWFzb24gfHwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gTk8tT1A7IHJlbHkgb24gdGhlIG0ucm9vbS5tZW1iZXIgZXZlbnQgY29taW5nIGRvd24gZWxzZSB3ZSBjb3VsZFxuICAgICAgICAgICAgLy8gZ2V0IG91dCBvZiBzeW5jIGlmIHdlIGZvcmNlIHNldFN0YXRlIGhlcmUhXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkJhbiBzdWNjZXNzXCIpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJCYW4gZXJyb3I6IFwiICsgZXJyKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byBiYW4gdXNlcicsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIkZhaWxlZCB0byBiYW4gdXNlclwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHN0b3BVcGRhdGluZygpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgbGV0IGxhYmVsID0gX3QoXCJCYW5cIik7XG4gICAgaWYgKG1lbWJlci5tZW1iZXJzaGlwID09PSAnYmFuJykge1xuICAgICAgICBsYWJlbCA9IF90KFwiVW5iYW5cIik7XG4gICAgfVxuXG4gICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9Vc2VySW5mb19maWVsZFwiLCB7XG4gICAgICAgIG14X1VzZXJJbmZvX2Rlc3RydWN0aXZlOiBtZW1iZXIubWVtYmVyc2hpcCAhPT0gJ2JhbicsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPXtjbGFzc2VzfSBvbkNsaWNrPXtvbkJhbk9yVW5iYW59PlxuICAgICAgICB7IGxhYmVsIH1cbiAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xufTtcblxuaW50ZXJmYWNlIElCYXNlUm9vbVByb3BzIGV4dGVuZHMgSUJhc2VQcm9wcyB7XG4gICAgcm9vbTogUm9vbTtcbiAgICBwb3dlckxldmVsczogSVBvd2VyTGV2ZWxzQ29udGVudDtcbn1cblxuY29uc3QgTXV0ZVRvZ2dsZUJ1dHRvbjogUmVhY3QuRkM8SUJhc2VSb29tUHJvcHM+ID0gKHttZW1iZXIsIHJvb20sIHBvd2VyTGV2ZWxzLCBzdGFydFVwZGF0aW5nLCBzdG9wVXBkYXRpbmd9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIC8vIERvbid0IHNob3cgdGhlIG11dGUvdW5tdXRlIG9wdGlvbiBpZiB0aGUgdXNlciBpcyBub3QgaW4gdGhlIHJvb21cbiAgICBpZiAobWVtYmVyLm1lbWJlcnNoaXAgIT09IFwiam9pblwiKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IG11dGVkID0gaXNNdXRlZChtZW1iZXIsIHBvd2VyTGV2ZWxzKTtcbiAgICBjb25zdCBvbk11dGVUb2dnbGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IG1lbWJlci5yb29tSWQ7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IG1lbWJlci51c2VySWQ7XG5cbiAgICAgICAgLy8gaWYgbXV0aW5nIHNlbGYsIHdhcm4gYXMgaXQgbWF5IGJlIGlycmV2ZXJzaWJsZVxuICAgICAgICBpZiAodGFyZ2V0ID09PSBjbGkuZ2V0VXNlcklkKCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoYXdhaXQgd2FyblNlbGZEZW1vdGUoKSkpIHJldHVybjtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHdhcm4gYWJvdXQgc2VsZiBkZW1vdGlvbjogXCIsIGUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKCFwb3dlckxldmVsRXZlbnQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBwb3dlckxldmVscyA9IHBvd2VyTGV2ZWxFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIGNvbnN0IGxldmVsVG9TZW5kID0gKFxuICAgICAgICAgICAgKHBvd2VyTGV2ZWxzLmV2ZW50cyA/IHBvd2VyTGV2ZWxzLmV2ZW50c1tcIm0ucm9vbS5tZXNzYWdlXCJdIDogbnVsbCkgfHxcbiAgICAgICAgICAgIHBvd2VyTGV2ZWxzLmV2ZW50c19kZWZhdWx0XG4gICAgICAgICk7XG4gICAgICAgIGxldCBsZXZlbDtcbiAgICAgICAgaWYgKG11dGVkKSB7IC8vIHVubXV0ZVxuICAgICAgICAgICAgbGV2ZWwgPSBsZXZlbFRvU2VuZDtcbiAgICAgICAgfSBlbHNlIHsgLy8gbXV0ZVxuICAgICAgICAgICAgbGV2ZWwgPSBsZXZlbFRvU2VuZCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgbGV2ZWwgPSBwYXJzZUludChsZXZlbCk7XG5cbiAgICAgICAgaWYgKCFpc05hTihsZXZlbCkpIHtcbiAgICAgICAgICAgIHN0YXJ0VXBkYXRpbmcoKTtcbiAgICAgICAgICAgIGNsaS5zZXRQb3dlckxldmVsKHJvb21JZCwgdGFyZ2V0LCBsZXZlbCwgcG93ZXJMZXZlbEV2ZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBOTy1PUDsgcmVseSBvbiB0aGUgbS5yb29tLm1lbWJlciBldmVudCBjb21pbmcgZG93biBlbHNlIHdlIGNvdWxkXG4gICAgICAgICAgICAgICAgLy8gZ2V0IG91dCBvZiBzeW5jIGlmIHdlIGZvcmNlIHNldFN0YXRlIGhlcmUhXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJNdXRlIHRvZ2dsZSBzdWNjZXNzXCIpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIk11dGUgZXJyb3I6IFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gbXV0ZSB1c2VyJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJGYWlsZWQgdG8gbXV0ZSB1c2VyXCIpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RvcFVwZGF0aW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1VzZXJJbmZvX2ZpZWxkXCIsIHtcbiAgICAgICAgbXhfVXNlckluZm9fZGVzdHJ1Y3RpdmU6ICFtdXRlZCxcbiAgICB9KTtcblxuICAgIGNvbnN0IG11dGVMYWJlbCA9IG11dGVkID8gX3QoXCJVbm11dGVcIikgOiBfdChcIk11dGVcIik7XG4gICAgcmV0dXJuIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT17Y2xhc3Nlc30gb25DbGljaz17b25NdXRlVG9nZ2xlfT5cbiAgICAgICAgeyBtdXRlTGFiZWwgfVxuICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG59O1xuXG5jb25zdCBSb29tQWRtaW5Ub29sc0NvbnRhaW5lcjogUmVhY3QuRkM8SUJhc2VSb29tUHJvcHM+ID0gKHtcbiAgICByb29tLFxuICAgIGNoaWxkcmVuLFxuICAgIG1lbWJlcixcbiAgICBzdGFydFVwZGF0aW5nLFxuICAgIHN0b3BVcGRhdGluZyxcbiAgICBwb3dlckxldmVscyxcbn0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGxldCBraWNrQnV0dG9uO1xuICAgIGxldCBiYW5CdXR0b247XG4gICAgbGV0IG11dGVCdXR0b247XG4gICAgbGV0IHJlZGFjdEJ1dHRvbjtcblxuICAgIGNvbnN0IGVkaXRQb3dlckxldmVsID0gKFxuICAgICAgICAocG93ZXJMZXZlbHMuZXZlbnRzID8gcG93ZXJMZXZlbHMuZXZlbnRzW1wibS5yb29tLnBvd2VyX2xldmVsc1wiXSA6IG51bGwpIHx8XG4gICAgICAgIHBvd2VyTGV2ZWxzLnN0YXRlX2RlZmF1bHRcbiAgICApO1xuXG4gICAgLy8gaWYgdGhlc2UgZG8gbm90IGV4aXN0IGluIHRoZSBldmVudCB0aGVuIHRoZXkgc2hvdWxkIGRlZmF1bHQgdG8gNTAgYXMgcGVyIHRoZSBzcGVjXG4gICAgY29uc3Qge1xuICAgICAgICBiYW46IGJhblBvd2VyTGV2ZWwgPSA1MCxcbiAgICAgICAga2ljazoga2lja1Bvd2VyTGV2ZWwgPSA1MCxcbiAgICAgICAgcmVkYWN0OiByZWRhY3RQb3dlckxldmVsID0gNTAsXG4gICAgfSA9IHBvd2VyTGV2ZWxzO1xuXG4gICAgY29uc3QgbWUgPSByb29tLmdldE1lbWJlcihjbGkuZ2V0VXNlcklkKCkpO1xuICAgIGlmICghbWUpIHtcbiAgICAgICAgLy8gd2UgYXJlbid0IGluIHRoZSByb29tLCBzbyByZXR1cm4gbm8gYWRtaW4gdG9vbGluZ1xuICAgICAgICByZXR1cm4gPGRpdiAvPjtcbiAgICB9XG5cbiAgICBjb25zdCBpc01lID0gbWUudXNlcklkID09PSBtZW1iZXIudXNlcklkO1xuICAgIGNvbnN0IGNhbkFmZmVjdFVzZXIgPSBtZW1iZXIucG93ZXJMZXZlbCA8IG1lLnBvd2VyTGV2ZWwgfHwgaXNNZTtcblxuICAgIGlmIChjYW5BZmZlY3RVc2VyICYmIG1lLnBvd2VyTGV2ZWwgPj0ga2lja1Bvd2VyTGV2ZWwpIHtcbiAgICAgICAga2lja0J1dHRvbiA9IDxSb29tS2lja0J1dHRvbiBtZW1iZXI9e21lbWJlcn0gc3RhcnRVcGRhdGluZz17c3RhcnRVcGRhdGluZ30gc3RvcFVwZGF0aW5nPXtzdG9wVXBkYXRpbmd9IC8+O1xuICAgIH1cbiAgICBpZiAobWUucG93ZXJMZXZlbCA+PSByZWRhY3RQb3dlckxldmVsKSB7XG4gICAgICAgIHJlZGFjdEJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxSZWRhY3RNZXNzYWdlc0J1dHRvbiBtZW1iZXI9e21lbWJlcn0gc3RhcnRVcGRhdGluZz17c3RhcnRVcGRhdGluZ30gc3RvcFVwZGF0aW5nPXtzdG9wVXBkYXRpbmd9IC8+XG4gICAgICAgICk7XG4gICAgfVxuICAgIGlmIChjYW5BZmZlY3RVc2VyICYmIG1lLnBvd2VyTGV2ZWwgPj0gYmFuUG93ZXJMZXZlbCkge1xuICAgICAgICBiYW5CdXR0b24gPSA8QmFuVG9nZ2xlQnV0dG9uIG1lbWJlcj17bWVtYmVyfSBzdGFydFVwZGF0aW5nPXtzdGFydFVwZGF0aW5nfSBzdG9wVXBkYXRpbmc9e3N0b3BVcGRhdGluZ30gLz47XG4gICAgfVxuICAgIGlmIChjYW5BZmZlY3RVc2VyICYmIG1lLnBvd2VyTGV2ZWwgPj0gZWRpdFBvd2VyTGV2ZWwpIHtcbiAgICAgICAgbXV0ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxNdXRlVG9nZ2xlQnV0dG9uXG4gICAgICAgICAgICAgICAgbWVtYmVyPXttZW1iZXJ9XG4gICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICBwb3dlckxldmVscz17cG93ZXJMZXZlbHN9XG4gICAgICAgICAgICAgICAgc3RhcnRVcGRhdGluZz17c3RhcnRVcGRhdGluZ31cbiAgICAgICAgICAgICAgICBzdG9wVXBkYXRpbmc9e3N0b3BVcGRhdGluZ31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGtpY2tCdXR0b24gfHwgYmFuQnV0dG9uIHx8IG11dGVCdXR0b24gfHwgcmVkYWN0QnV0dG9uIHx8IGNoaWxkcmVuKSB7XG4gICAgICAgIHJldHVybiA8R2VuZXJpY0FkbWluVG9vbHNDb250YWluZXI+XG4gICAgICAgICAgICB7IG11dGVCdXR0b24gfVxuICAgICAgICAgICAgeyBraWNrQnV0dG9uIH1cbiAgICAgICAgICAgIHsgYmFuQnV0dG9uIH1cbiAgICAgICAgICAgIHsgcmVkYWN0QnV0dG9uIH1cbiAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICA8L0dlbmVyaWNBZG1pblRvb2xzQ29udGFpbmVyPjtcbiAgICB9XG5cbiAgICByZXR1cm4gPGRpdiAvPjtcbn07XG5cbmludGVyZmFjZSBHcm91cE1lbWJlciB7XG4gICAgdXNlcklkOiBzdHJpbmc7XG4gICAgZGlzcGxheW5hbWU/OiBzdHJpbmc7IC8vIFhYWDogR3JvdXBNZW1iZXIgb2JqZWN0cyBhcmUgaW5jb25zaXN0ZW50IDooKFxuICAgIGF2YXRhclVybD86IHN0cmluZztcbn1cblxuY29uc3QgR3JvdXBBZG1pblRvb2xzU2VjdGlvbjogUmVhY3QuRkM8e1xuICAgIGdyb3VwSWQ6IHN0cmluZztcbiAgICBncm91cE1lbWJlcjogR3JvdXBNZW1iZXI7XG4gICAgc3RhcnRVcGRhdGluZygpOiB2b2lkO1xuICAgIHN0b3BVcGRhdGluZygpOiB2b2lkO1xufT4gPSAoe2NoaWxkcmVuLCBncm91cElkLCBncm91cE1lbWJlciwgc3RhcnRVcGRhdGluZywgc3RvcFVwZGF0aW5nfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBbaXNQcml2aWxlZ2VkLCBzZXRJc1ByaXZpbGVnZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtpc0ludml0ZWQsIHNldElzSW52aXRlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgICAvLyBMaXN0ZW4gdG8gZ3JvdXAgc3RvcmUgY2hhbmdlc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxldCB1bm1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBvbkdyb3VwU3RvcmVVcGRhdGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0SXNQcml2aWxlZ2VkKEdyb3VwU3RvcmUuaXNVc2VyUHJpdmlsZWdlZChncm91cElkKSk7XG4gICAgICAgICAgICBzZXRJc0ludml0ZWQoR3JvdXBTdG9yZS5nZXRHcm91cEludml0ZWRNZW1iZXJzKGdyb3VwSWQpLnNvbWUoXG4gICAgICAgICAgICAgICAgKG0pID0+IG0udXNlcklkID09PSBncm91cE1lbWJlci51c2VySWQsXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfTtcblxuICAgICAgICBHcm91cFN0b3JlLnJlZ2lzdGVyTGlzdGVuZXIoZ3JvdXBJZCwgb25Hcm91cFN0b3JlVXBkYXRlZCk7XG4gICAgICAgIG9uR3JvdXBTdG9yZVVwZGF0ZWQoKTtcbiAgICAgICAgLy8gSGFuZGxlIHVubW91bnRcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHVubW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgICBHcm91cFN0b3JlLnVucmVnaXN0ZXJMaXN0ZW5lcihvbkdyb3VwU3RvcmVVcGRhdGVkKTtcbiAgICAgICAgfTtcbiAgICB9LCBbZ3JvdXBJZCwgZ3JvdXBNZW1iZXIudXNlcklkXSk7XG5cbiAgICBpZiAoaXNQcml2aWxlZ2VkKSB7XG4gICAgICAgIGNvbnN0IG9uS2ljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVEaWFsb2coQ29uZmlybVVzZXJBY3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ6IGNsaSxcbiAgICAgICAgICAgICAgICBncm91cE1lbWJlcixcbiAgICAgICAgICAgICAgICBhY3Rpb246IGlzSW52aXRlZCA/IF90KCdEaXNpbnZpdGUnKSA6IF90KCdSZW1vdmUgZnJvbSBjb21tdW5pdHknKSxcbiAgICAgICAgICAgICAgICB0aXRsZTogaXNJbnZpdGVkID8gX3QoJ0Rpc2ludml0ZSB0aGlzIHVzZXIgZnJvbSBjb21tdW5pdHk/JylcbiAgICAgICAgICAgICAgICAgICAgOiBfdCgnUmVtb3ZlIHRoaXMgdXNlciBmcm9tIGNvbW11bml0eT8nKSxcbiAgICAgICAgICAgICAgICBkYW5nZXI6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgW3Byb2NlZWRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICBpZiAoIXByb2NlZWQpIHJldHVybjtcblxuICAgICAgICAgICAgc3RhcnRVcGRhdGluZygpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZVVzZXJGcm9tR3JvdXAoZ3JvdXBJZCwgZ3JvdXBNZW1iZXIudXNlcklkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdG8gdGhlIHVzZXIgbGlzdFxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdVc2VyLFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byByZW1vdmUgdXNlciBmcm9tIGdyb3VwJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3InKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGlzSW52aXRlZCA/XG4gICAgICAgICAgICAgICAgICAgICAgICBfdCgnRmFpbGVkIHRvIHdpdGhkcmF3IGludml0YXRpb24nKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBfdCgnRmFpbGVkIHRvIHJlbW92ZSB1c2VyIGZyb20gY29tbXVuaXR5JyksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICBzdG9wVXBkYXRpbmcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGtpY2tCdXR0b24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZCBteF9Vc2VySW5mb19kZXN0cnVjdGl2ZVwiIG9uQ2xpY2s9e29uS2lja30+XG4gICAgICAgICAgICAgICAgeyBpc0ludml0ZWQgPyBfdCgnRGlzaW52aXRlJykgOiBfdCgnUmVtb3ZlIGZyb20gY29tbXVuaXR5JykgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuXG4gICAgICAgIC8vIE5vIG1ha2UvcmV2b2tlIGFkbWluIEFQSSB5ZXRcbiAgICAgICAgLypjb25zdCBvcExhYmVsID0gdGhpcy5zdGF0ZS5pc1RhcmdldE1vZCA/IF90KFwiUmV2b2tlIE1vZGVyYXRvclwiKSA6IF90KFwiTWFrZSBNb2RlcmF0b3JcIik7XG4gICAgICAgIGdpdmVNb2RCdXR0b24gPSA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25Nb2RUb2dnbGV9PlxuICAgICAgICAgICAge2dpdmVPcExhYmVsfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+OyovXG5cbiAgICAgICAgcmV0dXJuIDxHZW5lcmljQWRtaW5Ub29sc0NvbnRhaW5lcj5cbiAgICAgICAgICAgIHsga2lja0J1dHRvbiB9XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPC9HZW5lcmljQWRtaW5Ub29sc0NvbnRhaW5lcj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXYgLz47XG59O1xuXG5jb25zdCB1c2VJc1N5bmFwc2VBZG1pbiA9IChjbGk6IE1hdHJpeENsaWVudCkgPT4ge1xuICAgIGNvbnN0IFtpc0FkbWluLCBzZXRJc0FkbWluXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjbGkuaXNTeW5hcHNlQWRtaW5pc3RyYXRvcigpLnRoZW4oKGlzQWRtaW4pID0+IHtcbiAgICAgICAgICAgIHNldElzQWRtaW4oaXNBZG1pbik7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHNldElzQWRtaW4oZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9LCBbY2xpXSk7XG4gICAgcmV0dXJuIGlzQWRtaW47XG59O1xuXG5jb25zdCB1c2VIb21lc2VydmVyU3VwcG9ydHNDcm9zc1NpZ25pbmcgPSAoY2xpOiBNYXRyaXhDbGllbnQpID0+IHtcbiAgICByZXR1cm4gdXNlQXN5bmNNZW1vPGJvb2xlYW4+KGFzeW5jICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNsaS5kb2VzU2VydmVyU3VwcG9ydFVuc3RhYmxlRmVhdHVyZShcIm9yZy5tYXRyaXguZTJlX2Nyb3NzX3NpZ25pbmdcIik7XG4gICAgfSwgW2NsaV0sIGZhbHNlKTtcbn07XG5cbmludGVyZmFjZSBJUm9vbVBlcm1pc3Npb25zIHtcbiAgICBtb2RpZnlMZXZlbE1heDogbnVtYmVyO1xuICAgIGNhbkVkaXQ6IGJvb2xlYW47XG4gICAgY2FuSW52aXRlOiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiB1c2VSb29tUGVybWlzc2lvbnMoY2xpOiBNYXRyaXhDbGllbnQsIHJvb206IFJvb20sIHVzZXI6IFVzZXIpOiBJUm9vbVBlcm1pc3Npb25zIHtcbiAgICBjb25zdCBbcm9vbVBlcm1pc3Npb25zLCBzZXRSb29tUGVybWlzc2lvbnNdID0gdXNlU3RhdGU8SVJvb21QZXJtaXNzaW9ucz4oe1xuICAgICAgICAvLyBtb2RpZnlMZXZlbE1heCBpcyB0aGUgbWF4IFBMIHdlIGNhbiBzZXQgdGhpcyB1c2VyIHRvLCB0eXBpY2FsbHkgbWluKHRoZWlyIFBMLCBvdXIgUEwpICYmIGNhblNldFBMXG4gICAgICAgIG1vZGlmeUxldmVsTWF4OiAtMSxcbiAgICAgICAgY2FuRWRpdDogZmFsc2UsXG4gICAgICAgIGNhbkludml0ZTogZmFsc2UsXG4gICAgfSk7XG4gICAgY29uc3QgdXBkYXRlUm9vbVBlcm1pc3Npb25zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKCFwb3dlckxldmVsRXZlbnQpIHJldHVybjtcbiAgICAgICAgY29uc3QgcG93ZXJMZXZlbHMgPSBwb3dlckxldmVsRXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoIXBvd2VyTGV2ZWxzKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbWUgPSByb29tLmdldE1lbWJlcihjbGkuZ2V0VXNlcklkKCkpO1xuICAgICAgICBpZiAoIW1lKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgdGhlbSA9IHVzZXI7XG4gICAgICAgIGNvbnN0IGlzTWUgPSBtZS51c2VySWQgPT09IHRoZW0udXNlcklkO1xuICAgICAgICBjb25zdCBjYW5BZmZlY3RVc2VyID0gdGhlbS5wb3dlckxldmVsIDwgbWUucG93ZXJMZXZlbCB8fCBpc01lO1xuXG4gICAgICAgIGxldCBtb2RpZnlMZXZlbE1heCA9IC0xO1xuICAgICAgICBpZiAoY2FuQWZmZWN0VXNlcikge1xuICAgICAgICAgICAgY29uc3QgZWRpdFBvd2VyTGV2ZWwgPSAoXG4gICAgICAgICAgICAgICAgKHBvd2VyTGV2ZWxzLmV2ZW50cyA/IHBvd2VyTGV2ZWxzLmV2ZW50c1tcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIl0gOiBudWxsKSB8fFxuICAgICAgICAgICAgICAgIHBvd2VyTGV2ZWxzLnN0YXRlX2RlZmF1bHRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAobWUucG93ZXJMZXZlbCA+PSBlZGl0UG93ZXJMZXZlbCAmJiAoaXNNZSB8fCBtZS5wb3dlckxldmVsID4gdGhlbS5wb3dlckxldmVsKSkge1xuICAgICAgICAgICAgICAgIG1vZGlmeUxldmVsTWF4ID0gbWUucG93ZXJMZXZlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNldFJvb21QZXJtaXNzaW9ucyh7XG4gICAgICAgICAgICBjYW5JbnZpdGU6IG1lLnBvd2VyTGV2ZWwgPj0gcG93ZXJMZXZlbHMuaW52aXRlLFxuICAgICAgICAgICAgY2FuRWRpdDogbW9kaWZ5TGV2ZWxNYXggPj0gMCxcbiAgICAgICAgICAgIG1vZGlmeUxldmVsTWF4LFxuICAgICAgICB9KTtcbiAgICB9LCBbY2xpLCB1c2VyLCByb29tXSk7XG4gICAgdXNlRXZlbnRFbWl0dGVyKGNsaSwgXCJSb29tU3RhdGUubWVtYmVyc1wiLCB1cGRhdGVSb29tUGVybWlzc2lvbnMpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVJvb21QZXJtaXNzaW9ucygpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgc2V0Um9vbVBlcm1pc3Npb25zKHtcbiAgICAgICAgICAgICAgICBtb2RpZnlMZXZlbE1heDogLTEsXG4gICAgICAgICAgICAgICAgY2FuRWRpdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2FuSW52aXRlOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH0sIFt1cGRhdGVSb29tUGVybWlzc2lvbnNdKTtcblxuICAgIHJldHVybiByb29tUGVybWlzc2lvbnM7XG59XG5cbmNvbnN0IFBvd2VyTGV2ZWxTZWN0aW9uOiBSZWFjdC5GQzx7XG4gICAgdXNlcjogVXNlcjtcbiAgICByb29tOiBSb29tO1xuICAgIHJvb21QZXJtaXNzaW9uczogSVJvb21QZXJtaXNzaW9ucztcbiAgICBwb3dlckxldmVsczogSVBvd2VyTGV2ZWxzQ29udGVudDtcbn0+ID0gKHt1c2VyLCByb29tLCByb29tUGVybWlzc2lvbnMsIHBvd2VyTGV2ZWxzfSkgPT4ge1xuICAgIGlmIChyb29tUGVybWlzc2lvbnMuY2FuRWRpdCkge1xuICAgICAgICByZXR1cm4gKDxQb3dlckxldmVsRWRpdG9yIHVzZXI9e3VzZXJ9IHJvb209e3Jvb219IHJvb21QZXJtaXNzaW9ucz17cm9vbVBlcm1pc3Npb25zfSAvPik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcG93ZXJMZXZlbFVzZXJzRGVmYXVsdCA9IHBvd2VyTGV2ZWxzLnVzZXJzX2RlZmF1bHQgfHwgMDtcbiAgICAgICAgY29uc3QgcG93ZXJMZXZlbCA9IHBhcnNlSW50KHVzZXIucG93ZXJMZXZlbCwgMTApO1xuICAgICAgICBjb25zdCByb2xlID0gdGV4dHVhbFBvd2VyTGV2ZWwocG93ZXJMZXZlbCwgcG93ZXJMZXZlbFVzZXJzRGVmYXVsdCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3Byb2ZpbGVGaWVsZFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fcm9sZURlc2NyaXB0aW9uXCI+e3JvbGV9PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59O1xuXG5jb25zdCBQb3dlckxldmVsRWRpdG9yOiBSZWFjdC5GQzx7XG4gICAgdXNlcjogVXNlcjtcbiAgICByb29tOiBSb29tO1xuICAgIHJvb21QZXJtaXNzaW9uczogSVJvb21QZXJtaXNzaW9ucztcbn0+ID0gKHt1c2VyLCByb29tLCByb29tUGVybWlzc2lvbnN9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IFtzZWxlY3RlZFBvd2VyTGV2ZWwsIHNldFNlbGVjdGVkUG93ZXJMZXZlbF0gPSB1c2VTdGF0ZShwYXJzZUludCh1c2VyLnBvd2VyTGV2ZWwsIDEwKSk7XG4gICAgY29uc3Qgb25Qb3dlckNoYW5nZSA9IHVzZUNhbGxiYWNrKGFzeW5jIChwb3dlckxldmVsU3RyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgcG93ZXJMZXZlbCA9IHBhcnNlSW50KHBvd2VyTGV2ZWxTdHIsIDEwKTtcbiAgICAgICAgc2V0U2VsZWN0ZWRQb3dlckxldmVsKHBvd2VyTGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IGFwcGx5UG93ZXJDaGFuZ2UgPSAocm9vbUlkLCB0YXJnZXQsIHBvd2VyTGV2ZWwsIHBvd2VyTGV2ZWxFdmVudCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNsaS5zZXRQb3dlckxldmVsKHJvb21JZCwgdGFyZ2V0LCBwYXJzZUludChwb3dlckxldmVsKSwgcG93ZXJMZXZlbEV2ZW50KS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOTy1PUDsgcmVseSBvbiB0aGUgbS5yb29tLm1lbWJlciBldmVudCBjb21pbmcgZG93biBlbHNlIHdlIGNvdWxkXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCBvdXQgb2Ygc3luYyBpZiB3ZSBmb3JjZSBzZXRTdGF0ZSBoZXJlIVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBvd2VyIGNoYW5nZSBzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNoYW5nZSBwb3dlciBsZXZlbCBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byBjaGFuZ2UgcG93ZXIgbGV2ZWwnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiRmFpbGVkIHRvIGNoYW5nZSBwb3dlciBsZXZlbFwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdXNlci5yb29tSWQ7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHVzZXIudXNlcklkO1xuXG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKCFwb3dlckxldmVsRXZlbnQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBteVVzZXJJZCA9IGNsaS5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgbXlQb3dlciA9IHBvd2VyTGV2ZWxFdmVudC5nZXRDb250ZW50KCkudXNlcnNbbXlVc2VySWRdO1xuICAgICAgICBpZiAobXlQb3dlciAmJiBwYXJzZUludChteVBvd2VyKSA9PT0gcG93ZXJMZXZlbCkge1xuICAgICAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1Byb21vdGUgdG8gUEwxMDAgV2FybmluZycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIldhcm5pbmchXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIllvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIHVuZG8gdGhpcyBjaGFuZ2UgYXMgeW91IGFyZSBwcm9tb3RpbmcgdGhlIHVzZXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG8gaGF2ZSB0aGUgc2FtZSBwb3dlciBsZXZlbCBhcyB5b3Vyc2VsZi5cIikgfTxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkFyZSB5b3Ugc3VyZT9cIikgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdChcIkNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IFtjb25maXJtZWRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICBpZiAoIWNvbmZpcm1lZCkgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKG15VXNlcklkID09PSB0YXJnZXQpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGFyZSBjaGFuZ2luZyBvdXIgb3duIFBMIGl0IGNhbiBvbmx5IGV2ZXIgYmUgZGVjcmVhc2luZywgd2hpY2ggd2UgY2Fubm90IHJldmVyc2UuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghKGF3YWl0IHdhcm5TZWxmRGVtb3RlKCkpKSByZXR1cm47XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byB3YXJuIGFib3V0IHNlbGYgZGVtb3Rpb246IFwiLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGFwcGx5UG93ZXJDaGFuZ2Uocm9vbUlkLCB0YXJnZXQsIHBvd2VyTGV2ZWwsIHBvd2VyTGV2ZWxFdmVudCk7XG4gICAgfSwgW3VzZXIucm9vbUlkLCB1c2VyLnVzZXJJZCwgY2xpLCByb29tXSk7XG5cbiAgICBjb25zdCBwb3dlckxldmVsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIiwgXCJcIik7XG4gICAgY29uc3QgcG93ZXJMZXZlbFVzZXJzRGVmYXVsdCA9IHBvd2VyTGV2ZWxFdmVudCA/IHBvd2VyTGV2ZWxFdmVudC5nZXRDb250ZW50KCkudXNlcnNfZGVmYXVsdCA6IDA7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3Byb2ZpbGVGaWVsZFwiPlxuICAgICAgICAgICAgPFBvd2VyU2VsZWN0b3JcbiAgICAgICAgICAgICAgICBsYWJlbD17bnVsbH1cbiAgICAgICAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWRQb3dlckxldmVsfVxuICAgICAgICAgICAgICAgIG1heFZhbHVlPXtyb29tUGVybWlzc2lvbnMubW9kaWZ5TGV2ZWxNYXh9XG4gICAgICAgICAgICAgICAgdXNlcnNEZWZhdWx0PXtwb3dlckxldmVsVXNlcnNEZWZhdWx0fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtvblBvd2VyQ2hhbmdlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VEZXZpY2VzID0gKHVzZXJJZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIC8vIHVuZGVmaW5lZCBtZWFucyB5ZXQgdG8gYmUgbG9hZGVkLCBudWxsIG1lYW5zIGZhaWxlZCB0byBsb2FkLCBvdGhlcndpc2UgbGlzdCBvZiBkZXZpY2VzXG4gICAgY29uc3QgW2RldmljZXMsIHNldERldmljZXNdID0gdXNlU3RhdGUodW5kZWZpbmVkKTtcbiAgICAvLyBEb3dubG9hZCBkZXZpY2UgbGlzdHNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXREZXZpY2VzKHVuZGVmaW5lZCk7XG5cbiAgICAgICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlO1xuXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkRGV2aWNlTGlzdCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpLmRvd25sb2FkS2V5cyhbdXNlcklkXSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlcyA9IGNsaS5nZXRTdG9yZWREZXZpY2VzRm9yVXNlcih1c2VySWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBnb3QgY2FuY2VsbGVkIC0gcHJlc3VtYWJseSBhIGRpZmZlcmVudCB1c2VyIG5vd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGlzYW1iaWd1YXRlRGV2aWNlcyhkZXZpY2VzKTtcbiAgICAgICAgICAgICAgICBzZXREZXZpY2VzKGRldmljZXMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgc2V0RGV2aWNlcyhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkb3dubG9hZERldmljZUxpc3QoKTtcblxuICAgICAgICAvLyBIYW5kbGUgYmVpbmcgdW5tb3VudGVkXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICB9O1xuICAgIH0sIFtjbGksIHVzZXJJZF0pO1xuXG4gICAgLy8gTGlzdGVuIHRvIGNoYW5nZXNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsZXQgY2FuY2VsID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHVwZGF0ZURldmljZXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdEZXZpY2VzID0gY2xpLmdldFN0b3JlZERldmljZXNGb3JVc2VyKHVzZXJJZCk7XG4gICAgICAgICAgICBpZiAoY2FuY2VsKSByZXR1cm47XG4gICAgICAgICAgICBzZXREZXZpY2VzKG5ld0RldmljZXMpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBvbkRldmljZXNVcGRhdGVkID0gKHVzZXJzKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXVzZXJzLmluY2x1ZGVzKHVzZXJJZCkpIHJldHVybjtcbiAgICAgICAgICAgIHVwZGF0ZURldmljZXMoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkID0gKF91c2VySWQsIGRldmljZSkgPT4ge1xuICAgICAgICAgICAgaWYgKF91c2VySWQgIT09IHVzZXJJZCkgcmV0dXJuO1xuICAgICAgICAgICAgdXBkYXRlRGV2aWNlcygpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBvblVzZXJUcnVzdFN0YXR1c0NoYW5nZWQgPSAoX3VzZXJJZCwgdHJ1c3RTdGF0dXMpID0+IHtcbiAgICAgICAgICAgIGlmIChfdXNlcklkICE9PSB1c2VySWQpIHJldHVybjtcbiAgICAgICAgICAgIHVwZGF0ZURldmljZXMoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY2xpLm9uKFwiY3J5cHRvLmRldmljZXNVcGRhdGVkXCIsIG9uRGV2aWNlc1VwZGF0ZWQpO1xuICAgICAgICBjbGkub24oXCJkZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkXCIsIG9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgIGNsaS5vbihcInVzZXJUcnVzdFN0YXR1c0NoYW5nZWRcIiwgb25Vc2VyVHJ1c3RTdGF0dXNDaGFuZ2VkKTtcbiAgICAgICAgLy8gSGFuZGxlIGJlaW5nIHVubW91bnRlZFxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2FuY2VsID0gdHJ1ZTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihcImNyeXB0by5kZXZpY2VzVXBkYXRlZFwiLCBvbkRldmljZXNVcGRhdGVkKTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihcImRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWRcIiwgb25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihcInVzZXJUcnVzdFN0YXR1c0NoYW5nZWRcIiwgb25Vc2VyVHJ1c3RTdGF0dXNDaGFuZ2VkKTtcbiAgICAgICAgfTtcbiAgICB9LCBbY2xpLCB1c2VySWRdKTtcblxuICAgIHJldHVybiBkZXZpY2VzO1xufTtcblxuY29uc3QgQmFzaWNVc2VySW5mbzogUmVhY3QuRkM8e1xuICAgIHJvb206IFJvb207XG4gICAgbWVtYmVyOiBVc2VyIHwgUm9vbU1lbWJlcjtcbiAgICBncm91cElkOiBzdHJpbmc7XG4gICAgZGV2aWNlczogSURldmljZVtdO1xuICAgIGlzUm9vbUVuY3J5cHRlZDogYm9vbGVhbjtcbn0+ID0gKHtyb29tLCBtZW1iZXIsIGdyb3VwSWQsIGRldmljZXMsIGlzUm9vbUVuY3J5cHRlZH0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgY29uc3QgcG93ZXJMZXZlbHMgPSB1c2VSb29tUG93ZXJMZXZlbHMoY2xpLCByb29tKTtcbiAgICAvLyBMb2FkIHdoZXRoZXIgb3Igbm90IHdlIGFyZSBhIFN5bmFwc2UgQWRtaW5cbiAgICBjb25zdCBpc1N5bmFwc2VBZG1pbiA9IHVzZUlzU3luYXBzZUFkbWluKGNsaSk7XG5cbiAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSB1c2VyIGlzIGlnbm9yZWRcbiAgICBjb25zdCBbaXNJZ25vcmVkLCBzZXRJc0lnbm9yZWRdID0gdXNlU3RhdGUoY2xpLmlzVXNlcklnbm9yZWQobWVtYmVyLnVzZXJJZCkpO1xuICAgIC8vIFJlY2hlY2sgaWYgdGhlIHVzZXIgb3IgY2xpZW50IGNoYW5nZXNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRJc0lnbm9yZWQoY2xpLmlzVXNlcklnbm9yZWQobWVtYmVyLnVzZXJJZCkpO1xuICAgIH0sIFtjbGksIG1lbWJlci51c2VySWRdKTtcbiAgICAvLyBSZWNoZWNrIGFsc28gaWYgd2UgcmVjZWl2ZSBuZXcgYWNjb3VudERhdGEgbS5pZ25vcmVkX3VzZXJfbGlzdFxuICAgIGNvbnN0IGFjY291bnREYXRhSGFuZGxlciA9IHVzZUNhbGxiYWNrKChldikgPT4ge1xuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpID09PSBcIm0uaWdub3JlZF91c2VyX2xpc3RcIikge1xuICAgICAgICAgICAgc2V0SXNJZ25vcmVkKGNsaS5pc1VzZXJJZ25vcmVkKG1lbWJlci51c2VySWQpKTtcbiAgICAgICAgfVxuICAgIH0sIFtjbGksIG1lbWJlci51c2VySWRdKTtcbiAgICB1c2VFdmVudEVtaXR0ZXIoY2xpLCBcImFjY291bnREYXRhXCIsIGFjY291bnREYXRhSGFuZGxlcik7XG5cbiAgICAvLyBDb3VudCBvZiBob3cgbWFueSBvcGVyYXRpb25zIGFyZSBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MsIGlmID4gMCB0aGVuIHNob3cgYSBTcGlubmVyXG4gICAgY29uc3QgW3BlbmRpbmdVcGRhdGVDb3VudCwgc2V0UGVuZGluZ1VwZGF0ZUNvdW50XSA9IHVzZVN0YXRlKDApO1xuICAgIGNvbnN0IHN0YXJ0VXBkYXRpbmcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFBlbmRpbmdVcGRhdGVDb3VudChwZW5kaW5nVXBkYXRlQ291bnQgKyAxKTtcbiAgICB9LCBbcGVuZGluZ1VwZGF0ZUNvdW50XSk7XG4gICAgY29uc3Qgc3RvcFVwZGF0aW5nID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRQZW5kaW5nVXBkYXRlQ291bnQocGVuZGluZ1VwZGF0ZUNvdW50IC0gMSk7XG4gICAgfSwgW3BlbmRpbmdVcGRhdGVDb3VudF0pO1xuXG4gICAgY29uc3Qgcm9vbVBlcm1pc3Npb25zID0gdXNlUm9vbVBlcm1pc3Npb25zKGNsaSwgcm9vbSwgbWVtYmVyKTtcblxuICAgIGNvbnN0IG9uU3luYXBzZURlYWN0aXZhdGUgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTeW5hcHNlIFVzZXIgRGVhY3RpdmF0aW9uJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJEZWFjdGl2YXRlIHVzZXI/XCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgPGRpdj57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkRlYWN0aXZhdGluZyB0aGlzIHVzZXIgd2lsbCBsb2cgdGhlbSBvdXQgYW5kIHByZXZlbnQgdGhlbSBmcm9tIGxvZ2dpbmcgYmFjayBpbi4gQWRkaXRpb25hbGx5LCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwidGhleSB3aWxsIGxlYXZlIGFsbCB0aGUgcm9vbXMgdGhleSBhcmUgaW4uIFRoaXMgYWN0aW9uIGNhbm5vdCBiZSByZXZlcnNlZC4gQXJlIHlvdSBzdXJlIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwid2FudCB0byBkZWFjdGl2YXRlIHRoaXMgdXNlcj9cIixcbiAgICAgICAgICAgICAgICApIH08L2Rpdj4sXG4gICAgICAgICAgICBidXR0b246IF90KFwiRGVhY3RpdmF0ZSB1c2VyXCIpLFxuICAgICAgICAgICAgZGFuZ2VyOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBbYWNjZXB0ZWRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgIGlmICghYWNjZXB0ZWQpIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGNsaS5kZWFjdGl2YXRlU3luYXBzZVVzZXIobWVtYmVyLnVzZXJJZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBkZWFjdGl2YXRlIHVzZXJcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG5cbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byBkZWFjdGl2YXRlIFN5bmFwc2UgdXNlcicsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRmFpbGVkIHRvIGRlYWN0aXZhdGUgdXNlcicpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtjbGksIG1lbWJlci51c2VySWRdKTtcblxuICAgIGxldCBzeW5hcHNlRGVhY3RpdmF0ZUJ1dHRvbjtcbiAgICBsZXQgc3Bpbm5lcjtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgYSBwZXJmZWN0IGNoZWNrIGhlcmUsIGp1c3Qgc29tZXRoaW5nIHRvIHBhc3MgYXMgXCJwcm9iYWJseSBub3Qgb3VyIGhvbWVzZXJ2ZXJcIi4gSWZcbiAgICAvLyBzb21lb25lIGRvZXMgZmlndXJlIG91dCBob3cgdG8gYnlwYXNzIHRoaXMgY2hlY2sgdGhlIHdvcnN0IHRoYXQgaGFwcGVucyBpcyBhbiBlcnJvci5cbiAgICAvLyBGSVhNRSB0aGlzIHNob3VsZCBiZSB1c2luZyBjbGkgaW5zdGVhZCBvZiBNYXRyaXhDbGllbnRQZWcubWF0cml4Q2xpZW50XG4gICAgaWYgKGlzU3luYXBzZUFkbWluICYmIG1lbWJlci51c2VySWQuZW5kc1dpdGgoYDoke01hdHJpeENsaWVudFBlZy5nZXRIb21lc2VydmVyTmFtZSgpfWApKSB7XG4gICAgICAgIHN5bmFwc2VEZWFjdGl2YXRlQnV0dG9uID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25TeW5hcHNlRGVhY3RpdmF0ZX0gY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZmllbGQgbXhfVXNlckluZm9fZGVzdHJ1Y3RpdmVcIj5cbiAgICAgICAgICAgICAgICB7X3QoXCJEZWFjdGl2YXRlIHVzZXJcIil9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGFkbWluVG9vbHNDb250YWluZXI7XG4gICAgaWYgKHJvb20gJiYgbWVtYmVyLnJvb21JZCkge1xuICAgICAgICBhZG1pblRvb2xzQ29udGFpbmVyID0gKFxuICAgICAgICAgICAgPFJvb21BZG1pblRvb2xzQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgcG93ZXJMZXZlbHM9e3Bvd2VyTGV2ZWxzfVxuICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyfVxuICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgc3RhcnRVcGRhdGluZz17c3RhcnRVcGRhdGluZ31cbiAgICAgICAgICAgICAgICBzdG9wVXBkYXRpbmc9e3N0b3BVcGRhdGluZ30+XG4gICAgICAgICAgICAgICAgeyBzeW5hcHNlRGVhY3RpdmF0ZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L1Jvb21BZG1pblRvb2xzQ29udGFpbmVyPlxuICAgICAgICApO1xuICAgIH0gZWxzZSBpZiAoZ3JvdXBJZCkge1xuICAgICAgICBhZG1pblRvb2xzQ29udGFpbmVyID0gKFxuICAgICAgICAgICAgPEdyb3VwQWRtaW5Ub29sc1NlY3Rpb25cbiAgICAgICAgICAgICAgICBncm91cElkPXtncm91cElkfVxuICAgICAgICAgICAgICAgIGdyb3VwTWVtYmVyPXttZW1iZXJ9XG4gICAgICAgICAgICAgICAgc3RhcnRVcGRhdGluZz17c3RhcnRVcGRhdGluZ31cbiAgICAgICAgICAgICAgICBzdG9wVXBkYXRpbmc9e3N0b3BVcGRhdGluZ30+XG4gICAgICAgICAgICAgICAgeyBzeW5hcHNlRGVhY3RpdmF0ZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L0dyb3VwQWRtaW5Ub29sc1NlY3Rpb24+XG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzeW5hcHNlRGVhY3RpdmF0ZUJ1dHRvbikge1xuICAgICAgICBhZG1pblRvb2xzQ29udGFpbmVyID0gKFxuICAgICAgICAgICAgPEdlbmVyaWNBZG1pblRvb2xzQ29udGFpbmVyPlxuICAgICAgICAgICAgICAgIHsgc3luYXBzZURlYWN0aXZhdGVCdXR0b24gfVxuICAgICAgICAgICAgPC9HZW5lcmljQWRtaW5Ub29sc0NvbnRhaW5lcj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAocGVuZGluZ1VwZGF0ZUNvdW50ID4gMCkge1xuICAgICAgICBzcGlubmVyID0gPFNwaW5uZXIgaW1nQ2xhc3NOYW1lPVwibXhfQ29udGV4dHVhbE1lbnVfc3Bpbm5lclwiIC8+O1xuICAgIH1cblxuICAgIGxldCBtZW1iZXJEZXRhaWxzO1xuICAgIC8vIGhpZGUgdGhlIFJvbGVzIHNlY3Rpb24gZm9yIERNcyBhcyBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdGhlcmVcbiAgICBpZiAocm9vbSAmJiBtZW1iZXIucm9vbUlkICYmICFETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKG1lbWJlci5yb29tSWQpKSB7XG4gICAgICAgIG1lbWJlckRldGFpbHMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGgzPnsgX3QoXCJSb2xlXCIpIH08L2gzPlxuICAgICAgICAgICAgPFBvd2VyTGV2ZWxTZWN0aW9uXG4gICAgICAgICAgICAgICAgcG93ZXJMZXZlbHM9e3Bvd2VyTGV2ZWxzfVxuICAgICAgICAgICAgICAgIHVzZXI9e21lbWJlcn1cbiAgICAgICAgICAgICAgICByb29tPXtyb29tfVxuICAgICAgICAgICAgICAgIHJvb21QZXJtaXNzaW9ucz17cm9vbVBlcm1pc3Npb25zfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIC8vIG9ubHkgZGlzcGxheSB0aGUgZGV2aWNlcyBsaXN0IGlmIG91ciBjbGllbnQgc3VwcG9ydHMgRTJFXG4gICAgY29uc3QgY3J5cHRvRW5hYmxlZCA9IGNsaS5pc0NyeXB0b0VuYWJsZWQoKTtcblxuICAgIGxldCB0ZXh0O1xuICAgIGlmICghaXNSb29tRW5jcnlwdGVkKSB7XG4gICAgICAgIGlmICghY3J5cHRvRW5hYmxlZCkge1xuICAgICAgICAgICAgdGV4dCA9IF90KFwiVGhpcyBjbGllbnQgZG9lcyBub3Qgc3VwcG9ydCBlbmQtdG8tZW5kIGVuY3J5cHRpb24uXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIHRleHQgPSBfdChcIk1lc3NhZ2VzIGluIHRoaXMgcm9vbSBhcmUgbm90IGVuZC10by1lbmQgZW5jcnlwdGVkLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRPRE8gd2hhdCB0byByZW5kZXIgZm9yIEdyb3VwTWVtYmVyXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gX3QoXCJNZXNzYWdlcyBpbiB0aGlzIHJvb20gYXJlIGVuZC10by1lbmQgZW5jcnlwdGVkLlwiKTtcbiAgICB9XG5cbiAgICBsZXQgdmVyaWZ5QnV0dG9uO1xuICAgIGNvbnN0IGhvbWVzZXJ2ZXJTdXBwb3J0c0Nyb3NzU2lnbmluZyA9IHVzZUhvbWVzZXJ2ZXJTdXBwb3J0c0Nyb3NzU2lnbmluZyhjbGkpO1xuXG4gICAgY29uc3QgdXNlclRydXN0ID0gY3J5cHRvRW5hYmxlZCAmJiBjbGkuY2hlY2tVc2VyVHJ1c3QobWVtYmVyLnVzZXJJZCk7XG4gICAgY29uc3QgdXNlclZlcmlmaWVkID0gY3J5cHRvRW5hYmxlZCAmJiB1c2VyVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpO1xuICAgIGNvbnN0IGlzTWUgPSBtZW1iZXIudXNlcklkID09PSBjbGkuZ2V0VXNlcklkKCk7XG4gICAgY29uc3QgY2FuVmVyaWZ5ID0gY3J5cHRvRW5hYmxlZCAmJiBob21lc2VydmVyU3VwcG9ydHNDcm9zc1NpZ25pbmcgJiYgIXVzZXJWZXJpZmllZCAmJiAhaXNNZSAmJlxuICAgICAgICBkZXZpY2VzICYmIGRldmljZXMubGVuZ3RoID4gMDtcblxuICAgIGNvbnN0IHNldFVwZGF0aW5nID0gKHVwZGF0aW5nKSA9PiB7XG4gICAgICAgIHNldFBlbmRpbmdVcGRhdGVDb3VudChjb3VudCA9PiBjb3VudCArICh1cGRhdGluZyA/IDEgOiAtMSkpO1xuICAgIH07XG4gICAgY29uc3QgaGFzQ3Jvc3NTaWduaW5nS2V5cyA9XG4gICAgICAgIHVzZUhhc0Nyb3NzU2lnbmluZ0tleXMoY2xpLCBtZW1iZXIsIGNhblZlcmlmeSwgc2V0VXBkYXRpbmcgKTtcblxuICAgIGNvbnN0IHNob3dEZXZpY2VMaXN0U3Bpbm5lciA9IGRldmljZXMgPT09IHVuZGVmaW5lZDtcbiAgICBpZiAoY2FuVmVyaWZ5KSB7XG4gICAgICAgIGlmIChoYXNDcm9zc1NpZ25pbmdLZXlzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIE5vdGU6IG14X1VzZXJJbmZvX3ZlcmlmeUJ1dHRvbiBpcyBmb3IgdGhlIGVuZC10by1lbmQgdGVzdHNcbiAgICAgICAgICAgIHZlcmlmeUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZCBteF9Vc2VySW5mb192ZXJpZnlCdXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNDcm9zc1NpZ25pbmdLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZnlVc2VyKG1lbWJlcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWdhY3lWZXJpZnlVc2VyKG1lbWJlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAge190KFwiVmVyaWZ5XCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXNob3dEZXZpY2VMaXN0U3Bpbm5lcikge1xuICAgICAgICAgICAgLy8gSEFDSzogb25seSBzaG93IGEgc3Bpbm5lciBpZiB0aGUgZGV2aWNlIHNlY3Rpb24gc3Bpbm5lciBpcyBub3Qgc2hvd24sXG4gICAgICAgICAgICAvLyB0byBhdm9pZCBzaG93aW5nIGEgZG91YmxlIHNwaW5uZXJcbiAgICAgICAgICAgIC8vIFdlIHNob3VsZCBhc2sgZm9yIGEgZGVzaWduIHRoYXQgaW5jbHVkZXMgYWxsIHRoZSBkaWZmZXJlbnQgbG9hZGluZyBzdGF0ZXMgaGVyZVxuICAgICAgICAgICAgdmVyaWZ5QnV0dG9uID0gPFNwaW5uZXIgLz47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzZWN1cml0eVNlY3Rpb24gPSAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8aDM+eyBfdChcIlNlY3VyaXR5XCIpIH08L2gzPlxuICAgICAgICAgICAgPHA+eyB0ZXh0IH08L3A+XG4gICAgICAgICAgICB7IHZlcmlmeUJ1dHRvbiB9XG4gICAgICAgICAgICB7IGNyeXB0b0VuYWJsZWQgJiYgPERldmljZXNTZWN0aW9uXG4gICAgICAgICAgICAgICAgbG9hZGluZz17c2hvd0RldmljZUxpc3RTcGlubmVyfVxuICAgICAgICAgICAgICAgIGRldmljZXM9e2RldmljZXN9XG4gICAgICAgICAgICAgICAgdXNlcklkPXttZW1iZXIudXNlcklkfSAvPiB9XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICB7IG1lbWJlckRldGFpbHMgfVxuXG4gICAgICAgIHsgc2VjdXJpdHlTZWN0aW9uIH1cbiAgICAgICAgPFVzZXJPcHRpb25zU2VjdGlvblxuICAgICAgICAgICAgY2FuSW52aXRlPXtyb29tUGVybWlzc2lvbnMuY2FuSW52aXRlfVxuICAgICAgICAgICAgaXNJZ25vcmVkPXtpc0lnbm9yZWR9XG4gICAgICAgICAgICBtZW1iZXI9e21lbWJlcn0gLz5cblxuICAgICAgICB7IGFkbWluVG9vbHNDb250YWluZXIgfVxuXG4gICAgICAgIHsgc3Bpbm5lciB9XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG59O1xuXG50eXBlIE1lbWJlciA9IFVzZXIgfCBSb29tTWVtYmVyIHwgR3JvdXBNZW1iZXI7XG5cbmNvbnN0IFVzZXJJbmZvSGVhZGVyOiBSZWFjdC5GQzx7XG4gICAgbWVtYmVyOiBNZW1iZXI7XG4gICAgZTJlU3RhdHVzOiBFMkVTdGF0dXM7XG59PiA9ICh7bWVtYmVyLCBlMmVTdGF0dXN9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IG9uTWVtYmVyQXZhdGFyQ2xpY2sgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGF2YXRhclVybCA9IG1lbWJlci5nZXRNeGNBdmF0YXJVcmwgPyBtZW1iZXIuZ2V0TXhjQXZhdGFyVXJsKCkgOiBtZW1iZXIuYXZhdGFyVXJsO1xuICAgICAgICBpZiAoIWF2YXRhclVybCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGh0dHBVcmwgPSBjbGkubXhjVXJsVG9IdHRwKGF2YXRhclVybCk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgIHNyYzogaHR0cFVybCxcbiAgICAgICAgICAgIG5hbWU6IG1lbWJlci5uYW1lLFxuICAgICAgICB9O1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhJbWFnZVZpZXcsIHBhcmFtcywgXCJteF9EaWFsb2dfbGlnaHRib3hcIik7XG4gICAgfSwgW2NsaSwgbWVtYmVyXSk7XG5cbiAgICBjb25zdCBhdmF0YXJFbGVtZW50ID0gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2F2YXRhclwiPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8TWVtYmVyQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e21lbWJlci51c2VySWR9IC8vIHRvIGluc3RhbnRseSBibGFuayB0aGUgYXZhdGFyIHdoZW4gVXNlckluZm8gY2hhbmdlcyBtZW1iZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXI9e21lbWJlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXsyICogMC4zICogd2luZG93LmlubmVySGVpZ2h0fSAvLyAyeEAzMHZoXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezIgKiAwLjMgKiB3aW5kb3cuaW5uZXJIZWlnaHR9IC8vIDJ4QDMwdmhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2l6ZU1ldGhvZD1cInNjYWxlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrVXNlcklkPXttZW1iZXIudXNlcklkfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25NZW1iZXJBdmF0YXJDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIHVybHM9e21lbWJlci5hdmF0YXJVcmwgPyBbbWVtYmVyLmF2YXRhclVybF0gOiB1bmRlZmluZWR9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcblxuICAgIGxldCBwcmVzZW5jZVN0YXRlO1xuICAgIGxldCBwcmVzZW5jZUxhc3RBY3RpdmVBZ287XG4gICAgbGV0IHByZXNlbmNlQ3VycmVudGx5QWN0aXZlO1xuICAgIGxldCBzdGF0dXNNZXNzYWdlO1xuXG4gICAgaWYgKG1lbWJlciBpbnN0YW5jZW9mIFJvb21NZW1iZXIgJiYgbWVtYmVyLnVzZXIpIHtcbiAgICAgICAgcHJlc2VuY2VTdGF0ZSA9IG1lbWJlci51c2VyLnByZXNlbmNlO1xuICAgICAgICBwcmVzZW5jZUxhc3RBY3RpdmVBZ28gPSBtZW1iZXIudXNlci5sYXN0QWN0aXZlQWdvO1xuICAgICAgICBwcmVzZW5jZUN1cnJlbnRseUFjdGl2ZSA9IG1lbWJlci51c2VyLmN1cnJlbnRseUFjdGl2ZTtcblxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfY3VzdG9tX3N0YXR1c1wiKSkge1xuICAgICAgICAgICAgc3RhdHVzTWVzc2FnZSA9IG1lbWJlci51c2VyLl91bnN0YWJsZV9zdGF0dXNNZXNzYWdlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlUHJlc2VuY2VCeUhzVXJsID0gU2RrQ29uZmlnLmdldCgpW1wiZW5hYmxlX3ByZXNlbmNlX2J5X2hzX3VybFwiXTtcbiAgICBsZXQgc2hvd1ByZXNlbmNlID0gdHJ1ZTtcbiAgICBpZiAoZW5hYmxlUHJlc2VuY2VCeUhzVXJsICYmIGVuYWJsZVByZXNlbmNlQnlIc1VybFtjbGkuYmFzZVVybF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzaG93UHJlc2VuY2UgPSBlbmFibGVQcmVzZW5jZUJ5SHNVcmxbY2xpLmJhc2VVcmxdO1xuICAgIH1cblxuICAgIGxldCBwcmVzZW5jZUxhYmVsID0gbnVsbDtcbiAgICBpZiAoc2hvd1ByZXNlbmNlKSB7XG4gICAgICAgIHByZXNlbmNlTGFiZWwgPSAoXG4gICAgICAgICAgICA8UHJlc2VuY2VMYWJlbFxuICAgICAgICAgICAgICAgIGFjdGl2ZUFnbz17cHJlc2VuY2VMYXN0QWN0aXZlQWdvfVxuICAgICAgICAgICAgICAgIGN1cnJlbnRseUFjdGl2ZT17cHJlc2VuY2VDdXJyZW50bHlBY3RpdmV9XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VTdGF0ZT17cHJlc2VuY2VTdGF0ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHN0YXR1c0xhYmVsID0gbnVsbDtcbiAgICBpZiAoc3RhdHVzTWVzc2FnZSkge1xuICAgICAgICBzdGF0dXNMYWJlbCA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3N0YXR1c01lc3NhZ2VcIj57IHN0YXR1c01lc3NhZ2UgfTwvc3Bhbj47XG4gICAgfVxuXG4gICAgbGV0IGUyZUljb247XG4gICAgaWYgKGUyZVN0YXR1cykge1xuICAgICAgICBlMmVJY29uID0gPEUyRUljb24gc2l6ZT17MTh9IHN0YXR1cz17ZTJlU3RhdHVzfSBpc1VzZXI9e3RydWV9IC8+O1xuICAgIH1cblxuICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gbWVtYmVyLm5hbWUgfHwgbWVtYmVyLmRpc3BsYXluYW1lO1xuICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIHsgYXZhdGFyRWxlbWVudCB9XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXIgbXhfVXNlckluZm9fc2VwYXJhdG9yXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3Byb2ZpbGVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGUyZUljb24gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9e2Rpc3BsYXlOYW1lfSBhcmlhLWxhYmVsPXtkaXNwbGF5TmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBkaXNwbGF5TmFtZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57IG1lbWJlci51c2VySWQgfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fcHJvZmlsZVN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICB7cHJlc2VuY2VMYWJlbH1cbiAgICAgICAgICAgICAgICAgICAge3N0YXR1c0xhYmVsfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xufTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdXNlcjogTWVtYmVyO1xuICAgIGdyb3VwSWQ/OiBzdHJpbmc7XG4gICAgcm9vbT86IFJvb207XG4gICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm8gfCBSaWdodFBhbmVsUGhhc2VzLkdyb3VwTWVtYmVySW5mbztcbiAgICBvbkNsb3NlKCk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJUHJvcHNXaXRoRW5jcnlwdGlvblBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEVuY3J5cHRpb25QYW5lbD4ge1xuICAgIHVzZXI6IE1lbWJlcjtcbiAgICBncm91cElkOiB2b2lkO1xuICAgIHJvb206IFJvb207XG4gICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuRW5jcnlwdGlvblBhbmVsO1xuICAgIG9uQ2xvc2UoKTogdm9pZDtcbn1cblxudHlwZSBQcm9wcyA9IElQcm9wcyB8IElQcm9wc1dpdGhFbmNyeXB0aW9uUGFuZWw7XG5cbmNvbnN0IFVzZXJJbmZvOiBSZWFjdC5GQzxQcm9wcz4gPSAoe1xuICAgIHVzZXIsXG4gICAgZ3JvdXBJZCxcbiAgICByb29tLFxuICAgIG9uQ2xvc2UsXG4gICAgcGhhc2UgPSBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJJbmZvLFxuICAgIC4uLnByb3BzXG59KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIC8vIGZldGNoIGxhdGVzdCByb29tIG1lbWJlciBpZiB3ZSBoYXZlIGEgcm9vbSwgc28gd2UgZG9uJ3Qgc2hvdyBoaXN0b3JpY2FsIGluZm9ybWF0aW9uLCBmYWxsaW5nIGJhY2sgdG8gdXNlclxuICAgIGNvbnN0IG1lbWJlciA9IHVzZU1lbW8oKCkgPT4gcm9vbSA/IChyb29tLmdldE1lbWJlcih1c2VyLnVzZXJJZCkgfHwgdXNlcikgOiB1c2VyLCBbcm9vbSwgdXNlcl0pO1xuXG4gICAgY29uc3QgaXNSb29tRW5jcnlwdGVkID0gdXNlSXNFbmNyeXB0ZWQoY2xpLCByb29tKTtcbiAgICBjb25zdCBkZXZpY2VzID0gdXNlRGV2aWNlcyh1c2VyLnVzZXJJZCk7XG5cbiAgICBsZXQgZTJlU3RhdHVzO1xuICAgIGlmIChpc1Jvb21FbmNyeXB0ZWQgJiYgZGV2aWNlcykge1xuICAgICAgICBlMmVTdGF0dXMgPSBnZXRFMkVTdGF0dXMoY2xpLCB1c2VyLnVzZXJJZCwgZGV2aWNlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgY2xhc3NlcyA9IFtcIm14X1VzZXJJbmZvXCJdO1xuXG4gICAgbGV0IHJlZmlyZVBhcmFtcztcbiAgICBsZXQgcHJldmlvdXNQaGFzZTogUmlnaHRQYW5lbFBoYXNlcztcbiAgICAvLyBXZSBoYXZlIG5vIHByZXZpb3VzUGhhc2UgZm9yIHdoZW4gdmlld2luZyBhIFVzZXJJbmZvIGZyb20gYSBHcm91cCBvciB3aXRob3V0IGEgUm9vbSBhdCB0aGlzIHRpbWVcbiAgICBpZiAocm9vbSAmJiBwaGFzZSA9PT0gUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWwpIHtcbiAgICAgICAgcHJldmlvdXNQaGFzZSA9IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm87XG4gICAgICAgIHJlZmlyZVBhcmFtcyA9IHttZW1iZXI6IG1lbWJlcn07XG4gICAgfSBlbHNlIGlmIChyb29tKSB7XG4gICAgICAgIHByZXZpb3VzUGhhc2UgPSBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJMaXN0O1xuICAgIH1cblxuICAgIGNvbnN0IG9uRW5jcnlwdGlvblBhbmVsQ2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaDxTZXRSaWdodFBhbmVsUGhhc2VQYXlsb2FkPih7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TZXRSaWdodFBhbmVsUGhhc2UsXG4gICAgICAgICAgICBwaGFzZTogcHJldmlvdXNQaGFzZSxcbiAgICAgICAgICAgIHJlZmlyZVBhcmFtczogcmVmaXJlUGFyYW1zLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgY29udGVudDtcbiAgICBzd2l0Y2ggKHBoYXNlKSB7XG4gICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVySW5mbzpcbiAgICAgICAgY2FzZSBSaWdodFBhbmVsUGhhc2VzLkdyb3VwTWVtYmVySW5mbzpcbiAgICAgICAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgICAgICAgICAgPEJhc2ljVXNlckluZm9cbiAgICAgICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyPXttZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ9e2dyb3VwSWQgYXMgc3RyaW5nfVxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VzPXtkZXZpY2VzfVxuICAgICAgICAgICAgICAgICAgICBpc1Jvb21FbmNyeXB0ZWQ9e2lzUm9vbUVuY3J5cHRlZH0gLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbDpcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaChcIm14X1VzZXJJbmZvX3NtYWxsQXZhdGFyXCIpO1xuICAgICAgICAgICAgY29udGVudCA9IChcbiAgICAgICAgICAgICAgICA8RW5jcnlwdGlvblBhbmVsXG4gICAgICAgICAgICAgICAgICAgIHsuLi5wcm9wcyBhcyBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgRW5jcnlwdGlvblBhbmVsPn1cbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyPXttZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9e29uRW5jcnlwdGlvblBhbmVsQ2xvc2V9XG4gICAgICAgICAgICAgICAgICAgIGlzUm9vbUVuY3J5cHRlZD17aXNSb29tRW5jcnlwdGVkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbGV0IGNsb3NlTGFiZWwgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHBoYXNlID09PSBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbCkge1xuICAgICAgICBjb25zdCB2ZXJpZmljYXRpb25SZXF1ZXN0ID0gKHByb3BzIGFzIFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBFbmNyeXB0aW9uUGFuZWw+KS52ZXJpZmljYXRpb25SZXF1ZXN0O1xuICAgICAgICBpZiAodmVyaWZpY2F0aW9uUmVxdWVzdCAmJiB2ZXJpZmljYXRpb25SZXF1ZXN0LnBlbmRpbmcpIHtcbiAgICAgICAgICAgIGNsb3NlTGFiZWwgPSBfdChcIkNhbmNlbFwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGhlYWRlciA9IDxVc2VySW5mb0hlYWRlciBtZW1iZXI9e21lbWJlcn0gZTJlU3RhdHVzPXtlMmVTdGF0dXN9IC8+O1xuICAgIHJldHVybiA8QmFzZUNhcmRcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzLmpvaW4oXCIgXCIpfVxuICAgICAgICBoZWFkZXI9e2hlYWRlcn1cbiAgICAgICAgb25DbG9zZT17b25DbG9zZX1cbiAgICAgICAgY2xvc2VMYWJlbD17Y2xvc2VMYWJlbH1cbiAgICAgICAgcHJldmlvdXNQaGFzZT17cHJldmlvdXNQaGFzZX1cbiAgICAgICAgcmVmaXJlUGFyYW1zPXtyZWZpcmVQYXJhbXN9XG4gICAgPlxuICAgICAgICB7IGNvbnRlbnQgfVxuICAgIDwvQmFzZUNhcmQ+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVXNlckluZm87XG4iXX0=
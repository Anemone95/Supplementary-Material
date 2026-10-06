"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _RoomAvatar = _interopRequireDefault(require("../views/avatars/RoomAvatar"));

var _languageHandler = require("../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _RoomName = _interopRequireDefault(require("../views/elements/RoomName"));

var _RoomTopic = _interopRequireDefault(require("../views/elements/RoomTopic"));

var _InlineSpinner = _interopRequireDefault(require("../views/elements/InlineSpinner"));

var _RoomInvite = require("../../RoomInvite");

var _useRoomMembers = require("../../hooks/useRoomMembers");

var _createRoom = _interopRequireWildcard(require("../../createRoom"));

var _Field = _interopRequireDefault(require("../views/elements/Field"));

var _useEventEmitter = require("../../hooks/useEventEmitter");

var _Validation = _interopRequireDefault(require("../views/elements/Validation"));

var Email = _interopRequireWildcard(require("../../email"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _actions = require("../../dispatcher/actions");

var _MainSplit = _interopRequireDefault(require("./MainSplit"));

var _ErrorBoundary = _interopRequireDefault(require("../views/elements/ErrorBoundary"));

var _RightPanel = _interopRequireDefault(require("./RightPanel"));

var _RightPanelStore = _interopRequireDefault(require("../../stores/RightPanelStore"));

var _RightPanelStorePhases = require("../../stores/RightPanelStorePhases");

var _useStateArray = require("../../hooks/useStateArray");

var _SpacePublicShare = _interopRequireDefault(require("../views/spaces/SpacePublicShare"));

var _space = require("../../utils/space");

var _SpaceRoomDirectory = require("./SpaceRoomDirectory");

var _MemberAvatar = _interopRequireDefault(require("../views/avatars/MemberAvatar"));

var _useStateToggle = require("../../hooks/useStateToggle");

var _SpaceStore = _interopRequireDefault(require("../../stores/SpaceStore"));

var _FacePile = _interopRequireDefault(require("../views/elements/FacePile"));

var _AddExistingToSpaceDialog = require("../views/dialogs/AddExistingToSpaceDialog");

var _promise = require("../../utils/promise");

var _Permalinks = require("../../utils/permalinks/Permalinks");

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
var Phase;

(function (Phase) {
  Phase[Phase["Landing"] = 0] = "Landing";
  Phase[Phase["PublicCreateRooms"] = 1] = "PublicCreateRooms";
  Phase[Phase["PublicShare"] = 2] = "PublicShare";
  Phase[Phase["PrivateScope"] = 3] = "PrivateScope";
  Phase[Phase["PrivateInvite"] = 4] = "PrivateInvite";
  Phase[Phase["PrivateCreateRooms"] = 5] = "PrivateCreateRooms";
  Phase[Phase["PrivateExistingRooms"] = 6] = "PrivateExistingRooms";
})(Phase || (Phase = {}));

const RoomMemberCount = ({
  room,
  children
}) => {
  const members = (0, _useRoomMembers.useRoomMembers)(room);
  const count = members.length;
  if (children) return children(count);
  return count;
};

const useMyRoomMembership = (room
/*: Room*/
) => {
  const [membership, setMembership] = (0, _react.useState)(room.getMyMembership());
  (0, _useEventEmitter.useEventEmitter)(room, "Room.myMembership", () => {
    setMembership(room.getMyMembership());
  });
  return membership;
};

const SpaceInfo = ({
  space
}) => {
  const joinRule = space.getJoinRule();
  let visibilitySection;

  if (joinRule === "public") {
    visibilitySection = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SpaceRoomView_info_public"
    }, (0, _languageHandler._t)("Public space"));
  } else {
    visibilitySection = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SpaceRoomView_info_private"
    }, (0, _languageHandler._t)("Private space"));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_info"
  }, visibilitySection, joinRule === "public" && /*#__PURE__*/_react.default.createElement(RoomMemberCount, {
    room: space
  }, count => count > 0 ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    onClick: () => {
      _dispatcher.default.dispatch({
        action: _actions.Action.SetRightPanelPhase,
        phase: _RightPanelStorePhases.RightPanelPhases.RoomMemberList,
        refireParams: {
          space
        }
      });
    }
  }, (0, _languageHandler._t)("%(count)s members", {
    count
  })) : null));
};

const SpacePreview = ({
  space,
  onJoinButtonClicked,
  onRejectButtonClicked
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const myMembership = useMyRoomMembership(space);
  const [busy, setBusy] = (0, _react.useState)(false);
  let inviterSection;
  let joinButtons;

  if (myMembership === "invite") {
    const inviteSender = space.getMember(cli.getUserId())?.events.member?.getSender();
    const inviter = inviteSender && space.getMember(inviteSender);

    if (inviteSender) {
      inviterSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceRoomView_preview_inviter"
      }, /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
        member: inviter,
        width: 32,
        height: 32
      }), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceRoomView_preview_inviter_name"
      }, (0, _languageHandler._t)("<inviter/> invites you", {}, {
        inviter: () => /*#__PURE__*/_react.default.createElement("b", null, inviter.name || inviteSender)
      })), inviter ? /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceRoomView_preview_inviter_mxid"
      }, inviteSender) : null));
    }

    joinButtons = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "secondary",
      onClick: () => {
        setBusy(true);
        onRejectButtonClicked();
      }
    }, (0, _languageHandler._t)("Reject")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: () => {
        setBusy(true);
        onJoinButtonClicked();
      }
    }, (0, _languageHandler._t)("Accept")));
  } else {
    joinButtons = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: () => {
        setBusy(true);
        onJoinButtonClicked();
      }
    }, (0, _languageHandler._t)("Join"));
  }

  if (busy) {
    joinButtons = /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null);
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_preview"
  }, inviterSection, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
    room: space,
    height: 80,
    width: 80,
    viewAvatarOnClick: true
  }), /*#__PURE__*/_react.default.createElement("h1", {
    className: "mx_SpaceRoomView_preview_name"
  }, /*#__PURE__*/_react.default.createElement(_RoomName.default, {
    room: space
  })), /*#__PURE__*/_react.default.createElement(SpaceInfo, {
    space: space
  }), /*#__PURE__*/_react.default.createElement(_RoomTopic.default, {
    room: space
  }, (topic, ref) => /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_preview_topic",
    ref: ref
  }, topic)), space.getJoinRule() === "public" && /*#__PURE__*/_react.default.createElement(_FacePile.default, {
    room: space
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_preview_joinButtons"
  }, joinButtons));
};

const SpaceLanding = ({
  space
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const myMembership = useMyRoomMembership(space);
  const userId = cli.getUserId();
  let inviteButton;

  if (myMembership === "join" && space.canInvite(userId)) {
    inviteButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      className: "mx_SpaceRoomView_landing_inviteButton",
      onClick: () => {
        (0, _RoomInvite.showRoomInviteDialog)(space.roomId);
      }
    }, (0, _languageHandler._t)("Invite"));
  }

  const canAddRooms = myMembership === "join" && space.currentState.maySendStateEvent(_event.EventType.SpaceChild, userId);
  const [refreshToken, forceUpdate] = (0, _useStateToggle.useStateToggle)(false);
  let addRoomButtons;

  if (canAddRooms) {
    addRoomButtons = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_SpaceRoomView_landing_addButton",
      onClick: async () => {
        const [added] = await (0, _space.showAddExistingRooms)(cli, space);

        if (added) {
          forceUpdate();
        }
      }
    }, (0, _languageHandler._t)("Add existing rooms & spaces")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_SpaceRoomView_landing_createButton",
      onClick: () => {
        (0, _space.showCreateNewRoom)(cli, space);
      }
    }, (0, _languageHandler._t)("Create a new room")));
  }

  let settingsButton;

  if ((0, _space.shouldShowSpaceSettings)(cli, space)) {
    settingsButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_SpaceRoomView_landing_settingsButton",
      onClick: () => {
        (0, _space.showSpaceSettings)(cli, space);
      }
    }, (0, _languageHandler._t)("Settings"));
  }

  const onMembersClick = () => {
    _dispatcher.default.dispatch({
      action: _actions.Action.SetRightPanelPhase,
      phase: _RightPanelStorePhases.RightPanelPhases.RoomMemberList,
      refireParams: {
        space
      }
    });
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing"
  }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
    room: space,
    height: 80,
    width: 80,
    viewAvatarOnClick: true
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing_name"
  }, /*#__PURE__*/_react.default.createElement(_RoomName.default, {
    room: space
  }, name => {
    const tags = {
      name: () => /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceRoomView_landing_nameRow"
      }, /*#__PURE__*/_react.default.createElement("h1", null, name))
    };
    return (0, _languageHandler._t)("Welcome to <name/>", {}, tags);
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing_info"
  }, /*#__PURE__*/_react.default.createElement(SpaceInfo, {
    space: space
  }), /*#__PURE__*/_react.default.createElement(_FacePile.default, {
    room: space,
    onlyKnownUsers: false,
    numShown: 7,
    onClick: onMembersClick
  }), inviteButton), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing_topic"
  }, /*#__PURE__*/_react.default.createElement(_RoomTopic.default, {
    room: space
  })), /*#__PURE__*/_react.default.createElement("hr", null), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing_adminButtons"
  }, addRoomButtons, settingsButton), /*#__PURE__*/_react.default.createElement(_SpaceRoomDirectory.SpaceHierarchy, {
    space: space,
    showRoom: _SpaceRoomDirectory.showRoom,
    refreshToken: refreshToken
  }));
};

const SpaceSetupFirstRooms = ({
  space,
  title,
  description,
  onFinished
}) => {
  const [busy, setBusy] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)("");
  const numFields = 3;
  const placeholders = [(0, _languageHandler._t)("General"), (0, _languageHandler._t)("Random"), (0, _languageHandler._t)("Support")]; // TODO vary default prefills for "Just Me" spaces

  const [roomNames, setRoomName] = (0, _useStateArray.useStateArray)(numFields, [(0, _languageHandler._t)("General"), (0, _languageHandler._t)("Random"), ""]);
  const fields = new Array(numFields).fill(0).map((_, i) => {
    const name = "roomName" + i;
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      key: name,
      name: name,
      type: "text",
      label: (0, _languageHandler._t)("Room name"),
      placeholder: placeholders[i],
      value: roomNames[i],
      onChange: ev => setRoomName(i, ev.target.value),
      autoFocus: i === 2
    });
  });

  const onNextClick = async () => {
    setError("");
    setBusy(true);

    try {
      await Promise.all(roomNames.map(name => name.trim()).filter(Boolean).map(name => {
        return (0, _createRoom.default)({
          createOpts: {
            preset: space.getJoinRule() === "public" ? _createRoom.Preset.PublicChat : _createRoom.Preset.PrivateChat,
            name
          },
          spinner: false,
          encryption: false,
          andView: false,
          inlineErrors: true,
          parentSpace: space
        });
      }));
      onFinished();
    } catch (e) {
      console.error("Failed to create initial space rooms", e);
      setError((0, _languageHandler._t)("Failed to create initial space rooms"));
    }

    setBusy(false);
  };

  let onClick = onFinished;
  let buttonLabel = (0, _languageHandler._t)("Skip for now");

  if (roomNames.some(name => name.trim())) {
    onClick = onNextClick;
    buttonLabel = busy ? (0, _languageHandler._t)("Creating rooms...") : (0, _languageHandler._t)("Continue");
  }

  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h1", null, title), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, description), error && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_errorText"
  }, error), fields, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    disabled: busy,
    onClick: onClick
  }, buttonLabel)));
};

const SpaceAddExistingRooms = ({
  space,
  onFinished
}) => {
  const [selectedToAdd, setSelectedToAdd] = (0, _react.useState)(new Set());
  const [busy, setBusy] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)("");
  let onClick = onFinished;
  let buttonLabel = (0, _languageHandler._t)("Skip for now");

  if (selectedToAdd.size > 0) {
    onClick = async () => {
      // TODO rate limiting
      setBusy(true);

      try {
        await (0, _promise.allSettled)(Array.from(selectedToAdd).map(room => _SpaceStore.default.instance.addRoomToSpace(space, room.roomId, (0, _Permalinks.calculateRoomVia)(room))));
        onFinished(true);
      } catch (e) {
        console.error("Failed to add rooms to space", e);
        setError((0, _languageHandler._t)("Failed to add rooms to space"));
      }

      setBusy(false);
    };

    buttonLabel = busy ? (0, _languageHandler._t)("Adding...") : (0, _languageHandler._t)("Add");
  }

  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("What do you want to organise?")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, (0, _languageHandler._t)("Pick rooms or conversations to add. This is just a space for you, " + "no one will be informed. You can add more later.")), error && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_errorText"
  }, error), /*#__PURE__*/_react.default.createElement(_AddExistingToSpaceDialog.AddExistingToSpace, {
    space: space,
    selected: selectedToAdd,
    onChange: (checked, room) => {
      if (checked) {
        selectedToAdd.add(room);
      } else {
        selectedToAdd.delete(room);
      }

      setSelectedToAdd(new Set(selectedToAdd));
    }
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    disabled: busy,
    onClick: onClick
  }, buttonLabel)));
};

const SpaceSetupPublicShare = ({
  space,
  onFinished
}) => {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_publicShare"
  }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Share %(name)s", {
    name: space.name
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, (0, _languageHandler._t)("It's just you at the moment, it will be even better with others.")), /*#__PURE__*/_react.default.createElement(_SpacePublicShare.default, {
    space: space
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    onClick: onFinished
  }, (0, _languageHandler._t)("Go to my first room"))));
};

const SpaceSetupPrivateScope = ({
  space,
  onFinished
}) => {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_privateScope"
  }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Who are you working with?")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, (0, _languageHandler._t)("Make sure the right people have access to %(name)s", {
    name: space.name
  })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpaceRoomView_privateScope_justMeButton",
    onClick: () => {
      onFinished(false);
    }
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Just me")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("A private space to organise your rooms"))), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpaceRoomView_privateScope_meAndMyTeammatesButton",
    onClick: () => {
      onFinished(true);
    }
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Me and my teammates")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("A private space for you and your teammates"))));
};

const validateEmailRules = (0, _Validation.default)({
  rules: [{
    key: "email",
    test: ({
      value
    }) => !value || Email.looksValid(value),
    invalid: () => (0, _languageHandler._t)("Doesn't look like a valid email address")
  }]
});

const SpaceSetupPrivateInvite = ({
  space,
  onFinished
}) => {
  const [busy, setBusy] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)("");
  const numFields = 3;
  const fieldRefs
  /*: RefObject<Field>[]*/
  = [(0, _react.useRef)(), (0, _react.useRef)(), (0, _react.useRef)()];
  const [emailAddresses, setEmailAddress] = (0, _useStateArray.useStateArray)(numFields, "");
  const fields = new Array(numFields).fill(0).map((_, i) => {
    const name = "emailAddress" + i;
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      key: name,
      name: name,
      type: "text",
      label: (0, _languageHandler._t)("Email address"),
      placeholder: (0, _languageHandler._t)("Email"),
      value: emailAddresses[i],
      onChange: ev => setEmailAddress(i, ev.target.value),
      ref: fieldRefs[i],
      onValidate: validateEmailRules,
      autoFocus: i === 0
    });
  });

  const onNextClick = async () => {
    setError("");

    for (let i = 0; i < fieldRefs.length; i++) {
      const fieldRef = fieldRefs[i];
      const valid = await fieldRef.current.validate({
        allowEmpty: true
      });

      if (valid === false) {
        // true/null are allowed
        fieldRef.current.focus();
        fieldRef.current.validate({
          allowEmpty: true,
          focused: true
        });
        return;
      }
    }

    setBusy(true);
    const targetIds = emailAddresses.map(name => name.trim()).filter(Boolean);

    try {
      const result = await (0, _RoomInvite.inviteMultipleToRoom)(space.roomId, targetIds);
      const failedUsers = Object.keys(result.states).filter(a => result.states[a] === "error");

      if (failedUsers.length > 0) {
        console.log("Failed to invite users to space: ", result);
        setError((0, _languageHandler._t)("Failed to invite the following users to your space: %(csvUsers)s", {
          csvUsers: failedUsers.join(", ")
        }));
      } else {
        onFinished();
      }
    } catch (err) {
      console.error("Failed to invite users to space: ", err);
      setError((0, _languageHandler._t)("We couldn't invite those users. Please check the users you want to invite and try again."));
    }

    setBusy(false);
  };

  let onClick = onFinished;
  let buttonLabel = (0, _languageHandler._t)("Skip for now");

  if (emailAddresses.some(name => name.trim())) {
    onClick = onNextClick;
    buttonLabel = busy ? (0, _languageHandler._t)("Inviting...") : (0, _languageHandler._t)("Continue");
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_inviteTeammates"
  }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Invite your teammates")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, (0, _languageHandler._t)("Make sure the right people have access. You can invite more later.")), error && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_errorText"
  }, error), fields, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_inviteTeammates_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpaceRoomView_inviteTeammates_inviteDialogButton",
    onClick: () => (0, _RoomInvite.showRoomInviteDialog)(space.roomId)
  }, (0, _languageHandler._t)("Invite by username"))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    disabled: busy,
    onClick: onClick
  }, buttonLabel)));
};

class SpaceRoomView extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "creator", void 0);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "rightPanelStoreToken", void 0);
    (0, _defineProperty2.default)(this, "onMyMembership", (room
    /*: Room*/
    , myMembership
    /*: string*/
    ) => {
      if (room.roomId === this.props.space.roomId) {
        this.setState({
          myMembership
        });
      }
    });
    (0, _defineProperty2.default)(this, "onRightPanelStoreUpdate", () => {
      this.setState({
        showRightPanel: _RightPanelStore.default.getSharedInstance().isOpenForRoom
      });
    });
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      if (payload.action !== _actions.Action.ViewUser && payload.action !== "view_3pid_invite") return;

      if (payload.action === _actions.Action.ViewUser && payload.member) {
        _dispatcher.default.dispatch({
          action: _actions.Action.SetRightPanelPhase,
          phase: _RightPanelStorePhases.RightPanelPhases.SpaceMemberInfo,
          refireParams: {
            space: this.props.space,
            member: payload.member
          }
        });
      } else if (payload.action === "view_3pid_invite" && payload.event) {
        _dispatcher.default.dispatch({
          action: _actions.Action.SetRightPanelPhase,
          phase: _RightPanelStorePhases.RightPanelPhases.Space3pidMemberInfo,
          refireParams: {
            space: this.props.space,
            event: payload.event
          }
        });
      } else {
        _dispatcher.default.dispatch({
          action: _actions.Action.SetRightPanelPhase,
          phase: _RightPanelStorePhases.RightPanelPhases.SpaceMemberList,
          refireParams: {
            space: this.props.space
          }
        });
      }
    });
    (0, _defineProperty2.default)(this, "goToFirstRoom", async () => {
      // TODO actually go to the first room
      const childRooms = _SpaceStore.default.instance.getChildRooms(this.props.space.roomId);

      if (childRooms.length) {
        const room = childRooms[0];

        _dispatcher.default.dispatch({
          action: "view_room",
          room_id: room.roomId
        });

        return;
      }

      let suggestedRooms = _SpaceStore.default.instance.suggestedRooms;

      if (_SpaceStore.default.instance.activeSpace !== this.props.space) {
        // the space store has the suggested rooms loaded for a different space, fetch the right ones
        suggestedRooms = (await _SpaceStore.default.instance.fetchSuggestedRooms(this.props.space, 1)).rooms;
      }

      if (suggestedRooms.length) {
        const room = suggestedRooms[0];

        _dispatcher.default.dispatch({
          action: "view_room",
          room_id: room.room_id,
          oobData: {
            avatarUrl: room.avatar_url,
            name: room.name || room.canonical_alias || room.aliases.pop() || (0, _languageHandler._t)("Empty room")
          }
        });

        return;
      }

      this.setState({
        phase: Phase.Landing
      });
    });
    let phase = Phase.Landing;
    this.creator = this.props.space.currentState.getStateEvents(_event.EventType.RoomCreate, "")?.getSender();
    const showSetup = this.props.justCreatedOpts && this.context.getUserId() === this.creator;

    if (showSetup) {
      phase = this.props.justCreatedOpts.createOpts.preset === _createRoom.Preset.PublicChat ? Phase.PublicCreateRooms : Phase.PrivateScope;
    }

    this.state = {
      phase,
      showRightPanel: _RightPanelStore.default.getSharedInstance().isOpenForRoom,
      myMembership: this.props.space.getMyMembership()
    };
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.rightPanelStoreToken = _RightPanelStore.default.getSharedInstance().addListener(this.onRightPanelStoreUpdate);
    this.context.on("Room.myMembership", this.onMyMembership);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    this.rightPanelStoreToken.remove();
    this.context.off("Room.myMembership", this.onMyMembership);
  }

  renderBody() {
    switch (this.state.phase) {
      case Phase.Landing:
        if (this.state.myMembership === "join") {
          return /*#__PURE__*/_react.default.createElement(SpaceLanding, {
            space: this.props.space
          });
        } else {
          return /*#__PURE__*/_react.default.createElement(SpacePreview, {
            space: this.props.space,
            onJoinButtonClicked: this.props.onJoinButtonClicked,
            onRejectButtonClicked: this.props.onRejectButtonClicked
          });
        }

      case Phase.PublicCreateRooms:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupFirstRooms, {
          space: this.props.space,
          title: (0, _languageHandler._t)("What are some things you want to discuss in %(spaceName)s?", {
            spaceName: this.props.space.name
          }),
          description: (0, _languageHandler._t)("Let's create a room for each of them.") + "\n" + (0, _languageHandler._t)("You can add more later too, including already existing ones."),
          onFinished: () => this.setState({
            phase: Phase.PublicShare
          })
        });

      case Phase.PublicShare:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupPublicShare, {
          space: this.props.space,
          onFinished: this.goToFirstRoom
        });

      case Phase.PrivateScope:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupPrivateScope, {
          space: this.props.space,
          onFinished: (invite
          /*: boolean*/
          ) => {
            this.setState({
              phase: invite ? Phase.PrivateInvite : Phase.PrivateExistingRooms
            });
          }
        });

      case Phase.PrivateInvite:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupPrivateInvite, {
          space: this.props.space,
          onFinished: () => this.setState({
            phase: Phase.PrivateCreateRooms
          })
        });

      case Phase.PrivateCreateRooms:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupFirstRooms, {
          space: this.props.space,
          title: (0, _languageHandler._t)("What projects are you working on?"),
          description: (0, _languageHandler._t)("We'll create rooms for each of them. " + "You can add more later too, including already existing ones."),
          onFinished: () => this.setState({
            phase: Phase.Landing
          })
        });

      case Phase.PrivateExistingRooms:
        return /*#__PURE__*/_react.default.createElement(SpaceAddExistingRooms, {
          space: this.props.space,
          onFinished: () => this.setState({
            phase: Phase.Landing
          })
        });
    }
  }

  render() {
    const rightPanel = this.state.showRightPanel && this.state.phase === Phase.Landing ? /*#__PURE__*/_react.default.createElement(_RightPanel.default, {
      room: this.props.space,
      resizeNotifier: this.props.resizeNotifier
    }) : null;
    return /*#__PURE__*/_react.default.createElement("main", {
      className: "mx_SpaceRoomView"
    }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_MainSplit.default, {
      panel: rightPanel,
      resizeNotifier: this.props.resizeNotifier
    }, this.renderBody())));
  }

}

exports.default = SpaceRoomView;
(0, _defineProperty2.default)(SpaceRoomView, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvU3BhY2VSb29tVmlldy50c3giXSwibmFtZXMiOlsiUGhhc2UiLCJSb29tTWVtYmVyQ291bnQiLCJyb29tIiwiY2hpbGRyZW4iLCJtZW1iZXJzIiwiY291bnQiLCJsZW5ndGgiLCJ1c2VNeVJvb21NZW1iZXJzaGlwIiwibWVtYmVyc2hpcCIsInNldE1lbWJlcnNoaXAiLCJnZXRNeU1lbWJlcnNoaXAiLCJTcGFjZUluZm8iLCJzcGFjZSIsImpvaW5SdWxlIiwiZ2V0Sm9pblJ1bGUiLCJ2aXNpYmlsaXR5U2VjdGlvbiIsImRlZmF1bHREaXNwYXRjaGVyIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJTZXRSaWdodFBhbmVsUGhhc2UiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJSb29tTWVtYmVyTGlzdCIsInJlZmlyZVBhcmFtcyIsIlNwYWNlUHJldmlldyIsIm9uSm9pbkJ1dHRvbkNsaWNrZWQiLCJvblJlamVjdEJ1dHRvbkNsaWNrZWQiLCJjbGkiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwibXlNZW1iZXJzaGlwIiwiYnVzeSIsInNldEJ1c3kiLCJpbnZpdGVyU2VjdGlvbiIsImpvaW5CdXR0b25zIiwiaW52aXRlU2VuZGVyIiwiZ2V0TWVtYmVyIiwiZ2V0VXNlcklkIiwiZXZlbnRzIiwibWVtYmVyIiwiZ2V0U2VuZGVyIiwiaW52aXRlciIsIm5hbWUiLCJ0b3BpYyIsInJlZiIsIlNwYWNlTGFuZGluZyIsInVzZXJJZCIsImludml0ZUJ1dHRvbiIsImNhbkludml0ZSIsInJvb21JZCIsImNhbkFkZFJvb21zIiwiY3VycmVudFN0YXRlIiwibWF5U2VuZFN0YXRlRXZlbnQiLCJFdmVudFR5cGUiLCJTcGFjZUNoaWxkIiwicmVmcmVzaFRva2VuIiwiZm9yY2VVcGRhdGUiLCJhZGRSb29tQnV0dG9ucyIsImFkZGVkIiwic2V0dGluZ3NCdXR0b24iLCJvbk1lbWJlcnNDbGljayIsInRhZ3MiLCJzaG93Um9vbSIsIlNwYWNlU2V0dXBGaXJzdFJvb21zIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm9uRmluaXNoZWQiLCJlcnJvciIsInNldEVycm9yIiwibnVtRmllbGRzIiwicGxhY2Vob2xkZXJzIiwicm9vbU5hbWVzIiwic2V0Um9vbU5hbWUiLCJmaWVsZHMiLCJBcnJheSIsImZpbGwiLCJtYXAiLCJfIiwiaSIsImV2IiwidGFyZ2V0IiwidmFsdWUiLCJvbk5leHRDbGljayIsIlByb21pc2UiLCJhbGwiLCJ0cmltIiwiZmlsdGVyIiwiQm9vbGVhbiIsImNyZWF0ZU9wdHMiLCJwcmVzZXQiLCJQcmVzZXQiLCJQdWJsaWNDaGF0IiwiUHJpdmF0ZUNoYXQiLCJzcGlubmVyIiwiZW5jcnlwdGlvbiIsImFuZFZpZXciLCJpbmxpbmVFcnJvcnMiLCJwYXJlbnRTcGFjZSIsImUiLCJjb25zb2xlIiwib25DbGljayIsImJ1dHRvbkxhYmVsIiwic29tZSIsIlNwYWNlQWRkRXhpc3RpbmdSb29tcyIsInNlbGVjdGVkVG9BZGQiLCJzZXRTZWxlY3RlZFRvQWRkIiwiU2V0Iiwic2l6ZSIsImZyb20iLCJTcGFjZVN0b3JlIiwiaW5zdGFuY2UiLCJhZGRSb29tVG9TcGFjZSIsImNoZWNrZWQiLCJhZGQiLCJkZWxldGUiLCJTcGFjZVNldHVwUHVibGljU2hhcmUiLCJTcGFjZVNldHVwUHJpdmF0ZVNjb3BlIiwidmFsaWRhdGVFbWFpbFJ1bGVzIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiRW1haWwiLCJsb29rc1ZhbGlkIiwiaW52YWxpZCIsIlNwYWNlU2V0dXBQcml2YXRlSW52aXRlIiwiZmllbGRSZWZzIiwiZW1haWxBZGRyZXNzZXMiLCJzZXRFbWFpbEFkZHJlc3MiLCJmaWVsZFJlZiIsInZhbGlkIiwiY3VycmVudCIsInZhbGlkYXRlIiwiYWxsb3dFbXB0eSIsImZvY3VzIiwiZm9jdXNlZCIsInRhcmdldElkcyIsInJlc3VsdCIsImZhaWxlZFVzZXJzIiwiT2JqZWN0Iiwia2V5cyIsInN0YXRlcyIsImEiLCJsb2ciLCJjc3ZVc2VycyIsImpvaW4iLCJlcnIiLCJTcGFjZVJvb21WaWV3IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJzZXRTdGF0ZSIsInNob3dSaWdodFBhbmVsIiwiUmlnaHRQYW5lbFN0b3JlIiwiZ2V0U2hhcmVkSW5zdGFuY2UiLCJpc09wZW5Gb3JSb29tIiwicGF5bG9hZCIsIlZpZXdVc2VyIiwiU3BhY2VNZW1iZXJJbmZvIiwiZXZlbnQiLCJTcGFjZTNwaWRNZW1iZXJJbmZvIiwiU3BhY2VNZW1iZXJMaXN0IiwiY2hpbGRSb29tcyIsImdldENoaWxkUm9vbXMiLCJyb29tX2lkIiwic3VnZ2VzdGVkUm9vbXMiLCJhY3RpdmVTcGFjZSIsImZldGNoU3VnZ2VzdGVkUm9vbXMiLCJyb29tcyIsIm9vYkRhdGEiLCJhdmF0YXJVcmwiLCJhdmF0YXJfdXJsIiwiY2Fub25pY2FsX2FsaWFzIiwiYWxpYXNlcyIsInBvcCIsIkxhbmRpbmciLCJjcmVhdG9yIiwiZ2V0U3RhdGVFdmVudHMiLCJSb29tQ3JlYXRlIiwic2hvd1NldHVwIiwianVzdENyZWF0ZWRPcHRzIiwiUHVibGljQ3JlYXRlUm9vbXMiLCJQcml2YXRlU2NvcGUiLCJzdGF0ZSIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwicmlnaHRQYW5lbFN0b3JlVG9rZW4iLCJhZGRMaXN0ZW5lciIsIm9uUmlnaHRQYW5lbFN0b3JlVXBkYXRlIiwib24iLCJvbk15TWVtYmVyc2hpcCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsInJlbW92ZSIsIm9mZiIsInJlbmRlckJvZHkiLCJzcGFjZU5hbWUiLCJQdWJsaWNTaGFyZSIsImdvVG9GaXJzdFJvb20iLCJpbnZpdGUiLCJQcml2YXRlSW52aXRlIiwiUHJpdmF0ZUV4aXN0aW5nUm9vbXMiLCJQcml2YXRlQ3JlYXRlUm9vbXMiLCJyZW5kZXIiLCJyaWdodFBhbmVsIiwicmVzaXplTm90aWZpZXIi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WUFBQUEsS0FBSyxFQUFFckIsS0FBSyxDQUFDZ0w7QUFBZixXQUFkO0FBTGYsVUFBUDs7QUFPSixXQUFLaEwsS0FBSyxDQUFDMk0sb0JBQVg7QUFDSSw0QkFBTyw2QkFBQyxxQkFBRDtBQUNILFVBQUEsS0FBSyxFQUFFLEtBQUtyRCxLQUFMLENBQVcxSSxLQURmO0FBRUgsVUFBQSxVQUFVLEVBQUUsTUFBTSxLQUFLNEksUUFBTCxDQUFjO0FBQUVuSSxZQUFBQSxLQUFLLEVBQUVyQixLQUFLLENBQUNnTDtBQUFmLFdBQWQ7QUFGZixVQUFQO0FBL0NSO0FBb0RIOztBQUVENkIsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsVUFBVSxHQUFHLEtBQUt0QixLQUFMLENBQVcvQixjQUFYLElBQTZCLEtBQUsrQixLQUFMLENBQVduSyxLQUFYLEtBQXFCckIsS0FBSyxDQUFDZ0wsT0FBeEQsZ0JBQ2IsNkJBQUMsbUJBQUQ7QUFBWSxNQUFBLElBQUksRUFBRSxLQUFLMUIsS0FBTCxDQUFXMUksS0FBN0I7QUFBb0MsTUFBQSxjQUFjLEVBQUUsS0FBSzBJLEtBQUwsQ0FBV3lEO0FBQS9ELE1BRGEsR0FFYixJQUZOO0FBSUEsd0JBQU87QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixvQkFDSCw2QkFBQyxzQkFBRCxxQkFDSSw2QkFBQyxrQkFBRDtBQUFXLE1BQUEsS0FBSyxFQUFFRCxVQUFsQjtBQUE4QixNQUFBLGNBQWMsRUFBRSxLQUFLeEQsS0FBTCxDQUFXeUQ7QUFBekQsT0FDTSxLQUFLVixVQUFMLEVBRE4sQ0FESixDQURHLENBQVA7QUFPSDs7QUFyTDBFOzs7OEJBQTFEbkQsYSxpQkFDSXJILDRCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7UmVmT2JqZWN0LCB1c2VDb250ZXh0LCB1c2VSZWYsIHVzZVN0YXRlfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7RXZlbnRUeXBlfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHtFdmVudFN1YnNjcmlwdGlvbn0gZnJvbSBcImZiZW1pdHRlclwiO1xuXG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSBcIi4uL3ZpZXdzL2F2YXRhcnMvUm9vbUF2YXRhclwiO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBSb29tTmFtZSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvUm9vbU5hbWVcIjtcbmltcG9ydCBSb29tVG9waWMgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1Jvb21Ub3BpY1wiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0lubGluZVNwaW5uZXJcIjtcbmltcG9ydCB7aW52aXRlTXVsdGlwbGVUb1Jvb20sIHNob3dSb29tSW52aXRlRGlhbG9nfSBmcm9tIFwiLi4vLi4vUm9vbUludml0ZVwiO1xuaW1wb3J0IHt1c2VSb29tTWVtYmVyc30gZnJvbSBcIi4uLy4uL2hvb2tzL3VzZVJvb21NZW1iZXJzXCI7XG5pbXBvcnQgY3JlYXRlUm9vbSwge0lPcHRzLCBQcmVzZXR9IGZyb20gXCIuLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQge3VzZUV2ZW50RW1pdHRlcn0gZnJvbSBcIi4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlclwiO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9WYWxpZGF0aW9uXCI7XG5pbXBvcnQgKiBhcyBFbWFpbCBmcm9tIFwiLi4vLi4vZW1haWxcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IFJlc2l6ZU5vdGlmaWVyIGZyb20gXCIuLi8uLi91dGlscy9SZXNpemVOb3RpZmllclwiXG5pbXBvcnQgTWFpblNwbGl0IGZyb20gJy4vTWFpblNwbGl0JztcbmltcG9ydCBFcnJvckJvdW5kYXJ5IGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9FcnJvckJvdW5kYXJ5XCI7XG5pbXBvcnQge0FjdGlvblBheWxvYWR9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgUmlnaHRQYW5lbCBmcm9tIFwiLi9SaWdodFBhbmVsXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlXCI7XG5pbXBvcnQge1JpZ2h0UGFuZWxQaGFzZXN9IGZyb20gXCIuLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlUGhhc2VzXCI7XG5pbXBvcnQge1NldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWR9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1NldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWRcIjtcbmltcG9ydCB7dXNlU3RhdGVBcnJheX0gZnJvbSBcIi4uLy4uL2hvb2tzL3VzZVN0YXRlQXJyYXlcIjtcbmltcG9ydCBTcGFjZVB1YmxpY1NoYXJlIGZyb20gXCIuLi92aWV3cy9zcGFjZXMvU3BhY2VQdWJsaWNTaGFyZVwiO1xuaW1wb3J0IHtzaG93QWRkRXhpc3RpbmdSb29tcywgc2hvd0NyZWF0ZU5ld1Jvb20sIHNob3VsZFNob3dTcGFjZVNldHRpbmdzLCBzaG93U3BhY2VTZXR0aW5nc30gZnJvbSBcIi4uLy4uL3V0aWxzL3NwYWNlXCI7XG5pbXBvcnQge3Nob3dSb29tLCBTcGFjZUhpZXJhcmNoeX0gZnJvbSBcIi4vU3BhY2VSb29tRGlyZWN0b3J5XCI7XG5pbXBvcnQgTWVtYmVyQXZhdGFyIGZyb20gXCIuLi92aWV3cy9hdmF0YXJzL01lbWJlckF2YXRhclwiO1xuaW1wb3J0IHt1c2VTdGF0ZVRvZ2dsZX0gZnJvbSBcIi4uLy4uL2hvb2tzL3VzZVN0YXRlVG9nZ2xlXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL1NwYWNlU3RvcmVcIjtcbmltcG9ydCBGYWNlUGlsZSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvRmFjZVBpbGVcIjtcbmltcG9ydCB7QWRkRXhpc3RpbmdUb1NwYWNlfSBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9BZGRFeGlzdGluZ1RvU3BhY2VEaWFsb2dcIjtcbmltcG9ydCB7YWxsU2V0dGxlZH0gZnJvbSBcIi4uLy4uL3V0aWxzL3Byb21pc2VcIjtcbmltcG9ydCB7Y2FsY3VsYXRlUm9vbVZpYX0gZnJvbSBcIi4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBzcGFjZTogUm9vbTtcbiAgICBqdXN0Q3JlYXRlZE9wdHM/OiBJT3B0cztcbiAgICByZXNpemVOb3RpZmllcjogUmVzaXplTm90aWZpZXI7XG4gICAgb25Kb2luQnV0dG9uQ2xpY2tlZCgpOiB2b2lkO1xuICAgIG9uUmVqZWN0QnV0dG9uQ2xpY2tlZCgpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBwaGFzZTogUGhhc2U7XG4gICAgc2hvd1JpZ2h0UGFuZWw6IGJvb2xlYW47XG4gICAgbXlNZW1iZXJzaGlwOiBzdHJpbmc7XG59XG5cbmVudW0gUGhhc2Uge1xuICAgIExhbmRpbmcsXG4gICAgUHVibGljQ3JlYXRlUm9vbXMsXG4gICAgUHVibGljU2hhcmUsXG4gICAgUHJpdmF0ZVNjb3BlLFxuICAgIFByaXZhdGVJbnZpdGUsXG4gICAgUHJpdmF0ZUNyZWF0ZVJvb21zLFxuICAgIFByaXZhdGVFeGlzdGluZ1Jvb21zLFxufVxuXG5jb25zdCBSb29tTWVtYmVyQ291bnQgPSAoeyByb29tLCBjaGlsZHJlbiB9KSA9PiB7XG4gICAgY29uc3QgbWVtYmVycyA9IHVzZVJvb21NZW1iZXJzKHJvb20pO1xuICAgIGNvbnN0IGNvdW50ID0gbWVtYmVycy5sZW5ndGg7XG5cbiAgICBpZiAoY2hpbGRyZW4pIHJldHVybiBjaGlsZHJlbihjb3VudCk7XG4gICAgcmV0dXJuIGNvdW50O1xufTtcblxuY29uc3QgdXNlTXlSb29tTWVtYmVyc2hpcCA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgY29uc3QgW21lbWJlcnNoaXAsIHNldE1lbWJlcnNoaXBdID0gdXNlU3RhdGUocm9vbS5nZXRNeU1lbWJlcnNoaXAoKSk7XG4gICAgdXNlRXZlbnRFbWl0dGVyKHJvb20sIFwiUm9vbS5teU1lbWJlcnNoaXBcIiwgKCkgPT4ge1xuICAgICAgICBzZXRNZW1iZXJzaGlwKHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBtZW1iZXJzaGlwO1xufTtcblxuY29uc3QgU3BhY2VJbmZvID0gKHsgc3BhY2UgfSkgPT4ge1xuICAgIGNvbnN0IGpvaW5SdWxlID0gc3BhY2UuZ2V0Sm9pblJ1bGUoKTtcblxuICAgIGxldCB2aXNpYmlsaXR5U2VjdGlvbjtcbiAgICBpZiAoam9pblJ1bGUgPT09IFwicHVibGljXCIpIHtcbiAgICAgICAgdmlzaWJpbGl0eVNlY3Rpb24gPSA8c3BhbiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2luZm9fcHVibGljXCI+XG4gICAgICAgICAgICB7IF90KFwiUHVibGljIHNwYWNlXCIpIH1cbiAgICAgICAgPC9zcGFuPjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2aXNpYmlsaXR5U2VjdGlvbiA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfaW5mb19wcml2YXRlXCI+XG4gICAgICAgICAgICB7IF90KFwiUHJpdmF0ZSBzcGFjZVwiKSB9XG4gICAgICAgIDwvc3Bhbj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19pbmZvXCI+XG4gICAgICAgIHsgdmlzaWJpbGl0eVNlY3Rpb24gfVxuICAgICAgICB7IGpvaW5SdWxlID09PSBcInB1YmxpY1wiICYmIDxSb29tTWVtYmVyQ291bnQgcm9vbT17c3BhY2V9PlxuICAgICAgICAgICAgeyhjb3VudCkgPT4gY291bnQgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8U2V0UmlnaHRQYW5lbFBoYXNlUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlNldFJpZ2h0UGFuZWxQaGFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVyTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZpcmVQYXJhbXM6IHsgc3BhY2UgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIiUoY291bnQpcyBtZW1iZXJzXCIsIHsgY291bnQgfSkgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L1Jvb21NZW1iZXJDb3VudD4gfVxuICAgIDwvZGl2PlxufTtcblxuY29uc3QgU3BhY2VQcmV2aWV3ID0gKHsgc3BhY2UsIG9uSm9pbkJ1dHRvbkNsaWNrZWQsIG9uUmVqZWN0QnV0dG9uQ2xpY2tlZCB9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCBteU1lbWJlcnNoaXAgPSB1c2VNeVJvb21NZW1iZXJzaGlwKHNwYWNlKTtcblxuICAgIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIGxldCBpbnZpdGVyU2VjdGlvbjtcbiAgICBsZXQgam9pbkJ1dHRvbnM7XG4gICAgaWYgKG15TWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIikge1xuICAgICAgICBjb25zdCBpbnZpdGVTZW5kZXIgPSBzcGFjZS5nZXRNZW1iZXIoY2xpLmdldFVzZXJJZCgpKT8uZXZlbnRzLm1lbWJlcj8uZ2V0U2VuZGVyKCk7XG4gICAgICAgIGNvbnN0IGludml0ZXIgPSBpbnZpdGVTZW5kZXIgJiYgc3BhY2UuZ2V0TWVtYmVyKGludml0ZVNlbmRlcik7XG5cbiAgICAgICAgaWYgKGludml0ZVNlbmRlcikge1xuICAgICAgICAgICAgaW52aXRlclNlY3Rpb24gPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfcHJldmlld19pbnZpdGVyXCI+XG4gICAgICAgICAgICAgICAgPE1lbWJlckF2YXRhciBtZW1iZXI9e2ludml0ZXJ9IHdpZHRoPXszMn0gaGVpZ2h0PXszMn0gLz5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfcHJldmlld19pbnZpdGVyX25hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCI8aW52aXRlci8+IGludml0ZXMgeW91XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52aXRlcjogKCkgPT4gPGI+eyBpbnZpdGVyLm5hbWUgfHwgaW52aXRlU2VuZGVyIH08L2I+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBpbnZpdGVyID8gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X3ByZXZpZXdfaW52aXRlcl9teGlkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGludml0ZVNlbmRlciB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiA6IG51bGwgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgam9pbkJ1dHRvbnMgPSA8PlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBraW5kPVwic2Vjb25kYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldEJ1c3kodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG9uUmVqZWN0QnV0dG9uQ2xpY2tlZCgpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcIlJlamVjdFwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldEJ1c3kodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG9uSm9pbkJ1dHRvbkNsaWNrZWQoKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJBY2NlcHRcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8Lz47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgam9pbkJ1dHRvbnMgPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldEJ1c3kodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG9uSm9pbkJ1dHRvbkNsaWNrZWQoKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJKb2luXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKVxuICAgIH1cblxuICAgIGlmIChidXN5KSB7XG4gICAgICAgIGpvaW5CdXR0b25zID0gPElubGluZVNwaW5uZXIgLz47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19wcmV2aWV3XCI+XG4gICAgICAgIHsgaW52aXRlclNlY3Rpb24gfVxuICAgICAgICA8Um9vbUF2YXRhciByb29tPXtzcGFjZX0gaGVpZ2h0PXs4MH0gd2lkdGg9ezgwfSB2aWV3QXZhdGFyT25DbGljaz17dHJ1ZX0gLz5cbiAgICAgICAgPGgxIGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfcHJldmlld19uYW1lXCI+XG4gICAgICAgICAgICA8Um9vbU5hbWUgcm9vbT17c3BhY2V9IC8+XG4gICAgICAgIDwvaDE+XG4gICAgICAgIDxTcGFjZUluZm8gc3BhY2U9e3NwYWNlfSAvPlxuICAgICAgICA8Um9vbVRvcGljIHJvb209e3NwYWNlfT5cbiAgICAgICAgICAgIHsodG9waWMsIHJlZikgPT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfcHJldmlld190b3BpY1wiIHJlZj17cmVmfT5cbiAgICAgICAgICAgICAgICAgICAgeyB0b3BpYyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB9XG4gICAgICAgIDwvUm9vbVRvcGljPlxuICAgICAgICB7IHNwYWNlLmdldEpvaW5SdWxlKCkgPT09IFwicHVibGljXCIgJiYgPEZhY2VQaWxlIHJvb209e3NwYWNlfSAvPiB9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19wcmV2aWV3X2pvaW5CdXR0b25zXCI+XG4gICAgICAgICAgICB7IGpvaW5CdXR0b25zIH1cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+O1xufTtcblxuY29uc3QgU3BhY2VMYW5kaW5nID0gKHsgc3BhY2UgfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgbXlNZW1iZXJzaGlwID0gdXNlTXlSb29tTWVtYmVyc2hpcChzcGFjZSk7XG4gICAgY29uc3QgdXNlcklkID0gY2xpLmdldFVzZXJJZCgpO1xuXG4gICAgbGV0IGludml0ZUJ1dHRvbjtcbiAgICBpZiAobXlNZW1iZXJzaGlwID09PSBcImpvaW5cIiAmJiBzcGFjZS5jYW5JbnZpdGUodXNlcklkKSkge1xuICAgICAgICBpbnZpdGVCdXR0b24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2xhbmRpbmdfaW52aXRlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dSb29tSW52aXRlRGlhbG9nKHNwYWNlLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiSW52aXRlXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjYW5BZGRSb29tcyA9IG15TWVtYmVyc2hpcCA9PT0gXCJqb2luXCIgJiYgc3BhY2UuY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5TcGFjZUNoaWxkLCB1c2VySWQpO1xuXG4gICAgY29uc3QgW3JlZnJlc2hUb2tlbiwgZm9yY2VVcGRhdGVdID0gdXNlU3RhdGVUb2dnbGUoZmFsc2UpO1xuXG4gICAgbGV0IGFkZFJvb21CdXR0b25zO1xuICAgIGlmIChjYW5BZGRSb29tcykge1xuICAgICAgICBhZGRSb29tQnV0dG9ucyA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfbGFuZGluZ19hZGRCdXR0b25cIiBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgW2FkZGVkXSA9IGF3YWl0IHNob3dBZGRFeGlzdGluZ1Jvb21zKGNsaSwgc3BhY2UpO1xuICAgICAgICAgICAgICAgIGlmIChhZGRlZCkge1xuICAgICAgICAgICAgICAgICAgICBmb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJBZGQgZXhpc3Rpbmcgcm9vbXMgJiBzcGFjZXNcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19sYW5kaW5nX2NyZWF0ZUJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzaG93Q3JlYXRlTmV3Um9vbShjbGksIHNwYWNlKTtcbiAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJDcmVhdGUgYSBuZXcgcm9vbVwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgIH1cblxuICAgIGxldCBzZXR0aW5nc0J1dHRvbjtcbiAgICBpZiAoc2hvdWxkU2hvd1NwYWNlU2V0dGluZ3MoY2xpLCBzcGFjZSkpIHtcbiAgICAgICAgc2V0dGluZ3NCdXR0b24gPSA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2xhbmRpbmdfc2V0dGluZ3NCdXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBzaG93U3BhY2VTZXR0aW5ncyhjbGksIHNwYWNlKTtcbiAgICAgICAgfX0+XG4gICAgICAgICAgICB7IF90KFwiU2V0dGluZ3NcIikgfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgIH1cblxuICAgIGNvbnN0IG9uTWVtYmVyc0NsaWNrID0gKCkgPT4ge1xuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaDxTZXRSaWdodFBhbmVsUGhhc2VQYXlsb2FkPih7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TZXRSaWdodFBhbmVsUGhhc2UsXG4gICAgICAgICAgICBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVyTGlzdCxcbiAgICAgICAgICAgIHJlZmlyZVBhcmFtczogeyBzcGFjZSB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19sYW5kaW5nXCI+XG4gICAgICAgIDxSb29tQXZhdGFyIHJvb209e3NwYWNlfSBoZWlnaHQ9ezgwfSB3aWR0aD17ODB9IHZpZXdBdmF0YXJPbkNsaWNrPXt0cnVlfSAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfbGFuZGluZ19uYW1lXCI+XG4gICAgICAgICAgICA8Um9vbU5hbWUgcm9vbT17c3BhY2V9PlxuICAgICAgICAgICAgICAgIHsobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWdzID0geyBuYW1lOiAoKSA9PiA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfbGFuZGluZ19uYW1lUm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDE+eyBuYW1lIH08L2gxPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiV2VsY29tZSB0byA8bmFtZS8+XCIsIHt9LCB0YWdzKSBhcyBKU1guRWxlbWVudDtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPC9Sb29tTmFtZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19sYW5kaW5nX2luZm9cIj5cbiAgICAgICAgICAgIDxTcGFjZUluZm8gc3BhY2U9e3NwYWNlfSAvPlxuICAgICAgICAgICAgPEZhY2VQaWxlIHJvb209e3NwYWNlfSBvbmx5S25vd25Vc2Vycz17ZmFsc2V9IG51bVNob3duPXs3fSBvbkNsaWNrPXtvbk1lbWJlcnNDbGlja30gLz5cbiAgICAgICAgICAgIHsgaW52aXRlQnV0dG9uIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19sYW5kaW5nX3RvcGljXCI+XG4gICAgICAgICAgICA8Um9vbVRvcGljIHJvb209e3NwYWNlfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGhyIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19sYW5kaW5nX2FkbWluQnV0dG9uc1wiPlxuICAgICAgICAgICAgeyBhZGRSb29tQnV0dG9ucyB9XG4gICAgICAgICAgICB7IHNldHRpbmdzQnV0dG9uIH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPFNwYWNlSGllcmFyY2h5IHNwYWNlPXtzcGFjZX0gc2hvd1Jvb209e3Nob3dSb29tfSByZWZyZXNoVG9rZW49e3JlZnJlc2hUb2tlbn0gLz5cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCBTcGFjZVNldHVwRmlyc3RSb29tcyA9ICh7IHNwYWNlLCB0aXRsZSwgZGVzY3JpcHRpb24sIG9uRmluaXNoZWQgfSkgPT4ge1xuICAgIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKFwiXCIpO1xuICAgIGNvbnN0IG51bUZpZWxkcyA9IDM7XG4gICAgY29uc3QgcGxhY2Vob2xkZXJzID0gW190KFwiR2VuZXJhbFwiKSwgX3QoXCJSYW5kb21cIiksIF90KFwiU3VwcG9ydFwiKV07XG4gICAgLy8gVE9ETyB2YXJ5IGRlZmF1bHQgcHJlZmlsbHMgZm9yIFwiSnVzdCBNZVwiIHNwYWNlc1xuICAgIGNvbnN0IFtyb29tTmFtZXMsIHNldFJvb21OYW1lXSA9IHVzZVN0YXRlQXJyYXkobnVtRmllbGRzLCBbX3QoXCJHZW5lcmFsXCIpLCBfdChcIlJhbmRvbVwiKSwgXCJcIl0pO1xuICAgIGNvbnN0IGZpZWxkcyA9IG5ldyBBcnJheShudW1GaWVsZHMpLmZpbGwoMCkubWFwKChfLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBcInJvb21OYW1lXCIgKyBpO1xuICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICBrZXk9e25hbWV9XG4gICAgICAgICAgICBuYW1lPXtuYW1lfVxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgbGFiZWw9e190KFwiUm9vbSBuYW1lXCIpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3BsYWNlaG9sZGVyc1tpXX1cbiAgICAgICAgICAgIHZhbHVlPXtyb29tTmFtZXNbaV19XG4gICAgICAgICAgICBvbkNoYW5nZT17ZXYgPT4gc2V0Um9vbU5hbWUoaSwgZXYudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIGF1dG9Gb2N1cz17aSA9PT0gMn1cbiAgICAgICAgLz47XG4gICAgfSk7XG5cbiAgICBjb25zdCBvbk5leHRDbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0RXJyb3IoXCJcIik7XG4gICAgICAgIHNldEJ1c3kodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChyb29tTmFtZXMubWFwKG5hbWUgPT4gbmFtZS50cmltKCkpLmZpbHRlcihCb29sZWFuKS5tYXAobmFtZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVJvb20oe1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVPcHRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVzZXQ6IHNwYWNlLmdldEpvaW5SdWxlKCkgPT09IFwicHVibGljXCIgPyBQcmVzZXQuUHVibGljQ2hhdCA6IFByZXNldC5Qcml2YXRlQ2hhdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHNwaW5uZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlbmNyeXB0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgYW5kVmlldzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZUVycm9yczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50U3BhY2U6IHNwYWNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBpbml0aWFsIHNwYWNlIHJvb21zXCIsIGUpO1xuICAgICAgICAgICAgc2V0RXJyb3IoX3QoXCJGYWlsZWQgdG8gY3JlYXRlIGluaXRpYWwgc3BhY2Ugcm9vbXNcIikpO1xuICAgICAgICB9XG4gICAgICAgIHNldEJ1c3koZmFsc2UpO1xuICAgIH07XG5cbiAgICBsZXQgb25DbGljayA9IG9uRmluaXNoZWQ7XG4gICAgbGV0IGJ1dHRvbkxhYmVsID0gX3QoXCJTa2lwIGZvciBub3dcIik7XG4gICAgaWYgKHJvb21OYW1lcy5zb21lKG5hbWUgPT4gbmFtZS50cmltKCkpKSB7XG4gICAgICAgIG9uQ2xpY2sgPSBvbk5leHRDbGljaztcbiAgICAgICAgYnV0dG9uTGFiZWwgPSBidXN5ID8gX3QoXCJDcmVhdGluZyByb29tcy4uLlwiKSA6IF90KFwiQ29udGludWVcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXY+XG4gICAgICAgIDxoMT57IHRpdGxlIH08L2gxPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfZGVzY3JpcHRpb25cIj57IGRlc2NyaXB0aW9uIH08L2Rpdj5cblxuICAgICAgICB7IGVycm9yICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19lcnJvclRleHRcIj57IGVycm9yIH08L2Rpdj4gfVxuICAgICAgICB7IGZpZWxkcyB9XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2J1dHRvbnNcIj5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBidXR0b25MYWJlbCB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2Pjtcbn07XG5cbmNvbnN0IFNwYWNlQWRkRXhpc3RpbmdSb29tcyA9ICh7IHNwYWNlLCBvbkZpbmlzaGVkIH0pID0+IHtcbiAgICBjb25zdCBbc2VsZWN0ZWRUb0FkZCwgc2V0U2VsZWN0ZWRUb0FkZF0gPSB1c2VTdGF0ZShuZXcgU2V0PFJvb20+KCkpO1xuXG4gICAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUoXCJcIik7XG5cbiAgICBsZXQgb25DbGljayA9IG9uRmluaXNoZWQ7XG4gICAgbGV0IGJ1dHRvbkxhYmVsID0gX3QoXCJTa2lwIGZvciBub3dcIik7XG4gICAgaWYgKHNlbGVjdGVkVG9BZGQuc2l6ZSA+IDApIHtcbiAgICAgICAgb25DbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIC8vIFRPRE8gcmF0ZSBsaW1pdGluZ1xuICAgICAgICAgICAgc2V0QnVzeSh0cnVlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgYWxsU2V0dGxlZChBcnJheS5mcm9tKHNlbGVjdGVkVG9BZGQpLm1hcCgocm9vbSkgPT5cbiAgICAgICAgICAgICAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5hZGRSb29tVG9TcGFjZShzcGFjZSwgcm9vbS5yb29tSWQsIGNhbGN1bGF0ZVJvb21WaWEocm9vbSkpKSk7XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGFkZCByb29tcyB0byBzcGFjZVwiLCBlKTtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcihfdChcIkZhaWxlZCB0byBhZGQgcm9vbXMgdG8gc3BhY2VcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0QnVzeShmYWxzZSk7XG4gICAgICAgIH07XG4gICAgICAgIGJ1dHRvbkxhYmVsID0gYnVzeSA/IF90KFwiQWRkaW5nLi4uXCIpIDogX3QoXCJBZGRcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXY+XG4gICAgICAgIDxoMT57IF90KFwiV2hhdCBkbyB5b3Ugd2FudCB0byBvcmdhbmlzZT9cIikgfTwvaDE+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgeyBfdChcIlBpY2sgcm9vbXMgb3IgY29udmVyc2F0aW9ucyB0byBhZGQuIFRoaXMgaXMganVzdCBhIHNwYWNlIGZvciB5b3UsIFwiICtcbiAgICAgICAgICAgICAgICBcIm5vIG9uZSB3aWxsIGJlIGluZm9ybWVkLiBZb3UgY2FuIGFkZCBtb3JlIGxhdGVyLlwiKSB9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsgZXJyb3IgJiYgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2Vycm9yVGV4dFwiPnsgZXJyb3IgfTwvZGl2PiB9XG5cbiAgICAgICAgPEFkZEV4aXN0aW5nVG9TcGFjZVxuICAgICAgICAgICAgc3BhY2U9e3NwYWNlfVxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkVG9BZGR9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGNoZWNrZWQsIHJvb20pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFRvQWRkLmFkZChyb29tKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFRvQWRkLmRlbGV0ZShyb29tKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRUb0FkZChuZXcgU2V0KHNlbGVjdGVkVG9BZGQpKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgIC8+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2J1dHRvbnNcIj5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBidXR0b25MYWJlbCB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2Pjtcbn07XG5cbmNvbnN0IFNwYWNlU2V0dXBQdWJsaWNTaGFyZSA9ICh7IHNwYWNlLCBvbkZpbmlzaGVkIH0pID0+IHtcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X3B1YmxpY1NoYXJlXCI+XG4gICAgICAgIDxoMT57IF90KFwiU2hhcmUgJShuYW1lKXNcIiwgeyBuYW1lOiBzcGFjZS5uYW1lIH0pIH08L2gxPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIHsgX3QoXCJJdCdzIGp1c3QgeW91IGF0IHRoZSBtb21lbnQsIGl0IHdpbGwgYmUgZXZlbiBiZXR0ZXIgd2l0aCBvdGhlcnMuXCIpIH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPFNwYWNlUHVibGljU2hhcmUgc3BhY2U9e3NwYWNlfSAvPlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19idXR0b25zXCI+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e29uRmluaXNoZWR9PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJHbyB0byBteSBmaXJzdCByb29tXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+O1xufTtcblxuY29uc3QgU3BhY2VTZXR1cFByaXZhdGVTY29wZSA9ICh7IHNwYWNlLCBvbkZpbmlzaGVkIH0pID0+IHtcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X3ByaXZhdGVTY29wZVwiPlxuICAgICAgICA8aDE+eyBfdChcIldobyBhcmUgeW91IHdvcmtpbmcgd2l0aD9cIikgfTwvaDE+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgeyBfdChcIk1ha2Ugc3VyZSB0aGUgcmlnaHQgcGVvcGxlIGhhdmUgYWNjZXNzIHRvICUobmFtZSlzXCIsIHsgbmFtZTogc3BhY2UubmFtZSB9KSB9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X3ByaXZhdGVTY29wZV9qdXN0TWVCdXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBvbkZpbmlzaGVkKGZhbHNlKSB9fVxuICAgICAgICA+XG4gICAgICAgICAgICA8aDM+eyBfdChcIkp1c3QgbWVcIikgfTwvaDM+XG4gICAgICAgICAgICA8ZGl2PnsgX3QoXCJBIHByaXZhdGUgc3BhY2UgdG8gb3JnYW5pc2UgeW91ciByb29tc1wiKSB9PC9kaXY+XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfcHJpdmF0ZVNjb3BlX21lQW5kTXlUZWFtbWF0ZXNCdXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBvbkZpbmlzaGVkKHRydWUpIH19XG4gICAgICAgID5cbiAgICAgICAgICAgIDxoMz57IF90KFwiTWUgYW5kIG15IHRlYW1tYXRlc1wiKSB9PC9oMz5cbiAgICAgICAgICAgIDxkaXY+eyBfdChcIkEgcHJpdmF0ZSBzcGFjZSBmb3IgeW91IGFuZCB5b3VyIHRlYW1tYXRlc1wiKSB9PC9kaXY+XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCB2YWxpZGF0ZUVtYWlsUnVsZXMgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgcnVsZXM6IFt7XG4gICAgICAgIGtleTogXCJlbWFpbFwiLFxuICAgICAgICB0ZXN0OiAoeyB2YWx1ZSB9KSA9PiAhdmFsdWUgfHwgRW1haWwubG9va3NWYWxpZCh2YWx1ZSksXG4gICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRG9lc24ndCBsb29rIGxpa2UgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCIpLFxuICAgIH1dLFxufSk7XG5cbmNvbnN0IFNwYWNlU2V0dXBQcml2YXRlSW52aXRlID0gKHsgc3BhY2UsIG9uRmluaXNoZWQgfSkgPT4ge1xuICAgIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKFwiXCIpO1xuICAgIGNvbnN0IG51bUZpZWxkcyA9IDM7XG4gICAgY29uc3QgZmllbGRSZWZzOiBSZWZPYmplY3Q8RmllbGQ+W10gPSBbdXNlUmVmKCksIHVzZVJlZigpLCB1c2VSZWYoKV07XG4gICAgY29uc3QgW2VtYWlsQWRkcmVzc2VzLCBzZXRFbWFpbEFkZHJlc3NdID0gdXNlU3RhdGVBcnJheShudW1GaWVsZHMsIFwiXCIpO1xuICAgIGNvbnN0IGZpZWxkcyA9IG5ldyBBcnJheShudW1GaWVsZHMpLmZpbGwoMCkubWFwKChfLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBcImVtYWlsQWRkcmVzc1wiICsgaTtcbiAgICAgICAgcmV0dXJuIDxGaWVsZFxuICAgICAgICAgICAga2V5PXtuYW1lfVxuICAgICAgICAgICAgbmFtZT17bmFtZX1cbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgIGxhYmVsPXtfdChcIkVtYWlsIGFkZHJlc3NcIil9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJFbWFpbFwiKX1cbiAgICAgICAgICAgIHZhbHVlPXtlbWFpbEFkZHJlc3Nlc1tpXX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtldiA9PiBzZXRFbWFpbEFkZHJlc3MoaSwgZXYudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHJlZj17ZmllbGRSZWZzW2ldfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dmFsaWRhdGVFbWFpbFJ1bGVzfVxuICAgICAgICAgICAgYXV0b0ZvY3VzPXtpID09PSAwfVxuICAgICAgICAvPjtcbiAgICB9KTtcblxuICAgIGNvbnN0IG9uTmV4dENsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRFcnJvcihcIlwiKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWVsZFJlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkUmVmID0gZmllbGRSZWZzW2ldO1xuICAgICAgICAgICAgY29uc3QgdmFsaWQgPSBhd2FpdCBmaWVsZFJlZi5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgaWYgKHZhbGlkID09PSBmYWxzZSkgeyAvLyB0cnVlL251bGwgYXJlIGFsbG93ZWRcbiAgICAgICAgICAgICAgICBmaWVsZFJlZi5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgZmllbGRSZWYuY3VycmVudC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IHRydWUsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2V0QnVzeSh0cnVlKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWRzID0gZW1haWxBZGRyZXNzZXMubWFwKG5hbWUgPT4gbmFtZS50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGludml0ZU11bHRpcGxlVG9Sb29tKHNwYWNlLnJvb21JZCwgdGFyZ2V0SWRzKTtcblxuICAgICAgICAgICAgY29uc3QgZmFpbGVkVXNlcnMgPSBPYmplY3Qua2V5cyhyZXN1bHQuc3RhdGVzKS5maWx0ZXIoYSA9PiByZXN1bHQuc3RhdGVzW2FdID09PSBcImVycm9yXCIpO1xuICAgICAgICAgICAgaWYgKGZhaWxlZFVzZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBpbnZpdGUgdXNlcnMgdG8gc3BhY2U6IFwiLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIHNldEVycm9yKF90KFwiRmFpbGVkIHRvIGludml0ZSB0aGUgZm9sbG93aW5nIHVzZXJzIHRvIHlvdXIgc3BhY2U6ICUoY3N2VXNlcnMpc1wiLCB7XG4gICAgICAgICAgICAgICAgICAgIGNzdlVzZXJzOiBmYWlsZWRVc2Vycy5qb2luKFwiLCBcIiksXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBpbnZpdGUgdXNlcnMgdG8gc3BhY2U6IFwiLCBlcnIpO1xuICAgICAgICAgICAgc2V0RXJyb3IoX3QoXCJXZSBjb3VsZG4ndCBpbnZpdGUgdGhvc2UgdXNlcnMuIFBsZWFzZSBjaGVjayB0aGUgdXNlcnMgeW91IHdhbnQgdG8gaW52aXRlIGFuZCB0cnkgYWdhaW4uXCIpKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRCdXN5KGZhbHNlKTtcbiAgICB9O1xuXG4gICAgbGV0IG9uQ2xpY2sgPSBvbkZpbmlzaGVkO1xuICAgIGxldCBidXR0b25MYWJlbCA9IF90KFwiU2tpcCBmb3Igbm93XCIpO1xuICAgIGlmIChlbWFpbEFkZHJlc3Nlcy5zb21lKG5hbWUgPT4gbmFtZS50cmltKCkpKSB7XG4gICAgICAgIG9uQ2xpY2sgPSBvbk5leHRDbGljaztcbiAgICAgICAgYnV0dG9uTGFiZWwgPSBidXN5ID8gX3QoXCJJbnZpdGluZy4uLlwiKSA6IF90KFwiQ29udGludWVcIilcbiAgICB9XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2ludml0ZVRlYW1tYXRlc1wiPlxuICAgICAgICA8aDE+eyBfdChcIkludml0ZSB5b3VyIHRlYW1tYXRlc1wiKSB9PC9oMT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2Rlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICB7IF90KFwiTWFrZSBzdXJlIHRoZSByaWdodCBwZW9wbGUgaGF2ZSBhY2Nlc3MuIFlvdSBjYW4gaW52aXRlIG1vcmUgbGF0ZXIuXCIpIH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgeyBlcnJvciAmJiA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfZXJyb3JUZXh0XCI+eyBlcnJvciB9PC9kaXY+IH1cbiAgICAgICAgeyBmaWVsZHMgfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19pbnZpdGVUZWFtbWF0ZXNfYnV0dG9uc1wiPlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2ludml0ZVRlYW1tYXRlc19pbnZpdGVEaWFsb2dCdXR0b25cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNob3dSb29tSW52aXRlRGlhbG9nKHNwYWNlLnJvb21JZCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcIkludml0ZSBieSB1c2VybmFtZVwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19idXR0b25zXCI+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXtvbkNsaWNrfT5cbiAgICAgICAgICAgICAgICB7IGJ1dHRvbkxhYmVsIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BhY2VSb29tVmlldyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBjcmVhdG9yOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWFkb25seSByaWdodFBhbmVsU3RvcmVUb2tlbjogRXZlbnRTdWJzY3JpcHRpb247XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgbGV0IHBoYXNlID0gUGhhc2UuTGFuZGluZztcblxuICAgICAgICB0aGlzLmNyZWF0b3IgPSB0aGlzLnByb3BzLnNwYWNlLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbUNyZWF0ZSwgXCJcIik/LmdldFNlbmRlcigpO1xuICAgICAgICBjb25zdCBzaG93U2V0dXAgPSB0aGlzLnByb3BzLmp1c3RDcmVhdGVkT3B0cyAmJiB0aGlzLmNvbnRleHQuZ2V0VXNlcklkKCkgPT09IHRoaXMuY3JlYXRvcjtcblxuICAgICAgICBpZiAoc2hvd1NldHVwKSB7XG4gICAgICAgICAgICBwaGFzZSA9IHRoaXMucHJvcHMuanVzdENyZWF0ZWRPcHRzLmNyZWF0ZU9wdHMucHJlc2V0ID09PSBQcmVzZXQuUHVibGljQ2hhdFxuICAgICAgICAgICAgICAgID8gUGhhc2UuUHVibGljQ3JlYXRlUm9vbXMgOiBQaGFzZS5Qcml2YXRlU2NvcGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICBzaG93UmlnaHRQYW5lbDogUmlnaHRQYW5lbFN0b3JlLmdldFNoYXJlZEluc3RhbmNlKCkuaXNPcGVuRm9yUm9vbSxcbiAgICAgICAgICAgIG15TWVtYmVyc2hpcDogdGhpcy5wcm9wcy5zcGFjZS5nZXRNeU1lbWJlcnNoaXAoKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkZWZhdWx0RGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgdGhpcy5yaWdodFBhbmVsU3RvcmVUb2tlbiA9IFJpZ2h0UGFuZWxTdG9yZS5nZXRTaGFyZWRJbnN0YW5jZSgpLmFkZExpc3RlbmVyKHRoaXMub25SaWdodFBhbmVsU3RvcmVVcGRhdGUpO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJSb29tLm15TWVtYmVyc2hpcFwiLCB0aGlzLm9uTXlNZW1iZXJzaGlwKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICB0aGlzLnJpZ2h0UGFuZWxTdG9yZVRva2VuLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmNvbnRleHQub2ZmKFwiUm9vbS5teU1lbWJlcnNoaXBcIiwgdGhpcy5vbk15TWVtYmVyc2hpcCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk15TWVtYmVyc2hpcCA9IChyb29tOiBSb29tLCBteU1lbWJlcnNoaXA6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAocm9vbS5yb29tSWQgPT09IHRoaXMucHJvcHMuc3BhY2Uucm9vbUlkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbXlNZW1iZXJzaGlwIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SaWdodFBhbmVsU3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd1JpZ2h0UGFuZWw6IFJpZ2h0UGFuZWxTdG9yZS5nZXRTaGFyZWRJbnN0YW5jZSgpLmlzT3BlbkZvclJvb20sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uICE9PSBBY3Rpb24uVmlld1VzZXIgJiYgcGF5bG9hZC5hY3Rpb24gIT09IFwidmlld18zcGlkX2ludml0ZVwiKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBBY3Rpb24uVmlld1VzZXIgJiYgcGF5bG9hZC5tZW1iZXIpIHtcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFNldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TZXRSaWdodFBhbmVsUGhhc2UsXG4gICAgICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2VNZW1iZXJJbmZvLFxuICAgICAgICAgICAgICAgIHJlZmlyZVBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBzcGFjZTogdGhpcy5wcm9wcy5zcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyOiBwYXlsb2FkLm1lbWJlcixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09IFwidmlld18zcGlkX2ludml0ZVwiICYmIHBheWxvYWQuZXZlbnQpIHtcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFNldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TZXRSaWdodFBhbmVsUGhhc2UsXG4gICAgICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2UzcGlkTWVtYmVySW5mbyxcbiAgICAgICAgICAgICAgICByZWZpcmVQYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgc3BhY2U6IHRoaXMucHJvcHMuc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBwYXlsb2FkLmV2ZW50LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFNldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TZXRSaWdodFBhbmVsUGhhc2UsXG4gICAgICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2VNZW1iZXJMaXN0LFxuICAgICAgICAgICAgICAgIHJlZmlyZVBhcmFtczogeyBzcGFjZTogdGhpcy5wcm9wcy5zcGFjZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnb1RvRmlyc3RSb29tID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBUT0RPIGFjdHVhbGx5IGdvIHRvIHRoZSBmaXJzdCByb29tXG5cbiAgICAgICAgY29uc3QgY2hpbGRSb29tcyA9IFNwYWNlU3RvcmUuaW5zdGFuY2UuZ2V0Q2hpbGRSb29tcyh0aGlzLnByb3BzLnNwYWNlLnJvb21JZCk7XG4gICAgICAgIGlmIChjaGlsZFJvb21zLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNoaWxkUm9vbXNbMF07XG4gICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfcm9vbVwiLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3VnZ2VzdGVkUm9vbXMgPSBTcGFjZVN0b3JlLmluc3RhbmNlLnN1Z2dlc3RlZFJvb21zO1xuICAgICAgICBpZiAoU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZSAhPT0gdGhpcy5wcm9wcy5zcGFjZSkge1xuICAgICAgICAgICAgLy8gdGhlIHNwYWNlIHN0b3JlIGhhcyB0aGUgc3VnZ2VzdGVkIHJvb21zIGxvYWRlZCBmb3IgYSBkaWZmZXJlbnQgc3BhY2UsIGZldGNoIHRoZSByaWdodCBvbmVzXG4gICAgICAgICAgICBzdWdnZXN0ZWRSb29tcyA9IChhd2FpdCBTcGFjZVN0b3JlLmluc3RhbmNlLmZldGNoU3VnZ2VzdGVkUm9vbXModGhpcy5wcm9wcy5zcGFjZSwgMSkpLnJvb21zO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Z2dlc3RlZFJvb21zLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHN1Z2dlc3RlZFJvb21zWzBdO1xuICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ2aWV3X3Jvb21cIixcbiAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21faWQsXG4gICAgICAgICAgICAgICAgb29iRGF0YToge1xuICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHJvb20uYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcm9vbS5uYW1lIHx8IHJvb20uY2Fub25pY2FsX2FsaWFzIHx8IHJvb20uYWxpYXNlcy5wb3AoKSB8fCBfdChcIkVtcHR5IHJvb21cIiksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5MYW5kaW5nIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckJvZHkoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5waGFzZSkge1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5MYW5kaW5nOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm15TWVtYmVyc2hpcCA9PT0gXCJqb2luXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxTcGFjZUxhbmRpbmcgc3BhY2U9e3RoaXMucHJvcHMuc3BhY2V9IC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiA8U3BhY2VQcmV2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFjZT17dGhpcy5wcm9wcy5zcGFjZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSm9pbkJ1dHRvbkNsaWNrZWQ9e3RoaXMucHJvcHMub25Kb2luQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVqZWN0QnV0dG9uQ2xpY2tlZD17dGhpcy5wcm9wcy5vblJlamVjdEJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgUGhhc2UuUHVibGljQ3JlYXRlUm9vbXM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxTcGFjZVNldHVwRmlyc3RSb29tc1xuICAgICAgICAgICAgICAgICAgICBzcGFjZT17dGhpcy5wcm9wcy5zcGFjZX1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiV2hhdCBhcmUgc29tZSB0aGluZ3MgeW91IHdhbnQgdG8gZGlzY3VzcyBpbiAlKHNwYWNlTmFtZSlzP1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFjZU5hbWU6IHRoaXMucHJvcHMuc3BhY2UubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90KFwiTGV0J3MgY3JlYXRlIGEgcm9vbSBmb3IgZWFjaCBvZiB0aGVtLlwiKSArIFwiXFxuXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgX3QoXCJZb3UgY2FuIGFkZCBtb3JlIGxhdGVyIHRvbywgaW5jbHVkaW5nIGFscmVhZHkgZXhpc3Rpbmcgb25lcy5cIilcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXsoKSA9PiB0aGlzLnNldFN0YXRlKHsgcGhhc2U6IFBoYXNlLlB1YmxpY1NoYXJlIH0pfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5QdWJsaWNTaGFyZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gPFNwYWNlU2V0dXBQdWJsaWNTaGFyZSBzcGFjZT17dGhpcy5wcm9wcy5zcGFjZX0gb25GaW5pc2hlZD17dGhpcy5nb1RvRmlyc3RSb29tfSAvPjtcblxuICAgICAgICAgICAgY2FzZSBQaGFzZS5Qcml2YXRlU2NvcGU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxTcGFjZVNldHVwUHJpdmF0ZVNjb3BlXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlPXt0aGlzLnByb3BzLnNwYWNlfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXsoaW52aXRlOiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGhhc2U6IGludml0ZSA/IFBoYXNlLlByaXZhdGVJbnZpdGUgOiBQaGFzZS5Qcml2YXRlRXhpc3RpbmdSb29tcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuUHJpdmF0ZUludml0ZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gPFNwYWNlU2V0dXBQcml2YXRlSW52aXRlXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlPXt0aGlzLnByb3BzLnNwYWNlfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXsoKSA9PiB0aGlzLnNldFN0YXRlKHsgcGhhc2U6IFBoYXNlLlByaXZhdGVDcmVhdGVSb29tcyB9KX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuUHJpdmF0ZUNyZWF0ZVJvb21zOlxuICAgICAgICAgICAgICAgIHJldHVybiA8U3BhY2VTZXR1cEZpcnN0Um9vbXNcbiAgICAgICAgICAgICAgICAgICAgc3BhY2U9e3RoaXMucHJvcHMuc3BhY2V9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIldoYXQgcHJvamVjdHMgYXJlIHlvdSB3b3JraW5nIG9uP1wiKX1cbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb249e190KFwiV2UnbGwgY3JlYXRlIHJvb21zIGZvciBlYWNoIG9mIHRoZW0uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiWW91IGNhbiBhZGQgbW9yZSBsYXRlciB0b28sIGluY2x1ZGluZyBhbHJlYWR5IGV4aXN0aW5nIG9uZXMuXCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXsoKSA9PiB0aGlzLnNldFN0YXRlKHsgcGhhc2U6IFBoYXNlLkxhbmRpbmcgfSl9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBjYXNlIFBoYXNlLlByaXZhdGVFeGlzdGluZ1Jvb21zOlxuICAgICAgICAgICAgICAgIHJldHVybiA8U3BhY2VBZGRFeGlzdGluZ1Jvb21zXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlPXt0aGlzLnByb3BzLnNwYWNlfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXsoKSA9PiB0aGlzLnNldFN0YXRlKHsgcGhhc2U6IFBoYXNlLkxhbmRpbmcgfSl9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0UGFuZWwgPSB0aGlzLnN0YXRlLnNob3dSaWdodFBhbmVsICYmIHRoaXMuc3RhdGUucGhhc2UgPT09IFBoYXNlLkxhbmRpbmdcbiAgICAgICAgICAgID8gPFJpZ2h0UGFuZWwgcm9vbT17dGhpcy5wcm9wcy5zcGFjZX0gcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9IC8+XG4gICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIDxtYWluIGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdcIj5cbiAgICAgICAgICAgIDxFcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgICAgIDxNYWluU3BsaXQgcGFuZWw9e3JpZ2h0UGFuZWx9IHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckJvZHkoKSB9XG4gICAgICAgICAgICAgICAgPC9NYWluU3BsaXQ+XG4gICAgICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICAgIDwvbWFpbj47XG4gICAgfVxufVxuIl19
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MiniAvatarUploader = _interopRequireWildcard(require("../elements/MiniAvatarUploader"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _SpaceStore = _interopRequireDefault(require("../../../stores/SpaceStore"));

var _space = require("../../../utils/space");

/*
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

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
const NewRoomIntro = () => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const {
    room,
    roomId
  } = (0, _react.useContext)(_RoomContext.default);

  const dmPartner = _DMRoomMap.default.shared().getUserIdForRoomId(roomId);

  let body;

  if (dmPartner) {
    let caption;

    if (room.getJoinedMemberCount() + room.getInvitedMemberCount() === 2) {
      caption = (0, _languageHandler._t)("Only the two of you are in this conversation, unless either of you invites anyone to join.");
    }

    const member = room?.getMember(dmPartner);
    const displayName = member?.rawDisplayName || dmPartner;
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      width: _MiniAvatarUploader.AVATAR_SIZE,
      height: _MiniAvatarUploader.AVATAR_SIZE,
      onClick: () => {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewUser,
          // XXX: We should be using a real member object and not assuming what the receiver wants.
          member: member || {
            userId: dmPartner
          }
        });
      }
    }), /*#__PURE__*/_react.default.createElement("h2", null, room.name), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This is the beginning of your direct message history with <displayName/>.", {}, {
      displayName: () => /*#__PURE__*/_react.default.createElement("b", null, displayName)
    })), caption && /*#__PURE__*/_react.default.createElement("p", null, caption));
  } else {
    const inRoom = room && room.getMyMembership() === "join";
    const topic = room.currentState.getStateEvents(_event.EventType.RoomTopic, "")?.getContent()?.topic;
    const canAddTopic = inRoom && room.currentState.maySendStateEvent(_event.EventType.RoomTopic, cli.getUserId());

    const onTopicClick = () => {
      _dispatcher.default.dispatch({
        action: "open_room_settings",
        room_id: roomId
      }, true); // focus the topic field to help the user find it as it'll gain an outline


      setImmediate(() => {
        window.document.getElementById("profileTopic").focus();
      });
    };

    let topicText;

    if (canAddTopic && topic) {
      topicText = (0, _languageHandler._t)("Topic: %(topic)s (<a>edit</a>)", {
        topic
      }, {
        a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link",
          onClick: onTopicClick
        }, sub)
      });
    } else if (topic) {
      topicText = (0, _languageHandler._t)("Topic: %(topic)s ", {
        topic
      });
    } else if (canAddTopic) {
      topicText = (0, _languageHandler._t)("<a>Add a topic</a> to help people know what it is about.", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link",
          onClick: onTopicClick
        }, sub)
      });
    }

    const creator = room.currentState.getStateEvents(_event.EventType.RoomCreate, "")?.getSender();
    const creatorName = room?.getMember(creator)?.rawDisplayName || creator;
    let createdText;

    if (creator === cli.getUserId()) {
      createdText = (0, _languageHandler._t)("You created this room.");
    } else {
      createdText = (0, _languageHandler._t)("%(displayName)s created this room.", {
        displayName: creatorName
      });
    }

    let parentSpace;

    if (_SpaceStore.default.instance.activeSpace?.canInvite(cli.getUserId()) && _SpaceStore.default.instance.getSpaceFilteredRoomIds(_SpaceStore.default.instance.activeSpace).has(room.roomId)) {
      parentSpace = _SpaceStore.default.instance.activeSpace;
    }

    let buttons;

    if (parentSpace) {
      buttons = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_NewRoomIntro_buttons"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_NewRoomIntro_inviteButton",
        kind: "primary",
        onClick: () => {
          (0, _space.showSpaceInvite)(parentSpace);
        }
      }, (0, _languageHandler._t)("Invite to %(spaceName)s", {
        spaceName: parentSpace.name
      })), room.canInvite(cli.getUserId()) && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_NewRoomIntro_inviteButton",
        kind: "primary_outline",
        onClick: () => {
          _dispatcher.default.dispatch({
            action: "view_invite",
            roomId
          });
        }
      }, (0, _languageHandler._t)("Invite to just this room")));
    } else if (room.canInvite(cli.getUserId())) {
      buttons = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_NewRoomIntro_buttons"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_NewRoomIntro_inviteButton",
        kind: "primary",
        onClick: () => {
          _dispatcher.default.dispatch({
            action: "view_invite",
            roomId
          });
        }
      }, (0, _languageHandler._t)("Invite to this room")));
    }

    const avatarUrl = room.currentState.getStateEvents(_event.EventType.RoomAvatar, "")?.getContent()?.url;
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_MiniAvatarUploader.default, {
      hasAvatar: !!avatarUrl,
      noAvatarLabel: (0, _languageHandler._t)("Add a photo, so people can easily spot your room."),
      setAvatarUrl: url => cli.sendStateEvent(roomId, _event.EventType.RoomAvatar, {
        url
      }, '')
    }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      width: _MiniAvatarUploader.AVATAR_SIZE,
      height: _MiniAvatarUploader.AVATAR_SIZE
    })), /*#__PURE__*/_react.default.createElement("h2", null, room.name), /*#__PURE__*/_react.default.createElement("p", null, createdText, " ", (0, _languageHandler._t)("This is the start of <roomName/>.", {}, {
      roomName: () => /*#__PURE__*/_react.default.createElement("b", null, room.name)
    })), /*#__PURE__*/_react.default.createElement("p", null, topicText), buttons);
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_NewRoomIntro"
  }, body);
};

var _default = NewRoomIntro;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL05ld1Jvb21JbnRyby50c3giXSwibmFtZXMiOlsiTmV3Um9vbUludHJvIiwiY2xpIiwiTWF0cml4Q2xpZW50Q29udGV4dCIsInJvb20iLCJyb29tSWQiLCJSb29tQ29udGV4dCIsImRtUGFydG5lciIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsImJvZHkiLCJjYXB0aW9uIiwiZ2V0Sm9pbmVkTWVtYmVyQ291bnQiLCJnZXRJbnZpdGVkTWVtYmVyQ291bnQiLCJtZW1iZXIiLCJnZXRNZW1iZXIiLCJkaXNwbGF5TmFtZSIsInJhd0Rpc3BsYXlOYW1lIiwiQVZBVEFSX1NJWkUiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiVmlld1VzZXIiLCJ1c2VySWQiLCJuYW1lIiwiaW5Sb29tIiwiZ2V0TXlNZW1iZXJzaGlwIiwidG9waWMiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsIkV2ZW50VHlwZSIsIlJvb21Ub3BpYyIsImdldENvbnRlbnQiLCJjYW5BZGRUb3BpYyIsIm1heVNlbmRTdGF0ZUV2ZW50IiwiZ2V0VXNlcklkIiwib25Ub3BpY0NsaWNrIiwiZGlzIiwicm9vbV9pZCIsInNldEltbWVkaWF0ZSIsIndpbmRvdyIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJmb2N1cyIsInRvcGljVGV4dCIsImEiLCJzdWIiLCJjcmVhdG9yIiwiUm9vbUNyZWF0ZSIsImdldFNlbmRlciIsImNyZWF0b3JOYW1lIiwiY3JlYXRlZFRleHQiLCJwYXJlbnRTcGFjZSIsIlNwYWNlU3RvcmUiLCJpbnN0YW5jZSIsImFjdGl2ZVNwYWNlIiwiY2FuSW52aXRlIiwiZ2V0U3BhY2VGaWx0ZXJlZFJvb21JZHMiLCJoYXMiLCJidXR0b25zIiwic3BhY2VOYW1lIiwiYXZhdGFyVXJsIiwiUm9vbUF2YXRhciIsInVybCIs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QUFHLG1DQUFILEVBQXdDLEVBQXhDLEVBQTRDO0FBQzFEYyxNQUFBQSxRQUFRLEVBQUUsbUJBQU0sd0NBQUsvRCxJQUFJLENBQUNzQixJQUFWO0FBRDBDLEtBQTVDLENBQWxCLENBWEcsZUFjSCx3Q0FBSW9CLFNBQUosQ0FkRyxFQWVEZSxPQWZDLENBQVA7QUFpQkg7O0FBRUQsc0JBQU87QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLEtBQ0RsRCxJQURDLENBQVA7QUFHSCxDQTFJRDs7ZUE0SWVWLFkiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAsIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHt1c2VDb250ZXh0fSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7RXZlbnRUeXBlfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5cbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgUm9vbUNvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gXCIuLi8uLi8uLi91dGlscy9ETVJvb21NYXBcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgTWluaUF2YXRhclVwbG9hZGVyLCB7QVZBVEFSX1NJWkV9IGZyb20gXCIuLi9lbGVtZW50cy9NaW5pQXZhdGFyVXBsb2FkZXJcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQge1ZpZXdVc2VyUGF5bG9hZH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1VzZXJQYXlsb2FkXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1NwYWNlU3RvcmVcIjtcbmltcG9ydCB7c2hvd1NwYWNlSW52aXRlfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc3BhY2VcIjtcblxuY29uc3QgTmV3Um9vbUludHJvID0gKCkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3Qge3Jvb20sIHJvb21JZH0gPSB1c2VDb250ZXh0KFJvb21Db250ZXh0KTtcblxuICAgIGNvbnN0IGRtUGFydG5lciA9IERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbUlkKTtcbiAgICBsZXQgYm9keTtcbiAgICBpZiAoZG1QYXJ0bmVyKSB7XG4gICAgICAgIGxldCBjYXB0aW9uO1xuICAgICAgICBpZiAoKHJvb20uZ2V0Sm9pbmVkTWVtYmVyQ291bnQoKSArIHJvb20uZ2V0SW52aXRlZE1lbWJlckNvdW50KCkpID09PSAyKSB7XG4gICAgICAgICAgICBjYXB0aW9uID0gX3QoXCJPbmx5IHRoZSB0d28gb2YgeW91IGFyZSBpbiB0aGlzIGNvbnZlcnNhdGlvbiwgdW5sZXNzIGVpdGhlciBvZiB5b3UgaW52aXRlcyBhbnlvbmUgdG8gam9pbi5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZW1iZXIgPSByb29tPy5nZXRNZW1iZXIoZG1QYXJ0bmVyKTtcbiAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSBtZW1iZXI/LnJhd0Rpc3BsYXlOYW1lIHx8IGRtUGFydG5lcjtcbiAgICAgICAgYm9keSA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIDxSb29tQXZhdGFyIHJvb209e3Jvb219IHdpZHRoPXtBVkFUQVJfU0laRX0gaGVpZ2h0PXtBVkFUQVJfU0laRX0gb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFZpZXdVc2VyUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3VXNlcixcbiAgICAgICAgICAgICAgICAgICAgLy8gWFhYOiBXZSBzaG91bGQgYmUgdXNpbmcgYSByZWFsIG1lbWJlciBvYmplY3QgYW5kIG5vdCBhc3N1bWluZyB3aGF0IHRoZSByZWNlaXZlciB3YW50cy5cbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyOiBtZW1iZXIgfHwge3VzZXJJZDogZG1QYXJ0bmVyfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH19IC8+XG5cbiAgICAgICAgICAgIDxoMj57IHJvb20ubmFtZSB9PC9oMj5cblxuICAgICAgICAgICAgPHA+e190KFwiVGhpcyBpcyB0aGUgYmVnaW5uaW5nIG9mIHlvdXIgZGlyZWN0IG1lc3NhZ2UgaGlzdG9yeSB3aXRoIDxkaXNwbGF5TmFtZS8+LlwiLCB7fSwge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAoKSA9PiA8Yj57IGRpc3BsYXlOYW1lIH08L2I+LFxuICAgICAgICAgICAgfSl9PC9wPlxuICAgICAgICAgICAgeyBjYXB0aW9uICYmIDxwPnsgY2FwdGlvbiB9PC9wPiB9XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGluUm9vbSA9IHJvb20gJiYgcm9vbS5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCI7XG4gICAgICAgIGNvbnN0IHRvcGljID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21Ub3BpYywgXCJcIik/LmdldENvbnRlbnQoKT8udG9waWM7XG4gICAgICAgIGNvbnN0IGNhbkFkZFRvcGljID0gaW5Sb29tICYmIHJvb20uY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5Sb29tVG9waWMsIGNsaS5nZXRVc2VySWQoKSk7XG5cbiAgICAgICAgY29uc3Qgb25Ub3BpY0NsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwib3Blbl9yb29tX3NldHRpbmdzXCIsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAvLyBmb2N1cyB0aGUgdG9waWMgZmllbGQgdG8gaGVscCB0aGUgdXNlciBmaW5kIGl0IGFzIGl0J2xsIGdhaW4gYW4gb3V0bGluZVxuICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9maWxlVG9waWNcIikuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCB0b3BpY1RleHQ7XG4gICAgICAgIGlmIChjYW5BZGRUb3BpYyAmJiB0b3BpYykge1xuICAgICAgICAgICAgdG9waWNUZXh0ID0gX3QoXCJUb3BpYzogJSh0b3BpYylzICg8YT5lZGl0PC9hPilcIiwgeyB0b3BpYyB9LCB7XG4gICAgICAgICAgICAgICAgYTogc3ViID0+IDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rXCIgb25DbGljaz17b25Ub3BpY0NsaWNrfT57IHN1YiB9PC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRvcGljKSB7XG4gICAgICAgICAgICB0b3BpY1RleHQgPSBfdChcIlRvcGljOiAlKHRvcGljKXMgXCIsIHsgdG9waWMgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2FuQWRkVG9waWMpIHtcbiAgICAgICAgICAgIHRvcGljVGV4dCA9IF90KFwiPGE+QWRkIGEgdG9waWM8L2E+IHRvIGhlbHAgcGVvcGxlIGtub3cgd2hhdCBpdCBpcyBhYm91dC5cIiwge30sIHtcbiAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXtvblRvcGljQ2xpY2t9Pnsgc3ViIH08L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjcmVhdG9yID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21DcmVhdGUsIFwiXCIpPy5nZXRTZW5kZXIoKTtcbiAgICAgICAgY29uc3QgY3JlYXRvck5hbWUgPSByb29tPy5nZXRNZW1iZXIoY3JlYXRvcik/LnJhd0Rpc3BsYXlOYW1lIHx8IGNyZWF0b3I7XG5cbiAgICAgICAgbGV0IGNyZWF0ZWRUZXh0O1xuICAgICAgICBpZiAoY3JlYXRvciA9PT0gY2xpLmdldFVzZXJJZCgpKSB7XG4gICAgICAgICAgICBjcmVhdGVkVGV4dCA9IF90KFwiWW91IGNyZWF0ZWQgdGhpcyByb29tLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNyZWF0ZWRUZXh0ID0gX3QoXCIlKGRpc3BsYXlOYW1lKXMgY3JlYXRlZCB0aGlzIHJvb20uXCIsIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogY3JlYXRvck5hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJlbnRTcGFjZTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZT8uY2FuSW52aXRlKGNsaS5nZXRVc2VySWQoKSkgJiZcbiAgICAgICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2UuZ2V0U3BhY2VGaWx0ZXJlZFJvb21JZHMoU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZSkuaGFzKHJvb20ucm9vbUlkKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHBhcmVudFNwYWNlID0gU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBidXR0b25zO1xuICAgICAgICBpZiAocGFyZW50U3BhY2UpIHtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X05ld1Jvb21JbnRyb19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTmV3Um9vbUludHJvX2ludml0ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1NwYWNlSW52aXRlKHBhcmVudFNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkludml0ZSB0byAlKHNwYWNlTmFtZSlzXCIsIHsgc3BhY2VOYW1lOiBwYXJlbnRTcGFjZS5uYW1lIH0pfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICB7IHJvb20uY2FuSW52aXRlKGNsaS5nZXRVc2VySWQoKSkgJiYgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTmV3Um9vbUludHJvX2ludml0ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X291dGxpbmVcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IFwidmlld19pbnZpdGVcIiwgcm9vbUlkIH0pO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge190KFwiSW52aXRlIHRvIGp1c3QgdGhpcyByb29tXCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4gfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKHJvb20uY2FuSW52aXRlKGNsaS5nZXRVc2VySWQoKSkpIHtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X05ld1Jvb21JbnRyb19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTmV3Um9vbUludHJvX2ludml0ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInZpZXdfaW52aXRlXCIsIHJvb21JZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkludml0ZSB0byB0aGlzIHJvb21cIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXZhdGFyVXJsID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21BdmF0YXIsIFwiXCIpPy5nZXRDb250ZW50KCk/LnVybDtcbiAgICAgICAgYm9keSA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIDxNaW5pQXZhdGFyVXBsb2FkZXJcbiAgICAgICAgICAgICAgICBoYXNBdmF0YXI9eyEhYXZhdGFyVXJsfVxuICAgICAgICAgICAgICAgIG5vQXZhdGFyTGFiZWw9e190KFwiQWRkIGEgcGhvdG8sIHNvIHBlb3BsZSBjYW4gZWFzaWx5IHNwb3QgeW91ciByb29tLlwiKX1cbiAgICAgICAgICAgICAgICBzZXRBdmF0YXJVcmw9e3VybCA9PiBjbGkuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCBFdmVudFR5cGUuUm9vbUF2YXRhciwgeyB1cmwgfSwgJycpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxSb29tQXZhdGFyIHJvb209e3Jvb219IHdpZHRoPXtBVkFUQVJfU0laRX0gaGVpZ2h0PXtBVkFUQVJfU0laRX0gLz5cbiAgICAgICAgICAgIDwvTWluaUF2YXRhclVwbG9hZGVyPlxuXG4gICAgICAgICAgICA8aDI+eyByb29tLm5hbWUgfTwvaDI+XG5cbiAgICAgICAgICAgIDxwPntjcmVhdGVkVGV4dH0ge190KFwiVGhpcyBpcyB0aGUgc3RhcnQgb2YgPHJvb21OYW1lLz4uXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgcm9vbU5hbWU6ICgpID0+IDxiPnsgcm9vbS5uYW1lIH08L2I+LFxuICAgICAgICAgICAgfSl9PC9wPlxuICAgICAgICAgICAgPHA+e3RvcGljVGV4dH08L3A+XG4gICAgICAgICAgICB7IGJ1dHRvbnMgfVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICB9XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9OZXdSb29tSW50cm9cIj5cbiAgICAgICAgeyBib2R5IH1cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBOZXdSb29tSW50cm87XG4iXX0=
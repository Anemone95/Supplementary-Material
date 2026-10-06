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

/*
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

    let canInvite = inRoom;
    const powerLevels = room.currentState.getStateEvents(_event.EventType.RoomPowerLevels, "")?.getContent();
    const me = room.getMember(cli.getUserId());

    if (powerLevels && me && powerLevels.invite > me.powerLevel) {
      canInvite = false;
    }

    let buttons;

    if (canInvite) {
      const onInviteClick = () => {
        _dispatcher.default.dispatch({
          action: "view_invite",
          roomId
        });
      };

      buttons = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_NewRoomIntro_buttons"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_NewRoomIntro_inviteButton",
        kind: "primary",
        onClick: onInviteClick
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL05ld1Jvb21JbnRyby50c3giXSwibmFtZXMiOlsiTmV3Um9vbUludHJvIiwiY2xpIiwiTWF0cml4Q2xpZW50Q29udGV4dCIsInJvb20iLCJyb29tSWQiLCJSb29tQ29udGV4dCIsImRtUGFydG5lciIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsImJvZHkiLCJjYXB0aW9uIiwiZ2V0Sm9pbmVkTWVtYmVyQ291bnQiLCJnZXRJbnZpdGVkTWVtYmVyQ291bnQiLCJtZW1iZXIiLCJnZXRNZW1iZXIiLCJkaXNwbGF5TmFtZSIsInJhd0Rpc3BsYXlOYW1lIiwiQVZBVEFSX1NJWkUiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiVmlld1VzZXIiLCJ1c2VySWQiLCJuYW1lIiwiaW5Sb29tIiwiZ2V0TXlNZW1iZXJzaGlwIiwidG9waWMiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsIkV2ZW50VHlwZSIsIlJvb21Ub3BpYyIsImdldENvbnRlbnQiLCJjYW5BZGRUb3BpYyIsIm1heVNlbmRTdGF0ZUV2ZW50IiwiZ2V0VXNlcklkIiwib25Ub3BpY0NsaWNrIiwiZGlzIiwicm9vbV9pZCIsInNldEltbWVkaWF0ZSIsIndpbmRvdyIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJmb2N1cyIsInRvcGljVGV4dCIsImEiLCJzdWIiLCJjcmVhdG9yIiwiUm9vbUNyZWF0ZSIsImdldFNlbmRlciIsImNyZWF0b3JOYW1lIiwiY3JlYXRlZFRleHQiLCJjYW5JbnZpdGUiLCJwb3dlckxldmVscyIsIlJvb21Qb3dlckxldmVscyIsIm1lIiwiaW52aXRlIiwicG93ZXJMZXZlbCIsImJ1dHRvbnMiLCJvbkludml0ZUNsaWNrIiwiYXZhdGFyVXJsIiwiUm9vbUF2YXRhciIsInVybCIsInNlbmRTdGF0ZUV2ZW50Iiwicm9v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LFNBRGpCO0FBRUksTUFBQSxhQUFhLEVBQUUseUJBQUcsbURBQUgsQ0FGbkI7QUFHSSxNQUFBLFlBQVksRUFBRUUsR0FBRyxJQUFJOUQsR0FBRyxDQUFDK0QsY0FBSixDQUFtQjVELE1BQW5CLEVBQTJCMkIsaUJBQVUrQixVQUFyQyxFQUFpRDtBQUFFQyxRQUFBQTtBQUFGLE9BQWpELEVBQTBELEVBQTFEO0FBSHpCLG9CQUtJLDZCQUFDLG1CQUFEO0FBQVksTUFBQSxJQUFJLEVBQUU1RCxJQUFsQjtBQUF3QixNQUFBLEtBQUssRUFBRWUsK0JBQS9CO0FBQTRDLE1BQUEsTUFBTSxFQUFFQTtBQUFwRCxNQUxKLENBREcsZUFTSCx5Q0FBTWYsSUFBSSxDQUFDc0IsSUFBWCxDQVRHLGVBV0gsd0NBQUkyQixXQUFKLE9BQWtCLHlCQUFHLG1DQUFILEVBQXdDLEVBQXhDLEVBQTRDO0FBQzFEYSxNQUFBQSxRQUFRLEVBQUUsbUJBQU0sd0NBQUs5RCxJQUFJLENBQUNzQixJQUFWO0FBRDBDLEtBQTVDLENBQWxCLENBWEcsZUFjSCx3Q0FBSW9CLFNBQUosQ0FkRyxFQWVEYyxPQWZDLENBQVA7QUFpQkg7O0FBRUQsc0JBQU87QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLEtBQ0RqRCxJQURDLENBQVA7QUFHSCxDQWxIRDs7ZUFvSGVWLFkiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHt1c2VDb250ZXh0fSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7RXZlbnRUeXBlfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5cbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgUm9vbUNvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gXCIuLi8uLi8uLi91dGlscy9ETVJvb21NYXBcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgTWluaUF2YXRhclVwbG9hZGVyLCB7QVZBVEFSX1NJWkV9IGZyb20gXCIuLi9lbGVtZW50cy9NaW5pQXZhdGFyVXBsb2FkZXJcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQge1ZpZXdVc2VyUGF5bG9hZH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1VzZXJQYXlsb2FkXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5cbmNvbnN0IE5ld1Jvb21JbnRybyA9ICgpID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IHtyb29tLCByb29tSWR9ID0gdXNlQ29udGV4dChSb29tQ29udGV4dCk7XG5cbiAgICBjb25zdCBkbVBhcnRuZXIgPSBETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKHJvb21JZCk7XG4gICAgbGV0IGJvZHk7XG4gICAgaWYgKGRtUGFydG5lcikge1xuICAgICAgICBsZXQgY2FwdGlvbjtcbiAgICAgICAgaWYgKChyb29tLmdldEpvaW5lZE1lbWJlckNvdW50KCkgKyByb29tLmdldEludml0ZWRNZW1iZXJDb3VudCgpKSA9PT0gMikge1xuICAgICAgICAgICAgY2FwdGlvbiA9IF90KFwiT25seSB0aGUgdHdvIG9mIHlvdSBhcmUgaW4gdGhpcyBjb252ZXJzYXRpb24sIHVubGVzcyBlaXRoZXIgb2YgeW91IGludml0ZXMgYW55b25lIHRvIGpvaW4uXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWVtYmVyID0gcm9vbT8uZ2V0TWVtYmVyKGRtUGFydG5lcik7XG4gICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gbWVtYmVyPy5yYXdEaXNwbGF5TmFtZSB8fCBkbVBhcnRuZXI7XG4gICAgICAgIGJvZHkgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICA8Um9vbUF2YXRhciByb29tPXtyb29tfSB3aWR0aD17QVZBVEFSX1NJWkV9IGhlaWdodD17QVZBVEFSX1NJWkV9IG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaDxWaWV3VXNlclBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1VzZXIsXG4gICAgICAgICAgICAgICAgICAgIC8vIFhYWDogV2Ugc2hvdWxkIGJlIHVzaW5nIGEgcmVhbCBtZW1iZXIgb2JqZWN0IGFuZCBub3QgYXNzdW1pbmcgd2hhdCB0aGUgcmVjZWl2ZXIgd2FudHMuXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcjogbWVtYmVyIHx8IHt1c2VySWQ6IGRtUGFydG5lcn0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9fSAvPlxuXG4gICAgICAgICAgICA8aDI+eyByb29tLm5hbWUgfTwvaDI+XG5cbiAgICAgICAgICAgIDxwPntfdChcIlRoaXMgaXMgdGhlIGJlZ2lubmluZyBvZiB5b3VyIGRpcmVjdCBtZXNzYWdlIGhpc3Rvcnkgd2l0aCA8ZGlzcGxheU5hbWUvPi5cIiwge30sIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogKCkgPT4gPGI+eyBkaXNwbGF5TmFtZSB9PC9iPixcbiAgICAgICAgICAgIH0pfTwvcD5cbiAgICAgICAgICAgIHsgY2FwdGlvbiAmJiA8cD57IGNhcHRpb24gfTwvcD4gfVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBpblJvb20gPSByb29tICYmIHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiam9pblwiO1xuICAgICAgICBjb25zdCB0b3BpYyA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tVG9waWMsIFwiXCIpPy5nZXRDb250ZW50KCk/LnRvcGljO1xuICAgICAgICBjb25zdCBjYW5BZGRUb3BpYyA9IGluUm9vbSAmJiByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuUm9vbVRvcGljLCBjbGkuZ2V0VXNlcklkKCkpO1xuXG4gICAgICAgIGNvbnN0IG9uVG9waWNDbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcIm9wZW5fcm9vbV9zZXR0aW5nc1wiLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgLy8gZm9jdXMgdGhlIHRvcGljIGZpZWxkIHRvIGhlbHAgdGhlIHVzZXIgZmluZCBpdCBhcyBpdCdsbCBnYWluIGFuIG91dGxpbmVcbiAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZmlsZVRvcGljXCIpLmZvY3VzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgdG9waWNUZXh0O1xuICAgICAgICBpZiAoY2FuQWRkVG9waWMgJiYgdG9waWMpIHtcbiAgICAgICAgICAgIHRvcGljVGV4dCA9IF90KFwiVG9waWM6ICUodG9waWMpcyAoPGE+ZWRpdDwvYT4pXCIsIHsgdG9waWMgfSwge1xuICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua1wiIG9uQ2xpY2s9e29uVG9waWNDbGlja30+eyBzdWIgfTwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0b3BpYykge1xuICAgICAgICAgICAgdG9waWNUZXh0ID0gX3QoXCJUb3BpYzogJSh0b3BpYylzIFwiLCB7IHRvcGljIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGNhbkFkZFRvcGljKSB7XG4gICAgICAgICAgICB0b3BpY1RleHQgPSBfdChcIjxhPkFkZCBhIHRvcGljPC9hPiB0byBoZWxwIHBlb3BsZSBrbm93IHdoYXQgaXQgaXMgYWJvdXQuXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgYTogc3ViID0+IDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rXCIgb25DbGljaz17b25Ub3BpY0NsaWNrfT57IHN1YiB9PC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3JlYXRvciA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tQ3JlYXRlLCBcIlwiKT8uZ2V0U2VuZGVyKCk7XG4gICAgICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gcm9vbT8uZ2V0TWVtYmVyKGNyZWF0b3IpPy5yYXdEaXNwbGF5TmFtZSB8fCBjcmVhdG9yO1xuXG4gICAgICAgIGxldCBjcmVhdGVkVGV4dDtcbiAgICAgICAgaWYgKGNyZWF0b3IgPT09IGNsaS5nZXRVc2VySWQoKSkge1xuICAgICAgICAgICAgY3JlYXRlZFRleHQgPSBfdChcIllvdSBjcmVhdGVkIHRoaXMgcm9vbS5cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjcmVhdGVkVGV4dCA9IF90KFwiJShkaXNwbGF5TmFtZSlzIGNyZWF0ZWQgdGhpcyByb29tLlwiLCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IGNyZWF0b3JOYW1lLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2FuSW52aXRlID0gaW5Sb29tO1xuICAgICAgICBjb25zdCBwb3dlckxldmVscyA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHMsIFwiXCIpPy5nZXRDb250ZW50KCk7XG4gICAgICAgIGNvbnN0IG1lID0gcm9vbS5nZXRNZW1iZXIoY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgaWYgKHBvd2VyTGV2ZWxzICYmIG1lICYmIHBvd2VyTGV2ZWxzLmludml0ZSA+IG1lLnBvd2VyTGV2ZWwpIHtcbiAgICAgICAgICAgIGNhbkludml0ZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJ1dHRvbnM7XG4gICAgICAgIGlmIChjYW5JbnZpdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG9uSW52aXRlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInZpZXdfaW52aXRlXCIsIHJvb21JZCB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X05ld1Jvb21JbnRyb19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfTmV3Um9vbUludHJvX2ludml0ZUJ1dHRvblwiIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17b25JbnZpdGVDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkludml0ZSB0byB0aGlzIHJvb21cIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhdmF0YXJVcmwgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbUF2YXRhciwgXCJcIik/LmdldENvbnRlbnQoKT8udXJsO1xuICAgICAgICBib2R5ID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgPE1pbmlBdmF0YXJVcGxvYWRlclxuICAgICAgICAgICAgICAgIGhhc0F2YXRhcj17ISFhdmF0YXJVcmx9XG4gICAgICAgICAgICAgICAgbm9BdmF0YXJMYWJlbD17X3QoXCJBZGQgYSBwaG90bywgc28gcGVvcGxlIGNhbiBlYXNpbHkgc3BvdCB5b3VyIHJvb20uXCIpfVxuICAgICAgICAgICAgICAgIHNldEF2YXRhclVybD17dXJsID0+IGNsaS5zZW5kU3RhdGVFdmVudChyb29tSWQsIEV2ZW50VHlwZS5Sb29tQXZhdGFyLCB7IHVybCB9LCAnJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFJvb21BdmF0YXIgcm9vbT17cm9vbX0gd2lkdGg9e0FWQVRBUl9TSVpFfSBoZWlnaHQ9e0FWQVRBUl9TSVpFfSAvPlxuICAgICAgICAgICAgPC9NaW5pQXZhdGFyVXBsb2FkZXI+XG5cbiAgICAgICAgICAgIDxoMj57IHJvb20ubmFtZSB9PC9oMj5cblxuICAgICAgICAgICAgPHA+e2NyZWF0ZWRUZXh0fSB7X3QoXCJUaGlzIGlzIHRoZSBzdGFydCBvZiA8cm9vbU5hbWUvPi5cIiwge30sIHtcbiAgICAgICAgICAgICAgICByb29tTmFtZTogKCkgPT4gPGI+eyByb29tLm5hbWUgfTwvYj4sXG4gICAgICAgICAgICB9KX08L3A+XG4gICAgICAgICAgICA8cD57dG9waWNUZXh0fTwvcD5cbiAgICAgICAgICAgIHsgYnV0dG9ucyB9XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgIH1cblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X05ld1Jvb21JbnRyb1wiPlxuICAgICAgICB7IGJvZHkgfVxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE5ld1Jvb21JbnRybztcbiJdfQ==
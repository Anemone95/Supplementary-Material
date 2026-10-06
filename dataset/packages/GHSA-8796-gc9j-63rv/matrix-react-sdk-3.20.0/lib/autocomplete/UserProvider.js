"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../languageHandler");

var _AutocompleteProvider = _interopRequireDefault(require("./AutocompleteProvider"));

var _Components = require("./Components");

var sdk = _interopRequireWildcard(require("../index"));

var _QueryMatcher = _interopRequireDefault(require("./QueryMatcher"));

var _lodash = require("lodash");

var _MatrixClientPeg = require("../MatrixClientPeg");

var _Permalinks = require("../utils/permalinks/Permalinks");

/*
Copyright 2016 Aviral Dasgupta
Copyright 2017 Vector Creations Ltd
Copyright 2017, 2018 New Vector Ltd
Copyright 2018 Michael Telatynski <7t3chguy@gmail.com>

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
const USER_REGEX = /\B@\S*/g; // used when you hit 'tab' - we allow some separator chars at the beginning
// to allow you to tab-complete /mat into /(matthew)

const FORCED_USER_REGEX = /[^/,:; \t\n]\S*/g;

class UserProvider extends _AutocompleteProvider.default {
  constructor(_room
  /*: Room*/
  ) {
    super(USER_REGEX, FORCED_USER_REGEX);
    (0, _defineProperty2.default)(this, "matcher", void 0);
    (0, _defineProperty2.default)(this, "users", void 0);
    (0, _defineProperty2.default)(this, "room", void 0);
    (0, _defineProperty2.default)(this, "onRoomTimeline", (ev
    /*: MatrixEvent*/
    , room
    /*: Room*/
    , toStartOfTimeline
    /*: boolean*/
    , removed
    /*: boolean*/
    , data
    /*: IRoomTimelineData*/
    ) => {
      if (!room) return;
      if (removed) return;
      if (room.roomId !== this.room.roomId) return; // ignore events from filtered timelines

      if (data.timeline.getTimelineSet() !== room.getUnfilteredTimelineSet()) return; // ignore anything but real-time updates at the end of the room:
      // updates from pagination will happen when the paginate completes.

      if (toStartOfTimeline || !data || !data.liveEvent) return; // TODO: lazyload if we have no ev.sender room member?

      this.onUserSpoke(ev.sender);
    });
    (0, _defineProperty2.default)(this, "onRoomStateMember", (ev
    /*: MatrixEvent*/
    , state
    /*: RoomState*/
    , member
    /*: RoomMember*/
    ) => {
      // ignore members in other rooms
      if (member.roomId !== this.room.roomId) {
        return;
      } // blow away the users cache


      this.users = null;
    });
    this.room = _room;
    this.matcher = new _QueryMatcher.default([], {
      keys: ['name'],
      funcs: [obj => obj.userId.slice(1)],
      // index by user id minus the leading '@'
      shouldMatchWordsOnly: false
    });

    _MatrixClientPeg.MatrixClientPeg.get().on("Room.timeline", this.onRoomTimeline);

    _MatrixClientPeg.MatrixClientPeg.get().on("RoomState.members", this.onRoomStateMember);
  }

  destroy() {
    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().removeListener("Room.timeline", this.onRoomTimeline);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener("RoomState.members", this.onRoomStateMember);
    }
  }

  async getCompletions(rawQuery
  /*: string*/
  , selection
  /*: ISelectionRange*/
  , force = false)
  /*: Promise<ICompletion[]>*/
  {
    const MemberAvatar = sdk.getComponent('views.avatars.MemberAvatar'); // lazy-load user list into matcher

    if (!this.users) this._makeUsers();
    let completions = [];
    const {
      command,
      range
    } = this.getCurrentCommand(rawQuery, selection, force);
    if (!command) return completions;
    const fullMatch = command[0]; // Don't search if the query is a single "@"

    if (fullMatch && fullMatch !== '@') {
      // Don't include the '@' in our search query - it's only used as a way to trigger completion
      const query = fullMatch.startsWith('@') ? fullMatch.substring(1) : fullMatch;
      completions = this.matcher.match(query).map(user => {
        const displayName = user.name || user.userId || '';
        return {
          // Length of completion should equal length of text in decorator. draft-js
          // relies on the length of the entity === length of the text in the decoration.
          completion: user.rawDisplayName,
          completionId: user.userId,
          type: "user",
          suffix: selection.beginning && range.start === 0 ? ': ' : ' ',
          href: (0, _Permalinks.makeUserPermalink)(user.userId),
          component: /*#__PURE__*/_react.default.createElement(_Components.PillCompletion, {
            title: displayName,
            description: user.userId
          }, /*#__PURE__*/_react.default.createElement(MemberAvatar, {
            member: user,
            width: 24,
            height: 24
          })),
          range
        };
      });
    }

    return completions;
  }

  getName()
  /*: string*/
  {
    return (0, _languageHandler._t)('Users');
  }

  _makeUsers() {
    const events = this.room.getLiveTimeline().getEvents();
    const lastSpoken = {};

    for (const event of events) {
      lastSpoken[event.getSender()] = event.getTs();
    }

    const currentUserId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId;

    this.users = this.room.getJoinedMembers().filter(({
      userId
    }) => userId !== currentUserId);
    this.users = this.users.concat(this.room.getMembersWithMembership("invite"));
    this.users = (0, _lodash.sortBy)(this.users, member => 1E20 - lastSpoken[member.userId] || 1E20);
    this.matcher.setObjects(this.users);
  }

  onUserSpoke(user
  /*: RoomMember*/
  ) {
    if (!this.users) return;
    if (!user) return;
    if (user.userId === _MatrixClientPeg.MatrixClientPeg.get().credentials.userId) return; // Move the user that spoke to the front of the array

    this.users.splice(this.users.findIndex(user2 => user2.userId === user.userId), 1);
    this.users = [user, ...this.users];
    this.matcher.setObjects(this.users);
  }

  renderCompletions(completions
  /*: React.ReactNode[]*/
  )
  /*: React.ReactNode*/
  {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Autocomplete_Completion_container_pill",
      role: "listbox",
      "aria-label": (0, _languageHandler._t)("User Autocomplete")
    }, completions);
  }

  shouldForceComplete()
  /*: boolean*/
  {
    return true;
  }

}

exports.default = UserProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRvY29tcGxldGUvVXNlclByb3ZpZGVyLnRzeCJdLCJuYW1lcyI6WyJVU0VSX1JFR0VYIiwiRk9SQ0VEX1VTRVJfUkVHRVgiLCJVc2VyUHJvdmlkZXIiLCJBdXRvY29tcGxldGVQcm92aWRlciIsImNvbnN0cnVjdG9yIiwicm9vbSIsImV2IiwidG9TdGFydE9mVGltZWxpbmUiLCJyZW1vdmVkIiwiZGF0YSIsInJvb21JZCIsInRpbWVsaW5lIiwiZ2V0VGltZWxpbmVTZXQiLCJnZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQiLCJsaXZlRXZlbnQiLCJvblVzZXJTcG9rZSIsInNlbmRlciIsInN0YXRlIiwibWVtYmVyIiwidXNlcnMiLCJtYXRjaGVyIiwiUXVlcnlNYXRjaGVyIiwia2V5cyIsImZ1bmNzIiwib2JqIiwidXNlcklkIiwic2xpY2UiLCJzaG91bGRNYXRjaFdvcmRzT25seSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm9uIiwib25Sb29tVGltZWxpbmUiLCJvblJvb21TdGF0ZU1lbWJlciIsImRlc3Ryb3kiLCJyZW1vdmVMaXN0ZW5lciIsImdldENvbXBsZXRpb25zIiwicmF3UXVlcnkiLCJzZWxlY3Rpb24iLCJmb3JjZSIsIk1lbWJlckF2YXRhciIsInNkayIsImdldENvbXBvbmVudCIsIl9tYWtlVXNlcnMiLCJjb21wbGV0aW9ucyIsImNvbW1hbmQiLCJyYW5nZSIsImdldEN1cnJlbnRDb21tYW5kIiwiZnVsbE1hdGNoIiwicXVlcnkiLCJzdGFydHNXaXRoIiwic3Vic3RyaW5nIiwibWF0Y2giLCJtYXAiLCJ1c2VyIiwiZGlzcGxheU5hbWUiLCJuYW1lIiwiY29tcGxldGlvbiIsInJhd0Rpc3BsYXlOYW1lIiwiY29tcGxldGlvbklkIiwidHlwZSIsInN1ZmZpeCIsImJlZ2lubmluZyIsInN0YXJ0IiwiaHJlZiIsImNvbXBvbmVudCIsImdldE5hbWUiLCJldmVudHMiLCJnZXRMaXZlVGltZWxpbmUiLCJnZXRFdmVudHMiLCJsYXN0U3Bva2VuIiwiZXZlbnQiLCJnZXRTZW5kZXIiLCJnZXRUcyIsImN1cnJlbnRVc2VySWQiLCJjcmVkZW50aWFscyIsImdldEpvaW5lZE1lbWJlcnMiLCJmaWx0ZXIiLCJjb25jYXQiLCJnZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAiLCJzZXRPYmplY3RzIiwic3BsaWNlIiwiZmluZEluZGV4IiwidXNlcjIiLCJyZW5kZXJDb21wbGV0aW9ucyIsInNob3VsZEZvcmNlQ29tcGxldGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBT0E7O0FBakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW1CQSxNQUFNQSxVQUFVLEdBQUcsU0FBbkIsQyxDQUVBO0FBQ0E7O0FBQ0EsTUFBTUMsaUJBQWlCLEdBQUcsa0JBQTFCOztBQU9lLE1BQU1DLFlBQU4sU0FBMkJDLDZCQUEzQixDQUFnRDtBQUszREMsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBYTtBQUNwQixVQUFNTCxVQUFOLEVBQWtCQyxpQkFBbEI7QUFEb0I7QUFBQTtBQUFBO0FBQUEsMERBb0JDLENBQ3JCSztBQURxQjtBQUFBLE1BRXJCRDtBQUZxQjtBQUFBLE1BR3JCRTtBQUhxQjtBQUFBLE1BSXJCQztBQUpxQjtBQUFBLE1BS3JCQztBQUxxQjtBQUFBLFNBTXBCO0FBQ0QsVUFBSSxDQUFDSixJQUFMLEVBQVc7QUFDWCxVQUFJRyxPQUFKLEVBQWE7QUFDYixVQUFJSCxJQUFJLENBQUNLLE1BQUwsS0FBZ0IsS0FBS0wsSUFBTCxDQUFVSyxNQUE5QixFQUFzQyxPQUhyQyxDQUtEOztBQUNBLFVBQUlELElBQUksQ0FBQ0UsUUFBTCxDQUFjQyxjQUFkLE9BQW1DUCxJQUFJLENBQUNRLHdCQUFMLEVBQXZDLEVBQXdFLE9BTnZFLENBUUQ7QUFD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QUFFRHlDLEVBQUFBLG1CQUFtQjtBQUFBO0FBQVk7QUFDM0IsV0FBTyxJQUFQO0FBQ0g7O0FBL0kwRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBBdmlyYWwgRGFzZ3VwdGFcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxNywgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTggTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBdXRvY29tcGxldGVQcm92aWRlciBmcm9tICcuL0F1dG9jb21wbGV0ZVByb3ZpZGVyJztcbmltcG9ydCB7UGlsbENvbXBsZXRpb259IGZyb20gJy4vQ29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IFF1ZXJ5TWF0Y2hlciBmcm9tICcuL1F1ZXJ5TWF0Y2hlcic7XG5pbXBvcnQge3NvcnRCeX0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuXG5pbXBvcnQgTWF0cml4RXZlbnQgZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IFJvb20gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgUm9vbU1lbWJlciBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyXCI7XG5pbXBvcnQgUm9vbVN0YXRlIGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1zdGF0ZVwiO1xuaW1wb3J0IEV2ZW50VGltZWxpbmUgZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudC10aW1lbGluZVwiO1xuaW1wb3J0IHttYWtlVXNlclBlcm1hbGlua30gZnJvbSBcIi4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IHtJQ29tcGxldGlvbiwgSVNlbGVjdGlvblJhbmdlfSBmcm9tIFwiLi9BdXRvY29tcGxldGVyXCI7XG5cbmNvbnN0IFVTRVJfUkVHRVggPSAvXFxCQFxcUyovZztcblxuLy8gdXNlZCB3aGVuIHlvdSBoaXQgJ3RhYicgLSB3ZSBhbGxvdyBzb21lIHNlcGFyYXRvciBjaGFycyBhdCB0aGUgYmVnaW5uaW5nXG4vLyB0byBhbGxvdyB5b3UgdG8gdGFiLWNvbXBsZXRlIC9tYXQgaW50byAvKG1hdHRoZXcpXG5jb25zdCBGT1JDRURfVVNFUl9SRUdFWCA9IC9bXi8sOjsgXFx0XFxuXVxcUyovZztcblxuaW50ZXJmYWNlIElSb29tVGltZWxpbmVEYXRhIHtcbiAgICB0aW1lbGluZTogRXZlbnRUaW1lbGluZTtcbiAgICBsaXZlRXZlbnQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2VyUHJvdmlkZXIgZXh0ZW5kcyBBdXRvY29tcGxldGVQcm92aWRlciB7XG4gICAgbWF0Y2hlcjogUXVlcnlNYXRjaGVyPFJvb21NZW1iZXI+O1xuICAgIHVzZXJzOiBSb29tTWVtYmVyW107XG4gICAgcm9vbTogUm9vbTtcblxuICAgIGNvbnN0cnVjdG9yKHJvb206IFJvb20pIHtcbiAgICAgICAgc3VwZXIoVVNFUl9SRUdFWCwgRk9SQ0VEX1VTRVJfUkVHRVgpO1xuICAgICAgICB0aGlzLnJvb20gPSByb29tO1xuICAgICAgICB0aGlzLm1hdGNoZXIgPSBuZXcgUXVlcnlNYXRjaGVyKFtdLCB7XG4gICAgICAgICAgICBrZXlzOiBbJ25hbWUnXSxcbiAgICAgICAgICAgIGZ1bmNzOiBbb2JqID0+IG9iai51c2VySWQuc2xpY2UoMSldLCAvLyBpbmRleCBieSB1c2VyIGlkIG1pbnVzIHRoZSBsZWFkaW5nICdAJ1xuICAgICAgICAgICAgc2hvdWxkTWF0Y2hXb3Jkc09ubHk6IGZhbHNlLFxuICAgICAgICB9KTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tLnRpbWVsaW5lXCIsIHRoaXMub25Sb29tVGltZWxpbmUpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tU3RhdGUubWVtYmVyc1wiLCB0aGlzLm9uUm9vbVN0YXRlTWVtYmVyKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpKSB7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoXCJSb29tLnRpbWVsaW5lXCIsIHRoaXMub25Sb29tVGltZWxpbmUpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKFwiUm9vbVN0YXRlLm1lbWJlcnNcIiwgdGhpcy5vblJvb21TdGF0ZU1lbWJlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUm9vbVRpbWVsaW5lID0gKFxuICAgICAgICBldjogTWF0cml4RXZlbnQsXG4gICAgICAgIHJvb206IFJvb20sXG4gICAgICAgIHRvU3RhcnRPZlRpbWVsaW5lOiBib29sZWFuLFxuICAgICAgICByZW1vdmVkOiBib29sZWFuLFxuICAgICAgICBkYXRhOiBJUm9vbVRpbWVsaW5lRGF0YSxcbiAgICApID0+IHtcbiAgICAgICAgaWYgKCFyb29tKSByZXR1cm47XG4gICAgICAgIGlmIChyZW1vdmVkKSByZXR1cm47XG4gICAgICAgIGlmIChyb29tLnJvb21JZCAhPT0gdGhpcy5yb29tLnJvb21JZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZnJvbSBmaWx0ZXJlZCB0aW1lbGluZXNcbiAgICAgICAgaWYgKGRhdGEudGltZWxpbmUuZ2V0VGltZWxpbmVTZXQoKSAhPT0gcm9vbS5nZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQoKSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBhbnl0aGluZyBidXQgcmVhbC10aW1lIHVwZGF0ZXMgYXQgdGhlIGVuZCBvZiB0aGUgcm9vbTpcbiAgICAgICAgLy8gdXBkYXRlcyBmcm9tIHBhZ2luYXRpb24gd2lsbCBoYXBwZW4gd2hlbiB0aGUgcGFnaW5hdGUgY29tcGxldGVzLlxuICAgICAgICBpZiAodG9TdGFydE9mVGltZWxpbmUgfHwgIWRhdGEgfHwgIWRhdGEubGl2ZUV2ZW50KSByZXR1cm47XG5cbiAgICAgICAgLy8gVE9ETzogbGF6eWxvYWQgaWYgd2UgaGF2ZSBubyBldi5zZW5kZXIgcm9vbSBtZW1iZXI/XG4gICAgICAgIHRoaXMub25Vc2VyU3Bva2UoZXYuc2VuZGVyKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21TdGF0ZU1lbWJlciA9IChldjogTWF0cml4RXZlbnQsIHN0YXRlOiBSb29tU3RhdGUsIG1lbWJlcjogUm9vbU1lbWJlcikgPT4ge1xuICAgICAgICAvLyBpZ25vcmUgbWVtYmVycyBpbiBvdGhlciByb29tc1xuICAgICAgICBpZiAobWVtYmVyLnJvb21JZCAhPT0gdGhpcy5yb29tLnJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYmxvdyBhd2F5IHRoZSB1c2VycyBjYWNoZVxuICAgICAgICB0aGlzLnVzZXJzID0gbnVsbDtcbiAgICB9O1xuXG4gICAgYXN5bmMgZ2V0Q29tcGxldGlvbnMocmF3UXVlcnk6IHN0cmluZywgc2VsZWN0aW9uOiBJU2VsZWN0aW9uUmFuZ2UsIGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPElDb21wbGV0aW9uW10+IHtcbiAgICAgICAgY29uc3QgTWVtYmVyQXZhdGFyID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuYXZhdGFycy5NZW1iZXJBdmF0YXInKTtcblxuICAgICAgICAvLyBsYXp5LWxvYWQgdXNlciBsaXN0IGludG8gbWF0Y2hlclxuICAgICAgICBpZiAoIXRoaXMudXNlcnMpIHRoaXMuX21ha2VVc2VycygpO1xuXG4gICAgICAgIGxldCBjb21wbGV0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCB7Y29tbWFuZCwgcmFuZ2V9ID0gdGhpcy5nZXRDdXJyZW50Q29tbWFuZChyYXdRdWVyeSwgc2VsZWN0aW9uLCBmb3JjZSk7XG5cbiAgICAgICAgaWYgKCFjb21tYW5kKSByZXR1cm4gY29tcGxldGlvbnM7XG5cbiAgICAgICAgY29uc3QgZnVsbE1hdGNoID0gY29tbWFuZFswXTtcbiAgICAgICAgLy8gRG9uJ3Qgc2VhcmNoIGlmIHRoZSBxdWVyeSBpcyBhIHNpbmdsZSBcIkBcIlxuICAgICAgICBpZiAoZnVsbE1hdGNoICYmIGZ1bGxNYXRjaCAhPT0gJ0AnKSB7XG4gICAgICAgICAgICAvLyBEb24ndCBpbmNsdWRlIHRoZSAnQCcgaW4gb3VyIHNlYXJjaCBxdWVyeSAtIGl0J3Mgb25seSB1c2VkIGFzIGEgd2F5IHRvIHRyaWdnZXIgY29tcGxldGlvblxuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSBmdWxsTWF0Y2guc3RhcnRzV2l0aCgnQCcpID8gZnVsbE1hdGNoLnN1YnN0cmluZygxKSA6IGZ1bGxNYXRjaDtcbiAgICAgICAgICAgIGNvbXBsZXRpb25zID0gdGhpcy5tYXRjaGVyLm1hdGNoKHF1ZXJ5KS5tYXAoKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9ICh1c2VyLm5hbWUgfHwgdXNlci51c2VySWQgfHwgJycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIExlbmd0aCBvZiBjb21wbGV0aW9uIHNob3VsZCBlcXVhbCBsZW5ndGggb2YgdGV4dCBpbiBkZWNvcmF0b3IuIGRyYWZ0LWpzXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlbGllcyBvbiB0aGUgbGVuZ3RoIG9mIHRoZSBlbnRpdHkgPT09IGxlbmd0aCBvZiB0aGUgdGV4dCBpbiB0aGUgZGVjb3JhdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGlvbjogdXNlci5yYXdEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGlvbklkOiB1c2VyLnVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ1c2VyXCIsXG4gICAgICAgICAgICAgICAgICAgIHN1ZmZpeDogKHNlbGVjdGlvbi5iZWdpbm5pbmcgJiYgcmFuZ2Uuc3RhcnQgPT09IDApID8gJzogJyA6ICcgJyxcbiAgICAgICAgICAgICAgICAgICAgaHJlZjogbWFrZVVzZXJQZXJtYWxpbmsodXNlci51c2VySWQpLFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxQaWxsQ29tcGxldGlvbiB0aXRsZT17ZGlzcGxheU5hbWV9IGRlc2NyaXB0aW9uPXt1c2VyLnVzZXJJZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPE1lbWJlckF2YXRhciBtZW1iZXI9e3VzZXJ9IHdpZHRoPXsyNH0gaGVpZ2h0PXsyNH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvUGlsbENvbXBsZXRpb24+XG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcGxldGlvbnM7XG4gICAgfVxuXG4gICAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gX3QoJ1VzZXJzJyk7XG4gICAgfVxuXG4gICAgX21ha2VVc2VycygpIHtcbiAgICAgICAgY29uc3QgZXZlbnRzID0gdGhpcy5yb29tLmdldExpdmVUaW1lbGluZSgpLmdldEV2ZW50cygpO1xuICAgICAgICBjb25zdCBsYXN0U3Bva2VuID0ge307XG5cbiAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcbiAgICAgICAgICAgIGxhc3RTcG9rZW5bZXZlbnQuZ2V0U2VuZGVyKCldID0gZXZlbnQuZ2V0VHMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkO1xuICAgICAgICB0aGlzLnVzZXJzID0gdGhpcy5yb29tLmdldEpvaW5lZE1lbWJlcnMoKS5maWx0ZXIoKHt1c2VySWR9KSA9PiB1c2VySWQgIT09IGN1cnJlbnRVc2VySWQpO1xuICAgICAgICB0aGlzLnVzZXJzID0gdGhpcy51c2Vycy5jb25jYXQodGhpcy5yb29tLmdldE1lbWJlcnNXaXRoTWVtYmVyc2hpcChcImludml0ZVwiKSk7XG5cbiAgICAgICAgdGhpcy51c2VycyA9IHNvcnRCeSh0aGlzLnVzZXJzLCAobWVtYmVyKSA9PiAxRTIwIC0gbGFzdFNwb2tlblttZW1iZXIudXNlcklkXSB8fCAxRTIwKTtcblxuICAgICAgICB0aGlzLm1hdGNoZXIuc2V0T2JqZWN0cyh0aGlzLnVzZXJzKTtcbiAgICB9XG5cbiAgICBvblVzZXJTcG9rZSh1c2VyOiBSb29tTWVtYmVyKSB7XG4gICAgICAgIGlmICghdGhpcy51c2VycykgcmV0dXJuO1xuICAgICAgICBpZiAoIXVzZXIpIHJldHVybjtcbiAgICAgICAgaWYgKHVzZXIudXNlcklkID09PSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkKSByZXR1cm47XG5cbiAgICAgICAgLy8gTW92ZSB0aGUgdXNlciB0aGF0IHNwb2tlIHRvIHRoZSBmcm9udCBvZiB0aGUgYXJyYXlcbiAgICAgICAgdGhpcy51c2Vycy5zcGxpY2UoXG4gICAgICAgICAgICB0aGlzLnVzZXJzLmZpbmRJbmRleCgodXNlcjIpID0+IHVzZXIyLnVzZXJJZCA9PT0gdXNlci51c2VySWQpLCAxKTtcbiAgICAgICAgdGhpcy51c2VycyA9IFt1c2VyLCAuLi50aGlzLnVzZXJzXTtcblxuICAgICAgICB0aGlzLm1hdGNoZXIuc2V0T2JqZWN0cyh0aGlzLnVzZXJzKTtcbiAgICB9XG5cbiAgICByZW5kZXJDb21wbGV0aW9ucyhjb21wbGV0aW9uczogUmVhY3QuUmVhY3ROb2RlW10pOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0F1dG9jb21wbGV0ZV9Db21wbGV0aW9uX2NvbnRhaW5lcl9waWxsXCJcbiAgICAgICAgICAgICAgICByb2xlPVwibGlzdGJveFwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJVc2VyIEF1dG9jb21wbGV0ZVwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGNvbXBsZXRpb25zIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHNob3VsZEZvcmNlQ29tcGxldGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiJdfQ==
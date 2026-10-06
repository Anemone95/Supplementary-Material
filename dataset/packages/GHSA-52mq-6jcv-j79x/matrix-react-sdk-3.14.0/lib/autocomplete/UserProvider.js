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
      shouldMatchPrefix: true,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRvY29tcGxldGUvVXNlclByb3ZpZGVyLnRzeCJdLCJuYW1lcyI6WyJVU0VSX1JFR0VYIiwiRk9SQ0VEX1VTRVJfUkVHRVgiLCJVc2VyUHJvdmlkZXIiLCJBdXRvY29tcGxldGVQcm92aWRlciIsImNvbnN0cnVjdG9yIiwicm9vbSIsImV2IiwidG9TdGFydE9mVGltZWxpbmUiLCJyZW1vdmVkIiwiZGF0YSIsInJvb21JZCIsInRpbWVsaW5lIiwiZ2V0VGltZWxpbmVTZXQiLCJnZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQiLCJsaXZlRXZlbnQiLCJvblVzZXJTcG9rZSIsInNlbmRlciIsInN0YXRlIiwibWVtYmVyIiwidXNlcnMiLCJtYXRjaGVyIiwiUXVlcnlNYXRjaGVyIiwia2V5cyIsImZ1bmNzIiwib2JqIiwidXNlcklkIiwic2xpY2UiLCJzaG91bGRNYXRjaFByZWZpeCIsInNob3VsZE1hdGNoV29yZHNPbmx5IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwib24iLCJvblJvb21UaW1lbGluZSIsIm9uUm9vbVN0YXRlTWVtYmVyIiwiZGVzdHJveSIsInJlbW92ZUxpc3RlbmVyIiwiZ2V0Q29tcGxldGlvbnMiLCJyYXdRdWVyeSIsInNlbGVjdGlvbiIsImZvcmNlIiwiTWVtYmVyQXZhdGFyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiX21ha2VVc2VycyIsImNvbXBsZXRpb25zIiwiY29tbWFuZCIsInJhbmdlIiwiZ2V0Q3VycmVudENvbW1hbmQiLCJmdWxsTWF0Y2giLCJxdWVyeSIsInN0YXJ0c1dpdGgiLCJzdWJzdHJpbmciLCJtYXRjaCIsIm1hcCIsInVzZXIiLCJkaXNwbGF5TmFtZSIsIm5hbWUiLCJjb21wbGV0aW9uIiwicmF3RGlzcGxheU5hbWUiLCJjb21wbGV0aW9uSWQiLCJ0eXBlIiwic3VmZml4IiwiYmVnaW5uaW5nIiwic3RhcnQiLCJocmVmIiwiY29tcG9uZW50IiwiZ2V0TmFtZSIsImV2ZW50cyIsImdldExpdmVUaW1lbGluZSIsImdldEV2ZW50cyIsImxhc3RTcG9rZW4iLCJldmVudCIsImdldFNlbmRlciIsImdldFRzIiwiY3VycmVudFVzZXJJZCIsImNyZWRlbnRpYWxzIiwiZ2V0Sm9pbmVkTWVtYmVycyIsImZpbHRlciIsInNldE9iamVjdHMiLCJzcGxpY2UiLCJmaW5kSW5kZXgiLCJ1c2VyMiIsInJlbmRlckNvbXBsZXRpb25zIiwic2hvdWxkRm9yY2VDb21wbGV0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFPQTs7QUFqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbUJBLE1BQU1BLFVBQVUsR0FBRyxTQUFuQixDLENBRUE7QUFDQTs7QUFDQSxNQUFNQyxpQkFBaUIsR0FBRyxrQkFBMUI7O0FBT2UsTUFBTUMsWUFBTixTQUEyQkMsNkJBQTNCLENBQWdEO0FBSzNEQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUFhO0FBQ3BCLFVBQU1MLFVBQU4sRUFBa0JDLGlCQUFsQjtBQURvQjtBQUFBO0FBQUE7QUFBQSwwREFxQkMsQ0FDckJLO0FBRHFCO0FBQUEsTUFFckJEO0FBRnFCO0FBQUEsTUFHckJFO0FBSHFCO0FBQUEsTUFJckJDO0FBSnFCO0FBQUEsTUFLckJDO0FBTHFCO0FBQUEsU0FNcEI7QUFDRCxVQUFJLENBQUNKLElBQUwsRUFBVztBQUNYLFVBQUlHLE9BQUosRUFBYTtBQUNiLFVBQUlILElBQUksQ0FBQ0ssTUFBTCxLQUFnQixLQUFLTCxJQUFMLENBQVVLLE1BQTlCLEVBQXNDLE9BSHJDLENBS0Q7O0FBQ0EsVUFBSUQsSUFBSSxDQUFDRSxRQUFMLENBQWNDLGNBQWQsT0FBbUNQLElBQUksQ0FBQ1Esd0JBQUwsRUFBdkMsRUFBd0UsT0FOdkUsQ0FRRDtBQUNBOztBQUNBLFVBQUlOLGlC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cHlyaWdodCAyMDE2IEF2aXJhbCBEYXNndXB0YVxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOCBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEF1dG9jb21wbGV0ZVByb3ZpZGVyIGZyb20gJy4vQXV0b2NvbXBsZXRlUHJvdmlkZXInO1xuaW1wb3J0IHtQaWxsQ29tcGxldGlvbn0gZnJvbSAnLi9Db21wb25lbnRzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgUXVlcnlNYXRjaGVyIGZyb20gJy4vUXVlcnlNYXRjaGVyJztcbmltcG9ydCB7c29ydEJ5fSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uL01hdHJpeENsaWVudFBlZyc7XG5cbmltcG9ydCBNYXRyaXhFdmVudCBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgUm9vbSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBSb29tTWVtYmVyIGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCBSb29tU3RhdGUgZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLXN0YXRlXCI7XG5pbXBvcnQgRXZlbnRUaW1lbGluZSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50LXRpbWVsaW5lXCI7XG5pbXBvcnQge21ha2VVc2VyUGVybWFsaW5rfSBmcm9tIFwiLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQge0lDb21wbGV0aW9uLCBJU2VsZWN0aW9uUmFuZ2V9IGZyb20gXCIuL0F1dG9jb21wbGV0ZXJcIjtcblxuY29uc3QgVVNFUl9SRUdFWCA9IC9cXEJAXFxTKi9nO1xuXG4vLyB1c2VkIHdoZW4geW91IGhpdCAndGFiJyAtIHdlIGFsbG93IHNvbWUgc2VwYXJhdG9yIGNoYXJzIGF0IHRoZSBiZWdpbm5pbmdcbi8vIHRvIGFsbG93IHlvdSB0byB0YWItY29tcGxldGUgL21hdCBpbnRvIC8obWF0dGhldylcbmNvbnN0IEZPUkNFRF9VU0VSX1JFR0VYID0gL1teLyw6OyBcXHRcXG5dXFxTKi9nO1xuXG5pbnRlcmZhY2UgSVJvb21UaW1lbGluZURhdGEge1xuICAgIHRpbWVsaW5lOiBFdmVudFRpbWVsaW5lO1xuICAgIGxpdmVFdmVudD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVzZXJQcm92aWRlciBleHRlbmRzIEF1dG9jb21wbGV0ZVByb3ZpZGVyIHtcbiAgICBtYXRjaGVyOiBRdWVyeU1hdGNoZXI8Um9vbU1lbWJlcj47XG4gICAgdXNlcnM6IFJvb21NZW1iZXJbXTtcbiAgICByb29tOiBSb29tO1xuXG4gICAgY29uc3RydWN0b3Iocm9vbTogUm9vbSkge1xuICAgICAgICBzdXBlcihVU0VSX1JFR0VYLCBGT1JDRURfVVNFUl9SRUdFWCk7XG4gICAgICAgIHRoaXMucm9vbSA9IHJvb207XG4gICAgICAgIHRoaXMubWF0Y2hlciA9IG5ldyBRdWVyeU1hdGNoZXIoW10sIHtcbiAgICAgICAgICAgIGtleXM6IFsnbmFtZSddLFxuICAgICAgICAgICAgZnVuY3M6IFtvYmogPT4gb2JqLnVzZXJJZC5zbGljZSgxKV0sIC8vIGluZGV4IGJ5IHVzZXIgaWQgbWludXMgdGhlIGxlYWRpbmcgJ0AnXG4gICAgICAgICAgICBzaG91bGRNYXRjaFByZWZpeDogdHJ1ZSxcbiAgICAgICAgICAgIHNob3VsZE1hdGNoV29yZHNPbmx5OiBmYWxzZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFwiUm9vbS50aW1lbGluZVwiLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFwiUm9vbVN0YXRlLm1lbWJlcnNcIiwgdGhpcy5vblJvb21TdGF0ZU1lbWJlcik7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKSkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKFwiUm9vbS50aW1lbGluZVwiLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihcIlJvb21TdGF0ZS5tZW1iZXJzXCIsIHRoaXMub25Sb29tU3RhdGVNZW1iZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJvb21UaW1lbGluZSA9IChcbiAgICAgICAgZXY6IE1hdHJpeEV2ZW50LFxuICAgICAgICByb29tOiBSb29tLFxuICAgICAgICB0b1N0YXJ0T2ZUaW1lbGluZTogYm9vbGVhbixcbiAgICAgICAgcmVtb3ZlZDogYm9vbGVhbixcbiAgICAgICAgZGF0YTogSVJvb21UaW1lbGluZURhdGEsXG4gICAgKSA9PiB7XG4gICAgICAgIGlmICghcm9vbSkgcmV0dXJuO1xuICAgICAgICBpZiAocmVtb3ZlZCkgcmV0dXJuO1xuICAgICAgICBpZiAocm9vbS5yb29tSWQgIT09IHRoaXMucm9vbS5yb29tSWQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZyb20gZmlsdGVyZWQgdGltZWxpbmVzXG4gICAgICAgIGlmIChkYXRhLnRpbWVsaW5lLmdldFRpbWVsaW5lU2V0KCkgIT09IHJvb20uZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0KCkpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgYW55dGhpbmcgYnV0IHJlYWwtdGltZSB1cGRhdGVzIGF0IHRoZSBlbmQgb2YgdGhlIHJvb206XG4gICAgICAgIC8vIHVwZGF0ZXMgZnJvbSBwYWdpbmF0aW9uIHdpbGwgaGFwcGVuIHdoZW4gdGhlIHBhZ2luYXRlIGNvbXBsZXRlcy5cbiAgICAgICAgaWYgKHRvU3RhcnRPZlRpbWVsaW5lIHx8ICFkYXRhIHx8ICFkYXRhLmxpdmVFdmVudCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFRPRE86IGxhenlsb2FkIGlmIHdlIGhhdmUgbm8gZXYuc2VuZGVyIHJvb20gbWVtYmVyP1xuICAgICAgICB0aGlzLm9uVXNlclNwb2tlKGV2LnNlbmRlcik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVNZW1iZXIgPSAoZXY6IE1hdHJpeEV2ZW50LCBzdGF0ZTogUm9vbVN0YXRlLCBtZW1iZXI6IFJvb21NZW1iZXIpID0+IHtcbiAgICAgICAgLy8gaWdub3JlIG1lbWJlcnMgaW4gb3RoZXIgcm9vbXNcbiAgICAgICAgaWYgKG1lbWJlci5yb29tSWQgIT09IHRoaXMucm9vbS5yb29tSWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGJsb3cgYXdheSB0aGUgdXNlcnMgY2FjaGVcbiAgICAgICAgdGhpcy51c2VycyA9IG51bGw7XG4gICAgfTtcblxuICAgIGFzeW5jIGdldENvbXBsZXRpb25zKHJhd1F1ZXJ5OiBzdHJpbmcsIHNlbGVjdGlvbjogSVNlbGVjdGlvblJhbmdlLCBmb3JjZSA9IGZhbHNlKTogUHJvbWlzZTxJQ29tcGxldGlvbltdPiB7XG4gICAgICAgIGNvbnN0IE1lbWJlckF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmF2YXRhcnMuTWVtYmVyQXZhdGFyJyk7XG5cbiAgICAgICAgLy8gbGF6eS1sb2FkIHVzZXIgbGlzdCBpbnRvIG1hdGNoZXJcbiAgICAgICAgaWYgKCF0aGlzLnVzZXJzKSB0aGlzLl9tYWtlVXNlcnMoKTtcblxuICAgICAgICBsZXQgY29tcGxldGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3Qge2NvbW1hbmQsIHJhbmdlfSA9IHRoaXMuZ2V0Q3VycmVudENvbW1hbmQocmF3UXVlcnksIHNlbGVjdGlvbiwgZm9yY2UpO1xuXG4gICAgICAgIGlmICghY29tbWFuZCkgcmV0dXJuIGNvbXBsZXRpb25zO1xuXG4gICAgICAgIGNvbnN0IGZ1bGxNYXRjaCA9IGNvbW1hbmRbMF07XG4gICAgICAgIC8vIERvbid0IHNlYXJjaCBpZiB0aGUgcXVlcnkgaXMgYSBzaW5nbGUgXCJAXCJcbiAgICAgICAgaWYgKGZ1bGxNYXRjaCAmJiBmdWxsTWF0Y2ggIT09ICdAJykge1xuICAgICAgICAgICAgLy8gRG9uJ3QgaW5jbHVkZSB0aGUgJ0AnIGluIG91ciBzZWFyY2ggcXVlcnkgLSBpdCdzIG9ubHkgdXNlZCBhcyBhIHdheSB0byB0cmlnZ2VyIGNvbXBsZXRpb25cbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gZnVsbE1hdGNoLnN0YXJ0c1dpdGgoJ0AnKSA/IGZ1bGxNYXRjaC5zdWJzdHJpbmcoMSkgOiBmdWxsTWF0Y2g7XG4gICAgICAgICAgICBjb21wbGV0aW9ucyA9IHRoaXMubWF0Y2hlci5tYXRjaChxdWVyeSkubWFwKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSAodXNlci5uYW1lIHx8IHVzZXIudXNlcklkIHx8ICcnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBMZW5ndGggb2YgY29tcGxldGlvbiBzaG91bGQgZXF1YWwgbGVuZ3RoIG9mIHRleHQgaW4gZGVjb3JhdG9yLiBkcmFmdC1qc1xuICAgICAgICAgICAgICAgICAgICAvLyByZWxpZXMgb24gdGhlIGxlbmd0aCBvZiB0aGUgZW50aXR5ID09PSBsZW5ndGggb2YgdGhlIHRleHQgaW4gdGhlIGRlY29yYXRpb24uXG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRpb246IHVzZXIucmF3RGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRpb25JZDogdXNlci51c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidXNlclwiLFxuICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IChzZWxlY3Rpb24uYmVnaW5uaW5nICYmIHJhbmdlLnN0YXJ0ID09PSAwKSA/ICc6ICcgOiAnICcsXG4gICAgICAgICAgICAgICAgICAgIGhyZWY6IG1ha2VVc2VyUGVybWFsaW5rKHVzZXIudXNlcklkKSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8UGlsbENvbXBsZXRpb24gdGl0bGU9e2Rpc3BsYXlOYW1lfSBkZXNjcmlwdGlvbj17dXNlci51c2VySWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxNZW1iZXJBdmF0YXIgbWVtYmVyPXt1c2VyfSB3aWR0aD17MjR9IGhlaWdodD17MjR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1BpbGxDb21wbGV0aW9uPlxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICByYW5nZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBsZXRpb25zO1xuICAgIH1cblxuICAgIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIF90KCdVc2VycycpO1xuICAgIH1cblxuICAgIF9tYWtlVXNlcnMoKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMucm9vbS5nZXRMaXZlVGltZWxpbmUoKS5nZXRFdmVudHMoKTtcbiAgICAgICAgY29uc3QgbGFzdFNwb2tlbiA9IHt9O1xuXG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgZXZlbnRzKSB7XG4gICAgICAgICAgICBsYXN0U3Bva2VuW2V2ZW50LmdldFNlbmRlcigpXSA9IGV2ZW50LmdldFRzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjdXJyZW50VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZDtcbiAgICAgICAgdGhpcy51c2VycyA9IHRoaXMucm9vbS5nZXRKb2luZWRNZW1iZXJzKCkuZmlsdGVyKCh7dXNlcklkfSkgPT4gdXNlcklkICE9PSBjdXJyZW50VXNlcklkKTtcblxuICAgICAgICB0aGlzLnVzZXJzID0gc29ydEJ5KHRoaXMudXNlcnMsIChtZW1iZXIpID0+IDFFMjAgLSBsYXN0U3Bva2VuW21lbWJlci51c2VySWRdIHx8IDFFMjApO1xuXG4gICAgICAgIHRoaXMubWF0Y2hlci5zZXRPYmplY3RzKHRoaXMudXNlcnMpO1xuICAgIH1cblxuICAgIG9uVXNlclNwb2tlKHVzZXI6IFJvb21NZW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLnVzZXJzKSByZXR1cm47XG4gICAgICAgIGlmICghdXNlcikgcmV0dXJuO1xuICAgICAgICBpZiAodXNlci51c2VySWQgPT09IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWQpIHJldHVybjtcblxuICAgICAgICAvLyBNb3ZlIHRoZSB1c2VyIHRoYXQgc3Bva2UgdG8gdGhlIGZyb250IG9mIHRoZSBhcnJheVxuICAgICAgICB0aGlzLnVzZXJzLnNwbGljZShcbiAgICAgICAgICAgIHRoaXMudXNlcnMuZmluZEluZGV4KCh1c2VyMikgPT4gdXNlcjIudXNlcklkID09PSB1c2VyLnVzZXJJZCksIDEpO1xuICAgICAgICB0aGlzLnVzZXJzID0gW3VzZXIsIC4uLnRoaXMudXNlcnNdO1xuXG4gICAgICAgIHRoaXMubWF0Y2hlci5zZXRPYmplY3RzKHRoaXMudXNlcnMpO1xuICAgIH1cblxuICAgIHJlbmRlckNvbXBsZXRpb25zKGNvbXBsZXRpb25zOiBSZWFjdC5SZWFjdE5vZGVbXSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXV0b2NvbXBsZXRlX0NvbXBsZXRpb25fY29udGFpbmVyX3BpbGxcIlxuICAgICAgICAgICAgICAgIHJvbGU9XCJsaXN0Ym94XCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIlVzZXIgQXV0b2NvbXBsZXRlXCIpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgY29tcGxldGlvbnMgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc2hvdWxkRm9yY2VDb21wbGV0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuIl19
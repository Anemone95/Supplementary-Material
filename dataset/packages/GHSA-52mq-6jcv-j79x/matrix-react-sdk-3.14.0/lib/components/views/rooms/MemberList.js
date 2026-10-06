"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RoomInvite = require("../../../RoomInvite");

var _ratelimitedfunc = _interopRequireDefault(require("../../../ratelimitedfunc"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _CommunityPrototypeStore = require("../../../stores/CommunityPrototypeStore");

var _BaseCard = _interopRequireDefault(require("../right_panel/BaseCard"));

var _RightPanelStorePhases = require("../../../stores/RightPanelStorePhases");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2017, 2018 New Vector Ltd

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
const INITIAL_LOAD_NUM_MEMBERS = 30;
const INITIAL_LOAD_NUM_INVITED = 5;
const SHOW_MORE_INCREMENT = 100; // Regex applied to filter our punctuation in member names before applying sort, to fuzzy it a little
// matches all ASCII punctuation: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~

const SORT_REGEX = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]+/g;

class MemberList extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onUserPresenceChange", (event, user) => {
      // Attach a SINGLE listener for global presence changes then locate the
      // member tile and re-render it. This is more efficient than every tile
      // ever attaching their own listener.
      const tile = this.refs[user.userId]; // console.log(`Got presence update for ${user.userId}. hasTile=${!!tile}`);

      if (tile) {
        this._updateList(); // reorder the membership list

      }
    });
    (0, _defineProperty2.default)(this, "onRoom", room => {
      if (room.roomId !== this.props.roomId) {
        return;
      } // We listen for room events because when we accept an invite
      // we need to wait till the room is fully populated with state
      // before refreshing the member list else we get a stale list.


      this._showMembersAccordingToMembershipWithLL();
    });
    (0, _defineProperty2.default)(this, "onMyMembership", (room, membership, oldMembership) => {
      if (room.roomId === this.props.roomId && membership === "join") {
        this._showMembersAccordingToMembershipWithLL();
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateMember", (ev, state, member) => {
      if (member.roomId !== this.props.roomId) {
        return;
      }

      this._updateList();
    });
    (0, _defineProperty2.default)(this, "onRoomMemberName", (ev, member) => {
      if (member.roomId !== this.props.roomId) {
        return;
      }

      this._updateList();
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvent", (event, state) => {
      if (event.getRoomId() === this.props.roomId && event.getType() === "m.room.third_party_invite") {
        this._updateList();
      }
    });
    (0, _defineProperty2.default)(this, "_updateList", (0, _ratelimitedfunc.default)(() => {
      this._updateListNow();
    }, 500));
    (0, _defineProperty2.default)(this, "_createOverflowTileJoined", (overflowCount, totalCount) => {
      return this._createOverflowTile(overflowCount, totalCount, this._showMoreJoinedMemberList);
    });
    (0, _defineProperty2.default)(this, "_createOverflowTileInvited", (overflowCount, totalCount) => {
      return this._createOverflowTile(overflowCount, totalCount, this._showMoreInvitedMemberList);
    });
    (0, _defineProperty2.default)(this, "_createOverflowTile", (overflowCount, totalCount, onClick) => {
      // For now we'll pretend this is any entity. It should probably be a separate tile.
      const EntityTile = sdk.getComponent("rooms.EntityTile");
      const BaseAvatar = sdk.getComponent("avatars.BaseAvatar");
      const text = (0, _languageHandler._t)("and %(count)s others...", {
        count: overflowCount
      });
      return /*#__PURE__*/_react.default.createElement(EntityTile, {
        className: "mx_EntityTile_ellipsis",
        avatarJsx: /*#__PURE__*/_react.default.createElement(BaseAvatar, {
          url: require("../../../../res/img/ellipsis.svg"),
          name: "...",
          width: 36,
          height: 36
        }),
        name: text,
        presenceState: "online",
        suppressOnHover: true,
        onClick: onClick
      });
    });
    (0, _defineProperty2.default)(this, "_showMoreJoinedMemberList", () => {
      this.setState({
        truncateAtJoined: this.state.truncateAtJoined + SHOW_MORE_INCREMENT
      });
    });
    (0, _defineProperty2.default)(this, "_showMoreInvitedMemberList", () => {
      this.setState({
        truncateAtInvited: this.state.truncateAtInvited + SHOW_MORE_INCREMENT
      });
    });
    (0, _defineProperty2.default)(this, "memberSort", (memberA, memberB) => {
      // order by presence, with "active now" first.
      // ...and then by power level
      // ...and then by last active
      // ...and then alphabetically.
      // We could tiebreak instead by "last recently spoken in this room" if we wanted to.
      // console.log(`Comparing userA=${this.memberString(memberA)} userB=${this.memberString(memberB)}`);
      const userA = memberA.user;
      const userB = memberB.user; // if (!userA) console.log("!! MISSING USER FOR A-SIDE: " + memberA.name + " !!");
      // if (!userB) console.log("!! MISSING USER FOR B-SIDE: " + memberB.name + " !!");

      if (!userA && !userB) return 0;
      if (userA && !userB) return -1;
      if (!userA && userB) return 1; // First by presence

      if (this._showPresence) {
        const convertPresence = p => p === 'unavailable' ? 'online' : p;

        const presenceIndex = p => {
          const order = ['active', 'online', 'offline'];
          const idx = order.indexOf(convertPresence(p));
          return idx === -1 ? order.length : idx; // unknown states at the end
        };

        const idxA = presenceIndex(userA.currentlyActive ? 'active' : userA.presence);
        const idxB = presenceIndex(userB.currentlyActive ? 'active' : userB.presence); // console.log(`userA_presenceGroup=${idxA} userB_presenceGroup=${idxB}`);

        if (idxA !== idxB) {
          // console.log("Comparing on presence group - returning");
          return idxA - idxB;
        }
      } // Second by power level


      if (memberA.powerLevel !== memberB.powerLevel) {
        // console.log("Comparing on power level - returning");
        return memberB.powerLevel - memberA.powerLevel;
      } // Third by last active


      if (this._showPresence && userA.getLastActiveTs() !== userB.getLastActiveTs()) {
        // console.log("Comparing on last active timestamp - returning");
        return userB.getLastActiveTs() - userA.getLastActiveTs();
      } // Fourth by name (alphabetical)


      const nameA = (memberA.name[0] === '@' ? memberA.name.substr(1) : memberA.name).replace(SORT_REGEX, "");
      const nameB = (memberB.name[0] === '@' ? memberB.name.substr(1) : memberB.name).replace(SORT_REGEX, ""); // console.log(`Comparing userA_name=${nameA} against userB_name=${nameB} - returning`);

      return nameA.localeCompare(nameB, {
        ignorePunctuation: true,
        sensitivity: "base"
      });
    });
    (0, _defineProperty2.default)(this, "onSearchQueryChanged", searchQuery => {
      this.setState({
        searchQuery,
        filteredJoinedMembers: this._filterMembers(this.state.members, 'join', searchQuery),
        filteredInvitedMembers: this._filterMembers(this.state.members, 'invite', searchQuery)
      });
    });
    (0, _defineProperty2.default)(this, "_onPending3pidInviteClick", inviteEvent => {
      _dispatcher.default.dispatch({
        action: 'view_3pid_invite',
        event: inviteEvent
      });
    });
    (0, _defineProperty2.default)(this, "_getChildrenJoined", (start, end) => this._makeMemberTiles(this.state.filteredJoinedMembers.slice(start, end)));
    (0, _defineProperty2.default)(this, "_getChildCountJoined", () => this.state.filteredJoinedMembers.length);
    (0, _defineProperty2.default)(this, "_getChildrenInvited", (start, end) => {
      let targets = this.state.filteredInvitedMembers;

      if (end > this.state.filteredInvitedMembers.length) {
        targets = targets.concat(this._getPending3PidInvites());
      }

      return this._makeMemberTiles(targets.slice(start, end));
    });
    (0, _defineProperty2.default)(this, "_getChildCountInvited", () => {
      return this.state.filteredInvitedMembers.length + (this._getPending3PidInvites() || []).length;
    });
    (0, _defineProperty2.default)(this, "onInviteButtonClick", () => {
      if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        _dispatcher.default.dispatch({
          action: 'require_registration'
        });

        return;
      } // call AddressPickerDialog


      _dispatcher.default.dispatch({
        action: 'view_invite',
        roomId: this.props.roomId
      });
    });

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli.hasLazyLoadMembersEnabled()) {
      // show an empty list
      this.state = this._getMembersState([]);
    } else {
      this.state = this._getMembersState(this.roomMembers());
    }

    cli.on("Room", this.onRoom); // invites & joining after peek

    const enablePresenceByHsUrl = _SdkConfig.default.get()["enable_presence_by_hs_url"];

    const hsUrl = _MatrixClientPeg.MatrixClientPeg.get().baseUrl;

    this._showPresence = true;

    if (enablePresenceByHsUrl && enablePresenceByHsUrl[hsUrl] !== undefined) {
      this._showPresence = enablePresenceByHsUrl[hsUrl];
    }
  } // eslint-disable-next-line camelcase


  UNSAFE_componentWillMount() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    this._mounted = true;

    if (cli.hasLazyLoadMembersEnabled()) {
      this._showMembersAccordingToMembershipWithLL();

      cli.on("Room.myMembership", this.onMyMembership);
    } else {
      this._listenForMembersChanges();
    }
  }

  _listenForMembersChanges() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    cli.on("RoomState.members", this.onRoomStateMember);
    cli.on("RoomMember.name", this.onRoomMemberName);
    cli.on("RoomState.events", this.onRoomStateEvent); // We listen for changes to the lastPresenceTs which is essentially
    // listening for all presence events (we display most of not all of
    // the information contained in presence events).

    cli.on("User.lastPresenceTs", this.onUserPresenceChange);
    cli.on("User.presence", this.onUserPresenceChange);
    cli.on("User.currentlyActive", this.onUserPresenceChange); // cli.on("Room.timeline", this.onRoomTimeline);
  }

  componentWillUnmount() {
    this._mounted = false;

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli) {
      cli.removeListener("RoomState.members", this.onRoomStateMember);
      cli.removeListener("RoomMember.name", this.onRoomMemberName);
      cli.removeListener("Room.myMembership", this.onMyMembership);
      cli.removeListener("RoomState.events", this.onRoomStateEvent);
      cli.removeListener("Room", this.onRoom);
      cli.removeListener("User.lastPresenceTs", this.onUserPresenceChange);
      cli.removeListener("User.presence", this.onUserPresenceChange);
      cli.removeListener("User.currentlyActive", this.onUserPresenceChange);
    } // cancel any pending calls to the rate_limited_funcs


    this._updateList.cancelPendingCall();
  }
  /**
   * If lazy loading is enabled, either:
   * show a spinner and load the members if the user is joined,
   * or show the members available so far if the user is invited
   */


  async _showMembersAccordingToMembershipWithLL() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli.hasLazyLoadMembersEnabled()) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(this.props.roomId);
      const membership = room && room.getMyMembership();

      if (membership === "join") {
        this.setState({
          loading: true
        });

        try {
          await room.loadMembersIfNeeded();
        } catch (ex) {
          /* already logged in RoomView */
        }

        if (this._mounted) {
          this.setState(this._getMembersState(this.roomMembers()));

          this._listenForMembersChanges();
        }
      } else {
        // show the members we already have loaded
        this.setState(this._getMembersState(this.roomMembers()));
      }
    }
  }

  _getMembersState(members) {
    // set the state after determining _showPresence to make sure it's
    // taken into account while rerendering
    return {
      loading: false,
      members: members,
      filteredJoinedMembers: this._filterMembers(members, 'join'),
      filteredInvitedMembers: this._filterMembers(members, 'invite'),
      // ideally we'd size this to the page height, but
      // in practice I find that a little constraining
      truncateAtJoined: INITIAL_LOAD_NUM_MEMBERS,
      truncateAtInvited: INITIAL_LOAD_NUM_INVITED,
      searchQuery: ""
    };
  }

  _updateListNow() {
    // console.log("Updating memberlist");
    const newState = {
      loading: false,
      members: this.roomMembers()
    };
    newState.filteredJoinedMembers = this._filterMembers(newState.members, 'join', this.state.searchQuery);
    newState.filteredInvitedMembers = this._filterMembers(newState.members, 'invite', this.state.searchQuery);
    this.setState(newState);
  }

  getMembersWithUser() {
    if (!this.props.roomId) return [];

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(this.props.roomId);
    if (!room) return [];
    const allMembers = Object.values(room.currentState.members);
    allMembers.forEach(function (member) {
      // work around a race where you might have a room member object
      // before the user object exists.  This may or may not cause
      // https://github.com/vector-im/vector-web/issues/186
      if (member.user === null) {
        member.user = cli.getUser(member.userId);
      } // XXX: this user may have no lastPresenceTs value!
      // the right solution here is to fix the race rather than leave it as 0

    });
    return allMembers;
  }

  roomMembers() {
    const allMembers = this.getMembersWithUser();
    const filteredAndSortedMembers = allMembers.filter(m => {
      return m.membership === 'join' || m.membership === 'invite';
    });
    filteredAndSortedMembers.sort(this.memberSort);
    return filteredAndSortedMembers;
  }

  memberString(member) {
    if (!member) {
      return "(null)";
    } else {
      const u = member.user;
      return "(" + member.name + ", " + member.powerLevel + ", " + (u ? u.lastActiveAgo : "<null>") + ", " + (u ? u.getLastActiveTs() : "<null>") + ", " + (u ? u.currentlyActive : "<null>") + ", " + (u ? u.presence : "<null>") + ")";
    }
  } // returns negative if a comes before b,
  // returns 0 if a and b are equivalent in ordering
  // returns positive if a comes after b.


  _filterMembers(members, membership, query) {
    return members.filter(m => {
      if (query) {
        query = query.toLowerCase();
        const matchesName = m.name.toLowerCase().indexOf(query) !== -1;
        const matchesId = m.userId.toLowerCase().indexOf(query) !== -1;

        if (!matchesName && !matchesId) {
          return false;
        }
      }

      return m.membership === membership;
    });
  }

  _getPending3PidInvites() {
    // include 3pid invites (m.room.third_party_invite) state events.
    // The HS may have already converted these into m.room.member invites so
    // we shouldn't add them if the 3pid invite state key (token) is in the
    // member invite (content.third_party_invite.signed.token)
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

    if (room) {
      return room.currentState.getStateEvents("m.room.third_party_invite").filter(function (e) {
        if (!(0, _RoomInvite.isValid3pidInvite)(e)) return false; // discard all invites which have a m.room.member event since we've
        // already added them.

        const memberEvent = room.currentState.getInviteForThreePidToken(e.getStateKey());
        if (memberEvent) return false;
        return true;
      });
    }
  }

  _makeMemberTiles(members) {
    const MemberTile = sdk.getComponent("rooms.MemberTile");
    const EntityTile = sdk.getComponent("rooms.EntityTile");
    return members.map(m => {
      if (m.userId) {
        // Is a Matrix invite
        return /*#__PURE__*/_react.default.createElement(MemberTile, {
          key: m.userId,
          member: m,
          ref: m.userId,
          showPresence: this._showPresence
        });
      } else {
        // Is a 3pid invite
        return /*#__PURE__*/_react.default.createElement(EntityTile, {
          key: m.getStateKey(),
          name: m.getContent().display_name,
          suppressOnHover: true,
          onClick: () => this._onPending3pidInviteClick(m)
        });
      }
    });
  }

  render() {
    if (this.state.loading) {
      const Spinner = sdk.getComponent("elements.Spinner");
      return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
        className: "mx_MemberList",
        onClose: this.props.onClose,
        previousPhase: _RightPanelStorePhases.RightPanelPhases.RoomSummary
      }, /*#__PURE__*/_react.default.createElement(Spinner, null));
    }

    const SearchBox = sdk.getComponent('structures.SearchBox');
    const TruncatedList = sdk.getComponent("elements.TruncatedList");

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(this.props.roomId);
    let inviteButton;

    if (room && room.getMyMembership() === 'join') {
      // assume we can invite until proven false
      let canInvite = true;
      const plEvent = room.currentState.getStateEvents("m.room.power_levels", "");
      const me = room.getMember(cli.getUserId());

      if (plEvent && me) {
        const content = plEvent.getContent();

        if (content && content.invite > me.powerLevel) {
          canInvite = false;
        }
      }

      let inviteButtonText = (0, _languageHandler._t)("Invite to this room");

      const chat = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityGeneralChat();

      if (chat && chat.roomId === this.props.roomId) {
        inviteButtonText = (0, _languageHandler._t)("Invite to this community");
      }

      const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
      inviteButton = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: "mx_MemberList_invite",
        onClick: this.onInviteButtonClick,
        disabled: !canInvite
      }, /*#__PURE__*/_react.default.createElement("span", null, inviteButtonText));
    }

    let invitedHeader;
    let invitedSection;

    if (this._getChildCountInvited() > 0) {
      invitedHeader = /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Invited"));
      invitedSection = /*#__PURE__*/_react.default.createElement(TruncatedList, {
        className: "mx_MemberList_section mx_MemberList_invited",
        truncateAt: this.state.truncateAtInvited,
        createOverflowElement: this._createOverflowTileInvited,
        getChildren: this._getChildrenInvited,
        getChildCount: this._getChildCountInvited
      });
    }

    const footer = /*#__PURE__*/_react.default.createElement(SearchBox, {
      className: "mx_MemberList_query mx_textinput_icon mx_textinput_search",
      placeholder: (0, _languageHandler._t)('Filter room members'),
      onSearch: this.onSearchQueryChanged
    });

    return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
      className: "mx_MemberList",
      header: inviteButton,
      footer: footer,
      onClose: this.props.onClose,
      previousPhase: _RightPanelStorePhases.RightPanelPhases.RoomSummary
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MemberList_wrapper"
    }, /*#__PURE__*/_react.default.createElement(TruncatedList, {
      className: "mx_MemberList_section mx_MemberList_joined",
      truncateAt: this.state.truncateAtJoined,
      createOverflowElement: this._createOverflowTileJoined,
      getChildren: this._getChildrenJoined,
      getChildCount: this._getChildCountJoined
    }), invitedHeader, invitedSection));
  }

}

exports.default = MemberList;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL01lbWJlckxpc3QuanMiXSwibmFtZXMiOlsiSU5JVElBTF9MT0FEX05VTV9NRU1CRVJTIiwiSU5JVElBTF9MT0FEX05VTV9JTlZJVEVEIiwiU0hPV19NT1JFX0lOQ1JFTUVOVCIsIlNPUlRfUkVHRVgiLCJNZW1iZXJMaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXZlbnQiLCJ1c2VyIiwidGlsZSIsInJlZnMiLCJ1c2VySWQiLCJfdXBkYXRlTGlzdCIsInJvb20iLCJyb29tSWQiLCJfc2hvd01lbWJlcnNBY2NvcmRpbmdUb01lbWJlcnNoaXBXaXRoTEwiLCJtZW1iZXJzaGlwIiwib2xkTWVtYmVyc2hpcCIsImV2Iiwic3RhdGUiLCJtZW1iZXIiLCJnZXRSb29tSWQiLCJnZXRUeXBlIiwiX3VwZGF0ZUxpc3ROb3ciLCJvdmVyZmxvd0NvdW50IiwidG90YWxDb3VudCIsIl9jcmVhdGVPdmVyZmxvd1RpbGUiLCJfc2hvd01vcmVKb2luZWRNZW1iZXJMaXN0IiwiX3Nob3dNb3JlSW52aXRlZE1lbWJlckxpc3QiLCJvbkNsaWNrIiwiRW50aXR5VGlsZSIsInNkayIsImdldENvbXBvbmVudCIsIkJhc2VBdmF0YXIiLCJ0ZXh0IiwiY291bnQiLCJyZXF1aXJlIiwic2V0U3RhdGUiLCJ0cnVuY2F0ZUF0Sm9pbmVkIiwidHJ1bmNhdGVBdEludml0ZWQiLCJtZW1iZXJBIiwibWVtYmVyQiIsInVzZXJBIiwidXNlckIiLCJfc2hvd1ByZXNlbmNlIiwiY29udmVydFByZXNlbmNlIiwicCIsInByZXNlbmNlSW5kZXgiLCJvcmRlciIsImlkeCIsImluZGV4T2YiLCJsZW5ndGgiLCJpZHhBIiwiY3VycmVudGx5QWN0aXZlIiwicHJlc2VuY2UiLCJpZHhCIiwicG93ZXJMZXZlbCIsImdldExhc3RBY3RpdmVUcyIsIm5hbWVBIiwibmFtZSIsInN1YnN0ciIsInJlcGxhY2UiLCJuYW1lQiIsImxvY2FsZUNvbXBhcmUiLCJpZ25vcmVQdW5jdHVhdGlvbiIsInNlbnNpdGl2aXR5Iiwic2VhcmNoUXVlcnkiLCJmaWx0ZXJlZEpvaW5lZE1lbWJlcnMiLCJfZmlsdGVyTWVtYmVycyIsIm1lbWJlcnMiLCJmaWx0ZXJlZEludml0ZWRNZW1iZXJzIiwiaW52aXRlRXZlbnQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInN0YXJ0IiwiZW5kIiwiX21ha2VNZW1iZXJUaWxlcyIsInNsaWNlIiwidGFyZ2V0cyIsImNvbmNhdCIsIl9nZXRQZW5kaW5nM1BpZEludml0ZXMiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc0d1ZXN0IiwiY2xpIiwiaGFzTGF6eUxvYWRNZW1iZXJzRW5hYmxlZCIsIl9nZXRNZW1iZXJzU3RhdGUiLCJyb29tTWVtYmVycyIsIm9uIiwib25Sb29tIiwiZW5hYmxlUHJlc2VuY2VCeUhzVXJsIiwiU2RrQ29uZmlnIiwiaHNVcmwiLCJiYXNlVXJsIiwidW5kZWZpbmVkIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsIl9tb3VudGVkIiwib25NeU1lbWJlcnNoaXAiLCJfbGlzdGVuRm9yTWVtYmVyc0NoYW5nZXMiLCJvblJvb21TdGF0ZU1lbWJlciIsIm9uUm9vbU1lbWJlck5hbWUiLCJvblJvb21TdGF0ZUV2ZW50Iiwib25Vc2VyUHJlc2VuY2VDaGFuZ2UiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwiY2FuY2VsUGVuZGluZ0NhbGwiLCJnZXRSb29tIiwiZ2V0TXlNZW1iZXJzaGlwIiwibG9hZGluZyIsImxvYWRNZW1iZXJzSWZOZWVkZWQiLCJleCIsIm5ld1N0YXRlIiwiZ2V0TWVtYmVyc1dpdGhVc2VyIiwiYWxsTWVtYmVycyIsIk9iamVjdCIsInZhbHVlcyIsImN1cnJlbnRTdGF0ZSIsImZvckVhY2giLCJnZXRVc2VyIiwiZmlsdGVyZWRBbmRTb3J0ZWRNZW1iZXJzIiwiZmlsdGVyIiwibSIsInNvcnQiLCJtZW1iZXJTb3J0IiwibWVtYmVyU3RyaW5nIiwidSIsImxhc3RBY3RpdmVBZ28iLCJxdWVyeSIsInRvTG93ZXJDYXNlIiwibWF0Y2hlc05hbWUiLCJtYXRjaGVzSWQiLCJnZXRTdGF0ZUV2ZW50cyIsImUiLCJtZW1iZXJFdmVudCIsImdldEludml0ZUZvclRocmVlUGlkVG9rZW4iLCJnZXRTdGF0ZUtleSIsIk1lbWJlclRpbGUiLCJtYXAiLCJnZXRDb250ZW50IiwiZGlzcGxheV9uYW1lIiwiX29uUGVuZGluZzNwaWRJbnZpdGVDbGljayIsInJlbmRlciIsIlNwaW5uZXIiLCJvbkNsb3NlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIlJvb21TdW1tYXJ5IiwiU2VhcmNoQm94IiwiVHJ1bmNhdGVkTGlzdCIsImludml0ZUJ1dHRvbiIsImNhbkludml0ZSIsInBsRXZlbnQiLCJtZSIsImdldE1lbWJlciIsImdldFVzZXJJZCIsImNvbnRlbnQiLCJpbnZpdGUiLCJpbnZpdGVCdXR0b25UZXh0IiwiY2hhdCIsIkNvbW11bml0eVByb3RvdHlwZVN0b3JlIiwiaW5zdGFuY2UiLCJnZXRTZWxlY3RlZENvbW11bml0eUdlbmVyYWxDaGF0IiwiQWNjZXNzaWJsZUJ1dHRvbiIsIm9uSW52aXRlQnV0dG9uQ2xpY2siLCJpbnZpdGVkSGVhZGVyIiwiaW52aXRlZFNlY3Rpb24iLCJfZ2V0Q2hpbGRDb3VudEludml0ZWQiLCJfY3JlYXRlT3ZlcmZsb3dUaWxlSW52aXRlZCIsIl9nZXRDaGlsZHJlbkludml0ZWQiLCJmb290ZXIiLCJvblNlYXJjaFF1ZXJ5Q2hhbmdlZCIsIl9jcmVhdGVPdmVyZmxvd1RpbGVKb2luZWQiLCJfZ2V0Q2hpbGRyZW5Kb2luZWQiLCJfZ2V0Q2hpbGRDb3VudEpvaW5lZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUQ7QUFBZSxRQUFBLFNBQVMsRUFBQyw2Q0FBekI7QUFBdUUsUUFBQSxVQUFVLEVBQUUsS0FBS2xKLEtBQUwsQ0FBV29CLGlCQUE5RjtBQUNMLFFBQUEscUJBQXFCLEVBQUUsS0FBS2dJLDBCQUR2QjtBQUVMLFFBQUEsV0FBVyxFQUFFLEtBQUtDLG1CQUZiO0FBR0wsUUFBQSxhQUFhLEVBQUUsS0FBS0Y7QUFIZixRQUFqQjtBQUtIOztBQUVELFVBQU1HLE1BQU0sZ0JBQ1IsNkJBQUMsU0FBRDtBQUNJLE1BQUEsU0FBUyxFQUFDLDJEQURkO0FBRUksTUFBQSxXQUFXLEVBQUcseUJBQUcscUJBQUgsQ0FGbEI7QUFHSSxNQUFBLFFBQVEsRUFBRyxLQUFLQztBQUhwQixNQURKOztBQU9BLHdCQUFPLDZCQUFDLGlCQUFEO0FBQ0gsTUFBQSxTQUFTLEVBQUMsZUFEUDtBQUVILE1BQUEsTUFBTSxFQUFFckIsWUFGTDtBQUdILE1BQUEsTUFBTSxFQUFFb0IsTUFITDtBQUlILE1BQUEsT0FBTyxFQUFFLEtBQUtuSyxLQUFMLENBQVcwSSxPQUpqQjtBQUtILE1BQUEsYUFBYSxFQUFFQyx3Q0FBaUJDO0FBTDdCLG9CQU9IO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSw2QkFBQyxhQUFEO0FBQWUsTUFBQSxTQUFTLEVBQUMsNENBQXpCO0FBQXNFLE1BQUEsVUFBVSxFQUFFLEtBQUsvSCxLQUFMLENBQVdtQixnQkFBN0Y7QUFDZSxNQUFBLHFCQUFxQixFQUFFLEtBQUtxSSx5QkFEM0M7QUFFZSxNQUFBLFdBQVcsRUFBRSxLQUFLQyxrQkFGakM7QUFHZSxNQUFBLGFBQWEsRUFBRSxLQUFLQztBQUhuQyxNQURKLEVBS01ULGFBTE4sRUFNTUMsY0FOTixDQVBHLENBQVA7QUFnQkg7O0FBemRtRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7aXNWYWxpZDNwaWRJbnZpdGV9IGZyb20gXCIuLi8uLi8uLi9Sb29tSW52aXRlXCI7XG5pbXBvcnQgcmF0ZV9saW1pdGVkX2Z1bmMgZnJvbSBcIi4uLy4uLy4uL3JhdGVsaW1pdGVkZnVuY1wiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCB7Q29tbXVuaXR5UHJvdG90eXBlU3RvcmV9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQ29tbXVuaXR5UHJvdG90eXBlU3RvcmVcIjtcbmltcG9ydCBCYXNlQ2FyZCBmcm9tIFwiLi4vcmlnaHRfcGFuZWwvQmFzZUNhcmRcIjtcbmltcG9ydCB7UmlnaHRQYW5lbFBoYXNlc30gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9SaWdodFBhbmVsU3RvcmVQaGFzZXNcIjtcblxuY29uc3QgSU5JVElBTF9MT0FEX05VTV9NRU1CRVJTID0gMzA7XG5jb25zdCBJTklUSUFMX0xPQURfTlVNX0lOVklURUQgPSA1O1xuY29uc3QgU0hPV19NT1JFX0lOQ1JFTUVOVCA9IDEwMDtcblxuLy8gUmVnZXggYXBwbGllZCB0byBmaWx0ZXIgb3VyIHB1bmN0dWF0aW9uIGluIG1lbWJlciBuYW1lcyBiZWZvcmUgYXBwbHlpbmcgc29ydCwgdG8gZnV6enkgaXQgYSBsaXR0bGVcbi8vIG1hdGNoZXMgYWxsIEFTQ0lJIHB1bmN0dWF0aW9uOiAhXCIjJCUmJygpKissLS4vOjs8PT4/QFtcXF1eX2B7fH1+XG5jb25zdCBTT1JUX1JFR0VYID0gL1tcXHgyMS1cXHgyRlxceDNBLVxceDQwXFx4NUItXFx4NjBcXHg3Qi1cXHg3RV0rL2c7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lbWJlckxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmIChjbGkuaGFzTGF6eUxvYWRNZW1iZXJzRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAvLyBzaG93IGFuIGVtcHR5IGxpc3RcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLl9nZXRNZW1iZXJzU3RhdGUoW10pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuX2dldE1lbWJlcnNTdGF0ZSh0aGlzLnJvb21NZW1iZXJzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xpLm9uKFwiUm9vbVwiLCB0aGlzLm9uUm9vbSk7IC8vIGludml0ZXMgJiBqb2luaW5nIGFmdGVyIHBlZWtcbiAgICAgICAgY29uc3QgZW5hYmxlUHJlc2VuY2VCeUhzVXJsID0gU2RrQ29uZmlnLmdldCgpW1wiZW5hYmxlX3ByZXNlbmNlX2J5X2hzX3VybFwiXTtcbiAgICAgICAgY29uc3QgaHNVcmwgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuYmFzZVVybDtcbiAgICAgICAgdGhpcy5fc2hvd1ByZXNlbmNlID0gdHJ1ZTtcbiAgICAgICAgaWYgKGVuYWJsZVByZXNlbmNlQnlIc1VybCAmJiBlbmFibGVQcmVzZW5jZUJ5SHNVcmxbaHNVcmxdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dQcmVzZW5jZSA9IGVuYWJsZVByZXNlbmNlQnlIc1VybFtoc1VybF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICB0aGlzLl9tb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGNsaS5oYXNMYXp5TG9hZE1lbWJlcnNFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dNZW1iZXJzQWNjb3JkaW5nVG9NZW1iZXJzaGlwV2l0aExMKCk7XG4gICAgICAgICAgICBjbGkub24oXCJSb29tLm15TWVtYmVyc2hpcFwiLCB0aGlzLm9uTXlNZW1iZXJzaGlwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbkZvck1lbWJlcnNDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfbGlzdGVuRm9yTWVtYmVyc0NoYW5nZXMoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY2xpLm9uKFwiUm9vbVN0YXRlLm1lbWJlcnNcIiwgdGhpcy5vblJvb21TdGF0ZU1lbWJlcik7XG4gICAgICAgIGNsaS5vbihcIlJvb21NZW1iZXIubmFtZVwiLCB0aGlzLm9uUm9vbU1lbWJlck5hbWUpO1xuICAgICAgICBjbGkub24oXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMub25Sb29tU3RhdGVFdmVudCk7XG4gICAgICAgIC8vIFdlIGxpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgbGFzdFByZXNlbmNlVHMgd2hpY2ggaXMgZXNzZW50aWFsbHlcbiAgICAgICAgLy8gbGlzdGVuaW5nIGZvciBhbGwgcHJlc2VuY2UgZXZlbnRzICh3ZSBkaXNwbGF5IG1vc3Qgb2Ygbm90IGFsbCBvZlxuICAgICAgICAvLyB0aGUgaW5mb3JtYXRpb24gY29udGFpbmVkIGluIHByZXNlbmNlIGV2ZW50cykuXG4gICAgICAgIGNsaS5vbihcIlVzZXIubGFzdFByZXNlbmNlVHNcIiwgdGhpcy5vblVzZXJQcmVzZW5jZUNoYW5nZSk7XG4gICAgICAgIGNsaS5vbihcIlVzZXIucHJlc2VuY2VcIiwgdGhpcy5vblVzZXJQcmVzZW5jZUNoYW5nZSk7XG4gICAgICAgIGNsaS5vbihcIlVzZXIuY3VycmVudGx5QWN0aXZlXCIsIHRoaXMub25Vc2VyUHJlc2VuY2VDaGFuZ2UpO1xuICAgICAgICAvLyBjbGkub24oXCJSb29tLnRpbWVsaW5lXCIsIHRoaXMub25Sb29tVGltZWxpbmUpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl9tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaSkge1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFwiUm9vbVN0YXRlLm1lbWJlcnNcIiwgdGhpcy5vblJvb21TdGF0ZU1lbWJlcik7XG4gICAgICAgICAgICBjbGkucmVtb3ZlTGlzdGVuZXIoXCJSb29tTWVtYmVyLm5hbWVcIiwgdGhpcy5vblJvb21NZW1iZXJOYW1lKTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihcIlJvb20ubXlNZW1iZXJzaGlwXCIsIHRoaXMub25NeU1lbWJlcnNoaXApO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFwiUm9vbVN0YXRlLmV2ZW50c1wiLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnQpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFwiUm9vbVwiLCB0aGlzLm9uUm9vbSk7XG4gICAgICAgICAgICBjbGkucmVtb3ZlTGlzdGVuZXIoXCJVc2VyLmxhc3RQcmVzZW5jZVRzXCIsIHRoaXMub25Vc2VyUHJlc2VuY2VDaGFuZ2UpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFwiVXNlci5wcmVzZW5jZVwiLCB0aGlzLm9uVXNlclByZXNlbmNlQ2hhbmdlKTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihcIlVzZXIuY3VycmVudGx5QWN0aXZlXCIsIHRoaXMub25Vc2VyUHJlc2VuY2VDaGFuZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FuY2VsIGFueSBwZW5kaW5nIGNhbGxzIHRvIHRoZSByYXRlX2xpbWl0ZWRfZnVuY3NcbiAgICAgICAgdGhpcy5fdXBkYXRlTGlzdC5jYW5jZWxQZW5kaW5nQ2FsbCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIGxhenkgbG9hZGluZyBpcyBlbmFibGVkLCBlaXRoZXI6XG4gICAgICogc2hvdyBhIHNwaW5uZXIgYW5kIGxvYWQgdGhlIG1lbWJlcnMgaWYgdGhlIHVzZXIgaXMgam9pbmVkLFxuICAgICAqIG9yIHNob3cgdGhlIG1lbWJlcnMgYXZhaWxhYmxlIHNvIGZhciBpZiB0aGUgdXNlciBpcyBpbnZpdGVkXG4gICAgICovXG4gICAgYXN5bmMgX3Nob3dNZW1iZXJzQWNjb3JkaW5nVG9NZW1iZXJzaGlwV2l0aExMKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmIChjbGkuaGFzTGF6eUxvYWRNZW1iZXJzRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICAgICAgY29uc3QgbWVtYmVyc2hpcCA9IHJvb20gJiYgcm9vbS5nZXRNeU1lbWJlcnNoaXAoKTtcbiAgICAgICAgICAgIGlmIChtZW1iZXJzaGlwID09PSBcImpvaW5cIikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvYWRpbmc6IHRydWV9KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCByb29tLmxvYWRNZW1iZXJzSWZOZWVkZWQoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleCkgey8qIGFscmVhZHkgbG9nZ2VkIGluIFJvb21WaWV3ICovfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUodGhpcy5fZ2V0TWVtYmVyc1N0YXRlKHRoaXMucm9vbU1lbWJlcnMoKSkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5Gb3JNZW1iZXJzQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gc2hvdyB0aGUgbWVtYmVycyB3ZSBhbHJlYWR5IGhhdmUgbG9hZGVkXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh0aGlzLl9nZXRNZW1iZXJzU3RhdGUodGhpcy5yb29tTWVtYmVycygpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0TWVtYmVyc1N0YXRlKG1lbWJlcnMpIHtcbiAgICAgICAgLy8gc2V0IHRoZSBzdGF0ZSBhZnRlciBkZXRlcm1pbmluZyBfc2hvd1ByZXNlbmNlIHRvIG1ha2Ugc3VyZSBpdCdzXG4gICAgICAgIC8vIHRha2VuIGludG8gYWNjb3VudCB3aGlsZSByZXJlbmRlcmluZ1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBtZW1iZXJzOiBtZW1iZXJzLFxuICAgICAgICAgICAgZmlsdGVyZWRKb2luZWRNZW1iZXJzOiB0aGlzLl9maWx0ZXJNZW1iZXJzKG1lbWJlcnMsICdqb2luJyksXG4gICAgICAgICAgICBmaWx0ZXJlZEludml0ZWRNZW1iZXJzOiB0aGlzLl9maWx0ZXJNZW1iZXJzKG1lbWJlcnMsICdpbnZpdGUnKSxcblxuICAgICAgICAgICAgLy8gaWRlYWxseSB3ZSdkIHNpemUgdGhpcyB0byB0aGUgcGFnZSBoZWlnaHQsIGJ1dFxuICAgICAgICAgICAgLy8gaW4gcHJhY3RpY2UgSSBmaW5kIHRoYXQgYSBsaXR0bGUgY29uc3RyYWluaW5nXG4gICAgICAgICAgICB0cnVuY2F0ZUF0Sm9pbmVkOiBJTklUSUFMX0xPQURfTlVNX01FTUJFUlMsXG4gICAgICAgICAgICB0cnVuY2F0ZUF0SW52aXRlZDogSU5JVElBTF9MT0FEX05VTV9JTlZJVEVELFxuICAgICAgICAgICAgc2VhcmNoUXVlcnk6IFwiXCIsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25Vc2VyUHJlc2VuY2VDaGFuZ2UgPSAoZXZlbnQsIHVzZXIpID0+IHtcbiAgICAgICAgLy8gQXR0YWNoIGEgU0lOR0xFIGxpc3RlbmVyIGZvciBnbG9iYWwgcHJlc2VuY2UgY2hhbmdlcyB0aGVuIGxvY2F0ZSB0aGVcbiAgICAgICAgLy8gbWVtYmVyIHRpbGUgYW5kIHJlLXJlbmRlciBpdC4gVGhpcyBpcyBtb3JlIGVmZmljaWVudCB0aGFuIGV2ZXJ5IHRpbGVcbiAgICAgICAgLy8gZXZlciBhdHRhY2hpbmcgdGhlaXIgb3duIGxpc3RlbmVyLlxuICAgICAgICBjb25zdCB0aWxlID0gdGhpcy5yZWZzW3VzZXIudXNlcklkXTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYEdvdCBwcmVzZW5jZSB1cGRhdGUgZm9yICR7dXNlci51c2VySWR9LiBoYXNUaWxlPSR7ISF0aWxlfWApO1xuICAgICAgICBpZiAodGlsZSkge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTGlzdCgpOyAvLyByZW9yZGVyIHRoZSBtZW1iZXJzaGlwIGxpc3RcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvblJvb20gPSByb29tID0+IHtcbiAgICAgICAgaWYgKHJvb20ucm9vbUlkICE9PSB0aGlzLnByb3BzLnJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGxpc3RlbiBmb3Igcm9vbSBldmVudHMgYmVjYXVzZSB3aGVuIHdlIGFjY2VwdCBhbiBpbnZpdGVcbiAgICAgICAgLy8gd2UgbmVlZCB0byB3YWl0IHRpbGwgdGhlIHJvb20gaXMgZnVsbHkgcG9wdWxhdGVkIHdpdGggc3RhdGVcbiAgICAgICAgLy8gYmVmb3JlIHJlZnJlc2hpbmcgdGhlIG1lbWJlciBsaXN0IGVsc2Ugd2UgZ2V0IGEgc3RhbGUgbGlzdC5cbiAgICAgICAgdGhpcy5fc2hvd01lbWJlcnNBY2NvcmRpbmdUb01lbWJlcnNoaXBXaXRoTEwoKTtcbiAgICB9O1xuXG4gICAgb25NeU1lbWJlcnNoaXAgPSAocm9vbSwgbWVtYmVyc2hpcCwgb2xkTWVtYmVyc2hpcCkgPT4ge1xuICAgICAgICBpZiAocm9vbS5yb29tSWQgPT09IHRoaXMucHJvcHMucm9vbUlkICYmIG1lbWJlcnNoaXAgPT09IFwiam9pblwiKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93TWVtYmVyc0FjY29yZGluZ1RvTWVtYmVyc2hpcFdpdGhMTCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uUm9vbVN0YXRlTWVtYmVyID0gKGV2LCBzdGF0ZSwgbWVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChtZW1iZXIucm9vbUlkICE9PSB0aGlzLnByb3BzLnJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VwZGF0ZUxpc3QoKTtcbiAgICB9O1xuXG4gICAgb25Sb29tTWVtYmVyTmFtZSA9IChldiwgbWVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChtZW1iZXIucm9vbUlkICE9PSB0aGlzLnByb3BzLnJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VwZGF0ZUxpc3QoKTtcbiAgICB9O1xuXG4gICAgb25Sb29tU3RhdGVFdmVudCA9IChldmVudCwgc3RhdGUpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmdldFJvb21JZCgpID09PSB0aGlzLnByb3BzLnJvb21JZCAmJlxuICAgICAgICAgICAgZXZlbnQuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS50aGlyZF9wYXJ0eV9pbnZpdGVcIikge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTGlzdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF91cGRhdGVMaXN0ID0gcmF0ZV9saW1pdGVkX2Z1bmMoKCkgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVMaXN0Tm93KCk7XG4gICAgfSwgNTAwKTtcblxuICAgIF91cGRhdGVMaXN0Tm93KCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlVwZGF0aW5nIG1lbWJlcmxpc3RcIik7XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBtZW1iZXJzOiB0aGlzLnJvb21NZW1iZXJzKCksXG4gICAgICAgIH07XG4gICAgICAgIG5ld1N0YXRlLmZpbHRlcmVkSm9pbmVkTWVtYmVycyA9IHRoaXMuX2ZpbHRlck1lbWJlcnMobmV3U3RhdGUubWVtYmVycywgJ2pvaW4nLCB0aGlzLnN0YXRlLnNlYXJjaFF1ZXJ5KTtcbiAgICAgICAgbmV3U3RhdGUuZmlsdGVyZWRJbnZpdGVkTWVtYmVycyA9IHRoaXMuX2ZpbHRlck1lbWJlcnMobmV3U3RhdGUubWVtYmVycywgJ2ludml0ZScsIHRoaXMuc3RhdGUuc2VhcmNoUXVlcnkpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcbiAgICB9XG5cbiAgICBnZXRNZW1iZXJzV2l0aFVzZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5yb29tSWQpIHJldHVybiBbXTtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICBpZiAoIXJvb20pIHJldHVybiBbXTtcblxuICAgICAgICBjb25zdCBhbGxNZW1iZXJzID0gT2JqZWN0LnZhbHVlcyhyb29tLmN1cnJlbnRTdGF0ZS5tZW1iZXJzKTtcblxuICAgICAgICBhbGxNZW1iZXJzLmZvckVhY2goZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgICAgICAvLyB3b3JrIGFyb3VuZCBhIHJhY2Ugd2hlcmUgeW91IG1pZ2h0IGhhdmUgYSByb29tIG1lbWJlciBvYmplY3RcbiAgICAgICAgICAgIC8vIGJlZm9yZSB0aGUgdXNlciBvYmplY3QgZXhpc3RzLiAgVGhpcyBtYXkgb3IgbWF5IG5vdCBjYXVzZVxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS92ZWN0b3Itd2ViL2lzc3Vlcy8xODZcbiAgICAgICAgICAgIGlmIChtZW1iZXIudXNlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG1lbWJlci51c2VyID0gY2xpLmdldFVzZXIobWVtYmVyLnVzZXJJZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFhYWDogdGhpcyB1c2VyIG1heSBoYXZlIG5vIGxhc3RQcmVzZW5jZVRzIHZhbHVlIVxuICAgICAgICAgICAgLy8gdGhlIHJpZ2h0IHNvbHV0aW9uIGhlcmUgaXMgdG8gZml4IHRoZSByYWNlIHJhdGhlciB0aGFuIGxlYXZlIGl0IGFzIDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGFsbE1lbWJlcnM7XG4gICAgfVxuXG4gICAgcm9vbU1lbWJlcnMoKSB7XG4gICAgICAgIGNvbnN0IGFsbE1lbWJlcnMgPSB0aGlzLmdldE1lbWJlcnNXaXRoVXNlcigpO1xuICAgICAgICBjb25zdCBmaWx0ZXJlZEFuZFNvcnRlZE1lbWJlcnMgPSBhbGxNZW1iZXJzLmZpbHRlcigobSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBtLm1lbWJlcnNoaXAgPT09ICdqb2luJyB8fCBtLm1lbWJlcnNoaXAgPT09ICdpbnZpdGUnXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgZmlsdGVyZWRBbmRTb3J0ZWRNZW1iZXJzLnNvcnQodGhpcy5tZW1iZXJTb3J0KTtcbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkQW5kU29ydGVkTWVtYmVycztcbiAgICB9XG5cbiAgICBfY3JlYXRlT3ZlcmZsb3dUaWxlSm9pbmVkID0gKG92ZXJmbG93Q291bnQsIHRvdGFsQ291bnQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZU92ZXJmbG93VGlsZShvdmVyZmxvd0NvdW50LCB0b3RhbENvdW50LCB0aGlzLl9zaG93TW9yZUpvaW5lZE1lbWJlckxpc3QpO1xuICAgIH07XG5cbiAgICBfY3JlYXRlT3ZlcmZsb3dUaWxlSW52aXRlZCA9IChvdmVyZmxvd0NvdW50LCB0b3RhbENvdW50KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVPdmVyZmxvd1RpbGUob3ZlcmZsb3dDb3VudCwgdG90YWxDb3VudCwgdGhpcy5fc2hvd01vcmVJbnZpdGVkTWVtYmVyTGlzdCk7XG4gICAgfTtcblxuICAgIF9jcmVhdGVPdmVyZmxvd1RpbGUgPSAob3ZlcmZsb3dDb3VudCwgdG90YWxDb3VudCwgb25DbGljaykgPT4ge1xuICAgICAgICAvLyBGb3Igbm93IHdlJ2xsIHByZXRlbmQgdGhpcyBpcyBhbnkgZW50aXR5LiBJdCBzaG91bGQgcHJvYmFibHkgYmUgYSBzZXBhcmF0ZSB0aWxlLlxuICAgICAgICBjb25zdCBFbnRpdHlUaWxlID0gc2RrLmdldENvbXBvbmVudChcInJvb21zLkVudGl0eVRpbGVcIik7XG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXZhdGFycy5CYXNlQXZhdGFyXCIpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gX3QoXCJhbmQgJShjb3VudClzIG90aGVycy4uLlwiLCB7IGNvdW50OiBvdmVyZmxvd0NvdW50IH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEVudGl0eVRpbGUgY2xhc3NOYW1lPVwibXhfRW50aXR5VGlsZV9lbGxpcHNpc1wiIGF2YXRhckpzeD17XG4gICAgICAgICAgICAgICAgPEJhc2VBdmF0YXIgdXJsPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGxpcHNpcy5zdmdcIil9IG5hbWU9XCIuLi5cIiB3aWR0aD17MzZ9IGhlaWdodD17MzZ9IC8+XG4gICAgICAgICAgICB9IG5hbWU9e3RleHR9IHByZXNlbmNlU3RhdGU9XCJvbmxpbmVcIiBzdXBwcmVzc09uSG92ZXI9e3RydWV9XG4gICAgICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfSAvPlxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBfc2hvd01vcmVKb2luZWRNZW1iZXJMaXN0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRydW5jYXRlQXRKb2luZWQ6IHRoaXMuc3RhdGUudHJ1bmNhdGVBdEpvaW5lZCArIFNIT1dfTU9SRV9JTkNSRU1FTlQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfc2hvd01vcmVJbnZpdGVkTWVtYmVyTGlzdCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0cnVuY2F0ZUF0SW52aXRlZDogdGhpcy5zdGF0ZS50cnVuY2F0ZUF0SW52aXRlZCArIFNIT1dfTU9SRV9JTkNSRU1FTlQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBtZW1iZXJTdHJpbmcobWVtYmVyKSB7XG4gICAgICAgIGlmICghbWVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gXCIobnVsbClcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHUgPSBtZW1iZXIudXNlcjtcbiAgICAgICAgICAgIHJldHVybiBcIihcIiArIG1lbWJlci5uYW1lICsgXCIsIFwiICsgbWVtYmVyLnBvd2VyTGV2ZWwgKyBcIiwgXCIgKyAodSA/IHUubGFzdEFjdGl2ZUFnbyA6IFwiPG51bGw+XCIpICsgXCIsIFwiICsgKHUgPyB1LmdldExhc3RBY3RpdmVUcygpIDogXCI8bnVsbD5cIikgKyBcIiwgXCIgKyAodSA/IHUuY3VycmVudGx5QWN0aXZlIDogXCI8bnVsbD5cIikgKyBcIiwgXCIgKyAodSA/IHUucHJlc2VuY2UgOiBcIjxudWxsPlwiKSArIFwiKVwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyBuZWdhdGl2ZSBpZiBhIGNvbWVzIGJlZm9yZSBiLFxuICAgIC8vIHJldHVybnMgMCBpZiBhIGFuZCBiIGFyZSBlcXVpdmFsZW50IGluIG9yZGVyaW5nXG4gICAgLy8gcmV0dXJucyBwb3NpdGl2ZSBpZiBhIGNvbWVzIGFmdGVyIGIuXG4gICAgbWVtYmVyU29ydCA9IChtZW1iZXJBLCBtZW1iZXJCKSA9PiB7XG4gICAgICAgIC8vIG9yZGVyIGJ5IHByZXNlbmNlLCB3aXRoIFwiYWN0aXZlIG5vd1wiIGZpcnN0LlxuICAgICAgICAvLyAuLi5hbmQgdGhlbiBieSBwb3dlciBsZXZlbFxuICAgICAgICAvLyAuLi5hbmQgdGhlbiBieSBsYXN0IGFjdGl2ZVxuICAgICAgICAvLyAuLi5hbmQgdGhlbiBhbHBoYWJldGljYWxseS5cbiAgICAgICAgLy8gV2UgY291bGQgdGllYnJlYWsgaW5zdGVhZCBieSBcImxhc3QgcmVjZW50bHkgc3Bva2VuIGluIHRoaXMgcm9vbVwiIGlmIHdlIHdhbnRlZCB0by5cblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgQ29tcGFyaW5nIHVzZXJBPSR7dGhpcy5tZW1iZXJTdHJpbmcobWVtYmVyQSl9IHVzZXJCPSR7dGhpcy5tZW1iZXJTdHJpbmcobWVtYmVyQil9YCk7XG5cbiAgICAgICAgY29uc3QgdXNlckEgPSBtZW1iZXJBLnVzZXI7XG4gICAgICAgIGNvbnN0IHVzZXJCID0gbWVtYmVyQi51c2VyO1xuXG4gICAgICAgIC8vIGlmICghdXNlckEpIGNvbnNvbGUubG9nKFwiISEgTUlTU0lORyBVU0VSIEZPUiBBLVNJREU6IFwiICsgbWVtYmVyQS5uYW1lICsgXCIgISFcIik7XG4gICAgICAgIC8vIGlmICghdXNlckIpIGNvbnNvbGUubG9nKFwiISEgTUlTU0lORyBVU0VSIEZPUiBCLVNJREU6IFwiICsgbWVtYmVyQi5uYW1lICsgXCIgISFcIik7XG5cbiAgICAgICAgaWYgKCF1c2VyQSAmJiAhdXNlckIpIHJldHVybiAwO1xuICAgICAgICBpZiAodXNlckEgJiYgIXVzZXJCKSByZXR1cm4gLTE7XG4gICAgICAgIGlmICghdXNlckEgJiYgdXNlckIpIHJldHVybiAxO1xuXG4gICAgICAgIC8vIEZpcnN0IGJ5IHByZXNlbmNlXG4gICAgICAgIGlmICh0aGlzLl9zaG93UHJlc2VuY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRQcmVzZW5jZSA9IChwKSA9PiBwID09PSAndW5hdmFpbGFibGUnID8gJ29ubGluZScgOiBwO1xuICAgICAgICAgICAgY29uc3QgcHJlc2VuY2VJbmRleCA9IHAgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9yZGVyID0gWydhY3RpdmUnLCAnb25saW5lJywgJ29mZmxpbmUnXTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBvcmRlci5pbmRleE9mKGNvbnZlcnRQcmVzZW5jZShwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkeCA9PT0gLTEgPyBvcmRlci5sZW5ndGggOiBpZHg7IC8vIHVua25vd24gc3RhdGVzIGF0IHRoZSBlbmRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGlkeEEgPSBwcmVzZW5jZUluZGV4KHVzZXJBLmN1cnJlbnRseUFjdGl2ZSA/ICdhY3RpdmUnIDogdXNlckEucHJlc2VuY2UpO1xuICAgICAgICAgICAgY29uc3QgaWR4QiA9IHByZXNlbmNlSW5kZXgodXNlckIuY3VycmVudGx5QWN0aXZlID8gJ2FjdGl2ZScgOiB1c2VyQi5wcmVzZW5jZSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgdXNlckFfcHJlc2VuY2VHcm91cD0ke2lkeEF9IHVzZXJCX3ByZXNlbmNlR3JvdXA9JHtpZHhCfWApO1xuICAgICAgICAgICAgaWYgKGlkeEEgIT09IGlkeEIpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkNvbXBhcmluZyBvbiBwcmVzZW5jZSBncm91cCAtIHJldHVybmluZ1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWR4QSAtIGlkeEI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZWNvbmQgYnkgcG93ZXIgbGV2ZWxcbiAgICAgICAgaWYgKG1lbWJlckEucG93ZXJMZXZlbCAhPT0gbWVtYmVyQi5wb3dlckxldmVsKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkNvbXBhcmluZyBvbiBwb3dlciBsZXZlbCAtIHJldHVybmluZ1wiKTtcbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJCLnBvd2VyTGV2ZWwgLSBtZW1iZXJBLnBvd2VyTGV2ZWw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlyZCBieSBsYXN0IGFjdGl2ZVxuICAgICAgICBpZiAodGhpcy5fc2hvd1ByZXNlbmNlICYmIHVzZXJBLmdldExhc3RBY3RpdmVUcygpICE9PSB1c2VyQi5nZXRMYXN0QWN0aXZlVHMoKSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJDb21wYXJpbmcgb24gbGFzdCBhY3RpdmUgdGltZXN0YW1wIC0gcmV0dXJuaW5nXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHVzZXJCLmdldExhc3RBY3RpdmVUcygpIC0gdXNlckEuZ2V0TGFzdEFjdGl2ZVRzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb3VydGggYnkgbmFtZSAoYWxwaGFiZXRpY2FsKVxuICAgICAgICBjb25zdCBuYW1lQSA9IChtZW1iZXJBLm5hbWVbMF0gPT09ICdAJyA/IG1lbWJlckEubmFtZS5zdWJzdHIoMSkgOiBtZW1iZXJBLm5hbWUpLnJlcGxhY2UoU09SVF9SRUdFWCwgXCJcIik7XG4gICAgICAgIGNvbnN0IG5hbWVCID0gKG1lbWJlckIubmFtZVswXSA9PT0gJ0AnID8gbWVtYmVyQi5uYW1lLnN1YnN0cigxKSA6IG1lbWJlckIubmFtZSkucmVwbGFjZShTT1JUX1JFR0VYLCBcIlwiKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYENvbXBhcmluZyB1c2VyQV9uYW1lPSR7bmFtZUF9IGFnYWluc3QgdXNlckJfbmFtZT0ke25hbWVCfSAtIHJldHVybmluZ2ApO1xuICAgICAgICByZXR1cm4gbmFtZUEubG9jYWxlQ29tcGFyZShuYW1lQiwge1xuICAgICAgICAgICAgaWdub3JlUHVuY3R1YXRpb246IHRydWUsXG4gICAgICAgICAgICBzZW5zaXRpdml0eTogXCJiYXNlXCIsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvblNlYXJjaFF1ZXJ5Q2hhbmdlZCA9IHNlYXJjaFF1ZXJ5ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWFyY2hRdWVyeSxcbiAgICAgICAgICAgIGZpbHRlcmVkSm9pbmVkTWVtYmVyczogdGhpcy5fZmlsdGVyTWVtYmVycyh0aGlzLnN0YXRlLm1lbWJlcnMsICdqb2luJywgc2VhcmNoUXVlcnkpLFxuICAgICAgICAgICAgZmlsdGVyZWRJbnZpdGVkTWVtYmVyczogdGhpcy5fZmlsdGVyTWVtYmVycyh0aGlzLnN0YXRlLm1lbWJlcnMsICdpbnZpdGUnLCBzZWFyY2hRdWVyeSksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25QZW5kaW5nM3BpZEludml0ZUNsaWNrID0gaW52aXRlRXZlbnQgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld18zcGlkX2ludml0ZScsXG4gICAgICAgICAgICBldmVudDogaW52aXRlRXZlbnQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfZmlsdGVyTWVtYmVycyhtZW1iZXJzLCBtZW1iZXJzaGlwLCBxdWVyeSkge1xuICAgICAgICByZXR1cm4gbWVtYmVycy5maWx0ZXIoKG0pID0+IHtcbiAgICAgICAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzTmFtZSA9IG0ubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpICE9PSAtMTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzSWQgPSBtLnVzZXJJZC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpICE9PSAtMTtcblxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlc05hbWUgJiYgIW1hdGNoZXNJZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbS5tZW1iZXJzaGlwID09PSBtZW1iZXJzaGlwO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZ2V0UGVuZGluZzNQaWRJbnZpdGVzKCkge1xuICAgICAgICAvLyBpbmNsdWRlIDNwaWQgaW52aXRlcyAobS5yb29tLnRoaXJkX3BhcnR5X2ludml0ZSkgc3RhdGUgZXZlbnRzLlxuICAgICAgICAvLyBUaGUgSFMgbWF5IGhhdmUgYWxyZWFkeSBjb252ZXJ0ZWQgdGhlc2UgaW50byBtLnJvb20ubWVtYmVyIGludml0ZXMgc29cbiAgICAgICAgLy8gd2Ugc2hvdWxkbid0IGFkZCB0aGVtIGlmIHRoZSAzcGlkIGludml0ZSBzdGF0ZSBrZXkgKHRva2VuKSBpcyBpbiB0aGVcbiAgICAgICAgLy8gbWVtYmVyIGludml0ZSAoY29udGVudC50aGlyZF9wYXJ0eV9pbnZpdGUuc2lnbmVkLnRva2VuKVxuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuXG4gICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICByZXR1cm4gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20udGhpcmRfcGFydHlfaW52aXRlXCIpLmZpbHRlcihmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkM3BpZEludml0ZShlKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgLy8gZGlzY2FyZCBhbGwgaW52aXRlcyB3aGljaCBoYXZlIGEgbS5yb29tLm1lbWJlciBldmVudCBzaW5jZSB3ZSd2ZVxuICAgICAgICAgICAgICAgIC8vIGFscmVhZHkgYWRkZWQgdGhlbS5cbiAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXJFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldEludml0ZUZvclRocmVlUGlkVG9rZW4oZS5nZXRTdGF0ZUtleSgpKTtcbiAgICAgICAgICAgICAgICBpZiAobWVtYmVyRXZlbnQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX21ha2VNZW1iZXJUaWxlcyhtZW1iZXJzKSB7XG4gICAgICAgIGNvbnN0IE1lbWJlclRpbGUgPSBzZGsuZ2V0Q29tcG9uZW50KFwicm9vbXMuTWVtYmVyVGlsZVwiKTtcbiAgICAgICAgY29uc3QgRW50aXR5VGlsZSA9IHNkay5nZXRDb21wb25lbnQoXCJyb29tcy5FbnRpdHlUaWxlXCIpO1xuXG4gICAgICAgIHJldHVybiBtZW1iZXJzLm1hcCgobSkgPT4ge1xuICAgICAgICAgICAgaWYgKG0udXNlcklkKSB7XG4gICAgICAgICAgICAgICAgLy8gSXMgYSBNYXRyaXggaW52aXRlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxNZW1iZXJUaWxlIGtleT17bS51c2VySWR9IG1lbWJlcj17bX0gcmVmPXttLnVzZXJJZH0gc2hvd1ByZXNlbmNlPXt0aGlzLl9zaG93UHJlc2VuY2V9IC8+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJcyBhIDNwaWQgaW52aXRlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxFbnRpdHlUaWxlIGtleT17bS5nZXRTdGF0ZUtleSgpfSBuYW1lPXttLmdldENvbnRlbnQoKS5kaXNwbGF5X25hbWV9IHN1cHByZXNzT25Ib3Zlcj17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5fb25QZW5kaW5nM3BpZEludml0ZUNsaWNrKG0pfSAvPjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2dldENoaWxkcmVuSm9pbmVkID0gKHN0YXJ0LCBlbmQpID0+IHRoaXMuX21ha2VNZW1iZXJUaWxlcyh0aGlzLnN0YXRlLmZpbHRlcmVkSm9pbmVkTWVtYmVycy5zbGljZShzdGFydCwgZW5kKSk7XG5cbiAgICBfZ2V0Q2hpbGRDb3VudEpvaW5lZCA9ICgpID0+IHRoaXMuc3RhdGUuZmlsdGVyZWRKb2luZWRNZW1iZXJzLmxlbmd0aDtcblxuICAgIF9nZXRDaGlsZHJlbkludml0ZWQgPSAoc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0cyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRJbnZpdGVkTWVtYmVycztcbiAgICAgICAgaWYgKGVuZCA+IHRoaXMuc3RhdGUuZmlsdGVyZWRJbnZpdGVkTWVtYmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRhcmdldHMgPSB0YXJnZXRzLmNvbmNhdCh0aGlzLl9nZXRQZW5kaW5nM1BpZEludml0ZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fbWFrZU1lbWJlclRpbGVzKHRhcmdldHMuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICAgIH07XG5cbiAgICBfZ2V0Q2hpbGRDb3VudEludml0ZWQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmZpbHRlcmVkSW52aXRlZE1lbWJlcnMubGVuZ3RoICsgKHRoaXMuX2dldFBlbmRpbmczUGlkSW52aXRlcygpIHx8IFtdKS5sZW5ndGg7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgICAgICByZXR1cm4gPEJhc2VDYXJkXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVtYmVyTGlzdFwiXG4gICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5wcm9wcy5vbkNsb3NlfVxuICAgICAgICAgICAgICAgIHByZXZpb3VzUGhhc2U9e1JpZ2h0UGFuZWxQaGFzZXMuUm9vbVN1bW1hcnl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgIDwvQmFzZUNhcmQ+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgU2VhcmNoQm94ID0gc2RrLmdldENvbXBvbmVudCgnc3RydWN0dXJlcy5TZWFyY2hCb3gnKTtcbiAgICAgICAgY29uc3QgVHJ1bmNhdGVkTGlzdCA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5UcnVuY2F0ZWRMaXN0XCIpO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgbGV0IGludml0ZUJ1dHRvbjtcblxuICAgICAgICBpZiAocm9vbSAmJiByb29tLmdldE15TWVtYmVyc2hpcCgpID09PSAnam9pbicpIHtcbiAgICAgICAgICAgIC8vIGFzc3VtZSB3ZSBjYW4gaW52aXRlIHVudGlsIHByb3ZlbiBmYWxzZVxuICAgICAgICAgICAgbGV0IGNhbkludml0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGNvbnN0IHBsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIiwgXCJcIik7XG4gICAgICAgICAgICBjb25zdCBtZSA9IHJvb20uZ2V0TWVtYmVyKGNsaS5nZXRVc2VySWQoKSk7XG4gICAgICAgICAgICBpZiAocGxFdmVudCAmJiBtZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBwbEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGVudCAmJiBjb250ZW50Lmludml0ZSA+IG1lLnBvd2VyTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FuSW52aXRlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgaW52aXRlQnV0dG9uVGV4dCA9IF90KFwiSW52aXRlIHRvIHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgIGNvbnN0IGNoYXQgPSBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRTZWxlY3RlZENvbW11bml0eUdlbmVyYWxDaGF0KCk7XG4gICAgICAgICAgICBpZiAoY2hhdCAmJiBjaGF0LnJvb21JZCA9PT0gdGhpcy5wcm9wcy5yb29tSWQpIHtcbiAgICAgICAgICAgICAgICBpbnZpdGVCdXR0b25UZXh0ID0gX3QoXCJJbnZpdGUgdG8gdGhpcyBjb21tdW5pdHlcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvblwiKTtcbiAgICAgICAgICAgIGludml0ZUJ1dHRvbiA9XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfTWVtYmVyTGlzdF9pbnZpdGVcIiBvbkNsaWNrPXt0aGlzLm9uSW52aXRlQnV0dG9uQ2xpY2t9IGRpc2FibGVkPXshY2FuSW52aXRlfT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+eyBpbnZpdGVCdXR0b25UZXh0IH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbnZpdGVkSGVhZGVyO1xuICAgICAgICBsZXQgaW52aXRlZFNlY3Rpb247XG4gICAgICAgIGlmICh0aGlzLl9nZXRDaGlsZENvdW50SW52aXRlZCgpID4gMCkge1xuICAgICAgICAgICAgaW52aXRlZEhlYWRlciA9IDxoMj57IF90KFwiSW52aXRlZFwiKSB9PC9oMj47XG4gICAgICAgICAgICBpbnZpdGVkU2VjdGlvbiA9IDxUcnVuY2F0ZWRMaXN0IGNsYXNzTmFtZT1cIm14X01lbWJlckxpc3Rfc2VjdGlvbiBteF9NZW1iZXJMaXN0X2ludml0ZWRcIiB0cnVuY2F0ZUF0PXt0aGlzLnN0YXRlLnRydW5jYXRlQXRJbnZpdGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlT3ZlcmZsb3dFbGVtZW50PXt0aGlzLl9jcmVhdGVPdmVyZmxvd1RpbGVJbnZpdGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Q2hpbGRyZW49e3RoaXMuX2dldENoaWxkcmVuSW52aXRlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGdldENoaWxkQ291bnQ9e3RoaXMuX2dldENoaWxkQ291bnRJbnZpdGVkfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9vdGVyID0gKFxuICAgICAgICAgICAgPFNlYXJjaEJveFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lbWJlckxpc3RfcXVlcnkgbXhfdGV4dGlucHV0X2ljb24gbXhfdGV4dGlucHV0X3NlYXJjaFwiXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9eyBfdCgnRmlsdGVyIHJvb20gbWVtYmVycycpIH1cbiAgICAgICAgICAgICAgICBvblNlYXJjaD17IHRoaXMub25TZWFyY2hRdWVyeUNoYW5nZWQgfSAvPlxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiA8QmFzZUNhcmRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lbWJlckxpc3RcIlxuICAgICAgICAgICAgaGVhZGVyPXtpbnZpdGVCdXR0b259XG4gICAgICAgICAgICBmb290ZXI9e2Zvb3Rlcn1cbiAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMucHJvcHMub25DbG9zZX1cbiAgICAgICAgICAgIHByZXZpb3VzUGhhc2U9e1JpZ2h0UGFuZWxQaGFzZXMuUm9vbVN1bW1hcnl9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVtYmVyTGlzdF93cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgPFRydW5jYXRlZExpc3QgY2xhc3NOYW1lPVwibXhfTWVtYmVyTGlzdF9zZWN0aW9uIG14X01lbWJlckxpc3Rfam9pbmVkXCIgdHJ1bmNhdGVBdD17dGhpcy5zdGF0ZS50cnVuY2F0ZUF0Sm9pbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU92ZXJmbG93RWxlbWVudD17dGhpcy5fY3JlYXRlT3ZlcmZsb3dUaWxlSm9pbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldENoaWxkcmVuPXt0aGlzLl9nZXRDaGlsZHJlbkpvaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRDaGlsZENvdW50PXt0aGlzLl9nZXRDaGlsZENvdW50Sm9pbmVkfSAvPlxuICAgICAgICAgICAgICAgIHsgaW52aXRlZEhlYWRlciB9XG4gICAgICAgICAgICAgICAgeyBpbnZpdGVkU2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9CYXNlQ2FyZD47XG4gICAgfVxuXG4gICAgb25JbnZpdGVCdXR0b25DbGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYWxsIEFkZHJlc3NQaWNrZXJEaWFsb2dcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfaW52aXRlJyxcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5wcm9wcy5yb29tSWQsXG4gICAgICAgIH0pO1xuICAgIH07XG59XG4iXX0=
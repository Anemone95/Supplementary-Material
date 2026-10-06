"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _RoomName = _interopRequireDefault(require("../elements/RoomName"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

const INITIAL_LOAD_NUM_MEMBERS = 30;
const INITIAL_LOAD_NUM_INVITED = 5;
const SHOW_MORE_INCREMENT = 100; // Regex applied to filter our punctuation in member names before applying sort, to fuzzy it a little
// matches all ASCII punctuation: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~

const SORT_REGEX = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]+/g;
let MemberList = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.MemberList"), _dec(_class = (_temp = class MemberList extends _react.default.Component {
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
      const canInvite = room.canInvite(cli.getUserId());
      let inviteButtonText = (0, _languageHandler._t)("Invite to this room");

      const chat = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityGeneralChat();

      if (chat && chat.roomId === this.props.roomId) {
        inviteButtonText = (0, _languageHandler._t)("Invite to this community");
      } else if (room.isSpaceRoom()) {
        inviteButtonText = (0, _languageHandler._t)("Invite to this space");
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

    let previousPhase = _RightPanelStorePhases.RightPanelPhases.RoomSummary; // We have no previousPhase for when viewing a MemberList from a Space

    let scopeHeader;

    if (room?.isSpaceRoom()) {
      previousPhase = undefined;
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

    return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
      className: "mx_MemberList",
      header: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, scopeHeader, inviteButton),
      footer: footer,
      onClose: this.props.onClose,
      previousPhase: previousPhase
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

}, _temp)) || _class);
exports.default = MemberList;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL01lbWJlckxpc3QuanMiXSwibmFtZXMiOlsiSU5JVElBTF9MT0FEX05VTV9NRU1CRVJTIiwiSU5JVElBTF9MT0FEX05VTV9JTlZJVEVEIiwiU0hPV19NT1JFX0lOQ1JFTUVOVCIsIlNPUlRfUkVHRVgiLCJNZW1iZXJMaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXZlbnQiLCJ1c2VyIiwidGlsZSIsInJlZnMiLCJ1c2VySWQiLCJfdXBkYXRlTGlzdCIsInJvb20iLCJyb29tSWQiLCJfc2hvd01lbWJlcnNBY2NvcmRpbmdUb01lbWJlcnNoaXBXaXRoTEwiLCJtZW1iZXJzaGlwIiwib2xkTWVtYmVyc2hpcCIsImV2Iiwic3RhdGUiLCJtZW1iZXIiLCJnZXRSb29tSWQiLCJnZXRUeXBlIiwiX3VwZGF0ZUxpc3ROb3ciLCJvdmVyZmxvd0NvdW50IiwidG90YWxDb3VudCIsIl9jcmVhdGVPdmVyZmxvd1RpbGUiLCJfc2hvd01vcmVKb2luZWRNZW1iZXJMaXN0IiwiX3Nob3dNb3JlSW52aXRlZE1lbWJlckxpc3QiLCJvbkNsaWNrIiwiRW50aXR5VGlsZSIsInNkayIsImdldENvbXBvbmVudCIsIkJhc2VBdmF0YXIiLCJ0ZXh0IiwiY291bnQiLCJyZXF1aXJlIiwic2V0U3RhdGUiLCJ0cnVuY2F0ZUF0Sm9pbmVkIiwidHJ1bmNhdGVBdEludml0ZWQiLCJtZW1iZXJBIiwibWVtYmVyQiIsInVzZXJBIiwidXNlckIiLCJfc2hvd1ByZXNlbmNlIiwiY29udmVydFByZXNlbmNlIiwicCIsInByZXNlbmNlSW5kZXgiLCJvcmRlciIsImlkeCIsImluZGV4T2YiLCJsZW5ndGgiLCJpZHhBIiwiY3VycmVudGx5QWN0aXZlIiwicHJlc2VuY2UiLCJpZHhCIiwicG93ZXJMZXZlbCIsImdldExhc3RBY3RpdmVUcyIsIm5hbWVBIiwibmFtZSIsInN1YnN0ciIsInJlcGxhY2UiLCJuYW1lQiIsImxvY2FsZUNvbXBhcmUiLCJpZ25vcmVQdW5jdHVhdGlvbiIsInNlbnNpdGl2aXR5Iiwic2VhcmNoUXVlcnkiLCJmaWx0ZXJlZEpvaW5lZE1lbWJlcnMiLCJfZmlsdGVyTWVtYmVycyIsIm1lbWJlcnMiLCJmaWx0ZXJlZEludml0ZWRNZW1iZXJzIiwiaW52aXRlRXZlbnQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInN0YXJ0IiwiZW5kIiwiX21ha2VNZW1iZXJUaWxlcyIsInNsaWNlIiwidGFyZ2V0cyIsImNvbmNhdCIsIl9nZXRQZW5kaW5nM1BpZEludml0ZXMiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc0d1ZXN0IiwiY2xpIiwiaGFzTGF6eUxvYWRNZW1iZXJzRW5hYmxlZCIsIl9nZXRNZW1iZXJzU3RhdGUiLCJyb29tTWVtYmVycyIsIm9uIiwib25Sb29tIiwiZW5hYmxlUHJlc2VuY2VCeUhzVXJsIiwiU2RrQ29uZmlnIiwiaHNVcmwiLCJiYXNlVXJsIiwidW5kZWZpbmVkIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsIl9tb3VudGVkIiwib25NeU1lbWJlcnNoaXAiLCJfbGlzdGVuRm9yTWVtYmVyc0NoYW5nZXMiLCJvblJvb21TdGF0ZU1lbWJlciIsIm9uUm9vbU1lbWJlck5hbWUiLCJvblJvb21TdGF0ZUV2ZW50Iiwib25Vc2VyUHJlc2VuY2VDaGFuZ2UiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwiY2FuY2VsUGVuZGluZ0NhbGwiLCJnZXRSb29tIiwiZ2V0TXlNZW1iZXJzaGlwIiwibG9hZGluZyIsImxvYWRNZW1iZXJzSWZOZWVkZWQiLCJleCIsIm5ld1N0YXRlIiwiZ2V0TWVtYmVyc1dpdGhVc2VyIiwiYWxsTWVtYmVycyIsIk9iamVjdCIsInZhbHVlcyIsImN1cnJlbnRTdGF0ZSIsImZvckVhY2giLCJnZXRVc2VyIiwiZmlsdGVyZWRBbmRTb3J0ZWRNZW1iZXJzIiwiZmlsdGVyIiwibSIsInNvcnQiLCJtZW1iZXJTb3J0IiwibWVtYmVyU3RyaW5nIiwidSIsImxhc3RBY3RpdmVBZ28iLCJxdWVyeSIsInRvTG93ZXJDYXNlIiwibWF0Y2hlc05hbWUiLCJtYXRjaGVzSWQiLCJnZXRTdGF0ZUV2ZW50cyIsImUiLCJtZW1iZXJFdmVudCIsImdldEludml0ZUZvclRocmVlUGlkVG9rZW4iLCJnZXRTdGF0ZUtleSIsIk1lbWJlclRpbGUiLCJtYXAiLCJnZXRDb250ZW50IiwiZGlzcGxheV9uYW1lIiwiX29uUGVuZGluZzNwaWRJbnZpdGVDbGljayIsInJlbmRlciIsIlNwaW5uZXIiLCJvbkNsb3NlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIlJvb21TdW1tYXJ5IiwiU2VhcmNoQm94IiwiVHJ1bmNhdGVkTGlzdCIsImludml0ZUJ1dHRvbiIsImNhbkludml0ZSIsImdldFVzZXJJZCIsImludml0ZUJ1dHRvblRleHQiLCJjaGF0IiwiQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUiLCJpbnN0YW5jZSIsImdldFNlbGVjdGVkQ29tbXVuaXR5R2VuZXJhbENoYXQiLCJpc1NwYWNlUm9vbSIsIkFjY2Vzc2libGVCdXR0b24iLCJvbkludml0ZUJ1dHRvbkNsaWNrIiwiaW52aXRlZEhlYWRlciIsImludml0ZWRTZWN0aW9uIiwiX2dldENoaWxkQ291bnRJbnZpdGVkIiwiX2NyZWF0ZU92ZXJmbG93VGlsZUludml0ZWQiLCJfZ2V0Q2hpbGRyZW5JbnZpdGVkIiwiZm9vdGVyIiwib25TZWFyY2hRdWVyeUNoYW5nZWQiLCJwcmV2aW91c1BoYXNlIiwic2NvcGVIZWFkZXIiLCJfY3JlYXRlT3ZlcmZsb3dUaWxlSm9pbmVkIiwiX2dldENoaWxkcmVuSm9pbmVkIiwiX2dldENoaWxkQ291bnRKb2luZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxNQUFNQSx3QkFBd0IsR0FBRyxF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LENBQVA7QUFtQkg7O0FBL2RtRCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHtpc1ZhbGlkM3BpZEludml0ZX0gZnJvbSBcIi4uLy4uLy4uL1Jvb21JbnZpdGVcIjtcbmltcG9ydCByYXRlX2xpbWl0ZWRfZnVuYyBmcm9tIFwiLi4vLi4vLi4vcmF0ZWxpbWl0ZWRmdW5jXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IHtDb21tdW5pdHlQcm90b3R5cGVTdG9yZX0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Db21tdW5pdHlQcm90b3R5cGVTdG9yZVwiO1xuaW1wb3J0IEJhc2VDYXJkIGZyb20gXCIuLi9yaWdodF9wYW5lbC9CYXNlQ2FyZFwiO1xuaW1wb3J0IHtSaWdodFBhbmVsUGhhc2VzfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1JpZ2h0UGFuZWxTdG9yZVBoYXNlc1wiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvUm9vbUF2YXRhclwiO1xuaW1wb3J0IFJvb21OYW1lIGZyb20gXCIuLi9lbGVtZW50cy9Sb29tTmFtZVwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmNvbnN0IElOSVRJQUxfTE9BRF9OVU1fTUVNQkVSUyA9IDMwO1xuY29uc3QgSU5JVElBTF9MT0FEX05VTV9JTlZJVEVEID0gNTtcbmNvbnN0IFNIT1dfTU9SRV9JTkNSRU1FTlQgPSAxMDA7XG5cbi8vIFJlZ2V4IGFwcGxpZWQgdG8gZmlsdGVyIG91ciBwdW5jdHVhdGlvbiBpbiBtZW1iZXIgbmFtZXMgYmVmb3JlIGFwcGx5aW5nIHNvcnQsIHRvIGZ1enp5IGl0IGEgbGl0dGxlXG4vLyBtYXRjaGVzIGFsbCBBU0NJSSBwdW5jdHVhdGlvbjogIVwiIyQlJicoKSorLC0uLzo7PD0+P0BbXFxdXl9ge3x9flxuY29uc3QgU09SVF9SRUdFWCA9IC9bXFx4MjEtXFx4MkZcXHgzQS1cXHg0MFxceDVCLVxceDYwXFx4N0ItXFx4N0VdKy9nO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5NZW1iZXJMaXN0XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZW1iZXJMaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpLmhhc0xhenlMb2FkTWVtYmVyc0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgLy8gc2hvdyBhbiBlbXB0eSBsaXN0XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5fZ2V0TWVtYmVyc1N0YXRlKFtdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLl9nZXRNZW1iZXJzU3RhdGUodGhpcy5yb29tTWVtYmVycygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsaS5vbihcIlJvb21cIiwgdGhpcy5vblJvb20pOyAvLyBpbnZpdGVzICYgam9pbmluZyBhZnRlciBwZWVrXG4gICAgICAgIGNvbnN0IGVuYWJsZVByZXNlbmNlQnlIc1VybCA9IFNka0NvbmZpZy5nZXQoKVtcImVuYWJsZV9wcmVzZW5jZV9ieV9oc191cmxcIl07XG4gICAgICAgIGNvbnN0IGhzVXJsID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmJhc2VVcmw7XG4gICAgICAgIHRoaXMuX3Nob3dQcmVzZW5jZSA9IHRydWU7XG4gICAgICAgIGlmIChlbmFibGVQcmVzZW5jZUJ5SHNVcmwgJiYgZW5hYmxlUHJlc2VuY2VCeUhzVXJsW2hzVXJsXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93UHJlc2VuY2UgPSBlbmFibGVQcmVzZW5jZUJ5SHNVcmxbaHNVcmxdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgdGhpcy5fbW91bnRlZCA9IHRydWU7XG4gICAgICAgIGlmIChjbGkuaGFzTGF6eUxvYWRNZW1iZXJzRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93TWVtYmVyc0FjY29yZGluZ1RvTWVtYmVyc2hpcFdpdGhMTCgpO1xuICAgICAgICAgICAgY2xpLm9uKFwiUm9vbS5teU1lbWJlcnNoaXBcIiwgdGhpcy5vbk15TWVtYmVyc2hpcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5Gb3JNZW1iZXJzQ2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2xpc3RlbkZvck1lbWJlcnNDaGFuZ2VzKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNsaS5vbihcIlJvb21TdGF0ZS5tZW1iZXJzXCIsIHRoaXMub25Sb29tU3RhdGVNZW1iZXIpO1xuICAgICAgICBjbGkub24oXCJSb29tTWVtYmVyLm5hbWVcIiwgdGhpcy5vblJvb21NZW1iZXJOYW1lKTtcbiAgICAgICAgY2xpLm9uKFwiUm9vbVN0YXRlLmV2ZW50c1wiLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnQpO1xuICAgICAgICAvLyBXZSBsaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGxhc3RQcmVzZW5jZVRzIHdoaWNoIGlzIGVzc2VudGlhbGx5XG4gICAgICAgIC8vIGxpc3RlbmluZyBmb3IgYWxsIHByZXNlbmNlIGV2ZW50cyAod2UgZGlzcGxheSBtb3N0IG9mIG5vdCBhbGwgb2ZcbiAgICAgICAgLy8gdGhlIGluZm9ybWF0aW9uIGNvbnRhaW5lZCBpbiBwcmVzZW5jZSBldmVudHMpLlxuICAgICAgICBjbGkub24oXCJVc2VyLmxhc3RQcmVzZW5jZVRzXCIsIHRoaXMub25Vc2VyUHJlc2VuY2VDaGFuZ2UpO1xuICAgICAgICBjbGkub24oXCJVc2VyLnByZXNlbmNlXCIsIHRoaXMub25Vc2VyUHJlc2VuY2VDaGFuZ2UpO1xuICAgICAgICBjbGkub24oXCJVc2VyLmN1cnJlbnRseUFjdGl2ZVwiLCB0aGlzLm9uVXNlclByZXNlbmNlQ2hhbmdlKTtcbiAgICAgICAgLy8gY2xpLm9uKFwiUm9vbS50aW1lbGluZVwiLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5fbW91bnRlZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmIChjbGkpIHtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihcIlJvb21TdGF0ZS5tZW1iZXJzXCIsIHRoaXMub25Sb29tU3RhdGVNZW1iZXIpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFwiUm9vbU1lbWJlci5uYW1lXCIsIHRoaXMub25Sb29tTWVtYmVyTmFtZSk7XG4gICAgICAgICAgICBjbGkucmVtb3ZlTGlzdGVuZXIoXCJSb29tLm15TWVtYmVyc2hpcFwiLCB0aGlzLm9uTXlNZW1iZXJzaGlwKTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5vblJvb21TdGF0ZUV2ZW50KTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihcIlJvb21cIiwgdGhpcy5vblJvb20pO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFwiVXNlci5sYXN0UHJlc2VuY2VUc1wiLCB0aGlzLm9uVXNlclByZXNlbmNlQ2hhbmdlKTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihcIlVzZXIucHJlc2VuY2VcIiwgdGhpcy5vblVzZXJQcmVzZW5jZUNoYW5nZSk7XG4gICAgICAgICAgICBjbGkucmVtb3ZlTGlzdGVuZXIoXCJVc2VyLmN1cnJlbnRseUFjdGl2ZVwiLCB0aGlzLm9uVXNlclByZXNlbmNlQ2hhbmdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbmNlbCBhbnkgcGVuZGluZyBjYWxscyB0byB0aGUgcmF0ZV9saW1pdGVkX2Z1bmNzXG4gICAgICAgIHRoaXMuX3VwZGF0ZUxpc3QuY2FuY2VsUGVuZGluZ0NhbGwoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiBsYXp5IGxvYWRpbmcgaXMgZW5hYmxlZCwgZWl0aGVyOlxuICAgICAqIHNob3cgYSBzcGlubmVyIGFuZCBsb2FkIHRoZSBtZW1iZXJzIGlmIHRoZSB1c2VyIGlzIGpvaW5lZCxcbiAgICAgKiBvciBzaG93IHRoZSBtZW1iZXJzIGF2YWlsYWJsZSBzbyBmYXIgaWYgdGhlIHVzZXIgaXMgaW52aXRlZFxuICAgICAqL1xuICAgIGFzeW5jIF9zaG93TWVtYmVyc0FjY29yZGluZ1RvTWVtYmVyc2hpcFdpdGhMTCgpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpLmhhc0xhenlMb2FkTWVtYmVyc0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlcnNoaXAgPSByb29tICYmIHJvb20uZ2V0TXlNZW1iZXJzaGlwKCk7XG4gICAgICAgICAgICBpZiAobWVtYmVyc2hpcCA9PT0gXCJqb2luXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtsb2FkaW5nOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgcm9vbS5sb2FkTWVtYmVyc0lmTmVlZGVkKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHsvKiBhbHJlYWR5IGxvZ2dlZCBpbiBSb29tVmlldyAqL31cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbW91bnRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMuX2dldE1lbWJlcnNTdGF0ZSh0aGlzLnJvb21NZW1iZXJzKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuRm9yTWVtYmVyc0NoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHNob3cgdGhlIG1lbWJlcnMgd2UgYWxyZWFkeSBoYXZlIGxvYWRlZFxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUodGhpcy5fZ2V0TWVtYmVyc1N0YXRlKHRoaXMucm9vbU1lbWJlcnMoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2dldE1lbWJlcnNTdGF0ZShtZW1iZXJzKSB7XG4gICAgICAgIC8vIHNldCB0aGUgc3RhdGUgYWZ0ZXIgZGV0ZXJtaW5pbmcgX3Nob3dQcmVzZW5jZSB0byBtYWtlIHN1cmUgaXQnc1xuICAgICAgICAvLyB0YWtlbiBpbnRvIGFjY291bnQgd2hpbGUgcmVyZW5kZXJpbmdcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgbWVtYmVyczogbWVtYmVycyxcbiAgICAgICAgICAgIGZpbHRlcmVkSm9pbmVkTWVtYmVyczogdGhpcy5fZmlsdGVyTWVtYmVycyhtZW1iZXJzLCAnam9pbicpLFxuICAgICAgICAgICAgZmlsdGVyZWRJbnZpdGVkTWVtYmVyczogdGhpcy5fZmlsdGVyTWVtYmVycyhtZW1iZXJzLCAnaW52aXRlJyksXG5cbiAgICAgICAgICAgIC8vIGlkZWFsbHkgd2UnZCBzaXplIHRoaXMgdG8gdGhlIHBhZ2UgaGVpZ2h0LCBidXRcbiAgICAgICAgICAgIC8vIGluIHByYWN0aWNlIEkgZmluZCB0aGF0IGEgbGl0dGxlIGNvbnN0cmFpbmluZ1xuICAgICAgICAgICAgdHJ1bmNhdGVBdEpvaW5lZDogSU5JVElBTF9MT0FEX05VTV9NRU1CRVJTLFxuICAgICAgICAgICAgdHJ1bmNhdGVBdEludml0ZWQ6IElOSVRJQUxfTE9BRF9OVU1fSU5WSVRFRCxcbiAgICAgICAgICAgIHNlYXJjaFF1ZXJ5OiBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uVXNlclByZXNlbmNlQ2hhbmdlID0gKGV2ZW50LCB1c2VyKSA9PiB7XG4gICAgICAgIC8vIEF0dGFjaCBhIFNJTkdMRSBsaXN0ZW5lciBmb3IgZ2xvYmFsIHByZXNlbmNlIGNoYW5nZXMgdGhlbiBsb2NhdGUgdGhlXG4gICAgICAgIC8vIG1lbWJlciB0aWxlIGFuZCByZS1yZW5kZXIgaXQuIFRoaXMgaXMgbW9yZSBlZmZpY2llbnQgdGhhbiBldmVyeSB0aWxlXG4gICAgICAgIC8vIGV2ZXIgYXR0YWNoaW5nIHRoZWlyIG93biBsaXN0ZW5lci5cbiAgICAgICAgY29uc3QgdGlsZSA9IHRoaXMucmVmc1t1c2VyLnVzZXJJZF07XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBHb3QgcHJlc2VuY2UgdXBkYXRlIGZvciAke3VzZXIudXNlcklkfS4gaGFzVGlsZT0keyEhdGlsZX1gKTtcbiAgICAgICAgaWYgKHRpbGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUxpc3QoKTsgLy8gcmVvcmRlciB0aGUgbWVtYmVyc2hpcCBsaXN0XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25Sb29tID0gcm9vbSA9PiB7XG4gICAgICAgIGlmIChyb29tLnJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tSWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBsaXN0ZW4gZm9yIHJvb20gZXZlbnRzIGJlY2F1c2Ugd2hlbiB3ZSBhY2NlcHQgYW4gaW52aXRlXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gd2FpdCB0aWxsIHRoZSByb29tIGlzIGZ1bGx5IHBvcHVsYXRlZCB3aXRoIHN0YXRlXG4gICAgICAgIC8vIGJlZm9yZSByZWZyZXNoaW5nIHRoZSBtZW1iZXIgbGlzdCBlbHNlIHdlIGdldCBhIHN0YWxlIGxpc3QuXG4gICAgICAgIHRoaXMuX3Nob3dNZW1iZXJzQWNjb3JkaW5nVG9NZW1iZXJzaGlwV2l0aExMKCk7XG4gICAgfTtcblxuICAgIG9uTXlNZW1iZXJzaGlwID0gKHJvb20sIG1lbWJlcnNoaXAsIG9sZE1lbWJlcnNoaXApID0+IHtcbiAgICAgICAgaWYgKHJvb20ucm9vbUlkID09PSB0aGlzLnByb3BzLnJvb21JZCAmJiBtZW1iZXJzaGlwID09PSBcImpvaW5cIikge1xuICAgICAgICAgICAgdGhpcy5fc2hvd01lbWJlcnNBY2NvcmRpbmdUb01lbWJlcnNoaXBXaXRoTEwoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvblJvb21TdGF0ZU1lbWJlciA9IChldiwgc3RhdGUsIG1lbWJlcikgPT4ge1xuICAgICAgICBpZiAobWVtYmVyLnJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tSWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cGRhdGVMaXN0KCk7XG4gICAgfTtcblxuICAgIG9uUm9vbU1lbWJlck5hbWUgPSAoZXYsIG1lbWJlcikgPT4ge1xuICAgICAgICBpZiAobWVtYmVyLnJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tSWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cGRhdGVMaXN0KCk7XG4gICAgfTtcblxuICAgIG9uUm9vbVN0YXRlRXZlbnQgPSAoZXZlbnQsIHN0YXRlKSA9PiB7XG4gICAgICAgIGlmIChldmVudC5nZXRSb29tSWQoKSA9PT0gdGhpcy5wcm9wcy5yb29tSWQgJiZcbiAgICAgICAgICAgIGV2ZW50LmdldFR5cGUoKSA9PT0gXCJtLnJvb20udGhpcmRfcGFydHlfaW52aXRlXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUxpc3QoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfdXBkYXRlTGlzdCA9IHJhdGVfbGltaXRlZF9mdW5jKCgpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlTGlzdE5vdygpO1xuICAgIH0sIDUwMCk7XG5cbiAgICBfdXBkYXRlTGlzdE5vdygpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJVcGRhdGluZyBtZW1iZXJsaXN0XCIpO1xuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgbWVtYmVyczogdGhpcy5yb29tTWVtYmVycygpLFxuICAgICAgICB9O1xuICAgICAgICBuZXdTdGF0ZS5maWx0ZXJlZEpvaW5lZE1lbWJlcnMgPSB0aGlzLl9maWx0ZXJNZW1iZXJzKG5ld1N0YXRlLm1lbWJlcnMsICdqb2luJywgdGhpcy5zdGF0ZS5zZWFyY2hRdWVyeSk7XG4gICAgICAgIG5ld1N0YXRlLmZpbHRlcmVkSW52aXRlZE1lbWJlcnMgPSB0aGlzLl9maWx0ZXJNZW1iZXJzKG5ld1N0YXRlLm1lbWJlcnMsICdpbnZpdGUnLCB0aGlzLnN0YXRlLnNlYXJjaFF1ZXJ5KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgfVxuXG4gICAgZ2V0TWVtYmVyc1dpdGhVc2VyKCkge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMucm9vbUlkKSByZXR1cm4gW107XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgaWYgKCFyb29tKSByZXR1cm4gW107XG5cbiAgICAgICAgY29uc3QgYWxsTWVtYmVycyA9IE9iamVjdC52YWx1ZXMocm9vbS5jdXJyZW50U3RhdGUubWVtYmVycyk7XG5cbiAgICAgICAgYWxsTWVtYmVycy5mb3JFYWNoKGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgLy8gd29yayBhcm91bmQgYSByYWNlIHdoZXJlIHlvdSBtaWdodCBoYXZlIGEgcm9vbSBtZW1iZXIgb2JqZWN0XG4gICAgICAgICAgICAvLyBiZWZvcmUgdGhlIHVzZXIgb2JqZWN0IGV4aXN0cy4gIFRoaXMgbWF5IG9yIG1heSBub3QgY2F1c2VcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vdmVjdG9yLXdlYi9pc3N1ZXMvMTg2XG4gICAgICAgICAgICBpZiAobWVtYmVyLnVzZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBtZW1iZXIudXNlciA9IGNsaS5nZXRVc2VyKG1lbWJlci51c2VySWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBYWFg6IHRoaXMgdXNlciBtYXkgaGF2ZSBubyBsYXN0UHJlc2VuY2VUcyB2YWx1ZSFcbiAgICAgICAgICAgIC8vIHRoZSByaWdodCBzb2x1dGlvbiBoZXJlIGlzIHRvIGZpeCB0aGUgcmFjZSByYXRoZXIgdGhhbiBsZWF2ZSBpdCBhcyAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBhbGxNZW1iZXJzO1xuICAgIH1cblxuICAgIHJvb21NZW1iZXJzKCkge1xuICAgICAgICBjb25zdCBhbGxNZW1iZXJzID0gdGhpcy5nZXRNZW1iZXJzV2l0aFVzZXIoKTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRBbmRTb3J0ZWRNZW1iZXJzID0gYWxsTWVtYmVycy5maWx0ZXIoKG0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgbS5tZW1iZXJzaGlwID09PSAnam9pbicgfHwgbS5tZW1iZXJzaGlwID09PSAnaW52aXRlJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZpbHRlcmVkQW5kU29ydGVkTWVtYmVycy5zb3J0KHRoaXMubWVtYmVyU29ydCk7XG4gICAgICAgIHJldHVybiBmaWx0ZXJlZEFuZFNvcnRlZE1lbWJlcnM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZU92ZXJmbG93VGlsZUpvaW5lZCA9IChvdmVyZmxvd0NvdW50LCB0b3RhbENvdW50KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVPdmVyZmxvd1RpbGUob3ZlcmZsb3dDb3VudCwgdG90YWxDb3VudCwgdGhpcy5fc2hvd01vcmVKb2luZWRNZW1iZXJMaXN0KTtcbiAgICB9O1xuXG4gICAgX2NyZWF0ZU92ZXJmbG93VGlsZUludml0ZWQgPSAob3ZlcmZsb3dDb3VudCwgdG90YWxDb3VudCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlT3ZlcmZsb3dUaWxlKG92ZXJmbG93Q291bnQsIHRvdGFsQ291bnQsIHRoaXMuX3Nob3dNb3JlSW52aXRlZE1lbWJlckxpc3QpO1xuICAgIH07XG5cbiAgICBfY3JlYXRlT3ZlcmZsb3dUaWxlID0gKG92ZXJmbG93Q291bnQsIHRvdGFsQ291bnQsIG9uQ2xpY2spID0+IHtcbiAgICAgICAgLy8gRm9yIG5vdyB3ZSdsbCBwcmV0ZW5kIHRoaXMgaXMgYW55IGVudGl0eS4gSXQgc2hvdWxkIHByb2JhYmx5IGJlIGEgc2VwYXJhdGUgdGlsZS5cbiAgICAgICAgY29uc3QgRW50aXR5VGlsZSA9IHNkay5nZXRDb21wb25lbnQoXCJyb29tcy5FbnRpdHlUaWxlXCIpO1xuICAgICAgICBjb25zdCBCYXNlQXZhdGFyID0gc2RrLmdldENvbXBvbmVudChcImF2YXRhcnMuQmFzZUF2YXRhclwiKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IF90KFwiYW5kICUoY291bnQpcyBvdGhlcnMuLi5cIiwgeyBjb3VudDogb3ZlcmZsb3dDb3VudCB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxFbnRpdHlUaWxlIGNsYXNzTmFtZT1cIm14X0VudGl0eVRpbGVfZWxsaXBzaXNcIiBhdmF0YXJKc3g9e1xuICAgICAgICAgICAgICAgIDxCYXNlQXZhdGFyIHVybD17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxsaXBzaXMuc3ZnXCIpfSBuYW1lPVwiLi4uXCIgd2lkdGg9ezM2fSBoZWlnaHQ9ezM2fSAvPlxuICAgICAgICAgICAgfSBuYW1lPXt0ZXh0fSBwcmVzZW5jZVN0YXRlPVwib25saW5lXCIgc3VwcHJlc3NPbkhvdmVyPXt0cnVlfVxuICAgICAgICAgICAgb25DbGljaz17b25DbGlja30gLz5cbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgX3Nob3dNb3JlSm9pbmVkTWVtYmVyTGlzdCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0cnVuY2F0ZUF0Sm9pbmVkOiB0aGlzLnN0YXRlLnRydW5jYXRlQXRKb2luZWQgKyBTSE9XX01PUkVfSU5DUkVNRU5ULFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX3Nob3dNb3JlSW52aXRlZE1lbWJlckxpc3QgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdHJ1bmNhdGVBdEludml0ZWQ6IHRoaXMuc3RhdGUudHJ1bmNhdGVBdEludml0ZWQgKyBTSE9XX01PUkVfSU5DUkVNRU5ULFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgbWVtYmVyU3RyaW5nKG1lbWJlcikge1xuICAgICAgICBpZiAoIW1lbWJlcikge1xuICAgICAgICAgICAgcmV0dXJuIFwiKG51bGwpXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB1ID0gbWVtYmVyLnVzZXI7XG4gICAgICAgICAgICByZXR1cm4gXCIoXCIgKyBtZW1iZXIubmFtZSArIFwiLCBcIiArIG1lbWJlci5wb3dlckxldmVsICsgXCIsIFwiICsgKHUgPyB1Lmxhc3RBY3RpdmVBZ28gOiBcIjxudWxsPlwiKSArIFwiLCBcIiArICh1ID8gdS5nZXRMYXN0QWN0aXZlVHMoKSA6IFwiPG51bGw+XCIpICsgXCIsIFwiICsgKHUgPyB1LmN1cnJlbnRseUFjdGl2ZSA6IFwiPG51bGw+XCIpICsgXCIsIFwiICsgKHUgPyB1LnByZXNlbmNlIDogXCI8bnVsbD5cIikgKyBcIilcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHVybnMgbmVnYXRpdmUgaWYgYSBjb21lcyBiZWZvcmUgYixcbiAgICAvLyByZXR1cm5zIDAgaWYgYSBhbmQgYiBhcmUgZXF1aXZhbGVudCBpbiBvcmRlcmluZ1xuICAgIC8vIHJldHVybnMgcG9zaXRpdmUgaWYgYSBjb21lcyBhZnRlciBiLlxuICAgIG1lbWJlclNvcnQgPSAobWVtYmVyQSwgbWVtYmVyQikgPT4ge1xuICAgICAgICAvLyBvcmRlciBieSBwcmVzZW5jZSwgd2l0aCBcImFjdGl2ZSBub3dcIiBmaXJzdC5cbiAgICAgICAgLy8gLi4uYW5kIHRoZW4gYnkgcG93ZXIgbGV2ZWxcbiAgICAgICAgLy8gLi4uYW5kIHRoZW4gYnkgbGFzdCBhY3RpdmVcbiAgICAgICAgLy8gLi4uYW5kIHRoZW4gYWxwaGFiZXRpY2FsbHkuXG4gICAgICAgIC8vIFdlIGNvdWxkIHRpZWJyZWFrIGluc3RlYWQgYnkgXCJsYXN0IHJlY2VudGx5IHNwb2tlbiBpbiB0aGlzIHJvb21cIiBpZiB3ZSB3YW50ZWQgdG8uXG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coYENvbXBhcmluZyB1c2VyQT0ke3RoaXMubWVtYmVyU3RyaW5nKG1lbWJlckEpfSB1c2VyQj0ke3RoaXMubWVtYmVyU3RyaW5nKG1lbWJlckIpfWApO1xuXG4gICAgICAgIGNvbnN0IHVzZXJBID0gbWVtYmVyQS51c2VyO1xuICAgICAgICBjb25zdCB1c2VyQiA9IG1lbWJlckIudXNlcjtcblxuICAgICAgICAvLyBpZiAoIXVzZXJBKSBjb25zb2xlLmxvZyhcIiEhIE1JU1NJTkcgVVNFUiBGT1IgQS1TSURFOiBcIiArIG1lbWJlckEubmFtZSArIFwiICEhXCIpO1xuICAgICAgICAvLyBpZiAoIXVzZXJCKSBjb25zb2xlLmxvZyhcIiEhIE1JU1NJTkcgVVNFUiBGT1IgQi1TSURFOiBcIiArIG1lbWJlckIubmFtZSArIFwiICEhXCIpO1xuXG4gICAgICAgIGlmICghdXNlckEgJiYgIXVzZXJCKSByZXR1cm4gMDtcbiAgICAgICAgaWYgKHVzZXJBICYmICF1c2VyQikgcmV0dXJuIC0xO1xuICAgICAgICBpZiAoIXVzZXJBICYmIHVzZXJCKSByZXR1cm4gMTtcblxuICAgICAgICAvLyBGaXJzdCBieSBwcmVzZW5jZVxuICAgICAgICBpZiAodGhpcy5fc2hvd1ByZXNlbmNlKSB7XG4gICAgICAgICAgICBjb25zdCBjb252ZXJ0UHJlc2VuY2UgPSAocCkgPT4gcCA9PT0gJ3VuYXZhaWxhYmxlJyA/ICdvbmxpbmUnIDogcDtcbiAgICAgICAgICAgIGNvbnN0IHByZXNlbmNlSW5kZXggPSBwID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBvcmRlciA9IFsnYWN0aXZlJywgJ29ubGluZScsICdvZmZsaW5lJ107XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gb3JkZXIuaW5kZXhPZihjb252ZXJ0UHJlc2VuY2UocCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZHggPT09IC0xID8gb3JkZXIubGVuZ3RoIDogaWR4OyAvLyB1bmtub3duIHN0YXRlcyBhdCB0aGUgZW5kXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBpZHhBID0gcHJlc2VuY2VJbmRleCh1c2VyQS5jdXJyZW50bHlBY3RpdmUgPyAnYWN0aXZlJyA6IHVzZXJBLnByZXNlbmNlKTtcbiAgICAgICAgICAgIGNvbnN0IGlkeEIgPSBwcmVzZW5jZUluZGV4KHVzZXJCLmN1cnJlbnRseUFjdGl2ZSA/ICdhY3RpdmUnIDogdXNlckIucHJlc2VuY2UpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYHVzZXJBX3ByZXNlbmNlR3JvdXA9JHtpZHhBfSB1c2VyQl9wcmVzZW5jZUdyb3VwPSR7aWR4Qn1gKTtcbiAgICAgICAgICAgIGlmIChpZHhBICE9PSBpZHhCKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJDb21wYXJpbmcgb24gcHJlc2VuY2UgZ3JvdXAgLSByZXR1cm5pbmdcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkeEEgLSBpZHhCO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2Vjb25kIGJ5IHBvd2VyIGxldmVsXG4gICAgICAgIGlmIChtZW1iZXJBLnBvd2VyTGV2ZWwgIT09IG1lbWJlckIucG93ZXJMZXZlbCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJDb21wYXJpbmcgb24gcG93ZXIgbGV2ZWwgLSByZXR1cm5pbmdcIik7XG4gICAgICAgICAgICByZXR1cm4gbWVtYmVyQi5wb3dlckxldmVsIC0gbWVtYmVyQS5wb3dlckxldmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcmQgYnkgbGFzdCBhY3RpdmVcbiAgICAgICAgaWYgKHRoaXMuX3Nob3dQcmVzZW5jZSAmJiB1c2VyQS5nZXRMYXN0QWN0aXZlVHMoKSAhPT0gdXNlckIuZ2V0TGFzdEFjdGl2ZVRzKCkpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQ29tcGFyaW5nIG9uIGxhc3QgYWN0aXZlIHRpbWVzdGFtcCAtIHJldHVybmluZ1wiKTtcbiAgICAgICAgICAgIHJldHVybiB1c2VyQi5nZXRMYXN0QWN0aXZlVHMoKSAtIHVzZXJBLmdldExhc3RBY3RpdmVUcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm91cnRoIGJ5IG5hbWUgKGFscGhhYmV0aWNhbClcbiAgICAgICAgY29uc3QgbmFtZUEgPSAobWVtYmVyQS5uYW1lWzBdID09PSAnQCcgPyBtZW1iZXJBLm5hbWUuc3Vic3RyKDEpIDogbWVtYmVyQS5uYW1lKS5yZXBsYWNlKFNPUlRfUkVHRVgsIFwiXCIpO1xuICAgICAgICBjb25zdCBuYW1lQiA9IChtZW1iZXJCLm5hbWVbMF0gPT09ICdAJyA/IG1lbWJlckIubmFtZS5zdWJzdHIoMSkgOiBtZW1iZXJCLm5hbWUpLnJlcGxhY2UoU09SVF9SRUdFWCwgXCJcIik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBDb21wYXJpbmcgdXNlckFfbmFtZT0ke25hbWVBfSBhZ2FpbnN0IHVzZXJCX25hbWU9JHtuYW1lQn0gLSByZXR1cm5pbmdgKTtcbiAgICAgICAgcmV0dXJuIG5hbWVBLmxvY2FsZUNvbXBhcmUobmFtZUIsIHtcbiAgICAgICAgICAgIGlnbm9yZVB1bmN0dWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgc2Vuc2l0aXZpdHk6IFwiYmFzZVwiLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25TZWFyY2hRdWVyeUNoYW5nZWQgPSBzZWFyY2hRdWVyeSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoUXVlcnksXG4gICAgICAgICAgICBmaWx0ZXJlZEpvaW5lZE1lbWJlcnM6IHRoaXMuX2ZpbHRlck1lbWJlcnModGhpcy5zdGF0ZS5tZW1iZXJzLCAnam9pbicsIHNlYXJjaFF1ZXJ5KSxcbiAgICAgICAgICAgIGZpbHRlcmVkSW52aXRlZE1lbWJlcnM6IHRoaXMuX2ZpbHRlck1lbWJlcnModGhpcy5zdGF0ZS5tZW1iZXJzLCAnaW52aXRlJywgc2VhcmNoUXVlcnkpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uUGVuZGluZzNwaWRJbnZpdGVDbGljayA9IGludml0ZUV2ZW50ID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfM3BpZF9pbnZpdGUnLFxuICAgICAgICAgICAgZXZlbnQ6IGludml0ZUV2ZW50LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX2ZpbHRlck1lbWJlcnMobWVtYmVycywgbWVtYmVyc2hpcCwgcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIG1lbWJlcnMuZmlsdGVyKChtKSA9PiB7XG4gICAgICAgICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlc05hbWUgPSBtLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5KSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlc0lkID0gbS51c2VySWQudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5KSAhPT0gLTE7XG5cbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZXNOYW1lICYmICFtYXRjaGVzSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG0ubWVtYmVyc2hpcCA9PT0gbWVtYmVyc2hpcDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2dldFBlbmRpbmczUGlkSW52aXRlcygpIHtcbiAgICAgICAgLy8gaW5jbHVkZSAzcGlkIGludml0ZXMgKG0ucm9vbS50aGlyZF9wYXJ0eV9pbnZpdGUpIHN0YXRlIGV2ZW50cy5cbiAgICAgICAgLy8gVGhlIEhTIG1heSBoYXZlIGFscmVhZHkgY29udmVydGVkIHRoZXNlIGludG8gbS5yb29tLm1lbWJlciBpbnZpdGVzIHNvXG4gICAgICAgIC8vIHdlIHNob3VsZG4ndCBhZGQgdGhlbSBpZiB0aGUgM3BpZCBpbnZpdGUgc3RhdGUga2V5ICh0b2tlbikgaXMgaW4gdGhlXG4gICAgICAgIC8vIG1lbWJlciBpbnZpdGUgKGNvbnRlbnQudGhpcmRfcGFydHlfaW52aXRlLnNpZ25lZC50b2tlbilcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcblxuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgcmV0dXJuIHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnRoaXJkX3BhcnR5X2ludml0ZVwiKS5maWx0ZXIoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZDNwaWRJbnZpdGUoZSkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIGRpc2NhcmQgYWxsIGludml0ZXMgd2hpY2ggaGF2ZSBhIG0ucm9vbS5tZW1iZXIgZXZlbnQgc2luY2Ugd2UndmVcbiAgICAgICAgICAgICAgICAvLyBhbHJlYWR5IGFkZGVkIHRoZW0uXG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRJbnZpdGVGb3JUaHJlZVBpZFRva2VuKGUuZ2V0U3RhdGVLZXkoKSk7XG4gICAgICAgICAgICAgICAgaWYgKG1lbWJlckV2ZW50KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9tYWtlTWVtYmVyVGlsZXMobWVtYmVycykge1xuICAgICAgICBjb25zdCBNZW1iZXJUaWxlID0gc2RrLmdldENvbXBvbmVudChcInJvb21zLk1lbWJlclRpbGVcIik7XG4gICAgICAgIGNvbnN0IEVudGl0eVRpbGUgPSBzZGsuZ2V0Q29tcG9uZW50KFwicm9vbXMuRW50aXR5VGlsZVwiKTtcblxuICAgICAgICByZXR1cm4gbWVtYmVycy5tYXAoKG0pID0+IHtcbiAgICAgICAgICAgIGlmIChtLnVzZXJJZCkge1xuICAgICAgICAgICAgICAgIC8vIElzIGEgTWF0cml4IGludml0ZVxuICAgICAgICAgICAgICAgIHJldHVybiA8TWVtYmVyVGlsZSBrZXk9e20udXNlcklkfSBtZW1iZXI9e219IHJlZj17bS51c2VySWR9IHNob3dQcmVzZW5jZT17dGhpcy5fc2hvd1ByZXNlbmNlfSAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSXMgYSAzcGlkIGludml0ZVxuICAgICAgICAgICAgICAgIHJldHVybiA8RW50aXR5VGlsZSBrZXk9e20uZ2V0U3RhdGVLZXkoKX0gbmFtZT17bS5nZXRDb250ZW50KCkuZGlzcGxheV9uYW1lfSBzdXBwcmVzc09uSG92ZXI9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuX29uUGVuZGluZzNwaWRJbnZpdGVDbGljayhtKX0gLz47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9nZXRDaGlsZHJlbkpvaW5lZCA9IChzdGFydCwgZW5kKSA9PiB0aGlzLl9tYWtlTWVtYmVyVGlsZXModGhpcy5zdGF0ZS5maWx0ZXJlZEpvaW5lZE1lbWJlcnMuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuXG4gICAgX2dldENoaWxkQ291bnRKb2luZWQgPSAoKSA9PiB0aGlzLnN0YXRlLmZpbHRlcmVkSm9pbmVkTWVtYmVycy5sZW5ndGg7XG5cbiAgICBfZ2V0Q2hpbGRyZW5JbnZpdGVkID0gKHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgbGV0IHRhcmdldHMgPSB0aGlzLnN0YXRlLmZpbHRlcmVkSW52aXRlZE1lbWJlcnM7XG4gICAgICAgIGlmIChlbmQgPiB0aGlzLnN0YXRlLmZpbHRlcmVkSW52aXRlZE1lbWJlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0YXJnZXRzID0gdGFyZ2V0cy5jb25jYXQodGhpcy5fZ2V0UGVuZGluZzNQaWRJbnZpdGVzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VNZW1iZXJUaWxlcyh0YXJnZXRzLnNsaWNlKHN0YXJ0LCBlbmQpKTtcbiAgICB9O1xuXG4gICAgX2dldENoaWxkQ291bnRJbnZpdGVkID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5maWx0ZXJlZEludml0ZWRNZW1iZXJzLmxlbmd0aCArICh0aGlzLl9nZXRQZW5kaW5nM1BpZEludml0ZXMoKSB8fCBbXSkubGVuZ3RoO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubG9hZGluZykge1xuICAgICAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDxCYXNlQ2FyZFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lbWJlckxpc3RcIlxuICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMucHJvcHMub25DbG9zZX1cbiAgICAgICAgICAgICAgICBwcmV2aW91c1BoYXNlPXtSaWdodFBhbmVsUGhhc2VzLlJvb21TdW1tYXJ5fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICA8L0Jhc2VDYXJkPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFNlYXJjaEJveCA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuU2VhcmNoQm94Jyk7XG4gICAgICAgIGNvbnN0IFRydW5jYXRlZExpc3QgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVHJ1bmNhdGVkTGlzdFwiKTtcblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGxldCBpbnZpdGVCdXR0b247XG5cbiAgICAgICAgaWYgKHJvb20gJiYgcm9vbS5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gJ2pvaW4nKSB7XG4gICAgICAgICAgICBjb25zdCBjYW5JbnZpdGUgPSByb29tLmNhbkludml0ZShjbGkuZ2V0VXNlcklkKCkpO1xuXG4gICAgICAgICAgICBsZXQgaW52aXRlQnV0dG9uVGV4dCA9IF90KFwiSW52aXRlIHRvIHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgIGNvbnN0IGNoYXQgPSBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRTZWxlY3RlZENvbW11bml0eUdlbmVyYWxDaGF0KCk7XG4gICAgICAgICAgICBpZiAoY2hhdCAmJiBjaGF0LnJvb21JZCA9PT0gdGhpcy5wcm9wcy5yb29tSWQpIHtcbiAgICAgICAgICAgICAgICBpbnZpdGVCdXR0b25UZXh0ID0gX3QoXCJJbnZpdGUgdG8gdGhpcyBjb21tdW5pdHlcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJvb20uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgICAgIGludml0ZUJ1dHRvblRleHQgPSBfdChcIkludml0ZSB0byB0aGlzIHNwYWNlXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkFjY2Vzc2libGVCdXR0b25cIik7XG4gICAgICAgICAgICBpbnZpdGVCdXR0b24gPVxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X01lbWJlckxpc3RfaW52aXRlXCIgb25DbGljaz17dGhpcy5vbkludml0ZUJ1dHRvbkNsaWNrfSBkaXNhYmxlZD17IWNhbkludml0ZX0+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPnsgaW52aXRlQnV0dG9uVGV4dCB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW52aXRlZEhlYWRlcjtcbiAgICAgICAgbGV0IGludml0ZWRTZWN0aW9uO1xuICAgICAgICBpZiAodGhpcy5fZ2V0Q2hpbGRDb3VudEludml0ZWQoKSA+IDApIHtcbiAgICAgICAgICAgIGludml0ZWRIZWFkZXIgPSA8aDI+eyBfdChcIkludml0ZWRcIikgfTwvaDI+O1xuICAgICAgICAgICAgaW52aXRlZFNlY3Rpb24gPSA8VHJ1bmNhdGVkTGlzdCBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X3NlY3Rpb24gbXhfTWVtYmVyTGlzdF9pbnZpdGVkXCIgdHJ1bmNhdGVBdD17dGhpcy5zdGF0ZS50cnVuY2F0ZUF0SW52aXRlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU92ZXJmbG93RWxlbWVudD17dGhpcy5fY3JlYXRlT3ZlcmZsb3dUaWxlSW52aXRlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGdldENoaWxkcmVuPXt0aGlzLl9nZXRDaGlsZHJlbkludml0ZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRDaGlsZENvdW50PXt0aGlzLl9nZXRDaGlsZENvdW50SW52aXRlZH1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvb3RlciA9IChcbiAgICAgICAgICAgIDxTZWFyY2hCb3hcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X3F1ZXJ5IG14X3RleHRpbnB1dF9pY29uIG14X3RleHRpbnB1dF9zZWFyY2hcIlxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXsgX3QoJ0ZpbHRlciByb29tIG1lbWJlcnMnKSB9XG4gICAgICAgICAgICAgICAgb25TZWFyY2g9eyB0aGlzLm9uU2VhcmNoUXVlcnlDaGFuZ2VkIH0gLz5cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgcHJldmlvdXNQaGFzZSA9IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbVN1bW1hcnk7XG4gICAgICAgIC8vIFdlIGhhdmUgbm8gcHJldmlvdXNQaGFzZSBmb3Igd2hlbiB2aWV3aW5nIGEgTWVtYmVyTGlzdCBmcm9tIGEgU3BhY2VcbiAgICAgICAgbGV0IHNjb3BlSGVhZGVyO1xuICAgICAgICBpZiAocm9vbT8uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgcHJldmlvdXNQaGFzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHNjb3BlSGVhZGVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9SaWdodFBhbmVsX3Njb3BlSGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPFJvb21BdmF0YXIgcm9vbT17cm9vbX0gaGVpZ2h0PXszMn0gd2lkdGg9ezMyfSAvPlxuICAgICAgICAgICAgICAgIDxSb29tTmFtZSByb29tPXtyb29tfSAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxCYXNlQ2FyZFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVtYmVyTGlzdFwiXG4gICAgICAgICAgICBoZWFkZXI9ezxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICB7IHNjb3BlSGVhZGVyIH1cbiAgICAgICAgICAgICAgICB7IGludml0ZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50Pn1cbiAgICAgICAgICAgIGZvb3Rlcj17Zm9vdGVyfVxuICAgICAgICAgICAgb25DbG9zZT17dGhpcy5wcm9wcy5vbkNsb3NlfVxuICAgICAgICAgICAgcHJldmlvdXNQaGFzZT17cHJldmlvdXNQaGFzZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X3dyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICA8VHJ1bmNhdGVkTGlzdCBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X3NlY3Rpb24gbXhfTWVtYmVyTGlzdF9qb2luZWRcIiB0cnVuY2F0ZUF0PXt0aGlzLnN0YXRlLnRydW5jYXRlQXRKb2luZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlT3ZlcmZsb3dFbGVtZW50PXt0aGlzLl9jcmVhdGVPdmVyZmxvd1RpbGVKb2luZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Q2hpbGRyZW49e3RoaXMuX2dldENoaWxkcmVuSm9pbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldENoaWxkQ291bnQ9e3RoaXMuX2dldENoaWxkQ291bnRKb2luZWR9IC8+XG4gICAgICAgICAgICAgICAgeyBpbnZpdGVkSGVhZGVyIH1cbiAgICAgICAgICAgICAgICB7IGludml0ZWRTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0Jhc2VDYXJkPjtcbiAgICB9XG5cbiAgICBvbkludml0ZUJ1dHRvbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbid9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbGwgQWRkcmVzc1BpY2tlckRpYWxvZ1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19pbnZpdGUnLFxuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnByb3BzLnJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cbiJdfQ==
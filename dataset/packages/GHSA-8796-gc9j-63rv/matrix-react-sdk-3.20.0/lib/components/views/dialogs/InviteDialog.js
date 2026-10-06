"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.KIND_CALL_TRANSFER = exports.KIND_INVITE = exports.KIND_DM = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var Email = _interopRequireWildcard(require("../../../email"));

var _IdentityServerUtils = require("../../../utils/IdentityServerUtils");

var _UrlUtils = require("../../../utils/UrlUtils");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _IdentityAuthClient = _interopRequireDefault(require("../../../IdentityAuthClient"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _humanize = require("../../../utils/humanize");

var _createRoom = _interopRequireWildcard(require("../../../createRoom"));

var _RoomInvite = require("../../../RoomInvite");

var _Keyboard = require("../../../Keyboard");

var _actions = require("../../../dispatcher/actions");

var _models = require("../../../stores/room-list/models");

var _RoomListStore = _interopRequireDefault(require("../../../stores/room-list/RoomListStore"));

var _CommunityPrototypeStore = require("../../../stores/CommunityPrototypeStore");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _UserAddress = require("../../../UserAddress");

var _dec, _class, _class2, _temp;

// we have a number of types defined from the Matrix spec which can't reasonably be altered here.

/* eslint-disable camelcase */
const KIND_DM = "dm";
exports.KIND_DM = KIND_DM;
const KIND_INVITE = "invite";
exports.KIND_INVITE = KIND_INVITE;
const KIND_CALL_TRANSFER = "call_transfer";
exports.KIND_CALL_TRANSFER = KIND_CALL_TRANSFER;
const INITIAL_ROOMS_SHOWN = 3; // Number of rooms to show at first

const INCREMENT_ROOMS_SHOWN = 5; // Number of rooms to add when 'show more' is clicked
// This is the interface that is expected by various components in this file. It is a bit
// awkward because it also matches the RoomMember class from the js-sdk with some extra support
// for 3PIDs/email addresses.
//
// XXX: We should use TypeScript interfaces instead of this weird "abstract" class.

class Member {
  /**
   * The display name of this Member. For users this should be their profile's display
   * name or user ID if none set. For 3PIDs this should be the 3PID address (email).
   */
  get name()
  /*: string*/
  {
    throw new Error("Member class not implemented");
  }
  /**
   * The ID of this Member. For users this should be their user ID. For 3PIDs this should
   * be the 3PID address (email).
   */


  get userId()
  /*: string*/
  {
    throw new Error("Member class not implemented");
  }
  /**
   * Gets the MXC URL of this Member's avatar. For users this should be their profile's
   * avatar MXC URL or null if none set. For 3PIDs this should always be null.
   */


  getMxcAvatarUrl()
  /*: string*/
  {
    throw new Error("Member class not implemented");
  }

}

class DirectoryMember extends Member {
  constructor(userDirResult
  /*: {user_id: string, display_name: string, avatar_url: string}*/
  ) {
    super();
    (0, _defineProperty2.default)(this, "_userId", void 0);
    (0, _defineProperty2.default)(this, "_displayName", void 0);
    (0, _defineProperty2.default)(this, "_avatarUrl", void 0);
    this._userId = userDirResult.user_id;
    this._displayName = userDirResult.display_name;
    this._avatarUrl = userDirResult.avatar_url;
  } // These next class members are for the Member interface


  get name()
  /*: string*/
  {
    return this._displayName || this._userId;
  }

  get userId()
  /*: string*/
  {
    return this._userId;
  }

  getMxcAvatarUrl()
  /*: string*/
  {
    return this._avatarUrl;
  }

}

class ThreepidMember extends Member {
  constructor(id
  /*: string*/
  ) {
    super();
    (0, _defineProperty2.default)(this, "_id", void 0);
    this._id = id;
  } // This is a getter that would be falsey on all other implementations. Until we have
  // better type support in the react-sdk we can use this trick to determine the kind
  // of 3PID we're dealing with, if any.


  get isEmail()
  /*: boolean*/
  {
    return this._id.includes('@');
  } // These next class members are for the Member interface


  get name()
  /*: string*/
  {
    return this._id;
  }

  get userId()
  /*: string*/
  {
    return this._id;
  }

  getMxcAvatarUrl()
  /*: string*/
  {
    return null;
  }

}

class DMUserTile extends _react.default.PureComponent
/*:: <IDMUserTileProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onRemove", e => {
      // Stop the browser from highlighting text
      e.preventDefault();
      e.stopPropagation();
      this.props.onRemove(this.props.member);
    });
  }

  render() {
    const BaseAvatar = sdk.getComponent("views.avatars.BaseAvatar");
    const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
    const avatarSize = 20;
    const avatar = this.props.member.isEmail ? /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_InviteDialog_userTile_avatar mx_InviteDialog_userTile_threepidAvatar",
      src: require("../../../../res/img/icon-email-pill-avatar.svg"),
      width: avatarSize,
      height: avatarSize
    }) : /*#__PURE__*/_react.default.createElement(BaseAvatar, {
      className: "mx_InviteDialog_userTile_avatar",
      url: this.props.member.getMxcAvatarUrl() ? (0, _Media.mediaFromMxc)(this.props.member.getMxcAvatarUrl()).getSquareThumbnailHttp(avatarSize) : null,
      name: this.props.member.name,
      idName: this.props.member.userId,
      width: avatarSize,
      height: avatarSize
    });
    let closeButton;

    if (this.props.onRemove) {
      closeButton = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: "mx_InviteDialog_userTile_remove",
        onClick: this._onRemove
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../../res/img/icon-pill-remove.svg"),
        alt: (0, _languageHandler._t)('Remove'),
        width: 8,
        height: 8
      }));
    }

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_userTile"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_userTile_pill"
    }, avatar, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_userTile_name"
    }, this.props.member.name)), closeButton);
  }

}

class DMRoomTile extends _react.default.PureComponent
/*:: <IDMRoomTileProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onClick", e => {
      // Stop the browser from highlighting text
      e.preventDefault();
      e.stopPropagation();
      this.props.onToggle(this.props.member);
    });
  }

  _highlightName(str
  /*: string*/
  ) {
    if (!this.props.highlightWord) return str; // We convert things to lowercase for index searching, but pull substrings from
    // the submitted text to preserve case. Note: we don't need to htmlEntities the
    // string because React will safely encode the text for us.

    const lowerStr = str.toLowerCase();
    const filterStr = this.props.highlightWord.toLowerCase();
    const result = [];
    let i = 0;
    let ii;

    while ((ii = lowerStr.indexOf(filterStr, i)) >= 0) {
      // Push any text we missed (first bit/middle of text)
      if (ii > i) {
        // Push any text we aren't highlighting (middle of text match, or beginning of text)
        result.push( /*#__PURE__*/_react.default.createElement("span", {
          key: i + 'begin'
        }, str.substring(i, ii)));
      }

      i = ii; // copy over ii only if we have a match (to preserve i for end-of-text matching)
      // Highlight the word the user entered

      const substr = str.substring(i, filterStr.length + i);
      result.push( /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_InviteDialog_roomTile_highlight",
        key: i + 'bold'
      }, substr));
      i += substr.length;
    } // Push any text we missed (end of text)


    if (i < str.length) {
      result.push( /*#__PURE__*/_react.default.createElement("span", {
        key: i + 'end'
      }, str.substring(i)));
    }

    return result;
  }

  render() {
    const BaseAvatar = sdk.getComponent("views.avatars.BaseAvatar");
    let timestamp = null;

    if (this.props.lastActiveTs) {
      const humanTs = (0, _humanize.humanizeTime)(this.props.lastActiveTs);
      timestamp = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_InviteDialog_roomTile_time"
      }, humanTs);
    }

    const avatarSize = 36;
    const avatar = this.props.member.isEmail ? /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../../res/img/icon-email-pill-avatar.svg"),
      width: avatarSize,
      height: avatarSize
    }) : /*#__PURE__*/_react.default.createElement(BaseAvatar, {
      url: this.props.member.getMxcAvatarUrl() ? (0, _Media.mediaFromMxc)(this.props.member.getMxcAvatarUrl()).getSquareThumbnailHttp(avatarSize) : null,
      name: this.props.member.name,
      idName: this.props.member.userId,
      width: avatarSize,
      height: avatarSize
    });
    let checkmark = null;

    if (this.props.isSelected) {
      // To reduce flickering we put the 'selected' room tile above the real avatar
      checkmark = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InviteDialog_roomTile_selected"
      });
    } // To reduce flickering we put the checkmark on top of the actual avatar (prevents
    // the browser from reloading the image source when the avatar remounts).


    const stackedAvatar = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_roomTile_avatarStack"
    }, avatar, checkmark);

    const caption = this.props.member.isEmail ? (0, _languageHandler._t)("Invite by email") : this._highlightName(this.props.member.userId);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_roomTile",
      onClick: this._onClick
    }, stackedAvatar, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_roomTile_nameStack"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_roomTile_name"
    }, this._highlightName(this.props.member.name)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_roomTile_userId"
    }, caption)), timestamp);
  }

}

let InviteDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.InviteDialog"), _dec(_class = (_temp = _class2 = class InviteDialog extends _react.default.PureComponent
/*:: <IInviteDialogProps, IInviteDialogState>*/
{
  // actually number because we're in the browser
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_debounceTimer", null);
    (0, _defineProperty2.default)(this, "_editorRef", null);
    (0, _defineProperty2.default)(this, "onConsultFirstChange", ev => {
      this.setState({
        consultFirst: ev.target.checked
      });
    });
    (0, _defineProperty2.default)(this, "_startDm", async () => {
      this.setState({
        busy: true
      });

      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const targets = this._convertFilter();

      const targetIds = targets.map(t => t.userId); // Check if there is already a DM with these people and reuse it if possible.

      let existingRoom
      /*: Room*/
      ;

      if (targetIds.length === 1) {
        existingRoom = (0, _createRoom.findDMForUser)(client, targetIds[0]);
      } else {
        existingRoom = _DMRoomMap.default.shared().getDMRoomForIdentifiers(targetIds);
      }

      if (existingRoom) {
        _dispatcher.default.dispatch({
          action: 'view_room',
          room_id: existingRoom.roomId,
          should_peek: false,
          joining: false
        });

        this.props.onFinished();
        return;
      }

      const createRoomOptions = {
        inlineErrors: true
      }; // XXX: Type out `createRoomOptions`

      if ((0, _createRoom.privateShouldBeEncrypted)()) {
        // Check whether all users have uploaded device keys before.
        // If so, enable encryption in the new room.
        const has3PidMembers = targets.some(t => t instanceof ThreepidMember);

        if (!has3PidMembers) {
          const allHaveDeviceKeys = await (0, _createRoom.canEncryptToAllUsers)(client, targetIds);

          if (allHaveDeviceKeys) {
            createRoomOptions.encryption = true;
          }
        }
      } // Check if it's a traditional DM and create the room if required.
      // TODO: [Canonical DMs] Remove this check and instead just create the multi-person DM


      try {
        const isSelf = targetIds.length === 1 && targetIds[0] === client.getUserId();

        if (targetIds.length === 1 && !isSelf) {
          createRoomOptions.dmUserId = targetIds[0];
        }

        if (targetIds.length > 1) {
          createRoomOptions.createOpts = targetIds.reduce((roomOptions, address) => {
            const type = (0, _UserAddress.getAddressType)(address);

            if (type === 'email') {
              const invite
              /*: IInvite3PID*/
              = {
                id_server: client.getIdentityServerUrl(true),
                medium: 'email',
                address
              };
              roomOptions.invite_3pid.push(invite);
            } else if (type === 'mx-user-id') {
              roomOptions.invite.push(address);
            }

            return roomOptions;
          }, {
            invite: [],
            invite_3pid: []
          });
        }

        await (0, _createRoom.default)(createRoomOptions);
        this.props.onFinished();
      } catch (err) {
        console.error(err);
        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("We couldn't create your DM.")
        });
      }
    });
    (0, _defineProperty2.default)(this, "_inviteUsers", async () => {
      const startTime = _CountlyAnalytics.default.getTimestamp();

      this.setState({
        busy: true
      });

      this._convertFilter();

      const targets = this._convertFilter();

      const targetIds = targets.map(t => t.userId);

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(this.props.roomId);

      if (!room) {
        console.error("Failed to find the room to invite users to");
        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("Something went wrong trying to invite the users.")
        });
        return;
      }

      try {
        const result = await (0, _RoomInvite.inviteMultipleToRoom)(this.props.roomId, targetIds);

        _CountlyAnalytics.default.instance.trackSendInvite(startTime, this.props.roomId, targetIds.length);

        if (!this._shouldAbortAfterInviteError(result)) {
          // handles setting error message too
          this.props.onFinished();
        }

        if (cli.isRoomEncrypted(this.props.roomId)) {
          const visibilityEvent = room.currentState.getStateEvents("m.room.history_visibility", "");
          const visibility = visibilityEvent && visibilityEvent.getContent() && visibilityEvent.getContent().history_visibility;

          if (visibility == "world_readable" || visibility == "shared") {
            const invitedUsers = [];

            for (const [addr, state] of Object.entries(result.states)) {
              if (state === "invited" && (0, _UserAddress.getAddressType)(addr) === "mx-user-id") {
                invitedUsers.push(addr);
              }
            }

            console.log("Sharing history with", invitedUsers);
            cli.sendSharedHistoryKeys(this.props.roomId, invitedUsers);
          }
        }
      } catch (err) {
        console.error(err);
        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("We couldn't invite those users. Please check the users you want to invite and try again.")
        });
      }
    });
    (0, _defineProperty2.default)(this, "_transferCall", async () => {
      this._convertFilter();

      const targets = this._convertFilter();

      const targetIds = targets.map(t => t.userId);

      if (targetIds.length > 1) {
        this.setState({
          errorText: (0, _languageHandler._t)("A call can only be transferred to a single user.")
        });
      }

      if (this.state.consultFirst) {
        const dmRoomId = await (0, _createRoom.ensureDMExists)(_MatrixClientPeg.MatrixClientPeg.get(), targetIds[0]);

        _dispatcher.default.dispatch({
          action: 'place_call',
          type: this.props.call.type,
          room_id: dmRoomId,
          transferee: this.props.call
        });

        _dispatcher.default.dispatch({
          action: 'view_room',
          room_id: dmRoomId,
          should_peek: false,
          joining: false
        });

        this.props.onFinished();
      } else {
        this.setState({
          busy: true
        });

        try {
          await this.props.call.transfer(targetIds[0]);
          this.setState({
            busy: false
          });
          this.props.onFinished();
        } catch (e) {
          this.setState({
            busy: false,
            errorText: (0, _languageHandler._t)("Failed to transfer call")
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "_onKeyDown", e => {
      if (this.state.busy) return;
      const value = e.target.value.trim();
      const hasModifiers = e.ctrlKey || e.shiftKey || e.metaKey;

      if (!value && this.state.targets.length > 0 && e.key === _Keyboard.Key.BACKSPACE && !hasModifiers) {
        // when the field is empty and the user hits backspace remove the right-most target
        e.preventDefault();

        this._removeMember(this.state.targets[this.state.targets.length - 1]);
      } else if (value && e.key === _Keyboard.Key.ENTER && !hasModifiers) {
        // when the user hits enter with something in their field try to convert it
        e.preventDefault();

        this._convertFilter();
      } else if (value && e.key === _Keyboard.Key.SPACE && !hasModifiers && value.includes("@") && !value.includes(" ")) {
        // when the user hits space and their input looks like an e-mail/MXID then try to convert it
        e.preventDefault();

        this._convertFilter();
      }
    });
    (0, _defineProperty2.default)(this, "_updateSuggestions", async term => {
      _MatrixClientPeg.MatrixClientPeg.get().searchUserDirectory({
        term
      }).then(async r => {
        if (term !== this.state.filterText) {
          // Discard the results - we were probably too slow on the server-side to make
          // these results useful. This is a race we want to avoid because we could overwrite
          // more accurate results.
          return;
        }

        if (!r.results) r.results = []; // While we're here, try and autocomplete a search result for the mxid itself
        // if there's no matches (and the input looks like a mxid).

        if (term[0] === '@' && term.indexOf(':') > 1) {
          try {
            const profile = await _MatrixClientPeg.MatrixClientPeg.get().getProfileInfo(term);

            if (profile) {
              // If we have a profile, we have enough information to assume that
              // the mxid can be invited - add it to the list. We stick it at the
              // top so it is most obviously presented to the user.
              r.results.splice(0, 0, {
                user_id: term,
                display_name: profile['displayname'],
                avatar_url: profile['avatar_url']
              });
            }
          } catch (e) {
            console.warn("Non-fatal error trying to make an invite for a user ID");
            console.warn(e); // Add a result anyways, just without a profile. We stick it at the
            // top so it is most obviously presented to the user.

            r.results.splice(0, 0, {
              user_id: term,
              display_name: term,
              avatar_url: null
            });
          }
        }

        this.setState({
          serverResultsMixin: r.results.map(u => ({
            userId: u.user_id,
            user: new DirectoryMember(u)
          }))
        });
      }).catch(e => {
        console.error("Error searching user directory:");
        console.error(e);
        this.setState({
          serverResultsMixin: []
        }); // clear results because it's moderately fatal
      }); // Whenever we search the directory, also try to search the identity server. It's
      // all debounced the same anyways.


      if (!this.state.canUseIdentityServer) {
        // The user doesn't have an identity server set - warn them of that.
        this.setState({
          tryingIdentityServer: true
        });
        return;
      }

      if (term.indexOf('@') > 0 && Email.looksValid(term) && _SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer)) {
        // Start off by suggesting the plain email while we try and resolve it
        // to a real account.
        this.setState({
          // per above: the userId is a lie here - it's just a regular identifier
          threepidResultsMixin: [{
            user: new ThreepidMember(term),
            userId: term
          }]
        });

        try {
          const authClient = new _IdentityAuthClient.default();
          const token = await authClient.getAccessToken();
          if (term !== this.state.filterText) return; // abandon hope

          const lookup = await _MatrixClientPeg.MatrixClientPeg.get().lookupThreePid('email', term, undefined, // callback
          token);
          if (term !== this.state.filterText) return; // abandon hope

          if (!lookup || !lookup.mxid) {
            // We weren't able to find anyone - we're already suggesting the plain email
            // as an alternative, so do nothing.
            return;
          } // We append the user suggestion to give the user an option to click
          // the email anyways, and so we don't cause things to jump around. In
          // theory, the user would see the user pop up and think "ah yes, that
          // person!"


          const profile = await _MatrixClientPeg.MatrixClientPeg.get().getProfileInfo(lookup.mxid);
          if (term !== this.state.filterText || !profile) return; // abandon hope

          this.setState({
            threepidResultsMixin: [...this.state.threepidResultsMixin, {
              user: new DirectoryMember({
                user_id: lookup.mxid,
                display_name: profile.displayname,
                avatar_url: profile.avatar_url
              }),
              userId: lookup.mxid
            }]
          });
        } catch (e) {
          console.error("Error searching identity server:");
          console.error(e);
          this.setState({
            threepidResultsMixin: []
          }); // clear results because it's moderately fatal
        }
      }
    });
    (0, _defineProperty2.default)(this, "_updateFilter", e => {
      const term = e.target.value;
      this.setState({
        filterText: term
      }); // Debounce server lookups to reduce spam. We don't clear the existing server
      // results because they might still be vaguely accurate, likewise for races which
      // could happen here.

      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
      }

      this._debounceTimer = setTimeout(() => {
        this._updateSuggestions(term);
      }, 150); // 150ms debounce (human reaction time + some)
    });
    (0, _defineProperty2.default)(this, "_showMoreRecents", () => {
      this.setState({
        numRecentsShown: this.state.numRecentsShown + INCREMENT_ROOMS_SHOWN
      });
    });
    (0, _defineProperty2.default)(this, "_showMoreSuggestions", () => {
      this.setState({
        numSuggestionsShown: this.state.numSuggestionsShown + INCREMENT_ROOMS_SHOWN
      });
    });
    (0, _defineProperty2.default)(this, "_toggleMember", (member
    /*: Member*/
    ) => {
      if (!this.state.busy) {
        let filterText = this.state.filterText;
        const targets = this.state.targets.map(t => t); // cheap clone for mutation

        const idx = targets.indexOf(member);

        if (idx >= 0) {
          targets.splice(idx, 1);
        } else {
          targets.push(member);
          filterText = ""; // clear the filter when the user accepts a suggestion
        }

        this.setState({
          targets,
          filterText
        });

        if (this._editorRef && this._editorRef.current) {
          this._editorRef.current.focus();
        }
      }
    });
    (0, _defineProperty2.default)(this, "_removeMember", (member
    /*: Member*/
    ) => {
      const targets = this.state.targets.map(t => t); // cheap clone for mutation

      const idx = targets.indexOf(member);

      if (idx >= 0) {
        targets.splice(idx, 1);
        this.setState({
          targets
        });
      }

      if (this._editorRef && this._editorRef.current) {
        this._editorRef.current.focus();
      }
    });
    (0, _defineProperty2.default)(this, "_onPaste", async e => {
      if (this.state.filterText) {
        // if the user has already typed something, just let them
        // paste normally.
        return;
      } // Prevent the text being pasted into the input


      e.preventDefault(); // Process it as a list of addresses to add instead

      const text = e.clipboardData.getData("text");
      const possibleMembers = [// If we can avoid hitting the profile endpoint, we should.
      ...this.state.recents, ...this.state.suggestions, ...this.state.serverResultsMixin, ...this.state.threepidResultsMixin];
      const toAdd = [];
      const failed = [];
      const potentialAddresses = text.split(/[\s,]+/).map(p => p.trim()).filter(p => !!p); // filter empty strings

      for (const address of potentialAddresses) {
        const member = possibleMembers.find(m => m.userId === address);

        if (member) {
          toAdd.push(member.user);
          continue;
        }

        if (address.indexOf('@') > 0 && Email.looksValid(address)) {
          toAdd.push(new ThreepidMember(address));
          continue;
        }

        if (address[0] !== '@') {
          failed.push(address); // not a user ID

          continue;
        }

        try {
          const profile = await _MatrixClientPeg.MatrixClientPeg.get().getProfileInfo(address);
          const displayName = profile ? profile.displayname : null;
          const avatarUrl = profile ? profile.avatar_url : null;
          toAdd.push(new DirectoryMember({
            user_id: address,
            display_name: displayName,
            avatar_url: avatarUrl
          }));
        } catch (e) {
          console.error("Error looking up profile for " + address);
          console.error(e);
          failed.push(address);
        }
      }

      if (failed.length > 0) {
        const QuestionDialog = sdk.getComponent('dialogs.QuestionDialog');

        _Modal.default.createTrackedDialog('Invite Paste Fail', '', QuestionDialog, {
          title: (0, _languageHandler._t)('Failed to find the following users'),
          description: (0, _languageHandler._t)("The following users might not exist or are invalid, and cannot be invited: %(csvNames)s", {
            csvNames: failed.join(", ")
          }),
          button: (0, _languageHandler._t)('OK')
        });
      }

      this.setState({
        targets: [...this.state.targets, ...toAdd]
      });
    });
    (0, _defineProperty2.default)(this, "_onClickInputArea", e => {
      // Stop the browser from highlighting text
      e.preventDefault();
      e.stopPropagation();

      if (this._editorRef && this._editorRef.current) {
        this._editorRef.current.focus();
      }
    });
    (0, _defineProperty2.default)(this, "_onUseDefaultIdentityServerClick", e => {
      e.preventDefault(); // Update the IS in account data. Actually using it may trigger terms.
      // eslint-disable-next-line react-hooks/rules-of-hooks

      (0, _IdentityServerUtils.useDefaultIdentityServer)();
      this.setState({
        canUseIdentityServer: true,
        tryingIdentityServer: false
      });
    });
    (0, _defineProperty2.default)(this, "_onManageSettingsClick", e => {
      e.preventDefault();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);

      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "_onCommunityInviteClick", e => {
      this.props.onFinished();
      (0, _RoomInvite.showCommunityInviteDialog)(_CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId());
    });

    if (props.kind === KIND_INVITE && !props.roomId) {
      throw new Error("When using KIND_INVITE a roomId is required for an InviteDialog");
    } else if (props.kind === KIND_CALL_TRANSFER && !props.call) {
      throw new Error("When using KIND_CALL_TRANSFER a call is required for an InviteDialog");
    }

    const alreadyInvited = new Set([_MatrixClientPeg.MatrixClientPeg.get().getUserId(), _SdkConfig.default.get()['welcomeUserId']]);

    if (props.roomId) {
      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(props.roomId);

      if (!room) throw new Error("Room ID given to InviteDialog does not look like a room");
      room.getMembersWithMembership('invite').forEach(m => alreadyInvited.add(m.userId));
      room.getMembersWithMembership('join').forEach(m => alreadyInvited.add(m.userId)); // add banned users, so we don't try to invite them

      room.getMembersWithMembership('ban').forEach(m => alreadyInvited.add(m.userId));

      _CountlyAnalytics.default.instance.trackBeginInvite(props.roomId);
    }

    this.state = {
      targets: [],
      // array of Member objects (see interface above)
      filterText: this.props.initialText,
      recents: InviteDialog.buildRecents(alreadyInvited),
      numRecentsShown: INITIAL_ROOMS_SHOWN,
      suggestions: this._buildSuggestions(alreadyInvited),
      numSuggestionsShown: INITIAL_ROOMS_SHOWN,
      serverResultsMixin: [],
      threepidResultsMixin: [],
      canUseIdentityServer: !!_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl(),
      tryingIdentityServer: false,
      consultFirst: false,
      // These two flags are used for the 'Go' button to communicate what is going on.
      busy: false,
      errorText: null
    };
    this._editorRef = /*#__PURE__*/(0, _react.createRef)();
  }

  componentDidMount() {
    if (this.props.initialText) {
      this._updateSuggestions(this.props.initialText);
    }
  }

  static buildRecents(excludedTargetIds
  /*: Set<string>*/
  )
  /*: {userId: string, user: RoomMember, lastActive: number}[]*/
  {
    const rooms = _DMRoomMap.default.shared().getUniqueRoomsWithIndividuals(); // map of userId => js-sdk Room
    // Also pull in all the rooms tagged as DefaultTagID.DM so we don't miss anything. Sometimes the
    // room list doesn't tag the room for the DMRoomMap, but does for the room list.


    const dmTaggedRooms = _RoomListStore.default.instance.orderedLists[_models.DefaultTagID.DM] || [];

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    for (const dmRoom of dmTaggedRooms) {
      const otherMembers = dmRoom.getJoinedMembers().filter(u => u.userId !== myUserId);

      for (const member of otherMembers) {
        if (rooms[member.userId]) continue; // already have a room

        console.warn(`Adding DM room for ${member.userId} as ${dmRoom.roomId} from tag, not DM map`);
        rooms[member.userId] = dmRoom;
      }
    }

    const recents = [];

    for (const userId in rooms) {
      // Filter out user IDs that are already in the room / should be excluded
      if (excludedTargetIds.has(userId)) {
        console.warn(`[Invite:Recents] Excluding ${userId} from recents`);
        continue;
      }

      const room = rooms[userId];
      const member = room.getMember(userId);

      if (!member) {
        // just skip people who don't have memberships for some reason
        console.warn(`[Invite:Recents] ${userId} is missing a member object in their own DM (${room.roomId})`);
        continue;
      } // Find the last timestamp for a message event


      const searchTypes = ["m.room.message", "m.room.encrypted", "m.sticker"];
      const maxSearchEvents = 20; // to prevent traversing history

      let lastEventTs = 0;

      if (room.timeline && room.timeline.length) {
        for (let i = room.timeline.length - 1; i >= 0; i--) {
          const ev = room.timeline[i];

          if (searchTypes.includes(ev.getType())) {
            lastEventTs = ev.getTs();
            break;
          }

          if (room.timeline.length - i > maxSearchEvents) break;
        }
      }

      if (!lastEventTs) {
        // something weird is going on with this room
        console.warn(`[Invite:Recents] ${userId} (${room.roomId}) has a weird last timestamp: ${lastEventTs}`);
        continue;
      }

      recents.push({
        userId,
        user: member,
        lastActive: lastEventTs
      });
    }

    if (!recents) console.warn("[Invite:Recents] No recents to suggest!"); // Sort the recents by last active to save us time later

    recents.sort((a, b) => b.lastActive - a.lastActive);
    return recents;
  }

  _buildSuggestions(excludedTargetIds
  /*: Set<string>*/
  )
  /*: {userId: string, user: RoomMember}[]*/
  {
    const maxConsideredMembers = 200;

    const joinedRooms = _MatrixClientPeg.MatrixClientPeg.get().getRooms().filter(r => r.getMyMembership() === 'join' && r.getJoinedMemberCount() <= maxConsideredMembers); // Generates { userId: {member, rooms[]} }


    const memberRooms = joinedRooms.reduce((members, room) => {
      // Filter out DMs (we'll handle these in the recents section)
      if (_DMRoomMap.default.shared().getUserIdForRoomId(room.roomId)) {
        return members; // Do nothing
      }

      const joinedMembers = room.getJoinedMembers().filter(u => !excludedTargetIds.has(u.userId));

      for (const member of joinedMembers) {
        // Filter out user IDs that are already in the room / should be excluded
        if (excludedTargetIds.has(member.userId)) {
          continue;
        }

        if (!members[member.userId]) {
          members[member.userId] = {
            member: member,
            // Track the room size of the 'picked' member so we can use the profile of
            // the smallest room (likely a DM).
            pickedMemberRoomSize: room.getJoinedMemberCount(),
            rooms: []
          };
        }

        members[member.userId].rooms.push(room);

        if (room.getJoinedMemberCount() < members[member.userId].pickedMemberRoomSize) {
          members[member.userId].member = member;
          members[member.userId].pickedMemberRoomSize = room.getJoinedMemberCount();
        }
      }

      return members;
    }, {}); // Generates { userId: {member, numRooms, score} }

    const memberScores = Object.values(memberRooms).reduce((scores, entry
    /*: {member: RoomMember, rooms: Room[]}*/
    ) => {
      const numMembersTotal = entry.rooms.reduce((c, r) => c + r.getJoinedMemberCount(), 0);
      const maxRange = maxConsideredMembers * entry.rooms.length;
      scores[entry.member.userId] = {
        member: entry.member,
        numRooms: entry.rooms.length,
        score: Math.max(0, Math.pow(1 - numMembersTotal / maxRange, 5))
      };
      return scores;
    }, {}); // Now that we have scores for being in rooms, boost those people who have sent messages
    // recently, as a way to improve the quality of suggestions. We do this by checking every
    // room to see who has sent a message in the last few hours, and giving them a score
    // which correlates to the freshness of their message. In theory, this results in suggestions
    // which are closer to "continue this conversation" rather than "this person exists".

    const trueJoinedRooms = _MatrixClientPeg.MatrixClientPeg.get().getRooms().filter(r => r.getMyMembership() === 'join');

    const now = new Date().getTime();
    const earliestAgeConsidered = now - 60 * 60 * 1000; // 1 hour ago

    const maxMessagesConsidered = 50; // so we don't iterate over a huge amount of traffic

    const lastSpoke = {}; // userId: timestamp

    const lastSpokeMembers = {}; // userId: room member

    for (const room of trueJoinedRooms) {
      // Skip low priority rooms and DMs
      const isDm = _DMRoomMap.default.shared().getUserIdForRoomId(room.roomId);

      if (Object.keys(room.tags).includes("m.lowpriority") || isDm) {
        continue;
      }

      const events = room.getLiveTimeline().getEvents(); // timelines are most recent last

      for (let i = events.length - 1; i >= Math.max(0, events.length - maxMessagesConsidered); i--) {
        const ev = events[i];

        if (excludedTargetIds.has(ev.getSender())) {
          continue;
        }

        if (ev.getTs() <= earliestAgeConsidered) {
          break; // give up: all events from here on out are too old
        }

        if (!lastSpoke[ev.getSender()] || lastSpoke[ev.getSender()] < ev.getTs()) {
          lastSpoke[ev.getSender()] = ev.getTs();
          lastSpokeMembers[ev.getSender()] = room.getMember(ev.getSender());
        }
      }
    }

    for (const userId in lastSpoke) {
      const ts = lastSpoke[userId];
      const member = lastSpokeMembers[userId];
      if (!member) continue; // skip people we somehow don't have profiles for
      // Scores from being in a room give a 'good' score of about 1.0-1.5, so for our
      // boost we'll try and award at least +1.0 for making the list, with +4.0 being
      // an approximate maximum for being selected.

      const distanceFromNow = Math.abs(now - ts); // abs to account for slight future messages

      const inverseTime = now - earliestAgeConsidered - distanceFromNow;
      const scoreBoost = Math.max(1, inverseTime / (15 * 60 * 1000)); // 15min segments to keep scores sane

      let record = memberScores[userId];
      if (!record) record = memberScores[userId] = {
        score: 0
      };
      record.member = member;
      record.score += scoreBoost;
    }

    const members = Object.values(memberScores);
    members.sort((a, b) => {
      if (a.score === b.score) {
        if (a.numRooms === b.numRooms) {
          return a.member.userId.localeCompare(b.member.userId);
        }

        return b.numRooms - a.numRooms;
      }

      return b.score - a.score;
    });
    return members.map(m => ({
      userId: m.member.userId,
      user: m.member
    }));
  }

  _shouldAbortAfterInviteError(result)
  /*: boolean*/
  {
    const failedUsers = Object.keys(result.states).filter(a => result.states[a] === 'error');

    if (failedUsers.length > 0) {
      console.log("Failed to invite users: ", result);
      this.setState({
        busy: false,
        errorText: (0, _languageHandler._t)("Failed to invite the following users to chat: %(csvUsers)s", {
          csvUsers: failedUsers.join(", ")
        })
      });
      return true; // abort
    }

    return false;
  }

  _convertFilter()
  /*: Member[]*/
  {
    // Check to see if there's anything to convert first
    if (!this.state.filterText || !this.state.filterText.includes('@')) return this.state.targets || [];
    let newMember
    /*: Member*/
    ;

    if (this.state.filterText.startsWith('@')) {
      // Assume mxid
      newMember = new DirectoryMember({
        user_id: this.state.filterText,
        display_name: null,
        avatar_url: null
      });
    } else if (_SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer)) {
      // Assume email
      newMember = new ThreepidMember(this.state.filterText);
    }

    const newTargets = [...(this.state.targets || []), newMember];
    this.setState({
      targets: newTargets,
      filterText: ''
    });
    return newTargets;
  }

  _renderSection(kind
  /*: "recents"|"suggestions"*/
  ) {
    let sourceMembers = kind === 'recents' ? this.state.recents : this.state.suggestions;
    let showNum = kind === 'recents' ? this.state.numRecentsShown : this.state.numSuggestionsShown;
    const showMoreFn = kind === 'recents' ? this._showMoreRecents.bind(this) : this._showMoreSuggestions.bind(this);

    const lastActive = m => kind === 'recents' ? m.lastActive : null;

    let sectionName = kind === 'recents' ? (0, _languageHandler._t)("Recent Conversations") : (0, _languageHandler._t)("Suggestions");
    let sectionSubname = null;

    if (kind === 'suggestions' && _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId()) {
      const communityName = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityName();

      sectionSubname = (0, _languageHandler._t)("May include members not in %(communityName)s", {
        communityName
      });
    }

    if (this.props.kind === KIND_INVITE) {
      sectionName = kind === 'recents' ? (0, _languageHandler._t)("Recently Direct Messaged") : (0, _languageHandler._t)("Suggestions");
    } // Mix in the server results if we have any, but only if we're searching. We track the additional
    // members separately because we want to filter sourceMembers but trust the mixin arrays to have
    // the right members in them.


    let priorityAdditionalMembers = []; // Shows up before our own suggestions, higher quality

    let otherAdditionalMembers = []; // Shows up after our own suggestions, lower quality

    const hasMixins = this.state.serverResultsMixin || this.state.threepidResultsMixin;

    if (this.state.filterText && hasMixins && kind === 'suggestions') {
      // We don't want to duplicate members though, so just exclude anyone we've already seen.
      // The type of u is a pain to define but members of both mixins have the 'userId' property
      const notAlreadyExists = (u
      /*: any*/
      ) =>
      /*: boolean*/
      {
        return !sourceMembers.some(m => m.userId === u.userId) && !priorityAdditionalMembers.some(m => m.userId === u.userId) && !otherAdditionalMembers.some(m => m.userId === u.userId);
      };

      otherAdditionalMembers = this.state.serverResultsMixin.filter(notAlreadyExists);
      priorityAdditionalMembers = this.state.threepidResultsMixin.filter(notAlreadyExists);
    }

    const hasAdditionalMembers = priorityAdditionalMembers.length > 0 || otherAdditionalMembers.length > 0; // Hide the section if there's nothing to filter by

    if (sourceMembers.length === 0 && !hasAdditionalMembers) return null; // Do some simple filtering on the input before going much further. If we get no results, say so.

    if (this.state.filterText) {
      const filterBy = this.state.filterText.toLowerCase();
      sourceMembers = sourceMembers.filter(m => m.user.name.toLowerCase().includes(filterBy) || m.userId.toLowerCase().includes(filterBy));

      if (sourceMembers.length === 0 && !hasAdditionalMembers) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_InviteDialog_section"
        }, /*#__PURE__*/_react.default.createElement("h3", null, sectionName), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("No results")));
      }
    } // Now we mix in the additional members. Again, we presume these have already been filtered. We
    // also assume they are more relevant than our suggestions and prepend them to the list.


    sourceMembers = [...priorityAdditionalMembers, ...sourceMembers, ...otherAdditionalMembers]; // If we're going to hide one member behind 'show more', just use up the space of the button
    // with the member's tile instead.

    if (showNum === sourceMembers.length - 1) showNum++; // .slice() will return an incomplete array but won't error on us if we go too far

    const toRender = sourceMembers.slice(0, showNum);
    const hasMore = toRender.length < sourceMembers.length;
    const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
    let showMore = null;

    if (hasMore) {
      showMore = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        onClick: showMoreFn,
        kind: "link"
      }, (0, _languageHandler._t)("Show more"));
    }

    const tiles = toRender.map(r => /*#__PURE__*/_react.default.createElement(DMRoomTile, {
      member: r.user,
      lastActiveTs: lastActive(r),
      key: r.userId,
      onToggle: this._toggleMember,
      highlightWord: this.state.filterText,
      isSelected: this.state.targets.some(t => t.userId === r.userId)
    }));
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_section"
    }, /*#__PURE__*/_react.default.createElement("h3", null, sectionName), sectionSubname ? /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_InviteDialog_subname"
    }, sectionSubname) : null, tiles, showMore);
  }

  _renderEditor() {
    const targets = this.state.targets.map(t => /*#__PURE__*/_react.default.createElement(DMUserTile, {
      member: t,
      onRemove: !this.state.busy && this._removeMember,
      key: t.userId
    }));

    const input = /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      onKeyDown: this._onKeyDown,
      onChange: this._updateFilter,
      value: this.state.filterText,
      ref: this._editorRef,
      onPaste: this._onPaste,
      autoFocus: true,
      disabled: this.state.busy,
      autoComplete: "off"
    });

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_editor",
      onClick: this._onClickInputArea
    }, targets, input);
  }

  _renderIdentityServerWarning() {
    if (!this.state.tryingIdentityServer || this.state.canUseIdentityServer || !_SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer)) {
      return null;
    }

    const defaultIdentityServerUrl = (0, _IdentityServerUtils.getDefaultIdentityServerUrl)();

    if (defaultIdentityServerUrl) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AddressPickerDialog_identityServer"
      }, (0, _languageHandler._t)("Use an identity server to invite by email. " + "<default>Use the default (%(defaultIdentityServerName)s)</default> " + "or manage in <settings>Settings</settings>.", {
        defaultIdentityServerName: (0, _UrlUtils.abbreviateUrl)(defaultIdentityServerUrl)
      }, {
        default: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "#",
          onClick: this._onUseDefaultIdentityServerClick
        }, sub),
        settings: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "#",
          onClick: this._onManageSettingsClick
        }, sub)
      }));
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AddressPickerDialog_identityServer"
      }, (0, _languageHandler._t)("Use an identity server to invite by email. " + "Manage in <settings>Settings</settings>.", {}, {
        settings: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "#",
          onClick: this._onManageSettingsClick
        }, sub)
      }));
    }
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
    const Spinner = sdk.getComponent("elements.Spinner");
    let spinner = null;

    if (this.state.busy) {
      spinner = /*#__PURE__*/_react.default.createElement(Spinner, {
        w: 20,
        h: 20
      });
    }

    let title;
    let helpText;
    let buttonText;
    let goButtonFn;
    let consultSection;

    let keySharingWarning = /*#__PURE__*/_react.default.createElement("span", null);

    const identityServersEnabled = _SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer);

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const userId = cli.getUserId();

    if (this.props.kind === KIND_DM) {
      title = (0, _languageHandler._t)("Direct Messages");

      if (identityServersEnabled) {
        helpText = (0, _languageHandler._t)("Start a conversation with someone using their name, email address or username (like <userId/>).", {}, {
          userId: () => {
            return /*#__PURE__*/_react.default.createElement("a", {
              href: (0, _Permalinks.makeUserPermalink)(userId),
              rel: "noreferrer noopener",
              target: "_blank"
            }, userId);
          }
        });
      } else {
        helpText = (0, _languageHandler._t)("Start a conversation with someone using their name or username (like <userId/>).", {}, {
          userId: () => {
            return /*#__PURE__*/_react.default.createElement("a", {
              href: (0, _Permalinks.makeUserPermalink)(userId),
              rel: "noreferrer noopener",
              target: "_blank"
            }, userId);
          }
        });
      }

      if (_CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId()) {
        const communityName = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityName();

        const inviteText = (0, _languageHandler._t)("This won't invite them to %(communityName)s. " + "To invite someone to %(communityName)s, click <a>here</a>", {
          communityName
        }, {
          userId: () => {
            return /*#__PURE__*/_react.default.createElement("a", {
              href: (0, _Permalinks.makeUserPermalink)(userId),
              rel: "noreferrer noopener",
              target: "_blank"
            }, userId);
          },
          a: sub => {
            return /*#__PURE__*/_react.default.createElement(AccessibleButton, {
              kind: "link",
              onClick: this._onCommunityInviteClick
            }, sub);
          }
        });
        helpText = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, helpText, " ", inviteText);
      }

      buttonText = (0, _languageHandler._t)("Go");
      goButtonFn = this._startDm;
    } else if (this.props.kind === KIND_INVITE) {
      const room = _MatrixClientPeg.MatrixClientPeg.get()?.getRoom(this.props.roomId);
      const isSpace = room?.isSpaceRoom();
      title = isSpace ? (0, _languageHandler._t)("Invite to %(spaceName)s", {
        spaceName: room.name || (0, _languageHandler._t)("Unnamed Space")
      }) : (0, _languageHandler._t)("Invite to %(roomName)s", {
        roomName: room.name || (0, _languageHandler._t)("Unnamed Room")
      });
      let helpTextUntranslated;

      if (isSpace) {
        if (identityServersEnabled) {
          helpTextUntranslated = (0, _languageHandler._td)("Invite someone using their name, email address, username " + "(like <userId/>) or <a>share this space</a>.");
        } else {
          helpTextUntranslated = (0, _languageHandler._td)("Invite someone using their name, username " + "(like <userId/>) or <a>share this space</a>.");
        }
      } else {
        if (identityServersEnabled) {
          helpTextUntranslated = (0, _languageHandler._td)("Invite someone using their name, email address, username " + "(like <userId/>) or <a>share this room</a>.");
        } else {
          helpTextUntranslated = (0, _languageHandler._td)("Invite someone using their name, username " + "(like <userId/>) or <a>share this room</a>.");
        }
      }

      helpText = (0, _languageHandler._t)(helpTextUntranslated, {}, {
        userId: () => /*#__PURE__*/_react.default.createElement("a", {
          href: (0, _Permalinks.makeUserPermalink)(userId),
          rel: "noreferrer noopener",
          target: "_blank"
        }, userId),
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: (0, _Permalinks.makeRoomPermalink)(this.props.roomId),
          rel: "noreferrer noopener",
          target: "_blank"
        }, sub)
      });
      buttonText = (0, _languageHandler._t)("Invite");
      goButtonFn = this._inviteUsers;

      if (cli.isRoomEncrypted(this.props.roomId)) {
        const room = cli.getRoom(this.props.roomId);
        const visibilityEvent = room.currentState.getStateEvents("m.room.history_visibility", "");
        const visibility = visibilityEvent && visibilityEvent.getContent() && visibilityEvent.getContent().history_visibility;

        if (visibility === "world_readable" || visibility === "shared") {
          keySharingWarning = /*#__PURE__*/_react.default.createElement("p", {
            className: "mx_InviteDialog_helpText"
          }, /*#__PURE__*/_react.default.createElement("img", {
            src: require("../../../../res/img/element-icons/info.svg"),
            width: 14,
            height: 14
          }), " " + (0, _languageHandler._t)("Invited people will be able to read old messages."));
        }
      }
    } else if (this.props.kind === KIND_CALL_TRANSFER) {
      title = (0, _languageHandler._t)("Transfer");
      buttonText = (0, _languageHandler._t)("Transfer");
      goButtonFn = this._transferCall;
      consultSection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
        type: "checkbox",
        checked: this.state.consultFirst,
        onChange: this.onConsultFirstChange
      }), (0, _languageHandler._t)("Consult first")));
    } else {
      console.error("Unknown kind of InviteDialog: " + this.props.kind);
    }

    const hasSelection = this.state.targets.length > 0 || this.state.filterText && this.state.filterText.includes('@');
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_InviteDialog",
      hasCancel: true,
      onFinished: this.props.onFinished,
      title: title
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_InviteDialog_helpText"
    }, helpText), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_addressBar"
    }, this._renderEditor(), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_buttonAndSpinner"
    }, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      kind: "primary",
      onClick: goButtonFn,
      className: "mx_InviteDialog_goButton",
      disabled: this.state.busy || !hasSelection
    }, buttonText), spinner)), keySharingWarning, this._renderIdentityServerWarning(), /*#__PURE__*/_react.default.createElement("div", {
      className: "error"
    }, this.state.errorText), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_userSections"
    }, this._renderSection('recents'), this._renderSection('suggestions')), consultSection));
  }

}, (0, _defineProperty2.default)(_class2, "defaultProps", {
  kind: KIND_DM,
  initialText: ""
}), _temp)) || _class);
exports.default = InviteDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvSW52aXRlRGlhbG9nLnRzeCJdLCJuYW1lcyI6WyJLSU5EX0RNIiwiS0lORF9JTlZJVEUiLCJLSU5EX0NBTExfVFJBTlNGRVIiLCJJTklUSUFMX1JPT01TX1NIT1dOIiwiSU5DUkVNRU5UX1JPT01TX1NIT1dOIiwiTWVtYmVyIiwibmFtZSIsIkVycm9yIiwidXNlcklkIiwiZ2V0TXhjQXZhdGFyVXJsIiwiRGlyZWN0b3J5TWVtYmVyIiwiY29uc3RydWN0b3IiLCJ1c2VyRGlyUmVzdWx0IiwiX3VzZXJJZCIsInVzZXJfaWQiLCJfZGlzcGxheU5hbWUiLCJkaXNwbGF5X25hbWUiLCJfYXZhdGFyVXJsIiwiYXZhdGFyX3VybCIsIlRocmVlcGlkTWVtYmVyIiwiaWQiLCJfaWQiLCJpc0VtYWlsIiwiaW5jbHVkZXMiLCJETVVzZXJUaWxlIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwicHJvcHMiLCJvblJlbW92ZSIsIm1lbWJlciIsInJlbmRlciIsIkJhc2VBdmF0YXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJBY2Nlc3NpYmxlQnV0dG9uIiwiYXZhdGFyU2l6ZSIsImF2YXRhciIsInJlcXVpcmUiLCJnZXRTcXVhcmVUaHVtYm5haWxIdHRwIiwiY2xvc2VCdXR0b24iLCJfb25SZW1vdmUiLCJETVJvb21UaWxlIiwib25Ub2dnbGUiLCJfaGlnaGxpZ2h0TmFtZSIsInN0ciIsImhpZ2hsaWdodFdvcmQiLCJsb3dlclN0ciIsInRvTG93ZXJDYXNlIiwiZmlsdGVyU3RyIiwicmVzdWx0IiwiaSIsImlpIiwiaW5kZXhPZiIsInB1c2giLCJzdWJzdHJpbmciLCJzdWJzdHIiLCJsZW5ndGgiLCJ0aW1lc3RhbXAiLCJsYXN0QWN0aXZlVHMiLCJodW1hblRzIiwiY2hlY2ttYXJrIiwiaXNTZWxlY3RlZCIsInN0YWNrZWRBdmF0YXIiLCJjYXB0aW9uIiwiX29uQ2xpY2siLCJJbnZpdGVEaWFsb2ciLCJldiIsInNldFN0YXRlIiwiY29uc3VsdEZpcnN0IiwidGFyZ2V0IiwiY2hlY2tlZCIsImJ1c3kiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJ0YXJnZXRzIiwiX2NvbnZlcnRGaWx0ZXIiLCJ0YXJnZXRJZHMiLCJtYXAiLCJ0IiwiZXhpc3RpbmdSb29tIiwiRE1Sb29tTWFwIiwic2hhcmVkIiwiZ2V0RE1Sb29tRm9ySWRlbnRpZmllcnMiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21faWQiLCJyb29tSWQiLCJzaG91bGRfcGVlayIsImpvaW5pbmciLCJvbkZpbmlzaGVkIiwiY3JlYXRlUm9vbU9wdGlvbnMiLCJpbmxpbmVFcnJvcnMiLCJoYXMzUGlkTWVtYmVycyIsInNvbWUiLCJhbGxIYXZlRGV2aWNlS2V5cyIsImVuY3J5cHRpb24iLCJpc1NlbGYiLCJnZXRVc2VySWQiLCJkbVVzZXJJZCIsImNyZWF0ZU9wdHMiLCJyZWR1Y2UiLCJyb29tT3B0aW9ucyIsImFkZHJlc3MiLCJ0eXBlIiwiaW52aXRlIiwiaWRfc2VydmVyIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJtZWRpdW0iLCJpbnZpdGVfM3BpZCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImVycm9yVGV4dCIsInN0YXJ0VGltZSIsIkNvdW50bHlBbmFseXRpY3MiLCJnZXRUaW1lc3RhbXAiLCJjbGkiLCJyb29tIiwiZ2V0Um9vbSIsImluc3RhbmNlIiwidHJhY2tTZW5kSW52aXRlIiwiX3Nob3VsZEFib3J0QWZ0ZXJJbnZpdGVFcnJvciIsImlzUm9vbUVuY3J5cHRlZCIsInZpc2liaWxpdHlFdmVudCIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwidmlzaWJpbGl0eSIsImdldENvbnRlbnQiLCJoaXN0b3J5X3Zpc2liaWxpdHkiLCJpbnZpdGVkVXNlcnMiLCJhZGRyIiwic3RhdGUiLCJPYmplY3QiLCJlbnRyaWVzIiwic3RhdGVzIiwibG9nIiwic2VuZFNoYXJlZEhpc3RvcnlLZXlzIiwiZG1Sb29tSWQiLCJjYWxsIiwidHJhbnNmZXJlZSIsInRyYW5zZmVyIiwidmFsdWUiLCJ0cmltIiwiaGFzTW9kaWZpZXJzIiwiY3RybEtleSIsInNoaWZ0S2V5IiwibWV0YUtleSIsImtleSIsIktleSIsIkJBQ0tTUEFDRSIsIl9yZW1vdmVNZW1iZXIiLCJFTlRFUiIsIlNQQUNFIiwidGVybSIsInNlYXJjaFVzZXJEaXJlY3RvcnkiLCJ0aGVuIiwiciIsImZpbHRlclRleHQiLCJyZXN1bHRzIiwicHJvZmlsZSIsImdldFByb2ZpbGVJbmZvIiwic3BsaWNlIiwid2FybiIsInNlcnZlclJlc3VsdHNNaXhpbiIsInUiLCJ1c2VyIiwiY2F0Y2giLCJjYW5Vc2VJZGVudGl0eVNlcnZlciIsInRyeWluZ0lkZW50aXR5U2VydmVyIiwiRW1haWwiLCJsb29rc1ZhbGlkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiSWRlbnRpdHlTZXJ2ZXIiLCJ0aHJlZXBpZFJlc3VsdHNNaXhpbiIsImF1dGhDbGllbnQiLCJJZGVudGl0eUF1dGhDbGllbnQiLCJ0b2tlbiIsImdldEFjY2Vzc1Rva2VuIiwibG9va3VwIiwibG9va3VwVGhyZWVQaWQiLCJ1bmRlZmluZWQiLCJteGlkIiwiZGlzcGxheW5hbWUiLCJfZGVib3VuY2VUaW1lciIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJfdXBkYXRlU3VnZ2VzdGlvbnMiLCJudW1SZWNlbnRzU2hvd24iLCJudW1TdWdnZXN0aW9uc1Nob3duIiwiaWR4IiwiX2VkaXRvclJlZiIsImN1cnJlbnQiLCJmb2N1cyIsInRleHQiLCJjbGlwYm9hcmREYXRhIiwiZ2V0RGF0YSIsInBvc3NpYmxlTWVtYmVycyIsInJlY2VudHMiLCJzdWdnZXN0aW9ucyIsInRvQWRkIiwiZmFpbGVkIiwicG90ZW50aWFsQWRkcmVzc2VzIiwic3BsaXQiLCJwIiwiZmlsdGVyIiwiZmluZCIsIm0iLCJkaXNwbGF5TmFtZSIsImF2YXRhclVybCIsIlF1ZXN0aW9uRGlhbG9nIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImNzdk5hbWVzIiwiam9pbiIsImJ1dHRvbiIsImZpcmUiLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwiQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUiLCJnZXRTZWxlY3RlZENvbW11bml0eUlkIiwia2luZCIsImFscmVhZHlJbnZpdGVkIiwiU2V0IiwiU2RrQ29uZmlnIiwiZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwIiwiZm9yRWFjaCIsImFkZCIsInRyYWNrQmVnaW5JbnZpdGUiLCJpbml0aWFsVGV4dCIsImJ1aWxkUmVjZW50cyIsIl9idWlsZFN1Z2dlc3Rpb25zIiwiY29tcG9uZW50RGlkTW91bnQiLCJleGNsdWRlZFRhcmdldElkcyIsInJvb21zIiwiZ2V0VW5pcXVlUm9vbXNXaXRoSW5kaXZpZHVhbHMiLCJkbVRhZ2dlZFJvb21zIiwiUm9vbUxpc3RTdG9yZSIsIm9yZGVyZWRMaXN0cyIsIkRlZmF1bHRUYWdJRCIsIkRNIiwibXlVc2VySWQiLCJkbVJvb20iLCJvdGhlck1lbWJlcnMiLCJnZXRKb2luZWRNZW1iZXJzIiwiaGFzIiwiZ2V0TWVtYmVyIiwic2VhcmNoVHlwZXMiLCJtYXhTZWFyY2hFdmVudHMiLCJsYXN0RXZlbnRUcyIsInRpbWVsaW5lIiwiZ2V0VHlwZSIsImdldFRzIiwibGFzdEFjdGl2ZSIsInNvcnQiLCJhIiwiYiIsIm1heENvbnNpZGVyZWRNZW1iZXJzIiwiam9pbmVkUm9vbXMiLCJnZXRSb29tcyIsImdldE15TWVtYmVyc2hpcCIsImdldEpvaW5lZE1lbWJlckNvdW50IiwibWVtYmVyUm9vbXMiLCJtZW1iZXJzIiwiZ2V0VXNlcklkRm9yUm9vbUlkIiwiam9pbmVkTWVtYmVycyIsInBpY2tlZE1lbWJlclJvb21TaXplIiwibWVtYmVyU2NvcmVzIiwidmFsdWVzIiwic2NvcmVzIiwiZW50cnkiLCJudW1NZW1iZXJzVG90YWwiLCJjIiwibWF4UmFuZ2UiLCJudW1Sb29tcyIsInNjb3JlIiwiTWF0aCIsIm1heCIsInBvdyIsInRydWVKb2luZWRSb29tcyIsIm5vdyIsIkRhdGUiLCJnZXRUaW1lIiwiZWFybGllc3RBZ2VDb25zaWRlcmVkIiwibWF4TWVzc2FnZXNDb25zaWRlcmVkIiwibGFzdFNwb2tlIiwibGFzdFNwb2tlTWVtYmVycyIsImlzRG0iLCJrZXlzIiwidGFncyIsImV2ZW50cyIsImdldExpdmVUaW1lbGluZSIsImdldEV2ZW50cyIsImdldFNlbmRlciIsInRzIiwiZGlzdGFuY2VGcm9tTm93IiwiYWJzIiwiaW52ZXJzZVRpbWUiLCJzY29yZUJvb3N0IiwicmVjb3JkIiwibG9jYWxlQ29tcGFyZSIsImZhaWxlZFVzZXJzIiwiY3N2VXNlcnMiLCJuZXdNZW1iZXIiLCJzdGFydHNXaXRoIiwibmV3VGFyZ2V0cyIsIl9yZW5kZXJTZWN0aW9uIiwic291cmNlTWVtYmVycyIsInNob3dOdW0iLCJzaG93TW9yZUZuIiwiX3Nob3dNb3JlUmVjZW50cyIsImJpbmQiLCJfc2hvd01vcmVTdWdnZXN0aW9ucyIsInNlY3Rpb25OYW1lIiwic2VjdGlvblN1Ym5hbWUiLCJjb21tdW5pdHlOYW1lIiwiZ2V0U2VsZWN0ZWRDb21tdW5pdHlOYW1lIiwicHJpb3JpdHlBZGRpdGlvbmFsTWVtYmVycyIsIm90aGVyQWRkaXRpb25hbE1lbWJlcnMiLCJoYXNNaXhpbnMiLCJub3RBbHJlYWR5RXhpc3RzIiwiaGFzQWRkaXRpb25hbE1lbWJlcnMiLCJmaWx0ZXJCeSIsInRvUmVuZGVyIiwic2xpY2UiLCJoYXNNb3JlIiwic2hvd01vcmUiLCJ0aWxlcyIsIl90b2dnbGVNZW1iZXIiLCJfcmVuZGVyRWRpdG9yIiwiaW5wdXQiLCJfb25LZXlEb3duIiwiX3VwZGF0ZUZpbHRlciIsIl9vblBhc3RlIiwiX29uQ2xpY2tJbnB1dEFyZWEiLCJfcmVuZGVySWRlbnRpdHlTZXJ2ZXJXYXJuaW5nIiwiZGVmYXVsdElkZW50aXR5U2VydmVyVXJsIiwiZGVmYXVsdElkZW50aXR5U2VydmVyTmFtZSIsImRlZmF1bHQiLCJzdWIiLCJfb25Vc2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXJDbGljayIsInNldHRpbmdzIiwiX29uTWFuYWdlU2V0dGluZ3NDbGljayIsIkJhc2VEaWFsb2ciLCJTcGlubmVyIiwic3Bpbm5lciIsImhlbHBUZXh0IiwiYnV0dG9uVGV4dCIsImdvQnV0dG9uRm4iLCJjb25zdWx0U2VjdGlvbiIsImtleVNoYXJpbmdXYXJuaW5nIiwiaWRlbnRpdHlTZXJ2ZXJzRW5hYmxlZCIsImludml0ZVRleHQiLCJfb25Db21tdW5pdHlJbnZpdGVDbGljayIsIl9zdGFydERtIiwiaXNTcGFjZSIsImlzU3BhY2VSb29tIiwic3BhY2VOYW1lIiwicm9vbU5hbWUiLCJoZWxwVGV4dFVudHJhbnNsYXRlZCIsIl9pbnZpdGVVc2VycyIsIl90cmFuc2ZlckNhbGwiLCJvbkNvbnN1bHRGaXJzdENoYW5nZSIsImhhc1NlbGVjdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7OztBQUVBOztBQUNBO0FBRU8sTUFBTUEsT0FBTyxHQUFHLElBQWhCOztBQUNBLE1BQU1DLFdBQVcsR0FBRyxRQUFwQjs7QUFDQSxNQUFNQyxrQkFBa0IsR0FBRyxlQUEzQjs7QUFFUCxNQUFNQyxtQkFBbUIsR0FBRyxDQUE1QixDLENBQStCOztBQUMvQixNQUFNQyxxQkFBcUIsR0FBRyxDQUE5QixDLENBQWlDO0FBRWpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsTUFBTUMsTUFBTixDQUFhO0FBQ1Q7QUFDSjtBQUNBO0FBQ0E7QUFDSSxNQUFJQyxJQUFKO0FBQUE7QUFBbUI7QUFB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QUFDO0FBQWYsb0JBQ0k7QUFBRyxNQUFBLFNBQVMsRUFBQztBQUFiLE9BQXlDdUksUUFBekMsQ0FESixlQUVJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLLEtBQUtqQixhQUFMLEVBREwsZUFFSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMsZ0JBQUQ7QUFDSSxNQUFBLElBQUksRUFBQyxTQURUO0FBRUksTUFBQSxPQUFPLEVBQUVtQixVQUZiO0FBR0ksTUFBQSxTQUFTLEVBQUMsMEJBSGQ7QUFJSSxNQUFBLFFBQVEsRUFBRSxLQUFLNU4sS0FBTCxDQUFXOUQsSUFBWCxJQUFtQixDQUFDeVM7QUFKbEMsT0FNS2hCLFVBTkwsQ0FESixFQVNLRixPQVRMLENBRkosQ0FGSixFQWdCS0ssaUJBaEJMLEVBaUJLLEtBQUtmLDRCQUFMLEVBakJMLGVBa0JJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUF3QixLQUFLL00sS0FBTCxDQUFXbkIsU0FBbkMsQ0FsQkosZUFtQkk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0ssS0FBS3FNLGNBQUwsQ0FBb0IsU0FBcEIsQ0FETCxFQUVLLEtBQUtBLGNBQUwsQ0FBb0IsYUFBcEIsQ0FGTCxDQW5CSixFQXVCSzJDLGNBdkJMLENBTkosQ0FESjtBQWtDSDs7QUFsakNpRyxDLHlEQUM1RTtBQUNsQmhJLEVBQUFBLElBQUksRUFBRXJPLE9BRFk7QUFFbEI2TyxFQUFBQSxXQUFXLEVBQUU7QUFGSyxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge190LCBfdGR9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQge21ha2VSb29tUGVybWFsaW5rLCBtYWtlVXNlclBlcm1hbGlua30gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRE1Sb29tTWFwXCI7XG5pbXBvcnQge1Jvb21NZW1iZXJ9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0ICogYXMgRW1haWwgZnJvbSBcIi4uLy4uLy4uL2VtYWlsXCI7XG5pbXBvcnQge2dldERlZmF1bHRJZGVudGl0eVNlcnZlclVybCwgdXNlRGVmYXVsdElkZW50aXR5U2VydmVyfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvSWRlbnRpdHlTZXJ2ZXJVdGlsc1wiO1xuaW1wb3J0IHthYmJyZXZpYXRlVXJsfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvVXJsVXRpbHNcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IElkZW50aXR5QXV0aENsaWVudCBmcm9tIFwiLi4vLi4vLi4vSWRlbnRpdHlBdXRoQ2xpZW50XCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQge2h1bWFuaXplVGltZX0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2h1bWFuaXplXCI7XG5pbXBvcnQgY3JlYXRlUm9vbSwge1xuICAgIGNhbkVuY3J5cHRUb0FsbFVzZXJzLCBlbnN1cmVETUV4aXN0cywgZmluZERNRm9yVXNlciwgcHJpdmF0ZVNob3VsZEJlRW5jcnlwdGVkLFxuICAgIElJbnZpdGUzUElELFxufSBmcm9tIFwiLi4vLi4vLi4vY3JlYXRlUm9vbVwiO1xuaW1wb3J0IHtpbnZpdGVNdWx0aXBsZVRvUm9vbSwgc2hvd0NvbW11bml0eUludml0ZURpYWxvZ30gZnJvbSBcIi4uLy4uLy4uL1Jvb21JbnZpdGVcIjtcbmltcG9ydCB7S2V5fSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7QWN0aW9ufSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQge0RlZmF1bHRUYWdJRH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgUm9vbUxpc3RTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9Sb29tTGlzdFN0b3JlXCI7XG5pbXBvcnQge0NvbW11bml0eVByb3RvdHlwZVN0b3JlfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0NvbW11bml0eVByb3RvdHlwZVN0b3JlXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtVSUZlYXR1cmV9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuLi8uLi8uLi9Db3VudGx5QW5hbHl0aWNzXCI7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgTWF0cml4Q2FsbCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IHttZWRpYUZyb21NeGN9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuaW1wb3J0IHtnZXRBZGRyZXNzVHlwZX0gZnJvbSBcIi4uLy4uLy4uL1VzZXJBZGRyZXNzXCI7XG5cbi8vIHdlIGhhdmUgYSBudW1iZXIgb2YgdHlwZXMgZGVmaW5lZCBmcm9tIHRoZSBNYXRyaXggc3BlYyB3aGljaCBjYW4ndCByZWFzb25hYmx5IGJlIGFsdGVyZWQgaGVyZS5cbi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuXG5leHBvcnQgY29uc3QgS0lORF9ETSA9IFwiZG1cIjtcbmV4cG9ydCBjb25zdCBLSU5EX0lOVklURSA9IFwiaW52aXRlXCI7XG5leHBvcnQgY29uc3QgS0lORF9DQUxMX1RSQU5TRkVSID0gXCJjYWxsX3RyYW5zZmVyXCI7XG5cbmNvbnN0IElOSVRJQUxfUk9PTVNfU0hPV04gPSAzOyAvLyBOdW1iZXIgb2Ygcm9vbXMgdG8gc2hvdyBhdCBmaXJzdFxuY29uc3QgSU5DUkVNRU5UX1JPT01TX1NIT1dOID0gNTsgLy8gTnVtYmVyIG9mIHJvb21zIHRvIGFkZCB3aGVuICdzaG93IG1vcmUnIGlzIGNsaWNrZWRcblxuLy8gVGhpcyBpcyB0aGUgaW50ZXJmYWNlIHRoYXQgaXMgZXhwZWN0ZWQgYnkgdmFyaW91cyBjb21wb25lbnRzIGluIHRoaXMgZmlsZS4gSXQgaXMgYSBiaXRcbi8vIGF3a3dhcmQgYmVjYXVzZSBpdCBhbHNvIG1hdGNoZXMgdGhlIFJvb21NZW1iZXIgY2xhc3MgZnJvbSB0aGUganMtc2RrIHdpdGggc29tZSBleHRyYSBzdXBwb3J0XG4vLyBmb3IgM1BJRHMvZW1haWwgYWRkcmVzc2VzLlxuLy9cbi8vIFhYWDogV2Ugc2hvdWxkIHVzZSBUeXBlU2NyaXB0IGludGVyZmFjZXMgaW5zdGVhZCBvZiB0aGlzIHdlaXJkIFwiYWJzdHJhY3RcIiBjbGFzcy5cbmNsYXNzIE1lbWJlciB7XG4gICAgLyoqXG4gICAgICogVGhlIGRpc3BsYXkgbmFtZSBvZiB0aGlzIE1lbWJlci4gRm9yIHVzZXJzIHRoaXMgc2hvdWxkIGJlIHRoZWlyIHByb2ZpbGUncyBkaXNwbGF5XG4gICAgICogbmFtZSBvciB1c2VyIElEIGlmIG5vbmUgc2V0LiBGb3IgM1BJRHMgdGhpcyBzaG91bGQgYmUgdGhlIDNQSUQgYWRkcmVzcyAoZW1haWwpLlxuICAgICAqL1xuICAgIGdldCBuYW1lKCk6IHN0cmluZyB7IHRocm93IG5ldyBFcnJvcihcIk1lbWJlciBjbGFzcyBub3QgaW1wbGVtZW50ZWRcIik7IH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBJRCBvZiB0aGlzIE1lbWJlci4gRm9yIHVzZXJzIHRoaXMgc2hvdWxkIGJlIHRoZWlyIHVzZXIgSUQuIEZvciAzUElEcyB0aGlzIHNob3VsZFxuICAgICAqIGJlIHRoZSAzUElEIGFkZHJlc3MgKGVtYWlsKS5cbiAgICAgKi9cbiAgICBnZXQgdXNlcklkKCk6IHN0cmluZyB7IHRocm93IG5ldyBFcnJvcihcIk1lbWJlciBjbGFzcyBub3QgaW1wbGVtZW50ZWRcIik7IH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIE1YQyBVUkwgb2YgdGhpcyBNZW1iZXIncyBhdmF0YXIuIEZvciB1c2VycyB0aGlzIHNob3VsZCBiZSB0aGVpciBwcm9maWxlJ3NcbiAgICAgKiBhdmF0YXIgTVhDIFVSTCBvciBudWxsIGlmIG5vbmUgc2V0LiBGb3IgM1BJRHMgdGhpcyBzaG91bGQgYWx3YXlzIGJlIG51bGwuXG4gICAgICovXG4gICAgZ2V0TXhjQXZhdGFyVXJsKCk6IHN0cmluZyB7IHRocm93IG5ldyBFcnJvcihcIk1lbWJlciBjbGFzcyBub3QgaW1wbGVtZW50ZWRcIik7IH1cbn1cblxuY2xhc3MgRGlyZWN0b3J5TWVtYmVyIGV4dGVuZHMgTWVtYmVyIHtcbiAgICBfdXNlcklkOiBzdHJpbmc7XG4gICAgX2Rpc3BsYXlOYW1lOiBzdHJpbmc7XG4gICAgX2F2YXRhclVybDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodXNlckRpclJlc3VsdDoge3VzZXJfaWQ6IHN0cmluZywgZGlzcGxheV9uYW1lOiBzdHJpbmcsIGF2YXRhcl91cmw6IHN0cmluZ30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fdXNlcklkID0gdXNlckRpclJlc3VsdC51c2VyX2lkO1xuICAgICAgICB0aGlzLl9kaXNwbGF5TmFtZSA9IHVzZXJEaXJSZXN1bHQuZGlzcGxheV9uYW1lO1xuICAgICAgICB0aGlzLl9hdmF0YXJVcmwgPSB1c2VyRGlyUmVzdWx0LmF2YXRhcl91cmw7XG4gICAgfVxuXG4gICAgLy8gVGhlc2UgbmV4dCBjbGFzcyBtZW1iZXJzIGFyZSBmb3IgdGhlIE1lbWJlciBpbnRlcmZhY2VcbiAgICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlzcGxheU5hbWUgfHwgdGhpcy5fdXNlcklkO1xuICAgIH1cblxuICAgIGdldCB1c2VySWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VzZXJJZDtcbiAgICB9XG5cbiAgICBnZXRNeGNBdmF0YXJVcmwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F2YXRhclVybDtcbiAgICB9XG59XG5cbmNsYXNzIFRocmVlcGlkTWVtYmVyIGV4dGVuZHMgTWVtYmVyIHtcbiAgICBfaWQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5faWQgPSBpZDtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGlzIGEgZ2V0dGVyIHRoYXQgd291bGQgYmUgZmFsc2V5IG9uIGFsbCBvdGhlciBpbXBsZW1lbnRhdGlvbnMuIFVudGlsIHdlIGhhdmVcbiAgICAvLyBiZXR0ZXIgdHlwZSBzdXBwb3J0IGluIHRoZSByZWFjdC1zZGsgd2UgY2FuIHVzZSB0aGlzIHRyaWNrIHRvIGRldGVybWluZSB0aGUga2luZFxuICAgIC8vIG9mIDNQSUQgd2UncmUgZGVhbGluZyB3aXRoLCBpZiBhbnkuXG4gICAgZ2V0IGlzRW1haWwoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZC5pbmNsdWRlcygnQCcpO1xuICAgIH1cblxuICAgIC8vIFRoZXNlIG5leHQgY2xhc3MgbWVtYmVycyBhcmUgZm9yIHRoZSBNZW1iZXIgaW50ZXJmYWNlXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgIH1cblxuICAgIGdldCB1c2VySWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgIH1cblxuICAgIGdldE14Y0F2YXRhclVybCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJRE1Vc2VyVGlsZVByb3BzIHtcbiAgICBtZW1iZXI6IFJvb21NZW1iZXI7XG4gICAgb25SZW1vdmU6IChSb29tTWVtYmVyKSA9PiBhbnk7XG59XG5cbmNsYXNzIERNVXNlclRpbGUgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElETVVzZXJUaWxlUHJvcHM+IHtcbiAgICBfb25SZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgICAvLyBTdG9wIHRoZSBicm93c2VyIGZyb20gaGlnaGxpZ2h0aW5nIHRleHRcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5tZW1iZXIpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuYXZhdGFycy5CYXNlQXZhdGFyXCIpO1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkFjY2Vzc2libGVCdXR0b25cIik7XG5cbiAgICAgICAgY29uc3QgYXZhdGFyU2l6ZSA9IDIwO1xuICAgICAgICBjb25zdCBhdmF0YXIgPSB0aGlzLnByb3BzLm1lbWJlci5pc0VtYWlsXG4gICAgICAgICAgICA/IDxpbWdcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyVGlsZV9hdmF0YXIgbXhfSW52aXRlRGlhbG9nX3VzZXJUaWxlX3RocmVlcGlkQXZhdGFyJ1xuICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvaWNvbi1lbWFpbC1waWxsLWF2YXRhci5zdmdcIil9XG4gICAgICAgICAgICAgICAgd2lkdGg9e2F2YXRhclNpemV9IGhlaWdodD17YXZhdGFyU2l6ZX0gLz5cbiAgICAgICAgICAgIDogPEJhc2VBdmF0YXJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyVGlsZV9hdmF0YXInXG4gICAgICAgICAgICAgICAgdXJsPXt0aGlzLnByb3BzLm1lbWJlci5nZXRNeGNBdmF0YXJVcmwoKVxuICAgICAgICAgICAgICAgICAgICA/IG1lZGlhRnJvbU14Yyh0aGlzLnByb3BzLm1lbWJlci5nZXRNeGNBdmF0YXJVcmwoKSkuZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cChhdmF0YXJTaXplKVxuICAgICAgICAgICAgICAgICAgICA6IG51bGx9XG4gICAgICAgICAgICAgICAgbmFtZT17dGhpcy5wcm9wcy5tZW1iZXIubmFtZX1cbiAgICAgICAgICAgICAgICBpZE5hbWU9e3RoaXMucHJvcHMubWVtYmVyLnVzZXJJZH1cbiAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9e2F2YXRhclNpemV9IC8+O1xuXG4gICAgICAgIGxldCBjbG9zZUJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25SZW1vdmUpIHtcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3VzZXJUaWxlX3JlbW92ZSdcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25SZW1vdmV9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvaWNvbi1waWxsLXJlbW92ZS5zdmdcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBhbHQ9e190KCdSZW1vdmUnKX0gd2lkdGg9ezh9IGhlaWdodD17OH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3VzZXJUaWxlJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyVGlsZV9waWxsJz5cbiAgICAgICAgICAgICAgICAgICAge2F2YXRhcn1cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfdXNlclRpbGVfbmFtZSc+e3RoaXMucHJvcHMubWVtYmVyLm5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICB7IGNsb3NlQnV0dG9uIH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJRE1Sb29tVGlsZVByb3BzIHtcbiAgICBtZW1iZXI6IFJvb21NZW1iZXI7XG4gICAgbGFzdEFjdGl2ZVRzOiBudW1iZXI7XG4gICAgb25Ub2dnbGU6IChSb29tTWVtYmVyKSA9PiBhbnk7XG4gICAgaGlnaGxpZ2h0V29yZDogc3RyaW5nO1xuICAgIGlzU2VsZWN0ZWQ6IGJvb2xlYW47XG59XG5cbmNsYXNzIERNUm9vbVRpbGUgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElETVJvb21UaWxlUHJvcHM+IHtcbiAgICBfb25DbGljayA9IChlKSA9PiB7XG4gICAgICAgIC8vIFN0b3AgdGhlIGJyb3dzZXIgZnJvbSBoaWdobGlnaHRpbmcgdGV4dFxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vblRvZ2dsZSh0aGlzLnByb3BzLm1lbWJlcik7XG4gICAgfTtcblxuICAgIF9oaWdobGlnaHROYW1lKHN0cjogc3RyaW5nKSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5oaWdobGlnaHRXb3JkKSByZXR1cm4gc3RyO1xuXG4gICAgICAgIC8vIFdlIGNvbnZlcnQgdGhpbmdzIHRvIGxvd2VyY2FzZSBmb3IgaW5kZXggc2VhcmNoaW5nLCBidXQgcHVsbCBzdWJzdHJpbmdzIGZyb21cbiAgICAgICAgLy8gdGhlIHN1Ym1pdHRlZCB0ZXh0IHRvIHByZXNlcnZlIGNhc2UuIE5vdGU6IHdlIGRvbid0IG5lZWQgdG8gaHRtbEVudGl0aWVzIHRoZVxuICAgICAgICAvLyBzdHJpbmcgYmVjYXVzZSBSZWFjdCB3aWxsIHNhZmVseSBlbmNvZGUgdGhlIHRleHQgZm9yIHVzLlxuICAgICAgICBjb25zdCBsb3dlclN0ciA9IHN0ci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBmaWx0ZXJTdHIgPSB0aGlzLnByb3BzLmhpZ2hsaWdodFdvcmQudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcblxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBpaTtcbiAgICAgICAgd2hpbGUgKChpaSA9IGxvd2VyU3RyLmluZGV4T2YoZmlsdGVyU3RyLCBpKSkgPj0gMCkge1xuICAgICAgICAgICAgLy8gUHVzaCBhbnkgdGV4dCB3ZSBtaXNzZWQgKGZpcnN0IGJpdC9taWRkbGUgb2YgdGV4dClcbiAgICAgICAgICAgIGlmIChpaSA+IGkpIHtcbiAgICAgICAgICAgICAgICAvLyBQdXNoIGFueSB0ZXh0IHdlIGFyZW4ndCBoaWdobGlnaHRpbmcgKG1pZGRsZSBvZiB0ZXh0IG1hdGNoLCBvciBiZWdpbm5pbmcgb2YgdGV4dClcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCg8c3BhbiBrZXk9e2kgKyAnYmVnaW4nfT57c3RyLnN1YnN0cmluZyhpLCBpaSl9PC9zcGFuPik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGkgPSBpaTsgLy8gY29weSBvdmVyIGlpIG9ubHkgaWYgd2UgaGF2ZSBhIG1hdGNoICh0byBwcmVzZXJ2ZSBpIGZvciBlbmQtb2YtdGV4dCBtYXRjaGluZylcblxuICAgICAgICAgICAgLy8gSGlnaGxpZ2h0IHRoZSB3b3JkIHRoZSB1c2VyIGVudGVyZWRcbiAgICAgICAgICAgIGNvbnN0IHN1YnN0ciA9IHN0ci5zdWJzdHJpbmcoaSwgZmlsdGVyU3RyLmxlbmd0aCArIGkpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goPHNwYW4gY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfcm9vbVRpbGVfaGlnaGxpZ2h0JyBrZXk9e2kgKyAnYm9sZCd9PntzdWJzdHJ9PC9zcGFuPik7XG4gICAgICAgICAgICBpICs9IHN1YnN0ci5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoIGFueSB0ZXh0IHdlIG1pc3NlZCAoZW5kIG9mIHRleHQpXG4gICAgICAgIGlmIChpIDwgc3RyLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goPHNwYW4ga2V5PXtpICsgJ2VuZCd9PntzdHIuc3Vic3RyaW5nKGkpfTwvc3Bhbj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuYXZhdGFycy5CYXNlQXZhdGFyXCIpO1xuXG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5sYXN0QWN0aXZlVHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGh1bWFuVHMgPSBodW1hbml6ZVRpbWUodGhpcy5wcm9wcy5sYXN0QWN0aXZlVHMpO1xuICAgICAgICAgICAgdGltZXN0YW1wID0gPHNwYW4gY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfcm9vbVRpbGVfdGltZSc+e2h1bWFuVHN9PC9zcGFuPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGF2YXRhclNpemUgPSAzNjtcbiAgICAgICAgY29uc3QgYXZhdGFyID0gdGhpcy5wcm9wcy5tZW1iZXIuaXNFbWFpbFxuICAgICAgICAgICAgPyA8aW1nXG4gICAgICAgICAgICAgICAgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9pY29uLWVtYWlsLXBpbGwtYXZhdGFyLnN2Z1wiKX1cbiAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX0gaGVpZ2h0PXthdmF0YXJTaXplfSAvPlxuICAgICAgICAgICAgOiA8QmFzZUF2YXRhclxuICAgICAgICAgICAgICAgIHVybD17dGhpcy5wcm9wcy5tZW1iZXIuZ2V0TXhjQXZhdGFyVXJsKClcbiAgICAgICAgICAgICAgICAgICAgPyBtZWRpYUZyb21NeGModGhpcy5wcm9wcy5tZW1iZXIuZ2V0TXhjQXZhdGFyVXJsKCkpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoYXZhdGFyU2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsfVxuICAgICAgICAgICAgICAgIG5hbWU9e3RoaXMucHJvcHMubWVtYmVyLm5hbWV9XG4gICAgICAgICAgICAgICAgaWROYW1lPXt0aGlzLnByb3BzLm1lbWJlci51c2VySWR9XG4gICAgICAgICAgICAgICAgd2lkdGg9e2F2YXRhclNpemV9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXthdmF0YXJTaXplfSAvPjtcblxuICAgICAgICBsZXQgY2hlY2ttYXJrID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgLy8gVG8gcmVkdWNlIGZsaWNrZXJpbmcgd2UgcHV0IHRoZSAnc2VsZWN0ZWQnIHJvb20gdGlsZSBhYm92ZSB0aGUgcmVhbCBhdmF0YXJcbiAgICAgICAgICAgIGNoZWNrbWFyayA9IDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfcm9vbVRpbGVfc2VsZWN0ZWQnIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVG8gcmVkdWNlIGZsaWNrZXJpbmcgd2UgcHV0IHRoZSBjaGVja21hcmsgb24gdG9wIG9mIHRoZSBhY3R1YWwgYXZhdGFyIChwcmV2ZW50c1xuICAgICAgICAvLyB0aGUgYnJvd3NlciBmcm9tIHJlbG9hZGluZyB0aGUgaW1hZ2Ugc291cmNlIHdoZW4gdGhlIGF2YXRhciByZW1vdW50cykuXG4gICAgICAgIGNvbnN0IHN0YWNrZWRBdmF0YXIgPSAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19yb29tVGlsZV9hdmF0YXJTdGFjayc+XG4gICAgICAgICAgICAgICAge2F2YXRhcn1cbiAgICAgICAgICAgICAgICB7Y2hlY2ttYXJrfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGNhcHRpb24gPSB0aGlzLnByb3BzLm1lbWJlci5pc0VtYWlsXG4gICAgICAgICAgICA/IF90KFwiSW52aXRlIGJ5IGVtYWlsXCIpXG4gICAgICAgICAgICA6IHRoaXMuX2hpZ2hsaWdodE5hbWUodGhpcy5wcm9wcy5tZW1iZXIudXNlcklkKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19yb29tVGlsZScgb25DbGljaz17dGhpcy5fb25DbGlja30+XG4gICAgICAgICAgICAgICAge3N0YWNrZWRBdmF0YXJ9XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfSW52aXRlRGlhbG9nX3Jvb21UaWxlX25hbWVTdGFja1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3Jvb21UaWxlX25hbWUnPnt0aGlzLl9oaWdobGlnaHROYW1lKHRoaXMucHJvcHMubWVtYmVyLm5hbWUpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3Jvb21UaWxlX3VzZXJJZCc+e2NhcHRpb259PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIHt0aW1lc3RhbXB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJSW52aXRlRGlhbG9nUHJvcHMge1xuICAgIC8vIFRha2VzIGFuIGFycmF5IG9mIHVzZXIgSURzL2VtYWlscyB0byBpbnZpdGUuXG4gICAgb25GaW5pc2hlZDogKHRvSW52aXRlPzogc3RyaW5nW10pID0+IGFueTtcblxuICAgIC8vIFRoZSBraW5kIG9mIGludml0ZSBiZWluZyBwZXJmb3JtZWQuIEFzc3VtZWQgdG8gYmUgS0lORF9ETSBpZlxuICAgIC8vIG5vdCBwcm92aWRlZC5cbiAgICBraW5kOiBzdHJpbmcsXG5cbiAgICAvLyBUaGUgcm9vbSBJRCB0aGlzIGRpYWxvZyBpcyBmb3IuIE9ubHkgcmVxdWlyZWQgZm9yIEtJTkRfSU5WSVRFLlxuICAgIHJvb21JZDogc3RyaW5nLFxuXG4gICAgLy8gVGhlIGNhbGwgdG8gdHJhbnNmZXIuIE9ubHkgcmVxdWlyZWQgZm9yIEtJTkRfQ0FMTF9UUkFOU0ZFUi5cbiAgICBjYWxsOiBNYXRyaXhDYWxsLFxuXG4gICAgLy8gSW5pdGlhbCB2YWx1ZSB0byBwb3B1bGF0ZSB0aGUgZmlsdGVyIHdpdGhcbiAgICBpbml0aWFsVGV4dDogc3RyaW5nLFxufVxuXG5pbnRlcmZhY2UgSUludml0ZURpYWxvZ1N0YXRlIHtcbiAgICB0YXJnZXRzOiBSb29tTWVtYmVyW107IC8vIGFycmF5IG9mIE1lbWJlciBvYmplY3RzIChzZWUgaW50ZXJmYWNlIGFib3ZlKVxuICAgIGZpbHRlclRleHQ6IHN0cmluZztcbiAgICByZWNlbnRzOiB7IHVzZXI6IE1lbWJlciwgdXNlcklkOiBzdHJpbmcgfVtdO1xuICAgIG51bVJlY2VudHNTaG93bjogbnVtYmVyO1xuICAgIHN1Z2dlc3Rpb25zOiB7IHVzZXI6IE1lbWJlciwgdXNlcklkOiBzdHJpbmcgfVtdO1xuICAgIG51bVN1Z2dlc3Rpb25zU2hvd246IG51bWJlcjtcbiAgICBzZXJ2ZXJSZXN1bHRzTWl4aW46IHsgdXNlcjogTWVtYmVyLCB1c2VySWQ6IHN0cmluZyB9W107XG4gICAgdGhyZWVwaWRSZXN1bHRzTWl4aW46IHsgdXNlcjogTWVtYmVyLCB1c2VySWQ6IHN0cmluZ31bXTtcbiAgICBjYW5Vc2VJZGVudGl0eVNlcnZlcjogYm9vbGVhbjtcbiAgICB0cnlpbmdJZGVudGl0eVNlcnZlcjogYm9vbGVhbjtcbiAgICBjb25zdWx0Rmlyc3Q6IGJvb2xlYW47XG5cbiAgICAvLyBUaGVzZSB0d28gZmxhZ3MgYXJlIHVzZWQgZm9yIHRoZSAnR28nIGJ1dHRvbiB0byBjb21tdW5pY2F0ZSB3aGF0IGlzIGdvaW5nIG9uLlxuICAgIGJ1c3k6IGJvb2xlYW4sXG4gICAgZXJyb3JUZXh0OiBzdHJpbmcsXG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuSW52aXRlRGlhbG9nXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnZpdGVEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElJbnZpdGVEaWFsb2dQcm9wcywgSUludml0ZURpYWxvZ1N0YXRlPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAga2luZDogS0lORF9ETSxcbiAgICAgICAgaW5pdGlhbFRleHQ6IFwiXCIsXG4gICAgfTtcblxuICAgIF9kZWJvdW5jZVRpbWVyOiBOb2RlSlMuVGltZW91dCA9IG51bGw7IC8vIGFjdHVhbGx5IG51bWJlciBiZWNhdXNlIHdlJ3JlIGluIHRoZSBicm93c2VyXG4gICAgX2VkaXRvclJlZjogYW55ID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBpZiAoKHByb3BzLmtpbmQgPT09IEtJTkRfSU5WSVRFKSAmJiAhcHJvcHMucm9vbUlkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXaGVuIHVzaW5nIEtJTkRfSU5WSVRFIGEgcm9vbUlkIGlzIHJlcXVpcmVkIGZvciBhbiBJbnZpdGVEaWFsb2dcIik7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcHMua2luZCA9PT0gS0lORF9DQUxMX1RSQU5TRkVSICYmICFwcm9wcy5jYWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXaGVuIHVzaW5nIEtJTkRfQ0FMTF9UUkFOU0ZFUiBhIGNhbGwgaXMgcmVxdWlyZWQgZm9yIGFuIEludml0ZURpYWxvZ1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFscmVhZHlJbnZpdGVkID0gbmV3IFNldChbTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLCBTZGtDb25maWcuZ2V0KClbJ3dlbGNvbWVVc2VySWQnXV0pO1xuICAgICAgICBpZiAocHJvcHMucm9vbUlkKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocHJvcHMucm9vbUlkKTtcbiAgICAgICAgICAgIGlmICghcm9vbSkgdGhyb3cgbmV3IEVycm9yKFwiUm9vbSBJRCBnaXZlbiB0byBJbnZpdGVEaWFsb2cgZG9lcyBub3QgbG9vayBsaWtlIGEgcm9vbVwiKTtcbiAgICAgICAgICAgIHJvb20uZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwKCdpbnZpdGUnKS5mb3JFYWNoKG0gPT4gYWxyZWFkeUludml0ZWQuYWRkKG0udXNlcklkKSk7XG4gICAgICAgICAgICByb29tLmdldE1lbWJlcnNXaXRoTWVtYmVyc2hpcCgnam9pbicpLmZvckVhY2gobSA9PiBhbHJlYWR5SW52aXRlZC5hZGQobS51c2VySWQpKTtcbiAgICAgICAgICAgIC8vIGFkZCBiYW5uZWQgdXNlcnMsIHNvIHdlIGRvbid0IHRyeSB0byBpbnZpdGUgdGhlbVxuICAgICAgICAgICAgcm9vbS5nZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAoJ2JhbicpLmZvckVhY2gobSA9PiBhbHJlYWR5SW52aXRlZC5hZGQobS51c2VySWQpKTtcblxuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFja0JlZ2luSW52aXRlKHByb3BzLnJvb21JZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdGFyZ2V0czogW10sIC8vIGFycmF5IG9mIE1lbWJlciBvYmplY3RzIChzZWUgaW50ZXJmYWNlIGFib3ZlKVxuICAgICAgICAgICAgZmlsdGVyVGV4dDogdGhpcy5wcm9wcy5pbml0aWFsVGV4dCxcbiAgICAgICAgICAgIHJlY2VudHM6IEludml0ZURpYWxvZy5idWlsZFJlY2VudHMoYWxyZWFkeUludml0ZWQpLFxuICAgICAgICAgICAgbnVtUmVjZW50c1Nob3duOiBJTklUSUFMX1JPT01TX1NIT1dOLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbnM6IHRoaXMuX2J1aWxkU3VnZ2VzdGlvbnMoYWxyZWFkeUludml0ZWQpLFxuICAgICAgICAgICAgbnVtU3VnZ2VzdGlvbnNTaG93bjogSU5JVElBTF9ST09NU19TSE9XTixcbiAgICAgICAgICAgIHNlcnZlclJlc3VsdHNNaXhpbjogW10sXG4gICAgICAgICAgICB0aHJlZXBpZFJlc3VsdHNNaXhpbjogW10sXG4gICAgICAgICAgICBjYW5Vc2VJZGVudGl0eVNlcnZlcjogISFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgICAgIHRyeWluZ0lkZW50aXR5U2VydmVyOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbnN1bHRGaXJzdDogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIFRoZXNlIHR3byBmbGFncyBhcmUgdXNlZCBmb3IgdGhlICdHbycgYnV0dG9uIHRvIGNvbW11bmljYXRlIHdoYXQgaXMgZ29pbmcgb24uXG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yVGV4dDogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9lZGl0b3JSZWYgPSBjcmVhdGVSZWYoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaW5pdGlhbFRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN1Z2dlc3Rpb25zKHRoaXMucHJvcHMuaW5pdGlhbFRleHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNvbnN1bHRGaXJzdENoYW5nZSA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb25zdWx0Rmlyc3Q6IGV2LnRhcmdldC5jaGVja2VkfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGJ1aWxkUmVjZW50cyhleGNsdWRlZFRhcmdldElkczogU2V0PHN0cmluZz4pOiB7dXNlcklkOiBzdHJpbmcsIHVzZXI6IFJvb21NZW1iZXIsIGxhc3RBY3RpdmU6IG51bWJlcn1bXSB7XG4gICAgICAgIGNvbnN0IHJvb21zID0gRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVuaXF1ZVJvb21zV2l0aEluZGl2aWR1YWxzKCk7IC8vIG1hcCBvZiB1c2VySWQgPT4ganMtc2RrIFJvb21cblxuICAgICAgICAvLyBBbHNvIHB1bGwgaW4gYWxsIHRoZSByb29tcyB0YWdnZWQgYXMgRGVmYXVsdFRhZ0lELkRNIHNvIHdlIGRvbid0IG1pc3MgYW55dGhpbmcuIFNvbWV0aW1lcyB0aGVcbiAgICAgICAgLy8gcm9vbSBsaXN0IGRvZXNuJ3QgdGFnIHRoZSByb29tIGZvciB0aGUgRE1Sb29tTWFwLCBidXQgZG9lcyBmb3IgdGhlIHJvb20gbGlzdC5cbiAgICAgICAgY29uc3QgZG1UYWdnZWRSb29tcyA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzW0RlZmF1bHRUYWdJRC5ETV0gfHwgW107XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGRtUm9vbSBvZiBkbVRhZ2dlZFJvb21zKSB7XG4gICAgICAgICAgICBjb25zdCBvdGhlck1lbWJlcnMgPSBkbVJvb20uZ2V0Sm9pbmVkTWVtYmVycygpLmZpbHRlcih1ID0+IHUudXNlcklkICE9PSBteVVzZXJJZCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBvdGhlck1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAocm9vbXNbbWVtYmVyLnVzZXJJZF0pIGNvbnRpbnVlOyAvLyBhbHJlYWR5IGhhdmUgYSByb29tXG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEFkZGluZyBETSByb29tIGZvciAke21lbWJlci51c2VySWR9IGFzICR7ZG1Sb29tLnJvb21JZH0gZnJvbSB0YWcsIG5vdCBETSBtYXBgKTtcbiAgICAgICAgICAgICAgICByb29tc1ttZW1iZXIudXNlcklkXSA9IGRtUm9vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlY2VudHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCB1c2VySWQgaW4gcm9vbXMpIHtcbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgdXNlciBJRHMgdGhhdCBhcmUgYWxyZWFkeSBpbiB0aGUgcm9vbSAvIHNob3VsZCBiZSBleGNsdWRlZFxuICAgICAgICAgICAgaWYgKGV4Y2x1ZGVkVGFyZ2V0SWRzLmhhcyh1c2VySWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbSW52aXRlOlJlY2VudHNdIEV4Y2x1ZGluZyAke3VzZXJJZH0gZnJvbSByZWNlbnRzYCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSByb29tc1t1c2VySWRdO1xuICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gcm9vbS5nZXRNZW1iZXIodXNlcklkKTtcbiAgICAgICAgICAgIGlmICghbWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgLy8ganVzdCBza2lwIHBlb3BsZSB3aG8gZG9uJ3QgaGF2ZSBtZW1iZXJzaGlwcyBmb3Igc29tZSByZWFzb25cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtJbnZpdGU6UmVjZW50c10gJHt1c2VySWR9IGlzIG1pc3NpbmcgYSBtZW1iZXIgb2JqZWN0IGluIHRoZWlyIG93biBETSAoJHtyb29tLnJvb21JZH0pYCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGxhc3QgdGltZXN0YW1wIGZvciBhIG1lc3NhZ2UgZXZlbnRcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaFR5cGVzID0gW1wibS5yb29tLm1lc3NhZ2VcIiwgXCJtLnJvb20uZW5jcnlwdGVkXCIsIFwibS5zdGlja2VyXCJdO1xuICAgICAgICAgICAgY29uc3QgbWF4U2VhcmNoRXZlbnRzID0gMjA7IC8vIHRvIHByZXZlbnQgdHJhdmVyc2luZyBoaXN0b3J5XG4gICAgICAgICAgICBsZXQgbGFzdEV2ZW50VHMgPSAwO1xuICAgICAgICAgICAgaWYgKHJvb20udGltZWxpbmUgJiYgcm9vbS50aW1lbGluZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gcm9vbS50aW1lbGluZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldiA9IHJvb20udGltZWxpbmVbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWFyY2hUeXBlcy5pbmNsdWRlcyhldi5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0RXZlbnRUcyA9IGV2LmdldFRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocm9vbS50aW1lbGluZS5sZW5ndGggLSBpID4gbWF4U2VhcmNoRXZlbnRzKSBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWxhc3RFdmVudFRzKSB7XG4gICAgICAgICAgICAgICAgLy8gc29tZXRoaW5nIHdlaXJkIGlzIGdvaW5nIG9uIHdpdGggdGhpcyByb29tXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbSW52aXRlOlJlY2VudHNdICR7dXNlcklkfSAoJHtyb29tLnJvb21JZH0pIGhhcyBhIHdlaXJkIGxhc3QgdGltZXN0YW1wOiAke2xhc3RFdmVudFRzfWApO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZWNlbnRzLnB1c2goe3VzZXJJZCwgdXNlcjogbWVtYmVyLCBsYXN0QWN0aXZlOiBsYXN0RXZlbnRUc30pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcmVjZW50cykgY29uc29sZS53YXJuKFwiW0ludml0ZTpSZWNlbnRzXSBObyByZWNlbnRzIHRvIHN1Z2dlc3QhXCIpO1xuXG4gICAgICAgIC8vIFNvcnQgdGhlIHJlY2VudHMgYnkgbGFzdCBhY3RpdmUgdG8gc2F2ZSB1cyB0aW1lIGxhdGVyXG4gICAgICAgIHJlY2VudHMuc29ydCgoYSwgYikgPT4gYi5sYXN0QWN0aXZlIC0gYS5sYXN0QWN0aXZlKTtcblxuICAgICAgICByZXR1cm4gcmVjZW50cztcbiAgICB9XG5cbiAgICBfYnVpbGRTdWdnZXN0aW9ucyhleGNsdWRlZFRhcmdldElkczogU2V0PHN0cmluZz4pOiB7dXNlcklkOiBzdHJpbmcsIHVzZXI6IFJvb21NZW1iZXJ9W10ge1xuICAgICAgICBjb25zdCBtYXhDb25zaWRlcmVkTWVtYmVycyA9IDIwMDtcbiAgICAgICAgY29uc3Qgam9pbmVkUm9vbXMgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbXMoKVxuICAgICAgICAgICAgLmZpbHRlcihyID0+IHIuZ2V0TXlNZW1iZXJzaGlwKCkgPT09ICdqb2luJyAmJiByLmdldEpvaW5lZE1lbWJlckNvdW50KCkgPD0gbWF4Q29uc2lkZXJlZE1lbWJlcnMpO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlcyB7IHVzZXJJZDoge21lbWJlciwgcm9vbXNbXX0gfVxuICAgICAgICBjb25zdCBtZW1iZXJSb29tcyA9IGpvaW5lZFJvb21zLnJlZHVjZSgobWVtYmVycywgcm9vbSkgPT4ge1xuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCBETXMgKHdlJ2xsIGhhbmRsZSB0aGVzZSBpbiB0aGUgcmVjZW50cyBzZWN0aW9uKVxuICAgICAgICAgICAgaWYgKERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbS5yb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7IC8vIERvIG5vdGhpbmdcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgam9pbmVkTWVtYmVycyA9IHJvb20uZ2V0Sm9pbmVkTWVtYmVycygpLmZpbHRlcih1ID0+ICFleGNsdWRlZFRhcmdldElkcy5oYXModS51c2VySWQpKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIGpvaW5lZE1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgb3V0IHVzZXIgSURzIHRoYXQgYXJlIGFscmVhZHkgaW4gdGhlIHJvb20gLyBzaG91bGQgYmUgZXhjbHVkZWRcbiAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZWRUYXJnZXRJZHMuaGFzKG1lbWJlci51c2VySWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghbWVtYmVyc1ttZW1iZXIudXNlcklkXSkge1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW21lbWJlci51c2VySWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyOiBtZW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmFjayB0aGUgcm9vbSBzaXplIG9mIHRoZSAncGlja2VkJyBtZW1iZXIgc28gd2UgY2FuIHVzZSB0aGUgcHJvZmlsZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHNtYWxsZXN0IHJvb20gKGxpa2VseSBhIERNKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBpY2tlZE1lbWJlclJvb21TaXplOiByb29tLmdldEpvaW5lZE1lbWJlckNvdW50KCksXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tczogW10sXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbWVtYmVyc1ttZW1iZXIudXNlcklkXS5yb29tcy5wdXNoKHJvb20pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJvb20uZ2V0Sm9pbmVkTWVtYmVyQ291bnQoKSA8IG1lbWJlcnNbbWVtYmVyLnVzZXJJZF0ucGlja2VkTWVtYmVyUm9vbVNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1ttZW1iZXIudXNlcklkXS5tZW1iZXIgPSBtZW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbbWVtYmVyLnVzZXJJZF0ucGlja2VkTWVtYmVyUm9vbVNpemUgPSByb29tLmdldEpvaW5lZE1lbWJlckNvdW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7XG4gICAgICAgIH0sIHt9KTtcblxuICAgICAgICAvLyBHZW5lcmF0ZXMgeyB1c2VySWQ6IHttZW1iZXIsIG51bVJvb21zLCBzY29yZX0gfVxuICAgICAgICBjb25zdCBtZW1iZXJTY29yZXMgPSBPYmplY3QudmFsdWVzKG1lbWJlclJvb21zKS5yZWR1Y2UoKHNjb3JlcywgZW50cnk6IHttZW1iZXI6IFJvb21NZW1iZXIsIHJvb21zOiBSb29tW119KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBudW1NZW1iZXJzVG90YWwgPSBlbnRyeS5yb29tcy5yZWR1Y2UoKGMsIHIpID0+IGMgKyByLmdldEpvaW5lZE1lbWJlckNvdW50KCksIDApO1xuICAgICAgICAgICAgY29uc3QgbWF4UmFuZ2UgPSBtYXhDb25zaWRlcmVkTWVtYmVycyAqIGVudHJ5LnJvb21zLmxlbmd0aDtcbiAgICAgICAgICAgIHNjb3Jlc1tlbnRyeS5tZW1iZXIudXNlcklkXSA9IHtcbiAgICAgICAgICAgICAgICBtZW1iZXI6IGVudHJ5Lm1lbWJlcixcbiAgICAgICAgICAgICAgICBudW1Sb29tczogZW50cnkucm9vbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNjb3JlOiBNYXRoLm1heCgwLCBNYXRoLnBvdygxIC0gKG51bU1lbWJlcnNUb3RhbCAvIG1heFJhbmdlKSwgNSkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBzY29yZXM7XG4gICAgICAgIH0sIHt9KTtcblxuICAgICAgICAvLyBOb3cgdGhhdCB3ZSBoYXZlIHNjb3JlcyBmb3IgYmVpbmcgaW4gcm9vbXMsIGJvb3N0IHRob3NlIHBlb3BsZSB3aG8gaGF2ZSBzZW50IG1lc3NhZ2VzXG4gICAgICAgIC8vIHJlY2VudGx5LCBhcyBhIHdheSB0byBpbXByb3ZlIHRoZSBxdWFsaXR5IG9mIHN1Z2dlc3Rpb25zLiBXZSBkbyB0aGlzIGJ5IGNoZWNraW5nIGV2ZXJ5XG4gICAgICAgIC8vIHJvb20gdG8gc2VlIHdobyBoYXMgc2VudCBhIG1lc3NhZ2UgaW4gdGhlIGxhc3QgZmV3IGhvdXJzLCBhbmQgZ2l2aW5nIHRoZW0gYSBzY29yZVxuICAgICAgICAvLyB3aGljaCBjb3JyZWxhdGVzIHRvIHRoZSBmcmVzaG5lc3Mgb2YgdGhlaXIgbWVzc2FnZS4gSW4gdGhlb3J5LCB0aGlzIHJlc3VsdHMgaW4gc3VnZ2VzdGlvbnNcbiAgICAgICAgLy8gd2hpY2ggYXJlIGNsb3NlciB0byBcImNvbnRpbnVlIHRoaXMgY29udmVyc2F0aW9uXCIgcmF0aGVyIHRoYW4gXCJ0aGlzIHBlcnNvbiBleGlzdHNcIi5cbiAgICAgICAgY29uc3QgdHJ1ZUpvaW5lZFJvb21zID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb21zKCkuZmlsdGVyKHIgPT4gci5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gJ2pvaW4nKTtcbiAgICAgICAgY29uc3Qgbm93ID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgY29uc3QgZWFybGllc3RBZ2VDb25zaWRlcmVkID0gbm93IC0gKDYwICogNjAgKiAxMDAwKTsgLy8gMSBob3VyIGFnb1xuICAgICAgICBjb25zdCBtYXhNZXNzYWdlc0NvbnNpZGVyZWQgPSA1MDsgLy8gc28gd2UgZG9uJ3QgaXRlcmF0ZSBvdmVyIGEgaHVnZSBhbW91bnQgb2YgdHJhZmZpY1xuICAgICAgICBjb25zdCBsYXN0U3Bva2UgPSB7fTsgLy8gdXNlcklkOiB0aW1lc3RhbXBcbiAgICAgICAgY29uc3QgbGFzdFNwb2tlTWVtYmVycyA9IHt9OyAvLyB1c2VySWQ6IHJvb20gbWVtYmVyXG4gICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiB0cnVlSm9pbmVkUm9vbXMpIHtcbiAgICAgICAgICAgIC8vIFNraXAgbG93IHByaW9yaXR5IHJvb21zIGFuZCBETXNcbiAgICAgICAgICAgIGNvbnN0IGlzRG0gPSBETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKHJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhyb29tLnRhZ3MpLmluY2x1ZGVzKFwibS5sb3dwcmlvcml0eVwiKSB8fCBpc0RtKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IHJvb20uZ2V0TGl2ZVRpbWVsaW5lKCkuZ2V0RXZlbnRzKCk7IC8vIHRpbWVsaW5lcyBhcmUgbW9zdCByZWNlbnQgbGFzdFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGV2ZW50cy5sZW5ndGggLSAxOyBpID49IE1hdGgubWF4KDAsIGV2ZW50cy5sZW5ndGggLSBtYXhNZXNzYWdlc0NvbnNpZGVyZWQpOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBldiA9IGV2ZW50c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZWRUYXJnZXRJZHMuaGFzKGV2LmdldFNlbmRlcigpKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGV2LmdldFRzKCkgPD0gZWFybGllc3RBZ2VDb25zaWRlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBnaXZlIHVwOiBhbGwgZXZlbnRzIGZyb20gaGVyZSBvbiBvdXQgYXJlIHRvbyBvbGRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWxhc3RTcG9rZVtldi5nZXRTZW5kZXIoKV0gfHwgbGFzdFNwb2tlW2V2LmdldFNlbmRlcigpXSA8IGV2LmdldFRzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNwb2tlW2V2LmdldFNlbmRlcigpXSA9IGV2LmdldFRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTcG9rZU1lbWJlcnNbZXYuZ2V0U2VuZGVyKCldID0gcm9vbS5nZXRNZW1iZXIoZXYuZ2V0U2VuZGVyKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHVzZXJJZCBpbiBsYXN0U3Bva2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gbGFzdFNwb2tlW3VzZXJJZF07XG4gICAgICAgICAgICBjb25zdCBtZW1iZXIgPSBsYXN0U3Bva2VNZW1iZXJzW3VzZXJJZF07XG4gICAgICAgICAgICBpZiAoIW1lbWJlcikgY29udGludWU7IC8vIHNraXAgcGVvcGxlIHdlIHNvbWVob3cgZG9uJ3QgaGF2ZSBwcm9maWxlcyBmb3JcblxuICAgICAgICAgICAgLy8gU2NvcmVzIGZyb20gYmVpbmcgaW4gYSByb29tIGdpdmUgYSAnZ29vZCcgc2NvcmUgb2YgYWJvdXQgMS4wLTEuNSwgc28gZm9yIG91clxuICAgICAgICAgICAgLy8gYm9vc3Qgd2UnbGwgdHJ5IGFuZCBhd2FyZCBhdCBsZWFzdCArMS4wIGZvciBtYWtpbmcgdGhlIGxpc3QsIHdpdGggKzQuMCBiZWluZ1xuICAgICAgICAgICAgLy8gYW4gYXBwcm94aW1hdGUgbWF4aW11bSBmb3IgYmVpbmcgc2VsZWN0ZWQuXG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZUZyb21Ob3cgPSBNYXRoLmFicyhub3cgLSB0cyk7IC8vIGFicyB0byBhY2NvdW50IGZvciBzbGlnaHQgZnV0dXJlIG1lc3NhZ2VzXG4gICAgICAgICAgICBjb25zdCBpbnZlcnNlVGltZSA9IChub3cgLSBlYXJsaWVzdEFnZUNvbnNpZGVyZWQpIC0gZGlzdGFuY2VGcm9tTm93O1xuICAgICAgICAgICAgY29uc3Qgc2NvcmVCb29zdCA9IE1hdGgubWF4KDEsIGludmVyc2VUaW1lIC8gKDE1ICogNjAgKiAxMDAwKSk7IC8vIDE1bWluIHNlZ21lbnRzIHRvIGtlZXAgc2NvcmVzIHNhbmVcblxuICAgICAgICAgICAgbGV0IHJlY29yZCA9IG1lbWJlclNjb3Jlc1t1c2VySWRdO1xuICAgICAgICAgICAgaWYgKCFyZWNvcmQpIHJlY29yZCA9IG1lbWJlclNjb3Jlc1t1c2VySWRdID0ge3Njb3JlOiAwfTtcbiAgICAgICAgICAgIHJlY29yZC5tZW1iZXIgPSBtZW1iZXI7XG4gICAgICAgICAgICByZWNvcmQuc2NvcmUgKz0gc2NvcmVCb29zdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1lbWJlcnMgPSBPYmplY3QudmFsdWVzKG1lbWJlclNjb3Jlcyk7XG4gICAgICAgIG1lbWJlcnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYgKGEuc2NvcmUgPT09IGIuc2NvcmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoYS5udW1Sb29tcyA9PT0gYi5udW1Sb29tcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5tZW1iZXIudXNlcklkLmxvY2FsZUNvbXBhcmUoYi5tZW1iZXIudXNlcklkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYi5udW1Sb29tcyAtIGEubnVtUm9vbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYi5zY29yZSAtIGEuc2NvcmU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBtZW1iZXJzLm1hcChtID0+ICh7dXNlcklkOiBtLm1lbWJlci51c2VySWQsIHVzZXI6IG0ubWVtYmVyfSkpO1xuICAgIH1cblxuICAgIF9zaG91bGRBYm9ydEFmdGVySW52aXRlRXJyb3IocmVzdWx0KTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGZhaWxlZFVzZXJzID0gT2JqZWN0LmtleXMocmVzdWx0LnN0YXRlcykuZmlsdGVyKGEgPT4gcmVzdWx0LnN0YXRlc1thXSA9PT0gJ2Vycm9yJyk7XG4gICAgICAgIGlmIChmYWlsZWRVc2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBpbnZpdGUgdXNlcnM6IFwiLCByZXN1bHQpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIkZhaWxlZCB0byBpbnZpdGUgdGhlIGZvbGxvd2luZyB1c2VycyB0byBjaGF0OiAlKGNzdlVzZXJzKXNcIiwge1xuICAgICAgICAgICAgICAgICAgICBjc3ZVc2VyczogZmFpbGVkVXNlcnMuam9pbihcIiwgXCIpLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gYWJvcnRcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgX2NvbnZlcnRGaWx0ZXIoKTogTWVtYmVyW10ge1xuICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlcmUncyBhbnl0aGluZyB0byBjb252ZXJ0IGZpcnN0XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5maWx0ZXJUZXh0IHx8ICF0aGlzLnN0YXRlLmZpbHRlclRleHQuaW5jbHVkZXMoJ0AnKSkgcmV0dXJuIHRoaXMuc3RhdGUudGFyZ2V0cyB8fCBbXTtcblxuICAgICAgICBsZXQgbmV3TWVtYmVyOiBNZW1iZXI7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZpbHRlclRleHQuc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgICAgICAvLyBBc3N1bWUgbXhpZFxuICAgICAgICAgICAgbmV3TWVtYmVyID0gbmV3IERpcmVjdG9yeU1lbWJlcih7dXNlcl9pZDogdGhpcy5zdGF0ZS5maWx0ZXJUZXh0LCBkaXNwbGF5X25hbWU6IG51bGwsIGF2YXRhcl91cmw6IG51bGx9KTtcbiAgICAgICAgfSBlbHNlIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5JZGVudGl0eVNlcnZlcikpIHtcbiAgICAgICAgICAgIC8vIEFzc3VtZSBlbWFpbFxuICAgICAgICAgICAgbmV3TWVtYmVyID0gbmV3IFRocmVlcGlkTWVtYmVyKHRoaXMuc3RhdGUuZmlsdGVyVGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3VGFyZ2V0cyA9IFsuLi4odGhpcy5zdGF0ZS50YXJnZXRzIHx8IFtdKSwgbmV3TWVtYmVyXTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGFyZ2V0czogbmV3VGFyZ2V0cywgZmlsdGVyVGV4dDogJyd9KTtcbiAgICAgICAgcmV0dXJuIG5ld1RhcmdldHM7XG4gICAgfVxuXG4gICAgX3N0YXJ0RG0gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCB0YXJnZXRzID0gdGhpcy5fY29udmVydEZpbHRlcigpO1xuICAgICAgICBjb25zdCB0YXJnZXRJZHMgPSB0YXJnZXRzLm1hcCh0ID0+IHQudXNlcklkKTtcblxuICAgICAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhbHJlYWR5IGEgRE0gd2l0aCB0aGVzZSBwZW9wbGUgYW5kIHJldXNlIGl0IGlmIHBvc3NpYmxlLlxuICAgICAgICBsZXQgZXhpc3RpbmdSb29tOiBSb29tO1xuICAgICAgICBpZiAodGFyZ2V0SWRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgZXhpc3RpbmdSb29tID0gZmluZERNRm9yVXNlcihjbGllbnQsIHRhcmdldElkc1swXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleGlzdGluZ1Jvb20gPSBETVJvb21NYXAuc2hhcmVkKCkuZ2V0RE1Sb29tRm9ySWRlbnRpZmllcnModGFyZ2V0SWRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhpc3RpbmdSb29tKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogZXhpc3RpbmdSb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICBzaG91bGRfcGVlazogZmFsc2UsXG4gICAgICAgICAgICAgICAgam9pbmluZzogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3JlYXRlUm9vbU9wdGlvbnMgPSB7aW5saW5lRXJyb3JzOiB0cnVlfSBhcyBhbnk7IC8vIFhYWDogVHlwZSBvdXQgYGNyZWF0ZVJvb21PcHRpb25zYFxuXG4gICAgICAgIGlmIChwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQoKSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciBhbGwgdXNlcnMgaGF2ZSB1cGxvYWRlZCBkZXZpY2Uga2V5cyBiZWZvcmUuXG4gICAgICAgICAgICAvLyBJZiBzbywgZW5hYmxlIGVuY3J5cHRpb24gaW4gdGhlIG5ldyByb29tLlxuICAgICAgICAgICAgY29uc3QgaGFzM1BpZE1lbWJlcnMgPSB0YXJnZXRzLnNvbWUodCA9PiB0IGluc3RhbmNlb2YgVGhyZWVwaWRNZW1iZXIpO1xuICAgICAgICAgICAgaWYgKCFoYXMzUGlkTWVtYmVycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFsbEhhdmVEZXZpY2VLZXlzID0gYXdhaXQgY2FuRW5jcnlwdFRvQWxsVXNlcnMoY2xpZW50LCB0YXJnZXRJZHMpO1xuICAgICAgICAgICAgICAgIGlmIChhbGxIYXZlRGV2aWNlS2V5cykge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVSb29tT3B0aW9ucy5lbmNyeXB0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIGEgdHJhZGl0aW9uYWwgRE0gYW5kIGNyZWF0ZSB0aGUgcm9vbSBpZiByZXF1aXJlZC5cbiAgICAgICAgLy8gVE9ETzogW0Nhbm9uaWNhbCBETXNdIFJlbW92ZSB0aGlzIGNoZWNrIGFuZCBpbnN0ZWFkIGp1c3QgY3JlYXRlIHRoZSBtdWx0aS1wZXJzb24gRE1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGlzU2VsZiA9IHRhcmdldElkcy5sZW5ndGggPT09IDEgJiYgdGFyZ2V0SWRzWzBdID09PSBjbGllbnQuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0SWRzLmxlbmd0aCA9PT0gMSAmJiAhaXNTZWxmKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlUm9vbU9wdGlvbnMuZG1Vc2VySWQgPSB0YXJnZXRJZHNbMF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRJZHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZVJvb21PcHRpb25zLmNyZWF0ZU9wdHMgPSB0YXJnZXRJZHMucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAocm9vbU9wdGlvbnMsIGFkZHJlc3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBnZXRBZGRyZXNzVHlwZShhZGRyZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnZW1haWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW52aXRlOiBJSW52aXRlM1BJRCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRfc2VydmVyOiBjbGllbnQuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lZGl1bTogJ2VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21PcHRpb25zLmludml0ZV8zcGlkLnB1c2goaW52aXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ214LXVzZXItaWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbU9wdGlvbnMuaW52aXRlLnB1c2goYWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbU9wdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgaW52aXRlOiBbXSwgaW52aXRlXzNwaWQ6IFtdIH0sXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCBjcmVhdGVSb29tKGNyZWF0ZVJvb21PcHRpb25zKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXCJXZSBjb3VsZG4ndCBjcmVhdGUgeW91ciBETS5cIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfaW52aXRlVXNlcnMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgdGhpcy5fY29udmVydEZpbHRlcigpO1xuICAgICAgICBjb25zdCB0YXJnZXRzID0gdGhpcy5fY29udmVydEZpbHRlcigpO1xuICAgICAgICBjb25zdCB0YXJnZXRJZHMgPSB0YXJnZXRzLm1hcCh0ID0+IHQudXNlcklkKTtcblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmaW5kIHRoZSByb29tIHRvIGludml0ZSB1c2VycyB0b1wiKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXCJTb21ldGhpbmcgd2VudCB3cm9uZyB0cnlpbmcgdG8gaW52aXRlIHRoZSB1c2Vycy5cIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBpbnZpdGVNdWx0aXBsZVRvUm9vbSh0aGlzLnByb3BzLnJvb21JZCwgdGFyZ2V0SWRzKVxuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFja1NlbmRJbnZpdGUoc3RhcnRUaW1lLCB0aGlzLnByb3BzLnJvb21JZCwgdGFyZ2V0SWRzLmxlbmd0aCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3Nob3VsZEFib3J0QWZ0ZXJJbnZpdGVFcnJvcihyZXN1bHQpKSB7IC8vIGhhbmRsZXMgc2V0dGluZyBlcnJvciBtZXNzYWdlIHRvb1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2xpLmlzUm9vbUVuY3J5cHRlZCh0aGlzLnByb3BzLnJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2aXNpYmlsaXR5RXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgXCJtLnJvb20uaGlzdG9yeV92aXNpYmlsaXR5XCIsIFwiXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2aXNpYmlsaXR5ID0gdmlzaWJpbGl0eUV2ZW50ICYmIHZpc2liaWxpdHlFdmVudC5nZXRDb250ZW50KCkgJiZcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eUV2ZW50LmdldENvbnRlbnQoKS5oaXN0b3J5X3Zpc2liaWxpdHk7XG4gICAgICAgICAgICAgICAgaWYgKHZpc2liaWxpdHkgPT0gXCJ3b3JsZF9yZWFkYWJsZVwiIHx8IHZpc2liaWxpdHkgPT0gXCJzaGFyZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnZpdGVkVXNlcnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbYWRkciwgc3RhdGVdIG9mIE9iamVjdC5lbnRyaWVzKHJlc3VsdC5zdGF0ZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IFwiaW52aXRlZFwiICYmIGdldEFkZHJlc3NUeXBlKGFkZHIpID09PSBcIm14LXVzZXItaWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludml0ZWRVc2Vycy5wdXNoKGFkZHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2hhcmluZyBoaXN0b3J5IHdpdGhcIiwgaW52aXRlZFVzZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpLnNlbmRTaGFyZWRIaXN0b3J5S2V5cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbUlkLCBpbnZpdGVkVXNlcnMsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiV2UgY291bGRuJ3QgaW52aXRlIHRob3NlIHVzZXJzLiBQbGVhc2UgY2hlY2sgdGhlIHVzZXJzIHlvdSB3YW50IHRvIGludml0ZSBhbmQgdHJ5IGFnYWluLlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfdHJhbnNmZXJDYWxsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLl9jb252ZXJ0RmlsdGVyKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSB0aGlzLl9jb252ZXJ0RmlsdGVyKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldElkcyA9IHRhcmdldHMubWFwKHQgPT4gdC51c2VySWQpO1xuICAgICAgICBpZiAodGFyZ2V0SWRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXCJBIGNhbGwgY2FuIG9ubHkgYmUgdHJhbnNmZXJyZWQgdG8gYSBzaW5nbGUgdXNlci5cIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNvbnN1bHRGaXJzdCkge1xuICAgICAgICAgICAgY29uc3QgZG1Sb29tSWQgPSBhd2FpdCBlbnN1cmVETUV4aXN0cyhNYXRyaXhDbGllbnRQZWcuZ2V0KCksIHRhcmdldElkc1swXSk7XG5cbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAncGxhY2VfY2FsbCcsXG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5wcm9wcy5jYWxsLnR5cGUsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogZG1Sb29tSWQsXG4gICAgICAgICAgICAgICAgdHJhbnNmZXJlZTogdGhpcy5wcm9wcy5jYWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogZG1Sb29tSWQsXG4gICAgICAgICAgICAgICAgc2hvdWxkX3BlZWs6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGpvaW5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wcm9wcy5jYWxsLnRyYW5zZmVyKHRhcmdldElkc1swXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogZmFsc2V9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXCJGYWlsZWQgdG8gdHJhbnNmZXIgY2FsbFwiKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25LZXlEb3duID0gKGUpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYnVzeSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGUudGFyZ2V0LnZhbHVlLnRyaW0oKTtcbiAgICAgICAgY29uc3QgaGFzTW9kaWZpZXJzID0gZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkgfHwgZS5tZXRhS2V5O1xuICAgICAgICBpZiAoIXZhbHVlICYmIHRoaXMuc3RhdGUudGFyZ2V0cy5sZW5ndGggPiAwICYmIGUua2V5ID09PSBLZXkuQkFDS1NQQUNFICYmICFoYXNNb2RpZmllcnMpIHtcbiAgICAgICAgICAgIC8vIHdoZW4gdGhlIGZpZWxkIGlzIGVtcHR5IGFuZCB0aGUgdXNlciBoaXRzIGJhY2tzcGFjZSByZW1vdmUgdGhlIHJpZ2h0LW1vc3QgdGFyZ2V0XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVNZW1iZXIodGhpcy5zdGF0ZS50YXJnZXRzW3RoaXMuc3RhdGUudGFyZ2V0cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgJiYgZS5rZXkgPT09IEtleS5FTlRFUiAmJiAhaGFzTW9kaWZpZXJzKSB7XG4gICAgICAgICAgICAvLyB3aGVuIHRoZSB1c2VyIGhpdHMgZW50ZXIgd2l0aCBzb21ldGhpbmcgaW4gdGhlaXIgZmllbGQgdHJ5IHRvIGNvbnZlcnQgaXRcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnZlcnRGaWx0ZXIoKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSAmJiBlLmtleSA9PT0gS2V5LlNQQUNFICYmICFoYXNNb2RpZmllcnMgJiYgdmFsdWUuaW5jbHVkZXMoXCJAXCIpICYmICF2YWx1ZS5pbmNsdWRlcyhcIiBcIikpIHtcbiAgICAgICAgICAgIC8vIHdoZW4gdGhlIHVzZXIgaGl0cyBzcGFjZSBhbmQgdGhlaXIgaW5wdXQgbG9va3MgbGlrZSBhbiBlLW1haWwvTVhJRCB0aGVuIHRyeSB0byBjb252ZXJ0IGl0XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLl9jb252ZXJ0RmlsdGVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3VwZGF0ZVN1Z2dlc3Rpb25zID0gYXN5bmMgKHRlcm0pID0+IHtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlYXJjaFVzZXJEaXJlY3Rvcnkoe3Rlcm19KS50aGVuKGFzeW5jIHIgPT4ge1xuICAgICAgICAgICAgaWYgKHRlcm0gIT09IHRoaXMuc3RhdGUuZmlsdGVyVGV4dCkge1xuICAgICAgICAgICAgICAgIC8vIERpc2NhcmQgdGhlIHJlc3VsdHMgLSB3ZSB3ZXJlIHByb2JhYmx5IHRvbyBzbG93IG9uIHRoZSBzZXJ2ZXItc2lkZSB0byBtYWtlXG4gICAgICAgICAgICAgICAgLy8gdGhlc2UgcmVzdWx0cyB1c2VmdWwuIFRoaXMgaXMgYSByYWNlIHdlIHdhbnQgdG8gYXZvaWQgYmVjYXVzZSB3ZSBjb3VsZCBvdmVyd3JpdGVcbiAgICAgICAgICAgICAgICAvLyBtb3JlIGFjY3VyYXRlIHJlc3VsdHMuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXIucmVzdWx0cykgci5yZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIC8vIFdoaWxlIHdlJ3JlIGhlcmUsIHRyeSBhbmQgYXV0b2NvbXBsZXRlIGEgc2VhcmNoIHJlc3VsdCBmb3IgdGhlIG14aWQgaXRzZWxmXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSdzIG5vIG1hdGNoZXMgKGFuZCB0aGUgaW5wdXQgbG9va3MgbGlrZSBhIG14aWQpLlxuICAgICAgICAgICAgaWYgKHRlcm1bMF0gPT09ICdAJyAmJiB0ZXJtLmluZGV4T2YoJzonKSA+IDEpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFByb2ZpbGVJbmZvKHRlcm0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIHByb2ZpbGUsIHdlIGhhdmUgZW5vdWdoIGluZm9ybWF0aW9uIHRvIGFzc3VtZSB0aGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgbXhpZCBjYW4gYmUgaW52aXRlZCAtIGFkZCBpdCB0byB0aGUgbGlzdC4gV2Ugc3RpY2sgaXQgYXQgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0b3Agc28gaXQgaXMgbW9zdCBvYnZpb3VzbHkgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgICAgci5yZXN1bHRzLnNwbGljZSgwLCAwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogdGVybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5X25hbWU6IHByb2ZpbGVbJ2Rpc3BsYXluYW1lJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyX3VybDogcHJvZmlsZVsnYXZhdGFyX3VybCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIk5vbi1mYXRhbCBlcnJvciB0cnlpbmcgdG8gbWFrZSBhbiBpbnZpdGUgZm9yIGEgdXNlciBJRFwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBhIHJlc3VsdCBhbnl3YXlzLCBqdXN0IHdpdGhvdXQgYSBwcm9maWxlLiBXZSBzdGljayBpdCBhdCB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9wIHNvIGl0IGlzIG1vc3Qgb2J2aW91c2x5IHByZXNlbnRlZCB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgci5yZXN1bHRzLnNwbGljZSgwLCAwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiB0ZXJtLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheV9uYW1lOiB0ZXJtLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyX3VybDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXJSZXN1bHRzTWl4aW46IHIucmVzdWx0cy5tYXAodSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IHUudXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogbmV3IERpcmVjdG9yeU1lbWJlcih1KSxcbiAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igc2VhcmNoaW5nIHVzZXIgZGlyZWN0b3J5OlwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzZXJ2ZXJSZXN1bHRzTWl4aW46IFtdfSk7IC8vIGNsZWFyIHJlc3VsdHMgYmVjYXVzZSBpdCdzIG1vZGVyYXRlbHkgZmF0YWxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2hlbmV2ZXIgd2Ugc2VhcmNoIHRoZSBkaXJlY3RvcnksIGFsc28gdHJ5IHRvIHNlYXJjaCB0aGUgaWRlbnRpdHkgc2VydmVyLiBJdCdzXG4gICAgICAgIC8vIGFsbCBkZWJvdW5jZWQgdGhlIHNhbWUgYW55d2F5cy5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNhblVzZUlkZW50aXR5U2VydmVyKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBkb2Vzbid0IGhhdmUgYW4gaWRlbnRpdHkgc2VydmVyIHNldCAtIHdhcm4gdGhlbSBvZiB0aGF0LlxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dHJ5aW5nSWRlbnRpdHlTZXJ2ZXI6IHRydWV9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGVybS5pbmRleE9mKCdAJykgPiAwICYmIEVtYWlsLmxvb2tzVmFsaWQodGVybSkgJiYgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuSWRlbnRpdHlTZXJ2ZXIpKSB7XG4gICAgICAgICAgICAvLyBTdGFydCBvZmYgYnkgc3VnZ2VzdGluZyB0aGUgcGxhaW4gZW1haWwgd2hpbGUgd2UgdHJ5IGFuZCByZXNvbHZlIGl0XG4gICAgICAgICAgICAvLyB0byBhIHJlYWwgYWNjb3VudC5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIC8vIHBlciBhYm92ZTogdGhlIHVzZXJJZCBpcyBhIGxpZSBoZXJlIC0gaXQncyBqdXN0IGEgcmVndWxhciBpZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgdGhyZWVwaWRSZXN1bHRzTWl4aW46IFt7dXNlcjogbmV3IFRocmVlcGlkTWVtYmVyKHRlcm0pLCB1c2VySWQ6IHRlcm19XSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdXRoQ2xpZW50ID0gbmV3IElkZW50aXR5QXV0aENsaWVudCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuID0gYXdhaXQgYXV0aENsaWVudC5nZXRBY2Nlc3NUb2tlbigpO1xuICAgICAgICAgICAgICAgIGlmICh0ZXJtICE9PSB0aGlzLnN0YXRlLmZpbHRlclRleHQpIHJldHVybjsgLy8gYWJhbmRvbiBob3BlXG5cbiAgICAgICAgICAgICAgICBjb25zdCBsb29rdXAgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubG9va3VwVGhyZWVQaWQoXG4gICAgICAgICAgICAgICAgICAgICdlbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgIHRlcm0sXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgLy8gY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAodGVybSAhPT0gdGhpcy5zdGF0ZS5maWx0ZXJUZXh0KSByZXR1cm47IC8vIGFiYW5kb24gaG9wZVxuXG4gICAgICAgICAgICAgICAgaWYgKCFsb29rdXAgfHwgIWxvb2t1cC5teGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHdlcmVuJ3QgYWJsZSB0byBmaW5kIGFueW9uZSAtIHdlJ3JlIGFscmVhZHkgc3VnZ2VzdGluZyB0aGUgcGxhaW4gZW1haWxcbiAgICAgICAgICAgICAgICAgICAgLy8gYXMgYW4gYWx0ZXJuYXRpdmUsIHNvIGRvIG5vdGhpbmcuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBhcHBlbmQgdGhlIHVzZXIgc3VnZ2VzdGlvbiB0byBnaXZlIHRoZSB1c2VyIGFuIG9wdGlvbiB0byBjbGlja1xuICAgICAgICAgICAgICAgIC8vIHRoZSBlbWFpbCBhbnl3YXlzLCBhbmQgc28gd2UgZG9uJ3QgY2F1c2UgdGhpbmdzIHRvIGp1bXAgYXJvdW5kLiBJblxuICAgICAgICAgICAgICAgIC8vIHRoZW9yeSwgdGhlIHVzZXIgd291bGQgc2VlIHRoZSB1c2VyIHBvcCB1cCBhbmQgdGhpbmsgXCJhaCB5ZXMsIHRoYXRcbiAgICAgICAgICAgICAgICAvLyBwZXJzb24hXCJcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFByb2ZpbGVJbmZvKGxvb2t1cC5teGlkKTtcbiAgICAgICAgICAgICAgICBpZiAodGVybSAhPT0gdGhpcy5zdGF0ZS5maWx0ZXJUZXh0IHx8ICFwcm9maWxlKSByZXR1cm47IC8vIGFiYW5kb24gaG9wZVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICB0aHJlZXBpZFJlc3VsdHNNaXhpbjogWy4uLnRoaXMuc3RhdGUudGhyZWVwaWRSZXN1bHRzTWl4aW4sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6IG5ldyBEaXJlY3RvcnlNZW1iZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IGxvb2t1cC5teGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlfbmFtZTogcHJvZmlsZS5kaXNwbGF5bmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBwcm9maWxlLmF2YXRhcl91cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogbG9va3VwLm14aWQsXG4gICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzZWFyY2hpbmcgaWRlbnRpdHkgc2VydmVyOlwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3RocmVlcGlkUmVzdWx0c01peGluOiBbXX0pOyAvLyBjbGVhciByZXN1bHRzIGJlY2F1c2UgaXQncyBtb2RlcmF0ZWx5IGZhdGFsXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3VwZGF0ZUZpbHRlciA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IHRlcm0gPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZmlsdGVyVGV4dDogdGVybX0pO1xuXG4gICAgICAgIC8vIERlYm91bmNlIHNlcnZlciBsb29rdXBzIHRvIHJlZHVjZSBzcGFtLiBXZSBkb24ndCBjbGVhciB0aGUgZXhpc3Rpbmcgc2VydmVyXG4gICAgICAgIC8vIHJlc3VsdHMgYmVjYXVzZSB0aGV5IG1pZ2h0IHN0aWxsIGJlIHZhZ3VlbHkgYWNjdXJhdGUsIGxpa2V3aXNlIGZvciByYWNlcyB3aGljaFxuICAgICAgICAvLyBjb3VsZCBoYXBwZW4gaGVyZS5cbiAgICAgICAgaWYgKHRoaXMuX2RlYm91bmNlVGltZXIpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9kZWJvdW5jZVRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kZWJvdW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTdWdnZXN0aW9ucyh0ZXJtKTtcbiAgICAgICAgfSwgMTUwKTsgLy8gMTUwbXMgZGVib3VuY2UgKGh1bWFuIHJlYWN0aW9uIHRpbWUgKyBzb21lKVxuICAgIH07XG5cbiAgICBfc2hvd01vcmVSZWNlbnRzID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtudW1SZWNlbnRzU2hvd246IHRoaXMuc3RhdGUubnVtUmVjZW50c1Nob3duICsgSU5DUkVNRU5UX1JPT01TX1NIT1dOfSk7XG4gICAgfTtcblxuICAgIF9zaG93TW9yZVN1Z2dlc3Rpb25zID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtudW1TdWdnZXN0aW9uc1Nob3duOiB0aGlzLnN0YXRlLm51bVN1Z2dlc3Rpb25zU2hvd24gKyBJTkNSRU1FTlRfUk9PTVNfU0hPV059KTtcbiAgICB9O1xuXG4gICAgX3RvZ2dsZU1lbWJlciA9IChtZW1iZXI6IE1lbWJlcikgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuYnVzeSkge1xuICAgICAgICAgICAgbGV0IGZpbHRlclRleHQgPSB0aGlzLnN0YXRlLmZpbHRlclRleHQ7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRzID0gdGhpcy5zdGF0ZS50YXJnZXRzLm1hcCh0ID0+IHQpOyAvLyBjaGVhcCBjbG9uZSBmb3IgbXV0YXRpb25cbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHRhcmdldHMuaW5kZXhPZihtZW1iZXIpO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0cy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKG1lbWJlcik7XG4gICAgICAgICAgICAgICAgZmlsdGVyVGV4dCA9IFwiXCI7IC8vIGNsZWFyIHRoZSBmaWx0ZXIgd2hlbiB0aGUgdXNlciBhY2NlcHRzIGEgc3VnZ2VzdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGFyZ2V0cywgZmlsdGVyVGV4dH0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fZWRpdG9yUmVmICYmIHRoaXMuX2VkaXRvclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9yUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfcmVtb3ZlTWVtYmVyID0gKG1lbWJlcjogTWVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSB0aGlzLnN0YXRlLnRhcmdldHMubWFwKHQgPT4gdCk7IC8vIGNoZWFwIGNsb25lIGZvciBtdXRhdGlvblxuICAgICAgICBjb25zdCBpZHggPSB0YXJnZXRzLmluZGV4T2YobWVtYmVyKTtcbiAgICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgICAgICB0YXJnZXRzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGFyZ2V0c30pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2VkaXRvclJlZiAmJiB0aGlzLl9lZGl0b3JSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25QYXN0ZSA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZpbHRlclRleHQpIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGhhcyBhbHJlYWR5IHR5cGVkIHNvbWV0aGluZywganVzdCBsZXQgdGhlbVxuICAgICAgICAgICAgLy8gcGFzdGUgbm9ybWFsbHkuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmV2ZW50IHRoZSB0ZXh0IGJlaW5nIHBhc3RlZCBpbnRvIHRoZSBpbnB1dFxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy8gUHJvY2VzcyBpdCBhcyBhIGxpc3Qgb2YgYWRkcmVzc2VzIHRvIGFkZCBpbnN0ZWFkXG4gICAgICAgIGNvbnN0IHRleHQgPSBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YShcInRleHRcIik7XG4gICAgICAgIGNvbnN0IHBvc3NpYmxlTWVtYmVycyA9IFtcbiAgICAgICAgICAgIC8vIElmIHdlIGNhbiBhdm9pZCBoaXR0aW5nIHRoZSBwcm9maWxlIGVuZHBvaW50LCB3ZSBzaG91bGQuXG4gICAgICAgICAgICAuLi50aGlzLnN0YXRlLnJlY2VudHMsXG4gICAgICAgICAgICAuLi50aGlzLnN0YXRlLnN1Z2dlc3Rpb25zLFxuICAgICAgICAgICAgLi4udGhpcy5zdGF0ZS5zZXJ2ZXJSZXN1bHRzTWl4aW4sXG4gICAgICAgICAgICAuLi50aGlzLnN0YXRlLnRocmVlcGlkUmVzdWx0c01peGluLFxuICAgICAgICBdO1xuICAgICAgICBjb25zdCB0b0FkZCA9IFtdO1xuICAgICAgICBjb25zdCBmYWlsZWQgPSBbXTtcbiAgICAgICAgY29uc3QgcG90ZW50aWFsQWRkcmVzc2VzID0gdGV4dC5zcGxpdCgvW1xccyxdKy8pLm1hcChwID0+IHAudHJpbSgpKS5maWx0ZXIocCA9PiAhIXApOyAvLyBmaWx0ZXIgZW1wdHkgc3RyaW5nc1xuICAgICAgICBmb3IgKGNvbnN0IGFkZHJlc3Mgb2YgcG90ZW50aWFsQWRkcmVzc2VzKSB7XG4gICAgICAgICAgICBjb25zdCBtZW1iZXIgPSBwb3NzaWJsZU1lbWJlcnMuZmluZChtID0+IG0udXNlcklkID09PSBhZGRyZXNzKTtcbiAgICAgICAgICAgIGlmIChtZW1iZXIpIHtcbiAgICAgICAgICAgICAgICB0b0FkZC5wdXNoKG1lbWJlci51c2VyKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFkZHJlc3MuaW5kZXhPZignQCcpID4gMCAmJiBFbWFpbC5sb29rc1ZhbGlkKGFkZHJlc3MpKSB7XG4gICAgICAgICAgICAgICAgdG9BZGQucHVzaChuZXcgVGhyZWVwaWRNZW1iZXIoYWRkcmVzcykpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYWRkcmVzc1swXSAhPT0gJ0AnKSB7XG4gICAgICAgICAgICAgICAgZmFpbGVkLnB1c2goYWRkcmVzcyk7IC8vIG5vdCBhIHVzZXIgSURcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFByb2ZpbGVJbmZvKGFkZHJlc3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gcHJvZmlsZSA/IHByb2ZpbGUuZGlzcGxheW5hbWUgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGF2YXRhclVybCA9IHByb2ZpbGUgPyBwcm9maWxlLmF2YXRhcl91cmwgOiBudWxsO1xuICAgICAgICAgICAgICAgIHRvQWRkLnB1c2gobmV3IERpcmVjdG9yeU1lbWJlcih7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IGFkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlfbmFtZTogZGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IGF2YXRhclVybCxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGxvb2tpbmcgdXAgcHJvZmlsZSBmb3IgXCIgKyBhZGRyZXNzKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIGZhaWxlZC5wdXNoKGFkZHJlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZhaWxlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuUXVlc3Rpb25EaWFsb2cnKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ludml0ZSBQYXN0ZSBGYWlsJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdGYWlsZWQgdG8gZmluZCB0aGUgZm9sbG93aW5nIHVzZXJzJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoZSBmb2xsb3dpbmcgdXNlcnMgbWlnaHQgbm90IGV4aXN0IG9yIGFyZSBpbnZhbGlkLCBhbmQgY2Fubm90IGJlIGludml0ZWQ6ICUoY3N2TmFtZXMpc1wiLFxuICAgICAgICAgICAgICAgICAgICB7Y3N2TmFtZXM6IGZhaWxlZC5qb2luKFwiLCBcIil9LFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdCgnT0snKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGFyZ2V0czogWy4uLnRoaXMuc3RhdGUudGFyZ2V0cywgLi4udG9BZGRdfSk7XG4gICAgfTtcblxuICAgIF9vbkNsaWNrSW5wdXRBcmVhID0gKGUpID0+IHtcbiAgICAgICAgLy8gU3RvcCB0aGUgYnJvd3NlciBmcm9tIGhpZ2hsaWdodGluZyB0ZXh0XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBpZiAodGhpcy5fZWRpdG9yUmVmICYmIHRoaXMuX2VkaXRvclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3JSZWYuY3VycmVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vblVzZURlZmF1bHRJZGVudGl0eVNlcnZlckNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgSVMgaW4gYWNjb3VudCBkYXRhLiBBY3R1YWxseSB1c2luZyBpdCBtYXkgdHJpZ2dlciB0ZXJtcy5cbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL3J1bGVzLW9mLWhvb2tzXG4gICAgICAgIHVzZURlZmF1bHRJZGVudGl0eVNlcnZlcigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjYW5Vc2VJZGVudGl0eVNlcnZlcjogdHJ1ZSwgdHJ5aW5nSWRlbnRpdHlTZXJ2ZXI6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIF9vbk1hbmFnZVNldHRpbmdzQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5WaWV3VXNlclNldHRpbmdzKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIF9vbkNvbW11bml0eUludml0ZUNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIHNob3dDb21tdW5pdHlJbnZpdGVEaWFsb2coQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpKTtcbiAgICB9O1xuXG4gICAgX3JlbmRlclNlY3Rpb24oa2luZDogXCJyZWNlbnRzXCJ8XCJzdWdnZXN0aW9uc1wiKSB7XG4gICAgICAgIGxldCBzb3VyY2VNZW1iZXJzID0ga2luZCA9PT0gJ3JlY2VudHMnID8gdGhpcy5zdGF0ZS5yZWNlbnRzIDogdGhpcy5zdGF0ZS5zdWdnZXN0aW9ucztcbiAgICAgICAgbGV0IHNob3dOdW0gPSBraW5kID09PSAncmVjZW50cycgPyB0aGlzLnN0YXRlLm51bVJlY2VudHNTaG93biA6IHRoaXMuc3RhdGUubnVtU3VnZ2VzdGlvbnNTaG93bjtcbiAgICAgICAgY29uc3Qgc2hvd01vcmVGbiA9IGtpbmQgPT09ICdyZWNlbnRzJyA/IHRoaXMuX3Nob3dNb3JlUmVjZW50cy5iaW5kKHRoaXMpIDogdGhpcy5fc2hvd01vcmVTdWdnZXN0aW9ucy5iaW5kKHRoaXMpO1xuICAgICAgICBjb25zdCBsYXN0QWN0aXZlID0gKG0pID0+IGtpbmQgPT09ICdyZWNlbnRzJyA/IG0ubGFzdEFjdGl2ZSA6IG51bGw7XG4gICAgICAgIGxldCBzZWN0aW9uTmFtZSA9IGtpbmQgPT09ICdyZWNlbnRzJyA/IF90KFwiUmVjZW50IENvbnZlcnNhdGlvbnNcIikgOiBfdChcIlN1Z2dlc3Rpb25zXCIpO1xuICAgICAgICBsZXQgc2VjdGlvblN1Ym5hbWUgPSBudWxsO1xuXG4gICAgICAgIGlmIChraW5kID09PSAnc3VnZ2VzdGlvbnMnICYmIENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5SWQoKSkge1xuICAgICAgICAgICAgY29uc3QgY29tbXVuaXR5TmFtZSA9IENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5TmFtZSgpO1xuICAgICAgICAgICAgc2VjdGlvblN1Ym5hbWUgPSBfdChcIk1heSBpbmNsdWRlIG1lbWJlcnMgbm90IGluICUoY29tbXVuaXR5TmFtZSlzXCIsIHtjb21tdW5pdHlOYW1lfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5raW5kID09PSBLSU5EX0lOVklURSkge1xuICAgICAgICAgICAgc2VjdGlvbk5hbWUgPSBraW5kID09PSAncmVjZW50cycgPyBfdChcIlJlY2VudGx5IERpcmVjdCBNZXNzYWdlZFwiKSA6IF90KFwiU3VnZ2VzdGlvbnNcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNaXggaW4gdGhlIHNlcnZlciByZXN1bHRzIGlmIHdlIGhhdmUgYW55LCBidXQgb25seSBpZiB3ZSdyZSBzZWFyY2hpbmcuIFdlIHRyYWNrIHRoZSBhZGRpdGlvbmFsXG4gICAgICAgIC8vIG1lbWJlcnMgc2VwYXJhdGVseSBiZWNhdXNlIHdlIHdhbnQgdG8gZmlsdGVyIHNvdXJjZU1lbWJlcnMgYnV0IHRydXN0IHRoZSBtaXhpbiBhcnJheXMgdG8gaGF2ZVxuICAgICAgICAvLyB0aGUgcmlnaHQgbWVtYmVycyBpbiB0aGVtLlxuICAgICAgICBsZXQgcHJpb3JpdHlBZGRpdGlvbmFsTWVtYmVycyA9IFtdOyAvLyBTaG93cyB1cCBiZWZvcmUgb3VyIG93biBzdWdnZXN0aW9ucywgaGlnaGVyIHF1YWxpdHlcbiAgICAgICAgbGV0IG90aGVyQWRkaXRpb25hbE1lbWJlcnMgPSBbXTsgLy8gU2hvd3MgdXAgYWZ0ZXIgb3VyIG93biBzdWdnZXN0aW9ucywgbG93ZXIgcXVhbGl0eVxuICAgICAgICBjb25zdCBoYXNNaXhpbnMgPSB0aGlzLnN0YXRlLnNlcnZlclJlc3VsdHNNaXhpbiB8fCB0aGlzLnN0YXRlLnRocmVlcGlkUmVzdWx0c01peGluO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5maWx0ZXJUZXh0ICYmIGhhc01peGlucyAmJiBraW5kID09PSAnc3VnZ2VzdGlvbnMnKSB7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB3YW50IHRvIGR1cGxpY2F0ZSBtZW1iZXJzIHRob3VnaCwgc28ganVzdCBleGNsdWRlIGFueW9uZSB3ZSd2ZSBhbHJlYWR5IHNlZW4uXG4gICAgICAgICAgICAvLyBUaGUgdHlwZSBvZiB1IGlzIGEgcGFpbiB0byBkZWZpbmUgYnV0IG1lbWJlcnMgb2YgYm90aCBtaXhpbnMgaGF2ZSB0aGUgJ3VzZXJJZCcgcHJvcGVydHlcbiAgICAgICAgICAgIGNvbnN0IG5vdEFscmVhZHlFeGlzdHMgPSAodTogYW55KTogYm9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFzb3VyY2VNZW1iZXJzLnNvbWUobSA9PiBtLnVzZXJJZCA9PT0gdS51c2VySWQpXG4gICAgICAgICAgICAgICAgICAgICYmICFwcmlvcml0eUFkZGl0aW9uYWxNZW1iZXJzLnNvbWUobSA9PiBtLnVzZXJJZCA9PT0gdS51c2VySWQpXG4gICAgICAgICAgICAgICAgICAgICYmICFvdGhlckFkZGl0aW9uYWxNZW1iZXJzLnNvbWUobSA9PiBtLnVzZXJJZCA9PT0gdS51c2VySWQpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgb3RoZXJBZGRpdGlvbmFsTWVtYmVycyA9IHRoaXMuc3RhdGUuc2VydmVyUmVzdWx0c01peGluLmZpbHRlcihub3RBbHJlYWR5RXhpc3RzKTtcbiAgICAgICAgICAgIHByaW9yaXR5QWRkaXRpb25hbE1lbWJlcnMgPSB0aGlzLnN0YXRlLnRocmVlcGlkUmVzdWx0c01peGluLmZpbHRlcihub3RBbHJlYWR5RXhpc3RzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYXNBZGRpdGlvbmFsTWVtYmVycyA9IHByaW9yaXR5QWRkaXRpb25hbE1lbWJlcnMubGVuZ3RoID4gMCB8fCBvdGhlckFkZGl0aW9uYWxNZW1iZXJzLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgLy8gSGlkZSB0aGUgc2VjdGlvbiBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gZmlsdGVyIGJ5XG4gICAgICAgIGlmIChzb3VyY2VNZW1iZXJzLmxlbmd0aCA9PT0gMCAmJiAhaGFzQWRkaXRpb25hbE1lbWJlcnMpIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIERvIHNvbWUgc2ltcGxlIGZpbHRlcmluZyBvbiB0aGUgaW5wdXQgYmVmb3JlIGdvaW5nIG11Y2ggZnVydGhlci4gSWYgd2UgZ2V0IG5vIHJlc3VsdHMsIHNheSBzby5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZmlsdGVyVGV4dCkge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyQnkgPSB0aGlzLnN0YXRlLmZpbHRlclRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHNvdXJjZU1lbWJlcnMgPSBzb3VyY2VNZW1iZXJzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihtID0+IG0udXNlci5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVyQnkpIHx8IG0udXNlcklkLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVyQnkpKTtcblxuICAgICAgICAgICAgaWYgKHNvdXJjZU1lbWJlcnMubGVuZ3RoID09PSAwICYmICFoYXNBZGRpdGlvbmFsTWVtYmVycykge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfc2VjdGlvbic+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDM+e3NlY3Rpb25OYW1lfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD57X3QoXCJObyByZXN1bHRzXCIpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdyB3ZSBtaXggaW4gdGhlIGFkZGl0aW9uYWwgbWVtYmVycy4gQWdhaW4sIHdlIHByZXN1bWUgdGhlc2UgaGF2ZSBhbHJlYWR5IGJlZW4gZmlsdGVyZWQuIFdlXG4gICAgICAgIC8vIGFsc28gYXNzdW1lIHRoZXkgYXJlIG1vcmUgcmVsZXZhbnQgdGhhbiBvdXIgc3VnZ2VzdGlvbnMgYW5kIHByZXBlbmQgdGhlbSB0byB0aGUgbGlzdC5cbiAgICAgICAgc291cmNlTWVtYmVycyA9IFsuLi5wcmlvcml0eUFkZGl0aW9uYWxNZW1iZXJzLCAuLi5zb3VyY2VNZW1iZXJzLCAuLi5vdGhlckFkZGl0aW9uYWxNZW1iZXJzXTtcblxuICAgICAgICAvLyBJZiB3ZSdyZSBnb2luZyB0byBoaWRlIG9uZSBtZW1iZXIgYmVoaW5kICdzaG93IG1vcmUnLCBqdXN0IHVzZSB1cCB0aGUgc3BhY2Ugb2YgdGhlIGJ1dHRvblxuICAgICAgICAvLyB3aXRoIHRoZSBtZW1iZXIncyB0aWxlIGluc3RlYWQuXG4gICAgICAgIGlmIChzaG93TnVtID09PSBzb3VyY2VNZW1iZXJzLmxlbmd0aCAtIDEpIHNob3dOdW0rKztcblxuICAgICAgICAvLyAuc2xpY2UoKSB3aWxsIHJldHVybiBhbiBpbmNvbXBsZXRlIGFycmF5IGJ1dCB3b24ndCBlcnJvciBvbiB1cyBpZiB3ZSBnbyB0b28gZmFyXG4gICAgICAgIGNvbnN0IHRvUmVuZGVyID0gc291cmNlTWVtYmVycy5zbGljZSgwLCBzaG93TnVtKTtcbiAgICAgICAgY29uc3QgaGFzTW9yZSA9IHRvUmVuZGVyLmxlbmd0aCA8IHNvdXJjZU1lbWJlcnMubGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvblwiKTtcbiAgICAgICAgbGV0IHNob3dNb3JlID0gbnVsbDtcbiAgICAgICAgaWYgKGhhc01vcmUpIHtcbiAgICAgICAgICAgIHNob3dNb3JlID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3Nob3dNb3JlRm59IGtpbmQ9XCJsaW5rXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlNob3cgbW9yZVwiKX1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGlsZXMgPSB0b1JlbmRlci5tYXAociA9PiAoXG4gICAgICAgICAgICA8RE1Sb29tVGlsZVxuICAgICAgICAgICAgICAgIG1lbWJlcj17ci51c2VyfVxuICAgICAgICAgICAgICAgIGxhc3RBY3RpdmVUcz17bGFzdEFjdGl2ZShyKX1cbiAgICAgICAgICAgICAgICBrZXk9e3IudXNlcklkfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXt0aGlzLl90b2dnbGVNZW1iZXJ9XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0V29yZD17dGhpcy5zdGF0ZS5maWx0ZXJUZXh0fVxuICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e3RoaXMuc3RhdGUudGFyZ2V0cy5zb21lKHQgPT4gdC51c2VySWQgPT09IHIudXNlcklkKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICkpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICA8aDM+e3NlY3Rpb25OYW1lfTwvaDM+XG4gICAgICAgICAgICAgICAge3NlY3Rpb25TdWJuYW1lID8gPHAgY2xhc3NOYW1lPVwibXhfSW52aXRlRGlhbG9nX3N1Ym5hbWVcIj57c2VjdGlvblN1Ym5hbWV9PC9wPiA6IG51bGx9XG4gICAgICAgICAgICAgICAge3RpbGVzfVxuICAgICAgICAgICAgICAgIHtzaG93TW9yZX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJFZGl0b3IoKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSB0aGlzLnN0YXRlLnRhcmdldHMubWFwKHQgPT4gKFxuICAgICAgICAgICAgPERNVXNlclRpbGUgbWVtYmVyPXt0fSBvblJlbW92ZT17IXRoaXMuc3RhdGUuYnVzeSAmJiB0aGlzLl9yZW1vdmVNZW1iZXJ9IGtleT17dC51c2VySWR9IC8+XG4gICAgICAgICkpO1xuICAgICAgICBjb25zdCBpbnB1dCA9IChcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMuX29uS2V5RG93bn1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fdXBkYXRlRmlsdGVyfVxuICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmZpbHRlclRleHR9XG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9lZGl0b3JSZWZ9XG4gICAgICAgICAgICAgICAgb25QYXN0ZT17dGhpcy5fb25QYXN0ZX1cbiAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfZWRpdG9yJyBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrSW5wdXRBcmVhfT5cbiAgICAgICAgICAgICAgICB7dGFyZ2V0c31cbiAgICAgICAgICAgICAgICB7aW5wdXR9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfcmVuZGVySWRlbnRpdHlTZXJ2ZXJXYXJuaW5nKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUudHJ5aW5nSWRlbnRpdHlTZXJ2ZXIgfHwgdGhpcy5zdGF0ZS5jYW5Vc2VJZGVudGl0eVNlcnZlciB8fFxuICAgICAgICAgICAgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLklkZW50aXR5U2VydmVyKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVmYXVsdElkZW50aXR5U2VydmVyVXJsID0gZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsKCk7XG4gICAgICAgIGlmIChkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BZGRyZXNzUGlja2VyRGlhbG9nX2lkZW50aXR5U2VydmVyXCI+e190KFxuICAgICAgICAgICAgICAgICAgICBcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgdG8gaW52aXRlIGJ5IGVtYWlsLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGRlZmF1bHQ+VXNlIHRoZSBkZWZhdWx0ICglKGRlZmF1bHRJZGVudGl0eVNlcnZlck5hbWUpcyk8L2RlZmF1bHQ+IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJvciBtYW5hZ2UgaW4gPHNldHRpbmdzPlNldHRpbmdzPC9zZXR0aW5ncz4uXCIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRJZGVudGl0eVNlcnZlck5hbWU6IGFiYnJldmlhdGVVcmwoZGVmYXVsdElkZW50aXR5U2VydmVyVXJsKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogc3ViID0+IDxhIGhyZWY9XCIjXCIgb25DbGljaz17dGhpcy5fb25Vc2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXJDbGlja30+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHN1YiA9PiA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e3RoaXMuX29uTWFuYWdlU2V0dGluZ3NDbGlja30+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICl9PC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NQaWNrZXJEaWFsb2dfaWRlbnRpdHlTZXJ2ZXJcIj57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVXNlIGFuIGlkZW50aXR5IHNlcnZlciB0byBpbnZpdGUgYnkgZW1haWwuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJNYW5hZ2UgaW4gPHNldHRpbmdzPlNldHRpbmdzPC9zZXR0aW5ncz4uXCIsXG4gICAgICAgICAgICAgICAgICAgIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczogc3ViID0+IDxhIGhyZWY9XCIjXCIgb25DbGljaz17dGhpcy5fb25NYW5hZ2VTZXR0aW5nc0NsaWNrfT57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKX08L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uXCIpO1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG5cbiAgICAgICAgbGV0IHNwaW5uZXIgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5idXN5KSB7XG4gICAgICAgICAgICBzcGlubmVyID0gPFNwaW5uZXIgdz17MjB9IGg9ezIwfSAvPjtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICBsZXQgaGVscFRleHQ7XG4gICAgICAgIGxldCBidXR0b25UZXh0O1xuICAgICAgICBsZXQgZ29CdXR0b25GbjtcbiAgICAgICAgbGV0IGNvbnN1bHRTZWN0aW9uO1xuICAgICAgICBsZXQga2V5U2hhcmluZ1dhcm5pbmcgPSA8c3BhbiAvPjtcblxuICAgICAgICBjb25zdCBpZGVudGl0eVNlcnZlcnNFbmFibGVkID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuSWRlbnRpdHlTZXJ2ZXIpO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgdXNlcklkID0gY2xpLmdldFVzZXJJZCgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5raW5kID09PSBLSU5EX0RNKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiRGlyZWN0IE1lc3NhZ2VzXCIpO1xuXG4gICAgICAgICAgICBpZiAoaWRlbnRpdHlTZXJ2ZXJzRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGhlbHBUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiU3RhcnQgYSBjb252ZXJzYXRpb24gd2l0aCBzb21lb25lIHVzaW5nIHRoZWlyIG5hbWUsIGVtYWlsIGFkZHJlc3Mgb3IgdXNlcm5hbWUgKGxpa2UgPHVzZXJJZC8+KS5cIixcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIHt1c2VySWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17bWFrZVVzZXJQZXJtYWxpbmsodXNlcklkKX0gcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPnt1c2VySWR9PC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfX0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVscFRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJTdGFydCBhIGNvbnZlcnNhdGlvbiB3aXRoIHNvbWVvbmUgdXNpbmcgdGhlaXIgbmFtZSBvciB1c2VybmFtZSAobGlrZSA8dXNlcklkLz4pLlwiLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAge3VzZXJJZDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXttYWtlVXNlclBlcm1hbGluayh1c2VySWQpfSByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3VzZXJJZH08L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9fSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tbXVuaXR5TmFtZSA9IENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5TmFtZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZVRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHdvbid0IGludml0ZSB0aGVtIHRvICUoY29tbXVuaXR5TmFtZSlzLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiVG8gaW52aXRlIHNvbWVvbmUgdG8gJShjb21tdW5pdHlOYW1lKXMsIGNsaWNrIDxhPmhlcmU8L2E+XCIsXG4gICAgICAgICAgICAgICAgICAgIHtjb21tdW5pdHlOYW1lfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e21ha2VVc2VyUGVybWFsaW5rKHVzZXJJZCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID57dXNlcklkfTwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGE6IChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25Db21tdW5pdHlJbnZpdGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPntzdWJ9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaGVscFRleHQgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIHsgaGVscFRleHQgfSB7aW52aXRlVGV4dH1cbiAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ1dHRvblRleHQgPSBfdChcIkdvXCIpO1xuICAgICAgICAgICAgZ29CdXR0b25GbiA9IHRoaXMuX3N0YXJ0RG07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5raW5kID09PSBLSU5EX0lOVklURSkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKT8uZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgICAgICBjb25zdCBpc1NwYWNlID0gcm9vbT8uaXNTcGFjZVJvb20oKTtcbiAgICAgICAgICAgIHRpdGxlID0gaXNTcGFjZVxuICAgICAgICAgICAgICAgID8gX3QoXCJJbnZpdGUgdG8gJShzcGFjZU5hbWUpc1wiLCB7XG4gICAgICAgICAgICAgICAgICAgIHNwYWNlTmFtZTogcm9vbS5uYW1lIHx8IF90KFwiVW5uYW1lZCBTcGFjZVwiKSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogX3QoXCJJbnZpdGUgdG8gJShyb29tTmFtZSlzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbU5hbWU6IHJvb20ubmFtZSB8fCBfdChcIlVubmFtZWQgUm9vbVwiKSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGhlbHBUZXh0VW50cmFuc2xhdGVkO1xuICAgICAgICAgICAgaWYgKGlzU3BhY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoaWRlbnRpdHlTZXJ2ZXJzRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgICAgICBoZWxwVGV4dFVudHJhbnNsYXRlZCA9IF90ZChcIkludml0ZSBzb21lb25lIHVzaW5nIHRoZWlyIG5hbWUsIGVtYWlsIGFkZHJlc3MsIHVzZXJuYW1lIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiKGxpa2UgPHVzZXJJZC8+KSBvciA8YT5zaGFyZSB0aGlzIHNwYWNlPC9hPi5cIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaGVscFRleHRVbnRyYW5zbGF0ZWQgPSBfdGQoXCJJbnZpdGUgc29tZW9uZSB1c2luZyB0aGVpciBuYW1lLCB1c2VybmFtZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIihsaWtlIDx1c2VySWQvPikgb3IgPGE+c2hhcmUgdGhpcyBzcGFjZTwvYT4uXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlkZW50aXR5U2VydmVyc0VuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVscFRleHRVbnRyYW5zbGF0ZWQgPSBfdGQoXCJJbnZpdGUgc29tZW9uZSB1c2luZyB0aGVpciBuYW1lLCBlbWFpbCBhZGRyZXNzLCB1c2VybmFtZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIihsaWtlIDx1c2VySWQvPikgb3IgPGE+c2hhcmUgdGhpcyByb29tPC9hPi5cIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaGVscFRleHRVbnRyYW5zbGF0ZWQgPSBfdGQoXCJJbnZpdGUgc29tZW9uZSB1c2luZyB0aGVpciBuYW1lLCB1c2VybmFtZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIihsaWtlIDx1c2VySWQvPikgb3IgPGE+c2hhcmUgdGhpcyByb29tPC9hPi5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBoZWxwVGV4dCA9IF90KGhlbHBUZXh0VW50cmFuc2xhdGVkLCB7fSwge1xuICAgICAgICAgICAgICAgIHVzZXJJZDogKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17bWFrZVVzZXJQZXJtYWxpbmsodXNlcklkKX0gcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPnt1c2VySWR9PC9hPixcbiAgICAgICAgICAgICAgICBhOiAoc3ViKSA9PlxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXttYWtlUm9vbVBlcm1hbGluayh0aGlzLnByb3BzLnJvb21JZCl9IHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiB0YXJnZXQ9XCJfYmxhbmtcIj57c3VifTwvYT4sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYnV0dG9uVGV4dCA9IF90KFwiSW52aXRlXCIpO1xuICAgICAgICAgICAgZ29CdXR0b25GbiA9IHRoaXMuX2ludml0ZVVzZXJzO1xuXG4gICAgICAgICAgICBpZiAoY2xpLmlzUm9vbUVuY3J5cHRlZCh0aGlzLnByb3BzLnJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZpc2liaWxpdHlFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICBcIm0ucm9vbS5oaXN0b3J5X3Zpc2liaWxpdHlcIiwgXCJcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZpc2liaWxpdHkgPSB2aXNpYmlsaXR5RXZlbnQgJiYgdmlzaWJpbGl0eUV2ZW50LmdldENvbnRlbnQoKSAmJlxuICAgICAgICAgICAgICAgICAgICB2aXNpYmlsaXR5RXZlbnQuZ2V0Q29udGVudCgpLmhpc3RvcnlfdmlzaWJpbGl0eTtcbiAgICAgICAgICAgICAgICBpZiAodmlzaWJpbGl0eSA9PT0gXCJ3b3JsZF9yZWFkYWJsZVwiIHx8IHZpc2liaWxpdHkgPT09IFwic2hhcmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5U2hhcmluZ1dhcm5pbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfaGVscFRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGVtZW50LWljb25zL2luZm8uc3ZnXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17MTR9IGhlaWdodD17MTR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1wiIFwiICsgX3QoXCJJbnZpdGVkIHBlb3BsZSB3aWxsIGJlIGFibGUgdG8gcmVhZCBvbGQgbWVzc2FnZXMuXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5raW5kID09PSBLSU5EX0NBTExfVFJBTlNGRVIpIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJUcmFuc2ZlclwiKTtcbiAgICAgICAgICAgIGJ1dHRvblRleHQgPSBfdChcIlRyYW5zZmVyXCIpO1xuICAgICAgICAgICAgZ29CdXR0b25GbiA9IHRoaXMuX3RyYW5zZmVyQ2FsbDtcbiAgICAgICAgICAgIGNvbnN1bHRTZWN0aW9uID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXt0aGlzLnN0YXRlLmNvbnN1bHRGaXJzdH0gb25DaGFuZ2U9e3RoaXMub25Db25zdWx0Rmlyc3RDaGFuZ2V9IC8+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkNvbnN1bHQgZmlyc3RcIil9XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmtub3duIGtpbmQgb2YgSW52aXRlRGlhbG9nOiBcIiArIHRoaXMucHJvcHMua2luZCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoYXNTZWxlY3Rpb24gPSB0aGlzLnN0YXRlLnRhcmdldHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgfHwgKHRoaXMuc3RhdGUuZmlsdGVyVGV4dCAmJiB0aGlzLnN0YXRlLmZpbHRlclRleHQuaW5jbHVkZXMoJ0AnKSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nJ1xuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX2hlbHBUZXh0Jz57aGVscFRleHR9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX2FkZHJlc3NCYXInPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckVkaXRvcigpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19idXR0b25BbmRTcGlubmVyJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2dvQnV0dG9uRm59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX2dvQnV0dG9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5IHx8ICFoYXNTZWxlY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YnV0dG9uVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3NwaW5uZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtrZXlTaGFyaW5nV2FybmluZ31cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlcklkZW50aXR5U2VydmVyV2FybmluZygpfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZXJyb3InPnt0aGlzLnN0YXRlLmVycm9yVGV4dH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyU2VjdGlvbnMnPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlclNlY3Rpb24oJ3JlY2VudHMnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJTZWN0aW9uKCdzdWdnZXN0aW9ucycpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge2NvbnN1bHRTZWN0aW9ufVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
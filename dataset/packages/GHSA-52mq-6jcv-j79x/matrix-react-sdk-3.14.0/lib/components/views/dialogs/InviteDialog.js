"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

var _contentRepo = require("matrix-js-sdk/src/content-repo");

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

/*
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
      url: (0, _contentRepo.getHttpUriForMxc)(_MatrixClientPeg.MatrixClientPeg.get().getHomeserverUrl(), this.props.member.getMxcAvatarUrl(), avatarSize, avatarSize, "crop"),
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
      url: (0, _contentRepo.getHttpUriForMxc)(_MatrixClientPeg.MatrixClientPeg.get().getHomeserverUrl(), this.props.member.getMxcAvatarUrl(), avatarSize, avatarSize, "crop"),
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

class InviteDialog extends _react.default.PureComponent
/*:: <IInviteDialogProps, IInviteDialogState>*/
{
  // actually number because we're in the browser
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_debounceTimer", null);
    (0, _defineProperty2.default)(this, "_editorRef", null);
    (0, _defineProperty2.default)(this, "_startDm", async () => {
      this.setState({
        busy: true
      });

      const targets = this._convertFilter();

      const targetIds = targets.map(t => t.userId); // Check if there is already a DM with these people and reuse it if possible.

      let existingRoom
      /*: Room*/
      ;

      if (targetIds.length === 1) {
        existingRoom = (0, _createRoom.findDMForUser)(_MatrixClientPeg.MatrixClientPeg.get(), targetIds[0]);
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
          const client = _MatrixClientPeg.MatrixClientPeg.get();

          const allHaveDeviceKeys = await (0, _createRoom.canEncryptToAllUsers)(client, targetIds);

          if (allHaveDeviceKeys) {
            createRoomOptions.encryption = true;
          }
        }
      } // Check if it's a traditional DM and create the room if required.
      // TODO: [Canonical DMs] Remove this check and instead just create the multi-person DM


      let createRoomPromise = Promise.resolve(null);

      const isSelf = targetIds.length === 1 && targetIds[0] === _MatrixClientPeg.MatrixClientPeg.get().getUserId();

      if (targetIds.length === 1 && !isSelf) {
        createRoomOptions.dmUserId = targetIds[0];
        createRoomPromise = (0, _createRoom.default)(createRoomOptions);
      } else if (isSelf) {
        createRoomPromise = (0, _createRoom.default)(createRoomOptions);
      } else {
        // Create a boring room and try to invite the targets manually.
        createRoomPromise = (0, _createRoom.default)(createRoomOptions).then(roomId => {
          return (0, _RoomInvite.inviteMultipleToRoom)(roomId, targetIds);
        }).then(result => {
          if (this._shouldAbortAfterInviteError(result)) {
            return true; // abort
          }
        });
      } // the createRoom call will show the room for us, so we don't need to worry about that.


      createRoomPromise.then(abort => {
        if (abort === true) return; // only abort on true booleans, not roomIds or something

        this.props.onFinished();
      }).catch(err => {
        console.error(err);
        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("We couldn't create your DM. Please check the users you want to invite and try again.")
        });
      });
    });
    (0, _defineProperty2.default)(this, "_inviteUsers", () => {
      const startTime = _CountlyAnalytics.default.getTimestamp();

      this.setState({
        busy: true
      });

      this._convertFilter();

      const targets = this._convertFilter();

      const targetIds = targets.map(t => t.userId);

      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

      if (!room) {
        console.error("Failed to find the room to invite users to");
        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("Something went wrong trying to invite the users.")
        });
        return;
      }

      (0, _RoomInvite.inviteMultipleToRoom)(this.props.roomId, targetIds).then(result => {
        _CountlyAnalytics.default.instance.trackSendInvite(startTime, this.props.roomId, targetIds.length);

        if (!this._shouldAbortAfterInviteError(result)) {
          // handles setting error message too
          this.props.onFinished();
        }
      }).catch(err => {
        console.error(err);
        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("We couldn't invite those users. Please check the users you want to invite and try again.")
        });
      });
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

    const identityServersEnabled = _SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer);

    const userId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

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
      title = (0, _languageHandler._t)("Invite to this room");

      if (identityServersEnabled) {
        helpText = (0, _languageHandler._t)("Invite someone using their name, email address, username (like <userId/>) or " + "<a>share this room</a>.", {}, {
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
      } else {
        helpText = (0, _languageHandler._t)("Invite someone using their name, username (like <userId/>) or <a>share this room</a>.", {}, {
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
      }

      buttonText = (0, _languageHandler._t)("Invite");
      goButtonFn = this._inviteUsers;
    } else if (this.props.kind === KIND_CALL_TRANSFER) {
      title = (0, _languageHandler._t)("Transfer");
      buttonText = (0, _languageHandler._t)("Transfer");
      goButtonFn = this._transferCall;
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
    }, buttonText), spinner)), this._renderIdentityServerWarning(), /*#__PURE__*/_react.default.createElement("div", {
      className: "error"
    }, this.state.errorText), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_userSections"
    }, this._renderSection('recents'), this._renderSection('suggestions'))));
  }

}

exports.default = InviteDialog;
(0, _defineProperty2.default)(InviteDialog, "defaultProps", {
  kind: KIND_DM,
  initialText: ""
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvSW52aXRlRGlhbG9nLnRzeCJdLCJuYW1lcyI6WyJLSU5EX0RNIiwiS0lORF9JTlZJVEUiLCJLSU5EX0NBTExfVFJBTlNGRVIiLCJJTklUSUFMX1JPT01TX1NIT1dOIiwiSU5DUkVNRU5UX1JPT01TX1NIT1dOIiwiTWVtYmVyIiwibmFtZSIsIkVycm9yIiwidXNlcklkIiwiZ2V0TXhjQXZhdGFyVXJsIiwiRGlyZWN0b3J5TWVtYmVyIiwiY29uc3RydWN0b3IiLCJ1c2VyRGlyUmVzdWx0IiwiX3VzZXJJZCIsInVzZXJfaWQiLCJfZGlzcGxheU5hbWUiLCJkaXNwbGF5X25hbWUiLCJfYXZhdGFyVXJsIiwiYXZhdGFyX3VybCIsIlRocmVlcGlkTWVtYmVyIiwiaWQiLCJfaWQiLCJpc0VtYWlsIiwiaW5jbHVkZXMiLCJETVVzZXJUaWxlIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwicHJvcHMiLCJvblJlbW92ZSIsIm1lbWJlciIsInJlbmRlciIsIkJhc2VBdmF0YXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJBY2Nlc3NpYmxlQnV0dG9uIiwiYXZhdGFyU2l6ZSIsImF2YXRhciIsInJlcXVpcmUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRIb21lc2VydmVyVXJsIiwiY2xvc2VCdXR0b24iLCJfb25SZW1vdmUiLCJETVJvb21UaWxlIiwib25Ub2dnbGUiLCJfaGlnaGxpZ2h0TmFtZSIsInN0ciIsImhpZ2hsaWdodFdvcmQiLCJsb3dlclN0ciIsInRvTG93ZXJDYXNlIiwiZmlsdGVyU3RyIiwicmVzdWx0IiwiaSIsImlpIiwiaW5kZXhPZiIsInB1c2giLCJzdWJzdHJpbmciLCJzdWJzdHIiLCJsZW5ndGgiLCJ0aW1lc3RhbXAiLCJsYXN0QWN0aXZlVHMiLCJodW1hblRzIiwiY2hlY2ttYXJrIiwiaXNTZWxlY3RlZCIsInN0YWNrZWRBdmF0YXIiLCJjYXB0aW9uIiwiX29uQ2xpY2siLCJJbnZpdGVEaWFsb2ciLCJzZXRTdGF0ZSIsImJ1c3kiLCJ0YXJnZXRzIiwiX2NvbnZlcnRGaWx0ZXIiLCJ0YXJnZXRJZHMiLCJtYXAiLCJ0IiwiZXhpc3RpbmdSb29tIiwiRE1Sb29tTWFwIiwic2hhcmVkIiwiZ2V0RE1Sb29tRm9ySWRlbnRpZmllcnMiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21faWQiLCJyb29tSWQiLCJzaG91bGRfcGVlayIsImpvaW5pbmciLCJvbkZpbmlzaGVkIiwiY3JlYXRlUm9vbU9wdGlvbnMiLCJpbmxpbmVFcnJvcnMiLCJoYXMzUGlkTWVtYmVycyIsInNvbWUiLCJjbGllbnQiLCJhbGxIYXZlRGV2aWNlS2V5cyIsImVuY3J5cHRpb24iLCJjcmVhdGVSb29tUHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiaXNTZWxmIiwiZ2V0VXNlcklkIiwiZG1Vc2VySWQiLCJ0aGVuIiwiX3Nob3VsZEFib3J0QWZ0ZXJJbnZpdGVFcnJvciIsImFib3J0IiwiY2F0Y2giLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJlcnJvclRleHQiLCJzdGFydFRpbWUiLCJDb3VudGx5QW5hbHl0aWNzIiwiZ2V0VGltZXN0YW1wIiwicm9vbSIsImdldFJvb20iLCJpbnN0YW5jZSIsInRyYWNrU2VuZEludml0ZSIsImNhbGwiLCJ0cmFuc2ZlciIsInN0YXRlIiwidmFsdWUiLCJ0YXJnZXQiLCJ0cmltIiwiaGFzTW9kaWZpZXJzIiwiY3RybEtleSIsInNoaWZ0S2V5IiwibWV0YUtleSIsImtleSIsIktleSIsIkJBQ0tTUEFDRSIsIl9yZW1vdmVNZW1iZXIiLCJFTlRFUiIsIlNQQUNFIiwidGVybSIsInNlYXJjaFVzZXJEaXJlY3RvcnkiLCJyIiwiZmlsdGVyVGV4dCIsInJlc3VsdHMiLCJwcm9maWxlIiwiZ2V0UHJvZmlsZUluZm8iLCJzcGxpY2UiLCJ3YXJuIiwic2VydmVyUmVzdWx0c01peGluIiwidSIsInVzZXIiLCJjYW5Vc2VJZGVudGl0eVNlcnZlciIsInRyeWluZ0lkZW50aXR5U2VydmVyIiwiRW1haWwiLCJsb29rc1ZhbGlkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiSWRlbnRpdHlTZXJ2ZXIiLCJ0aHJlZXBpZFJlc3VsdHNNaXhpbiIsImF1dGhDbGllbnQiLCJJZGVudGl0eUF1dGhDbGllbnQiLCJ0b2tlbiIsImdldEFjY2Vzc1Rva2VuIiwibG9va3VwIiwibG9va3VwVGhyZWVQaWQiLCJ1bmRlZmluZWQiLCJteGlkIiwiZGlzcGxheW5hbWUiLCJfZGVib3VuY2VUaW1lciIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJfdXBkYXRlU3VnZ2VzdGlvbnMiLCJudW1SZWNlbnRzU2hvd24iLCJudW1TdWdnZXN0aW9uc1Nob3duIiwiaWR4IiwiX2VkaXRvclJlZiIsImN1cnJlbnQiLCJmb2N1cyIsInRleHQiLCJjbGlwYm9hcmREYXRhIiwiZ2V0RGF0YSIsInBvc3NpYmxlTWVtYmVycyIsInJlY2VudHMiLCJzdWdnZXN0aW9ucyIsInRvQWRkIiwiZmFpbGVkIiwicG90ZW50aWFsQWRkcmVzc2VzIiwic3BsaXQiLCJwIiwiZmlsdGVyIiwiYWRkcmVzcyIsImZpbmQiLCJtIiwiZGlzcGxheU5hbWUiLCJhdmF0YXJVcmwiLCJRdWVzdGlvbkRpYWxvZyIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJjc3ZOYW1lcyIsImpvaW4iLCJidXR0b24iLCJmaXJlIiwiQWN0aW9uIiwiVmlld1VzZXJTZXR0aW5ncyIsIkNvbW11bml0eVByb3RvdHlwZVN0b3JlIiwiZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCIsImtpbmQiLCJhbHJlYWR5SW52aXRlZCIsIlNldCIsIlNka0NvbmZpZyIsImdldE1lbWJlcnNXaXRoTWVtYmVyc2hpcCIsImZvckVhY2giLCJhZGQiLCJ0cmFja0JlZ2luSW52aXRlIiwiaW5pdGlhbFRleHQiLCJidWlsZFJlY2VudHMiLCJfYnVpbGRTdWdnZXN0aW9ucyIsImdldElkZW50aXR5U2VydmVyVXJsIiwiY29tcG9uZW50RGlkTW91bnQiLCJleGNsdWRlZFRhcmdldElkcyIsInJvb21zIiwiZ2V0VW5pcXVlUm9vbXNXaXRoSW5kaXZpZHVhbHMiLCJkbVRhZ2dlZFJvb21zIiwiUm9vbUxpc3RTdG9yZSIsIm9yZGVyZWRMaXN0cyIsIkRlZmF1bHRUYWdJRCIsIkRNIiwibXlVc2VySWQiLCJkbVJvb20iLCJvdGhlck1lbWJlcnMiLCJnZXRKb2luZWRNZW1iZXJzIiwiaGFzIiwiZ2V0TWVtYmVyIiwic2VhcmNoVHlwZXMiLCJtYXhTZWFyY2hFdmVudHMiLCJsYXN0RXZlbnRUcyIsInRpbWVsaW5lIiwiZXYiLCJnZXRUeXBlIiwiZ2V0VHMiLCJsYXN0QWN0aXZlIiwic29ydCIsImEiLCJiIiwibWF4Q29uc2lkZXJlZE1lbWJlcnMiLCJqb2luZWRSb29tcyIsImdldFJvb21zIiwiZ2V0TXlNZW1iZXJzaGlwIiwiZ2V0Sm9pbmVkTWVtYmVyQ291bnQiLCJtZW1iZXJSb29tcyIsInJlZHVjZSIsIm1lbWJlcnMiLCJnZXRVc2VySWRGb3JSb29tSWQiLCJqb2luZWRNZW1iZXJzIiwicGlja2VkTWVtYmVyUm9vbVNpemUiLCJtZW1iZXJTY29yZXMiLCJPYmplY3QiLCJ2YWx1ZXMiLCJzY29yZXMiLCJlbnRyeSIsIm51bU1lbWJlcnNUb3RhbCIsImMiLCJtYXhSYW5nZSIsIm51bVJvb21zIiwic2NvcmUiLCJNYXRoIiwibWF4IiwicG93IiwidHJ1ZUpvaW5lZFJvb21zIiwibm93IiwiRGF0ZSIsImdldFRpbWUiLCJlYXJsaWVzdEFnZUNvbnNpZGVyZWQiLCJtYXhNZXNzYWdlc0NvbnNpZGVyZWQiLCJsYXN0U3Bva2UiLCJsYXN0U3Bva2VNZW1iZXJzIiwiaXNEbSIsImtleXMiLCJ0YWdzIiwiZXZlbnRzIiwiZ2V0TGl2ZVRpbWVsaW5lIiwiZ2V0RXZlbnRzIiwiZ2V0U2VuZGVyIiwidHMiLCJkaXN0YW5jZUZyb21Ob3ciLCJhYnMiLCJpbnZlcnNlVGltZSIsInNjb3JlQm9vc3QiLCJyZWNvcmQiLCJsb2NhbGVDb21wYXJlIiwiZmFpbGVkVXNlcnMiLCJzdGF0ZXMiLCJsb2ciLCJjc3ZVc2VycyIsIm5ld01lbWJlciIsInN0YXJ0c1dpdGgiLCJuZXdUYXJnZXRzIiwiX3JlbmRlclNlY3Rpb24iLCJzb3VyY2VNZW1iZXJzIiwic2hvd051bSIsInNob3dNb3JlRm4iLCJfc2hvd01vcmVSZWNlbnRzIiwiYmluZCIsIl9zaG93TW9yZVN1Z2dlc3Rpb25zIiwic2VjdGlvbk5hbWUiLCJzZWN0aW9uU3VibmFtZSIsImNvbW11bml0eU5hbWUiLCJnZXRTZWxlY3RlZENvbW11bml0eU5hbWUiLCJwcmlvcml0eUFkZGl0aW9uYWxNZW1iZXJzIiwib3RoZXJBZGRpdGlvbmFsTWVtYmVycyIsImhhc01peGlucyIsIm5vdEFscmVhZHlFeGlzdHMiLCJoYXNBZGRpdGlvbmFsTWVtYmVycyIsImZpbHRlckJ5IiwidG9SZW5kZXIiLCJzbGljZSIsImhhc01vcmUiLCJzaG93TW9yZSIsInRpbGVzIiwiX3RvZ2dsZU1lbWJlciIsIl9yZW5kZXJFZGl0b3IiLCJpbnB1dCIsIl9vbktleURvd24iLCJfdXBkYXRlRmlsdGVyIiwiX29uUGFzdGUiLCJfb25DbGlja0lucHV0QXJlYSIsIl9yZW5kZXJJZGVudGl0eVNlcnZlcldhcm5pbmciLCJkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJOYW1lIiwiZGVmYXVsdCIsInN1YiIsIl9vblVzZURlZmF1bHRJZGVudGl0eVNlcnZlckNsaWNrIiwic2V0dGluZ3MiLCJfb25NYW5hZ2VTZXR0aW5nc0NsaWNrIiwiQmFzZURpYWxvZyIsIlNwaW5uZXIiLCJzcGlubmVyIiwiaGVscFRleHQiLCJidXR0b25UZXh0IiwiZ29CdXR0b25GbiIsImlkZW50aXR5U2VydmVyc0VuYWJsZWQiLCJpbnZpdGVUZXh0IiwiX29uQ29tbXVuaXR5SW52aXRlQ2xpY2siLCJfc3RhcnREbSIsIl9pbnZp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SmxDLE9BTUtSLFVBTkwsQ0FESixFQVNLRixPQVRMLENBRkosQ0FGSixFQWdCSyxLQUFLViw0QkFBTCxFQWhCTCxlQWlCSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FBd0IsS0FBSzVNLEtBQUwsQ0FBV1YsU0FBbkMsQ0FqQkosZUFrQkk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0ssS0FBS3lMLGNBQUwsQ0FBb0IsU0FBcEIsQ0FETCxFQUVLLEtBQUtBLGNBQUwsQ0FBb0IsYUFBcEIsQ0FGTCxDQWxCSixDQU5KLENBREo7QUFnQ0g7O0FBMzlCaUc7Ozs4QkFBakZqTyxZLGtCQUNLO0FBQ2xCc0ksRUFBQUEsSUFBSSxFQUFFNU0sT0FEWTtBQUVsQm9OLEVBQUFBLFdBQVcsRUFBRTtBQUZLLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQge21ha2VSb29tUGVybWFsaW5rLCBtYWtlVXNlclBlcm1hbGlua30gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRE1Sb29tTWFwXCI7XG5pbXBvcnQge1Jvb21NZW1iZXJ9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IHtnZXRIdHRwVXJpRm9yTXhjfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY29udGVudC1yZXBvXCI7XG5pbXBvcnQgKiBhcyBFbWFpbCBmcm9tIFwiLi4vLi4vLi4vZW1haWxcIjtcbmltcG9ydCB7Z2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsLCB1c2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXJ9IGZyb20gXCIuLi8uLi8uLi91dGlscy9JZGVudGl0eVNlcnZlclV0aWxzXCI7XG5pbXBvcnQge2FiYnJldmlhdGVVcmx9IGZyb20gXCIuLi8uLi8uLi91dGlscy9VcmxVdGlsc1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgSWRlbnRpdHlBdXRoQ2xpZW50IGZyb20gXCIuLi8uLi8uLi9JZGVudGl0eUF1dGhDbGllbnRcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7aHVtYW5pemVUaW1lfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvaHVtYW5pemVcIjtcbmltcG9ydCBjcmVhdGVSb29tLCB7Y2FuRW5jcnlwdFRvQWxsVXNlcnMsIGZpbmRETUZvclVzZXIsIHByaXZhdGVTaG91bGRCZUVuY3J5cHRlZH0gZnJvbSBcIi4uLy4uLy4uL2NyZWF0ZVJvb21cIjtcbmltcG9ydCB7aW52aXRlTXVsdGlwbGVUb1Jvb20sIHNob3dDb21tdW5pdHlJbnZpdGVEaWFsb2d9IGZyb20gXCIuLi8uLi8uLi9Sb29tSW52aXRlXCI7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHtEZWZhdWx0VGFnSUR9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L21vZGVsc1wiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IHtDb21tdW5pdHlQcm90b3R5cGVTdG9yZX0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Db21tdW5pdHlQcm90b3R5cGVTdG9yZVwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vLi4vLi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IHtSb29tfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IE1hdHJpeENhbGwgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5cbi8vIHdlIGhhdmUgYSBudW1iZXIgb2YgdHlwZXMgZGVmaW5lZCBmcm9tIHRoZSBNYXRyaXggc3BlYyB3aGljaCBjYW4ndCByZWFzb25hYmx5IGJlIGFsdGVyZWQgaGVyZS5cbi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuXG5leHBvcnQgY29uc3QgS0lORF9ETSA9IFwiZG1cIjtcbmV4cG9ydCBjb25zdCBLSU5EX0lOVklURSA9IFwiaW52aXRlXCI7XG5leHBvcnQgY29uc3QgS0lORF9DQUxMX1RSQU5TRkVSID0gXCJjYWxsX3RyYW5zZmVyXCI7XG5cbmNvbnN0IElOSVRJQUxfUk9PTVNfU0hPV04gPSAzOyAvLyBOdW1iZXIgb2Ygcm9vbXMgdG8gc2hvdyBhdCBmaXJzdFxuY29uc3QgSU5DUkVNRU5UX1JPT01TX1NIT1dOID0gNTsgLy8gTnVtYmVyIG9mIHJvb21zIHRvIGFkZCB3aGVuICdzaG93IG1vcmUnIGlzIGNsaWNrZWRcblxuLy8gVGhpcyBpcyB0aGUgaW50ZXJmYWNlIHRoYXQgaXMgZXhwZWN0ZWQgYnkgdmFyaW91cyBjb21wb25lbnRzIGluIHRoaXMgZmlsZS4gSXQgaXMgYSBiaXRcbi8vIGF3a3dhcmQgYmVjYXVzZSBpdCBhbHNvIG1hdGNoZXMgdGhlIFJvb21NZW1iZXIgY2xhc3MgZnJvbSB0aGUganMtc2RrIHdpdGggc29tZSBleHRyYSBzdXBwb3J0XG4vLyBmb3IgM1BJRHMvZW1haWwgYWRkcmVzc2VzLlxuLy9cbi8vIFhYWDogV2Ugc2hvdWxkIHVzZSBUeXBlU2NyaXB0IGludGVyZmFjZXMgaW5zdGVhZCBvZiB0aGlzIHdlaXJkIFwiYWJzdHJhY3RcIiBjbGFzcy5cbmNsYXNzIE1lbWJlciB7XG4gICAgLyoqXG4gICAgICogVGhlIGRpc3BsYXkgbmFtZSBvZiB0aGlzIE1lbWJlci4gRm9yIHVzZXJzIHRoaXMgc2hvdWxkIGJlIHRoZWlyIHByb2ZpbGUncyBkaXNwbGF5XG4gICAgICogbmFtZSBvciB1c2VyIElEIGlmIG5vbmUgc2V0LiBGb3IgM1BJRHMgdGhpcyBzaG91bGQgYmUgdGhlIDNQSUQgYWRkcmVzcyAoZW1haWwpLlxuICAgICAqL1xuICAgIGdldCBuYW1lKCk6IHN0cmluZyB7IHRocm93IG5ldyBFcnJvcihcIk1lbWJlciBjbGFzcyBub3QgaW1wbGVtZW50ZWRcIik7IH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBJRCBvZiB0aGlzIE1lbWJlci4gRm9yIHVzZXJzIHRoaXMgc2hvdWxkIGJlIHRoZWlyIHVzZXIgSUQuIEZvciAzUElEcyB0aGlzIHNob3VsZFxuICAgICAqIGJlIHRoZSAzUElEIGFkZHJlc3MgKGVtYWlsKS5cbiAgICAgKi9cbiAgICBnZXQgdXNlcklkKCk6IHN0cmluZyB7IHRocm93IG5ldyBFcnJvcihcIk1lbWJlciBjbGFzcyBub3QgaW1wbGVtZW50ZWRcIik7IH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIE1YQyBVUkwgb2YgdGhpcyBNZW1iZXIncyBhdmF0YXIuIEZvciB1c2VycyB0aGlzIHNob3VsZCBiZSB0aGVpciBwcm9maWxlJ3NcbiAgICAgKiBhdmF0YXIgTVhDIFVSTCBvciBudWxsIGlmIG5vbmUgc2V0LiBGb3IgM1BJRHMgdGhpcyBzaG91bGQgYWx3YXlzIGJlIG51bGwuXG4gICAgICovXG4gICAgZ2V0TXhjQXZhdGFyVXJsKCk6IHN0cmluZyB7IHRocm93IG5ldyBFcnJvcihcIk1lbWJlciBjbGFzcyBub3QgaW1wbGVtZW50ZWRcIik7IH1cbn1cblxuY2xhc3MgRGlyZWN0b3J5TWVtYmVyIGV4dGVuZHMgTWVtYmVyIHtcbiAgICBfdXNlcklkOiBzdHJpbmc7XG4gICAgX2Rpc3BsYXlOYW1lOiBzdHJpbmc7XG4gICAgX2F2YXRhclVybDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodXNlckRpclJlc3VsdDoge3VzZXJfaWQ6IHN0cmluZywgZGlzcGxheV9uYW1lOiBzdHJpbmcsIGF2YXRhcl91cmw6IHN0cmluZ30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fdXNlcklkID0gdXNlckRpclJlc3VsdC51c2VyX2lkO1xuICAgICAgICB0aGlzLl9kaXNwbGF5TmFtZSA9IHVzZXJEaXJSZXN1bHQuZGlzcGxheV9uYW1lO1xuICAgICAgICB0aGlzLl9hdmF0YXJVcmwgPSB1c2VyRGlyUmVzdWx0LmF2YXRhcl91cmw7XG4gICAgfVxuXG4gICAgLy8gVGhlc2UgbmV4dCBjbGFzcyBtZW1iZXJzIGFyZSBmb3IgdGhlIE1lbWJlciBpbnRlcmZhY2VcbiAgICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlzcGxheU5hbWUgfHwgdGhpcy5fdXNlcklkO1xuICAgIH1cblxuICAgIGdldCB1c2VySWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VzZXJJZDtcbiAgICB9XG5cbiAgICBnZXRNeGNBdmF0YXJVcmwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F2YXRhclVybDtcbiAgICB9XG59XG5cbmNsYXNzIFRocmVlcGlkTWVtYmVyIGV4dGVuZHMgTWVtYmVyIHtcbiAgICBfaWQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5faWQgPSBpZDtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGlzIGEgZ2V0dGVyIHRoYXQgd291bGQgYmUgZmFsc2V5IG9uIGFsbCBvdGhlciBpbXBsZW1lbnRhdGlvbnMuIFVudGlsIHdlIGhhdmVcbiAgICAvLyBiZXR0ZXIgdHlwZSBzdXBwb3J0IGluIHRoZSByZWFjdC1zZGsgd2UgY2FuIHVzZSB0aGlzIHRyaWNrIHRvIGRldGVybWluZSB0aGUga2luZFxuICAgIC8vIG9mIDNQSUQgd2UncmUgZGVhbGluZyB3aXRoLCBpZiBhbnkuXG4gICAgZ2V0IGlzRW1haWwoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZC5pbmNsdWRlcygnQCcpO1xuICAgIH1cblxuICAgIC8vIFRoZXNlIG5leHQgY2xhc3MgbWVtYmVycyBhcmUgZm9yIHRoZSBNZW1iZXIgaW50ZXJmYWNlXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgIH1cblxuICAgIGdldCB1c2VySWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgIH1cblxuICAgIGdldE14Y0F2YXRhclVybCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJRE1Vc2VyVGlsZVByb3BzIHtcbiAgICBtZW1iZXI6IFJvb21NZW1iZXI7XG4gICAgb25SZW1vdmU6IChSb29tTWVtYmVyKSA9PiBhbnk7XG59XG5cbmNsYXNzIERNVXNlclRpbGUgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElETVVzZXJUaWxlUHJvcHM+IHtcbiAgICBfb25SZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgICAvLyBTdG9wIHRoZSBicm93c2VyIGZyb20gaGlnaGxpZ2h0aW5nIHRleHRcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5tZW1iZXIpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuYXZhdGFycy5CYXNlQXZhdGFyXCIpO1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkFjY2Vzc2libGVCdXR0b25cIik7XG5cbiAgICAgICAgY29uc3QgYXZhdGFyU2l6ZSA9IDIwO1xuICAgICAgICBjb25zdCBhdmF0YXIgPSB0aGlzLnByb3BzLm1lbWJlci5pc0VtYWlsXG4gICAgICAgICAgICA/IDxpbWdcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyVGlsZV9hdmF0YXIgbXhfSW52aXRlRGlhbG9nX3VzZXJUaWxlX3RocmVlcGlkQXZhdGFyJ1xuICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvaWNvbi1lbWFpbC1waWxsLWF2YXRhci5zdmdcIil9XG4gICAgICAgICAgICAgICAgd2lkdGg9e2F2YXRhclNpemV9IGhlaWdodD17YXZhdGFyU2l6ZX0gLz5cbiAgICAgICAgICAgIDogPEJhc2VBdmF0YXJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyVGlsZV9hdmF0YXInXG4gICAgICAgICAgICAgICAgdXJsPXtnZXRIdHRwVXJpRm9yTXhjKFxuICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SG9tZXNlcnZlclVybCgpLCB0aGlzLnByb3BzLm1lbWJlci5nZXRNeGNBdmF0YXJVcmwoKSxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyU2l6ZSwgYXZhdGFyU2l6ZSwgXCJjcm9wXCIpfVxuICAgICAgICAgICAgICAgIG5hbWU9e3RoaXMucHJvcHMubWVtYmVyLm5hbWV9XG4gICAgICAgICAgICAgICAgaWROYW1lPXt0aGlzLnByb3BzLm1lbWJlci51c2VySWR9XG4gICAgICAgICAgICAgICAgd2lkdGg9e2F2YXRhclNpemV9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXthdmF0YXJTaXplfSAvPjtcblxuICAgICAgICBsZXQgY2xvc2VCdXR0b247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uUmVtb3ZlKSB7XG4gICAgICAgICAgICBjbG9zZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyVGlsZV9yZW1vdmUnXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uUmVtb3ZlfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2ljb24tcGlsbC1yZW1vdmUuc3ZnXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtfdCgnUmVtb3ZlJyl9IHdpZHRoPXs4fSBoZWlnaHQ9ezh9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyVGlsZSc+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfdXNlclRpbGVfcGlsbCc+XG4gICAgICAgICAgICAgICAgICAgIHthdmF0YXJ9XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3VzZXJUaWxlX25hbWUnPnt0aGlzLnByb3BzLm1lbWJlci5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgeyBjbG9zZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSURNUm9vbVRpbGVQcm9wcyB7XG4gICAgbWVtYmVyOiBSb29tTWVtYmVyO1xuICAgIGxhc3RBY3RpdmVUczogbnVtYmVyO1xuICAgIG9uVG9nZ2xlOiAoUm9vbU1lbWJlcikgPT4gYW55O1xuICAgIGhpZ2hsaWdodFdvcmQ6IHN0cmluZztcbiAgICBpc1NlbGVjdGVkOiBib29sZWFuO1xufVxuXG5jbGFzcyBETVJvb21UaWxlIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJRE1Sb29tVGlsZVByb3BzPiB7XG4gICAgX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICAvLyBTdG9wIHRoZSBicm93c2VyIGZyb20gaGlnaGxpZ2h0aW5nIHRleHRcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25Ub2dnbGUodGhpcy5wcm9wcy5tZW1iZXIpO1xuICAgIH07XG5cbiAgICBfaGlnaGxpZ2h0TmFtZShzdHI6IHN0cmluZykge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuaGlnaGxpZ2h0V29yZCkgcmV0dXJuIHN0cjtcblxuICAgICAgICAvLyBXZSBjb252ZXJ0IHRoaW5ncyB0byBsb3dlcmNhc2UgZm9yIGluZGV4IHNlYXJjaGluZywgYnV0IHB1bGwgc3Vic3RyaW5ncyBmcm9tXG4gICAgICAgIC8vIHRoZSBzdWJtaXR0ZWQgdGV4dCB0byBwcmVzZXJ2ZSBjYXNlLiBOb3RlOiB3ZSBkb24ndCBuZWVkIHRvIGh0bWxFbnRpdGllcyB0aGVcbiAgICAgICAgLy8gc3RyaW5nIGJlY2F1c2UgUmVhY3Qgd2lsbCBzYWZlbHkgZW5jb2RlIHRoZSB0ZXh0IGZvciB1cy5cbiAgICAgICAgY29uc3QgbG93ZXJTdHIgPSBzdHIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgZmlsdGVyU3RyID0gdGhpcy5wcm9wcy5oaWdobGlnaHRXb3JkLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgaWk7XG4gICAgICAgIHdoaWxlICgoaWkgPSBsb3dlclN0ci5pbmRleE9mKGZpbHRlclN0ciwgaSkpID49IDApIHtcbiAgICAgICAgICAgIC8vIFB1c2ggYW55IHRleHQgd2UgbWlzc2VkIChmaXJzdCBiaXQvbWlkZGxlIG9mIHRleHQpXG4gICAgICAgICAgICBpZiAoaWkgPiBpKSB7XG4gICAgICAgICAgICAgICAgLy8gUHVzaCBhbnkgdGV4dCB3ZSBhcmVuJ3QgaGlnaGxpZ2h0aW5nIChtaWRkbGUgb2YgdGV4dCBtYXRjaCwgb3IgYmVnaW5uaW5nIG9mIHRleHQpXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goPHNwYW4ga2V5PXtpICsgJ2JlZ2luJ30+e3N0ci5zdWJzdHJpbmcoaSwgaWkpfTwvc3Bhbj4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpID0gaWk7IC8vIGNvcHkgb3ZlciBpaSBvbmx5IGlmIHdlIGhhdmUgYSBtYXRjaCAodG8gcHJlc2VydmUgaSBmb3IgZW5kLW9mLXRleHQgbWF0Y2hpbmcpXG5cbiAgICAgICAgICAgIC8vIEhpZ2hsaWdodCB0aGUgd29yZCB0aGUgdXNlciBlbnRlcmVkXG4gICAgICAgICAgICBjb25zdCBzdWJzdHIgPSBzdHIuc3Vic3RyaW5nKGksIGZpbHRlclN0ci5sZW5ndGggKyBpKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKDxzcGFuIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3Jvb21UaWxlX2hpZ2hsaWdodCcga2V5PXtpICsgJ2JvbGQnfT57c3Vic3RyfTwvc3Bhbj4pO1xuICAgICAgICAgICAgaSArPSBzdWJzdHIubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHVzaCBhbnkgdGV4dCB3ZSBtaXNzZWQgKGVuZCBvZiB0ZXh0KVxuICAgICAgICBpZiAoaSA8IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKDxzcGFuIGtleT17aSArICdlbmQnfT57c3RyLnN1YnN0cmluZyhpKX08L3NwYW4+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBCYXNlQXZhdGFyID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmF2YXRhcnMuQmFzZUF2YXRhclwiKTtcblxuICAgICAgICBsZXQgdGltZXN0YW1wID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubGFzdEFjdGl2ZVRzKSB7XG4gICAgICAgICAgICBjb25zdCBodW1hblRzID0gaHVtYW5pemVUaW1lKHRoaXMucHJvcHMubGFzdEFjdGl2ZVRzKTtcbiAgICAgICAgICAgIHRpbWVzdGFtcCA9IDxzcGFuIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3Jvb21UaWxlX3RpbWUnPntodW1hblRzfTwvc3Bhbj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhdmF0YXJTaXplID0gMzY7XG4gICAgICAgIGNvbnN0IGF2YXRhciA9IHRoaXMucHJvcHMubWVtYmVyLmlzRW1haWxcbiAgICAgICAgICAgID8gPGltZ1xuICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvaWNvbi1lbWFpbC1waWxsLWF2YXRhci5zdmdcIil9XG4gICAgICAgICAgICAgICAgd2lkdGg9e2F2YXRhclNpemV9IGhlaWdodD17YXZhdGFyU2l6ZX0gLz5cbiAgICAgICAgICAgIDogPEJhc2VBdmF0YXJcbiAgICAgICAgICAgICAgICB1cmw9e2dldEh0dHBVcmlGb3JNeGMoXG4gICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRIb21lc2VydmVyVXJsKCksIHRoaXMucHJvcHMubWVtYmVyLmdldE14Y0F2YXRhclVybCgpLFxuICAgICAgICAgICAgICAgICAgICBhdmF0YXJTaXplLCBhdmF0YXJTaXplLCBcImNyb3BcIil9XG4gICAgICAgICAgICAgICAgbmFtZT17dGhpcy5wcm9wcy5tZW1iZXIubmFtZX1cbiAgICAgICAgICAgICAgICBpZE5hbWU9e3RoaXMucHJvcHMubWVtYmVyLnVzZXJJZH1cbiAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9e2F2YXRhclNpemV9IC8+O1xuXG4gICAgICAgIGxldCBjaGVja21hcmsgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAvLyBUbyByZWR1Y2UgZmxpY2tlcmluZyB3ZSBwdXQgdGhlICdzZWxlY3RlZCcgcm9vbSB0aWxlIGFib3ZlIHRoZSByZWFsIGF2YXRhclxuICAgICAgICAgICAgY2hlY2ttYXJrID0gPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19yb29tVGlsZV9zZWxlY3RlZCcgLz47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUbyByZWR1Y2UgZmxpY2tlcmluZyB3ZSBwdXQgdGhlIGNoZWNrbWFyayBvbiB0b3Agb2YgdGhlIGFjdHVhbCBhdmF0YXIgKHByZXZlbnRzXG4gICAgICAgIC8vIHRoZSBicm93c2VyIGZyb20gcmVsb2FkaW5nIHRoZSBpbWFnZSBzb3VyY2Ugd2hlbiB0aGUgYXZhdGFyIHJlbW91bnRzKS5cbiAgICAgICAgY29uc3Qgc3RhY2tlZEF2YXRhciA9IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3Jvb21UaWxlX2F2YXRhclN0YWNrJz5cbiAgICAgICAgICAgICAgICB7YXZhdGFyfVxuICAgICAgICAgICAgICAgIHtjaGVja21hcmt9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgY2FwdGlvbiA9IHRoaXMucHJvcHMubWVtYmVyLmlzRW1haWxcbiAgICAgICAgICAgID8gX3QoXCJJbnZpdGUgYnkgZW1haWxcIilcbiAgICAgICAgICAgIDogdGhpcy5faGlnaGxpZ2h0TmFtZSh0aGlzLnByb3BzLm1lbWJlci51c2VySWQpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3Jvb21UaWxlJyBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrfT5cbiAgICAgICAgICAgICAgICB7c3RhY2tlZEF2YXRhcn1cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9JbnZpdGVEaWFsb2dfcm9vbVRpbGVfbmFtZVN0YWNrXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfcm9vbVRpbGVfbmFtZSc+e3RoaXMuX2hpZ2hsaWdodE5hbWUodGhpcy5wcm9wcy5tZW1iZXIubmFtZSl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfcm9vbVRpbGVfdXNlcklkJz57Y2FwdGlvbn08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAge3RpbWVzdGFtcH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElJbnZpdGVEaWFsb2dQcm9wcyB7XG4gICAgLy8gVGFrZXMgYW4gYXJyYXkgb2YgdXNlciBJRHMvZW1haWxzIHRvIGludml0ZS5cbiAgICBvbkZpbmlzaGVkOiAodG9JbnZpdGU/OiBzdHJpbmdbXSkgPT4gYW55O1xuXG4gICAgLy8gVGhlIGtpbmQgb2YgaW52aXRlIGJlaW5nIHBlcmZvcm1lZC4gQXNzdW1lZCB0byBiZSBLSU5EX0RNIGlmXG4gICAgLy8gbm90IHByb3ZpZGVkLlxuICAgIGtpbmQ6IHN0cmluZyxcblxuICAgIC8vIFRoZSByb29tIElEIHRoaXMgZGlhbG9nIGlzIGZvci4gT25seSByZXF1aXJlZCBmb3IgS0lORF9JTlZJVEUuXG4gICAgcm9vbUlkOiBzdHJpbmcsXG5cbiAgICAvLyBUaGUgY2FsbCB0byB0cmFuc2Zlci4gT25seSByZXF1aXJlZCBmb3IgS0lORF9DQUxMX1RSQU5TRkVSLlxuICAgIGNhbGw6IE1hdHJpeENhbGwsXG5cbiAgICAvLyBJbml0aWFsIHZhbHVlIHRvIHBvcHVsYXRlIHRoZSBmaWx0ZXIgd2l0aFxuICAgIGluaXRpYWxUZXh0OiBzdHJpbmcsXG59XG5cbmludGVyZmFjZSBJSW52aXRlRGlhbG9nU3RhdGUge1xuICAgIHRhcmdldHM6IFJvb21NZW1iZXJbXTsgLy8gYXJyYXkgb2YgTWVtYmVyIG9iamVjdHMgKHNlZSBpbnRlcmZhY2UgYWJvdmUpXG4gICAgZmlsdGVyVGV4dDogc3RyaW5nO1xuICAgIHJlY2VudHM6IHsgdXNlcjogTWVtYmVyLCB1c2VySWQ6IHN0cmluZyB9W107XG4gICAgbnVtUmVjZW50c1Nob3duOiBudW1iZXI7XG4gICAgc3VnZ2VzdGlvbnM6IHsgdXNlcjogTWVtYmVyLCB1c2VySWQ6IHN0cmluZyB9W107XG4gICAgbnVtU3VnZ2VzdGlvbnNTaG93bjogbnVtYmVyO1xuICAgIHNlcnZlclJlc3VsdHNNaXhpbjogeyB1c2VyOiBNZW1iZXIsIHVzZXJJZDogc3RyaW5nIH1bXTtcbiAgICB0aHJlZXBpZFJlc3VsdHNNaXhpbjogeyB1c2VyOiBNZW1iZXIsIHVzZXJJZDogc3RyaW5nfVtdO1xuICAgIGNhblVzZUlkZW50aXR5U2VydmVyOiBib29sZWFuO1xuICAgIHRyeWluZ0lkZW50aXR5U2VydmVyOiBib29sZWFuO1xuXG4gICAgLy8gVGhlc2UgdHdvIGZsYWdzIGFyZSB1c2VkIGZvciB0aGUgJ0dvJyBidXR0b24gdG8gY29tbXVuaWNhdGUgd2hhdCBpcyBnb2luZyBvbi5cbiAgICBidXN5OiBib29sZWFuLFxuICAgIGVycm9yVGV4dDogc3RyaW5nLFxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnZpdGVEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElJbnZpdGVEaWFsb2dQcm9wcywgSUludml0ZURpYWxvZ1N0YXRlPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAga2luZDogS0lORF9ETSxcbiAgICAgICAgaW5pdGlhbFRleHQ6IFwiXCIsXG4gICAgfTtcblxuICAgIF9kZWJvdW5jZVRpbWVyOiBOb2RlSlMuVGltZW91dCA9IG51bGw7IC8vIGFjdHVhbGx5IG51bWJlciBiZWNhdXNlIHdlJ3JlIGluIHRoZSBicm93c2VyXG4gICAgX2VkaXRvclJlZjogYW55ID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBpZiAocHJvcHMua2luZCA9PT0gS0lORF9JTlZJVEUgJiYgIXByb3BzLnJvb21JZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2hlbiB1c2luZyBLSU5EX0lOVklURSBhIHJvb21JZCBpcyByZXF1aXJlZCBmb3IgYW4gSW52aXRlRGlhbG9nXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHByb3BzLmtpbmQgPT09IEtJTkRfQ0FMTF9UUkFOU0ZFUiAmJiAhcHJvcHMuY2FsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2hlbiB1c2luZyBLSU5EX0NBTExfVFJBTlNGRVIgYSBjYWxsIGlzIHJlcXVpcmVkIGZvciBhbiBJbnZpdGVEaWFsb2dcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhbHJlYWR5SW52aXRlZCA9IG5ldyBTZXQoW01hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSwgU2RrQ29uZmlnLmdldCgpWyd3ZWxjb21lVXNlcklkJ11dKTtcbiAgICAgICAgaWYgKHByb3BzLnJvb21JZCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHByb3BzLnJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIXJvb20pIHRocm93IG5ldyBFcnJvcihcIlJvb20gSUQgZ2l2ZW4gdG8gSW52aXRlRGlhbG9nIGRvZXMgbm90IGxvb2sgbGlrZSBhIHJvb21cIik7XG4gICAgICAgICAgICByb29tLmdldE1lbWJlcnNXaXRoTWVtYmVyc2hpcCgnaW52aXRlJykuZm9yRWFjaChtID0+IGFscmVhZHlJbnZpdGVkLmFkZChtLnVzZXJJZCkpO1xuICAgICAgICAgICAgcm9vbS5nZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAoJ2pvaW4nKS5mb3JFYWNoKG0gPT4gYWxyZWFkeUludml0ZWQuYWRkKG0udXNlcklkKSk7XG4gICAgICAgICAgICAvLyBhZGQgYmFubmVkIHVzZXJzLCBzbyB3ZSBkb24ndCB0cnkgdG8gaW52aXRlIHRoZW1cbiAgICAgICAgICAgIHJvb20uZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwKCdiYW4nKS5mb3JFYWNoKG0gPT4gYWxyZWFkeUludml0ZWQuYWRkKG0udXNlcklkKSk7XG5cbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tCZWdpbkludml0ZShwcm9wcy5yb29tSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHRhcmdldHM6IFtdLCAvLyBhcnJheSBvZiBNZW1iZXIgb2JqZWN0cyAoc2VlIGludGVyZmFjZSBhYm92ZSlcbiAgICAgICAgICAgIGZpbHRlclRleHQ6IHRoaXMucHJvcHMuaW5pdGlhbFRleHQsXG4gICAgICAgICAgICByZWNlbnRzOiBJbnZpdGVEaWFsb2cuYnVpbGRSZWNlbnRzKGFscmVhZHlJbnZpdGVkKSxcbiAgICAgICAgICAgIG51bVJlY2VudHNTaG93bjogSU5JVElBTF9ST09NU19TSE9XTixcbiAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiB0aGlzLl9idWlsZFN1Z2dlc3Rpb25zKGFscmVhZHlJbnZpdGVkKSxcbiAgICAgICAgICAgIG51bVN1Z2dlc3Rpb25zU2hvd246IElOSVRJQUxfUk9PTVNfU0hPV04sXG4gICAgICAgICAgICBzZXJ2ZXJSZXN1bHRzTWl4aW46IFtdLFxuICAgICAgICAgICAgdGhyZWVwaWRSZXN1bHRzTWl4aW46IFtdLFxuICAgICAgICAgICAgY2FuVXNlSWRlbnRpdHlTZXJ2ZXI6ICEhTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCksXG4gICAgICAgICAgICB0cnlpbmdJZGVudGl0eVNlcnZlcjogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIFRoZXNlIHR3byBmbGFncyBhcmUgdXNlZCBmb3IgdGhlICdHbycgYnV0dG9uIHRvIGNvbW11bmljYXRlIHdoYXQgaXMgZ29pbmcgb24uXG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yVGV4dDogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9lZGl0b3JSZWYgPSBjcmVhdGVSZWYoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaW5pdGlhbFRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN1Z2dlc3Rpb25zKHRoaXMucHJvcHMuaW5pdGlhbFRleHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGJ1aWxkUmVjZW50cyhleGNsdWRlZFRhcmdldElkczogU2V0PHN0cmluZz4pOiB7dXNlcklkOiBzdHJpbmcsIHVzZXI6IFJvb21NZW1iZXIsIGxhc3RBY3RpdmU6IG51bWJlcn1bXSB7XG4gICAgICAgIGNvbnN0IHJvb21zID0gRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVuaXF1ZVJvb21zV2l0aEluZGl2aWR1YWxzKCk7IC8vIG1hcCBvZiB1c2VySWQgPT4ganMtc2RrIFJvb21cblxuICAgICAgICAvLyBBbHNvIHB1bGwgaW4gYWxsIHRoZSByb29tcyB0YWdnZWQgYXMgRGVmYXVsdFRhZ0lELkRNIHNvIHdlIGRvbid0IG1pc3MgYW55dGhpbmcuIFNvbWV0aW1lcyB0aGVcbiAgICAgICAgLy8gcm9vbSBsaXN0IGRvZXNuJ3QgdGFnIHRoZSByb29tIGZvciB0aGUgRE1Sb29tTWFwLCBidXQgZG9lcyBmb3IgdGhlIHJvb20gbGlzdC5cbiAgICAgICAgY29uc3QgZG1UYWdnZWRSb29tcyA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzW0RlZmF1bHRUYWdJRC5ETV0gfHwgW107XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGRtUm9vbSBvZiBkbVRhZ2dlZFJvb21zKSB7XG4gICAgICAgICAgICBjb25zdCBvdGhlck1lbWJlcnMgPSBkbVJvb20uZ2V0Sm9pbmVkTWVtYmVycygpLmZpbHRlcih1ID0+IHUudXNlcklkICE9PSBteVVzZXJJZCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBvdGhlck1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAocm9vbXNbbWVtYmVyLnVzZXJJZF0pIGNvbnRpbnVlOyAvLyBhbHJlYWR5IGhhdmUgYSByb29tXG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEFkZGluZyBETSByb29tIGZvciAke21lbWJlci51c2VySWR9IGFzICR7ZG1Sb29tLnJvb21JZH0gZnJvbSB0YWcsIG5vdCBETSBtYXBgKTtcbiAgICAgICAgICAgICAgICByb29tc1ttZW1iZXIudXNlcklkXSA9IGRtUm9vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlY2VudHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCB1c2VySWQgaW4gcm9vbXMpIHtcbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgdXNlciBJRHMgdGhhdCBhcmUgYWxyZWFkeSBpbiB0aGUgcm9vbSAvIHNob3VsZCBiZSBleGNsdWRlZFxuICAgICAgICAgICAgaWYgKGV4Y2x1ZGVkVGFyZ2V0SWRzLmhhcyh1c2VySWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbSW52aXRlOlJlY2VudHNdIEV4Y2x1ZGluZyAke3VzZXJJZH0gZnJvbSByZWNlbnRzYCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSByb29tc1t1c2VySWRdO1xuICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gcm9vbS5nZXRNZW1iZXIodXNlcklkKTtcbiAgICAgICAgICAgIGlmICghbWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgLy8ganVzdCBza2lwIHBlb3BsZSB3aG8gZG9uJ3QgaGF2ZSBtZW1iZXJzaGlwcyBmb3Igc29tZSByZWFzb25cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtJbnZpdGU6UmVjZW50c10gJHt1c2VySWR9IGlzIG1pc3NpbmcgYSBtZW1iZXIgb2JqZWN0IGluIHRoZWlyIG93biBETSAoJHtyb29tLnJvb21JZH0pYCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGxhc3QgdGltZXN0YW1wIGZvciBhIG1lc3NhZ2UgZXZlbnRcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaFR5cGVzID0gW1wibS5yb29tLm1lc3NhZ2VcIiwgXCJtLnJvb20uZW5jcnlwdGVkXCIsIFwibS5zdGlja2VyXCJdO1xuICAgICAgICAgICAgY29uc3QgbWF4U2VhcmNoRXZlbnRzID0gMjA7IC8vIHRvIHByZXZlbnQgdHJhdmVyc2luZyBoaXN0b3J5XG4gICAgICAgICAgICBsZXQgbGFzdEV2ZW50VHMgPSAwO1xuICAgICAgICAgICAgaWYgKHJvb20udGltZWxpbmUgJiYgcm9vbS50aW1lbGluZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gcm9vbS50aW1lbGluZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldiA9IHJvb20udGltZWxpbmVbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWFyY2hUeXBlcy5pbmNsdWRlcyhldi5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0RXZlbnRUcyA9IGV2LmdldFRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocm9vbS50aW1lbGluZS5sZW5ndGggLSBpID4gbWF4U2VhcmNoRXZlbnRzKSBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWxhc3RFdmVudFRzKSB7XG4gICAgICAgICAgICAgICAgLy8gc29tZXRoaW5nIHdlaXJkIGlzIGdvaW5nIG9uIHdpdGggdGhpcyByb29tXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbSW52aXRlOlJlY2VudHNdICR7dXNlcklkfSAoJHtyb29tLnJvb21JZH0pIGhhcyBhIHdlaXJkIGxhc3QgdGltZXN0YW1wOiAke2xhc3RFdmVudFRzfWApO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZWNlbnRzLnB1c2goe3VzZXJJZCwgdXNlcjogbWVtYmVyLCBsYXN0QWN0aXZlOiBsYXN0RXZlbnRUc30pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcmVjZW50cykgY29uc29sZS53YXJuKFwiW0ludml0ZTpSZWNlbnRzXSBObyByZWNlbnRzIHRvIHN1Z2dlc3QhXCIpO1xuXG4gICAgICAgIC8vIFNvcnQgdGhlIHJlY2VudHMgYnkgbGFzdCBhY3RpdmUgdG8gc2F2ZSB1cyB0aW1lIGxhdGVyXG4gICAgICAgIHJlY2VudHMuc29ydCgoYSwgYikgPT4gYi5sYXN0QWN0aXZlIC0gYS5sYXN0QWN0aXZlKTtcblxuICAgICAgICByZXR1cm4gcmVjZW50cztcbiAgICB9XG5cbiAgICBfYnVpbGRTdWdnZXN0aW9ucyhleGNsdWRlZFRhcmdldElkczogU2V0PHN0cmluZz4pOiB7dXNlcklkOiBzdHJpbmcsIHVzZXI6IFJvb21NZW1iZXJ9W10ge1xuICAgICAgICBjb25zdCBtYXhDb25zaWRlcmVkTWVtYmVycyA9IDIwMDtcbiAgICAgICAgY29uc3Qgam9pbmVkUm9vbXMgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbXMoKVxuICAgICAgICAgICAgLmZpbHRlcihyID0+IHIuZ2V0TXlNZW1iZXJzaGlwKCkgPT09ICdqb2luJyAmJiByLmdldEpvaW5lZE1lbWJlckNvdW50KCkgPD0gbWF4Q29uc2lkZXJlZE1lbWJlcnMpO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlcyB7IHVzZXJJZDoge21lbWJlciwgcm9vbXNbXX0gfVxuICAgICAgICBjb25zdCBtZW1iZXJSb29tcyA9IGpvaW5lZFJvb21zLnJlZHVjZSgobWVtYmVycywgcm9vbSkgPT4ge1xuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCBETXMgKHdlJ2xsIGhhbmRsZSB0aGVzZSBpbiB0aGUgcmVjZW50cyBzZWN0aW9uKVxuICAgICAgICAgICAgaWYgKERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbS5yb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7IC8vIERvIG5vdGhpbmdcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgam9pbmVkTWVtYmVycyA9IHJvb20uZ2V0Sm9pbmVkTWVtYmVycygpLmZpbHRlcih1ID0+ICFleGNsdWRlZFRhcmdldElkcy5oYXModS51c2VySWQpKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIGpvaW5lZE1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgb3V0IHVzZXIgSURzIHRoYXQgYXJlIGFscmVhZHkgaW4gdGhlIHJvb20gLyBzaG91bGQgYmUgZXhjbHVkZWRcbiAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZWRUYXJnZXRJZHMuaGFzKG1lbWJlci51c2VySWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghbWVtYmVyc1ttZW1iZXIudXNlcklkXSkge1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW21lbWJlci51c2VySWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyOiBtZW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmFjayB0aGUgcm9vbSBzaXplIG9mIHRoZSAncGlja2VkJyBtZW1iZXIgc28gd2UgY2FuIHVzZSB0aGUgcHJvZmlsZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHNtYWxsZXN0IHJvb20gKGxpa2VseSBhIERNKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBpY2tlZE1lbWJlclJvb21TaXplOiByb29tLmdldEpvaW5lZE1lbWJlckNvdW50KCksXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tczogW10sXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbWVtYmVyc1ttZW1iZXIudXNlcklkXS5yb29tcy5wdXNoKHJvb20pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJvb20uZ2V0Sm9pbmVkTWVtYmVyQ291bnQoKSA8IG1lbWJlcnNbbWVtYmVyLnVzZXJJZF0ucGlja2VkTWVtYmVyUm9vbVNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1ttZW1iZXIudXNlcklkXS5tZW1iZXIgPSBtZW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbbWVtYmVyLnVzZXJJZF0ucGlja2VkTWVtYmVyUm9vbVNpemUgPSByb29tLmdldEpvaW5lZE1lbWJlckNvdW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7XG4gICAgICAgIH0sIHt9KTtcblxuICAgICAgICAvLyBHZW5lcmF0ZXMgeyB1c2VySWQ6IHttZW1iZXIsIG51bVJvb21zLCBzY29yZX0gfVxuICAgICAgICBjb25zdCBtZW1iZXJTY29yZXMgPSBPYmplY3QudmFsdWVzKG1lbWJlclJvb21zKS5yZWR1Y2UoKHNjb3JlcywgZW50cnk6IHttZW1iZXI6IFJvb21NZW1iZXIsIHJvb21zOiBSb29tW119KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBudW1NZW1iZXJzVG90YWwgPSBlbnRyeS5yb29tcy5yZWR1Y2UoKGMsIHIpID0+IGMgKyByLmdldEpvaW5lZE1lbWJlckNvdW50KCksIDApO1xuICAgICAgICAgICAgY29uc3QgbWF4UmFuZ2UgPSBtYXhDb25zaWRlcmVkTWVtYmVycyAqIGVudHJ5LnJvb21zLmxlbmd0aDtcbiAgICAgICAgICAgIHNjb3Jlc1tlbnRyeS5tZW1iZXIudXNlcklkXSA9IHtcbiAgICAgICAgICAgICAgICBtZW1iZXI6IGVudHJ5Lm1lbWJlcixcbiAgICAgICAgICAgICAgICBudW1Sb29tczogZW50cnkucm9vbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNjb3JlOiBNYXRoLm1heCgwLCBNYXRoLnBvdygxIC0gKG51bU1lbWJlcnNUb3RhbCAvIG1heFJhbmdlKSwgNSkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBzY29yZXM7XG4gICAgICAgIH0sIHt9KTtcblxuICAgICAgICAvLyBOb3cgdGhhdCB3ZSBoYXZlIHNjb3JlcyBmb3IgYmVpbmcgaW4gcm9vbXMsIGJvb3N0IHRob3NlIHBlb3BsZSB3aG8gaGF2ZSBzZW50IG1lc3NhZ2VzXG4gICAgICAgIC8vIHJlY2VudGx5LCBhcyBhIHdheSB0byBpbXByb3ZlIHRoZSBxdWFsaXR5IG9mIHN1Z2dlc3Rpb25zLiBXZSBkbyB0aGlzIGJ5IGNoZWNraW5nIGV2ZXJ5XG4gICAgICAgIC8vIHJvb20gdG8gc2VlIHdobyBoYXMgc2VudCBhIG1lc3NhZ2UgaW4gdGhlIGxhc3QgZmV3IGhvdXJzLCBhbmQgZ2l2aW5nIHRoZW0gYSBzY29yZVxuICAgICAgICAvLyB3aGljaCBjb3JyZWxhdGVzIHRvIHRoZSBmcmVzaG5lc3Mgb2YgdGhlaXIgbWVzc2FnZS4gSW4gdGhlb3J5LCB0aGlzIHJlc3VsdHMgaW4gc3VnZ2VzdGlvbnNcbiAgICAgICAgLy8gd2hpY2ggYXJlIGNsb3NlciB0byBcImNvbnRpbnVlIHRoaXMgY29udmVyc2F0aW9uXCIgcmF0aGVyIHRoYW4gXCJ0aGlzIHBlcnNvbiBleGlzdHNcIi5cbiAgICAgICAgY29uc3QgdHJ1ZUpvaW5lZFJvb21zID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb21zKCkuZmlsdGVyKHIgPT4gci5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gJ2pvaW4nKTtcbiAgICAgICAgY29uc3Qgbm93ID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgY29uc3QgZWFybGllc3RBZ2VDb25zaWRlcmVkID0gbm93IC0gKDYwICogNjAgKiAxMDAwKTsgLy8gMSBob3VyIGFnb1xuICAgICAgICBjb25zdCBtYXhNZXNzYWdlc0NvbnNpZGVyZWQgPSA1MDsgLy8gc28gd2UgZG9uJ3QgaXRlcmF0ZSBvdmVyIGEgaHVnZSBhbW91bnQgb2YgdHJhZmZpY1xuICAgICAgICBjb25zdCBsYXN0U3Bva2UgPSB7fTsgLy8gdXNlcklkOiB0aW1lc3RhbXBcbiAgICAgICAgY29uc3QgbGFzdFNwb2tlTWVtYmVycyA9IHt9OyAvLyB1c2VySWQ6IHJvb20gbWVtYmVyXG4gICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiB0cnVlSm9pbmVkUm9vbXMpIHtcbiAgICAgICAgICAgIC8vIFNraXAgbG93IHByaW9yaXR5IHJvb21zIGFuZCBETXNcbiAgICAgICAgICAgIGNvbnN0IGlzRG0gPSBETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKHJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhyb29tLnRhZ3MpLmluY2x1ZGVzKFwibS5sb3dwcmlvcml0eVwiKSB8fCBpc0RtKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IHJvb20uZ2V0TGl2ZVRpbWVsaW5lKCkuZ2V0RXZlbnRzKCk7IC8vIHRpbWVsaW5lcyBhcmUgbW9zdCByZWNlbnQgbGFzdFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGV2ZW50cy5sZW5ndGggLSAxOyBpID49IE1hdGgubWF4KDAsIGV2ZW50cy5sZW5ndGggLSBtYXhNZXNzYWdlc0NvbnNpZGVyZWQpOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBldiA9IGV2ZW50c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZWRUYXJnZXRJZHMuaGFzKGV2LmdldFNlbmRlcigpKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGV2LmdldFRzKCkgPD0gZWFybGllc3RBZ2VDb25zaWRlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBnaXZlIHVwOiBhbGwgZXZlbnRzIGZyb20gaGVyZSBvbiBvdXQgYXJlIHRvbyBvbGRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWxhc3RTcG9rZVtldi5nZXRTZW5kZXIoKV0gfHwgbGFzdFNwb2tlW2V2LmdldFNlbmRlcigpXSA8IGV2LmdldFRzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNwb2tlW2V2LmdldFNlbmRlcigpXSA9IGV2LmdldFRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTcG9rZU1lbWJlcnNbZXYuZ2V0U2VuZGVyKCldID0gcm9vbS5nZXRNZW1iZXIoZXYuZ2V0U2VuZGVyKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHVzZXJJZCBpbiBsYXN0U3Bva2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gbGFzdFNwb2tlW3VzZXJJZF07XG4gICAgICAgICAgICBjb25zdCBtZW1iZXIgPSBsYXN0U3Bva2VNZW1iZXJzW3VzZXJJZF07XG4gICAgICAgICAgICBpZiAoIW1lbWJlcikgY29udGludWU7IC8vIHNraXAgcGVvcGxlIHdlIHNvbWVob3cgZG9uJ3QgaGF2ZSBwcm9maWxlcyBmb3JcblxuICAgICAgICAgICAgLy8gU2NvcmVzIGZyb20gYmVpbmcgaW4gYSByb29tIGdpdmUgYSAnZ29vZCcgc2NvcmUgb2YgYWJvdXQgMS4wLTEuNSwgc28gZm9yIG91clxuICAgICAgICAgICAgLy8gYm9vc3Qgd2UnbGwgdHJ5IGFuZCBhd2FyZCBhdCBsZWFzdCArMS4wIGZvciBtYWtpbmcgdGhlIGxpc3QsIHdpdGggKzQuMCBiZWluZ1xuICAgICAgICAgICAgLy8gYW4gYXBwcm94aW1hdGUgbWF4aW11bSBmb3IgYmVpbmcgc2VsZWN0ZWQuXG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZUZyb21Ob3cgPSBNYXRoLmFicyhub3cgLSB0cyk7IC8vIGFicyB0byBhY2NvdW50IGZvciBzbGlnaHQgZnV0dXJlIG1lc3NhZ2VzXG4gICAgICAgICAgICBjb25zdCBpbnZlcnNlVGltZSA9IChub3cgLSBlYXJsaWVzdEFnZUNvbnNpZGVyZWQpIC0gZGlzdGFuY2VGcm9tTm93O1xuICAgICAgICAgICAgY29uc3Qgc2NvcmVCb29zdCA9IE1hdGgubWF4KDEsIGludmVyc2VUaW1lIC8gKDE1ICogNjAgKiAxMDAwKSk7IC8vIDE1bWluIHNlZ21lbnRzIHRvIGtlZXAgc2NvcmVzIHNhbmVcblxuICAgICAgICAgICAgbGV0IHJlY29yZCA9IG1lbWJlclNjb3Jlc1t1c2VySWRdO1xuICAgICAgICAgICAgaWYgKCFyZWNvcmQpIHJlY29yZCA9IG1lbWJlclNjb3Jlc1t1c2VySWRdID0ge3Njb3JlOiAwfTtcbiAgICAgICAgICAgIHJlY29yZC5tZW1iZXIgPSBtZW1iZXI7XG4gICAgICAgICAgICByZWNvcmQuc2NvcmUgKz0gc2NvcmVCb29zdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1lbWJlcnMgPSBPYmplY3QudmFsdWVzKG1lbWJlclNjb3Jlcyk7XG4gICAgICAgIG1lbWJlcnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYgKGEuc2NvcmUgPT09IGIuc2NvcmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoYS5udW1Sb29tcyA9PT0gYi5udW1Sb29tcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5tZW1iZXIudXNlcklkLmxvY2FsZUNvbXBhcmUoYi5tZW1iZXIudXNlcklkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYi5udW1Sb29tcyAtIGEubnVtUm9vbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYi5zY29yZSAtIGEuc2NvcmU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBtZW1iZXJzLm1hcChtID0+ICh7dXNlcklkOiBtLm1lbWJlci51c2VySWQsIHVzZXI6IG0ubWVtYmVyfSkpO1xuICAgIH1cblxuICAgIF9zaG91bGRBYm9ydEFmdGVySW52aXRlRXJyb3IocmVzdWx0KTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGZhaWxlZFVzZXJzID0gT2JqZWN0LmtleXMocmVzdWx0LnN0YXRlcykuZmlsdGVyKGEgPT4gcmVzdWx0LnN0YXRlc1thXSA9PT0gJ2Vycm9yJyk7XG4gICAgICAgIGlmIChmYWlsZWRVc2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBpbnZpdGUgdXNlcnM6IFwiLCByZXN1bHQpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIkZhaWxlZCB0byBpbnZpdGUgdGhlIGZvbGxvd2luZyB1c2VycyB0byBjaGF0OiAlKGNzdlVzZXJzKXNcIiwge1xuICAgICAgICAgICAgICAgICAgICBjc3ZVc2VyczogZmFpbGVkVXNlcnMuam9pbihcIiwgXCIpLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gYWJvcnRcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgX2NvbnZlcnRGaWx0ZXIoKTogTWVtYmVyW10ge1xuICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlcmUncyBhbnl0aGluZyB0byBjb252ZXJ0IGZpcnN0XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5maWx0ZXJUZXh0IHx8ICF0aGlzLnN0YXRlLmZpbHRlclRleHQuaW5jbHVkZXMoJ0AnKSkgcmV0dXJuIHRoaXMuc3RhdGUudGFyZ2V0cyB8fCBbXTtcblxuICAgICAgICBsZXQgbmV3TWVtYmVyOiBNZW1iZXI7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZpbHRlclRleHQuc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgICAgICAvLyBBc3N1bWUgbXhpZFxuICAgICAgICAgICAgbmV3TWVtYmVyID0gbmV3IERpcmVjdG9yeU1lbWJlcih7dXNlcl9pZDogdGhpcy5zdGF0ZS5maWx0ZXJUZXh0LCBkaXNwbGF5X25hbWU6IG51bGwsIGF2YXRhcl91cmw6IG51bGx9KTtcbiAgICAgICAgfSBlbHNlIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5JZGVudGl0eVNlcnZlcikpIHtcbiAgICAgICAgICAgIC8vIEFzc3VtZSBlbWFpbFxuICAgICAgICAgICAgbmV3TWVtYmVyID0gbmV3IFRocmVlcGlkTWVtYmVyKHRoaXMuc3RhdGUuZmlsdGVyVGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3VGFyZ2V0cyA9IFsuLi4odGhpcy5zdGF0ZS50YXJnZXRzIHx8IFtdKSwgbmV3TWVtYmVyXTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGFyZ2V0czogbmV3VGFyZ2V0cywgZmlsdGVyVGV4dDogJyd9KTtcbiAgICAgICAgcmV0dXJuIG5ld1RhcmdldHM7XG4gICAgfVxuXG4gICAgX3N0YXJ0RG0gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMuX2NvbnZlcnRGaWx0ZXIoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWRzID0gdGFyZ2V0cy5tYXAodCA9PiB0LnVzZXJJZCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYWxyZWFkeSBhIERNIHdpdGggdGhlc2UgcGVvcGxlIGFuZCByZXVzZSBpdCBpZiBwb3NzaWJsZS5cbiAgICAgICAgbGV0IGV4aXN0aW5nUm9vbTogUm9vbTtcbiAgICAgICAgaWYgKHRhcmdldElkcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIGV4aXN0aW5nUm9vbSA9IGZpbmRETUZvclVzZXIoTWF0cml4Q2xpZW50UGVnLmdldCgpLCB0YXJnZXRJZHNbMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhpc3RpbmdSb29tID0gRE1Sb29tTWFwLnNoYXJlZCgpLmdldERNUm9vbUZvcklkZW50aWZpZXJzKHRhcmdldElkcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4aXN0aW5nUm9vbSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IGV4aXN0aW5nUm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgc2hvdWxkX3BlZWs6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGpvaW5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNyZWF0ZVJvb21PcHRpb25zID0ge2lubGluZUVycm9yczogdHJ1ZX0gYXMgYW55OyAvLyBYWFg6IFR5cGUgb3V0IGBjcmVhdGVSb29tT3B0aW9uc2BcblxuICAgICAgICBpZiAocHJpdmF0ZVNob3VsZEJlRW5jcnlwdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgYWxsIHVzZXJzIGhhdmUgdXBsb2FkZWQgZGV2aWNlIGtleXMgYmVmb3JlLlxuICAgICAgICAgICAgLy8gSWYgc28sIGVuYWJsZSBlbmNyeXB0aW9uIGluIHRoZSBuZXcgcm9vbS5cbiAgICAgICAgICAgIGNvbnN0IGhhczNQaWRNZW1iZXJzID0gdGFyZ2V0cy5zb21lKHQgPT4gdCBpbnN0YW5jZW9mIFRocmVlcGlkTWVtYmVyKTtcbiAgICAgICAgICAgIGlmICghaGFzM1BpZE1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgYWxsSGF2ZURldmljZUtleXMgPSBhd2FpdCBjYW5FbmNyeXB0VG9BbGxVc2VycyhjbGllbnQsIHRhcmdldElkcyk7XG4gICAgICAgICAgICAgICAgaWYgKGFsbEhhdmVEZXZpY2VLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVJvb21PcHRpb25zLmVuY3J5cHRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgYSB0cmFkaXRpb25hbCBETSBhbmQgY3JlYXRlIHRoZSByb29tIGlmIHJlcXVpcmVkLlxuICAgICAgICAvLyBUT0RPOiBbQ2Fub25pY2FsIERNc10gUmVtb3ZlIHRoaXMgY2hlY2sgYW5kIGluc3RlYWQganVzdCBjcmVhdGUgdGhlIG11bHRpLXBlcnNvbiBETVxuICAgICAgICBsZXQgY3JlYXRlUm9vbVByb21pc2UgPSBQcm9taXNlLnJlc29sdmUobnVsbCkgYXMgUHJvbWlzZTxzdHJpbmcgfCBudWxsIHwgYm9vbGVhbj47XG4gICAgICAgIGNvbnN0IGlzU2VsZiA9IHRhcmdldElkcy5sZW5ndGggPT09IDEgJiYgdGFyZ2V0SWRzWzBdID09PSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgIGlmICh0YXJnZXRJZHMubGVuZ3RoID09PSAxICYmICFpc1NlbGYpIHtcbiAgICAgICAgICAgIGNyZWF0ZVJvb21PcHRpb25zLmRtVXNlcklkID0gdGFyZ2V0SWRzWzBdO1xuICAgICAgICAgICAgY3JlYXRlUm9vbVByb21pc2UgPSBjcmVhdGVSb29tKGNyZWF0ZVJvb21PcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1NlbGYpIHtcbiAgICAgICAgICAgIGNyZWF0ZVJvb21Qcm9taXNlID0gY3JlYXRlUm9vbShjcmVhdGVSb29tT3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYSBib3Jpbmcgcm9vbSBhbmQgdHJ5IHRvIGludml0ZSB0aGUgdGFyZ2V0cyBtYW51YWxseS5cbiAgICAgICAgICAgIGNyZWF0ZVJvb21Qcm9taXNlID0gY3JlYXRlUm9vbShjcmVhdGVSb29tT3B0aW9ucykudGhlbihyb29tSWQgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnZpdGVNdWx0aXBsZVRvUm9vbShyb29tSWQsIHRhcmdldElkcyk7XG4gICAgICAgICAgICB9KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3Nob3VsZEFib3J0QWZ0ZXJJbnZpdGVFcnJvcihyZXN1bHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBhYm9ydFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhlIGNyZWF0ZVJvb20gY2FsbCB3aWxsIHNob3cgdGhlIHJvb20gZm9yIHVzLCBzbyB3ZSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0IHRoYXQuXG4gICAgICAgIGNyZWF0ZVJvb21Qcm9taXNlLnRoZW4oYWJvcnQgPT4ge1xuICAgICAgICAgICAgaWYgKGFib3J0ID09PSB0cnVlKSByZXR1cm47IC8vIG9ubHkgYWJvcnQgb24gdHJ1ZSBib29sZWFucywgbm90IHJvb21JZHMgb3Igc29tZXRoaW5nXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXCJXZSBjb3VsZG4ndCBjcmVhdGUgeW91ciBETS4gUGxlYXNlIGNoZWNrIHRoZSB1c2VycyB5b3Ugd2FudCB0byBpbnZpdGUgYW5kIHRyeSBhZ2Fpbi5cIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9pbnZpdGVVc2VycyA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuICAgICAgICB0aGlzLl9jb252ZXJ0RmlsdGVyKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSB0aGlzLl9jb252ZXJ0RmlsdGVyKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldElkcyA9IHRhcmdldHMubWFwKHQgPT4gdC51c2VySWQpO1xuXG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmaW5kIHRoZSByb29tIHRvIGludml0ZSB1c2VycyB0b1wiKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXCJTb21ldGhpbmcgd2VudCB3cm9uZyB0cnlpbmcgdG8gaW52aXRlIHRoZSB1c2Vycy5cIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGludml0ZU11bHRpcGxlVG9Sb29tKHRoaXMucHJvcHMucm9vbUlkLCB0YXJnZXRJZHMpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tTZW5kSW52aXRlKHN0YXJ0VGltZSwgdGhpcy5wcm9wcy5yb29tSWQsIHRhcmdldElkcy5sZW5ndGgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9zaG91bGRBYm9ydEFmdGVySW52aXRlRXJyb3IocmVzdWx0KSkgeyAvLyBoYW5kbGVzIHNldHRpbmcgZXJyb3IgbWVzc2FnZSB0b29cbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiV2UgY291bGRuJ3QgaW52aXRlIHRob3NlIHVzZXJzLiBQbGVhc2UgY2hlY2sgdGhlIHVzZXJzIHlvdSB3YW50IHRvIGludml0ZSBhbmQgdHJ5IGFnYWluLlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF90cmFuc2ZlckNhbGwgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NvbnZlcnRGaWx0ZXIoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMuX2NvbnZlcnRGaWx0ZXIoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWRzID0gdGFyZ2V0cy5tYXAodCA9PiB0LnVzZXJJZCk7XG4gICAgICAgIGlmICh0YXJnZXRJZHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIkEgY2FsbCBjYW4gb25seSBiZSB0cmFuc2ZlcnJlZCB0byBhIHNpbmdsZSB1c2VyLlwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wcm9wcy5jYWxsLnRyYW5zZmVyKHRhcmdldElkc1swXSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiBmYWxzZX0pO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXCJGYWlsZWQgdG8gdHJhbnNmZXIgY2FsbFwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vbktleURvd24gPSAoZSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5idXN5KSByZXR1cm47XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZS50YXJnZXQudmFsdWUudHJpbSgpO1xuICAgICAgICBjb25zdCBoYXNNb2RpZmllcnMgPSBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSB8fCBlLm1ldGFLZXk7XG4gICAgICAgIGlmICghdmFsdWUgJiYgdGhpcy5zdGF0ZS50YXJnZXRzLmxlbmd0aCA+IDAgJiYgZS5rZXkgPT09IEtleS5CQUNLU1BBQ0UgJiYgIWhhc01vZGlmaWVycykge1xuICAgICAgICAgICAgLy8gd2hlbiB0aGUgZmllbGQgaXMgZW1wdHkgYW5kIHRoZSB1c2VyIGhpdHMgYmFja3NwYWNlIHJlbW92ZSB0aGUgcmlnaHQtbW9zdCB0YXJnZXRcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZU1lbWJlcih0aGlzLnN0YXRlLnRhcmdldHNbdGhpcy5zdGF0ZS50YXJnZXRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSAmJiBlLmtleSA9PT0gS2V5LkVOVEVSICYmICFoYXNNb2RpZmllcnMpIHtcbiAgICAgICAgICAgIC8vIHdoZW4gdGhlIHVzZXIgaGl0cyBlbnRlciB3aXRoIHNvbWV0aGluZyBpbiB0aGVpciBmaWVsZCB0cnkgdG8gY29udmVydCBpdFxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5fY29udmVydEZpbHRlcigpO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlICYmIGUua2V5ID09PSBLZXkuU1BBQ0UgJiYgIWhhc01vZGlmaWVycyAmJiB2YWx1ZS5pbmNsdWRlcyhcIkBcIikgJiYgIXZhbHVlLmluY2x1ZGVzKFwiIFwiKSkge1xuICAgICAgICAgICAgLy8gd2hlbiB0aGUgdXNlciBoaXRzIHNwYWNlIGFuZCB0aGVpciBpbnB1dCBsb29rcyBsaWtlIGFuIGUtbWFpbC9NWElEIHRoZW4gdHJ5IHRvIGNvbnZlcnQgaXRcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnZlcnRGaWx0ZXIoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfdXBkYXRlU3VnZ2VzdGlvbnMgPSBhc3luYyAodGVybSkgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VhcmNoVXNlckRpcmVjdG9yeSh7dGVybX0pLnRoZW4oYXN5bmMgciA9PiB7XG4gICAgICAgICAgICBpZiAodGVybSAhPT0gdGhpcy5zdGF0ZS5maWx0ZXJUZXh0KSB7XG4gICAgICAgICAgICAgICAgLy8gRGlzY2FyZCB0aGUgcmVzdWx0cyAtIHdlIHdlcmUgcHJvYmFibHkgdG9vIHNsb3cgb24gdGhlIHNlcnZlci1zaWRlIHRvIG1ha2VcbiAgICAgICAgICAgICAgICAvLyB0aGVzZSByZXN1bHRzIHVzZWZ1bC4gVGhpcyBpcyBhIHJhY2Ugd2Ugd2FudCB0byBhdm9pZCBiZWNhdXNlIHdlIGNvdWxkIG92ZXJ3cml0ZVxuICAgICAgICAgICAgICAgIC8vIG1vcmUgYWNjdXJhdGUgcmVzdWx0cy5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghci5yZXN1bHRzKSByLnJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgLy8gV2hpbGUgd2UncmUgaGVyZSwgdHJ5IGFuZCBhdXRvY29tcGxldGUgYSBzZWFyY2ggcmVzdWx0IGZvciB0aGUgbXhpZCBpdHNlbGZcbiAgICAgICAgICAgIC8vIGlmIHRoZXJlJ3Mgbm8gbWF0Y2hlcyAoYW5kIHRoZSBpbnB1dCBsb29rcyBsaWtlIGEgbXhpZCkuXG4gICAgICAgICAgICBpZiAodGVybVswXSA9PT0gJ0AnICYmIHRlcm0uaW5kZXhPZignOicpID4gMSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHJvZmlsZUluZm8odGVybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgcHJvZmlsZSwgd2UgaGF2ZSBlbm91Z2ggaW5mb3JtYXRpb24gdG8gYXNzdW1lIHRoYXRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBteGlkIGNhbiBiZSBpbnZpdGVkIC0gYWRkIGl0IHRvIHRoZSBsaXN0LiBXZSBzdGljayBpdCBhdCB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvcCBzbyBpdCBpcyBtb3N0IG9idmlvdXNseSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICByLnJlc3VsdHMuc3BsaWNlKDAsIDAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiB0ZXJtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlfbmFtZTogcHJvZmlsZVsnZGlzcGxheW5hbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBwcm9maWxlWydhdmF0YXJfdXJsJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiTm9uLWZhdGFsIGVycm9yIHRyeWluZyB0byBtYWtlIGFuIGludml0ZSBmb3IgYSB1c2VyIElEXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGEgcmVzdWx0IGFueXdheXMsIGp1c3Qgd2l0aG91dCBhIHByb2ZpbGUuIFdlIHN0aWNrIGl0IGF0IHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyB0b3Agc28gaXQgaXMgbW9zdCBvYnZpb3VzbHkgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICByLnJlc3VsdHMuc3BsaWNlKDAsIDAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IHRlcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5X25hbWU6IHRlcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlcnZlclJlc3VsdHNNaXhpbjogci5yZXN1bHRzLm1hcCh1ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdS51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICB1c2VyOiBuZXcgRGlyZWN0b3J5TWVtYmVyKHUpLFxuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzZWFyY2hpbmcgdXNlciBkaXJlY3Rvcnk6XCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3NlcnZlclJlc3VsdHNNaXhpbjogW119KTsgLy8gY2xlYXIgcmVzdWx0cyBiZWNhdXNlIGl0J3MgbW9kZXJhdGVseSBmYXRhbFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXaGVuZXZlciB3ZSBzZWFyY2ggdGhlIGRpcmVjdG9yeSwgYWxzbyB0cnkgdG8gc2VhcmNoIHRoZSBpZGVudGl0eSBzZXJ2ZXIuIEl0J3NcbiAgICAgICAgLy8gYWxsIGRlYm91bmNlZCB0aGUgc2FtZSBhbnl3YXlzLlxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuY2FuVXNlSWRlbnRpdHlTZXJ2ZXIpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGRvZXNuJ3QgaGF2ZSBhbiBpZGVudGl0eSBzZXJ2ZXIgc2V0IC0gd2FybiB0aGVtIG9mIHRoYXQuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt0cnlpbmdJZGVudGl0eVNlcnZlcjogdHJ1ZX0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXJtLmluZGV4T2YoJ0AnKSA+IDAgJiYgRW1haWwubG9va3NWYWxpZCh0ZXJtKSAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5JZGVudGl0eVNlcnZlcikpIHtcbiAgICAgICAgICAgIC8vIFN0YXJ0IG9mZiBieSBzdWdnZXN0aW5nIHRoZSBwbGFpbiBlbWFpbCB3aGlsZSB3ZSB0cnkgYW5kIHJlc29sdmUgaXRcbiAgICAgICAgICAgIC8vIHRvIGEgcmVhbCBhY2NvdW50LlxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgLy8gcGVyIGFib3ZlOiB0aGUgdXNlcklkIGlzIGEgbGllIGhlcmUgLSBpdCdzIGp1c3QgYSByZWd1bGFyIGlkZW50aWZpZXJcbiAgICAgICAgICAgICAgICB0aHJlZXBpZFJlc3VsdHNNaXhpbjogW3t1c2VyOiBuZXcgVGhyZWVwaWRNZW1iZXIodGVybSksIHVzZXJJZDogdGVybX1dLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGF1dGhDbGllbnQgPSBuZXcgSWRlbnRpdHlBdXRoQ2xpZW50KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCBhdXRoQ2xpZW50LmdldEFjY2Vzc1Rva2VuKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRlcm0gIT09IHRoaXMuc3RhdGUuZmlsdGVyVGV4dCkgcmV0dXJuOyAvLyBhYmFuZG9uIGhvcGVcblxuICAgICAgICAgICAgICAgIGNvbnN0IGxvb2t1cCA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5sb29rdXBUaHJlZVBpZChcbiAgICAgICAgICAgICAgICAgICAgJ2VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgdGVybSxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLCAvLyBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICB0b2tlbixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICh0ZXJtICE9PSB0aGlzLnN0YXRlLmZpbHRlclRleHQpIHJldHVybjsgLy8gYWJhbmRvbiBob3BlXG5cbiAgICAgICAgICAgICAgICBpZiAoIWxvb2t1cCB8fCAhbG9va3VwLm14aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2Ugd2VyZW4ndCBhYmxlIHRvIGZpbmQgYW55b25lIC0gd2UncmUgYWxyZWFkeSBzdWdnZXN0aW5nIHRoZSBwbGFpbiBlbWFpbFxuICAgICAgICAgICAgICAgICAgICAvLyBhcyBhbiBhbHRlcm5hdGl2ZSwgc28gZG8gbm90aGluZy5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdlIGFwcGVuZCB0aGUgdXNlciBzdWdnZXN0aW9uIHRvIGdpdmUgdGhlIHVzZXIgYW4gb3B0aW9uIHRvIGNsaWNrXG4gICAgICAgICAgICAgICAgLy8gdGhlIGVtYWlsIGFueXdheXMsIGFuZCBzbyB3ZSBkb24ndCBjYXVzZSB0aGluZ3MgdG8ganVtcCBhcm91bmQuIEluXG4gICAgICAgICAgICAgICAgLy8gdGhlb3J5LCB0aGUgdXNlciB3b3VsZCBzZWUgdGhlIHVzZXIgcG9wIHVwIGFuZCB0aGluayBcImFoIHllcywgdGhhdFxuICAgICAgICAgICAgICAgIC8vIHBlcnNvbiFcIlxuICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHJvZmlsZUluZm8obG9va3VwLm14aWQpO1xuICAgICAgICAgICAgICAgIGlmICh0ZXJtICE9PSB0aGlzLnN0YXRlLmZpbHRlclRleHQgfHwgIXByb2ZpbGUpIHJldHVybjsgLy8gYWJhbmRvbiBob3BlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHRocmVlcGlkUmVzdWx0c01peGluOiBbLi4udGhpcy5zdGF0ZS50aHJlZXBpZFJlc3VsdHNNaXhpbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogbmV3IERpcmVjdG9yeU1lbWJlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogbG9va3VwLm14aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheV9uYW1lOiBwcm9maWxlLmRpc3BsYXluYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IHByb2ZpbGUuYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiBsb29rdXAubXhpZCxcbiAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHNlYXJjaGluZyBpZGVudGl0eSBzZXJ2ZXI6XCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGhyZWVwaWRSZXN1bHRzTWl4aW46IFtdfSk7IC8vIGNsZWFyIHJlc3VsdHMgYmVjYXVzZSBpdCdzIG1vZGVyYXRlbHkgZmF0YWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfdXBkYXRlRmlsdGVyID0gKGUpID0+IHtcbiAgICAgICAgY29uc3QgdGVybSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtmaWx0ZXJUZXh0OiB0ZXJtfSk7XG5cbiAgICAgICAgLy8gRGVib3VuY2Ugc2VydmVyIGxvb2t1cHMgdG8gcmVkdWNlIHNwYW0uIFdlIGRvbid0IGNsZWFyIHRoZSBleGlzdGluZyBzZXJ2ZXJcbiAgICAgICAgLy8gcmVzdWx0cyBiZWNhdXNlIHRoZXkgbWlnaHQgc3RpbGwgYmUgdmFndWVseSBhY2N1cmF0ZSwgbGlrZXdpc2UgZm9yIHJhY2VzIHdoaWNoXG4gICAgICAgIC8vIGNvdWxkIGhhcHBlbiBoZXJlLlxuICAgICAgICBpZiAodGhpcy5fZGVib3VuY2VUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2RlYm91bmNlVGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN1Z2dlc3Rpb25zKHRlcm0pO1xuICAgICAgICB9LCAxNTApOyAvLyAxNTBtcyBkZWJvdW5jZSAoaHVtYW4gcmVhY3Rpb24gdGltZSArIHNvbWUpXG4gICAgfTtcblxuICAgIF9zaG93TW9yZVJlY2VudHMgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe251bVJlY2VudHNTaG93bjogdGhpcy5zdGF0ZS5udW1SZWNlbnRzU2hvd24gKyBJTkNSRU1FTlRfUk9PTVNfU0hPV059KTtcbiAgICB9O1xuXG4gICAgX3Nob3dNb3JlU3VnZ2VzdGlvbnMgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe251bVN1Z2dlc3Rpb25zU2hvd246IHRoaXMuc3RhdGUubnVtU3VnZ2VzdGlvbnNTaG93biArIElOQ1JFTUVOVF9ST09NU19TSE9XTn0pO1xuICAgIH07XG5cbiAgICBfdG9nZ2xlTWVtYmVyID0gKG1lbWJlcjogTWVtYmVyKSA9PiB7XG4gICAgICAgIGxldCBmaWx0ZXJUZXh0ID0gdGhpcy5zdGF0ZS5maWx0ZXJUZXh0O1xuICAgICAgICBjb25zdCB0YXJnZXRzID0gdGhpcy5zdGF0ZS50YXJnZXRzLm1hcCh0ID0+IHQpOyAvLyBjaGVhcCBjbG9uZSBmb3IgbXV0YXRpb25cbiAgICAgICAgY29uc3QgaWR4ID0gdGFyZ2V0cy5pbmRleE9mKG1lbWJlcik7XG4gICAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAgICAgdGFyZ2V0cy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldHMucHVzaChtZW1iZXIpO1xuICAgICAgICAgICAgZmlsdGVyVGV4dCA9IFwiXCI7IC8vIGNsZWFyIHRoZSBmaWx0ZXIgd2hlbiB0aGUgdXNlciBhY2NlcHRzIGEgc3VnZ2VzdGlvblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3RhcmdldHMsIGZpbHRlclRleHR9KTtcblxuICAgICAgICBpZiAodGhpcy5fZWRpdG9yUmVmICYmIHRoaXMuX2VkaXRvclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3JSZWYuY3VycmVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9yZW1vdmVNZW1iZXIgPSAobWVtYmVyOiBNZW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMuc3RhdGUudGFyZ2V0cy5tYXAodCA9PiB0KTsgLy8gY2hlYXAgY2xvbmUgZm9yIG11dGF0aW9uXG4gICAgICAgIGNvbnN0IGlkeCA9IHRhcmdldHMuaW5kZXhPZihtZW1iZXIpO1xuICAgICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgICAgIHRhcmdldHMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt0YXJnZXRzfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZWRpdG9yUmVmICYmIHRoaXMuX2VkaXRvclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3JSZWYuY3VycmVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vblBhc3RlID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZmlsdGVyVGV4dCkge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgaGFzIGFscmVhZHkgdHlwZWQgc29tZXRoaW5nLCBqdXN0IGxldCB0aGVtXG4gICAgICAgICAgICAvLyBwYXN0ZSBub3JtYWxseS5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFByZXZlbnQgdGhlIHRleHQgYmVpbmcgcGFzdGVkIGludG8gdGhlIGlucHV0XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAvLyBQcm9jZXNzIGl0IGFzIGEgbGlzdCBvZiBhZGRyZXNzZXMgdG8gYWRkIGluc3RlYWRcbiAgICAgICAgY29uc3QgdGV4dCA9IGUuY2xpcGJvYXJkRGF0YS5nZXREYXRhKFwidGV4dFwiKTtcbiAgICAgICAgY29uc3QgcG9zc2libGVNZW1iZXJzID0gW1xuICAgICAgICAgICAgLy8gSWYgd2UgY2FuIGF2b2lkIGhpdHRpbmcgdGhlIHByb2ZpbGUgZW5kcG9pbnQsIHdlIHNob3VsZC5cbiAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUucmVjZW50cyxcbiAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUuc3VnZ2VzdGlvbnMsXG4gICAgICAgICAgICAuLi50aGlzLnN0YXRlLnNlcnZlclJlc3VsdHNNaXhpbixcbiAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUudGhyZWVwaWRSZXN1bHRzTWl4aW4sXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IHRvQWRkID0gW107XG4gICAgICAgIGNvbnN0IGZhaWxlZCA9IFtdO1xuICAgICAgICBjb25zdCBwb3RlbnRpYWxBZGRyZXNzZXMgPSB0ZXh0LnNwbGl0KC9bXFxzLF0rLykubWFwKHAgPT4gcC50cmltKCkpLmZpbHRlcihwID0+ICEhcCk7IC8vIGZpbHRlciBlbXB0eSBzdHJpbmdzXG4gICAgICAgIGZvciAoY29uc3QgYWRkcmVzcyBvZiBwb3RlbnRpYWxBZGRyZXNzZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IHBvc3NpYmxlTWVtYmVycy5maW5kKG0gPT4gbS51c2VySWQgPT09IGFkZHJlc3MpO1xuICAgICAgICAgICAgaWYgKG1lbWJlcikge1xuICAgICAgICAgICAgICAgIHRvQWRkLnB1c2gobWVtYmVyLnVzZXIpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYWRkcmVzcy5pbmRleE9mKCdAJykgPiAwICYmIEVtYWlsLmxvb2tzVmFsaWQoYWRkcmVzcykpIHtcbiAgICAgICAgICAgICAgICB0b0FkZC5wdXNoKG5ldyBUaHJlZXBpZE1lbWJlcihhZGRyZXNzKSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhZGRyZXNzWzBdICE9PSAnQCcpIHtcbiAgICAgICAgICAgICAgICBmYWlsZWQucHVzaChhZGRyZXNzKTsgLy8gbm90IGEgdXNlciBJRFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHJvZmlsZUluZm8oYWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSBwcm9maWxlID8gcHJvZmlsZS5kaXNwbGF5bmFtZSA6IG51bGw7XG4gICAgICAgICAgICAgICAgY29uc3QgYXZhdGFyVXJsID0gcHJvZmlsZSA/IHByb2ZpbGUuYXZhdGFyX3VybCA6IG51bGw7XG4gICAgICAgICAgICAgICAgdG9BZGQucHVzaChuZXcgRGlyZWN0b3J5TWVtYmVyKHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheV9uYW1lOiBkaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyX3VybDogYXZhdGFyVXJsLFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9va2luZyB1cCBwcm9maWxlIGZvciBcIiArIGFkZHJlc3MpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgZmFpbGVkLnB1c2goYWRkcmVzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmFpbGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5RdWVzdGlvbkRpYWxvZycpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnSW52aXRlIFBhc3RlIEZhaWwnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZhaWxlZCB0byBmaW5kIHRoZSBmb2xsb3dpbmcgdXNlcnMnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVGhlIGZvbGxvd2luZyB1c2VycyBtaWdodCBub3QgZXhpc3Qgb3IgYXJlIGludmFsaWQsIGFuZCBjYW5ub3QgYmUgaW52aXRlZDogJShjc3ZOYW1lcylzXCIsXG4gICAgICAgICAgICAgICAgICAgIHtjc3ZOYW1lczogZmFpbGVkLmpvaW4oXCIsIFwiKX0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBidXR0b246IF90KCdPSycpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHt0YXJnZXRzOiBbLi4udGhpcy5zdGF0ZS50YXJnZXRzLCAuLi50b0FkZF19KTtcbiAgICB9O1xuXG4gICAgX29uQ2xpY2tJbnB1dEFyZWEgPSAoZSkgPT4ge1xuICAgICAgICAvLyBTdG9wIHRoZSBicm93c2VyIGZyb20gaGlnaGxpZ2h0aW5nIHRleHRcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGlmICh0aGlzLl9lZGl0b3JSZWYgJiYgdGhpcy5fZWRpdG9yUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvclJlZi5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uVXNlRGVmYXVsdElkZW50aXR5U2VydmVyQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBJUyBpbiBhY2NvdW50IGRhdGEuIEFjdHVhbGx5IHVzaW5nIGl0IG1heSB0cmlnZ2VyIHRlcm1zLlxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvcnVsZXMtb2YtaG9va3NcbiAgICAgICAgdXNlRGVmYXVsdElkZW50aXR5U2VydmVyKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NhblVzZUlkZW50aXR5U2VydmVyOiB0cnVlLCB0cnlpbmdJZGVudGl0eVNlcnZlcjogZmFsc2V9KTtcbiAgICB9O1xuXG4gICAgX29uTWFuYWdlU2V0dGluZ3NDbGljayA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MpO1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9O1xuXG4gICAgX29uQ29tbXVuaXR5SW52aXRlQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgc2hvd0NvbW11bml0eUludml0ZURpYWxvZyhDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRTZWxlY3RlZENvbW11bml0eUlkKCkpO1xuICAgIH07XG5cbiAgICBfcmVuZGVyU2VjdGlvbihraW5kOiBcInJlY2VudHNcInxcInN1Z2dlc3Rpb25zXCIpIHtcbiAgICAgICAgbGV0IHNvdXJjZU1lbWJlcnMgPSBraW5kID09PSAncmVjZW50cycgPyB0aGlzLnN0YXRlLnJlY2VudHMgOiB0aGlzLnN0YXRlLnN1Z2dlc3Rpb25zO1xuICAgICAgICBsZXQgc2hvd051bSA9IGtpbmQgPT09ICdyZWNlbnRzJyA/IHRoaXMuc3RhdGUubnVtUmVjZW50c1Nob3duIDogdGhpcy5zdGF0ZS5udW1TdWdnZXN0aW9uc1Nob3duO1xuICAgICAgICBjb25zdCBzaG93TW9yZUZuID0ga2luZCA9PT0gJ3JlY2VudHMnID8gdGhpcy5fc2hvd01vcmVSZWNlbnRzLmJpbmQodGhpcykgOiB0aGlzLl9zaG93TW9yZVN1Z2dlc3Rpb25zLmJpbmQodGhpcyk7XG4gICAgICAgIGNvbnN0IGxhc3RBY3RpdmUgPSAobSkgPT4ga2luZCA9PT0gJ3JlY2VudHMnID8gbS5sYXN0QWN0aXZlIDogbnVsbDtcbiAgICAgICAgbGV0IHNlY3Rpb25OYW1lID0ga2luZCA9PT0gJ3JlY2VudHMnID8gX3QoXCJSZWNlbnQgQ29udmVyc2F0aW9uc1wiKSA6IF90KFwiU3VnZ2VzdGlvbnNcIik7XG4gICAgICAgIGxldCBzZWN0aW9uU3VibmFtZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKGtpbmQgPT09ICdzdWdnZXN0aW9ucycgJiYgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBjb21tdW5pdHlOYW1lID0gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlOYW1lKCk7XG4gICAgICAgICAgICBzZWN0aW9uU3VibmFtZSA9IF90KFwiTWF5IGluY2x1ZGUgbWVtYmVycyBub3QgaW4gJShjb21tdW5pdHlOYW1lKXNcIiwge2NvbW11bml0eU5hbWV9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmtpbmQgPT09IEtJTkRfSU5WSVRFKSB7XG4gICAgICAgICAgICBzZWN0aW9uTmFtZSA9IGtpbmQgPT09ICdyZWNlbnRzJyA/IF90KFwiUmVjZW50bHkgRGlyZWN0IE1lc3NhZ2VkXCIpIDogX3QoXCJTdWdnZXN0aW9uc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1peCBpbiB0aGUgc2VydmVyIHJlc3VsdHMgaWYgd2UgaGF2ZSBhbnksIGJ1dCBvbmx5IGlmIHdlJ3JlIHNlYXJjaGluZy4gV2UgdHJhY2sgdGhlIGFkZGl0aW9uYWxcbiAgICAgICAgLy8gbWVtYmVycyBzZXBhcmF0ZWx5IGJlY2F1c2Ugd2Ugd2FudCB0byBmaWx0ZXIgc291cmNlTWVtYmVycyBidXQgdHJ1c3QgdGhlIG1peGluIGFycmF5cyB0byBoYXZlXG4gICAgICAgIC8vIHRoZSByaWdodCBtZW1iZXJzIGluIHRoZW0uXG4gICAgICAgIGxldCBwcmlvcml0eUFkZGl0aW9uYWxNZW1iZXJzID0gW107IC8vIFNob3dzIHVwIGJlZm9yZSBvdXIgb3duIHN1Z2dlc3Rpb25zLCBoaWdoZXIgcXVhbGl0eVxuICAgICAgICBsZXQgb3RoZXJBZGRpdGlvbmFsTWVtYmVycyA9IFtdOyAvLyBTaG93cyB1cCBhZnRlciBvdXIgb3duIHN1Z2dlc3Rpb25zLCBsb3dlciBxdWFsaXR5XG4gICAgICAgIGNvbnN0IGhhc01peGlucyA9IHRoaXMuc3RhdGUuc2VydmVyUmVzdWx0c01peGluIHx8IHRoaXMuc3RhdGUudGhyZWVwaWRSZXN1bHRzTWl4aW47XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZpbHRlclRleHQgJiYgaGFzTWl4aW5zICYmIGtpbmQgPT09ICdzdWdnZXN0aW9ucycpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gZHVwbGljYXRlIG1lbWJlcnMgdGhvdWdoLCBzbyBqdXN0IGV4Y2x1ZGUgYW55b25lIHdlJ3ZlIGFscmVhZHkgc2Vlbi5cbiAgICAgICAgICAgIC8vIFRoZSB0eXBlIG9mIHUgaXMgYSBwYWluIHRvIGRlZmluZSBidXQgbWVtYmVycyBvZiBib3RoIG1peGlucyBoYXZlIHRoZSAndXNlcklkJyBwcm9wZXJ0eVxuICAgICAgICAgICAgY29uc3Qgbm90QWxyZWFkeUV4aXN0cyA9ICh1OiBhbnkpOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXNvdXJjZU1lbWJlcnMuc29tZShtID0+IG0udXNlcklkID09PSB1LnVzZXJJZClcbiAgICAgICAgICAgICAgICAgICAgJiYgIXByaW9yaXR5QWRkaXRpb25hbE1lbWJlcnMuc29tZShtID0+IG0udXNlcklkID09PSB1LnVzZXJJZClcbiAgICAgICAgICAgICAgICAgICAgJiYgIW90aGVyQWRkaXRpb25hbE1lbWJlcnMuc29tZShtID0+IG0udXNlcklkID09PSB1LnVzZXJJZCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBvdGhlckFkZGl0aW9uYWxNZW1iZXJzID0gdGhpcy5zdGF0ZS5zZXJ2ZXJSZXN1bHRzTWl4aW4uZmlsdGVyKG5vdEFscmVhZHlFeGlzdHMpO1xuICAgICAgICAgICAgcHJpb3JpdHlBZGRpdGlvbmFsTWVtYmVycyA9IHRoaXMuc3RhdGUudGhyZWVwaWRSZXN1bHRzTWl4aW4uZmlsdGVyKG5vdEFscmVhZHlFeGlzdHMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhc0FkZGl0aW9uYWxNZW1iZXJzID0gcHJpb3JpdHlBZGRpdGlvbmFsTWVtYmVycy5sZW5ndGggPiAwIHx8IG90aGVyQWRkaXRpb25hbE1lbWJlcnMubGVuZ3RoID4gMDtcblxuICAgICAgICAvLyBIaWRlIHRoZSBzZWN0aW9uIGlmIHRoZXJlJ3Mgbm90aGluZyB0byBmaWx0ZXIgYnlcbiAgICAgICAgaWYgKHNvdXJjZU1lbWJlcnMubGVuZ3RoID09PSAwICYmICFoYXNBZGRpdGlvbmFsTWVtYmVycykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgLy8gRG8gc29tZSBzaW1wbGUgZmlsdGVyaW5nIG9uIHRoZSBpbnB1dCBiZWZvcmUgZ29pbmcgbXVjaCBmdXJ0aGVyLiBJZiB3ZSBnZXQgbm8gcmVzdWx0cywgc2F5IHNvLlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5maWx0ZXJUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJCeSA9IHRoaXMuc3RhdGUuZmlsdGVyVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgc291cmNlTWVtYmVycyA9IHNvdXJjZU1lbWJlcnNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG0gPT4gbS51c2VyLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJCeSkgfHwgbS51c2VySWQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJCeSkpO1xuXG4gICAgICAgICAgICBpZiAoc291cmNlTWVtYmVycy5sZW5ndGggPT09IDAgJiYgIWhhc0FkZGl0aW9uYWxNZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMz57c2VjdGlvbk5hbWV9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPntfdChcIk5vIHJlc3VsdHNcIil9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHdlIG1peCBpbiB0aGUgYWRkaXRpb25hbCBtZW1iZXJzLiBBZ2Fpbiwgd2UgcHJlc3VtZSB0aGVzZSBoYXZlIGFscmVhZHkgYmVlbiBmaWx0ZXJlZC4gV2VcbiAgICAgICAgLy8gYWxzbyBhc3N1bWUgdGhleSBhcmUgbW9yZSByZWxldmFudCB0aGFuIG91ciBzdWdnZXN0aW9ucyBhbmQgcHJlcGVuZCB0aGVtIHRvIHRoZSBsaXN0LlxuICAgICAgICBzb3VyY2VNZW1iZXJzID0gWy4uLnByaW9yaXR5QWRkaXRpb25hbE1lbWJlcnMsIC4uLnNvdXJjZU1lbWJlcnMsIC4uLm90aGVyQWRkaXRpb25hbE1lbWJlcnNdO1xuXG4gICAgICAgIC8vIElmIHdlJ3JlIGdvaW5nIHRvIGhpZGUgb25lIG1lbWJlciBiZWhpbmQgJ3Nob3cgbW9yZScsIGp1c3QgdXNlIHVwIHRoZSBzcGFjZSBvZiB0aGUgYnV0dG9uXG4gICAgICAgIC8vIHdpdGggdGhlIG1lbWJlcidzIHRpbGUgaW5zdGVhZC5cbiAgICAgICAgaWYgKHNob3dOdW0gPT09IHNvdXJjZU1lbWJlcnMubGVuZ3RoIC0gMSkgc2hvd051bSsrO1xuXG4gICAgICAgIC8vIC5zbGljZSgpIHdpbGwgcmV0dXJuIGFuIGluY29tcGxldGUgYXJyYXkgYnV0IHdvbid0IGVycm9yIG9uIHVzIGlmIHdlIGdvIHRvbyBmYXJcbiAgICAgICAgY29uc3QgdG9SZW5kZXIgPSBzb3VyY2VNZW1iZXJzLnNsaWNlKDAsIHNob3dOdW0pO1xuICAgICAgICBjb25zdCBoYXNNb3JlID0gdG9SZW5kZXIubGVuZ3RoIDwgc291cmNlTWVtYmVycy5sZW5ndGg7XG5cbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uXCIpO1xuICAgICAgICBsZXQgc2hvd01vcmUgPSBudWxsO1xuICAgICAgICBpZiAoaGFzTW9yZSkge1xuICAgICAgICAgICAgc2hvd01vcmUgPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17c2hvd01vcmVGbn0ga2luZD1cImxpbmtcIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiU2hvdyBtb3JlXCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aWxlcyA9IHRvUmVuZGVyLm1hcChyID0+IChcbiAgICAgICAgICAgIDxETVJvb21UaWxlXG4gICAgICAgICAgICAgICAgbWVtYmVyPXtyLnVzZXJ9XG4gICAgICAgICAgICAgICAgbGFzdEFjdGl2ZVRzPXtsYXN0QWN0aXZlKHIpfVxuICAgICAgICAgICAgICAgIGtleT17ci51c2VySWR9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9e3RoaXMuX3RvZ2dsZU1lbWJlcn1cbiAgICAgICAgICAgICAgICBoaWdobGlnaHRXb3JkPXt0aGlzLnN0YXRlLmZpbHRlclRleHR9XG4gICAgICAgICAgICAgICAgaXNTZWxlY3RlZD17dGhpcy5zdGF0ZS50YXJnZXRzLnNvbWUodCA9PiB0LnVzZXJJZCA9PT0gci51c2VySWQpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3NlY3Rpb24nPlxuICAgICAgICAgICAgICAgIDxoMz57c2VjdGlvbk5hbWV9PC9oMz5cbiAgICAgICAgICAgICAgICB7c2VjdGlvblN1Ym5hbWUgPyA8cCBjbGFzc05hbWU9XCJteF9JbnZpdGVEaWFsb2dfc3VibmFtZVwiPntzZWN0aW9uU3VibmFtZX08L3A+IDogbnVsbH1cbiAgICAgICAgICAgICAgICB7dGlsZXN9XG4gICAgICAgICAgICAgICAge3Nob3dNb3JlfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX3JlbmRlckVkaXRvcigpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMuc3RhdGUudGFyZ2V0cy5tYXAodCA9PiAoXG4gICAgICAgICAgICA8RE1Vc2VyVGlsZSBtZW1iZXI9e3R9IG9uUmVtb3ZlPXshdGhpcy5zdGF0ZS5idXN5ICYmIHRoaXMuX3JlbW92ZU1lbWJlcn0ga2V5PXt0LnVzZXJJZH0gLz5cbiAgICAgICAgKSk7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gKFxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5fb25LZXlEb3dufVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl91cGRhdGVGaWx0ZXJ9XG4gICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZmlsdGVyVGV4dH1cbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuX2VkaXRvclJlZn1cbiAgICAgICAgICAgICAgICBvblBhc3RlPXt0aGlzLl9vblBhc3RlfVxuICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19lZGl0b3InIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2tJbnB1dEFyZWF9PlxuICAgICAgICAgICAgICAgIHt0YXJnZXRzfVxuICAgICAgICAgICAgICAgIHtpbnB1dH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJJZGVudGl0eVNlcnZlcldhcm5pbmcoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS50cnlpbmdJZGVudGl0eVNlcnZlciB8fCB0aGlzLnN0YXRlLmNhblVzZUlkZW50aXR5U2VydmVyIHx8XG4gICAgICAgICAgICAhU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuSWRlbnRpdHlTZXJ2ZXIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwgPSBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwoKTtcbiAgICAgICAgaWYgKGRlZmF1bHRJZGVudGl0eVNlcnZlclVybCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NQaWNrZXJEaWFsb2dfaWRlbnRpdHlTZXJ2ZXJcIj57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVXNlIGFuIGlkZW50aXR5IHNlcnZlciB0byBpbnZpdGUgYnkgZW1haWwuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8ZGVmYXVsdD5Vc2UgdGhlIGRlZmF1bHQgKCUoZGVmYXVsdElkZW50aXR5U2VydmVyTmFtZSlzKTwvZGVmYXVsdD4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIm9yIG1hbmFnZSBpbiA8c2V0dGluZ3M+U2V0dGluZ3M8L3NldHRpbmdzPi5cIixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdElkZW50aXR5U2VydmVyTmFtZTogYWJicmV2aWF0ZVVybChkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwpLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBzdWIgPT4gPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXt0aGlzLl9vblVzZURlZmF1bHRJZGVudGl0eVNlcnZlckNsaWNrfT57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczogc3ViID0+IDxhIGhyZWY9XCIjXCIgb25DbGljaz17dGhpcy5fb25NYW5hZ2VTZXR0aW5nc0NsaWNrfT57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKX08L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1BpY2tlckRpYWxvZ19pZGVudGl0eVNlcnZlclwiPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJVc2UgYW4gaWRlbnRpdHkgc2VydmVyIHRvIGludml0ZSBieSBlbWFpbC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIk1hbmFnZSBpbiA8c2V0dGluZ3M+U2V0dGluZ3M8L3NldHRpbmdzPi5cIixcbiAgICAgICAgICAgICAgICAgICAge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiBzdWIgPT4gPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXt0aGlzLl9vbk1hbmFnZVNldHRpbmdzQ2xpY2t9PntzdWJ9PC9hPixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApfTwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkFjY2Vzc2libGVCdXR0b25cIik7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcblxuICAgICAgICBsZXQgc3Bpbm5lciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmJ1c3kpIHtcbiAgICAgICAgICAgIHNwaW5uZXIgPSA8U3Bpbm5lciB3PXsyMH0gaD17MjB9IC8+O1xuICAgICAgICB9XG5cblxuICAgICAgICBsZXQgdGl0bGU7XG4gICAgICAgIGxldCBoZWxwVGV4dDtcbiAgICAgICAgbGV0IGJ1dHRvblRleHQ7XG4gICAgICAgIGxldCBnb0J1dHRvbkZuO1xuXG4gICAgICAgIGNvbnN0IGlkZW50aXR5U2VydmVyc0VuYWJsZWQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5JZGVudGl0eVNlcnZlcik7XG5cbiAgICAgICAgY29uc3QgdXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5raW5kID09PSBLSU5EX0RNKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiRGlyZWN0IE1lc3NhZ2VzXCIpO1xuXG4gICAgICAgICAgICBpZiAoaWRlbnRpdHlTZXJ2ZXJzRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGhlbHBUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiU3RhcnQgYSBjb252ZXJzYXRpb24gd2l0aCBzb21lb25lIHVzaW5nIHRoZWlyIG5hbWUsIGVtYWlsIGFkZHJlc3Mgb3IgdXNlcm5hbWUgKGxpa2UgPHVzZXJJZC8+KS5cIixcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIHt1c2VySWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17bWFrZVVzZXJQZXJtYWxpbmsodXNlcklkKX0gcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPnt1c2VySWR9PC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfX0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVscFRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJTdGFydCBhIGNvbnZlcnNhdGlvbiB3aXRoIHNvbWVvbmUgdXNpbmcgdGhlaXIgbmFtZSBvciB1c2VybmFtZSAobGlrZSA8dXNlcklkLz4pLlwiLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAge3VzZXJJZDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXttYWtlVXNlclBlcm1hbGluayh1c2VySWQpfSByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3VzZXJJZH08L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9fSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tbXVuaXR5TmFtZSA9IENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5TmFtZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZVRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHdvbid0IGludml0ZSB0aGVtIHRvICUoY29tbXVuaXR5TmFtZSlzLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiVG8gaW52aXRlIHNvbWVvbmUgdG8gJShjb21tdW5pdHlOYW1lKXMsIGNsaWNrIDxhPmhlcmU8L2E+XCIsXG4gICAgICAgICAgICAgICAgICAgIHtjb21tdW5pdHlOYW1lfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e21ha2VVc2VyUGVybWFsaW5rKHVzZXJJZCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID57dXNlcklkfTwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGE6IChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25Db21tdW5pdHlJbnZpdGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPntzdWJ9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaGVscFRleHQgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIHsgaGVscFRleHQgfSB7aW52aXRlVGV4dH1cbiAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ1dHRvblRleHQgPSBfdChcIkdvXCIpO1xuICAgICAgICAgICAgZ29CdXR0b25GbiA9IHRoaXMuX3N0YXJ0RG07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5raW5kID09PSBLSU5EX0lOVklURSkge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIkludml0ZSB0byB0aGlzIHJvb21cIik7XG5cbiAgICAgICAgICAgIGlmIChpZGVudGl0eVNlcnZlcnNFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgaGVscFRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJJbnZpdGUgc29tZW9uZSB1c2luZyB0aGVpciBuYW1lLCBlbWFpbCBhZGRyZXNzLCB1c2VybmFtZSAobGlrZSA8dXNlcklkLz4pIG9yIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiPGE+c2hhcmUgdGhpcyByb29tPC9hPi5cIixcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXttYWtlVXNlclBlcm1hbGluayh1c2VySWQpfSByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3VzZXJJZH08L2E+LFxuICAgICAgICAgICAgICAgICAgICAgICAgYTogKHN1YikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXttYWtlUm9vbVBlcm1hbGluayh0aGlzLnByb3BzLnJvb21JZCl9IHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiB0YXJnZXQ9XCJfYmxhbmtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3N1Yn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlbHBUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiSW52aXRlIHNvbWVvbmUgdXNpbmcgdGhlaXIgbmFtZSwgdXNlcm5hbWUgKGxpa2UgPHVzZXJJZC8+KSBvciA8YT5zaGFyZSB0aGlzIHJvb208L2E+LlwiLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiAoKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e21ha2VVc2VyUGVybWFsaW5rKHVzZXJJZCl9IHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiB0YXJnZXQ9XCJfYmxhbmtcIj57dXNlcklkfTwvYT4sXG4gICAgICAgICAgICAgICAgICAgICAgICBhOiAoc3ViKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e21ha2VSb29tUGVybWFsaW5rKHRoaXMucHJvcHMucm9vbUlkKX0gcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnV0dG9uVGV4dCA9IF90KFwiSW52aXRlXCIpO1xuICAgICAgICAgICAgZ29CdXR0b25GbiA9IHRoaXMuX2ludml0ZVVzZXJzO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMua2luZCA9PT0gS0lORF9DQUxMX1RSQU5TRkVSKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiVHJhbnNmZXJcIik7XG4gICAgICAgICAgICBidXR0b25UZXh0ID0gX3QoXCJUcmFuc2ZlclwiKTtcbiAgICAgICAgICAgIGdvQnV0dG9uRm4gPSB0aGlzLl90cmFuc2ZlckNhbGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5rbm93biBraW5kIG9mIEludml0ZURpYWxvZzogXCIgKyB0aGlzLnByb3BzLmtpbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaGFzU2VsZWN0aW9uID0gdGhpcy5zdGF0ZS50YXJnZXRzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIHx8ICh0aGlzLnN0YXRlLmZpbHRlclRleHQgJiYgdGhpcy5zdGF0ZS5maWx0ZXJUZXh0LmluY2x1ZGVzKCdAJykpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZydcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19oZWxwVGV4dCc+e2hlbHBUZXh0fTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19hZGRyZXNzQmFyJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJFZGl0b3IoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfYnV0dG9uQW5kU3Bpbm5lcic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtnb0J1dHRvbkZufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19nb0J1dHRvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeSB8fCAhaGFzU2VsZWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2J1dHRvblRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzcGlubmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVySWRlbnRpdHlTZXJ2ZXJXYXJuaW5nKCl9XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdlcnJvcic+e3RoaXMuc3RhdGUuZXJyb3JUZXh0fTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3VzZXJTZWN0aW9ucyc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyU2VjdGlvbigncmVjZW50cycpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlclNlY3Rpb24oJ3N1Z2dlc3Rpb25zJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
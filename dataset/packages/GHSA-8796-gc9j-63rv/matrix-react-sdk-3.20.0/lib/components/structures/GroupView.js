"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../index"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _HostingLink = require("../../utils/HostingLink");

var _HtmlUtils = require("../../HtmlUtils");

var _languageHandler = require("../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _GroupHeaderButtons = _interopRequireDefault(require("../views/right_panel/GroupHeaderButtons"));

var _MainSplit = _interopRequireDefault(require("./MainSplit"));

var _RightPanel = _interopRequireDefault(require("./RightPanel"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _classnames = _interopRequireDefault(require("classnames"));

var _GroupStore = _interopRequireDefault(require("../../stores/GroupStore"));

var _FlairStore = _interopRequireDefault(require("../../stores/FlairStore"));

var _GroupAddressPicker = require("../../GroupAddressPicker");

var _Permalinks = require("../../utils/permalinks/Permalinks");

var _group = require("matrix-js-sdk/src/models/group");

var _promise = require("../../utils/promise");

var _RightPanelStore = _interopRequireDefault(require("../../stores/RightPanelStore"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

var _Media = require("../../customisations/Media");

var _replaceableComponent = require("../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

const LONG_DESC_PLACEHOLDER = (0, _languageHandler._td)(`<h1>HTML for your community's page</h1>
<p>
    Use the long description to introduce new members to the community, or distribute
    some important <a href="foo">links</a>
</p>
<p>
    You can even add images with Matrix URLs <img src="mxc://url" />
</p>
`);

const RoomSummaryType = _propTypes.default.shape({
  room_id: _propTypes.default.string.isRequired,
  profile: _propTypes.default.shape({
    name: _propTypes.default.string,
    avatar_url: _propTypes.default.string,
    canonical_alias: _propTypes.default.string
  }).isRequired
});

const UserSummaryType = _propTypes.default.shape({
  summaryInfo: _propTypes.default.shape({
    user_id: _propTypes.default.string.isRequired,
    role_id: _propTypes.default.string,
    avatar_url: _propTypes.default.string,
    displayname: _propTypes.default.string
  }).isRequired
});

class CategoryRoomList extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onAddRoomsToSummaryClicked", ev => {
      ev.preventDefault();
      const AddressPickerDialog = sdk.getComponent("dialogs.AddressPickerDialog");

      _Modal.default.createTrackedDialog('Add Rooms to Group Summary', '', AddressPickerDialog, {
        title: (0, _languageHandler._t)('Add rooms to the community summary'),
        description: (0, _languageHandler._t)("Which rooms would you like to add to this summary?"),
        placeholder: (0, _languageHandler._t)("Room name or address"),
        button: (0, _languageHandler._t)("Add to summary"),
        pickerType: 'room',
        validAddressTypes: ['mx-room-id'],
        groupId: this.props.groupId,
        onFinished: (success, addrs) => {
          if (!success) return;
          const errorList = [];
          (0, _promise.allSettled)(addrs.map(addr => {
            return _GroupStore.default.addRoomToGroupSummary(this.props.groupId, addr.address).catch(() => {
              errorList.push(addr.address);
            });
          })).then(() => {
            if (errorList.length === 0) {
              return;
            }

            const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

            _Modal.default.createTrackedDialog('Failed to add the following room to the group summary', '', ErrorDialog, {
              title: (0, _languageHandler._t)("Failed to add the following rooms to the summary of %(groupId)s:", {
                groupId: this.props.groupId
              }),
              description: errorList.join(", ")
            });
          });
        }
      },
      /*className=*/
      null,
      /*isPriority=*/
      false,
      /*isStatic=*/
      true);
    });
  }

  render() {
    const TintableSvg = sdk.getComponent("elements.TintableSvg");
    const addButton = this.props.editing ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_GroupView_featuredThings_addButton",
      onClick: this.onAddRoomsToSummaryClicked
    }, /*#__PURE__*/_react.default.createElement(TintableSvg, {
      src: require("../../../res/img/icons-create-room.svg"),
      width: "64",
      height: "64"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThings_addButton_label"
    }, (0, _languageHandler._t)('Add a Room'))) : /*#__PURE__*/_react.default.createElement("div", null);
    const roomNodes = this.props.rooms.map(r => {
      return /*#__PURE__*/_react.default.createElement(FeaturedRoom, {
        key: r.room_id,
        groupId: this.props.groupId,
        editing: this.props.editing,
        summaryInfo: r
      });
    });

    let catHeader = /*#__PURE__*/_react.default.createElement("div", null);

    if (this.props.category && this.props.category.profile) {
      catHeader = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_featuredThings_category"
      }, this.props.category.profile.name);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThings_container"
    }, catHeader, roomNodes, addButton);
  }

}

(0, _defineProperty2.default)(CategoryRoomList, "propTypes", {
  rooms: _propTypes.default.arrayOf(RoomSummaryType).isRequired,
  category: _propTypes.default.shape({
    profile: _propTypes.default.shape({
      name: _propTypes.default.string
    }).isRequired
  }),
  groupId: _propTypes.default.string.isRequired,
  // Whether the list should be editable
  editing: _propTypes.default.bool.isRequired
});

class FeaturedRoom extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onClick", e => {
      e.preventDefault();
      e.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_alias: this.props.summaryInfo.profile.canonical_alias,
        room_id: this.props.summaryInfo.room_id
      });
    });
    (0, _defineProperty2.default)(this, "onDeleteClicked", e => {
      e.preventDefault();
      e.stopPropagation();

      _GroupStore.default.removeRoomFromGroupSummary(this.props.groupId, this.props.summaryInfo.room_id).catch(err => {
        console.error('Error whilst removing room from group summary', err);
        const roomName = this.props.summaryInfo.name || this.props.summaryInfo.canonical_alias || this.props.summaryInfo.room_id;
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Failed to remove room from group summary', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Failed to remove the room from the summary of %(groupId)s", {
            groupId: this.props.groupId
          }),
          description: (0, _languageHandler._t)("The room '%(roomName)s' could not be removed from the summary.", {
            roomName
          })
        });
      });
    });
  }

  render() {
    const RoomAvatar = sdk.getComponent("avatars.RoomAvatar");
    const roomName = this.props.summaryInfo.profile.name || this.props.summaryInfo.profile.canonical_alias || (0, _languageHandler._t)("Unnamed Room");
    const oobData = {
      roomId: this.props.summaryInfo.room_id,
      avatarUrl: this.props.summaryInfo.profile.avatar_url,
      name: roomName
    };
    let permalink = null;

    if (this.props.summaryInfo.profile && this.props.summaryInfo.profile.canonical_alias) {
      permalink = (0, _Permalinks.makeGroupPermalink)(this.props.summaryInfo.profile.canonical_alias);
    }

    let roomNameNode = null;

    if (permalink) {
      roomNameNode = /*#__PURE__*/_react.default.createElement("a", {
        href: permalink,
        onClick: this.onClick
      }, roomName);
    } else {
      roomNameNode = /*#__PURE__*/_react.default.createElement("span", null, roomName);
    }

    const deleteButton = this.props.editing ? /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_GroupView_featuredThing_deleteButton",
      src: require("../../../res/img/cancel-small.svg"),
      width: "14",
      height: "14",
      alt: "Delete",
      onClick: this.onDeleteClicked
    }) : /*#__PURE__*/_react.default.createElement("div", null);
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_GroupView_featuredThing",
      onClick: this.onClick
    }, /*#__PURE__*/_react.default.createElement(RoomAvatar, {
      oobData: oobData,
      width: 64,
      height: 64
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThing_name"
    }, roomNameNode), deleteButton);
  }

}

(0, _defineProperty2.default)(FeaturedRoom, "propTypes", {
  summaryInfo: RoomSummaryType.isRequired,
  editing: _propTypes.default.bool.isRequired,
  groupId: _propTypes.default.string.isRequired
});

class RoleUserList extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onAddUsersClicked", ev => {
      ev.preventDefault();
      const AddressPickerDialog = sdk.getComponent("dialogs.AddressPickerDialog");

      _Modal.default.createTrackedDialog('Add Users to Group Summary', '', AddressPickerDialog, {
        title: (0, _languageHandler._t)('Add users to the community summary'),
        description: (0, _languageHandler._t)("Who would you like to add to this summary?"),
        placeholder: (0, _languageHandler._t)("Name or Matrix ID"),
        button: (0, _languageHandler._t)("Add to summary"),
        validAddressTypes: ['mx-user-id'],
        groupId: this.props.groupId,
        shouldOmitSelf: false,
        onFinished: (success, addrs) => {
          if (!success) return;
          const errorList = [];
          (0, _promise.allSettled)(addrs.map(addr => {
            return _GroupStore.default.addUserToGroupSummary(addr.address).catch(() => {
              errorList.push(addr.address);
            });
          })).then(() => {
            if (errorList.length === 0) {
              return;
            }

            const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

            _Modal.default.createTrackedDialog('Failed to add the following users to the community summary', '', ErrorDialog, {
              title: (0, _languageHandler._t)("Failed to add the following users to the summary of %(groupId)s:", {
                groupId: this.props.groupId
              }),
              description: errorList.join(", ")
            });
          });
        }
      },
      /*className=*/
      null,
      /*isPriority=*/
      false,
      /*isStatic=*/
      true);
    });
  }

  render() {
    const TintableSvg = sdk.getComponent("elements.TintableSvg");
    const addButton = this.props.editing ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_GroupView_featuredThings_addButton",
      onClick: this.onAddUsersClicked
    }, /*#__PURE__*/_react.default.createElement(TintableSvg, {
      src: require("../../../res/img/icons-create-room.svg"),
      width: "64",
      height: "64"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThings_addButton_label"
    }, (0, _languageHandler._t)('Add a User'))) : /*#__PURE__*/_react.default.createElement("div", null);
    const userNodes = this.props.users.map(u => {
      return /*#__PURE__*/_react.default.createElement(FeaturedUser, {
        key: u.user_id,
        summaryInfo: u,
        editing: this.props.editing,
        groupId: this.props.groupId
      });
    });

    let roleHeader = /*#__PURE__*/_react.default.createElement("div", null);

    if (this.props.role && this.props.role.profile) {
      roleHeader = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_featuredThings_category"
      }, this.props.role.profile.name);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThings_container"
    }, roleHeader, userNodes, addButton);
  }

}

(0, _defineProperty2.default)(RoleUserList, "propTypes", {
  users: _propTypes.default.arrayOf(UserSummaryType).isRequired,
  role: _propTypes.default.shape({
    profile: _propTypes.default.shape({
      name: _propTypes.default.string
    }).isRequired
  }),
  groupId: _propTypes.default.string.isRequired,
  // Whether the list should be editable
  editing: _propTypes.default.bool.isRequired
});

class FeaturedUser extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onClick", e => {
      e.preventDefault();
      e.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'view_start_chat_or_reuse',
        user_id: this.props.summaryInfo.user_id
      });
    });
    (0, _defineProperty2.default)(this, "onDeleteClicked", e => {
      e.preventDefault();
      e.stopPropagation();

      _GroupStore.default.removeUserFromGroupSummary(this.props.groupId, this.props.summaryInfo.user_id).catch(err => {
        console.error('Error whilst removing user from group summary', err);
        const displayName = this.props.summaryInfo.displayname || this.props.summaryInfo.user_id;
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Failed to remove user from community summary', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Failed to remove a user from the summary of %(groupId)s", {
            groupId: this.props.groupId
          }),
          description: (0, _languageHandler._t)("The user '%(displayName)s' could not be removed from the summary.", {
            displayName
          })
        });
      });
    });
  }

  render() {
    const BaseAvatar = sdk.getComponent("avatars.BaseAvatar");
    const name = this.props.summaryInfo.displayname || this.props.summaryInfo.user_id;
    const permalink = (0, _Permalinks.makeUserPermalink)(this.props.summaryInfo.user_id);

    const userNameNode = /*#__PURE__*/_react.default.createElement("a", {
      href: permalink,
      onClick: this.onClick
    }, name);

    const httpUrl = (0, _Media.mediaFromMxc)(this.props.summaryInfo.avatar_url).getSquareThumbnailHttp(64);
    const deleteButton = this.props.editing ? /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_GroupView_featuredThing_deleteButton",
      src: require("../../../res/img/cancel-small.svg"),
      width: "14",
      height: "14",
      alt: "Delete",
      onClick: this.onDeleteClicked
    }) : /*#__PURE__*/_react.default.createElement("div", null);
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_GroupView_featuredThing",
      onClick: this.onClick
    }, /*#__PURE__*/_react.default.createElement(BaseAvatar, {
      name: name,
      url: httpUrl,
      width: 64,
      height: 64
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThing_name"
    }, userNameNode), deleteButton);
  }

}

(0, _defineProperty2.default)(FeaturedUser, "propTypes", {
  summaryInfo: UserSummaryType.isRequired,
  editing: _propTypes.default.bool.isRequired,
  groupId: _propTypes.default.string.isRequired
});
const GROUP_JOINPOLICY_OPEN = "open";
const GROUP_JOINPOLICY_INVITE = "invite";
let GroupView = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.GroupView"), _dec(_class = (_temp = _class2 = class GroupView extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      summary: null,
      isGroupPublicised: null,
      isUserPrivileged: null,
      groupRooms: null,
      groupRoomsLoading: null,
      error: null,
      editing: false,
      saving: false,
      uploadingAvatar: false,
      avatarChanged: false,
      membershipBusy: false,
      publicityBusy: false,
      inviterProfile: null,
      showRightPanel: _RightPanelStore.default.getSharedInstance().isOpenForGroup
    });
    (0, _defineProperty2.default)(this, "_onRightPanelStoreUpdate", () => {
      this.setState({
        showRightPanel: _RightPanelStore.default.getSharedInstance().isOpenForGroup
      });
    });
    (0, _defineProperty2.default)(this, "_onGroupMyMembership", group => {
      if (this._unmounted || group.groupId !== this.props.groupId) return;

      if (group.myMembership === 'leave') {
        // Leave settings - the user might have clicked the "Leave" button
        this._closeSettings();
      }

      this.setState({
        membershipBusy: false
      });
    });
    (0, _defineProperty2.default)(this, "onGroupStoreUpdated", firstInit => {
      if (this._unmounted) return;

      const summary = _GroupStore.default.getSummary(this.props.groupId);

      if (summary.profile) {
        // Default profile fields should be "" for later sending to the server (which
        // requires that the fields are strings, not null)
        ["avatar_url", "long_description", "name", "short_description"].forEach(k => {
          summary.profile[k] = summary.profile[k] || "";
        });
      }

      this.setState({
        summary,
        summaryLoading: !_GroupStore.default.isStateReady(this.props.groupId, _GroupStore.default.STATE_KEY.Summary),
        isGroupPublicised: _GroupStore.default.getGroupPublicity(this.props.groupId),
        isUserPrivileged: _GroupStore.default.isUserPrivileged(this.props.groupId),
        groupRooms: _GroupStore.default.getGroupRooms(this.props.groupId),
        groupRoomsLoading: !_GroupStore.default.isStateReady(this.props.groupId, _GroupStore.default.STATE_KEY.GroupRooms),
        isUserMember: _GroupStore.default.getGroupMembers(this.props.groupId).some(m => m.userId === this._matrixClient.credentials.userId)
      }); // XXX: This might not work but this.props.groupIsNew unused anyway

      if (this.props.groupIsNew && firstInit) {
        this._onEditClick();
      }
    });
    (0, _defineProperty2.default)(this, "_onEditClick", () => {
      this.setState({
        editing: true,
        profileForm: Object.assign({}, this.state.summary.profile),
        joinableForm: {
          policyType: this.state.summary.profile.is_openly_joinable ? GROUP_JOINPOLICY_OPEN : GROUP_JOINPOLICY_INVITE
        }
      });
    });
    (0, _defineProperty2.default)(this, "_onShareClick", () => {
      const ShareDialog = sdk.getComponent("dialogs.ShareDialog");

      _Modal.default.createTrackedDialog('share community dialog', '', ShareDialog, {
        target: this._matrixClient.getGroup(this.props.groupId) || new _group.Group(this.props.groupId)
      });
    });
    (0, _defineProperty2.default)(this, "_onCancelClick", () => {
      this._closeSettings();
    });
    (0, _defineProperty2.default)(this, "_onAction", payload => {
      switch (payload.action) {
        // NOTE: close_settings is an app-wide dispatch; as it is dispatched from MatrixChat
        case 'close_settings':
          this.setState({
            editing: false,
            profileForm: null
          });
          break;

        default:
          break;
      }
    });
    (0, _defineProperty2.default)(this, "_closeSettings", () => {
      _dispatcher.default.dispatch({
        action: 'close_settings'
      });
    });
    (0, _defineProperty2.default)(this, "_onNameChange", value => {
      const newProfileForm = Object.assign(this.state.profileForm, {
        name: value
      });
      this.setState({
        profileForm: newProfileForm
      });
    });
    (0, _defineProperty2.default)(this, "_onShortDescChange", value => {
      const newProfileForm = Object.assign(this.state.profileForm, {
        short_description: value
      });
      this.setState({
        profileForm: newProfileForm
      });
    });
    (0, _defineProperty2.default)(this, "_onLongDescChange", e => {
      const newProfileForm = Object.assign(this.state.profileForm, {
        long_description: e.target.value
      });
      this.setState({
        profileForm: newProfileForm
      });
    });
    (0, _defineProperty2.default)(this, "_onAvatarSelected", ev => {
      const file = ev.target.files[0];
      if (!file) return;
      this.setState({
        uploadingAvatar: true
      });

      this._matrixClient.uploadContent(file).then(url => {
        const newProfileForm = Object.assign(this.state.profileForm, {
          avatar_url: url
        });
        this.setState({
          uploadingAvatar: false,
          profileForm: newProfileForm,
          // Indicate that FlairStore needs to be poked to show this change
          // in TagTile (GroupFilterPanel), Flair and GroupTile (MyGroups).
          avatarChanged: true
        });
      }).catch(e => {
        this.setState({
          uploadingAvatar: false
        });
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
        console.error("Failed to upload avatar image", e);

        _Modal.default.createTrackedDialog('Failed to upload image', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Error'),
          description: (0, _languageHandler._t)('Failed to upload image')
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onJoinableChange", ev => {
      this.setState({
        joinableForm: {
          policyType: ev.target.value
        }
      });
    });
    (0, _defineProperty2.default)(this, "_onSaveClick", () => {
      this.setState({
        saving: true
      });
      const savePromise = this.state.isUserPrivileged ? this._saveGroup() : Promise.resolve();
      savePromise.then(result => {
        this.setState({
          saving: false,
          editing: false,
          summary: null
        });

        this._initGroupStore(this.props.groupId);

        if (this.state.avatarChanged) {
          // XXX: Evil - poking a store should be done from an async action
          _FlairStore.default.refreshGroupProfile(this._matrixClient, this.props.groupId);
        }
      }).catch(e => {
        this.setState({
          saving: false
        });
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
        console.error("Failed to save community profile", e);

        _Modal.default.createTrackedDialog('Failed to update group', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Error'),
          description: (0, _languageHandler._t)('Failed to update community')
        });
      }).finally(() => {
        this.setState({
          avatarChanged: false
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onAcceptInviteClick", async () => {
      this.setState({
        membershipBusy: true
      }); // Wait 500ms to prevent flashing. Do this before sending a request otherwise we risk the
      // spinner disappearing after we have fetched new group data.

      await (0, _promise.sleep)(500);

      _GroupStore.default.acceptGroupInvite(this.props.groupId).then(() => {// don't reset membershipBusy here: wait for the membership change to come down the sync
      }).catch(e => {
        this.setState({
          membershipBusy: false
        });
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Error accepting invite', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Error"),
          description: (0, _languageHandler._t)("Unable to accept invite")
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onRejectInviteClick", async () => {
      this.setState({
        membershipBusy: true
      }); // Wait 500ms to prevent flashing. Do this before sending a request otherwise we risk the
      // spinner disappearing after we have fetched new group data.

      await (0, _promise.sleep)(500);

      _GroupStore.default.leaveGroup(this.props.groupId).then(() => {// don't reset membershipBusy here: wait for the membership change to come down the sync
      }).catch(e => {
        this.setState({
          membershipBusy: false
        });
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Error rejecting invite', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Error"),
          description: (0, _languageHandler._t)("Unable to reject invite")
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onJoinClick", async () => {
      if (this._matrixClient.isGuest()) {
        _dispatcher.default.dispatch({
          action: 'require_registration',
          screen_after: {
            screen: `group/${this.props.groupId}`
          }
        });

        return;
      }

      this.setState({
        membershipBusy: true
      }); // Wait 500ms to prevent flashing. Do this before sending a request otherwise we risk the
      // spinner disappearing after we have fetched new group data.

      await (0, _promise.sleep)(500);

      _GroupStore.default.joinGroup(this.props.groupId).then(() => {// don't reset membershipBusy here: wait for the membership change to come down the sync
      }).catch(e => {
        this.setState({
          membershipBusy: false
        });
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Error joining room', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Error"),
          description: (0, _languageHandler._t)("Unable to join community")
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onLeaveClick", () => {
      const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

      const warnings = this._leaveGroupWarnings();

      _Modal.default.createTrackedDialog('Leave Group', '', QuestionDialog, {
        title: (0, _languageHandler._t)("Leave Community"),
        description: /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Leave %(groupName)s?", {
          groupName: this.props.groupId
        }), warnings),
        button: (0, _languageHandler._t)("Leave"),
        danger: this.state.isUserPrivileged,
        onFinished: async confirmed => {
          if (!confirmed) return;
          this.setState({
            membershipBusy: true
          }); // Wait 500ms to prevent flashing. Do this before sending a request otherwise we risk the
          // spinner disappearing after we have fetched new group data.

          await (0, _promise.sleep)(500);

          _GroupStore.default.leaveGroup(this.props.groupId).then(() => {// don't reset membershipBusy here: wait for the membership change to come down the sync
          }).catch(e => {
            this.setState({
              membershipBusy: false
            });
            const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

            _Modal.default.createTrackedDialog('Error leaving community', '', ErrorDialog, {
              title: (0, _languageHandler._t)("Error"),
              description: (0, _languageHandler._t)("Unable to leave community")
            });
          });
        }
      });
    });
    (0, _defineProperty2.default)(this, "_onAddRoomsClick", () => {
      (0, _GroupAddressPicker.showGroupAddRoomDialog)(this.props.groupId);
    });
  }

  componentDidMount() {
    this._unmounted = false;
    this._matrixClient = _MatrixClientPeg.MatrixClientPeg.get();

    this._matrixClient.on("Group.myMembership", this._onGroupMyMembership);

    this._initGroupStore(this.props.groupId, true);

    this._dispatcherRef = _dispatcher.default.register(this._onAction);
    this._rightPanelStoreToken = _RightPanelStore.default.getSharedInstance().addListener(this._onRightPanelStoreUpdate);
  }

  componentWillUnmount() {
    this._unmounted = true;

    this._matrixClient.removeListener("Group.myMembership", this._onGroupMyMembership);

    _dispatcher.default.unregister(this._dispatcherRef); // Remove RightPanelStore listener


    if (this._rightPanelStoreToken) {
      this._rightPanelStoreToken.remove();
    }
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(newProps) {
    if (this.props.groupId !== newProps.groupId) {
      this.setState({
        summary: null,
        error: null
      }, () => {
        this._initGroupStore(newProps.groupId);
      });
    }
  }

  _initGroupStore(groupId, firstInit) {
    const group = this._matrixClient.getGroup(groupId);

    if (group && group.inviter && group.inviter.userId) {
      this._fetchInviterProfile(group.inviter.userId);
    }

    _GroupStore.default.registerListener(groupId, this.onGroupStoreUpdated.bind(this, firstInit));

    let willDoOnboarding = false; // XXX: This should be more fluxy - let's get the error from GroupStore .getError or something

    _GroupStore.default.on('error', (err, errorGroupId, stateKey) => {
      if (this._unmounted || groupId !== errorGroupId) return;

      if (err.errcode === 'M_GUEST_ACCESS_FORBIDDEN' && !willDoOnboarding) {
        _dispatcher.default.dispatch({
          action: 'do_after_sync_prepared',
          deferred_action: {
            action: 'view_group',
            group_id: groupId
          }
        });

        _dispatcher.default.dispatch({
          action: 'require_registration',
          screen_after: {
            screen: `group/${groupId}`
          }
        });

        willDoOnboarding = true;
      }

      if (stateKey === _GroupStore.default.STATE_KEY.Summary) {
        this.setState({
          summary: null,
          error: err,
          editing: false
        });
      }
    });
  }

  _fetchInviterProfile(userId) {
    this.setState({
      inviterProfileBusy: true
    });

    this._matrixClient.getProfileInfo(userId).then(resp => {
      if (this._unmounted) return;
      this.setState({
        inviterProfile: {
          avatarUrl: resp.avatar_url,
          displayName: resp.displayname
        }
      });
    }).catch(e => {
      console.error('Error getting group inviter profile', e);
    }).finally(() => {
      if (this._unmounted) return;
      this.setState({
        inviterProfileBusy: false
      });
    });
  }

  async _saveGroup() {
    await this._matrixClient.setGroupProfile(this.props.groupId, this.state.profileForm);
    await this._matrixClient.setGroupJoinPolicy(this.props.groupId, {
      type: this.state.joinableForm.policyType
    });
  }

  _leaveGroupWarnings() {
    const warnings = [];

    if (this.state.isUserPrivileged) {
      warnings.push( /*#__PURE__*/_react.default.createElement("span", {
        className: "warning"
      }, " "
      /* Whitespace, otherwise the sentences get smashed together */
      , (0, _languageHandler._t)("You are an administrator of this community. You will not be " + "able to rejoin without an invite from another administrator.")));
    }

    return warnings;
  }

  _getGroupSection() {
    const groupSettingsSectionClasses = (0, _classnames.default)({
      "mx_GroupView_group": this.state.editing,
      "mx_GroupView_group_disabled": this.state.editing && !this.state.isUserPrivileged
    });
    const header = this.state.editing ? /*#__PURE__*/_react.default.createElement("h2", null, " ", (0, _languageHandler._t)('Community Settings'), " ") : /*#__PURE__*/_react.default.createElement("div", null);
    const hostingSignupLink = (0, _HostingLink.getHostingLink)('community-settings');
    let hostingSignup = null;

    if (hostingSignupLink && this.state.isUserPrivileged) {
      hostingSignup = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_hostingSignup"
      }, (0, _languageHandler._t)("Want more than a community? <a>Get your own server</a>", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: hostingSignupLink,
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }), /*#__PURE__*/_react.default.createElement("a", {
        href: hostingSignupLink,
        target: "_blank",
        rel: "noreferrer noopener"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../res/img/external-link.svg"),
        width: "11",
        height: "10",
        alt: ""
      })));
    }

    const changeDelayWarning = this.state.editing && this.state.isUserPrivileged ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_changeDelayWarning"
    }, (0, _languageHandler._t)('Changes made to your community <bold1>name</bold1> and <bold2>avatar</bold2> ' + 'might not be seen by other users for up to 30 minutes.', {}, {
      'bold1': sub => /*#__PURE__*/_react.default.createElement("b", null, " ", sub, " "),
      'bold2': sub => /*#__PURE__*/_react.default.createElement("b", null, " ", sub, " ")
    })) : /*#__PURE__*/_react.default.createElement("div", null);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: groupSettingsSectionClasses
    }, header, hostingSignup, changeDelayWarning, this._getJoinableNode(), this._getLongDescriptionNode(), this._getRoomsNode());
  }

  _getRoomsNode() {
    const RoomDetailList = sdk.getComponent('rooms.RoomDetailList');
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    const TintableSvg = sdk.getComponent('elements.TintableSvg');
    const Spinner = sdk.getComponent('elements.Spinner');
    const TooltipButton = sdk.getComponent('elements.TooltipButton');
    const roomsHelpNode = this.state.editing ? /*#__PURE__*/_react.default.createElement(TooltipButton, {
      helpText: (0, _languageHandler._t)('These rooms are displayed to community members on the community page. ' + 'Community members can join the rooms by clicking on them.')
    }) : /*#__PURE__*/_react.default.createElement("div", null);
    const addRoomRow = this.state.editing ? /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      className: "mx_GroupView_rooms_header_addRow",
      onClick: this._onAddRoomsClick
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_rooms_header_addRow_button"
    }, /*#__PURE__*/_react.default.createElement(TintableSvg, {
      src: require("../../../res/img/icons-room-add.svg"),
      width: "24",
      height: "24"
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_rooms_header_addRow_label"
    }, (0, _languageHandler._t)('Add rooms to this community'))) : /*#__PURE__*/_react.default.createElement("div", null);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_rooms"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_rooms_header"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)('Rooms'), roomsHelpNode), addRoomRow), this.state.groupRoomsLoading ? /*#__PURE__*/_react.default.createElement(Spinner, null) : /*#__PURE__*/_react.default.createElement(RoomDetailList, {
      rooms: this.state.groupRooms
    }));
  }

  _getFeaturedRoomsNode() {
    const summary = this.state.summary;
    const defaultCategoryRooms = [];
    const categoryRooms = {};
    summary.rooms_section.rooms.forEach(r => {
      if (r.category_id === null) {
        defaultCategoryRooms.push(r);
      } else {
        let list = categoryRooms[r.category_id];

        if (list === undefined) {
          list = [];
          categoryRooms[r.category_id] = list;
        }

        list.push(r);
      }
    });

    const defaultCategoryNode = /*#__PURE__*/_react.default.createElement(CategoryRoomList, {
      rooms: defaultCategoryRooms,
      groupId: this.props.groupId,
      editing: this.state.editing
    });

    const categoryRoomNodes = Object.keys(categoryRooms).map(catId => {
      const cat = summary.rooms_section.categories[catId];
      return /*#__PURE__*/_react.default.createElement(CategoryRoomList, {
        key: catId,
        rooms: categoryRooms[catId],
        category: cat,
        groupId: this.props.groupId,
        editing: this.state.editing
      });
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThings"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThings_header"
    }, (0, _languageHandler._t)('Featured Rooms:')), defaultCategoryNode, categoryRoomNodes);
  }

  _getFeaturedUsersNode() {
    const summary = this.state.summary;
    const noRoleUsers = [];
    const roleUsers = {};
    summary.users_section.users.forEach(u => {
      if (u.role_id === null) {
        noRoleUsers.push(u);
      } else {
        let list = roleUsers[u.role_id];

        if (list === undefined) {
          list = [];
          roleUsers[u.role_id] = list;
        }

        list.push(u);
      }
    });

    const noRoleNode = /*#__PURE__*/_react.default.createElement(RoleUserList, {
      users: noRoleUsers,
      groupId: this.props.groupId,
      editing: this.state.editing
    });

    const roleUserNodes = Object.keys(roleUsers).map(roleId => {
      const role = summary.users_section.roles[roleId];
      return /*#__PURE__*/_react.default.createElement(RoleUserList, {
        key: roleId,
        users: roleUsers[roleId],
        role: role,
        groupId: this.props.groupId,
        editing: this.state.editing
      });
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThings"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_featuredThings_header"
    }, (0, _languageHandler._t)('Featured Users:')), noRoleNode, roleUserNodes);
  }

  _getMembershipSection() {
    const Spinner = sdk.getComponent("elements.Spinner");
    const BaseAvatar = sdk.getComponent("avatars.BaseAvatar");

    const group = this._matrixClient.getGroup(this.props.groupId);

    if (group && group.myMembership === 'invite') {
      if (this.state.membershipBusy || this.state.inviterProfileBusy) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_GroupView_membershipSection"
        }, /*#__PURE__*/_react.default.createElement(Spinner, null));
      }

      const httpInviterAvatar = this.state.inviterProfile && this.state.inviterProfile.avatarUrl ? (0, _Media.mediaFromMxc)(this.state.inviterProfile.avatarUrl).getSquareThumbnailHttp(36) : null;
      const inviter = group.inviter || {};
      let inviterName = inviter.userId;

      if (this.state.inviterProfile) {
        inviterName = this.state.inviterProfile.displayName || inviter.userId;
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_membershipSection mx_GroupView_membershipSection_invited"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_membershipSubSection"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_membershipSection_description"
      }, /*#__PURE__*/_react.default.createElement(BaseAvatar, {
        url: httpInviterAvatar,
        name: inviterName,
        width: 36,
        height: 36
      }), (0, _languageHandler._t)("%(inviter)s has invited you to join this community", {
        inviter: inviterName || (0, _languageHandler._t)("Someone")
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_membership_buttonContainer"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_GroupView_textButton mx_RoomHeader_textButton",
        onClick: this._onAcceptInviteClick
      }, (0, _languageHandler._t)("Accept")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_GroupView_textButton mx_RoomHeader_textButton",
        onClick: this._onRejectInviteClick
      }, (0, _languageHandler._t)("Decline")))));
    }

    let membershipContainerExtraClasses;
    let membershipButtonExtraClasses;
    let membershipButtonTooltip;
    let membershipButtonText;
    let membershipButtonOnClick; // User is not in the group

    if ((!group || group.myMembership === 'leave') && this.state.summary && this.state.summary.profile && Boolean(this.state.summary.profile.is_openly_joinable)) {
      membershipButtonText = (0, _languageHandler._t)("Join this community");
      membershipButtonOnClick = this._onJoinClick;
      membershipButtonExtraClasses = 'mx_GroupView_joinButton';
      membershipContainerExtraClasses = 'mx_GroupView_membershipSection_leave';
    } else if (group && group.myMembership === 'join' && this.state.editing) {
      membershipButtonText = (0, _languageHandler._t)("Leave this community");
      membershipButtonOnClick = this._onLeaveClick;
      membershipButtonTooltip = this.state.isUserPrivileged ? (0, _languageHandler._t)("You are an administrator of this community") : (0, _languageHandler._t)("You are a member of this community");
      membershipButtonExtraClasses = {
        'mx_GroupView_leaveButton': true,
        'mx_RoomHeader_textButton_danger': this.state.isUserPrivileged
      };
      membershipContainerExtraClasses = 'mx_GroupView_membershipSection_joined';
    } else {
      return null;
    }

    const membershipButtonClasses = (0, _classnames.default)(['mx_RoomHeader_textButton', 'mx_GroupView_textButton'], membershipButtonExtraClasses);
    const membershipContainerClasses = (0, _classnames.default)('mx_GroupView_membershipSection', membershipContainerExtraClasses);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: membershipContainerClasses
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_membershipSubSection"
    }, this.state.membershipBusy ? /*#__PURE__*/_react.default.createElement(Spinner, null) : /*#__PURE__*/_react.default.createElement("div", null), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_membership_buttonContainer"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: membershipButtonClasses,
      onClick: membershipButtonOnClick,
      title: membershipButtonTooltip
    }, membershipButtonText))));
  }

  _getJoinableNode() {
    const InlineSpinner = sdk.getComponent('elements.InlineSpinner');
    return this.state.editing ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)('Who can join this community?'), this.state.groupJoinableLoading ? /*#__PURE__*/_react.default.createElement(InlineSpinner, null) : /*#__PURE__*/_react.default.createElement("div", null)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
      type: "radio",
      value: GROUP_JOINPOLICY_INVITE,
      checked: this.state.joinableForm.policyType === GROUP_JOINPOLICY_INVITE,
      onChange: this._onJoinableChange
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_label_text"
    }, (0, _languageHandler._t)('Only people who have been invited')))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
      type: "radio",
      value: GROUP_JOINPOLICY_OPEN,
      checked: this.state.joinableForm.policyType === GROUP_JOINPOLICY_OPEN,
      onChange: this._onJoinableChange
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_label_text"
    }, (0, _languageHandler._t)('Everyone'))))) : null;
  }

  _getLongDescriptionNode() {
    const summary = this.state.summary;
    let description = null;

    if (summary.profile && summary.profile.long_description) {
      description = (0, _HtmlUtils.sanitizedHtmlNode)(summary.profile.long_description);
    } else if (this.state.isUserPrivileged) {
      description = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_groupDesc_placeholder",
        onClick: this._onEditClick
      }, (0, _languageHandler._t)('Your community hasn\'t got a Long Description, a HTML page to show to community members.<br />' + 'Click here to open settings and give it one!', {}, {
        'br': /*#__PURE__*/_react.default.createElement("br", null)
      }));
    }

    const groupDescEditingClasses = (0, _classnames.default)({
      "mx_GroupView_groupDesc": true,
      "mx_GroupView_groupDesc_disabled": !this.state.isUserPrivileged
    });
    return this.state.editing ? /*#__PURE__*/_react.default.createElement("div", {
      className: groupDescEditingClasses
    }, /*#__PURE__*/_react.default.createElement("h3", null, " ", (0, _languageHandler._t)("Long Description (HTML)"), " "), /*#__PURE__*/_react.default.createElement("textarea", {
      value: this.state.profileForm.long_description,
      placeholder: (0, _languageHandler._t)(LONG_DESC_PLACEHOLDER),
      onChange: this._onLongDescChange,
      tabIndex: "4",
      key: "editLongDesc"
    })) : /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupView_groupDesc"
    }, description);
  }

  render() {
    const GroupAvatar = sdk.getComponent("avatars.GroupAvatar");
    const Spinner = sdk.getComponent("elements.Spinner");

    if (this.state.summaryLoading && this.state.error === null || this.state.saving) {
      return /*#__PURE__*/_react.default.createElement(Spinner, null);
    } else if (this.state.summary && !this.state.error) {
      const summary = this.state.summary;
      let avatarNode;
      let nameNode;
      let shortDescNode;
      const rightButtons = [];

      if (this.state.editing && this.state.isUserPrivileged) {
        let avatarImage;

        if (this.state.uploadingAvatar) {
          avatarImage = /*#__PURE__*/_react.default.createElement(Spinner, null);
        } else {
          const GroupAvatar = sdk.getComponent('avatars.GroupAvatar');
          avatarImage = /*#__PURE__*/_react.default.createElement(GroupAvatar, {
            groupId: this.props.groupId,
            groupName: this.state.profileForm.name,
            groupAvatarUrl: this.state.profileForm.avatar_url,
            width: 28,
            height: 28,
            resizeMethod: "crop"
          });
        }

        avatarNode = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_GroupView_avatarPicker"
        }, /*#__PURE__*/_react.default.createElement("label", {
          htmlFor: "avatarInput",
          className: "mx_GroupView_avatarPicker_label"
        }, avatarImage), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_GroupView_avatarPicker_edit"
        }, /*#__PURE__*/_react.default.createElement("label", {
          htmlFor: "avatarInput",
          className: "mx_GroupView_avatarPicker_label"
        }, /*#__PURE__*/_react.default.createElement("img", {
          src: require("../../../res/img/camera.svg"),
          alt: (0, _languageHandler._t)("Upload avatar"),
          title: (0, _languageHandler._t)("Upload avatar"),
          width: "17",
          height: "15"
        })), /*#__PURE__*/_react.default.createElement("input", {
          id: "avatarInput",
          className: "mx_GroupView_uploadInput",
          type: "file",
          onChange: this._onAvatarSelected
        })));
        const EditableText = sdk.getComponent("elements.EditableText");
        nameNode = /*#__PURE__*/_react.default.createElement(EditableText, {
          className: "mx_GroupView_editable",
          placeholderClassName: "mx_GroupView_placeholder",
          placeholder: (0, _languageHandler._t)('Community Name'),
          blurToCancel: false,
          initialValue: this.state.profileForm.name,
          onValueChanged: this._onNameChange,
          tabIndex: "0",
          dir: "auto"
        });
        shortDescNode = /*#__PURE__*/_react.default.createElement(EditableText, {
          className: "mx_GroupView_editable",
          placeholderClassName: "mx_GroupView_placeholder",
          placeholder: (0, _languageHandler._t)("Description"),
          blurToCancel: false,
          initialValue: this.state.profileForm.short_description,
          onValueChanged: this._onShortDescChange,
          tabIndex: "0",
          dir: "auto"
        });
      } else {
        const onGroupHeaderItemClick = this.state.isUserMember ? this._onEditClick : null;
        const groupAvatarUrl = summary.profile ? summary.profile.avatar_url : null;
        const groupName = summary.profile ? summary.profile.name : null;
        avatarNode = /*#__PURE__*/_react.default.createElement(GroupAvatar, {
          groupId: this.props.groupId,
          groupAvatarUrl: groupAvatarUrl,
          groupName: groupName,
          onClick: onGroupHeaderItemClick,
          width: 28,
          height: 28
        });

        if (summary.profile && summary.profile.name) {
          nameNode = /*#__PURE__*/_react.default.createElement("div", {
            onClick: onGroupHeaderItemClick
          }, /*#__PURE__*/_react.default.createElement("span", null, summary.profile.name), /*#__PURE__*/_react.default.createElement("span", {
            className: "mx_GroupView_header_groupid"
          }, "(", this.props.groupId, ")"));
        } else {
          nameNode = /*#__PURE__*/_react.default.createElement("span", {
            onClick: onGroupHeaderItemClick
          }, this.props.groupId);
        }

        if (summary.profile && summary.profile.short_description) {
          shortDescNode = /*#__PURE__*/_react.default.createElement("span", {
            onClick: onGroupHeaderItemClick
          }, summary.profile.short_description);
        }
      }

      if (this.state.editing) {
        rightButtons.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_GroupView_textButton mx_RoomHeader_textButton",
          key: "_saveButton",
          onClick: this._onSaveClick
        }, (0, _languageHandler._t)('Save')));
        rightButtons.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_RoomHeader_cancelButton",
          key: "_cancelButton",
          onClick: this._onCancelClick
        }, /*#__PURE__*/_react.default.createElement("img", {
          src: require("../../../res/img/cancel.svg"),
          className: "mx_filterFlipColor",
          width: "18",
          height: "18",
          alt: (0, _languageHandler._t)("Cancel")
        })));
      } else {
        if (summary.user && summary.user.membership === 'join') {
          rightButtons.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            className: "mx_GroupHeader_button mx_GroupHeader_editButton",
            key: "_editButton",
            onClick: this._onEditClick,
            title: (0, _languageHandler._t)("Community Settings")
          }));
        }

        rightButtons.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_GroupHeader_button mx_GroupHeader_shareButton",
          key: "_shareButton",
          onClick: this._onShareClick,
          title: (0, _languageHandler._t)('Share Community')
        }));
      }

      const rightPanel = this.state.showRightPanel ? /*#__PURE__*/_react.default.createElement(_RightPanel.default, {
        groupId: this.props.groupId
      }) : undefined;
      const headerClasses = {
        "mx_GroupView_header": true,
        "light-panel": true,
        "mx_GroupView_header_view": !this.state.editing,
        "mx_GroupView_header_isUserMember": this.state.isUserMember
      };
      return /*#__PURE__*/_react.default.createElement("main", {
        className: "mx_GroupView"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: (0, _classnames.default)(headerClasses)
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_header_leftCol"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_header_avatar"
      }, avatarNode), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_header_info"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_header_name"
      }, nameNode), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_header_shortDesc"
      }, shortDescNode))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_GroupView_header_rightCol"
      }, rightButtons), /*#__PURE__*/_react.default.createElement(_GroupHeaderButtons.default, null)), /*#__PURE__*/_react.default.createElement(_MainSplit.default, {
        panel: rightPanel,
        resizeNotifier: this.props.resizeNotifier
      }, /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
        className: "mx_GroupView_body"
      }, this._getMembershipSection(), this._getGroupSection())));
    } else if (this.state.error) {
      if (this.state.error.httpStatus === 404) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_GroupView_error"
        }, (0, _languageHandler._t)('Community %(groupId)s not found', {
          groupId: this.props.groupId
        }));
      } else {
        let extraText;

        if (this.state.error.errcode === 'M_UNRECOGNIZED') {
          extraText = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('This homeserver does not support communities'));
        }

        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_GroupView_error"
        }, (0, _languageHandler._t)('Failed to load %(groupId)s', {
          groupId: this.props.groupId
        }), extraText);
      }
    } else {
      console.error("Invalid state for GroupView");
      return /*#__PURE__*/_react.default.createElement("div", null);
    }
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  groupId: _propTypes.default.string.isRequired,
  // Whether this is the first time the group admin is viewing the group
  groupIsNew: _propTypes.default.bool
}), _temp)) || _class);
exports.default = GroupView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvR3JvdXBWaWV3LmpzIl0sIm5hbWVzIjpbIkxPTkdfREVTQ19QTEFDRUhPTERFUiIsIlJvb21TdW1tYXJ5VHlwZSIsIlByb3BUeXBlcyIsInNoYXBlIiwicm9vbV9pZCIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJwcm9maWxlIiwibmFtZSIsImF2YXRhcl91cmwiLCJjYW5vbmljYWxfYWxpYXMiLCJVc2VyU3VtbWFyeVR5cGUiLCJzdW1tYXJ5SW5mbyIsInVzZXJfaWQiLCJyb2xlX2lkIiwiZGlzcGxheW5hbWUiLCJDYXRlZ29yeVJvb21MaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJldiIsInByZXZlbnREZWZhdWx0IiwiQWRkcmVzc1BpY2tlckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJwbGFjZWhvbGRlciIsImJ1dHRvbiIsInBpY2tlclR5cGUiLCJ2YWxpZEFkZHJlc3NUeXBlcyIsImdyb3VwSWQiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJzdWNjZXNzIiwiYWRkcnMiLCJlcnJvckxpc3QiLCJtYXAiLCJhZGRyIiwiR3JvdXBTdG9yZSIsImFkZFJvb21Ub0dyb3VwU3VtbWFyeSIsImFkZHJlc3MiLCJjYXRjaCIsInB1c2giLCJ0aGVuIiwibGVuZ3RoIiwiRXJyb3JEaWFsb2ciLCJqb2luIiwicmVuZGVyIiwiVGludGFibGVTdmciLCJhZGRCdXR0b24iLCJlZGl0aW5nIiwib25BZGRSb29tc1RvU3VtbWFyeUNsaWNrZWQiLCJyZXF1aXJlIiwicm9vbU5vZGVzIiwicm9vbXMiLCJyIiwiY2F0SGVhZGVyIiwiY2F0ZWdvcnkiLCJhcnJheU9mIiwiYm9vbCIsIkZlYXR1cmVkUm9vbSIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21fYWxpYXMiLCJyZW1vdmVSb29tRnJvbUdyb3VwU3VtbWFyeSIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsInJvb21OYW1lIiwiUm9vbUF2YXRhciIsIm9vYkRhdGEiLCJyb29tSWQiLCJhdmF0YXJVcmwiLCJwZXJtYWxpbmsiLCJyb29tTmFtZU5vZGUiLCJvbkNsaWNrIiwiZGVsZXRlQnV0dG9uIiwib25EZWxldGVDbGlja2VkIiwiUm9sZVVzZXJMaXN0Iiwic2hvdWxkT21pdFNlbGYiLCJhZGRVc2VyVG9Hcm91cFN1bW1hcnkiLCJvbkFkZFVzZXJzQ2xpY2tlZCIsInVzZXJOb2RlcyIsInVzZXJzIiwidSIsInJvbGVIZWFkZXIiLCJyb2xlIiwiRmVhdHVyZWRVc2VyIiwicmVtb3ZlVXNlckZyb21Hcm91cFN1bW1hcnkiLCJkaXNwbGF5TmFtZSIsIkJhc2VBdmF0YXIiLCJ1c2VyTmFtZU5vZGUiLCJodHRwVXJsIiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsIkdST1VQX0pPSU5QT0xJQ1lfT1BFTiIsIkdST1VQX0pPSU5QT0xJQ1lfSU5WSVRFIiwiR3JvdXBWaWV3Iiwic3VtbWFyeSIsImlzR3JvdXBQdWJsaWNpc2VkIiwiaXNVc2VyUHJpdmlsZWdlZCIsImdyb3VwUm9vbXMiLCJncm91cFJvb21zTG9hZGluZyIsInNhdmluZyIsInVwbG9hZGluZ0F2YXRhciIsImF2YXRhckNoYW5nZWQiLCJtZW1iZXJzaGlwQnVzeSIsInB1YmxpY2l0eUJ1c3kiLCJpbnZpdGVyUHJvZmlsZSIsInNob3dSaWdodFBhbmVsIiwiUmlnaHRQYW5lbFN0b3JlIiwiZ2V0U2hhcmVkSW5zdGFuY2UiLCJpc09wZW5Gb3JHcm91cCIsInNldFN0YXRlIiwiZ3JvdXAiLCJfdW5tb3VudGVkIiwibXlNZW1iZXJzaGlwIiwiX2Nsb3NlU2V0dGluZ3MiLCJmaXJzdEluaXQiLCJnZXRTdW1tYXJ5IiwiZm9yRWFjaCIsImsiLCJzdW1tYXJ5TG9hZGluZyIsImlzU3RhdGVSZWFkeSIsIlNUQVRFX0tFWSIsIlN1bW1hcnkiLCJnZXRHcm91cFB1YmxpY2l0eSIsImdldEdyb3VwUm9vbXMiLCJHcm91cFJvb21zIiwiaXNVc2VyTWVtYmVyIiwiZ2V0R3JvdXBNZW1iZXJzIiwic29tZSIsIm0iLCJ1c2VySWQiLCJfbWF0cml4Q2xpZW50IiwiY3JlZGVudGlhbHMiLCJncm91cElzTmV3IiwiX29uRWRpdENsaWNrIiwicHJvZmlsZUZvcm0iLCJPYmplY3QiLCJhc3NpZ24iLCJzdGF0ZSIsImpvaW5hYmxlRm9ybSIsInBvbGljeVR5cGUiLCJpc19vcGVubHlfam9pbmFibGUiLCJTaGFyZURpYWxvZyIsInRhcmdldCIsImdldEdyb3VwIiwiR3JvdXAiLCJwYXlsb2FkIiwidmFsdWUiLCJuZXdQcm9maWxlRm9ybSIsInNob3J0X2Rlc2NyaXB0aW9uIiwibG9uZ19kZXNjcmlwdGlvbiIsImZpbGUiLCJmaWxlcyIsInVwbG9hZENvbnRlbnQiLCJ1cmwiLCJzYXZlUHJvbWlzZSIsIl9zYXZlR3JvdXAiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlc3VsdCIsIl9pbml0R3JvdXBTdG9yZSIsIkZsYWlyU3RvcmUiLCJyZWZyZXNoR3JvdXBQcm9maWxlIiwiZmluYWxseSIsImFjY2VwdEdyb3VwSW52aXRlIiwibGVhdmVHcm91cCIsImlzR3Vlc3QiLCJzY3JlZW5fYWZ0ZXIiLCJzY3JlZW4iLCJqb2luR3JvdXAiLCJRdWVzdGlvbkRpYWxvZyIsIndhcm5pbmdzIiwiX2xlYXZlR3JvdXBXYXJuaW5ncyIsImdyb3VwTmFtZSIsImRhbmdlciIsImNvbmZpcm1lZCIsImNvbXBvbmVudERpZE1vdW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwib24iLCJfb25Hcm91cE15TWVtYmVyc2hpcCIsIl9kaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJfb25BY3Rpb24iLCJfcmlnaHRQYW5lbFN0b3JlVG9rZW4iLCJhZGRMaXN0ZW5lciIsIl9vblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwicmVtb3ZlIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsImludml0ZXIiLCJfZmV0Y2hJbnZpdGVyUHJvZmlsZSIsInJlZ2lzdGVyTGlzdGVuZXIiLCJvbkdyb3VwU3RvcmVVcGRhdGVkIiwiYmluZCIsIndpbGxEb09uYm9hcmRpbmciLCJlcnJvckdyb3VwSWQiLCJzdGF0ZUtleSIsImVycmNvZGUiLCJkZWZlcnJlZF9hY3Rpb24iLCJncm91cF9pZCIsImludml0ZXJQcm9maWxlQnVzeSIsImdldFByb2ZpbGVJbmZvIiwicmVzcCIsInNldEdyb3VwUHJvZmlsZSIsInNldEdyb3VwSm9pblBvbGljeSIsInR5cGUiLCJfZ2V0R3JvdXBTZWN0aW9uIiwiZ3JvdXBTZXR0aW5nc1NlY3Rpb25DbGFzc2VzIiwiaGVhZGVyIiwiaG9zdGluZ1NpZ251cExpbmsiLCJob3N0aW5nU2lnbnVwIiwiYSIsInN1YiIsImNoYW5nZURlbGF5V2FybmluZyIsIl9nZXRKb2luYWJsZU5vZGUiLCJfZ2V0TG9uZ0Rlc2NyaXB0aW9uTm9kZSIsIl9nZXRSb29tc05vZGUiLCJSb29tRGV0YWlsTGlzdCIsIkFjY2Vzc2libGVCdXR0b24iLCJTcGlubmVyIiwiVG9vbHRpcEJ1dHRvbiIsInJvb21zSGVscE5vZGUiLCJhZGRSb29tUm93IiwiX29uQWRkUm9vbXNDbGljayIsIl9nZXRGZWF0dXJlZFJvb21zTm9kZSIsImRlZmF1bHRDYXRlZ29yeVJvb21zIiwiY2F0ZWdvcnlSb29tcyIsInJvb21zX3NlY3Rpb24iLCJjYXRlZ29yeV9pZCIsImxpc3QiLCJ1bmRlZmluZWQiLCJkZWZhdWx0Q2F0ZWdvcnlOb2RlIiwiY2F0ZWdvcnlSb29tTm9kZXMiLCJrZXlzIiwiY2F0SWQiLCJjYXQiLCJjYXRlZ29yaWVzIiwiX2dldEZlYXR1cmVkVXNlcnNOb2RlIiwibm9Sb2xlVXNlcnMiLCJyb2xlVXNlcnMiLCJ1c2Vyc19zZWN0aW9uIiwibm9Sb2xlTm9kZSIsInJvbGVVc2VyTm9kZXMiLCJyb2xlSWQiLCJyb2xlcyIsIl9nZXRNZW1iZXJzaGlwU2VjdGlvbiIsImh0dHBJbnZpdGVyQXZhdGFyIiwiaW52aXRlck5hbWUiLCJfb25BY2NlcHRJbnZpdGVDbGljayIsIl9vblJlamVjdEludml0ZUNsaWNrIiwibWVtYmVyc2hpcENvbnRhaW5lckV4dHJhQ2xhc3NlcyIsIm1lbWJlcnNoaXBCdXR0b25FeHRyYUNsYXNzZXMiLCJtZW1iZXJzaGlwQnV0dG9uVG9vbHRpcCIsIm1lbWJlcnNoaXBCdXR0b25UZXh0IiwibWVtYmVyc2hpcEJ1dHRvbk9uQ2xpY2siLCJCb29sZWFuIiwiX29uSm9pbkNsaWNrIiwiX29uTGVhdmVDbGljayIsIm1lbWJlcnNoaXBCdXR0b25DbGFzc2VzIiwibWVtYmVyc2hpcENvbnRhaW5lckNsYXNzZXMiLCJJbmxpbmVTcGlubmVyIiwiZ3JvdXBKb2luYWJsZUxvYWRpbmciLCJfb25Kb2luYWJsZUNoYW5nZSIsImdyb3VwRGVzY0VkaXRpbmdDbGFzc2VzIiwiX29uTG9uZ0Rlc2NDaGFuZ2UiLCJHcm91cEF2YXRhciIsImF2YXRhck5vZGUiLCJuYW1lTm9kZSIsInNob3J0RGVzY05vZGUiLCJyaWdodEJ1dHRvbnMiLCJhdmF0YXJJbWFnZSIsIl9vbkF2YXRhclNlbGVjdGVkIiwiRWRpdGFibGVUZXh0IiwiX29uTmFtZUNoYW5nZSIsIl9vblNob3J0RGVzY0NoYW5nZSIsIm9uR3JvdXBIZWFkZXJJdGVtQ2xpY2siLCJncm91cEF2YXRhclVybCIsIl9vblNhdmVDbGljayIsIl9vbkNhbmNlbENsaWNrIiwidXNlciIsIm1lbWJlcnNoaXAiLCJfb25TaGFyZUNsaWNrIiwicmlnaHRQYW5lbCIsImhlYWRlckNsYXNzZXMiLCJyZXNpemVOb3RpZmllciIsImh0dHBTdGF0dXMiLCJleHRyYVRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FB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TCxDQUFXRDtBQUFyQixTQUFqQyxDQUROLEVBRU15USxTQUZOLENBREo7QUFNSDtBQUNKLEtBbkJNLE1BbUJBO0FBQ0hsTyxNQUFBQSxPQUFPLENBQUNDLEtBQVIsQ0FBYyw2QkFBZDtBQUNBLDBCQUFPLHlDQUFQO0FBQ0g7QUFDSjs7QUE1N0JrRCxDLHNEQUNoQztBQUNmeEMsRUFBQUEsT0FBTyxFQUFFOUIsbUJBQVVHLE1BQVYsQ0FBaUJDLFVBRFg7QUFFZjtBQUNBc0ksRUFBQUEsVUFBVSxFQUFFMUksbUJBQVUyRDtBQUhQLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGQuXG5Db3B5cmlnaHQgMjAxNywgMjAxOCBOZXcgVmVjdG9yIEx0ZC5cbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi9pbmRleCc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBnZXRIb3N0aW5nTGluayB9IGZyb20gJy4uLy4uL3V0aWxzL0hvc3RpbmdMaW5rJztcbmltcG9ydCB7IHNhbml0aXplZEh0bWxOb2RlIH0gZnJvbSAnLi4vLi4vSHRtbFV0aWxzJztcbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgR3JvdXBIZWFkZXJCdXR0b25zIGZyb20gJy4uL3ZpZXdzL3JpZ2h0X3BhbmVsL0dyb3VwSGVhZGVyQnV0dG9ucyc7XG5pbXBvcnQgTWFpblNwbGl0IGZyb20gJy4vTWFpblNwbGl0JztcbmltcG9ydCBSaWdodFBhbmVsIGZyb20gJy4vUmlnaHRQYW5lbCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vTW9kYWwnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCBHcm91cFN0b3JlIGZyb20gJy4uLy4uL3N0b3Jlcy9Hcm91cFN0b3JlJztcbmltcG9ydCBGbGFpclN0b3JlIGZyb20gJy4uLy4uL3N0b3Jlcy9GbGFpclN0b3JlJztcbmltcG9ydCB7IHNob3dHcm91cEFkZFJvb21EaWFsb2cgfSBmcm9tICcuLi8uLi9Hcm91cEFkZHJlc3NQaWNrZXInO1xuaW1wb3J0IHttYWtlR3JvdXBQZXJtYWxpbmssIG1ha2VVc2VyUGVybWFsaW5rfSBmcm9tIFwiLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQge0dyb3VwfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2dyb3VwXCI7XG5pbXBvcnQge2FsbFNldHRsZWQsIHNsZWVwfSBmcm9tIFwiLi4vLi4vdXRpbHMvcHJvbWlzZVwiO1xuaW1wb3J0IFJpZ2h0UGFuZWxTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL1JpZ2h0UGFuZWxTdG9yZVwiO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gXCIuL0F1dG9IaWRlU2Nyb2xsYmFyXCI7XG5pbXBvcnQge21lZGlhRnJvbU14Y30gZnJvbSBcIi4uLy4uL2N1c3RvbWlzYXRpb25zL01lZGlhXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuY29uc3QgTE9OR19ERVNDX1BMQUNFSE9MREVSID0gX3RkKFxuICAgIGA8aDE+SFRNTCBmb3IgeW91ciBjb21tdW5pdHkncyBwYWdlPC9oMT5cbjxwPlxuICAgIFVzZSB0aGUgbG9uZyBkZXNjcmlwdGlvbiB0byBpbnRyb2R1Y2UgbmV3IG1lbWJlcnMgdG8gdGhlIGNvbW11bml0eSwgb3IgZGlzdHJpYnV0ZVxuICAgIHNvbWUgaW1wb3J0YW50IDxhIGhyZWY9XCJmb29cIj5saW5rczwvYT5cbjwvcD5cbjxwPlxuICAgIFlvdSBjYW4gZXZlbiBhZGQgaW1hZ2VzIHdpdGggTWF0cml4IFVSTHMgPGltZyBzcmM9XCJteGM6Ly91cmxcIiAvPlxuPC9wPlxuYCk7XG5cbmNvbnN0IFJvb21TdW1tYXJ5VHlwZSA9IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgcm9vbV9pZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHByb2ZpbGU6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGF2YXRhcl91cmw6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGNhbm9uaWNhbF9hbGlhczogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB9KS5pc1JlcXVpcmVkLFxufSk7XG5cbmNvbnN0IFVzZXJTdW1tYXJ5VHlwZSA9IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgc3VtbWFyeUluZm86IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgIHVzZXJfaWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgcm9sZV9pZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgYXZhdGFyX3VybDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgZGlzcGxheW5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgfSkuaXNSZXF1aXJlZCxcbn0pO1xuXG5jbGFzcyBDYXRlZ29yeVJvb21MaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICByb29tczogUHJvcFR5cGVzLmFycmF5T2YoUm9vbVN1bW1hcnlUeXBlKS5pc1JlcXVpcmVkLFxuICAgICAgICBjYXRlZ29yeTogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgICAgIHByb2ZpbGU6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgIH0pLmlzUmVxdWlyZWQsXG4gICAgICAgIH0pLFxuICAgICAgICBncm91cElkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cbiAgICAgICAgLy8gV2hldGhlciB0aGUgbGlzdCBzaG91bGQgYmUgZWRpdGFibGVcbiAgICAgICAgZWRpdGluZzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgb25BZGRSb29tc1RvU3VtbWFyeUNsaWNrZWQgPSAoZXYpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgQWRkcmVzc1BpY2tlckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkFkZHJlc3NQaWNrZXJEaWFsb2dcIik7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0FkZCBSb29tcyB0byBHcm91cCBTdW1tYXJ5JywgJycsIEFkZHJlc3NQaWNrZXJEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdCgnQWRkIHJvb21zIHRvIHRoZSBjb21tdW5pdHkgc3VtbWFyeScpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiV2hpY2ggcm9vbXMgd291bGQgeW91IGxpa2UgdG8gYWRkIHRvIHRoaXMgc3VtbWFyeT9cIiksXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogX3QoXCJSb29tIG5hbWUgb3IgYWRkcmVzc1wiKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJBZGQgdG8gc3VtbWFyeVwiKSxcbiAgICAgICAgICAgIHBpY2tlclR5cGU6ICdyb29tJyxcbiAgICAgICAgICAgIHZhbGlkQWRkcmVzc1R5cGVzOiBbJ214LXJvb20taWQnXSxcbiAgICAgICAgICAgIGdyb3VwSWQ6IHRoaXMucHJvcHMuZ3JvdXBJZCxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChzdWNjZXNzLCBhZGRycykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghc3VjY2VzcykgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIGFsbFNldHRsZWQoYWRkcnMubWFwKChhZGRyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBHcm91cFN0b3JlXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkUm9vbVRvR3JvdXBTdW1tYXJ5KHRoaXMucHJvcHMuZ3JvdXBJZCwgYWRkci5hZGRyZXNzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHsgZXJyb3JMaXN0LnB1c2goYWRkci5hZGRyZXNzKTsgfSk7XG4gICAgICAgICAgICAgICAgfSkpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3JMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkIHRvIGFkZCB0aGUgZm9sbG93aW5nIHJvb20gdG8gdGhlIGdyb3VwIHN1bW1hcnknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBFcnJvckRpYWxvZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIGFkZCB0aGUgZm9sbG93aW5nIHJvb21zIHRvIHRoZSBzdW1tYXJ5IG9mICUoZ3JvdXBJZClzOlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Z3JvdXBJZDogdGhpcy5wcm9wcy5ncm91cElkfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlcnJvckxpc3Quam9pbihcIiwgXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sIC8qY2xhc3NOYW1lPSovbnVsbCwgLyppc1ByaW9yaXR5PSovZmFsc2UsIC8qaXNTdGF0aWM9Ki90cnVlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBUaW50YWJsZVN2ZyA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5UaW50YWJsZVN2Z1wiKTtcbiAgICAgICAgY29uc3QgYWRkQnV0dG9uID0gdGhpcy5wcm9wcy5lZGl0aW5nID9cbiAgICAgICAgICAgICg8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ3NfYWRkQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQWRkUm9vbXNUb1N1bW1hcnlDbGlja2VkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxUaW50YWJsZVN2ZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi9yZXMvaW1nL2ljb25zLWNyZWF0ZS1yb29tLnN2Z1wiKX0gd2lkdGg9XCI2NFwiIGhlaWdodD1cIjY0XCIgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nc19hZGRCdXR0b25fbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnQWRkIGEgUm9vbScpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4pIDogPGRpdiAvPjtcblxuICAgICAgICBjb25zdCByb29tTm9kZXMgPSB0aGlzLnByb3BzLnJvb21zLm1hcCgocikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDxGZWF0dXJlZFJvb21cbiAgICAgICAgICAgICAgICBrZXk9e3Iucm9vbV9pZH1cbiAgICAgICAgICAgICAgICBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9XG4gICAgICAgICAgICAgICAgZWRpdGluZz17dGhpcy5wcm9wcy5lZGl0aW5nfVxuICAgICAgICAgICAgICAgIHN1bW1hcnlJbmZvPXtyfSAvPjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGNhdEhlYWRlciA9IDxkaXYgLz47XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNhdGVnb3J5ICYmIHRoaXMucHJvcHMuY2F0ZWdvcnkucHJvZmlsZSkge1xuICAgICAgICAgICAgY2F0SGVhZGVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ3NfY2F0ZWdvcnlcIj5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuY2F0ZWdvcnkucHJvZmlsZS5uYW1lIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ3NfY29udGFpbmVyXCI+XG4gICAgICAgICAgICB7IGNhdEhlYWRlciB9XG4gICAgICAgICAgICB7IHJvb21Ob2RlcyB9XG4gICAgICAgICAgICB7IGFkZEJ1dHRvbiB9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG5cbmNsYXNzIEZlYXR1cmVkUm9vbSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgc3VtbWFyeUluZm86IFJvb21TdW1tYXJ5VHlwZS5pc1JlcXVpcmVkLFxuICAgICAgICBlZGl0aW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgICAgICBncm91cElkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIG9uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICByb29tX2FsaWFzOiB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnByb2ZpbGUuY2Fub25pY2FsX2FsaWFzLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy5zdW1tYXJ5SW5mby5yb29tX2lkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25EZWxldGVDbGlja2VkID0gKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBHcm91cFN0b3JlLnJlbW92ZVJvb21Gcm9tR3JvdXBTdW1tYXJ5KFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5ncm91cElkLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5zdW1tYXJ5SW5mby5yb29tX2lkLFxuICAgICAgICApLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdoaWxzdCByZW1vdmluZyByb29tIGZyb20gZ3JvdXAgc3VtbWFyeScsIGVycik7XG4gICAgICAgICAgICBjb25zdCByb29tTmFtZSA9IHRoaXMucHJvcHMuc3VtbWFyeUluZm8ubmFtZSB8fFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc3VtbWFyeUluZm8uY2Fub25pY2FsX2FsaWFzIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zdW1tYXJ5SW5mby5yb29tX2lkO1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAgICAgJ0ZhaWxlZCB0byByZW1vdmUgcm9vbSBmcm9tIGdyb3VwIHN1bW1hcnknLFxuICAgICAgICAgICAgICAgICcnLCBFcnJvckRpYWxvZyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIHJlbW92ZSB0aGUgcm9vbSBmcm9tIHRoZSBzdW1tYXJ5IG9mICUoZ3JvdXBJZClzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7Z3JvdXBJZDogdGhpcy5wcm9wcy5ncm91cElkfSxcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiVGhlIHJvb20gJyUocm9vbU5hbWUpcycgY291bGQgbm90IGJlIHJlbW92ZWQgZnJvbSB0aGUgc3VtbWFyeS5cIiwge3Jvb21OYW1lfSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IFJvb21BdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXZhdGFycy5Sb29tQXZhdGFyXCIpO1xuXG4gICAgICAgIGNvbnN0IHJvb21OYW1lID0gdGhpcy5wcm9wcy5zdW1tYXJ5SW5mby5wcm9maWxlLm5hbWUgfHxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc3VtbWFyeUluZm8ucHJvZmlsZS5jYW5vbmljYWxfYWxpYXMgfHxcbiAgICAgICAgICAgIF90KFwiVW5uYW1lZCBSb29tXCIpO1xuXG4gICAgICAgIGNvbnN0IG9vYkRhdGEgPSB7XG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucHJvcHMuc3VtbWFyeUluZm8ucm9vbV9pZCxcbiAgICAgICAgICAgIGF2YXRhclVybDogdGhpcy5wcm9wcy5zdW1tYXJ5SW5mby5wcm9maWxlLmF2YXRhcl91cmwsXG4gICAgICAgICAgICBuYW1lOiByb29tTmFtZSxcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcGVybWFsaW5rID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc3VtbWFyeUluZm8ucHJvZmlsZSAmJiB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnByb2ZpbGUuY2Fub25pY2FsX2FsaWFzKSB7XG4gICAgICAgICAgICBwZXJtYWxpbmsgPSBtYWtlR3JvdXBQZXJtYWxpbmsodGhpcy5wcm9wcy5zdW1tYXJ5SW5mby5wcm9maWxlLmNhbm9uaWNhbF9hbGlhcyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcm9vbU5hbWVOb2RlID0gbnVsbDtcbiAgICAgICAgaWYgKHBlcm1hbGluaykge1xuICAgICAgICAgICAgcm9vbU5hbWVOb2RlID0gPGEgaHJlZj17cGVybWFsaW5rfSBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9ID57IHJvb21OYW1lIH08L2E+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm9vbU5hbWVOb2RlID0gPHNwYW4+eyByb29tTmFtZSB9PC9zcGFuPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlbGV0ZUJ1dHRvbiA9IHRoaXMucHJvcHMuZWRpdGluZyA/XG4gICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdfZGVsZXRlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi9yZXMvaW1nL2NhbmNlbC1zbWFsbC5zdmdcIil9XG4gICAgICAgICAgICAgICAgd2lkdGg9XCIxNFwiXG4gICAgICAgICAgICAgICAgaGVpZ2h0PVwiMTRcIlxuICAgICAgICAgICAgICAgIGFsdD1cIkRlbGV0ZVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkRlbGV0ZUNsaWNrZWR9IC8+XG4gICAgICAgICAgICA6IDxkaXYgLz47XG5cbiAgICAgICAgcmV0dXJuIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nXCIgb25DbGljaz17dGhpcy5vbkNsaWNrfT5cbiAgICAgICAgICAgIDxSb29tQXZhdGFyIG9vYkRhdGE9e29vYkRhdGF9IHdpZHRoPXs2NH0gaGVpZ2h0PXs2NH0gLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdfbmFtZVwiPnsgcm9vbU5hbWVOb2RlIH08L2Rpdj5cbiAgICAgICAgICAgIHsgZGVsZXRlQnV0dG9uIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICB9XG59XG5cbmNsYXNzIFJvbGVVc2VyTGlzdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgdXNlcnM6IFByb3BUeXBlcy5hcnJheU9mKFVzZXJTdW1tYXJ5VHlwZSkuaXNSZXF1aXJlZCxcbiAgICAgICAgcm9sZTogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgICAgIHByb2ZpbGU6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgIH0pLmlzUmVxdWlyZWQsXG4gICAgICAgIH0pLFxuICAgICAgICBncm91cElkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cbiAgICAgICAgLy8gV2hldGhlciB0aGUgbGlzdCBzaG91bGQgYmUgZWRpdGFibGVcbiAgICAgICAgZWRpdGluZzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgb25BZGRVc2Vyc0NsaWNrZWQgPSAoZXYpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgQWRkcmVzc1BpY2tlckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkFkZHJlc3NQaWNrZXJEaWFsb2dcIik7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0FkZCBVc2VycyB0byBHcm91cCBTdW1tYXJ5JywgJycsIEFkZHJlc3NQaWNrZXJEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdCgnQWRkIHVzZXJzIHRvIHRoZSBjb21tdW5pdHkgc3VtbWFyeScpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiV2hvIHdvdWxkIHlvdSBsaWtlIHRvIGFkZCB0byB0aGlzIHN1bW1hcnk/XCIpLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IF90KFwiTmFtZSBvciBNYXRyaXggSURcIiksXG4gICAgICAgICAgICBidXR0b246IF90KFwiQWRkIHRvIHN1bW1hcnlcIiksXG4gICAgICAgICAgICB2YWxpZEFkZHJlc3NUeXBlczogWydteC11c2VyLWlkJ10sXG4gICAgICAgICAgICBncm91cElkOiB0aGlzLnByb3BzLmdyb3VwSWQsXG4gICAgICAgICAgICBzaG91bGRPbWl0U2VsZjogZmFsc2UsXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAoc3VjY2VzcywgYWRkcnMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvckxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICBhbGxTZXR0bGVkKGFkZHJzLm1hcCgoYWRkcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gR3JvdXBTdG9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZFVzZXJUb0dyb3VwU3VtbWFyeShhZGRyLmFkZHJlc3MpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4geyBlcnJvckxpc3QucHVzaChhZGRyLmFkZHJlc3MpOyB9KTtcbiAgICAgICAgICAgICAgICB9KSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvckxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gYWRkIHRoZSBmb2xsb3dpbmcgdXNlcnMgdG8gdGhlIGNvbW11bml0eSBzdW1tYXJ5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICcnLCBFcnJvckRpYWxvZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIGFkZCB0aGUgZm9sbG93aW5nIHVzZXJzIHRvIHRoZSBzdW1tYXJ5IG9mICUoZ3JvdXBJZClzOlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Z3JvdXBJZDogdGhpcy5wcm9wcy5ncm91cElkfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlcnJvckxpc3Quam9pbihcIiwgXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sIC8qY2xhc3NOYW1lPSovbnVsbCwgLyppc1ByaW9yaXR5PSovZmFsc2UsIC8qaXNTdGF0aWM9Ki90cnVlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBUaW50YWJsZVN2ZyA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5UaW50YWJsZVN2Z1wiKTtcbiAgICAgICAgY29uc3QgYWRkQnV0dG9uID0gdGhpcy5wcm9wcy5lZGl0aW5nID9cbiAgICAgICAgICAgICg8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ3NfYWRkQnV0dG9uXCIgb25DbGljaz17dGhpcy5vbkFkZFVzZXJzQ2xpY2tlZH0+XG4gICAgICAgICAgICAgICAgPFRpbnRhYmxlU3ZnIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uL3Jlcy9pbWcvaWNvbnMtY3JlYXRlLXJvb20uc3ZnXCIpfSB3aWR0aD1cIjY0XCIgaGVpZ2h0PVwiNjRcIiAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2FkZEJ1dHRvbl9sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdBZGQgYSBVc2VyJykgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPikgOiA8ZGl2IC8+O1xuICAgICAgICBjb25zdCB1c2VyTm9kZXMgPSB0aGlzLnByb3BzLnVzZXJzLm1hcCgodSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDxGZWF0dXJlZFVzZXJcbiAgICAgICAgICAgICAgICBrZXk9e3UudXNlcl9pZH1cbiAgICAgICAgICAgICAgICBzdW1tYXJ5SW5mbz17dX1cbiAgICAgICAgICAgICAgICBlZGl0aW5nPXt0aGlzLnByb3BzLmVkaXRpbmd9XG4gICAgICAgICAgICAgICAgZ3JvdXBJZD17dGhpcy5wcm9wcy5ncm91cElkfSAvPjtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCByb2xlSGVhZGVyID0gPGRpdiAvPjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucm9sZSAmJiB0aGlzLnByb3BzLnJvbGUucHJvZmlsZSkge1xuICAgICAgICAgICAgcm9sZUhlYWRlciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2NhdGVnb3J5XCI+eyB0aGlzLnByb3BzLnJvbGUucHJvZmlsZS5uYW1lIH08L2Rpdj47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgeyByb2xlSGVhZGVyIH1cbiAgICAgICAgICAgIHsgdXNlck5vZGVzIH1cbiAgICAgICAgICAgIHsgYWRkQnV0dG9uIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuY2xhc3MgRmVhdHVyZWRVc2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBzdW1tYXJ5SW5mbzogVXNlclN1bW1hcnlUeXBlLmlzUmVxdWlyZWQsXG4gICAgICAgIGVkaXRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgb25DbGljayA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19zdGFydF9jaGF0X29yX3JldXNlJyxcbiAgICAgICAgICAgIHVzZXJfaWQ6IHRoaXMucHJvcHMuc3VtbWFyeUluZm8udXNlcl9pZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uRGVsZXRlQ2xpY2tlZCA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgR3JvdXBTdG9yZS5yZW1vdmVVc2VyRnJvbUdyb3VwU3VtbWFyeShcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZ3JvdXBJZCxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc3VtbWFyeUluZm8udXNlcl9pZCxcbiAgICAgICAgKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB3aGlsc3QgcmVtb3ZpbmcgdXNlciBmcm9tIGdyb3VwIHN1bW1hcnknLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLmRpc3BsYXluYW1lIHx8IHRoaXMucHJvcHMuc3VtbWFyeUluZm8udXNlcl9pZDtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gcmVtb3ZlIHVzZXIgZnJvbSBjb21tdW5pdHkgc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgRXJyb3JEaWFsb2csXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byByZW1vdmUgYSB1c2VyIGZyb20gdGhlIHN1bW1hcnkgb2YgJShncm91cElkKXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtncm91cElkOiB0aGlzLnByb3BzLmdyb3VwSWR9LFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJUaGUgdXNlciAnJShkaXNwbGF5TmFtZSlzJyBjb3VsZCBub3QgYmUgcmVtb3ZlZCBmcm9tIHRoZSBzdW1tYXJ5LlwiLCB7ZGlzcGxheU5hbWV9KSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoXCJhdmF0YXJzLkJhc2VBdmF0YXJcIik7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLmRpc3BsYXluYW1lIHx8IHRoaXMucHJvcHMuc3VtbWFyeUluZm8udXNlcl9pZDtcblxuICAgICAgICBjb25zdCBwZXJtYWxpbmsgPSBtYWtlVXNlclBlcm1hbGluayh0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnVzZXJfaWQpO1xuICAgICAgICBjb25zdCB1c2VyTmFtZU5vZGUgPSA8YSBocmVmPXtwZXJtYWxpbmt9IG9uQ2xpY2s9e3RoaXMub25DbGlja30+eyBuYW1lIH08L2E+O1xuICAgICAgICBjb25zdCBodHRwVXJsID0gbWVkaWFGcm9tTXhjKHRoaXMucHJvcHMuc3VtbWFyeUluZm8uYXZhdGFyX3VybCkuZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCg2NCk7XG5cbiAgICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gdGhpcy5wcm9wcy5lZGl0aW5nID9cbiAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ19kZWxldGVCdXR0b25cIlxuICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uL3Jlcy9pbWcvY2FuY2VsLXNtYWxsLnN2Z1wiKX1cbiAgICAgICAgICAgICAgICB3aWR0aD1cIjE0XCJcbiAgICAgICAgICAgICAgICBoZWlnaHQ9XCIxNFwiXG4gICAgICAgICAgICAgICAgYWx0PVwiRGVsZXRlXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRGVsZXRlQ2xpY2tlZH0gLz5cbiAgICAgICAgICAgIDogPGRpdiAvPjtcblxuICAgICAgICByZXR1cm4gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdcIiBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PlxuICAgICAgICAgICAgPEJhc2VBdmF0YXIgbmFtZT17bmFtZX0gdXJsPXtodHRwVXJsfSB3aWR0aD17NjR9IGhlaWdodD17NjR9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nX25hbWVcIj57IHVzZXJOYW1lTm9kZSB9PC9kaXY+XG4gICAgICAgICAgICB7IGRlbGV0ZUJ1dHRvbiB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgfVxufVxuXG5jb25zdCBHUk9VUF9KT0lOUE9MSUNZX09QRU4gPSBcIm9wZW5cIjtcbmNvbnN0IEdST1VQX0pPSU5QT0xJQ1lfSU5WSVRFID0gXCJpbnZpdGVcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwic3RydWN0dXJlcy5Hcm91cFZpZXdcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgZ3JvdXBJZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICAvLyBXaGV0aGVyIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgdGhlIGdyb3VwIGFkbWluIGlzIHZpZXdpbmcgdGhlIGdyb3VwXG4gICAgICAgIGdyb3VwSXNOZXc6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgc3VtbWFyeTogbnVsbCxcbiAgICAgICAgaXNHcm91cFB1YmxpY2lzZWQ6IG51bGwsXG4gICAgICAgIGlzVXNlclByaXZpbGVnZWQ6IG51bGwsXG4gICAgICAgIGdyb3VwUm9vbXM6IG51bGwsXG4gICAgICAgIGdyb3VwUm9vbXNMb2FkaW5nOiBudWxsLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgZWRpdGluZzogZmFsc2UsXG4gICAgICAgIHNhdmluZzogZmFsc2UsXG4gICAgICAgIHVwbG9hZGluZ0F2YXRhcjogZmFsc2UsXG4gICAgICAgIGF2YXRhckNoYW5nZWQ6IGZhbHNlLFxuICAgICAgICBtZW1iZXJzaGlwQnVzeTogZmFsc2UsXG4gICAgICAgIHB1YmxpY2l0eUJ1c3k6IGZhbHNlLFxuICAgICAgICBpbnZpdGVyUHJvZmlsZTogbnVsbCxcbiAgICAgICAgc2hvd1JpZ2h0UGFuZWw6IFJpZ2h0UGFuZWxTdG9yZS5nZXRTaGFyZWRJbnN0YW5jZSgpLmlzT3BlbkZvckdyb3VwLFxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5fdW5tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50Lm9uKFwiR3JvdXAubXlNZW1iZXJzaGlwXCIsIHRoaXMuX29uR3JvdXBNeU1lbWJlcnNoaXApO1xuXG4gICAgICAgIHRoaXMuX2luaXRHcm91cFN0b3JlKHRoaXMucHJvcHMuZ3JvdXBJZCwgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5fZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLl9vbkFjdGlvbik7XG4gICAgICAgIHRoaXMuX3JpZ2h0UGFuZWxTdG9yZVRva2VuID0gUmlnaHRQYW5lbFN0b3JlLmdldFNoYXJlZEluc3RhbmNlKCkuYWRkTGlzdGVuZXIodGhpcy5fb25SaWdodFBhbmVsU3RvcmVVcGRhdGUpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJHcm91cC5teU1lbWJlcnNoaXBcIiwgdGhpcy5fb25Hcm91cE15TWVtYmVyc2hpcCk7XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuX2Rpc3BhdGNoZXJSZWYpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBSaWdodFBhbmVsU3RvcmUgbGlzdGVuZXJcbiAgICAgICAgaWYgKHRoaXMuX3JpZ2h0UGFuZWxTdG9yZVRva2VuKSB7XG4gICAgICAgICAgICB0aGlzLl9yaWdodFBhbmVsU3RvcmVUb2tlbi5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmdyb3VwSWQgIT09IG5ld1Byb3BzLmdyb3VwSWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHN1bW1hcnk6IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdEdyb3VwU3RvcmUobmV3UHJvcHMuZ3JvdXBJZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaG93UmlnaHRQYW5lbDogUmlnaHRQYW5lbFN0b3JlLmdldFNoYXJlZEluc3RhbmNlKCkuaXNPcGVuRm9yR3JvdXAsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25Hcm91cE15TWVtYmVyc2hpcCA9IChncm91cCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkIHx8IGdyb3VwLmdyb3VwSWQgIT09IHRoaXMucHJvcHMuZ3JvdXBJZCkgcmV0dXJuO1xuICAgICAgICBpZiAoZ3JvdXAubXlNZW1iZXJzaGlwID09PSAnbGVhdmUnKSB7XG4gICAgICAgICAgICAvLyBMZWF2ZSBzZXR0aW5ncyAtIHRoZSB1c2VyIG1pZ2h0IGhhdmUgY2xpY2tlZCB0aGUgXCJMZWF2ZVwiIGJ1dHRvblxuICAgICAgICAgICAgdGhpcy5fY2xvc2VTZXR0aW5ncygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21lbWJlcnNoaXBCdXN5OiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICBfaW5pdEdyb3VwU3RvcmUoZ3JvdXBJZCwgZmlyc3RJbml0KSB7XG4gICAgICAgIGNvbnN0IGdyb3VwID0gdGhpcy5fbWF0cml4Q2xpZW50LmdldEdyb3VwKGdyb3VwSWQpO1xuICAgICAgICBpZiAoZ3JvdXAgJiYgZ3JvdXAuaW52aXRlciAmJiBncm91cC5pbnZpdGVyLnVzZXJJZCkge1xuICAgICAgICAgICAgdGhpcy5fZmV0Y2hJbnZpdGVyUHJvZmlsZShncm91cC5pbnZpdGVyLnVzZXJJZCk7XG4gICAgICAgIH1cbiAgICAgICAgR3JvdXBTdG9yZS5yZWdpc3Rlckxpc3RlbmVyKGdyb3VwSWQsIHRoaXMub25Hcm91cFN0b3JlVXBkYXRlZC5iaW5kKHRoaXMsIGZpcnN0SW5pdCkpO1xuICAgICAgICBsZXQgd2lsbERvT25ib2FyZGluZyA9IGZhbHNlO1xuICAgICAgICAvLyBYWFg6IFRoaXMgc2hvdWxkIGJlIG1vcmUgZmx1eHkgLSBsZXQncyBnZXQgdGhlIGVycm9yIGZyb20gR3JvdXBTdG9yZSAuZ2V0RXJyb3Igb3Igc29tZXRoaW5nXG4gICAgICAgIEdyb3VwU3RvcmUub24oJ2Vycm9yJywgKGVyciwgZXJyb3JHcm91cElkLCBzdGF0ZUtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCB8fCBncm91cElkICE9PSBlcnJvckdyb3VwSWQpIHJldHVybjtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gJ01fR1VFU1RfQUNDRVNTX0ZPUkJJRERFTicgJiYgIXdpbGxEb09uYm9hcmRpbmcpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdkb19hZnRlcl9zeW5jX3ByZXBhcmVkJyxcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRfYWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X2dyb3VwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwX2lkOiBncm91cElkLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nLCBzY3JlZW5fYWZ0ZXI6IHtzY3JlZW46IGBncm91cC8ke2dyb3VwSWR9YH19KTtcbiAgICAgICAgICAgICAgICB3aWxsRG9PbmJvYXJkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGF0ZUtleSA9PT0gR3JvdXBTdG9yZS5TVEFURV9LRVkuU3VtbWFyeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLFxuICAgICAgICAgICAgICAgICAgICBlZGl0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Hcm91cFN0b3JlVXBkYXRlZCA9IChmaXJzdEluaXQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBzdW1tYXJ5ID0gR3JvdXBTdG9yZS5nZXRTdW1tYXJ5KHRoaXMucHJvcHMuZ3JvdXBJZCk7XG4gICAgICAgIGlmIChzdW1tYXJ5LnByb2ZpbGUpIHtcbiAgICAgICAgICAgIC8vIERlZmF1bHQgcHJvZmlsZSBmaWVsZHMgc2hvdWxkIGJlIFwiXCIgZm9yIGxhdGVyIHNlbmRpbmcgdG8gdGhlIHNlcnZlciAod2hpY2hcbiAgICAgICAgICAgIC8vIHJlcXVpcmVzIHRoYXQgdGhlIGZpZWxkcyBhcmUgc3RyaW5ncywgbm90IG51bGwpXG4gICAgICAgICAgICBbXCJhdmF0YXJfdXJsXCIsIFwibG9uZ19kZXNjcmlwdGlvblwiLCBcIm5hbWVcIiwgXCJzaG9ydF9kZXNjcmlwdGlvblwiXS5mb3JFYWNoKChrKSA9PiB7XG4gICAgICAgICAgICAgICAgc3VtbWFyeS5wcm9maWxlW2tdID0gc3VtbWFyeS5wcm9maWxlW2tdIHx8IFwiXCI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHN1bW1hcnksXG4gICAgICAgICAgICBzdW1tYXJ5TG9hZGluZzogIUdyb3VwU3RvcmUuaXNTdGF0ZVJlYWR5KHRoaXMucHJvcHMuZ3JvdXBJZCwgR3JvdXBTdG9yZS5TVEFURV9LRVkuU3VtbWFyeSksXG4gICAgICAgICAgICBpc0dyb3VwUHVibGljaXNlZDogR3JvdXBTdG9yZS5nZXRHcm91cFB1YmxpY2l0eSh0aGlzLnByb3BzLmdyb3VwSWQpLFxuICAgICAgICAgICAgaXNVc2VyUHJpdmlsZWdlZDogR3JvdXBTdG9yZS5pc1VzZXJQcml2aWxlZ2VkKHRoaXMucHJvcHMuZ3JvdXBJZCksXG4gICAgICAgICAgICBncm91cFJvb21zOiBHcm91cFN0b3JlLmdldEdyb3VwUm9vbXModGhpcy5wcm9wcy5ncm91cElkKSxcbiAgICAgICAgICAgIGdyb3VwUm9vbXNMb2FkaW5nOiAhR3JvdXBTdG9yZS5pc1N0YXRlUmVhZHkodGhpcy5wcm9wcy5ncm91cElkLCBHcm91cFN0b3JlLlNUQVRFX0tFWS5Hcm91cFJvb21zKSxcbiAgICAgICAgICAgIGlzVXNlck1lbWJlcjogR3JvdXBTdG9yZS5nZXRHcm91cE1lbWJlcnModGhpcy5wcm9wcy5ncm91cElkKS5zb21lKFxuICAgICAgICAgICAgICAgIChtKSA9PiBtLnVzZXJJZCA9PT0gdGhpcy5fbWF0cml4Q2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZCxcbiAgICAgICAgICAgICksXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBYWFg6IFRoaXMgbWlnaHQgbm90IHdvcmsgYnV0IHRoaXMucHJvcHMuZ3JvdXBJc05ldyB1bnVzZWQgYW55d2F5XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmdyb3VwSXNOZXcgJiYgZmlyc3RJbml0KSB7XG4gICAgICAgICAgICB0aGlzLl9vbkVkaXRDbGljaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9mZXRjaEludml0ZXJQcm9maWxlKHVzZXJJZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGludml0ZXJQcm9maWxlQnVzeTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5nZXRQcm9maWxlSW5mbyh1c2VySWQpLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGludml0ZXJQcm9maWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogcmVzcC5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogcmVzcC5kaXNwbGF5bmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGdyb3VwIGludml0ZXIgcHJvZmlsZScsIGUpO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGludml0ZXJQcm9maWxlQnVzeTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uRWRpdENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVkaXRpbmc6IHRydWUsXG4gICAgICAgICAgICBwcm9maWxlRm9ybTogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdGF0ZS5zdW1tYXJ5LnByb2ZpbGUpLFxuICAgICAgICAgICAgam9pbmFibGVGb3JtOiB7XG4gICAgICAgICAgICAgICAgcG9saWN5VHlwZTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5zdW1tYXJ5LnByb2ZpbGUuaXNfb3Blbmx5X2pvaW5hYmxlID9cbiAgICAgICAgICAgICAgICAgICAgICAgIEdST1VQX0pPSU5QT0xJQ1lfT1BFTiA6XG4gICAgICAgICAgICAgICAgICAgICAgICBHUk9VUF9KT0lOUE9MSUNZX0lOVklURSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25TaGFyZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBTaGFyZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlNoYXJlRGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdzaGFyZSBjb21tdW5pdHkgZGlhbG9nJywgJycsIFNoYXJlRGlhbG9nLCB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMuX21hdHJpeENsaWVudC5nZXRHcm91cCh0aGlzLnByb3BzLmdyb3VwSWQpIHx8IG5ldyBHcm91cCh0aGlzLnByb3BzLmdyb3VwSWQpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQ2FuY2VsQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2Nsb3NlU2V0dGluZ3MoKTtcbiAgICB9O1xuXG4gICAgX29uQWN0aW9uID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgLy8gTk9URTogY2xvc2Vfc2V0dGluZ3MgaXMgYW4gYXBwLXdpZGUgZGlzcGF0Y2g7IGFzIGl0IGlzIGRpc3BhdGNoZWQgZnJvbSBNYXRyaXhDaGF0XG4gICAgICAgICAgICBjYXNlICdjbG9zZV9zZXR0aW5ncyc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlRm9ybTogbnVsbCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX2Nsb3NlU2V0dGluZ3MgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnY2xvc2Vfc2V0dGluZ3MnfSk7XG4gICAgfTtcblxuICAgIF9vbk5hbWVDaGFuZ2UgPSAodmFsdWUpID0+IHtcbiAgICAgICAgY29uc3QgbmV3UHJvZmlsZUZvcm0gPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUucHJvZmlsZUZvcm0sIHsgbmFtZTogdmFsdWUgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHJvZmlsZUZvcm06IG5ld1Byb2ZpbGVGb3JtLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uU2hvcnREZXNjQ2hhbmdlID0gKHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1Byb2ZpbGVGb3JtID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLnByb2ZpbGVGb3JtLCB7IHNob3J0X2Rlc2NyaXB0aW9uOiB2YWx1ZSB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcm9maWxlRm9ybTogbmV3UHJvZmlsZUZvcm0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25Mb25nRGVzY0NoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1Byb2ZpbGVGb3JtID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLnByb2ZpbGVGb3JtLCB7IGxvbmdfZGVzY3JpcHRpb246IGUudGFyZ2V0LnZhbHVlIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByb2ZpbGVGb3JtOiBuZXdQcm9maWxlRm9ybSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkF2YXRhclNlbGVjdGVkID0gZXYgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gZXYudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICBpZiAoIWZpbGUpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHt1cGxvYWRpbmdBdmF0YXI6IHRydWV9KTtcbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50LnVwbG9hZENvbnRlbnQoZmlsZSkudGhlbigodXJsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdQcm9maWxlRm9ybSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5wcm9maWxlRm9ybSwgeyBhdmF0YXJfdXJsOiB1cmwgfSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cGxvYWRpbmdBdmF0YXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2ZpbGVGb3JtOiBuZXdQcm9maWxlRm9ybSxcblxuICAgICAgICAgICAgICAgIC8vIEluZGljYXRlIHRoYXQgRmxhaXJTdG9yZSBuZWVkcyB0byBiZSBwb2tlZCB0byBzaG93IHRoaXMgY2hhbmdlXG4gICAgICAgICAgICAgICAgLy8gaW4gVGFnVGlsZSAoR3JvdXBGaWx0ZXJQYW5lbCksIEZsYWlyIGFuZCBHcm91cFRpbGUgKE15R3JvdXBzKS5cbiAgICAgICAgICAgICAgICBhdmF0YXJDaGFuZ2VkOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt1cGxvYWRpbmdBdmF0YXI6IGZhbHNlfSk7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byB1cGxvYWQgYXZhdGFyIGltYWdlXCIsIGUpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHVwbG9hZCBpbWFnZScsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3InKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ0ZhaWxlZCB0byB1cGxvYWQgaW1hZ2UnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uSm9pbmFibGVDaGFuZ2UgPSBldiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgam9pbmFibGVGb3JtOiB7IHBvbGljeVR5cGU6IGV2LnRhcmdldC52YWx1ZSB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uU2F2ZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzYXZpbmc6IHRydWV9KTtcbiAgICAgICAgY29uc3Qgc2F2ZVByb21pc2UgPSB0aGlzLnN0YXRlLmlzVXNlclByaXZpbGVnZWQgPyB0aGlzLl9zYXZlR3JvdXAoKSA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICBzYXZlUHJvbWlzZS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNhdmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZWRpdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5faW5pdEdyb3VwU3RvcmUodGhpcy5wcm9wcy5ncm91cElkKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXZhdGFyQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIC8vIFhYWDogRXZpbCAtIHBva2luZyBhIHN0b3JlIHNob3VsZCBiZSBkb25lIGZyb20gYW4gYXN5bmMgYWN0aW9uXG4gICAgICAgICAgICAgICAgRmxhaXJTdG9yZS5yZWZyZXNoR3JvdXBQcm9maWxlKHRoaXMuX21hdHJpeENsaWVudCwgdGhpcy5wcm9wcy5ncm91cElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNhdmluZzogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNhdmUgY29tbXVuaXR5IHByb2ZpbGVcIiwgZSk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gdXBkYXRlIGdyb3VwJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdFcnJvcicpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnRmFpbGVkIHRvIHVwZGF0ZSBjb21tdW5pdHknKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGF2YXRhckNoYW5nZWQ6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYyBfc2F2ZUdyb3VwKCkge1xuICAgICAgICBhd2FpdCB0aGlzLl9tYXRyaXhDbGllbnQuc2V0R3JvdXBQcm9maWxlKHRoaXMucHJvcHMuZ3JvdXBJZCwgdGhpcy5zdGF0ZS5wcm9maWxlRm9ybSk7XG4gICAgICAgIGF3YWl0IHRoaXMuX21hdHJpeENsaWVudC5zZXRHcm91cEpvaW5Qb2xpY3kodGhpcy5wcm9wcy5ncm91cElkLCB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnN0YXRlLmpvaW5hYmxlRm9ybS5wb2xpY3lUeXBlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfb25BY2NlcHRJbnZpdGVDbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVtYmVyc2hpcEJ1c3k6IHRydWV9KTtcblxuICAgICAgICAvLyBXYWl0IDUwMG1zIHRvIHByZXZlbnQgZmxhc2hpbmcuIERvIHRoaXMgYmVmb3JlIHNlbmRpbmcgYSByZXF1ZXN0IG90aGVyd2lzZSB3ZSByaXNrIHRoZVxuICAgICAgICAvLyBzcGlubmVyIGRpc2FwcGVhcmluZyBhZnRlciB3ZSBoYXZlIGZldGNoZWQgbmV3IGdyb3VwIGRhdGEuXG4gICAgICAgIGF3YWl0IHNsZWVwKDUwMCk7XG5cbiAgICAgICAgR3JvdXBTdG9yZS5hY2NlcHRHcm91cEludml0ZSh0aGlzLnByb3BzLmdyb3VwSWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gZG9uJ3QgcmVzZXQgbWVtYmVyc2hpcEJ1c3kgaGVyZTogd2FpdCBmb3IgdGhlIG1lbWJlcnNoaXAgY2hhbmdlIHRvIGNvbWUgZG93biB0aGUgc3luY1xuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVtYmVyc2hpcEJ1c3k6IGZhbHNlfSk7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRXJyb3IgYWNjZXB0aW5nIGludml0ZScsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlVuYWJsZSB0byBhY2NlcHQgaW52aXRlXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25SZWplY3RJbnZpdGVDbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVtYmVyc2hpcEJ1c3k6IHRydWV9KTtcblxuICAgICAgICAvLyBXYWl0IDUwMG1zIHRvIHByZXZlbnQgZmxhc2hpbmcuIERvIHRoaXMgYmVmb3JlIHNlbmRpbmcgYSByZXF1ZXN0IG90aGVyd2lzZSB3ZSByaXNrIHRoZVxuICAgICAgICAvLyBzcGlubmVyIGRpc2FwcGVhcmluZyBhZnRlciB3ZSBoYXZlIGZldGNoZWQgbmV3IGdyb3VwIGRhdGEuXG4gICAgICAgIGF3YWl0IHNsZWVwKDUwMCk7XG5cbiAgICAgICAgR3JvdXBTdG9yZS5sZWF2ZUdyb3VwKHRoaXMucHJvcHMuZ3JvdXBJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBkb24ndCByZXNldCBtZW1iZXJzaGlwQnVzeSBoZXJlOiB3YWl0IGZvciB0aGUgbWVtYmVyc2hpcCBjaGFuZ2UgdG8gY29tZSBkb3duIHRoZSBzeW5jXG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZW1iZXJzaGlwQnVzeTogZmFsc2V9KTtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdFcnJvciByZWplY3RpbmcgaW52aXRlJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRXJyb3JcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiVW5hYmxlIHRvIHJlamVjdCBpbnZpdGVcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkpvaW5DbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX21hdHJpeENsaWVudC5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nLCBzY3JlZW5fYWZ0ZXI6IHtzY3JlZW46IGBncm91cC8ke3RoaXMucHJvcHMuZ3JvdXBJZH1gfX0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVtYmVyc2hpcEJ1c3k6IHRydWV9KTtcblxuICAgICAgICAvLyBXYWl0IDUwMG1zIHRvIHByZXZlbnQgZmxhc2hpbmcuIERvIHRoaXMgYmVmb3JlIHNlbmRpbmcgYSByZXF1ZXN0IG90aGVyd2lzZSB3ZSByaXNrIHRoZVxuICAgICAgICAvLyBzcGlubmVyIGRpc2FwcGVhcmluZyBhZnRlciB3ZSBoYXZlIGZldGNoZWQgbmV3IGdyb3VwIGRhdGEuXG4gICAgICAgIGF3YWl0IHNsZWVwKDUwMCk7XG5cbiAgICAgICAgR3JvdXBTdG9yZS5qb2luR3JvdXAodGhpcy5wcm9wcy5ncm91cElkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIGRvbid0IHJlc2V0IG1lbWJlcnNoaXBCdXN5IGhlcmU6IHdhaXQgZm9yIHRoZSBtZW1iZXJzaGlwIGNoYW5nZSB0byBjb21lIGRvd24gdGhlIHN5bmNcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe21lbWJlcnNoaXBCdXN5OiBmYWxzZX0pO1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0Vycm9yIGpvaW5pbmcgcm9vbScsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlVuYWJsZSB0byBqb2luIGNvbW11bml0eVwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX2xlYXZlR3JvdXBXYXJuaW5ncygpIHtcbiAgICAgICAgY29uc3Qgd2FybmluZ3MgPSBbXTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc1VzZXJQcml2aWxlZ2VkKSB7XG4gICAgICAgICAgICB3YXJuaW5ncy5wdXNoKChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3YXJuaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgXCIgXCIgLyogV2hpdGVzcGFjZSwgb3RoZXJ3aXNlIHRoZSBzZW50ZW5jZXMgZ2V0IHNtYXNoZWQgdG9nZXRoZXIgKi8gfVxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiWW91IGFyZSBhbiBhZG1pbmlzdHJhdG9yIG9mIHRoaXMgY29tbXVuaXR5LiBZb3Ugd2lsbCBub3QgYmUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWJsZSB0byByZWpvaW4gd2l0aG91dCBhbiBpbnZpdGUgZnJvbSBhbm90aGVyIGFkbWluaXN0cmF0b3IuXCIpIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3YXJuaW5ncztcbiAgICB9XG5cbiAgICBfb25MZWF2ZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCB3YXJuaW5ncyA9IHRoaXMuX2xlYXZlR3JvdXBXYXJuaW5ncygpO1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0xlYXZlIEdyb3VwJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJMZWF2ZSBDb21tdW5pdHlcIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogKFxuICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiTGVhdmUgJShncm91cE5hbWUpcz9cIiwge2dyb3VwTmFtZTogdGhpcy5wcm9wcy5ncm91cElkfSkgfVxuICAgICAgICAgICAgICAgICAgICB7IHdhcm5pbmdzIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIkxlYXZlXCIpLFxuICAgICAgICAgICAgZGFuZ2VyOiB0aGlzLnN0YXRlLmlzVXNlclByaXZpbGVnZWQsXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiBhc3luYyAoY29uZmlybWVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe21lbWJlcnNoaXBCdXN5OiB0cnVlfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBXYWl0IDUwMG1zIHRvIHByZXZlbnQgZmxhc2hpbmcuIERvIHRoaXMgYmVmb3JlIHNlbmRpbmcgYSByZXF1ZXN0IG90aGVyd2lzZSB3ZSByaXNrIHRoZVxuICAgICAgICAgICAgICAgIC8vIHNwaW5uZXIgZGlzYXBwZWFyaW5nIGFmdGVyIHdlIGhhdmUgZmV0Y2hlZCBuZXcgZ3JvdXAgZGF0YS5cbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcCg1MDApO1xuXG4gICAgICAgICAgICAgICAgR3JvdXBTdG9yZS5sZWF2ZUdyb3VwKHRoaXMucHJvcHMuZ3JvdXBJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGRvbid0IHJlc2V0IG1lbWJlcnNoaXBCdXN5IGhlcmU6IHdhaXQgZm9yIHRoZSBtZW1iZXJzaGlwIGNoYW5nZSB0byBjb21lIGRvd24gdGhlIHN5bmNcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZW1iZXJzaGlwQnVzeTogZmFsc2V9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRXJyb3IgbGVhdmluZyBjb21tdW5pdHknLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiVW5hYmxlIHRvIGxlYXZlIGNvbW11bml0eVwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQWRkUm9vbXNDbGljayA9ICgpID0+IHtcbiAgICAgICAgc2hvd0dyb3VwQWRkUm9vbURpYWxvZyh0aGlzLnByb3BzLmdyb3VwSWQpO1xuICAgIH07XG5cbiAgICBfZ2V0R3JvdXBTZWN0aW9uKCkge1xuICAgICAgICBjb25zdCBncm91cFNldHRpbmdzU2VjdGlvbkNsYXNzZXMgPSBjbGFzc25hbWVzKHtcbiAgICAgICAgICAgIFwibXhfR3JvdXBWaWV3X2dyb3VwXCI6IHRoaXMuc3RhdGUuZWRpdGluZyxcbiAgICAgICAgICAgIFwibXhfR3JvdXBWaWV3X2dyb3VwX2Rpc2FibGVkXCI6IHRoaXMuc3RhdGUuZWRpdGluZyAmJiAhdGhpcy5zdGF0ZS5pc1VzZXJQcml2aWxlZ2VkLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBoZWFkZXIgPSB0aGlzLnN0YXRlLmVkaXRpbmcgPyA8aDI+IHsgX3QoJ0NvbW11bml0eSBTZXR0aW5ncycpIH0gPC9oMj4gOiA8ZGl2IC8+O1xuXG4gICAgICAgIGNvbnN0IGhvc3RpbmdTaWdudXBMaW5rID0gZ2V0SG9zdGluZ0xpbmsoJ2NvbW11bml0eS1zZXR0aW5ncycpO1xuICAgICAgICBsZXQgaG9zdGluZ1NpZ251cCA9IG51bGw7XG4gICAgICAgIGlmIChob3N0aW5nU2lnbnVwTGluayAmJiB0aGlzLnN0YXRlLmlzVXNlclByaXZpbGVnZWQpIHtcbiAgICAgICAgICAgIGhvc3RpbmdTaWdudXAgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19ob3N0aW5nU2lnbnVwXCI+XG4gICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICBcIldhbnQgbW9yZSB0aGFuIGEgY29tbXVuaXR5PyA8YT5HZXQgeW91ciBvd24gc2VydmVyPC9hPlwiLCB7fSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IDxhIGhyZWY9e2hvc3RpbmdTaWdudXBMaW5rfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPGEgaHJlZj17aG9zdGluZ1NpZ251cExpbmt9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi9yZXMvaW1nL2V4dGVybmFsLWxpbmsuc3ZnXCIpfSB3aWR0aD1cIjExXCIgaGVpZ2h0PVwiMTBcIiBhbHQ9JycgLz5cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGFuZ2VEZWxheVdhcm5pbmcgPSB0aGlzLnN0YXRlLmVkaXRpbmcgJiYgdGhpcy5zdGF0ZS5pc1VzZXJQcml2aWxlZ2VkID9cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2NoYW5nZURlbGF5V2FybmluZ1wiPlxuICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICdDaGFuZ2VzIG1hZGUgdG8geW91ciBjb21tdW5pdHkgPGJvbGQxPm5hbWU8L2JvbGQxPiBhbmQgPGJvbGQyPmF2YXRhcjwvYm9sZDI+ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbWlnaHQgbm90IGJlIHNlZW4gYnkgb3RoZXIgdXNlcnMgZm9yIHVwIHRvIDMwIG1pbnV0ZXMuJyxcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdib2xkMSc6IChzdWIpID0+IDxiPiB7IHN1YiB9IDwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAnYm9sZDInOiAoc3ViKSA9PiA8Yj4geyBzdWIgfSA8L2I+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9kaXY+IDogPGRpdiAvPjtcbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtncm91cFNldHRpbmdzU2VjdGlvbkNsYXNzZXN9PlxuICAgICAgICAgICAgeyBoZWFkZXIgfVxuICAgICAgICAgICAgeyBob3N0aW5nU2lnbnVwIH1cbiAgICAgICAgICAgIHsgY2hhbmdlRGVsYXlXYXJuaW5nIH1cbiAgICAgICAgICAgIHsgdGhpcy5fZ2V0Sm9pbmFibGVOb2RlKCkgfVxuICAgICAgICAgICAgeyB0aGlzLl9nZXRMb25nRGVzY3JpcHRpb25Ob2RlKCkgfVxuICAgICAgICAgICAgeyB0aGlzLl9nZXRSb29tc05vZGUoKSB9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICBfZ2V0Um9vbXNOb2RlKCkge1xuICAgICAgICBjb25zdCBSb29tRGV0YWlsTGlzdCA9IHNkay5nZXRDb21wb25lbnQoJ3Jvb21zLlJvb21EZXRhaWxMaXN0Jyk7XG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG4gICAgICAgIGNvbnN0IFRpbnRhYmxlU3ZnID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuVGludGFibGVTdmcnKTtcbiAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlNwaW5uZXInKTtcbiAgICAgICAgY29uc3QgVG9vbHRpcEJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlRvb2x0aXBCdXR0b24nKTtcblxuICAgICAgICBjb25zdCByb29tc0hlbHBOb2RlID0gdGhpcy5zdGF0ZS5lZGl0aW5nID8gPFRvb2x0aXBCdXR0b24gaGVscFRleHQ9e1xuICAgICAgICAgICAgX3QoXG4gICAgICAgICAgICAgICAgJ1RoZXNlIHJvb21zIGFyZSBkaXNwbGF5ZWQgdG8gY29tbXVuaXR5IG1lbWJlcnMgb24gdGhlIGNvbW11bml0eSBwYWdlLiAnK1xuICAgICAgICAgICAgICAgICdDb21tdW5pdHkgbWVtYmVycyBjYW4gam9pbiB0aGUgcm9vbXMgYnkgY2xpY2tpbmcgb24gdGhlbS4nLFxuICAgICAgICAgICAgKVxuICAgICAgICB9IC8+IDogPGRpdiAvPjtcblxuICAgICAgICBjb25zdCBhZGRSb29tUm93ID0gdGhpcy5zdGF0ZS5lZGl0aW5nID9cbiAgICAgICAgICAgICg8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfcm9vbXNfaGVhZGVyX2FkZFJvd1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25BZGRSb29tc0NsaWNrfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X3Jvb21zX2hlYWRlcl9hZGRSb3dfYnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxUaW50YWJsZVN2ZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi9yZXMvaW1nL2ljb25zLXJvb20tYWRkLnN2Z1wiKX0gd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19yb29tc19oZWFkZXJfYWRkUm93X2xhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ0FkZCByb29tcyB0byB0aGlzIGNvbW11bml0eScpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4pIDogPGRpdiAvPjtcblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfcm9vbXNcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X3Jvb21zX2hlYWRlclwiPlxuICAgICAgICAgICAgICAgIDxoMz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnUm9vbXMnKSB9XG4gICAgICAgICAgICAgICAgICAgIHsgcm9vbXNIZWxwTm9kZSB9XG4gICAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgICB7IGFkZFJvb21Sb3cgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7IHRoaXMuc3RhdGUuZ3JvdXBSb29tc0xvYWRpbmcgP1xuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+IDpcbiAgICAgICAgICAgICAgICA8Um9vbURldGFpbExpc3Qgcm9vbXM9e3RoaXMuc3RhdGUuZ3JvdXBSb29tc30gLz5cbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIF9nZXRGZWF0dXJlZFJvb21zTm9kZSgpIHtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuc3RhdGUuc3VtbWFyeTtcblxuICAgICAgICBjb25zdCBkZWZhdWx0Q2F0ZWdvcnlSb29tcyA9IFtdO1xuICAgICAgICBjb25zdCBjYXRlZ29yeVJvb21zID0ge307XG4gICAgICAgIHN1bW1hcnkucm9vbXNfc2VjdGlvbi5yb29tcy5mb3JFYWNoKChyKSA9PiB7XG4gICAgICAgICAgICBpZiAoci5jYXRlZ29yeV9pZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRDYXRlZ29yeVJvb21zLnB1c2gocik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gY2F0ZWdvcnlSb29tc1tyLmNhdGVnb3J5X2lkXTtcbiAgICAgICAgICAgICAgICBpZiAobGlzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlSb29tc1tyLmNhdGVnb3J5X2lkXSA9IGxpc3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxpc3QucHVzaChyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZGVmYXVsdENhdGVnb3J5Tm9kZSA9IDxDYXRlZ29yeVJvb21MaXN0XG4gICAgICAgICAgICByb29tcz17ZGVmYXVsdENhdGVnb3J5Um9vbXN9XG4gICAgICAgICAgICBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9XG4gICAgICAgICAgICBlZGl0aW5nPXt0aGlzLnN0YXRlLmVkaXRpbmd9IC8+O1xuICAgICAgICBjb25zdCBjYXRlZ29yeVJvb21Ob2RlcyA9IE9iamVjdC5rZXlzKGNhdGVnb3J5Um9vbXMpLm1hcCgoY2F0SWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhdCA9IHN1bW1hcnkucm9vbXNfc2VjdGlvbi5jYXRlZ29yaWVzW2NhdElkXTtcbiAgICAgICAgICAgIHJldHVybiA8Q2F0ZWdvcnlSb29tTGlzdFxuICAgICAgICAgICAgICAgIGtleT17Y2F0SWR9XG4gICAgICAgICAgICAgICAgcm9vbXM9e2NhdGVnb3J5Um9vbXNbY2F0SWRdfVxuICAgICAgICAgICAgICAgIGNhdGVnb3J5PXtjYXR9XG4gICAgICAgICAgICAgICAgZ3JvdXBJZD17dGhpcy5wcm9wcy5ncm91cElkfVxuICAgICAgICAgICAgICAgIGVkaXRpbmc9e3RoaXMuc3RhdGUuZWRpdGluZ30gLz47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nc1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ3NfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgeyBfdCgnRmVhdHVyZWQgUm9vbXM6JykgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7IGRlZmF1bHRDYXRlZ29yeU5vZGUgfVxuICAgICAgICAgICAgeyBjYXRlZ29yeVJvb21Ob2RlcyB9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICBfZ2V0RmVhdHVyZWRVc2Vyc05vZGUoKSB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLnN0YXRlLnN1bW1hcnk7XG5cbiAgICAgICAgY29uc3Qgbm9Sb2xlVXNlcnMgPSBbXTtcbiAgICAgICAgY29uc3Qgcm9sZVVzZXJzID0ge307XG4gICAgICAgIHN1bW1hcnkudXNlcnNfc2VjdGlvbi51c2Vycy5mb3JFYWNoKCh1KSA9PiB7XG4gICAgICAgICAgICBpZiAodS5yb2xlX2lkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbm9Sb2xlVXNlcnMucHVzaCh1KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSByb2xlVXNlcnNbdS5yb2xlX2lkXTtcbiAgICAgICAgICAgICAgICBpZiAobGlzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgcm9sZVVzZXJzW3Uucm9sZV9pZF0gPSBsaXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsaXN0LnB1c2godSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG5vUm9sZU5vZGUgPSA8Um9sZVVzZXJMaXN0XG4gICAgICAgICAgICB1c2Vycz17bm9Sb2xlVXNlcnN9XG4gICAgICAgICAgICBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9XG4gICAgICAgICAgICBlZGl0aW5nPXt0aGlzLnN0YXRlLmVkaXRpbmd9IC8+O1xuICAgICAgICBjb25zdCByb2xlVXNlck5vZGVzID0gT2JqZWN0LmtleXMocm9sZVVzZXJzKS5tYXAoKHJvbGVJZCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm9sZSA9IHN1bW1hcnkudXNlcnNfc2VjdGlvbi5yb2xlc1tyb2xlSWRdO1xuICAgICAgICAgICAgcmV0dXJuIDxSb2xlVXNlckxpc3RcbiAgICAgICAgICAgICAgICBrZXk9e3JvbGVJZH1cbiAgICAgICAgICAgICAgICB1c2Vycz17cm9sZVVzZXJzW3JvbGVJZF19XG4gICAgICAgICAgICAgICAgcm9sZT17cm9sZX1cbiAgICAgICAgICAgICAgICBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9XG4gICAgICAgICAgICAgICAgZWRpdGluZz17dGhpcy5zdGF0ZS5lZGl0aW5nfSAvPjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nc19oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICB7IF90KCdGZWF0dXJlZCBVc2VyczonKSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsgbm9Sb2xlTm9kZSB9XG4gICAgICAgICAgICB7IHJvbGVVc2VyTm9kZXMgfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgX2dldE1lbWJlcnNoaXBTZWN0aW9uKCkge1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXZhdGFycy5CYXNlQXZhdGFyXCIpO1xuXG4gICAgICAgIGNvbnN0IGdyb3VwID0gdGhpcy5fbWF0cml4Q2xpZW50LmdldEdyb3VwKHRoaXMucHJvcHMuZ3JvdXBJZCk7XG5cbiAgICAgICAgaWYgKGdyb3VwICYmIGdyb3VwLm15TWVtYmVyc2hpcCA9PT0gJ2ludml0ZScpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm1lbWJlcnNoaXBCdXN5IHx8IHRoaXMuc3RhdGUuaW52aXRlclByb2ZpbGVCdXN5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X21lbWJlcnNoaXBTZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaHR0cEludml0ZXJBdmF0YXIgPSB0aGlzLnN0YXRlLmludml0ZXJQcm9maWxlICYmIHRoaXMuc3RhdGUuaW52aXRlclByb2ZpbGUuYXZhdGFyVXJsXG4gICAgICAgICAgICAgICAgPyBtZWRpYUZyb21NeGModGhpcy5zdGF0ZS5pbnZpdGVyUHJvZmlsZS5hdmF0YXJVcmwpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoMzYpXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgICAgICBjb25zdCBpbnZpdGVyID0gZ3JvdXAuaW52aXRlciB8fCB7fTtcbiAgICAgICAgICAgIGxldCBpbnZpdGVyTmFtZSA9IGludml0ZXIudXNlcklkO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaW52aXRlclByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICBpbnZpdGVyTmFtZSA9IHRoaXMuc3RhdGUuaW52aXRlclByb2ZpbGUuZGlzcGxheU5hbWUgfHwgaW52aXRlci51c2VySWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfbWVtYmVyc2hpcFNlY3Rpb24gbXhfR3JvdXBWaWV3X21lbWJlcnNoaXBTZWN0aW9uX2ludml0ZWRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19tZW1iZXJzaGlwU3ViU2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19tZW1iZXJzaGlwU2VjdGlvbl9kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJhc2VBdmF0YXIgdXJsPXtodHRwSW52aXRlckF2YXRhcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPXtpbnZpdGVyTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17MzZ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXszNn1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiJShpbnZpdGVyKXMgaGFzIGludml0ZWQgeW91IHRvIGpvaW4gdGhpcyBjb21tdW5pdHlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludml0ZXI6IGludml0ZXJOYW1lIHx8IF90KFwiU29tZW9uZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X21lbWJlcnNoaXBfYnV0dG9uQ29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfdGV4dEJ1dHRvbiBteF9Sb29tSGVhZGVyX3RleHRCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQWNjZXB0SW52aXRlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkFjY2VwdFwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfdGV4dEJ1dHRvbiBteF9Sb29tSGVhZGVyX3RleHRCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uUmVqZWN0SW52aXRlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRlY2xpbmVcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtZW1iZXJzaGlwQ29udGFpbmVyRXh0cmFDbGFzc2VzO1xuICAgICAgICBsZXQgbWVtYmVyc2hpcEJ1dHRvbkV4dHJhQ2xhc3NlcztcbiAgICAgICAgbGV0IG1lbWJlcnNoaXBCdXR0b25Ub29sdGlwO1xuICAgICAgICBsZXQgbWVtYmVyc2hpcEJ1dHRvblRleHQ7XG4gICAgICAgIGxldCBtZW1iZXJzaGlwQnV0dG9uT25DbGljaztcblxuICAgICAgICAvLyBVc2VyIGlzIG5vdCBpbiB0aGUgZ3JvdXBcbiAgICAgICAgaWYgKCghZ3JvdXAgfHwgZ3JvdXAubXlNZW1iZXJzaGlwID09PSAnbGVhdmUnKSAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zdW1tYXJ5ICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnN1bW1hcnkucHJvZmlsZSAmJlxuICAgICAgICAgICAgQm9vbGVhbih0aGlzLnN0YXRlLnN1bW1hcnkucHJvZmlsZS5pc19vcGVubHlfam9pbmFibGUpXG4gICAgICAgICkge1xuICAgICAgICAgICAgbWVtYmVyc2hpcEJ1dHRvblRleHQgPSBfdChcIkpvaW4gdGhpcyBjb21tdW5pdHlcIik7XG4gICAgICAgICAgICBtZW1iZXJzaGlwQnV0dG9uT25DbGljayA9IHRoaXMuX29uSm9pbkNsaWNrO1xuXG4gICAgICAgICAgICBtZW1iZXJzaGlwQnV0dG9uRXh0cmFDbGFzc2VzID0gJ214X0dyb3VwVmlld19qb2luQnV0dG9uJztcbiAgICAgICAgICAgIG1lbWJlcnNoaXBDb250YWluZXJFeHRyYUNsYXNzZXMgPSAnbXhfR3JvdXBWaWV3X21lbWJlcnNoaXBTZWN0aW9uX2xlYXZlJztcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIGdyb3VwICYmXG4gICAgICAgICAgICBncm91cC5teU1lbWJlcnNoaXAgPT09ICdqb2luJyAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5lZGl0aW5nXG4gICAgICAgICkge1xuICAgICAgICAgICAgbWVtYmVyc2hpcEJ1dHRvblRleHQgPSBfdChcIkxlYXZlIHRoaXMgY29tbXVuaXR5XCIpO1xuICAgICAgICAgICAgbWVtYmVyc2hpcEJ1dHRvbk9uQ2xpY2sgPSB0aGlzLl9vbkxlYXZlQ2xpY2s7XG4gICAgICAgICAgICBtZW1iZXJzaGlwQnV0dG9uVG9vbHRpcCA9IHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZCA/XG4gICAgICAgICAgICAgICAgX3QoXCJZb3UgYXJlIGFuIGFkbWluaXN0cmF0b3Igb2YgdGhpcyBjb21tdW5pdHlcIikgOlxuICAgICAgICAgICAgICAgIF90KFwiWW91IGFyZSBhIG1lbWJlciBvZiB0aGlzIGNvbW11bml0eVwiKTtcblxuICAgICAgICAgICAgbWVtYmVyc2hpcEJ1dHRvbkV4dHJhQ2xhc3NlcyA9IHtcbiAgICAgICAgICAgICAgICAnbXhfR3JvdXBWaWV3X2xlYXZlQnV0dG9uJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnbXhfUm9vbUhlYWRlcl90ZXh0QnV0dG9uX2Rhbmdlcic6IHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBtZW1iZXJzaGlwQ29udGFpbmVyRXh0cmFDbGFzc2VzID0gJ214X0dyb3VwVmlld19tZW1iZXJzaGlwU2VjdGlvbl9qb2luZWQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZW1iZXJzaGlwQnV0dG9uQ2xhc3NlcyA9IGNsYXNzbmFtZXMoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgJ214X1Jvb21IZWFkZXJfdGV4dEJ1dHRvbicsXG4gICAgICAgICAgICAgICAgJ214X0dyb3VwVmlld190ZXh0QnV0dG9uJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBtZW1iZXJzaGlwQnV0dG9uRXh0cmFDbGFzc2VzLFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXBDb250YWluZXJDbGFzc2VzID0gY2xhc3NuYW1lcyhcbiAgICAgICAgICAgICdteF9Hcm91cFZpZXdfbWVtYmVyc2hpcFNlY3Rpb24nLFxuICAgICAgICAgICAgbWVtYmVyc2hpcENvbnRhaW5lckV4dHJhQ2xhc3NlcyxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9e21lbWJlcnNoaXBDb250YWluZXJDbGFzc2VzfT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X21lbWJlcnNoaXBTdWJTZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgeyAvKiBUaGUgPGRpdiAvPiBpcyBmb3IgZmxleCBhbGlnbm1lbnQgKi8gfVxuICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5tZW1iZXJzaGlwQnVzeSA/IDxTcGlubmVyIC8+IDogPGRpdiAvPiB9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfbWVtYmVyc2hpcF9idXR0b25Db250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bWVtYmVyc2hpcEJ1dHRvbkNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXttZW1iZXJzaGlwQnV0dG9uT25DbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXttZW1iZXJzaGlwQnV0dG9uVG9vbHRpcH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBtZW1iZXJzaGlwQnV0dG9uVGV4dCB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgX2dldEpvaW5hYmxlTm9kZSgpIHtcbiAgICAgICAgY29uc3QgSW5saW5lU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLklubGluZVNwaW5uZXInKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZWRpdGluZyA/IDxkaXY+XG4gICAgICAgICAgICA8aDM+XG4gICAgICAgICAgICAgICAgeyBfdCgnV2hvIGNhbiBqb2luIHRoaXMgY29tbXVuaXR5PycpIH1cbiAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuZ3JvdXBKb2luYWJsZUxvYWRpbmcgP1xuICAgICAgICAgICAgICAgICAgICA8SW5saW5lU3Bpbm5lciAvPiA6IDxkaXYgLz5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e0dST1VQX0pPSU5QT0xJQ1lfSU5WSVRFfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5qb2luYWJsZUZvcm0ucG9saWN5VHlwZSA9PT0gR1JPVVBfSk9JTlBPTElDWV9JTlZJVEV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25Kb2luYWJsZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfbGFiZWxfdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnT25seSBwZW9wbGUgd2hvIGhhdmUgYmVlbiBpbnZpdGVkJykgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17R1JPVVBfSk9JTlBPTElDWV9PUEVOfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5qb2luYWJsZUZvcm0ucG9saWN5VHlwZSA9PT0gR1JPVVBfSk9JTlBPTElDWV9PUEVOfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uSm9pbmFibGVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2xhYmVsX3RleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0V2ZXJ5b25lJykgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PiA6IG51bGw7XG4gICAgfVxuXG4gICAgX2dldExvbmdEZXNjcmlwdGlvbk5vZGUoKSB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLnN0YXRlLnN1bW1hcnk7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbiA9IG51bGw7XG4gICAgICAgIGlmIChzdW1tYXJ5LnByb2ZpbGUgJiYgc3VtbWFyeS5wcm9maWxlLmxvbmdfZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gc2FuaXRpemVkSHRtbE5vZGUoc3VtbWFyeS5wcm9maWxlLmxvbmdfZGVzY3JpcHRpb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZCkge1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2dyb3VwRGVzY19wbGFjZWhvbGRlclwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25FZGl0Q2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgJ1lvdXIgY29tbXVuaXR5IGhhc25cXCd0IGdvdCBhIExvbmcgRGVzY3JpcHRpb24sIGEgSFRNTCBwYWdlIHRvIHNob3cgdG8gY29tbXVuaXR5IG1lbWJlcnMuPGJyIC8+JyArXG4gICAgICAgICAgICAgICAgICAgICdDbGljayBoZXJlIHRvIG9wZW4gc2V0dGluZ3MgYW5kIGdpdmUgaXQgb25lIScsXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICB7ICdicic6IDxiciAvPiB9LFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdyb3VwRGVzY0VkaXRpbmdDbGFzc2VzID0gY2xhc3NuYW1lcyh7XG4gICAgICAgICAgICBcIm14X0dyb3VwVmlld19ncm91cERlc2NcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibXhfR3JvdXBWaWV3X2dyb3VwRGVzY19kaXNhYmxlZFwiOiAhdGhpcy5zdGF0ZS5pc1VzZXJQcml2aWxlZ2VkLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5lZGl0aW5nID9cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtncm91cERlc2NFZGl0aW5nQ2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgPGgzPiB7IF90KFwiTG9uZyBEZXNjcmlwdGlvbiAoSFRNTClcIikgfSA8L2gzPlxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wcm9maWxlRm9ybS5sb25nX2Rlc2NyaXB0aW9ufVxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoTE9OR19ERVNDX1BMQUNFSE9MREVSKX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uTG9uZ0Rlc2NDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PVwiNFwiXG4gICAgICAgICAgICAgICAgICAgIGtleT1cImVkaXRMb25nRGVzY1wiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PiA6XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19ncm91cERlc2NcIj5cbiAgICAgICAgICAgICAgICB7IGRlc2NyaXB0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEdyb3VwQXZhdGFyID0gc2RrLmdldENvbXBvbmVudChcImF2YXRhcnMuR3JvdXBBdmF0YXJcIik7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zdW1tYXJ5TG9hZGluZyAmJiB0aGlzLnN0YXRlLmVycm9yID09PSBudWxsIHx8IHRoaXMuc3RhdGUuc2F2aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gPFNwaW5uZXIgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zdW1tYXJ5ICYmICF0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5zdGF0ZS5zdW1tYXJ5O1xuXG4gICAgICAgICAgICBsZXQgYXZhdGFyTm9kZTtcbiAgICAgICAgICAgIGxldCBuYW1lTm9kZTtcbiAgICAgICAgICAgIGxldCBzaG9ydERlc2NOb2RlO1xuICAgICAgICAgICAgY29uc3QgcmlnaHRCdXR0b25zID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0aW5nICYmIHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZCkge1xuICAgICAgICAgICAgICAgIGxldCBhdmF0YXJJbWFnZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS51cGxvYWRpbmdBdmF0YXIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFySW1hZ2UgPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBHcm91cEF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoJ2F2YXRhcnMuR3JvdXBBdmF0YXInKTtcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFySW1hZ2UgPSA8R3JvdXBBdmF0YXIgZ3JvdXBJZD17dGhpcy5wcm9wcy5ncm91cElkfVxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBOYW1lPXt0aGlzLnN0YXRlLnByb2ZpbGVGb3JtLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cEF2YXRhclVybD17dGhpcy5zdGF0ZS5wcm9maWxlRm9ybS5hdmF0YXJfdXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezI4fSBoZWlnaHQ9ezI4fSByZXNpemVNZXRob2Q9J2Nyb3AnXG4gICAgICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGF2YXRhck5vZGUgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2F2YXRhclBpY2tlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJhdmF0YXJJbnB1dFwiIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19hdmF0YXJQaWNrZXJfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGF2YXRhckltYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19hdmF0YXJQaWNrZXJfZWRpdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwiYXZhdGFySW5wdXRcIiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfYXZhdGFyUGlja2VyX2xhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9jYW1lcmEuc3ZnXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtfdChcIlVwbG9hZCBhdmF0YXJcIil9IHRpdGxlPXtfdChcIlVwbG9hZCBhdmF0YXJcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjE3XCIgaGVpZ2h0PVwiMTVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwiYXZhdGFySW5wdXRcIiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfdXBsb2FkSW5wdXRcIiB0eXBlPVwiZmlsZVwiIG9uQ2hhbmdlPXt0aGlzLl9vbkF2YXRhclNlbGVjdGVkfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBFZGl0YWJsZVRleHQgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuRWRpdGFibGVUZXh0XCIpO1xuXG4gICAgICAgICAgICAgICAgbmFtZU5vZGUgPSA8RWRpdGFibGVUZXh0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19lZGl0YWJsZVwiXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyQ2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X3BsYWNlaG9sZGVyXCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KCdDb21tdW5pdHkgTmFtZScpfVxuICAgICAgICAgICAgICAgICAgICBibHVyVG9DYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUucHJvZmlsZUZvcm0ubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgb25WYWx1ZUNoYW5nZWQ9e3RoaXMuX29uTmFtZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgZGlyPVwiYXV0b1wiIC8+O1xuXG4gICAgICAgICAgICAgICAgc2hvcnREZXNjTm9kZSA9IDxFZGl0YWJsZVRleHRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2VkaXRhYmxlXCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXJDbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfcGxhY2Vob2xkZXJcIlxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJEZXNjcmlwdGlvblwiKX1cbiAgICAgICAgICAgICAgICAgICAgYmx1clRvQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLnByb2ZpbGVGb3JtLnNob3J0X2Rlc2NyaXB0aW9ufVxuICAgICAgICAgICAgICAgICAgICBvblZhbHVlQ2hhbmdlZD17dGhpcy5fb25TaG9ydERlc2NDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PVwiMFwiXG4gICAgICAgICAgICAgICAgICAgIGRpcj1cImF1dG9cIiAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25Hcm91cEhlYWRlckl0ZW1DbGljayA9IHRoaXMuc3RhdGUuaXNVc2VyTWVtYmVyID8gdGhpcy5fb25FZGl0Q2xpY2sgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwQXZhdGFyVXJsID0gc3VtbWFyeS5wcm9maWxlID8gc3VtbWFyeS5wcm9maWxlLmF2YXRhcl91cmwgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwTmFtZSA9IHN1bW1hcnkucHJvZmlsZSA/IHN1bW1hcnkucHJvZmlsZS5uYW1lIDogbnVsbDtcbiAgICAgICAgICAgICAgICBhdmF0YXJOb2RlID0gPEdyb3VwQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH1cbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBBdmF0YXJVcmw9e2dyb3VwQXZhdGFyVXJsfVxuICAgICAgICAgICAgICAgICAgICBncm91cE5hbWU9e2dyb3VwTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25Hcm91cEhlYWRlckl0ZW1DbGlja31cbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezI4fSBoZWlnaHQ9ezI4fVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgIGlmIChzdW1tYXJ5LnByb2ZpbGUgJiYgc3VtbWFyeS5wcm9maWxlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZU5vZGUgPSA8ZGl2IG9uQ2xpY2s9e29uR3JvdXBIZWFkZXJJdGVtQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+eyBzdW1tYXJ5LnByb2ZpbGUubmFtZSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2hlYWRlcl9ncm91cGlkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHsgdGhpcy5wcm9wcy5ncm91cElkIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuYW1lTm9kZSA9IDxzcGFuIG9uQ2xpY2s9e29uR3JvdXBIZWFkZXJJdGVtQ2xpY2t9PnsgdGhpcy5wcm9wcy5ncm91cElkIH08L3NwYW4+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3VtbWFyeS5wcm9maWxlICYmIHN1bW1hcnkucHJvZmlsZS5zaG9ydF9kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBzaG9ydERlc2NOb2RlID0gPHNwYW4gb25DbGljaz17b25Hcm91cEhlYWRlckl0ZW1DbGlja30+eyBzdW1tYXJ5LnByb2ZpbGUuc2hvcnRfZGVzY3JpcHRpb24gfTwvc3Bhbj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0aW5nKSB7XG4gICAgICAgICAgICAgICAgcmlnaHRCdXR0b25zLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld190ZXh0QnV0dG9uIG14X1Jvb21IZWFkZXJfdGV4dEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJfc2F2ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vblNhdmVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnU2F2ZScpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9ucy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX2NhbmNlbEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJfY2FuY2VsQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9jYW5jZWwuc3ZnXCIpfSBjbGFzc05hbWU9XCJteF9maWx0ZXJGbGlwQ29sb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIGFsdD17X3QoXCJDYW5jZWxcIil9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1bW1hcnkudXNlciAmJiBzdW1tYXJ5LnVzZXIubWVtYmVyc2hpcCA9PT0gJ2pvaW4nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9ucy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfR3JvdXBIZWFkZXJfYnV0dG9uIG14X0dyb3VwSGVhZGVyX2VkaXRCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT1cIl9lZGl0QnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkVkaXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJDb21tdW5pdHkgU2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbnMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfR3JvdXBIZWFkZXJfYnV0dG9uIG14X0dyb3VwSGVhZGVyX3NoYXJlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT1cIl9zaGFyZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vblNoYXJlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoJ1NoYXJlIENvbW11bml0eScpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmlnaHRQYW5lbCA9IHRoaXMuc3RhdGUuc2hvd1JpZ2h0UGFuZWwgPyA8UmlnaHRQYW5lbCBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9IC8+IDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBjb25zdCBoZWFkZXJDbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgIFwibXhfR3JvdXBWaWV3X2hlYWRlclwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwibGlnaHQtcGFuZWxcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0dyb3VwVmlld19oZWFkZXJfdmlld1wiOiAhdGhpcy5zdGF0ZS5lZGl0aW5nLFxuICAgICAgICAgICAgICAgIFwibXhfR3JvdXBWaWV3X2hlYWRlcl9pc1VzZXJNZW1iZXJcIjogdGhpcy5zdGF0ZS5pc1VzZXJNZW1iZXIsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxtYWluIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhoZWFkZXJDbGFzc2VzKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19oZWFkZXJfbGVmdENvbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2hlYWRlcl9hdmF0YXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBhdmF0YXJOb2RlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19oZWFkZXJfaW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19oZWFkZXJfbmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lTm9kZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19oZWFkZXJfc2hvcnREZXNjXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHNob3J0RGVzY05vZGUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfaGVhZGVyX3JpZ2h0Q29sXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByaWdodEJ1dHRvbnMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8R3JvdXBIZWFkZXJCdXR0b25zIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8TWFpblNwbGl0IHBhbmVsPXtyaWdodFBhbmVsfSByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QXV0b0hpZGVTY3JvbGxiYXIgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuX2dldE1lbWJlcnNoaXBTZWN0aW9uKCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5fZ2V0R3JvdXBTZWN0aW9uKCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgICAgICAgICAgICAgPC9NYWluU3BsaXQ+XG4gICAgICAgICAgICAgICAgPC9tYWluPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvci5odHRwU3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19lcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnQ29tbXVuaXR5ICUoZ3JvdXBJZClzIG5vdCBmb3VuZCcsIHtncm91cElkOiB0aGlzLnByb3BzLmdyb3VwSWR9KSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBleHRyYVRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IuZXJyY29kZSA9PT0gJ01fVU5SRUNPR05JWkVEJykge1xuICAgICAgICAgICAgICAgICAgICBleHRyYVRleHQgPSA8ZGl2PnsgX3QoJ1RoaXMgaG9tZXNlcnZlciBkb2VzIG5vdCBzdXBwb3J0IGNvbW11bml0aWVzJykgfTwvZGl2PjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0ZhaWxlZCB0byBsb2FkICUoZ3JvdXBJZClzJywge2dyb3VwSWQ6IHRoaXMucHJvcHMuZ3JvdXBJZCB9KSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGV4dHJhVGV4dCB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBzdGF0ZSBmb3IgR3JvdXBWaWV3XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgLz47XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
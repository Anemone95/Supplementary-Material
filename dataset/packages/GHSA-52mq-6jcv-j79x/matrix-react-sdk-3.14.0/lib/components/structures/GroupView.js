"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

var _matrixJsSdk = require("matrix-js-sdk");

var _promise = require("../../utils/promise");

var _RightPanelStore = _interopRequireDefault(require("../../stores/RightPanelStore"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

/*
Copyright 2017 Vector Creations Ltd.
Copyright 2017, 2018 New Vector Ltd.
Copyright 2019 The Matrix.org Foundation C.I.C.

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

    const httpUrl = _MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(this.props.summaryInfo.avatar_url, 64, 64);

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

class GroupView extends _react.default.Component {
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
        target: this._matrixClient.getGroup(this.props.groupId) || new _matrixJsSdk.Group(this.props.groupId)
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

      const httpInviterAvatar = this.state.inviterProfile ? this._matrixClient.mxcUrlToHttp(this.state.inviterProfile.avatarUrl, 36, 36) : null;
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

}

exports.default = GroupView;
(0, _defineProperty2.default)(GroupView, "propTypes", {
  groupId: _propTypes.default.string.isRequired,
  // Whether this is the first time the group admin is viewing the group
  groupIsNew: _propTypes.default.bool
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvR3JvdXBWaWV3LmpzIl0sIm5hbWVzIjpbIkxPTkdfREVTQ19QTEFDRUhPTERFUiIsIlJvb21TdW1tYXJ5VHlwZSIsIlByb3BUeXBlcyIsInNoYXBlIiwicm9vbV9pZCIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJwcm9maWxlIiwibmFtZSIsImF2YXRhcl91cmwiLCJjYW5vbmljYWxfYWxpYXMiLCJVc2VyU3VtbWFyeVR5cGUiLCJzdW1tYXJ5SW5mbyIsInVzZXJfaWQiLCJyb2xlX2lkIiwiZGlzcGxheW5hbWUiLCJDYXRlZ29yeVJvb21MaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJldiIsInByZXZlbnREZWZhdWx0IiwiQWRkcmVzc1BpY2tlckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJwbGFjZWhvbGRlciIsImJ1dHRvbiIsInBpY2tlclR5cGUiLCJ2YWxpZEFkZHJlc3NUeXBlcyIsImdyb3VwSWQiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJzdWNjZXNzIiwiYWRkcnMiLCJlcnJvckxpc3QiLCJtYXAiLCJhZGRyIiwiR3JvdXBTdG9yZSIsImFkZFJvb21Ub0dyb3VwU3VtbWFyeSIsImFkZHJlc3MiLCJjYXRjaCIsInB1c2giLCJ0aGVuIiwibGVuZ3RoIiwiRXJyb3JEaWFsb2ciLCJqb2luIiwicmVuZGVyIiwiVGludGFibGVTdmciLCJhZGRCdXR0b24iLCJlZGl0aW5nIiwib25BZGRSb29tc1RvU3VtbWFyeUNsaWNrZWQiLCJyZXF1aXJlIiwicm9vbU5vZGVzIiwicm9vbXMiLCJyIiwiY2F0SGVhZGVyIiwiY2F0ZWdvcnkiLCJhcnJheU9mIiwiYm9vbCIsIkZlYXR1cmVkUm9vbSIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21fYWxpYXMiLCJyZW1vdmVSb29tRnJvbUdyb3VwU3VtbWFyeSIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsInJvb21OYW1lIiwiUm9vbUF2YXRhciIsIm9vYkRhdGEiLCJyb29tSWQiLCJhdmF0YXJVcmwiLCJwZXJtYWxpbmsiLCJyb29tTmFtZU5vZGUiLCJvbkNsaWNrIiwiZGVsZXRlQnV0dG9uIiwib25EZWxldGVDbGlja2VkIiwiUm9sZVVzZXJMaXN0Iiwic2hvdWxkT21pdFNlbGYiLCJhZGRVc2VyVG9Hcm91cFN1bW1hcnkiLCJvbkFkZFVzZXJzQ2xpY2tlZCIsInVzZXJOb2RlcyIsInVzZXJzIiwidSIsInJvbGVIZWFkZXIiLCJyb2xlIiwiRmVhdHVyZWRVc2VyIiwicmVtb3ZlVXNlckZyb21Hcm91cFN1bW1hcnkiLCJkaXNwbGF5TmFtZSIsIkJhc2VBdmF0YXIiLCJ1c2VyTmFtZU5vZGUiLCJodHRwVXJsIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwibXhjVXJsVG9IdHRwIiwiR1JPVVBfSk9JTlBPTElDWV9PUEVOIiwiR1JPVVBfSk9JTlBPTElDWV9JTlZJVEUiLCJHcm91cFZpZXciLCJzdW1tYXJ5IiwiaXNHcm91cFB1YmxpY2lzZWQiLCJpc1VzZXJQcml2aWxlZ2VkIiwiZ3JvdXBSb29tcyIsImdyb3VwUm9vbXNMb2FkaW5nIiwic2F2aW5nIiwidXBsb2FkaW5nQXZhdGFyIiwiYXZhdGFyQ2hhbmdlZCIsIm1lbWJlcnNoaXBCdXN5IiwicHVibGljaXR5QnVzeSIsImludml0ZXJQcm9maWxlIiwic2hvd1JpZ2h0UGFuZWwiLCJSaWdodFBhbmVsU3RvcmUiLCJnZXRTaGFyZWRJbnN0YW5jZSIsImlzT3BlbkZvckdyb3VwIiwic2V0U3RhdGUiLCJncm91cCIsIl91bm1vdW50ZWQiLCJteU1lbWJlcnNoaXAiLCJfY2xvc2VTZXR0aW5ncyIsImZpcnN0SW5pdCIsImdldFN1bW1hcnkiLCJmb3JFYWNoIiwiayIsInN1bW1hcnlMb2FkaW5nIiwiaXNTdGF0ZVJlYWR5IiwiU1RBVEVfS0VZIiwiU3VtbWFyeSIsImdldEdyb3VwUHVibGljaXR5IiwiZ2V0R3JvdXBSb29tcyIsIkdyb3VwUm9vbXMiLCJpc1VzZXJNZW1iZXIiLCJnZXRHcm91cE1lbWJlcnMiLCJzb21lIiwibSIsInVzZXJJZCIsIl9tYXRyaXhDbGllbnQiLCJjcmVkZW50aWFscyIsImdyb3VwSXNOZXciLCJfb25FZGl0Q2xpY2siLCJwcm9maWxlRm9ybSIsIk9iamVjdCIsImFzc2lnbiIsInN0YXRlIiwiam9pbmFibGVGb3JtIiwicG9saWN5VHlwZSIsImlzX29wZW5seV9qb2luYWJsZSIsIlNoYXJlRGlhbG9nIiwidGFyZ2V0IiwiZ2V0R3JvdXAiLCJHcm91cCIsInBheWxvYWQiLCJ2YWx1ZSIsIm5ld1Byb2ZpbGVGb3JtIiwic2hvcnRfZGVzY3JpcHRpb24iLCJsb25nX2Rlc2NyaXB0aW9uIiwiZmlsZSIsImZpbGVzIiwidXBsb2FkQ29udGVudCIsInVybCIsInNhdmVQcm9taXNlIiwiX3NhdmVHcm91cCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVzdWx0IiwiX2luaXRHcm91cFN0b3JlIiwiRmxhaXJTdG9yZSIsInJlZnJlc2hHcm91cFByb2ZpbGUiLCJmaW5hbGx5IiwiYWNjZXB0R3JvdXBJbnZpdGUiLCJsZWF2ZUdyb3VwIiwiaXNHdWVzdCIsInNjcmVlbl9hZnRlciIsInNjcmVlbiIsImpvaW5Hcm91cCIsIlF1ZXN0aW9uRGlhbG9nIiwid2FybmluZ3MiLCJfbGVhdmVHcm91cFdhcm5pbmdzIiwiZ3JvdXBOYW1lIiwiZGFuZ2VyIiwiY29uZmlybWVkIiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsIl9vbkdyb3VwTXlNZW1iZXJzaGlwIiwiX2Rpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIl9vbkFjdGlvbiIsIl9yaWdodFBhbmVsU3RvcmVUb2tlbiIsImFkZExpc3RlbmVyIiwiX29uUmlnaHRQYW5lbFN0b3JlVXBkYXRlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsInVucmVnaXN0ZXIiLCJyZW1vdmUiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5ld1Byb3BzIiwiaW52aXRlciIsIl9mZXRjaEludml0ZXJQcm9maWxlIiwicmVnaXN0ZXJMaXN0ZW5lciIsIm9uR3JvdXBTdG9yZVVwZGF0ZWQiLCJiaW5kIiwid2lsbERvT25ib2FyZGluZyIsImVycm9yR3JvdXBJZCIsInN0YXRlS2V5IiwiZXJyY29kZSIsImRlZmVycmVkX2FjdGlvbiIsImdyb3VwX2lkIiwiaW52aXRlclByb2ZpbGVCdXN5IiwiZ2V0UHJvZmlsZUluZm8iLCJyZXNwIiwic2V0R3JvdXBQcm9maWxlIiwic2V0R3JvdXBKb2luUG9saWN5IiwidHlwZSIsIl9nZXRHcm91cFNlY3Rpb24iLCJncm91cFNldHRpbmdzU2VjdGlvbkNsYXNzZXMiLCJoZWFkZXIiLCJob3N0aW5nU2lnbnVwTGluayIsImhvc3RpbmdTaWdudXAiLCJhIiwic3ViIiwiY2hhbmdlRGVsYXlXYXJuaW5nIiwiX2dldEpvaW5hYmxlTm9kZSIsIl9nZXRMb25nRGVzY3JpcHRpb25Ob2RlIiwiX2dldFJvb21zTm9kZSIsIlJvb21EZXRhaWxMaXN0IiwiQWNjZXNzaWJsZUJ1dHRvbiIsIlNwaW5uZXIiLCJUb29sdGlwQnV0dG9uIiwicm9vbXNIZWxwTm9kZSIsImFkZFJvb21Sb3ciLCJfb25BZGRSb29tc0NsaWNrIiwiX2dldEZlYXR1cmVkUm9vbXNOb2RlIiwiZGVmYXVsdENhdGVnb3J5Um9vbXMiLCJjYXRlZ29yeVJvb21zIiwicm9vbXNfc2VjdGlvbiIsImNhdGVnb3J5X2lkIiwibGlzdCIsInVuZGVmaW5lZCIsImRlZmF1bHRDYXRlZ29yeU5vZGUiLCJjYXRlZ29yeVJvb21Ob2RlcyIsImtleXMiLCJjYXRJZCIsImNhdCIsImNhdGVnb3JpZXMiLCJfZ2V0RmVhdHVyZWRVc2Vyc05vZGUiLCJub1JvbGVVc2VycyIsInJvbGVVc2VycyIsInVzZXJzX3NlY3Rpb24iLCJub1JvbGVOb2RlIiwicm9sZVVzZXJOb2RlcyIsInJvbGVJZCIsInJvbGVzIiwiX2dldE1lbWJlcnNoaXBTZWN0aW9uIiwiaHR0cEludml0ZXJBdmF0YXIiLCJpbnZpdGVyTmFtZSIsIl9vbkFjY2VwdEludml0ZUNsaWNrIiwiX29uUmVqZWN0SW52aXRlQ2xpY2siLCJtZW1iZXJzaGlwQ29udGFpbmVyRXh0cmFDbGFzc2VzIiwibWVtYmVyc2hpcEJ1dHRvbkV4dHJhQ2xhc3NlcyIsIm1lbWJlcnNoaXBCdXR0b25Ub29sdGlwIiwibWVtYmVyc2hpcEJ1dHRvblRleHQiLCJtZW1iZXJzaGlwQnV0dG9uT25DbGljayIsIkJvb2xlYW4iLCJfb25Kb2luQ2xpY2siLCJfb25MZWF2ZUNsaWNrIiwibWVtYmVyc2hpcEJ1dHRvbkNsYXNzZXMiLCJtZW1iZXJzaGlwQ29udGFpbmVyQ2xhc3NlcyIsIklubGluZVNwaW5uZXIiLCJncm91cEpvaW5hYmxlTG9hZGluZyIsIl9vbkpvaW5hYmxlQ2hhbmdlIiwiZ3JvdXBEZXNjRWRpdGluZ0NsYXNzZXMiLCJfb25Mb25nRGVzY0NoYW5nZSIsIkdyb3VwQXZhdGFyIiwiYXZhdGFyTm9kZSIsIm5hbWVOb2RlIiwic2hvcnREZXNjTm9kZSIsInJpZ2h0QnV0dG9ucyIsImF2YXRhckltYWdlIiwiX29uQXZhdGFyU2VsZWN0ZWQiLCJFZGl0YWJsZVRleHQiLCJfb25OYW1lQ2hhbmdlIiwiX29uU2hvcnREZXNjQ2hhbmdlIiwib25Hcm91cEhlYWRlckl0ZW1DbGljayIsImdyb3VwQXZhdGFyVXJsIiwiX29uU2F2ZUNsaWNrIiwiX29uQ2FuY2VsQ2xpY2siLCJ1c2VyIiwibWVtYmVyc2hpcCIsIl9vblNoYXJlQ2xpY2siLCJyaWdodFBhbmVsIiwiaGVhZGVyQ2xhc3NlcyIsInJlc2l6ZU5vdGlmaWVyIiwiaHR0cFN0YXR1cyIsImV4dHJhVGV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTBCQSxNQUFNQSxxQkFBcUIsR0FBRywwQkFDN0I7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBVDhCLENBQTlCOztBQVdBLE1BQU1DLGVBQWUsR0FBR0MsbUJBQVVDLEtBQVYsQ0FBZ0I7QUFDcENDLEVBQUFBLE9BQU8sRUFBRUYsbUJBQVVHLE1BQVYsQ0FBaUJDLFVBRFU7QUFFcENDLEVBQUFBLE9BQU8sRUFBRUwsbUJBQVVDLEtBQVYsQ0FBZ0I7QUFDckJLLElBQUFBLElBQUksRUFBRU4sbUJBQVVHLE1BREs7QUFFckJJLElBQUFBLFVBQVUsRUFBRVAsbUJBQVVHLE1BRkQ7QUFHckJLLElBQUFBLGVBQWUsRUFBRVIsbUJBQVVHO0FBSE4sR0FBaEIsRUFJTkM7QUFOaUMsQ0FBaEIsQ0FBeEI7O0FBU0EsTUFBTUssZUFBZSxHQUFHVCxtQkFBVUMsS0FBVixDQUFnQjtBQUNwQ1MsRUFBQUEsV0FBVyxFQUFFVixtQkFBVUMsS0FBVixDQUFnQjtBQUN6QlUsSUFBQUEsT0FBTyxFQUFFWCxtQkFBVUcsTUFBVixDQUFpQkMsVUFERDtBQUV6QlEsSUFBQUEsT0FBTyxFQUFFWixtQkFBVUcsTUFGTTtBQUd6QkksSUFBQUEsVUFBVSxFQUFFUCxtQkFBVUcsTUFIRztBQUl6QlUsSUFBQUEsV0FBVyxFQUFFYixtQkFBVUc7QUFKRSxHQUFoQixFQUtWQztBQU5pQyxDQUFoQixDQUF4Qjs7QUFTQSxNQUFNVSxnQkFBTixTQUErQkMsZUFBTUMsU0FBckMsQ0FBK0M7QUFBQTtBQUFBO0FBQUEsc0VBY2JDLEVBQUQsSUFBUTtBQUNqQ0EsTUFBQUEsRUFBRSxDQUFDQyxjQUFIO0FBQ0EsWUFBTUMsbUJBQW1CLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw2QkFBakIsQ0FBNUI7O0FBQ0FDLHFCQUFNQyxtQkFBTixDQUEwQiw0QkFBMUIsRUFBd0QsRUFBeEQsRUFBNERKLG1CQUE1RCxFQUFpRjtBQUM3RUssUUFBQUEsS0FBSyxFQUFFLHlCQUFHLG9DQUFILENBRHNFO0FBRTdFQyxRQUFBQSxXQUFXLEVBQUUseUJBQUcsb0RBQUgsQ0FGZ0U7QUFHN0VDLFFBQUFBLFdBQVcsRUFBRSx5QkFBRyxzQkFBSCxDQUhnRTtBQUk3RUMsUUFBQUEsTUFBTSxFQUFFLHlCQUFHLGdCQUFILENBSnFFO0FBSzdFQyxRQUFBQSxVQUFVLEVBQUUsTUFMaUU7QUFNN0VDLFFBQUFBLGlCQUFpQixFQUFFLENBQUMsWUFBRCxDQU4wRDtBQU83RUMsUUFBQUEsT0FBTyxFQUFFLEtBQUtDLEtBQUwsQ0FBV0QsT0FQeUQ7QUFRN0VFLFFBQUFBLFVBQVUsRUFBRSxDQUFDQyxPQUFELEVBQVVDLEtBQVYsS0FBb0I7QUFDNUIsY0FBSSxDQUFDRCxPQUFMLEVBQWM7QUFDZCxnQkFBTUUsU0FBUyxHQUFHLEVBQWxCO0FBQ0EsbUNBQVdELEtBQUssQ0FBQ0UsR0FBTixDQUFXQyxJQUFELElBQVU7QUFDM0IsbUJBQU9DLG9CQUNGQyxxQkFERSxDQUNvQixLQUFLUixLQUFMLENBQVdELE9BRC9CLEVBQ3dDTyxJQUFJLENBQUNHLE9BRDdDLEVBRUZDLEtBRkUsQ0FFSSxNQUFNO0FBQUVOLGNBQUFBLFNBQVMsQ0FBQ08sSUFBVixDQUFlTCxJQUFJLENBQUNHLE9BQXBCO0FBQStCLGFBRjNDLENBQVA7QUFHSCxXQUpVLENBQVgsRUFJSUcsSUFKSixDQUlTLE1BQU07QUFDWCxnQkFBSVIsU0FBUyxDQUFDUyxNQUFWLEtBQXFCLENBQXpCLEVBQTRCO0FBQ3hCO0FBQ0g7O0FBQ0Qsa0JBQU1DLFdBQVcsR0FBR3pCLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixxQkFBakIsQ0FBcEI7O0FBQ0FDLDJCQUFNQyxtQkFBTixDQUNJLHVEQURKLEVBRUksRUFGSixFQUVRc0IsV0FGUixFQUdBO0FBQ0lyQixjQUFBQSxLQUFLLEVBQUUseUJBQ0gsa0VBREcsRUFFSDtBQUFDTSxnQkFBQUEsT0FBTyxFQUFFLEtBQUtDLEtBQUwsQ0FBV0Q7QUFBckIsZUFGRyxDQURYO0FBS0lMLGNBQUFBLFdBQVcsRUFBRVUsU0FBUyxDQUFDVyxJQUFWLENBQWUsSUFBZjtBQUxqQixhQUhBO0FBVUgsV0FuQkQ7QUFvQkg7QUEvQjRFLE9BQWpGO0FBZ0NHO0FBQWMsVUFoQ2pCO0FBZ0N1QjtBQUFlLFdBaEN0QztBQWdDNkM7QUFBYSxVQWhDMUQ7QUFpQ0gsS0FsRDBDO0FBQUE7O0FBb0QzQ0MsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsV0FBVyxHQUFHNUIsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHNCQUFqQixDQUFwQjtBQUNBLFVBQU00QixTQUFTLEdBQUcsS0FBS2xCLEtBQUwsQ0FBV21CLE9BQVgsZ0JBQ2IsNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxTQUFTLEVBQUMsdUNBQTVCO0FBQ0csTUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFEakIsb0JBR0csNkJBQUMsV0FBRDtBQUFhLE1BQUEsR0FBRyxFQUFFQyxPQUFPLENBQUMsd0NBQUQsQ0FBekI7QUFBcUUsTUFBQSxLQUFLLEVBQUMsSUFBM0U7QUFBZ0YsTUFBQSxNQUFNLEVBQUM7QUFBdkYsTUFISCxlQUlHO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNNLHlCQUFHLFlBQUgsQ0FETixDQUpILENBRGEsZ0JBUVMseUNBUjNCO0FBVUEsVUFBTUMsU0FBUyxHQUFHLEtBQUt0QixLQUFMLENBQVd1QixLQUFYLENBQWlCbEIsR0FBakIsQ0FBc0JtQixDQUFELElBQU87QUFDMUMsMEJBQU8sNkJBQUMsWUFBRDtBQUNILFFBQUEsR0FBRyxFQUFFQSxDQUFDLENBQUNyRCxPQURKO0FBRUgsUUFBQSxPQUFPLEVBQUUsS0FBSzZCLEtBQUwsQ0FBV0QsT0FGakI7QUFHSCxRQUFBLE9BQU8sRUFBRSxLQUFLQyxLQUFMLENBQVdtQixPQUhqQjtBQUlILFFBQUEsV0FBVyxFQUFFSztBQUpWLFFBQVA7QUFLSCxLQU5pQixDQUFsQjs7QUFRQSxRQUFJQyxTQUFTLGdCQUFHLHlDQUFoQjs7QUFDQSxRQUFJLEtBQUt6QixLQUFMLENBQVcwQixRQUFYLElBQXVCLEtBQUsxQixLQUFMLENBQVcwQixRQUFYLENBQW9CcEQsT0FBL0MsRUFBd0Q7QUFDcERtRCxNQUFBQSxTQUFTLGdCQUFHO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUNWLEtBQUt6QixLQUFMLENBQVcwQixRQUFYLENBQW9CcEQsT0FBcEIsQ0FBNEJDLElBRGxCLENBQVo7QUFHSDs7QUFDRCx3QkFBTztBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDRGtELFNBREMsRUFFREgsU0FGQyxFQUdESixTQUhDLENBQVA7QUFLSDs7QUFuRjBDOzs4QkFBekNuQyxnQixlQUNpQjtBQUNmd0MsRUFBQUEsS0FBSyxFQUFFdEQsbUJBQVUwRCxPQUFWLENBQWtCM0QsZUFBbEIsRUFBbUNLLFVBRDNCO0FBRWZxRCxFQUFBQSxRQUFRLEVBQUV6RCxtQkFBVUMsS0FBVixDQUFnQjtBQUN0QkksSUFBQUEsT0FBTyxFQUFFTCxtQkFBVUMsS0FBVixDQUFnQjtBQUNyQkssTUFBQUEsSUFBSSxFQUFFTixtQkFBVUc7QUFESyxLQUFoQixFQUVOQztBQUhtQixHQUFoQixDQUZLO0FBT2YwQixFQUFBQSxPQUFPLEVBQUU5QixtQkFBVUcsTUFBVixDQUFpQkMsVUFQWDtBQVNmO0FBQ0E4QyxFQUFBQSxPQUFPLEVBQUVsRCxtQkFBVTJELElBQVYsQ0FBZXZEO0FBVlQsQzs7QUFxRnZCLE1BQU13RCxZQUFOLFNBQTJCN0MsZUFBTUMsU0FBakMsQ0FBMkM7QUFBQTtBQUFBO0FBQUEsbURBTzVCNkMsQ0FBRCxJQUFPO0FBQ2JBLE1BQUFBLENBQUMsQ0FBQzNDLGNBQUY7QUFDQTJDLE1BQUFBLENBQUMsQ0FBQ0MsZUFBRjs7QUFFQUMsMEJBQUlDLFFBQUosQ0FBYTtBQUNUQyxRQUFBQSxNQUFNLEVBQUUsV0FEQztBQUVUQyxRQUFBQSxVQUFVLEVBQUUsS0FBS25DLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJMLE9BQXZCLENBQStCRyxlQUZsQztBQUdUTixRQUFBQSxPQUFPLEVBQUUsS0FBSzZCLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJSO0FBSHZCLE9BQWI7QUFLSCxLQWhCc0M7QUFBQSwyREFrQnBCMkQsQ0FBRCxJQUFPO0FBQ3JCQSxNQUFBQSxDQUFDLENBQUMzQyxjQUFGO0FBQ0EyQyxNQUFBQSxDQUFDLENBQUNDLGVBQUY7O0FBQ0F4QiwwQkFBVzZCLDBCQUFYLENBQ0ksS0FBS3BDLEtBQUwsQ0FBV0QsT0FEZixFQUVJLEtBQUtDLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJSLE9BRjNCLEVBR0V1QyxLQUhGLENBR1MyQixHQUFELElBQVM7QUFDYkMsUUFBQUEsT0FBTyxDQUFDQyxLQUFSLENBQWMsK0NBQWQsRUFBK0RGLEdBQS9EO0FBQ0EsY0FBTUcsUUFBUSxHQUFHLEtBQUt4QyxLQUFMLENBQVdyQixXQUFYLENBQXVCSixJQUF2QixJQUNiLEtBQUt5QixLQUFMLENBQVdyQixXQUFYLENBQXVCRixlQURWLElBRWIsS0FBS3VCLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJSLE9BRjNCO0FBR0EsY0FBTTJDLFdBQVcsR0FBR3pCLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixxQkFBakIsQ0FBcEI7O0FBQ0FDLHVCQUFNQyxtQkFBTixDQUNJLDBDQURKLEVBRUksRUFGSixFQUVRc0IsV0FGUixFQUdBO0FBQ0lyQixVQUFBQSxLQUFLLEVBQUUseUJBQ0gsMkRBREcsRUFFSDtBQUFDTSxZQUFBQSxPQUFPLEVBQUUsS0FBS0MsS0FBTCxDQUFXRDtBQUFyQixXQUZHLENBRFg7QUFLSUwsVUFBQUEsV0FBVyxFQUFFLHlCQUFHLGdFQUFILEVBQXFFO0FBQUM4QyxZQUFBQTtBQUFELFdBQXJFO0FBTGpCLFNBSEE7QUFVSCxPQW5CRDtBQW9CSCxLQXpDc0M7QUFBQTs7QUEyQ3ZDeEIsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTXlCLFVBQVUsR0FBR3BELEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixvQkFBakIsQ0FBbkI7QUFFQSxVQUFNa0QsUUFBUSxHQUFHLEtBQUt4QyxLQUFMLENBQVdyQixXQUFYLENBQXVCTCxPQUF2QixDQUErQkMsSUFBL0IsSUFDYixLQUFLeUIsS0FBTCxDQUFXckIsV0FBWCxDQUF1QkwsT0FBdkIsQ0FBK0JHLGVBRGxCLElBRWIseUJBQUcsY0FBSCxDQUZKO0FBSUEsVUFBTWlFLE9BQU8sR0FBRztBQUNaQyxNQUFBQSxNQUFNLEVBQUUsS0FBSzNDLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJSLE9BRG5CO0FBRVp5RSxNQUFBQSxTQUFTLEVBQUUsS0FBSzVDLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJMLE9BQXZCLENBQStCRSxVQUY5QjtBQUdaRCxNQUFBQSxJQUFJLEVBQUVpRTtBQUhNLEtBQWhCO0FBTUEsUUFBSUssU0FBUyxHQUFHLElBQWhCOztBQUNBLFFBQUksS0FBSzdDLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJMLE9BQXZCLElBQWtDLEtBQUswQixLQUFMLENBQVdyQixXQUFYLENBQXVCTCxPQUF2QixDQUErQkcsZUFBckUsRUFBc0Y7QUFDbEZvRSxNQUFBQSxTQUFTLEdBQUcsb0NBQW1CLEtBQUs3QyxLQUFMLENBQVdyQixXQUFYLENBQXVCTCxPQUF2QixDQUErQkcsZUFBbEQsQ0FBWjtBQUNIOztBQUVELFFBQUlxRSxZQUFZLEdBQUcsSUFBbkI7O0FBQ0EsUUFBSUQsU0FBSixFQUFlO0FBQ1hDLE1BQUFBLFlBQVksZ0JBQUc7QUFBRyxRQUFBLElBQUksRUFBRUQsU0FBVDtBQUFvQixRQUFBLE9BQU8sRUFBRSxLQUFLRTtBQUFsQyxTQUE4Q1AsUUFBOUMsQ0FBZjtBQUNILEtBRkQsTUFFTztBQUNITSxNQUFBQSxZQUFZLGdCQUFHLDJDQUFRTixRQUFSLENBQWY7QUFDSDs7QUFFRCxVQUFNUSxZQUFZLEdBQUcsS0FBS2hELEtBQUwsQ0FBV21CLE9BQVgsZ0JBQ2pCO0FBQ0ksTUFBQSxTQUFTLEVBQUMseUNBRGQ7QUFFSSxNQUFBLEdBQUcsRUFBRUUsT0FBTyxDQUFDLG1DQUFELENBRmhCO0FBR0ksTUFBQSxLQUFLLEVBQUMsSUFIVjtBQUlJLE1BQUEsTUFBTSxFQUFDLElBSlg7QUFLSSxNQUFBLEdBQUcsRUFBQyxRQUxSO0FBTUksTUFBQSxPQUFPLEVBQUUsS0FBSzRCO0FBTmxCLE1BRGlCLGdCQVFmLHlDQVJOO0FBVUEsd0JBQU8sNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxTQUFTLEVBQUMsNEJBQTVCO0FBQXlELE1BQUEsT0FBTyxFQUFFLEtBQUtGO0FBQXZFLG9CQUNILDZCQUFDLFVBQUQ7QUFBWSxNQUFBLE9BQU8sRUFBRUwsT0FBckI7QUFBOEIsTUFBQSxLQUFLLEVBQUUsRUFBckM7QUFBeUMsTUFBQSxNQUFNLEVBQUU7QUFBakQsTUFERyxlQUVIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUFtREksWUFBbkQsQ0FGRyxFQUdERSxZQUhDLENBQVA7QUFLSDs7QUFuRnNDOzs4QkFBckNuQixZLGVBQ2lCO0FBQ2ZsRCxFQUFBQSxXQUFXLEVBQUVYLGVBQWUsQ0FBQ0ssVUFEZDtBQUVmOEMsRUFBQUEsT0FBTyxFQUFFbEQsbUJBQVUyRCxJQUFWLENBQWV2RCxVQUZUO0FBR2YwQixFQUFBQSxPQUFPLEVBQUU5QixtQkFBVUcsTUFBVixDQUFpQkM7QUFIWCxDOztBQXFGdkIsTUFBTTZFLFlBQU4sU0FBMkJsRSxlQUFNQyxTQUFqQyxDQUEyQztBQUFBO0FBQUE7QUFBQSw2REFjbEJDLEVBQUQsSUFBUTtBQUN4QkEsTUFBQUEsRUFBRSxDQUFDQyxjQUFIO0FBQ0EsWUFBTUMsbUJBQW1CLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw2QkFBakIsQ0FBNUI7O0FBQ0FDLHFCQUFNQyxtQkFBTixDQUEwQiw0QkFBMUIsRUFBd0QsRUFBeEQsRUFBNERKLG1CQUE1RCxFQUFpRjtBQUM3RUssUUFBQUEsS0FBSyxFQUFFLHlCQUFHLG9DQUFILENBRHNFO0FBRTdFQyxRQUFBQSxXQUFXLEVBQUUseUJBQUcsNENBQUgsQ0FGZ0U7QUFHN0VDLFFBQUFBLFdBQVcsRUFBRSx5QkFBRyxtQkFBSCxDQUhnRTtBQUk3RUMsUUFBQUEsTUFBTSxFQUFFLHlCQUFHLGdCQUFILENBSnFFO0FBSzdFRSxRQUFBQSxpQkFBaUIsRUFBRSxDQUFDLFlBQUQsQ0FMMEQ7QUFNN0VDLFFBQUFBLE9BQU8sRUFBRSxLQUFLQyxLQUFMLENBQVdELE9BTnlEO0FBTzdFb0QsUUFBQUEsY0FBYyxFQUFFLEtBUDZEO0FBUTdFbEQsUUFBQUEsVUFBVSxFQUFFLENBQUNDLE9BQUQsRUFBVUMsS0FBVixLQUFvQjtBQUM1QixjQUFJLENBQUNELE9BQUwsRUFBYztBQUNkLGdCQUFNRSxTQUFTLEdBQUcsRUFBbEI7QUFDQSxtQ0FBV0QsS0FBSyxDQUFDRSxHQUFOLENBQVdDLElBQUQsSUFBVTtBQUMzQixtQkFBT0Msb0JBQ0Y2QyxxQkFERSxDQUNvQjlDLElBQUksQ0FBQ0csT0FEekIsRUFFRkMsS0FGRSxDQUVJLE1BQU07QUFBRU4sY0FBQUEsU0FBUyxDQUFDTyxJQUFWLENBQWVMLElBQUksQ0FBQ0csT0FBcEI7QUFBK0IsYUFGM0MsQ0FBUDtBQUdILFdBSlUsQ0FBWCxFQUlJRyxJQUpKLENBSVMsTUFBTTtBQUNYLGdCQUFJUixTQUFTLENBQUNTLE1BQVYsS0FBcUIsQ0FBekIsRUFBNEI7QUFDeEI7QUFDSDs7QUFDRCxrQkFBTUMsV0FBVyxHQUFHekIsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUFwQjs7QUFDQUMsMkJBQU1DLG1CQUFOLENBQ0ksNERBREosRUFFSSxFQUZKLEVBRVFzQixXQUZSLEVBR0E7QUFDSXJCLGNBQUFBLEtBQUssRUFBRSx5QkFDSCxrRUFERyxFQUVIO0FBQUNNLGdCQUFBQSxPQUFPLEVBQUUsS0FBS0MsS0FBTCxDQUFXRDtBQUFyQixlQUZHLENBRFg7QUFLSUwsY0FBQUEsV0FBVyxFQUFFVSxTQUFTLENBQUNXLElBQVYsQ0FBZSxJQUFmO0FBTGpCLGFBSEE7QUFVSCxXQW5CRDtBQW9CSDtBQS9CNEUsT0FBakY7QUFnQ0c7QUFBYyxVQWhDakI7QUFnQ3VCO0FBQWUsV0FoQ3RDO0FBZ0M2QztBQUFhLFVBaEMxRDtBQWlDSCxLQWxEc0M7QUFBQTs7QUFvRHZDQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxXQUFXLEdBQUc1QixHQUFHLENBQUNDLFlBQUosQ0FBaUIsc0JBQWpCLENBQXBCO0FBQ0EsVUFBTTRCLFNBQVMsR0FBRyxLQUFLbEIsS0FBTCxDQUFXbUIsT0FBWCxnQkFDYiw2QkFBQyx5QkFBRDtBQUFrQixNQUFBLFNBQVMsRUFBQyx1Q0FBNUI7QUFBb0UsTUFBQSxPQUFPLEVBQUUsS0FBS2tDO0FBQWxGLG9CQUNJLDZCQUFDLFdBQUQ7QUFBYSxNQUFBLEdBQUcsRUFBRWhDLE9BQU8sQ0FBQyx3Q0FBRCxDQUF6QjtBQUFxRSxNQUFBLEtBQUssRUFBQyxJQUEzRTtBQUFnRixNQUFBLE1BQU0sRUFBQztBQUF2RixNQURKLGVBRUk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ00seUJBQUcsWUFBSCxDQUROLENBRkosQ0FEYSxnQkFNVSx5Q0FONUI7QUFPQSxVQUFNaUMsU0FBUyxHQUFHLEtBQUt0RCxLQUFMLENBQVd1RCxLQUFYLENBQWlCbEQsR0FBakIsQ0FBc0JtRCxDQUFELElBQU87QUFDMUMsMEJBQU8sNkJBQUMsWUFBRDtBQUNILFFBQUEsR0FBRyxFQUFFQSxDQUFDLENBQUM1RSxPQURKO0FBRUgsUUFBQSxXQUFXLEVBQUU0RSxDQUZWO0FBR0gsUUFBQSxPQUFPLEVBQUUsS0FBS3hELEtBQUwsQ0FBV21CLE9BSGpCO0FBSUgsUUFBQSxPQUFPLEVBQUUsS0FBS25CLEtBQUwsQ0FBV0Q7QUFKakIsUUFBUDtBQUtILEtBTmlCLENBQWxCOztBQU9BLFFBQUkwRCxVQUFVLGdCQUFHLHlDQUFqQjs7QUFDQSxRQUFJLEtBQUt6RCxLQUFMLENBQVcwRCxJQUFYLElBQW1CLEtBQUsxRCxLQUFMLENBQVcwRCxJQUFYLENBQWdCcEYsT0FBdkMsRUFBZ0Q7QUFDNUNtRixNQUFBQSxVQUFVLGdCQUFHO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUF3RCxLQUFLekQsS0FBTCxDQUFXMEQsSUFBWCxDQUFnQnBGLE9BQWhCLENBQXdCQyxJQUFoRixDQUFiO0FBQ0g7O0FBQ0Qsd0JBQU87QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0RrRixVQURDLEVBRURILFNBRkMsRUFHRHBDLFNBSEMsQ0FBUDtBQUtIOztBQTdFc0M7OzhCQUFyQ2dDLFksZUFDaUI7QUFDZkssRUFBQUEsS0FBSyxFQUFFdEYsbUJBQVUwRCxPQUFWLENBQWtCakQsZUFBbEIsRUFBbUNMLFVBRDNCO0FBRWZxRixFQUFBQSxJQUFJLEVBQUV6RixtQkFBVUMsS0FBVixDQUFnQjtBQUNsQkksSUFBQUEsT0FBTyxFQUFFTCxtQkFBVUMsS0FBVixDQUFnQjtBQUNyQkssTUFBQUEsSUFBSSxFQUFFTixtQkFBVUc7QUFESyxLQUFoQixFQUVOQztBQUhlLEdBQWhCLENBRlM7QUFPZjBCLEVBQUFBLE9BQU8sRUFBRTlCLG1CQUFVRyxNQUFWLENBQWlCQyxVQVBYO0FBU2Y7QUFDQThDLEVBQUFBLE9BQU8sRUFBRWxELG1CQUFVMkQsSUFBVixDQUFldkQ7QUFWVCxDOztBQStFdkIsTUFBTXNGLFlBQU4sU0FBMkIzRSxlQUFNQyxTQUFqQyxDQUEyQztBQUFBO0FBQUE7QUFBQSxtREFPNUI2QyxDQUFELElBQU87QUFDYkEsTUFBQUEsQ0FBQyxDQUFDM0MsY0FBRjtBQUNBMkMsTUFBQUEsQ0FBQyxDQUFDQyxlQUFGOztBQUVBQywwQkFBSUMsUUFBSixDQUFhO0FBQ1RDLFFBQUFBLE1BQU0sRUFBRSwwQkFEQztBQUVUdEQsUUFBQUEsT0FBTyxFQUFFLEtBQUtvQixLQUFMLENBQVdyQixXQUFYLENBQXVCQztBQUZ2QixPQUFiO0FBSUgsS0Fmc0M7QUFBQSwyREFpQnBCa0QsQ0FBRCxJQUFPO0FBQ3JCQSxNQUFBQSxDQUFDLENBQUMzQyxjQUFGO0FBQ0EyQyxNQUFBQSxDQUFDLENBQUNDLGVBQUY7O0FBQ0F4QiwwQkFBV3FELDBCQUFYLENBQ0ksS0FBSzVELEtBQUwsQ0FBV0QsT0FEZixFQUVJLEtBQUtDLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJDLE9BRjNCLEVBR0U4QixLQUhGLENBR1MyQixHQUFELElBQVM7QUFDYkMsUUFBQUEsT0FBTyxDQUFDQyxLQUFSLENBQWMsK0NBQWQsRUFBK0RGLEdBQS9EO0FBQ0EsY0FBTXdCLFdBQVcsR0FBRyxLQUFLN0QsS0FBTCxDQUFXckIsV0FBWCxDQUF1QkcsV0FBdkIsSUFBc0MsS0FBS2tCLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJDLE9BQWpGO0FBQ0EsY0FBTWtDLFdBQVcsR0FBR3pCLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixxQkFBakIsQ0FBcEI7O0FBQ0FDLHVCQUFNQyxtQkFBTixDQUNJLDhDQURKLEVBRUksRUFGSixFQUVRc0IsV0FGUixFQUdBO0FBQ0lyQixVQUFBQSxLQUFLLEVBQUUseUJBQ0gseURBREcsRUFFSDtBQUFDTSxZQUFBQSxPQUFPLEVBQUUsS0FBS0MsS0FBTCxDQUFXRDtBQUFyQixXQUZHLENBRFg7QUFLSUwsVUFBQUEsV0FBVyxFQUFFLHlCQUFHLG1FQUFILEVBQXdFO0FBQUNtRSxZQUFBQTtBQUFELFdBQXhFO0FBTGpCLFNBSEE7QUFVSCxPQWpCRDtBQWtCSCxLQXRDc0M7QUFBQTs7QUF3Q3ZDN0MsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTThDLFVBQVUsR0FBR3pFLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixvQkFBakIsQ0FBbkI7QUFDQSxVQUFNZixJQUFJLEdBQUcsS0FBS3lCLEtBQUwsQ0FBV3JCLFdBQVgsQ0FBdUJHLFdBQXZCLElBQXNDLEtBQUtrQixLQUFMLENBQVdyQixXQUFYLENBQXVCQyxPQUExRTtBQUVBLFVBQU1pRSxTQUFTLEdBQUcsbUNBQWtCLEtBQUs3QyxLQUFMLENBQVdyQixXQUFYLENBQXVCQyxPQUF6QyxDQUFsQjs7QUFDQSxVQUFNbUYsWUFBWSxnQkFBRztBQUFHLE1BQUEsSUFBSSxFQUFFbEIsU0FBVDtBQUFvQixNQUFBLE9BQU8sRUFBRSxLQUFLRTtBQUFsQyxPQUE2Q3hFLElBQTdDLENBQXJCOztBQUNBLFVBQU15RixPQUFPLEdBQUdDLGlDQUFnQkMsR0FBaEIsR0FDWEMsWUFEVyxDQUNFLEtBQUtuRSxLQUFMLENBQVdyQixXQUFYLENBQXVCSCxVQUR6QixFQUNxQyxFQURyQyxFQUN5QyxFQUR6QyxDQUFoQjs7QUFHQSxVQUFNd0UsWUFBWSxHQUFHLEtBQUtoRCxLQUFMLENBQVdtQixPQUFYLGdCQUNqQjtBQUNJLE1BQUEsU0FBUyxFQUFDLHlDQURkO0FBRUksTUFBQSxHQUFHLEVBQUVFLE9BQU8sQ0FBQyxtQ0FBRCxDQUZoQjtBQUdJLE1BQUEsS0FBSyxFQUFDLElBSFY7QUFJSSxNQUFBLE1BQU0sRUFBQyxJQUpYO0FBS0ksTUFBQSxHQUFHLEVBQUMsUUFMUjtBQU1JLE1BQUEsT0FBTyxFQUFFLEtBQUs0QjtBQU5sQixNQURpQixnQkFRZix5Q0FSTjtBQVVBLHdCQUFPLDZCQUFDLHlCQUFEO0FBQWtCLE1BQUEsU0FBUyxFQUFDLDRCQUE1QjtBQUF5RCxNQUFBLE9BQU8sRUFBRSxLQUFLRjtBQUF2RSxvQkFDSCw2QkFBQyxVQUFEO0FBQVksTUFBQSxJQUFJLEVBQUV4RSxJQUFsQjtBQUF3QixNQUFBLEdBQUcsRUFBRXlGLE9BQTdCO0FBQXNDLE1BQUEsS0FBSyxFQUFFLEVBQTdDO0FBQWlELE1BQUEsTUFBTSxFQUFFO0FBQXpELE1BREcsZUFFSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FBbURELFlBQW5ELENBRkcsRUFHRGYsWUFIQyxDQUFQO0FBS0g7O0FBaEVzQzs7OEJBQXJDVyxZLGVBQ2lCO0FBQ2ZoRixFQUFBQSxXQUFXLEVBQUVELGVBQWUsQ0FBQ0wsVUFEZDtBQUVmOEMsRUFBQUEsT0FBTyxFQUFFbEQsbUJBQVUyRCxJQUFWLENBQWV2RCxVQUZUO0FBR2YwQixFQUFBQSxPQUFPLEVBQUU5QixtQkFBVUcsTUFBVixDQUFpQkM7QUFIWCxDO0FBa0V2QixNQUFNK0YscUJBQXFCLEdBQUcsTUFBOUI7QUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxRQUFoQzs7QUFFZSxNQUFNQyxTQUFOLFNBQXdCdEYsZUFBTUMsU0FBOUIsQ0FBd0M7QUFBQTtBQUFBO0FBQUEsaURBTzNDO0FBQ0pzRixNQUFBQSxPQUFPLEVBQUUsSUFETDtBQUVKQyxNQUFBQSxpQkFBaUIsRUFBRSxJQUZmO0FBR0pDLE1BQUFBLGdCQUFnQixFQUFFLElBSGQ7QUFJSkMsTUFBQUEsVUFBVSxFQUFFLElBSlI7QUFLSkMsTUFBQUEsaUJBQWlCLEVBQUUsSUFMZjtBQU1KcEMsTUFBQUEsS0FBSyxFQUFFLElBTkg7QUFPSnBCLE1BQUFBLE9BQU8sRUFBRSxLQVBMO0FBUUp5RCxNQUFBQSxNQUFNLEVBQUUsS0FSSjtBQVNKQyxNQUFBQSxlQUFlLEVBQUUsS0FUYjtBQVVKQyxNQUFBQSxhQUFhLEVBQUUsS0FWWDtBQVdKQyxNQUFBQSxjQUFjLEVBQUUsS0FYWjtBQVlKQyxNQUFBQSxhQUFhLEVBQUUsS0FaWDtBQWFKQyxNQUFBQSxjQUFjLEVBQUUsSUFiWjtBQWNKQyxNQUFBQSxjQUFjLEVBQUVDLHlCQUFnQkMsaUJBQWhCLEdBQW9DQztBQWRoRCxLQVAyQztBQUFBLG9FQTJEeEIsTUFBTTtBQUM3QixXQUFLQyxRQUFMLENBQWM7QUFDVkosUUFBQUEsY0FBYyxFQUFFQyx5QkFBZ0JDLGlCQUFoQixHQUFvQ0M7QUFEMUMsT0FBZDtBQUdILEtBL0RrRDtBQUFBLGdFQWlFM0JFLEtBQUQsSUFBVztBQUM5QixVQUFJLEtBQUtDLFVBQUwsSUFBbUJELEtBQUssQ0FBQ3hGLE9BQU4sS0FBa0IsS0FBS0MsS0FBTCxDQUFXRCxPQUFwRCxFQUE2RDs7QUFDN0QsVUFBSXdGLEtBQUssQ0FBQ0UsWUFBTixLQUF1QixPQUEzQixFQUFvQztBQUNoQztBQUNBLGFBQUtDLGNBQUw7QUFDSDs7QUFDRCxXQUFLSixRQUFMLENBQWM7QUFBQ1AsUUFBQUEsY0FBYyxFQUFFO0FBQWpCLE9BQWQ7QUFDSCxLQXhFa0Q7QUFBQSwrREF5RzVCWSxTQUFELElBQWU7QUFDakMsVUFBSSxLQUFLSCxVQUFULEVBQXFCOztBQUNyQixZQUFNakIsT0FBTyxHQUFHaEUsb0JBQVdxRixVQUFYLENBQXNCLEtBQUs1RixLQUFMLENBQVdELE9BQWpDLENBQWhCOztBQUNBLFVBQUl3RSxPQUFPLENBQUNqRyxPQUFaLEVBQXFCO0FBQ2pCO0FBQ0E7QUFDQSxTQUFDLFlBQUQsRUFBZSxrQkFBZixFQUFtQyxNQUFuQyxFQUEyQyxtQkFBM0MsRUFBZ0V1SCxPQUFoRSxDQUF5RUMsQ0FBRCxJQUFPO0FBQzNFdkIsVUFBQUEsT0FBTyxDQUFDakcsT0FBUixDQUFnQndILENBQWhCLElBQXFCdkIsT0FBTyxDQUFDakcsT0FBUixDQUFnQndILENBQWhCLEtBQXNCLEVBQTNDO0FBQ0gsU0FGRDtBQUdIOztBQUNELFdBQUtSLFFBQUwsQ0FBYztBQUNWZixRQUFBQSxPQURVO0FBRVZ3QixRQUFBQSxjQUFjLEVBQUUsQ0FBQ3hGLG9CQUFXeUYsWUFBWCxDQUF3QixLQUFLaEcsS0FBTCxDQUFXRCxPQUFuQyxFQUE0Q1Esb0JBQVcwRixTQUFYLENBQXFCQyxPQUFqRSxDQUZQO0FBR1YxQixRQUFBQSxpQkFBaUIsRUFBRWpFLG9CQUFXNEYsaUJBQVgsQ0FBNkIsS0FBS25HLEtBQUwsQ0FBV0QsT0FBeEMsQ0FIVDtBQUlWMEUsUUFBQUEsZ0JBQWdCLEVBQUVsRSxvQkFBV2tFLGdCQUFYLENBQTRCLEtBQUt6RSxLQUFMLENBQVdELE9BQXZDLENBSlI7QUFLVjJFLFFBQUFBLFVBQVUsRUFBRW5FLG9CQUFXNkYsYUFBWCxDQUF5QixLQUFLcEcsS0FBTCxDQUFXRCxPQUFwQyxDQUxGO0FBTVY0RSxRQUFBQSxpQkFBaUIsRUFBRSxDQUFDcEUsb0JBQVd5RixZQUFYLENBQXdCLEtBQUtoRyxLQUFMLENBQVdELE9BQW5DLEVBQTRDUSxvQkFBVzBGLFNBQVgsQ0FBcUJJLFVBQWpFLENBTlY7QUFPVkMsUUFBQUEsWUFBWSxFQUFFL0Ysb0JBQVdnRyxlQUFYLENBQTJCLEtBQUt2RyxLQUFMLENBQVdELE9BQXRDLEVBQStDeUcsSUFBL0MsQ0FDVEMsQ0FBRCxJQUFPQSxDQUFDLENBQUNDLE1BQUYsS0FBYSxLQUFLQyxhQUFMLENBQW1CQyxXQUFuQixDQUErQkYsTUFEekM7QUFQSixPQUFkLEVBVmlDLENBcUJqQzs7QUFDQSxVQUFJLEtBQUsxRyxLQUFMLENBQVc2RyxVQUFYLElBQXlCbEIsU0FBN0IsRUFBd0M7QUFDcEMsYUFBS21CLFlBQUw7QUFDSDtBQUNKLEtBbElrRDtBQUFBLHdEQTBKcEMsTUFBTTtBQUNqQixXQUFLeEIsUUFBTCxDQUFjO0FBQ1ZuRSxRQUFBQSxPQUFPLEVBQUUsSUFEQztBQUVWNEYsUUFBQUEsV0FBVyxFQUFFQyxNQUFNLENBQUNDLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEtBQUtDLEtBQUwsQ0FBVzNDLE9BQVgsQ0FBbUJqRyxPQUFyQyxDQUZIO0FBR1Y2SSxRQUFBQSxZQUFZLEVBQUU7QUFDVkMsVUFBQUEsVUFBVSxFQUNOLEtBQUtGLEtBQUwsQ0FBVzNDLE9BQVgsQ0FBbUJqRyxPQUFuQixDQUEyQitJLGtCQUEzQixHQUNJakQscUJBREosR0FFSUM7QUFKRTtBQUhKLE9BQWQ7QUFVSCxLQXJLa0Q7QUFBQSx5REF1S25DLE1BQU07QUFDbEIsWUFBTWlELFdBQVcsR0FBR2pJLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixxQkFBakIsQ0FBcEI7O0FBQ0FDLHFCQUFNQyxtQkFBTixDQUEwQix3QkFBMUIsRUFBb0QsRUFBcEQsRUFBd0Q4SCxXQUF4RCxFQUFxRTtBQUNqRUMsUUFBQUEsTUFBTSxFQUFFLEtBQUtaLGFBQUwsQ0FBbUJhLFFBQW5CLENBQTRCLEtBQUt4SCxLQUFMLENBQVdELE9BQXZDLEtBQW1ELElBQUkwSCxrQkFBSixDQUFVLEtBQUt6SCxLQUFMLENBQVdELE9BQXJCO0FBRE0sT0FBckU7QUFHSCxLQTVLa0Q7QUFBQSwwREE4S2xDLE1BQU07QUFDbkIsV0FBSzJGLGNBQUw7QUFDSCxLQWhMa0Q7QUFBQSxxREFrTHRDZ0MsT0FBRCxJQUFhO0FBQ3JCLGNBQVFBLE9BQU8sQ0FBQ3hGLE1BQWhCO0FBQ0k7QUFDQSxhQUFLLGdCQUFMO0FBQ0ksZUFBS29ELFFBQUwsQ0FBYztBQUNWbkUsWUFBQUEsT0FBTyxFQUFFLEtBREM7QUFFVjRGLFlBQUFBLFdBQVcsRUFBRTtBQUZILFdBQWQ7QUFJQTs7QUFDSjtBQUNJO0FBVFI7QUFXSCxLQTlMa0Q7QUFBQSwwREFnTWxDLE1BQU07QUFDbkIvRSwwQkFBSUMsUUFBSixDQUFhO0FBQUNDLFFBQUFBLE1BQU0sRUFBRTtBQUFULE9BQWI7QUFDSCxLQWxNa0Q7QUFBQSx5REFvTWxDeUYsS0FBRCxJQUFXO0FBQ3ZCLFlBQU1DLGNBQWMsR0FBR1osTUFBTSxDQUFDQyxNQUFQLENBQWMsS0FBS0MsS0FBTCxDQUFXSCxXQUF6QixFQUFzQztBQUFFeEksUUFBQUEsSUFBSSxFQUFFb0o7QUFBUixPQUF0QyxDQUF2QjtBQUNBLFdBQUtyQyxRQUFMLENBQWM7QUFDVnlCLFFBQUFBLFdBQVcsRUFBRWE7QUFESCxPQUFkO0FBR0gsS0F6TWtEO0FBQUEsOERBMk03QkQsS0FBRCxJQUFXO0FBQzVCLFlBQU1DLGNBQWMsR0FBR1osTUFBTSxDQUFDQyxNQUFQLENBQWMsS0FBS0MsS0FBTCxDQUFXSCxXQUF6QixFQUFzQztBQUFFYyxRQUFBQSxpQkFBaUIsRUFBRUY7QUFBckIsT0FBdEMsQ0FBdkI7QUFDQSxXQUFLckMsUUFBTCxDQUFjO0FBQ1Z5QixRQUFBQSxXQUFXLEVBQUVhO0FBREgsT0FBZDtBQUdILEtBaE5rRDtBQUFBLDZEQWtOOUI5RixDQUFELElBQU87QUFDdkIsWUFBTThGLGNBQWMsR0FBR1osTUFBTSxDQUFDQyxNQUFQLENBQWMsS0FBS0MsS0FBTCxDQUFXSCxXQUF6QixFQUFzQztBQUFFZSxRQUFBQSxnQkFBZ0IsRUFBRWhHLENBQUMsQ0FBQ3lGLE1BQUYsQ0FBU0k7QUFBN0IsT0FBdEMsQ0FBdkI7QUFDQSxXQUFLckMsUUFBTCxDQUFjO0FBQ1Z5QixRQUFBQSxXQUFXLEVBQUVhO0FBREgsT0FBZDtBQUdILEtBdk5rRDtBQUFBLDZEQXlOL0IxSSxFQUFFLElBQUk7QUFDdEIsWUFBTTZJLElBQUksR0FBRzdJLEVBQUUsQ0FBQ3FJLE1BQUgsQ0FBVVMsS0FBVixDQUFnQixDQUFoQixDQUFiO0FBQ0EsVUFBSSxDQUFDRCxJQUFMLEVBQVc7QUFFWCxXQUFLekMsUUFBTCxDQUFjO0FBQUNULFFBQUFBLGVBQWUsRUFBRTtBQUFsQixPQUFkOztBQUNBLFdBQUs4QixhQUFMLENBQW1Cc0IsYUFBbkIsQ0FBaUNGLElBQWpDLEVBQXVDbkgsSUFBdkMsQ0FBNkNzSCxHQUFELElBQVM7QUFDakQsY0FBTU4sY0FBYyxHQUFHWixNQUFNLENBQUNDLE1BQVAsQ0FBYyxLQUFLQyxLQUFMLENBQVdILFdBQXpCLEVBQXNDO0FBQUV2SSxVQUFBQSxVQUFVLEVBQUUwSjtBQUFkLFNBQXRDLENBQXZCO0FBQ0EsYUFBSzVDLFFBQUwsQ0FBYztBQUNWVCxVQUFBQSxlQUFlLEVBQUUsS0FEUDtBQUVWa0MsVUFBQUEsV0FBVyxFQUFFYSxjQUZIO0FBSVY7QUFDQTtBQUNBOUMsVUFBQUEsYUFBYSxFQUFFO0FBTkwsU0FBZDtBQVFILE9BVkQsRUFVR3BFLEtBVkgsQ0FVVW9CLENBQUQsSUFBTztBQUNaLGFBQUt3RCxRQUFMLENBQWM7QUFBQ1QsVUFBQUEsZUFBZSxFQUFFO0FBQWxCLFNBQWQ7QUFDQSxjQUFNL0QsV0FBVyxHQUFHekIsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUFwQjtBQUNBZ0QsUUFBQUEsT0FBTyxDQUFDQyxLQUFSLENBQWMsK0JBQWQsRUFBK0NULENBQS9DOztBQUNBdkMsdUJBQU1DLG1CQUFOLENBQTBCLHdCQUExQixFQUFvRCxFQUFwRCxFQUF3RHNCLFdBQXhELEVBQXFFO0FBQ2pFckIsVUFBQUEsS0FBSyxFQUFFLHlCQUFHLE9BQUgsQ0FEMEQ7QUFFakVDLFVBQUFBLFdBQVcsRUFBRSx5QkFBRyx3QkFBSDtBQUZvRCxTQUFyRTtBQUlILE9BbEJEO0FBbUJILEtBalBrRDtBQUFBLDZEQW1QL0JSLEVBQUUsSUFBSTtBQUN0QixXQUFLb0csUUFBTCxDQUFjO0FBQ1Y2QixRQUFBQSxZQUFZLEVBQUU7QUFBRUMsVUFBQUEsVUFBVSxFQUFFbEksRUFBRSxDQUFDcUksTUFBSCxDQUFVSTtBQUF4QjtBQURKLE9BQWQ7QUFHSCxLQXZQa0Q7QUFBQSx3REF5UHBDLE1BQU07QUFDakIsV0FBS3JDLFFBQUwsQ0FBYztBQUFDVixRQUFBQSxNQUFNLEVBQUU7QUFBVCxPQUFkO0FBQ0EsWUFBTXVELFdBQVcsR0FBRyxLQUFLakIsS0FBTCxDQUFXekMsZ0JBQVgsR0FBOEIsS0FBSzJELFVBQUwsRUFBOUIsR0FBa0RDLE9BQU8sQ0FBQ0MsT0FBUixFQUF0RTtBQUNBSCxNQUFBQSxXQUFXLENBQUN2SCxJQUFaLENBQWtCMkgsTUFBRCxJQUFZO0FBQ3pCLGFBQUtqRCxRQUFMLENBQWM7QUFDVlYsVUFBQUEsTUFBTSxFQUFFLEtBREU7QUFFVnpELFVBQUFBLE9BQU8sRUFBRSxLQUZDO0FBR1ZvRCxVQUFBQSxPQUFPLEVBQUU7QUFIQyxTQUFkOztBQUtBLGFBQUtpRSxlQUFMLENBQXFCLEtBQUt4SSxLQUFMLENBQVdELE9BQWhDOztBQUVBLFlBQUksS0FBS21ILEtBQUwsQ0FBV3BDLGFBQWYsRUFBOEI7QUFDMUI7QUFDQTJELDhCQUFXQyxtQkFBWCxDQUErQixLQUFLL0IsYUFBcEMsRUFBbUQsS0FBSzNHLEtBQUwsQ0FBV0QsT0FBOUQ7QUFDSDtBQUNKLE9BWkQsRUFZR1csS0FaSCxDQVlVb0IsQ0FBRCxJQUFPO0FBQ1osYUFBS3dELFFBQUwsQ0FBYztBQUNWVixVQUFBQSxNQUFNLEVBQUU7QUFERSxTQUFkO0FBR0EsY0FBTTlELFdBQVcsR0FBR3pCLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixxQkFBakIsQ0FBcEI7QUFDQWdELFFBQUFBLE9BQU8sQ0FBQ0MsS0FBUixDQUFjLGtDQUFkLEVBQWtEVCxDQUFsRDs7QUFDQXZDLHVCQUFNQyxtQkFBTixDQUEwQix3QkFBMUIsRUFBb0QsRUFBcEQsRUFBd0RzQixXQUF4RCxFQUFxRTtBQUNqRXJCLFVBQUFBLEtBQUssRUFBRSx5QkFBRyxPQUFILENBRDBEO0FBRWpFQyxVQUFBQSxXQUFXLEVBQUUseUJBQUcsNEJBQUg7QUFGb0QsU0FBckU7QUFJSCxPQXRCRCxFQXNCR2lKLE9BdEJILENBc0JXLE1BQU07QUFDYixhQUFLckQsUUFBTCxDQUFjO0FBQ1ZSLFVBQUFBLGFBQWEsRUFBRTtBQURMLFNBQWQ7QUFHSCxPQTFCRDtBQTJCSCxLQXZSa0Q7QUFBQSxnRUFnUzVCLFlBQVk7QUFDL0IsV0FBS1EsUUFBTCxDQUFjO0FBQUNQLFFBQUFBLGNBQWMsRUFBRTtBQUFqQixPQUFkLEVBRCtCLENBRy9CO0FBQ0E7O0FBQ0EsWUFBTSxvQkFBTSxHQUFOLENBQU47O0FBRUF4RSwwQkFBV3FJLGlCQUFYLENBQTZCLEtBQUs1SSxLQUFMLENBQVdELE9BQXhDLEVBQWlEYSxJQUFqRCxDQUFzRCxNQUFNLENBQ3hEO0FBQ0gsT0FGRCxFQUVHRixLQUZILENBRVVvQixDQUFELElBQU87QUFDWixhQUFLd0QsUUFBTCxDQUFjO0FBQUNQLFVBQUFBLGNBQWMsRUFBRTtBQUFqQixTQUFkO0FBQ0EsY0FBTWpFLFdBQVcsR0FBR3pCLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixxQkFBakIsQ0FBcEI7O0FBQ0FDLHVCQUFNQyxtQkFBTixDQUEwQix3QkFBMUIsRUFBb0QsRUFBcEQsRUFBd0RzQixXQUF4RCxFQUFxRTtBQUNqRXJCLFVBQUFBLEtBQUssRUFBRSx5QkFBRyxPQUFILENBRDBEO0FBRWpFQyxVQUFBQSxXQUFXLEVBQUUseUJBQUcseUJBQUg7QUFGb0QsU0FBckU7QUFJSCxPQVREO0FBVUgsS0FqVGtEO0FBQUEsZ0VBbVQ1QixZQUFZO0FBQy9CLFdBQUs0RixRQUFMLENBQWM7QUFBQ1AsUUFBQUEsY0FBYyxFQUFFO0FBQWpCLE9BQWQsRUFEK0IsQ0FHL0I7QUFDQTs7QUFDQSxZQUFNLG9CQUFNLEdBQU4sQ0FBTjs7QUFFQXhFLDBCQUFXc0ksVUFBWCxDQUFzQixLQUFLN0ksS0FBTCxDQUFXRCxPQUFqQyxFQUEwQ2EsSUFBMUMsQ0FBK0MsTUFBTSxDQUNqRDtBQUNILE9BRkQsRUFFR0YsS0FGSCxDQUVVb0IsQ0FBRCxJQUFPO0FBQ1osYUFBS3dELFFBQUwsQ0FBYztBQUFDUCxVQUFBQSxjQUFjLEVBQUU7QUFBakIsU0FBZDtBQUNBLGNBQU1qRSxXQUFXLEdBQUd6QixHQUFHLENBQUNDLFlBQUosQ0FBaUIscUJBQWpCLENBQXBCOztBQUNBQyx1QkFBTUMsbUJBQU4sQ0FBMEIsd0JBQTFCLEVBQW9ELEVBQXBELEVBQXdEc0IsV0FBeEQsRUFBcUU7QUFDakVyQixVQUFBQSxLQUFLLEVBQUUseUJBQUcsT0FBSCxDQUQwRDtBQUVqRUMsVUFBQUEsV0FBVyxFQUFFLHlCQUFHLHlCQUFIO0FBRm9ELFNBQXJFO0FBSUgsT0FURDtBQVVILEtBcFVrRDtBQUFBLHdEQXNVcEMsWUFBWTtBQUN2QixVQUFJLEtBQUtpSCxhQUFMLENBQW1CbUMsT0FBbkIsRUFBSixFQUFrQztBQUM5QjlHLDRCQUFJQyxRQUFKLENBQWE7QUFBQ0MsVUFBQUEsTUFBTSxFQUFFLHNCQUFUO0FBQWlDNkcsVUFBQUEsWUFBWSxFQUFFO0FBQUNDLFlBQUFBLE1BQU0sRUFBRyxTQUFRLEtBQUtoSixLQUFMLENBQVdELE9BQVE7QUFBckM7QUFBL0MsU0FBYjs7QUFDQTtBQUNIOztBQUVELFdBQUt1RixRQUFMLENBQWM7QUFBQ1AsUUFBQUEsY0FBYyxFQUFFO0FBQWpCLE9BQWQsRUFOdUIsQ0FRdkI7QUFDQTs7QUFDQSxZQUFNLG9CQUFNLEdBQU4sQ0FBTjs7QUFFQXhFLDBCQUFXMEksU0FBWCxDQUFxQixLQUFLakosS0FBTCxDQUFXRCxPQUFoQyxFQUF5Q2EsSUFBekMsQ0FBOEMsTUFBTSxDQUNoRDtBQUNILE9BRkQsRUFFR0YsS0FGSCxDQUVVb0IsQ0FBRCxJQUFPO0FBQ1osYUFBS3dELFFBQUwsQ0FBYztBQUFDUCxVQUFBQSxjQUFjLEVBQUU7QUFBakIsU0FBZDtBQUNBLGNBQU1qRSxXQUFXLEdBQUd6QixHQUFHLENBQUNDLFlBQUosQ0FBaUIscUJBQWpCLENBQXBCOztBQUNBQyx1QkFBTUMsbUJBQU4sQ0FBMEIsb0JBQTFCLEVBQWdELEVBQWhELEVBQW9Ec0IsV0FBcEQsRUFBaUU7QUFDN0RyQixVQUFBQSxLQUFLLEVBQUUseUJBQUcsT0FBSCxDQURzRDtBQUU3REMsVUFBQUEsV0FBVyxFQUFFLHlCQUFHLDBCQUFIO0FBRmdELFNBQWpFO0FBSUgsT0FURDtBQVVILEtBNVZrRDtBQUFBLHlEQThXbkMsTUFBTTtBQUNsQixZQUFNd0osY0FBYyxHQUFHN0osR0FBRyxDQUFDQyxZQUFKLENBQWlCLHdCQUFqQixDQUF2Qjs7QUFDQSxZQUFNNkosUUFBUSxHQUFHLEtBQUtDLG1CQUFMLEVBQWpCOztBQUVBN0oscUJBQU1DLG1CQUFOLENBQTBCLGFBQTFCLEVBQXlDLEVBQXpDLEVBQTZDMEosY0FBN0MsRUFBNkQ7QUFDekR6SixRQUFBQSxLQUFLLEVBQUUseUJBQUcsaUJBQUgsQ0FEa0Q7QUFFekRDLFFBQUFBLFdBQVcsZUFDUCwyQ0FDRSx5QkFBRyxzQkFBSCxFQUEyQjtBQUFDMkosVUFBQUEsU0FBUyxFQUFFLEtBQUtySixLQUFMLENBQVdEO0FBQXZCLFNBQTNCLENBREYsRUFFRW9KLFFBRkYsQ0FIcUQ7QUFRekR2SixRQUFBQSxNQUFNLEVBQUUseUJBQUcsT0FBSCxDQVJpRDtBQVN6RDBKLFFBQUFBLE1BQU0sRUFBRSxLQUFLcEMsS0FBTCxDQUFXekMsZ0JBVHNDO0FBVXpEeEUsUUFBQUEsVUFBVSxFQUFFLE1BQU9zSixTQUFQLElBQXFCO0FBQzdCLGNBQUksQ0FBQ0EsU0FBTCxFQUFnQjtBQUVoQixlQUFLakUsUUFBTCxDQUFjO0FBQUNQLFlBQUFBLGNBQWMsRUFBRTtBQUFqQixXQUFkLEVBSDZCLENBSzdCO0FBQ0E7O0FBQ0EsZ0JBQU0sb0JBQU0sR0FBTixDQUFOOztBQUVBeEUsOEJBQVdzSSxVQUFYLENBQXNCLEtBQUs3SSxLQUFMLENBQVdELE9BQWpDLEVBQTBDYSxJQUExQyxDQUErQyxNQUFNLENBQ2pEO0FBQ0gsV0FGRCxFQUVHRixLQUZILENBRVVvQixDQUFELElBQU87QUFDWixpQkFBS3dELFFBQUwsQ0FBYztBQUFDUCxjQUFBQSxjQUFjLEVBQUU7QUFBakIsYUFBZDtBQUNBLGtCQUFNakUsV0FBVyxHQUFHekIsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUFwQjs7QUFDQUMsMkJBQU1DLG1CQUFOLENBQTBCLHlCQUExQixFQUFxRCxFQUFyRCxFQUF5RHNCLFdBQXpELEVBQXNFO0FBQ2xFckIsY0FBQUEsS0FBSyxFQUFFLHlCQUFHLE9BQUgsQ0FEMkQ7QUFFbEVDLGNBQUFBLFdBQVcsRUFBRSx5QkFBRywyQkFBSDtBQUZxRCxhQUF0RTtBQUlILFdBVEQ7QUFVSDtBQTdCd0QsT0FBN0Q7QUErQkgsS0FqWmtEO0FBQUEsNERBbVpoQyxNQUFNO0FBQ3JCLHNEQUF1QixLQUFLTSxLQUFMLENBQVdELE9BQWxDO0FBQ0gsS0FyWmtEO0FBQUE7O0FBd0JuRHlKLEVBQUFBLGlCQUFpQixHQUFHO0FBQ2hCLFNBQUtoRSxVQUFMLEdBQWtCLEtBQWxCO0FBQ0EsU0FBS21CLGFBQUwsR0FBcUIxQyxpQ0FBZ0JDLEdBQWhCLEVBQXJCOztBQUNBLFNBQUt5QyxhQUFMLENBQW1COEMsRUFBbkIsQ0FBc0Isb0JBQXRCLEVBQTRDLEtBQUtDLG9CQUFqRDs7QUFFQSxTQUFLbEIsZUFBTCxDQUFxQixLQUFLeEksS0FBTCxDQUFXRCxPQUFoQyxFQUF5QyxJQUF6Qzs7QUFFQSxTQUFLNEosY0FBTCxHQUFzQjNILG9CQUFJNEgsUUFBSixDQUFhLEtBQUtDLFNBQWxCLENBQXRCO0FBQ0EsU0FBS0MscUJBQUwsR0FBNkIzRSx5QkFBZ0JDLGlCQUFoQixHQUFvQzJFLFdBQXBDLENBQWdELEtBQUtDLHdCQUFyRCxDQUE3QjtBQUNIOztBQUVEQyxFQUFBQSxvQkFBb0IsR0FBRztBQUNuQixTQUFLekUsVUFBTCxHQUFrQixJQUFsQjs7QUFDQSxTQUFLbUIsYUFBTCxDQUFtQnVELGNBQW5CLENBQWtDLG9CQUFsQyxFQUF3RCxLQUFLUixvQkFBN0Q7O0FBQ0ExSCx3QkFBSW1JLFVBQUosQ0FBZSxLQUFLUixjQUFwQixFQUhtQixDQUtuQjs7O0FBQ0EsUUFBSSxLQUFLRyxxQkFBVCxFQUFnQztBQUM1QixXQUFLQSxxQkFBTCxDQUEyQk0sTUFBM0I7QUFDSDtBQUNKLEdBNUNrRCxDQThDbkQ7QUFDQTs7O0FBQ0FDLEVBQUFBLGdDQUFnQyxDQUFDQyxRQUFELEVBQVc7QUFDdkMsUUFBSSxLQUFLdEssS0FBTCxDQUFXRCxPQUFYLEtBQXVCdUssUUFBUSxDQUFDdkssT0FBcEMsRUFBNkM7QUFDekMsV0FBS3VGLFFBQUwsQ0FBYztBQUNWZixRQUFBQSxPQUFPLEVBQUUsSUFEQztBQUVWaEMsUUFBQUEsS0FBSyxFQUFFO0FBRkcsT0FBZCxFQUdHLE1BQU07QUFDTCxhQUFLaUcsZUFBTCxDQUFxQjhCLFFBQVEsQ0FBQ3ZLLE9BQTlCO0FBQ0gsT0FMRDtBQU1IO0FBQ0o7O0FBaUJEeUksRUFBQUEsZUFBZSxDQUFDekksT0FBRCxFQUFVNEYsU0FBVixFQUFxQjtBQUNoQyxVQUFNSixLQUFLLEdBQUcsS0FBS29CLGFBQUwsQ0FBbUJhLFFBQW5CLENBQTRCekgsT0FBNUIsQ0FBZDs7QUFDQSxRQUFJd0YsS0FBSyxJQUFJQSxLQUFLLENBQUNnRixPQUFmLElBQTBCaEYsS0FBSyxDQUFDZ0YsT0FBTixDQUFjN0QsTUFBNUMsRUFBb0Q7QUFDaEQsV0FBSzhELG9CQUFMLENBQTBCakYsS0FBSyxDQUFDZ0YsT0FBTixDQUFjN0QsTUFBeEM7QUFDSDs7QUFDRG5HLHdCQUFXa0ssZ0JBQVgsQ0FBNEIxSyxPQUE1QixFQUFxQyxLQUFLMkssbUJBQUwsQ0FBeUJDLElBQXpCLENBQThCLElBQTlCLEVBQW9DaEYsU0FBcEMsQ0FBckM7O0FBQ0EsUUFBSWlGLGdCQUFnQixHQUFHLEtBQXZCLENBTmdDLENBT2hDOztBQUNBckssd0JBQVdrSixFQUFYLENBQWMsT0FBZCxFQUF1QixDQUFDcEgsR0FBRCxFQUFNd0ksWUFBTixFQUFvQkMsUUFBcEIsS0FBaUM7QUFDcEQsVUFBSSxLQUFLdEYsVUFBTCxJQUFtQnpGLE9BQU8sS0FBSzhLLFlBQW5DLEVBQWlEOztBQUNqRCxVQUFJeEksR0FBRyxDQUFDMEksT0FBSixLQUFnQiwwQkFBaEIsSUFBOEMsQ0FBQ0gsZ0JBQW5ELEVBQXFFO0FBQ2pFNUksNEJBQUlDLFFBQUosQ0FBYTtBQUNUQyxVQUFBQSxNQUFNLEVBQUUsd0JBREM7QUFFVDhJLFVBQUFBLGVBQWUsRUFBRTtBQUNiOUksWUFBQUEsTUFBTSxFQUFFLFlBREs7QUFFYitJLFlBQUFBLFFBQVEsRUFBRWxMO0FBRkc7QUFGUixTQUFiOztBQU9BaUMsNEJBQUlDLFFBQUosQ0FBYTtBQUFDQyxVQUFBQSxNQUFNLEVBQUUsc0JBQVQ7QUFBaUM2RyxVQUFBQSxZQUFZLEVBQUU7QUFBQ0MsWUFBQUEsTUFBTSxFQUFHLFNBQVFqSixPQUFRO0FBQTFCO0FBQS9DLFNBQWI7O0FBQ0E2SyxRQUFBQSxnQkFBZ0IsR0FBRyxJQUFuQjtBQUNIOztBQUNELFVBQUlFLFFBQVEsS0FBS3ZLLG9CQUFXMEYsU0FBWCxDQUFxQkMsT0FBdEMsRUFBK0M7QUFDM0MsYUFBS1osUUFBTCxDQUFjO0FBQ1ZmLFVBQUFBLE9BQU8sRUFBRSxJQURDO0FBRVZoQyxVQUFBQSxLQUFLLEVBQUVGLEdBRkc7QUFHVmxCLFVBQUFBLE9BQU8sRUFBRTtBQUhDLFNBQWQ7QUFLSDtBQUNKLEtBcEJEO0FBcUJIOztBQTZCRHFKLEVBQUFBLG9CQUFvQixDQUFDOUQsTUFBRCxFQUFTO0FBQ3pCLFNBQUtwQixRQUFMLENBQWM7QUFDVjRGLE1BQUFBLGtCQUFrQixFQUFFO0FBRFYsS0FBZDs7QUFHQSxTQUFLdkUsYUFBTCxDQUFtQndFLGNBQW5CLENBQWtDekUsTUFBbEMsRUFBMEM5RixJQUExQyxDQUFnRHdLLElBQUQsSUFBVTtBQUNyRCxVQUFJLEtBQUs1RixVQUFULEVBQXFCO0FBQ3JCLFdBQUtGLFFBQUwsQ0FBYztBQUNWTCxRQUFBQSxjQUFjLEVBQUU7QUFDWnJDLFVBQUFBLFNBQVMsRUFBRXdJLElBQUksQ0FBQzVNLFVBREo7QUFFWnFGLFVBQUFBLFdBQVcsRUFBRXVILElBQUksQ0FBQ3RNO0FBRk47QUFETixPQUFkO0FBTUgsS0FSRCxFQVFHNEIsS0FSSCxDQVFVb0IsQ0FBRCxJQUFPO0FBQ1pRLE1BQUFBLE9BQU8sQ0FBQ0MsS0FBUixDQUFjLHFDQUFkLEVBQXFEVCxDQUFyRDtBQUNILEtBVkQsRUFVRzZHLE9BVkgsQ0FVVyxNQUFNO0FBQ2IsVUFBSSxLQUFLbkQsVUFBVCxFQUFxQjtBQUNyQixXQUFLRixRQUFMLENBQWM7QUFDVjRGLFFBQUFBLGtCQUFrQixFQUFFO0FBRFYsT0FBZDtBQUdILEtBZkQ7QUFnQkg7O0FBaUlELFFBQU05QyxVQUFOLEdBQW1CO0FBQ2YsVUFBTSxLQUFLekIsYUFBTCxDQUFtQjBFLGVBQW5CLENBQW1DLEtBQUtyTCxLQUFMLENBQVdELE9BQTlDLEVBQXVELEtBQUttSCxLQUFMLENBQVdILFdBQWxFLENBQU47QUFDQSxVQUFNLEtBQUtKLGFBQUwsQ0FBbUIyRSxrQkFBbkIsQ0FBc0MsS0FBS3RMLEtBQUwsQ0FBV0QsT0FBakQsRUFBMEQ7QUFDNUR3TCxNQUFBQSxJQUFJLEVBQUUsS0FBS3JFLEtBQUwsQ0FBV0MsWUFBWCxDQUF3QkM7QUFEOEIsS0FBMUQsQ0FBTjtBQUdIOztBQWdFRGdDLEVBQUFBLG1CQUFtQixHQUFHO0FBQ2xCLFVBQU1ELFFBQVEsR0FBRyxFQUFqQjs7QUFFQSxRQUFJLEtBQUtqQyxLQUFMLENBQVd6QyxnQkFBZixFQUFpQztBQUM3QjBFLE1BQUFBLFFBQVEsQ0FBQ3hJLElBQVQsZUFDSTtBQUFNLFFBQUEsU0FBUyxFQUFDO0FBQWhCLFNBQ007QUFBSTtBQURWLFFBRU0seUJBQUcsaUVBQ0EsOERBREgsQ0FGTixDQURKO0FBT0g7O0FBRUQsV0FBT3dJLFFBQVA7QUFDSDs7QUEyQ0RxQyxFQUFBQSxnQkFBZ0IsR0FBRztBQUNmLFVBQU1DLDJCQUEyQixHQUFHLHlCQUFXO0FBQzNDLDRCQUFzQixLQUFLdkUsS0FBTCxDQUFXL0YsT0FEVTtBQUUzQyxxQ0FBK0IsS0FBSytGLEtBQUwsQ0FBVy9GLE9BQVgsSUFBc0IsQ0FBQyxLQUFLK0YsS0FBTCxDQUFXekM7QUFGdEIsS0FBWCxDQUFwQztBQUtBLFVBQU1pSCxNQUFNLEdBQUcsS0FBS3hFLEtBQUwsQ0FBVy9GLE9BQVgsZ0JBQXFCLDhDQUFPLHlCQUFHLG9CQUFILENBQVAsTUFBckIsZ0JBQStELHlDQUE5RTtBQUVBLFVBQU13SyxpQkFBaUIsR0FBRyxpQ0FBZSxvQkFBZixDQUExQjtBQUNBLFFBQUlDLGFBQWEsR0FBRyxJQUFwQjs7QUFDQSxRQUFJRCxpQkFBaUIsSUFBSSxLQUFLekUsS0FBTCxDQUFXekMsZ0JBQXBDLEVBQXNEO0FBQ2xEbUgsTUFBQUEsYUFBYSxnQkFBRztBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsU0FDWCx5QkFDRyx3REFESCxFQUM2RCxFQUQ3RCxFQUVHO0FBQ0lDLFFBQUFBLENBQUMsRUFBRUMsR0FBRyxpQkFBSTtBQUFHLFVBQUEsSUFBSSxFQUFFSCxpQkFBVDtBQUE0QixVQUFBLE1BQU0sRUFBQyxRQUFuQztBQUE0QyxVQUFBLEdBQUcsRUFBQztBQUFoRCxXQUF1RUcsR0FBdkU7QUFEZCxPQUZILENBRFcsZUFPWjtBQUFHLFFBQUEsSUFBSSxFQUFFSCxpQkFBVDtBQUE0QixRQUFBLE1BQU0sRUFBQyxRQUFuQztBQUE0QyxRQUFBLEdBQUcsRUFBQztBQUFoRCxzQkFDSTtBQUFLLFFBQUEsR0FBRyxFQUFFdEssT0FBTyxDQUFDLG9DQUFELENBQWpCO0FBQXlELFFBQUEsS0FBSyxFQUFDLElBQS9EO0FBQW9FLFFBQUEsTUFBTSxFQUFDLElBQTNFO0FBQWdGLFFBQUEsR0FBRyxFQUFDO0FBQXBGLFFBREosQ0FQWSxDQUFoQjtBQVdIOztBQUVELFVBQU0wSyxrQkFBa0IsR0FBRyxLQUFLN0UsS0FBTCxDQUFXL0YsT0FBWCxJQUFzQixLQUFLK0YsS0FBTCxDQUFXekMsZ0JBQWpDLGdCQUN2QjtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTSx5QkFDRSxrRkFDQSx3REFGRixFQUdFLEVBSEYsRUFJRTtBQUNJLGVBQVVxSCxHQUFELGlCQUFTLDZDQUFNQSxHQUFOLE1BRHRCO0FBRUksZUFBVUEsR0FBRCxpQkFBUyw2Q0FBTUEsR0FBTjtBQUZ0QixLQUpGLENBRE4sQ0FEdUIsZ0JBV2QseUNBWGI7QUFZQSx3QkFBTztBQUFLLE1BQUEsU0FBUyxFQUFFTDtBQUFoQixPQUNEQyxNQURDLEVBRURFLGFBRkMsRUFHREcsa0JBSEMsRUFJRCxLQUFLQyxnQkFBTCxFQUpDLEVBS0QsS0FBS0MsdUJBQUwsRUFMQyxFQU1ELEtBQUtDLGFBQUwsRUFOQyxDQUFQO0FBUUg7O0FBRURBLEVBQUFBLGFBQWEsR0FBRztBQUNaLFVBQU1DLGNBQWMsR0FBRzlNLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixzQkFBakIsQ0FBdkI7QUFDQSxVQUFNOE0sZ0JBQWdCLEdBQUcvTSxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMkJBQWpCLENBQXpCO0FBQ0EsVUFBTTJCLFdBQVcsR0FBRzVCLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixzQkFBakIsQ0FBcEI7QUFDQSxVQUFNK00sT0FBTyxHQUFHaE4sR0FBRyxDQUFDQyxZQUFKLENBQWlCLGtCQUFqQixDQUFoQjtBQUNBLFVBQU1nTixhQUFhLEdBQUdqTixHQUFHLENBQUNDLFlBQUosQ0FBaUIsd0JBQWpCLENBQXRCO0FBRUEsVUFBTWlOLGFBQWEsR0FBRyxLQUFLckYsS0FBTCxDQUFXL0YsT0FBWCxnQkFBcUIsNkJBQUMsYUFBRDtBQUFlLE1BQUEsUUFBUSxFQUM5RCx5QkFDSSwyRUFDQSwyREFGSjtBQUR1QyxNQUFyQixnQkFLZix5Q0FMUDtBQU9BLFVBQU1xTCxVQUFVLEdBQUcsS0FBS3RGLEtBQUwsQ0FBVy9GLE9BQVgsZ0JBQ2QsNkJBQUMsZ0JBQUQ7QUFBa0IsTUFBQSxTQUFTLEVBQUMsa0NBQTVCO0FBQ0csTUFBQSxPQUFPLEVBQUUsS0FBS3NMO0FBRGpCLG9CQUdHO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSw2QkFBQyxXQUFEO0FBQWEsTUFBQSxHQUFHLEVBQUVwTCxPQUFPLENBQUMscUNBQUQsQ0FBekI7QUFBa0UsTUFBQSxLQUFLLEVBQUMsSUFBeEU7QUFBNkUsTUFBQSxNQUFNLEVBQUM7QUFBcEYsTUFESixDQUhILGVBTUc7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ00seUJBQUcsNkJBQUgsQ0FETixDQU5ILENBRGMsZ0JBVVEseUNBVjNCO0FBWUEsd0JBQU87QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSx5Q0FDTSx5QkFBRyxPQUFILENBRE4sRUFFTWtMLGFBRk4sQ0FESixFQUtNQyxVQUxOLENBREcsRUFRRCxLQUFLdEYsS0FBTCxDQUFXdkMsaUJBQVgsZ0JBQ0UsNkJBQUMsT0FBRCxPQURGLGdCQUVFLDZCQUFDLGNBQUQ7QUFBZ0IsTUFBQSxLQUFLLEVBQUUsS0FBS3VDLEtBQUwsQ0FBV3hDO0FBQWxDLE1BVkQsQ0FBUDtBQWFIOztBQUVEZ0ksRUFBQUEscUJBQXFCLEdBQUc7QUFDcEIsVUFBTW5JLE9BQU8sR0FBRyxLQUFLMkMsS0FBTCxDQUFXM0MsT0FBM0I7QUFFQSxVQUFNb0ksb0JBQW9CLEdBQUcsRUFBN0I7QUFDQSxVQUFNQyxhQUFhLEdBQUcsRUFBdEI7QUFDQXJJLElBQUFBLE9BQU8sQ0FBQ3NJLGFBQVIsQ0FBc0J0TCxLQUF0QixDQUE0QnNFLE9BQTVCLENBQXFDckUsQ0FBRCxJQUFPO0FBQ3ZDLFVBQUlBLENBQUMsQ0FBQ3NMLFdBQUYsS0FBa0IsSUFBdEIsRUFBNEI7QUFDeEJILFFBQUFBLG9CQUFvQixDQUFDaE0sSUFBckIsQ0FBMEJhLENBQTFCO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsWUFBSXVMLElBQUksR0FBR0gsYUFBYSxDQUFDcEwsQ0FBQyxDQUFDc0wsV0FBSCxDQUF4Qjs7QUFDQSxZQUFJQyxJQUFJLEtBQUtDLFNBQWIsRUFBd0I7QUFDcEJELFVBQUFBLElBQUksR0FBRyxFQUFQO0FBQ0FILFVBQUFBLGFBQWEsQ0FBQ3BMLENBQUMsQ0FBQ3NMLFdBQUgsQ0FBYixHQUErQkMsSUFBL0I7QUFDSDs7QUFDREEsUUFBQUEsSUFBSSxDQUFDcE0sSUFBTCxDQUFVYSxDQUFWO0FBQ0g7QUFDSixLQVhEOztBQWFBLFVBQU15TCxtQkFBbUIsZ0JBQUcsNkJBQUMsZ0JBQUQ7QUFDeEIsTUFBQSxLQUFLLEVBQUVOLG9CQURpQjtBQUV4QixNQUFBLE9BQU8sRUFBRSxLQUFLM00sS0FBTCxDQUFXRCxPQUZJO0FBR3hCLE1BQUEsT0FBTyxFQUFFLEtBQUttSCxLQUFMLENBQVcvRjtBQUhJLE1BQTVCOztBQUlBLFVBQU0rTCxpQkFBaUIsR0FBR2xHLE1BQU0sQ0FBQ21HLElBQVAsQ0FBWVAsYUFBWixFQUEyQnZNLEdBQTNCLENBQWdDK00sS0FBRCxJQUFXO0FBQ2hFLFlBQU1DLEdBQUcsR0FBRzlJLE9BQU8sQ0FBQ3NJLGFBQVIsQ0FBc0JTLFVBQXRCLENBQWlDRixLQUFqQyxDQUFaO0FBQ0EsMEJBQU8sNkJBQUMsZ0JBQUQ7QUFDSCxRQUFBLEdBQUcsRUFBRUEsS0FERjtBQUVILFFBQUEsS0FBSyxFQUFFUixhQUFhLENBQUNRLEtBQUQsQ0FGakI7QUFHSCxRQUFBLFFBQVEsRUFBRUMsR0FIUDtBQUlILFFBQUEsT0FBTyxFQUFFLEtBQUtyTixLQUFMLENBQVdELE9BSmpCO0FBS0gsUUFBQSxPQUFPLEVBQUUsS0FBS21ILEtBQUwsQ0FBVy9GO0FBTGpCLFFBQVA7QUFNSCxLQVJ5QixDQUExQjtBQVVBLHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTSx5QkFBRyxpQkFBSCxDQUROLENBREcsRUFJRDhMLG1CQUpDLEVBS0RDLGlCQUxDLENBQVA7QUFPSDs7QUFFREssRUFBQUEscUJBQXFCLEdBQUc7QUFDcEIsVUFBTWhKLE9BQU8sR0FBRyxLQUFLMkMsS0FBTCxDQUFXM0MsT0FBM0I7QUFFQSxVQUFNaUosV0FBVyxHQUFHLEVBQXBCO0FBQ0EsVUFBTUMsU0FBUyxHQUFHLEVBQWxCO0FBQ0FsSixJQUFBQSxPQUFPLENBQUNtSixhQUFSLENBQXNCbkssS0FBdEIsQ0FBNEJzQyxPQUE1QixDQUFxQ3JDLENBQUQsSUFBTztBQUN2QyxVQUFJQSxDQUFDLENBQUMzRSxPQUFGLEtBQWMsSUFBbEIsRUFBd0I7QUFDcEIyTyxRQUFBQSxXQUFXLENBQUM3TSxJQUFaLENBQWlCNkMsQ0FBakI7QUFDSCxPQUZELE1BRU87QUFDSCxZQUFJdUosSUFBSSxHQUFHVSxTQUFTLENBQUNqSyxDQUFDLENBQUMzRSxPQUFILENBQXBCOztBQUNBLFlBQUlrTyxJQUFJLEtBQUtDLFNBQWIsRUFBd0I7QUFDcEJELFVBQUFBLElBQUksR0FBRyxFQUFQO0FBQ0FVLFVBQUFBLFNBQVMsQ0FBQ2pLLENBQUMsQ0FBQzNFLE9BQUgsQ0FBVCxHQUF1QmtPLElBQXZCO0FBQ0g7O0FBQ0RBLFFBQUFBLElBQUksQ0FBQ3BNLElBQUwsQ0FBVTZDLENBQVY7QUFDSDtBQUNKLEtBWEQ7O0FBYUEsVUFBTW1LLFVBQVUsZ0JBQUcsNkJBQUMsWUFBRDtBQUNmLE1BQUEsS0FBSyxFQUFFSCxXQURRO0FBRWYsTUFBQSxPQUFPLEVBQUUsS0FBS3hOLEtBQUwsQ0FBV0QsT0FGTDtBQUdmLE1BQUEsT0FBTyxFQUFFLEtBQUttSCxLQUFMLENBQVcvRjtBQUhMLE1BQW5COztBQUlBLFVBQU15TSxhQUFhLEdBQUc1RyxNQUFNLENBQUNtRyxJQUFQLENBQVlNLFNBQVosRUFBdUJwTixHQUF2QixDQUE0QndOLE1BQUQsSUFBWTtBQUN6RCxZQUFNbkssSUFBSSxHQUFHYSxPQUFPLENBQUNtSixhQUFSLENBQXNCSSxLQUF0QixDQUE0QkQsTUFBNUIsQ0FBYjtBQUNBLDBCQUFPLDZCQUFDLFlBQUQ7QUFDSCxRQUFBLEdBQUcsRUFBRUEsTUFERjtBQUVILFFBQUEsS0FBSyxFQUFFSixTQUFTLENBQUNJLE1BQUQsQ0FGYjtBQUdILFFBQUEsSUFBSSxFQUFFbkssSUFISDtBQUlILFFBQUEsT0FBTyxFQUFFLEtBQUsxRCxLQUFMLENBQVdELE9BSmpCO0FBS0gsUUFBQSxPQUFPLEVBQUUsS0FBS21ILEtBQUwsQ0FBVy9GO0FBTGpCLFFBQVA7QUFNSCxLQVJxQixDQUF0QjtBQVVBLHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTSx5QkFBRyxpQkFBSCxDQUROLENBREcsRUFJRHdNLFVBSkMsRUFLREMsYUFMQyxDQUFQO0FBT0g7O0FBRURHLEVBQUFBLHFCQUFxQixHQUFHO0FBQ3BCLFVBQU0xQixPQUFPLEdBQUdoTixHQUFHLENBQUNDLFlBQUosQ0FBaUIsa0JBQWpCLENBQWhCO0FBQ0EsVUFBTXdFLFVBQVUsR0FBR3pFLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixvQkFBakIsQ0FBbkI7O0FBRUEsVUFBTWlHLEtBQUssR0FBRyxLQUFLb0IsYUFBTCxDQUFtQmEsUUFBbkIsQ0FBNEIsS0FBS3hILEtBQUwsQ0FBV0QsT0FBdkMsQ0FBZDs7QUFFQSxRQUFJd0YsS0FBSyxJQUFJQSxLQUFLLENBQUNFLFlBQU4sS0FBdUIsUUFBcEMsRUFBOEM7QUFDMUMsVUFBSSxLQUFLeUIsS0FBTCxDQUFXbkMsY0FBWCxJQUE2QixLQUFLbUMsS0FBTCxDQUFXZ0Usa0JBQTVDLEVBQWdFO0FBQzVELDRCQUFPO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZix3QkFDSCw2QkFBQyxPQUFELE9BREcsQ0FBUDtBQUdIOztBQUNELFlBQU04QyxpQkFBaUIsR0FBRyxLQUFLOUcsS0FBTCxDQUFXakMsY0FBWCxHQUN0QixLQUFLMEIsYUFBTCxDQUFtQnhDLFlBQW5CLENBQ0ksS0FBSytDLEtBQUwsQ0FBV2pDLGNBQVgsQ0FBMEJyQyxTQUQ5QixFQUN5QyxFQUR6QyxFQUM2QyxFQUQ3QyxDQURzQixHQUdsQixJQUhSO0FBS0EsWUFBTTJILE9BQU8sR0FBR2hGLEtBQUssQ0FBQ2dGLE9BQU4sSUFBaUIsRUFBakM7QUFDQSxVQUFJMEQsV0FBVyxHQUFHMUQsT0FBTyxDQUFDN0QsTUFBMUI7O0FBQ0EsVUFBSSxLQUFLUSxLQUFMLENBQVdqQyxjQUFmLEVBQStCO0FBQzNCZ0osUUFBQUEsV0FBVyxHQUFHLEtBQUsvRyxLQUFMLENBQVdqQyxjQUFYLENBQTBCcEIsV0FBMUIsSUFBeUMwRyxPQUFPLENBQUM3RCxNQUEvRDtBQUNIOztBQUNELDBCQUFPO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixzQkFDSDtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLDZCQUFDLFVBQUQ7QUFBWSxRQUFBLEdBQUcsRUFBRXNILGlCQUFqQjtBQUNJLFFBQUEsSUFBSSxFQUFFQyxXQURWO0FBRUksUUFBQSxLQUFLLEVBQUUsRUFGWDtBQUdJLFFBQUEsTUFBTSxFQUFFO0FBSFosUUFESixFQU1NLHlCQUFHLG9EQUFILEVBQXlEO0FBQ3ZEMUQsUUFBQUEsT0FBTyxFQUFFMEQsV0FBVyxJQUFJLHlCQUFHLFNBQUg7QUFEK0IsT0FBekQsQ0FOTixDQURKLGVBV0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLDZCQUFDLHlCQUFEO0FBQWtCLFFBQUEsU0FBUyxFQUFDLGtEQUE1QjtBQUNJLFFBQUEsT0FBTyxFQUFFLEtBQUtDO0FBRGxCLFNBR00seUJBQUcsUUFBSCxDQUhOLENBREosZUFNSSw2QkFBQyx5QkFBRDtBQUFrQixRQUFBLFNBQVMsRUFBQyxrREFBNUI7QUFDSSxRQUFBLE9BQU8sRUFBRSxLQUFLQztBQURsQixTQUdNLHlCQUFHLFNBQUgsQ0FITixDQU5KLENBWEosQ0FERyxDQUFQO0FBMEJIOztBQUVELFFBQUlDLCtCQUFKO0FBQ0EsUUFBSUMsNEJBQUo7QUFDQSxRQUFJQyx1QkFBSjtBQUNBLFFBQUlDLG9CQUFKO0FBQ0EsUUFBSUMsdUJBQUosQ0F0RG9CLENBd0RwQjs7QUFDQSxRQUFJLENBQUMsQ0FBQ2pKLEtBQUQsSUFBVUEsS0FBSyxDQUFDRSxZQUFOLEtBQXVCLE9BQWxDLEtBQ0EsS0FBS3lCLEtBQUwsQ0FBVzNDLE9BRFgsSUFFQSxLQUFLMkMsS0FBTCxDQUFXM0MsT0FBWCxDQUFtQmpHLE9BRm5CLElBR0FtUSxPQUFPLENBQUMsS0FBS3ZILEtBQUwsQ0FBVzNDLE9BQVgsQ0FBbUJqRyxPQUFuQixDQUEyQitJLGtCQUE1QixDQUhYLEVBSUU7QUFDRWtILE1BQUFBLG9CQUFvQixHQUFHLHlCQUFHLHFCQUFILENBQXZCO0FBQ0FDLE1BQUFBLHVCQUF1QixHQUFHLEtBQUtFLFlBQS9CO0FBRUFMLE1BQUFBLDRCQUE0QixHQUFHLHlCQUEvQjtBQUNBRCxNQUFBQSwrQkFBK0IsR0FBRyxzQ0FBbEM7QUFDSCxLQVZELE1BVU8sSUFDSDdJLEtBQUssSUFDTEEsS0FBSyxDQUFDRSxZQUFOLEtBQXVCLE1BRHZCLElBRUEsS0FBS3lCLEtBQUwsQ0FBVy9GLE9BSFIsRUFJTDtBQUNFb04sTUFBQUEsb0JBQW9CLEdBQUcseUJBQUcsc0JBQUgsQ0FBdkI7QUFDQUMsTUFBQUEsdUJBQXVCLEdBQUcsS0FBS0csYUFBL0I7QUFDQUwsTUFBQUEsdUJBQXVCLEdBQUcsS0FBS3BILEtBQUwsQ0FBV3pDLGdCQUFYLEdBQ3RCLHlCQUFHLDRDQUFILENBRHNCLEdBRXRCLHlCQUFHLG9DQUFILENBRko7QUFJQTRKLE1BQUFBLDRCQUE0QixHQUFHO0FBQzNCLG9DQUE0QixJQUREO0FBRTNCLDJDQUFtQyxLQUFLbkgsS0FBTCxDQUFXekM7QUFGbkIsT0FBL0I7QUFJQTJKLE1BQUFBLCtCQUErQixHQUFHLHVDQUFsQztBQUNILEtBaEJNLE1BZ0JBO0FBQ0gsYUFBTyxJQUFQO0FBQ0g7O0FBRUQsVUFBTVEsdUJBQXVCLEdBQUcseUJBQVcsQ0FDdkMsMEJBRHVDLEVBRXZDLHlCQUZ1QyxDQUFYLEVBSTVCUCw0QkFKNEIsQ0FBaEM7QUFPQSxVQUFNUSwwQkFBMEIsR0FBRyx5QkFDL0IsZ0NBRCtCLEVBRS9CVCwrQkFGK0IsQ0FBbkM7QUFLQSx3QkFBTztBQUFLLE1BQUEsU0FBUyxFQUFFUztBQUFoQixvQkFDSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FFTSxLQUFLM0gsS0FBTCxDQUFXbkMsY0FBWCxnQkFBNEIsNkJBQUMsT0FBRCxPQUE1QixnQkFBMEMseUNBRmhELGVBR0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLDZCQUFDLHlCQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUU2Six1QkFEZjtBQUVJLE1BQUEsT0FBTyxFQUFFSix1QkFGYjtBQUdJLE1BQUEsS0FBSyxFQUFFRjtBQUhYLE9BS01DLG9CQUxOLENBREosQ0FISixDQURHLENBQVA7QUFlSDs7QUFFRHZDLEVBQUFBLGdCQUFnQixHQUFHO0FBQ2YsVUFBTThDLGFBQWEsR0FBR3pQLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix3QkFBakIsQ0FBdEI7QUFDQSxXQUFPLEtBQUs0SCxLQUFMLENBQVcvRixPQUFYLGdCQUFxQix1REFDeEIseUNBQ00seUJBQUcsOEJBQUgsQ0FETixFQUVNLEtBQUsrRixLQUFMLENBQVc2SCxvQkFBWCxnQkFDRSw2QkFBQyxhQUFELE9BREYsZ0JBQ3NCLHlDQUg1QixDQUR3QixlQU94Qix1REFDSSx5REFDSTtBQUFPLE1BQUEsSUFBSSxFQUFDLE9BQVo7QUFDSSxNQUFBLEtBQUssRUFBRTFLLHVCQURYO0FBRUksTUFBQSxPQUFPLEVBQUUsS0FBSzZDLEtBQUwsQ0FBV0MsWUFBWCxDQUF3QkMsVUFBeEIsS0FBdUMvQyx1QkFGcEQ7QUFHSSxNQUFBLFFBQVEsRUFBRSxLQUFLMks7QUFIbkIsTUFESixlQU1JO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNNLHlCQUFHLG1DQUFILENBRE4sQ0FOSixDQURKLENBUHdCLGVBbUJ4Qix1REFDSSx5REFDSTtBQUFPLE1BQUEsSUFBSSxFQUFDLE9BQVo7QUFDSSxNQUFBLEtBQUssRUFBRTVLLHFCQURYO0FBRUksTUFBQSxPQUFPLEVBQUUsS0FBSzhDLEtBQUwsQ0FBV0MsWUFBWCxDQUF3QkMsVUFBeEIsS0FBdUNoRCxxQkFGcEQ7QUFHSSxNQUFBLFFBQVEsRUFBRSxLQUFLNEs7QUFIbkIsTUFESixlQU1JO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNNLHlCQUFHLFVBQUgsQ0FETixDQU5KLENBREosQ0FuQndCLENBQXJCLEdBK0JFLElBL0JUO0FBZ0NIOztBQUVEL0MsRUFBQUEsdUJBQXVCLEdBQUc7QUFDdEIsVUFBTTFILE9BQU8sR0FBRyxLQUFLMkMsS0FBTCxDQUFXM0MsT0FBM0I7QUFDQSxRQUFJN0UsV0FBVyxHQUFHLElBQWxCOztBQUNBLFFBQUk2RSxPQUFPLENBQUNqRyxPQUFSLElBQW1CaUcsT0FBTyxDQUFDakcsT0FBUixDQUFnQndKLGdCQUF2QyxFQUF5RDtBQUNyRHBJLE1BQUFBLFdBQVcsR0FBRyxrQ0FBa0I2RSxPQUFPLENBQUNqRyxPQUFSLENBQWdCd0osZ0JBQWxDLENBQWQ7QUFDSCxLQUZELE1BRU8sSUFBSSxLQUFLWixLQUFMLENBQVd6QyxnQkFBZixFQUFpQztBQUNwQy9FLE1BQUFBLFdBQVcsZ0JBQUc7QUFDVixRQUFBLFNBQVMsRUFBQyxvQ0FEQTtBQUVWLFFBQUEsT0FBTyxFQUFFLEtBQUtvSDtBQUZKLFNBSVIseUJBQ0UsbUdBQ0EsOENBRkYsRUFHRSxFQUhGLEVBSUU7QUFBRSwyQkFBTTtBQUFSLE9BSkYsQ0FKUSxDQUFkO0FBV0g7O0FBQ0QsVUFBTW1JLHVCQUF1QixHQUFHLHlCQUFXO0FBQ3ZDLGdDQUEwQixJQURhO0FBRXZDLHlDQUFtQyxDQUFDLEtBQUsvSCxLQUFMLENBQVd6QztBQUZSLEtBQVgsQ0FBaEM7QUFLQSxXQUFPLEtBQUt5QyxLQUFMLENBQVcvRixPQUFYLGdCQUNIO0FBQUssTUFBQSxTQUFTLEVBQUU4TjtBQUFoQixvQkFDSSw4Q0FBTyx5QkFBRyx5QkFBSCxDQUFQLE1BREosZUFFSTtBQUNJLE1BQUEsS0FBSyxFQUFFLEtBQUsvSCxLQUFMLENBQVdILFdBQVgsQ0FBdUJlLGdCQURsQztBQUVJLE1BQUEsV0FBVyxFQUFFLHlCQUFHL0oscUJBQUgsQ0FGakI7QUFHSSxNQUFBLFFBQVEsRUFBRSxLQUFLbVIsaUJBSG5CO0FBSUksTUFBQSxRQUFRLEVBQUMsR0FKYjtBQUtJLE1BQUEsR0FBRyxFQUFDO0FBTFIsTUFGSixDQURHLGdCQVdIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNNeFAsV0FETixDQVhKO0FBY0g7O0FBRURzQixFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNbU8sV0FBVyxHQUFHOVAsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUFwQjtBQUNBLFVBQU0rTSxPQUFPLEdBQUdoTixHQUFHLENBQUNDLFlBQUosQ0FBaUIsa0JBQWpCLENBQWhCOztBQUVBLFFBQUksS0FBSzRILEtBQUwsQ0FBV25CLGNBQVgsSUFBNkIsS0FBS21CLEtBQUwsQ0FBVzNFLEtBQVgsS0FBcUIsSUFBbEQsSUFBMEQsS0FBSzJFLEtBQUwsQ0FBV3RDLE1BQXpFLEVBQWlGO0FBQzdFLDBCQUFPLDZCQUFDLE9BQUQsT0FBUDtBQUNILEtBRkQsTUFFTyxJQUFJLEtBQUtzQyxLQUFMLENBQVczQyxPQUFYLElBQXNCLENBQUMsS0FBSzJDLEtBQUwsQ0FBVzNFLEtBQXRDLEVBQTZDO0FBQ2hELFlBQU1nQyxPQUFPLEdBQUcsS0FBSzJDLEtBQUwsQ0FBVzNDLE9BQTNCO0FBRUEsVUFBSTZLLFVBQUo7QUFDQSxVQUFJQyxRQUFKO0FBQ0EsVUFBSUMsYUFBSjtBQUNBLFlBQU1DLFlBQVksR0FBRyxFQUFyQjs7QUFDQSxVQUFJLEtBQUtySSxLQUFMLENBQVcvRixPQUFYLElBQXNCLEtBQUsrRixLQUFMLENBQVd6QyxnQkFBckMsRUFBdUQ7QUFDbkQsWUFBSStLLFdBQUo7O0FBQ0EsWUFBSSxLQUFLdEksS0FBTCxDQUFXckMsZUFBZixFQUFnQztBQUM1QjJLLFVBQUFBLFdBQVcsZ0JBQUcsNkJBQUMsT0FBRCxPQUFkO0FBQ0gsU0FGRCxNQUVPO0FBQ0gsZ0JBQU1MLFdBQVcsR0FBRzlQLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixxQkFBakIsQ0FBcEI7QUFDQWtRLFVBQUFBLFdBQVcsZ0JBQUcsNkJBQUMsV0FBRDtBQUFhLFlBQUEsT0FBTyxFQUFFLEtBQUt4UCxLQUFMLENBQVdELE9BQWpDO0FBQ1YsWUFBQSxTQUFTLEVBQUUsS0FBS21ILEtBQUwsQ0FBV0gsV0FBWCxDQUF1QnhJLElBRHhCO0FBRVYsWUFBQSxjQUFjLEVBQUUsS0FBSzJJLEtBQUwsQ0FBV0gsV0FBWCxDQUF1QnZJLFVBRjdCO0FBR1YsWUFBQSxLQUFLLEVBQUUsRUFIRztBQUdDLFlBQUEsTUFBTSxFQUFFLEVBSFQ7QUFHYSxZQUFBLFlBQVksRUFBQztBQUgxQixZQUFkO0FBS0g7O0FBRUQ0USxRQUFBQSxVQUFVLGdCQUNOO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZix3QkFDSTtBQUFPLFVBQUEsT0FBTyxFQUFDLGFBQWY7QUFBNkIsVUFBQSxTQUFTLEVBQUM7QUFBdkMsV0FDTUksV0FETixDQURKLGVBSUk7QUFBSyxVQUFBLFNBQVMsRUFBQztBQUFmLHdCQUNJO0FBQU8sVUFBQSxPQUFPLEVBQUMsYUFBZjtBQUE2QixVQUFBLFNBQVMsRUFBQztBQUF2Qyx3QkFDSTtBQUFLLFVBQUEsR0FBRyxFQUFFbk8sT0FBTyxDQUFDLDZCQUFELENBQWpCO0FBQ0ksVUFBQSxHQUFHLEVBQUUseUJBQUcsZUFBSCxDQURUO0FBQzhCLFVBQUEsS0FBSyxFQUFFLHlCQUFHLGVBQUgsQ0FEckM7QUFFSSxVQUFBLEtBQUssRUFBQyxJQUZWO0FBRWUsVUFBQSxNQUFNLEVBQUM7QUFGdEIsVUFESixDQURKLGVBTUk7QUFBTyxVQUFBLEVBQUUsRUFBQyxhQUFWO0FBQXdCLFVBQUEsU0FBUyxFQUFDLDBCQUFsQztBQUE2RCxVQUFBLElBQUksRUFBQyxNQUFsRTtBQUF5RSxVQUFBLFFBQVEsRUFBRSxLQUFLb087QUFBeEYsVUFOSixDQUpKLENBREo7QUFnQkEsY0FBTUMsWUFBWSxHQUFHclEsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHVCQUFqQixDQUFyQjtBQUVBK1AsUUFBQUEsUUFBUSxnQkFBRyw2QkFBQyxZQUFEO0FBQ1AsVUFBQSxTQUFTLEVBQUMsdUJBREg7QUFFUCxVQUFBLG9CQUFvQixFQUFDLDBCQUZkO0FBR1AsVUFBQSxXQUFXLEVBQUUseUJBQUcsZ0JBQUgsQ0FITjtBQUlQLFVBQUEsWUFBWSxFQUFFLEtBSlA7QUFLUCxVQUFBLFlBQVksRUFBRSxLQUFLbkksS0FBTCxDQUFXSCxXQUFYLENBQXVCeEksSUFMOUI7QUFNUCxVQUFBLGNBQWMsRUFBRSxLQUFLb1IsYUFOZDtBQU9QLFVBQUEsUUFBUSxFQUFDLEdBUEY7QUFRUCxVQUFBLEdBQUcsRUFBQztBQVJHLFVBQVg7QUFVQUwsUUFBQUEsYUFBYSxnQkFBRyw2QkFBQyxZQUFEO0FBQ1osVUFBQSxTQUFTLEVBQUMsdUJBREU7QUFFWixVQUFBLG9CQUFvQixFQUFDLDBCQUZUO0FBR1osVUFBQSxXQUFXLEVBQUUseUJBQUcsYUFBSCxDQUhEO0FBSVosVUFBQSxZQUFZLEVBQUUsS0FKRjtBQUtaLFVBQUEsWUFBWSxFQUFFLEtBQUtwSSxLQUFMLENBQVdILFdBQVgsQ0FBdUJjLGlCQUx6QjtBQU1aLFVBQUEsY0FBYyxFQUFFLEtBQUsrSCxrQkFOVDtBQU9aLFVBQUEsUUFBUSxFQUFDLEdBUEc7QUFRWixVQUFBLEdBQUcsRUFBQztBQVJRLFVBQWhCO0FBU0gsT0FsREQsTUFrRE87QUFDSCxjQUFNQyxzQkFBc0IsR0FBRyxLQUFLM0ksS0FBTCxDQUFXWixZQUFYLEdBQTBCLEtBQUtRLFlBQS9CLEdBQThDLElBQTdFO0FBQ0EsY0FBTWdKLGNBQWMsR0FBR3ZMLE9BQU8sQ0FBQ2pHLE9BQVIsR0FBa0JpRyxPQUFPLENBQUNqRyxPQUFSLENBQWdCRSxVQUFsQyxHQUErQyxJQUF0RTtBQUNBLGNBQU02SyxTQUFTLEdBQUc5RSxPQUFPLENBQUNqRyxPQUFSLEdBQWtCaUcsT0FBTyxDQUFDakcsT0FBUixDQUFnQkMsSUFBbEMsR0FBeUMsSUFBM0Q7QUFDQTZRLFFBQUFBLFVBQVUsZ0JBQUcsNkJBQUMsV0FBRDtBQUNULFVBQUEsT0FBTyxFQUFFLEtBQUtwUCxLQUFMLENBQVdELE9BRFg7QUFFVCxVQUFBLGNBQWMsRUFBRStQLGNBRlA7QUFHVCxVQUFBLFNBQVMsRUFBRXpHLFNBSEY7QUFJVCxVQUFBLE9BQU8sRUFBRXdHLHNCQUpBO0FBS1QsVUFBQSxLQUFLLEVBQUUsRUFMRTtBQUtFLFVBQUEsTUFBTSxFQUFFO0FBTFYsVUFBYjs7QUFPQSxZQUFJdEwsT0FBTyxDQUFDakcsT0FBUixJQUFtQmlHLE9BQU8sQ0FBQ2pHLE9BQVIsQ0FBZ0JDLElBQXZDLEVBQTZDO0FBQ3pDOFEsVUFBQUEsUUFBUSxnQkFBRztBQUFLLFlBQUEsT0FBTyxFQUFFUTtBQUFkLDBCQUNQLDJDQUFRdEwsT0FBTyxDQUFDakcsT0FBUixDQUFnQkMsSUFBeEIsQ0FETyxlQUVQO0FBQU0sWUFBQSxTQUFTLEVBQUM7QUFBaEIsa0JBQ08sS0FBS3lCLEtBQUwsQ0FBV0QsT0FEbEIsTUFGTyxDQUFYO0FBTUgsU0FQRCxNQU9PO0FBQ0hzUCxVQUFBQSxRQUFRLGdCQUFHO0FBQU0sWUFBQSxPQUFPLEVBQUVRO0FBQWYsYUFBeUMsS0FBSzdQLEtBQUwsQ0FBV0QsT0FBcEQsQ0FBWDtBQUNIOztBQUNELFlBQUl3RSxPQUFPLENBQUNqRyxPQUFSLElBQW1CaUcsT0FBTyxDQUFDakcsT0FBUixDQUFnQnVKLGlCQUF2QyxFQUEwRDtBQUN0RHlILFVBQUFBLGFBQWEsZ0JBQUc7QUFBTSxZQUFBLE9BQU8sRUFBRU87QUFBZixhQUF5Q3RMLE9BQU8sQ0FBQ2pHLE9BQVIsQ0FBZ0J1SixpQkFBekQsQ0FBaEI7QUFDSDtBQUNKOztBQUVELFVBQUksS0FBS1gsS0FBTCxDQUFXL0YsT0FBZixFQUF3QjtBQUNwQm9PLFFBQUFBLFlBQVksQ0FBQzVPLElBQWIsZUFDSSw2QkFBQyx5QkFBRDtBQUFrQixVQUFBLFNBQVMsRUFBQyxrREFBNUI7QUFDSSxVQUFBLEdBQUcsRUFBQyxhQURSO0FBRUksVUFBQSxPQUFPLEVBQUUsS0FBS29QO0FBRmxCLFdBSU0seUJBQUcsTUFBSCxDQUpOLENBREo7QUFRQVIsUUFBQUEsWUFBWSxDQUFDNU8sSUFBYixlQUNJLDZCQUFDLHlCQUFEO0FBQWtCLFVBQUEsU0FBUyxFQUFDLDRCQUE1QjtBQUNJLFVBQUEsR0FBRyxFQUFDLGVBRFI7QUFFSSxVQUFBLE9BQU8sRUFBRSxLQUFLcVA7QUFGbEIsd0JBSUk7QUFBSyxVQUFBLEdBQUcsRUFBRTNPLE9BQU8sQ0FBQyw2QkFBRCxDQUFqQjtBQUFrRCxVQUFBLFNBQVMsRUFBQyxvQkFBNUQ7QUFDSSxVQUFBLEtBQUssRUFBQyxJQURWO0FBQ2UsVUFBQSxNQUFNLEVBQUMsSUFEdEI7QUFDMkIsVUFBQSxHQUFHLEVBQUUseUJBQUcsUUFBSDtBQURoQyxVQUpKLENBREo7QUFTSCxPQWxCRCxNQWtCTztBQUNILFlBQUlrRCxPQUFPLENBQUMwTCxJQUFSLElBQWdCMUwsT0FBTyxDQUFDMEwsSUFBUixDQUFhQyxVQUFiLEtBQTRCLE1BQWhELEVBQXdEO0FBQ3BEWCxVQUFBQSxZQUFZLENBQUM1TyxJQUFiLGVBQ0ksNkJBQUMseUJBQUQ7QUFBa0IsWUFBQSxTQUFTLEVBQUMsaURBQTVCO0FBQ0ksWUFBQSxHQUFHLEVBQUMsYUFEUjtBQUVJLFlBQUEsT0FBTyxFQUFFLEtBQUttRyxZQUZsQjtBQUdJLFlBQUEsS0FBSyxFQUFFLHlCQUFHLG9CQUFIO0FBSFgsWUFESjtBQVFIOztBQUNEeUksUUFBQUEsWUFBWSxDQUFDNU8sSUFBYixlQUNJLDZCQUFDLHlCQUFEO0FBQWtCLFVBQUEsU0FBUyxFQUFDLGtEQUE1QjtBQUNJLFVBQUEsR0FBRyxFQUFDLGNBRFI7QUFFSSxVQUFBLE9BQU8sRUFBRSxLQUFLd1AsYUFGbEI7QUFHSSxVQUFBLEtBQUssRUFBRSx5QkFBRyxpQkFBSDtBQUhYLFVBREo7QUFRSDs7QUFFRCxZQUFNQyxVQUFVLEdBQUcsS0FBS2xKLEtBQUwsQ0FBV2hDLGNBQVgsZ0JBQTRCLDZCQUFDLG1CQUFEO0FBQVksUUFBQSxPQUFPLEVBQUUsS0FBS2xGLEtBQUwsQ0FBV0Q7QUFBaEMsUUFBNUIsR0FBMEVpTixTQUE3RjtBQUVBLFlBQU1xRCxhQUFhLEdBQUc7QUFDbEIsK0JBQXVCLElBREw7QUFFbEIsdUJBQWUsSUFGRztBQUdsQixvQ0FBNEIsQ0FBQyxLQUFLbkosS0FBTCxDQUFXL0YsT0FIdEI7QUFJbEIsNENBQW9DLEtBQUsrRixLQUFMLENBQVdaO0FBSjdCLE9BQXRCO0FBT0EsMEJBQ0k7QUFBTSxRQUFBLFNBQVMsRUFBQztBQUFoQixzQkFDSTtBQUFLLFFBQUEsU0FBUyxFQUFFLHlCQUFXK0osYUFBWDtBQUFoQixzQkFDSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQ01qQixVQUROLENBREosZUFJSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQ01DLFFBRE4sQ0FESixlQUlJO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUNNQyxhQUROLENBSkosQ0FKSixDQURKLGVBY0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQ01DLFlBRE4sQ0FkSixlQWlCSSw2QkFBQywyQkFBRCxPQWpCSixDQURKLGVBb0JJLDZCQUFDLGtCQUFEO0FBQVcsUUFBQSxLQUFLLEVBQUVhLFVBQWxCO0FBQThCLFFBQUEsY0FBYyxFQUFFLEtBQUtwUSxLQUFMLENBQVdzUTtBQUF6RCxzQkFDSSw2QkFBQywwQkFBRDtBQUFtQixRQUFBLFNBQVMsRUFBQztBQUE3QixTQUNNLEtBQUt2QyxxQkFBTCxFQUROLEVBRU0sS0FBS3ZDLGdCQUFMLEVBRk4sQ0FESixDQXBCSixDQURKO0FBNkJILEtBaEtNLE1BZ0tBLElBQUksS0FBS3RFLEtBQUwsQ0FBVzNFLEtBQWYsRUFBc0I7QUFDekIsVUFBSSxLQUFLMkUsS0FBTCxDQUFXM0UsS0FBWCxDQUFpQmdPLFVBQWpCLEtBQWdDLEdBQXBDLEVBQXlDO0FBQ3JDLDRCQUNJO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZixXQUNNLHlCQUFHLGlDQUFILEVBQXNDO0FBQUN4USxVQUFBQSxPQUFPLEVBQUUsS0FBS0MsS0FBTCxDQUFXRDtBQUFyQixTQUF0QyxDQUROLENBREo7QUFLSCxPQU5ELE1BTU87QUFDSCxZQUFJeVEsU0FBSjs7QUFDQSxZQUFJLEtBQUt0SixLQUFMLENBQVczRSxLQUFYLENBQWlCd0ksT0FBakIsS0FBNkIsZ0JBQWpDLEVBQW1EO0FBQy9DeUYsVUFBQUEsU0FBUyxnQkFBRywwQ0FBTyx5QkFBRyw4Q0FBSCxDQUFQLENBQVo7QUFDSDs7QUFDRCw0QkFDSTtBQUFLLFVBQUEsU0FBUyxFQUFDO0FBQWYsV0FDTSx5QkFBRyw0QkFBSCxFQUFpQztBQUFDelEsVUFBQUEsT0FBTyxFQUFFLEtBQUtDLEtBQUwsQ0FBV0Q7QUFBckIsU0FBakMsQ0FETixFQUVNeVEsU0FGTixDQURKO0FBTUg7QUFDSixLQW5CTSxNQW1CQTtBQUNIbE8sTUFBQUEsT0FBTyxDQUFDQyxLQUFSLENBQWMsNkJBQWQ7QUFDQSwwQkFBTyx5Q0FBUDtBQUNIO0FBQ0o7O0FBNTdCa0Q7Ozs4QkFBbEMrQixTLGVBQ0U7QUFDZnZFLEVBQUFBLE9BQU8sRUFBRTlCLG1CQUFVRyxNQUFWLENBQWlCQyxVQURYO0FBRWY7QUFDQXdJLEVBQUFBLFVBQVUsRUFBRTVJLG1CQUFVMkQ7QUFIUCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkLlxuQ29weXJpZ2h0IDIwMTcsIDIwMTggTmV3IFZlY3RvciBMdGQuXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vaW5kZXgnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgZ2V0SG9zdGluZ0xpbmsgfSBmcm9tICcuLi8uLi91dGlscy9Ib3N0aW5nTGluayc7XG5pbXBvcnQgeyBzYW5pdGl6ZWRIdG1sTm9kZSB9IGZyb20gJy4uLy4uL0h0bWxVdGlscyc7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IEdyb3VwSGVhZGVyQnV0dG9ucyBmcm9tICcuLi92aWV3cy9yaWdodF9wYW5lbC9Hcm91cEhlYWRlckJ1dHRvbnMnO1xuaW1wb3J0IE1haW5TcGxpdCBmcm9tICcuL01haW5TcGxpdCc7XG5pbXBvcnQgUmlnaHRQYW5lbCBmcm9tICcuL1JpZ2h0UGFuZWwnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uL01vZGFsJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQgR3JvdXBTdG9yZSBmcm9tICcuLi8uLi9zdG9yZXMvR3JvdXBTdG9yZSc7XG5pbXBvcnQgRmxhaXJTdG9yZSBmcm9tICcuLi8uLi9zdG9yZXMvRmxhaXJTdG9yZSc7XG5pbXBvcnQgeyBzaG93R3JvdXBBZGRSb29tRGlhbG9nIH0gZnJvbSAnLi4vLi4vR3JvdXBBZGRyZXNzUGlja2VyJztcbmltcG9ydCB7bWFrZUdyb3VwUGVybWFsaW5rLCBtYWtlVXNlclBlcm1hbGlua30gZnJvbSBcIi4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IHtHcm91cH0gZnJvbSBcIm1hdHJpeC1qcy1zZGtcIjtcbmltcG9ydCB7YWxsU2V0dGxlZCwgc2xlZXB9IGZyb20gXCIuLi8uLi91dGlscy9wcm9taXNlXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlXCI7XG5pbXBvcnQgQXV0b0hpZGVTY3JvbGxiYXIgZnJvbSBcIi4vQXV0b0hpZGVTY3JvbGxiYXJcIjtcblxuY29uc3QgTE9OR19ERVNDX1BMQUNFSE9MREVSID0gX3RkKFxuYDxoMT5IVE1MIGZvciB5b3VyIGNvbW11bml0eSdzIHBhZ2U8L2gxPlxuPHA+XG4gICAgVXNlIHRoZSBsb25nIGRlc2NyaXB0aW9uIHRvIGludHJvZHVjZSBuZXcgbWVtYmVycyB0byB0aGUgY29tbXVuaXR5LCBvciBkaXN0cmlidXRlXG4gICAgc29tZSBpbXBvcnRhbnQgPGEgaHJlZj1cImZvb1wiPmxpbmtzPC9hPlxuPC9wPlxuPHA+XG4gICAgWW91IGNhbiBldmVuIGFkZCBpbWFnZXMgd2l0aCBNYXRyaXggVVJMcyA8aW1nIHNyYz1cIm14YzovL3VybFwiIC8+XG48L3A+XG5gKTtcblxuY29uc3QgUm9vbVN1bW1hcnlUeXBlID0gUHJvcFR5cGVzLnNoYXBlKHtcbiAgICByb29tX2lkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgcHJvZmlsZTogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgYXZhdGFyX3VybDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgY2Fub25pY2FsX2FsaWFzOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIH0pLmlzUmVxdWlyZWQsXG59KTtcblxuY29uc3QgVXNlclN1bW1hcnlUeXBlID0gUHJvcFR5cGVzLnNoYXBlKHtcbiAgICBzdW1tYXJ5SW5mbzogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgdXNlcl9pZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICByb2xlX2lkOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBhdmF0YXJfdXJsOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBkaXNwbGF5bmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB9KS5pc1JlcXVpcmVkLFxufSk7XG5cbmNsYXNzIENhdGVnb3J5Um9vbUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb21zOiBQcm9wVHlwZXMuYXJyYXlPZihSb29tU3VtbWFyeVR5cGUpLmlzUmVxdWlyZWQsXG4gICAgICAgIGNhdGVnb3J5OiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgICAgICAgcHJvZmlsZTogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgfSkuaXNSZXF1aXJlZCxcbiAgICAgICAgfSksXG4gICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblxuICAgICAgICAvLyBXaGV0aGVyIHRoZSBsaXN0IHNob3VsZCBiZSBlZGl0YWJsZVxuICAgICAgICBlZGl0aW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBvbkFkZFJvb21zVG9TdW1tYXJ5Q2xpY2tlZCA9IChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBBZGRyZXNzUGlja2VyRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuQWRkcmVzc1BpY2tlckRpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQWRkIFJvb21zIHRvIEdyb3VwIFN1bW1hcnknLCAnJywgQWRkcmVzc1BpY2tlckRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KCdBZGQgcm9vbXMgdG8gdGhlIGNvbW11bml0eSBzdW1tYXJ5JyksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJXaGljaCByb29tcyB3b3VsZCB5b3UgbGlrZSB0byBhZGQgdG8gdGhpcyBzdW1tYXJ5P1wiKSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBfdChcIlJvb20gbmFtZSBvciBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIkFkZCB0byBzdW1tYXJ5XCIpLFxuICAgICAgICAgICAgcGlja2VyVHlwZTogJ3Jvb20nLFxuICAgICAgICAgICAgdmFsaWRBZGRyZXNzVHlwZXM6IFsnbXgtcm9vbS1pZCddLFxuICAgICAgICAgICAgZ3JvdXBJZDogdGhpcy5wcm9wcy5ncm91cElkLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKHN1Y2Nlc3MsIGFkZHJzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdWNjZXNzKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgYWxsU2V0dGxlZChhZGRycy5tYXAoKGFkZHIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEdyb3VwU3RvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRSb29tVG9Hcm91cFN1bW1hcnkodGhpcy5wcm9wcy5ncm91cElkLCBhZGRyLmFkZHJlc3MpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4geyBlcnJvckxpc3QucHVzaChhZGRyLmFkZHJlc3MpOyB9KTtcbiAgICAgICAgICAgICAgICB9KSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvckxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gYWRkIHRoZSBmb2xsb3dpbmcgcm9vbSB0byB0aGUgZ3JvdXAgc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnJywgRXJyb3JEaWFsb2csXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byBhZGQgdGhlIGZvbGxvd2luZyByb29tcyB0byB0aGUgc3VtbWFyeSBvZiAlKGdyb3VwSWQpczpcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Z3JvdXBJZDogdGhpcy5wcm9wcy5ncm91cElkfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyb3JMaXN0LmpvaW4oXCIsIFwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LCAvKmNsYXNzTmFtZT0qL251bGwsIC8qaXNQcmlvcml0eT0qL2ZhbHNlLCAvKmlzU3RhdGljPSovdHJ1ZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgVGludGFibGVTdmcgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVGludGFibGVTdmdcIik7XG4gICAgICAgIGNvbnN0IGFkZEJ1dHRvbiA9IHRoaXMucHJvcHMuZWRpdGluZyA/XG4gICAgICAgICAgICAoPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2FkZEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkFkZFJvb21zVG9TdW1tYXJ5Q2xpY2tlZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8VGludGFibGVTdmcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9pY29ucy1jcmVhdGUtcm9vbS5zdmdcIil9IHdpZHRoPVwiNjRcIiBoZWlnaHQ9XCI2NFwiIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ3NfYWRkQnV0dG9uX2xhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ0FkZCBhIFJvb20nKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+KSA6IDxkaXYgLz47XG5cbiAgICAgICAgY29uc3Qgcm9vbU5vZGVzID0gdGhpcy5wcm9wcy5yb29tcy5tYXAoKHIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiA8RmVhdHVyZWRSb29tXG4gICAgICAgICAgICAgICAga2V5PXtyLnJvb21faWR9XG4gICAgICAgICAgICAgICAgZ3JvdXBJZD17dGhpcy5wcm9wcy5ncm91cElkfVxuICAgICAgICAgICAgICAgIGVkaXRpbmc9e3RoaXMucHJvcHMuZWRpdGluZ31cbiAgICAgICAgICAgICAgICBzdW1tYXJ5SW5mbz17cn0gLz47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBjYXRIZWFkZXIgPSA8ZGl2IC8+O1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jYXRlZ29yeSAmJiB0aGlzLnByb3BzLmNhdGVnb3J5LnByb2ZpbGUpIHtcbiAgICAgICAgICAgIGNhdEhlYWRlciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2NhdGVnb3J5XCI+XG4gICAgICAgICAgICB7IHRoaXMucHJvcHMuY2F0ZWdvcnkucHJvZmlsZS5uYW1lIH1cbiAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nc19jb250YWluZXJcIj5cbiAgICAgICAgICAgIHsgY2F0SGVhZGVyIH1cbiAgICAgICAgICAgIHsgcm9vbU5vZGVzIH1cbiAgICAgICAgICAgIHsgYWRkQnV0dG9uIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuY2xhc3MgRmVhdHVyZWRSb29tIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBzdW1tYXJ5SW5mbzogUm9vbVN1bW1hcnlUeXBlLmlzUmVxdWlyZWQsXG4gICAgICAgIGVkaXRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgb25DbGljayA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgIHJvb21fYWxpYXM6IHRoaXMucHJvcHMuc3VtbWFyeUluZm8ucHJvZmlsZS5jYW5vbmljYWxfYWxpYXMsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnJvb21faWQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbkRlbGV0ZUNsaWNrZWQgPSAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIEdyb3VwU3RvcmUucmVtb3ZlUm9vbUZyb21Hcm91cFN1bW1hcnkoXG4gICAgICAgICAgICB0aGlzLnByb3BzLmdyb3VwSWQsXG4gICAgICAgICAgICB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnJvb21faWQsXG4gICAgICAgICkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd2hpbHN0IHJlbW92aW5nIHJvb20gZnJvbSBncm91cCBzdW1tYXJ5JywgZXJyKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb21OYW1lID0gdGhpcy5wcm9wcy5zdW1tYXJ5SW5mby5uYW1lIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zdW1tYXJ5SW5mby5jYW5vbmljYWxfYWxpYXMgfHxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnJvb21faWQ7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcbiAgICAgICAgICAgICAgICAnRmFpbGVkIHRvIHJlbW92ZSByb29tIGZyb20gZ3JvdXAgc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJycsIEVycm9yRGlhbG9nLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJGYWlsZWQgdG8gcmVtb3ZlIHRoZSByb29tIGZyb20gdGhlIHN1bW1hcnkgb2YgJShncm91cElkKXNcIixcbiAgICAgICAgICAgICAgICAgICAge2dyb3VwSWQ6IHRoaXMucHJvcHMuZ3JvdXBJZH0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJUaGUgcm9vbSAnJShyb29tTmFtZSlzJyBjb3VsZCBub3QgYmUgcmVtb3ZlZCBmcm9tIHRoZSBzdW1tYXJ5LlwiLCB7cm9vbU5hbWV9KSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBSb29tQXZhdGFyID0gc2RrLmdldENvbXBvbmVudChcImF2YXRhcnMuUm9vbUF2YXRhclwiKTtcblxuICAgICAgICBjb25zdCByb29tTmFtZSA9IHRoaXMucHJvcHMuc3VtbWFyeUluZm8ucHJvZmlsZS5uYW1lIHx8XG4gICAgICAgICAgICB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnByb2ZpbGUuY2Fub25pY2FsX2FsaWFzIHx8XG4gICAgICAgICAgICBfdChcIlVubmFtZWQgUm9vbVwiKTtcblxuICAgICAgICBjb25zdCBvb2JEYXRhID0ge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnJvb21faWQsXG4gICAgICAgICAgICBhdmF0YXJVcmw6IHRoaXMucHJvcHMuc3VtbWFyeUluZm8ucHJvZmlsZS5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgbmFtZTogcm9vbU5hbWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHBlcm1hbGluayA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnByb2ZpbGUgJiYgdGhpcy5wcm9wcy5zdW1tYXJ5SW5mby5wcm9maWxlLmNhbm9uaWNhbF9hbGlhcykge1xuICAgICAgICAgICAgcGVybWFsaW5rID0gbWFrZUdyb3VwUGVybWFsaW5rKHRoaXMucHJvcHMuc3VtbWFyeUluZm8ucHJvZmlsZS5jYW5vbmljYWxfYWxpYXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJvb21OYW1lTm9kZSA9IG51bGw7XG4gICAgICAgIGlmIChwZXJtYWxpbmspIHtcbiAgICAgICAgICAgIHJvb21OYW1lTm9kZSA9IDxhIGhyZWY9e3Blcm1hbGlua30gb25DbGljaz17dGhpcy5vbkNsaWNrfSA+eyByb29tTmFtZSB9PC9hPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJvb21OYW1lTm9kZSA9IDxzcGFuPnsgcm9vbU5hbWUgfTwvc3Bhbj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWxldGVCdXR0b24gPSB0aGlzLnByb3BzLmVkaXRpbmcgP1xuICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nX2RlbGV0ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9jYW5jZWwtc21hbGwuc3ZnXCIpfVxuICAgICAgICAgICAgICAgIHdpZHRoPVwiMTRcIlxuICAgICAgICAgICAgICAgIGhlaWdodD1cIjE0XCJcbiAgICAgICAgICAgICAgICBhbHQ9XCJEZWxldGVcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25EZWxldGVDbGlja2VkfSAvPlxuICAgICAgICAgICAgOiA8ZGl2IC8+O1xuXG4gICAgICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ1wiIG9uQ2xpY2s9e3RoaXMub25DbGlja30+XG4gICAgICAgICAgICA8Um9vbUF2YXRhciBvb2JEYXRhPXtvb2JEYXRhfSB3aWR0aD17NjR9IGhlaWdodD17NjR9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nX25hbWVcIj57IHJvb21OYW1lTm9kZSB9PC9kaXY+XG4gICAgICAgICAgICB7IGRlbGV0ZUJ1dHRvbiB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgfVxufVxuXG5jbGFzcyBSb2xlVXNlckxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHVzZXJzOiBQcm9wVHlwZXMuYXJyYXlPZihVc2VyU3VtbWFyeVR5cGUpLmlzUmVxdWlyZWQsXG4gICAgICAgIHJvbGU6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgICBwcm9maWxlOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgICAgICAgICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgICAgICB9KS5pc1JlcXVpcmVkLFxuICAgICAgICB9KSxcbiAgICAgICAgZ3JvdXBJZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXG4gICAgICAgIC8vIFdoZXRoZXIgdGhlIGxpc3Qgc2hvdWxkIGJlIGVkaXRhYmxlXG4gICAgICAgIGVkaXRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIG9uQWRkVXNlcnNDbGlja2VkID0gKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IEFkZHJlc3NQaWNrZXJEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5BZGRyZXNzUGlja2VyRGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdBZGQgVXNlcnMgdG8gR3JvdXAgU3VtbWFyeScsICcnLCBBZGRyZXNzUGlja2VyRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoJ0FkZCB1c2VycyB0byB0aGUgY29tbXVuaXR5IHN1bW1hcnknKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIldobyB3b3VsZCB5b3UgbGlrZSB0byBhZGQgdG8gdGhpcyBzdW1tYXJ5P1wiKSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBfdChcIk5hbWUgb3IgTWF0cml4IElEXCIpLFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIkFkZCB0byBzdW1tYXJ5XCIpLFxuICAgICAgICAgICAgdmFsaWRBZGRyZXNzVHlwZXM6IFsnbXgtdXNlci1pZCddLFxuICAgICAgICAgICAgZ3JvdXBJZDogdGhpcy5wcm9wcy5ncm91cElkLFxuICAgICAgICAgICAgc2hvdWxkT21pdFNlbGY6IGZhbHNlLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKHN1Y2Nlc3MsIGFkZHJzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdWNjZXNzKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgYWxsU2V0dGxlZChhZGRycy5tYXAoKGFkZHIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEdyb3VwU3RvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRVc2VyVG9Hcm91cFN1bW1hcnkoYWRkci5hZGRyZXNzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHsgZXJyb3JMaXN0LnB1c2goYWRkci5hZGRyZXNzKTsgfSk7XG4gICAgICAgICAgICAgICAgfSkpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3JMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkIHRvIGFkZCB0aGUgZm9sbG93aW5nIHVzZXJzIHRvIHRoZSBjb21tdW5pdHkgc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnJywgRXJyb3JEaWFsb2csXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byBhZGQgdGhlIGZvbGxvd2luZyB1c2VycyB0byB0aGUgc3VtbWFyeSBvZiAlKGdyb3VwSWQpczpcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Z3JvdXBJZDogdGhpcy5wcm9wcy5ncm91cElkfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyb3JMaXN0LmpvaW4oXCIsIFwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LCAvKmNsYXNzTmFtZT0qL251bGwsIC8qaXNQcmlvcml0eT0qL2ZhbHNlLCAvKmlzU3RhdGljPSovdHJ1ZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgVGludGFibGVTdmcgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVGludGFibGVTdmdcIik7XG4gICAgICAgIGNvbnN0IGFkZEJ1dHRvbiA9IHRoaXMucHJvcHMuZWRpdGluZyA/XG4gICAgICAgICAgICAoPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2FkZEJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMub25BZGRVc2Vyc0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICA8VGludGFibGVTdmcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9pY29ucy1jcmVhdGUtcm9vbS5zdmdcIil9IHdpZHRoPVwiNjRcIiBoZWlnaHQ9XCI2NFwiIC8+XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2FkZEJ1dHRvbl9sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgeyBfdCgnQWRkIGEgVXNlcicpIH1cbiAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPikgOiA8ZGl2IC8+O1xuICAgICAgICBjb25zdCB1c2VyTm9kZXMgPSB0aGlzLnByb3BzLnVzZXJzLm1hcCgodSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDxGZWF0dXJlZFVzZXJcbiAgICAgICAgICAgICAgICBrZXk9e3UudXNlcl9pZH1cbiAgICAgICAgICAgICAgICBzdW1tYXJ5SW5mbz17dX1cbiAgICAgICAgICAgICAgICBlZGl0aW5nPXt0aGlzLnByb3BzLmVkaXRpbmd9XG4gICAgICAgICAgICAgICAgZ3JvdXBJZD17dGhpcy5wcm9wcy5ncm91cElkfSAvPjtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCByb2xlSGVhZGVyID0gPGRpdiAvPjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucm9sZSAmJiB0aGlzLnByb3BzLnJvbGUucHJvZmlsZSkge1xuICAgICAgICAgICAgcm9sZUhlYWRlciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2NhdGVnb3J5XCI+eyB0aGlzLnByb3BzLnJvbGUucHJvZmlsZS5uYW1lIH08L2Rpdj47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgeyByb2xlSGVhZGVyIH1cbiAgICAgICAgICAgIHsgdXNlck5vZGVzIH1cbiAgICAgICAgICAgIHsgYWRkQnV0dG9uIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuY2xhc3MgRmVhdHVyZWRVc2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBzdW1tYXJ5SW5mbzogVXNlclN1bW1hcnlUeXBlLmlzUmVxdWlyZWQsXG4gICAgICAgIGVkaXRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgb25DbGljayA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19zdGFydF9jaGF0X29yX3JldXNlJyxcbiAgICAgICAgICAgIHVzZXJfaWQ6IHRoaXMucHJvcHMuc3VtbWFyeUluZm8udXNlcl9pZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uRGVsZXRlQ2xpY2tlZCA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgR3JvdXBTdG9yZS5yZW1vdmVVc2VyRnJvbUdyb3VwU3VtbWFyeShcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZ3JvdXBJZCxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc3VtbWFyeUluZm8udXNlcl9pZCxcbiAgICAgICAgKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB3aGlsc3QgcmVtb3ZpbmcgdXNlciBmcm9tIGdyb3VwIHN1bW1hcnknLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLmRpc3BsYXluYW1lIHx8IHRoaXMucHJvcHMuc3VtbWFyeUluZm8udXNlcl9pZDtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gcmVtb3ZlIHVzZXIgZnJvbSBjb21tdW5pdHkgc3VtbWFyeScsXG4gICAgICAgICAgICAgICAgJycsIEVycm9yRGlhbG9nLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJGYWlsZWQgdG8gcmVtb3ZlIGEgdXNlciBmcm9tIHRoZSBzdW1tYXJ5IG9mICUoZ3JvdXBJZClzXCIsXG4gICAgICAgICAgICAgICAgICAgIHtncm91cElkOiB0aGlzLnByb3BzLmdyb3VwSWR9LFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiVGhlIHVzZXIgJyUoZGlzcGxheU5hbWUpcycgY291bGQgbm90IGJlIHJlbW92ZWQgZnJvbSB0aGUgc3VtbWFyeS5cIiwge2Rpc3BsYXlOYW1lfSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoXCJhdmF0YXJzLkJhc2VBdmF0YXJcIik7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLnByb3BzLnN1bW1hcnlJbmZvLmRpc3BsYXluYW1lIHx8IHRoaXMucHJvcHMuc3VtbWFyeUluZm8udXNlcl9pZDtcblxuICAgICAgICBjb25zdCBwZXJtYWxpbmsgPSBtYWtlVXNlclBlcm1hbGluayh0aGlzLnByb3BzLnN1bW1hcnlJbmZvLnVzZXJfaWQpO1xuICAgICAgICBjb25zdCB1c2VyTmFtZU5vZGUgPSA8YSBocmVmPXtwZXJtYWxpbmt9IG9uQ2xpY2s9e3RoaXMub25DbGlja30+eyBuYW1lIH08L2E+O1xuICAgICAgICBjb25zdCBodHRwVXJsID0gTWF0cml4Q2xpZW50UGVnLmdldCgpXG4gICAgICAgICAgICAubXhjVXJsVG9IdHRwKHRoaXMucHJvcHMuc3VtbWFyeUluZm8uYXZhdGFyX3VybCwgNjQsIDY0KTtcblxuICAgICAgICBjb25zdCBkZWxldGVCdXR0b24gPSB0aGlzLnByb3BzLmVkaXRpbmcgP1xuICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nX2RlbGV0ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9jYW5jZWwtc21hbGwuc3ZnXCIpfVxuICAgICAgICAgICAgICAgIHdpZHRoPVwiMTRcIlxuICAgICAgICAgICAgICAgIGhlaWdodD1cIjE0XCJcbiAgICAgICAgICAgICAgICBhbHQ9XCJEZWxldGVcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25EZWxldGVDbGlja2VkfSAvPlxuICAgICAgICAgICAgOiA8ZGl2IC8+O1xuXG4gICAgICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ1wiIG9uQ2xpY2s9e3RoaXMub25DbGlja30+XG4gICAgICAgICAgICA8QmFzZUF2YXRhciBuYW1lPXtuYW1lfSB1cmw9e2h0dHBVcmx9IHdpZHRoPXs2NH0gaGVpZ2h0PXs2NH0gLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdfbmFtZVwiPnsgdXNlck5hbWVOb2RlIH08L2Rpdj5cbiAgICAgICAgICAgIHsgZGVsZXRlQnV0dG9uIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICB9XG59XG5cbmNvbnN0IEdST1VQX0pPSU5QT0xJQ1lfT1BFTiA9IFwib3BlblwiO1xuY29uc3QgR1JPVVBfSk9JTlBPTElDWV9JTlZJVEUgPSBcImludml0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgLy8gV2hldGhlciB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIHRoZSBncm91cCBhZG1pbiBpcyB2aWV3aW5nIHRoZSBncm91cFxuICAgICAgICBncm91cElzTmV3OiBQcm9wVHlwZXMuYm9vbCxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHN1bW1hcnk6IG51bGwsXG4gICAgICAgIGlzR3JvdXBQdWJsaWNpc2VkOiBudWxsLFxuICAgICAgICBpc1VzZXJQcml2aWxlZ2VkOiBudWxsLFxuICAgICAgICBncm91cFJvb21zOiBudWxsLFxuICAgICAgICBncm91cFJvb21zTG9hZGluZzogbnVsbCxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIGVkaXRpbmc6IGZhbHNlLFxuICAgICAgICBzYXZpbmc6IGZhbHNlLFxuICAgICAgICB1cGxvYWRpbmdBdmF0YXI6IGZhbHNlLFxuICAgICAgICBhdmF0YXJDaGFuZ2VkOiBmYWxzZSxcbiAgICAgICAgbWVtYmVyc2hpcEJ1c3k6IGZhbHNlLFxuICAgICAgICBwdWJsaWNpdHlCdXN5OiBmYWxzZSxcbiAgICAgICAgaW52aXRlclByb2ZpbGU6IG51bGwsXG4gICAgICAgIHNob3dSaWdodFBhbmVsOiBSaWdodFBhbmVsU3RvcmUuZ2V0U2hhcmVkSW5zdGFuY2UoKS5pc09wZW5Gb3JHcm91cCxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VubW91bnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5vbihcIkdyb3VwLm15TWVtYmVyc2hpcFwiLCB0aGlzLl9vbkdyb3VwTXlNZW1iZXJzaGlwKTtcblxuICAgICAgICB0aGlzLl9pbml0R3JvdXBTdG9yZSh0aGlzLnByb3BzLmdyb3VwSWQsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuX2Rpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5fb25BY3Rpb24pO1xuICAgICAgICB0aGlzLl9yaWdodFBhbmVsU3RvcmVUb2tlbiA9IFJpZ2h0UGFuZWxTdG9yZS5nZXRTaGFyZWRJbnN0YW5jZSgpLmFkZExpc3RlbmVyKHRoaXMuX29uUmlnaHRQYW5lbFN0b3JlVXBkYXRlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5fdW5tb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiR3JvdXAubXlNZW1iZXJzaGlwXCIsIHRoaXMuX29uR3JvdXBNeU1lbWJlcnNoaXApO1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLl9kaXNwYXRjaGVyUmVmKTtcblxuICAgICAgICAvLyBSZW1vdmUgUmlnaHRQYW5lbFN0b3JlIGxpc3RlbmVyXG4gICAgICAgIGlmICh0aGlzLl9yaWdodFBhbmVsU3RvcmVUb2tlbikge1xuICAgICAgICAgICAgdGhpcy5fcmlnaHRQYW5lbFN0b3JlVG9rZW4ucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5ncm91cElkICE9PSBuZXdQcm9wcy5ncm91cElkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiBudWxsLFxuICAgICAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXRHcm91cFN0b3JlKG5ld1Byb3BzLmdyb3VwSWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25SaWdodFBhbmVsU3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd1JpZ2h0UGFuZWw6IFJpZ2h0UGFuZWxTdG9yZS5nZXRTaGFyZWRJbnN0YW5jZSgpLmlzT3BlbkZvckdyb3VwLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uR3JvdXBNeU1lbWJlcnNoaXAgPSAoZ3JvdXApID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCB8fCBncm91cC5ncm91cElkICE9PSB0aGlzLnByb3BzLmdyb3VwSWQpIHJldHVybjtcbiAgICAgICAgaWYgKGdyb3VwLm15TWVtYmVyc2hpcCA9PT0gJ2xlYXZlJykge1xuICAgICAgICAgICAgLy8gTGVhdmUgc2V0dGluZ3MgLSB0aGUgdXNlciBtaWdodCBoYXZlIGNsaWNrZWQgdGhlIFwiTGVhdmVcIiBidXR0b25cbiAgICAgICAgICAgIHRoaXMuX2Nsb3NlU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHttZW1iZXJzaGlwQnVzeTogZmFsc2V9KTtcbiAgICB9O1xuXG4gICAgX2luaXRHcm91cFN0b3JlKGdyb3VwSWQsIGZpcnN0SW5pdCkge1xuICAgICAgICBjb25zdCBncm91cCA9IHRoaXMuX21hdHJpeENsaWVudC5nZXRHcm91cChncm91cElkKTtcbiAgICAgICAgaWYgKGdyb3VwICYmIGdyb3VwLmludml0ZXIgJiYgZ3JvdXAuaW52aXRlci51c2VySWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZldGNoSW52aXRlclByb2ZpbGUoZ3JvdXAuaW52aXRlci51c2VySWQpO1xuICAgICAgICB9XG4gICAgICAgIEdyb3VwU3RvcmUucmVnaXN0ZXJMaXN0ZW5lcihncm91cElkLCB0aGlzLm9uR3JvdXBTdG9yZVVwZGF0ZWQuYmluZCh0aGlzLCBmaXJzdEluaXQpKTtcbiAgICAgICAgbGV0IHdpbGxEb09uYm9hcmRpbmcgPSBmYWxzZTtcbiAgICAgICAgLy8gWFhYOiBUaGlzIHNob3VsZCBiZSBtb3JlIGZsdXh5IC0gbGV0J3MgZ2V0IHRoZSBlcnJvciBmcm9tIEdyb3VwU3RvcmUgLmdldEVycm9yIG9yIHNvbWV0aGluZ1xuICAgICAgICBHcm91cFN0b3JlLm9uKCdlcnJvcicsIChlcnIsIGVycm9yR3JvdXBJZCwgc3RhdGVLZXkpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQgfHwgZ3JvdXBJZCAhPT0gZXJyb3JHcm91cElkKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgPT09ICdNX0dVRVNUX0FDQ0VTU19GT1JCSURERU4nICYmICF3aWxsRG9PbmJvYXJkaW5nKSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZG9fYWZ0ZXJfc3luY19wcmVwYXJlZCcsXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19ncm91cCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cF9pZDogZ3JvdXBJZCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJywgc2NyZWVuX2FmdGVyOiB7c2NyZWVuOiBgZ3JvdXAvJHtncm91cElkfWB9fSk7XG4gICAgICAgICAgICAgICAgd2lsbERvT25ib2FyZGluZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhdGVLZXkgPT09IEdyb3VwU3RvcmUuU1RBVEVfS0VZLlN1bW1hcnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycixcbiAgICAgICAgICAgICAgICAgICAgZWRpdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uR3JvdXBTdG9yZVVwZGF0ZWQgPSAoZmlyc3RJbml0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IEdyb3VwU3RvcmUuZ2V0U3VtbWFyeSh0aGlzLnByb3BzLmdyb3VwSWQpO1xuICAgICAgICBpZiAoc3VtbWFyeS5wcm9maWxlKSB7XG4gICAgICAgICAgICAvLyBEZWZhdWx0IHByb2ZpbGUgZmllbGRzIHNob3VsZCBiZSBcIlwiIGZvciBsYXRlciBzZW5kaW5nIHRvIHRoZSBzZXJ2ZXIgKHdoaWNoXG4gICAgICAgICAgICAvLyByZXF1aXJlcyB0aGF0IHRoZSBmaWVsZHMgYXJlIHN0cmluZ3MsIG5vdCBudWxsKVxuICAgICAgICAgICAgW1wiYXZhdGFyX3VybFwiLCBcImxvbmdfZGVzY3JpcHRpb25cIiwgXCJuYW1lXCIsIFwic2hvcnRfZGVzY3JpcHRpb25cIl0uZm9yRWFjaCgoaykgPT4ge1xuICAgICAgICAgICAgICAgIHN1bW1hcnkucHJvZmlsZVtrXSA9IHN1bW1hcnkucHJvZmlsZVtrXSB8fCBcIlwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzdW1tYXJ5LFxuICAgICAgICAgICAgc3VtbWFyeUxvYWRpbmc6ICFHcm91cFN0b3JlLmlzU3RhdGVSZWFkeSh0aGlzLnByb3BzLmdyb3VwSWQsIEdyb3VwU3RvcmUuU1RBVEVfS0VZLlN1bW1hcnkpLFxuICAgICAgICAgICAgaXNHcm91cFB1YmxpY2lzZWQ6IEdyb3VwU3RvcmUuZ2V0R3JvdXBQdWJsaWNpdHkodGhpcy5wcm9wcy5ncm91cElkKSxcbiAgICAgICAgICAgIGlzVXNlclByaXZpbGVnZWQ6IEdyb3VwU3RvcmUuaXNVc2VyUHJpdmlsZWdlZCh0aGlzLnByb3BzLmdyb3VwSWQpLFxuICAgICAgICAgICAgZ3JvdXBSb29tczogR3JvdXBTdG9yZS5nZXRHcm91cFJvb21zKHRoaXMucHJvcHMuZ3JvdXBJZCksXG4gICAgICAgICAgICBncm91cFJvb21zTG9hZGluZzogIUdyb3VwU3RvcmUuaXNTdGF0ZVJlYWR5KHRoaXMucHJvcHMuZ3JvdXBJZCwgR3JvdXBTdG9yZS5TVEFURV9LRVkuR3JvdXBSb29tcyksXG4gICAgICAgICAgICBpc1VzZXJNZW1iZXI6IEdyb3VwU3RvcmUuZ2V0R3JvdXBNZW1iZXJzKHRoaXMucHJvcHMuZ3JvdXBJZCkuc29tZShcbiAgICAgICAgICAgICAgICAobSkgPT4gbS51c2VySWQgPT09IHRoaXMuX21hdHJpeENsaWVudC5jcmVkZW50aWFscy51c2VySWQsXG4gICAgICAgICAgICApLFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gWFhYOiBUaGlzIG1pZ2h0IG5vdCB3b3JrIGJ1dCB0aGlzLnByb3BzLmdyb3VwSXNOZXcgdW51c2VkIGFueXdheVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5ncm91cElzTmV3ICYmIGZpcnN0SW5pdCkge1xuICAgICAgICAgICAgdGhpcy5fb25FZGl0Q2xpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfZmV0Y2hJbnZpdGVyUHJvZmlsZSh1c2VySWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpbnZpdGVyUHJvZmlsZUJ1c3k6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQuZ2V0UHJvZmlsZUluZm8odXNlcklkKS50aGVuKChyZXNwKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpbnZpdGVyUHJvZmlsZToge1xuICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHJlc3AuYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IHJlc3AuZGlzcGxheW5hbWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBncm91cCBpbnZpdGVyIHByb2ZpbGUnLCBlKTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpbnZpdGVyUHJvZmlsZUJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vbkVkaXRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlZGl0aW5nOiB0cnVlLFxuICAgICAgICAgICAgcHJvZmlsZUZvcm06IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUuc3VtbWFyeS5wcm9maWxlKSxcbiAgICAgICAgICAgIGpvaW5hYmxlRm9ybToge1xuICAgICAgICAgICAgICAgIHBvbGljeVR5cGU6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuc3VtbWFyeS5wcm9maWxlLmlzX29wZW5seV9qb2luYWJsZSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBHUk9VUF9KT0lOUE9MSUNZX09QRU4gOlxuICAgICAgICAgICAgICAgICAgICAgICAgR1JPVVBfSk9JTlBPTElDWV9JTlZJVEUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uU2hhcmVDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgU2hhcmVEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5TaGFyZURpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnc2hhcmUgY29tbXVuaXR5IGRpYWxvZycsICcnLCBTaGFyZURpYWxvZywge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLl9tYXRyaXhDbGllbnQuZ2V0R3JvdXAodGhpcy5wcm9wcy5ncm91cElkKSB8fCBuZXcgR3JvdXAodGhpcy5wcm9wcy5ncm91cElkKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkNhbmNlbENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl9jbG9zZVNldHRpbmdzKCk7XG4gICAgfTtcblxuICAgIF9vbkFjdGlvbiA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IGNsb3NlX3NldHRpbmdzIGlzIGFuIGFwcC13aWRlIGRpc3BhdGNoOyBhcyBpdCBpcyBkaXNwYXRjaGVkIGZyb20gTWF0cml4Q2hhdFxuICAgICAgICAgICAgY2FzZSAnY2xvc2Vfc2V0dGluZ3MnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBlZGl0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZUZvcm06IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9jbG9zZVNldHRpbmdzID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ2Nsb3NlX3NldHRpbmdzJ30pO1xuICAgIH07XG5cbiAgICBfb25OYW1lQ2hhbmdlID0gKHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1Byb2ZpbGVGb3JtID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLnByb2ZpbGVGb3JtLCB7IG5hbWU6IHZhbHVlIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByb2ZpbGVGb3JtOiBuZXdQcm9maWxlRm9ybSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vblNob3J0RGVzY0NoYW5nZSA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdQcm9maWxlRm9ybSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5wcm9maWxlRm9ybSwgeyBzaG9ydF9kZXNjcmlwdGlvbjogdmFsdWUgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHJvZmlsZUZvcm06IG5ld1Byb2ZpbGVGb3JtLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uTG9uZ0Rlc2NDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdQcm9maWxlRm9ybSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS5wcm9maWxlRm9ybSwgeyBsb25nX2Rlc2NyaXB0aW9uOiBlLnRhcmdldC52YWx1ZSB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcm9maWxlRm9ybTogbmV3UHJvZmlsZUZvcm0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25BdmF0YXJTZWxlY3RlZCA9IGV2ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IGV2LnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgaWYgKCFmaWxlKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dXBsb2FkaW5nQXZhdGFyOiB0cnVlfSk7XG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudC51cGxvYWRDb250ZW50KGZpbGUpLnRoZW4oKHVybCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UHJvZmlsZUZvcm0gPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUucHJvZmlsZUZvcm0sIHsgYXZhdGFyX3VybDogdXJsIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdXBsb2FkaW5nQXZhdGFyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9maWxlRm9ybTogbmV3UHJvZmlsZUZvcm0sXG5cbiAgICAgICAgICAgICAgICAvLyBJbmRpY2F0ZSB0aGF0IEZsYWlyU3RvcmUgbmVlZHMgdG8gYmUgcG9rZWQgdG8gc2hvdyB0aGlzIGNoYW5nZVxuICAgICAgICAgICAgICAgIC8vIGluIFRhZ1RpbGUgKEdyb3VwRmlsdGVyUGFuZWwpLCBGbGFpciBhbmQgR3JvdXBUaWxlIChNeUdyb3VwcykuXG4gICAgICAgICAgICAgICAgYXZhdGFyQ2hhbmdlZDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dXBsb2FkaW5nQXZhdGFyOiBmYWxzZX0pO1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gdXBsb2FkIGF2YXRhciBpbWFnZVwiLCBlKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byB1cGxvYWQgaW1hZ2UnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdGYWlsZWQgdG8gdXBsb2FkIGltYWdlJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkpvaW5hYmxlQ2hhbmdlID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGpvaW5hYmxlRm9ybTogeyBwb2xpY3lUeXBlOiBldi50YXJnZXQudmFsdWUgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vblNhdmVDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2F2aW5nOiB0cnVlfSk7XG4gICAgICAgIGNvbnN0IHNhdmVQcm9taXNlID0gdGhpcy5zdGF0ZS5pc1VzZXJQcml2aWxlZ2VkID8gdGhpcy5fc2F2ZUdyb3VwKCkgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgc2F2ZVByb21pc2UudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzYXZpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVkaXRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHN1bW1hcnk6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX2luaXRHcm91cFN0b3JlKHRoaXMucHJvcHMuZ3JvdXBJZCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmF2YXRhckNoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBYWFg6IEV2aWwgLSBwb2tpbmcgYSBzdG9yZSBzaG91bGQgYmUgZG9uZSBmcm9tIGFuIGFzeW5jIGFjdGlvblxuICAgICAgICAgICAgICAgIEZsYWlyU3RvcmUucmVmcmVzaEdyb3VwUHJvZmlsZSh0aGlzLl9tYXRyaXhDbGllbnQsIHRoaXMucHJvcHMuZ3JvdXBJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzYXZpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzYXZlIGNvbW11bml0eSBwcm9maWxlXCIsIGUpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHVwZGF0ZSBncm91cCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3InKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ0ZhaWxlZCB0byB1cGRhdGUgY29tbXVuaXR5JyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBhdmF0YXJDaGFuZ2VkOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMgX3NhdmVHcm91cCgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5fbWF0cml4Q2xpZW50LnNldEdyb3VwUHJvZmlsZSh0aGlzLnByb3BzLmdyb3VwSWQsIHRoaXMuc3RhdGUucHJvZmlsZUZvcm0pO1xuICAgICAgICBhd2FpdCB0aGlzLl9tYXRyaXhDbGllbnQuc2V0R3JvdXBKb2luUG9saWN5KHRoaXMucHJvcHMuZ3JvdXBJZCwge1xuICAgICAgICAgICAgdHlwZTogdGhpcy5zdGF0ZS5qb2luYWJsZUZvcm0ucG9saWN5VHlwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uQWNjZXB0SW52aXRlQ2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21lbWJlcnNoaXBCdXN5OiB0cnVlfSk7XG5cbiAgICAgICAgLy8gV2FpdCA1MDBtcyB0byBwcmV2ZW50IGZsYXNoaW5nLiBEbyB0aGlzIGJlZm9yZSBzZW5kaW5nIGEgcmVxdWVzdCBvdGhlcndpc2Ugd2UgcmlzayB0aGVcbiAgICAgICAgLy8gc3Bpbm5lciBkaXNhcHBlYXJpbmcgYWZ0ZXIgd2UgaGF2ZSBmZXRjaGVkIG5ldyBncm91cCBkYXRhLlxuICAgICAgICBhd2FpdCBzbGVlcCg1MDApO1xuXG4gICAgICAgIEdyb3VwU3RvcmUuYWNjZXB0R3JvdXBJbnZpdGUodGhpcy5wcm9wcy5ncm91cElkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIGRvbid0IHJlc2V0IG1lbWJlcnNoaXBCdXN5IGhlcmU6IHdhaXQgZm9yIHRoZSBtZW1iZXJzaGlwIGNoYW5nZSB0byBjb21lIGRvd24gdGhlIHN5bmNcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe21lbWJlcnNoaXBCdXN5OiBmYWxzZX0pO1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0Vycm9yIGFjY2VwdGluZyBpbnZpdGUnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJVbmFibGUgdG8gYWNjZXB0IGludml0ZVwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uUmVqZWN0SW52aXRlQ2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21lbWJlcnNoaXBCdXN5OiB0cnVlfSk7XG5cbiAgICAgICAgLy8gV2FpdCA1MDBtcyB0byBwcmV2ZW50IGZsYXNoaW5nLiBEbyB0aGlzIGJlZm9yZSBzZW5kaW5nIGEgcmVxdWVzdCBvdGhlcndpc2Ugd2UgcmlzayB0aGVcbiAgICAgICAgLy8gc3Bpbm5lciBkaXNhcHBlYXJpbmcgYWZ0ZXIgd2UgaGF2ZSBmZXRjaGVkIG5ldyBncm91cCBkYXRhLlxuICAgICAgICBhd2FpdCBzbGVlcCg1MDApO1xuXG4gICAgICAgIEdyb3VwU3RvcmUubGVhdmVHcm91cCh0aGlzLnByb3BzLmdyb3VwSWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gZG9uJ3QgcmVzZXQgbWVtYmVyc2hpcEJ1c3kgaGVyZTogd2FpdCBmb3IgdGhlIG1lbWJlcnNoaXAgY2hhbmdlIHRvIGNvbWUgZG93biB0aGUgc3luY1xuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVtYmVyc2hpcEJ1c3k6IGZhbHNlfSk7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRXJyb3IgcmVqZWN0aW5nIGludml0ZScsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlVuYWJsZSB0byByZWplY3QgaW52aXRlXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25Kb2luQ2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9tYXRyaXhDbGllbnQuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJywgc2NyZWVuX2FmdGVyOiB7c2NyZWVuOiBgZ3JvdXAvJHt0aGlzLnByb3BzLmdyb3VwSWR9YH19KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21lbWJlcnNoaXBCdXN5OiB0cnVlfSk7XG5cbiAgICAgICAgLy8gV2FpdCA1MDBtcyB0byBwcmV2ZW50IGZsYXNoaW5nLiBEbyB0aGlzIGJlZm9yZSBzZW5kaW5nIGEgcmVxdWVzdCBvdGhlcndpc2Ugd2UgcmlzayB0aGVcbiAgICAgICAgLy8gc3Bpbm5lciBkaXNhcHBlYXJpbmcgYWZ0ZXIgd2UgaGF2ZSBmZXRjaGVkIG5ldyBncm91cCBkYXRhLlxuICAgICAgICBhd2FpdCBzbGVlcCg1MDApO1xuXG4gICAgICAgIEdyb3VwU3RvcmUuam9pbkdyb3VwKHRoaXMucHJvcHMuZ3JvdXBJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBkb24ndCByZXNldCBtZW1iZXJzaGlwQnVzeSBoZXJlOiB3YWl0IGZvciB0aGUgbWVtYmVyc2hpcCBjaGFuZ2UgdG8gY29tZSBkb3duIHRoZSBzeW5jXG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZW1iZXJzaGlwQnVzeTogZmFsc2V9KTtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdFcnJvciBqb2luaW5nIHJvb20nLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJVbmFibGUgdG8gam9pbiBjb21tdW5pdHlcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9sZWF2ZUdyb3VwV2FybmluZ3MoKSB7XG4gICAgICAgIGNvbnN0IHdhcm5pbmdzID0gW107XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZCkge1xuICAgICAgICAgICAgd2FybmluZ3MucHVzaCgoXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2FybmluZ1wiPlxuICAgICAgICAgICAgICAgICAgICB7IFwiIFwiIC8qIFdoaXRlc3BhY2UsIG90aGVyd2lzZSB0aGUgc2VudGVuY2VzIGdldCBzbWFzaGVkIHRvZ2V0aGVyICovIH1cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIllvdSBhcmUgYW4gYWRtaW5pc3RyYXRvciBvZiB0aGlzIGNvbW11bml0eS4gWW91IHdpbGwgbm90IGJlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBcImFibGUgdG8gcmVqb2luIHdpdGhvdXQgYW4gaW52aXRlIGZyb20gYW5vdGhlciBhZG1pbmlzdHJhdG9yLlwiKSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gd2FybmluZ3M7XG4gICAgfVxuXG4gICAgX29uTGVhdmVDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5RdWVzdGlvbkRpYWxvZ1wiKTtcbiAgICAgICAgY29uc3Qgd2FybmluZ3MgPSB0aGlzLl9sZWF2ZUdyb3VwV2FybmluZ3MoKTtcblxuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdMZWF2ZSBHcm91cCcsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiTGVhdmUgQ29tbXVuaXR5XCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IChcbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICB7IF90KFwiTGVhdmUgJShncm91cE5hbWUpcz9cIiwge2dyb3VwTmFtZTogdGhpcy5wcm9wcy5ncm91cElkfSkgfVxuICAgICAgICAgICAgICAgIHsgd2FybmluZ3MgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBidXR0b246IF90KFwiTGVhdmVcIiksXG4gICAgICAgICAgICBkYW5nZXI6IHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZCxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IGFzeW5jIChjb25maXJtZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1lZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVtYmVyc2hpcEJ1c3k6IHRydWV9KTtcblxuICAgICAgICAgICAgICAgIC8vIFdhaXQgNTAwbXMgdG8gcHJldmVudCBmbGFzaGluZy4gRG8gdGhpcyBiZWZvcmUgc2VuZGluZyBhIHJlcXVlc3Qgb3RoZXJ3aXNlIHdlIHJpc2sgdGhlXG4gICAgICAgICAgICAgICAgLy8gc3Bpbm5lciBkaXNhcHBlYXJpbmcgYWZ0ZXIgd2UgaGF2ZSBmZXRjaGVkIG5ldyBncm91cCBkYXRhLlxuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKDUwMCk7XG5cbiAgICAgICAgICAgICAgICBHcm91cFN0b3JlLmxlYXZlR3JvdXAodGhpcy5wcm9wcy5ncm91cElkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZG9uJ3QgcmVzZXQgbWVtYmVyc2hpcEJ1c3kgaGVyZTogd2FpdCBmb3IgdGhlIG1lbWJlcnNoaXAgY2hhbmdlIHRvIGNvbWUgZG93biB0aGUgc3luY1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe21lbWJlcnNoaXBCdXN5OiBmYWxzZX0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdFcnJvciBsZWF2aW5nIGNvbW11bml0eScsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRXJyb3JcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJVbmFibGUgdG8gbGVhdmUgY29tbXVuaXR5XCIpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25BZGRSb29tc0NsaWNrID0gKCkgPT4ge1xuICAgICAgICBzaG93R3JvdXBBZGRSb29tRGlhbG9nKHRoaXMucHJvcHMuZ3JvdXBJZCk7XG4gICAgfTtcblxuICAgIF9nZXRHcm91cFNlY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IGdyb3VwU2V0dGluZ3NTZWN0aW9uQ2xhc3NlcyA9IGNsYXNzbmFtZXMoe1xuICAgICAgICAgICAgXCJteF9Hcm91cFZpZXdfZ3JvdXBcIjogdGhpcy5zdGF0ZS5lZGl0aW5nLFxuICAgICAgICAgICAgXCJteF9Hcm91cFZpZXdfZ3JvdXBfZGlzYWJsZWRcIjogdGhpcy5zdGF0ZS5lZGl0aW5nICYmICF0aGlzLnN0YXRlLmlzVXNlclByaXZpbGVnZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGhlYWRlciA9IHRoaXMuc3RhdGUuZWRpdGluZyA/IDxoMj4geyBfdCgnQ29tbXVuaXR5IFNldHRpbmdzJykgfSA8L2gyPiA6IDxkaXYgLz47XG5cbiAgICAgICAgY29uc3QgaG9zdGluZ1NpZ251cExpbmsgPSBnZXRIb3N0aW5nTGluaygnY29tbXVuaXR5LXNldHRpbmdzJyk7XG4gICAgICAgIGxldCBob3N0aW5nU2lnbnVwID0gbnVsbDtcbiAgICAgICAgaWYgKGhvc3RpbmdTaWdudXBMaW5rICYmIHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZCkge1xuICAgICAgICAgICAgaG9zdGluZ1NpZ251cCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2hvc3RpbmdTaWdudXBcIj5cbiAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiV2FudCBtb3JlIHRoYW4gYSBjb21tdW5pdHk/IDxhPkdldCB5b3VyIG93biBzZXJ2ZXI8L2E+XCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPGEgaHJlZj17aG9zdGluZ1NpZ251cExpbmt9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8YSBocmVmPXtob3N0aW5nU2lnbnVwTGlua30gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uL3Jlcy9pbWcvZXh0ZXJuYWwtbGluay5zdmdcIil9IHdpZHRoPVwiMTFcIiBoZWlnaHQ9XCIxMFwiIGFsdD0nJyAvPlxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNoYW5nZURlbGF5V2FybmluZyA9IHRoaXMuc3RhdGUuZWRpdGluZyAmJiB0aGlzLnN0YXRlLmlzVXNlclByaXZpbGVnZWQgP1xuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfY2hhbmdlRGVsYXlXYXJuaW5nXCI+XG4gICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgJ0NoYW5nZXMgbWFkZSB0byB5b3VyIGNvbW11bml0eSA8Ym9sZDE+bmFtZTwvYm9sZDE+IGFuZCA8Ym9sZDI+YXZhdGFyPC9ib2xkMj4gJyArXG4gICAgICAgICAgICAgICAgICAgICdtaWdodCBub3QgYmUgc2VlbiBieSBvdGhlciB1c2VycyBmb3IgdXAgdG8gMzAgbWludXRlcy4nLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2JvbGQxJzogKHN1YikgPT4gPGI+IHsgc3ViIH0gPC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgICdib2xkMic6IChzdWIpID0+IDxiPiB7IHN1YiB9IDwvYj4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8L2Rpdj4gOiA8ZGl2IC8+O1xuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9e2dyb3VwU2V0dGluZ3NTZWN0aW9uQ2xhc3Nlc30+XG4gICAgICAgICAgICB7IGhlYWRlciB9XG4gICAgICAgICAgICB7IGhvc3RpbmdTaWdudXAgfVxuICAgICAgICAgICAgeyBjaGFuZ2VEZWxheVdhcm5pbmcgfVxuICAgICAgICAgICAgeyB0aGlzLl9nZXRKb2luYWJsZU5vZGUoKSB9XG4gICAgICAgICAgICB7IHRoaXMuX2dldExvbmdEZXNjcmlwdGlvbk5vZGUoKSB9XG4gICAgICAgICAgICB7IHRoaXMuX2dldFJvb21zTm9kZSgpIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIF9nZXRSb29tc05vZGUoKSB7XG4gICAgICAgIGNvbnN0IFJvb21EZXRhaWxMaXN0ID0gc2RrLmdldENvbXBvbmVudCgncm9vbXMuUm9vbURldGFpbExpc3QnKTtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgY29uc3QgVGludGFibGVTdmcgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5UaW50YWJsZVN2ZycpO1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuU3Bpbm5lcicpO1xuICAgICAgICBjb25zdCBUb29sdGlwQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuVG9vbHRpcEJ1dHRvbicpO1xuXG4gICAgICAgIGNvbnN0IHJvb21zSGVscE5vZGUgPSB0aGlzLnN0YXRlLmVkaXRpbmcgPyA8VG9vbHRpcEJ1dHRvbiBoZWxwVGV4dD17XG4gICAgICAgICAgICBfdChcbiAgICAgICAgICAgICAgICAnVGhlc2Ugcm9vbXMgYXJlIGRpc3BsYXllZCB0byBjb21tdW5pdHkgbWVtYmVycyBvbiB0aGUgY29tbXVuaXR5IHBhZ2UuICcrXG4gICAgICAgICAgICAgICAgJ0NvbW11bml0eSBtZW1iZXJzIGNhbiBqb2luIHRoZSByb29tcyBieSBjbGlja2luZyBvbiB0aGVtLicsXG4gICAgICAgICAgICApXG4gICAgICAgIH0gLz4gOiA8ZGl2IC8+O1xuXG4gICAgICAgIGNvbnN0IGFkZFJvb21Sb3cgPSB0aGlzLnN0YXRlLmVkaXRpbmcgP1xuICAgICAgICAgICAgKDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19yb29tc19oZWFkZXJfYWRkUm93XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkFkZFJvb21zQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfcm9vbXNfaGVhZGVyX2FkZFJvd19idXR0b25cIj5cbiAgICAgICAgICAgICAgICAgICAgPFRpbnRhYmxlU3ZnIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uL3Jlcy9pbWcvaWNvbnMtcm9vbS1hZGQuc3ZnXCIpfSB3aWR0aD1cIjI0XCIgaGVpZ2h0PVwiMjRcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X3Jvb21zX2hlYWRlcl9hZGRSb3dfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnQWRkIHJvb21zIHRvIHRoaXMgY29tbXVuaXR5JykgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPikgOiA8ZGl2IC8+O1xuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19yb29tc1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfcm9vbXNfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPGgzPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdSb29tcycpIH1cbiAgICAgICAgICAgICAgICAgICAgeyByb29tc0hlbHBOb2RlIH1cbiAgICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICAgIHsgYWRkUm9vbVJvdyB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5ncm91cFJvb21zTG9hZGluZyA/XG4gICAgICAgICAgICAgICAgPFNwaW5uZXIgLz4gOlxuICAgICAgICAgICAgICAgIDxSb29tRGV0YWlsTGlzdCByb29tcz17dGhpcy5zdGF0ZS5ncm91cFJvb21zfSAvPlxuICAgICAgICAgICAgfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgX2dldEZlYXR1cmVkUm9vbXNOb2RlKCkge1xuICAgICAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5zdGF0ZS5zdW1tYXJ5O1xuXG4gICAgICAgIGNvbnN0IGRlZmF1bHRDYXRlZ29yeVJvb21zID0gW107XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5Um9vbXMgPSB7fTtcbiAgICAgICAgc3VtbWFyeS5yb29tc19zZWN0aW9uLnJvb21zLmZvckVhY2goKHIpID0+IHtcbiAgICAgICAgICAgIGlmIChyLmNhdGVnb3J5X2lkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdENhdGVnb3J5Um9vbXMucHVzaChyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBjYXRlZ29yeVJvb21zW3IuY2F0ZWdvcnlfaWRdO1xuICAgICAgICAgICAgICAgIGlmIChsaXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeVJvb21zW3IuY2F0ZWdvcnlfaWRdID0gbGlzdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBkZWZhdWx0Q2F0ZWdvcnlOb2RlID0gPENhdGVnb3J5Um9vbUxpc3RcbiAgICAgICAgICAgIHJvb21zPXtkZWZhdWx0Q2F0ZWdvcnlSb29tc31cbiAgICAgICAgICAgIGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH1cbiAgICAgICAgICAgIGVkaXRpbmc9e3RoaXMuc3RhdGUuZWRpdGluZ30gLz47XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5Um9vbU5vZGVzID0gT2JqZWN0LmtleXMoY2F0ZWdvcnlSb29tcykubWFwKChjYXRJZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2F0ID0gc3VtbWFyeS5yb29tc19zZWN0aW9uLmNhdGVnb3JpZXNbY2F0SWRdO1xuICAgICAgICAgICAgcmV0dXJuIDxDYXRlZ29yeVJvb21MaXN0XG4gICAgICAgICAgICAgICAga2V5PXtjYXRJZH1cbiAgICAgICAgICAgICAgICByb29tcz17Y2F0ZWdvcnlSb29tc1tjYXRJZF19XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk9e2NhdH1cbiAgICAgICAgICAgICAgICBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9XG4gICAgICAgICAgICAgICAgZWRpdGluZz17dGhpcy5zdGF0ZS5lZGl0aW5nfSAvPjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19mZWF0dXJlZFRoaW5nc19oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICB7IF90KCdGZWF0dXJlZCBSb29tczonKSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsgZGVmYXVsdENhdGVnb3J5Tm9kZSB9XG4gICAgICAgICAgICB7IGNhdGVnb3J5Um9vbU5vZGVzIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIF9nZXRGZWF0dXJlZFVzZXJzTm9kZSgpIHtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuc3RhdGUuc3VtbWFyeTtcblxuICAgICAgICBjb25zdCBub1JvbGVVc2VycyA9IFtdO1xuICAgICAgICBjb25zdCByb2xlVXNlcnMgPSB7fTtcbiAgICAgICAgc3VtbWFyeS51c2Vyc19zZWN0aW9uLnVzZXJzLmZvckVhY2goKHUpID0+IHtcbiAgICAgICAgICAgIGlmICh1LnJvbGVfaWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBub1JvbGVVc2Vycy5wdXNoKHUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IHJvbGVVc2Vyc1t1LnJvbGVfaWRdO1xuICAgICAgICAgICAgICAgIGlmIChsaXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICByb2xlVXNlcnNbdS5yb2xlX2lkXSA9IGxpc3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxpc3QucHVzaCh1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgbm9Sb2xlTm9kZSA9IDxSb2xlVXNlckxpc3RcbiAgICAgICAgICAgIHVzZXJzPXtub1JvbGVVc2Vyc31cbiAgICAgICAgICAgIGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH1cbiAgICAgICAgICAgIGVkaXRpbmc9e3RoaXMuc3RhdGUuZWRpdGluZ30gLz47XG4gICAgICAgIGNvbnN0IHJvbGVVc2VyTm9kZXMgPSBPYmplY3Qua2V5cyhyb2xlVXNlcnMpLm1hcCgocm9sZUlkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb2xlID0gc3VtbWFyeS51c2Vyc19zZWN0aW9uLnJvbGVzW3JvbGVJZF07XG4gICAgICAgICAgICByZXR1cm4gPFJvbGVVc2VyTGlzdFxuICAgICAgICAgICAgICAgIGtleT17cm9sZUlkfVxuICAgICAgICAgICAgICAgIHVzZXJzPXtyb2xlVXNlcnNbcm9sZUlkXX1cbiAgICAgICAgICAgICAgICByb2xlPXtyb2xlfVxuICAgICAgICAgICAgICAgIGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH1cbiAgICAgICAgICAgICAgICBlZGl0aW5nPXt0aGlzLnN0YXRlLmVkaXRpbmd9IC8+O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZmVhdHVyZWRUaGluZ3NcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2ZlYXR1cmVkVGhpbmdzX2hlYWRlclwiPlxuICAgICAgICAgICAgICAgIHsgX3QoJ0ZlYXR1cmVkIFVzZXJzOicpIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgeyBub1JvbGVOb2RlIH1cbiAgICAgICAgICAgIHsgcm9sZVVzZXJOb2RlcyB9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICBfZ2V0TWVtYmVyc2hpcFNlY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgY29uc3QgQmFzZUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoXCJhdmF0YXJzLkJhc2VBdmF0YXJcIik7XG5cbiAgICAgICAgY29uc3QgZ3JvdXAgPSB0aGlzLl9tYXRyaXhDbGllbnQuZ2V0R3JvdXAodGhpcy5wcm9wcy5ncm91cElkKTtcblxuICAgICAgICBpZiAoZ3JvdXAgJiYgZ3JvdXAubXlNZW1iZXJzaGlwID09PSAnaW52aXRlJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVtYmVyc2hpcEJ1c3kgfHwgdGhpcy5zdGF0ZS5pbnZpdGVyUHJvZmlsZUJ1c3kpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfbWVtYmVyc2hpcFNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBodHRwSW52aXRlckF2YXRhciA9IHRoaXMuc3RhdGUuaW52aXRlclByb2ZpbGUgP1xuICAgICAgICAgICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5teGNVcmxUb0h0dHAoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuaW52aXRlclByb2ZpbGUuYXZhdGFyVXJsLCAzNiwgMzYsXG4gICAgICAgICAgICAgICAgKSA6IG51bGw7XG5cbiAgICAgICAgICAgIGNvbnN0IGludml0ZXIgPSBncm91cC5pbnZpdGVyIHx8IHt9O1xuICAgICAgICAgICAgbGV0IGludml0ZXJOYW1lID0gaW52aXRlci51c2VySWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5pbnZpdGVyUHJvZmlsZSkge1xuICAgICAgICAgICAgICAgIGludml0ZXJOYW1lID0gdGhpcy5zdGF0ZS5pbnZpdGVyUHJvZmlsZS5kaXNwbGF5TmFtZSB8fCBpbnZpdGVyLnVzZXJJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19tZW1iZXJzaGlwU2VjdGlvbiBteF9Hcm91cFZpZXdfbWVtYmVyc2hpcFNlY3Rpb25faW52aXRlZFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X21lbWJlcnNoaXBTdWJTZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X21lbWJlcnNoaXBTZWN0aW9uX2Rlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QmFzZUF2YXRhciB1cmw9e2h0dHBJbnZpdGVyQXZhdGFyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9e2ludml0ZXJOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXszNn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezM2fVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCIlKGludml0ZXIpcyBoYXMgaW52aXRlZCB5b3UgdG8gam9pbiB0aGlzIGNvbW11bml0eVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52aXRlcjogaW52aXRlck5hbWUgfHwgX3QoXCJTb21lb25lXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfbWVtYmVyc2hpcF9idXR0b25Db250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld190ZXh0QnV0dG9uIG14X1Jvb21IZWFkZXJfdGV4dEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25BY2NlcHRJbnZpdGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQWNjZXB0XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld190ZXh0QnV0dG9uIG14X1Jvb21IZWFkZXJfdGV4dEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25SZWplY3RJbnZpdGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiRGVjbGluZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1lbWJlcnNoaXBDb250YWluZXJFeHRyYUNsYXNzZXM7XG4gICAgICAgIGxldCBtZW1iZXJzaGlwQnV0dG9uRXh0cmFDbGFzc2VzO1xuICAgICAgICBsZXQgbWVtYmVyc2hpcEJ1dHRvblRvb2x0aXA7XG4gICAgICAgIGxldCBtZW1iZXJzaGlwQnV0dG9uVGV4dDtcbiAgICAgICAgbGV0IG1lbWJlcnNoaXBCdXR0b25PbkNsaWNrO1xuXG4gICAgICAgIC8vIFVzZXIgaXMgbm90IGluIHRoZSBncm91cFxuICAgICAgICBpZiAoKCFncm91cCB8fCBncm91cC5teU1lbWJlcnNoaXAgPT09ICdsZWF2ZScpICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnN1bW1hcnkgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc3VtbWFyeS5wcm9maWxlICYmXG4gICAgICAgICAgICBCb29sZWFuKHRoaXMuc3RhdGUuc3VtbWFyeS5wcm9maWxlLmlzX29wZW5seV9qb2luYWJsZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBtZW1iZXJzaGlwQnV0dG9uVGV4dCA9IF90KFwiSm9pbiB0aGlzIGNvbW11bml0eVwiKTtcbiAgICAgICAgICAgIG1lbWJlcnNoaXBCdXR0b25PbkNsaWNrID0gdGhpcy5fb25Kb2luQ2xpY2s7XG5cbiAgICAgICAgICAgIG1lbWJlcnNoaXBCdXR0b25FeHRyYUNsYXNzZXMgPSAnbXhfR3JvdXBWaWV3X2pvaW5CdXR0b24nO1xuICAgICAgICAgICAgbWVtYmVyc2hpcENvbnRhaW5lckV4dHJhQ2xhc3NlcyA9ICdteF9Hcm91cFZpZXdfbWVtYmVyc2hpcFNlY3Rpb25fbGVhdmUnO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgZ3JvdXAgJiZcbiAgICAgICAgICAgIGdyb3VwLm15TWVtYmVyc2hpcCA9PT0gJ2pvaW4nICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmVkaXRpbmdcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBtZW1iZXJzaGlwQnV0dG9uVGV4dCA9IF90KFwiTGVhdmUgdGhpcyBjb21tdW5pdHlcIik7XG4gICAgICAgICAgICBtZW1iZXJzaGlwQnV0dG9uT25DbGljayA9IHRoaXMuX29uTGVhdmVDbGljaztcbiAgICAgICAgICAgIG1lbWJlcnNoaXBCdXR0b25Ub29sdGlwID0gdGhpcy5zdGF0ZS5pc1VzZXJQcml2aWxlZ2VkID9cbiAgICAgICAgICAgICAgICBfdChcIllvdSBhcmUgYW4gYWRtaW5pc3RyYXRvciBvZiB0aGlzIGNvbW11bml0eVwiKSA6XG4gICAgICAgICAgICAgICAgX3QoXCJZb3UgYXJlIGEgbWVtYmVyIG9mIHRoaXMgY29tbXVuaXR5XCIpO1xuXG4gICAgICAgICAgICBtZW1iZXJzaGlwQnV0dG9uRXh0cmFDbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgICdteF9Hcm91cFZpZXdfbGVhdmVCdXR0b24nOiB0cnVlLFxuICAgICAgICAgICAgICAgICdteF9Sb29tSGVhZGVyX3RleHRCdXR0b25fZGFuZ2VyJzogdGhpcy5zdGF0ZS5pc1VzZXJQcml2aWxlZ2VkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1lbWJlcnNoaXBDb250YWluZXJFeHRyYUNsYXNzZXMgPSAnbXhfR3JvdXBWaWV3X21lbWJlcnNoaXBTZWN0aW9uX2pvaW5lZCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXBCdXR0b25DbGFzc2VzID0gY2xhc3NuYW1lcyhbXG4gICAgICAgICAgICAnbXhfUm9vbUhlYWRlcl90ZXh0QnV0dG9uJyxcbiAgICAgICAgICAgICdteF9Hcm91cFZpZXdfdGV4dEJ1dHRvbicsXG4gICAgICAgIF0sXG4gICAgICAgICAgICBtZW1iZXJzaGlwQnV0dG9uRXh0cmFDbGFzc2VzLFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXBDb250YWluZXJDbGFzc2VzID0gY2xhc3NuYW1lcyhcbiAgICAgICAgICAgICdteF9Hcm91cFZpZXdfbWVtYmVyc2hpcFNlY3Rpb24nLFxuICAgICAgICAgICAgbWVtYmVyc2hpcENvbnRhaW5lckV4dHJhQ2xhc3NlcyxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9e21lbWJlcnNoaXBDb250YWluZXJDbGFzc2VzfT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X21lbWJlcnNoaXBTdWJTZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgeyAvKiBUaGUgPGRpdiAvPiBpcyBmb3IgZmxleCBhbGlnbm1lbnQgKi8gfVxuICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5tZW1iZXJzaGlwQnVzeSA/IDxTcGlubmVyIC8+IDogPGRpdiAvPiB9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfbWVtYmVyc2hpcF9idXR0b25Db250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bWVtYmVyc2hpcEJ1dHRvbkNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXttZW1iZXJzaGlwQnV0dG9uT25DbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXttZW1iZXJzaGlwQnV0dG9uVG9vbHRpcH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBtZW1iZXJzaGlwQnV0dG9uVGV4dCB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgX2dldEpvaW5hYmxlTm9kZSgpIHtcbiAgICAgICAgY29uc3QgSW5saW5lU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLklubGluZVNwaW5uZXInKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZWRpdGluZyA/IDxkaXY+XG4gICAgICAgICAgICA8aDM+XG4gICAgICAgICAgICAgICAgeyBfdCgnV2hvIGNhbiBqb2luIHRoaXMgY29tbXVuaXR5PycpIH1cbiAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuZ3JvdXBKb2luYWJsZUxvYWRpbmcgP1xuICAgICAgICAgICAgICAgICAgICA8SW5saW5lU3Bpbm5lciAvPiA6IDxkaXYgLz5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e0dST1VQX0pPSU5QT0xJQ1lfSU5WSVRFfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5qb2luYWJsZUZvcm0ucG9saWN5VHlwZSA9PT0gR1JPVVBfSk9JTlBPTElDWV9JTlZJVEV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25Kb2luYWJsZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfbGFiZWxfdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnT25seSBwZW9wbGUgd2hvIGhhdmUgYmVlbiBpbnZpdGVkJykgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17R1JPVVBfSk9JTlBPTElDWV9PUEVOfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5qb2luYWJsZUZvcm0ucG9saWN5VHlwZSA9PT0gR1JPVVBfSk9JTlBPTElDWV9PUEVOfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uSm9pbmFibGVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2xhYmVsX3RleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0V2ZXJ5b25lJykgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PiA6IG51bGw7XG4gICAgfVxuXG4gICAgX2dldExvbmdEZXNjcmlwdGlvbk5vZGUoKSB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLnN0YXRlLnN1bW1hcnk7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbiA9IG51bGw7XG4gICAgICAgIGlmIChzdW1tYXJ5LnByb2ZpbGUgJiYgc3VtbWFyeS5wcm9maWxlLmxvbmdfZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gc2FuaXRpemVkSHRtbE5vZGUoc3VtbWFyeS5wcm9maWxlLmxvbmdfZGVzY3JpcHRpb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZCkge1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2dyb3VwRGVzY19wbGFjZWhvbGRlclwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25FZGl0Q2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgJ1lvdXIgY29tbXVuaXR5IGhhc25cXCd0IGdvdCBhIExvbmcgRGVzY3JpcHRpb24sIGEgSFRNTCBwYWdlIHRvIHNob3cgdG8gY29tbXVuaXR5IG1lbWJlcnMuPGJyIC8+JyArXG4gICAgICAgICAgICAgICAgICAgICdDbGljayBoZXJlIHRvIG9wZW4gc2V0dGluZ3MgYW5kIGdpdmUgaXQgb25lIScsXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICB7ICdicic6IDxiciAvPiB9LFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdyb3VwRGVzY0VkaXRpbmdDbGFzc2VzID0gY2xhc3NuYW1lcyh7XG4gICAgICAgICAgICBcIm14X0dyb3VwVmlld19ncm91cERlc2NcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibXhfR3JvdXBWaWV3X2dyb3VwRGVzY19kaXNhYmxlZFwiOiAhdGhpcy5zdGF0ZS5pc1VzZXJQcml2aWxlZ2VkLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5lZGl0aW5nID9cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtncm91cERlc2NFZGl0aW5nQ2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgPGgzPiB7IF90KFwiTG9uZyBEZXNjcmlwdGlvbiAoSFRNTClcIikgfSA8L2gzPlxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wcm9maWxlRm9ybS5sb25nX2Rlc2NyaXB0aW9ufVxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoTE9OR19ERVNDX1BMQUNFSE9MREVSKX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uTG9uZ0Rlc2NDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PVwiNFwiXG4gICAgICAgICAgICAgICAgICAgIGtleT1cImVkaXRMb25nRGVzY1wiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PiA6XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19ncm91cERlc2NcIj5cbiAgICAgICAgICAgICAgICB7IGRlc2NyaXB0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEdyb3VwQXZhdGFyID0gc2RrLmdldENvbXBvbmVudChcImF2YXRhcnMuR3JvdXBBdmF0YXJcIik7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zdW1tYXJ5TG9hZGluZyAmJiB0aGlzLnN0YXRlLmVycm9yID09PSBudWxsIHx8IHRoaXMuc3RhdGUuc2F2aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gPFNwaW5uZXIgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zdW1tYXJ5ICYmICF0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5zdGF0ZS5zdW1tYXJ5O1xuXG4gICAgICAgICAgICBsZXQgYXZhdGFyTm9kZTtcbiAgICAgICAgICAgIGxldCBuYW1lTm9kZTtcbiAgICAgICAgICAgIGxldCBzaG9ydERlc2NOb2RlO1xuICAgICAgICAgICAgY29uc3QgcmlnaHRCdXR0b25zID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0aW5nICYmIHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZCkge1xuICAgICAgICAgICAgICAgIGxldCBhdmF0YXJJbWFnZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS51cGxvYWRpbmdBdmF0YXIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFySW1hZ2UgPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBHcm91cEF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoJ2F2YXRhcnMuR3JvdXBBdmF0YXInKTtcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFySW1hZ2UgPSA8R3JvdXBBdmF0YXIgZ3JvdXBJZD17dGhpcy5wcm9wcy5ncm91cElkfVxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBOYW1lPXt0aGlzLnN0YXRlLnByb2ZpbGVGb3JtLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cEF2YXRhclVybD17dGhpcy5zdGF0ZS5wcm9maWxlRm9ybS5hdmF0YXJfdXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezI4fSBoZWlnaHQ9ezI4fSByZXNpemVNZXRob2Q9J2Nyb3AnXG4gICAgICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGF2YXRhck5vZGUgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2F2YXRhclBpY2tlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJhdmF0YXJJbnB1dFwiIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19hdmF0YXJQaWNrZXJfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGF2YXRhckltYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19hdmF0YXJQaWNrZXJfZWRpdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwiYXZhdGFySW5wdXRcIiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfYXZhdGFyUGlja2VyX2xhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9jYW1lcmEuc3ZnXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtfdChcIlVwbG9hZCBhdmF0YXJcIil9IHRpdGxlPXtfdChcIlVwbG9hZCBhdmF0YXJcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjE3XCIgaGVpZ2h0PVwiMTVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwiYXZhdGFySW5wdXRcIiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfdXBsb2FkSW5wdXRcIiB0eXBlPVwiZmlsZVwiIG9uQ2hhbmdlPXt0aGlzLl9vbkF2YXRhclNlbGVjdGVkfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBFZGl0YWJsZVRleHQgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuRWRpdGFibGVUZXh0XCIpO1xuXG4gICAgICAgICAgICAgICAgbmFtZU5vZGUgPSA8RWRpdGFibGVUZXh0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19lZGl0YWJsZVwiXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyQ2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X3BsYWNlaG9sZGVyXCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KCdDb21tdW5pdHkgTmFtZScpfVxuICAgICAgICAgICAgICAgICAgICBibHVyVG9DYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUucHJvZmlsZUZvcm0ubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgb25WYWx1ZUNoYW5nZWQ9e3RoaXMuX29uTmFtZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgZGlyPVwiYXV0b1wiIC8+O1xuXG4gICAgICAgICAgICAgICAgc2hvcnREZXNjTm9kZSA9IDxFZGl0YWJsZVRleHRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2VkaXRhYmxlXCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXJDbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfcGxhY2Vob2xkZXJcIlxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJEZXNjcmlwdGlvblwiKX1cbiAgICAgICAgICAgICAgICAgICAgYmx1clRvQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLnByb2ZpbGVGb3JtLnNob3J0X2Rlc2NyaXB0aW9ufVxuICAgICAgICAgICAgICAgICAgICBvblZhbHVlQ2hhbmdlZD17dGhpcy5fb25TaG9ydERlc2NDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PVwiMFwiXG4gICAgICAgICAgICAgICAgICAgIGRpcj1cImF1dG9cIiAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25Hcm91cEhlYWRlckl0ZW1DbGljayA9IHRoaXMuc3RhdGUuaXNVc2VyTWVtYmVyID8gdGhpcy5fb25FZGl0Q2xpY2sgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwQXZhdGFyVXJsID0gc3VtbWFyeS5wcm9maWxlID8gc3VtbWFyeS5wcm9maWxlLmF2YXRhcl91cmwgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwTmFtZSA9IHN1bW1hcnkucHJvZmlsZSA/IHN1bW1hcnkucHJvZmlsZS5uYW1lIDogbnVsbDtcbiAgICAgICAgICAgICAgICBhdmF0YXJOb2RlID0gPEdyb3VwQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH1cbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBBdmF0YXJVcmw9e2dyb3VwQXZhdGFyVXJsfVxuICAgICAgICAgICAgICAgICAgICBncm91cE5hbWU9e2dyb3VwTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25Hcm91cEhlYWRlckl0ZW1DbGlja31cbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezI4fSBoZWlnaHQ9ezI4fVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgIGlmIChzdW1tYXJ5LnByb2ZpbGUgJiYgc3VtbWFyeS5wcm9maWxlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZU5vZGUgPSA8ZGl2IG9uQ2xpY2s9e29uR3JvdXBIZWFkZXJJdGVtQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+eyBzdW1tYXJ5LnByb2ZpbGUubmFtZSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2hlYWRlcl9ncm91cGlkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHsgdGhpcy5wcm9wcy5ncm91cElkIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuYW1lTm9kZSA9IDxzcGFuIG9uQ2xpY2s9e29uR3JvdXBIZWFkZXJJdGVtQ2xpY2t9PnsgdGhpcy5wcm9wcy5ncm91cElkIH08L3NwYW4+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3VtbWFyeS5wcm9maWxlICYmIHN1bW1hcnkucHJvZmlsZS5zaG9ydF9kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBzaG9ydERlc2NOb2RlID0gPHNwYW4gb25DbGljaz17b25Hcm91cEhlYWRlckl0ZW1DbGlja30+eyBzdW1tYXJ5LnByb2ZpbGUuc2hvcnRfZGVzY3JpcHRpb24gfTwvc3Bhbj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0aW5nKSB7XG4gICAgICAgICAgICAgICAgcmlnaHRCdXR0b25zLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld190ZXh0QnV0dG9uIG14X1Jvb21IZWFkZXJfdGV4dEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJfc2F2ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vblNhdmVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnU2F2ZScpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9ucy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX2NhbmNlbEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJfY2FuY2VsQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9jYW5jZWwuc3ZnXCIpfSBjbGFzc05hbWU9XCJteF9maWx0ZXJGbGlwQ29sb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIGFsdD17X3QoXCJDYW5jZWxcIil9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1bW1hcnkudXNlciAmJiBzdW1tYXJ5LnVzZXIubWVtYmVyc2hpcCA9PT0gJ2pvaW4nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9ucy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfR3JvdXBIZWFkZXJfYnV0dG9uIG14X0dyb3VwSGVhZGVyX2VkaXRCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT1cIl9lZGl0QnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkVkaXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJDb21tdW5pdHkgU2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbnMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfR3JvdXBIZWFkZXJfYnV0dG9uIG14X0dyb3VwSGVhZGVyX3NoYXJlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT1cIl9zaGFyZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vblNoYXJlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoJ1NoYXJlIENvbW11bml0eScpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmlnaHRQYW5lbCA9IHRoaXMuc3RhdGUuc2hvd1JpZ2h0UGFuZWwgPyA8UmlnaHRQYW5lbCBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9IC8+IDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBjb25zdCBoZWFkZXJDbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgIFwibXhfR3JvdXBWaWV3X2hlYWRlclwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwibGlnaHQtcGFuZWxcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0dyb3VwVmlld19oZWFkZXJfdmlld1wiOiAhdGhpcy5zdGF0ZS5lZGl0aW5nLFxuICAgICAgICAgICAgICAgIFwibXhfR3JvdXBWaWV3X2hlYWRlcl9pc1VzZXJNZW1iZXJcIjogdGhpcy5zdGF0ZS5pc1VzZXJNZW1iZXIsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxtYWluIGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhoZWFkZXJDbGFzc2VzKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19oZWFkZXJfbGVmdENvbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2hlYWRlcl9hdmF0YXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBhdmF0YXJOb2RlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19oZWFkZXJfaW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19oZWFkZXJfbmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lTm9kZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19oZWFkZXJfc2hvcnREZXNjXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHNob3J0RGVzY05vZGUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfaGVhZGVyX3JpZ2h0Q29sXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByaWdodEJ1dHRvbnMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8R3JvdXBIZWFkZXJCdXR0b25zIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8TWFpblNwbGl0IHBhbmVsPXtyaWdodFBhbmVsfSByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QXV0b0hpZGVTY3JvbGxiYXIgY2xhc3NOYW1lPVwibXhfR3JvdXBWaWV3X2JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuX2dldE1lbWJlcnNoaXBTZWN0aW9uKCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5fZ2V0R3JvdXBTZWN0aW9uKCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgICAgICAgICAgICAgPC9NYWluU3BsaXQ+XG4gICAgICAgICAgICAgICAgPC9tYWluPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvci5odHRwU3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwVmlld19lcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnQ29tbXVuaXR5ICUoZ3JvdXBJZClzIG5vdCBmb3VuZCcsIHtncm91cElkOiB0aGlzLnByb3BzLmdyb3VwSWR9KSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBleHRyYVRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IuZXJyY29kZSA9PT0gJ01fVU5SRUNPR05JWkVEJykge1xuICAgICAgICAgICAgICAgICAgICBleHRyYVRleHQgPSA8ZGl2PnsgX3QoJ1RoaXMgaG9tZXNlcnZlciBkb2VzIG5vdCBzdXBwb3J0IGNvbW11bml0aWVzJykgfTwvZGl2PjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Hcm91cFZpZXdfZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0ZhaWxlZCB0byBsb2FkICUoZ3JvdXBJZClzJywge2dyb3VwSWQ6IHRoaXMucHJvcHMuZ3JvdXBJZCB9KSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGV4dHJhVGV4dCB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBzdGF0ZSBmb3IgR3JvdXBWaWV3XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgLz47XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
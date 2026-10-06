"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _actions = require("../../dispatcher/actions");

var _languageHandler = require("../../languageHandler");

var _ContextMenu = require("./ContextMenu");

var _UserSettingsDialog = require("../views/dialogs/UserSettingsDialog");

var _FeedbackDialog = _interopRequireDefault(require("../views/dialogs/FeedbackDialog"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _LogoutDialog = _interopRequireDefault(require("../views/dialogs/LogoutDialog"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _theme = require("../../theme");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _pages = require("../../utils/pages");

var _OwnProfileStore = require("../../stores/OwnProfileStore");

var _AsyncStore = require("../../stores/AsyncStore");

var _BaseAvatar = _interopRequireDefault(require("../views/avatars/BaseAvatar"));

var _classnames = _interopRequireDefault(require("classnames"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../views/elements/AccessibleTooltipButton"));

var _SettingLevel = require("../../settings/SettingLevel");

var _IconizedContextMenu = _interopRequireWildcard(require("../views/context_menus/IconizedContextMenu"));

var _CommunityPrototypeStore = require("../../stores/CommunityPrototypeStore");

var _GroupFilterOrderStore = _interopRequireDefault(require("../../stores/GroupFilterOrderStore"));

var _RoomInvite = require("../../RoomInvite");

var _RightPanelStorePhases = require("../../stores/RightPanelStorePhases");

var _ErrorDialog = _interopRequireDefault(require("../views/dialogs/ErrorDialog"));

var _EditCommunityPrototypeDialog = _interopRequireDefault(require("../views/dialogs/EditCommunityPrototypeDialog"));

var _UIFeature = require("../../settings/UIFeature");

var _HostSignupAction = _interopRequireDefault(require("./HostSignupAction"));

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
class UserMenu extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "themeWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "buttonRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "tagStoreRef", void 0);
    (0, _defineProperty2.default)(this, "onTagStoreUpdate", () => {
      this.forceUpdate(); // we don't have anything useful in state to update
    });
    (0, _defineProperty2.default)(this, "onProfileUpdate", async () => {
      // the store triggered an update, so force a layout update. We don't
      // have any state to store here for that to magically happen.
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onThemeChanged", () => {
      this.setState({
        isDarkTheme: this.isUserOnDarkTheme()
      });
    });
    (0, _defineProperty2.default)(this, "onAction", (ev
    /*: ActionPayload*/
    ) => {
      if (ev.action !== _actions.Action.ToggleUserMenu) return; // not interested

      if (this.state.contextMenuPosition) {
        this.setState({
          contextMenuPosition: null
        });
      } else {
        if (this.buttonRef.current) this.buttonRef.current.click();
      }
    });
    (0, _defineProperty2.default)(this, "onOpenMenuClick", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target;
      this.setState({
        contextMenuPosition: target.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenu", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.setState({
        contextMenuPosition: {
          left: ev.clientX,
          top: ev.clientY,
          width: 20,
          height: 0
        }
      });
    });
    (0, _defineProperty2.default)(this, "onCloseMenu", () => {
      this.setState({
        contextMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "onSwitchThemeClick", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation(); // Disable system theme matching if the user hits this button

      _SettingsStore.default.setValue("use_system_theme", null, _SettingLevel.SettingLevel.DEVICE, false);

      const newTheme = this.state.isDarkTheme ? "light" : "dark";

      _SettingsStore.default.setValue("theme", null, _SettingLevel.SettingLevel.DEVICE, newTheme); // set at same level as Appearance tab

    });
    (0, _defineProperty2.default)(this, "onSettingsOpen", (ev
    /*: ButtonEvent*/
    , tabId
    /*: string*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      const payload
      /*: OpenToTabPayload*/
      = {
        action: _actions.Action.ViewUserSettings,
        initialTabId: tabId
      };

      _dispatcher.default.dispatch(payload);

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onShowArchived", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation(); // TODO: Archived room view: https://github.com/vector-im/element-web/issues/14038
      // Note: You'll need to uncomment the button too.

      console.log("TODO: Show archived rooms");
    });
    (0, _defineProperty2.default)(this, "onProvideFeedback", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _Modal.default.createTrackedDialog('Feedback Dialog', '', _FeedbackDialog.default);

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onSignOutClick", async (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      if (!cli || !cli.isCryptoEnabled() || !(await cli.exportRoomKeys())?.length) {
        // log out without user prompt if they have no local megolm sessions
        _dispatcher.default.dispatch({
          action: 'logout'
        });
      } else {
        _Modal.default.createTrackedDialog('Logout from LeftPanel', '', _LogoutDialog.default);
      }

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onSignInClick", () => {
      _dispatcher.default.dispatch({
        action: 'start_login'
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onRegisterClick", () => {
      _dispatcher.default.dispatch({
        action: 'start_registration'
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onHomeClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'view_home_page'
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onCommunitySettingsClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _Modal.default.createTrackedDialog('Edit Community', '', _EditCommunityPrototypeDialog.default, {
        communityId: _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId()
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onCommunityMembersClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation(); // We'd ideally just pop open a right panel with the member list, but the current
      // way the right panel is structured makes this exceedingly difficult. Instead, we'll
      // switch to the general room and open the member list there as it should be in sync
      // anyways.

      const chat = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityGeneralChat();

      if (chat) {
        _dispatcher.default.dispatch({
          action: 'view_room',
          room_id: chat.roomId
        }, true);

        _dispatcher.default.dispatch({
          action: _actions.Action.SetRightPanelPhase,
          phase: _RightPanelStorePhases.RightPanelPhases.RoomMemberList
        });
      } else {
        // "This should never happen" clauses go here for the prototype.
        _Modal.default.createTrackedDialog('Failed to find general chat', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)('Failed to find the general chat for this community'),
          description: (0, _languageHandler._t)("Failed to find the general chat for this community")
        });
      }

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onCommunityInviteClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      (0, _RoomInvite.showCommunityInviteDialog)(_CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId());
      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "renderContextMenu", () =>
    /*: React.ReactNode*/
    {
      if (!this.state.contextMenuPosition) return null;

      const prototypeCommunityName = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityName();

      let topSection;

      const hostSignupConfig
      /*: IHostSignupConfig*/
      = _SdkConfig.default.get().hostSignup;

      if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        topSection = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_UserMenu_contextMenu_header mx_UserMenu_contextMenu_guestPrompts"
        }, (0, _languageHandler._t)("Got an account? <a>Sign in</a>", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link",
            onClick: this.onSignInClick
          }, sub)
        }), (0, _languageHandler._t)("New here? <a>Create an account</a>", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link",
            onClick: this.onRegisterClick
          }, sub)
        }));
      } else if (hostSignupConfig) {
        if (hostSignupConfig && hostSignupConfig.url) {
          // If hostSignup.domains is set to a non-empty array, only show
          // dialog if the user is on the domain or a subdomain.
          const hostSignupDomains = hostSignupConfig.domains || [];

          const mxDomain = _MatrixClientPeg.MatrixClientPeg.get().getDomain();

          const validDomains = hostSignupDomains.filter(d => d === mxDomain || mxDomain.endsWith(`.${d}`));

          if (!hostSignupConfig.domains || validDomains.length > 0) {
            topSection = /*#__PURE__*/_react.default.createElement("div", {
              onClick: this.onCloseMenu
            }, /*#__PURE__*/_react.default.createElement(_HostSignupAction.default, null));
          }
        }
      }

      let homeButton = null;

      if (this.hasHomePage) {
        homeButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_UserMenu_iconHome",
          label: (0, _languageHandler._t)("Home"),
          onClick: this.onHomeClick
        });
      }

      let feedbackButton;

      if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Feedback)) {
        feedbackButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_UserMenu_iconMessage",
          label: (0, _languageHandler._t)("Feedback"),
          onClick: this.onProvideFeedback
        });
      }

      let primaryHeader = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserMenu_contextMenu_name"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_contextMenu_displayName"
      }, _OwnProfileStore.OwnProfileStore.instance.displayName), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_contextMenu_userId"
      }, _MatrixClientPeg.MatrixClientPeg.get().getUserId()));

      let primaryOptionList = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, homeButton, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_UserMenu_iconBell",
        label: (0, _languageHandler._t)("Notification settings"),
        onClick: e => this.onSettingsOpen(e, _UserSettingsDialog.USER_NOTIFICATIONS_TAB)
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_UserMenu_iconLock",
        label: (0, _languageHandler._t)("Security & privacy"),
        onClick: e => this.onSettingsOpen(e, _UserSettingsDialog.USER_SECURITY_TAB)
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_UserMenu_iconSettings",
        label: (0, _languageHandler._t)("All settings"),
        onClick: e => this.onSettingsOpen(e, null)
      }), feedbackButton), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        red: true
      }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_UserMenu_iconSignOut",
        label: (0, _languageHandler._t)("Sign out"),
        onClick: this.onSignOutClick
      })));

      let secondarySection = null;

      if (prototypeCommunityName) {
        const communityId = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId();

        primaryHeader = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_UserMenu_contextMenu_name"
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_UserMenu_contextMenu_displayName"
        }, prototypeCommunityName));
        let settingsOption;
        let inviteOption;

        if (_CommunityPrototypeStore.CommunityPrototypeStore.instance.canInviteTo(communityId)) {
          inviteOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
            iconClassName: "mx_UserMenu_iconInvite",
            label: (0, _languageHandler._t)("Invite"),
            onClick: this.onCommunityInviteClick
          });
        }

        if (_CommunityPrototypeStore.CommunityPrototypeStore.instance.isAdminOf(communityId)) {
          settingsOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
            iconClassName: "mx_UserMenu_iconSettings",
            label: (0, _languageHandler._t)("Settings"),
            "aria-label": (0, _languageHandler._t)("Community settings"),
            onClick: this.onCommunitySettingsClick
          });
        }

        primaryOptionList = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, settingsOption, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_UserMenu_iconMembers",
          label: (0, _languageHandler._t)("Members"),
          onClick: this.onCommunityMembersClick
        }), inviteOption);
        secondarySection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("hr", null), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_UserMenu_contextMenu_header"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_UserMenu_contextMenu_name"
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_UserMenu_contextMenu_displayName"
        }, _OwnProfileStore.OwnProfileStore.instance.displayName), /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_UserMenu_contextMenu_userId"
        }, _MatrixClientPeg.MatrixClientPeg.get().getUserId()))), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_UserMenu_iconSettings",
          label: (0, _languageHandler._t)("Settings"),
          "aria-label": (0, _languageHandler._t)("User settings"),
          onClick: e => this.onSettingsOpen(e, null)
        }), feedbackButton), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
          red: true
        }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_UserMenu_iconSignOut",
          label: (0, _languageHandler._t)("Sign out"),
          onClick: this.onSignOutClick
        })));
      } else if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        primaryOptionList = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, homeButton, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_UserMenu_iconSettings",
          label: (0, _languageHandler._t)("Settings"),
          onClick: e => this.onSettingsOpen(e, null)
        }), feedbackButton));
      }

      const classes = (0, _classnames.default)({
        "mx_UserMenu_contextMenu": true,
        "mx_UserMenu_contextMenu_prototype": !!prototypeCommunityName
      });
      return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default // numerical adjustments to overlap the context menu by just over the width of the
      // menu icon and make it look connected
      , {
        left: this.state.contextMenuPosition.width + this.state.contextMenuPosition.left - 10,
        top: this.state.contextMenuPosition.top + this.state.contextMenuPosition.height + 8,
        onFinished: this.onCloseMenu,
        className: classes
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserMenu_contextMenu_header"
      }, primaryHeader, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_UserMenu_contextMenu_themeButton",
        onClick: this.onSwitchThemeClick,
        title: this.state.isDarkTheme ? (0, _languageHandler._t)("Switch to light mode") : (0, _languageHandler._t)("Switch to dark mode")
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../res/img/element-icons/roomlist/dark-light-mode.svg"),
        alt: (0, _languageHandler._t)("Switch theme"),
        width: 16
      }))), topSection, primaryOptionList, secondarySection);
    });
    this.state = {
      contextMenuPosition: null,
      isDarkTheme: this.isUserOnDarkTheme()
    };

    _OwnProfileStore.OwnProfileStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onProfileUpdate);
  }

  get hasHomePage()
  /*: boolean*/
  {
    return !!(0, _pages.getHomePageUrl)(_SdkConfig.default.get());
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.themeWatcherRef = _SettingsStore.default.watchSetting("theme", null, this.onThemeChanged);
    this.tagStoreRef = _GroupFilterOrderStore.default.addListener(this.onTagStoreUpdate);
  }

  componentWillUnmount() {
    if (this.themeWatcherRef) _SettingsStore.default.unwatchSetting(this.themeWatcherRef);
    if (this.dispatcherRef) _dispatcher.default.unregister(this.dispatcherRef);

    _OwnProfileStore.OwnProfileStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onProfileUpdate);

    this.tagStoreRef.remove();
  }

  isUserOnDarkTheme()
  /*: boolean*/
  {
    const theme = _SettingsStore.default.getValue("theme");

    if (theme.startsWith("custom-")) {
      return (0, _theme.getCustomTheme)(theme.substring("custom-".length)).is_dark;
    }

    return theme === "dark";
  }

  render() {
    const avatarSize = 32; // should match border-radius of the avatar

    const userId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    const displayName = _OwnProfileStore.OwnProfileStore.instance.displayName || userId;

    const avatarUrl = _OwnProfileStore.OwnProfileStore.instance.getHttpAvatarUrl(avatarSize);

    const prototypeCommunityName = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityName();

    let isPrototype = false;
    let menuName = (0, _languageHandler._t)("User menu");

    let name = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UserMenu_userName"
    }, displayName);

    let buttons = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UserMenu_headerButtons"
    });

    if (prototypeCommunityName) {
      name = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserMenu_doubleName"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_userName"
      }, prototypeCommunityName), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_subUserName"
      }, displayName));
      menuName = (0, _languageHandler._t)("Community and user menu");
      isPrototype = true;
    } else if (_SettingsStore.default.getValue("feature_communities_v2_prototypes")) {
      name = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserMenu_doubleName"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_userName"
      }, (0, _languageHandler._t)("Home")), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_subUserName"
      }, displayName));
      isPrototype = true;
    }

    if (this.props.isMinimized) {
      name = null;
      buttons = null;
    }

    const classes = (0, _classnames.default)({
      'mx_UserMenu': true,
      'mx_UserMenu_minimized': this.props.isMinimized,
      'mx_UserMenu_prototype': isPrototype
    });
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuButton, {
      className: classes,
      onClick: this.onOpenMenuClick,
      inputRef: this.buttonRef,
      label: menuName,
      isExpanded: !!this.state.contextMenuPosition,
      onContextMenu: this.onContextMenu
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserMenu_row"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UserMenu_userAvatarContainer"
    }, /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
      idName: userId,
      name: displayName,
      url: avatarUrl,
      width: avatarSize,
      height: avatarSize,
      resizeMethod: "crop",
      className: "mx_UserMenu_userAvatar"
    })), name, buttons)), this.renderContextMenu());
  }

}

exports.default = UserMenu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVXNlck1lbnUudHN4Il0sIm5hbWVzIjpbIlVzZXJNZW51IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZm9yY2VVcGRhdGUiLCJzZXRTdGF0ZSIsImlzRGFya1RoZW1lIiwiaXNVc2VyT25EYXJrVGhlbWUiLCJldiIsImFjdGlvbiIsIkFjdGlvbiIsIlRvZ2dsZVVzZXJNZW51Iiwic3RhdGUiLCJjb250ZXh0TWVudVBvc2l0aW9uIiwiYnV0dG9uUmVmIiwiY3VycmVudCIsImNsaWNrIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJ0YXJnZXQiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJsZWZ0IiwiY2xpZW50WCIsInRvcCIsImNsaWVudFkiLCJ3aWR0aCIsImhlaWdodCIsIlNldHRpbmdzU3RvcmUiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsIm5ld1RoZW1lIiwidGFiSWQiLCJwYXlsb2FkIiwiVmlld1VzZXJTZXR0aW5ncyIsImluaXRpYWxUYWJJZCIsImRlZmF1bHREaXNwYXRjaGVyIiwiZGlzcGF0Y2giLCJjb25zb2xlIiwibG9nIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiRmVlZGJhY2tEaWFsb2ciLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc0NyeXB0b0VuYWJsZWQiLCJleHBvcnRSb29tS2V5cyIsImxlbmd0aCIsImRpcyIsIkxvZ291dERpYWxvZyIsIkVkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2ciLCJjb21tdW5pdHlJZCIsIkNvbW11bml0eVByb3RvdHlwZVN0b3JlIiwiaW5zdGFuY2UiLCJnZXRTZWxlY3RlZENvbW11bml0eUlkIiwiY2hhdCIsImdldFNlbGVjdGVkQ29tbXVuaXR5R2VuZXJhbENoYXQiLCJyb29tX2lkIiwicm9vbUlkIiwiU2V0UmlnaHRQYW5lbFBoYXNlIiwicGhhc2UiLCJSaWdodFBhbmVsUGhhc2VzIiwiUm9vbU1lbWJlckxpc3QiLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJwcm90b3R5cGVDb21tdW5pdHlOYW1lIiwiZ2V0U2VsZWN0ZWRDb21tdW5pdHlOYW1lIiwidG9wU2VjdGlvbiIsImhvc3RTaWdudXBDb25maWciLCJTZGtDb25maWciLCJob3N0U2lnbnVwIiwiaXNHdWVzdCIsImEiLCJzdWIiLCJvblNpZ25JbkNsaWNrIiwib25SZWdpc3RlckNsaWNrIiwidXJsIiwiaG9zdFNpZ251cERvbWFpbnMiLCJkb21haW5zIiwibXhEb21haW4iLCJnZXREb21haW4iLCJ2YWxpZERvbWFpbnMiLCJmaWx0ZXIiLCJkIiwiZW5kc1dpdGgiLCJvbkNsb3NlTWVudSIsImhvbWVCdXR0b24iLCJoYXNIb21lUGFnZSIsIm9uSG9tZUNsaWNrIiwiZmVlZGJhY2tCdXR0b24iLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIkZlZWRiYWNrIiwib25Qcm92aWRlRmVlZGJhY2siLCJwcmltYXJ5SGVhZGVyIiwiT3duUHJvZmlsZVN0b3JlIiwiZGlzcGxheU5hbWUiLCJnZXRVc2VySWQiLCJwcmltYXJ5T3B0aW9uTGlzdCIsImUiLCJvblNldHRpbmdzT3BlbiIsIlVTRVJfTk9USUZJQ0FUSU9OU19UQUIiLCJVU0VSX1NFQ1VSSVRZX1RBQiIsIm9uU2lnbk91dENsaWNrIiwic2Vjb25kYXJ5U2VjdGlvbiIsInNldHRpbmdzT3B0aW9uIiwiaW52aXRlT3B0aW9uIiwiY2FuSW52aXRlVG8iLCJvbkNvbW11bml0eUludml0ZUNsaWNrIiwiaXNBZG1pbk9mIiwib25Db21tdW5pdHlTZXR0aW5nc0NsaWNrIiwib25Db21tdW5pdHlNZW1iZXJzQ2xpY2siLCJjbGFzc2VzIiwib25Td2l0Y2hUaGVtZUNsaWNrIiwicmVxdWlyZSIsIm9uIiwiVVBEQVRFX0VWRU5UIiwib25Qcm9maWxlVXBkYXRlIiwiY29tcG9uZW50RGlkTW91bnQiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsInRoZW1lV2F0Y2hlclJlZiIsIndhdGNoU2V0dGluZyIsIm9uVGhlbWVDaGFuZ2VkIiwidGFnU3RvcmVSZWYiLCJHcm91cEZpbHRlck9yZGVyU3RvcmUiLCJhZGRMaXN0ZW5lciIsIm9uVGFnU3RvcmVVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVud2F0Y2hTZXR0aW5nIiwidW5yZWdpc3RlciIsIm9mZiIsInJlbW92ZSIsInRoZW1lIiwic3RhcnRzV2l0aCIsInN1YnN0cmluZyIsImlzX2RhcmsiLCJyZW5kZXIiLCJhdmF0YXJTaXplIiwidXNlcklkIiwiYXZhdGFyVXJsIiwiZ2V0SHR0cEF2YXRhclVybCIsImlzUHJvdG90eXBlIiwibWVudU5hbWUiLCJuYW1lIiwiYnV0dG9ucyIsImlzTWluaW1pemVkIiwib25PcGVuTWVudUNsaWNrIiwib25Db250ZXh0TWVudSIsInJlbmRlckNvbnRleHRNZW51Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUlBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXBEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFvRGUsTUFBTUEsUUFBTixTQUF1QkMsZUFBTUM7QUFBN0I7QUFBdUQ7QUFNbEVDLEVBQUFBLFdBQVcsQ0FBQ0M7QUFBRDtBQUFBLElBQWdCO0FBQ3ZCLFVBQU1BLEtBQU47QUFEdUI7QUFBQTtBQUFBLGtFQUg2Qix1QkFHN0I7QUFBQTtBQUFBLDREQTRCQSxNQUFNO0FBQzdCLFdBQUtDLFdBQUwsR0FENkIsQ0FDVDtBQUN2QixL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Ryx5QkFBVztBQUN2QixxQkFBZSxJQURRO0FBRXZCLCtCQUF5QixLQUFLL0csS0FBTCxDQUFXa0osV0FGYjtBQUd2QiwrQkFBeUJKO0FBSEYsS0FBWCxDQUFoQjtBQU1BLHdCQUNJLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLHFCQUNJLDZCQUFDLDhCQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUUvQixPQURmO0FBRUksTUFBQSxPQUFPLEVBQUUsS0FBS29DLGVBRmxCO0FBR0ksTUFBQSxRQUFRLEVBQUUsS0FBS3hJLFNBSG5CO0FBSUksTUFBQSxLQUFLLEVBQUVvSSxRQUpYO0FBS0ksTUFBQSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUt0SSxLQUFMLENBQVdDLG1CQUw3QjtBQU1JLE1BQUEsYUFBYSxFQUFFLEtBQUswSTtBQU54QixvQkFRSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixvQkFDSSw2QkFBQyxtQkFBRDtBQUNJLE1BQUEsTUFBTSxFQUFFVCxNQURaO0FBRUksTUFBQSxJQUFJLEVBQUU1QyxXQUZWO0FBR0ksTUFBQSxHQUFHLEVBQUU2QyxTQUhUO0FBSUksTUFBQSxLQUFLLEVBQUVGLFVBSlg7QUFLSSxNQUFBLE1BQU0sRUFBRUEsVUFMWjtBQU1JLE1BQUEsWUFBWSxFQUFDLE1BTmpCO0FBT0ksTUFBQSxTQUFTLEVBQUM7QUFQZCxNQURKLENBREosRUFZS00sSUFaTCxFQWFLQyxPQWJMLENBUkosQ0FESixFQXlCSyxLQUFLSSxpQkFBTCxFQXpCTCxDQURKO0FBNkJIOztBQTNmaUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAsIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IENvbnRleHRNZW51QnV0dG9uIH0gZnJvbSBcIi4vQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7VVNFUl9OT1RJRklDQVRJT05TX1RBQiwgVVNFUl9TRUNVUklUWV9UQUJ9IGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL1VzZXJTZXR0aW5nc0RpYWxvZ1wiO1xuaW1wb3J0IHsgT3BlblRvVGFiUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL09wZW5Ub1RhYlBheWxvYWRcIjtcbmltcG9ydCBGZWVkYmFja0RpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9GZWVkYmFja0RpYWxvZ1wiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IExvZ291dERpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9Mb2dvdXREaWFsb2dcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge2dldEN1c3RvbVRoZW1lfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uLCB7QnV0dG9uRXZlbnR9IGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB7Z2V0SG9tZVBhZ2VVcmx9IGZyb20gXCIuLi8uLi91dGlscy9wYWdlc1wiO1xuaW1wb3J0IHsgT3duUHJvZmlsZVN0b3JlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Pd25Qcm9maWxlU3RvcmVcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IEJhc2VBdmF0YXIgZnJvbSAnLi4vdmlld3MvYXZhdGFycy9CYXNlQXZhdGFyJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgSWNvbml6ZWRDb250ZXh0TWVudSwge1xuICAgIEljb25pemVkQ29udGV4dE1lbnVPcHRpb24sXG4gICAgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QsXG59IGZyb20gXCIuLi92aWV3cy9jb250ZXh0X21lbnVzL0ljb25pemVkQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7IENvbW11bml0eVByb3RvdHlwZVN0b3JlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Db21tdW5pdHlQcm90b3R5cGVTdG9yZVwiO1xuaW1wb3J0ICogYXMgZmJFbWl0dGVyIGZyb20gXCJmYmVtaXR0ZXJcIjtcbmltcG9ydCBHcm91cEZpbHRlck9yZGVyU3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9Hcm91cEZpbHRlck9yZGVyU3RvcmVcIjtcbmltcG9ydCB7IHNob3dDb21tdW5pdHlJbnZpdGVEaWFsb2cgfSBmcm9tIFwiLi4vLi4vUm9vbUludml0ZVwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBSaWdodFBhbmVsUGhhc2VzIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9SaWdodFBhbmVsU3RvcmVQaGFzZXNcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IEVkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2cgZnJvbSBcIi4uL3ZpZXdzL2RpYWxvZ3MvRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZ1wiO1xuaW1wb3J0IHtVSUZlYXR1cmV9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCBIb3N0U2lnbnVwQWN0aW9uIGZyb20gXCIuL0hvc3RTaWdudXBBY3Rpb25cIjtcbmltcG9ydCB7SUhvc3RTaWdudXBDb25maWd9IGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0hvc3RTaWdudXBEaWFsb2dUeXBlc1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBpc01pbmltaXplZDogYm9vbGVhbjtcbn1cblxudHlwZSBQYXJ0aWFsRE9NUmVjdCA9IFBpY2s8RE9NUmVjdCwgXCJ3aWR0aFwiIHwgXCJsZWZ0XCIgfCBcInRvcFwiIHwgXCJoZWlnaHRcIj47XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNvbnRleHRNZW51UG9zaXRpb246IFBhcnRpYWxET01SZWN0O1xuICAgIGlzRGFya1RoZW1lOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2VyTWVudSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgdGhlbWVXYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBidXR0b25SZWY6IFJlYWN0LlJlZk9iamVjdDxIVE1MQnV0dG9uRWxlbWVudD4gPSBjcmVhdGVSZWYoKTtcbiAgICBwcml2YXRlIHRhZ1N0b3JlUmVmOiBmYkVtaXR0ZXIuRXZlbnRTdWJzY3JpcHRpb247XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgY29udGV4dE1lbnVQb3NpdGlvbjogbnVsbCxcbiAgICAgICAgICAgIGlzRGFya1RoZW1lOiB0aGlzLmlzVXNlck9uRGFya1RoZW1lKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vblByb2ZpbGVVcGRhdGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGhhc0hvbWVQYWdlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISFnZXRIb21lUGFnZVVybChTZGtDb25maWcuZ2V0KCkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGVmYXVsdERpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyUmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJ0aGVtZVwiLCBudWxsLCB0aGlzLm9uVGhlbWVDaGFuZ2VkKTtcbiAgICAgICAgdGhpcy50YWdTdG9yZVJlZiA9IEdyb3VwRmlsdGVyT3JkZXJTdG9yZS5hZGRMaXN0ZW5lcih0aGlzLm9uVGFnU3RvcmVVcGRhdGUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMudGhlbWVXYXRjaGVyUmVmKSBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHRoaXMudGhlbWVXYXRjaGVyUmVmKTtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlclJlZikgZGVmYXVsdERpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vblByb2ZpbGVVcGRhdGUpO1xuICAgICAgICB0aGlzLnRhZ1N0b3JlUmVmLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25UYWdTdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyB3ZSBkb24ndCBoYXZlIGFueXRoaW5nIHVzZWZ1bCBpbiBzdGF0ZSB0byB1cGRhdGVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpc1VzZXJPbkRhcmtUaGVtZSgpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgdGhlbWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwidGhlbWVcIik7XG4gICAgICAgIGlmICh0aGVtZS5zdGFydHNXaXRoKFwiY3VzdG9tLVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGdldEN1c3RvbVRoZW1lKHRoZW1lLnN1YnN0cmluZyhcImN1c3RvbS1cIi5sZW5ndGgpKS5pc19kYXJrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGVtZSA9PT0gXCJkYXJrXCI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblByb2ZpbGVVcGRhdGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIHRoZSBzdG9yZSB0cmlnZ2VyZWQgYW4gdXBkYXRlLCBzbyBmb3JjZSBhIGxheW91dCB1cGRhdGUuIFdlIGRvbid0XG4gICAgICAgIC8vIGhhdmUgYW55IHN0YXRlIHRvIHN0b3JlIGhlcmUgZm9yIHRoYXQgdG8gbWFnaWNhbGx5IGhhcHBlbi5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVGhlbWVDaGFuZ2VkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtpc0RhcmtUaGVtZTogdGhpcy5pc1VzZXJPbkRhcmtUaGVtZSgpfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAoZXY6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKGV2LmFjdGlvbiAhPT0gQWN0aW9uLlRvZ2dsZVVzZXJNZW51KSByZXR1cm47IC8vIG5vdCBpbnRlcmVzdGVkXG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuYnV0dG9uUmVmLmN1cnJlbnQpIHRoaXMuYnV0dG9uUmVmLmN1cnJlbnQuY2xpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uT3Blbk1lbnVDbGljayA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXYudGFyZ2V0IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCl9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbnRleHRNZW51ID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51UG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBldi5jbGllbnRYLFxuICAgICAgICAgICAgICAgIHRvcDogZXYuY2xpZW50WSxcbiAgICAgICAgICAgICAgICB3aWR0aDogMjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DbG9zZU1lbnUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN3aXRjaFRoZW1lQ2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gRGlzYWJsZSBzeXN0ZW0gdGhlbWUgbWF0Y2hpbmcgaWYgdGhlIHVzZXIgaGl0cyB0aGlzIGJ1dHRvblxuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwidXNlX3N5c3RlbV90aGVtZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBmYWxzZSk7XG5cbiAgICAgICAgY29uc3QgbmV3VGhlbWUgPSB0aGlzLnN0YXRlLmlzRGFya1RoZW1lID8gXCJsaWdodFwiIDogXCJkYXJrXCI7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJ0aGVtZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBuZXdUaGVtZSk7IC8vIHNldCBhdCBzYW1lIGxldmVsIGFzIEFwcGVhcmFuY2UgdGFiXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TZXR0aW5nc09wZW4gPSAoZXY6IEJ1dHRvbkV2ZW50LCB0YWJJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IHBheWxvYWQ6IE9wZW5Ub1RhYlBheWxvYWQgPSB7YWN0aW9uOiBBY3Rpb24uVmlld1VzZXJTZXR0aW5ncywgaW5pdGlhbFRhYklkOiB0YWJJZH07XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHBheWxvYWQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNob3dBcmNoaXZlZCA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gVE9ETzogQXJjaGl2ZWQgcm9vbSB2aWV3OiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDAzOFxuICAgICAgICAvLyBOb3RlOiBZb3UnbGwgbmVlZCB0byB1bmNvbW1lbnQgdGhlIGJ1dHRvbiB0b28uXG4gICAgICAgIGNvbnNvbGUubG9nKFwiVE9ETzogU2hvdyBhcmNoaXZlZCByb29tc1wiKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblByb3ZpZGVGZWVkYmFjayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmVlZGJhY2sgRGlhbG9nJywgJycsIEZlZWRiYWNrRGlhbG9nKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pOyAvLyBhbHNvIGNsb3NlIHRoZSBtZW51XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TaWduT3V0Q2xpY2sgPSBhc3luYyAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGkgfHwgIWNsaS5pc0NyeXB0b0VuYWJsZWQoKSB8fCAhKGF3YWl0IGNsaS5leHBvcnRSb29tS2V5cygpKT8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBsb2cgb3V0IHdpdGhvdXQgdXNlciBwcm9tcHQgaWYgdGhleSBoYXZlIG5vIGxvY2FsIG1lZ29sbSBzZXNzaW9uc1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdsb2dvdXQnfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdMb2dvdXQgZnJvbSBMZWZ0UGFuZWwnLCAnJywgTG9nb3V0RGlhbG9nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTsgLy8gYWxzbyBjbG9zZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2lnbkluQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3N0YXJ0X2xvZ2luJyB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pOyAvLyBhbHNvIGNsb3NlIHRoZSBtZW51XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWdpc3RlckNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdzdGFydF9yZWdpc3RyYXRpb24nIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkhvbWVDbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogJ3ZpZXdfaG9tZV9wYWdlJ30pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbW11bml0eVNldHRpbmdzQ2xpY2sgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0VkaXQgQ29tbXVuaXR5JywgJycsIEVkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2csIHtcbiAgICAgICAgICAgIGNvbW11bml0eUlkOiBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRTZWxlY3RlZENvbW11bml0eUlkKCksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbW11bml0eU1lbWJlcnNDbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gV2UnZCBpZGVhbGx5IGp1c3QgcG9wIG9wZW4gYSByaWdodCBwYW5lbCB3aXRoIHRoZSBtZW1iZXIgbGlzdCwgYnV0IHRoZSBjdXJyZW50XG4gICAgICAgIC8vIHdheSB0aGUgcmlnaHQgcGFuZWwgaXMgc3RydWN0dXJlZCBtYWtlcyB0aGlzIGV4Y2VlZGluZ2x5IGRpZmZpY3VsdC4gSW5zdGVhZCwgd2UnbGxcbiAgICAgICAgLy8gc3dpdGNoIHRvIHRoZSBnZW5lcmFsIHJvb20gYW5kIG9wZW4gdGhlIG1lbWJlciBsaXN0IHRoZXJlIGFzIGl0IHNob3VsZCBiZSBpbiBzeW5jXG4gICAgICAgIC8vIGFueXdheXMuXG4gICAgICAgIGNvbnN0IGNoYXQgPSBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRTZWxlY3RlZENvbW11bml0eUdlbmVyYWxDaGF0KCk7XG4gICAgICAgIGlmIChjaGF0KSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogY2hhdC5yb29tSWQsXG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBBY3Rpb24uU2V0UmlnaHRQYW5lbFBoYXNlLCBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVyTGlzdH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gXCJUaGlzIHNob3VsZCBuZXZlciBoYXBwZW5cIiBjbGF1c2VzIGdvIGhlcmUgZm9yIHRoZSBwcm90b3R5cGUuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gZmluZCBnZW5lcmFsIGNoYXQnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZhaWxlZCB0byBmaW5kIHRoZSBnZW5lcmFsIGNoYXQgZm9yIHRoaXMgY29tbXVuaXR5JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiRmFpbGVkIHRvIGZpbmQgdGhlIGdlbmVyYWwgY2hhdCBmb3IgdGhpcyBjb21tdW5pdHlcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbW11bml0eUludml0ZUNsaWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBzaG93Q29tbXVuaXR5SW52aXRlRGlhbG9nKENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5SWQoKSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTsgLy8gYWxzbyBjbG9zZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckNvbnRleHRNZW51ID0gKCk6IFJlYWN0LlJlYWN0Tm9kZSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBwcm90b3R5cGVDb21tdW5pdHlOYW1lID0gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlOYW1lKCk7XG5cbiAgICAgICAgbGV0IHRvcFNlY3Rpb247XG4gICAgICAgIGNvbnN0IGhvc3RTaWdudXBDb25maWc6IElIb3N0U2lnbnVwQ29uZmlnID0gU2RrQ29uZmlnLmdldCgpLmhvc3RTaWdudXA7XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICB0b3BTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfaGVhZGVyIG14X1VzZXJNZW51X2NvbnRleHRNZW51X2d1ZXN0UHJvbXB0c1wiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJHb3QgYW4gYWNjb3VudD8gPGE+U2lnbiBpbjwvYT5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXt0aGlzLm9uU2lnbkluQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJOZXcgaGVyZT8gPGE+Q3JlYXRlIGFuIGFjY291bnQ8L2E+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rXCIgb25DbGljaz17dGhpcy5vblJlZ2lzdGVyQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICB9IGVsc2UgaWYgKGhvc3RTaWdudXBDb25maWcpIHtcbiAgICAgICAgICAgIGlmIChob3N0U2lnbnVwQ29uZmlnICYmIGhvc3RTaWdudXBDb25maWcudXJsKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgaG9zdFNpZ251cC5kb21haW5zIGlzIHNldCB0byBhIG5vbi1lbXB0eSBhcnJheSwgb25seSBzaG93XG4gICAgICAgICAgICAgICAgLy8gZGlhbG9nIGlmIHRoZSB1c2VyIGlzIG9uIHRoZSBkb21haW4gb3IgYSBzdWJkb21haW4uXG4gICAgICAgICAgICAgICAgY29uc3QgaG9zdFNpZ251cERvbWFpbnMgPSBob3N0U2lnbnVwQ29uZmlnLmRvbWFpbnMgfHwgW107XG4gICAgICAgICAgICAgICAgY29uc3QgbXhEb21haW4gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0RG9tYWluKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsaWREb21haW5zID0gaG9zdFNpZ251cERvbWFpbnMuZmlsdGVyKGQgPT4gKGQgPT09IG14RG9tYWluIHx8IG14RG9tYWluLmVuZHNXaXRoKGAuJHtkfWApKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFob3N0U2lnbnVwQ29uZmlnLmRvbWFpbnMgfHwgdmFsaWREb21haW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wU2VjdGlvbiA9IDxkaXYgb25DbGljaz17dGhpcy5vbkNsb3NlTWVudX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8SG9zdFNpZ251cEFjdGlvbiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhvbWVCdXR0b24gPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5oYXNIb21lUGFnZSkge1xuICAgICAgICAgICAgaG9tZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvbkhvbWVcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJIb21lXCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uSG9tZUNsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZlZWRiYWNrQnV0dG9uO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuRmVlZGJhY2spKSB7XG4gICAgICAgICAgICBmZWVkYmFja0J1dHRvbiA9IDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2ljb25NZXNzYWdlXCJcbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJGZWVkYmFja1wiKX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUHJvdmlkZUZlZWRiYWNrfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJpbWFyeUhlYWRlciA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfbmFtZVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51X2Rpc3BsYXlOYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgIHtPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51X3VzZXJJZFwiPlxuICAgICAgICAgICAgICAgICAgICB7TWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgICBsZXQgcHJpbWFyeU9wdGlvbkxpc3QgPSAoXG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgICAgICB7aG9tZUJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uQmVsbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJOb3RpZmljYXRpb24gc2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gdGhpcy5vblNldHRpbmdzT3BlbihlLCBVU0VSX05PVElGSUNBVElPTlNfVEFCKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uTG9ja1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTZWN1cml0eSAmIHByaXZhY3lcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gdGhpcy5vblNldHRpbmdzT3BlbihlLCBVU0VSX1NFQ1VSSVRZX1RBQil9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvblNldHRpbmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkFsbCBzZXR0aW5nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLm9uU2V0dGluZ3NPcGVuKGUsIG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7LyogPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uQXJjaGl2ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJBcmNoaXZlZCByb29tc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaG93QXJjaGl2ZWR9XG4gICAgICAgICAgICAgICAgICAgIC8+ICovfVxuICAgICAgICAgICAgICAgICAgICB7IGZlZWRiYWNrQnV0dG9uIH1cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCByZWQ+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvblNpZ25PdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2lnbiBvdXRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2lnbk91dENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICApO1xuICAgICAgICBsZXQgc2Vjb25kYXJ5U2VjdGlvbiA9IG51bGw7XG5cbiAgICAgICAgaWYgKHByb3RvdHlwZUNvbW11bml0eU5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW11bml0eUlkID0gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpO1xuICAgICAgICAgICAgcHJpbWFyeUhlYWRlciA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51X25hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfZGlzcGxheU5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwcm90b3R5cGVDb21tdW5pdHlOYW1lfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbGV0IHNldHRpbmdzT3B0aW9uO1xuICAgICAgICAgICAgbGV0IGludml0ZU9wdGlvbjtcbiAgICAgICAgICAgIGlmIChDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5jYW5JbnZpdGVUbyhjb21tdW5pdHlJZCkpIHtcbiAgICAgICAgICAgICAgICBpbnZpdGVPcHRpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvbkludml0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJJbnZpdGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ29tbXVuaXR5SW52aXRlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5pc0FkbWluT2YoY29tbXVuaXR5SWQpKSB7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3NPcHRpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvblNldHRpbmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJDb21tdW5pdHkgc2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ29tbXVuaXR5U2V0dGluZ3NDbGlja31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJpbWFyeU9wdGlvbkxpc3QgPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgICAgICB7c2V0dGluZ3NPcHRpb259XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvbk1lbWJlcnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTWVtYmVyc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db21tdW5pdHlNZW1iZXJzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHtpbnZpdGVPcHRpb259XG4gICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBzZWNvbmRhcnlTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgPGhyIC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51X25hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV9kaXNwbGF5TmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7T3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLmRpc3BsYXlOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV91c2VySWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge01hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2ljb25TZXR0aW5nc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJVc2VyIHNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLm9uU2V0dGluZ3NPcGVuKGUsIG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZmVlZGJhY2tCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgcmVkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvblNpZ25PdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlNpZ24gb3V0XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaWduT3V0Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgcHJpbWFyeU9wdGlvbkxpc3QgPSAoXG4gICAgICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGhvbWVCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvblNldHRpbmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTZXR0aW5nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gdGhpcy5vblNldHRpbmdzT3BlbihlLCBudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGZlZWRiYWNrQnV0dG9uIH1cbiAgICAgICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIFwibXhfVXNlck1lbnVfY29udGV4dE1lbnVcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfcHJvdG90eXBlXCI6ICEhcHJvdG90eXBlQ29tbXVuaXR5TmFtZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIDxJY29uaXplZENvbnRleHRNZW51XG4gICAgICAgICAgICAvLyBudW1lcmljYWwgYWRqdXN0bWVudHMgdG8gb3ZlcmxhcCB0aGUgY29udGV4dCBtZW51IGJ5IGp1c3Qgb3ZlciB0aGUgd2lkdGggb2YgdGhlXG4gICAgICAgICAgICAvLyBtZW51IGljb24gYW5kIG1ha2UgaXQgbG9vayBjb25uZWN0ZWRcbiAgICAgICAgICAgIGxlZnQ9e3RoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbi53aWR0aCArIHRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbi5sZWZ0IC0gMTB9XG4gICAgICAgICAgICB0b3A9e3RoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbi50b3AgKyB0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24uaGVpZ2h0ICsgOH1cbiAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25DbG9zZU1lbnV9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAge3ByaW1hcnlIZWFkZXJ9XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51X3RoZW1lQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblN3aXRjaFRoZW1lQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLnN0YXRlLmlzRGFya1RoZW1lID8gX3QoXCJTd2l0Y2ggdG8gbGlnaHQgbW9kZVwiKSA6IF90KFwiU3dpdGNoIHRvIGRhcmsgbW9kZVwiKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9yb29tbGlzdC9kYXJrLWxpZ2h0LW1vZGUuc3ZnXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtfdChcIlN3aXRjaCB0aGVtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXsxNn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7dG9wU2VjdGlvbn1cbiAgICAgICAgICAgIHtwcmltYXJ5T3B0aW9uTGlzdH1cbiAgICAgICAgICAgIHtzZWNvbmRhcnlTZWN0aW9ufVxuICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+O1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBhdmF0YXJTaXplID0gMzI7IC8vIHNob3VsZCBtYXRjaCBib3JkZXItcmFkaXVzIG9mIHRoZSBhdmF0YXJcblxuICAgICAgICBjb25zdCB1c2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLmRpc3BsYXlOYW1lIHx8IHVzZXJJZDtcbiAgICAgICAgY29uc3QgYXZhdGFyVXJsID0gT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLmdldEh0dHBBdmF0YXJVcmwoYXZhdGFyU2l6ZSk7XG5cbiAgICAgICAgY29uc3QgcHJvdG90eXBlQ29tbXVuaXR5TmFtZSA9IENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5TmFtZSgpO1xuXG4gICAgICAgIGxldCBpc1Byb3RvdHlwZSA9IGZhbHNlO1xuICAgICAgICBsZXQgbWVudU5hbWUgPSBfdChcIlVzZXIgbWVudVwiKTtcbiAgICAgICAgbGV0IG5hbWUgPSA8c3BhbiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV91c2VyTmFtZVwiPntkaXNwbGF5TmFtZX08L3NwYW4+O1xuICAgICAgICBsZXQgYnV0dG9ucyA9IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2hlYWRlckJ1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICB7LyogbWFza2VkIGltYWdlIGluIENTUyAqL31cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHByb3RvdHlwZUNvbW11bml0eU5hbWUpIHtcbiAgICAgICAgICAgIG5hbWUgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9kb3VibGVOYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X3VzZXJOYW1lXCI+e3Byb3RvdHlwZUNvbW11bml0eU5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9zdWJVc2VyTmFtZVwiPntkaXNwbGF5TmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbWVudU5hbWUgPSBfdChcIkNvbW11bml0eSBhbmQgdXNlciBtZW51XCIpO1xuICAgICAgICAgICAgaXNQcm90b3R5cGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2NvbW11bml0aWVzX3YyX3Byb3RvdHlwZXNcIikpIHtcbiAgICAgICAgICAgIG5hbWUgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9kb3VibGVOYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X3VzZXJOYW1lXCI+e190KFwiSG9tZVwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X3N1YlVzZXJOYW1lXCI+e2Rpc3BsYXlOYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpc1Byb3RvdHlwZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIHtcbiAgICAgICAgICAgIG5hbWUgPSBudWxsO1xuICAgICAgICAgICAgYnV0dG9ucyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAnbXhfVXNlck1lbnUnOiB0cnVlLFxuICAgICAgICAgICAgJ214X1VzZXJNZW51X21pbmltaXplZCc6IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQsXG4gICAgICAgICAgICAnbXhfVXNlck1lbnVfcHJvdG90eXBlJzogaXNQcm90b3R5cGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPENvbnRleHRNZW51QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbk9wZW5NZW51Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXt0aGlzLmJ1dHRvblJlZn1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e21lbnVOYW1lfVxuICAgICAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXshIXRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vbkNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X3VzZXJBdmF0YXJDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QmFzZUF2YXRhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZE5hbWU9e3VzZXJJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17ZGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybD17YXZhdGFyVXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXthdmF0YXJTaXplfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNpemVNZXRob2Q9XCJjcm9wXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfdXNlckF2YXRhclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAge2J1dHRvbnN9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvQ29udGV4dE1lbnVCdXR0b24+XG4gICAgICAgICAgICAgICAge3RoaXMucmVuZGVyQ29udGV4dE1lbnUoKX1cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

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

var _SpaceStore = _interopRequireWildcard(require("../../stores/SpaceStore"));

var _RoomName = _interopRequireDefault(require("../views/elements/RoomName"));

var _replaceableComponent = require("../../utils/replaceableComponent");

var _dec, _class, _temp;

let UserMenu = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.UserMenu"), _dec(_class = (_temp = class UserMenu extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "themeWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "dndWatcherRef", void 0);
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
    (0, _defineProperty2.default)(this, "onSelectedSpaceUpdate", async (selectedSpace
    /*: Room*/
    ) => {
      this.setState({
        selectedSpace
      });
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
    (0, _defineProperty2.default)(this, "onDndToggle", ev => {
      ev.stopPropagation();

      const current = _SettingsStore.default.getValue("doNotDisturb");

      _SettingsStore.default.setValue("doNotDisturb", null, _SettingLevel.SettingLevel.DEVICE, !current);
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

    if (_SettingsStore.default.getValue("feature_spaces")) {
      _SpaceStore.default.instance.on(_SpaceStore.UPDATE_SELECTED_SPACE, this.onSelectedSpaceUpdate);
    } // Force update is the easiest way to trigger the UI update (we don't store state for this)


    this.dndWatcherRef = _SettingsStore.default.watchSetting("doNotDisturb", null, () => this.forceUpdate());
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
    if (this.dndWatcherRef) _SettingsStore.default.unwatchSetting(this.dndWatcherRef);
    if (this.dispatcherRef) _dispatcher.default.unregister(this.dispatcherRef);

    _OwnProfileStore.OwnProfileStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onProfileUpdate);

    this.tagStoreRef.remove();

    if (_SettingsStore.default.getValue("feature_spaces")) {
      _SpaceStore.default.instance.off(_SpaceStore.UPDATE_SELECTED_SPACE, this.onSelectedSpaceUpdate);
    }
  }

  isUserOnDarkTheme()
  /*: boolean*/
  {
    if (_SettingsStore.default.getValue("use_system_theme")) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      const theme = _SettingsStore.default.getValue("theme");

      if (theme.startsWith("custom-")) {
        return (0, _theme.getCustomTheme)(theme.substring("custom-".length)).is_dark;
      }

      return theme === "dark";
    }
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

    let dnd;

    if (this.state.selectedSpace) {
      name = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserMenu_doubleName"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_userName"
      }, displayName), /*#__PURE__*/_react.default.createElement(_RoomName.default, {
        room: this.state.selectedSpace
      }, roomName => /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_subUserName"
      }, roomName)));
    } else if (prototypeCommunityName) {
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
    } else if (_SettingsStore.default.getValue("feature_dnd")) {
      const isDnd = _SettingsStore.default.getValue("doNotDisturb");

      dnd = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onDndToggle,
        className: (0, _classnames.default)({
          "mx_UserMenu_dnd": true,
          "mx_UserMenu_dnd_noisy": !isDnd,
          "mx_UserMenu_dnd_muted": isDnd
        })
      });
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
    })), name, dnd, buttons)), this.renderContextMenu());
  }

}, _temp)) || _class);
exports.default = UserMenu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVXNlck1lbnUudHN4Il0sIm5hbWVzIjpbIlVzZXJNZW51IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZm9yY2VVcGRhdGUiLCJzZWxlY3RlZFNwYWNlIiwic2V0U3RhdGUiLCJpc0RhcmtUaGVtZSIsImlzVXNlck9uRGFya1RoZW1lIiwiZXYiLCJhY3Rpb24iLCJBY3Rpb24iLCJUb2dnbGVVc2VyTWVudSIsInN0YXRlIiwiY29udGV4dE1lbnVQb3NpdGlvbiIsImJ1dHRvblJlZiIsImN1cnJlbnQiLCJjbGljayIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwidGFyZ2V0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwibGVmdCIsImNsaWVudFgiLCJ0b3AiLCJjbGllbnRZIiwid2lkdGgiLCJoZWlnaHQiLCJTZXR0aW5nc1N0b3JlIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJuZXdUaGVtZSIsInRhYklkIiwicGF5bG9hZCIsIlZpZXdVc2VyU2V0dGluZ3MiLCJpbml0aWFsVGFiSWQiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwiY29uc29sZSIsImxvZyIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsIkZlZWRiYWNrRGlhbG9nIiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiaXNDcnlwdG9FbmFibGVkIiwiZXhwb3J0Um9vbUtleXMiLCJsZW5ndGgiLCJkaXMiLCJMb2dvdXREaWFsb2ciLCJFZGl0Q29tbXVuaXR5UHJvdG90eXBlRGlhbG9nIiwiY29tbXVuaXR5SWQiLCJDb21tdW5pdHlQcm90b3R5cGVTdG9yZSIsImluc3RhbmNlIiwiZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCIsImNoYXQiLCJnZXRTZWxlY3RlZENvbW11bml0eUdlbmVyYWxDaGF0Iiwicm9vbV9pZCIsInJvb21JZCIsIlNldFJpZ2h0UGFuZWxQaGFzZSIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIlJvb21NZW1iZXJMaXN0IiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiZ2V0VmFsdWUiLCJwcm90b3R5cGVDb21tdW5pdHlOYW1lIiwiZ2V0U2VsZWN0ZWRDb21tdW5pdHlOYW1lIiwidG9wU2VjdGlvbiIsImhvc3RTaWdudXBDb25maWciLCJTZGtDb25maWciLCJob3N0U2lnbnVwIiwiaXNHdWVzdCIsImEiLCJzdWIiLCJvblNpZ25JbkNsaWNrIiwib25SZWdpc3RlckNsaWNrIiwidXJsIiwiaG9zdFNpZ251cERvbWFpbnMiLCJkb21haW5zIiwibXhEb21haW4iLCJnZXREb21haW4iLCJ2YWxpZERvbWFpbnMiLCJmaWx0ZXIiLCJkIiwiZW5kc1dpdGgiLCJvbkNsb3NlTWVudSIsImhvbWVCdXR0b24iLCJoYXNIb21lUGFnZSIsIm9uSG9tZUNsaWNrIiwiZmVlZGJhY2tCdXR0b24iLCJVSUZlYXR1cmUiLCJGZWVkYmFjayIsIm9uUHJvdmlkZUZlZWRiYWNrIiwicHJpbWFyeUhlYWRlciIsIk93blByb2ZpbGVTdG9yZSIsImRpc3BsYXlOYW1lIiwiZ2V0VXNlcklkIiwicHJpbWFyeU9wdGlvbkxpc3QiLCJlIiwib25TZXR0aW5nc09wZW4iLCJVU0VSX05PVElGSUNBVElPTlNfVEFCIiwiVVNFUl9TRUNVUklUWV9UQUIiLCJvblNpZ25PdXRDbGljayIsInNlY29uZGFyeVNlY3Rpb24iLCJzZXR0aW5nc09wdGlvbiIsImludml0ZU9wdGlvbiIsImNhbkludml0ZVRvIiwib25Db21tdW5pdHlJbnZpdGVDbGljayIsImlzQWRtaW5PZiIsIm9uQ29tbXVuaXR5U2V0dGluZ3NDbGljayIsIm9uQ29tbXVuaXR5TWVtYmVyc0NsaWNrIiwiY2xhc3NlcyIsIm9uU3dpdGNoVGhlbWVDbGljayIsInJlcXVpcmUiLCJvbiIsIlVQREFURV9FVkVOVCIsIm9uUHJvZmlsZVVwZGF0ZSIsIlNwYWNlU3RvcmUiLCJVUERBVEVfU0VMRUNURURfU1BBQ0UiLCJvblNlbGVjdGVkU3BhY2VVcGRhdGUiLCJkbmRXYXRjaGVyUmVmIiwid2F0Y2hTZXR0aW5nIiwiY29tcG9uZW50RGlkTW91bnQiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsInRoZW1lV2F0Y2hlclJlZiIsIm9uVGhlbWVDaGFuZ2VkIiwidGFnU3RvcmVSZWYiLCJHcm91cEZpbHRlck9yZGVyU3RvcmUiLCJhZGRMaXN0ZW5lciIsIm9uVGFnU3RvcmVVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVud2F0Y2hTZXR0aW5nIiwidW5yZWdpc3RlciIsIm9mZiIsInJlbW92ZSIsIndpbmRvdyIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwidGhlbWUiLCJzdGFydHNXaXRoIiwic3Vic3RyaW5nIiwiaXNfZGFyayIsInJlbmRlciIsImF2YXRhclNpemUiLCJ1c2VySWQiLCJhdmF0YXJVcmwiLCJnZXRIdHRwQXZhdGFyVXJsIiwiaXNQcm90b3R5cGUiLCJtZW51TmFtZSIsIm5hbWUiLCJidXR0b25zIiwiZG5kIiwicm9vbU5hbWUiLCJpc0RuZCIsIm9uRG5kVG9nZ2xlIiwiaXNNaW5pbWl6ZWQiLCJvbk9wZW5NZW51Q2xpY2siLCJvbkNvbnRleHRNZW51IiwicmVuZGVyQ29udGV4dE1lbnUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBR0E7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7SUFlcUJBLFEsV0FEcEIsZ0RBQXFCLHFCQUFyQixDLHlCQUFELE1BQ3FCQSxRQURyQixTQUNzQ0MsZUFBTUM7QUFENUM7QUFDc0U7QUFP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SUksTUFBQSxLQUFLLEVBQUUySSxRQUpYO0FBS0ksTUFBQSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUs3SSxLQUFMLENBQVdDLG1CQUw3QjtBQU1JLE1BQUEsYUFBYSxFQUFFLEtBQUtxSjtBQU54QixvQkFRSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixvQkFDSSw2QkFBQyxtQkFBRDtBQUNJLE1BQUEsTUFBTSxFQUFFYixNQURaO0FBRUksTUFBQSxJQUFJLEVBQUVuRCxXQUZWO0FBR0ksTUFBQSxHQUFHLEVBQUVvRCxTQUhUO0FBSUksTUFBQSxLQUFLLEVBQUVGLFVBSlg7QUFLSSxNQUFBLE1BQU0sRUFBRUEsVUFMWjtBQU1JLE1BQUEsWUFBWSxFQUFDLE1BTmpCO0FBT0ksTUFBQSxTQUFTLEVBQUM7QUFQZCxNQURKLENBREosRUFZS00sSUFaTCxFQWFLRSxHQWJMLEVBY0tELE9BZEwsQ0FSSixDQURKLEVBMEJLLEtBQUtRLGlCQUFMLEVBMUJMLENBREo7QUE4Qkg7O0FBemlCaUUsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgKiBhcyBmYkVtaXR0ZXIgZnJvbSBcImZiZW1pdHRlclwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgQ29udGV4dE1lbnVCdXR0b24gfSBmcm9tIFwiLi9Db250ZXh0TWVudVwiO1xuaW1wb3J0IHsgVVNFUl9OT1RJRklDQVRJT05TX1RBQiwgVVNFUl9TRUNVUklUWV9UQUIgfSBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9Vc2VyU2V0dGluZ3NEaWFsb2dcIjtcbmltcG9ydCB7IE9wZW5Ub1RhYlBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9PcGVuVG9UYWJQYXlsb2FkXCI7XG5pbXBvcnQgRmVlZGJhY2tEaWFsb2cgZnJvbSBcIi4uL3ZpZXdzL2RpYWxvZ3MvRmVlZGJhY2tEaWFsb2dcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBMb2dvdXREaWFsb2cgZnJvbSBcIi4uL3ZpZXdzL2RpYWxvZ3MvTG9nb3V0RGlhbG9nXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtnZXRDdXN0b21UaGVtZX0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiwge0J1dHRvbkV2ZW50fSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBnZXRIb21lUGFnZVVybCB9IGZyb20gXCIuLi8uLi91dGlscy9wYWdlc1wiO1xuaW1wb3J0IHsgT3duUHJvZmlsZVN0b3JlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Pd25Qcm9maWxlU3RvcmVcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IEJhc2VBdmF0YXIgZnJvbSAnLi4vdmlld3MvYXZhdGFycy9CYXNlQXZhdGFyJztcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBJY29uaXplZENvbnRleHRNZW51LCB7XG4gICAgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbixcbiAgICBJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCxcbn0gZnJvbSBcIi4uL3ZpZXdzL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuaW1wb3J0IHsgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL0NvbW11bml0eVByb3RvdHlwZVN0b3JlXCI7XG5pbXBvcnQgR3JvdXBGaWx0ZXJPcmRlclN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvR3JvdXBGaWx0ZXJPcmRlclN0b3JlXCI7XG5pbXBvcnQgeyBzaG93Q29tbXVuaXR5SW52aXRlRGlhbG9nIH0gZnJvbSBcIi4uLy4uL1Jvb21JbnZpdGVcIjtcbmltcG9ydCB7IFJpZ2h0UGFuZWxQaGFzZXMgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL1JpZ2h0UGFuZWxTdG9yZVBoYXNlc1wiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9FZGl0Q29tbXVuaXR5UHJvdG90eXBlRGlhbG9nXCI7XG5pbXBvcnQgeyBVSUZlYXR1cmUgfSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQgSG9zdFNpZ251cEFjdGlvbiBmcm9tIFwiLi9Ib3N0U2lnbnVwQWN0aW9uXCI7XG5pbXBvcnQgeyBJSG9zdFNpZ251cENvbmZpZyB9IGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0hvc3RTaWdudXBEaWFsb2dUeXBlc1wiO1xuaW1wb3J0IFNwYWNlU3RvcmUsIHsgVVBEQVRFX1NFTEVDVEVEX1NQQUNFIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9TcGFjZVN0b3JlXCI7XG5pbXBvcnQgUm9vbU5hbWUgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1Jvb21OYW1lXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgaXNNaW5pbWl6ZWQ6IGJvb2xlYW47XG59XG5cbnR5cGUgUGFydGlhbERPTVJlY3QgPSBQaWNrPERPTVJlY3QsIFwid2lkdGhcIiB8IFwibGVmdFwiIHwgXCJ0b3BcIiB8IFwiaGVpZ2h0XCI+O1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBjb250ZXh0TWVudVBvc2l0aW9uOiBQYXJ0aWFsRE9NUmVjdDtcbiAgICBpc0RhcmtUaGVtZTogYm9vbGVhbjtcbiAgICBzZWxlY3RlZFNwYWNlPzogUm9vbTtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwic3RydWN0dXJlcy5Vc2VyTWVudVwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXNlck1lbnUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIHRoZW1lV2F0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgZG5kV2F0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgYnV0dG9uUmVmOiBSZWFjdC5SZWZPYmplY3Q8SFRNTEJ1dHRvbkVsZW1lbnQ+ID0gY3JlYXRlUmVmKCk7XG4gICAgcHJpdmF0ZSB0YWdTdG9yZVJlZjogZmJFbWl0dGVyLkV2ZW50U3Vic2NyaXB0aW9uO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51UG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICBpc0RhcmtUaGVtZTogdGhpcy5pc1VzZXJPbkRhcmtUaGVtZSgpLFxuICAgICAgICB9O1xuXG4gICAgICAgIE93blByb2ZpbGVTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfRVZFTlQsIHRoaXMub25Qcm9maWxlVXBkYXRlKTtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3NwYWNlc1wiKSkge1xuICAgICAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfU0VMRUNURURfU1BBQ0UsIHRoaXMub25TZWxlY3RlZFNwYWNlVXBkYXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZvcmNlIHVwZGF0ZSBpcyB0aGUgZWFzaWVzdCB3YXkgdG8gdHJpZ2dlciB0aGUgVUkgdXBkYXRlICh3ZSBkb24ndCBzdG9yZSBzdGF0ZSBmb3IgdGhpcylcbiAgICAgICAgdGhpcy5kbmRXYXRjaGVyUmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJkb05vdERpc3R1cmJcIiwgbnVsbCwgKCkgPT4gdGhpcy5mb3JjZVVwZGF0ZSgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBoYXNIb21lUGFnZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhZ2V0SG9tZVBhZ2VVcmwoU2RrQ29uZmlnLmdldCgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRlZmF1bHREaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlclJlZiA9IFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwidGhlbWVcIiwgbnVsbCwgdGhpcy5vblRoZW1lQ2hhbmdlZCk7XG4gICAgICAgIHRoaXMudGFnU3RvcmVSZWYgPSBHcm91cEZpbHRlck9yZGVyU3RvcmUuYWRkTGlzdGVuZXIodGhpcy5vblRhZ1N0b3JlVXBkYXRlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnRoZW1lV2F0Y2hlclJlZikgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLnRoZW1lV2F0Y2hlclJlZik7XG4gICAgICAgIGlmICh0aGlzLmRuZFdhdGNoZXJSZWYpIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5kbmRXYXRjaGVyUmVmKTtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlclJlZikgZGVmYXVsdERpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vblByb2ZpbGVVcGRhdGUpO1xuICAgICAgICB0aGlzLnRhZ1N0b3JlUmVmLnJlbW92ZSgpO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfc3BhY2VzXCIpKSB7XG4gICAgICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLm9mZihVUERBVEVfU0VMRUNURURfU1BBQ0UsIHRoaXMub25TZWxlY3RlZFNwYWNlVXBkYXRlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25UYWdTdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyB3ZSBkb24ndCBoYXZlIGFueXRoaW5nIHVzZWZ1bCBpbiBzdGF0ZSB0byB1cGRhdGVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpc1VzZXJPbkRhcmtUaGVtZSgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJ1c2Vfc3lzdGVtX3RoZW1lXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoXCIocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspXCIpLm1hdGNoZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0aGVtZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJ0aGVtZVwiKTtcbiAgICAgICAgICAgIGlmICh0aGVtZS5zdGFydHNXaXRoKFwiY3VzdG9tLVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRDdXN0b21UaGVtZSh0aGVtZS5zdWJzdHJpbmcoXCJjdXN0b20tXCIubGVuZ3RoKSkuaXNfZGFyaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGVtZSA9PT0gXCJkYXJrXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUHJvZmlsZVVwZGF0ZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gdGhlIHN0b3JlIHRyaWdnZXJlZCBhbiB1cGRhdGUsIHNvIGZvcmNlIGEgbGF5b3V0IHVwZGF0ZS4gV2UgZG9uJ3RcbiAgICAgICAgLy8gaGF2ZSBhbnkgc3RhdGUgdG8gc3RvcmUgaGVyZSBmb3IgdGhhdCB0byBtYWdpY2FsbHkgaGFwcGVuLlxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TZWxlY3RlZFNwYWNlVXBkYXRlID0gYXN5bmMgKHNlbGVjdGVkU3BhY2U/OiBSb29tKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZFNwYWNlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVGhlbWVDaGFuZ2VkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtpc0RhcmtUaGVtZTogdGhpcy5pc1VzZXJPbkRhcmtUaGVtZSgpfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAoZXY6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKGV2LmFjdGlvbiAhPT0gQWN0aW9uLlRvZ2dsZVVzZXJNZW51KSByZXR1cm47IC8vIG5vdCBpbnRlcmVzdGVkXG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuYnV0dG9uUmVmLmN1cnJlbnQpIHRoaXMuYnV0dG9uUmVmLmN1cnJlbnQuY2xpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uT3Blbk1lbnVDbGljayA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXYudGFyZ2V0IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCl9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbnRleHRNZW51ID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51UG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBldi5jbGllbnRYLFxuICAgICAgICAgICAgICAgIHRvcDogZXYuY2xpZW50WSxcbiAgICAgICAgICAgICAgICB3aWR0aDogMjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DbG9zZU1lbnUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN3aXRjaFRoZW1lQ2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gRGlzYWJsZSBzeXN0ZW0gdGhlbWUgbWF0Y2hpbmcgaWYgdGhlIHVzZXIgaGl0cyB0aGlzIGJ1dHRvblxuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwidXNlX3N5c3RlbV90aGVtZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBmYWxzZSk7XG5cbiAgICAgICAgY29uc3QgbmV3VGhlbWUgPSB0aGlzLnN0YXRlLmlzRGFya1RoZW1lID8gXCJsaWdodFwiIDogXCJkYXJrXCI7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJ0aGVtZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBuZXdUaGVtZSk7IC8vIHNldCBhdCBzYW1lIGxldmVsIGFzIEFwcGVhcmFuY2UgdGFiXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TZXR0aW5nc09wZW4gPSAoZXY6IEJ1dHRvbkV2ZW50LCB0YWJJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IHBheWxvYWQ6IE9wZW5Ub1RhYlBheWxvYWQgPSB7YWN0aW9uOiBBY3Rpb24uVmlld1VzZXJTZXR0aW5ncywgaW5pdGlhbFRhYklkOiB0YWJJZH07XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHBheWxvYWQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNob3dBcmNoaXZlZCA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gVE9ETzogQXJjaGl2ZWQgcm9vbSB2aWV3OiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDAzOFxuICAgICAgICAvLyBOb3RlOiBZb3UnbGwgbmVlZCB0byB1bmNvbW1lbnQgdGhlIGJ1dHRvbiB0b28uXG4gICAgICAgIGNvbnNvbGUubG9nKFwiVE9ETzogU2hvdyBhcmNoaXZlZCByb29tc1wiKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblByb3ZpZGVGZWVkYmFjayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmVlZGJhY2sgRGlhbG9nJywgJycsIEZlZWRiYWNrRGlhbG9nKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pOyAvLyBhbHNvIGNsb3NlIHRoZSBtZW51XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TaWduT3V0Q2xpY2sgPSBhc3luYyAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGkgfHwgIWNsaS5pc0NyeXB0b0VuYWJsZWQoKSB8fCAhKGF3YWl0IGNsaS5leHBvcnRSb29tS2V5cygpKT8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBsb2cgb3V0IHdpdGhvdXQgdXNlciBwcm9tcHQgaWYgdGhleSBoYXZlIG5vIGxvY2FsIG1lZ29sbSBzZXNzaW9uc1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdsb2dvdXQnfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdMb2dvdXQgZnJvbSBMZWZ0UGFuZWwnLCAnJywgTG9nb3V0RGlhbG9nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTsgLy8gYWxzbyBjbG9zZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2lnbkluQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3N0YXJ0X2xvZ2luJyB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pOyAvLyBhbHNvIGNsb3NlIHRoZSBtZW51XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWdpc3RlckNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdzdGFydF9yZWdpc3RyYXRpb24nIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkhvbWVDbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogJ3ZpZXdfaG9tZV9wYWdlJ30pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbW11bml0eVNldHRpbmdzQ2xpY2sgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0VkaXQgQ29tbXVuaXR5JywgJycsIEVkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2csIHtcbiAgICAgICAgICAgIGNvbW11bml0eUlkOiBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRTZWxlY3RlZENvbW11bml0eUlkKCksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbW11bml0eU1lbWJlcnNDbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gV2UnZCBpZGVhbGx5IGp1c3QgcG9wIG9wZW4gYSByaWdodCBwYW5lbCB3aXRoIHRoZSBtZW1iZXIgbGlzdCwgYnV0IHRoZSBjdXJyZW50XG4gICAgICAgIC8vIHdheSB0aGUgcmlnaHQgcGFuZWwgaXMgc3RydWN0dXJlZCBtYWtlcyB0aGlzIGV4Y2VlZGluZ2x5IGRpZmZpY3VsdC4gSW5zdGVhZCwgd2UnbGxcbiAgICAgICAgLy8gc3dpdGNoIHRvIHRoZSBnZW5lcmFsIHJvb20gYW5kIG9wZW4gdGhlIG1lbWJlciBsaXN0IHRoZXJlIGFzIGl0IHNob3VsZCBiZSBpbiBzeW5jXG4gICAgICAgIC8vIGFueXdheXMuXG4gICAgICAgIGNvbnN0IGNoYXQgPSBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRTZWxlY3RlZENvbW11bml0eUdlbmVyYWxDaGF0KCk7XG4gICAgICAgIGlmIChjaGF0KSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogY2hhdC5yb29tSWQsXG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBBY3Rpb24uU2V0UmlnaHRQYW5lbFBoYXNlLCBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVyTGlzdH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gXCJUaGlzIHNob3VsZCBuZXZlciBoYXBwZW5cIiBjbGF1c2VzIGdvIGhlcmUgZm9yIHRoZSBwcm90b3R5cGUuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gZmluZCBnZW5lcmFsIGNoYXQnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZhaWxlZCB0byBmaW5kIHRoZSBnZW5lcmFsIGNoYXQgZm9yIHRoaXMgY29tbXVuaXR5JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiRmFpbGVkIHRvIGZpbmQgdGhlIGdlbmVyYWwgY2hhdCBmb3IgdGhpcyBjb21tdW5pdHlcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbW11bml0eUludml0ZUNsaWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBzaG93Q29tbXVuaXR5SW52aXRlRGlhbG9nKENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5SWQoKSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTsgLy8gYWxzbyBjbG9zZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRG5kVG9nZ2xlID0gKGV2KSA9PiB7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImRvTm90RGlzdHVyYlwiKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcImRvTm90RGlzdHVyYlwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCAhY3VycmVudCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyQ29udGV4dE1lbnUgPSAoKTogUmVhY3QuUmVhY3ROb2RlID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24pIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IHByb3RvdHlwZUNvbW11bml0eU5hbWUgPSBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRTZWxlY3RlZENvbW11bml0eU5hbWUoKTtcblxuICAgICAgICBsZXQgdG9wU2VjdGlvbjtcbiAgICAgICAgY29uc3QgaG9zdFNpZ251cENvbmZpZzogSUhvc3RTaWdudXBDb25maWcgPSBTZGtDb25maWcuZ2V0KCkuaG9zdFNpZ251cDtcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgIHRvcFNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV9oZWFkZXIgbXhfVXNlck1lbnVfY29udGV4dE1lbnVfZ3Vlc3RQcm9tcHRzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkdvdCBhbiBhY2NvdW50PyA8YT5TaWduIGluPC9hPlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua1wiIG9uQ2xpY2s9e3RoaXMub25TaWduSW5DbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzdWJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIk5ldyBoZXJlPyA8YT5DcmVhdGUgYW4gYWNjb3VudDwvYT5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXt0aGlzLm9uUmVnaXN0ZXJDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzdWJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSBpZiAoaG9zdFNpZ251cENvbmZpZykge1xuICAgICAgICAgICAgaWYgKGhvc3RTaWdudXBDb25maWcgJiYgaG9zdFNpZ251cENvbmZpZy51cmwpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBob3N0U2lnbnVwLmRvbWFpbnMgaXMgc2V0IHRvIGEgbm9uLWVtcHR5IGFycmF5LCBvbmx5IHNob3dcbiAgICAgICAgICAgICAgICAvLyBkaWFsb2cgaWYgdGhlIHVzZXIgaXMgb24gdGhlIGRvbWFpbiBvciBhIHN1YmRvbWFpbi5cbiAgICAgICAgICAgICAgICBjb25zdCBob3N0U2lnbnVwRG9tYWlucyA9IGhvc3RTaWdudXBDb25maWcuZG9tYWlucyB8fCBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCBteERvbWFpbiA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXREb21haW4oKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWxpZERvbWFpbnMgPSBob3N0U2lnbnVwRG9tYWlucy5maWx0ZXIoZCA9PiAoZCA9PT0gbXhEb21haW4gfHwgbXhEb21haW4uZW5kc1dpdGgoYC4ke2R9YCkpKTtcbiAgICAgICAgICAgICAgICBpZiAoIWhvc3RTaWdudXBDb25maWcuZG9tYWlucyB8fCB2YWxpZERvbWFpbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0b3BTZWN0aW9uID0gPGRpdiBvbkNsaWNrPXt0aGlzLm9uQ2xvc2VNZW51fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxIb3N0U2lnbnVwQWN0aW9uIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaG9tZUJ1dHRvbiA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmhhc0hvbWVQYWdlKSB7XG4gICAgICAgICAgICBob21lQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uSG9tZVwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkhvbWVcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Ib21lQ2xpY2t9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZmVlZGJhY2tCdXR0b247XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5GZWVkYmFjaykpIHtcbiAgICAgICAgICAgIGZlZWRiYWNrQnV0dG9uID0gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvbk1lc3NhZ2VcIlxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkZlZWRiYWNrXCIpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Qcm92aWRlRmVlZGJhY2t9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwcmltYXJ5SGVhZGVyID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV9uYW1lXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfZGlzcGxheU5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAge093blByb2ZpbGVTdG9yZS5pbnN0YW5jZS5kaXNwbGF5TmFtZX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfdXNlcklkXCI+XG4gICAgICAgICAgICAgICAgICAgIHtNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCl9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgICAgIGxldCBwcmltYXJ5T3B0aW9uTGlzdCA9IChcbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgICAgIHtob21lQnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2ljb25CZWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk5vdGlmaWNhdGlvbiBzZXR0aW5nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLm9uU2V0dGluZ3NPcGVuKGUsIFVTRVJfTk9USUZJQ0FUSU9OU19UQUIpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2ljb25Mb2NrXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlNlY3VyaXR5ICYgcHJpdmFjeVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLm9uU2V0dGluZ3NPcGVuKGUsIFVTRVJfU0VDVVJJVFlfVEFCKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uU2V0dGluZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiQWxsIHNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHRoaXMub25TZXR0aW5nc09wZW4oZSwgbnVsbCl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHsvKiA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2ljb25BcmNoaXZlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkFyY2hpdmVkIHJvb21zXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblNob3dBcmNoaXZlZH1cbiAgICAgICAgICAgICAgICAgICAgLz4gKi99XG4gICAgICAgICAgICAgICAgICAgIHsgZmVlZGJhY2tCdXR0b24gfVxuICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IHJlZD5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uU2lnbk91dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTaWduIG91dFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaWduT3V0Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICk7XG4gICAgICAgIGxldCBzZWNvbmRhcnlTZWN0aW9uID0gbnVsbDtcblxuICAgICAgICBpZiAocHJvdG90eXBlQ29tbXVuaXR5TmFtZSkge1xuICAgICAgICAgICAgY29uc3QgY29tbXVuaXR5SWQgPSBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRTZWxlY3RlZENvbW11bml0eUlkKCk7XG4gICAgICAgICAgICBwcmltYXJ5SGVhZGVyID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfbmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV9kaXNwbGF5TmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3Byb3RvdHlwZUNvbW11bml0eU5hbWV9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsZXQgc2V0dGluZ3NPcHRpb247XG4gICAgICAgICAgICBsZXQgaW52aXRlT3B0aW9uO1xuICAgICAgICAgICAgaWYgKENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmNhbkludml0ZVRvKGNvbW11bml0eUlkKSkge1xuICAgICAgICAgICAgICAgIGludml0ZU9wdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uSW52aXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkludml0ZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db21tdW5pdHlJbnZpdGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmlzQWRtaW5PZihjb21tdW5pdHlJZCkpIHtcbiAgICAgICAgICAgICAgICBzZXR0aW5nc09wdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uU2V0dGluZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIkNvbW11bml0eSBzZXR0aW5nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db21tdW5pdHlTZXR0aW5nc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmltYXJ5T3B0aW9uTGlzdCA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgICAgIHtzZXR0aW5nc09wdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uTWVtYmVyc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJNZW1iZXJzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNvbW11bml0eU1lbWJlcnNDbGlja31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAge2ludml0ZU9wdGlvbn1cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHNlY29uZGFyeVNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICA8aHIgLz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfbmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51X2Rpc3BsYXlOYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51X3VzZXJJZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7TWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvblNldHRpbmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTZXR0aW5nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIlVzZXIgc2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHRoaXMub25TZXR0aW5nc09wZW4oZSwgbnVsbCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBmZWVkYmFja0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCByZWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uU2lnbk91dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2lnbiBvdXRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblNpZ25PdXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICBwcmltYXJ5T3B0aW9uTGlzdCA9IChcbiAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaG9tZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uU2V0dGluZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLm9uU2V0dGluZ3NPcGVuKGUsIG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZmVlZGJhY2tCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgXCJteF9Vc2VyTWVudV9jb250ZXh0TWVudVwiOiB0cnVlLFxuICAgICAgICAgICAgXCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV9wcm90b3R5cGVcIjogISFwcm90b3R5cGVDb21tdW5pdHlOYW1lLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPEljb25pemVkQ29udGV4dE1lbnVcbiAgICAgICAgICAgIC8vIG51bWVyaWNhbCBhZGp1c3RtZW50cyB0byBvdmVybGFwIHRoZSBjb250ZXh0IG1lbnUgYnkganVzdCBvdmVyIHRoZSB3aWR0aCBvZiB0aGVcbiAgICAgICAgICAgIC8vIG1lbnUgaWNvbiBhbmQgbWFrZSBpdCBsb29rIGNvbm5lY3RlZFxuICAgICAgICAgICAgbGVmdD17dGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uLndpZHRoICsgdGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uLmxlZnQgLSAxMH1cbiAgICAgICAgICAgIHRvcD17dGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uLnRvcCArIHRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbi5oZWlnaHQgKyA4fVxuICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNsb3NlTWVudX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICB7cHJpbWFyeUhlYWRlcn1cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfdGhlbWVCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU3dpdGNoVGhlbWVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMuc3RhdGUuaXNEYXJrVGhlbWUgPyBfdChcIlN3aXRjaCB0byBsaWdodCBtb2RlXCIpIDogX3QoXCJTd2l0Y2ggdG8gZGFyayBtb2RlXCIpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9lbGVtZW50LWljb25zL3Jvb21saXN0L2RhcmstbGlnaHQtbW9kZS5zdmdcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBhbHQ9e190KFwiU3dpdGNoIHRoZW1lXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezE2fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHt0b3BTZWN0aW9ufVxuICAgICAgICAgICAge3ByaW1hcnlPcHRpb25MaXN0fVxuICAgICAgICAgICAge3NlY29uZGFyeVNlY3Rpb259XG4gICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudT47XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGF2YXRhclNpemUgPSAzMjsgLy8gc2hvdWxkIG1hdGNoIGJvcmRlci1yYWRpdXMgb2YgdGhlIGF2YXRhclxuXG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZGlzcGxheU5hbWUgfHwgdXNlcklkO1xuICAgICAgICBjb25zdCBhdmF0YXJVcmwgPSBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZ2V0SHR0cEF2YXRhclVybChhdmF0YXJTaXplKTtcblxuICAgICAgICBjb25zdCBwcm90b3R5cGVDb21tdW5pdHlOYW1lID0gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlOYW1lKCk7XG5cbiAgICAgICAgbGV0IGlzUHJvdG90eXBlID0gZmFsc2U7XG4gICAgICAgIGxldCBtZW51TmFtZSA9IF90KFwiVXNlciBtZW51XCIpO1xuICAgICAgICBsZXQgbmFtZSA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X3VzZXJOYW1lXCI+e2Rpc3BsYXlOYW1lfTwvc3Bhbj47XG4gICAgICAgIGxldCBidXR0b25zID0gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaGVhZGVyQnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIHsvKiBtYXNrZWQgaW1hZ2UgaW4gQ1NTICovfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgICAgICBsZXQgZG5kO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZFNwYWNlKSB7XG4gICAgICAgICAgICBuYW1lID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfZG91YmxlTmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV91c2VyTmFtZVwiPntkaXNwbGF5TmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxSb29tTmFtZSByb29tPXt0aGlzLnN0YXRlLnNlbGVjdGVkU3BhY2V9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyhyb29tTmFtZSkgPT4gPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfc3ViVXNlck5hbWVcIj57cm9vbU5hbWV9PC9zcGFuPn1cbiAgICAgICAgICAgICAgICAgICAgPC9Sb29tTmFtZT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvdG90eXBlQ29tbXVuaXR5TmFtZSkge1xuICAgICAgICAgICAgbmFtZSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2RvdWJsZU5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfdXNlck5hbWVcIj57cHJvdG90eXBlQ29tbXVuaXR5TmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X3N1YlVzZXJOYW1lXCI+e2Rpc3BsYXlOYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBtZW51TmFtZSA9IF90KFwiQ29tbXVuaXR5IGFuZCB1c2VyIG1lbnVcIik7XG4gICAgICAgICAgICBpc1Byb3RvdHlwZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfY29tbXVuaXRpZXNfdjJfcHJvdG90eXBlc1wiKSkge1xuICAgICAgICAgICAgbmFtZSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2RvdWJsZU5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfdXNlck5hbWVcIj57X3QoXCJIb21lXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfc3ViVXNlck5hbWVcIj57ZGlzcGxheU5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlzUHJvdG90eXBlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9kbmRcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzRG5kID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImRvTm90RGlzdHVyYlwiKTtcbiAgICAgICAgICAgIGRuZCA9IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkRuZFRvZ2dsZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgICAgICBcIm14X1VzZXJNZW51X2RuZFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBcIm14X1VzZXJNZW51X2RuZF9ub2lzeVwiOiAhaXNEbmQsXG4gICAgICAgICAgICAgICAgICAgIFwibXhfVXNlck1lbnVfZG5kX211dGVkXCI6IGlzRG5kLFxuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIHtcbiAgICAgICAgICAgIG5hbWUgPSBudWxsO1xuICAgICAgICAgICAgYnV0dG9ucyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAnbXhfVXNlck1lbnUnOiB0cnVlLFxuICAgICAgICAgICAgJ214X1VzZXJNZW51X21pbmltaXplZCc6IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQsXG4gICAgICAgICAgICAnbXhfVXNlck1lbnVfcHJvdG90eXBlJzogaXNQcm90b3R5cGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPENvbnRleHRNZW51QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbk9wZW5NZW51Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXt0aGlzLmJ1dHRvblJlZn1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e21lbnVOYW1lfVxuICAgICAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXshIXRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vbkNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X3VzZXJBdmF0YXJDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QmFzZUF2YXRhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZE5hbWU9e3VzZXJJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17ZGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybD17YXZhdGFyVXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXthdmF0YXJTaXplfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNpemVNZXRob2Q9XCJjcm9wXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfdXNlckF2YXRhclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAge2RuZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtidXR0b25zfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L0NvbnRleHRNZW51QnV0dG9uPlxuICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlckNvbnRleHRNZW51KCl9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
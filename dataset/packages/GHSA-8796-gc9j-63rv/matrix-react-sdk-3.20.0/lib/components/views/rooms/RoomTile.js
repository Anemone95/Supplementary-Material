"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Keyboard = require("../../../Keyboard");

var _ActiveRoomObserver = _interopRequireDefault(require("../../../ActiveRoomObserver"));

var _languageHandler = require("../../../languageHandler");

var _ContextMenu = require("../../structures/ContextMenu");

var _models = require("../../../stores/room-list/models");

var _MessagePreviewStore = require("../../../stores/room-list/MessagePreviewStore");

var _DecoratedRoomAvatar = _interopRequireDefault(require("../avatars/DecoratedRoomAvatar"));

var _RoomNotifs = require("../../../RoomNotifs");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _NotificationBadge = _interopRequireDefault(require("./NotificationBadge"));

var _RoomListStore = _interopRequireDefault(require("../../../stores/room-list/RoomListStore"));

var _RoomListActions = _interopRequireDefault(require("../../../actions/RoomListActions"));

var _RoomNotificationStateStore = require("../../../stores/notifications/RoomNotificationStateStore");

var _NotificationState = require("../../../stores/notifications/NotificationState");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _EchoChamber = require("../../../stores/local-echo/EchoChamber");

var _RoomEchoChamber = require("../../../stores/local-echo/RoomEchoChamber");

var _GenericEchoChamber = require("../../../stores/local-echo/GenericEchoChamber");

var _IconizedContextMenu = _interopRequireWildcard(require("../context_menus/IconizedContextMenu"));

var _CommunityPrototypeStore = require("../../../stores/CommunityPrototypeStore");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _RoomStatusBar = require("../../structures/RoomStatusBar");

var _StaticNotificationState = require("../../../stores/notifications/StaticNotificationState");

var _dec, _class, _temp;

const messagePreviewId = (roomId
/*: string*/
) => `mx_RoomTile_messagePreview_${roomId}`;

const contextMenuBelow = (elementRect
/*: PartialDOMRect*/
) => {
  // align the context menu's icons with the icon which opened the context menu
  const left = elementRect.left + window.pageXOffset - 9;
  const top = elementRect.bottom + window.pageYOffset + 17;
  const chevronFace = _ContextMenu.ChevronFace.None;
  return {
    left,
    top,
    chevronFace
  };
};

let RoomTile = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.RoomTile"), _dec(_class = (_temp = class RoomTile extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "roomTileRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "notificationState", void 0);
    (0, _defineProperty2.default)(this, "roomProps", void 0);
    (0, _defineProperty2.default)(this, "onRoomNameUpdate", room => {
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onNotificationUpdate", () => {
      this.forceUpdate(); // notification state changed - update
    });
    (0, _defineProperty2.default)(this, "onResize", () => {
      if (this.showMessagePreview && !this.state.messagePreview) {
        this.setState({
          messagePreview: this.generatePreview()
        });
      }
    });
    (0, _defineProperty2.default)(this, "onLocalEchoUpdated", (ev
    /*: MatrixEvent*/
    , room
    /*: Room*/
    ) => {
      if (!room?.roomId === this.props.room.roomId) return;
      this.setState({
        hasUnsentEvents: this.countUnsentEvents() > 0
      });
    });
    (0, _defineProperty2.default)(this, "onRoomPropertyUpdate", (property
    /*: CachedRoomKey*/
    ) => {
      if (property === _RoomEchoChamber.CachedRoomKey.NotificationVolume) this.onNotificationUpdate(); // else ignore - not important for this tile
    });
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      if (payload.action === "view_room" && payload.room_id === this.props.room.roomId && payload.show_room_tile) {
        setImmediate(() => {
          this.scrollIntoView();
        });
      }
    });
    (0, _defineProperty2.default)(this, "onCommunityUpdate", (roomId
    /*: string*/
    ) => {
      if (roomId !== this.props.room.roomId) return;
      this.forceUpdate(); // we don't have anything to actually update
    });
    (0, _defineProperty2.default)(this, "onRoomPreviewChanged", (room
    /*: Room*/
    ) => {
      if (this.props.room && room.roomId === this.props.room.roomId) {
        // generatePreview() will return nothing if the user has previews disabled
        this.setState({
          messagePreview: this.generatePreview()
        });
      }
    });
    (0, _defineProperty2.default)(this, "scrollIntoView", () => {
      if (!this.roomTileRef.current) return;
      this.roomTileRef.current.scrollIntoView({
        block: "nearest",
        behavior: "auto"
      });
    });
    (0, _defineProperty2.default)(this, "onTileClick", (ev
    /*: React.KeyboardEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'view_room',
        show_room_tile: true,
        // make sure the room is visible in the list
        room_id: this.props.room.roomId,
        clear_search: ev && (ev.key === _Keyboard.Key.ENTER || ev.key === _Keyboard.Key.SPACE)
      });
    });
    (0, _defineProperty2.default)(this, "onActiveRoomUpdate", (isActive
    /*: boolean*/
    ) => {
      this.setState({
        selected: isActive
      });
    });
    (0, _defineProperty2.default)(this, "onNotificationsMenuOpenClick", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target;
      this.setState({
        notificationsMenuPosition: target.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onCloseNotificationsMenu", () => {
      this.setState({
        notificationsMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "onGeneralMenuOpenClick", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target;
      this.setState({
        generalMenuPosition: target.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenu", (ev
    /*: React.MouseEvent*/
    ) => {
      // If we don't have a context menu to show, ignore the action.
      if (!this.showContextMenu) return;
      ev.preventDefault();
      ev.stopPropagation();
      this.setState({
        generalMenuPosition: {
          left: ev.clientX,
          bottom: ev.clientY
        }
      });
    });
    (0, _defineProperty2.default)(this, "onCloseGeneralMenu", () => {
      this.setState({
        generalMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "onTagRoom", (ev
    /*: ButtonEvent*/
    , tagId
    /*: TagID*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      if (tagId === _models.DefaultTagID.Favourite || tagId === _models.DefaultTagID.LowPriority) {
        const inverseTag = tagId === _models.DefaultTagID.Favourite ? _models.DefaultTagID.LowPriority : _models.DefaultTagID.Favourite;

        const isApplied = _RoomListStore.default.instance.getTagsForRoom(this.props.room).includes(tagId);

        const removeTag = isApplied ? tagId : inverseTag;
        const addTag = isApplied ? null : tagId;

        _dispatcher.default.dispatch(_RoomListActions.default.tagRoom(_MatrixClientPeg.MatrixClientPeg.get(), this.props.room, removeTag, addTag, undefined, 0));
      } else {
        console.warn(`Unexpected tag ${tagId} applied to ${this.props.room.room_id}`);
      }

      if (ev.key === _Keyboard.Key.ENTER) {
        // Implements https://www.w3.org/TR/wai-aria-practices/#keyboard-interaction-12
        this.setState({
          generalMenuPosition: null
        }); // hide the menu
      }
    });
    (0, _defineProperty2.default)(this, "onLeaveRoomClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'leave_room',
        room_id: this.props.room.roomId
      });

      this.setState({
        generalMenuPosition: null
      }); // hide the menu
    });
    (0, _defineProperty2.default)(this, "onForgetRoomClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'forget_room',
        room_id: this.props.room.roomId
      });

      this.setState({
        generalMenuPosition: null
      }); // hide the menu
    });
    (0, _defineProperty2.default)(this, "onOpenRoomSettings", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'open_room_settings',
        room_id: this.props.room.roomId
      });

      this.setState({
        generalMenuPosition: null
      }); // hide the menu
    });
    (0, _defineProperty2.default)(this, "onInviteClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'view_invite',
        roomId: this.props.room.roomId
      });

      this.setState({
        generalMenuPosition: null
      }); // hide the menu
    });
    (0, _defineProperty2.default)(this, "onClickAllNotifs", ev => this.saveNotifState(ev, _RoomNotifs.ALL_MESSAGES));
    (0, _defineProperty2.default)(this, "onClickAlertMe", ev => this.saveNotifState(ev, _RoomNotifs.ALL_MESSAGES_LOUD));
    (0, _defineProperty2.default)(this, "onClickMentions", ev => this.saveNotifState(ev, _RoomNotifs.MENTIONS_ONLY));
    (0, _defineProperty2.default)(this, "onClickMute", ev => this.saveNotifState(ev, _RoomNotifs.MUTE));
    this.state = {
      selected: _ActiveRoomObserver.default.activeRoomId === this.props.room.roomId,
      notificationsMenuPosition: null,
      generalMenuPosition: null,
      hasUnsentEvents: this.countUnsentEvents() > 0,
      // generatePreview() will return nothing if the user has previews disabled
      messagePreview: this.generatePreview()
    };
    this.notificationState = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(this.props.room);
    this.roomProps = _EchoChamber.EchoChamber.forRoom(this.props.room);

    if (this.props.resizeNotifier) {
      this.props.resizeNotifier.on("middlePanelResized", this.onResize);
    }
  }

  countUnsentEvents()
  /*: number*/
  {
    return (0, _RoomStatusBar.getUnsentMessages)(this.props.room).length;
  }

  get showContextMenu()
  /*: boolean*/
  {
    return this.props.tag !== _models.DefaultTagID.Invite;
  }

  get showMessagePreview()
  /*: boolean*/
  {
    return !this.props.isMinimized && this.props.showMessagePreview;
  }

  componentDidUpdate(prevProps
  /*: Readonly<IProps>*/
  , prevState
  /*: Readonly<IState>*/
  ) {
    if (prevProps.showMessagePreview !== this.props.showMessagePreview && this.showMessagePreview) {
      this.setState({
        messagePreview: this.generatePreview()
      });
    }

    if (prevProps.room?.roomId !== this.props.room?.roomId) {
      _MessagePreviewStore.MessagePreviewStore.instance.off(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(prevProps.room), this.onRoomPreviewChanged);

      _MessagePreviewStore.MessagePreviewStore.instance.on(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(this.props.room), this.onRoomPreviewChanged);

      _CommunityPrototypeStore.CommunityPrototypeStore.instance.off(_CommunityPrototypeStore.CommunityPrototypeStore.getUpdateEventName(prevProps.room?.roomId), this.onCommunityUpdate);

      _CommunityPrototypeStore.CommunityPrototypeStore.instance.on(_CommunityPrototypeStore.CommunityPrototypeStore.getUpdateEventName(this.props.room?.roomId), this.onCommunityUpdate);

      prevProps.room?.off("Room.name", this.onRoomNameUpdate);
      this.props.room?.on("Room.name", this.onRoomNameUpdate);
    }
  }

  componentDidMount() {
    // when we're first rendered (or our sublist is expanded) make sure we are visible if we're active
    if (this.state.selected) {
      this.scrollIntoView();
    }

    _ActiveRoomObserver.default.addListener(this.props.room.roomId, this.onActiveRoomUpdate);

    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _MessagePreviewStore.MessagePreviewStore.instance.on(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(this.props.room), this.onRoomPreviewChanged);

    this.notificationState.on(_NotificationState.NOTIFICATION_STATE_UPDATE, this.onNotificationUpdate);
    this.roomProps.on(_GenericEchoChamber.PROPERTY_UPDATED, this.onRoomPropertyUpdate);
    this.roomProps.on("Room.name", this.onRoomNameUpdate);

    _CommunityPrototypeStore.CommunityPrototypeStore.instance.on(_CommunityPrototypeStore.CommunityPrototypeStore.getUpdateEventName(this.props.room.roomId), this.onCommunityUpdate);

    _MatrixClientPeg.MatrixClientPeg.get().on("Room.localEchoUpdated", this.onLocalEchoUpdated);
  }

  componentWillUnmount() {
    if (this.props.room) {
      _ActiveRoomObserver.default.removeListener(this.props.room.roomId, this.onActiveRoomUpdate);

      _MessagePreviewStore.MessagePreviewStore.instance.off(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(this.props.room), this.onRoomPreviewChanged);

      _CommunityPrototypeStore.CommunityPrototypeStore.instance.off(_CommunityPrototypeStore.CommunityPrototypeStore.getUpdateEventName(this.props.room.roomId), this.onCommunityUpdate);

      this.props.room.off("Room.name", this.onRoomNameUpdate);
    }

    if (this.props.resizeNotifier) {
      this.props.resizeNotifier.off("middlePanelResized", this.onResize);
    }

    _ActiveRoomObserver.default.removeListener(this.props.room.roomId, this.onActiveRoomUpdate);

    _dispatcher.default.unregister(this.dispatcherRef);

    this.notificationState.off(_NotificationState.NOTIFICATION_STATE_UPDATE, this.onNotificationUpdate);
    this.roomProps.off(_GenericEchoChamber.PROPERTY_UPDATED, this.onRoomPropertyUpdate);
    this.roomProps.off("Room.name", this.onRoomNameUpdate);

    _CommunityPrototypeStore.CommunityPrototypeStore.instance.off(_CommunityPrototypeStore.CommunityPrototypeStore.getUpdateEventName(this.props.room.roomId), this.onCommunityUpdate);

    _MatrixClientPeg.MatrixClientPeg.get()?.removeListener("Room.localEchoUpdated", this.onLocalEchoUpdated);
  }

  generatePreview()
  /*: string | null*/
  {
    if (!this.showMessagePreview) {
      return null;
    }

    return _MessagePreviewStore.MessagePreviewStore.instance.getPreviewForRoom(this.props.room, this.props.tag);
  }

  async saveNotifState(ev
  /*: ButtonEvent*/
  , newState
  /*: Volume*/
  ) {
    ev.preventDefault();
    ev.stopPropagation();
    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) return;
    this.roomProps.notificationVolume = newState;
    const key = ev.key;

    if (key === _Keyboard.Key.ENTER) {
      // Implements https://www.w3.org/TR/wai-aria-practices/#keyboard-interaction-12
      this.setState({
        notificationsMenuPosition: null
      }); // hide the menu
    }
  }

  renderNotificationsMenu(isActive
  /*: boolean*/
  )
  /*: React.ReactElement*/
  {
    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest() || this.props.tag === _models.DefaultTagID.Archived || !this.showContextMenu || this.props.isMinimized) {
      // the menu makes no sense in these cases so do not show one
      return null;
    }

    const state = this.roomProps.notificationVolume;
    let contextMenu = null;

    if (this.state.notificationsMenuPosition) {
      contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, contextMenuBelow(this.state.notificationsMenuPosition), {
        onFinished: this.onCloseNotificationsMenu,
        className: "mx_RoomTile_contextMenu",
        compact: true
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        first: true
      }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuRadio, {
        label: (0, _languageHandler._t)("Use default"),
        active: state === _RoomNotifs.ALL_MESSAGES,
        iconClassName: "mx_RoomTile_iconBell",
        onClick: this.onClickAllNotifs
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuRadio, {
        label: (0, _languageHandler._t)("All messages"),
        active: state === _RoomNotifs.ALL_MESSAGES_LOUD,
        iconClassName: "mx_RoomTile_iconBellDot",
        onClick: this.onClickAlertMe
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuRadio, {
        label: (0, _languageHandler._t)("Mentions & Keywords"),
        active: state === _RoomNotifs.MENTIONS_ONLY,
        iconClassName: "mx_RoomTile_iconBellMentions",
        onClick: this.onClickMentions
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuRadio, {
        label: (0, _languageHandler._t)("None"),
        active: state === _RoomNotifs.MUTE,
        iconClassName: "mx_RoomTile_iconBellCrossed",
        onClick: this.onClickMute
      })));
    }

    const classes = (0, _classnames.default)("mx_RoomTile_notificationsButton", {
      // Show bell icon for the default case too.
      mx_RoomTile_iconBell: state === _RoomNotifs.ALL_MESSAGES,
      mx_RoomTile_iconBellDot: state === _RoomNotifs.ALL_MESSAGES_LOUD,
      mx_RoomTile_iconBellMentions: state === _RoomNotifs.MENTIONS_ONLY,
      mx_RoomTile_iconBellCrossed: state === _RoomNotifs.MUTE,
      // Only show the icon by default if the room is overridden to muted.
      // TODO: [FTUE Notifications] Probably need to detect global mute state
      mx_RoomTile_notificationsButton_show: state === _RoomNotifs.MUTE
    });
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
      className: classes,
      onClick: this.onNotificationsMenuOpenClick,
      title: (0, _languageHandler._t)("Notification options"),
      isExpanded: !!this.state.notificationsMenuPosition,
      tabIndex: isActive ? 0 : -1
    }), contextMenu);
  }

  renderGeneralMenu()
  /*: React.ReactElement*/
  {
    if (!this.showContextMenu) return null; // no menu to show

    let contextMenu = null;

    if (this.state.generalMenuPosition && this.props.tag === _models.DefaultTagID.Archived) {
      contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, contextMenuBelow(this.state.generalMenuPosition), {
        onFinished: this.onCloseGeneralMenu,
        className: "mx_RoomTile_contextMenu",
        compact: true
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        red: true
      }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_RoomTile_iconSignOut",
        label: (0, _languageHandler._t)("Forget Room"),
        onClick: this.onForgetRoomClick
      })));
    } else if (this.state.generalMenuPosition) {
      const roomTags = _RoomListStore.default.instance.getTagsForRoom(this.props.room);

      const isFavorite = roomTags.includes(_models.DefaultTagID.Favourite);
      const favouriteLabel = isFavorite ? (0, _languageHandler._t)("Favourited") : (0, _languageHandler._t)("Favourite");
      const isLowPriority = roomTags.includes(_models.DefaultTagID.LowPriority);
      const lowPriorityLabel = (0, _languageHandler._t)("Low Priority");

      const userId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

      const canInvite = this.props.room.canInvite(userId);
      contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, contextMenuBelow(this.state.generalMenuPosition), {
        onFinished: this.onCloseGeneralMenu,
        className: "mx_RoomTile_contextMenu",
        compact: true
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuCheckbox, {
        onClick: e => this.onTagRoom(e, _models.DefaultTagID.Favourite),
        active: isFavorite,
        label: favouriteLabel,
        iconClassName: "mx_RoomTile_iconStar"
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuCheckbox, {
        onClick: e => this.onTagRoom(e, _models.DefaultTagID.LowPriority),
        active: isLowPriority,
        label: lowPriorityLabel,
        iconClassName: "mx_RoomTile_iconArrowDown"
      }), canInvite ? /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        onClick: this.onInviteClick,
        label: (0, _languageHandler._t)("Invite People"),
        iconClassName: "mx_RoomTile_iconInvite"
      }) : null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        onClick: this.onOpenRoomSettings,
        label: (0, _languageHandler._t)("Settings"),
        iconClassName: "mx_RoomTile_iconSettings"
      })), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        red: true
      }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        onClick: this.onLeaveRoomClick,
        label: (0, _languageHandler._t)("Leave Room"),
        iconClassName: "mx_RoomTile_iconSignOut"
      })));
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
      className: "mx_RoomTile_menuButton",
      onClick: this.onGeneralMenuOpenClick,
      title: (0, _languageHandler._t)("Room options"),
      isExpanded: !!this.state.generalMenuPosition
    }), contextMenu);
  }

  render()
  /*: React.ReactElement*/
  {
    const classes = (0, _classnames.default)({
      'mx_RoomTile': true,
      'mx_RoomTile_selected': this.state.selected,
      'mx_RoomTile_hasMenuOpen': !!(this.state.generalMenuPosition || this.state.notificationsMenuPosition),
      'mx_RoomTile_minimized': this.props.isMinimized
    });
    let roomProfile
    /*: IRoomProfile*/
    = {
      displayName: null,
      avatarMxc: null
    };

    if (this.props.tag === _models.DefaultTagID.Invite) {
      roomProfile = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getInviteProfile(this.props.room.roomId);
    }

    let name = roomProfile.displayName || this.props.room.name;
    if (typeof name !== 'string') name = '';
    name = name.replace(":", ":\u200b"); // add a zero-width space to allow linewrapping after the colon

    const roomAvatar = /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
      room: this.props.room,
      avatarSize: 32,
      tag: this.props.tag,
      displayBadge: this.props.isMinimized,
      oobData: {
        avatarUrl: roomProfile.avatarMxc
      }
    });

    let badge
    /*: React.ReactNode*/
    ;

    if (!this.props.isMinimized) {
      // aria-hidden because we summarise the unread count/highlight status in a manual aria-label below
      if (this.state.hasUnsentEvents) {
        // hardcode the badge to a danger state when there's unsent messages
        badge = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomTile_badgeContainer",
          "aria-hidden": "true"
        }, /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
          notification: _StaticNotificationState.StaticNotificationState.RED_EXCLAMATION,
          forceCount: false,
          roomId: this.props.room.roomId
        }));
      } else if (this.notificationState) {
        badge = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomTile_badgeContainer",
          "aria-hidden": "true"
        }, /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
          notification: this.notificationState,
          forceCount: false,
          roomId: this.props.room.roomId
        }));
      }
    }

    let messagePreview = null;

    if (this.showMessagePreview && this.state.messagePreview) {
      messagePreview = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomTile_messagePreview",
        id: messagePreviewId(this.props.room.roomId),
        title: this.state.messagePreview
      }, this.state.messagePreview);
    }

    const nameClasses = (0, _classnames.default)({
      "mx_RoomTile_name": true,
      "mx_RoomTile_nameWithPreview": !!messagePreview,
      "mx_RoomTile_nameHasUnreadEvents": this.notificationState.isUnread
    });

    let nameContainer = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomTile_nameContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      title: name,
      className: nameClasses,
      tabIndex: -1,
      dir: "auto"
    }, name), messagePreview);

    if (this.props.isMinimized) nameContainer = null;
    let ariaLabel = name; // The following labels are written in such a fashion to increase screen reader efficiency (speed).

    if (this.props.tag === _models.DefaultTagID.Invite) {// append nothing
    } else if (this.notificationState.hasMentions) {
      ariaLabel += " " + (0, _languageHandler._t)("%(count)s unread messages including mentions.", {
        count: this.notificationState.count
      });
    } else if (this.notificationState.hasUnreadCount) {
      ariaLabel += " " + (0, _languageHandler._t)("%(count)s unread messages.", {
        count: this.notificationState.count
      });
    } else if (this.notificationState.isUnread) {
      ariaLabel += " " + (0, _languageHandler._t)("Unread messages.");
    }

    let ariaDescribedBy
    /*: string*/
    ;

    if (this.showMessagePreview) {
      ariaDescribedBy = messagePreviewId(this.props.room.roomId);
    }

    const props
    /*: Partial<React.ComponentProps<typeof AccessibleTooltipButton>>*/
    = {};
    let Button
    /*: React.ComponentType<React.ComponentProps<typeof AccessibleButton>>*/
    = _AccessibleButton.default;

    if (this.props.isMinimized) {
      Button = _AccessibleTooltipButton.default;
      props.title = name; // force the tooltip to hide whilst we are showing the context menu

      props.forceHide = !!this.state.generalMenuPosition;
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingTabIndexWrapper, {
      inputRef: this.roomTileRef
    }, ({
      onFocus,
      isActive,
      ref
    }) => /*#__PURE__*/_react.default.createElement(Button, (0, _extends2.default)({}, props, {
      onFocus: onFocus,
      tabIndex: isActive ? 0 : -1,
      inputRef: ref,
      className: classes,
      onClick: this.onTileClick,
      onContextMenu: this.onContextMenu,
      role: "treeitem",
      "aria-label": ariaLabel,
      "aria-selected": this.state.selected,
      "aria-describedby": ariaDescribedBy
    }), roomAvatar, nameContainer, badge, this.renderGeneralMenu(), this.renderNotificationsMenu(isActive))));
  }

}, _temp)) || _class);
exports.default = RoomTile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21UaWxlLnRzeCJdLCJuYW1lcyI6WyJtZXNzYWdlUHJldmlld0lkIiwicm9vbUlkIiwiY29udGV4dE1lbnVCZWxvdyIsImVsZW1lbnRSZWN0IiwibGVmdCIsIndpbmRvdyIsInBhZ2VYT2Zmc2V0IiwidG9wIiwiYm90dG9tIiwicGFnZVlPZmZzZXQiLCJjaGV2cm9uRmFjZSIsIkNoZXZyb25GYWNlIiwiTm9uZSIsIlJvb21UaWxlIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInJvb20iLCJmb3JjZVVwZGF0ZSIsInNob3dNZXNzYWdlUHJldmlldyIsInN0YXRlIiwibWVzc2FnZVByZXZpZXciLCJzZXRTdGF0ZSIsImdlbmVyYXRlUHJldmlldyIsImV2IiwiaGFzVW5zZW50RXZlbnRzIiwiY291bnRVbnNlbnRFdmVudHMiLCJwcm9wZXJ0eSIsIkNhY2hlZFJvb21LZXkiLCJOb3RpZmljYXRpb25Wb2x1bWUiLCJvbk5vdGlmaWNhdGlvblVwZGF0ZSIsInBheWxvYWQiLCJhY3Rpb24iLCJyb29tX2lkIiwic2hvd19yb29tX3RpbGUiLCJzZXRJbW1lZGlhdGUiLCJzY3JvbGxJbnRvVmlldyIsInJvb21UaWxlUmVmIiwiY3VycmVudCIsImJsb2NrIiwiYmVoYXZpb3IiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImRpcyIsImRpc3BhdGNoIiwiY2xlYXJfc2VhcmNoIiwia2V5IiwiS2V5IiwiRU5URVIiLCJTUEFDRSIsImlzQWN0aXZlIiwic2VsZWN0ZWQiLCJ0YXJnZXQiLCJub3RpZmljYXRpb25zTWVudVBvc2l0aW9uIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiZ2VuZXJhbE1lbnVQb3NpdGlvbiIsInNob3dDb250ZXh0TWVudSIsImNsaWVudFgiLCJjbGllbnRZIiwidGFnSWQiLCJEZWZhdWx0VGFnSUQiLCJGYXZvdXJpdGUiLCJMb3dQcmlvcml0eSIsImludmVyc2VUYWciLCJpc0FwcGxpZWQiLCJSb29tTGlzdFN0b3JlIiwiaW5zdGFuY2UiLCJnZXRUYWdzRm9yUm9vbSIsImluY2x1ZGVzIiwicmVtb3ZlVGFnIiwiYWRkVGFnIiwiUm9vbUxpc3RBY3Rpb25zIiwidGFnUm9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInVuZGVmaW5lZCIsImNvbnNvbGUiLCJ3YXJuIiwic2F2ZU5vdGlmU3RhdGUiLCJBTExfTUVTU0FHRVMiLCJBTExfTUVTU0FHRVNfTE9VRCIsIk1FTlRJT05TX09OTFkiLCJNVVRFIiwiQWN0aXZlUm9vbU9ic2VydmVyIiwiYWN0aXZlUm9vbUlkIiwibm90aWZpY2F0aW9uU3RhdGUiLCJSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSIsImdldFJvb21TdGF0ZSIsInJvb21Qcm9wcyIsIkVjaG9DaGFtYmVyIiwiZm9yUm9vbSIsInJlc2l6ZU5vdGlmaWVyIiwib24iLCJvblJlc2l6ZSIsImxlbmd0aCIsInRhZyIsIkludml0ZSIsImlzTWluaW1pemVkIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwiTWVzc2FnZVByZXZpZXdTdG9yZSIsIm9mZiIsImdldFByZXZpZXdDaGFuZ2VkRXZlbnROYW1lIiwib25Sb29tUHJldmlld0NoYW5nZWQiLCJDb21tdW5pdHlQcm90b3R5cGVTdG9yZSIsImdldFVwZGF0ZUV2ZW50TmFtZSIsIm9uQ29tbXVuaXR5VXBkYXRlIiwib25Sb29tTmFtZVVwZGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiYWRkTGlzdGVuZXIiLCJvbkFjdGl2ZVJvb21VcGRhdGUiLCJkaXNwYXRjaGVyUmVmIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiTk9USUZJQ0FUSU9OX1NUQVRFX1VQREFURSIsIlBST1BFUlRZX1VQREFURUQiLCJvblJvb21Qcm9wZXJ0eVVwZGF0ZSIsIm9uTG9jYWxFY2hvVXBkYXRlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwiZ2V0UHJldmlld0ZvclJvb20iLCJuZXdTdGF0ZSIsImlzR3Vlc3QiLCJub3RpZmljYXRpb25Wb2x1bWUiLCJyZW5kZXJOb3RpZmljYXRpb25zTWVudSIsIkFyY2hpdmVkIiwiY29udGV4dE1lbnUiLCJvbkNsb3NlTm90aWZpY2F0aW9uc01lbnUiLCJvbkNsaWNrQWxsTm90aWZzIiwib25DbGlja0FsZXJ0TWUiLCJvbkNsaWNrTWVudGlvbnMiLCJvbkNsaWNrTXV0ZSIsImNsYXNzZXMiLCJteF9Sb29tVGlsZV9pY29uQmVsbCIsIm14X1Jvb21UaWxlX2ljb25CZWxsRG90IiwibXhfUm9vbVRpbGVfaWNvbkJlbGxNZW50aW9ucyIsIm14X1Jvb21UaWxlX2ljb25CZWxsQ3Jvc3NlZCIsIm14X1Jvb21UaWxlX25vdGlmaWNhdGlvbnNCdXR0b25fc2hvdyIsIm9uTm90aWZpY2F0aW9uc01lbnVPcGVuQ2xpY2siLCJyZW5kZXJHZW5lcmFsTWVudSIsIm9uQ2xvc2VHZW5lcmFsTWVudSIsIm9uRm9yZ2V0Um9vbUNsaWNrIiwicm9vbVRhZ3MiLCJpc0Zhdm9yaXRlIiwiZmF2b3VyaXRlTGFiZWwiLCJpc0xvd1ByaW9yaXR5IiwibG93UHJpb3JpdHlMYWJlbCIsInVzZXJJZCIsImdldFVzZXJJZCIsImNhbkludml0ZSIsImUiLCJvblRhZ1Jvb20iLCJvbkludml0ZUNsaWNrIiwib25PcGVuUm9vbVNldHRpbmdzIiwib25MZWF2ZVJvb21DbGljayIsIm9uR2VuZXJhbE1lbnVPcGVuQ2xpY2siLCJyZW5kZXIiLCJyb29tUHJvZmlsZSIsImRpc3BsYXlOYW1lIiwiYXZhdGFyTXhjIiwiZ2V0SW52aXRlUHJvZmlsZSIsIm5hbWUiLCJyZXBsYWNlIiwicm9vbUF2YXRhciIsImF2YXRhclVybCIsImJhZGdlIiwiU3RhdGljTm90aWZpY2F0aW9uU3RhdGUiLCJSRURfRVhDTEFNQVRJT04iLCJuYW1lQ2xhc3NlcyIsImlzVW5yZWFkIiwibmFtZUNvbnRhaW5lciIsImFyaWFMYWJlbCIsImhhc01lbnRpb25zIiwiY291bnQiLCJoYXNVbnJlYWRDb3VudCIsImFyaWFEZXNjcmliZWRCeSIsIkJ1dHRvbiIsIkFjY2Vzc2libGVCdXR0b24iLCJBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiIsInRpdGxlIiwiZm9yY2VIaWRlIiwib25Gb2N1cyIsInJlZiIsIm9uVGlsZUNsaWNrIiwib25Db250ZXh0TWVudSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOzs7O0FBcUJBLE1BQU1BLGdCQUFnQixHQUFHLENBQUNDO0FBQUQ7QUFBQSxLQUFxQiw4QkFBNkJBLE1BQU8sRUFBbEY7O0FBRUEsTUFBTUMsZ0JBQWdCLEdBQUcsQ0FBQ0M7QUFBRDtBQUFBLEtBQWlDO0FBQ3REO0FBQ0EsUUFBTUMsSUFBSSxHQUFHRCxXQUFXLENBQUNDLElBQVosR0FBbUJDLE1BQU0sQ0FBQ0MsV0FBMUIsR0FBd0MsQ0FBckQ7QUFDQSxRQUFNQyxHQUFHLEdBQUdKLFdBQVcsQ0FBQ0ssTUFBWixHQUFxQkgsTUFBTSxDQUFDSSxXQUE1QixHQUEwQyxFQUF0RDtBQUNBLFFBQU1DLFdBQVcsR0FBR0MseUJBQVlDLElBQWhDO0FBQ0EsU0FBTztBQUFDUixJQUFBQSxJQUFEO0FBQU9HLElBQUFBLEdBQVA7QUFBWUcsSUFBQUE7QUFBWixHQUFQO0FBQ0gsQ0FORDs7SUFTcUJHLFEsV0FEcEIsZ0RBQXFCLHNCQUFyQixDLHlCQUFELE1BQ3FCQSxRQURyQixTQUNzQ0MsZUFBTUM7QUFENUM7QUFDMEU7QUFNdEVDLEVBQUFBLFdBQVcsQ0FBQ0M7QUFBRDtBQUFBLElBQWdCO0FB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MUosS0FBTCxDQUFXK0IsUUFWOUI7QUFXSSwwQkFBa0IrSDtBQVh0QixRQWFLWixVQWJMLEVBY0tPLGFBZEwsRUFlS0wsS0FmTCxFQWdCSyxLQUFLMUIsaUJBQUwsRUFoQkwsRUFpQkssS0FBS2YsdUJBQUwsQ0FBNkI3RSxRQUE3QixDQWpCTCxDQUZSLENBREosQ0FESjtBQTJCSDs7QUFsbUJxRSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTUtMjAxNywgMjAxOS0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHsgUm92aW5nVGFiSW5kZXhXcmFwcGVyIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvUm92aW5nVGFiSW5kZXhcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uLCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgS2V5IH0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQgQWN0aXZlUm9vbU9ic2VydmVyIGZyb20gXCIuLi8uLi8uLi9BY3RpdmVSb29tT2JzZXJ2ZXJcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgQ2hldnJvbkZhY2UsIENvbnRleHRNZW51VG9vbHRpcEJ1dHRvbiB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51XCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQsIFRhZ0lEIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgeyBNZXNzYWdlUHJldmlld1N0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvTWVzc2FnZVByZXZpZXdTdG9yZVwiO1xuaW1wb3J0IERlY29yYXRlZFJvb21BdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvRGVjb3JhdGVkUm9vbUF2YXRhclwiO1xuaW1wb3J0IHsgQUxMX01FU1NBR0VTLCBBTExfTUVTU0FHRVNfTE9VRCwgTUVOVElPTlNfT05MWSwgTVVURSB9IGZyb20gXCIuLi8uLi8uLi9Sb29tTm90aWZzXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgTm90aWZpY2F0aW9uQmFkZ2UgZnJvbSBcIi4vTm90aWZpY2F0aW9uQmFkZ2VcIjtcbmltcG9ydCB7IFZvbHVtZSB9IGZyb20gXCIuLi8uLi8uLi9Sb29tTm90aWZzVHlwZXNcIjtcbmltcG9ydCBSb29tTGlzdFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0U3RvcmVcIjtcbmltcG9ydCBSb29tTGlzdEFjdGlvbnMgZnJvbSBcIi4uLy4uLy4uL2FjdGlvbnMvUm9vbUxpc3RBY3Rpb25zXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1Jvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlXCI7XG5pbXBvcnQgeyBOT1RJRklDQVRJT05fU1RBVEVfVVBEQVRFLCBOb3RpZmljYXRpb25TdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Ob3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IHsgRWNob0NoYW1iZXIgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL2xvY2FsLWVjaG8vRWNob0NoYW1iZXJcIjtcbmltcG9ydCB7IENhY2hlZFJvb21LZXksIFJvb21FY2hvQ2hhbWJlciB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9Sb29tRWNob0NoYW1iZXJcIjtcbmltcG9ydCB7IFBST1BFUlRZX1VQREFURUQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL2xvY2FsLWVjaG8vR2VuZXJpY0VjaG9DaGFtYmVyXCI7XG5pbXBvcnQgSWNvbml6ZWRDb250ZXh0TWVudSwge1xuICAgIEljb25pemVkQ29udGV4dE1lbnVDaGVja2JveCxcbiAgICBJY29uaXplZENvbnRleHRNZW51T3B0aW9uLFxuICAgIEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0LFxuICAgIEljb25pemVkQ29udGV4dE1lbnVSYWRpbyxcbn0gZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuaW1wb3J0IHsgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUsIElSb29tUHJvZmlsZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQ29tbXVuaXR5UHJvdG90eXBlU3RvcmVcIjtcbmltcG9ydCB7IHJlcGxhY2VhYmxlQ29tcG9uZW50IH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5pbXBvcnQgeyBnZXRVbnNlbnRNZXNzYWdlcyB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL1Jvb21TdGF0dXNCYXJcIjtcbmltcG9ydCB7IFN0YXRpY05vdGlmaWNhdGlvblN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1N0YXRpY05vdGlmaWNhdGlvblN0YXRlXCI7XG5pbXBvcnQgeyBSZXNpemVOb3RpZmllciB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9SZXNpemVOb3RpZmllclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tOiBSb29tO1xuICAgIHNob3dNZXNzYWdlUHJldmlldzogYm9vbGVhbjtcbiAgICBpc01pbmltaXplZDogYm9vbGVhbjtcbiAgICB0YWc6IFRhZ0lEO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbn1cblxudHlwZSBQYXJ0aWFsRE9NUmVjdCA9IFBpY2s8RE9NUmVjdCwgXCJsZWZ0XCIgfCBcImJvdHRvbVwiPjtcblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgc2VsZWN0ZWQ6IGJvb2xlYW47XG4gICAgbm90aWZpY2F0aW9uc01lbnVQb3NpdGlvbjogUGFydGlhbERPTVJlY3Q7XG4gICAgZ2VuZXJhbE1lbnVQb3NpdGlvbjogUGFydGlhbERPTVJlY3Q7XG4gICAgbWVzc2FnZVByZXZpZXc/OiBzdHJpbmc7XG4gICAgaGFzVW5zZW50RXZlbnRzOiBib29sZWFuO1xufVxuXG5jb25zdCBtZXNzYWdlUHJldmlld0lkID0gKHJvb21JZDogc3RyaW5nKSA9PiBgbXhfUm9vbVRpbGVfbWVzc2FnZVByZXZpZXdfJHtyb29tSWR9YDtcblxuY29uc3QgY29udGV4dE1lbnVCZWxvdyA9IChlbGVtZW50UmVjdDogUGFydGlhbERPTVJlY3QpID0+IHtcbiAgICAvLyBhbGlnbiB0aGUgY29udGV4dCBtZW51J3MgaWNvbnMgd2l0aCB0aGUgaWNvbiB3aGljaCBvcGVuZWQgdGhlIGNvbnRleHQgbWVudVxuICAgIGNvbnN0IGxlZnQgPSBlbGVtZW50UmVjdC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0IC0gOTtcbiAgICBjb25zdCB0b3AgPSBlbGVtZW50UmVjdC5ib3R0b20gKyB3aW5kb3cucGFnZVlPZmZzZXQgKyAxNztcbiAgICBjb25zdCBjaGV2cm9uRmFjZSA9IENoZXZyb25GYWNlLk5vbmU7XG4gICAgcmV0dXJuIHtsZWZ0LCB0b3AsIGNoZXZyb25GYWNlfTtcbn07XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnJvb21zLlJvb21UaWxlXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tVGlsZSBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIHJvb21UaWxlUmVmID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgbm90aWZpY2F0aW9uU3RhdGU6IE5vdGlmaWNhdGlvblN0YXRlO1xuICAgIHByaXZhdGUgcm9vbVByb3BzOiBSb29tRWNob0NoYW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2VsZWN0ZWQ6IEFjdGl2ZVJvb21PYnNlcnZlci5hY3RpdmVSb29tSWQgPT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgICAgICBub3RpZmljYXRpb25zTWVudVBvc2l0aW9uOiBudWxsLFxuICAgICAgICAgICAgZ2VuZXJhbE1lbnVQb3NpdGlvbjogbnVsbCxcbiAgICAgICAgICAgIGhhc1Vuc2VudEV2ZW50czogdGhpcy5jb3VudFVuc2VudEV2ZW50cygpID4gMCxcblxuICAgICAgICAgICAgLy8gZ2VuZXJhdGVQcmV2aWV3KCkgd2lsbCByZXR1cm4gbm90aGluZyBpZiB0aGUgdXNlciBoYXMgcHJldmlld3MgZGlzYWJsZWRcbiAgICAgICAgICAgIG1lc3NhZ2VQcmV2aWV3OiB0aGlzLmdlbmVyYXRlUHJldmlldygpLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvblN0YXRlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHRoaXMucHJvcHMucm9vbSk7XG4gICAgICAgIHRoaXMucm9vbVByb3BzID0gRWNob0NoYW1iZXIuZm9yUm9vbSh0aGlzLnByb3BzLnJvb20pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXNpemVOb3RpZmllci5vbihcIm1pZGRsZVBhbmVsUmVzaXplZFwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY291bnRVbnNlbnRFdmVudHMoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIGdldFVuc2VudE1lc3NhZ2VzKHRoaXMucHJvcHMucm9vbSkubGVuZ3RoO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Sb29tTmFtZVVwZGF0ZSA9IChyb29tKSA9PiB7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTm90aWZpY2F0aW9uVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7IC8vIG5vdGlmaWNhdGlvbiBzdGF0ZSBjaGFuZ2VkIC0gdXBkYXRlXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnNob3dNZXNzYWdlUHJldmlldyAmJiAhdGhpcy5zdGF0ZS5tZXNzYWdlUHJldmlldykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVzc2FnZVByZXZpZXc6IHRoaXMuZ2VuZXJhdGVQcmV2aWV3KCl9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTG9jYWxFY2hvVXBkYXRlZCA9IChldjogTWF0cml4RXZlbnQsIHJvb206IFJvb20pID0+IHtcbiAgICAgICAgaWYgKCFyb29tPy5yb29tSWQgPT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGFzVW5zZW50RXZlbnRzOiB0aGlzLmNvdW50VW5zZW50RXZlbnRzKCkgPiAwfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tUHJvcGVydHlVcGRhdGUgPSAocHJvcGVydHk6IENhY2hlZFJvb21LZXkpID0+IHtcbiAgICAgICAgaWYgKHByb3BlcnR5ID09PSBDYWNoZWRSb29tS2V5Lk5vdGlmaWNhdGlvblZvbHVtZSkgdGhpcy5vbk5vdGlmaWNhdGlvblVwZGF0ZSgpO1xuICAgICAgICAvLyBlbHNlIGlnbm9yZSAtIG5vdCBpbXBvcnRhbnQgZm9yIHRoaXMgdGlsZVxuICAgIH07XG5cbiAgICBwcml2YXRlIGdldCBzaG93Q29udGV4dE1lbnUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnRhZyAhPT0gRGVmYXVsdFRhZ0lELkludml0ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBzaG93TWVzc2FnZVByZXZpZXcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhdGhpcy5wcm9wcy5pc01pbmltaXplZCAmJiB0aGlzLnByb3BzLnNob3dNZXNzYWdlUHJldmlldztcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUmVhZG9ubHk8SVByb3BzPiwgcHJldlN0YXRlOiBSZWFkb25seTxJU3RhdGU+KSB7XG4gICAgICAgIGlmIChwcmV2UHJvcHMuc2hvd01lc3NhZ2VQcmV2aWV3ICE9PSB0aGlzLnByb3BzLnNob3dNZXNzYWdlUHJldmlldyAmJiB0aGlzLnNob3dNZXNzYWdlUHJldmlldykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVzc2FnZVByZXZpZXc6IHRoaXMuZ2VuZXJhdGVQcmV2aWV3KCl9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJldlByb3BzLnJvb20/LnJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tPy5yb29tSWQpIHtcbiAgICAgICAgICAgIE1lc3NhZ2VQcmV2aWV3U3RvcmUuaW5zdGFuY2Uub2ZmKFxuICAgICAgICAgICAgICAgIE1lc3NhZ2VQcmV2aWV3U3RvcmUuZ2V0UHJldmlld0NoYW5nZWRFdmVudE5hbWUocHJldlByb3BzLnJvb20pLFxuICAgICAgICAgICAgICAgIHRoaXMub25Sb29tUHJldmlld0NoYW5nZWQsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgTWVzc2FnZVByZXZpZXdTdG9yZS5pbnN0YW5jZS5vbihcbiAgICAgICAgICAgICAgICBNZXNzYWdlUHJldmlld1N0b3JlLmdldFByZXZpZXdDaGFuZ2VkRXZlbnROYW1lKHRoaXMucHJvcHMucm9vbSksXG4gICAgICAgICAgICAgICAgdGhpcy5vblJvb21QcmV2aWV3Q2hhbmdlZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5vZmYoXG4gICAgICAgICAgICAgICAgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuZ2V0VXBkYXRlRXZlbnROYW1lKHByZXZQcm9wcy5yb29tPy5yb29tSWQpLFxuICAgICAgICAgICAgICAgIHRoaXMub25Db21tdW5pdHlVcGRhdGUsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2Uub24oXG4gICAgICAgICAgICAgICAgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuZ2V0VXBkYXRlRXZlbnROYW1lKHRoaXMucHJvcHMucm9vbT8ucm9vbUlkKSxcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ29tbXVuaXR5VXBkYXRlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHByZXZQcm9wcy5yb29tPy5vZmYoXCJSb29tLm5hbWVcIiwgdGhpcy5vblJvb21OYW1lVXBkYXRlKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbT8ub24oXCJSb29tLm5hbWVcIiwgdGhpcy5vblJvb21OYW1lVXBkYXRlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gd2hlbiB3ZSdyZSBmaXJzdCByZW5kZXJlZCAob3Igb3VyIHN1Ymxpc3QgaXMgZXhwYW5kZWQpIG1ha2Ugc3VyZSB3ZSBhcmUgdmlzaWJsZSBpZiB3ZSdyZSBhY3RpdmVcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFjdGl2ZVJvb21PYnNlcnZlci5hZGRMaXN0ZW5lcih0aGlzLnByb3BzLnJvb20ucm9vbUlkLCB0aGlzLm9uQWN0aXZlUm9vbVVwZGF0ZSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRlZmF1bHREaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICBNZXNzYWdlUHJldmlld1N0b3JlLmluc3RhbmNlLm9uKFxuICAgICAgICAgICAgTWVzc2FnZVByZXZpZXdTdG9yZS5nZXRQcmV2aWV3Q2hhbmdlZEV2ZW50TmFtZSh0aGlzLnByb3BzLnJvb20pLFxuICAgICAgICAgICAgdGhpcy5vblJvb21QcmV2aWV3Q2hhbmdlZCxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25TdGF0ZS5vbihOT1RJRklDQVRJT05fU1RBVEVfVVBEQVRFLCB0aGlzLm9uTm90aWZpY2F0aW9uVXBkYXRlKTtcbiAgICAgICAgdGhpcy5yb29tUHJvcHMub24oUFJPUEVSVFlfVVBEQVRFRCwgdGhpcy5vblJvb21Qcm9wZXJ0eVVwZGF0ZSk7XG4gICAgICAgIHRoaXMucm9vbVByb3BzLm9uKFwiUm9vbS5uYW1lXCIsIHRoaXMub25Sb29tTmFtZVVwZGF0ZSk7XG4gICAgICAgIENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLm9uKFxuICAgICAgICAgICAgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuZ2V0VXBkYXRlRXZlbnROYW1lKHRoaXMucHJvcHMucm9vbS5yb29tSWQpLFxuICAgICAgICAgICAgdGhpcy5vbkNvbW11bml0eVVwZGF0ZSxcbiAgICAgICAgKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFwiUm9vbS5sb2NhbEVjaG9VcGRhdGVkXCIsIHRoaXMub25Mb2NhbEVjaG9VcGRhdGVkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJvb20pIHtcbiAgICAgICAgICAgIEFjdGl2ZVJvb21PYnNlcnZlci5yZW1vdmVMaXN0ZW5lcih0aGlzLnByb3BzLnJvb20ucm9vbUlkLCB0aGlzLm9uQWN0aXZlUm9vbVVwZGF0ZSk7XG4gICAgICAgICAgICBNZXNzYWdlUHJldmlld1N0b3JlLmluc3RhbmNlLm9mZihcbiAgICAgICAgICAgICAgICBNZXNzYWdlUHJldmlld1N0b3JlLmdldFByZXZpZXdDaGFuZ2VkRXZlbnROYW1lKHRoaXMucHJvcHMucm9vbSksXG4gICAgICAgICAgICAgICAgdGhpcy5vblJvb21QcmV2aWV3Q2hhbmdlZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5vZmYoXG4gICAgICAgICAgICAgICAgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuZ2V0VXBkYXRlRXZlbnROYW1lKHRoaXMucHJvcHMucm9vbS5yb29tSWQpLFxuICAgICAgICAgICAgICAgIHRoaXMub25Db21tdW5pdHlVcGRhdGUsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yb29tLm9mZihcIlJvb20ubmFtZVwiLCB0aGlzLm9uUm9vbU5hbWVVcGRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLm9mZihcIm1pZGRsZVBhbmVsUmVzaXplZFwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgfVxuICAgICAgICBBY3RpdmVSb29tT2JzZXJ2ZXIucmVtb3ZlTGlzdGVuZXIodGhpcy5wcm9wcy5yb29tLnJvb21JZCwgdGhpcy5vbkFjdGl2ZVJvb21VcGRhdGUpO1xuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9uU3RhdGUub2ZmKE5PVElGSUNBVElPTl9TVEFURV9VUERBVEUsIHRoaXMub25Ob3RpZmljYXRpb25VcGRhdGUpO1xuICAgICAgICB0aGlzLnJvb21Qcm9wcy5vZmYoUFJPUEVSVFlfVVBEQVRFRCwgdGhpcy5vblJvb21Qcm9wZXJ0eVVwZGF0ZSk7XG4gICAgICAgIHRoaXMucm9vbVByb3BzLm9mZihcIlJvb20ubmFtZVwiLCB0aGlzLm9uUm9vbU5hbWVVcGRhdGUpO1xuICAgICAgICBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5vZmYoXG4gICAgICAgICAgICBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5nZXRVcGRhdGVFdmVudE5hbWUodGhpcy5wcm9wcy5yb29tLnJvb21JZCksXG4gICAgICAgICAgICB0aGlzLm9uQ29tbXVuaXR5VXBkYXRlLFxuICAgICAgICApO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCk/LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS5sb2NhbEVjaG9VcGRhdGVkXCIsIHRoaXMub25Mb2NhbEVjaG9VcGRhdGVkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBcInZpZXdfcm9vbVwiICYmIHBheWxvYWQucm9vbV9pZCA9PT0gdGhpcy5wcm9wcy5yb29tLnJvb21JZCAmJiBwYXlsb2FkLnNob3dfcm9vbV90aWxlKSB7XG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db21tdW5pdHlVcGRhdGUgPSAocm9vbUlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tLnJvb21JZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7IC8vIHdlIGRvbid0IGhhdmUgYW55dGhpbmcgdG8gYWN0dWFsbHkgdXBkYXRlXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tUHJldmlld0NoYW5nZWQgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yb29tICYmIHJvb20ucm9vbUlkID09PSB0aGlzLnByb3BzLnJvb20ucm9vbUlkKSB7XG4gICAgICAgICAgICAvLyBnZW5lcmF0ZVByZXZpZXcoKSB3aWxsIHJldHVybiBub3RoaW5nIGlmIHRoZSB1c2VyIGhhcyBwcmV2aWV3cyBkaXNhYmxlZFxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVzc2FnZVByZXZpZXc6IHRoaXMuZ2VuZXJhdGVQcmV2aWV3KCl9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlUHJldmlldygpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3dNZXNzYWdlUHJldmlldykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gTWVzc2FnZVByZXZpZXdTdG9yZS5pbnN0YW5jZS5nZXRQcmV2aWV3Rm9yUm9vbSh0aGlzLnByb3BzLnJvb20sIHRoaXMucHJvcHMudGFnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNjcm9sbEludG9WaWV3ID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucm9vbVRpbGVSZWYuY3VycmVudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnJvb21UaWxlUmVmLmN1cnJlbnQuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgICAgYmxvY2s6IFwibmVhcmVzdFwiLFxuICAgICAgICAgICAgYmVoYXZpb3I6IFwiYXV0b1wiLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblRpbGVDbGljayA9IChldjogUmVhY3QuS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICBzaG93X3Jvb21fdGlsZTogdHJ1ZSwgLy8gbWFrZSBzdXJlIHRoZSByb29tIGlzIHZpc2libGUgaW4gdGhlIGxpc3RcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgICAgICBjbGVhcl9zZWFyY2g6IChldiAmJiAoZXYua2V5ID09PSBLZXkuRU5URVIgfHwgZXYua2V5ID09PSBLZXkuU1BBQ0UpKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3RpdmVSb29tVXBkYXRlID0gKGlzQWN0aXZlOiBib29sZWFuKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkOiBpc0FjdGl2ZX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTm90aWZpY2F0aW9uc01lbnVPcGVuQ2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2LnRhcmdldCBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bm90aWZpY2F0aW9uc01lbnVQb3NpdGlvbjogdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DbG9zZU5vdGlmaWNhdGlvbnNNZW51ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtub3RpZmljYXRpb25zTWVudVBvc2l0aW9uOiBudWxsfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25HZW5lcmFsTWVudU9wZW5DbGljayA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXYudGFyZ2V0IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtnZW5lcmFsTWVudVBvc2l0aW9uOiB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCl9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbnRleHRNZW51ID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBjb250ZXh0IG1lbnUgdG8gc2hvdywgaWdub3JlIHRoZSBhY3Rpb24uXG4gICAgICAgIGlmICghdGhpcy5zaG93Q29udGV4dE1lbnUpIHJldHVybjtcblxuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBnZW5lcmFsTWVudVBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogZXYuY2xpZW50WCxcbiAgICAgICAgICAgICAgICBib3R0b206IGV2LmNsaWVudFksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNsb3NlR2VuZXJhbE1lbnUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2dlbmVyYWxNZW51UG9zaXRpb246IG51bGx9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblRhZ1Jvb20gPSAoZXY6IEJ1dHRvbkV2ZW50LCB0YWdJZDogVGFnSUQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgaWYgKHRhZ0lkID09PSBEZWZhdWx0VGFnSUQuRmF2b3VyaXRlIHx8IHRhZ0lkID09PSBEZWZhdWx0VGFnSUQuTG93UHJpb3JpdHkpIHtcbiAgICAgICAgICAgIGNvbnN0IGludmVyc2VUYWcgPSB0YWdJZCA9PT0gRGVmYXVsdFRhZ0lELkZhdm91cml0ZSA/IERlZmF1bHRUYWdJRC5Mb3dQcmlvcml0eSA6IERlZmF1bHRUYWdJRC5GYXZvdXJpdGU7XG4gICAgICAgICAgICBjb25zdCBpc0FwcGxpZWQgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldFRhZ3NGb3JSb29tKHRoaXMucHJvcHMucm9vbSkuaW5jbHVkZXModGFnSWQpO1xuICAgICAgICAgICAgY29uc3QgcmVtb3ZlVGFnID0gaXNBcHBsaWVkID8gdGFnSWQgOiBpbnZlcnNlVGFnO1xuICAgICAgICAgICAgY29uc3QgYWRkVGFnID0gaXNBcHBsaWVkID8gbnVsbCA6IHRhZ0lkO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKFJvb21MaXN0QWN0aW9ucy50YWdSb29tKFxuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnJvb20sXG4gICAgICAgICAgICAgICAgcmVtb3ZlVGFnLFxuICAgICAgICAgICAgICAgIGFkZFRhZyxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmV4cGVjdGVkIHRhZyAke3RhZ0lkfSBhcHBsaWVkIHRvICR7dGhpcy5wcm9wcy5yb29tLnJvb21faWR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGV2IGFzIFJlYWN0LktleWJvYXJkRXZlbnQpLmtleSA9PT0gS2V5LkVOVEVSKSB7XG4gICAgICAgICAgICAvLyBJbXBsZW1lbnRzIGh0dHBzOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS1wcmFjdGljZXMvI2tleWJvYXJkLWludGVyYWN0aW9uLTEyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtnZW5lcmFsTWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGhpZGUgdGhlIG1lbnVcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTGVhdmVSb29tQ2xpY2sgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdsZWF2ZV9yb29tJyxcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtnZW5lcmFsTWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGhpZGUgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZvcmdldFJvb21DbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2ZvcmdldF9yb29tJyxcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtnZW5lcmFsTWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGhpZGUgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk9wZW5Sb29tU2V0dGluZ3MgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdvcGVuX3Jvb21fc2V0dGluZ3MnLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy5yb29tLnJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2dlbmVyYWxNZW51UG9zaXRpb246IG51bGx9KTsgLy8gaGlkZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSW52aXRlQ2xpY2sgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X2ludml0ZScsXG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtnZW5lcmFsTWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGhpZGUgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlTm90aWZTdGF0ZShldjogQnV0dG9uRXZlbnQsIG5ld1N0YXRlOiBWb2x1bWUpIHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yb29tUHJvcHMubm90aWZpY2F0aW9uVm9sdW1lID0gbmV3U3RhdGU7XG5cbiAgICAgICAgY29uc3Qga2V5ID0gKGV2IGFzIFJlYWN0LktleWJvYXJkRXZlbnQpLmtleTtcbiAgICAgICAgaWYgKGtleSA9PT0gS2V5LkVOVEVSKSB7XG4gICAgICAgICAgICAvLyBJbXBsZW1lbnRzIGh0dHBzOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS1wcmFjdGljZXMvI2tleWJvYXJkLWludGVyYWN0aW9uLTEyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtub3RpZmljYXRpb25zTWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGhpZGUgdGhlIG1lbnVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25DbGlja0FsbE5vdGlmcyA9IGV2ID0+IHRoaXMuc2F2ZU5vdGlmU3RhdGUoZXYsIEFMTF9NRVNTQUdFUyk7XG4gICAgcHJpdmF0ZSBvbkNsaWNrQWxlcnRNZSA9IGV2ID0+IHRoaXMuc2F2ZU5vdGlmU3RhdGUoZXYsIEFMTF9NRVNTQUdFU19MT1VEKTtcbiAgICBwcml2YXRlIG9uQ2xpY2tNZW50aW9ucyA9IGV2ID0+IHRoaXMuc2F2ZU5vdGlmU3RhdGUoZXYsIE1FTlRJT05TX09OTFkpO1xuICAgIHByaXZhdGUgb25DbGlja011dGUgPSBldiA9PiB0aGlzLnNhdmVOb3RpZlN0YXRlKGV2LCBNVVRFKTtcblxuICAgIHByaXZhdGUgcmVuZGVyTm90aWZpY2F0aW9uc01lbnUoaXNBY3RpdmU6IGJvb2xlYW4pOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSB8fCB0aGlzLnByb3BzLnRhZyA9PT0gRGVmYXVsdFRhZ0lELkFyY2hpdmVkIHx8XG4gICAgICAgICAgICAhdGhpcy5zaG93Q29udGV4dE1lbnUgfHwgdGhpcy5wcm9wcy5pc01pbmltaXplZFxuICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIHRoZSBtZW51IG1ha2VzIG5vIHNlbnNlIGluIHRoZXNlIGNhc2VzIHNvIGRvIG5vdCBzaG93IG9uZVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMucm9vbVByb3BzLm5vdGlmaWNhdGlvblZvbHVtZTtcblxuICAgICAgICBsZXQgY29udGV4dE1lbnUgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ub3RpZmljYXRpb25zTWVudVBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjb250ZXh0TWVudSA9IDxJY29uaXplZENvbnRleHRNZW51XG4gICAgICAgICAgICAgICAgey4uLmNvbnRleHRNZW51QmVsb3codGhpcy5zdGF0ZS5ub3RpZmljYXRpb25zTWVudVBvc2l0aW9uKX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uQ2xvc2VOb3RpZmljYXRpb25zTWVudX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tVGlsZV9jb250ZXh0TWVudVwiXG4gICAgICAgICAgICAgICAgY29tcGFjdFxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCBmaXJzdD5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVSYWRpb1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiVXNlIGRlZmF1bHRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU9e3N0YXRlID09PSBBTExfTUVTU0FHRVN9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvbkJlbGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrQWxsTm90aWZzfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudVJhZGlvXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJBbGwgbWVzc2FnZXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU9e3N0YXRlID09PSBBTExfTUVTU0FHRVNfTE9VRH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tVGlsZV9pY29uQmVsbERvdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2tBbGVydE1lfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudVJhZGlvXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJNZW50aW9ucyAmIEtleXdvcmRzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlPXtzdGF0ZSA9PT0gTUVOVElPTlNfT05MWX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tVGlsZV9pY29uQmVsbE1lbnRpb25zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DbGlja01lbnRpb25zfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudVJhZGlvXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJOb25lXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlPXtzdGF0ZSA9PT0gTVVURX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tVGlsZV9pY29uQmVsbENyb3NzZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrTXV0ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfUm9vbVRpbGVfbm90aWZpY2F0aW9uc0J1dHRvblwiLCB7XG4gICAgICAgICAgICAvLyBTaG93IGJlbGwgaWNvbiBmb3IgdGhlIGRlZmF1bHQgY2FzZSB0b28uXG4gICAgICAgICAgICBteF9Sb29tVGlsZV9pY29uQmVsbDogc3RhdGUgPT09IEFMTF9NRVNTQUdFUyxcbiAgICAgICAgICAgIG14X1Jvb21UaWxlX2ljb25CZWxsRG90OiBzdGF0ZSA9PT0gQUxMX01FU1NBR0VTX0xPVUQsXG4gICAgICAgICAgICBteF9Sb29tVGlsZV9pY29uQmVsbE1lbnRpb25zOiBzdGF0ZSA9PT0gTUVOVElPTlNfT05MWSxcbiAgICAgICAgICAgIG14X1Jvb21UaWxlX2ljb25CZWxsQ3Jvc3NlZDogc3RhdGUgPT09IE1VVEUsXG5cbiAgICAgICAgICAgIC8vIE9ubHkgc2hvdyB0aGUgaWNvbiBieSBkZWZhdWx0IGlmIHRoZSByb29tIGlzIG92ZXJyaWRkZW4gdG8gbXV0ZWQuXG4gICAgICAgICAgICAvLyBUT0RPOiBbRlRVRSBOb3RpZmljYXRpb25zXSBQcm9iYWJseSBuZWVkIHRvIGRldGVjdCBnbG9iYWwgbXV0ZSBzdGF0ZVxuICAgICAgICAgICAgbXhfUm9vbVRpbGVfbm90aWZpY2F0aW9uc0J1dHRvbl9zaG93OiBzdGF0ZSA9PT0gTVVURSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbk5vdGlmaWNhdGlvbnNNZW51T3BlbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJOb3RpZmljYXRpb24gb3B0aW9uc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgaXNFeHBhbmRlZD17ISF0aGlzLnN0YXRlLm5vdGlmaWNhdGlvbnNNZW51UG9zaXRpb259XG4gICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PXtpc0FjdGl2ZSA/IDAgOiAtMX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHtjb250ZXh0TWVudX1cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJHZW5lcmFsTWVudSgpOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBpZiAoIXRoaXMuc2hvd0NvbnRleHRNZW51KSByZXR1cm4gbnVsbDsgLy8gbm8gbWVudSB0byBzaG93XG5cbiAgICAgICAgbGV0IGNvbnRleHRNZW51ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZ2VuZXJhbE1lbnVQb3NpdGlvbiAmJiB0aGlzLnByb3BzLnRhZyA9PT0gRGVmYXVsdFRhZ0lELkFyY2hpdmVkKSB7XG4gICAgICAgICAgICBjb250ZXh0TWVudSA9IDxJY29uaXplZENvbnRleHRNZW51XG4gICAgICAgICAgICAgICAgey4uLmNvbnRleHRNZW51QmVsb3codGhpcy5zdGF0ZS5nZW5lcmFsTWVudVBvc2l0aW9uKX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uQ2xvc2VHZW5lcmFsTWVudX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tVGlsZV9jb250ZXh0TWVudVwiXG4gICAgICAgICAgICAgICAgY29tcGFjdFxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCByZWQ+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvblNpZ25PdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRm9yZ2V0IFJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRm9yZ2V0Um9vbUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZ2VuZXJhbE1lbnVQb3NpdGlvbikge1xuICAgICAgICAgICAgY29uc3Qgcm9vbVRhZ3MgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldFRhZ3NGb3JSb29tKHRoaXMucHJvcHMucm9vbSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGlzRmF2b3JpdGUgPSByb29tVGFncy5pbmNsdWRlcyhEZWZhdWx0VGFnSUQuRmF2b3VyaXRlKTtcbiAgICAgICAgICAgIGNvbnN0IGZhdm91cml0ZUxhYmVsID0gaXNGYXZvcml0ZSA/IF90KFwiRmF2b3VyaXRlZFwiKSA6IF90KFwiRmF2b3VyaXRlXCIpO1xuXG4gICAgICAgICAgICBjb25zdCBpc0xvd1ByaW9yaXR5ID0gcm9vbVRhZ3MuaW5jbHVkZXMoRGVmYXVsdFRhZ0lELkxvd1ByaW9yaXR5KTtcbiAgICAgICAgICAgIGNvbnN0IGxvd1ByaW9yaXR5TGFiZWwgPSBfdChcIkxvdyBQcmlvcml0eVwiKTtcblxuICAgICAgICAgICAgY29uc3QgdXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgY29uc3QgY2FuSW52aXRlID0gdGhpcy5wcm9wcy5yb29tLmNhbkludml0ZSh1c2VySWQpO1xuICAgICAgICAgICAgY29udGV4dE1lbnUgPSA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgIHsuLi5jb250ZXh0TWVudUJlbG93KHRoaXMuc3RhdGUuZ2VuZXJhbE1lbnVQb3NpdGlvbil9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNsb3NlR2VuZXJhbE1lbnV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfY29udGV4dE1lbnVcIlxuICAgICAgICAgICAgICAgIGNvbXBhY3RcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51Q2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLm9uVGFnUm9vbShlLCBEZWZhdWx0VGFnSUQuRmF2b3VyaXRlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZT17aXNGYXZvcml0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtmYXZvdXJpdGVMYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tVGlsZV9pY29uU3RhclwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51Q2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLm9uVGFnUm9vbShlLCBEZWZhdWx0VGFnSUQuTG93UHJpb3JpdHkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlPXtpc0xvd1ByaW9yaXR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e2xvd1ByaW9yaXR5TGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvbkFycm93RG93blwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHtjYW5JbnZpdGUgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25JbnZpdGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJJbnZpdGUgUGVvcGxlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tVGlsZV9pY29uSW52aXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbk9wZW5Sb29tU2V0dGluZ3N9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTZXR0aW5nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tVGlsZV9pY29uU2V0dGluZ3NcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IHJlZD5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25MZWF2ZVJvb21DbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkxlYXZlIFJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvblNpZ25PdXRcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX21lbnVCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uR2VuZXJhbE1lbnVPcGVuQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlJvb20gb3B0aW9uc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgaXNFeHBhbmRlZD17ISF0aGlzLnN0YXRlLmdlbmVyYWxNZW51UG9zaXRpb259XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7Y29udGV4dE1lbnV9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogUmVhY3QuUmVhY3RFbGVtZW50IHtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgJ214X1Jvb21UaWxlJzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9Sb29tVGlsZV9zZWxlY3RlZCc6IHRoaXMuc3RhdGUuc2VsZWN0ZWQsXG4gICAgICAgICAgICAnbXhfUm9vbVRpbGVfaGFzTWVudU9wZW4nOiAhISh0aGlzLnN0YXRlLmdlbmVyYWxNZW51UG9zaXRpb24gfHwgdGhpcy5zdGF0ZS5ub3RpZmljYXRpb25zTWVudVBvc2l0aW9uKSxcbiAgICAgICAgICAgICdteF9Sb29tVGlsZV9taW5pbWl6ZWQnOiB0aGlzLnByb3BzLmlzTWluaW1pemVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcm9vbVByb2ZpbGU6IElSb29tUHJvZmlsZSA9IHtkaXNwbGF5TmFtZTogbnVsbCwgYXZhdGFyTXhjOiBudWxsfTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMudGFnID09PSBEZWZhdWx0VGFnSUQuSW52aXRlKSB7XG4gICAgICAgICAgICByb29tUHJvZmlsZSA9IENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldEludml0ZVByb2ZpbGUodGhpcy5wcm9wcy5yb29tLnJvb21JZCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmFtZSA9IHJvb21Qcm9maWxlLmRpc3BsYXlOYW1lIHx8IHRoaXMucHJvcHMucm9vbS5uYW1lO1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSBuYW1lID0gJyc7XG4gICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoXCI6XCIsIFwiOlxcdTIwMGJcIik7IC8vIGFkZCBhIHplcm8td2lkdGggc3BhY2UgdG8gYWxsb3cgbGluZXdyYXBwaW5nIGFmdGVyIHRoZSBjb2xvblxuXG4gICAgICAgIGNvbnN0IHJvb21BdmF0YXIgPSA8RGVjb3JhdGVkUm9vbUF2YXRhclxuICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgYXZhdGFyU2l6ZT17MzJ9XG4gICAgICAgICAgICB0YWc9e3RoaXMucHJvcHMudGFnfVxuICAgICAgICAgICAgZGlzcGxheUJhZGdlPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfVxuICAgICAgICAgICAgb29iRGF0YT17KHthdmF0YXJVcmw6IHJvb21Qcm9maWxlLmF2YXRhck14Y30pfVxuICAgICAgICAvPjtcblxuICAgICAgICBsZXQgYmFkZ2U6IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmlzTWluaW1pemVkKSB7XG4gICAgICAgICAgICAvLyBhcmlhLWhpZGRlbiBiZWNhdXNlIHdlIHN1bW1hcmlzZSB0aGUgdW5yZWFkIGNvdW50L2hpZ2hsaWdodCBzdGF0dXMgaW4gYSBtYW51YWwgYXJpYS1sYWJlbCBiZWxvd1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGFzVW5zZW50RXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgLy8gaGFyZGNvZGUgdGhlIGJhZGdlIHRvIGEgZGFuZ2VyIHN0YXRlIHdoZW4gdGhlcmUncyB1bnNlbnQgbWVzc2FnZXNcbiAgICAgICAgICAgICAgICBiYWRnZSA9IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVGlsZV9iYWRnZUNvbnRhaW5lclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPE5vdGlmaWNhdGlvbkJhZGdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uPXtTdGF0aWNOb3RpZmljYXRpb25TdGF0ZS5SRURfRVhDTEFNQVRJT059XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VDb3VudD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUlkPXt0aGlzLnByb3BzLnJvb20ucm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ub3RpZmljYXRpb25TdGF0ZSkge1xuICAgICAgICAgICAgICAgIGJhZGdlID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2JhZGdlQ29udGFpbmVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Tm90aWZpY2F0aW9uQmFkZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb249e3RoaXMubm90aWZpY2F0aW9uU3RhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VDb3VudD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUlkPXt0aGlzLnByb3BzLnJvb20ucm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtZXNzYWdlUHJldmlldyA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnNob3dNZXNzYWdlUHJldmlldyAmJiB0aGlzLnN0YXRlLm1lc3NhZ2VQcmV2aWV3KSB7XG4gICAgICAgICAgICBtZXNzYWdlUHJldmlldyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX21lc3NhZ2VQcmV2aWV3XCJcbiAgICAgICAgICAgICAgICAgICAgaWQ9e21lc3NhZ2VQcmV2aWV3SWQodGhpcy5wcm9wcy5yb29tLnJvb21JZCl9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLnN0YXRlLm1lc3NhZ2VQcmV2aWV3fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUubWVzc2FnZVByZXZpZXd9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmFtZUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIFwibXhfUm9vbVRpbGVfbmFtZVwiOiB0cnVlLFxuICAgICAgICAgICAgXCJteF9Sb29tVGlsZV9uYW1lV2l0aFByZXZpZXdcIjogISFtZXNzYWdlUHJldmlldyxcbiAgICAgICAgICAgIFwibXhfUm9vbVRpbGVfbmFtZUhhc1VucmVhZEV2ZW50c1wiOiB0aGlzLm5vdGlmaWNhdGlvblN0YXRlLmlzVW5yZWFkLFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgbmFtZUNvbnRhaW5lciA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfbmFtZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgdGl0bGU9e25hbWV9IGNsYXNzTmFtZT17bmFtZUNsYXNzZXN9IHRhYkluZGV4PXstMX0gZGlyPVwiYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICB7bmFtZX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7bWVzc2FnZVByZXZpZXd9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIG5hbWVDb250YWluZXIgPSBudWxsO1xuXG4gICAgICAgIGxldCBhcmlhTGFiZWwgPSBuYW1lO1xuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGxhYmVscyBhcmUgd3JpdHRlbiBpbiBzdWNoIGEgZmFzaGlvbiB0byBpbmNyZWFzZSBzY3JlZW4gcmVhZGVyIGVmZmljaWVuY3kgKHNwZWVkKS5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMudGFnID09PSBEZWZhdWx0VGFnSUQuSW52aXRlKSB7XG4gICAgICAgICAgICAvLyBhcHBlbmQgbm90aGluZ1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubm90aWZpY2F0aW9uU3RhdGUuaGFzTWVudGlvbnMpIHtcbiAgICAgICAgICAgIGFyaWFMYWJlbCArPSBcIiBcIiArIF90KFwiJShjb3VudClzIHVucmVhZCBtZXNzYWdlcyBpbmNsdWRpbmcgbWVudGlvbnMuXCIsIHtcbiAgICAgICAgICAgICAgICBjb3VudDogdGhpcy5ub3RpZmljYXRpb25TdGF0ZS5jb3VudCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubm90aWZpY2F0aW9uU3RhdGUuaGFzVW5yZWFkQ291bnQpIHtcbiAgICAgICAgICAgIGFyaWFMYWJlbCArPSBcIiBcIiArIF90KFwiJShjb3VudClzIHVucmVhZCBtZXNzYWdlcy5cIiwge1xuICAgICAgICAgICAgICAgIGNvdW50OiB0aGlzLm5vdGlmaWNhdGlvblN0YXRlLmNvdW50LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5ub3RpZmljYXRpb25TdGF0ZS5pc1VucmVhZCkge1xuICAgICAgICAgICAgYXJpYUxhYmVsICs9IFwiIFwiICsgX3QoXCJVbnJlYWQgbWVzc2FnZXMuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFyaWFEZXNjcmliZWRCeTogc3RyaW5nO1xuICAgICAgICBpZiAodGhpcy5zaG93TWVzc2FnZVByZXZpZXcpIHtcbiAgICAgICAgICAgIGFyaWFEZXNjcmliZWRCeSA9IG1lc3NhZ2VQcmV2aWV3SWQodGhpcy5wcm9wcy5yb29tLnJvb21JZCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm9wczogUGFydGlhbDxSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+PiA9IHt9O1xuICAgICAgICBsZXQgQnV0dG9uOiBSZWFjdC5Db21wb25lbnRUeXBlPFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBY2Nlc3NpYmxlQnV0dG9uPj4gPSBBY2Nlc3NpYmxlQnV0dG9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc01pbmltaXplZCkge1xuICAgICAgICAgICAgQnV0dG9uID0gQWNjZXNzaWJsZVRvb2x0aXBCdXR0b247XG4gICAgICAgICAgICBwcm9wcy50aXRsZSA9IG5hbWU7XG4gICAgICAgICAgICAvLyBmb3JjZSB0aGUgdG9vbHRpcCB0byBoaWRlIHdoaWxzdCB3ZSBhcmUgc2hvd2luZyB0aGUgY29udGV4dCBtZW51XG4gICAgICAgICAgICBwcm9wcy5mb3JjZUhpZGUgPSAhIXRoaXMuc3RhdGUuZ2VuZXJhbE1lbnVQb3NpdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPFJvdmluZ1RhYkluZGV4V3JhcHBlciBpbnB1dFJlZj17dGhpcy5yb29tVGlsZVJlZn0+XG4gICAgICAgICAgICAgICAgICAgIHsoe29uRm9jdXMsIGlzQWN0aXZlLCByZWZ9KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZvY3VzPXtvbkZvY3VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PXtpc0FjdGl2ZSA/IDAgOiAtMX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dFJlZj17cmVmfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uVGlsZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29udGV4dE1lbnU9e3RoaXMub25Db250ZXh0TWVudX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwidHJlZWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0aGlzLnN0YXRlLnNlbGVjdGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtZGVzY3JpYmVkYnk9e2FyaWFEZXNjcmliZWRCeX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm9vbUF2YXRhcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bmFtZUNvbnRhaW5lcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmFkZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyR2VuZXJhbE1lbnUoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJOb3RpZmljYXRpb25zTWVudShpc0FjdGl2ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvUm92aW5nVGFiSW5kZXhXcmFwcGVyPlxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
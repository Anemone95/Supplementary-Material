"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 New Vector Ltd
Copyright 2018 Michael Telatynski <7t3chguy@gmail.com>
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

class RoomTile extends _react.default.PureComponent
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
    (0, _defineProperty2.default)(this, "onClickAllNotifs", ev => this.saveNotifState(ev, _RoomNotifs.ALL_MESSAGES));
    (0, _defineProperty2.default)(this, "onClickAlertMe", ev => this.saveNotifState(ev, _RoomNotifs.ALL_MESSAGES_LOUD));
    (0, _defineProperty2.default)(this, "onClickMentions", ev => this.saveNotifState(ev, _RoomNotifs.MENTIONS_ONLY));
    (0, _defineProperty2.default)(this, "onClickMute", ev => this.saveNotifState(ev, _RoomNotifs.MUTE));
    this.state = {
      selected: _ActiveRoomObserver.default.activeRoomId === this.props.room.roomId,
      notificationsMenuPosition: null,
      generalMenuPosition: null,
      // generatePreview() will return nothing if the user has previews disabled
      messagePreview: this.generatePreview()
    };

    _ActiveRoomObserver.default.addListener(this.props.room.roomId, this.onActiveRoomUpdate);

    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _MessagePreviewStore.MessagePreviewStore.instance.on(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(this.props.room), this.onRoomPreviewChanged);

    this.notificationState = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(this.props.room);
    this.notificationState.on(_NotificationState.NOTIFICATION_STATE_UPDATE, this.onNotificationUpdate);
    this.roomProps = _EchoChamber.EchoChamber.forRoom(this.props.room);
    this.roomProps.on(_GenericEchoChamber.PROPERTY_UPDATED, this.onRoomPropertyUpdate);

    _CommunityPrototypeStore.CommunityPrototypeStore.instance.on(_CommunityPrototypeStore.CommunityPrototypeStore.getUpdateEventName(this.props.room.roomId), this.onCommunityUpdate);

    this.props.room.on("Room.name", this.onRoomNameUpdate);
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
  }

  componentWillUnmount() {
    if (this.props.room) {
      _ActiveRoomObserver.default.removeListener(this.props.room.roomId, this.onActiveRoomUpdate);

      _MessagePreviewStore.MessagePreviewStore.instance.off(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(this.props.room), this.onRoomPreviewChanged);

      _CommunityPrototypeStore.CommunityPrototypeStore.instance.off(_CommunityPrototypeStore.CommunityPrototypeStore.getUpdateEventName(this.props.room.roomId), this.onCommunityUpdate);

      this.props.room.off("Room.name", this.onRoomNameUpdate);
    }

    _dispatcher.default.unregister(this.dispatcherRef);

    this.notificationState.off(_NotificationState.NOTIFICATION_STATE_UPDATE, this.onNotificationUpdate);
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
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
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
      badge = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomTile_badgeContainer",
        "aria-hidden": "true"
      }, /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
        notification: this.notificationState,
        forceCount: false,
        roomId: this.props.room.roomId
      }));
    }

    let messagePreview = null;

    if (this.showMessagePreview && this.state.messagePreview) {
      messagePreview = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomTile_messagePreview",
        id: messagePreviewId(this.props.room.roomId)
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

}

exports.default = RoomTile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21UaWxlLnRzeCJdLCJuYW1lcyI6WyJtZXNzYWdlUHJldmlld0lkIiwicm9vbUlkIiwiY29udGV4dE1lbnVCZWxvdyIsImVsZW1lbnRSZWN0IiwibGVmdCIsIndpbmRvdyIsInBhZ2VYT2Zmc2V0IiwidG9wIiwiYm90dG9tIiwicGFnZVlPZmZzZXQiLCJjaGV2cm9uRmFjZSIsIkNoZXZyb25GYWNlIiwiTm9uZSIsIlJvb21UaWxlIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInJvb20iLCJmb3JjZVVwZGF0ZSIsInByb3BlcnR5IiwiQ2FjaGVkUm9vbUtleSIsIk5vdGlmaWNhdGlvblZvbHVtZSIsIm9uTm90aWZpY2F0aW9uVXBkYXRlIiwicGF5bG9hZCIsImFjdGlvbiIsInJvb21faWQiLCJzaG93X3Jvb21fdGlsZSIsInNldEltbWVkaWF0ZSIsInNjcm9sbEludG9WaWV3Iiwic2V0U3RhdGUiLCJtZXNzYWdlUHJldmlldyIsImdlbmVyYXRlUHJldmlldyIsInJvb21UaWxlUmVmIiwiY3VycmVudCIsImJsb2NrIiwiYmVoYXZpb3IiLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiZGlzIiwiZGlzcGF0Y2giLCJjbGVhcl9zZWFyY2giLCJrZXkiLCJLZXkiLCJFTlRFUiIsIlNQQUNFIiwiaXNBY3RpdmUiLCJzZWxlY3RlZCIsInRhcmdldCIsIm5vdGlmaWNhdGlvbnNNZW51UG9zaXRpb24iLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJnZW5lcmFsTWVudVBvc2l0aW9uIiwic2hvd0NvbnRleHRNZW51IiwiY2xpZW50WCIsImNsaWVudFkiLCJ0YWdJZCIsIkRlZmF1bHRUYWdJRCIsIkZhdm91cml0ZSIsIkxvd1ByaW9yaXR5IiwiaW52ZXJzZVRhZyIsImlzQXBwbGllZCIsIlJvb21MaXN0U3RvcmUiLCJpbnN0YW5jZSIsImdldFRhZ3NGb3JSb29tIiwiaW5jbHVkZXMiLCJyZW1vdmVUYWciLCJhZGRUYWciLCJSb29tTGlzdEFjdGlvbnMiLCJ0YWdSb29tIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwidW5kZWZpbmVkIiwiY29uc29sZSIsIndhcm4iLCJzYXZlTm90aWZTdGF0ZSIsIkFMTF9NRVNTQUdFUyIsIkFMTF9NRVNTQUdFU19MT1VEIiwiTUVOVElPTlNfT05MWSIsIk1VVEUiLCJzdGF0ZSIsIkFjdGl2ZVJvb21PYnNlcnZlciIsImFjdGl2ZVJvb21JZCIsImFkZExpc3RlbmVyIiwib25BY3RpdmVSb29tVXBkYXRlIiwiZGlzcGF0Y2hlclJlZiIsImRlZmF1bHREaXNwYXRjaGVyIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsIk1lc3NhZ2VQcmV2aWV3U3RvcmUiLCJvbiIsImdldFByZXZpZXdDaGFuZ2VkRXZlbnROYW1lIiwib25Sb29tUHJldmlld0NoYW5nZWQiLCJub3RpZmljYXRpb25TdGF0ZSIsIlJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIiwiZ2V0Um9vbVN0YXRlIiwiTk9USUZJQ0FUSU9OX1NUQVRFX1VQREFURSIsInJvb21Qcm9wcyIsIkVjaG9DaGFtYmVyIiwiZm9yUm9vbSIsIlBST1BFUlRZX1VQREFURUQiLCJvblJvb21Qcm9wZXJ0eVVwZGF0ZSIsIkNvbW11bml0eVByb3RvdHlwZVN0b3JlIiwiZ2V0VXBkYXRlRXZlbnROYW1lIiwib25Db21tdW5pdHlVcGRhdGUiLCJvblJvb21OYW1lVXBkYXRlIiwidGFnIiwiSW52aXRlIiwic2hvd01lc3NhZ2VQcmV2aWV3IiwiaXNNaW5pbWl6ZWQiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJwcmV2U3RhdGUiLCJvZmYiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwiZ2V0UHJldmlld0ZvclJvb20iLCJuZXdTdGF0ZSIsImlzR3Vlc3QiLCJub3RpZmljYXRpb25Wb2x1bWUiLCJyZW5kZXJOb3RpZmljYXRpb25zTWVudSIsIkFyY2hpdmVkIiwiY29udGV4dE1lbnUiLCJvbkNsb3NlTm90aWZpY2F0aW9uc01lbnUiLCJvbkNsaWNrQWxsTm90aWZzIiwib25DbGlja0FsZXJ0TWUiLCJvbkNsaWNrTWVudGlvbnMiLCJvbkNsaWNrTXV0ZSIsImNsYXNzZXMiLCJteF9Sb29tVGlsZV9pY29uQmVsbCIsIm14X1Jvb21UaWxlX2ljb25CZWxsRG90IiwibXhfUm9vbVRpbGVfaWNvbkJlbGxNZW50aW9ucyIsIm14X1Jvb21UaWxlX2ljb25CZWxsQ3Jvc3NlZCIsIm14X1Jvb21UaWxlX25vdGlmaWNhdGlvbnNCdXR0b25fc2hvdyIsIm9uTm90aWZpY2F0aW9uc01lbnVPcGVuQ2xpY2siLCJyZW5kZXJHZW5lcmFsTWVudSIsIm9uQ2xvc2VHZW5lcmFsTWVudSIsIm9uRm9yZ2V0Um9vbUNsaWNrIiwicm9vbVRhZ3MiLCJpc0Zhdm9yaXRlIiwiZmF2b3VyaXRlTGFiZWwiLCJpc0xvd1ByaW9yaXR5IiwibG93UHJpb3JpdHlMYWJlbCIsImUiLCJvblRhZ1Jvb20iLCJvbk9wZW5Sb29tU2V0dGluZ3MiLCJvbkxlYXZlUm9vbUNsaWNrIiwib25HZW5lcmFsTWVudU9wZW5DbGljayIsInJlbmRlciIsInJvb21Qcm9maWxlIiwiZGlzcGxheU5hbWUiLCJhdmF0YXJNeGMiLCJnZXRJbnZpdGVQcm9maWxlIiwibmFtZSIsInJlcGxhY2UiLCJyb29tQXZhdGFyIiwiYXZhdGFyVXJsIiwiYmFkZ2UiLCJuYW1lQ2xhc3NlcyIsImlzVW5yZWFkIiwibmFtZUNvbnRhaW5lciIsImFyaWFMYWJlbCIsImhhc01lbnRpb25zIiwiY291bnQiLCJoYXNVbnJlYWRDb3VudCIsImFyaWFEZXNjcmliZWRCeSIsIkJ1dHRvbiIsIkFjY2Vzc2libGVCdXR0b24iLCJBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiIsInRpdGxlIiwiZm9yY2VIaWRlIiwib25Gb2N1cyIsInJlZiIsIm9uVGlsZUNsaWNr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S25CO0FBQXRDLE9BQ0ssQ0FBQztBQUFDNEksTUFBQUEsT0FBRDtBQUFVOUgsTUFBQUEsUUFBVjtBQUFvQitILE1BQUFBO0FBQXBCLEtBQUQsa0JBQ0csNkJBQUMsTUFBRCw2QkFDUTdKLEtBRFI7QUFFSSxNQUFBLE9BQU8sRUFBRTRKLE9BRmI7QUFHSSxNQUFBLFFBQVEsRUFBRTlILFFBQVEsR0FBRyxDQUFILEdBQU8sQ0FBQyxDQUg5QjtBQUlJLE1BQUEsUUFBUSxFQUFFK0gsR0FKZDtBQUtJLE1BQUEsU0FBUyxFQUFFNUMsT0FMZjtBQU1JLE1BQUEsT0FBTyxFQUFFLEtBQUs2QyxXQU5sQjtBQU9JLE1BQUEsYUFBYSxFQUFFLEtBQUtDLGFBUHhCO0FBUUksTUFBQSxJQUFJLEVBQUMsVUFSVDtBQVNJLG9CQUFZYixTQVRoQjtBQVVJLHVCQUFlLEtBQUtuRixLQUFMLENBQVdoQyxRQVY5QjtBQVdJLDBCQUFrQnVIO0FBWHRCLFFBYUtWLFVBYkwsRUFjS0ssYUFkTCxFQWVLSCxLQWZMLEVBZ0JLLEtBQUt0QixpQkFBTCxFQWhCTCxFQWlCSyxLQUFLZix1QkFBTCxDQUE2QjNFLFFBQTdCLENBakJMLENBRlIsQ0FESixDQURKO0FBMkJIOztBQS9oQnFFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTggTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgeyBSb3ZpbmdUYWJJbmRleFdyYXBwZXIgfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9Sb3ZpbmdUYWJJbmRleFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBLZXkgfSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCBBY3RpdmVSb29tT2JzZXJ2ZXIgZnJvbSBcIi4uLy4uLy4uL0FjdGl2ZVJvb21PYnNlcnZlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBDaGV2cm9uRmFjZSwgQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uIH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7IERlZmF1bHRUYWdJRCwgVGFnSUQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9tb2RlbHNcIjtcbmltcG9ydCB7IE1lc3NhZ2VQcmV2aWV3U3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9NZXNzYWdlUHJldmlld1N0b3JlXCI7XG5pbXBvcnQgRGVjb3JhdGVkUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9EZWNvcmF0ZWRSb29tQXZhdGFyXCI7XG5pbXBvcnQgeyBBTExfTUVTU0FHRVMsIEFMTF9NRVNTQUdFU19MT1VELCBNRU5USU9OU19PTkxZLCBNVVRFIH0gZnJvbSBcIi4uLy4uLy4uL1Jvb21Ob3RpZnNcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBOb3RpZmljYXRpb25CYWRnZSBmcm9tIFwiLi9Ob3RpZmljYXRpb25CYWRnZVwiO1xuaW1wb3J0IHsgVm9sdW1lIH0gZnJvbSBcIi4uLy4uLy4uL1Jvb21Ob3RpZnNUeXBlc1wiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IFJvb21MaXN0QWN0aW9ucyBmcm9tIFwiLi4vLi4vLi4vYWN0aW9ucy9Sb29tTGlzdEFjdGlvbnNcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmVcIjtcbmltcG9ydCB7IE5PVElGSUNBVElPTl9TVEFURV9VUERBVEUsIE5vdGlmaWNhdGlvblN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL05vdGlmaWNhdGlvblN0YXRlXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgeyBFY2hvQ2hhbWJlciB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9FY2hvQ2hhbWJlclwiO1xuaW1wb3J0IHsgQ2FjaGVkUm9vbUtleSwgUm9vbUVjaG9DaGFtYmVyIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9sb2NhbC1lY2hvL1Jvb21FY2hvQ2hhbWJlclwiO1xuaW1wb3J0IHsgUFJPUEVSVFlfVVBEQVRFRCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9HZW5lcmljRWNob0NoYW1iZXJcIjtcbmltcG9ydCBJY29uaXplZENvbnRleHRNZW51LCB7XG4gICAgSWNvbml6ZWRDb250ZXh0TWVudUNoZWNrYm94LFxuICAgIEljb25pemVkQ29udGV4dE1lbnVPcHRpb24sXG4gICAgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QsXG4gICAgSWNvbml6ZWRDb250ZXh0TWVudVJhZGlvLFxufSBmcm9tIFwiLi4vY29udGV4dF9tZW51cy9JY29uaXplZENvbnRleHRNZW51XCI7XG5pbXBvcnQgeyBDb21tdW5pdHlQcm90b3R5cGVTdG9yZSwgSVJvb21Qcm9maWxlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Db21tdW5pdHlQcm90b3R5cGVTdG9yZVwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tOiBSb29tO1xuICAgIHNob3dNZXNzYWdlUHJldmlldzogYm9vbGVhbjtcbiAgICBpc01pbmltaXplZDogYm9vbGVhbjtcbiAgICB0YWc6IFRhZ0lEO1xufVxuXG50eXBlIFBhcnRpYWxET01SZWN0ID0gUGljazxET01SZWN0LCBcImxlZnRcIiB8IFwiYm90dG9tXCI+O1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzZWxlY3RlZDogYm9vbGVhbjtcbiAgICBub3RpZmljYXRpb25zTWVudVBvc2l0aW9uOiBQYXJ0aWFsRE9NUmVjdDtcbiAgICBnZW5lcmFsTWVudVBvc2l0aW9uOiBQYXJ0aWFsRE9NUmVjdDtcbiAgICBtZXNzYWdlUHJldmlldz86IHN0cmluZztcbn1cblxuY29uc3QgbWVzc2FnZVByZXZpZXdJZCA9IChyb29tSWQ6IHN0cmluZykgPT4gYG14X1Jvb21UaWxlX21lc3NhZ2VQcmV2aWV3XyR7cm9vbUlkfWA7XG5cbmNvbnN0IGNvbnRleHRNZW51QmVsb3cgPSAoZWxlbWVudFJlY3Q6IFBhcnRpYWxET01SZWN0KSA9PiB7XG4gICAgLy8gYWxpZ24gdGhlIGNvbnRleHQgbWVudSdzIGljb25zIHdpdGggdGhlIGljb24gd2hpY2ggb3BlbmVkIHRoZSBjb250ZXh0IG1lbnVcbiAgICBjb25zdCBsZWZ0ID0gZWxlbWVudFJlY3QubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldCAtIDk7XG4gICAgY29uc3QgdG9wID0gZWxlbWVudFJlY3QuYm90dG9tICsgd2luZG93LnBhZ2VZT2Zmc2V0ICsgMTc7XG4gICAgY29uc3QgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5Ob25lO1xuICAgIHJldHVybiB7bGVmdCwgdG9wLCBjaGV2cm9uRmFjZX07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tVGlsZSBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIHJvb21UaWxlUmVmID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgbm90aWZpY2F0aW9uU3RhdGU6IE5vdGlmaWNhdGlvblN0YXRlO1xuICAgIHByaXZhdGUgcm9vbVByb3BzOiBSb29tRWNob0NoYW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2VsZWN0ZWQ6IEFjdGl2ZVJvb21PYnNlcnZlci5hY3RpdmVSb29tSWQgPT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgICAgICBub3RpZmljYXRpb25zTWVudVBvc2l0aW9uOiBudWxsLFxuICAgICAgICAgICAgZ2VuZXJhbE1lbnVQb3NpdGlvbjogbnVsbCxcblxuICAgICAgICAgICAgLy8gZ2VuZXJhdGVQcmV2aWV3KCkgd2lsbCByZXR1cm4gbm90aGluZyBpZiB0aGUgdXNlciBoYXMgcHJldmlld3MgZGlzYWJsZWRcbiAgICAgICAgICAgIG1lc3NhZ2VQcmV2aWV3OiB0aGlzLmdlbmVyYXRlUHJldmlldygpLFxuICAgICAgICB9O1xuXG4gICAgICAgIEFjdGl2ZVJvb21PYnNlcnZlci5hZGRMaXN0ZW5lcih0aGlzLnByb3BzLnJvb20ucm9vbUlkLCB0aGlzLm9uQWN0aXZlUm9vbVVwZGF0ZSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRlZmF1bHREaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICBNZXNzYWdlUHJldmlld1N0b3JlLmluc3RhbmNlLm9uKFxuICAgICAgICAgICAgTWVzc2FnZVByZXZpZXdTdG9yZS5nZXRQcmV2aWV3Q2hhbmdlZEV2ZW50TmFtZSh0aGlzLnByb3BzLnJvb20pLFxuICAgICAgICAgICAgdGhpcy5vblJvb21QcmV2aWV3Q2hhbmdlZCxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25TdGF0ZSA9IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLmdldFJvb21TdGF0ZSh0aGlzLnByb3BzLnJvb20pO1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvblN0YXRlLm9uKE5PVElGSUNBVElPTl9TVEFURV9VUERBVEUsIHRoaXMub25Ob3RpZmljYXRpb25VcGRhdGUpO1xuICAgICAgICB0aGlzLnJvb21Qcm9wcyA9IEVjaG9DaGFtYmVyLmZvclJvb20odGhpcy5wcm9wcy5yb29tKTtcbiAgICAgICAgdGhpcy5yb29tUHJvcHMub24oUFJPUEVSVFlfVVBEQVRFRCwgdGhpcy5vblJvb21Qcm9wZXJ0eVVwZGF0ZSk7XG4gICAgICAgIENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLm9uKFxuICAgICAgICAgICAgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuZ2V0VXBkYXRlRXZlbnROYW1lKHRoaXMucHJvcHMucm9vbS5yb29tSWQpLFxuICAgICAgICAgICAgdGhpcy5vbkNvbW11bml0eVVwZGF0ZSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5wcm9wcy5yb29tLm9uKFwiUm9vbS5uYW1lXCIsIHRoaXMub25Sb29tTmFtZVVwZGF0ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJvb21OYW1lVXBkYXRlID0gKHJvb20pID0+IHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Ob3RpZmljYXRpb25VcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gbm90aWZpY2F0aW9uIHN0YXRlIGNoYW5nZWQgLSB1cGRhdGVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21Qcm9wZXJ0eVVwZGF0ZSA9IChwcm9wZXJ0eTogQ2FjaGVkUm9vbUtleSkgPT4ge1xuICAgICAgICBpZiAocHJvcGVydHkgPT09IENhY2hlZFJvb21LZXkuTm90aWZpY2F0aW9uVm9sdW1lKSB0aGlzLm9uTm90aWZpY2F0aW9uVXBkYXRlKCk7XG4gICAgICAgIC8vIGVsc2UgaWdub3JlIC0gbm90IGltcG9ydGFudCBmb3IgdGhpcyB0aWxlXG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0IHNob3dDb250ZXh0TWVudSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMudGFnICE9PSBEZWZhdWx0VGFnSUQuSW52aXRlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IHNob3dNZXNzYWdlUHJldmlldygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLnByb3BzLmlzTWluaW1pemVkICYmIHRoaXMucHJvcHMuc2hvd01lc3NhZ2VQcmV2aWV3O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBSZWFkb25seTxJUHJvcHM+LCBwcmV2U3RhdGU6IFJlYWRvbmx5PElTdGF0ZT4pIHtcbiAgICAgICAgaWYgKHByZXZQcm9wcy5zaG93TWVzc2FnZVByZXZpZXcgIT09IHRoaXMucHJvcHMuc2hvd01lc3NhZ2VQcmV2aWV3ICYmIHRoaXMuc2hvd01lc3NhZ2VQcmV2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZXNzYWdlUHJldmlldzogdGhpcy5nZW5lcmF0ZVByZXZpZXcoKX0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmV2UHJvcHMucm9vbT8ucm9vbUlkICE9PSB0aGlzLnByb3BzLnJvb20/LnJvb21JZCkge1xuICAgICAgICAgICAgTWVzc2FnZVByZXZpZXdTdG9yZS5pbnN0YW5jZS5vZmYoXG4gICAgICAgICAgICAgICAgTWVzc2FnZVByZXZpZXdTdG9yZS5nZXRQcmV2aWV3Q2hhbmdlZEV2ZW50TmFtZShwcmV2UHJvcHMucm9vbSksXG4gICAgICAgICAgICAgICAgdGhpcy5vblJvb21QcmV2aWV3Q2hhbmdlZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBNZXNzYWdlUHJldmlld1N0b3JlLmluc3RhbmNlLm9uKFxuICAgICAgICAgICAgICAgIE1lc3NhZ2VQcmV2aWV3U3RvcmUuZ2V0UHJldmlld0NoYW5nZWRFdmVudE5hbWUodGhpcy5wcm9wcy5yb29tKSxcbiAgICAgICAgICAgICAgICB0aGlzLm9uUm9vbVByZXZpZXdDaGFuZ2VkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLm9mZihcbiAgICAgICAgICAgICAgICBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5nZXRVcGRhdGVFdmVudE5hbWUocHJldlByb3BzLnJvb20/LnJvb21JZCksXG4gICAgICAgICAgICAgICAgdGhpcy5vbkNvbW11bml0eVVwZGF0ZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5vbihcbiAgICAgICAgICAgICAgICBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5nZXRVcGRhdGVFdmVudE5hbWUodGhpcy5wcm9wcy5yb29tPy5yb29tSWQpLFxuICAgICAgICAgICAgICAgIHRoaXMub25Db21tdW5pdHlVcGRhdGUsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcHJldlByb3BzLnJvb20/Lm9mZihcIlJvb20ubmFtZVwiLCB0aGlzLm9uUm9vbU5hbWVVcGRhdGUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yb29tPy5vbihcIlJvb20ubmFtZVwiLCB0aGlzLm9uUm9vbU5hbWVVcGRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAvLyB3aGVuIHdlJ3JlIGZpcnN0IHJlbmRlcmVkIChvciBvdXIgc3VibGlzdCBpcyBleHBhbmRlZCkgbWFrZSBzdXJlIHdlIGFyZSB2aXNpYmxlIGlmIHdlJ3JlIGFjdGl2ZVxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yb29tKSB7XG4gICAgICAgICAgICBBY3RpdmVSb29tT2JzZXJ2ZXIucmVtb3ZlTGlzdGVuZXIodGhpcy5wcm9wcy5yb29tLnJvb21JZCwgdGhpcy5vbkFjdGl2ZVJvb21VcGRhdGUpO1xuICAgICAgICAgICAgTWVzc2FnZVByZXZpZXdTdG9yZS5pbnN0YW5jZS5vZmYoXG4gICAgICAgICAgICAgICAgTWVzc2FnZVByZXZpZXdTdG9yZS5nZXRQcmV2aWV3Q2hhbmdlZEV2ZW50TmFtZSh0aGlzLnByb3BzLnJvb20pLFxuICAgICAgICAgICAgICAgIHRoaXMub25Sb29tUHJldmlld0NoYW5nZWQsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2Uub2ZmKFxuICAgICAgICAgICAgICAgIENvbW11bml0eVByb3RvdHlwZVN0b3JlLmdldFVwZGF0ZUV2ZW50TmFtZSh0aGlzLnByb3BzLnJvb20ucm9vbUlkKSxcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ29tbXVuaXR5VXBkYXRlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbS5vZmYoXCJSb29tLm5hbWVcIiwgdGhpcy5vblJvb21OYW1lVXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9uU3RhdGUub2ZmKE5PVElGSUNBVElPTl9TVEFURV9VUERBVEUsIHRoaXMub25Ob3RpZmljYXRpb25VcGRhdGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09IFwidmlld19yb29tXCIgJiYgcGF5bG9hZC5yb29tX2lkID09PSB0aGlzLnByb3BzLnJvb20ucm9vbUlkICYmIHBheWxvYWQuc2hvd19yb29tX3RpbGUpIHtcbiAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbW11bml0eVVwZGF0ZSA9IChyb29tSWQ6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAocm9vbUlkICE9PSB0aGlzLnByb3BzLnJvb20ucm9vbUlkKSByZXR1cm47XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gd2UgZG9uJ3QgaGF2ZSBhbnl0aGluZyB0byBhY3R1YWxseSB1cGRhdGVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21QcmV2aWV3Q2hhbmdlZCA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJvb20gJiYgcm9vbS5yb29tSWQgPT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQpIHtcbiAgICAgICAgICAgIC8vIGdlbmVyYXRlUHJldmlldygpIHdpbGwgcmV0dXJuIG5vdGhpbmcgaWYgdGhlIHVzZXIgaGFzIHByZXZpZXdzIGRpc2FibGVkXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZXNzYWdlUHJldmlldzogdGhpcy5nZW5lcmF0ZVByZXZpZXcoKX0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2VuZXJhdGVQcmV2aWV3KCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBpZiAoIXRoaXMuc2hvd01lc3NhZ2VQcmV2aWV3KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBNZXNzYWdlUHJldmlld1N0b3JlLmluc3RhbmNlLmdldFByZXZpZXdGb3JSb29tKHRoaXMucHJvcHMucm9vbSwgdGhpcy5wcm9wcy50YWcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2Nyb2xsSW50b1ZpZXcgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5yb29tVGlsZVJlZi5jdXJyZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMucm9vbVRpbGVSZWYuY3VycmVudC5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgICAgICBibG9jazogXCJuZWFyZXN0XCIsXG4gICAgICAgICAgICBiZWhhdmlvcjogXCJhdXRvXCIsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVGlsZUNsaWNrID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgIHNob3dfcm9vbV90aWxlOiB0cnVlLCAvLyBtYWtlIHN1cmUgdGhlIHJvb20gaXMgdmlzaWJsZSBpbiB0aGUgbGlzdFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy5yb29tLnJvb21JZCxcbiAgICAgICAgICAgIGNsZWFyX3NlYXJjaDogKGV2ICYmIChldi5rZXkgPT09IEtleS5FTlRFUiB8fCBldi5rZXkgPT09IEtleS5TUEFDRSkpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFjdGl2ZVJvb21VcGRhdGUgPSAoaXNBY3RpdmU6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWQ6IGlzQWN0aXZlfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Ob3RpZmljYXRpb25zTWVudU9wZW5DbGljayA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXYudGFyZ2V0IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtub3RpZmljYXRpb25zTWVudVBvc2l0aW9uOiB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCl9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNsb3NlTm90aWZpY2F0aW9uc01lbnUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe25vdGlmaWNhdGlvbnNNZW51UG9zaXRpb246IG51bGx9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkdlbmVyYWxNZW51T3BlbkNsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldi50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2dlbmVyYWxNZW51UG9zaXRpb246IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udGV4dE1lbnUgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIGNvbnRleHQgbWVudSB0byBzaG93LCBpZ25vcmUgdGhlIGFjdGlvbi5cbiAgICAgICAgaWYgKCF0aGlzLnNob3dDb250ZXh0TWVudSkgcmV0dXJuO1xuXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdlbmVyYWxNZW51UG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBldi5jbGllbnRYLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogZXYuY2xpZW50WSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xvc2VHZW5lcmFsTWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z2VuZXJhbE1lbnVQb3NpdGlvbjogbnVsbH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVGFnUm9vbSA9IChldjogQnV0dG9uRXZlbnQsIHRhZ0lkOiBUYWdJRCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBpZiAodGFnSWQgPT09IERlZmF1bHRUYWdJRC5GYXZvdXJpdGUgfHwgdGFnSWQgPT09IERlZmF1bHRUYWdJRC5Mb3dQcmlvcml0eSkge1xuICAgICAgICAgICAgY29uc3QgaW52ZXJzZVRhZyA9IHRhZ0lkID09PSBEZWZhdWx0VGFnSUQuRmF2b3VyaXRlID8gRGVmYXVsdFRhZ0lELkxvd1ByaW9yaXR5IDogRGVmYXVsdFRhZ0lELkZhdm91cml0ZTtcbiAgICAgICAgICAgIGNvbnN0IGlzQXBwbGllZCA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0VGFnc0ZvclJvb20odGhpcy5wcm9wcy5yb29tKS5pbmNsdWRlcyh0YWdJZCk7XG4gICAgICAgICAgICBjb25zdCByZW1vdmVUYWcgPSBpc0FwcGxpZWQgPyB0YWdJZCA6IGludmVyc2VUYWc7XG4gICAgICAgICAgICBjb25zdCBhZGRUYWcgPSBpc0FwcGxpZWQgPyBudWxsIDogdGFnSWQ7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goUm9vbUxpc3RBY3Rpb25zLnRhZ1Jvb20oXG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbSxcbiAgICAgICAgICAgICAgICByZW1vdmVUYWcsXG4gICAgICAgICAgICAgICAgYWRkVGFnLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuZXhwZWN0ZWQgdGFnICR7dGFnSWR9IGFwcGxpZWQgdG8gJHt0aGlzLnByb3BzLnJvb20ucm9vbV9pZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoZXYgYXMgUmVhY3QuS2V5Ym9hcmRFdmVudCkua2V5ID09PSBLZXkuRU5URVIpIHtcbiAgICAgICAgICAgIC8vIEltcGxlbWVudHMgaHR0cHM6Ly93d3cudzMub3JnL1RSL3dhaS1hcmlhLXByYWN0aWNlcy8ja2V5Ym9hcmQtaW50ZXJhY3Rpb24tMTJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2dlbmVyYWxNZW51UG9zaXRpb246IG51bGx9KTsgLy8gaGlkZSB0aGUgbWVudVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25MZWF2ZVJvb21DbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2xlYXZlX3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy5yb29tLnJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2dlbmVyYWxNZW51UG9zaXRpb246IG51bGx9KTsgLy8gaGlkZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9yZ2V0Um9vbUNsaWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnZm9yZ2V0X3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy5yb29tLnJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2dlbmVyYWxNZW51UG9zaXRpb246IG51bGx9KTsgLy8gaGlkZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uT3BlblJvb21TZXR0aW5ncyA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ29wZW5fcm9vbV9zZXR0aW5ncycsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnByb3BzLnJvb20ucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z2VuZXJhbE1lbnVQb3NpdGlvbjogbnVsbH0pOyAvLyBoaWRlIHRoZSBtZW51XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXN5bmMgc2F2ZU5vdGlmU3RhdGUoZXY6IEJ1dHRvbkV2ZW50LCBuZXdTdGF0ZTogVm9sdW1lKSB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucm9vbVByb3BzLm5vdGlmaWNhdGlvblZvbHVtZSA9IG5ld1N0YXRlO1xuXG4gICAgICAgIGNvbnN0IGtleSA9IChldiBhcyBSZWFjdC5LZXlib2FyZEV2ZW50KS5rZXk7XG4gICAgICAgIGlmIChrZXkgPT09IEtleS5FTlRFUikge1xuICAgICAgICAgICAgLy8gSW1wbGVtZW50cyBodHRwczovL3d3dy53My5vcmcvVFIvd2FpLWFyaWEtcHJhY3RpY2VzLyNrZXlib2FyZC1pbnRlcmFjdGlvbi0xMlxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bm90aWZpY2F0aW9uc01lbnVQb3NpdGlvbjogbnVsbH0pOyAvLyBoaWRlIHRoZSBtZW51XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2xpY2tBbGxOb3RpZnMgPSBldiA9PiB0aGlzLnNhdmVOb3RpZlN0YXRlKGV2LCBBTExfTUVTU0FHRVMpO1xuICAgIHByaXZhdGUgb25DbGlja0FsZXJ0TWUgPSBldiA9PiB0aGlzLnNhdmVOb3RpZlN0YXRlKGV2LCBBTExfTUVTU0FHRVNfTE9VRCk7XG4gICAgcHJpdmF0ZSBvbkNsaWNrTWVudGlvbnMgPSBldiA9PiB0aGlzLnNhdmVOb3RpZlN0YXRlKGV2LCBNRU5USU9OU19PTkxZKTtcbiAgICBwcml2YXRlIG9uQ2xpY2tNdXRlID0gZXYgPT4gdGhpcy5zYXZlTm90aWZTdGF0ZShldiwgTVVURSk7XG5cbiAgICBwcml2YXRlIHJlbmRlck5vdGlmaWNhdGlvbnNNZW51KGlzQWN0aXZlOiBib29sZWFuKTogUmVhY3QuUmVhY3RFbGVtZW50IHtcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkgfHwgdGhpcy5wcm9wcy50YWcgPT09IERlZmF1bHRUYWdJRC5BcmNoaXZlZCB8fFxuICAgICAgICAgICAgIXRoaXMuc2hvd0NvbnRleHRNZW51IHx8IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWRcbiAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyB0aGUgbWVudSBtYWtlcyBubyBzZW5zZSBpbiB0aGVzZSBjYXNlcyBzbyBkbyBub3Qgc2hvdyBvbmVcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLnJvb21Qcm9wcy5ub3RpZmljYXRpb25Wb2x1bWU7XG5cbiAgICAgICAgbGV0IGNvbnRleHRNZW51ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubm90aWZpY2F0aW9uc01lbnVQb3NpdGlvbikge1xuICAgICAgICAgICAgY29udGV4dE1lbnUgPSA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgIHsuLi5jb250ZXh0TWVudUJlbG93KHRoaXMuc3RhdGUubm90aWZpY2F0aW9uc01lbnVQb3NpdGlvbil9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNsb3NlTm90aWZpY2F0aW9uc01lbnV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfY29udGV4dE1lbnVcIlxuICAgICAgICAgICAgICAgIGNvbXBhY3RcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgZmlyc3Q+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51UmFkaW9cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlVzZSBkZWZhdWx0XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlPXtzdGF0ZSA9PT0gQUxMX01FU1NBR0VTfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25CZWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DbGlja0FsbE5vdGlmc31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVSYWRpb1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiQWxsIG1lc3NhZ2VzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlPXtzdGF0ZSA9PT0gQUxMX01FU1NBR0VTX0xPVUR9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvbkJlbGxEb3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrQWxlcnRNZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVSYWRpb1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTWVudGlvbnMgJiBLZXl3b3Jkc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZT17c3RhdGUgPT09IE1FTlRJT05TX09OTFl9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvbkJlbGxNZW50aW9uc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2tNZW50aW9uc31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVSYWRpb1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTm9uZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZT17c3RhdGUgPT09IE1VVEV9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvbkJlbGxDcm9zc2VkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DbGlja011dGV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudT47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1Jvb21UaWxlX25vdGlmaWNhdGlvbnNCdXR0b25cIiwge1xuICAgICAgICAgICAgLy8gU2hvdyBiZWxsIGljb24gZm9yIHRoZSBkZWZhdWx0IGNhc2UgdG9vLlxuICAgICAgICAgICAgbXhfUm9vbVRpbGVfaWNvbkJlbGw6IHN0YXRlID09PSBBTExfTUVTU0FHRVMsXG4gICAgICAgICAgICBteF9Sb29tVGlsZV9pY29uQmVsbERvdDogc3RhdGUgPT09IEFMTF9NRVNTQUdFU19MT1VELFxuICAgICAgICAgICAgbXhfUm9vbVRpbGVfaWNvbkJlbGxNZW50aW9uczogc3RhdGUgPT09IE1FTlRJT05TX09OTFksXG4gICAgICAgICAgICBteF9Sb29tVGlsZV9pY29uQmVsbENyb3NzZWQ6IHN0YXRlID09PSBNVVRFLFxuXG4gICAgICAgICAgICAvLyBPbmx5IHNob3cgdGhlIGljb24gYnkgZGVmYXVsdCBpZiB0aGUgcm9vbSBpcyBvdmVycmlkZGVuIHRvIG11dGVkLlxuICAgICAgICAgICAgLy8gVE9ETzogW0ZUVUUgTm90aWZpY2F0aW9uc10gUHJvYmFibHkgbmVlZCB0byBkZXRlY3QgZ2xvYmFsIG11dGUgc3RhdGVcbiAgICAgICAgICAgIG14X1Jvb21UaWxlX25vdGlmaWNhdGlvbnNCdXR0b25fc2hvdzogc3RhdGUgPT09IE1VVEUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPENvbnRleHRNZW51VG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Ob3RpZmljYXRpb25zTWVudU9wZW5DbGlja31cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiTm90aWZpY2F0aW9uIG9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9eyEhdGhpcy5zdGF0ZS5ub3RpZmljYXRpb25zTWVudVBvc2l0aW9ufVxuICAgICAgICAgICAgICAgICAgICB0YWJJbmRleD17aXNBY3RpdmUgPyAwIDogLTF9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7Y29udGV4dE1lbnV9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyR2VuZXJhbE1lbnUoKTogUmVhY3QuUmVhY3RFbGVtZW50IHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3dDb250ZXh0TWVudSkgcmV0dXJuIG51bGw7IC8vIG5vIG1lbnUgdG8gc2hvd1xuXG4gICAgICAgIGxldCBjb250ZXh0TWVudSA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmdlbmVyYWxNZW51UG9zaXRpb24gJiYgdGhpcy5wcm9wcy50YWcgPT09IERlZmF1bHRUYWdJRC5BcmNoaXZlZCkge1xuICAgICAgICAgICAgY29udGV4dE1lbnUgPSA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgIHsuLi5jb250ZXh0TWVudUJlbG93KHRoaXMuc3RhdGUuZ2VuZXJhbE1lbnVQb3NpdGlvbil9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNsb3NlR2VuZXJhbE1lbnV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfY29udGV4dE1lbnVcIlxuICAgICAgICAgICAgICAgIGNvbXBhY3RcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgcmVkPlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25TaWduT3V0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkZvcmdldCBSb29tXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkZvcmdldFJvb21DbGlja31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51PjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmdlbmVyYWxNZW51UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21UYWdzID0gUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5nZXRUYWdzRm9yUm9vbSh0aGlzLnByb3BzLnJvb20pO1xuXG4gICAgICAgICAgICBjb25zdCBpc0Zhdm9yaXRlID0gcm9vbVRhZ3MuaW5jbHVkZXMoRGVmYXVsdFRhZ0lELkZhdm91cml0ZSk7XG4gICAgICAgICAgICBjb25zdCBmYXZvdXJpdGVMYWJlbCA9IGlzRmF2b3JpdGUgPyBfdChcIkZhdm91cml0ZWRcIikgOiBfdChcIkZhdm91cml0ZVwiKTtcblxuICAgICAgICAgICAgY29uc3QgaXNMb3dQcmlvcml0eSA9IHJvb21UYWdzLmluY2x1ZGVzKERlZmF1bHRUYWdJRC5Mb3dQcmlvcml0eSk7XG4gICAgICAgICAgICBjb25zdCBsb3dQcmlvcml0eUxhYmVsID0gX3QoXCJMb3cgUHJpb3JpdHlcIik7XG5cbiAgICAgICAgICAgIGNvbnRleHRNZW51ID0gPEljb25pemVkQ29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICB7Li4uY29udGV4dE1lbnVCZWxvdyh0aGlzLnN0YXRlLmdlbmVyYWxNZW51UG9zaXRpb24pfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25DbG9zZUdlbmVyYWxNZW51fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2NvbnRleHRNZW51XCJcbiAgICAgICAgICAgICAgICBjb21wYWN0XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudUNoZWNrYm94XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gdGhpcy5vblRhZ1Jvb20oZSwgRGVmYXVsdFRhZ0lELkZhdm91cml0ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU9e2lzRmF2b3JpdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17ZmF2b3VyaXRlTGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvblN0YXJcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudUNoZWNrYm94XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gdGhpcy5vblRhZ1Jvb20oZSwgRGVmYXVsdFRhZ0lELkxvd1ByaW9yaXR5KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZT17aXNMb3dQcmlvcml0eX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtsb3dQcmlvcml0eUxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25BcnJvd0Rvd25cIlxuICAgICAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uT3BlblJvb21TZXR0aW5nc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25TZXR0aW5nc1wiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgcmVkPlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkxlYXZlUm9vbUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTGVhdmUgUm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tVGlsZV9pY29uU2lnbk91dFwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudT47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxDb250ZXh0TWVudVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfbWVudUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25HZW5lcmFsTWVudU9wZW5DbGlja31cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiUm9vbSBvcHRpb25zXCIpfVxuICAgICAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXshIXRoaXMuc3RhdGUuZ2VuZXJhbE1lbnVQb3NpdGlvbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHtjb250ZXh0TWVudX1cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAnbXhfUm9vbVRpbGUnOiB0cnVlLFxuICAgICAgICAgICAgJ214X1Jvb21UaWxlX3NlbGVjdGVkJzogdGhpcy5zdGF0ZS5zZWxlY3RlZCxcbiAgICAgICAgICAgICdteF9Sb29tVGlsZV9oYXNNZW51T3Blbic6ICEhKHRoaXMuc3RhdGUuZ2VuZXJhbE1lbnVQb3NpdGlvbiB8fCB0aGlzLnN0YXRlLm5vdGlmaWNhdGlvbnNNZW51UG9zaXRpb24pLFxuICAgICAgICAgICAgJ214X1Jvb21UaWxlX21pbmltaXplZCc6IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCByb29tUHJvZmlsZTogSVJvb21Qcm9maWxlID0ge2Rpc3BsYXlOYW1lOiBudWxsLCBhdmF0YXJNeGM6IG51bGx9O1xuICAgICAgICBpZiAodGhpcy5wcm9wcy50YWcgPT09IERlZmF1bHRUYWdJRC5JbnZpdGUpIHtcbiAgICAgICAgICAgIHJvb21Qcm9maWxlID0gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0SW52aXRlUHJvZmlsZSh0aGlzLnByb3BzLnJvb20ucm9vbUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuYW1lID0gcm9vbVByb2ZpbGUuZGlzcGxheU5hbWUgfHwgdGhpcy5wcm9wcy5yb29tLm5hbWU7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIG5hbWUgPSAnJztcbiAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZShcIjpcIiwgXCI6XFx1MjAwYlwiKTsgLy8gYWRkIGEgemVyby13aWR0aCBzcGFjZSB0byBhbGxvdyBsaW5ld3JhcHBpbmcgYWZ0ZXIgdGhlIGNvbG9uXG5cbiAgICAgICAgY29uc3Qgcm9vbUF2YXRhciA9IDxEZWNvcmF0ZWRSb29tQXZhdGFyXG4gICAgICAgICAgICByb29tPXt0aGlzLnByb3BzLnJvb219XG4gICAgICAgICAgICBhdmF0YXJTaXplPXszMn1cbiAgICAgICAgICAgIHRhZz17dGhpcy5wcm9wcy50YWd9XG4gICAgICAgICAgICBkaXNwbGF5QmFkZ2U9e3RoaXMucHJvcHMuaXNNaW5pbWl6ZWR9XG4gICAgICAgICAgICBvb2JEYXRhPXsoe2F2YXRhclVybDogcm9vbVByb2ZpbGUuYXZhdGFyTXhjfSl9XG4gICAgICAgIC8+O1xuXG4gICAgICAgIGxldCBiYWRnZTogUmVhY3QuUmVhY3ROb2RlO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIHtcbiAgICAgICAgICAgIC8vIGFyaWEtaGlkZGVuIGJlY2F1c2Ugd2Ugc3VtbWFyaXNlIHRoZSB1bnJlYWQgY291bnQvaGlnaGxpZ2h0IHN0YXR1cyBpbiBhIG1hbnVhbCBhcmlhLWxhYmVsIGJlbG93XG4gICAgICAgICAgICBiYWRnZSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2JhZGdlQ29udGFpbmVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxOb3RpZmljYXRpb25CYWRnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uPXt0aGlzLm5vdGlmaWNhdGlvblN0YXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VDb3VudD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tSWQ9e3RoaXMucHJvcHMucm9vbS5yb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1lc3NhZ2VQcmV2aWV3ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc2hvd01lc3NhZ2VQcmV2aWV3ICYmIHRoaXMuc3RhdGUubWVzc2FnZVByZXZpZXcpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VQcmV2aWV3ID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfbWVzc2FnZVByZXZpZXdcIiBpZD17bWVzc2FnZVByZXZpZXdJZCh0aGlzLnByb3BzLnJvb20ucm9vbUlkKX0+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLm1lc3NhZ2VQcmV2aWV3fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWVDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBcIm14X1Jvb21UaWxlX25hbWVcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibXhfUm9vbVRpbGVfbmFtZVdpdGhQcmV2aWV3XCI6ICEhbWVzc2FnZVByZXZpZXcsXG4gICAgICAgICAgICBcIm14X1Jvb21UaWxlX25hbWVIYXNVbnJlYWRFdmVudHNcIjogdGhpcy5ub3RpZmljYXRpb25TdGF0ZS5pc1VucmVhZCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IG5hbWVDb250YWluZXIgPSAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX25hbWVDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IHRpdGxlPXtuYW1lfSBjbGFzc05hbWU9e25hbWVDbGFzc2VzfSB0YWJJbmRleD17LTF9IGRpcj1cImF1dG9cIj5cbiAgICAgICAgICAgICAgICAgICAge25hbWV9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge21lc3NhZ2VQcmV2aWV3fVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlzTWluaW1pemVkKSBuYW1lQ29udGFpbmVyID0gbnVsbDtcblxuICAgICAgICBsZXQgYXJpYUxhYmVsID0gbmFtZTtcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBsYWJlbHMgYXJlIHdyaXR0ZW4gaW4gc3VjaCBhIGZhc2hpb24gdG8gaW5jcmVhc2Ugc2NyZWVuIHJlYWRlciBlZmZpY2llbmN5IChzcGVlZCkuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnRhZyA9PT0gRGVmYXVsdFRhZ0lELkludml0ZSkge1xuICAgICAgICAgICAgLy8gYXBwZW5kIG5vdGhpbmdcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm5vdGlmaWNhdGlvblN0YXRlLmhhc01lbnRpb25zKSB7XG4gICAgICAgICAgICBhcmlhTGFiZWwgKz0gXCIgXCIgKyBfdChcIiUoY291bnQpcyB1bnJlYWQgbWVzc2FnZXMgaW5jbHVkaW5nIG1lbnRpb25zLlwiLCB7XG4gICAgICAgICAgICAgICAgY291bnQ6IHRoaXMubm90aWZpY2F0aW9uU3RhdGUuY291bnQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm5vdGlmaWNhdGlvblN0YXRlLmhhc1VucmVhZENvdW50KSB7XG4gICAgICAgICAgICBhcmlhTGFiZWwgKz0gXCIgXCIgKyBfdChcIiUoY291bnQpcyB1bnJlYWQgbWVzc2FnZXMuXCIsIHtcbiAgICAgICAgICAgICAgICBjb3VudDogdGhpcy5ub3RpZmljYXRpb25TdGF0ZS5jb3VudCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubm90aWZpY2F0aW9uU3RhdGUuaXNVbnJlYWQpIHtcbiAgICAgICAgICAgIGFyaWFMYWJlbCArPSBcIiBcIiArIF90KFwiVW5yZWFkIG1lc3NhZ2VzLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhcmlhRGVzY3JpYmVkQnk6IHN0cmluZztcbiAgICAgICAgaWYgKHRoaXMuc2hvd01lc3NhZ2VQcmV2aWV3KSB7XG4gICAgICAgICAgICBhcmlhRGVzY3JpYmVkQnkgPSBtZXNzYWdlUHJldmlld0lkKHRoaXMucHJvcHMucm9vbS5yb29tSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvcHM6IFBhcnRpYWw8UmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEFjY2Vzc2libGVUb29sdGlwQnV0dG9uPj4gPSB7fTtcbiAgICAgICAgbGV0IEJ1dHRvbjogUmVhY3QuQ29tcG9uZW50VHlwZTxSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQWNjZXNzaWJsZUJ1dHRvbj4+ID0gQWNjZXNzaWJsZUJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIHtcbiAgICAgICAgICAgIEJ1dHRvbiA9IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uO1xuICAgICAgICAgICAgcHJvcHMudGl0bGUgPSBuYW1lO1xuICAgICAgICAgICAgLy8gZm9yY2UgdGhlIHRvb2x0aXAgdG8gaGlkZSB3aGlsc3Qgd2UgYXJlIHNob3dpbmcgdGhlIGNvbnRleHQgbWVudVxuICAgICAgICAgICAgcHJvcHMuZm9yY2VIaWRlID0gISF0aGlzLnN0YXRlLmdlbmVyYWxNZW51UG9zaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxSb3ZpbmdUYWJJbmRleFdyYXBwZXIgaW5wdXRSZWY9e3RoaXMucm9vbVRpbGVSZWZ9PlxuICAgICAgICAgICAgICAgICAgICB7KHtvbkZvY3VzLCBpc0FjdGl2ZSwgcmVmfSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2N1cz17b25Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJJbmRleD17aXNBY3RpdmUgPyAwIDogLTF9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRSZWY9e3JlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblRpbGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cInRyZWVpdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17dGhpcy5zdGF0ZS5zZWxlY3RlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWRlc2NyaWJlZGJ5PXthcmlhRGVzY3JpYmVkQnl9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvb21BdmF0YXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge25hbWVDb250YWluZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2JhZGdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlckdlbmVyYWxNZW51KCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyTm90aWZpY2F0aW9uc01lbnUoaXNBY3RpdmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L1JvdmluZ1RhYkluZGV4V3JhcHBlcj5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
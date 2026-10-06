"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _languageHandler = require("../../../languageHandler");

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _RoomListStore = _interopRequireWildcard(require("../../../stores/room-list/RoomListStore"));

var _RoomViewStore = _interopRequireDefault(require("../../../stores/RoomViewStore"));

var _models = require("../../../stores/room-list/models");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RoomSublist = _interopRequireDefault(require("./RoomSublist"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _GroupAvatar = _interopRequireDefault(require("../avatars/GroupAvatar"));

var _ExtraTile = _interopRequireDefault(require("./ExtraTile"));

var _StaticNotificationState = require("../../../stores/notifications/StaticNotificationState");

var _actions = require("../../../dispatcher/actions");

var _RoomNotificationStateStore = require("../../../stores/notifications/RoomNotificationStateStore");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _CustomRoomTagStore = _interopRequireDefault(require("../../../stores/CustomRoomTagStore"));

var _arrays = require("../../../utils/arrays");

var _objects = require("../../../utils/objects");

var _IconizedContextMenu = require("../context_menus/IconizedContextMenu");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _CommunityPrototypeStore = require("../../../stores/CommunityPrototypeStore");

var _CallHandler = _interopRequireDefault(require("../../../CallHandler"));

var _SpaceStore = _interopRequireWildcard(require("../../../stores/SpaceStore"));

var _space = require("../../../utils/space");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _dec, _class, _temp;

const TAG_ORDER
/*: TagID[]*/
= [_models.DefaultTagID.Invite, _models.DefaultTagID.Favourite, _models.DefaultTagID.DM, _models.DefaultTagID.Untagged, // -- Custom Tags Placeholder --
_models.DefaultTagID.LowPriority, _models.DefaultTagID.ServerNotice, _models.DefaultTagID.Suggested, _models.DefaultTagID.Archived];
const CUSTOM_TAGS_BEFORE_TAG = _models.DefaultTagID.LowPriority;
const ALWAYS_VISIBLE_TAGS
/*: TagID[]*/
= [_models.DefaultTagID.DM, _models.DefaultTagID.Untagged];

// If we have no dialer support, we just show the create chat dialog
const dmOnAddRoom = (dispatcher
/*: Dispatcher<ActionPayload>*/
) => {
  (dispatcher || _dispatcher.default).dispatch({
    action: 'view_create_chat'
  });
}; // If we have dialer support, show a context menu so the user can pick between
// the dialer and the create chat dialog


const dmAddRoomContextMenu = (onFinished
/*: () => void*/
) => {
  return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
    first: true
  }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
    label: (0, _languageHandler._t)("Start a Conversation"),
    iconClassName: "mx_RoomList_iconPlus",
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      onFinished();

      _dispatcher.default.dispatch({
        action: "view_create_chat"
      });
    }
  }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
    label: (0, _languageHandler._t)("Open dial pad"),
    iconClassName: "mx_RoomList_iconDialpad",
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      onFinished();

      _dispatcher.default.fire(_actions.Action.OpenDialPad);
    }
  }));
};

const TAG_AESTHETICS
/*: ITagAestheticsMap*/
= {
  [_models.DefaultTagID.Invite]: {
    sectionLabel: (0, _languageHandler._td)("Invites"),
    isInvite: true,
    defaultHidden: false
  },
  [_models.DefaultTagID.Favourite]: {
    sectionLabel: (0, _languageHandler._td)("Favourites"),
    isInvite: false,
    defaultHidden: false
  },
  [_models.DefaultTagID.DM]: {
    sectionLabel: (0, _languageHandler._td)("People"),
    isInvite: false,
    defaultHidden: false,
    addRoomLabel: (0, _languageHandler._td)("Start chat") // Either onAddRoom or addRoomContextMenu are set depending on whether we
    // have dialer support.

  },
  [_models.DefaultTagID.Untagged]: {
    sectionLabel: (0, _languageHandler._td)("Rooms"),
    isInvite: false,
    defaultHidden: false,
    addRoomLabel: (0, _languageHandler._td)("Add room"),
    addRoomContextMenu: (onFinished
    /*: () => void*/
    ) => {
      if (_SpaceStore.default.instance.activeSpace) {
        const canAddRooms = _SpaceStore.default.instance.activeSpace.currentState.maySendStateEvent(_event.EventType.SpaceChild, _MatrixClientPeg.MatrixClientPeg.get().getUserId());

        return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
          first: true
        }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          label: (0, _languageHandler._t)("Create new room"),
          iconClassName: "mx_RoomList_iconPlus",
          onClick: e => {
            e.preventDefault();
            e.stopPropagation();
            onFinished();
            (0, _space.showCreateNewRoom)(_MatrixClientPeg.MatrixClientPeg.get(), _SpaceStore.default.instance.activeSpace);
          },
          disabled: !canAddRooms,
          tooltip: canAddRooms ? undefined : (0, _languageHandler._t)("You do not have permissions to create new rooms in this space")
        }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          label: (0, _languageHandler._t)("Add existing room"),
          iconClassName: "mx_RoomList_iconHash",
          onClick: e => {
            e.preventDefault();
            e.stopPropagation();
            onFinished();
            (0, _space.showAddExistingRooms)(_MatrixClientPeg.MatrixClientPeg.get(), _SpaceStore.default.instance.activeSpace);
          },
          disabled: !canAddRooms,
          tooltip: canAddRooms ? undefined : (0, _languageHandler._t)("You do not have permissions to add rooms to this space")
        }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          label: (0, _languageHandler._t)("Explore rooms"),
          iconClassName: "mx_RoomList_iconBrowse",
          onClick: e => {
            e.preventDefault();
            e.stopPropagation();
            onFinished();

            _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);
          }
        }));
      }

      return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        first: true
      }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("Create new room"),
        iconClassName: "mx_RoomList_iconPlus",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();
          onFinished();

          _dispatcher.default.dispatch({
            action: "view_create_room"
          });
        }
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId() ? (0, _languageHandler._t)("Explore community rooms") : (0, _languageHandler._t)("Explore public rooms"),
        iconClassName: "mx_RoomList_iconExplore",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();
          onFinished();

          _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);
        }
      }));
    }
  },
  [_models.DefaultTagID.LowPriority]: {
    sectionLabel: (0, _languageHandler._td)("Low priority"),
    isInvite: false,
    defaultHidden: false
  },
  [_models.DefaultTagID.ServerNotice]: {
    sectionLabel: (0, _languageHandler._td)("System Alerts"),
    isInvite: false,
    defaultHidden: false
  },
  // TODO: Replace with archived view: https://github.com/vector-im/element-web/issues/14038
  [_models.DefaultTagID.Archived]: {
    sectionLabel: (0, _languageHandler._td)("Historical"),
    isInvite: false,
    defaultHidden: true
  },
  [_models.DefaultTagID.Suggested]: {
    sectionLabel: (0, _languageHandler._td)("Suggested Rooms"),
    isInvite: false,
    defaultHidden: false
  }
};

function customTagAesthetics(tagId
/*: TagID*/
)
/*: ITagAesthetics*/
{
  if (tagId.startsWith("u.")) {
    tagId = tagId.substring(2);
  }

  return {
    sectionLabel: (0, _languageHandler._td)("Custom Tag"),
    sectionLabelRaw: tagId,
    isInvite: false,
    defaultHidden: false
  };
}

let RoomList = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.RoomList"), _dec(_class = (_temp = class RoomList extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "customTagStoreRef", void 0);
    (0, _defineProperty2.default)(this, "tagAesthetics", void 0);
    (0, _defineProperty2.default)(this, "roomStoreToken", void 0);
    (0, _defineProperty2.default)(this, "onRoomViewStoreUpdate", () => {
      this.setState({
        currentRoomId: _RoomViewStore.default.getRoomId()
      });
    });
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      if (payload.action === _actions.Action.ViewRoomDelta) {
        const viewRoomDeltaPayload = payload;

        const currentRoomId = _RoomViewStore.default.getRoomId();

        const room = this.getRoomDelta(currentRoomId, viewRoomDeltaPayload.delta, viewRoomDeltaPayload.unread);

        if (room) {
          _dispatcher.default.dispatch({
            action: 'view_room',
            room_id: room.roomId,
            show_room_tile: true // to make sure the room gets scrolled into view

          });
        }
      } else if (payload.action === _actions.Action.PstnSupportUpdated) {
        this.updateDmAddRoomAction();
        this.updateLists();
      }
    });
    (0, _defineProperty2.default)(this, "getRoomDelta", (roomId
    /*: string*/
    , delta
    /*: number*/
    , unread = false) => {
      const lists = _RoomListStore.default.instance.orderedLists;
      const rooms
      /*: Room[]*/
      = [];
      TAG_ORDER.forEach(t => {
        let listRooms = lists[t];

        if (unread) {
          // filter to only notification rooms (and our current active room so we can index properly)
          listRooms = listRooms.filter(r => {
            const state = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(r);

            return state.room.roomId === roomId || state.isUnread;
          });
        }

        rooms.push(...listRooms);
      });
      const currentIndex = rooms.findIndex(r => r.roomId === roomId); // use slice to account for looping around the start

      const [room] = rooms.slice((currentIndex + delta) % rooms.length);
      return room;
    });
    (0, _defineProperty2.default)(this, "updateSuggestedRooms", (suggestedRooms
    /*: ISpaceSummaryRoom[]*/
    ) => {
      this.setState({
        suggestedRooms
      });
    });
    (0, _defineProperty2.default)(this, "updateLists", () => {
      const newLists = _RoomListStore.default.instance.orderedLists;

      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log("new lists", newLists);
      }

      const previousListIds = Object.keys(this.state.sublists);
      const newListIds = Object.keys(newLists).filter(t => {
        if (!(0, _models.isCustomTag)(t)) return true; // always include non-custom tags
        // if the tag is custom though, only include it if it is enabled

        return _CustomRoomTagStore.default.getTags()[t];
      });
      const isNameFiltering = !!_RoomListStore.default.instance.getFirstNameFilterCondition();
      let doUpdate = this.state.isNameFiltering !== isNameFiltering || (0, _arrays.arrayHasDiff)(previousListIds, newListIds);

      if (!doUpdate) {
        // so we didn't have the visible sublists change, but did the contents of those
        // sublists change significantly enough to break the sticky headers? Probably, so
        // let's check the length of each.
        for (const tagId of newListIds) {
          const oldRooms = this.state.sublists[tagId];
          const newRooms = newLists[tagId];

          if (oldRooms.length !== newRooms.length) {
            doUpdate = true;
            break;
          }
        }
      }

      if (doUpdate) {
        // We have to break our reference to the room list store if we want to be able to
        // diff the object for changes, so do that.
        // @ts-ignore - ITagMap is ts-ignored so this will have to be too
        const newSublists = (0, _objects.objectWithOnly)(newLists, newListIds);
        const sublists = (0, _objects.objectShallowClone)(newSublists, (k, v) => (0, _arrays.arrayFastClone)(v));
        this.setState({
          sublists,
          isNameFiltering
        }, () => {
          this.props.onResize();
        });
      }
    });
    (0, _defineProperty2.default)(this, "onStartChat", () => {
      const initialText = _RoomListStore.default.instance.getFirstNameFilterCondition()?.search;

      _dispatcher.default.dispatch({
        action: "view_create_chat",
        initialText
      });
    });
    (0, _defineProperty2.default)(this, "onExplore", () => {
      const initialText = _RoomListStore.default.instance.getFirstNameFilterCondition()?.search;

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoomDirectory,
        initialText
      });
    });
    (0, _defineProperty2.default)(this, "onSpaceInviteClick", () => {
      const initialText = _RoomListStore.default.instance.getFirstNameFilterCondition()?.search;
      (0, _space.showSpaceInvite)(this.props.activeSpace, initialText);
    });
    this.state = {
      sublists: {},
      isNameFiltering: !!_RoomListStore.default.instance.getFirstNameFilterCondition(),
      suggestedRooms: _SpaceStore.default.instance.suggestedRooms
    }; // shallow-copy from the template as we need to make modifications to it

    this.tagAesthetics = (0, _objects.objectShallowClone)(TAG_AESTHETICS);
    this.updateDmAddRoomAction();
  }

  componentDidMount()
  /*: void*/
  {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.roomStoreToken = _RoomViewStore.default.addListener(this.onRoomViewStoreUpdate);

    _SpaceStore.default.instance.on(_SpaceStore.SUGGESTED_ROOMS, this.updateSuggestedRooms);

    _RoomListStore.default.instance.on(_RoomListStore.LISTS_UPDATE_EVENT, this.updateLists);

    this.customTagStoreRef = _CustomRoomTagStore.default.addListener(this.updateLists);
    this.updateLists(); // trigger the first update
  }

  componentWillUnmount() {
    _SpaceStore.default.instance.off(_SpaceStore.SUGGESTED_ROOMS, this.updateSuggestedRooms);

    _RoomListStore.default.instance.off(_RoomListStore.LISTS_UPDATE_EVENT, this.updateLists);

    _dispatcher.default.unregister(this.dispatcherRef);

    if (this.customTagStoreRef) this.customTagStoreRef.remove();
    if (this.roomStoreToken) this.roomStoreToken.remove();
  }

  updateDmAddRoomAction() {
    const dmTagAesthetics = (0, _objects.objectShallowClone)(TAG_AESTHETICS[_models.DefaultTagID.DM]);

    if (_CallHandler.default.sharedInstance().getSupportsPstnProtocol()) {
      dmTagAesthetics.addRoomContextMenu = dmAddRoomContextMenu;
    } else {
      dmTagAesthetics.onAddRoom = dmOnAddRoom;
    }

    this.tagAesthetics[_models.DefaultTagID.DM] = dmTagAesthetics;
  }

  renderSuggestedRooms()
  /*: ReactComponentElement<typeof ExtraTile>[]*/
  {
    return this.state.suggestedRooms.map(room => {
      const name = room.name || room.canonical_alias || room.aliases.pop() || (0, _languageHandler._t)("Empty room");

      const avatar = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        oobData: {
          name,
          avatarUrl: room.avatar_url
        },
        width: 32,
        height: 32,
        resizeMethod: "crop"
      });

      const viewRoom = () => {
        _dispatcher.default.dispatch({
          action: "view_room",
          room_id: room.room_id,
          oobData: {
            avatarUrl: room.avatar_url,
            name
          }
        });
      };

      return /*#__PURE__*/_react.default.createElement(_ExtraTile.default, {
        isMinimized: this.props.isMinimized,
        isSelected: this.state.currentRoomId === room.room_id,
        displayName: name,
        avatar: avatar,
        onClick: viewRoom,
        key: `suggestedRoomTile_${room.room_id}`
      });
    });
  }

  renderCommunityInvites()
  /*: ReactComponentElement<typeof ExtraTile>[]*/
  {
    // TODO: Put community invites in a more sensible place (not in the room list)
    // See https://github.com/vector-im/element-web/issues/14456
    return _MatrixClientPeg.MatrixClientPeg.get().getGroups().filter(g => {
      return g.myMembership === 'invite';
    }).map(g => {
      const avatar = /*#__PURE__*/_react.default.createElement(_GroupAvatar.default, {
        groupId: g.groupId,
        groupName: g.name,
        groupAvatarUrl: g.avatarUrl,
        width: 32,
        height: 32,
        resizeMethod: "crop"
      });

      const openGroup = () => {
        _dispatcher.default.dispatch({
          action: 'view_group',
          group_id: g.groupId
        });
      };

      return /*#__PURE__*/_react.default.createElement(_ExtraTile.default, {
        isMinimized: this.props.isMinimized,
        isSelected: false,
        displayName: g.name,
        avatar: avatar,
        notificationState: _StaticNotificationState.StaticNotificationState.RED_EXCLAMATION,
        onClick: openGroup,
        key: `temporaryGroupTile_${g.groupId}`
      });
    });
  }

  renderSublists()
  /*: React.ReactElement[]*/
  {
    // show a skeleton UI if the user is in no rooms and they are not filtering
    const showSkeleton = !this.state.isNameFiltering && Object.values(_RoomListStore.default.instance.unfilteredLists).every(list => !list?.length);
    return TAG_ORDER.reduce((tags, tagId) => {
      if (tagId === CUSTOM_TAGS_BEFORE_TAG) {
        const customTags = Object.keys(this.state.sublists).filter(tagId => (0, _models.isCustomTag)(tagId));
        tags.push(...customTags);
      }

      tags.push(tagId);
      return tags;
    }, []).map(orderedTagId => {
      let extraTiles = null;

      if (orderedTagId === _models.DefaultTagID.Invite) {
        extraTiles = this.renderCommunityInvites();
      } else if (orderedTagId === _models.DefaultTagID.Suggested) {
        extraTiles = this.renderSuggestedRooms();
      }

      const aesthetics
      /*: ITagAesthetics*/
      = (0, _models.isCustomTag)(orderedTagId) ? customTagAesthetics(orderedTagId) : this.tagAesthetics[orderedTagId];
      if (!aesthetics) throw new Error(`Tag ${orderedTagId} does not have aesthetics`); // The cost of mounting/unmounting this component offsets the cost
      // of keeping it in the DOM and hiding it when it is not required

      return /*#__PURE__*/_react.default.createElement(_RoomSublist.default, {
        key: `sublist-${orderedTagId}`,
        tagId: orderedTagId,
        forRooms: true,
        startAsHidden: aesthetics.defaultHidden,
        label: aesthetics.sectionLabelRaw ? aesthetics.sectionLabelRaw : (0, _languageHandler._t)(aesthetics.sectionLabel),
        onAddRoom: aesthetics.onAddRoom,
        addRoomLabel: aesthetics.addRoomLabel ? (0, _languageHandler._t)(aesthetics.addRoomLabel) : aesthetics.addRoomLabel,
        addRoomContextMenu: aesthetics.addRoomContextMenu,
        isMinimized: this.props.isMinimized,
        onResize: this.props.onResize,
        showSkeleton: showSkeleton,
        extraTiles: extraTiles,
        resizeNotifier: this.props.resizeNotifier,
        alwaysVisible: ALWAYS_VISIBLE_TAGS.includes(orderedTagId)
      });
    });
  }

  render() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const userId = cli.getUserId();
    let explorePrompt
    /*: JSX.Element*/
    ;

    if (!this.props.isMinimized) {
      if (this.state.isNameFiltering) {
        explorePrompt = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomList_explorePrompt"
        }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Can't see what you’re looking for?")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_RoomList_explorePrompt_startChat",
          kind: "link",
          onClick: this.onStartChat
        }, (0, _languageHandler._t)("Start a new chat")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_RoomList_explorePrompt_explore",
          kind: "link",
          onClick: this.onExplore
        }, this.props.activeSpace ? (0, _languageHandler._t)("Explore rooms") : (0, _languageHandler._t)("Explore all public rooms")));
      } else if (this.props.activeSpace?.canInvite(userId) || this.props.activeSpace?.getMyMembership() === "join") {
        explorePrompt = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomList_explorePrompt"
        }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Quick actions")), this.props.activeSpace.canInvite(userId) && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_RoomList_explorePrompt_spaceInvite",
          onClick: this.onSpaceInviteClick
        }, (0, _languageHandler._t)("Invite people")), this.props.activeSpace.getMyMembership() === "join" && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_RoomList_explorePrompt_spaceExplore",
          onClick: this.onExplore
        }, (0, _languageHandler._t)("Explore rooms")));
      } else if (Object.values(this.state.sublists).some(list => list.length > 0)) {
        const unfilteredLists = _RoomListStore.default.instance.unfilteredLists;
        const unfilteredRooms = unfilteredLists[_models.DefaultTagID.Untagged] || [];
        const unfilteredHistorical = unfilteredLists[_models.DefaultTagID.Archived] || [];
        const unfilteredFavourite = unfilteredLists[_models.DefaultTagID.Favourite] || []; // show a prompt to join/create rooms if the user is in 0 rooms and no historical

        if (unfilteredRooms.length < 1 && unfilteredHistorical < 1 && unfilteredFavourite < 1) {
          explorePrompt = /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_RoomList_explorePrompt"
          }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Use the + to make a new room or explore existing ones below")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            className: "mx_RoomList_explorePrompt_startChat",
            kind: "link",
            onClick: this.onStartChat
          }, (0, _languageHandler._t)("Start a new chat")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            className: "mx_RoomList_explorePrompt_explore",
            kind: "link",
            onClick: this.onExplore
          }, (0, _languageHandler._t)("Explore all public rooms")));
        }
      }
    }

    const sublists = this.renderSublists();
    return /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingTabIndexProvider, {
      handleHomeEnd: true,
      onKeyDown: this.props.onKeyDown
    }, ({
      onKeyDownHandler
    }) => /*#__PURE__*/_react.default.createElement("div", {
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
      onKeyDown: onKeyDownHandler,
      className: "mx_RoomList",
      role: "tree",
      "aria-label": (0, _languageHandler._t)("Rooms")
    }, sublists, explorePrompt));
  }

}, _temp)) || _class);
exports.default = RoomList;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21MaXN0LnRzeCJdLCJuYW1lcyI6WyJUQUdfT1JERVIiLCJEZWZhdWx0VGFnSUQiLCJJbnZpdGUiLCJGYXZvdXJpdGUiLCJETSIsIlVudGFnZ2VkIiwiTG93UHJpb3JpdHkiLCJTZXJ2ZXJOb3RpY2UiLCJTdWdnZXN0ZWQiLCJBcmNoaXZlZCIsIkNVU1RPTV9UQUdTX0JFRk9SRV9UQUciLCJBTFdBWVNfVklTSUJMRV9UQUdTIiwiZG1PbkFkZFJvb20iLCJkaXNwYXRjaGVyIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsImRtQWRkUm9vbUNvbnRleHRNZW51Iiwib25GaW5pc2hlZCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImZpcmUiLCJBY3Rpb24iLCJPcGVuRGlhbFBhZCIsIlRBR19BRVNUSEVUSUNTIiwic2VjdGlvbkxhYmVsIiwiaXNJbnZpdGUiLCJkZWZhdWx0SGlkZGVuIiwiYWRkUm9vbUxhYmVsIiwiYWRkUm9vbUNvbnRleHRNZW51IiwiU3BhY2VTdG9yZSIsImluc3RhbmNlIiwiYWN0aXZlU3BhY2UiLCJjYW5BZGRSb29tcyIsImN1cnJlbnRTdGF0ZSIsIm1heVNlbmRTdGF0ZUV2ZW50IiwiRXZlbnRUeXBlIiwiU3BhY2VDaGlsZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFVzZXJJZCIsInVuZGVmaW5lZCIsIlZpZXdSb29tRGlyZWN0b3J5IiwiQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUiLCJnZXRTZWxlY3RlZENvbW11bml0eUlkIiwiY3VzdG9tVGFnQWVzdGhldGljcyIsInRhZ0lkIiwic3RhcnRzV2l0aCIsInN1YnN0cmluZyIsInNlY3Rpb25MYWJlbFJhdyIsIlJvb21MaXN0IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNldFN0YXRlIiwiY3VycmVudFJvb21JZCIsIlJvb21WaWV3U3RvcmUiLCJnZXRSb29tSWQiLCJwYXlsb2FkIiwiVmlld1Jvb21EZWx0YSIsInZpZXdSb29tRGVsdGFQYXlsb2FkIiwicm9vbSIsImdldFJvb21EZWx0YSIsImRlbHRhIiwidW5yZWFkIiwiZGlzIiwicm9vbV9pZCIsInJvb21JZCIsInNob3dfcm9vbV90aWxlIiwiUHN0blN1cHBvcnRVcGRhdGVkIiwidXBkYXRlRG1BZGRSb29tQWN0aW9uIiwidXBkYXRlTGlzdHMiLCJsaXN0cyIsIlJvb21MaXN0U3RvcmUiLCJvcmRlcmVkTGlzdHMiLCJyb29tcyIsImZvckVhY2giLCJ0IiwibGlzdFJvb21zIiwiZmlsdGVyIiwiciIsInN0YXRlIiwiUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUiLCJnZXRSb29tU3RhdGUiLCJpc1VucmVhZCIsInB1c2giLCJjdXJyZW50SW5kZXgiLCJmaW5kSW5kZXgiLCJzbGljZSIsImxlbmd0aCIsInN1Z2dlc3RlZFJvb21zIiwibmV3TGlzdHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJjb25zb2xlIiwibG9nIiwicHJldmlvdXNMaXN0SWRzIiwiT2JqZWN0Iiwia2V5cyIsInN1Ymxpc3RzIiwibmV3TGlzdElkcyIsIkN1c3RvbVJvb21UYWdTdG9yZSIsImdldFRhZ3MiLCJpc05hbWVGaWx0ZXJpbmciLCJnZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24iLCJkb1VwZGF0ZSIsIm9sZFJvb21zIiwibmV3Um9vbXMiLCJuZXdTdWJsaXN0cyIsImsiLCJ2Iiwib25SZXNpemUiLCJpbml0aWFsVGV4dCIsInNlYXJjaCIsInRhZ0Flc3RoZXRpY3MiLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwicm9vbVN0b3JlVG9rZW4iLCJhZGRMaXN0ZW5lciIsIm9uUm9vbVZpZXdTdG9yZVVwZGF0ZSIsIm9uIiwiU1VHR0VTVEVEX1JPT01TIiwidXBkYXRlU3VnZ2VzdGVkUm9vbXMiLCJMSVNUU19VUERBVEVfRVZFTlQiLCJjdXN0b21UYWdTdG9yZVJlZiIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwidW5yZWdpc3RlciIsInJlbW92ZSIsImRtVGFnQWVzdGhldGljcyIsIkNhbGxIYW5kbGVyIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRTdXBwb3J0c1BzdG5Qcm90b2NvbCIsIm9uQWRkUm9vbSIsInJlbmRlclN1Z2dlc3RlZFJvb21zIiwibWFwIiwibmFtZSIsImNhbm9uaWNhbF9hbGlhcyIsImFsaWFzZXMiLCJwb3AiLCJhdmF0YXIiLCJhdmF0YXJVcmwiLCJhdmF0YXJfdXJsIiwidmlld1Jvb20iLCJvb2JEYXRhIiwiaXNNaW5pbWl6ZWQiLCJyZW5kZXJDb21tdW5pdHlJbnZpdGVzIiwiZ2V0R3JvdXBzIiwiZyIsIm15TWVtYmVyc2hpcCIsImdyb3VwSWQiLCJvcGVuR3JvdXAiLCJncm91cF9pZCIsIlN0YXRpY05vdGlmaWNhdGlvblN0YXRlIiwiUkVEX0VYQ0xBTUFUSU9OIiwicmVuZGVyU3VibGlzdHMiLCJzaG93U2tlbGV0b24iLCJ2YWx1ZXMiLCJ1bmZpbHRlcmVkTGlzdHMiLCJldmVyeSIsImxpc3QiLCJyZWR1Y2UiLCJ0YWdzIiwiY3VzdG9tVGFncyIsIm9yZGVyZWRUYWdJZCIsImV4dHJhVGlsZXMiLCJhZXN0aGV0aWNzIiwiRXJyb3IiLCJyZXNpemVOb3RpZmllciIsImluY2x1ZGVzIiwicmVuZGVyIiwiY2xpIiwidXNlcklkIiwiZXhwbG9yZVByb21wdCIsIm9uU3RhcnRDaGF0Iiwib25FeHBsb3JlIiwiY2FuSW52aXRlIiwiZ2V0TXlNZW1iZXJzaGlwIiwib25TcGFjZUludml0ZUNsaWNrIiwic29tZSIsInVuZmlsdGVyZWRSb29tcyIsInVuZmlsdGVyZWRIaXN0b3JpY2FsIiwidW5maWx0ZXJlZEZhdm91cml0ZSIsIm9uS2V5RG93biIsIm9uS2V5RG93bkhhbmRsZXIiLCJvbkZvY3VzIiwib25CbHVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUlB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cmlnaHQgMjAxNS0yMDE4LCAyMDIwLCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IFJlYWN0Q29tcG9uZW50RWxlbWVudCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgRGlzcGF0Y2hlciB9IGZyb20gXCJmbHV4XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgKiBhcyBmYkVtaXR0ZXIgZnJvbSBcImZiZW1pdHRlclwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuXG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgUm92aW5nVGFiSW5kZXhQcm92aWRlciB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L1JvdmluZ1RhYkluZGV4XCI7XG5pbXBvcnQgeyBSZXNpemVOb3RpZmllciB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9SZXNpemVOb3RpZmllclwiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUsIHsgTElTVFNfVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IFJvb21WaWV3U3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Sb29tVmlld1N0b3JlXCI7XG5pbXBvcnQgeyBJVGFnTWFwIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvYWxnb3JpdGhtcy9tb2RlbHNcIjtcbmltcG9ydCB7IERlZmF1bHRUYWdJRCwgaXNDdXN0b21UYWcsIFRhZ0lEIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgUm9vbVN1Ymxpc3QgZnJvbSBcIi4vUm9vbVN1Ymxpc3RcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEdyb3VwQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL0dyb3VwQXZhdGFyXCI7XG5pbXBvcnQgRXh0cmFUaWxlIGZyb20gXCIuL0V4dHJhVGlsZVwiO1xuaW1wb3J0IHsgU3RhdGljTm90aWZpY2F0aW9uU3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvU3RhdGljTm90aWZpY2F0aW9uU3RhdGVcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IFZpZXdSb29tRGVsdGFQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21EZWx0YVBheWxvYWRcIjtcbmltcG9ydCB7IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1Jvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IEN1c3RvbVJvb21UYWdTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0N1c3RvbVJvb21UYWdTdG9yZVwiO1xuaW1wb3J0IHsgYXJyYXlGYXN0Q2xvbmUsIGFycmF5SGFzRGlmZiB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9hcnJheXNcIjtcbmltcG9ydCB7IG9iamVjdFNoYWxsb3dDbG9uZSwgb2JqZWN0V2l0aE9ubHkgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvb2JqZWN0c1wiO1xuaW1wb3J0IHsgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbiwgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgfSBmcm9tIFwiLi4vY29udGV4dF9tZW51cy9JY29uaXplZENvbnRleHRNZW51XCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0NvbW11bml0eVByb3RvdHlwZVN0b3JlXCI7XG5pbXBvcnQgQ2FsbEhhbmRsZXIgZnJvbSBcIi4uLy4uLy4uL0NhbGxIYW5kbGVyXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSwge1NVR0dFU1RFRF9ST09NU30gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9TcGFjZVN0b3JlXCI7XG5pbXBvcnQge3Nob3dBZGRFeGlzdGluZ1Jvb21zLCBzaG93Q3JlYXRlTmV3Um9vbSwgc2hvd1NwYWNlSW52aXRlfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc3BhY2VcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvUm9vbUF2YXRhclwiO1xuaW1wb3J0IHsgSVNwYWNlU3VtbWFyeVJvb20gfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9TcGFjZVJvb21EaXJlY3RvcnlcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgb25LZXlEb3duOiAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHZvaWQ7XG4gICAgb25Gb2N1czogKGV2OiBSZWFjdC5Gb2N1c0V2ZW50KSA9PiB2b2lkO1xuICAgIG9uQmx1cjogKGV2OiBSZWFjdC5Gb2N1c0V2ZW50KSA9PiB2b2lkO1xuICAgIG9uUmVzaXplOiAoKSA9PiB2b2lkO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbiAgICBpc01pbmltaXplZDogYm9vbGVhbjtcbiAgICBhY3RpdmVTcGFjZTogUm9vbTtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgc3VibGlzdHM6IElUYWdNYXA7XG4gICAgaXNOYW1lRmlsdGVyaW5nOiBib29sZWFuO1xuICAgIGN1cnJlbnRSb29tSWQ/OiBzdHJpbmc7XG4gICAgc3VnZ2VzdGVkUm9vbXM6IElTcGFjZVN1bW1hcnlSb29tW107XG59XG5cbmNvbnN0IFRBR19PUkRFUjogVGFnSURbXSA9IFtcbiAgICBEZWZhdWx0VGFnSUQuSW52aXRlLFxuICAgIERlZmF1bHRUYWdJRC5GYXZvdXJpdGUsXG4gICAgRGVmYXVsdFRhZ0lELkRNLFxuICAgIERlZmF1bHRUYWdJRC5VbnRhZ2dlZCxcblxuICAgIC8vIC0tIEN1c3RvbSBUYWdzIFBsYWNlaG9sZGVyIC0tXG5cbiAgICBEZWZhdWx0VGFnSUQuTG93UHJpb3JpdHksXG4gICAgRGVmYXVsdFRhZ0lELlNlcnZlck5vdGljZSxcbiAgICBEZWZhdWx0VGFnSUQuU3VnZ2VzdGVkLFxuICAgIERlZmF1bHRUYWdJRC5BcmNoaXZlZCxcbl07XG5jb25zdCBDVVNUT01fVEFHU19CRUZPUkVfVEFHID0gRGVmYXVsdFRhZ0lELkxvd1ByaW9yaXR5O1xuY29uc3QgQUxXQVlTX1ZJU0lCTEVfVEFHUzogVGFnSURbXSA9IFtcbiAgICBEZWZhdWx0VGFnSUQuRE0sXG4gICAgRGVmYXVsdFRhZ0lELlVudGFnZ2VkLFxuXTtcblxuaW50ZXJmYWNlIElUYWdBZXN0aGV0aWNzIHtcbiAgICBzZWN0aW9uTGFiZWw6IHN0cmluZztcbiAgICBzZWN0aW9uTGFiZWxSYXc/OiBzdHJpbmc7XG4gICAgYWRkUm9vbUxhYmVsPzogc3RyaW5nO1xuICAgIG9uQWRkUm9vbT86IChkaXNwYXRjaGVyPzogRGlzcGF0Y2hlcjxBY3Rpb25QYXlsb2FkPikgPT4gdm9pZDtcbiAgICBhZGRSb29tQ29udGV4dE1lbnU/OiAob25GaW5pc2hlZDogKCkgPT4gdm9pZCkgPT4gUmVhY3QuUmVhY3ROb2RlO1xuICAgIGlzSW52aXRlOiBib29sZWFuO1xuICAgIGRlZmF1bHRIaWRkZW46IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJVGFnQWVzdGhldGljc01hcCB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIHRoaXMgdG8gYmUgYSBzdHJpbmcgYnV0IHdlIGtub3cgYmV0dGVyXG4gICAgW3RhZ0lkOiBUYWdJRF06IElUYWdBZXN0aGV0aWNzO1xufVxuXG4vLyBJZiB3ZSBoYXZlIG5vIGRpYWxlciBzdXBwb3J0LCB3ZSBqdXN0IHNob3cgdGhlIGNyZWF0ZSBjaGF0IGRpYWxvZ1xuY29uc3QgZG1PbkFkZFJvb20gPSAoZGlzcGF0Y2hlcj86IERpc3BhdGNoZXI8QWN0aW9uUGF5bG9hZD4pID0+IHtcbiAgICAoZGlzcGF0Y2hlciB8fCBkZWZhdWx0RGlzcGF0Y2hlcikuZGlzcGF0Y2goe2FjdGlvbjogJ3ZpZXdfY3JlYXRlX2NoYXQnfSk7XG59O1xuXG4vLyBJZiB3ZSBoYXZlIGRpYWxlciBzdXBwb3J0LCBzaG93IGEgY29udGV4dCBtZW51IHNvIHRoZSB1c2VyIGNhbiBwaWNrIGJldHdlZW5cbi8vIHRoZSBkaWFsZXIgYW5kIHRoZSBjcmVhdGUgY2hhdCBkaWFsb2dcbmNvbnN0IGRtQWRkUm9vbUNvbnRleHRNZW51ID0gKG9uRmluaXNoZWQ6ICgpID0+IHZvaWQpID0+IHtcbiAgICByZXR1cm4gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IGZpcnN0PlxuICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgbGFiZWw9e190KFwiU3RhcnQgYSBDb252ZXJzYXRpb25cIil9XG4gICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfaWNvblBsdXNcIlxuICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogXCJ2aWV3X2NyZWF0ZV9jaGF0XCJ9KTtcbiAgICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICBsYWJlbD17X3QoXCJPcGVuIGRpYWwgcGFkXCIpfVxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2ljb25EaWFscGFkXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmZpcmUoQWN0aW9uLk9wZW5EaWFsUGFkKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD47XG59O1xuXG5jb25zdCBUQUdfQUVTVEhFVElDUzogSVRhZ0Flc3RoZXRpY3NNYXAgPSB7XG4gICAgW0RlZmF1bHRUYWdJRC5JbnZpdGVdOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiSW52aXRlc1wiKSxcbiAgICAgICAgaXNJbnZpdGU6IHRydWUsXG4gICAgICAgIGRlZmF1bHRIaWRkZW46IGZhbHNlLFxuICAgIH0sXG4gICAgW0RlZmF1bHRUYWdJRC5GYXZvdXJpdGVdOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiRmF2b3VyaXRlc1wiKSxcbiAgICAgICAgaXNJbnZpdGU6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICB9LFxuICAgIFtEZWZhdWx0VGFnSUQuRE1dOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiUGVvcGxlXCIpLFxuICAgICAgICBpc0ludml0ZTogZmFsc2UsXG4gICAgICAgIGRlZmF1bHRIaWRkZW46IGZhbHNlLFxuICAgICAgICBhZGRSb29tTGFiZWw6IF90ZChcIlN0YXJ0IGNoYXRcIiksXG4gICAgICAgIC8vIEVpdGhlciBvbkFkZFJvb20gb3IgYWRkUm9vbUNvbnRleHRNZW51IGFyZSBzZXQgZGVwZW5kaW5nIG9uIHdoZXRoZXIgd2VcbiAgICAgICAgLy8gaGF2ZSBkaWFsZXIgc3VwcG9ydC5cbiAgICB9LFxuICAgIFtEZWZhdWx0VGFnSUQuVW50YWdnZWRdOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiUm9vbXNcIiksXG4gICAgICAgIGlzSW52aXRlOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdEhpZGRlbjogZmFsc2UsXG4gICAgICAgIGFkZFJvb21MYWJlbDogX3RkKFwiQWRkIHJvb21cIiksXG4gICAgICAgIGFkZFJvb21Db250ZXh0TWVudTogKG9uRmluaXNoZWQ6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGlmIChTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuQWRkUm9vbXMgPSBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlLmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuU3BhY2VDaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgZmlyc3Q+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJDcmVhdGUgbmV3IHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfaWNvblBsdXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0NyZWF0ZU5ld1Jvb20oTWF0cml4Q2xpZW50UGVnLmdldCgpLCBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWNhbkFkZFJvb21zfVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcD17Y2FuQWRkUm9vbXMgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb25zIHRvIGNyZWF0ZSBuZXcgcm9vbXMgaW4gdGhpcyBzcGFjZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkFkZCBleGlzdGluZyByb29tXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2ljb25IYXNoXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dBZGRFeGlzdGluZ1Jvb21zKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5BZGRSb29tc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9e2NhbkFkZFJvb21zID8gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9ucyB0byBhZGQgcm9vbXMgdG8gdGhpcyBzcGFjZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkV4cGxvcmUgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfaWNvbkJyb3dzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5maXJlKEFjdGlvbi5WaWV3Um9vbURpcmVjdG9yeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IGZpcnN0PlxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkNyZWF0ZSBuZXcgcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2ljb25QbHVzXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBcInZpZXdfY3JlYXRlX3Jvb21cIn0pO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e0NvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5SWQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIkV4cGxvcmUgY29tbXVuaXR5IHJvb21zXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiRXhwbG9yZSBwdWJsaWMgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uRXhwbG9yZVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZmlyZShBY3Rpb24uVmlld1Jvb21EaXJlY3RvcnkpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PjtcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIFtEZWZhdWx0VGFnSUQuTG93UHJpb3JpdHldOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiTG93IHByaW9yaXR5XCIpLFxuICAgICAgICBpc0ludml0ZTogZmFsc2UsXG4gICAgICAgIGRlZmF1bHRIaWRkZW46IGZhbHNlLFxuICAgIH0sXG4gICAgW0RlZmF1bHRUYWdJRC5TZXJ2ZXJOb3RpY2VdOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiU3lzdGVtIEFsZXJ0c1wiKSxcbiAgICAgICAgaXNJbnZpdGU6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICB9LFxuXG4gICAgLy8gVE9ETzogUmVwbGFjZSB3aXRoIGFyY2hpdmVkIHZpZXc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MDM4XG4gICAgW0RlZmF1bHRUYWdJRC5BcmNoaXZlZF06IHtcbiAgICAgICAgc2VjdGlvbkxhYmVsOiBfdGQoXCJIaXN0b3JpY2FsXCIpLFxuICAgICAgICBpc0ludml0ZTogZmFsc2UsXG4gICAgICAgIGRlZmF1bHRIaWRkZW46IHRydWUsXG4gICAgfSxcblxuICAgIFtEZWZhdWx0VGFnSUQuU3VnZ2VzdGVkXToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIlN1Z2dlc3RlZCBSb29tc1wiKSxcbiAgICAgICAgaXNJbnZpdGU6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICB9LFxufTtcblxuZnVuY3Rpb24gY3VzdG9tVGFnQWVzdGhldGljcyh0YWdJZDogVGFnSUQpOiBJVGFnQWVzdGhldGljcyB7XG4gICAgaWYgKHRhZ0lkLnN0YXJ0c1dpdGgoXCJ1LlwiKSkge1xuICAgICAgICB0YWdJZCA9IHRhZ0lkLnN1YnN0cmluZygyKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VjdGlvbkxhYmVsOiBfdGQoXCJDdXN0b20gVGFnXCIpLFxuICAgICAgICBzZWN0aW9uTGFiZWxSYXc6IHRhZ0lkLFxuICAgICAgICBpc0ludml0ZTogZmFsc2UsXG4gICAgICAgIGRlZmF1bHRIaWRkZW46IGZhbHNlLFxuICAgIH07XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnJvb21zLlJvb21MaXN0XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tTGlzdCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY7XG4gICAgcHJpdmF0ZSBjdXN0b21UYWdTdG9yZVJlZjtcbiAgICBwcml2YXRlIHRhZ0Flc3RoZXRpY3M6IElUYWdBZXN0aGV0aWNzTWFwO1xuICAgIHByaXZhdGUgcm9vbVN0b3JlVG9rZW46IGZiRW1pdHRlci5FdmVudFN1YnNjcmlwdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzdWJsaXN0czoge30sXG4gICAgICAgICAgICBpc05hbWVGaWx0ZXJpbmc6ICEhUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5nZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24oKSxcbiAgICAgICAgICAgIHN1Z2dlc3RlZFJvb21zOiBTcGFjZVN0b3JlLmluc3RhbmNlLnN1Z2dlc3RlZFJvb21zLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHNoYWxsb3ctY29weSBmcm9tIHRoZSB0ZW1wbGF0ZSBhcyB3ZSBuZWVkIHRvIG1ha2UgbW9kaWZpY2F0aW9ucyB0byBpdFxuICAgICAgICB0aGlzLnRhZ0Flc3RoZXRpY3MgPSBvYmplY3RTaGFsbG93Q2xvbmUoVEFHX0FFU1RIRVRJQ1MpO1xuICAgICAgICB0aGlzLnVwZGF0ZURtQWRkUm9vbUFjdGlvbigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGVmYXVsdERpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMucm9vbVN0b3JlVG9rZW4gPSBSb29tVmlld1N0b3JlLmFkZExpc3RlbmVyKHRoaXMub25Sb29tVmlld1N0b3JlVXBkYXRlKTtcbiAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5vbihTVUdHRVNURURfUk9PTVMsIHRoaXMudXBkYXRlU3VnZ2VzdGVkUm9vbXMpO1xuICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9uKExJU1RTX1VQREFURV9FVkVOVCwgdGhpcy51cGRhdGVMaXN0cyk7XG4gICAgICAgIHRoaXMuY3VzdG9tVGFnU3RvcmVSZWYgPSBDdXN0b21Sb29tVGFnU3RvcmUuYWRkTGlzdGVuZXIodGhpcy51cGRhdGVMaXN0cyk7XG4gICAgICAgIHRoaXMudXBkYXRlTGlzdHMoKTsgLy8gdHJpZ2dlciB0aGUgZmlyc3QgdXBkYXRlXG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLm9mZihTVUdHRVNURURfUk9PTVMsIHRoaXMudXBkYXRlU3VnZ2VzdGVkUm9vbXMpO1xuICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9mZihMSVNUU19VUERBVEVfRVZFTlQsIHRoaXMudXBkYXRlTGlzdHMpO1xuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIGlmICh0aGlzLmN1c3RvbVRhZ1N0b3JlUmVmKSB0aGlzLmN1c3RvbVRhZ1N0b3JlUmVmLnJlbW92ZSgpO1xuICAgICAgICBpZiAodGhpcy5yb29tU3RvcmVUb2tlbikgdGhpcy5yb29tU3RvcmVUb2tlbi5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUm9vbVZpZXdTdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjdXJyZW50Um9vbUlkOiBSb29tVmlld1N0b3JlLmdldFJvb21JZCgpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVEbUFkZFJvb21BY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IGRtVGFnQWVzdGhldGljcyA9IG9iamVjdFNoYWxsb3dDbG9uZShUQUdfQUVTVEhFVElDU1tEZWZhdWx0VGFnSUQuRE1dKTtcbiAgICAgICAgaWYgKENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkuZ2V0U3VwcG9ydHNQc3RuUHJvdG9jb2woKSkge1xuICAgICAgICAgICAgZG1UYWdBZXN0aGV0aWNzLmFkZFJvb21Db250ZXh0TWVudSA9IGRtQWRkUm9vbUNvbnRleHRNZW51O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG1UYWdBZXN0aGV0aWNzLm9uQWRkUm9vbSA9IGRtT25BZGRSb29tO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50YWdBZXN0aGV0aWNzW0RlZmF1bHRUYWdJRC5ETV0gPSBkbVRhZ0Flc3RoZXRpY3M7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gQWN0aW9uLlZpZXdSb29tRGVsdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXdSb29tRGVsdGFQYXlsb2FkID0gcGF5bG9hZCBhcyBWaWV3Um9vbURlbHRhUGF5bG9hZDtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRSb29tSWQgPSBSb29tVmlld1N0b3JlLmdldFJvb21JZCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuZ2V0Um9vbURlbHRhKGN1cnJlbnRSb29tSWQsIHZpZXdSb29tRGVsdGFQYXlsb2FkLmRlbHRhLCB2aWV3Um9vbURlbHRhUGF5bG9hZC51bnJlYWQpO1xuICAgICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgc2hvd19yb29tX3RpbGU6IHRydWUsIC8vIHRvIG1ha2Ugc3VyZSB0aGUgcm9vbSBnZXRzIHNjcm9sbGVkIGludG8gdmlld1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBheWxvYWQuYWN0aW9uID09PSBBY3Rpb24uUHN0blN1cHBvcnRVcGRhdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURtQWRkUm9vbUFjdGlvbigpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVMaXN0cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0Um9vbURlbHRhID0gKHJvb21JZDogc3RyaW5nLCBkZWx0YTogbnVtYmVyLCB1bnJlYWQgPSBmYWxzZSkgPT4ge1xuICAgICAgICBjb25zdCBsaXN0cyA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzO1xuICAgICAgICBjb25zdCByb29tczogUm9vbVtdID0gW107XG4gICAgICAgIFRBR19PUkRFUi5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgICAgbGV0IGxpc3RSb29tcyA9IGxpc3RzW3RdO1xuXG4gICAgICAgICAgICBpZiAodW5yZWFkKSB7XG4gICAgICAgICAgICAgICAgLy8gZmlsdGVyIHRvIG9ubHkgbm90aWZpY2F0aW9uIHJvb21zIChhbmQgb3VyIGN1cnJlbnQgYWN0aXZlIHJvb20gc28gd2UgY2FuIGluZGV4IHByb3Blcmx5KVxuICAgICAgICAgICAgICAgIGxpc3RSb29tcyA9IGxpc3RSb29tcy5maWx0ZXIociA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUucm9vbS5yb29tSWQgPT09IHJvb21JZCB8fCBzdGF0ZS5pc1VucmVhZDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcm9vbXMucHVzaCguLi5saXN0Um9vbXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSByb29tcy5maW5kSW5kZXgociA9PiByLnJvb21JZCA9PT0gcm9vbUlkKTtcbiAgICAgICAgLy8gdXNlIHNsaWNlIHRvIGFjY291bnQgZm9yIGxvb3BpbmcgYXJvdW5kIHRoZSBzdGFydFxuICAgICAgICBjb25zdCBbcm9vbV0gPSByb29tcy5zbGljZSgoY3VycmVudEluZGV4ICsgZGVsdGEpICUgcm9vbXMubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHJvb207XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlU3VnZ2VzdGVkUm9vbXMgPSAoc3VnZ2VzdGVkUm9vbXM6IElTcGFjZVN1bW1hcnlSb29tW10pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHN1Z2dlc3RlZFJvb21zIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZUxpc3RzID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdMaXN0cyA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5ldyBsaXN0c1wiLCBuZXdMaXN0cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcmV2aW91c0xpc3RJZHMgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLnN1Ymxpc3RzKTtcbiAgICAgICAgY29uc3QgbmV3TGlzdElkcyA9IE9iamVjdC5rZXlzKG5ld0xpc3RzKS5maWx0ZXIodCA9PiB7XG4gICAgICAgICAgICBpZiAoIWlzQ3VzdG9tVGFnKHQpKSByZXR1cm4gdHJ1ZTsgLy8gYWx3YXlzIGluY2x1ZGUgbm9uLWN1c3RvbSB0YWdzXG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSB0YWcgaXMgY3VzdG9tIHRob3VnaCwgb25seSBpbmNsdWRlIGl0IGlmIGl0IGlzIGVuYWJsZWRcbiAgICAgICAgICAgIHJldHVybiBDdXN0b21Sb29tVGFnU3RvcmUuZ2V0VGFncygpW3RdO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBpc05hbWVGaWx0ZXJpbmcgPSAhIVJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0Rmlyc3ROYW1lRmlsdGVyQ29uZGl0aW9uKCk7XG4gICAgICAgIGxldCBkb1VwZGF0ZSA9IHRoaXMuc3RhdGUuaXNOYW1lRmlsdGVyaW5nICE9PSBpc05hbWVGaWx0ZXJpbmcgfHwgYXJyYXlIYXNEaWZmKHByZXZpb3VzTGlzdElkcywgbmV3TGlzdElkcyk7XG4gICAgICAgIGlmICghZG9VcGRhdGUpIHtcbiAgICAgICAgICAgIC8vIHNvIHdlIGRpZG4ndCBoYXZlIHRoZSB2aXNpYmxlIHN1Ymxpc3RzIGNoYW5nZSwgYnV0IGRpZCB0aGUgY29udGVudHMgb2YgdGhvc2VcbiAgICAgICAgICAgIC8vIHN1Ymxpc3RzIGNoYW5nZSBzaWduaWZpY2FudGx5IGVub3VnaCB0byBicmVhayB0aGUgc3RpY2t5IGhlYWRlcnM/IFByb2JhYmx5LCBzb1xuICAgICAgICAgICAgLy8gbGV0J3MgY2hlY2sgdGhlIGxlbmd0aCBvZiBlYWNoLlxuICAgICAgICAgICAgZm9yIChjb25zdCB0YWdJZCBvZiBuZXdMaXN0SWRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkUm9vbXMgPSB0aGlzLnN0YXRlLnN1Ymxpc3RzW3RhZ0lkXTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdSb29tcyA9IG5ld0xpc3RzW3RhZ0lkXTtcbiAgICAgICAgICAgICAgICBpZiAob2xkUm9vbXMubGVuZ3RoICE9PSBuZXdSb29tcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9VcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9VcGRhdGUpIHtcbiAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gYnJlYWsgb3VyIHJlZmVyZW5jZSB0byB0aGUgcm9vbSBsaXN0IHN0b3JlIGlmIHdlIHdhbnQgdG8gYmUgYWJsZSB0b1xuICAgICAgICAgICAgLy8gZGlmZiB0aGUgb2JqZWN0IGZvciBjaGFuZ2VzLCBzbyBkbyB0aGF0LlxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIElUYWdNYXAgaXMgdHMtaWdub3JlZCBzbyB0aGlzIHdpbGwgaGF2ZSB0byBiZSB0b29cbiAgICAgICAgICAgIGNvbnN0IG5ld1N1Ymxpc3RzID0gb2JqZWN0V2l0aE9ubHkobmV3TGlzdHMsIG5ld0xpc3RJZHMpO1xuICAgICAgICAgICAgY29uc3Qgc3VibGlzdHMgPSBvYmplY3RTaGFsbG93Q2xvbmUobmV3U3VibGlzdHMsIChrLCB2KSA9PiBhcnJheUZhc3RDbG9uZSh2KSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3N1Ymxpc3RzLCBpc05hbWVGaWx0ZXJpbmd9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlc2l6ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN0YXJ0Q2hhdCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5pdGlhbFRleHQgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldEZpcnN0TmFtZUZpbHRlckNvbmRpdGlvbigpPy5zZWFyY2g7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogXCJ2aWV3X2NyZWF0ZV9jaGF0XCIsIGluaXRpYWxUZXh0IH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRXhwbG9yZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5pdGlhbFRleHQgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldEZpcnN0TmFtZUZpbHRlckNvbmRpdGlvbigpPy5zZWFyY2g7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogQWN0aW9uLlZpZXdSb29tRGlyZWN0b3J5LCBpbml0aWFsVGV4dCB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNwYWNlSW52aXRlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluaXRpYWxUZXh0ID0gUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5nZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24oKT8uc2VhcmNoO1xuICAgICAgICBzaG93U3BhY2VJbnZpdGUodGhpcy5wcm9wcy5hY3RpdmVTcGFjZSwgaW5pdGlhbFRleHQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlclN1Z2dlc3RlZFJvb21zKCk6IFJlYWN0Q29tcG9uZW50RWxlbWVudDx0eXBlb2YgRXh0cmFUaWxlPltdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuc3VnZ2VzdGVkUm9vbXMubWFwKHJvb20gPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHJvb20ubmFtZSB8fCByb29tLmNhbm9uaWNhbF9hbGlhcyB8fCByb29tLmFsaWFzZXMucG9wKCkgfHwgX3QoXCJFbXB0eSByb29tXCIpO1xuICAgICAgICAgICAgY29uc3QgYXZhdGFyID0gKFxuICAgICAgICAgICAgICAgIDxSb29tQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgIG9vYkRhdGE9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHJvb20uYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezMyfVxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezMyfVxuICAgICAgICAgICAgICAgICAgICByZXNpemVNZXRob2Q9XCJjcm9wXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IHZpZXdSb29tID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfcm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21faWQsXG4gICAgICAgICAgICAgICAgICAgIG9vYkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogcm9vbS5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxFeHRyYVRpbGVcbiAgICAgICAgICAgICAgICAgICAgaXNNaW5pbWl6ZWQ9e3RoaXMucHJvcHMuaXNNaW5pbWl6ZWR9XG4gICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e3RoaXMuc3RhdGUuY3VycmVudFJvb21JZCA9PT0gcm9vbS5yb29tX2lkfVxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZT17bmFtZX1cbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyPXthdmF0YXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3ZpZXdSb29tfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2BzdWdnZXN0ZWRSb29tVGlsZV8ke3Jvb20ucm9vbV9pZH1gfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckNvbW11bml0eUludml0ZXMoKTogUmVhY3RDb21wb25lbnRFbGVtZW50PHR5cGVvZiBFeHRyYVRpbGU+W10ge1xuICAgICAgICAvLyBUT0RPOiBQdXQgY29tbXVuaXR5IGludml0ZXMgaW4gYSBtb3JlIHNlbnNpYmxlIHBsYWNlIChub3QgaW4gdGhlIHJvb20gbGlzdClcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NDU2XG4gICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0R3JvdXBzKCkuZmlsdGVyKGcgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGcubXlNZW1iZXJzaGlwID09PSAnaW52aXRlJztcbiAgICAgICAgfSkubWFwKGcgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXZhdGFyID0gKFxuICAgICAgICAgICAgICAgIDxHcm91cEF2YXRhclxuICAgICAgICAgICAgICAgICAgICBncm91cElkPXtnLmdyb3VwSWR9XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwTmFtZT17Zy5uYW1lfVxuICAgICAgICAgICAgICAgICAgICBncm91cEF2YXRhclVybD17Zy5hdmF0YXJVcmx9XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPXszMn0gaGVpZ2h0PXszMn0gcmVzaXplTWV0aG9kPSdjcm9wJ1xuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3Qgb3Blbkdyb3VwID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19ncm91cCcsXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwX2lkOiBnLmdyb3VwSWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8RXh0cmFUaWxlXG4gICAgICAgICAgICAgICAgICAgIGlzTWluaW1pemVkPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfVxuICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU9e2cubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyPXthdmF0YXJ9XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblN0YXRlPXtTdGF0aWNOb3RpZmljYXRpb25TdGF0ZS5SRURfRVhDTEFNQVRJT059XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29wZW5Hcm91cH1cbiAgICAgICAgICAgICAgICAgICAga2V5PXtgdGVtcG9yYXJ5R3JvdXBUaWxlXyR7Zy5ncm91cElkfWB9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyU3VibGlzdHMoKTogUmVhY3QuUmVhY3RFbGVtZW50W10ge1xuICAgICAgICAvLyBzaG93IGEgc2tlbGV0b24gVUkgaWYgdGhlIHVzZXIgaXMgaW4gbm8gcm9vbXMgYW5kIHRoZXkgYXJlIG5vdCBmaWx0ZXJpbmdcbiAgICAgICAgY29uc3Qgc2hvd1NrZWxldG9uID0gIXRoaXMuc3RhdGUuaXNOYW1lRmlsdGVyaW5nICYmXG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKFJvb21MaXN0U3RvcmUuaW5zdGFuY2UudW5maWx0ZXJlZExpc3RzKS5ldmVyeShsaXN0ID0+ICFsaXN0Py5sZW5ndGgpO1xuXG4gICAgICAgIHJldHVybiBUQUdfT1JERVIucmVkdWNlKCh0YWdzLCB0YWdJZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRhZ0lkID09PSBDVVNUT01fVEFHU19CRUZPUkVfVEFHKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VzdG9tVGFncyA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuc3VibGlzdHMpXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIodGFnSWQgPT4gaXNDdXN0b21UYWcodGFnSWQpKTtcbiAgICAgICAgICAgICAgICB0YWdzLnB1c2goLi4uY3VzdG9tVGFncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWdzLnB1c2godGFnSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHRhZ3M7XG4gICAgICAgIH0sIFtdIGFzIFRhZ0lEW10pXG4gICAgICAgICAgICAubWFwKG9yZGVyZWRUYWdJZCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGV4dHJhVGlsZXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChvcmRlcmVkVGFnSWQgPT09IERlZmF1bHRUYWdJRC5JbnZpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFUaWxlcyA9IHRoaXMucmVuZGVyQ29tbXVuaXR5SW52aXRlcygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3JkZXJlZFRhZ0lkID09PSBEZWZhdWx0VGFnSUQuU3VnZ2VzdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhVGlsZXMgPSB0aGlzLnJlbmRlclN1Z2dlc3RlZFJvb21zKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgYWVzdGhldGljczogSVRhZ0Flc3RoZXRpY3MgPSBpc0N1c3RvbVRhZyhvcmRlcmVkVGFnSWQpXG4gICAgICAgICAgICAgICAgICAgID8gY3VzdG9tVGFnQWVzdGhldGljcyhvcmRlcmVkVGFnSWQpXG4gICAgICAgICAgICAgICAgICAgIDogdGhpcy50YWdBZXN0aGV0aWNzW29yZGVyZWRUYWdJZF07XG4gICAgICAgICAgICAgICAgaWYgKCFhZXN0aGV0aWNzKSB0aHJvdyBuZXcgRXJyb3IoYFRhZyAke29yZGVyZWRUYWdJZH0gZG9lcyBub3QgaGF2ZSBhZXN0aGV0aWNzYCk7XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgY29zdCBvZiBtb3VudGluZy91bm1vdW50aW5nIHRoaXMgY29tcG9uZW50IG9mZnNldHMgdGhlIGNvc3RcbiAgICAgICAgICAgICAgICAvLyBvZiBrZWVwaW5nIGl0IGluIHRoZSBET00gYW5kIGhpZGluZyBpdCB3aGVuIGl0IGlzIG5vdCByZXF1aXJlZFxuICAgICAgICAgICAgICAgIHJldHVybiA8Um9vbVN1Ymxpc3RcbiAgICAgICAgICAgICAgICAgICAga2V5PXtgc3VibGlzdC0ke29yZGVyZWRUYWdJZH1gfVxuICAgICAgICAgICAgICAgICAgICB0YWdJZD17b3JkZXJlZFRhZ0lkfVxuICAgICAgICAgICAgICAgICAgICBmb3JSb29tcz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgc3RhcnRBc0hpZGRlbj17YWVzdGhldGljcy5kZWZhdWx0SGlkZGVufVxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17YWVzdGhldGljcy5zZWN0aW9uTGFiZWxSYXcgPyBhZXN0aGV0aWNzLnNlY3Rpb25MYWJlbFJhdyA6IF90KGFlc3RoZXRpY3Muc2VjdGlvbkxhYmVsKX1cbiAgICAgICAgICAgICAgICAgICAgb25BZGRSb29tPXthZXN0aGV0aWNzLm9uQWRkUm9vbX1cbiAgICAgICAgICAgICAgICAgICAgYWRkUm9vbUxhYmVsPXthZXN0aGV0aWNzLmFkZFJvb21MYWJlbCA/IF90KGFlc3RoZXRpY3MuYWRkUm9vbUxhYmVsKSA6IGFlc3RoZXRpY3MuYWRkUm9vbUxhYmVsfVxuICAgICAgICAgICAgICAgICAgICBhZGRSb29tQ29udGV4dE1lbnU9e2Flc3RoZXRpY3MuYWRkUm9vbUNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgICAgICBpc01pbmltaXplZD17dGhpcy5wcm9wcy5pc01pbmltaXplZH1cbiAgICAgICAgICAgICAgICAgICAgb25SZXNpemU9e3RoaXMucHJvcHMub25SZXNpemV9XG4gICAgICAgICAgICAgICAgICAgIHNob3dTa2VsZXRvbj17c2hvd1NrZWxldG9ufVxuICAgICAgICAgICAgICAgICAgICBleHRyYVRpbGVzPXtleHRyYVRpbGVzfVxuICAgICAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgICAgICAgICAgYWx3YXlzVmlzaWJsZT17QUxXQVlTX1ZJU0lCTEVfVEFHUy5pbmNsdWRlcyhvcmRlcmVkVGFnSWQpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IGNsaS5nZXRVc2VySWQoKTtcblxuICAgICAgICBsZXQgZXhwbG9yZVByb21wdDogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5pc01pbmltaXplZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNOYW1lRmlsdGVyaW5nKSB7XG4gICAgICAgICAgICAgICAgZXhwbG9yZVByb21wdCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfZXhwbG9yZVByb21wdFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PntfdChcIkNhbid0IHNlZSB3aGF0IHlvdeKAmXJlIGxvb2tpbmcgZm9yP1wiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2V4cGxvcmVQcm9tcHRfc3RhcnRDaGF0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TdGFydENoYXR9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlN0YXJ0IGEgbmV3IGNoYXRcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2V4cGxvcmVQcm9tcHRfZXhwbG9yZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRXhwbG9yZX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmFjdGl2ZVNwYWNlID8gX3QoXCJFeHBsb3JlIHJvb21zXCIpIDogX3QoXCJFeHBsb3JlIGFsbCBwdWJsaWMgcm9vbXNcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmFjdGl2ZVNwYWNlPy5jYW5JbnZpdGUodXNlcklkKSB8fCB0aGlzLnByb3BzLmFjdGl2ZVNwYWNlPy5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGV4cGxvcmVQcm9tcHQgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2V4cGxvcmVQcm9tcHRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj57IF90KFwiUXVpY2sgYWN0aW9uc1wiKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5hY3RpdmVTcGFjZS5jYW5JbnZpdGUodXNlcklkKSAmJiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfZXhwbG9yZVByb21wdF9zcGFjZUludml0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU3BhY2VJbnZpdGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiSW52aXRlIHBlb3BsZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPiB9XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5hY3RpdmVTcGFjZS5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCIgJiYgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2V4cGxvcmVQcm9tcHRfc3BhY2VFeHBsb3JlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25FeHBsb3JlfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJFeHBsb3JlIHJvb21zXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKE9iamVjdC52YWx1ZXModGhpcy5zdGF0ZS5zdWJsaXN0cykuc29tZShsaXN0ID0+IGxpc3QubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmZpbHRlcmVkTGlzdHMgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLnVuZmlsdGVyZWRMaXN0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuZmlsdGVyZWRSb29tcyA9IHVuZmlsdGVyZWRMaXN0c1tEZWZhdWx0VGFnSUQuVW50YWdnZWRdIHx8IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuZmlsdGVyZWRIaXN0b3JpY2FsID0gdW5maWx0ZXJlZExpc3RzW0RlZmF1bHRUYWdJRC5BcmNoaXZlZF0gfHwgW107XG4gICAgICAgICAgICAgICAgY29uc3QgdW5maWx0ZXJlZEZhdm91cml0ZSA9IHVuZmlsdGVyZWRMaXN0c1tEZWZhdWx0VGFnSUQuRmF2b3VyaXRlXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAvLyBzaG93IGEgcHJvbXB0IHRvIGpvaW4vY3JlYXRlIHJvb21zIGlmIHRoZSB1c2VyIGlzIGluIDAgcm9vbXMgYW5kIG5vIGhpc3RvcmljYWxcbiAgICAgICAgICAgICAgICBpZiAodW5maWx0ZXJlZFJvb21zLmxlbmd0aCA8IDEgJiYgdW5maWx0ZXJlZEhpc3RvcmljYWwgPCAxICYmIHVuZmlsdGVyZWRGYXZvdXJpdGUgPCAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGxvcmVQcm9tcHQgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2V4cGxvcmVQcm9tcHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+e190KFwiVXNlIHRoZSArIHRvIG1ha2UgYSBuZXcgcm9vbSBvciBleHBsb3JlIGV4aXN0aW5nIG9uZXMgYmVsb3dcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2V4cGxvcmVQcm9tcHRfc3RhcnRDaGF0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblN0YXJ0Q2hhdH1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJTdGFydCBhIG5ldyBjaGF0XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tTGlzdF9leHBsb3JlUHJvbXB0X2V4cGxvcmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRXhwbG9yZX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJFeHBsb3JlIGFsbCBwdWJsaWMgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdWJsaXN0cyA9IHRoaXMucmVuZGVyU3VibGlzdHMoKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSb3ZpbmdUYWJJbmRleFByb3ZpZGVyIGhhbmRsZUhvbWVFbmQ9e3RydWV9IG9uS2V5RG93bj17dGhpcy5wcm9wcy5vbktleURvd259PlxuICAgICAgICAgICAgICAgIHsoe29uS2V5RG93bkhhbmRsZXJ9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5wcm9wcy5vbkJsdXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd249e29uS2V5RG93bkhhbmRsZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tTGlzdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwidHJlZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIlJvb21zXCIpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c3VibGlzdHN9XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZXhwbG9yZVByb21wdH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvUm92aW5nVGFiSW5kZXhQcm92aWRlcj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
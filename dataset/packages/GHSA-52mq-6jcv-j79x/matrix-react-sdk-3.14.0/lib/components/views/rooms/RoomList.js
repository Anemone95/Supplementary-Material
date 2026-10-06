"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _RoomListStore = _interopRequireWildcard(require("../../../stores/room-list/RoomListStore"));

var _RoomViewStore = _interopRequireDefault(require("../../../stores/RoomViewStore"));

var _models = require("../../../stores/room-list/models");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RoomSublist = _interopRequireDefault(require("./RoomSublist"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _GroupAvatar = _interopRequireDefault(require("../avatars/GroupAvatar"));

var _TemporaryTile = _interopRequireDefault(require("./TemporaryTile"));

var _StaticNotificationState = require("../../../stores/notifications/StaticNotificationState");

var _NotificationColor = require("../../../stores/notifications/NotificationColor");

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

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018 Vector Creations Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const TAG_ORDER
/*: TagID[]*/
= [_models.DefaultTagID.Invite, _models.DefaultTagID.Favourite, _models.DefaultTagID.DM, _models.DefaultTagID.Untagged, // -- Custom Tags Placeholder --
_models.DefaultTagID.LowPriority, _models.DefaultTagID.ServerNotice, _models.DefaultTagID.Archived];
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
  return /*#__PURE__*/React.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
    first: true
  }, /*#__PURE__*/React.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
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
  }), /*#__PURE__*/React.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
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
      return /*#__PURE__*/React.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        first: true
      }, /*#__PURE__*/React.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
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
      }), /*#__PURE__*/React.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
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

class RoomList extends React.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "customTagStoreRef", void 0);
    (0, _defineProperty2.default)(this, "tagAesthetics", void 0);
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
      /*: Room*/
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
    this.state = {
      sublists: {},
      isNameFiltering: !!_RoomListStore.default.instance.getFirstNameFilterCondition()
    }; // shallow-copy from the template as we need to make modifications to it

    this.tagAesthetics = (0, _objects.objectShallowClone)(TAG_AESTHETICS);
    this.updateDmAddRoomAction();
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentDidMount()
  /*: void*/
  {
    _RoomListStore.default.instance.on(_RoomListStore.LISTS_UPDATE_EVENT, this.updateLists);

    this.customTagStoreRef = _CustomRoomTagStore.default.addListener(this.updateLists);
    this.updateLists(); // trigger the first update
  }

  componentWillUnmount() {
    _RoomListStore.default.instance.off(_RoomListStore.LISTS_UPDATE_EVENT, this.updateLists);

    _dispatcher.default.unregister(this.dispatcherRef);

    if (this.customTagStoreRef) this.customTagStoreRef.remove();
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

  renderCommunityInvites()
  /*: TemporaryTile[]*/
  {
    // TODO: Put community invites in a more sensible place (not in the room list)
    // See https://github.com/vector-im/element-web/issues/14456
    return _MatrixClientPeg.MatrixClientPeg.get().getGroups().filter(g => {
      return g.myMembership === 'invite';
    }).map(g => {
      const avatar = /*#__PURE__*/React.createElement(_GroupAvatar.default, {
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

      return /*#__PURE__*/React.createElement(_TemporaryTile.default, {
        isMinimized: this.props.isMinimized,
        isSelected: false,
        displayName: g.name,
        avatar: avatar,
        notificationState: _StaticNotificationState.StaticNotificationState.forSymbol("!", _NotificationColor.NotificationColor.Red),
        onClick: openGroup,
        key: `temporaryGroupTile_${g.groupId}`
      });
    });
  }

  renderSublists()
  /*: React.ReactElement[]*/
  {
    const components
    /*: React.ReactElement[]*/
    = [];
    const tagOrder = TAG_ORDER.reduce((p, c) => {
      if (c === CUSTOM_TAGS_BEFORE_TAG) {
        const customTags = Object.keys(this.state.sublists).filter(t => (0, _models.isCustomTag)(t));
        p.push(...customTags);
      }

      p.push(c);
      return p;
    }, []); // show a skeleton UI if the user is in no rooms and they are not filtering

    const showSkeleton = !this.state.isNameFiltering && Object.values(_RoomListStore.default.instance.unfilteredLists).every(list => !list?.length);

    for (const orderedTagId of tagOrder) {
      const orderedRooms = this.state.sublists[orderedTagId] || [];
      const extraTiles = orderedTagId === _models.DefaultTagID.Invite ? this.renderCommunityInvites() : null;
      const totalTiles = orderedRooms.length + (extraTiles ? extraTiles.length : 0);

      if (totalTiles === 0 && !ALWAYS_VISIBLE_TAGS.includes(orderedTagId)) {
        continue; // skip tag - not needed
      }

      const aesthetics
      /*: ITagAesthetics*/
      = (0, _models.isCustomTag)(orderedTagId) ? customTagAesthetics(orderedTagId) : this.tagAesthetics[orderedTagId];
      if (!aesthetics) throw new Error(`Tag ${orderedTagId} does not have aesthetics`);
      components.push( /*#__PURE__*/React.createElement(_RoomSublist.default, {
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
        extraBadTilesThatShouldntExist: extraTiles
      }));
    }

    return components;
  }

  render() {
    let explorePrompt
    /*: JSX.Element*/
    ;

    if (!this.props.isMinimized) {
      if (this.state.isNameFiltering) {
        explorePrompt = /*#__PURE__*/React.createElement("div", {
          className: "mx_RoomList_explorePrompt"
        }, /*#__PURE__*/React.createElement("div", null, (0, _languageHandler._t)("Can't see what you’re looking for?")), /*#__PURE__*/React.createElement(_AccessibleButton.default, {
          className: "mx_RoomList_explorePrompt_startChat",
          kind: "link",
          onClick: this.onStartChat
        }, (0, _languageHandler._t)("Start a new chat")), /*#__PURE__*/React.createElement(_AccessibleButton.default, {
          className: "mx_RoomList_explorePrompt_explore",
          kind: "link",
          onClick: this.onExplore
        }, (0, _languageHandler._t)("Explore all public rooms")));
      } else if (Object.values(this.state.sublists).some(list => list.length > 0)) {
        const unfilteredLists = _RoomListStore.default.instance.unfilteredLists;
        const unfilteredRooms = unfilteredLists[_models.DefaultTagID.Untagged] || [];
        const unfilteredHistorical = unfilteredLists[_models.DefaultTagID.Archived] || [];
        const unfilteredFavourite = unfilteredLists[_models.DefaultTagID.Favourite] || []; // show a prompt to join/create rooms if the user is in 0 rooms and no historical

        if (unfilteredRooms.length < 1 && unfilteredHistorical < 1 && unfilteredFavourite < 1) {
          explorePrompt = /*#__PURE__*/React.createElement("div", {
            className: "mx_RoomList_explorePrompt"
          }, /*#__PURE__*/React.createElement("div", null, (0, _languageHandler._t)("Use the + to make a new room or explore existing ones below")), /*#__PURE__*/React.createElement(_AccessibleButton.default, {
            className: "mx_RoomList_explorePrompt_startChat",
            kind: "link",
            onClick: this.onStartChat
          }, (0, _languageHandler._t)("Start a new chat")), /*#__PURE__*/React.createElement(_AccessibleButton.default, {
            className: "mx_RoomList_explorePrompt_explore",
            kind: "link",
            onClick: this.onExplore
          }, (0, _languageHandler._t)("Explore all public rooms")));
        }
      }
    }

    const sublists = this.renderSublists();
    return /*#__PURE__*/React.createElement(_RovingTabIndex.RovingTabIndexProvider, {
      handleHomeEnd: true,
      onKeyDown: this.props.onKeyDown
    }, ({
      onKeyDownHandler
    }) => /*#__PURE__*/React.createElement("div", {
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
      onKeyDown: onKeyDownHandler,
      className: "mx_RoomList",
      role: "tree",
      "aria-label": (0, _languageHandler._t)("Rooms")
    }, sublists, explorePrompt));
  }

}

exports.default = RoomList;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21MaXN0LnRzeCJdLCJuYW1lcyI6WyJUQUdfT1JERVIiLCJEZWZhdWx0VGFnSUQiLCJJbnZpdGUiLCJGYXZvdXJpdGUiLCJETSIsIlVudGFnZ2VkIiwiTG93UHJpb3JpdHkiLCJTZXJ2ZXJOb3RpY2UiLCJBcmNoaXZlZCIsIkNVU1RPTV9UQUdTX0JFRk9SRV9UQUciLCJBTFdBWVNfVklTSUJMRV9UQUdTIiwiZG1PbkFkZFJvb20iLCJkaXNwYXRjaGVyIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsImRtQWRkUm9vbUNvbnRleHRNZW51Iiwib25GaW5pc2hlZCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImZpcmUiLCJBY3Rpb24iLCJPcGVuRGlhbFBhZCIsIlRBR19BRVNUSEVUSUNTIiwic2VjdGlvbkxhYmVsIiwiaXNJbnZpdGUiLCJkZWZhdWx0SGlkZGVuIiwiYWRkUm9vbUxhYmVsIiwiYWRkUm9vbUNvbnRleHRNZW51IiwiQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUiLCJpbnN0YW5jZSIsImdldFNlbGVjdGVkQ29tbXVuaXR5SWQiLCJWaWV3Um9vbURpcmVjdG9yeSIsImN1c3RvbVRhZ0Flc3RoZXRpY3MiLCJ0YWdJZCIsInN0YXJ0c1dpdGgiLCJzdWJzdHJpbmciLCJzZWN0aW9uTGFiZWxSYXciLCJSb29tTGlzdCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJwYXlsb2FkIiwiVmlld1Jvb21EZWx0YSIsInZpZXdSb29tRGVsdGFQYXlsb2FkIiwiY3VycmVudFJvb21JZCIsIlJvb21WaWV3U3RvcmUiLCJnZXRSb29tSWQiLCJyb29tIiwiZ2V0Um9vbURlbHRhIiwiZGVsdGEiLCJ1bnJlYWQiLCJkaXMiLCJyb29tX2lkIiwicm9vbUlkIiwic2hvd19yb29tX3RpbGUiLCJQc3RuU3VwcG9ydFVwZGF0ZWQiLCJ1cGRhdGVEbUFkZFJvb21BY3Rpb24iLCJ1cGRhdGVMaXN0cyIsImxpc3RzIiwiUm9vbUxpc3RTdG9yZSIsIm9yZGVyZWRMaXN0cyIsInJvb21zIiwiZm9yRWFjaCIsInQiLCJsaXN0Um9vbXMiLCJmaWx0ZXIiLCJyIiwic3RhdGUiLCJSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSIsImdldFJvb21TdGF0ZSIsImlzVW5yZWFkIiwicHVzaCIsImN1cnJlbnRJbmRleCIsImZpbmRJbmRleCIsInNsaWNlIiwibGVuZ3RoIiwibmV3TGlzdHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJjb25zb2xlIiwibG9nIiwicHJldmlvdXNMaXN0SWRzIiwiT2JqZWN0Iiwia2V5cyIsInN1Ymxpc3RzIiwibmV3TGlzdElkcyIsIkN1c3RvbVJvb21UYWdTdG9yZSIsImdldFRhZ3MiLCJpc05hbWVGaWx0ZXJpbmciLCJnZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24iLCJkb1VwZGF0ZSIsIm9sZFJvb21zIiwibmV3Um9vbXMiLCJuZXdTdWJsaXN0cyIsImsiLCJ2Iiwic2V0U3RhdGUiLCJvblJlc2l6ZSIsImluaXRpYWxUZXh0Iiwic2VhcmNoIiwidGFnQWVzdGhldGljcyIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsIkxJU1RTX1VQREFURV9FVkVOVCIsImN1c3RvbVRhZ1N0b3JlUmVmIiwiYWRkTGlzdGVuZXIiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInVucmVnaXN0ZXIiLCJyZW1vdmUiLCJkbVRhZ0Flc3RoZXRpY3MiLCJDYWxsSGFuZGxlciIsInNoYXJlZEluc3RhbmNlIiwiZ2V0U3VwcG9ydHNQc3RuUHJvdG9jb2wiLCJvbkFkZFJvb20iLCJyZW5kZXJDb21tdW5pdHlJbnZpdGVzIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0R3JvdXBzIiwiZyIsIm15TWVtYmVyc2hpcCIsIm1hcCIsImF2YXRhciIsImdyb3VwSWQiLCJuYW1lIiwiYXZhdGFyVXJsIiwib3Blbkdyb3VwIiwiZ3JvdXBfaWQiLCJpc01pbmltaXplZCIsIlN0YXRpY05vdGlmaWNhdGlvblN0YXRlIiwiZm9yU3ltYm9sIiwiTm90aWZpY2F0aW9uQ29sb3IiLCJSZWQiLCJyZW5kZXJTdWJsaXN0cyIsImNvbXBvbmVudHMiLCJ0YWdPcmRlciIsInJlZHVjZSIsInAiLCJjIiwiY3VzdG9tVGFncyIsInNob3dTa2VsZXRvbiIsInZhbHVlcyIsInVuZmlsdGVyZWRMaXN0cyIsImV2ZXJ5IiwibGlzdCIsIm9yZGVyZWRUYWdJZCIsIm9yZGVyZWRSb29tcyIsImV4dHJhVGlsZXMiLCJ0b3RhbFRpbGVzIiwiaW5jbHVkZXMiLCJhZXN0aGV0aWNzIiwiRXJyb3IiLCJyZW5kZXIiLCJleHBsb3JlUHJvbXB0Iiwib25TdGFydENoYXQiLCJvbkV4cGxvcmUiLCJzb21lIiwidW5maWx0ZXJlZFJvb21zIiwidW5maWx0ZXJlZEhpc3RvcmljYWwiLCJ1bmZpbHRlcmVkRmF2b3VyaXRlIiwib25LZXlEb3duIiwib25LZXlEb3duSGFuZGxlciIsIm9uRm9jdXMiLCJvbkJsdXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBSUE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFnREEsTUFBTUE7QUFBa0I7QUFBQSxFQUFHLENBQ3ZCQyxxQkFBYUMsTUFEVSxFQUV2QkQscUJBQWFFLFNBRlUsRUFHdkJGLHFCQUFhRyxFQUhVLEVBSXZCSCxxQkFBYUksUUFKVSxFQU12QjtBQUVBSixxQkFBYUss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QUFBLFNBQVMsRUFBQyxxQ0FEZDtBQUVJLFlBQUEsSUFBSSxFQUFDLE1BRlQ7QUFHSSxZQUFBLE9BQU8sRUFBRSxLQUFLQztBQUhsQixhQUtLLHlCQUFHLGtCQUFILENBTEwsQ0FGWSxlQVNaLG9CQUFDLHlCQUFEO0FBQ0ksWUFBQSxTQUFTLEVBQUMsbUNBRGQ7QUFFSSxZQUFBLElBQUksRUFBQyxNQUZUO0FBR0ksWUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFIbEIsYUFLSyx5QkFBRywwQkFBSCxDQUxMLENBVFksQ0FBaEI7QUFpQkg7QUFDSjtBQUNKOztBQUVELFVBQU0xRSxRQUFRLEdBQUcsS0FBS29ELGNBQUwsRUFBakI7QUFDQSx3QkFDSSxvQkFBQyxzQ0FBRDtBQUF3QixNQUFBLGFBQWEsRUFBRSxJQUF2QztBQUE2QyxNQUFBLFNBQVMsRUFBRSxLQUFLaEcsS0FBTCxDQUFXMkg7QUFBbkUsT0FDSyxDQUFDO0FBQUNDLE1BQUFBO0FBQUQsS0FBRCxrQkFDRztBQUNJLE1BQUEsT0FBTyxFQUFFLEtBQUs1SCxLQUFMLENBQVc2SCxPQUR4QjtBQUVJLE1BQUEsTUFBTSxFQUFFLEtBQUs3SCxLQUFMLENBQVc4SCxNQUZ2QjtBQUdJLE1BQUEsU0FBUyxFQUFFRixnQkFIZjtBQUlJLE1BQUEsU0FBUyxFQUFDLGFBSmQ7QUFLSSxNQUFBLElBQUksRUFBQyxNQUxUO0FBTUksb0JBQVkseUJBQUcsT0FBSDtBQU5oQixPQVFLaEYsUUFSTCxFQVNLd0UsYUFUTCxDQUZSLENBREo7QUFpQkg7O0FBaFNxRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTggVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBEaXNwYXRjaGVyIH0gZnJvbSBcImZsdXhcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IFJvdmluZ1RhYkluZGV4UHJvdmlkZXIgfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9Sb3ZpbmdUYWJJbmRleFwiO1xuaW1wb3J0IHsgUmVzaXplTm90aWZpZXIgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvUmVzaXplTm90aWZpZXJcIjtcbmltcG9ydCBSb29tTGlzdFN0b3JlLCB7IExJU1RTX1VQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0U3RvcmVcIjtcbmltcG9ydCBSb29tVmlld1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvUm9vbVZpZXdTdG9yZVwiO1xuaW1wb3J0IHsgSVRhZ01hcCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvbW9kZWxzXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQsIGlzQ3VzdG9tVGFnLCBUYWdJRCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L21vZGVsc1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IFJvb21TdWJsaXN0IGZyb20gXCIuL1Jvb21TdWJsaXN0XCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBHcm91cEF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9Hcm91cEF2YXRhclwiO1xuaW1wb3J0IFRlbXBvcmFyeVRpbGUgZnJvbSBcIi4vVGVtcG9yYXJ5VGlsZVwiO1xuaW1wb3J0IHsgU3RhdGljTm90aWZpY2F0aW9uU3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvU3RhdGljTm90aWZpY2F0aW9uU3RhdGVcIjtcbmltcG9ydCB7IE5vdGlmaWNhdGlvbkNvbG9yIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL05vdGlmaWNhdGlvbkNvbG9yXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBWaWV3Um9vbURlbHRhUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tRGVsdGFQYXlsb2FkXCI7XG5pbXBvcnQgeyBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Sb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZVwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBDdXN0b21Sb29tVGFnU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9DdXN0b21Sb29tVGFnU3RvcmVcIjtcbmltcG9ydCB7IGFycmF5RmFzdENsb25lLCBhcnJheUhhc0RpZmYgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5pbXBvcnQgeyBvYmplY3RTaGFsbG93Q2xvbmUsIG9iamVjdFdpdGhPbmx5IH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL29iamVjdHNcIjtcbmltcG9ydCB7IEljb25pemVkQ29udGV4dE1lbnVPcHRpb24sIEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IH0gZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IENvbW11bml0eVByb3RvdHlwZVN0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Db21tdW5pdHlQcm90b3R5cGVTdG9yZVwiO1xuaW1wb3J0IENhbGxIYW5kbGVyIGZyb20gXCIuLi8uLi8uLi9DYWxsSGFuZGxlclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBvbktleURvd246IChldjogUmVhY3QuS2V5Ym9hcmRFdmVudCkgPT4gdm9pZDtcbiAgICBvbkZvY3VzOiAoZXY6IFJlYWN0LkZvY3VzRXZlbnQpID0+IHZvaWQ7XG4gICAgb25CbHVyOiAoZXY6IFJlYWN0LkZvY3VzRXZlbnQpID0+IHZvaWQ7XG4gICAgb25SZXNpemU6ICgpID0+IHZvaWQ7XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuICAgIGlzTWluaW1pemVkOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzdWJsaXN0czogSVRhZ01hcDtcbiAgICBpc05hbWVGaWx0ZXJpbmc6IGJvb2xlYW47XG59XG5cbmNvbnN0IFRBR19PUkRFUjogVGFnSURbXSA9IFtcbiAgICBEZWZhdWx0VGFnSUQuSW52aXRlLFxuICAgIERlZmF1bHRUYWdJRC5GYXZvdXJpdGUsXG4gICAgRGVmYXVsdFRhZ0lELkRNLFxuICAgIERlZmF1bHRUYWdJRC5VbnRhZ2dlZCxcblxuICAgIC8vIC0tIEN1c3RvbSBUYWdzIFBsYWNlaG9sZGVyIC0tXG5cbiAgICBEZWZhdWx0VGFnSUQuTG93UHJpb3JpdHksXG4gICAgRGVmYXVsdFRhZ0lELlNlcnZlck5vdGljZSxcbiAgICBEZWZhdWx0VGFnSUQuQXJjaGl2ZWQsXG5dO1xuY29uc3QgQ1VTVE9NX1RBR1NfQkVGT1JFX1RBRyA9IERlZmF1bHRUYWdJRC5Mb3dQcmlvcml0eTtcbmNvbnN0IEFMV0FZU19WSVNJQkxFX1RBR1M6IFRhZ0lEW10gPSBbXG4gICAgRGVmYXVsdFRhZ0lELkRNLFxuICAgIERlZmF1bHRUYWdJRC5VbnRhZ2dlZCxcbl07XG5cbmludGVyZmFjZSBJVGFnQWVzdGhldGljcyB7XG4gICAgc2VjdGlvbkxhYmVsOiBzdHJpbmc7XG4gICAgc2VjdGlvbkxhYmVsUmF3Pzogc3RyaW5nO1xuICAgIGFkZFJvb21MYWJlbD86IHN0cmluZztcbiAgICBvbkFkZFJvb20/OiAoZGlzcGF0Y2hlcj86IERpc3BhdGNoZXI8QWN0aW9uUGF5bG9hZD4pID0+IHZvaWQ7XG4gICAgYWRkUm9vbUNvbnRleHRNZW51PzogKG9uRmluaXNoZWQ6ICgpID0+IHZvaWQpID0+IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICBpc0ludml0ZTogYm9vbGVhbjtcbiAgICBkZWZhdWx0SGlkZGVuOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVRhZ0Flc3RoZXRpY3NNYXAge1xuICAgIC8vIEB0cy1pZ25vcmUgLSBUUyB3YW50cyB0aGlzIHRvIGJlIGEgc3RyaW5nIGJ1dCB3ZSBrbm93IGJldHRlclxuICAgIFt0YWdJZDogVGFnSURdOiBJVGFnQWVzdGhldGljcztcbn1cblxuLy8gSWYgd2UgaGF2ZSBubyBkaWFsZXIgc3VwcG9ydCwgd2UganVzdCBzaG93IHRoZSBjcmVhdGUgY2hhdCBkaWFsb2dcbmNvbnN0IGRtT25BZGRSb29tID0gKGRpc3BhdGNoZXI/OiBEaXNwYXRjaGVyPEFjdGlvblBheWxvYWQ+KSA9PiB7XG4gICAgKGRpc3BhdGNoZXIgfHwgZGVmYXVsdERpc3BhdGNoZXIpLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X2NyZWF0ZV9jaGF0J30pO1xufTtcblxuLy8gSWYgd2UgaGF2ZSBkaWFsZXIgc3VwcG9ydCwgc2hvdyBhIGNvbnRleHQgbWVudSBzbyB0aGUgdXNlciBjYW4gcGljayBiZXR3ZWVuXG4vLyB0aGUgZGlhbGVyIGFuZCB0aGUgY3JlYXRlIGNoYXQgZGlhbG9nXG5jb25zdCBkbUFkZFJvb21Db250ZXh0TWVudSA9IChvbkZpbmlzaGVkOiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgcmV0dXJuIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCBmaXJzdD5cbiAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgIGxhYmVsPXtfdChcIlN0YXJ0IGEgQ29udmVyc2F0aW9uXCIpfVxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2ljb25QbHVzXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IFwidmlld19jcmVhdGVfY2hhdFwifSk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgbGFiZWw9e190KFwiT3BlbiBkaWFsIHBhZFwiKX1cbiAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uRGlhbHBhZFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5maXJlKEFjdGlvbi5PcGVuRGlhbFBhZCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+O1xufTtcblxuY29uc3QgVEFHX0FFU1RIRVRJQ1M6IElUYWdBZXN0aGV0aWNzTWFwID0ge1xuICAgIFtEZWZhdWx0VGFnSUQuSW52aXRlXToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIkludml0ZXNcIiksXG4gICAgICAgIGlzSW52aXRlOiB0cnVlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICB9LFxuICAgIFtEZWZhdWx0VGFnSUQuRmF2b3VyaXRlXToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIkZhdm91cml0ZXNcIiksXG4gICAgICAgIGlzSW52aXRlOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdEhpZGRlbjogZmFsc2UsXG4gICAgfSxcbiAgICBbRGVmYXVsdFRhZ0lELkRNXToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIlBlb3BsZVwiKSxcbiAgICAgICAgaXNJbnZpdGU6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICAgICAgYWRkUm9vbUxhYmVsOiBfdGQoXCJTdGFydCBjaGF0XCIpLFxuICAgICAgICAvLyBFaXRoZXIgb25BZGRSb29tIG9yIGFkZFJvb21Db250ZXh0TWVudSBhcmUgc2V0IGRlcGVuZGluZyBvbiB3aGV0aGVyIHdlXG4gICAgICAgIC8vIGhhdmUgZGlhbGVyIHN1cHBvcnQuXG4gICAgfSxcbiAgICBbRGVmYXVsdFRhZ0lELlVudGFnZ2VkXToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIlJvb21zXCIpLFxuICAgICAgICBpc0ludml0ZTogZmFsc2UsXG4gICAgICAgIGRlZmF1bHRIaWRkZW46IGZhbHNlLFxuICAgICAgICBhZGRSb29tTGFiZWw6IF90ZChcIkFkZCByb29tXCIpLFxuICAgICAgICBhZGRSb29tQ29udGV4dE1lbnU6IChvbkZpbmlzaGVkOiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IGZpcnN0PlxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkNyZWF0ZSBuZXcgcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2ljb25QbHVzXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBcInZpZXdfY3JlYXRlX3Jvb21cIn0pO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e0NvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5SWQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIkV4cGxvcmUgY29tbXVuaXR5IHJvb21zXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiRXhwbG9yZSBwdWJsaWMgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uRXhwbG9yZVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZmlyZShBY3Rpb24uVmlld1Jvb21EaXJlY3RvcnkpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PjtcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIFtEZWZhdWx0VGFnSUQuTG93UHJpb3JpdHldOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiTG93IHByaW9yaXR5XCIpLFxuICAgICAgICBpc0ludml0ZTogZmFsc2UsXG4gICAgICAgIGRlZmF1bHRIaWRkZW46IGZhbHNlLFxuICAgIH0sXG4gICAgW0RlZmF1bHRUYWdJRC5TZXJ2ZXJOb3RpY2VdOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiU3lzdGVtIEFsZXJ0c1wiKSxcbiAgICAgICAgaXNJbnZpdGU6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICB9LFxuXG4gICAgLy8gVE9ETzogUmVwbGFjZSB3aXRoIGFyY2hpdmVkIHZpZXc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MDM4XG4gICAgW0RlZmF1bHRUYWdJRC5BcmNoaXZlZF06IHtcbiAgICAgICAgc2VjdGlvbkxhYmVsOiBfdGQoXCJIaXN0b3JpY2FsXCIpLFxuICAgICAgICBpc0ludml0ZTogZmFsc2UsXG4gICAgICAgIGRlZmF1bHRIaWRkZW46IHRydWUsXG4gICAgfSxcbn07XG5cbmZ1bmN0aW9uIGN1c3RvbVRhZ0Flc3RoZXRpY3ModGFnSWQ6IFRhZ0lEKTogSVRhZ0Flc3RoZXRpY3Mge1xuICAgIGlmICh0YWdJZC5zdGFydHNXaXRoKFwidS5cIikpIHtcbiAgICAgICAgdGFnSWQgPSB0YWdJZC5zdWJzdHJpbmcoMik7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiQ3VzdG9tIFRhZ1wiKSxcbiAgICAgICAgc2VjdGlvbkxhYmVsUmF3OiB0YWdJZCxcbiAgICAgICAgaXNJbnZpdGU6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tTGlzdCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY7XG4gICAgcHJpdmF0ZSBjdXN0b21UYWdTdG9yZVJlZjtcbiAgICBwcml2YXRlIHRhZ0Flc3RoZXRpY3M6IElUYWdBZXN0aGV0aWNzTWFwO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHN1Ymxpc3RzOiB7fSxcbiAgICAgICAgICAgIGlzTmFtZUZpbHRlcmluZzogISFSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldEZpcnN0TmFtZUZpbHRlckNvbmRpdGlvbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHNoYWxsb3ctY29weSBmcm9tIHRoZSB0ZW1wbGF0ZSBhcyB3ZSBuZWVkIHRvIG1ha2UgbW9kaWZpY2F0aW9ucyB0byBpdFxuICAgICAgICB0aGlzLnRhZ0Flc3RoZXRpY3MgPSBvYmplY3RTaGFsbG93Q2xvbmUoVEFHX0FFU1RIRVRJQ1MpO1xuICAgICAgICB0aGlzLnVwZGF0ZURtQWRkUm9vbUFjdGlvbigpO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRlZmF1bHREaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vbihMSVNUU19VUERBVEVfRVZFTlQsIHRoaXMudXBkYXRlTGlzdHMpO1xuICAgICAgICB0aGlzLmN1c3RvbVRhZ1N0b3JlUmVmID0gQ3VzdG9tUm9vbVRhZ1N0b3JlLmFkZExpc3RlbmVyKHRoaXMudXBkYXRlTGlzdHMpO1xuICAgICAgICB0aGlzLnVwZGF0ZUxpc3RzKCk7IC8vIHRyaWdnZXIgdGhlIGZpcnN0IHVwZGF0ZVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vZmYoTElTVFNfVVBEQVRFX0VWRU5ULCB0aGlzLnVwZGF0ZUxpc3RzKTtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBpZiAodGhpcy5jdXN0b21UYWdTdG9yZVJlZikgdGhpcy5jdXN0b21UYWdTdG9yZVJlZi5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZURtQWRkUm9vbUFjdGlvbigpIHtcbiAgICAgICAgY29uc3QgZG1UYWdBZXN0aGV0aWNzID0gb2JqZWN0U2hhbGxvd0Nsb25lKFRBR19BRVNUSEVUSUNTW0RlZmF1bHRUYWdJRC5ETV0pO1xuICAgICAgICBpZiAoQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRTdXBwb3J0c1BzdG5Qcm90b2NvbCgpKSB7XG4gICAgICAgICAgICBkbVRhZ0Flc3RoZXRpY3MuYWRkUm9vbUNvbnRleHRNZW51ID0gZG1BZGRSb29tQ29udGV4dE1lbnU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkbVRhZ0Flc3RoZXRpY3Mub25BZGRSb29tID0gZG1PbkFkZFJvb207XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRhZ0Flc3RoZXRpY3NbRGVmYXVsdFRhZ0lELkRNXSA9IGRtVGFnQWVzdGhldGljcztcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBBY3Rpb24uVmlld1Jvb21EZWx0YSkge1xuICAgICAgICAgICAgY29uc3Qgdmlld1Jvb21EZWx0YVBheWxvYWQgPSBwYXlsb2FkIGFzIFZpZXdSb29tRGVsdGFQYXlsb2FkO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFJvb21JZCA9IFJvb21WaWV3U3RvcmUuZ2V0Um9vbUlkKCk7XG4gICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5nZXRSb29tRGVsdGEoY3VycmVudFJvb21JZCwgdmlld1Jvb21EZWx0YVBheWxvYWQuZGVsdGEsIHZpZXdSb29tRGVsdGFQYXlsb2FkLnVucmVhZCk7XG4gICAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICBzaG93X3Jvb21fdGlsZTogdHJ1ZSwgLy8gdG8gbWFrZSBzdXJlIHRoZSByb29tIGdldHMgc2Nyb2xsZWQgaW50byB2aWV3XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09IEFjdGlvbi5Qc3RuU3VwcG9ydFVwZGF0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRG1BZGRSb29tQWN0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUxpc3RzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRSb29tRGVsdGEgPSAocm9vbUlkOiBzdHJpbmcsIGRlbHRhOiBudW1iZXIsIHVucmVhZCA9IGZhbHNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpc3RzID0gUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vcmRlcmVkTGlzdHM7XG4gICAgICAgIGNvbnN0IHJvb21zOiBSb29tID0gW107XG4gICAgICAgIFRBR19PUkRFUi5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgICAgbGV0IGxpc3RSb29tcyA9IGxpc3RzW3RdO1xuXG4gICAgICAgICAgICBpZiAodW5yZWFkKSB7XG4gICAgICAgICAgICAgICAgLy8gZmlsdGVyIHRvIG9ubHkgbm90aWZpY2F0aW9uIHJvb21zIChhbmQgb3VyIGN1cnJlbnQgYWN0aXZlIHJvb20gc28gd2UgY2FuIGluZGV4IHByb3Blcmx5KVxuICAgICAgICAgICAgICAgIGxpc3RSb29tcyA9IGxpc3RSb29tcy5maWx0ZXIociA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUucm9vbS5yb29tSWQgPT09IHJvb21JZCB8fCBzdGF0ZS5pc1VucmVhZDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcm9vbXMucHVzaCguLi5saXN0Um9vbXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSByb29tcy5maW5kSW5kZXgociA9PiByLnJvb21JZCA9PT0gcm9vbUlkKTtcbiAgICAgICAgLy8gdXNlIHNsaWNlIHRvIGFjY291bnQgZm9yIGxvb3BpbmcgYXJvdW5kIHRoZSBzdGFydFxuICAgICAgICBjb25zdCBbcm9vbV0gPSByb29tcy5zbGljZSgoY3VycmVudEluZGV4ICsgZGVsdGEpICUgcm9vbXMubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHJvb207XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlTGlzdHMgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0xpc3RzID0gUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vcmRlcmVkTGlzdHM7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibmV3IGxpc3RzXCIsIG5ld0xpc3RzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzTGlzdElkcyA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuc3VibGlzdHMpO1xuICAgICAgICBjb25zdCBuZXdMaXN0SWRzID0gT2JqZWN0LmtleXMobmV3TGlzdHMpLmZpbHRlcih0ID0+IHtcbiAgICAgICAgICAgIGlmICghaXNDdXN0b21UYWcodCkpIHJldHVybiB0cnVlOyAvLyBhbHdheXMgaW5jbHVkZSBub24tY3VzdG9tIHRhZ3NcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHRhZyBpcyBjdXN0b20gdGhvdWdoLCBvbmx5IGluY2x1ZGUgaXQgaWYgaXQgaXMgZW5hYmxlZFxuICAgICAgICAgICAgcmV0dXJuIEN1c3RvbVJvb21UYWdTdG9yZS5nZXRUYWdzKClbdF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGlzTmFtZUZpbHRlcmluZyA9ICEhUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5nZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24oKTtcbiAgICAgICAgbGV0IGRvVXBkYXRlID0gdGhpcy5zdGF0ZS5pc05hbWVGaWx0ZXJpbmcgIT09IGlzTmFtZUZpbHRlcmluZyB8fCBhcnJheUhhc0RpZmYocHJldmlvdXNMaXN0SWRzLCBuZXdMaXN0SWRzKTtcbiAgICAgICAgaWYgKCFkb1VwZGF0ZSkge1xuICAgICAgICAgICAgLy8gc28gd2UgZGlkbid0IGhhdmUgdGhlIHZpc2libGUgc3VibGlzdHMgY2hhbmdlLCBidXQgZGlkIHRoZSBjb250ZW50cyBvZiB0aG9zZVxuICAgICAgICAgICAgLy8gc3VibGlzdHMgY2hhbmdlIHNpZ25pZmljYW50bHkgZW5vdWdoIHRvIGJyZWFrIHRoZSBzdGlja3kgaGVhZGVycz8gUHJvYmFibHksIHNvXG4gICAgICAgICAgICAvLyBsZXQncyBjaGVjayB0aGUgbGVuZ3RoIG9mIGVhY2guXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhZ0lkIG9mIG5ld0xpc3RJZHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRSb29tcyA9IHRoaXMuc3RhdGUuc3VibGlzdHNbdGFnSWRdO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Jvb21zID0gbmV3TGlzdHNbdGFnSWRdO1xuICAgICAgICAgICAgICAgIGlmIChvbGRSb29tcy5sZW5ndGggIT09IG5ld1Jvb21zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBkb1VwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb1VwZGF0ZSkge1xuICAgICAgICAgICAgLy8gV2UgaGF2ZSB0byBicmVhayBvdXIgcmVmZXJlbmNlIHRvIHRoZSByb29tIGxpc3Qgc3RvcmUgaWYgd2Ugd2FudCB0byBiZSBhYmxlIHRvXG4gICAgICAgICAgICAvLyBkaWZmIHRoZSBvYmplY3QgZm9yIGNoYW5nZXMsIHNvIGRvIHRoYXQuXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gSVRhZ01hcCBpcyB0cy1pZ25vcmVkIHNvIHRoaXMgd2lsbCBoYXZlIHRvIGJlIHRvb1xuICAgICAgICAgICAgY29uc3QgbmV3U3VibGlzdHMgPSBvYmplY3RXaXRoT25seShuZXdMaXN0cywgbmV3TGlzdElkcyk7XG4gICAgICAgICAgICBjb25zdCBzdWJsaXN0cyA9IG9iamVjdFNoYWxsb3dDbG9uZShuZXdTdWJsaXN0cywgKGssIHYpID0+IGFycmF5RmFzdENsb25lKHYpKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c3VibGlzdHMsIGlzTmFtZUZpbHRlcmluZ30sICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVzaXplKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3RhcnRDaGF0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBpbml0aWFsVGV4dCA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0Rmlyc3ROYW1lRmlsdGVyQ29uZGl0aW9uKCk/LnNlYXJjaDtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInZpZXdfY3JlYXRlX2NoYXRcIiwgaW5pdGlhbFRleHQgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FeHBsb3JlID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBpbml0aWFsVGV4dCA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0Rmlyc3ROYW1lRmlsdGVyQ29uZGl0aW9uKCk/LnNlYXJjaDtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb21EaXJlY3RvcnksIGluaXRpYWxUZXh0IH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckNvbW11bml0eUludml0ZXMoKTogVGVtcG9yYXJ5VGlsZVtdIHtcbiAgICAgICAgLy8gVE9ETzogUHV0IGNvbW11bml0eSBpbnZpdGVzIGluIGEgbW9yZSBzZW5zaWJsZSBwbGFjZSAobm90IGluIHRoZSByb29tIGxpc3QpXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDQ1NlxuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldEdyb3VwcygpLmZpbHRlcihnID0+IHtcbiAgICAgICAgICAgIHJldHVybiBnLm15TWVtYmVyc2hpcCA9PT0gJ2ludml0ZSc7XG4gICAgICAgIH0pLm1hcChnID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGF2YXRhciA9IChcbiAgICAgICAgICAgICAgICA8R3JvdXBBdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBJZD17Zy5ncm91cElkfVxuICAgICAgICAgICAgICAgICAgICBncm91cE5hbWU9e2cubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBBdmF0YXJVcmw9e2cuYXZhdGFyVXJsfVxuICAgICAgICAgICAgICAgICAgICB3aWR0aD17MzJ9IGhlaWdodD17MzJ9IHJlc2l6ZU1ldGhvZD0nY3JvcCdcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZW5Hcm91cCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfZ3JvdXAnLFxuICAgICAgICAgICAgICAgICAgICBncm91cF9pZDogZy5ncm91cElkLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPFRlbXBvcmFyeVRpbGVcbiAgICAgICAgICAgICAgICAgICAgaXNNaW5pbWl6ZWQ9e3RoaXMucHJvcHMuaXNNaW5pbWl6ZWR9XG4gICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZT17Zy5uYW1lfVxuICAgICAgICAgICAgICAgICAgICBhdmF0YXI9e2F2YXRhcn1cbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uU3RhdGU9e1N0YXRpY05vdGlmaWNhdGlvblN0YXRlLmZvclN5bWJvbChcIiFcIiwgTm90aWZpY2F0aW9uQ29sb3IuUmVkKX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b3Blbkdyb3VwfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2B0ZW1wb3JhcnlHcm91cFRpbGVfJHtnLmdyb3VwSWR9YH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJTdWJsaXN0cygpOiBSZWFjdC5SZWFjdEVsZW1lbnRbXSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHM6IFJlYWN0LlJlYWN0RWxlbWVudFtdID0gW107XG5cbiAgICAgICAgY29uc3QgdGFnT3JkZXIgPSBUQUdfT1JERVIucmVkdWNlKChwLCBjKSA9PiB7XG4gICAgICAgICAgICBpZiAoYyA9PT0gQ1VTVE9NX1RBR1NfQkVGT1JFX1RBRykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbVRhZ3MgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLnN1Ymxpc3RzKVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHQgPT4gaXNDdXN0b21UYWcodCkpO1xuICAgICAgICAgICAgICAgIHAucHVzaCguLi5jdXN0b21UYWdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHAucHVzaChjKTtcbiAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9LCBbXSBhcyBUYWdJRFtdKTtcblxuICAgICAgICAvLyBzaG93IGEgc2tlbGV0b24gVUkgaWYgdGhlIHVzZXIgaXMgaW4gbm8gcm9vbXMgYW5kIHRoZXkgYXJlIG5vdCBmaWx0ZXJpbmdcbiAgICAgICAgY29uc3Qgc2hvd1NrZWxldG9uID0gIXRoaXMuc3RhdGUuaXNOYW1lRmlsdGVyaW5nICYmXG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKFJvb21MaXN0U3RvcmUuaW5zdGFuY2UudW5maWx0ZXJlZExpc3RzKS5ldmVyeShsaXN0ID0+ICFsaXN0Py5sZW5ndGgpO1xuXG4gICAgICAgIGZvciAoY29uc3Qgb3JkZXJlZFRhZ0lkIG9mIHRhZ09yZGVyKSB7XG4gICAgICAgICAgICBjb25zdCBvcmRlcmVkUm9vbXMgPSB0aGlzLnN0YXRlLnN1Ymxpc3RzW29yZGVyZWRUYWdJZF0gfHwgW107XG4gICAgICAgICAgICBjb25zdCBleHRyYVRpbGVzID0gb3JkZXJlZFRhZ0lkID09PSBEZWZhdWx0VGFnSUQuSW52aXRlID8gdGhpcy5yZW5kZXJDb21tdW5pdHlJbnZpdGVzKCkgOiBudWxsO1xuICAgICAgICAgICAgY29uc3QgdG90YWxUaWxlcyA9IG9yZGVyZWRSb29tcy5sZW5ndGggKyAoZXh0cmFUaWxlcyA/IGV4dHJhVGlsZXMubGVuZ3RoIDogMCk7XG4gICAgICAgICAgICBpZiAodG90YWxUaWxlcyA9PT0gMCAmJiAhQUxXQVlTX1ZJU0lCTEVfVEFHUy5pbmNsdWRlcyhvcmRlcmVkVGFnSWQpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7IC8vIHNraXAgdGFnIC0gbm90IG5lZWRlZFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBhZXN0aGV0aWNzOiBJVGFnQWVzdGhldGljcyA9IGlzQ3VzdG9tVGFnKG9yZGVyZWRUYWdJZClcbiAgICAgICAgICAgICAgICA/IGN1c3RvbVRhZ0Flc3RoZXRpY3Mob3JkZXJlZFRhZ0lkKVxuICAgICAgICAgICAgICAgIDogdGhpcy50YWdBZXN0aGV0aWNzW29yZGVyZWRUYWdJZF07XG4gICAgICAgICAgICBpZiAoIWFlc3RoZXRpY3MpIHRocm93IG5ldyBFcnJvcihgVGFnICR7b3JkZXJlZFRhZ0lkfSBkb2VzIG5vdCBoYXZlIGFlc3RoZXRpY3NgKTtcblxuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKDxSb29tU3VibGlzdFxuICAgICAgICAgICAgICAgIGtleT17YHN1Ymxpc3QtJHtvcmRlcmVkVGFnSWR9YH1cbiAgICAgICAgICAgICAgICB0YWdJZD17b3JkZXJlZFRhZ0lkfVxuICAgICAgICAgICAgICAgIGZvclJvb21zPXt0cnVlfVxuICAgICAgICAgICAgICAgIHN0YXJ0QXNIaWRkZW49e2Flc3RoZXRpY3MuZGVmYXVsdEhpZGRlbn1cbiAgICAgICAgICAgICAgICBsYWJlbD17YWVzdGhldGljcy5zZWN0aW9uTGFiZWxSYXcgPyBhZXN0aGV0aWNzLnNlY3Rpb25MYWJlbFJhdyA6IF90KGFlc3RoZXRpY3Muc2VjdGlvbkxhYmVsKX1cbiAgICAgICAgICAgICAgICBvbkFkZFJvb209e2Flc3RoZXRpY3Mub25BZGRSb29tfVxuICAgICAgICAgICAgICAgIGFkZFJvb21MYWJlbD17YWVzdGhldGljcy5hZGRSb29tTGFiZWwgPyBfdChhZXN0aGV0aWNzLmFkZFJvb21MYWJlbCkgOiBhZXN0aGV0aWNzLmFkZFJvb21MYWJlbH1cbiAgICAgICAgICAgICAgICBhZGRSb29tQ29udGV4dE1lbnU9e2Flc3RoZXRpY3MuYWRkUm9vbUNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgIGlzTWluaW1pemVkPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfVxuICAgICAgICAgICAgICAgIG9uUmVzaXplPXt0aGlzLnByb3BzLm9uUmVzaXplfVxuICAgICAgICAgICAgICAgIHNob3dTa2VsZXRvbj17c2hvd1NrZWxldG9ufVxuICAgICAgICAgICAgICAgIGV4dHJhQmFkVGlsZXNUaGF0U2hvdWxkbnRFeGlzdD17ZXh0cmFUaWxlc31cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb21wb25lbnRzO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGxldCBleHBsb3JlUHJvbXB0OiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmlzTWluaW1pemVkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc05hbWVGaWx0ZXJpbmcpIHtcbiAgICAgICAgICAgICAgICBleHBsb3JlUHJvbXB0ID0gPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tTGlzdF9leHBsb3JlUHJvbXB0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+e190KFwiQ2FuJ3Qgc2VlIHdoYXQgeW914oCZcmUgbG9va2luZyBmb3I/XCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfZXhwbG9yZVByb21wdF9zdGFydENoYXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblN0YXJ0Q2hhdH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiU3RhcnQgYSBuZXcgY2hhdFwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfZXhwbG9yZVByb21wdF9leHBsb3JlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25FeHBsb3JlfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJFeHBsb3JlIGFsbCBwdWJsaWMgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKE9iamVjdC52YWx1ZXModGhpcy5zdGF0ZS5zdWJsaXN0cykuc29tZShsaXN0ID0+IGxpc3QubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmZpbHRlcmVkTGlzdHMgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLnVuZmlsdGVyZWRMaXN0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuZmlsdGVyZWRSb29tcyA9IHVuZmlsdGVyZWRMaXN0c1tEZWZhdWx0VGFnSUQuVW50YWdnZWRdIHx8IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuZmlsdGVyZWRIaXN0b3JpY2FsID0gdW5maWx0ZXJlZExpc3RzW0RlZmF1bHRUYWdJRC5BcmNoaXZlZF0gfHwgW107XG4gICAgICAgICAgICAgICAgY29uc3QgdW5maWx0ZXJlZEZhdm91cml0ZSA9IHVuZmlsdGVyZWRMaXN0c1tEZWZhdWx0VGFnSUQuRmF2b3VyaXRlXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAvLyBzaG93IGEgcHJvbXB0IHRvIGpvaW4vY3JlYXRlIHJvb21zIGlmIHRoZSB1c2VyIGlzIGluIDAgcm9vbXMgYW5kIG5vIGhpc3RvcmljYWxcbiAgICAgICAgICAgICAgICBpZiAodW5maWx0ZXJlZFJvb21zLmxlbmd0aCA8IDEgJiYgdW5maWx0ZXJlZEhpc3RvcmljYWwgPCAxICYmIHVuZmlsdGVyZWRGYXZvdXJpdGUgPCAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGxvcmVQcm9tcHQgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2V4cGxvcmVQcm9tcHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+e190KFwiVXNlIHRoZSArIHRvIG1ha2UgYSBuZXcgcm9vbSBvciBleHBsb3JlIGV4aXN0aW5nIG9uZXMgYmVsb3dcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2V4cGxvcmVQcm9tcHRfc3RhcnRDaGF0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblN0YXJ0Q2hhdH1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJTdGFydCBhIG5ldyBjaGF0XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tTGlzdF9leHBsb3JlUHJvbXB0X2V4cGxvcmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRXhwbG9yZX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJFeHBsb3JlIGFsbCBwdWJsaWMgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdWJsaXN0cyA9IHRoaXMucmVuZGVyU3VibGlzdHMoKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSb3ZpbmdUYWJJbmRleFByb3ZpZGVyIGhhbmRsZUhvbWVFbmQ9e3RydWV9IG9uS2V5RG93bj17dGhpcy5wcm9wcy5vbktleURvd259PlxuICAgICAgICAgICAgICAgIHsoe29uS2V5RG93bkhhbmRsZXJ9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5wcm9wcy5vbkJsdXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd249e29uS2V5RG93bkhhbmRsZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tTGlzdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwidHJlZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIlJvb21zXCIpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c3VibGlzdHN9XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZXhwbG9yZVByb21wdH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvUm92aW5nVGFiSW5kZXhQcm92aWRlcj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
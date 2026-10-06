"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SpaceHierarchy = exports.useSpaceSummary = exports.HierarchyLevel = exports.showRoom = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _classnames = _interopRequireDefault(require("classnames"));

var _lodash = require("lodash");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _languageHandler = require("../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _BaseDialog = _interopRequireDefault(require("../views/dialogs/BaseDialog"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _SearchBox = _interopRequireDefault(require("./SearchBox"));

var _RoomAvatar = _interopRequireDefault(require("../views/avatars/RoomAvatar"));

var _RoomName = _interopRequireDefault(require("../views/elements/RoomName"));

var _useAsyncMemo = require("../../hooks/useAsyncMemo");

var _maps = require("../../utils/maps");

var _StyledCheckbox = _interopRequireDefault(require("../views/elements/StyledCheckbox"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

var _BaseAvatar = _interopRequireDefault(require("../views/avatars/BaseAvatar"));

var _Media = require("../../customisations/Media");

var _InfoTooltip = _interopRequireDefault(require("../views/elements/InfoTooltip"));

var _TextWithTooltip = _interopRequireDefault(require("../views/elements/TextWithTooltip"));

var _useStateToggle = require("../../hooks/useStateToggle");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const Tile
/*: React.FC<ITileProps>*/
= ({
  room,
  suggested,
  selected,
  hasPermissions,
  onToggleClick,
  onViewRoomClick,
  numChildRooms,
  children
}) => {
  const name = room.name || room.canonical_alias || room.aliases?.[0] || (room.room_type === _event.RoomType.Space ? (0, _languageHandler._t)("Unnamed Space") : (0, _languageHandler._t)("Unnamed Room"));
  const [showChildren, toggleShowChildren] = (0, _useStateToggle.useStateToggle)(true);

  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  const cliRoom = cli.getRoom(room.room_id);
  const myMembership = cliRoom?.getMyMembership();

  const onPreviewClick = () => onViewRoomClick(false);

  const onJoinClick = () => onViewRoomClick(true);

  let button;

  if (myMembership === "join") {
    button = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onPreviewClick,
      kind: "primary_outline"
    }, (0, _languageHandler._t)("View"));
  } else if (onJoinClick) {
    button = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onJoinClick,
      kind: "primary"
    }, (0, _languageHandler._t)("Join"));
  }

  let checkbox;

  if (onToggleClick) {
    if (hasPermissions) {
      checkbox = /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
        checked: !!selected,
        onChange: onToggleClick
      });
    } else {
      checkbox = /*#__PURE__*/_react.default.createElement(_TextWithTooltip.default, {
        tooltip: (0, _languageHandler._t)("You don't have permission"),
        onClick: ev => {
          ev.stopPropagation();
        }
      }, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
        disabled: true
      }));
    }
  }

  let url
  /*: string*/
  ;

  if (room.avatar_url) {
    url = (0, _Media.mediaFromMxc)(room.avatar_url).getSquareThumbnailHttp(20);
  }

  let description = (0, _languageHandler._t)("%(count)s members", {
    count: room.num_joined_members
  });

  if (numChildRooms) {
    description += " · " + (0, _languageHandler._t)("%(count)s rooms", {
      count: numChildRooms
    });
  }

  if (room.topic) {
    description += " · " + room.topic;
  }

  let suggestedSection;

  if (suggested) {
    suggestedSection = /*#__PURE__*/_react.default.createElement(_InfoTooltip.default, {
      tooltip: (0, _languageHandler._t)("This room is suggested as a good one to join")
    }, (0, _languageHandler._t)("Suggested"));
  }

  const content = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
    name: name,
    idName: room.room_id,
    url: url,
    width: 20,
    height: 20
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomDirectory_roomTile_name"
  }, name, suggestedSection), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomDirectory_roomTile_info"
  }, description), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomDirectory_actions"
  }, button, checkbox));

  let childToggle;
  let childSection;

  if (children) {
    // the chevron is purposefully a div rather than a button as it should be ignored for a11y
    childToggle = /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)("mx_SpaceRoomDirectory_subspace_toggle", {
        mx_SpaceRoomDirectory_subspace_toggle_shown: showChildren
      }),
      onClick: ev => {
        ev.stopPropagation();
        toggleShowChildren();
      }
    });

    if (showChildren) {
      childSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceRoomDirectory_subspace_children"
      }, children);
    }
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: (0, _classnames.default)("mx_SpaceRoomDirectory_roomTile", {
      mx_SpaceRoomDirectory_subspace: room.room_type === _event.RoomType.Space
    }),
    onClick: hasPermissions && onToggleClick ? onToggleClick : onPreviewClick
  }, content, childToggle), childSection);
};

const showRoom = (room
/*: ISpaceSummaryRoom*/
, viaServers
/*: string[]*/
, autoJoin = false) => {
  // Don't let the user view a room they won't be able to either peek or join:
  // fail earlier so they don't have to click back to the directory.
  if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
    if (!room.world_readable && !room.guest_can_join) {
      _dispatcher.default.dispatch({
        action: "require_registration"
      });

      return;
    }
  }

  const roomAlias = getDisplayAliasForRoom(room) || undefined;

  _dispatcher.default.dispatch({
    action: "view_room",
    auto_join: autoJoin,
    should_peek: true,
    _type: "room_directory",
    // instrumentation
    room_alias: roomAlias,
    room_id: room.room_id,
    via_servers: viaServers,
    oob_data: {
      avatarUrl: room.avatar_url,
      // XXX: This logic is duplicated from the JS SDK which would normally decide what the name is.
      name: room.name || roomAlias || (0, _languageHandler._t)("Unnamed room")
    }
  });
};

exports.showRoom = showRoom;

const HierarchyLevel = ({
  spaceId,
  rooms,
  relations,
  parents,
  selectedMap,
  onViewRoomClick,
  onToggleClick
}
/*: IHierarchyLevelProps*/
) => {
  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  const space = cli.getRoom(spaceId);
  const hasPermissions = space?.currentState.maySendStateEvent(_event.EventType.SpaceChild, cli.getUserId());
  const sortedChildren = (0, _lodash.sortBy)([...(relations.get(spaceId)?.values() || [])], ev => ev.content.order || null);
  const [subspaces, childRooms] = sortedChildren.reduce((result, ev
  /*: ISpaceSummaryEvent*/
  ) => {
    const roomId = ev.state_key;
    if (!rooms.has(roomId)) return result;
    result[rooms.get(roomId).room_type === _event.RoomType.Space ? 0 : 1].push(roomId);
    return result;
  }, [[], []]) || [[], []];
  const newParents = new Set(parents).add(spaceId);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, childRooms.map(roomId => /*#__PURE__*/_react.default.createElement(Tile, {
    key: roomId,
    room: rooms.get(roomId),
    suggested: relations.get(spaceId)?.get(roomId)?.content.suggested,
    selected: selectedMap?.get(spaceId)?.has(roomId),
    onViewRoomClick: autoJoin => {
      onViewRoomClick(roomId, autoJoin);
    },
    hasPermissions: hasPermissions,
    onToggleClick: onToggleClick ? () => onToggleClick(spaceId, roomId) : undefined
  })), subspaces.filter(roomId => !newParents.has(roomId)).map(roomId => /*#__PURE__*/_react.default.createElement(Tile, {
    key: roomId,
    room: rooms.get(roomId),
    numChildRooms: Array.from(relations.get(roomId)?.values() || []).filter(ev => rooms.get(ev.state_key)?.room_type !== _event.RoomType.Space).length,
    suggested: relations.get(spaceId)?.get(roomId)?.content.suggested,
    selected: selectedMap?.get(spaceId)?.has(roomId),
    onViewRoomClick: autoJoin => {
      onViewRoomClick(roomId, autoJoin);
    },
    hasPermissions: hasPermissions,
    onToggleClick: onToggleClick ? () => onToggleClick(spaceId, roomId) : undefined
  }, /*#__PURE__*/_react.default.createElement(HierarchyLevel, {
    spaceId: roomId,
    rooms: rooms,
    relations: relations,
    parents: newParents,
    selectedMap: selectedMap,
    onViewRoomClick: onViewRoomClick,
    onToggleClick: onToggleClick
  }))));
}; // mutate argument refreshToken to force a reload


exports.HierarchyLevel = HierarchyLevel;

const useSpaceSummary = (cli
/*: MatrixClient*/
, space
/*: Room*/
, refreshToken
/*: any*/
) =>
/*: [
    null,
    ISpaceSummaryRoom[],
    Map<string, Map<string, ISpaceSummaryEvent>>?,
    Map<string, Set<string>>?,
    Map<string, Set<string>>?,
] | [Error]*/
{
  // TODO pagination
  return (0, _useAsyncMemo.useAsyncMemo)(async () => {
    try {
      const data = await cli.getSpaceSummary(space.roomId);
      const parentChildRelations = new _maps.EnhancedMap();
      const childParentRelations = new _maps.EnhancedMap();
      const viaMap = new _maps.EnhancedMap();
      data.events.map((ev
      /*: ISpaceSummaryEvent*/
      ) => {
        if (ev.type === _event.EventType.SpaceChild) {
          parentChildRelations.getOrCreate(ev.room_id, new Map()).set(ev.state_key, ev);
          childParentRelations.getOrCreate(ev.state_key, new Set()).add(ev.room_id);
        }

        if (Array.isArray(ev.content["via"])) {
          const set = viaMap.getOrCreate(ev.state_key, new Set());
          ev.content["via"].forEach(via => set.add(via));
        }
      });
      return [null, data.rooms, parentChildRelations, viaMap, childParentRelations];
    } catch (e) {
      console.error(e); // TODO

      return [e];
    }
  }, [space, refreshToken], [undefined]);
};

exports.useSpaceSummary = useSpaceSummary;

const SpaceHierarchy
/*: React.FC<IHierarchyProps>*/
= ({
  space,
  initialText = "",
  showRoom,
  refreshToken,
  children
}) => {
  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  const userId = cli.getUserId();
  const [query, setQuery] = (0, _react.useState)(initialText);
  const [selected, setSelected] = (0, _react.useState)(new Map()); // Map<parentId, Set<childId>>

  const [summaryError, rooms, parentChildMap, viaMap, childParentMap] = useSpaceSummary(cli, space, refreshToken);
  const roomsMap = (0, _react.useMemo)(() => {
    if (!rooms) return null;
    const lcQuery = query.toLowerCase().trim();
    const roomsMap = new Map(rooms.map(r => [r.room_id, r]));
    if (!lcQuery) return roomsMap;
    const directMatches = rooms.filter(r => {
      return r.name?.toLowerCase().includes(lcQuery) || r.topic?.toLowerCase().includes(lcQuery);
    }); // Walk back up the tree to find all parents of the direct matches to show their place in the hierarchy

    const visited = new Set();
    const queue = [...directMatches.map(r => r.room_id)];

    while (queue.length) {
      const roomId = queue.pop();
      visited.add(roomId);
      childParentMap.get(roomId)?.forEach(parentId => {
        if (!visited.has(parentId)) {
          queue.push(parentId);
        }
      });
    } // Remove any mappings for rooms which were not visited in the walk


    Array.from(roomsMap.keys()).forEach(roomId => {
      if (!visited.has(roomId)) {
        roomsMap.delete(roomId);
      }
    });
    return roomsMap;
  }, [rooms, childParentMap, query]);
  const [error, setError] = (0, _react.useState)("");
  const [removing, setRemoving] = (0, _react.useState)(false);
  const [saving, setSaving] = (0, _react.useState)(false);

  if (summaryError) {
    return /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your server does not support showing space hierarchies."));
  }

  let content;

  if (roomsMap) {
    const numRooms = Array.from(roomsMap.values()).filter(r => r.room_type !== _event.RoomType.Space).length;
    const numSpaces = roomsMap.size - numRooms - 1; // -1 at the end to exclude the space we are looking at

    let countsStr;

    if (numSpaces > 1) {
      countsStr = (0, _languageHandler._t)("%(count)s rooms and %(numSpaces)s spaces", {
        count: numRooms,
        numSpaces
      });
    } else if (numSpaces > 0) {
      countsStr = (0, _languageHandler._t)("%(count)s rooms and 1 space", {
        count: numRooms,
        numSpaces
      });
    } else {
      countsStr = (0, _languageHandler._t)("%(count)s rooms", {
        count: numRooms,
        numSpaces
      });
    }

    let editSection;

    if (space.getMyMembership() === "join" && space.currentState.maySendStateEvent(_event.EventType.SpaceChild, userId)) {
      const selectedRelations = Array.from(selected.keys()).flatMap(parentId => {
        return [...selected.get(parentId).values()].map(childId => [parentId, childId]);
      });
      let buttons;

      if (selectedRelations.length) {
        const selectionAllSuggested = selectedRelations.every(([parentId, childId]) => {
          return parentChildMap.get(parentId)?.get(childId)?.content.suggested;
        });
        const disabled = removing || saving;
        buttons = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: async () => {
            setRemoving(true);

            try {
              for (const [parentId, childId] of selectedRelations) {
                await cli.sendStateEvent(parentId, _event.EventType.SpaceChild, {}, childId);
                parentChildMap.get(parentId).get(childId).content = {};
                parentChildMap.set(parentId, new Map(parentChildMap.get(parentId)));
              }
            } catch (e) {
              setError((0, _languageHandler._t)("Failed to remove some rooms. Try again later"));
            }

            setRemoving(false);
          },
          kind: "danger_outline",
          disabled: disabled
        }, removing ? (0, _languageHandler._t)("Removing...") : (0, _languageHandler._t)("Remove")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: async () => {
            setSaving(true);

            try {
              for (const [parentId, childId] of selectedRelations) {
                const suggested = !selectionAllSuggested;
                const existingContent = parentChildMap.get(parentId)?.get(childId)?.content;
                if (!existingContent || existingContent.suggested === suggested) continue;

                const content = _objectSpread(_objectSpread({}, existingContent), {}, {
                  suggested: !selectionAllSuggested
                });

                await cli.sendStateEvent(parentId, _event.EventType.SpaceChild, content, childId);
                parentChildMap.get(parentId).get(childId).content = content;
                parentChildMap.set(parentId, new Map(parentChildMap.get(parentId)));
              }
            } catch (e) {
              setError("Failed to update some suggestions. Try again later");
            }

            setSaving(false);
          },
          kind: "primary_outline",
          disabled: disabled
        }, saving ? (0, _languageHandler._t)("Saving...") : selectionAllSuggested ? (0, _languageHandler._t)("Mark as not suggested") : (0, _languageHandler._t)("Mark as suggested")));
      }

      editSection = /*#__PURE__*/_react.default.createElement("span", null, buttons);
    }

    let results;

    if (roomsMap.size) {
      const hasPermissions = space?.currentState.maySendStateEvent(_event.EventType.SpaceChild, cli.getUserId());
      results = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(HierarchyLevel, {
        spaceId: space.roomId,
        rooms: roomsMap,
        relations: parentChildMap,
        parents: new Set(),
        selectedMap: selected,
        onToggleClick: hasPermissions ? (parentId, childId) => {
          setError("");

          if (!selected.has(parentId)) {
            setSelected(new Map(selected.set(parentId, new Set([childId]))));
            return;
          }

          const parentSet = selected.get(parentId);

          if (!parentSet.has(childId)) {
            setSelected(new Map(selected.set(parentId, new Set([...parentSet, childId]))));
            return;
          }

          parentSet.delete(childId);
          setSelected(new Map(selected.set(parentId, new Set(parentSet))));
        } : undefined,
        onViewRoomClick: (roomId, autoJoin) => {
          showRoom(roomsMap.get(roomId), Array.from(viaMap.get(roomId) || []), autoJoin);
        }
      }), children && /*#__PURE__*/_react.default.createElement("hr", null));
    } else {
      results = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceRoomDirectory_noResults"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("No results found")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("You may want to try a different search or check for typos.")));
    }

    content = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SpaceRoomDirectory_listHeader"
    }, countsStr, editSection), error && /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SpaceRoomDirectory_error"
    }, error), /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
      className: "mx_SpaceRoomDirectory_list"
    }, results, children));
  } else {
    content = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
  } // TODO loading state/error state


  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_SearchBox.default, {
    className: "mx_textinput_icon mx_textinput_search",
    placeholder: (0, _languageHandler._t)("Search names and description"),
    onSearch: setQuery,
    autoFocus: true,
    initialValue: initialText
  }), content);
};

exports.SpaceHierarchy = SpaceHierarchy;

const SpaceRoomDirectory
/*: React.FC<IProps>*/
= ({
  space,
  onFinished,
  initialText
}) => {
  const onCreateRoomClick = () => {
    _dispatcher.default.dispatch({
      action: 'view_create_room',
      public: true
    });

    onFinished();
  };

  const title = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
    room: space,
    height: 32,
    width: 32
  }), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Explore rooms")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_RoomName.default, {
    room: space
  }))));

  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    className: "mx_SpaceRoomDirectory",
    hasCancel: true,
    onFinished: onFinished,
    title: title
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Dialog_content"
  }, (0, _languageHandler._t)("If you can't find the room you're looking for, ask for an invite or <a>create a new room</a>.", null, {
    a: sub => {
      return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: onCreateRoomClick
      }, sub);
    }
  }), /*#__PURE__*/_react.default.createElement(SpaceHierarchy, {
    space: space,
    showRoom: (room
    /*: ISpaceSummaryRoom*/
    , viaServers
    /*: string[]*/
    , autoJoin = false) => {
      showRoom(room, viaServers, autoJoin);
      onFinished();
    },
    initialText: initialText
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    onClick: onCreateRoomClick,
    kind: "primary",
    className: "mx_SpaceRoomDirectory_createRoom"
  }, (0, _languageHandler._t)("Create room")))));
};

var _default = SpaceRoomDirectory; // Similar to matrix-react-sdk's MatrixTools.getDisplayAliasForRoom
// but works with the objects we get from the public room list

exports.default = _default;

function getDisplayAliasForRoom(room
/*: ISpaceSummaryRoom*/
) {
  return room.canonical_alias || (room.aliases ? room.aliases[0] : "");
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvU3BhY2VSb29tRGlyZWN0b3J5LnRzeCJdLCJuYW1lcyI6WyJUaWxlIiwicm9vbSIsInN1Z2dlc3RlZCIsInNlbGVjdGVkIiwiaGFzUGVybWlzc2lvbnMiLCJvblRvZ2dsZUNsaWNrIiwib25WaWV3Um9vbUNsaWNrIiwibnVtQ2hpbGRSb29tcyIsImNoaWxkcmVuIiwibmFtZSIsImNhbm9uaWNhbF9hbGlhcyIsImFsaWFzZXMiLCJyb29tX3R5cGUiLCJSb29tVHlwZSIsIlNwYWNlIiwic2hvd0NoaWxkcmVuIiwidG9nZ2xlU2hvd0NoaWxkcmVuIiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiY2xpUm9vbSIsImdldFJvb20iLCJyb29tX2lkIiwibXlNZW1iZXJzaGlwIiwiZ2V0TXlNZW1iZXJzaGlwIiwib25QcmV2aWV3Q2xpY2siLCJvbkpvaW5DbGljayIsImJ1dHRvbiIsImNoZWNrYm94IiwiZXYiLCJzdG9wUHJvcGFnYXRpb24iLCJ1cmwiLCJhdmF0YXJfdXJsIiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsImRlc2NyaXB0aW9uIiwiY291bnQiLCJudW1fam9pbmVkX21lbWJlcnMiLCJ0b3BpYyIsInN1Z2dlc3RlZFNlY3Rpb24iLCJjb250ZW50IiwiY2hpbGRUb2dnbGUiLCJjaGlsZFNlY3Rpb24iLCJteF9TcGFjZVJvb21EaXJlY3Rvcnlfc3Vic3BhY2VfdG9nZ2xlX3Nob3duIiwibXhfU3BhY2VSb29tRGlyZWN0b3J5X3N1YnNwYWNlIiwic2hvd1Jvb20iLCJ2aWFTZXJ2ZXJzIiwiYXV0b0pvaW4iLCJpc0d1ZXN0Iiwid29ybGRfcmVhZGFibGUiLCJndWVzdF9jYW5fam9pbiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwicm9vbUFsaWFzIiwiZ2V0RGlzcGxheUFsaWFzRm9yUm9vbSIsInVuZGVmaW5lZCIsImF1dG9fam9pbiIsInNob3VsZF9wZWVrIiwiX3R5cGUiLCJyb29tX2FsaWFzIiwidmlhX3NlcnZlcnMiLCJvb2JfZGF0YSIsImF2YXRhclVybCIsIkhpZXJhcmNoeUxldmVsIiwic3BhY2VJZCIsInJvb21zIiwicmVsYXRpb25zIiwicGFyZW50cyIsInNlbGVjdGVkTWFwIiwic3BhY2UiLCJjdXJyZW50U3RhdGUiLCJtYXlTZW5kU3RhdGVFdmVudCIsIkV2ZW50VHlwZSIsIlNwYWNlQ2hpbGQiLCJnZXRVc2VySWQiLCJzb3J0ZWRDaGlsZHJlbiIsInZhbHVlcyIsIm9yZGVyIiwic3Vic3BhY2VzIiwiY2hpbGRSb29tcyIsInJlZHVjZSIsInJlc3VsdCIsInJvb21JZCIsInN0YXRlX2tleSIsImhhcyIsInB1c2giLCJuZXdQYXJlbnRzIiwiU2V0IiwiYWRkIiwibWFwIiwiZmlsdGVyIiwiQXJyYXkiLCJmcm9tIiwibGVuZ3RoIiwidXNlU3BhY2VTdW1tYXJ5IiwicmVmcmVzaFRva2VuIiwiZGF0YSIsImdldFNwYWNlU3VtbWFyeSIsInBhcmVudENoaWxkUmVsYXRpb25zIiwiRW5oYW5jZWRNYXAiLCJjaGlsZFBhcmVudFJlbGF0aW9ucyIsInZpYU1hcCIsImV2ZW50cyIsInR5cGUiLCJnZXRPckNyZWF0ZSIsIk1hcCIsInNldCIsImlzQXJyYXkiLCJmb3JFYWNoIiwidmlhIiwiZSIsImNvbnNvbGUiLCJlcnJvciIsIlNwYWNlSGllcmFyY2h5IiwiaW5pdGlhbFRleHQiLCJ1c2VySWQiLCJxdWVyeSIsInNldFF1ZXJ5Iiwic2V0U2VsZWN0ZWQiLCJzdW1tYXJ5RXJyb3IiLCJwYXJlbnRDaGlsZE1hcCIsImNoaWxkUGFyZW50TWFwIiwicm9vbXNNYXAiLCJsY1F1ZXJ5IiwidG9Mb3dlckNhc2UiLCJ0cmltIiwiciIsImRpcmVjdE1hdGNoZXMiLCJpbmNsdWRlcyIsInZpc2l0ZWQiLCJxdWV1ZSIsInBvcCIsInBhcmVudElkIiwia2V5cyIsImRlbGV0ZSIsInNldEVycm9yIiwicmVtb3ZpbmciLCJzZXRSZW1vdmluZyIsInNhdmluZyIsInNldFNhdmluZyIsIm51bVJvb21zIiwibnVtU3BhY2VzIiwic2l6ZSIsImNvdW50c1N0ciIsImVkaXRTZWN0aW9uIiwic2VsZWN0ZWRSZWxhdGlvbnMiLCJmbGF0TWFwIiwiY2hpbGRJZCIsImJ1dHRvbnMiLCJzZWxlY3Rpb25BbGxTdWdnZXN0ZWQiLCJldmVyeSIsImRpc2FibGVkIiwic2VuZFN0YXRlRXZlbnQiLCJleGlzdGluZ0NvbnRlbnQiLCJyZXN1bHRzIiwicGFyZW50U2V0IiwiU3BhY2VSb29tRGlyZWN0b3J5Iiwib25GaW5pc2hlZCIsIm9uQ3JlYXRlUm9vbUNsaWNrIiwicHVibGljIiwidGl0bGUiLCJhIiwic3ViIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFpREEsTUFBTUE7QUFBMEI7QUFBQSxFQUFHLENBQUM7QUFDaENDLEVBQUFBLElBRGdDO0FBRWhDQyxFQUFBQSxTQUZnQztBQUdoQ0MsRUFBQUEsUUFIZ0M7QUFJaENDLEVBQUFBLGNBSmdDO0FBS2hDQyxFQUFBQSxhQUxnQztBQU1oQ0MsRUFBQUEsZUFOZ0M7QUFPaENDLEVBQUFBLGFBUGdDO0FBUWhDQyxFQUFBQTtBQVJnQyxDQUFELEtBUzdCO0FBQ0YsUUFBTUMsSUFBSSxHQUFHUixJQUFJLENBQUNRLElBQUwsSUFBYVIsSUFBSSxDQUFDUyxlQUFsQixJQUFxQ1QsSUFBSSxDQUFDVSxPQUFMLEdBQWUsQ0FBZixDQUFyQyxLQUNMVixJQUFJLENBQUNXLFNBQUwsS0FBbUJDLGdCQUFTQyxLQUE1QixHQUFvQyx5QkFBRyxlQUFILENBQXBDLEdBQTBELHlCQUFHLGNBQUgsQ0FEckQsQ0FBYjtBQUdBLFFBQU0sQ0FBQ0MsWUFBRCxFQUFlQyxrQkFBZixJQUFxQyxvQ0FBZSxJQUFmLENBQTNDOztBQUVBLFFBQU1D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QUFFQyxHQUFHLElBQUk7QUFDUCwwQkFBTyw2QkFBQyx5QkFBRDtBQUFrQixRQUFBLElBQUksRUFBQyxNQUF2QjtBQUE4QixRQUFBLE9BQU8sRUFBRUo7QUFBdkMsU0FBMkRJLEdBQTNELENBQVA7QUFDSDtBQUZELEdBRkYsQ0FETixlQVFJLDZCQUFDLGNBQUQ7QUFDSSxJQUFBLEtBQUssRUFBRTdGLEtBRFg7QUFFSSxJQUFBLFFBQVEsRUFBRSxDQUFDcEU7QUFBRDtBQUFBLE1BQTBCNEM7QUFBMUI7QUFBQSxNQUFpREMsUUFBUSxHQUFHLEtBQTVELEtBQXNFO0FBQzVFRixNQUFBQSxRQUFRLENBQUMzQyxJQUFELEVBQU80QyxVQUFQLEVBQW1CQyxRQUFuQixDQUFSO0FBQ0ErRyxNQUFBQSxVQUFVO0FBQ2IsS0FMTDtBQU1JLElBQUEsV0FBVyxFQUFFM0M7QUFOakIsa0JBUUksNkJBQUMseUJBQUQ7QUFDSSxJQUFBLE9BQU8sRUFBRTRDLGlCQURiO0FBRUksSUFBQSxJQUFJLEVBQUMsU0FGVDtBQUdJLElBQUEsU0FBUyxFQUFDO0FBSGQsS0FLTSx5QkFBRyxhQUFILENBTE4sQ0FSSixDQVJKLENBREosQ0FESjtBQTZCSCxDQTlDRDs7ZUFnRGVGLGtCLEVBRWY7QUFDQTs7OztBQUNBLFNBQVN0RyxzQkFBVCxDQUFnQ3JEO0FBQWhDO0FBQUEsRUFBeUQ7QUFDckQsU0FBT0EsSUFBSSxDQUFDUyxlQUFMLEtBQXlCVCxJQUFJLENBQUNVLE9BQUwsR0FBZVYsSUFBSSxDQUFDVSxPQUFMLENBQWEsQ0FBYixDQUFmLEdBQWlDLEVBQTFELENBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge3VzZU1lbW8sIHVzZVN0YXRlfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7Um9vbX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHtFdmVudFR5cGUsIFJvb21UeXBlfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHtzb3J0Qnl9IGZyb20gXCJsb2Rhc2hcIjtcblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgU2VhcmNoQm94IGZyb20gXCIuL1NlYXJjaEJveFwiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSBcIi4uL3ZpZXdzL2F2YXRhcnMvUm9vbUF2YXRhclwiO1xuaW1wb3J0IFJvb21OYW1lIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9Sb29tTmFtZVwiO1xuaW1wb3J0IHt1c2VBc3luY01lbW99IGZyb20gXCIuLi8uLi9ob29rcy91c2VBc3luY01lbW9cIjtcbmltcG9ydCB7RW5oYW5jZWRNYXB9IGZyb20gXCIuLi8uLi91dGlscy9tYXBzXCI7XG5pbXBvcnQgU3R5bGVkQ2hlY2tib3ggZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1N0eWxlZENoZWNrYm94XCI7XG5pbXBvcnQgQXV0b0hpZGVTY3JvbGxiYXIgZnJvbSBcIi4vQXV0b0hpZGVTY3JvbGxiYXJcIjtcbmltcG9ydCBCYXNlQXZhdGFyIGZyb20gXCIuLi92aWV3cy9hdmF0YXJzL0Jhc2VBdmF0YXJcIjtcbmltcG9ydCB7bWVkaWFGcm9tTXhjfSBmcm9tIFwiLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcbmltcG9ydCBJbmZvVG9vbHRpcCBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvSW5mb1Rvb2x0aXBcIjtcbmltcG9ydCBUZXh0V2l0aFRvb2x0aXAgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1RleHRXaXRoVG9vbHRpcFwiO1xuaW1wb3J0IHt1c2VTdGF0ZVRvZ2dsZX0gZnJvbSBcIi4uLy4uL2hvb2tzL3VzZVN0YXRlVG9nZ2xlXCI7XG5cbmludGVyZmFjZSBJSGllcmFyY2h5UHJvcHMge1xuICAgIHNwYWNlOiBSb29tO1xuICAgIGluaXRpYWxUZXh0Pzogc3RyaW5nO1xuICAgIHJlZnJlc2hUb2tlbj86IGFueTtcbiAgICBzaG93Um9vbShyb29tOiBJU3BhY2VTdW1tYXJ5Um9vbSwgdmlhU2VydmVycz86IHN0cmluZ1tdLCBhdXRvSm9pbj86IGJvb2xlYW4pOiB2b2lkO1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBjYW1lbGNhc2UgKi9cbmV4cG9ydCBpbnRlcmZhY2UgSVNwYWNlU3VtbWFyeVJvb20ge1xuICAgIGNhbm9uaWNhbF9hbGlhcz86IHN0cmluZztcbiAgICBhbGlhc2VzOiBzdHJpbmdbXTtcbiAgICBhdmF0YXJfdXJsPzogc3RyaW5nO1xuICAgIGd1ZXN0X2Nhbl9qb2luOiBib29sZWFuO1xuICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgbnVtX2pvaW5lZF9tZW1iZXJzOiBudW1iZXJcbiAgICByb29tX2lkOiBzdHJpbmc7XG4gICAgdG9waWM/OiBzdHJpbmc7XG4gICAgd29ybGRfcmVhZGFibGU6IGJvb2xlYW47XG4gICAgbnVtX3JlZnM6IG51bWJlcjtcbiAgICByb29tX3R5cGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU3BhY2VTdW1tYXJ5RXZlbnQge1xuICAgIHJvb21faWQ6IHN0cmluZztcbiAgICBldmVudF9pZDogc3RyaW5nO1xuICAgIG9yaWdpbl9zZXJ2ZXJfdHM6IG51bWJlcjtcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgc3RhdGVfa2V5OiBzdHJpbmc7XG4gICAgY29udGVudDoge1xuICAgICAgICBvcmRlcj86IHN0cmluZztcbiAgICAgICAgc3VnZ2VzdGVkPzogYm9vbGVhbjtcbiAgICAgICAgYXV0b19qb2luPzogYm9vbGVhbjtcbiAgICAgICAgdmlhPzogc3RyaW5nO1xuICAgIH07XG59XG4vKiBlc2xpbnQtZW5hYmxlIGNhbWVsY2FzZSAqL1xuXG5pbnRlcmZhY2UgSVRpbGVQcm9wcyB7XG4gICAgcm9vbTogSVNwYWNlU3VtbWFyeVJvb207XG4gICAgc3VnZ2VzdGVkPzogYm9vbGVhbjtcbiAgICBzZWxlY3RlZD86IGJvb2xlYW47XG4gICAgbnVtQ2hpbGRSb29tcz86IG51bWJlcjtcbiAgICBoYXNQZXJtaXNzaW9ucz86IGJvb2xlYW47XG4gICAgb25WaWV3Um9vbUNsaWNrKGF1dG9Kb2luOiBib29sZWFuKTogdm9pZDtcbiAgICBvblRvZ2dsZUNsaWNrPygpOiB2b2lkO1xufVxuXG5jb25zdCBUaWxlOiBSZWFjdC5GQzxJVGlsZVByb3BzPiA9ICh7XG4gICAgcm9vbSxcbiAgICBzdWdnZXN0ZWQsXG4gICAgc2VsZWN0ZWQsXG4gICAgaGFzUGVybWlzc2lvbnMsXG4gICAgb25Ub2dnbGVDbGljayxcbiAgICBvblZpZXdSb29tQ2xpY2ssXG4gICAgbnVtQ2hpbGRSb29tcyxcbiAgICBjaGlsZHJlbixcbn0pID0+IHtcbiAgICBjb25zdCBuYW1lID0gcm9vbS5uYW1lIHx8IHJvb20uY2Fub25pY2FsX2FsaWFzIHx8IHJvb20uYWxpYXNlcz8uWzBdXG4gICAgICAgIHx8IChyb29tLnJvb21fdHlwZSA9PT0gUm9vbVR5cGUuU3BhY2UgPyBfdChcIlVubmFtZWQgU3BhY2VcIikgOiBfdChcIlVubmFtZWQgUm9vbVwiKSk7XG5cbiAgICBjb25zdCBbc2hvd0NoaWxkcmVuLCB0b2dnbGVTaG93Q2hpbGRyZW5dID0gdXNlU3RhdGVUb2dnbGUodHJ1ZSk7XG5cbiAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgY29uc3QgY2xpUm9vbSA9IGNsaS5nZXRSb29tKHJvb20ucm9vbV9pZCk7XG4gICAgY29uc3QgbXlNZW1iZXJzaGlwID0gY2xpUm9vbT8uZ2V0TXlNZW1iZXJzaGlwKCk7XG5cbiAgICBjb25zdCBvblByZXZpZXdDbGljayA9ICgpID0+IG9uVmlld1Jvb21DbGljayhmYWxzZSk7XG4gICAgY29uc3Qgb25Kb2luQ2xpY2sgPSAoKSA9PiBvblZpZXdSb29tQ2xpY2sodHJ1ZSk7XG5cbiAgICBsZXQgYnV0dG9uO1xuICAgIGlmIChteU1lbWJlcnNoaXAgPT09IFwiam9pblwiKSB7XG4gICAgICAgIGJ1dHRvbiA9IDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e29uUHJldmlld0NsaWNrfSBraW5kPVwicHJpbWFyeV9vdXRsaW5lXCI+XG4gICAgICAgICAgICB7IF90KFwiVmlld1wiKSB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgfSBlbHNlIGlmIChvbkpvaW5DbGljaykge1xuICAgICAgICBidXR0b24gPSA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXtvbkpvaW5DbGlja30ga2luZD1cInByaW1hcnlcIj5cbiAgICAgICAgICAgIHsgX3QoXCJKb2luXCIpIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICB9XG5cbiAgICBsZXQgY2hlY2tib3g7XG4gICAgaWYgKG9uVG9nZ2xlQ2xpY2spIHtcbiAgICAgICAgaWYgKGhhc1Blcm1pc3Npb25zKSB7XG4gICAgICAgICAgICBjaGVja2JveCA9IDxTdHlsZWRDaGVja2JveCBjaGVja2VkPXshIXNlbGVjdGVkfSBvbkNoYW5nZT17b25Ub2dnbGVDbGlja30gLz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGVja2JveCA9IDxUZXh0V2l0aFRvb2x0aXBcbiAgICAgICAgICAgICAgICB0b29sdGlwPXtfdChcIllvdSBkb24ndCBoYXZlIHBlcm1pc3Npb25cIil9XG4gICAgICAgICAgICAgICAgb25DbGljaz17ZXYgPT4geyBldi5zdG9wUHJvcGFnYXRpb24oKSB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxTdHlsZWRDaGVja2JveCBkaXNhYmxlZD17dHJ1ZX0gLz5cbiAgICAgICAgICAgIDwvVGV4dFdpdGhUb29sdGlwPjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCB1cmw6IHN0cmluZztcbiAgICBpZiAocm9vbS5hdmF0YXJfdXJsKSB7XG4gICAgICAgIHVybCA9IG1lZGlhRnJvbU14Yyhyb29tLmF2YXRhcl91cmwpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoMjApO1xuICAgIH1cblxuICAgIGxldCBkZXNjcmlwdGlvbiA9IF90KFwiJShjb3VudClzIG1lbWJlcnNcIiwgeyBjb3VudDogcm9vbS5udW1fam9pbmVkX21lbWJlcnMgfSk7XG4gICAgaWYgKG51bUNoaWxkUm9vbXMpIHtcbiAgICAgICAgZGVzY3JpcHRpb24gKz0gXCIgwrcgXCIgKyBfdChcIiUoY291bnQpcyByb29tc1wiLCB7IGNvdW50OiBudW1DaGlsZFJvb21zIH0pO1xuICAgIH1cbiAgICBpZiAocm9vbS50b3BpYykge1xuICAgICAgICBkZXNjcmlwdGlvbiArPSBcIiDCtyBcIiArIHJvb20udG9waWM7XG4gICAgfVxuXG4gICAgbGV0IHN1Z2dlc3RlZFNlY3Rpb247XG4gICAgaWYgKHN1Z2dlc3RlZCkge1xuICAgICAgICBzdWdnZXN0ZWRTZWN0aW9uID0gPEluZm9Ub29sdGlwIHRvb2x0aXA9e190KFwiVGhpcyByb29tIGlzIHN1Z2dlc3RlZCBhcyBhIGdvb2Qgb25lIHRvIGpvaW5cIil9PlxuICAgICAgICAgICAgeyBfdChcIlN1Z2dlc3RlZFwiKSB9XG4gICAgICAgIDwvSW5mb1Rvb2x0aXA+O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIDxCYXNlQXZhdGFyIG5hbWU9e25hbWV9IGlkTmFtZT17cm9vbS5yb29tX2lkfSB1cmw9e3VybH0gd2lkdGg9ezIwfSBoZWlnaHQ9ezIwfSAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbURpcmVjdG9yeV9yb29tVGlsZV9uYW1lXCI+XG4gICAgICAgICAgICB7IG5hbWUgfVxuICAgICAgICAgICAgeyBzdWdnZXN0ZWRTZWN0aW9uIH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21EaXJlY3Rvcnlfcm9vbVRpbGVfaW5mb1wiPlxuICAgICAgICAgICAgeyBkZXNjcmlwdGlvbiB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbURpcmVjdG9yeV9hY3Rpb25zXCI+XG4gICAgICAgICAgICB7IGJ1dHRvbiB9XG4gICAgICAgICAgICB7IGNoZWNrYm94IH1cbiAgICAgICAgPC9kaXY+XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG5cbiAgICBsZXQgY2hpbGRUb2dnbGU7XG4gICAgbGV0IGNoaWxkU2VjdGlvbjtcbiAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgLy8gdGhlIGNoZXZyb24gaXMgcHVycG9zZWZ1bGx5IGEgZGl2IHJhdGhlciB0aGFuIGEgYnV0dG9uIGFzIGl0IHNob3VsZCBiZSBpZ25vcmVkIGZvciBhMTF5XG4gICAgICAgIGNoaWxkVG9nZ2xlID0gPGRpdlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfU3BhY2VSb29tRGlyZWN0b3J5X3N1YnNwYWNlX3RvZ2dsZVwiLCB7XG4gICAgICAgICAgICAgICAgbXhfU3BhY2VSb29tRGlyZWN0b3J5X3N1YnNwYWNlX3RvZ2dsZV9zaG93bjogc2hvd0NoaWxkcmVuLFxuICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICBvbkNsaWNrPXtldiA9PiB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgdG9nZ2xlU2hvd0NoaWxkcmVuKCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAvPjtcbiAgICAgICAgaWYgKHNob3dDaGlsZHJlbikge1xuICAgICAgICAgICAgY2hpbGRTZWN0aW9uID0gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21EaXJlY3Rvcnlfc3Vic3BhY2VfY2hpbGRyZW5cIj5cbiAgICAgICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiA8PlxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfU3BhY2VSb29tRGlyZWN0b3J5X3Jvb21UaWxlXCIsIHtcbiAgICAgICAgICAgICAgICBteF9TcGFjZVJvb21EaXJlY3Rvcnlfc3Vic3BhY2U6IHJvb20ucm9vbV90eXBlID09PSBSb29tVHlwZS5TcGFjZSxcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgb25DbGljaz17KGhhc1Blcm1pc3Npb25zICYmIG9uVG9nZ2xlQ2xpY2spID8gb25Ub2dnbGVDbGljayA6IG9uUHJldmlld0NsaWNrfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IGNvbnRlbnQgfVxuICAgICAgICAgICAgeyBjaGlsZFRvZ2dsZSB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgeyBjaGlsZFNlY3Rpb24gfVxuICAgIDwvPjtcbn07XG5cbmV4cG9ydCBjb25zdCBzaG93Um9vbSA9IChyb29tOiBJU3BhY2VTdW1tYXJ5Um9vbSwgdmlhU2VydmVycz86IHN0cmluZ1tdLCBhdXRvSm9pbiA9IGZhbHNlKSA9PiB7XG4gICAgLy8gRG9uJ3QgbGV0IHRoZSB1c2VyIHZpZXcgYSByb29tIHRoZXkgd29uJ3QgYmUgYWJsZSB0byBlaXRoZXIgcGVlayBvciBqb2luOlxuICAgIC8vIGZhaWwgZWFybGllciBzbyB0aGV5IGRvbid0IGhhdmUgdG8gY2xpY2sgYmFjayB0byB0aGUgZGlyZWN0b3J5LlxuICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgIGlmICghcm9vbS53b3JsZF9yZWFkYWJsZSAmJiAhcm9vbS5ndWVzdF9jYW5fam9pbikge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInJlcXVpcmVfcmVnaXN0cmF0aW9uXCIgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByb29tQWxpYXMgPSBnZXREaXNwbGF5QWxpYXNGb3JSb29tKHJvb20pIHx8IHVuZGVmaW5lZDtcbiAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IFwidmlld19yb29tXCIsXG4gICAgICAgIGF1dG9fam9pbjogYXV0b0pvaW4sXG4gICAgICAgIHNob3VsZF9wZWVrOiB0cnVlLFxuICAgICAgICBfdHlwZTogXCJyb29tX2RpcmVjdG9yeVwiLCAvLyBpbnN0cnVtZW50YXRpb25cbiAgICAgICAgcm9vbV9hbGlhczogcm9vbUFsaWFzLFxuICAgICAgICByb29tX2lkOiByb29tLnJvb21faWQsXG4gICAgICAgIHZpYV9zZXJ2ZXJzOiB2aWFTZXJ2ZXJzLFxuICAgICAgICBvb2JfZGF0YToge1xuICAgICAgICAgICAgYXZhdGFyVXJsOiByb29tLmF2YXRhcl91cmwsXG4gICAgICAgICAgICAvLyBYWFg6IFRoaXMgbG9naWMgaXMgZHVwbGljYXRlZCBmcm9tIHRoZSBKUyBTREsgd2hpY2ggd291bGQgbm9ybWFsbHkgZGVjaWRlIHdoYXQgdGhlIG5hbWUgaXMuXG4gICAgICAgICAgICBuYW1lOiByb29tLm5hbWUgfHwgcm9vbUFsaWFzIHx8IF90KFwiVW5uYW1lZCByb29tXCIpLFxuICAgICAgICB9LFxuICAgIH0pO1xufTtcblxuaW50ZXJmYWNlIElIaWVyYXJjaHlMZXZlbFByb3BzIHtcbiAgICBzcGFjZUlkOiBzdHJpbmc7XG4gICAgcm9vbXM6IE1hcDxzdHJpbmcsIElTcGFjZVN1bW1hcnlSb29tPjtcbiAgICByZWxhdGlvbnM6IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIElTcGFjZVN1bW1hcnlFdmVudD4+O1xuICAgIHBhcmVudHM6IFNldDxzdHJpbmc+O1xuICAgIHNlbGVjdGVkTWFwPzogTWFwPHN0cmluZywgU2V0PHN0cmluZz4+O1xuICAgIG9uVmlld1Jvb21DbGljayhyb29tSWQ6IHN0cmluZywgYXV0b0pvaW46IGJvb2xlYW4pOiB2b2lkO1xuICAgIG9uVG9nZ2xlQ2xpY2s/KHBhcmVudElkOiBzdHJpbmcsIGNoaWxkSWQ6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBIaWVyYXJjaHlMZXZlbCA9ICh7XG4gICAgc3BhY2VJZCxcbiAgICByb29tcyxcbiAgICByZWxhdGlvbnMsXG4gICAgcGFyZW50cyxcbiAgICBzZWxlY3RlZE1hcCxcbiAgICBvblZpZXdSb29tQ2xpY2ssXG4gICAgb25Ub2dnbGVDbGljayxcbn06IElIaWVyYXJjaHlMZXZlbFByb3BzKSA9PiB7XG4gICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGNvbnN0IHNwYWNlID0gY2xpLmdldFJvb20oc3BhY2VJZCk7XG4gICAgY29uc3QgaGFzUGVybWlzc2lvbnMgPSBzcGFjZT8uY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5TcGFjZUNoaWxkLCBjbGkuZ2V0VXNlcklkKCkpO1xuXG4gICAgY29uc3Qgc29ydGVkQ2hpbGRyZW4gPSBzb3J0QnkoWy4uLihyZWxhdGlvbnMuZ2V0KHNwYWNlSWQpPy52YWx1ZXMoKSB8fCBbXSldLCBldiA9PiBldi5jb250ZW50Lm9yZGVyIHx8IG51bGwpO1xuICAgIGNvbnN0IFtzdWJzcGFjZXMsIGNoaWxkUm9vbXNdID0gc29ydGVkQ2hpbGRyZW4ucmVkdWNlKChyZXN1bHQsIGV2OiBJU3BhY2VTdW1tYXJ5RXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gZXYuc3RhdGVfa2V5O1xuICAgICAgICBpZiAoIXJvb21zLmhhcyhyb29tSWQpKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICByZXN1bHRbcm9vbXMuZ2V0KHJvb21JZCkucm9vbV90eXBlID09PSBSb29tVHlwZS5TcGFjZSA/IDAgOiAxXS5wdXNoKHJvb21JZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW1tdLCBbXV0pIHx8IFtbXSwgW11dO1xuXG4gICAgY29uc3QgbmV3UGFyZW50cyA9IG5ldyBTZXQocGFyZW50cykuYWRkKHNwYWNlSWQpO1xuICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIHtcbiAgICAgICAgICAgIGNoaWxkUm9vbXMubWFwKHJvb21JZCA9PiAoXG4gICAgICAgICAgICAgICAgPFRpbGVcbiAgICAgICAgICAgICAgICAgICAga2V5PXtyb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3Jvb21zLmdldChyb29tSWQpfVxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWQ9e3JlbGF0aW9ucy5nZXQoc3BhY2VJZCk/LmdldChyb29tSWQpPy5jb250ZW50LnN1Z2dlc3RlZH1cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkTWFwPy5nZXQoc3BhY2VJZCk/Lmhhcyhyb29tSWQpfVxuICAgICAgICAgICAgICAgICAgICBvblZpZXdSb29tQ2xpY2s9eyhhdXRvSm9pbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25WaWV3Um9vbUNsaWNrKHJvb21JZCwgYXV0b0pvaW4pO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBoYXNQZXJtaXNzaW9ucz17aGFzUGVybWlzc2lvbnN9XG4gICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlQ2xpY2s9e29uVG9nZ2xlQ2xpY2sgPyAoKSA9PiBvblRvZ2dsZUNsaWNrKHNwYWNlSWQsIHJvb21JZCkgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkpXG4gICAgICAgIH1cblxuICAgICAgICB7XG4gICAgICAgICAgICBzdWJzcGFjZXMuZmlsdGVyKHJvb21JZCA9PiAhbmV3UGFyZW50cy5oYXMocm9vbUlkKSkubWFwKHJvb21JZCA9PiAoXG4gICAgICAgICAgICAgICAgPFRpbGVcbiAgICAgICAgICAgICAgICAgICAga2V5PXtyb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3Jvb21zLmdldChyb29tSWQpfVxuICAgICAgICAgICAgICAgICAgICBudW1DaGlsZFJvb21zPXtBcnJheS5mcm9tKHJlbGF0aW9ucy5nZXQocm9vbUlkKT8udmFsdWVzKCkgfHwgW10pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGV2ID0+IHJvb21zLmdldChldi5zdGF0ZV9rZXkpPy5yb29tX3R5cGUgIT09IFJvb21UeXBlLlNwYWNlKS5sZW5ndGh9XG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZD17cmVsYXRpb25zLmdldChzcGFjZUlkKT8uZ2V0KHJvb21JZCk/LmNvbnRlbnQuc3VnZ2VzdGVkfVxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0ZWRNYXA/LmdldChzcGFjZUlkKT8uaGFzKHJvb21JZCl9XG4gICAgICAgICAgICAgICAgICAgIG9uVmlld1Jvb21DbGljaz17KGF1dG9Kb2luKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvblZpZXdSb29tQ2xpY2socm9vbUlkLCBhdXRvSm9pbik7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIGhhc1Blcm1pc3Npb25zPXtoYXNQZXJtaXNzaW9uc31cbiAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVDbGljaz17b25Ub2dnbGVDbGljayA/ICgpID0+IG9uVG9nZ2xlQ2xpY2soc3BhY2VJZCwgcm9vbUlkKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxIaWVyYXJjaHlMZXZlbFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhY2VJZD17cm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbXM9e3Jvb21zfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpb25zPXtyZWxhdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRzPXtuZXdQYXJlbnRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRNYXA9e3NlbGVjdGVkTWFwfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25WaWV3Um9vbUNsaWNrPXtvblZpZXdSb29tQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZUNsaWNrPXtvblRvZ2dsZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvVGlsZT5cbiAgICAgICAgICAgICkpXG4gICAgICAgIH1cbiAgICA8L1JlYWN0LkZyYWdtZW50PlxufTtcblxuLy8gbXV0YXRlIGFyZ3VtZW50IHJlZnJlc2hUb2tlbiB0byBmb3JjZSBhIHJlbG9hZFxuZXhwb3J0IGNvbnN0IHVzZVNwYWNlU3VtbWFyeSA9IChjbGk6IE1hdHJpeENsaWVudCwgc3BhY2U6IFJvb20sIHJlZnJlc2hUb2tlbj86IGFueSk6IFtcbiAgICBudWxsLFxuICAgIElTcGFjZVN1bW1hcnlSb29tW10sXG4gICAgTWFwPHN0cmluZywgTWFwPHN0cmluZywgSVNwYWNlU3VtbWFyeUV2ZW50Pj4/LFxuICAgIE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+Pj8sXG4gICAgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+Pyxcbl0gfCBbRXJyb3JdID0+IHtcbiAgICAvLyBUT0RPIHBhZ2luYXRpb25cbiAgICByZXR1cm4gdXNlQXN5bmNNZW1vKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBjbGkuZ2V0U3BhY2VTdW1tYXJ5KHNwYWNlLnJvb21JZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBhcmVudENoaWxkUmVsYXRpb25zID0gbmV3IEVuaGFuY2VkTWFwPHN0cmluZywgTWFwPHN0cmluZywgSVNwYWNlU3VtbWFyeUV2ZW50Pj4oKTtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkUGFyZW50UmVsYXRpb25zID0gbmV3IEVuaGFuY2VkTWFwPHN0cmluZywgU2V0PHN0cmluZz4+KCk7XG4gICAgICAgICAgICBjb25zdCB2aWFNYXAgPSBuZXcgRW5oYW5jZWRNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4oKTtcbiAgICAgICAgICAgIGRhdGEuZXZlbnRzLm1hcCgoZXY6IElTcGFjZVN1bW1hcnlFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChldi50eXBlID09PSBFdmVudFR5cGUuU3BhY2VDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRDaGlsZFJlbGF0aW9ucy5nZXRPckNyZWF0ZShldi5yb29tX2lkLCBuZXcgTWFwKCkpLnNldChldi5zdGF0ZV9rZXksIGV2KTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRQYXJlbnRSZWxhdGlvbnMuZ2V0T3JDcmVhdGUoZXYuc3RhdGVfa2V5LCBuZXcgU2V0KCkpLmFkZChldi5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZXYuY29udGVudFtcInZpYVwiXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0ID0gdmlhTWFwLmdldE9yQ3JlYXRlKGV2LnN0YXRlX2tleSwgbmV3IFNldCgpKTtcbiAgICAgICAgICAgICAgICAgICAgZXYuY29udGVudFtcInZpYVwiXS5mb3JFYWNoKHZpYSA9PiBzZXQuYWRkKHZpYSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gW251bGwsIGRhdGEucm9vbXMgYXMgSVNwYWNlU3VtbWFyeVJvb21bXSwgcGFyZW50Q2hpbGRSZWxhdGlvbnMsIHZpYU1hcCwgY2hpbGRQYXJlbnRSZWxhdGlvbnNdO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpOyAvLyBUT0RPXG4gICAgICAgICAgICByZXR1cm4gW2VdO1xuICAgICAgICB9XG4gICAgfSwgW3NwYWNlLCByZWZyZXNoVG9rZW5dLCBbdW5kZWZpbmVkXSk7XG59O1xuXG5leHBvcnQgY29uc3QgU3BhY2VIaWVyYXJjaHk6IFJlYWN0LkZDPElIaWVyYXJjaHlQcm9wcz4gPSAoe1xuICAgIHNwYWNlLFxuICAgIGluaXRpYWxUZXh0ID0gXCJcIixcbiAgICBzaG93Um9vbSxcbiAgICByZWZyZXNoVG9rZW4sXG4gICAgY2hpbGRyZW4sXG59KSA9PiB7XG4gICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGNvbnN0IHVzZXJJZCA9IGNsaS5nZXRVc2VySWQoKTtcbiAgICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9IHVzZVN0YXRlKGluaXRpYWxUZXh0KTtcblxuICAgIGNvbnN0IFtzZWxlY3RlZCwgc2V0U2VsZWN0ZWRdID0gdXNlU3RhdGUobmV3IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PigpKTsgLy8gTWFwPHBhcmVudElkLCBTZXQ8Y2hpbGRJZD4+XG5cbiAgICBjb25zdCBbc3VtbWFyeUVycm9yLCByb29tcywgcGFyZW50Q2hpbGRNYXAsIHZpYU1hcCwgY2hpbGRQYXJlbnRNYXBdID0gdXNlU3BhY2VTdW1tYXJ5KGNsaSwgc3BhY2UsIHJlZnJlc2hUb2tlbik7XG5cbiAgICBjb25zdCByb29tc01hcCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJvb21zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgbGNRdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuXG4gICAgICAgIGNvbnN0IHJvb21zTWFwID0gbmV3IE1hcDxzdHJpbmcsIElTcGFjZVN1bW1hcnlSb29tPihyb29tcy5tYXAociA9PiBbci5yb29tX2lkLCByXSkpO1xuICAgICAgICBpZiAoIWxjUXVlcnkpIHJldHVybiByb29tc01hcDtcblxuICAgICAgICBjb25zdCBkaXJlY3RNYXRjaGVzID0gcm9vbXMuZmlsdGVyKHIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHIubmFtZT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsY1F1ZXJ5KSB8fCByLnRvcGljPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxjUXVlcnkpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXYWxrIGJhY2sgdXAgdGhlIHRyZWUgdG8gZmluZCBhbGwgcGFyZW50cyBvZiB0aGUgZGlyZWN0IG1hdGNoZXMgdG8gc2hvdyB0aGVpciBwbGFjZSBpbiB0aGUgaGllcmFyY2h5XG4gICAgICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgY29uc3QgcXVldWUgPSBbLi4uZGlyZWN0TWF0Y2hlcy5tYXAociA9PiByLnJvb21faWQpXTtcbiAgICAgICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gcXVldWUucG9wKCk7XG4gICAgICAgICAgICB2aXNpdGVkLmFkZChyb29tSWQpO1xuICAgICAgICAgICAgY2hpbGRQYXJlbnRNYXAuZ2V0KHJvb21JZCk/LmZvckVhY2gocGFyZW50SWQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdmlzaXRlZC5oYXMocGFyZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gocGFyZW50SWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIGFueSBtYXBwaW5ncyBmb3Igcm9vbXMgd2hpY2ggd2VyZSBub3QgdmlzaXRlZCBpbiB0aGUgd2Fsa1xuICAgICAgICBBcnJheS5mcm9tKHJvb21zTWFwLmtleXMoKSkuZm9yRWFjaChyb29tSWQgPT4ge1xuICAgICAgICAgICAgaWYgKCF2aXNpdGVkLmhhcyhyb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgcm9vbXNNYXAuZGVsZXRlKHJvb21JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcm9vbXNNYXA7XG4gICAgfSwgW3Jvb21zLCBjaGlsZFBhcmVudE1hcCwgcXVlcnldKTtcblxuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3QgW3JlbW92aW5nLCBzZXRSZW1vdmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIGlmIChzdW1tYXJ5RXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIDxwPntfdChcIllvdXIgc2VydmVyIGRvZXMgbm90IHN1cHBvcnQgc2hvd2luZyBzcGFjZSBoaWVyYXJjaGllcy5cIil9PC9wPjtcbiAgICB9XG5cbiAgICBsZXQgY29udGVudDtcbiAgICBpZiAocm9vbXNNYXApIHtcbiAgICAgICAgY29uc3QgbnVtUm9vbXMgPSBBcnJheS5mcm9tKHJvb21zTWFwLnZhbHVlcygpKS5maWx0ZXIociA9PiByLnJvb21fdHlwZSAhPT0gUm9vbVR5cGUuU3BhY2UpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgbnVtU3BhY2VzID0gcm9vbXNNYXAuc2l6ZSAtIG51bVJvb21zIC0gMTsgLy8gLTEgYXQgdGhlIGVuZCB0byBleGNsdWRlIHRoZSBzcGFjZSB3ZSBhcmUgbG9va2luZyBhdFxuXG4gICAgICAgIGxldCBjb3VudHNTdHI7XG4gICAgICAgIGlmIChudW1TcGFjZXMgPiAxKSB7XG4gICAgICAgICAgICBjb3VudHNTdHIgPSBfdChcIiUoY291bnQpcyByb29tcyBhbmQgJShudW1TcGFjZXMpcyBzcGFjZXNcIiwgeyBjb3VudDogbnVtUm9vbXMsIG51bVNwYWNlcyB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChudW1TcGFjZXMgPiAwKSB7XG4gICAgICAgICAgICBjb3VudHNTdHIgPSBfdChcIiUoY291bnQpcyByb29tcyBhbmQgMSBzcGFjZVwiLCB7IGNvdW50OiBudW1Sb29tcywgbnVtU3BhY2VzIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY291bnRzU3RyID0gX3QoXCIlKGNvdW50KXMgcm9vbXNcIiwgeyBjb3VudDogbnVtUm9vbXMsIG51bVNwYWNlcyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlZGl0U2VjdGlvbjtcbiAgICAgICAgaWYgKHNwYWNlLmdldE15TWVtYmVyc2hpcCgpID09PSBcImpvaW5cIiAmJiBzcGFjZS5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlNwYWNlQ2hpbGQsIHVzZXJJZCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUmVsYXRpb25zID0gQXJyYXkuZnJvbShzZWxlY3RlZC5rZXlzKCkpLmZsYXRNYXAocGFyZW50SWQgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbLi4uc2VsZWN0ZWQuZ2V0KHBhcmVudElkKS52YWx1ZXMoKV0ubWFwKGNoaWxkSWQgPT4gW3BhcmVudElkLCBjaGlsZElkXSkgYXMgW3N0cmluZywgc3RyaW5nXVtdO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBidXR0b25zO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkUmVsYXRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbkFsbFN1Z2dlc3RlZCA9IHNlbGVjdGVkUmVsYXRpb25zLmV2ZXJ5KChbcGFyZW50SWQsIGNoaWxkSWRdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnRDaGlsZE1hcC5nZXQocGFyZW50SWQpPy5nZXQoY2hpbGRJZCk/LmNvbnRlbnQuc3VnZ2VzdGVkO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzYWJsZWQgPSByZW1vdmluZyB8fCBzYXZpbmc7XG5cbiAgICAgICAgICAgICAgICBidXR0b25zID0gPD5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2FzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRSZW1vdmluZyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtwYXJlbnRJZCwgY2hpbGRJZF0gb2Ygc2VsZWN0ZWRSZWxhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5zZW5kU3RhdGVFdmVudChwYXJlbnRJZCwgRXZlbnRUeXBlLlNwYWNlQ2hpbGQsIHt9LCBjaGlsZElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudENoaWxkTWFwLmdldChwYXJlbnRJZCkuZ2V0KGNoaWxkSWQpLmNvbnRlbnQgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudENoaWxkTWFwLnNldChwYXJlbnRJZCwgbmV3IE1hcChwYXJlbnRDaGlsZE1hcC5nZXQocGFyZW50SWQpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEVycm9yKF90KFwiRmFpbGVkIHRvIHJlbW92ZSBzb21lIHJvb21zLiBUcnkgYWdhaW4gbGF0ZXJcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRSZW1vdmluZyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImRhbmdlcl9vdXRsaW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZW1vdmluZyA/IF90KFwiUmVtb3ZpbmcuLi5cIikgOiBfdChcIlJlbW92ZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2FzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTYXZpbmcodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbcGFyZW50SWQsIGNoaWxkSWRdIG9mIHNlbGVjdGVkUmVsYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWdnZXN0ZWQgPSAhc2VsZWN0aW9uQWxsU3VnZ2VzdGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdDb250ZW50ID0gcGFyZW50Q2hpbGRNYXAuZ2V0KHBhcmVudElkKT8uZ2V0KGNoaWxkSWQpPy5jb250ZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleGlzdGluZ0NvbnRlbnQgfHwgZXhpc3RpbmdDb250ZW50LnN1Z2dlc3RlZCA9PT0gc3VnZ2VzdGVkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5leGlzdGluZ0NvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkOiAhc2VsZWN0aW9uQWxsU3VnZ2VzdGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnNlbmRTdGF0ZUV2ZW50KHBhcmVudElkLCBFdmVudFR5cGUuU3BhY2VDaGlsZCwgY29udGVudCwgY2hpbGRJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudENoaWxkTWFwLmdldChwYXJlbnRJZCkuZ2V0KGNoaWxkSWQpLmNvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Q2hpbGRNYXAuc2V0KHBhcmVudElkLCBuZXcgTWFwKHBhcmVudENoaWxkTWFwLmdldChwYXJlbnRJZCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RXJyb3IoXCJGYWlsZWQgdG8gdXBkYXRlIHNvbWUgc3VnZ2VzdGlvbnMuIFRyeSBhZ2FpbiBsYXRlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2F2aW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeV9vdXRsaW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzYXZpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiU2F2aW5nLi4uXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAoc2VsZWN0aW9uQWxsU3VnZ2VzdGVkID8gX3QoXCJNYXJrIGFzIG5vdCBzdWdnZXN0ZWRcIikgOiBfdChcIk1hcmsgYXMgc3VnZ2VzdGVkXCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlZGl0U2VjdGlvbiA9IDxzcGFuPlxuICAgICAgICAgICAgICAgIHsgYnV0dG9ucyB9XG4gICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlc3VsdHM7XG4gICAgICAgIGlmIChyb29tc01hcC5zaXplKSB7XG4gICAgICAgICAgICBjb25zdCBoYXNQZXJtaXNzaW9ucyA9IHNwYWNlPy5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlNwYWNlQ2hpbGQsIGNsaS5nZXRVc2VySWQoKSk7XG5cbiAgICAgICAgICAgIHJlc3VsdHMgPSA8PlxuICAgICAgICAgICAgICAgIDxIaWVyYXJjaHlMZXZlbFxuICAgICAgICAgICAgICAgICAgICBzcGFjZUlkPXtzcGFjZS5yb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIHJvb21zPXtyb29tc01hcH1cbiAgICAgICAgICAgICAgICAgICAgcmVsYXRpb25zPXtwYXJlbnRDaGlsZE1hcH1cbiAgICAgICAgICAgICAgICAgICAgcGFyZW50cz17bmV3IFNldCgpfVxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZE1hcD17c2VsZWN0ZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlQ2xpY2s9e2hhc1Blcm1pc3Npb25zID8gKHBhcmVudElkLCBjaGlsZElkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRFcnJvcihcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2VsZWN0ZWQuaGFzKHBhcmVudElkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkKG5ldyBNYXAoc2VsZWN0ZWQuc2V0KHBhcmVudElkLCBuZXcgU2V0KFtjaGlsZElkXSkpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnRTZXQgPSBzZWxlY3RlZC5nZXQocGFyZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJlbnRTZXQuaGFzKGNoaWxkSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobmV3IE1hcChzZWxlY3RlZC5zZXQocGFyZW50SWQsIG5ldyBTZXQoWy4uLnBhcmVudFNldCwgY2hpbGRJZF0pKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50U2V0LmRlbGV0ZShjaGlsZElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkKG5ldyBNYXAoc2VsZWN0ZWQuc2V0KHBhcmVudElkLCBuZXcgU2V0KHBhcmVudFNldCkpKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uVmlld1Jvb21DbGljaz17KHJvb21JZCwgYXV0b0pvaW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dSb29tKHJvb21zTWFwLmdldChyb29tSWQpLCBBcnJheS5mcm9tKHZpYU1hcC5nZXQocm9vbUlkKSB8fCBbXSksIGF1dG9Kb2luKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHsgY2hpbGRyZW4gJiYgPGhyIC8+IH1cbiAgICAgICAgICAgIDwvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbURpcmVjdG9yeV9ub1Jlc3VsdHNcIj5cbiAgICAgICAgICAgICAgICA8aDM+eyBfdChcIk5vIHJlc3VsdHMgZm91bmRcIikgfTwvaDM+XG4gICAgICAgICAgICAgICAgPGRpdj57IF90KFwiWW91IG1heSB3YW50IHRvIHRyeSBhIGRpZmZlcmVudCBzZWFyY2ggb3IgY2hlY2sgZm9yIHR5cG9zLlwiKSB9PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZW50ID0gPD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tRGlyZWN0b3J5X2xpc3RIZWFkZXJcIj5cbiAgICAgICAgICAgICAgICB7IGNvdW50c1N0ciB9XG4gICAgICAgICAgICAgICAgeyBlZGl0U2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsgZXJyb3IgJiYgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21EaXJlY3RvcnlfZXJyb3JcIj5cbiAgICAgICAgICAgICAgICB7IGVycm9yIH1cbiAgICAgICAgICAgIDwvZGl2PiB9XG4gICAgICAgICAgICA8QXV0b0hpZGVTY3JvbGxiYXIgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tRGlyZWN0b3J5X2xpc3RcIj5cbiAgICAgICAgICAgICAgICB7IHJlc3VsdHMgfVxuICAgICAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgPC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRlbnQgPSA8U3Bpbm5lciAvPjtcbiAgICB9XG5cbiAgICAvLyBUT0RPIGxvYWRpbmcgc3RhdGUvZXJyb3Igc3RhdGVcbiAgICByZXR1cm4gPD5cbiAgICAgICAgPFNlYXJjaEJveFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfdGV4dGlucHV0X2ljb24gbXhfdGV4dGlucHV0X3NlYXJjaFwiXG4gICAgICAgICAgICBwbGFjZWhvbGRlcj17IF90KFwiU2VhcmNoIG5hbWVzIGFuZCBkZXNjcmlwdGlvblwiKSB9XG4gICAgICAgICAgICBvblNlYXJjaD17c2V0UXVlcnl9XG4gICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICBpbml0aWFsVmFsdWU9e2luaXRpYWxUZXh0fVxuICAgICAgICAvPlxuXG4gICAgICAgIHsgY29udGVudCB9XG4gICAgPC8+O1xufTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgc3BhY2U6IFJvb207XG4gICAgaW5pdGlhbFRleHQ/OiBzdHJpbmc7XG4gICAgb25GaW5pc2hlZCgpOiB2b2lkO1xufVxuXG5jb25zdCBTcGFjZVJvb21EaXJlY3Rvcnk6IFJlYWN0LkZDPElQcm9wcz4gPSAoeyBzcGFjZSwgb25GaW5pc2hlZCwgaW5pdGlhbFRleHQgfSkgPT4ge1xuICAgIGNvbnN0IG9uQ3JlYXRlUm9vbUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19jcmVhdGVfcm9vbScsXG4gICAgICAgICAgICBwdWJsaWM6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IHRpdGxlID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICA8Um9vbUF2YXRhciByb29tPXtzcGFjZX0gaGVpZ2h0PXszMn0gd2lkdGg9ezMyfSAvPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgxPnsgX3QoXCJFeHBsb3JlIHJvb21zXCIpIH08L2gxPlxuICAgICAgICAgICAgPGRpdj48Um9vbU5hbWUgcm9vbT17c3BhY2V9IC8+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tRGlyZWN0b3J5XCIgaGFzQ2FuY2VsPXt0cnVlfSBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfSB0aXRsZT17dGl0bGV9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJJZiB5b3UgY2FuJ3QgZmluZCB0aGUgcm9vbSB5b3UncmUgbG9va2luZyBmb3IsIGFzayBmb3IgYW4gaW52aXRlIG9yIDxhPmNyZWF0ZSBhIG5ldyByb29tPC9hPi5cIixcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAge2E6IHN1YiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXtvbkNyZWF0ZVJvb21DbGlja30+e3N1Yn08L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICAgICAgICAgICAgICB9fSxcbiAgICAgICAgICAgICAgICApIH1cblxuICAgICAgICAgICAgICAgIDxTcGFjZUhpZXJhcmNoeVxuICAgICAgICAgICAgICAgICAgICBzcGFjZT17c3BhY2V9XG4gICAgICAgICAgICAgICAgICAgIHNob3dSb29tPXsocm9vbTogSVNwYWNlU3VtbWFyeVJvb20sIHZpYVNlcnZlcnM/OiBzdHJpbmdbXSwgYXV0b0pvaW4gPSBmYWxzZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1Jvb20ocm9vbSwgdmlhU2VydmVycywgYXV0b0pvaW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsVGV4dD17aW5pdGlhbFRleHR9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25DcmVhdGVSb29tQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21EaXJlY3RvcnlfY3JlYXRlUm9vbVwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDcmVhdGUgcm9vbVwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L1NwYWNlSGllcmFyY2h5PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU3BhY2VSb29tRGlyZWN0b3J5O1xuXG4vLyBTaW1pbGFyIHRvIG1hdHJpeC1yZWFjdC1zZGsncyBNYXRyaXhUb29scy5nZXREaXNwbGF5QWxpYXNGb3JSb29tXG4vLyBidXQgd29ya3Mgd2l0aCB0aGUgb2JqZWN0cyB3ZSBnZXQgZnJvbSB0aGUgcHVibGljIHJvb20gbGlzdFxuZnVuY3Rpb24gZ2V0RGlzcGxheUFsaWFzRm9yUm9vbShyb29tOiBJU3BhY2VTdW1tYXJ5Um9vbSkge1xuICAgIHJldHVybiByb29tLmNhbm9uaWNhbF9hbGlhcyB8fCAocm9vbS5hbGlhc2VzID8gcm9vbS5hbGlhc2VzWzBdIDogXCJcIik7XG59XG4iXX0=
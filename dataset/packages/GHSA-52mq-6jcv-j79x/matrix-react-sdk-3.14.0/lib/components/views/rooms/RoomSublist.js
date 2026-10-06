"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.HEADER_HEIGHT = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _RoomTile = _interopRequireDefault(require("./RoomTile"));

var _ContextMenu = require("../../structures/ContextMenu");

var _RoomListStore = _interopRequireWildcard(require("../../../stores/room-list/RoomListStore"));

var _models = require("../../../stores/room-list/algorithms/models");

var _models2 = require("../../../stores/room-list/models");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _NotificationBadge = _interopRequireDefault(require("./NotificationBadge"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _Keyboard = require("../../../Keyboard");

var _reResizable = require("re-resizable");

var _polyfill = require("../../../@types/polyfill");

var _RoomNotificationStateStore = require("../../../stores/notifications/RoomNotificationStateStore");

var _RoomListLayoutStore = _interopRequireDefault(require("../../../stores/room-list/RoomListLayoutStore"));

var _arrays = require("../../../utils/arrays");

var _objects = require("../../../utils/objects");

var _IconizedContextMenu = _interopRequireDefault(require("../context_menus/IconizedContextMenu"));

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
const SHOW_N_BUTTON_HEIGHT = 28; // As defined by CSS

const RESIZE_HANDLE_HEIGHT = 4; // As defined by CSS

const HEADER_HEIGHT = 32; // As defined by CSS

exports.HEADER_HEIGHT = HEADER_HEIGHT;
const MAX_PADDING_HEIGHT = SHOW_N_BUTTON_HEIGHT + RESIZE_HANDLE_HEIGHT; // HACK: We really shouldn't have to do this.

(0, _polyfill.polyfillTouchEvent)();

class RoomSublist extends React.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "headerButton", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "sublistRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "layout", void 0);
    (0, _defineProperty2.default)(this, "heightAtStart", void 0);
    (0, _defineProperty2.default)(this, "isBeingFiltered", void 0);
    (0, _defineProperty2.default)(this, "notificationState", void 0);
    (0, _defineProperty2.default)(this, "onListsUpdated", () => {
      const stateUpdates
      /*: IState & any*/
      = {}; // &any is to avoid a cast on the initializer

      if (this.props.extraBadTilesThatShouldntExist) {
        const nameCondition = _RoomListStore.default.instance.getFirstNameFilterCondition();

        if (nameCondition) {
          stateUpdates.filteredExtraTiles = this.props.extraBadTilesThatShouldntExist.filter(t => nameCondition.matches(t.props.displayName || ""));
        } else if (this.state.filteredExtraTiles) {
          stateUpdates.filteredExtraTiles = null;
        }
      }

      const currentRooms = this.state.rooms;
      const newRooms = (0, _arrays.arrayFastClone)(_RoomListStore.default.instance.orderedLists[this.props.tagId] || []);

      if ((0, _arrays.arrayHasOrderChange)(currentRooms, newRooms)) {
        stateUpdates.rooms = newRooms;
      }

      const isStillBeingFiltered = !!_RoomListStore.default.instance.getFirstNameFilterCondition();

      if (isStillBeingFiltered !== this.isBeingFiltered) {
        this.isBeingFiltered = isStillBeingFiltered;

        if (isStillBeingFiltered) {
          stateUpdates.isExpanded = true;
        } else {
          stateUpdates.isExpanded = !this.layout.isCollapsed;
        }
      }

      if (Object.keys(stateUpdates).length > 0) {
        this.setState(stateUpdates);
      }
    });
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      if (payload.action === "view_room" && payload.show_room_tile && this.state.rooms) {
        // XXX: we have to do this a tick later because we have incorrect intermediate props during a room change
        // where we lose the room we are changing from temporarily and then it comes back in an update right after.
        setImmediate(() => {
          const roomIndex = this.state.rooms.findIndex(r => r.roomId === payload.room_id);

          if (!this.state.isExpanded && roomIndex > -1) {
            this.toggleCollapsed();
          } // extend the visible section to include the room if it is entirely invisible


          if (roomIndex >= this.numVisibleTiles) {
            this.layout.visibleTiles = this.layout.tilesWithPadding(roomIndex + 1, MAX_PADDING_HEIGHT);
            this.forceUpdate(); // because the layout doesn't trigger a re-render
          }
        });
      }
    });
    (0, _defineProperty2.default)(this, "onAddRoom", e => {
      e.stopPropagation();
      if (this.props.onAddRoom) this.props.onAddRoom();
    });
    (0, _defineProperty2.default)(this, "onResize", (e
    /*: MouseEvent | TouchEvent*/
    , travelDirection
    /*: Direction*/
    , refToElement
    /*: HTMLDivElement*/
    , delta
    /*: ResizeDelta*/
    ) => {
      const newHeight = this.heightAtStart + delta.height;
      this.applyHeightChange(newHeight);
      this.setState({
        height: newHeight
      });
    });
    (0, _defineProperty2.default)(this, "onResizeStart", () => {
      this.heightAtStart = this.state.height;
      this.setState({
        isResizing: true
      });
    });
    (0, _defineProperty2.default)(this, "onResizeStop", (e
    /*: MouseEvent | TouchEvent*/
    , travelDirection
    /*: Direction*/
    , refToElement
    /*: HTMLDivElement*/
    , delta
    /*: ResizeDelta*/
    ) => {
      const newHeight = this.heightAtStart + delta.height;
      this.applyHeightChange(newHeight);
      this.setState({
        isResizing: false,
        height: newHeight
      });
    });
    (0, _defineProperty2.default)(this, "onShowAllClick", () => {
      // read number of visible tiles before we mutate it
      const numVisibleTiles = this.numVisibleTiles;
      const newHeight = this.layout.tilesToPixelsWithPadding(this.numTiles, this.padding);
      this.applyHeightChange(newHeight);
      this.setState({
        height: newHeight
      }, () => {
        // focus the top-most new room
        this.focusRoomTile(numVisibleTiles);
      });
    });
    (0, _defineProperty2.default)(this, "onShowLessClick", () => {
      const newHeight = this.layout.tilesToPixelsWithPadding(this.layout.defaultVisibleTiles, this.padding);
      this.applyHeightChange(newHeight);
      this.setState({
        height: newHeight
      });
    });
    (0, _defineProperty2.default)(this, "focusRoomTile", (index
    /*: number*/
    ) => {
      if (!this.sublistRef.current) return;
      const elements = this.sublistRef.current.querySelectorAll(".mx_RoomTile");
      const element = elements && elements[index];

      if (element) {
        element.focus();
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
          height: 0
        }
      });
    });
    (0, _defineProperty2.default)(this, "onAddRoomContextMenu", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target;
      this.setState({
        addRoomContextMenuPosition: target.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onCloseMenu", () => {
      this.setState({
        contextMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "onCloseAddRoomMenu", () => {
      this.setState({
        addRoomContextMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "onUnreadFirstChanged", async () => {
      const isUnreadFirst = _RoomListStore.default.instance.getListOrder(this.props.tagId) === _models.ListAlgorithm.Importance;

      const newAlgorithm = isUnreadFirst ? _models.ListAlgorithm.Natural : _models.ListAlgorithm.Importance;
      await _RoomListStore.default.instance.setListOrder(this.props.tagId, newAlgorithm);
      this.forceUpdate(); // because if the sublist doesn't have any changes then we will miss the list order change
    });
    (0, _defineProperty2.default)(this, "onTagSortChanged", async (sort
    /*: SortAlgorithm*/
    ) => {
      await _RoomListStore.default.instance.setTagSorting(this.props.tagId, sort);
    });
    (0, _defineProperty2.default)(this, "onMessagePreviewChanged", () => {
      this.layout.showPreviews = !this.layout.showPreviews;
      this.forceUpdate(); // because the layout doesn't trigger a re-render
    });
    (0, _defineProperty2.default)(this, "onBadgeClick", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      let room;

      if (this.props.tagId === _models2.DefaultTagID.Invite) {
        // switch to first room as that'll be the top of the list for the user
        room = this.state.rooms && this.state.rooms[0];
      } else {
        // find the first room with a count of the same colour as the badge count
        room = _RoomListStore.default.instance.unfilteredLists[this.props.tagId].find((r
        /*: Room*/
        ) => {
          const notifState = this.notificationState.getForRoom(r);
          return notifState.count > 0 && notifState.color === this.notificationState.color;
        });
      }

      if (room) {
        _dispatcher.default.dispatch({
          action: 'view_room',
          room_id: room.roomId,
          show_room_tile: true // to make sure the room gets scrolled into view

        });
      }
    });
    (0, _defineProperty2.default)(this, "onHeaderClick", () => {
      const possibleSticky = this.headerButton.current.parentElement;
      const sublist = possibleSticky.parentElement.parentElement;
      const list = sublist.parentElement.parentElement; // the scrollTop is capped at the height of the header in LeftPanel, the top header is always sticky

      const isAtTop = list.scrollTop <= HEADER_HEIGHT;
      const isAtBottom = list.scrollTop >= list.scrollHeight - list.offsetHeight;
      const isStickyTop = possibleSticky.classList.contains('mx_RoomSublist_headerContainer_stickyTop');
      const isStickyBottom = possibleSticky.classList.contains('mx_RoomSublist_headerContainer_stickyBottom');

      if (isStickyBottom && !isAtBottom || isStickyTop && !isAtTop) {
        // is sticky - jump to list
        sublist.scrollIntoView({
          behavior: 'smooth'
        });
      } else {
        // on screen - toggle collapse
        const isExpanded = this.state.isExpanded;
        this.toggleCollapsed(); // if the bottom list is collapsed then scroll it in so it doesn't expand off screen

        if (!isExpanded && isStickyBottom) {
          setImmediate(() => {
            sublist.scrollIntoView({
              behavior: 'smooth'
            });
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "toggleCollapsed", () => {
      this.layout.isCollapsed = this.state.isExpanded;
      this.setState({
        isExpanded: !this.layout.isCollapsed
      });
      setImmediate(() => this.props.onResize()); // needs to happen when the DOM is updated
    });
    (0, _defineProperty2.default)(this, "onHeaderKeyDown", (ev
    /*: React.KeyboardEvent*/
    ) => {
      switch (ev.key) {
        case _Keyboard.Key.ARROW_LEFT:
          ev.stopPropagation();

          if (this.state.isExpanded) {
            // On ARROW_LEFT collapse the room sublist if it isn't already
            this.toggleCollapsed();
          }

          break;

        case _Keyboard.Key.ARROW_RIGHT:
          {
            ev.stopPropagation();

            if (!this.state.isExpanded) {
              // On ARROW_RIGHT expand the room sublist if it isn't already
              this.toggleCollapsed();
            } else if (this.sublistRef.current) {
              // otherwise focus the first room
              const element = this.sublistRef.current.querySelector(".mx_RoomTile");

              if (element) {
                element.focus();
              }
            }

            break;
          }
      }
    });
    (0, _defineProperty2.default)(this, "onKeyDown", (ev
    /*: React.KeyboardEvent*/
    ) => {
      switch (ev.key) {
        // On ARROW_LEFT go to the sublist header
        case _Keyboard.Key.ARROW_LEFT:
          ev.stopPropagation();
          this.headerButton.current.focus();
          break;
        // Consume ARROW_RIGHT so it doesn't cause focus to get sent to composer

        case _Keyboard.Key.ARROW_RIGHT:
          ev.stopPropagation();
      }
    });
    this.layout = _RoomListLayoutStore.default.instance.getLayoutFor(this.props.tagId);
    this.heightAtStart = 0;
    this.isBeingFiltered = !!_RoomListStore.default.instance.getFirstNameFilterCondition();
    this.notificationState = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getListState(this.props.tagId);
    this.state = {
      contextMenuPosition: null,
      addRoomContextMenuPosition: null,
      isResizing: false,
      isExpanded: this.isBeingFiltered ? this.isBeingFiltered : !this.layout.isCollapsed,
      height: 0,
      // to be fixed in a moment, we need `rooms` to calculate this.
      rooms: (0, _arrays.arrayFastClone)(_RoomListStore.default.instance.orderedLists[this.props.tagId] || [])
    }; // Why Object.assign() and not this.state.height? Because TypeScript says no.

    this.state = Object.assign(this.state, {
      height: this.calculateInitialHeight()
    });
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _RoomListStore.default.instance.on(_RoomListStore.LISTS_UPDATE_EVENT, this.onListsUpdated);
  }

  calculateInitialHeight() {
    const requestedVisibleTiles = Math.max(Math.floor(this.layout.visibleTiles), this.layout.minVisibleTiles);
    const tileCount = Math.min(this.numTiles, requestedVisibleTiles);
    return this.layout.tilesToPixelsWithPadding(tileCount, this.padding);
  }

  get padding() {
    let padding = RESIZE_HANDLE_HEIGHT; // this is used for calculating the max height of the whole container,
    // and takes into account whether there should be room reserved for the show more/less button
    // when fully expanded. We can't rely purely on the layout's defaultVisible tile count
    // because there are conditions in which we need to know that the 'show more' button
    // is present while well under the default tile limit.

    const needsShowMore = this.numTiles > this.numVisibleTiles; // ...but also check this or we'll miss if the section is expanded and we need a
    // 'show less'

    const needsShowLess = this.numTiles > this.layout.defaultVisibleTiles;

    if (needsShowMore || needsShowLess) {
      padding += SHOW_N_BUTTON_HEIGHT;
    }

    return padding;
  }

  get extraTiles()
  /*: TemporaryTile[] | null*/
  {
    if (this.state.filteredExtraTiles) {
      return this.state.filteredExtraTiles;
    }

    if (this.props.extraBadTilesThatShouldntExist) {
      return this.props.extraBadTilesThatShouldntExist;
    }

    return null;
  }

  get numTiles()
  /*: number*/
  {
    return RoomSublist.calcNumTiles(this.state.rooms, this.extraTiles);
  }

  static calcNumTiles(rooms
  /*: Room[]*/
  , extraTiles
  /*: any[]*/
  ) {
    return (rooms || []).length + (extraTiles || []).length;
  }

  get numVisibleTiles()
  /*: number*/
  {
    const nVisible = Math.ceil(this.layout.visibleTiles);
    return Math.min(nVisible, this.numTiles);
  }

  componentDidUpdate(prevProps
  /*: Readonly<IProps>*/
  , prevState
  /*: Readonly<IState>*/
  ) {
    const prevExtraTiles = prevState.filteredExtraTiles || prevProps.extraBadTilesThatShouldntExist; // as the rooms can come in one by one we need to reevaluate
    // the amount of available rooms to cap the amount of requested visible rooms by the layout

    if (RoomSublist.calcNumTiles(prevState.rooms, prevExtraTiles) !== this.numTiles) {
      this.setState({
        height: this.calculateInitialHeight()
      });
    }
  }

  shouldComponentUpdate(nextProps
  /*: Readonly<IProps>*/
  , nextState
  /*: Readonly<IState>*/
  )
  /*: boolean*/
  {
    if ((0, _objects.objectHasDiff)(this.props, nextProps)) {
      // Something we don't care to optimize has updated, so update.
      return true;
    } // Do the same check used on props for state, without the rooms we're going to no-op


    const prevStateNoRooms = (0, _objects.objectExcluding)(this.state, ['rooms']);
    const nextStateNoRooms = (0, _objects.objectExcluding)(nextState, ['rooms']);

    if ((0, _objects.objectHasDiff)(prevStateNoRooms, nextStateNoRooms)) {
      return true;
    } // If we're supposed to handle extra tiles, take the performance hit and re-render all the
    // time so we don't have to consider them as part of the visible room optimization.


    const prevExtraTiles = this.props.extraBadTilesThatShouldntExist || [];
    const nextExtraTiles = nextState.filteredExtraTiles || nextProps.extraBadTilesThatShouldntExist || [];

    if (prevExtraTiles.length > 0 || nextExtraTiles.length > 0) {
      return true;
    } // If we're about to update the height of the list, we don't really care about which rooms
    // are visible or not for no-op purposes, so ensure that the height calculation runs through.


    if (RoomSublist.calcNumTiles(nextState.rooms, nextExtraTiles) !== this.numTiles) {
      return true;
    } // Before we go analyzing the rooms, we can see if we're collapsed. If we're collapsed, we don't need
    // to render anything. We do this after the height check though to ensure that the height gets appropriately
    // calculated for when/if we become uncollapsed.


    if (!nextState.isExpanded) {
      return false;
    } // Quickly double check we're not about to break something due to the number of rooms changing.


    if (this.state.rooms.length !== nextState.rooms.length) {
      return true;
    } // Finally, determine if the room update (as presumably that's all that's left) is within
    // our visible range. If it is, then do a render. If the update is outside our visible range
    // then we can skip the update.
    //
    // We also optimize for order changing here: if the update did happen in our visible range
    // but doesn't result in the list re-sorting itself then there's no reason for us to update
    // on our own.


    const prevSlicedRooms = this.state.rooms.slice(0, this.numVisibleTiles);
    const nextSlicedRooms = nextState.rooms.slice(0, this.numVisibleTiles);

    if ((0, _arrays.arrayHasOrderChange)(prevSlicedRooms, nextSlicedRooms)) {
      return true;
    } // Finally, nothing happened so no-op the update


    return false;
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    _RoomListStore.default.instance.off(_RoomListStore.LISTS_UPDATE_EVENT, this.onListsUpdated);
  }

  applyHeightChange(newHeight
  /*: number*/
  ) {
    const heightInTiles = Math.ceil(this.layout.pixelsToTiles(newHeight - this.padding));
    this.layout.visibleTiles = Math.min(this.numTiles, heightInTiles);
  }

  renderVisibleTiles()
  /*: React.ReactElement[]*/
  {
    if (!this.state.isExpanded) {
      // don't waste time on rendering
      return [];
    }

    const tiles
    /*: React.ReactElement[]*/
    = [];

    if (this.state.rooms) {
      const visibleRooms = this.state.rooms.slice(0, this.numVisibleTiles);

      for (const room of visibleRooms) {
        tiles.push( /*#__PURE__*/React.createElement(_RoomTile.default, {
          room: room,
          key: `room-${room.roomId}`,
          showMessagePreview: this.layout.showPreviews,
          isMinimized: this.props.isMinimized,
          tag: this.props.tagId
        }));
      }
    }

    if (this.extraTiles) {
      // HACK: We break typing here, but this 'extra tiles' property shouldn't exist.
      tiles.push(...this.extraTiles);
    } // We only have to do this because of the extra tiles. We do it conditionally
    // to avoid spending cycles on slicing. It's generally fine to do this though
    // as users are unlikely to have more than a handful of tiles when the extra
    // tiles are used.


    if (tiles.length > this.numVisibleTiles) {
      return tiles.slice(0, this.numVisibleTiles);
    }

    return tiles;
  }

  renderMenu()
  /*: React.ReactElement*/
  {
    let contextMenu = null;

    if (this.state.contextMenuPosition) {
      const isAlphabetical = _RoomListStore.default.instance.getTagSorting(this.props.tagId) === _models.SortAlgorithm.Alphabetic;

      const isUnreadFirst = _RoomListStore.default.instance.getListOrder(this.props.tagId) === _models.ListAlgorithm.Importance; // Invites don't get some nonsense options, so only add them if we have to.


      let otherSections = null;

      if (this.props.tagId !== _models2.DefaultTagID.Invite) {
        otherSections = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: "mx_RoomSublist_contextMenu_title"
        }, (0, _languageHandler._t)("Appearance")), /*#__PURE__*/React.createElement(_ContextMenu.StyledMenuItemCheckbox, {
          onClose: this.onCloseMenu,
          onChange: this.onUnreadFirstChanged,
          checked: isUnreadFirst
        }, (0, _languageHandler._t)("Show rooms with unread messages first")), /*#__PURE__*/React.createElement(_ContextMenu.StyledMenuItemCheckbox, {
          onClose: this.onCloseMenu,
          onChange: this.onMessagePreviewChanged,
          checked: this.layout.showPreviews
        }, (0, _languageHandler._t)("Show previews of messages"))));
      }

      contextMenu = /*#__PURE__*/React.createElement(_ContextMenu.ContextMenu, {
        chevronFace: _ContextMenu.ChevronFace.None,
        left: this.state.contextMenuPosition.left,
        top: this.state.contextMenuPosition.top + this.state.contextMenuPosition.height,
        onFinished: this.onCloseMenu
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_contextMenu"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_contextMenu_title"
      }, (0, _languageHandler._t)("Sort by")), /*#__PURE__*/React.createElement(_ContextMenu.StyledMenuItemRadio, {
        onClose: this.onCloseMenu,
        onChange: () => this.onTagSortChanged(_models.SortAlgorithm.Recent),
        checked: !isAlphabetical,
        name: `mx_${this.props.tagId}_sortBy`
      }, (0, _languageHandler._t)("Activity")), /*#__PURE__*/React.createElement(_ContextMenu.StyledMenuItemRadio, {
        onClose: this.onCloseMenu,
        onChange: () => this.onTagSortChanged(_models.SortAlgorithm.Alphabetic),
        checked: isAlphabetical,
        name: `mx_${this.props.tagId}_sortBy`
      }, (0, _languageHandler._t)("A-Z"))), otherSections));
    } else if (this.state.addRoomContextMenuPosition) {
      contextMenu = /*#__PURE__*/React.createElement(_IconizedContextMenu.default, {
        chevronFace: _ContextMenu.ChevronFace.None,
        left: this.state.addRoomContextMenuPosition.left - 7 // center align with the handle
        ,
        top: this.state.addRoomContextMenuPosition.top + this.state.addRoomContextMenuPosition.height,
        onFinished: this.onCloseAddRoomMenu,
        compact: true
      }, this.props.addRoomContextMenu(this.onCloseAddRoomMenu));
    }

    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_ContextMenu.ContextMenuTooltipButton, {
      className: "mx_RoomSublist_menuButton",
      onClick: this.onOpenMenuClick,
      title: (0, _languageHandler._t)("List options"),
      isExpanded: !!this.state.contextMenuPosition
    }), contextMenu);
  }

  renderHeader()
  /*: React.ReactElement*/
  {
    return /*#__PURE__*/React.createElement(_RovingTabIndex.RovingTabIndexWrapper, {
      inputRef: this.headerButton
    }, ({
      onFocus,
      isActive,
      ref
    }) => {
      const tabIndex = isActive ? 0 : -1;
      let ariaLabel = (0, _languageHandler._t)("Jump to first unread room.");

      if (this.props.tagId === _models2.DefaultTagID.Invite) {
        ariaLabel = (0, _languageHandler._t)("Jump to first invite.");
      }

      const badge = /*#__PURE__*/React.createElement(_NotificationBadge.default, {
        forceCount: true,
        notification: this.notificationState,
        onClick: this.onBadgeClick,
        tabIndex: tabIndex,
        "aria-label": ariaLabel
      });
      let addRoomButton = null;

      if (!!this.props.onAddRoom) {
        addRoomButton = /*#__PURE__*/React.createElement(_AccessibleTooltipButton.default, {
          tabIndex: tabIndex,
          onClick: this.onAddRoom,
          className: "mx_RoomSublist_auxButton",
          tooltipClassName: "mx_RoomSublist_addRoomTooltip",
          "aria-label": this.props.addRoomLabel || (0, _languageHandler._t)("Add room"),
          title: this.props.addRoomLabel
        });
      } else if (this.props.addRoomContextMenu) {
        addRoomButton = /*#__PURE__*/React.createElement(_ContextMenu.ContextMenuTooltipButton, {
          tabIndex: tabIndex,
          onClick: this.onAddRoomContextMenu,
          className: "mx_RoomSublist_auxButton",
          tooltipClassName: "mx_RoomSublist_addRoomTooltip",
          "aria-label": this.props.addRoomLabel || (0, _languageHandler._t)("Add room"),
          title: this.props.addRoomLabel,
          isExpanded: !!this.state.addRoomContextMenuPosition
        });
      }

      const collapseClasses = (0, _classnames.default)({
        'mx_RoomSublist_collapseBtn': true,
        'mx_RoomSublist_collapseBtn_collapsed': !this.state.isExpanded
      });
      const classes = (0, _classnames.default)({
        'mx_RoomSublist_headerContainer': true,
        'mx_RoomSublist_headerContainer_withAux': !!addRoomButton
      });
      const badgeContainer = /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_badgeContainer"
      }, badge);
      let Button
      /*: React.ComponentType<React.ComponentProps<typeof AccessibleButton>>*/
      = _AccessibleButton.default;

      if (this.props.isMinimized) {
        Button = _AccessibleTooltipButton.default;
      } // Note: the addRoomButton conditionally gets moved around
      // the DOM depending on whether or not the list is minimized.
      // If we're minimized, we want it below the header so it
      // doesn't become sticky.
      // The same applies to the notification badge.


      return /*#__PURE__*/React.createElement("div", {
        className: classes,
        onKeyDown: this.onHeaderKeyDown,
        onFocus: onFocus,
        "aria-label": this.props.label
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_stickable"
      }, /*#__PURE__*/React.createElement(Button, {
        onFocus: onFocus,
        inputRef: ref,
        tabIndex: tabIndex,
        className: "mx_RoomSublist_headerText",
        role: "treeitem",
        "aria-expanded": this.state.isExpanded,
        "aria-level": 1,
        onClick: this.onHeaderClick,
        onContextMenu: this.onContextMenu,
        title: this.props.isMinimized ? this.props.label : undefined
      }, /*#__PURE__*/React.createElement("span", {
        className: collapseClasses
      }), /*#__PURE__*/React.createElement("span", null, this.props.label)), this.renderMenu(), this.props.isMinimized ? null : badgeContainer, this.props.isMinimized ? null : addRoomButton), this.props.isMinimized ? badgeContainer : null, this.props.isMinimized ? addRoomButton : null);
    });
  }

  onScrollPrevent(e
  /*: React.UIEvent<HTMLDivElement>*/
  ) {
    // the RoomTile calls scrollIntoView and the browser may scroll a div we do not wish to be scrollable
    // this fixes https://github.com/vector-im/element-web/issues/14413
    e.target.scrollTop = 0;
  }

  render()
  /*: React.ReactElement*/
  {
    const visibleTiles = this.renderVisibleTiles();
    const classes = (0, _classnames.default)({
      'mx_RoomSublist': true,
      'mx_RoomSublist_hasMenuOpen': !!this.state.contextMenuPosition,
      'mx_RoomSublist_minimized': this.props.isMinimized
    });
    let content = null;

    if (visibleTiles.length > 0) {
      const layout = this.layout; // to shorten calls

      const minTiles = Math.min(layout.minVisibleTiles, this.numTiles);
      const showMoreAtMinHeight = minTiles < this.numTiles;
      const minHeightPadding = RESIZE_HANDLE_HEIGHT + (showMoreAtMinHeight ? SHOW_N_BUTTON_HEIGHT : 0);
      const minTilesPx = layout.tilesToPixelsWithPadding(minTiles, minHeightPadding);
      const maxTilesPx = layout.tilesToPixelsWithPadding(this.numTiles, this.padding);
      const showMoreBtnClasses = (0, _classnames.default)({
        'mx_RoomSublist_showNButton': true
      }); // If we're hiding rooms, show a 'show more' button to the user. This button
      // floats above the resize handle, if we have one present. If the user has all
      // tiles visible, it becomes 'show less'.

      let showNButton = null;

      if (maxTilesPx > this.state.height) {
        // the height of all the tiles is greater than the section height: we need a 'show more' button
        const nonPaddedHeight = this.state.height - RESIZE_HANDLE_HEIGHT - SHOW_N_BUTTON_HEIGHT;
        const amountFullyShown = Math.floor(nonPaddedHeight / this.layout.tileHeight);
        const numMissing = this.numTiles - amountFullyShown;
        const label = (0, _languageHandler._t)("Show %(count)s more", {
          count: numMissing
        });
        let showMoreText = /*#__PURE__*/React.createElement("span", {
          className: "mx_RoomSublist_showNButtonText"
        }, label);
        if (this.props.isMinimized) showMoreText = null;
        showNButton = /*#__PURE__*/React.createElement(_RovingTabIndex.RovingAccessibleButton, {
          role: "treeitem",
          onClick: this.onShowAllClick,
          className: showMoreBtnClasses,
          "aria-label": label
        }, /*#__PURE__*/React.createElement("span", {
          className: "mx_RoomSublist_showMoreButtonChevron mx_RoomSublist_showNButtonChevron"
        }), showMoreText);
      } else if (this.numTiles > this.layout.defaultVisibleTiles) {
        // we have all tiles visible - add a button to show less
        const label = (0, _languageHandler._t)("Show less");
        let showLessText = /*#__PURE__*/React.createElement("span", {
          className: "mx_RoomSublist_showNButtonText"
        }, label);
        if (this.props.isMinimized) showLessText = null;
        showNButton = /*#__PURE__*/React.createElement(_RovingTabIndex.RovingAccessibleButton, {
          role: "treeitem",
          onClick: this.onShowLessClick,
          className: showMoreBtnClasses,
          "aria-label": label
        }, /*#__PURE__*/React.createElement("span", {
          className: "mx_RoomSublist_showLessButtonChevron mx_RoomSublist_showNButtonChevron"
        }), showLessText);
      } // Figure out if we need a handle


      const handles
      /*: Enable*/
      = {
        bottom: true,
        // the only one we need, but the others must be explicitly false
        bottomLeft: false,
        bottomRight: false,
        left: false,
        right: false,
        top: false,
        topLeft: false,
        topRight: false
      };

      if (layout.visibleTiles >= this.numTiles && this.numTiles <= layout.minVisibleTiles) {
        // we're at a minimum, don't have a bottom handle
        handles.bottom = false;
      } // We have to account for padding so we can accommodate a 'show more' button and
      // the resize handle, which are pinned to the bottom of the container. This is the
      // easiest way to have a resize handle below the button as otherwise we're writing
      // our own resize handling and that doesn't sound fun.
      //
      // The layout class has some helpers for dealing with padding, as we don't want to
      // apply it in all cases. If we apply it in all cases, the resizing feels like it
      // goes backwards and can become wildly incorrect (visibleTiles says 18 when there's
      // only mathematically 7 possible).


      const handleWrapperClasses = (0, _classnames.default)({
        'mx_RoomSublist_resizerHandles': true,
        'mx_RoomSublist_resizerHandles_showNButton': !!showNButton
      });
      content = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_reResizable.Resizable, {
        size: {
          height: this.state.height
        },
        minHeight: minTilesPx,
        maxHeight: maxTilesPx,
        onResizeStart: this.onResizeStart,
        onResizeStop: this.onResizeStop,
        onResize: this.onResize,
        handleWrapperClass: handleWrapperClasses,
        handleClasses: {
          bottom: "mx_RoomSublist_resizerHandle"
        },
        className: "mx_RoomSublist_resizeBox",
        enable: handles
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_tiles",
        onScroll: this.onScrollPrevent
      }, visibleTiles), showNButton));
    } else if (this.props.showSkeleton && this.state.isExpanded) {
      content = /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_skeletonUI"
      });
    }

    return /*#__PURE__*/React.createElement("div", {
      ref: this.sublistRef,
      className: classes,
      role: "group",
      "aria-label": this.props.label,
      onKeyDown: this.onKeyDown
    }, this.renderHeader(), content);
  }

}

exports.default = RoomSublist;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21TdWJsaXN0LnRzeCJdLCJuYW1lcyI6WyJTSE9XX05fQlVUVE9OX0hFSUdIVCIsIlJFU0laRV9IQU5ETEVfSEVJR0hUIiwiSEVBREVSX0hFSUdIVCIsIk1BWF9QQURESU5HX0hFSUdIVCIsIlJvb21TdWJsaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3RhdGVVcGRhdGVzIiwiZXh0cmFCYWRUaWxlc1RoYXRTaG91bGRudEV4aXN0IiwibmFtZUNvbmRpdGlvbiIsIlJvb21MaXN0U3RvcmUiLCJpbnN0YW5jZSIsImdldEZpcnN0TmFtZUZpbHRlckNvbmRpdGlvbiIsImZpbHRlcmVkRXh0cmFUaWxlcyIsImZpbHRlciIsInQiLCJtYXRjaGVzIiwiZGlzcGxheU5hbWUiLCJzdGF0ZSIsImN1cnJlbnRSb29tcyIsInJvb21zIiwibmV3Um9vbXMiLCJvcmRlcmVkTGlzdHMiLCJ0YWdJZCIsImlzU3RpbGxCZWluZ0ZpbHRlcmVkIiwiaXNCZWluZ0ZpbHRlcmVkIiwiaXNFeHBhbmRlZCIsImxheW91dCIsImlzQ29sbGFwc2VkIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInNldFN0YXRlIiwicGF5bG9hZCIsImFjdGlvbiIsInNob3dfcm9vbV90aWxlIiwic2V0SW1tZWRpYXRlIiwicm9vbUluZGV4IiwiZmluZEluZGV4IiwiciIsInJvb21JZCIsInJvb21faWQiLCJ0b2dnbGVDb2xsYXBzZWQiLCJudW1WaXNpYmxlVGlsZXMiLCJ2aXNpYmxlVGlsZXMiLCJ0aWxlc1dpdGhQYWRkaW5nIiwiZm9yY2VVcGRhdGUiLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwib25BZGRSb29tIiwidHJhdmVsRGlyZWN0aW9uIiwicmVmVG9FbGVtZW50IiwiZGVsdGEiLCJuZXdIZWlnaHQiLCJoZWlnaHRBdFN0YXJ0IiwiaGVpZ2h0IiwiYXBwbHlIZWlnaHRDaGFuZ2UiLCJpc1Jlc2l6aW5nIiwidGlsZXNUb1BpeGVsc1dpdGhQYWRkaW5nIiwibnVtVGlsZXMiLCJwYWRkaW5nIiwiZm9jdXNSb29tVGlsZSIsImRlZmF1bHRWaXNpYmxlVGlsZXMiLCJpbmRleCIsInN1Ymxpc3RSZWYiLCJjdXJyZW50IiwiZWxlbWVudHMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZWxlbWVudCIsImZvY3VzIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInRhcmdldCIsImNvbnRleHRNZW51UG9zaXRpb24iLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJsZWZ0IiwiY2xpZW50WCIsInRvcCIsImNsaWVudFkiLCJhZGRSb29tQ29udGV4dE1lbnVQb3NpdGlvbiIsImlzVW5yZWFkRmlyc3QiLCJnZXRMaXN0T3JkZXIiLCJMaXN0QWxnb3JpdGhtIiwiSW1wb3J0YW5jZSIsIm5ld0FsZ29yaXRobSIsIk5hdHVyYWwiLCJzZXRMaXN0T3JkZXIiLCJzb3J0Iiwic2V0VGFnU29ydGluZyIsInNob3dQcmV2aWV3cyIsInJvb20iLCJEZWZhdWx0VGFnSUQiLCJJbnZpdGUiLCJ1bmZpbHRlcmVkTGlzdHMiLCJmaW5kIiwibm90aWZTdGF0ZSIsIm5vdGlmaWNhdGlvblN0YXRlIiwiZ2V0Rm9yUm9vbSIsImNvdW50IiwiY29sb3IiLCJkaXMiLCJkaXNwYXRjaCIsInBvc3NpYmxlU3RpY2t5IiwiaGVhZGVyQnV0dG9uIiwicGFyZW50RWxlbWVudCIsInN1Ymxpc3QiLCJsaXN0IiwiaXNBdFRvcCIsInNjcm9sbFRvcCIsImlzQXRCb3R0b20iLCJzY3JvbGxIZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJpc1N0aWNreVRvcCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaXNTdGlja3lCb3R0b20iLCJzY3JvbGxJbnRvVmlldyIsImJlaGF2aW9yIiwib25SZXNpemUiLCJrZXkiLCJLZXkiLCJBUlJPV19MRUZUIiwiQVJST1dfUklHSFQiLCJxdWVyeVNlbGVjdG9yIiwiUm9vbUxpc3RMYXlvdXRTdG9yZSIsImdldExheW91dEZvciIsIlJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIiwiZ2V0TGlzdFN0YXRlIiwiYXNzaWduIiwiY2FsY3VsYXRlSW5pdGlhbEhlaWdodCIsImRpc3BhdGNoZXJSZWYiLCJkZWZhdWx0RGlzcGF0Y2hlciIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJvbiIsIkxJU1RTX1VQREFURV9FVkVOVCIsIm9uTGlzdHNVcGRhdGVkIiwicmVxdWVzdGVkVmlzaWJsZVRpbGVzIiwiTWF0aCIsIm1heCIsImZsb29yIiwibWluVmlzaWJsZVRpbGVzIiwidGlsZUNvdW50IiwibWluIiwibmVlZHNTaG93TW9yZSIsIm5lZWRzU2hvd0xlc3MiLCJleHRyYVRpbGVzIiwiY2FsY051bVRpbGVzIiwiblZpc2libGUiLCJjZWlsIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwicHJldkV4dHJhVGlsZXMiLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJwcmV2U3RhdGVOb1Jvb21zIiwibmV4dFN0YXRlTm9Sb29tcyIsIm5leHRFeHRyYVRpbGVzIiwicHJldlNsaWNlZFJvb21zIiwic2xpY2UiLCJuZXh0U2xpY2VkUm9vbXMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJvZmYiLCJoZWlnaHRJblRpbGVzIiwicGl4ZWxzVG9UaWxlcyIsInJlbmRlclZpc2libGVUaWxlcyIsInRpbGVzIiwidmlzaWJsZVJvb21zIiwicHVzaCIsImlzTWluaW1pemVkIiwicmVuZGVyTWVudSIsImNvbnRleHRNZW51IiwiaXNBbHBoYWJldGljYWwiLCJnZXRUYWdTb3J0aW5nIiwiU29ydEFsZ29yaXRobSIsIkFscGhhYmV0aWMiLCJvdGhlclNlY3Rpb25zIiwib25DbG9zZU1lbnUiLCJvblVucmVhZEZpcnN0Q2hhbmdlZCIsIm9uTWVzc2FnZVByZXZpZXdDaGFuZ2VkIiwiQ2hldnJvbkZhY2UiLCJOb25lIiwib25UYWdTb3J0Q2hhbmdlZCIsIlJlY2VudCIsIm9uQ2xvc2VBZGRSb29tTWVudSIsImFkZFJvb21Db250ZXh0TWVudSIsIm9uT3Blbk1lbnVDbGljayIsInJlbmRlckhlYWRlciIsIm9uRm9jdXMiLCJpc0FjdGl2ZSIsInJlZiIsInRhYkluZGV4IiwiYXJpYUxhYmVsIiwiYmFkZ2UiLCJvbkJhZGdlQ2xpY2siLCJhZGRSb29tQnV0dG9uIiwiYWRkUm9vbUxhYmVsIiwib25BZGRSb29tQ29udGV4dE1lbnUiLCJjb2xsYXBzZUNsYXNzZXMiLCJjbGFzc2VzIiwiYmFkZ2VDb250YWluZXIiLCJCdXR0b24iLCJBY2Nlc3NpYmxlQnV0dG9uIiwiQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24iLCJvbkhlYWRlcktleURvd24iLCJsYWJlbCIsIm9uSGVhZGVyQ2xpY2siLCJvbkNvbnRleHRNZW51IiwidW5kZWZpbmVkIiwib25TY3JvbGxQcmV2ZW50IiwicmVuZGVyIiwiY29udGVudCIsIm1pblRpbGVzIiwic2hvd01vcmVBdE1pbkhlaWdodCIsIm1pbkhlaWdodFBhZGRpbmciLCJtaW5UaWxlc1B4IiwibWF4VGlsZXNQeCIsInNob3dNb3JlQnRuQ2xhc3NlcyIsInNob3dOQnV0dG9uIiwibm9uUGFkZGVkSGVpZ2h0IiwiYW1vdW50RnVsbHlTaG93biIsInRpbGVIZWlnaHQiLCJudW1NaXNzaW5nIiwic2hvd01vcmVUZXh0Iiwib25TaG93QWxsQ2xpY2siLCJzaG93TGVzc1RleHQiLCJvblNob3dMZXNzQ2xpY2siLCJoYW5kbGVzIiwiYm90dG9tIiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwicmlnaHQiLCJ0b3BMZWZ0IiwidG9wUmlnaHQiLCJoYW5kbGVXcmFwcGVyQ2xhc3NlcyIsIm9uUmVzaXplU3RhcnQiLCJvblJlc2l6ZVN0b3AiLCJzaG93U2tlbGV0b24iLCJvbktleURvd24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBT0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFzQ0EsTUFBTUEsb0JBQW9CLEdBQUcsRUFBN0IsQyxDQUFpQzs7QUFDakMsTUFBTUMsb0JBQW9CLEdBQUcsQ0FBN0IsQyxDQUFnQzs7QUFDekIsTUFBTUMsYUFBYSxHQUFHLEVBQXRCLEMsQ0FBMEI7OztBQUVqQyxNQUFNQyxrQkFBa0IsR0FBR0gsb0JBQW9CLEdBQUdDLG9CQUFsRCxDLENBRUE7O0FBQ0E7O0FBdUNlLE1BQU1HLFdBQU4sU0FBMEJDLEtBQUssQ0FBQ0M7QUFBaEM7QUFBMEQ7QUFTckVDLEVBQUFBLFdBQVcsQ0FBQ0M7QUFBRDtBQUFBLElBQWdCO0FBQ3ZCLFVBQU1BLEtBQU47QUFEdUIscUVBUkosc0JBUUk7QUFBQSxtRUFQTixzQkFPTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwREEySUYsTUFBTTtBQUMzQixZQUFNQztBQUEwQjtBQUFBLFFBQUcsRUFBbkMsQ0FEMkIsQ0FDWTs7QUFFdkMsVUFBSSxLQUFLRCxLQUFMLENBQVdFLDhCQUFmLEVBQStDO0FBQzNDLGNBQU1DLGFBQWEsR0FBR0MsdUJBQWNDLFFBQWQsQ0FBdUJDLDJCQUF2QixFQUF0Qjs7QUFDQSxZQUFJSCxhQUFKLEVBQW1CO0FBQ2ZGLFVBQUFBLFlBQVksQ0FBQ00sa0JBQWIsR0FBa0MsS0FBS1AsS0FBTCxDQUFXRSw4QkFBWCxDQUM3Qk0sTUFENkIsQ0FDdEJDLENBQUMsSUFBSU4sYUFBYSxDQUFDTyxPQUFkLENBQXNCRCxDQUFDLENBQUNULEtBQUYsQ0FBUVcsV0FBUixJQUF1QixFQUE3QyxDQURpQixDQUFsQztBQUVILFNBSEQsTUFHTyxJQUFJLEtBQUtDLEtBQUwsQ0FBV0wsa0JBQWYsRUFBbUM7QUFDdENOLFVBQUFBLFlBQVksQ0FBQ00sa0JBQWIsR0FBa0MsSUFBbEM7QUFDSDtBQUNKOztBQUVELFlBQU1NLFlBQVksR0FBRyxLQUFLRCxLQUFMLENBQVdFLEtBQWhDO0FBQ0EsWUFBTUMsUUFBUSxHQUFHLDRCQUFlWCx1QkFBY0MsUUFBZCxDQUF1QlcsWUFBdkIsQ0FBb0MsS0FBS2hCLEtBQUwsQ0FBV2lCLEtBQS9DLEtBQXlELEVBQXhFLENBQWpCOztBQUNBLFVBQUksaUNBQW9CSixZQUFwQixFQUFrQ0UsUUFBbEMsQ0FBSixFQUFpRDtBQUM3Q2QsUUFBQUEsWUFBWSxDQUFDYSxLQUFiLEdBQXFCQyxRQUFyQjtBQUNIOztBQUVELFlBQU1HLG9CQUFvQixHQUFHLENBQUMsQ0FBQ2QsdUJBQWNDLFFBQWQsQ0FBdUJDLDJCQUF2QixFQUEvQjs7QUFDQSxVQUFJWSxvQkFBb0IsS0FBSyxLQUFLQyxlQUFsQyxFQUFtRDtBQUMvQyxhQUFLQSxlQUFMLEdBQXVCRCxvQkFBdkI7O0FBQ0EsWUFBSUEsb0JBQUosRUFBMEI7QUFDdEJqQixVQUFBQSxZQUFZLENBQUNtQixVQUFiLEdBQTBCLElBQTFCO0FBQ0gsU0FGRCxNQUVPO0FBQ0huQixVQUFBQSxZQUFZLENBQUNtQixVQUFiLEdBQTBCLENBQUMsS0FBS0MsTUFBTCxDQUFZQyxXQUF2QztBQUNIO0FBQ0o7O0FBRUQsVUFBSUMsTUFBTSxDQUFDQyxJQUFQLENBQVl2QixZQUFaLEVBQTBCd0IsTUFBMUIsR0FBbUMsQ0FBdkMsRUFBMEM7QUFDdEMsYUFBS0MsUUFBTCxDQUFjekIsWUFBZDtBQUNIO0FBQ0osS0EzSzBCO0FBQUEsb0RBNktSLENBQUMwQjtBQUFEO0FBQUEsU0FBNEI7QUFDM0MsVUFBSUEsT0FBTyxDQUFDQyxNQUFSLEtBQW1CLFdBQW5CLElBQWtDRCxPQUFPLENBQUNFLGNBQTFDLElBQTRELEtBQUtqQixLQUFMLENBQVdFLEtBQTNFLEVBQWtGO0FBQzlFO0FBQ0E7QUFDQWdCLFFBQUFBLFlBQVksQ0FBQyxNQUFNO0FBQ2YsZ0JBQU1DLFNBQVMsR0FBRyxLQUFLbkIsS0FBTCxDQUFXRSxLQUFYLENBQWlCa0IsU0FBakIsQ0FBNEJDLENBQUQsSUFBT0EsQ0FBQyxDQUFDQyxNQUFGLEtBQWFQLE9BQU8sQ0FBQ1EsT0FBdkQsQ0FBbEI7O0FBRUEsY0FBSSxDQUFDLEtBQUt2QixLQUFMLENBQVdRLFVBQVosSUFBMEJXLFNBQVMsR0FBRyxDQUFDLENBQTNDLEVBQThDO0FBQzFDLGlCQUFLSyxlQUFMO0FBQ0gsV0FMYyxDQU1mOzs7QUFDQSxjQUFJTCxTQUFTLElBQUksS0FBS00sZUFBdEIsRUFBdUM7QUFDbkMsaUJBQUtoQixNQUFMLENBQVlpQixZQUFaLEdBQTJCLEtBQUtqQixNQUFMLENBQVlrQixnQkFBWixDQUE2QlIsU0FBUyxHQUFHLENBQXpDLEVBQTRDcEMsa0JBQTVDLENBQTNCO0FBQ0EsaUJBQUs2QyxXQUFMLEdBRm1DLENBRWY7QUFDdkI7QUFDSixTQVhXLENBQVo7QUFZSDtBQUNKLEtBOUwwQjtBQUFBLHFEQWdNTkMsQ0FBRCxJQUFPO0FBQ3ZCQSxNQUFBQSxDQUFDLENBQUNDLGVBQUY7QUFDQSxVQUFJLEtBQUsxQyxLQUFMLENBQVcyQyxTQUFmLEVBQTBCLEtBQUszQyxLQUFMLENBQVcyQyxTQUFYO0FBQzdCLEtBbk0wQjtBQUFBLG9EQTBNUixDQUNmRjtBQURlO0FBQUEsTUFFZkc7QUFGZTtBQUFBLE1BR2ZDO0FBSGU7QUFBQSxNQUlmQztBQUplO0FBQUEsU0FLZDtBQUNELFlBQU1DLFNBQVMsR0FBRyxLQUFLQyxhQUFMLEdBQXFCRixLQUFLLENBQUNHLE1BQTdDO0FBQ0EsV0FBS0MsaUJBQUwsQ0FBdUJILFNBQXZCO0FBQ0EsV0FBS3JCLFFBQUwsQ0FBYztBQUFDdUIsUUFBQUEsTUFBTSxFQUFFRjtBQUFULE9BQWQ7QUFDSCxLQW5OMEI7QUFBQSx5REFxTkgsTUFBTTtBQUMxQixXQUFLQyxhQUFMLEdBQXFCLEtBQUtwQyxLQUFMLENBQVdxQyxNQUFoQztBQUNBLFdBQUt2QixRQUFMLENBQWM7QUFBQ3lCLFFBQUFBLFVBQVUsRUFBRTtBQUFiLE9BQWQ7QUFDSCxLQXhOMEI7QUFBQSx3REEwTkosQ0FDbkJWO0FBRG1CO0FBQUEsTUFFbkJHO0FBRm1CO0FBQUEsTUFHbkJDO0FBSG1CO0FBQUEsTUFJbkJDO0FBSm1CO0FBQUEsU0FLbEI7QUFDRCxZQUFNQyxTQUFTLEdBQUcsS0FBS0MsYUFBTCxHQUFxQkYsS0FBSyxDQUFDRyxNQUE3QztBQUNBLFdBQUtDLGlCQUFMLENBQXVCSCxTQUF2QjtBQUNBLFdBQUtyQixRQUFMLENBQWM7QUFBQ3lCLFFBQUFBLFVBQVUsRUFBRSxLQUFiO0FBQW9CRixRQUFBQSxNQUFNLEVBQUVGO0FBQTVCLE9BQWQ7QUFDSCxLQW5PMEI7QUFBQSwwREFxT0YsTUFBTTtBQUMzQjtBQUNBLFlBQU1WLGVBQWUsR0FBRyxLQUFLQSxlQUE3QjtBQUNBLFlBQU1VLFNBQVMsR0FBRyxLQUFLMUIsTUFBTCxDQUFZK0Isd0JBQVosQ0FBcUMsS0FBS0MsUUFBMUMsRUFBb0QsS0FBS0MsT0FBekQsQ0FBbEI7QUFDQSxXQUFLSixpQkFBTCxDQUF1QkgsU0FBdkI7QUFDQSxXQUFLckIsUUFBTCxDQUFjO0FBQUN1QixRQUFBQSxNQUFNLEVBQUVGO0FBQVQsT0FBZCxFQUFtQyxNQUFNO0FBQ3JDO0FBQ0EsYUFBS1EsYUFBTCxDQUFtQmxCLGVBQW5CO0FBQ0gsT0FIRDtBQUlILEtBOU8wQjtBQUFBLDJEQWdQRCxNQUFNO0FBQzVCLFlBQU1VLFNBQVMsR0FBRyxLQUFLMUIsTUFBTCxDQUFZK0Isd0JBQVosQ0FBcUMsS0FBSy9CLE1BQUwsQ0FBWW1DLG1CQUFqRCxFQUFzRSxLQUFLRixPQUEzRSxDQUFsQjtBQUNBLFdBQUtKLGlCQUFMLENBQXVCSCxTQUF2QjtBQUNBLFdBQUtyQixRQUFMLENBQWM7QUFBQ3VCLFFBQUFBLE1BQU0sRUFBRUY7QUFBVCxPQUFkO0FBQ0gsS0FwUDBCO0FBQUEseURBc1BILENBQUNVO0FBQUQ7QUFBQSxTQUFtQjtBQUN2QyxVQUFJLENBQUMsS0FBS0MsVUFBTCxDQUFnQkMsT0FBckIsRUFBOEI7QUFDOUIsWUFBTUMsUUFBUSxHQUFHLEtBQUtGLFVBQUwsQ0FBZ0JDLE9BQWhCLENBQXdCRSxnQkFBeEIsQ0FBeUQsY0FBekQsQ0FBakI7QUFDQSxZQUFNQyxPQUFPLEdBQUdGLFFBQVEsSUFBSUEsUUFBUSxDQUFDSCxLQUFELENBQXBDOztBQUNBLFVBQUlLLE9BQUosRUFBYTtBQUNUQSxRQUFBQSxPQUFPLENBQUNDLEtBQVI7QUFDSDtBQUNKLEtBN1AwQjtBQUFBLDJEQStQRCxDQUFDQztBQUFEO0FBQUEsU0FBMEI7QUFDaERBLE1BQUFBLEVBQUUsQ0FBQ0MsY0FBSDtBQUNBRCxNQUFBQSxFQUFFLENBQUN0QixlQUFIO0FBQ0EsWUFBTXdCLE1BQU0sR0FBR0YsRUFBRSxDQUFDRSxNQUFsQjtBQUNBLFdBQUt4QyxRQUFMLENBQWM7QUFBQ3lDLFFBQUFBLG1CQUFtQixFQUFFRCxNQUFNLENBQUNFLHFCQUFQO0FBQXRCLE9BQWQ7QUFDSCxLQXBRMEI7QUFBQSx5REFzUUgsQ0FBQ0o7QUFBRDtBQUFBLFNBQTBCO0FBQzlDQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFDQUQsTUFBQUEsRUFBRSxDQUFDdEIsZUFBSDtBQUNBLFdBQUtoQixRQUFMLENBQWM7QUFDVnlDLFFBQUFBLG1CQUFtQixFQUFFO0FBQ2pCRSxVQUFBQSxJQUFJLEVBQUVMLEVBQUUsQ0FBQ00sT0FEUTtBQUVqQkMsVUFBQUEsR0FBRyxFQUFFUCxFQUFFLENBQUNRLE9BRlM7QUFHakJ2QixVQUFBQSxNQUFNLEVBQUU7QUFIUztBQURYLE9BQWQ7QUFPSCxLQWhSMEI7QUFBQSxnRUFrUkksQ0FBQ2U7QUFBRDtBQUFBLFNBQTBCO0FBQ3JEQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFDQUQsTUFBQUEsRUFBRSxDQUFDdEIsZUFBSDtBQUNBLFlBQU13QixNQUFNLEdBQUdGLEVBQUUsQ0FBQ0UsTUFBbEI7QUFDQSxXQUFLeEMsUUFBTCxDQUFjO0FBQUMrQyxRQUFBQSwwQkFBMEIsRUFBRVAsTUFBTSxDQUFDRSxxQkFBUDtBQUE3QixPQUFkO0FBQ0gsS0F2UjBCO0FBQUEsdURBeVJMLE1BQU07QUFDeEIsV0FBSzFDLFFBQUwsQ0FBYztBQUFDeUMsUUFBQUEsbUJBQW1CLEVBQUU7QUFBdEIsT0FBZDtBQUNILEtBM1IwQjtBQUFBLDhEQTZSRSxNQUFNO0FBQy9CLFdBQUt6QyxRQUFMLENBQWM7QUFBQytDLFFBQUFBLDBCQUEwQixFQUFFO0FBQTdCLE9BQWQ7QUFDSCxLQS9SMEI7QUFBQSxnRUFpU0ksWUFBWTtBQUN2QyxZQUFNQyxhQUFhLEdBQUd0RSx1QkFBY0MsUUFBZCxDQUF1QnNFLFlBQXZCLENBQW9DLEtBQUszRSxLQUFMLENBQVdpQixLQUEvQyxNQUEwRDJELHNCQUFjQyxVQUE5Rjs7QUFDQSxZQUFNQyxZQUFZLEdBQUdKLGFBQWEsR0FBR0Usc0JBQWNHLE9BQWpCLEdBQTJCSCxzQkFBY0MsVUFBM0U7QUFDQSxZQUFNekUsdUJBQWNDLFFBQWQsQ0FBdUIyRSxZQUF2QixDQUFvQyxLQUFLaEYsS0FBTCxDQUFXaUIsS0FBL0MsRUFBc0Q2RCxZQUF0RCxDQUFOO0FBQ0EsV0FBS3RDLFdBQUwsR0FKdUMsQ0FJbkI7QUFDdkIsS0F0UzBCO0FBQUEsNERBd1NBLE9BQU95QztBQUFQO0FBQUEsU0FBK0I7QUFDdEQsWUFBTTdFLHVCQUFjQyxRQUFkLENBQXVCNkUsYUFBdkIsQ0FBcUMsS0FBS2xGLEtBQUwsQ0FBV2lCLEtBQWhELEVBQXVEZ0UsSUFBdkQsQ0FBTjtBQUNILEtBMVMwQjtBQUFBLG1FQTRTTyxNQUFNO0FBQ3BDLFdBQUs1RCxNQUFMLENBQVk4RCxZQUFaLEdBQTJCLENBQUMsS0FBSzlELE1BQUwsQ0FBWThELFlBQXhDO0FBQ0EsV0FBSzNDLFdBQUwsR0FGb0MsQ0FFaEI7QUFDdkIsS0EvUzBCO0FBQUEsd0RBaVRKLENBQUN3QjtBQUFEO0FBQUEsU0FBMEI7QUFDN0NBLE1BQUFBLEVBQUUsQ0FBQ0MsY0FBSDtBQUNBRCxNQUFBQSxFQUFFLENBQUN0QixlQUFIO0FBRUEsVUFBSTBDLElBQUo7O0FBQ0EsVUFBSSxLQUFLcEYsS0FBTCxDQUFXaUIsS0FBWCxLQUFxQm9FLHNCQUFhQyxNQUF0QyxFQUE4QztBQUMxQztBQUNBRixRQUFBQSxJQUFJLEdBQUcsS0FBS3hFLEtBQUwsQ0FBV0UsS0FBWCxJQUFvQixLQUFLRixLQUFMLENBQVdFLEtBQVgsQ0FBaUIsQ0FBakIsQ0FBM0I7QUFDSCxPQUhELE1BR087QUFDSDtBQUNBc0UsUUFBQUEsSUFBSSxHQUFHaEYsdUJBQWNDLFFBQWQsQ0FBdUJrRixlQUF2QixDQUF1QyxLQUFLdkYsS0FBTCxDQUFXaUIsS0FBbEQsRUFBeUR1RSxJQUF6RCxDQUE4RCxDQUFDdkQ7QUFBRDtBQUFBLGFBQWE7QUFDOUUsZ0JBQU13RCxVQUFVLEdBQUcsS0FBS0MsaUJBQUwsQ0FBdUJDLFVBQXZCLENBQWtDMUQsQ0FBbEMsQ0FBbkI7QUFDQSxpQkFBT3dELFVBQVUsQ0FBQ0csS0FBWCxHQUFtQixDQUFuQixJQUF3QkgsVUFBVSxDQUFDSSxLQUFYLEtBQXFCLEtBQUtILGlCQUFMLENBQXVCRyxLQUEzRTtBQUNILFNBSE0sQ0FBUDtBQUlIOztBQUVELFVBQUlULElBQUosRUFBVTtBQUNOVSw0QkFBSUMsUUFBSixDQUFhO0FBQ1RuRSxVQUFBQSxNQUFNLEVBQUUsV0FEQztBQUVUTyxVQUFBQSxPQUFPLEVBQUVpRCxJQUFJLENBQUNsRCxNQUZMO0FBR1RMLFVBQUFBLGNBQWMsRUFBRSxJQUhQLENBR2E7O0FBSGIsU0FBYjtBQUtIO0FBQ0osS0F4VTBCO0FBQUEseURBMFVILE1BQU07QUFDMUIsWUFBTW1FLGNBQWMsR0FBRyxLQUFLQyxZQUFMLENBQWtCdEMsT0FBbEIsQ0FBMEJ1QyxhQUFqRDtBQUNBLFlBQU1DLE9BQU8sR0FBR0gsY0FBYyxDQUFDRSxhQUFmLENBQTZCQSxhQUE3QztBQUNBLFlBQU1FLElBQUksR0FBR0QsT0FBTyxDQUFDRCxhQUFSLENBQXNCQSxhQUFuQyxDQUgwQixDQUkxQjs7QUFDQSxZQUFNRyxPQUFPLEdBQUdELElBQUksQ0FBQ0UsU0FBTCxJQUFrQjVHLGFBQWxDO0FBQ0EsWUFBTTZHLFVBQVUsR0FBR0gsSUFBSSxDQUFDRSxTQUFMLElBQWtCRixJQUFJLENBQUNJLFlBQUwsR0FBb0JKLElBQUksQ0FBQ0ssWUFBOUQ7QUFDQSxZQUFNQyxXQUFXLEdBQUdWLGNBQWMsQ0FBQ1csU0FBZixDQUF5QkMsUUFBekIsQ0FBa0MsMENBQWxDLENBQXBCO0FBQ0EsWUFBTUMsY0FBYyxHQUFHYixjQUFjLENBQUNXLFNBQWYsQ0FBeUJDLFFBQXpCLENBQWtDLDZDQUFsQyxDQUF2Qjs7QUFFQSxVQUFLQyxjQUFjLElBQUksQ0FBQ04sVUFBcEIsSUFBb0NHLFdBQVcsSUFBSSxDQUFDTCxPQUF4RCxFQUFrRTtBQUM5RDtBQUNBRixRQUFBQSxPQUFPLENBQUNXLGNBQVIsQ0FBdUI7QUFBQ0MsVUFBQUEsUUFBUSxFQUFFO0FBQVgsU0FBdkI7QUFDSCxPQUhELE1BR087QUFDSDtBQUNBLGNBQU0zRixVQUFVLEdBQUcsS0FBS1IsS0FBTCxDQUFXUSxVQUE5QjtBQUNBLGFBQUtnQixlQUFMLEdBSEcsQ0FJSDs7QUFDQSxZQUFJLENBQUNoQixVQUFELElBQWV5RixjQUFuQixFQUFtQztBQUMvQi9FLFVBQUFBLFlBQVksQ0FBQyxNQUFNO0FBQ2ZxRSxZQUFBQSxPQUFPLENBQUNXLGNBQVIsQ0FBdUI7QUFBQ0MsY0FBQUEsUUFBUSxFQUFFO0FBQVgsYUFBdkI7QUFDSCxXQUZXLENBQVo7QUFHSDtBQUNKO0FBQ0osS0FsVzBCO0FBQUEsMkRBb1dELE1BQU07QUFDNUIsV0FBSzFGLE1BQUwsQ0FBWUMsV0FBWixHQUEwQixLQUFLVixLQUFMLENBQVdRLFVBQXJDO0FBQ0EsV0FBS00sUUFBTCxDQUFjO0FBQUNOLFFBQUFBLFVBQVUsRUFBRSxDQUFDLEtBQUtDLE1BQUwsQ0FBWUM7QUFBMUIsT0FBZDtBQUNBUSxNQUFBQSxZQUFZLENBQUMsTUFBTSxLQUFLOUIsS0FBTCxDQUFXZ0gsUUFBWCxFQUFQLENBQVosQ0FINEIsQ0FHZTtBQUM5QyxLQXhXMEI7QUFBQSwyREEwV0QsQ0FBQ2hEO0FBQUQ7QUFBQSxTQUE2QjtBQUNuRCxjQUFRQSxFQUFFLENBQUNpRCxHQUFYO0FBQ0ksYUFBS0MsY0FBSUMsVUFBVDtBQUNJbkQsVUFBQUEsRUFBRSxDQUFDdEIsZUFBSDs7QUFDQSxjQUFJLEtBQUs5QixLQUFMLENBQVdRLFVBQWYsRUFBMkI7QUFDdkI7QUFDQSxpQkFBS2dCLGVBQUw7QUFDSDs7QUFDRDs7QUFDSixhQUFLOEUsY0FBSUUsV0FBVDtBQUFzQjtBQUNsQnBELFlBQUFBLEVBQUUsQ0FBQ3RCLGVBQUg7O0FBQ0EsZ0JBQUksQ0FBQyxLQUFLOUIsS0FBTCxDQUFXUSxVQUFoQixFQUE0QjtBQUN4QjtBQUNBLG1CQUFLZ0IsZUFBTDtBQUNILGFBSEQsTUFHTyxJQUFJLEtBQUtzQixVQUFMLENBQWdCQyxPQUFwQixFQUE2QjtBQUNoQztBQUNBLG9CQUFNRyxPQUFPLEdBQUcsS0FBS0osVUFBTCxDQUFnQkMsT0FBaEIsQ0FBd0IwRCxhQUF4QixDQUFzQyxjQUF0QyxDQUFoQjs7QUFDQSxrQkFBSXZELE9BQUosRUFBYTtBQUNUQSxnQkFBQUEsT0FBTyxDQUFDQyxLQUFSO0FBQ0g7QUFDSjs7QUFDRDtBQUNIO0FBckJMO0FBdUJILEtBbFkwQjtBQUFBLHFEQW9ZUCxDQUFDQztBQUFEO0FBQUEsU0FBNkI7QUFDN0MsY0FBUUEsRUFBRSxDQUFDaUQsR0FBWDtBQUNJO0FBQ0EsYUFBS0MsY0FBSUMsVUFBVDtBQUNJbkQsVUFBQUEsRUFBRSxDQUFDdEIsZUFBSDtBQUNBLGVBQUt1RCxZQUFMLENBQWtCdEMsT0FBbEIsQ0FBMEJJLEtBQTFCO0FBQ0E7QUFDSjs7QUFDQSxhQUFLbUQsY0FBSUUsV0FBVDtBQUNJcEQsVUFBQUEsRUFBRSxDQUFDdEIsZUFBSDtBQVJSO0FBVUgsS0EvWTBCO0FBR3ZCLFNBQUtyQixNQUFMLEdBQWNpRyw2QkFBb0JqSCxRQUFwQixDQUE2QmtILFlBQTdCLENBQTBDLEtBQUt2SCxLQUFMLENBQVdpQixLQUFyRCxDQUFkO0FBQ0EsU0FBSytCLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxTQUFLN0IsZUFBTCxHQUF1QixDQUFDLENBQUNmLHVCQUFjQyxRQUFkLENBQXVCQywyQkFBdkIsRUFBekI7QUFDQSxTQUFLb0YsaUJBQUwsR0FBeUI4Qix1REFBMkJuSCxRQUEzQixDQUFvQ29ILFlBQXBDLENBQWlELEtBQUt6SCxLQUFMLENBQVdpQixLQUE1RCxDQUF6QjtBQUNBLFNBQUtMLEtBQUwsR0FBYTtBQUNUdUQsTUFBQUEsbUJBQW1CLEVBQUUsSUFEWjtBQUVUTSxNQUFBQSwwQkFBMEIsRUFBRSxJQUZuQjtBQUdUdEIsTUFBQUEsVUFBVSxFQUFFLEtBSEg7QUFJVC9CLE1BQUFBLFVBQVUsRUFBRSxLQUFLRCxlQUFMLEdBQXVCLEtBQUtBLGVBQTVCLEdBQThDLENBQUMsS0FBS0UsTUFBTCxDQUFZQyxXQUo5RDtBQUtUMkIsTUFBQUEsTUFBTSxFQUFFLENBTEM7QUFLRTtBQUNYbkMsTUFBQUEsS0FBSyxFQUFFLDRCQUFlVix1QkFBY0MsUUFBZCxDQUF1QlcsWUFBdkIsQ0FBb0MsS0FBS2hCLEtBQUwsQ0FBV2lCLEtBQS9DLEtBQXlELEVBQXhFO0FBTkUsS0FBYixDQVB1QixDQWV2Qjs7QUFDQSxTQUFLTCxLQUFMLEdBQWFXLE1BQU0sQ0FBQ21HLE1BQVAsQ0FBYyxLQUFLOUcsS0FBbkIsRUFBMEI7QUFBQ3FDLE1BQUFBLE1BQU0sRUFBRSxLQUFLMEUsc0JBQUw7QUFBVCxLQUExQixDQUFiO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQkMsb0JBQWtCQyxRQUFsQixDQUEyQixLQUFLQyxRQUFoQyxDQUFyQjs7QUFDQTNILDJCQUFjQyxRQUFkLENBQXVCMkgsRUFBdkIsQ0FBMEJDLGlDQUExQixFQUE4QyxLQUFLQyxjQUFuRDtBQUNIOztBQUVPUCxFQUFBQSxzQkFBUixHQUFpQztBQUM3QixVQUFNUSxxQkFBcUIsR0FBR0MsSUFBSSxDQUFDQyxHQUFMLENBQVNELElBQUksQ0FBQ0UsS0FBTCxDQUFXLEtBQUtqSCxNQUFMLENBQVlpQixZQUF2QixDQUFULEVBQStDLEtBQUtqQixNQUFMLENBQVlrSCxlQUEzRCxDQUE5QjtBQUNBLFVBQU1DLFNBQVMsR0FBR0osSUFBSSxDQUFDSyxHQUFMLENBQVMsS0FBS3BGLFFBQWQsRUFBd0I4RSxxQkFBeEIsQ0FBbEI7QUFDQSxXQUFPLEtBQUs5RyxNQUFMLENBQVkrQix3QkFBWixDQUFxQ29GLFNBQXJDLEVBQWdELEtBQUtsRixPQUFyRCxDQUFQO0FBQ0g7O0FBRUQsTUFBWUEsT0FBWixHQUFzQjtBQUNsQixRQUFJQSxPQUFPLEdBQUc3RCxvQkFBZCxDQURrQixDQUVsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLFVBQU1pSixhQUFhLEdBQUcsS0FBS3JGLFFBQUwsR0FBZ0IsS0FBS2hCLGVBQTNDLENBUGtCLENBU2xCO0FBQ0E7O0FBQ0EsVUFBTXNHLGFBQWEsR0FBRyxLQUFLdEYsUUFBTCxHQUFnQixLQUFLaEMsTUFBTCxDQUFZbUMsbUJBQWxEOztBQUVBLFFBQUlrRixhQUFhLElBQUlDLGFBQXJCLEVBQW9DO0FBQ2hDckYsTUFBQUEsT0FBTyxJQUFJOUQsb0JBQVg7QUFDSDs7QUFDRCxXQUFPOEQsT0FBUDtBQUNIOztBQUVELE1BQVlzRixVQUFaO0FBQUE7QUFBaUQ7QUFDN0MsUUFBSSxLQUFLaEksS0FBTCxDQUFXTCxrQkFBZixFQUFtQztBQUMvQixhQUFPLEtBQUtLLEtBQUwsQ0FBV0wsa0JBQWxCO0FBQ0g7O0FBQ0QsUUFBSSxLQUFLUCxLQUFMLENBQVdFLDhCQUFmLEVBQStDO0FBQzNDLGFBQU8sS0FBS0YsS0FBTCxDQUFXRSw4QkFBbEI7QUFDSDs7QUFDRCxXQUFPLElBQVA7QUFDSDs7QUFFRCxNQUFZbUQsUUFBWjtBQUFBO0FBQStCO0FBQzNCLFdBQU96RCxXQUFXLENBQUNpSixZQUFaLENBQXlCLEtBQUtqSSxLQUFMLENBQVdFLEtBQXBDLEVBQTJDLEtBQUs4SCxVQUFoRCxDQUFQO0FBQ0g7O0FBRUQsU0FBZUMsWUFBZixDQUE0Qi9IO0FBQTVCO0FBQUEsSUFBMkM4SDtBQUEzQztBQUFBLElBQThEO0FBQzFELFdBQU8sQ0FBQzlILEtBQUssSUFBSSxFQUFWLEVBQWNXLE1BQWQsR0FBdUIsQ0FBQ21ILFVBQVUsSUFBSSxFQUFmLEVBQW1CbkgsTUFBakQ7QUFDSDs7QUFFRCxNQUFZWSxlQUFaO0FBQUE7QUFBc0M7QUFDbEMsVUFBTXlHLFFBQVEsR0FBR1YsSUFBSSxDQUFDVyxJQUFMLENBQVUsS0FBSzFILE1BQUwsQ0FBWWlCLFlBQXRCLENBQWpCO0FBQ0EsV0FBTzhGLElBQUksQ0FBQ0ssR0FBTCxDQUFTSyxRQUFULEVBQW1CLEtBQUt6RixRQUF4QixDQUFQO0FBQ0g7O0FBRU0yRixFQUFBQSxrQkFBUCxDQUEwQkM7QUFBMUI7QUFBQSxJQUF1REM7QUFBdkQ7QUFBQSxJQUFvRjtBQUNoRixVQUFNQyxjQUFjLEdBQUdELFNBQVMsQ0FBQzNJLGtCQUFWLElBQWdDMEksU0FBUyxDQUFDL0ksOEJBQWpFLENBRGdGLENBRWhGO0FBQ0E7O0FBQ0EsUUFBSU4sV0FBVyxDQUFDaUosWUFBWixDQUF5QkssU0FBUyxDQUFDcEksS0FBbkMsRUFBMENxSSxjQUExQyxNQUE4RCxLQUFLOUYsUUFBdkUsRUFBaUY7QUFDN0UsV0FBSzNCLFFBQUwsQ0FBYztBQUFDdUIsUUFBQUEsTUFBTSxFQUFFLEtBQUswRSxzQkFBTDtBQUFULE9BQWQ7QUFDSDtBQUNKOztBQUVNeUIsRUFBQUEscUJBQVAsQ0FBNkJDO0FBQTdCO0FBQUEsSUFBMERDO0FBQTFEO0FBQUE7QUFBQTtBQUFnRztBQUM1RixRQUFJLDRCQUFjLEtBQUt0SixLQUFuQixFQUEwQnFKLFNBQTFCLENBQUosRUFBMEM7QUFDdEM7QUFDQSxhQUFPLElBQVA7QUFDSCxLQUoyRixDQU01Rjs7O0FBQ0EsVUFBTUUsZ0JBQWdCLEdBQUcsOEJBQWdCLEtBQUszSSxLQUFyQixFQUE0QixDQUFDLE9BQUQsQ0FBNUIsQ0FBekI7QUFDQSxVQUFNNEksZ0JBQWdCLEdBQUcsOEJBQWdCRixTQUFoQixFQUEyQixDQUFDLE9BQUQsQ0FBM0IsQ0FBekI7O0FBQ0EsUUFBSSw0QkFBY0MsZ0JBQWQsRUFBZ0NDLGdCQUFoQyxDQUFKLEVBQXVEO0FBQ25ELGFBQU8sSUFBUDtBQUNILEtBWDJGLENBYTVGO0FBQ0E7OztBQUNBLFVBQU1MLGNBQWMsR0FBRyxLQUFLbkosS0FBTCxDQUFXRSw4QkFBWCxJQUE2QyxFQUFwRTtBQUNBLFVBQU11SixjQUFjLEdBQUlILFNBQVMsQ0FBQy9JLGtCQUFWLElBQWdDOEksU0FBUyxDQUFDbkosOEJBQTNDLElBQThFLEVBQXJHOztBQUNBLFFBQUlpSixjQUFjLENBQUMxSCxNQUFmLEdBQXdCLENBQXhCLElBQTZCZ0ksY0FBYyxDQUFDaEksTUFBZixHQUF3QixDQUF6RCxFQUE0RDtBQUN4RCxhQUFPLElBQVA7QUFDSCxLQW5CMkYsQ0FxQjVGO0FBQ0E7OztBQUNBLFFBQUk3QixXQUFXLENBQUNpSixZQUFaLENBQXlCUyxTQUFTLENBQUN4SSxLQUFuQyxFQUEwQzJJLGNBQTFDLE1BQThELEtBQUtwRyxRQUF2RSxFQUFpRjtBQUM3RSxhQUFPLElBQVA7QUFDSCxLQXpCMkYsQ0EyQjVGO0FBQ0E7QUFDQTs7O0FBQ0EsUUFBSSxDQUFDaUcsU0FBUyxDQUFDbEksVUFBZixFQUEyQjtBQUN2QixhQUFPLEtBQVA7QUFDSCxLQWhDMkYsQ0FrQzVGOzs7QUFDQSxRQUFJLEtBQUtSLEtBQUwsQ0FBV0UsS0FBWCxDQUFpQlcsTUFBakIsS0FBNEI2SCxTQUFTLENBQUN4SSxLQUFWLENBQWdCVyxNQUFoRCxFQUF3RDtBQUNwRCxhQUFPLElBQVA7QUFDSCxLQXJDMkYsQ0F1QzVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxVQUFNaUksZUFBZSxHQUFHLEtBQUs5SSxLQUFMLENBQVdFLEtBQVgsQ0FBaUI2SSxLQUFqQixDQUF1QixDQUF2QixFQUEwQixLQUFLdEgsZUFBL0IsQ0FBeEI7QUFDQSxVQUFNdUgsZUFBZSxHQUFHTixTQUFTLENBQUN4SSxLQUFWLENBQWdCNkksS0FBaEIsQ0FBc0IsQ0FBdEIsRUFBeUIsS0FBS3RILGVBQTlCLENBQXhCOztBQUNBLFFBQUksaUNBQW9CcUgsZUFBcEIsRUFBcUNFLGVBQXJDLENBQUosRUFBMkQ7QUFDdkQsYUFBTyxJQUFQO0FBQ0gsS0FsRDJGLENBb0Q1Rjs7O0FBQ0EsV0FBTyxLQUFQO0FBQ0g7O0FBRU1DLEVBQUFBLG9CQUFQLEdBQThCO0FBQzFCaEMsd0JBQWtCaUMsVUFBbEIsQ0FBNkIsS0FBS2xDLGFBQWxDOztBQUNBeEgsMkJBQWNDLFFBQWQsQ0FBdUIwSixHQUF2QixDQUEyQjlCLGlDQUEzQixFQUErQyxLQUFLQyxjQUFwRDtBQUNIOztBQTRET2hGLEVBQUFBLGlCQUFSLENBQTBCSDtBQUExQjtBQUFBLElBQTZDO0FBQ3pDLFVBQU1pSCxhQUFhLEdBQUc1QixJQUFJLENBQUNXLElBQUwsQ0FBVSxLQUFLMUgsTUFBTCxDQUFZNEksYUFBWixDQUEwQmxILFNBQVMsR0FBRyxLQUFLTyxPQUEzQyxDQUFWLENBQXRCO0FBQ0EsU0FBS2pDLE1BQUwsQ0FBWWlCLFlBQVosR0FBMkI4RixJQUFJLENBQUNLLEdBQUwsQ0FBUyxLQUFLcEYsUUFBZCxFQUF3QjJHLGFBQXhCLENBQTNCO0FBQ0g7O0FBeU1PRSxFQUFBQSxrQkFBUjtBQUFBO0FBQW1EO0FBQy9DLFFBQUksQ0FBQyxLQUFLdEosS0FBTCxDQUFXUSxVQUFoQixFQUE0QjtBQUN4QjtBQUNBLGFBQU8sRUFBUDtBQUNIOztBQUVELFVBQU0rSTtBQUEyQjtBQUFBLE1BQUcsRUFBcEM7O0FBRUEsUUFBSSxLQUFLdkosS0FBTCxDQUFXRSxLQUFmLEVBQXNCO0FBQ2xCLFlBQU1zSixZQUFZLEdBQUcsS0FBS3hKLEtBQUwsQ0FBV0UsS0FBWCxDQUFpQjZJLEtBQWpCLENBQXVCLENBQXZCLEVBQTBCLEtBQUt0SCxlQUEvQixDQUFyQjs7QUFDQSxXQUFLLE1BQU0rQyxJQUFYLElBQW1CZ0YsWUFBbkIsRUFBaUM7QUFDN0JELFFBQUFBLEtBQUssQ0FBQ0UsSUFBTixlQUFXLG9CQUFDLGlCQUFEO0FBQ1AsVUFBQSxJQUFJLEVBQUVqRixJQURDO0FBRVAsVUFBQSxHQUFHLEVBQUcsUUFBT0EsSUFBSSxDQUFDbEQsTUFBTyxFQUZsQjtBQUdQLFVBQUEsa0JBQWtCLEVBQUUsS0FBS2IsTUFBTCxDQUFZOEQsWUFIekI7QUFJUCxVQUFBLFdBQVcsRUFBRSxLQUFLbkYsS0FBTCxDQUFXc0ssV0FKakI7QUFLUCxVQUFBLEdBQUcsRUFBRSxLQUFLdEssS0FBTCxDQUFXaUI7QUFMVCxVQUFYO0FBT0g7QUFDSjs7QUFFRCxRQUFJLEtBQUsySCxVQUFULEVBQXFCO0FBQ2pCO0FBQ0N1QixNQUFBQSxLQUFELENBQWlCRSxJQUFqQixDQUFzQixHQUFHLEtBQUt6QixVQUE5QjtBQUNILEtBeEI4QyxDQTBCL0M7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFFBQUl1QixLQUFLLENBQUMxSSxNQUFOLEdBQWUsS0FBS1ksZUFBeEIsRUFBeUM7QUFDckMsYUFBTzhILEtBQUssQ0FBQ1IsS0FBTixDQUFZLENBQVosRUFBZSxLQUFLdEgsZUFBcEIsQ0FBUDtBQUNIOztBQUVELFdBQU84SCxLQUFQO0FBQ0g7O0FBRU9JLEVBQUFBLFVBQVI7QUFBQTtBQUF5QztBQUNyQyxRQUFJQyxXQUFXLEdBQUcsSUFBbEI7O0FBQ0EsUUFBSSxLQUFLNUosS0FBTCxDQUFXdUQsbUJBQWYsRUFBb0M7QUFDaEMsWUFBTXNHLGNBQWMsR0FBR3JLLHVCQUFjQyxRQUFkLENBQXVCcUssYUFBdkIsQ0FBcUMsS0FBSzFLLEtBQUwsQ0FBV2lCLEtBQWhELE1BQTJEMEosc0JBQWNDLFVBQWhHOztBQUNBLFlBQU1sRyxhQUFhLEdBQUd0RSx1QkFBY0MsUUFBZCxDQUF1QnNFLFlBQXZCLENBQW9DLEtBQUszRSxLQUFMLENBQVdpQixLQUEvQyxNQUEwRDJELHNCQUFjQyxVQUE5RixDQUZnQyxDQUloQzs7O0FBQ0EsVUFBSWdHLGFBQWEsR0FBRyxJQUFwQjs7QUFDQSxVQUFJLEtBQUs3SyxLQUFMLENBQVdpQixLQUFYLEtBQXFCb0Usc0JBQWFDLE1BQXRDLEVBQThDO0FBQzFDdUYsUUFBQUEsYUFBYSxnQkFDVCxvQkFBQyxLQUFELENBQU8sUUFBUCxxQkFDSSwrQkFESixlQUVJLDhDQUNJO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZixXQUFtRCx5QkFBRyxZQUFILENBQW5ELENBREosZUFFSSxvQkFBQyxtQ0FBRDtBQUNJLFVBQUEsT0FBTyxFQUFFLEtBQUtDLFdBRGxCO0FBRUksVUFBQSxRQUFRLEVBQUUsS0FBS0Msb0JBRm5CO0FBR0ksVUFBQSxPQUFPLEVBQUVyRztBQUhiLFdBS0sseUJBQUcsdUNBQUgsQ0FMTCxDQUZKLGVBU0ksb0JBQUMsbUNBQUQ7QUFDSSxVQUFBLE9BQU8sRUFBRSxLQUFLb0csV0FEbEI7QUFFSSxVQUFBLFFBQVEsRUFBRSxLQUFLRSx1QkFGbkI7QUFHSSxVQUFBLE9BQU8sRUFBRSxLQUFLM0osTUFBTCxDQUFZOEQ7QUFIekIsV0FLSyx5QkFBRywyQkFBSCxDQUxMLENBVEosQ0FGSixDQURKO0FBc0JIOztBQUVEcUYsTUFBQUEsV0FBVyxnQkFDUCxvQkFBQyx3QkFBRDtBQUNJLFFBQUEsV0FBVyxFQUFFUyx5QkFBWUMsSUFEN0I7QUFFSSxRQUFBLElBQUksRUFBRSxLQUFLdEssS0FBTCxDQUFXdUQsbUJBQVgsQ0FBK0JFLElBRnpDO0FBR0ksUUFBQSxHQUFHLEVBQUUsS0FBS3pELEtBQUwsQ0FBV3VELG1CQUFYLENBQStCSSxHQUEvQixHQUFxQyxLQUFLM0QsS0FBTCxDQUFXdUQsbUJBQVgsQ0FBK0JsQixNQUg3RTtBQUlJLFFBQUEsVUFBVSxFQUFFLEtBQUs2SDtBQUpyQixzQkFNSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0ksOENBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQW1ELHlCQUFHLFNBQUgsQ0FBbkQsQ0FESixlQUVJLG9CQUFDLGdDQUFEO0FBQ0ksUUFBQSxPQUFPLEVBQUUsS0FBS0EsV0FEbEI7QUFFSSxRQUFBLFFBQVEsRUFBRSxNQUFNLEtBQUtLLGdCQUFMLENBQXNCUixzQkFBY1MsTUFBcEMsQ0FGcEI7QUFHSSxRQUFBLE9BQU8sRUFBRSxDQUFDWCxjQUhkO0FBSUksUUFBQSxJQUFJLEVBQUcsTUFBSyxLQUFLekssS0FBTCxDQUFXaUIsS0FBTTtBQUpqQyxTQU1LLHlCQUFHLFVBQUgsQ0FOTCxDQUZKLGVBVUksb0JBQUMsZ0NBQUQ7QUFDSSxRQUFBLE9BQU8sRUFBRSxLQUFLNkosV0FEbEI7QUFFSSxRQUFBLFFBQVEsRUFBRSxNQUFNLEtBQUtLLGdCQUFMLENBQXNCUixzQkFBY0MsVUFBcEMsQ0FGcEI7QUFHSSxRQUFBLE9BQU8sRUFBRUgsY0FIYjtBQUlJLFFBQUEsSUFBSSxFQUFHLE1BQUssS0FBS3pLLEtBQUwsQ0FBV2lCLEtBQU07QUFKakMsU0FNSyx5QkFBRyxLQUFILENBTkwsQ0FWSixDQURKLEVBb0JLNEosYUFwQkwsQ0FOSixDQURKO0FBK0JILEtBOURELE1BOERPLElBQUksS0FBS2pLLEtBQUwsQ0FBVzZELDBCQUFmLEVBQTJDO0FBQzlDK0YsTUFBQUEsV0FBVyxnQkFDUCxvQkFBQyw0QkFBRDtBQUNJLFFBQUEsV0FBVyxFQUFFUyx5QkFBWUMsSUFEN0I7QUFFSSxRQUFBLElBQUksRUFBRSxLQUFLdEssS0FBTCxDQUFXNkQsMEJBQVgsQ0FBc0NKLElBQXRDLEdBQTZDLENBRnZELENBRTBEO0FBRjFEO0FBR0ksUUFBQSxHQUFHLEVBQUUsS0FBS3pELEtBQUwsQ0FBVzZELDBCQUFYLENBQXNDRixHQUF0QyxHQUE0QyxLQUFLM0QsS0FBTCxDQUFXNkQsMEJBQVgsQ0FBc0N4QixNQUgzRjtBQUlJLFFBQUEsVUFBVSxFQUFFLEtBQUtvSSxrQkFKckI7QUFLSSxRQUFBLE9BQU87QUFMWCxTQU9LLEtBQUtyTCxLQUFMLENBQVdzTCxrQkFBWCxDQUE4QixLQUFLRCxrQkFBbkMsQ0FQTCxDQURKO0FBV0g7O0FBRUQsd0JBQ0ksb0JBQUMsS0FBRCxDQUFPLFFBQVAscUJBQ0ksb0JBQUMscUNBQUQ7QUFDSSxNQUFBLFNBQVMsRUFBQywyQkFEZDtBQUVJLE1BQUEsT0FBTyxFQUFFLEtBQUtFLGVBRmxCO0FBR0ksTUFBQSxLQUFLLEVBQUUseUJBQUcsY0FBSCxDQUhYO0FBSUksTUFBQSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUszSyxLQUFMLENBQVd1RDtBQUo3QixNQURKLEVBT0txRyxXQVBMLENBREo7QUFXSDs7QUFFT2dCLEVBQUFBLFlBQVI7QUFBQTtBQUEyQztBQUN2Qyx3QkFDSSxvQkFBQyxxQ0FBRDtBQUF1QixNQUFBLFFBQVEsRUFBRSxLQUFLdkY7QUFBdEMsT0FDSyxDQUFDO0FBQUN3RixNQUFBQSxPQUFEO0FBQVVDLE1BQUFBLFFBQVY7QUFBb0JDLE1BQUFBO0FBQXBCLEtBQUQsS0FBOEI7QUFDM0IsWUFBTUMsUUFBUSxHQUFHRixRQUFRLEdBQUcsQ0FBSCxHQUFPLENBQUMsQ0FBakM7QUFFQSxVQUFJRyxTQUFTLEdBQUcseUJBQUcsNEJBQUgsQ0FBaEI7O0FBQ0EsVUFBSSxLQUFLN0wsS0FBTCxDQUFXaUIsS0FBWCxLQUFxQm9FLHNCQUFhQyxNQUF0QyxFQUE4QztBQUMxQ3VHLFFBQUFBLFNBQVMsR0FBRyx5QkFBRyx1QkFBSCxDQUFaO0FBQ0g7O0FBRUQsWUFBTUMsS0FBSyxnQkFDUCxvQkFBQywwQkFBRDtBQUNJLFFBQUEsVUFBVSxFQUFFLElBRGhCO0FBRUksUUFBQSxZQUFZLEVBQUUsS0FBS3BHLGlCQUZ2QjtBQUdJLFFBQUEsT0FBTyxFQUFFLEtBQUtxRyxZQUhsQjtBQUlJLFFBQUEsUUFBUSxFQUFFSCxRQUpkO0FBS0ksc0JBQVlDO0FBTGhCLFFBREo7QUFVQSxVQUFJRyxhQUFhLEdBQUcsSUFBcEI7O0FBQ0EsVUFBSSxDQUFDLENBQUMsS0FBS2hNLEtBQUwsQ0FBVzJDLFNBQWpCLEVBQTRCO0FBQ3hCcUosUUFBQUEsYUFBYSxnQkFDVCxvQkFBQyxnQ0FBRDtBQUNJLFVBQUEsUUFBUSxFQUFFSixRQURkO0FBRUksVUFBQSxPQUFPLEVBQUUsS0FBS2pKLFNBRmxCO0FBR0ksVUFBQSxTQUFTLEVBQUMsMEJBSGQ7QUFJSSxVQUFBLGdCQUFnQixFQUFDLCtCQUpyQjtBQUtJLHdCQUFZLEtBQUszQyxLQUFMLENBQVdpTSxZQUFYLElBQTJCLHlCQUFHLFVBQUgsQ0FMM0M7QUFNSSxVQUFBLEtBQUssRUFBRSxLQUFLak0sS0FBTCxDQUFXaU07QUFOdEIsVUFESjtBQVVILE9BWEQsTUFXTyxJQUFJLEtBQUtqTSxLQUFMLENBQVdzTCxrQkFBZixFQUFtQztBQUN0Q1UsUUFBQUEsYUFBYSxnQkFDVCxvQkFBQyxxQ0FBRDtBQUNJLFVBQUEsUUFBUSxFQUFFSixRQURkO0FBRUksVUFBQSxPQUFPLEVBQUUsS0FBS00sb0JBRmxCO0FBR0ksVUFBQSxTQUFTLEVBQUMsMEJBSGQ7QUFJSSxVQUFBLGdCQUFnQixFQUFDLCtCQUpyQjtBQUtJLHdCQUFZLEtBQUtsTSxLQUFMLENBQVdpTSxZQUFYLElBQTJCLHlCQUFHLFVBQUgsQ0FMM0M7QUFNSSxVQUFBLEtBQUssRUFBRSxLQUFLak0sS0FBTCxDQUFXaU0sWUFOdEI7QUFPSSxVQUFBLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBS3JMLEtBQUwsQ0FBVzZEO0FBUDdCLFVBREo7QUFXSDs7QUFFRCxZQUFNMEgsZUFBZSxHQUFHLHlCQUFXO0FBQy9CLHNDQUE4QixJQURDO0FBRS9CLGdEQUF3QyxDQUFDLEtBQUt2TCxLQUFMLENBQVdRO0FBRnJCLE9BQVgsQ0FBeEI7QUFLQSxZQUFNZ0wsT0FBTyxHQUFHLHlCQUFXO0FBQ3ZCLDBDQUFrQyxJQURYO0FBRXZCLGtEQUEwQyxDQUFDLENBQUNKO0FBRnJCLE9BQVgsQ0FBaEI7QUFLQSxZQUFNSyxjQUFjLGdCQUNoQjtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsU0FDS1AsS0FETCxDQURKO0FBTUEsVUFBSVE7QUFBMEU7QUFBQSxRQUFHQyx5QkFBakY7O0FBQ0EsVUFBSSxLQUFLdk0sS0FBTCxDQUFXc0ssV0FBZixFQUE0QjtBQUN4QmdDLFFBQUFBLE1BQU0sR0FBR0UsZ0NBQVQ7QUFDSCxPQS9EMEIsQ0FpRTNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLDBCQUNJO0FBQ0ksUUFBQSxTQUFTLEVBQUVKLE9BRGY7QUFFSSxRQUFBLFNBQVMsRUFBRSxLQUFLSyxlQUZwQjtBQUdJLFFBQUEsT0FBTyxFQUFFaEIsT0FIYjtBQUlJLHNCQUFZLEtBQUt6TCxLQUFMLENBQVcwTTtBQUozQixzQkFNSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0ksb0JBQUMsTUFBRDtBQUNJLFFBQUEsT0FBTyxFQUFFakIsT0FEYjtBQUVJLFFBQUEsUUFBUSxFQUFFRSxHQUZkO0FBR0ksUUFBQSxRQUFRLEVBQUVDLFFBSGQ7QUFJSSxRQUFBLFNBQVMsRUFBQywyQkFKZDtBQUtJLFFBQUEsSUFBSSxFQUFDLFVBTFQ7QUFNSSx5QkFBZSxLQUFLaEwsS0FBTCxDQUFXUSxVQU45QjtBQU9JLHNCQUFZLENBUGhCO0FBUUksUUFBQSxPQUFPLEVBQUUsS0FBS3VMLGFBUmxCO0FBU0ksUUFBQSxhQUFhLEVBQUUsS0FBS0MsYUFUeEI7QUFVSSxRQUFBLEtBQUssRUFBRSxLQUFLNU0sS0FBTCxDQUFXc0ssV0FBWCxHQUF5QixLQUFLdEssS0FBTCxDQUFXME0sS0FBcEMsR0FBNENHO0FBVnZELHNCQVlJO0FBQU0sUUFBQSxTQUFTLEVBQUVWO0FBQWpCLFFBWkosZUFhSSxrQ0FBTyxLQUFLbk0sS0FBTCxDQUFXME0sS0FBbEIsQ0FiSixDQURKLEVBZ0JLLEtBQUtuQyxVQUFMLEVBaEJMLEVBaUJLLEtBQUt2SyxLQUFMLENBQVdzSyxXQUFYLEdBQXlCLElBQXpCLEdBQWdDK0IsY0FqQnJDLEVBa0JLLEtBQUtyTSxLQUFMLENBQVdzSyxXQUFYLEdBQXlCLElBQXpCLEdBQWdDMEIsYUFsQnJDLENBTkosRUEwQkssS0FBS2hNLEtBQUwsQ0FBV3NLLFdBQVgsR0FBeUIrQixjQUF6QixHQUEwQyxJQTFCL0MsRUEyQkssS0FBS3JNLEtBQUwsQ0FBV3NLLFdBQVgsR0FBeUIwQixhQUF6QixHQUF5QyxJQTNCOUMsQ0FESjtBQStCSCxLQXRHTCxDQURKO0FBMEdIOztBQUVPYyxFQUFBQSxlQUFSLENBQXdCcks7QUFBeEI7QUFBQSxJQUEwRDtBQUN0RDtBQUNBO0FBQ0NBLElBQUFBLENBQUMsQ0FBQ3lCLE1BQUgsQ0FBNkJvQyxTQUE3QixHQUF5QyxDQUF6QztBQUNIOztBQUVNeUcsRUFBQUEsTUFBUDtBQUFBO0FBQW9DO0FBQ2hDLFVBQU16SyxZQUFZLEdBQUcsS0FBSzRILGtCQUFMLEVBQXJCO0FBQ0EsVUFBTWtDLE9BQU8sR0FBRyx5QkFBVztBQUN2Qix3QkFBa0IsSUFESztBQUV2QixvQ0FBOEIsQ0FBQyxDQUFDLEtBQUt4TCxLQUFMLENBQVd1RCxtQkFGcEI7QUFHdkIsa0NBQTRCLEtBQUtuRSxLQUFMLENBQVdzSztBQUhoQixLQUFYLENBQWhCO0FBTUEsUUFBSTBDLE9BQU8sR0FBRyxJQUFkOztBQUNBLFFBQUkxSyxZQUFZLENBQUNiLE1BQWIsR0FBc0IsQ0FBMUIsRUFBNkI7QUFDekIsWUFBTUosTUFBTSxHQUFHLEtBQUtBLE1BQXBCLENBRHlCLENBQ0c7O0FBRTVCLFlBQU00TCxRQUFRLEdBQUc3RSxJQUFJLENBQUNLLEdBQUwsQ0FBU3BILE1BQU0sQ0FBQ2tILGVBQWhCLEVBQWlDLEtBQUtsRixRQUF0QyxDQUFqQjtBQUNBLFlBQU02SixtQkFBbUIsR0FBR0QsUUFBUSxHQUFHLEtBQUs1SixRQUE1QztBQUNBLFlBQU04SixnQkFBZ0IsR0FBRzFOLG9CQUFvQixJQUFJeU4sbUJBQW1CLEdBQUcxTixvQkFBSCxHQUEwQixDQUFqRCxDQUE3QztBQUNBLFlBQU00TixVQUFVLEdBQUcvTCxNQUFNLENBQUMrQix3QkFBUCxDQUFnQzZKLFFBQWhDLEVBQTBDRSxnQkFBMUMsQ0FBbkI7QUFDQSxZQUFNRSxVQUFVLEdBQUdoTSxNQUFNLENBQUMrQix3QkFBUCxDQUFnQyxLQUFLQyxRQUFyQyxFQUErQyxLQUFLQyxPQUFwRCxDQUFuQjtBQUNBLFlBQU1nSyxrQkFBa0IsR0FBRyx5QkFBVztBQUNsQyxzQ0FBOEI7QUFESSxPQUFYLENBQTNCLENBUnlCLENBWXpCO0FBQ0E7QUFDQTs7QUFDQSxVQUFJQyxXQUFXLEdBQUcsSUFBbEI7O0FBRUEsVUFBSUYsVUFBVSxHQUFHLEtBQUt6TSxLQUFMLENBQVdxQyxNQUE1QixFQUFvQztBQUNoQztBQUNBLGNBQU11SyxlQUFlLEdBQUcsS0FBSzVNLEtBQUwsQ0FBV3FDLE1BQVgsR0FBb0J4RCxvQkFBcEIsR0FBMkNELG9CQUFuRTtBQUNBLGNBQU1pTyxnQkFBZ0IsR0FBR3JGLElBQUksQ0FBQ0UsS0FBTCxDQUFXa0YsZUFBZSxHQUFHLEtBQUtuTSxNQUFMLENBQVlxTSxVQUF6QyxDQUF6QjtBQUNBLGNBQU1DLFVBQVUsR0FBRyxLQUFLdEssUUFBTCxHQUFnQm9LLGdCQUFuQztBQUNBLGNBQU1mLEtBQUssR0FBRyx5QkFBRyxxQkFBSCxFQUEwQjtBQUFDOUcsVUFBQUEsS0FBSyxFQUFFK0g7QUFBUixTQUExQixDQUFkO0FBQ0EsWUFBSUMsWUFBWSxnQkFDWjtBQUFNLFVBQUEsU0FBUyxFQUFDO0FBQWhCLFdBQ0tsQixLQURMLENBREo7QUFLQSxZQUFJLEtBQUsxTSxLQUFMLENBQVdzSyxXQUFmLEVBQTRCc0QsWUFBWSxHQUFHLElBQWY7QUFDNUJMLFFBQUFBLFdBQVcsZ0JBQ1Asb0JBQUMsc0NBQUQ7QUFDSSxVQUFBLElBQUksRUFBQyxVQURUO0FBRUksVUFBQSxPQUFPLEVBQUUsS0FBS00sY0FGbEI7QUFHSSxVQUFBLFNBQVMsRUFBRVAsa0JBSGY7QUFJSSx3QkFBWVo7QUFKaEIsd0JBTUk7QUFBTSxVQUFBLFNBQVMsRUFBQztBQUFoQixVQU5KLEVBU0trQixZQVRMLENBREo7QUFhSCxPQXpCRCxNQXlCTyxJQUFJLEtBQUt2SyxRQUFMLEdBQWdCLEtBQUtoQyxNQUFMLENBQVltQyxtQkFBaEMsRUFBcUQ7QUFDeEQ7QUFDQSxjQUFNa0osS0FBSyxHQUFHLHlCQUFHLFdBQUgsQ0FBZDtBQUNBLFlBQUlvQixZQUFZLGdCQUNaO0FBQU0sVUFBQSxTQUFTLEVBQUM7QUFBaEIsV0FDS3BCLEtBREwsQ0FESjtBQUtBLFlBQUksS0FBSzFNLEtBQUwsQ0FBV3NLLFdBQWYsRUFBNEJ3RCxZQUFZLEdBQUcsSUFBZjtBQUM1QlAsUUFBQUEsV0FBVyxnQkFDUCxvQkFBQyxzQ0FBRDtBQUNJLFVBQUEsSUFBSSxFQUFDLFVBRFQ7QUFFSSxVQUFBLE9BQU8sRUFBRSxLQUFLUSxlQUZsQjtBQUdJLFVBQUEsU0FBUyxFQUFFVCxrQkFIZjtBQUlJLHdCQUFZWjtBQUpoQix3QkFNSTtBQUFNLFVBQUEsU0FBUyxFQUFDO0FBQWhCLFVBTkosRUFTS29CLFlBVEwsQ0FESjtBQWFILE9BaEV3QixDQWtFekI7OztBQUNBLFlBQU1FO0FBQWU7QUFBQSxRQUFHO0FBQ3BCQyxRQUFBQSxNQUFNLEVBQUUsSUFEWTtBQUNOO0FBQ2RDLFFBQUFBLFVBQVUsRUFBRSxLQUZRO0FBR3BCQyxRQUFBQSxXQUFXLEVBQUUsS0FITztBQUlwQjlKLFFBQUFBLElBQUksRUFBRSxLQUpjO0FBS3BCK0osUUFBQUEsS0FBSyxFQUFFLEtBTGE7QUFNcEI3SixRQUFBQSxHQUFHLEVBQUUsS0FOZTtBQU9wQjhKLFFBQUFBLE9BQU8sRUFBRSxLQVBXO0FBUXBCQyxRQUFBQSxRQUFRLEVBQUU7QUFSVSxPQUF4Qjs7QUFVQSxVQUFJak4sTUFBTSxDQUFDaUIsWUFBUCxJQUF1QixLQUFLZSxRQUE1QixJQUF3QyxLQUFLQSxRQUFMLElBQWlCaEMsTUFBTSxDQUFDa0gsZUFBcEUsRUFBcUY7QUFDakY7QUFDQXlGLFFBQUFBLE9BQU8sQ0FBQ0MsTUFBUixHQUFpQixLQUFqQjtBQUNILE9BaEZ3QixDQWtGekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQSxZQUFNTSxvQkFBb0IsR0FBRyx5QkFBVztBQUNwQyx5Q0FBaUMsSUFERztBQUVwQyxxREFBNkMsQ0FBQyxDQUFDaEI7QUFGWCxPQUFYLENBQTdCO0FBS0FQLE1BQUFBLE9BQU8sZ0JBQ0gsb0JBQUMsS0FBRCxDQUFPLFFBQVAscUJBQ0ksb0JBQUMsc0JBQUQ7QUFDSSxRQUFBLElBQUksRUFBRTtBQUFDL0osVUFBQUEsTUFBTSxFQUFFLEtBQUtyQyxLQUFMLENBQVdxQztBQUFwQixTQURWO0FBRUksUUFBQSxTQUFTLEVBQUVtSyxVQUZmO0FBR0ksUUFBQSxTQUFTLEVBQUVDLFVBSGY7QUFJSSxRQUFBLGFBQWEsRUFBRSxLQUFLbUIsYUFKeEI7QUFLSSxRQUFBLFlBQVksRUFBRSxLQUFLQyxZQUx2QjtBQU1JLFFBQUEsUUFBUSxFQUFFLEtBQUt6SCxRQU5uQjtBQU9JLFFBQUEsa0JBQWtCLEVBQUV1SCxvQkFQeEI7QUFRSSxRQUFBLGFBQWEsRUFBRTtBQUFDTixVQUFBQSxNQUFNLEVBQUU7QUFBVCxTQVJuQjtBQVNJLFFBQUEsU0FBUyxFQUFDLDBCQVRkO0FBVUksUUFBQSxNQUFNLEVBQUVEO0FBVlosc0JBWUk7QUFBSyxRQUFBLFNBQVMsRUFBQyxzQkFBZjtBQUFzQyxRQUFBLFFBQVEsRUFBRSxLQUFLbEI7QUFBckQsU0FDS3hLLFlBREwsQ0FaSixFQWVLaUwsV0FmTCxDQURKLENBREo7QUFxQkgsS0F0SEQsTUFzSE8sSUFBSSxLQUFLdk4sS0FBTCxDQUFXME8sWUFBWCxJQUEyQixLQUFLOU4sS0FBTCxDQUFXUSxVQUExQyxFQUFzRDtBQUN6RDRMLE1BQUFBLE9BQU8sZ0JBQUc7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFFBQVY7QUFDSDs7QUFFRCx3QkFDSTtBQUNJLE1BQUEsR0FBRyxFQUFFLEtBQUt0SixVQURkO0FBRUksTUFBQSxTQUFTLEVBQUUwSSxPQUZmO0FBR0ksTUFBQSxJQUFJLEVBQUMsT0FIVDtBQUlJLG9CQUFZLEtBQUtwTSxLQUFMLENBQVcwTSxLQUozQjtBQUtJLE1BQUEsU0FBUyxFQUFFLEtBQUtpQztBQUxwQixPQU9LLEtBQUtuRCxZQUFMLEVBUEwsRUFRS3dCLE9BUkwsQ0FESjtBQVlIOztBQTV4Qm9FIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNywgMjAxOCBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7Y3JlYXRlUmVmfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgUm92aW5nQWNjZXNzaWJsZUJ1dHRvbiwgUm92aW5nVGFiSW5kZXhXcmFwcGVyIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvUm92aW5nVGFiSW5kZXhcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBSb29tVGlsZSBmcm9tIFwiLi9Sb29tVGlsZVwiO1xuaW1wb3J0IHsgTGlzdExheW91dCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L0xpc3RMYXlvdXRcIjtcbmltcG9ydCB7XG4gICAgQ2hldnJvbkZhY2UsXG4gICAgQ29udGV4dE1lbnUsXG4gICAgQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uLFxuICAgIFN0eWxlZE1lbnVJdGVtQ2hlY2tib3gsXG4gICAgU3R5bGVkTWVudUl0ZW1SYWRpbyxcbn0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCBSb29tTGlzdFN0b3JlLCB7IExJU1RTX1VQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0U3RvcmVcIjtcbmltcG9ydCB7IExpc3RBbGdvcml0aG0sIFNvcnRBbGdvcml0aG0gfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9hbGdvcml0aG1zL21vZGVsc1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRhZ0lELCBUYWdJRCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L21vZGVsc1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IE5vdGlmaWNhdGlvbkJhZGdlIGZyb20gXCIuL05vdGlmaWNhdGlvbkJhZGdlXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgeyBLZXkgfSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgRW5hYmxlLCBSZXNpemFibGUgfSBmcm9tIFwicmUtcmVzaXphYmxlXCI7XG5pbXBvcnQgeyBEaXJlY3Rpb24gfSBmcm9tIFwicmUtcmVzaXphYmxlL2xpYi9yZXNpemVyXCI7XG5pbXBvcnQgeyBwb2x5ZmlsbFRvdWNoRXZlbnQgfSBmcm9tIFwiLi4vLi4vLi4vQHR5cGVzL3BvbHlmaWxsXCI7XG5pbXBvcnQgeyBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Sb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZVwiO1xuaW1wb3J0IFJvb21MaXN0TGF5b3V0U3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RMYXlvdXRTdG9yZVwiO1xuaW1wb3J0IHsgYXJyYXlGYXN0Q2xvbmUsIGFycmF5SGFzT3JkZXJDaGFuZ2UgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5pbXBvcnQgeyBvYmplY3RFeGNsdWRpbmcsIG9iamVjdEhhc0RpZmYgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvb2JqZWN0c1wiO1xuaW1wb3J0IFRlbXBvcmFyeVRpbGUgZnJvbSBcIi4vVGVtcG9yYXJ5VGlsZVwiO1xuaW1wb3J0IHsgTGlzdE5vdGlmaWNhdGlvblN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL0xpc3ROb3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IEljb25pemVkQ29udGV4dE1lbnUgZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuXG5jb25zdCBTSE9XX05fQlVUVE9OX0hFSUdIVCA9IDI4OyAvLyBBcyBkZWZpbmVkIGJ5IENTU1xuY29uc3QgUkVTSVpFX0hBTkRMRV9IRUlHSFQgPSA0OyAvLyBBcyBkZWZpbmVkIGJ5IENTU1xuZXhwb3J0IGNvbnN0IEhFQURFUl9IRUlHSFQgPSAzMjsgLy8gQXMgZGVmaW5lZCBieSBDU1NcblxuY29uc3QgTUFYX1BBRERJTkdfSEVJR0hUID0gU0hPV19OX0JVVFRPTl9IRUlHSFQgKyBSRVNJWkVfSEFORExFX0hFSUdIVDtcblxuLy8gSEFDSzogV2UgcmVhbGx5IHNob3VsZG4ndCBoYXZlIHRvIGRvIHRoaXMuXG5wb2x5ZmlsbFRvdWNoRXZlbnQoKTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgZm9yUm9vbXM6IGJvb2xlYW47XG4gICAgc3RhcnRBc0hpZGRlbjogYm9vbGVhbjtcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIG9uQWRkUm9vbT86ICgpID0+IHZvaWQ7XG4gICAgYWRkUm9vbUNvbnRleHRNZW51PzogKG9uRmluaXNoZWQ6ICgpID0+IHZvaWQpID0+IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICBhZGRSb29tTGFiZWw6IHN0cmluZztcbiAgICBpc01pbmltaXplZDogYm9vbGVhbjtcbiAgICB0YWdJZDogVGFnSUQ7XG4gICAgb25SZXNpemU6ICgpID0+IHZvaWQ7XG4gICAgc2hvd1NrZWxldG9uPzogYm9vbGVhbjtcblxuICAgIC8vIFRPRE86IERvbid0IHVzZSB0aGlzLiBJdCdzIGZvciBjb21tdW5pdHkgaW52aXRlcywgYW5kIGNvbW11bml0eSBpbnZpdGVzIHNob3VsZG4ndCBiZSBoZXJlLlxuICAgIC8vIFlvdSBzaG91bGQgZmVlbCBiYWQgaWYgeW91IHVzZSB0aGlzLlxuICAgIGV4dHJhQmFkVGlsZXNUaGF0U2hvdWxkbnRFeGlzdD86IFRlbXBvcmFyeVRpbGVbXTtcblxuICAgIC8vIFRPRE86IEFjY291bnQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MTc5XG59XG5cbi8vIFRPRE86IFVzZSByZS1yZXNpemVyJ3MgTnVtYmVyU2l6ZSB3aGVuIGl0IGlzIGV4cG9zZWQgYXMgdGhlIHR5cGVcbmludGVyZmFjZSBSZXNpemVEZWx0YSB7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbn1cblxudHlwZSBQYXJ0aWFsRE9NUmVjdCA9IFBpY2s8RE9NUmVjdCwgXCJsZWZ0XCIgfCBcInRvcFwiIHwgXCJoZWlnaHRcIj47XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNvbnRleHRNZW51UG9zaXRpb246IFBhcnRpYWxET01SZWN0O1xuICAgIGFkZFJvb21Db250ZXh0TWVudVBvc2l0aW9uOiBQYXJ0aWFsRE9NUmVjdDtcbiAgICBpc1Jlc2l6aW5nOiBib29sZWFuO1xuICAgIGlzRXhwYW5kZWQ6IGJvb2xlYW47IC8vIHVzZWQgZm9yIHRoZSBmb3IgZXhwYW5kIG9mIHRoZSBzdWJsaXN0IHdoZW4gdGhlIHJvb20gbGlzdCBpcyBiZWluZyBmaWx0ZXJlZFxuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHJvb21zOiBSb29tW107XG4gICAgZmlsdGVyZWRFeHRyYVRpbGVzPzogVGVtcG9yYXJ5VGlsZVtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tU3VibGlzdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgaGVhZGVyQnV0dG9uID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgc3VibGlzdFJlZiA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIGxheW91dDogTGlzdExheW91dDtcbiAgICBwcml2YXRlIGhlaWdodEF0U3RhcnQ6IG51bWJlcjtcbiAgICBwcml2YXRlIGlzQmVpbmdGaWx0ZXJlZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIG5vdGlmaWNhdGlvblN0YXRlOiBMaXN0Tm90aWZpY2F0aW9uU3RhdGU7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLmxheW91dCA9IFJvb21MaXN0TGF5b3V0U3RvcmUuaW5zdGFuY2UuZ2V0TGF5b3V0Rm9yKHRoaXMucHJvcHMudGFnSWQpO1xuICAgICAgICB0aGlzLmhlaWdodEF0U3RhcnQgPSAwO1xuICAgICAgICB0aGlzLmlzQmVpbmdGaWx0ZXJlZCA9ICEhUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5nZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24oKTtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25TdGF0ZSA9IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLmdldExpc3RTdGF0ZSh0aGlzLnByb3BzLnRhZ0lkKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51UG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICBhZGRSb29tQ29udGV4dE1lbnVQb3NpdGlvbjogbnVsbCxcbiAgICAgICAgICAgIGlzUmVzaXppbmc6IGZhbHNlLFxuICAgICAgICAgICAgaXNFeHBhbmRlZDogdGhpcy5pc0JlaW5nRmlsdGVyZWQgPyB0aGlzLmlzQmVpbmdGaWx0ZXJlZCA6ICF0aGlzLmxheW91dC5pc0NvbGxhcHNlZCxcbiAgICAgICAgICAgIGhlaWdodDogMCwgLy8gdG8gYmUgZml4ZWQgaW4gYSBtb21lbnQsIHdlIG5lZWQgYHJvb21zYCB0byBjYWxjdWxhdGUgdGhpcy5cbiAgICAgICAgICAgIHJvb21zOiBhcnJheUZhc3RDbG9uZShSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9yZGVyZWRMaXN0c1t0aGlzLnByb3BzLnRhZ0lkXSB8fCBbXSksXG4gICAgICAgIH07XG4gICAgICAgIC8vIFdoeSBPYmplY3QuYXNzaWduKCkgYW5kIG5vdCB0aGlzLnN0YXRlLmhlaWdodD8gQmVjYXVzZSBUeXBlU2NyaXB0IHNheXMgbm8uXG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIHtoZWlnaHQ6IHRoaXMuY2FsY3VsYXRlSW5pdGlhbEhlaWdodCgpfSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRlZmF1bHREaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9uKExJU1RTX1VQREFURV9FVkVOVCwgdGhpcy5vbkxpc3RzVXBkYXRlZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVJbml0aWFsSGVpZ2h0KCkge1xuICAgICAgICBjb25zdCByZXF1ZXN0ZWRWaXNpYmxlVGlsZXMgPSBNYXRoLm1heChNYXRoLmZsb29yKHRoaXMubGF5b3V0LnZpc2libGVUaWxlcyksIHRoaXMubGF5b3V0Lm1pblZpc2libGVUaWxlcyk7XG4gICAgICAgIGNvbnN0IHRpbGVDb3VudCA9IE1hdGgubWluKHRoaXMubnVtVGlsZXMsIHJlcXVlc3RlZFZpc2libGVUaWxlcyk7XG4gICAgICAgIHJldHVybiB0aGlzLmxheW91dC50aWxlc1RvUGl4ZWxzV2l0aFBhZGRpbmcodGlsZUNvdW50LCB0aGlzLnBhZGRpbmcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IHBhZGRpbmcoKSB7XG4gICAgICAgIGxldCBwYWRkaW5nID0gUkVTSVpFX0hBTkRMRV9IRUlHSFQ7XG4gICAgICAgIC8vIHRoaXMgaXMgdXNlZCBmb3IgY2FsY3VsYXRpbmcgdGhlIG1heCBoZWlnaHQgb2YgdGhlIHdob2xlIGNvbnRhaW5lcixcbiAgICAgICAgLy8gYW5kIHRha2VzIGludG8gYWNjb3VudCB3aGV0aGVyIHRoZXJlIHNob3VsZCBiZSByb29tIHJlc2VydmVkIGZvciB0aGUgc2hvdyBtb3JlL2xlc3MgYnV0dG9uXG4gICAgICAgIC8vIHdoZW4gZnVsbHkgZXhwYW5kZWQuIFdlIGNhbid0IHJlbHkgcHVyZWx5IG9uIHRoZSBsYXlvdXQncyBkZWZhdWx0VmlzaWJsZSB0aWxlIGNvdW50XG4gICAgICAgIC8vIGJlY2F1c2UgdGhlcmUgYXJlIGNvbmRpdGlvbnMgaW4gd2hpY2ggd2UgbmVlZCB0byBrbm93IHRoYXQgdGhlICdzaG93IG1vcmUnIGJ1dHRvblxuICAgICAgICAvLyBpcyBwcmVzZW50IHdoaWxlIHdlbGwgdW5kZXIgdGhlIGRlZmF1bHQgdGlsZSBsaW1pdC5cbiAgICAgICAgY29uc3QgbmVlZHNTaG93TW9yZSA9IHRoaXMubnVtVGlsZXMgPiB0aGlzLm51bVZpc2libGVUaWxlcztcblxuICAgICAgICAvLyAuLi5idXQgYWxzbyBjaGVjayB0aGlzIG9yIHdlJ2xsIG1pc3MgaWYgdGhlIHNlY3Rpb24gaXMgZXhwYW5kZWQgYW5kIHdlIG5lZWQgYVxuICAgICAgICAvLyAnc2hvdyBsZXNzJ1xuICAgICAgICBjb25zdCBuZWVkc1Nob3dMZXNzID0gdGhpcy5udW1UaWxlcyA+IHRoaXMubGF5b3V0LmRlZmF1bHRWaXNpYmxlVGlsZXM7XG5cbiAgICAgICAgaWYgKG5lZWRzU2hvd01vcmUgfHwgbmVlZHNTaG93TGVzcykge1xuICAgICAgICAgICAgcGFkZGluZyArPSBTSE9XX05fQlVUVE9OX0hFSUdIVDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFkZGluZztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBleHRyYVRpbGVzKCk6IFRlbXBvcmFyeVRpbGVbXSB8IG51bGwge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5maWx0ZXJlZEV4dHJhVGlsZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmZpbHRlcmVkRXh0cmFUaWxlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5leHRyYUJhZFRpbGVzVGhhdFNob3VsZG50RXhpc3QpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLmV4dHJhQmFkVGlsZXNUaGF0U2hvdWxkbnRFeGlzdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBudW1UaWxlcygpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gUm9vbVN1Ymxpc3QuY2FsY051bVRpbGVzKHRoaXMuc3RhdGUucm9vbXMsIHRoaXMuZXh0cmFUaWxlcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgY2FsY051bVRpbGVzKHJvb21zOiBSb29tW10sIGV4dHJhVGlsZXM6IGFueVtdKSB7XG4gICAgICAgIHJldHVybiAocm9vbXMgfHwgW10pLmxlbmd0aCArIChleHRyYVRpbGVzIHx8IFtdKS5sZW5ndGg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgbnVtVmlzaWJsZVRpbGVzKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IG5WaXNpYmxlID0gTWF0aC5jZWlsKHRoaXMubGF5b3V0LnZpc2libGVUaWxlcyk7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbihuVmlzaWJsZSwgdGhpcy5udW1UaWxlcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFJlYWRvbmx5PElQcm9wcz4sIHByZXZTdGF0ZTogUmVhZG9ubHk8SVN0YXRlPikge1xuICAgICAgICBjb25zdCBwcmV2RXh0cmFUaWxlcyA9IHByZXZTdGF0ZS5maWx0ZXJlZEV4dHJhVGlsZXMgfHwgcHJldlByb3BzLmV4dHJhQmFkVGlsZXNUaGF0U2hvdWxkbnRFeGlzdDtcbiAgICAgICAgLy8gYXMgdGhlIHJvb21zIGNhbiBjb21lIGluIG9uZSBieSBvbmUgd2UgbmVlZCB0byByZWV2YWx1YXRlXG4gICAgICAgIC8vIHRoZSBhbW91bnQgb2YgYXZhaWxhYmxlIHJvb21zIHRvIGNhcCB0aGUgYW1vdW50IG9mIHJlcXVlc3RlZCB2aXNpYmxlIHJvb21zIGJ5IHRoZSBsYXlvdXRcbiAgICAgICAgaWYgKFJvb21TdWJsaXN0LmNhbGNOdW1UaWxlcyhwcmV2U3RhdGUucm9vbXMsIHByZXZFeHRyYVRpbGVzKSAhPT0gdGhpcy5udW1UaWxlcykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGVpZ2h0OiB0aGlzLmNhbGN1bGF0ZUluaXRpYWxIZWlnaHQoKX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IFJlYWRvbmx5PElQcm9wcz4sIG5leHRTdGF0ZTogUmVhZG9ubHk8SVN0YXRlPik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAob2JqZWN0SGFzRGlmZih0aGlzLnByb3BzLCBuZXh0UHJvcHMpKSB7XG4gICAgICAgICAgICAvLyBTb21ldGhpbmcgd2UgZG9uJ3QgY2FyZSB0byBvcHRpbWl6ZSBoYXMgdXBkYXRlZCwgc28gdXBkYXRlLlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEbyB0aGUgc2FtZSBjaGVjayB1c2VkIG9uIHByb3BzIGZvciBzdGF0ZSwgd2l0aG91dCB0aGUgcm9vbXMgd2UncmUgZ29pbmcgdG8gbm8tb3BcbiAgICAgICAgY29uc3QgcHJldlN0YXRlTm9Sb29tcyA9IG9iamVjdEV4Y2x1ZGluZyh0aGlzLnN0YXRlLCBbJ3Jvb21zJ10pO1xuICAgICAgICBjb25zdCBuZXh0U3RhdGVOb1Jvb21zID0gb2JqZWN0RXhjbHVkaW5nKG5leHRTdGF0ZSwgWydyb29tcyddKTtcbiAgICAgICAgaWYgKG9iamVjdEhhc0RpZmYocHJldlN0YXRlTm9Sb29tcywgbmV4dFN0YXRlTm9Sb29tcykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2UncmUgc3VwcG9zZWQgdG8gaGFuZGxlIGV4dHJhIHRpbGVzLCB0YWtlIHRoZSBwZXJmb3JtYW5jZSBoaXQgYW5kIHJlLXJlbmRlciBhbGwgdGhlXG4gICAgICAgIC8vIHRpbWUgc28gd2UgZG9uJ3QgaGF2ZSB0byBjb25zaWRlciB0aGVtIGFzIHBhcnQgb2YgdGhlIHZpc2libGUgcm9vbSBvcHRpbWl6YXRpb24uXG4gICAgICAgIGNvbnN0IHByZXZFeHRyYVRpbGVzID0gdGhpcy5wcm9wcy5leHRyYUJhZFRpbGVzVGhhdFNob3VsZG50RXhpc3QgfHwgW107XG4gICAgICAgIGNvbnN0IG5leHRFeHRyYVRpbGVzID0gKG5leHRTdGF0ZS5maWx0ZXJlZEV4dHJhVGlsZXMgfHwgbmV4dFByb3BzLmV4dHJhQmFkVGlsZXNUaGF0U2hvdWxkbnRFeGlzdCkgfHwgW107XG4gICAgICAgIGlmIChwcmV2RXh0cmFUaWxlcy5sZW5ndGggPiAwIHx8IG5leHRFeHRyYVRpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2UncmUgYWJvdXQgdG8gdXBkYXRlIHRoZSBoZWlnaHQgb2YgdGhlIGxpc3QsIHdlIGRvbid0IHJlYWxseSBjYXJlIGFib3V0IHdoaWNoIHJvb21zXG4gICAgICAgIC8vIGFyZSB2aXNpYmxlIG9yIG5vdCBmb3Igbm8tb3AgcHVycG9zZXMsIHNvIGVuc3VyZSB0aGF0IHRoZSBoZWlnaHQgY2FsY3VsYXRpb24gcnVucyB0aHJvdWdoLlxuICAgICAgICBpZiAoUm9vbVN1Ymxpc3QuY2FsY051bVRpbGVzKG5leHRTdGF0ZS5yb29tcywgbmV4dEV4dHJhVGlsZXMpICE9PSB0aGlzLm51bVRpbGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlZm9yZSB3ZSBnbyBhbmFseXppbmcgdGhlIHJvb21zLCB3ZSBjYW4gc2VlIGlmIHdlJ3JlIGNvbGxhcHNlZC4gSWYgd2UncmUgY29sbGFwc2VkLCB3ZSBkb24ndCBuZWVkXG4gICAgICAgIC8vIHRvIHJlbmRlciBhbnl0aGluZy4gV2UgZG8gdGhpcyBhZnRlciB0aGUgaGVpZ2h0IGNoZWNrIHRob3VnaCB0byBlbnN1cmUgdGhhdCB0aGUgaGVpZ2h0IGdldHMgYXBwcm9wcmlhdGVseVxuICAgICAgICAvLyBjYWxjdWxhdGVkIGZvciB3aGVuL2lmIHdlIGJlY29tZSB1bmNvbGxhcHNlZC5cbiAgICAgICAgaWYgKCFuZXh0U3RhdGUuaXNFeHBhbmRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUXVpY2tseSBkb3VibGUgY2hlY2sgd2UncmUgbm90IGFib3V0IHRvIGJyZWFrIHNvbWV0aGluZyBkdWUgdG8gdGhlIG51bWJlciBvZiByb29tcyBjaGFuZ2luZy5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucm9vbXMubGVuZ3RoICE9PSBuZXh0U3RhdGUucm9vbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmFsbHksIGRldGVybWluZSBpZiB0aGUgcm9vbSB1cGRhdGUgKGFzIHByZXN1bWFibHkgdGhhdCdzIGFsbCB0aGF0J3MgbGVmdCkgaXMgd2l0aGluXG4gICAgICAgIC8vIG91ciB2aXNpYmxlIHJhbmdlLiBJZiBpdCBpcywgdGhlbiBkbyBhIHJlbmRlci4gSWYgdGhlIHVwZGF0ZSBpcyBvdXRzaWRlIG91ciB2aXNpYmxlIHJhbmdlXG4gICAgICAgIC8vIHRoZW4gd2UgY2FuIHNraXAgdGhlIHVwZGF0ZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgYWxzbyBvcHRpbWl6ZSBmb3Igb3JkZXIgY2hhbmdpbmcgaGVyZTogaWYgdGhlIHVwZGF0ZSBkaWQgaGFwcGVuIGluIG91ciB2aXNpYmxlIHJhbmdlXG4gICAgICAgIC8vIGJ1dCBkb2Vzbid0IHJlc3VsdCBpbiB0aGUgbGlzdCByZS1zb3J0aW5nIGl0c2VsZiB0aGVuIHRoZXJlJ3Mgbm8gcmVhc29uIGZvciB1cyB0byB1cGRhdGVcbiAgICAgICAgLy8gb24gb3VyIG93bi5cbiAgICAgICAgY29uc3QgcHJldlNsaWNlZFJvb21zID0gdGhpcy5zdGF0ZS5yb29tcy5zbGljZSgwLCB0aGlzLm51bVZpc2libGVUaWxlcyk7XG4gICAgICAgIGNvbnN0IG5leHRTbGljZWRSb29tcyA9IG5leHRTdGF0ZS5yb29tcy5zbGljZSgwLCB0aGlzLm51bVZpc2libGVUaWxlcyk7XG4gICAgICAgIGlmIChhcnJheUhhc09yZGVyQ2hhbmdlKHByZXZTbGljZWRSb29tcywgbmV4dFNsaWNlZFJvb21zKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBub3RoaW5nIGhhcHBlbmVkIHNvIG5vLW9wIHRoZSB1cGRhdGVcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9mZihMSVNUU19VUERBVEVfRVZFTlQsIHRoaXMub25MaXN0c1VwZGF0ZWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25MaXN0c1VwZGF0ZWQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXRlVXBkYXRlczogSVN0YXRlICYgYW55ID0ge307IC8vICZhbnkgaXMgdG8gYXZvaWQgYSBjYXN0IG9uIHRoZSBpbml0aWFsaXplclxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmV4dHJhQmFkVGlsZXNUaGF0U2hvdWxkbnRFeGlzdCkge1xuICAgICAgICAgICAgY29uc3QgbmFtZUNvbmRpdGlvbiA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0Rmlyc3ROYW1lRmlsdGVyQ29uZGl0aW9uKCk7XG4gICAgICAgICAgICBpZiAobmFtZUNvbmRpdGlvbikge1xuICAgICAgICAgICAgICAgIHN0YXRlVXBkYXRlcy5maWx0ZXJlZEV4dHJhVGlsZXMgPSB0aGlzLnByb3BzLmV4dHJhQmFkVGlsZXNUaGF0U2hvdWxkbnRFeGlzdFxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHQgPT4gbmFtZUNvbmRpdGlvbi5tYXRjaGVzKHQucHJvcHMuZGlzcGxheU5hbWUgfHwgXCJcIikpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmZpbHRlcmVkRXh0cmFUaWxlcykge1xuICAgICAgICAgICAgICAgIHN0YXRlVXBkYXRlcy5maWx0ZXJlZEV4dHJhVGlsZXMgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3VycmVudFJvb21zID0gdGhpcy5zdGF0ZS5yb29tcztcbiAgICAgICAgY29uc3QgbmV3Um9vbXMgPSBhcnJheUZhc3RDbG9uZShSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9yZGVyZWRMaXN0c1t0aGlzLnByb3BzLnRhZ0lkXSB8fCBbXSk7XG4gICAgICAgIGlmIChhcnJheUhhc09yZGVyQ2hhbmdlKGN1cnJlbnRSb29tcywgbmV3Um9vbXMpKSB7XG4gICAgICAgICAgICBzdGF0ZVVwZGF0ZXMucm9vbXMgPSBuZXdSb29tcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzU3RpbGxCZWluZ0ZpbHRlcmVkID0gISFSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldEZpcnN0TmFtZUZpbHRlckNvbmRpdGlvbigpO1xuICAgICAgICBpZiAoaXNTdGlsbEJlaW5nRmlsdGVyZWQgIT09IHRoaXMuaXNCZWluZ0ZpbHRlcmVkKSB7XG4gICAgICAgICAgICB0aGlzLmlzQmVpbmdGaWx0ZXJlZCA9IGlzU3RpbGxCZWluZ0ZpbHRlcmVkO1xuICAgICAgICAgICAgaWYgKGlzU3RpbGxCZWluZ0ZpbHRlcmVkKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVVcGRhdGVzLmlzRXhwYW5kZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGF0ZVVwZGF0ZXMuaXNFeHBhbmRlZCA9ICF0aGlzLmxheW91dC5pc0NvbGxhcHNlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhzdGF0ZVVwZGF0ZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGVVcGRhdGVzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBcInZpZXdfcm9vbVwiICYmIHBheWxvYWQuc2hvd19yb29tX3RpbGUgJiYgdGhpcy5zdGF0ZS5yb29tcykge1xuICAgICAgICAgICAgLy8gWFhYOiB3ZSBoYXZlIHRvIGRvIHRoaXMgYSB0aWNrIGxhdGVyIGJlY2F1c2Ugd2UgaGF2ZSBpbmNvcnJlY3QgaW50ZXJtZWRpYXRlIHByb3BzIGR1cmluZyBhIHJvb20gY2hhbmdlXG4gICAgICAgICAgICAvLyB3aGVyZSB3ZSBsb3NlIHRoZSByb29tIHdlIGFyZSBjaGFuZ2luZyBmcm9tIHRlbXBvcmFyaWx5IGFuZCB0aGVuIGl0IGNvbWVzIGJhY2sgaW4gYW4gdXBkYXRlIHJpZ2h0IGFmdGVyLlxuICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tSW5kZXggPSB0aGlzLnN0YXRlLnJvb21zLmZpbmRJbmRleCgocikgPT4gci5yb29tSWQgPT09IHBheWxvYWQucm9vbV9pZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaXNFeHBhbmRlZCAmJiByb29tSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNvbGxhcHNlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBleHRlbmQgdGhlIHZpc2libGUgc2VjdGlvbiB0byBpbmNsdWRlIHRoZSByb29tIGlmIGl0IGlzIGVudGlyZWx5IGludmlzaWJsZVxuICAgICAgICAgICAgICAgIGlmIChyb29tSW5kZXggPj0gdGhpcy5udW1WaXNpYmxlVGlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXlvdXQudmlzaWJsZVRpbGVzID0gdGhpcy5sYXlvdXQudGlsZXNXaXRoUGFkZGluZyhyb29tSW5kZXggKyAxLCBNQVhfUEFERElOR19IRUlHSFQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7IC8vIGJlY2F1c2UgdGhlIGxheW91dCBkb2Vzbid0IHRyaWdnZXIgYSByZS1yZW5kZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWRkUm9vbSA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQWRkUm9vbSkgdGhpcy5wcm9wcy5vbkFkZFJvb20oKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhcHBseUhlaWdodENoYW5nZShuZXdIZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCBoZWlnaHRJblRpbGVzID0gTWF0aC5jZWlsKHRoaXMubGF5b3V0LnBpeGVsc1RvVGlsZXMobmV3SGVpZ2h0IC0gdGhpcy5wYWRkaW5nKSk7XG4gICAgICAgIHRoaXMubGF5b3V0LnZpc2libGVUaWxlcyA9IE1hdGgubWluKHRoaXMubnVtVGlsZXMsIGhlaWdodEluVGlsZXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25SZXNpemUgPSAoXG4gICAgICAgIGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50LFxuICAgICAgICB0cmF2ZWxEaXJlY3Rpb246IERpcmVjdGlvbixcbiAgICAgICAgcmVmVG9FbGVtZW50OiBIVE1MRGl2RWxlbWVudCxcbiAgICAgICAgZGVsdGE6IFJlc2l6ZURlbHRhLFxuICAgICkgPT4ge1xuICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSB0aGlzLmhlaWdodEF0U3RhcnQgKyBkZWx0YS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuYXBwbHlIZWlnaHRDaGFuZ2UobmV3SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGVpZ2h0OiBuZXdIZWlnaHR9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlc2l6ZVN0YXJ0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmhlaWdodEF0U3RhcnQgPSB0aGlzLnN0YXRlLmhlaWdodDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNSZXNpemluZzogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVzaXplU3RvcCA9IChcbiAgICAgICAgZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQsXG4gICAgICAgIHRyYXZlbERpcmVjdGlvbjogRGlyZWN0aW9uLFxuICAgICAgICByZWZUb0VsZW1lbnQ6IEhUTUxEaXZFbGVtZW50LFxuICAgICAgICBkZWx0YTogUmVzaXplRGVsdGEsXG4gICAgKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IHRoaXMuaGVpZ2h0QXRTdGFydCArIGRlbHRhLmhlaWdodDtcbiAgICAgICAgdGhpcy5hcHBseUhlaWdodENoYW5nZShuZXdIZWlnaHQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtpc1Jlc2l6aW5nOiBmYWxzZSwgaGVpZ2h0OiBuZXdIZWlnaHR9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNob3dBbGxDbGljayA9ICgpID0+IHtcbiAgICAgICAgLy8gcmVhZCBudW1iZXIgb2YgdmlzaWJsZSB0aWxlcyBiZWZvcmUgd2UgbXV0YXRlIGl0XG4gICAgICAgIGNvbnN0IG51bVZpc2libGVUaWxlcyA9IHRoaXMubnVtVmlzaWJsZVRpbGVzO1xuICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSB0aGlzLmxheW91dC50aWxlc1RvUGl4ZWxzV2l0aFBhZGRpbmcodGhpcy5udW1UaWxlcywgdGhpcy5wYWRkaW5nKTtcbiAgICAgICAgdGhpcy5hcHBseUhlaWdodENoYW5nZShuZXdIZWlnaHQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtoZWlnaHQ6IG5ld0hlaWdodH0sICgpID0+IHtcbiAgICAgICAgICAgIC8vIGZvY3VzIHRoZSB0b3AtbW9zdCBuZXcgcm9vbVxuICAgICAgICAgICAgdGhpcy5mb2N1c1Jvb21UaWxlKG51bVZpc2libGVUaWxlcyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2hvd0xlc3NDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3SGVpZ2h0ID0gdGhpcy5sYXlvdXQudGlsZXNUb1BpeGVsc1dpdGhQYWRkaW5nKHRoaXMubGF5b3V0LmRlZmF1bHRWaXNpYmxlVGlsZXMsIHRoaXMucGFkZGluZyk7XG4gICAgICAgIHRoaXMuYXBwbHlIZWlnaHRDaGFuZ2UobmV3SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGVpZ2h0OiBuZXdIZWlnaHR9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBmb2N1c1Jvb21UaWxlID0gKGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN1Ymxpc3RSZWYuY3VycmVudCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuc3VibGlzdFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTERpdkVsZW1lbnQ+KFwiLm14X1Jvb21UaWxlXCIpO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHMgJiYgZWxlbWVudHNbaW5kZXhdO1xuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25PcGVuTWVudUNsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldi50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udGV4dE1lbnUgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29udGV4dE1lbnVQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIGxlZnQ6IGV2LmNsaWVudFgsXG4gICAgICAgICAgICAgICAgdG9wOiBldi5jbGllbnRZLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWRkUm9vbUNvbnRleHRNZW51ID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldi50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2FkZFJvb21Db250ZXh0TWVudVBvc2l0aW9uOiB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCl9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNsb3NlTWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xvc2VBZGRSb29tTWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YWRkUm9vbUNvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVucmVhZEZpcnN0Q2hhbmdlZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgaXNVbnJlYWRGaXJzdCA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0TGlzdE9yZGVyKHRoaXMucHJvcHMudGFnSWQpID09PSBMaXN0QWxnb3JpdGhtLkltcG9ydGFuY2U7XG4gICAgICAgIGNvbnN0IG5ld0FsZ29yaXRobSA9IGlzVW5yZWFkRmlyc3QgPyBMaXN0QWxnb3JpdGhtLk5hdHVyYWwgOiBMaXN0QWxnb3JpdGhtLkltcG9ydGFuY2U7XG4gICAgICAgIGF3YWl0IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uuc2V0TGlzdE9yZGVyKHRoaXMucHJvcHMudGFnSWQsIG5ld0FsZ29yaXRobSk7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gYmVjYXVzZSBpZiB0aGUgc3VibGlzdCBkb2Vzbid0IGhhdmUgYW55IGNoYW5nZXMgdGhlbiB3ZSB3aWxsIG1pc3MgdGhlIGxpc3Qgb3JkZXIgY2hhbmdlXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25UYWdTb3J0Q2hhbmdlZCA9IGFzeW5jIChzb3J0OiBTb3J0QWxnb3JpdGhtKSA9PiB7XG4gICAgICAgIGF3YWl0IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uuc2V0VGFnU29ydGluZyh0aGlzLnByb3BzLnRhZ0lkLCBzb3J0KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1lc3NhZ2VQcmV2aWV3Q2hhbmdlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5sYXlvdXQuc2hvd1ByZXZpZXdzID0gIXRoaXMubGF5b3V0LnNob3dQcmV2aWV3cztcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyBiZWNhdXNlIHRoZSBsYXlvdXQgZG9lc24ndCB0cmlnZ2VyIGEgcmUtcmVuZGVyXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25CYWRnZUNsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGxldCByb29tO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy50YWdJZCA9PT0gRGVmYXVsdFRhZ0lELkludml0ZSkge1xuICAgICAgICAgICAgLy8gc3dpdGNoIHRvIGZpcnN0IHJvb20gYXMgdGhhdCdsbCBiZSB0aGUgdG9wIG9mIHRoZSBsaXN0IGZvciB0aGUgdXNlclxuICAgICAgICAgICAgcm9vbSA9IHRoaXMuc3RhdGUucm9vbXMgJiYgdGhpcy5zdGF0ZS5yb29tc1swXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IHJvb20gd2l0aCBhIGNvdW50IG9mIHRoZSBzYW1lIGNvbG91ciBhcyB0aGUgYmFkZ2UgY291bnRcbiAgICAgICAgICAgIHJvb20gPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLnVuZmlsdGVyZWRMaXN0c1t0aGlzLnByb3BzLnRhZ0lkXS5maW5kKChyOiBSb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90aWZTdGF0ZSA9IHRoaXMubm90aWZpY2F0aW9uU3RhdGUuZ2V0Rm9yUm9vbShyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm90aWZTdGF0ZS5jb3VudCA+IDAgJiYgbm90aWZTdGF0ZS5jb2xvciA9PT0gdGhpcy5ub3RpZmljYXRpb25TdGF0ZS5jb2xvcjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICBzaG93X3Jvb21fdGlsZTogdHJ1ZSwgLy8gdG8gbWFrZSBzdXJlIHRoZSByb29tIGdldHMgc2Nyb2xsZWQgaW50byB2aWV3XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSGVhZGVyQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvc3NpYmxlU3RpY2t5ID0gdGhpcy5oZWFkZXJCdXR0b24uY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICBjb25zdCBzdWJsaXN0ID0gcG9zc2libGVTdGlja3kucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICBjb25zdCBsaXN0ID0gc3VibGlzdC5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIC8vIHRoZSBzY3JvbGxUb3AgaXMgY2FwcGVkIGF0IHRoZSBoZWlnaHQgb2YgdGhlIGhlYWRlciBpbiBMZWZ0UGFuZWwsIHRoZSB0b3AgaGVhZGVyIGlzIGFsd2F5cyBzdGlja3lcbiAgICAgICAgY29uc3QgaXNBdFRvcCA9IGxpc3Quc2Nyb2xsVG9wIDw9IEhFQURFUl9IRUlHSFQ7XG4gICAgICAgIGNvbnN0IGlzQXRCb3R0b20gPSBsaXN0LnNjcm9sbFRvcCA+PSBsaXN0LnNjcm9sbEhlaWdodCAtIGxpc3Qub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBjb25zdCBpc1N0aWNreVRvcCA9IHBvc3NpYmxlU3RpY2t5LmNsYXNzTGlzdC5jb250YWlucygnbXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVRvcCcpO1xuICAgICAgICBjb25zdCBpc1N0aWNreUJvdHRvbSA9IHBvc3NpYmxlU3RpY2t5LmNsYXNzTGlzdC5jb250YWlucygnbXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreUJvdHRvbScpO1xuXG4gICAgICAgIGlmICgoaXNTdGlja3lCb3R0b20gJiYgIWlzQXRCb3R0b20pIHx8IChpc1N0aWNreVRvcCAmJiAhaXNBdFRvcCkpIHtcbiAgICAgICAgICAgIC8vIGlzIHN0aWNreSAtIGp1bXAgdG8gbGlzdFxuICAgICAgICAgICAgc3VibGlzdC5zY3JvbGxJbnRvVmlldyh7YmVoYXZpb3I6ICdzbW9vdGgnfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBvbiBzY3JlZW4gLSB0b2dnbGUgY29sbGFwc2VcbiAgICAgICAgICAgIGNvbnN0IGlzRXhwYW5kZWQgPSB0aGlzLnN0YXRlLmlzRXhwYW5kZWQ7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUNvbGxhcHNlZCgpO1xuICAgICAgICAgICAgLy8gaWYgdGhlIGJvdHRvbSBsaXN0IGlzIGNvbGxhcHNlZCB0aGVuIHNjcm9sbCBpdCBpbiBzbyBpdCBkb2Vzbid0IGV4cGFuZCBvZmYgc2NyZWVuXG4gICAgICAgICAgICBpZiAoIWlzRXhwYW5kZWQgJiYgaXNTdGlja3lCb3R0b20pIHtcbiAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzdWJsaXN0LnNjcm9sbEludG9WaWV3KHtiZWhhdmlvcjogJ3Ntb290aCd9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHRvZ2dsZUNvbGxhcHNlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5sYXlvdXQuaXNDb2xsYXBzZWQgPSB0aGlzLnN0YXRlLmlzRXhwYW5kZWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzRXhwYW5kZWQ6ICF0aGlzLmxheW91dC5pc0NvbGxhcHNlZH0pO1xuICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gdGhpcy5wcm9wcy5vblJlc2l6ZSgpKTsgLy8gbmVlZHMgdG8gaGFwcGVuIHdoZW4gdGhlIERPTSBpcyB1cGRhdGVkXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25IZWFkZXJLZXlEb3duID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZXYua2V5KSB7XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19MRUZUOlxuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gQVJST1dfTEVGVCBjb2xsYXBzZSB0aGUgcm9vbSBzdWJsaXN0IGlmIGl0IGlzbid0IGFscmVhZHlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDb2xsYXBzZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19SSUdIVDoge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0V4cGFuZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIEFSUk9XX1JJR0hUIGV4cGFuZCB0aGUgcm9vbSBzdWJsaXN0IGlmIGl0IGlzbid0IGFscmVhZHlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDb2xsYXBzZWQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3VibGlzdFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBmb2N1cyB0aGUgZmlyc3Qgcm9vbVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zdWJsaXN0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvcihcIi5teF9Sb29tVGlsZVwiKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5RG93biA9IChldjogUmVhY3QuS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGV2LmtleSkge1xuICAgICAgICAgICAgLy8gT24gQVJST1dfTEVGVCBnbyB0byB0aGUgc3VibGlzdCBoZWFkZXJcbiAgICAgICAgICAgIGNhc2UgS2V5LkFSUk9XX0xFRlQ6XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkZXJCdXR0b24uY3VycmVudC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gQ29uc3VtZSBBUlJPV19SSUdIVCBzbyBpdCBkb2Vzbid0IGNhdXNlIGZvY3VzIHRvIGdldCBzZW50IHRvIGNvbXBvc2VyXG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19SSUdIVDpcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlclZpc2libGVUaWxlcygpOiBSZWFjdC5SZWFjdEVsZW1lbnRbXSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0V4cGFuZGVkKSB7XG4gICAgICAgICAgICAvLyBkb24ndCB3YXN0ZSB0aW1lIG9uIHJlbmRlcmluZ1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGlsZXM6IFJlYWN0LlJlYWN0RWxlbWVudFtdID0gW107XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucm9vbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpc2libGVSb29tcyA9IHRoaXMuc3RhdGUucm9vbXMuc2xpY2UoMCwgdGhpcy5udW1WaXNpYmxlVGlsZXMpO1xuICAgICAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHZpc2libGVSb29tcykge1xuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2goPFJvb21UaWxlXG4gICAgICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgICAgIGtleT17YHJvb20tJHtyb29tLnJvb21JZH1gfVxuICAgICAgICAgICAgICAgICAgICBzaG93TWVzc2FnZVByZXZpZXc9e3RoaXMubGF5b3V0LnNob3dQcmV2aWV3c31cbiAgICAgICAgICAgICAgICAgICAgaXNNaW5pbWl6ZWQ9e3RoaXMucHJvcHMuaXNNaW5pbWl6ZWR9XG4gICAgICAgICAgICAgICAgICAgIHRhZz17dGhpcy5wcm9wcy50YWdJZH1cbiAgICAgICAgICAgICAgICAvPik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5leHRyYVRpbGVzKSB7XG4gICAgICAgICAgICAvLyBIQUNLOiBXZSBicmVhayB0eXBpbmcgaGVyZSwgYnV0IHRoaXMgJ2V4dHJhIHRpbGVzJyBwcm9wZXJ0eSBzaG91bGRuJ3QgZXhpc3QuXG4gICAgICAgICAgICAodGlsZXMgYXMgYW55W10pLnB1c2goLi4udGhpcy5leHRyYVRpbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIG9ubHkgaGF2ZSB0byBkbyB0aGlzIGJlY2F1c2Ugb2YgdGhlIGV4dHJhIHRpbGVzLiBXZSBkbyBpdCBjb25kaXRpb25hbGx5XG4gICAgICAgIC8vIHRvIGF2b2lkIHNwZW5kaW5nIGN5Y2xlcyBvbiBzbGljaW5nLiBJdCdzIGdlbmVyYWxseSBmaW5lIHRvIGRvIHRoaXMgdGhvdWdoXG4gICAgICAgIC8vIGFzIHVzZXJzIGFyZSB1bmxpa2VseSB0byBoYXZlIG1vcmUgdGhhbiBhIGhhbmRmdWwgb2YgdGlsZXMgd2hlbiB0aGUgZXh0cmFcbiAgICAgICAgLy8gdGlsZXMgYXJlIHVzZWQuXG4gICAgICAgIGlmICh0aWxlcy5sZW5ndGggPiB0aGlzLm51bVZpc2libGVUaWxlcykge1xuICAgICAgICAgICAgcmV0dXJuIHRpbGVzLnNsaWNlKDAsIHRoaXMubnVtVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlck1lbnUoKTogUmVhY3QuUmVhY3RFbGVtZW50IHtcbiAgICAgICAgbGV0IGNvbnRleHRNZW51ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbikge1xuICAgICAgICAgICAgY29uc3QgaXNBbHBoYWJldGljYWwgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldFRhZ1NvcnRpbmcodGhpcy5wcm9wcy50YWdJZCkgPT09IFNvcnRBbGdvcml0aG0uQWxwaGFiZXRpYztcbiAgICAgICAgICAgIGNvbnN0IGlzVW5yZWFkRmlyc3QgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldExpc3RPcmRlcih0aGlzLnByb3BzLnRhZ0lkKSA9PT0gTGlzdEFsZ29yaXRobS5JbXBvcnRhbmNlO1xuXG4gICAgICAgICAgICAvLyBJbnZpdGVzIGRvbid0IGdldCBzb21lIG5vbnNlbnNlIG9wdGlvbnMsIHNvIG9ubHkgYWRkIHRoZW0gaWYgd2UgaGF2ZSB0by5cbiAgICAgICAgICAgIGxldCBvdGhlclNlY3Rpb25zID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnRhZ0lkICE9PSBEZWZhdWx0VGFnSUQuSW52aXRlKSB7XG4gICAgICAgICAgICAgICAgb3RoZXJTZWN0aW9ucyA9IChcbiAgICAgICAgICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGhyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9Sb29tU3VibGlzdF9jb250ZXh0TWVudV90aXRsZSc+e190KFwiQXBwZWFyYW5jZVwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8U3R5bGVkTWVudUl0ZW1DaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXt0aGlzLm9uQ2xvc2VNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVucmVhZEZpcnN0Q2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17aXNVbnJlYWRGaXJzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlNob3cgcm9vbXMgd2l0aCB1bnJlYWQgbWVzc2FnZXMgZmlyc3RcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9TdHlsZWRNZW51SXRlbUNoZWNrYm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTdHlsZWRNZW51SXRlbUNoZWNrYm94XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMub25DbG9zZU1lbnV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTWVzc2FnZVByZXZpZXdDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLmxheW91dC5zaG93UHJldmlld3N9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJTaG93IHByZXZpZXdzIG9mIG1lc3NhZ2VzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkTWVudUl0ZW1DaGVja2JveD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRleHRNZW51ID0gKFxuICAgICAgICAgICAgICAgIDxDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgICAgICBjaGV2cm9uRmFjZT17Q2hldnJvbkZhY2UuTm9uZX1cbiAgICAgICAgICAgICAgICAgICAgbGVmdD17dGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uLmxlZnR9XG4gICAgICAgICAgICAgICAgICAgIHRvcD17dGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uLnRvcCArIHRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbi5oZWlnaHR9XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25DbG9zZU1lbnV9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2NvbnRleHRNZW51XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9Sb29tU3VibGlzdF9jb250ZXh0TWVudV90aXRsZSc+e190KFwiU29ydCBieVwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8U3R5bGVkTWVudUl0ZW1SYWRpb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXt0aGlzLm9uQ2xvc2VNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gdGhpcy5vblRhZ1NvcnRDaGFuZ2VkKFNvcnRBbGdvcml0aG0uUmVjZW50KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17IWlzQWxwaGFiZXRpY2FsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPXtgbXhfJHt0aGlzLnByb3BzLnRhZ0lkfV9zb3J0QnlgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQWN0aXZpdHlcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9TdHlsZWRNZW51SXRlbVJhZGlvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTdHlsZWRNZW51SXRlbVJhZGlvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMub25DbG9zZU1lbnV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoKSA9PiB0aGlzLm9uVGFnU29ydENoYW5nZWQoU29ydEFsZ29yaXRobS5BbHBoYWJldGljKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17aXNBbHBoYWJldGljYWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9e2BteF8ke3RoaXMucHJvcHMudGFnSWR9X3NvcnRCeWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJBLVpcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9TdHlsZWRNZW51SXRlbVJhZGlvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7b3RoZXJTZWN0aW9uc31cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9Db250ZXh0TWVudT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hZGRSb29tQ29udGV4dE1lbnVQb3NpdGlvbikge1xuICAgICAgICAgICAgY29udGV4dE1lbnUgPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICAgICAgY2hldnJvbkZhY2U9e0NoZXZyb25GYWNlLk5vbmV9XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ9e3RoaXMuc3RhdGUuYWRkUm9vbUNvbnRleHRNZW51UG9zaXRpb24ubGVmdCAtIDd9IC8vIGNlbnRlciBhbGlnbiB3aXRoIHRoZSBoYW5kbGVcbiAgICAgICAgICAgICAgICAgICAgdG9wPXt0aGlzLnN0YXRlLmFkZFJvb21Db250ZXh0TWVudVBvc2l0aW9uLnRvcCArIHRoaXMuc3RhdGUuYWRkUm9vbUNvbnRleHRNZW51UG9zaXRpb24uaGVpZ2h0fVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uQ2xvc2VBZGRSb29tTWVudX1cbiAgICAgICAgICAgICAgICAgICAgY29tcGFjdFxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMuYWRkUm9vbUNvbnRleHRNZW51KHRoaXMub25DbG9zZUFkZFJvb21NZW51KX1cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X21lbnVCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uT3Blbk1lbnVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiTGlzdCBvcHRpb25zXCIpfVxuICAgICAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXshIXRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHtjb250ZXh0TWVudX1cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJIZWFkZXIoKTogUmVhY3QuUmVhY3RFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSb3ZpbmdUYWJJbmRleFdyYXBwZXIgaW5wdXRSZWY9e3RoaXMuaGVhZGVyQnV0dG9ufT5cbiAgICAgICAgICAgICAgICB7KHtvbkZvY3VzLCBpc0FjdGl2ZSwgcmVmfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJJbmRleCA9IGlzQWN0aXZlID8gMCA6IC0xO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBhcmlhTGFiZWwgPSBfdChcIkp1bXAgdG8gZmlyc3QgdW5yZWFkIHJvb20uXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy50YWdJZCA9PT0gRGVmYXVsdFRhZ0lELkludml0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsID0gX3QoXCJKdW1wIHRvIGZpcnN0IGludml0ZS5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYWRnZSA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxOb3RpZmljYXRpb25CYWRnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlQ291bnQ9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uPXt0aGlzLm5vdGlmaWNhdGlvblN0YXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25CYWRnZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBhZGRSb29tQnV0dG9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5wcm9wcy5vbkFkZFJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFJvb21CdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkFkZFJvb219XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2F1eEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXBDbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9hZGRSb29tVG9vbHRpcFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3RoaXMucHJvcHMuYWRkUm9vbUxhYmVsIHx8IF90KFwiQWRkIHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLnByb3BzLmFkZFJvb21MYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmFkZFJvb21Db250ZXh0TWVudSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkUm9vbUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkFkZFJvb21Db250ZXh0TWVudX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3RfYXV4QnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2FkZFJvb21Ub29sdGlwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5hZGRSb29tTGFiZWwgfHwgX3QoXCJBZGQgcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMucHJvcHMuYWRkUm9vbUxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXshIXRoaXMuc3RhdGUuYWRkUm9vbUNvbnRleHRNZW51UG9zaXRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzZUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdteF9Sb29tU3VibGlzdF9jb2xsYXBzZUJ0bic6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3RfY29sbGFwc2VCdG5fY29sbGFwc2VkJzogIXRoaXMuc3RhdGUuaXNFeHBhbmRlZCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcic6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3dpdGhBdXgnOiAhIWFkZFJvb21CdXR0b24sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhZGdlQ29udGFpbmVyID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9iYWRnZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtiYWRnZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBCdXR0b246IFJlYWN0LkNvbXBvbmVudFR5cGU8UmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEFjY2Vzc2libGVCdXR0b24+PiA9IEFjY2Vzc2libGVCdXR0b247XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmlzTWluaW1pemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBCdXR0b24gPSBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHRoZSBhZGRSb29tQnV0dG9uIGNvbmRpdGlvbmFsbHkgZ2V0cyBtb3ZlZCBhcm91bmRcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIERPTSBkZXBlbmRpbmcgb24gd2hldGhlciBvciBub3QgdGhlIGxpc3QgaXMgbWluaW1pemVkLlxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBtaW5pbWl6ZWQsIHdlIHdhbnQgaXQgYmVsb3cgdGhlIGhlYWRlciBzbyBpdFxuICAgICAgICAgICAgICAgICAgICAvLyBkb2Vzbid0IGJlY29tZSBzdGlja3kuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBzYW1lIGFwcGxpZXMgdG8gdGhlIG5vdGlmaWNhdGlvbiBiYWRnZS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uSGVhZGVyS2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZvY3VzPXtvbkZvY3VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3RoaXMucHJvcHMubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9zdGlja2FibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2N1cz17b25Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXtyZWZ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9oZWFkZXJUZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJ0cmVlaXRlbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXt0aGlzLnN0YXRlLmlzRXhwYW5kZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxldmVsPXsxfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkhlYWRlckNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vbkNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMucHJvcHMuaXNNaW5pbWl6ZWQgPyB0aGlzLnByb3BzLmxhYmVsIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NvbGxhcHNlQ2xhc3Nlc30gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0aGlzLnByb3BzLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlck1lbnUoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMuaXNNaW5pbWl6ZWQgPyBudWxsIDogYmFkZ2VDb250YWluZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmlzTWluaW1pemVkID8gbnVsbCA6IGFkZFJvb21CdXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMuaXNNaW5pbWl6ZWQgPyBiYWRnZUNvbnRhaW5lciA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMuaXNNaW5pbWl6ZWQgPyBhZGRSb29tQnV0dG9uIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA8L1JvdmluZ1RhYkluZGV4V3JhcHBlcj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2Nyb2xsUHJldmVudChlOiBSZWFjdC5VSUV2ZW50PEhUTUxEaXZFbGVtZW50Pikge1xuICAgICAgICAvLyB0aGUgUm9vbVRpbGUgY2FsbHMgc2Nyb2xsSW50b1ZpZXcgYW5kIHRoZSBicm93c2VyIG1heSBzY3JvbGwgYSBkaXYgd2UgZG8gbm90IHdpc2ggdG8gYmUgc2Nyb2xsYWJsZVxuICAgICAgICAvLyB0aGlzIGZpeGVzIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NDEzXG4gICAgICAgIChlLnRhcmdldCBhcyBIVE1MRGl2RWxlbWVudCkuc2Nyb2xsVG9wID0gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IFJlYWN0LlJlYWN0RWxlbWVudCB7XG4gICAgICAgIGNvbnN0IHZpc2libGVUaWxlcyA9IHRoaXMucmVuZGVyVmlzaWJsZVRpbGVzKCk7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdteF9Sb29tU3VibGlzdCc6IHRydWUsXG4gICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3RfaGFzTWVudU9wZW4nOiAhIXRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbixcbiAgICAgICAgICAgICdteF9Sb29tU3VibGlzdF9taW5pbWl6ZWQnOiB0aGlzLnByb3BzLmlzTWluaW1pemVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgY29udGVudCA9IG51bGw7XG4gICAgICAgIGlmICh2aXNpYmxlVGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgbGF5b3V0ID0gdGhpcy5sYXlvdXQ7IC8vIHRvIHNob3J0ZW4gY2FsbHNcblxuICAgICAgICAgICAgY29uc3QgbWluVGlsZXMgPSBNYXRoLm1pbihsYXlvdXQubWluVmlzaWJsZVRpbGVzLCB0aGlzLm51bVRpbGVzKTtcbiAgICAgICAgICAgIGNvbnN0IHNob3dNb3JlQXRNaW5IZWlnaHQgPSBtaW5UaWxlcyA8IHRoaXMubnVtVGlsZXM7XG4gICAgICAgICAgICBjb25zdCBtaW5IZWlnaHRQYWRkaW5nID0gUkVTSVpFX0hBTkRMRV9IRUlHSFQgKyAoc2hvd01vcmVBdE1pbkhlaWdodCA/IFNIT1dfTl9CVVRUT05fSEVJR0hUIDogMCk7XG4gICAgICAgICAgICBjb25zdCBtaW5UaWxlc1B4ID0gbGF5b3V0LnRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyhtaW5UaWxlcywgbWluSGVpZ2h0UGFkZGluZyk7XG4gICAgICAgICAgICBjb25zdCBtYXhUaWxlc1B4ID0gbGF5b3V0LnRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyh0aGlzLm51bVRpbGVzLCB0aGlzLnBhZGRpbmcpO1xuICAgICAgICAgICAgY29uc3Qgc2hvd01vcmVCdG5DbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X3Nob3dOQnV0dG9uJzogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBoaWRpbmcgcm9vbXMsIHNob3cgYSAnc2hvdyBtb3JlJyBidXR0b24gdG8gdGhlIHVzZXIuIFRoaXMgYnV0dG9uXG4gICAgICAgICAgICAvLyBmbG9hdHMgYWJvdmUgdGhlIHJlc2l6ZSBoYW5kbGUsIGlmIHdlIGhhdmUgb25lIHByZXNlbnQuIElmIHRoZSB1c2VyIGhhcyBhbGxcbiAgICAgICAgICAgIC8vIHRpbGVzIHZpc2libGUsIGl0IGJlY29tZXMgJ3Nob3cgbGVzcycuXG4gICAgICAgICAgICBsZXQgc2hvd05CdXR0b24gPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAobWF4VGlsZXNQeCA+IHRoaXMuc3RhdGUuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGhlaWdodCBvZiBhbGwgdGhlIHRpbGVzIGlzIGdyZWF0ZXIgdGhhbiB0aGUgc2VjdGlvbiBoZWlnaHQ6IHdlIG5lZWQgYSAnc2hvdyBtb3JlJyBidXR0b25cbiAgICAgICAgICAgICAgICBjb25zdCBub25QYWRkZWRIZWlnaHQgPSB0aGlzLnN0YXRlLmhlaWdodCAtIFJFU0laRV9IQU5ETEVfSEVJR0hUIC0gU0hPV19OX0JVVFRPTl9IRUlHSFQ7XG4gICAgICAgICAgICAgICAgY29uc3QgYW1vdW50RnVsbHlTaG93biA9IE1hdGguZmxvb3Iobm9uUGFkZGVkSGVpZ2h0IC8gdGhpcy5sYXlvdXQudGlsZUhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbnVtTWlzc2luZyA9IHRoaXMubnVtVGlsZXMgLSBhbW91bnRGdWxseVNob3duO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gX3QoXCJTaG93ICUoY291bnQpcyBtb3JlXCIsIHtjb3VudDogbnVtTWlzc2luZ30pO1xuICAgICAgICAgICAgICAgIGxldCBzaG93TW9yZVRleHQgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfUm9vbVN1Ymxpc3Rfc2hvd05CdXR0b25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIHNob3dNb3JlVGV4dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgc2hvd05CdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxSb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwidHJlZWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblNob3dBbGxDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2hvd01vcmVCdG5DbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfUm9vbVN1Ymxpc3Rfc2hvd01vcmVCdXR0b25DaGV2cm9uIG14X1Jvb21TdWJsaXN0X3Nob3dOQnV0dG9uQ2hldnJvbic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgey8qIHNldCBieSBDU1MgbWFza2luZyAqL31cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93TW9yZVRleHR9XG4gICAgICAgICAgICAgICAgICAgIDwvUm92aW5nQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm51bVRpbGVzID4gdGhpcy5sYXlvdXQuZGVmYXVsdFZpc2libGVUaWxlcykge1xuICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgYWxsIHRpbGVzIHZpc2libGUgLSBhZGQgYSBidXR0b24gdG8gc2hvdyBsZXNzXG4gICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBfdChcIlNob3cgbGVzc1wiKTtcbiAgICAgICAgICAgICAgICBsZXQgc2hvd0xlc3NUZXh0ID0gKFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1Jvb21TdWJsaXN0X3Nob3dOQnV0dG9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmlzTWluaW1pemVkKSBzaG93TGVzc1RleHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHNob3dOQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8Um92aW5nQWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cInRyZWVpdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaG93TGVzc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzaG93TW9yZUJ0bkNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtsYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9Sb29tU3VibGlzdF9zaG93TGVzc0J1dHRvbkNoZXZyb24gbXhfUm9vbVN1Ymxpc3Rfc2hvd05CdXR0b25DaGV2cm9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Lyogc2V0IGJ5IENTUyBtYXNraW5nICovfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dMZXNzVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgPC9Sb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpZ3VyZSBvdXQgaWYgd2UgbmVlZCBhIGhhbmRsZVxuICAgICAgICAgICAgY29uc3QgaGFuZGxlczogRW5hYmxlID0ge1xuICAgICAgICAgICAgICAgIGJvdHRvbTogdHJ1ZSwgLy8gdGhlIG9ubHkgb25lIHdlIG5lZWQsIGJ1dCB0aGUgb3RoZXJzIG11c3QgYmUgZXhwbGljaXRseSBmYWxzZVxuICAgICAgICAgICAgICAgIGJvdHRvbUxlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJvdHRvbVJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdG9wOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b3BMZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b3BSaWdodDogZmFsc2UsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGxheW91dC52aXNpYmxlVGlsZXMgPj0gdGhpcy5udW1UaWxlcyAmJiB0aGlzLm51bVRpbGVzIDw9IGxheW91dC5taW5WaXNpYmxlVGlsZXMpIHtcbiAgICAgICAgICAgICAgICAvLyB3ZSdyZSBhdCBhIG1pbmltdW0sIGRvbid0IGhhdmUgYSBib3R0b20gaGFuZGxlXG4gICAgICAgICAgICAgICAgaGFuZGxlcy5ib3R0b20gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gV2UgaGF2ZSB0byBhY2NvdW50IGZvciBwYWRkaW5nIHNvIHdlIGNhbiBhY2NvbW1vZGF0ZSBhICdzaG93IG1vcmUnIGJ1dHRvbiBhbmRcbiAgICAgICAgICAgIC8vIHRoZSByZXNpemUgaGFuZGxlLCB3aGljaCBhcmUgcGlubmVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGNvbnRhaW5lci4gVGhpcyBpcyB0aGVcbiAgICAgICAgICAgIC8vIGVhc2llc3Qgd2F5IHRvIGhhdmUgYSByZXNpemUgaGFuZGxlIGJlbG93IHRoZSBidXR0b24gYXMgb3RoZXJ3aXNlIHdlJ3JlIHdyaXRpbmdcbiAgICAgICAgICAgIC8vIG91ciBvd24gcmVzaXplIGhhbmRsaW5nIGFuZCB0aGF0IGRvZXNuJ3Qgc291bmQgZnVuLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIFRoZSBsYXlvdXQgY2xhc3MgaGFzIHNvbWUgaGVscGVycyBmb3IgZGVhbGluZyB3aXRoIHBhZGRpbmcsIGFzIHdlIGRvbid0IHdhbnQgdG9cbiAgICAgICAgICAgIC8vIGFwcGx5IGl0IGluIGFsbCBjYXNlcy4gSWYgd2UgYXBwbHkgaXQgaW4gYWxsIGNhc2VzLCB0aGUgcmVzaXppbmcgZmVlbHMgbGlrZSBpdFxuICAgICAgICAgICAgLy8gZ29lcyBiYWNrd2FyZHMgYW5kIGNhbiBiZWNvbWUgd2lsZGx5IGluY29ycmVjdCAodmlzaWJsZVRpbGVzIHNheXMgMTggd2hlbiB0aGVyZSdzXG4gICAgICAgICAgICAvLyBvbmx5IG1hdGhlbWF0aWNhbGx5IDcgcG9zc2libGUpLlxuXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVXcmFwcGVyQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgICdteF9Sb29tU3VibGlzdF9yZXNpemVySGFuZGxlcyc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X3Jlc2l6ZXJIYW5kbGVzX3Nob3dOQnV0dG9uJzogISFzaG93TkJ1dHRvbixcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb250ZW50ID0gKFxuICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgPFJlc2l6YWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZT17e2hlaWdodDogdGhpcy5zdGF0ZS5oZWlnaHR9IGFzIGFueX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodD17bWluVGlsZXNQeH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1heEhlaWdodD17bWF4VGlsZXNQeH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVzaXplU3RhcnQ9e3RoaXMub25SZXNpemVTdGFydH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVzaXplU3RvcD17dGhpcy5vblJlc2l6ZVN0b3B9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlc2l6ZT17dGhpcy5vblJlc2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZVdyYXBwZXJDbGFzcz17aGFuZGxlV3JhcHBlckNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVDbGFzc2VzPXt7Ym90dG9tOiBcIm14X1Jvb21TdWJsaXN0X3Jlc2l6ZXJIYW5kbGVcIn19XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9yZXNpemVCb3hcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlPXtoYW5kbGVzfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X3RpbGVzXCIgb25TY3JvbGw9e3RoaXMub25TY3JvbGxQcmV2ZW50fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dmlzaWJsZVRpbGVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2hvd05CdXR0b259XG4gICAgICAgICAgICAgICAgICAgIDwvUmVzaXphYmxlPlxuICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2hvd1NrZWxldG9uICYmIHRoaXMuc3RhdGUuaXNFeHBhbmRlZCkge1xuICAgICAgICAgICAgY29udGVudCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3Rfc2tlbGV0b25VSVwiIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuc3VibGlzdFJlZn1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgcm9sZT1cImdyb3VwXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3RoaXMucmVuZGVySGVhZGVyKCl9XG4gICAgICAgICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
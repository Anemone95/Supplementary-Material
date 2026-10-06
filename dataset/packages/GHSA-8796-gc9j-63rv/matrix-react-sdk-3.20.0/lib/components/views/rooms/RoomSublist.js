"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

const SHOW_N_BUTTON_HEIGHT = 28; // As defined by CSS

const RESIZE_HANDLE_HEIGHT = 4; // As defined by CSS

const HEADER_HEIGHT = 32; // As defined by CSS

exports.HEADER_HEIGHT = HEADER_HEIGHT;
const MAX_PADDING_HEIGHT = SHOW_N_BUTTON_HEIGHT + RESIZE_HANDLE_HEIGHT; // HACK: We really shouldn't have to do this.

(0, _polyfill.polyfillTouchEvent)();
let RoomSublist = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.RoomSublist"), _dec(_class = (_temp = class RoomSublist extends React.Component
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

      if (this.props.extraTiles) {
        const nameCondition = _RoomListStore.default.instance.getFirstNameFilterCondition();

        if (nameCondition) {
          stateUpdates.filteredExtraTiles = this.props.extraTiles.filter(t => nameCondition.matches(t.props.displayName || ""));
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
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomListAction(ev);

      switch (action) {
        case _KeyBindingsManager.RoomListAction.CollapseSection:
          ev.stopPropagation();

          if (this.state.isExpanded) {
            // Collapse the room sublist if it isn't already
            this.toggleCollapsed();
          }

          break;

        case _KeyBindingsManager.RoomListAction.ExpandSection:
          {
            ev.stopPropagation();

            if (!this.state.isExpanded) {
              // Expand the room sublist if it isn't already
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
  /*: ReactComponentElement<typeof ExtraTile>[] | null*/
  {
    if (this.state.filteredExtraTiles) {
      return this.state.filteredExtraTiles;
    }

    if (this.props.extraTiles) {
      return this.props.extraTiles;
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
    const prevExtraTiles = prevState.filteredExtraTiles || prevProps.extraTiles; // as the rooms can come in one by one we need to reevaluate
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


    const prevExtraTiles = this.props.extraTiles || [];
    const nextExtraTiles = nextState.filteredExtraTiles || nextProps.extraTiles || [];

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

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _RoomListStore.default.instance.on(_RoomListStore.LISTS_UPDATE_EVENT, this.onListsUpdated);
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
          resizeNotifier: this.props.resizeNotifier,
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
      'mx_RoomSublist_minimized': this.props.isMinimized,
      'mx_RoomSublist_hidden': !this.state.rooms.length && !this.props.extraTiles?.length && this.props.alwaysVisible !== true
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

}, _temp)) || _class);
exports.default = RoomSublist;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21TdWJsaXN0LnRzeCJdLCJuYW1lcyI6WyJTSE9XX05fQlVUVE9OX0hFSUdIVCIsIlJFU0laRV9IQU5ETEVfSEVJR0hUIiwiSEVBREVSX0hFSUdIVCIsIk1BWF9QQURESU5HX0hFSUdIVCIsIlJvb21TdWJsaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3RhdGVVcGRhdGVzIiwiZXh0cmFUaWxlcyIsIm5hbWVDb25kaXRpb24iLCJSb29tTGlzdFN0b3JlIiwiaW5zdGFuY2UiLCJnZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24iLCJmaWx0ZXJlZEV4dHJhVGlsZXMiLCJmaWx0ZXIiLCJ0IiwibWF0Y2hlcyIsImRpc3BsYXlOYW1lIiwic3RhdGUiLCJjdXJyZW50Um9vbXMiLCJyb29tcyIsIm5ld1Jvb21zIiwib3JkZXJlZExpc3RzIiwidGFnSWQiLCJpc1N0aWxsQmVpbmdGaWx0ZXJlZCIsImlzQmVpbmdGaWx0ZXJlZCIsImlzRXhwYW5kZWQiLCJsYXlvdXQiLCJpc0NvbGxhcHNlZCIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJzZXRTdGF0ZSIsInBheWxvYWQiLCJhY3Rpb24iLCJzaG93X3Jvb21fdGlsZSIsInNldEltbWVkaWF0ZSIsInJvb21JbmRleCIsImZpbmRJbmRleCIsInIiLCJyb29tSWQiLCJyb29tX2lkIiwidG9nZ2xlQ29sbGFwc2VkIiwibnVtVmlzaWJsZVRpbGVzIiwidmlzaWJsZVRpbGVzIiwidGlsZXNXaXRoUGFkZGluZyIsImZvcmNlVXBkYXRlIiwiZSIsInN0b3BQcm9wYWdhdGlvbiIsIm9uQWRkUm9vbSIsInRyYXZlbERpcmVjdGlvbiIsInJlZlRvRWxlbWVudCIsImRlbHRhIiwibmV3SGVpZ2h0IiwiaGVpZ2h0QXRTdGFydCIsImhlaWdodCIsImFwcGx5SGVpZ2h0Q2hhbmdlIiwiaXNSZXNpemluZyIsInRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyIsIm51bVRpbGVzIiwicGFkZGluZyIsImZvY3VzUm9vbVRpbGUiLCJkZWZhdWx0VmlzaWJsZVRpbGVzIiwiaW5kZXgiLCJzdWJsaXN0UmVmIiwiY3VycmVudCIsImVsZW1lbnRzIiwicXVlcnlTZWxlY3RvckFsbCIsImVsZW1lbnQiLCJmb2N1cyIsImV2IiwicHJldmVudERlZmF1bHQiLCJ0YXJnZXQiLCJjb250ZXh0TWVudVBvc2l0aW9uIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwibGVmdCIsImNsaWVudFgiLCJ0b3AiLCJjbGllbnRZIiwiYWRkUm9vbUNvbnRleHRNZW51UG9zaXRpb24iLCJpc1VucmVhZEZpcnN0IiwiZ2V0TGlzdE9yZGVyIiwiTGlzdEFsZ29yaXRobSIsIkltcG9ydGFuY2UiLCJuZXdBbGdvcml0aG0iLCJOYXR1cmFsIiwic2V0TGlzdE9yZGVyIiwic29ydCIsInNldFRhZ1NvcnRpbmciLCJzaG93UHJldmlld3MiLCJyb29tIiwiRGVmYXVsdFRhZ0lEIiwiSW52aXRlIiwidW5maWx0ZXJlZExpc3RzIiwiZmluZCIsIm5vdGlmU3RhdGUiLCJub3RpZmljYXRpb25TdGF0ZSIsImdldEZvclJvb20iLCJjb3VudCIsImNvbG9yIiwiZGlzIiwiZGlzcGF0Y2giLCJwb3NzaWJsZVN0aWNreSIsImhlYWRlckJ1dHRvbiIsInBhcmVudEVsZW1lbnQiLCJzdWJsaXN0IiwibGlzdCIsImlzQXRUb3AiLCJzY3JvbGxUb3AiLCJpc0F0Qm90dG9tIiwic2Nyb2xsSGVpZ2h0Iiwib2Zmc2V0SGVpZ2h0IiwiaXNTdGlja3lUb3AiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImlzU3RpY2t5Qm90dG9tIiwic2Nyb2xsSW50b1ZpZXciLCJiZWhhdmlvciIsIm9uUmVzaXplIiwiZ2V0Um9vbUxpc3RBY3Rpb24iLCJSb29tTGlzdEFjdGlvbiIsIkNvbGxhcHNlU2VjdGlvbiIsIkV4cGFuZFNlY3Rpb24iLCJxdWVyeVNlbGVjdG9yIiwia2V5IiwiS2V5IiwiQVJST1dfTEVGVCIsIkFSUk9XX1JJR0hUIiwiUm9vbUxpc3RMYXlvdXRTdG9yZSIsImdldExheW91dEZvciIsIlJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIiwiZ2V0TGlzdFN0YXRlIiwiYXNzaWduIiwiY2FsY3VsYXRlSW5pdGlhbEhlaWdodCIsInJlcXVlc3RlZFZpc2libGVUaWxlcyIsIk1hdGgiLCJtYXgiLCJmbG9vciIsIm1pblZpc2libGVUaWxlcyIsInRpbGVDb3VudCIsIm1pbiIsIm5lZWRzU2hvd01vcmUiLCJuZWVkc1Nob3dMZXNzIiwiY2FsY051bVRpbGVzIiwiblZpc2libGUiLCJjZWlsIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwicHJldkV4dHJhVGlsZXMiLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJwcmV2U3RhdGVOb1Jvb21zIiwibmV4dFN0YXRlTm9Sb29tcyIsIm5leHRFeHRyYVRpbGVzIiwicHJldlNsaWNlZFJvb21zIiwic2xpY2UiLCJuZXh0U2xpY2VkUm9vbXMiLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXJSZWYiLCJkZWZhdWx0RGlzcGF0Y2hlciIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJvbiIsIkxJU1RTX1VQREFURV9FVkVOVCIsIm9uTGlzdHNVcGRhdGVkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwib2ZmIiwiaGVpZ2h0SW5UaWxlcyIsInBpeGVsc1RvVGlsZXMiLCJyZW5kZXJWaXNpYmxlVGlsZXMiLCJ0aWxlcyIsInZpc2libGVSb29tcyIsInB1c2giLCJyZXNpemVOb3RpZmllciIsImlzTWluaW1pemVkIiwicmVuZGVyTWVudSIsImNvbnRleHRNZW51IiwiaXNBbHBoYWJldGljYWwiLCJnZXRUYWdTb3J0aW5nIiwiU29ydEFsZ29yaXRobSIsIkFscGhhYmV0aWMiLCJvdGhlclNlY3Rpb25zIiwib25DbG9zZU1lbnUiLCJvblVucmVhZEZpcnN0Q2hhbmdlZCIsIm9uTWVzc2FnZVByZXZpZXdDaGFuZ2VkIiwiQ2hldnJvbkZhY2UiLCJOb25lIiwib25UYWdTb3J0Q2hhbmdlZCIsIlJlY2VudCIsIm9uQ2xvc2VBZGRSb29tTWVudSIsImFkZFJvb21Db250ZXh0TWVudSIsIm9uT3Blbk1lbnVDbGljayIsInJlbmRlckhlYWRlciIsIm9uRm9jdXMiLCJpc0FjdGl2ZSIsInJlZiIsInRhYkluZGV4IiwiYXJpYUxhYmVsIiwiYmFkZ2UiLCJvbkJhZGdlQ2xpY2siLCJhZGRSb29tQnV0dG9uIiwiYWRkUm9vbUxhYmVsIiwib25BZGRSb29tQ29udGV4dE1lbnUiLCJjb2xsYXBzZUNsYXNzZXMiLCJjbGFzc2VzIiwiYmFkZ2VDb250YWluZXIiLCJCdXR0b24iLCJBY2Nlc3NpYmxlQnV0dG9uIiwiQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24iLCJvbkhlYWRlcktleURvd24iLCJsYWJlbCIsIm9uSGVhZGVyQ2xpY2siLCJvbkNvbnRleHRNZW51IiwidW5kZWZpbmVkIiwib25TY3JvbGxQcmV2ZW50IiwicmVuZGVyIiwiYWx3YXlzVmlzaWJsZSIsImNvbnRlbnQiLCJtaW5UaWxlcyIsInNob3dNb3JlQXRNaW5IZWlnaHQiLCJtaW5IZWlnaHRQYWRkaW5nIiwibWluVGlsZXNQeCIsIm1heFRpbGVzUHgiLCJzaG93TW9yZUJ0bkNsYXNzZXMiLCJzaG93TkJ1dHRvbiIsIm5vblBhZGRlZEhlaWdodCIsImFtb3VudEZ1bGx5U2hvd24iLCJ0aWxlSGVpZ2h0IiwibnVtTWlzc2luZyIsInNob3dNb3JlVGV4dCIsIm9uU2hvd0FsbENsaWNrIiwic2hvd0xlc3NUZXh0Iiwib25TaG93TGVzc0NsaWNrIiwiaGFuZGxlcyIsImJvdHRvbSIsImJvdHRvbUxlZnQiLCJib3R0b21SaWdodCIsInJpZ2h0IiwidG9wTGVmdCIsInRvcFJpZ2h0IiwiaGFuZGxlV3JhcHBlckNsYXNzZXMiLCJvblJlc2l6ZVN0YXJ0Iiwib25SZXNpemVTdG9wIiwic2hvd1NrZWxldG9uIiwib25LZXlEb3duIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQU9BOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOzs7O0FBRUEsTUFBTUEsb0JBQW9CLEdBQUcsRUFBN0IsQyxDQUFpQzs7QUFDakMsTUFBTUMsb0JBQW9CLEdBQUcsQ0FBN0IsQyxDQUFnQzs7QUFDekIsTUFBTUMsYUFBYSxHQUFHLEVBQXRCLEMsQ0FBMEI7OztBQUVqQyxNQUFNQyxrQkFBa0IsR0FBR0gsb0JBQW9CLEdBQUdDLG9CQUFsRCxDLENBRUE7O0FBQ0E7SUF1Q3FCRyxXLFdBRHBCLGdEQUFxQix5QkFBckIsQyx5QkFBRCxNQUNxQkEsV0FEckIsU0FDeUNDLEtBQUssQ0FBQ0M7QUFEL0M7QUFDeUU7QUFTckVDLEVBQUFBLFdBQVcsQ0FBQ0M7QUFBRDtBQUFBLElBQWdCO0FBQ3ZCLFVBQU1BLEtBQU47QUFEdUIscUVBUkosc0JBUUk7QUFBQSxtRUFQTixzQkFPTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwREE4SUYsTUFBTTtBQUMzQixZQUFNQztBQUEwQjtBQUFBLFFBQUcsRUFBbkMsQ0FEMkIsQ0FDWTs7QUFFdkMsVUFBSSxLQUFLRCxLQUFMLENBQVdFLFVBQWYsRUFBMkI7QUFDdkIsY0FBTUMsYUFBYSxHQUFHQyx1QkFBY0MsUUFBZCxDQUF1QkMsMkJBQXZCLEVBQXRCOztBQUNBLFlBQUlILGFBQUosRUFBbUI7QUFDZkYsVUFBQUEsWUFBWSxDQUFDTSxrQkFBYixHQUFrQyxLQUFLUCxLQUFMLENBQVdFLFVBQVgsQ0FDN0JNLE1BRDZCLENBQ3RCQyxDQUFDLElBQUlOLGFBQWEsQ0FBQ08sT0FBZCxDQUFzQkQsQ0FBQyxDQUFDVCxLQUFGLENBQVFXLFdBQVIsSUFBdUIsRUFBN0MsQ0FEaUIsQ0FBbEM7QUFFSCxTQUhELE1BR08sSUFBSSxLQUFLQyxLQUFMLENBQVdMLGtCQUFmLEVBQW1DO0FBQ3RDTixVQUFBQSxZQUFZLENBQUNNLGtCQUFiLEdBQWtDLElBQWxDO0FBQ0g7QUFDSjs7QUFFRCxZQUFNTSxZQUFZLEdBQUcsS0FBS0QsS0FBTCxDQUFXRSxLQUFoQztBQUNBLFlBQU1DLFFBQVEsR0FBRyw0QkFBZVgsdUJBQWNDLFFBQWQsQ0FBdUJXLFlBQXZCLENBQW9DLEtBQUtoQixLQUFMLENBQVdpQixLQUEvQyxLQUF5RCxFQUF4RSxDQUFqQjs7QUFDQSxVQUFJLGlDQUFvQkosWUFBcEIsRUFBa0NFLFFBQWxDLENBQUosRUFBaUQ7QUFDN0NkLFFBQUFBLFlBQVksQ0FBQ2EsS0FBYixHQUFxQkMsUUFBckI7QUFDSDs7QUFFRCxZQUFNRyxvQkFBb0IsR0FBRyxDQUFDLENBQUNkLHVCQUFjQyxRQUFkLENBQXVCQywyQkFBdkIsRUFBL0I7O0FBQ0EsVUFBSVksb0JBQW9CLEtBQUssS0FBS0MsZUFBbEMsRUFBbUQ7QUFDL0MsYUFBS0EsZUFBTCxHQUF1QkQsb0JBQXZCOztBQUNBLFlBQUlBLG9CQUFKLEVBQTBCO0FBQ3RCakIsVUFBQUEsWUFBWSxDQUFDbUIsVUFBYixHQUEwQixJQUExQjtBQUNILFNBRkQsTUFFTztBQUNIbkIsVUFBQUEsWUFBWSxDQUFDbUIsVUFBYixHQUEwQixDQUFDLEtBQUtDLE1BQUwsQ0FBWUMsV0FBdkM7QUFDSDtBQUNKOztBQUVELFVBQUlDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZdkIsWUFBWixFQUEwQndCLE1BQTFCLEdBQW1DLENBQXZDLEVBQTBDO0FBQ3RDLGFBQUtDLFFBQUwsQ0FBY3pCLFlBQWQ7QUFDSDtBQUNKLEtBOUswQjtBQUFBLG9EQWdMUixDQUFDMEI7QUFBRDtBQUFBLFNBQTRCO0FBQzNDLFVBQUlBLE9BQU8sQ0FBQ0MsTUFBUixLQUFtQixXQUFuQixJQUFrQ0QsT0FBTyxDQUFDRSxjQUExQyxJQUE0RCxLQUFLakIsS0FBTCxDQUFXRSxLQUEzRSxFQUFrRjtBQUM5RTtBQUNBO0FBQ0FnQixRQUFBQSxZQUFZLENBQUMsTUFBTTtBQUNmLGdCQUFNQyxTQUFTLEdBQUcsS0FBS25CLEtBQUwsQ0FBV0UsS0FBWCxDQUFpQmtCLFNBQWpCLENBQTRCQyxDQUFELElBQU9BLENBQUMsQ0FBQ0MsTUFBRixLQUFhUCxPQUFPLENBQUNRLE9BQXZELENBQWxCOztBQUVBLGNBQUksQ0FBQyxLQUFLdkIsS0FBTCxDQUFXUSxVQUFaLElBQTBCVyxTQUFTLEdBQUcsQ0FBQyxDQUEzQyxFQUE4QztBQUMxQyxpQkFBS0ssZUFBTDtBQUNILFdBTGMsQ0FNZjs7O0FBQ0EsY0FBSUwsU0FBUyxJQUFJLEtBQUtNLGVBQXRCLEVBQXVDO0FBQ25DLGlCQUFLaEIsTUFBTCxDQUFZaUIsWUFBWixHQUEyQixLQUFLakIsTUFBTCxDQUFZa0IsZ0JBQVosQ0FBNkJSLFNBQVMsR0FBRyxDQUF6QyxFQUE0Q3BDLGtCQUE1QyxDQUEzQjtBQUNBLGlCQUFLNkMsV0FBTCxHQUZtQyxDQUVmO0FBQ3ZCO0FBQ0osU0FYVyxDQUFaO0FBWUg7QUFDSixLQWpNMEI7QUFBQSxxREFtTU5DLENBQUQsSUFBTztBQUN2QkEsTUFBQUEsQ0FBQyxDQUFDQyxlQUFGO0FBQ0EsVUFBSSxLQUFLMUMsS0FBTCxDQUFXMkMsU0FBZixFQUEwQixLQUFLM0MsS0FBTCxDQUFXMkMsU0FBWDtBQUM3QixLQXRNMEI7QUFBQSxvREE2TVIsQ0FDZkY7QUFEZTtBQUFBLE1BRWZHO0FBRmU7QUFBQSxNQUdmQztBQUhlO0FBQUEsTUFJZkM7QUFKZTtBQUFBLFNBS2Q7QUFDRCxZQUFNQyxTQUFTLEdBQUcsS0FBS0MsYUFBTCxHQUFxQkYsS0FBSyxDQUFDRyxNQUE3QztBQUNBLFdBQUtDLGlCQUFMLENBQXVCSCxTQUF2QjtBQUNBLFdBQUtyQixRQUFMLENBQWM7QUFBQ3VCLFFBQUFBLE1BQU0sRUFBRUY7QUFBVCxPQUFkO0FBQ0gsS0F0TjBCO0FBQUEseURBd05ILE1BQU07QUFDMUIsV0FBS0MsYUFBTCxHQUFxQixLQUFLcEMsS0FBTCxDQUFXcUMsTUFBaEM7QUFDQSxXQUFLdkIsUUFBTCxDQUFjO0FBQUN5QixRQUFBQSxVQUFVLEVBQUU7QUFBYixPQUFkO0FBQ0gsS0EzTjBCO0FBQUEsd0RBNk5KLENBQ25CVjtBQURtQjtBQUFBLE1BRW5CRztBQUZtQjtBQUFBLE1BR25CQztBQUhtQjtBQUFBLE1BSW5CQztBQUptQjtBQUFBLFNBS2xCO0FBQ0QsWUFBTUMsU0FBUyxHQUFHLEtBQUtDLGFBQUwsR0FBcUJGLEtBQUssQ0FBQ0csTUFBN0M7QUFDQSxXQUFLQyxpQkFBTCxDQUF1QkgsU0FBdkI7QUFDQSxXQUFLckIsUUFBTCxDQUFjO0FBQUN5QixRQUFBQSxVQUFVLEVBQUUsS0FBYjtBQUFvQkYsUUFBQUEsTUFBTSxFQUFFRjtBQUE1QixPQUFkO0FBQ0gsS0F0TzBCO0FBQUEsMERBd09GLE1BQU07QUFDM0I7QUFDQSxZQUFNVixlQUFlLEdBQUcsS0FBS0EsZUFBN0I7QUFDQSxZQUFNVSxTQUFTLEdBQUcsS0FBSzFCLE1BQUwsQ0FBWStCLHdCQUFaLENBQXFDLEtBQUtDLFFBQTFDLEVBQW9ELEtBQUtDLE9BQXpELENBQWxCO0FBQ0EsV0FBS0osaUJBQUwsQ0FBdUJILFNBQXZCO0FBQ0EsV0FBS3JCLFFBQUwsQ0FBYztBQUFDdUIsUUFBQUEsTUFBTSxFQUFFRjtBQUFULE9BQWQsRUFBbUMsTUFBTTtBQUNyQztBQUNBLGFBQUtRLGFBQUwsQ0FBbUJsQixlQUFuQjtBQUNILE9BSEQ7QUFJSCxLQWpQMEI7QUFBQSwyREFtUEQsTUFBTTtBQUM1QixZQUFNVSxTQUFTLEdBQUcsS0FBSzFCLE1BQUwsQ0FBWStCLHdCQUFaLENBQXFDLEtBQUsvQixNQUFMLENBQVltQyxtQkFBakQsRUFBc0UsS0FBS0YsT0FBM0UsQ0FBbEI7QUFDQSxXQUFLSixpQkFBTCxDQUF1QkgsU0FBdkI7QUFDQSxXQUFLckIsUUFBTCxDQUFjO0FBQUN1QixRQUFBQSxNQUFNLEVBQUVGO0FBQVQsT0FBZDtBQUNILEtBdlAwQjtBQUFBLHlEQXlQSCxDQUFDVTtBQUFEO0FBQUEsU0FBbUI7QUFDdkMsVUFBSSxDQUFDLEtBQUtDLFVBQUwsQ0FBZ0JDLE9BQXJCLEVBQThCO0FBQzlCLFlBQU1DLFFBQVEsR0FBRyxLQUFLRixVQUFMLENBQWdCQyxPQUFoQixDQUF3QkUsZ0JBQXhCLENBQXlELGNBQXpELENBQWpCO0FBQ0EsWUFBTUMsT0FBTyxHQUFHRixRQUFRLElBQUlBLFFBQVEsQ0FBQ0gsS0FBRCxDQUFwQzs7QUFDQSxVQUFJSyxPQUFKLEVBQWE7QUFDVEEsUUFBQUEsT0FBTyxDQUFDQyxLQUFSO0FBQ0g7QUFDSixLQWhRMEI7QUFBQSwyREFrUUQsQ0FBQ0M7QUFBRDtBQUFBLFNBQTBCO0FBQ2hEQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFDQUQsTUFBQUEsRUFBRSxDQUFDdEIsZUFBSDtBQUNBLFlBQU13QixNQUFNLEdBQUdGLEVBQUUsQ0FBQ0UsTUFBbEI7QUFDQSxXQUFLeEMsUUFBTCxDQUFjO0FBQUN5QyxRQUFBQSxtQkFBbUIsRUFBRUQsTUFBTSxDQUFDRSxxQkFBUDtBQUF0QixPQUFkO0FBQ0gsS0F2UTBCO0FBQUEseURBeVFILENBQUNKO0FBQUQ7QUFBQSxTQUEwQjtBQUM5Q0EsTUFBQUEsRUFBRSxDQUFDQyxjQUFIO0FBQ0FELE1BQUFBLEVBQUUsQ0FBQ3RCLGVBQUg7QUFDQSxXQUFLaEIsUUFBTCxDQUFjO0FBQ1Z5QyxRQUFBQSxtQkFBbUIsRUFBRTtBQUNqQkUsVUFBQUEsSUFBSSxFQUFFTCxFQUFFLENBQUNNLE9BRFE7QUFFakJDLFVBQUFBLEdBQUcsRUFBRVAsRUFBRSxDQUFDUSxPQUZTO0FBR2pCdkIsVUFBQUEsTUFBTSxFQUFFO0FBSFM7QUFEWCxPQUFkO0FBT0gsS0FuUjBCO0FBQUEsZ0VBcVJJLENBQUNlO0FBQUQ7QUFBQSxTQUEwQjtBQUNyREEsTUFBQUEsRUFBRSxDQUFDQyxjQUFIO0FBQ0FELE1BQUFBLEVBQUUsQ0FBQ3RCLGVBQUg7QUFDQSxZQUFNd0IsTUFBTSxHQUFHRixFQUFFLENBQUNFLE1BQWxCO0FBQ0EsV0FBS3hDLFFBQUwsQ0FBYztBQUFDK0MsUUFBQUEsMEJBQTBCLEVBQUVQLE1BQU0sQ0FBQ0UscUJBQVA7QUFBN0IsT0FBZDtBQUNILEtBMVIwQjtBQUFBLHVEQTRSTCxNQUFNO0FBQ3hCLFdBQUsxQyxRQUFMLENBQWM7QUFBQ3lDLFFBQUFBLG1CQUFtQixFQUFFO0FBQXRCLE9BQWQ7QUFDSCxLQTlSMEI7QUFBQSw4REFnU0UsTUFBTTtBQUMvQixXQUFLekMsUUFBTCxDQUFjO0FBQUMrQyxRQUFBQSwwQkFBMEIsRUFBRTtBQUE3QixPQUFkO0FBQ0gsS0FsUzBCO0FBQUEsZ0VBb1NJLFlBQVk7QUFDdkMsWUFBTUMsYUFBYSxHQUFHdEUsdUJBQWNDLFFBQWQsQ0FBdUJzRSxZQUF2QixDQUFvQyxLQUFLM0UsS0FBTCxDQUFXaUIsS0FBL0MsTUFBMEQyRCxzQkFBY0MsVUFBOUY7O0FBQ0EsWUFBTUMsWUFBWSxHQUFHSixhQUFhLEdBQUdFLHNCQUFjRyxPQUFqQixHQUEyQkgsc0JBQWNDLFVBQTNFO0FBQ0EsWUFBTXpFLHVCQUFjQyxRQUFkLENBQXVCMkUsWUFBdkIsQ0FBb0MsS0FBS2hGLEtBQUwsQ0FBV2lCLEtBQS9DLEVBQXNENkQsWUFBdEQsQ0FBTjtBQUNBLFdBQUt0QyxXQUFMLEdBSnVDLENBSW5CO0FBQ3ZCLEtBelMwQjtBQUFBLDREQTJTQSxPQUFPeUM7QUFBUDtBQUFBLFNBQStCO0FBQ3RELFlBQU03RSx1QkFBY0MsUUFBZCxDQUF1QjZFLGFBQXZCLENBQXFDLEtBQUtsRixLQUFMLENBQVdpQixLQUFoRCxFQUF1RGdFLElBQXZELENBQU47QUFDSCxLQTdTMEI7QUFBQSxtRUErU08sTUFBTTtBQUNwQyxXQUFLNUQsTUFBTCxDQUFZOEQsWUFBWixHQUEyQixDQUFDLEtBQUs5RCxNQUFMLENBQVk4RCxZQUF4QztBQUNBLFdBQUszQyxXQUFMLEdBRm9DLENBRWhCO0FBQ3ZCLEtBbFQwQjtBQUFBLHdEQW9USixDQUFDd0I7QUFBRDtBQUFBLFNBQTBCO0FBQzdDQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFDQUQsTUFBQUEsRUFBRSxDQUFDdEIsZUFBSDtBQUVBLFVBQUkwQyxJQUFKOztBQUNBLFVBQUksS0FBS3BGLEtBQUwsQ0FBV2lCLEtBQVgsS0FBcUJvRSxzQkFBYUMsTUFBdEMsRUFBOEM7QUFDMUM7QUFDQUYsUUFBQUEsSUFBSSxHQUFHLEtBQUt4RSxLQUFMLENBQVdFLEtBQVgsSUFBb0IsS0FBS0YsS0FBTCxDQUFXRSxLQUFYLENBQWlCLENBQWpCLENBQTNCO0FBQ0gsT0FIRCxNQUdPO0FBQ0g7QUFDQXNFLFFBQUFBLElBQUksR0FBR2hGLHVCQUFjQyxRQUFkLENBQXVCa0YsZUFBdkIsQ0FBdUMsS0FBS3ZGLEtBQUwsQ0FBV2lCLEtBQWxELEVBQXlEdUUsSUFBekQsQ0FBOEQsQ0FBQ3ZEO0FBQUQ7QUFBQSxhQUFhO0FBQzlFLGdCQUFNd0QsVUFBVSxHQUFHLEtBQUtDLGlCQUFMLENBQXVCQyxVQUF2QixDQUFrQzFELENBQWxDLENBQW5CO0FBQ0EsaUJBQU93RCxVQUFVLENBQUNHLEtBQVgsR0FBbUIsQ0FBbkIsSUFBd0JILFVBQVUsQ0FBQ0ksS0FBWCxLQUFxQixLQUFLSCxpQkFBTCxDQUF1QkcsS0FBM0U7QUFDSCxTQUhNLENBQVA7QUFJSDs7QUFFRCxVQUFJVCxJQUFKLEVBQVU7QUFDTlUsNEJBQUlDLFFBQUosQ0FBYTtBQUNUbkUsVUFBQUEsTUFBTSxFQUFFLFdBREM7QUFFVE8sVUFBQUEsT0FBTyxFQUFFaUQsSUFBSSxDQUFDbEQsTUFGTDtBQUdUTCxVQUFBQSxjQUFjLEVBQUUsSUFIUCxDQUdhOztBQUhiLFNBQWI7QUFLSDtBQUNKLEtBM1UwQjtBQUFBLHlEQTZVSCxNQUFNO0FBQzFCLFlBQU1tRSxjQUFjLEdBQUcsS0FBS0MsWUFBTCxDQUFrQnRDLE9BQWxCLENBQTBCdUMsYUFBakQ7QUFDQSxZQUFNQyxPQUFPLEdBQUdILGNBQWMsQ0FBQ0UsYUFBZixDQUE2QkEsYUFBN0M7QUFDQSxZQUFNRSxJQUFJLEdBQUdELE9BQU8sQ0FBQ0QsYUFBUixDQUFzQkEsYUFBbkMsQ0FIMEIsQ0FJMUI7O0FBQ0EsWUFBTUcsT0FBTyxHQUFHRCxJQUFJLENBQUNFLFNBQUwsSUFBa0I1RyxhQUFsQztBQUNBLFlBQU02RyxVQUFVLEdBQUdILElBQUksQ0FBQ0UsU0FBTCxJQUFrQkYsSUFBSSxDQUFDSSxZQUFMLEdBQW9CSixJQUFJLENBQUNLLFlBQTlEO0FBQ0EsWUFBTUMsV0FBVyxHQUFHVixjQUFjLENBQUNXLFNBQWYsQ0FBeUJDLFFBQXpCLENBQWtDLDBDQUFsQyxDQUFwQjtBQUNBLFlBQU1DLGNBQWMsR0FBR2IsY0FBYyxDQUFDVyxTQUFmLENBQXlCQyxRQUF6QixDQUFrQyw2Q0FBbEMsQ0FBdkI7O0FBRUEsVUFBS0MsY0FBYyxJQUFJLENBQUNOLFVBQXBCLElBQW9DRyxXQUFXLElBQUksQ0FBQ0wsT0FBeEQsRUFBa0U7QUFDOUQ7QUFDQUYsUUFBQUEsT0FBTyxDQUFDVyxjQUFSLENBQXVCO0FBQUNDLFVBQUFBLFFBQVEsRUFBRTtBQUFYLFNBQXZCO0FBQ0gsT0FIRCxNQUdPO0FBQ0g7QUFDQSxjQUFNM0YsVUFBVSxHQUFHLEtBQUtSLEtBQUwsQ0FBV1EsVUFBOUI7QUFDQSxhQUFLZ0IsZUFBTCxHQUhHLENBSUg7O0FBQ0EsWUFBSSxDQUFDaEIsVUFBRCxJQUFleUYsY0FBbkIsRUFBbUM7QUFDL0IvRSxVQUFBQSxZQUFZLENBQUMsTUFBTTtBQUNmcUUsWUFBQUEsT0FBTyxDQUFDVyxjQUFSLENBQXVCO0FBQUNDLGNBQUFBLFFBQVEsRUFBRTtBQUFYLGFBQXZCO0FBQ0gsV0FGVyxDQUFaO0FBR0g7QUFDSjtBQUNKLEtBclcwQjtBQUFBLDJEQXVXRCxNQUFNO0FBQzVCLFdBQUsxRixNQUFMLENBQVlDLFdBQVosR0FBMEIsS0FBS1YsS0FBTCxDQUFXUSxVQUFyQztBQUNBLFdBQUtNLFFBQUwsQ0FBYztBQUFDTixRQUFBQSxVQUFVLEVBQUUsQ0FBQyxLQUFLQyxNQUFMLENBQVlDO0FBQTFCLE9BQWQ7QUFDQVEsTUFBQUEsWUFBWSxDQUFDLE1BQU0sS0FBSzlCLEtBQUwsQ0FBV2dILFFBQVgsRUFBUCxDQUFaLENBSDRCLENBR2U7QUFDOUMsS0EzVzBCO0FBQUEsMkRBNldELENBQUNoRDtBQUFEO0FBQUEsU0FBNkI7QUFDbkQsWUFBTXBDLE1BQU0sR0FBRyxpREFBd0JxRixpQkFBeEIsQ0FBMENqRCxFQUExQyxDQUFmOztBQUNBLGNBQVFwQyxNQUFSO0FBQ0ksYUFBS3NGLG1DQUFlQyxlQUFwQjtBQUNJbkQsVUFBQUEsRUFBRSxDQUFDdEIsZUFBSDs7QUFDQSxjQUFJLEtBQUs5QixLQUFMLENBQVdRLFVBQWYsRUFBMkI7QUFDdkI7QUFDQSxpQkFBS2dCLGVBQUw7QUFDSDs7QUFDRDs7QUFDSixhQUFLOEUsbUNBQWVFLGFBQXBCO0FBQW1DO0FBQy9CcEQsWUFBQUEsRUFBRSxDQUFDdEIsZUFBSDs7QUFDQSxnQkFBSSxDQUFDLEtBQUs5QixLQUFMLENBQVdRLFVBQWhCLEVBQTRCO0FBQ3hCO0FBQ0EsbUJBQUtnQixlQUFMO0FBQ0gsYUFIRCxNQUdPLElBQUksS0FBS3NCLFVBQUwsQ0FBZ0JDLE9BQXBCLEVBQTZCO0FBQ2hDO0FBQ0Esb0JBQU1HLE9BQU8sR0FBRyxLQUFLSixVQUFMLENBQWdCQyxPQUFoQixDQUF3QjBELGFBQXhCLENBQXNDLGNBQXRDLENBQWhCOztBQUNBLGtCQUFJdkQsT0FBSixFQUFhO0FBQ1RBLGdCQUFBQSxPQUFPLENBQUNDLEtBQVI7QUFDSDtBQUNKOztBQUNEO0FBQ0g7QUFyQkw7QUF1QkgsS0F0WTBCO0FBQUEscURBd1lQLENBQUNDO0FBQUQ7QUFBQSxTQUE2QjtBQUM3QyxjQUFRQSxFQUFFLENBQUNzRCxHQUFYO0FBQ0k7QUFDQSxhQUFLQyxjQUFJQyxVQUFUO0FBQ0l4RCxVQUFBQSxFQUFFLENBQUN0QixlQUFIO0FBQ0EsZUFBS3VELFlBQUwsQ0FBa0J0QyxPQUFsQixDQUEwQkksS0FBMUI7QUFDQTtBQUNKOztBQUNBLGFBQUt3RCxjQUFJRSxXQUFUO0FBQ0l6RCxVQUFBQSxFQUFFLENBQUN0QixlQUFIO0FBUlI7QUFVSCxLQW5aMEI7QUFHdkIsU0FBS3JCLE1BQUwsR0FBY3FHLDZCQUFvQnJILFFBQXBCLENBQTZCc0gsWUFBN0IsQ0FBMEMsS0FBSzNILEtBQUwsQ0FBV2lCLEtBQXJELENBQWQ7QUFDQSxTQUFLK0IsYUFBTCxHQUFxQixDQUFyQjtBQUNBLFNBQUs3QixlQUFMLEdBQXVCLENBQUMsQ0FBQ2YsdUJBQWNDLFFBQWQsQ0FBdUJDLDJCQUF2QixFQUF6QjtBQUNBLFNBQUtvRixpQkFBTCxHQUF5QmtDLHVEQUEyQnZILFFBQTNCLENBQW9Dd0gsWUFBcEMsQ0FBaUQsS0FBSzdILEtBQUwsQ0FBV2lCLEtBQTVELENBQXpCO0FBQ0EsU0FBS0wsS0FBTCxHQUFhO0FBQ1R1RCxNQUFBQSxtQkFBbUIsRUFBRSxJQURaO0FBRVRNLE1BQUFBLDBCQUEwQixFQUFFLElBRm5CO0FBR1R0QixNQUFBQSxVQUFVLEVBQUUsS0FISDtBQUlUL0IsTUFBQUEsVUFBVSxFQUFFLEtBQUtELGVBQUwsR0FBdUIsS0FBS0EsZUFBNUIsR0FBOEMsQ0FBQyxLQUFLRSxNQUFMLENBQVlDLFdBSjlEO0FBS1QyQixNQUFBQSxNQUFNLEVBQUUsQ0FMQztBQUtFO0FBQ1huQyxNQUFBQSxLQUFLLEVBQUUsNEJBQWVWLHVCQUFjQyxRQUFkLENBQXVCVyxZQUF2QixDQUFvQyxLQUFLaEIsS0FBTCxDQUFXaUIsS0FBL0MsS0FBeUQsRUFBeEU7QUFORSxLQUFiLENBUHVCLENBZXZCOztBQUNBLFNBQUtMLEtBQUwsR0FBYVcsTUFBTSxDQUFDdUcsTUFBUCxDQUFjLEtBQUtsSCxLQUFuQixFQUEwQjtBQUFDcUMsTUFBQUEsTUFBTSxFQUFFLEtBQUs4RSxzQkFBTDtBQUFULEtBQTFCLENBQWI7QUFDSDs7QUFFT0EsRUFBQUEsc0JBQVIsR0FBaUM7QUFDN0IsVUFBTUMscUJBQXFCLEdBQUdDLElBQUksQ0FBQ0MsR0FBTCxDQUFTRCxJQUFJLENBQUNFLEtBQUwsQ0FBVyxLQUFLOUcsTUFBTCxDQUFZaUIsWUFBdkIsQ0FBVCxFQUErQyxLQUFLakIsTUFBTCxDQUFZK0csZUFBM0QsQ0FBOUI7QUFDQSxVQUFNQyxTQUFTLEdBQUdKLElBQUksQ0FBQ0ssR0FBTCxDQUFTLEtBQUtqRixRQUFkLEVBQXdCMkUscUJBQXhCLENBQWxCO0FBQ0EsV0FBTyxLQUFLM0csTUFBTCxDQUFZK0Isd0JBQVosQ0FBcUNpRixTQUFyQyxFQUFnRCxLQUFLL0UsT0FBckQsQ0FBUDtBQUNIOztBQUVELE1BQVlBLE9BQVosR0FBc0I7QUFDbEIsUUFBSUEsT0FBTyxHQUFHN0Qsb0JBQWQsQ0FEa0IsQ0FFbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxVQUFNOEksYUFBYSxHQUFHLEtBQUtsRixRQUFMLEdBQWdCLEtBQUtoQixlQUEzQyxDQVBrQixDQVNsQjtBQUNBOztBQUNBLFVBQU1tRyxhQUFhLEdBQUcsS0FBS25GLFFBQUwsR0FBZ0IsS0FBS2hDLE1BQUwsQ0FBWW1DLG1CQUFsRDs7QUFFQSxRQUFJK0UsYUFBYSxJQUFJQyxhQUFyQixFQUFvQztBQUNoQ2xGLE1BQUFBLE9BQU8sSUFBSTlELG9CQUFYO0FBQ0g7O0FBQ0QsV0FBTzhELE9BQVA7QUFDSDs7QUFFRCxNQUFZcEQsVUFBWjtBQUFBO0FBQTJFO0FBQ3ZFLFFBQUksS0FBS1UsS0FBTCxDQUFXTCxrQkFBZixFQUFtQztBQUMvQixhQUFPLEtBQUtLLEtBQUwsQ0FBV0wsa0JBQWxCO0FBQ0g7O0FBQ0QsUUFBSSxLQUFLUCxLQUFMLENBQVdFLFVBQWYsRUFBMkI7QUFDdkIsYUFBTyxLQUFLRixLQUFMLENBQVdFLFVBQWxCO0FBQ0g7O0FBQ0QsV0FBTyxJQUFQO0FBQ0g7O0FBRUQsTUFBWW1ELFFBQVo7QUFBQTtBQUErQjtBQUMzQixXQUFPekQsV0FBVyxDQUFDNkksWUFBWixDQUF5QixLQUFLN0gsS0FBTCxDQUFXRSxLQUFwQyxFQUEyQyxLQUFLWixVQUFoRCxDQUFQO0FBQ0g7O0FBRUQsU0FBZXVJLFlBQWYsQ0FBNEIzSDtBQUE1QjtBQUFBLElBQTJDWjtBQUEzQztBQUFBLElBQThEO0FBQzFELFdBQU8sQ0FBQ1ksS0FBSyxJQUFJLEVBQVYsRUFBY1csTUFBZCxHQUF1QixDQUFDdkIsVUFBVSxJQUFJLEVBQWYsRUFBbUJ1QixNQUFqRDtBQUNIOztBQUVELE1BQVlZLGVBQVo7QUFBQTtBQUFzQztBQUNsQyxVQUFNcUcsUUFBUSxHQUFHVCxJQUFJLENBQUNVLElBQUwsQ0FBVSxLQUFLdEgsTUFBTCxDQUFZaUIsWUFBdEIsQ0FBakI7QUFDQSxXQUFPMkYsSUFBSSxDQUFDSyxHQUFMLENBQVNJLFFBQVQsRUFBbUIsS0FBS3JGLFFBQXhCLENBQVA7QUFDSDs7QUFFTXVGLEVBQUFBLGtCQUFQLENBQTBCQztBQUExQjtBQUFBLElBQXVEQztBQUF2RDtBQUFBLElBQW9GO0FBQ2hGLFVBQU1DLGNBQWMsR0FBR0QsU0FBUyxDQUFDdkksa0JBQVYsSUFBZ0NzSSxTQUFTLENBQUMzSSxVQUFqRSxDQURnRixDQUVoRjtBQUNBOztBQUNBLFFBQUlOLFdBQVcsQ0FBQzZJLFlBQVosQ0FBeUJLLFNBQVMsQ0FBQ2hJLEtBQW5DLEVBQTBDaUksY0FBMUMsTUFBOEQsS0FBSzFGLFFBQXZFLEVBQWlGO0FBQzdFLFdBQUszQixRQUFMLENBQWM7QUFBQ3VCLFFBQUFBLE1BQU0sRUFBRSxLQUFLOEUsc0JBQUw7QUFBVCxPQUFkO0FBQ0g7QUFDSjs7QUFFTWlCLEVBQUFBLHFCQUFQLENBQTZCQztBQUE3QjtBQUFBLElBQTBEQztBQUExRDtBQUFBO0FBQUE7QUFBZ0c7QUFDNUYsUUFBSSw0QkFBYyxLQUFLbEosS0FBbkIsRUFBMEJpSixTQUExQixDQUFKLEVBQTBDO0FBQ3RDO0FBQ0EsYUFBTyxJQUFQO0FBQ0gsS0FKMkYsQ0FNNUY7OztBQUNBLFVBQU1FLGdCQUFnQixHQUFHLDhCQUFnQixLQUFLdkksS0FBckIsRUFBNEIsQ0FBQyxPQUFELENBQTVCLENBQXpCO0FBQ0EsVUFBTXdJLGdCQUFnQixHQUFHLDhCQUFnQkYsU0FBaEIsRUFBMkIsQ0FBQyxPQUFELENBQTNCLENBQXpCOztBQUNBLFFBQUksNEJBQWNDLGdCQUFkLEVBQWdDQyxnQkFBaEMsQ0FBSixFQUF1RDtBQUNuRCxhQUFPLElBQVA7QUFDSCxLQVgyRixDQWE1RjtBQUNBOzs7QUFDQSxVQUFNTCxjQUFjLEdBQUcsS0FBSy9JLEtBQUwsQ0FBV0UsVUFBWCxJQUF5QixFQUFoRDtBQUNBLFVBQU1tSixjQUFjLEdBQUlILFNBQVMsQ0FBQzNJLGtCQUFWLElBQWdDMEksU0FBUyxDQUFDL0ksVUFBM0MsSUFBMEQsRUFBakY7O0FBQ0EsUUFBSTZJLGNBQWMsQ0FBQ3RILE1BQWYsR0FBd0IsQ0FBeEIsSUFBNkI0SCxjQUFjLENBQUM1SCxNQUFmLEdBQXdCLENBQXpELEVBQTREO0FBQ3hELGFBQU8sSUFBUDtBQUNILEtBbkIyRixDQXFCNUY7QUFDQTs7O0FBQ0EsUUFBSTdCLFdBQVcsQ0FBQzZJLFlBQVosQ0FBeUJTLFNBQVMsQ0FBQ3BJLEtBQW5DLEVBQTBDdUksY0FBMUMsTUFBOEQsS0FBS2hHLFFBQXZFLEVBQWlGO0FBQzdFLGFBQU8sSUFBUDtBQUNILEtBekIyRixDQTJCNUY7QUFDQTtBQUNBOzs7QUFDQSxRQUFJLENBQUM2RixTQUFTLENBQUM5SCxVQUFmLEVBQTJCO0FBQ3ZCLGFBQU8sS0FBUDtBQUNILEtBaEMyRixDQWtDNUY7OztBQUNBLFFBQUksS0FBS1IsS0FBTCxDQUFXRSxLQUFYLENBQWlCVyxNQUFqQixLQUE0QnlILFNBQVMsQ0FBQ3BJLEtBQVYsQ0FBZ0JXLE1BQWhELEVBQXdEO0FBQ3BELGFBQU8sSUFBUDtBQUNILEtBckMyRixDQXVDNUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFVBQU02SCxlQUFlLEdBQUcsS0FBSzFJLEtBQUwsQ0FBV0UsS0FBWCxDQUFpQnlJLEtBQWpCLENBQXVCLENBQXZCLEVBQTBCLEtBQUtsSCxlQUEvQixDQUF4QjtBQUNBLFVBQU1tSCxlQUFlLEdBQUdOLFNBQVMsQ0FBQ3BJLEtBQVYsQ0FBZ0J5SSxLQUFoQixDQUFzQixDQUF0QixFQUF5QixLQUFLbEgsZUFBOUIsQ0FBeEI7O0FBQ0EsUUFBSSxpQ0FBb0JpSCxlQUFwQixFQUFxQ0UsZUFBckMsQ0FBSixFQUEyRDtBQUN2RCxhQUFPLElBQVA7QUFDSCxLQWxEMkYsQ0FvRDVGOzs7QUFDQSxXQUFPLEtBQVA7QUFDSDs7QUFFTUMsRUFBQUEsaUJBQVAsR0FBMkI7QUFDdkIsU0FBS0MsYUFBTCxHQUFxQkMsb0JBQWtCQyxRQUFsQixDQUEyQixLQUFLQyxRQUFoQyxDQUFyQjs7QUFDQXpKLDJCQUFjQyxRQUFkLENBQXVCeUosRUFBdkIsQ0FBMEJDLGlDQUExQixFQUE4QyxLQUFLQyxjQUFuRDtBQUNIOztBQUVNQyxFQUFBQSxvQkFBUCxHQUE4QjtBQUMxQk4sd0JBQWtCTyxVQUFsQixDQUE2QixLQUFLUixhQUFsQzs7QUFDQXRKLDJCQUFjQyxRQUFkLENBQXVCOEosR0FBdkIsQ0FBMkJKLGlDQUEzQixFQUErQyxLQUFLQyxjQUFwRDtBQUNIOztBQTRETzlHLEVBQUFBLGlCQUFSLENBQTBCSDtBQUExQjtBQUFBLElBQTZDO0FBQ3pDLFVBQU1xSCxhQUFhLEdBQUduQyxJQUFJLENBQUNVLElBQUwsQ0FBVSxLQUFLdEgsTUFBTCxDQUFZZ0osYUFBWixDQUEwQnRILFNBQVMsR0FBRyxLQUFLTyxPQUEzQyxDQUFWLENBQXRCO0FBQ0EsU0FBS2pDLE1BQUwsQ0FBWWlCLFlBQVosR0FBMkIyRixJQUFJLENBQUNLLEdBQUwsQ0FBUyxLQUFLakYsUUFBZCxFQUF3QitHLGFBQXhCLENBQTNCO0FBQ0g7O0FBME1PRSxFQUFBQSxrQkFBUjtBQUFBO0FBQW1EO0FBQy9DLFFBQUksQ0FBQyxLQUFLMUosS0FBTCxDQUFXUSxVQUFoQixFQUE0QjtBQUN4QjtBQUNBLGFBQU8sRUFBUDtBQUNIOztBQUVELFVBQU1tSjtBQUEyQjtBQUFBLE1BQUcsRUFBcEM7O0FBRUEsUUFBSSxLQUFLM0osS0FBTCxDQUFXRSxLQUFmLEVBQXNCO0FBQ2xCLFlBQU0wSixZQUFZLEdBQUcsS0FBSzVKLEtBQUwsQ0FBV0UsS0FBWCxDQUFpQnlJLEtBQWpCLENBQXVCLENBQXZCLEVBQTBCLEtBQUtsSCxlQUEvQixDQUFyQjs7QUFDQSxXQUFLLE1BQU0rQyxJQUFYLElBQW1Cb0YsWUFBbkIsRUFBaUM7QUFDN0JELFFBQUFBLEtBQUssQ0FBQ0UsSUFBTixlQUFXLG9CQUFDLGlCQUFEO0FBQ1AsVUFBQSxJQUFJLEVBQUVyRixJQURDO0FBRVAsVUFBQSxHQUFHLEVBQUcsUUFBT0EsSUFBSSxDQUFDbEQsTUFBTyxFQUZsQjtBQUdQLFVBQUEsY0FBYyxFQUFFLEtBQUtsQyxLQUFMLENBQVcwSyxjQUhwQjtBQUlQLFVBQUEsa0JBQWtCLEVBQUUsS0FBS3JKLE1BQUwsQ0FBWThELFlBSnpCO0FBS1AsVUFBQSxXQUFXLEVBQUUsS0FBS25GLEtBQUwsQ0FBVzJLLFdBTGpCO0FBTVAsVUFBQSxHQUFHLEVBQUUsS0FBSzNLLEtBQUwsQ0FBV2lCO0FBTlQsVUFBWDtBQVFIO0FBQ0o7O0FBRUQsUUFBSSxLQUFLZixVQUFULEVBQXFCO0FBQ2pCO0FBQ0NxSyxNQUFBQSxLQUFELENBQWlCRSxJQUFqQixDQUFzQixHQUFHLEtBQUt2SyxVQUE5QjtBQUNILEtBekI4QyxDQTJCL0M7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFFBQUlxSyxLQUFLLENBQUM5SSxNQUFOLEdBQWUsS0FBS1ksZUFBeEIsRUFBeUM7QUFDckMsYUFBT2tJLEtBQUssQ0FBQ2hCLEtBQU4sQ0FBWSxDQUFaLEVBQWUsS0FBS2xILGVBQXBCLENBQVA7QUFDSDs7QUFFRCxXQUFPa0ksS0FBUDtBQUNIOztBQUVPSyxFQUFBQSxVQUFSO0FBQUE7QUFBeUM7QUFDckMsUUFBSUMsV0FBVyxHQUFHLElBQWxCOztBQUNBLFFBQUksS0FBS2pLLEtBQUwsQ0FBV3VELG1CQUFmLEVBQW9DO0FBQ2hDLFlBQU0yRyxjQUFjLEdBQUcxSyx1QkFBY0MsUUFBZCxDQUF1QjBLLGFBQXZCLENBQXFDLEtBQUsvSyxLQUFMLENBQVdpQixLQUFoRCxNQUEyRCtKLHNCQUFjQyxVQUFoRzs7QUFDQSxZQUFNdkcsYUFBYSxHQUFHdEUsdUJBQWNDLFFBQWQsQ0FBdUJzRSxZQUF2QixDQUFvQyxLQUFLM0UsS0FBTCxDQUFXaUIsS0FBL0MsTUFBMEQyRCxzQkFBY0MsVUFBOUYsQ0FGZ0MsQ0FJaEM7OztBQUNBLFVBQUlxRyxhQUFhLEdBQUcsSUFBcEI7O0FBQ0EsVUFBSSxLQUFLbEwsS0FBTCxDQUFXaUIsS0FBWCxLQUFxQm9FLHNCQUFhQyxNQUF0QyxFQUE4QztBQUMxQzRGLFFBQUFBLGFBQWEsZ0JBQ1Qsb0JBQUMsS0FBRCxDQUFPLFFBQVAscUJBQ0ksK0JBREosZUFFSSw4Q0FDSTtBQUFLLFVBQUEsU0FBUyxFQUFDO0FBQWYsV0FBbUQseUJBQUcsWUFBSCxDQUFuRCxDQURKLGVBRUksb0JBQUMsbUNBQUQ7QUFDSSxVQUFBLE9BQU8sRUFBRSxLQUFLQyxXQURsQjtBQUVJLFVBQUEsUUFBUSxFQUFFLEtBQUtDLG9CQUZuQjtBQUdJLFVBQUEsT0FBTyxFQUFFMUc7QUFIYixXQUtLLHlCQUFHLHVDQUFILENBTEwsQ0FGSixlQVNJLG9CQUFDLG1DQUFEO0FBQ0ksVUFBQSxPQUFPLEVBQUUsS0FBS3lHLFdBRGxCO0FBRUksVUFBQSxRQUFRLEVBQUUsS0FBS0UsdUJBRm5CO0FBR0ksVUFBQSxPQUFPLEVBQUUsS0FBS2hLLE1BQUwsQ0FBWThEO0FBSHpCLFdBS0sseUJBQUcsMkJBQUgsQ0FMTCxDQVRKLENBRkosQ0FESjtBQXNCSDs7QUFFRDBGLE1BQUFBLFdBQVcsZ0JBQ1Asb0JBQUMsd0JBQUQ7QUFDSSxRQUFBLFdBQVcsRUFBRVMseUJBQVlDLElBRDdCO0FBRUksUUFBQSxJQUFJLEVBQUUsS0FBSzNLLEtBQUwsQ0FBV3VELG1CQUFYLENBQStCRSxJQUZ6QztBQUdJLFFBQUEsR0FBRyxFQUFFLEtBQUt6RCxLQUFMLENBQVd1RCxtQkFBWCxDQUErQkksR0FBL0IsR0FBcUMsS0FBSzNELEtBQUwsQ0FBV3VELG1CQUFYLENBQStCbEIsTUFIN0U7QUFJSSxRQUFBLFVBQVUsRUFBRSxLQUFLa0k7QUFKckIsc0JBTUk7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLDhDQUNJO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUFtRCx5QkFBRyxTQUFILENBQW5ELENBREosZUFFSSxvQkFBQyxnQ0FBRDtBQUNJLFFBQUEsT0FBTyxFQUFFLEtBQUtBLFdBRGxCO0FBRUksUUFBQSxRQUFRLEVBQUUsTUFBTSxLQUFLSyxnQkFBTCxDQUFzQlIsc0JBQWNTLE1BQXBDLENBRnBCO0FBR0ksUUFBQSxPQUFPLEVBQUUsQ0FBQ1gsY0FIZDtBQUlJLFFBQUEsSUFBSSxFQUFHLE1BQUssS0FBSzlLLEtBQUwsQ0FBV2lCLEtBQU07QUFKakMsU0FNSyx5QkFBRyxVQUFILENBTkwsQ0FGSixlQVVJLG9CQUFDLGdDQUFEO0FBQ0ksUUFBQSxPQUFPLEVBQUUsS0FBS2tLLFdBRGxCO0FBRUksUUFBQSxRQUFRLEVBQUUsTUFBTSxLQUFLSyxnQkFBTCxDQUFzQlIsc0JBQWNDLFVBQXBDLENBRnBCO0FBR0ksUUFBQSxPQUFPLEVBQUVILGNBSGI7QUFJSSxRQUFBLElBQUksRUFBRyxNQUFLLEtBQUs5SyxLQUFMLENBQVdpQixLQUFNO0FBSmpDLFNBTUsseUJBQUcsS0FBSCxDQU5MLENBVkosQ0FESixFQW9CS2lLLGFBcEJMLENBTkosQ0FESjtBQStCSCxLQTlERCxNQThETyxJQUFJLEtBQUt0SyxLQUFMLENBQVc2RCwwQkFBZixFQUEyQztBQUM5Q29HLE1BQUFBLFdBQVcsZ0JBQ1Asb0JBQUMsNEJBQUQ7QUFDSSxRQUFBLFdBQVcsRUFBRVMseUJBQVlDLElBRDdCO0FBRUksUUFBQSxJQUFJLEVBQUUsS0FBSzNLLEtBQUwsQ0FBVzZELDBCQUFYLENBQXNDSixJQUF0QyxHQUE2QyxDQUZ2RCxDQUUwRDtBQUYxRDtBQUdJLFFBQUEsR0FBRyxFQUFFLEtBQUt6RCxLQUFMLENBQVc2RCwwQkFBWCxDQUFzQ0YsR0FBdEMsR0FBNEMsS0FBSzNELEtBQUwsQ0FBVzZELDBCQUFYLENBQXNDeEIsTUFIM0Y7QUFJSSxRQUFBLFVBQVUsRUFBRSxLQUFLeUksa0JBSnJCO0FBS0ksUUFBQSxPQUFPO0FBTFgsU0FPSyxLQUFLMUwsS0FBTCxDQUFXMkwsa0JBQVgsQ0FBOEIsS0FBS0Qsa0JBQW5DLENBUEwsQ0FESjtBQVdIOztBQUVELHdCQUNJLG9CQUFDLEtBQUQsQ0FBTyxRQUFQLHFCQUNJLG9CQUFDLHFDQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUMsMkJBRGQ7QUFFSSxNQUFBLE9BQU8sRUFBRSxLQUFLRSxlQUZsQjtBQUdJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGNBQUgsQ0FIWDtBQUlJLE1BQUEsVUFBVSxFQUFFLENBQUMsQ0FBQyxLQUFLaEwsS0FBTCxDQUFXdUQ7QUFKN0IsTUFESixFQU9LMEcsV0FQTCxDQURKO0FBV0g7O0FBRU9nQixFQUFBQSxZQUFSO0FBQUE7QUFBMkM7QUFDdkMsd0JBQ0ksb0JBQUMscUNBQUQ7QUFBdUIsTUFBQSxRQUFRLEVBQUUsS0FBSzVGO0FBQXRDLE9BQ0ssQ0FBQztBQUFDNkYsTUFBQUEsT0FBRDtBQUFVQyxNQUFBQSxRQUFWO0FBQW9CQyxNQUFBQTtBQUFwQixLQUFELEtBQThCO0FBQzNCLFlBQU1DLFFBQVEsR0FBR0YsUUFBUSxHQUFHLENBQUgsR0FBTyxDQUFDLENBQWpDO0FBRUEsVUFBSUcsU0FBUyxHQUFHLHlCQUFHLDRCQUFILENBQWhCOztBQUNBLFVBQUksS0FBS2xNLEtBQUwsQ0FBV2lCLEtBQVgsS0FBcUJvRSxzQkFBYUMsTUFBdEMsRUFBOEM7QUFDMUM0RyxRQUFBQSxTQUFTLEdBQUcseUJBQUcsdUJBQUgsQ0FBWjtBQUNIOztBQUVELFlBQU1DLEtBQUssZ0JBQ1Asb0JBQUMsMEJBQUQ7QUFDSSxRQUFBLFVBQVUsRUFBRSxJQURoQjtBQUVJLFFBQUEsWUFBWSxFQUFFLEtBQUt6RyxpQkFGdkI7QUFHSSxRQUFBLE9BQU8sRUFBRSxLQUFLMEcsWUFIbEI7QUFJSSxRQUFBLFFBQVEsRUFBRUgsUUFKZDtBQUtJLHNCQUFZQztBQUxoQixRQURKO0FBVUEsVUFBSUcsYUFBYSxHQUFHLElBQXBCOztBQUNBLFVBQUksQ0FBQyxDQUFDLEtBQUtyTSxLQUFMLENBQVcyQyxTQUFqQixFQUE0QjtBQUN4QjBKLFFBQUFBLGFBQWEsZ0JBQ1Qsb0JBQUMsZ0NBQUQ7QUFDSSxVQUFBLFFBQVEsRUFBRUosUUFEZDtBQUVJLFVBQUEsT0FBTyxFQUFFLEtBQUt0SixTQUZsQjtBQUdJLFVBQUEsU0FBUyxFQUFDLDBCQUhkO0FBSUksVUFBQSxnQkFBZ0IsRUFBQywrQkFKckI7QUFLSSx3QkFBWSxLQUFLM0MsS0FBTCxDQUFXc00sWUFBWCxJQUEyQix5QkFBRyxVQUFILENBTDNDO0FBTUksVUFBQSxLQUFLLEVBQUUsS0FBS3RNLEtBQUwsQ0FBV3NNO0FBTnRCLFVBREo7QUFVSCxPQVhELE1BV08sSUFBSSxLQUFLdE0sS0FBTCxDQUFXMkwsa0JBQWYsRUFBbUM7QUFDdENVLFFBQUFBLGFBQWEsZ0JBQ1Qsb0JBQUMscUNBQUQ7QUFDSSxVQUFBLFFBQVEsRUFBRUosUUFEZDtBQUVJLFVBQUEsT0FBTyxFQUFFLEtBQUtNLG9CQUZsQjtBQUdJLFVBQUEsU0FBUyxFQUFDLDBCQUhkO0FBSUksVUFBQSxnQkFBZ0IsRUFBQywrQkFKckI7QUFLSSx3QkFBWSxLQUFLdk0sS0FBTCxDQUFXc00sWUFBWCxJQUEyQix5QkFBRyxVQUFILENBTDNDO0FBTUksVUFBQSxLQUFLLEVBQUUsS0FBS3RNLEtBQUwsQ0FBV3NNLFlBTnRCO0FBT0ksVUFBQSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUsxTCxLQUFMLENBQVc2RDtBQVA3QixVQURKO0FBV0g7O0FBRUQsWUFBTStILGVBQWUsR0FBRyx5QkFBVztBQUMvQixzQ0FBOEIsSUFEQztBQUUvQixnREFBd0MsQ0FBQyxLQUFLNUwsS0FBTCxDQUFXUTtBQUZyQixPQUFYLENBQXhCO0FBS0EsWUFBTXFMLE9BQU8sR0FBRyx5QkFBVztBQUN2QiwwQ0FBa0MsSUFEWDtBQUV2QixrREFBMEMsQ0FBQyxDQUFDSjtBQUZyQixPQUFYLENBQWhCO0FBS0EsWUFBTUssY0FBYyxnQkFDaEI7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQ0tQLEtBREwsQ0FESjtBQU1BLFVBQUlRO0FBQTBFO0FBQUEsUUFBR0MseUJBQWpGOztBQUNBLFVBQUksS0FBSzVNLEtBQUwsQ0FBVzJLLFdBQWYsRUFBNEI7QUFDeEJnQyxRQUFBQSxNQUFNLEdBQUdFLGdDQUFUO0FBQ0gsT0EvRDBCLENBaUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSwwQkFDSTtBQUNJLFFBQUEsU0FBUyxFQUFFSixPQURmO0FBRUksUUFBQSxTQUFTLEVBQUUsS0FBS0ssZUFGcEI7QUFHSSxRQUFBLE9BQU8sRUFBRWhCLE9BSGI7QUFJSSxzQkFBWSxLQUFLOUwsS0FBTCxDQUFXK007QUFKM0Isc0JBTUk7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLG9CQUFDLE1BQUQ7QUFDSSxRQUFBLE9BQU8sRUFBRWpCLE9BRGI7QUFFSSxRQUFBLFFBQVEsRUFBRUUsR0FGZDtBQUdJLFFBQUEsUUFBUSxFQUFFQyxRQUhkO0FBSUksUUFBQSxTQUFTLEVBQUMsMkJBSmQ7QUFLSSxRQUFBLElBQUksRUFBQyxVQUxUO0FBTUkseUJBQWUsS0FBS3JMLEtBQUwsQ0FBV1EsVUFOOUI7QUFPSSxzQkFBWSxDQVBoQjtBQVFJLFFBQUEsT0FBTyxFQUFFLEtBQUs0TCxhQVJsQjtBQVNJLFFBQUEsYUFBYSxFQUFFLEtBQUtDLGFBVHhCO0FBVUksUUFBQSxLQUFLLEVBQUUsS0FBS2pOLEtBQUwsQ0FBVzJLLFdBQVgsR0FBeUIsS0FBSzNLLEtBQUwsQ0FBVytNLEtBQXBDLEdBQTRDRztBQVZ2RCxzQkFZSTtBQUFNLFFBQUEsU0FBUyxFQUFFVjtBQUFqQixRQVpKLGVBYUksa0NBQU8sS0FBS3hNLEtBQUwsQ0FBVytNLEtBQWxCLENBYkosQ0FESixFQWdCSyxLQUFLbkMsVUFBTCxFQWhCTCxFQWlCSyxLQUFLNUssS0FBTCxDQUFXMkssV0FBWCxHQUF5QixJQUF6QixHQUFnQytCLGNBakJyQyxFQWtCSyxLQUFLMU0sS0FBTCxDQUFXMkssV0FBWCxHQUF5QixJQUF6QixHQUFnQzBCLGFBbEJyQyxDQU5KLEVBMEJLLEtBQUtyTSxLQUFMLENBQVcySyxXQUFYLEdBQXlCK0IsY0FBekIsR0FBMEMsSUExQi9DLEVBMkJLLEtBQUsxTSxLQUFMLENBQVcySyxXQUFYLEdBQXlCMEIsYUFBekIsR0FBeUMsSUEzQjlDLENBREo7QUErQkgsS0F0R0wsQ0FESjtBQTBHSDs7QUFFT2MsRUFBQUEsZUFBUixDQUF3QjFLO0FBQXhCO0FBQUEsSUFBMEQ7QUFDdEQ7QUFDQTtBQUNDQSxJQUFBQSxDQUFDLENBQUN5QixNQUFILENBQTZCb0MsU0FBN0IsR0FBeUMsQ0FBekM7QUFDSDs7QUFFTThHLEVBQUFBLE1BQVA7QUFBQTtBQUFvQztBQUNoQyxVQUFNOUssWUFBWSxHQUFHLEtBQUtnSSxrQkFBTCxFQUFyQjtBQUNBLFVBQU1tQyxPQUFPLEdBQUcseUJBQVc7QUFDdkIsd0JBQWtCLElBREs7QUFFdkIsb0NBQThCLENBQUMsQ0FBQyxLQUFLN0wsS0FBTCxDQUFXdUQsbUJBRnBCO0FBR3ZCLGtDQUE0QixLQUFLbkUsS0FBTCxDQUFXMkssV0FIaEI7QUFJdkIsK0JBQ0ksQ0FBQyxLQUFLL0osS0FBTCxDQUFXRSxLQUFYLENBQWlCVyxNQUFsQixJQUE0QixDQUFDLEtBQUt6QixLQUFMLENBQVdFLFVBQVgsRUFBdUJ1QixNQUFwRCxJQUE4RCxLQUFLekIsS0FBTCxDQUFXcU4sYUFBWCxLQUE2QjtBQUx4RSxLQUFYLENBQWhCO0FBU0EsUUFBSUMsT0FBTyxHQUFHLElBQWQ7O0FBQ0EsUUFBSWhMLFlBQVksQ0FBQ2IsTUFBYixHQUFzQixDQUExQixFQUE2QjtBQUN6QixZQUFNSixNQUFNLEdBQUcsS0FBS0EsTUFBcEIsQ0FEeUIsQ0FDRzs7QUFFNUIsWUFBTWtNLFFBQVEsR0FBR3RGLElBQUksQ0FBQ0ssR0FBTCxDQUFTakgsTUFBTSxDQUFDK0csZUFBaEIsRUFBaUMsS0FBSy9FLFFBQXRDLENBQWpCO0FBQ0EsWUFBTW1LLG1CQUFtQixHQUFHRCxRQUFRLEdBQUcsS0FBS2xLLFFBQTVDO0FBQ0EsWUFBTW9LLGdCQUFnQixHQUFHaE8sb0JBQW9CLElBQUkrTixtQkFBbUIsR0FBR2hPLG9CQUFILEdBQTBCLENBQWpELENBQTdDO0FBQ0EsWUFBTWtPLFVBQVUsR0FBR3JNLE1BQU0sQ0FBQytCLHdCQUFQLENBQWdDbUssUUFBaEMsRUFBMENFLGdCQUExQyxDQUFuQjtBQUNBLFlBQU1FLFVBQVUsR0FBR3RNLE1BQU0sQ0FBQytCLHdCQUFQLENBQWdDLEtBQUtDLFFBQXJDLEVBQStDLEtBQUtDLE9BQXBELENBQW5CO0FBQ0EsWUFBTXNLLGtCQUFrQixHQUFHLHlCQUFXO0FBQ2xDLHNDQUE4QjtBQURJLE9BQVgsQ0FBM0IsQ0FSeUIsQ0FZekI7QUFDQTtBQUNBOztBQUNBLFVBQUlDLFdBQVcsR0FBRyxJQUFsQjs7QUFFQSxVQUFJRixVQUFVLEdBQUcsS0FBSy9NLEtBQUwsQ0FBV3FDLE1BQTVCLEVBQW9DO0FBQ2hDO0FBQ0EsY0FBTTZLLGVBQWUsR0FBRyxLQUFLbE4sS0FBTCxDQUFXcUMsTUFBWCxHQUFvQnhELG9CQUFwQixHQUEyQ0Qsb0JBQW5FO0FBQ0EsY0FBTXVPLGdCQUFnQixHQUFHOUYsSUFBSSxDQUFDRSxLQUFMLENBQVcyRixlQUFlLEdBQUcsS0FBS3pNLE1BQUwsQ0FBWTJNLFVBQXpDLENBQXpCO0FBQ0EsY0FBTUMsVUFBVSxHQUFHLEtBQUs1SyxRQUFMLEdBQWdCMEssZ0JBQW5DO0FBQ0EsY0FBTWhCLEtBQUssR0FBRyx5QkFBRyxxQkFBSCxFQUEwQjtBQUFDbkgsVUFBQUEsS0FBSyxFQUFFcUk7QUFBUixTQUExQixDQUFkO0FBQ0EsWUFBSUMsWUFBWSxnQkFDWjtBQUFNLFVBQUEsU0FBUyxFQUFDO0FBQWhCLFdBQ0tuQixLQURMLENBREo7QUFLQSxZQUFJLEtBQUsvTSxLQUFMLENBQVcySyxXQUFmLEVBQTRCdUQsWUFBWSxHQUFHLElBQWY7QUFDNUJMLFFBQUFBLFdBQVcsZ0JBQ1Asb0JBQUMsc0NBQUQ7QUFDSSxVQUFBLElBQUksRUFBQyxVQURUO0FBRUksVUFBQSxPQUFPLEVBQUUsS0FBS00sY0FGbEI7QUFHSSxVQUFBLFNBQVMsRUFBRVAsa0JBSGY7QUFJSSx3QkFBWWI7QUFKaEIsd0JBTUk7QUFBTSxVQUFBLFNBQVMsRUFBQztBQUFoQixVQU5KLEVBU0ttQixZQVRMLENBREo7QUFhSCxPQXpCRCxNQXlCTyxJQUFJLEtBQUs3SyxRQUFMLEdBQWdCLEtBQUtoQyxNQUFMLENBQVltQyxtQkFBaEMsRUFBcUQ7QUFDeEQ7QUFDQSxjQUFNdUosS0FBSyxHQUFHLHlCQUFHLFdBQUgsQ0FBZDtBQUNBLFlBQUlxQixZQUFZLGdCQUNaO0FBQU0sVUFBQSxTQUFTLEVBQUM7QUFBaEIsV0FDS3JCLEtBREwsQ0FESjtBQUtBLFlBQUksS0FBSy9NLEtBQUwsQ0FBVzJLLFdBQWYsRUFBNEJ5RCxZQUFZLEdBQUcsSUFBZjtBQUM1QlAsUUFBQUEsV0FBVyxnQkFDUCxvQkFBQyxzQ0FBRDtBQUNJLFVBQUEsSUFBSSxFQUFDLFVBRFQ7QUFFSSxVQUFBLE9BQU8sRUFBRSxLQUFLUSxlQUZsQjtBQUdJLFVBQUEsU0FBUyxFQUFFVCxrQkFIZjtBQUlJLHdCQUFZYjtBQUpoQix3QkFNSTtBQUFNLFVBQUEsU0FBUyxFQUFDO0FBQWhCLFVBTkosRUFTS3FCLFlBVEwsQ0FESjtBQWFILE9BaEV3QixDQWtFekI7OztBQUNBLFlBQU1FO0FBQWU7QUFBQSxRQUFHO0FBQ3BCQyxRQUFBQSxNQUFNLEVBQUUsSUFEWTtBQUNOO0FBQ2RDLFFBQUFBLFVBQVUsRUFBRSxLQUZRO0FBR3BCQyxRQUFBQSxXQUFXLEVBQUUsS0FITztBQUlwQnBLLFFBQUFBLElBQUksRUFBRSxLQUpjO0FBS3BCcUssUUFBQUEsS0FBSyxFQUFFLEtBTGE7QUFNcEJuSyxRQUFBQSxHQUFHLEVBQUUsS0FOZTtBQU9wQm9LLFFBQUFBLE9BQU8sRUFBRSxLQVBXO0FBUXBCQyxRQUFBQSxRQUFRLEVBQUU7QUFSVSxPQUF4Qjs7QUFVQSxVQUFJdk4sTUFBTSxDQUFDaUIsWUFBUCxJQUF1QixLQUFLZSxRQUE1QixJQUF3QyxLQUFLQSxRQUFMLElBQWlCaEMsTUFBTSxDQUFDK0csZUFBcEUsRUFBcUY7QUFDakY7QUFDQWtHLFFBQUFBLE9BQU8sQ0FBQ0MsTUFBUixHQUFpQixLQUFqQjtBQUNILE9BaEZ3QixDQWtGekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQSxZQUFNTSxvQkFBb0IsR0FBRyx5QkFBVztBQUNwQyx5Q0FBaUMsSUFERztBQUVwQyxxREFBNkMsQ0FBQyxDQUFDaEI7QUFGWCxPQUFYLENBQTdCO0FBS0FQLE1BQUFBLE9BQU8sZ0JBQ0gsb0JBQUMsS0FBRCxDQUFPLFFBQVAscUJBQ0ksb0JBQUMsc0JBQUQ7QUFDSSxRQUFBLElBQUksRUFBRTtBQUFDckssVUFBQUEsTUFBTSxFQUFFLEtBQUtyQyxLQUFMLENBQVdxQztBQUFwQixTQURWO0FBRUksUUFBQSxTQUFTLEVBQUV5SyxVQUZmO0FBR0ksUUFBQSxTQUFTLEVBQUVDLFVBSGY7QUFJSSxRQUFBLGFBQWEsRUFBRSxLQUFLbUIsYUFKeEI7QUFLSSxRQUFBLFlBQVksRUFBRSxLQUFLQyxZQUx2QjtBQU1JLFFBQUEsUUFBUSxFQUFFLEtBQUsvSCxRQU5uQjtBQU9JLFFBQUEsa0JBQWtCLEVBQUU2SCxvQkFQeEI7QUFRSSxRQUFBLGFBQWEsRUFBRTtBQUFDTixVQUFBQSxNQUFNLEVBQUU7QUFBVCxTQVJuQjtBQVNJLFFBQUEsU0FBUyxFQUFDLDBCQVRkO0FBVUksUUFBQSxNQUFNLEVBQUVEO0FBVlosc0JBWUk7QUFBSyxRQUFBLFNBQVMsRUFBQyxzQkFBZjtBQUFzQyxRQUFBLFFBQVEsRUFBRSxLQUFLbkI7QUFBckQsU0FDSzdLLFlBREwsQ0FaSixFQWVLdUwsV0FmTCxDQURKLENBREo7QUFxQkgsS0F0SEQsTUFzSE8sSUFBSSxLQUFLN04sS0FBTCxDQUFXZ1AsWUFBWCxJQUEyQixLQUFLcE8sS0FBTCxDQUFXUSxVQUExQyxFQUFzRDtBQUN6RGtNLE1BQUFBLE9BQU8sZ0JBQUc7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFFBQVY7QUFDSDs7QUFFRCx3QkFDSTtBQUNJLE1BQUEsR0FBRyxFQUFFLEtBQUs1SixVQURkO0FBRUksTUFBQSxTQUFTLEVBQUUrSSxPQUZmO0FBR0ksTUFBQSxJQUFJLEVBQUMsT0FIVDtBQUlJLG9CQUFZLEtBQUt6TSxLQUFMLENBQVcrTSxLQUozQjtBQUtJLE1BQUEsU0FBUyxFQUFFLEtBQUtrQztBQUxwQixPQU9LLEtBQUtwRCxZQUFMLEVBUEwsRUFRS3lCLE9BUkwsQ0FESjtBQVlIOztBQXB5Qm9FLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgY3JlYXRlUmVmLCBSZWFjdENvbXBvbmVudEVsZW1lbnQgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgUm92aW5nQWNjZXNzaWJsZUJ1dHRvbiwgUm92aW5nVGFiSW5kZXhXcmFwcGVyIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvUm92aW5nVGFiSW5kZXhcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBSb29tVGlsZSBmcm9tIFwiLi9Sb29tVGlsZVwiO1xuaW1wb3J0IHsgTGlzdExheW91dCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L0xpc3RMYXlvdXRcIjtcbmltcG9ydCB7XG4gICAgQ2hldnJvbkZhY2UsXG4gICAgQ29udGV4dE1lbnUsXG4gICAgQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uLFxuICAgIFN0eWxlZE1lbnVJdGVtQ2hlY2tib3gsXG4gICAgU3R5bGVkTWVudUl0ZW1SYWRpbyxcbn0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCBSb29tTGlzdFN0b3JlLCB7IExJU1RTX1VQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0U3RvcmVcIjtcbmltcG9ydCB7IExpc3RBbGdvcml0aG0sIFNvcnRBbGdvcml0aG0gfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9hbGdvcml0aG1zL21vZGVsc1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRhZ0lELCBUYWdJRCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L21vZGVsc1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IE5vdGlmaWNhdGlvbkJhZGdlIGZyb20gXCIuL05vdGlmaWNhdGlvbkJhZGdlXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgeyBLZXkgfSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgRW5hYmxlLCBSZXNpemFibGUgfSBmcm9tIFwicmUtcmVzaXphYmxlXCI7XG5pbXBvcnQgeyBEaXJlY3Rpb24gfSBmcm9tIFwicmUtcmVzaXphYmxlL2xpYi9yZXNpemVyXCI7XG5pbXBvcnQgeyBwb2x5ZmlsbFRvdWNoRXZlbnQgfSBmcm9tIFwiLi4vLi4vLi4vQHR5cGVzL3BvbHlmaWxsXCI7XG5pbXBvcnQgeyBSZXNpemVOb3RpZmllciB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9SZXNpemVOb3RpZmllclwiO1xuaW1wb3J0IHsgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmVcIjtcbmltcG9ydCBSb29tTGlzdExheW91dFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0TGF5b3V0U3RvcmVcIjtcbmltcG9ydCB7IGFycmF5RmFzdENsb25lLCBhcnJheUhhc09yZGVyQ2hhbmdlIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2FycmF5c1wiO1xuaW1wb3J0IHsgb2JqZWN0RXhjbHVkaW5nLCBvYmplY3RIYXNEaWZmIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL29iamVjdHNcIjtcbmltcG9ydCBFeHRyYVRpbGUgZnJvbSBcIi4vRXh0cmFUaWxlXCI7XG5pbXBvcnQgeyBMaXN0Tm90aWZpY2F0aW9uU3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvTGlzdE5vdGlmaWNhdGlvblN0YXRlXCI7XG5pbXBvcnQgSWNvbml6ZWRDb250ZXh0TWVudSBmcm9tIFwiLi4vY29udGV4dF9tZW51cy9JY29uaXplZENvbnRleHRNZW51XCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIsIFJvb21MaXN0QWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlclwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmNvbnN0IFNIT1dfTl9CVVRUT05fSEVJR0hUID0gMjg7IC8vIEFzIGRlZmluZWQgYnkgQ1NTXG5jb25zdCBSRVNJWkVfSEFORExFX0hFSUdIVCA9IDQ7IC8vIEFzIGRlZmluZWQgYnkgQ1NTXG5leHBvcnQgY29uc3QgSEVBREVSX0hFSUdIVCA9IDMyOyAvLyBBcyBkZWZpbmVkIGJ5IENTU1xuXG5jb25zdCBNQVhfUEFERElOR19IRUlHSFQgPSBTSE9XX05fQlVUVE9OX0hFSUdIVCArIFJFU0laRV9IQU5ETEVfSEVJR0hUO1xuXG4vLyBIQUNLOiBXZSByZWFsbHkgc2hvdWxkbid0IGhhdmUgdG8gZG8gdGhpcy5cbnBvbHlmaWxsVG91Y2hFdmVudCgpO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBmb3JSb29tczogYm9vbGVhbjtcbiAgICBzdGFydEFzSGlkZGVuOiBib29sZWFuO1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgb25BZGRSb29tPzogKCkgPT4gdm9pZDtcbiAgICBhZGRSb29tQ29udGV4dE1lbnU/OiAob25GaW5pc2hlZDogKCkgPT4gdm9pZCkgPT4gUmVhY3QuUmVhY3ROb2RlO1xuICAgIGFkZFJvb21MYWJlbDogc3RyaW5nO1xuICAgIGlzTWluaW1pemVkOiBib29sZWFuO1xuICAgIHRhZ0lkOiBUYWdJRDtcbiAgICBvblJlc2l6ZTogKCkgPT4gdm9pZDtcbiAgICBzaG93U2tlbGV0b24/OiBib29sZWFuO1xuICAgIGFsd2F5c1Zpc2libGU/OiBib29sZWFuO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbiAgICBleHRyYVRpbGVzPzogUmVhY3RDb21wb25lbnRFbGVtZW50PHR5cGVvZiBFeHRyYVRpbGU+W107XG5cbiAgICAvLyBUT0RPOiBBY2NvdW50IGZvciBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDE3OVxufVxuXG4vLyBUT0RPOiBVc2UgcmUtcmVzaXplcidzIE51bWJlclNpemUgd2hlbiBpdCBpcyBleHBvc2VkIGFzIHRoZSB0eXBlXG5pbnRlcmZhY2UgUmVzaXplRGVsdGEge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbnR5cGUgUGFydGlhbERPTVJlY3QgPSBQaWNrPERPTVJlY3QsIFwibGVmdFwiIHwgXCJ0b3BcIiB8IFwiaGVpZ2h0XCI+O1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBjb250ZXh0TWVudVBvc2l0aW9uOiBQYXJ0aWFsRE9NUmVjdDtcbiAgICBhZGRSb29tQ29udGV4dE1lbnVQb3NpdGlvbjogUGFydGlhbERPTVJlY3Q7XG4gICAgaXNSZXNpemluZzogYm9vbGVhbjtcbiAgICBpc0V4cGFuZGVkOiBib29sZWFuOyAvLyB1c2VkIGZvciB0aGUgZm9yIGV4cGFuZCBvZiB0aGUgc3VibGlzdCB3aGVuIHRoZSByb29tIGxpc3QgaXMgYmVpbmcgZmlsdGVyZWRcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICByb29tczogUm9vbVtdO1xuICAgIGZpbHRlcmVkRXh0cmFUaWxlcz86IFJlYWN0Q29tcG9uZW50RWxlbWVudDx0eXBlb2YgRXh0cmFUaWxlPltdO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5Sb29tU3VibGlzdFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbVN1Ymxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGhlYWRlckJ1dHRvbiA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIHN1Ymxpc3RSZWYgPSBjcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBsYXlvdXQ6IExpc3RMYXlvdXQ7XG4gICAgcHJpdmF0ZSBoZWlnaHRBdFN0YXJ0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBpc0JlaW5nRmlsdGVyZWQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBub3RpZmljYXRpb25TdGF0ZTogTGlzdE5vdGlmaWNhdGlvblN0YXRlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5sYXlvdXQgPSBSb29tTGlzdExheW91dFN0b3JlLmluc3RhbmNlLmdldExheW91dEZvcih0aGlzLnByb3BzLnRhZ0lkKTtcbiAgICAgICAgdGhpcy5oZWlnaHRBdFN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy5pc0JlaW5nRmlsdGVyZWQgPSAhIVJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0Rmlyc3ROYW1lRmlsdGVyQ29uZGl0aW9uKCk7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9uU3RhdGUgPSBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZS5pbnN0YW5jZS5nZXRMaXN0U3RhdGUodGhpcy5wcm9wcy50YWdJZCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsLFxuICAgICAgICAgICAgYWRkUm9vbUNvbnRleHRNZW51UG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICBpc1Jlc2l6aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGlzRXhwYW5kZWQ6IHRoaXMuaXNCZWluZ0ZpbHRlcmVkID8gdGhpcy5pc0JlaW5nRmlsdGVyZWQgOiAhdGhpcy5sYXlvdXQuaXNDb2xsYXBzZWQsXG4gICAgICAgICAgICBoZWlnaHQ6IDAsIC8vIHRvIGJlIGZpeGVkIGluIGEgbW9tZW50LCB3ZSBuZWVkIGByb29tc2AgdG8gY2FsY3VsYXRlIHRoaXMuXG4gICAgICAgICAgICByb29tczogYXJyYXlGYXN0Q2xvbmUoUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vcmRlcmVkTGlzdHNbdGhpcy5wcm9wcy50YWdJZF0gfHwgW10pLFxuICAgICAgICB9O1xuICAgICAgICAvLyBXaHkgT2JqZWN0LmFzc2lnbigpIGFuZCBub3QgdGhpcy5zdGF0ZS5oZWlnaHQ/IEJlY2F1c2UgVHlwZVNjcmlwdCBzYXlzIG5vLlxuICAgICAgICB0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCB7aGVpZ2h0OiB0aGlzLmNhbGN1bGF0ZUluaXRpYWxIZWlnaHQoKX0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FsY3VsYXRlSW5pdGlhbEhlaWdodCgpIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdGVkVmlzaWJsZVRpbGVzID0gTWF0aC5tYXgoTWF0aC5mbG9vcih0aGlzLmxheW91dC52aXNpYmxlVGlsZXMpLCB0aGlzLmxheW91dC5taW5WaXNpYmxlVGlsZXMpO1xuICAgICAgICBjb25zdCB0aWxlQ291bnQgPSBNYXRoLm1pbih0aGlzLm51bVRpbGVzLCByZXF1ZXN0ZWRWaXNpYmxlVGlsZXMpO1xuICAgICAgICByZXR1cm4gdGhpcy5sYXlvdXQudGlsZXNUb1BpeGVsc1dpdGhQYWRkaW5nKHRpbGVDb3VudCwgdGhpcy5wYWRkaW5nKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBwYWRkaW5nKCkge1xuICAgICAgICBsZXQgcGFkZGluZyA9IFJFU0laRV9IQU5ETEVfSEVJR0hUO1xuICAgICAgICAvLyB0aGlzIGlzIHVzZWQgZm9yIGNhbGN1bGF0aW5nIHRoZSBtYXggaGVpZ2h0IG9mIHRoZSB3aG9sZSBjb250YWluZXIsXG4gICAgICAgIC8vIGFuZCB0YWtlcyBpbnRvIGFjY291bnQgd2hldGhlciB0aGVyZSBzaG91bGQgYmUgcm9vbSByZXNlcnZlZCBmb3IgdGhlIHNob3cgbW9yZS9sZXNzIGJ1dHRvblxuICAgICAgICAvLyB3aGVuIGZ1bGx5IGV4cGFuZGVkLiBXZSBjYW4ndCByZWx5IHB1cmVseSBvbiB0aGUgbGF5b3V0J3MgZGVmYXVsdFZpc2libGUgdGlsZSBjb3VudFxuICAgICAgICAvLyBiZWNhdXNlIHRoZXJlIGFyZSBjb25kaXRpb25zIGluIHdoaWNoIHdlIG5lZWQgdG8ga25vdyB0aGF0IHRoZSAnc2hvdyBtb3JlJyBidXR0b25cbiAgICAgICAgLy8gaXMgcHJlc2VudCB3aGlsZSB3ZWxsIHVuZGVyIHRoZSBkZWZhdWx0IHRpbGUgbGltaXQuXG4gICAgICAgIGNvbnN0IG5lZWRzU2hvd01vcmUgPSB0aGlzLm51bVRpbGVzID4gdGhpcy5udW1WaXNpYmxlVGlsZXM7XG5cbiAgICAgICAgLy8gLi4uYnV0IGFsc28gY2hlY2sgdGhpcyBvciB3ZSdsbCBtaXNzIGlmIHRoZSBzZWN0aW9uIGlzIGV4cGFuZGVkIGFuZCB3ZSBuZWVkIGFcbiAgICAgICAgLy8gJ3Nob3cgbGVzcydcbiAgICAgICAgY29uc3QgbmVlZHNTaG93TGVzcyA9IHRoaXMubnVtVGlsZXMgPiB0aGlzLmxheW91dC5kZWZhdWx0VmlzaWJsZVRpbGVzO1xuXG4gICAgICAgIGlmIChuZWVkc1Nob3dNb3JlIHx8IG5lZWRzU2hvd0xlc3MpIHtcbiAgICAgICAgICAgIHBhZGRpbmcgKz0gU0hPV19OX0JVVFRPTl9IRUlHSFQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhZGRpbmc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgZXh0cmFUaWxlcygpOiBSZWFjdENvbXBvbmVudEVsZW1lbnQ8dHlwZW9mIEV4dHJhVGlsZT5bXSB8IG51bGwge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5maWx0ZXJlZEV4dHJhVGlsZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmZpbHRlcmVkRXh0cmFUaWxlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5leHRyYVRpbGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5leHRyYVRpbGVzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IG51bVRpbGVzKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBSb29tU3VibGlzdC5jYWxjTnVtVGlsZXModGhpcy5zdGF0ZS5yb29tcywgdGhpcy5leHRyYVRpbGVzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBjYWxjTnVtVGlsZXMocm9vbXM6IFJvb21bXSwgZXh0cmFUaWxlczogYW55W10pIHtcbiAgICAgICAgcmV0dXJuIChyb29tcyB8fCBbXSkubGVuZ3RoICsgKGV4dHJhVGlsZXMgfHwgW10pLmxlbmd0aDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBudW1WaXNpYmxlVGlsZXMoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgblZpc2libGUgPSBNYXRoLmNlaWwodGhpcy5sYXlvdXQudmlzaWJsZVRpbGVzKTtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKG5WaXNpYmxlLCB0aGlzLm51bVRpbGVzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUmVhZG9ubHk8SVByb3BzPiwgcHJldlN0YXRlOiBSZWFkb25seTxJU3RhdGU+KSB7XG4gICAgICAgIGNvbnN0IHByZXZFeHRyYVRpbGVzID0gcHJldlN0YXRlLmZpbHRlcmVkRXh0cmFUaWxlcyB8fCBwcmV2UHJvcHMuZXh0cmFUaWxlcztcbiAgICAgICAgLy8gYXMgdGhlIHJvb21zIGNhbiBjb21lIGluIG9uZSBieSBvbmUgd2UgbmVlZCB0byByZWV2YWx1YXRlXG4gICAgICAgIC8vIHRoZSBhbW91bnQgb2YgYXZhaWxhYmxlIHJvb21zIHRvIGNhcCB0aGUgYW1vdW50IG9mIHJlcXVlc3RlZCB2aXNpYmxlIHJvb21zIGJ5IHRoZSBsYXlvdXRcbiAgICAgICAgaWYgKFJvb21TdWJsaXN0LmNhbGNOdW1UaWxlcyhwcmV2U3RhdGUucm9vbXMsIHByZXZFeHRyYVRpbGVzKSAhPT0gdGhpcy5udW1UaWxlcykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGVpZ2h0OiB0aGlzLmNhbGN1bGF0ZUluaXRpYWxIZWlnaHQoKX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IFJlYWRvbmx5PElQcm9wcz4sIG5leHRTdGF0ZTogUmVhZG9ubHk8SVN0YXRlPik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAob2JqZWN0SGFzRGlmZih0aGlzLnByb3BzLCBuZXh0UHJvcHMpKSB7XG4gICAgICAgICAgICAvLyBTb21ldGhpbmcgd2UgZG9uJ3QgY2FyZSB0byBvcHRpbWl6ZSBoYXMgdXBkYXRlZCwgc28gdXBkYXRlLlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEbyB0aGUgc2FtZSBjaGVjayB1c2VkIG9uIHByb3BzIGZvciBzdGF0ZSwgd2l0aG91dCB0aGUgcm9vbXMgd2UncmUgZ29pbmcgdG8gbm8tb3BcbiAgICAgICAgY29uc3QgcHJldlN0YXRlTm9Sb29tcyA9IG9iamVjdEV4Y2x1ZGluZyh0aGlzLnN0YXRlLCBbJ3Jvb21zJ10pO1xuICAgICAgICBjb25zdCBuZXh0U3RhdGVOb1Jvb21zID0gb2JqZWN0RXhjbHVkaW5nKG5leHRTdGF0ZSwgWydyb29tcyddKTtcbiAgICAgICAgaWYgKG9iamVjdEhhc0RpZmYocHJldlN0YXRlTm9Sb29tcywgbmV4dFN0YXRlTm9Sb29tcykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2UncmUgc3VwcG9zZWQgdG8gaGFuZGxlIGV4dHJhIHRpbGVzLCB0YWtlIHRoZSBwZXJmb3JtYW5jZSBoaXQgYW5kIHJlLXJlbmRlciBhbGwgdGhlXG4gICAgICAgIC8vIHRpbWUgc28gd2UgZG9uJ3QgaGF2ZSB0byBjb25zaWRlciB0aGVtIGFzIHBhcnQgb2YgdGhlIHZpc2libGUgcm9vbSBvcHRpbWl6YXRpb24uXG4gICAgICAgIGNvbnN0IHByZXZFeHRyYVRpbGVzID0gdGhpcy5wcm9wcy5leHRyYVRpbGVzIHx8IFtdO1xuICAgICAgICBjb25zdCBuZXh0RXh0cmFUaWxlcyA9IChuZXh0U3RhdGUuZmlsdGVyZWRFeHRyYVRpbGVzIHx8IG5leHRQcm9wcy5leHRyYVRpbGVzKSB8fCBbXTtcbiAgICAgICAgaWYgKHByZXZFeHRyYVRpbGVzLmxlbmd0aCA+IDAgfHwgbmV4dEV4dHJhVGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSdyZSBhYm91dCB0byB1cGRhdGUgdGhlIGhlaWdodCBvZiB0aGUgbGlzdCwgd2UgZG9uJ3QgcmVhbGx5IGNhcmUgYWJvdXQgd2hpY2ggcm9vbXNcbiAgICAgICAgLy8gYXJlIHZpc2libGUgb3Igbm90IGZvciBuby1vcCBwdXJwb3Nlcywgc28gZW5zdXJlIHRoYXQgdGhlIGhlaWdodCBjYWxjdWxhdGlvbiBydW5zIHRocm91Z2guXG4gICAgICAgIGlmIChSb29tU3VibGlzdC5jYWxjTnVtVGlsZXMobmV4dFN0YXRlLnJvb21zLCBuZXh0RXh0cmFUaWxlcykgIT09IHRoaXMubnVtVGlsZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmVmb3JlIHdlIGdvIGFuYWx5emluZyB0aGUgcm9vbXMsIHdlIGNhbiBzZWUgaWYgd2UncmUgY29sbGFwc2VkLiBJZiB3ZSdyZSBjb2xsYXBzZWQsIHdlIGRvbid0IG5lZWRcbiAgICAgICAgLy8gdG8gcmVuZGVyIGFueXRoaW5nLiBXZSBkbyB0aGlzIGFmdGVyIHRoZSBoZWlnaHQgY2hlY2sgdGhvdWdoIHRvIGVuc3VyZSB0aGF0IHRoZSBoZWlnaHQgZ2V0cyBhcHByb3ByaWF0ZWx5XG4gICAgICAgIC8vIGNhbGN1bGF0ZWQgZm9yIHdoZW4vaWYgd2UgYmVjb21lIHVuY29sbGFwc2VkLlxuICAgICAgICBpZiAoIW5leHRTdGF0ZS5pc0V4cGFuZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBRdWlja2x5IGRvdWJsZSBjaGVjayB3ZSdyZSBub3QgYWJvdXQgdG8gYnJlYWsgc29tZXRoaW5nIGR1ZSB0byB0aGUgbnVtYmVyIG9mIHJvb21zIGNoYW5naW5nLlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tcy5sZW5ndGggIT09IG5leHRTdGF0ZS5yb29tcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgZGV0ZXJtaW5lIGlmIHRoZSByb29tIHVwZGF0ZSAoYXMgcHJlc3VtYWJseSB0aGF0J3MgYWxsIHRoYXQncyBsZWZ0KSBpcyB3aXRoaW5cbiAgICAgICAgLy8gb3VyIHZpc2libGUgcmFuZ2UuIElmIGl0IGlzLCB0aGVuIGRvIGEgcmVuZGVyLiBJZiB0aGUgdXBkYXRlIGlzIG91dHNpZGUgb3VyIHZpc2libGUgcmFuZ2VcbiAgICAgICAgLy8gdGhlbiB3ZSBjYW4gc2tpcCB0aGUgdXBkYXRlLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSBhbHNvIG9wdGltaXplIGZvciBvcmRlciBjaGFuZ2luZyBoZXJlOiBpZiB0aGUgdXBkYXRlIGRpZCBoYXBwZW4gaW4gb3VyIHZpc2libGUgcmFuZ2VcbiAgICAgICAgLy8gYnV0IGRvZXNuJ3QgcmVzdWx0IGluIHRoZSBsaXN0IHJlLXNvcnRpbmcgaXRzZWxmIHRoZW4gdGhlcmUncyBubyByZWFzb24gZm9yIHVzIHRvIHVwZGF0ZVxuICAgICAgICAvLyBvbiBvdXIgb3duLlxuICAgICAgICBjb25zdCBwcmV2U2xpY2VkUm9vbXMgPSB0aGlzLnN0YXRlLnJvb21zLnNsaWNlKDAsIHRoaXMubnVtVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgY29uc3QgbmV4dFNsaWNlZFJvb21zID0gbmV4dFN0YXRlLnJvb21zLnNsaWNlKDAsIHRoaXMubnVtVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgaWYgKGFycmF5SGFzT3JkZXJDaGFuZ2UocHJldlNsaWNlZFJvb21zLCBuZXh0U2xpY2VkUm9vbXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmFsbHksIG5vdGhpbmcgaGFwcGVuZWQgc28gbm8tb3AgdGhlIHVwZGF0ZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkZWZhdWx0RGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vbihMSVNUU19VUERBVEVfRVZFTlQsIHRoaXMub25MaXN0c1VwZGF0ZWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9mZihMSVNUU19VUERBVEVfRVZFTlQsIHRoaXMub25MaXN0c1VwZGF0ZWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25MaXN0c1VwZGF0ZWQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXRlVXBkYXRlczogSVN0YXRlICYgYW55ID0ge307IC8vICZhbnkgaXMgdG8gYXZvaWQgYSBjYXN0IG9uIHRoZSBpbml0aWFsaXplclxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmV4dHJhVGlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVDb25kaXRpb24gPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldEZpcnN0TmFtZUZpbHRlckNvbmRpdGlvbigpO1xuICAgICAgICAgICAgaWYgKG5hbWVDb25kaXRpb24pIHtcbiAgICAgICAgICAgICAgICBzdGF0ZVVwZGF0ZXMuZmlsdGVyZWRFeHRyYVRpbGVzID0gdGhpcy5wcm9wcy5leHRyYVRpbGVzXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIodCA9PiBuYW1lQ29uZGl0aW9uLm1hdGNoZXModC5wcm9wcy5kaXNwbGF5TmFtZSB8fCBcIlwiKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZmlsdGVyZWRFeHRyYVRpbGVzKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVVcGRhdGVzLmZpbHRlcmVkRXh0cmFUaWxlcyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjdXJyZW50Um9vbXMgPSB0aGlzLnN0YXRlLnJvb21zO1xuICAgICAgICBjb25zdCBuZXdSb29tcyA9IGFycmF5RmFzdENsb25lKFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzW3RoaXMucHJvcHMudGFnSWRdIHx8IFtdKTtcbiAgICAgICAgaWYgKGFycmF5SGFzT3JkZXJDaGFuZ2UoY3VycmVudFJvb21zLCBuZXdSb29tcykpIHtcbiAgICAgICAgICAgIHN0YXRlVXBkYXRlcy5yb29tcyA9IG5ld1Jvb21zO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNTdGlsbEJlaW5nRmlsdGVyZWQgPSAhIVJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0Rmlyc3ROYW1lRmlsdGVyQ29uZGl0aW9uKCk7XG4gICAgICAgIGlmIChpc1N0aWxsQmVpbmdGaWx0ZXJlZCAhPT0gdGhpcy5pc0JlaW5nRmlsdGVyZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNCZWluZ0ZpbHRlcmVkID0gaXNTdGlsbEJlaW5nRmlsdGVyZWQ7XG4gICAgICAgICAgICBpZiAoaXNTdGlsbEJlaW5nRmlsdGVyZWQpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZVVwZGF0ZXMuaXNFeHBhbmRlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YXRlVXBkYXRlcy5pc0V4cGFuZGVkID0gIXRoaXMubGF5b3V0LmlzQ29sbGFwc2VkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHN0YXRlVXBkYXRlcykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZVVwZGF0ZXMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09IFwidmlld19yb29tXCIgJiYgcGF5bG9hZC5zaG93X3Jvb21fdGlsZSAmJiB0aGlzLnN0YXRlLnJvb21zKSB7XG4gICAgICAgICAgICAvLyBYWFg6IHdlIGhhdmUgdG8gZG8gdGhpcyBhIHRpY2sgbGF0ZXIgYmVjYXVzZSB3ZSBoYXZlIGluY29ycmVjdCBpbnRlcm1lZGlhdGUgcHJvcHMgZHVyaW5nIGEgcm9vbSBjaGFuZ2VcbiAgICAgICAgICAgIC8vIHdoZXJlIHdlIGxvc2UgdGhlIHJvb20gd2UgYXJlIGNoYW5naW5nIGZyb20gdGVtcG9yYXJpbHkgYW5kIHRoZW4gaXQgY29tZXMgYmFjayBpbiBhbiB1cGRhdGUgcmlnaHQgYWZ0ZXIuXG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JbmRleCA9IHRoaXMuc3RhdGUucm9vbXMuZmluZEluZGV4KChyKSA9PiByLnJvb21JZCA9PT0gcGF5bG9hZC5yb29tX2lkKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0V4cGFuZGVkICYmIHJvb21JbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlQ29sbGFwc2VkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGV4dGVuZCB0aGUgdmlzaWJsZSBzZWN0aW9uIHRvIGluY2x1ZGUgdGhlIHJvb20gaWYgaXQgaXMgZW50aXJlbHkgaW52aXNpYmxlXG4gICAgICAgICAgICAgICAgaWYgKHJvb21JbmRleCA+PSB0aGlzLm51bVZpc2libGVUaWxlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheW91dC52aXNpYmxlVGlsZXMgPSB0aGlzLmxheW91dC50aWxlc1dpdGhQYWRkaW5nKHJvb21JbmRleCArIDEsIE1BWF9QQURESU5HX0hFSUdIVCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gYmVjYXVzZSB0aGUgbGF5b3V0IGRvZXNuJ3QgdHJpZ2dlciBhIHJlLXJlbmRlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BZGRSb29tID0gKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25BZGRSb29tKSB0aGlzLnByb3BzLm9uQWRkUm9vbSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGFwcGx5SGVpZ2h0Q2hhbmdlKG5ld0hlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGhlaWdodEluVGlsZXMgPSBNYXRoLmNlaWwodGhpcy5sYXlvdXQucGl4ZWxzVG9UaWxlcyhuZXdIZWlnaHQgLSB0aGlzLnBhZGRpbmcpKTtcbiAgICAgICAgdGhpcy5sYXlvdXQudmlzaWJsZVRpbGVzID0gTWF0aC5taW4odGhpcy5udW1UaWxlcywgaGVpZ2h0SW5UaWxlcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlc2l6ZSA9IChcbiAgICAgICAgZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQsXG4gICAgICAgIHRyYXZlbERpcmVjdGlvbjogRGlyZWN0aW9uLFxuICAgICAgICByZWZUb0VsZW1lbnQ6IEhUTUxEaXZFbGVtZW50LFxuICAgICAgICBkZWx0YTogUmVzaXplRGVsdGEsXG4gICAgKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IHRoaXMuaGVpZ2h0QXRTdGFydCArIGRlbHRhLmhlaWdodDtcbiAgICAgICAgdGhpcy5hcHBseUhlaWdodENoYW5nZShuZXdIZWlnaHQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtoZWlnaHQ6IG5ld0hlaWdodH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVzaXplU3RhcnQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuaGVpZ2h0QXRTdGFydCA9IHRoaXMuc3RhdGUuaGVpZ2h0O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtpc1Jlc2l6aW5nOiB0cnVlfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXNpemVTdG9wID0gKFxuICAgICAgICBlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCxcbiAgICAgICAgdHJhdmVsRGlyZWN0aW9uOiBEaXJlY3Rpb24sXG4gICAgICAgIHJlZlRvRWxlbWVudDogSFRNTERpdkVsZW1lbnQsXG4gICAgICAgIGRlbHRhOiBSZXNpemVEZWx0YSxcbiAgICApID0+IHtcbiAgICAgICAgY29uc3QgbmV3SGVpZ2h0ID0gdGhpcy5oZWlnaHRBdFN0YXJ0ICsgZGVsdGEuaGVpZ2h0O1xuICAgICAgICB0aGlzLmFwcGx5SGVpZ2h0Q2hhbmdlKG5ld0hlaWdodCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzUmVzaXppbmc6IGZhbHNlLCBoZWlnaHQ6IG5ld0hlaWdodH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2hvd0FsbENsaWNrID0gKCkgPT4ge1xuICAgICAgICAvLyByZWFkIG51bWJlciBvZiB2aXNpYmxlIHRpbGVzIGJlZm9yZSB3ZSBtdXRhdGUgaXRcbiAgICAgICAgY29uc3QgbnVtVmlzaWJsZVRpbGVzID0gdGhpcy5udW1WaXNpYmxlVGlsZXM7XG4gICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IHRoaXMubGF5b3V0LnRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyh0aGlzLm51bVRpbGVzLCB0aGlzLnBhZGRpbmcpO1xuICAgICAgICB0aGlzLmFwcGx5SGVpZ2h0Q2hhbmdlKG5ld0hlaWdodCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2hlaWdodDogbmV3SGVpZ2h0fSwgKCkgPT4ge1xuICAgICAgICAgICAgLy8gZm9jdXMgdGhlIHRvcC1tb3N0IG5ldyByb29tXG4gICAgICAgICAgICB0aGlzLmZvY3VzUm9vbVRpbGUobnVtVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TaG93TGVzc0NsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSB0aGlzLmxheW91dC50aWxlc1RvUGl4ZWxzV2l0aFBhZGRpbmcodGhpcy5sYXlvdXQuZGVmYXVsdFZpc2libGVUaWxlcywgdGhpcy5wYWRkaW5nKTtcbiAgICAgICAgdGhpcy5hcHBseUhlaWdodENoYW5nZShuZXdIZWlnaHQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtoZWlnaHQ6IG5ld0hlaWdodH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGZvY3VzUm9vbVRpbGUgPSAoaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3VibGlzdFJlZi5jdXJyZW50KSByZXR1cm47XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5zdWJsaXN0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRGl2RWxlbWVudD4oXCIubXhfUm9vbVRpbGVcIik7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50cyAmJiBlbGVtZW50c1tpbmRleF07XG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk9wZW5NZW51Q2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2LnRhcmdldCBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db250ZXh0TWVudSA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjb250ZXh0TWVudVBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogZXYuY2xpZW50WCxcbiAgICAgICAgICAgICAgICB0b3A6IGV2LmNsaWVudFksXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BZGRSb29tQ29udGV4dE1lbnUgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2LnRhcmdldCBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YWRkUm9vbUNvbnRleHRNZW51UG9zaXRpb246IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xvc2VNZW51ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DbG9zZUFkZFJvb21NZW51ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHthZGRSb29tQ29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVW5yZWFkRmlyc3RDaGFuZ2VkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBpc1VucmVhZEZpcnN0ID0gUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5nZXRMaXN0T3JkZXIodGhpcy5wcm9wcy50YWdJZCkgPT09IExpc3RBbGdvcml0aG0uSW1wb3J0YW5jZTtcbiAgICAgICAgY29uc3QgbmV3QWxnb3JpdGhtID0gaXNVbnJlYWRGaXJzdCA/IExpc3RBbGdvcml0aG0uTmF0dXJhbCA6IExpc3RBbGdvcml0aG0uSW1wb3J0YW5jZTtcbiAgICAgICAgYXdhaXQgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5zZXRMaXN0T3JkZXIodGhpcy5wcm9wcy50YWdJZCwgbmV3QWxnb3JpdGhtKTtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyBiZWNhdXNlIGlmIHRoZSBzdWJsaXN0IGRvZXNuJ3QgaGF2ZSBhbnkgY2hhbmdlcyB0aGVuIHdlIHdpbGwgbWlzcyB0aGUgbGlzdCBvcmRlciBjaGFuZ2VcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblRhZ1NvcnRDaGFuZ2VkID0gYXN5bmMgKHNvcnQ6IFNvcnRBbGdvcml0aG0pID0+IHtcbiAgICAgICAgYXdhaXQgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5zZXRUYWdTb3J0aW5nKHRoaXMucHJvcHMudGFnSWQsIHNvcnQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTWVzc2FnZVByZXZpZXdDaGFuZ2VkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmxheW91dC5zaG93UHJldmlld3MgPSAhdGhpcy5sYXlvdXQuc2hvd1ByZXZpZXdzO1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7IC8vIGJlY2F1c2UgdGhlIGxheW91dCBkb2Vzbid0IHRyaWdnZXIgYSByZS1yZW5kZXJcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkJhZGdlQ2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgbGV0IHJvb207XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnRhZ0lkID09PSBEZWZhdWx0VGFnSUQuSW52aXRlKSB7XG4gICAgICAgICAgICAvLyBzd2l0Y2ggdG8gZmlyc3Qgcm9vbSBhcyB0aGF0J2xsIGJlIHRoZSB0b3Agb2YgdGhlIGxpc3QgZm9yIHRoZSB1c2VyXG4gICAgICAgICAgICByb29tID0gdGhpcy5zdGF0ZS5yb29tcyAmJiB0aGlzLnN0YXRlLnJvb21zWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZmluZCB0aGUgZmlyc3Qgcm9vbSB3aXRoIGEgY291bnQgb2YgdGhlIHNhbWUgY29sb3VyIGFzIHRoZSBiYWRnZSBjb3VudFxuICAgICAgICAgICAgcm9vbSA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UudW5maWx0ZXJlZExpc3RzW3RoaXMucHJvcHMudGFnSWRdLmZpbmQoKHI6IFJvb20pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZlN0YXRlID0gdGhpcy5ub3RpZmljYXRpb25TdGF0ZS5nZXRGb3JSb29tKHIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBub3RpZlN0YXRlLmNvdW50ID4gMCAmJiBub3RpZlN0YXRlLmNvbG9yID09PSB0aGlzLm5vdGlmaWNhdGlvblN0YXRlLmNvbG9yO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgIHNob3dfcm9vbV90aWxlOiB0cnVlLCAvLyB0byBtYWtlIHN1cmUgdGhlIHJvb20gZ2V0cyBzY3JvbGxlZCBpbnRvIHZpZXdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25IZWFkZXJDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9zc2libGVTdGlja3kgPSB0aGlzLmhlYWRlckJ1dHRvbi5jdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHN1Ymxpc3QgPSBwb3NzaWJsZVN0aWNreS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBzdWJsaXN0LnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgLy8gdGhlIHNjcm9sbFRvcCBpcyBjYXBwZWQgYXQgdGhlIGhlaWdodCBvZiB0aGUgaGVhZGVyIGluIExlZnRQYW5lbCwgdGhlIHRvcCBoZWFkZXIgaXMgYWx3YXlzIHN0aWNreVxuICAgICAgICBjb25zdCBpc0F0VG9wID0gbGlzdC5zY3JvbGxUb3AgPD0gSEVBREVSX0hFSUdIVDtcbiAgICAgICAgY29uc3QgaXNBdEJvdHRvbSA9IGxpc3Quc2Nyb2xsVG9wID49IGxpc3Quc2Nyb2xsSGVpZ2h0IC0gbGlzdC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IGlzU3RpY2t5VG9wID0gcG9zc2libGVTdGlja3kuY2xhc3NMaXN0LmNvbnRhaW5zKCdteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5VG9wJyk7XG4gICAgICAgIGNvbnN0IGlzU3RpY2t5Qm90dG9tID0gcG9zc2libGVTdGlja3kuY2xhc3NMaXN0LmNvbnRhaW5zKCdteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5Qm90dG9tJyk7XG5cbiAgICAgICAgaWYgKChpc1N0aWNreUJvdHRvbSAmJiAhaXNBdEJvdHRvbSkgfHwgKGlzU3RpY2t5VG9wICYmICFpc0F0VG9wKSkge1xuICAgICAgICAgICAgLy8gaXMgc3RpY2t5IC0ganVtcCB0byBsaXN0XG4gICAgICAgICAgICBzdWJsaXN0LnNjcm9sbEludG9WaWV3KHtiZWhhdmlvcjogJ3Ntb290aCd9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG9uIHNjcmVlbiAtIHRvZ2dsZSBjb2xsYXBzZVxuICAgICAgICAgICAgY29uc3QgaXNFeHBhbmRlZCA9IHRoaXMuc3RhdGUuaXNFeHBhbmRlZDtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlQ29sbGFwc2VkKCk7XG4gICAgICAgICAgICAvLyBpZiB0aGUgYm90dG9tIGxpc3QgaXMgY29sbGFwc2VkIHRoZW4gc2Nyb2xsIGl0IGluIHNvIGl0IGRvZXNuJ3QgZXhwYW5kIG9mZiBzY3JlZW5cbiAgICAgICAgICAgIGlmICghaXNFeHBhbmRlZCAmJiBpc1N0aWNreUJvdHRvbSkge1xuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Ymxpc3Quc2Nyb2xsSW50b1ZpZXcoe2JlaGF2aW9yOiAnc21vb3RoJ30pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgdG9nZ2xlQ29sbGFwc2VkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmxheW91dC5pc0NvbGxhcHNlZCA9IHRoaXMuc3RhdGUuaXNFeHBhbmRlZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNFeHBhbmRlZDogIXRoaXMubGF5b3V0LmlzQ29sbGFwc2VkfSk7XG4gICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB0aGlzLnByb3BzLm9uUmVzaXplKCkpOyAvLyBuZWVkcyB0byBoYXBwZW4gd2hlbiB0aGUgRE9NIGlzIHVwZGF0ZWRcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkhlYWRlcktleURvd24gPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0Um9vbUxpc3RBY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBSb29tTGlzdEFjdGlvbi5Db2xsYXBzZVNlY3Rpb246XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNFeHBhbmRlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb2xsYXBzZSB0aGUgcm9vbSBzdWJsaXN0IGlmIGl0IGlzbid0IGFscmVhZHlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDb2xsYXBzZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFJvb21MaXN0QWN0aW9uLkV4cGFuZFNlY3Rpb246IHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaXNFeHBhbmRlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBFeHBhbmQgdGhlIHJvb20gc3VibGlzdCBpZiBpdCBpc24ndCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlQ29sbGFwc2VkKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN1Ymxpc3RSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgZm9jdXMgdGhlIGZpcnN0IHJvb21cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuc3VibGlzdFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IoXCIubXhfUm9vbVRpbGVcIikgYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgc3dpdGNoIChldi5rZXkpIHtcbiAgICAgICAgICAgIC8vIE9uIEFSUk9XX0xFRlQgZ28gdG8gdGhlIHN1Ymxpc3QgaGVhZGVyXG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19MRUZUOlxuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVhZGVyQnV0dG9uLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIENvbnN1bWUgQVJST1dfUklHSFQgc28gaXQgZG9lc24ndCBjYXVzZSBmb2N1cyB0byBnZXQgc2VudCB0byBjb21wb3NlclxuICAgICAgICAgICAgY2FzZSBLZXkuQVJST1dfUklHSFQ6XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJWaXNpYmxlVGlsZXMoKTogUmVhY3QuUmVhY3RFbGVtZW50W10ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaXNFeHBhbmRlZCkge1xuICAgICAgICAgICAgLy8gZG9uJ3Qgd2FzdGUgdGltZSBvbiByZW5kZXJpbmdcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRpbGVzOiBSZWFjdC5SZWFjdEVsZW1lbnRbXSA9IFtdO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb21zKSB7XG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlUm9vbXMgPSB0aGlzLnN0YXRlLnJvb21zLnNsaWNlKDAsIHRoaXMubnVtVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiB2aXNpYmxlUm9vbXMpIHtcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKDxSb29tVGlsZVxuICAgICAgICAgICAgICAgICAgICByb29tPXtyb29tfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2Byb29tLSR7cm9vbS5yb29tSWR9YH1cbiAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlUHJldmlldz17dGhpcy5sYXlvdXQuc2hvd1ByZXZpZXdzfVxuICAgICAgICAgICAgICAgICAgICBpc01pbmltaXplZD17dGhpcy5wcm9wcy5pc01pbmltaXplZH1cbiAgICAgICAgICAgICAgICAgICAgdGFnPXt0aGlzLnByb3BzLnRhZ0lkfVxuICAgICAgICAgICAgICAgIC8+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmV4dHJhVGlsZXMpIHtcbiAgICAgICAgICAgIC8vIEhBQ0s6IFdlIGJyZWFrIHR5cGluZyBoZXJlLCBidXQgdGhpcyAnZXh0cmEgdGlsZXMnIHByb3BlcnR5IHNob3VsZG4ndCBleGlzdC5cbiAgICAgICAgICAgICh0aWxlcyBhcyBhbnlbXSkucHVzaCguLi50aGlzLmV4dHJhVGlsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2Ugb25seSBoYXZlIHRvIGRvIHRoaXMgYmVjYXVzZSBvZiB0aGUgZXh0cmEgdGlsZXMuIFdlIGRvIGl0IGNvbmRpdGlvbmFsbHlcbiAgICAgICAgLy8gdG8gYXZvaWQgc3BlbmRpbmcgY3ljbGVzIG9uIHNsaWNpbmcuIEl0J3MgZ2VuZXJhbGx5IGZpbmUgdG8gZG8gdGhpcyB0aG91Z2hcbiAgICAgICAgLy8gYXMgdXNlcnMgYXJlIHVubGlrZWx5IHRvIGhhdmUgbW9yZSB0aGFuIGEgaGFuZGZ1bCBvZiB0aWxlcyB3aGVuIHRoZSBleHRyYVxuICAgICAgICAvLyB0aWxlcyBhcmUgdXNlZC5cbiAgICAgICAgaWYgKHRpbGVzLmxlbmd0aCA+IHRoaXMubnVtVmlzaWJsZVRpbGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGlsZXMuc2xpY2UoMCwgdGhpcy5udW1WaXNpYmxlVGlsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyTWVudSgpOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBsZXQgY29udGV4dE1lbnUgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBpc0FscGhhYmV0aWNhbCA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0VGFnU29ydGluZyh0aGlzLnByb3BzLnRhZ0lkKSA9PT0gU29ydEFsZ29yaXRobS5BbHBoYWJldGljO1xuICAgICAgICAgICAgY29uc3QgaXNVbnJlYWRGaXJzdCA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0TGlzdE9yZGVyKHRoaXMucHJvcHMudGFnSWQpID09PSBMaXN0QWxnb3JpdGhtLkltcG9ydGFuY2U7XG5cbiAgICAgICAgICAgIC8vIEludml0ZXMgZG9uJ3QgZ2V0IHNvbWUgbm9uc2Vuc2Ugb3B0aW9ucywgc28gb25seSBhZGQgdGhlbSBpZiB3ZSBoYXZlIHRvLlxuICAgICAgICAgICAgbGV0IG90aGVyU2VjdGlvbnMgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMudGFnSWQgIT09IERlZmF1bHRUYWdJRC5JbnZpdGUpIHtcbiAgICAgICAgICAgICAgICBvdGhlclNlY3Rpb25zID0gKFxuICAgICAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aHIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1Jvb21TdWJsaXN0X2NvbnRleHRNZW51X3RpdGxlJz57X3QoXCJBcHBlYXJhbmNlXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTdHlsZWRNZW51SXRlbUNoZWNrYm94XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMub25DbG9zZU1lbnV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uVW5yZWFkRmlyc3RDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtpc1VucmVhZEZpcnN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiU2hvdyByb29tcyB3aXRoIHVucmVhZCBtZXNzYWdlcyBmaXJzdFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZE1lbnVJdGVtQ2hlY2tib3g+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFN0eWxlZE1lbnVJdGVtQ2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5vbkNsb3NlTWVudX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25NZXNzYWdlUHJldmlld0NoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMubGF5b3V0LnNob3dQcmV2aWV3c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlNob3cgcHJldmlld3Mgb2YgbWVzc2FnZXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9TdHlsZWRNZW51SXRlbUNoZWNrYm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29udGV4dE1lbnUgPSAoXG4gICAgICAgICAgICAgICAgPENvbnRleHRNZW51XG4gICAgICAgICAgICAgICAgICAgIGNoZXZyb25GYWNlPXtDaGV2cm9uRmFjZS5Ob25lfVxuICAgICAgICAgICAgICAgICAgICBsZWZ0PXt0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24ubGVmdH1cbiAgICAgICAgICAgICAgICAgICAgdG9wPXt0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24udG9wICsgdGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uLmhlaWdodH1cbiAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNsb3NlTWVudX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3RfY29udGV4dE1lbnVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1Jvb21TdWJsaXN0X2NvbnRleHRNZW51X3RpdGxlJz57X3QoXCJTb3J0IGJ5XCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTdHlsZWRNZW51SXRlbVJhZGlvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMub25DbG9zZU1lbnV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoKSA9PiB0aGlzLm9uVGFnU29ydENoYW5nZWQoU29ydEFsZ29yaXRobS5SZWNlbnQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXshaXNBbHBoYWJldGljYWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9e2BteF8ke3RoaXMucHJvcHMudGFnSWR9X3NvcnRCeWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJBY3Rpdml0eVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZE1lbnVJdGVtUmFkaW8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFN0eWxlZE1lbnVJdGVtUmFkaW9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5vbkNsb3NlTWVudX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eygpID0+IHRoaXMub25UYWdTb3J0Q2hhbmdlZChTb3J0QWxnb3JpdGhtLkFscGhhYmV0aWMpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtpc0FscGhhYmV0aWNhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17YG14XyR7dGhpcy5wcm9wcy50YWdJZH1fc29ydEJ5YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkEtWlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZE1lbnVJdGVtUmFkaW8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtvdGhlclNlY3Rpb25zfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L0NvbnRleHRNZW51PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmFkZFJvb21Db250ZXh0TWVudVBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjb250ZXh0TWVudSA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgICAgICBjaGV2cm9uRmFjZT17Q2hldnJvbkZhY2UuTm9uZX1cbiAgICAgICAgICAgICAgICAgICAgbGVmdD17dGhpcy5zdGF0ZS5hZGRSb29tQ29udGV4dE1lbnVQb3NpdGlvbi5sZWZ0IC0gN30gLy8gY2VudGVyIGFsaWduIHdpdGggdGhlIGhhbmRsZVxuICAgICAgICAgICAgICAgICAgICB0b3A9e3RoaXMuc3RhdGUuYWRkUm9vbUNvbnRleHRNZW51UG9zaXRpb24udG9wICsgdGhpcy5zdGF0ZS5hZGRSb29tQ29udGV4dE1lbnVQb3NpdGlvbi5oZWlnaHR9XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25DbG9zZUFkZFJvb21NZW51fVxuICAgICAgICAgICAgICAgICAgICBjb21wYWN0XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5hZGRSb29tQ29udGV4dE1lbnUodGhpcy5vbkNsb3NlQWRkUm9vbU1lbnUpfVxuICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxDb250ZXh0TWVudVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3RfbWVudUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25PcGVuTWVudUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJMaXN0IG9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9eyEhdGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9ufVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAge2NvbnRleHRNZW51fVxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckhlYWRlcigpOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFJvdmluZ1RhYkluZGV4V3JhcHBlciBpbnB1dFJlZj17dGhpcy5oZWFkZXJCdXR0b259PlxuICAgICAgICAgICAgICAgIHsoe29uRm9jdXMsIGlzQWN0aXZlLCByZWZ9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhYkluZGV4ID0gaXNBY3RpdmUgPyAwIDogLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGFyaWFMYWJlbCA9IF90KFwiSnVtcCB0byBmaXJzdCB1bnJlYWQgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnRhZ0lkID09PSBEZWZhdWx0VGFnSUQuSW52aXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhTGFiZWwgPSBfdChcIkp1bXAgdG8gZmlyc3QgaW52aXRlLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhZGdlID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPE5vdGlmaWNhdGlvbkJhZGdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VDb3VudD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb249e3RoaXMubm90aWZpY2F0aW9uU3RhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkJhZGdlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGFkZFJvb21CdXR0b24gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoISF0aGlzLnByb3BzLm9uQWRkUm9vbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkUm9vbUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQWRkUm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3RfYXV4QnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2FkZFJvb21Ub29sdGlwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5hZGRSb29tTGFiZWwgfHwgX3QoXCJBZGQgcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMucHJvcHMuYWRkUm9vbUxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuYWRkUm9vbUNvbnRleHRNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRSb29tQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb250ZXh0TWVudVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQWRkUm9vbUNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9hdXhCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwQ2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3RfYWRkUm9vbVRvb2x0aXBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLmFkZFJvb21MYWJlbCB8fCBfdChcIkFkZCByb29tXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy5hZGRSb29tTGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9eyEhdGhpcy5zdGF0ZS5hZGRSb29tQ29udGV4dE1lbnVQb3NpdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNlQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X2NvbGxhcHNlQnRuJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdteF9Sb29tU3VibGlzdF9jb2xsYXBzZUJ0bl9jb2xsYXBzZWQnOiAhdGhpcy5zdGF0ZS5pc0V4cGFuZGVkLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfd2l0aEF1eCc6ICEhYWRkUm9vbUJ1dHRvbixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFkZ2VDb250YWluZXIgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2JhZGdlQ29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2JhZGdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IEJ1dHRvbjogUmVhY3QuQ29tcG9uZW50VHlwZTxSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQWNjZXNzaWJsZUJ1dHRvbj4+ID0gQWNjZXNzaWJsZUJ1dHRvbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEJ1dHRvbiA9IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogdGhlIGFkZFJvb21CdXR0b24gY29uZGl0aW9uYWxseSBnZXRzIG1vdmVkIGFyb3VuZFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgRE9NIGRlcGVuZGluZyBvbiB3aGV0aGVyIG9yIG5vdCB0aGUgbGlzdCBpcyBtaW5pbWl6ZWQuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIG1pbmltaXplZCwgd2Ugd2FudCBpdCBiZWxvdyB0aGUgaGVhZGVyIHNvIGl0XG4gICAgICAgICAgICAgICAgICAgIC8vIGRvZXNuJ3QgYmVjb21lIHN0aWNreS5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHNhbWUgYXBwbGllcyB0byB0aGUgbm90aWZpY2F0aW9uIGJhZGdlLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25IZWFkZXJLZXlEb3dufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e29uRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X3N0aWNrYWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZvY3VzPXtvbkZvY3VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRSZWY9e3JlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2hlYWRlclRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cInRyZWVpdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e3RoaXMuc3RhdGUuaXNFeHBhbmRlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGV2ZWw9ezF9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uSGVhZGVyQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy5pc01pbmltaXplZCA/IHRoaXMucHJvcHMubGFiZWwgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17Y29sbGFwc2VDbGFzc2VzfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3RoaXMucHJvcHMubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyTWVudSgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5pc01pbmltaXplZCA/IG51bGwgOiBiYWRnZUNvbnRhaW5lcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMuaXNNaW5pbWl6ZWQgPyBudWxsIDogYWRkUm9vbUJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5pc01pbmltaXplZCA/IGJhZGdlQ29udGFpbmVyIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5pc01pbmltaXplZCA/IGFkZFJvb21CdXR0b24gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIDwvUm92aW5nVGFiSW5kZXhXcmFwcGVyPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TY3JvbGxQcmV2ZW50KGU6IFJlYWN0LlVJRXZlbnQ8SFRNTERpdkVsZW1lbnQ+KSB7XG4gICAgICAgIC8vIHRoZSBSb29tVGlsZSBjYWxscyBzY3JvbGxJbnRvVmlldyBhbmQgdGhlIGJyb3dzZXIgbWF5IHNjcm9sbCBhIGRpdiB3ZSBkbyBub3Qgd2lzaCB0byBiZSBzY3JvbGxhYmxlXG4gICAgICAgIC8vIHRoaXMgZml4ZXMgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ0MTNcbiAgICAgICAgKGUudGFyZ2V0IGFzIEhUTUxEaXZFbGVtZW50KS5zY3JvbGxUb3AgPSAwO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogUmVhY3QuUmVhY3RFbGVtZW50IHtcbiAgICAgICAgY29uc3QgdmlzaWJsZVRpbGVzID0gdGhpcy5yZW5kZXJWaXNpYmxlVGlsZXMoKTtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0JzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9Sb29tU3VibGlzdF9oYXNNZW51T3Blbic6ICEhdGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uLFxuICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X21pbmltaXplZCc6IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQsXG4gICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3RfaGlkZGVuJzogKFxuICAgICAgICAgICAgICAgICF0aGlzLnN0YXRlLnJvb21zLmxlbmd0aCAmJiAhdGhpcy5wcm9wcy5leHRyYVRpbGVzPy5sZW5ndGggJiYgdGhpcy5wcm9wcy5hbHdheXNWaXNpYmxlICE9PSB0cnVlXG4gICAgICAgICAgICApLFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgY29udGVudCA9IG51bGw7XG4gICAgICAgIGlmICh2aXNpYmxlVGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgbGF5b3V0ID0gdGhpcy5sYXlvdXQ7IC8vIHRvIHNob3J0ZW4gY2FsbHNcblxuICAgICAgICAgICAgY29uc3QgbWluVGlsZXMgPSBNYXRoLm1pbihsYXlvdXQubWluVmlzaWJsZVRpbGVzLCB0aGlzLm51bVRpbGVzKTtcbiAgICAgICAgICAgIGNvbnN0IHNob3dNb3JlQXRNaW5IZWlnaHQgPSBtaW5UaWxlcyA8IHRoaXMubnVtVGlsZXM7XG4gICAgICAgICAgICBjb25zdCBtaW5IZWlnaHRQYWRkaW5nID0gUkVTSVpFX0hBTkRMRV9IRUlHSFQgKyAoc2hvd01vcmVBdE1pbkhlaWdodCA/IFNIT1dfTl9CVVRUT05fSEVJR0hUIDogMCk7XG4gICAgICAgICAgICBjb25zdCBtaW5UaWxlc1B4ID0gbGF5b3V0LnRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyhtaW5UaWxlcywgbWluSGVpZ2h0UGFkZGluZyk7XG4gICAgICAgICAgICBjb25zdCBtYXhUaWxlc1B4ID0gbGF5b3V0LnRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyh0aGlzLm51bVRpbGVzLCB0aGlzLnBhZGRpbmcpO1xuICAgICAgICAgICAgY29uc3Qgc2hvd01vcmVCdG5DbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X3Nob3dOQnV0dG9uJzogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBoaWRpbmcgcm9vbXMsIHNob3cgYSAnc2hvdyBtb3JlJyBidXR0b24gdG8gdGhlIHVzZXIuIFRoaXMgYnV0dG9uXG4gICAgICAgICAgICAvLyBmbG9hdHMgYWJvdmUgdGhlIHJlc2l6ZSBoYW5kbGUsIGlmIHdlIGhhdmUgb25lIHByZXNlbnQuIElmIHRoZSB1c2VyIGhhcyBhbGxcbiAgICAgICAgICAgIC8vIHRpbGVzIHZpc2libGUsIGl0IGJlY29tZXMgJ3Nob3cgbGVzcycuXG4gICAgICAgICAgICBsZXQgc2hvd05CdXR0b24gPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAobWF4VGlsZXNQeCA+IHRoaXMuc3RhdGUuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGhlaWdodCBvZiBhbGwgdGhlIHRpbGVzIGlzIGdyZWF0ZXIgdGhhbiB0aGUgc2VjdGlvbiBoZWlnaHQ6IHdlIG5lZWQgYSAnc2hvdyBtb3JlJyBidXR0b25cbiAgICAgICAgICAgICAgICBjb25zdCBub25QYWRkZWRIZWlnaHQgPSB0aGlzLnN0YXRlLmhlaWdodCAtIFJFU0laRV9IQU5ETEVfSEVJR0hUIC0gU0hPV19OX0JVVFRPTl9IRUlHSFQ7XG4gICAgICAgICAgICAgICAgY29uc3QgYW1vdW50RnVsbHlTaG93biA9IE1hdGguZmxvb3Iobm9uUGFkZGVkSGVpZ2h0IC8gdGhpcy5sYXlvdXQudGlsZUhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbnVtTWlzc2luZyA9IHRoaXMubnVtVGlsZXMgLSBhbW91bnRGdWxseVNob3duO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gX3QoXCJTaG93ICUoY291bnQpcyBtb3JlXCIsIHtjb3VudDogbnVtTWlzc2luZ30pO1xuICAgICAgICAgICAgICAgIGxldCBzaG93TW9yZVRleHQgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfUm9vbVN1Ymxpc3Rfc2hvd05CdXR0b25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIHNob3dNb3JlVGV4dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgc2hvd05CdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxSb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwidHJlZWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblNob3dBbGxDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2hvd01vcmVCdG5DbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfUm9vbVN1Ymxpc3Rfc2hvd01vcmVCdXR0b25DaGV2cm9uIG14X1Jvb21TdWJsaXN0X3Nob3dOQnV0dG9uQ2hldnJvbic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgey8qIHNldCBieSBDU1MgbWFza2luZyAqL31cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93TW9yZVRleHR9XG4gICAgICAgICAgICAgICAgICAgIDwvUm92aW5nQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm51bVRpbGVzID4gdGhpcy5sYXlvdXQuZGVmYXVsdFZpc2libGVUaWxlcykge1xuICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgYWxsIHRpbGVzIHZpc2libGUgLSBhZGQgYSBidXR0b24gdG8gc2hvdyBsZXNzXG4gICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBfdChcIlNob3cgbGVzc1wiKTtcbiAgICAgICAgICAgICAgICBsZXQgc2hvd0xlc3NUZXh0ID0gKFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1Jvb21TdWJsaXN0X3Nob3dOQnV0dG9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmlzTWluaW1pemVkKSBzaG93TGVzc1RleHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHNob3dOQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8Um92aW5nQWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cInRyZWVpdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaG93TGVzc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzaG93TW9yZUJ0bkNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtsYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9Sb29tU3VibGlzdF9zaG93TGVzc0J1dHRvbkNoZXZyb24gbXhfUm9vbVN1Ymxpc3Rfc2hvd05CdXR0b25DaGV2cm9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Lyogc2V0IGJ5IENTUyBtYXNraW5nICovfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dMZXNzVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgPC9Sb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpZ3VyZSBvdXQgaWYgd2UgbmVlZCBhIGhhbmRsZVxuICAgICAgICAgICAgY29uc3QgaGFuZGxlczogRW5hYmxlID0ge1xuICAgICAgICAgICAgICAgIGJvdHRvbTogdHJ1ZSwgLy8gdGhlIG9ubHkgb25lIHdlIG5lZWQsIGJ1dCB0aGUgb3RoZXJzIG11c3QgYmUgZXhwbGljaXRseSBmYWxzZVxuICAgICAgICAgICAgICAgIGJvdHRvbUxlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJvdHRvbVJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdG9wOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b3BMZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b3BSaWdodDogZmFsc2UsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGxheW91dC52aXNpYmxlVGlsZXMgPj0gdGhpcy5udW1UaWxlcyAmJiB0aGlzLm51bVRpbGVzIDw9IGxheW91dC5taW5WaXNpYmxlVGlsZXMpIHtcbiAgICAgICAgICAgICAgICAvLyB3ZSdyZSBhdCBhIG1pbmltdW0sIGRvbid0IGhhdmUgYSBib3R0b20gaGFuZGxlXG4gICAgICAgICAgICAgICAgaGFuZGxlcy5ib3R0b20gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gV2UgaGF2ZSB0byBhY2NvdW50IGZvciBwYWRkaW5nIHNvIHdlIGNhbiBhY2NvbW1vZGF0ZSBhICdzaG93IG1vcmUnIGJ1dHRvbiBhbmRcbiAgICAgICAgICAgIC8vIHRoZSByZXNpemUgaGFuZGxlLCB3aGljaCBhcmUgcGlubmVkIHRvIHRoZSBib3R0b20gb2YgdGhlIGNvbnRhaW5lci4gVGhpcyBpcyB0aGVcbiAgICAgICAgICAgIC8vIGVhc2llc3Qgd2F5IHRvIGhhdmUgYSByZXNpemUgaGFuZGxlIGJlbG93IHRoZSBidXR0b24gYXMgb3RoZXJ3aXNlIHdlJ3JlIHdyaXRpbmdcbiAgICAgICAgICAgIC8vIG91ciBvd24gcmVzaXplIGhhbmRsaW5nIGFuZCB0aGF0IGRvZXNuJ3Qgc291bmQgZnVuLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIFRoZSBsYXlvdXQgY2xhc3MgaGFzIHNvbWUgaGVscGVycyBmb3IgZGVhbGluZyB3aXRoIHBhZGRpbmcsIGFzIHdlIGRvbid0IHdhbnQgdG9cbiAgICAgICAgICAgIC8vIGFwcGx5IGl0IGluIGFsbCBjYXNlcy4gSWYgd2UgYXBwbHkgaXQgaW4gYWxsIGNhc2VzLCB0aGUgcmVzaXppbmcgZmVlbHMgbGlrZSBpdFxuICAgICAgICAgICAgLy8gZ29lcyBiYWNrd2FyZHMgYW5kIGNhbiBiZWNvbWUgd2lsZGx5IGluY29ycmVjdCAodmlzaWJsZVRpbGVzIHNheXMgMTggd2hlbiB0aGVyZSdzXG4gICAgICAgICAgICAvLyBvbmx5IG1hdGhlbWF0aWNhbGx5IDcgcG9zc2libGUpLlxuXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVXcmFwcGVyQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgICdteF9Sb29tU3VibGlzdF9yZXNpemVySGFuZGxlcyc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X3Jlc2l6ZXJIYW5kbGVzX3Nob3dOQnV0dG9uJzogISFzaG93TkJ1dHRvbixcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb250ZW50ID0gKFxuICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgPFJlc2l6YWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZT17e2hlaWdodDogdGhpcy5zdGF0ZS5oZWlnaHR9IGFzIGFueX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodD17bWluVGlsZXNQeH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1heEhlaWdodD17bWF4VGlsZXNQeH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVzaXplU3RhcnQ9e3RoaXMub25SZXNpemVTdGFydH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVzaXplU3RvcD17dGhpcy5vblJlc2l6ZVN0b3B9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlc2l6ZT17dGhpcy5vblJlc2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZVdyYXBwZXJDbGFzcz17aGFuZGxlV3JhcHBlckNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVDbGFzc2VzPXt7Ym90dG9tOiBcIm14X1Jvb21TdWJsaXN0X3Jlc2l6ZXJIYW5kbGVcIn19XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9yZXNpemVCb3hcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlPXtoYW5kbGVzfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X3RpbGVzXCIgb25TY3JvbGw9e3RoaXMub25TY3JvbGxQcmV2ZW50fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dmlzaWJsZVRpbGVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2hvd05CdXR0b259XG4gICAgICAgICAgICAgICAgICAgIDwvUmVzaXphYmxlPlxuICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2hvd1NrZWxldG9uICYmIHRoaXMuc3RhdGUuaXNFeHBhbmRlZCkge1xuICAgICAgICAgICAgY29udGVudCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3Rfc2tlbGV0b25VSVwiIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuc3VibGlzdFJlZn1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgcm9sZT1cImdyb3VwXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3RoaXMucmVuZGVySGVhZGVyKCl9XG4gICAgICAgICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _shouldHideEvent = _interopRequireDefault(require("../../shouldHideEvent"));

var _DateUtils = require("../../DateUtils");

var sdk = _interopRequireWildcard(require("../../index"));

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _Layout = require("../../settings/Layout");

var _languageHandler = require("../../languageHandler");

var _EventTile = require("../views/rooms/EventTile");

var _TextForEvent = require("../../TextForEvent");

var _IRCTimelineProfileResizer = _interopRequireDefault(require("../views/elements/IRCTimelineProfileResizer"));

var _DMRoomMap = _interopRequireDefault(require("../../utils/DMRoomMap"));

var _NewRoomIntro = _interopRequireDefault(require("../views/rooms/NewRoomIntro"));

var _replaceableComponent = require("../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

const CONTINUATION_MAX_INTERVAL = 5 * 60 * 1000; // 5 minutes

const continuedTypes = ['m.sticker', 'm.room.message']; // check if there is a previous event and it has the same sender as this event
// and the types are the same/is in continuedTypes and the time between them is <= CONTINUATION_MAX_INTERVAL

function shouldFormContinuation(prevEvent, mxEvent) {
  // sanity check inputs
  if (!prevEvent || !prevEvent.sender || !mxEvent.sender) return false; // check if within the max continuation period

  if (mxEvent.getTs() - prevEvent.getTs() > CONTINUATION_MAX_INTERVAL) return false; // As we summarise redactions, do not continue a redacted event onto a non-redacted one and vice-versa

  if (mxEvent.isRedacted() !== prevEvent.isRedacted()) return false; // Some events should appear as continuations from previous events of different types.

  if (mxEvent.getType() !== prevEvent.getType() && (!continuedTypes.includes(mxEvent.getType()) || !continuedTypes.includes(prevEvent.getType()))) return false; // Check if the sender is the same and hasn't changed their displayname/avatar between these events

  if (mxEvent.sender.userId !== prevEvent.sender.userId || mxEvent.sender.name !== prevEvent.sender.name || mxEvent.sender.getMxcAvatarUrl() !== prevEvent.sender.getMxcAvatarUrl()) return false; // if we don't have tile for previous event then it was shown by showHiddenEvents and has no SenderProfile

  if (!(0, _EventTile.haveTileForEvent)(prevEvent)) return false;
  return true;
}

const isMembershipChange = e => e.getType() === 'm.room.member' || e.getType() === 'm.room.third_party_invite';
/* (almost) stateless UI component which builds the event tiles in the room timeline.
 */


let MessagePanel = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.MessagePanel"), _dec(_class = (_temp = _class2 = class MessagePanel extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onShowTypingNotificationsChange", () => {
      this.setState({
        showTypingNotifications: _SettingsStore.default.getValue("showTypingNotifications")
      });
    });
    (0, _defineProperty2.default)(this, "_isUnmounting", () => {
      return !this._isMounted;
    });
    (0, _defineProperty2.default)(this, "_collectGhostReadMarker", node => {
      if (node) {
        // now the element has appeared, change the style which will trigger the CSS transition
        requestAnimationFrame(() => {
          node.style.width = '10%';
          node.style.opacity = '0';
        });
      }
    });
    (0, _defineProperty2.default)(this, "_onGhostTransitionEnd", ev => {
      // we can now clean up the ghost element
      const finishedEventId = ev.target.dataset.eventid;
      this.setState({
        ghostReadMarkers: this.state.ghostReadMarkers.filter(eid => eid !== finishedEventId)
      });
    });
    (0, _defineProperty2.default)(this, "_collectEventNode", (eventId, node) => {
      this.eventNodes[eventId] = node;
    });
    (0, _defineProperty2.default)(this, "_onHeightChanged", () => {
      const scrollPanel = this._scrollPanel.current;

      if (scrollPanel) {
        scrollPanel.checkScroll();
      }
    });
    (0, _defineProperty2.default)(this, "_onTypingShown", () => {
      const scrollPanel = this._scrollPanel.current; // this will make the timeline grow, so checkScroll

      scrollPanel.checkScroll();

      if (scrollPanel && scrollPanel.getScrollState().stuckAtBottom) {
        scrollPanel.preventShrinking();
      }
    });
    (0, _defineProperty2.default)(this, "_onTypingHidden", () => {
      const scrollPanel = this._scrollPanel.current;

      if (scrollPanel) {
        // as hiding the typing notifications doesn't
        // update the scrollPanel, we tell it to apply
        // the shrinking prevention once the typing notifs are hidden
        scrollPanel.updatePreventShrinking(); // order is important here as checkScroll will scroll down to
        // reveal added padding to balance the notifs disappearing.

        scrollPanel.checkScroll();
      }
    });
    this.state = {
      // previous positions the read marker has been in, so we can
      // display 'ghost' read markers that are animating away
      ghostReadMarkers: [],
      showTypingNotifications: _SettingsStore.default.getValue("showTypingNotifications")
    }; // opaque readreceipt info for each userId; used by ReadReceiptMarker
    // to manage its animations

    this._readReceiptMap = {}; // Track read receipts by event ID. For each _shown_ event ID, we store
    // the list of read receipts to display:
    //   [
    //       {
    //           userId: string,
    //           member: RoomMember,
    //           ts: number,
    //       },
    //   ]
    // This is recomputed on each render. It's only stored on the component
    // for ease of passing the data around since it's computed in one pass
    // over all events.

    this._readReceiptsByEvent = {}; // Track read receipts by user ID. For each user ID we've ever shown a
    // a read receipt for, we store an object:
    //   {
    //       lastShownEventId: string,
    //       receipt: {
    //           userId: string,
    //           member: RoomMember,
    //           ts: number,
    //       },
    //   }
    // so that we can always keep receipts displayed by reverting back to
    // the last shown event for that user ID when needed. This may feel like
    // it duplicates the receipt storage in the room, but at this layer, we
    // are tracking _shown_ event IDs, which the JS SDK knows nothing about.
    // This is recomputed on each render, using the data from the previous
    // render as our fallback for any user IDs we can't match a receipt to a
    // displayed event in the current render cycle.

    this._readReceiptsByUserId = {}; // Cache hidden events setting on mount since Settings is expensive to
    // query, and we check this in a hot code path.

    this._showHiddenEventsInTimeline = _SettingsStore.default.getValue("showHiddenEventsInTimeline");
    this._isMounted = false;
    this._readMarkerNode = /*#__PURE__*/(0, _react.createRef)();
    this._whoIsTyping = /*#__PURE__*/(0, _react.createRef)();
    this._scrollPanel = /*#__PURE__*/(0, _react.createRef)();
    this._showTypingNotificationsWatcherRef = _SettingsStore.default.watchSetting("showTypingNotifications", null, this.onShowTypingNotificationsChange);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;

    _SettingsStore.default.unwatchSetting(this._showTypingNotificationsWatcherRef);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.readMarkerVisible && this.props.readMarkerEventId !== prevProps.readMarkerEventId) {
      const ghostReadMarkers = this.state.ghostReadMarkers;
      ghostReadMarkers.push(prevProps.readMarkerEventId);
      this.setState({
        ghostReadMarkers
      });
    }
  }

  /* get the DOM node representing the given event */
  getNodeForEventId(eventId) {
    if (!this.eventNodes) {
      return undefined;
    }

    return this.eventNodes[eventId];
  }
  /* return true if the content is fully scrolled down right now; else false.
   */


  isAtBottom() {
    return this._scrollPanel.current && this._scrollPanel.current.isAtBottom();
  }
  /* get the current scroll state. See ScrollPanel.getScrollState for
   * details.
   *
   * returns null if we are not mounted.
   */


  getScrollState() {
    return this._scrollPanel.current ? this._scrollPanel.current.getScrollState() : null;
  } // returns one of:
  //
  //  null: there is no read marker
  //  -1: read marker is above the window
  //   0: read marker is within the window
  //  +1: read marker is below the window


  getReadMarkerPosition() {
    const readMarker = this._readMarkerNode.current;
    const messageWrapper = this._scrollPanel.current;

    if (!readMarker || !messageWrapper) {
      return null;
    }

    const wrapperRect = _reactDom.default.findDOMNode(messageWrapper).getBoundingClientRect();

    const readMarkerRect = readMarker.getBoundingClientRect(); // the read-marker pretends to have zero height when it is actually
    // two pixels high; +2 here to account for that.

    if (readMarkerRect.bottom + 2 < wrapperRect.top) {
      return -1;
    } else if (readMarkerRect.top < wrapperRect.bottom) {
      return 0;
    } else {
      return 1;
    }
  }
  /* jump to the top of the content.
   */


  scrollToTop() {
    if (this._scrollPanel.current) {
      this._scrollPanel.current.scrollToTop();
    }
  }
  /* jump to the bottom of the content.
   */


  scrollToBottom() {
    if (this._scrollPanel.current) {
      this._scrollPanel.current.scrollToBottom();
    }
  }
  /**
   * Page up/down.
   *
   * @param {number} mult: -1 to page up, +1 to page down
   */


  scrollRelative(mult) {
    if (this._scrollPanel.current) {
      this._scrollPanel.current.scrollRelative(mult);
    }
  }
  /**
   * Scroll up/down in response to a scroll key
   *
   * @param {KeyboardEvent} ev: the keyboard event to handle
   */


  handleScrollKey(ev) {
    if (this._scrollPanel.current) {
      this._scrollPanel.current.handleScrollKey(ev);
    }
  }
  /* jump to the given event id.
   *
   * offsetBase gives the reference point for the pixelOffset. 0 means the
   * top of the container, 1 means the bottom, and fractional values mean
   * somewhere in the middle. If omitted, it defaults to 0.
   *
   * pixelOffset gives the number of pixels *above* the offsetBase that the
   * node (specifically, the bottom of it) will be positioned. If omitted, it
   * defaults to 0.
   */


  scrollToEvent(eventId, pixelOffset, offsetBase) {
    if (this._scrollPanel.current) {
      this._scrollPanel.current.scrollToToken(eventId, pixelOffset, offsetBase);
    }
  }

  scrollToEventIfNeeded(eventId) {
    const node = this.eventNodes[eventId];

    if (node) {
      node.scrollIntoView({
        block: "nearest",
        behavior: "instant"
      });
    }
  }
  /* check the scroll state and send out pagination requests if necessary.
   */


  checkFillState() {
    if (this._scrollPanel.current) {
      this._scrollPanel.current.checkFillState();
    }
  }

  // TODO: Implement granular (per-room) hide options
  _shouldShowEvent(mxEv) {
    if (mxEv.sender && _MatrixClientPeg.MatrixClientPeg.get().isUserIgnored(mxEv.sender.userId)) {
      return false; // ignored = no show (only happens if the ignore happens after an event was received)
    }

    if (this._showHiddenEventsInTimeline) {
      return true;
    }

    if (!(0, _EventTile.haveTileForEvent)(mxEv)) {
      return false; // no tile = no show
    } // Always show highlighted event


    if (this.props.highlightedEventId === mxEv.getId()) return true;
    return !(0, _shouldHideEvent.default)(mxEv);
  }

  _readMarkerForEvent(eventId, isLastEvent) {
    const visible = !isLastEvent && this.props.readMarkerVisible;

    if (this.props.readMarkerEventId === eventId) {
      let hr; // if the read marker comes at the end of the timeline (except
      // for local echoes, which are excluded from RMs, because they
      // don't have useful event ids), we don't want to show it, but
      // we still want to create the <li/> for it so that the
      // algorithms which depend on its position on the screen aren't
      // confused.

      if (visible) {
        hr = /*#__PURE__*/_react.default.createElement("hr", {
          className: "mx_RoomView_myReadMarker",
          style: {
            opacity: 1,
            width: '99%'
          }
        });
      }

      return /*#__PURE__*/_react.default.createElement("li", {
        key: "readMarker_" + eventId,
        ref: this._readMarkerNode,
        className: "mx_RoomView_myReadMarker_container",
        "data-scroll-tokens": eventId
      }, hr);
    } else if (this.state.ghostReadMarkers.includes(eventId)) {
      // We render 'ghost' read markers in the DOM while they
      // transition away. This allows the actual read marker
      // to be in the right place straight away without having
      // to wait for the transition to finish.
      // There are probably much simpler ways to do this transition,
      // possibly using react-transition-group which handles keeping
      // elements in the DOM whilst they transition out, although our
      // case is a little more complex because only some of the items
      // transition (ie. the read markers do but the event tiles do not)
      // and TransitionGroup requires that all its children are Transitions.
      const hr = /*#__PURE__*/_react.default.createElement("hr", {
        className: "mx_RoomView_myReadMarker",
        ref: this._collectGhostReadMarker,
        onTransitionEnd: this._onGhostTransitionEnd,
        "data-eventid": eventId
      }); // give it a key which depends on the event id. That will ensure that
      // we get a new DOM node (restarting the animation) when the ghost
      // moves to a different event.


      return /*#__PURE__*/_react.default.createElement("li", {
        key: "_readuptoghost_" + eventId,
        className: "mx_RoomView_myReadMarker_container"
      }, hr);
    }

    return null;
  }

  _getNextEventInfo(arr, i) {
    const nextEvent = i < arr.length - 1 ? arr[i + 1] : null; // The next event with tile is used to to determine the 'last successful' flag
    // when rendering the tile. The shouldShowEvent function is pretty quick at what
    // it does, so this should have no significant cost even when a room is used for
    // not-chat purposes.

    const nextTile = arr.slice(i + 1).find(e => this._shouldShowEvent(e));
    return {
      nextEvent,
      nextTile
    };
  }

  _getEventTiles() {
    this.eventNodes = {};
    let i; // first figure out which is the last event in the list which we're
    // actually going to show; this allows us to behave slightly
    // differently for the last event in the list. (eg show timestamp)
    //
    // we also need to figure out which is the last event we show which isn't
    // a local echo, to manage the read-marker.

    let lastShownEvent;
    let lastShownNonLocalEchoIndex = -1;

    for (i = this.props.events.length - 1; i >= 0; i--) {
      const mxEv = this.props.events[i];

      if (!this._shouldShowEvent(mxEv)) {
        continue;
      }

      if (lastShownEvent === undefined) {
        lastShownEvent = mxEv;
      }

      if (mxEv.status) {
        // this is a local echo
        continue;
      }

      lastShownNonLocalEchoIndex = i;
      break;
    }

    const ret = [];
    let prevEvent = null; // the last event we showed
    // Note: the EventTile might still render a "sent/sending receipt" independent of
    // this information. When not providing read receipt information, the tile is likely
    // to assume that sent receipts are to be shown more often.

    this._readReceiptsByEvent = {};

    if (this.props.showReadReceipts) {
      this._readReceiptsByEvent = this._getReadReceiptsByShownEvent();
    }

    let grouper = null;

    for (i = 0; i < this.props.events.length; i++) {
      const mxEv = this.props.events[i];
      const eventId = mxEv.getId();
      const last = mxEv === lastShownEvent;

      const {
        nextEvent,
        nextTile
      } = this._getNextEventInfo(this.props.events, i);

      if (grouper) {
        if (grouper.shouldGroup(mxEv)) {
          grouper.add(mxEv);
          continue;
        } else {
          // not part of group, so get the group tiles, close the
          // group, and continue like a normal event
          ret.push(...grouper.getTiles());
          prevEvent = grouper.getNewPrevEvent();
          grouper = null;
        }
      }

      for (const Grouper of groupers) {
        if (Grouper.canStartGroup(this, mxEv)) {
          grouper = new Grouper(this, mxEv, prevEvent, lastShownEvent, nextEvent, nextTile);
        }
      }

      if (!grouper) {
        const wantTile = this._shouldShowEvent(mxEv);

        if (wantTile) {
          // make sure we unpack the array returned by _getTilesForEvent,
          // otherwise react will auto-generate keys and we will end up
          // replacing all of the DOM elements every time we paginate.
          ret.push(...this._getTilesForEvent(prevEvent, mxEv, last, nextEvent, nextTile));
          prevEvent = mxEv;
        }

        const readMarker = this._readMarkerForEvent(eventId, i >= lastShownNonLocalEchoIndex);

        if (readMarker) ret.push(readMarker);
      }
    }

    if (grouper) {
      ret.push(...grouper.getTiles());
    }

    return ret;
  }

  _getTilesForEvent(prevEvent, mxEv, last, nextEvent, nextEventWithTile) {
    const TileErrorBoundary = sdk.getComponent('messages.TileErrorBoundary');
    const EventTile = sdk.getComponent('rooms.EventTile');
    const DateSeparator = sdk.getComponent('messages.DateSeparator');
    const ret = [];
    const isEditing = this.props.editState && this.props.editState.getEvent().getId() === mxEv.getId(); // local echoes have a fake date, which could even be yesterday. Treat them
    // as 'today' for the date separators.

    let ts1 = mxEv.getTs();
    let eventDate = mxEv.getDate();

    if (mxEv.status) {
      eventDate = new Date();
      ts1 = eventDate.getTime();
    } // do we need a date separator since the last event?


    const wantsDateSeparator = this._wantsDateSeparator(prevEvent, eventDate);

    if (wantsDateSeparator) {
      const dateSeparator = /*#__PURE__*/_react.default.createElement("li", {
        key: ts1
      }, /*#__PURE__*/_react.default.createElement(DateSeparator, {
        key: ts1,
        ts: ts1
      }));

      ret.push(dateSeparator);
    }

    let willWantDateSeparator = false;

    if (nextEvent) {
      willWantDateSeparator = this._wantsDateSeparator(mxEv, nextEvent.getDate() || new Date());
    } // is this a continuation of the previous message?


    const continuation = !wantsDateSeparator && shouldFormContinuation(prevEvent, mxEv);
    const eventId = mxEv.getId();
    const highlight = eventId === this.props.highlightedEventId; // we can't use local echoes as scroll tokens, because their event IDs change.
    // Local echos have a send "status".

    const scrollToken = mxEv.status ? undefined : eventId;
    const readReceipts = this._readReceiptsByEvent[eventId];
    let isLastSuccessful = false;

    const isSentState = s => !s || s === 'sent';

    const isSent = isSentState(mxEv.getAssociatedStatus());

    const hasNextEvent = nextEvent && this._shouldShowEvent(nextEvent);

    if (!hasNextEvent && isSent) {
      isLastSuccessful = true;
    } else if (hasNextEvent && isSent && !isSentState(nextEvent.getAssociatedStatus())) {
      isLastSuccessful = true;
    } // This is a bit nuanced, but if our next event is hidden but a future event is not
    // hidden then we're not the last successful.


    if (nextEventWithTile && nextEventWithTile !== nextEvent && isSentState(nextEventWithTile.getAssociatedStatus())) {
      isLastSuccessful = false;
    } // We only want to consider "last successful" if the event is sent by us, otherwise of course
    // it's successful: we received it.


    isLastSuccessful = isLastSuccessful && mxEv.getSender() === _MatrixClientPeg.MatrixClientPeg.get().getUserId(); // use txnId as key if available so that we don't remount during sending

    ret.push( /*#__PURE__*/_react.default.createElement("li", {
      key: mxEv.getTxnId() || eventId,
      ref: this._collectEventNode.bind(this, eventId),
      "data-scroll-tokens": scrollToken
    }, /*#__PURE__*/_react.default.createElement(TileErrorBoundary, {
      mxEvent: mxEv
    }, /*#__PURE__*/_react.default.createElement(EventTile, {
      mxEvent: mxEv,
      continuation: continuation,
      isRedacted: mxEv.isRedacted(),
      replacingEventId: mxEv.replacingEventId(),
      editState: isEditing && this.props.editState,
      onHeightChanged: this._onHeightChanged,
      readReceipts: readReceipts,
      readReceiptMap: this._readReceiptMap,
      showUrlPreview: this.props.showUrlPreview,
      checkUnmounting: this._isUnmounting,
      eventSendStatus: mxEv.getAssociatedStatus(),
      tileShape: this.props.tileShape,
      isTwelveHour: this.props.isTwelveHour,
      permalinkCreator: this.props.permalinkCreator,
      last: last,
      lastInSection: willWantDateSeparator,
      lastSuccessful: isLastSuccessful,
      isSelectedEvent: highlight,
      getRelationsForEvent: this.props.getRelationsForEvent,
      showReactions: this.props.showReactions,
      layout: this.props.layout,
      enableFlair: this.props.enableFlair,
      showReadReceipts: this.props.showReadReceipts
    }))));
    return ret;
  }

  _wantsDateSeparator(prevEvent, nextEventDate) {
    if (prevEvent == null) {
      // first event in the panel: depends if we could back-paginate from
      // here.
      return !this.props.suppressFirstDateSeparator;
    }

    return (0, _DateUtils.wantsDateSeparator)(prevEvent.getDate(), nextEventDate);
  } // Get a list of read receipts that should be shown next to this event
  // Receipts are objects which have a 'userId', 'roomMember' and 'ts'.


  _getReadReceiptsForEvent(event) {
    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId; // get list of read receipts, sorted most recent first


    const {
      room
    } = this.props;

    if (!room) {
      return null;
    }

    const receipts = [];
    room.getReceiptsForEvent(event).forEach(r => {
      if (!r.userId || r.type !== "m.read" || r.userId === myUserId) {
        return; // ignore non-read receipts and receipts from self.
      }

      if (_MatrixClientPeg.MatrixClientPeg.get().isUserIgnored(r.userId)) {
        return; // ignore ignored users
      }

      const member = room.getMember(r.userId);
      receipts.push({
        userId: r.userId,
        roomMember: member,
        ts: r.data ? r.data.ts : 0
      });
    });
    return receipts;
  } // Get an object that maps from event ID to a list of read receipts that
  // should be shown next to that event. If a hidden event has read receipts,
  // they are folded into the receipts of the last shown event.


  _getReadReceiptsByShownEvent() {
    const receiptsByEvent = {};
    const receiptsByUserId = {};
    let lastShownEventId;

    for (const event of this.props.events) {
      if (this._shouldShowEvent(event)) {
        lastShownEventId = event.getId();
      }

      if (!lastShownEventId) {
        continue;
      }

      const existingReceipts = receiptsByEvent[lastShownEventId] || [];

      const newReceipts = this._getReadReceiptsForEvent(event);

      receiptsByEvent[lastShownEventId] = existingReceipts.concat(newReceipts); // Record these receipts along with their last shown event ID for
      // each associated user ID.

      for (const receipt of newReceipts) {
        receiptsByUserId[receipt.userId] = {
          lastShownEventId,
          receipt
        };
      }
    } // It's possible in some cases (for example, when a read receipt
    // advances before we have paginated in the new event that it's marking
    // received) that we can temporarily not have a matching event for
    // someone which had one in the last. By looking through our previous
    // mapping of receipts by user ID, we can cover recover any receipts
    // that would have been lost by using the same event ID from last time.


    for (const userId in this._readReceiptsByUserId) {
      if (receiptsByUserId[userId]) {
        continue;
      }

      const {
        lastShownEventId,
        receipt
      } = this._readReceiptsByUserId[userId];
      const existingReceipts = receiptsByEvent[lastShownEventId] || [];
      receiptsByEvent[lastShownEventId] = existingReceipts.concat(receipt);
      receiptsByUserId[userId] = {
        lastShownEventId,
        receipt
      };
    }

    this._readReceiptsByUserId = receiptsByUserId; // After grouping receipts by shown events, do another pass to sort each
    // receipt list.

    for (const eventId in receiptsByEvent) {
      receiptsByEvent[eventId].sort((r1, r2) => {
        return r2.ts - r1.ts;
      });
    }

    return receiptsByEvent;
  }

  updateTimelineMinHeight() {
    const scrollPanel = this._scrollPanel.current;

    if (scrollPanel) {
      const isAtBottom = scrollPanel.isAtBottom();
      const whoIsTyping = this._whoIsTyping.current;
      const isTypingVisible = whoIsTyping && whoIsTyping.isVisible(); // when messages get added to the timeline,
      // but somebody else is still typing,
      // update the min-height, so once the last
      // person stops typing, no jumping occurs

      if (isAtBottom && isTypingVisible) {
        scrollPanel.preventShrinking();
      }
    }
  }

  onTimelineReset() {
    const scrollPanel = this._scrollPanel.current;

    if (scrollPanel) {
      scrollPanel.clearPreventShrinking();
    }
  }

  render() {
    const ErrorBoundary = sdk.getComponent('elements.ErrorBoundary');
    const ScrollPanel = sdk.getComponent("structures.ScrollPanel");
    const WhoIsTypingTile = sdk.getComponent("rooms.WhoIsTypingTile");
    const Spinner = sdk.getComponent("elements.Spinner");
    let topSpinner;
    let bottomSpinner;

    if (this.props.backPaginating) {
      topSpinner = /*#__PURE__*/_react.default.createElement("li", {
        key: "_topSpinner"
      }, /*#__PURE__*/_react.default.createElement(Spinner, null));
    }

    if (this.props.forwardPaginating) {
      bottomSpinner = /*#__PURE__*/_react.default.createElement("li", {
        key: "_bottomSpinner"
      }, /*#__PURE__*/_react.default.createElement(Spinner, null));
    }

    const style = this.props.hidden ? {
      display: 'none'
    } : {};
    const className = (0, _classnames.default)(this.props.className, {
      "mx_MessagePanel_alwaysShowTimestamps": this.props.alwaysShowTimestamps
    });
    let whoIsTyping;

    if (this.props.room && !this.props.tileShape && this.state.showTypingNotifications) {
      whoIsTyping = /*#__PURE__*/_react.default.createElement(WhoIsTypingTile, {
        room: this.props.room,
        onShown: this._onTypingShown,
        onHidden: this._onTypingHidden,
        ref: this._whoIsTyping
      });
    }

    let ircResizer = null;

    if (this.props.layout == _Layout.Layout.IRC) {
      ircResizer = /*#__PURE__*/_react.default.createElement(_IRCTimelineProfileResizer.default, {
        minWidth: 20,
        maxWidth: 600,
        roomId: this.props.room ? this.props.room.roomId : null
      });
    }

    return /*#__PURE__*/_react.default.createElement(ErrorBoundary, null, /*#__PURE__*/_react.default.createElement(ScrollPanel, {
      ref: this._scrollPanel,
      className: className,
      onScroll: this.props.onScroll,
      onResize: this.onResize,
      onFillRequest: this.props.onFillRequest,
      onUnfillRequest: this.props.onUnfillRequest,
      style: style,
      stickyBottom: this.props.stickyBottom,
      resizeNotifier: this.props.resizeNotifier,
      fixedChildren: ircResizer
    }, topSpinner, this._getEventTiles(), whoIsTyping, bottomSpinner));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // true to give the component a 'display: none' style.
  hidden: _propTypes.default.bool,
  // true to show a spinner at the top of the timeline to indicate
  // back-pagination in progress
  backPaginating: _propTypes.default.bool,
  // true to show a spinner at the end of the timeline to indicate
  // forward-pagination in progress
  forwardPaginating: _propTypes.default.bool,
  // the list of MatrixEvents to display
  events: _propTypes.default.array.isRequired,
  // ID of an event to highlight. If undefined, no event will be highlighted.
  highlightedEventId: _propTypes.default.string,
  // The room these events are all in together, if any.
  // (The notification panel won't have a room here, for example.)
  room: _propTypes.default.object,
  // Should we show URL Previews
  showUrlPreview: _propTypes.default.bool,
  // event after which we should show a read marker
  readMarkerEventId: _propTypes.default.string,
  // whether the read marker should be visible
  readMarkerVisible: _propTypes.default.bool,
  // the userid of our user. This is used to suppress the read marker
  // for pending messages.
  ourUserId: _propTypes.default.string,
  // true to suppress the date at the start of the timeline
  suppressFirstDateSeparator: _propTypes.default.bool,
  // whether to show read receipts
  showReadReceipts: _propTypes.default.bool,
  // true if updates to the event list should cause the scroll panel to
  // scroll down when we are at the bottom of the window. See ScrollPanel
  // for more details.
  stickyBottom: _propTypes.default.bool,
  // callback which is called when the panel is scrolled.
  onScroll: _propTypes.default.func,
  // callback which is called when more content is needed.
  onFillRequest: _propTypes.default.func,
  // className for the panel
  className: _propTypes.default.string.isRequired,
  // shape parameter to be passed to EventTiles
  tileShape: _propTypes.default.string,
  // show twelve hour timestamps
  isTwelveHour: _propTypes.default.bool,
  // show timestamps always
  alwaysShowTimestamps: _propTypes.default.bool,
  // helper function to access relations for an event
  getRelationsForEvent: _propTypes.default.func,
  // whether to show reactions for an event
  showReactions: _propTypes.default.bool,
  // which layout to use
  layout: _Layout.LayoutPropType,
  // whether or not to show flair at all
  enableFlair: _propTypes.default.bool
}), _temp)) || _class);
exports.default = MessagePanel;

/* Grouper classes determine when events can be grouped together in a summary.
 * Groupers should have the following methods:
 * - canStartGroup (static): determines if a new group should be started with the
 *   given event
 * - shouldGroup: determines if the given event should be added to an existing group
 * - add: adds an event to an existing group (should only be called if shouldGroup
 *   return true)
 * - getTiles: returns the tiles that represent the group
 * - getNewPrevEvent: returns the event that should be used as the new prevEvent
 *   when determining things such as whether a date separator is necessary
 */
// Wrap initial room creation events into an EventListSummary
// Grouping only events sent by the same user that sent the `m.room.create` and only until
// the first non-state event or membership event which is not regarding the sender of the `m.room.create` event
class CreationGrouper {
  constructor(panel, createEvent, prevEvent, lastShownEvent) {
    this.panel = panel;
    this.createEvent = createEvent;
    this.prevEvent = prevEvent;
    this.lastShownEvent = lastShownEvent;
    this.events = []; // events that we include in the group but then eject out and place
    // above the group.

    this.ejectedEvents = [];
    this.readMarker = panel._readMarkerForEvent(createEvent.getId(), createEvent === lastShownEvent);
  }

  shouldGroup(ev) {
    const panel = this.panel;
    const createEvent = this.createEvent;

    if (!panel._shouldShowEvent(ev)) {
      return true;
    }

    if (panel._wantsDateSeparator(this.createEvent, ev.getDate())) {
      return false;
    }

    if (ev.getType() === "m.room.member" && (ev.getStateKey() !== createEvent.getSender() || ev.getContent()["membership"] !== "join")) {
      return false;
    }

    if (ev.isState() && ev.getSender() === createEvent.getSender()) {
      return true;
    }

    return false;
  }

  add(ev) {
    const panel = this.panel;
    this.readMarker = this.readMarker || panel._readMarkerForEvent(ev.getId(), ev === this.lastShownEvent);

    if (!panel._shouldShowEvent(ev)) {
      return;
    }

    if (ev.getType() === "m.room.encryption") {
      this.ejectedEvents.push(ev);
    } else {
      this.events.push(ev);
    }
  }

  getTiles() {
    // If we don't have any events to group, don't even try to group them. The logic
    // below assumes that we have a group of events to deal with, but we might not if
    // the events we were supposed to group were redacted.
    if (!this.events || !this.events.length) return [];
    const DateSeparator = sdk.getComponent('messages.DateSeparator');
    const EventListSummary = sdk.getComponent('views.elements.EventListSummary');
    const panel = this.panel;
    const ret = [];
    const createEvent = this.createEvent;
    const lastShownEvent = this.lastShownEvent;

    if (panel._wantsDateSeparator(this.prevEvent, createEvent.getDate())) {
      const ts = createEvent.getTs();
      ret.push( /*#__PURE__*/_react.default.createElement("li", {
        key: ts + '~'
      }, /*#__PURE__*/_react.default.createElement(DateSeparator, {
        key: ts + '~',
        ts: ts
      })));
    } // If this m.room.create event should be shown (room upgrade) then show it before the summary


    if (panel._shouldShowEvent(createEvent)) {
      // pass in the createEvent as prevEvent as well so no extra DateSeparator is rendered
      ret.push(...panel._getTilesForEvent(createEvent, createEvent, false));
    }

    for (const ejected of this.ejectedEvents) {
      ret.push(...panel._getTilesForEvent(createEvent, ejected, createEvent === lastShownEvent));
    }

    const eventTiles = this.events.map(e => {
      // In order to prevent DateSeparators from appearing in the expanded form
      // of EventListSummary, render each member event as if the previous
      // one was itself. This way, the timestamp of the previous event === the
      // timestamp of the current event, and no DateSeparator is inserted.
      return panel._getTilesForEvent(e, e, e === lastShownEvent);
    }).reduce((a, b) => a.concat(b), []); // Get sender profile from the latest event in the summary as the m.room.create doesn't contain one

    const ev = this.events[this.events.length - 1];
    let summaryText;
    const roomId = ev.getRoomId();
    const creator = ev.sender ? ev.sender.name : ev.getSender();

    if (_DMRoomMap.default.shared().getUserIdForRoomId(roomId)) {
      summaryText = (0, _languageHandler._t)("%(creator)s created this DM.", {
        creator
      });
    } else {
      summaryText = (0, _languageHandler._t)("%(creator)s created and configured the room.", {
        creator
      });
    }

    ret.push( /*#__PURE__*/_react.default.createElement(_NewRoomIntro.default, {
      key: "newroomintro"
    }));
    ret.push( /*#__PURE__*/_react.default.createElement(EventListSummary, {
      key: "roomcreationsummary",
      events: this.events,
      onToggle: panel._onHeightChanged // Update scroll state
      ,
      summaryMembers: [ev.sender],
      summaryText: summaryText
    }, eventTiles));

    if (this.readMarker) {
      ret.push(this.readMarker);
    }

    return ret;
  }

  getNewPrevEvent() {
    return this.createEvent;
  }

}

(0, _defineProperty2.default)(CreationGrouper, "canStartGroup", function (panel, ev) {
  return ev.getType() === "m.room.create";
});

class RedactionGrouper {
  constructor(panel, ev, prevEvent, lastShownEvent, nextEvent, nextEventTile) {
    this.panel = panel;
    this.readMarker = panel._readMarkerForEvent(ev.getId(), ev === lastShownEvent);
    this.events = [ev];
    this.prevEvent = prevEvent;
    this.lastShownEvent = lastShownEvent;
    this.nextEvent = nextEvent;
    this.nextEventTile = nextEventTile;
  }

  shouldGroup(ev) {
    // absorb hidden events so that they do not break up streams of messages & redaction events being grouped
    if (!this.panel._shouldShowEvent(ev)) {
      return true;
    }

    if (this.panel._wantsDateSeparator(this.events[0], ev.getDate())) {
      return false;
    }

    return ev.isRedacted();
  }

  add(ev) {
    this.readMarker = this.readMarker || this.panel._readMarkerForEvent(ev.getId(), ev === this.lastShownEvent);

    if (!this.panel._shouldShowEvent(ev)) {
      return;
    }

    this.events.push(ev);
  }

  getTiles() {
    if (!this.events || !this.events.length) return [];
    const DateSeparator = sdk.getComponent('messages.DateSeparator');
    const EventListSummary = sdk.getComponent('views.elements.EventListSummary');
    const panel = this.panel;
    const ret = [];
    const lastShownEvent = this.lastShownEvent;

    if (panel._wantsDateSeparator(this.prevEvent, this.events[0].getDate())) {
      const ts = this.events[0].getTs();
      ret.push( /*#__PURE__*/_react.default.createElement("li", {
        key: ts + '~'
      }, /*#__PURE__*/_react.default.createElement(DateSeparator, {
        key: ts + '~',
        ts: ts
      })));
    }

    const key = "redactioneventlistsummary-" + (this.prevEvent ? this.events[0].getId() : "initial");
    const senders = new Set();
    let eventTiles = this.events.map((e, i) => {
      senders.add(e.sender);
      const prevEvent = i === 0 ? this.prevEvent : this.events[i - 1];
      return panel._getTilesForEvent(prevEvent, e, e === lastShownEvent, this.nextEvent, this.nextEventTile);
    }).reduce((a, b) => a.concat(b), []);

    if (eventTiles.length === 0) {
      eventTiles = null;
    }

    ret.push( /*#__PURE__*/_react.default.createElement(EventListSummary, {
      key: key,
      threshold: 2,
      events: this.events,
      onToggle: panel._onHeightChanged // Update scroll state
      ,
      summaryMembers: Array.from(senders),
      summaryText: (0, _languageHandler._t)("%(count)s messages deleted.", {
        count: eventTiles.length
      })
    }, eventTiles));

    if (this.readMarker) {
      ret.push(this.readMarker);
    }

    return ret;
  }

  getNewPrevEvent() {
    return this.events[this.events.length - 1];
  }

} // Wrap consecutive member events in a ListSummary, ignore if redacted


(0, _defineProperty2.default)(RedactionGrouper, "canStartGroup", function (panel, ev) {
  return panel._shouldShowEvent(ev) && ev.isRedacted();
});

class MemberGrouper {
  constructor(panel, ev, prevEvent, lastShownEvent) {
    this.panel = panel;
    this.readMarker = panel._readMarkerForEvent(ev.getId(), ev === lastShownEvent);
    this.events = [ev];
    this.prevEvent = prevEvent;
    this.lastShownEvent = lastShownEvent;
  }

  shouldGroup(ev) {
    if (this.panel._wantsDateSeparator(this.events[0], ev.getDate())) {
      return false;
    }

    return isMembershipChange(ev);
  }

  add(ev) {
    if (ev.getType() === 'm.room.member') {
      // We'll just double check that it's worth our time to do so, through an
      // ugly hack. If textForEvent returns something, we should group it for
      // rendering but if it doesn't then we'll exclude it.
      const renderText = (0, _TextForEvent.textForEvent)(ev);
      if (!renderText || renderText.trim().length === 0) return; // quietly ignore
    }

    this.readMarker = this.readMarker || this.panel._readMarkerForEvent(ev.getId(), ev === this.lastShownEvent);
    this.events.push(ev);
  }

  getTiles() {
    // If we don't have any events to group, don't even try to group them. The logic
    // below assumes that we have a group of events to deal with, but we might not if
    // the events we were supposed to group were redacted.
    if (!this.events || !this.events.length) return [];
    const DateSeparator = sdk.getComponent('messages.DateSeparator');
    const MemberEventListSummary = sdk.getComponent('views.elements.MemberEventListSummary');
    const panel = this.panel;
    const lastShownEvent = this.lastShownEvent;
    const ret = [];

    if (panel._wantsDateSeparator(this.prevEvent, this.events[0].getDate())) {
      const ts = this.events[0].getTs();
      ret.push( /*#__PURE__*/_react.default.createElement("li", {
        key: ts + '~'
      }, /*#__PURE__*/_react.default.createElement(DateSeparator, {
        key: ts + '~',
        ts: ts
      })));
    } // Ensure that the key of the MemberEventListSummary does not change with new
    // member events. This will prevent it from being re-created unnecessarily, and
    // instead will allow new props to be provided. In turn, the shouldComponentUpdate
    // method on MELS can be used to prevent unnecessary renderings.
    //
    // Whilst back-paginating with a MELS at the top of the panel, prevEvent will be null,
    // so use the key "membereventlistsummary-initial". Otherwise, use the ID of the first
    // membership event, which will not change during forward pagination.


    const key = "membereventlistsummary-" + (this.prevEvent ? this.events[0].getId() : "initial");
    let highlightInMels;
    let eventTiles = this.events.map(e => {
      if (e.getId() === panel.props.highlightedEventId) {
        highlightInMels = true;
      } // In order to prevent DateSeparators from appearing in the expanded form
      // of MemberEventListSummary, render each member event as if the previous
      // one was itself. This way, the timestamp of the previous event === the
      // timestamp of the current event, and no DateSeparator is inserted.


      return panel._getTilesForEvent(e, e, e === lastShownEvent);
    }).reduce((a, b) => a.concat(b), []);

    if (eventTiles.length === 0) {
      eventTiles = null;
    }

    ret.push( /*#__PURE__*/_react.default.createElement(MemberEventListSummary, {
      key: key,
      events: this.events,
      onToggle: panel._onHeightChanged // Update scroll state
      ,
      startExpanded: highlightInMels
    }, eventTiles));

    if (this.readMarker) {
      ret.push(this.readMarker);
    }

    return ret;
  }

  getNewPrevEvent() {
    return this.events[0];
  }

} // all the grouper classes that we use


(0, _defineProperty2.default)(MemberGrouper, "canStartGroup", function (panel, ev) {
  return panel._shouldShowEvent(ev) && isMembershipChange(ev);
});
const groupers = [CreationGrouper, MemberGrouper, RedactionGrouper];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTWVzc2FnZVBhbmVsLmpzIl0sIm5hbWVzIjpbIkNPTlRJTlVBVElPTl9NQVhfSU5URVJWQUwiLCJjb250aW51ZWRUeXBlcyIsInNob3VsZEZvcm1Db250aW51YXRpb24iLCJwcmV2RXZlbnQiLCJteEV2ZW50Iiwic2VuZGVyIiwiZ2V0VHMiLCJpc1JlZGFjdGVkIiwiZ2V0VHlwZSIsImluY2x1ZGVzIiwidXNlcklkIiwibmFtZSIsImdldE14Y0F2YXRhclVybCIsImlzTWVtYmVyc2hpcENoYW5nZSIsImUiLCJNZXNzYWdlUGFuZWwiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzZXRTdGF0ZSIsInNob3dUeXBpbmdOb3RpZmljYXRpb25zIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiX2lzTW91bnRlZCIsIm5vZGUiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzdHlsZSIsIndpZHRoIiwib3BhY2l0eSIsImV2IiwiZmluaXNoZWRFdmVudElkIiwidGFyZ2V0IiwiZGF0YXNldCIsImV2ZW50aWQiLCJnaG9zdFJlYWRNYXJrZXJzIiwic3RhdGUiLCJmaWx0ZXIiLCJlaWQiLCJldmVudElkIiwiZXZlbnROb2RlcyIsInNjcm9sbFBhbmVsIiwiX3Njcm9sbFBhbmVsIiwiY3VycmVudCIsImNoZWNrU2Nyb2xsIiwiZ2V0U2Nyb2xsU3RhdGUiLCJzdHVja0F0Qm90dG9tIiwicHJldmVudFNocmlua2luZyIsInVwZGF0ZVByZXZlbnRTaHJpbmtpbmciLCJfcmVhZFJlY2VpcHRNYXAiLCJfcmVhZFJlY2VpcHRzQnlFdmVudCIsIl9yZWFkUmVjZWlwdHNCeVVzZXJJZCIsIl9zaG93SGlkZGVuRXZlbnRzSW5UaW1lbGluZSIsIl9yZWFkTWFya2VyTm9kZSIsIl93aG9Jc1R5cGluZyIsIl9zaG93VHlwaW5nTm90aWZpY2F0aW9uc1dhdGNoZXJSZWYiLCJ3YXRjaFNldHRpbmciLCJvblNob3dUeXBpbmdOb3RpZmljYXRpb25zQ2hhbmdlIiwiY29tcG9uZW50RGlkTW91bnQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVud2F0Y2hTZXR0aW5nIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwicmVhZE1hcmtlclZpc2libGUiLCJyZWFkTWFya2VyRXZlbnRJZCIsInB1c2giLCJnZXROb2RlRm9yRXZlbnRJZCIsInVuZGVmaW5lZCIsImlzQXRCb3R0b20iLCJnZXRSZWFkTWFya2VyUG9zaXRpb24iLCJyZWFkTWFya2VyIiwibWVzc2FnZVdyYXBwZXIiLCJ3cmFwcGVyUmVjdCIsIlJlYWN0RE9NIiwiZmluZERPTU5vZGUiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJyZWFkTWFya2VyUmVjdCIsImJvdHRvbSIsInRvcCIsInNjcm9sbFRvVG9wIiwic2Nyb2xsVG9Cb3R0b20iLCJzY3JvbGxSZWxhdGl2ZSIsIm11bHQiLCJoYW5kbGVTY3JvbGxLZXkiLCJzY3JvbGxUb0V2ZW50IiwicGl4ZWxPZmZzZXQiLCJvZmZzZXRCYXNlIiwic2Nyb2xsVG9Ub2tlbiIsInNjcm9sbFRvRXZlbnRJZk5lZWRlZCIsInNjcm9sbEludG9WaWV3IiwiYmxvY2siLCJiZWhhdmlvciIsImNoZWNrRmlsbFN0YXRlIiwiX3Nob3VsZFNob3dFdmVudCIsIm14RXYiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc1VzZXJJZ25vcmVkIiwiaGlnaGxpZ2h0ZWRFdmVudElkIiwiZ2V0SWQiLCJfcmVhZE1hcmtlckZvckV2ZW50IiwiaXNMYXN0RXZlbnQiLCJ2aXNpYmxlIiwiaHIiLCJfY29sbGVjdEdob3N0UmVhZE1hcmtlciIsIl9vbkdob3N0VHJhbnNpdGlvbkVuZCIsIl9nZXROZXh0RXZlbnRJbmZvIiwiYXJyIiwiaSIsIm5leHRFdmVudCIsImxlbmd0aCIsIm5leHRUaWxlIiwic2xpY2UiLCJmaW5kIiwiX2dldEV2ZW50VGlsZXMiLCJsYXN0U2hvd25FdmVudCIsImxhc3RTaG93bk5vbkxvY2FsRWNob0luZGV4IiwiZXZlbnRzIiwic3RhdHVzIiwicmV0Iiwic2hvd1JlYWRSZWNlaXB0cyIsIl9nZXRSZWFkUmVjZWlwdHNCeVNob3duRXZlbnQiLCJncm91cGVyIiwibGFzdCIsInNob3VsZEdyb3VwIiwiYWRkIiwiZ2V0VGlsZXMiLCJnZXROZXdQcmV2RXZlbnQiLCJHcm91cGVyIiwiZ3JvdXBlcnMiLCJjYW5TdGFydEdyb3VwIiwid2FudFRpbGUiLCJfZ2V0VGlsZXNGb3JFdmVudCIsIm5leHRFdmVudFdpdGhUaWxlIiwiVGlsZUVycm9yQm91bmRhcnkiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJFdmVudFRpbGUiLCJEYXRlU2VwYXJhdG9yIiwiaXNFZGl0aW5nIiwiZWRpdFN0YXRlIiwiZ2V0RXZlbnQiLCJ0czEiLCJldmVudERhdGUiLCJnZXREYXRlIiwiRGF0ZSIsImdldFRpbWUiLCJ3YW50c0RhdGVTZXBhcmF0b3IiLCJfd2FudHNEYXRlU2VwYXJhdG9yIiwiZGF0ZVNlcGFyYXRvciIsIndpbGxXYW50RGF0ZVNlcGFyYXRvciIsImNvbnRpbnVhdGlvbiIsImhpZ2hsaWdodCIsInNjcm9sbFRva2VuIiwicmVhZFJlY2VpcHRzIiwiaXNMYXN0U3VjY2Vzc2Z1bCIsImlzU2VudFN0YXRlIiwicyIsImlzU2VudCIsImdldEFzc29jaWF0ZWRTdGF0dXMiLCJoYXNOZXh0RXZlbnQiLCJnZXRTZW5kZXIiLCJnZXRVc2VySWQiLCJnZXRUeG5JZCIsIl9jb2xsZWN0RXZlbnROb2RlIiwiYmluZCIsInJlcGxhY2luZ0V2ZW50SWQiLCJfb25IZWlnaHRDaGFuZ2VkIiwic2hvd1VybFByZXZpZXciLCJfaXNVbm1vdW50aW5nIiwidGlsZVNoYXBlIiwiaXNUd2VsdmVIb3VyIiwicGVybWFsaW5rQ3JlYXRvciIsImdldFJlbGF0aW9uc0ZvckV2ZW50Iiwic2hvd1JlYWN0aW9ucyIsImxheW91dCIsImVuYWJsZUZsYWlyIiwibmV4dEV2ZW50RGF0ZSIsInN1cHByZXNzRmlyc3REYXRlU2VwYXJhdG9yIiwiX2dldFJlYWRSZWNlaXB0c0ZvckV2ZW50IiwiZXZlbnQiLCJteVVzZXJJZCIsImNyZWRlbnRpYWxzIiwicm9vbSIsInJlY2VpcHRzIiwiZ2V0UmVjZWlwdHNGb3JFdmVudCIsImZvckVhY2giLCJyIiwidHlwZSIsIm1lbWJlciIsImdldE1lbWJlciIsInJvb21NZW1iZXIiLCJ0cyIsImRhdGEiLCJyZWNlaXB0c0J5RXZlbnQiLCJyZWNlaXB0c0J5VXNlcklkIiwibGFzdFNob3duRXZlbnRJZCIsImV4aXN0aW5nUmVjZWlwdHMiLCJuZXdSZWNlaXB0cyIsImNvbmNhdCIsInJlY2VpcHQiLCJzb3J0IiwicjEiLCJyMiIsInVwZGF0ZVRpbWVsaW5lTWluSGVpZ2h0Iiwid2hvSXNUeXBpbmciLCJpc1R5cGluZ1Zpc2libGUiLCJpc1Zpc2libGUiLCJvblRpbWVsaW5lUmVzZXQiLCJjbGVhclByZXZlbnRTaHJpbmtpbmciLCJyZW5kZXIiLCJFcnJvckJvdW5kYXJ5IiwiU2Nyb2xsUGFuZWwiLCJXaG9Jc1R5cGluZ1RpbGUiLCJTcGlubmVyIiwidG9wU3Bpbm5lciIsImJvdHRvbVNwaW5uZXIiLCJiYWNrUGFnaW5hdGluZyIsImZvcndhcmRQYWdpbmF0aW5nIiwiaGlkZGVuIiwiZGlzcGxheSIsImNsYXNzTmFtZSIsImFsd2F5c1Nob3dUaW1lc3RhbXBzIiwiX29uVHlwaW5nU2hvd24iLCJfb25UeXBpbmdIaWRkZW4iLCJpcmNSZXNpemVyIiwiTGF5b3V0IiwiSVJDIiwicm9vbUlkIiwib25TY3JvbGwiLCJvblJlc2l6ZSIsIm9uRmlsbFJlcXVlc3QiLCJvblVuZmlsbFJlcXVlc3QiLCJzdGlja3lCb3R0b20iLCJyZXNpemVOb3RpZmllciIsIlByb3BUeXBlcyIsImJvb2wiLCJhcnJheSIsImlzUmVxdWlyZWQiLCJzdHJpbmciLCJvYmplY3QiLCJvdXJVc2VySWQiLCJmdW5jIiwiTGF5b3V0UHJvcFR5cGUiLCJDcmVhdGlvbkdyb3VwZXIiLCJwYW5lbCIsImNyZWF0ZUV2ZW50IiwiZWplY3RlZEV2ZW50cyIsImdldFN0YXRlS2V5IiwiZ2V0Q29udGVudCIsImlzU3RhdGUiLCJFdmVudExpc3RTdW1tYXJ5IiwiZWplY3RlZCIsImV2ZW50VGlsZXMiLCJtYXAiLCJyZWR1Y2UiLCJhIiwiYiIsInN1bW1hcnlUZXh0IiwiZ2V0Um9vbUlkIiwiY3JlYXRvciIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsIlJlZGFjdGlvbkdyb3VwZXIiLCJuZXh0RXZlbnRUaWxlIiwia2V5Iiwic2VuZGVycyIsIlNldCIsIkFycmF5IiwiZnJvbSIsImNvdW50IiwiTWVtYmVyR3JvdXBlciIsInJlbmRlclRleHQiLCJ0cmltIiwiTWVtYmVyRXZlbnRMaXN0U3VtbWFyeSIsImhpZ2hsaWdodEluTWVscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLHlCQUF5QixHQUFHLElBQUksRUFBSixHQUFTLElBQTNDLEMsQ0FBaUQ7O0FBQ2pELE1BQU1DLGNBQWMsR0FBRyxDQUFDLFdBQUQsRUFBYyxnQkFBZCxDQUF2QixDLENBRUE7QUFDQTs7QUFDQSxTQUFTQyxzQkFBVCxDQUFnQ0MsU0FBaEMsRUFBMkNDLE9BQTNDLEVBQW9EO0FBQ2hEO0FBQ0EsTUFBSSxDQUFDRCxTQUFELElBQWMsQ0FBQ0EsU0FBUyxDQUFDRSxNQUF6QixJQUFtQyxDQUFDRCxPQUFPLENBQUNDLE1BQWhELEVBQXdELE9BQU8sS0FBUCxDQUZSLENBR2hEOztBQUNBLE1BQUlELE9BQU8sQ0FBQ0UsS0FBUixLQUFrQkgsU0FBUyxDQUFDRyxLQUFWLEVBQWxCLEdBQXNDTix5QkFBMUMsRUFBcUUsT0FBTyxLQUFQLENBSnJCLENBTWhEOztBQUNBLE1BQUlJLE9BQU8sQ0FBQ0csVUFBUixPQUF5QkosU0FB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N0I7QUFDSSxNQUFBLE1BQU0sRUFBRSxLQUFLckosTUFEakI7QUFFSSxNQUFBLFFBQVEsRUFBRWdJLEtBQUssQ0FBQzlFLGdCQUZwQixDQUVzQztBQUZ0QztBQUdJLE1BQUEsYUFBYSxFQUFFNkc7QUFIbkIsT0FLTXZCLFVBTE4sQ0FESjs7QUFVQSxRQUFJLEtBQUt2TCxVQUFULEVBQXFCO0FBQ2pCaUQsTUFBQUEsR0FBRyxDQUFDdEQsSUFBSixDQUFTLEtBQUtLLFVBQWQ7QUFDSDs7QUFFRCxXQUFPaUQsR0FBUDtBQUNIOztBQUVEUSxFQUFBQSxlQUFlLEdBQUc7QUFDZCxXQUFPLEtBQUtWLE1BQUwsQ0FBWSxDQUFaLENBQVA7QUFDSDs7QUF6R2UsQyxDQTRHcEI7Ozs4QkE1R00ySixhLG1CQUNxQixVQUFTM0IsS0FBVCxFQUFnQnhOLEVBQWhCLEVBQW9CO0FBQ3ZDLFNBQU93TixLQUFLLENBQUN4SixnQkFBTixDQUF1QmhFLEVBQXZCLEtBQThCakIsa0JBQWtCLENBQUNpQixFQUFELENBQXZEO0FBQ0gsQztBQTBHTCxNQUFNb0csUUFBUSxHQUFHLENBQUNtSCxlQUFELEVBQWtCNEIsYUFBbEIsRUFBaUNSLGdCQUFqQyxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBzaG91bGRIaWRlRXZlbnQgZnJvbSAnLi4vLi4vc2hvdWxkSGlkZUV2ZW50JztcbmltcG9ydCB7d2FudHNEYXRlU2VwYXJhdG9yfSBmcm9tICcuLi8uLi9EYXRlVXRpbHMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uL2luZGV4JztcblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCB7TGF5b3V0LCBMYXlvdXRQcm9wVHlwZX0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL0xheW91dFwiO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHtoYXZlVGlsZUZvckV2ZW50fSBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvRXZlbnRUaWxlXCI7XG5pbXBvcnQge3RleHRGb3JFdmVudH0gZnJvbSBcIi4uLy4uL1RleHRGb3JFdmVudFwiO1xuaW1wb3J0IElSQ1RpbWVsaW5lUHJvZmlsZVJlc2l6ZXIgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0lSQ1RpbWVsaW5lUHJvZmlsZVJlc2l6ZXJcIjtcbmltcG9ydCBETVJvb21NYXAgZnJvbSBcIi4uLy4uL3V0aWxzL0RNUm9vbU1hcFwiO1xuaW1wb3J0IE5ld1Jvb21JbnRybyBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvTmV3Um9vbUludHJvXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuY29uc3QgQ09OVElOVUFUSU9OX01BWF9JTlRFUlZBTCA9IDUgKiA2MCAqIDEwMDA7IC8vIDUgbWludXRlc1xuY29uc3QgY29udGludWVkVHlwZXMgPSBbJ20uc3RpY2tlcicsICdtLnJvb20ubWVzc2FnZSddO1xuXG4vLyBjaGVjayBpZiB0aGVyZSBpcyBhIHByZXZpb3VzIGV2ZW50IGFuZCBpdCBoYXMgdGhlIHNhbWUgc2VuZGVyIGFzIHRoaXMgZXZlbnRcbi8vIGFuZCB0aGUgdHlwZXMgYXJlIHRoZSBzYW1lL2lzIGluIGNvbnRpbnVlZFR5cGVzIGFuZCB0aGUgdGltZSBiZXR3ZWVuIHRoZW0gaXMgPD0gQ09OVElOVUFUSU9OX01BWF9JTlRFUlZBTFxuZnVuY3Rpb24gc2hvdWxkRm9ybUNvbnRpbnVhdGlvbihwcmV2RXZlbnQsIG14RXZlbnQpIHtcbiAgICAvLyBzYW5pdHkgY2hlY2sgaW5wdXRzXG4gICAgaWYgKCFwcmV2RXZlbnQgfHwgIXByZXZFdmVudC5zZW5kZXIgfHwgIW14RXZlbnQuc2VuZGVyKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gY2hlY2sgaWYgd2l0aGluIHRoZSBtYXggY29udGludWF0aW9uIHBlcmlvZFxuICAgIGlmIChteEV2ZW50LmdldFRzKCkgLSBwcmV2RXZlbnQuZ2V0VHMoKSA+IENPTlRJTlVBVElPTl9NQVhfSU5URVJWQUwpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIEFzIHdlIHN1bW1hcmlzZSByZWRhY3Rpb25zLCBkbyBub3QgY29udGludWUgYSByZWRhY3RlZCBldmVudCBvbnRvIGEgbm9uLXJlZGFjdGVkIG9uZSBhbmQgdmljZS12ZXJzYVxuICAgIGlmIChteEV2ZW50LmlzUmVkYWN0ZWQoKSAhPT0gcHJldkV2ZW50LmlzUmVkYWN0ZWQoKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gU29tZSBldmVudHMgc2hvdWxkIGFwcGVhciBhcyBjb250aW51YXRpb25zIGZyb20gcHJldmlvdXMgZXZlbnRzIG9mIGRpZmZlcmVudCB0eXBlcy5cbiAgICBpZiAobXhFdmVudC5nZXRUeXBlKCkgIT09IHByZXZFdmVudC5nZXRUeXBlKCkgJiZcbiAgICAgICAgKCFjb250aW51ZWRUeXBlcy5pbmNsdWRlcyhteEV2ZW50LmdldFR5cGUoKSkgfHxcbiAgICAgICAgICAgICFjb250aW51ZWRUeXBlcy5pbmNsdWRlcyhwcmV2RXZlbnQuZ2V0VHlwZSgpKSkpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIENoZWNrIGlmIHRoZSBzZW5kZXIgaXMgdGhlIHNhbWUgYW5kIGhhc24ndCBjaGFuZ2VkIHRoZWlyIGRpc3BsYXluYW1lL2F2YXRhciBiZXR3ZWVuIHRoZXNlIGV2ZW50c1xuICAgIGlmIChteEV2ZW50LnNlbmRlci51c2VySWQgIT09IHByZXZFdmVudC5zZW5kZXIudXNlcklkIHx8XG4gICAgICAgIG14RXZlbnQuc2VuZGVyLm5hbWUgIT09IHByZXZFdmVudC5zZW5kZXIubmFtZSB8fFxuICAgICAgICBteEV2ZW50LnNlbmRlci5nZXRNeGNBdmF0YXJVcmwoKSAhPT0gcHJldkV2ZW50LnNlbmRlci5nZXRNeGNBdmF0YXJVcmwoKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gaWYgd2UgZG9uJ3QgaGF2ZSB0aWxlIGZvciBwcmV2aW91cyBldmVudCB0aGVuIGl0IHdhcyBzaG93biBieSBzaG93SGlkZGVuRXZlbnRzIGFuZCBoYXMgbm8gU2VuZGVyUHJvZmlsZVxuICAgIGlmICghaGF2ZVRpbGVGb3JFdmVudChwcmV2RXZlbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuY29uc3QgaXNNZW1iZXJzaGlwQ2hhbmdlID0gKGUpID0+IGUuZ2V0VHlwZSgpID09PSAnbS5yb29tLm1lbWJlcicgfHwgZS5nZXRUeXBlKCkgPT09ICdtLnJvb20udGhpcmRfcGFydHlfaW52aXRlJztcblxuLyogKGFsbW9zdCkgc3RhdGVsZXNzIFVJIGNvbXBvbmVudCB3aGljaCBidWlsZHMgdGhlIGV2ZW50IHRpbGVzIGluIHRoZSByb29tIHRpbWVsaW5lLlxuICovXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJzdHJ1Y3R1cmVzLk1lc3NhZ2VQYW5lbFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzc2FnZVBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyB0cnVlIHRvIGdpdmUgdGhlIGNvbXBvbmVudCBhICdkaXNwbGF5OiBub25lJyBzdHlsZS5cbiAgICAgICAgaGlkZGVuOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB0cnVlIHRvIHNob3cgYSBzcGlubmVyIGF0IHRoZSB0b3Agb2YgdGhlIHRpbWVsaW5lIHRvIGluZGljYXRlXG4gICAgICAgIC8vIGJhY2stcGFnaW5hdGlvbiBpbiBwcm9ncmVzc1xuICAgICAgICBiYWNrUGFnaW5hdGluZzogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLy8gdHJ1ZSB0byBzaG93IGEgc3Bpbm5lciBhdCB0aGUgZW5kIG9mIHRoZSB0aW1lbGluZSB0byBpbmRpY2F0ZVxuICAgICAgICAvLyBmb3J3YXJkLXBhZ2luYXRpb24gaW4gcHJvZ3Jlc3NcbiAgICAgICAgZm9yd2FyZFBhZ2luYXRpbmc6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIHRoZSBsaXN0IG9mIE1hdHJpeEV2ZW50cyB0byBkaXNwbGF5XG4gICAgICAgIGV2ZW50czogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG5cbiAgICAgICAgLy8gSUQgb2YgYW4gZXZlbnQgdG8gaGlnaGxpZ2h0LiBJZiB1bmRlZmluZWQsIG5vIGV2ZW50IHdpbGwgYmUgaGlnaGxpZ2h0ZWQuXG4gICAgICAgIGhpZ2hsaWdodGVkRXZlbnRJZDogUHJvcFR5cGVzLnN0cmluZyxcblxuICAgICAgICAvLyBUaGUgcm9vbSB0aGVzZSBldmVudHMgYXJlIGFsbCBpbiB0b2dldGhlciwgaWYgYW55LlxuICAgICAgICAvLyAoVGhlIG5vdGlmaWNhdGlvbiBwYW5lbCB3b24ndCBoYXZlIGEgcm9vbSBoZXJlLCBmb3IgZXhhbXBsZS4pXG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICAgICAgLy8gU2hvdWxkIHdlIHNob3cgVVJMIFByZXZpZXdzXG4gICAgICAgIHNob3dVcmxQcmV2aWV3OiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyBldmVudCBhZnRlciB3aGljaCB3ZSBzaG91bGQgc2hvdyBhIHJlYWQgbWFya2VyXG4gICAgICAgIHJlYWRNYXJrZXJFdmVudElkOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIHdoZXRoZXIgdGhlIHJlYWQgbWFya2VyIHNob3VsZCBiZSB2aXNpYmxlXG4gICAgICAgIHJlYWRNYXJrZXJWaXNpYmxlOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB0aGUgdXNlcmlkIG9mIG91ciB1c2VyLiBUaGlzIGlzIHVzZWQgdG8gc3VwcHJlc3MgdGhlIHJlYWQgbWFya2VyXG4gICAgICAgIC8vIGZvciBwZW5kaW5nIG1lc3NhZ2VzLlxuICAgICAgICBvdXJVc2VySWQ6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLy8gdHJ1ZSB0byBzdXBwcmVzcyB0aGUgZGF0ZSBhdCB0aGUgc3RhcnQgb2YgdGhlIHRpbWVsaW5lXG4gICAgICAgIHN1cHByZXNzRmlyc3REYXRlU2VwYXJhdG9yOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB3aGV0aGVyIHRvIHNob3cgcmVhZCByZWNlaXB0c1xuICAgICAgICBzaG93UmVhZFJlY2VpcHRzOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB0cnVlIGlmIHVwZGF0ZXMgdG8gdGhlIGV2ZW50IGxpc3Qgc2hvdWxkIGNhdXNlIHRoZSBzY3JvbGwgcGFuZWwgdG9cbiAgICAgICAgLy8gc2Nyb2xsIGRvd24gd2hlbiB3ZSBhcmUgYXQgdGhlIGJvdHRvbSBvZiB0aGUgd2luZG93LiBTZWUgU2Nyb2xsUGFuZWxcbiAgICAgICAgLy8gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgICAgc3RpY2t5Qm90dG9tOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGUgcGFuZWwgaXMgc2Nyb2xsZWQuXG4gICAgICAgIG9uU2Nyb2xsOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiBtb3JlIGNvbnRlbnQgaXMgbmVlZGVkLlxuICAgICAgICBvbkZpbGxSZXF1ZXN0OiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyBjbGFzc05hbWUgZm9yIHRoZSBwYW5lbFxuICAgICAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblxuICAgICAgICAvLyBzaGFwZSBwYXJhbWV0ZXIgdG8gYmUgcGFzc2VkIHRvIEV2ZW50VGlsZXNcbiAgICAgICAgdGlsZVNoYXBlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIHNob3cgdHdlbHZlIGhvdXIgdGltZXN0YW1wc1xuICAgICAgICBpc1R3ZWx2ZUhvdXI6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIHNob3cgdGltZXN0YW1wcyBhbHdheXNcbiAgICAgICAgYWx3YXlzU2hvd1RpbWVzdGFtcHM6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIGhlbHBlciBmdW5jdGlvbiB0byBhY2Nlc3MgcmVsYXRpb25zIGZvciBhbiBldmVudFxuICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLy8gd2hldGhlciB0byBzaG93IHJlYWN0aW9ucyBmb3IgYW4gZXZlbnRcbiAgICAgICAgc2hvd1JlYWN0aW9uczogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLy8gd2hpY2ggbGF5b3V0IHRvIHVzZVxuICAgICAgICBsYXlvdXQ6IExheW91dFByb3BUeXBlLFxuXG4gICAgICAgIC8vIHdoZXRoZXIgb3Igbm90IHRvIHNob3cgZmxhaXIgYXQgYWxsXG4gICAgICAgIGVuYWJsZUZsYWlyOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAvLyBwcmV2aW91cyBwb3NpdGlvbnMgdGhlIHJlYWQgbWFya2VyIGhhcyBiZWVuIGluLCBzbyB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGRpc3BsYXkgJ2dob3N0JyByZWFkIG1hcmtlcnMgdGhhdCBhcmUgYW5pbWF0aW5nIGF3YXlcbiAgICAgICAgICAgIGdob3N0UmVhZE1hcmtlcnM6IFtdLFxuICAgICAgICAgICAgc2hvd1R5cGluZ05vdGlmaWNhdGlvbnM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93VHlwaW5nTm90aWZpY2F0aW9uc1wiKSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBvcGFxdWUgcmVhZHJlY2VpcHQgaW5mbyBmb3IgZWFjaCB1c2VySWQ7IHVzZWQgYnkgUmVhZFJlY2VpcHRNYXJrZXJcbiAgICAgICAgLy8gdG8gbWFuYWdlIGl0cyBhbmltYXRpb25zXG4gICAgICAgIHRoaXMuX3JlYWRSZWNlaXB0TWFwID0ge307XG5cbiAgICAgICAgLy8gVHJhY2sgcmVhZCByZWNlaXB0cyBieSBldmVudCBJRC4gRm9yIGVhY2ggX3Nob3duXyBldmVudCBJRCwgd2Ugc3RvcmVcbiAgICAgICAgLy8gdGhlIGxpc3Qgb2YgcmVhZCByZWNlaXB0cyB0byBkaXNwbGF5OlxuICAgICAgICAvLyAgIFtcbiAgICAgICAgLy8gICAgICAge1xuICAgICAgICAvLyAgICAgICAgICAgdXNlcklkOiBzdHJpbmcsXG4gICAgICAgIC8vICAgICAgICAgICBtZW1iZXI6IFJvb21NZW1iZXIsXG4gICAgICAgIC8vICAgICAgICAgICB0czogbnVtYmVyLFxuICAgICAgICAvLyAgICAgICB9LFxuICAgICAgICAvLyAgIF1cbiAgICAgICAgLy8gVGhpcyBpcyByZWNvbXB1dGVkIG9uIGVhY2ggcmVuZGVyLiBJdCdzIG9ubHkgc3RvcmVkIG9uIHRoZSBjb21wb25lbnRcbiAgICAgICAgLy8gZm9yIGVhc2Ugb2YgcGFzc2luZyB0aGUgZGF0YSBhcm91bmQgc2luY2UgaXQncyBjb21wdXRlZCBpbiBvbmUgcGFzc1xuICAgICAgICAvLyBvdmVyIGFsbCBldmVudHMuXG4gICAgICAgIHRoaXMuX3JlYWRSZWNlaXB0c0J5RXZlbnQgPSB7fTtcblxuICAgICAgICAvLyBUcmFjayByZWFkIHJlY2VpcHRzIGJ5IHVzZXIgSUQuIEZvciBlYWNoIHVzZXIgSUQgd2UndmUgZXZlciBzaG93biBhXG4gICAgICAgIC8vIGEgcmVhZCByZWNlaXB0IGZvciwgd2Ugc3RvcmUgYW4gb2JqZWN0OlxuICAgICAgICAvLyAgIHtcbiAgICAgICAgLy8gICAgICAgbGFzdFNob3duRXZlbnRJZDogc3RyaW5nLFxuICAgICAgICAvLyAgICAgICByZWNlaXB0OiB7XG4gICAgICAgIC8vICAgICAgICAgICB1c2VySWQ6IHN0cmluZyxcbiAgICAgICAgLy8gICAgICAgICAgIG1lbWJlcjogUm9vbU1lbWJlcixcbiAgICAgICAgLy8gICAgICAgICAgIHRzOiBudW1iZXIsXG4gICAgICAgIC8vICAgICAgIH0sXG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyBzbyB0aGF0IHdlIGNhbiBhbHdheXMga2VlcCByZWNlaXB0cyBkaXNwbGF5ZWQgYnkgcmV2ZXJ0aW5nIGJhY2sgdG9cbiAgICAgICAgLy8gdGhlIGxhc3Qgc2hvd24gZXZlbnQgZm9yIHRoYXQgdXNlciBJRCB3aGVuIG5lZWRlZC4gVGhpcyBtYXkgZmVlbCBsaWtlXG4gICAgICAgIC8vIGl0IGR1cGxpY2F0ZXMgdGhlIHJlY2VpcHQgc3RvcmFnZSBpbiB0aGUgcm9vbSwgYnV0IGF0IHRoaXMgbGF5ZXIsIHdlXG4gICAgICAgIC8vIGFyZSB0cmFja2luZyBfc2hvd25fIGV2ZW50IElEcywgd2hpY2ggdGhlIEpTIFNESyBrbm93cyBub3RoaW5nIGFib3V0LlxuICAgICAgICAvLyBUaGlzIGlzIHJlY29tcHV0ZWQgb24gZWFjaCByZW5kZXIsIHVzaW5nIHRoZSBkYXRhIGZyb20gdGhlIHByZXZpb3VzXG4gICAgICAgIC8vIHJlbmRlciBhcyBvdXIgZmFsbGJhY2sgZm9yIGFueSB1c2VyIElEcyB3ZSBjYW4ndCBtYXRjaCBhIHJlY2VpcHQgdG8gYVxuICAgICAgICAvLyBkaXNwbGF5ZWQgZXZlbnQgaW4gdGhlIGN1cnJlbnQgcmVuZGVyIGN5Y2xlLlxuICAgICAgICB0aGlzLl9yZWFkUmVjZWlwdHNCeVVzZXJJZCA9IHt9O1xuXG4gICAgICAgIC8vIENhY2hlIGhpZGRlbiBldmVudHMgc2V0dGluZyBvbiBtb3VudCBzaW5jZSBTZXR0aW5ncyBpcyBleHBlbnNpdmUgdG9cbiAgICAgICAgLy8gcXVlcnksIGFuZCB3ZSBjaGVjayB0aGlzIGluIGEgaG90IGNvZGUgcGF0aC5cbiAgICAgICAgdGhpcy5fc2hvd0hpZGRlbkV2ZW50c0luVGltZWxpbmUgPVxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dIaWRkZW5FdmVudHNJblRpbWVsaW5lXCIpO1xuXG4gICAgICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX3JlYWRNYXJrZXJOb2RlID0gY3JlYXRlUmVmKCk7XG4gICAgICAgIHRoaXMuX3dob0lzVHlwaW5nID0gY3JlYXRlUmVmKCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbFBhbmVsID0gY3JlYXRlUmVmKCk7XG5cbiAgICAgICAgdGhpcy5fc2hvd1R5cGluZ05vdGlmaWNhdGlvbnNXYXRjaGVyUmVmID1cbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwic2hvd1R5cGluZ05vdGlmaWNhdGlvbnNcIiwgbnVsbCwgdGhpcy5vblNob3dUeXBpbmdOb3RpZmljYXRpb25zQ2hhbmdlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5fc2hvd1R5cGluZ05vdGlmaWNhdGlvbnNXYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICAgICAgaWYgKHByZXZQcm9wcy5yZWFkTWFya2VyVmlzaWJsZSAmJiB0aGlzLnByb3BzLnJlYWRNYXJrZXJFdmVudElkICE9PSBwcmV2UHJvcHMucmVhZE1hcmtlckV2ZW50SWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGdob3N0UmVhZE1hcmtlcnMgPSB0aGlzLnN0YXRlLmdob3N0UmVhZE1hcmtlcnM7XG4gICAgICAgICAgICBnaG9zdFJlYWRNYXJrZXJzLnB1c2gocHJldlByb3BzLnJlYWRNYXJrZXJFdmVudElkKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGdob3N0UmVhZE1hcmtlcnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uU2hvd1R5cGluZ05vdGlmaWNhdGlvbnNDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd1R5cGluZ05vdGlmaWNhdGlvbnM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93VHlwaW5nTm90aWZpY2F0aW9uc1wiKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qIGdldCB0aGUgRE9NIG5vZGUgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiBldmVudCAqL1xuICAgIGdldE5vZGVGb3JFdmVudElkKGV2ZW50SWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50Tm9kZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudE5vZGVzW2V2ZW50SWRdO1xuICAgIH1cblxuICAgIC8qIHJldHVybiB0cnVlIGlmIHRoZSBjb250ZW50IGlzIGZ1bGx5IHNjcm9sbGVkIGRvd24gcmlnaHQgbm93OyBlbHNlIGZhbHNlLlxuICAgICAqL1xuICAgIGlzQXRCb3R0b20oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50ICYmIHRoaXMuX3Njcm9sbFBhbmVsLmN1cnJlbnQuaXNBdEJvdHRvbSgpO1xuICAgIH1cblxuICAgIC8qIGdldCB0aGUgY3VycmVudCBzY3JvbGwgc3RhdGUuIFNlZSBTY3JvbGxQYW5lbC5nZXRTY3JvbGxTdGF0ZSBmb3JcbiAgICAgKiBkZXRhaWxzLlxuICAgICAqXG4gICAgICogcmV0dXJucyBudWxsIGlmIHdlIGFyZSBub3QgbW91bnRlZC5cbiAgICAgKi9cbiAgICBnZXRTY3JvbGxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbFBhbmVsLmN1cnJlbnQgPyB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50LmdldFNjcm9sbFN0YXRlKCkgOiBudWxsO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgb25lIG9mOlxuICAgIC8vXG4gICAgLy8gIG51bGw6IHRoZXJlIGlzIG5vIHJlYWQgbWFya2VyXG4gICAgLy8gIC0xOiByZWFkIG1hcmtlciBpcyBhYm92ZSB0aGUgd2luZG93XG4gICAgLy8gICAwOiByZWFkIG1hcmtlciBpcyB3aXRoaW4gdGhlIHdpbmRvd1xuICAgIC8vICArMTogcmVhZCBtYXJrZXIgaXMgYmVsb3cgdGhlIHdpbmRvd1xuICAgIGdldFJlYWRNYXJrZXJQb3NpdGlvbigpIHtcbiAgICAgICAgY29uc3QgcmVhZE1hcmtlciA9IHRoaXMuX3JlYWRNYXJrZXJOb2RlLmN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VXcmFwcGVyID0gdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudDtcblxuICAgICAgICBpZiAoIXJlYWRNYXJrZXIgfHwgIW1lc3NhZ2VXcmFwcGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdyYXBwZXJSZWN0ID0gUmVhY3RET00uZmluZERPTU5vZGUobWVzc2FnZVdyYXBwZXIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCByZWFkTWFya2VyUmVjdCA9IHJlYWRNYXJrZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgLy8gdGhlIHJlYWQtbWFya2VyIHByZXRlbmRzIHRvIGhhdmUgemVybyBoZWlnaHQgd2hlbiBpdCBpcyBhY3R1YWxseVxuICAgICAgICAvLyB0d28gcGl4ZWxzIGhpZ2g7ICsyIGhlcmUgdG8gYWNjb3VudCBmb3IgdGhhdC5cbiAgICAgICAgaWYgKHJlYWRNYXJrZXJSZWN0LmJvdHRvbSArIDIgPCB3cmFwcGVyUmVjdC50b3ApIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChyZWFkTWFya2VyUmVjdC50b3AgPCB3cmFwcGVyUmVjdC5ib3R0b20pIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIGNvbnRlbnQuXG4gICAgICovXG4gICAgc2Nyb2xsVG9Ub3AoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50LnNjcm9sbFRvVG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBqdW1wIHRvIHRoZSBib3R0b20gb2YgdGhlIGNvbnRlbnQuXG4gICAgICovXG4gICAgc2Nyb2xsVG9Cb3R0b20oKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50LnNjcm9sbFRvQm90dG9tKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYWdlIHVwL2Rvd24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbXVsdDogLTEgdG8gcGFnZSB1cCwgKzEgdG8gcGFnZSBkb3duXG4gICAgICovXG4gICAgc2Nyb2xsUmVsYXRpdmUobXVsdCkge1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudC5zY3JvbGxSZWxhdGl2ZShtdWx0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNjcm9sbCB1cC9kb3duIGluIHJlc3BvbnNlIHRvIGEgc2Nyb2xsIGtleVxuICAgICAqXG4gICAgICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldjogdGhlIGtleWJvYXJkIGV2ZW50IHRvIGhhbmRsZVxuICAgICAqL1xuICAgIGhhbmRsZVNjcm9sbEtleShldikge1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudC5oYW5kbGVTY3JvbGxLZXkoZXYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoganVtcCB0byB0aGUgZ2l2ZW4gZXZlbnQgaWQuXG4gICAgICpcbiAgICAgKiBvZmZzZXRCYXNlIGdpdmVzIHRoZSByZWZlcmVuY2UgcG9pbnQgZm9yIHRoZSBwaXhlbE9mZnNldC4gMCBtZWFucyB0aGVcbiAgICAgKiB0b3Agb2YgdGhlIGNvbnRhaW5lciwgMSBtZWFucyB0aGUgYm90dG9tLCBhbmQgZnJhY3Rpb25hbCB2YWx1ZXMgbWVhblxuICAgICAqIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlLiBJZiBvbWl0dGVkLCBpdCBkZWZhdWx0cyB0byAwLlxuICAgICAqXG4gICAgICogcGl4ZWxPZmZzZXQgZ2l2ZXMgdGhlIG51bWJlciBvZiBwaXhlbHMgKmFib3ZlKiB0aGUgb2Zmc2V0QmFzZSB0aGF0IHRoZVxuICAgICAqIG5vZGUgKHNwZWNpZmljYWxseSwgdGhlIGJvdHRvbSBvZiBpdCkgd2lsbCBiZSBwb3NpdGlvbmVkLiBJZiBvbWl0dGVkLCBpdFxuICAgICAqIGRlZmF1bHRzIHRvIDAuXG4gICAgICovXG4gICAgc2Nyb2xsVG9FdmVudChldmVudElkLCBwaXhlbE9mZnNldCwgb2Zmc2V0QmFzZSkge1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudC5zY3JvbGxUb1Rva2VuKGV2ZW50SWQsIHBpeGVsT2Zmc2V0LCBvZmZzZXRCYXNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNjcm9sbFRvRXZlbnRJZk5lZWRlZChldmVudElkKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmV2ZW50Tm9kZXNbZXZlbnRJZF07XG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICBub2RlLnNjcm9sbEludG9WaWV3KHtibG9jazogXCJuZWFyZXN0XCIsIGJlaGF2aW9yOiBcImluc3RhbnRcIn0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogY2hlY2sgdGhlIHNjcm9sbCBzdGF0ZSBhbmQgc2VuZCBvdXQgcGFnaW5hdGlvbiByZXF1ZXN0cyBpZiBuZWNlc3NhcnkuXG4gICAgICovXG4gICAgY2hlY2tGaWxsU3RhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50LmNoZWNrRmlsbFN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfaXNVbm1vdW50aW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gIXRoaXMuX2lzTW91bnRlZDtcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogSW1wbGVtZW50IGdyYW51bGFyIChwZXItcm9vbSkgaGlkZSBvcHRpb25zXG4gICAgX3Nob3VsZFNob3dFdmVudChteEV2KSB7XG4gICAgICAgIGlmIChteEV2LnNlbmRlciAmJiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNVc2VySWdub3JlZChteEV2LnNlbmRlci51c2VySWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIGlnbm9yZWQgPSBubyBzaG93IChvbmx5IGhhcHBlbnMgaWYgdGhlIGlnbm9yZSBoYXBwZW5zIGFmdGVyIGFuIGV2ZW50IHdhcyByZWNlaXZlZClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9zaG93SGlkZGVuRXZlbnRzSW5UaW1lbGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhdmVUaWxlRm9yRXZlbnQobXhFdikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gbm8gdGlsZSA9IG5vIHNob3dcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsd2F5cyBzaG93IGhpZ2hsaWdodGVkIGV2ZW50XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmhpZ2hsaWdodGVkRXZlbnRJZCA9PT0gbXhFdi5nZXRJZCgpKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gIXNob3VsZEhpZGVFdmVudChteEV2KTtcbiAgICB9XG5cbiAgICBfcmVhZE1hcmtlckZvckV2ZW50KGV2ZW50SWQsIGlzTGFzdEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHZpc2libGUgPSAhaXNMYXN0RXZlbnQgJiYgdGhpcy5wcm9wcy5yZWFkTWFya2VyVmlzaWJsZTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWFkTWFya2VyRXZlbnRJZCA9PT0gZXZlbnRJZCkge1xuICAgICAgICAgICAgbGV0IGhyO1xuICAgICAgICAgICAgLy8gaWYgdGhlIHJlYWQgbWFya2VyIGNvbWVzIGF0IHRoZSBlbmQgb2YgdGhlIHRpbWVsaW5lIChleGNlcHRcbiAgICAgICAgICAgIC8vIGZvciBsb2NhbCBlY2hvZXMsIHdoaWNoIGFyZSBleGNsdWRlZCBmcm9tIFJNcywgYmVjYXVzZSB0aGV5XG4gICAgICAgICAgICAvLyBkb24ndCBoYXZlIHVzZWZ1bCBldmVudCBpZHMpLCB3ZSBkb24ndCB3YW50IHRvIHNob3cgaXQsIGJ1dFxuICAgICAgICAgICAgLy8gd2Ugc3RpbGwgd2FudCB0byBjcmVhdGUgdGhlIDxsaS8+IGZvciBpdCBzbyB0aGF0IHRoZVxuICAgICAgICAgICAgLy8gYWxnb3JpdGhtcyB3aGljaCBkZXBlbmQgb24gaXRzIHBvc2l0aW9uIG9uIHRoZSBzY3JlZW4gYXJlbid0XG4gICAgICAgICAgICAvLyBjb25mdXNlZC5cbiAgICAgICAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgaHIgPSA8aHIgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfbXlSZWFkTWFya2VyXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tvcGFjaXR5OiAxLCB3aWR0aDogJzk5JSd9fVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxsaSBrZXk9e1wicmVhZE1hcmtlcl9cIitldmVudElkfVxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuX3JlYWRNYXJrZXJOb2RlfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tVmlld19teVJlYWRNYXJrZXJfY29udGFpbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1zY3JvbGwtdG9rZW5zPXtldmVudElkfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBociB9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5naG9zdFJlYWRNYXJrZXJzLmluY2x1ZGVzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAvLyBXZSByZW5kZXIgJ2dob3N0JyByZWFkIG1hcmtlcnMgaW4gdGhlIERPTSB3aGlsZSB0aGV5XG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uIGF3YXkuIFRoaXMgYWxsb3dzIHRoZSBhY3R1YWwgcmVhZCBtYXJrZXJcbiAgICAgICAgICAgIC8vIHRvIGJlIGluIHRoZSByaWdodCBwbGFjZSBzdHJhaWdodCBhd2F5IHdpdGhvdXQgaGF2aW5nXG4gICAgICAgICAgICAvLyB0byB3YWl0IGZvciB0aGUgdHJhbnNpdGlvbiB0byBmaW5pc2guXG4gICAgICAgICAgICAvLyBUaGVyZSBhcmUgcHJvYmFibHkgbXVjaCBzaW1wbGVyIHdheXMgdG8gZG8gdGhpcyB0cmFuc2l0aW9uLFxuICAgICAgICAgICAgLy8gcG9zc2libHkgdXNpbmcgcmVhY3QtdHJhbnNpdGlvbi1ncm91cCB3aGljaCBoYW5kbGVzIGtlZXBpbmdcbiAgICAgICAgICAgIC8vIGVsZW1lbnRzIGluIHRoZSBET00gd2hpbHN0IHRoZXkgdHJhbnNpdGlvbiBvdXQsIGFsdGhvdWdoIG91clxuICAgICAgICAgICAgLy8gY2FzZSBpcyBhIGxpdHRsZSBtb3JlIGNvbXBsZXggYmVjYXVzZSBvbmx5IHNvbWUgb2YgdGhlIGl0ZW1zXG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uIChpZS4gdGhlIHJlYWQgbWFya2VycyBkbyBidXQgdGhlIGV2ZW50IHRpbGVzIGRvIG5vdClcbiAgICAgICAgICAgIC8vIGFuZCBUcmFuc2l0aW9uR3JvdXAgcmVxdWlyZXMgdGhhdCBhbGwgaXRzIGNoaWxkcmVuIGFyZSBUcmFuc2l0aW9ucy5cbiAgICAgICAgICAgIGNvbnN0IGhyID0gPGhyIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X215UmVhZE1hcmtlclwiXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9jb2xsZWN0R2hvc3RSZWFkTWFya2VyfVxuICAgICAgICAgICAgICAgIG9uVHJhbnNpdGlvbkVuZD17dGhpcy5fb25HaG9zdFRyYW5zaXRpb25FbmR9XG4gICAgICAgICAgICAgICAgZGF0YS1ldmVudGlkPXtldmVudElkfVxuICAgICAgICAgICAgLz47XG5cbiAgICAgICAgICAgIC8vIGdpdmUgaXQgYSBrZXkgd2hpY2ggZGVwZW5kcyBvbiB0aGUgZXZlbnQgaWQuIFRoYXQgd2lsbCBlbnN1cmUgdGhhdFxuICAgICAgICAgICAgLy8gd2UgZ2V0IGEgbmV3IERPTSBub2RlIChyZXN0YXJ0aW5nIHRoZSBhbmltYXRpb24pIHdoZW4gdGhlIGdob3N0XG4gICAgICAgICAgICAvLyBtb3ZlcyB0byBhIGRpZmZlcmVudCBldmVudC5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGxpXG4gICAgICAgICAgICAgICAgICAgIGtleT17XCJfcmVhZHVwdG9naG9zdF9cIitldmVudElkfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tVmlld19teVJlYWRNYXJrZXJfY29udGFpbmVyXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgaHIgfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgX2NvbGxlY3RHaG9zdFJlYWRNYXJrZXIgPSAobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgLy8gbm93IHRoZSBlbGVtZW50IGhhcyBhcHBlYXJlZCwgY2hhbmdlIHRoZSBzdHlsZSB3aGljaCB3aWxsIHRyaWdnZXIgdGhlIENTUyB0cmFuc2l0aW9uXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG5vZGUuc3R5bGUud2lkdGggPSAnMTAlJztcbiAgICAgICAgICAgICAgICBub2RlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25HaG9zdFRyYW5zaXRpb25FbmQgPSAoZXYpID0+IHtcbiAgICAgICAgLy8gd2UgY2FuIG5vdyBjbGVhbiB1cCB0aGUgZ2hvc3QgZWxlbWVudFxuICAgICAgICBjb25zdCBmaW5pc2hlZEV2ZW50SWQgPSBldi50YXJnZXQuZGF0YXNldC5ldmVudGlkO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdob3N0UmVhZE1hcmtlcnM6IHRoaXMuc3RhdGUuZ2hvc3RSZWFkTWFya2Vycy5maWx0ZXIoZWlkID0+IGVpZCAhPT0gZmluaXNoZWRFdmVudElkKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9nZXROZXh0RXZlbnRJbmZvKGFyciwgaSkge1xuICAgICAgICBjb25zdCBuZXh0RXZlbnQgPSBpIDwgYXJyLmxlbmd0aCAtIDFcbiAgICAgICAgICAgID8gYXJyW2kgKyAxXVxuICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIC8vIFRoZSBuZXh0IGV2ZW50IHdpdGggdGlsZSBpcyB1c2VkIHRvIHRvIGRldGVybWluZSB0aGUgJ2xhc3Qgc3VjY2Vzc2Z1bCcgZmxhZ1xuICAgICAgICAvLyB3aGVuIHJlbmRlcmluZyB0aGUgdGlsZS4gVGhlIHNob3VsZFNob3dFdmVudCBmdW5jdGlvbiBpcyBwcmV0dHkgcXVpY2sgYXQgd2hhdFxuICAgICAgICAvLyBpdCBkb2VzLCBzbyB0aGlzIHNob3VsZCBoYXZlIG5vIHNpZ25pZmljYW50IGNvc3QgZXZlbiB3aGVuIGEgcm9vbSBpcyB1c2VkIGZvclxuICAgICAgICAvLyBub3QtY2hhdCBwdXJwb3Nlcy5cbiAgICAgICAgY29uc3QgbmV4dFRpbGUgPSBhcnIuc2xpY2UoaSArIDEpLmZpbmQoZSA9PiB0aGlzLl9zaG91bGRTaG93RXZlbnQoZSkpO1xuXG4gICAgICAgIHJldHVybiB7bmV4dEV2ZW50LCBuZXh0VGlsZX07XG4gICAgfVxuXG4gICAgX2dldEV2ZW50VGlsZXMoKSB7XG4gICAgICAgIHRoaXMuZXZlbnROb2RlcyA9IHt9O1xuXG4gICAgICAgIGxldCBpO1xuXG4gICAgICAgIC8vIGZpcnN0IGZpZ3VyZSBvdXQgd2hpY2ggaXMgdGhlIGxhc3QgZXZlbnQgaW4gdGhlIGxpc3Qgd2hpY2ggd2UncmVcbiAgICAgICAgLy8gYWN0dWFsbHkgZ29pbmcgdG8gc2hvdzsgdGhpcyBhbGxvd3MgdXMgdG8gYmVoYXZlIHNsaWdodGx5XG4gICAgICAgIC8vIGRpZmZlcmVudGx5IGZvciB0aGUgbGFzdCBldmVudCBpbiB0aGUgbGlzdC4gKGVnIHNob3cgdGltZXN0YW1wKVxuICAgICAgICAvL1xuICAgICAgICAvLyB3ZSBhbHNvIG5lZWQgdG8gZmlndXJlIG91dCB3aGljaCBpcyB0aGUgbGFzdCBldmVudCB3ZSBzaG93IHdoaWNoIGlzbid0XG4gICAgICAgIC8vIGEgbG9jYWwgZWNobywgdG8gbWFuYWdlIHRoZSByZWFkLW1hcmtlci5cbiAgICAgICAgbGV0IGxhc3RTaG93bkV2ZW50O1xuXG4gICAgICAgIGxldCBsYXN0U2hvd25Ob25Mb2NhbEVjaG9JbmRleCA9IC0xO1xuICAgICAgICBmb3IgKGkgPSB0aGlzLnByb3BzLmV2ZW50cy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IG14RXYgPSB0aGlzLnByb3BzLmV2ZW50c1tpXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fc2hvdWxkU2hvd0V2ZW50KG14RXYpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYXN0U2hvd25FdmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGFzdFNob3duRXZlbnQgPSBteEV2O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobXhFdi5zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGEgbG9jYWwgZWNob1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXN0U2hvd25Ob25Mb2NhbEVjaG9JbmRleCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuXG4gICAgICAgIGxldCBwcmV2RXZlbnQgPSBudWxsOyAvLyB0aGUgbGFzdCBldmVudCB3ZSBzaG93ZWRcblxuICAgICAgICAvLyBOb3RlOiB0aGUgRXZlbnRUaWxlIG1pZ2h0IHN0aWxsIHJlbmRlciBhIFwic2VudC9zZW5kaW5nIHJlY2VpcHRcIiBpbmRlcGVuZGVudCBvZlxuICAgICAgICAvLyB0aGlzIGluZm9ybWF0aW9uLiBXaGVuIG5vdCBwcm92aWRpbmcgcmVhZCByZWNlaXB0IGluZm9ybWF0aW9uLCB0aGUgdGlsZSBpcyBsaWtlbHlcbiAgICAgICAgLy8gdG8gYXNzdW1lIHRoYXQgc2VudCByZWNlaXB0cyBhcmUgdG8gYmUgc2hvd24gbW9yZSBvZnRlbi5cbiAgICAgICAgdGhpcy5fcmVhZFJlY2VpcHRzQnlFdmVudCA9IHt9O1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93UmVhZFJlY2VpcHRzKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWFkUmVjZWlwdHNCeUV2ZW50ID0gdGhpcy5fZ2V0UmVhZFJlY2VpcHRzQnlTaG93bkV2ZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZ3JvdXBlciA9IG51bGw7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMucHJvcHMuZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBteEV2ID0gdGhpcy5wcm9wcy5ldmVudHNbaV07XG4gICAgICAgICAgICBjb25zdCBldmVudElkID0gbXhFdi5nZXRJZCgpO1xuICAgICAgICAgICAgY29uc3QgbGFzdCA9IChteEV2ID09PSBsYXN0U2hvd25FdmVudCk7XG4gICAgICAgICAgICBjb25zdCB7bmV4dEV2ZW50LCBuZXh0VGlsZX0gPSB0aGlzLl9nZXROZXh0RXZlbnRJbmZvKHRoaXMucHJvcHMuZXZlbnRzLCBpKTtcblxuICAgICAgICAgICAgaWYgKGdyb3VwZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBlci5zaG91bGRHcm91cChteEV2KSkge1xuICAgICAgICAgICAgICAgICAgICBncm91cGVyLmFkZChteEV2KTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90IHBhcnQgb2YgZ3JvdXAsIHNvIGdldCB0aGUgZ3JvdXAgdGlsZXMsIGNsb3NlIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBncm91cCwgYW5kIGNvbnRpbnVlIGxpa2UgYSBub3JtYWwgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goLi4uZ3JvdXBlci5nZXRUaWxlcygpKTtcbiAgICAgICAgICAgICAgICAgICAgcHJldkV2ZW50ID0gZ3JvdXBlci5nZXROZXdQcmV2RXZlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IEdyb3VwZXIgb2YgZ3JvdXBlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoR3JvdXBlci5jYW5TdGFydEdyb3VwKHRoaXMsIG14RXYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwZXIgPSBuZXcgR3JvdXBlcih0aGlzLCBteEV2LCBwcmV2RXZlbnQsIGxhc3RTaG93bkV2ZW50LCBuZXh0RXZlbnQsIG5leHRUaWxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWdyb3VwZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YW50VGlsZSA9IHRoaXMuX3Nob3VsZFNob3dFdmVudChteEV2KTtcbiAgICAgICAgICAgICAgICBpZiAod2FudFRpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIHVucGFjayB0aGUgYXJyYXkgcmV0dXJuZWQgYnkgX2dldFRpbGVzRm9yRXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSByZWFjdCB3aWxsIGF1dG8tZ2VuZXJhdGUga2V5cyBhbmQgd2Ugd2lsbCBlbmQgdXBcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVwbGFjaW5nIGFsbCBvZiB0aGUgRE9NIGVsZW1lbnRzIGV2ZXJ5IHRpbWUgd2UgcGFnaW5hdGUuXG4gICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKC4uLnRoaXMuX2dldFRpbGVzRm9yRXZlbnQocHJldkV2ZW50LCBteEV2LCBsYXN0LCBuZXh0RXZlbnQsIG5leHRUaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgIHByZXZFdmVudCA9IG14RXY7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVhZE1hcmtlciA9IHRoaXMuX3JlYWRNYXJrZXJGb3JFdmVudChldmVudElkLCBpID49IGxhc3RTaG93bk5vbkxvY2FsRWNob0luZGV4KTtcbiAgICAgICAgICAgICAgICBpZiAocmVhZE1hcmtlcikgcmV0LnB1c2gocmVhZE1hcmtlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ3JvdXBlcikge1xuICAgICAgICAgICAgcmV0LnB1c2goLi4uZ3JvdXBlci5nZXRUaWxlcygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgX2dldFRpbGVzRm9yRXZlbnQocHJldkV2ZW50LCBteEV2LCBsYXN0LCBuZXh0RXZlbnQsIG5leHRFdmVudFdpdGhUaWxlKSB7XG4gICAgICAgIGNvbnN0IFRpbGVFcnJvckJvdW5kYXJ5ID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuVGlsZUVycm9yQm91bmRhcnknKTtcbiAgICAgICAgY29uc3QgRXZlbnRUaWxlID0gc2RrLmdldENvbXBvbmVudCgncm9vbXMuRXZlbnRUaWxlJyk7XG4gICAgICAgIGNvbnN0IERhdGVTZXBhcmF0b3IgPSBzZGsuZ2V0Q29tcG9uZW50KCdtZXNzYWdlcy5EYXRlU2VwYXJhdG9yJyk7XG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuXG4gICAgICAgIGNvbnN0IGlzRWRpdGluZyA9IHRoaXMucHJvcHMuZWRpdFN0YXRlICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLmVkaXRTdGF0ZS5nZXRFdmVudCgpLmdldElkKCkgPT09IG14RXYuZ2V0SWQoKTtcblxuICAgICAgICAvLyBsb2NhbCBlY2hvZXMgaGF2ZSBhIGZha2UgZGF0ZSwgd2hpY2ggY291bGQgZXZlbiBiZSB5ZXN0ZXJkYXkuIFRyZWF0IHRoZW1cbiAgICAgICAgLy8gYXMgJ3RvZGF5JyBmb3IgdGhlIGRhdGUgc2VwYXJhdG9ycy5cbiAgICAgICAgbGV0IHRzMSA9IG14RXYuZ2V0VHMoKTtcbiAgICAgICAgbGV0IGV2ZW50RGF0ZSA9IG14RXYuZ2V0RGF0ZSgpO1xuICAgICAgICBpZiAobXhFdi5zdGF0dXMpIHtcbiAgICAgICAgICAgIGV2ZW50RGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB0czEgPSBldmVudERhdGUuZ2V0VGltZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG8gd2UgbmVlZCBhIGRhdGUgc2VwYXJhdG9yIHNpbmNlIHRoZSBsYXN0IGV2ZW50P1xuICAgICAgICBjb25zdCB3YW50c0RhdGVTZXBhcmF0b3IgPSB0aGlzLl93YW50c0RhdGVTZXBhcmF0b3IocHJldkV2ZW50LCBldmVudERhdGUpO1xuICAgICAgICBpZiAod2FudHNEYXRlU2VwYXJhdG9yKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlU2VwYXJhdG9yID0gPGxpIGtleT17dHMxfT48RGF0ZVNlcGFyYXRvciBrZXk9e3RzMX0gdHM9e3RzMX0gLz48L2xpPjtcbiAgICAgICAgICAgIHJldC5wdXNoKGRhdGVTZXBhcmF0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHdpbGxXYW50RGF0ZVNlcGFyYXRvciA9IGZhbHNlO1xuICAgICAgICBpZiAobmV4dEV2ZW50KSB7XG4gICAgICAgICAgICB3aWxsV2FudERhdGVTZXBhcmF0b3IgPSB0aGlzLl93YW50c0RhdGVTZXBhcmF0b3IobXhFdiwgbmV4dEV2ZW50LmdldERhdGUoKSB8fCBuZXcgRGF0ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlzIHRoaXMgYSBjb250aW51YXRpb24gb2YgdGhlIHByZXZpb3VzIG1lc3NhZ2U/XG4gICAgICAgIGNvbnN0IGNvbnRpbnVhdGlvbiA9ICF3YW50c0RhdGVTZXBhcmF0b3IgJiYgc2hvdWxkRm9ybUNvbnRpbnVhdGlvbihwcmV2RXZlbnQsIG14RXYpO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSBteEV2LmdldElkKCk7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodCA9IChldmVudElkID09PSB0aGlzLnByb3BzLmhpZ2hsaWdodGVkRXZlbnRJZCk7XG5cbiAgICAgICAgLy8gd2UgY2FuJ3QgdXNlIGxvY2FsIGVjaG9lcyBhcyBzY3JvbGwgdG9rZW5zLCBiZWNhdXNlIHRoZWlyIGV2ZW50IElEcyBjaGFuZ2UuXG4gICAgICAgIC8vIExvY2FsIGVjaG9zIGhhdmUgYSBzZW5kIFwic3RhdHVzXCIuXG4gICAgICAgIGNvbnN0IHNjcm9sbFRva2VuID0gbXhFdi5zdGF0dXMgPyB1bmRlZmluZWQgOiBldmVudElkO1xuXG4gICAgICAgIGNvbnN0IHJlYWRSZWNlaXB0cyA9IHRoaXMuX3JlYWRSZWNlaXB0c0J5RXZlbnRbZXZlbnRJZF07XG5cbiAgICAgICAgbGV0IGlzTGFzdFN1Y2Nlc3NmdWwgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgaXNTZW50U3RhdGUgPSBzID0+ICFzIHx8IHMgPT09ICdzZW50JztcbiAgICAgICAgY29uc3QgaXNTZW50ID0gaXNTZW50U3RhdGUobXhFdi5nZXRBc3NvY2lhdGVkU3RhdHVzKCkpO1xuICAgICAgICBjb25zdCBoYXNOZXh0RXZlbnQgPSBuZXh0RXZlbnQgJiYgdGhpcy5fc2hvdWxkU2hvd0V2ZW50KG5leHRFdmVudCk7XG4gICAgICAgIGlmICghaGFzTmV4dEV2ZW50ICYmIGlzU2VudCkge1xuICAgICAgICAgICAgaXNMYXN0U3VjY2Vzc2Z1bCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzTmV4dEV2ZW50ICYmIGlzU2VudCAmJiAhaXNTZW50U3RhdGUobmV4dEV2ZW50LmdldEFzc29jaWF0ZWRTdGF0dXMoKSkpIHtcbiAgICAgICAgICAgIGlzTGFzdFN1Y2Nlc3NmdWwgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBpcyBhIGJpdCBudWFuY2VkLCBidXQgaWYgb3VyIG5leHQgZXZlbnQgaXMgaGlkZGVuIGJ1dCBhIGZ1dHVyZSBldmVudCBpcyBub3RcbiAgICAgICAgLy8gaGlkZGVuIHRoZW4gd2UncmUgbm90IHRoZSBsYXN0IHN1Y2Nlc3NmdWwuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIG5leHRFdmVudFdpdGhUaWxlICYmXG4gICAgICAgICAgICBuZXh0RXZlbnRXaXRoVGlsZSAhPT0gbmV4dEV2ZW50ICYmXG4gICAgICAgICAgICBpc1NlbnRTdGF0ZShuZXh0RXZlbnRXaXRoVGlsZS5nZXRBc3NvY2lhdGVkU3RhdHVzKCkpXG4gICAgICAgICkge1xuICAgICAgICAgICAgaXNMYXN0U3VjY2Vzc2Z1bCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2Ugb25seSB3YW50IHRvIGNvbnNpZGVyIFwibGFzdCBzdWNjZXNzZnVsXCIgaWYgdGhlIGV2ZW50IGlzIHNlbnQgYnkgdXMsIG90aGVyd2lzZSBvZiBjb3Vyc2VcbiAgICAgICAgLy8gaXQncyBzdWNjZXNzZnVsOiB3ZSByZWNlaXZlZCBpdC5cbiAgICAgICAgaXNMYXN0U3VjY2Vzc2Z1bCA9IGlzTGFzdFN1Y2Nlc3NmdWwgJiYgbXhFdi5nZXRTZW5kZXIoKSA9PT0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuXG4gICAgICAgIC8vIHVzZSB0eG5JZCBhcyBrZXkgaWYgYXZhaWxhYmxlIHNvIHRoYXQgd2UgZG9uJ3QgcmVtb3VudCBkdXJpbmcgc2VuZGluZ1xuICAgICAgICByZXQucHVzaChcbiAgICAgICAgICAgIDxsaVxuICAgICAgICAgICAgICAgIGtleT17bXhFdi5nZXRUeG5JZCgpIHx8IGV2ZW50SWR9XG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9jb2xsZWN0RXZlbnROb2RlLmJpbmQodGhpcywgZXZlbnRJZCl9XG4gICAgICAgICAgICAgICAgZGF0YS1zY3JvbGwtdG9rZW5zPXtzY3JvbGxUb2tlbn1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8VGlsZUVycm9yQm91bmRhcnkgbXhFdmVudD17bXhFdn0+XG4gICAgICAgICAgICAgICAgICAgIDxFdmVudFRpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e214RXZ9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51YXRpb249e2NvbnRpbnVhdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUmVkYWN0ZWQ9e214RXYuaXNSZWRhY3RlZCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjaW5nRXZlbnRJZD17bXhFdi5yZXBsYWNpbmdFdmVudElkKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0U3RhdGU9e2lzRWRpdGluZyAmJiB0aGlzLnByb3BzLmVkaXRTdGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17dGhpcy5fb25IZWlnaHRDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZFJlY2VpcHRzPXtyZWFkUmVjZWlwdHN9XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkUmVjZWlwdE1hcD17dGhpcy5fcmVhZFJlY2VpcHRNYXB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93VXJsUHJldmlldz17dGhpcy5wcm9wcy5zaG93VXJsUHJldmlld31cbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrVW5tb3VudGluZz17dGhpcy5faXNVbm1vdW50aW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRTZW5kU3RhdHVzPXtteEV2LmdldEFzc29jaWF0ZWRTdGF0dXMoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVTaGFwZT17dGhpcy5wcm9wcy50aWxlU2hhcGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1R3ZWx2ZUhvdXI9e3RoaXMucHJvcHMuaXNUd2VsdmVIb3VyfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdD17bGFzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RJblNlY3Rpb249e3dpbGxXYW50RGF0ZVNlcGFyYXRvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTdWNjZXNzZnVsPXtpc0xhc3RTdWNjZXNzZnVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZEV2ZW50PXtoaWdobGlnaHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudD17dGhpcy5wcm9wcy5nZXRSZWxhdGlvbnNGb3JFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dSZWFjdGlvbnM9e3RoaXMucHJvcHMuc2hvd1JlYWN0aW9uc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dD17dGhpcy5wcm9wcy5sYXlvdXR9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVGbGFpcj17dGhpcy5wcm9wcy5lbmFibGVGbGFpcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dSZWFkUmVjZWlwdHM9e3RoaXMucHJvcHMuc2hvd1JlYWRSZWNlaXB0c31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1RpbGVFcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgPC9saT4sXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBfd2FudHNEYXRlU2VwYXJhdG9yKHByZXZFdmVudCwgbmV4dEV2ZW50RGF0ZSkge1xuICAgICAgICBpZiAocHJldkV2ZW50ID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIGZpcnN0IGV2ZW50IGluIHRoZSBwYW5lbDogZGVwZW5kcyBpZiB3ZSBjb3VsZCBiYWNrLXBhZ2luYXRlIGZyb21cbiAgICAgICAgICAgIC8vIGhlcmUuXG4gICAgICAgICAgICByZXR1cm4gIXRoaXMucHJvcHMuc3VwcHJlc3NGaXJzdERhdGVTZXBhcmF0b3I7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdhbnRzRGF0ZVNlcGFyYXRvcihwcmV2RXZlbnQuZ2V0RGF0ZSgpLCBuZXh0RXZlbnREYXRlKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgYSBsaXN0IG9mIHJlYWQgcmVjZWlwdHMgdGhhdCBzaG91bGQgYmUgc2hvd24gbmV4dCB0byB0aGlzIGV2ZW50XG4gICAgLy8gUmVjZWlwdHMgYXJlIG9iamVjdHMgd2hpY2ggaGF2ZSBhICd1c2VySWQnLCAncm9vbU1lbWJlcicgYW5kICd0cycuXG4gICAgX2dldFJlYWRSZWNlaXB0c0ZvckV2ZW50KGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZDtcblxuICAgICAgICAvLyBnZXQgbGlzdCBvZiByZWFkIHJlY2VpcHRzLCBzb3J0ZWQgbW9zdCByZWNlbnQgZmlyc3RcbiAgICAgICAgY29uc3QgeyByb29tIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlY2VpcHRzID0gW107XG4gICAgICAgIHJvb20uZ2V0UmVjZWlwdHNGb3JFdmVudChldmVudCkuZm9yRWFjaCgocikgPT4ge1xuICAgICAgICAgICAgaWYgKCFyLnVzZXJJZCB8fCByLnR5cGUgIT09IFwibS5yZWFkXCIgfHwgci51c2VySWQgPT09IG15VXNlcklkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBpZ25vcmUgbm9uLXJlYWQgcmVjZWlwdHMgYW5kIHJlY2VpcHRzIGZyb20gc2VsZi5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNVc2VySWdub3JlZChyLnVzZXJJZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIGlnbm9yZSBpZ25vcmVkIHVzZXJzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtZW1iZXIgPSByb29tLmdldE1lbWJlcihyLnVzZXJJZCk7XG4gICAgICAgICAgICByZWNlaXB0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICB1c2VySWQ6IHIudXNlcklkLFxuICAgICAgICAgICAgICAgIHJvb21NZW1iZXI6IG1lbWJlcixcbiAgICAgICAgICAgICAgICB0czogci5kYXRhID8gci5kYXRhLnRzIDogMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlY2VpcHRzO1xuICAgIH1cblxuICAgIC8vIEdldCBhbiBvYmplY3QgdGhhdCBtYXBzIGZyb20gZXZlbnQgSUQgdG8gYSBsaXN0IG9mIHJlYWQgcmVjZWlwdHMgdGhhdFxuICAgIC8vIHNob3VsZCBiZSBzaG93biBuZXh0IHRvIHRoYXQgZXZlbnQuIElmIGEgaGlkZGVuIGV2ZW50IGhhcyByZWFkIHJlY2VpcHRzLFxuICAgIC8vIHRoZXkgYXJlIGZvbGRlZCBpbnRvIHRoZSByZWNlaXB0cyBvZiB0aGUgbGFzdCBzaG93biBldmVudC5cbiAgICBfZ2V0UmVhZFJlY2VpcHRzQnlTaG93bkV2ZW50KCkge1xuICAgICAgICBjb25zdCByZWNlaXB0c0J5RXZlbnQgPSB7fTtcbiAgICAgICAgY29uc3QgcmVjZWlwdHNCeVVzZXJJZCA9IHt9O1xuXG4gICAgICAgIGxldCBsYXN0U2hvd25FdmVudElkO1xuICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIHRoaXMucHJvcHMuZXZlbnRzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc2hvdWxkU2hvd0V2ZW50KGV2ZW50KSkge1xuICAgICAgICAgICAgICAgIGxhc3RTaG93bkV2ZW50SWQgPSBldmVudC5nZXRJZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFsYXN0U2hvd25FdmVudElkKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUmVjZWlwdHMgPSByZWNlaXB0c0J5RXZlbnRbbGFzdFNob3duRXZlbnRJZF0gfHwgW107XG4gICAgICAgICAgICBjb25zdCBuZXdSZWNlaXB0cyA9IHRoaXMuX2dldFJlYWRSZWNlaXB0c0ZvckV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIHJlY2VpcHRzQnlFdmVudFtsYXN0U2hvd25FdmVudElkXSA9IGV4aXN0aW5nUmVjZWlwdHMuY29uY2F0KG5ld1JlY2VpcHRzKTtcblxuICAgICAgICAgICAgLy8gUmVjb3JkIHRoZXNlIHJlY2VpcHRzIGFsb25nIHdpdGggdGhlaXIgbGFzdCBzaG93biBldmVudCBJRCBmb3JcbiAgICAgICAgICAgIC8vIGVhY2ggYXNzb2NpYXRlZCB1c2VyIElELlxuICAgICAgICAgICAgZm9yIChjb25zdCByZWNlaXB0IG9mIG5ld1JlY2VpcHRzKSB7XG4gICAgICAgICAgICAgICAgcmVjZWlwdHNCeVVzZXJJZFtyZWNlaXB0LnVzZXJJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTaG93bkV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgIHJlY2VpcHQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgaW4gc29tZSBjYXNlcyAoZm9yIGV4YW1wbGUsIHdoZW4gYSByZWFkIHJlY2VpcHRcbiAgICAgICAgLy8gYWR2YW5jZXMgYmVmb3JlIHdlIGhhdmUgcGFnaW5hdGVkIGluIHRoZSBuZXcgZXZlbnQgdGhhdCBpdCdzIG1hcmtpbmdcbiAgICAgICAgLy8gcmVjZWl2ZWQpIHRoYXQgd2UgY2FuIHRlbXBvcmFyaWx5IG5vdCBoYXZlIGEgbWF0Y2hpbmcgZXZlbnQgZm9yXG4gICAgICAgIC8vIHNvbWVvbmUgd2hpY2ggaGFkIG9uZSBpbiB0aGUgbGFzdC4gQnkgbG9va2luZyB0aHJvdWdoIG91ciBwcmV2aW91c1xuICAgICAgICAvLyBtYXBwaW5nIG9mIHJlY2VpcHRzIGJ5IHVzZXIgSUQsIHdlIGNhbiBjb3ZlciByZWNvdmVyIGFueSByZWNlaXB0c1xuICAgICAgICAvLyB0aGF0IHdvdWxkIGhhdmUgYmVlbiBsb3N0IGJ5IHVzaW5nIHRoZSBzYW1lIGV2ZW50IElEIGZyb20gbGFzdCB0aW1lLlxuICAgICAgICBmb3IgKGNvbnN0IHVzZXJJZCBpbiB0aGlzLl9yZWFkUmVjZWlwdHNCeVVzZXJJZCkge1xuICAgICAgICAgICAgaWYgKHJlY2VpcHRzQnlVc2VySWRbdXNlcklkXSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgeyBsYXN0U2hvd25FdmVudElkLCByZWNlaXB0IH0gPSB0aGlzLl9yZWFkUmVjZWlwdHNCeVVzZXJJZFt1c2VySWRdO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdSZWNlaXB0cyA9IHJlY2VpcHRzQnlFdmVudFtsYXN0U2hvd25FdmVudElkXSB8fCBbXTtcbiAgICAgICAgICAgIHJlY2VpcHRzQnlFdmVudFtsYXN0U2hvd25FdmVudElkXSA9IGV4aXN0aW5nUmVjZWlwdHMuY29uY2F0KHJlY2VpcHQpO1xuICAgICAgICAgICAgcmVjZWlwdHNCeVVzZXJJZFt1c2VySWRdID0geyBsYXN0U2hvd25FdmVudElkLCByZWNlaXB0IH07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVhZFJlY2VpcHRzQnlVc2VySWQgPSByZWNlaXB0c0J5VXNlcklkO1xuXG4gICAgICAgIC8vIEFmdGVyIGdyb3VwaW5nIHJlY2VpcHRzIGJ5IHNob3duIGV2ZW50cywgZG8gYW5vdGhlciBwYXNzIHRvIHNvcnQgZWFjaFxuICAgICAgICAvLyByZWNlaXB0IGxpc3QuXG4gICAgICAgIGZvciAoY29uc3QgZXZlbnRJZCBpbiByZWNlaXB0c0J5RXZlbnQpIHtcbiAgICAgICAgICAgIHJlY2VpcHRzQnlFdmVudFtldmVudElkXS5zb3J0KChyMSwgcjIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcjIudHMgLSByMS50cztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlY2VpcHRzQnlFdmVudDtcbiAgICB9XG5cbiAgICBfY29sbGVjdEV2ZW50Tm9kZSA9IChldmVudElkLCBub2RlKSA9PiB7XG4gICAgICAgIHRoaXMuZXZlbnROb2Rlc1tldmVudElkXSA9IG5vZGU7XG4gICAgfVxuXG4gICAgLy8gb25jZSBkeW5hbWljIGNvbnRlbnQgaW4gdGhlIGV2ZW50cyBsb2FkLCBtYWtlIHRoZSBzY3JvbGxQYW5lbCBjaGVjayB0aGVcbiAgICAvLyBzY3JvbGwgb2Zmc2V0cy5cbiAgICBfb25IZWlnaHRDaGFuZ2VkID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JvbGxQYW5lbCA9IHRoaXMuX3Njcm9sbFBhbmVsLmN1cnJlbnQ7XG4gICAgICAgIGlmIChzY3JvbGxQYW5lbCkge1xuICAgICAgICAgICAgc2Nyb2xsUGFuZWwuY2hlY2tTY3JvbGwoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25UeXBpbmdTaG93biA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsUGFuZWwgPSB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50O1xuICAgICAgICAvLyB0aGlzIHdpbGwgbWFrZSB0aGUgdGltZWxpbmUgZ3Jvdywgc28gY2hlY2tTY3JvbGxcbiAgICAgICAgc2Nyb2xsUGFuZWwuY2hlY2tTY3JvbGwoKTtcbiAgICAgICAgaWYgKHNjcm9sbFBhbmVsICYmIHNjcm9sbFBhbmVsLmdldFNjcm9sbFN0YXRlKCkuc3R1Y2tBdEJvdHRvbSkge1xuICAgICAgICAgICAgc2Nyb2xsUGFuZWwucHJldmVudFNocmlua2luZygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vblR5cGluZ0hpZGRlbiA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsUGFuZWwgPSB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50O1xuICAgICAgICBpZiAoc2Nyb2xsUGFuZWwpIHtcbiAgICAgICAgICAgIC8vIGFzIGhpZGluZyB0aGUgdHlwaW5nIG5vdGlmaWNhdGlvbnMgZG9lc24ndFxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBzY3JvbGxQYW5lbCwgd2UgdGVsbCBpdCB0byBhcHBseVxuICAgICAgICAgICAgLy8gdGhlIHNocmlua2luZyBwcmV2ZW50aW9uIG9uY2UgdGhlIHR5cGluZyBub3RpZnMgYXJlIGhpZGRlblxuICAgICAgICAgICAgc2Nyb2xsUGFuZWwudXBkYXRlUHJldmVudFNocmlua2luZygpO1xuICAgICAgICAgICAgLy8gb3JkZXIgaXMgaW1wb3J0YW50IGhlcmUgYXMgY2hlY2tTY3JvbGwgd2lsbCBzY3JvbGwgZG93biB0b1xuICAgICAgICAgICAgLy8gcmV2ZWFsIGFkZGVkIHBhZGRpbmcgdG8gYmFsYW5jZSB0aGUgbm90aWZzIGRpc2FwcGVhcmluZy5cbiAgICAgICAgICAgIHNjcm9sbFBhbmVsLmNoZWNrU2Nyb2xsKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdXBkYXRlVGltZWxpbmVNaW5IZWlnaHQoKSB7XG4gICAgICAgIGNvbnN0IHNjcm9sbFBhbmVsID0gdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudDtcblxuICAgICAgICBpZiAoc2Nyb2xsUGFuZWwpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzQXRCb3R0b20gPSBzY3JvbGxQYW5lbC5pc0F0Qm90dG9tKCk7XG4gICAgICAgICAgICBjb25zdCB3aG9Jc1R5cGluZyA9IHRoaXMuX3dob0lzVHlwaW5nLmN1cnJlbnQ7XG4gICAgICAgICAgICBjb25zdCBpc1R5cGluZ1Zpc2libGUgPSB3aG9Jc1R5cGluZyAmJiB3aG9Jc1R5cGluZy5pc1Zpc2libGUoKTtcbiAgICAgICAgICAgIC8vIHdoZW4gbWVzc2FnZXMgZ2V0IGFkZGVkIHRvIHRoZSB0aW1lbGluZSxcbiAgICAgICAgICAgIC8vIGJ1dCBzb21lYm9keSBlbHNlIGlzIHN0aWxsIHR5cGluZyxcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgbWluLWhlaWdodCwgc28gb25jZSB0aGUgbGFzdFxuICAgICAgICAgICAgLy8gcGVyc29uIHN0b3BzIHR5cGluZywgbm8ganVtcGluZyBvY2N1cnNcbiAgICAgICAgICAgIGlmIChpc0F0Qm90dG9tICYmIGlzVHlwaW5nVmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHNjcm9sbFBhbmVsLnByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uVGltZWxpbmVSZXNldCgpIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsUGFuZWwgPSB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50O1xuICAgICAgICBpZiAoc2Nyb2xsUGFuZWwpIHtcbiAgICAgICAgICAgIHNjcm9sbFBhbmVsLmNsZWFyUHJldmVudFNocmlua2luZygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBFcnJvckJvdW5kYXJ5ID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuRXJyb3JCb3VuZGFyeScpO1xuICAgICAgICBjb25zdCBTY3JvbGxQYW5lbCA9IHNkay5nZXRDb21wb25lbnQoXCJzdHJ1Y3R1cmVzLlNjcm9sbFBhbmVsXCIpO1xuICAgICAgICBjb25zdCBXaG9Jc1R5cGluZ1RpbGUgPSBzZGsuZ2V0Q29tcG9uZW50KFwicm9vbXMuV2hvSXNUeXBpbmdUaWxlXCIpO1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgIGxldCB0b3BTcGlubmVyO1xuICAgICAgICBsZXQgYm90dG9tU3Bpbm5lcjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYmFja1BhZ2luYXRpbmcpIHtcbiAgICAgICAgICAgIHRvcFNwaW5uZXIgPSA8bGkga2V5PVwiX3RvcFNwaW5uZXJcIj48U3Bpbm5lciAvPjwvbGk+O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZvcndhcmRQYWdpbmF0aW5nKSB7XG4gICAgICAgICAgICBib3R0b21TcGlubmVyID0gPGxpIGtleT1cIl9ib3R0b21TcGlubmVyXCI+PFNwaW5uZXIgLz48L2xpPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN0eWxlID0gdGhpcy5wcm9wcy5oaWRkZW4gPyB7IGRpc3BsYXk6ICdub25lJyB9IDoge307XG5cbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NOYW1lcyhcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwibXhfTWVzc2FnZVBhbmVsX2Fsd2F5c1Nob3dUaW1lc3RhbXBzXCI6IHRoaXMucHJvcHMuYWx3YXlzU2hvd1RpbWVzdGFtcHMsXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIGxldCB3aG9Jc1R5cGluZztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucm9vbSAmJiAhdGhpcy5wcm9wcy50aWxlU2hhcGUgJiYgdGhpcy5zdGF0ZS5zaG93VHlwaW5nTm90aWZpY2F0aW9ucykge1xuICAgICAgICAgICAgd2hvSXNUeXBpbmcgPSAoPFdob0lzVHlwaW5nVGlsZVxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICBvblNob3duPXt0aGlzLl9vblR5cGluZ1Nob3dufVxuICAgICAgICAgICAgICAgIG9uSGlkZGVuPXt0aGlzLl9vblR5cGluZ0hpZGRlbn1cbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuX3dob0lzVHlwaW5nfSAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpcmNSZXNpemVyID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubGF5b3V0ID09IExheW91dC5JUkMpIHtcbiAgICAgICAgICAgIGlyY1Jlc2l6ZXIgPSA8SVJDVGltZWxpbmVQcm9maWxlUmVzaXplclxuICAgICAgICAgICAgICAgIG1pbldpZHRoPXsyMH1cbiAgICAgICAgICAgICAgICBtYXhXaWR0aD17NjAwfVxuICAgICAgICAgICAgICAgIHJvb21JZD17dGhpcy5wcm9wcy5yb29tID8gdGhpcy5wcm9wcy5yb29tLnJvb21JZCA6IG51bGx9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICA8U2Nyb2xsUGFuZWxcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9zY3JvbGxQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLnByb3BzLm9uU2Nyb2xsfVxuICAgICAgICAgICAgICAgICAgICBvblJlc2l6ZT17dGhpcy5vblJlc2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgb25GaWxsUmVxdWVzdD17dGhpcy5wcm9wcy5vbkZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgICAgICBvblVuZmlsbFJlcXVlc3Q9e3RoaXMucHJvcHMub25VbmZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgICAgICAgICAgICAgIHN0aWNreUJvdHRvbT17dGhpcy5wcm9wcy5zdGlja3lCb3R0b219XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICBmaXhlZENoaWxkcmVuPXtpcmNSZXNpemVyfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyB0b3BTcGlubmVyIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLl9nZXRFdmVudFRpbGVzKCkgfVxuICAgICAgICAgICAgICAgICAgICB7IHdob0lzVHlwaW5nIH1cbiAgICAgICAgICAgICAgICAgICAgeyBib3R0b21TcGlubmVyIH1cbiAgICAgICAgICAgICAgICA8L1Njcm9sbFBhbmVsPlxuICAgICAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuLyogR3JvdXBlciBjbGFzc2VzIGRldGVybWluZSB3aGVuIGV2ZW50cyBjYW4gYmUgZ3JvdXBlZCB0b2dldGhlciBpbiBhIHN1bW1hcnkuXG4gKiBHcm91cGVycyBzaG91bGQgaGF2ZSB0aGUgZm9sbG93aW5nIG1ldGhvZHM6XG4gKiAtIGNhblN0YXJ0R3JvdXAgKHN0YXRpYyk6IGRldGVybWluZXMgaWYgYSBuZXcgZ3JvdXAgc2hvdWxkIGJlIHN0YXJ0ZWQgd2l0aCB0aGVcbiAqICAgZ2l2ZW4gZXZlbnRcbiAqIC0gc2hvdWxkR3JvdXA6IGRldGVybWluZXMgaWYgdGhlIGdpdmVuIGV2ZW50IHNob3VsZCBiZSBhZGRlZCB0byBhbiBleGlzdGluZyBncm91cFxuICogLSBhZGQ6IGFkZHMgYW4gZXZlbnQgdG8gYW4gZXhpc3RpbmcgZ3JvdXAgKHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpZiBzaG91bGRHcm91cFxuICogICByZXR1cm4gdHJ1ZSlcbiAqIC0gZ2V0VGlsZXM6IHJldHVybnMgdGhlIHRpbGVzIHRoYXQgcmVwcmVzZW50IHRoZSBncm91cFxuICogLSBnZXROZXdQcmV2RXZlbnQ6IHJldHVybnMgdGhlIGV2ZW50IHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgdGhlIG5ldyBwcmV2RXZlbnRcbiAqICAgd2hlbiBkZXRlcm1pbmluZyB0aGluZ3Mgc3VjaCBhcyB3aGV0aGVyIGEgZGF0ZSBzZXBhcmF0b3IgaXMgbmVjZXNzYXJ5XG4gKi9cblxuLy8gV3JhcCBpbml0aWFsIHJvb20gY3JlYXRpb24gZXZlbnRzIGludG8gYW4gRXZlbnRMaXN0U3VtbWFyeVxuLy8gR3JvdXBpbmcgb25seSBldmVudHMgc2VudCBieSB0aGUgc2FtZSB1c2VyIHRoYXQgc2VudCB0aGUgYG0ucm9vbS5jcmVhdGVgIGFuZCBvbmx5IHVudGlsXG4vLyB0aGUgZmlyc3Qgbm9uLXN0YXRlIGV2ZW50IG9yIG1lbWJlcnNoaXAgZXZlbnQgd2hpY2ggaXMgbm90IHJlZ2FyZGluZyB0aGUgc2VuZGVyIG9mIHRoZSBgbS5yb29tLmNyZWF0ZWAgZXZlbnRcbmNsYXNzIENyZWF0aW9uR3JvdXBlciB7XG4gICAgc3RhdGljIGNhblN0YXJ0R3JvdXAgPSBmdW5jdGlvbihwYW5lbCwgZXYpIHtcbiAgICAgICAgcmV0dXJuIGV2LmdldFR5cGUoKSA9PT0gXCJtLnJvb20uY3JlYXRlXCI7XG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHBhbmVsLCBjcmVhdGVFdmVudCwgcHJldkV2ZW50LCBsYXN0U2hvd25FdmVudCkge1xuICAgICAgICB0aGlzLnBhbmVsID0gcGFuZWw7XG4gICAgICAgIHRoaXMuY3JlYXRlRXZlbnQgPSBjcmVhdGVFdmVudDtcbiAgICAgICAgdGhpcy5wcmV2RXZlbnQgPSBwcmV2RXZlbnQ7XG4gICAgICAgIHRoaXMubGFzdFNob3duRXZlbnQgPSBsYXN0U2hvd25FdmVudDtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICAgICAgLy8gZXZlbnRzIHRoYXQgd2UgaW5jbHVkZSBpbiB0aGUgZ3JvdXAgYnV0IHRoZW4gZWplY3Qgb3V0IGFuZCBwbGFjZVxuICAgICAgICAvLyBhYm92ZSB0aGUgZ3JvdXAuXG4gICAgICAgIHRoaXMuZWplY3RlZEV2ZW50cyA9IFtdO1xuICAgICAgICB0aGlzLnJlYWRNYXJrZXIgPSBwYW5lbC5fcmVhZE1hcmtlckZvckV2ZW50KFxuICAgICAgICAgICAgY3JlYXRlRXZlbnQuZ2V0SWQoKSxcbiAgICAgICAgICAgIGNyZWF0ZUV2ZW50ID09PSBsYXN0U2hvd25FdmVudCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzaG91bGRHcm91cChldikge1xuICAgICAgICBjb25zdCBwYW5lbCA9IHRoaXMucGFuZWw7XG4gICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudDtcbiAgICAgICAgaWYgKCFwYW5lbC5fc2hvdWxkU2hvd0V2ZW50KGV2KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhbmVsLl93YW50c0RhdGVTZXBhcmF0b3IodGhpcy5jcmVhdGVFdmVudCwgZXYuZ2V0RGF0ZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IFwibS5yb29tLm1lbWJlclwiXG4gICAgICAgICAgICAmJiAoZXYuZ2V0U3RhdGVLZXkoKSAhPT0gY3JlYXRlRXZlbnQuZ2V0U2VuZGVyKCkgfHwgZXYuZ2V0Q29udGVudCgpW1wibWVtYmVyc2hpcFwiXSAhPT0gXCJqb2luXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2LmlzU3RhdGUoKSAmJiBldi5nZXRTZW5kZXIoKSA9PT0gY3JlYXRlRXZlbnQuZ2V0U2VuZGVyKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhZGQoZXYpIHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLnBhbmVsO1xuICAgICAgICB0aGlzLnJlYWRNYXJrZXIgPSB0aGlzLnJlYWRNYXJrZXIgfHwgcGFuZWwuX3JlYWRNYXJrZXJGb3JFdmVudChcbiAgICAgICAgICAgIGV2LmdldElkKCksXG4gICAgICAgICAgICBldiA9PT0gdGhpcy5sYXN0U2hvd25FdmVudCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFwYW5lbC5fc2hvdWxkU2hvd0V2ZW50KGV2KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IFwibS5yb29tLmVuY3J5cHRpb25cIikge1xuICAgICAgICAgICAgdGhpcy5lamVjdGVkRXZlbnRzLnB1c2goZXYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ldmVudHMucHVzaChldik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRUaWxlcygpIHtcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbnkgZXZlbnRzIHRvIGdyb3VwLCBkb24ndCBldmVuIHRyeSB0byBncm91cCB0aGVtLiBUaGUgbG9naWNcbiAgICAgICAgLy8gYmVsb3cgYXNzdW1lcyB0aGF0IHdlIGhhdmUgYSBncm91cCBvZiBldmVudHMgdG8gZGVhbCB3aXRoLCBidXQgd2UgbWlnaHQgbm90IGlmXG4gICAgICAgIC8vIHRoZSBldmVudHMgd2Ugd2VyZSBzdXBwb3NlZCB0byBncm91cCB3ZXJlIHJlZGFjdGVkLlxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzIHx8ICF0aGlzLmV2ZW50cy5sZW5ndGgpIHJldHVybiBbXTtcblxuICAgICAgICBjb25zdCBEYXRlU2VwYXJhdG9yID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuRGF0ZVNlcGFyYXRvcicpO1xuICAgICAgICBjb25zdCBFdmVudExpc3RTdW1tYXJ5ID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRXZlbnRMaXN0U3VtbWFyeScpO1xuXG4gICAgICAgIGNvbnN0IHBhbmVsID0gdGhpcy5wYW5lbDtcbiAgICAgICAgY29uc3QgcmV0ID0gW107XG4gICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudDtcbiAgICAgICAgY29uc3QgbGFzdFNob3duRXZlbnQgPSB0aGlzLmxhc3RTaG93bkV2ZW50O1xuXG4gICAgICAgIGlmIChwYW5lbC5fd2FudHNEYXRlU2VwYXJhdG9yKHRoaXMucHJldkV2ZW50LCBjcmVhdGVFdmVudC5nZXREYXRlKCkpKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGNyZWF0ZUV2ZW50LmdldFRzKCk7XG4gICAgICAgICAgICByZXQucHVzaChcbiAgICAgICAgICAgICAgICA8bGkga2V5PXt0cysnfid9PjxEYXRlU2VwYXJhdG9yIGtleT17dHMrJ34nfSB0cz17dHN9IC8+PC9saT4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhpcyBtLnJvb20uY3JlYXRlIGV2ZW50IHNob3VsZCBiZSBzaG93biAocm9vbSB1cGdyYWRlKSB0aGVuIHNob3cgaXQgYmVmb3JlIHRoZSBzdW1tYXJ5XG4gICAgICAgIGlmIChwYW5lbC5fc2hvdWxkU2hvd0V2ZW50KGNyZWF0ZUV2ZW50KSkge1xuICAgICAgICAgICAgLy8gcGFzcyBpbiB0aGUgY3JlYXRlRXZlbnQgYXMgcHJldkV2ZW50IGFzIHdlbGwgc28gbm8gZXh0cmEgRGF0ZVNlcGFyYXRvciBpcyByZW5kZXJlZFxuICAgICAgICAgICAgcmV0LnB1c2goLi4ucGFuZWwuX2dldFRpbGVzRm9yRXZlbnQoY3JlYXRlRXZlbnQsIGNyZWF0ZUV2ZW50LCBmYWxzZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBlamVjdGVkIG9mIHRoaXMuZWplY3RlZEV2ZW50cykge1xuICAgICAgICAgICAgcmV0LnB1c2goLi4ucGFuZWwuX2dldFRpbGVzRm9yRXZlbnQoXG4gICAgICAgICAgICAgICAgY3JlYXRlRXZlbnQsIGVqZWN0ZWQsIGNyZWF0ZUV2ZW50ID09PSBsYXN0U2hvd25FdmVudCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXZlbnRUaWxlcyA9IHRoaXMuZXZlbnRzLm1hcCgoZSkgPT4ge1xuICAgICAgICAgICAgLy8gSW4gb3JkZXIgdG8gcHJldmVudCBEYXRlU2VwYXJhdG9ycyBmcm9tIGFwcGVhcmluZyBpbiB0aGUgZXhwYW5kZWQgZm9ybVxuICAgICAgICAgICAgLy8gb2YgRXZlbnRMaXN0U3VtbWFyeSwgcmVuZGVyIGVhY2ggbWVtYmVyIGV2ZW50IGFzIGlmIHRoZSBwcmV2aW91c1xuICAgICAgICAgICAgLy8gb25lIHdhcyBpdHNlbGYuIFRoaXMgd2F5LCB0aGUgdGltZXN0YW1wIG9mIHRoZSBwcmV2aW91cyBldmVudCA9PT0gdGhlXG4gICAgICAgICAgICAvLyB0aW1lc3RhbXAgb2YgdGhlIGN1cnJlbnQgZXZlbnQsIGFuZCBubyBEYXRlU2VwYXJhdG9yIGlzIGluc2VydGVkLlxuICAgICAgICAgICAgcmV0dXJuIHBhbmVsLl9nZXRUaWxlc0ZvckV2ZW50KGUsIGUsIGUgPT09IGxhc3RTaG93bkV2ZW50KTtcbiAgICAgICAgfSkucmVkdWNlKChhLCBiKSA9PiBhLmNvbmNhdChiKSwgW10pO1xuICAgICAgICAvLyBHZXQgc2VuZGVyIHByb2ZpbGUgZnJvbSB0aGUgbGF0ZXN0IGV2ZW50IGluIHRoZSBzdW1tYXJ5IGFzIHRoZSBtLnJvb20uY3JlYXRlIGRvZXNuJ3QgY29udGFpbiBvbmVcbiAgICAgICAgY29uc3QgZXYgPSB0aGlzLmV2ZW50c1t0aGlzLmV2ZW50cy5sZW5ndGggLSAxXTtcblxuICAgICAgICBsZXQgc3VtbWFyeVRleHQ7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IGV2LmdldFJvb21JZCgpO1xuICAgICAgICBjb25zdCBjcmVhdG9yID0gZXYuc2VuZGVyID8gZXYuc2VuZGVyLm5hbWUgOiBldi5nZXRTZW5kZXIoKTtcbiAgICAgICAgaWYgKERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbUlkKSkge1xuICAgICAgICAgICAgc3VtbWFyeVRleHQgPSBfdChcIiUoY3JlYXRvcilzIGNyZWF0ZWQgdGhpcyBETS5cIiwgeyBjcmVhdG9yIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VtbWFyeVRleHQgPSBfdChcIiUoY3JlYXRvcilzIGNyZWF0ZWQgYW5kIGNvbmZpZ3VyZWQgdGhlIHJvb20uXCIsIHsgY3JlYXRvciB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldC5wdXNoKDxOZXdSb29tSW50cm8ga2V5PVwibmV3cm9vbWludHJvXCIgLz4pO1xuXG4gICAgICAgIHJldC5wdXNoKFxuICAgICAgICAgICAgPEV2ZW50TGlzdFN1bW1hcnlcbiAgICAgICAgICAgICAgICBrZXk9XCJyb29tY3JlYXRpb25zdW1tYXJ5XCJcbiAgICAgICAgICAgICAgICBldmVudHM9e3RoaXMuZXZlbnRzfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXtwYW5lbC5fb25IZWlnaHRDaGFuZ2VkfSAvLyBVcGRhdGUgc2Nyb2xsIHN0YXRlXG4gICAgICAgICAgICAgICAgc3VtbWFyeU1lbWJlcnM9e1tldi5zZW5kZXJdfVxuICAgICAgICAgICAgICAgIHN1bW1hcnlUZXh0PXtzdW1tYXJ5VGV4dH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGV2ZW50VGlsZXMgfVxuICAgICAgICAgICAgPC9FdmVudExpc3RTdW1tYXJ5PixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5yZWFkTWFya2VyKSB7XG4gICAgICAgICAgICByZXQucHVzaCh0aGlzLnJlYWRNYXJrZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBnZXROZXdQcmV2RXZlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUV2ZW50O1xuICAgIH1cbn1cblxuY2xhc3MgUmVkYWN0aW9uR3JvdXBlciB7XG4gICAgc3RhdGljIGNhblN0YXJ0R3JvdXAgPSBmdW5jdGlvbihwYW5lbCwgZXYpIHtcbiAgICAgICAgcmV0dXJuIHBhbmVsLl9zaG91bGRTaG93RXZlbnQoZXYpICYmIGV2LmlzUmVkYWN0ZWQoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihwYW5lbCwgZXYsIHByZXZFdmVudCwgbGFzdFNob3duRXZlbnQsIG5leHRFdmVudCwgbmV4dEV2ZW50VGlsZSkge1xuICAgICAgICB0aGlzLnBhbmVsID0gcGFuZWw7XG4gICAgICAgIHRoaXMucmVhZE1hcmtlciA9IHBhbmVsLl9yZWFkTWFya2VyRm9yRXZlbnQoXG4gICAgICAgICAgICBldi5nZXRJZCgpLFxuICAgICAgICAgICAgZXYgPT09IGxhc3RTaG93bkV2ZW50LFxuICAgICAgICApO1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtldl07XG4gICAgICAgIHRoaXMucHJldkV2ZW50ID0gcHJldkV2ZW50O1xuICAgICAgICB0aGlzLmxhc3RTaG93bkV2ZW50ID0gbGFzdFNob3duRXZlbnQ7XG4gICAgICAgIHRoaXMubmV4dEV2ZW50ID0gbmV4dEV2ZW50O1xuICAgICAgICB0aGlzLm5leHRFdmVudFRpbGUgPSBuZXh0RXZlbnRUaWxlO1xuICAgIH1cblxuICAgIHNob3VsZEdyb3VwKGV2KSB7XG4gICAgICAgIC8vIGFic29yYiBoaWRkZW4gZXZlbnRzIHNvIHRoYXQgdGhleSBkbyBub3QgYnJlYWsgdXAgc3RyZWFtcyBvZiBtZXNzYWdlcyAmIHJlZGFjdGlvbiBldmVudHMgYmVpbmcgZ3JvdXBlZFxuICAgICAgICBpZiAoIXRoaXMucGFuZWwuX3Nob3VsZFNob3dFdmVudChldikpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBhbmVsLl93YW50c0RhdGVTZXBhcmF0b3IodGhpcy5ldmVudHNbMF0sIGV2LmdldERhdGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXYuaXNSZWRhY3RlZCgpO1xuICAgIH1cblxuICAgIGFkZChldikge1xuICAgICAgICB0aGlzLnJlYWRNYXJrZXIgPSB0aGlzLnJlYWRNYXJrZXIgfHwgdGhpcy5wYW5lbC5fcmVhZE1hcmtlckZvckV2ZW50KFxuICAgICAgICAgICAgZXYuZ2V0SWQoKSxcbiAgICAgICAgICAgIGV2ID09PSB0aGlzLmxhc3RTaG93bkV2ZW50LFxuICAgICAgICApO1xuICAgICAgICBpZiAoIXRoaXMucGFuZWwuX3Nob3VsZFNob3dFdmVudChldikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV2ZW50cy5wdXNoKGV2KTtcbiAgICB9XG5cbiAgICBnZXRUaWxlcygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50cyB8fCAhdGhpcy5ldmVudHMubGVuZ3RoKSByZXR1cm4gW107XG5cbiAgICAgICAgY29uc3QgRGF0ZVNlcGFyYXRvciA9IHNkay5nZXRDb21wb25lbnQoJ21lc3NhZ2VzLkRhdGVTZXBhcmF0b3InKTtcbiAgICAgICAgY29uc3QgRXZlbnRMaXN0U3VtbWFyeSA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkV2ZW50TGlzdFN1bW1hcnknKTtcblxuICAgICAgICBjb25zdCBwYW5lbCA9IHRoaXMucGFuZWw7XG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuICAgICAgICBjb25zdCBsYXN0U2hvd25FdmVudCA9IHRoaXMubGFzdFNob3duRXZlbnQ7XG5cbiAgICAgICAgaWYgKHBhbmVsLl93YW50c0RhdGVTZXBhcmF0b3IodGhpcy5wcmV2RXZlbnQsIHRoaXMuZXZlbnRzWzBdLmdldERhdGUoKSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gdGhpcy5ldmVudHNbMF0uZ2V0VHMoKTtcbiAgICAgICAgICAgIHJldC5wdXNoKFxuICAgICAgICAgICAgICAgIDxsaSBrZXk9e3RzKyd+J30+PERhdGVTZXBhcmF0b3Iga2V5PXt0cysnfid9IHRzPXt0c30gLz48L2xpPixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBrZXkgPSBcInJlZGFjdGlvbmV2ZW50bGlzdHN1bW1hcnktXCIgKyAoXG4gICAgICAgICAgICB0aGlzLnByZXZFdmVudCA/IHRoaXMuZXZlbnRzWzBdLmdldElkKCkgOiBcImluaXRpYWxcIlxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHNlbmRlcnMgPSBuZXcgU2V0KCk7XG4gICAgICAgIGxldCBldmVudFRpbGVzID0gdGhpcy5ldmVudHMubWFwKChlLCBpKSA9PiB7XG4gICAgICAgICAgICBzZW5kZXJzLmFkZChlLnNlbmRlcik7XG4gICAgICAgICAgICBjb25zdCBwcmV2RXZlbnQgPSBpID09PSAwID8gdGhpcy5wcmV2RXZlbnQgOiB0aGlzLmV2ZW50c1tpIC0gMV07XG4gICAgICAgICAgICByZXR1cm4gcGFuZWwuX2dldFRpbGVzRm9yRXZlbnQocHJldkV2ZW50LCBlLCBlID09PSBsYXN0U2hvd25FdmVudCwgdGhpcy5uZXh0RXZlbnQsIHRoaXMubmV4dEV2ZW50VGlsZSk7XG4gICAgICAgIH0pLnJlZHVjZSgoYSwgYikgPT4gYS5jb25jYXQoYiksIFtdKTtcblxuICAgICAgICBpZiAoZXZlbnRUaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGV2ZW50VGlsZXMgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0LnB1c2goXG4gICAgICAgICAgICA8RXZlbnRMaXN0U3VtbWFyeVxuICAgICAgICAgICAgICAgIGtleT17a2V5fVxuICAgICAgICAgICAgICAgIHRocmVzaG9sZD17Mn1cbiAgICAgICAgICAgICAgICBldmVudHM9e3RoaXMuZXZlbnRzfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXtwYW5lbC5fb25IZWlnaHRDaGFuZ2VkfSAvLyBVcGRhdGUgc2Nyb2xsIHN0YXRlXG4gICAgICAgICAgICAgICAgc3VtbWFyeU1lbWJlcnM9e0FycmF5LmZyb20oc2VuZGVycyl9XG4gICAgICAgICAgICAgICAgc3VtbWFyeVRleHQ9e190KFwiJShjb3VudClzIG1lc3NhZ2VzIGRlbGV0ZWQuXCIsIHsgY291bnQ6IGV2ZW50VGlsZXMubGVuZ3RoIH0pfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgZXZlbnRUaWxlcyB9XG4gICAgICAgICAgICA8L0V2ZW50TGlzdFN1bW1hcnk+LFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0aGlzLnJlYWRNYXJrZXIpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKHRoaXMucmVhZE1hcmtlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGdldE5ld1ByZXZFdmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzW3RoaXMuZXZlbnRzLmxlbmd0aCAtIDFdO1xuICAgIH1cbn1cblxuLy8gV3JhcCBjb25zZWN1dGl2ZSBtZW1iZXIgZXZlbnRzIGluIGEgTGlzdFN1bW1hcnksIGlnbm9yZSBpZiByZWRhY3RlZFxuY2xhc3MgTWVtYmVyR3JvdXBlciB7XG4gICAgc3RhdGljIGNhblN0YXJ0R3JvdXAgPSBmdW5jdGlvbihwYW5lbCwgZXYpIHtcbiAgICAgICAgcmV0dXJuIHBhbmVsLl9zaG91bGRTaG93RXZlbnQoZXYpICYmIGlzTWVtYmVyc2hpcENoYW5nZShldik7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocGFuZWwsIGV2LCBwcmV2RXZlbnQsIGxhc3RTaG93bkV2ZW50KSB7XG4gICAgICAgIHRoaXMucGFuZWwgPSBwYW5lbDtcbiAgICAgICAgdGhpcy5yZWFkTWFya2VyID0gcGFuZWwuX3JlYWRNYXJrZXJGb3JFdmVudChcbiAgICAgICAgICAgIGV2LmdldElkKCksXG4gICAgICAgICAgICBldiA9PT0gbGFzdFNob3duRXZlbnQsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW2V2XTtcbiAgICAgICAgdGhpcy5wcmV2RXZlbnQgPSBwcmV2RXZlbnQ7XG4gICAgICAgIHRoaXMubGFzdFNob3duRXZlbnQgPSBsYXN0U2hvd25FdmVudDtcbiAgICB9XG5cbiAgICBzaG91bGRHcm91cChldikge1xuICAgICAgICBpZiAodGhpcy5wYW5lbC5fd2FudHNEYXRlU2VwYXJhdG9yKHRoaXMuZXZlbnRzWzBdLCBldi5nZXREYXRlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzTWVtYmVyc2hpcENoYW5nZShldik7XG4gICAgfVxuXG4gICAgYWRkKGV2KSB7XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09ICdtLnJvb20ubWVtYmVyJykge1xuICAgICAgICAgICAgLy8gV2UnbGwganVzdCBkb3VibGUgY2hlY2sgdGhhdCBpdCdzIHdvcnRoIG91ciB0aW1lIHRvIGRvIHNvLCB0aHJvdWdoIGFuXG4gICAgICAgICAgICAvLyB1Z2x5IGhhY2suIElmIHRleHRGb3JFdmVudCByZXR1cm5zIHNvbWV0aGluZywgd2Ugc2hvdWxkIGdyb3VwIGl0IGZvclxuICAgICAgICAgICAgLy8gcmVuZGVyaW5nIGJ1dCBpZiBpdCBkb2Vzbid0IHRoZW4gd2UnbGwgZXhjbHVkZSBpdC5cbiAgICAgICAgICAgIGNvbnN0IHJlbmRlclRleHQgPSB0ZXh0Rm9yRXZlbnQoZXYpO1xuICAgICAgICAgICAgaWYgKCFyZW5kZXJUZXh0IHx8IHJlbmRlclRleHQudHJpbSgpLmxlbmd0aCA9PT0gMCkgcmV0dXJuOyAvLyBxdWlldGx5IGlnbm9yZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVhZE1hcmtlciA9IHRoaXMucmVhZE1hcmtlciB8fCB0aGlzLnBhbmVsLl9yZWFkTWFya2VyRm9yRXZlbnQoXG4gICAgICAgICAgICBldi5nZXRJZCgpLFxuICAgICAgICAgICAgZXYgPT09IHRoaXMubGFzdFNob3duRXZlbnQsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZXZlbnRzLnB1c2goZXYpO1xuICAgIH1cblxuICAgIGdldFRpbGVzKCkge1xuICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGFueSBldmVudHMgdG8gZ3JvdXAsIGRvbid0IGV2ZW4gdHJ5IHRvIGdyb3VwIHRoZW0uIFRoZSBsb2dpY1xuICAgICAgICAvLyBiZWxvdyBhc3N1bWVzIHRoYXQgd2UgaGF2ZSBhIGdyb3VwIG9mIGV2ZW50cyB0byBkZWFsIHdpdGgsIGJ1dCB3ZSBtaWdodCBub3QgaWZcbiAgICAgICAgLy8gdGhlIGV2ZW50cyB3ZSB3ZXJlIHN1cHBvc2VkIHRvIGdyb3VwIHdlcmUgcmVkYWN0ZWQuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMgfHwgIXRoaXMuZXZlbnRzLmxlbmd0aCkgcmV0dXJuIFtdO1xuXG4gICAgICAgIGNvbnN0IERhdGVTZXBhcmF0b3IgPSBzZGsuZ2V0Q29tcG9uZW50KCdtZXNzYWdlcy5EYXRlU2VwYXJhdG9yJyk7XG4gICAgICAgIGNvbnN0IE1lbWJlckV2ZW50TGlzdFN1bW1hcnkgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5NZW1iZXJFdmVudExpc3RTdW1tYXJ5Jyk7XG5cbiAgICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLnBhbmVsO1xuICAgICAgICBjb25zdCBsYXN0U2hvd25FdmVudCA9IHRoaXMubGFzdFNob3duRXZlbnQ7XG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuXG4gICAgICAgIGlmIChwYW5lbC5fd2FudHNEYXRlU2VwYXJhdG9yKHRoaXMucHJldkV2ZW50LCB0aGlzLmV2ZW50c1swXS5nZXREYXRlKCkpKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IHRoaXMuZXZlbnRzWzBdLmdldFRzKCk7XG4gICAgICAgICAgICByZXQucHVzaChcbiAgICAgICAgICAgICAgICA8bGkga2V5PXt0cysnfid9PjxEYXRlU2VwYXJhdG9yIGtleT17dHMrJ34nfSB0cz17dHN9IC8+PC9saT4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIGtleSBvZiB0aGUgTWVtYmVyRXZlbnRMaXN0U3VtbWFyeSBkb2VzIG5vdCBjaGFuZ2Ugd2l0aCBuZXdcbiAgICAgICAgLy8gbWVtYmVyIGV2ZW50cy4gVGhpcyB3aWxsIHByZXZlbnQgaXQgZnJvbSBiZWluZyByZS1jcmVhdGVkIHVubmVjZXNzYXJpbHksIGFuZFxuICAgICAgICAvLyBpbnN0ZWFkIHdpbGwgYWxsb3cgbmV3IHByb3BzIHRvIGJlIHByb3ZpZGVkLiBJbiB0dXJuLCB0aGUgc2hvdWxkQ29tcG9uZW50VXBkYXRlXG4gICAgICAgIC8vIG1ldGhvZCBvbiBNRUxTIGNhbiBiZSB1c2VkIHRvIHByZXZlbnQgdW5uZWNlc3NhcnkgcmVuZGVyaW5ncy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2hpbHN0IGJhY2stcGFnaW5hdGluZyB3aXRoIGEgTUVMUyBhdCB0aGUgdG9wIG9mIHRoZSBwYW5lbCwgcHJldkV2ZW50IHdpbGwgYmUgbnVsbCxcbiAgICAgICAgLy8gc28gdXNlIHRoZSBrZXkgXCJtZW1iZXJldmVudGxpc3RzdW1tYXJ5LWluaXRpYWxcIi4gT3RoZXJ3aXNlLCB1c2UgdGhlIElEIG9mIHRoZSBmaXJzdFxuICAgICAgICAvLyBtZW1iZXJzaGlwIGV2ZW50LCB3aGljaCB3aWxsIG5vdCBjaGFuZ2UgZHVyaW5nIGZvcndhcmQgcGFnaW5hdGlvbi5cbiAgICAgICAgY29uc3Qga2V5ID0gXCJtZW1iZXJldmVudGxpc3RzdW1tYXJ5LVwiICsgKFxuICAgICAgICAgICAgdGhpcy5wcmV2RXZlbnQgPyB0aGlzLmV2ZW50c1swXS5nZXRJZCgpIDogXCJpbml0aWFsXCJcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgaGlnaGxpZ2h0SW5NZWxzO1xuICAgICAgICBsZXQgZXZlbnRUaWxlcyA9IHRoaXMuZXZlbnRzLm1hcCgoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUuZ2V0SWQoKSA9PT0gcGFuZWwucHJvcHMuaGlnaGxpZ2h0ZWRFdmVudElkKSB7XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0SW5NZWxzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEluIG9yZGVyIHRvIHByZXZlbnQgRGF0ZVNlcGFyYXRvcnMgZnJvbSBhcHBlYXJpbmcgaW4gdGhlIGV4cGFuZGVkIGZvcm1cbiAgICAgICAgICAgIC8vIG9mIE1lbWJlckV2ZW50TGlzdFN1bW1hcnksIHJlbmRlciBlYWNoIG1lbWJlciBldmVudCBhcyBpZiB0aGUgcHJldmlvdXNcbiAgICAgICAgICAgIC8vIG9uZSB3YXMgaXRzZWxmLiBUaGlzIHdheSwgdGhlIHRpbWVzdGFtcCBvZiB0aGUgcHJldmlvdXMgZXZlbnQgPT09IHRoZVxuICAgICAgICAgICAgLy8gdGltZXN0YW1wIG9mIHRoZSBjdXJyZW50IGV2ZW50LCBhbmQgbm8gRGF0ZVNlcGFyYXRvciBpcyBpbnNlcnRlZC5cbiAgICAgICAgICAgIHJldHVybiBwYW5lbC5fZ2V0VGlsZXNGb3JFdmVudChlLCBlLCBlID09PSBsYXN0U2hvd25FdmVudCk7XG4gICAgICAgIH0pLnJlZHVjZSgoYSwgYikgPT4gYS5jb25jYXQoYiksIFtdKTtcblxuICAgICAgICBpZiAoZXZlbnRUaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGV2ZW50VGlsZXMgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0LnB1c2goXG4gICAgICAgICAgICA8TWVtYmVyRXZlbnRMaXN0U3VtbWFyeSBrZXk9e2tleX1cbiAgICAgICAgICAgICAgICBldmVudHM9e3RoaXMuZXZlbnRzfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXtwYW5lbC5fb25IZWlnaHRDaGFuZ2VkfSAvLyBVcGRhdGUgc2Nyb2xsIHN0YXRlXG4gICAgICAgICAgICAgICAgc3RhcnRFeHBhbmRlZD17aGlnaGxpZ2h0SW5NZWxzfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgZXZlbnRUaWxlcyB9XG4gICAgICAgICAgICA8L01lbWJlckV2ZW50TGlzdFN1bW1hcnk+LFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0aGlzLnJlYWRNYXJrZXIpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKHRoaXMucmVhZE1hcmtlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGdldE5ld1ByZXZFdmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzWzBdO1xuICAgIH1cbn1cblxuLy8gYWxsIHRoZSBncm91cGVyIGNsYXNzZXMgdGhhdCB3ZSB1c2VcbmNvbnN0IGdyb3VwZXJzID0gW0NyZWF0aW9uR3JvdXBlciwgTWVtYmVyR3JvdXBlciwgUmVkYWN0aW9uR3JvdXBlcl07XG4iXX0=
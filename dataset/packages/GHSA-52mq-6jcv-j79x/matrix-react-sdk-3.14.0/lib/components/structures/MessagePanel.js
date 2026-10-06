"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _languageHandler = require("../../languageHandler");

var _EventTile = require("../views/rooms/EventTile");

var _TextForEvent = require("../../TextForEvent");

var _IRCTimelineProfileResizer = _interopRequireDefault(require("../views/elements/IRCTimelineProfileResizer"));

var _DMRoomMap = _interopRequireDefault(require("../../utils/DMRoomMap"));

var _NewRoomIntro = _interopRequireDefault(require("../views/rooms/NewRoomIntro"));

/*
Copyright 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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
const CONTINUATION_MAX_INTERVAL = 5 * 60 * 1000; // 5 minutes

const continuedTypes = ['m.sticker', 'm.room.message']; // check if there is a previous event and it has the same sender as this event
// and the types are the same/is in continuedTypes and the time between them is <= CONTINUATION_MAX_INTERVAL

function shouldFormContinuation(prevEvent, mxEvent) {
  // sanity check inputs
  if (!prevEvent || !prevEvent.sender || !mxEvent.sender) return false; // check if within the max continuation period

  if (mxEvent.getTs() - prevEvent.getTs() > CONTINUATION_MAX_INTERVAL) return false; // Some events should appear as continuations from previous events of different types.

  if (mxEvent.getType() !== prevEvent.getType() && (!continuedTypes.includes(mxEvent.getType()) || !continuedTypes.includes(prevEvent.getType()))) return false; // Check if the sender is the same and hasn't changed their displayname/avatar between these events

  if (mxEvent.sender.userId !== prevEvent.sender.userId || mxEvent.sender.name !== prevEvent.sender.name || mxEvent.sender.getMxcAvatarUrl() !== prevEvent.sender.getMxcAvatarUrl()) return false; // if we don't have tile for previous event then it was shown by showHiddenEvents and has no SenderProfile

  if (!(0, _EventTile.haveTileForEvent)(prevEvent)) return false;
  return true;
}

const isMembershipChange = e => e.getType() === 'm.room.member' || e.getType() === 'm.room.third_party_invite';
/* (almost) stateless UI component which builds the event tiles in the room timeline.
 */


class MessagePanel extends _react.default.Component {
  // Force props to be loaded for useIRCLayout
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case "scroll_to_bottom":
          this.scrollToBottom();
          break;
      }
    });
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
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    this._isMounted = false;

    _SettingsStore.default.unwatchSetting(this._showTypingNotificationsWatcherRef);

    _dispatcher.default.unregister(this.dispatcherRef);
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

    this._readReceiptsByEvent = {};

    if (this.props.showReadReceipts) {
      this._readReceiptsByEvent = this._getReadReceiptsByShownEvent();
    }

    let grouper = null;

    for (i = 0; i < this.props.events.length; i++) {
      const mxEv = this.props.events[i];
      const eventId = mxEv.getId();
      const last = mxEv === lastShownEvent;

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
          grouper = new Grouper(this, mxEv, prevEvent, lastShownEvent);
        }
      }

      if (!grouper) {
        const wantTile = this._shouldShowEvent(mxEv);

        if (wantTile) {
          const nextEvent = i < this.props.events.length - 1 ? this.props.events[i + 1] : null; // make sure we unpack the array returned by _getTilesForEvent,
          // otherwise react will auto-generate keys and we will end up
          // replacing all of the DOM elements every time we paginate.

          ret.push(...this._getTilesForEvent(prevEvent, mxEv, last, nextEvent));
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

  _getTilesForEvent(prevEvent, mxEv, last, nextEvent) {
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
    const readReceipts = this._readReceiptsByEvent[eventId]; // use txnId as key if available so that we don't remount during sending

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
      isSelectedEvent: highlight,
      getRelationsForEvent: this.props.getRelationsForEvent,
      showReactions: this.props.showReactions,
      useIRCLayout: this.props.useIRCLayout,
      enableFlair: this.props.enableFlair
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

    if (this.props.useIRCLayout) {
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

}
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


exports.default = MessagePanel;
(0, _defineProperty2.default)(MessagePanel, "propTypes", {
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
  // whether to use the irc layout
  useIRCLayout: _propTypes.default.bool,
  // whether or not to show flair at all
  enableFlair: _propTypes.default.bool
});

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

} // Wrap consecutive member events in a ListSummary, ignore if redacted


(0, _defineProperty2.default)(CreationGrouper, "canStartGroup", function (panel, ev) {
  return ev.getType() === "m.room.create";
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
const groupers = [CreationGrouper, MemberGrouper];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTWVzc2FnZVBhbmVsLmpzIl0sIm5hbWVzIjpbIkNPTlRJTlVBVElPTl9NQVhfSU5URVJWQUwiLCJjb250aW51ZWRUeXBlcyIsInNob3VsZEZvcm1Db250aW51YXRpb24iLCJwcmV2RXZlbnQiLCJteEV2ZW50Iiwic2VuZGVyIiwiZ2V0VHMiLCJnZXRUeXBlIiwiaW5jbHVkZXMiLCJ1c2VySWQiLCJuYW1lIiwiZ2V0TXhjQXZhdGFyVXJsIiwiaXNNZW1iZXJzaGlwQ2hhbmdlIiwiZSIsIk1lc3NhZ2VQYW5lbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInBheWxvYWQiLCJhY3Rpb24iLCJzY3JvbGxUb0JvdHRvbSIsInNldFN0YXRlIiwic2hvd1R5cGluZ05vdGlmaWNhdGlvbnMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJfaXNNb3VudGVkIiwibm9kZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInN0eWxlIiwid2lkdGgiLCJvcGFjaXR5IiwiZXYiLCJmaW5pc2hlZEV2ZW50SWQiLCJ0YXJnZXQiLCJkYXRhc2V0IiwiZXZlbnRpZCIsImdob3N0UmVhZE1hcmtlcnMiLCJzdGF0ZSIsImZpbHRlciIsImVpZCIsImV2ZW50SWQiLCJldmVudE5vZGVzIiwic2Nyb2xsUGFuZWwiLCJfc2Nyb2xsUGFuZWwiLCJjdXJyZW50IiwiY2hlY2tTY3JvbGwiLCJnZXRTY3JvbGxTdGF0ZSIsInN0dWNrQXRCb3R0b20iLCJwcmV2ZW50U2hyaW5raW5nIiwidXBkYXRlUHJldmVudFNocmlua2luZyIsIl9yZWFkUmVjZWlwdE1hcCIsIl9yZWFkUmVjZWlwdHNCeUV2ZW50IiwiX3JlYWRSZWNlaXB0c0J5VXNlcklkIiwiX3Nob3dIaWRkZW5FdmVudHNJblRpbWVsaW5lIiwiX3JlYWRNYXJrZXJOb2RlIiwiX3dob0lzVHlwaW5nIiwiX3Nob3dUeXBpbmdOb3RpZmljYXRpb25zV2F0Y2hlclJlZiIsIndhdGNoU2V0dGluZyIsIm9uU2hvd1R5cGluZ05vdGlmaWNhdGlvbnNDaGFuZ2UiLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXJSZWYiLCJkaXMiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bndhdGNoU2V0dGluZyIsInVucmVnaXN0ZXIiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJwcmV2U3RhdGUiLCJyZWFkTWFya2VyVmlzaWJsZSIsInJlYWRNYXJrZXJFdmVudElkIiwicHVzaCIsImdldE5vZGVGb3JFdmVudElkIiwidW5kZWZpbmVkIiwiaXNBdEJvdHRvbSIsImdldFJlYWRNYXJrZXJQb3NpdGlvbiIsInJlYWRNYXJrZXIiLCJtZXNzYWdlV3JhcHBlciIsIndyYXBwZXJSZWN0IiwiUmVhY3RET00iLCJmaW5kRE9NTm9kZSIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInJlYWRNYXJrZXJSZWN0IiwiYm90dG9tIiwidG9wIiwic2Nyb2xsVG9Ub3AiLCJzY3JvbGxSZWxhdGl2ZSIsIm11bHQiLCJoYW5kbGVTY3JvbGxLZXkiLCJzY3JvbGxUb0V2ZW50IiwicGl4ZWxPZmZzZXQiLCJvZmZzZXRCYXNlIiwic2Nyb2xsVG9Ub2tlbiIsInNjcm9sbFRvRXZlbnRJZk5lZWRlZCIsInNjcm9sbEludG9WaWV3IiwiYmxvY2siLCJiZWhhdmlvciIsImNoZWNrRmlsbFN0YXRlIiwiX3Nob3VsZFNob3dFdmVudCIsIm14RXYiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc1VzZXJJZ25vcmVkIiwiaGlnaGxpZ2h0ZWRFdmVudElkIiwiZ2V0SWQiLCJfcmVhZE1hcmtlckZvckV2ZW50IiwiaXNMYXN0RXZlbnQiLCJ2aXNpYmxlIiwiaHIiLCJfY29sbGVjdEdob3N0UmVhZE1hcmtlciIsIl9vbkdob3N0VHJhbnNpdGlvbkVuZCIsIl9nZXRFdmVudFRpbGVzIiwiaSIsImxhc3RTaG93bkV2ZW50IiwibGFzdFNob3duTm9uTG9jYWxFY2hvSW5kZXgiLCJldmVudHMiLCJsZW5ndGgiLCJzdGF0dXMiLCJyZXQiLCJzaG93UmVhZFJlY2VpcHRzIiwiX2dldFJlYWRSZWNlaXB0c0J5U2hvd25FdmVudCIsImdyb3VwZXIiLCJsYXN0Iiwic2hvdWxkR3JvdXAiLCJhZGQiLCJnZXRUaWxlcyIsImdldE5ld1ByZXZFdmVudCIsIkdyb3VwZXIiLCJncm91cGVycyIsImNhblN0YXJ0R3JvdXAiLCJ3YW50VGlsZSIsIm5leHRFdmVudCIsIl9nZXRUaWxlc0ZvckV2ZW50IiwiVGlsZUVycm9yQm91bmRhcnkiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJFdmVudFRpbGUiLCJEYXRlU2VwYXJhdG9yIiwiaXNFZGl0aW5nIiwiZWRpdFN0YXRlIiwiZ2V0RXZlbnQiLCJ0czEiLCJldmVudERhdGUiLCJnZXREYXRlIiwiRGF0ZSIsImdldFRpbWUiLCJ3YW50c0RhdGVTZXBhcmF0b3IiLCJfd2FudHNEYXRlU2VwYXJhdG9yIiwiZGF0ZVNlcGFyYXRvciIsIndpbGxXYW50RGF0ZVNlcGFyYXRvciIsImNvbnRpbnVhdGlvbiIsImhpZ2hsaWdodCIsInNjcm9sbFRva2VuIiwicmVhZFJlY2VpcHRzIiwiZ2V0VHhuSWQiLCJfY29sbGVjdEV2ZW50Tm9kZSIsImJpbmQiLCJpc1JlZGFjdGVkIiwicmVwbGFjaW5nRXZlbnRJZCIsIl9vbkhlaWdodENoYW5nZWQiLCJzaG93VXJsUHJldmlldyIsIl9pc1VubW91bnRpbmciLCJnZXRBc3NvY2lhdGVkU3RhdHVzIiwidGlsZVNoYXBlIiwiaXNUd2VsdmVIb3VyIiwicGVybWFsaW5rQ3JlYXRvciIsImdldFJlbGF0aW9uc0ZvckV2ZW50Iiwic2hvd1JlYWN0aW9ucyIsInVzZUlSQ0xheW91dCIsImVuYWJsZUZsYWlyIiwibmV4dEV2ZW50RGF0ZSIsInN1cHByZXNzRmlyc3REYXRlU2VwYXJhdG9yIiwiX2dldFJlYWRSZWNlaXB0c0ZvckV2ZW50IiwiZXZlbnQiLCJteVVzZXJJZCIsImNyZWRlbnRpYWxzIiwicm9vbSIsInJlY2VpcHRzIiwiZ2V0UmVjZWlwdHNGb3JFdmVudCIsImZvckVhY2giLCJyIiwidHlwZSIsIm1lbWJlciIsImdldE1lbWJlciIsInJvb21NZW1iZXIiLCJ0cyIsImRhdGEiLCJyZWNlaXB0c0J5RXZlbnQiLCJyZWNlaXB0c0J5VXNlcklkIiwibGFzdFNob3duRXZlbnRJZCIsImV4aXN0aW5nUmVjZWlwdHMiLCJuZXdSZWNlaXB0cyIsImNvbmNhdCIsInJlY2VpcHQiLCJzb3J0IiwicjEiLCJyMiIsInVwZGF0ZVRpbWVsaW5lTWluSGVpZ2h0Iiwid2hvSXNUeXBpbmciLCJpc1R5cGluZ1Zpc2libGUiLCJpc1Zpc2libGUiLCJvblRpbWVsaW5lUmVzZXQiLCJjbGVhclByZXZlbnRTaHJpbmtpbmciLCJyZW5kZXIiLCJFcnJvckJvdW5kYXJ5IiwiU2Nyb2xsUGFuZWwiLCJXaG9Jc1R5cGluZ1RpbGUiLCJTcGlubmVyIiwidG9wU3Bpbm5lciIsImJvdHRvbVNwaW5uZXIiLCJiYWNrUGFnaW5hdGluZyIsImZvcndhcmRQYWdpbmF0aW5nIiwiaGlkZGVuIiwiZGlzcGxheSIsImNsYXNzTmFtZSIsImFsd2F5c1Nob3dUaW1lc3RhbXBzIiwiX29uVHlwaW5nU2hvd24iLCJfb25UeXBpbmdIaWRkZW4iLCJpcmNSZXNpemVyIiwicm9vbUlkIiwib25TY3JvbGwiLCJvblJlc2l6ZSIsIm9uRmlsbFJlcXVlc3QiLCJvblVuZmlsbFJlcXVlc3QiLCJzdGlja3lCb3R0b20iLCJyZXNpemVOb3RpZmllciIsIlByb3BUeXBlcyIsImJvb2wiLCJhcnJheSIsImlzUmVxdWlyZWQiLCJzdHJpbmciLCJvYmplY3QiLCJvdXJVc2VySWQiLCJmdW5jIiwiQ3JlYXRpb25Hcm91cGVyIiwicGFuZWwiLCJjcmVhdGVFdmVudCIsImVqZWN0ZWRFdmVudHMiLCJnZXRTdGF0ZUtleSIsImdldFNlbmRlciIsImdldENvbnRlbnQiLCJpc1N0YXRlIiwiRXZlbnRMaXN0U3VtbWFyeSIsImVqZWN0ZWQiLCJldmVudFRpbGVzIiwibWFwIiwicmVkdWNlIiwiYSIsImIiLCJzdW1tYXJ5VGV4dCIsImdldFJvb21JZCIsImNyZWF0b3IiLCJETVJvb21NYXAiLCJzaGFyZWQiLCJnZXRVc2VySWRGb3JSb29tSWQiLCJNZW1iZXJHcm91cGVyIiwicmVuZGVyVGV4dCIsInRyaW0iLCJNZW1iZXJFdmVudExpc3RTdW1tYXJ5Iiwia2V5IiwiaGlnaGxpZ2h0SW5NZWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQWxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBb0JBLE1BQU1BLHlCQUF5QixHQUFHLElBQUksRUFBSixHQUFTLElBQTNDLEMsQ0FBaUQ7O0FBQ2pELE1BQU1DLGNBQWMsR0FBRyxDQUFDLFdBQUQsRUFBYyxnQkFBZCxDQUF2QixDLENBRUE7QUFDQTs7QUFDQSxTQUFTQyxzQkFBVCxDQUFnQ0MsU0FBaEMsRUFBMkNDLE9BQTNDLEVBQW9EO0FBQ2hEO0FBQ0EsTUFBSSxDQUFDRCxTQUFELElBQWMsQ0FBQ0EsU0FBUyxDQUFDRSxNQUF6QixJQUFtQyxDQUFDRCxPQUFPLENBQUNDLE1BQWhELEVBQXdELE9BQU8sS0FBUCxDQUZSLENBR2hEOztBQUNBLE1BQUlELE9BQU8sQ0FBQ0UsS0FBUixLQUFrQkgsU0FBUyxDQUFDRyxLQUFWLEVBQWxCLEdBQXNDTix5QkFBMUMsRUFBcUUsT0FBTyxLQUFQLENBSnJCLENBTWhEOztBQUNBLE1BQUlJLE9BQU8sQ0FBQ0csT0FBUixPQUFzQkosU0FBUyxDQUFDSSxPQUFWLEVBQXRCLEtBQ0MsQ0FBQ04sY0FBYyxDQUFDTyxRQUFmLENBQXdCSixPQUFPLENBQUNHLE9BQVIsRUFBeEIsQ0FBRCxJQUNHLENBQUNO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QUNILEtBVGdCLEVBU2RxSSxNQVRjLENBU1AsQ0FBQ0MsQ0FBRCxFQUFJQyxDQUFKLEtBQVVELENBQUMsQ0FBQ3ZELE1BQUYsQ0FBU3dELENBQVQsQ0FUSCxFQVNnQixFQVRoQixDQUFqQjs7QUFXQSxRQUFJSixVQUFVLENBQUNoSSxNQUFYLEtBQXNCLENBQTFCLEVBQTZCO0FBQ3pCZ0ksTUFBQUEsVUFBVSxHQUFHLElBQWI7QUFDSDs7QUFFRDlILElBQUFBLEdBQUcsQ0FBQy9DLElBQUosZUFDSSw2QkFBQyxzQkFBRDtBQUF3QixNQUFBLEdBQUcsRUFBRTRMLEdBQTdCO0FBQ0ssTUFBQSxNQUFNLEVBQUUsS0FBS2hKLE1BRGxCO0FBRUssTUFBQSxRQUFRLEVBQUV3SCxLQUFLLENBQUM1RSxnQkFGckIsQ0FFdUM7QUFGdkM7QUFHSyxNQUFBLGFBQWEsRUFBRXFHO0FBSHBCLE9BS09oQixVQUxQLENBREo7O0FBVUEsUUFBSSxLQUFLeEssVUFBVCxFQUFxQjtBQUNqQjBDLE1BQUFBLEdBQUcsQ0FBQy9DLElBQUosQ0FBUyxLQUFLSyxVQUFkO0FBQ0g7O0FBRUQsV0FBTzBDLEdBQVA7QUFDSDs7QUFFRFEsRUFBQUEsZUFBZSxHQUFHO0FBQ2QsV0FBTyxLQUFLWCxNQUFMLENBQVksQ0FBWixDQUFQO0FBQ0g7O0FBekdlLEMsQ0E0R3BCOzs7OEJBNUdNNEksYSxtQkFDcUIsVUFBU3BCLEtBQVQsRUFBZ0I3TSxFQUFoQixFQUFvQjtBQUN2QyxTQUFPNk0sS0FBSyxDQUFDekksZ0JBQU4sQ0FBdUJwRSxFQUF2QixLQUE4QnBCLGtCQUFrQixDQUFDb0IsRUFBRCxDQUF2RDtBQUNILEM7QUEwR0wsTUFBTWtHLFFBQVEsR0FBRyxDQUFDMEcsZUFBRCxFQUFrQnFCLGFBQWxCLENBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHNob3VsZEhpZGVFdmVudCBmcm9tICcuLi8uLi9zaG91bGRIaWRlRXZlbnQnO1xuaW1wb3J0IHt3YW50c0RhdGVTZXBhcmF0b3J9IGZyb20gJy4uLy4uL0RhdGVVdGlscyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vaW5kZXgnO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZSc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQge2hhdmVUaWxlRm9yRXZlbnR9IGZyb20gXCIuLi92aWV3cy9yb29tcy9FdmVudFRpbGVcIjtcbmltcG9ydCB7dGV4dEZvckV2ZW50fSBmcm9tIFwiLi4vLi4vVGV4dEZvckV2ZW50XCI7XG5pbXBvcnQgSVJDVGltZWxpbmVQcm9maWxlUmVzaXplciBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvSVJDVGltZWxpbmVQcm9maWxlUmVzaXplclwiO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tIFwiLi4vLi4vdXRpbHMvRE1Sb29tTWFwXCI7XG5pbXBvcnQgTmV3Um9vbUludHJvIGZyb20gXCIuLi92aWV3cy9yb29tcy9OZXdSb29tSW50cm9cIjtcblxuY29uc3QgQ09OVElOVUFUSU9OX01BWF9JTlRFUlZBTCA9IDUgKiA2MCAqIDEwMDA7IC8vIDUgbWludXRlc1xuY29uc3QgY29udGludWVkVHlwZXMgPSBbJ20uc3RpY2tlcicsICdtLnJvb20ubWVzc2FnZSddO1xuXG4vLyBjaGVjayBpZiB0aGVyZSBpcyBhIHByZXZpb3VzIGV2ZW50IGFuZCBpdCBoYXMgdGhlIHNhbWUgc2VuZGVyIGFzIHRoaXMgZXZlbnRcbi8vIGFuZCB0aGUgdHlwZXMgYXJlIHRoZSBzYW1lL2lzIGluIGNvbnRpbnVlZFR5cGVzIGFuZCB0aGUgdGltZSBiZXR3ZWVuIHRoZW0gaXMgPD0gQ09OVElOVUFUSU9OX01BWF9JTlRFUlZBTFxuZnVuY3Rpb24gc2hvdWxkRm9ybUNvbnRpbnVhdGlvbihwcmV2RXZlbnQsIG14RXZlbnQpIHtcbiAgICAvLyBzYW5pdHkgY2hlY2sgaW5wdXRzXG4gICAgaWYgKCFwcmV2RXZlbnQgfHwgIXByZXZFdmVudC5zZW5kZXIgfHwgIW14RXZlbnQuc2VuZGVyKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gY2hlY2sgaWYgd2l0aGluIHRoZSBtYXggY29udGludWF0aW9uIHBlcmlvZFxuICAgIGlmIChteEV2ZW50LmdldFRzKCkgLSBwcmV2RXZlbnQuZ2V0VHMoKSA+IENPTlRJTlVBVElPTl9NQVhfSU5URVJWQUwpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIFNvbWUgZXZlbnRzIHNob3VsZCBhcHBlYXIgYXMgY29udGludWF0aW9ucyBmcm9tIHByZXZpb3VzIGV2ZW50cyBvZiBkaWZmZXJlbnQgdHlwZXMuXG4gICAgaWYgKG14RXZlbnQuZ2V0VHlwZSgpICE9PSBwcmV2RXZlbnQuZ2V0VHlwZSgpICYmXG4gICAgICAgICghY29udGludWVkVHlwZXMuaW5jbHVkZXMobXhFdmVudC5nZXRUeXBlKCkpIHx8XG4gICAgICAgICAgICAhY29udGludWVkVHlwZXMuaW5jbHVkZXMocHJldkV2ZW50LmdldFR5cGUoKSkpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgc2VuZGVyIGlzIHRoZSBzYW1lIGFuZCBoYXNuJ3QgY2hhbmdlZCB0aGVpciBkaXNwbGF5bmFtZS9hdmF0YXIgYmV0d2VlbiB0aGVzZSBldmVudHNcbiAgICBpZiAobXhFdmVudC5zZW5kZXIudXNlcklkICE9PSBwcmV2RXZlbnQuc2VuZGVyLnVzZXJJZCB8fFxuICAgICAgICBteEV2ZW50LnNlbmRlci5uYW1lICE9PSBwcmV2RXZlbnQuc2VuZGVyLm5hbWUgfHxcbiAgICAgICAgbXhFdmVudC5zZW5kZXIuZ2V0TXhjQXZhdGFyVXJsKCkgIT09IHByZXZFdmVudC5zZW5kZXIuZ2V0TXhjQXZhdGFyVXJsKCkpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGlmIHdlIGRvbid0IGhhdmUgdGlsZSBmb3IgcHJldmlvdXMgZXZlbnQgdGhlbiBpdCB3YXMgc2hvd24gYnkgc2hvd0hpZGRlbkV2ZW50cyBhbmQgaGFzIG5vIFNlbmRlclByb2ZpbGVcbiAgICBpZiAoIWhhdmVUaWxlRm9yRXZlbnQocHJldkV2ZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmNvbnN0IGlzTWVtYmVyc2hpcENoYW5nZSA9IChlKSA9PiBlLmdldFR5cGUoKSA9PT0gJ20ucm9vbS5tZW1iZXInIHx8IGUuZ2V0VHlwZSgpID09PSAnbS5yb29tLnRoaXJkX3BhcnR5X2ludml0ZSc7XG5cbi8qIChhbG1vc3QpIHN0YXRlbGVzcyBVSSBjb21wb25lbnQgd2hpY2ggYnVpbGRzIHRoZSBldmVudCB0aWxlcyBpbiB0aGUgcm9vbSB0aW1lbGluZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzc2FnZVBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyB0cnVlIHRvIGdpdmUgdGhlIGNvbXBvbmVudCBhICdkaXNwbGF5OiBub25lJyBzdHlsZS5cbiAgICAgICAgaGlkZGVuOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB0cnVlIHRvIHNob3cgYSBzcGlubmVyIGF0IHRoZSB0b3Agb2YgdGhlIHRpbWVsaW5lIHRvIGluZGljYXRlXG4gICAgICAgIC8vIGJhY2stcGFnaW5hdGlvbiBpbiBwcm9ncmVzc1xuICAgICAgICBiYWNrUGFnaW5hdGluZzogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLy8gdHJ1ZSB0byBzaG93IGEgc3Bpbm5lciBhdCB0aGUgZW5kIG9mIHRoZSB0aW1lbGluZSB0byBpbmRpY2F0ZVxuICAgICAgICAvLyBmb3J3YXJkLXBhZ2luYXRpb24gaW4gcHJvZ3Jlc3NcbiAgICAgICAgZm9yd2FyZFBhZ2luYXRpbmc6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIHRoZSBsaXN0IG9mIE1hdHJpeEV2ZW50cyB0byBkaXNwbGF5XG4gICAgICAgIGV2ZW50czogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG5cbiAgICAgICAgLy8gSUQgb2YgYW4gZXZlbnQgdG8gaGlnaGxpZ2h0LiBJZiB1bmRlZmluZWQsIG5vIGV2ZW50IHdpbGwgYmUgaGlnaGxpZ2h0ZWQuXG4gICAgICAgIGhpZ2hsaWdodGVkRXZlbnRJZDogUHJvcFR5cGVzLnN0cmluZyxcblxuICAgICAgICAvLyBUaGUgcm9vbSB0aGVzZSBldmVudHMgYXJlIGFsbCBpbiB0b2dldGhlciwgaWYgYW55LlxuICAgICAgICAvLyAoVGhlIG5vdGlmaWNhdGlvbiBwYW5lbCB3b24ndCBoYXZlIGEgcm9vbSBoZXJlLCBmb3IgZXhhbXBsZS4pXG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICAgICAgLy8gU2hvdWxkIHdlIHNob3cgVVJMIFByZXZpZXdzXG4gICAgICAgIHNob3dVcmxQcmV2aWV3OiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyBldmVudCBhZnRlciB3aGljaCB3ZSBzaG91bGQgc2hvdyBhIHJlYWQgbWFya2VyXG4gICAgICAgIHJlYWRNYXJrZXJFdmVudElkOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIHdoZXRoZXIgdGhlIHJlYWQgbWFya2VyIHNob3VsZCBiZSB2aXNpYmxlXG4gICAgICAgIHJlYWRNYXJrZXJWaXNpYmxlOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB0aGUgdXNlcmlkIG9mIG91ciB1c2VyLiBUaGlzIGlzIHVzZWQgdG8gc3VwcHJlc3MgdGhlIHJlYWQgbWFya2VyXG4gICAgICAgIC8vIGZvciBwZW5kaW5nIG1lc3NhZ2VzLlxuICAgICAgICBvdXJVc2VySWQ6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLy8gdHJ1ZSB0byBzdXBwcmVzcyB0aGUgZGF0ZSBhdCB0aGUgc3RhcnQgb2YgdGhlIHRpbWVsaW5lXG4gICAgICAgIHN1cHByZXNzRmlyc3REYXRlU2VwYXJhdG9yOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB3aGV0aGVyIHRvIHNob3cgcmVhZCByZWNlaXB0c1xuICAgICAgICBzaG93UmVhZFJlY2VpcHRzOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB0cnVlIGlmIHVwZGF0ZXMgdG8gdGhlIGV2ZW50IGxpc3Qgc2hvdWxkIGNhdXNlIHRoZSBzY3JvbGwgcGFuZWwgdG9cbiAgICAgICAgLy8gc2Nyb2xsIGRvd24gd2hlbiB3ZSBhcmUgYXQgdGhlIGJvdHRvbSBvZiB0aGUgd2luZG93LiBTZWUgU2Nyb2xsUGFuZWxcbiAgICAgICAgLy8gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgICAgc3RpY2t5Qm90dG9tOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGUgcGFuZWwgaXMgc2Nyb2xsZWQuXG4gICAgICAgIG9uU2Nyb2xsOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiBtb3JlIGNvbnRlbnQgaXMgbmVlZGVkLlxuICAgICAgICBvbkZpbGxSZXF1ZXN0OiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyBjbGFzc05hbWUgZm9yIHRoZSBwYW5lbFxuICAgICAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblxuICAgICAgICAvLyBzaGFwZSBwYXJhbWV0ZXIgdG8gYmUgcGFzc2VkIHRvIEV2ZW50VGlsZXNcbiAgICAgICAgdGlsZVNoYXBlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIHNob3cgdHdlbHZlIGhvdXIgdGltZXN0YW1wc1xuICAgICAgICBpc1R3ZWx2ZUhvdXI6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIHNob3cgdGltZXN0YW1wcyBhbHdheXNcbiAgICAgICAgYWx3YXlzU2hvd1RpbWVzdGFtcHM6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIGhlbHBlciBmdW5jdGlvbiB0byBhY2Nlc3MgcmVsYXRpb25zIGZvciBhbiBldmVudFxuICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLy8gd2hldGhlciB0byBzaG93IHJlYWN0aW9ucyBmb3IgYW4gZXZlbnRcbiAgICAgICAgc2hvd1JlYWN0aW9uczogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLy8gd2hldGhlciB0byB1c2UgdGhlIGlyYyBsYXlvdXRcbiAgICAgICAgdXNlSVJDTGF5b3V0OiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB3aGV0aGVyIG9yIG5vdCB0byBzaG93IGZsYWlyIGF0IGFsbFxuICAgICAgICBlbmFibGVGbGFpcjogUHJvcFR5cGVzLmJvb2wsXG4gICAgfTtcblxuICAgIC8vIEZvcmNlIHByb3BzIHRvIGJlIGxvYWRlZCBmb3IgdXNlSVJDTGF5b3V0XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAvLyBwcmV2aW91cyBwb3NpdGlvbnMgdGhlIHJlYWQgbWFya2VyIGhhcyBiZWVuIGluLCBzbyB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGRpc3BsYXkgJ2dob3N0JyByZWFkIG1hcmtlcnMgdGhhdCBhcmUgYW5pbWF0aW5nIGF3YXlcbiAgICAgICAgICAgIGdob3N0UmVhZE1hcmtlcnM6IFtdLFxuICAgICAgICAgICAgc2hvd1R5cGluZ05vdGlmaWNhdGlvbnM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93VHlwaW5nTm90aWZpY2F0aW9uc1wiKSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBvcGFxdWUgcmVhZHJlY2VpcHQgaW5mbyBmb3IgZWFjaCB1c2VySWQ7IHVzZWQgYnkgUmVhZFJlY2VpcHRNYXJrZXJcbiAgICAgICAgLy8gdG8gbWFuYWdlIGl0cyBhbmltYXRpb25zXG4gICAgICAgIHRoaXMuX3JlYWRSZWNlaXB0TWFwID0ge307XG5cbiAgICAgICAgLy8gVHJhY2sgcmVhZCByZWNlaXB0cyBieSBldmVudCBJRC4gRm9yIGVhY2ggX3Nob3duXyBldmVudCBJRCwgd2Ugc3RvcmVcbiAgICAgICAgLy8gdGhlIGxpc3Qgb2YgcmVhZCByZWNlaXB0cyB0byBkaXNwbGF5OlxuICAgICAgICAvLyAgIFtcbiAgICAgICAgLy8gICAgICAge1xuICAgICAgICAvLyAgICAgICAgICAgdXNlcklkOiBzdHJpbmcsXG4gICAgICAgIC8vICAgICAgICAgICBtZW1iZXI6IFJvb21NZW1iZXIsXG4gICAgICAgIC8vICAgICAgICAgICB0czogbnVtYmVyLFxuICAgICAgICAvLyAgICAgICB9LFxuICAgICAgICAvLyAgIF1cbiAgICAgICAgLy8gVGhpcyBpcyByZWNvbXB1dGVkIG9uIGVhY2ggcmVuZGVyLiBJdCdzIG9ubHkgc3RvcmVkIG9uIHRoZSBjb21wb25lbnRcbiAgICAgICAgLy8gZm9yIGVhc2Ugb2YgcGFzc2luZyB0aGUgZGF0YSBhcm91bmQgc2luY2UgaXQncyBjb21wdXRlZCBpbiBvbmUgcGFzc1xuICAgICAgICAvLyBvdmVyIGFsbCBldmVudHMuXG4gICAgICAgIHRoaXMuX3JlYWRSZWNlaXB0c0J5RXZlbnQgPSB7fTtcblxuICAgICAgICAvLyBUcmFjayByZWFkIHJlY2VpcHRzIGJ5IHVzZXIgSUQuIEZvciBlYWNoIHVzZXIgSUQgd2UndmUgZXZlciBzaG93biBhXG4gICAgICAgIC8vIGEgcmVhZCByZWNlaXB0IGZvciwgd2Ugc3RvcmUgYW4gb2JqZWN0OlxuICAgICAgICAvLyAgIHtcbiAgICAgICAgLy8gICAgICAgbGFzdFNob3duRXZlbnRJZDogc3RyaW5nLFxuICAgICAgICAvLyAgICAgICByZWNlaXB0OiB7XG4gICAgICAgIC8vICAgICAgICAgICB1c2VySWQ6IHN0cmluZyxcbiAgICAgICAgLy8gICAgICAgICAgIG1lbWJlcjogUm9vbU1lbWJlcixcbiAgICAgICAgLy8gICAgICAgICAgIHRzOiBudW1iZXIsXG4gICAgICAgIC8vICAgICAgIH0sXG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyBzbyB0aGF0IHdlIGNhbiBhbHdheXMga2VlcCByZWNlaXB0cyBkaXNwbGF5ZWQgYnkgcmV2ZXJ0aW5nIGJhY2sgdG9cbiAgICAgICAgLy8gdGhlIGxhc3Qgc2hvd24gZXZlbnQgZm9yIHRoYXQgdXNlciBJRCB3aGVuIG5lZWRlZC4gVGhpcyBtYXkgZmVlbCBsaWtlXG4gICAgICAgIC8vIGl0IGR1cGxpY2F0ZXMgdGhlIHJlY2VpcHQgc3RvcmFnZSBpbiB0aGUgcm9vbSwgYnV0IGF0IHRoaXMgbGF5ZXIsIHdlXG4gICAgICAgIC8vIGFyZSB0cmFja2luZyBfc2hvd25fIGV2ZW50IElEcywgd2hpY2ggdGhlIEpTIFNESyBrbm93cyBub3RoaW5nIGFib3V0LlxuICAgICAgICAvLyBUaGlzIGlzIHJlY29tcHV0ZWQgb24gZWFjaCByZW5kZXIsIHVzaW5nIHRoZSBkYXRhIGZyb20gdGhlIHByZXZpb3VzXG4gICAgICAgIC8vIHJlbmRlciBhcyBvdXIgZmFsbGJhY2sgZm9yIGFueSB1c2VyIElEcyB3ZSBjYW4ndCBtYXRjaCBhIHJlY2VpcHQgdG8gYVxuICAgICAgICAvLyBkaXNwbGF5ZWQgZXZlbnQgaW4gdGhlIGN1cnJlbnQgcmVuZGVyIGN5Y2xlLlxuICAgICAgICB0aGlzLl9yZWFkUmVjZWlwdHNCeVVzZXJJZCA9IHt9O1xuXG4gICAgICAgIC8vIENhY2hlIGhpZGRlbiBldmVudHMgc2V0dGluZyBvbiBtb3VudCBzaW5jZSBTZXR0aW5ncyBpcyBleHBlbnNpdmUgdG9cbiAgICAgICAgLy8gcXVlcnksIGFuZCB3ZSBjaGVjayB0aGlzIGluIGEgaG90IGNvZGUgcGF0aC5cbiAgICAgICAgdGhpcy5fc2hvd0hpZGRlbkV2ZW50c0luVGltZWxpbmUgPVxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dIaWRkZW5FdmVudHNJblRpbWVsaW5lXCIpO1xuXG4gICAgICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX3JlYWRNYXJrZXJOb2RlID0gY3JlYXRlUmVmKCk7XG4gICAgICAgIHRoaXMuX3dob0lzVHlwaW5nID0gY3JlYXRlUmVmKCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbFBhbmVsID0gY3JlYXRlUmVmKCk7XG5cbiAgICAgICAgdGhpcy5fc2hvd1R5cGluZ05vdGlmaWNhdGlvbnNXYXRjaGVyUmVmID1cbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwic2hvd1R5cGluZ05vdGlmaWNhdGlvbnNcIiwgbnVsbCwgdGhpcy5vblNob3dUeXBpbmdOb3RpZmljYXRpb25zQ2hhbmdlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLl9zaG93VHlwaW5nTm90aWZpY2F0aW9uc1dhdGNoZXJSZWYpO1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgICAgICBpZiAocHJldlByb3BzLnJlYWRNYXJrZXJWaXNpYmxlICYmIHRoaXMucHJvcHMucmVhZE1hcmtlckV2ZW50SWQgIT09IHByZXZQcm9wcy5yZWFkTWFya2VyRXZlbnRJZCkge1xuICAgICAgICAgICAgY29uc3QgZ2hvc3RSZWFkTWFya2VycyA9IHRoaXMuc3RhdGUuZ2hvc3RSZWFkTWFya2VycztcbiAgICAgICAgICAgIGdob3N0UmVhZE1hcmtlcnMucHVzaChwcmV2UHJvcHMucmVhZE1hcmtlckV2ZW50SWQpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZ2hvc3RSZWFkTWFya2VycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25BY3Rpb24gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFwic2Nyb2xsX3RvX2JvdHRvbVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uU2hvd1R5cGluZ05vdGlmaWNhdGlvbnNDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd1R5cGluZ05vdGlmaWNhdGlvbnM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93VHlwaW5nTm90aWZpY2F0aW9uc1wiKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qIGdldCB0aGUgRE9NIG5vZGUgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiBldmVudCAqL1xuICAgIGdldE5vZGVGb3JFdmVudElkKGV2ZW50SWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50Tm9kZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudE5vZGVzW2V2ZW50SWRdO1xuICAgIH1cblxuICAgIC8qIHJldHVybiB0cnVlIGlmIHRoZSBjb250ZW50IGlzIGZ1bGx5IHNjcm9sbGVkIGRvd24gcmlnaHQgbm93OyBlbHNlIGZhbHNlLlxuICAgICAqL1xuICAgIGlzQXRCb3R0b20oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50ICYmIHRoaXMuX3Njcm9sbFBhbmVsLmN1cnJlbnQuaXNBdEJvdHRvbSgpO1xuICAgIH1cblxuICAgIC8qIGdldCB0aGUgY3VycmVudCBzY3JvbGwgc3RhdGUuIFNlZSBTY3JvbGxQYW5lbC5nZXRTY3JvbGxTdGF0ZSBmb3JcbiAgICAgKiBkZXRhaWxzLlxuICAgICAqXG4gICAgICogcmV0dXJucyBudWxsIGlmIHdlIGFyZSBub3QgbW91bnRlZC5cbiAgICAgKi9cbiAgICBnZXRTY3JvbGxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbFBhbmVsLmN1cnJlbnQgPyB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50LmdldFNjcm9sbFN0YXRlKCkgOiBudWxsO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgb25lIG9mOlxuICAgIC8vXG4gICAgLy8gIG51bGw6IHRoZXJlIGlzIG5vIHJlYWQgbWFya2VyXG4gICAgLy8gIC0xOiByZWFkIG1hcmtlciBpcyBhYm92ZSB0aGUgd2luZG93XG4gICAgLy8gICAwOiByZWFkIG1hcmtlciBpcyB3aXRoaW4gdGhlIHdpbmRvd1xuICAgIC8vICArMTogcmVhZCBtYXJrZXIgaXMgYmVsb3cgdGhlIHdpbmRvd1xuICAgIGdldFJlYWRNYXJrZXJQb3NpdGlvbigpIHtcbiAgICAgICAgY29uc3QgcmVhZE1hcmtlciA9IHRoaXMuX3JlYWRNYXJrZXJOb2RlLmN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VXcmFwcGVyID0gdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudDtcblxuICAgICAgICBpZiAoIXJlYWRNYXJrZXIgfHwgIW1lc3NhZ2VXcmFwcGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdyYXBwZXJSZWN0ID0gUmVhY3RET00uZmluZERPTU5vZGUobWVzc2FnZVdyYXBwZXIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCByZWFkTWFya2VyUmVjdCA9IHJlYWRNYXJrZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgLy8gdGhlIHJlYWQtbWFya2VyIHByZXRlbmRzIHRvIGhhdmUgemVybyBoZWlnaHQgd2hlbiBpdCBpcyBhY3R1YWxseVxuICAgICAgICAvLyB0d28gcGl4ZWxzIGhpZ2g7ICsyIGhlcmUgdG8gYWNjb3VudCBmb3IgdGhhdC5cbiAgICAgICAgaWYgKHJlYWRNYXJrZXJSZWN0LmJvdHRvbSArIDIgPCB3cmFwcGVyUmVjdC50b3ApIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChyZWFkTWFya2VyUmVjdC50b3AgPCB3cmFwcGVyUmVjdC5ib3R0b20pIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIGNvbnRlbnQuXG4gICAgICovXG4gICAgc2Nyb2xsVG9Ub3AoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50LnNjcm9sbFRvVG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBqdW1wIHRvIHRoZSBib3R0b20gb2YgdGhlIGNvbnRlbnQuXG4gICAgICovXG4gICAgc2Nyb2xsVG9Cb3R0b20oKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50LnNjcm9sbFRvQm90dG9tKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYWdlIHVwL2Rvd24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbXVsdDogLTEgdG8gcGFnZSB1cCwgKzEgdG8gcGFnZSBkb3duXG4gICAgICovXG4gICAgc2Nyb2xsUmVsYXRpdmUobXVsdCkge1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudC5zY3JvbGxSZWxhdGl2ZShtdWx0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNjcm9sbCB1cC9kb3duIGluIHJlc3BvbnNlIHRvIGEgc2Nyb2xsIGtleVxuICAgICAqXG4gICAgICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBldjogdGhlIGtleWJvYXJkIGV2ZW50IHRvIGhhbmRsZVxuICAgICAqL1xuICAgIGhhbmRsZVNjcm9sbEtleShldikge1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudC5oYW5kbGVTY3JvbGxLZXkoZXYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoganVtcCB0byB0aGUgZ2l2ZW4gZXZlbnQgaWQuXG4gICAgICpcbiAgICAgKiBvZmZzZXRCYXNlIGdpdmVzIHRoZSByZWZlcmVuY2UgcG9pbnQgZm9yIHRoZSBwaXhlbE9mZnNldC4gMCBtZWFucyB0aGVcbiAgICAgKiB0b3Agb2YgdGhlIGNvbnRhaW5lciwgMSBtZWFucyB0aGUgYm90dG9tLCBhbmQgZnJhY3Rpb25hbCB2YWx1ZXMgbWVhblxuICAgICAqIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlLiBJZiBvbWl0dGVkLCBpdCBkZWZhdWx0cyB0byAwLlxuICAgICAqXG4gICAgICogcGl4ZWxPZmZzZXQgZ2l2ZXMgdGhlIG51bWJlciBvZiBwaXhlbHMgKmFib3ZlKiB0aGUgb2Zmc2V0QmFzZSB0aGF0IHRoZVxuICAgICAqIG5vZGUgKHNwZWNpZmljYWxseSwgdGhlIGJvdHRvbSBvZiBpdCkgd2lsbCBiZSBwb3NpdGlvbmVkLiBJZiBvbWl0dGVkLCBpdFxuICAgICAqIGRlZmF1bHRzIHRvIDAuXG4gICAgICovXG4gICAgc2Nyb2xsVG9FdmVudChldmVudElkLCBwaXhlbE9mZnNldCwgb2Zmc2V0QmFzZSkge1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudC5zY3JvbGxUb1Rva2VuKGV2ZW50SWQsIHBpeGVsT2Zmc2V0LCBvZmZzZXRCYXNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNjcm9sbFRvRXZlbnRJZk5lZWRlZChldmVudElkKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmV2ZW50Tm9kZXNbZXZlbnRJZF07XG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICBub2RlLnNjcm9sbEludG9WaWV3KHtibG9jazogXCJuZWFyZXN0XCIsIGJlaGF2aW9yOiBcImluc3RhbnRcIn0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogY2hlY2sgdGhlIHNjcm9sbCBzdGF0ZSBhbmQgc2VuZCBvdXQgcGFnaW5hdGlvbiByZXF1ZXN0cyBpZiBuZWNlc3NhcnkuXG4gICAgICovXG4gICAgY2hlY2tGaWxsU3RhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50LmNoZWNrRmlsbFN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfaXNVbm1vdW50aW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gIXRoaXMuX2lzTW91bnRlZDtcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogSW1wbGVtZW50IGdyYW51bGFyIChwZXItcm9vbSkgaGlkZSBvcHRpb25zXG4gICAgX3Nob3VsZFNob3dFdmVudChteEV2KSB7XG4gICAgICAgIGlmIChteEV2LnNlbmRlciAmJiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNVc2VySWdub3JlZChteEV2LnNlbmRlci51c2VySWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIGlnbm9yZWQgPSBubyBzaG93IChvbmx5IGhhcHBlbnMgaWYgdGhlIGlnbm9yZSBoYXBwZW5zIGFmdGVyIGFuIGV2ZW50IHdhcyByZWNlaXZlZClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9zaG93SGlkZGVuRXZlbnRzSW5UaW1lbGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhdmVUaWxlRm9yRXZlbnQobXhFdikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gbm8gdGlsZSA9IG5vIHNob3dcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsd2F5cyBzaG93IGhpZ2hsaWdodGVkIGV2ZW50XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmhpZ2hsaWdodGVkRXZlbnRJZCA9PT0gbXhFdi5nZXRJZCgpKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gIXNob3VsZEhpZGVFdmVudChteEV2KTtcbiAgICB9XG5cbiAgICBfcmVhZE1hcmtlckZvckV2ZW50KGV2ZW50SWQsIGlzTGFzdEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHZpc2libGUgPSAhaXNMYXN0RXZlbnQgJiYgdGhpcy5wcm9wcy5yZWFkTWFya2VyVmlzaWJsZTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWFkTWFya2VyRXZlbnRJZCA9PT0gZXZlbnRJZCkge1xuICAgICAgICAgICAgbGV0IGhyO1xuICAgICAgICAgICAgLy8gaWYgdGhlIHJlYWQgbWFya2VyIGNvbWVzIGF0IHRoZSBlbmQgb2YgdGhlIHRpbWVsaW5lIChleGNlcHRcbiAgICAgICAgICAgIC8vIGZvciBsb2NhbCBlY2hvZXMsIHdoaWNoIGFyZSBleGNsdWRlZCBmcm9tIFJNcywgYmVjYXVzZSB0aGV5XG4gICAgICAgICAgICAvLyBkb24ndCBoYXZlIHVzZWZ1bCBldmVudCBpZHMpLCB3ZSBkb24ndCB3YW50IHRvIHNob3cgaXQsIGJ1dFxuICAgICAgICAgICAgLy8gd2Ugc3RpbGwgd2FudCB0byBjcmVhdGUgdGhlIDxsaS8+IGZvciBpdCBzbyB0aGF0IHRoZVxuICAgICAgICAgICAgLy8gYWxnb3JpdGhtcyB3aGljaCBkZXBlbmQgb24gaXRzIHBvc2l0aW9uIG9uIHRoZSBzY3JlZW4gYXJlbid0XG4gICAgICAgICAgICAvLyBjb25mdXNlZC5cbiAgICAgICAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgaHIgPSA8aHIgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfbXlSZWFkTWFya2VyXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tvcGFjaXR5OiAxLCB3aWR0aDogJzk5JSd9fVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxsaSBrZXk9e1wicmVhZE1hcmtlcl9cIitldmVudElkfVxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuX3JlYWRNYXJrZXJOb2RlfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tVmlld19teVJlYWRNYXJrZXJfY29udGFpbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1zY3JvbGwtdG9rZW5zPXtldmVudElkfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBociB9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5naG9zdFJlYWRNYXJrZXJzLmluY2x1ZGVzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAvLyBXZSByZW5kZXIgJ2dob3N0JyByZWFkIG1hcmtlcnMgaW4gdGhlIERPTSB3aGlsZSB0aGV5XG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uIGF3YXkuIFRoaXMgYWxsb3dzIHRoZSBhY3R1YWwgcmVhZCBtYXJrZXJcbiAgICAgICAgICAgIC8vIHRvIGJlIGluIHRoZSByaWdodCBwbGFjZSBzdHJhaWdodCBhd2F5IHdpdGhvdXQgaGF2aW5nXG4gICAgICAgICAgICAvLyB0byB3YWl0IGZvciB0aGUgdHJhbnNpdGlvbiB0byBmaW5pc2guXG4gICAgICAgICAgICAvLyBUaGVyZSBhcmUgcHJvYmFibHkgbXVjaCBzaW1wbGVyIHdheXMgdG8gZG8gdGhpcyB0cmFuc2l0aW9uLFxuICAgICAgICAgICAgLy8gcG9zc2libHkgdXNpbmcgcmVhY3QtdHJhbnNpdGlvbi1ncm91cCB3aGljaCBoYW5kbGVzIGtlZXBpbmdcbiAgICAgICAgICAgIC8vIGVsZW1lbnRzIGluIHRoZSBET00gd2hpbHN0IHRoZXkgdHJhbnNpdGlvbiBvdXQsIGFsdGhvdWdoIG91clxuICAgICAgICAgICAgLy8gY2FzZSBpcyBhIGxpdHRsZSBtb3JlIGNvbXBsZXggYmVjYXVzZSBvbmx5IHNvbWUgb2YgdGhlIGl0ZW1zXG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uIChpZS4gdGhlIHJlYWQgbWFya2VycyBkbyBidXQgdGhlIGV2ZW50IHRpbGVzIGRvIG5vdClcbiAgICAgICAgICAgIC8vIGFuZCBUcmFuc2l0aW9uR3JvdXAgcmVxdWlyZXMgdGhhdCBhbGwgaXRzIGNoaWxkcmVuIGFyZSBUcmFuc2l0aW9ucy5cbiAgICAgICAgICAgIGNvbnN0IGhyID0gPGhyIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X215UmVhZE1hcmtlclwiXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9jb2xsZWN0R2hvc3RSZWFkTWFya2VyfVxuICAgICAgICAgICAgICAgIG9uVHJhbnNpdGlvbkVuZD17dGhpcy5fb25HaG9zdFRyYW5zaXRpb25FbmR9XG4gICAgICAgICAgICAgICAgZGF0YS1ldmVudGlkPXtldmVudElkfVxuICAgICAgICAgICAgLz47XG5cbiAgICAgICAgICAgIC8vIGdpdmUgaXQgYSBrZXkgd2hpY2ggZGVwZW5kcyBvbiB0aGUgZXZlbnQgaWQuIFRoYXQgd2lsbCBlbnN1cmUgdGhhdFxuICAgICAgICAgICAgLy8gd2UgZ2V0IGEgbmV3IERPTSBub2RlIChyZXN0YXJ0aW5nIHRoZSBhbmltYXRpb24pIHdoZW4gdGhlIGdob3N0XG4gICAgICAgICAgICAvLyBtb3ZlcyB0byBhIGRpZmZlcmVudCBldmVudC5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGxpIGtleT17XCJfcmVhZHVwdG9naG9zdF9cIitldmVudElkfVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X215UmVhZE1hcmtlcl9jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBociB9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBfY29sbGVjdEdob3N0UmVhZE1hcmtlciA9IChub2RlKSA9PiB7XG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAvLyBub3cgdGhlIGVsZW1lbnQgaGFzIGFwcGVhcmVkLCBjaGFuZ2UgdGhlIHN0eWxlIHdoaWNoIHdpbGwgdHJpZ2dlciB0aGUgQ1NTIHRyYW5zaXRpb25cbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbm9kZS5zdHlsZS53aWR0aCA9ICcxMCUnO1xuICAgICAgICAgICAgICAgIG5vZGUuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vbkdob3N0VHJhbnNpdGlvbkVuZCA9IChldikgPT4ge1xuICAgICAgICAvLyB3ZSBjYW4gbm93IGNsZWFuIHVwIHRoZSBnaG9zdCBlbGVtZW50XG4gICAgICAgIGNvbnN0IGZpbmlzaGVkRXZlbnRJZCA9IGV2LnRhcmdldC5kYXRhc2V0LmV2ZW50aWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ2hvc3RSZWFkTWFya2VyczogdGhpcy5zdGF0ZS5naG9zdFJlYWRNYXJrZXJzLmZpbHRlcihlaWQgPT4gZWlkICE9PSBmaW5pc2hlZEV2ZW50SWQpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX2dldEV2ZW50VGlsZXMoKSB7XG4gICAgICAgIHRoaXMuZXZlbnROb2RlcyA9IHt9O1xuXG4gICAgICAgIGxldCBpO1xuXG4gICAgICAgIC8vIGZpcnN0IGZpZ3VyZSBvdXQgd2hpY2ggaXMgdGhlIGxhc3QgZXZlbnQgaW4gdGhlIGxpc3Qgd2hpY2ggd2UncmVcbiAgICAgICAgLy8gYWN0dWFsbHkgZ29pbmcgdG8gc2hvdzsgdGhpcyBhbGxvd3MgdXMgdG8gYmVoYXZlIHNsaWdodGx5XG4gICAgICAgIC8vIGRpZmZlcmVudGx5IGZvciB0aGUgbGFzdCBldmVudCBpbiB0aGUgbGlzdC4gKGVnIHNob3cgdGltZXN0YW1wKVxuICAgICAgICAvL1xuICAgICAgICAvLyB3ZSBhbHNvIG5lZWQgdG8gZmlndXJlIG91dCB3aGljaCBpcyB0aGUgbGFzdCBldmVudCB3ZSBzaG93IHdoaWNoIGlzbid0XG4gICAgICAgIC8vIGEgbG9jYWwgZWNobywgdG8gbWFuYWdlIHRoZSByZWFkLW1hcmtlci5cbiAgICAgICAgbGV0IGxhc3RTaG93bkV2ZW50O1xuXG4gICAgICAgIGxldCBsYXN0U2hvd25Ob25Mb2NhbEVjaG9JbmRleCA9IC0xO1xuICAgICAgICBmb3IgKGkgPSB0aGlzLnByb3BzLmV2ZW50cy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IG14RXYgPSB0aGlzLnByb3BzLmV2ZW50c1tpXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fc2hvdWxkU2hvd0V2ZW50KG14RXYpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYXN0U2hvd25FdmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGFzdFNob3duRXZlbnQgPSBteEV2O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobXhFdi5zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGEgbG9jYWwgZWNob1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXN0U2hvd25Ob25Mb2NhbEVjaG9JbmRleCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuXG4gICAgICAgIGxldCBwcmV2RXZlbnQgPSBudWxsOyAvLyB0aGUgbGFzdCBldmVudCB3ZSBzaG93ZWRcblxuICAgICAgICB0aGlzLl9yZWFkUmVjZWlwdHNCeUV2ZW50ID0ge307XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNob3dSZWFkUmVjZWlwdHMpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlYWRSZWNlaXB0c0J5RXZlbnQgPSB0aGlzLl9nZXRSZWFkUmVjZWlwdHNCeVNob3duRXZlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBncm91cGVyID0gbnVsbDtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5wcm9wcy5ldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG14RXYgPSB0aGlzLnByb3BzLmV2ZW50c1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SWQgPSBteEV2LmdldElkKCk7XG4gICAgICAgICAgICBjb25zdCBsYXN0ID0gKG14RXYgPT09IGxhc3RTaG93bkV2ZW50KTtcblxuICAgICAgICAgICAgaWYgKGdyb3VwZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBlci5zaG91bGRHcm91cChteEV2KSkge1xuICAgICAgICAgICAgICAgICAgICBncm91cGVyLmFkZChteEV2KTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90IHBhcnQgb2YgZ3JvdXAsIHNvIGdldCB0aGUgZ3JvdXAgdGlsZXMsIGNsb3NlIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBncm91cCwgYW5kIGNvbnRpbnVlIGxpa2UgYSBub3JtYWwgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goLi4uZ3JvdXBlci5nZXRUaWxlcygpKTtcbiAgICAgICAgICAgICAgICAgICAgcHJldkV2ZW50ID0gZ3JvdXBlci5nZXROZXdQcmV2RXZlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IEdyb3VwZXIgb2YgZ3JvdXBlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoR3JvdXBlci5jYW5TdGFydEdyb3VwKHRoaXMsIG14RXYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwZXIgPSBuZXcgR3JvdXBlcih0aGlzLCBteEV2LCBwcmV2RXZlbnQsIGxhc3RTaG93bkV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWdyb3VwZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YW50VGlsZSA9IHRoaXMuX3Nob3VsZFNob3dFdmVudChteEV2KTtcbiAgICAgICAgICAgICAgICBpZiAod2FudFRpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dEV2ZW50ID0gaSA8IHRoaXMucHJvcHMuZXZlbnRzLmxlbmd0aCAtIDFcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5wcm9wcy5ldmVudHNbaSArIDFdXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSB1bnBhY2sgdGhlIGFycmF5IHJldHVybmVkIGJ5IF9nZXRUaWxlc0ZvckV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgcmVhY3Qgd2lsbCBhdXRvLWdlbmVyYXRlIGtleXMgYW5kIHdlIHdpbGwgZW5kIHVwXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlcGxhY2luZyBhbGwgb2YgdGhlIERPTSBlbGVtZW50cyBldmVyeSB0aW1lIHdlIHBhZ2luYXRlLlxuICAgICAgICAgICAgICAgICAgICByZXQucHVzaCguLi50aGlzLl9nZXRUaWxlc0ZvckV2ZW50KHByZXZFdmVudCwgbXhFdiwgbGFzdCwgbmV4dEV2ZW50KSk7XG4gICAgICAgICAgICAgICAgICAgIHByZXZFdmVudCA9IG14RXY7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVhZE1hcmtlciA9IHRoaXMuX3JlYWRNYXJrZXJGb3JFdmVudChldmVudElkLCBpID49IGxhc3RTaG93bk5vbkxvY2FsRWNob0luZGV4KTtcbiAgICAgICAgICAgICAgICBpZiAocmVhZE1hcmtlcikgcmV0LnB1c2gocmVhZE1hcmtlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ3JvdXBlcikge1xuICAgICAgICAgICAgcmV0LnB1c2goLi4uZ3JvdXBlci5nZXRUaWxlcygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgX2dldFRpbGVzRm9yRXZlbnQocHJldkV2ZW50LCBteEV2LCBsYXN0LCBuZXh0RXZlbnQpIHtcbiAgICAgICAgY29uc3QgVGlsZUVycm9yQm91bmRhcnkgPSBzZGsuZ2V0Q29tcG9uZW50KCdtZXNzYWdlcy5UaWxlRXJyb3JCb3VuZGFyeScpO1xuICAgICAgICBjb25zdCBFdmVudFRpbGUgPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5FdmVudFRpbGUnKTtcbiAgICAgICAgY29uc3QgRGF0ZVNlcGFyYXRvciA9IHNkay5nZXRDb21wb25lbnQoJ21lc3NhZ2VzLkRhdGVTZXBhcmF0b3InKTtcbiAgICAgICAgY29uc3QgcmV0ID0gW107XG5cbiAgICAgICAgY29uc3QgaXNFZGl0aW5nID0gdGhpcy5wcm9wcy5lZGl0U3RhdGUgJiZcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZWRpdFN0YXRlLmdldEV2ZW50KCkuZ2V0SWQoKSA9PT0gbXhFdi5nZXRJZCgpO1xuXG4gICAgICAgIC8vIGxvY2FsIGVjaG9lcyBoYXZlIGEgZmFrZSBkYXRlLCB3aGljaCBjb3VsZCBldmVuIGJlIHllc3RlcmRheS4gVHJlYXQgdGhlbVxuICAgICAgICAvLyBhcyAndG9kYXknIGZvciB0aGUgZGF0ZSBzZXBhcmF0b3JzLlxuICAgICAgICBsZXQgdHMxID0gbXhFdi5nZXRUcygpO1xuICAgICAgICBsZXQgZXZlbnREYXRlID0gbXhFdi5nZXREYXRlKCk7XG4gICAgICAgIGlmIChteEV2LnN0YXR1cykge1xuICAgICAgICAgICAgZXZlbnREYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHRzMSA9IGV2ZW50RGF0ZS5nZXRUaW1lKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkbyB3ZSBuZWVkIGEgZGF0ZSBzZXBhcmF0b3Igc2luY2UgdGhlIGxhc3QgZXZlbnQ/XG4gICAgICAgIGNvbnN0IHdhbnRzRGF0ZVNlcGFyYXRvciA9IHRoaXMuX3dhbnRzRGF0ZVNlcGFyYXRvcihwcmV2RXZlbnQsIGV2ZW50RGF0ZSk7XG4gICAgICAgIGlmICh3YW50c0RhdGVTZXBhcmF0b3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGVTZXBhcmF0b3IgPSA8bGkga2V5PXt0czF9PjxEYXRlU2VwYXJhdG9yIGtleT17dHMxfSB0cz17dHMxfSAvPjwvbGk+O1xuICAgICAgICAgICAgcmV0LnB1c2goZGF0ZVNlcGFyYXRvcik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgd2lsbFdhbnREYXRlU2VwYXJhdG9yID0gZmFsc2U7XG4gICAgICAgIGlmIChuZXh0RXZlbnQpIHtcbiAgICAgICAgICAgIHdpbGxXYW50RGF0ZVNlcGFyYXRvciA9IHRoaXMuX3dhbnRzRGF0ZVNlcGFyYXRvcihteEV2LCBuZXh0RXZlbnQuZ2V0RGF0ZSgpIHx8IG5ldyBEYXRlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaXMgdGhpcyBhIGNvbnRpbnVhdGlvbiBvZiB0aGUgcHJldmlvdXMgbWVzc2FnZT9cbiAgICAgICAgY29uc3QgY29udGludWF0aW9uID0gIXdhbnRzRGF0ZVNlcGFyYXRvciAmJiBzaG91bGRGb3JtQ29udGludWF0aW9uKHByZXZFdmVudCwgbXhFdik7XG5cbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IG14RXYuZ2V0SWQoKTtcbiAgICAgICAgY29uc3QgaGlnaGxpZ2h0ID0gKGV2ZW50SWQgPT09IHRoaXMucHJvcHMuaGlnaGxpZ2h0ZWRFdmVudElkKTtcblxuICAgICAgICAvLyB3ZSBjYW4ndCB1c2UgbG9jYWwgZWNob2VzIGFzIHNjcm9sbCB0b2tlbnMsIGJlY2F1c2UgdGhlaXIgZXZlbnQgSURzIGNoYW5nZS5cbiAgICAgICAgLy8gTG9jYWwgZWNob3MgaGF2ZSBhIHNlbmQgXCJzdGF0dXNcIi5cbiAgICAgICAgY29uc3Qgc2Nyb2xsVG9rZW4gPSBteEV2LnN0YXR1cyA/IHVuZGVmaW5lZCA6IGV2ZW50SWQ7XG5cbiAgICAgICAgY29uc3QgcmVhZFJlY2VpcHRzID0gdGhpcy5fcmVhZFJlY2VpcHRzQnlFdmVudFtldmVudElkXTtcblxuICAgICAgICAvLyB1c2UgdHhuSWQgYXMga2V5IGlmIGF2YWlsYWJsZSBzbyB0aGF0IHdlIGRvbid0IHJlbW91bnQgZHVyaW5nIHNlbmRpbmdcbiAgICAgICAgcmV0LnB1c2goXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgICBrZXk9e214RXYuZ2V0VHhuSWQoKSB8fCBldmVudElkfVxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5fY29sbGVjdEV2ZW50Tm9kZS5iaW5kKHRoaXMsIGV2ZW50SWQpfVxuICAgICAgICAgICAgICAgIGRhdGEtc2Nyb2xsLXRva2Vucz17c2Nyb2xsVG9rZW59XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRpbGVFcnJvckJvdW5kYXJ5IG14RXZlbnQ9e214RXZ9PlxuICAgICAgICAgICAgICAgICAgICA8RXZlbnRUaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXtteEV2fVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWF0aW9uPXtjb250aW51YXRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1JlZGFjdGVkPXtteEV2LmlzUmVkYWN0ZWQoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2luZ0V2ZW50SWQ9e214RXYucmVwbGFjaW5nRXZlbnRJZCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdFN0YXRlPXtpc0VkaXRpbmcgJiYgdGhpcy5wcm9wcy5lZGl0U3RhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ9e3RoaXMuX29uSGVpZ2h0Q2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRSZWNlaXB0cz17cmVhZFJlY2VpcHRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZFJlY2VpcHRNYXA9e3RoaXMuX3JlYWRSZWNlaXB0TWFwfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1VybFByZXZpZXc9e3RoaXMucHJvcHMuc2hvd1VybFByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja1VubW91bnRpbmc9e3RoaXMuX2lzVW5tb3VudGluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50U2VuZFN0YXR1cz17bXhFdi5nZXRBc3NvY2lhdGVkU3RhdHVzKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWxlU2hhcGU9e3RoaXMucHJvcHMudGlsZVNoYXBlfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNUd2VsdmVIb3VyPXt0aGlzLnByb3BzLmlzVHdlbHZlSG91cn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q9e2xhc3R9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0SW5TZWN0aW9uPXt3aWxsV2FudERhdGVTZXBhcmF0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkRXZlbnQ9e2hpZ2hsaWdodH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50PXt0aGlzLnByb3BzLmdldFJlbGF0aW9uc0ZvckV2ZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1JlYWN0aW9ucz17dGhpcy5wcm9wcy5zaG93UmVhY3Rpb25zfVxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlSVJDTGF5b3V0PXt0aGlzLnByb3BzLnVzZUlSQ0xheW91dH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZUZsYWlyPXt0aGlzLnByb3BzLmVuYWJsZUZsYWlyfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvVGlsZUVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICA8L2xpPixcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIF93YW50c0RhdGVTZXBhcmF0b3IocHJldkV2ZW50LCBuZXh0RXZlbnREYXRlKSB7XG4gICAgICAgIGlmIChwcmV2RXZlbnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gZmlyc3QgZXZlbnQgaW4gdGhlIHBhbmVsOiBkZXBlbmRzIGlmIHdlIGNvdWxkIGJhY2stcGFnaW5hdGUgZnJvbVxuICAgICAgICAgICAgLy8gaGVyZS5cbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5wcm9wcy5zdXBwcmVzc0ZpcnN0RGF0ZVNlcGFyYXRvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2FudHNEYXRlU2VwYXJhdG9yKHByZXZFdmVudC5nZXREYXRlKCksIG5leHRFdmVudERhdGUpO1xuICAgIH1cblxuICAgIC8vIEdldCBhIGxpc3Qgb2YgcmVhZCByZWNlaXB0cyB0aGF0IHNob3VsZCBiZSBzaG93biBuZXh0IHRvIHRoaXMgZXZlbnRcbiAgICAvLyBSZWNlaXB0cyBhcmUgb2JqZWN0cyB3aGljaCBoYXZlIGEgJ3VzZXJJZCcsICdyb29tTWVtYmVyJyBhbmQgJ3RzJy5cbiAgICBfZ2V0UmVhZFJlY2VpcHRzRm9yRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgbXlVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkO1xuXG4gICAgICAgIC8vIGdldCBsaXN0IG9mIHJlYWQgcmVjZWlwdHMsIHNvcnRlZCBtb3N0IHJlY2VudCBmaXJzdFxuICAgICAgICBjb25zdCB7IHJvb20gfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVjZWlwdHMgPSBbXTtcbiAgICAgICAgcm9vbS5nZXRSZWNlaXB0c0ZvckV2ZW50KGV2ZW50KS5mb3JFYWNoKChyKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXIudXNlcklkIHx8IHIudHlwZSAhPT0gXCJtLnJlYWRcIiB8fCByLnVzZXJJZCA9PT0gbXlVc2VySWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIGlnbm9yZSBub24tcmVhZCByZWNlaXB0cyBhbmQgcmVjZWlwdHMgZnJvbSBzZWxmLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1VzZXJJZ25vcmVkKHIudXNlcklkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gaWdub3JlIGlnbm9yZWQgdXNlcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IHJvb20uZ2V0TWVtYmVyKHIudXNlcklkKTtcbiAgICAgICAgICAgIHJlY2VpcHRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHVzZXJJZDogci51c2VySWQsXG4gICAgICAgICAgICAgICAgcm9vbU1lbWJlcjogbWVtYmVyLFxuICAgICAgICAgICAgICAgIHRzOiByLmRhdGEgPyByLmRhdGEudHMgOiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVjZWlwdHM7XG4gICAgfVxuXG4gICAgLy8gR2V0IGFuIG9iamVjdCB0aGF0IG1hcHMgZnJvbSBldmVudCBJRCB0byBhIGxpc3Qgb2YgcmVhZCByZWNlaXB0cyB0aGF0XG4gICAgLy8gc2hvdWxkIGJlIHNob3duIG5leHQgdG8gdGhhdCBldmVudC4gSWYgYSBoaWRkZW4gZXZlbnQgaGFzIHJlYWQgcmVjZWlwdHMsXG4gICAgLy8gdGhleSBhcmUgZm9sZGVkIGludG8gdGhlIHJlY2VpcHRzIG9mIHRoZSBsYXN0IHNob3duIGV2ZW50LlxuICAgIF9nZXRSZWFkUmVjZWlwdHNCeVNob3duRXZlbnQoKSB7XG4gICAgICAgIGNvbnN0IHJlY2VpcHRzQnlFdmVudCA9IHt9O1xuICAgICAgICBjb25zdCByZWNlaXB0c0J5VXNlcklkID0ge307XG5cbiAgICAgICAgbGV0IGxhc3RTaG93bkV2ZW50SWQ7XG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgdGhpcy5wcm9wcy5ldmVudHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zaG91bGRTaG93RXZlbnQoZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgbGFzdFNob3duRXZlbnRJZCA9IGV2ZW50LmdldElkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWxhc3RTaG93bkV2ZW50SWQpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdSZWNlaXB0cyA9IHJlY2VpcHRzQnlFdmVudFtsYXN0U2hvd25FdmVudElkXSB8fCBbXTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1JlY2VpcHRzID0gdGhpcy5fZ2V0UmVhZFJlY2VpcHRzRm9yRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgcmVjZWlwdHNCeUV2ZW50W2xhc3RTaG93bkV2ZW50SWRdID0gZXhpc3RpbmdSZWNlaXB0cy5jb25jYXQobmV3UmVjZWlwdHMpO1xuXG4gICAgICAgICAgICAvLyBSZWNvcmQgdGhlc2UgcmVjZWlwdHMgYWxvbmcgd2l0aCB0aGVpciBsYXN0IHNob3duIGV2ZW50IElEIGZvclxuICAgICAgICAgICAgLy8gZWFjaCBhc3NvY2lhdGVkIHVzZXIgSUQuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlY2VpcHQgb2YgbmV3UmVjZWlwdHMpIHtcbiAgICAgICAgICAgICAgICByZWNlaXB0c0J5VXNlcklkW3JlY2VpcHQudXNlcklkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNob3duRXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgcmVjZWlwdCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSXQncyBwb3NzaWJsZSBpbiBzb21lIGNhc2VzIChmb3IgZXhhbXBsZSwgd2hlbiBhIHJlYWQgcmVjZWlwdFxuICAgICAgICAvLyBhZHZhbmNlcyBiZWZvcmUgd2UgaGF2ZSBwYWdpbmF0ZWQgaW4gdGhlIG5ldyBldmVudCB0aGF0IGl0J3MgbWFya2luZ1xuICAgICAgICAvLyByZWNlaXZlZCkgdGhhdCB3ZSBjYW4gdGVtcG9yYXJpbHkgbm90IGhhdmUgYSBtYXRjaGluZyBldmVudCBmb3JcbiAgICAgICAgLy8gc29tZW9uZSB3aGljaCBoYWQgb25lIGluIHRoZSBsYXN0LiBCeSBsb29raW5nIHRocm91Z2ggb3VyIHByZXZpb3VzXG4gICAgICAgIC8vIG1hcHBpbmcgb2YgcmVjZWlwdHMgYnkgdXNlciBJRCwgd2UgY2FuIGNvdmVyIHJlY292ZXIgYW55IHJlY2VpcHRzXG4gICAgICAgIC8vIHRoYXQgd291bGQgaGF2ZSBiZWVuIGxvc3QgYnkgdXNpbmcgdGhlIHNhbWUgZXZlbnQgSUQgZnJvbSBsYXN0IHRpbWUuXG4gICAgICAgIGZvciAoY29uc3QgdXNlcklkIGluIHRoaXMuX3JlYWRSZWNlaXB0c0J5VXNlcklkKSB7XG4gICAgICAgICAgICBpZiAocmVjZWlwdHNCeVVzZXJJZFt1c2VySWRdKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGxhc3RTaG93bkV2ZW50SWQsIHJlY2VpcHQgfSA9IHRoaXMuX3JlYWRSZWNlaXB0c0J5VXNlcklkW3VzZXJJZF07XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1JlY2VpcHRzID0gcmVjZWlwdHNCeUV2ZW50W2xhc3RTaG93bkV2ZW50SWRdIHx8IFtdO1xuICAgICAgICAgICAgcmVjZWlwdHNCeUV2ZW50W2xhc3RTaG93bkV2ZW50SWRdID0gZXhpc3RpbmdSZWNlaXB0cy5jb25jYXQocmVjZWlwdCk7XG4gICAgICAgICAgICByZWNlaXB0c0J5VXNlcklkW3VzZXJJZF0gPSB7IGxhc3RTaG93bkV2ZW50SWQsIHJlY2VpcHQgfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZWFkUmVjZWlwdHNCeVVzZXJJZCA9IHJlY2VpcHRzQnlVc2VySWQ7XG5cbiAgICAgICAgLy8gQWZ0ZXIgZ3JvdXBpbmcgcmVjZWlwdHMgYnkgc2hvd24gZXZlbnRzLCBkbyBhbm90aGVyIHBhc3MgdG8gc29ydCBlYWNoXG4gICAgICAgIC8vIHJlY2VpcHQgbGlzdC5cbiAgICAgICAgZm9yIChjb25zdCBldmVudElkIGluIHJlY2VpcHRzQnlFdmVudCkge1xuICAgICAgICAgICAgcmVjZWlwdHNCeUV2ZW50W2V2ZW50SWRdLnNvcnQoKHIxLCByMikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByMi50cyAtIHIxLnRzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVjZWlwdHNCeUV2ZW50O1xuICAgIH1cblxuICAgIF9jb2xsZWN0RXZlbnROb2RlID0gKGV2ZW50SWQsIG5vZGUpID0+IHtcbiAgICAgICAgdGhpcy5ldmVudE5vZGVzW2V2ZW50SWRdID0gbm9kZTtcbiAgICB9XG5cbiAgICAvLyBvbmNlIGR5bmFtaWMgY29udGVudCBpbiB0aGUgZXZlbnRzIGxvYWQsIG1ha2UgdGhlIHNjcm9sbFBhbmVsIGNoZWNrIHRoZVxuICAgIC8vIHNjcm9sbCBvZmZzZXRzLlxuICAgIF9vbkhlaWdodENoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjcm9sbFBhbmVsID0gdGhpcy5fc2Nyb2xsUGFuZWwuY3VycmVudDtcbiAgICAgICAgaWYgKHNjcm9sbFBhbmVsKSB7XG4gICAgICAgICAgICBzY3JvbGxQYW5lbC5jaGVja1Njcm9sbCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vblR5cGluZ1Nob3duID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JvbGxQYW5lbCA9IHRoaXMuX3Njcm9sbFBhbmVsLmN1cnJlbnQ7XG4gICAgICAgIC8vIHRoaXMgd2lsbCBtYWtlIHRoZSB0aW1lbGluZSBncm93LCBzbyBjaGVja1Njcm9sbFxuICAgICAgICBzY3JvbGxQYW5lbC5jaGVja1Njcm9sbCgpO1xuICAgICAgICBpZiAoc2Nyb2xsUGFuZWwgJiYgc2Nyb2xsUGFuZWwuZ2V0U2Nyb2xsU3RhdGUoKS5zdHVja0F0Qm90dG9tKSB7XG4gICAgICAgICAgICBzY3JvbGxQYW5lbC5wcmV2ZW50U2hyaW5raW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uVHlwaW5nSGlkZGVuID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JvbGxQYW5lbCA9IHRoaXMuX3Njcm9sbFBhbmVsLmN1cnJlbnQ7XG4gICAgICAgIGlmIChzY3JvbGxQYW5lbCkge1xuICAgICAgICAgICAgLy8gYXMgaGlkaW5nIHRoZSB0eXBpbmcgbm90aWZpY2F0aW9ucyBkb2Vzbid0XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHNjcm9sbFBhbmVsLCB3ZSB0ZWxsIGl0IHRvIGFwcGx5XG4gICAgICAgICAgICAvLyB0aGUgc2hyaW5raW5nIHByZXZlbnRpb24gb25jZSB0aGUgdHlwaW5nIG5vdGlmcyBhcmUgaGlkZGVuXG4gICAgICAgICAgICBzY3JvbGxQYW5lbC51cGRhdGVQcmV2ZW50U2hyaW5raW5nKCk7XG4gICAgICAgICAgICAvLyBvcmRlciBpcyBpbXBvcnRhbnQgaGVyZSBhcyBjaGVja1Njcm9sbCB3aWxsIHNjcm9sbCBkb3duIHRvXG4gICAgICAgICAgICAvLyByZXZlYWwgYWRkZWQgcGFkZGluZyB0byBiYWxhbmNlIHRoZSBub3RpZnMgZGlzYXBwZWFyaW5nLlxuICAgICAgICAgICAgc2Nyb2xsUGFuZWwuY2hlY2tTY3JvbGwoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB1cGRhdGVUaW1lbGluZU1pbkhlaWdodCgpIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsUGFuZWwgPSB0aGlzLl9zY3JvbGxQYW5lbC5jdXJyZW50O1xuXG4gICAgICAgIGlmIChzY3JvbGxQYW5lbCkge1xuICAgICAgICAgICAgY29uc3QgaXNBdEJvdHRvbSA9IHNjcm9sbFBhbmVsLmlzQXRCb3R0b20oKTtcbiAgICAgICAgICAgIGNvbnN0IHdob0lzVHlwaW5nID0gdGhpcy5fd2hvSXNUeXBpbmcuY3VycmVudDtcbiAgICAgICAgICAgIGNvbnN0IGlzVHlwaW5nVmlzaWJsZSA9IHdob0lzVHlwaW5nICYmIHdob0lzVHlwaW5nLmlzVmlzaWJsZSgpO1xuICAgICAgICAgICAgLy8gd2hlbiBtZXNzYWdlcyBnZXQgYWRkZWQgdG8gdGhlIHRpbWVsaW5lLFxuICAgICAgICAgICAgLy8gYnV0IHNvbWVib2R5IGVsc2UgaXMgc3RpbGwgdHlwaW5nLFxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBtaW4taGVpZ2h0LCBzbyBvbmNlIHRoZSBsYXN0XG4gICAgICAgICAgICAvLyBwZXJzb24gc3RvcHMgdHlwaW5nLCBubyBqdW1waW5nIG9jY3Vyc1xuICAgICAgICAgICAgaWYgKGlzQXRCb3R0b20gJiYgaXNUeXBpbmdWaXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsUGFuZWwucHJldmVudFNocmlua2luZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25UaW1lbGluZVJlc2V0KCkge1xuICAgICAgICBjb25zdCBzY3JvbGxQYW5lbCA9IHRoaXMuX3Njcm9sbFBhbmVsLmN1cnJlbnQ7XG4gICAgICAgIGlmIChzY3JvbGxQYW5lbCkge1xuICAgICAgICAgICAgc2Nyb2xsUGFuZWwuY2xlYXJQcmV2ZW50U2hyaW5raW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEVycm9yQm91bmRhcnkgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5FcnJvckJvdW5kYXJ5Jyk7XG4gICAgICAgIGNvbnN0IFNjcm9sbFBhbmVsID0gc2RrLmdldENvbXBvbmVudChcInN0cnVjdHVyZXMuU2Nyb2xsUGFuZWxcIik7XG4gICAgICAgIGNvbnN0IFdob0lzVHlwaW5nVGlsZSA9IHNkay5nZXRDb21wb25lbnQoXCJyb29tcy5XaG9Jc1R5cGluZ1RpbGVcIik7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgbGV0IHRvcFNwaW5uZXI7XG4gICAgICAgIGxldCBib3R0b21TcGlubmVyO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5iYWNrUGFnaW5hdGluZykge1xuICAgICAgICAgICAgdG9wU3Bpbm5lciA9IDxsaSBrZXk9XCJfdG9wU3Bpbm5lclwiPjxTcGlubmVyIC8+PC9saT47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZm9yd2FyZFBhZ2luYXRpbmcpIHtcbiAgICAgICAgICAgIGJvdHRvbVNwaW5uZXIgPSA8bGkga2V5PVwiX2JvdHRvbVNwaW5uZXJcIj48U3Bpbm5lciAvPjwvbGk+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3R5bGUgPSB0aGlzLnByb3BzLmhpZGRlbiA/IHsgZGlzcGxheTogJ25vbmUnIH0gOiB7fTtcblxuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJteF9NZXNzYWdlUGFuZWxfYWx3YXlzU2hvd1RpbWVzdGFtcHNcIjogdGhpcy5wcm9wcy5hbHdheXNTaG93VGltZXN0YW1wcyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IHdob0lzVHlwaW5nO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yb29tICYmICF0aGlzLnByb3BzLnRpbGVTaGFwZSAmJiB0aGlzLnN0YXRlLnNob3dUeXBpbmdOb3RpZmljYXRpb25zKSB7XG4gICAgICAgICAgICB3aG9Jc1R5cGluZyA9ICg8V2hvSXNUeXBpbmdUaWxlXG4gICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgIG9uU2hvd249e3RoaXMuX29uVHlwaW5nU2hvd259XG4gICAgICAgICAgICAgICAgb25IaWRkZW49e3RoaXMuX29uVHlwaW5nSGlkZGVufVxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5fd2hvSXNUeXBpbmd9IC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGlyY1Jlc2l6ZXIgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy51c2VJUkNMYXlvdXQpIHtcbiAgICAgICAgICAgIGlyY1Jlc2l6ZXIgPSA8SVJDVGltZWxpbmVQcm9maWxlUmVzaXplclxuICAgICAgICAgICAgICAgIG1pbldpZHRoPXsyMH1cbiAgICAgICAgICAgICAgICBtYXhXaWR0aD17NjAwfVxuICAgICAgICAgICAgICAgIHJvb21JZD17dGhpcy5wcm9wcy5yb29tID8gdGhpcy5wcm9wcy5yb29tLnJvb21JZCA6IG51bGx9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICA8U2Nyb2xsUGFuZWxcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9zY3JvbGxQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLnByb3BzLm9uU2Nyb2xsfVxuICAgICAgICAgICAgICAgICAgICBvblJlc2l6ZT17dGhpcy5vblJlc2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgb25GaWxsUmVxdWVzdD17dGhpcy5wcm9wcy5vbkZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgICAgICBvblVuZmlsbFJlcXVlc3Q9e3RoaXMucHJvcHMub25VbmZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgICAgICAgICAgICAgIHN0aWNreUJvdHRvbT17dGhpcy5wcm9wcy5zdGlja3lCb3R0b219XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICBmaXhlZENoaWxkcmVuPXtpcmNSZXNpemVyfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyB0b3BTcGlubmVyIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLl9nZXRFdmVudFRpbGVzKCkgfVxuICAgICAgICAgICAgICAgICAgICB7IHdob0lzVHlwaW5nIH1cbiAgICAgICAgICAgICAgICAgICAgeyBib3R0b21TcGlubmVyIH1cbiAgICAgICAgICAgICAgICA8L1Njcm9sbFBhbmVsPlxuICAgICAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuLyogR3JvdXBlciBjbGFzc2VzIGRldGVybWluZSB3aGVuIGV2ZW50cyBjYW4gYmUgZ3JvdXBlZCB0b2dldGhlciBpbiBhIHN1bW1hcnkuXG4gKiBHcm91cGVycyBzaG91bGQgaGF2ZSB0aGUgZm9sbG93aW5nIG1ldGhvZHM6XG4gKiAtIGNhblN0YXJ0R3JvdXAgKHN0YXRpYyk6IGRldGVybWluZXMgaWYgYSBuZXcgZ3JvdXAgc2hvdWxkIGJlIHN0YXJ0ZWQgd2l0aCB0aGVcbiAqICAgZ2l2ZW4gZXZlbnRcbiAqIC0gc2hvdWxkR3JvdXA6IGRldGVybWluZXMgaWYgdGhlIGdpdmVuIGV2ZW50IHNob3VsZCBiZSBhZGRlZCB0byBhbiBleGlzdGluZyBncm91cFxuICogLSBhZGQ6IGFkZHMgYW4gZXZlbnQgdG8gYW4gZXhpc3RpbmcgZ3JvdXAgKHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpZiBzaG91bGRHcm91cFxuICogICByZXR1cm4gdHJ1ZSlcbiAqIC0gZ2V0VGlsZXM6IHJldHVybnMgdGhlIHRpbGVzIHRoYXQgcmVwcmVzZW50IHRoZSBncm91cFxuICogLSBnZXROZXdQcmV2RXZlbnQ6IHJldHVybnMgdGhlIGV2ZW50IHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgdGhlIG5ldyBwcmV2RXZlbnRcbiAqICAgd2hlbiBkZXRlcm1pbmluZyB0aGluZ3Mgc3VjaCBhcyB3aGV0aGVyIGEgZGF0ZSBzZXBhcmF0b3IgaXMgbmVjZXNzYXJ5XG4gKi9cblxuLy8gV3JhcCBpbml0aWFsIHJvb20gY3JlYXRpb24gZXZlbnRzIGludG8gYW4gRXZlbnRMaXN0U3VtbWFyeVxuLy8gR3JvdXBpbmcgb25seSBldmVudHMgc2VudCBieSB0aGUgc2FtZSB1c2VyIHRoYXQgc2VudCB0aGUgYG0ucm9vbS5jcmVhdGVgIGFuZCBvbmx5IHVudGlsXG4vLyB0aGUgZmlyc3Qgbm9uLXN0YXRlIGV2ZW50IG9yIG1lbWJlcnNoaXAgZXZlbnQgd2hpY2ggaXMgbm90IHJlZ2FyZGluZyB0aGUgc2VuZGVyIG9mIHRoZSBgbS5yb29tLmNyZWF0ZWAgZXZlbnRcbmNsYXNzIENyZWF0aW9uR3JvdXBlciB7XG4gICAgc3RhdGljIGNhblN0YXJ0R3JvdXAgPSBmdW5jdGlvbihwYW5lbCwgZXYpIHtcbiAgICAgICAgcmV0dXJuIGV2LmdldFR5cGUoKSA9PT0gXCJtLnJvb20uY3JlYXRlXCI7XG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHBhbmVsLCBjcmVhdGVFdmVudCwgcHJldkV2ZW50LCBsYXN0U2hvd25FdmVudCkge1xuICAgICAgICB0aGlzLnBhbmVsID0gcGFuZWw7XG4gICAgICAgIHRoaXMuY3JlYXRlRXZlbnQgPSBjcmVhdGVFdmVudDtcbiAgICAgICAgdGhpcy5wcmV2RXZlbnQgPSBwcmV2RXZlbnQ7XG4gICAgICAgIHRoaXMubGFzdFNob3duRXZlbnQgPSBsYXN0U2hvd25FdmVudDtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICAgICAgLy8gZXZlbnRzIHRoYXQgd2UgaW5jbHVkZSBpbiB0aGUgZ3JvdXAgYnV0IHRoZW4gZWplY3Qgb3V0IGFuZCBwbGFjZVxuICAgICAgICAvLyBhYm92ZSB0aGUgZ3JvdXAuXG4gICAgICAgIHRoaXMuZWplY3RlZEV2ZW50cyA9IFtdO1xuICAgICAgICB0aGlzLnJlYWRNYXJrZXIgPSBwYW5lbC5fcmVhZE1hcmtlckZvckV2ZW50KFxuICAgICAgICAgICAgY3JlYXRlRXZlbnQuZ2V0SWQoKSxcbiAgICAgICAgICAgIGNyZWF0ZUV2ZW50ID09PSBsYXN0U2hvd25FdmVudCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzaG91bGRHcm91cChldikge1xuICAgICAgICBjb25zdCBwYW5lbCA9IHRoaXMucGFuZWw7XG4gICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudDtcbiAgICAgICAgaWYgKCFwYW5lbC5fc2hvdWxkU2hvd0V2ZW50KGV2KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhbmVsLl93YW50c0RhdGVTZXBhcmF0b3IodGhpcy5jcmVhdGVFdmVudCwgZXYuZ2V0RGF0ZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IFwibS5yb29tLm1lbWJlclwiXG4gICAgICAgICAgICAmJiAoZXYuZ2V0U3RhdGVLZXkoKSAhPT0gY3JlYXRlRXZlbnQuZ2V0U2VuZGVyKCkgfHwgZXYuZ2V0Q29udGVudCgpW1wibWVtYmVyc2hpcFwiXSAhPT0gXCJqb2luXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2LmlzU3RhdGUoKSAmJiBldi5nZXRTZW5kZXIoKSA9PT0gY3JlYXRlRXZlbnQuZ2V0U2VuZGVyKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhZGQoZXYpIHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLnBhbmVsO1xuICAgICAgICB0aGlzLnJlYWRNYXJrZXIgPSB0aGlzLnJlYWRNYXJrZXIgfHwgcGFuZWwuX3JlYWRNYXJrZXJGb3JFdmVudChcbiAgICAgICAgICAgIGV2LmdldElkKCksXG4gICAgICAgICAgICBldiA9PT0gdGhpcy5sYXN0U2hvd25FdmVudCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFwYW5lbC5fc2hvdWxkU2hvd0V2ZW50KGV2KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IFwibS5yb29tLmVuY3J5cHRpb25cIikge1xuICAgICAgICAgICAgdGhpcy5lamVjdGVkRXZlbnRzLnB1c2goZXYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ldmVudHMucHVzaChldik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRUaWxlcygpIHtcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbnkgZXZlbnRzIHRvIGdyb3VwLCBkb24ndCBldmVuIHRyeSB0byBncm91cCB0aGVtLiBUaGUgbG9naWNcbiAgICAgICAgLy8gYmVsb3cgYXNzdW1lcyB0aGF0IHdlIGhhdmUgYSBncm91cCBvZiBldmVudHMgdG8gZGVhbCB3aXRoLCBidXQgd2UgbWlnaHQgbm90IGlmXG4gICAgICAgIC8vIHRoZSBldmVudHMgd2Ugd2VyZSBzdXBwb3NlZCB0byBncm91cCB3ZXJlIHJlZGFjdGVkLlxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzIHx8ICF0aGlzLmV2ZW50cy5sZW5ndGgpIHJldHVybiBbXTtcblxuICAgICAgICBjb25zdCBEYXRlU2VwYXJhdG9yID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuRGF0ZVNlcGFyYXRvcicpO1xuICAgICAgICBjb25zdCBFdmVudExpc3RTdW1tYXJ5ID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRXZlbnRMaXN0U3VtbWFyeScpO1xuXG4gICAgICAgIGNvbnN0IHBhbmVsID0gdGhpcy5wYW5lbDtcbiAgICAgICAgY29uc3QgcmV0ID0gW107XG4gICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudDtcbiAgICAgICAgY29uc3QgbGFzdFNob3duRXZlbnQgPSB0aGlzLmxhc3RTaG93bkV2ZW50O1xuXG4gICAgICAgIGlmIChwYW5lbC5fd2FudHNEYXRlU2VwYXJhdG9yKHRoaXMucHJldkV2ZW50LCBjcmVhdGVFdmVudC5nZXREYXRlKCkpKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGNyZWF0ZUV2ZW50LmdldFRzKCk7XG4gICAgICAgICAgICByZXQucHVzaChcbiAgICAgICAgICAgICAgICA8bGkga2V5PXt0cysnfid9PjxEYXRlU2VwYXJhdG9yIGtleT17dHMrJ34nfSB0cz17dHN9IC8+PC9saT4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhpcyBtLnJvb20uY3JlYXRlIGV2ZW50IHNob3VsZCBiZSBzaG93biAocm9vbSB1cGdyYWRlKSB0aGVuIHNob3cgaXQgYmVmb3JlIHRoZSBzdW1tYXJ5XG4gICAgICAgIGlmIChwYW5lbC5fc2hvdWxkU2hvd0V2ZW50KGNyZWF0ZUV2ZW50KSkge1xuICAgICAgICAgICAgLy8gcGFzcyBpbiB0aGUgY3JlYXRlRXZlbnQgYXMgcHJldkV2ZW50IGFzIHdlbGwgc28gbm8gZXh0cmEgRGF0ZVNlcGFyYXRvciBpcyByZW5kZXJlZFxuICAgICAgICAgICAgcmV0LnB1c2goLi4ucGFuZWwuX2dldFRpbGVzRm9yRXZlbnQoY3JlYXRlRXZlbnQsIGNyZWF0ZUV2ZW50LCBmYWxzZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBlamVjdGVkIG9mIHRoaXMuZWplY3RlZEV2ZW50cykge1xuICAgICAgICAgICAgcmV0LnB1c2goLi4ucGFuZWwuX2dldFRpbGVzRm9yRXZlbnQoXG4gICAgICAgICAgICAgICAgY3JlYXRlRXZlbnQsIGVqZWN0ZWQsIGNyZWF0ZUV2ZW50ID09PSBsYXN0U2hvd25FdmVudCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXZlbnRUaWxlcyA9IHRoaXMuZXZlbnRzLm1hcCgoZSkgPT4ge1xuICAgICAgICAgICAgLy8gSW4gb3JkZXIgdG8gcHJldmVudCBEYXRlU2VwYXJhdG9ycyBmcm9tIGFwcGVhcmluZyBpbiB0aGUgZXhwYW5kZWQgZm9ybVxuICAgICAgICAgICAgLy8gb2YgRXZlbnRMaXN0U3VtbWFyeSwgcmVuZGVyIGVhY2ggbWVtYmVyIGV2ZW50IGFzIGlmIHRoZSBwcmV2aW91c1xuICAgICAgICAgICAgLy8gb25lIHdhcyBpdHNlbGYuIFRoaXMgd2F5LCB0aGUgdGltZXN0YW1wIG9mIHRoZSBwcmV2aW91cyBldmVudCA9PT0gdGhlXG4gICAgICAgICAgICAvLyB0aW1lc3RhbXAgb2YgdGhlIGN1cnJlbnQgZXZlbnQsIGFuZCBubyBEYXRlU2VwYXJhdG9yIGlzIGluc2VydGVkLlxuICAgICAgICAgICAgcmV0dXJuIHBhbmVsLl9nZXRUaWxlc0ZvckV2ZW50KGUsIGUsIGUgPT09IGxhc3RTaG93bkV2ZW50KTtcbiAgICAgICAgfSkucmVkdWNlKChhLCBiKSA9PiBhLmNvbmNhdChiKSwgW10pO1xuICAgICAgICAvLyBHZXQgc2VuZGVyIHByb2ZpbGUgZnJvbSB0aGUgbGF0ZXN0IGV2ZW50IGluIHRoZSBzdW1tYXJ5IGFzIHRoZSBtLnJvb20uY3JlYXRlIGRvZXNuJ3QgY29udGFpbiBvbmVcbiAgICAgICAgY29uc3QgZXYgPSB0aGlzLmV2ZW50c1t0aGlzLmV2ZW50cy5sZW5ndGggLSAxXTtcblxuICAgICAgICBsZXQgc3VtbWFyeVRleHQ7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IGV2LmdldFJvb21JZCgpO1xuICAgICAgICBjb25zdCBjcmVhdG9yID0gZXYuc2VuZGVyID8gZXYuc2VuZGVyLm5hbWUgOiBldi5nZXRTZW5kZXIoKTtcbiAgICAgICAgaWYgKERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbUlkKSkge1xuICAgICAgICAgICAgc3VtbWFyeVRleHQgPSBfdChcIiUoY3JlYXRvcilzIGNyZWF0ZWQgdGhpcyBETS5cIiwgeyBjcmVhdG9yIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VtbWFyeVRleHQgPSBfdChcIiUoY3JlYXRvcilzIGNyZWF0ZWQgYW5kIGNvbmZpZ3VyZWQgdGhlIHJvb20uXCIsIHsgY3JlYXRvciB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldC5wdXNoKDxOZXdSb29tSW50cm8ga2V5PVwibmV3cm9vbWludHJvXCIgLz4pO1xuXG4gICAgICAgIHJldC5wdXNoKFxuICAgICAgICAgICAgPEV2ZW50TGlzdFN1bW1hcnlcbiAgICAgICAgICAgICAgICAga2V5PVwicm9vbWNyZWF0aW9uc3VtbWFyeVwiXG4gICAgICAgICAgICAgICAgIGV2ZW50cz17dGhpcy5ldmVudHN9XG4gICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXtwYW5lbC5fb25IZWlnaHRDaGFuZ2VkfSAvLyBVcGRhdGUgc2Nyb2xsIHN0YXRlXG4gICAgICAgICAgICAgICAgIHN1bW1hcnlNZW1iZXJzPXtbZXYuc2VuZGVyXX1cbiAgICAgICAgICAgICAgICAgc3VtbWFyeVRleHQ9e3N1bW1hcnlUZXh0fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICB7IGV2ZW50VGlsZXMgfVxuICAgICAgICAgICAgPC9FdmVudExpc3RTdW1tYXJ5PixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5yZWFkTWFya2VyKSB7XG4gICAgICAgICAgICByZXQucHVzaCh0aGlzLnJlYWRNYXJrZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBnZXROZXdQcmV2RXZlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUV2ZW50O1xuICAgIH1cbn1cblxuLy8gV3JhcCBjb25zZWN1dGl2ZSBtZW1iZXIgZXZlbnRzIGluIGEgTGlzdFN1bW1hcnksIGlnbm9yZSBpZiByZWRhY3RlZFxuY2xhc3MgTWVtYmVyR3JvdXBlciB7XG4gICAgc3RhdGljIGNhblN0YXJ0R3JvdXAgPSBmdW5jdGlvbihwYW5lbCwgZXYpIHtcbiAgICAgICAgcmV0dXJuIHBhbmVsLl9zaG91bGRTaG93RXZlbnQoZXYpICYmIGlzTWVtYmVyc2hpcENoYW5nZShldik7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocGFuZWwsIGV2LCBwcmV2RXZlbnQsIGxhc3RTaG93bkV2ZW50KSB7XG4gICAgICAgIHRoaXMucGFuZWwgPSBwYW5lbDtcbiAgICAgICAgdGhpcy5yZWFkTWFya2VyID0gcGFuZWwuX3JlYWRNYXJrZXJGb3JFdmVudChcbiAgICAgICAgICAgIGV2LmdldElkKCksXG4gICAgICAgICAgICBldiA9PT0gbGFzdFNob3duRXZlbnQsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW2V2XTtcbiAgICAgICAgdGhpcy5wcmV2RXZlbnQgPSBwcmV2RXZlbnQ7XG4gICAgICAgIHRoaXMubGFzdFNob3duRXZlbnQgPSBsYXN0U2hvd25FdmVudDtcbiAgICB9XG5cbiAgICBzaG91bGRHcm91cChldikge1xuICAgICAgICBpZiAodGhpcy5wYW5lbC5fd2FudHNEYXRlU2VwYXJhdG9yKHRoaXMuZXZlbnRzWzBdLCBldi5nZXREYXRlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzTWVtYmVyc2hpcENoYW5nZShldik7XG4gICAgfVxuXG4gICAgYWRkKGV2KSB7XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09ICdtLnJvb20ubWVtYmVyJykge1xuICAgICAgICAgICAgLy8gV2UnbGwganVzdCBkb3VibGUgY2hlY2sgdGhhdCBpdCdzIHdvcnRoIG91ciB0aW1lIHRvIGRvIHNvLCB0aHJvdWdoIGFuXG4gICAgICAgICAgICAvLyB1Z2x5IGhhY2suIElmIHRleHRGb3JFdmVudCByZXR1cm5zIHNvbWV0aGluZywgd2Ugc2hvdWxkIGdyb3VwIGl0IGZvclxuICAgICAgICAgICAgLy8gcmVuZGVyaW5nIGJ1dCBpZiBpdCBkb2Vzbid0IHRoZW4gd2UnbGwgZXhjbHVkZSBpdC5cbiAgICAgICAgICAgIGNvbnN0IHJlbmRlclRleHQgPSB0ZXh0Rm9yRXZlbnQoZXYpO1xuICAgICAgICAgICAgaWYgKCFyZW5kZXJUZXh0IHx8IHJlbmRlclRleHQudHJpbSgpLmxlbmd0aCA9PT0gMCkgcmV0dXJuOyAvLyBxdWlldGx5IGlnbm9yZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVhZE1hcmtlciA9IHRoaXMucmVhZE1hcmtlciB8fCB0aGlzLnBhbmVsLl9yZWFkTWFya2VyRm9yRXZlbnQoXG4gICAgICAgICAgICBldi5nZXRJZCgpLFxuICAgICAgICAgICAgZXYgPT09IHRoaXMubGFzdFNob3duRXZlbnQsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZXZlbnRzLnB1c2goZXYpO1xuICAgIH1cblxuICAgIGdldFRpbGVzKCkge1xuICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGFueSBldmVudHMgdG8gZ3JvdXAsIGRvbid0IGV2ZW4gdHJ5IHRvIGdyb3VwIHRoZW0uIFRoZSBsb2dpY1xuICAgICAgICAvLyBiZWxvdyBhc3N1bWVzIHRoYXQgd2UgaGF2ZSBhIGdyb3VwIG9mIGV2ZW50cyB0byBkZWFsIHdpdGgsIGJ1dCB3ZSBtaWdodCBub3QgaWZcbiAgICAgICAgLy8gdGhlIGV2ZW50cyB3ZSB3ZXJlIHN1cHBvc2VkIHRvIGdyb3VwIHdlcmUgcmVkYWN0ZWQuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMgfHwgIXRoaXMuZXZlbnRzLmxlbmd0aCkgcmV0dXJuIFtdO1xuXG4gICAgICAgIGNvbnN0IERhdGVTZXBhcmF0b3IgPSBzZGsuZ2V0Q29tcG9uZW50KCdtZXNzYWdlcy5EYXRlU2VwYXJhdG9yJyk7XG4gICAgICAgIGNvbnN0IE1lbWJlckV2ZW50TGlzdFN1bW1hcnkgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5NZW1iZXJFdmVudExpc3RTdW1tYXJ5Jyk7XG5cbiAgICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLnBhbmVsO1xuICAgICAgICBjb25zdCBsYXN0U2hvd25FdmVudCA9IHRoaXMubGFzdFNob3duRXZlbnQ7XG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuXG4gICAgICAgIGlmIChwYW5lbC5fd2FudHNEYXRlU2VwYXJhdG9yKHRoaXMucHJldkV2ZW50LCB0aGlzLmV2ZW50c1swXS5nZXREYXRlKCkpKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IHRoaXMuZXZlbnRzWzBdLmdldFRzKCk7XG4gICAgICAgICAgICByZXQucHVzaChcbiAgICAgICAgICAgICAgICA8bGkga2V5PXt0cysnfid9PjxEYXRlU2VwYXJhdG9yIGtleT17dHMrJ34nfSB0cz17dHN9IC8+PC9saT4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIGtleSBvZiB0aGUgTWVtYmVyRXZlbnRMaXN0U3VtbWFyeSBkb2VzIG5vdCBjaGFuZ2Ugd2l0aCBuZXdcbiAgICAgICAgLy8gbWVtYmVyIGV2ZW50cy4gVGhpcyB3aWxsIHByZXZlbnQgaXQgZnJvbSBiZWluZyByZS1jcmVhdGVkIHVubmVjZXNzYXJpbHksIGFuZFxuICAgICAgICAvLyBpbnN0ZWFkIHdpbGwgYWxsb3cgbmV3IHByb3BzIHRvIGJlIHByb3ZpZGVkLiBJbiB0dXJuLCB0aGUgc2hvdWxkQ29tcG9uZW50VXBkYXRlXG4gICAgICAgIC8vIG1ldGhvZCBvbiBNRUxTIGNhbiBiZSB1c2VkIHRvIHByZXZlbnQgdW5uZWNlc3NhcnkgcmVuZGVyaW5ncy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2hpbHN0IGJhY2stcGFnaW5hdGluZyB3aXRoIGEgTUVMUyBhdCB0aGUgdG9wIG9mIHRoZSBwYW5lbCwgcHJldkV2ZW50IHdpbGwgYmUgbnVsbCxcbiAgICAgICAgLy8gc28gdXNlIHRoZSBrZXkgXCJtZW1iZXJldmVudGxpc3RzdW1tYXJ5LWluaXRpYWxcIi4gT3RoZXJ3aXNlLCB1c2UgdGhlIElEIG9mIHRoZSBmaXJzdFxuICAgICAgICAvLyBtZW1iZXJzaGlwIGV2ZW50LCB3aGljaCB3aWxsIG5vdCBjaGFuZ2UgZHVyaW5nIGZvcndhcmQgcGFnaW5hdGlvbi5cbiAgICAgICAgY29uc3Qga2V5ID0gXCJtZW1iZXJldmVudGxpc3RzdW1tYXJ5LVwiICsgKFxuICAgICAgICAgICAgdGhpcy5wcmV2RXZlbnQgPyB0aGlzLmV2ZW50c1swXS5nZXRJZCgpIDogXCJpbml0aWFsXCJcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgaGlnaGxpZ2h0SW5NZWxzO1xuICAgICAgICBsZXQgZXZlbnRUaWxlcyA9IHRoaXMuZXZlbnRzLm1hcCgoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUuZ2V0SWQoKSA9PT0gcGFuZWwucHJvcHMuaGlnaGxpZ2h0ZWRFdmVudElkKSB7XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0SW5NZWxzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEluIG9yZGVyIHRvIHByZXZlbnQgRGF0ZVNlcGFyYXRvcnMgZnJvbSBhcHBlYXJpbmcgaW4gdGhlIGV4cGFuZGVkIGZvcm1cbiAgICAgICAgICAgIC8vIG9mIE1lbWJlckV2ZW50TGlzdFN1bW1hcnksIHJlbmRlciBlYWNoIG1lbWJlciBldmVudCBhcyBpZiB0aGUgcHJldmlvdXNcbiAgICAgICAgICAgIC8vIG9uZSB3YXMgaXRzZWxmLiBUaGlzIHdheSwgdGhlIHRpbWVzdGFtcCBvZiB0aGUgcHJldmlvdXMgZXZlbnQgPT09IHRoZVxuICAgICAgICAgICAgLy8gdGltZXN0YW1wIG9mIHRoZSBjdXJyZW50IGV2ZW50LCBhbmQgbm8gRGF0ZVNlcGFyYXRvciBpcyBpbnNlcnRlZC5cbiAgICAgICAgICAgIHJldHVybiBwYW5lbC5fZ2V0VGlsZXNGb3JFdmVudChlLCBlLCBlID09PSBsYXN0U2hvd25FdmVudCk7XG4gICAgICAgIH0pLnJlZHVjZSgoYSwgYikgPT4gYS5jb25jYXQoYiksIFtdKTtcblxuICAgICAgICBpZiAoZXZlbnRUaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGV2ZW50VGlsZXMgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0LnB1c2goXG4gICAgICAgICAgICA8TWVtYmVyRXZlbnRMaXN0U3VtbWFyeSBrZXk9e2tleX1cbiAgICAgICAgICAgICAgICAgZXZlbnRzPXt0aGlzLmV2ZW50c31cbiAgICAgICAgICAgICAgICAgb25Ub2dnbGU9e3BhbmVsLl9vbkhlaWdodENoYW5nZWR9IC8vIFVwZGF0ZSBzY3JvbGwgc3RhdGVcbiAgICAgICAgICAgICAgICAgc3RhcnRFeHBhbmRlZD17aGlnaGxpZ2h0SW5NZWxzfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICB7IGV2ZW50VGlsZXMgfVxuICAgICAgICAgICAgPC9NZW1iZXJFdmVudExpc3RTdW1tYXJ5PixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5yZWFkTWFya2VyKSB7XG4gICAgICAgICAgICByZXQucHVzaCh0aGlzLnJlYWRNYXJrZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBnZXROZXdQcmV2RXZlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50c1swXTtcbiAgICB9XG59XG5cbi8vIGFsbCB0aGUgZ3JvdXBlciBjbGFzc2VzIHRoYXQgd2UgdXNlXG5jb25zdCBncm91cGVycyA9IFtDcmVhdGlvbkdyb3VwZXIsIE1lbWJlckdyb3VwZXJdO1xuIl19
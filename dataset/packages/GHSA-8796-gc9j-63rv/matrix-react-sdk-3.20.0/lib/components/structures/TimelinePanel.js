"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _Layout = require("../../settings/Layout");

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _timelineWindow = require("matrix-js-sdk/src/timeline-window");

var _languageHandler = require("../../languageHandler");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _UserActivity = _interopRequireDefault(require("../../UserActivity"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var sdk = _interopRequireWildcard(require("../../index"));

var _Keyboard = require("../../Keyboard");

var _Timer = _interopRequireDefault(require("../../utils/Timer"));

var _shouldHideEvent = _interopRequireDefault(require("../../shouldHideEvent"));

var _EditorStateTransfer = _interopRequireDefault(require("../../utils/EditorStateTransfer"));

var _EventTile = require("../views/rooms/EventTile");

var _UIFeature = require("../../settings/UIFeature");

var _objects = require("../../utils/objects");

var _replaceableComponent = require("../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

const PAGINATE_SIZE = 20;
const INITIAL_SIZE = 20;
const READ_RECEIPT_INTERVAL_MS = 500;
const DEBUG = false;

let debuglog = function () {};

if (DEBUG) {
  // using bind means that we get to keep useful line numbers in the console
  debuglog = console.log.bind(console);
}
/*
 * Component which shows the event timeline in a room view.
 *
 * Also responsible for handling and sending read receipts.
 */


let TimelinePanel = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.TimelinePanel"), _dec(_class = (_temp = _class2 = class TimelinePanel extends _react.default.Component {
  // a map from room id to read marker event timestamp
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onMessageListUnfillRequest", (backwards, scrollToken) => {
      // If backwards, unpaginate from the back (i.e. the start of the timeline)
      const dir = backwards ? _eventTimeline.EventTimeline.BACKWARDS : _eventTimeline.EventTimeline.FORWARDS;
      debuglog("TimelinePanel: unpaginating events in direction", dir); // All tiles are inserted by MessagePanel to have a scrollToken === eventId, and
      // this particular event should be the first or last to be unpaginated.

      const eventId = scrollToken;
      const marker = this.state.events.findIndex(ev => {
        return ev.getId() === eventId;
      });
      const count = backwards ? marker + 1 : this.state.events.length - marker;

      if (count > 0) {
        debuglog("TimelinePanel: Unpaginating", count, "in direction", dir);

        this._timelineWindow.unpaginate(count, backwards); // We can now paginate in the unpaginated direction


        const canPaginateKey = backwards ? 'canBackPaginate' : 'canForwardPaginate';

        const {
          events,
          liveEvents,
          firstVisibleEventIndex
        } = this._getEvents();

        this.setState({
          [canPaginateKey]: true,
          events,
          liveEvents,
          firstVisibleEventIndex
        });
      }
    });
    (0, _defineProperty2.default)(this, "onPaginationRequest", (timelineWindow, direction, size) => {
      if (this.props.onPaginationRequest) {
        return this.props.onPaginationRequest(timelineWindow, direction, size);
      } else {
        return timelineWindow.paginate(direction, size);
      }
    });
    (0, _defineProperty2.default)(this, "onMessageListFillRequest", backwards => {
      if (!this._shouldPaginate()) return Promise.resolve(false);
      const dir = backwards ? _eventTimeline.EventTimeline.BACKWARDS : _eventTimeline.EventTimeline.FORWARDS;
      const canPaginateKey = backwards ? 'canBackPaginate' : 'canForwardPaginate';
      const paginatingKey = backwards ? 'backPaginating' : 'forwardPaginating';

      if (!this.state[canPaginateKey]) {
        debuglog("TimelinePanel: have given up", dir, "paginating this timeline");
        return Promise.resolve(false);
      }

      if (!this._timelineWindow.canPaginate(dir)) {
        debuglog("TimelinePanel: can't", dir, "paginate any further");
        this.setState({
          [canPaginateKey]: false
        });
        return Promise.resolve(false);
      }

      if (backwards && this.state.firstVisibleEventIndex !== 0) {
        debuglog("TimelinePanel: won't", dir, "paginate past first visible event");
        return Promise.resolve(false);
      }

      debuglog("TimelinePanel: Initiating paginate; backwards:" + backwards);
      this.setState({
        [paginatingKey]: true
      });
      return this.onPaginationRequest(this._timelineWindow, dir, PAGINATE_SIZE).then(r => {
        if (this.unmounted) {
          return;
        }

        debuglog("TimelinePanel: paginate complete backwards:" + backwards + "; success:" + r);

        const {
          events,
          liveEvents,
          firstVisibleEventIndex
        } = this._getEvents();

        const newState = {
          [paginatingKey]: false,
          [canPaginateKey]: r,
          events,
          liveEvents,
          firstVisibleEventIndex
        }; // moving the window in this direction may mean that we can now
        // paginate in the other where we previously could not.

        const otherDirection = backwards ? _eventTimeline.EventTimeline.FORWARDS : _eventTimeline.EventTimeline.BACKWARDS;
        const canPaginateOtherWayKey = backwards ? 'canForwardPaginate' : 'canBackPaginate';

        if (!this.state[canPaginateOtherWayKey] && this._timelineWindow.canPaginate(otherDirection)) {
          debuglog('TimelinePanel: can now', otherDirection, 'paginate again');
          newState[canPaginateOtherWayKey] = true;
        } // Don't resolve until the setState has completed: we need to let
        // the component update before we consider the pagination completed,
        // otherwise we'll end up paginating in all the history the js-sdk
        // has in memory because we never gave the component a chance to scroll
        // itself into the right place


        return new Promise(resolve => {
          this.setState(newState, () => {
            // we can continue paginating in the given direction if:
            // - _timelineWindow.paginate says we can
            // - we're paginating forwards, or we won't be trying to
            //   paginate backwards past the first visible event
            resolve(r && (!backwards || firstVisibleEventIndex === 0));
          });
        });
      });
    });
    (0, _defineProperty2.default)(this, "onMessageListScroll", e => {
      if (this.props.onScroll) {
        this.props.onScroll(e);
      }

      if (this.props.manageReadMarkers) {
        const rmPosition = this.getReadMarkerPosition(); // we hide the read marker when it first comes onto the screen, but if
        // it goes back off the top of the screen (presumably because the user
        // clicks on the 'jump to bottom' button), we need to re-enable it.

        if (rmPosition < 0) {
          this.setState({
            readMarkerVisible: true
          });
        } // if read marker position goes between 0 and -1/1,
        // (and user is active), switch timeout


        const timeout = this._readMarkerTimeout(rmPosition); // NO-OP when timeout already has set to the given value


        this._readMarkerActivityTimer.changeTimeout(timeout);
      }
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === 'ignore_state_changed') {
        this.forceUpdate();
      }

      if (payload.action === "edit_event") {
        const editState = payload.event ? new _EditorStateTransfer.default(payload.event) : null;
        this.setState({
          editState
        }, () => {
          if (payload.event && this._messagePanel.current) {
            this._messagePanel.current.scrollToEventIfNeeded(payload.event.getId());
          }
        });
      }

      if (payload.action === "scroll_to_bottom") {
        this.jumpToLiveTimeline();
      }
    });
    (0, _defineProperty2.default)(this, "onRoomTimeline", (ev, room, toStartOfTimeline, removed, data) => {
      // ignore events for other timeline sets
      if (data.timeline.getTimelineSet() !== this.props.timelineSet) return; // ignore anything but real-time updates at the end of the room:
      // updates from pagination will happen when the paginate completes.

      if (toStartOfTimeline || !data || !data.liveEvent) return;
      if (!this._messagePanel.current) return;

      if (!this._messagePanel.current.getScrollState().stuckAtBottom) {
        // we won't load this event now, because we don't want to push any
        // events off the other end of the timeline. But we need to note
        // that we can now paginate.
        this.setState({
          canForwardPaginate: true
        });
        return;
      } // tell the timeline window to try to advance itself, but not to make
      // an http request to do so.
      //
      // we deliberately avoid going via the ScrollPanel for this call - the
      // ScrollPanel might already have an active pagination promise, which
      // will fail, but would stop us passing the pagination request to the
      // timeline window.
      //
      // see https://github.com/vector-im/vector-web/issues/1035


      this._timelineWindow.paginate(_eventTimeline.EventTimeline.FORWARDS, 1, false).then(() => {
        if (this.unmounted) {
          return;
        }

        const {
          events,
          liveEvents,
          firstVisibleEventIndex
        } = this._getEvents();

        const lastLiveEvent = liveEvents[liveEvents.length - 1];
        const updatedState = {
          events,
          liveEvents,
          firstVisibleEventIndex
        };
        let callRMUpdated;

        if (this.props.manageReadMarkers) {
          // when a new event arrives when the user is not watching the
          // window, but the window is in its auto-scroll mode, make sure the
          // read marker is visible.
          //
          // We ignore events we have sent ourselves; we don't want to see the
          // read-marker when a remote echo of an event we have just sent takes
          // more than the timeout on userActiveRecently.
          //
          const myUserId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId;

          const sender = ev.sender ? ev.sender.userId : null;
          callRMUpdated = false;

          if (sender != myUserId && !_UserActivity.default.sharedInstance().userActiveRecently()) {
            updatedState.readMarkerVisible = true;
          } else if (lastLiveEvent && this.getReadMarkerPosition() === 0) {
            // we know we're stuckAtBottom, so we can advance the RM
            // immediately, to save a later render cycle
            this._setReadMarker(lastLiveEvent.getId(), lastLiveEvent.getTs(), true);

            updatedState.readMarkerVisible = false;
            updatedState.readMarkerEventId = lastLiveEvent.getId();
            callRMUpdated = true;
          }
        }

        this.setState(updatedState, () => {
          this._messagePanel.current.updateTimelineMinHeight();

          if (callRMUpdated) {
            this.props.onReadMarkerUpdated();
          }
        });
      });
    });
    (0, _defineProperty2.default)(this, "onRoomTimelineReset", (room, timelineSet) => {
      if (timelineSet !== this.props.timelineSet) return;

      if (this._messagePanel.current && this._messagePanel.current.isAtBottom()) {
        this._loadTimeline();
      }
    });
    (0, _defineProperty2.default)(this, "canResetTimeline", () => this._messagePanel.current && this._messagePanel.current.isAtBottom());
    (0, _defineProperty2.default)(this, "onRoomRedaction", (ev, room) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (room !== this.props.timelineSet.room) return; // we could skip an update if the event isn't in our timeline,
      // but that's probably an early optimisation.

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onEventReplaced", (replacedEvent, room) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (room !== this.props.timelineSet.room) return; // we could skip an update if the event isn't in our timeline,
      // but that's probably an early optimisation.

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onRoomReceipt", (ev, room) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (room !== this.props.timelineSet.room) return;
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onLocalEchoUpdated", (ev, room, oldEventId) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (room !== this.props.timelineSet.room) return;

      this._reloadEvents();
    });
    (0, _defineProperty2.default)(this, "onAccountData", (ev, room) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (room !== this.props.timelineSet.room) return;
      if (ev.getType() !== "m.fully_read") return; // XXX: roomReadMarkerTsMap not updated here so it is now inconsistent. Replace
      // this mechanism of determining where the RM is relative to the view-port with
      // one supported by the server (the client needs more than an event ID).

      this.setState({
        readMarkerEventId: ev.getContent().event_id
      }, this.props.onReadMarkerUpdated);
    });
    (0, _defineProperty2.default)(this, "onEventDecrypted", ev => {
      // Can be null for the notification timeline, etc.
      if (!this.props.timelineSet.room) return; // Need to update as we don't display event tiles for events that
      // haven't yet been decrypted. The event will have just been updated
      // in place so we just need to re-render.
      // TODO: We should restrict this to only events in our timeline,
      // but possibly the event tile itself should just update when this
      // happens to save us re-rendering the whole timeline.

      if (ev.getRoomId() === this.props.timelineSet.room.roomId) {
        this.forceUpdate();
      }
    });
    (0, _defineProperty2.default)(this, "onSync", (state, prevState, data) => {
      this.setState({
        clientSyncState: state
      });
    });
    (0, _defineProperty2.default)(this, "sendReadReceipt", () => {
      if (_SettingsStore.default.getValue("lowBandwidth")) return;
      if (!this._messagePanel.current) return;
      if (!this.props.manageReadReceipts) return; // This happens on user_activity_end which is delayed, and it's
      // very possible have logged out within that timeframe, so check
      // we still have a client.

      const cli = _MatrixClientPeg.MatrixClientPeg.get(); // if no client or client is guest don't send RR or RM


      if (!cli || cli.isGuest()) return;
      let shouldSendRR = true;

      const currentRREventId = this._getCurrentReadReceipt(true);

      const currentRREventIndex = this._indexForEventId(currentRREventId); // We want to avoid sending out read receipts when we are looking at
      // events in the past which are before the latest RR.
      //
      // For now, let's apply a heuristic: if (a) the event corresponding to
      // the latest RR (either from the server, or sent by ourselves) doesn't
      // appear in our timeline, and (b) we could forward-paginate the event
      // timeline, then don't send any more RRs.
      //
      // This isn't watertight, as we could be looking at a section of
      // timeline which is *after* the latest RR (so we should actually send
      // RRs) - but that is a bit of a niche case. It will sort itself out when
      // the user eventually hits the live timeline.
      //


      if (currentRREventId && currentRREventIndex === null && this._timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS)) {
        shouldSendRR = false;
      }

      const lastReadEventIndex = this._getLastDisplayedEventIndex({
        ignoreOwn: true
      });

      if (lastReadEventIndex === null) {
        shouldSendRR = false;
      }

      let lastReadEvent = this.state.events[lastReadEventIndex];
      shouldSendRR = shouldSendRR && // Only send a RR if the last read event is ahead in the timeline relative to
      // the current RR event.
      lastReadEventIndex > currentRREventIndex && // Only send a RR if the last RR set != the one we would send
      this.lastRRSentEventId != lastReadEvent.getId(); // Only send a RM if the last RM sent != the one we would send

      const shouldSendRM = this.lastRMSentEventId != this.state.readMarkerEventId; // we also remember the last read receipt we sent to avoid spamming the
      // same one at the server repeatedly

      if (shouldSendRR || shouldSendRM) {
        if (shouldSendRR) {
          this.lastRRSentEventId = lastReadEvent.getId();
        } else {
          lastReadEvent = null;
        }

        this.lastRMSentEventId = this.state.readMarkerEventId;
        debuglog('TimelinePanel: Sending Read Markers for ', this.props.timelineSet.room.roomId, 'rm', this.state.readMarkerEventId, lastReadEvent ? 'rr ' + lastReadEvent.getId() : '');

        _MatrixClientPeg.MatrixClientPeg.get().setRoomReadMarkers(this.props.timelineSet.room.roomId, this.state.readMarkerEventId, lastReadEvent, // Could be null, in which case no RR is sent
        {}).catch(e => {
          // /read_markers API is not implemented on this HS, fallback to just RR
          if (e.errcode === 'M_UNRECOGNIZED' && lastReadEvent) {
            return _MatrixClientPeg.MatrixClientPeg.get().sendReadReceipt(lastReadEvent, {}).catch(e => {
              console.error(e);
              this.lastRRSentEventId = undefined;
            });
          } else {
            console.error(e);
          } // it failed, so allow retries next time the user is active


          this.lastRRSentEventId = undefined;
          this.lastRMSentEventId = undefined;
        }); // do a quick-reset of our unreadNotificationCount to avoid having
        // to wait from the remote echo from the homeserver.
        // we only do this if we're right at the end, because we're just assuming
        // that sending an RR for the latest message will set our notif counter
        // to zero: it may not do this if we send an RR for somewhere before the end.


        if (this.isAtEndOfLiveTimeline()) {
          this.props.timelineSet.room.setUnreadNotificationCount('total', 0);
          this.props.timelineSet.room.setUnreadNotificationCount('highlight', 0);

          _dispatcher.default.dispatch({
            action: 'on_room_read',
            roomId: this.props.timelineSet.room.roomId
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "updateReadMarker", () => {
      if (!this.props.manageReadMarkers) return;

      if (this.getReadMarkerPosition() === 1) {
        // the read marker is at an event below the viewport,
        // we don't want to rewind it.
        return;
      } // move the RM to *after* the message at the bottom of the screen. This
      // avoids a problem whereby we never advance the RM if there is a huge
      // message which doesn't fit on the screen.


      const lastDisplayedIndex = this._getLastDisplayedEventIndex({
        allowPartial: true
      });

      if (lastDisplayedIndex === null) {
        return;
      }

      const lastDisplayedEvent = this.state.events[lastDisplayedIndex];

      this._setReadMarker(lastDisplayedEvent.getId(), lastDisplayedEvent.getTs()); // the read-marker should become invisible, so that if the user scrolls
      // down, they don't see it.


      if (this.state.readMarkerVisible) {
        this.setState({
          readMarkerVisible: false
        });
      } // Send the updated read marker (along with read receipt) to the server


      this.sendReadReceipt();
    });
    (0, _defineProperty2.default)(this, "jumpToLiveTimeline", () => {
      // if we can't forward-paginate the existing timeline, then there
      // is no point reloading it - just jump straight to the bottom.
      //
      // Otherwise, reload the timeline rather than trying to paginate
      // through all of space-time.
      if (this._timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS)) {
        this._loadTimeline();
      } else {
        if (this._messagePanel.current) {
          this._messagePanel.current.scrollToBottom();
        }
      }
    });
    (0, _defineProperty2.default)(this, "jumpToReadMarker", () => {
      if (!this.props.manageReadMarkers) return;
      if (!this._messagePanel.current) return;
      if (!this.state.readMarkerEventId) return; // we may not have loaded the event corresponding to the read-marker
      // into the _timelineWindow. In that case, attempts to scroll to it
      // will fail.
      //
      // a quick way to figure out if we've loaded the relevant event is
      // simply to check if the messagepanel knows where the read-marker is.

      const ret = this._messagePanel.current.getReadMarkerPosition();

      if (ret !== null) {
        // The messagepanel knows where the RM is, so we must have loaded
        // the relevant event.
        this._messagePanel.current.scrollToEvent(this.state.readMarkerEventId, 0, 1 / 3);

        return;
      } // Looks like we haven't loaded the event corresponding to the read-marker.
      // As with jumpToLiveTimeline, we want to reload the timeline around the
      // read-marker.


      this._loadTimeline(this.state.readMarkerEventId, 0, 1 / 3);
    });
    (0, _defineProperty2.default)(this, "forgetReadMarker", () => {
      if (!this.props.manageReadMarkers) return;

      const rmId = this._getCurrentReadReceipt(); // see if we know the timestamp for the rr event


      const tl = this.props.timelineSet.getTimelineForEvent(rmId);
      let rmTs;

      if (tl) {
        const event = tl.getEvents().find(e => {
          return e.getId() == rmId;
        });

        if (event) {
          rmTs = event.getTs();
        }
      }

      this._setReadMarker(rmId, rmTs);
    });
    (0, _defineProperty2.default)(this, "isAtEndOfLiveTimeline", () => {
      return this._messagePanel.current && this._messagePanel.current.isAtBottom() && this._timelineWindow && !this._timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS);
    });
    (0, _defineProperty2.default)(this, "getScrollState", () => {
      if (!this._messagePanel.current) {
        return null;
      }

      return this._messagePanel.current.getScrollState();
    });
    (0, _defineProperty2.default)(this, "getReadMarkerPosition", () => {
      if (!this.props.manageReadMarkers) return null;
      if (!this._messagePanel.current) return null;

      const ret = this._messagePanel.current.getReadMarkerPosition();

      if (ret !== null) {
        return ret;
      } // the messagePanel doesn't know where the read marker is.
      // if we know the timestamp of the read marker, make a guess based on that.


      const rmTs = TimelinePanel.roomReadMarkerTsMap[this.props.timelineSet.room.roomId];

      if (rmTs && this.state.events.length > 0) {
        if (rmTs < this.state.events[0].getTs()) {
          return -1;
        } else {
          return 1;
        }
      }

      return null;
    });
    (0, _defineProperty2.default)(this, "canJumpToReadMarker", () => {
      // 1. Do not show jump bar if neither the RM nor the RR are set.
      // 3. We want to show the bar if the read-marker is off the top of the screen.
      // 4. Also, if pos === null, the event might not be paginated - show the unread bar
      const pos = this.getReadMarkerPosition();
      const ret = this.state.readMarkerEventId !== null && ( // 1.
      pos < 0 || pos === null); // 3., 4.

      return ret;
    });
    (0, _defineProperty2.default)(this, "handleScrollKey", ev => {
      if (!this._messagePanel.current) {
        return;
      } // jump to the live timeline on ctrl-end, rather than the end of the
      // timeline window.


      if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey && ev.key === _Keyboard.Key.END) {
        this.jumpToLiveTimeline();
      } else {
        this._messagePanel.current.handleScrollKey(ev);
      }
    });
    (0, _defineProperty2.default)(this, "getRelationsForEvent", (...args) => this.props.timelineSet.getRelationsForEvent(...args));
    debuglog("TimelinePanel: mounting");
    this.lastRRSentEventId = undefined;
    this.lastRMSentEventId = undefined;
    this._messagePanel = /*#__PURE__*/(0, _react.createRef)(); // XXX: we could track RM per TimelineSet rather than per Room.
    // but for now we just do it per room for simplicity.

    let initialReadMarker = null;

    if (this.props.manageReadMarkers) {
      const readmarker = this.props.timelineSet.room.getAccountData('m.fully_read');

      if (readmarker) {
        initialReadMarker = readmarker.getContent().event_id;
      } else {
        initialReadMarker = this._getCurrentReadReceipt();
      }
    }

    this.state = {
      events: [],
      liveEvents: [],
      timelineLoading: true,
      // track whether our room timeline is loading
      // the index of the first event that is to be shown
      firstVisibleEventIndex: 0,
      // canBackPaginate == false may mean:
      //
      // * we haven't (successfully) loaded the timeline yet, or:
      //
      // * we have got to the point where the room was created, or:
      //
      // * the server indicated that there were no more visible events
      //  (normally implying we got to the start of the room), or:
      //
      // * we gave up asking the server for more events
      canBackPaginate: false,
      // canForwardPaginate == false may mean:
      //
      // * we haven't (successfully) loaded the timeline yet
      //
      // * we have got to the end of time and are now tracking the live
      //   timeline, or:
      //
      // * the server indicated that there were no more visible events
      //   (not sure if this ever happens when we're not at the live
      //   timeline), or:
      //
      // * we are looking at some historical point, but gave up asking
      //   the server for more events
      canForwardPaginate: false,
      // start with the read-marker visible, so that we see its animated
      // disappearance when switching into the room.
      readMarkerVisible: true,
      readMarkerEventId: initialReadMarker,
      backPaginating: false,
      forwardPaginating: false,
      // cache of matrixClient.getSyncState() (but from the 'sync' event)
      clientSyncState: _MatrixClientPeg.MatrixClientPeg.get().getSyncState(),
      // should the event tiles have twelve hour times
      isTwelveHour: _SettingsStore.default.getValue("showTwelveHourTimestamps"),
      // always show timestamps on event tiles?
      alwaysShowTimestamps: _SettingsStore.default.getValue("alwaysShowTimestamps"),
      // how long to show the RM for when it's visible in the window
      readMarkerInViewThresholdMs: _SettingsStore.default.getValue("readMarkerInViewThresholdMs"),
      // how long to show the RM for when it's scrolled off-screen
      readMarkerOutOfViewThresholdMs: _SettingsStore.default.getValue("readMarkerOutOfViewThresholdMs")
    };
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _MatrixClientPeg.MatrixClientPeg.get().on("Room.timeline", this.onRoomTimeline);

    _MatrixClientPeg.MatrixClientPeg.get().on("Room.timelineReset", this.onRoomTimelineReset);

    _MatrixClientPeg.MatrixClientPeg.get().on("Room.redaction", this.onRoomRedaction); // same event handler as Room.redaction as for both we just do forceUpdate


    _MatrixClientPeg.MatrixClientPeg.get().on("Room.redactionCancelled", this.onRoomRedaction);

    _MatrixClientPeg.MatrixClientPeg.get().on("Room.receipt", this.onRoomReceipt);

    _MatrixClientPeg.MatrixClientPeg.get().on("Room.localEchoUpdated", this.onLocalEchoUpdated);

    _MatrixClientPeg.MatrixClientPeg.get().on("Room.accountData", this.onAccountData);

    _MatrixClientPeg.MatrixClientPeg.get().on("Event.decrypted", this.onEventDecrypted);

    _MatrixClientPeg.MatrixClientPeg.get().on("Event.replaced", this.onEventReplaced);

    _MatrixClientPeg.MatrixClientPeg.get().on("sync", this.onSync);
  } // TODO: [REACT-WARNING] Move into constructor
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillMount() {
    if (this.props.manageReadReceipts) {
      this.updateReadReceiptOnUserActivity();
    }

    if (this.props.manageReadMarkers) {
      this.updateReadMarkerOnUserActivity();
    }

    this._initTimeline(this.props);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.timelineSet !== this.props.timelineSet) {
      // throw new Error("changing timelineSet on a TimelinePanel is not supported");
      // regrettably, this does happen; in particular, when joining a
      // room with /join. In that case, there are two Rooms in
      // circulation - one which is created by the MatrixClient.joinRoom
      // call and used to create the RoomView, and a second which is
      // created by the sync loop once the room comes back down the /sync
      // pipe. Once the latter happens, our room is replaced with the new one.
      //
      // for now, just warn about this. But we're going to end up paginating
      // both rooms separately, and it's all bad.
      console.warn("Replacing timelineSet on a TimelinePanel - confusion may ensue");
    }

    if (newProps.eventId != this.props.eventId) {
      console.log("TimelinePanel switching to eventId " + newProps.eventId + " (was " + this.props.eventId + ")");
      return this._initTimeline(newProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if ((0, _objects.objectHasDiff)(this.props, nextProps)) {
      if (DEBUG) {
        console.group("Timeline.shouldComponentUpdate: props change");
        console.log("props before:", this.props);
        console.log("props after:", nextProps);
        console.groupEnd();
      }

      return true;
    }

    if ((0, _objects.objectHasDiff)(this.state, nextState)) {
      if (DEBUG) {
        console.group("Timeline.shouldComponentUpdate: state change");
        console.log("state before:", this.state);
        console.log("state after:", nextState);
        console.groupEnd();
      }

      return true;
    }

    return false;
  }

  componentWillUnmount() {
    // set a boolean to say we've been unmounted, which any pending
    // promises can use to throw away their results.
    //
    // (We could use isMounted, but facebook have deprecated that.)
    this.unmounted = true;

    if (this._readReceiptActivityTimer) {
      this._readReceiptActivityTimer.abort();

      this._readReceiptActivityTimer = null;
    }

    if (this._readMarkerActivityTimer) {
      this._readMarkerActivityTimer.abort();

      this._readMarkerActivityTimer = null;
    }

    _dispatcher.default.unregister(this.dispatcherRef);

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client) {
      client.removeListener("Room.timeline", this.onRoomTimeline);
      client.removeListener("Room.timelineReset", this.onRoomTimelineReset);
      client.removeListener("Room.redaction", this.onRoomRedaction);
      client.removeListener("Room.redactionCancelled", this.onRoomRedaction);
      client.removeListener("Room.receipt", this.onRoomReceipt);
      client.removeListener("Room.localEchoUpdated", this.onLocalEchoUpdated);
      client.removeListener("Room.accountData", this.onAccountData);
      client.removeListener("Event.decrypted", this.onEventDecrypted);
      client.removeListener("Event.replaced", this.onEventReplaced);
      client.removeListener("sync", this.onSync);
    }
  }

  _readMarkerTimeout(readMarkerPosition) {
    return readMarkerPosition === 0 ? this.state.readMarkerInViewThresholdMs : this.state.readMarkerOutOfViewThresholdMs;
  }

  async updateReadMarkerOnUserActivity() {
    const initialTimeout = this._readMarkerTimeout(this.getReadMarkerPosition());

    this._readMarkerActivityTimer = new _Timer.default(initialTimeout);

    while (this._readMarkerActivityTimer) {
      //unset on unmount
      _UserActivity.default.sharedInstance().timeWhileActiveRecently(this._readMarkerActivityTimer);

      try {
        await this._readMarkerActivityTimer.finished();
      } catch (e) {
        continue;
        /* aborted */
      } // outside of try/catch to not swallow errors


      this.updateReadMarker();
    }
  }

  async updateReadReceiptOnUserActivity() {
    this._readReceiptActivityTimer = new _Timer.default(READ_RECEIPT_INTERVAL_MS);

    while (this._readReceiptActivityTimer) {
      //unset on unmount
      _UserActivity.default.sharedInstance().timeWhileActiveNow(this._readReceiptActivityTimer);

      try {
        await this._readReceiptActivityTimer.finished();
      } catch (e) {
        continue;
        /* aborted */
      } // outside of try/catch to not swallow errors


      this.sendReadReceipt();
    }
  }

  // advance the read marker past any events we sent ourselves.
  _advanceReadMarkerPastMyEvents() {
    if (!this.props.manageReadMarkers) return; // we call `_timelineWindow.getEvents()` rather than using
    // `this.state.liveEvents`, because React batches the update to the
    // latter, so it may not have been updated yet.

    const events = this._timelineWindow.getEvents(); // first find where the current RM is


    let i;

    for (i = 0; i < events.length; i++) {
      if (events[i].getId() == this.state.readMarkerEventId) {
        break;
      }
    }

    if (i >= events.length) {
      return;
    } // now think about advancing it


    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId;

    for (i++; i < events.length; i++) {
      const ev = events[i];

      if (!ev.sender || ev.sender.userId != myUserId) {
        break;
      }
    } // i is now the first unread message which we didn't send ourselves.


    i--;
    const ev = events[i];

    this._setReadMarker(ev.getId(), ev.getTs());
  }
  /* jump down to the bottom of this room, where new events are arriving
   */


  _initTimeline(props) {
    const initialEvent = props.eventId;
    const pixelOffset = props.eventPixelOffset; // if a pixelOffset is given, it is relative to the bottom of the
    // container. If not, put the event in the middle of the container.

    let offsetBase = 1;

    if (pixelOffset == null) {
      offsetBase = 0.5;
    }

    return this._loadTimeline(initialEvent, pixelOffset, offsetBase);
  }
  /**
   * (re)-load the event timeline, and initialise the scroll state, centered
   * around the given event.
   *
   * @param {string?}  eventId the event to focus on. If undefined, will
   *    scroll to the bottom of the room.
   *
   * @param {number?} pixelOffset   offset to position the given event at
   *    (pixels from the offsetBase). If omitted, defaults to 0.
   *
   * @param {number?} offsetBase the reference point for the pixelOffset. 0
   *     means the top of the container, 1 means the bottom, and fractional
   *     values mean somewhere in the middle. If omitted, it defaults to 0.
   *
   * returns a promise which will resolve when the load completes.
   */


  _loadTimeline(eventId, pixelOffset, offsetBase) {
    this._timelineWindow = new _timelineWindow.TimelineWindow(_MatrixClientPeg.MatrixClientPeg.get(), this.props.timelineSet, {
      windowLimit: this.props.timelineCap
    });

    const onLoaded = () => {
      // clear the timeline min-height when
      // (re)loading the timeline
      if (this._messagePanel.current) {
        this._messagePanel.current.onTimelineReset();
      }

      this._reloadEvents(); // If we switched away from the room while there were pending
      // outgoing events, the read-marker will be before those events.
      // We need to skip over any which have subsequently been sent.


      this._advanceReadMarkerPastMyEvents();

      this.setState({
        canBackPaginate: this._timelineWindow.canPaginate(_eventTimeline.EventTimeline.BACKWARDS),
        canForwardPaginate: this._timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS),
        timelineLoading: false
      }, () => {
        // initialise the scroll state of the message panel
        if (!this._messagePanel.current) {
          // this shouldn't happen - we know we're mounted because
          // we're in a setState callback, and we know
          // timelineLoading is now false, so render() should have
          // mounted the message panel.
          console.log("can't initialise scroll state because " + "messagePanel didn't load");
          return;
        }

        if (eventId) {
          this._messagePanel.current.scrollToEvent(eventId, pixelOffset, offsetBase);
        } else {
          this._messagePanel.current.scrollToBottom();
        }

        if (this.props.sendReadReceiptOnLoad) {
          this.sendReadReceipt();
        }
      });
    };

    const onError = error => {
      this.setState({
        timelineLoading: false
      });
      console.error(`Error loading timeline panel at ${eventId}: ${error}`);
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      let onFinished; // if we were given an event ID, then when the user closes the
      // dialog, let's jump to the end of the timeline. If we weren't,
      // something has gone badly wrong and rather than causing a loop of
      // undismissable dialogs, let's just give up.

      if (eventId) {
        onFinished = () => {
          // go via the dispatcher so that the URL is updated
          _dispatcher.default.dispatch({
            action: 'view_room',
            room_id: this.props.timelineSet.room.roomId
          });
        };
      }

      let message;

      if (error.errcode == 'M_FORBIDDEN') {
        message = (0, _languageHandler._t)("Tried to load a specific point in this room's timeline, but you " + "do not have permission to view the message in question.");
      } else {
        message = (0, _languageHandler._t)("Tried to load a specific point in this room's timeline, but was " + "unable to find it.");
      }

      _Modal.default.createTrackedDialog('Failed to load timeline position', '', ErrorDialog, {
        title: (0, _languageHandler._t)("Failed to load timeline position"),
        description: message,
        onFinished: onFinished
      });
    }; // if we already have the event in question, TimelineWindow.load
    // returns a resolved promise.
    //
    // In this situation, we don't really want to defer the update of the
    // state to the next event loop, because it makes room-switching feel
    // quite slow. So we detect that situation and shortcut straight to
    // calling _reloadEvents and updating the state.


    const timeline = this.props.timelineSet.getTimelineForEvent(eventId);

    if (timeline) {
      // This is a hot-path optimization by skipping a promise tick
      // by repeating a no-op sync branch in TimelineSet.getTimelineForEvent & MatrixClient.getEventTimeline
      this._timelineWindow.load(eventId, INITIAL_SIZE); // in this branch this method will happen in sync time


      onLoaded();
    } else {
      const prom = this._timelineWindow.load(eventId, INITIAL_SIZE);

      this.setState({
        events: [],
        liveEvents: [],
        canBackPaginate: false,
        canForwardPaginate: false,
        timelineLoading: true
      });
      prom.then(onLoaded, onError);
    }
  } // handle the completion of a timeline load or localEchoUpdate, by
  // reloading the events from the timelinewindow and pending event list into
  // the state.


  _reloadEvents() {
    // we might have switched rooms since the load started - just bin
    // the results if so.
    if (this.unmounted) return;
    this.setState(this._getEvents());
  } // get the list of events from the timeline window and the pending event list


  _getEvents() {
    const events = this._timelineWindow.getEvents();

    const firstVisibleEventIndex = this._checkForPreJoinUISI(events); // Hold onto the live events separately. The read receipt and read marker
    // should use this list, so that they don't advance into pending events.


    const liveEvents = [...events]; // if we're at the end of the live timeline, append the pending events

    if (!this._timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS)) {
      events.push(...this.props.timelineSet.getPendingEvents());
    }

    return {
      events,
      liveEvents,
      firstVisibleEventIndex
    };
  }
  /**
   * Check for undecryptable messages that were sent while the user was not in
   * the room.
   *
   * @param {Array<MatrixEvent>} events The timeline events to check
   *
   * @return {Number} The index within `events` of the event after the most recent
   * undecryptable event that was sent while the user was not in the room.  If no
   * such events were found, then it returns 0.
   */


  _checkForPreJoinUISI(events) {
    const room = this.props.timelineSet.room;

    if (events.length === 0 || !room || !_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(room.roomId)) {
      return 0;
    }

    const userId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId; // get the user's membership at the last event by getting the timeline
    // that the event belongs to, and traversing the timeline looking for
    // that event, while keeping track of the user's membership


    let i;
    let userMembership = "leave";

    for (i = events.length - 1; i >= 0; i--) {
      const timeline = room.getTimelineForEvent(events[i].getId());

      if (!timeline) {
        // Somehow, it seems to be possible for live events to not have
        // a timeline, even though that should not happen. :(
        // https://github.com/vector-im/element-web/issues/12120
        console.warn(`Event ${events[i].getId()} in room ${room.roomId} is live, ` + `but it does not have a timeline`);
        continue;
      }

      const userMembershipEvent = timeline.getState(_eventTimeline.EventTimeline.FORWARDS).getMember(userId);
      userMembership = userMembershipEvent ? userMembershipEvent.membership : "leave";
      const timelineEvents = timeline.getEvents();

      for (let j = timelineEvents.length - 1; j >= 0; j--) {
        const event = timelineEvents[j];

        if (event.getId() === events[i].getId()) {
          break;
        } else if (event.getStateKey() === userId && event.getType() === "m.room.member") {
          const prevContent = event.getPrevContent();
          userMembership = prevContent.membership || "leave";
        }
      }

      break;
    } // now go through the rest of the events and find the first undecryptable
    // one that was sent when the user wasn't in the room


    for (; i >= 0; i--) {
      const event = events[i];

      if (event.getStateKey() === userId && event.getType() === "m.room.member") {
        const prevContent = event.getPrevContent();
        userMembership = prevContent.membership || "leave";
      } else if (userMembership === "leave" && (event.isDecryptionFailure() || event.isBeingDecrypted())) {
        // reached an undecryptable message when the user wasn't in
        // the room -- don't try to load any more
        // Note: for now, we assume that events that are being decrypted are
        // not decryptable
        return i + 1;
      }
    }

    return 0;
  }

  _indexForEventId(evId) {
    for (let i = 0; i < this.state.events.length; ++i) {
      if (evId == this.state.events[i].getId()) {
        return i;
      }
    }

    return null;
  }

  _getLastDisplayedEventIndex(opts) {
    opts = opts || {};
    const ignoreOwn = opts.ignoreOwn || false;
    const allowPartial = opts.allowPartial || false;
    const messagePanel = this._messagePanel.current;
    if (!messagePanel) return null;

    const messagePanelNode = _reactDom.default.findDOMNode(messagePanel);

    if (!messagePanelNode) return null; // sometimes this happens for fresh rooms/post-sync

    const wrapperRect = messagePanelNode.getBoundingClientRect();

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId;

    const isNodeInView = node => {
      if (node) {
        const boundingRect = node.getBoundingClientRect();

        if (allowPartial && boundingRect.top < wrapperRect.bottom || !allowPartial && boundingRect.bottom < wrapperRect.bottom) {
          return true;
        }
      }

      return false;
    }; // We keep track of how many of the adjacent events didn't have a tile
    // but should have the read receipt moved past them, so
    // we can include those once we find the last displayed (visible) event.
    // The counter is not started for events we don't want
    // to send a read receipt for (our own events, local echos).


    let adjacentInvisibleEventCount = 0; // Use `liveEvents` here because we don't want the read marker or read
    // receipt to advance into pending events.

    for (let i = this.state.liveEvents.length - 1; i >= 0; --i) {
      const ev = this.state.liveEvents[i];
      const node = messagePanel.getNodeForEventId(ev.getId());
      const isInView = isNodeInView(node); // when we've reached the first visible event, and the previous
      // events were all invisible (with the first one not being ignored),
      // return the index of the first invisible event.

      if (isInView && adjacentInvisibleEventCount !== 0) {
        return i + adjacentInvisibleEventCount;
      }

      if (node && !isInView) {
        // has node but not in view, so reset adjacent invisible events
        adjacentInvisibleEventCount = 0;
      }

      const shouldIgnore = !!ev.status || // local echo
      ignoreOwn && ev.sender && ev.sender.userId == myUserId; // own message

      const isWithoutTile = !(0, _EventTile.haveTileForEvent)(ev) || (0, _shouldHideEvent.default)(ev);

      if (isWithoutTile || !node) {
        // don't start counting if the event should be ignored,
        // but continue counting if we were already so the offset
        // to the previous invisble event that didn't need to be ignored
        // doesn't get messed up
        if (!shouldIgnore || shouldIgnore && adjacentInvisibleEventCount !== 0) {
          ++adjacentInvisibleEventCount;
        }

        continue;
      }

      if (shouldIgnore) {
        continue;
      }

      if (isInView) {
        return i;
      }
    }

    return null;
  }
  /**
   * Get the id of the event corresponding to our user's latest read-receipt.
   *
   * @param {Boolean} ignoreSynthesized If true, return only receipts that
   *                                    have been sent by the server, not
   *                                    implicit ones generated by the JS
   *                                    SDK.
   * @return {String} the event ID
   */


  _getCurrentReadReceipt(ignoreSynthesized) {
    const client = _MatrixClientPeg.MatrixClientPeg.get(); // the client can be null on logout


    if (client == null) {
      return null;
    }

    const myUserId = client.credentials.userId;
    return this.props.timelineSet.room.getEventReadUpTo(myUserId, ignoreSynthesized);
  }

  _setReadMarker(eventId, eventTs, inhibitSetState) {
    const roomId = this.props.timelineSet.room.roomId; // don't update the state (and cause a re-render) if there is
    // no change to the RM.

    if (eventId === this.state.readMarkerEventId) {
      return;
    } // in order to later figure out if the read marker is
    // above or below the visible timeline, we stash the timestamp.


    TimelinePanel.roomReadMarkerTsMap[roomId] = eventTs;

    if (inhibitSetState) {
      return;
    } // Do the local echo of the RM
    // run the render cycle before calling the callback, so that
    // getReadMarkerPosition() returns the right thing.


    this.setState({
      readMarkerEventId: eventId
    }, this.props.onReadMarkerUpdated);
  }

  _shouldPaginate() {
    // don't try to paginate while events in the timeline are
    // still being decrypted. We don't render events while they're
    // being decrypted, so they don't take up space in the timeline.
    // This means we can pull quite a lot of events into the timeline
    // and end up trying to render a lot of events.
    return !this.state.events.some(e => {
      return e.isBeingDecrypted();
    });
  }

  render() {
    const MessagePanel = sdk.getComponent("structures.MessagePanel");
    const Loader = sdk.getComponent("elements.Spinner"); // just show a spinner while the timeline loads.
    //
    // put it in a div of the right class (mx_RoomView_messagePanel) so
    // that the order in the roomview flexbox is correct, and
    // mx_RoomView_messageListWrapper to position the inner div in the
    // right place.
    //
    // Note that the click-on-search-result functionality relies on the
    // fact that the messagePanel is hidden while the timeline reloads,
    // but that the RoomHeader (complete with search term) continues to
    // exist.

    if (this.state.timelineLoading) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomView_messagePanelSpinner"
      }, /*#__PURE__*/_react.default.createElement(Loader, null));
    }

    if (this.state.events.length == 0 && !this.state.canBackPaginate && this.props.empty) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: this.props.className + " mx_RoomView_messageListWrapper"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomView_empty"
      }, this.props.empty));
    } // give the messagepanel a stickybottom if we're at the end of the
    // live timeline, so that the arrival of new events triggers a
    // scroll.
    //
    // Make sure that stickyBottom is *false* if we can paginate
    // forwards, otherwise if somebody hits the bottom of the loaded
    // events when viewing historical messages, we get stuck in a loop
    // of paginating our way through the entire history of the room.


    const stickyBottom = !this._timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS); // If the state is PREPARED or CATCHUP, we're still waiting for the js-sdk to sync with
    // the HS and fetch the latest events, so we are effectively forward paginating.

    const forwardPaginating = this.state.forwardPaginating || ['PREPARED', 'CATCHUP'].includes(this.state.clientSyncState);
    const events = this.state.firstVisibleEventIndex ? this.state.events.slice(this.state.firstVisibleEventIndex) : this.state.events;
    return /*#__PURE__*/_react.default.createElement(MessagePanel, {
      ref: this._messagePanel,
      room: this.props.timelineSet.room,
      permalinkCreator: this.props.permalinkCreator,
      hidden: this.props.hidden,
      backPaginating: this.state.backPaginating,
      forwardPaginating: forwardPaginating,
      events: events,
      highlightedEventId: this.props.highlightedEventId,
      readMarkerEventId: this.state.readMarkerEventId,
      readMarkerVisible: this.state.readMarkerVisible,
      suppressFirstDateSeparator: this.state.canBackPaginate,
      showUrlPreview: this.props.showUrlPreview,
      showReadReceipts: this.props.showReadReceipts,
      ourUserId: _MatrixClientPeg.MatrixClientPeg.get().credentials.userId,
      stickyBottom: stickyBottom,
      onScroll: this.onMessageListScroll,
      onFillRequest: this.onMessageListFillRequest,
      onUnfillRequest: this.onMessageListUnfillRequest,
      isTwelveHour: this.state.isTwelveHour,
      alwaysShowTimestamps: this.state.alwaysShowTimestamps,
      className: this.props.className,
      tileShape: this.props.tileShape,
      resizeNotifier: this.props.resizeNotifier,
      getRelationsForEvent: this.getRelationsForEvent,
      editState: this.state.editState,
      showReactions: this.props.showReactions,
      layout: this.props.layout,
      enableFlair: _SettingsStore.default.getValue(_UIFeature.UIFeature.Flair)
    });
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // The js-sdk EventTimelineSet object for the timeline sequence we are
  // representing.  This may or may not have a room, depending on what it's
  // a timeline representing.  If it has a room, we maintain RRs etc for
  // that room.
  timelineSet: _propTypes.default.object.isRequired,
  showReadReceipts: _propTypes.default.bool,
  // Enable managing RRs and RMs. These require the timelineSet to have a room.
  manageReadReceipts: _propTypes.default.bool,
  sendReadReceiptOnLoad: _propTypes.default.bool,
  manageReadMarkers: _propTypes.default.bool,
  // true to give the component a 'display: none' style.
  hidden: _propTypes.default.bool,
  // ID of an event to highlight. If undefined, no event will be highlighted.
  // typically this will be either 'eventId' or undefined.
  highlightedEventId: _propTypes.default.string,
  // id of an event to jump to. If not given, will go to the end of the
  // live timeline.
  eventId: _propTypes.default.string,
  // where to position the event given by eventId, in pixels from the
  // bottom of the viewport. If not given, will try to put the event
  // half way down the viewport.
  eventPixelOffset: _propTypes.default.number,
  // Should we show URL Previews
  showUrlPreview: _propTypes.default.bool,
  // callback which is called when the panel is scrolled.
  onScroll: _propTypes.default.func,
  // callback which is called when the read-up-to mark is updated.
  onReadMarkerUpdated: _propTypes.default.func,
  // callback which is called when we wish to paginate the timeline
  // window.
  onPaginationRequest: _propTypes.default.func,
  // maximum number of events to show in a timeline
  timelineCap: _propTypes.default.number,
  // classname to use for the messagepanel
  className: _propTypes.default.string,
  // shape property to be passed to EventTiles
  tileShape: _propTypes.default.string,
  // placeholder to use if the timeline is empty
  empty: _propTypes.default.node,
  // whether to show reactions for an event
  showReactions: _propTypes.default.bool,
  // which layout to use
  layout: _Layout.LayoutPropType
}), (0, _defineProperty2.default)(_class2, "roomReadMarkerTsMap", {}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  // By default, disable the timelineCap in favour of unpaginating based on
  // event tile heights. (See _unpaginateEvents)
  timelineCap: Number.MAX_VALUE,
  className: 'mx_RoomView_messagePanel',
  sendReadReceiptOnLoad: true
}), _temp)) || _class);
var _default = TimelinePanel;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVGltZWxpbmVQYW5lbC5qcyJdLCJuYW1lcyI6WyJQQUdJTkFURV9TSVpFIiwiSU5JVElBTF9TSVpFIiwiUkVBRF9SRUNFSVBUX0lOVEVSVkFMX01TIiwiREVCVUciLCJkZWJ1Z2xvZyIsImNvbnNvbGUiLCJsb2ciLCJiaW5kIiwiVGltZWxpbmVQYW5lbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImJhY2t3YXJkcyIsInNjcm9sbFRva2VuIiwiZGlyIiwiRXZlbnRUaW1lbGluZSIsIkJBQ0tXQVJEUyIsIkZPUldBUkRTIiwiZXZlbnRJZCIsIm1hcmtlciIsInN0YXRlIiwiZXZlbnRzIiwiZmluZEluZGV4IiwiZXYiLCJnZXRJZCIsImNvdW50IiwibGVuZ3RoIiwiX3RpbWVsaW5lV2luZG93IiwidW5wYWdpbmF0ZSIsImNhblBhZ2luYXRlS2V5IiwibGl2ZUV2ZW50cyIsImZpcnN0VmlzaWJsZUV2ZW50SW5kZXgiLCJfZ2V0RXZlbnRzIiwic2V0U3RhdGUiLCJ0aW1lbGluZVdpbmRvdyIsImRpcmVjdGlvbiIsInNpemUiLCJvblBhZ2luYXRpb25SZXF1ZXN0IiwicGFnaW5hdGUiLCJfc2hvdWxkUGFnaW5hdGUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInBhZ2luYXRpbmdLZXkiLCJjYW5QYWdpbmF0ZSIsInRoZW4iLCJyIiwidW5tb3VudGVkIiwibmV3U3RhdGUiLCJvdGhlckRpcmVjdGlvbiIsImNhblBhZ2luYXRlT3RoZXJXYXlLZXkiLCJlIiwib25TY3JvbGwiLCJtYW5hZ2VSZWFkTWFya2VycyIsInJtUG9zaXRpb24iLCJnZXRSZWFkTWFya2VyUG9zaXRpb24iLCJyZWFkTWFya2VyVmlzaWJsZSIsInRpbWVvdXQiLCJfcmVhZE1hcmtlclRpbWVvdXQiLCJfcmVhZE1hcmtlckFjdGl2aXR5VGltZXIiLCJjaGFuZ2VUaW1lb3V0IiwicGF5bG9hZCIsImFjdGlvbiIsImZvcmNlVXBkYXRlIiwiZWRpdFN0YXRlIiwiZXZlbnQiLCJFZGl0b3JTdGF0ZVRyYW5zZmVyIiwiX21lc3NhZ2VQYW5lbCIsImN1cnJlbnQiLCJzY3JvbGxUb0V2ZW50SWZOZWVkZWQiLCJqdW1wVG9MaXZlVGltZWxpbmUiLCJyb29tIiwidG9TdGFydE9mVGltZWxpbmUiLCJyZW1vdmVkIiwiZGF0YSIsInRpbWVsaW5lIiwiZ2V0VGltZWxpbmVTZXQiLCJ0aW1lbGluZVNldCIsImxpdmVFdmVudCIsImdldFNjcm9sbFN0YXRlIiwic3R1Y2tBdEJvdHRvbSIsImNhbkZvcndhcmRQYWdpbmF0ZSIsImxhc3RMaXZlRXZlbnQiLCJ1cGRhdGVkU3RhdGUiLCJjYWxsUk1VcGRhdGVkIiwibXlVc2VySWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjcmVkZW50aWFscyIsInVzZXJJZCIsInNlbmRlciIsIlVzZXJBY3Rpdml0eSIsInNoYXJlZEluc3RhbmNlIiwidXNlckFjdGl2ZVJlY2VudGx5IiwiX3NldFJlYWRNYXJrZXIiLCJnZXRUcyIsInJlYWRNYXJrZXJFdmVudElkIiwidXBkYXRlVGltZWxpbmVNaW5IZWlnaHQiLCJvblJlYWRNYXJrZXJVcGRhdGVkIiwiaXNBdEJvdHRvbSIsIl9sb2FkVGltZWxpbmUiLCJyZXBsYWNlZEV2ZW50Iiwib2xkRXZlbnRJZCIsIl9yZWxvYWRFdmVudHMiLCJnZXRUeXBlIiwiZ2V0Q29udGVudCIsImV2ZW50X2lkIiwiZ2V0Um9vbUlkIiwicm9vbUlkIiwicHJldlN0YXRlIiwiY2xpZW50U3luY1N0YXRlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwibWFuYWdlUmVhZFJlY2VpcHRzIiwiY2xpIiwiaXNHdWVzdCIsInNob3VsZFNlbmRSUiIsImN1cnJlbnRSUkV2ZW50SWQiLCJfZ2V0Q3VycmVudFJlYWRSZWNlaXB0IiwiY3VycmVudFJSRXZlbnRJbmRleCIsIl9pbmRleEZvckV2ZW50SWQiLCJsYXN0UmVhZEV2ZW50SW5kZXgiLCJfZ2V0TGFzdERpc3BsYXllZEV2ZW50SW5kZXgiLCJpZ25vcmVPd24iLCJsYXN0UmVhZEV2ZW50IiwibGFzdFJSU2VudEV2ZW50SWQiLCJzaG91bGRTZW5kUk0iLCJsYXN0Uk1TZW50RXZlbnRJZCIsInNldFJvb21SZWFkTWFya2VycyIsImNhdGNoIiwiZXJyY29kZSIsInNlbmRSZWFkUmVjZWlwdCIsImVycm9yIiwidW5kZWZpbmVkIiwiaXNBdEVuZE9mTGl2ZVRpbWVsaW5lIiwic2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQiLCJkaXMiLCJkaXNwYXRjaCIsImxhc3REaXNwbGF5ZWRJbmRleCIsImFsbG93UGFydGlhbCIsImxhc3REaXNwbGF5ZWRFdmVudCIsInNjcm9sbFRvQm90dG9tIiwicmV0Iiwic2Nyb2xsVG9FdmVudCIsInJtSWQiLCJ0bCIsImdldFRpbWVsaW5lRm9yRXZlbnQiLCJybVRzIiwiZ2V0RXZlbnRzIiwiZmluZCIsInJvb21SZWFkTWFya2VyVHNNYXAiLCJwb3MiLCJjdHJsS2V5Iiwic2hpZnRLZXkiLCJhbHRLZXkiLCJtZXRhS2V5Iiwia2V5IiwiS2V5IiwiRU5EIiwiaGFuZGxlU2Nyb2xsS2V5IiwiYXJncyIsImdldFJlbGF0aW9uc0ZvckV2ZW50IiwiaW5pdGlhbFJlYWRNYXJrZXIiLCJyZWFkbWFya2VyIiwiZ2V0QWNjb3VudERhdGEiLCJ0aW1lbGluZUxvYWRpbmciLCJjYW5CYWNrUGFnaW5hdGUiLCJiYWNrUGFnaW5hdGluZyIsImZvcndhcmRQYWdpbmF0aW5nIiwiZ2V0U3luY1N0YXRlIiwiaXNUd2VsdmVIb3VyIiwiYWx3YXlzU2hvd1RpbWVzdGFtcHMiLCJyZWFkTWFya2VySW5WaWV3VGhyZXNob2xkTXMiLCJyZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXMiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsIm9uIiwib25Sb29tVGltZWxpbmUiLCJvblJvb21UaW1lbGluZVJlc2V0Iiwib25Sb29tUmVkYWN0aW9uIiwib25Sb29tUmVjZWlwdCIsIm9uTG9jYWxFY2hvVXBkYXRlZCIsIm9uQWNjb3VudERhdGEiLCJvbkV2ZW50RGVjcnlwdGVkIiwib25FdmVudFJlcGxhY2VkIiwib25TeW5jIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsInVwZGF0ZVJlYWRSZWNlaXB0T25Vc2VyQWN0aXZpdHkiLCJ1cGRhdGVSZWFkTWFya2VyT25Vc2VyQWN0aXZpdHkiLCJfaW5pdFRpbWVsaW5lIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsIndhcm4iLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJncm91cCIsImdyb3VwRW5kIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJfcmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyIiwiYWJvcnQiLCJ1bnJlZ2lzdGVyIiwiY2xpZW50IiwicmVtb3ZlTGlzdGVuZXIiLCJyZWFkTWFya2VyUG9zaXRpb24iLCJpbml0aWFsVGltZW91dCIsIlRpbWVyIiwidGltZVdoaWxlQWN0aXZlUmVjZW50bHkiLCJmaW5pc2hlZCIsInVwZGF0ZVJlYWRNYXJrZXIiLCJ0aW1lV2hpbGVBY3RpdmVOb3ciLCJfYWR2YW5jZVJlYWRNYXJrZXJQYXN0TXlFdmVudHMiLCJpIiwiaW5pdGlhbEV2ZW50IiwicGl4ZWxPZmZzZXQiLCJldmVudFBpeGVsT2Zmc2V0Iiwib2Zmc2V0QmFzZSIsIlRpbWVsaW5lV2luZG93Iiwid2luZG93TGltaXQiLCJ0aW1lbGluZUNhcCIsIm9uTG9hZGVkIiwib25UaW1lbGluZVJlc2V0Iiwic2VuZFJlYWRSZWNlaXB0T25Mb2FkIiwib25FcnJvciIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50Iiwib25GaW5pc2hlZCIsInJvb21faWQiLCJtZXNzYWdlIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImxvYWQiLCJwcm9tIiwiX2NoZWNrRm9yUHJlSm9pblVJU0kiLCJwdXNoIiwiZ2V0UGVuZGluZ0V2ZW50cyIsImlzUm9vbUVuY3J5cHRlZCIsInVzZXJNZW1iZXJzaGlwIiwidXNlck1lbWJlcnNoaXBFdmVudCIsImdldFN0YXRlIiwiZ2V0TWVtYmVyIiwibWVtYmVyc2hpcCIsInRpbWVsaW5lRXZlbnRzIiwiaiIsImdldFN0YXRlS2V5IiwicHJldkNvbnRlbnQiLCJnZXRQcmV2Q29udGVudCIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJpc0JlaW5nRGVjcnlwdGVkIiwiZXZJZCIsIm9wdHMiLCJtZXNzYWdlUGFuZWwiLCJtZXNzYWdlUGFuZWxOb2RlIiwiUmVhY3RET00iLCJmaW5kRE9NTm9kZSIsIndyYXBwZXJSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiaXNOb2RlSW5WaWV3Iiwibm9kZSIsImJvdW5kaW5nUmVjdCIsInRvcCIsImJvdHRvbSIsImFkamFjZW50SW52aXNpYmxlRXZlbnRDb3VudCIsImdldE5vZGVGb3JFdmVudElkIiwiaXNJblZpZXciLCJzaG91bGRJZ25vcmUiLCJzdGF0dXMiLCJpc1dpdGhvdXRUaWxlIiwiaWdub3JlU3ludGhlc2l6ZWQiLCJnZXRFdmVudFJlYWRVcFRvIiwiZXZlbnRUcyIsImluaGliaXRTZXRTdGF0ZSIsInNvbWUiLCJyZW5kZXIiLCJNZXNzYWdlUGFuZWwiLCJMb2FkZXIiLCJlbXB0eSIsImNsYXNzTmFtZSIsInN0aWNreUJvdHRvbSIsImluY2x1ZGVzIiwic2xpY2UiLCJwZXJtYWxpbmtDcmVhdG9yIiwiaGlkZGVuIiwiaGlnaGxpZ2h0ZWRFdmVudElkIiwic2hvd1VybFByZXZpZXciLCJzaG93UmVhZFJlY2VpcHRzIiwib25NZXNzYWdlTGlzdFNjcm9sbCIsIm9uTWVzc2FnZUxpc3RGaWxsUmVxdWVzdCIsIm9uTWVzc2FnZUxpc3RVbmZpbGxSZXF1ZXN0IiwidGlsZVNoYXBlIiwicmVzaXplTm90aWZpZXIiLCJzaG93UmVhY3Rpb25zIiwibGF5b3V0IiwiVUlGZWF0dXJlIiwiRmxhaXIiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiYm9vbCIsInN0cmluZyIsIm51bWJlciIsImZ1bmMiLCJMYXlvdXRQcm9wVHlwZSIsIk51bWJlciIsIk1BWF9WQUxVRSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLGFBQWEsR0FBRyxFQUF0QjtBQUNBLE1BQU1DLFlBQVksR0FBRyxFQUFyQjtBQUNBLE1BQU1DLHdCQUF3QixHQUFHLEdBQWpDO0FBRUEsTUFBTUMsS0FBSyxHQUFHLEtBQWQ7O0FBRUEsSUFBSUMsUUFBUSxHQUFHLFlBQVcsQ0FBRSxDQUE1Qjs7QUFDQSxJQUFJRCxLQUFKLEVBQVc7QUFDUDtBQUNBQyxFQUFBQSxRQUFRLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxJQUFaLENBQWlCRixPQUFqQixDQUFYO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7SUFFTUcsYSxXQURMLGdEQUFxQiwwQkFBckIsQyxtQ0FBRCxNQUNNQSxhQUROLFNBQzRCQyxlQUFNQyxTQURsQyxDQUM0QztBQThEeEM7QUFXQUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsc0VBOExVLENBQUNDLFNBQUQsRUFBWUMsV0FBWixLQUE0QjtBQUNyRDtBQUNBLFlBQU1DLEdBQUcsR0FBR0YsU0FBUyxHQUFHRyw2QkFBY0MsU0FBakIsR0FBNkJELDZCQUFjRSxRQUFoRTtBQUNBZCxNQUFBQSxRQUFRLENBQUMsaURBQUQsRUFBb0RXLEdBQXBELENBQVIsQ0FIcUQsQ0FLckQ7QUFDQTs7QUFDQSxZQUFNSSxPQUFPLEdBQUdMLFdBQWhCO0FBRUEsWUFBTU0sTUFBTSxHQUFHLEtBQUtDLEtBQUwsQ0FBV0MsTUFBWCxDQUFrQkMsU0FBbEIsQ0FD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QXRCSjtBQXdCZjtBQUNBO0FBQ0E7QUFDQXZGLEVBQUFBLGdCQUFnQixFQUFFbUYsbUJBQVVLLE1BM0JiO0FBNkJmO0FBQ0FoQixFQUFBQSxjQUFjLEVBQUVXLG1CQUFVRyxJQTlCWDtBQWdDZjtBQUNBMVAsRUFBQUEsUUFBUSxFQUFFdVAsbUJBQVVNLElBakNMO0FBbUNmO0FBQ0EvTSxFQUFBQSxtQkFBbUIsRUFBRXlNLG1CQUFVTSxJQXBDaEI7QUFzQ2Y7QUFDQTtBQUNBM1EsRUFBQUEsbUJBQW1CLEVBQUVxUSxtQkFBVU0sSUF4Q2hCO0FBMENmO0FBQ0FyRixFQUFBQSxXQUFXLEVBQUUrRSxtQkFBVUssTUEzQ1I7QUE2Q2Y7QUFDQXZCLEVBQUFBLFNBQVMsRUFBRWtCLG1CQUFVSSxNQTlDTjtBQWdEZjtBQUNBVixFQUFBQSxTQUFTLEVBQUVNLG1CQUFVSSxNQWpETjtBQW1EZjtBQUNBdkIsRUFBQUEsS0FBSyxFQUFFbUIsbUJBQVVyQyxJQXBERjtBQXNEZjtBQUNBaUMsRUFBQUEsYUFBYSxFQUFFSSxtQkFBVUcsSUF2RFY7QUF5RGY7QUFDQU4sRUFBQUEsTUFBTSxFQUFFVTtBQTFETyxDLGlFQThEVSxFLDBEQUVQO0FBQ2xCO0FBQ0E7QUFDQXRGLEVBQUFBLFdBQVcsRUFBRXVGLE1BQU0sQ0FBQ0MsU0FIRjtBQUlsQjNCLEVBQUFBLFNBQVMsRUFBRSwwQkFKTztBQUtsQjFELEVBQUFBLHFCQUFxQixFQUFFO0FBTEwsQztlQTJ6Q1h2TixhIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LTIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtMYXlvdXRQcm9wVHlwZX0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL0xheW91dFwiO1xuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7RXZlbnRUaW1lbGluZX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudC10aW1lbGluZVwiO1xuaW1wb3J0IHtUaW1lbGluZVdpbmRvd30gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3RpbWVsaW5lLXdpbmRvd1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBVc2VyQWN0aXZpdHkgZnJvbSBcIi4uLy4uL1VzZXJBY3Rpdml0eVwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uL2luZGV4XCI7XG5pbXBvcnQgeyBLZXkgfSBmcm9tICcuLi8uLi9LZXlib2FyZCc7XG5pbXBvcnQgVGltZXIgZnJvbSAnLi4vLi4vdXRpbHMvVGltZXInO1xuaW1wb3J0IHNob3VsZEhpZGVFdmVudCBmcm9tICcuLi8uLi9zaG91bGRIaWRlRXZlbnQnO1xuaW1wb3J0IEVkaXRvclN0YXRlVHJhbnNmZXIgZnJvbSAnLi4vLi4vdXRpbHMvRWRpdG9yU3RhdGVUcmFuc2Zlcic7XG5pbXBvcnQge2hhdmVUaWxlRm9yRXZlbnR9IGZyb20gXCIuLi92aWV3cy9yb29tcy9FdmVudFRpbGVcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQge29iamVjdEhhc0RpZmZ9IGZyb20gXCIuLi8uLi91dGlscy9vYmplY3RzXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuY29uc3QgUEFHSU5BVEVfU0laRSA9IDIwO1xuY29uc3QgSU5JVElBTF9TSVpFID0gMjA7XG5jb25zdCBSRUFEX1JFQ0VJUFRfSU5URVJWQUxfTVMgPSA1MDA7XG5cbmNvbnN0IERFQlVHID0gZmFsc2U7XG5cbmxldCBkZWJ1Z2xvZyA9IGZ1bmN0aW9uKCkge307XG5pZiAoREVCVUcpIHtcbiAgICAvLyB1c2luZyBiaW5kIG1lYW5zIHRoYXQgd2UgZ2V0IHRvIGtlZXAgdXNlZnVsIGxpbmUgbnVtYmVycyBpbiB0aGUgY29uc29sZVxuICAgIGRlYnVnbG9nID0gY29uc29sZS5sb2cuYmluZChjb25zb2xlKTtcbn1cblxuLypcbiAqIENvbXBvbmVudCB3aGljaCBzaG93cyB0aGUgZXZlbnQgdGltZWxpbmUgaW4gYSByb29tIHZpZXcuXG4gKlxuICogQWxzbyByZXNwb25zaWJsZSBmb3IgaGFuZGxpbmcgYW5kIHNlbmRpbmcgcmVhZCByZWNlaXB0cy5cbiAqL1xuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwic3RydWN0dXJlcy5UaW1lbGluZVBhbmVsXCIpXG5jbGFzcyBUaW1lbGluZVBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyBUaGUganMtc2RrIEV2ZW50VGltZWxpbmVTZXQgb2JqZWN0IGZvciB0aGUgdGltZWxpbmUgc2VxdWVuY2Ugd2UgYXJlXG4gICAgICAgIC8vIHJlcHJlc2VudGluZy4gIFRoaXMgbWF5IG9yIG1heSBub3QgaGF2ZSBhIHJvb20sIGRlcGVuZGluZyBvbiB3aGF0IGl0J3NcbiAgICAgICAgLy8gYSB0aW1lbGluZSByZXByZXNlbnRpbmcuICBJZiBpdCBoYXMgYSByb29tLCB3ZSBtYWludGFpbiBSUnMgZXRjIGZvclxuICAgICAgICAvLyB0aGF0IHJvb20uXG4gICAgICAgIHRpbWVsaW5lU2V0OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cbiAgICAgICAgc2hvd1JlYWRSZWNlaXB0czogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIC8vIEVuYWJsZSBtYW5hZ2luZyBSUnMgYW5kIFJNcy4gVGhlc2UgcmVxdWlyZSB0aGUgdGltZWxpbmVTZXQgdG8gaGF2ZSBhIHJvb20uXG4gICAgICAgIG1hbmFnZVJlYWRSZWNlaXB0czogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIHNlbmRSZWFkUmVjZWlwdE9uTG9hZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG1hbmFnZVJlYWRNYXJrZXJzOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyB0cnVlIHRvIGdpdmUgdGhlIGNvbXBvbmVudCBhICdkaXNwbGF5OiBub25lJyBzdHlsZS5cbiAgICAgICAgaGlkZGVuOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyBJRCBvZiBhbiBldmVudCB0byBoaWdobGlnaHQuIElmIHVuZGVmaW5lZCwgbm8gZXZlbnQgd2lsbCBiZSBoaWdobGlnaHRlZC5cbiAgICAgICAgLy8gdHlwaWNhbGx5IHRoaXMgd2lsbCBiZSBlaXRoZXIgJ2V2ZW50SWQnIG9yIHVuZGVmaW5lZC5cbiAgICAgICAgaGlnaGxpZ2h0ZWRFdmVudElkOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIGlkIG9mIGFuIGV2ZW50IHRvIGp1bXAgdG8uIElmIG5vdCBnaXZlbiwgd2lsbCBnbyB0byB0aGUgZW5kIG9mIHRoZVxuICAgICAgICAvLyBsaXZlIHRpbWVsaW5lLlxuICAgICAgICBldmVudElkOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIHdoZXJlIHRvIHBvc2l0aW9uIHRoZSBldmVudCBnaXZlbiBieSBldmVudElkLCBpbiBwaXhlbHMgZnJvbSB0aGVcbiAgICAgICAgLy8gYm90dG9tIG9mIHRoZSB2aWV3cG9ydC4gSWYgbm90IGdpdmVuLCB3aWxsIHRyeSB0byBwdXQgdGhlIGV2ZW50XG4gICAgICAgIC8vIGhhbGYgd2F5IGRvd24gdGhlIHZpZXdwb3J0LlxuICAgICAgICBldmVudFBpeGVsT2Zmc2V0OiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gICAgICAgIC8vIFNob3VsZCB3ZSBzaG93IFVSTCBQcmV2aWV3c1xuICAgICAgICBzaG93VXJsUHJldmlldzogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLy8gY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIHBhbmVsIGlzIHNjcm9sbGVkLlxuICAgICAgICBvblNjcm9sbDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLy8gY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIHJlYWQtdXAtdG8gbWFyayBpcyB1cGRhdGVkLlxuICAgICAgICBvblJlYWRNYXJrZXJVcGRhdGVkOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB3ZSB3aXNoIHRvIHBhZ2luYXRlIHRoZSB0aW1lbGluZVxuICAgICAgICAvLyB3aW5kb3cuXG4gICAgICAgIG9uUGFnaW5hdGlvblJlcXVlc3Q6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIC8vIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byBzaG93IGluIGEgdGltZWxpbmVcbiAgICAgICAgdGltZWxpbmVDYXA6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgICAgICAgLy8gY2xhc3NuYW1lIHRvIHVzZSBmb3IgdGhlIG1lc3NhZ2VwYW5lbFxuICAgICAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLy8gc2hhcGUgcHJvcGVydHkgdG8gYmUgcGFzc2VkIHRvIEV2ZW50VGlsZXNcbiAgICAgICAgdGlsZVNoYXBlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIHBsYWNlaG9sZGVyIHRvIHVzZSBpZiB0aGUgdGltZWxpbmUgaXMgZW1wdHlcbiAgICAgICAgZW1wdHk6IFByb3BUeXBlcy5ub2RlLFxuXG4gICAgICAgIC8vIHdoZXRoZXIgdG8gc2hvdyByZWFjdGlvbnMgZm9yIGFuIGV2ZW50XG4gICAgICAgIHNob3dSZWFjdGlvbnM6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIHdoaWNoIGxheW91dCB0byB1c2VcbiAgICAgICAgbGF5b3V0OiBMYXlvdXRQcm9wVHlwZSxcbiAgICB9XG5cbiAgICAvLyBhIG1hcCBmcm9tIHJvb20gaWQgdG8gcmVhZCBtYXJrZXIgZXZlbnQgdGltZXN0YW1wXG4gICAgc3RhdGljIHJvb21SZWFkTWFya2VyVHNNYXAgPSB7fTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIC8vIEJ5IGRlZmF1bHQsIGRpc2FibGUgdGhlIHRpbWVsaW5lQ2FwIGluIGZhdm91ciBvZiB1bnBhZ2luYXRpbmcgYmFzZWQgb25cbiAgICAgICAgLy8gZXZlbnQgdGlsZSBoZWlnaHRzLiAoU2VlIF91bnBhZ2luYXRlRXZlbnRzKVxuICAgICAgICB0aW1lbGluZUNhcDogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgY2xhc3NOYW1lOiAnbXhfUm9vbVZpZXdfbWVzc2FnZVBhbmVsJyxcbiAgICAgICAgc2VuZFJlYWRSZWNlaXB0T25Mb2FkOiB0cnVlLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgZGVidWdsb2coXCJUaW1lbGluZVBhbmVsOiBtb3VudGluZ1wiKTtcblxuICAgICAgICB0aGlzLmxhc3RSUlNlbnRFdmVudElkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmxhc3RSTVNlbnRFdmVudElkID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMuX21lc3NhZ2VQYW5lbCA9IGNyZWF0ZVJlZigpO1xuXG4gICAgICAgIC8vIFhYWDogd2UgY291bGQgdHJhY2sgUk0gcGVyIFRpbWVsaW5lU2V0IHJhdGhlciB0aGFuIHBlciBSb29tLlxuICAgICAgICAvLyBidXQgZm9yIG5vdyB3ZSBqdXN0IGRvIGl0IHBlciByb29tIGZvciBzaW1wbGljaXR5LlxuICAgICAgICBsZXQgaW5pdGlhbFJlYWRNYXJrZXIgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tYW5hZ2VSZWFkTWFya2Vycykge1xuICAgICAgICAgICAgY29uc3QgcmVhZG1hcmtlciA9IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5nZXRBY2NvdW50RGF0YSgnbS5mdWxseV9yZWFkJyk7XG4gICAgICAgICAgICBpZiAocmVhZG1hcmtlcikge1xuICAgICAgICAgICAgICAgIGluaXRpYWxSZWFkTWFya2VyID0gcmVhZG1hcmtlci5nZXRDb250ZW50KCkuZXZlbnRfaWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluaXRpYWxSZWFkTWFya2VyID0gdGhpcy5fZ2V0Q3VycmVudFJlYWRSZWNlaXB0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgICAgIGxpdmVFdmVudHM6IFtdLFxuICAgICAgICAgICAgdGltZWxpbmVMb2FkaW5nOiB0cnVlLCAvLyB0cmFjayB3aGV0aGVyIG91ciByb29tIHRpbWVsaW5lIGlzIGxvYWRpbmdcblxuICAgICAgICAgICAgLy8gdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBldmVudCB0aGF0IGlzIHRvIGJlIHNob3duXG4gICAgICAgICAgICBmaXJzdFZpc2libGVFdmVudEluZGV4OiAwLFxuXG4gICAgICAgICAgICAvLyBjYW5CYWNrUGFnaW5hdGUgPT0gZmFsc2UgbWF5IG1lYW46XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gKiB3ZSBoYXZlbid0IChzdWNjZXNzZnVsbHkpIGxvYWRlZCB0aGUgdGltZWxpbmUgeWV0LCBvcjpcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAqIHdlIGhhdmUgZ290IHRvIHRoZSBwb2ludCB3aGVyZSB0aGUgcm9vbSB3YXMgY3JlYXRlZCwgb3I6XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gKiB0aGUgc2VydmVyIGluZGljYXRlZCB0aGF0IHRoZXJlIHdlcmUgbm8gbW9yZSB2aXNpYmxlIGV2ZW50c1xuICAgICAgICAgICAgLy8gIChub3JtYWxseSBpbXBseWluZyB3ZSBnb3QgdG8gdGhlIHN0YXJ0IG9mIHRoZSByb29tKSwgb3I6XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gKiB3ZSBnYXZlIHVwIGFza2luZyB0aGUgc2VydmVyIGZvciBtb3JlIGV2ZW50c1xuICAgICAgICAgICAgY2FuQmFja1BhZ2luYXRlOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gY2FuRm9yd2FyZFBhZ2luYXRlID09IGZhbHNlIG1heSBtZWFuOlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICogd2UgaGF2ZW4ndCAoc3VjY2Vzc2Z1bGx5KSBsb2FkZWQgdGhlIHRpbWVsaW5lIHlldFxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICogd2UgaGF2ZSBnb3QgdG8gdGhlIGVuZCBvZiB0aW1lIGFuZCBhcmUgbm93IHRyYWNraW5nIHRoZSBsaXZlXG4gICAgICAgICAgICAvLyAgIHRpbWVsaW5lLCBvcjpcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAqIHRoZSBzZXJ2ZXIgaW5kaWNhdGVkIHRoYXQgdGhlcmUgd2VyZSBubyBtb3JlIHZpc2libGUgZXZlbnRzXG4gICAgICAgICAgICAvLyAgIChub3Qgc3VyZSBpZiB0aGlzIGV2ZXIgaGFwcGVucyB3aGVuIHdlJ3JlIG5vdCBhdCB0aGUgbGl2ZVxuICAgICAgICAgICAgLy8gICB0aW1lbGluZSksIG9yOlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICogd2UgYXJlIGxvb2tpbmcgYXQgc29tZSBoaXN0b3JpY2FsIHBvaW50LCBidXQgZ2F2ZSB1cCBhc2tpbmdcbiAgICAgICAgICAgIC8vICAgdGhlIHNlcnZlciBmb3IgbW9yZSBldmVudHNcbiAgICAgICAgICAgIGNhbkZvcndhcmRQYWdpbmF0ZTogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIHN0YXJ0IHdpdGggdGhlIHJlYWQtbWFya2VyIHZpc2libGUsIHNvIHRoYXQgd2Ugc2VlIGl0cyBhbmltYXRlZFxuICAgICAgICAgICAgLy8gZGlzYXBwZWFyYW5jZSB3aGVuIHN3aXRjaGluZyBpbnRvIHRoZSByb29tLlxuICAgICAgICAgICAgcmVhZE1hcmtlclZpc2libGU6IHRydWUsXG5cbiAgICAgICAgICAgIHJlYWRNYXJrZXJFdmVudElkOiBpbml0aWFsUmVhZE1hcmtlcixcblxuICAgICAgICAgICAgYmFja1BhZ2luYXRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZm9yd2FyZFBhZ2luYXRpbmc6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyBjYWNoZSBvZiBtYXRyaXhDbGllbnQuZ2V0U3luY1N0YXRlKCkgKGJ1dCBmcm9tIHRoZSAnc3luYycgZXZlbnQpXG4gICAgICAgICAgICBjbGllbnRTeW5jU3RhdGU6IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRTeW5jU3RhdGUoKSxcblxuICAgICAgICAgICAgLy8gc2hvdWxkIHRoZSBldmVudCB0aWxlcyBoYXZlIHR3ZWx2ZSBob3VyIHRpbWVzXG4gICAgICAgICAgICBpc1R3ZWx2ZUhvdXI6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93VHdlbHZlSG91clRpbWVzdGFtcHNcIiksXG5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBzaG93IHRpbWVzdGFtcHMgb24gZXZlbnQgdGlsZXM/XG4gICAgICAgICAgICBhbHdheXNTaG93VGltZXN0YW1wczogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFsd2F5c1Nob3dUaW1lc3RhbXBzXCIpLFxuXG4gICAgICAgICAgICAvLyBob3cgbG9uZyB0byBzaG93IHRoZSBSTSBmb3Igd2hlbiBpdCdzIHZpc2libGUgaW4gdGhlIHdpbmRvd1xuICAgICAgICAgICAgcmVhZE1hcmtlckluVmlld1RocmVzaG9sZE1zOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwicmVhZE1hcmtlckluVmlld1RocmVzaG9sZE1zXCIpLFxuXG4gICAgICAgICAgICAvLyBob3cgbG9uZyB0byBzaG93IHRoZSBSTSBmb3Igd2hlbiBpdCdzIHNjcm9sbGVkIG9mZi1zY3JlZW5cbiAgICAgICAgICAgIHJlYWRNYXJrZXJPdXRPZlZpZXdUaHJlc2hvbGRNczogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInJlYWRNYXJrZXJPdXRPZlZpZXdUaHJlc2hvbGRNc1wiKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIlJvb20udGltZWxpbmVcIiwgdGhpcy5vblJvb21UaW1lbGluZSk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIlJvb20udGltZWxpbmVSZXNldFwiLCB0aGlzLm9uUm9vbVRpbWVsaW5lUmVzZXQpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tLnJlZGFjdGlvblwiLCB0aGlzLm9uUm9vbVJlZGFjdGlvbik7XG4gICAgICAgIC8vIHNhbWUgZXZlbnQgaGFuZGxlciBhcyBSb29tLnJlZGFjdGlvbiBhcyBmb3IgYm90aCB3ZSBqdXN0IGRvIGZvcmNlVXBkYXRlXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIlJvb20ucmVkYWN0aW9uQ2FuY2VsbGVkXCIsIHRoaXMub25Sb29tUmVkYWN0aW9uKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFwiUm9vbS5yZWNlaXB0XCIsIHRoaXMub25Sb29tUmVjZWlwdCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIlJvb20ubG9jYWxFY2hvVXBkYXRlZFwiLCB0aGlzLm9uTG9jYWxFY2hvVXBkYXRlZCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIlJvb20uYWNjb3VudERhdGFcIiwgdGhpcy5vbkFjY291bnREYXRhKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFwiRXZlbnQuZGVjcnlwdGVkXCIsIHRoaXMub25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIkV2ZW50LnJlcGxhY2VkXCIsIHRoaXMub25FdmVudFJlcGxhY2VkKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFwic3luY1wiLCB0aGlzLm9uU3luYyk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIE1vdmUgaW50byBjb25zdHJ1Y3RvclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tYW5hZ2VSZWFkUmVjZWlwdHMpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUmVhZFJlY2VpcHRPblVzZXJBY3Rpdml0eSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1hbmFnZVJlYWRNYXJrZXJzKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVJlYWRNYXJrZXJPblVzZXJBY3Rpdml0eSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faW5pdFRpbWVsaW5lKHRoaXMucHJvcHMpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIGlmIChuZXdQcm9wcy50aW1lbGluZVNldCAhPT0gdGhpcy5wcm9wcy50aW1lbGluZVNldCkge1xuICAgICAgICAgICAgLy8gdGhyb3cgbmV3IEVycm9yKFwiY2hhbmdpbmcgdGltZWxpbmVTZXQgb24gYSBUaW1lbGluZVBhbmVsIGlzIG5vdCBzdXBwb3J0ZWRcIik7XG5cbiAgICAgICAgICAgIC8vIHJlZ3JldHRhYmx5LCB0aGlzIGRvZXMgaGFwcGVuOyBpbiBwYXJ0aWN1bGFyLCB3aGVuIGpvaW5pbmcgYVxuICAgICAgICAgICAgLy8gcm9vbSB3aXRoIC9qb2luLiBJbiB0aGF0IGNhc2UsIHRoZXJlIGFyZSB0d28gUm9vbXMgaW5cbiAgICAgICAgICAgIC8vIGNpcmN1bGF0aW9uIC0gb25lIHdoaWNoIGlzIGNyZWF0ZWQgYnkgdGhlIE1hdHJpeENsaWVudC5qb2luUm9vbVxuICAgICAgICAgICAgLy8gY2FsbCBhbmQgdXNlZCB0byBjcmVhdGUgdGhlIFJvb21WaWV3LCBhbmQgYSBzZWNvbmQgd2hpY2ggaXNcbiAgICAgICAgICAgIC8vIGNyZWF0ZWQgYnkgdGhlIHN5bmMgbG9vcCBvbmNlIHRoZSByb29tIGNvbWVzIGJhY2sgZG93biB0aGUgL3N5bmNcbiAgICAgICAgICAgIC8vIHBpcGUuIE9uY2UgdGhlIGxhdHRlciBoYXBwZW5zLCBvdXIgcm9vbSBpcyByZXBsYWNlZCB3aXRoIHRoZSBuZXcgb25lLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGZvciBub3csIGp1c3Qgd2FybiBhYm91dCB0aGlzLiBCdXQgd2UncmUgZ29pbmcgdG8gZW5kIHVwIHBhZ2luYXRpbmdcbiAgICAgICAgICAgIC8vIGJvdGggcm9vbXMgc2VwYXJhdGVseSwgYW5kIGl0J3MgYWxsIGJhZC5cbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlJlcGxhY2luZyB0aW1lbGluZVNldCBvbiBhIFRpbWVsaW5lUGFuZWwgLSBjb25mdXNpb24gbWF5IGVuc3VlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld1Byb3BzLmV2ZW50SWQgIT0gdGhpcy5wcm9wcy5ldmVudElkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRpbWVsaW5lUGFuZWwgc3dpdGNoaW5nIHRvIGV2ZW50SWQgXCIgKyBuZXdQcm9wcy5ldmVudElkICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiICh3YXMgXCIgKyB0aGlzLnByb3BzLmV2ZW50SWQgKyBcIilcIik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW5pdFRpbWVsaW5lKG5ld1Byb3BzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgICBpZiAob2JqZWN0SGFzRGlmZih0aGlzLnByb3BzLCBuZXh0UHJvcHMpKSB7XG4gICAgICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwKFwiVGltZWxpbmUuc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBwcm9wcyBjaGFuZ2VcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm9wcyBiZWZvcmU6XCIsIHRoaXMucHJvcHMpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicHJvcHMgYWZ0ZXI6XCIsIG5leHRQcm9wcyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqZWN0SGFzRGlmZih0aGlzLnN0YXRlLCBuZXh0U3RhdGUpKSB7XG4gICAgICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwKFwiVGltZWxpbmUuc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBzdGF0ZSBjaGFuZ2VcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzdGF0ZSBiZWZvcmU6XCIsIHRoaXMuc3RhdGUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3RhdGUgYWZ0ZXI6XCIsIG5leHRTdGF0ZSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIC8vIHNldCBhIGJvb2xlYW4gdG8gc2F5IHdlJ3ZlIGJlZW4gdW5tb3VudGVkLCB3aGljaCBhbnkgcGVuZGluZ1xuICAgICAgICAvLyBwcm9taXNlcyBjYW4gdXNlIHRvIHRocm93IGF3YXkgdGhlaXIgcmVzdWx0cy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gKFdlIGNvdWxkIHVzZSBpc01vdW50ZWQsIGJ1dCBmYWNlYm9vayBoYXZlIGRlcHJlY2F0ZWQgdGhhdC4pXG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuX3JlYWRSZWNlaXB0QWN0aXZpdHlUaW1lcikge1xuICAgICAgICAgICAgdGhpcy5fcmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyLmFib3J0KCk7XG4gICAgICAgICAgICB0aGlzLl9yZWFkUmVjZWlwdEFjdGl2aXR5VGltZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9yZWFkTWFya2VyQWN0aXZpdHlUaW1lcikge1xuICAgICAgICAgICAgdGhpcy5fcmVhZE1hcmtlckFjdGl2aXR5VGltZXIuYWJvcnQoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlYWRNYXJrZXJBY3Rpdml0eVRpbWVyID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpZW50KSB7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJSb29tLnRpbWVsaW5lXCIsIHRoaXMub25Sb29tVGltZWxpbmUpO1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS50aW1lbGluZVJlc2V0XCIsIHRoaXMub25Sb29tVGltZWxpbmVSZXNldCk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJSb29tLnJlZGFjdGlvblwiLCB0aGlzLm9uUm9vbVJlZGFjdGlvbik7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJSb29tLnJlZGFjdGlvbkNhbmNlbGxlZFwiLCB0aGlzLm9uUm9vbVJlZGFjdGlvbik7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJSb29tLnJlY2VpcHRcIiwgdGhpcy5vblJvb21SZWNlaXB0KTtcbiAgICAgICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihcIlJvb20ubG9jYWxFY2hvVXBkYXRlZFwiLCB0aGlzLm9uTG9jYWxFY2hvVXBkYXRlZCk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJSb29tLmFjY291bnREYXRhXCIsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJFdmVudC5kZWNyeXB0ZWRcIiwgdGhpcy5vbkV2ZW50RGVjcnlwdGVkKTtcbiAgICAgICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihcIkV2ZW50LnJlcGxhY2VkXCIsIHRoaXMub25FdmVudFJlcGxhY2VkKTtcbiAgICAgICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihcInN5bmNcIiwgdGhpcy5vblN5bmMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25NZXNzYWdlTGlzdFVuZmlsbFJlcXVlc3QgPSAoYmFja3dhcmRzLCBzY3JvbGxUb2tlbikgPT4ge1xuICAgICAgICAvLyBJZiBiYWNrd2FyZHMsIHVucGFnaW5hdGUgZnJvbSB0aGUgYmFjayAoaS5lLiB0aGUgc3RhcnQgb2YgdGhlIHRpbWVsaW5lKVxuICAgICAgICBjb25zdCBkaXIgPSBiYWNrd2FyZHMgPyBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyA6IEV2ZW50VGltZWxpbmUuRk9SV0FSRFM7XG4gICAgICAgIGRlYnVnbG9nKFwiVGltZWxpbmVQYW5lbDogdW5wYWdpbmF0aW5nIGV2ZW50cyBpbiBkaXJlY3Rpb25cIiwgZGlyKTtcblxuICAgICAgICAvLyBBbGwgdGlsZXMgYXJlIGluc2VydGVkIGJ5IE1lc3NhZ2VQYW5lbCB0byBoYXZlIGEgc2Nyb2xsVG9rZW4gPT09IGV2ZW50SWQsIGFuZFxuICAgICAgICAvLyB0aGlzIHBhcnRpY3VsYXIgZXZlbnQgc2hvdWxkIGJlIHRoZSBmaXJzdCBvciBsYXN0IHRvIGJlIHVucGFnaW5hdGVkLlxuICAgICAgICBjb25zdCBldmVudElkID0gc2Nyb2xsVG9rZW47XG5cbiAgICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5zdGF0ZS5ldmVudHMuZmluZEluZGV4KFxuICAgICAgICAgICAgKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV2LmdldElkKCkgPT09IGV2ZW50SWQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGNvdW50ID0gYmFja3dhcmRzID8gbWFya2VyICsgMSA6IHRoaXMuc3RhdGUuZXZlbnRzLmxlbmd0aCAtIG1hcmtlcjtcblxuICAgICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIlRpbWVsaW5lUGFuZWw6IFVucGFnaW5hdGluZ1wiLCBjb3VudCwgXCJpbiBkaXJlY3Rpb25cIiwgZGlyKTtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVsaW5lV2luZG93LnVucGFnaW5hdGUoY291bnQsIGJhY2t3YXJkcyk7XG5cbiAgICAgICAgICAgIC8vIFdlIGNhbiBub3cgcGFnaW5hdGUgaW4gdGhlIHVucGFnaW5hdGVkIGRpcmVjdGlvblxuICAgICAgICAgICAgY29uc3QgY2FuUGFnaW5hdGVLZXkgPSAoYmFja3dhcmRzKSA/ICdjYW5CYWNrUGFnaW5hdGUnIDogJ2NhbkZvcndhcmRQYWdpbmF0ZSc7XG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50cywgbGl2ZUV2ZW50cywgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCB9ID0gdGhpcy5fZ2V0RXZlbnRzKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBbY2FuUGFnaW5hdGVLZXldOiB0cnVlLFxuICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICBsaXZlRXZlbnRzLFxuICAgICAgICAgICAgICAgIGZpcnN0VmlzaWJsZUV2ZW50SW5kZXgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvblBhZ2luYXRpb25SZXF1ZXN0ID0gKHRpbWVsaW5lV2luZG93LCBkaXJlY3Rpb24sIHNpemUpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25QYWdpbmF0aW9uUmVxdWVzdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25QYWdpbmF0aW9uUmVxdWVzdCh0aW1lbGluZVdpbmRvdywgZGlyZWN0aW9uLCBzaXplKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aW1lbGluZVdpbmRvdy5wYWdpbmF0ZShkaXJlY3Rpb24sIHNpemUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHNldCBvZmYgYSBwYWdpbmF0aW9uIHJlcXVlc3QuXG4gICAgb25NZXNzYWdlTGlzdEZpbGxSZXF1ZXN0ID0gYmFja3dhcmRzID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zaG91bGRQYWdpbmF0ZSgpKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcblxuICAgICAgICBjb25zdCBkaXIgPSBiYWNrd2FyZHMgPyBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyA6IEV2ZW50VGltZWxpbmUuRk9SV0FSRFM7XG4gICAgICAgIGNvbnN0IGNhblBhZ2luYXRlS2V5ID0gYmFja3dhcmRzID8gJ2NhbkJhY2tQYWdpbmF0ZScgOiAnY2FuRm9yd2FyZFBhZ2luYXRlJztcbiAgICAgICAgY29uc3QgcGFnaW5hdGluZ0tleSA9IGJhY2t3YXJkcyA/ICdiYWNrUGFnaW5hdGluZycgOiAnZm9yd2FyZFBhZ2luYXRpbmcnO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZVtjYW5QYWdpbmF0ZUtleV0pIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwiVGltZWxpbmVQYW5lbDogaGF2ZSBnaXZlbiB1cFwiLCBkaXIsIFwicGFnaW5hdGluZyB0aGlzIHRpbWVsaW5lXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX3RpbWVsaW5lV2luZG93LmNhblBhZ2luYXRlKGRpcikpIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwiVGltZWxpbmVQYW5lbDogY2FuJ3RcIiwgZGlyLCBcInBhZ2luYXRlIGFueSBmdXJ0aGVyXCIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7W2NhblBhZ2luYXRlS2V5XTogZmFsc2V9KTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJhY2t3YXJkcyAmJiB0aGlzLnN0YXRlLmZpcnN0VmlzaWJsZUV2ZW50SW5kZXggIT09IDApIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwiVGltZWxpbmVQYW5lbDogd29uJ3RcIiwgZGlyLCBcInBhZ2luYXRlIHBhc3QgZmlyc3QgdmlzaWJsZSBldmVudFwiKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVidWdsb2coXCJUaW1lbGluZVBhbmVsOiBJbml0aWF0aW5nIHBhZ2luYXRlOyBiYWNrd2FyZHM6XCIrYmFja3dhcmRzKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7W3BhZ2luYXRpbmdLZXldOiB0cnVlfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMub25QYWdpbmF0aW9uUmVxdWVzdCh0aGlzLl90aW1lbGluZVdpbmRvdywgZGlyLCBQQUdJTkFURV9TSVpFKS50aGVuKChyKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgIGRlYnVnbG9nKFwiVGltZWxpbmVQYW5lbDogcGFnaW5hdGUgY29tcGxldGUgYmFja3dhcmRzOlwiK2JhY2t3YXJkcytcIjsgc3VjY2VzczpcIityKTtcblxuICAgICAgICAgICAgY29uc3QgeyBldmVudHMsIGxpdmVFdmVudHMsIGZpcnN0VmlzaWJsZUV2ZW50SW5kZXggfSA9IHRoaXMuX2dldEV2ZW50cygpO1xuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgW3BhZ2luYXRpbmdLZXldOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBbY2FuUGFnaW5hdGVLZXldOiByLFxuICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICBsaXZlRXZlbnRzLFxuICAgICAgICAgICAgICAgIGZpcnN0VmlzaWJsZUV2ZW50SW5kZXgsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBtb3ZpbmcgdGhlIHdpbmRvdyBpbiB0aGlzIGRpcmVjdGlvbiBtYXkgbWVhbiB0aGF0IHdlIGNhbiBub3dcbiAgICAgICAgICAgIC8vIHBhZ2luYXRlIGluIHRoZSBvdGhlciB3aGVyZSB3ZSBwcmV2aW91c2x5IGNvdWxkIG5vdC5cbiAgICAgICAgICAgIGNvbnN0IG90aGVyRGlyZWN0aW9uID0gYmFja3dhcmRzID8gRXZlbnRUaW1lbGluZS5GT1JXQVJEUyA6IEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTO1xuICAgICAgICAgICAgY29uc3QgY2FuUGFnaW5hdGVPdGhlcldheUtleSA9IGJhY2t3YXJkcyA/ICdjYW5Gb3J3YXJkUGFnaW5hdGUnIDogJ2NhbkJhY2tQYWdpbmF0ZSc7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGVbY2FuUGFnaW5hdGVPdGhlcldheUtleV0gJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUob3RoZXJEaXJlY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgZGVidWdsb2coJ1RpbWVsaW5lUGFuZWw6IGNhbiBub3cnLCBvdGhlckRpcmVjdGlvbiwgJ3BhZ2luYXRlIGFnYWluJyk7XG4gICAgICAgICAgICAgICAgbmV3U3RhdGVbY2FuUGFnaW5hdGVPdGhlcldheUtleV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEb24ndCByZXNvbHZlIHVudGlsIHRoZSBzZXRTdGF0ZSBoYXMgY29tcGxldGVkOiB3ZSBuZWVkIHRvIGxldFxuICAgICAgICAgICAgLy8gdGhlIGNvbXBvbmVudCB1cGRhdGUgYmVmb3JlIHdlIGNvbnNpZGVyIHRoZSBwYWdpbmF0aW9uIGNvbXBsZXRlZCxcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSB3ZSdsbCBlbmQgdXAgcGFnaW5hdGluZyBpbiBhbGwgdGhlIGhpc3RvcnkgdGhlIGpzLXNka1xuICAgICAgICAgICAgLy8gaGFzIGluIG1lbW9yeSBiZWNhdXNlIHdlIG5ldmVyIGdhdmUgdGhlIGNvbXBvbmVudCBhIGNoYW5jZSB0byBzY3JvbGxcbiAgICAgICAgICAgIC8vIGl0c2VsZiBpbnRvIHRoZSByaWdodCBwbGFjZVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBjYW4gY29udGludWUgcGFnaW5hdGluZyBpbiB0aGUgZ2l2ZW4gZGlyZWN0aW9uIGlmOlxuICAgICAgICAgICAgICAgICAgICAvLyAtIF90aW1lbGluZVdpbmRvdy5wYWdpbmF0ZSBzYXlzIHdlIGNhblxuICAgICAgICAgICAgICAgICAgICAvLyAtIHdlJ3JlIHBhZ2luYXRpbmcgZm9yd2FyZHMsIG9yIHdlIHdvbid0IGJlIHRyeWluZyB0b1xuICAgICAgICAgICAgICAgICAgICAvLyAgIHBhZ2luYXRlIGJhY2t3YXJkcyBwYXN0IHRoZSBmaXJzdCB2aXNpYmxlIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUociAmJiAoIWJhY2t3YXJkcyB8fCBmaXJzdFZpc2libGVFdmVudEluZGV4ID09PSAwKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uTWVzc2FnZUxpc3RTY3JvbGwgPSBlID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25TY3JvbGwpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25TY3JvbGwoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5tYW5hZ2VSZWFkTWFya2Vycykge1xuICAgICAgICAgICAgY29uc3Qgcm1Qb3NpdGlvbiA9IHRoaXMuZ2V0UmVhZE1hcmtlclBvc2l0aW9uKCk7XG4gICAgICAgICAgICAvLyB3ZSBoaWRlIHRoZSByZWFkIG1hcmtlciB3aGVuIGl0IGZpcnN0IGNvbWVzIG9udG8gdGhlIHNjcmVlbiwgYnV0IGlmXG4gICAgICAgICAgICAvLyBpdCBnb2VzIGJhY2sgb2ZmIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiAocHJlc3VtYWJseSBiZWNhdXNlIHRoZSB1c2VyXG4gICAgICAgICAgICAvLyBjbGlja3Mgb24gdGhlICdqdW1wIHRvIGJvdHRvbScgYnV0dG9uKSwgd2UgbmVlZCB0byByZS1lbmFibGUgaXQuXG4gICAgICAgICAgICBpZiAocm1Qb3NpdGlvbiA8IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtyZWFkTWFya2VyVmlzaWJsZTogdHJ1ZX0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiByZWFkIG1hcmtlciBwb3NpdGlvbiBnb2VzIGJldHdlZW4gMCBhbmQgLTEvMSxcbiAgICAgICAgICAgIC8vIChhbmQgdXNlciBpcyBhY3RpdmUpLCBzd2l0Y2ggdGltZW91dFxuICAgICAgICAgICAgY29uc3QgdGltZW91dCA9IHRoaXMuX3JlYWRNYXJrZXJUaW1lb3V0KHJtUG9zaXRpb24pO1xuICAgICAgICAgICAgLy8gTk8tT1Agd2hlbiB0aW1lb3V0IGFscmVhZHkgaGFzIHNldCB0byB0aGUgZ2l2ZW4gdmFsdWVcbiAgICAgICAgICAgIHRoaXMuX3JlYWRNYXJrZXJBY3Rpdml0eVRpbWVyLmNoYW5nZVRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25BY3Rpb24gPSBwYXlsb2FkID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnaWdub3JlX3N0YXRlX2NoYW5nZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBcImVkaXRfZXZlbnRcIikge1xuICAgICAgICAgICAgY29uc3QgZWRpdFN0YXRlID0gcGF5bG9hZC5ldmVudCA/IG5ldyBFZGl0b3JTdGF0ZVRyYW5zZmVyKHBheWxvYWQuZXZlbnQpIDogbnVsbDtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2VkaXRTdGF0ZX0sICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5ldmVudCAmJiB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5zY3JvbGxUb0V2ZW50SWZOZWVkZWQoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmV2ZW50LmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBcInNjcm9sbF90b19ib3R0b21cIikge1xuICAgICAgICAgICAgdGhpcy5qdW1wVG9MaXZlVGltZWxpbmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvblJvb21UaW1lbGluZSA9IChldiwgcm9vbSwgdG9TdGFydE9mVGltZWxpbmUsIHJlbW92ZWQsIGRhdGEpID0+IHtcbiAgICAgICAgLy8gaWdub3JlIGV2ZW50cyBmb3Igb3RoZXIgdGltZWxpbmUgc2V0c1xuICAgICAgICBpZiAoZGF0YS50aW1lbGluZS5nZXRUaW1lbGluZVNldCgpICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0KSByZXR1cm47XG5cbiAgICAgICAgLy8gaWdub3JlIGFueXRoaW5nIGJ1dCByZWFsLXRpbWUgdXBkYXRlcyBhdCB0aGUgZW5kIG9mIHRoZSByb29tOlxuICAgICAgICAvLyB1cGRhdGVzIGZyb20gcGFnaW5hdGlvbiB3aWxsIGhhcHBlbiB3aGVuIHRoZSBwYWdpbmF0ZSBjb21wbGV0ZXMuXG4gICAgICAgIGlmICh0b1N0YXJ0T2ZUaW1lbGluZSB8fCAhZGF0YSB8fCAhZGF0YS5saXZlRXZlbnQpIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5nZXRTY3JvbGxTdGF0ZSgpLnN0dWNrQXRCb3R0b20pIHtcbiAgICAgICAgICAgIC8vIHdlIHdvbid0IGxvYWQgdGhpcyBldmVudCBub3csIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0byBwdXNoIGFueVxuICAgICAgICAgICAgLy8gZXZlbnRzIG9mZiB0aGUgb3RoZXIgZW5kIG9mIHRoZSB0aW1lbGluZS4gQnV0IHdlIG5lZWQgdG8gbm90ZVxuICAgICAgICAgICAgLy8gdGhhdCB3ZSBjYW4gbm93IHBhZ2luYXRlLlxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y2FuRm9yd2FyZFBhZ2luYXRlOiB0cnVlfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0ZWxsIHRoZSB0aW1lbGluZSB3aW5kb3cgdG8gdHJ5IHRvIGFkdmFuY2UgaXRzZWxmLCBidXQgbm90IHRvIG1ha2VcbiAgICAgICAgLy8gYW4gaHR0cCByZXF1ZXN0IHRvIGRvIHNvLlxuICAgICAgICAvL1xuICAgICAgICAvLyB3ZSBkZWxpYmVyYXRlbHkgYXZvaWQgZ29pbmcgdmlhIHRoZSBTY3JvbGxQYW5lbCBmb3IgdGhpcyBjYWxsIC0gdGhlXG4gICAgICAgIC8vIFNjcm9sbFBhbmVsIG1pZ2h0IGFscmVhZHkgaGF2ZSBhbiBhY3RpdmUgcGFnaW5hdGlvbiBwcm9taXNlLCB3aGljaFxuICAgICAgICAvLyB3aWxsIGZhaWwsIGJ1dCB3b3VsZCBzdG9wIHVzIHBhc3NpbmcgdGhlIHBhZ2luYXRpb24gcmVxdWVzdCB0byB0aGVcbiAgICAgICAgLy8gdGltZWxpbmUgd2luZG93LlxuICAgICAgICAvL1xuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS92ZWN0b3Itd2ViL2lzc3Vlcy8xMDM1XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lV2luZG93LnBhZ2luYXRlKEV2ZW50VGltZWxpbmUuRk9SV0FSRFMsIDEsIGZhbHNlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgeyByZXR1cm47IH1cblxuICAgICAgICAgICAgY29uc3QgeyBldmVudHMsIGxpdmVFdmVudHMsIGZpcnN0VmlzaWJsZUV2ZW50SW5kZXggfSA9IHRoaXMuX2dldEV2ZW50cygpO1xuICAgICAgICAgICAgY29uc3QgbGFzdExpdmVFdmVudCA9IGxpdmVFdmVudHNbbGl2ZUV2ZW50cy5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgY29uc3QgdXBkYXRlZFN0YXRlID0ge1xuICAgICAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICAgICAgICBsaXZlRXZlbnRzLFxuICAgICAgICAgICAgICAgIGZpcnN0VmlzaWJsZUV2ZW50SW5kZXgsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsZXQgY2FsbFJNVXBkYXRlZDtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm1hbmFnZVJlYWRNYXJrZXJzKSB7XG4gICAgICAgICAgICAgICAgLy8gd2hlbiBhIG5ldyBldmVudCBhcnJpdmVzIHdoZW4gdGhlIHVzZXIgaXMgbm90IHdhdGNoaW5nIHRoZVxuICAgICAgICAgICAgICAgIC8vIHdpbmRvdywgYnV0IHRoZSB3aW5kb3cgaXMgaW4gaXRzIGF1dG8tc2Nyb2xsIG1vZGUsIG1ha2Ugc3VyZSB0aGVcbiAgICAgICAgICAgICAgICAvLyByZWFkIG1hcmtlciBpcyB2aXNpYmxlLlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gV2UgaWdub3JlIGV2ZW50cyB3ZSBoYXZlIHNlbnQgb3Vyc2VsdmVzOyB3ZSBkb24ndCB3YW50IHRvIHNlZSB0aGVcbiAgICAgICAgICAgICAgICAvLyByZWFkLW1hcmtlciB3aGVuIGEgcmVtb3RlIGVjaG8gb2YgYW4gZXZlbnQgd2UgaGF2ZSBqdXN0IHNlbnQgdGFrZXNcbiAgICAgICAgICAgICAgICAvLyBtb3JlIHRoYW4gdGhlIHRpbWVvdXQgb24gdXNlckFjdGl2ZVJlY2VudGx5LlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgbXlVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbmRlciA9IGV2LnNlbmRlciA/IGV2LnNlbmRlci51c2VySWQgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNhbGxSTVVwZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoc2VuZGVyICE9IG15VXNlcklkICYmICFVc2VyQWN0aXZpdHkuc2hhcmVkSW5zdGFuY2UoKS51c2VyQWN0aXZlUmVjZW50bHkoKSkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkU3RhdGUucmVhZE1hcmtlclZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGFzdExpdmVFdmVudCAmJiB0aGlzLmdldFJlYWRNYXJrZXJQb3NpdGlvbigpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGtub3cgd2UncmUgc3R1Y2tBdEJvdHRvbSwgc28gd2UgY2FuIGFkdmFuY2UgdGhlIFJNXG4gICAgICAgICAgICAgICAgICAgIC8vIGltbWVkaWF0ZWx5LCB0byBzYXZlIGEgbGF0ZXIgcmVuZGVyIGN5Y2xlXG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0UmVhZE1hcmtlcihsYXN0TGl2ZUV2ZW50LmdldElkKCksIGxhc3RMaXZlRXZlbnQuZ2V0VHMoKSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRTdGF0ZS5yZWFkTWFya2VyVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkU3RhdGUucmVhZE1hcmtlckV2ZW50SWQgPSBsYXN0TGl2ZUV2ZW50LmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxSTVVwZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh1cGRhdGVkU3RhdGUsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC51cGRhdGVUaW1lbGluZU1pbkhlaWdodCgpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsUk1VcGRhdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25SZWFkTWFya2VyVXBkYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25Sb29tVGltZWxpbmVSZXNldCA9IChyb29tLCB0aW1lbGluZVNldCkgPT4ge1xuICAgICAgICBpZiAodGltZWxpbmVTZXQgIT09IHRoaXMucHJvcHMudGltZWxpbmVTZXQpIHJldHVybjtcblxuICAgICAgICBpZiAodGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQgJiYgdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQuaXNBdEJvdHRvbSgpKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkVGltZWxpbmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjYW5SZXNldFRpbWVsaW5lID0gKCkgPT4gdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQgJiYgdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQuaXNBdEJvdHRvbSgpO1xuXG4gICAgb25Sb29tUmVkYWN0aW9uID0gKGV2LCByb29tKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZm9yIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChyb29tICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICAvLyB3ZSBjb3VsZCBza2lwIGFuIHVwZGF0ZSBpZiB0aGUgZXZlbnQgaXNuJ3QgaW4gb3VyIHRpbWVsaW5lLFxuICAgICAgICAvLyBidXQgdGhhdCdzIHByb2JhYmx5IGFuIGVhcmx5IG9wdGltaXNhdGlvbi5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBvbkV2ZW50UmVwbGFjZWQgPSAocmVwbGFjZWRFdmVudCwgcm9vbSkgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciByb29tc1xuICAgICAgICBpZiAocm9vbSAhPT0gdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tKSByZXR1cm47XG5cbiAgICAgICAgLy8gd2UgY291bGQgc2tpcCBhbiB1cGRhdGUgaWYgdGhlIGV2ZW50IGlzbid0IGluIG91ciB0aW1lbGluZSxcbiAgICAgICAgLy8gYnV0IHRoYXQncyBwcm9iYWJseSBhbiBlYXJseSBvcHRpbWlzYXRpb24uXG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgb25Sb29tUmVjZWlwdCA9IChldiwgcm9vbSkgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciByb29tc1xuICAgICAgICBpZiAocm9vbSAhPT0gdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBvbkxvY2FsRWNob1VwZGF0ZWQgPSAoZXYsIHJvb20sIG9sZEV2ZW50SWQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWdub3JlIGV2ZW50cyBmb3Igb3RoZXIgcm9vbXNcbiAgICAgICAgaWYgKHJvb20gIT09IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3JlbG9hZEV2ZW50cygpO1xuICAgIH07XG5cbiAgICBvbkFjY291bnREYXRhID0gKGV2LCByb29tKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZm9yIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChyb29tICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpICE9PSBcIm0uZnVsbHlfcmVhZFwiKSByZXR1cm47XG5cbiAgICAgICAgLy8gWFhYOiByb29tUmVhZE1hcmtlclRzTWFwIG5vdCB1cGRhdGVkIGhlcmUgc28gaXQgaXMgbm93IGluY29uc2lzdGVudC4gUmVwbGFjZVxuICAgICAgICAvLyB0aGlzIG1lY2hhbmlzbSBvZiBkZXRlcm1pbmluZyB3aGVyZSB0aGUgUk0gaXMgcmVsYXRpdmUgdG8gdGhlIHZpZXctcG9ydCB3aXRoXG4gICAgICAgIC8vIG9uZSBzdXBwb3J0ZWQgYnkgdGhlIHNlcnZlciAodGhlIGNsaWVudCBuZWVkcyBtb3JlIHRoYW4gYW4gZXZlbnQgSUQpLlxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJlYWRNYXJrZXJFdmVudElkOiBldi5nZXRDb250ZW50KCkuZXZlbnRfaWQsXG4gICAgICAgIH0sIHRoaXMucHJvcHMub25SZWFkTWFya2VyVXBkYXRlZCk7XG4gICAgfTtcblxuICAgIG9uRXZlbnREZWNyeXB0ZWQgPSBldiA9PiB7XG4gICAgICAgIC8vIENhbiBiZSBudWxsIGZvciB0aGUgbm90aWZpY2F0aW9uIHRpbWVsaW5lLCBldGMuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tKSByZXR1cm47XG5cbiAgICAgICAgLy8gTmVlZCB0byB1cGRhdGUgYXMgd2UgZG9uJ3QgZGlzcGxheSBldmVudCB0aWxlcyBmb3IgZXZlbnRzIHRoYXRcbiAgICAgICAgLy8gaGF2ZW4ndCB5ZXQgYmVlbiBkZWNyeXB0ZWQuIFRoZSBldmVudCB3aWxsIGhhdmUganVzdCBiZWVuIHVwZGF0ZWRcbiAgICAgICAgLy8gaW4gcGxhY2Ugc28gd2UganVzdCBuZWVkIHRvIHJlLXJlbmRlci5cbiAgICAgICAgLy8gVE9ETzogV2Ugc2hvdWxkIHJlc3RyaWN0IHRoaXMgdG8gb25seSBldmVudHMgaW4gb3VyIHRpbWVsaW5lLFxuICAgICAgICAvLyBidXQgcG9zc2libHkgdGhlIGV2ZW50IHRpbGUgaXRzZWxmIHNob3VsZCBqdXN0IHVwZGF0ZSB3aGVuIHRoaXNcbiAgICAgICAgLy8gaGFwcGVucyB0byBzYXZlIHVzIHJlLXJlbmRlcmluZyB0aGUgd2hvbGUgdGltZWxpbmUuXG4gICAgICAgIGlmIChldi5nZXRSb29tSWQoKSA9PT0gdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tLnJvb21JZCkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uU3luYyA9IChzdGF0ZSwgcHJldlN0YXRlLCBkYXRhKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NsaWVudFN5bmNTdGF0ZTogc3RhdGV9KTtcbiAgICB9O1xuXG4gICAgX3JlYWRNYXJrZXJUaW1lb3V0KHJlYWRNYXJrZXJQb3NpdGlvbikge1xuICAgICAgICByZXR1cm4gcmVhZE1hcmtlclBvc2l0aW9uID09PSAwID9cbiAgICAgICAgICAgIHRoaXMuc3RhdGUucmVhZE1hcmtlckluVmlld1RocmVzaG9sZE1zIDpcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucmVhZE1hcmtlck91dE9mVmlld1RocmVzaG9sZE1zO1xuICAgIH1cblxuICAgIGFzeW5jIHVwZGF0ZVJlYWRNYXJrZXJPblVzZXJBY3Rpdml0eSgpIHtcbiAgICAgICAgY29uc3QgaW5pdGlhbFRpbWVvdXQgPSB0aGlzLl9yZWFkTWFya2VyVGltZW91dCh0aGlzLmdldFJlYWRNYXJrZXJQb3NpdGlvbigpKTtcbiAgICAgICAgdGhpcy5fcmVhZE1hcmtlckFjdGl2aXR5VGltZXIgPSBuZXcgVGltZXIoaW5pdGlhbFRpbWVvdXQpO1xuXG4gICAgICAgIHdoaWxlICh0aGlzLl9yZWFkTWFya2VyQWN0aXZpdHlUaW1lcikgeyAvL3Vuc2V0IG9uIHVubW91bnRcbiAgICAgICAgICAgIFVzZXJBY3Rpdml0eS5zaGFyZWRJbnN0YW5jZSgpLnRpbWVXaGlsZUFjdGl2ZVJlY2VudGx5KHRoaXMuX3JlYWRNYXJrZXJBY3Rpdml0eVRpbWVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5fcmVhZE1hcmtlckFjdGl2aXR5VGltZXIuZmluaXNoZWQoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgY29udGludWU7IC8qIGFib3J0ZWQgKi8gfVxuICAgICAgICAgICAgLy8gb3V0c2lkZSBvZiB0cnkvY2F0Y2ggdG8gbm90IHN3YWxsb3cgZXJyb3JzXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVJlYWRNYXJrZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHVwZGF0ZVJlYWRSZWNlaXB0T25Vc2VyQWN0aXZpdHkoKSB7XG4gICAgICAgIHRoaXMuX3JlYWRSZWNlaXB0QWN0aXZpdHlUaW1lciA9IG5ldyBUaW1lcihSRUFEX1JFQ0VJUFRfSU5URVJWQUxfTVMpO1xuICAgICAgICB3aGlsZSAodGhpcy5fcmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyKSB7IC8vdW5zZXQgb24gdW5tb3VudFxuICAgICAgICAgICAgVXNlckFjdGl2aXR5LnNoYXJlZEluc3RhbmNlKCkudGltZVdoaWxlQWN0aXZlTm93KHRoaXMuX3JlYWRSZWNlaXB0QWN0aXZpdHlUaW1lcik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX3JlYWRSZWNlaXB0QWN0aXZpdHlUaW1lci5maW5pc2hlZCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyBjb250aW51ZTsgLyogYWJvcnRlZCAqLyB9XG4gICAgICAgICAgICAvLyBvdXRzaWRlIG9mIHRyeS9jYXRjaCB0byBub3Qgc3dhbGxvdyBlcnJvcnNcbiAgICAgICAgICAgIHRoaXMuc2VuZFJlYWRSZWNlaXB0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZW5kUmVhZFJlY2VpcHQgPSAoKSA9PiB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibG93QmFuZHdpZHRoXCIpKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubWFuYWdlUmVhZFJlY2VpcHRzKSByZXR1cm47XG4gICAgICAgIC8vIFRoaXMgaGFwcGVucyBvbiB1c2VyX2FjdGl2aXR5X2VuZCB3aGljaCBpcyBkZWxheWVkLCBhbmQgaXQnc1xuICAgICAgICAvLyB2ZXJ5IHBvc3NpYmxlIGhhdmUgbG9nZ2VkIG91dCB3aXRoaW4gdGhhdCB0aW1lZnJhbWUsIHNvIGNoZWNrXG4gICAgICAgIC8vIHdlIHN0aWxsIGhhdmUgYSBjbGllbnQuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgLy8gaWYgbm8gY2xpZW50IG9yIGNsaWVudCBpcyBndWVzdCBkb24ndCBzZW5kIFJSIG9yIFJNXG4gICAgICAgIGlmICghY2xpIHx8IGNsaS5pc0d1ZXN0KCkpIHJldHVybjtcblxuICAgICAgICBsZXQgc2hvdWxkU2VuZFJSID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBjdXJyZW50UlJFdmVudElkID0gdGhpcy5fZ2V0Q3VycmVudFJlYWRSZWNlaXB0KHRydWUpO1xuICAgICAgICBjb25zdCBjdXJyZW50UlJFdmVudEluZGV4ID0gdGhpcy5faW5kZXhGb3JFdmVudElkKGN1cnJlbnRSUkV2ZW50SWQpO1xuICAgICAgICAvLyBXZSB3YW50IHRvIGF2b2lkIHNlbmRpbmcgb3V0IHJlYWQgcmVjZWlwdHMgd2hlbiB3ZSBhcmUgbG9va2luZyBhdFxuICAgICAgICAvLyBldmVudHMgaW4gdGhlIHBhc3Qgd2hpY2ggYXJlIGJlZm9yZSB0aGUgbGF0ZXN0IFJSLlxuICAgICAgICAvL1xuICAgICAgICAvLyBGb3Igbm93LCBsZXQncyBhcHBseSBhIGhldXJpc3RpYzogaWYgKGEpIHRoZSBldmVudCBjb3JyZXNwb25kaW5nIHRvXG4gICAgICAgIC8vIHRoZSBsYXRlc3QgUlIgKGVpdGhlciBmcm9tIHRoZSBzZXJ2ZXIsIG9yIHNlbnQgYnkgb3Vyc2VsdmVzKSBkb2Vzbid0XG4gICAgICAgIC8vIGFwcGVhciBpbiBvdXIgdGltZWxpbmUsIGFuZCAoYikgd2UgY291bGQgZm9yd2FyZC1wYWdpbmF0ZSB0aGUgZXZlbnRcbiAgICAgICAgLy8gdGltZWxpbmUsIHRoZW4gZG9uJ3Qgc2VuZCBhbnkgbW9yZSBSUnMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoaXMgaXNuJ3Qgd2F0ZXJ0aWdodCwgYXMgd2UgY291bGQgYmUgbG9va2luZyBhdCBhIHNlY3Rpb24gb2ZcbiAgICAgICAgLy8gdGltZWxpbmUgd2hpY2ggaXMgKmFmdGVyKiB0aGUgbGF0ZXN0IFJSIChzbyB3ZSBzaG91bGQgYWN0dWFsbHkgc2VuZFxuICAgICAgICAvLyBSUnMpIC0gYnV0IHRoYXQgaXMgYSBiaXQgb2YgYSBuaWNoZSBjYXNlLiBJdCB3aWxsIHNvcnQgaXRzZWxmIG91dCB3aGVuXG4gICAgICAgIC8vIHRoZSB1c2VyIGV2ZW50dWFsbHkgaGl0cyB0aGUgbGl2ZSB0aW1lbGluZS5cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKGN1cnJlbnRSUkV2ZW50SWQgJiYgY3VycmVudFJSRXZlbnRJbmRleCA9PT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIHRoaXMuX3RpbWVsaW5lV2luZG93LmNhblBhZ2luYXRlKEV2ZW50VGltZWxpbmUuRk9SV0FSRFMpKSB7XG4gICAgICAgICAgICBzaG91bGRTZW5kUlIgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxhc3RSZWFkRXZlbnRJbmRleCA9IHRoaXMuX2dldExhc3REaXNwbGF5ZWRFdmVudEluZGV4KHtcbiAgICAgICAgICAgIGlnbm9yZU93bjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChsYXN0UmVhZEV2ZW50SW5kZXggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHNob3VsZFNlbmRSUiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsYXN0UmVhZEV2ZW50ID0gdGhpcy5zdGF0ZS5ldmVudHNbbGFzdFJlYWRFdmVudEluZGV4XTtcbiAgICAgICAgc2hvdWxkU2VuZFJSID0gc2hvdWxkU2VuZFJSICYmXG4gICAgICAgICAgICAvLyBPbmx5IHNlbmQgYSBSUiBpZiB0aGUgbGFzdCByZWFkIGV2ZW50IGlzIGFoZWFkIGluIHRoZSB0aW1lbGluZSByZWxhdGl2ZSB0b1xuICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgUlIgZXZlbnQuXG4gICAgICAgICAgICBsYXN0UmVhZEV2ZW50SW5kZXggPiBjdXJyZW50UlJFdmVudEluZGV4ICYmXG4gICAgICAgICAgICAvLyBPbmx5IHNlbmQgYSBSUiBpZiB0aGUgbGFzdCBSUiBzZXQgIT0gdGhlIG9uZSB3ZSB3b3VsZCBzZW5kXG4gICAgICAgICAgICB0aGlzLmxhc3RSUlNlbnRFdmVudElkICE9IGxhc3RSZWFkRXZlbnQuZ2V0SWQoKTtcblxuICAgICAgICAvLyBPbmx5IHNlbmQgYSBSTSBpZiB0aGUgbGFzdCBSTSBzZW50ICE9IHRoZSBvbmUgd2Ugd291bGQgc2VuZFxuICAgICAgICBjb25zdCBzaG91bGRTZW5kUk0gPVxuICAgICAgICAgICAgdGhpcy5sYXN0Uk1TZW50RXZlbnRJZCAhPSB0aGlzLnN0YXRlLnJlYWRNYXJrZXJFdmVudElkO1xuXG4gICAgICAgIC8vIHdlIGFsc28gcmVtZW1iZXIgdGhlIGxhc3QgcmVhZCByZWNlaXB0IHdlIHNlbnQgdG8gYXZvaWQgc3BhbW1pbmcgdGhlXG4gICAgICAgIC8vIHNhbWUgb25lIGF0IHRoZSBzZXJ2ZXIgcmVwZWF0ZWRseVxuICAgICAgICBpZiAoc2hvdWxkU2VuZFJSIHx8IHNob3VsZFNlbmRSTSkge1xuICAgICAgICAgICAgaWYgKHNob3VsZFNlbmRSUikge1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdFJSU2VudEV2ZW50SWQgPSBsYXN0UmVhZEV2ZW50LmdldElkKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhc3RSZWFkRXZlbnQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sYXN0Uk1TZW50RXZlbnRJZCA9IHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQ7XG5cbiAgICAgICAgICAgIGRlYnVnbG9nKCdUaW1lbGluZVBhbmVsOiBTZW5kaW5nIFJlYWQgTWFya2VycyBmb3IgJyxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgICdybScsIHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQsXG4gICAgICAgICAgICAgICAgbGFzdFJlYWRFdmVudCA/ICdyciAnICsgbGFzdFJlYWRFdmVudC5nZXRJZCgpIDogJycsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldFJvb21SZWFkTWFya2VycyhcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQsXG4gICAgICAgICAgICAgICAgbGFzdFJlYWRFdmVudCwgLy8gQ291bGQgYmUgbnVsbCwgaW4gd2hpY2ggY2FzZSBubyBSUiBpcyBzZW50XG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICApLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gL3JlYWRfbWFya2VycyBBUEkgaXMgbm90IGltcGxlbWVudGVkIG9uIHRoaXMgSFMsIGZhbGxiYWNrIHRvIGp1c3QgUlJcbiAgICAgICAgICAgICAgICBpZiAoZS5lcnJjb2RlID09PSAnTV9VTlJFQ09HTklaRUQnICYmIGxhc3RSZWFkRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZW5kUmVhZFJlY2VpcHQoXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0UmVhZEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgICkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RSUlNlbnRFdmVudElkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpdCBmYWlsZWQsIHNvIGFsbG93IHJldHJpZXMgbmV4dCB0aW1lIHRoZSB1c2VyIGlzIGFjdGl2ZVxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFJSU2VudEV2ZW50SWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Uk1TZW50RXZlbnRJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBkbyBhIHF1aWNrLXJlc2V0IG9mIG91ciB1bnJlYWROb3RpZmljYXRpb25Db3VudCB0byBhdm9pZCBoYXZpbmdcbiAgICAgICAgICAgIC8vIHRvIHdhaXQgZnJvbSB0aGUgcmVtb3RlIGVjaG8gZnJvbSB0aGUgaG9tZXNlcnZlci5cbiAgICAgICAgICAgIC8vIHdlIG9ubHkgZG8gdGhpcyBpZiB3ZSdyZSByaWdodCBhdCB0aGUgZW5kLCBiZWNhdXNlIHdlJ3JlIGp1c3QgYXNzdW1pbmdcbiAgICAgICAgICAgIC8vIHRoYXQgc2VuZGluZyBhbiBSUiBmb3IgdGhlIGxhdGVzdCBtZXNzYWdlIHdpbGwgc2V0IG91ciBub3RpZiBjb3VudGVyXG4gICAgICAgICAgICAvLyB0byB6ZXJvOiBpdCBtYXkgbm90IGRvIHRoaXMgaWYgd2Ugc2VuZCBhbiBSUiBmb3Igc29tZXdoZXJlIGJlZm9yZSB0aGUgZW5kLlxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdEVuZE9mTGl2ZVRpbWVsaW5lKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20uc2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQoJ3RvdGFsJywgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tLnNldFVucmVhZE5vdGlmaWNhdGlvbkNvdW50KCdoaWdobGlnaHQnLCAwKTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdvbl9yb29tX3JlYWQnLFxuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gaWYgdGhlIHJlYWQgbWFya2VyIGlzIG9uIHRoZSBzY3JlZW4sIHdlIGNhbiBub3cgYXNzdW1lIHdlJ3ZlIGNhdWdodCB1cCB0byB0aGUgZW5kXG4gICAgLy8gb2YgdGhlIHNjcmVlbiwgc28gbW92ZSB0aGUgbWFya2VyIGRvd24gdG8gdGhlIGJvdHRvbSBvZiB0aGUgc2NyZWVuLlxuICAgIHVwZGF0ZVJlYWRNYXJrZXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5tYW5hZ2VSZWFkTWFya2VycykgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5nZXRSZWFkTWFya2VyUG9zaXRpb24oKSA9PT0gMSkge1xuICAgICAgICAgICAgLy8gdGhlIHJlYWQgbWFya2VyIGlzIGF0IGFuIGV2ZW50IGJlbG93IHRoZSB2aWV3cG9ydCxcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gcmV3aW5kIGl0LlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIG1vdmUgdGhlIFJNIHRvICphZnRlciogdGhlIG1lc3NhZ2UgYXQgdGhlIGJvdHRvbSBvZiB0aGUgc2NyZWVuLiBUaGlzXG4gICAgICAgIC8vIGF2b2lkcyBhIHByb2JsZW0gd2hlcmVieSB3ZSBuZXZlciBhZHZhbmNlIHRoZSBSTSBpZiB0aGVyZSBpcyBhIGh1Z2VcbiAgICAgICAgLy8gbWVzc2FnZSB3aGljaCBkb2Vzbid0IGZpdCBvbiB0aGUgc2NyZWVuLlxuICAgICAgICBjb25zdCBsYXN0RGlzcGxheWVkSW5kZXggPSB0aGlzLl9nZXRMYXN0RGlzcGxheWVkRXZlbnRJbmRleCh7XG4gICAgICAgICAgICBhbGxvd1BhcnRpYWw6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChsYXN0RGlzcGxheWVkSW5kZXggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsYXN0RGlzcGxheWVkRXZlbnQgPSB0aGlzLnN0YXRlLmV2ZW50c1tsYXN0RGlzcGxheWVkSW5kZXhdO1xuICAgICAgICB0aGlzLl9zZXRSZWFkTWFya2VyKFxuICAgICAgICAgICAgbGFzdERpc3BsYXllZEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICBsYXN0RGlzcGxheWVkRXZlbnQuZ2V0VHMoKSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyB0aGUgcmVhZC1tYXJrZXIgc2hvdWxkIGJlY29tZSBpbnZpc2libGUsIHNvIHRoYXQgaWYgdGhlIHVzZXIgc2Nyb2xsc1xuICAgICAgICAvLyBkb3duLCB0aGV5IGRvbid0IHNlZSBpdC5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVhZE1hcmtlclZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlYWRNYXJrZXJWaXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2VuZCB0aGUgdXBkYXRlZCByZWFkIG1hcmtlciAoYWxvbmcgd2l0aCByZWFkIHJlY2VpcHQpIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgdGhpcy5zZW5kUmVhZFJlY2VpcHQoKTtcbiAgICB9O1xuXG5cbiAgICAvLyBhZHZhbmNlIHRoZSByZWFkIG1hcmtlciBwYXN0IGFueSBldmVudHMgd2Ugc2VudCBvdXJzZWx2ZXMuXG4gICAgX2FkdmFuY2VSZWFkTWFya2VyUGFzdE15RXZlbnRzKCkge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHJldHVybjtcblxuICAgICAgICAvLyB3ZSBjYWxsIGBfdGltZWxpbmVXaW5kb3cuZ2V0RXZlbnRzKClgIHJhdGhlciB0aGFuIHVzaW5nXG4gICAgICAgIC8vIGB0aGlzLnN0YXRlLmxpdmVFdmVudHNgLCBiZWNhdXNlIFJlYWN0IGJhdGNoZXMgdGhlIHVwZGF0ZSB0byB0aGVcbiAgICAgICAgLy8gbGF0dGVyLCBzbyBpdCBtYXkgbm90IGhhdmUgYmVlbiB1cGRhdGVkIHlldC5cbiAgICAgICAgY29uc3QgZXZlbnRzID0gdGhpcy5fdGltZWxpbmVXaW5kb3cuZ2V0RXZlbnRzKCk7XG5cbiAgICAgICAgLy8gZmlyc3QgZmluZCB3aGVyZSB0aGUgY3VycmVudCBSTSBpc1xuICAgICAgICBsZXQgaTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGV2ZW50c1tpXS5nZXRJZCgpID09IHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA+PSBldmVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBub3cgdGhpbmsgYWJvdXQgYWR2YW5jaW5nIGl0XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZDtcbiAgICAgICAgZm9yIChpKys7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ID0gZXZlbnRzW2ldO1xuICAgICAgICAgICAgaWYgKCFldi5zZW5kZXIgfHwgZXYuc2VuZGVyLnVzZXJJZCAhPSBteVVzZXJJZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGkgaXMgbm93IHRoZSBmaXJzdCB1bnJlYWQgbWVzc2FnZSB3aGljaCB3ZSBkaWRuJ3Qgc2VuZCBvdXJzZWx2ZXMuXG4gICAgICAgIGktLTtcblxuICAgICAgICBjb25zdCBldiA9IGV2ZW50c1tpXTtcbiAgICAgICAgdGhpcy5fc2V0UmVhZE1hcmtlcihldi5nZXRJZCgpLCBldi5nZXRUcygpKTtcbiAgICB9XG5cbiAgICAvKiBqdW1wIGRvd24gdG8gdGhlIGJvdHRvbSBvZiB0aGlzIHJvb20sIHdoZXJlIG5ldyBldmVudHMgYXJlIGFycml2aW5nXG4gICAgICovXG4gICAganVtcFRvTGl2ZVRpbWVsaW5lID0gKCkgPT4ge1xuICAgICAgICAvLyBpZiB3ZSBjYW4ndCBmb3J3YXJkLXBhZ2luYXRlIHRoZSBleGlzdGluZyB0aW1lbGluZSwgdGhlbiB0aGVyZVxuICAgICAgICAvLyBpcyBubyBwb2ludCByZWxvYWRpbmcgaXQgLSBqdXN0IGp1bXAgc3RyYWlnaHQgdG8gdGhlIGJvdHRvbS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCByZWxvYWQgdGhlIHRpbWVsaW5lIHJhdGhlciB0aGFuIHRyeWluZyB0byBwYWdpbmF0ZVxuICAgICAgICAvLyB0aHJvdWdoIGFsbCBvZiBzcGFjZS10aW1lLlxuICAgICAgICBpZiAodGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUykpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRUaW1lbGluZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBzY3JvbGwgdG8gc2hvdyB0aGUgcmVhZC11cC10byBtYXJrZXIuIFdlIHB1dCBpdCAxLzMgb2YgdGhlIHdheSBkb3duXG4gICAgICogdGhlIGNvbnRhaW5lci5cbiAgICAgKi9cbiAgICBqdW1wVG9SZWFkTWFya2VyID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQpIHJldHVybjtcblxuICAgICAgICAvLyB3ZSBtYXkgbm90IGhhdmUgbG9hZGVkIHRoZSBldmVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSByZWFkLW1hcmtlclxuICAgICAgICAvLyBpbnRvIHRoZSBfdGltZWxpbmVXaW5kb3cuIEluIHRoYXQgY2FzZSwgYXR0ZW1wdHMgdG8gc2Nyb2xsIHRvIGl0XG4gICAgICAgIC8vIHdpbGwgZmFpbC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gYSBxdWljayB3YXkgdG8gZmlndXJlIG91dCBpZiB3ZSd2ZSBsb2FkZWQgdGhlIHJlbGV2YW50IGV2ZW50IGlzXG4gICAgICAgIC8vIHNpbXBseSB0byBjaGVjayBpZiB0aGUgbWVzc2FnZXBhbmVsIGtub3dzIHdoZXJlIHRoZSByZWFkLW1hcmtlciBpcy5cbiAgICAgICAgY29uc3QgcmV0ID0gdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQuZ2V0UmVhZE1hcmtlclBvc2l0aW9uKCk7XG4gICAgICAgIGlmIChyZXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIFRoZSBtZXNzYWdlcGFuZWwga25vd3Mgd2hlcmUgdGhlIFJNIGlzLCBzbyB3ZSBtdXN0IGhhdmUgbG9hZGVkXG4gICAgICAgICAgICAvLyB0aGUgcmVsZXZhbnQgZXZlbnQuXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5zY3JvbGxUb0V2ZW50KHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQsXG4gICAgICAgICAgICAgICAgMCwgMS8zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvb2tzIGxpa2Ugd2UgaGF2ZW4ndCBsb2FkZWQgdGhlIGV2ZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHJlYWQtbWFya2VyLlxuICAgICAgICAvLyBBcyB3aXRoIGp1bXBUb0xpdmVUaW1lbGluZSwgd2Ugd2FudCB0byByZWxvYWQgdGhlIHRpbWVsaW5lIGFyb3VuZCB0aGVcbiAgICAgICAgLy8gcmVhZC1tYXJrZXIuXG4gICAgICAgIHRoaXMuX2xvYWRUaW1lbGluZSh0aGlzLnN0YXRlLnJlYWRNYXJrZXJFdmVudElkLCAwLCAxLzMpO1xuICAgIH07XG5cbiAgICAvKiB1cGRhdGUgdGhlIHJlYWQtdXAtdG8gbWFya2VyIHRvIG1hdGNoIHRoZSByZWFkIHJlY2VpcHRcbiAgICAgKi9cbiAgICBmb3JnZXRSZWFkTWFya2VyID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHJldHVybjtcblxuICAgICAgICBjb25zdCBybUlkID0gdGhpcy5fZ2V0Q3VycmVudFJlYWRSZWNlaXB0KCk7XG5cbiAgICAgICAgLy8gc2VlIGlmIHdlIGtub3cgdGhlIHRpbWVzdGFtcCBmb3IgdGhlIHJyIGV2ZW50XG4gICAgICAgIGNvbnN0IHRsID0gdGhpcy5wcm9wcy50aW1lbGluZVNldC5nZXRUaW1lbGluZUZvckV2ZW50KHJtSWQpO1xuICAgICAgICBsZXQgcm1UcztcbiAgICAgICAgaWYgKHRsKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IHRsLmdldEV2ZW50cygpLmZpbmQoKGUpID0+IHsgcmV0dXJuIGUuZ2V0SWQoKSA9PSBybUlkOyB9KTtcbiAgICAgICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgICAgIHJtVHMgPSBldmVudC5nZXRUcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0UmVhZE1hcmtlcihybUlkLCBybVRzKTtcbiAgICB9O1xuXG4gICAgLyogcmV0dXJuIHRydWUgaWYgdGhlIGNvbnRlbnQgaXMgZnVsbHkgc2Nyb2xsZWQgZG93biBhbmQgd2UgYXJlXG4gICAgICogYXQgdGhlIGVuZCBvZiB0aGUgbGl2ZSB0aW1lbGluZS5cbiAgICAgKi9cbiAgICBpc0F0RW5kT2ZMaXZlVGltZWxpbmUgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudFxuICAgICAgICAgICAgJiYgdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQuaXNBdEJvdHRvbSgpXG4gICAgICAgICAgICAmJiB0aGlzLl90aW1lbGluZVdpbmRvd1xuICAgICAgICAgICAgJiYgIXRoaXMuX3RpbWVsaW5lV2luZG93LmNhblBhZ2luYXRlKEV2ZW50VGltZWxpbmUuRk9SV0FSRFMpO1xuICAgIH1cblxuXG4gICAgLyogZ2V0IHRoZSBjdXJyZW50IHNjcm9sbCBzdGF0ZS4gU2VlIFNjcm9sbFBhbmVsLmdldFNjcm9sbFN0YXRlIGZvclxuICAgICAqIGRldGFpbHMuXG4gICAgICpcbiAgICAgKiByZXR1cm5zIG51bGwgaWYgd2UgYXJlIG5vdCBtb3VudGVkLlxuICAgICAqL1xuICAgIGdldFNjcm9sbFN0YXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5nZXRTY3JvbGxTdGF0ZSgpO1xuICAgIH07XG5cbiAgICAvLyByZXR1cm5zIG9uZSBvZjpcbiAgICAvL1xuICAgIC8vICBudWxsOiB0aGVyZSBpcyBubyByZWFkIG1hcmtlclxuICAgIC8vICAtMTogcmVhZCBtYXJrZXIgaXMgYWJvdmUgdGhlIHdpbmRvd1xuICAgIC8vICAgMDogcmVhZCBtYXJrZXIgaXMgdmlzaWJsZVxuICAgIC8vICArMTogcmVhZCBtYXJrZXIgaXMgYmVsb3cgdGhlIHdpbmRvd1xuICAgIGdldFJlYWRNYXJrZXJQb3NpdGlvbiA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLm1hbmFnZVJlYWRNYXJrZXJzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKCF0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgcmV0ID0gdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQuZ2V0UmVhZE1hcmtlclBvc2l0aW9uKCk7XG4gICAgICAgIGlmIChyZXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGUgbWVzc2FnZVBhbmVsIGRvZXNuJ3Qga25vdyB3aGVyZSB0aGUgcmVhZCBtYXJrZXIgaXMuXG4gICAgICAgIC8vIGlmIHdlIGtub3cgdGhlIHRpbWVzdGFtcCBvZiB0aGUgcmVhZCBtYXJrZXIsIG1ha2UgYSBndWVzcyBiYXNlZCBvbiB0aGF0LlxuICAgICAgICBjb25zdCBybVRzID0gVGltZWxpbmVQYW5lbC5yb29tUmVhZE1hcmtlclRzTWFwW3RoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWRdO1xuICAgICAgICBpZiAocm1UcyAmJiB0aGlzLnN0YXRlLmV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAocm1UcyA8IHRoaXMuc3RhdGUuZXZlbnRzWzBdLmdldFRzKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIGNhbkp1bXBUb1JlYWRNYXJrZXIgPSAoKSA9PiB7XG4gICAgICAgIC8vIDEuIERvIG5vdCBzaG93IGp1bXAgYmFyIGlmIG5laXRoZXIgdGhlIFJNIG5vciB0aGUgUlIgYXJlIHNldC5cbiAgICAgICAgLy8gMy4gV2Ugd2FudCB0byBzaG93IHRoZSBiYXIgaWYgdGhlIHJlYWQtbWFya2VyIGlzIG9mZiB0aGUgdG9wIG9mIHRoZSBzY3JlZW4uXG4gICAgICAgIC8vIDQuIEFsc28sIGlmIHBvcyA9PT0gbnVsbCwgdGhlIGV2ZW50IG1pZ2h0IG5vdCBiZSBwYWdpbmF0ZWQgLSBzaG93IHRoZSB1bnJlYWQgYmFyXG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0UmVhZE1hcmtlclBvc2l0aW9uKCk7XG4gICAgICAgIGNvbnN0IHJldCA9IHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQgIT09IG51bGwgJiYgLy8gMS5cbiAgICAgICAgICAgIChwb3MgPCAwIHx8IHBvcyA9PT0gbnVsbCk7IC8vIDMuLCA0LlxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNhbGxlZCBieSB0aGUgcGFyZW50IGNvbXBvbmVudCB3aGVuIFBhZ2VVcC9Eb3duL2V0YyBpcyBwcmVzc2VkLlxuICAgICAqXG4gICAgICogV2UgcGFzcyBpdCBkb3duIHRvIHRoZSBzY3JvbGwgcGFuZWwuXG4gICAgICovXG4gICAgaGFuZGxlU2Nyb2xsS2V5ID0gZXYgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSB7IHJldHVybjsgfVxuXG4gICAgICAgIC8vIGp1bXAgdG8gdGhlIGxpdmUgdGltZWxpbmUgb24gY3RybC1lbmQsIHJhdGhlciB0aGFuIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIHRpbWVsaW5lIHdpbmRvdy5cbiAgICAgICAgaWYgKGV2LmN0cmxLZXkgJiYgIWV2LnNoaWZ0S2V5ICYmICFldi5hbHRLZXkgJiYgIWV2Lm1ldGFLZXkgJiYgZXYua2V5ID09PSBLZXkuRU5EKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBUb0xpdmVUaW1lbGluZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQuaGFuZGxlU2Nyb2xsS2V5KGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfaW5pdFRpbWVsaW5lKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IGluaXRpYWxFdmVudCA9IHByb3BzLmV2ZW50SWQ7XG4gICAgICAgIGNvbnN0IHBpeGVsT2Zmc2V0ID0gcHJvcHMuZXZlbnRQaXhlbE9mZnNldDtcblxuICAgICAgICAvLyBpZiBhIHBpeGVsT2Zmc2V0IGlzIGdpdmVuLCBpdCBpcyByZWxhdGl2ZSB0byB0aGUgYm90dG9tIG9mIHRoZVxuICAgICAgICAvLyBjb250YWluZXIuIElmIG5vdCwgcHV0IHRoZSBldmVudCBpbiB0aGUgbWlkZGxlIG9mIHRoZSBjb250YWluZXIuXG4gICAgICAgIGxldCBvZmZzZXRCYXNlID0gMTtcbiAgICAgICAgaWYgKHBpeGVsT2Zmc2V0ID09IG51bGwpIHtcbiAgICAgICAgICAgIG9mZnNldEJhc2UgPSAwLjU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fbG9hZFRpbWVsaW5lKGluaXRpYWxFdmVudCwgcGl4ZWxPZmZzZXQsIG9mZnNldEJhc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChyZSktbG9hZCB0aGUgZXZlbnQgdGltZWxpbmUsIGFuZCBpbml0aWFsaXNlIHRoZSBzY3JvbGwgc3RhdGUsIGNlbnRlcmVkXG4gICAgICogYXJvdW5kIHRoZSBnaXZlbiBldmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nP30gIGV2ZW50SWQgdGhlIGV2ZW50IHRvIGZvY3VzIG9uLiBJZiB1bmRlZmluZWQsIHdpbGxcbiAgICAgKiAgICBzY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgcm9vbS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyP30gcGl4ZWxPZmZzZXQgICBvZmZzZXQgdG8gcG9zaXRpb24gdGhlIGdpdmVuIGV2ZW50IGF0XG4gICAgICogICAgKHBpeGVscyBmcm9tIHRoZSBvZmZzZXRCYXNlKS4gSWYgb21pdHRlZCwgZGVmYXVsdHMgdG8gMC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyP30gb2Zmc2V0QmFzZSB0aGUgcmVmZXJlbmNlIHBvaW50IGZvciB0aGUgcGl4ZWxPZmZzZXQuIDBcbiAgICAgKiAgICAgbWVhbnMgdGhlIHRvcCBvZiB0aGUgY29udGFpbmVyLCAxIG1lYW5zIHRoZSBib3R0b20sIGFuZCBmcmFjdGlvbmFsXG4gICAgICogICAgIHZhbHVlcyBtZWFuIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlLiBJZiBvbWl0dGVkLCBpdCBkZWZhdWx0cyB0byAwLlxuICAgICAqXG4gICAgICogcmV0dXJucyBhIHByb21pc2Ugd2hpY2ggd2lsbCByZXNvbHZlIHdoZW4gdGhlIGxvYWQgY29tcGxldGVzLlxuICAgICAqL1xuICAgIF9sb2FkVGltZWxpbmUoZXZlbnRJZCwgcGl4ZWxPZmZzZXQsIG9mZnNldEJhc2UpIHtcbiAgICAgICAgdGhpcy5fdGltZWxpbmVXaW5kb3cgPSBuZXcgVGltZWxpbmVXaW5kb3coXG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCksIHRoaXMucHJvcHMudGltZWxpbmVTZXQsXG4gICAgICAgICAgICB7d2luZG93TGltaXQ6IHRoaXMucHJvcHMudGltZWxpbmVDYXB9KTtcblxuICAgICAgICBjb25zdCBvbkxvYWRlZCA9ICgpID0+IHtcbiAgICAgICAgICAgIC8vIGNsZWFyIHRoZSB0aW1lbGluZSBtaW4taGVpZ2h0IHdoZW5cbiAgICAgICAgICAgIC8vIChyZSlsb2FkaW5nIHRoZSB0aW1lbGluZVxuICAgICAgICAgICAgaWYgKHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQub25UaW1lbGluZVJlc2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9yZWxvYWRFdmVudHMoKTtcblxuICAgICAgICAgICAgLy8gSWYgd2Ugc3dpdGNoZWQgYXdheSBmcm9tIHRoZSByb29tIHdoaWxlIHRoZXJlIHdlcmUgcGVuZGluZ1xuICAgICAgICAgICAgLy8gb3V0Z29pbmcgZXZlbnRzLCB0aGUgcmVhZC1tYXJrZXIgd2lsbCBiZSBiZWZvcmUgdGhvc2UgZXZlbnRzLlxuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBza2lwIG92ZXIgYW55IHdoaWNoIGhhdmUgc3Vic2VxdWVudGx5IGJlZW4gc2VudC5cbiAgICAgICAgICAgIHRoaXMuX2FkdmFuY2VSZWFkTWFya2VyUGFzdE15RXZlbnRzKCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNhbkJhY2tQYWdpbmF0ZTogdGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMpLFxuICAgICAgICAgICAgICAgIGNhbkZvcndhcmRQYWdpbmF0ZTogdGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUyksXG4gICAgICAgICAgICAgICAgdGltZWxpbmVMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXNlIHRoZSBzY3JvbGwgc3RhdGUgb2YgdGhlIG1lc3NhZ2UgcGFuZWxcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgc2hvdWxkbid0IGhhcHBlbiAtIHdlIGtub3cgd2UncmUgbW91bnRlZCBiZWNhdXNlXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGluIGEgc2V0U3RhdGUgY2FsbGJhY2ssIGFuZCB3ZSBrbm93XG4gICAgICAgICAgICAgICAgICAgIC8vIHRpbWVsaW5lTG9hZGluZyBpcyBub3cgZmFsc2UsIHNvIHJlbmRlcigpIHNob3VsZCBoYXZlXG4gICAgICAgICAgICAgICAgICAgIC8vIG1vdW50ZWQgdGhlIG1lc3NhZ2UgcGFuZWwuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2FuJ3QgaW5pdGlhbGlzZSBzY3JvbGwgc3RhdGUgYmVjYXVzZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVBhbmVsIGRpZG4ndCBsb2FkXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChldmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50LnNjcm9sbFRvRXZlbnQoZXZlbnRJZCwgcGl4ZWxPZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXRCYXNlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5zY3JvbGxUb0JvdHRvbSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbmRSZWFkUmVjZWlwdE9uTG9hZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRSZWFkUmVjZWlwdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IG9uRXJyb3IgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0aW1lbGluZUxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICBgRXJyb3IgbG9hZGluZyB0aW1lbGluZSBwYW5lbCBhdCAke2V2ZW50SWR9OiAke2Vycm9yfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcblxuICAgICAgICAgICAgbGV0IG9uRmluaXNoZWQ7XG5cbiAgICAgICAgICAgIC8vIGlmIHdlIHdlcmUgZ2l2ZW4gYW4gZXZlbnQgSUQsIHRoZW4gd2hlbiB0aGUgdXNlciBjbG9zZXMgdGhlXG4gICAgICAgICAgICAvLyBkaWFsb2csIGxldCdzIGp1bXAgdG8gdGhlIGVuZCBvZiB0aGUgdGltZWxpbmUuIElmIHdlIHdlcmVuJ3QsXG4gICAgICAgICAgICAvLyBzb21ldGhpbmcgaGFzIGdvbmUgYmFkbHkgd3JvbmcgYW5kIHJhdGhlciB0aGFuIGNhdXNpbmcgYSBsb29wIG9mXG4gICAgICAgICAgICAvLyB1bmRpc21pc3NhYmxlIGRpYWxvZ3MsIGxldCdzIGp1c3QgZ2l2ZSB1cC5cbiAgICAgICAgICAgIGlmIChldmVudElkKSB7XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ28gdmlhIHRoZSBkaXNwYXRjaGVyIHNvIHRoYXQgdGhlIFVSTCBpcyB1cGRhdGVkXG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgICAgICAgaWYgKGVycm9yLmVycmNvZGUgPT0gJ01fRk9SQklEREVOJykge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUcmllZCB0byBsb2FkIGEgc3BlY2lmaWMgcG9pbnQgaW4gdGhpcyByb29tJ3MgdGltZWxpbmUsIGJ1dCB5b3UgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gdmlldyB0aGUgbWVzc2FnZSBpbiBxdWVzdGlvbi5cIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVHJpZWQgdG8gbG9hZCBhIHNwZWNpZmljIHBvaW50IGluIHRoaXMgcm9vbSdzIHRpbWVsaW5lLCBidXQgd2FzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ1bmFibGUgdG8gZmluZCBpdC5cIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIGxvYWQgdGltZWxpbmUgcG9zaXRpb24nLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJGYWlsZWQgdG8gbG9hZCB0aW1lbGluZSBwb3NpdGlvblwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiBvbkZpbmlzaGVkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gaWYgd2UgYWxyZWFkeSBoYXZlIHRoZSBldmVudCBpbiBxdWVzdGlvbiwgVGltZWxpbmVXaW5kb3cubG9hZFxuICAgICAgICAvLyByZXR1cm5zIGEgcmVzb2x2ZWQgcHJvbWlzZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gSW4gdGhpcyBzaXR1YXRpb24sIHdlIGRvbid0IHJlYWxseSB3YW50IHRvIGRlZmVyIHRoZSB1cGRhdGUgb2YgdGhlXG4gICAgICAgIC8vIHN0YXRlIHRvIHRoZSBuZXh0IGV2ZW50IGxvb3AsIGJlY2F1c2UgaXQgbWFrZXMgcm9vbS1zd2l0Y2hpbmcgZmVlbFxuICAgICAgICAvLyBxdWl0ZSBzbG93LiBTbyB3ZSBkZXRlY3QgdGhhdCBzaXR1YXRpb24gYW5kIHNob3J0Y3V0IHN0cmFpZ2h0IHRvXG4gICAgICAgIC8vIGNhbGxpbmcgX3JlbG9hZEV2ZW50cyBhbmQgdXBkYXRpbmcgdGhlIHN0YXRlLlxuXG4gICAgICAgIGNvbnN0IHRpbWVsaW5lID0gdGhpcy5wcm9wcy50aW1lbGluZVNldC5nZXRUaW1lbGluZUZvckV2ZW50KGV2ZW50SWQpO1xuICAgICAgICBpZiAodGltZWxpbmUpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBob3QtcGF0aCBvcHRpbWl6YXRpb24gYnkgc2tpcHBpbmcgYSBwcm9taXNlIHRpY2tcbiAgICAgICAgICAgIC8vIGJ5IHJlcGVhdGluZyBhIG5vLW9wIHN5bmMgYnJhbmNoIGluIFRpbWVsaW5lU2V0LmdldFRpbWVsaW5lRm9yRXZlbnQgJiBNYXRyaXhDbGllbnQuZ2V0RXZlbnRUaW1lbGluZVxuICAgICAgICAgICAgdGhpcy5fdGltZWxpbmVXaW5kb3cubG9hZChldmVudElkLCBJTklUSUFMX1NJWkUpOyAvLyBpbiB0aGlzIGJyYW5jaCB0aGlzIG1ldGhvZCB3aWxsIGhhcHBlbiBpbiBzeW5jIHRpbWVcbiAgICAgICAgICAgIG9uTG9hZGVkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwcm9tID0gdGhpcy5fdGltZWxpbmVXaW5kb3cubG9hZChldmVudElkLCBJTklUSUFMX1NJWkUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgICAgICAgICBsaXZlRXZlbnRzOiBbXSxcbiAgICAgICAgICAgICAgICBjYW5CYWNrUGFnaW5hdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNhbkZvcndhcmRQYWdpbmF0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdGltZWxpbmVMb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm9tLnRoZW4ob25Mb2FkZWQsIG9uRXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIHRoZSBjb21wbGV0aW9uIG9mIGEgdGltZWxpbmUgbG9hZCBvciBsb2NhbEVjaG9VcGRhdGUsIGJ5XG4gICAgLy8gcmVsb2FkaW5nIHRoZSBldmVudHMgZnJvbSB0aGUgdGltZWxpbmV3aW5kb3cgYW5kIHBlbmRpbmcgZXZlbnQgbGlzdCBpbnRvXG4gICAgLy8gdGhlIHN0YXRlLlxuICAgIF9yZWxvYWRFdmVudHMoKSB7XG4gICAgICAgIC8vIHdlIG1pZ2h0IGhhdmUgc3dpdGNoZWQgcm9vbXMgc2luY2UgdGhlIGxvYWQgc3RhcnRlZCAtIGp1c3QgYmluXG4gICAgICAgIC8vIHRoZSByZXN1bHRzIGlmIHNvLlxuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMuX2dldEV2ZW50cygpKTtcbiAgICB9XG5cbiAgICAvLyBnZXQgdGhlIGxpc3Qgb2YgZXZlbnRzIGZyb20gdGhlIHRpbWVsaW5lIHdpbmRvdyBhbmQgdGhlIHBlbmRpbmcgZXZlbnQgbGlzdFxuICAgIF9nZXRFdmVudHMoKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuX3RpbWVsaW5lV2luZG93LmdldEV2ZW50cygpO1xuICAgICAgICBjb25zdCBmaXJzdFZpc2libGVFdmVudEluZGV4ID0gdGhpcy5fY2hlY2tGb3JQcmVKb2luVUlTSShldmVudHMpO1xuXG4gICAgICAgIC8vIEhvbGQgb250byB0aGUgbGl2ZSBldmVudHMgc2VwYXJhdGVseS4gVGhlIHJlYWQgcmVjZWlwdCBhbmQgcmVhZCBtYXJrZXJcbiAgICAgICAgLy8gc2hvdWxkIHVzZSB0aGlzIGxpc3QsIHNvIHRoYXQgdGhleSBkb24ndCBhZHZhbmNlIGludG8gcGVuZGluZyBldmVudHMuXG4gICAgICAgIGNvbnN0IGxpdmVFdmVudHMgPSBbLi4uZXZlbnRzXTtcblxuICAgICAgICAvLyBpZiB3ZSdyZSBhdCB0aGUgZW5kIG9mIHRoZSBsaXZlIHRpbWVsaW5lLCBhcHBlbmQgdGhlIHBlbmRpbmcgZXZlbnRzXG4gICAgICAgIGlmICghdGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUykpIHtcbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKC4uLnRoaXMucHJvcHMudGltZWxpbmVTZXQuZ2V0UGVuZGluZ0V2ZW50cygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICBsaXZlRXZlbnRzLFxuICAgICAgICAgICAgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgdW5kZWNyeXB0YWJsZSBtZXNzYWdlcyB0aGF0IHdlcmUgc2VudCB3aGlsZSB0aGUgdXNlciB3YXMgbm90IGluXG4gICAgICogdGhlIHJvb20uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FycmF5PE1hdHJpeEV2ZW50Pn0gZXZlbnRzIFRoZSB0aW1lbGluZSBldmVudHMgdG8gY2hlY2tcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluZGV4IHdpdGhpbiBgZXZlbnRzYCBvZiB0aGUgZXZlbnQgYWZ0ZXIgdGhlIG1vc3QgcmVjZW50XG4gICAgICogdW5kZWNyeXB0YWJsZSBldmVudCB0aGF0IHdhcyBzZW50IHdoaWxlIHRoZSB1c2VyIHdhcyBub3QgaW4gdGhlIHJvb20uICBJZiBub1xuICAgICAqIHN1Y2ggZXZlbnRzIHdlcmUgZm91bmQsIHRoZW4gaXQgcmV0dXJucyAwLlxuICAgICAqL1xuICAgIF9jaGVja0ZvclByZUpvaW5VSVNJKGV2ZW50cykge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tO1xuXG4gICAgICAgIGlmIChldmVudHMubGVuZ3RoID09PSAwIHx8ICFyb29tIHx8XG4gICAgICAgICAgICAhTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzUm9vbUVuY3J5cHRlZChyb29tLnJvb21JZCkpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZDtcblxuICAgICAgICAvLyBnZXQgdGhlIHVzZXIncyBtZW1iZXJzaGlwIGF0IHRoZSBsYXN0IGV2ZW50IGJ5IGdldHRpbmcgdGhlIHRpbWVsaW5lXG4gICAgICAgIC8vIHRoYXQgdGhlIGV2ZW50IGJlbG9uZ3MgdG8sIGFuZCB0cmF2ZXJzaW5nIHRoZSB0aW1lbGluZSBsb29raW5nIGZvclxuICAgICAgICAvLyB0aGF0IGV2ZW50LCB3aGlsZSBrZWVwaW5nIHRyYWNrIG9mIHRoZSB1c2VyJ3MgbWVtYmVyc2hpcFxuICAgICAgICBsZXQgaTtcbiAgICAgICAgbGV0IHVzZXJNZW1iZXJzaGlwID0gXCJsZWF2ZVwiO1xuICAgICAgICBmb3IgKGkgPSBldmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVsaW5lID0gcm9vbS5nZXRUaW1lbGluZUZvckV2ZW50KGV2ZW50c1tpXS5nZXRJZCgpKTtcbiAgICAgICAgICAgIGlmICghdGltZWxpbmUpIHtcbiAgICAgICAgICAgICAgICAvLyBTb21laG93LCBpdCBzZWVtcyB0byBiZSBwb3NzaWJsZSBmb3IgbGl2ZSBldmVudHMgdG8gbm90IGhhdmVcbiAgICAgICAgICAgICAgICAvLyBhIHRpbWVsaW5lLCBldmVuIHRob3VnaCB0aGF0IHNob3VsZCBub3QgaGFwcGVuLiA6KFxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEyMTIwXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICBgRXZlbnQgJHtldmVudHNbaV0uZ2V0SWQoKX0gaW4gcm9vbSAke3Jvb20ucm9vbUlkfSBpcyBsaXZlLCBgICtcbiAgICAgICAgICAgICAgICAgICAgYGJ1dCBpdCBkb2VzIG5vdCBoYXZlIGEgdGltZWxpbmVgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB1c2VyTWVtYmVyc2hpcEV2ZW50ID1cbiAgICAgICAgICAgICAgICAgICAgdGltZWxpbmUuZ2V0U3RhdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUykuZ2V0TWVtYmVyKHVzZXJJZCk7XG4gICAgICAgICAgICB1c2VyTWVtYmVyc2hpcCA9IHVzZXJNZW1iZXJzaGlwRXZlbnQgPyB1c2VyTWVtYmVyc2hpcEV2ZW50Lm1lbWJlcnNoaXAgOiBcImxlYXZlXCI7XG4gICAgICAgICAgICBjb25zdCB0aW1lbGluZUV2ZW50cyA9IHRpbWVsaW5lLmdldEV2ZW50cygpO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IHRpbWVsaW5lRXZlbnRzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSB0aW1lbGluZUV2ZW50c1tqXTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuZ2V0SWQoKSA9PT0gZXZlbnRzW2ldLmdldElkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5nZXRTdGF0ZUtleSgpID09PSB1c2VySWRcbiAgICAgICAgICAgICAgICAgICAgJiYgZXZlbnQuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS5tZW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2Q29udGVudCA9IGV2ZW50LmdldFByZXZDb250ZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJNZW1iZXJzaGlwID0gcHJldkNvbnRlbnQubWVtYmVyc2hpcCB8fCBcImxlYXZlXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBub3cgZ28gdGhyb3VnaCB0aGUgcmVzdCBvZiB0aGUgZXZlbnRzIGFuZCBmaW5kIHRoZSBmaXJzdCB1bmRlY3J5cHRhYmxlXG4gICAgICAgIC8vIG9uZSB0aGF0IHdhcyBzZW50IHdoZW4gdGhlIHVzZXIgd2Fzbid0IGluIHRoZSByb29tXG4gICAgICAgIGZvciAoOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBldmVudHNbaV07XG4gICAgICAgICAgICBpZiAoZXZlbnQuZ2V0U3RhdGVLZXkoKSA9PT0gdXNlcklkXG4gICAgICAgICAgICAgICAgJiYgZXZlbnQuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS5tZW1iZXJcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZDb250ZW50ID0gZXZlbnQuZ2V0UHJldkNvbnRlbnQoKTtcbiAgICAgICAgICAgICAgICB1c2VyTWVtYmVyc2hpcCA9IHByZXZDb250ZW50Lm1lbWJlcnNoaXAgfHwgXCJsZWF2ZVwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1c2VyTWVtYmVyc2hpcCA9PT0gXCJsZWF2ZVwiICYmXG4gICAgICAgICAgICAgICAgICAgICAgIChldmVudC5pc0RlY3J5cHRpb25GYWlsdXJlKCkgfHwgZXZlbnQuaXNCZWluZ0RlY3J5cHRlZCgpKSkge1xuICAgICAgICAgICAgICAgIC8vIHJlYWNoZWQgYW4gdW5kZWNyeXB0YWJsZSBtZXNzYWdlIHdoZW4gdGhlIHVzZXIgd2Fzbid0IGluXG4gICAgICAgICAgICAgICAgLy8gdGhlIHJvb20gLS0gZG9uJ3QgdHJ5IHRvIGxvYWQgYW55IG1vcmVcbiAgICAgICAgICAgICAgICAvLyBOb3RlOiBmb3Igbm93LCB3ZSBhc3N1bWUgdGhhdCBldmVudHMgdGhhdCBhcmUgYmVpbmcgZGVjcnlwdGVkIGFyZVxuICAgICAgICAgICAgICAgIC8vIG5vdCBkZWNyeXB0YWJsZVxuICAgICAgICAgICAgICAgIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBfaW5kZXhGb3JFdmVudElkKGV2SWQpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0YXRlLmV2ZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKGV2SWQgPT0gdGhpcy5zdGF0ZS5ldmVudHNbaV0uZ2V0SWQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIF9nZXRMYXN0RGlzcGxheWVkRXZlbnRJbmRleChvcHRzKSB7XG4gICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgICAgICBjb25zdCBpZ25vcmVPd24gPSBvcHRzLmlnbm9yZU93biB8fCBmYWxzZTtcbiAgICAgICAgY29uc3QgYWxsb3dQYXJ0aWFsID0gb3B0cy5hbGxvd1BhcnRpYWwgfHwgZmFsc2U7XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZVBhbmVsID0gdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQ7XG4gICAgICAgIGlmICghbWVzc2FnZVBhbmVsKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBtZXNzYWdlUGFuZWxOb2RlID0gUmVhY3RET00uZmluZERPTU5vZGUobWVzc2FnZVBhbmVsKTtcbiAgICAgICAgaWYgKCFtZXNzYWdlUGFuZWxOb2RlKSByZXR1cm4gbnVsbDsgLy8gc29tZXRpbWVzIHRoaXMgaGFwcGVucyBmb3IgZnJlc2ggcm9vbXMvcG9zdC1zeW5jXG4gICAgICAgIGNvbnN0IHdyYXBwZXJSZWN0ID0gbWVzc2FnZVBhbmVsTm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgbXlVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkO1xuXG4gICAgICAgIGNvbnN0IGlzTm9kZUluVmlldyA9IChub2RlKSA9PiB7XG4gICAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgaWYgKChhbGxvd1BhcnRpYWwgJiYgYm91bmRpbmdSZWN0LnRvcCA8IHdyYXBwZXJSZWN0LmJvdHRvbSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKCFhbGxvd1BhcnRpYWwgJiYgYm91bmRpbmdSZWN0LmJvdHRvbSA8IHdyYXBwZXJSZWN0LmJvdHRvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFdlIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgb2YgdGhlIGFkamFjZW50IGV2ZW50cyBkaWRuJ3QgaGF2ZSBhIHRpbGVcbiAgICAgICAgLy8gYnV0IHNob3VsZCBoYXZlIHRoZSByZWFkIHJlY2VpcHQgbW92ZWQgcGFzdCB0aGVtLCBzb1xuICAgICAgICAvLyB3ZSBjYW4gaW5jbHVkZSB0aG9zZSBvbmNlIHdlIGZpbmQgdGhlIGxhc3QgZGlzcGxheWVkICh2aXNpYmxlKSBldmVudC5cbiAgICAgICAgLy8gVGhlIGNvdW50ZXIgaXMgbm90IHN0YXJ0ZWQgZm9yIGV2ZW50cyB3ZSBkb24ndCB3YW50XG4gICAgICAgIC8vIHRvIHNlbmQgYSByZWFkIHJlY2VpcHQgZm9yIChvdXIgb3duIGV2ZW50cywgbG9jYWwgZWNob3MpLlxuICAgICAgICBsZXQgYWRqYWNlbnRJbnZpc2libGVFdmVudENvdW50ID0gMDtcbiAgICAgICAgLy8gVXNlIGBsaXZlRXZlbnRzYCBoZXJlIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0aGUgcmVhZCBtYXJrZXIgb3IgcmVhZFxuICAgICAgICAvLyByZWNlaXB0IHRvIGFkdmFuY2UgaW50byBwZW5kaW5nIGV2ZW50cy5cbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuc3RhdGUubGl2ZUV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgY29uc3QgZXYgPSB0aGlzLnN0YXRlLmxpdmVFdmVudHNbaV07XG5cbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBtZXNzYWdlUGFuZWwuZ2V0Tm9kZUZvckV2ZW50SWQoZXYuZ2V0SWQoKSk7XG4gICAgICAgICAgICBjb25zdCBpc0luVmlldyA9IGlzTm9kZUluVmlldyhub2RlKTtcblxuICAgICAgICAgICAgLy8gd2hlbiB3ZSd2ZSByZWFjaGVkIHRoZSBmaXJzdCB2aXNpYmxlIGV2ZW50LCBhbmQgdGhlIHByZXZpb3VzXG4gICAgICAgICAgICAvLyBldmVudHMgd2VyZSBhbGwgaW52aXNpYmxlICh3aXRoIHRoZSBmaXJzdCBvbmUgbm90IGJlaW5nIGlnbm9yZWQpLFxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaW52aXNpYmxlIGV2ZW50LlxuICAgICAgICAgICAgaWYgKGlzSW5WaWV3ICYmIGFkamFjZW50SW52aXNpYmxlRXZlbnRDb3VudCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpICsgYWRqYWNlbnRJbnZpc2libGVFdmVudENvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGUgJiYgIWlzSW5WaWV3KSB7XG4gICAgICAgICAgICAgICAgLy8gaGFzIG5vZGUgYnV0IG5vdCBpbiB2aWV3LCBzbyByZXNldCBhZGphY2VudCBpbnZpc2libGUgZXZlbnRzXG4gICAgICAgICAgICAgICAgYWRqYWNlbnRJbnZpc2libGVFdmVudENvdW50ID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc2hvdWxkSWdub3JlID0gISFldi5zdGF0dXMgfHwgLy8gbG9jYWwgZWNob1xuICAgICAgICAgICAgICAgIChpZ25vcmVPd24gJiYgZXYuc2VuZGVyICYmIGV2LnNlbmRlci51c2VySWQgPT0gbXlVc2VySWQpOyAgIC8vIG93biBtZXNzYWdlXG4gICAgICAgICAgICBjb25zdCBpc1dpdGhvdXRUaWxlID0gIWhhdmVUaWxlRm9yRXZlbnQoZXYpIHx8IHNob3VsZEhpZGVFdmVudChldik7XG5cbiAgICAgICAgICAgIGlmIChpc1dpdGhvdXRUaWxlIHx8ICFub2RlKSB7XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3Qgc3RhcnQgY291bnRpbmcgaWYgdGhlIGV2ZW50IHNob3VsZCBiZSBpZ25vcmVkLFxuICAgICAgICAgICAgICAgIC8vIGJ1dCBjb250aW51ZSBjb3VudGluZyBpZiB3ZSB3ZXJlIGFscmVhZHkgc28gdGhlIG9mZnNldFxuICAgICAgICAgICAgICAgIC8vIHRvIHRoZSBwcmV2aW91cyBpbnZpc2JsZSBldmVudCB0aGF0IGRpZG4ndCBuZWVkIHRvIGJlIGlnbm9yZWRcbiAgICAgICAgICAgICAgICAvLyBkb2Vzbid0IGdldCBtZXNzZWQgdXBcbiAgICAgICAgICAgICAgICBpZiAoIXNob3VsZElnbm9yZSB8fCAoc2hvdWxkSWdub3JlICYmIGFkamFjZW50SW52aXNpYmxlRXZlbnRDb3VudCAhPT0gMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgKythZGphY2VudEludmlzaWJsZUV2ZW50Q291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2hvdWxkSWdub3JlKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0luVmlldykge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBpZCBvZiB0aGUgZXZlbnQgY29ycmVzcG9uZGluZyB0byBvdXIgdXNlcidzIGxhdGVzdCByZWFkLXJlY2VpcHQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlnbm9yZVN5bnRoZXNpemVkIElmIHRydWUsIHJldHVybiBvbmx5IHJlY2VpcHRzIHRoYXRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhdmUgYmVlbiBzZW50IGJ5IHRoZSBzZXJ2ZXIsIG5vdFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wbGljaXQgb25lcyBnZW5lcmF0ZWQgYnkgdGhlIEpTXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTREsuXG4gICAgICogQHJldHVybiB7U3RyaW5nfSB0aGUgZXZlbnQgSURcbiAgICAgKi9cbiAgICBfZ2V0Q3VycmVudFJlYWRSZWNlaXB0KGlnbm9yZVN5bnRoZXNpemVkKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgLy8gdGhlIGNsaWVudCBjYW4gYmUgbnVsbCBvbiBsb2dvdXRcbiAgICAgICAgaWYgKGNsaWVudCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gY2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZDtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5nZXRFdmVudFJlYWRVcFRvKG15VXNlcklkLCBpZ25vcmVTeW50aGVzaXplZCk7XG4gICAgfVxuXG4gICAgX3NldFJlYWRNYXJrZXIoZXZlbnRJZCwgZXZlbnRUcywgaW5oaWJpdFNldFN0YXRlKSB7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWQ7XG5cbiAgICAgICAgLy8gZG9uJ3QgdXBkYXRlIHRoZSBzdGF0ZSAoYW5kIGNhdXNlIGEgcmUtcmVuZGVyKSBpZiB0aGVyZSBpc1xuICAgICAgICAvLyBubyBjaGFuZ2UgdG8gdGhlIFJNLlxuICAgICAgICBpZiAoZXZlbnRJZCA9PT0gdGhpcy5zdGF0ZS5yZWFkTWFya2VyRXZlbnRJZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW4gb3JkZXIgdG8gbGF0ZXIgZmlndXJlIG91dCBpZiB0aGUgcmVhZCBtYXJrZXIgaXNcbiAgICAgICAgLy8gYWJvdmUgb3IgYmVsb3cgdGhlIHZpc2libGUgdGltZWxpbmUsIHdlIHN0YXNoIHRoZSB0aW1lc3RhbXAuXG4gICAgICAgIFRpbWVsaW5lUGFuZWwucm9vbVJlYWRNYXJrZXJUc01hcFtyb29tSWRdID0gZXZlbnRUcztcblxuICAgICAgICBpZiAoaW5oaWJpdFNldFN0YXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEbyB0aGUgbG9jYWwgZWNobyBvZiB0aGUgUk1cbiAgICAgICAgLy8gcnVuIHRoZSByZW5kZXIgY3ljbGUgYmVmb3JlIGNhbGxpbmcgdGhlIGNhbGxiYWNrLCBzbyB0aGF0XG4gICAgICAgIC8vIGdldFJlYWRNYXJrZXJQb3NpdGlvbigpIHJldHVybnMgdGhlIHJpZ2h0IHRoaW5nLlxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJlYWRNYXJrZXJFdmVudElkOiBldmVudElkLFxuICAgICAgICB9LCB0aGlzLnByb3BzLm9uUmVhZE1hcmtlclVwZGF0ZWQpO1xuICAgIH1cblxuICAgIF9zaG91bGRQYWdpbmF0ZSgpIHtcbiAgICAgICAgLy8gZG9uJ3QgdHJ5IHRvIHBhZ2luYXRlIHdoaWxlIGV2ZW50cyBpbiB0aGUgdGltZWxpbmUgYXJlXG4gICAgICAgIC8vIHN0aWxsIGJlaW5nIGRlY3J5cHRlZC4gV2UgZG9uJ3QgcmVuZGVyIGV2ZW50cyB3aGlsZSB0aGV5J3JlXG4gICAgICAgIC8vIGJlaW5nIGRlY3J5cHRlZCwgc28gdGhleSBkb24ndCB0YWtlIHVwIHNwYWNlIGluIHRoZSB0aW1lbGluZS5cbiAgICAgICAgLy8gVGhpcyBtZWFucyB3ZSBjYW4gcHVsbCBxdWl0ZSBhIGxvdCBvZiBldmVudHMgaW50byB0aGUgdGltZWxpbmVcbiAgICAgICAgLy8gYW5kIGVuZCB1cCB0cnlpbmcgdG8gcmVuZGVyIGEgbG90IG9mIGV2ZW50cy5cbiAgICAgICAgcmV0dXJuICF0aGlzLnN0YXRlLmV2ZW50cy5zb21lKChlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZS5pc0JlaW5nRGVjcnlwdGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50ID0gKC4uLmFyZ3MpID0+IHRoaXMucHJvcHMudGltZWxpbmVTZXQuZ2V0UmVsYXRpb25zRm9yRXZlbnQoLi4uYXJncyk7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IE1lc3NhZ2VQYW5lbCA9IHNkay5nZXRDb21wb25lbnQoXCJzdHJ1Y3R1cmVzLk1lc3NhZ2VQYW5lbFwiKTtcbiAgICAgICAgY29uc3QgTG9hZGVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG5cbiAgICAgICAgLy8ganVzdCBzaG93IGEgc3Bpbm5lciB3aGlsZSB0aGUgdGltZWxpbmUgbG9hZHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIHB1dCBpdCBpbiBhIGRpdiBvZiB0aGUgcmlnaHQgY2xhc3MgKG14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbCkgc29cbiAgICAgICAgLy8gdGhhdCB0aGUgb3JkZXIgaW4gdGhlIHJvb212aWV3IGZsZXhib3ggaXMgY29ycmVjdCwgYW5kXG4gICAgICAgIC8vIG14X1Jvb21WaWV3X21lc3NhZ2VMaXN0V3JhcHBlciB0byBwb3NpdGlvbiB0aGUgaW5uZXIgZGl2IGluIHRoZVxuICAgICAgICAvLyByaWdodCBwbGFjZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoZSBjbGljay1vbi1zZWFyY2gtcmVzdWx0IGZ1bmN0aW9uYWxpdHkgcmVsaWVzIG9uIHRoZVxuICAgICAgICAvLyBmYWN0IHRoYXQgdGhlIG1lc3NhZ2VQYW5lbCBpcyBoaWRkZW4gd2hpbGUgdGhlIHRpbWVsaW5lIHJlbG9hZHMsXG4gICAgICAgIC8vIGJ1dCB0aGF0IHRoZSBSb29tSGVhZGVyIChjb21wbGV0ZSB3aXRoIHNlYXJjaCB0ZXJtKSBjb250aW51ZXMgdG9cbiAgICAgICAgLy8gZXhpc3QuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRpbWVsaW5lTG9hZGluZykge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbFNwaW5uZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPExvYWRlciAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmV2ZW50cy5sZW5ndGggPT0gMCAmJiAhdGhpcy5zdGF0ZS5jYW5CYWNrUGFnaW5hdGUgJiYgdGhpcy5wcm9wcy5lbXB0eSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWUgKyBcIiBteF9Sb29tVmlld19tZXNzYWdlTGlzdFdyYXBwZXJcIn0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfZW1wdHlcIj57dGhpcy5wcm9wcy5lbXB0eX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnaXZlIHRoZSBtZXNzYWdlcGFuZWwgYSBzdGlja3lib3R0b20gaWYgd2UncmUgYXQgdGhlIGVuZCBvZiB0aGVcbiAgICAgICAgLy8gbGl2ZSB0aW1lbGluZSwgc28gdGhhdCB0aGUgYXJyaXZhbCBvZiBuZXcgZXZlbnRzIHRyaWdnZXJzIGFcbiAgICAgICAgLy8gc2Nyb2xsLlxuICAgICAgICAvL1xuICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCBzdGlja3lCb3R0b20gaXMgKmZhbHNlKiBpZiB3ZSBjYW4gcGFnaW5hdGVcbiAgICAgICAgLy8gZm9yd2FyZHMsIG90aGVyd2lzZSBpZiBzb21lYm9keSBoaXRzIHRoZSBib3R0b20gb2YgdGhlIGxvYWRlZFxuICAgICAgICAvLyBldmVudHMgd2hlbiB2aWV3aW5nIGhpc3RvcmljYWwgbWVzc2FnZXMsIHdlIGdldCBzdHVjayBpbiBhIGxvb3BcbiAgICAgICAgLy8gb2YgcGFnaW5hdGluZyBvdXIgd2F5IHRocm91Z2ggdGhlIGVudGlyZSBoaXN0b3J5IG9mIHRoZSByb29tLlxuICAgICAgICBjb25zdCBzdGlja3lCb3R0b20gPSAhdGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUyk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHN0YXRlIGlzIFBSRVBBUkVEIG9yIENBVENIVVAsIHdlJ3JlIHN0aWxsIHdhaXRpbmcgZm9yIHRoZSBqcy1zZGsgdG8gc3luYyB3aXRoXG4gICAgICAgIC8vIHRoZSBIUyBhbmQgZmV0Y2ggdGhlIGxhdGVzdCBldmVudHMsIHNvIHdlIGFyZSBlZmZlY3RpdmVseSBmb3J3YXJkIHBhZ2luYXRpbmcuXG4gICAgICAgIGNvbnN0IGZvcndhcmRQYWdpbmF0aW5nID0gKFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5mb3J3YXJkUGFnaW5hdGluZyB8fFxuICAgICAgICAgICAgWydQUkVQQVJFRCcsICdDQVRDSFVQJ10uaW5jbHVkZXModGhpcy5zdGF0ZS5jbGllbnRTeW5jU3RhdGUpXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuc3RhdGUuZmlyc3RWaXNpYmxlRXZlbnRJbmRleFxuICAgICAgICAgICAgPyB0aGlzLnN0YXRlLmV2ZW50cy5zbGljZSh0aGlzLnN0YXRlLmZpcnN0VmlzaWJsZUV2ZW50SW5kZXgpXG4gICAgICAgICAgICA6IHRoaXMuc3RhdGUuZXZlbnRzO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE1lc3NhZ2VQYW5lbFxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5fbWVzc2FnZVBhbmVsfVxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbX1cbiAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgaGlkZGVuPXt0aGlzLnByb3BzLmhpZGRlbn1cbiAgICAgICAgICAgICAgICBiYWNrUGFnaW5hdGluZz17dGhpcy5zdGF0ZS5iYWNrUGFnaW5hdGluZ31cbiAgICAgICAgICAgICAgICBmb3J3YXJkUGFnaW5hdGluZz17Zm9yd2FyZFBhZ2luYXRpbmd9XG4gICAgICAgICAgICAgICAgZXZlbnRzPXtldmVudHN9XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWRFdmVudElkPXt0aGlzLnByb3BzLmhpZ2hsaWdodGVkRXZlbnRJZH1cbiAgICAgICAgICAgICAgICByZWFkTWFya2VyRXZlbnRJZD17dGhpcy5zdGF0ZS5yZWFkTWFya2VyRXZlbnRJZH1cbiAgICAgICAgICAgICAgICByZWFkTWFya2VyVmlzaWJsZT17dGhpcy5zdGF0ZS5yZWFkTWFya2VyVmlzaWJsZX1cbiAgICAgICAgICAgICAgICBzdXBwcmVzc0ZpcnN0RGF0ZVNlcGFyYXRvcj17dGhpcy5zdGF0ZS5jYW5CYWNrUGFnaW5hdGV9XG4gICAgICAgICAgICAgICAgc2hvd1VybFByZXZpZXc9e3RoaXMucHJvcHMuc2hvd1VybFByZXZpZXd9XG4gICAgICAgICAgICAgICAgc2hvd1JlYWRSZWNlaXB0cz17dGhpcy5wcm9wcy5zaG93UmVhZFJlY2VpcHRzfVxuICAgICAgICAgICAgICAgIG91clVzZXJJZD17TWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZH1cbiAgICAgICAgICAgICAgICBzdGlja3lCb3R0b209e3N0aWNreUJvdHRvbX1cbiAgICAgICAgICAgICAgICBvblNjcm9sbD17dGhpcy5vbk1lc3NhZ2VMaXN0U2Nyb2xsfVxuICAgICAgICAgICAgICAgIG9uRmlsbFJlcXVlc3Q9e3RoaXMub25NZXNzYWdlTGlzdEZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgIG9uVW5maWxsUmVxdWVzdD17dGhpcy5vbk1lc3NhZ2VMaXN0VW5maWxsUmVxdWVzdH1cbiAgICAgICAgICAgICAgICBpc1R3ZWx2ZUhvdXI9e3RoaXMuc3RhdGUuaXNUd2VsdmVIb3VyfVxuICAgICAgICAgICAgICAgIGFsd2F5c1Nob3dUaW1lc3RhbXBzPXt0aGlzLnN0YXRlLmFsd2F5c1Nob3dUaW1lc3RhbXBzfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9XG4gICAgICAgICAgICAgICAgdGlsZVNoYXBlPXt0aGlzLnByb3BzLnRpbGVTaGFwZX1cbiAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudD17dGhpcy5nZXRSZWxhdGlvbnNGb3JFdmVudH1cbiAgICAgICAgICAgICAgICBlZGl0U3RhdGU9e3RoaXMuc3RhdGUuZWRpdFN0YXRlfVxuICAgICAgICAgICAgICAgIHNob3dSZWFjdGlvbnM9e3RoaXMucHJvcHMuc2hvd1JlYWN0aW9uc31cbiAgICAgICAgICAgICAgICBsYXlvdXQ9e3RoaXMucHJvcHMubGF5b3V0fVxuICAgICAgICAgICAgICAgIGVuYWJsZUZsYWlyPXtTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5GbGFpcil9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGltZWxpbmVQYW5lbDtcbiJdfQ==
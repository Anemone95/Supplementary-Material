"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var Matrix = _interopRequireWildcard(require("matrix-js-sdk"));

var _languageHandler = require("../../languageHandler");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var ObjectUtils = _interopRequireWildcard(require("../../ObjectUtils"));

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

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2019 New Vector Ltd
Copyright 2019-2020 The Matrix.org Foundation C.I.C.

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


class TimelinePanel extends _react.default.Component {
  // a map from room id to read marker event timestamp
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onMessageListUnfillRequest", (backwards, scrollToken) => {
      // If backwards, unpaginate from the back (i.e. the start of the timeline)
      const dir = backwards ? Matrix.EventTimeline.BACKWARDS : Matrix.EventTimeline.FORWARDS;
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
      const dir = backwards ? Matrix.EventTimeline.BACKWARDS : Matrix.EventTimeline.FORWARDS;
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

        const otherDirection = backwards ? Matrix.EventTimeline.FORWARDS : Matrix.EventTimeline.BACKWARDS;
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


      this._timelineWindow.paginate(Matrix.EventTimeline.FORWARDS, 1, false).then(() => {
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


      if (currentRREventId && currentRREventIndex === null && this._timelineWindow.canPaginate(Matrix.EventTimeline.FORWARDS)) {
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
      if (this._timelineWindow.canPaginate(Matrix.EventTimeline.FORWARDS)) {
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
      return this._messagePanel.current && this._messagePanel.current.isAtBottom() && this._timelineWindow && !this._timelineWindow.canPaginate(Matrix.EventTimeline.FORWARDS);
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
    if (!ObjectUtils.shallowEqual(this.props, nextProps)) {
      if (DEBUG) {
        console.group("Timeline.shouldComponentUpdate: props change");
        console.log("props before:", this.props);
        console.log("props after:", nextProps);
        console.groupEnd();
      }

      return true;
    }

    if (!ObjectUtils.shallowEqual(this.state, nextState)) {
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
    this._timelineWindow = new Matrix.TimelineWindow(_MatrixClientPeg.MatrixClientPeg.get(), this.props.timelineSet, {
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
        canBackPaginate: this._timelineWindow.canPaginate(Matrix.EventTimeline.BACKWARDS),
        canForwardPaginate: this._timelineWindow.canPaginate(Matrix.EventTimeline.FORWARDS),
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

        this.sendReadReceipt();
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

    if (!this._timelineWindow.canPaginate(Matrix.EventTimeline.FORWARDS)) {
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

      const userMembershipEvent = timeline.getState(Matrix.EventTimeline.FORWARDS).getMember(userId);
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


    const stickyBottom = !this._timelineWindow.canPaginate(Matrix.EventTimeline.FORWARDS); // If the state is PREPARED or CATCHUP, we're still waiting for the js-sdk to sync with
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
      useIRCLayout: this.props.useIRCLayout,
      enableFlair: _SettingsStore.default.getValue(_UIFeature.UIFeature.Flair)
    });
  }

}

(0, _defineProperty2.default)(TimelinePanel, "propTypes", {
  // The js-sdk EventTimelineSet object for the timeline sequence we are
  // representing.  This may or may not have a room, depending on what it's
  // a timeline representing.  If it has a room, we maintain RRs etc for
  // that room.
  timelineSet: _propTypes.default.object.isRequired,
  showReadReceipts: _propTypes.default.bool,
  // Enable managing RRs and RMs. These require the timelineSet to have a room.
  manageReadReceipts: _propTypes.default.bool,
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
  // whether to use the irc layout
  useIRCLayout: _propTypes.default.bool
});
(0, _defineProperty2.default)(TimelinePanel, "roomReadMarkerTsMap", {});
(0, _defineProperty2.default)(TimelinePanel, "defaultProps", {
  // By default, disable the timelineCap in favour of unpaginating based on
  // event tile heights. (See _unpaginateEvents)
  timelineCap: Number.MAX_VALUE,
  className: 'mx_RoomView_messagePanel'
});
var _default = TimelinePanel;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVGltZWxpbmVQYW5lbC5qcyJdLCJuYW1lcyI6WyJQQUdJTkFURV9TSVpFIiwiSU5JVElBTF9TSVpFIiwiUkVBRF9SRUNFSVBUX0lOVEVSVkFMX01TIiwiREVCVUciLCJkZWJ1Z2xvZyIsImNvbnNvbGUiLCJsb2ciLCJiaW5kIiwiVGltZWxpbmVQYW5lbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImJhY2t3YXJkcyIsInNjcm9sbFRva2VuIiwiZGlyIiwiRXZlbnRUaW1lbGluZSIsIkJBQ0tXQVJEUyIsIkZPUldBUkRTIiwiZXZlbnRJZCIsIm1hcmtlciIsInN0YXRlIiwiZXZlbnRzIiwiZmluZEluZGV4IiwiZXYiLCJnZXRJZCIsImNvdW50IiwibGVuZ3RoIiwiX3RpbWVsaW5lV2luZG93IiwidW5wYWdpbmF0ZSIsImNhblBhZ2luYXRlS2V5IiwibGl2ZUV2ZW50cyIsImZpcnN0VmlzaWJsZUV2ZW50SW5kZXgiLCJfZ2V0RXZlbnRzIiwic2V0U3RhdGUiLCJ0aW1lbGluZVdpbmRvdyIsImRpcmVjdGlvbiIsInNpemUiLCJvblBhZ2luYXRpb25SZXF1ZXN0IiwicGFnaW5hdGUiLCJfc2hvdWxkUGFnaW5hdGUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInBhZ2luYXRpbmdLZXkiLCJjYW5QYWdpbmF0ZSIsInRoZW4iLCJyIiwidW5tb3VudGVkIiwibmV3U3RhdGUiLCJvdGhlckRpcmVjdGlvbiIsImNhblBhZ2luYXRlT3RoZXJXYXlLZXkiLCJlIiwib25TY3JvbGwiLCJtYW5hZ2VSZWFkTWFya2VycyIsInJtUG9zaXRpb24iLCJnZXRSZWFkTWFya2VyUG9zaXRpb24iLCJyZWFkTWFya2VyVmlzaWJsZSIsInRpbWVvdXQiLCJfcmVhZE1hcmtlclRpbWVvdXQiLCJfcmVhZE1hcmtlckFjdGl2aXR5VGltZXIiLCJjaGFuZ2VUaW1lb3V0IiwicGF5bG9hZCIsImFjdGlvbiIsImZvcmNlVXBkYXRlIiwiZWRpdFN0YXRlIiwiZXZlbnQiLCJFZGl0b3JTdGF0ZVRyYW5zZmVyIiwiX21lc3NhZ2VQYW5lbCIsImN1cnJlbnQiLCJzY3JvbGxUb0V2ZW50SWZOZWVkZWQiLCJyb29tIiwidG9TdGFydE9mVGltZWxpbmUiLCJyZW1vdmVkIiwiZGF0YSIsInRpbWVsaW5lIiwiZ2V0VGltZWxpbmVTZXQiLCJ0aW1lbGluZVNldCIsImxpdmVFdmVudCIsImdldFNjcm9sbFN0YXRlIiwic3R1Y2tBdEJvdHRvbSIsImNhbkZvcndhcmRQYWdpbmF0ZSIsImxhc3RMaXZlRXZlbnQiLCJ1cGRhdGVkU3RhdGUiLCJjYWxsUk1VcGRhdGVkIiwibXlVc2VySWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjcmVkZW50aWFscyIsInVzZXJJZCIsInNlbmRlciIsIlVzZXJBY3Rpdml0eSIsInNoYXJlZEluc3RhbmNlIiwidXNlckFjdGl2ZVJlY2VudGx5IiwiX3NldFJlYWRNYXJrZXIiLCJnZXRUcyIsInJlYWRNYXJrZXJFdmVudElkIiwidXBkYXRlVGltZWxpbmVNaW5IZWlnaHQiLCJvblJlYWRNYXJrZXJVcGRhdGVkIiwiaXNBdEJvdHRvbSIsIl9sb2FkVGltZWxpbmUiLCJyZXBsYWNlZEV2ZW50Iiwib2xkRXZlbnRJZCIsIl9yZWxvYWRFdmVudHMiLCJnZXRUeXBlIiwiZ2V0Q29udGVudCIsImV2ZW50X2lkIiwiZ2V0Um9vbUlkIiwicm9vbUlkIiwicHJldlN0YXRlIiwiY2xpZW50U3luY1N0YXRlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwibWFuYWdlUmVhZFJlY2VpcHRzIiwiY2xpIiwiaXNHdWVzdCIsInNob3VsZFNlbmRSUiIsImN1cnJlbnRSUkV2ZW50SWQiLCJfZ2V0Q3VycmVudFJlYWRSZWNlaXB0IiwiY3VycmVudFJSRXZlbnRJbmRleCIsIl9pbmRleEZvckV2ZW50SWQiLCJsYXN0UmVhZEV2ZW50SW5kZXgiLCJfZ2V0TGFzdERpc3BsYXllZEV2ZW50SW5kZXgiLCJpZ25vcmVPd24iLCJsYXN0UmVhZEV2ZW50IiwibGFzdFJSU2VudEV2ZW50SWQiLCJzaG91bGRTZW5kUk0iLCJsYXN0Uk1TZW50RXZlbnRJZCIsInNldFJvb21SZWFkTWFya2VycyIsImNhdGNoIiwiZXJyY29kZSIsInNlbmRSZWFkUmVjZWlwdCIsImVycm9yIiwidW5kZWZpbmVkIiwiaXNBdEVuZE9mTGl2ZVRpbWVsaW5lIiwic2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQiLCJkaXMiLCJkaXNwYXRjaCIsImxhc3REaXNwbGF5ZWRJbmRleCIsImFsbG93UGFydGlhbCIsImxhc3REaXNwbGF5ZWRFdmVudCIsInNjcm9sbFRvQm90dG9tIiwicmV0Iiwic2Nyb2xsVG9FdmVudCIsInJtSWQiLCJ0bCIsImdldFRpbWVsaW5lRm9yRXZlbnQiLCJybVRzIiwiZ2V0RXZlbnRzIiwiZmluZCIsInJvb21SZWFkTWFya2VyVHNNYXAiLCJwb3MiLCJjdHJsS2V5Iiwic2hpZnRLZXkiLCJhbHRLZXkiLCJtZXRhS2V5Iiwia2V5IiwiS2V5IiwiRU5EIiwianVtcFRvTGl2ZVRpbWVsaW5lIiwiaGFuZGxlU2Nyb2xsS2V5IiwiYXJncyIsImdldFJlbGF0aW9uc0ZvckV2ZW50IiwiaW5pdGlhbFJlYWRNYXJrZXIiLCJyZWFkbWFya2VyIiwiZ2V0QWNjb3VudERhdGEiLCJ0aW1lbGluZUxvYWRpbmciLCJjYW5CYWNrUGFnaW5hdGUiLCJiYWNrUGFnaW5hdGluZyIsImZvcndhcmRQYWdpbmF0aW5nIiwiZ2V0U3luY1N0YXRlIiwiaXNUd2VsdmVIb3VyIiwiYWx3YXlzU2hvd1RpbWVzdGFtcHMiLCJyZWFkTWFya2VySW5WaWV3VGhyZXNob2xkTXMiLCJyZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXMiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsIm9uIiwib25Sb29tVGltZWxpbmUiLCJvblJvb21UaW1lbGluZVJlc2V0Iiwib25Sb29tUmVkYWN0aW9uIiwib25Sb29tUmVjZWlwdCIsIm9uTG9jYWxFY2hvVXBkYXRlZCIsIm9uQWNjb3VudERhdGEiLCJvbkV2ZW50RGVjcnlwdGVkIiwib25FdmVudFJlcGxhY2VkIiwib25TeW5jIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsInVwZGF0ZVJlYWRSZWNlaXB0T25Vc2VyQWN0aXZpdHkiLCJ1cGRhdGVSZWFkTWFya2VyT25Vc2VyQWN0aXZpdHkiLCJfaW5pdFRpbWVsaW5lIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsIndhcm4iLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJPYmplY3RVdGlscyIsInNoYWxsb3dFcXVhbCIsImdyb3VwIiwiZ3JvdXBFbmQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIl9yZWFkUmVjZWlwdEFjdGl2aXR5VGltZXIiLCJhYm9ydCIsInVucmVnaXN0ZXIiLCJjbGllbnQiLCJyZW1vdmVMaXN0ZW5lciIsInJlYWRNYXJrZXJQb3NpdGlvbiIsImluaXRpYWxUaW1lb3V0IiwiVGltZXIiLCJ0aW1lV2hpbGVBY3RpdmVSZWNlbnRseSIsImZpbmlzaGVkIiwidXBkYXRlUmVhZE1hcmtlciIsInRpbWVXaGlsZUFjdGl2ZU5vdyIsIl9hZHZhbmNlUmVhZE1hcmtlclBhc3RNeUV2ZW50cyIsImkiLCJpbml0aWFsRXZlbnQiLCJwaXhlbE9mZnNldCIsImV2ZW50UGl4ZWxPZmZzZXQiLCJvZmZzZXRCYXNlIiwiTWF0cml4IiwiVGltZWxpbmVXaW5kb3ciLCJ3aW5kb3dMaW1pdCIsInRpbWVsaW5lQ2FwIiwib25Mb2FkZWQiLCJvblRpbWVsaW5lUmVzZXQiLCJvbkVycm9yIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJvbkZpbmlzaGVkIiwicm9vbV9pZCIsIm1lc3NhZ2UiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibG9hZCIsInByb20iLCJfY2hlY2tGb3JQcmVKb2luVUlTSSIsInB1c2giLCJnZXRQZW5kaW5nRXZlbnRzIiwiaXNSb29tRW5jcnlwdGVkIiwidXNlck1lbWJlcnNoaXAiLCJ1c2VyTWVtYmVyc2hpcEV2ZW50IiwiZ2V0U3RhdGUiLCJnZXRNZW1iZXIiLCJtZW1iZXJzaGlwIiwidGltZWxpbmVFdmVudHMiLCJqIiwiZ2V0U3RhdGVLZXkiLCJwcmV2Q29udGVudCIsImdldFByZXZDb250ZW50IiwiaXNEZWNyeXB0aW9uRmFpbHVyZSIsImlzQmVpbmdEZWNyeXB0ZWQiLCJldklkIiwib3B0cyIsIm1lc3NhZ2VQYW5lbCIsIm1lc3NhZ2VQYW5lbE5vZGUiLCJSZWFjdERPTSIsImZpbmRET01Ob2RlIiwid3JhcHBlclJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJpc05vZGVJblZpZXciLCJub2RlIiwiYm91bmRpbmdSZWN0IiwidG9wIiwiYm90dG9tIiwiYWRqYWNlbnRJbnZpc2libGVFdmVudENvdW50IiwiZ2V0Tm9kZUZvckV2ZW50SWQiLCJpc0luVmlldyIsInNob3VsZElnbm9yZSIsInN0YXR1cyIsImlzV2l0aG91dFRpbGUiLCJpZ25vcmVTeW50aGVzaXplZCIsImdldEV2ZW50UmVhZFVwVG8iLCJldmVudFRzIiwiaW5oaWJpdFNldFN0YXRlIiwic29tZSIsInJlbmRlciIsIk1lc3NhZ2VQYW5lbCIsIkxvYWRlciIsImVtcHR5IiwiY2xhc3NOYW1lIiwic3RpY2t5Qm90dG9tIiwiaW5jbHVkZXMiLCJzbGljZSIsInBlcm1hbGlua0NyZWF0b3IiLCJoaWRkZW4iLCJoaWdobGlnaHRlZEV2ZW50SWQiLCJzaG93VXJsUHJldmlldyIsInNob3dSZWFkUmVjZWlwdHMiLCJvbk1lc3NhZ2VMaXN0U2Nyb2xsIiwib25NZXNzYWdlTGlzdEZpbGxSZXF1ZXN0Iiwib25NZXNzYWdlTGlzdFVuZmlsbFJlcXVlc3QiLCJ0aWxlU2hhcGUiLCJyZXNpemVOb3RpZmllciIsInNob3dSZWFjdGlvbnMiLCJ1c2VJUkNMYXlvdXQiLCJVSUZlYXR1cmUiLCJGbGFpciIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJib29sIiwic3RyaW5nIiwibnVtYmVyIiwiZnVuYyIsIk51bWJlciIsIk1BWF9WQUxVRSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBc0JBLE1BQU1BLGFBQWEsR0FBRyxFQUF0QjtBQUNBLE1BQU1DLFlBQVksR0FBRyxFQUFyQjtBQUNBLE1BQU1DLHdCQUF3QixHQUFHLEdBQWpDO0FBRUEsTUFBTUMsS0FBSyxHQUFHLEtBQWQ7O0FBRUEsSUFBSUMsUUFBUSxHQUFHLFlBQVcsQ0FBRSxDQUE1Qjs7QUFDQSxJQUFJRCxLQUFKLEVBQVc7QUFDUDtBQUNBQyxFQUFBQSxRQUFRLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxJQUFaLENBQWlCRixPQUFqQixDQUFYO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxNQUFNRyxhQUFOLFNBQTRCQyxlQUFNQyxTQUFsQyxDQUE0QztBQTZEeEM7QUFVQUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsc0VBOExVLENBQUNDLFNBQUQsRUFBWUMsV0FBWixLQUE0QjtBQUNyRDtBQUNBLFlBQU1DLEdBQUcsR0FBR0YsU0FBUyxHQUFHRyxxQkFBY0MsU0FBakIsR0FBNkJELHFCQUFjRSxRQUFoRTtBQUNBZCxNQUFBQSxRQUFRLENBQUMsaURBQUQsRUFBb0RXLEdBQXBELENBQVIsQ0FIcUQsQ0FLckQ7QUFDQTs7QUFDQSxZQUFNSSxPQUFPLEdBQUdMLFdBQWhCO0FBRUEsWUFBTU0sTUFBTSxHQUFHLEtBQUtDLEtBQUwsQ0FBV0MsTUFBWCxDQUFrQkMsU0FBbEIsQ0FDVkMsRUFBRCxJQUFRO0FBQ0osZUFBT0EsRUFBRSxDQUFDQyxLQUFILE9BQWVOLE9BQXRCO0FBQ0gsT0FIVSxDQUFmO0FBTUEsWUFBTU8sS0FBSyxHQUFHYixTQUFTLEdBQUdPLE1BQU0sR0FBRyxDQUFaLEdBQWdCLEtBQUtDLEtBQUwsQ0FBV0MsTUFBWCxDQUFrQkssTUFBbEIsR0FBMkJQLE1BQWxFOztBQUVBLFVBQUlNLEtBQUssR0FBRyxDQUFaLEVBQWU7QUFDWHRCLFFBQUFBLFFBQVEsQ0FBQyw2QkFBRCxFQUFnQ3NCLEtBQWhDLEVBQXVDLGNBQXZDLEVBQXVEWCxHQUF2RCxDQUFSOztBQUNBLGFBQUthLGVBQUwsQ0FBcUJDLFVBQXJCLENBQWdDSCxLQUFoQyxFQUF1Q2IsU0FBdkMsRUFGVyxDQUlYOzs7QUFDQSxjQUFNaUIsY0FBYyxHQUFJakIsU0FBRCxHQUFjLGlCQUFkLEdBQWtDLG9CQUF6RDs7QUFDQSxjQUFNO0FBQUVTLFVBQUFBLE1BQUY7QUFBVVMsVUFBQUEsVUFBVjtBQUFzQkMsVUFBQUE7QUFBdEIsWUFBaUQsS0FBS0MsVUFBTCxFQUF2RDs7QUFDQSxhQUFLQyxRQUFMLENBQWM7QUFDVixXQUFDSixjQUFELEdBQWtCLElBRFI7QUFFVlIsVUFBQUEsTUFGVTtBQUdWUyxVQUFBQSxVQUhVO0FBSVZDLFVBQUFBO0FBSlUsU0FBZDtBQU1IO0FBQ0osS0E3TmtCO0FBQUEsK0RBK05HLENBQUNHLGNBQUQsRUFBaUJDLFNBQWpCLEVBQTRCQyxJQUE1QixLQUFxQztBQUN2RCxVQUFJLEtBQUt6QixLQUFMLENBQVcwQixtQkFBZixFQUFvQztBQUNoQyxlQUFPLEtBQUsxQixLQUFMLENBQVcwQixtQkFBWCxDQUErQkgsY0FBL0IsRUFBK0NDLFNBQS9DLEVBQTBEQyxJQUExRCxDQUFQO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsZUFBT0YsY0FBYyxDQUFDSSxRQUFmLENBQXdCSCxTQUF4QixFQUFtQ0MsSUFBbkMsQ0FBUDtBQUNIO0FBQ0osS0FyT2tCO0FBQUEsb0VBd09ReEIsU0FBUyxJQUFJO0FBQ3BDLFVBQUksQ0FBQyxLQUFLMkIsZUFBTCxFQUFMLEVBQTZCLE9BQU9DLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixLQUFoQixDQUFQO0FBRTdCLFlBQU0zQixHQUFHLEdBQUdGLFNBQVMsR0FBR0cscUJBQWNDLFNBQWpCLEdBQTZCRCxxQkFBY0UsUUFBaEU7QUFDQSxZQUFNWSxjQUFjLEdBQUdqQixTQUFTLEdBQUcsaUJBQUgsR0FBdUIsb0JBQXZEO0FBQ0EsWUFBTThCLGFBQWEsR0FBRzlCLFNBQVMsR0FBRyxnQkFBSCxHQUFzQixtQkFBckQ7O0FBRUEsVUFBSSxDQUFDLEtBQUtRLEtBQUwsQ0FBV1MsY0FBWCxDQUFMLEVBQWlDO0FBQzdCMUIsUUFBQUEsUUFBUSxDQUFDLDhCQUFELEVBQWlDVyxHQUFqQyxFQUFzQywwQkFBdEMsQ0FBUjtBQUNBLGVBQU8wQixPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsS0FBaEIsQ0FBUDtBQUNIOztBQUVELFVBQUksQ0FBQyxLQUFLZCxlQUFMLENBQXFCZ0IsV0FBckIsQ0FBaUM3QixHQUFqQyxDQUFMLEVBQTRDO0FBQ3hDWCxRQUFBQSxRQUFRLENBQUMsc0JBQUQsRUFBeUJXLEdBQXpCLEVBQThCLHNCQUE5QixDQUFSO0FBQ0EsYUFBS21CLFFBQUwsQ0FBYztBQUFDLFdBQUNKLGNBQUQsR0FBa0I7QUFBbkIsU0FBZDtBQUNBLGVBQU9XLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixLQUFoQixDQUFQO0FBQ0g7O0FBRUQsVUFBSTdCLFNBQVMsSUFBSSxLQUFLUSxLQUFMLENBQVdXLHNCQUFYLEtBQXNDLENBQXZELEVBQTBEO0FBQ3RENUIsUUFBQUEsUUFBUSxDQUFDLHNCQUFELEVBQXlCVyxHQUF6QixFQUE4QixtQ0FBOUIsQ0FBUjtBQUNBLGVBQU8wQixPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsS0FBaEIsQ0FBUDtBQUNIOztBQUVEdEMsTUFBQUEsUUFBUSxDQUFDLG1EQUFpRFMsU0FBbEQsQ0FBUjtBQUNBLFdBQUtxQixRQUFMLENBQWM7QUFBQyxTQUFDUyxhQUFELEdBQWlCO0FBQWxCLE9BQWQ7QUFFQSxhQUFPLEtBQUtMLG1CQUFMLENBQXlCLEtBQUtWLGVBQTlCLEVBQStDYixHQUEvQyxFQUFvRGYsYUFBcEQsRUFBbUU2QyxJQUFuRSxDQUF5RUMsQ0FBRCxJQUFPO0FBQ2xGLFlBQUksS0FBS0MsU0FBVCxFQUFvQjtBQUFFO0FBQVM7O0FBRS9CM0MsUUFBQUEsUUFBUSxDQUFDLGdEQUE4Q1MsU0FBOUMsR0FBd0QsWUFBeEQsR0FBcUVpQyxDQUF0RSxDQUFSOztBQUVBLGNBQU07QUFBRXhCLFVBQUFBLE1BQUY7QUFBVVMsVUFBQUEsVUFBVjtBQUFzQkMsVUFBQUE7QUFBdEIsWUFBaUQsS0FBS0MsVUFBTCxFQUF2RDs7QUFDQSxjQUFNZSxRQUFRLEdBQUc7QUFDYixXQUFDTCxhQUFELEdBQWlCLEtBREo7QUFFYixXQUFDYixjQUFELEdBQWtCZ0IsQ0FGTDtBQUdieEIsVUFBQUEsTUFIYTtBQUliUyxVQUFBQSxVQUphO0FBS2JDLFVBQUFBO0FBTGEsU0FBakIsQ0FOa0YsQ0FjbEY7QUFDQTs7QUFDQSxjQUFNaUIsY0FBYyxHQUFHcEMsU0FBUyxHQUFHRyxxQkFBY0UsUUFBakIsR0FBNEJGLHFCQUFjQyxTQUExRTtBQUNBLGNBQU1pQyxzQkFBc0IsR0FBR3JDLFNBQVMsR0FBRyxvQkFBSCxHQUEwQixpQkFBbEU7O0FBQ0EsWUFBSSxDQUFDLEtBQUtRLEtBQUwsQ0FBVzZCLHNCQUFYLENBQUQsSUFDSSxLQUFLdEIsZUFBTCxDQUFxQmdCLFdBQXJCLENBQWlDSyxjQUFqQyxDQURSLEVBQzBEO0FBQ3REN0MsVUFBQUEsUUFBUSxDQUFDLHdCQUFELEVBQTJCNkMsY0FBM0IsRUFBMkMsZ0JBQTNDLENBQVI7QUFDQUQsVUFBQUEsUUFBUSxDQUFDRSxzQkFBRCxDQUFSLEdBQW1DLElBQW5DO0FBQ0gsU0F0QmlGLENBd0JsRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxlQUFPLElBQUlULE9BQUosQ0FBYUMsT0FBRCxJQUFhO0FBQzVCLGVBQUtSLFFBQUwsQ0FBY2MsUUFBZCxFQUF3QixNQUFNO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0FOLFlBQUFBLE9BQU8sQ0FBQ0ksQ0FBQyxLQUFLLENBQUNqQyxTQUFELElBQWNtQixzQkFBc0IsS0FBSyxDQUE5QyxDQUFGLENBQVA7QUFDSCxXQU5EO0FBT0gsU0FSTSxDQUFQO0FBU0gsT0F0Q00sQ0FBUDtBQXVDSCxLQXpTa0I7QUFBQSwrREEyU0dtQixDQUFDLElBQUk7QUFDdkIsVUFBSSxLQUFLdkMsS0FBTCxDQUFXd0MsUUFBZixFQUF5QjtBQUNyQixhQUFLeEMsS0FBTCxDQUFXd0MsUUFBWCxDQUFvQkQsQ0FBcEI7QUFDSDs7QUFFRCxVQUFJLEtBQUt2QyxLQUFMLENBQVd5QyxpQkFBZixFQUFrQztBQUM5QixjQUFNQyxVQUFVLEdBQUcsS0FBS0MscUJBQUwsRUFBbkIsQ0FEOEIsQ0FFOUI7QUFDQTtBQUNBOztBQUNBLFlBQUlELFVBQVUsR0FBRyxDQUFqQixFQUFvQjtBQUNoQixlQUFLcEIsUUFBTCxDQUFjO0FBQUNzQixZQUFBQSxpQkFBaUIsRUFBRTtBQUFwQixXQUFkO0FBQ0gsU0FQNkIsQ0FTOUI7QUFDQTs7O0FBQ0EsY0FBTUMsT0FBTyxHQUFHLEtBQUtDLGtCQUFMLENBQXdCSixVQUF4QixDQUFoQixDQVg4QixDQVk5Qjs7O0FBQ0EsYUFBS0ssd0JBQUwsQ0FBOEJDLGFBQTlCLENBQTRDSCxPQUE1QztBQUNIO0FBQ0osS0EvVGtCO0FBQUEsb0RBaVVSSSxPQUFPLElBQUk7QUFDbEIsVUFBSUEsT0FBTyxDQUFDQyxNQUFSLEtBQW1CLHNCQUF2QixFQUErQztBQUMzQyxhQUFLQyxXQUFMO0FBQ0g7O0FBQ0QsVUFBSUYsT0FBTyxDQUFDQyxNQUFSLEtBQW1CLFlBQXZCLEVBQXFDO0FBQ2pDLGNBQU1FLFNBQVMsR0FBR0gsT0FBTyxDQUFDSSxLQUFSLEdBQWdCLElBQUlDLDRCQUFKLENBQXdCTCxPQUFPLENBQUNJLEtBQWhDLENBQWhCLEdBQXlELElBQTNFO0FBQ0EsYUFBSy9CLFFBQUwsQ0FBYztBQUFDOEIsVUFBQUE7QUFBRCxTQUFkLEVBQTJCLE1BQU07QUFDN0IsY0FBSUgsT0FBTyxDQUFDSSxLQUFSLElBQWlCLEtBQUtFLGFBQUwsQ0FBbUJDLE9BQXhDLEVBQWlEO0FBQzdDLGlCQUFLRCxhQUFMLENBQW1CQyxPQUFuQixDQUEyQkMscUJBQTNCLENBQ0lSLE9BQU8sQ0FBQ0ksS0FBUixDQUFjeEMsS0FBZCxFQURKO0FBR0g7QUFDSixTQU5EO0FBT0g7QUFDSixLQS9Va0I7QUFBQSwwREFpVkYsQ0FBQ0QsRUFBRCxFQUFLOEMsSUFBTCxFQUFXQyxpQkFBWCxFQUE4QkMsT0FBOUIsRUFBdUNDLElBQXZDLEtBQWdEO0FBQzdEO0FBQ0EsVUFBSUEsSUFBSSxDQUFDQyxRQUFMLENBQWNDLGNBQWQsT0FBbUMsS0FBSy9ELEtBQUwsQ0FBV2dFLFdBQWxELEVBQStELE9BRkYsQ0FJN0Q7QUFDQTs7QUFDQSxVQUFJTCxpQkFBaUIsSUFBSSxDQUFDRSxJQUF0QixJQUE4QixDQUFDQSxJQUFJLENBQUNJLFNBQXhDLEVBQW1EO0FBRW5ELFVBQUksQ0FBQyxLQUFLVixhQUFMLENBQW1CQyxPQUF4QixFQUFpQzs7QUFFakMsVUFBSSxDQUFDLEtBQUtELGFBQUwsQ0FBbUJDLE9BQW5CLENBQTJCVSxjQUEzQixHQUE0Q0MsYUFBakQsRUFBZ0U7QUFDNUQ7QUFDQTtBQUNBO0FBQ0EsYUFBSzdDLFFBQUwsQ0FBYztBQUFDOEMsVUFBQUEsa0JBQWtCLEVBQUU7QUFBckIsU0FBZDtBQUNBO0FBQ0gsT0FoQjRELENBa0I3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFdBQUtwRCxlQUFMLENBQXFCVyxRQUFyQixDQUE4QnZCLHFCQUFjRSxRQUE1QyxFQUFzRCxDQUF0RCxFQUF5RCxLQUF6RCxFQUFnRTJCLElBQWhFLENBQXFFLE1BQU07QUFDdkUsWUFBSSxLQUFLRSxTQUFULEVBQW9CO0FBQUU7QUFBUzs7QUFFL0IsY0FBTTtBQUFFekIsVUFBQUEsTUFBRjtBQUFVUyxVQUFBQSxVQUFWO0FBQXNCQyxVQUFBQTtBQUF0QixZQUFpRCxLQUFLQyxVQUFMLEVBQXZEOztBQUNBLGNBQU1nRCxhQUFhLEdBQUdsRCxVQUFVLENBQUNBLFVBQVUsQ0FBQ0osTUFBWCxHQUFvQixDQUFyQixDQUFoQztBQUVBLGNBQU11RCxZQUFZLEdBQUc7QUFDakI1RCxVQUFBQSxNQURpQjtBQUVqQlMsVUFBQUEsVUFGaUI7QUFHakJDLFVBQUFBO0FBSGlCLFNBQXJCO0FBTUEsWUFBSW1ELGFBQUo7O0FBQ0EsWUFBSSxLQUFLdkUsS0FBTCxDQUFXeUMsaUJBQWYsRUFBa0M7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFNK0IsUUFBUSxHQUFHQyxpQ0FBZ0JDLEdBQWhCLEdBQXNCQyxXQUF0QixDQUFrQ0MsTUFBbkQ7O0FBQ0EsZ0JBQU1DLE1BQU0sR0FBR2pFLEVBQUUsQ0FBQ2lFLE1BQUgsR0FBWWpFLEVBQUUsQ0FBQ2lFLE1BQUgsQ0FBVUQsTUFBdEIsR0FBK0IsSUFBOUM7QUFDQUwsVUFBQUEsYUFBYSxHQUFHLEtBQWhCOztBQUNBLGNBQUlNLE1BQU0sSUFBSUwsUUFBVixJQUFzQixDQUFDTSxzQkFBYUMsY0FBYixHQUE4QkMsa0JBQTlCLEVBQTNCLEVBQStFO0FBQzNFVixZQUFBQSxZQUFZLENBQUMxQixpQkFBYixHQUFpQyxJQUFqQztBQUNILFdBRkQsTUFFTyxJQUFJeUIsYUFBYSxJQUFJLEtBQUsxQixxQkFBTCxPQUFpQyxDQUF0RCxFQUF5RDtBQUM1RDtBQUNBO0FBRUEsaUJBQUtzQyxjQUFMLENBQW9CWixhQUFhLENBQUN4RCxLQUFkLEVBQXBCLEVBQTJDd0QsYUFBYSxDQUFDYSxLQUFkLEVBQTNDLEVBQWtFLElBQWxFOztBQUNBWixZQUFBQSxZQUFZLENBQUMxQixpQkFBYixHQUFpQyxLQUFqQztBQUNBMEIsWUFBQUEsWUFBWSxDQUFDYSxpQkFBYixHQUFpQ2QsYUFBYSxDQUFDeEQsS0FBZCxFQUFqQztBQUNBMEQsWUFBQUEsYUFBYSxHQUFHLElBQWhCO0FBQ0g7QUFDSjs7QUFFRCxhQUFLakQsUUFBTCxDQUFjZ0QsWUFBZCxFQUE0QixNQUFNO0FBQzlCLGVBQUtmLGFBQUwsQ0FBbUJDLE9BQW5CLENBQTJCNEIsdUJBQTNCOztBQUNBLGNBQUliLGFBQUosRUFBbUI7QUFDZixpQkFBS3ZFLEtBQUwsQ0FBV3FGLG1CQUFYO0FBQ0g7QUFDSixTQUxEO0FBTUgsT0E1Q0Q7QUE2Q0gsS0F6WmtCO0FBQUEsK0RBMlpHLENBQUMzQixJQUFELEVBQU9NLFdBQVAsS0FBdUI7QUFDekMsVUFBSUEsV0FBVyxLQUFLLEtBQUtoRSxLQUFMLENBQVdnRSxXQUEvQixFQUE0Qzs7QUFFNUMsVUFBSSxLQUFLVCxhQUFMLENBQW1CQyxPQUFuQixJQUE4QixLQUFLRCxhQUFMLENBQW1CQyxPQUFuQixDQUEyQjhCLFVBQTNCLEVBQWxDLEVBQTJFO0FBQ3ZFLGFBQUtDLGFBQUw7QUFDSDtBQUNKLEtBamFrQjtBQUFBLDREQW1hQSxNQUFNLEtBQUtoQyxhQUFMLENBQW1CQyxPQUFuQixJQUE4QixLQUFLRCxhQUFMLENBQW1CQyxPQUFuQixDQUEyQjhCLFVBQTNCLEVBbmFwQztBQUFBLDJEQXFhRCxDQUFDMUUsRUFBRCxFQUFLOEMsSUFBTCxLQUFjO0FBQzVCLFVBQUksS0FBS3ZCLFNBQVQsRUFBb0IsT0FEUSxDQUc1Qjs7QUFDQSxVQUFJdUIsSUFBSSxLQUFLLEtBQUsxRCxLQUFMLENBQVdnRSxXQUFYLENBQXVCTixJQUFwQyxFQUEwQyxPQUpkLENBTTVCO0FBQ0E7O0FBQ0EsV0FBS1AsV0FBTDtBQUNILEtBOWFrQjtBQUFBLDJEQWdiRCxDQUFDcUMsYUFBRCxFQUFnQjlCLElBQWhCLEtBQXlCO0FBQ3ZDLFVBQUksS0FBS3ZCLFNBQVQsRUFBb0IsT0FEbUIsQ0FHdkM7O0FBQ0EsVUFBSXVCLElBQUksS0FBSyxLQUFLMUQsS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFBcEMsRUFBMEMsT0FKSCxDQU12QztBQUNBOztBQUNBLFdBQUtQLFdBQUw7QUFDSCxLQXpia0I7QUFBQSx5REEyYkgsQ0FBQ3ZDLEVBQUQsRUFBSzhDLElBQUwsS0FBYztBQUMxQixVQUFJLEtBQUt2QixTQUFULEVBQW9CLE9BRE0sQ0FHMUI7O0FBQ0EsVUFBSXVCLElBQUksS0FBSyxLQUFLMUQsS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFBcEMsRUFBMEM7QUFFMUMsV0FBS1AsV0FBTDtBQUNILEtBbGNrQjtBQUFBLDhEQW9jRSxDQUFDdkMsRUFBRCxFQUFLOEMsSUFBTCxFQUFXK0IsVUFBWCxLQUEwQjtBQUMzQyxVQUFJLEtBQUt0RCxTQUFULEVBQW9CLE9BRHVCLENBRzNDOztBQUNBLFVBQUl1QixJQUFJLEtBQUssS0FBSzFELEtBQUwsQ0FBV2dFLFdBQVgsQ0FBdUJOLElBQXBDLEVBQTBDOztBQUUxQyxXQUFLZ0MsYUFBTDtBQUNILEtBM2NrQjtBQUFBLHlEQTZjSCxDQUFDOUUsRUFBRCxFQUFLOEMsSUFBTCxLQUFjO0FBQzFCLFVBQUksS0FBS3ZCLFNBQVQsRUFBb0IsT0FETSxDQUcxQjs7QUFDQSxVQUFJdUIsSUFBSSxLQUFLLEtBQUsxRCxLQUFMLENBQVdnRSxXQUFYLENBQXVCTixJQUFwQyxFQUEwQztBQUUxQyxVQUFJOUMsRUFBRSxDQUFDK0UsT0FBSCxPQUFpQixjQUFyQixFQUFxQyxPQU5YLENBUTFCO0FBQ0E7QUFDQTs7QUFDQSxXQUFLckUsUUFBTCxDQUFjO0FBQ1Y2RCxRQUFBQSxpQkFBaUIsRUFBRXZFLEVBQUUsQ0FBQ2dGLFVBQUgsR0FBZ0JDO0FBRHpCLE9BQWQsRUFFRyxLQUFLN0YsS0FBTCxDQUFXcUYsbUJBRmQ7QUFHSCxLQTNka0I7QUFBQSw0REE2ZEF6RSxFQUFFLElBQUk7QUFDckI7QUFDQSxVQUFJLENBQUMsS0FBS1osS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFBNUIsRUFBa0MsT0FGYixDQUlyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsVUFBSTlDLEVBQUUsQ0FBQ2tGLFNBQUgsT0FBbUIsS0FBSzlGLEtBQUwsQ0FBV2dFLFdBQVgsQ0FBdUJOLElBQXZCLENBQTRCcUMsTUFBbkQsRUFBMkQ7QUFDdkQsYUFBSzVDLFdBQUw7QUFDSDtBQUNKLEtBMWVrQjtBQUFBLGtEQTRlVixDQUFDMUMsS0FBRCxFQUFRdUYsU0FBUixFQUFtQm5DLElBQW5CLEtBQTRCO0FBQ2pDLFdBQUt2QyxRQUFMLENBQWM7QUFBQzJFLFFBQUFBLGVBQWUsRUFBRXhGO0FBQWxCLE9BQWQ7QUFDSCxLQTlla0I7QUFBQSwyREFnaEJELE1BQU07QUFDcEIsVUFBSXlGLHVCQUFjQyxRQUFkLENBQXVCLGNBQXZCLENBQUosRUFBNEM7QUFFNUMsVUFBSSxDQUFDLEtBQUs1QyxhQUFMLENBQW1CQyxPQUF4QixFQUFpQztBQUNqQyxVQUFJLENBQUMsS0FBS3hELEtBQUwsQ0FBV29HLGtCQUFoQixFQUFvQyxPQUpoQixDQUtwQjtBQUNBO0FBQ0E7O0FBQ0EsWUFBTUMsR0FBRyxHQUFHNUIsaUNBQWdCQyxHQUFoQixFQUFaLENBUm9CLENBU3BCOzs7QUFDQSxVQUFJLENBQUMyQixHQUFELElBQVFBLEdBQUcsQ0FBQ0MsT0FBSixFQUFaLEVBQTJCO0FBRTNCLFVBQUlDLFlBQVksR0FBRyxJQUFuQjs7QUFFQSxZQUFNQyxnQkFBZ0IsR0FBRyxLQUFLQyxzQkFBTCxDQUE0QixJQUE1QixDQUF6Qjs7QUFDQSxZQUFNQyxtQkFBbUIsR0FBRyxLQUFLQyxnQkFBTCxDQUFzQkgsZ0JBQXRCLENBQTVCLENBZm9CLENBZ0JwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsVUFBSUEsZ0JBQWdCLElBQUlFLG1CQUFtQixLQUFLLElBQTVDLElBQ0ksS0FBSzFGLGVBQUwsQ0FBcUJnQixXQUFyQixDQUFpQzVCLHFCQUFjRSxRQUEvQyxDQURSLEVBQ2tFO0FBQzlEaUcsUUFBQUEsWUFBWSxHQUFHLEtBQWY7QUFDSDs7QUFFRCxZQUFNSyxrQkFBa0IsR0FBRyxLQUFLQywyQkFBTCxDQUFpQztBQUN4REMsUUFBQUEsU0FBUyxFQUFFO0FBRDZDLE9BQWpDLENBQTNCOztBQUdBLFVBQUlGLGtCQUFrQixLQUFLLElBQTNCLEVBQWlDO0FBQzdCTCxRQUFBQSxZQUFZLEdBQUcsS0FBZjtBQUNIOztBQUNELFVBQUlRLGFBQWEsR0FBRyxLQUFLdEcsS0FBTCxDQUFXQyxNQUFYLENBQWtCa0csa0JBQWxCLENBQXBCO0FBQ0FMLE1BQUFBLFlBQVksR0FBR0EsWUFBWSxJQUN2QjtBQUNBO0FBQ0FLLE1BQUFBLGtCQUFrQixHQUFHRixtQkFIVixJQUlYO0FBQ0EsV0FBS00saUJBQUwsSUFBMEJELGFBQWEsQ0FBQ2xHLEtBQWQsRUFMOUIsQ0F6Q29CLENBZ0RwQjs7QUFDQSxZQUFNb0csWUFBWSxHQUNkLEtBQUtDLGlCQUFMLElBQTBCLEtBQUt6RyxLQUFMLENBQVcwRSxpQkFEekMsQ0FqRG9CLENBb0RwQjtBQUNBOztBQUNBLFVBQUlvQixZQUFZLElBQUlVLFlBQXBCLEVBQWtDO0FBQzlCLFlBQUlWLFlBQUosRUFBa0I7QUFDZCxlQUFLUyxpQkFBTCxHQUF5QkQsYUFBYSxDQUFDbEcsS0FBZCxFQUF6QjtBQUNILFNBRkQsTUFFTztBQUNIa0csVUFBQUEsYUFBYSxHQUFHLElBQWhCO0FBQ0g7O0FBQ0QsYUFBS0csaUJBQUwsR0FBeUIsS0FBS3pHLEtBQUwsQ0FBVzBFLGlCQUFwQztBQUVBM0YsUUFBQUEsUUFBUSxDQUFDLDBDQUFELEVBQ0osS0FBS1EsS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFBdkIsQ0FBNEJxQyxNQUR4QixFQUVKLElBRkksRUFFRSxLQUFLdEYsS0FBTCxDQUFXMEUsaUJBRmIsRUFHSjRCLGFBQWEsR0FBRyxRQUFRQSxhQUFhLENBQUNsRyxLQUFkLEVBQVgsR0FBbUMsRUFINUMsQ0FBUjs7QUFLQTRELHlDQUFnQkMsR0FBaEIsR0FBc0J5QyxrQkFBdEIsQ0FDSSxLQUFLbkgsS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFBdkIsQ0FBNEJxQyxNQURoQyxFQUVJLEtBQUt0RixLQUFMLENBQVcwRSxpQkFGZixFQUdJNEIsYUFISixFQUdtQjtBQUNmLFVBSkosRUFLRUssS0FMRixDQUtTN0UsQ0FBRCxJQUFPO0FBQ1g7QUFDQSxjQUFJQSxDQUFDLENBQUM4RSxPQUFGLEtBQWMsZ0JBQWQsSUFBa0NOLGFBQXRDLEVBQXFEO0FBQ2pELG1CQUFPdEMsaUNBQWdCQyxHQUFoQixHQUFzQjRDLGVBQXRCLENBQ0hQLGFBREcsRUFFSCxFQUZHLEVBR0xLLEtBSEssQ0FHRTdFLENBQUQsSUFBTztBQUNYOUMsY0FBQUEsT0FBTyxDQUFDOEgsS0FBUixDQUFjaEYsQ0FBZDtBQUNBLG1CQUFLeUUsaUJBQUwsR0FBeUJRLFNBQXpCO0FBQ0gsYUFOTSxDQUFQO0FBT0gsV0FSRCxNQVFPO0FBQ0gvSCxZQUFBQSxPQUFPLENBQUM4SCxLQUFSLENBQWNoRixDQUFkO0FBQ0gsV0FaVSxDQWFYOzs7QUFDQSxlQUFLeUUsaUJBQUwsR0FBeUJRLFNBQXpCO0FBQ0EsZUFBS04saUJBQUwsR0FBeUJNLFNBQXpCO0FBQ0gsU0FyQkQsRUFiOEIsQ0FvQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFlBQUksS0FBS0MscUJBQUwsRUFBSixFQUFrQztBQUM5QixlQUFLekgsS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFBdkIsQ0FBNEJnRSwwQkFBNUIsQ0FBdUQsT0FBdkQsRUFBZ0UsQ0FBaEU7QUFDQSxlQUFLMUgsS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFBdkIsQ0FBNEJnRSwwQkFBNUIsQ0FBdUQsV0FBdkQsRUFBb0UsQ0FBcEU7O0FBQ0FDLDhCQUFJQyxRQUFKLENBQWE7QUFDVDFFLFlBQUFBLE1BQU0sRUFBRSxjQURDO0FBRVQ2QyxZQUFBQSxNQUFNLEVBQUUsS0FBSy9GLEtBQUwsQ0FBV2dFLFdBQVgsQ0FBdUJOLElBQXZCLENBQTRCcUM7QUFGM0IsV0FBYjtBQUlIO0FBQ0o7QUFDSixLQXhuQmtCO0FBQUEsNERBNG5CQSxNQUFNO0FBQ3JCLFVBQUksQ0FBQyxLQUFLL0YsS0FBTCxDQUFXeUMsaUJBQWhCLEVBQW1DOztBQUNuQyxVQUFJLEtBQUtFLHFCQUFMLE9BQWlDLENBQXJDLEVBQXdDO0FBQ3BDO0FBQ0E7QUFDQTtBQUNILE9BTm9CLENBT3JCO0FBQ0E7QUFDQTs7O0FBQ0EsWUFBTWtGLGtCQUFrQixHQUFHLEtBQUtoQiwyQkFBTCxDQUFpQztBQUN4RGlCLFFBQUFBLFlBQVksRUFBRTtBQUQwQyxPQUFqQyxDQUEzQjs7QUFJQSxVQUFJRCxrQkFBa0IsS0FBSyxJQUEzQixFQUFpQztBQUM3QjtBQUNIOztBQUNELFlBQU1FLGtCQUFrQixHQUFHLEtBQUt0SCxLQUFMLENBQVdDLE1BQVgsQ0FBa0JtSCxrQkFBbEIsQ0FBM0I7O0FBQ0EsV0FBSzVDLGNBQUwsQ0FBb0I4QyxrQkFBa0IsQ0FBQ2xILEtBQW5CLEVBQXBCLEVBQ29Ca0gsa0JBQWtCLENBQUM3QyxLQUFuQixFQURwQixFQWxCcUIsQ0FxQnJCO0FBQ0E7OztBQUNBLFVBQUksS0FBS3pFLEtBQUwsQ0FBV21DLGlCQUFmLEVBQWtDO0FBQzlCLGFBQUt0QixRQUFMLENBQWM7QUFDVnNCLFVBQUFBLGlCQUFpQixFQUFFO0FBRFQsU0FBZDtBQUdILE9BM0JvQixDQTZCckI7OztBQUNBLFdBQUswRSxlQUFMO0FBQ0gsS0EzcEJrQjtBQUFBLDhEQW1zQkUsTUFBTTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBSSxLQUFLdEcsZUFBTCxDQUFxQmdCLFdBQXJCLENBQWlDNUIscUJBQWNFLFFBQS9DLENBQUosRUFBOEQ7QUFDMUQsYUFBS2lGLGFBQUw7QUFDSCxPQUZELE1BRU87QUFDSCxZQUFJLEtBQUtoQyxhQUFMLENBQW1CQyxPQUF2QixFQUFnQztBQUM1QixlQUFLRCxhQUFMLENBQW1CQyxPQUFuQixDQUEyQndFLGNBQTNCO0FBQ0g7QUFDSjtBQUNKLEtBaHRCa0I7QUFBQSw0REFxdEJBLE1BQU07QUFDckIsVUFBSSxDQUFDLEtBQUtoSSxLQUFMLENBQVd5QyxpQkFBaEIsRUFBbUM7QUFDbkMsVUFBSSxDQUFDLEtBQUtjLGFBQUwsQ0FBbUJDLE9BQXhCLEVBQWlDO0FBQ2pDLFVBQUksQ0FBQyxLQUFLL0MsS0FBTCxDQUFXMEUsaUJBQWhCLEVBQW1DLE9BSGQsQ0FLckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLFlBQU04QyxHQUFHLEdBQUcsS0FBSzFFLGFBQUwsQ0FBbUJDLE9BQW5CLENBQTJCYixxQkFBM0IsRUFBWjs7QUFDQSxVQUFJc0YsR0FBRyxLQUFLLElBQVosRUFBa0I7QUFDZDtBQUNBO0FBQ0EsYUFBSzFFLGFBQUwsQ0FBbUJDLE9BQW5CLENBQTJCMEUsYUFBM0IsQ0FBeUMsS0FBS3pILEtBQUwsQ0FBVzBFLGlCQUFwRCxFQUNxQyxDQURyQyxFQUN3QyxJQUFFLENBRDFDOztBQUVBO0FBQ0gsT0FsQm9CLENBb0JyQjtBQUNBO0FBQ0E7OztBQUNBLFdBQUtJLGFBQUwsQ0FBbUIsS0FBSzlFLEtBQUwsQ0FBVzBFLGlCQUE5QixFQUFpRCxDQUFqRCxFQUFvRCxJQUFFLENBQXREO0FBQ0gsS0E3dUJrQjtBQUFBLDREQWl2QkEsTUFBTTtBQUNyQixVQUFJLENBQUMsS0FBS25GLEtBQUwsQ0FBV3lDLGlCQUFoQixFQUFtQzs7QUFFbkMsWUFBTTBGLElBQUksR0FBRyxLQUFLMUIsc0JBQUwsRUFBYixDQUhxQixDQUtyQjs7O0FBQ0EsWUFBTTJCLEVBQUUsR0FBRyxLQUFLcEksS0FBTCxDQUFXZ0UsV0FBWCxDQUF1QnFFLG1CQUF2QixDQUEyQ0YsSUFBM0MsQ0FBWDtBQUNBLFVBQUlHLElBQUo7O0FBQ0EsVUFBSUYsRUFBSixFQUFRO0FBQ0osY0FBTS9FLEtBQUssR0FBRytFLEVBQUUsQ0FBQ0csU0FBSCxHQUFlQyxJQUFmLENBQXFCakcsQ0FBRCxJQUFPO0FBQUUsaUJBQU9BLENBQUMsQ0FBQzFCLEtBQUYsTUFBYXNILElBQXBCO0FBQTJCLFNBQXhELENBQWQ7O0FBQ0EsWUFBSTlFLEtBQUosRUFBVztBQUNQaUYsVUFBQUEsSUFBSSxHQUFHakYsS0FBSyxDQUFDNkIsS0FBTixFQUFQO0FBQ0g7QUFDSjs7QUFFRCxXQUFLRCxjQUFMLENBQW9Ca0QsSUFBcEIsRUFBMEJHLElBQTFCO0FBQ0gsS0Fqd0JrQjtBQUFBLGlFQXN3QkssTUFBTTtBQUMxQixhQUFPLEtBQUsvRSxhQUFMLENBQW1CQyxPQUFuQixJQUNBLEtBQUtELGFBQUwsQ0FBbUJDLE9BQW5CLENBQTJCOEIsVUFBM0IsRUFEQSxJQUVBLEtBQUt0RSxlQUZMLElBR0EsQ0FBQyxLQUFLQSxlQUFMLENBQXFCZ0IsV0FBckIsQ0FBaUM1QixxQkFBY0UsUUFBL0MsQ0FIUjtBQUlILEtBM3dCa0I7QUFBQSwwREFteEJGLE1BQU07QUFDbkIsVUFBSSxDQUFDLEtBQUtpRCxhQUFMLENBQW1CQyxPQUF4QixFQUFpQztBQUFFLGVBQU8sSUFBUDtBQUFjOztBQUNqRCxhQUFPLEtBQUtELGFBQUwsQ0FBbUJDLE9BQW5CLENBQTJCVSxjQUEzQixFQUFQO0FBQ0gsS0F0eEJrQjtBQUFBLGlFQTh4QkssTUFBTTtBQUMxQixVQUFJLENBQUMsS0FBS2xFLEtBQUwsQ0FBV3lDLGlCQUFoQixFQUFtQyxPQUFPLElBQVA7QUFDbkMsVUFBSSxDQUFDLEtBQUtjLGFBQUwsQ0FBbUJDLE9BQXhCLEVBQWlDLE9BQU8sSUFBUDs7QUFFakMsWUFBTXlFLEdBQUcsR0FBRyxLQUFLMUUsYUFBTCxDQUFtQkMsT0FBbkIsQ0FBMkJiLHFCQUEzQixFQUFaOztBQUNBLFVBQUlzRixHQUFHLEtBQUssSUFBWixFQUFrQjtBQUNkLGVBQU9BLEdBQVA7QUFDSCxPQVB5QixDQVMxQjtBQUNBOzs7QUFDQSxZQUFNSyxJQUFJLEdBQUcxSSxhQUFhLENBQUM2SSxtQkFBZCxDQUFrQyxLQUFLekksS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFBdkIsQ0FBNEJxQyxNQUE5RCxDQUFiOztBQUNBLFVBQUl1QyxJQUFJLElBQUksS0FBSzdILEtBQUwsQ0FBV0MsTUFBWCxDQUFrQkssTUFBbEIsR0FBMkIsQ0FBdkMsRUFBMEM7QUFDdEMsWUFBSXVILElBQUksR0FBRyxLQUFLN0gsS0FBTCxDQUFXQyxNQUFYLENBQWtCLENBQWxCLEVBQXFCd0UsS0FBckIsRUFBWCxFQUF5QztBQUNyQyxpQkFBTyxDQUFDLENBQVI7QUFDSCxTQUZELE1BRU87QUFDSCxpQkFBTyxDQUFQO0FBQ0g7QUFDSjs7QUFFRCxhQUFPLElBQVA7QUFDSCxLQW56QmtCO0FBQUEsK0RBcXpCRyxNQUFNO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBLFlBQU13RCxHQUFHLEdBQUcsS0FBSy9GLHFCQUFMLEVBQVo7QUFDQSxZQUFNc0YsR0FBRyxHQUFHLEtBQUt4SCxLQUFMLENBQVcwRSxpQkFBWCxLQUFpQyxJQUFqQyxNQUF5QztBQUNoRHVELE1BQUFBLEdBQUcsR0FBRyxDQUFOLElBQVdBLEdBQUcsS0FBSyxJQURaLENBQVosQ0FMd0IsQ0FNTzs7QUFDL0IsYUFBT1QsR0FBUDtBQUNILEtBN3pCa0I7QUFBQSwyREFvMEJEckgsRUFBRSxJQUFJO0FBQ3BCLFVBQUksQ0FBQyxLQUFLMkMsYUFBTCxDQUFtQkMsT0FBeEIsRUFBaUM7QUFBRTtBQUFTLE9BRHhCLENBR3BCO0FBQ0E7OztBQUNBLFVBQUk1QyxFQUFFLENBQUMrSCxPQUFILElBQWMsQ0FBQy9ILEVBQUUsQ0FBQ2dJLFFBQWxCLElBQThCLENBQUNoSSxFQUFFLENBQUNpSSxNQUFsQyxJQUE0QyxDQUFDakksRUFBRSxDQUFDa0ksT0FBaEQsSUFBMkRsSSxFQUFFLENBQUNtSSxHQUFILEtBQVdDLGNBQUlDLEdBQTlFLEVBQW1GO0FBQy9FLGFBQUtDLGtCQUFMO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsYUFBSzNGLGFBQUwsQ0FBbUJDLE9BQW5CLENBQTJCMkYsZUFBM0IsQ0FBMkN2SSxFQUEzQztBQUNIO0FBQ0osS0E5MEJrQjtBQUFBLGdFQXF0Q0ksQ0FBQyxHQUFHd0ksSUFBSixLQUFhLEtBQUtwSixLQUFMLENBQVdnRSxXQUFYLENBQXVCcUYsb0JBQXZCLENBQTRDLEdBQUdELElBQS9DLENBcnRDakI7QUFHZjVKLElBQUFBLFFBQVEsQ0FBQyx5QkFBRCxDQUFSO0FBRUEsU0FBS3dILGlCQUFMLEdBQXlCUSxTQUF6QjtBQUNBLFNBQUtOLGlCQUFMLEdBQXlCTSxTQUF6QjtBQUVBLFNBQUtqRSxhQUFMLGdCQUFxQix1QkFBckIsQ0FSZSxDQVVmO0FBQ0E7O0FBQ0EsUUFBSStGLGlCQUFpQixHQUFHLElBQXhCOztBQUNBLFFBQUksS0FBS3RKLEtBQUwsQ0FBV3lDLGlCQUFmLEVBQWtDO0FBQzlCLFlBQU04RyxVQUFVLEdBQUcsS0FBS3ZKLEtBQUwsQ0FBV2dFLFdBQVgsQ0FBdUJOLElBQXZCLENBQTRCOEYsY0FBNUIsQ0FBMkMsY0FBM0MsQ0FBbkI7O0FBQ0EsVUFBSUQsVUFBSixFQUFnQjtBQUNaRCxRQUFBQSxpQkFBaUIsR0FBR0MsVUFBVSxDQUFDM0QsVUFBWCxHQUF3QkMsUUFBNUM7QUFDSCxPQUZELE1BRU87QUFDSHlELFFBQUFBLGlCQUFpQixHQUFHLEtBQUs3QyxzQkFBTCxFQUFwQjtBQUNIO0FBQ0o7O0FBRUQsU0FBS2hHLEtBQUwsR0FBYTtBQUNUQyxNQUFBQSxNQUFNLEVBQUUsRUFEQztBQUVUUyxNQUFBQSxVQUFVLEVBQUUsRUFGSDtBQUdUc0ksTUFBQUEsZUFBZSxFQUFFLElBSFI7QUFHYztBQUV2QjtBQUNBckksTUFBQUEsc0JBQXNCLEVBQUUsQ0FOZjtBQVFUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FzSSxNQUFBQSxlQUFlLEVBQUUsS0FsQlI7QUFvQlQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQXRGLE1BQUFBLGtCQUFrQixFQUFFLEtBakNYO0FBbUNUO0FBQ0E7QUFDQXhCLE1BQUFBLGlCQUFpQixFQUFFLElBckNWO0FBdUNUdUMsTUFBQUEsaUJBQWlCLEVBQUVtRSxpQkF2Q1Y7QUF5Q1RLLE1BQUFBLGNBQWMsRUFBRSxLQXpDUDtBQTBDVEMsTUFBQUEsaUJBQWlCLEVBQUUsS0ExQ1Y7QUE0Q1Q7QUFDQTNELE1BQUFBLGVBQWUsRUFBRXhCLGlDQUFnQkMsR0FBaEIsR0FBc0JtRixZQUF0QixFQTdDUjtBQStDVDtBQUNBQyxNQUFBQSxZQUFZLEVBQUU1RCx1QkFBY0MsUUFBZCxDQUF1QiwwQkFBdkIsQ0FoREw7QUFrRFQ7QUFDQTRELE1BQUFBLG9CQUFvQixFQUFFN0QsdUJBQWNDLFFBQWQsQ0FBdUIsc0JBQXZCLENBbkRiO0FBcURUO0FBQ0E2RCxNQUFBQSwyQkFBMkIsRUFBRTlELHVCQUFjQyxRQUFkLENBQXVCLDZCQUF2QixDQXREcEI7QUF3RFQ7QUFDQThELE1BQUFBLDhCQUE4QixFQUFFL0QsdUJBQWNDLFFBQWQsQ0FBdUIsZ0NBQXZCO0FBekR2QixLQUFiO0FBNERBLFNBQUsrRCxhQUFMLEdBQXFCdkMsb0JBQUl3QyxRQUFKLENBQWEsS0FBS0MsUUFBbEIsQ0FBckI7O0FBQ0EzRixxQ0FBZ0JDLEdBQWhCLEdBQXNCMkYsRUFBdEIsQ0FBeUIsZUFBekIsRUFBMEMsS0FBS0MsY0FBL0M7O0FBQ0E3RixxQ0FBZ0JDLEdBQWhCLEdBQXNCMkYsRUFBdEIsQ0FBeUIsb0JBQXpCLEVBQStDLEtBQUtFLG1CQUFwRDs7QUFDQTlGLHFDQUFnQkMsR0FBaEIsR0FBc0IyRixFQUF0QixDQUF5QixnQkFBekIsRUFBMkMsS0FBS0csZUFBaEQsRUFyRmUsQ0FzRmY7OztBQUNBL0YscUNBQWdCQyxHQUFoQixHQUFzQjJGLEVBQXRCLENBQXlCLHlCQUF6QixFQUFvRCxLQUFLRyxlQUF6RDs7QUFDQS9GLHFDQUFnQkMsR0FBaEIsR0FBc0IyRixFQUF0QixDQUF5QixjQUF6QixFQUF5QyxLQUFLSSxhQUE5Qzs7QUFDQWhHLHFDQUFnQkMsR0FBaEIsR0FBc0IyRixFQUF0QixDQUF5Qix1QkFBekIsRUFBa0QsS0FBS0ssa0JBQXZEOztBQUNBakcscUNBQWdCQyxHQUFoQixHQUFzQjJGLEVBQXRCLENBQXlCLGtCQUF6QixFQUE2QyxLQUFLTSxhQUFsRDs7QUFDQWxHLHFDQUFnQkMsR0FBaEIsR0FBc0IyRixFQUF0QixDQUF5QixpQkFBekIsRUFBNEMsS0FBS08sZ0JBQWpEOztBQUNBbkcscUNBQWdCQyxHQUFoQixHQUFzQjJGLEVBQXRCLENBQXlCLGdCQUF6QixFQUEyQyxLQUFLUSxlQUFoRDs7QUFDQXBHLHFDQUFnQkMsR0FBaEIsR0FBc0IyRixFQUF0QixDQUF5QixNQUF6QixFQUFpQyxLQUFLUyxNQUF0QztBQUNILEdBckt1QyxDQXVLeEM7QUFDQTs7O0FBQ0FDLEVBQUFBLHlCQUF5QixHQUFHO0FBQ3hCLFFBQUksS0FBSy9LLEtBQUwsQ0FBV29HLGtCQUFmLEVBQW1DO0FBQy9CLFdBQUs0RSwrQkFBTDtBQUNIOztBQUNELFFBQUksS0FBS2hMLEtBQUwsQ0FBV3lDLGlCQUFmLEVBQWtDO0FBQzlCLFdBQUt3SSw4QkFBTDtBQUNIOztBQUVELFNBQUtDLGFBQUwsQ0FBbUIsS0FBS2xMLEtBQXhCO0FBQ0gsR0FsTHVDLENBb0x4QztBQUNBOzs7QUFDQW1MLEVBQUFBLGdDQUFnQyxDQUFDQyxRQUFELEVBQVc7QUFDdkMsUUFBSUEsUUFBUSxDQUFDcEgsV0FBVCxLQUF5QixLQUFLaEUsS0FBTCxDQUFXZ0UsV0FBeEMsRUFBcUQ7QUFDakQ7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQXZFLE1BQUFBLE9BQU8sQ0FBQzRMLElBQVIsQ0FBYSxnRUFBYjtBQUNIOztBQUVELFFBQUlELFFBQVEsQ0FBQzdLLE9BQVQsSUFBb0IsS0FBS1AsS0FBTCxDQUFXTyxPQUFuQyxFQUE0QztBQUN4Q2QsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksd0NBQXdDMEwsUUFBUSxDQUFDN0ssT0FBakQsR0FDQSxRQURBLEdBQ1csS0FBS1AsS0FBTCxDQUFXTyxPQUR0QixHQUNnQyxHQUQ1QztBQUVBLGFBQU8sS0FBSzJLLGFBQUwsQ0FBbUJFLFFBQW5CLENBQVA7QUFDSDtBQUNKOztBQUVERSxFQUFBQSxxQkFBcUIsQ0FBQ0MsU0FBRCxFQUFZQyxTQUFaLEVBQXVCO0FBQ3hDLFFBQUksQ0FBQ0MsV0FBVyxDQUFDQyxZQUFaLENBQXlCLEtBQUsxTCxLQUE5QixFQUFxQ3VMLFNBQXJDLENBQUwsRUFBc0Q7QUFDbEQsVUFBSWhNLEtBQUosRUFBVztBQUNQRSxRQUFBQSxPQUFPLENBQUNrTSxLQUFSLENBQWMsOENBQWQ7QUFDQWxNLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkIsS0FBS00sS0FBbEM7QUFDQVAsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksY0FBWixFQUE0QjZMLFNBQTVCO0FBQ0E5TCxRQUFBQSxPQUFPLENBQUNtTSxRQUFSO0FBQ0g7O0FBQ0QsYUFBTyxJQUFQO0FBQ0g7O0FBRUQsUUFBSSxDQUFDSCxXQUFXLENBQUNDLFlBQVosQ0FBeUIsS0FBS2pMLEtBQTlCLEVBQXFDK0ssU0FBckMsQ0FBTCxFQUFzRDtBQUNsRCxVQUFJak0sS0FBSixFQUFXO0FBQ1BFLFFBQUFBLE9BQU8sQ0FBQ2tNLEtBQVIsQ0FBYyw4Q0FBZDtBQUNBbE0sUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QixLQUFLZSxLQUFsQztBQUNBaEIsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksY0FBWixFQUE0QjhMLFNBQTVCO0FBQ0EvTCxRQUFBQSxPQUFPLENBQUNtTSxRQUFSO0FBQ0g7O0FBQ0QsYUFBTyxJQUFQO0FBQ0g7O0FBRUQsV0FBTyxLQUFQO0FBQ0g7O0FBRURDLEVBQUFBLG9CQUFvQixHQUFHO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBSzFKLFNBQUwsR0FBaUIsSUFBakI7O0FBQ0EsUUFBSSxLQUFLMkoseUJBQVQsRUFBb0M7QUFDaEMsV0FBS0EseUJBQUwsQ0FBK0JDLEtBQS9COztBQUNBLFdBQUtELHlCQUFMLEdBQWlDLElBQWpDO0FBQ0g7O0FBQ0QsUUFBSSxLQUFLL0ksd0JBQVQsRUFBbUM7QUFDL0IsV0FBS0Esd0JBQUwsQ0FBOEJnSixLQUE5Qjs7QUFDQSxXQUFLaEosd0JBQUwsR0FBZ0MsSUFBaEM7QUFDSDs7QUFFRDRFLHdCQUFJcUUsVUFBSixDQUFlLEtBQUs5QixhQUFwQjs7QUFFQSxVQUFNK0IsTUFBTSxHQUFHeEgsaUNBQWdCQyxHQUFoQixFQUFmOztBQUNBLFFBQUl1SCxNQUFKLEVBQVk7QUFDUkEsTUFBQUEsTUFBTSxDQUFDQyxjQUFQLENBQXNCLGVBQXRCLEVBQXVDLEtBQUs1QixjQUE1QztBQUNBMkIsTUFBQUEsTUFBTSxDQUFDQyxjQUFQLENBQXNCLG9CQUF0QixFQUE0QyxLQUFLM0IsbUJBQWpEO0FBQ0EwQixNQUFBQSxNQUFNLENBQUNDLGNBQVAsQ0FBc0IsZ0JBQXRCLEVBQXdDLEtBQUsxQixlQUE3QztBQUNBeUIsTUFBQUEsTUFBTSxDQUFDQyxjQUFQLENBQXNCLHlCQUF0QixFQUFpRCxLQUFLMUIsZUFBdEQ7QUFDQXlCLE1BQUFBLE1BQU0sQ0FBQ0MsY0FBUCxDQUFzQixjQUF0QixFQUFzQyxLQUFLekIsYUFBM0M7QUFDQXdCLE1BQUFBLE1BQU0sQ0FBQ0MsY0FBUCxDQUFzQix1QkFBdEIsRUFBK0MsS0FBS3hCLGtCQUFwRDtBQUNBdUIsTUFBQUEsTUFBTSxDQUFDQyxjQUFQLENBQXNCLGtCQUF0QixFQUEwQyxLQUFLdkIsYUFBL0M7QUFDQXNCLE1BQUFBLE1BQU0sQ0FBQ0MsY0FBUCxDQUFzQixpQkFBdEIsRUFBeUMsS0FBS3RCLGdCQUE5QztBQUNBcUIsTUFBQUEsTUFBTSxDQUFDQyxjQUFQLENBQXNCLGdCQUF0QixFQUF3QyxLQUFLckIsZUFBN0M7QUFDQW9CLE1BQUFBLE1BQU0sQ0FBQ0MsY0FBUCxDQUFzQixNQUF0QixFQUE4QixLQUFLcEIsTUFBbkM7QUFDSDtBQUNKOztBQW9URGhJLEVBQUFBLGtCQUFrQixDQUFDcUosa0JBQUQsRUFBcUI7QUFDbkMsV0FBT0Esa0JBQWtCLEtBQUssQ0FBdkIsR0FDSCxLQUFLMUwsS0FBTCxDQUFXdUosMkJBRFIsR0FFSCxLQUFLdkosS0FBTCxDQUFXd0osOEJBRmY7QUFHSDs7QUFFRCxRQUFNZ0IsOEJBQU4sR0FBdUM7QUFDbkMsVUFBTW1CLGNBQWMsR0FBRyxLQUFLdEosa0JBQUwsQ0FBd0IsS0FBS0gscUJBQUwsRUFBeEIsQ0FBdkI7O0FBQ0EsU0FBS0ksd0JBQUwsR0FBZ0MsSUFBSXNKLGNBQUosQ0FBVUQsY0FBVixDQUFoQzs7QUFFQSxXQUFPLEtBQUtySix3QkFBWixFQUFzQztBQUFFO0FBQ3BDK0IsNEJBQWFDLGNBQWIsR0FBOEJ1SCx1QkFBOUIsQ0FBc0QsS0FBS3ZKLHdCQUEzRDs7QUFDQSxVQUFJO0FBQ0EsY0FBTSxLQUFLQSx3QkFBTCxDQUE4QndKLFFBQTlCLEVBQU47QUFDSCxPQUZELENBRUUsT0FBT2hLLENBQVAsRUFBVTtBQUFFO0FBQVU7QUFBZSxPQUpMLENBS2xDOzs7QUFDQSxXQUFLaUssZ0JBQUw7QUFDSDtBQUNKOztBQUVELFFBQU14QiwrQkFBTixHQUF3QztBQUNwQyxTQUFLYyx5QkFBTCxHQUFpQyxJQUFJTyxjQUFKLENBQVUvTSx3QkFBVixDQUFqQzs7QUFDQSxXQUFPLEtBQUt3TSx5QkFBWixFQUF1QztBQUFFO0FBQ3JDaEgsNEJBQWFDLGNBQWIsR0FBOEIwSCxrQkFBOUIsQ0FBaUQsS0FBS1gseUJBQXREOztBQUNBLFVBQUk7QUFDQSxjQUFNLEtBQUtBLHlCQUFMLENBQStCUyxRQUEvQixFQUFOO0FBQ0gsT0FGRCxDQUVFLE9BQU9oSyxDQUFQLEVBQVU7QUFBRTtBQUFVO0FBQWUsT0FKSixDQUtuQzs7O0FBQ0EsV0FBSytFLGVBQUw7QUFDSDtBQUNKOztBQWdKRDtBQUNBb0YsRUFBQUEsOEJBQThCLEdBQUc7QUFDN0IsUUFBSSxDQUFDLEtBQUsxTSxLQUFMLENBQVd5QyxpQkFBaEIsRUFBbUMsT0FETixDQUc3QjtBQUNBO0FBQ0E7O0FBQ0EsVUFBTS9CLE1BQU0sR0FBRyxLQUFLTSxlQUFMLENBQXFCdUgsU0FBckIsRUFBZixDQU42QixDQVE3Qjs7O0FBQ0EsUUFBSW9FLENBQUo7O0FBQ0EsU0FBS0EsQ0FBQyxHQUFHLENBQVQsRUFBWUEsQ0FBQyxHQUFHak0sTUFBTSxDQUFDSyxNQUF2QixFQUErQjRMLENBQUMsRUFBaEMsRUFBb0M7QUFDaEMsVUFBSWpNLE1BQU0sQ0FBQ2lNLENBQUQsQ0FBTixDQUFVOUwsS0FBVixNQUFxQixLQUFLSixLQUFMLENBQVcwRSxpQkFBcEMsRUFBdUQ7QUFDbkQ7QUFDSDtBQUNKOztBQUNELFFBQUl3SCxDQUFDLElBQUlqTSxNQUFNLENBQUNLLE1BQWhCLEVBQXdCO0FBQ3BCO0FBQ0gsS0FqQjRCLENBbUI3Qjs7O0FBQ0EsVUFBTXlELFFBQVEsR0FBR0MsaUNBQWdCQyxHQUFoQixHQUFzQkMsV0FBdEIsQ0FBa0NDLE1BQW5EOztBQUNBLFNBQUsrSCxDQUFDLEVBQU4sRUFBVUEsQ0FBQyxHQUFHak0sTUFBTSxDQUFDSyxNQUFyQixFQUE2QjRMLENBQUMsRUFBOUIsRUFBa0M7QUFDOUIsWUFBTS9MLEVBQUUsR0FBR0YsTUFBTSxDQUFDaU0sQ0FBRCxDQUFqQjs7QUFDQSxVQUFJLENBQUMvTCxFQUFFLENBQUNpRSxNQUFKLElBQWNqRSxFQUFFLENBQUNpRSxNQUFILENBQVVELE1BQVYsSUFBb0JKLFFBQXRDLEVBQWdEO0FBQzVDO0FBQ0g7QUFDSixLQTFCNEIsQ0EyQjdCOzs7QUFDQW1JLElBQUFBLENBQUM7QUFFRCxVQUFNL0wsRUFBRSxHQUFHRixNQUFNLENBQUNpTSxDQUFELENBQWpCOztBQUNBLFNBQUsxSCxjQUFMLENBQW9CckUsRUFBRSxDQUFDQyxLQUFILEVBQXBCLEVBQWdDRCxFQUFFLENBQUNzRSxLQUFILEVBQWhDO0FBQ0g7QUFFRDtBQUNKOzs7QUE4SUlnRyxFQUFBQSxhQUFhLENBQUNsTCxLQUFELEVBQVE7QUFDakIsVUFBTTRNLFlBQVksR0FBRzVNLEtBQUssQ0FBQ08sT0FBM0I7QUFDQSxVQUFNc00sV0FBVyxHQUFHN00sS0FBSyxDQUFDOE0sZ0JBQTFCLENBRmlCLENBSWpCO0FBQ0E7O0FBQ0EsUUFBSUMsVUFBVSxHQUFHLENBQWpCOztBQUNBLFFBQUlGLFdBQVcsSUFBSSxJQUFuQixFQUF5QjtBQUNyQkUsTUFBQUEsVUFBVSxHQUFHLEdBQWI7QUFDSDs7QUFFRCxXQUFPLEtBQUt4SCxhQUFMLENBQW1CcUgsWUFBbkIsRUFBaUNDLFdBQWpDLEVBQThDRSxVQUE5QyxDQUFQO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0l4SCxFQUFBQSxhQUFhLENBQUNoRixPQUFELEVBQVVzTSxXQUFWLEVBQXVCRSxVQUF2QixFQUFtQztBQUM1QyxTQUFLL0wsZUFBTCxHQUF1QixJQUFJZ00sTUFBTSxDQUFDQyxjQUFYLENBQ25CeEksaUNBQWdCQyxHQUFoQixFQURtQixFQUNJLEtBQUsxRSxLQUFMLENBQVdnRSxXQURmLEVBRW5CO0FBQUNrSixNQUFBQSxXQUFXLEVBQUUsS0FBS2xOLEtBQUwsQ0FBV21OO0FBQXpCLEtBRm1CLENBQXZCOztBQUlBLFVBQU1DLFFBQVEsR0FBRyxNQUFNO0FBQ25CO0FBQ0E7QUFDQSxVQUFJLEtBQUs3SixhQUFMLENBQW1CQyxPQUF2QixFQUFnQztBQUM1QixhQUFLRCxhQUFMLENBQW1CQyxPQUFuQixDQUEyQjZKLGVBQTNCO0FBQ0g7O0FBQ0QsV0FBSzNILGFBQUwsR0FObUIsQ0FRbkI7QUFDQTtBQUNBOzs7QUFDQSxXQUFLZ0gsOEJBQUw7O0FBRUEsV0FBS3BMLFFBQUwsQ0FBYztBQUNWb0ksUUFBQUEsZUFBZSxFQUFFLEtBQUsxSSxlQUFMLENBQXFCZ0IsV0FBckIsQ0FBaUM1QixxQkFBY0MsU0FBL0MsQ0FEUDtBQUVWK0QsUUFBQUEsa0JBQWtCLEVBQUUsS0FBS3BELGVBQUwsQ0FBcUJnQixXQUFyQixDQUFpQzVCLHFCQUFjRSxRQUEvQyxDQUZWO0FBR1ZtSixRQUFBQSxlQUFlLEVBQUU7QUFIUCxPQUFkLEVBSUcsTUFBTTtBQUNMO0FBQ0EsWUFBSSxDQUFDLEtBQUtsRyxhQUFMLENBQW1CQyxPQUF4QixFQUFpQztBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBL0QsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMkNBQ0EsMEJBRFo7QUFFQTtBQUNIOztBQUNELFlBQUlhLE9BQUosRUFBYTtBQUNULGVBQUtnRCxhQUFMLENBQW1CQyxPQUFuQixDQUEyQjBFLGFBQTNCLENBQXlDM0gsT0FBekMsRUFBa0RzTSxXQUFsRCxFQUNxQ0UsVUFEckM7QUFFSCxTQUhELE1BR087QUFDSCxlQUFLeEosYUFBTCxDQUFtQkMsT0FBbkIsQ0FBMkJ3RSxjQUEzQjtBQUNIOztBQUVELGFBQUtWLGVBQUw7QUFDSCxPQXZCRDtBQXdCSCxLQXJDRDs7QUF1Q0EsVUFBTWdHLE9BQU8sR0FBSS9GLEtBQUQsSUFBVztBQUN2QixXQUFLakcsUUFBTCxDQUFjO0FBQUVtSSxRQUFBQSxlQUFlLEVBQUU7QUFBbkIsT0FBZDtBQUNBaEssTUFBQUEsT0FBTyxDQUFDOEgsS0FBUixDQUNLLG1DQUFrQ2hILE9BQVEsS0FBSWdILEtBQU0sRUFEekQ7QUFHQSxZQUFNZ0csV0FBVyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIscUJBQWpCLENBQXBCO0FBRUEsVUFBSUMsVUFBSixDQVB1QixDQVN2QjtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxVQUFJbk4sT0FBSixFQUFhO0FBQ1RtTixRQUFBQSxVQUFVLEdBQUcsTUFBTTtBQUNmO0FBQ0EvRiw4QkFBSUMsUUFBSixDQUFhO0FBQ1QxRSxZQUFBQSxNQUFNLEVBQUUsV0FEQztBQUVUeUssWUFBQUEsT0FBTyxFQUFFLEtBQUszTixLQUFMLENBQVdnRSxXQUFYLENBQXVCTixJQUF2QixDQUE0QnFDO0FBRjVCLFdBQWI7QUFJSCxTQU5EO0FBT0g7O0FBQ0QsVUFBSTZILE9BQUo7O0FBQ0EsVUFBSXJHLEtBQUssQ0FBQ0YsT0FBTixJQUFpQixhQUFyQixFQUFvQztBQUNoQ3VHLFFBQUFBLE9BQU8sR0FBRyx5QkFDTixxRUFDQSx5REFGTSxDQUFWO0FBSUgsT0FMRCxNQUtPO0FBQ0hBLFFBQUFBLE9BQU8sR0FBRyx5QkFDTixxRUFDQSxvQkFGTSxDQUFWO0FBSUg7O0FBQ0RDLHFCQUFNQyxtQkFBTixDQUEwQixrQ0FBMUIsRUFBOEQsRUFBOUQsRUFBa0VQLFdBQWxFLEVBQStFO0FBQzNFUSxRQUFBQSxLQUFLLEVBQUUseUJBQUcsa0NBQUgsQ0FEb0U7QUFFM0VDLFFBQUFBLFdBQVcsRUFBRUosT0FGOEQ7QUFHM0VGLFFBQUFBLFVBQVUsRUFBRUE7QUFIK0QsT0FBL0U7QUFLSCxLQXZDRCxDQTVDNEMsQ0FxRjVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQSxVQUFNNUosUUFBUSxHQUFHLEtBQUs5RCxLQUFMLENBQVdnRSxXQUFYLENBQXVCcUUsbUJBQXZCLENBQTJDOUgsT0FBM0MsQ0FBakI7O0FBQ0EsUUFBSXVELFFBQUosRUFBYztBQUNWO0FBQ0E7QUFDQSxXQUFLOUMsZUFBTCxDQUFxQmlOLElBQXJCLENBQTBCMU4sT0FBMUIsRUFBbUNsQixZQUFuQyxFQUhVLENBR3dDOzs7QUFDbEQrTixNQUFBQSxRQUFRO0FBQ1gsS0FMRCxNQUtPO0FBQ0gsWUFBTWMsSUFBSSxHQUFHLEtBQUtsTixlQUFMLENBQXFCaU4sSUFBckIsQ0FBMEIxTixPQUExQixFQUFtQ2xCLFlBQW5DLENBQWI7O0FBQ0EsV0FBS2lDLFFBQUwsQ0FBYztBQUNWWixRQUFBQSxNQUFNLEVBQUUsRUFERTtBQUVWUyxRQUFBQSxVQUFVLEVBQUUsRUFGRjtBQUdWdUksUUFBQUEsZUFBZSxFQUFFLEtBSFA7QUFJVnRGLFFBQUFBLGtCQUFrQixFQUFFLEtBSlY7QUFLVnFGLFFBQUFBLGVBQWUsRUFBRTtBQUxQLE9BQWQ7QUFPQXlFLE1BQUFBLElBQUksQ0FBQ2pNLElBQUwsQ0FBVW1MLFFBQVYsRUFBb0JFLE9BQXBCO0FBQ0g7QUFDSixHQW5pQ3VDLENBcWlDeEM7QUFDQTtBQUNBOzs7QUFDQTVILEVBQUFBLGFBQWEsR0FBRztBQUNaO0FBQ0E7QUFDQSxRQUFJLEtBQUt2RCxTQUFULEVBQW9CO0FBRXBCLFNBQUtiLFFBQUwsQ0FBYyxLQUFLRCxVQUFMLEVBQWQ7QUFDSCxHQTlpQ3VDLENBZ2pDeEM7OztBQUNBQSxFQUFBQSxVQUFVLEdBQUc7QUFDVCxVQUFNWCxNQUFNLEdBQUcsS0FBS00sZUFBTCxDQUFxQnVILFNBQXJCLEVBQWY7O0FBQ0EsVUFBTW5ILHNCQUFzQixHQUFHLEtBQUsrTSxvQkFBTCxDQUEwQnpOLE1BQTFCLENBQS9CLENBRlMsQ0FJVDtBQUNBOzs7QUFDQSxVQUFNUyxVQUFVLEdBQUcsQ0FBQyxHQUFHVCxNQUFKLENBQW5CLENBTlMsQ0FRVDs7QUFDQSxRQUFJLENBQUMsS0FBS00sZUFBTCxDQUFxQmdCLFdBQXJCLENBQWlDNUIscUJBQWNFLFFBQS9DLENBQUwsRUFBK0Q7QUFDM0RJLE1BQUFBLE1BQU0sQ0FBQzBOLElBQVAsQ0FBWSxHQUFHLEtBQUtwTyxLQUFMLENBQVdnRSxXQUFYLENBQXVCcUssZ0JBQXZCLEVBQWY7QUFDSDs7QUFFRCxXQUFPO0FBQ0gzTixNQUFBQSxNQURHO0FBRUhTLE1BQUFBLFVBRkc7QUFHSEMsTUFBQUE7QUFIRyxLQUFQO0FBS0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0krTSxFQUFBQSxvQkFBb0IsQ0FBQ3pOLE1BQUQsRUFBUztBQUN6QixVQUFNZ0QsSUFBSSxHQUFHLEtBQUsxRCxLQUFMLENBQVdnRSxXQUFYLENBQXVCTixJQUFwQzs7QUFFQSxRQUFJaEQsTUFBTSxDQUFDSyxNQUFQLEtBQWtCLENBQWxCLElBQXVCLENBQUMyQyxJQUF4QixJQUNBLENBQUNlLGlDQUFnQkMsR0FBaEIsR0FBc0I0SixlQUF0QixDQUFzQzVLLElBQUksQ0FBQ3FDLE1BQTNDLENBREwsRUFDeUQ7QUFDckQsYUFBTyxDQUFQO0FBQ0g7O0FBRUQsVUFBTW5CLE1BQU0sR0FBR0gsaUNBQWdCQyxHQUFoQixHQUFzQkMsV0FBdEIsQ0FBa0NDLE1BQWpELENBUnlCLENBVXpCO0FBQ0E7QUFDQTs7O0FBQ0EsUUFBSStILENBQUo7QUFDQSxRQUFJNEIsY0FBYyxHQUFHLE9BQXJCOztBQUNBLFNBQUs1QixDQUFDLEdBQUdqTSxNQUFNLENBQUNLLE1BQVAsR0FBZ0IsQ0FBekIsRUFBNEI0TCxDQUFDLElBQUksQ0FBakMsRUFBb0NBLENBQUMsRUFBckMsRUFBeUM7QUFDckMsWUFBTTdJLFFBQVEsR0FBR0osSUFBSSxDQUFDMkUsbUJBQUwsQ0FBeUIzSCxNQUFNLENBQUNpTSxDQUFELENBQU4sQ0FBVTlMLEtBQVYsRUFBekIsQ0FBakI7O0FBQ0EsVUFBSSxDQUFDaUQsUUFBTCxFQUFlO0FBQ1g7QUFDQTtBQUNBO0FBQ0FyRSxRQUFBQSxPQUFPLENBQUM0TCxJQUFSLENBQ0ssU0FBUTNLLE1BQU0sQ0FBQ2lNLENBQUQsQ0FBTixDQUFVOUwsS0FBVixFQUFrQixZQUFXNkMsSUFBSSxDQUFDcUMsTUFBTyxZQUFsRCxHQUNDLGlDQUZMO0FBSUE7QUFDSDs7QUFDRCxZQUFNeUksbUJBQW1CLEdBQ2pCMUssUUFBUSxDQUFDMkssUUFBVCxDQUFrQnJPLHFCQUFjRSxRQUFoQyxFQUEwQ29PLFNBQTFDLENBQW9EOUosTUFBcEQsQ0FEUjtBQUVBMkosTUFBQUEsY0FBYyxHQUFHQyxtQkFBbUIsR0FBR0EsbUJBQW1CLENBQUNHLFVBQXZCLEdBQW9DLE9BQXhFO0FBQ0EsWUFBTUMsY0FBYyxHQUFHOUssUUFBUSxDQUFDeUUsU0FBVCxFQUF2Qjs7QUFDQSxXQUFLLElBQUlzRyxDQUFDLEdBQUdELGNBQWMsQ0FBQzdOLE1BQWYsR0FBd0IsQ0FBckMsRUFBd0M4TixDQUFDLElBQUksQ0FBN0MsRUFBZ0RBLENBQUMsRUFBakQsRUFBcUQ7QUFDakQsY0FBTXhMLEtBQUssR0FBR3VMLGNBQWMsQ0FBQ0MsQ0FBRCxDQUE1Qjs7QUFDQSxZQUFJeEwsS0FBSyxDQUFDeEMsS0FBTixPQUFrQkgsTUFBTSxDQUFDaU0sQ0FBRCxDQUFOLENBQVU5TCxLQUFWLEVBQXRCLEVBQXlDO0FBQ3JDO0FBQ0gsU0FGRCxNQUVPLElBQUl3QyxLQUFLLENBQUN5TCxXQUFOLE9BQXdCbEssTUFBeEIsSUFDSnZCLEtBQUssQ0FBQ3NDLE9BQU4sT0FBb0IsZUFEcEIsRUFDcUM7QUFDeEMsZ0JBQU1vSixXQUFXLEdBQUcxTCxLQUFLLENBQUMyTCxjQUFOLEVBQXBCO0FBQ0FULFVBQUFBLGNBQWMsR0FBR1EsV0FBVyxDQUFDSixVQUFaLElBQTBCLE9BQTNDO0FBQ0g7QUFDSjs7QUFDRDtBQUNILEtBMUN3QixDQTRDekI7QUFDQTs7O0FBQ0EsV0FBT2hDLENBQUMsSUFBSSxDQUFaLEVBQWVBLENBQUMsRUFBaEIsRUFBb0I7QUFDaEIsWUFBTXRKLEtBQUssR0FBRzNDLE1BQU0sQ0FBQ2lNLENBQUQsQ0FBcEI7O0FBQ0EsVUFBSXRKLEtBQUssQ0FBQ3lMLFdBQU4sT0FBd0JsSyxNQUF4QixJQUNHdkIsS0FBSyxDQUFDc0MsT0FBTixPQUFvQixlQUQzQixFQUM0QztBQUN4QyxjQUFNb0osV0FBVyxHQUFHMUwsS0FBSyxDQUFDMkwsY0FBTixFQUFwQjtBQUNBVCxRQUFBQSxjQUFjLEdBQUdRLFdBQVcsQ0FBQ0osVUFBWixJQUEwQixPQUEzQztBQUNILE9BSkQsTUFJTyxJQUFJSixjQUFjLEtBQUssT0FBbkIsS0FDQ2xMLEtBQUssQ0FBQzRMLG1CQUFOLE1BQStCNUwsS0FBSyxDQUFDNkwsZ0JBQU4sRUFEaEMsQ0FBSixFQUMrRDtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQU92QyxDQUFDLEdBQUcsQ0FBWDtBQUNIO0FBQ0o7O0FBQ0QsV0FBTyxDQUFQO0FBQ0g7O0FBRURoRyxFQUFBQSxnQkFBZ0IsQ0FBQ3dJLElBQUQsRUFBTztBQUNuQixTQUFLLElBQUl4QyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEtBQUtsTSxLQUFMLENBQVdDLE1BQVgsQ0FBa0JLLE1BQXRDLEVBQThDLEVBQUU0TCxDQUFoRCxFQUFtRDtBQUMvQyxVQUFJd0MsSUFBSSxJQUFJLEtBQUsxTyxLQUFMLENBQVdDLE1BQVgsQ0FBa0JpTSxDQUFsQixFQUFxQjlMLEtBQXJCLEVBQVosRUFBMEM7QUFDdEMsZUFBTzhMLENBQVA7QUFDSDtBQUNKOztBQUNELFdBQU8sSUFBUDtBQUNIOztBQUVEOUYsRUFBQUEsMkJBQTJCLENBQUN1SSxJQUFELEVBQU87QUFDOUJBLElBQUFBLElBQUksR0FBR0EsSUFBSSxJQUFJLEVBQWY7QUFDQSxVQUFNdEksU0FBUyxHQUFHc0ksSUFBSSxDQUFDdEksU0FBTCxJQUFrQixLQUFwQztBQUNBLFVBQU1nQixZQUFZLEdBQUdzSCxJQUFJLENBQUN0SCxZQUFMLElBQXFCLEtBQTFDO0FBRUEsVUFBTXVILFlBQVksR0FBRyxLQUFLOUwsYUFBTCxDQUFtQkMsT0FBeEM7QUFDQSxRQUFJLENBQUM2TCxZQUFMLEVBQW1CLE9BQU8sSUFBUDs7QUFFbkIsVUFBTUMsZ0JBQWdCLEdBQUdDLGtCQUFTQyxXQUFULENBQXFCSCxZQUFyQixDQUF6Qjs7QUFDQSxRQUFJLENBQUNDLGdCQUFMLEVBQXVCLE9BQU8sSUFBUCxDQVRPLENBU007O0FBQ3BDLFVBQU1HLFdBQVcsR0FBR0gsZ0JBQWdCLENBQUNJLHFCQUFqQixFQUFwQjs7QUFDQSxVQUFNbEwsUUFBUSxHQUFHQyxpQ0FBZ0JDLEdBQWhCLEdBQXNCQyxXQUF0QixDQUFrQ0MsTUFBbkQ7O0FBRUEsVUFBTStLLFlBQVksR0FBSUMsSUFBRCxJQUFVO0FBQzNCLFVBQUlBLElBQUosRUFBVTtBQUNOLGNBQU1DLFlBQVksR0FBR0QsSUFBSSxDQUFDRixxQkFBTCxFQUFyQjs7QUFDQSxZQUFLNUgsWUFBWSxJQUFJK0gsWUFBWSxDQUFDQyxHQUFiLEdBQW1CTCxXQUFXLENBQUNNLE1BQWhELElBQ0MsQ0FBQ2pJLFlBQUQsSUFBaUIrSCxZQUFZLENBQUNFLE1BQWIsR0FBc0JOLFdBQVcsQ0FBQ00sTUFEeEQsRUFDaUU7QUFDN0QsaUJBQU8sSUFBUDtBQUNIO0FBQ0o7O0FBQ0QsYUFBTyxLQUFQO0FBQ0gsS0FURCxDQWI4QixDQXdCOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsUUFBSUMsMkJBQTJCLEdBQUcsQ0FBbEMsQ0E3QjhCLENBOEI5QjtBQUNBOztBQUNBLFNBQUssSUFBSXJELENBQUMsR0FBRyxLQUFLbE0sS0FBTCxDQUFXVSxVQUFYLENBQXNCSixNQUF0QixHQUErQixDQUE1QyxFQUErQzRMLENBQUMsSUFBSSxDQUFwRCxFQUF1RCxFQUFFQSxDQUF6RCxFQUE0RDtBQUN4RCxZQUFNL0wsRUFBRSxHQUFHLEtBQUtILEtBQUwsQ0FBV1UsVUFBWCxDQUFzQndMLENBQXRCLENBQVg7QUFFQSxZQUFNaUQsSUFBSSxHQUFHUCxZQUFZLENBQUNZLGlCQUFiLENBQStCclAsRUFBRSxDQUFDQyxLQUFILEVBQS9CLENBQWI7QUFDQSxZQUFNcVAsUUFBUSxHQUFHUCxZQUFZLENBQUNDLElBQUQsQ0FBN0IsQ0FKd0QsQ0FNeEQ7QUFDQTtBQUNBOztBQUNBLFVBQUlNLFFBQVEsSUFBSUYsMkJBQTJCLEtBQUssQ0FBaEQsRUFBbUQ7QUFDL0MsZUFBT3JELENBQUMsR0FBR3FELDJCQUFYO0FBQ0g7O0FBQ0QsVUFBSUosSUFBSSxJQUFJLENBQUNNLFFBQWIsRUFBdUI7QUFDbkI7QUFDQUYsUUFBQUEsMkJBQTJCLEdBQUcsQ0FBOUI7QUFDSDs7QUFFRCxZQUFNRyxZQUFZLEdBQUcsQ0FBQyxDQUFDdlAsRUFBRSxDQUFDd1AsTUFBTCxJQUFlO0FBQy9CdEosTUFBQUEsU0FBUyxJQUFJbEcsRUFBRSxDQUFDaUUsTUFBaEIsSUFBMEJqRSxFQUFFLENBQUNpRSxNQUFILENBQVVELE1BQVYsSUFBb0JKLFFBRG5ELENBakJ3RCxDQWtCUTs7QUFDaEUsWUFBTTZMLGFBQWEsR0FBRyxDQUFDLGlDQUFpQnpQLEVBQWpCLENBQUQsSUFBeUIsOEJBQWdCQSxFQUFoQixDQUEvQzs7QUFFQSxVQUFJeVAsYUFBYSxJQUFJLENBQUNULElBQXRCLEVBQTRCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSSxDQUFDTyxZQUFELElBQWtCQSxZQUFZLElBQUlILDJCQUEyQixLQUFLLENBQXRFLEVBQTBFO0FBQ3RFLFlBQUVBLDJCQUFGO0FBQ0g7O0FBQ0Q7QUFDSDs7QUFFRCxVQUFJRyxZQUFKLEVBQWtCO0FBQ2Q7QUFDSDs7QUFFRCxVQUFJRCxRQUFKLEVBQWM7QUFDVixlQUFPdkQsQ0FBUDtBQUNIO0FBQ0o7O0FBRUQsV0FBTyxJQUFQO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNJbEcsRUFBQUEsc0JBQXNCLENBQUM2SixpQkFBRCxFQUFvQjtBQUN0QyxVQUFNckUsTUFBTSxHQUFHeEgsaUNBQWdCQyxHQUFoQixFQUFmLENBRHNDLENBRXRDOzs7QUFDQSxRQUFJdUgsTUFBTSxJQUFJLElBQWQsRUFBb0I7QUFDaEIsYUFBTyxJQUFQO0FBQ0g7O0FBRUQsVUFBTXpILFFBQVEsR0FBR3lILE1BQU0sQ0FBQ3RILFdBQVAsQ0FBbUJDLE1BQXBDO0FBQ0EsV0FBTyxLQUFLNUUsS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFBdkIsQ0FBNEI2TSxnQkFBNUIsQ0FBNkMvTCxRQUE3QyxFQUF1RDhMLGlCQUF2RCxDQUFQO0FBQ0g7O0FBRURyTCxFQUFBQSxjQUFjLENBQUMxRSxPQUFELEVBQVVpUSxPQUFWLEVBQW1CQyxlQUFuQixFQUFvQztBQUM5QyxVQUFNMUssTUFBTSxHQUFHLEtBQUsvRixLQUFMLENBQVdnRSxXQUFYLENBQXVCTixJQUF2QixDQUE0QnFDLE1BQTNDLENBRDhDLENBRzlDO0FBQ0E7O0FBQ0EsUUFBSXhGLE9BQU8sS0FBSyxLQUFLRSxLQUFMLENBQVcwRSxpQkFBM0IsRUFBOEM7QUFDMUM7QUFDSCxLQVA2QyxDQVM5QztBQUNBOzs7QUFDQXZGLElBQUFBLGFBQWEsQ0FBQzZJLG1CQUFkLENBQWtDMUMsTUFBbEMsSUFBNEN5SyxPQUE1Qzs7QUFFQSxRQUFJQyxlQUFKLEVBQXFCO0FBQ2pCO0FBQ0gsS0FmNkMsQ0FpQjlDO0FBQ0E7QUFDQTs7O0FBQ0EsU0FBS25QLFFBQUwsQ0FBYztBQUNWNkQsTUFBQUEsaUJBQWlCLEVBQUU1RTtBQURULEtBQWQsRUFFRyxLQUFLUCxLQUFMLENBQVdxRixtQkFGZDtBQUdIOztBQUVEekQsRUFBQUEsZUFBZSxHQUFHO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQU8sQ0FBQyxLQUFLbkIsS0FBTCxDQUFXQyxNQUFYLENBQWtCZ1EsSUFBbEIsQ0FBd0JuTyxDQUFELElBQU87QUFDbEMsYUFBT0EsQ0FBQyxDQUFDMk0sZ0JBQUYsRUFBUDtBQUNILEtBRk8sQ0FBUjtBQUdIOztBQUlEeUIsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsWUFBWSxHQUFHcEQsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHlCQUFqQixDQUFyQjtBQUNBLFVBQU1vRCxNQUFNLEdBQUdyRCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsa0JBQWpCLENBQWYsQ0FGSyxDQUlMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsUUFBSSxLQUFLaE4sS0FBTCxDQUFXZ0osZUFBZixFQUFnQztBQUM1QiwwQkFDSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0ksNkJBQUMsTUFBRCxPQURKLENBREo7QUFLSDs7QUFFRCxRQUFJLEtBQUtoSixLQUFMLENBQVdDLE1BQVgsQ0FBa0JLLE1BQWxCLElBQTRCLENBQTVCLElBQWlDLENBQUMsS0FBS04sS0FBTCxDQUFXaUosZUFBN0MsSUFBZ0UsS0FBSzFKLEtBQUwsQ0FBVzhRLEtBQS9FLEVBQXNGO0FBQ2xGLDBCQUNJO0FBQUssUUFBQSxTQUFTLEVBQUUsS0FBSzlRLEtBQUwsQ0FBVytRLFNBQVgsR0FBdUI7QUFBdkMsc0JBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQW9DLEtBQUsvUSxLQUFMLENBQVc4USxLQUEvQyxDQURKLENBREo7QUFLSCxLQTdCSSxDQStCTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxVQUFNRSxZQUFZLEdBQUcsQ0FBQyxLQUFLaFEsZUFBTCxDQUFxQmdCLFdBQXJCLENBQWlDNUIscUJBQWNFLFFBQS9DLENBQXRCLENBdkNLLENBeUNMO0FBQ0E7O0FBQ0EsVUFBTXNKLGlCQUFpQixHQUNuQixLQUFLbkosS0FBTCxDQUFXbUosaUJBQVgsSUFDQSxDQUFDLFVBQUQsRUFBYSxTQUFiLEVBQXdCcUgsUUFBeEIsQ0FBaUMsS0FBS3hRLEtBQUwsQ0FBV3dGLGVBQTVDLENBRko7QUFJQSxVQUFNdkYsTUFBTSxHQUFHLEtBQUtELEtBQUwsQ0FBV1csc0JBQVgsR0FDUCxLQUFLWCxLQUFMLENBQVdDLE1BQVgsQ0FBa0J3USxLQUFsQixDQUF3QixLQUFLelEsS0FBTCxDQUFXVyxzQkFBbkMsQ0FETyxHQUVQLEtBQUtYLEtBQUwsQ0FBV0MsTUFGbkI7QUFHQSx3QkFDSSw2QkFBQyxZQUFEO0FBQ0ksTUFBQSxHQUFHLEVBQUUsS0FBSzZDLGFBRGQ7QUFFSSxNQUFBLElBQUksRUFBRSxLQUFLdkQsS0FBTCxDQUFXZ0UsV0FBWCxDQUF1Qk4sSUFGakM7QUFHSSxNQUFBLGdCQUFnQixFQUFFLEtBQUsxRCxLQUFMLENBQVdtUixnQkFIakM7QUFJSSxNQUFBLE1BQU0sRUFBRSxLQUFLblIsS0FBTCxDQUFXb1IsTUFKdkI7QUFLSSxNQUFBLGNBQWMsRUFBRSxLQUFLM1EsS0FBTCxDQUFXa0osY0FML0I7QUFNSSxNQUFBLGlCQUFpQixFQUFFQyxpQkFOdkI7QUFPSSxNQUFBLE1BQU0sRUFBRWxKLE1BUFo7QUFRSSxNQUFBLGtCQUFrQixFQUFFLEtBQUtWLEtBQUwsQ0FBV3FSLGtCQVJuQztBQVNJLE1BQUEsaUJBQWlCLEVBQUUsS0FBSzVRLEtBQUwsQ0FBVzBFLGlCQVRsQztBQVVJLE1BQUEsaUJBQWlCLEVBQUUsS0FBSzFFLEtBQUwsQ0FBV21DLGlCQVZsQztBQVdJLE1BQUEsMEJBQTBCLEVBQUUsS0FBS25DLEtBQUwsQ0FBV2lKLGVBWDNDO0FBWUksTUFBQSxjQUFjLEVBQUUsS0FBSzFKLEtBQUwsQ0FBV3NSLGNBWi9CO0FBYUksTUFBQSxnQkFBZ0IsRUFBRSxLQUFLdFIsS0FBTCxDQUFXdVIsZ0JBYmpDO0FBY0ksTUFBQSxTQUFTLEVBQUU5TSxpQ0FBZ0JDLEdBQWhCLEdBQXNCQyxXQUF0QixDQUFrQ0MsTUFkakQ7QUFlSSxNQUFBLFlBQVksRUFBRW9NLFlBZmxCO0FBZ0JJLE1BQUEsUUFBUSxFQUFFLEtBQUtRLG1CQWhCbkI7QUFpQkksTUFBQSxhQUFhLEVBQUUsS0FBS0Msd0JBakJ4QjtBQWtCSSxNQUFBLGVBQWUsRUFBRSxLQUFLQywwQkFsQjFCO0FBbUJJLE1BQUEsWUFBWSxFQUFFLEtBQUtqUixLQUFMLENBQVdxSixZQW5CN0I7QUFvQkksTUFBQSxvQkFBb0IsRUFBRSxLQUFLckosS0FBTCxDQUFXc0osb0JBcEJyQztBQXFCSSxNQUFBLFNBQVMsRUFBRSxLQUFLL0osS0FBTCxDQUFXK1EsU0FyQjFCO0FBc0JJLE1BQUEsU0FBUyxFQUFFLEtBQUsvUSxLQUFMLENBQVcyUixTQXRCMUI7QUF1QkksTUFBQSxjQUFjLEVBQUUsS0FBSzNSLEtBQUwsQ0FBVzRSLGNBdkIvQjtBQXdCSSxNQUFBLG9CQUFvQixFQUFFLEtBQUt2SSxvQkF4Qi9CO0FBeUJJLE1BQUEsU0FBUyxFQUFFLEtBQUs1SSxLQUFMLENBQVcyQyxTQXpCMUI7QUEwQkksTUFBQSxhQUFhLEVBQUUsS0FBS3BELEtBQUwsQ0FBVzZSLGFBMUI5QjtBQTJCSSxNQUFBLFlBQVksRUFBRSxLQUFLN1IsS0FBTCxDQUFXOFIsWUEzQjdCO0FBNEJJLE1BQUEsV0FBVyxFQUFFNUwsdUJBQWNDLFFBQWQsQ0FBdUI0TCxxQkFBVUMsS0FBakM7QUE1QmpCLE1BREo7QUFnQ0g7O0FBaDNDdUM7OzhCQUF0Q3BTLGEsZUFDaUI7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBb0UsRUFBQUEsV0FBVyxFQUFFaU8sbUJBQVVDLE1BQVYsQ0FBaUJDLFVBTGY7QUFPZlosRUFBQUEsZ0JBQWdCLEVBQUVVLG1CQUFVRyxJQVBiO0FBUWY7QUFDQWhNLEVBQUFBLGtCQUFrQixFQUFFNkwsbUJBQVVHLElBVGY7QUFVZjNQLEVBQUFBLGlCQUFpQixFQUFFd1AsbUJBQVVHLElBVmQ7QUFZZjtBQUNBaEIsRUFBQUEsTUFBTSxFQUFFYSxtQkFBVUcsSUFiSDtBQWVmO0FBQ0E7QUFDQWYsRUFBQUEsa0JBQWtCLEVBQUVZLG1CQUFVSSxNQWpCZjtBQW1CZjtBQUNBO0FBQ0E5UixFQUFBQSxPQUFPLEVBQUUwUixtQkFBVUksTUFyQko7QUF1QmY7QUFDQTtBQUNBO0FBQ0F2RixFQUFBQSxnQkFBZ0IsRUFBRW1GLG1CQUFVSyxNQTFCYjtBQTRCZjtBQUNBaEIsRUFBQUEsY0FBYyxFQUFFVyxtQkFBVUcsSUE3Qlg7QUErQmY7QUFDQTVQLEVBQUFBLFFBQVEsRUFBRXlQLG1CQUFVTSxJQWhDTDtBQWtDZjtBQUNBbE4sRUFBQUEsbUJBQW1CLEVBQUU0TSxtQkFBVU0sSUFuQ2hCO0FBcUNmO0FBQ0E7QUFDQTdRLEVBQUFBLG1CQUFtQixFQUFFdVEsbUJBQVVNLElBdkNoQjtBQXlDZjtBQUNBcEYsRUFBQUEsV0FBVyxFQUFFOEUsbUJBQVVLLE1BMUNSO0FBNENmO0FBQ0F2QixFQUFBQSxTQUFTLEVBQUVrQixtQkFBVUksTUE3Q047QUErQ2Y7QUFDQVYsRUFBQUEsU0FBUyxFQUFFTSxtQkFBVUksTUFoRE47QUFrRGY7QUFDQXZCLEVBQUFBLEtBQUssRUFBRW1CLG1CQUFVckMsSUFuREY7QUFxRGY7QUFDQWlDLEVBQUFBLGFBQWEsRUFBRUksbUJBQVVHLElBdERWO0FBd0RmO0FBQ0FOLEVBQUFBLFlBQVksRUFBRUcsbUJBQVVHO0FBekRULEM7OEJBRGpCeFMsYSx5QkE4RDJCLEU7OEJBOUQzQkEsYSxrQkFnRW9CO0FBQ2xCO0FBQ0E7QUFDQXVOLEVBQUFBLFdBQVcsRUFBRXFGLE1BQU0sQ0FBQ0MsU0FIRjtBQUlsQjFCLEVBQUFBLFNBQVMsRUFBRTtBQUpPLEM7ZUFtekNYblIsYSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOS0yMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBSZWFjdCwge2NyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gXCJyZWFjdC1kb21cIjtcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge0V2ZW50VGltZWxpbmV9IGZyb20gXCJtYXRyaXgtanMtc2RrXCI7XG5pbXBvcnQgKiBhcyBNYXRyaXggZnJvbSBcIm1hdHJpeC1qcy1zZGtcIjtcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBPYmplY3RVdGlscyBmcm9tIFwiLi4vLi4vT2JqZWN0VXRpbHNcIjtcbmltcG9ydCBVc2VyQWN0aXZpdHkgZnJvbSBcIi4uLy4uL1VzZXJBY3Rpdml0eVwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uL2luZGV4XCI7XG5pbXBvcnQgeyBLZXkgfSBmcm9tICcuLi8uLi9LZXlib2FyZCc7XG5pbXBvcnQgVGltZXIgZnJvbSAnLi4vLi4vdXRpbHMvVGltZXInO1xuaW1wb3J0IHNob3VsZEhpZGVFdmVudCBmcm9tICcuLi8uLi9zaG91bGRIaWRlRXZlbnQnO1xuaW1wb3J0IEVkaXRvclN0YXRlVHJhbnNmZXIgZnJvbSAnLi4vLi4vdXRpbHMvRWRpdG9yU3RhdGVUcmFuc2Zlcic7XG5pbXBvcnQge2hhdmVUaWxlRm9yRXZlbnR9IGZyb20gXCIuLi92aWV3cy9yb29tcy9FdmVudFRpbGVcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5cbmNvbnN0IFBBR0lOQVRFX1NJWkUgPSAyMDtcbmNvbnN0IElOSVRJQUxfU0laRSA9IDIwO1xuY29uc3QgUkVBRF9SRUNFSVBUX0lOVEVSVkFMX01TID0gNTAwO1xuXG5jb25zdCBERUJVRyA9IGZhbHNlO1xuXG5sZXQgZGVidWdsb2cgPSBmdW5jdGlvbigpIHt9O1xuaWYgKERFQlVHKSB7XG4gICAgLy8gdXNpbmcgYmluZCBtZWFucyB0aGF0IHdlIGdldCB0byBrZWVwIHVzZWZ1bCBsaW5lIG51bWJlcnMgaW4gdGhlIGNvbnNvbGVcbiAgICBkZWJ1Z2xvZyA9IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7XG59XG5cbi8qXG4gKiBDb21wb25lbnQgd2hpY2ggc2hvd3MgdGhlIGV2ZW50IHRpbWVsaW5lIGluIGEgcm9vbSB2aWV3LlxuICpcbiAqIEFsc28gcmVzcG9uc2libGUgZm9yIGhhbmRsaW5nIGFuZCBzZW5kaW5nIHJlYWQgcmVjZWlwdHMuXG4gKi9cbmNsYXNzIFRpbWVsaW5lUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8vIFRoZSBqcy1zZGsgRXZlbnRUaW1lbGluZVNldCBvYmplY3QgZm9yIHRoZSB0aW1lbGluZSBzZXF1ZW5jZSB3ZSBhcmVcbiAgICAgICAgLy8gcmVwcmVzZW50aW5nLiAgVGhpcyBtYXkgb3IgbWF5IG5vdCBoYXZlIGEgcm9vbSwgZGVwZW5kaW5nIG9uIHdoYXQgaXQnc1xuICAgICAgICAvLyBhIHRpbWVsaW5lIHJlcHJlc2VudGluZy4gIElmIGl0IGhhcyBhIHJvb20sIHdlIG1haW50YWluIFJScyBldGMgZm9yXG4gICAgICAgIC8vIHRoYXQgcm9vbS5cbiAgICAgICAgdGltZWxpbmVTZXQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgICAgICBzaG93UmVhZFJlY2VpcHRzOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgLy8gRW5hYmxlIG1hbmFnaW5nIFJScyBhbmQgUk1zLiBUaGVzZSByZXF1aXJlIHRoZSB0aW1lbGluZVNldCB0byBoYXZlIGEgcm9vbS5cbiAgICAgICAgbWFuYWdlUmVhZFJlY2VpcHRzOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgbWFuYWdlUmVhZE1hcmtlcnM6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIHRydWUgdG8gZ2l2ZSB0aGUgY29tcG9uZW50IGEgJ2Rpc3BsYXk6IG5vbmUnIHN0eWxlLlxuICAgICAgICBoaWRkZW46IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIElEIG9mIGFuIGV2ZW50IHRvIGhpZ2hsaWdodC4gSWYgdW5kZWZpbmVkLCBubyBldmVudCB3aWxsIGJlIGhpZ2hsaWdodGVkLlxuICAgICAgICAvLyB0eXBpY2FsbHkgdGhpcyB3aWxsIGJlIGVpdGhlciAnZXZlbnRJZCcgb3IgdW5kZWZpbmVkLlxuICAgICAgICBoaWdobGlnaHRlZEV2ZW50SWQ6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLy8gaWQgb2YgYW4gZXZlbnQgdG8ganVtcCB0by4gSWYgbm90IGdpdmVuLCB3aWxsIGdvIHRvIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIGxpdmUgdGltZWxpbmUuXG4gICAgICAgIGV2ZW50SWQ6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLy8gd2hlcmUgdG8gcG9zaXRpb24gdGhlIGV2ZW50IGdpdmVuIGJ5IGV2ZW50SWQsIGluIHBpeGVscyBmcm9tIHRoZVxuICAgICAgICAvLyBib3R0b20gb2YgdGhlIHZpZXdwb3J0LiBJZiBub3QgZ2l2ZW4sIHdpbGwgdHJ5IHRvIHB1dCB0aGUgZXZlbnRcbiAgICAgICAgLy8gaGFsZiB3YXkgZG93biB0aGUgdmlld3BvcnQuXG4gICAgICAgIGV2ZW50UGl4ZWxPZmZzZXQ6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgICAgICAgLy8gU2hvdWxkIHdlIHNob3cgVVJMIFByZXZpZXdzXG4gICAgICAgIHNob3dVcmxQcmV2aWV3OiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGUgcGFuZWwgaXMgc2Nyb2xsZWQuXG4gICAgICAgIG9uU2Nyb2xsOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGUgcmVhZC11cC10byBtYXJrIGlzIHVwZGF0ZWQuXG4gICAgICAgIG9uUmVhZE1hcmtlclVwZGF0ZWQ6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIC8vIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHdlIHdpc2ggdG8gcGFnaW5hdGUgdGhlIHRpbWVsaW5lXG4gICAgICAgIC8vIHdpbmRvdy5cbiAgICAgICAgb25QYWdpbmF0aW9uUmVxdWVzdDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLy8gbWF4aW11bSBudW1iZXIgb2YgZXZlbnRzIHRvIHNob3cgaW4gYSB0aW1lbGluZVxuICAgICAgICB0aW1lbGluZUNhcDogUHJvcFR5cGVzLm51bWJlcixcblxuICAgICAgICAvLyBjbGFzc25hbWUgdG8gdXNlIGZvciB0aGUgbWVzc2FnZXBhbmVsXG4gICAgICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcblxuICAgICAgICAvLyBzaGFwZSBwcm9wZXJ0eSB0byBiZSBwYXNzZWQgdG8gRXZlbnRUaWxlc1xuICAgICAgICB0aWxlU2hhcGU6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLy8gcGxhY2Vob2xkZXIgdG8gdXNlIGlmIHRoZSB0aW1lbGluZSBpcyBlbXB0eVxuICAgICAgICBlbXB0eTogUHJvcFR5cGVzLm5vZGUsXG5cbiAgICAgICAgLy8gd2hldGhlciB0byBzaG93IHJlYWN0aW9ucyBmb3IgYW4gZXZlbnRcbiAgICAgICAgc2hvd1JlYWN0aW9uczogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLy8gd2hldGhlciB0byB1c2UgdGhlIGlyYyBsYXlvdXRcbiAgICAgICAgdXNlSVJDTGF5b3V0OiBQcm9wVHlwZXMuYm9vbCxcbiAgICB9XG5cbiAgICAvLyBhIG1hcCBmcm9tIHJvb20gaWQgdG8gcmVhZCBtYXJrZXIgZXZlbnQgdGltZXN0YW1wXG4gICAgc3RhdGljIHJvb21SZWFkTWFya2VyVHNNYXAgPSB7fTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIC8vIEJ5IGRlZmF1bHQsIGRpc2FibGUgdGhlIHRpbWVsaW5lQ2FwIGluIGZhdm91ciBvZiB1bnBhZ2luYXRpbmcgYmFzZWQgb25cbiAgICAgICAgLy8gZXZlbnQgdGlsZSBoZWlnaHRzLiAoU2VlIF91bnBhZ2luYXRlRXZlbnRzKVxuICAgICAgICB0aW1lbGluZUNhcDogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgY2xhc3NOYW1lOiAnbXhfUm9vbVZpZXdfbWVzc2FnZVBhbmVsJyxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGRlYnVnbG9nKFwiVGltZWxpbmVQYW5lbDogbW91bnRpbmdcIik7XG5cbiAgICAgICAgdGhpcy5sYXN0UlJTZW50RXZlbnRJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5sYXN0Uk1TZW50RXZlbnRJZCA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLl9tZXNzYWdlUGFuZWwgPSBjcmVhdGVSZWYoKTtcblxuICAgICAgICAvLyBYWFg6IHdlIGNvdWxkIHRyYWNrIFJNIHBlciBUaW1lbGluZVNldCByYXRoZXIgdGhhbiBwZXIgUm9vbS5cbiAgICAgICAgLy8gYnV0IGZvciBub3cgd2UganVzdCBkbyBpdCBwZXIgcm9vbSBmb3Igc2ltcGxpY2l0eS5cbiAgICAgICAgbGV0IGluaXRpYWxSZWFkTWFya2VyID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlYWRtYXJrZXIgPSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20uZ2V0QWNjb3VudERhdGEoJ20uZnVsbHlfcmVhZCcpO1xuICAgICAgICAgICAgaWYgKHJlYWRtYXJrZXIpIHtcbiAgICAgICAgICAgICAgICBpbml0aWFsUmVhZE1hcmtlciA9IHJlYWRtYXJrZXIuZ2V0Q29udGVudCgpLmV2ZW50X2lkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbml0aWFsUmVhZE1hcmtlciA9IHRoaXMuX2dldEN1cnJlbnRSZWFkUmVjZWlwdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGV2ZW50czogW10sXG4gICAgICAgICAgICBsaXZlRXZlbnRzOiBbXSxcbiAgICAgICAgICAgIHRpbWVsaW5lTG9hZGluZzogdHJ1ZSwgLy8gdHJhY2sgd2hldGhlciBvdXIgcm9vbSB0aW1lbGluZSBpcyBsb2FkaW5nXG5cbiAgICAgICAgICAgIC8vIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgZXZlbnQgdGhhdCBpcyB0byBiZSBzaG93blxuICAgICAgICAgICAgZmlyc3RWaXNpYmxlRXZlbnRJbmRleDogMCxcblxuICAgICAgICAgICAgLy8gY2FuQmFja1BhZ2luYXRlID09IGZhbHNlIG1heSBtZWFuOlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICogd2UgaGF2ZW4ndCAoc3VjY2Vzc2Z1bGx5KSBsb2FkZWQgdGhlIHRpbWVsaW5lIHlldCwgb3I6XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gKiB3ZSBoYXZlIGdvdCB0byB0aGUgcG9pbnQgd2hlcmUgdGhlIHJvb20gd2FzIGNyZWF0ZWQsIG9yOlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICogdGhlIHNlcnZlciBpbmRpY2F0ZWQgdGhhdCB0aGVyZSB3ZXJlIG5vIG1vcmUgdmlzaWJsZSBldmVudHNcbiAgICAgICAgICAgIC8vICAobm9ybWFsbHkgaW1wbHlpbmcgd2UgZ290IHRvIHRoZSBzdGFydCBvZiB0aGUgcm9vbSksIG9yOlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICogd2UgZ2F2ZSB1cCBhc2tpbmcgdGhlIHNlcnZlciBmb3IgbW9yZSBldmVudHNcbiAgICAgICAgICAgIGNhbkJhY2tQYWdpbmF0ZTogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIGNhbkZvcndhcmRQYWdpbmF0ZSA9PSBmYWxzZSBtYXkgbWVhbjpcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAqIHdlIGhhdmVuJ3QgKHN1Y2Nlc3NmdWxseSkgbG9hZGVkIHRoZSB0aW1lbGluZSB5ZXRcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAqIHdlIGhhdmUgZ290IHRvIHRoZSBlbmQgb2YgdGltZSBhbmQgYXJlIG5vdyB0cmFja2luZyB0aGUgbGl2ZVxuICAgICAgICAgICAgLy8gICB0aW1lbGluZSwgb3I6XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gKiB0aGUgc2VydmVyIGluZGljYXRlZCB0aGF0IHRoZXJlIHdlcmUgbm8gbW9yZSB2aXNpYmxlIGV2ZW50c1xuICAgICAgICAgICAgLy8gICAobm90IHN1cmUgaWYgdGhpcyBldmVyIGhhcHBlbnMgd2hlbiB3ZSdyZSBub3QgYXQgdGhlIGxpdmVcbiAgICAgICAgICAgIC8vICAgdGltZWxpbmUpLCBvcjpcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAqIHdlIGFyZSBsb29raW5nIGF0IHNvbWUgaGlzdG9yaWNhbCBwb2ludCwgYnV0IGdhdmUgdXAgYXNraW5nXG4gICAgICAgICAgICAvLyAgIHRoZSBzZXJ2ZXIgZm9yIG1vcmUgZXZlbnRzXG4gICAgICAgICAgICBjYW5Gb3J3YXJkUGFnaW5hdGU6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyBzdGFydCB3aXRoIHRoZSByZWFkLW1hcmtlciB2aXNpYmxlLCBzbyB0aGF0IHdlIHNlZSBpdHMgYW5pbWF0ZWRcbiAgICAgICAgICAgIC8vIGRpc2FwcGVhcmFuY2Ugd2hlbiBzd2l0Y2hpbmcgaW50byB0aGUgcm9vbS5cbiAgICAgICAgICAgIHJlYWRNYXJrZXJWaXNpYmxlOiB0cnVlLFxuXG4gICAgICAgICAgICByZWFkTWFya2VyRXZlbnRJZDogaW5pdGlhbFJlYWRNYXJrZXIsXG5cbiAgICAgICAgICAgIGJhY2tQYWdpbmF0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGZvcndhcmRQYWdpbmF0aW5nOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gY2FjaGUgb2YgbWF0cml4Q2xpZW50LmdldFN5bmNTdGF0ZSgpIChidXQgZnJvbSB0aGUgJ3N5bmMnIGV2ZW50KVxuICAgICAgICAgICAgY2xpZW50U3luY1N0YXRlOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0U3luY1N0YXRlKCksXG5cbiAgICAgICAgICAgIC8vIHNob3VsZCB0aGUgZXZlbnQgdGlsZXMgaGF2ZSB0d2VsdmUgaG91ciB0aW1lc1xuICAgICAgICAgICAgaXNUd2VsdmVIb3VyOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzXCIpLFxuXG4gICAgICAgICAgICAvLyBhbHdheXMgc2hvdyB0aW1lc3RhbXBzIG9uIGV2ZW50IHRpbGVzP1xuICAgICAgICAgICAgYWx3YXlzU2hvd1RpbWVzdGFtcHM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhbHdheXNTaG93VGltZXN0YW1wc1wiKSxcblxuICAgICAgICAgICAgLy8gaG93IGxvbmcgdG8gc2hvdyB0aGUgUk0gZm9yIHdoZW4gaXQncyB2aXNpYmxlIGluIHRoZSB3aW5kb3dcbiAgICAgICAgICAgIHJlYWRNYXJrZXJJblZpZXdUaHJlc2hvbGRNczogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInJlYWRNYXJrZXJJblZpZXdUaHJlc2hvbGRNc1wiKSxcblxuICAgICAgICAgICAgLy8gaG93IGxvbmcgdG8gc2hvdyB0aGUgUk0gZm9yIHdoZW4gaXQncyBzY3JvbGxlZCBvZmYtc2NyZWVuXG4gICAgICAgICAgICByZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJyZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXNcIiksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tLnRpbWVsaW5lXCIsIHRoaXMub25Sb29tVGltZWxpbmUpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tLnRpbWVsaW5lUmVzZXRcIiwgdGhpcy5vblJvb21UaW1lbGluZVJlc2V0KTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFwiUm9vbS5yZWRhY3Rpb25cIiwgdGhpcy5vblJvb21SZWRhY3Rpb24pO1xuICAgICAgICAvLyBzYW1lIGV2ZW50IGhhbmRsZXIgYXMgUm9vbS5yZWRhY3Rpb24gYXMgZm9yIGJvdGggd2UganVzdCBkbyBmb3JjZVVwZGF0ZVxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tLnJlZGFjdGlvbkNhbmNlbGxlZFwiLCB0aGlzLm9uUm9vbVJlZGFjdGlvbik7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIlJvb20ucmVjZWlwdFwiLCB0aGlzLm9uUm9vbVJlY2VpcHQpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tLmxvY2FsRWNob1VwZGF0ZWRcIiwgdGhpcy5vbkxvY2FsRWNob1VwZGF0ZWQpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tLmFjY291bnREYXRhXCIsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIkV2ZW50LmRlY3J5cHRlZFwiLCB0aGlzLm9uRXZlbnREZWNyeXB0ZWQpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJFdmVudC5yZXBsYWNlZFwiLCB0aGlzLm9uRXZlbnRSZXBsYWNlZCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcInN5bmNcIiwgdGhpcy5vblN5bmMpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBNb3ZlIGludG8gY29uc3RydWN0b3JcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubWFuYWdlUmVhZFJlY2VpcHRzKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVJlYWRSZWNlaXB0T25Vc2VyQWN0aXZpdHkoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5tYW5hZ2VSZWFkTWFya2Vycykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVSZWFkTWFya2VyT25Vc2VyQWN0aXZpdHkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luaXRUaW1lbGluZSh0aGlzLnByb3BzKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICBpZiAobmV3UHJvcHMudGltZWxpbmVTZXQgIT09IHRoaXMucHJvcHMudGltZWxpbmVTZXQpIHtcbiAgICAgICAgICAgIC8vIHRocm93IG5ldyBFcnJvcihcImNoYW5naW5nIHRpbWVsaW5lU2V0IG9uIGEgVGltZWxpbmVQYW5lbCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuXG4gICAgICAgICAgICAvLyByZWdyZXR0YWJseSwgdGhpcyBkb2VzIGhhcHBlbjsgaW4gcGFydGljdWxhciwgd2hlbiBqb2luaW5nIGFcbiAgICAgICAgICAgIC8vIHJvb20gd2l0aCAvam9pbi4gSW4gdGhhdCBjYXNlLCB0aGVyZSBhcmUgdHdvIFJvb21zIGluXG4gICAgICAgICAgICAvLyBjaXJjdWxhdGlvbiAtIG9uZSB3aGljaCBpcyBjcmVhdGVkIGJ5IHRoZSBNYXRyaXhDbGllbnQuam9pblJvb21cbiAgICAgICAgICAgIC8vIGNhbGwgYW5kIHVzZWQgdG8gY3JlYXRlIHRoZSBSb29tVmlldywgYW5kIGEgc2Vjb25kIHdoaWNoIGlzXG4gICAgICAgICAgICAvLyBjcmVhdGVkIGJ5IHRoZSBzeW5jIGxvb3Agb25jZSB0aGUgcm9vbSBjb21lcyBiYWNrIGRvd24gdGhlIC9zeW5jXG4gICAgICAgICAgICAvLyBwaXBlLiBPbmNlIHRoZSBsYXR0ZXIgaGFwcGVucywgb3VyIHJvb20gaXMgcmVwbGFjZWQgd2l0aCB0aGUgbmV3IG9uZS5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBmb3Igbm93LCBqdXN0IHdhcm4gYWJvdXQgdGhpcy4gQnV0IHdlJ3JlIGdvaW5nIHRvIGVuZCB1cCBwYWdpbmF0aW5nXG4gICAgICAgICAgICAvLyBib3RoIHJvb21zIHNlcGFyYXRlbHksIGFuZCBpdCdzIGFsbCBiYWQuXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJSZXBsYWNpbmcgdGltZWxpbmVTZXQgb24gYSBUaW1lbGluZVBhbmVsIC0gY29uZnVzaW9uIG1heSBlbnN1ZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXdQcm9wcy5ldmVudElkICE9IHRoaXMucHJvcHMuZXZlbnRJZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaW1lbGluZVBhbmVsIHN3aXRjaGluZyB0byBldmVudElkIFwiICsgbmV3UHJvcHMuZXZlbnRJZCArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIiAod2FzIFwiICsgdGhpcy5wcm9wcy5ldmVudElkICsgXCIpXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRUaW1lbGluZShuZXdQcm9wcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgaWYgKCFPYmplY3RVdGlscy5zaGFsbG93RXF1YWwodGhpcy5wcm9wcywgbmV4dFByb3BzKSkge1xuICAgICAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cChcIlRpbWVsaW5lLnNob3VsZENvbXBvbmVudFVwZGF0ZTogcHJvcHMgY2hhbmdlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicHJvcHMgYmVmb3JlOlwiLCB0aGlzLnByb3BzKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInByb3BzIGFmdGVyOlwiLCBuZXh0UHJvcHMpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFPYmplY3RVdGlscy5zaGFsbG93RXF1YWwodGhpcy5zdGF0ZSwgbmV4dFN0YXRlKSkge1xuICAgICAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cChcIlRpbWVsaW5lLnNob3VsZENvbXBvbmVudFVwZGF0ZTogc3RhdGUgY2hhbmdlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3RhdGUgYmVmb3JlOlwiLCB0aGlzLnN0YXRlKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInN0YXRlIGFmdGVyOlwiLCBuZXh0U3RhdGUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvLyBzZXQgYSBib29sZWFuIHRvIHNheSB3ZSd2ZSBiZWVuIHVubW91bnRlZCwgd2hpY2ggYW55IHBlbmRpbmdcbiAgICAgICAgLy8gcHJvbWlzZXMgY2FuIHVzZSB0byB0aHJvdyBhd2F5IHRoZWlyIHJlc3VsdHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIChXZSBjb3VsZCB1c2UgaXNNb3VudGVkLCBidXQgZmFjZWJvb2sgaGF2ZSBkZXByZWNhdGVkIHRoYXQuKVxuICAgICAgICB0aGlzLnVubW91bnRlZCA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLl9yZWFkUmVjZWlwdEFjdGl2aXR5VGltZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlYWRSZWNlaXB0QWN0aXZpdHlUaW1lci5hYm9ydCgpO1xuICAgICAgICAgICAgdGhpcy5fcmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcmVhZE1hcmtlckFjdGl2aXR5VGltZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlYWRNYXJrZXJBY3Rpdml0eVRpbWVyLmFib3J0KCk7XG4gICAgICAgICAgICB0aGlzLl9yZWFkTWFya2VyQWN0aXZpdHlUaW1lciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaWVudCkge1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS50aW1lbGluZVwiLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihcIlJvb20udGltZWxpbmVSZXNldFwiLCB0aGlzLm9uUm9vbVRpbWVsaW5lUmVzZXQpO1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS5yZWRhY3Rpb25cIiwgdGhpcy5vblJvb21SZWRhY3Rpb24pO1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS5yZWRhY3Rpb25DYW5jZWxsZWRcIiwgdGhpcy5vblJvb21SZWRhY3Rpb24pO1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS5yZWNlaXB0XCIsIHRoaXMub25Sb29tUmVjZWlwdCk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJSb29tLmxvY2FsRWNob1VwZGF0ZWRcIiwgdGhpcy5vbkxvY2FsRWNob1VwZGF0ZWQpO1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS5hY2NvdW50RGF0YVwiLCB0aGlzLm9uQWNjb3VudERhdGEpO1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiRXZlbnQuZGVjcnlwdGVkXCIsIHRoaXMub25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJFdmVudC5yZXBsYWNlZFwiLCB0aGlzLm9uRXZlbnRSZXBsYWNlZCk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJzeW5jXCIsIHRoaXMub25TeW5jKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uTWVzc2FnZUxpc3RVbmZpbGxSZXF1ZXN0ID0gKGJhY2t3YXJkcywgc2Nyb2xsVG9rZW4pID0+IHtcbiAgICAgICAgLy8gSWYgYmFja3dhcmRzLCB1bnBhZ2luYXRlIGZyb20gdGhlIGJhY2sgKGkuZS4gdGhlIHN0YXJ0IG9mIHRoZSB0aW1lbGluZSlcbiAgICAgICAgY29uc3QgZGlyID0gYmFja3dhcmRzID8gRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMgOiBFdmVudFRpbWVsaW5lLkZPUldBUkRTO1xuICAgICAgICBkZWJ1Z2xvZyhcIlRpbWVsaW5lUGFuZWw6IHVucGFnaW5hdGluZyBldmVudHMgaW4gZGlyZWN0aW9uXCIsIGRpcik7XG5cbiAgICAgICAgLy8gQWxsIHRpbGVzIGFyZSBpbnNlcnRlZCBieSBNZXNzYWdlUGFuZWwgdG8gaGF2ZSBhIHNjcm9sbFRva2VuID09PSBldmVudElkLCBhbmRcbiAgICAgICAgLy8gdGhpcyBwYXJ0aWN1bGFyIGV2ZW50IHNob3VsZCBiZSB0aGUgZmlyc3Qgb3IgbGFzdCB0byBiZSB1bnBhZ2luYXRlZC5cbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IHNjcm9sbFRva2VuO1xuXG4gICAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMuc3RhdGUuZXZlbnRzLmZpbmRJbmRleChcbiAgICAgICAgICAgIChldikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBldi5nZXRJZCgpID09PSBldmVudElkO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBjb3VudCA9IGJhY2t3YXJkcyA/IG1hcmtlciArIDEgOiB0aGlzLnN0YXRlLmV2ZW50cy5sZW5ndGggLSBtYXJrZXI7XG5cbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgZGVidWdsb2coXCJUaW1lbGluZVBhbmVsOiBVbnBhZ2luYXRpbmdcIiwgY291bnQsIFwiaW4gZGlyZWN0aW9uXCIsIGRpcik7XG4gICAgICAgICAgICB0aGlzLl90aW1lbGluZVdpbmRvdy51bnBhZ2luYXRlKGNvdW50LCBiYWNrd2FyZHMpO1xuXG4gICAgICAgICAgICAvLyBXZSBjYW4gbm93IHBhZ2luYXRlIGluIHRoZSB1bnBhZ2luYXRlZCBkaXJlY3Rpb25cbiAgICAgICAgICAgIGNvbnN0IGNhblBhZ2luYXRlS2V5ID0gKGJhY2t3YXJkcykgPyAnY2FuQmFja1BhZ2luYXRlJyA6ICdjYW5Gb3J3YXJkUGFnaW5hdGUnO1xuICAgICAgICAgICAgY29uc3QgeyBldmVudHMsIGxpdmVFdmVudHMsIGZpcnN0VmlzaWJsZUV2ZW50SW5kZXggfSA9IHRoaXMuX2dldEV2ZW50cygpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgW2NhblBhZ2luYXRlS2V5XTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgbGl2ZUV2ZW50cyxcbiAgICAgICAgICAgICAgICBmaXJzdFZpc2libGVFdmVudEluZGV4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25QYWdpbmF0aW9uUmVxdWVzdCA9ICh0aW1lbGluZVdpbmRvdywgZGlyZWN0aW9uLCBzaXplKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uUGFnaW5hdGlvblJlcXVlc3QpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uUGFnaW5hdGlvblJlcXVlc3QodGltZWxpbmVXaW5kb3csIGRpcmVjdGlvbiwgc2l6ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGltZWxpbmVXaW5kb3cucGFnaW5hdGUoZGlyZWN0aW9uLCBzaXplKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBzZXQgb2ZmIGEgcGFnaW5hdGlvbiByZXF1ZXN0LlxuICAgIG9uTWVzc2FnZUxpc3RGaWxsUmVxdWVzdCA9IGJhY2t3YXJkcyA9PiB7XG4gICAgICAgIGlmICghdGhpcy5fc2hvdWxkUGFnaW5hdGUoKSkgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG5cbiAgICAgICAgY29uc3QgZGlyID0gYmFja3dhcmRzID8gRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMgOiBFdmVudFRpbWVsaW5lLkZPUldBUkRTO1xuICAgICAgICBjb25zdCBjYW5QYWdpbmF0ZUtleSA9IGJhY2t3YXJkcyA/ICdjYW5CYWNrUGFnaW5hdGUnIDogJ2NhbkZvcndhcmRQYWdpbmF0ZSc7XG4gICAgICAgIGNvbnN0IHBhZ2luYXRpbmdLZXkgPSBiYWNrd2FyZHMgPyAnYmFja1BhZ2luYXRpbmcnIDogJ2ZvcndhcmRQYWdpbmF0aW5nJztcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGVbY2FuUGFnaW5hdGVLZXldKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIlRpbWVsaW5lUGFuZWw6IGhhdmUgZ2l2ZW4gdXBcIiwgZGlyLCBcInBhZ2luYXRpbmcgdGhpcyB0aW1lbGluZVwiKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl90aW1lbGluZVdpbmRvdy5jYW5QYWdpbmF0ZShkaXIpKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIlRpbWVsaW5lUGFuZWw6IGNhbid0XCIsIGRpciwgXCJwYWdpbmF0ZSBhbnkgZnVydGhlclwiKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1tjYW5QYWdpbmF0ZUtleV06IGZhbHNlfSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiYWNrd2FyZHMgJiYgdGhpcy5zdGF0ZS5maXJzdFZpc2libGVFdmVudEluZGV4ICE9PSAwKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIlRpbWVsaW5lUGFuZWw6IHdvbid0XCIsIGRpciwgXCJwYWdpbmF0ZSBwYXN0IGZpcnN0IHZpc2libGUgZXZlbnRcIik7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlYnVnbG9nKFwiVGltZWxpbmVQYW5lbDogSW5pdGlhdGluZyBwYWdpbmF0ZTsgYmFja3dhcmRzOlwiK2JhY2t3YXJkcyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1twYWdpbmF0aW5nS2V5XTogdHJ1ZX0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLm9uUGFnaW5hdGlvblJlcXVlc3QodGhpcy5fdGltZWxpbmVXaW5kb3csIGRpciwgUEFHSU5BVEVfU0laRSkudGhlbigocikgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSB7IHJldHVybjsgfVxuXG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIlRpbWVsaW5lUGFuZWw6IHBhZ2luYXRlIGNvbXBsZXRlIGJhY2t3YXJkczpcIitiYWNrd2FyZHMrXCI7IHN1Y2Nlc3M6XCIrcik7XG5cbiAgICAgICAgICAgIGNvbnN0IHsgZXZlbnRzLCBsaXZlRXZlbnRzLCBmaXJzdFZpc2libGVFdmVudEluZGV4IH0gPSB0aGlzLl9nZXRFdmVudHMoKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgICAgICAgICAgICAgIFtwYWdpbmF0aW5nS2V5XTogZmFsc2UsXG4gICAgICAgICAgICAgICAgW2NhblBhZ2luYXRlS2V5XTogcixcbiAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgbGl2ZUV2ZW50cyxcbiAgICAgICAgICAgICAgICBmaXJzdFZpc2libGVFdmVudEluZGV4LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gbW92aW5nIHRoZSB3aW5kb3cgaW4gdGhpcyBkaXJlY3Rpb24gbWF5IG1lYW4gdGhhdCB3ZSBjYW4gbm93XG4gICAgICAgICAgICAvLyBwYWdpbmF0ZSBpbiB0aGUgb3RoZXIgd2hlcmUgd2UgcHJldmlvdXNseSBjb3VsZCBub3QuXG4gICAgICAgICAgICBjb25zdCBvdGhlckRpcmVjdGlvbiA9IGJhY2t3YXJkcyA/IEV2ZW50VGltZWxpbmUuRk9SV0FSRFMgOiBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUztcbiAgICAgICAgICAgIGNvbnN0IGNhblBhZ2luYXRlT3RoZXJXYXlLZXkgPSBiYWNrd2FyZHMgPyAnY2FuRm9yd2FyZFBhZ2luYXRlJyA6ICdjYW5CYWNrUGFnaW5hdGUnO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlW2NhblBhZ2luYXRlT3RoZXJXYXlLZXldICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RpbWVsaW5lV2luZG93LmNhblBhZ2luYXRlKG90aGVyRGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGRlYnVnbG9nKCdUaW1lbGluZVBhbmVsOiBjYW4gbm93Jywgb3RoZXJEaXJlY3Rpb24sICdwYWdpbmF0ZSBhZ2FpbicpO1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlW2NhblBhZ2luYXRlT3RoZXJXYXlLZXldID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRG9uJ3QgcmVzb2x2ZSB1bnRpbCB0aGUgc2V0U3RhdGUgaGFzIGNvbXBsZXRlZDogd2UgbmVlZCB0byBsZXRcbiAgICAgICAgICAgIC8vIHRoZSBjb21wb25lbnQgdXBkYXRlIGJlZm9yZSB3ZSBjb25zaWRlciB0aGUgcGFnaW5hdGlvbiBjb21wbGV0ZWQsXG4gICAgICAgICAgICAvLyBvdGhlcndpc2Ugd2UnbGwgZW5kIHVwIHBhZ2luYXRpbmcgaW4gYWxsIHRoZSBoaXN0b3J5IHRoZSBqcy1zZGtcbiAgICAgICAgICAgIC8vIGhhcyBpbiBtZW1vcnkgYmVjYXVzZSB3ZSBuZXZlciBnYXZlIHRoZSBjb21wb25lbnQgYSBjaGFuY2UgdG8gc2Nyb2xsXG4gICAgICAgICAgICAvLyBpdHNlbGYgaW50byB0aGUgcmlnaHQgcGxhY2VcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgY2FuIGNvbnRpbnVlIHBhZ2luYXRpbmcgaW4gdGhlIGdpdmVuIGRpcmVjdGlvbiBpZjpcbiAgICAgICAgICAgICAgICAgICAgLy8gLSBfdGltZWxpbmVXaW5kb3cucGFnaW5hdGUgc2F5cyB3ZSBjYW5cbiAgICAgICAgICAgICAgICAgICAgLy8gLSB3ZSdyZSBwYWdpbmF0aW5nIGZvcndhcmRzLCBvciB3ZSB3b24ndCBiZSB0cnlpbmcgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gICBwYWdpbmF0ZSBiYWNrd2FyZHMgcGFzdCB0aGUgZmlyc3QgdmlzaWJsZSBldmVudFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHIgJiYgKCFiYWNrd2FyZHMgfHwgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCA9PT0gMCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbk1lc3NhZ2VMaXN0U2Nyb2xsID0gZSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uU2Nyb2xsKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uU2Nyb2xsKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJtUG9zaXRpb24gPSB0aGlzLmdldFJlYWRNYXJrZXJQb3NpdGlvbigpO1xuICAgICAgICAgICAgLy8gd2UgaGlkZSB0aGUgcmVhZCBtYXJrZXIgd2hlbiBpdCBmaXJzdCBjb21lcyBvbnRvIHRoZSBzY3JlZW4sIGJ1dCBpZlxuICAgICAgICAgICAgLy8gaXQgZ29lcyBiYWNrIG9mZiB0aGUgdG9wIG9mIHRoZSBzY3JlZW4gKHByZXN1bWFibHkgYmVjYXVzZSB0aGUgdXNlclxuICAgICAgICAgICAgLy8gY2xpY2tzIG9uIHRoZSAnanVtcCB0byBib3R0b20nIGJ1dHRvbiksIHdlIG5lZWQgdG8gcmUtZW5hYmxlIGl0LlxuICAgICAgICAgICAgaWYgKHJtUG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVhZE1hcmtlclZpc2libGU6IHRydWV9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgcmVhZCBtYXJrZXIgcG9zaXRpb24gZ29lcyBiZXR3ZWVuIDAgYW5kIC0xLzEsXG4gICAgICAgICAgICAvLyAoYW5kIHVzZXIgaXMgYWN0aXZlKSwgc3dpdGNoIHRpbWVvdXRcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXQgPSB0aGlzLl9yZWFkTWFya2VyVGltZW91dChybVBvc2l0aW9uKTtcbiAgICAgICAgICAgIC8vIE5PLU9QIHdoZW4gdGltZW91dCBhbHJlYWR5IGhhcyBzZXQgdG8gdGhlIGdpdmVuIHZhbHVlXG4gICAgICAgICAgICB0aGlzLl9yZWFkTWFya2VyQWN0aXZpdHlUaW1lci5jaGFuZ2VUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uQWN0aW9uID0gcGF5bG9hZCA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ2lnbm9yZV9zdGF0ZV9jaGFuZ2VkJykge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gXCJlZGl0X2V2ZW50XCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVkaXRTdGF0ZSA9IHBheWxvYWQuZXZlbnQgPyBuZXcgRWRpdG9yU3RhdGVUcmFuc2ZlcihwYXlsb2FkLmV2ZW50KSA6IG51bGw7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlZGl0U3RhdGV9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuZXZlbnQgJiYgdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQuc2Nyb2xsVG9FdmVudElmTmVlZGVkKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5ldmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uUm9vbVRpbWVsaW5lID0gKGV2LCByb29tLCB0b1N0YXJ0T2ZUaW1lbGluZSwgcmVtb3ZlZCwgZGF0YSkgPT4ge1xuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciB0aW1lbGluZSBzZXRzXG4gICAgICAgIGlmIChkYXRhLnRpbWVsaW5lLmdldFRpbWVsaW5lU2V0KCkgIT09IHRoaXMucHJvcHMudGltZWxpbmVTZXQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgYW55dGhpbmcgYnV0IHJlYWwtdGltZSB1cGRhdGVzIGF0IHRoZSBlbmQgb2YgdGhlIHJvb206XG4gICAgICAgIC8vIHVwZGF0ZXMgZnJvbSBwYWdpbmF0aW9uIHdpbGwgaGFwcGVuIHdoZW4gdGhlIHBhZ2luYXRlIGNvbXBsZXRlcy5cbiAgICAgICAgaWYgKHRvU3RhcnRPZlRpbWVsaW5lIHx8ICFkYXRhIHx8ICFkYXRhLmxpdmVFdmVudCkgcmV0dXJuO1xuXG4gICAgICAgIGlmICghdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQpIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50LmdldFNjcm9sbFN0YXRlKCkuc3R1Y2tBdEJvdHRvbSkge1xuICAgICAgICAgICAgLy8gd2Ugd29uJ3QgbG9hZCB0aGlzIGV2ZW50IG5vdywgYmVjYXVzZSB3ZSBkb24ndCB3YW50IHRvIHB1c2ggYW55XG4gICAgICAgICAgICAvLyBldmVudHMgb2ZmIHRoZSBvdGhlciBlbmQgb2YgdGhlIHRpbWVsaW5lLiBCdXQgd2UgbmVlZCB0byBub3RlXG4gICAgICAgICAgICAvLyB0aGF0IHdlIGNhbiBub3cgcGFnaW5hdGUuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjYW5Gb3J3YXJkUGFnaW5hdGU6IHRydWV9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRlbGwgdGhlIHRpbWVsaW5lIHdpbmRvdyB0byB0cnkgdG8gYWR2YW5jZSBpdHNlbGYsIGJ1dCBub3QgdG8gbWFrZVxuICAgICAgICAvLyBhbiBodHRwIHJlcXVlc3QgdG8gZG8gc28uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIHdlIGRlbGliZXJhdGVseSBhdm9pZCBnb2luZyB2aWEgdGhlIFNjcm9sbFBhbmVsIGZvciB0aGlzIGNhbGwgLSB0aGVcbiAgICAgICAgLy8gU2Nyb2xsUGFuZWwgbWlnaHQgYWxyZWFkeSBoYXZlIGFuIGFjdGl2ZSBwYWdpbmF0aW9uIHByb21pc2UsIHdoaWNoXG4gICAgICAgIC8vIHdpbGwgZmFpbCwgYnV0IHdvdWxkIHN0b3AgdXMgcGFzc2luZyB0aGUgcGFnaW5hdGlvbiByZXF1ZXN0IHRvIHRoZVxuICAgICAgICAvLyB0aW1lbGluZSB3aW5kb3cuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL3ZlY3Rvci13ZWIvaXNzdWVzLzEwMzVcbiAgICAgICAgdGhpcy5fdGltZWxpbmVXaW5kb3cucGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUywgMSwgZmFsc2UpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSB7IHJldHVybjsgfVxuXG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50cywgbGl2ZUV2ZW50cywgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCB9ID0gdGhpcy5fZ2V0RXZlbnRzKCk7XG4gICAgICAgICAgICBjb25zdCBsYXN0TGl2ZUV2ZW50ID0gbGl2ZUV2ZW50c1tsaXZlRXZlbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkU3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgICAgIGxpdmVFdmVudHMsXG4gICAgICAgICAgICAgICAgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxldCBjYWxsUk1VcGRhdGVkO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHtcbiAgICAgICAgICAgICAgICAvLyB3aGVuIGEgbmV3IGV2ZW50IGFycml2ZXMgd2hlbiB0aGUgdXNlciBpcyBub3Qgd2F0Y2hpbmcgdGhlXG4gICAgICAgICAgICAgICAgLy8gd2luZG93LCBidXQgdGhlIHdpbmRvdyBpcyBpbiBpdHMgYXV0by1zY3JvbGwgbW9kZSwgbWFrZSBzdXJlIHRoZVxuICAgICAgICAgICAgICAgIC8vIHJlYWQgbWFya2VyIGlzIHZpc2libGUuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBXZSBpZ25vcmUgZXZlbnRzIHdlIGhhdmUgc2VudCBvdXJzZWx2ZXM7IHdlIGRvbid0IHdhbnQgdG8gc2VlIHRoZVxuICAgICAgICAgICAgICAgIC8vIHJlYWQtbWFya2VyIHdoZW4gYSByZW1vdGUgZWNobyBvZiBhbiBldmVudCB3ZSBoYXZlIGp1c3Qgc2VudCB0YWtlc1xuICAgICAgICAgICAgICAgIC8vIG1vcmUgdGhhbiB0aGUgdGltZW91dCBvbiB1c2VyQWN0aXZlUmVjZW50bHkuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCBteVVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWQ7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VuZGVyID0gZXYuc2VuZGVyID8gZXYuc2VuZGVyLnVzZXJJZCA6IG51bGw7XG4gICAgICAgICAgICAgICAgY2FsbFJNVXBkYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChzZW5kZXIgIT0gbXlVc2VySWQgJiYgIVVzZXJBY3Rpdml0eS5zaGFyZWRJbnN0YW5jZSgpLnVzZXJBY3RpdmVSZWNlbnRseSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRTdGF0ZS5yZWFkTWFya2VyVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsYXN0TGl2ZUV2ZW50ICYmIHRoaXMuZ2V0UmVhZE1hcmtlclBvc2l0aW9uKCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2Uga25vdyB3ZSdyZSBzdHVja0F0Qm90dG9tLCBzbyB3ZSBjYW4gYWR2YW5jZSB0aGUgUk1cbiAgICAgICAgICAgICAgICAgICAgLy8gaW1tZWRpYXRlbHksIHRvIHNhdmUgYSBsYXRlciByZW5kZXIgY3ljbGVcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRSZWFkTWFya2VyKGxhc3RMaXZlRXZlbnQuZ2V0SWQoKSwgbGFzdExpdmVFdmVudC5nZXRUcygpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFN0YXRlLnJlYWRNYXJrZXJWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRTdGF0ZS5yZWFkTWFya2VyRXZlbnRJZCA9IGxhc3RMaXZlRXZlbnQuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbFJNVXBkYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHVwZGF0ZWRTdGF0ZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50LnVwZGF0ZVRpbWVsaW5lTWluSGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxSTVVwZGF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlYWRNYXJrZXJVcGRhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvblJvb21UaW1lbGluZVJlc2V0ID0gKHJvb20sIHRpbWVsaW5lU2V0KSA9PiB7XG4gICAgICAgIGlmICh0aW1lbGluZVNldCAhPT0gdGhpcy5wcm9wcy50aW1lbGluZVNldCkgcmV0dXJuO1xuXG4gICAgICAgIGlmICh0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudCAmJiB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5pc0F0Qm90dG9tKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRUaW1lbGluZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNhblJlc2V0VGltZWxpbmUgPSAoKSA9PiB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudCAmJiB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5pc0F0Qm90dG9tKCk7XG5cbiAgICBvblJvb21SZWRhY3Rpb24gPSAoZXYsIHJvb20pID0+IHtcbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWdub3JlIGV2ZW50cyBmb3Igb3RoZXIgcm9vbXNcbiAgICAgICAgaWYgKHJvb20gIT09IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIHdlIGNvdWxkIHNraXAgYW4gdXBkYXRlIGlmIHRoZSBldmVudCBpc24ndCBpbiBvdXIgdGltZWxpbmUsXG4gICAgICAgIC8vIGJ1dCB0aGF0J3MgcHJvYmFibHkgYW4gZWFybHkgb3B0aW1pc2F0aW9uLlxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIG9uRXZlbnRSZXBsYWNlZCA9IChyZXBsYWNlZEV2ZW50LCByb29tKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZm9yIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChyb29tICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICAvLyB3ZSBjb3VsZCBza2lwIGFuIHVwZGF0ZSBpZiB0aGUgZXZlbnQgaXNuJ3QgaW4gb3VyIHRpbWVsaW5lLFxuICAgICAgICAvLyBidXQgdGhhdCdzIHByb2JhYmx5IGFuIGVhcmx5IG9wdGltaXNhdGlvbi5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBvblJvb21SZWNlaXB0ID0gKGV2LCByb29tKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZm9yIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChyb29tICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIG9uTG9jYWxFY2hvVXBkYXRlZCA9IChldiwgcm9vbSwgb2xkRXZlbnRJZCkgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciByb29tc1xuICAgICAgICBpZiAocm9vbSAhPT0gdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fcmVsb2FkRXZlbnRzKCk7XG4gICAgfTtcblxuICAgIG9uQWNjb3VudERhdGEgPSAoZXYsIHJvb20pID0+IHtcbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWdub3JlIGV2ZW50cyBmb3Igb3RoZXIgcm9vbXNcbiAgICAgICAgaWYgKHJvb20gIT09IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbSkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgIT09IFwibS5mdWxseV9yZWFkXCIpIHJldHVybjtcblxuICAgICAgICAvLyBYWFg6IHJvb21SZWFkTWFya2VyVHNNYXAgbm90IHVwZGF0ZWQgaGVyZSBzbyBpdCBpcyBub3cgaW5jb25zaXN0ZW50LiBSZXBsYWNlXG4gICAgICAgIC8vIHRoaXMgbWVjaGFuaXNtIG9mIGRldGVybWluaW5nIHdoZXJlIHRoZSBSTSBpcyByZWxhdGl2ZSB0byB0aGUgdmlldy1wb3J0IHdpdGhcbiAgICAgICAgLy8gb25lIHN1cHBvcnRlZCBieSB0aGUgc2VydmVyICh0aGUgY2xpZW50IG5lZWRzIG1vcmUgdGhhbiBhbiBldmVudCBJRCkuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmVhZE1hcmtlckV2ZW50SWQ6IGV2LmdldENvbnRlbnQoKS5ldmVudF9pZCxcbiAgICAgICAgfSwgdGhpcy5wcm9wcy5vblJlYWRNYXJrZXJVcGRhdGVkKTtcbiAgICB9O1xuXG4gICAgb25FdmVudERlY3J5cHRlZCA9IGV2ID0+IHtcbiAgICAgICAgLy8gQ2FuIGJlIG51bGwgZm9yIHRoZSBub3RpZmljYXRpb24gdGltZWxpbmUsIGV0Yy5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICAvLyBOZWVkIHRvIHVwZGF0ZSBhcyB3ZSBkb24ndCBkaXNwbGF5IGV2ZW50IHRpbGVzIGZvciBldmVudHMgdGhhdFxuICAgICAgICAvLyBoYXZlbid0IHlldCBiZWVuIGRlY3J5cHRlZC4gVGhlIGV2ZW50IHdpbGwgaGF2ZSBqdXN0IGJlZW4gdXBkYXRlZFxuICAgICAgICAvLyBpbiBwbGFjZSBzbyB3ZSBqdXN0IG5lZWQgdG8gcmUtcmVuZGVyLlxuICAgICAgICAvLyBUT0RPOiBXZSBzaG91bGQgcmVzdHJpY3QgdGhpcyB0byBvbmx5IGV2ZW50cyBpbiBvdXIgdGltZWxpbmUsXG4gICAgICAgIC8vIGJ1dCBwb3NzaWJseSB0aGUgZXZlbnQgdGlsZSBpdHNlbGYgc2hvdWxkIGp1c3QgdXBkYXRlIHdoZW4gdGhpc1xuICAgICAgICAvLyBoYXBwZW5zIHRvIHNhdmUgdXMgcmUtcmVuZGVyaW5nIHRoZSB3aG9sZSB0aW1lbGluZS5cbiAgICAgICAgaWYgKGV2LmdldFJvb21JZCgpID09PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20ucm9vbUlkKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25TeW5jID0gKHN0YXRlLCBwcmV2U3RhdGUsIGRhdGEpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y2xpZW50U3luY1N0YXRlOiBzdGF0ZX0pO1xuICAgIH07XG5cbiAgICBfcmVhZE1hcmtlclRpbWVvdXQocmVhZE1hcmtlclBvc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiByZWFkTWFya2VyUG9zaXRpb24gPT09IDAgP1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5yZWFkTWFya2VySW5WaWV3VGhyZXNob2xkTXMgOlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5yZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXM7XG4gICAgfVxuXG4gICAgYXN5bmMgdXBkYXRlUmVhZE1hcmtlck9uVXNlckFjdGl2aXR5KCkge1xuICAgICAgICBjb25zdCBpbml0aWFsVGltZW91dCA9IHRoaXMuX3JlYWRNYXJrZXJUaW1lb3V0KHRoaXMuZ2V0UmVhZE1hcmtlclBvc2l0aW9uKCkpO1xuICAgICAgICB0aGlzLl9yZWFkTWFya2VyQWN0aXZpdHlUaW1lciA9IG5ldyBUaW1lcihpbml0aWFsVGltZW91dCk7XG5cbiAgICAgICAgd2hpbGUgKHRoaXMuX3JlYWRNYXJrZXJBY3Rpdml0eVRpbWVyKSB7IC8vdW5zZXQgb24gdW5tb3VudFxuICAgICAgICAgICAgVXNlckFjdGl2aXR5LnNoYXJlZEluc3RhbmNlKCkudGltZVdoaWxlQWN0aXZlUmVjZW50bHkodGhpcy5fcmVhZE1hcmtlckFjdGl2aXR5VGltZXIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9yZWFkTWFya2VyQWN0aXZpdHlUaW1lci5maW5pc2hlZCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyBjb250aW51ZTsgLyogYWJvcnRlZCAqLyB9XG4gICAgICAgICAgICAvLyBvdXRzaWRlIG9mIHRyeS9jYXRjaCB0byBub3Qgc3dhbGxvdyBlcnJvcnNcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUmVhZE1hcmtlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgdXBkYXRlUmVhZFJlY2VpcHRPblVzZXJBY3Rpdml0eSgpIHtcbiAgICAgICAgdGhpcy5fcmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyID0gbmV3IFRpbWVyKFJFQURfUkVDRUlQVF9JTlRFUlZBTF9NUyk7XG4gICAgICAgIHdoaWxlICh0aGlzLl9yZWFkUmVjZWlwdEFjdGl2aXR5VGltZXIpIHsgLy91bnNldCBvbiB1bm1vdW50XG4gICAgICAgICAgICBVc2VyQWN0aXZpdHkuc2hhcmVkSW5zdGFuY2UoKS50aW1lV2hpbGVBY3RpdmVOb3codGhpcy5fcmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5fcmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyLmZpbmlzaGVkKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IGNvbnRpbnVlOyAvKiBhYm9ydGVkICovIH1cbiAgICAgICAgICAgIC8vIG91dHNpZGUgb2YgdHJ5L2NhdGNoIHRvIG5vdCBzd2FsbG93IGVycm9yc1xuICAgICAgICAgICAgdGhpcy5zZW5kUmVhZFJlY2VpcHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbmRSZWFkUmVjZWlwdCA9ICgpID0+IHtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsb3dCYW5kd2lkdGhcIikpIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5tYW5hZ2VSZWFkUmVjZWlwdHMpIHJldHVybjtcbiAgICAgICAgLy8gVGhpcyBoYXBwZW5zIG9uIHVzZXJfYWN0aXZpdHlfZW5kIHdoaWNoIGlzIGRlbGF5ZWQsIGFuZCBpdCdzXG4gICAgICAgIC8vIHZlcnkgcG9zc2libGUgaGF2ZSBsb2dnZWQgb3V0IHdpdGhpbiB0aGF0IHRpbWVmcmFtZSwgc28gY2hlY2tcbiAgICAgICAgLy8gd2Ugc3RpbGwgaGF2ZSBhIGNsaWVudC5cbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAvLyBpZiBubyBjbGllbnQgb3IgY2xpZW50IGlzIGd1ZXN0IGRvbid0IHNlbmQgUlIgb3IgUk1cbiAgICAgICAgaWYgKCFjbGkgfHwgY2xpLmlzR3Vlc3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBzaG91bGRTZW5kUlIgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSUkV2ZW50SWQgPSB0aGlzLl9nZXRDdXJyZW50UmVhZFJlY2VpcHQodHJ1ZSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRSUkV2ZW50SW5kZXggPSB0aGlzLl9pbmRleEZvckV2ZW50SWQoY3VycmVudFJSRXZlbnRJZCk7XG4gICAgICAgIC8vIFdlIHdhbnQgdG8gYXZvaWQgc2VuZGluZyBvdXQgcmVhZCByZWNlaXB0cyB3aGVuIHdlIGFyZSBsb29raW5nIGF0XG4gICAgICAgIC8vIGV2ZW50cyBpbiB0aGUgcGFzdCB3aGljaCBhcmUgYmVmb3JlIHRoZSBsYXRlc3QgUlIuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEZvciBub3csIGxldCdzIGFwcGx5IGEgaGV1cmlzdGljOiBpZiAoYSkgdGhlIGV2ZW50IGNvcnJlc3BvbmRpbmcgdG9cbiAgICAgICAgLy8gdGhlIGxhdGVzdCBSUiAoZWl0aGVyIGZyb20gdGhlIHNlcnZlciwgb3Igc2VudCBieSBvdXJzZWx2ZXMpIGRvZXNuJ3RcbiAgICAgICAgLy8gYXBwZWFyIGluIG91ciB0aW1lbGluZSwgYW5kIChiKSB3ZSBjb3VsZCBmb3J3YXJkLXBhZ2luYXRlIHRoZSBldmVudFxuICAgICAgICAvLyB0aW1lbGluZSwgdGhlbiBkb24ndCBzZW5kIGFueSBtb3JlIFJScy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhpcyBpc24ndCB3YXRlcnRpZ2h0LCBhcyB3ZSBjb3VsZCBiZSBsb29raW5nIGF0IGEgc2VjdGlvbiBvZlxuICAgICAgICAvLyB0aW1lbGluZSB3aGljaCBpcyAqYWZ0ZXIqIHRoZSBsYXRlc3QgUlIgKHNvIHdlIHNob3VsZCBhY3R1YWxseSBzZW5kXG4gICAgICAgIC8vIFJScykgLSBidXQgdGhhdCBpcyBhIGJpdCBvZiBhIG5pY2hlIGNhc2UuIEl0IHdpbGwgc29ydCBpdHNlbGYgb3V0IHdoZW5cbiAgICAgICAgLy8gdGhlIHVzZXIgZXZlbnR1YWxseSBoaXRzIHRoZSBsaXZlIHRpbWVsaW5lLlxuICAgICAgICAvL1xuICAgICAgICBpZiAoY3VycmVudFJSRXZlbnRJZCAmJiBjdXJyZW50UlJFdmVudEluZGV4ID09PSBudWxsICYmXG4gICAgICAgICAgICAgICAgdGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUykpIHtcbiAgICAgICAgICAgIHNob3VsZFNlbmRSUiA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGFzdFJlYWRFdmVudEluZGV4ID0gdGhpcy5fZ2V0TGFzdERpc3BsYXllZEV2ZW50SW5kZXgoe1xuICAgICAgICAgICAgaWdub3JlT3duOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGxhc3RSZWFkRXZlbnRJbmRleCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgc2hvdWxkU2VuZFJSID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxhc3RSZWFkRXZlbnQgPSB0aGlzLnN0YXRlLmV2ZW50c1tsYXN0UmVhZEV2ZW50SW5kZXhdO1xuICAgICAgICBzaG91bGRTZW5kUlIgPSBzaG91bGRTZW5kUlIgJiZcbiAgICAgICAgICAgIC8vIE9ubHkgc2VuZCBhIFJSIGlmIHRoZSBsYXN0IHJlYWQgZXZlbnQgaXMgYWhlYWQgaW4gdGhlIHRpbWVsaW5lIHJlbGF0aXZlIHRvXG4gICAgICAgICAgICAvLyB0aGUgY3VycmVudCBSUiBldmVudC5cbiAgICAgICAgICAgIGxhc3RSZWFkRXZlbnRJbmRleCA+IGN1cnJlbnRSUkV2ZW50SW5kZXggJiZcbiAgICAgICAgICAgIC8vIE9ubHkgc2VuZCBhIFJSIGlmIHRoZSBsYXN0IFJSIHNldCAhPSB0aGUgb25lIHdlIHdvdWxkIHNlbmRcbiAgICAgICAgICAgIHRoaXMubGFzdFJSU2VudEV2ZW50SWQgIT0gbGFzdFJlYWRFdmVudC5nZXRJZCgpO1xuXG4gICAgICAgIC8vIE9ubHkgc2VuZCBhIFJNIGlmIHRoZSBsYXN0IFJNIHNlbnQgIT0gdGhlIG9uZSB3ZSB3b3VsZCBzZW5kXG4gICAgICAgIGNvbnN0IHNob3VsZFNlbmRSTSA9XG4gICAgICAgICAgICB0aGlzLmxhc3RSTVNlbnRFdmVudElkICE9IHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQ7XG5cbiAgICAgICAgLy8gd2UgYWxzbyByZW1lbWJlciB0aGUgbGFzdCByZWFkIHJlY2VpcHQgd2Ugc2VudCB0byBhdm9pZCBzcGFtbWluZyB0aGVcbiAgICAgICAgLy8gc2FtZSBvbmUgYXQgdGhlIHNlcnZlciByZXBlYXRlZGx5XG4gICAgICAgIGlmIChzaG91bGRTZW5kUlIgfHwgc2hvdWxkU2VuZFJNKSB7XG4gICAgICAgICAgICBpZiAoc2hvdWxkU2VuZFJSKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0UlJTZW50RXZlbnRJZCA9IGxhc3RSZWFkRXZlbnQuZ2V0SWQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFzdFJlYWRFdmVudCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxhc3RSTVNlbnRFdmVudElkID0gdGhpcy5zdGF0ZS5yZWFkTWFya2VyRXZlbnRJZDtcblxuICAgICAgICAgICAgZGVidWdsb2coJ1RpbWVsaW5lUGFuZWw6IFNlbmRpbmcgUmVhZCBNYXJrZXJzIGZvciAnLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgJ3JtJywgdGhpcy5zdGF0ZS5yZWFkTWFya2VyRXZlbnRJZCxcbiAgICAgICAgICAgICAgICBsYXN0UmVhZEV2ZW50ID8gJ3JyICcgKyBsYXN0UmVhZEV2ZW50LmdldElkKCkgOiAnJyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0Um9vbVJlYWRNYXJrZXJzKFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5yZWFkTWFya2VyRXZlbnRJZCxcbiAgICAgICAgICAgICAgICBsYXN0UmVhZEV2ZW50LCAvLyBDb3VsZCBiZSBudWxsLCBpbiB3aGljaCBjYXNlIG5vIFJSIGlzIHNlbnRcbiAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyAvcmVhZF9tYXJrZXJzIEFQSSBpcyBub3QgaW1wbGVtZW50ZWQgb24gdGhpcyBIUywgZmFsbGJhY2sgdG8ganVzdCBSUlxuICAgICAgICAgICAgICAgIGlmIChlLmVycmNvZGUgPT09ICdNX1VOUkVDT0dOSVpFRCcgJiYgbGFzdFJlYWRFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRSZWFkUmVjZWlwdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RSZWFkRXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFJSU2VudEV2ZW50SWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGl0IGZhaWxlZCwgc28gYWxsb3cgcmV0cmllcyBuZXh0IHRpbWUgdGhlIHVzZXIgaXMgYWN0aXZlXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0UlJTZW50RXZlbnRJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RSTVNlbnRFdmVudElkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGRvIGEgcXVpY2stcmVzZXQgb2Ygb3VyIHVucmVhZE5vdGlmaWNhdGlvbkNvdW50IHRvIGF2b2lkIGhhdmluZ1xuICAgICAgICAgICAgLy8gdG8gd2FpdCBmcm9tIHRoZSByZW1vdGUgZWNobyBmcm9tIHRoZSBob21lc2VydmVyLlxuICAgICAgICAgICAgLy8gd2Ugb25seSBkbyB0aGlzIGlmIHdlJ3JlIHJpZ2h0IGF0IHRoZSBlbmQsIGJlY2F1c2Ugd2UncmUganVzdCBhc3N1bWluZ1xuICAgICAgICAgICAgLy8gdGhhdCBzZW5kaW5nIGFuIFJSIGZvciB0aGUgbGF0ZXN0IG1lc3NhZ2Ugd2lsbCBzZXQgb3VyIG5vdGlmIGNvdW50ZXJcbiAgICAgICAgICAgIC8vIHRvIHplcm86IGl0IG1heSBub3QgZG8gdGhpcyBpZiB3ZSBzZW5kIGFuIFJSIGZvciBzb21ld2hlcmUgYmVmb3JlIHRoZSBlbmQuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F0RW5kT2ZMaXZlVGltZWxpbmUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5zZXRVbnJlYWROb3RpZmljYXRpb25Db3VudCgndG90YWwnLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20uc2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQoJ2hpZ2hsaWdodCcsIDApO1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ29uX3Jvb21fcmVhZCcsXG4gICAgICAgICAgICAgICAgICAgIHJvb21JZDogdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBpZiB0aGUgcmVhZCBtYXJrZXIgaXMgb24gdGhlIHNjcmVlbiwgd2UgY2FuIG5vdyBhc3N1bWUgd2UndmUgY2F1Z2h0IHVwIHRvIHRoZSBlbmRcbiAgICAvLyBvZiB0aGUgc2NyZWVuLCBzbyBtb3ZlIHRoZSBtYXJrZXIgZG93biB0byB0aGUgYm90dG9tIG9mIHRoZSBzY3JlZW4uXG4gICAgdXBkYXRlUmVhZE1hcmtlciA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLm1hbmFnZVJlYWRNYXJrZXJzKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLmdldFJlYWRNYXJrZXJQb3NpdGlvbigpID09PSAxKSB7XG4gICAgICAgICAgICAvLyB0aGUgcmVhZCBtYXJrZXIgaXMgYXQgYW4gZXZlbnQgYmVsb3cgdGhlIHZpZXdwb3J0LFxuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byByZXdpbmQgaXQuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gbW92ZSB0aGUgUk0gdG8gKmFmdGVyKiB0aGUgbWVzc2FnZSBhdCB0aGUgYm90dG9tIG9mIHRoZSBzY3JlZW4uIFRoaXNcbiAgICAgICAgLy8gYXZvaWRzIGEgcHJvYmxlbSB3aGVyZWJ5IHdlIG5ldmVyIGFkdmFuY2UgdGhlIFJNIGlmIHRoZXJlIGlzIGEgaHVnZVxuICAgICAgICAvLyBtZXNzYWdlIHdoaWNoIGRvZXNuJ3QgZml0IG9uIHRoZSBzY3JlZW4uXG4gICAgICAgIGNvbnN0IGxhc3REaXNwbGF5ZWRJbmRleCA9IHRoaXMuX2dldExhc3REaXNwbGF5ZWRFdmVudEluZGV4KHtcbiAgICAgICAgICAgIGFsbG93UGFydGlhbDogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGxhc3REaXNwbGF5ZWRJbmRleCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxhc3REaXNwbGF5ZWRFdmVudCA9IHRoaXMuc3RhdGUuZXZlbnRzW2xhc3REaXNwbGF5ZWRJbmRleF07XG4gICAgICAgIHRoaXMuX3NldFJlYWRNYXJrZXIobGFzdERpc3BsYXllZEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdERpc3BsYXllZEV2ZW50LmdldFRzKCkpO1xuXG4gICAgICAgIC8vIHRoZSByZWFkLW1hcmtlciBzaG91bGQgYmVjb21lIGludmlzaWJsZSwgc28gdGhhdCBpZiB0aGUgdXNlciBzY3JvbGxzXG4gICAgICAgIC8vIGRvd24sIHRoZXkgZG9uJ3Qgc2VlIGl0LlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWFkTWFya2VyVmlzaWJsZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVhZE1hcmtlclZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZW5kIHRoZSB1cGRhdGVkIHJlYWQgbWFya2VyIChhbG9uZyB3aXRoIHJlYWQgcmVjZWlwdCkgdG8gdGhlIHNlcnZlclxuICAgICAgICB0aGlzLnNlbmRSZWFkUmVjZWlwdCgpO1xuICAgIH07XG5cblxuICAgIC8vIGFkdmFuY2UgdGhlIHJlYWQgbWFya2VyIHBhc3QgYW55IGV2ZW50cyB3ZSBzZW50IG91cnNlbHZlcy5cbiAgICBfYWR2YW5jZVJlYWRNYXJrZXJQYXN0TXlFdmVudHMoKSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5tYW5hZ2VSZWFkTWFya2VycykgcmV0dXJuO1xuXG4gICAgICAgIC8vIHdlIGNhbGwgYF90aW1lbGluZVdpbmRvdy5nZXRFdmVudHMoKWAgcmF0aGVyIHRoYW4gdXNpbmdcbiAgICAgICAgLy8gYHRoaXMuc3RhdGUubGl2ZUV2ZW50c2AsIGJlY2F1c2UgUmVhY3QgYmF0Y2hlcyB0aGUgdXBkYXRlIHRvIHRoZVxuICAgICAgICAvLyBsYXR0ZXIsIHNvIGl0IG1heSBub3QgaGF2ZSBiZWVuIHVwZGF0ZWQgeWV0LlxuICAgICAgICBjb25zdCBldmVudHMgPSB0aGlzLl90aW1lbGluZVdpbmRvdy5nZXRFdmVudHMoKTtcblxuICAgICAgICAvLyBmaXJzdCBmaW5kIHdoZXJlIHRoZSBjdXJyZW50IFJNIGlzXG4gICAgICAgIGxldCBpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRzW2ldLmdldElkKCkgPT0gdGhpcy5zdGF0ZS5yZWFkTWFya2VyRXZlbnRJZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpID49IGV2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG5vdyB0aGluayBhYm91dCBhZHZhbmNpbmcgaXRcbiAgICAgICAgY29uc3QgbXlVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkO1xuICAgICAgICBmb3IgKGkrKzsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZXYgPSBldmVudHNbaV07XG4gICAgICAgICAgICBpZiAoIWV2LnNlbmRlciB8fCBldi5zZW5kZXIudXNlcklkICE9IG15VXNlcklkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gaSBpcyBub3cgdGhlIGZpcnN0IHVucmVhZCBtZXNzYWdlIHdoaWNoIHdlIGRpZG4ndCBzZW5kIG91cnNlbHZlcy5cbiAgICAgICAgaS0tO1xuXG4gICAgICAgIGNvbnN0IGV2ID0gZXZlbnRzW2ldO1xuICAgICAgICB0aGlzLl9zZXRSZWFkTWFya2VyKGV2LmdldElkKCksIGV2LmdldFRzKCkpO1xuICAgIH1cblxuICAgIC8qIGp1bXAgZG93biB0byB0aGUgYm90dG9tIG9mIHRoaXMgcm9vbSwgd2hlcmUgbmV3IGV2ZW50cyBhcmUgYXJyaXZpbmdcbiAgICAgKi9cbiAgICBqdW1wVG9MaXZlVGltZWxpbmUgPSAoKSA9PiB7XG4gICAgICAgIC8vIGlmIHdlIGNhbid0IGZvcndhcmQtcGFnaW5hdGUgdGhlIGV4aXN0aW5nIHRpbWVsaW5lLCB0aGVuIHRoZXJlXG4gICAgICAgIC8vIGlzIG5vIHBvaW50IHJlbG9hZGluZyBpdCAtIGp1c3QganVtcCBzdHJhaWdodCB0byB0aGUgYm90dG9tLlxuICAgICAgICAvL1xuICAgICAgICAvLyBPdGhlcndpc2UsIHJlbG9hZCB0aGUgdGltZWxpbmUgcmF0aGVyIHRoYW4gdHJ5aW5nIHRvIHBhZ2luYXRlXG4gICAgICAgIC8vIHRocm91Z2ggYWxsIG9mIHNwYWNlLXRpbWUuXG4gICAgICAgIGlmICh0aGlzLl90aW1lbGluZVdpbmRvdy5jYW5QYWdpbmF0ZShFdmVudFRpbWVsaW5lLkZPUldBUkRTKSkge1xuICAgICAgICAgICAgdGhpcy5fbG9hZFRpbWVsaW5lKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5zY3JvbGxUb0JvdHRvbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qIHNjcm9sbCB0byBzaG93IHRoZSByZWFkLXVwLXRvIG1hcmtlci4gV2UgcHV0IGl0IDEvMyBvZiB0aGUgd2F5IGRvd25cbiAgICAgKiB0aGUgY29udGFpbmVyLlxuICAgICAqL1xuICAgIGp1bXBUb1JlYWRNYXJrZXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5tYW5hZ2VSZWFkTWFya2VycykgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5yZWFkTWFya2VyRXZlbnRJZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIHdlIG1heSBub3QgaGF2ZSBsb2FkZWQgdGhlIGV2ZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHJlYWQtbWFya2VyXG4gICAgICAgIC8vIGludG8gdGhlIF90aW1lbGluZVdpbmRvdy4gSW4gdGhhdCBjYXNlLCBhdHRlbXB0cyB0byBzY3JvbGwgdG8gaXRcbiAgICAgICAgLy8gd2lsbCBmYWlsLlxuICAgICAgICAvL1xuICAgICAgICAvLyBhIHF1aWNrIHdheSB0byBmaWd1cmUgb3V0IGlmIHdlJ3ZlIGxvYWRlZCB0aGUgcmVsZXZhbnQgZXZlbnQgaXNcbiAgICAgICAgLy8gc2ltcGx5IHRvIGNoZWNrIGlmIHRoZSBtZXNzYWdlcGFuZWwga25vd3Mgd2hlcmUgdGhlIHJlYWQtbWFya2VyIGlzLlxuICAgICAgICBjb25zdCByZXQgPSB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5nZXRSZWFkTWFya2VyUG9zaXRpb24oKTtcbiAgICAgICAgaWYgKHJldCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gVGhlIG1lc3NhZ2VwYW5lbCBrbm93cyB3aGVyZSB0aGUgUk0gaXMsIHNvIHdlIG11c3QgaGF2ZSBsb2FkZWRcbiAgICAgICAgICAgIC8vIHRoZSByZWxldmFudCBldmVudC5cbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50LnNjcm9sbFRvRXZlbnQodGhpcy5zdGF0ZS5yZWFkTWFya2VyRXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLCAxLzMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9va3MgbGlrZSB3ZSBoYXZlbid0IGxvYWRlZCB0aGUgZXZlbnQgY29ycmVzcG9uZGluZyB0byB0aGUgcmVhZC1tYXJrZXIuXG4gICAgICAgIC8vIEFzIHdpdGgganVtcFRvTGl2ZVRpbWVsaW5lLCB3ZSB3YW50IHRvIHJlbG9hZCB0aGUgdGltZWxpbmUgYXJvdW5kIHRoZVxuICAgICAgICAvLyByZWFkLW1hcmtlci5cbiAgICAgICAgdGhpcy5fbG9hZFRpbWVsaW5lKHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQsIDAsIDEvMyk7XG4gICAgfTtcblxuICAgIC8qIHVwZGF0ZSB0aGUgcmVhZC11cC10byBtYXJrZXIgdG8gbWF0Y2ggdGhlIHJlYWQgcmVjZWlwdFxuICAgICAqL1xuICAgIGZvcmdldFJlYWRNYXJrZXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5tYW5hZ2VSZWFkTWFya2VycykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJtSWQgPSB0aGlzLl9nZXRDdXJyZW50UmVhZFJlY2VpcHQoKTtcblxuICAgICAgICAvLyBzZWUgaWYgd2Uga25vdyB0aGUgdGltZXN0YW1wIGZvciB0aGUgcnIgZXZlbnRcbiAgICAgICAgY29uc3QgdGwgPSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LmdldFRpbWVsaW5lRm9yRXZlbnQocm1JZCk7XG4gICAgICAgIGxldCBybVRzO1xuICAgICAgICBpZiAodGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gdGwuZ2V0RXZlbnRzKCkuZmluZCgoZSkgPT4geyByZXR1cm4gZS5nZXRJZCgpID09IHJtSWQ7IH0pO1xuICAgICAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgcm1UcyA9IGV2ZW50LmdldFRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zZXRSZWFkTWFya2VyKHJtSWQsIHJtVHMpO1xuICAgIH07XG5cbiAgICAvKiByZXR1cm4gdHJ1ZSBpZiB0aGUgY29udGVudCBpcyBmdWxseSBzY3JvbGxlZCBkb3duIGFuZCB3ZSBhcmVcbiAgICAgKiBhdCB0aGUgZW5kIG9mIHRoZSBsaXZlIHRpbWVsaW5lLlxuICAgICAqL1xuICAgIGlzQXRFbmRPZkxpdmVUaW1lbGluZSA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50XG4gICAgICAgICAgICAmJiB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5pc0F0Qm90dG9tKClcbiAgICAgICAgICAgICYmIHRoaXMuX3RpbWVsaW5lV2luZG93XG4gICAgICAgICAgICAmJiAhdGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUyk7XG4gICAgfVxuXG5cbiAgICAvKiBnZXQgdGhlIGN1cnJlbnQgc2Nyb2xsIHN0YXRlLiBTZWUgU2Nyb2xsUGFuZWwuZ2V0U2Nyb2xsU3RhdGUgZm9yXG4gICAgICogZGV0YWlscy5cbiAgICAgKlxuICAgICAqIHJldHVybnMgbnVsbCBpZiB3ZSBhcmUgbm90IG1vdW50ZWQuXG4gICAgICovXG4gICAgZ2V0U2Nyb2xsU3RhdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50LmdldFNjcm9sbFN0YXRlKCk7XG4gICAgfTtcblxuICAgIC8vIHJldHVybnMgb25lIG9mOlxuICAgIC8vXG4gICAgLy8gIG51bGw6IHRoZXJlIGlzIG5vIHJlYWQgbWFya2VyXG4gICAgLy8gIC0xOiByZWFkIG1hcmtlciBpcyBhYm92ZSB0aGUgd2luZG93XG4gICAgLy8gICAwOiByZWFkIG1hcmtlciBpcyB2aXNpYmxlXG4gICAgLy8gICsxOiByZWFkIG1hcmtlciBpcyBiZWxvdyB0aGUgd2luZG93XG4gICAgZ2V0UmVhZE1hcmtlclBvc2l0aW9uID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAoIXRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCByZXQgPSB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5nZXRSZWFkTWFya2VyUG9zaXRpb24oKTtcbiAgICAgICAgaWYgKHJldCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoZSBtZXNzYWdlUGFuZWwgZG9lc24ndCBrbm93IHdoZXJlIHRoZSByZWFkIG1hcmtlciBpcy5cbiAgICAgICAgLy8gaWYgd2Uga25vdyB0aGUgdGltZXN0YW1wIG9mIHRoZSByZWFkIG1hcmtlciwgbWFrZSBhIGd1ZXNzIGJhc2VkIG9uIHRoYXQuXG4gICAgICAgIGNvbnN0IHJtVHMgPSBUaW1lbGluZVBhbmVsLnJvb21SZWFkTWFya2VyVHNNYXBbdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tLnJvb21JZF07XG4gICAgICAgIGlmIChybVRzICYmIHRoaXMuc3RhdGUuZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmIChybVRzIDwgdGhpcy5zdGF0ZS5ldmVudHNbMF0uZ2V0VHMoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgY2FuSnVtcFRvUmVhZE1hcmtlciA9ICgpID0+IHtcbiAgICAgICAgLy8gMS4gRG8gbm90IHNob3cganVtcCBiYXIgaWYgbmVpdGhlciB0aGUgUk0gbm9yIHRoZSBSUiBhcmUgc2V0LlxuICAgICAgICAvLyAzLiBXZSB3YW50IHRvIHNob3cgdGhlIGJhciBpZiB0aGUgcmVhZC1tYXJrZXIgaXMgb2ZmIHRoZSB0b3Agb2YgdGhlIHNjcmVlbi5cbiAgICAgICAgLy8gNC4gQWxzbywgaWYgcG9zID09PSBudWxsLCB0aGUgZXZlbnQgbWlnaHQgbm90IGJlIHBhZ2luYXRlZCAtIHNob3cgdGhlIHVucmVhZCBiYXJcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5nZXRSZWFkTWFya2VyUG9zaXRpb24oKTtcbiAgICAgICAgY29uc3QgcmV0ID0gdGhpcy5zdGF0ZS5yZWFkTWFya2VyRXZlbnRJZCAhPT0gbnVsbCAmJiAvLyAxLlxuICAgICAgICAgICAgKHBvcyA8IDAgfHwgcG9zID09PSBudWxsKTsgLy8gMy4sIDQuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogY2FsbGVkIGJ5IHRoZSBwYXJlbnQgY29tcG9uZW50IHdoZW4gUGFnZVVwL0Rvd24vZXRjIGlzIHByZXNzZWQuXG4gICAgICpcbiAgICAgKiBXZSBwYXNzIGl0IGRvd24gdG8gdGhlIHNjcm9sbCBwYW5lbC5cbiAgICAgKi9cbiAgICBoYW5kbGVTY3JvbGxLZXkgPSBldiA9PiB7XG4gICAgICAgIGlmICghdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgLy8ganVtcCB0byB0aGUgbGl2ZSB0aW1lbGluZSBvbiBjdHJsLWVuZCwgcmF0aGVyIHRoYW4gdGhlIGVuZCBvZiB0aGVcbiAgICAgICAgLy8gdGltZWxpbmUgd2luZG93LlxuICAgICAgICBpZiAoZXYuY3RybEtleSAmJiAhZXYuc2hpZnRLZXkgJiYgIWV2LmFsdEtleSAmJiAhZXYubWV0YUtleSAmJiBldi5rZXkgPT09IEtleS5FTkQpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcFRvTGl2ZVRpbWVsaW5lKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5oYW5kbGVTY3JvbGxLZXkoZXYpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9pbml0VGltZWxpbmUocHJvcHMpIHtcbiAgICAgICAgY29uc3QgaW5pdGlhbEV2ZW50ID0gcHJvcHMuZXZlbnRJZDtcbiAgICAgICAgY29uc3QgcGl4ZWxPZmZzZXQgPSBwcm9wcy5ldmVudFBpeGVsT2Zmc2V0O1xuXG4gICAgICAgIC8vIGlmIGEgcGl4ZWxPZmZzZXQgaXMgZ2l2ZW4sIGl0IGlzIHJlbGF0aXZlIHRvIHRoZSBib3R0b20gb2YgdGhlXG4gICAgICAgIC8vIGNvbnRhaW5lci4gSWYgbm90LCBwdXQgdGhlIGV2ZW50IGluIHRoZSBtaWRkbGUgb2YgdGhlIGNvbnRhaW5lci5cbiAgICAgICAgbGV0IG9mZnNldEJhc2UgPSAxO1xuICAgICAgICBpZiAocGl4ZWxPZmZzZXQgPT0gbnVsbCkge1xuICAgICAgICAgICAgb2Zmc2V0QmFzZSA9IDAuNTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkVGltZWxpbmUoaW5pdGlhbEV2ZW50LCBwaXhlbE9mZnNldCwgb2Zmc2V0QmFzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKHJlKS1sb2FkIHRoZSBldmVudCB0aW1lbGluZSwgYW5kIGluaXRpYWxpc2UgdGhlIHNjcm9sbCBzdGF0ZSwgY2VudGVyZWRcbiAgICAgKiBhcm91bmQgdGhlIGdpdmVuIGV2ZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmc/fSAgZXZlbnRJZCB0aGUgZXZlbnQgdG8gZm9jdXMgb24uIElmIHVuZGVmaW5lZCwgd2lsbFxuICAgICAqICAgIHNjcm9sbCB0byB0aGUgYm90dG9tIG9mIHRoZSByb29tLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXI/fSBwaXhlbE9mZnNldCAgIG9mZnNldCB0byBwb3NpdGlvbiB0aGUgZ2l2ZW4gZXZlbnQgYXRcbiAgICAgKiAgICAocGl4ZWxzIGZyb20gdGhlIG9mZnNldEJhc2UpLiBJZiBvbWl0dGVkLCBkZWZhdWx0cyB0byAwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXI/fSBvZmZzZXRCYXNlIHRoZSByZWZlcmVuY2UgcG9pbnQgZm9yIHRoZSBwaXhlbE9mZnNldC4gMFxuICAgICAqICAgICBtZWFucyB0aGUgdG9wIG9mIHRoZSBjb250YWluZXIsIDEgbWVhbnMgdGhlIGJvdHRvbSwgYW5kIGZyYWN0aW9uYWxcbiAgICAgKiAgICAgdmFsdWVzIG1lYW4gc29tZXdoZXJlIGluIHRoZSBtaWRkbGUuIElmIG9taXR0ZWQsIGl0IGRlZmF1bHRzIHRvIDAuXG4gICAgICpcbiAgICAgKiByZXR1cm5zIGEgcHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgd2hlbiB0aGUgbG9hZCBjb21wbGV0ZXMuXG4gICAgICovXG4gICAgX2xvYWRUaW1lbGluZShldmVudElkLCBwaXhlbE9mZnNldCwgb2Zmc2V0QmFzZSkge1xuICAgICAgICB0aGlzLl90aW1lbGluZVdpbmRvdyA9IG5ldyBNYXRyaXguVGltZWxpbmVXaW5kb3coXG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCksIHRoaXMucHJvcHMudGltZWxpbmVTZXQsXG4gICAgICAgICAgICB7d2luZG93TGltaXQ6IHRoaXMucHJvcHMudGltZWxpbmVDYXB9KTtcblxuICAgICAgICBjb25zdCBvbkxvYWRlZCA9ICgpID0+IHtcbiAgICAgICAgICAgIC8vIGNsZWFyIHRoZSB0aW1lbGluZSBtaW4taGVpZ2h0IHdoZW5cbiAgICAgICAgICAgIC8vIChyZSlsb2FkaW5nIHRoZSB0aW1lbGluZVxuICAgICAgICAgICAgaWYgKHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWVzc2FnZVBhbmVsLmN1cnJlbnQub25UaW1lbGluZVJlc2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9yZWxvYWRFdmVudHMoKTtcblxuICAgICAgICAgICAgLy8gSWYgd2Ugc3dpdGNoZWQgYXdheSBmcm9tIHRoZSByb29tIHdoaWxlIHRoZXJlIHdlcmUgcGVuZGluZ1xuICAgICAgICAgICAgLy8gb3V0Z29pbmcgZXZlbnRzLCB0aGUgcmVhZC1tYXJrZXIgd2lsbCBiZSBiZWZvcmUgdGhvc2UgZXZlbnRzLlxuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBza2lwIG92ZXIgYW55IHdoaWNoIGhhdmUgc3Vic2VxdWVudGx5IGJlZW4gc2VudC5cbiAgICAgICAgICAgIHRoaXMuX2FkdmFuY2VSZWFkTWFya2VyUGFzdE15RXZlbnRzKCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNhbkJhY2tQYWdpbmF0ZTogdGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMpLFxuICAgICAgICAgICAgICAgIGNhbkZvcndhcmRQYWdpbmF0ZTogdGhpcy5fdGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUyksXG4gICAgICAgICAgICAgICAgdGltZWxpbmVMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXNlIHRoZSBzY3JvbGwgc3RhdGUgb2YgdGhlIG1lc3NhZ2UgcGFuZWxcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgc2hvdWxkbid0IGhhcHBlbiAtIHdlIGtub3cgd2UncmUgbW91bnRlZCBiZWNhdXNlXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGluIGEgc2V0U3RhdGUgY2FsbGJhY2ssIGFuZCB3ZSBrbm93XG4gICAgICAgICAgICAgICAgICAgIC8vIHRpbWVsaW5lTG9hZGluZyBpcyBub3cgZmFsc2UsIHNvIHJlbmRlcigpIHNob3VsZCBoYXZlXG4gICAgICAgICAgICAgICAgICAgIC8vIG1vdW50ZWQgdGhlIG1lc3NhZ2UgcGFuZWwuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2FuJ3QgaW5pdGlhbGlzZSBzY3JvbGwgc3RhdGUgYmVjYXVzZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVBhbmVsIGRpZG4ndCBsb2FkXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChldmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50LnNjcm9sbFRvRXZlbnQoZXZlbnRJZCwgcGl4ZWxPZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXRCYXNlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tZXNzYWdlUGFuZWwuY3VycmVudC5zY3JvbGxUb0JvdHRvbSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFJlYWRSZWNlaXB0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBvbkVycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGltZWxpbmVMb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgYEVycm9yIGxvYWRpbmcgdGltZWxpbmUgcGFuZWwgYXQgJHtldmVudElkfTogJHtlcnJvcn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG5cbiAgICAgICAgICAgIGxldCBvbkZpbmlzaGVkO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSB3ZXJlIGdpdmVuIGFuIGV2ZW50IElELCB0aGVuIHdoZW4gdGhlIHVzZXIgY2xvc2VzIHRoZVxuICAgICAgICAgICAgLy8gZGlhbG9nLCBsZXQncyBqdW1wIHRvIHRoZSBlbmQgb2YgdGhlIHRpbWVsaW5lLiBJZiB3ZSB3ZXJlbid0LFxuICAgICAgICAgICAgLy8gc29tZXRoaW5nIGhhcyBnb25lIGJhZGx5IHdyb25nIGFuZCByYXRoZXIgdGhhbiBjYXVzaW5nIGEgbG9vcCBvZlxuICAgICAgICAgICAgLy8gdW5kaXNtaXNzYWJsZSBkaWFsb2dzLCBsZXQncyBqdXN0IGdpdmUgdXAuXG4gICAgICAgICAgICBpZiAoZXZlbnRJZCkge1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGdvIHZpYSB0aGUgZGlzcGF0Y2hlciBzbyB0aGF0IHRoZSBVUkwgaXMgdXBkYXRlZFxuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgICAgIGlmIChlcnJvci5lcnJjb2RlID09ICdNX0ZPUkJJRERFTicpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVHJpZWQgdG8gbG9hZCBhIHNwZWNpZmljIHBvaW50IGluIHRoaXMgcm9vbSdzIHRpbWVsaW5lLCBidXQgeW91IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIHZpZXcgdGhlIG1lc3NhZ2UgaW4gcXVlc3Rpb24uXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRyaWVkIHRvIGxvYWQgYSBzcGVjaWZpYyBwb2ludCBpbiB0aGlzIHJvb20ncyB0aW1lbGluZSwgYnV0IHdhcyBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwidW5hYmxlIHRvIGZpbmQgaXQuXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byBsb2FkIHRpbWVsaW5lIHBvc2l0aW9uJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbGVkIHRvIGxvYWQgdGltZWxpbmUgcG9zaXRpb25cIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZDogb25GaW5pc2hlZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGlmIHdlIGFscmVhZHkgaGF2ZSB0aGUgZXZlbnQgaW4gcXVlc3Rpb24sIFRpbWVsaW5lV2luZG93LmxvYWRcbiAgICAgICAgLy8gcmV0dXJucyBhIHJlc29sdmVkIHByb21pc2UuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEluIHRoaXMgc2l0dWF0aW9uLCB3ZSBkb24ndCByZWFsbHkgd2FudCB0byBkZWZlciB0aGUgdXBkYXRlIG9mIHRoZVxuICAgICAgICAvLyBzdGF0ZSB0byB0aGUgbmV4dCBldmVudCBsb29wLCBiZWNhdXNlIGl0IG1ha2VzIHJvb20tc3dpdGNoaW5nIGZlZWxcbiAgICAgICAgLy8gcXVpdGUgc2xvdy4gU28gd2UgZGV0ZWN0IHRoYXQgc2l0dWF0aW9uIGFuZCBzaG9ydGN1dCBzdHJhaWdodCB0b1xuICAgICAgICAvLyBjYWxsaW5nIF9yZWxvYWRFdmVudHMgYW5kIHVwZGF0aW5nIHRoZSBzdGF0ZS5cblxuICAgICAgICBjb25zdCB0aW1lbGluZSA9IHRoaXMucHJvcHMudGltZWxpbmVTZXQuZ2V0VGltZWxpbmVGb3JFdmVudChldmVudElkKTtcbiAgICAgICAgaWYgKHRpbWVsaW5lKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgaG90LXBhdGggb3B0aW1pemF0aW9uIGJ5IHNraXBwaW5nIGEgcHJvbWlzZSB0aWNrXG4gICAgICAgICAgICAvLyBieSByZXBlYXRpbmcgYSBuby1vcCBzeW5jIGJyYW5jaCBpbiBUaW1lbGluZVNldC5nZXRUaW1lbGluZUZvckV2ZW50ICYgTWF0cml4Q2xpZW50LmdldEV2ZW50VGltZWxpbmVcbiAgICAgICAgICAgIHRoaXMuX3RpbWVsaW5lV2luZG93LmxvYWQoZXZlbnRJZCwgSU5JVElBTF9TSVpFKTsgLy8gaW4gdGhpcyBicmFuY2ggdGhpcyBtZXRob2Qgd2lsbCBoYXBwZW4gaW4gc3luYyB0aW1lXG4gICAgICAgICAgICBvbkxvYWRlZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcHJvbSA9IHRoaXMuX3RpbWVsaW5lV2luZG93LmxvYWQoZXZlbnRJZCwgSU5JVElBTF9TSVpFKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGV2ZW50czogW10sXG4gICAgICAgICAgICAgICAgbGl2ZUV2ZW50czogW10sXG4gICAgICAgICAgICAgICAgY2FuQmFja1BhZ2luYXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjYW5Gb3J3YXJkUGFnaW5hdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRpbWVsaW5lTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvbS50aGVuKG9uTG9hZGVkLCBvbkVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGhhbmRsZSB0aGUgY29tcGxldGlvbiBvZiBhIHRpbWVsaW5lIGxvYWQgb3IgbG9jYWxFY2hvVXBkYXRlLCBieVxuICAgIC8vIHJlbG9hZGluZyB0aGUgZXZlbnRzIGZyb20gdGhlIHRpbWVsaW5ld2luZG93IGFuZCBwZW5kaW5nIGV2ZW50IGxpc3QgaW50b1xuICAgIC8vIHRoZSBzdGF0ZS5cbiAgICBfcmVsb2FkRXZlbnRzKCkge1xuICAgICAgICAvLyB3ZSBtaWdodCBoYXZlIHN3aXRjaGVkIHJvb21zIHNpbmNlIHRoZSBsb2FkIHN0YXJ0ZWQgLSBqdXN0IGJpblxuICAgICAgICAvLyB0aGUgcmVzdWx0cyBpZiBzby5cbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh0aGlzLl9nZXRFdmVudHMoKSk7XG4gICAgfVxuXG4gICAgLy8gZ2V0IHRoZSBsaXN0IG9mIGV2ZW50cyBmcm9tIHRoZSB0aW1lbGluZSB3aW5kb3cgYW5kIHRoZSBwZW5kaW5nIGV2ZW50IGxpc3RcbiAgICBfZ2V0RXZlbnRzKCkge1xuICAgICAgICBjb25zdCBldmVudHMgPSB0aGlzLl90aW1lbGluZVdpbmRvdy5nZXRFdmVudHMoKTtcbiAgICAgICAgY29uc3QgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCA9IHRoaXMuX2NoZWNrRm9yUHJlSm9pblVJU0koZXZlbnRzKTtcblxuICAgICAgICAvLyBIb2xkIG9udG8gdGhlIGxpdmUgZXZlbnRzIHNlcGFyYXRlbHkuIFRoZSByZWFkIHJlY2VpcHQgYW5kIHJlYWQgbWFya2VyXG4gICAgICAgIC8vIHNob3VsZCB1c2UgdGhpcyBsaXN0LCBzbyB0aGF0IHRoZXkgZG9uJ3QgYWR2YW5jZSBpbnRvIHBlbmRpbmcgZXZlbnRzLlxuICAgICAgICBjb25zdCBsaXZlRXZlbnRzID0gWy4uLmV2ZW50c107XG5cbiAgICAgICAgLy8gaWYgd2UncmUgYXQgdGhlIGVuZCBvZiB0aGUgbGl2ZSB0aW1lbGluZSwgYXBwZW5kIHRoZSBwZW5kaW5nIGV2ZW50c1xuICAgICAgICBpZiAoIXRoaXMuX3RpbWVsaW5lV2luZG93LmNhblBhZ2luYXRlKEV2ZW50VGltZWxpbmUuRk9SV0FSRFMpKSB7XG4gICAgICAgICAgICBldmVudHMucHVzaCguLi50aGlzLnByb3BzLnRpbWVsaW5lU2V0LmdldFBlbmRpbmdFdmVudHMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgbGl2ZUV2ZW50cyxcbiAgICAgICAgICAgIGZpcnN0VmlzaWJsZUV2ZW50SW5kZXgsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgZm9yIHVuZGVjcnlwdGFibGUgbWVzc2FnZXMgdGhhdCB3ZXJlIHNlbnQgd2hpbGUgdGhlIHVzZXIgd2FzIG5vdCBpblxuICAgICAqIHRoZSByb29tLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtBcnJheTxNYXRyaXhFdmVudD59IGV2ZW50cyBUaGUgdGltZWxpbmUgZXZlbnRzIHRvIGNoZWNrXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBpbmRleCB3aXRoaW4gYGV2ZW50c2Agb2YgdGhlIGV2ZW50IGFmdGVyIHRoZSBtb3N0IHJlY2VudFxuICAgICAqIHVuZGVjcnlwdGFibGUgZXZlbnQgdGhhdCB3YXMgc2VudCB3aGlsZSB0aGUgdXNlciB3YXMgbm90IGluIHRoZSByb29tLiAgSWYgbm9cbiAgICAgKiBzdWNoIGV2ZW50cyB3ZXJlIGZvdW5kLCB0aGVuIGl0IHJldHVybnMgMC5cbiAgICAgKi9cbiAgICBfY2hlY2tGb3JQcmVKb2luVUlTSShldmVudHMpIHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbTtcblxuICAgICAgICBpZiAoZXZlbnRzLmxlbmd0aCA9PT0gMCB8fCAhcm9vbSB8fFxuICAgICAgICAgICAgIU1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQocm9vbS5yb29tSWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWQ7XG5cbiAgICAgICAgLy8gZ2V0IHRoZSB1c2VyJ3MgbWVtYmVyc2hpcCBhdCB0aGUgbGFzdCBldmVudCBieSBnZXR0aW5nIHRoZSB0aW1lbGluZVxuICAgICAgICAvLyB0aGF0IHRoZSBldmVudCBiZWxvbmdzIHRvLCBhbmQgdHJhdmVyc2luZyB0aGUgdGltZWxpbmUgbG9va2luZyBmb3JcbiAgICAgICAgLy8gdGhhdCBldmVudCwgd2hpbGUga2VlcGluZyB0cmFjayBvZiB0aGUgdXNlcidzIG1lbWJlcnNoaXBcbiAgICAgICAgbGV0IGk7XG4gICAgICAgIGxldCB1c2VyTWVtYmVyc2hpcCA9IFwibGVhdmVcIjtcbiAgICAgICAgZm9yIChpID0gZXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lbGluZSA9IHJvb20uZ2V0VGltZWxpbmVGb3JFdmVudChldmVudHNbaV0uZ2V0SWQoKSk7XG4gICAgICAgICAgICBpZiAoIXRpbWVsaW5lKSB7XG4gICAgICAgICAgICAgICAgLy8gU29tZWhvdywgaXQgc2VlbXMgdG8gYmUgcG9zc2libGUgZm9yIGxpdmUgZXZlbnRzIHRvIG5vdCBoYXZlXG4gICAgICAgICAgICAgICAgLy8gYSB0aW1lbGluZSwgZXZlbiB0aG91Z2ggdGhhdCBzaG91bGQgbm90IGhhcHBlbi4gOihcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMjEyMFxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgYEV2ZW50ICR7ZXZlbnRzW2ldLmdldElkKCl9IGluIHJvb20gJHtyb29tLnJvb21JZH0gaXMgbGl2ZSwgYCArXG4gICAgICAgICAgICAgICAgICAgIGBidXQgaXQgZG9lcyBub3QgaGF2ZSBhIHRpbWVsaW5lYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdXNlck1lbWJlcnNoaXBFdmVudCA9XG4gICAgICAgICAgICAgICAgICAgIHRpbWVsaW5lLmdldFN0YXRlKEV2ZW50VGltZWxpbmUuRk9SV0FSRFMpLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICAgICAgdXNlck1lbWJlcnNoaXAgPSB1c2VyTWVtYmVyc2hpcEV2ZW50ID8gdXNlck1lbWJlcnNoaXBFdmVudC5tZW1iZXJzaGlwIDogXCJsZWF2ZVwiO1xuICAgICAgICAgICAgY29uc3QgdGltZWxpbmVFdmVudHMgPSB0aW1lbGluZS5nZXRFdmVudHMoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSB0aW1lbGluZUV2ZW50cy5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gdGltZWxpbmVFdmVudHNbal07XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmdldElkKCkgPT09IGV2ZW50c1tpXS5nZXRJZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuZ2V0U3RhdGVLZXkoKSA9PT0gdXNlcklkXG4gICAgICAgICAgICAgICAgICAgICYmIGV2ZW50LmdldFR5cGUoKSA9PT0gXCJtLnJvb20ubWVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldkNvbnRlbnQgPSBldmVudC5nZXRQcmV2Q29udGVudCgpO1xuICAgICAgICAgICAgICAgICAgICB1c2VyTWVtYmVyc2hpcCA9IHByZXZDb250ZW50Lm1lbWJlcnNoaXAgfHwgXCJsZWF2ZVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbm93IGdvIHRocm91Z2ggdGhlIHJlc3Qgb2YgdGhlIGV2ZW50cyBhbmQgZmluZCB0aGUgZmlyc3QgdW5kZWNyeXB0YWJsZVxuICAgICAgICAvLyBvbmUgdGhhdCB3YXMgc2VudCB3aGVuIHRoZSB1c2VyIHdhc24ndCBpbiB0aGUgcm9vbVxuICAgICAgICBmb3IgKDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gZXZlbnRzW2ldO1xuICAgICAgICAgICAgaWYgKGV2ZW50LmdldFN0YXRlS2V5KCkgPT09IHVzZXJJZFxuICAgICAgICAgICAgICAgICYmIGV2ZW50LmdldFR5cGUoKSA9PT0gXCJtLnJvb20ubWVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2Q29udGVudCA9IGV2ZW50LmdldFByZXZDb250ZW50KCk7XG4gICAgICAgICAgICAgICAgdXNlck1lbWJlcnNoaXAgPSBwcmV2Q29udGVudC5tZW1iZXJzaGlwIHx8IFwibGVhdmVcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodXNlck1lbWJlcnNoaXAgPT09IFwibGVhdmVcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAoZXZlbnQuaXNEZWNyeXB0aW9uRmFpbHVyZSgpIHx8IGV2ZW50LmlzQmVpbmdEZWNyeXB0ZWQoKSkpIHtcbiAgICAgICAgICAgICAgICAvLyByZWFjaGVkIGFuIHVuZGVjcnlwdGFibGUgbWVzc2FnZSB3aGVuIHRoZSB1c2VyIHdhc24ndCBpblxuICAgICAgICAgICAgICAgIC8vIHRoZSByb29tIC0tIGRvbid0IHRyeSB0byBsb2FkIGFueSBtb3JlXG4gICAgICAgICAgICAgICAgLy8gTm90ZTogZm9yIG5vdywgd2UgYXNzdW1lIHRoYXQgZXZlbnRzIHRoYXQgYXJlIGJlaW5nIGRlY3J5cHRlZCBhcmVcbiAgICAgICAgICAgICAgICAvLyBub3QgZGVjcnlwdGFibGVcbiAgICAgICAgICAgICAgICByZXR1cm4gaSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgX2luZGV4Rm9yRXZlbnRJZChldklkKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdGF0ZS5ldmVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChldklkID09IHRoaXMuc3RhdGUuZXZlbnRzW2ldLmdldElkKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBfZ2V0TGFzdERpc3BsYXllZEV2ZW50SW5kZXgob3B0cykge1xuICAgICAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICAgICAgY29uc3QgaWdub3JlT3duID0gb3B0cy5pZ25vcmVPd24gfHwgZmFsc2U7XG4gICAgICAgIGNvbnN0IGFsbG93UGFydGlhbCA9IG9wdHMuYWxsb3dQYXJ0aWFsIHx8IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VQYW5lbCA9IHRoaXMuX21lc3NhZ2VQYW5lbC5jdXJyZW50O1xuICAgICAgICBpZiAoIW1lc3NhZ2VQYW5lbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZVBhbmVsTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKG1lc3NhZ2VQYW5lbCk7XG4gICAgICAgIGlmICghbWVzc2FnZVBhbmVsTm9kZSkgcmV0dXJuIG51bGw7IC8vIHNvbWV0aW1lcyB0aGlzIGhhcHBlbnMgZm9yIGZyZXNoIHJvb21zL3Bvc3Qtc3luY1xuICAgICAgICBjb25zdCB3cmFwcGVyUmVjdCA9IG1lc3NhZ2VQYW5lbE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZDtcblxuICAgICAgICBjb25zdCBpc05vZGVJblZpZXcgPSAobm9kZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmICgoYWxsb3dQYXJ0aWFsICYmIGJvdW5kaW5nUmVjdC50b3AgPCB3cmFwcGVyUmVjdC5ib3R0b20pIHx8XG4gICAgICAgICAgICAgICAgICAgICghYWxsb3dQYXJ0aWFsICYmIGJvdW5kaW5nUmVjdC5ib3R0b20gPCB3cmFwcGVyUmVjdC5ib3R0b20pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXZSBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG9mIHRoZSBhZGphY2VudCBldmVudHMgZGlkbid0IGhhdmUgYSB0aWxlXG4gICAgICAgIC8vIGJ1dCBzaG91bGQgaGF2ZSB0aGUgcmVhZCByZWNlaXB0IG1vdmVkIHBhc3QgdGhlbSwgc29cbiAgICAgICAgLy8gd2UgY2FuIGluY2x1ZGUgdGhvc2Ugb25jZSB3ZSBmaW5kIHRoZSBsYXN0IGRpc3BsYXllZCAodmlzaWJsZSkgZXZlbnQuXG4gICAgICAgIC8vIFRoZSBjb3VudGVyIGlzIG5vdCBzdGFydGVkIGZvciBldmVudHMgd2UgZG9uJ3Qgd2FudFxuICAgICAgICAvLyB0byBzZW5kIGEgcmVhZCByZWNlaXB0IGZvciAob3VyIG93biBldmVudHMsIGxvY2FsIGVjaG9zKS5cbiAgICAgICAgbGV0IGFkamFjZW50SW52aXNpYmxlRXZlbnRDb3VudCA9IDA7XG4gICAgICAgIC8vIFVzZSBgbGl2ZUV2ZW50c2AgaGVyZSBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdGhlIHJlYWQgbWFya2VyIG9yIHJlYWRcbiAgICAgICAgLy8gcmVjZWlwdCB0byBhZHZhbmNlIGludG8gcGVuZGluZyBldmVudHMuXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLnN0YXRlLmxpdmVFdmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ID0gdGhpcy5zdGF0ZS5saXZlRXZlbnRzW2ldO1xuXG4gICAgICAgICAgICBjb25zdCBub2RlID0gbWVzc2FnZVBhbmVsLmdldE5vZGVGb3JFdmVudElkKGV2LmdldElkKCkpO1xuICAgICAgICAgICAgY29uc3QgaXNJblZpZXcgPSBpc05vZGVJblZpZXcobm9kZSk7XG5cbiAgICAgICAgICAgIC8vIHdoZW4gd2UndmUgcmVhY2hlZCB0aGUgZmlyc3QgdmlzaWJsZSBldmVudCwgYW5kIHRoZSBwcmV2aW91c1xuICAgICAgICAgICAgLy8gZXZlbnRzIHdlcmUgYWxsIGludmlzaWJsZSAod2l0aCB0aGUgZmlyc3Qgb25lIG5vdCBiZWluZyBpZ25vcmVkKSxcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGludmlzaWJsZSBldmVudC5cbiAgICAgICAgICAgIGlmIChpc0luVmlldyAmJiBhZGphY2VudEludmlzaWJsZUV2ZW50Q291bnQgIT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaSArIGFkamFjZW50SW52aXNpYmxlRXZlbnRDb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub2RlICYmICFpc0luVmlldykge1xuICAgICAgICAgICAgICAgIC8vIGhhcyBub2RlIGJ1dCBub3QgaW4gdmlldywgc28gcmVzZXQgYWRqYWNlbnQgaW52aXNpYmxlIGV2ZW50c1xuICAgICAgICAgICAgICAgIGFkamFjZW50SW52aXNpYmxlRXZlbnRDb3VudCA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNob3VsZElnbm9yZSA9ICEhZXYuc3RhdHVzIHx8IC8vIGxvY2FsIGVjaG9cbiAgICAgICAgICAgICAgICAoaWdub3JlT3duICYmIGV2LnNlbmRlciAmJiBldi5zZW5kZXIudXNlcklkID09IG15VXNlcklkKTsgICAvLyBvd24gbWVzc2FnZVxuICAgICAgICAgICAgY29uc3QgaXNXaXRob3V0VGlsZSA9ICFoYXZlVGlsZUZvckV2ZW50KGV2KSB8fCBzaG91bGRIaWRlRXZlbnQoZXYpO1xuXG4gICAgICAgICAgICBpZiAoaXNXaXRob3V0VGlsZSB8fCAhbm9kZSkge1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IHN0YXJ0IGNvdW50aW5nIGlmIHRoZSBldmVudCBzaG91bGQgYmUgaWdub3JlZCxcbiAgICAgICAgICAgICAgICAvLyBidXQgY29udGludWUgY291bnRpbmcgaWYgd2Ugd2VyZSBhbHJlYWR5IHNvIHRoZSBvZmZzZXRcbiAgICAgICAgICAgICAgICAvLyB0byB0aGUgcHJldmlvdXMgaW52aXNibGUgZXZlbnQgdGhhdCBkaWRuJ3QgbmVlZCB0byBiZSBpZ25vcmVkXG4gICAgICAgICAgICAgICAgLy8gZG9lc24ndCBnZXQgbWVzc2VkIHVwXG4gICAgICAgICAgICAgICAgaWYgKCFzaG91bGRJZ25vcmUgfHwgKHNob3VsZElnbm9yZSAmJiBhZGphY2VudEludmlzaWJsZUV2ZW50Q291bnQgIT09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgICsrYWRqYWNlbnRJbnZpc2libGVFdmVudENvdW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNob3VsZElnbm9yZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNJblZpZXcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgaWQgb2YgdGhlIGV2ZW50IGNvcnJlc3BvbmRpbmcgdG8gb3VyIHVzZXIncyBsYXRlc3QgcmVhZC1yZWNlaXB0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpZ25vcmVTeW50aGVzaXplZCBJZiB0cnVlLCByZXR1cm4gb25seSByZWNlaXB0cyB0aGF0XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXZlIGJlZW4gc2VudCBieSB0aGUgc2VydmVyLCBub3RcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcGxpY2l0IG9uZXMgZ2VuZXJhdGVkIGJ5IHRoZSBKU1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU0RLLlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gdGhlIGV2ZW50IElEXG4gICAgICovXG4gICAgX2dldEN1cnJlbnRSZWFkUmVjZWlwdChpZ25vcmVTeW50aGVzaXplZCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIC8vIHRoZSBjbGllbnQgY2FuIGJlIG51bGwgb24gbG9nb3V0XG4gICAgICAgIGlmIChjbGllbnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBteVVzZXJJZCA9IGNsaWVudC5jcmVkZW50aWFscy51c2VySWQ7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20uZ2V0RXZlbnRSZWFkVXBUbyhteVVzZXJJZCwgaWdub3JlU3ludGhlc2l6ZWQpO1xuICAgIH1cblxuICAgIF9zZXRSZWFkTWFya2VyKGV2ZW50SWQsIGV2ZW50VHMsIGluaGliaXRTZXRTdGF0ZSkge1xuICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20ucm9vbUlkO1xuXG4gICAgICAgIC8vIGRvbid0IHVwZGF0ZSB0aGUgc3RhdGUgKGFuZCBjYXVzZSBhIHJlLXJlbmRlcikgaWYgdGhlcmUgaXNcbiAgICAgICAgLy8gbm8gY2hhbmdlIHRvIHRoZSBSTS5cbiAgICAgICAgaWYgKGV2ZW50SWQgPT09IHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluIG9yZGVyIHRvIGxhdGVyIGZpZ3VyZSBvdXQgaWYgdGhlIHJlYWQgbWFya2VyIGlzXG4gICAgICAgIC8vIGFib3ZlIG9yIGJlbG93IHRoZSB2aXNpYmxlIHRpbWVsaW5lLCB3ZSBzdGFzaCB0aGUgdGltZXN0YW1wLlxuICAgICAgICBUaW1lbGluZVBhbmVsLnJvb21SZWFkTWFya2VyVHNNYXBbcm9vbUlkXSA9IGV2ZW50VHM7XG5cbiAgICAgICAgaWYgKGluaGliaXRTZXRTdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG8gdGhlIGxvY2FsIGVjaG8gb2YgdGhlIFJNXG4gICAgICAgIC8vIHJ1biB0aGUgcmVuZGVyIGN5Y2xlIGJlZm9yZSBjYWxsaW5nIHRoZSBjYWxsYmFjaywgc28gdGhhdFxuICAgICAgICAvLyBnZXRSZWFkTWFya2VyUG9zaXRpb24oKSByZXR1cm5zIHRoZSByaWdodCB0aGluZy5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByZWFkTWFya2VyRXZlbnRJZDogZXZlbnRJZCxcbiAgICAgICAgfSwgdGhpcy5wcm9wcy5vblJlYWRNYXJrZXJVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBfc2hvdWxkUGFnaW5hdGUoKSB7XG4gICAgICAgIC8vIGRvbid0IHRyeSB0byBwYWdpbmF0ZSB3aGlsZSBldmVudHMgaW4gdGhlIHRpbWVsaW5lIGFyZVxuICAgICAgICAvLyBzdGlsbCBiZWluZyBkZWNyeXB0ZWQuIFdlIGRvbid0IHJlbmRlciBldmVudHMgd2hpbGUgdGhleSdyZVxuICAgICAgICAvLyBiZWluZyBkZWNyeXB0ZWQsIHNvIHRoZXkgZG9uJ3QgdGFrZSB1cCBzcGFjZSBpbiB0aGUgdGltZWxpbmUuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgd2UgY2FuIHB1bGwgcXVpdGUgYSBsb3Qgb2YgZXZlbnRzIGludG8gdGhlIHRpbWVsaW5lXG4gICAgICAgIC8vIGFuZCBlbmQgdXAgdHJ5aW5nIHRvIHJlbmRlciBhIGxvdCBvZiBldmVudHMuXG4gICAgICAgIHJldHVybiAhdGhpcy5zdGF0ZS5ldmVudHMuc29tZSgoZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGUuaXNCZWluZ0RlY3J5cHRlZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRSZWxhdGlvbnNGb3JFdmVudCA9ICguLi5hcmdzKSA9PiB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LmdldFJlbGF0aW9uc0ZvckV2ZW50KC4uLmFyZ3MpO1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBNZXNzYWdlUGFuZWwgPSBzZGsuZ2V0Q29tcG9uZW50KFwic3RydWN0dXJlcy5NZXNzYWdlUGFuZWxcIik7XG4gICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuXG4gICAgICAgIC8vIGp1c3Qgc2hvdyBhIHNwaW5uZXIgd2hpbGUgdGhlIHRpbWVsaW5lIGxvYWRzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBwdXQgaXQgaW4gYSBkaXYgb2YgdGhlIHJpZ2h0IGNsYXNzIChteF9Sb29tVmlld19tZXNzYWdlUGFuZWwpIHNvXG4gICAgICAgIC8vIHRoYXQgdGhlIG9yZGVyIGluIHRoZSByb29tdmlldyBmbGV4Ym94IGlzIGNvcnJlY3QsIGFuZFxuICAgICAgICAvLyBteF9Sb29tVmlld19tZXNzYWdlTGlzdFdyYXBwZXIgdG8gcG9zaXRpb24gdGhlIGlubmVyIGRpdiBpbiB0aGVcbiAgICAgICAgLy8gcmlnaHQgcGxhY2UuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIE5vdGUgdGhhdCB0aGUgY2xpY2stb24tc2VhcmNoLXJlc3VsdCBmdW5jdGlvbmFsaXR5IHJlbGllcyBvbiB0aGVcbiAgICAgICAgLy8gZmFjdCB0aGF0IHRoZSBtZXNzYWdlUGFuZWwgaXMgaGlkZGVuIHdoaWxlIHRoZSB0aW1lbGluZSByZWxvYWRzLFxuICAgICAgICAvLyBidXQgdGhhdCB0aGUgUm9vbUhlYWRlciAoY29tcGxldGUgd2l0aCBzZWFyY2ggdGVybSkgY29udGludWVzIHRvXG4gICAgICAgIC8vIGV4aXN0LlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS50aW1lbGluZUxvYWRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld19tZXNzYWdlUGFuZWxTcGlubmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxMb2FkZXIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ldmVudHMubGVuZ3RoID09IDAgJiYgIXRoaXMuc3RhdGUuY2FuQmFja1BhZ2luYXRlICYmIHRoaXMucHJvcHMuZW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lICsgXCIgbXhfUm9vbVZpZXdfbWVzc2FnZUxpc3RXcmFwcGVyXCJ9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X2VtcHR5XCI+e3RoaXMucHJvcHMuZW1wdHl9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2l2ZSB0aGUgbWVzc2FnZXBhbmVsIGEgc3RpY2t5Ym90dG9tIGlmIHdlJ3JlIGF0IHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIGxpdmUgdGltZWxpbmUsIHNvIHRoYXQgdGhlIGFycml2YWwgb2YgbmV3IGV2ZW50cyB0cmlnZ2VycyBhXG4gICAgICAgIC8vIHNjcm9sbC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgc3RpY2t5Qm90dG9tIGlzICpmYWxzZSogaWYgd2UgY2FuIHBhZ2luYXRlXG4gICAgICAgIC8vIGZvcndhcmRzLCBvdGhlcndpc2UgaWYgc29tZWJvZHkgaGl0cyB0aGUgYm90dG9tIG9mIHRoZSBsb2FkZWRcbiAgICAgICAgLy8gZXZlbnRzIHdoZW4gdmlld2luZyBoaXN0b3JpY2FsIG1lc3NhZ2VzLCB3ZSBnZXQgc3R1Y2sgaW4gYSBsb29wXG4gICAgICAgIC8vIG9mIHBhZ2luYXRpbmcgb3VyIHdheSB0aHJvdWdoIHRoZSBlbnRpcmUgaGlzdG9yeSBvZiB0aGUgcm9vbS5cbiAgICAgICAgY29uc3Qgc3RpY2t5Qm90dG9tID0gIXRoaXMuX3RpbWVsaW5lV2luZG93LmNhblBhZ2luYXRlKEV2ZW50VGltZWxpbmUuRk9SV0FSRFMpO1xuXG4gICAgICAgIC8vIElmIHRoZSBzdGF0ZSBpcyBQUkVQQVJFRCBvciBDQVRDSFVQLCB3ZSdyZSBzdGlsbCB3YWl0aW5nIGZvciB0aGUganMtc2RrIHRvIHN5bmMgd2l0aFxuICAgICAgICAvLyB0aGUgSFMgYW5kIGZldGNoIHRoZSBsYXRlc3QgZXZlbnRzLCBzbyB3ZSBhcmUgZWZmZWN0aXZlbHkgZm9yd2FyZCBwYWdpbmF0aW5nLlxuICAgICAgICBjb25zdCBmb3J3YXJkUGFnaW5hdGluZyA9IChcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuZm9yd2FyZFBhZ2luYXRpbmcgfHxcbiAgICAgICAgICAgIFsnUFJFUEFSRUQnLCAnQ0FUQ0hVUCddLmluY2x1ZGVzKHRoaXMuc3RhdGUuY2xpZW50U3luY1N0YXRlKVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBldmVudHMgPSB0aGlzLnN0YXRlLmZpcnN0VmlzaWJsZUV2ZW50SW5kZXhcbiAgICAgICAgICAgICAgPyB0aGlzLnN0YXRlLmV2ZW50cy5zbGljZSh0aGlzLnN0YXRlLmZpcnN0VmlzaWJsZUV2ZW50SW5kZXgpXG4gICAgICAgICAgICAgIDogdGhpcy5zdGF0ZS5ldmVudHM7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8TWVzc2FnZVBhbmVsXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9tZXNzYWdlUGFuZWx9XG4gICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tfVxuICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcn1cbiAgICAgICAgICAgICAgICBoaWRkZW49e3RoaXMucHJvcHMuaGlkZGVufVxuICAgICAgICAgICAgICAgIGJhY2tQYWdpbmF0aW5nPXt0aGlzLnN0YXRlLmJhY2tQYWdpbmF0aW5nfVxuICAgICAgICAgICAgICAgIGZvcndhcmRQYWdpbmF0aW5nPXtmb3J3YXJkUGFnaW5hdGluZ31cbiAgICAgICAgICAgICAgICBldmVudHM9e2V2ZW50c31cbiAgICAgICAgICAgICAgICBoaWdobGlnaHRlZEV2ZW50SWQ9e3RoaXMucHJvcHMuaGlnaGxpZ2h0ZWRFdmVudElkfVxuICAgICAgICAgICAgICAgIHJlYWRNYXJrZXJFdmVudElkPXt0aGlzLnN0YXRlLnJlYWRNYXJrZXJFdmVudElkfVxuICAgICAgICAgICAgICAgIHJlYWRNYXJrZXJWaXNpYmxlPXt0aGlzLnN0YXRlLnJlYWRNYXJrZXJWaXNpYmxlfVxuICAgICAgICAgICAgICAgIHN1cHByZXNzRmlyc3REYXRlU2VwYXJhdG9yPXt0aGlzLnN0YXRlLmNhbkJhY2tQYWdpbmF0ZX1cbiAgICAgICAgICAgICAgICBzaG93VXJsUHJldmlldz17dGhpcy5wcm9wcy5zaG93VXJsUHJldmlld31cbiAgICAgICAgICAgICAgICBzaG93UmVhZFJlY2VpcHRzPXt0aGlzLnByb3BzLnNob3dSZWFkUmVjZWlwdHN9XG4gICAgICAgICAgICAgICAgb3VyVXNlcklkPXtNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkfVxuICAgICAgICAgICAgICAgIHN0aWNreUJvdHRvbT17c3RpY2t5Qm90dG9tfVxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLm9uTWVzc2FnZUxpc3RTY3JvbGx9XG4gICAgICAgICAgICAgICAgb25GaWxsUmVxdWVzdD17dGhpcy5vbk1lc3NhZ2VMaXN0RmlsbFJlcXVlc3R9XG4gICAgICAgICAgICAgICAgb25VbmZpbGxSZXF1ZXN0PXt0aGlzLm9uTWVzc2FnZUxpc3RVbmZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgIGlzVHdlbHZlSG91cj17dGhpcy5zdGF0ZS5pc1R3ZWx2ZUhvdXJ9XG4gICAgICAgICAgICAgICAgYWx3YXlzU2hvd1RpbWVzdGFtcHM9e3RoaXMuc3RhdGUuYWx3YXlzU2hvd1RpbWVzdGFtcHN9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgICAgICAgICB0aWxlU2hhcGU9e3RoaXMucHJvcHMudGlsZVNoYXBlfVxuICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50PXt0aGlzLmdldFJlbGF0aW9uc0ZvckV2ZW50fVxuICAgICAgICAgICAgICAgIGVkaXRTdGF0ZT17dGhpcy5zdGF0ZS5lZGl0U3RhdGV9XG4gICAgICAgICAgICAgICAgc2hvd1JlYWN0aW9ucz17dGhpcy5wcm9wcy5zaG93UmVhY3Rpb25zfVxuICAgICAgICAgICAgICAgIHVzZUlSQ0xheW91dD17dGhpcy5wcm9wcy51c2VJUkNMYXlvdXR9XG4gICAgICAgICAgICAgICAgZW5hYmxlRmxhaXI9e1NldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLkZsYWlyKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUaW1lbGluZVBhbmVsO1xuIl19
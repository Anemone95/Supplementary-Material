"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _PlatformPeg = _interopRequireDefault(require("../PlatformPeg"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _promise = require("../utils/promise");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _events = require("events");

var _SettingLevel = require("../settings/SettingLevel");

/*
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

/*
 * Event indexing class that wraps the platform specific event indexing.
 */
class EventIndex extends _events.EventEmitter {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "onSync", async (state, prevState, data) => {
      const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

      if (prevState === "PREPARED" && state === "SYNCING") {
        // If our indexer is empty we're most likely running Element the
        // first time with indexing support or running it with an
        // initial sync. Add checkpoints to crawl our encrypted rooms.
        const eventIndexWasEmpty = await indexManager.isEventIndexEmpty();
        if (eventIndexWasEmpty) await this.addInitialCheckpoints();
        this.startCrawler();
        return;
      }

      if (prevState === "SYNCING" && state === "SYNCING") {
        // A sync was done, presumably we queued up some live events,
        // commit them now.
        await indexManager.commitLiveEvents();
        return;
      }
    });
    (0, _defineProperty2.default)(this, "onRoomTimeline", async (ev, room, toStartOfTimeline, removed, data) => {
      // We only index encrypted rooms locally.
      if (!_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(room.roomId)) return; // If it isn't a live event or if it's redacted there's nothing to
      // do.

      if (toStartOfTimeline || !data || !data.liveEvent || ev.isRedacted()) {
        return;
      } // If the event is not yet decrypted mark it for the
      // Event.decrypted callback.


      if (ev.isBeingDecrypted()) {
        const eventId = ev.getId();
        this.liveEventsForIndex.add(eventId);
      } else {
        // If the event is decrypted or is unencrypted add it to the
        // index now.
        await this.addLiveEventToIndex(ev);
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvent", async (ev, state) => {
      if (!_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(state.roomId)) return;

      if (ev.getType() === "m.room.encryption" && !(await this.isRoomIndexed(state.roomId))) {
        console.log("EventIndex: Adding a checkpoint for a newly encrypted room", state.roomId);
        this.addRoomCheckpoint(state.roomId, true);
      }
    });
    (0, _defineProperty2.default)(this, "onEventDecrypted", async (ev, err) => {
      const eventId = ev.getId(); // If the event isn't in our live event set, ignore it.

      if (!this.liveEventsForIndex.delete(eventId)) return;
      if (err) return;
      await this.addLiveEventToIndex(ev);
    });
    (0, _defineProperty2.default)(this, "onRedaction", async (ev, room) => {
      // We only index encrypted rooms locally.
      if (!_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(room.roomId)) return;

      const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

      try {
        await indexManager.deleteEvent(ev.getAssociatedId());
      } catch (e) {
        console.log("EventIndex: Error deleting event from index", e);
      }
    });
    (0, _defineProperty2.default)(this, "onTimelineReset", async (room, timelineSet, resetAllTimelines) => {
      if (room === null) return;
      if (!_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(room.roomId)) return;
      console.log("EventIndex: Adding a checkpoint because of a limited timeline", room.roomId);
      this.addRoomCheckpoint(room.roomId, false);
    });
    this.crawlerCheckpoints = []; // The time in ms that the crawler will wait loop iterations if there
    // have not been any checkpoints to consume in the last iteration.

    this._crawlerIdleTime = 5000; // The maximum number of events our crawler should fetch in a single
    // crawl.

    this._eventsPerCrawl = 100;
    this._crawler = null;
    this._currentCheckpoint = null;
    this.liveEventsForIndex = new Set();
  }

  async init() {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    this.crawlerCheckpoints = await indexManager.loadCheckpoints();
    console.log("EventIndex: Loaded checkpoints", this.crawlerCheckpoints);
    this.registerListeners();
  }
  /**
   * Register event listeners that are necessary for the event index to work.
   */


  registerListeners() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    client.on('sync', this.onSync);
    client.on('Room.timeline', this.onRoomTimeline);
    client.on('Event.decrypted', this.onEventDecrypted);
    client.on('Room.timelineReset', this.onTimelineReset);
    client.on('Room.redaction', this.onRedaction);
    client.on('RoomState.events', this.onRoomStateEvent);
  }
  /**
   * Remove the event index specific event listeners.
   */


  removeListeners() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client === null) return;
    client.removeListener('sync', this.onSync);
    client.removeListener('Room.timeline', this.onRoomTimeline);
    client.removeListener('Event.decrypted', this.onEventDecrypted);
    client.removeListener('Room.timelineReset', this.onTimelineReset);
    client.removeListener('Room.redaction', this.onRedaction);
    client.removeListener('RoomState.events', this.onRoomStateEvent);
  }
  /**
   * Get crawler checkpoints for the encrypted rooms and store them in the index.
   */


  async addInitialCheckpoints() {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const rooms = client.getRooms();

    const isRoomEncrypted = room => {
      return client.isRoomEncrypted(room.roomId);
    }; // We only care to crawl the encrypted rooms, non-encrypted
    // rooms can use the search provided by the homeserver.


    const encryptedRooms = rooms.filter(isRoomEncrypted);
    console.log("EventIndex: Adding initial crawler checkpoints"); // Gather the prev_batch tokens and create checkpoints for
    // our message crawler.

    await Promise.all(encryptedRooms.map(async room => {
      const timeline = room.getLiveTimeline();
      const token = timeline.getPaginationToken("b");
      const backCheckpoint = {
        roomId: room.roomId,
        token: token,
        direction: "b",
        fullCrawl: true
      };
      const forwardCheckpoint = {
        roomId: room.roomId,
        token: token,
        direction: "f"
      };

      try {
        if (backCheckpoint.token) {
          await indexManager.addCrawlerCheckpoint(backCheckpoint);
          this.crawlerCheckpoints.push(backCheckpoint);
        }

        if (forwardCheckpoint.token) {
          await indexManager.addCrawlerCheckpoint(forwardCheckpoint);
          this.crawlerCheckpoints.push(forwardCheckpoint);
        }
      } catch (e) {
        console.log("EventIndex: Error adding initial checkpoints for room", room.roomId, backCheckpoint, forwardCheckpoint, e);
      }
    }));
  }
  /*
   * The sync event listener.
   *
   * The listener has two cases:
   *     - First sync after start up, check if the index is empty, add
   *         initial checkpoints, if so. Start the crawler background task.
   *     - Every other sync, tell the event index to commit all the queued up
   *         live events
   */


  /**
   * Check if an event should be added to the event index.
   *
   * Most notably we filter events for which decryption failed, are redacted
   * or aren't of a type that we know how to index.
   *
   * @param {MatrixEvent} ev The event that should checked.
   * @returns {bool} Returns true if the event can be indexed, false
   * otherwise.
   */
  isValidEvent(ev) {
    const isUsefulType = ["m.room.message", "m.room.name", "m.room.topic"].includes(ev.getType());
    const validEventType = isUsefulType && !ev.isRedacted() && !ev.isDecryptionFailure();
    let validMsgType = true;
    let hasContentValue = true;

    if (ev.getType() === "m.room.message" && !ev.isRedacted()) {
      // Expand this if there are more invalid msgtypes.
      const msgtype = ev.getContent().msgtype;
      if (!msgtype) validMsgType = false;else validMsgType = !msgtype.startsWith("m.key.verification");
      if (!ev.getContent().body) hasContentValue = false;
    } else if (ev.getType() === "m.room.topic" && !ev.isRedacted()) {
      if (!ev.getContent().topic) hasContentValue = false;
    } else if (ev.getType() === "m.room.name" && !ev.isRedacted()) {
      if (!ev.getContent().name) hasContentValue = false;
    }

    return validEventType && validMsgType && hasContentValue;
  }

  eventToJson(ev) {
    const jsonEvent = ev.toJSON();
    const e = ev.isEncrypted() ? jsonEvent.decrypted : jsonEvent;

    if (ev.isEncrypted()) {
      // Let us store some additional data so we can re-verify the event.
      // The js-sdk checks if an event is encrypted using the algorithm,
      // the sender key and ed25519 signing key are used to find the
      // correct device that sent the event which allows us to check the
      // verification state of the event, either directly or using cross
      // signing.
      e.curve25519Key = ev.getSenderKey();
      e.ed25519Key = ev.getClaimedEd25519Key();
      e.algorithm = ev.getWireContent().algorithm;
      e.forwardingCurve25519KeyChain = ev.getForwardingCurve25519KeyChain();
    } else {
      // Make sure that unencrypted events don't contain any of that data,
      // despite what the server might give to us.
      delete e.curve25519Key;
      delete e.ed25519Key;
      delete e.algorithm;
      delete e.forwardingCurve25519KeyChain;
    }

    return e;
  }
  /**
   * Queue up live events to be added to the event index.
   *
   * @param {MatrixEvent} ev The event that should be added to the index.
   */


  async addLiveEventToIndex(ev) {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    if (!this.isValidEvent(ev)) return;
    const e = this.eventToJson(ev);
    const profile = {
      displayname: ev.sender.rawDisplayName,
      avatar_url: ev.sender.getMxcAvatarUrl()
    };
    await indexManager.addEventToIndex(e, profile);
  }
  /**
   * Emmit that the crawler has changed the checkpoint that it's currently
   * handling.
   */


  emitNewCheckpoint() {
    this.emit("changedCheckpoint", this.currentRoom());
  }

  async addEventsFromLiveTimeline(timeline) {
    const events = timeline.getEvents();

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      await this.addLiveEventToIndex(ev);
    }
  }

  async addRoomCheckpoint(roomId, fullCrawl = false) {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(roomId);
    if (!room) return;
    const timeline = room.getLiveTimeline();
    const token = timeline.getPaginationToken("b");

    if (!token) {
      // The room doesn't contain any tokens, meaning the live timeline
      // contains all the events, add those to the index.
      await this.addEventsFromLiveTimeline(timeline);
      return;
    }

    const checkpoint = {
      roomId: room.roomId,
      token: token,
      fullCrawl: fullCrawl,
      direction: "b"
    };
    console.log("EventIndex: Adding checkpoint", checkpoint);

    try {
      await indexManager.addCrawlerCheckpoint(checkpoint);
    } catch (e) {
      console.log("EventIndex: Error adding new checkpoint for room", room.roomId, checkpoint, e);
    }

    this.crawlerCheckpoints.push(checkpoint);
  }
  /**
   * The main crawler loop.
   *
   * Goes through crawlerCheckpoints and fetches events from the server to be
   * added to the EventIndex.
   *
   * If a /room/{roomId}/messages request doesn't contain any events, stop the
   * crawl, otherwise create a new checkpoint and push it to the
   * crawlerCheckpoints queue so we go through them in a round-robin way.
   */


  async crawlerFunc() {
    let cancelled = false;

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    this._crawler = {};

    this._crawler.cancel = () => {
      cancelled = true;
    };

    let idle = false;

    while (!cancelled) {
      let sleepTime = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, 'crawlerSleepTime'); // Don't let the user configure a lower sleep time than 100 ms.


      sleepTime = Math.max(sleepTime, 100);

      if (idle) {
        sleepTime = this._crawlerIdleTime;
      }

      if (this._currentCheckpoint !== null) {
        this._currentCheckpoint = null;
        this.emitNewCheckpoint();
      }

      await (0, _promise.sleep)(sleepTime);

      if (cancelled) {
        break;
      }

      const checkpoint = this.crawlerCheckpoints.shift(); /// There is no checkpoint available currently, one may appear if
      // a sync with limited room timelines happens, so go back to sleep.

      if (checkpoint === undefined) {
        idle = true;
        continue;
      }

      this._currentCheckpoint = checkpoint;
      this.emitNewCheckpoint();
      idle = false; // We have a checkpoint, let us fetch some messages, again, very
      // conservatively to not bother our homeserver too much.

      const eventMapper = client.getEventMapper({
        preventReEmit: true
      }); // TODO we need to ensure to use member lazy loading with this
      // request so we get the correct profiles.

      let res;

      try {
        res = await client._createMessagesRequest(checkpoint.roomId, checkpoint.token, this._eventsPerCrawl, checkpoint.direction);
      } catch (e) {
        if (e.httpStatus === 403) {
          console.log("EventIndex: Removing checkpoint as we don't have ", "permissions to fetch messages from this room.", checkpoint);

          try {
            await indexManager.removeCrawlerCheckpoint(checkpoint);
          } catch (e) {
            console.log("EventIndex: Error removing checkpoint", checkpoint, e); // We don't push the checkpoint here back, it will
            // hopefully be removed after a restart. But let us
            // ignore it for now as we don't want to hammer the
            // endpoint.
          }

          continue;
        }

        console.log("EventIndex: Error crawling using checkpoint:", checkpoint, ",", e);
        this.crawlerCheckpoints.push(checkpoint);
        continue;
      }

      if (cancelled) {
        this.crawlerCheckpoints.push(checkpoint);
        break;
      }

      if (res.chunk.length === 0) {
        console.log("EventIndex: Done with the checkpoint", checkpoint); // We got to the start/end of our timeline, lets just
        // delete our checkpoint and go back to sleep.

        try {
          await indexManager.removeCrawlerCheckpoint(checkpoint);
        } catch (e) {
          console.log("EventIndex: Error removing checkpoint", checkpoint, e);
        }

        continue;
      } // Convert the plain JSON events into Matrix events so they get
      // decrypted if necessary.


      const matrixEvents = res.chunk.map(eventMapper);
      let stateEvents = [];

      if (res.state !== undefined) {
        stateEvents = res.state.map(eventMapper);
      }

      const profiles = {};
      stateEvents.forEach(ev => {
        if (ev.event.content && ev.event.content.membership === "join") {
          profiles[ev.event.sender] = {
            displayname: ev.event.content.displayname,
            avatar_url: ev.event.content.avatar_url
          };
        }
      });
      const decryptionPromises = [];
      matrixEvents.forEach(ev => {
        if (ev.isBeingDecrypted() || ev.isDecryptionFailure()) {
          // TODO the decryption promise is a private property, this
          // should either be made public or we should convert the
          // event that gets fired when decryption is done into a
          // promise using the once event emitter method:
          // https://nodejs.org/api/events.html#events_events_once_emitter_name
          decryptionPromises.push(ev._decryptionPromise);
        }
      }); // Let us wait for all the events to get decrypted.

      await Promise.all(decryptionPromises); // TODO if there are no events at this point we're missing a lot
      // decryption keys, do we want to retry this checkpoint at a later
      // stage?

      const filteredEvents = matrixEvents.filter(this.isValidEvent); // Collect the redaction events so we can delete the redacted events
      // from the index.

      const redactionEvents = matrixEvents.filter(ev => {
        return ev.getType() === "m.room.redaction";
      }); // Let us convert the events back into a format that EventIndex can
      // consume.

      const events = filteredEvents.map(ev => {
        const e = this.eventToJson(ev);
        let profile = {};
        if (e.sender in profiles) profile = profiles[e.sender];
        const object = {
          event: e,
          profile: profile
        };
        return object;
      });
      let newCheckpoint; // The token can be null for some reason. Don't create a checkpoint
      // in that case since adding it to the db will fail.

      if (res.end) {
        // Create a new checkpoint so we can continue crawling the room
        // for messages.
        newCheckpoint = {
          roomId: checkpoint.roomId,
          token: res.end,
          fullCrawl: checkpoint.fullCrawl,
          direction: checkpoint.direction
        };
      }

      try {
        for (let i = 0; i < redactionEvents.length; i++) {
          const ev = redactionEvents[i];
          const eventId = ev.getAssociatedId();

          if (eventId) {
            await indexManager.deleteEvent(eventId);
          } else {
            console.warn("EventIndex: Redaction event doesn't contain a valid associated event id", ev);
          }
        }

        const eventsAlreadyAdded = await indexManager.addHistoricEvents(events, newCheckpoint, checkpoint); // We didn't get a valid new checkpoint from the server, nothing
        // to do here anymore.

        if (!newCheckpoint) {
          console.log("EventIndex: The server didn't return a valid ", "new checkpoint, not continuing the crawl.", checkpoint);
          continue;
        } // If all events were already indexed we assume that we catched
        // up with our index and don't need to crawl the room further.
        // Let us delete the checkpoint in that case, otherwise push
        // the new checkpoint to be used by the crawler.


        if (eventsAlreadyAdded === true && newCheckpoint.fullCrawl !== true) {
          console.log("EventIndex: Checkpoint had already all events", "added, stopping the crawl", checkpoint);
          await indexManager.removeCrawlerCheckpoint(newCheckpoint);
        } else {
          if (eventsAlreadyAdded === true) {
            console.log("EventIndex: Checkpoint had already all events", "added, but continuing due to a full crawl", checkpoint);
          }

          this.crawlerCheckpoints.push(newCheckpoint);
        }
      } catch (e) {
        console.log("EventIndex: Error durring a crawl", e); // An error occurred, put the checkpoint back so we
        // can retry.

        this.crawlerCheckpoints.push(checkpoint);
      }
    }

    this._crawler = null;
  }
  /**
   * Start the crawler background task.
   */


  startCrawler() {
    if (this._crawler !== null) return;
    this.crawlerFunc();
  }
  /**
   * Stop the crawler background task.
   */


  stopCrawler() {
    if (this._crawler === null) return;

    this._crawler.cancel();
  }
  /**
   * Close the event index.
   *
   * This removes all the MatrixClient event listeners, stops the crawler
   * task, and closes the index.
   */


  async close() {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    this.removeListeners();
    this.stopCrawler();
    await indexManager.closeEventIndex();
    return;
  }
  /**
   * Search the event index using the given term for matching events.
   *
   * @param {SearchArgs} searchArgs The search configuration for the search,
   * sets the search term and determines the search result contents.
   *
   * @return {Promise<[SearchResult]>} A promise that will resolve to an array
   * of search results once the search is done.
   */


  async search(searchArgs) {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    return indexManager.searchEventIndex(searchArgs);
  }
  /**
   * Load events that contain URLs from the event index.
   *
   * @param {Room} room The room for which we should fetch events containing
   * URLs
   *
   * @param {number} limit The maximum number of events to fetch.
   *
   * @param {string} fromEvent From which event should we continue fetching
   * events from the index. This is only needed if we're continuing to fill
   * the timeline, e.g. if we're paginating. This needs to be set to a event
   * id of an event that was previously fetched with this function.
   *
   * @param {string} direction The direction in which we will continue
   * fetching events. EventTimeline.BACKWARDS to continue fetching events that
   * are older than the event given in fromEvent, EventTimeline.FORWARDS to
   * fetch newer events.
   *
   * @returns {Promise<MatrixEvent[]>} Resolves to an array of events that
   * contain URLs.
   */


  async loadFileEvents(room, limit = 10, fromEvent = null, direction = _eventTimeline.EventTimeline.BACKWARDS) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    const loadArgs = {
      roomId: room.roomId,
      limit: limit
    };

    if (fromEvent) {
      loadArgs.fromEvent = fromEvent;
      loadArgs.direction = direction;
    }

    let events; // Get our events from the event index.

    try {
      events = await indexManager.loadFileEvents(loadArgs);
    } catch (e) {
      console.log("EventIndex: Error getting file events", e);
      return [];
    }

    const eventMapper = client.getEventMapper(); // Turn the events into MatrixEvent objects.

    const matrixEvents = events.map(e => {
      const matrixEvent = eventMapper(e.event);
      const member = new _roomMember.RoomMember(room.roomId, matrixEvent.getSender()); // We can't really reconstruct the whole room state from our
      // EventIndex to calculate the correct display name. Use the
      // disambiguated form always instead.

      member.name = e.profile.displayname + " (" + matrixEvent.getSender() + ")"; // This is sets the avatar URL.

      const memberEvent = eventMapper({
        content: {
          membership: "join",
          avatar_url: e.profile.avatar_url,
          displayname: e.profile.displayname
        },
        type: "m.room.member",
        event_id: matrixEvent.getId() + ":eventIndex",
        room_id: matrixEvent.getRoomId(),
        sender: matrixEvent.getSender(),
        origin_server_ts: matrixEvent.getTs(),
        state_key: matrixEvent.getSender()
      }); // We set this manually to avoid emitting RoomMember.membership and
      // RoomMember.name events.

      member.events.member = memberEvent;
      matrixEvent.sender = member;
      return matrixEvent;
    });
    return matrixEvents;
  }
  /**
   * Fill a timeline with events that contain URLs.
   *
   * @param {TimelineSet} timelineSet The TimelineSet the Timeline belongs to,
   * used to check if we're adding duplicate events.
   *
   * @param {Timeline} timeline The Timeline which should be filed with
   * events.
   *
   * @param {Room} room The room for which we should fetch events containing
   * URLs
   *
   * @param {number} limit The maximum number of events to fetch.
   *
   * @param {string} fromEvent From which event should we continue fetching
   * events from the index. This is only needed if we're continuing to fill
   * the timeline, e.g. if we're paginating. This needs to be set to a event
   * id of an event that was previously fetched with this function.
   *
   * @param {string} direction The direction in which we will continue
   * fetching events. EventTimeline.BACKWARDS to continue fetching events that
   * are older than the event given in fromEvent, EventTimeline.FORWARDS to
   * fetch newer events.
   *
   * @returns {Promise<boolean>} Resolves to true if events were added to the
   * timeline, false otherwise.
   */


  async populateFileTimeline(timelineSet, timeline, room, limit = 10, fromEvent = null, direction = _eventTimeline.EventTimeline.BACKWARDS) {
    const matrixEvents = await this.loadFileEvents(room, limit, fromEvent, direction); // If this is a normal fill request, not a pagination request, we need
    // to get our events in the BACKWARDS direction but populate them in the
    // forwards direction.
    // This needs to happen because a fill request might come with an
    // exisitng timeline e.g. if you close and re-open the FilePanel.

    if (fromEvent === null) {
      matrixEvents.reverse();
      direction = direction == _eventTimeline.EventTimeline.BACKWARDS ? _eventTimeline.EventTimeline.FORWARDS : _eventTimeline.EventTimeline.BACKWARDS;
    } // Add the events to the timeline of the file panel.


    matrixEvents.forEach(e => {
      if (!timelineSet.eventIdToTimeline(e.getId())) {
        timelineSet.addEventToTimeline(e, timeline, direction == _eventTimeline.EventTimeline.BACKWARDS);
      }
    });
    let ret = false;
    let paginationToken = ""; // Set the pagination token to the oldest event that we retrieved.

    if (matrixEvents.length > 0) {
      paginationToken = matrixEvents[matrixEvents.length - 1].getId();
      ret = true;
    }

    console.log("EventIndex: Populating file panel with", matrixEvents.length, "events and setting the pagination token to", paginationToken);
    timeline.setPaginationToken(paginationToken, _eventTimeline.EventTimeline.BACKWARDS);
    return ret;
  }
  /**
   * Emulate a TimelineWindow pagination() request with the event index as the event source
   *
   * Might not fetch events from the index if the timeline already contains
   * events that the window isn't showing.
   *
   * @param {Room} room The room for which we should fetch events containing
   * URLs
   *
   * @param {TimelineWindow} timelineWindow The timeline window that should be
   * populated with new events.
   *
   * @param {string} direction The direction in which we should paginate.
   * EventTimeline.BACKWARDS to paginate back, EventTimeline.FORWARDS to
   * paginate forwards.
   *
   * @param {number} limit The maximum number of events to fetch while
   * paginating.
   *
   * @returns {Promise<boolean>} Resolves to a boolean which is true if more
   * events were successfully retrieved.
   */


  paginateTimelineWindow(room, timelineWindow, direction, limit) {
    const tl = timelineWindow.getTimelineIndex(direction);
    if (!tl) return Promise.resolve(false);
    if (tl.pendingPaginate) return tl.pendingPaginate;

    if (timelineWindow.extend(direction, limit)) {
      return Promise.resolve(true);
    }

    const paginationMethod = async (timelineWindow, timeline, room, direction, limit) => {
      const timelineSet = timelineWindow._timelineSet;
      const token = timeline.timeline.getPaginationToken(direction);
      const ret = await this.populateFileTimeline(timelineSet, timeline.timeline, room, limit, token, direction);
      timeline.pendingPaginate = null;
      timelineWindow.extend(direction, limit);
      return ret;
    };

    const paginationPromise = paginationMethod(timelineWindow, tl, room, direction, limit);
    tl.pendingPaginate = paginationPromise;
    return paginationPromise;
  }
  /**
   * Get statistical information of the index.
   *
   * @return {Promise<IndexStats>} A promise that will resolve to the index
   * statistics.
   */


  async getStats() {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    return indexManager.getStats();
  }
  /**
   * Check if the room with the given id is already indexed.
   *
   * @param {string} roomId The ID of the room which we want to check if it
   * has been already indexed.
   *
   * @return {Promise<boolean>} Returns true if the index contains events for
   * the given room, false otherwise.
   */


  async isRoomIndexed(roomId) {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    return indexManager.isRoomIndexed(roomId);
  }
  /**
   * Get the room that we are currently crawling.
   *
   * @returns {Room} A MatrixRoom that is being currently crawled, null
   * if no room is currently being crawled.
   */


  currentRoom() {
    if (this._currentCheckpoint === null && this.crawlerCheckpoints.length === 0) {
      return null;
    }

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (this._currentCheckpoint !== null) {
      return client.getRoom(this._currentCheckpoint.roomId);
    } else {
      return client.getRoom(this.crawlerCheckpoints[0].roomId);
    }
  }

  crawlingRooms() {
    const totalRooms = new Set();
    const crawlingRooms = new Set();
    this.crawlerCheckpoints.forEach((checkpoint, index) => {
      crawlingRooms.add(checkpoint.roomId);
    });

    if (this._currentCheckpoint !== null) {
      crawlingRooms.add(this._currentCheckpoint.roomId);
    }

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const rooms = client.getRooms();

    const isRoomEncrypted = room => {
      return client.isRoomEncrypted(room.roomId);
    };

    const encryptedRooms = rooms.filter(isRoomEncrypted);
    encryptedRooms.forEach((room, index) => {
      totalRooms.add(room.roomId);
    });
    return {
      crawlingRooms,
      totalRooms
    };
  }

}

exports.default = EventIndex;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmRleGluZy9FdmVudEluZGV4LmpzIl0sIm5hbWVzIjpbIkV2ZW50SW5kZXgiLCJFdmVudEVtaXR0ZXIiLCJjb25zdHJ1Y3RvciIsInN0YXRlIiwicHJldlN0YXRlIiwiZGF0YSIsImluZGV4TWFuYWdlciIsIlBsYXRmb3JtUGVnIiwiZ2V0IiwiZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIiLCJldmVudEluZGV4V2FzRW1wdHkiLCJpc0V2ZW50SW5kZXhFbXB0eSIsImFkZEluaXRpYWxDaGVja3BvaW50cyIsInN0YXJ0Q3Jhd2xlciIsImNvbW1pdExpdmVFdmVudHMiLCJldiIsInJvb20iLCJ0b1N0YXJ0T2ZUaW1lbGluZSIsInJlbW92ZWQiLCJNYXRyaXhDbGllbnRQZWciLCJpc1Jvb21FbmNyeXB0ZWQiLCJyb29tSWQiLCJsaXZlRXZlbnQiLCJpc1JlZGFjdGVkIiwiaXNCZWluZ0RlY3J5cHRlZCIsImV2ZW50SWQiLCJnZXRJZCIsImxpdmVFdmVudHNGb3JJbmRleCIsImFkZCIsImFkZExpdmVFdmVudFRvSW5kZXgiLCJnZXRUeXBlIiwiaXNSb29tSW5kZXhlZCIsImNvbnNvbGUiLCJsb2ciLCJhZGRSb29tQ2hlY2twb2ludCIsImVyciIsImRlbGV0ZSIsImRlbGV0ZUV2ZW50IiwiZ2V0QXNzb2NpYXRlZElkIiwiZSIsInRpbWVsaW5lU2V0IiwicmVzZXRBbGxUaW1lbGluZXMiLCJjcmF3bGVyQ2hlY2twb2ludHMiLCJfY3Jhd2xlcklkbGVUaW1lIiwiX2V2ZW50c1BlckNyYXdsIiwiX2NyYXdsZXIiLCJfY3VycmVudENoZWNrcG9pbnQiLCJTZXQiLCJpbml0IiwibG9hZENoZWNrcG9pbnRzIiwicmVnaXN0ZXJMaXN0ZW5lcnMiLCJjbGllbnQiLCJvbiIsIm9uU3luYyIsIm9uUm9vbVRpbWVsaW5lIiwib25FdmVudERlY3J5cHRlZCIsIm9uVGltZWxpbmVSZXNldCIsIm9uUmVkYWN0aW9uIiwib25Sb29tU3RhdGVFdmVudCIsInJlbW92ZUxpc3RlbmVycyIsInJlbW92ZUxpc3RlbmVyIiwicm9vbXMiLCJnZXRSb29tcyIsImVuY3J5cHRlZFJvb21zIiwiZmlsdGVyIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRpbWVsaW5lIiwiZ2V0TGl2ZVRpbWVsaW5lIiwidG9rZW4iLCJnZXRQYWdpbmF0aW9uVG9rZW4iLCJiYWNrQ2hlY2twb2ludCIsImRpcmVjdGlvbiIsImZ1bGxDcmF3bCIsImZvcndhcmRDaGVja3BvaW50IiwiYWRkQ3Jhd2xlckNoZWNrcG9pbnQiLCJwdXNoIiwiaXNWYWxpZEV2ZW50IiwiaXNVc2VmdWxUeXBlIiwiaW5jbHVkZXMiLCJ2YWxpZEV2ZW50VHlwZSIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJ2YWxpZE1zZ1R5cGUiLCJoYXNDb250ZW50VmFsdWUiLCJtc2d0eXBlIiwiZ2V0Q29udGVudCIsInN0YXJ0c1dpdGgiLCJib2R5IiwidG9waWMiLCJuYW1lIiwiZXZlbnRUb0pzb24iLCJqc29uRXZlbnQiLCJ0b0pTT04iLCJpc0VuY3J5cHRlZCIsImRlY3J5cHRlZCIsImN1cnZlMjU1MTlLZXkiLCJnZXRTZW5kZXJLZXkiLCJlZDI1NTE5S2V5IiwiZ2V0Q2xhaW1lZEVkMjU1MTlLZXkiLCJhbGdvcml0aG0iLCJnZXRXaXJlQ29udGVudCIsImZvcndhcmRpbmdDdXJ2ZTI1NTE5S2V5Q2hhaW4iLCJnZXRGb3J3YXJkaW5nQ3VydmUyNTUxOUtleUNoYWluIiwicHJvZmlsZSIsImRpc3BsYXluYW1lIiwic2VuZGVyIiwicmF3RGlzcGxheU5hbWUiLCJhdmF0YXJfdXJsIiwiZ2V0TXhjQXZhdGFyVXJsIiwiYWRkRXZlbnRUb0luZGV4IiwiZW1pdE5ld0NoZWNrcG9pbnQiLCJlbWl0IiwiY3VycmVudFJvb20iLCJhZGRFdmVudHNGcm9tTGl2ZVRpbWVsaW5lIiwiZXZlbnRzIiwiZ2V0RXZlbnRzIiwiaSIsImxlbmd0aCIsImdldFJvb20iLCJjaGVja3BvaW50IiwiY3Jhd2xlckZ1bmMiLCJjYW5jZWxsZWQiLCJjYW5jZWwiLCJpZGxlIiwic2xlZXBUaW1lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlQXQiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJNYXRoIiwibWF4Iiwic2hpZnQiLCJ1bmRlZmluZWQiLCJldmVudE1hcHBlciIsImdldEV2ZW50TWFwcGVyIiwicHJldmVudFJlRW1pdCIsInJlcyIsIl9jcmVhdGVNZXNzYWdlc1JlcXVlc3QiLCJodHRwU3RhdHVzIiwicmVtb3ZlQ3Jhd2xlckNoZWNrcG9pbnQiLCJjaHVuayIsIm1hdHJpeEV2ZW50cyIsInN0YXRlRXZlbnRzIiwicHJvZmlsZXMiLCJmb3JFYWNoIiwiZXZlbnQiLCJjb250ZW50IiwibWVtYmVyc2hpcCIsImRlY3J5cHRpb25Qcm9taXNlcyIsIl9kZWNyeXB0aW9uUHJvbWlzZSIsImZpbHRlcmVkRXZlbnRzIiwicmVkYWN0aW9uRXZlbnRzIiwib2JqZWN0IiwibmV3Q2hlY2twb2ludCIsImVuZCIsIndhcm4iLCJldmVudHNBbHJlYWR5QWRkZWQiLCJhZGRIaXN0b3JpY0V2ZW50cyIsInN0b3BDcmF3bGVyIiwiY2xvc2UiLCJjbG9zZUV2ZW50SW5kZXgiLCJzZWFyY2giLCJzZWFyY2hBcmdzIiwic2VhcmNoRXZlbnRJbmRleCIsImxvYWRGaWxlRXZlbnRzIiwibGltaXQiLCJmcm9tRXZlbnQiLCJFdmVudFRpbWVsaW5lIiwiQkFDS1dBUkRTIiwibG9hZEFyZ3MiLCJtYXRyaXhFdmVudCIsIm1lbWJlciIsIlJvb21NZW1iZXIiLCJnZXRTZW5kZXIiLCJtZW1iZXJFdmVudCIsInR5cGUiLCJldmVudF9pZCIsInJvb21faWQiLCJnZXRSb29tSWQiLCJvcmlnaW5fc2VydmVyX3RzIiwiZ2V0VHMiLCJzdGF0ZV9rZXkiLCJwb3B1bGF0ZUZpbGVUaW1lbGluZSIsInJldmVyc2UiLCJGT1JXQVJEUyIsImV2ZW50SWRUb1RpbWVsaW5lIiwiYWRkRXZlbnRUb1RpbWVsaW5lIiwicmV0IiwicGFnaW5hdGlvblRva2VuIiwic2V0UGFnaW5hdGlvblRva2VuIiwicGFnaW5hdGVUaW1lbGluZVdpbmRvdyIsInRpbWVsaW5lV2luZG93IiwidGwiLCJnZXRUaW1lbGluZUluZGV4IiwicmVzb2x2ZSIsInBlbmRpbmdQYWdpbmF0ZSIsImV4dGVuZCIsInBhZ2luYXRpb25NZXRob2QiLCJfdGltZWxpbmVTZXQiLCJwYWdpbmF0aW9uUHJvbWlzZSIsImdldFN0YXRzIiwiY3Jhd2xpbmdSb29tcyIsInRvdGFsUm9vbXMiLCJpbmRleCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFXQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxVQUFOLFNBQXlCQyxvQkFBekIsQ0FBc0M7QUFDakRDLEVBQUFBLFdBQVcsR0FBRztBQUNWO0FBRFUsa0RBd0hMLE9BQU9DLEtBQVAsRUFBY0MsU0FBZCxFQUF5QkMsSUFBekIsS0FBa0M7QUFDdkMsWUFBTUMsWUFBWSxHQUFHQyxxQkFBWUMsR0FBWixHQUFrQkMsdUJBQWxCLEVBQXJCOztBQUVBLFVBQUlMLFNBQVMsS0FBSyxVQUFkLElBQTRCRCxLQUFLLEtBQUssU0FBMUMsRUFBcUQ7QUFDakQ7QUFDQTtBQUNBO0FBQ0EsY0FBTU8sa0JBQWtCLEdBQUcsTUFBTUosWUFBWSxDQUFDSyxpQkFBYixFQUFqQztBQUNBLFlBQUlELGtCQUFKLEVBQXdCLE1BQU0sS0FBS0UscUJBQUwsRUFBTjtBQUV4QixhQUFLQyxZQUFMO0FBQ0E7QUFDSDs7QUFFRCxVQUFJVCxTQUFTLEtBQUssU0FBZCxJQUEyQkQsS0FBSyxLQUFLLFNBQXpDLEVBQW9EO0FBQ2hEO0FBQ0E7QUFDQSxjQUFNRyxZQUFZLENBQUNRLGdCQUFiLEVBQU47QUFDQTtBQUNIO0FBQ0osS0E1SWE7QUFBQSwwREFzSkcsT0FBT0MsRUFBUCxFQUFXQyxJQUFYLEVBQWlCQyxpQkFBakIs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Q0FBdUJKLElBQUksQ0FBQ0ssTUFBNUIsQ0FBUDtBQUNILEtBRkQ7O0FBSUEsVUFBTTBDLGNBQWMsR0FBR0YsS0FBSyxDQUFDRyxNQUFOLENBQWE1QyxlQUFiLENBQXZCO0FBQ0EyQyxJQUFBQSxjQUFjLENBQUNrRixPQUFmLENBQXVCLENBQUNqSSxJQUFELEVBQU80TCxLQUFQLEtBQWlCO0FBQ3BDRCxNQUFBQSxVQUFVLENBQUMvSyxHQUFYLENBQWVaLElBQUksQ0FBQ0ssTUFBcEI7QUFDSCxLQUZEO0FBSUEsV0FBTztBQUFDcUwsTUFBQUEsYUFBRDtBQUFnQkMsTUFBQUE7QUFBaEIsS0FBUDtBQUNIOztBQTE1QmdEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gXCIuLi9QbGF0Zm9ybVBlZ1wiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7Um9vbU1lbWJlcn0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyJztcbmltcG9ydCB7RXZlbnRUaW1lbGluZX0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50LXRpbWVsaW5lJztcbmltcG9ydCB7c2xlZXB9IGZyb20gXCIuLi91dGlscy9wcm9taXNlXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCB7U2V0dGluZ0xldmVsfSBmcm9tIFwiLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5cbi8qXG4gKiBFdmVudCBpbmRleGluZyBjbGFzcyB0aGF0IHdyYXBzIHRoZSBwbGF0Zm9ybSBzcGVjaWZpYyBldmVudCBpbmRleGluZy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRJbmRleCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzID0gW107XG4gICAgICAgIC8vIFRoZSB0aW1lIGluIG1zIHRoYXQgdGhlIGNyYXdsZXIgd2lsbCB3YWl0IGxvb3AgaXRlcmF0aW9ucyBpZiB0aGVyZVxuICAgICAgICAvLyBoYXZlIG5vdCBiZWVuIGFueSBjaGVja3BvaW50cyB0byBjb25zdW1lIGluIHRoZSBsYXN0IGl0ZXJhdGlvbi5cbiAgICAgICAgdGhpcy5fY3Jhd2xlcklkbGVUaW1lID0gNTAwMDtcbiAgICAgICAgLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyBvdXIgY3Jhd2xlciBzaG91bGQgZmV0Y2ggaW4gYSBzaW5nbGVcbiAgICAgICAgLy8gY3Jhd2wuXG4gICAgICAgIHRoaXMuX2V2ZW50c1BlckNyYXdsID0gMTAwO1xuICAgICAgICB0aGlzLl9jcmF3bGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY3VycmVudENoZWNrcG9pbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmxpdmVFdmVudHNGb3JJbmRleCA9IG5ldyBTZXQoKTtcbiAgICB9XG5cbiAgICBhc3luYyBpbml0KCkge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuXG4gICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzID0gYXdhaXQgaW5kZXhNYW5hZ2VyLmxvYWRDaGVja3BvaW50cygpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkV2ZW50SW5kZXg6IExvYWRlZCBjaGVja3BvaW50c1wiLCB0aGlzLmNyYXdsZXJDaGVja3BvaW50cyk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGV2ZW50IGxpc3RlbmVycyB0aGF0IGFyZSBuZWNlc3NhcnkgZm9yIHRoZSBldmVudCBpbmRleCB0byB3b3JrLlxuICAgICAqL1xuICAgIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgY2xpZW50Lm9uKCdzeW5jJywgdGhpcy5vblN5bmMpO1xuICAgICAgICBjbGllbnQub24oJ1Jvb20udGltZWxpbmUnLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgY2xpZW50Lm9uKCdFdmVudC5kZWNyeXB0ZWQnLCB0aGlzLm9uRXZlbnREZWNyeXB0ZWQpO1xuICAgICAgICBjbGllbnQub24oJ1Jvb20udGltZWxpbmVSZXNldCcsIHRoaXMub25UaW1lbGluZVJlc2V0KTtcbiAgICAgICAgY2xpZW50Lm9uKCdSb29tLnJlZGFjdGlvbicsIHRoaXMub25SZWRhY3Rpb24pO1xuICAgICAgICBjbGllbnQub24oJ1Jvb21TdGF0ZS5ldmVudHMnLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSB0aGUgZXZlbnQgaW5kZXggc3BlY2lmaWMgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAqL1xuICAgIHJlbW92ZUxpc3RlbmVycygpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpZW50ID09PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdzeW5jJywgdGhpcy5vblN5bmMpO1xuICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ1Jvb20udGltZWxpbmUnLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdFdmVudC5kZWNyeXB0ZWQnLCB0aGlzLm9uRXZlbnREZWNyeXB0ZWQpO1xuICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ1Jvb20udGltZWxpbmVSZXNldCcsIHRoaXMub25UaW1lbGluZVJlc2V0KTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdSb29tLnJlZGFjdGlvbicsIHRoaXMub25SZWRhY3Rpb24pO1xuICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ1Jvb21TdGF0ZS5ldmVudHMnLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBjcmF3bGVyIGNoZWNrcG9pbnRzIGZvciB0aGUgZW5jcnlwdGVkIHJvb21zIGFuZCBzdG9yZSB0aGVtIGluIHRoZSBpbmRleC5cbiAgICAgKi9cbiAgICBhc3luYyBhZGRJbml0aWFsQ2hlY2twb2ludHMoKSB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbXMgPSBjbGllbnQuZ2V0Um9vbXMoKTtcblxuICAgICAgICBjb25zdCBpc1Jvb21FbmNyeXB0ZWQgPSAocm9vbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5pc1Jvb21FbmNyeXB0ZWQocm9vbS5yb29tSWQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFdlIG9ubHkgY2FyZSB0byBjcmF3bCB0aGUgZW5jcnlwdGVkIHJvb21zLCBub24tZW5jcnlwdGVkXG4gICAgICAgIC8vIHJvb21zIGNhbiB1c2UgdGhlIHNlYXJjaCBwcm92aWRlZCBieSB0aGUgaG9tZXNlcnZlci5cbiAgICAgICAgY29uc3QgZW5jcnlwdGVkUm9vbXMgPSByb29tcy5maWx0ZXIoaXNSb29tRW5jcnlwdGVkKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIkV2ZW50SW5kZXg6IEFkZGluZyBpbml0aWFsIGNyYXdsZXIgY2hlY2twb2ludHNcIik7XG5cbiAgICAgICAgLy8gR2F0aGVyIHRoZSBwcmV2X2JhdGNoIHRva2VucyBhbmQgY3JlYXRlIGNoZWNrcG9pbnRzIGZvclxuICAgICAgICAvLyBvdXIgbWVzc2FnZSBjcmF3bGVyLlxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChlbmNyeXB0ZWRSb29tcy5tYXAoYXN5bmMgKHJvb20pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVsaW5lID0gcm9vbS5nZXRMaXZlVGltZWxpbmUoKTtcbiAgICAgICAgICAgIGNvbnN0IHRva2VuID0gdGltZWxpbmUuZ2V0UGFnaW5hdGlvblRva2VuKFwiYlwiKTtcblxuICAgICAgICAgICAgY29uc3QgYmFja0NoZWNrcG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgcm9vbUlkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICB0b2tlbjogdG9rZW4sXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBcImJcIixcbiAgICAgICAgICAgICAgICBmdWxsQ3Jhd2w6IHRydWUsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBmb3J3YXJkQ2hlY2twb2ludCA9IHtcbiAgICAgICAgICAgICAgICByb29tSWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IFwiZlwiLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoYmFja0NoZWNrcG9pbnQudG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgaW5kZXhNYW5hZ2VyLmFkZENyYXdsZXJDaGVja3BvaW50KGJhY2tDaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMucHVzaChiYWNrQ2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZvcndhcmRDaGVja3BvaW50LnRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5hZGRDcmF3bGVyQ2hlY2twb2ludChmb3J3YXJkQ2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLnB1c2goZm9yd2FyZENoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgXCJFdmVudEluZGV4OiBFcnJvciBhZGRpbmcgaW5pdGlhbCBjaGVja3BvaW50cyBmb3Igcm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgYmFja0NoZWNrcG9pbnQsXG4gICAgICAgICAgICAgICAgICAgIGZvcndhcmRDaGVja3BvaW50LFxuICAgICAgICAgICAgICAgICAgICBlLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFRoZSBzeW5jIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogVGhlIGxpc3RlbmVyIGhhcyB0d28gY2FzZXM6XG4gICAgICogICAgIC0gRmlyc3Qgc3luYyBhZnRlciBzdGFydCB1cCwgY2hlY2sgaWYgdGhlIGluZGV4IGlzIGVtcHR5LCBhZGRcbiAgICAgKiAgICAgICAgIGluaXRpYWwgY2hlY2twb2ludHMsIGlmIHNvLiBTdGFydCB0aGUgY3Jhd2xlciBiYWNrZ3JvdW5kIHRhc2suXG4gICAgICogICAgIC0gRXZlcnkgb3RoZXIgc3luYywgdGVsbCB0aGUgZXZlbnQgaW5kZXggdG8gY29tbWl0IGFsbCB0aGUgcXVldWVkIHVwXG4gICAgICogICAgICAgICBsaXZlIGV2ZW50c1xuICAgICAqL1xuICAgIG9uU3luYyA9IGFzeW5jIChzdGF0ZSwgcHJldlN0YXRlLCBkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG5cbiAgICAgICAgaWYgKHByZXZTdGF0ZSA9PT0gXCJQUkVQQVJFRFwiICYmIHN0YXRlID09PSBcIlNZTkNJTkdcIikge1xuICAgICAgICAgICAgLy8gSWYgb3VyIGluZGV4ZXIgaXMgZW1wdHkgd2UncmUgbW9zdCBsaWtlbHkgcnVubmluZyBFbGVtZW50IHRoZVxuICAgICAgICAgICAgLy8gZmlyc3QgdGltZSB3aXRoIGluZGV4aW5nIHN1cHBvcnQgb3IgcnVubmluZyBpdCB3aXRoIGFuXG4gICAgICAgICAgICAvLyBpbml0aWFsIHN5bmMuIEFkZCBjaGVja3BvaW50cyB0byBjcmF3bCBvdXIgZW5jcnlwdGVkIHJvb21zLlxuICAgICAgICAgICAgY29uc3QgZXZlbnRJbmRleFdhc0VtcHR5ID0gYXdhaXQgaW5kZXhNYW5hZ2VyLmlzRXZlbnRJbmRleEVtcHR5KCk7XG4gICAgICAgICAgICBpZiAoZXZlbnRJbmRleFdhc0VtcHR5KSBhd2FpdCB0aGlzLmFkZEluaXRpYWxDaGVja3BvaW50cygpO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXJ0Q3Jhd2xlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByZXZTdGF0ZSA9PT0gXCJTWU5DSU5HXCIgJiYgc3RhdGUgPT09IFwiU1lOQ0lOR1wiKSB7XG4gICAgICAgICAgICAvLyBBIHN5bmMgd2FzIGRvbmUsIHByZXN1bWFibHkgd2UgcXVldWVkIHVwIHNvbWUgbGl2ZSBldmVudHMsXG4gICAgICAgICAgICAvLyBjb21taXQgdGhlbSBub3cuXG4gICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIuY29tbWl0TGl2ZUV2ZW50cygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBUaGUgUm9vbS50aW1lbGluZSBsaXN0ZW5lci5cbiAgICAgKlxuICAgICAqIFRoaXMgbGlzdGVuZXIgd2FpdHMgZm9yIGxpdmUgZXZlbnRzIGluIGVuY3J5cHRlZCByb29tcywgaWYgdGhleSBhcmVcbiAgICAgKiBkZWNyeXB0ZWQgb3IgdW5lbmNyeXB0ZWQgd2UgcXVldWUgdGhlbSB0byBiZSBhZGRlZCB0byB0aGUgaW5kZXgsXG4gICAgICogb3RoZXJ3aXNlIHdlIHNhdmUgdGhlaXIgZXZlbnQgaWQgYW5kIHdhaXQgZm9yIHRoZW0gaW4gdGhlIEV2ZW50LmRlY3J5cHRlZFxuICAgICAqIGxpc3RlbmVyLlxuICAgICAqL1xuICAgIG9uUm9vbVRpbWVsaW5lID0gYXN5bmMgKGV2LCByb29tLCB0b1N0YXJ0T2ZUaW1lbGluZSwgcmVtb3ZlZCwgZGF0YSkgPT4ge1xuICAgICAgICAvLyBXZSBvbmx5IGluZGV4IGVuY3J5cHRlZCByb29tcyBsb2NhbGx5LlxuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQocm9vbS5yb29tSWQpKSByZXR1cm47XG5cbiAgICAgICAgLy8gSWYgaXQgaXNuJ3QgYSBsaXZlIGV2ZW50IG9yIGlmIGl0J3MgcmVkYWN0ZWQgdGhlcmUncyBub3RoaW5nIHRvXG4gICAgICAgIC8vIGRvLlxuICAgICAgICBpZiAodG9TdGFydE9mVGltZWxpbmUgfHwgIWRhdGEgfHwgIWRhdGEubGl2ZUV2ZW50XG4gICAgICAgICAgICB8fCBldi5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSBldmVudCBpcyBub3QgeWV0IGRlY3J5cHRlZCBtYXJrIGl0IGZvciB0aGVcbiAgICAgICAgLy8gRXZlbnQuZGVjcnlwdGVkIGNhbGxiYWNrLlxuICAgICAgICBpZiAoZXYuaXNCZWluZ0RlY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudElkID0gZXYuZ2V0SWQoKTtcbiAgICAgICAgICAgIHRoaXMubGl2ZUV2ZW50c0ZvckluZGV4LmFkZChldmVudElkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBldmVudCBpcyBkZWNyeXB0ZWQgb3IgaXMgdW5lbmNyeXB0ZWQgYWRkIGl0IHRvIHRoZVxuICAgICAgICAgICAgLy8gaW5kZXggbm93LlxuICAgICAgICAgICAgYXdhaXQgdGhpcy5hZGRMaXZlRXZlbnRUb0luZGV4KGV2KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUm9vbVN0YXRlRXZlbnQgPSBhc3luYyAoZXYsIHN0YXRlKSA9PiB7XG4gICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzUm9vbUVuY3J5cHRlZChzdGF0ZS5yb29tSWQpKSByZXR1cm47XG5cbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PT0gXCJtLnJvb20uZW5jcnlwdGlvblwiICYmICFhd2FpdCB0aGlzLmlzUm9vbUluZGV4ZWQoc3RhdGUucm9vbUlkKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBBZGRpbmcgYSBjaGVja3BvaW50IGZvciBhIG5ld2x5IGVuY3J5cHRlZCByb29tXCIsIHN0YXRlLnJvb21JZCk7XG4gICAgICAgICAgICB0aGlzLmFkZFJvb21DaGVja3BvaW50KHN0YXRlLnJvb21JZCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFRoZSBFdmVudC5kZWNyeXB0ZWQgbGlzdGVuZXIuXG4gICAgICpcbiAgICAgKiBDaGVja3MgaWYgdGhlIGV2ZW50IHdhcyBtYXJrZWQgZm9yIGFkZGl0aW9uIGluIHRoZSBSb29tLnRpbWVsaW5lXG4gICAgICogbGlzdGVuZXIsIGlmIHNvIHF1ZXVlcyBpdCB1cCB0byBiZSBhZGRlZCB0byB0aGUgaW5kZXguXG4gICAgICovXG4gICAgb25FdmVudERlY3J5cHRlZCA9IGFzeW5jIChldiwgZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSBldi5nZXRJZCgpO1xuXG4gICAgICAgIC8vIElmIHRoZSBldmVudCBpc24ndCBpbiBvdXIgbGl2ZSBldmVudCBzZXQsIGlnbm9yZSBpdC5cbiAgICAgICAgaWYgKCF0aGlzLmxpdmVFdmVudHNGb3JJbmRleC5kZWxldGUoZXZlbnRJZCkpIHJldHVybjtcbiAgICAgICAgaWYgKGVycikgcmV0dXJuO1xuICAgICAgICBhd2FpdCB0aGlzLmFkZExpdmVFdmVudFRvSW5kZXgoZXYpO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogVGhlIFJvb20ucmVkYWN0aW9uIGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogUmVtb3ZlcyBhIHJlZGFjdGVkIGV2ZW50IGZyb20gb3VyIGV2ZW50IGluZGV4LlxuICAgICAqL1xuICAgIG9uUmVkYWN0aW9uID0gYXN5bmMgKGV2LCByb29tKSA9PiB7XG4gICAgICAgIC8vIFdlIG9ubHkgaW5kZXggZW5jcnlwdGVkIHJvb21zIGxvY2FsbHkuXG4gICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzUm9vbUVuY3J5cHRlZChyb29tLnJvb21JZCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgaW5kZXhNYW5hZ2VyID0gUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgaW5kZXhNYW5hZ2VyLmRlbGV0ZUV2ZW50KGV2LmdldEFzc29jaWF0ZWRJZCgpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBFcnJvciBkZWxldGluZyBldmVudCBmcm9tIGluZGV4XCIsIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBUaGUgUm9vbS50aW1lbGluZVJlc2V0IGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogTGlzdGVucyBmb3IgdGltZWxpbmUgcmVzZXRzIHRoYXQgYXJlIGNhdXNlZCBieSBhIGxpbWl0ZWQgdGltZWxpbmUgdG9cbiAgICAgKiByZS1hZGQgY2hlY2twb2ludHMgZm9yIHJvb21zIHRoYXQgbmVlZCB0byBiZSBjcmF3bGVkIGFnYWluLlxuICAgICAqL1xuICAgIG9uVGltZWxpbmVSZXNldCA9IGFzeW5jIChyb29tLCB0aW1lbGluZVNldCwgcmVzZXRBbGxUaW1lbGluZXMpID0+IHtcbiAgICAgICAgaWYgKHJvb20gPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNSb29tRW5jcnlwdGVkKHJvb20ucm9vbUlkKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogQWRkaW5nIGEgY2hlY2twb2ludCBiZWNhdXNlIG9mIGEgbGltaXRlZCB0aW1lbGluZVwiLFxuICAgICAgICAgICAgcm9vbS5yb29tSWQpO1xuXG4gICAgICAgIHRoaXMuYWRkUm9vbUNoZWNrcG9pbnQocm9vbS5yb29tSWQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhbiBldmVudCBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIGV2ZW50IGluZGV4LlxuICAgICAqXG4gICAgICogTW9zdCBub3RhYmx5IHdlIGZpbHRlciBldmVudHMgZm9yIHdoaWNoIGRlY3J5cHRpb24gZmFpbGVkLCBhcmUgcmVkYWN0ZWRcbiAgICAgKiBvciBhcmVuJ3Qgb2YgYSB0eXBlIHRoYXQgd2Uga25vdyBob3cgdG8gaW5kZXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge01hdHJpeEV2ZW50fSBldiBUaGUgZXZlbnQgdGhhdCBzaG91bGQgY2hlY2tlZC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbH0gUmV0dXJucyB0cnVlIGlmIHRoZSBldmVudCBjYW4gYmUgaW5kZXhlZCwgZmFsc2VcbiAgICAgKiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgaXNWYWxpZEV2ZW50KGV2KSB7XG4gICAgICAgIGNvbnN0IGlzVXNlZnVsVHlwZSA9IFtcIm0ucm9vbS5tZXNzYWdlXCIsIFwibS5yb29tLm5hbWVcIiwgXCJtLnJvb20udG9waWNcIl0uaW5jbHVkZXMoZXYuZ2V0VHlwZSgpKTtcbiAgICAgICAgY29uc3QgdmFsaWRFdmVudFR5cGUgPSBpc1VzZWZ1bFR5cGUgJiYgIWV2LmlzUmVkYWN0ZWQoKSAmJiAhZXYuaXNEZWNyeXB0aW9uRmFpbHVyZSgpO1xuXG4gICAgICAgIGxldCB2YWxpZE1zZ1R5cGUgPSB0cnVlO1xuICAgICAgICBsZXQgaGFzQ29udGVudFZhbHVlID0gdHJ1ZTtcblxuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS5tZXNzYWdlXCIgJiYgIWV2LmlzUmVkYWN0ZWQoKSkge1xuICAgICAgICAgICAgLy8gRXhwYW5kIHRoaXMgaWYgdGhlcmUgYXJlIG1vcmUgaW52YWxpZCBtc2d0eXBlcy5cbiAgICAgICAgICAgIGNvbnN0IG1zZ3R5cGUgPSBldi5nZXRDb250ZW50KCkubXNndHlwZTtcblxuICAgICAgICAgICAgaWYgKCFtc2d0eXBlKSB2YWxpZE1zZ1R5cGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsc2UgdmFsaWRNc2dUeXBlID0gIW1zZ3R5cGUuc3RhcnRzV2l0aChcIm0ua2V5LnZlcmlmaWNhdGlvblwiKTtcblxuICAgICAgICAgICAgaWYgKCFldi5nZXRDb250ZW50KCkuYm9keSkgaGFzQ29udGVudFZhbHVlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZXYuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS50b3BpY1wiICYmICFldi5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgIGlmICghZXYuZ2V0Q29udGVudCgpLnRvcGljKSBoYXNDb250ZW50VmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChldi5nZXRUeXBlKCkgPT09IFwibS5yb29tLm5hbWVcIiAmJiAhZXYuaXNSZWRhY3RlZCgpKSB7XG4gICAgICAgICAgICBpZiAoIWV2LmdldENvbnRlbnQoKS5uYW1lKSBoYXNDb250ZW50VmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWxpZEV2ZW50VHlwZSAmJiB2YWxpZE1zZ1R5cGUgJiYgaGFzQ29udGVudFZhbHVlO1xuICAgIH1cblxuICAgIGV2ZW50VG9Kc29uKGV2KSB7XG4gICAgICAgIGNvbnN0IGpzb25FdmVudCA9IGV2LnRvSlNPTigpO1xuICAgICAgICBjb25zdCBlID0gZXYuaXNFbmNyeXB0ZWQoKSA/IGpzb25FdmVudC5kZWNyeXB0ZWQgOiBqc29uRXZlbnQ7XG5cbiAgICAgICAgaWYgKGV2LmlzRW5jcnlwdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIExldCB1cyBzdG9yZSBzb21lIGFkZGl0aW9uYWwgZGF0YSBzbyB3ZSBjYW4gcmUtdmVyaWZ5IHRoZSBldmVudC5cbiAgICAgICAgICAgIC8vIFRoZSBqcy1zZGsgY2hlY2tzIGlmIGFuIGV2ZW50IGlzIGVuY3J5cHRlZCB1c2luZyB0aGUgYWxnb3JpdGhtLFxuICAgICAgICAgICAgLy8gdGhlIHNlbmRlciBrZXkgYW5kIGVkMjU1MTkgc2lnbmluZyBrZXkgYXJlIHVzZWQgdG8gZmluZCB0aGVcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgZGV2aWNlIHRoYXQgc2VudCB0aGUgZXZlbnQgd2hpY2ggYWxsb3dzIHVzIHRvIGNoZWNrIHRoZVxuICAgICAgICAgICAgLy8gdmVyaWZpY2F0aW9uIHN0YXRlIG9mIHRoZSBldmVudCwgZWl0aGVyIGRpcmVjdGx5IG9yIHVzaW5nIGNyb3NzXG4gICAgICAgICAgICAvLyBzaWduaW5nLlxuICAgICAgICAgICAgZS5jdXJ2ZTI1NTE5S2V5ID0gZXYuZ2V0U2VuZGVyS2V5KCk7XG4gICAgICAgICAgICBlLmVkMjU1MTlLZXkgPSBldi5nZXRDbGFpbWVkRWQyNTUxOUtleSgpO1xuICAgICAgICAgICAgZS5hbGdvcml0aG0gPSBldi5nZXRXaXJlQ29udGVudCgpLmFsZ29yaXRobTtcbiAgICAgICAgICAgIGUuZm9yd2FyZGluZ0N1cnZlMjU1MTlLZXlDaGFpbiA9IGV2LmdldEZvcndhcmRpbmdDdXJ2ZTI1NTE5S2V5Q2hhaW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHVuZW5jcnlwdGVkIGV2ZW50cyBkb24ndCBjb250YWluIGFueSBvZiB0aGF0IGRhdGEsXG4gICAgICAgICAgICAvLyBkZXNwaXRlIHdoYXQgdGhlIHNlcnZlciBtaWdodCBnaXZlIHRvIHVzLlxuICAgICAgICAgICAgZGVsZXRlIGUuY3VydmUyNTUxOUtleTtcbiAgICAgICAgICAgIGRlbGV0ZSBlLmVkMjU1MTlLZXk7XG4gICAgICAgICAgICBkZWxldGUgZS5hbGdvcml0aG07XG4gICAgICAgICAgICBkZWxldGUgZS5mb3J3YXJkaW5nQ3VydmUyNTUxOUtleUNoYWluO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUXVldWUgdXAgbGl2ZSBldmVudHMgdG8gYmUgYWRkZWQgdG8gdGhlIGV2ZW50IGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtNYXRyaXhFdmVudH0gZXYgVGhlIGV2ZW50IHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBpbmRleC5cbiAgICAgKi9cbiAgICBhc3luYyBhZGRMaXZlRXZlbnRUb0luZGV4KGV2KSB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRFdmVudChldikpIHJldHVybjtcblxuICAgICAgICBjb25zdCBlID0gdGhpcy5ldmVudFRvSnNvbihldik7XG5cbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHtcbiAgICAgICAgICAgIGRpc3BsYXluYW1lOiBldi5zZW5kZXIucmF3RGlzcGxheU5hbWUsXG4gICAgICAgICAgICBhdmF0YXJfdXJsOiBldi5zZW5kZXIuZ2V0TXhjQXZhdGFyVXJsKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgYXdhaXQgaW5kZXhNYW5hZ2VyLmFkZEV2ZW50VG9JbmRleChlLCBwcm9maWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbW1pdCB0aGF0IHRoZSBjcmF3bGVyIGhhcyBjaGFuZ2VkIHRoZSBjaGVja3BvaW50IHRoYXQgaXQncyBjdXJyZW50bHlcbiAgICAgKiBoYW5kbGluZy5cbiAgICAgKi9cbiAgICBlbWl0TmV3Q2hlY2twb2ludCgpIHtcbiAgICAgICAgdGhpcy5lbWl0KFwiY2hhbmdlZENoZWNrcG9pbnRcIiwgdGhpcy5jdXJyZW50Um9vbSgpKTtcbiAgICB9XG5cbiAgICBhc3luYyBhZGRFdmVudHNGcm9tTGl2ZVRpbWVsaW5lKHRpbWVsaW5lKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IHRpbWVsaW5lLmdldEV2ZW50cygpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBldiA9IGV2ZW50c1tpXTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYWRkTGl2ZUV2ZW50VG9JbmRleChldik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBhZGRSb29tQ2hlY2twb2ludChyb29tSWQsIGZ1bGxDcmF3bCA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHJvb21JZCk7XG5cbiAgICAgICAgaWYgKCFyb29tKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgdGltZWxpbmUgPSByb29tLmdldExpdmVUaW1lbGluZSgpO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRpbWVsaW5lLmdldFBhZ2luYXRpb25Ub2tlbihcImJcIik7XG5cbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgICAgLy8gVGhlIHJvb20gZG9lc24ndCBjb250YWluIGFueSB0b2tlbnMsIG1lYW5pbmcgdGhlIGxpdmUgdGltZWxpbmVcbiAgICAgICAgICAgIC8vIGNvbnRhaW5zIGFsbCB0aGUgZXZlbnRzLCBhZGQgdGhvc2UgdG8gdGhlIGluZGV4LlxuICAgICAgICAgICAgYXdhaXQgdGhpcy5hZGRFdmVudHNGcm9tTGl2ZVRpbWVsaW5lKHRpbWVsaW5lKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB7XG4gICAgICAgICAgICByb29tSWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgdG9rZW46IHRva2VuLFxuICAgICAgICAgICAgZnVsbENyYXdsOiBmdWxsQ3Jhd2wsXG4gICAgICAgICAgICBkaXJlY3Rpb246IFwiYlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogQWRkaW5nIGNoZWNrcG9pbnRcIiwgY2hlY2twb2ludCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5hZGRDcmF3bGVyQ2hlY2twb2ludChjaGVja3BvaW50KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgXCJFdmVudEluZGV4OiBFcnJvciBhZGRpbmcgbmV3IGNoZWNrcG9pbnQgZm9yIHJvb21cIixcbiAgICAgICAgICAgICAgICByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICBjaGVja3BvaW50LFxuICAgICAgICAgICAgICAgIGUsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMucHVzaChjaGVja3BvaW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWFpbiBjcmF3bGVyIGxvb3AuXG4gICAgICpcbiAgICAgKiBHb2VzIHRocm91Z2ggY3Jhd2xlckNoZWNrcG9pbnRzIGFuZCBmZXRjaGVzIGV2ZW50cyBmcm9tIHRoZSBzZXJ2ZXIgdG8gYmVcbiAgICAgKiBhZGRlZCB0byB0aGUgRXZlbnRJbmRleC5cbiAgICAgKlxuICAgICAqIElmIGEgL3Jvb20ve3Jvb21JZH0vbWVzc2FnZXMgcmVxdWVzdCBkb2Vzbid0IGNvbnRhaW4gYW55IGV2ZW50cywgc3RvcCB0aGVcbiAgICAgKiBjcmF3bCwgb3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBjaGVja3BvaW50IGFuZCBwdXNoIGl0IHRvIHRoZVxuICAgICAqIGNyYXdsZXJDaGVja3BvaW50cyBxdWV1ZSBzbyB3ZSBnbyB0aHJvdWdoIHRoZW0gaW4gYSByb3VuZC1yb2JpbiB3YXkuXG4gICAgICovXG4gICAgYXN5bmMgY3Jhd2xlckZ1bmMoKSB7XG4gICAgICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG5cbiAgICAgICAgdGhpcy5fY3Jhd2xlciA9IHt9O1xuXG4gICAgICAgIHRoaXMuX2NyYXdsZXIuY2FuY2VsID0gKCkgPT4ge1xuICAgICAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaWRsZSA9IGZhbHNlO1xuXG4gICAgICAgIHdoaWxlICghY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICBsZXQgc2xlZXBUaW1lID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFNldHRpbmdMZXZlbC5ERVZJQ0UsICdjcmF3bGVyU2xlZXBUaW1lJyk7XG5cbiAgICAgICAgICAgIC8vIERvbid0IGxldCB0aGUgdXNlciBjb25maWd1cmUgYSBsb3dlciBzbGVlcCB0aW1lIHRoYW4gMTAwIG1zLlxuICAgICAgICAgICAgc2xlZXBUaW1lID0gTWF0aC5tYXgoc2xlZXBUaW1lLCAxMDApO1xuXG4gICAgICAgICAgICBpZiAoaWRsZSkge1xuICAgICAgICAgICAgICAgIHNsZWVwVGltZSA9IHRoaXMuX2NyYXdsZXJJZGxlVGltZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRDaGVja3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudENoZWNrcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdE5ld0NoZWNrcG9pbnQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXdhaXQgc2xlZXAoc2xlZXBUaW1lKTtcblxuICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjaGVja3BvaW50ID0gdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMuc2hpZnQoKTtcblxuICAgICAgICAgICAgLy8vIFRoZXJlIGlzIG5vIGNoZWNrcG9pbnQgYXZhaWxhYmxlIGN1cnJlbnRseSwgb25lIG1heSBhcHBlYXIgaWZcbiAgICAgICAgICAgIC8vIGEgc3luYyB3aXRoIGxpbWl0ZWQgcm9vbSB0aW1lbGluZXMgaGFwcGVucywgc28gZ28gYmFjayB0byBzbGVlcC5cbiAgICAgICAgICAgIGlmIChjaGVja3BvaW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZGxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudENoZWNrcG9pbnQgPSBjaGVja3BvaW50O1xuICAgICAgICAgICAgdGhpcy5lbWl0TmV3Q2hlY2twb2ludCgpO1xuXG4gICAgICAgICAgICBpZGxlID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBjaGVja3BvaW50LCBsZXQgdXMgZmV0Y2ggc29tZSBtZXNzYWdlcywgYWdhaW4sIHZlcnlcbiAgICAgICAgICAgIC8vIGNvbnNlcnZhdGl2ZWx5IHRvIG5vdCBib3RoZXIgb3VyIGhvbWVzZXJ2ZXIgdG9vIG11Y2guXG4gICAgICAgICAgICBjb25zdCBldmVudE1hcHBlciA9IGNsaWVudC5nZXRFdmVudE1hcHBlcih7cHJldmVudFJlRW1pdDogdHJ1ZX0pO1xuICAgICAgICAgICAgLy8gVE9ETyB3ZSBuZWVkIHRvIGVuc3VyZSB0byB1c2UgbWVtYmVyIGxhenkgbG9hZGluZyB3aXRoIHRoaXNcbiAgICAgICAgICAgIC8vIHJlcXVlc3Qgc28gd2UgZ2V0IHRoZSBjb3JyZWN0IHByb2ZpbGVzLlxuICAgICAgICAgICAgbGV0IHJlcztcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXMgPSBhd2FpdCBjbGllbnQuX2NyZWF0ZU1lc3NhZ2VzUmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgY2hlY2twb2ludC5yb29tSWQsIGNoZWNrcG9pbnQudG9rZW4sIHRoaXMuX2V2ZW50c1BlckNyYXdsLFxuICAgICAgICAgICAgICAgICAgICBjaGVja3BvaW50LmRpcmVjdGlvbik7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUuaHR0cFN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogUmVtb3ZpbmcgY2hlY2twb2ludCBhcyB3ZSBkb24ndCBoYXZlIFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwZXJtaXNzaW9ucyB0byBmZXRjaCBtZXNzYWdlcyBmcm9tIHRoaXMgcm9vbS5cIiwgY2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIucmVtb3ZlQ3Jhd2xlckNoZWNrcG9pbnQoY2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogRXJyb3IgcmVtb3ZpbmcgY2hlY2twb2ludFwiLCBjaGVja3BvaW50LCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IHB1c2ggdGhlIGNoZWNrcG9pbnQgaGVyZSBiYWNrLCBpdCB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBob3BlZnVsbHkgYmUgcmVtb3ZlZCBhZnRlciBhIHJlc3RhcnQuIEJ1dCBsZXQgdXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSBpdCBmb3Igbm93IGFzIHdlIGRvbid0IHdhbnQgdG8gaGFtbWVyIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW5kcG9pbnQuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBFcnJvciBjcmF3bGluZyB1c2luZyBjaGVja3BvaW50OlwiLCBjaGVja3BvaW50LCBcIixcIiwgZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMucHVzaChjaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLnB1c2goY2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXMuY2h1bmsubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBEb25lIHdpdGggdGhlIGNoZWNrcG9pbnRcIiwgY2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgLy8gV2UgZ290IHRvIHRoZSBzdGFydC9lbmQgb2Ygb3VyIHRpbWVsaW5lLCBsZXRzIGp1c3RcbiAgICAgICAgICAgICAgICAvLyBkZWxldGUgb3VyIGNoZWNrcG9pbnQgYW5kIGdvIGJhY2sgdG8gc2xlZXAuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgaW5kZXhNYW5hZ2VyLnJlbW92ZUNyYXdsZXJDaGVja3BvaW50KGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBFcnJvciByZW1vdmluZyBjaGVja3BvaW50XCIsIGNoZWNrcG9pbnQsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgcGxhaW4gSlNPTiBldmVudHMgaW50byBNYXRyaXggZXZlbnRzIHNvIHRoZXkgZ2V0XG4gICAgICAgICAgICAvLyBkZWNyeXB0ZWQgaWYgbmVjZXNzYXJ5LlxuICAgICAgICAgICAgY29uc3QgbWF0cml4RXZlbnRzID0gcmVzLmNodW5rLm1hcChldmVudE1hcHBlcik7XG4gICAgICAgICAgICBsZXQgc3RhdGVFdmVudHMgPSBbXTtcbiAgICAgICAgICAgIGlmIChyZXMuc3RhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHN0YXRlRXZlbnRzID0gcmVzLnN0YXRlLm1hcChldmVudE1hcHBlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHByb2ZpbGVzID0ge307XG5cbiAgICAgICAgICAgIHN0YXRlRXZlbnRzLmZvckVhY2goZXYgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChldi5ldmVudC5jb250ZW50ICYmXG4gICAgICAgICAgICAgICAgICAgIGV2LmV2ZW50LmNvbnRlbnQubWVtYmVyc2hpcCA9PT0gXCJqb2luXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZXNbZXYuZXZlbnQuc2VuZGVyXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXluYW1lOiBldi5ldmVudC5jb250ZW50LmRpc3BsYXluYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyX3VybDogZXYuZXZlbnQuY29udGVudC5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBkZWNyeXB0aW9uUHJvbWlzZXMgPSBbXTtcblxuICAgICAgICAgICAgbWF0cml4RXZlbnRzLmZvckVhY2goZXYgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChldi5pc0JlaW5nRGVjcnlwdGVkKCkgfHwgZXYuaXNEZWNyeXB0aW9uRmFpbHVyZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gdGhlIGRlY3J5cHRpb24gcHJvbWlzZSBpcyBhIHByaXZhdGUgcHJvcGVydHksIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgLy8gc2hvdWxkIGVpdGhlciBiZSBtYWRlIHB1YmxpYyBvciB3ZSBzaG91bGQgY29udmVydCB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlbnQgdGhhdCBnZXRzIGZpcmVkIHdoZW4gZGVjcnlwdGlvbiBpcyBkb25lIGludG8gYVxuICAgICAgICAgICAgICAgICAgICAvLyBwcm9taXNlIHVzaW5nIHRoZSBvbmNlIGV2ZW50IGVtaXR0ZXIgbWV0aG9kOlxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL25vZGVqcy5vcmcvYXBpL2V2ZW50cy5odG1sI2V2ZW50c19ldmVudHNfb25jZV9lbWl0dGVyX25hbWVcbiAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGlvblByb21pc2VzLnB1c2goZXYuX2RlY3J5cHRpb25Qcm9taXNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTGV0IHVzIHdhaXQgZm9yIGFsbCB0aGUgZXZlbnRzIHRvIGdldCBkZWNyeXB0ZWQuXG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChkZWNyeXB0aW9uUHJvbWlzZXMpO1xuXG4gICAgICAgICAgICAvLyBUT0RPIGlmIHRoZXJlIGFyZSBubyBldmVudHMgYXQgdGhpcyBwb2ludCB3ZSdyZSBtaXNzaW5nIGEgbG90XG4gICAgICAgICAgICAvLyBkZWNyeXB0aW9uIGtleXMsIGRvIHdlIHdhbnQgdG8gcmV0cnkgdGhpcyBjaGVja3BvaW50IGF0IGEgbGF0ZXJcbiAgICAgICAgICAgIC8vIHN0YWdlP1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRFdmVudHMgPSBtYXRyaXhFdmVudHMuZmlsdGVyKHRoaXMuaXNWYWxpZEV2ZW50KTtcblxuICAgICAgICAgICAgLy8gQ29sbGVjdCB0aGUgcmVkYWN0aW9uIGV2ZW50cyBzbyB3ZSBjYW4gZGVsZXRlIHRoZSByZWRhY3RlZCBldmVudHNcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIGluZGV4LlxuICAgICAgICAgICAgY29uc3QgcmVkYWN0aW9uRXZlbnRzID0gbWF0cml4RXZlbnRzLmZpbHRlcigoZXYpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXYuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS5yZWRhY3Rpb25cIjtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBMZXQgdXMgY29udmVydCB0aGUgZXZlbnRzIGJhY2sgaW50byBhIGZvcm1hdCB0aGF0IEV2ZW50SW5kZXggY2FuXG4gICAgICAgICAgICAvLyBjb25zdW1lLlxuICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gZmlsdGVyZWRFdmVudHMubWFwKChldikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLmV2ZW50VG9Kc29uKGV2KTtcblxuICAgICAgICAgICAgICAgIGxldCBwcm9maWxlID0ge307XG4gICAgICAgICAgICAgICAgaWYgKGUuc2VuZGVyIGluIHByb2ZpbGVzKSBwcm9maWxlID0gcHJvZmlsZXNbZS5zZW5kZXJdO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9iamVjdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IGUsXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGU6IHByb2ZpbGUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBuZXdDaGVja3BvaW50O1xuXG4gICAgICAgICAgICAvLyBUaGUgdG9rZW4gY2FuIGJlIG51bGwgZm9yIHNvbWUgcmVhc29uLiBEb24ndCBjcmVhdGUgYSBjaGVja3BvaW50XG4gICAgICAgICAgICAvLyBpbiB0aGF0IGNhc2Ugc2luY2UgYWRkaW5nIGl0IHRvIHRoZSBkYiB3aWxsIGZhaWwuXG4gICAgICAgICAgICBpZiAocmVzLmVuZCkge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG5ldyBjaGVja3BvaW50IHNvIHdlIGNhbiBjb250aW51ZSBjcmF3bGluZyB0aGUgcm9vbVxuICAgICAgICAgICAgICAgIC8vIGZvciBtZXNzYWdlcy5cbiAgICAgICAgICAgICAgICBuZXdDaGVja3BvaW50ID0ge1xuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IGNoZWNrcG9pbnQucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICB0b2tlbjogcmVzLmVuZCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbENyYXdsOiBjaGVja3BvaW50LmZ1bGxDcmF3bCxcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBjaGVja3BvaW50LmRpcmVjdGlvbixcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVkYWN0aW9uRXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ID0gcmVkYWN0aW9uRXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudElkID0gZXYuZ2V0QXNzb2NpYXRlZElkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5kZWxldGVFdmVudChldmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkV2ZW50SW5kZXg6IFJlZGFjdGlvbiBldmVudCBkb2Vzbid0IGNvbnRhaW4gYSB2YWxpZCBhc3NvY2lhdGVkIGV2ZW50IGlkXCIsIGV2KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50c0FscmVhZHlBZGRlZCA9IGF3YWl0IGluZGV4TWFuYWdlci5hZGRIaXN0b3JpY0V2ZW50cyhcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzLCBuZXdDaGVja3BvaW50LCBjaGVja3BvaW50KTtcblxuICAgICAgICAgICAgICAgIC8vIFdlIGRpZG4ndCBnZXQgYSB2YWxpZCBuZXcgY2hlY2twb2ludCBmcm9tIHRoZSBzZXJ2ZXIsIG5vdGhpbmdcbiAgICAgICAgICAgICAgICAvLyB0byBkbyBoZXJlIGFueW1vcmUuXG4gICAgICAgICAgICAgICAgaWYgKCFuZXdDaGVja3BvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogVGhlIHNlcnZlciBkaWRuJ3QgcmV0dXJuIGEgdmFsaWQgXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm5ldyBjaGVja3BvaW50LCBub3QgY29udGludWluZyB0aGUgY3Jhd2wuXCIsIGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBhbGwgZXZlbnRzIHdlcmUgYWxyZWFkeSBpbmRleGVkIHdlIGFzc3VtZSB0aGF0IHdlIGNhdGNoZWRcbiAgICAgICAgICAgICAgICAvLyB1cCB3aXRoIG91ciBpbmRleCBhbmQgZG9uJ3QgbmVlZCB0byBjcmF3bCB0aGUgcm9vbSBmdXJ0aGVyLlxuICAgICAgICAgICAgICAgIC8vIExldCB1cyBkZWxldGUgdGhlIGNoZWNrcG9pbnQgaW4gdGhhdCBjYXNlLCBvdGhlcndpc2UgcHVzaFxuICAgICAgICAgICAgICAgIC8vIHRoZSBuZXcgY2hlY2twb2ludCB0byBiZSB1c2VkIGJ5IHRoZSBjcmF3bGVyLlxuICAgICAgICAgICAgICAgIGlmIChldmVudHNBbHJlYWR5QWRkZWQgPT09IHRydWUgJiYgbmV3Q2hlY2twb2ludC5mdWxsQ3Jhd2wgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBDaGVja3BvaW50IGhhZCBhbHJlYWR5IGFsbCBldmVudHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYWRkZWQsIHN0b3BwaW5nIHRoZSBjcmF3bFwiLCBjaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgaW5kZXhNYW5hZ2VyLnJlbW92ZUNyYXdsZXJDaGVja3BvaW50KG5ld0NoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudHNBbHJlYWR5QWRkZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogQ2hlY2twb2ludCBoYWQgYWxyZWFkeSBhbGwgZXZlbnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhZGRlZCwgYnV0IGNvbnRpbnVpbmcgZHVlIHRvIGEgZnVsbCBjcmF3bFwiLCBjaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyYXdsZXJDaGVja3BvaW50cy5wdXNoKG5ld0NoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV2ZW50SW5kZXg6IEVycm9yIGR1cnJpbmcgYSBjcmF3bFwiLCBlKTtcbiAgICAgICAgICAgICAgICAvLyBBbiBlcnJvciBvY2N1cnJlZCwgcHV0IHRoZSBjaGVja3BvaW50IGJhY2sgc28gd2VcbiAgICAgICAgICAgICAgICAvLyBjYW4gcmV0cnkuXG4gICAgICAgICAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMucHVzaChjaGVja3BvaW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NyYXdsZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHRoZSBjcmF3bGVyIGJhY2tncm91bmQgdGFzay5cbiAgICAgKi9cbiAgICBzdGFydENyYXdsZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jcmF3bGVyICE9PSBudWxsKSByZXR1cm47XG4gICAgICAgIHRoaXMuY3Jhd2xlckZ1bmMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9wIHRoZSBjcmF3bGVyIGJhY2tncm91bmQgdGFzay5cbiAgICAgKi9cbiAgICBzdG9wQ3Jhd2xlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NyYXdsZXIgPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgdGhpcy5fY3Jhd2xlci5jYW5jZWwoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSB0aGUgZXZlbnQgaW5kZXguXG4gICAgICpcbiAgICAgKiBUaGlzIHJlbW92ZXMgYWxsIHRoZSBNYXRyaXhDbGllbnQgZXZlbnQgbGlzdGVuZXJzLCBzdG9wcyB0aGUgY3Jhd2xlclxuICAgICAqIHRhc2ssIGFuZCBjbG9zZXMgdGhlIGluZGV4LlxuICAgICAqL1xuICAgIGFzeW5jIGNsb3NlKCkge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVycygpO1xuICAgICAgICB0aGlzLnN0b3BDcmF3bGVyKCk7XG4gICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5jbG9zZUV2ZW50SW5kZXgoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCB0aGUgZXZlbnQgaW5kZXggdXNpbmcgdGhlIGdpdmVuIHRlcm0gZm9yIG1hdGNoaW5nIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U2VhcmNoQXJnc30gc2VhcmNoQXJncyBUaGUgc2VhcmNoIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzZWFyY2gsXG4gICAgICogc2V0cyB0aGUgc2VhcmNoIHRlcm0gYW5kIGRldGVybWluZXMgdGhlIHNlYXJjaCByZXN1bHQgY29udGVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFtTZWFyY2hSZXN1bHRdPn0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIGFuIGFycmF5XG4gICAgICogb2Ygc2VhcmNoIHJlc3VsdHMgb25jZSB0aGUgc2VhcmNoIGlzIGRvbmUuXG4gICAgICovXG4gICAgYXN5bmMgc2VhcmNoKHNlYXJjaEFyZ3MpIHtcbiAgICAgICAgY29uc3QgaW5kZXhNYW5hZ2VyID0gUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTtcbiAgICAgICAgcmV0dXJuIGluZGV4TWFuYWdlci5zZWFyY2hFdmVudEluZGV4KHNlYXJjaEFyZ3MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgZXZlbnRzIHRoYXQgY29udGFpbiBVUkxzIGZyb20gdGhlIGV2ZW50IGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtSb29tfSByb29tIFRoZSByb29tIGZvciB3aGljaCB3ZSBzaG91bGQgZmV0Y2ggZXZlbnRzIGNvbnRhaW5pbmdcbiAgICAgKiBVUkxzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byBmZXRjaC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tRXZlbnQgRnJvbSB3aGljaCBldmVudCBzaG91bGQgd2UgY29udGludWUgZmV0Y2hpbmdcbiAgICAgKiBldmVudHMgZnJvbSB0aGUgaW5kZXguIFRoaXMgaXMgb25seSBuZWVkZWQgaWYgd2UncmUgY29udGludWluZyB0byBmaWxsXG4gICAgICogdGhlIHRpbWVsaW5lLCBlLmcuIGlmIHdlJ3JlIHBhZ2luYXRpbmcuIFRoaXMgbmVlZHMgdG8gYmUgc2V0IHRvIGEgZXZlbnRcbiAgICAgKiBpZCBvZiBhbiBldmVudCB0aGF0IHdhcyBwcmV2aW91c2x5IGZldGNoZWQgd2l0aCB0aGlzIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIGluIHdoaWNoIHdlIHdpbGwgY29udGludWVcbiAgICAgKiBmZXRjaGluZyBldmVudHMuIEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTIHRvIGNvbnRpbnVlIGZldGNoaW5nIGV2ZW50cyB0aGF0XG4gICAgICogYXJlIG9sZGVyIHRoYW4gdGhlIGV2ZW50IGdpdmVuIGluIGZyb21FdmVudCwgRXZlbnRUaW1lbGluZS5GT1JXQVJEUyB0b1xuICAgICAqIGZldGNoIG5ld2VyIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPE1hdHJpeEV2ZW50W10+fSBSZXNvbHZlcyB0byBhbiBhcnJheSBvZiBldmVudHMgdGhhdFxuICAgICAqIGNvbnRhaW4gVVJMcy5cbiAgICAgKi9cbiAgICBhc3luYyBsb2FkRmlsZUV2ZW50cyhyb29tLCBsaW1pdCA9IDEwLCBmcm9tRXZlbnQgPSBudWxsLCBkaXJlY3Rpb24gPSBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUykge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG5cbiAgICAgICAgY29uc3QgbG9hZEFyZ3MgPSB7XG4gICAgICAgICAgICByb29tSWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgbGltaXQ6IGxpbWl0LFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChmcm9tRXZlbnQpIHtcbiAgICAgICAgICAgIGxvYWRBcmdzLmZyb21FdmVudCA9IGZyb21FdmVudDtcbiAgICAgICAgICAgIGxvYWRBcmdzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBldmVudHM7XG5cbiAgICAgICAgLy8gR2V0IG91ciBldmVudHMgZnJvbSB0aGUgZXZlbnQgaW5kZXguXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBldmVudHMgPSBhd2FpdCBpbmRleE1hbmFnZXIubG9hZEZpbGVFdmVudHMobG9hZEFyZ3MpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV2ZW50SW5kZXg6IEVycm9yIGdldHRpbmcgZmlsZSBldmVudHNcIiwgZSk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBldmVudE1hcHBlciA9IGNsaWVudC5nZXRFdmVudE1hcHBlcigpO1xuXG4gICAgICAgIC8vIFR1cm4gdGhlIGV2ZW50cyBpbnRvIE1hdHJpeEV2ZW50IG9iamVjdHMuXG4gICAgICAgIGNvbnN0IG1hdHJpeEV2ZW50cyA9IGV2ZW50cy5tYXAoZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtYXRyaXhFdmVudCA9IGV2ZW50TWFwcGVyKGUuZXZlbnQpO1xuXG4gICAgICAgICAgICBjb25zdCBtZW1iZXIgPSBuZXcgUm9vbU1lbWJlcihyb29tLnJvb21JZCwgbWF0cml4RXZlbnQuZ2V0U2VuZGVyKCkpO1xuXG4gICAgICAgICAgICAvLyBXZSBjYW4ndCByZWFsbHkgcmVjb25zdHJ1Y3QgdGhlIHdob2xlIHJvb20gc3RhdGUgZnJvbSBvdXJcbiAgICAgICAgICAgIC8vIEV2ZW50SW5kZXggdG8gY2FsY3VsYXRlIHRoZSBjb3JyZWN0IGRpc3BsYXkgbmFtZS4gVXNlIHRoZVxuICAgICAgICAgICAgLy8gZGlzYW1iaWd1YXRlZCBmb3JtIGFsd2F5cyBpbnN0ZWFkLlxuICAgICAgICAgICAgbWVtYmVyLm5hbWUgPSBlLnByb2ZpbGUuZGlzcGxheW5hbWUgKyBcIiAoXCIgKyBtYXRyaXhFdmVudC5nZXRTZW5kZXIoKSArIFwiKVwiO1xuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIHNldHMgdGhlIGF2YXRhciBVUkwuXG4gICAgICAgICAgICBjb25zdCBtZW1iZXJFdmVudCA9IGV2ZW50TWFwcGVyKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyc2hpcDogXCJqb2luXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBlLnByb2ZpbGUuYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXluYW1lOiBlLnByb2ZpbGUuZGlzcGxheW5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibS5yb29tLm1lbWJlclwiLFxuICAgICAgICAgICAgICAgICAgICBldmVudF9pZDogbWF0cml4RXZlbnQuZ2V0SWQoKSArIFwiOmV2ZW50SW5kZXhcIixcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogbWF0cml4RXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICAgICAgICAgIHNlbmRlcjogbWF0cml4RXZlbnQuZ2V0U2VuZGVyKCksXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbl9zZXJ2ZXJfdHM6IG1hdHJpeEV2ZW50LmdldFRzKCksXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlX2tleTogbWF0cml4RXZlbnQuZ2V0U2VuZGVyKCksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIFdlIHNldCB0aGlzIG1hbnVhbGx5IHRvIGF2b2lkIGVtaXR0aW5nIFJvb21NZW1iZXIubWVtYmVyc2hpcCBhbmRcbiAgICAgICAgICAgIC8vIFJvb21NZW1iZXIubmFtZSBldmVudHMuXG4gICAgICAgICAgICBtZW1iZXIuZXZlbnRzLm1lbWJlciA9IG1lbWJlckV2ZW50O1xuICAgICAgICAgICAgbWF0cml4RXZlbnQuc2VuZGVyID0gbWVtYmVyO1xuXG4gICAgICAgICAgICByZXR1cm4gbWF0cml4RXZlbnQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBtYXRyaXhFdmVudHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsbCBhIHRpbWVsaW5lIHdpdGggZXZlbnRzIHRoYXQgY29udGFpbiBVUkxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUaW1lbGluZVNldH0gdGltZWxpbmVTZXQgVGhlIFRpbWVsaW5lU2V0IHRoZSBUaW1lbGluZSBiZWxvbmdzIHRvLFxuICAgICAqIHVzZWQgdG8gY2hlY2sgaWYgd2UncmUgYWRkaW5nIGR1cGxpY2F0ZSBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RpbWVsaW5lfSB0aW1lbGluZSBUaGUgVGltZWxpbmUgd2hpY2ggc2hvdWxkIGJlIGZpbGVkIHdpdGhcbiAgICAgKiBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1Jvb219IHJvb20gVGhlIHJvb20gZm9yIHdoaWNoIHdlIHNob3VsZCBmZXRjaCBldmVudHMgY29udGFpbmluZ1xuICAgICAqIFVSTHNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCBUaGUgbWF4aW11bSBudW1iZXIgb2YgZXZlbnRzIHRvIGZldGNoLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZyb21FdmVudCBGcm9tIHdoaWNoIGV2ZW50IHNob3VsZCB3ZSBjb250aW51ZSBmZXRjaGluZ1xuICAgICAqIGV2ZW50cyBmcm9tIHRoZSBpbmRleC4gVGhpcyBpcyBvbmx5IG5lZWRlZCBpZiB3ZSdyZSBjb250aW51aW5nIHRvIGZpbGxcbiAgICAgKiB0aGUgdGltZWxpbmUsIGUuZy4gaWYgd2UncmUgcGFnaW5hdGluZy4gVGhpcyBuZWVkcyB0byBiZSBzZXQgdG8gYSBldmVudFxuICAgICAqIGlkIG9mIGFuIGV2ZW50IHRoYXQgd2FzIHByZXZpb3VzbHkgZmV0Y2hlZCB3aXRoIHRoaXMgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uIFRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggd2Ugd2lsbCBjb250aW51ZVxuICAgICAqIGZldGNoaW5nIGV2ZW50cy4gRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMgdG8gY29udGludWUgZmV0Y2hpbmcgZXZlbnRzIHRoYXRcbiAgICAgKiBhcmUgb2xkZXIgdGhhbiB0aGUgZXZlbnQgZ2l2ZW4gaW4gZnJvbUV2ZW50LCBFdmVudFRpbWVsaW5lLkZPUldBUkRTIHRvXG4gICAgICogZmV0Y2ggbmV3ZXIgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IFJlc29sdmVzIHRvIHRydWUgaWYgZXZlbnRzIHdlcmUgYWRkZWQgdG8gdGhlXG4gICAgICogdGltZWxpbmUsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBhc3luYyBwb3B1bGF0ZUZpbGVUaW1lbGluZShcbiAgICAgICAgdGltZWxpbmVTZXQsXG4gICAgICAgIHRpbWVsaW5lLFxuICAgICAgICByb29tLFxuICAgICAgICBsaW1pdCA9IDEwLFxuICAgICAgICBmcm9tRXZlbnQgPSBudWxsLFxuICAgICAgICBkaXJlY3Rpb24gPSBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyxcbiAgICApIHtcbiAgICAgICAgY29uc3QgbWF0cml4RXZlbnRzID0gYXdhaXQgdGhpcy5sb2FkRmlsZUV2ZW50cyhyb29tLCBsaW1pdCwgZnJvbUV2ZW50LCBkaXJlY3Rpb24pO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBub3JtYWwgZmlsbCByZXF1ZXN0LCBub3QgYSBwYWdpbmF0aW9uIHJlcXVlc3QsIHdlIG5lZWRcbiAgICAgICAgLy8gdG8gZ2V0IG91ciBldmVudHMgaW4gdGhlIEJBQ0tXQVJEUyBkaXJlY3Rpb24gYnV0IHBvcHVsYXRlIHRoZW0gaW4gdGhlXG4gICAgICAgIC8vIGZvcndhcmRzIGRpcmVjdGlvbi5cbiAgICAgICAgLy8gVGhpcyBuZWVkcyB0byBoYXBwZW4gYmVjYXVzZSBhIGZpbGwgcmVxdWVzdCBtaWdodCBjb21lIHdpdGggYW5cbiAgICAgICAgLy8gZXhpc2l0bmcgdGltZWxpbmUgZS5nLiBpZiB5b3UgY2xvc2UgYW5kIHJlLW9wZW4gdGhlIEZpbGVQYW5lbC5cbiAgICAgICAgaWYgKGZyb21FdmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbWF0cml4RXZlbnRzLnJldmVyc2UoKTtcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PSBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyA/IEV2ZW50VGltZWxpbmUuRk9SV0FSRFM6IEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRoZSBldmVudHMgdG8gdGhlIHRpbWVsaW5lIG9mIHRoZSBmaWxlIHBhbmVsLlxuICAgICAgICBtYXRyaXhFdmVudHMuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICAgIGlmICghdGltZWxpbmVTZXQuZXZlbnRJZFRvVGltZWxpbmUoZS5nZXRJZCgpKSkge1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lU2V0LmFkZEV2ZW50VG9UaW1lbGluZShlLCB0aW1lbGluZSwgZGlyZWN0aW9uID09IEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHJldCA9IGZhbHNlO1xuICAgICAgICBsZXQgcGFnaW5hdGlvblRva2VuID0gXCJcIjtcblxuICAgICAgICAvLyBTZXQgdGhlIHBhZ2luYXRpb24gdG9rZW4gdG8gdGhlIG9sZGVzdCBldmVudCB0aGF0IHdlIHJldHJpZXZlZC5cbiAgICAgICAgaWYgKG1hdHJpeEV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwYWdpbmF0aW9uVG9rZW4gPSBtYXRyaXhFdmVudHNbbWF0cml4RXZlbnRzLmxlbmd0aCAtIDFdLmdldElkKCk7XG4gICAgICAgICAgICByZXQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBQb3B1bGF0aW5nIGZpbGUgcGFuZWwgd2l0aFwiLCBtYXRyaXhFdmVudHMubGVuZ3RoLFxuICAgICAgICAgICAgXCJldmVudHMgYW5kIHNldHRpbmcgdGhlIHBhZ2luYXRpb24gdG9rZW4gdG9cIiwgcGFnaW5hdGlvblRva2VuKTtcblxuICAgICAgICB0aW1lbGluZS5zZXRQYWdpbmF0aW9uVG9rZW4ocGFnaW5hdGlvblRva2VuLCBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW11bGF0ZSBhIFRpbWVsaW5lV2luZG93IHBhZ2luYXRpb24oKSByZXF1ZXN0IHdpdGggdGhlIGV2ZW50IGluZGV4IGFzIHRoZSBldmVudCBzb3VyY2VcbiAgICAgKlxuICAgICAqIE1pZ2h0IG5vdCBmZXRjaCBldmVudHMgZnJvbSB0aGUgaW5kZXggaWYgdGhlIHRpbWVsaW5lIGFscmVhZHkgY29udGFpbnNcbiAgICAgKiBldmVudHMgdGhhdCB0aGUgd2luZG93IGlzbid0IHNob3dpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1Jvb219IHJvb20gVGhlIHJvb20gZm9yIHdoaWNoIHdlIHNob3VsZCBmZXRjaCBldmVudHMgY29udGFpbmluZ1xuICAgICAqIFVSTHNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGltZWxpbmVXaW5kb3d9IHRpbWVsaW5lV2luZG93IFRoZSB0aW1lbGluZSB3aW5kb3cgdGhhdCBzaG91bGQgYmVcbiAgICAgKiBwb3B1bGF0ZWQgd2l0aCBuZXcgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIGluIHdoaWNoIHdlIHNob3VsZCBwYWdpbmF0ZS5cbiAgICAgKiBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyB0byBwYWdpbmF0ZSBiYWNrLCBFdmVudFRpbWVsaW5lLkZPUldBUkRTIHRvXG4gICAgICogcGFnaW5hdGUgZm9yd2FyZHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byBmZXRjaCB3aGlsZVxuICAgICAqIHBhZ2luYXRpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gUmVzb2x2ZXMgdG8gYSBib29sZWFuIHdoaWNoIGlzIHRydWUgaWYgbW9yZVxuICAgICAqIGV2ZW50cyB3ZXJlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQuXG4gICAgICovXG4gICAgcGFnaW5hdGVUaW1lbGluZVdpbmRvdyhyb29tLCB0aW1lbGluZVdpbmRvdywgZGlyZWN0aW9uLCBsaW1pdCkge1xuICAgICAgICBjb25zdCB0bCA9IHRpbWVsaW5lV2luZG93LmdldFRpbWVsaW5lSW5kZXgoZGlyZWN0aW9uKTtcblxuICAgICAgICBpZiAoIXRsKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgaWYgKHRsLnBlbmRpbmdQYWdpbmF0ZSkgcmV0dXJuIHRsLnBlbmRpbmdQYWdpbmF0ZTtcblxuICAgICAgICBpZiAodGltZWxpbmVXaW5kb3cuZXh0ZW5kKGRpcmVjdGlvbiwgbGltaXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFnaW5hdGlvbk1ldGhvZCA9IGFzeW5jICh0aW1lbGluZVdpbmRvdywgdGltZWxpbmUsIHJvb20sIGRpcmVjdGlvbiwgbGltaXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVsaW5lU2V0ID0gdGltZWxpbmVXaW5kb3cuX3RpbWVsaW5lU2V0O1xuICAgICAgICAgICAgY29uc3QgdG9rZW4gPSB0aW1lbGluZS50aW1lbGluZS5nZXRQYWdpbmF0aW9uVG9rZW4oZGlyZWN0aW9uKTtcblxuICAgICAgICAgICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5wb3B1bGF0ZUZpbGVUaW1lbGluZSh0aW1lbGluZVNldCwgdGltZWxpbmUudGltZWxpbmUsIHJvb20sIGxpbWl0LCB0b2tlbiwgZGlyZWN0aW9uKTtcblxuICAgICAgICAgICAgdGltZWxpbmUucGVuZGluZ1BhZ2luYXRlID0gbnVsbDtcbiAgICAgICAgICAgIHRpbWVsaW5lV2luZG93LmV4dGVuZChkaXJlY3Rpb24sIGxpbWl0KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwYWdpbmF0aW9uUHJvbWlzZSA9IHBhZ2luYXRpb25NZXRob2QodGltZWxpbmVXaW5kb3csIHRsLCByb29tLCBkaXJlY3Rpb24sIGxpbWl0KTtcbiAgICAgICAgdGwucGVuZGluZ1BhZ2luYXRlID0gcGFnaW5hdGlvblByb21pc2U7XG5cbiAgICAgICAgcmV0dXJuIHBhZ2luYXRpb25Qcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBzdGF0aXN0aWNhbCBpbmZvcm1hdGlvbiBvZiB0aGUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPEluZGV4U3RhdHM+fSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gdGhlIGluZGV4XG4gICAgICogc3RhdGlzdGljcy5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRTdGF0cygpIHtcbiAgICAgICAgY29uc3QgaW5kZXhNYW5hZ2VyID0gUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTtcbiAgICAgICAgcmV0dXJuIGluZGV4TWFuYWdlci5nZXRTdGF0cygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSByb29tIHdpdGggdGhlIGdpdmVuIGlkIGlzIGFscmVhZHkgaW5kZXhlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByb29tSWQgVGhlIElEIG9mIHRoZSByb29tIHdoaWNoIHdlIHdhbnQgdG8gY2hlY2sgaWYgaXRcbiAgICAgKiBoYXMgYmVlbiBhbHJlYWR5IGluZGV4ZWQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPGJvb2xlYW4+fSBSZXR1cm5zIHRydWUgaWYgdGhlIGluZGV4IGNvbnRhaW5zIGV2ZW50cyBmb3JcbiAgICAgKiB0aGUgZ2l2ZW4gcm9vbSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGFzeW5jIGlzUm9vbUluZGV4ZWQocm9vbUlkKSB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG4gICAgICAgIHJldHVybiBpbmRleE1hbmFnZXIuaXNSb29tSW5kZXhlZChyb29tSWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcm9vbSB0aGF0IHdlIGFyZSBjdXJyZW50bHkgY3Jhd2xpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Um9vbX0gQSBNYXRyaXhSb29tIHRoYXQgaXMgYmVpbmcgY3VycmVudGx5IGNyYXdsZWQsIG51bGxcbiAgICAgKiBpZiBubyByb29tIGlzIGN1cnJlbnRseSBiZWluZyBjcmF3bGVkLlxuICAgICAqL1xuICAgIGN1cnJlbnRSb29tKCkge1xuICAgICAgICBpZiAodGhpcy5fY3VycmVudENoZWNrcG9pbnQgPT09IG51bGwgJiYgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBpZiAodGhpcy5fY3VycmVudENoZWNrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGllbnQuZ2V0Um9vbSh0aGlzLl9jdXJyZW50Q2hlY2twb2ludC5yb29tSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5nZXRSb29tKHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzWzBdLnJvb21JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmF3bGluZ1Jvb21zKCkge1xuICAgICAgICBjb25zdCB0b3RhbFJvb21zID0gbmV3IFNldCgpO1xuICAgICAgICBjb25zdCBjcmF3bGluZ1Jvb21zID0gbmV3IFNldCgpO1xuXG4gICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLmZvckVhY2goKGNoZWNrcG9pbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjcmF3bGluZ1Jvb21zLmFkZChjaGVja3BvaW50LnJvb21JZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50Q2hlY2twb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY3Jhd2xpbmdSb29tcy5hZGQodGhpcy5fY3VycmVudENoZWNrcG9pbnQucm9vbUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbXMgPSBjbGllbnQuZ2V0Um9vbXMoKTtcblxuICAgICAgICBjb25zdCBpc1Jvb21FbmNyeXB0ZWQgPSAocm9vbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5pc1Jvb21FbmNyeXB0ZWQocm9vbS5yb29tSWQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGVuY3J5cHRlZFJvb21zID0gcm9vbXMuZmlsdGVyKGlzUm9vbUVuY3J5cHRlZCk7XG4gICAgICAgIGVuY3J5cHRlZFJvb21zLmZvckVhY2goKHJvb20sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICB0b3RhbFJvb21zLmFkZChyb29tLnJvb21JZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7Y3Jhd2xpbmdSb29tcywgdG90YWxSb29tc307XG4gICAgfVxufVxuIl19
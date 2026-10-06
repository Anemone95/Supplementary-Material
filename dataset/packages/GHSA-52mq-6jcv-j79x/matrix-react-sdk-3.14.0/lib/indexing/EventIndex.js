"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _PlatformPeg = _interopRequireDefault(require("../PlatformPeg"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _matrixJsSdk = require("matrix-js-sdk");

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


  async loadFileEvents(room, limit = 10, fromEvent = null, direction = _matrixJsSdk.EventTimeline.BACKWARDS) {
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
      const member = new _matrixJsSdk.RoomMember(room.roomId, matrixEvent.getSender()); // We can't really reconstruct the whole room state from our
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


  async populateFileTimeline(timelineSet, timeline, room, limit = 10, fromEvent = null, direction = _matrixJsSdk.EventTimeline.BACKWARDS) {
    const matrixEvents = await this.loadFileEvents(room, limit, fromEvent, direction); // If this is a normal fill request, not a pagination request, we need
    // to get our events in the BACKWARDS direction but populate them in the
    // forwards direction.
    // This needs to happen because a fill request might come with an
    // exisitng timeline e.g. if you close and re-open the FilePanel.

    if (fromEvent === null) {
      matrixEvents.reverse();
      direction = direction == _matrixJsSdk.EventTimeline.BACKWARDS ? _matrixJsSdk.EventTimeline.FORWARDS : _matrixJsSdk.EventTimeline.BACKWARDS;
    } // Add the events to the timeline of the file panel.


    matrixEvents.forEach(e => {
      if (!timelineSet.eventIdToTimeline(e.getId())) {
        timelineSet.addEventToTimeline(e, timeline, direction == _matrixJsSdk.EventTimeline.BACKWARDS);
      }
    });
    let ret = false;
    let paginationToken = ""; // Set the pagination token to the oldest event that we retrieved.

    if (matrixEvents.length > 0) {
      paginationToken = matrixEvents[matrixEvents.length - 1].getId();
      ret = true;
    }

    console.log("EventIndex: Populating file panel with", matrixEvents.length, "events and setting the pagination token to", paginationToken);
    timeline.setPaginationToken(paginationToken, _matrixJsSdk.EventTimeline.BACKWARDS);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmRleGluZy9FdmVudEluZGV4LmpzIl0sIm5hbWVzIjpbIkV2ZW50SW5kZXgiLCJFdmVudEVtaXR0ZXIiLCJjb25zdHJ1Y3RvciIsInN0YXRlIiwicHJldlN0YXRlIiwiZGF0YSIsImluZGV4TWFuYWdlciIsIlBsYXRmb3JtUGVnIiwiZ2V0IiwiZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIiLCJldmVudEluZGV4V2FzRW1wdHkiLCJpc0V2ZW50SW5kZXhFbXB0eSIsImFkZEluaXRpYWxDaGVja3BvaW50cyIsInN0YXJ0Q3Jhd2xlciIsImNvbW1pdExpdmVFdmVudHMiLCJldiIsInJvb20iLCJ0b1N0YXJ0T2ZUaW1lbGluZSIsInJlbW92ZWQiLCJNYXRyaXhDbGllbnRQZWciLCJpc1Jvb21FbmNyeXB0ZWQiLCJyb29tSWQiLCJsaXZlRXZlbnQiLCJpc1JlZGFjdGVkIiwiaXNCZWluZ0RlY3J5cHRlZCIsImV2ZW50SWQiLCJnZXRJZCIsImxpdmVFdmVudHNGb3JJbmRleCIsImFkZCIsImFkZExpdmVFdmVudFRvSW5kZXgiLCJnZXRUeXBlIiwiaXNSb29tSW5kZXhlZCIsImNvbnNvbGUiLCJsb2ciLCJhZGRSb29tQ2hlY2twb2ludCIsImVyciIsImRlbGV0ZSIsImRlbGV0ZUV2ZW50IiwiZ2V0QXNzb2NpYXRlZElkIiwiZSIsInRpbWVsaW5lU2V0IiwicmVzZXRBbGxUaW1lbGluZXMiLCJjcmF3bGVyQ2hlY2twb2ludHMiLCJfY3Jhd2xlcklkbGVUaW1lIiwiX2V2ZW50c1BlckNyYXdsIiwiX2NyYXdsZXIiLCJfY3VycmVudENoZWNrcG9pbnQiLCJTZXQiLCJpbml0IiwibG9hZENoZWNrcG9pbnRzIiwicmVnaXN0ZXJMaXN0ZW5lcnMiLCJjbGllbnQiLCJvbiIsIm9uU3luYyIsIm9uUm9vbVRpbWVsaW5lIiwib25FdmVudERlY3J5cHRlZCIsIm9uVGltZWxpbmVSZXNldCIsIm9uUmVkYWN0aW9uIiwib25Sb29tU3RhdGVFdmVudCIsInJlbW92ZUxpc3RlbmVycyIsInJlbW92ZUxpc3RlbmVyIiwicm9vbXMiLCJnZXRSb29tcyIsImVuY3J5cHRlZFJvb21zIiwiZmlsdGVyIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInRpbWVsaW5lIiwiZ2V0TGl2ZVRpbWVsaW5lIiwidG9rZW4iLCJnZXRQYWdpbmF0aW9uVG9rZW4iLCJiYWNrQ2hlY2twb2ludCIsImRpcmVjdGlvbiIsImZ1bGxDcmF3bCIsImZvcndhcmRDaGVja3BvaW50IiwiYWRkQ3Jhd2xlckNoZWNrcG9pbnQiLCJwdXNoIiwiaXNWYWxpZEV2ZW50IiwiaXNVc2VmdWxUeXBlIiwiaW5jbHVkZXMiLCJ2YWxpZEV2ZW50VHlwZSIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJ2YWxpZE1zZ1R5cGUiLCJoYXNDb250ZW50VmFsdWUiLCJtc2d0eXBlIiwiZ2V0Q29udGVudCIsInN0YXJ0c1dpdGgiLCJib2R5IiwidG9waWMiLCJuYW1lIiwiZXZlbnRUb0pzb24iLCJqc29uRXZlbnQiLCJ0b0pTT04iLCJpc0VuY3J5cHRlZCIsImRlY3J5cHRlZCIsImN1cnZlMjU1MTlLZXkiLCJnZXRTZW5kZXJLZXkiLCJlZDI1NTE5S2V5IiwiZ2V0Q2xhaW1lZEVkMjU1MTlLZXkiLCJhbGdvcml0aG0iLCJnZXRXaXJlQ29udGVudCIsImZvcndhcmRpbmdDdXJ2ZTI1NTE5S2V5Q2hhaW4iLCJnZXRGb3J3YXJkaW5nQ3VydmUyNTUxOUtleUNoYWluIiwicHJvZmlsZSIsImRpc3BsYXluYW1lIiwic2VuZGVyIiwicmF3RGlzcGxheU5hbWUiLCJhdmF0YXJfdXJsIiwiZ2V0TXhjQXZhdGFyVXJsIiwiYWRkRXZlbnRUb0luZGV4IiwiZW1pdE5ld0NoZWNrcG9pbnQiLCJlbWl0IiwiY3VycmVudFJvb20iLCJhZGRFdmVudHNGcm9tTGl2ZVRpbWVsaW5lIiwiZXZlbnRzIiwiZ2V0RXZlbnRzIiwiaSIsImxlbmd0aCIsImdldFJvb20iLCJjaGVja3BvaW50IiwiY3Jhd2xlckZ1bmMiLCJjYW5jZWxsZWQiLCJjYW5jZWwiLCJpZGxlIiwic2xlZXBUaW1lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlQXQiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJNYXRoIiwibWF4Iiwic2hpZnQiLCJ1bmRlZmluZWQiLCJldmVudE1hcHBlciIsImdldEV2ZW50TWFwcGVyIiwicHJldmVudFJlRW1pdCIsInJlcyIsIl9jcmVhdGVNZXNzYWdlc1JlcXVlc3QiLCJodHRwU3RhdHVzIiwicmVtb3ZlQ3Jhd2xlckNoZWNrcG9pbnQiLCJjaHVuayIsIm1hdHJpeEV2ZW50cyIsInN0YXRlRXZlbnRzIiwicHJvZmlsZXMiLCJmb3JFYWNoIiwiZXZlbnQiLCJjb250ZW50IiwibWVtYmVyc2hpcCIsImRlY3J5cHRpb25Qcm9taXNlcyIsIl9kZWNyeXB0aW9uUHJvbWlzZSIsImZpbHRlcmVkRXZlbnRzIiwicmVkYWN0aW9uRXZlbnRzIiwib2JqZWN0IiwibmV3Q2hlY2twb2ludCIsImVuZCIsIndhcm4iLCJldmVudHNBbHJlYWR5QWRkZWQiLCJhZGRIaXN0b3JpY0V2ZW50cyIsInN0b3BDcmF3bGVyIiwiY2xvc2UiLCJjbG9zZUV2ZW50SW5kZXgiLCJzZWFyY2giLCJzZWFyY2hBcmdzIiwic2VhcmNoRXZlbnRJbmRleCIsImxvYWRGaWxlRXZlbnRzIiwibGltaXQiLCJmcm9tRXZlbnQiLCJFdmVudFRpbWVsaW5lIiwiQkFDS1dBUkRTIiwibG9hZEFyZ3MiLCJtYXRyaXhFdmVudCIsIm1lbWJlciIsIlJvb21NZW1iZXIiLCJnZXRTZW5kZXIiLCJtZW1iZXJFdmVudCIsInR5cGUiLCJldmVudF9pZCIsInJvb21faWQiLCJnZXRSb29tSWQiLCJvcmlnaW5fc2VydmVyX3RzIiwiZ2V0VHMiLCJzdGF0ZV9rZXkiLCJwb3B1bGF0ZUZpbGVUaW1lbGluZSIsInJldmVyc2UiLCJGT1JXQVJEUyIsImV2ZW50SWRUb1RpbWVsaW5lIiwiYWRkRXZlbnRUb1RpbWVsaW5lIiwicmV0IiwicGFnaW5hdGlvblRva2VuIiwic2V0UGFnaW5hdGlvblRva2VuIiwicGFnaW5hdGVUaW1lbGluZVdpbmRvdyIsInRpbWVsaW5lV2luZG93IiwidGwiLCJnZXRUaW1lbGluZUluZGV4IiwicmVzb2x2ZSIsInBlbmRpbmdQYWdpbmF0ZSIsImV4dGVuZCIsInBhZ2luYXRpb25NZXRob2QiLCJfdGltZWxpbmVTZXQiLCJwYWdpbmF0aW9uUHJvbWlzZSIsImdldFN0YXRzIiwiY3Jhd2xpbmdSb29tcyIsInRvdGFsUm9vbXMiLCJpbmRleCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFVQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxVQUFOLFNBQXlCQyxvQkFBekIsQ0FBc0M7QUFDakRDLEVBQUFBLFdBQVcsR0FBRztBQUNWO0FBRFUsa0RBbUhMLE9BQU9DLEtBQVAsRUFBY0MsU0FBZCxFQUF5QkMsSUFBekIsS0FBa0M7QUFDdkMsWUFBTUMsWUFBWSxHQUFHQyxxQkFBWUMsR0FBWixHQUFrQkMsdUJBQWxCLEVBQXJCOztBQUVBLFVBQUlMLFNBQVMsS0FBSyxVQUFkLElBQTRCRCxLQUFLLEtBQUssU0FBMUMsRUFBcUQ7QUFDakQ7QUFDQTtBQUNBO0FBQ0EsY0FBTU8sa0JBQWtCLEdBQUcsTUFBTUosWUFBWSxDQUFDSyxpQkFBYixFQUFqQztBQUNBLFlBQUlELGtCQUFKLEVBQXdCLE1BQU0sS0FBS0UscUJBQUwsRUFBTjtBQUV4QixhQUFLQyxZQUFMO0FBQ0E7QUFDSDs7QUFFRCxVQUFJVCxTQUFTLEtBQUssU0FBZCxJQUEyQkQsS0FBSyxLQUFLLFNBQXpDLEVBQW9EO0FBQ2hEO0FBQ0E7QUFDQSxjQUFNRyxZQUFZLENBQUNRLGdCQUFiLEVBQU47QUFDQTtBQUNIO0FBQ0osS0F2SWE7QUFBQSwwREFpSkcsT0FBT0MsRUFBUCxFQUFXQyxJQUFYLEVBQWlCQyxpQkFBakIsRUFBb0ND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YUFBT21DLE1BQU0sQ0FBQy9CLGVBQVAsQ0FBdUJKLElBQUksQ0FBQ0ssTUFBNUIsQ0FBUDtBQUNILEtBRkQ7O0FBSUEsVUFBTTBDLGNBQWMsR0FBR0YsS0FBSyxDQUFDRyxNQUFOLENBQWE1QyxlQUFiLENBQXZCO0FBQ0EyQyxJQUFBQSxjQUFjLENBQUNrRixPQUFmLENBQXVCLENBQUNqSSxJQUFELEVBQU80TCxLQUFQLEtBQWlCO0FBQ3BDRCxNQUFBQSxVQUFVLENBQUMvSyxHQUFYLENBQWVaLElBQUksQ0FBQ0ssTUFBcEI7QUFDSCxLQUZEO0FBSUEsV0FBTztBQUFDcUwsTUFBQUEsYUFBRDtBQUFnQkMsTUFBQUE7QUFBaEIsS0FBUDtBQUNIOztBQTM0QmdEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gXCIuLi9QbGF0Zm9ybVBlZ1wiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7RXZlbnRUaW1lbGluZSwgUm9vbU1lbWJlcn0gZnJvbSAnbWF0cml4LWpzLXNkayc7XG5pbXBvcnQge3NsZWVwfSBmcm9tIFwiLi4vdXRpbHMvcHJvbWlzZVwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQge1NldHRpbmdMZXZlbH0gZnJvbSBcIi4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuXG4vKlxuICogRXZlbnQgaW5kZXhpbmcgY2xhc3MgdGhhdCB3cmFwcyB0aGUgcGxhdGZvcm0gc3BlY2lmaWMgZXZlbnQgaW5kZXhpbmcuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50SW5kZXggZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmNyYXdsZXJDaGVja3BvaW50cyA9IFtdO1xuICAgICAgICAvLyBUaGUgdGltZSBpbiBtcyB0aGF0IHRoZSBjcmF3bGVyIHdpbGwgd2FpdCBsb29wIGl0ZXJhdGlvbnMgaWYgdGhlcmVcbiAgICAgICAgLy8gaGF2ZSBub3QgYmVlbiBhbnkgY2hlY2twb2ludHMgdG8gY29uc3VtZSBpbiB0aGUgbGFzdCBpdGVyYXRpb24uXG4gICAgICAgIHRoaXMuX2NyYXdsZXJJZGxlVGltZSA9IDUwMDA7XG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBldmVudHMgb3VyIGNyYXdsZXIgc2hvdWxkIGZldGNoIGluIGEgc2luZ2xlXG4gICAgICAgIC8vIGNyYXdsLlxuICAgICAgICB0aGlzLl9ldmVudHNQZXJDcmF3bCA9IDEwMDtcbiAgICAgICAgdGhpcy5fY3Jhd2xlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRDaGVja3BvaW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5saXZlRXZlbnRzRm9ySW5kZXggPSBuZXcgU2V0KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdCgpIHtcbiAgICAgICAgY29uc3QgaW5kZXhNYW5hZ2VyID0gUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTtcblxuICAgICAgICB0aGlzLmNyYXdsZXJDaGVja3BvaW50cyA9IGF3YWl0IGluZGV4TWFuYWdlci5sb2FkQ2hlY2twb2ludHMoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBMb2FkZWQgY2hlY2twb2ludHNcIiwgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBldmVudCBsaXN0ZW5lcnMgdGhhdCBhcmUgbmVjZXNzYXJ5IGZvciB0aGUgZXZlbnQgaW5kZXggdG8gd29yay5cbiAgICAgKi9cbiAgICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIGNsaWVudC5vbignc3luYycsIHRoaXMub25TeW5jKTtcbiAgICAgICAgY2xpZW50Lm9uKCdSb29tLnRpbWVsaW5lJywgdGhpcy5vblJvb21UaW1lbGluZSk7XG4gICAgICAgIGNsaWVudC5vbignRXZlbnQuZGVjcnlwdGVkJywgdGhpcy5vbkV2ZW50RGVjcnlwdGVkKTtcbiAgICAgICAgY2xpZW50Lm9uKCdSb29tLnRpbWVsaW5lUmVzZXQnLCB0aGlzLm9uVGltZWxpbmVSZXNldCk7XG4gICAgICAgIGNsaWVudC5vbignUm9vbS5yZWRhY3Rpb24nLCB0aGlzLm9uUmVkYWN0aW9uKTtcbiAgICAgICAgY2xpZW50Lm9uKCdSb29tU3RhdGUuZXZlbnRzJywgdGhpcy5vblJvb21TdGF0ZUV2ZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhlIGV2ZW50IGluZGV4IHNwZWNpZmljIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgKi9cbiAgICByZW1vdmVMaXN0ZW5lcnMoKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaWVudCA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcignc3luYycsIHRoaXMub25TeW5jKTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdSb29tLnRpbWVsaW5lJywgdGhpcy5vblJvb21UaW1lbGluZSk7XG4gICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcignRXZlbnQuZGVjcnlwdGVkJywgdGhpcy5vbkV2ZW50RGVjcnlwdGVkKTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdSb29tLnRpbWVsaW5lUmVzZXQnLCB0aGlzLm9uVGltZWxpbmVSZXNldCk7XG4gICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcignUm9vbS5yZWRhY3Rpb24nLCB0aGlzLm9uUmVkYWN0aW9uKTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdSb29tU3RhdGUuZXZlbnRzJywgdGhpcy5vblJvb21TdGF0ZUV2ZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3Jhd2xlciBjaGVja3BvaW50cyBmb3IgdGhlIGVuY3J5cHRlZCByb29tcyBhbmQgc3RvcmUgdGhlbSBpbiB0aGUgaW5kZXguXG4gICAgICovXG4gICAgYXN5bmMgYWRkSW5pdGlhbENoZWNrcG9pbnRzKCkge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb21zID0gY2xpZW50LmdldFJvb21zKCk7XG5cbiAgICAgICAgY29uc3QgaXNSb29tRW5jcnlwdGVkID0gKHJvb20pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjbGllbnQuaXNSb29tRW5jcnlwdGVkKHJvb20ucm9vbUlkKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXZSBvbmx5IGNhcmUgdG8gY3Jhd2wgdGhlIGVuY3J5cHRlZCByb29tcywgbm9uLWVuY3J5cHRlZFxuICAgICAgICAvLyByb29tcyBjYW4gdXNlIHRoZSBzZWFyY2ggcHJvdmlkZWQgYnkgdGhlIGhvbWVzZXJ2ZXIuXG4gICAgICAgIGNvbnN0IGVuY3J5cHRlZFJvb21zID0gcm9vbXMuZmlsdGVyKGlzUm9vbUVuY3J5cHRlZCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBBZGRpbmcgaW5pdGlhbCBjcmF3bGVyIGNoZWNrcG9pbnRzXCIpO1xuXG4gICAgICAgIC8vIEdhdGhlciB0aGUgcHJldl9iYXRjaCB0b2tlbnMgYW5kIGNyZWF0ZSBjaGVja3BvaW50cyBmb3JcbiAgICAgICAgLy8gb3VyIG1lc3NhZ2UgY3Jhd2xlci5cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZW5jcnlwdGVkUm9vbXMubWFwKGFzeW5jIChyb29tKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aW1lbGluZSA9IHJvb20uZ2V0TGl2ZVRpbWVsaW5lKCk7XG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IHRpbWVsaW5lLmdldFBhZ2luYXRpb25Ub2tlbihcImJcIik7XG5cbiAgICAgICAgICAgIGNvbnN0IGJhY2tDaGVja3BvaW50ID0ge1xuICAgICAgICAgICAgICAgIHJvb21JZDogcm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgdG9rZW46IHRva2VuLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogXCJiXCIsXG4gICAgICAgICAgICAgICAgZnVsbENyYXdsOiB0cnVlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZm9yd2FyZENoZWNrcG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgcm9vbUlkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICB0b2tlbjogdG9rZW4sXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBcImZcIixcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKGJhY2tDaGVja3BvaW50LnRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5hZGRDcmF3bGVyQ2hlY2twb2ludChiYWNrQ2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLnB1c2goYmFja0NoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmb3J3YXJkQ2hlY2twb2ludC50b2tlbikge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIuYWRkQ3Jhd2xlckNoZWNrcG9pbnQoZm9yd2FyZENoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyYXdsZXJDaGVja3BvaW50cy5wdXNoKGZvcndhcmRDaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBFcnJvciBhZGRpbmcgaW5pdGlhbCBjaGVja3BvaW50cyBmb3Igcm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb20ucm9vbUlkLCBiYWNrQ2hlY2twb2ludCwgZm9yd2FyZENoZWNrcG9pbnQsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBUaGUgc3luYyBldmVudCBsaXN0ZW5lci5cbiAgICAgKlxuICAgICAqIFRoZSBsaXN0ZW5lciBoYXMgdHdvIGNhc2VzOlxuICAgICAqICAgICAtIEZpcnN0IHN5bmMgYWZ0ZXIgc3RhcnQgdXAsIGNoZWNrIGlmIHRoZSBpbmRleCBpcyBlbXB0eSwgYWRkXG4gICAgICogICAgICAgICBpbml0aWFsIGNoZWNrcG9pbnRzLCBpZiBzby4gU3RhcnQgdGhlIGNyYXdsZXIgYmFja2dyb3VuZCB0YXNrLlxuICAgICAqICAgICAtIEV2ZXJ5IG90aGVyIHN5bmMsIHRlbGwgdGhlIGV2ZW50IGluZGV4IHRvIGNvbW1pdCBhbGwgdGhlIHF1ZXVlZCB1cFxuICAgICAqICAgICAgICAgbGl2ZSBldmVudHNcbiAgICAgKi9cbiAgICBvblN5bmMgPSBhc3luYyAoc3RhdGUsIHByZXZTdGF0ZSwgZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuXG4gICAgICAgIGlmIChwcmV2U3RhdGUgPT09IFwiUFJFUEFSRURcIiAmJiBzdGF0ZSA9PT0gXCJTWU5DSU5HXCIpIHtcbiAgICAgICAgICAgIC8vIElmIG91ciBpbmRleGVyIGlzIGVtcHR5IHdlJ3JlIG1vc3QgbGlrZWx5IHJ1bm5pbmcgRWxlbWVudCB0aGVcbiAgICAgICAgICAgIC8vIGZpcnN0IHRpbWUgd2l0aCBpbmRleGluZyBzdXBwb3J0IG9yIHJ1bm5pbmcgaXQgd2l0aCBhblxuICAgICAgICAgICAgLy8gaW5pdGlhbCBzeW5jLiBBZGQgY2hlY2twb2ludHMgdG8gY3Jhd2wgb3VyIGVuY3J5cHRlZCByb29tcy5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SW5kZXhXYXNFbXB0eSA9IGF3YWl0IGluZGV4TWFuYWdlci5pc0V2ZW50SW5kZXhFbXB0eSgpO1xuICAgICAgICAgICAgaWYgKGV2ZW50SW5kZXhXYXNFbXB0eSkgYXdhaXQgdGhpcy5hZGRJbml0aWFsQ2hlY2twb2ludHMoKTtcblxuICAgICAgICAgICAgdGhpcy5zdGFydENyYXdsZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcmV2U3RhdGUgPT09IFwiU1lOQ0lOR1wiICYmIHN0YXRlID09PSBcIlNZTkNJTkdcIikge1xuICAgICAgICAgICAgLy8gQSBzeW5jIHdhcyBkb25lLCBwcmVzdW1hYmx5IHdlIHF1ZXVlZCB1cCBzb21lIGxpdmUgZXZlbnRzLFxuICAgICAgICAgICAgLy8gY29tbWl0IHRoZW0gbm93LlxuICAgICAgICAgICAgYXdhaXQgaW5kZXhNYW5hZ2VyLmNvbW1pdExpdmVFdmVudHMoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgICogVGhlIFJvb20udGltZWxpbmUgbGlzdGVuZXIuXG4gICAgICpcbiAgICAgKiBUaGlzIGxpc3RlbmVyIHdhaXRzIGZvciBsaXZlIGV2ZW50cyBpbiBlbmNyeXB0ZWQgcm9vbXMsIGlmIHRoZXkgYXJlXG4gICAgICogZGVjcnlwdGVkIG9yIHVuZW5jcnlwdGVkIHdlIHF1ZXVlIHRoZW0gdG8gYmUgYWRkZWQgdG8gdGhlIGluZGV4LFxuICAgICAqIG90aGVyd2lzZSB3ZSBzYXZlIHRoZWlyIGV2ZW50IGlkIGFuZCB3YWl0IGZvciB0aGVtIGluIHRoZSBFdmVudC5kZWNyeXB0ZWRcbiAgICAgKiBsaXN0ZW5lci5cbiAgICAgKi9cbiAgICBvblJvb21UaW1lbGluZSA9IGFzeW5jIChldiwgcm9vbSwgdG9TdGFydE9mVGltZWxpbmUsIHJlbW92ZWQsIGRhdGEpID0+IHtcbiAgICAgICAgLy8gV2Ugb25seSBpbmRleCBlbmNyeXB0ZWQgcm9vbXMgbG9jYWxseS5cbiAgICAgICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNSb29tRW5jcnlwdGVkKHJvb20ucm9vbUlkKSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIElmIGl0IGlzbid0IGEgbGl2ZSBldmVudCBvciBpZiBpdCdzIHJlZGFjdGVkIHRoZXJlJ3Mgbm90aGluZyB0b1xuICAgICAgICAvLyBkby5cbiAgICAgICAgaWYgKHRvU3RhcnRPZlRpbWVsaW5lIHx8ICFkYXRhIHx8ICFkYXRhLmxpdmVFdmVudFxuICAgICAgICAgICAgfHwgZXYuaXNSZWRhY3RlZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgZXZlbnQgaXMgbm90IHlldCBkZWNyeXB0ZWQgbWFyayBpdCBmb3IgdGhlXG4gICAgICAgIC8vIEV2ZW50LmRlY3J5cHRlZCBjYWxsYmFjay5cbiAgICAgICAgaWYgKGV2LmlzQmVpbmdEZWNyeXB0ZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRJZCA9IGV2LmdldElkKCk7XG4gICAgICAgICAgICB0aGlzLmxpdmVFdmVudHNGb3JJbmRleC5hZGQoZXZlbnRJZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZXZlbnQgaXMgZGVjcnlwdGVkIG9yIGlzIHVuZW5jcnlwdGVkIGFkZCBpdCB0byB0aGVcbiAgICAgICAgICAgIC8vIGluZGV4IG5vdy5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYWRkTGl2ZUV2ZW50VG9JbmRleChldik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblJvb21TdGF0ZUV2ZW50ID0gYXN5bmMgKGV2LCBzdGF0ZSkgPT4ge1xuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQoc3RhdGUucm9vbUlkKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IFwibS5yb29tLmVuY3J5cHRpb25cIiAmJiAhYXdhaXQgdGhpcy5pc1Jvb21JbmRleGVkKHN0YXRlLnJvb21JZCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogQWRkaW5nIGEgY2hlY2twb2ludCBmb3IgYSBuZXdseSBlbmNyeXB0ZWQgcm9vbVwiLCBzdGF0ZS5yb29tSWQpO1xuICAgICAgICAgICAgdGhpcy5hZGRSb29tQ2hlY2twb2ludChzdGF0ZS5yb29tSWQsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBUaGUgRXZlbnQuZGVjcnlwdGVkIGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBldmVudCB3YXMgbWFya2VkIGZvciBhZGRpdGlvbiBpbiB0aGUgUm9vbS50aW1lbGluZVxuICAgICAqIGxpc3RlbmVyLCBpZiBzbyBxdWV1ZXMgaXQgdXAgdG8gYmUgYWRkZWQgdG8gdGhlIGluZGV4LlxuICAgICAqL1xuICAgIG9uRXZlbnREZWNyeXB0ZWQgPSBhc3luYyAoZXYsIGVycikgPT4ge1xuICAgICAgICBjb25zdCBldmVudElkID0gZXYuZ2V0SWQoKTtcblxuICAgICAgICAvLyBJZiB0aGUgZXZlbnQgaXNuJ3QgaW4gb3VyIGxpdmUgZXZlbnQgc2V0LCBpZ25vcmUgaXQuXG4gICAgICAgIGlmICghdGhpcy5saXZlRXZlbnRzRm9ySW5kZXguZGVsZXRlKGV2ZW50SWQpKSByZXR1cm47XG4gICAgICAgIGlmIChlcnIpIHJldHVybjtcbiAgICAgICAgYXdhaXQgdGhpcy5hZGRMaXZlRXZlbnRUb0luZGV4KGV2KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFRoZSBSb29tLnJlZGFjdGlvbiBsaXN0ZW5lci5cbiAgICAgKlxuICAgICAqIFJlbW92ZXMgYSByZWRhY3RlZCBldmVudCBmcm9tIG91ciBldmVudCBpbmRleC5cbiAgICAgKi9cbiAgICBvblJlZGFjdGlvbiA9IGFzeW5jIChldiwgcm9vbSkgPT4ge1xuICAgICAgICAvLyBXZSBvbmx5IGluZGV4IGVuY3J5cHRlZCByb29tcyBsb2NhbGx5LlxuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQocm9vbS5yb29tSWQpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5kZWxldGVFdmVudChldi5nZXRBc3NvY2lhdGVkSWQoKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogRXJyb3IgZGVsZXRpbmcgZXZlbnQgZnJvbSBpbmRleFwiLCBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgICogVGhlIFJvb20udGltZWxpbmVSZXNldCBsaXN0ZW5lci5cbiAgICAgKlxuICAgICAqIExpc3RlbnMgZm9yIHRpbWVsaW5lIHJlc2V0cyB0aGF0IGFyZSBjYXVzZWQgYnkgYSBsaW1pdGVkIHRpbWVsaW5lIHRvXG4gICAgICogcmUtYWRkIGNoZWNrcG9pbnRzIGZvciByb29tcyB0aGF0IG5lZWQgdG8gYmUgY3Jhd2xlZCBhZ2Fpbi5cbiAgICAgKi9cbiAgICBvblRpbWVsaW5lUmVzZXQgPSBhc3luYyAocm9vbSwgdGltZWxpbmVTZXQsIHJlc2V0QWxsVGltZWxpbmVzKSA9PiB7XG4gICAgICAgIGlmIChyb29tID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzUm9vbUVuY3J5cHRlZChyb29tLnJvb21JZCkpIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIkV2ZW50SW5kZXg6IEFkZGluZyBhIGNoZWNrcG9pbnQgYmVjYXVzZSBvZiBhIGxpbWl0ZWQgdGltZWxpbmVcIixcbiAgICAgICAgICAgIHJvb20ucm9vbUlkKTtcblxuICAgICAgICB0aGlzLmFkZFJvb21DaGVja3BvaW50KHJvb20ucm9vbUlkLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYW4gZXZlbnQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBldmVudCBpbmRleC5cbiAgICAgKlxuICAgICAqIE1vc3Qgbm90YWJseSB3ZSBmaWx0ZXIgZXZlbnRzIGZvciB3aGljaCBkZWNyeXB0aW9uIGZhaWxlZCwgYXJlIHJlZGFjdGVkXG4gICAgICogb3IgYXJlbid0IG9mIGEgdHlwZSB0aGF0IHdlIGtub3cgaG93IHRvIGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtNYXRyaXhFdmVudH0gZXYgVGhlIGV2ZW50IHRoYXQgc2hvdWxkIGNoZWNrZWQuXG4gICAgICogQHJldHVybnMge2Jvb2x9IFJldHVybnMgdHJ1ZSBpZiB0aGUgZXZlbnQgY2FuIGJlIGluZGV4ZWQsIGZhbHNlXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGlzVmFsaWRFdmVudChldikge1xuICAgICAgICBjb25zdCBpc1VzZWZ1bFR5cGUgPSBbXCJtLnJvb20ubWVzc2FnZVwiLCBcIm0ucm9vbS5uYW1lXCIsIFwibS5yb29tLnRvcGljXCJdLmluY2x1ZGVzKGV2LmdldFR5cGUoKSk7XG4gICAgICAgIGNvbnN0IHZhbGlkRXZlbnRUeXBlID0gaXNVc2VmdWxUeXBlICYmICFldi5pc1JlZGFjdGVkKCkgJiYgIWV2LmlzRGVjcnlwdGlvbkZhaWx1cmUoKTtcblxuICAgICAgICBsZXQgdmFsaWRNc2dUeXBlID0gdHJ1ZTtcbiAgICAgICAgbGV0IGhhc0NvbnRlbnRWYWx1ZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PT0gXCJtLnJvb20ubWVzc2FnZVwiICYmICFldi5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIEV4cGFuZCB0aGlzIGlmIHRoZXJlIGFyZSBtb3JlIGludmFsaWQgbXNndHlwZXMuXG4gICAgICAgICAgICBjb25zdCBtc2d0eXBlID0gZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGU7XG5cbiAgICAgICAgICAgIGlmICghbXNndHlwZSkgdmFsaWRNc2dUeXBlID0gZmFsc2U7XG4gICAgICAgICAgICBlbHNlIHZhbGlkTXNnVHlwZSA9ICFtc2d0eXBlLnN0YXJ0c1dpdGgoXCJtLmtleS52ZXJpZmljYXRpb25cIik7XG5cbiAgICAgICAgICAgIGlmICghZXYuZ2V0Q29udGVudCgpLmJvZHkpIGhhc0NvbnRlbnRWYWx1ZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGV2LmdldFR5cGUoKSA9PT0gXCJtLnJvb20udG9waWNcIiAmJiAhZXYuaXNSZWRhY3RlZCgpKSB7XG4gICAgICAgICAgICBpZiAoIWV2LmdldENvbnRlbnQoKS50b3BpYykgaGFzQ29udGVudFZhbHVlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZXYuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS5uYW1lXCIgJiYgIWV2LmlzUmVkYWN0ZWQoKSkge1xuICAgICAgICAgICAgaWYgKCFldi5nZXRDb250ZW50KCkubmFtZSkgaGFzQ29udGVudFZhbHVlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsaWRFdmVudFR5cGUgJiYgdmFsaWRNc2dUeXBlICYmIGhhc0NvbnRlbnRWYWx1ZTtcbiAgICB9XG5cbiAgICBldmVudFRvSnNvbihldikge1xuICAgICAgICBjb25zdCBqc29uRXZlbnQgPSBldi50b0pTT04oKTtcbiAgICAgICAgY29uc3QgZSA9IGV2LmlzRW5jcnlwdGVkKCkgPyBqc29uRXZlbnQuZGVjcnlwdGVkIDoganNvbkV2ZW50O1xuXG4gICAgICAgIGlmIChldi5pc0VuY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICAvLyBMZXQgdXMgc3RvcmUgc29tZSBhZGRpdGlvbmFsIGRhdGEgc28gd2UgY2FuIHJlLXZlcmlmeSB0aGUgZXZlbnQuXG4gICAgICAgICAgICAvLyBUaGUganMtc2RrIGNoZWNrcyBpZiBhbiBldmVudCBpcyBlbmNyeXB0ZWQgdXNpbmcgdGhlIGFsZ29yaXRobSxcbiAgICAgICAgICAgIC8vIHRoZSBzZW5kZXIga2V5IGFuZCBlZDI1NTE5IHNpZ25pbmcga2V5IGFyZSB1c2VkIHRvIGZpbmQgdGhlXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGRldmljZSB0aGF0IHNlbnQgdGhlIGV2ZW50IHdoaWNoIGFsbG93cyB1cyB0byBjaGVjayB0aGVcbiAgICAgICAgICAgIC8vIHZlcmlmaWNhdGlvbiBzdGF0ZSBvZiB0aGUgZXZlbnQsIGVpdGhlciBkaXJlY3RseSBvciB1c2luZyBjcm9zc1xuICAgICAgICAgICAgLy8gc2lnbmluZy5cbiAgICAgICAgICAgIGUuY3VydmUyNTUxOUtleSA9IGV2LmdldFNlbmRlcktleSgpO1xuICAgICAgICAgICAgZS5lZDI1NTE5S2V5ID0gZXYuZ2V0Q2xhaW1lZEVkMjU1MTlLZXkoKTtcbiAgICAgICAgICAgIGUuYWxnb3JpdGhtID0gZXYuZ2V0V2lyZUNvbnRlbnQoKS5hbGdvcml0aG07XG4gICAgICAgICAgICBlLmZvcndhcmRpbmdDdXJ2ZTI1NTE5S2V5Q2hhaW4gPSBldi5nZXRGb3J3YXJkaW5nQ3VydmUyNTUxOUtleUNoYWluKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB1bmVuY3J5cHRlZCBldmVudHMgZG9uJ3QgY29udGFpbiBhbnkgb2YgdGhhdCBkYXRhLFxuICAgICAgICAgICAgLy8gZGVzcGl0ZSB3aGF0IHRoZSBzZXJ2ZXIgbWlnaHQgZ2l2ZSB0byB1cy5cbiAgICAgICAgICAgIGRlbGV0ZSBlLmN1cnZlMjU1MTlLZXk7XG4gICAgICAgICAgICBkZWxldGUgZS5lZDI1NTE5S2V5O1xuICAgICAgICAgICAgZGVsZXRlIGUuYWxnb3JpdGhtO1xuICAgICAgICAgICAgZGVsZXRlIGUuZm9yd2FyZGluZ0N1cnZlMjU1MTlLZXlDaGFpbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFF1ZXVlIHVwIGxpdmUgZXZlbnRzIHRvIGJlIGFkZGVkIHRvIHRoZSBldmVudCBpbmRleC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TWF0cml4RXZlbnR9IGV2IFRoZSBldmVudCB0aGF0IHNob3VsZCBiZSBhZGRlZCB0byB0aGUgaW5kZXguXG4gICAgICovXG4gICAgYXN5bmMgYWRkTGl2ZUV2ZW50VG9JbmRleChldikge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc1ZhbGlkRXZlbnQoZXYpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZSA9IHRoaXMuZXZlbnRUb0pzb24oZXYpO1xuXG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSB7XG4gICAgICAgICAgICBkaXNwbGF5bmFtZTogZXYuc2VuZGVyLnJhd0Rpc3BsYXlOYW1lLFxuICAgICAgICAgICAgYXZhdGFyX3VybDogZXYuc2VuZGVyLmdldE14Y0F2YXRhclVybCgpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5hZGRFdmVudFRvSW5kZXgoZSwgcHJvZmlsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW1taXQgdGhhdCB0aGUgY3Jhd2xlciBoYXMgY2hhbmdlZCB0aGUgY2hlY2twb2ludCB0aGF0IGl0J3MgY3VycmVudGx5XG4gICAgICogaGFuZGxpbmcuXG4gICAgICovXG4gICAgZW1pdE5ld0NoZWNrcG9pbnQoKSB7XG4gICAgICAgIHRoaXMuZW1pdChcImNoYW5nZWRDaGVja3BvaW50XCIsIHRoaXMuY3VycmVudFJvb20oKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgYWRkRXZlbnRzRnJvbUxpdmVUaW1lbGluZSh0aW1lbGluZSkge1xuICAgICAgICBjb25zdCBldmVudHMgPSB0aW1lbGluZS5nZXRFdmVudHMoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZXYgPSBldmVudHNbaV07XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmFkZExpdmVFdmVudFRvSW5kZXgoZXYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgYWRkUm9vbUNoZWNrcG9pbnQocm9vbUlkLCBmdWxsQ3Jhd2wgPSBmYWxzZSkge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuXG4gICAgICAgIGlmICghcm9vbSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHRpbWVsaW5lID0gcm9vbS5nZXRMaXZlVGltZWxpbmUoKTtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB0aW1lbGluZS5nZXRQYWdpbmF0aW9uVG9rZW4oXCJiXCIpO1xuXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIC8vIFRoZSByb29tIGRvZXNuJ3QgY29udGFpbiBhbnkgdG9rZW5zLCBtZWFuaW5nIHRoZSBsaXZlIHRpbWVsaW5lXG4gICAgICAgICAgICAvLyBjb250YWlucyBhbGwgdGhlIGV2ZW50cywgYWRkIHRob3NlIHRvIHRoZSBpbmRleC5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYWRkRXZlbnRzRnJvbUxpdmVUaW1lbGluZSh0aW1lbGluZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGVja3BvaW50ID0ge1xuICAgICAgICAgICAgcm9vbUlkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgICAgICAgIGZ1bGxDcmF3bDogZnVsbENyYXdsLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiBcImJcIixcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIkV2ZW50SW5kZXg6IEFkZGluZyBjaGVja3BvaW50XCIsIGNoZWNrcG9pbnQpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIuYWRkQ3Jhd2xlckNoZWNrcG9pbnQoY2hlY2twb2ludCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogRXJyb3IgYWRkaW5nIG5ldyBjaGVja3BvaW50IGZvciByb29tXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tLnJvb21JZCwgY2hlY2twb2ludCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNyYXdsZXJDaGVja3BvaW50cy5wdXNoKGNoZWNrcG9pbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBtYWluIGNyYXdsZXIgbG9vcC5cbiAgICAgKlxuICAgICAqIEdvZXMgdGhyb3VnaCBjcmF3bGVyQ2hlY2twb2ludHMgYW5kIGZldGNoZXMgZXZlbnRzIGZyb20gdGhlIHNlcnZlciB0byBiZVxuICAgICAqIGFkZGVkIHRvIHRoZSBFdmVudEluZGV4LlxuICAgICAqXG4gICAgICogSWYgYSAvcm9vbS97cm9vbUlkfS9tZXNzYWdlcyByZXF1ZXN0IGRvZXNuJ3QgY29udGFpbiBhbnkgZXZlbnRzLCBzdG9wIHRoZVxuICAgICAqIGNyYXdsLCBvdGhlcndpc2UgY3JlYXRlIGEgbmV3IGNoZWNrcG9pbnQgYW5kIHB1c2ggaXQgdG8gdGhlXG4gICAgICogY3Jhd2xlckNoZWNrcG9pbnRzIHF1ZXVlIHNvIHdlIGdvIHRocm91Z2ggdGhlbSBpbiBhIHJvdW5kLXJvYmluIHdheS5cbiAgICAgKi9cbiAgICBhc3luYyBjcmF3bGVyRnVuYygpIHtcbiAgICAgICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgaW5kZXhNYW5hZ2VyID0gUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTtcblxuICAgICAgICB0aGlzLl9jcmF3bGVyID0ge307XG5cbiAgICAgICAgdGhpcy5fY3Jhd2xlci5jYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBpZGxlID0gZmFsc2U7XG5cbiAgICAgICAgd2hpbGUgKCFjYW5jZWxsZWQpIHtcbiAgICAgICAgICAgIGxldCBzbGVlcFRpbWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoU2V0dGluZ0xldmVsLkRFVklDRSwgJ2NyYXdsZXJTbGVlcFRpbWUnKTtcblxuICAgICAgICAgICAgLy8gRG9uJ3QgbGV0IHRoZSB1c2VyIGNvbmZpZ3VyZSBhIGxvd2VyIHNsZWVwIHRpbWUgdGhhbiAxMDAgbXMuXG4gICAgICAgICAgICBzbGVlcFRpbWUgPSBNYXRoLm1heChzbGVlcFRpbWUsIDEwMCk7XG5cbiAgICAgICAgICAgIGlmIChpZGxlKSB7XG4gICAgICAgICAgICAgICAgc2xlZXBUaW1lID0gdGhpcy5fY3Jhd2xlcklkbGVUaW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudENoZWNrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50Q2hlY2twb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0TmV3Q2hlY2twb2ludCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCBzbGVlcChzbGVlcFRpbWUpO1xuXG4gICAgICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB0aGlzLmNyYXdsZXJDaGVja3BvaW50cy5zaGlmdCgpO1xuXG4gICAgICAgICAgICAvLy8gVGhlcmUgaXMgbm8gY2hlY2twb2ludCBhdmFpbGFibGUgY3VycmVudGx5LCBvbmUgbWF5IGFwcGVhciBpZlxuICAgICAgICAgICAgLy8gYSBzeW5jIHdpdGggbGltaXRlZCByb29tIHRpbWVsaW5lcyBoYXBwZW5zLCBzbyBnbyBiYWNrIHRvIHNsZWVwLlxuICAgICAgICAgICAgaWYgKGNoZWNrcG9pbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlkbGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50Q2hlY2twb2ludCA9IGNoZWNrcG9pbnQ7XG4gICAgICAgICAgICB0aGlzLmVtaXROZXdDaGVja3BvaW50KCk7XG5cbiAgICAgICAgICAgIGlkbGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIGNoZWNrcG9pbnQsIGxldCB1cyBmZXRjaCBzb21lIG1lc3NhZ2VzLCBhZ2FpbiwgdmVyeVxuICAgICAgICAgICAgLy8gY29uc2VydmF0aXZlbHkgdG8gbm90IGJvdGhlciBvdXIgaG9tZXNlcnZlciB0b28gbXVjaC5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50TWFwcGVyID0gY2xpZW50LmdldEV2ZW50TWFwcGVyKHtwcmV2ZW50UmVFbWl0OiB0cnVlfSk7XG4gICAgICAgICAgICAvLyBUT0RPIHdlIG5lZWQgdG8gZW5zdXJlIHRvIHVzZSBtZW1iZXIgbGF6eSBsb2FkaW5nIHdpdGggdGhpc1xuICAgICAgICAgICAgLy8gcmVxdWVzdCBzbyB3ZSBnZXQgdGhlIGNvcnJlY3QgcHJvZmlsZXMuXG4gICAgICAgICAgICBsZXQgcmVzO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlcyA9IGF3YWl0IGNsaWVudC5fY3JlYXRlTWVzc2FnZXNSZXF1ZXN0KFxuICAgICAgICAgICAgICAgICAgICBjaGVja3BvaW50LnJvb21JZCwgY2hlY2twb2ludC50b2tlbiwgdGhpcy5fZXZlbnRzUGVyQ3Jhd2wsXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrcG9pbnQuZGlyZWN0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5odHRwU3RhdHVzID09PSA0MDMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBSZW1vdmluZyBjaGVja3BvaW50IGFzIHdlIGRvbid0IGhhdmUgXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGVybWlzc2lvbnMgdG8gZmV0Y2ggbWVzc2FnZXMgZnJvbSB0aGlzIHJvb20uXCIsIGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgaW5kZXhNYW5hZ2VyLnJlbW92ZUNyYXdsZXJDaGVja3BvaW50KGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV2ZW50SW5kZXg6IEVycm9yIHJlbW92aW5nIGNoZWNrcG9pbnRcIiwgY2hlY2twb2ludCwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBkb24ndCBwdXNoIHRoZSBjaGVja3BvaW50IGhlcmUgYmFjaywgaXQgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaG9wZWZ1bGx5IGJlIHJlbW92ZWQgYWZ0ZXIgYSByZXN0YXJ0LiBCdXQgbGV0IHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmUgaXQgZm9yIG5vdyBhcyB3ZSBkb24ndCB3YW50IHRvIGhhbW1lciB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVuZHBvaW50LlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogRXJyb3IgY3Jhd2xpbmcgdXNpbmcgY2hlY2twb2ludDpcIiwgY2hlY2twb2ludCwgXCIsXCIsIGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLnB1c2goY2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyYXdsZXJDaGVja3BvaW50cy5wdXNoKGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzLmNodW5rLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogRG9uZSB3aXRoIHRoZSBjaGVja3BvaW50XCIsIGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgIC8vIFdlIGdvdCB0byB0aGUgc3RhcnQvZW5kIG9mIG91ciB0aW1lbGluZSwgbGV0cyBqdXN0XG4gICAgICAgICAgICAgICAgLy8gZGVsZXRlIG91ciBjaGVja3BvaW50IGFuZCBnbyBiYWNrIHRvIHNsZWVwLlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5yZW1vdmVDcmF3bGVyQ2hlY2twb2ludChjaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogRXJyb3IgcmVtb3ZpbmcgY2hlY2twb2ludFwiLCBjaGVja3BvaW50LCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIHBsYWluIEpTT04gZXZlbnRzIGludG8gTWF0cml4IGV2ZW50cyBzbyB0aGV5IGdldFxuICAgICAgICAgICAgLy8gZGVjcnlwdGVkIGlmIG5lY2Vzc2FyeS5cbiAgICAgICAgICAgIGNvbnN0IG1hdHJpeEV2ZW50cyA9IHJlcy5jaHVuay5tYXAoZXZlbnRNYXBwZXIpO1xuICAgICAgICAgICAgbGV0IHN0YXRlRXZlbnRzID0gW107XG4gICAgICAgICAgICBpZiAocmVzLnN0YXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZUV2ZW50cyA9IHJlcy5zdGF0ZS5tYXAoZXZlbnRNYXBwZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcm9maWxlcyA9IHt9O1xuXG4gICAgICAgICAgICBzdGF0ZUV2ZW50cy5mb3JFYWNoKGV2ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXYuZXZlbnQuY29udGVudCAmJlxuICAgICAgICAgICAgICAgICAgICBldi5ldmVudC5jb250ZW50Lm1lbWJlcnNoaXAgPT09IFwiam9pblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGVzW2V2LmV2ZW50LnNlbmRlcl0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5bmFtZTogZXYuZXZlbnQuY29udGVudC5kaXNwbGF5bmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IGV2LmV2ZW50LmNvbnRlbnQuYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZGVjcnlwdGlvblByb21pc2VzID0gW107XG5cbiAgICAgICAgICAgIG1hdHJpeEV2ZW50cy5mb3JFYWNoKGV2ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXYuaXNCZWluZ0RlY3J5cHRlZCgpIHx8IGV2LmlzRGVjcnlwdGlvbkZhaWx1cmUoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIHRoZSBkZWNyeXB0aW9uIHByb21pc2UgaXMgYSBwcml2YXRlIHByb3BlcnR5LCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8vIHNob3VsZCBlaXRoZXIgYmUgbWFkZSBwdWJsaWMgb3Igd2Ugc2hvdWxkIGNvbnZlcnQgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGV2ZW50IHRoYXQgZ2V0cyBmaXJlZCB3aGVuIGRlY3J5cHRpb24gaXMgZG9uZSBpbnRvIGFcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJvbWlzZSB1c2luZyB0aGUgb25jZSBldmVudCBlbWl0dGVyIG1ldGhvZDpcbiAgICAgICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9ldmVudHMuaHRtbCNldmVudHNfZXZlbnRzX29uY2VfZW1pdHRlcl9uYW1lXG4gICAgICAgICAgICAgICAgICAgIGRlY3J5cHRpb25Qcm9taXNlcy5wdXNoKGV2Ll9kZWNyeXB0aW9uUHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIExldCB1cyB3YWl0IGZvciBhbGwgdGhlIGV2ZW50cyB0byBnZXQgZGVjcnlwdGVkLlxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZGVjcnlwdGlvblByb21pc2VzKTtcblxuICAgICAgICAgICAgLy8gVE9ETyBpZiB0aGVyZSBhcmUgbm8gZXZlbnRzIGF0IHRoaXMgcG9pbnQgd2UncmUgbWlzc2luZyBhIGxvdFxuICAgICAgICAgICAgLy8gZGVjcnlwdGlvbiBrZXlzLCBkbyB3ZSB3YW50IHRvIHJldHJ5IHRoaXMgY2hlY2twb2ludCBhdCBhIGxhdGVyXG4gICAgICAgICAgICAvLyBzdGFnZT9cbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkRXZlbnRzID0gbWF0cml4RXZlbnRzLmZpbHRlcih0aGlzLmlzVmFsaWRFdmVudCk7XG5cbiAgICAgICAgICAgIC8vIENvbGxlY3QgdGhlIHJlZGFjdGlvbiBldmVudHMgc28gd2UgY2FuIGRlbGV0ZSB0aGUgcmVkYWN0ZWQgZXZlbnRzXG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBpbmRleC5cbiAgICAgICAgICAgIGNvbnN0IHJlZGFjdGlvbkV2ZW50cyA9IG1hdHJpeEV2ZW50cy5maWx0ZXIoKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV2LmdldFR5cGUoKSA9PT0gXCJtLnJvb20ucmVkYWN0aW9uXCI7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTGV0IHVzIGNvbnZlcnQgdGhlIGV2ZW50cyBiYWNrIGludG8gYSBmb3JtYXQgdGhhdCBFdmVudEluZGV4IGNhblxuICAgICAgICAgICAgLy8gY29uc3VtZS5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IGZpbHRlcmVkRXZlbnRzLm1hcCgoZXYpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlID0gdGhpcy5ldmVudFRvSnNvbihldik7XG5cbiAgICAgICAgICAgICAgICBsZXQgcHJvZmlsZSA9IHt9O1xuICAgICAgICAgICAgICAgIGlmIChlLnNlbmRlciBpbiBwcm9maWxlcykgcHJvZmlsZSA9IHByb2ZpbGVzW2Uuc2VuZGVyXTtcbiAgICAgICAgICAgICAgICBjb25zdCBvYmplY3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBlLFxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlOiBwcm9maWxlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgbmV3Q2hlY2twb2ludDtcblxuICAgICAgICAgICAgLy8gVGhlIHRva2VuIGNhbiBiZSBudWxsIGZvciBzb21lIHJlYXNvbi4gRG9uJ3QgY3JlYXRlIGEgY2hlY2twb2ludFxuICAgICAgICAgICAgLy8gaW4gdGhhdCBjYXNlIHNpbmNlIGFkZGluZyBpdCB0byB0aGUgZGIgd2lsbCBmYWlsLlxuICAgICAgICAgICAgaWYgKHJlcy5lbmQpIHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBuZXcgY2hlY2twb2ludCBzbyB3ZSBjYW4gY29udGludWUgY3Jhd2xpbmcgdGhlIHJvb21cbiAgICAgICAgICAgICAgICAvLyBmb3IgbWVzc2FnZXMuXG4gICAgICAgICAgICAgICAgbmV3Q2hlY2twb2ludCA9IHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbUlkOiBjaGVja3BvaW50LnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgdG9rZW46IHJlcy5lbmQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxDcmF3bDogY2hlY2twb2ludC5mdWxsQ3Jhd2wsXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogY2hlY2twb2ludC5kaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlZGFjdGlvbkV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldiA9IHJlZGFjdGlvbkV2ZW50c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnRJZCA9IGV2LmdldEFzc29jaWF0ZWRJZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIuZGVsZXRlRXZlbnQoZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJFdmVudEluZGV4OiBSZWRhY3Rpb24gZXZlbnQgZG9lc24ndCBjb250YWluIGEgdmFsaWQgYXNzb2NpYXRlZCBldmVudCBpZFwiLCBldik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBldmVudHNBbHJlYWR5QWRkZWQgPSBhd2FpdCBpbmRleE1hbmFnZXIuYWRkSGlzdG9yaWNFdmVudHMoXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cywgbmV3Q2hlY2twb2ludCwgY2hlY2twb2ludCk7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBkaWRuJ3QgZ2V0IGEgdmFsaWQgbmV3IGNoZWNrcG9pbnQgZnJvbSB0aGUgc2VydmVyLCBub3RoaW5nXG4gICAgICAgICAgICAgICAgLy8gdG8gZG8gaGVyZSBhbnltb3JlLlxuICAgICAgICAgICAgICAgIGlmICghbmV3Q2hlY2twb2ludCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV2ZW50SW5kZXg6IFRoZSBzZXJ2ZXIgZGlkbid0IHJldHVybiBhIHZhbGlkIFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5ldyBjaGVja3BvaW50LCBub3QgY29udGludWluZyB0aGUgY3Jhd2wuXCIsIGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBhbGwgZXZlbnRzIHdlcmUgYWxyZWFkeSBpbmRleGVkIHdlIGFzc3VtZSB0aGF0IHdlIGNhdGNoZWRcbiAgICAgICAgICAgICAgICAvLyB1cCB3aXRoIG91ciBpbmRleCBhbmQgZG9uJ3QgbmVlZCB0byBjcmF3bCB0aGUgcm9vbSBmdXJ0aGVyLlxuICAgICAgICAgICAgICAgIC8vIExldCB1cyBkZWxldGUgdGhlIGNoZWNrcG9pbnQgaW4gdGhhdCBjYXNlLCBvdGhlcndpc2UgcHVzaFxuICAgICAgICAgICAgICAgIC8vIHRoZSBuZXcgY2hlY2twb2ludCB0byBiZSB1c2VkIGJ5IHRoZSBjcmF3bGVyLlxuICAgICAgICAgICAgICAgIGlmIChldmVudHNBbHJlYWR5QWRkZWQgPT09IHRydWUgJiYgbmV3Q2hlY2twb2ludC5mdWxsQ3Jhd2wgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBDaGVja3BvaW50IGhhZCBhbHJlYWR5IGFsbCBldmVudHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhZGRlZCwgc3RvcHBpbmcgdGhlIGNyYXdsXCIsIGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIucmVtb3ZlQ3Jhd2xlckNoZWNrcG9pbnQobmV3Q2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50c0FscmVhZHlBZGRlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBDaGVja3BvaW50IGhhZCBhbHJlYWR5IGFsbCBldmVudHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWRkZWQsIGJ1dCBjb250aW51aW5nIGR1ZSB0byBhIGZ1bGwgY3Jhd2xcIiwgY2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMucHVzaChuZXdDaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBFcnJvciBkdXJyaW5nIGEgY3Jhd2xcIiwgZSk7XG4gICAgICAgICAgICAgICAgLy8gQW4gZXJyb3Igb2NjdXJyZWQsIHB1dCB0aGUgY2hlY2twb2ludCBiYWNrIHNvIHdlXG4gICAgICAgICAgICAgICAgLy8gY2FuIHJldHJ5LlxuICAgICAgICAgICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLnB1c2goY2hlY2twb2ludCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcmF3bGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydCB0aGUgY3Jhd2xlciBiYWNrZ3JvdW5kIHRhc2suXG4gICAgICovXG4gICAgc3RhcnRDcmF3bGVyKCkge1xuICAgICAgICBpZiAodGhpcy5fY3Jhd2xlciAhPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNyYXdsZXJGdW5jKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcCB0aGUgY3Jhd2xlciBiYWNrZ3JvdW5kIHRhc2suXG4gICAgICovXG4gICAgc3RvcENyYXdsZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jcmF3bGVyID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2NyYXdsZXIuY2FuY2VsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgdGhlIGV2ZW50IGluZGV4LlxuICAgICAqXG4gICAgICogVGhpcyByZW1vdmVzIGFsbCB0aGUgTWF0cml4Q2xpZW50IGV2ZW50IGxpc3RlbmVycywgc3RvcHMgdGhlIGNyYXdsZXJcbiAgICAgKiB0YXNrLCBhbmQgY2xvc2VzIHRoZSBpbmRleC5cbiAgICAgKi9cbiAgICBhc3luYyBjbG9zZSgpIHtcbiAgICAgICAgY29uc3QgaW5kZXhNYW5hZ2VyID0gUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5zdG9wQ3Jhd2xlcigpO1xuICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIuY2xvc2VFdmVudEluZGV4KCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggdGhlIGV2ZW50IGluZGV4IHVzaW5nIHRoZSBnaXZlbiB0ZXJtIGZvciBtYXRjaGluZyBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1NlYXJjaEFyZ3N9IHNlYXJjaEFyZ3MgVGhlIHNlYXJjaCBjb25maWd1cmF0aW9uIGZvciB0aGUgc2VhcmNoLFxuICAgICAqIHNldHMgdGhlIHNlYXJjaCB0ZXJtIGFuZCBkZXRlcm1pbmVzIHRoZSBzZWFyY2ggcmVzdWx0IGNvbnRlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxbU2VhcmNoUmVzdWx0XT59IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbiBhcnJheVxuICAgICAqIG9mIHNlYXJjaCByZXN1bHRzIG9uY2UgdGhlIHNlYXJjaCBpcyBkb25lLlxuICAgICAqL1xuICAgIGFzeW5jIHNlYXJjaChzZWFyY2hBcmdzKSB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG4gICAgICAgIHJldHVybiBpbmRleE1hbmFnZXIuc2VhcmNoRXZlbnRJbmRleChzZWFyY2hBcmdzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGV2ZW50cyB0aGF0IGNvbnRhaW4gVVJMcyBmcm9tIHRoZSBldmVudCBpbmRleC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Um9vbX0gcm9vbSBUaGUgcm9vbSBmb3Igd2hpY2ggd2Ugc2hvdWxkIGZldGNoIGV2ZW50cyBjb250YWluaW5nXG4gICAgICogVVJMc1xuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0IFRoZSBtYXhpbXVtIG51bWJlciBvZiBldmVudHMgdG8gZmV0Y2guXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZnJvbUV2ZW50IEZyb20gd2hpY2ggZXZlbnQgc2hvdWxkIHdlIGNvbnRpbnVlIGZldGNoaW5nXG4gICAgICogZXZlbnRzIGZyb20gdGhlIGluZGV4LiBUaGlzIGlzIG9ubHkgbmVlZGVkIGlmIHdlJ3JlIGNvbnRpbnVpbmcgdG8gZmlsbFxuICAgICAqIHRoZSB0aW1lbGluZSwgZS5nLiBpZiB3ZSdyZSBwYWdpbmF0aW5nLiBUaGlzIG5lZWRzIHRvIGJlIHNldCB0byBhIGV2ZW50XG4gICAgICogaWQgb2YgYW4gZXZlbnQgdGhhdCB3YXMgcHJldmlvdXNseSBmZXRjaGVkIHdpdGggdGhpcyBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiBpbiB3aGljaCB3ZSB3aWxsIGNvbnRpbnVlXG4gICAgICogZmV0Y2hpbmcgZXZlbnRzLiBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyB0byBjb250aW51ZSBmZXRjaGluZyBldmVudHMgdGhhdFxuICAgICAqIGFyZSBvbGRlciB0aGFuIHRoZSBldmVudCBnaXZlbiBpbiBmcm9tRXZlbnQsIEV2ZW50VGltZWxpbmUuRk9SV0FSRFMgdG9cbiAgICAgKiBmZXRjaCBuZXdlciBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxNYXRyaXhFdmVudFtdPn0gUmVzb2x2ZXMgdG8gYW4gYXJyYXkgb2YgZXZlbnRzIHRoYXRcbiAgICAgKiBjb250YWluIFVSTHMuXG4gICAgICovXG4gICAgYXN5bmMgbG9hZEZpbGVFdmVudHMocm9vbSwgbGltaXQgPSAxMCwgZnJvbUV2ZW50ID0gbnVsbCwgZGlyZWN0aW9uID0gRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuXG4gICAgICAgIGNvbnN0IGxvYWRBcmdzID0ge1xuICAgICAgICAgICAgcm9vbUlkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgIGxpbWl0OiBsaW1pdCxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZnJvbUV2ZW50KSB7XG4gICAgICAgICAgICBsb2FkQXJncy5mcm9tRXZlbnQgPSBmcm9tRXZlbnQ7XG4gICAgICAgICAgICBsb2FkQXJncy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZXZlbnRzO1xuXG4gICAgICAgIC8vIEdldCBvdXIgZXZlbnRzIGZyb20gdGhlIGV2ZW50IGluZGV4LlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZXZlbnRzID0gYXdhaXQgaW5kZXhNYW5hZ2VyLmxvYWRGaWxlRXZlbnRzKGxvYWRBcmdzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFdmVudEluZGV4OiBFcnJvciBnZXR0aW5nIGZpbGUgZXZlbnRzXCIsIGUpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXZlbnRNYXBwZXIgPSBjbGllbnQuZ2V0RXZlbnRNYXBwZXIoKTtcblxuICAgICAgICAvLyBUdXJuIHRoZSBldmVudHMgaW50byBNYXRyaXhFdmVudCBvYmplY3RzLlxuICAgICAgICBjb25zdCBtYXRyaXhFdmVudHMgPSBldmVudHMubWFwKGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWF0cml4RXZlbnQgPSBldmVudE1hcHBlcihlLmV2ZW50KTtcblxuICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gbmV3IFJvb21NZW1iZXIocm9vbS5yb29tSWQsIG1hdHJpeEV2ZW50LmdldFNlbmRlcigpKTtcblxuICAgICAgICAgICAgLy8gV2UgY2FuJ3QgcmVhbGx5IHJlY29uc3RydWN0IHRoZSB3aG9sZSByb29tIHN0YXRlIGZyb20gb3VyXG4gICAgICAgICAgICAvLyBFdmVudEluZGV4IHRvIGNhbGN1bGF0ZSB0aGUgY29ycmVjdCBkaXNwbGF5IG5hbWUuIFVzZSB0aGVcbiAgICAgICAgICAgIC8vIGRpc2FtYmlndWF0ZWQgZm9ybSBhbHdheXMgaW5zdGVhZC5cbiAgICAgICAgICAgIG1lbWJlci5uYW1lID0gZS5wcm9maWxlLmRpc3BsYXluYW1lICsgXCIgKFwiICsgbWF0cml4RXZlbnQuZ2V0U2VuZGVyKCkgKyBcIilcIjtcblxuICAgICAgICAgICAgLy8gVGhpcyBpcyBzZXRzIHRoZSBhdmF0YXIgVVJMLlxuICAgICAgICAgICAgY29uc3QgbWVtYmVyRXZlbnQgPSBldmVudE1hcHBlcihcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnNoaXA6IFwiam9pblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyX3VybDogZS5wcm9maWxlLmF2YXRhcl91cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5bmFtZTogZS5wcm9maWxlLmRpc3BsYXluYW1lLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm0ucm9vbS5tZW1iZXJcIixcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRfaWQ6IG1hdHJpeEV2ZW50LmdldElkKCkgKyBcIjpldmVudEluZGV4XCIsXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IG1hdHJpeEV2ZW50LmdldFJvb21JZCgpLFxuICAgICAgICAgICAgICAgICAgICBzZW5kZXI6IG1hdHJpeEV2ZW50LmdldFNlbmRlcigpLFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5fc2VydmVyX3RzOiBtYXRyaXhFdmVudC5nZXRUcygpLFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZV9rZXk6IG1hdHJpeEV2ZW50LmdldFNlbmRlcigpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBXZSBzZXQgdGhpcyBtYW51YWxseSB0byBhdm9pZCBlbWl0dGluZyBSb29tTWVtYmVyLm1lbWJlcnNoaXAgYW5kXG4gICAgICAgICAgICAvLyBSb29tTWVtYmVyLm5hbWUgZXZlbnRzLlxuICAgICAgICAgICAgbWVtYmVyLmV2ZW50cy5tZW1iZXIgPSBtZW1iZXJFdmVudDtcbiAgICAgICAgICAgIG1hdHJpeEV2ZW50LnNlbmRlciA9IG1lbWJlcjtcblxuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeEV2ZW50O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbWF0cml4RXZlbnRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbGwgYSB0aW1lbGluZSB3aXRoIGV2ZW50cyB0aGF0IGNvbnRhaW4gVVJMcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGltZWxpbmVTZXR9IHRpbWVsaW5lU2V0IFRoZSBUaW1lbGluZVNldCB0aGUgVGltZWxpbmUgYmVsb25ncyB0byxcbiAgICAgKiB1c2VkIHRvIGNoZWNrIGlmIHdlJ3JlIGFkZGluZyBkdXBsaWNhdGUgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUaW1lbGluZX0gdGltZWxpbmUgVGhlIFRpbWVsaW5lIHdoaWNoIHNob3VsZCBiZSBmaWxlZCB3aXRoXG4gICAgICogZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtSb29tfSByb29tIFRoZSByb29tIGZvciB3aGljaCB3ZSBzaG91bGQgZmV0Y2ggZXZlbnRzIGNvbnRhaW5pbmdcbiAgICAgKiBVUkxzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byBmZXRjaC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tRXZlbnQgRnJvbSB3aGljaCBldmVudCBzaG91bGQgd2UgY29udGludWUgZmV0Y2hpbmdcbiAgICAgKiBldmVudHMgZnJvbSB0aGUgaW5kZXguIFRoaXMgaXMgb25seSBuZWVkZWQgaWYgd2UncmUgY29udGludWluZyB0byBmaWxsXG4gICAgICogdGhlIHRpbWVsaW5lLCBlLmcuIGlmIHdlJ3JlIHBhZ2luYXRpbmcuIFRoaXMgbmVlZHMgdG8gYmUgc2V0IHRvIGEgZXZlbnRcbiAgICAgKiBpZCBvZiBhbiBldmVudCB0aGF0IHdhcyBwcmV2aW91c2x5IGZldGNoZWQgd2l0aCB0aGlzIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIGluIHdoaWNoIHdlIHdpbGwgY29udGludWVcbiAgICAgKiBmZXRjaGluZyBldmVudHMuIEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTIHRvIGNvbnRpbnVlIGZldGNoaW5nIGV2ZW50cyB0aGF0XG4gICAgICogYXJlIG9sZGVyIHRoYW4gdGhlIGV2ZW50IGdpdmVuIGluIGZyb21FdmVudCwgRXZlbnRUaW1lbGluZS5GT1JXQVJEUyB0b1xuICAgICAqIGZldGNoIG5ld2VyIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBSZXNvbHZlcyB0byB0cnVlIGlmIGV2ZW50cyB3ZXJlIGFkZGVkIHRvIHRoZVxuICAgICAqIHRpbWVsaW5lLCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgYXN5bmMgcG9wdWxhdGVGaWxlVGltZWxpbmUodGltZWxpbmVTZXQsIHRpbWVsaW5lLCByb29tLCBsaW1pdCA9IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21FdmVudCA9IG51bGwsIGRpcmVjdGlvbiA9IEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTKSB7XG4gICAgICAgIGNvbnN0IG1hdHJpeEV2ZW50cyA9IGF3YWl0IHRoaXMubG9hZEZpbGVFdmVudHMocm9vbSwgbGltaXQsIGZyb21FdmVudCwgZGlyZWN0aW9uKTtcblxuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgbm9ybWFsIGZpbGwgcmVxdWVzdCwgbm90IGEgcGFnaW5hdGlvbiByZXF1ZXN0LCB3ZSBuZWVkXG4gICAgICAgIC8vIHRvIGdldCBvdXIgZXZlbnRzIGluIHRoZSBCQUNLV0FSRFMgZGlyZWN0aW9uIGJ1dCBwb3B1bGF0ZSB0aGVtIGluIHRoZVxuICAgICAgICAvLyBmb3J3YXJkcyBkaXJlY3Rpb24uXG4gICAgICAgIC8vIFRoaXMgbmVlZHMgdG8gaGFwcGVuIGJlY2F1c2UgYSBmaWxsIHJlcXVlc3QgbWlnaHQgY29tZSB3aXRoIGFuXG4gICAgICAgIC8vIGV4aXNpdG5nIHRpbWVsaW5lIGUuZy4gaWYgeW91IGNsb3NlIGFuZCByZS1vcGVuIHRoZSBGaWxlUGFuZWwuXG4gICAgICAgIGlmIChmcm9tRXZlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIG1hdHJpeEV2ZW50cy5yZXZlcnNlKCk7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBkaXJlY3Rpb24gPT0gRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMgPyBFdmVudFRpbWVsaW5lLkZPUldBUkRTOiBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCB0aGUgZXZlbnRzIHRvIHRoZSB0aW1lbGluZSBvZiB0aGUgZmlsZSBwYW5lbC5cbiAgICAgICAgbWF0cml4RXZlbnRzLmZvckVhY2goZSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRpbWVsaW5lU2V0LmV2ZW50SWRUb1RpbWVsaW5lKGUuZ2V0SWQoKSkpIHtcbiAgICAgICAgICAgICAgICB0aW1lbGluZVNldC5hZGRFdmVudFRvVGltZWxpbmUoZSwgdGltZWxpbmUsIGRpcmVjdGlvbiA9PSBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCByZXQgPSBmYWxzZTtcbiAgICAgICAgbGV0IHBhZ2luYXRpb25Ub2tlbiA9IFwiXCI7XG5cbiAgICAgICAgLy8gU2V0IHRoZSBwYWdpbmF0aW9uIHRva2VuIHRvIHRoZSBvbGRlc3QgZXZlbnQgdGhhdCB3ZSByZXRyaWV2ZWQuXG4gICAgICAgIGlmIChtYXRyaXhFdmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcGFnaW5hdGlvblRva2VuID0gbWF0cml4RXZlbnRzW21hdHJpeEV2ZW50cy5sZW5ndGggLSAxXS5nZXRJZCgpO1xuICAgICAgICAgICAgcmV0ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXZlbnRJbmRleDogUG9wdWxhdGluZyBmaWxlIHBhbmVsIHdpdGhcIiwgbWF0cml4RXZlbnRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgXCJldmVudHMgYW5kIHNldHRpbmcgdGhlIHBhZ2luYXRpb24gdG9rZW4gdG9cIiwgcGFnaW5hdGlvblRva2VuKTtcblxuICAgICAgICB0aW1lbGluZS5zZXRQYWdpbmF0aW9uVG9rZW4ocGFnaW5hdGlvblRva2VuLCBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW11bGF0ZSBhIFRpbWVsaW5lV2luZG93IHBhZ2luYXRpb24oKSByZXF1ZXN0IHdpdGggdGhlIGV2ZW50IGluZGV4IGFzIHRoZSBldmVudCBzb3VyY2VcbiAgICAgKlxuICAgICAqIE1pZ2h0IG5vdCBmZXRjaCBldmVudHMgZnJvbSB0aGUgaW5kZXggaWYgdGhlIHRpbWVsaW5lIGFscmVhZHkgY29udGFpbnNcbiAgICAgKiBldmVudHMgdGhhdCB0aGUgd2luZG93IGlzbid0IHNob3dpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1Jvb219IHJvb20gVGhlIHJvb20gZm9yIHdoaWNoIHdlIHNob3VsZCBmZXRjaCBldmVudHMgY29udGFpbmluZ1xuICAgICAqIFVSTHNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGltZWxpbmVXaW5kb3d9IHRpbWVsaW5lV2luZG93IFRoZSB0aW1lbGluZSB3aW5kb3cgdGhhdCBzaG91bGQgYmVcbiAgICAgKiBwb3B1bGF0ZWQgd2l0aCBuZXcgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIGluIHdoaWNoIHdlIHNob3VsZCBwYWdpbmF0ZS5cbiAgICAgKiBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyB0byBwYWdpbmF0ZSBiYWNrLCBFdmVudFRpbWVsaW5lLkZPUldBUkRTIHRvXG4gICAgICogcGFnaW5hdGUgZm9yd2FyZHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byBmZXRjaCB3aGlsZVxuICAgICAqIHBhZ2luYXRpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gUmVzb2x2ZXMgdG8gYSBib29sZWFuIHdoaWNoIGlzIHRydWUgaWYgbW9yZVxuICAgICAqIGV2ZW50cyB3ZXJlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQuXG4gICAgICovXG4gICAgcGFnaW5hdGVUaW1lbGluZVdpbmRvdyhyb29tLCB0aW1lbGluZVdpbmRvdywgZGlyZWN0aW9uLCBsaW1pdCkge1xuICAgICAgICBjb25zdCB0bCA9IHRpbWVsaW5lV2luZG93LmdldFRpbWVsaW5lSW5kZXgoZGlyZWN0aW9uKTtcblxuICAgICAgICBpZiAoIXRsKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgaWYgKHRsLnBlbmRpbmdQYWdpbmF0ZSkgcmV0dXJuIHRsLnBlbmRpbmdQYWdpbmF0ZTtcblxuICAgICAgICBpZiAodGltZWxpbmVXaW5kb3cuZXh0ZW5kKGRpcmVjdGlvbiwgbGltaXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFnaW5hdGlvbk1ldGhvZCA9IGFzeW5jICh0aW1lbGluZVdpbmRvdywgdGltZWxpbmUsIHJvb20sIGRpcmVjdGlvbiwgbGltaXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVsaW5lU2V0ID0gdGltZWxpbmVXaW5kb3cuX3RpbWVsaW5lU2V0O1xuICAgICAgICAgICAgY29uc3QgdG9rZW4gPSB0aW1lbGluZS50aW1lbGluZS5nZXRQYWdpbmF0aW9uVG9rZW4oZGlyZWN0aW9uKTtcblxuICAgICAgICAgICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5wb3B1bGF0ZUZpbGVUaW1lbGluZSh0aW1lbGluZVNldCwgdGltZWxpbmUudGltZWxpbmUsIHJvb20sIGxpbWl0LCB0b2tlbiwgZGlyZWN0aW9uKTtcblxuICAgICAgICAgICAgdGltZWxpbmUucGVuZGluZ1BhZ2luYXRlID0gbnVsbDtcbiAgICAgICAgICAgIHRpbWVsaW5lV2luZG93LmV4dGVuZChkaXJlY3Rpb24sIGxpbWl0KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwYWdpbmF0aW9uUHJvbWlzZSA9IHBhZ2luYXRpb25NZXRob2QodGltZWxpbmVXaW5kb3csIHRsLCByb29tLCBkaXJlY3Rpb24sIGxpbWl0KTtcbiAgICAgICAgdGwucGVuZGluZ1BhZ2luYXRlID0gcGFnaW5hdGlvblByb21pc2U7XG5cbiAgICAgICAgcmV0dXJuIHBhZ2luYXRpb25Qcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBzdGF0aXN0aWNhbCBpbmZvcm1hdGlvbiBvZiB0aGUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPEluZGV4U3RhdHM+fSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gdGhlIGluZGV4XG4gICAgICogc3RhdGlzdGljcy5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRTdGF0cygpIHtcbiAgICAgICAgY29uc3QgaW5kZXhNYW5hZ2VyID0gUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTtcbiAgICAgICAgcmV0dXJuIGluZGV4TWFuYWdlci5nZXRTdGF0cygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSByb29tIHdpdGggdGhlIGdpdmVuIGlkIGlzIGFscmVhZHkgaW5kZXhlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByb29tSWQgVGhlIElEIG9mIHRoZSByb29tIHdoaWNoIHdlIHdhbnQgdG8gY2hlY2sgaWYgaXRcbiAgICAgKiBoYXMgYmVlbiBhbHJlYWR5IGluZGV4ZWQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPGJvb2xlYW4+fSBSZXR1cm5zIHRydWUgaWYgdGhlIGluZGV4IGNvbnRhaW5zIGV2ZW50cyBmb3JcbiAgICAgKiB0aGUgZ2l2ZW4gcm9vbSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGFzeW5jIGlzUm9vbUluZGV4ZWQocm9vbUlkKSB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG4gICAgICAgIHJldHVybiBpbmRleE1hbmFnZXIuaXNSb29tSW5kZXhlZChyb29tSWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcm9vbSB0aGF0IHdlIGFyZSBjdXJyZW50bHkgY3Jhd2xpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Um9vbX0gQSBNYXRyaXhSb29tIHRoYXQgaXMgYmVpbmcgY3VycmVudGx5IGNyYXdsZWQsIG51bGxcbiAgICAgKiBpZiBubyByb29tIGlzIGN1cnJlbnRseSBiZWluZyBjcmF3bGVkLlxuICAgICAqL1xuICAgIGN1cnJlbnRSb29tKCkge1xuICAgICAgICBpZiAodGhpcy5fY3VycmVudENoZWNrcG9pbnQgPT09IG51bGwgJiYgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBpZiAodGhpcy5fY3VycmVudENoZWNrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGllbnQuZ2V0Um9vbSh0aGlzLl9jdXJyZW50Q2hlY2twb2ludC5yb29tSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5nZXRSb29tKHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzWzBdLnJvb21JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmF3bGluZ1Jvb21zKCkge1xuICAgICAgICBjb25zdCB0b3RhbFJvb21zID0gbmV3IFNldCgpO1xuICAgICAgICBjb25zdCBjcmF3bGluZ1Jvb21zID0gbmV3IFNldCgpO1xuXG4gICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLmZvckVhY2goKGNoZWNrcG9pbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjcmF3bGluZ1Jvb21zLmFkZChjaGVja3BvaW50LnJvb21JZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50Q2hlY2twb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY3Jhd2xpbmdSb29tcy5hZGQodGhpcy5fY3VycmVudENoZWNrcG9pbnQucm9vbUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbXMgPSBjbGllbnQuZ2V0Um9vbXMoKTtcblxuICAgICAgICBjb25zdCBpc1Jvb21FbmNyeXB0ZWQgPSAocm9vbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5pc1Jvb21FbmNyeXB0ZWQocm9vbS5yb29tSWQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGVuY3J5cHRlZFJvb21zID0gcm9vbXMuZmlsdGVyKGlzUm9vbUVuY3J5cHRlZCk7XG4gICAgICAgIGVuY3J5cHRlZFJvb21zLmZvckVhY2goKHJvb20sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICB0b3RhbFJvb21zLmFkZChyb29tLnJvb21JZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7Y3Jhd2xpbmdSb29tcywgdG90YWxSb29tc307XG4gICAgfVxufVxuIl19
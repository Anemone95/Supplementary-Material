"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.RoomListStoreClass = exports.LISTS_UPDATE_EVENT = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _models = require("./models");

var _models2 = require("./algorithms/models");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _readReceipts = require("../../utils/read-receipts");

var _IFilterCondition = require("./filters/IFilterCondition");

var _TagWatcher = require("./TagWatcher");

var _RoomViewStore = _interopRequireDefault(require("../RoomViewStore"));

var _Algorithm = require("./algorithms/Algorithm");

var _membership = require("../../utils/membership");

var _utils = require("matrix-js-sdk/src/utils");

var _RoomListLayoutStore = _interopRequireDefault(require("./RoomListLayoutStore"));

var _MarkedExecution = require("../../utils/MarkedExecution");

var _AsyncStoreWithClient = require("../AsyncStoreWithClient");

var _NameFilterCondition = require("./filters/NameFilterCondition");

var _RoomNotificationStateStore = require("../notifications/RoomNotificationStateStore");

var _VisibilityProvider = require("./filters/VisibilityProvider");

/*
Copyright 2018, 2019 New Vector Ltd
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

/**
 * The event/channel which is called when the room lists have been changed. Raised
 * with one argument: the instance of the store.
 */
const LISTS_UPDATE_EVENT = "lists_update";
exports.LISTS_UPDATE_EVENT = LISTS_UPDATE_EVENT;

class RoomListStoreClass extends _AsyncStoreWithClient.AsyncStoreWithClient
/*:: <IState>*/
{
  /**
   * Set to true if you're running tests on the store. Should not be touched in
   * any other environment.
   */
  constructor() {
    super(_dispatcher.default);
    (0, _defineProperty2.default)(this, "initialListsGenerated", false);
    (0, _defineProperty2.default)(this, "algorithm", new _Algorithm.Algorithm());
    (0, _defineProperty2.default)(this, "filterConditions", []);
    (0, _defineProperty2.default)(this, "tagWatcher", new _TagWatcher.TagWatcher(this));
    (0, _defineProperty2.default)(this, "updateFn", new _MarkedExecution.MarkedExecution(() => {
      for (const tagId of Object.keys(this.unfilteredLists)) {
        _RoomNotificationStateStore.RoomNotificationStateStore.instance.getListState(tagId).setRooms(this.unfilteredLists[tagId]);
      }

      this.emit(LISTS_UPDATE_EVENT);
    }));
    (0, _defineProperty2.default)(this, "watchedSettings", ['feature_custom_tags', 'advancedRoomListLogging' // TODO: Remove watch: https://github.com/vector-im/element-web/issues/14602
    ]);
    (0, _defineProperty2.default)(this, "onAlgorithmListUpdated", () => {
      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log("Underlying algorithm has triggered a list update - marking");
      }

      this.updateFn.mark();
    });
    (0, _defineProperty2.default)(this, "onAlgorithmFilterUpdated", () => {
      // The filter can happen off-cycle, so trigger an update. The filter will have
      // already caused a mark.
      this.updateFn.trigger();
    });
    this.checkLoggingEnabled();

    for (const settingName of this.watchedSettings) _SettingsStore.default.monitorSetting(settingName, null);

    _RoomViewStore.default.addListener(() => this.handleRVSUpdate({}));

    this.algorithm.on(_Algorithm.LIST_UPDATED_EVENT, this.onAlgorithmListUpdated);
    this.algorithm.on(_IFilterCondition.FILTER_CHANGED, this.onAlgorithmFilterUpdated);
  }

  get unfilteredLists()
  /*: ITagMap*/
  {
    if (!this.algorithm) return {}; // No tags yet.

    return this.algorithm.getUnfilteredRooms();
  }

  get orderedLists()
  /*: ITagMap*/
  {
    if (!this.algorithm) return {}; // No tags yet.

    return this.algorithm.getOrderedRooms();
  } // Intended for test usage


  async resetStore() {
    await this.reset();
    this.tagWatcher = new _TagWatcher.TagWatcher(this);
    this.filterConditions = [];
    this.initialListsGenerated = false;
    this.algorithm.off(_Algorithm.LIST_UPDATED_EVENT, this.onAlgorithmListUpdated);
    this.algorithm.off(_IFilterCondition.FILTER_CHANGED, this.onAlgorithmListUpdated);
    this.algorithm = new _Algorithm.Algorithm();
    this.algorithm.on(_Algorithm.LIST_UPDATED_EVENT, this.onAlgorithmListUpdated);
    this.algorithm.on(_IFilterCondition.FILTER_CHANGED, this.onAlgorithmListUpdated); // Reset state without causing updates as the client will have been destroyed
    // and downstream code will throw NPE errors.

    await this.reset(null, true);
  } // Public for test usage. Do not call this.


  async makeReady(forcedClient
  /*: MatrixClient*/
  ) {
    if (forcedClient) {
      this.readyStore.useUnitTestClient(forcedClient);
    }

    this.checkLoggingEnabled(); // Update any settings here, as some may have happened before we were logically ready.
    // Update any settings here, as some may have happened before we were logically ready.

    console.log("Regenerating room lists: Startup");
    await this.readAndCacheSettingsFromStore();
    await this.regenerateAllLists({
      trigger: false
    });
    await this.handleRVSUpdate({
      trigger: false
    }); // fake an RVS update to adjust sticky room, if needed

    this.updateFn.mark(); // we almost certainly want to trigger an update.

    this.updateFn.trigger();
  }

  checkLoggingEnabled() {
    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      console.warn("Advanced room list logging is enabled");
    }
  }

  async readAndCacheSettingsFromStore() {
    const tagsEnabled = _SettingsStore.default.getValue("feature_custom_tags");

    await this.updateState({
      tagsEnabled
    });
    await this.updateAlgorithmInstances();
  }
  /**
   * Handles suspected RoomViewStore changes.
   * @param trigger Set to false to prevent a list update from being sent. Should only
   * be used if the calling code will manually trigger the update.
   */


  async handleRVSUpdate({
    trigger = true
  }) {
    if (!this.matrixClient) return; // We assume there won't be RVS updates without a client

    const activeRoomId = _RoomViewStore.default.getRoomId();

    if (!activeRoomId && this.algorithm.stickyRoom) {
      await this.algorithm.setStickyRoom(null);
    } else if (activeRoomId) {
      const activeRoom = this.matrixClient.getRoom(activeRoomId);

      if (!activeRoom) {
        console.warn(`${activeRoomId} is current in RVS but missing from client - clearing sticky room`);
        await this.algorithm.setStickyRoom(null);
      } else if (activeRoom !== this.algorithm.stickyRoom) {
        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.log(`Changing sticky room to ${activeRoomId}`);
        }

        await this.algorithm.setStickyRoom(activeRoom);
      }
    }

    if (trigger) this.updateFn.trigger();
  }

  async onReady()
  /*: Promise<any>*/
  {
    await this.makeReady();
  }

  async onNotReady()
  /*: Promise<any>*/
  {
    await this.resetStore();
  }

  async onAction(payload
  /*: ActionPayload*/
  ) {
    // If we're not remotely ready, don't even bother scheduling the dispatch handling.
    // This is repeated in the handler just in case things change between a decision here and
    // when the timer fires.
    const logicallyReady = this.matrixClient && this.initialListsGenerated;
    if (!logicallyReady) return; // When we're running tests we can't reliably use setImmediate out of timing concerns.
    // As such, we use a more synchronous model.

    if (RoomListStoreClass.TEST_MODE) {
      await this.onDispatchAsync(payload);
      return;
    } // We do this to intentionally break out of the current event loop task, allowing
    // us to instead wait for a more convenient time to run our updates.


    setImmediate(() => this.onDispatchAsync(payload));
  }

  async onDispatchAsync(payload
  /*: ActionPayload*/
  ) {
    // Everything here requires a MatrixClient or some sort of logical readiness.
    const logicallyReady = this.matrixClient && this.initialListsGenerated;
    if (!logicallyReady) return;

    if (payload.action === 'setting_updated') {
      if (this.watchedSettings.includes(payload.settingName)) {
        // TODO: Remove with https://github.com/vector-im/element-web/issues/14602
        if (payload.settingName === "advancedRoomListLogging") {
          // Log when the setting changes so we know when it was turned on in the rageshake
          const enabled = _SettingsStore.default.getValue("advancedRoomListLogging");

          console.warn("Advanced room list logging is enabled? " + enabled);
          return;
        }

        console.log("Regenerating room lists: Settings changed");
        await this.readAndCacheSettingsFromStore();
        await this.regenerateAllLists({
          trigger: false
        }); // regenerate the lists now

        this.updateFn.trigger();
      }
    }

    if (!this.algorithm) {
      // This shouldn't happen because `initialListsGenerated` implies we have an algorithm.
      throw new Error("Room list store has no algorithm to process dispatcher update with");
    }

    if (payload.action === 'MatrixActions.Room.receipt') {
      // First see if the receipt event is for our own user. If it was, trigger
      // a room update (we probably read the room on a different device).
      if ((0, _readReceipts.readReceiptChangeIsFor)(payload.event, this.matrixClient)) {
        const room = payload.room;

        if (!room) {
          console.warn(`Own read receipt was in unknown room ${room.roomId}`);
          return;
        }

        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.log(`[RoomListDebug] Got own read receipt in ${room.roomId}`);
        }

        await this.handleRoomUpdate(room, _models.RoomUpdateCause.ReadReceipt);
        this.updateFn.trigger();
        return;
      }
    } else if (payload.action === 'MatrixActions.Room.tags') {
      const roomPayload = payload; // TODO: Type out the dispatcher types

      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`[RoomListDebug] Got tag change in ${roomPayload.room.roomId}`);
      }

      await this.handleRoomUpdate(roomPayload.room, _models.RoomUpdateCause.PossibleTagChange);
      this.updateFn.trigger();
    } else if (payload.action === 'MatrixActions.Room.timeline') {
      const eventPayload = payload; // TODO: Type out the dispatcher types
      // Ignore non-live events (backfill)

      if (!eventPayload.isLiveEvent || !payload.isLiveUnfilteredRoomTimelineEvent) return;
      const roomId = eventPayload.event.getRoomId();
      const room = this.matrixClient.getRoom(roomId);

      const tryUpdate = async (updatedRoom
      /*: Room*/
      ) => {
        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.log(`[RoomListDebug] Live timeline event ${eventPayload.event.getId()}` + ` in ${updatedRoom.roomId}`);
        }

        if (eventPayload.event.getType() === 'm.room.tombstone' && eventPayload.event.getStateKey() === '') {
          if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
            // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
            console.log(`[RoomListDebug] Got tombstone event - trying to remove now-dead room`);
          }

          const newRoom = this.matrixClient.getRoom(eventPayload.event.getContent()['replacement_room']);

          if (newRoom) {
            // If we have the new room, then the new room check will have seen the predecessor
            // and did the required updates, so do nothing here.
            return;
          }
        }

        await this.handleRoomUpdate(updatedRoom, _models.RoomUpdateCause.Timeline);
        this.updateFn.trigger();
      };

      if (!room) {
        console.warn(`Live timeline event ${eventPayload.event.getId()} received without associated room`);
        console.warn(`Queuing failed room update for retry as a result.`);
        setTimeout(async () => {
          const updatedRoom = this.matrixClient.getRoom(roomId);
          await tryUpdate(updatedRoom);
        }, 100); // 100ms should be enough for the room to show up

        return;
      } else {
        await tryUpdate(room);
      }
    } else if (payload.action === 'MatrixActions.Event.decrypted') {
      const eventPayload = payload; // TODO: Type out the dispatcher types

      const roomId = eventPayload.event.getRoomId();
      const room = this.matrixClient.getRoom(roomId);

      if (!room) {
        console.warn(`Event ${eventPayload.event.getId()} was decrypted in an unknown room ${roomId}`);
        return;
      }

      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`[RoomListDebug] Decrypted timeline event ${eventPayload.event.getId()} in ${roomId}`);
      }

      await this.handleRoomUpdate(room, _models.RoomUpdateCause.Timeline);
      this.updateFn.trigger();
    } else if (payload.action === 'MatrixActions.accountData' && payload.event_type === 'm.direct') {
      const eventPayload = payload; // TODO: Type out the dispatcher types

      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`[RoomListDebug] Received updated DM map`);
      }

      const dmMap = eventPayload.event.getContent();

      for (const userId of Object.keys(dmMap)) {
        const roomIds = dmMap[userId];

        for (const roomId of roomIds) {
          const room = this.matrixClient.getRoom(roomId);

          if (!room) {
            console.warn(`${roomId} was found in DMs but the room is not in the store`);
            continue;
          } // We expect this RoomUpdateCause to no-op if there's no change, and we don't expect
          // the user to have hundreds of rooms to update in one event. As such, we just hammer
          // away at updates until the problem is solved. If we were expecting more than a couple
          // of rooms to be updated at once, we would consider batching the rooms up.


          await this.handleRoomUpdate(room, _models.RoomUpdateCause.PossibleTagChange);
        }
      }

      this.updateFn.trigger();
    } else if (payload.action === 'MatrixActions.Room.myMembership') {
      const membershipPayload = payload; // TODO: Type out the dispatcher types

      const oldMembership = (0, _membership.getEffectiveMembership)(membershipPayload.oldMembership);
      const newMembership = (0, _membership.getEffectiveMembership)(membershipPayload.membership);

      if (oldMembership !== _membership.EffectiveMembership.Join && newMembership === _membership.EffectiveMembership.Join) {
        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.log(`[RoomListDebug] Handling new room ${membershipPayload.room.roomId}`);
        } // If we're joining an upgraded room, we'll want to make sure we don't proliferate
        // the dead room in the list.


        const createEvent = membershipPayload.room.currentState.getStateEvents("m.room.create", "");

        if (createEvent && createEvent.getContent()['predecessor']) {
          if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
            // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
            console.log(`[RoomListDebug] Room has a predecessor`);
          }

          const prevRoom = this.matrixClient.getRoom(createEvent.getContent()['predecessor']['room_id']);

          if (prevRoom) {
            const isSticky = this.algorithm.stickyRoom === prevRoom;

            if (isSticky) {
              if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
                // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
                console.log(`[RoomListDebug] Clearing sticky room due to room upgrade`);
              }

              await this.algorithm.setStickyRoom(null);
            } // Note: we hit the algorithm instead of our handleRoomUpdate() function to
            // avoid redundant updates.


            if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
              // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
              console.log(`[RoomListDebug] Removing previous room from room list`);
            }

            await this.algorithm.handleRoomUpdate(prevRoom, _models.RoomUpdateCause.RoomRemoved);
          }
        }

        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.log(`[RoomListDebug] Adding new room to room list`);
        }

        await this.handleRoomUpdate(membershipPayload.room, _models.RoomUpdateCause.NewRoom);
        this.updateFn.trigger();
        return;
      }

      if (oldMembership !== _membership.EffectiveMembership.Invite && newMembership === _membership.EffectiveMembership.Invite) {
        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.log(`[RoomListDebug] Handling invite to ${membershipPayload.room.roomId}`);
        }

        await this.handleRoomUpdate(membershipPayload.room, _models.RoomUpdateCause.NewRoom);
        this.updateFn.trigger();
        return;
      } // If it's not a join, it's transitioning into a different list (possibly historical)


      if (oldMembership !== newMembership) {
        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.log(`[RoomListDebug] Handling membership change in ${membershipPayload.room.roomId}`);
        }

        await this.handleRoomUpdate(membershipPayload.room, _models.RoomUpdateCause.PossibleTagChange);
        this.updateFn.trigger();
        return;
      }
    }
  }

  async handleRoomUpdate(room
  /*: Room*/
  , cause
  /*: RoomUpdateCause*/
  )
  /*: Promise<any>*/
  {
    if (!_VisibilityProvider.VisibilityProvider.instance.isRoomVisible(room)) {
      return; // don't do anything on rooms that aren't visible
    }

    const shouldUpdate = await this.algorithm.handleRoomUpdate(room, cause);

    if (shouldUpdate) {
      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`[DEBUG] Room "${room.name}" (${room.roomId}) triggered by ${cause} requires list update`);
      }

      this.updateFn.mark();
    }
  }

  async setTagSorting(tagId
  /*: TagID*/
  , sort
  /*: SortAlgorithm*/
  ) {
    await this.setAndPersistTagSorting(tagId, sort);
    this.updateFn.trigger();
  }

  async setAndPersistTagSorting(tagId
  /*: TagID*/
  , sort
  /*: SortAlgorithm*/
  ) {
    await this.algorithm.setTagSorting(tagId, sort); // TODO: Per-account? https://github.com/vector-im/element-web/issues/14114

    localStorage.setItem(`mx_tagSort_${tagId}`, sort);
  }

  getTagSorting(tagId
  /*: TagID*/
  )
  /*: SortAlgorithm*/
  {
    return this.algorithm.getTagSorting(tagId);
  } // noinspection JSMethodCanBeStatic


  getStoredTagSorting(tagId
  /*: TagID*/
  )
  /*: SortAlgorithm*/
  {
    // TODO: Per-account? https://github.com/vector-im/element-web/issues/14114
    return localStorage.getItem(`mx_tagSort_${tagId}`);
  } // logic must match calculateListOrder


  calculateTagSorting(tagId
  /*: TagID*/
  )
  /*: SortAlgorithm*/
  {
    const isDefaultRecent = tagId === _models.DefaultTagID.Invite || tagId === _models.DefaultTagID.DM;
    const defaultSort = isDefaultRecent ? _models2.SortAlgorithm.Recent : _models2.SortAlgorithm.Alphabetic;

    const settingAlphabetical = _SettingsStore.default.getValue("RoomList.orderAlphabetically", null, true);

    const definedSort = this.getTagSorting(tagId);
    const storedSort = this.getStoredTagSorting(tagId); // We use the following order to determine which of the 4 flags to use:
    // Stored > Settings > Defined > Default

    let tagSort = defaultSort;

    if (storedSort) {
      tagSort = storedSort;
    } else if (!(0, _utils.isNullOrUndefined)(settingAlphabetical)) {
      tagSort = settingAlphabetical ? _models2.SortAlgorithm.Alphabetic : _models2.SortAlgorithm.Recent;
    } else if (definedSort) {
      tagSort = definedSort;
    } // else default (already set)


    return tagSort;
  }

  async setListOrder(tagId
  /*: TagID*/
  , order
  /*: ListAlgorithm*/
  ) {
    await this.setAndPersistListOrder(tagId, order);
    this.updateFn.trigger();
  }

  async setAndPersistListOrder(tagId
  /*: TagID*/
  , order
  /*: ListAlgorithm*/
  ) {
    await this.algorithm.setListOrdering(tagId, order); // TODO: Per-account? https://github.com/vector-im/element-web/issues/14114

    localStorage.setItem(`mx_listOrder_${tagId}`, order);
  }

  getListOrder(tagId
  /*: TagID*/
  )
  /*: ListAlgorithm*/
  {
    return this.algorithm.getListOrdering(tagId);
  } // noinspection JSMethodCanBeStatic


  getStoredListOrder(tagId
  /*: TagID*/
  )
  /*: ListAlgorithm*/
  {
    // TODO: Per-account? https://github.com/vector-im/element-web/issues/14114
    return localStorage.getItem(`mx_listOrder_${tagId}`);
  } // logic must match calculateTagSorting


  calculateListOrder(tagId
  /*: TagID*/
  )
  /*: ListAlgorithm*/
  {
    const defaultOrder = _models2.ListAlgorithm.Natural;

    const settingImportance = _SettingsStore.default.getValue("RoomList.orderByImportance", null, true);

    const definedOrder = this.getListOrder(tagId);
    const storedOrder = this.getStoredListOrder(tagId); // We use the following order to determine which of the 4 flags to use:
    // Stored > Settings > Defined > Default

    let listOrder = defaultOrder;

    if (storedOrder) {
      listOrder = storedOrder;
    } else if (!(0, _utils.isNullOrUndefined)(settingImportance)) {
      listOrder = settingImportance ? _models2.ListAlgorithm.Importance : _models2.ListAlgorithm.Natural;
    } else if (definedOrder) {
      listOrder = definedOrder;
    } // else default (already set)


    return listOrder;
  }

  async updateAlgorithmInstances() {
    // We'll require an update, so mark for one. Marking now also prevents the calls
    // to setTagSorting and setListOrder from causing triggers.
    this.updateFn.mark();

    for (const tag of Object.keys(this.orderedLists)) {
      const definedSort = this.getTagSorting(tag);
      const definedOrder = this.getListOrder(tag);
      const tagSort = this.calculateTagSorting(tag);
      const listOrder = this.calculateListOrder(tag);

      if (tagSort !== definedSort) {
        await this.setAndPersistTagSorting(tag, tagSort);
      }

      if (listOrder !== definedOrder) {
        await this.setAndPersistListOrder(tag, listOrder);
      }
    }
  }

  /**
   * Regenerates the room whole room list, discarding any previous results.
   *
   * Note: This is only exposed externally for the tests. Do not call this from within
   * the app.
   * @param trigger Set to false to prevent a list update from being sent. Should only
   * be used if the calling code will manually trigger the update.
   */
  async regenerateAllLists({
    trigger = true
  }) {
    console.warn("Regenerating all room lists");
    const rooms = this.matrixClient.getVisibleRooms().filter(r => _VisibilityProvider.VisibilityProvider.instance.isRoomVisible(r));
    const customTags = new Set();

    if (this.state.tagsEnabled) {
      for (const room of rooms) {
        if (!room.tags) continue;
        const tags = Object.keys(room.tags).filter(t => (0, _models.isCustomTag)(t));
        tags.forEach(t => customTags.add(t));
      }
    }

    const sorts
    /*: ITagSortingMap*/
    = {};
    const orders
    /*: IListOrderingMap*/
    = {};
    const allTags = [..._models.OrderedDefaultTagIDs, ...Array.from(customTags)];

    for (const tagId of allTags) {
      sorts[tagId] = this.calculateTagSorting(tagId);
      orders[tagId] = this.calculateListOrder(tagId);

      _RoomListLayoutStore.default.instance.ensureLayoutExists(tagId);
    }

    await this.algorithm.populateTags(sorts, orders);
    await this.algorithm.setKnownRooms(rooms);
    this.initialListsGenerated = true;
    if (trigger) this.updateFn.trigger();
  }

  addFilter(filter
  /*: IFilterCondition*/
  )
  /*: void*/
  {
    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log("Adding filter condition:", filter);
    }

    this.filterConditions.push(filter);

    if (this.algorithm) {
      this.algorithm.addFilterCondition(filter);
    }

    this.updateFn.trigger();
  }

  removeFilter(filter
  /*: IFilterCondition*/
  )
  /*: void*/
  {
    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log("Removing filter condition:", filter);
    }

    const idx = this.filterConditions.indexOf(filter);

    if (idx >= 0) {
      this.filterConditions.splice(idx, 1);

      if (this.algorithm) {
        this.algorithm.removeFilterCondition(filter);
      }
    }

    this.updateFn.trigger();
  }
  /**
   * Gets the first (and ideally only) name filter condition. If one isn't present,
   * this returns null.
   * @returns The first name filter condition, or null if none.
   */


  getFirstNameFilterCondition()
  /*: NameFilterCondition | null*/
  {
    for (const filter of this.filterConditions) {
      if (filter instanceof _NameFilterCondition.NameFilterCondition) {
        return filter;
      }
    }

    return null;
  }
  /**
   * Gets the tags for a room identified by the store. The returned set
   * should never be empty, and will contain DefaultTagID.Untagged if
   * the store is not aware of any tags.
   * @param room The room to get the tags for.
   * @returns The tags for the room.
   */


  getTagsForRoom(room
  /*: Room*/
  )
  /*: TagID[]*/
  {
    const algorithmTags = this.algorithm.getTagsForRoom(room);
    if (!algorithmTags) return [_models.DefaultTagID.Untagged];
    return algorithmTags;
  }

}

exports.RoomListStoreClass = RoomListStoreClass;
(0, _defineProperty2.default)(RoomListStoreClass, "TEST_MODE", false);

class RoomListStore {
  static get instance()
  /*: RoomListStoreClass*/
  {
    if (!RoomListStore.internalInstance) {
      RoomListStore.internalInstance = new RoomListStoreClass();
    }

    return RoomListStore.internalInstance;
  }

}

exports.default = RoomListStore;
(0, _defineProperty2.default)(RoomListStore, "internalInstance", void 0);
window.mxRoomListStore = RoomListStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0U3RvcmUudHMiXSwibmFtZXMiOlsiTElTVFNfVVBEQVRFX0VWRU5UIiwiUm9vbUxpc3RTdG9yZUNsYXNzIiwiQXN5bmNTdG9yZVdpdGhDbGllbnQiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHREaXNwYXRjaGVyIiwiQWxnb3JpdGhtIiwiVGFnV2F0Y2hlciIsIk1hcmtlZEV4ZWN1dGlvbiIsInRhZ0lkIiwiT2JqZWN0Iiwia2V5cyIsInVuZmlsdGVyZWRMaXN0cyIsIlJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIiwiaW5zdGFuY2UiLCJnZXRMaXN0U3RhdGUiLCJzZXRSb29tcyIsImVtaXQiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJjb25zb2xlIiwibG9nIiwidXBkYXRlRm4iLCJtYXJrIiwidHJpZ2dlciIsImNoZWNrTG9nZ2luZ0VuYWJsZWQiLCJzZXR0aW5nTmFtZSIsIndhdGNoZWRTZXR0aW5ncyIsIm1vbml0b3JTZXR0aW5nIiwiUm9vbVZpZXdTdG9yZSIsImFkZExpc3RlbmVyIiwiaGFuZGxlUlZTVXBkYXRlIiwiYWxnb3JpdGhtIiwib24iLCJMSVNUX1VQREFURURfRVZFTlQiLCJvbkFsZ29yaXRobUxpc3RVcGRhdGVkIiwiRklMVEVSX0NIQU5HRUQiLCJvbkFsZ29yaXRobUZpbHRlclVwZGF0ZWQiLCJnZXRVbmZpbHRlcmVkUm9vbXMiLCJvcmRlcmVkTGlzdHMiLCJnZXRPcmRlcmVkUm9vbXMiLCJyZXNldFN0b3JlIiwicmVzZXQiLCJ0YWdXYXRjaGVyIiwiZmlsdGVyQ29uZGl0aW9ucyIsImluaXRpYWxMaXN0c0dlbmVyYXRlZCIsIm9mZiIsIm1ha2VSZWFkeSIsImZvcmNlZENsaWVudCIsInJlYWR5U3RvcmUiLCJ1c2VVbml0VGVzdENsaWVudCIsInJlYWRBbmRDYWNoZVNldHRpbmdzRnJvbVN0b3JlIiwicmVnZW5lcmF0ZUFsbExpc3RzIiwid2FybiIsInRhZ3NFbmFibGVkIiwidXBkYXRlU3RhdGUiLCJ1cGRhdGVBbGdvcml0aG1JbnN0YW5jZXMiLCJtYXRyaXhDbGllbnQiLCJhY3RpdmVSb29tSWQiLCJnZXRSb29tSWQiLCJzdGlja3lSb29tIiwic2V0U3RpY2t5Um9vbSIsImFjdGl2ZVJvb20iLCJnZXRSb29tIiwib25SZWFkeSIsIm9uTm90UmVhZHkiLCJvbkFjdGlvbiIsInBheWxvYWQiLCJsb2dpY2FsbHlSZWFkeSIsIlRFU1RfTU9ERSIsIm9uRGlzcGF0Y2hBc3luYyIsInNldEltbWVkaWF0ZSIsImFjdGlvbiIsImluY2x1ZGVzIiwiZW5hYmxlZCIsIkVycm9yIiwiZXZlbnQiLCJyb29tIiwicm9vbUlkIiwiaGFuZGxlUm9vbVVwZGF0ZSIsIlJvb21VcGRhdGVDYXVzZSIsIlJlYWRSZWNlaXB0Iiwicm9vbVBheWxvYWQiLCJQb3NzaWJsZVRhZ0NoYW5nZSIsImV2ZW50UGF5bG9hZCIsImlzTGl2ZUV2ZW50IiwiaXNMaXZlVW5maWx0ZXJlZFJvb21UaW1lbGluZUV2ZW50IiwidHJ5VXBkYXRlIiwidXBkYXRlZFJvb20iLCJnZXRJZCIsImdldFR5cGUiLCJnZXRTdGF0ZUtleSIsIm5ld1Jvb20iLCJnZXRDb250ZW50IiwiVGltZWxpbmUiLCJzZXRUaW1lb3V0IiwiZXZlbnRfdHlwZSIsImRtTWFwIiwidXNlcklkIiwicm9vbUlkcyIsIm1lbWJlcnNoaXBQYXlsb2FkIiwib2xkTWVtYmVyc2hpcCIsIm5ld01lbWJlcnNoaXAiLCJtZW1iZXJzaGlwIiwiRWZmZWN0aXZlTWVtYmVyc2hpcCIsIkpvaW4iLCJjcmVhdGVFdmVudCIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwicHJldlJvb20iLCJpc1N0aWNreSIsIlJvb21SZW1vdmVkIiwiTmV3Um9vbSIsIkludml0ZSIsImNhdXNlIiwiVmlzaWJpbGl0eVByb3ZpZGVyIiwiaXNSb29tVmlzaWJsZSIsInNob3VsZFVwZGF0ZSIsIm5hbWUiLCJzZXRUYWdTb3J0aW5nIiwic29ydCIsInNldEFuZFBlcnNpc3RUYWdTb3J0aW5nIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsImdldFRhZ1NvcnRpbmciLCJnZXRTdG9yZWRUYWdTb3J0aW5nIiwiZ2V0SXRlbSIsImNhbGN1bGF0ZVRhZ1NvcnRpbmciLCJpc0RlZmF1bHRSZWNlbnQiLCJEZWZhdWx0VGFnSUQiLCJETSIsImRlZmF1bHRTb3J0IiwiU29ydEFsZ29yaXRobSIsIlJlY2VudCIsIkFscGhhYmV0aWMiLCJzZXR0aW5nQWxwaGFiZXRpY2FsIiwiZGVmaW5lZFNvcnQiLCJzdG9yZWRTb3J0IiwidGFnU29ydCIsInNldExpc3RPcmRlciIsIm9yZGVyIiwic2V0QW5kUGVyc2lzdExpc3RPcmRlciIsInNldExpc3RPcmRlcmluZyIsImdldExpc3RPcmRlciIsImdldExpc3RPcmRlcmluZyIsImdldFN0b3JlZExpc3RPcmRlciIsImNhbGN1bGF0ZUxpc3RPcmRlciIsImRlZmF1bHRPcmRlciIsIkxpc3RBbGdvcml0aG0iLCJOYXR1cmFsIiwic2V0dGluZ0ltcG9ydGFuY2UiLCJkZWZpbmVkT3JkZXIiLCJzdG9yZWRPcmRlciIsImxpc3RPcmRlciIsIkltcG9ydGFuY2UiLCJ0YWciLCJyb29tcyIsImdldFZpc2libGVSb29tcyIsImZpbHRlciIsInIiLCJjdXN0b21UYWdzIiwiU2V0Iiwic3RhdGUiLCJ0YWdzIiwidCIsImZvckVhY2giLCJhZGQiLCJzb3J0cyIsIm9yZGVycyIsImFsbFRhZ3MiLCJPcmRlcmVkRGVmYXVsdFRhZ0lEcyIsIkFycmF5IiwiZnJvbSIsIlJvb21MaXN0TGF5b3V0U3RvcmUiLCJlbnN1cmVMYXlvdXRFeGlzdHMiLCJwb3B1bGF0ZVRhZ3MiLCJzZXRLbm93blJvb21zIiwiYWRkRmlsdGVyIiwicHVzaCIsImFkZEZpbHRlckNvbmRpdGlvbiIsInJlbW92ZUZpbHRlciIsImlkeCIsImluZGV4T2YiLCJzcGxpY2UiLCJyZW1vdmVGaWx0ZXJDb25kaXRpb24iLCJnZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24iLCJOYW1lRmlsdGVyQ29uZGl0aW9uIiwiZ2V0VGFnc0ZvclJvb20iLCJhbGdvcml0aG1UYWdzIiwiVW50YWdnZWQiLCJSb29tTGlzdFN0b3JlIiwiaW50ZXJuYWxJbnN0YW5jZSIsIndpbmRvdyIsIm14Um9vbUxpc3RTdG9yZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLGtCQUFrQixHQUFHLGNBQTNCOzs7QUFFQSxNQUFNQyxrQkFBTixTQUFpQ0M7QUFBakM7QUFBOEQ7QUFDakU7QUFDSjtBQUNBO0FBQ0E7QUFtQklDLEVBQUFBLFdBQVcsR0FBRztBQUNWLFVBQU1DLG1CQUFOO0FBRFUsaUVBaEJrQixLQWdCbEI7QUFBQSxxREFmTSxJQUFJQyxvQkFBSixFQWVOO0FBQUEsNERBZGlDLEVBY2pDO0FBQUEsc0RBYk8sSUFBSUMsc0JBQUosQ0FBZSxJQUFmLENBYVA7QUFBQSxvREFaSyxJQUFJQyxnQ0FBSixDQUFvQixNQUFNO0FBQ3pDLFdBQUssTUFBTUMsS0FBWCxJQUFvQkMsTUFBTSxDQUFDQyxJQUFQLENBQVksS0FBS0MsZUFBakIsQ0FBcEIsRUFBdUQ7QUFDbkRDLCtEQUEyQkMsUUFBM0IsQ0FBb0NDLFlBQXBDLENBQWlETixLQUFqRCxFQUF3RE8sUUFBeEQsQ0FBaUUsS0FBS0osZUFBTCxDQUFxQkgsS0FBckIsQ0FBakU7QUFDSDs7QUFDRCxXQUFLUSxJQUFMLENBQVVoQixrQkFBVjtBQUNILEtBTGtCLENBWUw7QUFBQSwyREFMcUIsQ0FDL0IscUJBRCtCLEVBRS9CLHlCQUYrQixDQUVKO0FBRkksS0FLckI7QUFBQSxrRUFtY21C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QUFBO0FBQWlFO0FBQzdELFNBQUssTUFBTTNCLE1BQVgsSUFBcUIsS0FBS2xILGdCQUExQixFQUE0QztBQUN4QyxVQUFJa0gsTUFBTSxZQUFZNEIsd0NBQXRCLEVBQTJDO0FBQ3ZDLGVBQU81QixNQUFQO0FBQ0g7QUFDSjs7QUFDRCxXQUFPLElBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDVzZCLEVBQUFBLGNBQVAsQ0FBc0I5RztBQUF0QjtBQUFBO0FBQUE7QUFBMkM7QUFDdkMsVUFBTStHLGFBQWEsR0FBRyxLQUFLNUosU0FBTCxDQUFlMkosY0FBZixDQUE4QjlHLElBQTlCLENBQXRCO0FBQ0EsUUFBSSxDQUFDK0csYUFBTCxFQUFvQixPQUFPLENBQUMzRCxxQkFBYTRELFFBQWQsQ0FBUDtBQUNwQixXQUFPRCxhQUFQO0FBQ0g7O0FBcmtCZ0U7Ozs4QkFBeEQxTCxrQixlQUtpQixLOztBQW1rQmYsTUFBTTRMLGFBQU4sQ0FBb0I7QUFHL0IsYUFBa0JoTCxRQUFsQjtBQUFBO0FBQWlEO0FBQzdDLFFBQUksQ0FBQ2dMLGFBQWEsQ0FBQ0MsZ0JBQW5CLEVBQXFDO0FBQ2pDRCxNQUFBQSxhQUFhLENBQUNDLGdCQUFkLEdBQWlDLElBQUk3TCxrQkFBSixFQUFqQztBQUNIOztBQUVELFdBQU80TCxhQUFhLENBQUNDLGdCQUFyQjtBQUNIOztBQVQ4Qjs7OzhCQUFkRCxhO0FBWXJCRSxNQUFNLENBQUNDLGVBQVAsR0FBeUJILGFBQWEsQ0FBQ2hMLFFBQXZDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQsIGlzQ3VzdG9tVGFnLCBPcmRlcmVkRGVmYXVsdFRhZ0lEcywgUm9vbVVwZGF0ZUNhdXNlLCBUYWdJRCB9IGZyb20gXCIuL21vZGVsc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgSUxpc3RPcmRlcmluZ01hcCwgSVRhZ01hcCwgSVRhZ1NvcnRpbmdNYXAsIExpc3RBbGdvcml0aG0sIFNvcnRBbGdvcml0aG0gfSBmcm9tIFwiLi9hbGdvcml0aG1zL21vZGVsc1wiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgcmVhZFJlY2VpcHRDaGFuZ2VJc0ZvciB9IGZyb20gXCIuLi8uLi91dGlscy9yZWFkLXJlY2VpcHRzXCI7XG5pbXBvcnQgeyBGSUxURVJfQ0hBTkdFRCwgSUZpbHRlckNvbmRpdGlvbiB9IGZyb20gXCIuL2ZpbHRlcnMvSUZpbHRlckNvbmRpdGlvblwiO1xuaW1wb3J0IHsgVGFnV2F0Y2hlciB9IGZyb20gXCIuL1RhZ1dhdGNoZXJcIjtcbmltcG9ydCBSb29tVmlld1N0b3JlIGZyb20gXCIuLi9Sb29tVmlld1N0b3JlXCI7XG5pbXBvcnQgeyBBbGdvcml0aG0sIExJU1RfVVBEQVRFRF9FVkVOVCB9IGZyb20gXCIuL2FsZ29yaXRobXMvQWxnb3JpdGhtXCI7XG5pbXBvcnQgeyBFZmZlY3RpdmVNZW1iZXJzaGlwLCBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwIH0gZnJvbSBcIi4uLy4uL3V0aWxzL21lbWJlcnNoaXBcIjtcbmltcG9ydCB7IGlzTnVsbE9yVW5kZWZpbmVkIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5pbXBvcnQgUm9vbUxpc3RMYXlvdXRTdG9yZSBmcm9tIFwiLi9Sb29tTGlzdExheW91dFN0b3JlXCI7XG5pbXBvcnQgeyBNYXJrZWRFeGVjdXRpb24gfSBmcm9tIFwiLi4vLi4vdXRpbHMvTWFya2VkRXhlY3V0aW9uXCI7XG5pbXBvcnQgeyBBc3luY1N0b3JlV2l0aENsaWVudCB9IGZyb20gXCIuLi9Bc3luY1N0b3JlV2l0aENsaWVudFwiO1xuaW1wb3J0IHsgTmFtZUZpbHRlckNvbmRpdGlvbiB9IGZyb20gXCIuL2ZpbHRlcnMvTmFtZUZpbHRlckNvbmRpdGlvblwiO1xuaW1wb3J0IHsgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUgfSBmcm9tIFwiLi4vbm90aWZpY2F0aW9ucy9Sb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZVwiO1xuaW1wb3J0IHsgVmlzaWJpbGl0eVByb3ZpZGVyIH0gZnJvbSBcIi4vZmlsdGVycy9WaXNpYmlsaXR5UHJvdmlkZXJcIjtcblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdGFnc0VuYWJsZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFRoZSBldmVudC9jaGFubmVsIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSByb29tIGxpc3RzIGhhdmUgYmVlbiBjaGFuZ2VkLiBSYWlzZWRcbiAqIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgaW5zdGFuY2Ugb2YgdGhlIHN0b3JlLlxuICovXG5leHBvcnQgY29uc3QgTElTVFNfVVBEQVRFX0VWRU5UID0gXCJsaXN0c191cGRhdGVcIjtcblxuZXhwb3J0IGNsYXNzIFJvb21MaXN0U3RvcmVDbGFzcyBleHRlbmRzIEFzeW5jU3RvcmVXaXRoQ2xpZW50PElTdGF0ZT4ge1xuICAgIC8qKlxuICAgICAqIFNldCB0byB0cnVlIGlmIHlvdSdyZSBydW5uaW5nIHRlc3RzIG9uIHRoZSBzdG9yZS4gU2hvdWxkIG5vdCBiZSB0b3VjaGVkIGluXG4gICAgICogYW55IG90aGVyIGVudmlyb25tZW50LlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgVEVTVF9NT0RFID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGluaXRpYWxMaXN0c0dlbmVyYXRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgYWxnb3JpdGhtID0gbmV3IEFsZ29yaXRobSgpO1xuICAgIHByaXZhdGUgZmlsdGVyQ29uZGl0aW9uczogSUZpbHRlckNvbmRpdGlvbltdID0gW107XG4gICAgcHJpdmF0ZSB0YWdXYXRjaGVyID0gbmV3IFRhZ1dhdGNoZXIodGhpcyk7XG4gICAgcHJpdmF0ZSB1cGRhdGVGbiA9IG5ldyBNYXJrZWRFeGVjdXRpb24oKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHRhZ0lkIG9mIE9iamVjdC5rZXlzKHRoaXMudW5maWx0ZXJlZExpc3RzKSkge1xuICAgICAgICAgICAgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0TGlzdFN0YXRlKHRhZ0lkKS5zZXRSb29tcyh0aGlzLnVuZmlsdGVyZWRMaXN0c1t0YWdJZF0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1pdChMSVNUU19VUERBVEVfRVZFTlQpO1xuICAgIH0pO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSB3YXRjaGVkU2V0dGluZ3MgPSBbXG4gICAgICAgICdmZWF0dXJlX2N1c3RvbV90YWdzJyxcbiAgICAgICAgJ2FkdmFuY2VkUm9vbUxpc3RMb2dnaW5nJywgLy8gVE9ETzogUmVtb3ZlIHdhdGNoOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgIF07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoZGVmYXVsdERpc3BhdGNoZXIpO1xuXG4gICAgICAgIHRoaXMuY2hlY2tMb2dnaW5nRW5hYmxlZCgpO1xuICAgICAgICBmb3IgKGNvbnN0IHNldHRpbmdOYW1lIG9mIHRoaXMud2F0Y2hlZFNldHRpbmdzKSBTZXR0aW5nc1N0b3JlLm1vbml0b3JTZXR0aW5nKHNldHRpbmdOYW1lLCBudWxsKTtcbiAgICAgICAgUm9vbVZpZXdTdG9yZS5hZGRMaXN0ZW5lcigoKSA9PiB0aGlzLmhhbmRsZVJWU1VwZGF0ZSh7fSkpO1xuICAgICAgICB0aGlzLmFsZ29yaXRobS5vbihMSVNUX1VQREFURURfRVZFTlQsIHRoaXMub25BbGdvcml0aG1MaXN0VXBkYXRlZCk7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtLm9uKEZJTFRFUl9DSEFOR0VELCB0aGlzLm9uQWxnb3JpdGhtRmlsdGVyVXBkYXRlZCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB1bmZpbHRlcmVkTGlzdHMoKTogSVRhZ01hcCB7XG4gICAgICAgIGlmICghdGhpcy5hbGdvcml0aG0pIHJldHVybiB7fTsgLy8gTm8gdGFncyB5ZXQuXG4gICAgICAgIHJldHVybiB0aGlzLmFsZ29yaXRobS5nZXRVbmZpbHRlcmVkUm9vbXMoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IG9yZGVyZWRMaXN0cygpOiBJVGFnTWFwIHtcbiAgICAgICAgaWYgKCF0aGlzLmFsZ29yaXRobSkgcmV0dXJuIHt9OyAvLyBObyB0YWdzIHlldC5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWxnb3JpdGhtLmdldE9yZGVyZWRSb29tcygpO1xuICAgIH1cblxuICAgIC8vIEludGVuZGVkIGZvciB0ZXN0IHVzYWdlXG4gICAgcHVibGljIGFzeW5jIHJlc2V0U3RvcmUoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucmVzZXQoKTtcbiAgICAgICAgdGhpcy50YWdXYXRjaGVyID0gbmV3IFRhZ1dhdGNoZXIodGhpcyk7XG4gICAgICAgIHRoaXMuZmlsdGVyQ29uZGl0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLmluaXRpYWxMaXN0c0dlbmVyYXRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYWxnb3JpdGhtLm9mZihMSVNUX1VQREFURURfRVZFTlQsIHRoaXMub25BbGdvcml0aG1MaXN0VXBkYXRlZCk7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtLm9mZihGSUxURVJfQ0hBTkdFRCwgdGhpcy5vbkFsZ29yaXRobUxpc3RVcGRhdGVkKTtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0gPSBuZXcgQWxnb3JpdGhtKCk7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtLm9uKExJU1RfVVBEQVRFRF9FVkVOVCwgdGhpcy5vbkFsZ29yaXRobUxpc3RVcGRhdGVkKTtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0ub24oRklMVEVSX0NIQU5HRUQsIHRoaXMub25BbGdvcml0aG1MaXN0VXBkYXRlZCk7XG5cbiAgICAgICAgLy8gUmVzZXQgc3RhdGUgd2l0aG91dCBjYXVzaW5nIHVwZGF0ZXMgYXMgdGhlIGNsaWVudCB3aWxsIGhhdmUgYmVlbiBkZXN0cm95ZWRcbiAgICAgICAgLy8gYW5kIGRvd25zdHJlYW0gY29kZSB3aWxsIHRocm93IE5QRSBlcnJvcnMuXG4gICAgICAgIGF3YWl0IHRoaXMucmVzZXQobnVsbCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gUHVibGljIGZvciB0ZXN0IHVzYWdlLiBEbyBub3QgY2FsbCB0aGlzLlxuICAgIHB1YmxpYyBhc3luYyBtYWtlUmVhZHkoZm9yY2VkQ2xpZW50PzogTWF0cml4Q2xpZW50KSB7XG4gICAgICAgIGlmIChmb3JjZWRDbGllbnQpIHtcbiAgICAgICAgICAgIHRoaXMucmVhZHlTdG9yZS51c2VVbml0VGVzdENsaWVudChmb3JjZWRDbGllbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaGVja0xvZ2dpbmdFbmFibGVkKCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIGFueSBzZXR0aW5ncyBoZXJlLCBhcyBzb21lIG1heSBoYXZlIGhhcHBlbmVkIGJlZm9yZSB3ZSB3ZXJlIGxvZ2ljYWxseSByZWFkeS5cbiAgICAgICAgLy8gVXBkYXRlIGFueSBzZXR0aW5ncyBoZXJlLCBhcyBzb21lIG1heSBoYXZlIGhhcHBlbmVkIGJlZm9yZSB3ZSB3ZXJlIGxvZ2ljYWxseSByZWFkeS5cbiAgICAgICAgY29uc29sZS5sb2coXCJSZWdlbmVyYXRpbmcgcm9vbSBsaXN0czogU3RhcnR1cFwiKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkQW5kQ2FjaGVTZXR0aW5nc0Zyb21TdG9yZSgpO1xuICAgICAgICBhd2FpdCB0aGlzLnJlZ2VuZXJhdGVBbGxMaXN0cyh7dHJpZ2dlcjogZmFsc2V9KTtcbiAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSVlNVcGRhdGUoe3RyaWdnZXI6IGZhbHNlfSk7IC8vIGZha2UgYW4gUlZTIHVwZGF0ZSB0byBhZGp1c3Qgc3RpY2t5IHJvb20sIGlmIG5lZWRlZFxuXG4gICAgICAgIHRoaXMudXBkYXRlRm4ubWFyaygpOyAvLyB3ZSBhbG1vc3QgY2VydGFpbmx5IHdhbnQgdG8gdHJpZ2dlciBhbiB1cGRhdGUuXG4gICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tMb2dnaW5nRW5hYmxlZCgpIHtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQWR2YW5jZWQgcm9vbSBsaXN0IGxvZ2dpbmcgaXMgZW5hYmxlZFwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVhZEFuZENhY2hlU2V0dGluZ3NGcm9tU3RvcmUoKSB7XG4gICAgICAgIGNvbnN0IHRhZ3NFbmFibGVkID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfY3VzdG9tX3RhZ3NcIik7XG4gICAgICAgIGF3YWl0IHRoaXMudXBkYXRlU3RhdGUoe1xuICAgICAgICAgICAgdGFnc0VuYWJsZWQsXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZUFsZ29yaXRobUluc3RhbmNlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgc3VzcGVjdGVkIFJvb21WaWV3U3RvcmUgY2hhbmdlcy5cbiAgICAgKiBAcGFyYW0gdHJpZ2dlciBTZXQgdG8gZmFsc2UgdG8gcHJldmVudCBhIGxpc3QgdXBkYXRlIGZyb20gYmVpbmcgc2VudC4gU2hvdWxkIG9ubHlcbiAgICAgKiBiZSB1c2VkIGlmIHRoZSBjYWxsaW5nIGNvZGUgd2lsbCBtYW51YWxseSB0cmlnZ2VyIHRoZSB1cGRhdGUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVSVlNVcGRhdGUoe3RyaWdnZXIgPSB0cnVlfSkge1xuICAgICAgICBpZiAoIXRoaXMubWF0cml4Q2xpZW50KSByZXR1cm47IC8vIFdlIGFzc3VtZSB0aGVyZSB3b24ndCBiZSBSVlMgdXBkYXRlcyB3aXRob3V0IGEgY2xpZW50XG5cbiAgICAgICAgY29uc3QgYWN0aXZlUm9vbUlkID0gUm9vbVZpZXdTdG9yZS5nZXRSb29tSWQoKTtcbiAgICAgICAgaWYgKCFhY3RpdmVSb29tSWQgJiYgdGhpcy5hbGdvcml0aG0uc3RpY2t5Um9vbSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5hbGdvcml0aG0uc2V0U3RpY2t5Um9vbShudWxsKTtcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVSb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVJvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKGFjdGl2ZVJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZVJvb20pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7YWN0aXZlUm9vbUlkfSBpcyBjdXJyZW50IGluIFJWUyBidXQgbWlzc2luZyBmcm9tIGNsaWVudCAtIGNsZWFyaW5nIHN0aWNreSByb29tYCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hbGdvcml0aG0uc2V0U3RpY2t5Um9vbShudWxsKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlUm9vbSAhPT0gdGhpcy5hbGdvcml0aG0uc3RpY2t5Um9vbSkge1xuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2hhbmdpbmcgc3RpY2t5IHJvb20gdG8gJHthY3RpdmVSb29tSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldFN0aWNreVJvb20oYWN0aXZlUm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHJpZ2dlcikgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIG9uUmVhZHkoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5tYWtlUmVhZHkoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25Ob3RSZWFkeSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBhd2FpdCB0aGlzLnJlc2V0U3RvcmUoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25BY3Rpb24ocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkge1xuICAgICAgICAvLyBJZiB3ZSdyZSBub3QgcmVtb3RlbHkgcmVhZHksIGRvbid0IGV2ZW4gYm90aGVyIHNjaGVkdWxpbmcgdGhlIGRpc3BhdGNoIGhhbmRsaW5nLlxuICAgICAgICAvLyBUaGlzIGlzIHJlcGVhdGVkIGluIHRoZSBoYW5kbGVyIGp1c3QgaW4gY2FzZSB0aGluZ3MgY2hhbmdlIGJldHdlZW4gYSBkZWNpc2lvbiBoZXJlIGFuZFxuICAgICAgICAvLyB3aGVuIHRoZSB0aW1lciBmaXJlcy5cbiAgICAgICAgY29uc3QgbG9naWNhbGx5UmVhZHkgPSB0aGlzLm1hdHJpeENsaWVudCAmJiB0aGlzLmluaXRpYWxMaXN0c0dlbmVyYXRlZDtcbiAgICAgICAgaWYgKCFsb2dpY2FsbHlSZWFkeSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFdoZW4gd2UncmUgcnVubmluZyB0ZXN0cyB3ZSBjYW4ndCByZWxpYWJseSB1c2Ugc2V0SW1tZWRpYXRlIG91dCBvZiB0aW1pbmcgY29uY2VybnMuXG4gICAgICAgIC8vIEFzIHN1Y2gsIHdlIHVzZSBhIG1vcmUgc3luY2hyb25vdXMgbW9kZWwuXG4gICAgICAgIGlmIChSb29tTGlzdFN0b3JlQ2xhc3MuVEVTVF9NT0RFKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLm9uRGlzcGF0Y2hBc3luYyhwYXlsb2FkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIGRvIHRoaXMgdG8gaW50ZW50aW9uYWxseSBicmVhayBvdXQgb2YgdGhlIGN1cnJlbnQgZXZlbnQgbG9vcCB0YXNrLCBhbGxvd2luZ1xuICAgICAgICAvLyB1cyB0byBpbnN0ZWFkIHdhaXQgZm9yIGEgbW9yZSBjb252ZW5pZW50IHRpbWUgdG8gcnVuIG91ciB1cGRhdGVzLlxuICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gdGhpcy5vbkRpc3BhdGNoQXN5bmMocGF5bG9hZCkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvbkRpc3BhdGNoQXN5bmMocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkge1xuICAgICAgICAvLyBFdmVyeXRoaW5nIGhlcmUgcmVxdWlyZXMgYSBNYXRyaXhDbGllbnQgb3Igc29tZSBzb3J0IG9mIGxvZ2ljYWwgcmVhZGluZXNzLlxuICAgICAgICBjb25zdCBsb2dpY2FsbHlSZWFkeSA9IHRoaXMubWF0cml4Q2xpZW50ICYmIHRoaXMuaW5pdGlhbExpc3RzR2VuZXJhdGVkO1xuICAgICAgICBpZiAoIWxvZ2ljYWxseVJlYWR5KSByZXR1cm47XG5cbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnc2V0dGluZ191cGRhdGVkJykge1xuICAgICAgICAgICAgaWYgKHRoaXMud2F0Y2hlZFNldHRpbmdzLmluY2x1ZGVzKHBheWxvYWQuc2V0dGluZ05hbWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5zZXR0aW5nTmFtZSA9PT0gXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIExvZyB3aGVuIHRoZSBzZXR0aW5nIGNoYW5nZXMgc28gd2Uga25vdyB3aGVuIGl0IHdhcyB0dXJuZWQgb24gaW4gdGhlIHJhZ2VzaGFrZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmFibGVkID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJBZHZhbmNlZCByb29tIGxpc3QgbG9nZ2luZyBpcyBlbmFibGVkPyBcIiArIGVuYWJsZWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZWdlbmVyYXRpbmcgcm9vbSBsaXN0czogU2V0dGluZ3MgY2hhbmdlZFwiKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJlYWRBbmRDYWNoZVNldHRpbmdzRnJvbVN0b3JlKCk7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJlZ2VuZXJhdGVBbGxMaXN0cyh7dHJpZ2dlcjogZmFsc2V9KTsgLy8gcmVnZW5lcmF0ZSB0aGUgbGlzdHMgbm93XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuYWxnb3JpdGhtKSB7XG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZG4ndCBoYXBwZW4gYmVjYXVzZSBgaW5pdGlhbExpc3RzR2VuZXJhdGVkYCBpbXBsaWVzIHdlIGhhdmUgYW4gYWxnb3JpdGhtLlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUm9vbSBsaXN0IHN0b3JlIGhhcyBubyBhbGdvcml0aG0gdG8gcHJvY2VzcyBkaXNwYXRjaGVyIHVwZGF0ZSB3aXRoXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnTWF0cml4QWN0aW9ucy5Sb29tLnJlY2VpcHQnKSB7XG4gICAgICAgICAgICAvLyBGaXJzdCBzZWUgaWYgdGhlIHJlY2VpcHQgZXZlbnQgaXMgZm9yIG91ciBvd24gdXNlci4gSWYgaXQgd2FzLCB0cmlnZ2VyXG4gICAgICAgICAgICAvLyBhIHJvb20gdXBkYXRlICh3ZSBwcm9iYWJseSByZWFkIHRoZSByb29tIG9uIGEgZGlmZmVyZW50IGRldmljZSkuXG4gICAgICAgICAgICBpZiAocmVhZFJlY2VpcHRDaGFuZ2VJc0ZvcihwYXlsb2FkLmV2ZW50LCB0aGlzLm1hdHJpeENsaWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gcGF5bG9hZC5yb29tO1xuICAgICAgICAgICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYE93biByZWFkIHJlY2VpcHQgd2FzIGluIHVua25vd24gcm9vbSAke3Jvb20ucm9vbUlkfWApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIEdvdCBvd24gcmVhZCByZWNlaXB0IGluICR7cm9vbS5yb29tSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUm9vbVVwZGF0ZShyb29tLCBSb29tVXBkYXRlQ2F1c2UuUmVhZFJlY2VpcHQpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ01hdHJpeEFjdGlvbnMuUm9vbS50YWdzJykge1xuICAgICAgICAgICAgY29uc3Qgcm9vbVBheWxvYWQgPSAoPGFueT5wYXlsb2FkKTsgLy8gVE9ETzogVHlwZSBvdXQgdGhlIGRpc3BhdGNoZXIgdHlwZXNcbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBHb3QgdGFnIGNoYW5nZSBpbiAke3Jvb21QYXlsb2FkLnJvb20ucm9vbUlkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHJvb21QYXlsb2FkLnJvb20sIFJvb21VcGRhdGVDYXVzZS5Qb3NzaWJsZVRhZ0NoYW5nZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ01hdHJpeEFjdGlvbnMuUm9vbS50aW1lbGluZScpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50UGF5bG9hZCA9ICg8YW55PnBheWxvYWQpOyAvLyBUT0RPOiBUeXBlIG91dCB0aGUgZGlzcGF0Y2hlciB0eXBlc1xuXG4gICAgICAgICAgICAvLyBJZ25vcmUgbm9uLWxpdmUgZXZlbnRzIChiYWNrZmlsbClcbiAgICAgICAgICAgIGlmICghZXZlbnRQYXlsb2FkLmlzTGl2ZUV2ZW50IHx8ICFwYXlsb2FkLmlzTGl2ZVVuZmlsdGVyZWRSb29tVGltZWxpbmVFdmVudCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBldmVudFBheWxvYWQuZXZlbnQuZ2V0Um9vbUlkKCk7XG4gICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgY29uc3QgdHJ5VXBkYXRlID0gYXN5bmMgKHVwZGF0ZWRSb29tOiBSb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gTGl2ZSB0aW1lbGluZSBldmVudCAke2V2ZW50UGF5bG9hZC5ldmVudC5nZXRJZCgpfWAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCBpbiAke3VwZGF0ZWRSb29tLnJvb21JZH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50UGF5bG9hZC5ldmVudC5nZXRUeXBlKCkgPT09ICdtLnJvb20udG9tYnN0b25lJyAmJiBldmVudFBheWxvYWQuZXZlbnQuZ2V0U3RhdGVLZXkoKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBHb3QgdG9tYnN0b25lIGV2ZW50IC0gdHJ5aW5nIHRvIHJlbW92ZSBub3ctZGVhZCByb29tYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3Um9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20oZXZlbnRQYXlsb2FkLmV2ZW50LmdldENvbnRlbnQoKVsncmVwbGFjZW1lbnRfcm9vbSddKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Jvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgdGhlIG5ldyByb29tLCB0aGVuIHRoZSBuZXcgcm9vbSBjaGVjayB3aWxsIGhhdmUgc2VlbiB0aGUgcHJlZGVjZXNzb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZCBkaWQgdGhlIHJlcXVpcmVkIHVwZGF0ZXMsIHNvIGRvIG5vdGhpbmcgaGVyZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUodXBkYXRlZFJvb20sIFJvb21VcGRhdGVDYXVzZS5UaW1lbGluZSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBMaXZlIHRpbWVsaW5lIGV2ZW50ICR7ZXZlbnRQYXlsb2FkLmV2ZW50LmdldElkKCl9IHJlY2VpdmVkIHdpdGhvdXQgYXNzb2NpYXRlZCByb29tYCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBRdWV1aW5nIGZhaWxlZCByb29tIHVwZGF0ZSBmb3IgcmV0cnkgYXMgYSByZXN1bHQuYCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRSb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0cnlVcGRhdGUodXBkYXRlZFJvb20pO1xuICAgICAgICAgICAgICAgIH0sIDEwMCk7IC8vIDEwMG1zIHNob3VsZCBiZSBlbm91Z2ggZm9yIHRoZSByb29tIHRvIHNob3cgdXBcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRyeVVwZGF0ZShyb29tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ01hdHJpeEFjdGlvbnMuRXZlbnQuZGVjcnlwdGVkJykge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRQYXlsb2FkID0gKDxhbnk+cGF5bG9hZCk7IC8vIFRPRE86IFR5cGUgb3V0IHRoZSBkaXNwYXRjaGVyIHR5cGVzXG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBldmVudFBheWxvYWQuZXZlbnQuZ2V0Um9vbUlkKCk7XG4gICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFdmVudCAke2V2ZW50UGF5bG9hZC5ldmVudC5nZXRJZCgpfSB3YXMgZGVjcnlwdGVkIGluIGFuIHVua25vd24gcm9vbSAke3Jvb21JZH1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gRGVjcnlwdGVkIHRpbWVsaW5lIGV2ZW50ICR7ZXZlbnRQYXlsb2FkLmV2ZW50LmdldElkKCl9IGluICR7cm9vbUlkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHJvb20sIFJvb21VcGRhdGVDYXVzZS5UaW1lbGluZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ01hdHJpeEFjdGlvbnMuYWNjb3VudERhdGEnICYmIHBheWxvYWQuZXZlbnRfdHlwZSA9PT0gJ20uZGlyZWN0Jykge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRQYXlsb2FkID0gKDxhbnk+cGF5bG9hZCk7IC8vIFRPRE86IFR5cGUgb3V0IHRoZSBkaXNwYXRjaGVyIHR5cGVzXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gUmVjZWl2ZWQgdXBkYXRlZCBETSBtYXBgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRtTWFwID0gZXZlbnRQYXlsb2FkLmV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdXNlcklkIG9mIE9iamVjdC5rZXlzKGRtTWFwKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZHMgPSBkbU1hcFt1c2VySWRdO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgcm9vbUlkIG9mIHJvb21JZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7cm9vbUlkfSB3YXMgZm91bmQgaW4gRE1zIGJ1dCB0aGUgcm9vbSBpcyBub3QgaW4gdGhlIHN0b3JlYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGV4cGVjdCB0aGlzIFJvb21VcGRhdGVDYXVzZSB0byBuby1vcCBpZiB0aGVyZSdzIG5vIGNoYW5nZSwgYW5kIHdlIGRvbid0IGV4cGVjdFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdXNlciB0byBoYXZlIGh1bmRyZWRzIG9mIHJvb21zIHRvIHVwZGF0ZSBpbiBvbmUgZXZlbnQuIEFzIHN1Y2gsIHdlIGp1c3QgaGFtbWVyXG4gICAgICAgICAgICAgICAgICAgIC8vIGF3YXkgYXQgdXBkYXRlcyB1bnRpbCB0aGUgcHJvYmxlbSBpcyBzb2x2ZWQuIElmIHdlIHdlcmUgZXhwZWN0aW5nIG1vcmUgdGhhbiBhIGNvdXBsZVxuICAgICAgICAgICAgICAgICAgICAvLyBvZiByb29tcyB0byBiZSB1cGRhdGVkIGF0IG9uY2UsIHdlIHdvdWxkIGNvbnNpZGVyIGJhdGNoaW5nIHRoZSByb29tcyB1cC5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHJvb20sIFJvb21VcGRhdGVDYXVzZS5Qb3NzaWJsZVRhZ0NoYW5nZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdNYXRyaXhBY3Rpb25zLlJvb20ubXlNZW1iZXJzaGlwJykge1xuICAgICAgICAgICAgY29uc3QgbWVtYmVyc2hpcFBheWxvYWQgPSAoPGFueT5wYXlsb2FkKTsgLy8gVE9ETzogVHlwZSBvdXQgdGhlIGRpc3BhdGNoZXIgdHlwZXNcbiAgICAgICAgICAgIGNvbnN0IG9sZE1lbWJlcnNoaXAgPSBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwKG1lbWJlcnNoaXBQYXlsb2FkLm9sZE1lbWJlcnNoaXApO1xuICAgICAgICAgICAgY29uc3QgbmV3TWVtYmVyc2hpcCA9IGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAobWVtYmVyc2hpcFBheWxvYWQubWVtYmVyc2hpcCk7XG4gICAgICAgICAgICBpZiAob2xkTWVtYmVyc2hpcCAhPT0gRWZmZWN0aXZlTWVtYmVyc2hpcC5Kb2luICYmIG5ld01lbWJlcnNoaXAgPT09IEVmZmVjdGl2ZU1lbWJlcnNoaXAuSm9pbikge1xuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIEhhbmRsaW5nIG5ldyByb29tICR7bWVtYmVyc2hpcFBheWxvYWQucm9vbS5yb29tSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgam9pbmluZyBhbiB1cGdyYWRlZCByb29tLCB3ZSdsbCB3YW50IHRvIG1ha2Ugc3VyZSB3ZSBkb24ndCBwcm9saWZlcmF0ZVxuICAgICAgICAgICAgICAgIC8vIHRoZSBkZWFkIHJvb20gaW4gdGhlIGxpc3QuXG4gICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlRXZlbnQgPSBtZW1iZXJzaGlwUGF5bG9hZC5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5jcmVhdGVcIiwgXCJcIik7XG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0ZUV2ZW50ICYmIGNyZWF0ZUV2ZW50LmdldENvbnRlbnQoKVsncHJlZGVjZXNzb3InXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIFJvb20gaGFzIGEgcHJlZGVjZXNzb3JgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2Um9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20oY3JlYXRlRXZlbnQuZ2V0Q29udGVudCgpWydwcmVkZWNlc3NvciddWydyb29tX2lkJ10pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzU3RpY2t5ID0gdGhpcy5hbGdvcml0aG0uc3RpY2t5Um9vbSA9PT0gcHJldlJvb207XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdGlja3kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBDbGVhcmluZyBzdGlja3kgcm9vbSBkdWUgdG8gcm9vbSB1cGdyYWRlYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldFN0aWNreVJvb20obnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHdlIGhpdCB0aGUgYWxnb3JpdGhtIGluc3RlYWQgb2Ygb3VyIGhhbmRsZVJvb21VcGRhdGUoKSBmdW5jdGlvbiB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXZvaWQgcmVkdW5kYW50IHVwZGF0ZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gUmVtb3ZpbmcgcHJldmlvdXMgcm9vbSBmcm9tIHJvb20gbGlzdGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hbGdvcml0aG0uaGFuZGxlUm9vbVVwZGF0ZShwcmV2Um9vbSwgUm9vbVVwZGF0ZUNhdXNlLlJvb21SZW1vdmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIEFkZGluZyBuZXcgcm9vbSB0byByb29tIGxpc3RgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKG1lbWJlcnNoaXBQYXlsb2FkLnJvb20sIFJvb21VcGRhdGVDYXVzZS5OZXdSb29tKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvbGRNZW1iZXJzaGlwICE9PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkludml0ZSAmJiBuZXdNZW1iZXJzaGlwID09PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkludml0ZSkge1xuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIEhhbmRsaW5nIGludml0ZSB0byAke21lbWJlcnNoaXBQYXlsb2FkLnJvb20ucm9vbUlkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUobWVtYmVyc2hpcFBheWxvYWQucm9vbSwgUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20pO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgaXQncyBub3QgYSBqb2luLCBpdCdzIHRyYW5zaXRpb25pbmcgaW50byBhIGRpZmZlcmVudCBsaXN0IChwb3NzaWJseSBoaXN0b3JpY2FsKVxuICAgICAgICAgICAgaWYgKG9sZE1lbWJlcnNoaXAgIT09IG5ld01lbWJlcnNoaXApIHtcbiAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBIYW5kbGluZyBtZW1iZXJzaGlwIGNoYW5nZSBpbiAke21lbWJlcnNoaXBQYXlsb2FkLnJvb20ucm9vbUlkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUobWVtYmVyc2hpcFBheWxvYWQucm9vbSwgUm9vbVVwZGF0ZUNhdXNlLlBvc3NpYmxlVGFnQ2hhbmdlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVJvb21VcGRhdGUocm9vbTogUm9vbSwgY2F1c2U6IFJvb21VcGRhdGVDYXVzZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICghVmlzaWJpbGl0eVByb3ZpZGVyLmluc3RhbmNlLmlzUm9vbVZpc2libGUocm9vbSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gZG9uJ3QgZG8gYW55dGhpbmcgb24gcm9vbXMgdGhhdCBhcmVuJ3QgdmlzaWJsZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hvdWxkVXBkYXRlID0gYXdhaXQgdGhpcy5hbGdvcml0aG0uaGFuZGxlUm9vbVVwZGF0ZShyb29tLCBjYXVzZSk7XG4gICAgICAgIGlmIChzaG91bGRVcGRhdGUpIHtcbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtERUJVR10gUm9vbSBcIiR7cm9vbS5uYW1lfVwiICgke3Jvb20ucm9vbUlkfSkgdHJpZ2dlcmVkIGJ5ICR7Y2F1c2V9IHJlcXVpcmVzIGxpc3QgdXBkYXRlYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLm1hcmsoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzZXRUYWdTb3J0aW5nKHRhZ0lkOiBUYWdJRCwgc29ydDogU29ydEFsZ29yaXRobSkge1xuICAgICAgICBhd2FpdCB0aGlzLnNldEFuZFBlcnNpc3RUYWdTb3J0aW5nKHRhZ0lkLCBzb3J0KTtcbiAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzZXRBbmRQZXJzaXN0VGFnU29ydGluZyh0YWdJZDogVGFnSUQsIHNvcnQ6IFNvcnRBbGdvcml0aG0pIHtcbiAgICAgICAgYXdhaXQgdGhpcy5hbGdvcml0aG0uc2V0VGFnU29ydGluZyh0YWdJZCwgc29ydCk7XG4gICAgICAgIC8vIFRPRE86IFBlci1hY2NvdW50PyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDExNFxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgbXhfdGFnU29ydF8ke3RhZ0lkfWAsIHNvcnQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRUYWdTb3J0aW5nKHRhZ0lkOiBUYWdJRCk6IFNvcnRBbGdvcml0aG0ge1xuICAgICAgICByZXR1cm4gdGhpcy5hbGdvcml0aG0uZ2V0VGFnU29ydGluZyh0YWdJZCk7XG4gICAgfVxuXG4gICAgLy8gbm9pbnNwZWN0aW9uIEpTTWV0aG9kQ2FuQmVTdGF0aWNcbiAgICBwcml2YXRlIGdldFN0b3JlZFRhZ1NvcnRpbmcodGFnSWQ6IFRhZ0lEKTogU29ydEFsZ29yaXRobSB7XG4gICAgICAgIC8vIFRPRE86IFBlci1hY2NvdW50PyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDExNFxuICAgICAgICByZXR1cm4gPFNvcnRBbGdvcml0aG0+bG9jYWxTdG9yYWdlLmdldEl0ZW0oYG14X3RhZ1NvcnRfJHt0YWdJZH1gKTtcbiAgICB9XG5cbiAgICAvLyBsb2dpYyBtdXN0IG1hdGNoIGNhbGN1bGF0ZUxpc3RPcmRlclxuICAgIHByaXZhdGUgY2FsY3VsYXRlVGFnU29ydGluZyh0YWdJZDogVGFnSUQpOiBTb3J0QWxnb3JpdGhtIHtcbiAgICAgICAgY29uc3QgaXNEZWZhdWx0UmVjZW50ID0gdGFnSWQgPT09IERlZmF1bHRUYWdJRC5JbnZpdGUgfHwgdGFnSWQgPT09IERlZmF1bHRUYWdJRC5ETTtcbiAgICAgICAgY29uc3QgZGVmYXVsdFNvcnQgPSBpc0RlZmF1bHRSZWNlbnQgPyBTb3J0QWxnb3JpdGhtLlJlY2VudCA6IFNvcnRBbGdvcml0aG0uQWxwaGFiZXRpYztcbiAgICAgICAgY29uc3Qgc2V0dGluZ0FscGhhYmV0aWNhbCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJSb29tTGlzdC5vcmRlckFscGhhYmV0aWNhbGx5XCIsIG51bGwsIHRydWUpO1xuICAgICAgICBjb25zdCBkZWZpbmVkU29ydCA9IHRoaXMuZ2V0VGFnU29ydGluZyh0YWdJZCk7XG4gICAgICAgIGNvbnN0IHN0b3JlZFNvcnQgPSB0aGlzLmdldFN0b3JlZFRhZ1NvcnRpbmcodGFnSWQpO1xuXG4gICAgICAgIC8vIFdlIHVzZSB0aGUgZm9sbG93aW5nIG9yZGVyIHRvIGRldGVybWluZSB3aGljaCBvZiB0aGUgNCBmbGFncyB0byB1c2U6XG4gICAgICAgIC8vIFN0b3JlZCA+IFNldHRpbmdzID4gRGVmaW5lZCA+IERlZmF1bHRcblxuICAgICAgICBsZXQgdGFnU29ydCA9IGRlZmF1bHRTb3J0O1xuICAgICAgICBpZiAoc3RvcmVkU29ydCkge1xuICAgICAgICAgICAgdGFnU29ydCA9IHN0b3JlZFNvcnQ7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHNldHRpbmdBbHBoYWJldGljYWwpKSB7XG4gICAgICAgICAgICB0YWdTb3J0ID0gc2V0dGluZ0FscGhhYmV0aWNhbCA/IFNvcnRBbGdvcml0aG0uQWxwaGFiZXRpYyA6IFNvcnRBbGdvcml0aG0uUmVjZW50O1xuICAgICAgICB9IGVsc2UgaWYgKGRlZmluZWRTb3J0KSB7XG4gICAgICAgICAgICB0YWdTb3J0ID0gZGVmaW5lZFNvcnQ7XG4gICAgICAgIH0gLy8gZWxzZSBkZWZhdWx0IChhbHJlYWR5IHNldClcblxuICAgICAgICByZXR1cm4gdGFnU29ydDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2V0TGlzdE9yZGVyKHRhZ0lkOiBUYWdJRCwgb3JkZXI6IExpc3RBbGdvcml0aG0pIHtcbiAgICAgICAgYXdhaXQgdGhpcy5zZXRBbmRQZXJzaXN0TGlzdE9yZGVyKHRhZ0lkLCBvcmRlcik7XG4gICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc2V0QW5kUGVyc2lzdExpc3RPcmRlcih0YWdJZDogVGFnSUQsIG9yZGVyOiBMaXN0QWxnb3JpdGhtKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldExpc3RPcmRlcmluZyh0YWdJZCwgb3JkZXIpO1xuICAgICAgICAvLyBUT0RPOiBQZXItYWNjb3VudD8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQxMTRcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oYG14X2xpc3RPcmRlcl8ke3RhZ0lkfWAsIG9yZGVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGlzdE9yZGVyKHRhZ0lkOiBUYWdJRCk6IExpc3RBbGdvcml0aG0ge1xuICAgICAgICByZXR1cm4gdGhpcy5hbGdvcml0aG0uZ2V0TGlzdE9yZGVyaW5nKHRhZ0lkKTtcbiAgICB9XG5cbiAgICAvLyBub2luc3BlY3Rpb24gSlNNZXRob2RDYW5CZVN0YXRpY1xuICAgIHByaXZhdGUgZ2V0U3RvcmVkTGlzdE9yZGVyKHRhZ0lkOiBUYWdJRCk6IExpc3RBbGdvcml0aG0ge1xuICAgICAgICAvLyBUT0RPOiBQZXItYWNjb3VudD8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQxMTRcbiAgICAgICAgcmV0dXJuIDxMaXN0QWxnb3JpdGhtPmxvY2FsU3RvcmFnZS5nZXRJdGVtKGBteF9saXN0T3JkZXJfJHt0YWdJZH1gKTtcbiAgICB9XG5cbiAgICAvLyBsb2dpYyBtdXN0IG1hdGNoIGNhbGN1bGF0ZVRhZ1NvcnRpbmdcbiAgICBwcml2YXRlIGNhbGN1bGF0ZUxpc3RPcmRlcih0YWdJZDogVGFnSUQpOiBMaXN0QWxnb3JpdGhtIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdE9yZGVyID0gTGlzdEFsZ29yaXRobS5OYXR1cmFsO1xuICAgICAgICBjb25zdCBzZXR0aW5nSW1wb3J0YW5jZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJSb29tTGlzdC5vcmRlckJ5SW1wb3J0YW5jZVwiLCBudWxsLCB0cnVlKTtcbiAgICAgICAgY29uc3QgZGVmaW5lZE9yZGVyID0gdGhpcy5nZXRMaXN0T3JkZXIodGFnSWQpO1xuICAgICAgICBjb25zdCBzdG9yZWRPcmRlciA9IHRoaXMuZ2V0U3RvcmVkTGlzdE9yZGVyKHRhZ0lkKTtcblxuICAgICAgICAvLyBXZSB1c2UgdGhlIGZvbGxvd2luZyBvcmRlciB0byBkZXRlcm1pbmUgd2hpY2ggb2YgdGhlIDQgZmxhZ3MgdG8gdXNlOlxuICAgICAgICAvLyBTdG9yZWQgPiBTZXR0aW5ncyA+IERlZmluZWQgPiBEZWZhdWx0XG5cbiAgICAgICAgbGV0IGxpc3RPcmRlciA9IGRlZmF1bHRPcmRlcjtcbiAgICAgICAgaWYgKHN0b3JlZE9yZGVyKSB7XG4gICAgICAgICAgICBsaXN0T3JkZXIgPSBzdG9yZWRPcmRlcjtcbiAgICAgICAgfSBlbHNlIGlmICghaXNOdWxsT3JVbmRlZmluZWQoc2V0dGluZ0ltcG9ydGFuY2UpKSB7XG4gICAgICAgICAgICBsaXN0T3JkZXIgPSBzZXR0aW5nSW1wb3J0YW5jZSA/IExpc3RBbGdvcml0aG0uSW1wb3J0YW5jZSA6IExpc3RBbGdvcml0aG0uTmF0dXJhbDtcbiAgICAgICAgfSBlbHNlIGlmIChkZWZpbmVkT3JkZXIpIHtcbiAgICAgICAgICAgIGxpc3RPcmRlciA9IGRlZmluZWRPcmRlcjtcbiAgICAgICAgfSAvLyBlbHNlIGRlZmF1bHQgKGFscmVhZHkgc2V0KVxuXG4gICAgICAgIHJldHVybiBsaXN0T3JkZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB1cGRhdGVBbGdvcml0aG1JbnN0YW5jZXMoKSB7XG4gICAgICAgIC8vIFdlJ2xsIHJlcXVpcmUgYW4gdXBkYXRlLCBzbyBtYXJrIGZvciBvbmUuIE1hcmtpbmcgbm93IGFsc28gcHJldmVudHMgdGhlIGNhbGxzXG4gICAgICAgIC8vIHRvIHNldFRhZ1NvcnRpbmcgYW5kIHNldExpc3RPcmRlciBmcm9tIGNhdXNpbmcgdHJpZ2dlcnMuXG4gICAgICAgIHRoaXMudXBkYXRlRm4ubWFyaygpO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFnIG9mIE9iamVjdC5rZXlzKHRoaXMub3JkZXJlZExpc3RzKSkge1xuICAgICAgICAgICAgY29uc3QgZGVmaW5lZFNvcnQgPSB0aGlzLmdldFRhZ1NvcnRpbmcodGFnKTtcbiAgICAgICAgICAgIGNvbnN0IGRlZmluZWRPcmRlciA9IHRoaXMuZ2V0TGlzdE9yZGVyKHRhZyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRhZ1NvcnQgPSB0aGlzLmNhbGN1bGF0ZVRhZ1NvcnRpbmcodGFnKTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RPcmRlciA9IHRoaXMuY2FsY3VsYXRlTGlzdE9yZGVyKHRhZyk7XG5cbiAgICAgICAgICAgIGlmICh0YWdTb3J0ICE9PSBkZWZpbmVkU29ydCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2V0QW5kUGVyc2lzdFRhZ1NvcnRpbmcodGFnLCB0YWdTb3J0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0T3JkZXIgIT09IGRlZmluZWRPcmRlcikge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2V0QW5kUGVyc2lzdExpc3RPcmRlcih0YWcsIGxpc3RPcmRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWxnb3JpdGhtTGlzdFVwZGF0ZWQgPSAoKSA9PiB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5kZXJseWluZyBhbGdvcml0aG0gaGFzIHRyaWdnZXJlZCBhIGxpc3QgdXBkYXRlIC0gbWFya2luZ1wiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUZuLm1hcmsoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFsZ29yaXRobUZpbHRlclVwZGF0ZWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBmaWx0ZXIgY2FuIGhhcHBlbiBvZmYtY3ljbGUsIHNvIHRyaWdnZXIgYW4gdXBkYXRlLiBUaGUgZmlsdGVyIHdpbGwgaGF2ZVxuICAgICAgICAvLyBhbHJlYWR5IGNhdXNlZCBhIG1hcmsuXG4gICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZWdlbmVyYXRlcyB0aGUgcm9vbSB3aG9sZSByb29tIGxpc3QsIGRpc2NhcmRpbmcgYW55IHByZXZpb3VzIHJlc3VsdHMuXG4gICAgICpcbiAgICAgKiBOb3RlOiBUaGlzIGlzIG9ubHkgZXhwb3NlZCBleHRlcm5hbGx5IGZvciB0aGUgdGVzdHMuIERvIG5vdCBjYWxsIHRoaXMgZnJvbSB3aXRoaW5cbiAgICAgKiB0aGUgYXBwLlxuICAgICAqIEBwYXJhbSB0cmlnZ2VyIFNldCB0byBmYWxzZSB0byBwcmV2ZW50IGEgbGlzdCB1cGRhdGUgZnJvbSBiZWluZyBzZW50LiBTaG91bGQgb25seVxuICAgICAqIGJlIHVzZWQgaWYgdGhlIGNhbGxpbmcgY29kZSB3aWxsIG1hbnVhbGx5IHRyaWdnZXIgdGhlIHVwZGF0ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgcmVnZW5lcmF0ZUFsbExpc3RzKHt0cmlnZ2VyID0gdHJ1ZX0pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiUmVnZW5lcmF0aW5nIGFsbCByb29tIGxpc3RzXCIpO1xuXG4gICAgICAgIGNvbnN0IHJvb21zID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VmlzaWJsZVJvb21zKClcbiAgICAgICAgICAgIC5maWx0ZXIociA9PiBWaXNpYmlsaXR5UHJvdmlkZXIuaW5zdGFuY2UuaXNSb29tVmlzaWJsZShyKSk7XG4gICAgICAgIGNvbnN0IGN1c3RvbVRhZ3MgPSBuZXcgU2V0PFRhZ0lEPigpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS50YWdzRW5hYmxlZCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHJvb21zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyb29tLnRhZ3MpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhZ3MgPSBPYmplY3Qua2V5cyhyb29tLnRhZ3MpLmZpbHRlcih0ID0+IGlzQ3VzdG9tVGFnKHQpKTtcbiAgICAgICAgICAgICAgICB0YWdzLmZvckVhY2godCA9PiBjdXN0b21UYWdzLmFkZCh0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzb3J0czogSVRhZ1NvcnRpbmdNYXAgPSB7fTtcbiAgICAgICAgY29uc3Qgb3JkZXJzOiBJTGlzdE9yZGVyaW5nTWFwID0ge307XG4gICAgICAgIGNvbnN0IGFsbFRhZ3MgPSBbLi4uT3JkZXJlZERlZmF1bHRUYWdJRHMsIC4uLkFycmF5LmZyb20oY3VzdG9tVGFncyldO1xuICAgICAgICBmb3IgKGNvbnN0IHRhZ0lkIG9mIGFsbFRhZ3MpIHtcbiAgICAgICAgICAgIHNvcnRzW3RhZ0lkXSA9IHRoaXMuY2FsY3VsYXRlVGFnU29ydGluZyh0YWdJZCk7XG4gICAgICAgICAgICBvcmRlcnNbdGFnSWRdID0gdGhpcy5jYWxjdWxhdGVMaXN0T3JkZXIodGFnSWQpO1xuXG4gICAgICAgICAgICBSb29tTGlzdExheW91dFN0b3JlLmluc3RhbmNlLmVuc3VyZUxheW91dEV4aXN0cyh0YWdJZCk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB0aGlzLmFsZ29yaXRobS5wb3B1bGF0ZVRhZ3Moc29ydHMsIG9yZGVycyk7XG4gICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldEtub3duUm9vbXMocm9vbXMpO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbExpc3RzR2VuZXJhdGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHJpZ2dlcikgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEZpbHRlcihmaWx0ZXI6IElGaWx0ZXJDb25kaXRpb24pOiB2b2lkIHtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBZGRpbmcgZmlsdGVyIGNvbmRpdGlvbjpcIiwgZmlsdGVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbHRlckNvbmRpdGlvbnMucHVzaChmaWx0ZXIpO1xuICAgICAgICBpZiAodGhpcy5hbGdvcml0aG0pIHtcbiAgICAgICAgICAgIHRoaXMuYWxnb3JpdGhtLmFkZEZpbHRlckNvbmRpdGlvbihmaWx0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVGaWx0ZXIoZmlsdGVyOiBJRmlsdGVyQ29uZGl0aW9uKTogdm9pZCB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVtb3ZpbmcgZmlsdGVyIGNvbmRpdGlvbjpcIiwgZmlsdGVyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpZHggPSB0aGlzLmZpbHRlckNvbmRpdGlvbnMuaW5kZXhPZihmaWx0ZXIpO1xuICAgICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyQ29uZGl0aW9ucy5zcGxpY2UoaWR4LCAxKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuYWxnb3JpdGhtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbGdvcml0aG0ucmVtb3ZlRmlsdGVyQ29uZGl0aW9uKGZpbHRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZmlyc3QgKGFuZCBpZGVhbGx5IG9ubHkpIG5hbWUgZmlsdGVyIGNvbmRpdGlvbi4gSWYgb25lIGlzbid0IHByZXNlbnQsXG4gICAgICogdGhpcyByZXR1cm5zIG51bGwuXG4gICAgICogQHJldHVybnMgVGhlIGZpcnN0IG5hbWUgZmlsdGVyIGNvbmRpdGlvbiwgb3IgbnVsbCBpZiBub25lLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24oKTogTmFtZUZpbHRlckNvbmRpdGlvbiB8IG51bGwge1xuICAgICAgICBmb3IgKGNvbnN0IGZpbHRlciBvZiB0aGlzLmZpbHRlckNvbmRpdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgaW5zdGFuY2VvZiBOYW1lRmlsdGVyQ29uZGl0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB0YWdzIGZvciBhIHJvb20gaWRlbnRpZmllZCBieSB0aGUgc3RvcmUuIFRoZSByZXR1cm5lZCBzZXRcbiAgICAgKiBzaG91bGQgbmV2ZXIgYmUgZW1wdHksIGFuZCB3aWxsIGNvbnRhaW4gRGVmYXVsdFRhZ0lELlVudGFnZ2VkIGlmXG4gICAgICogdGhlIHN0b3JlIGlzIG5vdCBhd2FyZSBvZiBhbnkgdGFncy5cbiAgICAgKiBAcGFyYW0gcm9vbSBUaGUgcm9vbSB0byBnZXQgdGhlIHRhZ3MgZm9yLlxuICAgICAqIEByZXR1cm5zIFRoZSB0YWdzIGZvciB0aGUgcm9vbS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VGFnc0ZvclJvb20ocm9vbTogUm9vbSk6IFRhZ0lEW10ge1xuICAgICAgICBjb25zdCBhbGdvcml0aG1UYWdzID0gdGhpcy5hbGdvcml0aG0uZ2V0VGFnc0ZvclJvb20ocm9vbSk7XG4gICAgICAgIGlmICghYWxnb3JpdGhtVGFncykgcmV0dXJuIFtEZWZhdWx0VGFnSUQuVW50YWdnZWRdO1xuICAgICAgICByZXR1cm4gYWxnb3JpdGhtVGFncztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21MaXN0U3RvcmUge1xuICAgIHByaXZhdGUgc3RhdGljIGludGVybmFsSW5zdGFuY2U6IFJvb21MaXN0U3RvcmVDbGFzcztcblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGluc3RhbmNlKCk6IFJvb21MaXN0U3RvcmVDbGFzcyB7XG4gICAgICAgIGlmICghUm9vbUxpc3RTdG9yZS5pbnRlcm5hbEluc3RhbmNlKSB7XG4gICAgICAgICAgICBSb29tTGlzdFN0b3JlLmludGVybmFsSW5zdGFuY2UgPSBuZXcgUm9vbUxpc3RTdG9yZUNsYXNzKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUm9vbUxpc3RTdG9yZS5pbnRlcm5hbEluc3RhbmNlO1xuICAgIH1cbn1cblxud2luZG93Lm14Um9vbUxpc3RTdG9yZSA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2U7XG4iXX0=
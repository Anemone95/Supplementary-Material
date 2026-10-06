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

var _SpaceWatcher = require("./SpaceWatcher");

/*
Copyright 2018-2021 The Matrix.org Foundation C.I.C.

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
    (0, _defineProperty2.default)(this, "prefilterConditions", []);
    (0, _defineProperty2.default)(this, "tagWatcher", void 0);
    (0, _defineProperty2.default)(this, "spaceWatcher", void 0);
    (0, _defineProperty2.default)(this, "updateFn", new _MarkedExecution.MarkedExecution(() => {
      for (const tagId of Object.keys(this.orderedLists)) {
        _RoomNotificationStateStore.RoomNotificationStateStore.instance.getListState(tagId).setRooms(this.orderedLists[tagId]);
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
    (0, _defineProperty2.default)(this, "onPrefilterUpdated", async () => {
      await this.recalculatePrefiltering();
      this.updateFn.trigger();
    });
    this.checkLoggingEnabled();

    for (const settingName of this.watchedSettings) _SettingsStore.default.monitorSetting(settingName, null);

    _RoomViewStore.default.addListener(() => this.handleRVSUpdate({}));

    this.algorithm.on(_Algorithm.LIST_UPDATED_EVENT, this.onAlgorithmListUpdated);
    this.algorithm.on(_IFilterCondition.FILTER_CHANGED, this.onAlgorithmFilterUpdated);
    this.setupWatchers();
  }

  setupWatchers() {
    if (_SettingsStore.default.getValue("feature_spaces")) {
      this.spaceWatcher = new _SpaceWatcher.SpaceWatcher(this);
    } else {
      this.tagWatcher = new _TagWatcher.TagWatcher(this);
    }
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
    this.filterConditions = [];
    this.prefilterConditions = [];
    this.initialListsGenerated = false;
    this.setupWatchers();
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

      if (!roomId) {
        return;
      }

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
    if (cause === _models.RoomUpdateCause.NewRoom && room.getMyMembership() === "invite") {
      // Let the visibility provider know that there is a new invited room. It would be nice
      // if this could just be an event that things listen for but the point of this is that
      // we delay doing anything about this room until the VoipUserMapper had had a chance
      // to do the things it needs to do to decide if we should show this room or not, so
      // an even wouldn't et us do that.
      await _VisibilityProvider.VisibilityProvider.instance.onNewInvitedRoom(room);
    }

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

  async recalculatePrefiltering() {
    if (!this.algorithm) return;
    if (!this.algorithm.hasTagSortingMap) return; // we're still loading

    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log("Calculating new prefiltered room list");
    } // Inhibit updates because we're about to lie heavily to the algorithm


    this.algorithm.updatesInhibited = true; // Figure out which rooms are about to be valid, and the state of affairs

    const rooms = this.getPlausibleRooms();
    const currentSticky = this.algorithm.stickyRoom;
    const stickyIsStillPresent = currentSticky && rooms.includes(currentSticky); // Reset the sticky room before resetting the known rooms so the algorithm
    // doesn't freak out.

    await this.algorithm.setStickyRoom(null);
    await this.algorithm.setKnownRooms(rooms); // Set the sticky room back, if needed, now that we have updated the store.
    // This will use relative stickyness to the new room set.

    if (stickyIsStillPresent) {
      await this.algorithm.setStickyRoom(currentSticky);
    } // Finally, mark an update and resume updates from the algorithm


    this.updateFn.mark();
    this.algorithm.updatesInhibited = false;
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

  getPlausibleRooms()
  /*: Room[]*/
  {
    if (!this.matrixClient) return [];
    let rooms = this.matrixClient.getVisibleRooms().filter(r => _VisibilityProvider.VisibilityProvider.instance.isRoomVisible(r)); // if spaces are enabled only consider the prefilter conditions when there are no runtime conditions
    // for the search all spaces feature

    if (this.prefilterConditions.length > 0 && (!_SettingsStore.default.getValue("feature_spaces") || !this.filterConditions.length)) {
      rooms = rooms.filter(r => {
        for (const filter of this.prefilterConditions) {
          if (!filter.isVisible(r)) {
            return false;
          }
        }

        return true;
      });
    }

    return rooms;
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
    const rooms = this.getPlausibleRooms();
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
  /**
   * Adds a filter condition to the room list store. Filters may be applied async,
   * and thus might not cause an update to the store immediately.
   * @param {IFilterCondition} filter The filter condition to add.
   */


  addFilter(filter
  /*: IFilterCondition*/
  )
  /*: void*/
  {
    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log("Adding filter condition:", filter);
    }

    let promise = Promise.resolve();

    if (filter.kind === _IFilterCondition.FilterKind.Prefilter) {
      filter.on(_IFilterCondition.FILTER_CHANGED, this.onPrefilterUpdated);
      this.prefilterConditions.push(filter);
      promise = this.recalculatePrefiltering();
    } else {
      this.filterConditions.push(filter);

      if (this.algorithm) {
        this.algorithm.addFilterCondition(filter);
      } // Runtime filters with spaces disable prefiltering for the search all spaces effect


      if (_SettingsStore.default.getValue("feature_spaces")) {
        promise = this.recalculatePrefiltering();
      }
    }

    promise.then(() => this.updateFn.trigger());
  }
  /**
   * Removes a filter condition from the room list store. If the filter was
   * not previously added to the room list store, this will no-op. The effects
   * of removing a filter may be applied async and therefore might not cause
   * an update right away.
   * @param {IFilterCondition} filter The filter condition to remove.
   */


  removeFilter(filter
  /*: IFilterCondition*/
  )
  /*: void*/
  {
    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log("Removing filter condition:", filter);
    }

    let promise = Promise.resolve();
    let idx = this.filterConditions.indexOf(filter);

    if (idx >= 0) {
      this.filterConditions.splice(idx, 1);

      if (this.algorithm) {
        this.algorithm.removeFilterCondition(filter); // Runtime filters with spaces disable prefiltering for the search all spaces effect

        if (_SettingsStore.default.getValue("feature_spaces")) {
          promise = this.recalculatePrefiltering();
        }
      }
    }

    idx = this.prefilterConditions.indexOf(filter);

    if (idx >= 0) {
      filter.off(_IFilterCondition.FILTER_CHANGED, this.onPrefilterUpdated);
      this.prefilterConditions.splice(idx, 1);
      promise = this.recalculatePrefiltering();
    }

    promise.then(() => this.updateFn.trigger());
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
  /**
   * Manually update a room with a given cause. This should only be used if the
   * room list store would otherwise be incapable of doing the update itself. Note
   * that this may race with the room list's regular operation.
   * @param {Room} room The room to update.
   * @param {RoomUpdateCause} cause The cause to update for.
   */


  async manualRoomUpdate(room
  /*: Room*/
  , cause
  /*: RoomUpdateCause*/
  ) {
    await this.handleRoomUpdate(room, cause);
    this.updateFn.trigger();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0U3RvcmUudHMiXSwibmFtZXMiOlsiTElTVFNfVVBEQVRFX0VWRU5UIiwiUm9vbUxpc3RTdG9yZUNsYXNzIiwiQXN5bmNTdG9yZVdpdGhDbGllbnQiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHREaXNwYXRjaGVyIiwiQWxnb3JpdGhtIiwiTWFya2VkRXhlY3V0aW9uIiwidGFnSWQiLCJPYmplY3QiLCJrZXlzIiwib3JkZXJlZExpc3RzIiwiUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUiLCJpbnN0YW5jZSIsImdldExpc3RTdGF0ZSIsInNldFJvb21zIiwiZW1pdCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImNvbnNvbGUiLCJsb2ciLCJ1cGRhdGVGbiIsIm1hcmsiLCJ0cmlnZ2VyIiwicmVjYWxjdWxhdGVQcmVmaWx0ZXJpbmciLCJjaGVja0xvZ2dpbmdFbmFibGVkIiwic2V0dGluZ05hbWUiLCJ3YXRjaGVkU2V0dGluZ3MiLCJtb25pdG9yU2V0dGluZyIsIlJvb21WaWV3U3RvcmUiLCJhZGRMaXN0ZW5lciIsImhhbmRsZVJWU1VwZGF0ZSIsImFsZ29yaXRobSIsIm9uIiwiTElTVF9VUERBVEVEX0VWRU5UIiwib25BbGdvcml0aG1MaXN0VXBkYXRlZCIsIkZJTFRFUl9DSEFOR0VEIiwib25BbGdvcml0aG1GaWx0ZXJVcGRhdGVkIiwic2V0dXBXYXRjaGVycyIsInNwYWNlV2F0Y2hlciIsIlNwYWNlV2F0Y2hlciIsInRhZ1dhdGNoZXIiLCJUYWdXYXRjaGVyIiwidW5maWx0ZXJlZExpc3RzIiwiZ2V0VW5maWx0ZXJlZFJvb21zIiwiZ2V0T3JkZXJlZFJvb21zIiwicmVzZXRTdG9yZSIsInJlc2V0IiwiZmlsdGVyQ29uZGl0aW9ucyIsInByZWZpbHRlckNvbmRpdGlvbnMiLCJpbml0aWFsTGlzdHNHZW5lcmF0ZWQiLCJvZmYiLCJtYWtlUmVhZHkiLCJmb3JjZWRDbGllbnQiLCJyZWFkeVN0b3JlIiwidXNlVW5pdFRlc3RDbGllbnQiLCJyZWFkQW5kQ2FjaGVTZXR0aW5nc0Zyb21TdG9yZSIsInJlZ2VuZXJhdGVBbGxMaXN0cyIsIndhcm4iLCJ0YWdzRW5hYmxlZCIsInVwZGF0ZVN0YXRlIiwidXBkYXRlQWxnb3JpdGhtSW5zdGFuY2VzIiwibWF0cml4Q2xpZW50IiwiYWN0aXZlUm9vbUlkIiwiZ2V0Um9vbUlkIiwic3RpY2t5Um9vbSIsInNldFN0aWNreVJvb20iLCJhY3RpdmVSb29tIiwiZ2V0Um9vbSIsIm9uUmVhZHkiLCJvbk5vdFJlYWR5Iiwib25BY3Rpb24iLCJwYXlsb2FkIiwibG9naWNhbGx5UmVhZHkiLCJURVNUX01PREUiLCJvbkRpc3BhdGNoQXN5bmMiLCJzZXRJbW1lZGlhdGUiLCJhY3Rpb24iLCJpbmNsdWRlcyIsImVuYWJsZWQiLCJFcnJvciIsImV2ZW50Iiwicm9vbSIsInJvb21JZCIsImhhbmRsZVJvb21VcGRhdGUiLCJSb29tVXBkYXRlQ2F1c2UiLCJSZWFkUmVjZWlwdCIsInJvb21QYXlsb2FkIiwiUG9zc2libGVUYWdDaGFuZ2UiLCJldmVudFBheWxvYWQiLCJpc0xpdmVFdmVudCIsImlzTGl2ZVVuZmlsdGVyZWRSb29tVGltZWxpbmVFdmVudCIsInRyeVVwZGF0ZSIsInVwZGF0ZWRSb29tIiwiZ2V0SWQiLCJnZXRUeXBlIiwiZ2V0U3RhdGVLZXkiLCJuZXdSb29tIiwiZ2V0Q29udGVudCIsIlRpbWVsaW5lIiwic2V0VGltZW91dCIsImV2ZW50X3R5cGUiLCJkbU1hcCIsInVzZXJJZCIsInJvb21JZHMiLCJtZW1iZXJzaGlwUGF5bG9hZCIsIm9sZE1lbWJlcnNoaXAiLCJuZXdNZW1iZXJzaGlwIiwibWVtYmVyc2hpcCIsIkVmZmVjdGl2ZU1lbWJlcnNoaXAiLCJKb2luIiwiY3JlYXRlRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsInByZXZSb29tIiwiaXNTdGlja3kiLCJSb29tUmVtb3ZlZCIsIk5ld1Jvb20iLCJJbnZpdGUiLCJjYXVzZSIsImdldE15TWVtYmVyc2hpcCIsIlZpc2liaWxpdHlQcm92aWRlciIsIm9uTmV3SW52aXRlZFJvb20iLCJpc1Jvb21WaXNpYmxlIiwic2hvdWxkVXBkYXRlIiwibmFtZSIsImhhc1RhZ1NvcnRpbmdNYXAiLCJ1cGRhdGVzSW5oaWJpdGVkIiwicm9vbXMiLCJnZXRQbGF1c2libGVSb29tcyIsImN1cnJlbnRTdGlja3kiLCJzdGlja3lJc1N0aWxsUHJlc2VudCIsInNldEtub3duUm9vbXMiLCJzZXRUYWdTb3J0aW5nIiwic29ydCIsInNldEFuZFBlcnNpc3RUYWdTb3J0aW5nIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsImdldFRhZ1NvcnRpbmciLCJnZXRTdG9yZWRUYWdTb3J0aW5nIiwiZ2V0SXRlbSIsImNhbGN1bGF0ZVRhZ1NvcnRpbmciLCJpc0RlZmF1bHRSZWNlbnQiLCJEZWZhdWx0VGFnSUQiLCJETSIsImRlZmF1bHRTb3J0IiwiU29ydEFsZ29yaXRobSIsIlJlY2VudCIsIkFscGhhYmV0aWMiLCJzZXR0aW5nQWxwaGFiZXRpY2FsIiwiZGVmaW5lZFNvcnQiLCJzdG9yZWRTb3J0IiwidGFnU29ydCIsInNldExpc3RPcmRlciIsIm9yZGVyIiwic2V0QW5kUGVyc2lzdExpc3RPcmRlciIsInNldExpc3RPcmRlcmluZyIsImdldExpc3RPcmRlciIsImdldExpc3RPcmRlcmluZyIsImdldFN0b3JlZExpc3RPcmRlciIsImNhbGN1bGF0ZUxpc3RPcmRlciIsImRlZmF1bHRPcmRlciIsIkxpc3RBbGdvcml0aG0iLCJOYXR1cmFsIiwic2V0dGluZ0ltcG9ydGFuY2UiLCJkZWZpbmVkT3JkZXIiLCJzdG9yZWRPcmRlciIsImxpc3RPcmRlciIsIkltcG9ydGFuY2UiLCJ0YWciLCJnZXRWaXNpYmxlUm9vbXMiLCJmaWx0ZXIiLCJyIiwibGVuZ3RoIiwiaXNWaXNpYmxlIiwiY3VzdG9tVGFncyIsIlNldCIsInN0YXRlIiwidGFncyIsInQiLCJmb3JFYWNoIiwiYWRkIiwic29ydHMiLCJvcmRlcnMiLCJhbGxUYWdzIiwiT3JkZXJlZERlZmF1bHRUYWdJRHMiLCJBcnJheSIsImZyb20iLCJSb29tTGlzdExheW91dFN0b3JlIiwiZW5zdXJlTGF5b3V0RXhpc3RzIiwicG9wdWxhdGVUYWdzIiwiYWRkRmlsdGVyIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwia2luZCIsIkZpbHRlcktpbmQiLCJQcmVmaWx0ZXIiLCJvblByZWZpbHRlclVwZGF0ZWQiLCJwdXNoIiwiYWRkRmlsdGVyQ29uZGl0aW9uIiwidGhlbiIsInJlbW92ZUZpbHRlciIsImlkeCIsImluZGV4T2YiLCJzcGxpY2UiLCJyZW1vdmVGaWx0ZXJDb25kaXRpb24iLCJnZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24iLCJOYW1lRmlsdGVyQ29uZGl0aW9uIiwiZ2V0VGFnc0ZvclJvb20iLCJhbGdvcml0aG1UYWdzIiwiVW50YWdnZWQiLCJtYW51YWxSb29tVXBkYXRlIiwiUm9vbUxpc3RTdG9yZSIsImludGVybmFsSW5zdGFuY2UiLCJ3aW5kb3ciLCJteFJvb21MaXN0U3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXBDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBNEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsa0JBQWtCLEdBQUcsY0FBM0I7OztBQUVBLE1BQU1DLGtCQUFOLFNBQWlDQztBQUFqQztBQUE4RDtBQUNqRTtBQUNKO0FBQ0E7QUFDQTtBQXFCSUMsRUFBQUEsV0FBVyxHQUFHO0FBQ1YsVUFBTUMsbUJBQU47QUFEVSxpRUFsQmtCLEtBa0JsQjtBQUFBLHFEQWpCTSxJQUFJQyxvQkFBSixFQWlCTjtBQUFBLDREQWhCaUMsRUFn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LEtBQTVCLENBQU47QUFDQSxTQUFLbEcsUUFBTCxDQUFjRSxPQUFkO0FBQ0g7O0FBeHNCZ0U7Ozs4QkFBeERyQixrQixlQUtpQixLOztBQXNzQmYsTUFBTW1OLGFBQU4sQ0FBb0I7QUFHL0IsYUFBa0J4TSxRQUFsQjtBQUFBO0FBQWlEO0FBQzdDLFFBQUksQ0FBQ3dNLGFBQWEsQ0FBQ0MsZ0JBQW5CLEVBQXFDO0FBQ2pDRCxNQUFBQSxhQUFhLENBQUNDLGdCQUFkLEdBQWlDLElBQUlwTixrQkFBSixFQUFqQztBQUNIOztBQUVELFdBQU9tTixhQUFhLENBQUNDLGdCQUFyQjtBQUNIOztBQVQ4Qjs7OzhCQUFkRCxhO0FBWXJCRSxNQUFNLENBQUNDLGVBQVAsR0FBeUJILGFBQWEsQ0FBQ3hNLFFBQXZDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7RGVmYXVsdFRhZ0lELCBpc0N1c3RvbVRhZywgT3JkZXJlZERlZmF1bHRUYWdJRHMsIFJvb21VcGRhdGVDYXVzZSwgVGFnSUR9IGZyb20gXCIuL21vZGVsc1wiO1xuaW1wb3J0IHtSb29tfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7SUxpc3RPcmRlcmluZ01hcCwgSVRhZ01hcCwgSVRhZ1NvcnRpbmdNYXAsIExpc3RBbGdvcml0aG0sIFNvcnRBbGdvcml0aG19IGZyb20gXCIuL2FsZ29yaXRobXMvbW9kZWxzXCI7XG5pbXBvcnQge0FjdGlvblBheWxvYWR9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtyZWFkUmVjZWlwdENoYW5nZUlzRm9yfSBmcm9tIFwiLi4vLi4vdXRpbHMvcmVhZC1yZWNlaXB0c1wiO1xuaW1wb3J0IHtGSUxURVJfQ0hBTkdFRCwgRmlsdGVyS2luZCwgSUZpbHRlckNvbmRpdGlvbn0gZnJvbSBcIi4vZmlsdGVycy9JRmlsdGVyQ29uZGl0aW9uXCI7XG5pbXBvcnQge1RhZ1dhdGNoZXJ9IGZyb20gXCIuL1RhZ1dhdGNoZXJcIjtcbmltcG9ydCBSb29tVmlld1N0b3JlIGZyb20gXCIuLi9Sb29tVmlld1N0b3JlXCI7XG5pbXBvcnQge0FsZ29yaXRobSwgTElTVF9VUERBVEVEX0VWRU5UfSBmcm9tIFwiLi9hbGdvcml0aG1zL0FsZ29yaXRobVwiO1xuaW1wb3J0IHtFZmZlY3RpdmVNZW1iZXJzaGlwLCBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwfSBmcm9tIFwiLi4vLi4vdXRpbHMvbWVtYmVyc2hpcFwiO1xuaW1wb3J0IHtpc051bGxPclVuZGVmaW5lZH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5pbXBvcnQgUm9vbUxpc3RMYXlvdXRTdG9yZSBmcm9tIFwiLi9Sb29tTGlzdExheW91dFN0b3JlXCI7XG5pbXBvcnQge01hcmtlZEV4ZWN1dGlvbn0gZnJvbSBcIi4uLy4uL3V0aWxzL01hcmtlZEV4ZWN1dGlvblwiO1xuaW1wb3J0IHtBc3luY1N0b3JlV2l0aENsaWVudH0gZnJvbSBcIi4uL0FzeW5jU3RvcmVXaXRoQ2xpZW50XCI7XG5pbXBvcnQge05hbWVGaWx0ZXJDb25kaXRpb259IGZyb20gXCIuL2ZpbHRlcnMvTmFtZUZpbHRlckNvbmRpdGlvblwiO1xuaW1wb3J0IHtSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZX0gZnJvbSBcIi4uL25vdGlmaWNhdGlvbnMvUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmVcIjtcbmltcG9ydCB7VmlzaWJpbGl0eVByb3ZpZGVyfSBmcm9tIFwiLi9maWx0ZXJzL1Zpc2liaWxpdHlQcm92aWRlclwiO1xuaW1wb3J0IHtTcGFjZVdhdGNoZXJ9IGZyb20gXCIuL1NwYWNlV2F0Y2hlclwiO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICB0YWdzRW5hYmxlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVGhlIGV2ZW50L2NoYW5uZWwgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIHJvb20gbGlzdHMgaGF2ZSBiZWVuIGNoYW5nZWQuIFJhaXNlZFxuICogd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBpbnN0YW5jZSBvZiB0aGUgc3RvcmUuXG4gKi9cbmV4cG9ydCBjb25zdCBMSVNUU19VUERBVEVfRVZFTlQgPSBcImxpc3RzX3VwZGF0ZVwiO1xuXG5leHBvcnQgY2xhc3MgUm9vbUxpc3RTdG9yZUNsYXNzIGV4dGVuZHMgQXN5bmNTdG9yZVdpdGhDbGllbnQ8SVN0YXRlPiB7XG4gICAgLyoqXG4gICAgICogU2V0IHRvIHRydWUgaWYgeW91J3JlIHJ1bm5pbmcgdGVzdHMgb24gdGhlIHN0b3JlLiBTaG91bGQgbm90IGJlIHRvdWNoZWQgaW5cbiAgICAgKiBhbnkgb3RoZXIgZW52aXJvbm1lbnQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBURVNUX01PREUgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgaW5pdGlhbExpc3RzR2VuZXJhdGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBhbGdvcml0aG0gPSBuZXcgQWxnb3JpdGhtKCk7XG4gICAgcHJpdmF0ZSBmaWx0ZXJDb25kaXRpb25zOiBJRmlsdGVyQ29uZGl0aW9uW10gPSBbXTtcbiAgICBwcml2YXRlIHByZWZpbHRlckNvbmRpdGlvbnM6IElGaWx0ZXJDb25kaXRpb25bXSA9IFtdO1xuICAgIHByaXZhdGUgdGFnV2F0Y2hlcjogVGFnV2F0Y2hlcjtcbiAgICBwcml2YXRlIHNwYWNlV2F0Y2hlcjogU3BhY2VXYXRjaGVyO1xuICAgIHByaXZhdGUgdXBkYXRlRm4gPSBuZXcgTWFya2VkRXhlY3V0aW9uKCgpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCB0YWdJZCBvZiBPYmplY3Qua2V5cyh0aGlzLm9yZGVyZWRMaXN0cykpIHtcbiAgICAgICAgICAgIFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLmdldExpc3RTdGF0ZSh0YWdJZCkuc2V0Um9vbXModGhpcy5vcmRlcmVkTGlzdHNbdGFnSWRdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXQoTElTVFNfVVBEQVRFX0VWRU5UKTtcbiAgICB9KTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgd2F0Y2hlZFNldHRpbmdzID0gW1xuICAgICAgICAnZmVhdHVyZV9jdXN0b21fdGFncycsXG4gICAgICAgICdhZHZhbmNlZFJvb21MaXN0TG9nZ2luZycsIC8vIFRPRE86IFJlbW92ZSB3YXRjaDogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKGRlZmF1bHREaXNwYXRjaGVyKTtcblxuICAgICAgICB0aGlzLmNoZWNrTG9nZ2luZ0VuYWJsZWQoKTtcbiAgICAgICAgZm9yIChjb25zdCBzZXR0aW5nTmFtZSBvZiB0aGlzLndhdGNoZWRTZXR0aW5ncykgU2V0dGluZ3NTdG9yZS5tb25pdG9yU2V0dGluZyhzZXR0aW5nTmFtZSwgbnVsbCk7XG4gICAgICAgIFJvb21WaWV3U3RvcmUuYWRkTGlzdGVuZXIoKCkgPT4gdGhpcy5oYW5kbGVSVlNVcGRhdGUoe30pKTtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0ub24oTElTVF9VUERBVEVEX0VWRU5ULCB0aGlzLm9uQWxnb3JpdGhtTGlzdFVwZGF0ZWQpO1xuICAgICAgICB0aGlzLmFsZ29yaXRobS5vbihGSUxURVJfQ0hBTkdFRCwgdGhpcy5vbkFsZ29yaXRobUZpbHRlclVwZGF0ZWQpO1xuICAgICAgICB0aGlzLnNldHVwV2F0Y2hlcnMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldHVwV2F0Y2hlcnMoKSB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9zcGFjZXNcIikpIHtcbiAgICAgICAgICAgIHRoaXMuc3BhY2VXYXRjaGVyID0gbmV3IFNwYWNlV2F0Y2hlcih0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGFnV2F0Y2hlciA9IG5ldyBUYWdXYXRjaGVyKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB1bmZpbHRlcmVkTGlzdHMoKTogSVRhZ01hcCB7XG4gICAgICAgIGlmICghdGhpcy5hbGdvcml0aG0pIHJldHVybiB7fTsgLy8gTm8gdGFncyB5ZXQuXG4gICAgICAgIHJldHVybiB0aGlzLmFsZ29yaXRobS5nZXRVbmZpbHRlcmVkUm9vbXMoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IG9yZGVyZWRMaXN0cygpOiBJVGFnTWFwIHtcbiAgICAgICAgaWYgKCF0aGlzLmFsZ29yaXRobSkgcmV0dXJuIHt9OyAvLyBObyB0YWdzIHlldC5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWxnb3JpdGhtLmdldE9yZGVyZWRSb29tcygpO1xuICAgIH1cblxuICAgIC8vIEludGVuZGVkIGZvciB0ZXN0IHVzYWdlXG4gICAgcHVibGljIGFzeW5jIHJlc2V0U3RvcmUoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5maWx0ZXJDb25kaXRpb25zID0gW107XG4gICAgICAgIHRoaXMucHJlZmlsdGVyQ29uZGl0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLmluaXRpYWxMaXN0c0dlbmVyYXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldHVwV2F0Y2hlcnMoKTtcblxuICAgICAgICB0aGlzLmFsZ29yaXRobS5vZmYoTElTVF9VUERBVEVEX0VWRU5ULCB0aGlzLm9uQWxnb3JpdGhtTGlzdFVwZGF0ZWQpO1xuICAgICAgICB0aGlzLmFsZ29yaXRobS5vZmYoRklMVEVSX0NIQU5HRUQsIHRoaXMub25BbGdvcml0aG1MaXN0VXBkYXRlZCk7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtID0gbmV3IEFsZ29yaXRobSgpO1xuICAgICAgICB0aGlzLmFsZ29yaXRobS5vbihMSVNUX1VQREFURURfRVZFTlQsIHRoaXMub25BbGdvcml0aG1MaXN0VXBkYXRlZCk7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtLm9uKEZJTFRFUl9DSEFOR0VELCB0aGlzLm9uQWxnb3JpdGhtTGlzdFVwZGF0ZWQpO1xuXG4gICAgICAgIC8vIFJlc2V0IHN0YXRlIHdpdGhvdXQgY2F1c2luZyB1cGRhdGVzIGFzIHRoZSBjbGllbnQgd2lsbCBoYXZlIGJlZW4gZGVzdHJveWVkXG4gICAgICAgIC8vIGFuZCBkb3duc3RyZWFtIGNvZGUgd2lsbCB0aHJvdyBOUEUgZXJyb3JzLlxuICAgICAgICBhd2FpdCB0aGlzLnJlc2V0KG51bGwsIHRydWUpO1xuICAgIH1cblxuICAgIC8vIFB1YmxpYyBmb3IgdGVzdCB1c2FnZS4gRG8gbm90IGNhbGwgdGhpcy5cbiAgICBwdWJsaWMgYXN5bmMgbWFrZVJlYWR5KGZvcmNlZENsaWVudD86IE1hdHJpeENsaWVudCkge1xuICAgICAgICBpZiAoZm9yY2VkQ2xpZW50KSB7XG4gICAgICAgICAgICB0aGlzLnJlYWR5U3RvcmUudXNlVW5pdFRlc3RDbGllbnQoZm9yY2VkQ2xpZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2hlY2tMb2dnaW5nRW5hYmxlZCgpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBhbnkgc2V0dGluZ3MgaGVyZSwgYXMgc29tZSBtYXkgaGF2ZSBoYXBwZW5lZCBiZWZvcmUgd2Ugd2VyZSBsb2dpY2FsbHkgcmVhZHkuXG4gICAgICAgIC8vIFVwZGF0ZSBhbnkgc2V0dGluZ3MgaGVyZSwgYXMgc29tZSBtYXkgaGF2ZSBoYXBwZW5lZCBiZWZvcmUgd2Ugd2VyZSBsb2dpY2FsbHkgcmVhZHkuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUmVnZW5lcmF0aW5nIHJvb20gbGlzdHM6IFN0YXJ0dXBcIik7XG4gICAgICAgIGF3YWl0IHRoaXMucmVhZEFuZENhY2hlU2V0dGluZ3NGcm9tU3RvcmUoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWdlbmVyYXRlQWxsTGlzdHMoe3RyaWdnZXI6IGZhbHNlfSk7XG4gICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUlZTVXBkYXRlKHt0cmlnZ2VyOiBmYWxzZX0pOyAvLyBmYWtlIGFuIFJWUyB1cGRhdGUgdG8gYWRqdXN0IHN0aWNreSByb29tLCBpZiBuZWVkZWRcblxuICAgICAgICB0aGlzLnVwZGF0ZUZuLm1hcmsoKTsgLy8gd2UgYWxtb3N0IGNlcnRhaW5seSB3YW50IHRvIHRyaWdnZXIgYW4gdXBkYXRlLlxuICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrTG9nZ2luZ0VuYWJsZWQoKSB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkFkdmFuY2VkIHJvb20gbGlzdCBsb2dnaW5nIGlzIGVuYWJsZWRcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlYWRBbmRDYWNoZVNldHRpbmdzRnJvbVN0b3JlKCkge1xuICAgICAgICBjb25zdCB0YWdzRW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2N1c3RvbV90YWdzXCIpO1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZVN0YXRlKHtcbiAgICAgICAgICAgIHRhZ3NFbmFibGVkLFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVBbGdvcml0aG1JbnN0YW5jZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIHN1c3BlY3RlZCBSb29tVmlld1N0b3JlIGNoYW5nZXMuXG4gICAgICogQHBhcmFtIHRyaWdnZXIgU2V0IHRvIGZhbHNlIHRvIHByZXZlbnQgYSBsaXN0IHVwZGF0ZSBmcm9tIGJlaW5nIHNlbnQuIFNob3VsZCBvbmx5XG4gICAgICogYmUgdXNlZCBpZiB0aGUgY2FsbGluZyBjb2RlIHdpbGwgbWFudWFsbHkgdHJpZ2dlciB0aGUgdXBkYXRlLlxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlUlZTVXBkYXRlKHt0cmlnZ2VyID0gdHJ1ZX0pIHtcbiAgICAgICAgaWYgKCF0aGlzLm1hdHJpeENsaWVudCkgcmV0dXJuOyAvLyBXZSBhc3N1bWUgdGhlcmUgd29uJ3QgYmUgUlZTIHVwZGF0ZXMgd2l0aG91dCBhIGNsaWVudFxuXG4gICAgICAgIGNvbnN0IGFjdGl2ZVJvb21JZCA9IFJvb21WaWV3U3RvcmUuZ2V0Um9vbUlkKCk7XG4gICAgICAgIGlmICghYWN0aXZlUm9vbUlkICYmIHRoaXMuYWxnb3JpdGhtLnN0aWNreVJvb20pIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldFN0aWNreVJvb20obnVsbCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlUm9vbUlkKSB7XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVSb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShhY3RpdmVSb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFhY3RpdmVSb29tKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2FjdGl2ZVJvb21JZH0gaXMgY3VycmVudCBpbiBSVlMgYnV0IG1pc3NpbmcgZnJvbSBjbGllbnQgLSBjbGVhcmluZyBzdGlja3kgcm9vbWApO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldFN0aWNreVJvb20obnVsbCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZVJvb20gIT09IHRoaXMuYWxnb3JpdGhtLnN0aWNreVJvb20pIHtcbiAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYENoYW5naW5nIHN0aWNreSByb29tIHRvICR7YWN0aXZlUm9vbUlkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFsZ29yaXRobS5zZXRTdGlja3lSb29tKGFjdGl2ZVJvb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRyaWdnZXIpIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvblJlYWR5KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGF3YWl0IHRoaXMubWFrZVJlYWR5KCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIG9uTm90UmVhZHkoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5yZXNldFN0b3JlKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIG9uQWN0aW9uKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgbm90IHJlbW90ZWx5IHJlYWR5LCBkb24ndCBldmVuIGJvdGhlciBzY2hlZHVsaW5nIHRoZSBkaXNwYXRjaCBoYW5kbGluZy5cbiAgICAgICAgLy8gVGhpcyBpcyByZXBlYXRlZCBpbiB0aGUgaGFuZGxlciBqdXN0IGluIGNhc2UgdGhpbmdzIGNoYW5nZSBiZXR3ZWVuIGEgZGVjaXNpb24gaGVyZSBhbmRcbiAgICAgICAgLy8gd2hlbiB0aGUgdGltZXIgZmlyZXMuXG4gICAgICAgIGNvbnN0IGxvZ2ljYWxseVJlYWR5ID0gdGhpcy5tYXRyaXhDbGllbnQgJiYgdGhpcy5pbml0aWFsTGlzdHNHZW5lcmF0ZWQ7XG4gICAgICAgIGlmICghbG9naWNhbGx5UmVhZHkpIHJldHVybjtcblxuICAgICAgICAvLyBXaGVuIHdlJ3JlIHJ1bm5pbmcgdGVzdHMgd2UgY2FuJ3QgcmVsaWFibHkgdXNlIHNldEltbWVkaWF0ZSBvdXQgb2YgdGltaW5nIGNvbmNlcm5zLlxuICAgICAgICAvLyBBcyBzdWNoLCB3ZSB1c2UgYSBtb3JlIHN5bmNocm9ub3VzIG1vZGVsLlxuICAgICAgICBpZiAoUm9vbUxpc3RTdG9yZUNsYXNzLlRFU1RfTU9ERSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5vbkRpc3BhdGNoQXN5bmMocGF5bG9hZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBkbyB0aGlzIHRvIGludGVudGlvbmFsbHkgYnJlYWsgb3V0IG9mIHRoZSBjdXJyZW50IGV2ZW50IGxvb3AgdGFzaywgYWxsb3dpbmdcbiAgICAgICAgLy8gdXMgdG8gaW5zdGVhZCB3YWl0IGZvciBhIG1vcmUgY29udmVuaWVudCB0aW1lIHRvIHJ1biBvdXIgdXBkYXRlcy5cbiAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHRoaXMub25EaXNwYXRjaEFzeW5jKHBheWxvYWQpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25EaXNwYXRjaEFzeW5jKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpIHtcbiAgICAgICAgLy8gRXZlcnl0aGluZyBoZXJlIHJlcXVpcmVzIGEgTWF0cml4Q2xpZW50IG9yIHNvbWUgc29ydCBvZiBsb2dpY2FsIHJlYWRpbmVzcy5cbiAgICAgICAgY29uc3QgbG9naWNhbGx5UmVhZHkgPSB0aGlzLm1hdHJpeENsaWVudCAmJiB0aGlzLmluaXRpYWxMaXN0c0dlbmVyYXRlZDtcbiAgICAgICAgaWYgKCFsb2dpY2FsbHlSZWFkeSkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ3NldHRpbmdfdXBkYXRlZCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLndhdGNoZWRTZXR0aW5ncy5pbmNsdWRlcyhwYXlsb2FkLnNldHRpbmdOYW1lKSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuc2V0dGluZ05hbWUgPT09IFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBMb2cgd2hlbiB0aGUgc2V0dGluZyBjaGFuZ2VzIHNvIHdlIGtub3cgd2hlbiBpdCB3YXMgdHVybmVkIG9uIGluIHRoZSByYWdlc2hha2VcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQWR2YW5jZWQgcm9vbSBsaXN0IGxvZ2dpbmcgaXMgZW5hYmxlZD8gXCIgKyBlbmFibGVkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVnZW5lcmF0aW5nIHJvb20gbGlzdHM6IFNldHRpbmdzIGNoYW5nZWRcIik7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWFkQW5kQ2FjaGVTZXR0aW5nc0Zyb21TdG9yZSgpO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWdlbmVyYXRlQWxsTGlzdHMoe3RyaWdnZXI6IGZhbHNlfSk7IC8vIHJlZ2VuZXJhdGUgdGhlIGxpc3RzIG5vd1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmFsZ29yaXRobSkge1xuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGRuJ3QgaGFwcGVuIGJlY2F1c2UgYGluaXRpYWxMaXN0c0dlbmVyYXRlZGAgaW1wbGllcyB3ZSBoYXZlIGFuIGFsZ29yaXRobS5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJvb20gbGlzdCBzdG9yZSBoYXMgbm8gYWxnb3JpdGhtIHRvIHByb2Nlc3MgZGlzcGF0Y2hlciB1cGRhdGUgd2l0aFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ01hdHJpeEFjdGlvbnMuUm9vbS5yZWNlaXB0Jykge1xuICAgICAgICAgICAgLy8gRmlyc3Qgc2VlIGlmIHRoZSByZWNlaXB0IGV2ZW50IGlzIGZvciBvdXIgb3duIHVzZXIuIElmIGl0IHdhcywgdHJpZ2dlclxuICAgICAgICAgICAgLy8gYSByb29tIHVwZGF0ZSAod2UgcHJvYmFibHkgcmVhZCB0aGUgcm9vbSBvbiBhIGRpZmZlcmVudCBkZXZpY2UpLlxuICAgICAgICAgICAgaWYgKHJlYWRSZWNlaXB0Q2hhbmdlSXNGb3IocGF5bG9hZC5ldmVudCwgdGhpcy5tYXRyaXhDbGllbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHBheWxvYWQucm9vbTtcbiAgICAgICAgICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBPd24gcmVhZCByZWNlaXB0IHdhcyBpbiB1bmtub3duIHJvb20gJHtyb29tLnJvb21JZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBHb3Qgb3duIHJlYWQgcmVjZWlwdCBpbiAke3Jvb20ucm9vbUlkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUocm9vbSwgUm9vbVVwZGF0ZUNhdXNlLlJlYWRSZWNlaXB0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdNYXRyaXhBY3Rpb25zLlJvb20udGFncycpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21QYXlsb2FkID0gKDxhbnk+cGF5bG9hZCk7IC8vIFRPRE86IFR5cGUgb3V0IHRoZSBkaXNwYXRjaGVyIHR5cGVzXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gR290IHRhZyBjaGFuZ2UgaW4gJHtyb29tUGF5bG9hZC5yb29tLnJvb21JZH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUm9vbVVwZGF0ZShyb29tUGF5bG9hZC5yb29tLCBSb29tVXBkYXRlQ2F1c2UuUG9zc2libGVUYWdDaGFuZ2UpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdNYXRyaXhBY3Rpb25zLlJvb20udGltZWxpbmUnKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudFBheWxvYWQgPSAoPGFueT5wYXlsb2FkKTsgLy8gVE9ETzogVHlwZSBvdXQgdGhlIGRpc3BhdGNoZXIgdHlwZXNcblxuICAgICAgICAgICAgLy8gSWdub3JlIG5vbi1saXZlIGV2ZW50cyAoYmFja2ZpbGwpXG4gICAgICAgICAgICBpZiAoIWV2ZW50UGF5bG9hZC5pc0xpdmVFdmVudCB8fCAhcGF5bG9hZC5pc0xpdmVVbmZpbHRlcmVkUm9vbVRpbWVsaW5lRXZlbnQpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gZXZlbnRQYXlsb2FkLmV2ZW50LmdldFJvb21JZCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IHRyeVVwZGF0ZSA9IGFzeW5jICh1cGRhdGVkUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIExpdmUgdGltZWxpbmUgZXZlbnQgJHtldmVudFBheWxvYWQuZXZlbnQuZ2V0SWQoKX1gICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAgaW4gJHt1cGRhdGVkUm9vbS5yb29tSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChldmVudFBheWxvYWQuZXZlbnQuZ2V0VHlwZSgpID09PSAnbS5yb29tLnRvbWJzdG9uZScgJiYgZXZlbnRQYXlsb2FkLmV2ZW50LmdldFN0YXRlS2V5KCkgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gR290IHRvbWJzdG9uZSBldmVudCAtIHRyeWluZyB0byByZW1vdmUgbm93LWRlYWQgcm9vbWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Jvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKGV2ZW50UGF5bG9hZC5ldmVudC5nZXRDb250ZW50KClbJ3JlcGxhY2VtZW50X3Jvb20nXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdSb29tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIHRoZSBuZXcgcm9vbSwgdGhlbiB0aGUgbmV3IHJvb20gY2hlY2sgd2lsbCBoYXZlIHNlZW4gdGhlIHByZWRlY2Vzc29yXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmQgZGlkIHRoZSByZXF1aXJlZCB1cGRhdGVzLCBzbyBkbyBub3RoaW5nIGhlcmUuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHVwZGF0ZWRSb29tLCBSb29tVXBkYXRlQ2F1c2UuVGltZWxpbmUpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgTGl2ZSB0aW1lbGluZSBldmVudCAke2V2ZW50UGF5bG9hZC5ldmVudC5nZXRJZCgpfSByZWNlaXZlZCB3aXRob3V0IGFzc29jaWF0ZWQgcm9vbWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgUXVldWluZyBmYWlsZWQgcm9vbSB1cGRhdGUgZm9yIHJldHJ5IGFzIGEgcmVzdWx0LmApO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkUm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdHJ5VXBkYXRlKHVwZGF0ZWRSb29tKTtcbiAgICAgICAgICAgICAgICB9LCAxMDApOyAvLyAxMDBtcyBzaG91bGQgYmUgZW5vdWdoIGZvciB0aGUgcm9vbSB0byBzaG93IHVwXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0cnlVcGRhdGUocm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdNYXRyaXhBY3Rpb25zLkV2ZW50LmRlY3J5cHRlZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50UGF5bG9hZCA9ICg8YW55PnBheWxvYWQpOyAvLyBUT0RPOiBUeXBlIG91dCB0aGUgZGlzcGF0Y2hlciB0eXBlc1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gZXZlbnRQYXlsb2FkLmV2ZW50LmdldFJvb21JZCgpO1xuICAgICAgICAgICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFdmVudCAke2V2ZW50UGF5bG9hZC5ldmVudC5nZXRJZCgpfSB3YXMgZGVjcnlwdGVkIGluIGFuIHVua25vd24gcm9vbSAke3Jvb21JZH1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gRGVjcnlwdGVkIHRpbWVsaW5lIGV2ZW50ICR7ZXZlbnRQYXlsb2FkLmV2ZW50LmdldElkKCl9IGluICR7cm9vbUlkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHJvb20sIFJvb21VcGRhdGVDYXVzZS5UaW1lbGluZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ01hdHJpeEFjdGlvbnMuYWNjb3VudERhdGEnICYmIHBheWxvYWQuZXZlbnRfdHlwZSA9PT0gJ20uZGlyZWN0Jykge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRQYXlsb2FkID0gKDxhbnk+cGF5bG9hZCk7IC8vIFRPRE86IFR5cGUgb3V0IHRoZSBkaXNwYXRjaGVyIHR5cGVzXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gUmVjZWl2ZWQgdXBkYXRlZCBETSBtYXBgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRtTWFwID0gZXZlbnRQYXlsb2FkLmV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdXNlcklkIG9mIE9iamVjdC5rZXlzKGRtTWFwKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZHMgPSBkbU1hcFt1c2VySWRdO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgcm9vbUlkIG9mIHJvb21JZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7cm9vbUlkfSB3YXMgZm91bmQgaW4gRE1zIGJ1dCB0aGUgcm9vbSBpcyBub3QgaW4gdGhlIHN0b3JlYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGV4cGVjdCB0aGlzIFJvb21VcGRhdGVDYXVzZSB0byBuby1vcCBpZiB0aGVyZSdzIG5vIGNoYW5nZSwgYW5kIHdlIGRvbid0IGV4cGVjdFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdXNlciB0byBoYXZlIGh1bmRyZWRzIG9mIHJvb21zIHRvIHVwZGF0ZSBpbiBvbmUgZXZlbnQuIEFzIHN1Y2gsIHdlIGp1c3QgaGFtbWVyXG4gICAgICAgICAgICAgICAgICAgIC8vIGF3YXkgYXQgdXBkYXRlcyB1bnRpbCB0aGUgcHJvYmxlbSBpcyBzb2x2ZWQuIElmIHdlIHdlcmUgZXhwZWN0aW5nIG1vcmUgdGhhbiBhIGNvdXBsZVxuICAgICAgICAgICAgICAgICAgICAvLyBvZiByb29tcyB0byBiZSB1cGRhdGVkIGF0IG9uY2UsIHdlIHdvdWxkIGNvbnNpZGVyIGJhdGNoaW5nIHRoZSByb29tcyB1cC5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHJvb20sIFJvb21VcGRhdGVDYXVzZS5Qb3NzaWJsZVRhZ0NoYW5nZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdNYXRyaXhBY3Rpb25zLlJvb20ubXlNZW1iZXJzaGlwJykge1xuICAgICAgICAgICAgY29uc3QgbWVtYmVyc2hpcFBheWxvYWQgPSAoPGFueT5wYXlsb2FkKTsgLy8gVE9ETzogVHlwZSBvdXQgdGhlIGRpc3BhdGNoZXIgdHlwZXNcbiAgICAgICAgICAgIGNvbnN0IG9sZE1lbWJlcnNoaXAgPSBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwKG1lbWJlcnNoaXBQYXlsb2FkLm9sZE1lbWJlcnNoaXApO1xuICAgICAgICAgICAgY29uc3QgbmV3TWVtYmVyc2hpcCA9IGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAobWVtYmVyc2hpcFBheWxvYWQubWVtYmVyc2hpcCk7XG4gICAgICAgICAgICBpZiAob2xkTWVtYmVyc2hpcCAhPT0gRWZmZWN0aXZlTWVtYmVyc2hpcC5Kb2luICYmIG5ld01lbWJlcnNoaXAgPT09IEVmZmVjdGl2ZU1lbWJlcnNoaXAuSm9pbikge1xuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIEhhbmRsaW5nIG5ldyByb29tICR7bWVtYmVyc2hpcFBheWxvYWQucm9vbS5yb29tSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgam9pbmluZyBhbiB1cGdyYWRlZCByb29tLCB3ZSdsbCB3YW50IHRvIG1ha2Ugc3VyZSB3ZSBkb24ndCBwcm9saWZlcmF0ZVxuICAgICAgICAgICAgICAgIC8vIHRoZSBkZWFkIHJvb20gaW4gdGhlIGxpc3QuXG4gICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlRXZlbnQgPSBtZW1iZXJzaGlwUGF5bG9hZC5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5jcmVhdGVcIiwgXCJcIik7XG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0ZUV2ZW50ICYmIGNyZWF0ZUV2ZW50LmdldENvbnRlbnQoKVsncHJlZGVjZXNzb3InXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIFJvb20gaGFzIGEgcHJlZGVjZXNzb3JgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2Um9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20oY3JlYXRlRXZlbnQuZ2V0Q29udGVudCgpWydwcmVkZWNlc3NvciddWydyb29tX2lkJ10pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzU3RpY2t5ID0gdGhpcy5hbGdvcml0aG0uc3RpY2t5Um9vbSA9PT0gcHJldlJvb207XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdGlja3kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBDbGVhcmluZyBzdGlja3kgcm9vbSBkdWUgdG8gcm9vbSB1cGdyYWRlYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldFN0aWNreVJvb20obnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHdlIGhpdCB0aGUgYWxnb3JpdGhtIGluc3RlYWQgb2Ygb3VyIGhhbmRsZVJvb21VcGRhdGUoKSBmdW5jdGlvbiB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXZvaWQgcmVkdW5kYW50IHVwZGF0ZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gUmVtb3ZpbmcgcHJldmlvdXMgcm9vbSBmcm9tIHJvb20gbGlzdGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hbGdvcml0aG0uaGFuZGxlUm9vbVVwZGF0ZShwcmV2Um9vbSwgUm9vbVVwZGF0ZUNhdXNlLlJvb21SZW1vdmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIEFkZGluZyBuZXcgcm9vbSB0byByb29tIGxpc3RgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKG1lbWJlcnNoaXBQYXlsb2FkLnJvb20sIFJvb21VcGRhdGVDYXVzZS5OZXdSb29tKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvbGRNZW1iZXJzaGlwICE9PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkludml0ZSAmJiBuZXdNZW1iZXJzaGlwID09PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkludml0ZSkge1xuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIEhhbmRsaW5nIGludml0ZSB0byAke21lbWJlcnNoaXBQYXlsb2FkLnJvb20ucm9vbUlkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUobWVtYmVyc2hpcFBheWxvYWQucm9vbSwgUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20pO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgaXQncyBub3QgYSBqb2luLCBpdCdzIHRyYW5zaXRpb25pbmcgaW50byBhIGRpZmZlcmVudCBsaXN0IChwb3NzaWJseSBoaXN0b3JpY2FsKVxuICAgICAgICAgICAgaWYgKG9sZE1lbWJlcnNoaXAgIT09IG5ld01lbWJlcnNoaXApIHtcbiAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBIYW5kbGluZyBtZW1iZXJzaGlwIGNoYW5nZSBpbiAke21lbWJlcnNoaXBQYXlsb2FkLnJvb20ucm9vbUlkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUobWVtYmVyc2hpcFBheWxvYWQucm9vbSwgUm9vbVVwZGF0ZUNhdXNlLlBvc3NpYmxlVGFnQ2hhbmdlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVJvb21VcGRhdGUocm9vbTogUm9vbSwgY2F1c2U6IFJvb21VcGRhdGVDYXVzZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmIChjYXVzZSA9PT0gUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20gJiYgcm9vbS5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJpbnZpdGVcIikge1xuICAgICAgICAgICAgLy8gTGV0IHRoZSB2aXNpYmlsaXR5IHByb3ZpZGVyIGtub3cgdGhhdCB0aGVyZSBpcyBhIG5ldyBpbnZpdGVkIHJvb20uIEl0IHdvdWxkIGJlIG5pY2VcbiAgICAgICAgICAgIC8vIGlmIHRoaXMgY291bGQganVzdCBiZSBhbiBldmVudCB0aGF0IHRoaW5ncyBsaXN0ZW4gZm9yIGJ1dCB0aGUgcG9pbnQgb2YgdGhpcyBpcyB0aGF0XG4gICAgICAgICAgICAvLyB3ZSBkZWxheSBkb2luZyBhbnl0aGluZyBhYm91dCB0aGlzIHJvb20gdW50aWwgdGhlIFZvaXBVc2VyTWFwcGVyIGhhZCBoYWQgYSBjaGFuY2VcbiAgICAgICAgICAgIC8vIHRvIGRvIHRoZSB0aGluZ3MgaXQgbmVlZHMgdG8gZG8gdG8gZGVjaWRlIGlmIHdlIHNob3VsZCBzaG93IHRoaXMgcm9vbSBvciBub3QsIHNvXG4gICAgICAgICAgICAvLyBhbiBldmVuIHdvdWxkbid0IGV0IHVzIGRvIHRoYXQuXG4gICAgICAgICAgICBhd2FpdCBWaXNpYmlsaXR5UHJvdmlkZXIuaW5zdGFuY2Uub25OZXdJbnZpdGVkUm9vbShyb29tKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghVmlzaWJpbGl0eVByb3ZpZGVyLmluc3RhbmNlLmlzUm9vbVZpc2libGUocm9vbSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gZG9uJ3QgZG8gYW55dGhpbmcgb24gcm9vbXMgdGhhdCBhcmVuJ3QgdmlzaWJsZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hvdWxkVXBkYXRlID0gYXdhaXQgdGhpcy5hbGdvcml0aG0uaGFuZGxlUm9vbVVwZGF0ZShyb29tLCBjYXVzZSk7XG4gICAgICAgIGlmIChzaG91bGRVcGRhdGUpIHtcbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtERUJVR10gUm9vbSBcIiR7cm9vbS5uYW1lfVwiICgke3Jvb20ucm9vbUlkfSkgdHJpZ2dlcmVkIGJ5ICR7Y2F1c2V9IHJlcXVpcmVzIGxpc3QgdXBkYXRlYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLm1hcmsoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVjYWxjdWxhdGVQcmVmaWx0ZXJpbmcoKSB7XG4gICAgICAgIGlmICghdGhpcy5hbGdvcml0aG0pIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLmFsZ29yaXRobS5oYXNUYWdTb3J0aW5nTWFwKSByZXR1cm47IC8vIHdlJ3JlIHN0aWxsIGxvYWRpbmdcblxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbGN1bGF0aW5nIG5ldyBwcmVmaWx0ZXJlZCByb29tIGxpc3RcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbmhpYml0IHVwZGF0ZXMgYmVjYXVzZSB3ZSdyZSBhYm91dCB0byBsaWUgaGVhdmlseSB0byB0aGUgYWxnb3JpdGhtXG4gICAgICAgIHRoaXMuYWxnb3JpdGhtLnVwZGF0ZXNJbmhpYml0ZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIEZpZ3VyZSBvdXQgd2hpY2ggcm9vbXMgYXJlIGFib3V0IHRvIGJlIHZhbGlkLCBhbmQgdGhlIHN0YXRlIG9mIGFmZmFpcnNcbiAgICAgICAgY29uc3Qgcm9vbXMgPSB0aGlzLmdldFBsYXVzaWJsZVJvb21zKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdGlja3kgPSB0aGlzLmFsZ29yaXRobS5zdGlja3lSb29tO1xuICAgICAgICBjb25zdCBzdGlja3lJc1N0aWxsUHJlc2VudCA9IGN1cnJlbnRTdGlja3kgJiYgcm9vbXMuaW5jbHVkZXMoY3VycmVudFN0aWNreSk7XG5cbiAgICAgICAgLy8gUmVzZXQgdGhlIHN0aWNreSByb29tIGJlZm9yZSByZXNldHRpbmcgdGhlIGtub3duIHJvb21zIHNvIHRoZSBhbGdvcml0aG1cbiAgICAgICAgLy8gZG9lc24ndCBmcmVhayBvdXQuXG4gICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldFN0aWNreVJvb20obnVsbCk7XG4gICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldEtub3duUm9vbXMocm9vbXMpO1xuXG4gICAgICAgIC8vIFNldCB0aGUgc3RpY2t5IHJvb20gYmFjaywgaWYgbmVlZGVkLCBub3cgdGhhdCB3ZSBoYXZlIHVwZGF0ZWQgdGhlIHN0b3JlLlxuICAgICAgICAvLyBUaGlzIHdpbGwgdXNlIHJlbGF0aXZlIHN0aWNreW5lc3MgdG8gdGhlIG5ldyByb29tIHNldC5cbiAgICAgICAgaWYgKHN0aWNreUlzU3RpbGxQcmVzZW50KSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmFsZ29yaXRobS5zZXRTdGlja3lSb29tKGN1cnJlbnRTdGlja3kpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgbWFyayBhbiB1cGRhdGUgYW5kIHJlc3VtZSB1cGRhdGVzIGZyb20gdGhlIGFsZ29yaXRobVxuICAgICAgICB0aGlzLnVwZGF0ZUZuLm1hcmsoKTtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0udXBkYXRlc0luaGliaXRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzZXRUYWdTb3J0aW5nKHRhZ0lkOiBUYWdJRCwgc29ydDogU29ydEFsZ29yaXRobSkge1xuICAgICAgICBhd2FpdCB0aGlzLnNldEFuZFBlcnNpc3RUYWdTb3J0aW5nKHRhZ0lkLCBzb3J0KTtcbiAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzZXRBbmRQZXJzaXN0VGFnU29ydGluZyh0YWdJZDogVGFnSUQsIHNvcnQ6IFNvcnRBbGdvcml0aG0pIHtcbiAgICAgICAgYXdhaXQgdGhpcy5hbGdvcml0aG0uc2V0VGFnU29ydGluZyh0YWdJZCwgc29ydCk7XG4gICAgICAgIC8vIFRPRE86IFBlci1hY2NvdW50PyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDExNFxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgbXhfdGFnU29ydF8ke3RhZ0lkfWAsIHNvcnQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRUYWdTb3J0aW5nKHRhZ0lkOiBUYWdJRCk6IFNvcnRBbGdvcml0aG0ge1xuICAgICAgICByZXR1cm4gdGhpcy5hbGdvcml0aG0uZ2V0VGFnU29ydGluZyh0YWdJZCk7XG4gICAgfVxuXG4gICAgLy8gbm9pbnNwZWN0aW9uIEpTTWV0aG9kQ2FuQmVTdGF0aWNcbiAgICBwcml2YXRlIGdldFN0b3JlZFRhZ1NvcnRpbmcodGFnSWQ6IFRhZ0lEKTogU29ydEFsZ29yaXRobSB7XG4gICAgICAgIC8vIFRPRE86IFBlci1hY2NvdW50PyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDExNFxuICAgICAgICByZXR1cm4gPFNvcnRBbGdvcml0aG0+bG9jYWxTdG9yYWdlLmdldEl0ZW0oYG14X3RhZ1NvcnRfJHt0YWdJZH1gKTtcbiAgICB9XG5cbiAgICAvLyBsb2dpYyBtdXN0IG1hdGNoIGNhbGN1bGF0ZUxpc3RPcmRlclxuICAgIHByaXZhdGUgY2FsY3VsYXRlVGFnU29ydGluZyh0YWdJZDogVGFnSUQpOiBTb3J0QWxnb3JpdGhtIHtcbiAgICAgICAgY29uc3QgaXNEZWZhdWx0UmVjZW50ID0gdGFnSWQgPT09IERlZmF1bHRUYWdJRC5JbnZpdGUgfHwgdGFnSWQgPT09IERlZmF1bHRUYWdJRC5ETTtcbiAgICAgICAgY29uc3QgZGVmYXVsdFNvcnQgPSBpc0RlZmF1bHRSZWNlbnQgPyBTb3J0QWxnb3JpdGhtLlJlY2VudCA6IFNvcnRBbGdvcml0aG0uQWxwaGFiZXRpYztcbiAgICAgICAgY29uc3Qgc2V0dGluZ0FscGhhYmV0aWNhbCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJSb29tTGlzdC5vcmRlckFscGhhYmV0aWNhbGx5XCIsIG51bGwsIHRydWUpO1xuICAgICAgICBjb25zdCBkZWZpbmVkU29ydCA9IHRoaXMuZ2V0VGFnU29ydGluZyh0YWdJZCk7XG4gICAgICAgIGNvbnN0IHN0b3JlZFNvcnQgPSB0aGlzLmdldFN0b3JlZFRhZ1NvcnRpbmcodGFnSWQpO1xuXG4gICAgICAgIC8vIFdlIHVzZSB0aGUgZm9sbG93aW5nIG9yZGVyIHRvIGRldGVybWluZSB3aGljaCBvZiB0aGUgNCBmbGFncyB0byB1c2U6XG4gICAgICAgIC8vIFN0b3JlZCA+IFNldHRpbmdzID4gRGVmaW5lZCA+IERlZmF1bHRcblxuICAgICAgICBsZXQgdGFnU29ydCA9IGRlZmF1bHRTb3J0O1xuICAgICAgICBpZiAoc3RvcmVkU29ydCkge1xuICAgICAgICAgICAgdGFnU29ydCA9IHN0b3JlZFNvcnQ7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHNldHRpbmdBbHBoYWJldGljYWwpKSB7XG4gICAgICAgICAgICB0YWdTb3J0ID0gc2V0dGluZ0FscGhhYmV0aWNhbCA/IFNvcnRBbGdvcml0aG0uQWxwaGFiZXRpYyA6IFNvcnRBbGdvcml0aG0uUmVjZW50O1xuICAgICAgICB9IGVsc2UgaWYgKGRlZmluZWRTb3J0KSB7XG4gICAgICAgICAgICB0YWdTb3J0ID0gZGVmaW5lZFNvcnQ7XG4gICAgICAgIH0gLy8gZWxzZSBkZWZhdWx0IChhbHJlYWR5IHNldClcblxuICAgICAgICByZXR1cm4gdGFnU29ydDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2V0TGlzdE9yZGVyKHRhZ0lkOiBUYWdJRCwgb3JkZXI6IExpc3RBbGdvcml0aG0pIHtcbiAgICAgICAgYXdhaXQgdGhpcy5zZXRBbmRQZXJzaXN0TGlzdE9yZGVyKHRhZ0lkLCBvcmRlcik7XG4gICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc2V0QW5kUGVyc2lzdExpc3RPcmRlcih0YWdJZDogVGFnSUQsIG9yZGVyOiBMaXN0QWxnb3JpdGhtKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYWxnb3JpdGhtLnNldExpc3RPcmRlcmluZyh0YWdJZCwgb3JkZXIpO1xuICAgICAgICAvLyBUT0RPOiBQZXItYWNjb3VudD8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQxMTRcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oYG14X2xpc3RPcmRlcl8ke3RhZ0lkfWAsIG9yZGVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGlzdE9yZGVyKHRhZ0lkOiBUYWdJRCk6IExpc3RBbGdvcml0aG0ge1xuICAgICAgICByZXR1cm4gdGhpcy5hbGdvcml0aG0uZ2V0TGlzdE9yZGVyaW5nKHRhZ0lkKTtcbiAgICB9XG5cbiAgICAvLyBub2luc3BlY3Rpb24gSlNNZXRob2RDYW5CZVN0YXRpY1xuICAgIHByaXZhdGUgZ2V0U3RvcmVkTGlzdE9yZGVyKHRhZ0lkOiBUYWdJRCk6IExpc3RBbGdvcml0aG0ge1xuICAgICAgICAvLyBUT0RPOiBQZXItYWNjb3VudD8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQxMTRcbiAgICAgICAgcmV0dXJuIDxMaXN0QWxnb3JpdGhtPmxvY2FsU3RvcmFnZS5nZXRJdGVtKGBteF9saXN0T3JkZXJfJHt0YWdJZH1gKTtcbiAgICB9XG5cbiAgICAvLyBsb2dpYyBtdXN0IG1hdGNoIGNhbGN1bGF0ZVRhZ1NvcnRpbmdcbiAgICBwcml2YXRlIGNhbGN1bGF0ZUxpc3RPcmRlcih0YWdJZDogVGFnSUQpOiBMaXN0QWxnb3JpdGhtIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdE9yZGVyID0gTGlzdEFsZ29yaXRobS5OYXR1cmFsO1xuICAgICAgICBjb25zdCBzZXR0aW5nSW1wb3J0YW5jZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJSb29tTGlzdC5vcmRlckJ5SW1wb3J0YW5jZVwiLCBudWxsLCB0cnVlKTtcbiAgICAgICAgY29uc3QgZGVmaW5lZE9yZGVyID0gdGhpcy5nZXRMaXN0T3JkZXIodGFnSWQpO1xuICAgICAgICBjb25zdCBzdG9yZWRPcmRlciA9IHRoaXMuZ2V0U3RvcmVkTGlzdE9yZGVyKHRhZ0lkKTtcblxuICAgICAgICAvLyBXZSB1c2UgdGhlIGZvbGxvd2luZyBvcmRlciB0byBkZXRlcm1pbmUgd2hpY2ggb2YgdGhlIDQgZmxhZ3MgdG8gdXNlOlxuICAgICAgICAvLyBTdG9yZWQgPiBTZXR0aW5ncyA+IERlZmluZWQgPiBEZWZhdWx0XG5cbiAgICAgICAgbGV0IGxpc3RPcmRlciA9IGRlZmF1bHRPcmRlcjtcbiAgICAgICAgaWYgKHN0b3JlZE9yZGVyKSB7XG4gICAgICAgICAgICBsaXN0T3JkZXIgPSBzdG9yZWRPcmRlcjtcbiAgICAgICAgfSBlbHNlIGlmICghaXNOdWxsT3JVbmRlZmluZWQoc2V0dGluZ0ltcG9ydGFuY2UpKSB7XG4gICAgICAgICAgICBsaXN0T3JkZXIgPSBzZXR0aW5nSW1wb3J0YW5jZSA/IExpc3RBbGdvcml0aG0uSW1wb3J0YW5jZSA6IExpc3RBbGdvcml0aG0uTmF0dXJhbDtcbiAgICAgICAgfSBlbHNlIGlmIChkZWZpbmVkT3JkZXIpIHtcbiAgICAgICAgICAgIGxpc3RPcmRlciA9IGRlZmluZWRPcmRlcjtcbiAgICAgICAgfSAvLyBlbHNlIGRlZmF1bHQgKGFscmVhZHkgc2V0KVxuXG4gICAgICAgIHJldHVybiBsaXN0T3JkZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB1cGRhdGVBbGdvcml0aG1JbnN0YW5jZXMoKSB7XG4gICAgICAgIC8vIFdlJ2xsIHJlcXVpcmUgYW4gdXBkYXRlLCBzbyBtYXJrIGZvciBvbmUuIE1hcmtpbmcgbm93IGFsc28gcHJldmVudHMgdGhlIGNhbGxzXG4gICAgICAgIC8vIHRvIHNldFRhZ1NvcnRpbmcgYW5kIHNldExpc3RPcmRlciBmcm9tIGNhdXNpbmcgdHJpZ2dlcnMuXG4gICAgICAgIHRoaXMudXBkYXRlRm4ubWFyaygpO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFnIG9mIE9iamVjdC5rZXlzKHRoaXMub3JkZXJlZExpc3RzKSkge1xuICAgICAgICAgICAgY29uc3QgZGVmaW5lZFNvcnQgPSB0aGlzLmdldFRhZ1NvcnRpbmcodGFnKTtcbiAgICAgICAgICAgIGNvbnN0IGRlZmluZWRPcmRlciA9IHRoaXMuZ2V0TGlzdE9yZGVyKHRhZyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRhZ1NvcnQgPSB0aGlzLmNhbGN1bGF0ZVRhZ1NvcnRpbmcodGFnKTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RPcmRlciA9IHRoaXMuY2FsY3VsYXRlTGlzdE9yZGVyKHRhZyk7XG5cbiAgICAgICAgICAgIGlmICh0YWdTb3J0ICE9PSBkZWZpbmVkU29ydCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2V0QW5kUGVyc2lzdFRhZ1NvcnRpbmcodGFnLCB0YWdTb3J0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0T3JkZXIgIT09IGRlZmluZWRPcmRlcikge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2V0QW5kUGVyc2lzdExpc3RPcmRlcih0YWcsIGxpc3RPcmRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWxnb3JpdGhtTGlzdFVwZGF0ZWQgPSAoKSA9PiB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5kZXJseWluZyBhbGdvcml0aG0gaGFzIHRyaWdnZXJlZCBhIGxpc3QgdXBkYXRlIC0gbWFya2luZ1wiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUZuLm1hcmsoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFsZ29yaXRobUZpbHRlclVwZGF0ZWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBmaWx0ZXIgY2FuIGhhcHBlbiBvZmYtY3ljbGUsIHNvIHRyaWdnZXIgYW4gdXBkYXRlLiBUaGUgZmlsdGVyIHdpbGwgaGF2ZVxuICAgICAgICAvLyBhbHJlYWR5IGNhdXNlZCBhIG1hcmsuXG4gICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUHJlZmlsdGVyVXBkYXRlZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWNhbGN1bGF0ZVByZWZpbHRlcmluZygpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRQbGF1c2libGVSb29tcygpOiBSb29tW10ge1xuICAgICAgICBpZiAoIXRoaXMubWF0cml4Q2xpZW50KSByZXR1cm4gW107XG5cbiAgICAgICAgbGV0IHJvb21zID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VmlzaWJsZVJvb21zKCkuZmlsdGVyKHIgPT4gVmlzaWJpbGl0eVByb3ZpZGVyLmluc3RhbmNlLmlzUm9vbVZpc2libGUocikpO1xuXG4gICAgICAgIC8vIGlmIHNwYWNlcyBhcmUgZW5hYmxlZCBvbmx5IGNvbnNpZGVyIHRoZSBwcmVmaWx0ZXIgY29uZGl0aW9ucyB3aGVuIHRoZXJlIGFyZSBubyBydW50aW1lIGNvbmRpdGlvbnNcbiAgICAgICAgLy8gZm9yIHRoZSBzZWFyY2ggYWxsIHNwYWNlcyBmZWF0dXJlXG4gICAgICAgIGlmICh0aGlzLnByZWZpbHRlckNvbmRpdGlvbnMubGVuZ3RoID4gMFxuICAgICAgICAgICAgJiYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9zcGFjZXNcIikgfHwgIXRoaXMuZmlsdGVyQ29uZGl0aW9ucy5sZW5ndGgpXG4gICAgICAgICkge1xuICAgICAgICAgICAgcm9vbXMgPSByb29tcy5maWx0ZXIociA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWx0ZXIgb2YgdGhpcy5wcmVmaWx0ZXJDb25kaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlsdGVyLmlzVmlzaWJsZShyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcm9vbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnZW5lcmF0ZXMgdGhlIHJvb20gd2hvbGUgcm9vbSBsaXN0LCBkaXNjYXJkaW5nIGFueSBwcmV2aW91cyByZXN1bHRzLlxuICAgICAqXG4gICAgICogTm90ZTogVGhpcyBpcyBvbmx5IGV4cG9zZWQgZXh0ZXJuYWxseSBmb3IgdGhlIHRlc3RzLiBEbyBub3QgY2FsbCB0aGlzIGZyb20gd2l0aGluXG4gICAgICogdGhlIGFwcC5cbiAgICAgKiBAcGFyYW0gdHJpZ2dlciBTZXQgdG8gZmFsc2UgdG8gcHJldmVudCBhIGxpc3QgdXBkYXRlIGZyb20gYmVpbmcgc2VudC4gU2hvdWxkIG9ubHlcbiAgICAgKiBiZSB1c2VkIGlmIHRoZSBjYWxsaW5nIGNvZGUgd2lsbCBtYW51YWxseSB0cmlnZ2VyIHRoZSB1cGRhdGUuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHJlZ2VuZXJhdGVBbGxMaXN0cyh7dHJpZ2dlciA9IHRydWV9KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIlJlZ2VuZXJhdGluZyBhbGwgcm9vbSBsaXN0c1wiKTtcblxuICAgICAgICBjb25zdCByb29tcyA9IHRoaXMuZ2V0UGxhdXNpYmxlUm9vbXMoKTtcblxuICAgICAgICBjb25zdCBjdXN0b21UYWdzID0gbmV3IFNldDxUYWdJRD4oKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudGFnc0VuYWJsZWQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiByb29tcykge1xuICAgICAgICAgICAgICAgIGlmICghcm9vbS50YWdzKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjb25zdCB0YWdzID0gT2JqZWN0LmtleXMocm9vbS50YWdzKS5maWx0ZXIodCA9PiBpc0N1c3RvbVRhZyh0KSk7XG4gICAgICAgICAgICAgICAgdGFncy5mb3JFYWNoKHQgPT4gY3VzdG9tVGFncy5hZGQodCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc29ydHM6IElUYWdTb3J0aW5nTWFwID0ge307XG4gICAgICAgIGNvbnN0IG9yZGVyczogSUxpc3RPcmRlcmluZ01hcCA9IHt9O1xuICAgICAgICBjb25zdCBhbGxUYWdzID0gWy4uLk9yZGVyZWREZWZhdWx0VGFnSURzLCAuLi5BcnJheS5mcm9tKGN1c3RvbVRhZ3MpXTtcbiAgICAgICAgZm9yIChjb25zdCB0YWdJZCBvZiBhbGxUYWdzKSB7XG4gICAgICAgICAgICBzb3J0c1t0YWdJZF0gPSB0aGlzLmNhbGN1bGF0ZVRhZ1NvcnRpbmcodGFnSWQpO1xuICAgICAgICAgICAgb3JkZXJzW3RhZ0lkXSA9IHRoaXMuY2FsY3VsYXRlTGlzdE9yZGVyKHRhZ0lkKTtcblxuICAgICAgICAgICAgUm9vbUxpc3RMYXlvdXRTdG9yZS5pbnN0YW5jZS5lbnN1cmVMYXlvdXRFeGlzdHModGFnSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5hbGdvcml0aG0ucG9wdWxhdGVUYWdzKHNvcnRzLCBvcmRlcnMpO1xuICAgICAgICBhd2FpdCB0aGlzLmFsZ29yaXRobS5zZXRLbm93blJvb21zKHJvb21zKTtcblxuICAgICAgICB0aGlzLmluaXRpYWxMaXN0c0dlbmVyYXRlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRyaWdnZXIpIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBmaWx0ZXIgY29uZGl0aW9uIHRvIHRoZSByb29tIGxpc3Qgc3RvcmUuIEZpbHRlcnMgbWF5IGJlIGFwcGxpZWQgYXN5bmMsXG4gICAgICogYW5kIHRodXMgbWlnaHQgbm90IGNhdXNlIGFuIHVwZGF0ZSB0byB0aGUgc3RvcmUgaW1tZWRpYXRlbHkuXG4gICAgICogQHBhcmFtIHtJRmlsdGVyQ29uZGl0aW9ufSBmaWx0ZXIgVGhlIGZpbHRlciBjb25kaXRpb24gdG8gYWRkLlxuICAgICAqL1xuICAgIHB1YmxpYyBhZGRGaWx0ZXIoZmlsdGVyOiBJRmlsdGVyQ29uZGl0aW9uKTogdm9pZCB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWRkaW5nIGZpbHRlciBjb25kaXRpb246XCIsIGZpbHRlcik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgaWYgKGZpbHRlci5raW5kID09PSBGaWx0ZXJLaW5kLlByZWZpbHRlcikge1xuICAgICAgICAgICAgZmlsdGVyLm9uKEZJTFRFUl9DSEFOR0VELCB0aGlzLm9uUHJlZmlsdGVyVXBkYXRlZCk7XG4gICAgICAgICAgICB0aGlzLnByZWZpbHRlckNvbmRpdGlvbnMucHVzaChmaWx0ZXIpO1xuICAgICAgICAgICAgcHJvbWlzZSA9IHRoaXMucmVjYWxjdWxhdGVQcmVmaWx0ZXJpbmcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyQ29uZGl0aW9ucy5wdXNoKGZpbHRlcik7XG4gICAgICAgICAgICBpZiAodGhpcy5hbGdvcml0aG0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFsZ29yaXRobS5hZGRGaWx0ZXJDb25kaXRpb24oZmlsdGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJ1bnRpbWUgZmlsdGVycyB3aXRoIHNwYWNlcyBkaXNhYmxlIHByZWZpbHRlcmluZyBmb3IgdGhlIHNlYXJjaCBhbGwgc3BhY2VzIGVmZmVjdFxuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3NwYWNlc1wiKSkge1xuICAgICAgICAgICAgICAgIHByb21pc2UgPSB0aGlzLnJlY2FsY3VsYXRlUHJlZmlsdGVyaW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHRoaXMudXBkYXRlRm4udHJpZ2dlcigpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgZmlsdGVyIGNvbmRpdGlvbiBmcm9tIHRoZSByb29tIGxpc3Qgc3RvcmUuIElmIHRoZSBmaWx0ZXIgd2FzXG4gICAgICogbm90IHByZXZpb3VzbHkgYWRkZWQgdG8gdGhlIHJvb20gbGlzdCBzdG9yZSwgdGhpcyB3aWxsIG5vLW9wLiBUaGUgZWZmZWN0c1xuICAgICAqIG9mIHJlbW92aW5nIGEgZmlsdGVyIG1heSBiZSBhcHBsaWVkIGFzeW5jIGFuZCB0aGVyZWZvcmUgbWlnaHQgbm90IGNhdXNlXG4gICAgICogYW4gdXBkYXRlIHJpZ2h0IGF3YXkuXG4gICAgICogQHBhcmFtIHtJRmlsdGVyQ29uZGl0aW9ufSBmaWx0ZXIgVGhlIGZpbHRlciBjb25kaXRpb24gdG8gcmVtb3ZlLlxuICAgICAqL1xuICAgIHB1YmxpYyByZW1vdmVGaWx0ZXIoZmlsdGVyOiBJRmlsdGVyQ29uZGl0aW9uKTogdm9pZCB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVtb3ZpbmcgZmlsdGVyIGNvbmRpdGlvbjpcIiwgZmlsdGVyKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICBsZXQgaWR4ID0gdGhpcy5maWx0ZXJDb25kaXRpb25zLmluZGV4T2YoZmlsdGVyKTtcbiAgICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmZpbHRlckNvbmRpdGlvbnMuc3BsaWNlKGlkeCwgMSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmFsZ29yaXRobSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWxnb3JpdGhtLnJlbW92ZUZpbHRlckNvbmRpdGlvbihmaWx0ZXIpO1xuICAgICAgICAgICAgICAgIC8vIFJ1bnRpbWUgZmlsdGVycyB3aXRoIHNwYWNlcyBkaXNhYmxlIHByZWZpbHRlcmluZyBmb3IgdGhlIHNlYXJjaCBhbGwgc3BhY2VzIGVmZmVjdFxuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9zcGFjZXNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSA9IHRoaXMucmVjYWxjdWxhdGVQcmVmaWx0ZXJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWR4ID0gdGhpcy5wcmVmaWx0ZXJDb25kaXRpb25zLmluZGV4T2YoZmlsdGVyKTtcbiAgICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgICAgICBmaWx0ZXIub2ZmKEZJTFRFUl9DSEFOR0VELCB0aGlzLm9uUHJlZmlsdGVyVXBkYXRlZCk7XG4gICAgICAgICAgICB0aGlzLnByZWZpbHRlckNvbmRpdGlvbnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICBwcm9taXNlID0gdGhpcy5yZWNhbGN1bGF0ZVByZWZpbHRlcmluZygpO1xuICAgICAgICB9XG4gICAgICAgIHByb21pc2UudGhlbigoKSA9PiB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZmlyc3QgKGFuZCBpZGVhbGx5IG9ubHkpIG5hbWUgZmlsdGVyIGNvbmRpdGlvbi4gSWYgb25lIGlzbid0IHByZXNlbnQsXG4gICAgICogdGhpcyByZXR1cm5zIG51bGwuXG4gICAgICogQHJldHVybnMgVGhlIGZpcnN0IG5hbWUgZmlsdGVyIGNvbmRpdGlvbiwgb3IgbnVsbCBpZiBub25lLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRGaXJzdE5hbWVGaWx0ZXJDb25kaXRpb24oKTogTmFtZUZpbHRlckNvbmRpdGlvbiB8IG51bGwge1xuICAgICAgICBmb3IgKGNvbnN0IGZpbHRlciBvZiB0aGlzLmZpbHRlckNvbmRpdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgaW5zdGFuY2VvZiBOYW1lRmlsdGVyQ29uZGl0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB0YWdzIGZvciBhIHJvb20gaWRlbnRpZmllZCBieSB0aGUgc3RvcmUuIFRoZSByZXR1cm5lZCBzZXRcbiAgICAgKiBzaG91bGQgbmV2ZXIgYmUgZW1wdHksIGFuZCB3aWxsIGNvbnRhaW4gRGVmYXVsdFRhZ0lELlVudGFnZ2VkIGlmXG4gICAgICogdGhlIHN0b3JlIGlzIG5vdCBhd2FyZSBvZiBhbnkgdGFncy5cbiAgICAgKiBAcGFyYW0gcm9vbSBUaGUgcm9vbSB0byBnZXQgdGhlIHRhZ3MgZm9yLlxuICAgICAqIEByZXR1cm5zIFRoZSB0YWdzIGZvciB0aGUgcm9vbS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VGFnc0ZvclJvb20ocm9vbTogUm9vbSk6IFRhZ0lEW10ge1xuICAgICAgICBjb25zdCBhbGdvcml0aG1UYWdzID0gdGhpcy5hbGdvcml0aG0uZ2V0VGFnc0ZvclJvb20ocm9vbSk7XG4gICAgICAgIGlmICghYWxnb3JpdGhtVGFncykgcmV0dXJuIFtEZWZhdWx0VGFnSUQuVW50YWdnZWRdO1xuICAgICAgICByZXR1cm4gYWxnb3JpdGhtVGFncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYW51YWxseSB1cGRhdGUgYSByb29tIHdpdGggYSBnaXZlbiBjYXVzZS4gVGhpcyBzaG91bGQgb25seSBiZSB1c2VkIGlmIHRoZVxuICAgICAqIHJvb20gbGlzdCBzdG9yZSB3b3VsZCBvdGhlcndpc2UgYmUgaW5jYXBhYmxlIG9mIGRvaW5nIHRoZSB1cGRhdGUgaXRzZWxmLiBOb3RlXG4gICAgICogdGhhdCB0aGlzIG1heSByYWNlIHdpdGggdGhlIHJvb20gbGlzdCdzIHJlZ3VsYXIgb3BlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Um9vbX0gcm9vbSBUaGUgcm9vbSB0byB1cGRhdGUuXG4gICAgICogQHBhcmFtIHtSb29tVXBkYXRlQ2F1c2V9IGNhdXNlIFRoZSBjYXVzZSB0byB1cGRhdGUgZm9yLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBtYW51YWxSb29tVXBkYXRlKHJvb206IFJvb20sIGNhdXNlOiBSb29tVXBkYXRlQ2F1c2UpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHJvb20sIGNhdXNlKTtcbiAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tTGlzdFN0b3JlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBpbnRlcm5hbEluc3RhbmNlOiBSb29tTGlzdFN0b3JlQ2xhc3M7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBpbnN0YW5jZSgpOiBSb29tTGlzdFN0b3JlQ2xhc3Mge1xuICAgICAgICBpZiAoIVJvb21MaXN0U3RvcmUuaW50ZXJuYWxJbnN0YW5jZSkge1xuICAgICAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnRlcm5hbEluc3RhbmNlID0gbmV3IFJvb21MaXN0U3RvcmVDbGFzcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFJvb21MaXN0U3RvcmUuaW50ZXJuYWxJbnN0YW5jZTtcbiAgICB9XG59XG5cbndpbmRvdy5teFJvb21MaXN0U3RvcmUgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlO1xuIl19
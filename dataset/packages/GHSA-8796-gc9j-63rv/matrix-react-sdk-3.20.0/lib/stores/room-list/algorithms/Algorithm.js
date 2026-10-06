"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Algorithm = exports.LIST_UPDATED_EVENT = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _utils = require("matrix-js-sdk/src/utils");

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _events = require("events");

var _arrays = require("../../../utils/arrays");

var _models = require("../models");

var _IFilterCondition = require("../filters/IFilterCondition");

var _membership = require("../../../utils/membership");

var _listOrdering = require("./list-ordering");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _VisibilityProvider = require("../filters/VisibilityProvider");

/*
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

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
 * Fired when the Algorithm has determined a list has been updated.
 */
const LIST_UPDATED_EVENT = "list_updated_event"; // These are the causes which require a room to be known in order for us to handle them. If
// a cause in this list is raised and we don't know about the room, we don't handle the update.
//
// Note: these typically happen when a new room is coming in, such as the user creating or
// joining the room. For these cases, we need to know about the room prior to handling it otherwise
// we'll make bad assumptions.

exports.LIST_UPDATED_EVENT = LIST_UPDATED_EVENT;
const CAUSES_REQUIRING_ROOM = [_models.RoomUpdateCause.Timeline, _models.RoomUpdateCause.ReadReceipt];

/**
 * Represents a list ordering algorithm. This class will take care of tag
 * management (which rooms go in which tags) and ask the implementation to
 * deal with ordering mechanics.
 */
class Algorithm extends _events.EventEmitter {
  // a clone of the _cachedRooms, with the sticky room
  // only not-null when changing the sticky room

  /**
   * Set to true to suspend emissions of algorithm updates.
   */
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_cachedRooms", {});
    (0, _defineProperty2.default)(this, "_cachedStickyRooms", {});
    (0, _defineProperty2.default)(this, "filteredRooms", {});
    (0, _defineProperty2.default)(this, "_stickyRoom", null);
    (0, _defineProperty2.default)(this, "_lastStickyRoom", null);
    (0, _defineProperty2.default)(this, "sortAlgorithms", void 0);
    (0, _defineProperty2.default)(this, "listAlgorithms", void 0);
    (0, _defineProperty2.default)(this, "algorithms", void 0);
    (0, _defineProperty2.default)(this, "rooms", []);
    (0, _defineProperty2.default)(this, "roomIdsToTags", {});
    (0, _defineProperty2.default)(this, "allowedByFilter", new Map());
    (0, _defineProperty2.default)(this, "allowedRoomsByFilters", new Set());
    (0, _defineProperty2.default)(this, "updatesInhibited", false);
  }

  get stickyRoom()
  /*: Room*/
  {
    return this._stickyRoom ? this._stickyRoom.room : null;
  }

  get knownRooms()
  /*: Room[]*/
  {
    return this.rooms;
  }

  get hasTagSortingMap()
  /*: boolean*/
  {
    return !!this.sortAlgorithms;
  }

  get hasFilters()
  /*: boolean*/
  {
    return this.allowedByFilter.size > 0;
  }

  set cachedRooms(val
  /*: ITagMap*/
  ) {
    this._cachedRooms = val;
    this.recalculateFilteredRooms();
    this.recalculateStickyRoom();
  }

  get cachedRooms()
  /*: ITagMap*/
  {
    // 🐉 Here be dragons.
    // Note: this is used by the underlying algorithm classes, so don't make it return
    // the sticky room cache. If it ends up returning the sticky room cache, we end up
    // corrupting our caches and confusing them.
    return this._cachedRooms;
  }
  /**
   * Awaitable version of the sticky room setter.
   * @param val The new room to sticky.
   */


  async setStickyRoom(val
  /*: Room*/
  ) {
    await this.updateStickyRoom(val);
  }

  getTagSorting(tagId
  /*: TagID*/
  )
  /*: SortAlgorithm*/
  {
    if (!this.sortAlgorithms) return null;
    return this.sortAlgorithms[tagId];
  }

  async setTagSorting(tagId
  /*: TagID*/
  , sort
  /*: SortAlgorithm*/
  ) {
    if (!tagId) throw new Error("Tag ID must be defined");
    if (!sort) throw new Error("Algorithm must be defined");
    this.sortAlgorithms[tagId] = sort;
    const algorithm
    /*: OrderingAlgorithm*/
    = this.algorithms[tagId];
    await algorithm.setSortAlgorithm(sort);
    this._cachedRooms[tagId] = algorithm.orderedRooms;
    this.recalculateFilteredRoomsForTag(tagId); // update filter to re-sort the list

    this.recalculateStickyRoom(tagId); // update sticky room to make sure it appears if needed
  }

  getListOrdering(tagId
  /*: TagID*/
  )
  /*: ListAlgorithm*/
  {
    if (!this.listAlgorithms) return null;
    return this.listAlgorithms[tagId];
  }

  async setListOrdering(tagId
  /*: TagID*/
  , order
  /*: ListAlgorithm*/
  ) {
    if (!tagId) throw new Error("Tag ID must be defined");
    if (!order) throw new Error("Algorithm must be defined");
    this.listAlgorithms[tagId] = order;
    const algorithm = (0, _listOrdering.getListAlgorithmInstance)(order, tagId, this.sortAlgorithms[tagId]);
    this.algorithms[tagId] = algorithm;
    await algorithm.setRooms(this._cachedRooms[tagId]);
    this._cachedRooms[tagId] = algorithm.orderedRooms;
    this.recalculateFilteredRoomsForTag(tagId); // update filter to re-sort the list

    this.recalculateStickyRoom(tagId); // update sticky room to make sure it appears if needed
  }

  addFilterCondition(filterCondition
  /*: IFilterCondition*/
  )
  /*: void*/
  {
    // Populate the cache of the new filter
    this.allowedByFilter.set(filterCondition, this.rooms.filter(r => filterCondition.isVisible(r)));
    this.recalculateFilteredRooms();
    filterCondition.on(_IFilterCondition.FILTER_CHANGED, this.handleFilterChange.bind(this));
  }

  removeFilterCondition(filterCondition
  /*: IFilterCondition*/
  )
  /*: void*/
  {
    filterCondition.off(_IFilterCondition.FILTER_CHANGED, this.handleFilterChange.bind(this));

    if (this.allowedByFilter.has(filterCondition)) {
      this.allowedByFilter.delete(filterCondition);
      this.recalculateFilteredRooms(); // If we removed the last filter, tell consumers that we've "updated" our filtered
      // view. This will trick them into getting the complete room list.

      if (!this.hasFilters && !this.updatesInhibited) {
        this.emit(LIST_UPDATED_EVENT);
      }
    }
  }

  async handleFilterChange() {
    await this.recalculateFilteredRooms(); // re-emit the update so the list store can fire an off-cycle update if needed

    if (this.updatesInhibited) return;
    this.emit(_IFilterCondition.FILTER_CHANGED);
  }

  async updateStickyRoom(val
  /*: Room*/
  ) {
    try {
      return await this.doUpdateStickyRoom(val);
    } finally {
      this._lastStickyRoom = null; // clear to indicate we're done changing
    }
  }

  async doUpdateStickyRoom(val
  /*: Room*/
  ) {
    // no-op sticky rooms for spaces - they're effectively virtual rooms
    if (val?.isSpaceRoom() && val.getMyMembership() !== "invite") val = null; // Note throughout: We need async so we can wait for handleRoomUpdate() to do its thing,
    // otherwise we risk duplicating rooms.

    if (val && !_VisibilityProvider.VisibilityProvider.instance.isRoomVisible(val)) {
      val = null; // the room isn't visible - lie to the rest of this function
    } // Set the last sticky room to indicate that we're in a change. The code throughout the
    // class can safely handle a null room, so this should be safe to do as a backup.


    this._lastStickyRoom = this._stickyRoom || {}; // It's possible to have no selected room. In that case, clear the sticky room

    if (!val) {
      if (this._stickyRoom) {
        const stickyRoom = this._stickyRoom.room;
        this._stickyRoom = null; // clear before we go to update the algorithm
        // Lie to the algorithm and re-add the room to the algorithm

        await this.handleRoomUpdate(stickyRoom, _models.RoomUpdateCause.NewRoom);
        return;
      }

      return;
    } // When we do have a room though, we expect to be able to find it


    let tag = this.roomIdsToTags[val.roomId]?.[0];
    if (!tag) throw new Error(`${val.roomId} does not belong to a tag and cannot be sticky`); // We specifically do NOT use the ordered rooms set as it contains the sticky room, which
    // means we'll be off by 1 when the user is switching rooms. This leads to visual jumping
    // when the user is moving south in the list (not north, because of math).

    const tagList = this.getOrderedRoomsWithoutSticky()[tag] || []; // can be null if filtering

    let position = tagList.indexOf(val); // We do want to see if a tag change happened though - if this did happen then we'll want
    // to force the position to zero (top) to ensure we can properly handle it.

    const wasSticky = this._lastStickyRoom.room ? this._lastStickyRoom.room.roomId === val.roomId : false;

    if (this._lastStickyRoom.tag && tag !== this._lastStickyRoom.tag && wasSticky && position < 0) {
      console.warn(`Sticky room ${val.roomId} changed tags during sticky room handling`);
      position = 0;
    } // Sanity check the position to make sure the room is qualified for being sticky


    if (position < 0) throw new Error(`${val.roomId} does not appear to be known and cannot be sticky`); // 🐉 Here be dragons.
    // Before we can go through with lying to the underlying algorithm about a room
    // we need to ensure that when we do we're ready for the inevitable sticky room
    // update we'll receive. To prepare for that, we first remove the sticky room and
    // recalculate the state ourselves so that when the underlying algorithm calls for
    // the same thing it no-ops. After we're done calling the algorithm, we'll issue
    // a new update for ourselves.

    const lastStickyRoom = this._stickyRoom;
    this._stickyRoom = null; // clear before we update the algorithm

    this.recalculateStickyRoom(); // When we do have the room, re-add the old room (if needed) to the algorithm
    // and remove the sticky room from the algorithm. This is so the underlying
    // algorithm doesn't try and confuse itself with the sticky room concept.
    // We don't add the new room if the sticky room isn't changing because that's
    // an easy way to cause duplication. We have to do room ID checks instead of
    // referential checks as the references can differ through the lifecycle.

    if (lastStickyRoom && lastStickyRoom.room && lastStickyRoom.room.roomId !== val.roomId) {
      // Lie to the algorithm and re-add the room to the algorithm
      await this.handleRoomUpdate(lastStickyRoom.room, _models.RoomUpdateCause.NewRoom);
    } // Lie to the algorithm and remove the room from it's field of view


    await this.handleRoomUpdate(val, _models.RoomUpdateCause.RoomRemoved); // Check for tag & position changes while we're here. We also check the room to ensure
    // it is still the same room.

    if (this._stickyRoom) {
      if (this._stickyRoom.room !== val) {
        // Check the room IDs just in case
        if (this._stickyRoom.room.roomId === val.roomId) {
          console.warn("Sticky room changed references");
        } else {
          throw new Error("Sticky room changed while the sticky room was changing");
        }
      }

      console.warn(`Sticky room changed tag & position from ${tag} / ${position} ` + `to ${this._stickyRoom.tag} / ${this._stickyRoom.position}`);
      tag = this._stickyRoom.tag;
      position = this._stickyRoom.position;
    } // Now that we're done lying to the algorithm, we need to update our position
    // marker only if the user is moving further down the same list. If they're switching
    // lists, or moving upwards, the position marker will splice in just fine but if
    // they went downwards in the same list we'll be off by 1 due to the shifting rooms.


    if (lastStickyRoom && lastStickyRoom.tag === tag && lastStickyRoom.position <= position) {
      position++;
    }

    this._stickyRoom = {
      room: val,
      position: position,
      tag: tag
    }; // We update the filtered rooms just in case, as otherwise users will end up visiting
    // a room while filtering and it'll disappear. We don't update the filter earlier in
    // this function simply because we don't have to.

    this.recalculateFilteredRoomsForTag(tag);
    if (lastStickyRoom && lastStickyRoom.tag !== tag) this.recalculateFilteredRoomsForTag(lastStickyRoom.tag);
    this.recalculateStickyRoom(); // Finally, trigger an update

    if (this.updatesInhibited) return;
    this.emit(LIST_UPDATED_EVENT);
  }

  recalculateFilteredRooms() {
    if (!this.hasFilters) {
      return;
    }

    console.warn("Recalculating filtered room list");
    const filters = Array.from(this.allowedByFilter.keys());
    const newMap
    /*: ITagMap*/
    = {};

    for (const tagId of Object.keys(this.cachedRooms)) {
      // Cheaply clone the rooms so we can more easily do operations on the list.
      // We optimize our lookups by trying to reduce sample size as much as possible
      // to the rooms we know will be deduped by the Set.
      const rooms = this.cachedRooms[tagId].map(r => r); // cheap clone

      this.tryInsertStickyRoomToFilterSet(rooms, tagId);
      const remainingRooms = rooms.map(r => r);
      const allowedRoomsInThisTag = [];

      for (const filter of filters) {
        const filteredRooms = remainingRooms.filter(r => filter.isVisible(r));

        for (const room of filteredRooms) {
          const idx = remainingRooms.indexOf(room);
          if (idx >= 0) remainingRooms.splice(idx, 1);
          allowedRoomsInThisTag.push(room);
        }
      }

      newMap[tagId] = allowedRoomsInThisTag;

      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`[DEBUG] ${newMap[tagId].length}/${rooms.length} rooms filtered into ${tagId}`);
      }
    }

    const allowedRooms = Object.values(newMap).reduce((rv, v) => {
      rv.push(...v);
      return rv;
    }, []);
    this.allowedRoomsByFilters = new Set(allowedRooms);
    this.filteredRooms = newMap;
    if (this.updatesInhibited) return;
    this.emit(LIST_UPDATED_EVENT);
  }

  recalculateFilteredRoomsForTag(tagId
  /*: TagID*/
  )
  /*: void*/
  {
    if (!this.hasFilters) return; // don't bother doing work if there's nothing to do

    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log(`Recalculating filtered rooms for ${tagId}`);
    }

    delete this.filteredRooms[tagId];
    const rooms = this.cachedRooms[tagId].map(r => r); // cheap clone

    this.tryInsertStickyRoomToFilterSet(rooms, tagId);
    const filteredRooms = rooms.filter(r => this.allowedRoomsByFilters.has(r));

    if (filteredRooms.length > 0) {
      this.filteredRooms[tagId] = filteredRooms;
    }

    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log(`[DEBUG] ${filteredRooms.length}/${rooms.length} rooms filtered into ${tagId}`);
    }
  }

  tryInsertStickyRoomToFilterSet(rooms
  /*: Room[]*/
  , tagId
  /*: TagID*/
  ) {
    if (!this._stickyRoom || !this._stickyRoom.room || this._stickyRoom.tag !== tagId) return;
    const position = this._stickyRoom.position;

    if (position >= rooms.length) {
      rooms.push(this._stickyRoom.room);
    } else {
      rooms.splice(position, 0, this._stickyRoom.room);
    }
  }
  /**
   * Recalculate the sticky room position. If this is being called in relation to
   * a specific tag being updated, it should be given to this function to optimize
   * the call.
   * @param updatedTag The tag that was updated, if possible.
   */


  recalculateStickyRoom(updatedTag
  /*: TagID*/
  = null)
  /*: void*/
  {
    // 🐉 Here be dragons.
    // This function does far too much for what it should, and is called by many places.
    // Not only is this responsible for ensuring the sticky room is held in place at all
    // times, it is also responsible for ensuring our clone of the cachedRooms is up to
    // date. If either of these desyncs, we see weird behaviour like duplicated rooms,
    // outdated lists, and other nonsensical issues that aren't necessarily obvious.
    if (!this._stickyRoom) {
      // If there's no sticky room, just do nothing useful.
      if (!!this._cachedStickyRooms) {
        // Clear the cache if we won't be needing it
        this._cachedStickyRooms = null;
        if (this.updatesInhibited) return;
        this.emit(LIST_UPDATED_EVENT);
      }

      return;
    }

    if (!this._cachedStickyRooms || !updatedTag) {
      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`Generating clone of cached rooms for sticky room handling`);
      }

      const stickiedTagMap
      /*: ITagMap*/
      = {};

      for (const tagId of Object.keys(this.cachedRooms)) {
        stickiedTagMap[tagId] = this.cachedRooms[tagId].map(r => r); // shallow clone
      }

      this._cachedStickyRooms = stickiedTagMap;
    }

    if (updatedTag) {
      // Update the tag indicated by the caller, if possible. This is mostly to ensure
      // our cache is up to date.
      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`Replacing cached sticky rooms for ${updatedTag}`);
      }

      this._cachedStickyRooms[updatedTag] = this.cachedRooms[updatedTag].map(r => r); // shallow clone
    } // Now try to insert the sticky room, if we need to.
    // We need to if there's no updated tag (we regenned the whole cache) or if the tag
    // we might have updated from the cache is also our sticky room.


    const sticky = this._stickyRoom;

    if (!updatedTag || updatedTag === sticky.tag) {
      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`Inserting sticky room ${sticky.room.roomId} at position ${sticky.position} in ${sticky.tag}`);
      }

      this._cachedStickyRooms[sticky.tag].splice(sticky.position, 0, sticky.room);
    } // Finally, trigger an update


    if (this.updatesInhibited) return;
    this.emit(LIST_UPDATED_EVENT);
  }
  /**
   * Asks the Algorithm to regenerate all lists, using the tags given
   * as reference for which lists to generate and which way to generate
   * them.
   * @param {ITagSortingMap} tagSortingMap The tags to generate.
   * @param {IListOrderingMap} listOrderingMap The ordering of those tags.
   * @returns {Promise<*>} A promise which resolves when complete.
   */


  async populateTags(tagSortingMap
  /*: ITagSortingMap*/
  , listOrderingMap
  /*: IListOrderingMap*/
  )
  /*: Promise<any>*/
  {
    if (!tagSortingMap) throw new Error(`Sorting map cannot be null or empty`);
    if (!listOrderingMap) throw new Error(`Ordering ma cannot be null or empty`);

    if ((0, _arrays.arrayHasDiff)(Object.keys(tagSortingMap), Object.keys(listOrderingMap))) {
      throw new Error(`Both maps must contain the exact same tags`);
    }

    this.sortAlgorithms = tagSortingMap;
    this.listAlgorithms = listOrderingMap;
    this.algorithms = {};

    for (const tag of Object.keys(tagSortingMap)) {
      this.algorithms[tag] = (0, _listOrdering.getListAlgorithmInstance)(this.listAlgorithms[tag], tag, this.sortAlgorithms[tag]);
    }

    return this.setKnownRooms(this.rooms);
  }
  /**
   * Gets an ordered set of rooms for the all known tags, filtered.
   * @returns {ITagMap} The cached list of rooms, ordered,
   * for each tag. May be empty, but never null/undefined.
   */


  getOrderedRooms()
  /*: ITagMap*/
  {
    if (!this.hasFilters) {
      return this._cachedStickyRooms || this.cachedRooms;
    }

    return this.filteredRooms;
  }

  getUnfilteredRooms()
  /*: ITagMap*/
  {
    return this._cachedStickyRooms || this.cachedRooms;
  }
  /**
   * This returns the same as getOrderedRooms(), but without the sticky room
   * map as it causes issues for sticky room handling (see sticky room handling
   * for more information).
   * @returns {ITagMap} The cached list of rooms, ordered,
   * for each tag. May be empty, but never null/undefined.
   */


  getOrderedRoomsWithoutSticky()
  /*: ITagMap*/
  {
    if (!this.hasFilters) {
      return this.cachedRooms;
    }

    return this.filteredRooms;
  }
  /**
   * Seeds the Algorithm with a set of rooms. The algorithm will discard all
   * previously known information and instead use these rooms instead.
   * @param {Room[]} rooms The rooms to force the algorithm to use.
   * @returns {Promise<*>} A promise which resolves when complete.
   */


  async setKnownRooms(rooms
  /*: Room[]*/
  )
  /*: Promise<any>*/
  {
    if ((0, _utils.isNullOrUndefined)(rooms)) throw new Error(`Array of rooms cannot be null`);
    if (!this.sortAlgorithms) throw new Error(`Cannot set known rooms without a tag sorting map`);

    if (!this.updatesInhibited) {
      // We only log this if we're expecting to be publishing updates, which means that
      // this could be an unexpected invocation. If we're inhibited, then this is probably
      // an intentional invocation.
      console.warn("Resetting known rooms, initiating regeneration");
    } // Before we go any further we need to clear (but remember) the sticky room to
    // avoid accidentally duplicating it in the list.


    const oldStickyRoom = this._stickyRoom;
    await this.updateStickyRoom(null);
    this.rooms = rooms;
    const newTags
    /*: ITagMap*/
    = {};

    for (const tagId in this.sortAlgorithms) {
      // noinspection JSUnfilteredForInLoop
      newTags[tagId] = [];
    } // If we can avoid doing work, do so.


    if (!rooms.length) {
      await this.generateFreshTags(newTags); // just in case it wants to do something

      this.cachedRooms = newTags;
      return;
    } // Split out the easy rooms first (leave and invite)


    const memberships = (0, _membership.splitRoomsByMembership)(rooms);

    for (const room of memberships[_membership.EffectiveMembership.Invite]) {
      newTags[_models.DefaultTagID.Invite].push(room);
    }

    for (const room of memberships[_membership.EffectiveMembership.Leave]) {
      newTags[_models.DefaultTagID.Archived].push(room);
    } // Now process all the joined rooms. This is a bit more complicated


    for (const room of memberships[_membership.EffectiveMembership.Join]) {
      const tags = this.getTagsOfJoinedRoom(room);
      let inTag = false;

      if (tags.length > 0) {
        for (const tag of tags) {
          if (!(0, _utils.isNullOrUndefined)(newTags[tag])) {
            newTags[tag].push(room);
            inTag = true;
          }
        }
      }

      if (!inTag) {
        if (_DMRoomMap.default.shared().getUserIdForRoomId(room.roomId)) {
          newTags[_models.DefaultTagID.DM].push(room);
        } else {
          newTags[_models.DefaultTagID.Untagged].push(room);
        }
      }
    }

    await this.generateFreshTags(newTags);
    this.cachedRooms = newTags;
    this.updateTagsFromCache();
    this.recalculateFilteredRooms(); // Now that we've finished generation, we need to update the sticky room to what
    // it was. It's entirely possible that it changed lists though, so if it did then
    // we also have to update the position of it.

    if (oldStickyRoom && oldStickyRoom.room) {
      await this.updateStickyRoom(oldStickyRoom.room);

      if (this._stickyRoom && this._stickyRoom.room) {
        // just in case the update doesn't go according to plan
        if (this._stickyRoom.tag !== oldStickyRoom.tag) {
          // We put the sticky room at the top of the list to treat it as an obvious tag change.
          this._stickyRoom.position = 0;
          this.recalculateStickyRoom(this._stickyRoom.tag);
        }
      }
    }
  }

  getTagsForRoom(room
  /*: Room*/
  )
  /*: TagID[]*/
  {
    const tags
    /*: TagID[]*/
    = [];
    const membership = (0, _membership.getEffectiveMembership)(room.getMyMembership());

    if (membership === _membership.EffectiveMembership.Invite) {
      tags.push(_models.DefaultTagID.Invite);
    } else if (membership === _membership.EffectiveMembership.Leave) {
      tags.push(_models.DefaultTagID.Archived);
    } else {
      tags.push(...this.getTagsOfJoinedRoom(room));
    }

    if (!tags.length) tags.push(_models.DefaultTagID.Untagged);
    return tags;
  }

  getTagsOfJoinedRoom(room
  /*: Room*/
  )
  /*: TagID[]*/
  {
    let tags = Object.keys(room.tags || {});

    if (tags.length === 0) {
      // Check to see if it's a DM if it isn't anything else
      if (_DMRoomMap.default.shared().getUserIdForRoomId(room.roomId)) {
        tags = [_models.DefaultTagID.DM];
      }
    }

    return tags;
  }
  /**
   * Updates the roomsToTags map
   */


  updateTagsFromCache() {
    const newMap = {};
    const tags = Object.keys(this.cachedRooms);

    for (const tagId of tags) {
      const rooms = this.cachedRooms[tagId];

      for (const room of rooms) {
        if (!newMap[room.roomId]) newMap[room.roomId] = [];
        newMap[room.roomId].push(tagId);
      }
    }

    this.roomIdsToTags = newMap;
  }
  /**
   * Called when the Algorithm believes a complete regeneration of the existing
   * lists is needed.
   * @param {ITagMap} updatedTagMap The tag map which needs populating. Each tag
   * will already have the rooms which belong to it - they just need ordering. Must
   * be mutated in place.
   * @returns {Promise<*>} A promise which resolves when complete.
   */


  async generateFreshTags(updatedTagMap
  /*: ITagMap*/
  )
  /*: Promise<any>*/
  {
    if (!this.algorithms) throw new Error("Not ready: no algorithms to determine tags from");

    for (const tag of Object.keys(updatedTagMap)) {
      const algorithm
      /*: OrderingAlgorithm*/
      = this.algorithms[tag];
      if (!algorithm) throw new Error(`No algorithm for ${tag}`);
      await algorithm.setRooms(updatedTagMap[tag]);
      updatedTagMap[tag] = algorithm.orderedRooms;
    }
  }
  /**
   * Asks the Algorithm to update its knowledge of a room. For example, when
   * a user tags a room, joins/creates a room, or leaves a room the Algorithm
   * should be told that the room's info might have changed. The Algorithm
   * may no-op this request if no changes are required.
   * @param {Room} room The room which might have affected sorting.
   * @param {RoomUpdateCause} cause The reason for the update being triggered.
   * @returns {Promise<boolean>} A promise which resolve to true or false
   * depending on whether or not getOrderedRooms() should be called after
   * processing.
   */


  async handleRoomUpdate(room
  /*: Room*/
  , cause
  /*: RoomUpdateCause*/
  )
  /*: Promise<boolean>*/
  {
    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log(`Handle room update for ${room.roomId} called with cause ${cause}`);
    }

    if (!this.algorithms) throw new Error("Not ready: no algorithms to determine tags from"); // Note: check the isSticky against the room ID just in case the reference is wrong

    const isSticky = this._stickyRoom && this._stickyRoom.room && this._stickyRoom.room.roomId === room.roomId;

    if (cause === _models.RoomUpdateCause.NewRoom) {
      const isForLastSticky = this._lastStickyRoom && this._lastStickyRoom.room === room;
      const roomTags = this.roomIdsToTags[room.roomId];
      const hasTags = roomTags && roomTags.length > 0; // Don't change the cause if the last sticky room is being re-added. If we fail to
      // pass the cause through as NewRoom, we'll fail to lie to the algorithm and thus
      // lose the room.

      if (hasTags && !isForLastSticky) {
        console.warn(`${room.roomId} is reportedly new but is already known - assuming TagChange instead`);
        cause = _models.RoomUpdateCause.PossibleTagChange;
      } // Check to see if the room is known first


      let knownRoomRef = this.rooms.includes(room);

      if (hasTags && !knownRoomRef) {
        console.warn(`${room.roomId} might be a reference change - attempting to update reference`);
        this.rooms = this.rooms.map(r => r.roomId === room.roomId ? room : r);
        knownRoomRef = this.rooms.includes(room);

        if (!knownRoomRef) {
          console.warn(`${room.roomId} is still not referenced. It may be sticky.`);
        }
      } // If we have tags for a room and don't have the room referenced, something went horribly
      // wrong - the reference should have been updated above.


      if (hasTags && !knownRoomRef && !isSticky) {
        throw new Error(`${room.roomId} is missing from room array but is known - trying to find duplicate`);
      } // Like above, update the reference to the sticky room if we need to


      if (hasTags && isSticky) {
        // Go directly in and set the sticky room's new reference, being careful not
        // to trigger a sticky room update ourselves.
        this._stickyRoom.room = room;
      } // If after all that we're still a NewRoom update, add the room if applicable.
      // We don't do this for the sticky room (because it causes duplication issues)
      // or if we know about the reference (as it should be replaced).


      if (cause === _models.RoomUpdateCause.NewRoom && !isSticky && !knownRoomRef) {
        this.rooms.push(room);
      }
    }

    let didTagChange = false;

    if (cause === _models.RoomUpdateCause.PossibleTagChange) {
      const oldTags = this.roomIdsToTags[room.roomId] || [];
      const newTags = this.getTagsForRoom(room);
      const diff = (0, _arrays.arrayDiff)(oldTags, newTags);

      if (diff.removed.length > 0 || diff.added.length > 0) {
        for (const rmTag of diff.removed) {
          if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
            // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
            console.log(`Removing ${room.roomId} from ${rmTag}`);
          }

          const algorithm
          /*: OrderingAlgorithm*/
          = this.algorithms[rmTag];
          if (!algorithm) throw new Error(`No algorithm for ${rmTag}`);
          await algorithm.handleRoomUpdate(room, _models.RoomUpdateCause.RoomRemoved);
          this._cachedRooms[rmTag] = algorithm.orderedRooms;
          this.recalculateFilteredRoomsForTag(rmTag); // update filter to re-sort the list

          this.recalculateStickyRoom(rmTag); // update sticky room to make sure it moves if needed
        }

        for (const addTag of diff.added) {
          if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
            // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
            console.log(`Adding ${room.roomId} to ${addTag}`);
          }

          const algorithm
          /*: OrderingAlgorithm*/
          = this.algorithms[addTag];
          if (!algorithm) throw new Error(`No algorithm for ${addTag}`);
          await algorithm.handleRoomUpdate(room, _models.RoomUpdateCause.NewRoom);
          this._cachedRooms[addTag] = algorithm.orderedRooms;
        } // Update the tag map so we don't regen it in a moment


        this.roomIdsToTags[room.roomId] = newTags;

        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.log(`Changing update cause for ${room.roomId} to Timeline to sort rooms`);
        }

        cause = _models.RoomUpdateCause.Timeline;
        didTagChange = true;
      } else {
        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.log(`Received no-op update for ${room.roomId} - changing to Timeline update`);
        }

        cause = _models.RoomUpdateCause.Timeline;
      }

      if (didTagChange && isSticky) {
        // Manually update the tag for the sticky room without triggering a sticky room
        // update. The update will be handled implicitly by the sticky room handling and
        // requires no changes on our part, if we're in the middle of a sticky room change.
        if (this._lastStickyRoom) {
          this._stickyRoom = {
            room,
            tag: this.roomIdsToTags[room.roomId][0],
            position: 0 // right at the top as it changed tags

          };
        } else {
          // We have to clear the lock as the sticky room change will trigger updates.
          await this.setStickyRoom(room);
        }
      }
    } // If the update is for a room change which might be the sticky room, prevent it. We
    // need to make sure that the causes (NewRoom and RoomRemoved) are still triggered though
    // as the sticky room relies on this.


    if (cause !== _models.RoomUpdateCause.NewRoom && cause !== _models.RoomUpdateCause.RoomRemoved) {
      if (this.stickyRoom === room) {
        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.warn(`[RoomListDebug] Received ${cause} update for sticky room ${room.roomId} - ignoring`);
        }

        return false;
      }
    }

    if (!this.roomIdsToTags[room.roomId]) {
      if (CAUSES_REQUIRING_ROOM.includes(cause)) {
        if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
          // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
          console.warn(`Skipping tag update for ${room.roomId} because we don't know about the room`);
        }

        return false;
      }

      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`[RoomListDebug] Updating tags for room ${room.roomId} (${room.name})`);
      } // Get the tags for the room and populate the cache


      const roomTags = this.getTagsForRoom(room).filter(t => !(0, _utils.isNullOrUndefined)(this.cachedRooms[t])); // "This should never happen" condition - we specify DefaultTagID.Untagged in getTagsForRoom(),
      // which means we should *always* have a tag to go off of.

      if (!roomTags.length) throw new Error(`Tags cannot be determined for ${room.roomId}`);
      this.roomIdsToTags[room.roomId] = roomTags;

      if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
        // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
        console.log(`[RoomListDebug] Updated tags for ${room.roomId}:`, roomTags);
      }
    }

    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log(`[RoomListDebug] Reached algorithmic handling for ${room.roomId} and cause ${cause}`);
    }

    const tags = this.roomIdsToTags[room.roomId];

    if (!tags) {
      console.warn(`No tags known for "${room.name}" (${room.roomId})`);
      return false;
    }

    let changed = didTagChange;

    for (const tag of tags) {
      const algorithm
      /*: OrderingAlgorithm*/
      = this.algorithms[tag];
      if (!algorithm) throw new Error(`No algorithm for ${tag}`);
      await algorithm.handleRoomUpdate(room, cause);
      this._cachedRooms[tag] = algorithm.orderedRooms; // Flag that we've done something

      this.recalculateFilteredRoomsForTag(tag); // update filter to re-sort the list

      this.recalculateStickyRoom(tag); // update sticky room to make sure it appears if needed

      changed = true;
    }

    if (_SettingsStore.default.getValue("advancedRoomListLogging")) {
      // TODO: Remove debug: https://github.com/vector-im/element-web/issues/14602
      console.log(`[RoomListDebug] Finished handling ${room.roomId} with cause ${cause} (changed=${changed})`);
    }

    return changed;
  }

}

exports.Algorithm = Algorithm;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvQWxnb3JpdGhtLnRzIl0sIm5hbWVzIjpbIkxJU1RfVVBEQVRFRF9FVkVOVCIsIkNBVVNFU19SRVFVSVJJTkdfUk9PTSIsIlJvb21VcGRhdGVDYXVzZSIsIlRpbWVsaW5lIiwiUmVhZFJlY2VpcHQiLCJBbGdvcml0aG0iLCJFdmVudEVtaXR0ZXIiLCJjb25zdHJ1Y3RvciIsIk1hcCIsIlNldCIsInN0aWNreVJvb20iLCJfc3RpY2t5Um9vbSIsInJvb20iLCJrbm93blJvb21zIiwicm9vbXMiLCJoYXNUYWdTb3J0aW5nTWFwIiwic29ydEFsZ29yaXRobXMiLCJoYXNGaWx0ZXJzIiwiYWxsb3dlZEJ5RmlsdGVyIiwic2l6ZSIsImNhY2hlZFJvb21zIiwidmFsIiwiX2NhY2hlZFJvb21zIiwicmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zIiwicmVjYWxjdWxhdGVTdGlja3lSb29tIiwic2V0U3RpY2t5Um9vbSIsInVwZGF0ZVN0aWNreVJvb20iLCJnZXRUYWdTb3J0aW5nIiwidGFnSWQiLCJzZXRUYWdTb3J0aW5nIiwic29ydCIsIkVycm9yIiwiYWxnb3JpdGhtIiwiYWxnb3JpdGhtcyIsInNldFNvcnRBbGdvcml0aG0iLCJvcmRlcmVkUm9vbXMiLCJyZWNhbGN1bGF0ZUZpbHRlcmVkUm9vbXNGb3JUYWciLCJnZXRMaXN0T3JkZXJpbmciLCJsaXN0QWxnb3JpdGhtcyIsInNldExpc3RPcmRlcmluZyIsIm9yZGVyIiwic2V0Um9vbXMiLCJhZGRGaWx0ZXJDb25kaXRpb24iLCJmaWx0ZXJDb25kaXRpb24iLCJzZXQiLCJmaWx0ZXIiLCJyIiwiaXNWaXNpYmxlIiwib24iLCJGSUxURVJfQ0hBTkdFRCIsImhhbmRsZUZpbHRlckNoYW5nZSIsImJpbmQiLCJyZW1vdmVGaWx0ZXJDb25kaXRpb24iLCJvZmYiLCJoYXMiLCJkZWxldGUiLCJ1cGRhdGVzSW5oaWJpdGVkIiwiZW1pdCIsImRvVXBkYXRlU3RpY2t5Um9vbSIsIl9sYXN0U3RpY2t5Um9vbSIsImlzU3BhY2VSb29tIiwiZ2V0TXlNZW1iZXJzaGlwIiwiVmlzaWJpbGl0eVByb3ZpZGVyIiwiaW5zdGFuY2UiLCJpc1Jvb21WaXNpYmxlIiwiaGFuZGxlUm9vbVVwZGF0ZSIsIk5ld1Jvb20iLCJ0YWciLCJyb29tSWRzVG9UYWdzIiwicm9vbUlkIiwidGFnTGlzdCIsImdldE9yZGVyZWRSb29tc1dpdGhvdXRTdGlja3kiLCJwb3NpdGlvbiIsImluZGV4T2YiLCJ3YXNTdGlja3kiLCJjb25zb2xlIiwid2FybiIsImxhc3RTdGlja3lSb29tIiwiUm9vbVJlbW92ZWQiLCJmaWx0ZXJzIiwiQXJyYXkiLCJmcm9tIiwia2V5cyIsIm5ld01hcCIsIk9iamVjdCIsIm1hcCIsInRyeUluc2VydFN0aWNreVJvb21Ub0ZpbHRlclNldCIsInJlbWFpbmluZ1Jvb21zIiwiYWxsb3dlZFJvb21zSW5UaGlzVGFnIiwiZmlsdGVyZWRSb29tcyIsImlkeCIsInNwbGljZSIsInB1c2giLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJsb2ciLCJsZW5ndGgiLCJhbGxvd2VkUm9vbXMiLCJ2YWx1ZXMiLCJyZWR1Y2UiLCJydiIsInYiLCJhbGxvd2VkUm9vbXNCeUZpbHRlcnMiLCJ1cGRhdGVkVGFnIiwiX2NhY2hlZFN0aWNreVJvb21zIiwic3RpY2tpZWRUYWdNYXAiLCJzdGlja3kiLCJwb3B1bGF0ZVRhZ3MiLCJ0YWdTb3J0aW5nTWFwIiwibGlzdE9yZGVyaW5nTWFwIiwic2V0S25vd25Sb29tcyIsImdldE9yZGVyZWRSb29tcyIsImdldFVuZmlsdGVyZWRSb29tcyIsIm9sZFN0aWNreVJvb20iLCJuZXdUYWdzIiwiZ2VuZXJhdGVGcmVzaFRhZ3MiLCJtZW1iZXJzaGlwcyIsIkVmZmVjdGl2ZU1lbWJlcnNoaXAiLCJJbnZpdGUiLCJEZWZhdWx0VGFnSUQiLCJMZWF2ZSIsIkFyY2hpdmVkIiwiSm9pbiIsInRhZ3MiLCJnZXRUYWdzT2ZKb2luZWRSb29tIiwiaW5UYWciLCJETVJvb21NYXAiLCJzaGFyZWQiLCJnZXRVc2VySWRGb3JSb29tSWQiLCJETSIsIlVudGFnZ2VkIiwidXBkYXRlVGFnc0Zyb21DYWNoZSIsImdldFRhZ3NGb3JSb29tIiwibWVtYmVyc2hpcCIsInVwZGF0ZWRUYWdNYXAiLCJjYXVzZSIsImlzU3RpY2t5IiwiaXNGb3JMYXN0U3RpY2t5Iiwicm9vbVRhZ3MiLCJoYXNUYWdzIiwiUG9zc2libGVUYWdDaGFuZ2UiLCJrbm93blJvb21SZWYiLCJpbmNsdWRlcyIsImRpZFRhZ0NoYW5nZSIsIm9sZFRhZ3MiLCJkaWZmIiwicmVtb3ZlZCIsImFkZGVkIiwicm1UYWciLCJhZGRUYWciLCJuYW1lIiwidCIsImNoYW5nZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQVNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQW5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdUJBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLGtCQUFrQixHQUFHLG9CQUEzQixDLENBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxDQUMxQkMsd0JBQWdCQyxRQURVLEVBRTFCRCx3QkFBZ0JFLFdBRlUsQ0FBOUI7O0FBV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLE1BQU1DLFNBQU4sU0FBd0JDLG9CQUF4QixDQUFxQztBQUVFO0FBR0c7O0FBVzdDO0FBQ0o7QUFDQTtBQUdXQyxFQUFBQSxXQUFQLEdBQXFCO0FBQ2pCO0FBRGlCLHdEQXBCVyxFQW9CWDtBQUFBLDhEQW5CaUIsRUFtQmpCO0FBQUEseURBbEJZLEVBa0JaO0FBQUEsdURBakJjLElBaUJkO0FBQUEsMkRBaEJrQixJQWdCbEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxpREFaRyxFQVlIO0FBQUEseURBVGpCLEVBU2lCO0FBQUEs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UGhELE1BQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFjLHNCQUFxQmhFLElBQUksQ0FBQzBJLElBQUssTUFBSzFJLElBQUksQ0FBQ3lELE1BQU8sR0FBOUQ7QUFDQSxhQUFPLEtBQVA7QUFDSDs7QUFFRCxRQUFJbUYsT0FBTyxHQUFHVCxZQUFkOztBQUNBLFNBQUssTUFBTTVFLEdBQVgsSUFBa0J3RCxJQUFsQixFQUF3QjtBQUNwQixZQUFNM0Y7QUFBNEI7QUFBQSxRQUFHLEtBQUtDLFVBQUwsQ0FBZ0JrQyxHQUFoQixDQUFyQztBQUNBLFVBQUksQ0FBQ25DLFNBQUwsRUFBZ0IsTUFBTSxJQUFJRCxLQUFKLENBQVcsb0JBQW1Cb0MsR0FBSSxFQUFsQyxDQUFOO0FBRWhCLFlBQU1uQyxTQUFTLENBQUNpQyxnQkFBVixDQUEyQnJELElBQTNCLEVBQWlDMkgsS0FBakMsQ0FBTjtBQUNBLFdBQUtqSCxZQUFMLENBQWtCNkMsR0FBbEIsSUFBeUJuQyxTQUFTLENBQUNHLFlBQW5DLENBTG9CLENBT3BCOztBQUNBLFdBQUtDLDhCQUFMLENBQW9DK0IsR0FBcEMsRUFSb0IsQ0FRc0I7O0FBQzFDLFdBQUszQyxxQkFBTCxDQUEyQjJDLEdBQTNCLEVBVG9CLENBU2E7O0FBQ2pDcUYsTUFBQUEsT0FBTyxHQUFHLElBQVY7QUFDSDs7QUFFRCxRQUFJM0QsdUJBQWNDLFFBQWQsQ0FBdUIseUJBQXZCLENBQUosRUFBdUQ7QUFDbkQ7QUFDQW5CLE1BQUFBLE9BQU8sQ0FBQ29CLEdBQVIsQ0FBYSxxQ0FBb0NuRixJQUFJLENBQUN5RCxNQUFPLGVBQWNrRSxLQUFNLGFBQVlpQixPQUFRLEdBQXJHO0FBQ0g7O0FBQ0QsV0FBT0EsT0FBUDtBQUNIOztBQWx5QnVDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwLCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgaXNOdWxsT3JVbmRlZmluZWQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvdXRpbHNcIjtcbmltcG9ydCBETVJvb21NYXAgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0RNUm9vbU1hcFwiO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IHsgYXJyYXlEaWZmLCBhcnJheUhhc0RpZmYgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQsIFJvb21VcGRhdGVDYXVzZSwgVGFnSUQgfSBmcm9tIFwiLi4vbW9kZWxzXCI7XG5pbXBvcnQge1xuICAgIElMaXN0T3JkZXJpbmdNYXAsXG4gICAgSU9yZGVyaW5nQWxnb3JpdGhtTWFwLFxuICAgIElUYWdNYXAsXG4gICAgSVRhZ1NvcnRpbmdNYXAsXG4gICAgTGlzdEFsZ29yaXRobSxcbiAgICBTb3J0QWxnb3JpdGhtLFxufSBmcm9tIFwiLi9tb2RlbHNcIjtcbmltcG9ydCB7IEZJTFRFUl9DSEFOR0VELCBJRmlsdGVyQ29uZGl0aW9uIH0gZnJvbSBcIi4uL2ZpbHRlcnMvSUZpbHRlckNvbmRpdGlvblwiO1xuaW1wb3J0IHsgRWZmZWN0aXZlTWVtYmVyc2hpcCwgZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcCwgc3BsaXRSb29tc0J5TWVtYmVyc2hpcCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9tZW1iZXJzaGlwXCI7XG5pbXBvcnQgeyBPcmRlcmluZ0FsZ29yaXRobSB9IGZyb20gXCIuL2xpc3Qtb3JkZXJpbmcvT3JkZXJpbmdBbGdvcml0aG1cIjtcbmltcG9ydCB7IGdldExpc3RBbGdvcml0aG1JbnN0YW5jZSB9IGZyb20gXCIuL2xpc3Qtb3JkZXJpbmdcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBWaXNpYmlsaXR5UHJvdmlkZXIgfSBmcm9tIFwiLi4vZmlsdGVycy9WaXNpYmlsaXR5UHJvdmlkZXJcIjtcblxuLyoqXG4gKiBGaXJlZCB3aGVuIHRoZSBBbGdvcml0aG0gaGFzIGRldGVybWluZWQgYSBsaXN0IGhhcyBiZWVuIHVwZGF0ZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBMSVNUX1VQREFURURfRVZFTlQgPSBcImxpc3RfdXBkYXRlZF9ldmVudFwiO1xuXG4vLyBUaGVzZSBhcmUgdGhlIGNhdXNlcyB3aGljaCByZXF1aXJlIGEgcm9vbSB0byBiZSBrbm93biBpbiBvcmRlciBmb3IgdXMgdG8gaGFuZGxlIHRoZW0uIElmXG4vLyBhIGNhdXNlIGluIHRoaXMgbGlzdCBpcyByYWlzZWQgYW5kIHdlIGRvbid0IGtub3cgYWJvdXQgdGhlIHJvb20sIHdlIGRvbid0IGhhbmRsZSB0aGUgdXBkYXRlLlxuLy9cbi8vIE5vdGU6IHRoZXNlIHR5cGljYWxseSBoYXBwZW4gd2hlbiBhIG5ldyByb29tIGlzIGNvbWluZyBpbiwgc3VjaCBhcyB0aGUgdXNlciBjcmVhdGluZyBvclxuLy8gam9pbmluZyB0aGUgcm9vbS4gRm9yIHRoZXNlIGNhc2VzLCB3ZSBuZWVkIHRvIGtub3cgYWJvdXQgdGhlIHJvb20gcHJpb3IgdG8gaGFuZGxpbmcgaXQgb3RoZXJ3aXNlXG4vLyB3ZSdsbCBtYWtlIGJhZCBhc3N1bXB0aW9ucy5cbmNvbnN0IENBVVNFU19SRVFVSVJJTkdfUk9PTSA9IFtcbiAgICBSb29tVXBkYXRlQ2F1c2UuVGltZWxpbmUsXG4gICAgUm9vbVVwZGF0ZUNhdXNlLlJlYWRSZWNlaXB0LFxuXTtcblxuaW50ZXJmYWNlIElTdGlja3lSb29tIHtcbiAgICByb29tOiBSb29tO1xuICAgIHBvc2l0aW9uOiBudW1iZXI7XG4gICAgdGFnOiBUYWdJRDtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgbGlzdCBvcmRlcmluZyBhbGdvcml0aG0uIFRoaXMgY2xhc3Mgd2lsbCB0YWtlIGNhcmUgb2YgdGFnXG4gKiBtYW5hZ2VtZW50ICh3aGljaCByb29tcyBnbyBpbiB3aGljaCB0YWdzKSBhbmQgYXNrIHRoZSBpbXBsZW1lbnRhdGlvbiB0b1xuICogZGVhbCB3aXRoIG9yZGVyaW5nIG1lY2hhbmljcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFsZ29yaXRobSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgcHJpdmF0ZSBfY2FjaGVkUm9vbXM6IElUYWdNYXAgPSB7fTtcbiAgICBwcml2YXRlIF9jYWNoZWRTdGlja3lSb29tczogSVRhZ01hcCA9IHt9OyAvLyBhIGNsb25lIG9mIHRoZSBfY2FjaGVkUm9vbXMsIHdpdGggdGhlIHN0aWNreSByb29tXG4gICAgcHJpdmF0ZSBmaWx0ZXJlZFJvb21zOiBJVGFnTWFwID0ge307XG4gICAgcHJpdmF0ZSBfc3RpY2t5Um9vbTogSVN0aWNreVJvb20gPSBudWxsO1xuICAgIHByaXZhdGUgX2xhc3RTdGlja3lSb29tOiBJU3RpY2t5Um9vbSA9IG51bGw7IC8vIG9ubHkgbm90LW51bGwgd2hlbiBjaGFuZ2luZyB0aGUgc3RpY2t5IHJvb21cbiAgICBwcml2YXRlIHNvcnRBbGdvcml0aG1zOiBJVGFnU29ydGluZ01hcDtcbiAgICBwcml2YXRlIGxpc3RBbGdvcml0aG1zOiBJTGlzdE9yZGVyaW5nTWFwO1xuICAgIHByaXZhdGUgYWxnb3JpdGhtczogSU9yZGVyaW5nQWxnb3JpdGhtTWFwO1xuICAgIHByaXZhdGUgcm9vbXM6IFJvb21bXSA9IFtdO1xuICAgIHByaXZhdGUgcm9vbUlkc1RvVGFnczoge1xuICAgICAgICBbcm9vbUlkOiBzdHJpbmddOiBUYWdJRFtdO1xuICAgIH0gPSB7fTtcbiAgICBwcml2YXRlIGFsbG93ZWRCeUZpbHRlcjogTWFwPElGaWx0ZXJDb25kaXRpb24sIFJvb21bXT4gPSBuZXcgTWFwPElGaWx0ZXJDb25kaXRpb24sIFJvb21bXT4oKTtcbiAgICBwcml2YXRlIGFsbG93ZWRSb29tc0J5RmlsdGVyczogU2V0PFJvb20+ID0gbmV3IFNldDxSb29tPigpO1xuXG4gICAgLyoqXG4gICAgICogU2V0IHRvIHRydWUgdG8gc3VzcGVuZCBlbWlzc2lvbnMgb2YgYWxnb3JpdGhtIHVwZGF0ZXMuXG4gICAgICovXG4gICAgcHVibGljIHVwZGF0ZXNJbmhpYml0ZWQgPSBmYWxzZTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHN0aWNreVJvb20oKTogUm9vbSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGlja3lSb29tID8gdGhpcy5fc3RpY2t5Um9vbS5yb29tIDogbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGtub3duUm9vbXMoKTogUm9vbVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vbXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBoYXNUYWdTb3J0aW5nTWFwKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLnNvcnRBbGdvcml0aG1zO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXQgaGFzRmlsdGVycygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsb3dlZEJ5RmlsdGVyLnNpemUgPiAwO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXQgY2FjaGVkUm9vbXModmFsOiBJVGFnTWFwKSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZFJvb21zID0gdmFsO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlRmlsdGVyZWRSb29tcygpO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXQgY2FjaGVkUm9vbXMoKTogSVRhZ01hcCB7XG4gICAgICAgIC8vIPCfkIkgSGVyZSBiZSBkcmFnb25zLlxuICAgICAgICAvLyBOb3RlOiB0aGlzIGlzIHVzZWQgYnkgdGhlIHVuZGVybHlpbmcgYWxnb3JpdGhtIGNsYXNzZXMsIHNvIGRvbid0IG1ha2UgaXQgcmV0dXJuXG4gICAgICAgIC8vIHRoZSBzdGlja3kgcm9vbSBjYWNoZS4gSWYgaXQgZW5kcyB1cCByZXR1cm5pbmcgdGhlIHN0aWNreSByb29tIGNhY2hlLCB3ZSBlbmQgdXBcbiAgICAgICAgLy8gY29ycnVwdGluZyBvdXIgY2FjaGVzIGFuZCBjb25mdXNpbmcgdGhlbS5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZFJvb21zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF3YWl0YWJsZSB2ZXJzaW9uIG9mIHRoZSBzdGlja3kgcm9vbSBzZXR0ZXIuXG4gICAgICogQHBhcmFtIHZhbCBUaGUgbmV3IHJvb20gdG8gc3RpY2t5LlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBzZXRTdGlja3lSb29tKHZhbDogUm9vbSkge1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZVN0aWNreVJvb20odmFsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VGFnU29ydGluZyh0YWdJZDogVGFnSUQpOiBTb3J0QWxnb3JpdGhtIHtcbiAgICAgICAgaWYgKCF0aGlzLnNvcnRBbGdvcml0aG1zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXMuc29ydEFsZ29yaXRobXNbdGFnSWRdO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzZXRUYWdTb3J0aW5nKHRhZ0lkOiBUYWdJRCwgc29ydDogU29ydEFsZ29yaXRobSkge1xuICAgICAgICBpZiAoIXRhZ0lkKSB0aHJvdyBuZXcgRXJyb3IoXCJUYWcgSUQgbXVzdCBiZSBkZWZpbmVkXCIpO1xuICAgICAgICBpZiAoIXNvcnQpIHRocm93IG5ldyBFcnJvcihcIkFsZ29yaXRobSBtdXN0IGJlIGRlZmluZWRcIik7XG4gICAgICAgIHRoaXMuc29ydEFsZ29yaXRobXNbdGFnSWRdID0gc29ydDtcblxuICAgICAgICBjb25zdCBhbGdvcml0aG06IE9yZGVyaW5nQWxnb3JpdGhtID0gdGhpcy5hbGdvcml0aG1zW3RhZ0lkXTtcbiAgICAgICAgYXdhaXQgYWxnb3JpdGhtLnNldFNvcnRBbGdvcml0aG0oc29ydCk7XG4gICAgICAgIHRoaXMuX2NhY2hlZFJvb21zW3RhZ0lkXSA9IGFsZ29yaXRobS5vcmRlcmVkUm9vbXM7XG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zRm9yVGFnKHRhZ0lkKTsgLy8gdXBkYXRlIGZpbHRlciB0byByZS1zb3J0IHRoZSBsaXN0XG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVTdGlja3lSb29tKHRhZ0lkKTsgLy8gdXBkYXRlIHN0aWNreSByb29tIHRvIG1ha2Ugc3VyZSBpdCBhcHBlYXJzIGlmIG5lZWRlZFxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMaXN0T3JkZXJpbmcodGFnSWQ6IFRhZ0lEKTogTGlzdEFsZ29yaXRobSB7XG4gICAgICAgIGlmICghdGhpcy5saXN0QWxnb3JpdGhtcykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RBbGdvcml0aG1zW3RhZ0lkXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2V0TGlzdE9yZGVyaW5nKHRhZ0lkOiBUYWdJRCwgb3JkZXI6IExpc3RBbGdvcml0aG0pIHtcbiAgICAgICAgaWYgKCF0YWdJZCkgdGhyb3cgbmV3IEVycm9yKFwiVGFnIElEIG11c3QgYmUgZGVmaW5lZFwiKTtcbiAgICAgICAgaWYgKCFvcmRlcikgdGhyb3cgbmV3IEVycm9yKFwiQWxnb3JpdGhtIG11c3QgYmUgZGVmaW5lZFwiKTtcbiAgICAgICAgdGhpcy5saXN0QWxnb3JpdGhtc1t0YWdJZF0gPSBvcmRlcjtcblxuICAgICAgICBjb25zdCBhbGdvcml0aG0gPSBnZXRMaXN0QWxnb3JpdGhtSW5zdGFuY2Uob3JkZXIsIHRhZ0lkLCB0aGlzLnNvcnRBbGdvcml0aG1zW3RhZ0lkXSk7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtc1t0YWdJZF0gPSBhbGdvcml0aG07XG5cbiAgICAgICAgYXdhaXQgYWxnb3JpdGhtLnNldFJvb21zKHRoaXMuX2NhY2hlZFJvb21zW3RhZ0lkXSk7XG4gICAgICAgIHRoaXMuX2NhY2hlZFJvb21zW3RhZ0lkXSA9IGFsZ29yaXRobS5vcmRlcmVkUm9vbXM7XG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zRm9yVGFnKHRhZ0lkKTsgLy8gdXBkYXRlIGZpbHRlciB0byByZS1zb3J0IHRoZSBsaXN0XG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVTdGlja3lSb29tKHRhZ0lkKTsgLy8gdXBkYXRlIHN0aWNreSByb29tIHRvIG1ha2Ugc3VyZSBpdCBhcHBlYXJzIGlmIG5lZWRlZFxuICAgIH1cblxuICAgIHB1YmxpYyBhZGRGaWx0ZXJDb25kaXRpb24oZmlsdGVyQ29uZGl0aW9uOiBJRmlsdGVyQ29uZGl0aW9uKTogdm9pZCB7XG4gICAgICAgIC8vIFBvcHVsYXRlIHRoZSBjYWNoZSBvZiB0aGUgbmV3IGZpbHRlclxuICAgICAgICB0aGlzLmFsbG93ZWRCeUZpbHRlci5zZXQoZmlsdGVyQ29uZGl0aW9uLCB0aGlzLnJvb21zLmZpbHRlcihyID0+IGZpbHRlckNvbmRpdGlvbi5pc1Zpc2libGUocikpKTtcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUZpbHRlcmVkUm9vbXMoKTtcbiAgICAgICAgZmlsdGVyQ29uZGl0aW9uLm9uKEZJTFRFUl9DSEFOR0VELCB0aGlzLmhhbmRsZUZpbHRlckNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlRmlsdGVyQ29uZGl0aW9uKGZpbHRlckNvbmRpdGlvbjogSUZpbHRlckNvbmRpdGlvbik6IHZvaWQge1xuICAgICAgICBmaWx0ZXJDb25kaXRpb24ub2ZmKEZJTFRFUl9DSEFOR0VELCB0aGlzLmhhbmRsZUZpbHRlckNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgaWYgKHRoaXMuYWxsb3dlZEJ5RmlsdGVyLmhhcyhmaWx0ZXJDb25kaXRpb24pKSB7XG4gICAgICAgICAgICB0aGlzLmFsbG93ZWRCeUZpbHRlci5kZWxldGUoZmlsdGVyQ29uZGl0aW9uKTtcbiAgICAgICAgICAgIHRoaXMucmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zKCk7XG5cbiAgICAgICAgICAgIC8vIElmIHdlIHJlbW92ZWQgdGhlIGxhc3QgZmlsdGVyLCB0ZWxsIGNvbnN1bWVycyB0aGF0IHdlJ3ZlIFwidXBkYXRlZFwiIG91ciBmaWx0ZXJlZFxuICAgICAgICAgICAgLy8gdmlldy4gVGhpcyB3aWxsIHRyaWNrIHRoZW0gaW50byBnZXR0aW5nIHRoZSBjb21wbGV0ZSByb29tIGxpc3QuXG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzRmlsdGVycyAmJiAhdGhpcy51cGRhdGVzSW5oaWJpdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KExJU1RfVVBEQVRFRF9FVkVOVCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZUZpbHRlckNoYW5nZSgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWNhbGN1bGF0ZUZpbHRlcmVkUm9vbXMoKTtcblxuICAgICAgICAvLyByZS1lbWl0IHRoZSB1cGRhdGUgc28gdGhlIGxpc3Qgc3RvcmUgY2FuIGZpcmUgYW4gb2ZmLWN5Y2xlIHVwZGF0ZSBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlc0luaGliaXRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmVtaXQoRklMVEVSX0NIQU5HRUQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlU3RpY2t5Um9vbSh2YWw6IFJvb20pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmRvVXBkYXRlU3RpY2t5Um9vbSh2YWwpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5fbGFzdFN0aWNreVJvb20gPSBudWxsOyAvLyBjbGVhciB0byBpbmRpY2F0ZSB3ZSdyZSBkb25lIGNoYW5naW5nXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGRvVXBkYXRlU3RpY2t5Um9vbSh2YWw6IFJvb20pIHtcbiAgICAgICAgLy8gbm8tb3Agc3RpY2t5IHJvb21zIGZvciBzcGFjZXMgLSB0aGV5J3JlIGVmZmVjdGl2ZWx5IHZpcnR1YWwgcm9vbXNcbiAgICAgICAgaWYgKHZhbD8uaXNTcGFjZVJvb20oKSAmJiB2YWwuZ2V0TXlNZW1iZXJzaGlwKCkgIT09IFwiaW52aXRlXCIpIHZhbCA9IG51bGw7XG5cbiAgICAgICAgLy8gTm90ZSB0aHJvdWdob3V0OiBXZSBuZWVkIGFzeW5jIHNvIHdlIGNhbiB3YWl0IGZvciBoYW5kbGVSb29tVXBkYXRlKCkgdG8gZG8gaXRzIHRoaW5nLFxuICAgICAgICAvLyBvdGhlcndpc2Ugd2UgcmlzayBkdXBsaWNhdGluZyByb29tcy5cblxuICAgICAgICBpZiAodmFsICYmICFWaXNpYmlsaXR5UHJvdmlkZXIuaW5zdGFuY2UuaXNSb29tVmlzaWJsZSh2YWwpKSB7XG4gICAgICAgICAgICB2YWwgPSBudWxsOyAvLyB0aGUgcm9vbSBpc24ndCB2aXNpYmxlIC0gbGllIHRvIHRoZSByZXN0IG9mIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgbGFzdCBzdGlja3kgcm9vbSB0byBpbmRpY2F0ZSB0aGF0IHdlJ3JlIGluIGEgY2hhbmdlLiBUaGUgY29kZSB0aHJvdWdob3V0IHRoZVxuICAgICAgICAvLyBjbGFzcyBjYW4gc2FmZWx5IGhhbmRsZSBhIG51bGwgcm9vbSwgc28gdGhpcyBzaG91bGQgYmUgc2FmZSB0byBkbyBhcyBhIGJhY2t1cC5cbiAgICAgICAgdGhpcy5fbGFzdFN0aWNreVJvb20gPSB0aGlzLl9zdGlja3lSb29tIHx8IDxJU3RpY2t5Um9vbT57fTtcblxuICAgICAgICAvLyBJdCdzIHBvc3NpYmxlIHRvIGhhdmUgbm8gc2VsZWN0ZWQgcm9vbS4gSW4gdGhhdCBjYXNlLCBjbGVhciB0aGUgc3RpY2t5IHJvb21cbiAgICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGlja3lSb29tKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RpY2t5Um9vbSA9IHRoaXMuX3N0aWNreVJvb20ucm9vbTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGlja3lSb29tID0gbnVsbDsgLy8gY2xlYXIgYmVmb3JlIHdlIGdvIHRvIHVwZGF0ZSB0aGUgYWxnb3JpdGhtXG5cbiAgICAgICAgICAgICAgICAvLyBMaWUgdG8gdGhlIGFsZ29yaXRobSBhbmQgcmUtYWRkIHRoZSByb29tIHRvIHRoZSBhbGdvcml0aG1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUoc3RpY2t5Um9vbSwgUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gd2UgZG8gaGF2ZSBhIHJvb20gdGhvdWdoLCB3ZSBleHBlY3QgdG8gYmUgYWJsZSB0byBmaW5kIGl0XG4gICAgICAgIGxldCB0YWcgPSB0aGlzLnJvb21JZHNUb1RhZ3NbdmFsLnJvb21JZF0/LlswXTtcbiAgICAgICAgaWYgKCF0YWcpIHRocm93IG5ldyBFcnJvcihgJHt2YWwucm9vbUlkfSBkb2VzIG5vdCBiZWxvbmcgdG8gYSB0YWcgYW5kIGNhbm5vdCBiZSBzdGlja3lgKTtcblxuICAgICAgICAvLyBXZSBzcGVjaWZpY2FsbHkgZG8gTk9UIHVzZSB0aGUgb3JkZXJlZCByb29tcyBzZXQgYXMgaXQgY29udGFpbnMgdGhlIHN0aWNreSByb29tLCB3aGljaFxuICAgICAgICAvLyBtZWFucyB3ZSdsbCBiZSBvZmYgYnkgMSB3aGVuIHRoZSB1c2VyIGlzIHN3aXRjaGluZyByb29tcy4gVGhpcyBsZWFkcyB0byB2aXN1YWwganVtcGluZ1xuICAgICAgICAvLyB3aGVuIHRoZSB1c2VyIGlzIG1vdmluZyBzb3V0aCBpbiB0aGUgbGlzdCAobm90IG5vcnRoLCBiZWNhdXNlIG9mIG1hdGgpLlxuICAgICAgICBjb25zdCB0YWdMaXN0ID0gdGhpcy5nZXRPcmRlcmVkUm9vbXNXaXRob3V0U3RpY2t5KClbdGFnXSB8fCBbXTsgLy8gY2FuIGJlIG51bGwgaWYgZmlsdGVyaW5nXG4gICAgICAgIGxldCBwb3NpdGlvbiA9IHRhZ0xpc3QuaW5kZXhPZih2YWwpO1xuXG4gICAgICAgIC8vIFdlIGRvIHdhbnQgdG8gc2VlIGlmIGEgdGFnIGNoYW5nZSBoYXBwZW5lZCB0aG91Z2ggLSBpZiB0aGlzIGRpZCBoYXBwZW4gdGhlbiB3ZSdsbCB3YW50XG4gICAgICAgIC8vIHRvIGZvcmNlIHRoZSBwb3NpdGlvbiB0byB6ZXJvICh0b3ApIHRvIGVuc3VyZSB3ZSBjYW4gcHJvcGVybHkgaGFuZGxlIGl0LlxuICAgICAgICBjb25zdCB3YXNTdGlja3kgPSB0aGlzLl9sYXN0U3RpY2t5Um9vbS5yb29tID8gdGhpcy5fbGFzdFN0aWNreVJvb20ucm9vbS5yb29tSWQgPT09IHZhbC5yb29tSWQgOiBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuX2xhc3RTdGlja3lSb29tLnRhZyAmJiB0YWcgIT09IHRoaXMuX2xhc3RTdGlja3lSb29tLnRhZyAmJiB3YXNTdGlja3kgJiYgcG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFN0aWNreSByb29tICR7dmFsLnJvb21JZH0gY2hhbmdlZCB0YWdzIGR1cmluZyBzdGlja3kgcm9vbSBoYW5kbGluZ2ApO1xuICAgICAgICAgICAgcG9zaXRpb24gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2FuaXR5IGNoZWNrIHRoZSBwb3NpdGlvbiB0byBtYWtlIHN1cmUgdGhlIHJvb20gaXMgcXVhbGlmaWVkIGZvciBiZWluZyBzdGlja3lcbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMCkgdGhyb3cgbmV3IEVycm9yKGAke3ZhbC5yb29tSWR9IGRvZXMgbm90IGFwcGVhciB0byBiZSBrbm93biBhbmQgY2Fubm90IGJlIHN0aWNreWApO1xuXG4gICAgICAgIC8vIPCfkIkgSGVyZSBiZSBkcmFnb25zLlxuICAgICAgICAvLyBCZWZvcmUgd2UgY2FuIGdvIHRocm91Z2ggd2l0aCBseWluZyB0byB0aGUgdW5kZXJseWluZyBhbGdvcml0aG0gYWJvdXQgYSByb29tXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gZW5zdXJlIHRoYXQgd2hlbiB3ZSBkbyB3ZSdyZSByZWFkeSBmb3IgdGhlIGluZXZpdGFibGUgc3RpY2t5IHJvb21cbiAgICAgICAgLy8gdXBkYXRlIHdlJ2xsIHJlY2VpdmUuIFRvIHByZXBhcmUgZm9yIHRoYXQsIHdlIGZpcnN0IHJlbW92ZSB0aGUgc3RpY2t5IHJvb20gYW5kXG4gICAgICAgIC8vIHJlY2FsY3VsYXRlIHRoZSBzdGF0ZSBvdXJzZWx2ZXMgc28gdGhhdCB3aGVuIHRoZSB1bmRlcmx5aW5nIGFsZ29yaXRobSBjYWxscyBmb3JcbiAgICAgICAgLy8gdGhlIHNhbWUgdGhpbmcgaXQgbm8tb3BzLiBBZnRlciB3ZSdyZSBkb25lIGNhbGxpbmcgdGhlIGFsZ29yaXRobSwgd2UnbGwgaXNzdWVcbiAgICAgICAgLy8gYSBuZXcgdXBkYXRlIGZvciBvdXJzZWx2ZXMuXG4gICAgICAgIGNvbnN0IGxhc3RTdGlja3lSb29tID0gdGhpcy5fc3RpY2t5Um9vbTtcbiAgICAgICAgdGhpcy5fc3RpY2t5Um9vbSA9IG51bGw7IC8vIGNsZWFyIGJlZm9yZSB3ZSB1cGRhdGUgdGhlIGFsZ29yaXRobVxuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSgpO1xuXG4gICAgICAgIC8vIFdoZW4gd2UgZG8gaGF2ZSB0aGUgcm9vbSwgcmUtYWRkIHRoZSBvbGQgcm9vbSAoaWYgbmVlZGVkKSB0byB0aGUgYWxnb3JpdGhtXG4gICAgICAgIC8vIGFuZCByZW1vdmUgdGhlIHN0aWNreSByb29tIGZyb20gdGhlIGFsZ29yaXRobS4gVGhpcyBpcyBzbyB0aGUgdW5kZXJseWluZ1xuICAgICAgICAvLyBhbGdvcml0aG0gZG9lc24ndCB0cnkgYW5kIGNvbmZ1c2UgaXRzZWxmIHdpdGggdGhlIHN0aWNreSByb29tIGNvbmNlcHQuXG4gICAgICAgIC8vIFdlIGRvbid0IGFkZCB0aGUgbmV3IHJvb20gaWYgdGhlIHN0aWNreSByb29tIGlzbid0IGNoYW5naW5nIGJlY2F1c2UgdGhhdCdzXG4gICAgICAgIC8vIGFuIGVhc3kgd2F5IHRvIGNhdXNlIGR1cGxpY2F0aW9uLiBXZSBoYXZlIHRvIGRvIHJvb20gSUQgY2hlY2tzIGluc3RlYWQgb2ZcbiAgICAgICAgLy8gcmVmZXJlbnRpYWwgY2hlY2tzIGFzIHRoZSByZWZlcmVuY2VzIGNhbiBkaWZmZXIgdGhyb3VnaCB0aGUgbGlmZWN5Y2xlLlxuICAgICAgICBpZiAobGFzdFN0aWNreVJvb20gJiYgbGFzdFN0aWNreVJvb20ucm9vbSAmJiBsYXN0U3RpY2t5Um9vbS5yb29tLnJvb21JZCAhPT0gdmFsLnJvb21JZCkge1xuICAgICAgICAgICAgLy8gTGllIHRvIHRoZSBhbGdvcml0aG0gYW5kIHJlLWFkZCB0aGUgcm9vbSB0byB0aGUgYWxnb3JpdGhtXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUobGFzdFN0aWNreVJvb20ucm9vbSwgUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20pO1xuICAgICAgICB9XG4gICAgICAgIC8vIExpZSB0byB0aGUgYWxnb3JpdGhtIGFuZCByZW1vdmUgdGhlIHJvb20gZnJvbSBpdCdzIGZpZWxkIG9mIHZpZXdcbiAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHZhbCwgUm9vbVVwZGF0ZUNhdXNlLlJvb21SZW1vdmVkKTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgdGFnICYgcG9zaXRpb24gY2hhbmdlcyB3aGlsZSB3ZSdyZSBoZXJlLiBXZSBhbHNvIGNoZWNrIHRoZSByb29tIHRvIGVuc3VyZVxuICAgICAgICAvLyBpdCBpcyBzdGlsbCB0aGUgc2FtZSByb29tLlxuICAgICAgICBpZiAodGhpcy5fc3RpY2t5Um9vbSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0aWNreVJvb20ucm9vbSAhPT0gdmFsKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIHJvb20gSURzIGp1c3QgaW4gY2FzZVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zdGlja3lSb29tLnJvb20ucm9vbUlkID09PSB2YWwucm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlN0aWNreSByb29tIGNoYW5nZWQgcmVmZXJlbmNlc1wiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdGlja3kgcm9vbSBjaGFuZ2VkIHdoaWxlIHRoZSBzdGlja3kgcm9vbSB3YXMgY2hhbmdpbmdcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFN0aWNreSByb29tIGNoYW5nZWQgdGFnICYgcG9zaXRpb24gZnJvbSAke3RhZ30gLyAke3Bvc2l0aW9ufSBgXG4gICAgICAgICAgICAgICAgKyBgdG8gJHt0aGlzLl9zdGlja3lSb29tLnRhZ30gLyAke3RoaXMuX3N0aWNreVJvb20ucG9zaXRpb259YCk7XG5cbiAgICAgICAgICAgIHRhZyA9IHRoaXMuX3N0aWNreVJvb20udGFnO1xuICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9zdGlja3lSb29tLnBvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHRoYXQgd2UncmUgZG9uZSBseWluZyB0byB0aGUgYWxnb3JpdGhtLCB3ZSBuZWVkIHRvIHVwZGF0ZSBvdXIgcG9zaXRpb25cbiAgICAgICAgLy8gbWFya2VyIG9ubHkgaWYgdGhlIHVzZXIgaXMgbW92aW5nIGZ1cnRoZXIgZG93biB0aGUgc2FtZSBsaXN0LiBJZiB0aGV5J3JlIHN3aXRjaGluZ1xuICAgICAgICAvLyBsaXN0cywgb3IgbW92aW5nIHVwd2FyZHMsIHRoZSBwb3NpdGlvbiBtYXJrZXIgd2lsbCBzcGxpY2UgaW4ganVzdCBmaW5lIGJ1dCBpZlxuICAgICAgICAvLyB0aGV5IHdlbnQgZG93bndhcmRzIGluIHRoZSBzYW1lIGxpc3Qgd2UnbGwgYmUgb2ZmIGJ5IDEgZHVlIHRvIHRoZSBzaGlmdGluZyByb29tcy5cbiAgICAgICAgaWYgKGxhc3RTdGlja3lSb29tICYmIGxhc3RTdGlja3lSb29tLnRhZyA9PT0gdGFnICYmIGxhc3RTdGlja3lSb29tLnBvc2l0aW9uIDw9IHBvc2l0aW9uKSB7XG4gICAgICAgICAgICBwb3NpdGlvbisrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc3RpY2t5Um9vbSA9IHtcbiAgICAgICAgICAgIHJvb206IHZhbCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICAgICAgICAgIHRhZzogdGFnLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFdlIHVwZGF0ZSB0aGUgZmlsdGVyZWQgcm9vbXMganVzdCBpbiBjYXNlLCBhcyBvdGhlcndpc2UgdXNlcnMgd2lsbCBlbmQgdXAgdmlzaXRpbmdcbiAgICAgICAgLy8gYSByb29tIHdoaWxlIGZpbHRlcmluZyBhbmQgaXQnbGwgZGlzYXBwZWFyLiBXZSBkb24ndCB1cGRhdGUgdGhlIGZpbHRlciBlYXJsaWVyIGluXG4gICAgICAgIC8vIHRoaXMgZnVuY3Rpb24gc2ltcGx5IGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSB0by5cbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUZpbHRlcmVkUm9vbXNGb3JUYWcodGFnKTtcbiAgICAgICAgaWYgKGxhc3RTdGlja3lSb29tICYmIGxhc3RTdGlja3lSb29tLnRhZyAhPT0gdGFnKSB0aGlzLnJlY2FsY3VsYXRlRmlsdGVyZWRSb29tc0ZvclRhZyhsYXN0U3RpY2t5Um9vbS50YWcpO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSgpO1xuXG4gICAgICAgIC8vIEZpbmFsbHksIHRyaWdnZXIgYW4gdXBkYXRlXG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZXNJbmhpYml0ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5lbWl0KExJU1RfVVBEQVRFRF9FVkVOVCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlY2FsY3VsYXRlRmlsdGVyZWRSb29tcygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0ZpbHRlcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUud2FybihcIlJlY2FsY3VsYXRpbmcgZmlsdGVyZWQgcm9vbSBsaXN0XCIpO1xuICAgICAgICBjb25zdCBmaWx0ZXJzID0gQXJyYXkuZnJvbSh0aGlzLmFsbG93ZWRCeUZpbHRlci5rZXlzKCkpO1xuICAgICAgICBjb25zdCBuZXdNYXA6IElUYWdNYXAgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB0YWdJZCBvZiBPYmplY3Qua2V5cyh0aGlzLmNhY2hlZFJvb21zKSkge1xuICAgICAgICAgICAgLy8gQ2hlYXBseSBjbG9uZSB0aGUgcm9vbXMgc28gd2UgY2FuIG1vcmUgZWFzaWx5IGRvIG9wZXJhdGlvbnMgb24gdGhlIGxpc3QuXG4gICAgICAgICAgICAvLyBXZSBvcHRpbWl6ZSBvdXIgbG9va3VwcyBieSB0cnlpbmcgdG8gcmVkdWNlIHNhbXBsZSBzaXplIGFzIG11Y2ggYXMgcG9zc2libGVcbiAgICAgICAgICAgIC8vIHRvIHRoZSByb29tcyB3ZSBrbm93IHdpbGwgYmUgZGVkdXBlZCBieSB0aGUgU2V0LlxuICAgICAgICAgICAgY29uc3Qgcm9vbXMgPSB0aGlzLmNhY2hlZFJvb21zW3RhZ0lkXS5tYXAociA9PiByKTsgLy8gY2hlYXAgY2xvbmVcbiAgICAgICAgICAgIHRoaXMudHJ5SW5zZXJ0U3RpY2t5Um9vbVRvRmlsdGVyU2V0KHJvb21zLCB0YWdJZCk7XG4gICAgICAgICAgICBjb25zdCByZW1haW5pbmdSb29tcyA9IHJvb21zLm1hcChyID0+IHIpO1xuICAgICAgICAgICAgY29uc3QgYWxsb3dlZFJvb21zSW5UaGlzVGFnID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbHRlciBvZiBmaWx0ZXJzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRSb29tcyA9IHJlbWFpbmluZ1Jvb21zLmZpbHRlcihyID0+IGZpbHRlci5pc1Zpc2libGUocikpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiBmaWx0ZXJlZFJvb21zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IHJlbWFpbmluZ1Jvb21zLmluZGV4T2Yocm9vbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZHggPj0gMCkgcmVtYWluaW5nUm9vbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGFsbG93ZWRSb29tc0luVGhpc1RhZy5wdXNoKHJvb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld01hcFt0YWdJZF0gPSBhbGxvd2VkUm9vbXNJblRoaXNUYWc7XG5cbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtERUJVR10gJHtuZXdNYXBbdGFnSWRdLmxlbmd0aH0vJHtyb29tcy5sZW5ndGh9IHJvb21zIGZpbHRlcmVkIGludG8gJHt0YWdJZH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFsbG93ZWRSb29tcyA9IE9iamVjdC52YWx1ZXMobmV3TWFwKS5yZWR1Y2UoKHJ2LCB2KSA9PiB7IHJ2LnB1c2goLi4udik7IHJldHVybiBydjsgfSwgPFJvb21bXT5bXSk7XG4gICAgICAgIHRoaXMuYWxsb3dlZFJvb21zQnlGaWx0ZXJzID0gbmV3IFNldChhbGxvd2VkUm9vbXMpO1xuICAgICAgICB0aGlzLmZpbHRlcmVkUm9vbXMgPSBuZXdNYXA7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZXNJbmhpYml0ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5lbWl0KExJU1RfVVBEQVRFRF9FVkVOVCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlY2FsY3VsYXRlRmlsdGVyZWRSb29tc0ZvclRhZyh0YWdJZDogVGFnSUQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0ZpbHRlcnMpIHJldHVybjsgLy8gZG9uJ3QgYm90aGVyIGRvaW5nIHdvcmsgaWYgdGhlcmUncyBub3RoaW5nIHRvIGRvXG5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgY29uc29sZS5sb2coYFJlY2FsY3VsYXRpbmcgZmlsdGVyZWQgcm9vbXMgZm9yICR7dGFnSWR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHRoaXMuZmlsdGVyZWRSb29tc1t0YWdJZF07XG4gICAgICAgIGNvbnN0IHJvb21zID0gdGhpcy5jYWNoZWRSb29tc1t0YWdJZF0ubWFwKHIgPT4gcik7IC8vIGNoZWFwIGNsb25lXG4gICAgICAgIHRoaXMudHJ5SW5zZXJ0U3RpY2t5Um9vbVRvRmlsdGVyU2V0KHJvb21zLCB0YWdJZCk7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkUm9vbXMgPSByb29tcy5maWx0ZXIociA9PiB0aGlzLmFsbG93ZWRSb29tc0J5RmlsdGVycy5oYXMocikpO1xuICAgICAgICBpZiAoZmlsdGVyZWRSb29tcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmVkUm9vbXNbdGFnSWRdID0gZmlsdGVyZWRSb29tcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbREVCVUddICR7ZmlsdGVyZWRSb29tcy5sZW5ndGh9LyR7cm9vbXMubGVuZ3RofSByb29tcyBmaWx0ZXJlZCBpbnRvICR7dGFnSWR9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgdHJ5SW5zZXJ0U3RpY2t5Um9vbVRvRmlsdGVyU2V0KHJvb21zOiBSb29tW10sIHRhZ0lkOiBUYWdJRCkge1xuICAgICAgICBpZiAoIXRoaXMuX3N0aWNreVJvb20gfHwgIXRoaXMuX3N0aWNreVJvb20ucm9vbSB8fCB0aGlzLl9zdGlja3lSb29tLnRhZyAhPT0gdGFnSWQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuX3N0aWNreVJvb20ucG9zaXRpb247XG4gICAgICAgIGlmIChwb3NpdGlvbiA+PSByb29tcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJvb21zLnB1c2godGhpcy5fc3RpY2t5Um9vbS5yb29tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJvb21zLnNwbGljZShwb3NpdGlvbiwgMCwgdGhpcy5fc3RpY2t5Um9vbS5yb29tKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlY2FsY3VsYXRlIHRoZSBzdGlja3kgcm9vbSBwb3NpdGlvbi4gSWYgdGhpcyBpcyBiZWluZyBjYWxsZWQgaW4gcmVsYXRpb24gdG9cbiAgICAgKiBhIHNwZWNpZmljIHRhZyBiZWluZyB1cGRhdGVkLCBpdCBzaG91bGQgYmUgZ2l2ZW4gdG8gdGhpcyBmdW5jdGlvbiB0byBvcHRpbWl6ZVxuICAgICAqIHRoZSBjYWxsLlxuICAgICAqIEBwYXJhbSB1cGRhdGVkVGFnIFRoZSB0YWcgdGhhdCB3YXMgdXBkYXRlZCwgaWYgcG9zc2libGUuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlY2FsY3VsYXRlU3RpY2t5Um9vbSh1cGRhdGVkVGFnOiBUYWdJRCA9IG51bGwpOiB2b2lkIHtcbiAgICAgICAgLy8g8J+QiSBIZXJlIGJlIGRyYWdvbnMuXG4gICAgICAgIC8vIFRoaXMgZnVuY3Rpb24gZG9lcyBmYXIgdG9vIG11Y2ggZm9yIHdoYXQgaXQgc2hvdWxkLCBhbmQgaXMgY2FsbGVkIGJ5IG1hbnkgcGxhY2VzLlxuICAgICAgICAvLyBOb3Qgb25seSBpcyB0aGlzIHJlc3BvbnNpYmxlIGZvciBlbnN1cmluZyB0aGUgc3RpY2t5IHJvb20gaXMgaGVsZCBpbiBwbGFjZSBhdCBhbGxcbiAgICAgICAgLy8gdGltZXMsIGl0IGlzIGFsc28gcmVzcG9uc2libGUgZm9yIGVuc3VyaW5nIG91ciBjbG9uZSBvZiB0aGUgY2FjaGVkUm9vbXMgaXMgdXAgdG9cbiAgICAgICAgLy8gZGF0ZS4gSWYgZWl0aGVyIG9mIHRoZXNlIGRlc3luY3MsIHdlIHNlZSB3ZWlyZCBiZWhhdmlvdXIgbGlrZSBkdXBsaWNhdGVkIHJvb21zLFxuICAgICAgICAvLyBvdXRkYXRlZCBsaXN0cywgYW5kIG90aGVyIG5vbnNlbnNpY2FsIGlzc3VlcyB0aGF0IGFyZW4ndCBuZWNlc3NhcmlseSBvYnZpb3VzLlxuXG4gICAgICAgIGlmICghdGhpcy5fc3RpY2t5Um9vbSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyBzdGlja3kgcm9vbSwganVzdCBkbyBub3RoaW5nIHVzZWZ1bC5cbiAgICAgICAgICAgIGlmICghIXRoaXMuX2NhY2hlZFN0aWNreVJvb21zKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIGNhY2hlIGlmIHdlIHdvbid0IGJlIG5lZWRpbmcgaXRcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRTdGlja3lSb29tcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudXBkYXRlc0luaGliaXRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChMSVNUX1VQREFURURfRVZFTlQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZWRTdGlja3lSb29tcyB8fCAhdXBkYXRlZFRhZykge1xuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgR2VuZXJhdGluZyBjbG9uZSBvZiBjYWNoZWQgcm9vbXMgZm9yIHN0aWNreSByb29tIGhhbmRsaW5nYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzdGlja2llZFRhZ01hcDogSVRhZ01hcCA9IHt9O1xuICAgICAgICAgICAgZm9yIChjb25zdCB0YWdJZCBvZiBPYmplY3Qua2V5cyh0aGlzLmNhY2hlZFJvb21zKSkge1xuICAgICAgICAgICAgICAgIHN0aWNraWVkVGFnTWFwW3RhZ0lkXSA9IHRoaXMuY2FjaGVkUm9vbXNbdGFnSWRdLm1hcChyID0+IHIpOyAvLyBzaGFsbG93IGNsb25lXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jYWNoZWRTdGlja3lSb29tcyA9IHN0aWNraWVkVGFnTWFwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHVwZGF0ZWRUYWcpIHtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgdGFnIGluZGljYXRlZCBieSB0aGUgY2FsbGVyLCBpZiBwb3NzaWJsZS4gVGhpcyBpcyBtb3N0bHkgdG8gZW5zdXJlXG4gICAgICAgICAgICAvLyBvdXIgY2FjaGUgaXMgdXAgdG8gZGF0ZS5cbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJlcGxhY2luZyBjYWNoZWQgc3RpY2t5IHJvb21zIGZvciAke3VwZGF0ZWRUYWd9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jYWNoZWRTdGlja3lSb29tc1t1cGRhdGVkVGFnXSA9IHRoaXMuY2FjaGVkUm9vbXNbdXBkYXRlZFRhZ10ubWFwKHIgPT4gcik7IC8vIHNoYWxsb3cgY2xvbmVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdyB0cnkgdG8gaW5zZXJ0IHRoZSBzdGlja3kgcm9vbSwgaWYgd2UgbmVlZCB0by5cbiAgICAgICAgLy8gV2UgbmVlZCB0byBpZiB0aGVyZSdzIG5vIHVwZGF0ZWQgdGFnICh3ZSByZWdlbm5lZCB0aGUgd2hvbGUgY2FjaGUpIG9yIGlmIHRoZSB0YWdcbiAgICAgICAgLy8gd2UgbWlnaHQgaGF2ZSB1cGRhdGVkIGZyb20gdGhlIGNhY2hlIGlzIGFsc28gb3VyIHN0aWNreSByb29tLlxuICAgICAgICBjb25zdCBzdGlja3kgPSB0aGlzLl9zdGlja3lSb29tO1xuICAgICAgICBpZiAoIXVwZGF0ZWRUYWcgfHwgdXBkYXRlZFRhZyA9PT0gc3RpY2t5LnRhZykge1xuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYEluc2VydGluZyBzdGlja3kgcm9vbSAke3N0aWNreS5yb29tLnJvb21JZH0gYXQgcG9zaXRpb24gJHtzdGlja3kucG9zaXRpb259IGluICR7c3RpY2t5LnRhZ31gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jYWNoZWRTdGlja3lSb29tc1tzdGlja3kudGFnXS5zcGxpY2Uoc3RpY2t5LnBvc2l0aW9uLCAwLCBzdGlja3kucm9vbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCB0cmlnZ2VyIGFuIHVwZGF0ZVxuICAgICAgICBpZiAodGhpcy51cGRhdGVzSW5oaWJpdGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuZW1pdChMSVNUX1VQREFURURfRVZFTlQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFza3MgdGhlIEFsZ29yaXRobSB0byByZWdlbmVyYXRlIGFsbCBsaXN0cywgdXNpbmcgdGhlIHRhZ3MgZ2l2ZW5cbiAgICAgKiBhcyByZWZlcmVuY2UgZm9yIHdoaWNoIGxpc3RzIHRvIGdlbmVyYXRlIGFuZCB3aGljaCB3YXkgdG8gZ2VuZXJhdGVcbiAgICAgKiB0aGVtLlxuICAgICAqIEBwYXJhbSB7SVRhZ1NvcnRpbmdNYXB9IHRhZ1NvcnRpbmdNYXAgVGhlIHRhZ3MgdG8gZ2VuZXJhdGUuXG4gICAgICogQHBhcmFtIHtJTGlzdE9yZGVyaW5nTWFwfSBsaXN0T3JkZXJpbmdNYXAgVGhlIG9yZGVyaW5nIG9mIHRob3NlIHRhZ3MuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Kj59IEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIGNvbXBsZXRlLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBwb3B1bGF0ZVRhZ3ModGFnU29ydGluZ01hcDogSVRhZ1NvcnRpbmdNYXAsIGxpc3RPcmRlcmluZ01hcDogSUxpc3RPcmRlcmluZ01hcCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICghdGFnU29ydGluZ01hcCkgdGhyb3cgbmV3IEVycm9yKGBTb3J0aW5nIG1hcCBjYW5ub3QgYmUgbnVsbCBvciBlbXB0eWApO1xuICAgICAgICBpZiAoIWxpc3RPcmRlcmluZ01hcCkgdGhyb3cgbmV3IEVycm9yKGBPcmRlcmluZyBtYSBjYW5ub3QgYmUgbnVsbCBvciBlbXB0eWApO1xuICAgICAgICBpZiAoYXJyYXlIYXNEaWZmKE9iamVjdC5rZXlzKHRhZ1NvcnRpbmdNYXApLCBPYmplY3Qua2V5cyhsaXN0T3JkZXJpbmdNYXApKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCb3RoIG1hcHMgbXVzdCBjb250YWluIHRoZSBleGFjdCBzYW1lIHRhZ3NgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNvcnRBbGdvcml0aG1zID0gdGFnU29ydGluZ01hcDtcbiAgICAgICAgdGhpcy5saXN0QWxnb3JpdGhtcyA9IGxpc3RPcmRlcmluZ01hcDtcbiAgICAgICAgdGhpcy5hbGdvcml0aG1zID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdGFnIG9mIE9iamVjdC5rZXlzKHRhZ1NvcnRpbmdNYXApKSB7XG4gICAgICAgICAgICB0aGlzLmFsZ29yaXRobXNbdGFnXSA9IGdldExpc3RBbGdvcml0aG1JbnN0YW5jZSh0aGlzLmxpc3RBbGdvcml0aG1zW3RhZ10sIHRhZywgdGhpcy5zb3J0QWxnb3JpdGhtc1t0YWddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZXRLbm93blJvb21zKHRoaXMucm9vbXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYW4gb3JkZXJlZCBzZXQgb2Ygcm9vbXMgZm9yIHRoZSBhbGwga25vd24gdGFncywgZmlsdGVyZWQuXG4gICAgICogQHJldHVybnMge0lUYWdNYXB9IFRoZSBjYWNoZWQgbGlzdCBvZiByb29tcywgb3JkZXJlZCxcbiAgICAgKiBmb3IgZWFjaCB0YWcuIE1heSBiZSBlbXB0eSwgYnV0IG5ldmVyIG51bGwvdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRPcmRlcmVkUm9vbXMoKTogSVRhZ01hcCB7XG4gICAgICAgIGlmICghdGhpcy5oYXNGaWx0ZXJzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkU3RpY2t5Um9vbXMgfHwgdGhpcy5jYWNoZWRSb29tcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJlZFJvb21zO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRVbmZpbHRlcmVkUm9vbXMoKTogSVRhZ01hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRTdGlja3lSb29tcyB8fCB0aGlzLmNhY2hlZFJvb21zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgcmV0dXJucyB0aGUgc2FtZSBhcyBnZXRPcmRlcmVkUm9vbXMoKSwgYnV0IHdpdGhvdXQgdGhlIHN0aWNreSByb29tXG4gICAgICogbWFwIGFzIGl0IGNhdXNlcyBpc3N1ZXMgZm9yIHN0aWNreSByb29tIGhhbmRsaW5nIChzZWUgc3RpY2t5IHJvb20gaGFuZGxpbmdcbiAgICAgKiBmb3IgbW9yZSBpbmZvcm1hdGlvbikuXG4gICAgICogQHJldHVybnMge0lUYWdNYXB9IFRoZSBjYWNoZWQgbGlzdCBvZiByb29tcywgb3JkZXJlZCxcbiAgICAgKiBmb3IgZWFjaCB0YWcuIE1heSBiZSBlbXB0eSwgYnV0IG5ldmVyIG51bGwvdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0T3JkZXJlZFJvb21zV2l0aG91dFN0aWNreSgpOiBJVGFnTWFwIHtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0ZpbHRlcnMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZFJvb21zO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlcmVkUm9vbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VlZHMgdGhlIEFsZ29yaXRobSB3aXRoIGEgc2V0IG9mIHJvb21zLiBUaGUgYWxnb3JpdGhtIHdpbGwgZGlzY2FyZCBhbGxcbiAgICAgKiBwcmV2aW91c2x5IGtub3duIGluZm9ybWF0aW9uIGFuZCBpbnN0ZWFkIHVzZSB0aGVzZSByb29tcyBpbnN0ZWFkLlxuICAgICAqIEBwYXJhbSB7Um9vbVtdfSByb29tcyBUaGUgcm9vbXMgdG8gZm9yY2UgdGhlIGFsZ29yaXRobSB0byB1c2UuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Kj59IEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIGNvbXBsZXRlLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBzZXRLbm93blJvb21zKHJvb21zOiBSb29tW10pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQocm9vbXMpKSB0aHJvdyBuZXcgRXJyb3IoYEFycmF5IG9mIHJvb21zIGNhbm5vdCBiZSBudWxsYCk7XG4gICAgICAgIGlmICghdGhpcy5zb3J0QWxnb3JpdGhtcykgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc2V0IGtub3duIHJvb21zIHdpdGhvdXQgYSB0YWcgc29ydGluZyBtYXBgKTtcblxuICAgICAgICBpZiAoIXRoaXMudXBkYXRlc0luaGliaXRlZCkge1xuICAgICAgICAgICAgLy8gV2Ugb25seSBsb2cgdGhpcyBpZiB3ZSdyZSBleHBlY3RpbmcgdG8gYmUgcHVibGlzaGluZyB1cGRhdGVzLCB3aGljaCBtZWFucyB0aGF0XG4gICAgICAgICAgICAvLyB0aGlzIGNvdWxkIGJlIGFuIHVuZXhwZWN0ZWQgaW52b2NhdGlvbi4gSWYgd2UncmUgaW5oaWJpdGVkLCB0aGVuIHRoaXMgaXMgcHJvYmFibHlcbiAgICAgICAgICAgIC8vIGFuIGludGVudGlvbmFsIGludm9jYXRpb24uXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJSZXNldHRpbmcga25vd24gcm9vbXMsIGluaXRpYXRpbmcgcmVnZW5lcmF0aW9uXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmVmb3JlIHdlIGdvIGFueSBmdXJ0aGVyIHdlIG5lZWQgdG8gY2xlYXIgKGJ1dCByZW1lbWJlcikgdGhlIHN0aWNreSByb29tIHRvXG4gICAgICAgIC8vIGF2b2lkIGFjY2lkZW50YWxseSBkdXBsaWNhdGluZyBpdCBpbiB0aGUgbGlzdC5cbiAgICAgICAgY29uc3Qgb2xkU3RpY2t5Um9vbSA9IHRoaXMuX3N0aWNreVJvb207XG4gICAgICAgIGF3YWl0IHRoaXMudXBkYXRlU3RpY2t5Um9vbShudWxsKTtcblxuICAgICAgICB0aGlzLnJvb21zID0gcm9vbXM7XG5cbiAgICAgICAgY29uc3QgbmV3VGFnczogSVRhZ01hcCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHRhZ0lkIGluIHRoaXMuc29ydEFsZ29yaXRobXMpIHtcbiAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU1VuZmlsdGVyZWRGb3JJbkxvb3BcbiAgICAgICAgICAgIG5ld1RhZ3NbdGFnSWRdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSBjYW4gYXZvaWQgZG9pbmcgd29yaywgZG8gc28uXG4gICAgICAgIGlmICghcm9vbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmdlbmVyYXRlRnJlc2hUYWdzKG5ld1RhZ3MpOyAvLyBqdXN0IGluIGNhc2UgaXQgd2FudHMgdG8gZG8gc29tZXRoaW5nXG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJvb21zID0gbmV3VGFncztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNwbGl0IG91dCB0aGUgZWFzeSByb29tcyBmaXJzdCAobGVhdmUgYW5kIGludml0ZSlcbiAgICAgICAgY29uc3QgbWVtYmVyc2hpcHMgPSBzcGxpdFJvb21zQnlNZW1iZXJzaGlwKHJvb21zKTtcbiAgICAgICAgZm9yIChjb25zdCByb29tIG9mIG1lbWJlcnNoaXBzW0VmZmVjdGl2ZU1lbWJlcnNoaXAuSW52aXRlXSkge1xuICAgICAgICAgICAgbmV3VGFnc1tEZWZhdWx0VGFnSUQuSW52aXRlXS5wdXNoKHJvb20pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiBtZW1iZXJzaGlwc1tFZmZlY3RpdmVNZW1iZXJzaGlwLkxlYXZlXSkge1xuICAgICAgICAgICAgbmV3VGFnc1tEZWZhdWx0VGFnSUQuQXJjaGl2ZWRdLnB1c2gocm9vbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3cgcHJvY2VzcyBhbGwgdGhlIGpvaW5lZCByb29tcy4gVGhpcyBpcyBhIGJpdCBtb3JlIGNvbXBsaWNhdGVkXG4gICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiBtZW1iZXJzaGlwc1tFZmZlY3RpdmVNZW1iZXJzaGlwLkpvaW5dKSB7XG4gICAgICAgICAgICBjb25zdCB0YWdzID0gdGhpcy5nZXRUYWdzT2ZKb2luZWRSb29tKHJvb20pO1xuXG4gICAgICAgICAgICBsZXQgaW5UYWcgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQobmV3VGFnc1t0YWddKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VGFnc1t0YWddLnB1c2gocm9vbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpblRhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaW5UYWcpIHtcbiAgICAgICAgICAgICAgICBpZiAoRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVzZXJJZEZvclJvb21JZChyb29tLnJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VGFnc1tEZWZhdWx0VGFnSUQuRE1dLnB1c2gocm9vbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VGFnc1tEZWZhdWx0VGFnSUQuVW50YWdnZWRdLnB1c2gocm9vbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5nZW5lcmF0ZUZyZXNoVGFncyhuZXdUYWdzKTtcblxuICAgICAgICB0aGlzLmNhY2hlZFJvb21zID0gbmV3VGFncztcbiAgICAgICAgdGhpcy51cGRhdGVUYWdzRnJvbUNhY2hlKCk7XG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zKCk7XG5cbiAgICAgICAgLy8gTm93IHRoYXQgd2UndmUgZmluaXNoZWQgZ2VuZXJhdGlvbiwgd2UgbmVlZCB0byB1cGRhdGUgdGhlIHN0aWNreSByb29tIHRvIHdoYXRcbiAgICAgICAgLy8gaXQgd2FzLiBJdCdzIGVudGlyZWx5IHBvc3NpYmxlIHRoYXQgaXQgY2hhbmdlZCBsaXN0cyB0aG91Z2gsIHNvIGlmIGl0IGRpZCB0aGVuXG4gICAgICAgIC8vIHdlIGFsc28gaGF2ZSB0byB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIGl0LlxuICAgICAgICBpZiAob2xkU3RpY2t5Um9vbSAmJiBvbGRTdGlja3lSb29tLnJvb20pIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMudXBkYXRlU3RpY2t5Um9vbShvbGRTdGlja3lSb29tLnJvb20pO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0aWNreVJvb20gJiYgdGhpcy5fc3RpY2t5Um9vbS5yb29tKSB7IC8vIGp1c3QgaW4gY2FzZSB0aGUgdXBkYXRlIGRvZXNuJ3QgZ28gYWNjb3JkaW5nIHRvIHBsYW5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3RpY2t5Um9vbS50YWcgIT09IG9sZFN0aWNreVJvb20udGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHB1dCB0aGUgc3RpY2t5IHJvb20gYXQgdGhlIHRvcCBvZiB0aGUgbGlzdCB0byB0cmVhdCBpdCBhcyBhbiBvYnZpb3VzIHRhZyBjaGFuZ2UuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNreVJvb20ucG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSh0aGlzLl9zdGlja3lSb29tLnRhZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFRhZ3NGb3JSb29tKHJvb206IFJvb20pOiBUYWdJRFtdIHtcbiAgICAgICAgY29uc3QgdGFnczogVGFnSURbXSA9IFtdO1xuXG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXAgPSBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwKHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkpO1xuICAgICAgICBpZiAobWVtYmVyc2hpcCA9PT0gRWZmZWN0aXZlTWVtYmVyc2hpcC5JbnZpdGUpIHtcbiAgICAgICAgICAgIHRhZ3MucHVzaChEZWZhdWx0VGFnSUQuSW52aXRlKTtcbiAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzaGlwID09PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkxlYXZlKSB7XG4gICAgICAgICAgICB0YWdzLnB1c2goRGVmYXVsdFRhZ0lELkFyY2hpdmVkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhZ3MucHVzaCguLi50aGlzLmdldFRhZ3NPZkpvaW5lZFJvb20ocm9vbSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0YWdzLmxlbmd0aCkgdGFncy5wdXNoKERlZmF1bHRUYWdJRC5VbnRhZ2dlZCk7XG5cbiAgICAgICAgcmV0dXJuIHRhZ3M7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUYWdzT2ZKb2luZWRSb29tKHJvb206IFJvb20pOiBUYWdJRFtdIHtcbiAgICAgICAgbGV0IHRhZ3MgPSBPYmplY3Qua2V5cyhyb29tLnRhZ3MgfHwge30pO1xuXG4gICAgICAgIGlmICh0YWdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIGl0J3MgYSBETSBpZiBpdCBpc24ndCBhbnl0aGluZyBlbHNlXG4gICAgICAgICAgICBpZiAoRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVzZXJJZEZvclJvb21JZChyb29tLnJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICB0YWdzID0gW0RlZmF1bHRUYWdJRC5ETV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSByb29tc1RvVGFncyBtYXBcbiAgICAgKi9cbiAgICBwcml2YXRlIHVwZGF0ZVRhZ3NGcm9tQ2FjaGUoKSB7XG4gICAgICAgIGNvbnN0IG5ld01hcCA9IHt9O1xuXG4gICAgICAgIGNvbnN0IHRhZ3MgPSBPYmplY3Qua2V5cyh0aGlzLmNhY2hlZFJvb21zKTtcbiAgICAgICAgZm9yIChjb25zdCB0YWdJZCBvZiB0YWdzKSB7XG4gICAgICAgICAgICBjb25zdCByb29tcyA9IHRoaXMuY2FjaGVkUm9vbXNbdGFnSWRdO1xuICAgICAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHJvb21zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdNYXBbcm9vbS5yb29tSWRdKSBuZXdNYXBbcm9vbS5yb29tSWRdID0gW107XG4gICAgICAgICAgICAgICAgbmV3TWFwW3Jvb20ucm9vbUlkXS5wdXNoKHRhZ0lkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucm9vbUlkc1RvVGFncyA9IG5ld01hcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgQWxnb3JpdGhtIGJlbGlldmVzIGEgY29tcGxldGUgcmVnZW5lcmF0aW9uIG9mIHRoZSBleGlzdGluZ1xuICAgICAqIGxpc3RzIGlzIG5lZWRlZC5cbiAgICAgKiBAcGFyYW0ge0lUYWdNYXB9IHVwZGF0ZWRUYWdNYXAgVGhlIHRhZyBtYXAgd2hpY2ggbmVlZHMgcG9wdWxhdGluZy4gRWFjaCB0YWdcbiAgICAgKiB3aWxsIGFscmVhZHkgaGF2ZSB0aGUgcm9vbXMgd2hpY2ggYmVsb25nIHRvIGl0IC0gdGhleSBqdXN0IG5lZWQgb3JkZXJpbmcuIE11c3RcbiAgICAgKiBiZSBtdXRhdGVkIGluIHBsYWNlLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPCo+fSBBIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2hlbiBjb21wbGV0ZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGdlbmVyYXRlRnJlc2hUYWdzKHVwZGF0ZWRUYWdNYXA6IElUYWdNYXApOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAoIXRoaXMuYWxnb3JpdGhtcykgdGhyb3cgbmV3IEVycm9yKFwiTm90IHJlYWR5OiBubyBhbGdvcml0aG1zIHRvIGRldGVybWluZSB0YWdzIGZyb21cIik7XG5cbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgT2JqZWN0LmtleXModXBkYXRlZFRhZ01hcCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsZ29yaXRobTogT3JkZXJpbmdBbGdvcml0aG0gPSB0aGlzLmFsZ29yaXRobXNbdGFnXTtcbiAgICAgICAgICAgIGlmICghYWxnb3JpdGhtKSB0aHJvdyBuZXcgRXJyb3IoYE5vIGFsZ29yaXRobSBmb3IgJHt0YWd9YCk7XG5cbiAgICAgICAgICAgIGF3YWl0IGFsZ29yaXRobS5zZXRSb29tcyh1cGRhdGVkVGFnTWFwW3RhZ10pO1xuICAgICAgICAgICAgdXBkYXRlZFRhZ01hcFt0YWddID0gYWxnb3JpdGhtLm9yZGVyZWRSb29tcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFza3MgdGhlIEFsZ29yaXRobSB0byB1cGRhdGUgaXRzIGtub3dsZWRnZSBvZiBhIHJvb20uIEZvciBleGFtcGxlLCB3aGVuXG4gICAgICogYSB1c2VyIHRhZ3MgYSByb29tLCBqb2lucy9jcmVhdGVzIGEgcm9vbSwgb3IgbGVhdmVzIGEgcm9vbSB0aGUgQWxnb3JpdGhtXG4gICAgICogc2hvdWxkIGJlIHRvbGQgdGhhdCB0aGUgcm9vbSdzIGluZm8gbWlnaHQgaGF2ZSBjaGFuZ2VkLiBUaGUgQWxnb3JpdGhtXG4gICAgICogbWF5IG5vLW9wIHRoaXMgcmVxdWVzdCBpZiBubyBjaGFuZ2VzIGFyZSByZXF1aXJlZC5cbiAgICAgKiBAcGFyYW0ge1Jvb219IHJvb20gVGhlIHJvb20gd2hpY2ggbWlnaHQgaGF2ZSBhZmZlY3RlZCBzb3J0aW5nLlxuICAgICAqIEBwYXJhbSB7Um9vbVVwZGF0ZUNhdXNlfSBjYXVzZSBUaGUgcmVhc29uIGZvciB0aGUgdXBkYXRlIGJlaW5nIHRyaWdnZXJlZC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gQSBwcm9taXNlIHdoaWNoIHJlc29sdmUgdG8gdHJ1ZSBvciBmYWxzZVxuICAgICAqIGRlcGVuZGluZyBvbiB3aGV0aGVyIG9yIG5vdCBnZXRPcmRlcmVkUm9vbXMoKSBzaG91bGQgYmUgY2FsbGVkIGFmdGVyXG4gICAgICogcHJvY2Vzc2luZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgaGFuZGxlUm9vbVVwZGF0ZShyb29tOiBSb29tLCBjYXVzZTogUm9vbVVwZGF0ZUNhdXNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBIYW5kbGUgcm9vbSB1cGRhdGUgZm9yICR7cm9vbS5yb29tSWR9IGNhbGxlZCB3aXRoIGNhdXNlICR7Y2F1c2V9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmFsZ29yaXRobXMpIHRocm93IG5ldyBFcnJvcihcIk5vdCByZWFkeTogbm8gYWxnb3JpdGhtcyB0byBkZXRlcm1pbmUgdGFncyBmcm9tXCIpO1xuXG4gICAgICAgIC8vIE5vdGU6IGNoZWNrIHRoZSBpc1N0aWNreSBhZ2FpbnN0IHRoZSByb29tIElEIGp1c3QgaW4gY2FzZSB0aGUgcmVmZXJlbmNlIGlzIHdyb25nXG4gICAgICAgIGNvbnN0IGlzU3RpY2t5ID0gdGhpcy5fc3RpY2t5Um9vbSAmJiB0aGlzLl9zdGlja3lSb29tLnJvb20gJiYgdGhpcy5fc3RpY2t5Um9vbS5yb29tLnJvb21JZCA9PT0gcm9vbS5yb29tSWQ7XG4gICAgICAgIGlmIChjYXVzZSA9PT0gUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20pIHtcbiAgICAgICAgICAgIGNvbnN0IGlzRm9yTGFzdFN0aWNreSA9IHRoaXMuX2xhc3RTdGlja3lSb29tICYmIHRoaXMuX2xhc3RTdGlja3lSb29tLnJvb20gPT09IHJvb207XG4gICAgICAgICAgICBjb25zdCByb29tVGFncyA9IHRoaXMucm9vbUlkc1RvVGFnc1tyb29tLnJvb21JZF07XG4gICAgICAgICAgICBjb25zdCBoYXNUYWdzID0gcm9vbVRhZ3MgJiYgcm9vbVRhZ3MubGVuZ3RoID4gMDtcblxuICAgICAgICAgICAgLy8gRG9uJ3QgY2hhbmdlIHRoZSBjYXVzZSBpZiB0aGUgbGFzdCBzdGlja3kgcm9vbSBpcyBiZWluZyByZS1hZGRlZC4gSWYgd2UgZmFpbCB0b1xuICAgICAgICAgICAgLy8gcGFzcyB0aGUgY2F1c2UgdGhyb3VnaCBhcyBOZXdSb29tLCB3ZSdsbCBmYWlsIHRvIGxpZSB0byB0aGUgYWxnb3JpdGhtIGFuZCB0aHVzXG4gICAgICAgICAgICAvLyBsb3NlIHRoZSByb29tLlxuICAgICAgICAgICAgaWYgKGhhc1RhZ3MgJiYgIWlzRm9yTGFzdFN0aWNreSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtyb29tLnJvb21JZH0gaXMgcmVwb3J0ZWRseSBuZXcgYnV0IGlzIGFscmVhZHkga25vd24gLSBhc3N1bWluZyBUYWdDaGFuZ2UgaW5zdGVhZGApO1xuICAgICAgICAgICAgICAgIGNhdXNlID0gUm9vbVVwZGF0ZUNhdXNlLlBvc3NpYmxlVGFnQ2hhbmdlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIHJvb20gaXMga25vd24gZmlyc3RcbiAgICAgICAgICAgIGxldCBrbm93blJvb21SZWYgPSB0aGlzLnJvb21zLmluY2x1ZGVzKHJvb20pO1xuICAgICAgICAgICAgaWYgKGhhc1RhZ3MgJiYgIWtub3duUm9vbVJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtyb29tLnJvb21JZH0gbWlnaHQgYmUgYSByZWZlcmVuY2UgY2hhbmdlIC0gYXR0ZW1wdGluZyB0byB1cGRhdGUgcmVmZXJlbmNlYCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb29tcyA9IHRoaXMucm9vbXMubWFwKHIgPT4gci5yb29tSWQgPT09IHJvb20ucm9vbUlkID8gcm9vbSA6IHIpO1xuICAgICAgICAgICAgICAgIGtub3duUm9vbVJlZiA9IHRoaXMucm9vbXMuaW5jbHVkZXMocm9vbSk7XG4gICAgICAgICAgICAgICAgaWYgKCFrbm93blJvb21SZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGAke3Jvb20ucm9vbUlkfSBpcyBzdGlsbCBub3QgcmVmZXJlbmNlZC4gSXQgbWF5IGJlIHN0aWNreS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgdGFncyBmb3IgYSByb29tIGFuZCBkb24ndCBoYXZlIHRoZSByb29tIHJlZmVyZW5jZWQsIHNvbWV0aGluZyB3ZW50IGhvcnJpYmx5XG4gICAgICAgICAgICAvLyB3cm9uZyAtIHRoZSByZWZlcmVuY2Ugc2hvdWxkIGhhdmUgYmVlbiB1cGRhdGVkIGFib3ZlLlxuICAgICAgICAgICAgaWYgKGhhc1RhZ3MgJiYgIWtub3duUm9vbVJlZiAmJiAhaXNTdGlja3kpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cm9vbS5yb29tSWR9IGlzIG1pc3NpbmcgZnJvbSByb29tIGFycmF5IGJ1dCBpcyBrbm93biAtIHRyeWluZyB0byBmaW5kIGR1cGxpY2F0ZWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMaWtlIGFib3ZlLCB1cGRhdGUgdGhlIHJlZmVyZW5jZSB0byB0aGUgc3RpY2t5IHJvb20gaWYgd2UgbmVlZCB0b1xuICAgICAgICAgICAgaWYgKGhhc1RhZ3MgJiYgaXNTdGlja3kpIHtcbiAgICAgICAgICAgICAgICAvLyBHbyBkaXJlY3RseSBpbiBhbmQgc2V0IHRoZSBzdGlja3kgcm9vbSdzIG5ldyByZWZlcmVuY2UsIGJlaW5nIGNhcmVmdWwgbm90XG4gICAgICAgICAgICAgICAgLy8gdG8gdHJpZ2dlciBhIHN0aWNreSByb29tIHVwZGF0ZSBvdXJzZWx2ZXMuXG4gICAgICAgICAgICAgICAgdGhpcy5fc3RpY2t5Um9vbS5yb29tID0gcm9vbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgYWZ0ZXIgYWxsIHRoYXQgd2UncmUgc3RpbGwgYSBOZXdSb29tIHVwZGF0ZSwgYWRkIHRoZSByb29tIGlmIGFwcGxpY2FibGUuXG4gICAgICAgICAgICAvLyBXZSBkb24ndCBkbyB0aGlzIGZvciB0aGUgc3RpY2t5IHJvb20gKGJlY2F1c2UgaXQgY2F1c2VzIGR1cGxpY2F0aW9uIGlzc3VlcylcbiAgICAgICAgICAgIC8vIG9yIGlmIHdlIGtub3cgYWJvdXQgdGhlIHJlZmVyZW5jZSAoYXMgaXQgc2hvdWxkIGJlIHJlcGxhY2VkKS5cbiAgICAgICAgICAgIGlmIChjYXVzZSA9PT0gUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20gJiYgIWlzU3RpY2t5ICYmICFrbm93blJvb21SZWYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21zLnB1c2gocm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGlkVGFnQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgIGlmIChjYXVzZSA9PT0gUm9vbVVwZGF0ZUNhdXNlLlBvc3NpYmxlVGFnQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBvbGRUYWdzID0gdGhpcy5yb29tSWRzVG9UYWdzW3Jvb20ucm9vbUlkXSB8fCBbXTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1RhZ3MgPSB0aGlzLmdldFRhZ3NGb3JSb29tKHJvb20pO1xuICAgICAgICAgICAgY29uc3QgZGlmZiA9IGFycmF5RGlmZihvbGRUYWdzLCBuZXdUYWdzKTtcbiAgICAgICAgICAgIGlmIChkaWZmLnJlbW92ZWQubGVuZ3RoID4gMCB8fCBkaWZmLmFkZGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJtVGFnIG9mIGRpZmYucmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVtb3ZpbmcgJHtyb29tLnJvb21JZH0gZnJvbSAke3JtVGFnfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFsZ29yaXRobTogT3JkZXJpbmdBbGdvcml0aG0gPSB0aGlzLmFsZ29yaXRobXNbcm1UYWddO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFsZ29yaXRobSkgdGhyb3cgbmV3IEVycm9yKGBObyBhbGdvcml0aG0gZm9yICR7cm1UYWd9YCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGFsZ29yaXRobS5oYW5kbGVSb29tVXBkYXRlKHJvb20sIFJvb21VcGRhdGVDYXVzZS5Sb29tUmVtb3ZlZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlZFJvb21zW3JtVGFnXSA9IGFsZ29yaXRobS5vcmRlcmVkUm9vbXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zRm9yVGFnKHJtVGFnKTsgLy8gdXBkYXRlIGZpbHRlciB0byByZS1zb3J0IHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVjYWxjdWxhdGVTdGlja3lSb29tKHJtVGFnKTsgLy8gdXBkYXRlIHN0aWNreSByb29tIHRvIG1ha2Ugc3VyZSBpdCBtb3ZlcyBpZiBuZWVkZWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhZGRUYWcgb2YgZGlmZi5hZGRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQWRkaW5nICR7cm9vbS5yb29tSWR9IHRvICR7YWRkVGFnfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFsZ29yaXRobTogT3JkZXJpbmdBbGdvcml0aG0gPSB0aGlzLmFsZ29yaXRobXNbYWRkVGFnXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhbGdvcml0aG0pIHRocm93IG5ldyBFcnJvcihgTm8gYWxnb3JpdGhtIGZvciAke2FkZFRhZ31gKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYWxnb3JpdGhtLmhhbmRsZVJvb21VcGRhdGUocm9vbSwgUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRSb29tc1thZGRUYWddID0gYWxnb3JpdGhtLm9yZGVyZWRSb29tcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHRhZyBtYXAgc28gd2UgZG9uJ3QgcmVnZW4gaXQgaW4gYSBtb21lbnRcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21JZHNUb1RhZ3Nbcm9vbS5yb29tSWRdID0gbmV3VGFncztcblxuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2hhbmdpbmcgdXBkYXRlIGNhdXNlIGZvciAke3Jvb20ucm9vbUlkfSB0byBUaW1lbGluZSB0byBzb3J0IHJvb21zYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdXNlID0gUm9vbVVwZGF0ZUNhdXNlLlRpbWVsaW5lO1xuICAgICAgICAgICAgICAgIGRpZFRhZ0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVjZWl2ZWQgbm8tb3AgdXBkYXRlIGZvciAke3Jvb20ucm9vbUlkfSAtIGNoYW5naW5nIHRvIFRpbWVsaW5lIHVwZGF0ZWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXVzZSA9IFJvb21VcGRhdGVDYXVzZS5UaW1lbGluZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRpZFRhZ0NoYW5nZSAmJiBpc1N0aWNreSkge1xuICAgICAgICAgICAgICAgIC8vIE1hbnVhbGx5IHVwZGF0ZSB0aGUgdGFnIGZvciB0aGUgc3RpY2t5IHJvb20gd2l0aG91dCB0cmlnZ2VyaW5nIGEgc3RpY2t5IHJvb21cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUuIFRoZSB1cGRhdGUgd2lsbCBiZSBoYW5kbGVkIGltcGxpY2l0bHkgYnkgdGhlIHN0aWNreSByb29tIGhhbmRsaW5nIGFuZFxuICAgICAgICAgICAgICAgIC8vIHJlcXVpcmVzIG5vIGNoYW5nZXMgb24gb3VyIHBhcnQsIGlmIHdlJ3JlIGluIHRoZSBtaWRkbGUgb2YgYSBzdGlja3kgcm9vbSBjaGFuZ2UuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2xhc3RTdGlja3lSb29tKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNreVJvb20gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiB0aGlzLnJvb21JZHNUb1RhZ3Nbcm9vbS5yb29tSWRdWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IDAsIC8vIHJpZ2h0IGF0IHRoZSB0b3AgYXMgaXQgY2hhbmdlZCB0YWdzXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSB0byBjbGVhciB0aGUgbG9jayBhcyB0aGUgc3RpY2t5IHJvb20gY2hhbmdlIHdpbGwgdHJpZ2dlciB1cGRhdGVzLlxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNldFN0aWNreVJvb20ocm9vbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHVwZGF0ZSBpcyBmb3IgYSByb29tIGNoYW5nZSB3aGljaCBtaWdodCBiZSB0aGUgc3RpY2t5IHJvb20sIHByZXZlbnQgaXQuIFdlXG4gICAgICAgIC8vIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGNhdXNlcyAoTmV3Um9vbSBhbmQgUm9vbVJlbW92ZWQpIGFyZSBzdGlsbCB0cmlnZ2VyZWQgdGhvdWdoXG4gICAgICAgIC8vIGFzIHRoZSBzdGlja3kgcm9vbSByZWxpZXMgb24gdGhpcy5cbiAgICAgICAgaWYgKGNhdXNlICE9PSBSb29tVXBkYXRlQ2F1c2UuTmV3Um9vbSAmJiBjYXVzZSAhPT0gUm9vbVVwZGF0ZUNhdXNlLlJvb21SZW1vdmVkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGlja3lSb29tID09PSByb29tKSB7XG4gICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1Jvb21MaXN0RGVidWddIFJlY2VpdmVkICR7Y2F1c2V9IHVwZGF0ZSBmb3Igc3RpY2t5IHJvb20gJHtyb29tLnJvb21JZH0gLSBpZ25vcmluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMucm9vbUlkc1RvVGFnc1tyb29tLnJvb21JZF0pIHtcbiAgICAgICAgICAgIGlmIChDQVVTRVNfUkVRVUlSSU5HX1JPT00uaW5jbHVkZXMoY2F1c2UpKSB7XG4gICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgU2tpcHBpbmcgdGFnIHVwZGF0ZSBmb3IgJHtyb29tLnJvb21JZH0gYmVjYXVzZSB3ZSBkb24ndCBrbm93IGFib3V0IHRoZSByb29tYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIFVwZGF0aW5nIHRhZ3MgZm9yIHJvb20gJHtyb29tLnJvb21JZH0gKCR7cm9vbS5uYW1lfSlgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gR2V0IHRoZSB0YWdzIGZvciB0aGUgcm9vbSBhbmQgcG9wdWxhdGUgdGhlIGNhY2hlXG4gICAgICAgICAgICBjb25zdCByb29tVGFncyA9IHRoaXMuZ2V0VGFnc0ZvclJvb20ocm9vbSkuZmlsdGVyKHQgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuY2FjaGVkUm9vbXNbdF0pKTtcblxuICAgICAgICAgICAgLy8gXCJUaGlzIHNob3VsZCBuZXZlciBoYXBwZW5cIiBjb25kaXRpb24gLSB3ZSBzcGVjaWZ5IERlZmF1bHRUYWdJRC5VbnRhZ2dlZCBpbiBnZXRUYWdzRm9yUm9vbSgpLFxuICAgICAgICAgICAgLy8gd2hpY2ggbWVhbnMgd2Ugc2hvdWxkICphbHdheXMqIGhhdmUgYSB0YWcgdG8gZ28gb2ZmIG9mLlxuICAgICAgICAgICAgaWYgKCFyb29tVGFncy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihgVGFncyBjYW5ub3QgYmUgZGV0ZXJtaW5lZCBmb3IgJHtyb29tLnJvb21JZH1gKTtcblxuICAgICAgICAgICAgdGhpcy5yb29tSWRzVG9UYWdzW3Jvb20ucm9vbUlkXSA9IHJvb21UYWdzO1xuXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gVXBkYXRlZCB0YWdzIGZvciAke3Jvb20ucm9vbUlkfTpgLCByb29tVGFncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIFJlYWNoZWQgYWxnb3JpdGhtaWMgaGFuZGxpbmcgZm9yICR7cm9vbS5yb29tSWR9IGFuZCBjYXVzZSAke2NhdXNlfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGFncyA9IHRoaXMucm9vbUlkc1RvVGFnc1tyb29tLnJvb21JZF07XG4gICAgICAgIGlmICghdGFncykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBObyB0YWdzIGtub3duIGZvciBcIiR7cm9vbS5uYW1lfVwiICgke3Jvb20ucm9vbUlkfSlgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjaGFuZ2VkID0gZGlkVGFnQ2hhbmdlO1xuICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgICAgICAgICBjb25zdCBhbGdvcml0aG06IE9yZGVyaW5nQWxnb3JpdGhtID0gdGhpcy5hbGdvcml0aG1zW3RhZ107XG4gICAgICAgICAgICBpZiAoIWFsZ29yaXRobSkgdGhyb3cgbmV3IEVycm9yKGBObyBhbGdvcml0aG0gZm9yICR7dGFnfWApO1xuXG4gICAgICAgICAgICBhd2FpdCBhbGdvcml0aG0uaGFuZGxlUm9vbVVwZGF0ZShyb29tLCBjYXVzZSk7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZWRSb29tc1t0YWddID0gYWxnb3JpdGhtLm9yZGVyZWRSb29tcztcblxuICAgICAgICAgICAgLy8gRmxhZyB0aGF0IHdlJ3ZlIGRvbmUgc29tZXRoaW5nXG4gICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlRmlsdGVyZWRSb29tc0ZvclRhZyh0YWcpOyAvLyB1cGRhdGUgZmlsdGVyIHRvIHJlLXNvcnQgdGhlIGxpc3RcbiAgICAgICAgICAgIHRoaXMucmVjYWxjdWxhdGVTdGlja3lSb29tKHRhZyk7IC8vIHVwZGF0ZSBzdGlja3kgcm9vbSB0byBtYWtlIHN1cmUgaXQgYXBwZWFycyBpZiBuZWVkZWRcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBGaW5pc2hlZCBoYW5kbGluZyAke3Jvb20ucm9vbUlkfSB3aXRoIGNhdXNlICR7Y2F1c2V9IChjaGFuZ2VkPSR7Y2hhbmdlZH0pYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxufVxuIl19
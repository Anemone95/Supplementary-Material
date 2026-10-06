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

var _enums = require("../../../utils/enums");

var _models = require("../models");

var _IFilterCondition = require("../filters/IFilterCondition");

var _membership = require("../../../utils/membership");

var _listOrdering = require("./list-ordering");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _VisibilityProvider = require("../filters/VisibilityProvider");

/*
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
  }

  get stickyRoom()
  /*: Room*/
  {
    return this._stickyRoom ? this._stickyRoom.room : null;
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

      if (!this.hasFilters) {
        this.emit(LIST_UPDATED_EVENT);
      }
    }
  }

  async handleFilterChange() {
    await this.recalculateFilteredRooms(); // re-emit the update so the list store can fire an off-cycle update if needed

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
    // Note throughout: We need async so we can wait for handleRoomUpdate() to do its thing,
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


    let tag = this.roomIdsToTags[val.roomId][0];
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

    this.emit(LIST_UPDATED_EVENT);
  }

  recalculateFilteredRooms() {
    if (!this.hasFilters) {
      return;
    }

    console.warn("Recalculating filtered room list");
    const filters = Array.from(this.allowedByFilter.keys());
    const orderedFilters = new _arrays.ArrayUtil(filters).groupBy(f => f.relativePriority).orderBy((0, _enums.getEnumValues)(_IFilterCondition.FilterPriority)).value;
    const newMap
    /*: ITagMap*/
    = {};

    for (const tagId of Object.keys(this.cachedRooms)) {
      // Cheaply clone the rooms so we can more easily do operations on the list.
      // We optimize our lookups by trying to reduce sample size as much as possible
      // to the rooms we know will be deduped by the Set.
      const rooms = this.cachedRooms[tagId].map(r => r); // cheap clone

      this.tryInsertStickyRoomToFilterSet(rooms, tagId);
      let remainingRooms = rooms.map(r => r);
      let allowedRoomsInThisTag = [];
      let lastFilterPriority = orderedFilters[0].relativePriority;

      for (const filter of orderedFilters) {
        if (filter.relativePriority !== lastFilterPriority) {
          // Every time the filter changes priority, we want more specific filtering.
          // To accomplish that, reset the variables to make it look like the process
          // has started over, but using the filtered rooms as the seed.
          remainingRooms = allowedRoomsInThisTag;
          allowedRoomsInThisTag = [];
          lastFilterPriority = filter.relativePriority;
        }

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
    console.warn("Resetting known rooms, initiating regeneration"); // Before we go any further we need to clear (but remember) the sticky room to
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvQWxnb3JpdGhtLnRzIl0sIm5hbWVzIjpbIkxJU1RfVVBEQVRFRF9FVkVOVCIsIkNBVVNFU19SRVFVSVJJTkdfUk9PTSIsIlJvb21VcGRhdGVDYXVzZSIsIlRpbWVsaW5lIiwiUmVhZFJlY2VpcHQiLCJBbGdvcml0aG0iLCJFdmVudEVtaXR0ZXIiLCJjb25zdHJ1Y3RvciIsIk1hcCIsIlNldCIsInN0aWNreVJvb20iLCJfc3RpY2t5Um9vbSIsInJvb20iLCJoYXNGaWx0ZXJzIiwiYWxsb3dlZEJ5RmlsdGVyIiwic2l6ZSIsImNhY2hlZFJvb21zIiwidmFsIiwiX2NhY2hlZFJvb21zIiwicmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zIiwicmVjYWxjdWxhdGVTdGlja3lSb29tIiwic2V0U3RpY2t5Um9vbSIsInVwZGF0ZVN0aWNreVJvb20iLCJnZXRUYWdTb3J0aW5nIiwidGFnSWQiLCJzb3J0QWxnb3JpdGhtcyIsInNldFRhZ1NvcnRpbmciLCJzb3J0IiwiRXJyb3IiLCJhbGdvcml0aG0iLCJhbGdvcml0aG1zIiwic2V0U29ydEFsZ29yaXRobSIsIm9yZGVyZWRSb29tcyIsInJlY2FsY3VsYXRlRmlsdGVyZWRSb29tc0ZvclRhZyIsImdldExpc3RPcmRlcmluZyIsImxpc3RBbGdvcml0aG1zIiwic2V0TGlzdE9yZGVyaW5nIiwib3JkZXIiLCJzZXRSb29tcyIsImFkZEZpbHRlckNvbmRpdGlvbiIsImZpbHRlckNvbmRpdGlvbiIsInNldCIsInJvb21zIiwiZmlsdGVyIiwiciIsImlzVmlzaWJsZSIsIm9uIiwiRklMVEVSX0NIQU5HRUQiLCJoYW5kbGVGaWx0ZXJDaGFuZ2UiLCJiaW5kIiwicmVtb3ZlRmlsdGVyQ29uZGl0aW9uIiwib2ZmIiwiaGFzIiwiZGVsZXRlIiwiZW1pdCIsImRvVXBkYXRlU3RpY2t5Um9vbSIsIl9sYXN0U3RpY2t5Um9vbSIsIlZpc2liaWxpdHlQcm92aWRlciIsImluc3RhbmNlIiwiaXNSb29tVmlzaWJsZSIsImhhbmRsZVJvb21VcGRhdGUiLCJOZXdSb29tIiwidGFnIiwicm9vbUlkc1RvVGFncyIsInJvb21JZCIsInRhZ0xpc3QiLCJnZXRPcmRlcmVkUm9vbXNXaXRob3V0U3RpY2t5IiwicG9zaXRpb24iLCJpbmRleE9mIiwid2FzU3RpY2t5IiwiY29uc29sZSIsIndhcm4iLCJsYXN0U3RpY2t5Um9vbSIsIlJvb21SZW1vdmVkIiwiZmlsdGVycyIsIkFycmF5IiwiZnJvbSIsImtleXMiLCJvcmRlcmVkRmlsdGVycyIsIkFycmF5VXRpbCIsImdyb3VwQnkiLCJmIiwicmVsYXRpdmVQcmlvcml0eSIsIm9yZGVyQnkiLCJGaWx0ZXJQcmlvcml0eSIsInZhbHVlIiwibmV3TWFwIiwiT2JqZWN0IiwibWFwIiwidHJ5SW5zZXJ0U3RpY2t5Um9vbVRvRmlsdGVyU2V0IiwicmVtYWluaW5nUm9vbXMiLCJhbGxvd2VkUm9vbXNJblRoaXNUYWciLCJsYXN0RmlsdGVyUHJpb3JpdHkiLCJmaWx0ZXJlZFJvb21zIiwiaWR4Iiwic3BsaWNlIiwicHVzaCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImxvZyIsImxlbmd0aCIsImFsbG93ZWRSb29tcyIsInZhbHVlcyIsInJlZHVjZSIsInJ2IiwidiIsImFsbG93ZWRSb29tc0J5RmlsdGVycyIsInVwZGF0ZWRUYWciLCJfY2FjaGVkU3RpY2t5Um9vbXMiLCJzdGlja2llZFRhZ01hcCIsInN0aWNreSIsInBvcHVsYXRlVGFncyIsInRhZ1NvcnRpbmdNYXAiLCJsaXN0T3JkZXJpbmdNYXAiLCJzZXRLbm93blJvb21zIiwiZ2V0T3JkZXJlZFJvb21zIiwiZ2V0VW5maWx0ZXJlZFJvb21zIiwib2xkU3RpY2t5Um9vbSIsIm5ld1RhZ3MiLCJnZW5lcmF0ZUZyZXNoVGFncyIsIm1lbWJlcnNoaXBzIiwiRWZmZWN0aXZlTWVtYmVyc2hpcCIsIkludml0ZSIsIkRlZmF1bHRUYWdJRCIsIkxlYXZlIiwiQXJjaGl2ZWQiLCJKb2luIiwidGFncyIsImdldFRhZ3NPZkpvaW5lZFJvb20iLCJpblRhZyIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsIkRNIiwiVW50YWdnZWQiLCJ1cGRhdGVUYWdzRnJvbUNhY2hlIiwiZ2V0VGFnc0ZvclJvb20iLCJtZW1iZXJzaGlwIiwiZ2V0TXlNZW1iZXJzaGlwIiwidXBkYXRlZFRhZ01hcCIsImNhdXNlIiwiaXNTdGlja3kiLCJpc0Zvckxhc3RTdGlja3kiLCJyb29tVGFncyIsImhhc1RhZ3MiLCJQb3NzaWJsZVRhZ0NoYW5nZSIsImtub3duUm9vbVJlZiIsImluY2x1ZGVzIiwiZGlkVGFnQ2hhbmdlIiwib2xkVGFncyIsImRpZmYiLCJyZW1vdmVkIiwiYWRkZWQiLCJybVRhZyIsImFkZFRhZyIsIm5hbWUiLCJ0IiwiY2hhbmdlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBU0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF3QkE7QUFDQTtBQUNBO0FBQ08sTUFBTUEsa0JBQWtCLEdBQUcsb0JBQTNCLEMsQ0FFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLE1BQU1DLHFCQUFxQixHQUFHLENBQzFCQyx3QkFBZ0JDLFFBRFUsRUFFMUJELHdCQUFnQkUsV0FGVSxDQUE5Qjs7QUFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sTUFBTUMsU0FBTixTQUF3QkMsb0JBQXhCLENBQXFDO0FBRUU7QUFHRztBQVd0Q0MsRUFBQUEsV0FBUCxHQUFxQjtBQUNqQjtBQURpQix3REFmVyxFQWVYO0FBQUEsOERBZGlCLEVBY2pCO0FBQUEseURBYlksRUFhWjtBQUFBLHVEQVpjLElBWWQ7QUFBQSwyREFYa0IsSUFXbEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxp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QUMrSSxJQUFLLE1BQUsvSSxJQUFJLENBQUNvRCxNQUFPLEdBQTlEO0FBQ0EsYUFBTyxLQUFQO0FBQ0g7O0FBRUQsUUFBSTZGLE9BQU8sR0FBR1QsWUFBZDs7QUFDQSxTQUFLLE1BQU10RixHQUFYLElBQWtCaUUsSUFBbEIsRUFBd0I7QUFDcEIsWUFBTWxHO0FBQTRCO0FBQUEsUUFBRyxLQUFLQyxVQUFMLENBQWdCZ0MsR0FBaEIsQ0FBckM7QUFDQSxVQUFJLENBQUNqQyxTQUFMLEVBQWdCLE1BQU0sSUFBSUQsS0FBSixDQUFXLG9CQUFtQmtDLEdBQUksRUFBbEMsQ0FBTjtBQUVoQixZQUFNakMsU0FBUyxDQUFDK0IsZ0JBQVYsQ0FBMkJoRCxJQUEzQixFQUFpQ2dJLEtBQWpDLENBQU47QUFDQSxXQUFLMUgsWUFBTCxDQUFrQjRDLEdBQWxCLElBQXlCakMsU0FBUyxDQUFDRyxZQUFuQyxDQUxvQixDQU9wQjs7QUFDQSxXQUFLQyw4QkFBTCxDQUFvQzZCLEdBQXBDLEVBUm9CLENBUXNCOztBQUMxQyxXQUFLMUMscUJBQUwsQ0FBMkIwQyxHQUEzQixFQVRvQixDQVNhOztBQUNqQytGLE1BQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0g7O0FBRUQsUUFBSTVELHVCQUFjQyxRQUFkLENBQXVCLHlCQUF2QixDQUFKLEVBQXVEO0FBQ25EO0FBQ0E1QixNQUFBQSxPQUFPLENBQUM2QixHQUFSLENBQWEscUNBQW9DdkYsSUFBSSxDQUFDb0QsTUFBTyxlQUFjNEUsS0FBTSxhQUFZaUIsT0FBUSxHQUFyRztBQUNIOztBQUNELFdBQU9BLE9BQVA7QUFDSDs7QUFyeEJ1QyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IGlzTnVsbE9yVW5kZWZpbmVkIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gXCIuLi8uLi8uLi91dGlscy9ETVJvb21NYXBcIjtcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCB7IGFycmF5RGlmZiwgYXJyYXlIYXNEaWZmLCBBcnJheVV0aWwgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5pbXBvcnQgeyBnZXRFbnVtVmFsdWVzIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2VudW1zXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQsIFJvb21VcGRhdGVDYXVzZSwgVGFnSUQgfSBmcm9tIFwiLi4vbW9kZWxzXCI7XG5pbXBvcnQge1xuICAgIElMaXN0T3JkZXJpbmdNYXAsXG4gICAgSU9yZGVyaW5nQWxnb3JpdGhtTWFwLFxuICAgIElUYWdNYXAsXG4gICAgSVRhZ1NvcnRpbmdNYXAsXG4gICAgTGlzdEFsZ29yaXRobSxcbiAgICBTb3J0QWxnb3JpdGhtLFxufSBmcm9tIFwiLi9tb2RlbHNcIjtcbmltcG9ydCB7IEZJTFRFUl9DSEFOR0VELCBGaWx0ZXJQcmlvcml0eSwgSUZpbHRlckNvbmRpdGlvbiB9IGZyb20gXCIuLi9maWx0ZXJzL0lGaWx0ZXJDb25kaXRpb25cIjtcbmltcG9ydCB7IEVmZmVjdGl2ZU1lbWJlcnNoaXAsIGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAsIHNwbGl0Um9vbXNCeU1lbWJlcnNoaXAgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbWVtYmVyc2hpcFwiO1xuaW1wb3J0IHsgT3JkZXJpbmdBbGdvcml0aG0gfSBmcm9tIFwiLi9saXN0LW9yZGVyaW5nL09yZGVyaW5nQWxnb3JpdGhtXCI7XG5pbXBvcnQgeyBnZXRMaXN0QWxnb3JpdGhtSW5zdGFuY2UgfSBmcm9tIFwiLi9saXN0LW9yZGVyaW5nXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgVmlzaWJpbGl0eVByb3ZpZGVyIH0gZnJvbSBcIi4uL2ZpbHRlcnMvVmlzaWJpbGl0eVByb3ZpZGVyXCI7XG5cbi8qKlxuICogRmlyZWQgd2hlbiB0aGUgQWxnb3JpdGhtIGhhcyBkZXRlcm1pbmVkIGEgbGlzdCBoYXMgYmVlbiB1cGRhdGVkLlxuICovXG5leHBvcnQgY29uc3QgTElTVF9VUERBVEVEX0VWRU5UID0gXCJsaXN0X3VwZGF0ZWRfZXZlbnRcIjtcblxuLy8gVGhlc2UgYXJlIHRoZSBjYXVzZXMgd2hpY2ggcmVxdWlyZSBhIHJvb20gdG8gYmUga25vd24gaW4gb3JkZXIgZm9yIHVzIHRvIGhhbmRsZSB0aGVtLiBJZlxuLy8gYSBjYXVzZSBpbiB0aGlzIGxpc3QgaXMgcmFpc2VkIGFuZCB3ZSBkb24ndCBrbm93IGFib3V0IHRoZSByb29tLCB3ZSBkb24ndCBoYW5kbGUgdGhlIHVwZGF0ZS5cbi8vXG4vLyBOb3RlOiB0aGVzZSB0eXBpY2FsbHkgaGFwcGVuIHdoZW4gYSBuZXcgcm9vbSBpcyBjb21pbmcgaW4sIHN1Y2ggYXMgdGhlIHVzZXIgY3JlYXRpbmcgb3Jcbi8vIGpvaW5pbmcgdGhlIHJvb20uIEZvciB0aGVzZSBjYXNlcywgd2UgbmVlZCB0byBrbm93IGFib3V0IHRoZSByb29tIHByaW9yIHRvIGhhbmRsaW5nIGl0IG90aGVyd2lzZVxuLy8gd2UnbGwgbWFrZSBiYWQgYXNzdW1wdGlvbnMuXG5jb25zdCBDQVVTRVNfUkVRVUlSSU5HX1JPT00gPSBbXG4gICAgUm9vbVVwZGF0ZUNhdXNlLlRpbWVsaW5lLFxuICAgIFJvb21VcGRhdGVDYXVzZS5SZWFkUmVjZWlwdCxcbl07XG5cbmludGVyZmFjZSBJU3RpY2t5Um9vbSB7XG4gICAgcm9vbTogUm9vbTtcbiAgICBwb3NpdGlvbjogbnVtYmVyO1xuICAgIHRhZzogVGFnSUQ7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGxpc3Qgb3JkZXJpbmcgYWxnb3JpdGhtLiBUaGlzIGNsYXNzIHdpbGwgdGFrZSBjYXJlIG9mIHRhZ1xuICogbWFuYWdlbWVudCAod2hpY2ggcm9vbXMgZ28gaW4gd2hpY2ggdGFncykgYW5kIGFzayB0aGUgaW1wbGVtZW50YXRpb24gdG9cbiAqIGRlYWwgd2l0aCBvcmRlcmluZyBtZWNoYW5pY3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbGdvcml0aG0gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIHByaXZhdGUgX2NhY2hlZFJvb21zOiBJVGFnTWFwID0ge307XG4gICAgcHJpdmF0ZSBfY2FjaGVkU3RpY2t5Um9vbXM6IElUYWdNYXAgPSB7fTsgLy8gYSBjbG9uZSBvZiB0aGUgX2NhY2hlZFJvb21zLCB3aXRoIHRoZSBzdGlja3kgcm9vbVxuICAgIHByaXZhdGUgZmlsdGVyZWRSb29tczogSVRhZ01hcCA9IHt9O1xuICAgIHByaXZhdGUgX3N0aWNreVJvb206IElTdGlja3lSb29tID0gbnVsbDtcbiAgICBwcml2YXRlIF9sYXN0U3RpY2t5Um9vbTogSVN0aWNreVJvb20gPSBudWxsOyAvLyBvbmx5IG5vdC1udWxsIHdoZW4gY2hhbmdpbmcgdGhlIHN0aWNreSByb29tXG4gICAgcHJpdmF0ZSBzb3J0QWxnb3JpdGhtczogSVRhZ1NvcnRpbmdNYXA7XG4gICAgcHJpdmF0ZSBsaXN0QWxnb3JpdGhtczogSUxpc3RPcmRlcmluZ01hcDtcbiAgICBwcml2YXRlIGFsZ29yaXRobXM6IElPcmRlcmluZ0FsZ29yaXRobU1hcDtcbiAgICBwcml2YXRlIHJvb21zOiBSb29tW10gPSBbXTtcbiAgICBwcml2YXRlIHJvb21JZHNUb1RhZ3M6IHtcbiAgICAgICAgW3Jvb21JZDogc3RyaW5nXTogVGFnSURbXTtcbiAgICB9ID0ge307XG4gICAgcHJpdmF0ZSBhbGxvd2VkQnlGaWx0ZXI6IE1hcDxJRmlsdGVyQ29uZGl0aW9uLCBSb29tW10+ID0gbmV3IE1hcDxJRmlsdGVyQ29uZGl0aW9uLCBSb29tW10+KCk7XG4gICAgcHJpdmF0ZSBhbGxvd2VkUm9vbXNCeUZpbHRlcnM6IFNldDxSb29tPiA9IG5ldyBTZXQ8Um9vbT4oKTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHN0aWNreVJvb20oKTogUm9vbSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGlja3lSb29tID8gdGhpcy5fc3RpY2t5Um9vbS5yb29tIDogbnVsbDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IGhhc0ZpbHRlcnMoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbG93ZWRCeUZpbHRlci5zaXplID4gMDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2V0IGNhY2hlZFJvb21zKHZhbDogSVRhZ01hcCkge1xuICAgICAgICB0aGlzLl9jYWNoZWRSb29tcyA9IHZhbDtcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUZpbHRlcmVkUm9vbXMoKTtcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVN0aWNreVJvb20oKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IGNhY2hlZFJvb21zKCk6IElUYWdNYXAge1xuICAgICAgICAvLyDwn5CJIEhlcmUgYmUgZHJhZ29ucy5cbiAgICAgICAgLy8gTm90ZTogdGhpcyBpcyB1c2VkIGJ5IHRoZSB1bmRlcmx5aW5nIGFsZ29yaXRobSBjbGFzc2VzLCBzbyBkb24ndCBtYWtlIGl0IHJldHVyblxuICAgICAgICAvLyB0aGUgc3RpY2t5IHJvb20gY2FjaGUuIElmIGl0IGVuZHMgdXAgcmV0dXJuaW5nIHRoZSBzdGlja3kgcm9vbSBjYWNoZSwgd2UgZW5kIHVwXG4gICAgICAgIC8vIGNvcnJ1cHRpbmcgb3VyIGNhY2hlcyBhbmQgY29uZnVzaW5nIHRoZW0uXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRSb29tcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBd2FpdGFibGUgdmVyc2lvbiBvZiB0aGUgc3RpY2t5IHJvb20gc2V0dGVyLlxuICAgICAqIEBwYXJhbSB2YWwgVGhlIG5ldyByb29tIHRvIHN0aWNreS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgc2V0U3RpY2t5Um9vbSh2YWw6IFJvb20pIHtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVTdGlja3lSb29tKHZhbCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFRhZ1NvcnRpbmcodGFnSWQ6IFRhZ0lEKTogU29ydEFsZ29yaXRobSB7XG4gICAgICAgIGlmICghdGhpcy5zb3J0QWxnb3JpdGhtcykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzLnNvcnRBbGdvcml0aG1zW3RhZ0lkXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2V0VGFnU29ydGluZyh0YWdJZDogVGFnSUQsIHNvcnQ6IFNvcnRBbGdvcml0aG0pIHtcbiAgICAgICAgaWYgKCF0YWdJZCkgdGhyb3cgbmV3IEVycm9yKFwiVGFnIElEIG11c3QgYmUgZGVmaW5lZFwiKTtcbiAgICAgICAgaWYgKCFzb3J0KSB0aHJvdyBuZXcgRXJyb3IoXCJBbGdvcml0aG0gbXVzdCBiZSBkZWZpbmVkXCIpO1xuICAgICAgICB0aGlzLnNvcnRBbGdvcml0aG1zW3RhZ0lkXSA9IHNvcnQ7XG5cbiAgICAgICAgY29uc3QgYWxnb3JpdGhtOiBPcmRlcmluZ0FsZ29yaXRobSA9IHRoaXMuYWxnb3JpdGhtc1t0YWdJZF07XG4gICAgICAgIGF3YWl0IGFsZ29yaXRobS5zZXRTb3J0QWxnb3JpdGhtKHNvcnQpO1xuICAgICAgICB0aGlzLl9jYWNoZWRSb29tc1t0YWdJZF0gPSBhbGdvcml0aG0ub3JkZXJlZFJvb21zO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlRmlsdGVyZWRSb29tc0ZvclRhZyh0YWdJZCk7IC8vIHVwZGF0ZSBmaWx0ZXIgdG8gcmUtc29ydCB0aGUgbGlzdFxuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSh0YWdJZCk7IC8vIHVwZGF0ZSBzdGlja3kgcm9vbSB0byBtYWtlIHN1cmUgaXQgYXBwZWFycyBpZiBuZWVkZWRcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGlzdE9yZGVyaW5nKHRhZ0lkOiBUYWdJRCk6IExpc3RBbGdvcml0aG0ge1xuICAgICAgICBpZiAoIXRoaXMubGlzdEFsZ29yaXRobXMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0QWxnb3JpdGhtc1t0YWdJZF07XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHNldExpc3RPcmRlcmluZyh0YWdJZDogVGFnSUQsIG9yZGVyOiBMaXN0QWxnb3JpdGhtKSB7XG4gICAgICAgIGlmICghdGFnSWQpIHRocm93IG5ldyBFcnJvcihcIlRhZyBJRCBtdXN0IGJlIGRlZmluZWRcIik7XG4gICAgICAgIGlmICghb3JkZXIpIHRocm93IG5ldyBFcnJvcihcIkFsZ29yaXRobSBtdXN0IGJlIGRlZmluZWRcIik7XG4gICAgICAgIHRoaXMubGlzdEFsZ29yaXRobXNbdGFnSWRdID0gb3JkZXI7XG5cbiAgICAgICAgY29uc3QgYWxnb3JpdGhtID0gZ2V0TGlzdEFsZ29yaXRobUluc3RhbmNlKG9yZGVyLCB0YWdJZCwgdGhpcy5zb3J0QWxnb3JpdGhtc1t0YWdJZF0pO1xuICAgICAgICB0aGlzLmFsZ29yaXRobXNbdGFnSWRdID0gYWxnb3JpdGhtO1xuXG4gICAgICAgIGF3YWl0IGFsZ29yaXRobS5zZXRSb29tcyh0aGlzLl9jYWNoZWRSb29tc1t0YWdJZF0pO1xuICAgICAgICB0aGlzLl9jYWNoZWRSb29tc1t0YWdJZF0gPSBhbGdvcml0aG0ub3JkZXJlZFJvb21zO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlRmlsdGVyZWRSb29tc0ZvclRhZyh0YWdJZCk7IC8vIHVwZGF0ZSBmaWx0ZXIgdG8gcmUtc29ydCB0aGUgbGlzdFxuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSh0YWdJZCk7IC8vIHVwZGF0ZSBzdGlja3kgcm9vbSB0byBtYWtlIHN1cmUgaXQgYXBwZWFycyBpZiBuZWVkZWRcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkRmlsdGVyQ29uZGl0aW9uKGZpbHRlckNvbmRpdGlvbjogSUZpbHRlckNvbmRpdGlvbik6IHZvaWQge1xuICAgICAgICAvLyBQb3B1bGF0ZSB0aGUgY2FjaGUgb2YgdGhlIG5ldyBmaWx0ZXJcbiAgICAgICAgdGhpcy5hbGxvd2VkQnlGaWx0ZXIuc2V0KGZpbHRlckNvbmRpdGlvbiwgdGhpcy5yb29tcy5maWx0ZXIociA9PiBmaWx0ZXJDb25kaXRpb24uaXNWaXNpYmxlKHIpKSk7XG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zKCk7XG4gICAgICAgIGZpbHRlckNvbmRpdGlvbi5vbihGSUxURVJfQ0hBTkdFRCwgdGhpcy5oYW5kbGVGaWx0ZXJDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUZpbHRlckNvbmRpdGlvbihmaWx0ZXJDb25kaXRpb246IElGaWx0ZXJDb25kaXRpb24pOiB2b2lkIHtcbiAgICAgICAgZmlsdGVyQ29uZGl0aW9uLm9mZihGSUxURVJfQ0hBTkdFRCwgdGhpcy5oYW5kbGVGaWx0ZXJDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgIGlmICh0aGlzLmFsbG93ZWRCeUZpbHRlci5oYXMoZmlsdGVyQ29uZGl0aW9uKSkge1xuICAgICAgICAgICAgdGhpcy5hbGxvd2VkQnlGaWx0ZXIuZGVsZXRlKGZpbHRlckNvbmRpdGlvbik7XG4gICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlRmlsdGVyZWRSb29tcygpO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSByZW1vdmVkIHRoZSBsYXN0IGZpbHRlciwgdGVsbCBjb25zdW1lcnMgdGhhdCB3ZSd2ZSBcInVwZGF0ZWRcIiBvdXIgZmlsdGVyZWRcbiAgICAgICAgICAgIC8vIHZpZXcuIFRoaXMgd2lsbCB0cmljayB0aGVtIGludG8gZ2V0dGluZyB0aGUgY29tcGxldGUgcm9vbSBsaXN0LlxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0ZpbHRlcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoTElTVF9VUERBVEVEX0VWRU5UKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlRmlsdGVyQ2hhbmdlKCkge1xuICAgICAgICBhd2FpdCB0aGlzLnJlY2FsY3VsYXRlRmlsdGVyZWRSb29tcygpO1xuXG4gICAgICAgIC8vIHJlLWVtaXQgdGhlIHVwZGF0ZSBzbyB0aGUgbGlzdCBzdG9yZSBjYW4gZmlyZSBhbiBvZmYtY3ljbGUgdXBkYXRlIGlmIG5lZWRlZFxuICAgICAgICB0aGlzLmVtaXQoRklMVEVSX0NIQU5HRUQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlU3RpY2t5Um9vbSh2YWw6IFJvb20pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmRvVXBkYXRlU3RpY2t5Um9vbSh2YWwpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5fbGFzdFN0aWNreVJvb20gPSBudWxsOyAvLyBjbGVhciB0byBpbmRpY2F0ZSB3ZSdyZSBkb25lIGNoYW5naW5nXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGRvVXBkYXRlU3RpY2t5Um9vbSh2YWw6IFJvb20pIHtcbiAgICAgICAgLy8gTm90ZSB0aHJvdWdob3V0OiBXZSBuZWVkIGFzeW5jIHNvIHdlIGNhbiB3YWl0IGZvciBoYW5kbGVSb29tVXBkYXRlKCkgdG8gZG8gaXRzIHRoaW5nLFxuICAgICAgICAvLyBvdGhlcndpc2Ugd2UgcmlzayBkdXBsaWNhdGluZyByb29tcy5cblxuICAgICAgICBpZiAodmFsICYmICFWaXNpYmlsaXR5UHJvdmlkZXIuaW5zdGFuY2UuaXNSb29tVmlzaWJsZSh2YWwpKSB7XG4gICAgICAgICAgICB2YWwgPSBudWxsOyAvLyB0aGUgcm9vbSBpc24ndCB2aXNpYmxlIC0gbGllIHRvIHRoZSByZXN0IG9mIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgbGFzdCBzdGlja3kgcm9vbSB0byBpbmRpY2F0ZSB0aGF0IHdlJ3JlIGluIGEgY2hhbmdlLiBUaGUgY29kZSB0aHJvdWdob3V0IHRoZVxuICAgICAgICAvLyBjbGFzcyBjYW4gc2FmZWx5IGhhbmRsZSBhIG51bGwgcm9vbSwgc28gdGhpcyBzaG91bGQgYmUgc2FmZSB0byBkbyBhcyBhIGJhY2t1cC5cbiAgICAgICAgdGhpcy5fbGFzdFN0aWNreVJvb20gPSB0aGlzLl9zdGlja3lSb29tIHx8IDxJU3RpY2t5Um9vbT57fTtcblxuICAgICAgICAvLyBJdCdzIHBvc3NpYmxlIHRvIGhhdmUgbm8gc2VsZWN0ZWQgcm9vbS4gSW4gdGhhdCBjYXNlLCBjbGVhciB0aGUgc3RpY2t5IHJvb21cbiAgICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGlja3lSb29tKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RpY2t5Um9vbSA9IHRoaXMuX3N0aWNreVJvb20ucm9vbTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGlja3lSb29tID0gbnVsbDsgLy8gY2xlYXIgYmVmb3JlIHdlIGdvIHRvIHVwZGF0ZSB0aGUgYWxnb3JpdGhtXG5cbiAgICAgICAgICAgICAgICAvLyBMaWUgdG8gdGhlIGFsZ29yaXRobSBhbmQgcmUtYWRkIHRoZSByb29tIHRvIHRoZSBhbGdvcml0aG1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUoc3RpY2t5Um9vbSwgUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gd2UgZG8gaGF2ZSBhIHJvb20gdGhvdWdoLCB3ZSBleHBlY3QgdG8gYmUgYWJsZSB0byBmaW5kIGl0XG4gICAgICAgIGxldCB0YWcgPSB0aGlzLnJvb21JZHNUb1RhZ3NbdmFsLnJvb21JZF1bMF07XG4gICAgICAgIGlmICghdGFnKSB0aHJvdyBuZXcgRXJyb3IoYCR7dmFsLnJvb21JZH0gZG9lcyBub3QgYmVsb25nIHRvIGEgdGFnIGFuZCBjYW5ub3QgYmUgc3RpY2t5YCk7XG5cbiAgICAgICAgLy8gV2Ugc3BlY2lmaWNhbGx5IGRvIE5PVCB1c2UgdGhlIG9yZGVyZWQgcm9vbXMgc2V0IGFzIGl0IGNvbnRhaW5zIHRoZSBzdGlja3kgcm9vbSwgd2hpY2hcbiAgICAgICAgLy8gbWVhbnMgd2UnbGwgYmUgb2ZmIGJ5IDEgd2hlbiB0aGUgdXNlciBpcyBzd2l0Y2hpbmcgcm9vbXMuIFRoaXMgbGVhZHMgdG8gdmlzdWFsIGp1bXBpbmdcbiAgICAgICAgLy8gd2hlbiB0aGUgdXNlciBpcyBtb3Zpbmcgc291dGggaW4gdGhlIGxpc3QgKG5vdCBub3J0aCwgYmVjYXVzZSBvZiBtYXRoKS5cbiAgICAgICAgY29uc3QgdGFnTGlzdCA9IHRoaXMuZ2V0T3JkZXJlZFJvb21zV2l0aG91dFN0aWNreSgpW3RhZ10gfHwgW107IC8vIGNhbiBiZSBudWxsIGlmIGZpbHRlcmluZ1xuICAgICAgICBsZXQgcG9zaXRpb24gPSB0YWdMaXN0LmluZGV4T2YodmFsKTtcblxuICAgICAgICAvLyBXZSBkbyB3YW50IHRvIHNlZSBpZiBhIHRhZyBjaGFuZ2UgaGFwcGVuZWQgdGhvdWdoIC0gaWYgdGhpcyBkaWQgaGFwcGVuIHRoZW4gd2UnbGwgd2FudFxuICAgICAgICAvLyB0byBmb3JjZSB0aGUgcG9zaXRpb24gdG8gemVybyAodG9wKSB0byBlbnN1cmUgd2UgY2FuIHByb3Blcmx5IGhhbmRsZSBpdC5cbiAgICAgICAgY29uc3Qgd2FzU3RpY2t5ID0gdGhpcy5fbGFzdFN0aWNreVJvb20ucm9vbSA/IHRoaXMuX2xhc3RTdGlja3lSb29tLnJvb20ucm9vbUlkID09PSB2YWwucm9vbUlkIDogZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9sYXN0U3RpY2t5Um9vbS50YWcgJiYgdGFnICE9PSB0aGlzLl9sYXN0U3RpY2t5Um9vbS50YWcgJiYgd2FzU3RpY2t5ICYmIHBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBTdGlja3kgcm9vbSAke3ZhbC5yb29tSWR9IGNoYW5nZWQgdGFncyBkdXJpbmcgc3RpY2t5IHJvb20gaGFuZGxpbmdgKTtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNhbml0eSBjaGVjayB0aGUgcG9zaXRpb24gdG8gbWFrZSBzdXJlIHRoZSByb29tIGlzIHF1YWxpZmllZCBmb3IgYmVpbmcgc3RpY2t5XG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApIHRocm93IG5ldyBFcnJvcihgJHt2YWwucm9vbUlkfSBkb2VzIG5vdCBhcHBlYXIgdG8gYmUga25vd24gYW5kIGNhbm5vdCBiZSBzdGlja3lgKTtcblxuICAgICAgICAvLyDwn5CJIEhlcmUgYmUgZHJhZ29ucy5cbiAgICAgICAgLy8gQmVmb3JlIHdlIGNhbiBnbyB0aHJvdWdoIHdpdGggbHlpbmcgdG8gdGhlIHVuZGVybHlpbmcgYWxnb3JpdGhtIGFib3V0IGEgcm9vbVxuICAgICAgICAvLyB3ZSBuZWVkIHRvIGVuc3VyZSB0aGF0IHdoZW4gd2UgZG8gd2UncmUgcmVhZHkgZm9yIHRoZSBpbmV2aXRhYmxlIHN0aWNreSByb29tXG4gICAgICAgIC8vIHVwZGF0ZSB3ZSdsbCByZWNlaXZlLiBUbyBwcmVwYXJlIGZvciB0aGF0LCB3ZSBmaXJzdCByZW1vdmUgdGhlIHN0aWNreSByb29tIGFuZFxuICAgICAgICAvLyByZWNhbGN1bGF0ZSB0aGUgc3RhdGUgb3Vyc2VsdmVzIHNvIHRoYXQgd2hlbiB0aGUgdW5kZXJseWluZyBhbGdvcml0aG0gY2FsbHMgZm9yXG4gICAgICAgIC8vIHRoZSBzYW1lIHRoaW5nIGl0IG5vLW9wcy4gQWZ0ZXIgd2UncmUgZG9uZSBjYWxsaW5nIHRoZSBhbGdvcml0aG0sIHdlJ2xsIGlzc3VlXG4gICAgICAgIC8vIGEgbmV3IHVwZGF0ZSBmb3Igb3Vyc2VsdmVzLlxuICAgICAgICBjb25zdCBsYXN0U3RpY2t5Um9vbSA9IHRoaXMuX3N0aWNreVJvb207XG4gICAgICAgIHRoaXMuX3N0aWNreVJvb20gPSBudWxsOyAvLyBjbGVhciBiZWZvcmUgd2UgdXBkYXRlIHRoZSBhbGdvcml0aG1cbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVN0aWNreVJvb20oKTtcblxuICAgICAgICAvLyBXaGVuIHdlIGRvIGhhdmUgdGhlIHJvb20sIHJlLWFkZCB0aGUgb2xkIHJvb20gKGlmIG5lZWRlZCkgdG8gdGhlIGFsZ29yaXRobVxuICAgICAgICAvLyBhbmQgcmVtb3ZlIHRoZSBzdGlja3kgcm9vbSBmcm9tIHRoZSBhbGdvcml0aG0uIFRoaXMgaXMgc28gdGhlIHVuZGVybHlpbmdcbiAgICAgICAgLy8gYWxnb3JpdGhtIGRvZXNuJ3QgdHJ5IGFuZCBjb25mdXNlIGl0c2VsZiB3aXRoIHRoZSBzdGlja3kgcm9vbSBjb25jZXB0LlxuICAgICAgICAvLyBXZSBkb24ndCBhZGQgdGhlIG5ldyByb29tIGlmIHRoZSBzdGlja3kgcm9vbSBpc24ndCBjaGFuZ2luZyBiZWNhdXNlIHRoYXQnc1xuICAgICAgICAvLyBhbiBlYXN5IHdheSB0byBjYXVzZSBkdXBsaWNhdGlvbi4gV2UgaGF2ZSB0byBkbyByb29tIElEIGNoZWNrcyBpbnN0ZWFkIG9mXG4gICAgICAgIC8vIHJlZmVyZW50aWFsIGNoZWNrcyBhcyB0aGUgcmVmZXJlbmNlcyBjYW4gZGlmZmVyIHRocm91Z2ggdGhlIGxpZmVjeWNsZS5cbiAgICAgICAgaWYgKGxhc3RTdGlja3lSb29tICYmIGxhc3RTdGlja3lSb29tLnJvb20gJiYgbGFzdFN0aWNreVJvb20ucm9vbS5yb29tSWQgIT09IHZhbC5yb29tSWQpIHtcbiAgICAgICAgICAgIC8vIExpZSB0byB0aGUgYWxnb3JpdGhtIGFuZCByZS1hZGQgdGhlIHJvb20gdG8gdGhlIGFsZ29yaXRobVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKGxhc3RTdGlja3lSb29tLnJvb20sIFJvb21VcGRhdGVDYXVzZS5OZXdSb29tKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMaWUgdG8gdGhlIGFsZ29yaXRobSBhbmQgcmVtb3ZlIHRoZSByb29tIGZyb20gaXQncyBmaWVsZCBvZiB2aWV3XG4gICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUm9vbVVwZGF0ZSh2YWwsIFJvb21VcGRhdGVDYXVzZS5Sb29tUmVtb3ZlZCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHRhZyAmIHBvc2l0aW9uIGNoYW5nZXMgd2hpbGUgd2UncmUgaGVyZS4gV2UgYWxzbyBjaGVjayB0aGUgcm9vbSB0byBlbnN1cmVcbiAgICAgICAgLy8gaXQgaXMgc3RpbGwgdGhlIHNhbWUgcm9vbS5cbiAgICAgICAgaWYgKHRoaXMuX3N0aWNreVJvb20pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGlja3lSb29tLnJvb20gIT09IHZhbCkge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIHRoZSByb29tIElEcyBqdXN0IGluIGNhc2VcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3RpY2t5Um9vbS5yb29tLnJvb21JZCA9PT0gdmFsLnJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJTdGlja3kgcm9vbSBjaGFuZ2VkIHJlZmVyZW5jZXNcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RpY2t5IHJvb20gY2hhbmdlZCB3aGlsZSB0aGUgc3RpY2t5IHJvb20gd2FzIGNoYW5naW5nXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBTdGlja3kgcm9vbSBjaGFuZ2VkIHRhZyAmIHBvc2l0aW9uIGZyb20gJHt0YWd9IC8gJHtwb3NpdGlvbn0gYFxuICAgICAgICAgICAgICAgICsgYHRvICR7dGhpcy5fc3RpY2t5Um9vbS50YWd9IC8gJHt0aGlzLl9zdGlja3lSb29tLnBvc2l0aW9ufWApO1xuXG4gICAgICAgICAgICB0YWcgPSB0aGlzLl9zdGlja3lSb29tLnRhZztcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5fc3RpY2t5Um9vbS5wb3NpdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdyB0aGF0IHdlJ3JlIGRvbmUgbHlpbmcgdG8gdGhlIGFsZ29yaXRobSwgd2UgbmVlZCB0byB1cGRhdGUgb3VyIHBvc2l0aW9uXG4gICAgICAgIC8vIG1hcmtlciBvbmx5IGlmIHRoZSB1c2VyIGlzIG1vdmluZyBmdXJ0aGVyIGRvd24gdGhlIHNhbWUgbGlzdC4gSWYgdGhleSdyZSBzd2l0Y2hpbmdcbiAgICAgICAgLy8gbGlzdHMsIG9yIG1vdmluZyB1cHdhcmRzLCB0aGUgcG9zaXRpb24gbWFya2VyIHdpbGwgc3BsaWNlIGluIGp1c3QgZmluZSBidXQgaWZcbiAgICAgICAgLy8gdGhleSB3ZW50IGRvd253YXJkcyBpbiB0aGUgc2FtZSBsaXN0IHdlJ2xsIGJlIG9mZiBieSAxIGR1ZSB0byB0aGUgc2hpZnRpbmcgcm9vbXMuXG4gICAgICAgIGlmIChsYXN0U3RpY2t5Um9vbSAmJiBsYXN0U3RpY2t5Um9vbS50YWcgPT09IHRhZyAmJiBsYXN0U3RpY2t5Um9vbS5wb3NpdGlvbiA8PSBwb3NpdGlvbikge1xuICAgICAgICAgICAgcG9zaXRpb24rKztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3N0aWNreVJvb20gPSB7XG4gICAgICAgICAgICByb29tOiB2YWwsXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgICAgICAgICB0YWc6IHRhZyxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXZSB1cGRhdGUgdGhlIGZpbHRlcmVkIHJvb21zIGp1c3QgaW4gY2FzZSwgYXMgb3RoZXJ3aXNlIHVzZXJzIHdpbGwgZW5kIHVwIHZpc2l0aW5nXG4gICAgICAgIC8vIGEgcm9vbSB3aGlsZSBmaWx0ZXJpbmcgYW5kIGl0J2xsIGRpc2FwcGVhci4gV2UgZG9uJ3QgdXBkYXRlIHRoZSBmaWx0ZXIgZWFybGllciBpblxuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIHNpbXBseSBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdG8uXG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zRm9yVGFnKHRhZyk7XG4gICAgICAgIGlmIChsYXN0U3RpY2t5Um9vbSAmJiBsYXN0U3RpY2t5Um9vbS50YWcgIT09IHRhZykgdGhpcy5yZWNhbGN1bGF0ZUZpbHRlcmVkUm9vbXNGb3JUYWcobGFzdFN0aWNreVJvb20udGFnKTtcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVN0aWNreVJvb20oKTtcblxuICAgICAgICAvLyBGaW5hbGx5LCB0cmlnZ2VyIGFuIHVwZGF0ZVxuICAgICAgICB0aGlzLmVtaXQoTElTVF9VUERBVEVEX0VWRU5UKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVjYWxjdWxhdGVGaWx0ZXJlZFJvb21zKCkge1xuICAgICAgICBpZiAoIXRoaXMuaGFzRmlsdGVycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS53YXJuKFwiUmVjYWxjdWxhdGluZyBmaWx0ZXJlZCByb29tIGxpc3RcIik7XG4gICAgICAgIGNvbnN0IGZpbHRlcnMgPSBBcnJheS5mcm9tKHRoaXMuYWxsb3dlZEJ5RmlsdGVyLmtleXMoKSk7XG4gICAgICAgIGNvbnN0IG9yZGVyZWRGaWx0ZXJzID0gbmV3IEFycmF5VXRpbChmaWx0ZXJzKVxuICAgICAgICAgICAgLmdyb3VwQnkoZiA9PiBmLnJlbGF0aXZlUHJpb3JpdHkpXG4gICAgICAgICAgICAub3JkZXJCeShnZXRFbnVtVmFsdWVzKEZpbHRlclByaW9yaXR5KSlcbiAgICAgICAgICAgIC52YWx1ZTtcbiAgICAgICAgY29uc3QgbmV3TWFwOiBJVGFnTWFwID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdGFnSWQgb2YgT2JqZWN0LmtleXModGhpcy5jYWNoZWRSb29tcykpIHtcbiAgICAgICAgICAgIC8vIENoZWFwbHkgY2xvbmUgdGhlIHJvb21zIHNvIHdlIGNhbiBtb3JlIGVhc2lseSBkbyBvcGVyYXRpb25zIG9uIHRoZSBsaXN0LlxuICAgICAgICAgICAgLy8gV2Ugb3B0aW1pemUgb3VyIGxvb2t1cHMgYnkgdHJ5aW5nIHRvIHJlZHVjZSBzYW1wbGUgc2l6ZSBhcyBtdWNoIGFzIHBvc3NpYmxlXG4gICAgICAgICAgICAvLyB0byB0aGUgcm9vbXMgd2Uga25vdyB3aWxsIGJlIGRlZHVwZWQgYnkgdGhlIFNldC5cbiAgICAgICAgICAgIGNvbnN0IHJvb21zID0gdGhpcy5jYWNoZWRSb29tc1t0YWdJZF0ubWFwKHIgPT4gcik7IC8vIGNoZWFwIGNsb25lXG4gICAgICAgICAgICB0aGlzLnRyeUluc2VydFN0aWNreVJvb21Ub0ZpbHRlclNldChyb29tcywgdGFnSWQpO1xuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ1Jvb21zID0gcm9vbXMubWFwKHIgPT4gcik7XG4gICAgICAgICAgICBsZXQgYWxsb3dlZFJvb21zSW5UaGlzVGFnID0gW107XG4gICAgICAgICAgICBsZXQgbGFzdEZpbHRlclByaW9yaXR5ID0gb3JkZXJlZEZpbHRlcnNbMF0ucmVsYXRpdmVQcmlvcml0eTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmlsdGVyIG9mIG9yZGVyZWRGaWx0ZXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlci5yZWxhdGl2ZVByaW9yaXR5ICE9PSBsYXN0RmlsdGVyUHJpb3JpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRXZlcnkgdGltZSB0aGUgZmlsdGVyIGNoYW5nZXMgcHJpb3JpdHksIHdlIHdhbnQgbW9yZSBzcGVjaWZpYyBmaWx0ZXJpbmcuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRvIGFjY29tcGxpc2ggdGhhdCwgcmVzZXQgdGhlIHZhcmlhYmxlcyB0byBtYWtlIGl0IGxvb2sgbGlrZSB0aGUgcHJvY2Vzc1xuICAgICAgICAgICAgICAgICAgICAvLyBoYXMgc3RhcnRlZCBvdmVyLCBidXQgdXNpbmcgdGhlIGZpbHRlcmVkIHJvb21zIGFzIHRoZSBzZWVkLlxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdSb29tcyA9IGFsbG93ZWRSb29tc0luVGhpc1RhZztcbiAgICAgICAgICAgICAgICAgICAgYWxsb3dlZFJvb21zSW5UaGlzVGFnID0gW107XG4gICAgICAgICAgICAgICAgICAgIGxhc3RGaWx0ZXJQcmlvcml0eSA9IGZpbHRlci5yZWxhdGl2ZVByaW9yaXR5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXJlZFJvb21zID0gcmVtYWluaW5nUm9vbXMuZmlsdGVyKHIgPT4gZmlsdGVyLmlzVmlzaWJsZShyKSk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCByb29tIG9mIGZpbHRlcmVkUm9vbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gcmVtYWluaW5nUm9vbXMuaW5kZXhPZihyb29tKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSByZW1haW5pbmdSb29tcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYWxsb3dlZFJvb21zSW5UaGlzVGFnLnB1c2gocm9vbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3TWFwW3RhZ0lkXSA9IGFsbG93ZWRSb29tc0luVGhpc1RhZztcblxuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0RFQlVHXSAke25ld01hcFt0YWdJZF0ubGVuZ3RofS8ke3Jvb21zLmxlbmd0aH0gcm9vbXMgZmlsdGVyZWQgaW50byAke3RhZ0lkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWxsb3dlZFJvb21zID0gT2JqZWN0LnZhbHVlcyhuZXdNYXApLnJlZHVjZSgocnYsIHYpID0+IHsgcnYucHVzaCguLi52KTsgcmV0dXJuIHJ2OyB9LCA8Um9vbVtdPltdKTtcbiAgICAgICAgdGhpcy5hbGxvd2VkUm9vbXNCeUZpbHRlcnMgPSBuZXcgU2V0KGFsbG93ZWRSb29tcyk7XG4gICAgICAgIHRoaXMuZmlsdGVyZWRSb29tcyA9IG5ld01hcDtcbiAgICAgICAgdGhpcy5lbWl0KExJU1RfVVBEQVRFRF9FVkVOVCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlY2FsY3VsYXRlRmlsdGVyZWRSb29tc0ZvclRhZyh0YWdJZDogVGFnSUQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0ZpbHRlcnMpIHJldHVybjsgLy8gZG9uJ3QgYm90aGVyIGRvaW5nIHdvcmsgaWYgdGhlcmUncyBub3RoaW5nIHRvIGRvXG5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgY29uc29sZS5sb2coYFJlY2FsY3VsYXRpbmcgZmlsdGVyZWQgcm9vbXMgZm9yICR7dGFnSWR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHRoaXMuZmlsdGVyZWRSb29tc1t0YWdJZF07XG4gICAgICAgIGNvbnN0IHJvb21zID0gdGhpcy5jYWNoZWRSb29tc1t0YWdJZF0ubWFwKHIgPT4gcik7IC8vIGNoZWFwIGNsb25lXG4gICAgICAgIHRoaXMudHJ5SW5zZXJ0U3RpY2t5Um9vbVRvRmlsdGVyU2V0KHJvb21zLCB0YWdJZCk7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkUm9vbXMgPSByb29tcy5maWx0ZXIociA9PiB0aGlzLmFsbG93ZWRSb29tc0J5RmlsdGVycy5oYXMocikpO1xuICAgICAgICBpZiAoZmlsdGVyZWRSb29tcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmVkUm9vbXNbdGFnSWRdID0gZmlsdGVyZWRSb29tcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbREVCVUddICR7ZmlsdGVyZWRSb29tcy5sZW5ndGh9LyR7cm9vbXMubGVuZ3RofSByb29tcyBmaWx0ZXJlZCBpbnRvICR7dGFnSWR9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgdHJ5SW5zZXJ0U3RpY2t5Um9vbVRvRmlsdGVyU2V0KHJvb21zOiBSb29tW10sIHRhZ0lkOiBUYWdJRCkge1xuICAgICAgICBpZiAoIXRoaXMuX3N0aWNreVJvb20gfHwgIXRoaXMuX3N0aWNreVJvb20ucm9vbSB8fCB0aGlzLl9zdGlja3lSb29tLnRhZyAhPT0gdGFnSWQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuX3N0aWNreVJvb20ucG9zaXRpb247XG4gICAgICAgIGlmIChwb3NpdGlvbiA+PSByb29tcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJvb21zLnB1c2godGhpcy5fc3RpY2t5Um9vbS5yb29tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJvb21zLnNwbGljZShwb3NpdGlvbiwgMCwgdGhpcy5fc3RpY2t5Um9vbS5yb29tKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlY2FsY3VsYXRlIHRoZSBzdGlja3kgcm9vbSBwb3NpdGlvbi4gSWYgdGhpcyBpcyBiZWluZyBjYWxsZWQgaW4gcmVsYXRpb24gdG9cbiAgICAgKiBhIHNwZWNpZmljIHRhZyBiZWluZyB1cGRhdGVkLCBpdCBzaG91bGQgYmUgZ2l2ZW4gdG8gdGhpcyBmdW5jdGlvbiB0byBvcHRpbWl6ZVxuICAgICAqIHRoZSBjYWxsLlxuICAgICAqIEBwYXJhbSB1cGRhdGVkVGFnIFRoZSB0YWcgdGhhdCB3YXMgdXBkYXRlZCwgaWYgcG9zc2libGUuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlY2FsY3VsYXRlU3RpY2t5Um9vbSh1cGRhdGVkVGFnOiBUYWdJRCA9IG51bGwpOiB2b2lkIHtcbiAgICAgICAgLy8g8J+QiSBIZXJlIGJlIGRyYWdvbnMuXG4gICAgICAgIC8vIFRoaXMgZnVuY3Rpb24gZG9lcyBmYXIgdG9vIG11Y2ggZm9yIHdoYXQgaXQgc2hvdWxkLCBhbmQgaXMgY2FsbGVkIGJ5IG1hbnkgcGxhY2VzLlxuICAgICAgICAvLyBOb3Qgb25seSBpcyB0aGlzIHJlc3BvbnNpYmxlIGZvciBlbnN1cmluZyB0aGUgc3RpY2t5IHJvb20gaXMgaGVsZCBpbiBwbGFjZSBhdCBhbGxcbiAgICAgICAgLy8gdGltZXMsIGl0IGlzIGFsc28gcmVzcG9uc2libGUgZm9yIGVuc3VyaW5nIG91ciBjbG9uZSBvZiB0aGUgY2FjaGVkUm9vbXMgaXMgdXAgdG9cbiAgICAgICAgLy8gZGF0ZS4gSWYgZWl0aGVyIG9mIHRoZXNlIGRlc3luY3MsIHdlIHNlZSB3ZWlyZCBiZWhhdmlvdXIgbGlrZSBkdXBsaWNhdGVkIHJvb21zLFxuICAgICAgICAvLyBvdXRkYXRlZCBsaXN0cywgYW5kIG90aGVyIG5vbnNlbnNpY2FsIGlzc3VlcyB0aGF0IGFyZW4ndCBuZWNlc3NhcmlseSBvYnZpb3VzLlxuXG4gICAgICAgIGlmICghdGhpcy5fc3RpY2t5Um9vbSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyBzdGlja3kgcm9vbSwganVzdCBkbyBub3RoaW5nIHVzZWZ1bC5cbiAgICAgICAgICAgIGlmICghIXRoaXMuX2NhY2hlZFN0aWNreVJvb21zKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIGNhY2hlIGlmIHdlIHdvbid0IGJlIG5lZWRpbmcgaXRcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRTdGlja3lSb29tcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KExJU1RfVVBEQVRFRF9FVkVOVCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlZFN0aWNreVJvb21zIHx8ICF1cGRhdGVkVGFnKSB7XG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBHZW5lcmF0aW5nIGNsb25lIG9mIGNhY2hlZCByb29tcyBmb3Igc3RpY2t5IHJvb20gaGFuZGxpbmdgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHN0aWNraWVkVGFnTWFwOiBJVGFnTWFwID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhZ0lkIG9mIE9iamVjdC5rZXlzKHRoaXMuY2FjaGVkUm9vbXMpKSB7XG4gICAgICAgICAgICAgICAgc3RpY2tpZWRUYWdNYXBbdGFnSWRdID0gdGhpcy5jYWNoZWRSb29tc1t0YWdJZF0ubWFwKHIgPT4gcik7IC8vIHNoYWxsb3cgY2xvbmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2NhY2hlZFN0aWNreVJvb21zID0gc3RpY2tpZWRUYWdNYXA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodXBkYXRlZFRhZykge1xuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSB0YWcgaW5kaWNhdGVkIGJ5IHRoZSBjYWxsZXIsIGlmIHBvc3NpYmxlLiBUaGlzIGlzIG1vc3RseSB0byBlbnN1cmVcbiAgICAgICAgICAgIC8vIG91ciBjYWNoZSBpcyB1cCB0byBkYXRlLlxuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVwbGFjaW5nIGNhY2hlZCBzdGlja3kgcm9vbXMgZm9yICR7dXBkYXRlZFRhZ31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2NhY2hlZFN0aWNreVJvb21zW3VwZGF0ZWRUYWddID0gdGhpcy5jYWNoZWRSb29tc1t1cGRhdGVkVGFnXS5tYXAociA9PiByKTsgLy8gc2hhbGxvdyBjbG9uZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHRyeSB0byBpbnNlcnQgdGhlIHN0aWNreSByb29tLCBpZiB3ZSBuZWVkIHRvLlxuICAgICAgICAvLyBXZSBuZWVkIHRvIGlmIHRoZXJlJ3Mgbm8gdXBkYXRlZCB0YWcgKHdlIHJlZ2VubmVkIHRoZSB3aG9sZSBjYWNoZSkgb3IgaWYgdGhlIHRhZ1xuICAgICAgICAvLyB3ZSBtaWdodCBoYXZlIHVwZGF0ZWQgZnJvbSB0aGUgY2FjaGUgaXMgYWxzbyBvdXIgc3RpY2t5IHJvb20uXG4gICAgICAgIGNvbnN0IHN0aWNreSA9IHRoaXMuX3N0aWNreVJvb207XG4gICAgICAgIGlmICghdXBkYXRlZFRhZyB8fCB1cGRhdGVkVGFnID09PSBzdGlja3kudGFnKSB7XG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICBgSW5zZXJ0aW5nIHN0aWNreSByb29tICR7c3RpY2t5LnJvb20ucm9vbUlkfSBhdCBwb3NpdGlvbiAke3N0aWNreS5wb3NpdGlvbn0gaW4gJHtzdGlja3kudGFnfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2NhY2hlZFN0aWNreVJvb21zW3N0aWNreS50YWddLnNwbGljZShzdGlja3kucG9zaXRpb24sIDAsIHN0aWNreS5yb29tKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmFsbHksIHRyaWdnZXIgYW4gdXBkYXRlXG4gICAgICAgIHRoaXMuZW1pdChMSVNUX1VQREFURURfRVZFTlQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFza3MgdGhlIEFsZ29yaXRobSB0byByZWdlbmVyYXRlIGFsbCBsaXN0cywgdXNpbmcgdGhlIHRhZ3MgZ2l2ZW5cbiAgICAgKiBhcyByZWZlcmVuY2UgZm9yIHdoaWNoIGxpc3RzIHRvIGdlbmVyYXRlIGFuZCB3aGljaCB3YXkgdG8gZ2VuZXJhdGVcbiAgICAgKiB0aGVtLlxuICAgICAqIEBwYXJhbSB7SVRhZ1NvcnRpbmdNYXB9IHRhZ1NvcnRpbmdNYXAgVGhlIHRhZ3MgdG8gZ2VuZXJhdGUuXG4gICAgICogQHBhcmFtIHtJTGlzdE9yZGVyaW5nTWFwfSBsaXN0T3JkZXJpbmdNYXAgVGhlIG9yZGVyaW5nIG9mIHRob3NlIHRhZ3MuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Kj59IEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIGNvbXBsZXRlLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBwb3B1bGF0ZVRhZ3ModGFnU29ydGluZ01hcDogSVRhZ1NvcnRpbmdNYXAsIGxpc3RPcmRlcmluZ01hcDogSUxpc3RPcmRlcmluZ01hcCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGlmICghdGFnU29ydGluZ01hcCkgdGhyb3cgbmV3IEVycm9yKGBTb3J0aW5nIG1hcCBjYW5ub3QgYmUgbnVsbCBvciBlbXB0eWApO1xuICAgICAgICBpZiAoIWxpc3RPcmRlcmluZ01hcCkgdGhyb3cgbmV3IEVycm9yKGBPcmRlcmluZyBtYSBjYW5ub3QgYmUgbnVsbCBvciBlbXB0eWApO1xuICAgICAgICBpZiAoYXJyYXlIYXNEaWZmKE9iamVjdC5rZXlzKHRhZ1NvcnRpbmdNYXApLCBPYmplY3Qua2V5cyhsaXN0T3JkZXJpbmdNYXApKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCb3RoIG1hcHMgbXVzdCBjb250YWluIHRoZSBleGFjdCBzYW1lIHRhZ3NgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNvcnRBbGdvcml0aG1zID0gdGFnU29ydGluZ01hcDtcbiAgICAgICAgdGhpcy5saXN0QWxnb3JpdGhtcyA9IGxpc3RPcmRlcmluZ01hcDtcbiAgICAgICAgdGhpcy5hbGdvcml0aG1zID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdGFnIG9mIE9iamVjdC5rZXlzKHRhZ1NvcnRpbmdNYXApKSB7XG4gICAgICAgICAgICB0aGlzLmFsZ29yaXRobXNbdGFnXSA9IGdldExpc3RBbGdvcml0aG1JbnN0YW5jZSh0aGlzLmxpc3RBbGdvcml0aG1zW3RhZ10sIHRhZywgdGhpcy5zb3J0QWxnb3JpdGhtc1t0YWddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZXRLbm93blJvb21zKHRoaXMucm9vbXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYW4gb3JkZXJlZCBzZXQgb2Ygcm9vbXMgZm9yIHRoZSBhbGwga25vd24gdGFncywgZmlsdGVyZWQuXG4gICAgICogQHJldHVybnMge0lUYWdNYXB9IFRoZSBjYWNoZWQgbGlzdCBvZiByb29tcywgb3JkZXJlZCxcbiAgICAgKiBmb3IgZWFjaCB0YWcuIE1heSBiZSBlbXB0eSwgYnV0IG5ldmVyIG51bGwvdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRPcmRlcmVkUm9vbXMoKTogSVRhZ01hcCB7XG4gICAgICAgIGlmICghdGhpcy5oYXNGaWx0ZXJzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkU3RpY2t5Um9vbXMgfHwgdGhpcy5jYWNoZWRSb29tcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJlZFJvb21zO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRVbmZpbHRlcmVkUm9vbXMoKTogSVRhZ01hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRTdGlja3lSb29tcyB8fCB0aGlzLmNhY2hlZFJvb21zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgcmV0dXJucyB0aGUgc2FtZSBhcyBnZXRPcmRlcmVkUm9vbXMoKSwgYnV0IHdpdGhvdXQgdGhlIHN0aWNreSByb29tXG4gICAgICogbWFwIGFzIGl0IGNhdXNlcyBpc3N1ZXMgZm9yIHN0aWNreSByb29tIGhhbmRsaW5nIChzZWUgc3RpY2t5IHJvb20gaGFuZGxpbmdcbiAgICAgKiBmb3IgbW9yZSBpbmZvcm1hdGlvbikuXG4gICAgICogQHJldHVybnMge0lUYWdNYXB9IFRoZSBjYWNoZWQgbGlzdCBvZiByb29tcywgb3JkZXJlZCxcbiAgICAgKiBmb3IgZWFjaCB0YWcuIE1heSBiZSBlbXB0eSwgYnV0IG5ldmVyIG51bGwvdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0T3JkZXJlZFJvb21zV2l0aG91dFN0aWNreSgpOiBJVGFnTWFwIHtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0ZpbHRlcnMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZFJvb21zO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlcmVkUm9vbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VlZHMgdGhlIEFsZ29yaXRobSB3aXRoIGEgc2V0IG9mIHJvb21zLiBUaGUgYWxnb3JpdGhtIHdpbGwgZGlzY2FyZCBhbGxcbiAgICAgKiBwcmV2aW91c2x5IGtub3duIGluZm9ybWF0aW9uIGFuZCBpbnN0ZWFkIHVzZSB0aGVzZSByb29tcyBpbnN0ZWFkLlxuICAgICAqIEBwYXJhbSB7Um9vbVtdfSByb29tcyBUaGUgcm9vbXMgdG8gZm9yY2UgdGhlIGFsZ29yaXRobSB0byB1c2UuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Kj59IEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIGNvbXBsZXRlLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBzZXRLbm93blJvb21zKHJvb21zOiBSb29tW10pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQocm9vbXMpKSB0aHJvdyBuZXcgRXJyb3IoYEFycmF5IG9mIHJvb21zIGNhbm5vdCBiZSBudWxsYCk7XG4gICAgICAgIGlmICghdGhpcy5zb3J0QWxnb3JpdGhtcykgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc2V0IGtub3duIHJvb21zIHdpdGhvdXQgYSB0YWcgc29ydGluZyBtYXBgKTtcblxuICAgICAgICBjb25zb2xlLndhcm4oXCJSZXNldHRpbmcga25vd24gcm9vbXMsIGluaXRpYXRpbmcgcmVnZW5lcmF0aW9uXCIpO1xuXG4gICAgICAgIC8vIEJlZm9yZSB3ZSBnbyBhbnkgZnVydGhlciB3ZSBuZWVkIHRvIGNsZWFyIChidXQgcmVtZW1iZXIpIHRoZSBzdGlja3kgcm9vbSB0b1xuICAgICAgICAvLyBhdm9pZCBhY2NpZGVudGFsbHkgZHVwbGljYXRpbmcgaXQgaW4gdGhlIGxpc3QuXG4gICAgICAgIGNvbnN0IG9sZFN0aWNreVJvb20gPSB0aGlzLl9zdGlja3lSb29tO1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZVN0aWNreVJvb20obnVsbCk7XG5cbiAgICAgICAgdGhpcy5yb29tcyA9IHJvb21zO1xuXG4gICAgICAgIGNvbnN0IG5ld1RhZ3M6IElUYWdNYXAgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB0YWdJZCBpbiB0aGlzLnNvcnRBbGdvcml0aG1zKSB7XG4gICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNVbmZpbHRlcmVkRm9ySW5Mb29wXG4gICAgICAgICAgICBuZXdUYWdzW3RhZ0lkXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2UgY2FuIGF2b2lkIGRvaW5nIHdvcmssIGRvIHNvLlxuICAgICAgICBpZiAoIXJvb21zLmxlbmd0aCkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5nZW5lcmF0ZUZyZXNoVGFncyhuZXdUYWdzKTsgLy8ganVzdCBpbiBjYXNlIGl0IHdhbnRzIHRvIGRvIHNvbWV0aGluZ1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRSb29tcyA9IG5ld1RhZ3M7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGxpdCBvdXQgdGhlIGVhc3kgcm9vbXMgZmlyc3QgKGxlYXZlIGFuZCBpbnZpdGUpXG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXBzID0gc3BsaXRSb29tc0J5TWVtYmVyc2hpcChyb29tcyk7XG4gICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiBtZW1iZXJzaGlwc1tFZmZlY3RpdmVNZW1iZXJzaGlwLkludml0ZV0pIHtcbiAgICAgICAgICAgIG5ld1RhZ3NbRGVmYXVsdFRhZ0lELkludml0ZV0ucHVzaChyb29tKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHJvb20gb2YgbWVtYmVyc2hpcHNbRWZmZWN0aXZlTWVtYmVyc2hpcC5MZWF2ZV0pIHtcbiAgICAgICAgICAgIG5ld1RhZ3NbRGVmYXVsdFRhZ0lELkFyY2hpdmVkXS5wdXNoKHJvb20pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHByb2Nlc3MgYWxsIHRoZSBqb2luZWQgcm9vbXMuIFRoaXMgaXMgYSBiaXQgbW9yZSBjb21wbGljYXRlZFxuICAgICAgICBmb3IgKGNvbnN0IHJvb20gb2YgbWVtYmVyc2hpcHNbRWZmZWN0aXZlTWVtYmVyc2hpcC5Kb2luXSkge1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IHRoaXMuZ2V0VGFnc09mSm9pbmVkUm9vbShyb29tKTtcblxuICAgICAgICAgICAgbGV0IGluVGFnID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKG5ld1RhZ3NbdGFnXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhZ3NbdGFnXS5wdXNoKHJvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5UYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWluVGFnKSB7XG4gICAgICAgICAgICAgICAgaWYgKERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbS5yb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhZ3NbRGVmYXVsdFRhZ0lELkRNXS5wdXNoKHJvb20pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhZ3NbRGVmYXVsdFRhZ0lELlVudGFnZ2VkXS5wdXNoKHJvb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuZ2VuZXJhdGVGcmVzaFRhZ3MobmV3VGFncyk7XG5cbiAgICAgICAgdGhpcy5jYWNoZWRSb29tcyA9IG5ld1RhZ3M7XG4gICAgICAgIHRoaXMudXBkYXRlVGFnc0Zyb21DYWNoZSgpO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlRmlsdGVyZWRSb29tcygpO1xuXG4gICAgICAgIC8vIE5vdyB0aGF0IHdlJ3ZlIGZpbmlzaGVkIGdlbmVyYXRpb24sIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSBzdGlja3kgcm9vbSB0byB3aGF0XG4gICAgICAgIC8vIGl0IHdhcy4gSXQncyBlbnRpcmVseSBwb3NzaWJsZSB0aGF0IGl0IGNoYW5nZWQgbGlzdHMgdGhvdWdoLCBzbyBpZiBpdCBkaWQgdGhlblxuICAgICAgICAvLyB3ZSBhbHNvIGhhdmUgdG8gdXBkYXRlIHRoZSBwb3NpdGlvbiBvZiBpdC5cbiAgICAgICAgaWYgKG9sZFN0aWNreVJvb20gJiYgb2xkU3RpY2t5Um9vbS5yb29tKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZVN0aWNreVJvb20ob2xkU3RpY2t5Um9vbS5yb29tKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGlja3lSb29tICYmIHRoaXMuX3N0aWNreVJvb20ucm9vbSkgeyAvLyBqdXN0IGluIGNhc2UgdGhlIHVwZGF0ZSBkb2Vzbid0IGdvIGFjY29yZGluZyB0byBwbGFuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3N0aWNreVJvb20udGFnICE9PSBvbGRTdGlja3lSb29tLnRhZykge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBwdXQgdGhlIHN0aWNreSByb29tIGF0IHRoZSB0b3Agb2YgdGhlIGxpc3QgdG8gdHJlYXQgaXQgYXMgYW4gb2J2aW91cyB0YWcgY2hhbmdlLlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGlja3lSb29tLnBvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVN0aWNreVJvb20odGhpcy5fc3RpY2t5Um9vbS50YWcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRUYWdzRm9yUm9vbShyb29tOiBSb29tKTogVGFnSURbXSB7XG4gICAgICAgIGNvbnN0IHRhZ3M6IFRhZ0lEW10gPSBbXTtcblxuICAgICAgICBjb25zdCBtZW1iZXJzaGlwID0gZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcChyb29tLmdldE15TWVtYmVyc2hpcCgpKTtcbiAgICAgICAgaWYgKG1lbWJlcnNoaXAgPT09IEVmZmVjdGl2ZU1lbWJlcnNoaXAuSW52aXRlKSB7XG4gICAgICAgICAgICB0YWdzLnB1c2goRGVmYXVsdFRhZ0lELkludml0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc2hpcCA9PT0gRWZmZWN0aXZlTWVtYmVyc2hpcC5MZWF2ZSkge1xuICAgICAgICAgICAgdGFncy5wdXNoKERlZmF1bHRUYWdJRC5BcmNoaXZlZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWdzLnB1c2goLi4udGhpcy5nZXRUYWdzT2ZKb2luZWRSb29tKHJvb20pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGFncy5sZW5ndGgpIHRhZ3MucHVzaChEZWZhdWx0VGFnSUQuVW50YWdnZWQpO1xuXG4gICAgICAgIHJldHVybiB0YWdzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VGFnc09mSm9pbmVkUm9vbShyb29tOiBSb29tKTogVGFnSURbXSB7XG4gICAgICAgIGxldCB0YWdzID0gT2JqZWN0LmtleXMocm9vbS50YWdzIHx8IHt9KTtcblxuICAgICAgICBpZiAodGFncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiBpdCdzIGEgRE0gaWYgaXQgaXNuJ3QgYW55dGhpbmcgZWxzZVxuICAgICAgICAgICAgaWYgKERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbS5yb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgdGFncyA9IFtEZWZhdWx0VGFnSUQuRE1dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhZ3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgcm9vbXNUb1RhZ3MgbWFwXG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGVUYWdzRnJvbUNhY2hlKCkge1xuICAgICAgICBjb25zdCBuZXdNYXAgPSB7fTtcblxuICAgICAgICBjb25zdCB0YWdzID0gT2JqZWN0LmtleXModGhpcy5jYWNoZWRSb29tcyk7XG4gICAgICAgIGZvciAoY29uc3QgdGFnSWQgb2YgdGFncykge1xuICAgICAgICAgICAgY29uc3Qgcm9vbXMgPSB0aGlzLmNhY2hlZFJvb21zW3RhZ0lkXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiByb29tcykge1xuICAgICAgICAgICAgICAgIGlmICghbmV3TWFwW3Jvb20ucm9vbUlkXSkgbmV3TWFwW3Jvb20ucm9vbUlkXSA9IFtdO1xuICAgICAgICAgICAgICAgIG5ld01hcFtyb29tLnJvb21JZF0ucHVzaCh0YWdJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJvb21JZHNUb1RhZ3MgPSBuZXdNYXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIEFsZ29yaXRobSBiZWxpZXZlcyBhIGNvbXBsZXRlIHJlZ2VuZXJhdGlvbiBvZiB0aGUgZXhpc3RpbmdcbiAgICAgKiBsaXN0cyBpcyBuZWVkZWQuXG4gICAgICogQHBhcmFtIHtJVGFnTWFwfSB1cGRhdGVkVGFnTWFwIFRoZSB0YWcgbWFwIHdoaWNoIG5lZWRzIHBvcHVsYXRpbmcuIEVhY2ggdGFnXG4gICAgICogd2lsbCBhbHJlYWR5IGhhdmUgdGhlIHJvb21zIHdoaWNoIGJlbG9uZyB0byBpdCAtIHRoZXkganVzdCBuZWVkIG9yZGVyaW5nLiBNdXN0XG4gICAgICogYmUgbXV0YXRlZCBpbiBwbGFjZS5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn0gQSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdoZW4gY29tcGxldGUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZUZyZXNoVGFncyh1cGRhdGVkVGFnTWFwOiBJVGFnTWFwKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKCF0aGlzLmFsZ29yaXRobXMpIHRocm93IG5ldyBFcnJvcihcIk5vdCByZWFkeTogbm8gYWxnb3JpdGhtcyB0byBkZXRlcm1pbmUgdGFncyBmcm9tXCIpO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFnIG9mIE9iamVjdC5rZXlzKHVwZGF0ZWRUYWdNYXApKSB7XG4gICAgICAgICAgICBjb25zdCBhbGdvcml0aG06IE9yZGVyaW5nQWxnb3JpdGhtID0gdGhpcy5hbGdvcml0aG1zW3RhZ107XG4gICAgICAgICAgICBpZiAoIWFsZ29yaXRobSkgdGhyb3cgbmV3IEVycm9yKGBObyBhbGdvcml0aG0gZm9yICR7dGFnfWApO1xuXG4gICAgICAgICAgICBhd2FpdCBhbGdvcml0aG0uc2V0Um9vbXModXBkYXRlZFRhZ01hcFt0YWddKTtcbiAgICAgICAgICAgIHVwZGF0ZWRUYWdNYXBbdGFnXSA9IGFsZ29yaXRobS5vcmRlcmVkUm9vbXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBc2tzIHRoZSBBbGdvcml0aG0gdG8gdXBkYXRlIGl0cyBrbm93bGVkZ2Ugb2YgYSByb29tLiBGb3IgZXhhbXBsZSwgd2hlblxuICAgICAqIGEgdXNlciB0YWdzIGEgcm9vbSwgam9pbnMvY3JlYXRlcyBhIHJvb20sIG9yIGxlYXZlcyBhIHJvb20gdGhlIEFsZ29yaXRobVxuICAgICAqIHNob3VsZCBiZSB0b2xkIHRoYXQgdGhlIHJvb20ncyBpbmZvIG1pZ2h0IGhhdmUgY2hhbmdlZC4gVGhlIEFsZ29yaXRobVxuICAgICAqIG1heSBuby1vcCB0aGlzIHJlcXVlc3QgaWYgbm8gY2hhbmdlcyBhcmUgcmVxdWlyZWQuXG4gICAgICogQHBhcmFtIHtSb29tfSByb29tIFRoZSByb29tIHdoaWNoIG1pZ2h0IGhhdmUgYWZmZWN0ZWQgc29ydGluZy5cbiAgICAgKiBAcGFyYW0ge1Jvb21VcGRhdGVDYXVzZX0gY2F1c2UgVGhlIHJlYXNvbiBmb3IgdGhlIHVwZGF0ZSBiZWluZyB0cmlnZ2VyZWQuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IEEgcHJvbWlzZSB3aGljaCByZXNvbHZlIHRvIHRydWUgb3IgZmFsc2VcbiAgICAgKiBkZXBlbmRpbmcgb24gd2hldGhlciBvciBub3QgZ2V0T3JkZXJlZFJvb21zKCkgc2hvdWxkIGJlIGNhbGxlZCBhZnRlclxuICAgICAqIHByb2Nlc3NpbmcuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGhhbmRsZVJvb21VcGRhdGUocm9vbTogUm9vbSwgY2F1c2U6IFJvb21VcGRhdGVDYXVzZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSGFuZGxlIHJvb20gdXBkYXRlIGZvciAke3Jvb20ucm9vbUlkfSBjYWxsZWQgd2l0aCBjYXVzZSAke2NhdXNlfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5hbGdvcml0aG1zKSB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgcmVhZHk6IG5vIGFsZ29yaXRobXMgdG8gZGV0ZXJtaW5lIHRhZ3MgZnJvbVwiKTtcblxuICAgICAgICAvLyBOb3RlOiBjaGVjayB0aGUgaXNTdGlja3kgYWdhaW5zdCB0aGUgcm9vbSBJRCBqdXN0IGluIGNhc2UgdGhlIHJlZmVyZW5jZSBpcyB3cm9uZ1xuICAgICAgICBjb25zdCBpc1N0aWNreSA9IHRoaXMuX3N0aWNreVJvb20gJiYgdGhpcy5fc3RpY2t5Um9vbS5yb29tICYmIHRoaXMuX3N0aWNreVJvb20ucm9vbS5yb29tSWQgPT09IHJvb20ucm9vbUlkO1xuICAgICAgICBpZiAoY2F1c2UgPT09IFJvb21VcGRhdGVDYXVzZS5OZXdSb29tKSB7XG4gICAgICAgICAgICBjb25zdCBpc0Zvckxhc3RTdGlja3kgPSB0aGlzLl9sYXN0U3RpY2t5Um9vbSAmJiB0aGlzLl9sYXN0U3RpY2t5Um9vbS5yb29tID09PSByb29tO1xuICAgICAgICAgICAgY29uc3Qgcm9vbVRhZ3MgPSB0aGlzLnJvb21JZHNUb1RhZ3Nbcm9vbS5yb29tSWRdO1xuICAgICAgICAgICAgY29uc3QgaGFzVGFncyA9IHJvb21UYWdzICYmIHJvb21UYWdzLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgICAgIC8vIERvbid0IGNoYW5nZSB0aGUgY2F1c2UgaWYgdGhlIGxhc3Qgc3RpY2t5IHJvb20gaXMgYmVpbmcgcmUtYWRkZWQuIElmIHdlIGZhaWwgdG9cbiAgICAgICAgICAgIC8vIHBhc3MgdGhlIGNhdXNlIHRocm91Z2ggYXMgTmV3Um9vbSwgd2UnbGwgZmFpbCB0byBsaWUgdG8gdGhlIGFsZ29yaXRobSBhbmQgdGh1c1xuICAgICAgICAgICAgLy8gbG9zZSB0aGUgcm9vbS5cbiAgICAgICAgICAgIGlmIChoYXNUYWdzICYmICFpc0Zvckxhc3RTdGlja3kpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7cm9vbS5yb29tSWR9IGlzIHJlcG9ydGVkbHkgbmV3IGJ1dCBpcyBhbHJlYWR5IGtub3duIC0gYXNzdW1pbmcgVGFnQ2hhbmdlIGluc3RlYWRgKTtcbiAgICAgICAgICAgICAgICBjYXVzZSA9IFJvb21VcGRhdGVDYXVzZS5Qb3NzaWJsZVRhZ0NoYW5nZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSByb29tIGlzIGtub3duIGZpcnN0XG4gICAgICAgICAgICBsZXQga25vd25Sb29tUmVmID0gdGhpcy5yb29tcy5pbmNsdWRlcyhyb29tKTtcbiAgICAgICAgICAgIGlmIChoYXNUYWdzICYmICFrbm93blJvb21SZWYpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7cm9vbS5yb29tSWR9IG1pZ2h0IGJlIGEgcmVmZXJlbmNlIGNoYW5nZSAtIGF0dGVtcHRpbmcgdG8gdXBkYXRlIHJlZmVyZW5jZWApO1xuICAgICAgICAgICAgICAgIHRoaXMucm9vbXMgPSB0aGlzLnJvb21zLm1hcChyID0+IHIucm9vbUlkID09PSByb29tLnJvb21JZCA/IHJvb20gOiByKTtcbiAgICAgICAgICAgICAgICBrbm93blJvb21SZWYgPSB0aGlzLnJvb21zLmluY2x1ZGVzKHJvb20pO1xuICAgICAgICAgICAgICAgIGlmICgha25vd25Sb29tUmVmKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtyb29tLnJvb21JZH0gaXMgc3RpbGwgbm90IHJlZmVyZW5jZWQuIEl0IG1heSBiZSBzdGlja3kuYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIHRhZ3MgZm9yIGEgcm9vbSBhbmQgZG9uJ3QgaGF2ZSB0aGUgcm9vbSByZWZlcmVuY2VkLCBzb21ldGhpbmcgd2VudCBob3JyaWJseVxuICAgICAgICAgICAgLy8gd3JvbmcgLSB0aGUgcmVmZXJlbmNlIHNob3VsZCBoYXZlIGJlZW4gdXBkYXRlZCBhYm92ZS5cbiAgICAgICAgICAgIGlmIChoYXNUYWdzICYmICFrbm93blJvb21SZWYgJiYgIWlzU3RpY2t5KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3Jvb20ucm9vbUlkfSBpcyBtaXNzaW5nIGZyb20gcm9vbSBhcnJheSBidXQgaXMga25vd24gLSB0cnlpbmcgdG8gZmluZCBkdXBsaWNhdGVgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGlrZSBhYm92ZSwgdXBkYXRlIHRoZSByZWZlcmVuY2UgdG8gdGhlIHN0aWNreSByb29tIGlmIHdlIG5lZWQgdG9cbiAgICAgICAgICAgIGlmIChoYXNUYWdzICYmIGlzU3RpY2t5KSB7XG4gICAgICAgICAgICAgICAgLy8gR28gZGlyZWN0bHkgaW4gYW5kIHNldCB0aGUgc3RpY2t5IHJvb20ncyBuZXcgcmVmZXJlbmNlLCBiZWluZyBjYXJlZnVsIG5vdFxuICAgICAgICAgICAgICAgIC8vIHRvIHRyaWdnZXIgYSBzdGlja3kgcm9vbSB1cGRhdGUgb3Vyc2VsdmVzLlxuICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNreVJvb20ucm9vbSA9IHJvb207XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGFmdGVyIGFsbCB0aGF0IHdlJ3JlIHN0aWxsIGEgTmV3Um9vbSB1cGRhdGUsIGFkZCB0aGUgcm9vbSBpZiBhcHBsaWNhYmxlLlxuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgZG8gdGhpcyBmb3IgdGhlIHN0aWNreSByb29tIChiZWNhdXNlIGl0IGNhdXNlcyBkdXBsaWNhdGlvbiBpc3N1ZXMpXG4gICAgICAgICAgICAvLyBvciBpZiB3ZSBrbm93IGFib3V0IHRoZSByZWZlcmVuY2UgKGFzIGl0IHNob3VsZCBiZSByZXBsYWNlZCkuXG4gICAgICAgICAgICBpZiAoY2F1c2UgPT09IFJvb21VcGRhdGVDYXVzZS5OZXdSb29tICYmICFpc1N0aWNreSAmJiAha25vd25Sb29tUmVmKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb29tcy5wdXNoKHJvb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRpZFRhZ0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICBpZiAoY2F1c2UgPT09IFJvb21VcGRhdGVDYXVzZS5Qb3NzaWJsZVRhZ0NoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgb2xkVGFncyA9IHRoaXMucm9vbUlkc1RvVGFnc1tyb29tLnJvb21JZF0gfHwgW107XG4gICAgICAgICAgICBjb25zdCBuZXdUYWdzID0gdGhpcy5nZXRUYWdzRm9yUm9vbShyb29tKTtcbiAgICAgICAgICAgIGNvbnN0IGRpZmYgPSBhcnJheURpZmYob2xkVGFncywgbmV3VGFncyk7XG4gICAgICAgICAgICBpZiAoZGlmZi5yZW1vdmVkLmxlbmd0aCA+IDAgfHwgZGlmZi5hZGRlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBybVRhZyBvZiBkaWZmLnJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJlbW92aW5nICR7cm9vbS5yb29tSWR9IGZyb20gJHtybVRhZ31gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGdvcml0aG06IE9yZGVyaW5nQWxnb3JpdGhtID0gdGhpcy5hbGdvcml0aG1zW3JtVGFnXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhbGdvcml0aG0pIHRocm93IG5ldyBFcnJvcihgTm8gYWxnb3JpdGhtIGZvciAke3JtVGFnfWApO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhbGdvcml0aG0uaGFuZGxlUm9vbVVwZGF0ZShyb29tLCBSb29tVXBkYXRlQ2F1c2UuUm9vbVJlbW92ZWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRSb29tc1tybVRhZ10gPSBhbGdvcml0aG0ub3JkZXJlZFJvb21zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlRmlsdGVyZWRSb29tc0ZvclRhZyhybVRhZyk7IC8vIHVwZGF0ZSBmaWx0ZXIgdG8gcmUtc29ydCB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbShybVRhZyk7IC8vIHVwZGF0ZSBzdGlja3kgcm9vbSB0byBtYWtlIHN1cmUgaXQgbW92ZXMgaWYgbmVlZGVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYWRkVGFnIG9mIGRpZmYuYWRkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEFkZGluZyAke3Jvb20ucm9vbUlkfSB0byAke2FkZFRhZ31gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGdvcml0aG06IE9yZGVyaW5nQWxnb3JpdGhtID0gdGhpcy5hbGdvcml0aG1zW2FkZFRhZ107XG4gICAgICAgICAgICAgICAgICAgIGlmICghYWxnb3JpdGhtKSB0aHJvdyBuZXcgRXJyb3IoYE5vIGFsZ29yaXRobSBmb3IgJHthZGRUYWd9YCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGFsZ29yaXRobS5oYW5kbGVSb29tVXBkYXRlKHJvb20sIFJvb21VcGRhdGVDYXVzZS5OZXdSb29tKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVkUm9vbXNbYWRkVGFnXSA9IGFsZ29yaXRobS5vcmRlcmVkUm9vbXM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSB0YWcgbWFwIHNvIHdlIGRvbid0IHJlZ2VuIGl0IGluIGEgbW9tZW50XG4gICAgICAgICAgICAgICAgdGhpcy5yb29tSWRzVG9UYWdzW3Jvb20ucm9vbUlkXSA9IG5ld1RhZ3M7XG5cbiAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYENoYW5naW5nIHVwZGF0ZSBjYXVzZSBmb3IgJHtyb29tLnJvb21JZH0gdG8gVGltZWxpbmUgdG8gc29ydCByb29tc2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXVzZSA9IFJvb21VcGRhdGVDYXVzZS5UaW1lbGluZTtcbiAgICAgICAgICAgICAgICBkaWRUYWdDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFkdmFuY2VkUm9vbUxpc3RMb2dnaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJlY2VpdmVkIG5vLW9wIHVwZGF0ZSBmb3IgJHtyb29tLnJvb21JZH0gLSBjaGFuZ2luZyB0byBUaW1lbGluZSB1cGRhdGVgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F1c2UgPSBSb29tVXBkYXRlQ2F1c2UuVGltZWxpbmU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkaWRUYWdDaGFuZ2UgJiYgaXNTdGlja3kpIHtcbiAgICAgICAgICAgICAgICAvLyBNYW51YWxseSB1cGRhdGUgdGhlIHRhZyBmb3IgdGhlIHN0aWNreSByb29tIHdpdGhvdXQgdHJpZ2dlcmluZyBhIHN0aWNreSByb29tXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlLiBUaGUgdXBkYXRlIHdpbGwgYmUgaGFuZGxlZCBpbXBsaWNpdGx5IGJ5IHRoZSBzdGlja3kgcm9vbSBoYW5kbGluZyBhbmRcbiAgICAgICAgICAgICAgICAvLyByZXF1aXJlcyBubyBjaGFuZ2VzIG9uIG91ciBwYXJ0LCBpZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgc3RpY2t5IHJvb20gY2hhbmdlLlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sYXN0U3RpY2t5Um9vbSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGlja3lSb29tID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogdGhpcy5yb29tSWRzVG9UYWdzW3Jvb20ucm9vbUlkXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAwLCAvLyByaWdodCBhdCB0aGUgdG9wIGFzIGl0IGNoYW5nZWQgdGFnc1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gY2xlYXIgdGhlIGxvY2sgYXMgdGhlIHN0aWNreSByb29tIGNoYW5nZSB3aWxsIHRyaWdnZXIgdXBkYXRlcy5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZXRTdGlja3lSb29tKHJvb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSB1cGRhdGUgaXMgZm9yIGEgcm9vbSBjaGFuZ2Ugd2hpY2ggbWlnaHQgYmUgdGhlIHN0aWNreSByb29tLCBwcmV2ZW50IGl0LiBXZVxuICAgICAgICAvLyBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBjYXVzZXMgKE5ld1Jvb20gYW5kIFJvb21SZW1vdmVkKSBhcmUgc3RpbGwgdHJpZ2dlcmVkIHRob3VnaFxuICAgICAgICAvLyBhcyB0aGUgc3RpY2t5IHJvb20gcmVsaWVzIG9uIHRoaXMuXG4gICAgICAgIGlmIChjYXVzZSAhPT0gUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20gJiYgY2F1c2UgIT09IFJvb21VcGRhdGVDYXVzZS5Sb29tUmVtb3ZlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RpY2t5Um9vbSA9PT0gcm9vbSkge1xuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtSb29tTGlzdERlYnVnXSBSZWNlaXZlZCAke2NhdXNlfSB1cGRhdGUgZm9yIHN0aWNreSByb29tICR7cm9vbS5yb29tSWR9IC0gaWdub3JpbmdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnJvb21JZHNUb1RhZ3Nbcm9vbS5yb29tSWRdKSB7XG4gICAgICAgICAgICBpZiAoQ0FVU0VTX1JFUVVJUklOR19ST09NLmluY2x1ZGVzKGNhdXNlKSkge1xuICAgICAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFNraXBwaW5nIHRhZyB1cGRhdGUgZm9yICR7cm9vbS5yb29tSWR9IGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyBhYm91dCB0aGUgcm9vbWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZGVidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0NjAyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBVcGRhdGluZyB0YWdzIGZvciByb29tICR7cm9vbS5yb29tSWR9ICgke3Jvb20ubmFtZX0pYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgdGFncyBmb3IgdGhlIHJvb20gYW5kIHBvcHVsYXRlIHRoZSBjYWNoZVxuICAgICAgICAgICAgY29uc3Qgcm9vbVRhZ3MgPSB0aGlzLmdldFRhZ3NGb3JSb29tKHJvb20pLmZpbHRlcih0ID0+ICFpc051bGxPclVuZGVmaW5lZCh0aGlzLmNhY2hlZFJvb21zW3RdKSk7XG5cbiAgICAgICAgICAgIC8vIFwiVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuXCIgY29uZGl0aW9uIC0gd2Ugc3BlY2lmeSBEZWZhdWx0VGFnSUQuVW50YWdnZWQgaW4gZ2V0VGFnc0ZvclJvb20oKSxcbiAgICAgICAgICAgIC8vIHdoaWNoIG1lYW5zIHdlIHNob3VsZCAqYWx3YXlzKiBoYXZlIGEgdGFnIHRvIGdvIG9mZiBvZi5cbiAgICAgICAgICAgIGlmICghcm9vbVRhZ3MubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoYFRhZ3MgY2Fubm90IGJlIGRldGVybWluZWQgZm9yICR7cm9vbS5yb29tSWR9YCk7XG5cbiAgICAgICAgICAgIHRoaXMucm9vbUlkc1RvVGFnc1tyb29tLnJvb21JZF0gPSByb29tVGFncztcblxuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Jvb21MaXN0RGVidWddIFVwZGF0ZWQgdGFncyBmb3IgJHtyb29tLnJvb21JZH06YCwgcm9vbVRhZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGRlYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDYwMlxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtSb29tTGlzdERlYnVnXSBSZWFjaGVkIGFsZ29yaXRobWljIGhhbmRsaW5nIGZvciAke3Jvb20ucm9vbUlkfSBhbmQgY2F1c2UgJHtjYXVzZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRhZ3MgPSB0aGlzLnJvb21JZHNUb1RhZ3Nbcm9vbS5yb29tSWRdO1xuICAgICAgICBpZiAoIXRhZ3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTm8gdGFncyBrbm93biBmb3IgXCIke3Jvb20ubmFtZX1cIiAoJHtyb29tLnJvb21JZH0pYCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2hhbmdlZCA9IGRpZFRhZ0NoYW5nZTtcbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgICAgICAgICAgY29uc3QgYWxnb3JpdGhtOiBPcmRlcmluZ0FsZ29yaXRobSA9IHRoaXMuYWxnb3JpdGhtc1t0YWddO1xuICAgICAgICAgICAgaWYgKCFhbGdvcml0aG0pIHRocm93IG5ldyBFcnJvcihgTm8gYWxnb3JpdGhtIGZvciAke3RhZ31gKTtcblxuICAgICAgICAgICAgYXdhaXQgYWxnb3JpdGhtLmhhbmRsZVJvb21VcGRhdGUocm9vbSwgY2F1c2UpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVkUm9vbXNbdGFnXSA9IGFsZ29yaXRobS5vcmRlcmVkUm9vbXM7XG5cbiAgICAgICAgICAgIC8vIEZsYWcgdGhhdCB3ZSd2ZSBkb25lIHNvbWV0aGluZ1xuICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUZpbHRlcmVkUm9vbXNGb3JUYWcodGFnKTsgLy8gdXBkYXRlIGZpbHRlciB0byByZS1zb3J0IHRoZSBsaXN0XG4gICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSh0YWcpOyAvLyB1cGRhdGUgc3RpY2t5IHJvb20gdG8gbWFrZSBzdXJlIGl0IGFwcGVhcnMgaWYgbmVlZGVkXG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIikpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBkZWJ1ZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQ2MDJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUm9vbUxpc3REZWJ1Z10gRmluaXNoZWQgaGFuZGxpbmcgJHtyb29tLnJvb21JZH0gd2l0aCBjYXVzZSAke2NhdXNlfSAoY2hhbmdlZD0ke2NoYW5nZWR9KWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH1cbn1cbiJdfQ==
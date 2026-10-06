"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
// The following interfaces take their names and member names from seshat and the spec

/* eslint-disable camelcase */

/*:: export interface MatrixEvent {
    type: string;
    sender: string;
    content: {};
    event_id: string;
    origin_server_ts: number;
    unsigned?: {};
    roomId: string;
}*/

/*:: export interface MatrixProfile {
    avatar_url: string;
    displayname: string;
}*/

/*:: export interface CrawlerCheckpoint {
    roomId: string;
    token: string;
    fullCrawl: boolean;
    direction: string;
}*/

/*:: export interface ResultContext {
    events_before: [MatrixEvent];
    events_after: [MatrixEvent];
    profile_info: Map<string, MatrixProfile>;
}*/

/*:: export interface ResultsElement {
    rank: number;
    result: MatrixEvent;
    context: ResultContext;
}*/

/*:: export interface SearchResult {
    count: number;
    results: [ResultsElement];
    highlights: [string];
}*/

/*:: export interface SearchArgs {
    search_term: string;
    before_limit: number;
    after_limit: number;
    order_by_recency: boolean;
    room_id?: string;
}*/

/*:: export interface EventAndProfile {
    event: MatrixEvent;
    profile: MatrixProfile;
}*/

/*:: export interface LoadArgs {
    roomId: string;
    limit: number;
    fromEvent: string;
    direction: string;
}*/

/*:: export interface IndexStats {
    size: number;
    event_count: number;
    room_count: number;
}*/

/**
 * Base class for classes that provide platform-specific event indexing.
 *
 * Instances of this class are provided by the application.
 */
class BaseEventIndexManager {
  /**
   * Does our EventIndexManager support event indexing.
   *
   * If an EventIndexManager implementor has runtime dependencies that
   * optionally enable event indexing they may override this method to perform
   * the necessary runtime checks here.
   *
   * @return {Promise} A promise that will resolve to true if event indexing
   * is supported, false otherwise.
   */
  async supportsEventIndexing()
  /*: Promise<boolean>*/
  {
    return true;
  }
  /**
   * Initialize the event index for the given user.
   *
   * @param {string} userId The event that should be added to the index.
   * @param {string} deviceId The profile of the event sender at the
   *
   * @return {Promise} A promise that will resolve when the event index is
   * initialized.
   */


  async initEventIndex(userId
  /*: string*/
  , deviceId
  /*: string*/
  )
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Queue up an event to be added to the index.
   *
   * @param {MatrixEvent} ev The event that should be added to the index.
   * @param {MatrixProfile} profile The profile of the event sender at the
   * time of the event receival.
   *
   * @return {Promise} A promise that will resolve when the was queued up for
   * addition.
   */


  async addEventToIndex(ev
  /*: MatrixEvent*/
  , profile
  /*: MatrixProfile*/
  )
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }

  async deleteEvent(eventId
  /*: string*/
  )
  /*: Promise<boolean>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Check if our event index is empty.
   */


  indexIsEmpty()
  /*: Promise<boolean>*/
  {
    throw new Error("Unimplemented");
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


  isRoomIndexed(roomId
  /*: string*/
  )
  /*: Promise<boolean>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Get statistical information of the index.
   *
   * @return {Promise<IndexStats>} A promise that will resolve to the index
   * statistics.
   */


  async getStats()
  /*: Promise<IndexStats>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Get the user version of the database.
   * @return {Promise<number>} A promise that will resolve to the user stored
   * version number.
   */


  async getUserVersion()
  /*: Promise<number>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Set the user stored version to the given version number.
   *
   * @param {number} version The new version that should be stored in the
   * database.
   *
   * @return {Promise<void>} A promise that will resolve once the new version
   * is stored.
   */


  async setUserVersion(version
  /*: number*/
  )
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Commit the previously queued up events to the index.
   *
   * @return {Promise} A promise that will resolve once the queued up events
   * were added to the index.
   */


  async commitLiveEvents()
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
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


  async searchEventIndex(searchArgs
  /*: SearchArgs*/
  )
  /*: Promise<SearchResult>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Add events from the room history to the event index.
   *
   * This is used to add a batch of events to the index.
   *
   * @param {[EventAndProfile]} events The list of events and profiles that
   * should be added to the event index.
   * @param {[CrawlerCheckpoint]} checkpoint A new crawler checkpoint that
   * should be stored in the index which should be used to continue crawling
   * the room.
   * @param {[CrawlerCheckpoint]} oldCheckpoint The checkpoint that was used
   * to fetch the current batch of events. This checkpoint will be removed
   * from the index.
   *
   * @return {Promise} A promise that will resolve to true if all the events
   * were already added to the index, false otherwise.
   */


  async addHistoricEvents(events
  /*: [EventAndProfile]*/
  , checkpoint
  /*: CrawlerCheckpoint | null*/
  , oldCheckpoint
  /*: CrawlerCheckpoint | null*/
  )
  /*: Promise<boolean>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Add a new crawler checkpoint to the index.
   *
   * @param {CrawlerCheckpoint} checkpoint The checkpoint that should be added
   * to the index.
   *
   * @return {Promise} A promise that will resolve once the checkpoint has
   * been stored.
   */


  async addCrawlerCheckpoint(checkpoint
  /*: CrawlerCheckpoint*/
  )
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Add a new crawler checkpoint to the index.
   *
   * @param {CrawlerCheckpoint} checkpoint The checkpoint that should be
   * removed from the index.
   *
   * @return {Promise} A promise that will resolve once the checkpoint has
   * been removed.
   */


  async removeCrawlerCheckpoint(checkpoint
  /*: CrawlerCheckpoint*/
  )
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Load the stored checkpoints from the index.
   *
   * @return {Promise<[CrawlerCheckpoint]>} A promise that will resolve to an
   * array of crawler checkpoints once they have been loaded from the index.
   */


  async loadCheckpoints()
  /*: Promise<[CrawlerCheckpoint]>*/
  {
    throw new Error("Unimplemented");
  }
  /** Load events that contain an mxc URL to a file from the index.
   *
   * @param  {object} args Arguments object for the method.
   * @param  {string} args.roomId The ID of the room for which the events
   * should be loaded.
   * @param  {number} args.limit The maximum number of events to return.
   * @param  {string} args.fromEvent An event id of a previous event returned
   * by this method. Passing this means that we are going to continue loading
   * events from this point in the history.
   * @param  {string} args.direction The direction to which we should continue
   * loading events from. This is used only if fromEvent is used as well.
   *
   * @return {Promise<[EventAndProfile]>} A promise that will resolve to an
   * array of Matrix events that contain mxc URLs accompanied with the
   * historic profile of the sender.
   */


  async loadFileEvents(args
  /*: LoadArgs*/
  )
  /*: Promise<[EventAndProfile]>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * close our event index.
   *
   * @return {Promise} A promise that will resolve once the event index has
   * been closed.
   */


  async closeEventIndex()
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Delete our current event index.
   *
   * @return {Promise} A promise that will resolve once the event index has
   * been deleted.
   */


  async deleteEventIndex()
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }

}

exports.default = BaseEventIndexManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmRleGluZy9CYXNlRXZlbnRJbmRleE1hbmFnZXIudHMiXSwibmFtZXMiOlsiQmFzZUV2ZW50SW5kZXhNYW5hZ2VyIiwic3VwcG9ydHNFdmVudEluZGV4aW5nIiwiaW5pdEV2ZW50SW5kZXgiLCJ1c2VySWQiLCJkZXZpY2VJZCIsIkVycm9yIiwiYWRkRXZlbnRUb0luZGV4IiwiZXYiLCJwcm9maWxlIiwiZGVsZXRlRXZlbnQiLCJldmVudElkIiwiaW5kZXhJc0VtcHR5IiwiaXNSb29tSW5kZXhlZCIsInJvb21JZCIsImdldFN0YXRzIiwiZ2V0VXNlclZlcnNpb24iLCJzZXRVc2VyVmVyc2lvbiIsInZlcnNpb24iLCJjb21taXRMaXZlRXZlbnRzIiwic2VhcmNoRXZlbnRJbmRleCIsInNlYXJjaEFyZ3MiLCJhZGRIaXN0b3JpY0V2ZW50cyIsImV2ZW50cyIsImNoZWNrcG9pbnQiLCJvbGRDaGVja3BvaW50IiwiYWRkQ3Jhd2xlckNoZWNrcG9pbnQiLCJyZW1vdmVDcmF3bGVyQ2hlY2twb2ludCIsImxvYWRDaGVja3BvaW50cyIsImxvYWRGaWxlRXZlbnRzIiwiYXJncyIsImNsb3NlRXZlbnRJbmRleCIsImRlbGV0ZUV2ZW50SW5kZXgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7QUFDQTs7O0FBakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQVBBO0FBQ0E7QUFDQTs7O0FBRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBSkE7QUFDQTtBQUNBO0FBQ0E7OztBQUhBO0FBQ0E7QUFDQTtBQUNBOzs7QUFIQTtBQUNBO0FBQ0E7QUFDQTs7O0FBSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFMQTtBQUNBO0FBQ0E7OztBQUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztB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QU0sSUFBSWxCLEtBQUosQ0FBVSxlQUFWLENBQU47QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksUUFBTXNCLGVBQU47QUFBQTtBQUFzRDtBQUNsRCxVQUFNLElBQUl0QixLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksUUFBTXVCLGNBQU4sQ0FBcUJDO0FBQXJCO0FBQUE7QUFBQTtBQUFpRTtBQUM3RCxVQUFNLElBQUl4QixLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNJLFFBQU15QixlQUFOO0FBQUE7QUFBdUM7QUFDbkMsVUFBTSxJQUFJekIsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSSxRQUFNMEIsZ0JBQU47QUFBQTtBQUF3QztBQUNwQyxVQUFNLElBQUkxQixLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7O0FBNU4rQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8vIFRoZSBmb2xsb3dpbmcgaW50ZXJmYWNlcyB0YWtlIHRoZWlyIG5hbWVzIGFuZCBtZW1iZXIgbmFtZXMgZnJvbSBzZXNoYXQgYW5kIHRoZSBzcGVjXG4vKiBlc2xpbnQtZGlzYWJsZSBjYW1lbGNhc2UgKi9cblxuZXhwb3J0IGludGVyZmFjZSBNYXRyaXhFdmVudCB7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIHNlbmRlcjogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IHt9O1xuICAgIGV2ZW50X2lkOiBzdHJpbmc7XG4gICAgb3JpZ2luX3NlcnZlcl90czogbnVtYmVyO1xuICAgIHVuc2lnbmVkPzoge307XG4gICAgcm9vbUlkOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWF0cml4UHJvZmlsZSB7XG4gICAgYXZhdGFyX3VybDogc3RyaW5nO1xuICAgIGRpc3BsYXluYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3Jhd2xlckNoZWNrcG9pbnQge1xuICAgIHJvb21JZDogc3RyaW5nO1xuICAgIHRva2VuOiBzdHJpbmc7XG4gICAgZnVsbENyYXdsOiBib29sZWFuO1xuICAgIGRpcmVjdGlvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3VsdENvbnRleHQge1xuICAgIGV2ZW50c19iZWZvcmU6IFtNYXRyaXhFdmVudF07XG4gICAgZXZlbnRzX2FmdGVyOiBbTWF0cml4RXZlbnRdO1xuICAgIHByb2ZpbGVfaW5mbzogTWFwPHN0cmluZywgTWF0cml4UHJvZmlsZT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzdWx0c0VsZW1lbnQge1xuICAgIHJhbms6IG51bWJlcjtcbiAgICByZXN1bHQ6IE1hdHJpeEV2ZW50O1xuICAgIGNvbnRleHQ6IFJlc3VsdENvbnRleHQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VhcmNoUmVzdWx0IHtcbiAgICBjb3VudDogbnVtYmVyO1xuICAgIHJlc3VsdHM6IFtSZXN1bHRzRWxlbWVudF07XG4gICAgaGlnaGxpZ2h0czogW3N0cmluZ107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VhcmNoQXJncyB7XG4gICAgc2VhcmNoX3Rlcm06IHN0cmluZztcbiAgICBiZWZvcmVfbGltaXQ6IG51bWJlcjtcbiAgICBhZnRlcl9saW1pdDogbnVtYmVyO1xuICAgIG9yZGVyX2J5X3JlY2VuY3k6IGJvb2xlYW47XG4gICAgcm9vbV9pZD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFdmVudEFuZFByb2ZpbGUge1xuICAgIGV2ZW50OiBNYXRyaXhFdmVudDtcbiAgICBwcm9maWxlOiBNYXRyaXhQcm9maWxlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvYWRBcmdzIHtcbiAgICByb29tSWQ6IHN0cmluZztcbiAgICBsaW1pdDogbnVtYmVyO1xuICAgIGZyb21FdmVudDogc3RyaW5nO1xuICAgIGRpcmVjdGlvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluZGV4U3RhdHMge1xuICAgIHNpemU6IG51bWJlcjtcbiAgICBldmVudF9jb3VudDogbnVtYmVyO1xuICAgIHJvb21fY291bnQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBjbGFzc2VzIHRoYXQgcHJvdmlkZSBwbGF0Zm9ybS1zcGVjaWZpYyBldmVudCBpbmRleGluZy5cbiAqXG4gKiBJbnN0YW5jZXMgb2YgdGhpcyBjbGFzcyBhcmUgcHJvdmlkZWQgYnkgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBCYXNlRXZlbnRJbmRleE1hbmFnZXIge1xuICAgIC8qKlxuICAgICAqIERvZXMgb3VyIEV2ZW50SW5kZXhNYW5hZ2VyIHN1cHBvcnQgZXZlbnQgaW5kZXhpbmcuXG4gICAgICpcbiAgICAgKiBJZiBhbiBFdmVudEluZGV4TWFuYWdlciBpbXBsZW1lbnRvciBoYXMgcnVudGltZSBkZXBlbmRlbmNpZXMgdGhhdFxuICAgICAqIG9wdGlvbmFsbHkgZW5hYmxlIGV2ZW50IGluZGV4aW5nIHRoZXkgbWF5IG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIHBlcmZvcm1cbiAgICAgKiB0aGUgbmVjZXNzYXJ5IHJ1bnRpbWUgY2hlY2tzIGhlcmUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gdHJ1ZSBpZiBldmVudCBpbmRleGluZ1xuICAgICAqIGlzIHN1cHBvcnRlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGFzeW5jIHN1cHBvcnRzRXZlbnRJbmRleGluZygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIGV2ZW50IGluZGV4IGZvciB0aGUgZ2l2ZW4gdXNlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VySWQgVGhlIGV2ZW50IHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBpbmRleC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGV2aWNlSWQgVGhlIHByb2ZpbGUgb2YgdGhlIGV2ZW50IHNlbmRlciBhdCB0aGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB3aGVuIHRoZSBldmVudCBpbmRleCBpc1xuICAgICAqIGluaXRpYWxpemVkLlxuICAgICAqL1xuICAgIGFzeW5jIGluaXRFdmVudEluZGV4KHVzZXJJZDogc3RyaW5nLCBkZXZpY2VJZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUXVldWUgdXAgYW4gZXZlbnQgdG8gYmUgYWRkZWQgdG8gdGhlIGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtNYXRyaXhFdmVudH0gZXYgVGhlIGV2ZW50IHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBpbmRleC5cbiAgICAgKiBAcGFyYW0ge01hdHJpeFByb2ZpbGV9IHByb2ZpbGUgVGhlIHByb2ZpbGUgb2YgdGhlIGV2ZW50IHNlbmRlciBhdCB0aGVcbiAgICAgKiB0aW1lIG9mIHRoZSBldmVudCByZWNlaXZhbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB3aGVuIHRoZSB3YXMgcXVldWVkIHVwIGZvclxuICAgICAqIGFkZGl0aW9uLlxuICAgICAqL1xuICAgIGFzeW5jIGFkZEV2ZW50VG9JbmRleChldjogTWF0cml4RXZlbnQsIHByb2ZpbGU6IE1hdHJpeFByb2ZpbGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICBhc3luYyBkZWxldGVFdmVudChldmVudElkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBvdXIgZXZlbnQgaW5kZXggaXMgZW1wdHkuXG4gICAgICovXG4gICAgaW5kZXhJc0VtcHR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSByb29tIHdpdGggdGhlIGdpdmVuIGlkIGlzIGFscmVhZHkgaW5kZXhlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByb29tSWQgVGhlIElEIG9mIHRoZSByb29tIHdoaWNoIHdlIHdhbnQgdG8gY2hlY2sgaWYgaXRcbiAgICAgKiBoYXMgYmVlbiBhbHJlYWR5IGluZGV4ZWQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPGJvb2xlYW4+fSBSZXR1cm5zIHRydWUgaWYgdGhlIGluZGV4IGNvbnRhaW5zIGV2ZW50cyBmb3JcbiAgICAgKiB0aGUgZ2l2ZW4gcm9vbSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGlzUm9vbUluZGV4ZWQocm9vbUlkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgc3RhdGlzdGljYWwgaW5mb3JtYXRpb24gb2YgdGhlIGluZGV4LlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxJbmRleFN0YXRzPn0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIHRoZSBpbmRleFxuICAgICAqIHN0YXRpc3RpY3MuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U3RhdHMoKTogUHJvbWlzZTxJbmRleFN0YXRzPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHVzZXIgdmVyc2lvbiBvZiB0aGUgZGF0YWJhc2UuXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxudW1iZXI+fSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gdGhlIHVzZXIgc3RvcmVkXG4gICAgICogdmVyc2lvbiBudW1iZXIuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0VXNlclZlcnNpb24oKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHVzZXIgc3RvcmVkIHZlcnNpb24gdG8gdGhlIGdpdmVuIHZlcnNpb24gbnVtYmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnNpb24gVGhlIG5ldyB2ZXJzaW9uIHRoYXQgc2hvdWxkIGJlIHN0b3JlZCBpbiB0aGVcbiAgICAgKiBkYXRhYmFzZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8dm9pZD59IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSBvbmNlIHRoZSBuZXcgdmVyc2lvblxuICAgICAqIGlzIHN0b3JlZC5cbiAgICAgKi9cbiAgICBhc3luYyBzZXRVc2VyVmVyc2lvbih2ZXJzaW9uOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21taXQgdGhlIHByZXZpb3VzbHkgcXVldWVkIHVwIGV2ZW50cyB0byB0aGUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgb25jZSB0aGUgcXVldWVkIHVwIGV2ZW50c1xuICAgICAqIHdlcmUgYWRkZWQgdG8gdGhlIGluZGV4LlxuICAgICAqL1xuICAgIGFzeW5jIGNvbW1pdExpdmVFdmVudHMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIHRoZSBldmVudCBpbmRleCB1c2luZyB0aGUgZ2l2ZW4gdGVybSBmb3IgbWF0Y2hpbmcgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTZWFyY2hBcmdzfSBzZWFyY2hBcmdzIFRoZSBzZWFyY2ggY29uZmlndXJhdGlvbiBmb3IgdGhlIHNlYXJjaCxcbiAgICAgKiBzZXRzIHRoZSBzZWFyY2ggdGVybSBhbmQgZGV0ZXJtaW5lcyB0aGUgc2VhcmNoIHJlc3VsdCBjb250ZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8W1NlYXJjaFJlc3VsdF0+fSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gYW4gYXJyYXlcbiAgICAgKiBvZiBzZWFyY2ggcmVzdWx0cyBvbmNlIHRoZSBzZWFyY2ggaXMgZG9uZS5cbiAgICAgKi9cbiAgICBhc3luYyBzZWFyY2hFdmVudEluZGV4KHNlYXJjaEFyZ3M6IFNlYXJjaEFyZ3MpOiBQcm9taXNlPFNlYXJjaFJlc3VsdD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBldmVudHMgZnJvbSB0aGUgcm9vbSBoaXN0b3J5IHRvIHRoZSBldmVudCBpbmRleC5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBhZGQgYSBiYXRjaCBvZiBldmVudHMgdG8gdGhlIGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtbRXZlbnRBbmRQcm9maWxlXX0gZXZlbnRzIFRoZSBsaXN0IG9mIGV2ZW50cyBhbmQgcHJvZmlsZXMgdGhhdFxuICAgICAqIHNob3VsZCBiZSBhZGRlZCB0byB0aGUgZXZlbnQgaW5kZXguXG4gICAgICogQHBhcmFtIHtbQ3Jhd2xlckNoZWNrcG9pbnRdfSBjaGVja3BvaW50IEEgbmV3IGNyYXdsZXIgY2hlY2twb2ludCB0aGF0XG4gICAgICogc2hvdWxkIGJlIHN0b3JlZCBpbiB0aGUgaW5kZXggd2hpY2ggc2hvdWxkIGJlIHVzZWQgdG8gY29udGludWUgY3Jhd2xpbmdcbiAgICAgKiB0aGUgcm9vbS5cbiAgICAgKiBAcGFyYW0ge1tDcmF3bGVyQ2hlY2twb2ludF19IG9sZENoZWNrcG9pbnQgVGhlIGNoZWNrcG9pbnQgdGhhdCB3YXMgdXNlZFxuICAgICAqIHRvIGZldGNoIHRoZSBjdXJyZW50IGJhdGNoIG9mIGV2ZW50cy4gVGhpcyBjaGVja3BvaW50IHdpbGwgYmUgcmVtb3ZlZFxuICAgICAqIGZyb20gdGhlIGluZGV4LlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIHRydWUgaWYgYWxsIHRoZSBldmVudHNcbiAgICAgKiB3ZXJlIGFscmVhZHkgYWRkZWQgdG8gdGhlIGluZGV4LCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgYXN5bmMgYWRkSGlzdG9yaWNFdmVudHMoXG4gICAgICAgIGV2ZW50czogW0V2ZW50QW5kUHJvZmlsZV0sXG4gICAgICAgIGNoZWNrcG9pbnQ6IENyYXdsZXJDaGVja3BvaW50IHwgbnVsbCxcbiAgICAgICAgb2xkQ2hlY2twb2ludDogQ3Jhd2xlckNoZWNrcG9pbnQgfCBudWxsLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBjcmF3bGVyIGNoZWNrcG9pbnQgdG8gdGhlIGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtDcmF3bGVyQ2hlY2twb2ludH0gY2hlY2twb2ludCBUaGUgY2hlY2twb2ludCB0aGF0IHNob3VsZCBiZSBhZGRlZFxuICAgICAqIHRvIHRoZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSBvbmNlIHRoZSBjaGVja3BvaW50IGhhc1xuICAgICAqIGJlZW4gc3RvcmVkLlxuICAgICAqL1xuICAgIGFzeW5jIGFkZENyYXdsZXJDaGVja3BvaW50KGNoZWNrcG9pbnQ6IENyYXdsZXJDaGVja3BvaW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IGNyYXdsZXIgY2hlY2twb2ludCB0byB0aGUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0NyYXdsZXJDaGVja3BvaW50fSBjaGVja3BvaW50IFRoZSBjaGVja3BvaW50IHRoYXQgc2hvdWxkIGJlXG4gICAgICogcmVtb3ZlZCBmcm9tIHRoZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSBvbmNlIHRoZSBjaGVja3BvaW50IGhhc1xuICAgICAqIGJlZW4gcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBhc3luYyByZW1vdmVDcmF3bGVyQ2hlY2twb2ludChjaGVja3BvaW50OiBDcmF3bGVyQ2hlY2twb2ludCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgdGhlIHN0b3JlZCBjaGVja3BvaW50cyBmcm9tIHRoZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8W0NyYXdsZXJDaGVja3BvaW50XT59IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhblxuICAgICAqIGFycmF5IG9mIGNyYXdsZXIgY2hlY2twb2ludHMgb25jZSB0aGV5IGhhdmUgYmVlbiBsb2FkZWQgZnJvbSB0aGUgaW5kZXguXG4gICAgICovXG4gICAgYXN5bmMgbG9hZENoZWNrcG9pbnRzKCk6IFByb21pc2U8W0NyYXdsZXJDaGVja3BvaW50XT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIGV2ZW50cyB0aGF0IGNvbnRhaW4gYW4gbXhjIFVSTCB0byBhIGZpbGUgZnJvbSB0aGUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGFyZ3MgQXJndW1lbnRzIG9iamVjdCBmb3IgdGhlIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGFyZ3Mucm9vbUlkIFRoZSBJRCBvZiB0aGUgcm9vbSBmb3Igd2hpY2ggdGhlIGV2ZW50c1xuICAgICAqIHNob3VsZCBiZSBsb2FkZWQuXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSBhcmdzLmxpbWl0IFRoZSBtYXhpbXVtIG51bWJlciBvZiBldmVudHMgdG8gcmV0dXJuLlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gYXJncy5mcm9tRXZlbnQgQW4gZXZlbnQgaWQgb2YgYSBwcmV2aW91cyBldmVudCByZXR1cm5lZFxuICAgICAqIGJ5IHRoaXMgbWV0aG9kLiBQYXNzaW5nIHRoaXMgbWVhbnMgdGhhdCB3ZSBhcmUgZ29pbmcgdG8gY29udGludWUgbG9hZGluZ1xuICAgICAqIGV2ZW50cyBmcm9tIHRoaXMgcG9pbnQgaW4gdGhlIGhpc3RvcnkuXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBhcmdzLmRpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIHRvIHdoaWNoIHdlIHNob3VsZCBjb250aW51ZVxuICAgICAqIGxvYWRpbmcgZXZlbnRzIGZyb20uIFRoaXMgaXMgdXNlZCBvbmx5IGlmIGZyb21FdmVudCBpcyB1c2VkIGFzIHdlbGwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFtFdmVudEFuZFByb2ZpbGVdPn0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIGFuXG4gICAgICogYXJyYXkgb2YgTWF0cml4IGV2ZW50cyB0aGF0IGNvbnRhaW4gbXhjIFVSTHMgYWNjb21wYW5pZWQgd2l0aCB0aGVcbiAgICAgKiBoaXN0b3JpYyBwcm9maWxlIG9mIHRoZSBzZW5kZXIuXG4gICAgICovXG4gICAgYXN5bmMgbG9hZEZpbGVFdmVudHMoYXJnczogTG9hZEFyZ3MpOiBQcm9taXNlPFtFdmVudEFuZFByb2ZpbGVdPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2xvc2Ugb3VyIGV2ZW50IGluZGV4LlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIG9uY2UgdGhlIGV2ZW50IGluZGV4IGhhc1xuICAgICAqIGJlZW4gY2xvc2VkLlxuICAgICAqL1xuICAgIGFzeW5jIGNsb3NlRXZlbnRJbmRleCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgb3VyIGN1cnJlbnQgZXZlbnQgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgb25jZSB0aGUgZXZlbnQgaW5kZXggaGFzXG4gICAgICogYmVlbiBkZWxldGVkLlxuICAgICAqL1xuICAgIGFzeW5jIGRlbGV0ZUV2ZW50SW5kZXgoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxufVxuIl19
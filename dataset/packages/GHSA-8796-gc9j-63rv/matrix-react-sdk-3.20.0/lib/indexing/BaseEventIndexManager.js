"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
Copyright 2019-2021 The Matrix.org Foundation C.I.C.

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

  async isEventIndexEmpty()
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmRleGluZy9CYXNlRXZlbnRJbmRleE1hbmFnZXIudHMiXSwibmFtZXMiOlsiQmFzZUV2ZW50SW5kZXhNYW5hZ2VyIiwic3VwcG9ydHNFdmVudEluZGV4aW5nIiwiaW5pdEV2ZW50SW5kZXgiLCJ1c2VySWQiLCJkZXZpY2VJZCIsIkVycm9yIiwiYWRkRXZlbnRUb0luZGV4IiwiZXYiLCJwcm9maWxlIiwiZGVsZXRlRXZlbnQiLCJldmVudElkIiwiaXNFdmVudEluZGV4RW1wdHkiLCJpbmRleElzRW1wdHkiLCJpc1Jvb21JbmRleGVkIiwicm9vbUlkIiwiZ2V0U3RhdHMiLCJnZXRVc2VyVmVyc2lvbiIsInNldFVzZXJWZXJzaW9uIiwidmVyc2lvbiIsImNvbW1pdExpdmVFdmVudHMiLCJzZWFyY2hFdmVudEluZGV4Iiwic2VhcmNoQXJncyIsImFkZEhpc3RvcmljRXZlbnRzIiwiZXZlbnRzIiwiY2hlY2twb2ludCIsIm9sZENoZWNrcG9pbnQiLCJhZGRDcmF3bGVyQ2hlY2twb2ludCIsInJlbW92ZUNyYXdsZXJDaGVja3BvaW50IiwibG9hZENoZWNrcG9pbnRzIiwibG9hZEZpbGVFdmVudHMiLCJhcmdzIiwiY2xvc2VFdmVudEluZGV4IiwiZGVsZXRlRXZlbnRJbmRleCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOztBQUNBOzs7QUFqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBUEE7QUFDQTtBQUNBOzs7QUFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFKQTtBQUNBO0FBQ0E7QUFDQTs7O0FBSEE7QUFDQTtBQUNBO0FBQ0E7OztBQUhBO0FBQ0E7QUFDQTtBQUNBOzs7QUFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUxBO0FBQ0E7QUFDQTs7O0FBRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBSkE7QUFDQTtBQUNBO0FBQ0E7O0FBa0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFlQSxxQkFBZixDQUFxQztBQUNoRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJLFFBQU1DLHFCQUFOO0FBQUE7QUFBZ0Q7QUFDNUMsV0FBTyxJQUFQO0FBQ0g7QUFDRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNJLFFBQU1DLGNBQU4sQ0FBcUJDO0FBQXJCO0FBQUEsSUFBcUNDO0FBQXJDO0FBQUE7QUFBQTtBQUFzRTtBQUNsRSxVQUFNLElBQUlDLEtBQUosQ0FBVSxlQUFWLENBQU47QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSSxRQUFNQyxlQUFOLENBQXNCQztBQUF0QjtBQUFBLElBQXVDQztBQUF2QztBQUFBO0FBQUE7QUFBOEU7QUFDMUUsVUFBTSxJQUFJSCxLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTUksV0FBTixDQUFrQkM7QUFBbEI7QUFBQTtBQUFBO0FBQXFEO0FBQ2pELFVBQU0sSUFBSUwsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQUNIOztBQUVELFFBQU1NLGlCQUFOO0FBQUE7QUFBNEM7QUFDeEMsVUFBTSxJQUFJTixLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7OztBQUNJTyxFQUFBQSxZQUFZO0FBQUE7QUFBcUI7QUFDN0IsVUFBTSxJQUFJUCxLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNJUSxFQUFBQSxhQUFhLENBQUNDO0FBQUQ7QUFBQTtBQUFBO0FBQW1DO0FBQzVDLFVBQU0sSUFBSVQsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSSxRQUFNVSxRQUFOO0FBQUE7QUFBc0M7QUFDbEMsVUFBTSxJQUFJVixLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7QUFHRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSSxRQUFNVyxjQUFOO0FBQUE7QUFBd0M7QUFDcEMsVUFBTSxJQUFJWCxLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNJLFFBQU1ZLGNBQU4sQ0FBcUJDO0FBQXJCO0FBQUE7QUFBQTtBQUFxRDtBQUNqRCxVQUFNLElBQUliLEtBQUosQ0FBVSxlQUFWLENBQU47QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksUUFBTWMsZ0JBQU47QUFBQTtBQUF3QztBQUNwQyxVQUFNLElBQUlkLEtBQUosQ0FBVSxlQUFWLENBQU47QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksUUFBTWUsZ0JBQU4sQ0FBdUJDO0FBQXZCO0FBQUE7QUFBQTtBQUFzRTtBQUNsRSxVQUFNLElBQUloQixLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSSxRQUFNaUIsaUJBQU4sQ0FDSUM7QUFESjtBQUFBLElBRUlDO0FBRko7QUFBQSxJQUdJQztBQUhKO0FBQUE7QUFBQTtBQUlvQjtBQUNoQixVQUFNLElBQUlwQixLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNJLFFBQU1xQixvQkFBTixDQUEyQkY7QUFBM0I7QUFBQTtBQUFBO0FBQXlFO0FBQ3JFLFVBQU0sSUFBSW5CLEtBQUosQ0FBVSxlQUFWLENBQU47QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksUUFBTXNCLHVCQUFOLENBQThCSDtBQUE5QjtBQUFBO0FBQUE7QUFBNEU7QUFDeEUsVUFBTSxJQUFJbkIsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSSxRQUFNdUIsZUFBTjtBQUFBO0FBQXNEO0FBQ2xELFVBQU0sSUFBSXZCLEtBQUosQ0FBVSxlQUFWLENBQU47QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSSxRQUFNd0IsY0FBTixDQUFxQkM7QUFBckI7QUFBQTtBQUFBO0FBQWlFO0FBQzdELFVBQU0sSUFBSXpCLEtBQUosQ0FBVSxlQUFWLENBQU47QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksUUFBTTBCLGVBQU47QUFBQTtBQUF1QztBQUNuQyxVQUFNLElBQUkxQixLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNJLFFBQU0yQixnQkFBTjtBQUFBO0FBQXdDO0FBQ3BDLFVBQU0sSUFBSTNCLEtBQUosQ0FBVSxlQUFWLENBQU47QUFDSDs7QUFoTytDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vLyBUaGUgZm9sbG93aW5nIGludGVyZmFjZXMgdGFrZSB0aGVpciBuYW1lcyBhbmQgbWVtYmVyIG5hbWVzIGZyb20gc2VzaGF0IGFuZCB0aGUgc3BlY1xuLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgTWF0cml4RXZlbnQge1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBzZW5kZXI6IHN0cmluZztcbiAgICBjb250ZW50OiB7fTtcbiAgICBldmVudF9pZDogc3RyaW5nO1xuICAgIG9yaWdpbl9zZXJ2ZXJfdHM6IG51bWJlcjtcbiAgICB1bnNpZ25lZD86IHt9O1xuICAgIHJvb21JZDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1hdHJpeFByb2ZpbGUge1xuICAgIGF2YXRhcl91cmw6IHN0cmluZztcbiAgICBkaXNwbGF5bmFtZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENyYXdsZXJDaGVja3BvaW50IHtcbiAgICByb29tSWQ6IHN0cmluZztcbiAgICB0b2tlbjogc3RyaW5nO1xuICAgIGZ1bGxDcmF3bDogYm9vbGVhbjtcbiAgICBkaXJlY3Rpb246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXN1bHRDb250ZXh0IHtcbiAgICBldmVudHNfYmVmb3JlOiBbTWF0cml4RXZlbnRdO1xuICAgIGV2ZW50c19hZnRlcjogW01hdHJpeEV2ZW50XTtcbiAgICBwcm9maWxlX2luZm86IE1hcDxzdHJpbmcsIE1hdHJpeFByb2ZpbGU+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3VsdHNFbGVtZW50IHtcbiAgICByYW5rOiBudW1iZXI7XG4gICAgcmVzdWx0OiBNYXRyaXhFdmVudDtcbiAgICBjb250ZXh0OiBSZXN1bHRDb250ZXh0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNlYXJjaFJlc3VsdCB7XG4gICAgY291bnQ6IG51bWJlcjtcbiAgICByZXN1bHRzOiBbUmVzdWx0c0VsZW1lbnRdO1xuICAgIGhpZ2hsaWdodHM6IFtzdHJpbmddO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNlYXJjaEFyZ3Mge1xuICAgIHNlYXJjaF90ZXJtOiBzdHJpbmc7XG4gICAgYmVmb3JlX2xpbWl0OiBudW1iZXI7XG4gICAgYWZ0ZXJfbGltaXQ6IG51bWJlcjtcbiAgICBvcmRlcl9ieV9yZWNlbmN5OiBib29sZWFuO1xuICAgIHJvb21faWQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRBbmRQcm9maWxlIHtcbiAgICBldmVudDogTWF0cml4RXZlbnQ7XG4gICAgcHJvZmlsZTogTWF0cml4UHJvZmlsZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2FkQXJncyB7XG4gICAgcm9vbUlkOiBzdHJpbmc7XG4gICAgbGltaXQ6IG51bWJlcjtcbiAgICBmcm9tRXZlbnQ6IHN0cmluZztcbiAgICBkaXJlY3Rpb246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbmRleFN0YXRzIHtcbiAgICBzaXplOiBudW1iZXI7XG4gICAgZXZlbnRfY291bnQ6IG51bWJlcjtcbiAgICByb29tX2NvdW50OiBudW1iZXI7XG59XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgY2xhc3NlcyB0aGF0IHByb3ZpZGUgcGxhdGZvcm0tc3BlY2lmaWMgZXZlbnQgaW5kZXhpbmcuXG4gKlxuICogSW5zdGFuY2VzIG9mIHRoaXMgY2xhc3MgYXJlIHByb3ZpZGVkIGJ5IHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgQmFzZUV2ZW50SW5kZXhNYW5hZ2VyIHtcbiAgICAvKipcbiAgICAgKiBEb2VzIG91ciBFdmVudEluZGV4TWFuYWdlciBzdXBwb3J0IGV2ZW50IGluZGV4aW5nLlxuICAgICAqXG4gICAgICogSWYgYW4gRXZlbnRJbmRleE1hbmFnZXIgaW1wbGVtZW50b3IgaGFzIHJ1bnRpbWUgZGVwZW5kZW5jaWVzIHRoYXRcbiAgICAgKiBvcHRpb25hbGx5IGVuYWJsZSBldmVudCBpbmRleGluZyB0aGV5IG1heSBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBwZXJmb3JtXG4gICAgICogdGhlIG5lY2Vzc2FyeSBydW50aW1lIGNoZWNrcyBoZXJlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIHRydWUgaWYgZXZlbnQgaW5kZXhpbmdcbiAgICAgKiBpcyBzdXBwb3J0ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBhc3luYyBzdXBwb3J0c0V2ZW50SW5kZXhpbmcoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBldmVudCBpbmRleCBmb3IgdGhlIGdpdmVuIHVzZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIFRoZSBldmVudCB0aGF0IHNob3VsZCBiZSBhZGRlZCB0byB0aGUgaW5kZXguXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRldmljZUlkIFRoZSBwcm9maWxlIG9mIHRoZSBldmVudCBzZW5kZXIgYXQgdGhlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2hlbiB0aGUgZXZlbnQgaW5kZXggaXNcbiAgICAgKiBpbml0aWFsaXplZC5cbiAgICAgKi9cbiAgICBhc3luYyBpbml0RXZlbnRJbmRleCh1c2VySWQ6IHN0cmluZywgZGV2aWNlSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFF1ZXVlIHVwIGFuIGV2ZW50IHRvIGJlIGFkZGVkIHRvIHRoZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TWF0cml4RXZlbnR9IGV2IFRoZSBldmVudCB0aGF0IHNob3VsZCBiZSBhZGRlZCB0byB0aGUgaW5kZXguXG4gICAgICogQHBhcmFtIHtNYXRyaXhQcm9maWxlfSBwcm9maWxlIFRoZSBwcm9maWxlIG9mIHRoZSBldmVudCBzZW5kZXIgYXQgdGhlXG4gICAgICogdGltZSBvZiB0aGUgZXZlbnQgcmVjZWl2YWwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2hlbiB0aGUgd2FzIHF1ZXVlZCB1cCBmb3JcbiAgICAgKiBhZGRpdGlvbi5cbiAgICAgKi9cbiAgICBhc3luYyBhZGRFdmVudFRvSW5kZXgoZXY6IE1hdHJpeEV2ZW50LCBwcm9maWxlOiBNYXRyaXhQcm9maWxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgYXN5bmMgZGVsZXRlRXZlbnQoZXZlbnRJZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgYXN5bmMgaXNFdmVudEluZGV4RW1wdHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgb3VyIGV2ZW50IGluZGV4IGlzIGVtcHR5LlxuICAgICAqL1xuICAgIGluZGV4SXNFbXB0eSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgcm9vbSB3aXRoIHRoZSBnaXZlbiBpZCBpcyBhbHJlYWR5IGluZGV4ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm9vbUlkIFRoZSBJRCBvZiB0aGUgcm9vbSB3aGljaCB3ZSB3YW50IHRvIGNoZWNrIGlmIGl0XG4gICAgICogaGFzIGJlZW4gYWxyZWFkeSBpbmRleGVkLlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn0gUmV0dXJucyB0cnVlIGlmIHRoZSBpbmRleCBjb250YWlucyBldmVudHMgZm9yXG4gICAgICogdGhlIGdpdmVuIHJvb20sIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBpc1Jvb21JbmRleGVkKHJvb21JZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHN0YXRpc3RpY2FsIGluZm9ybWF0aW9uIG9mIHRoZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8SW5kZXhTdGF0cz59IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB0byB0aGUgaW5kZXhcbiAgICAgKiBzdGF0aXN0aWNzLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFN0YXRzKCk6IFByb21pc2U8SW5kZXhTdGF0cz4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB1c2VyIHZlcnNpb24gb2YgdGhlIGRhdGFiYXNlLlxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8bnVtYmVyPn0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIHRoZSB1c2VyIHN0b3JlZFxuICAgICAqIHZlcnNpb24gbnVtYmVyLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFVzZXJWZXJzaW9uKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSB1c2VyIHN0b3JlZCB2ZXJzaW9uIHRvIHRoZSBnaXZlbiB2ZXJzaW9uIG51bWJlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2ZXJzaW9uIFRoZSBuZXcgdmVyc2lvbiB0aGF0IHNob3VsZCBiZSBzdG9yZWQgaW4gdGhlXG4gICAgICogZGF0YWJhc2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPHZvaWQ+fSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgb25jZSB0aGUgbmV3IHZlcnNpb25cbiAgICAgKiBpcyBzdG9yZWQuXG4gICAgICovXG4gICAgYXN5bmMgc2V0VXNlclZlcnNpb24odmVyc2lvbjogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tbWl0IHRoZSBwcmV2aW91c2x5IHF1ZXVlZCB1cCBldmVudHMgdG8gdGhlIGluZGV4LlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIG9uY2UgdGhlIHF1ZXVlZCB1cCBldmVudHNcbiAgICAgKiB3ZXJlIGFkZGVkIHRvIHRoZSBpbmRleC5cbiAgICAgKi9cbiAgICBhc3luYyBjb21taXRMaXZlRXZlbnRzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCB0aGUgZXZlbnQgaW5kZXggdXNpbmcgdGhlIGdpdmVuIHRlcm0gZm9yIG1hdGNoaW5nIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U2VhcmNoQXJnc30gc2VhcmNoQXJncyBUaGUgc2VhcmNoIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzZWFyY2gsXG4gICAgICogc2V0cyB0aGUgc2VhcmNoIHRlcm0gYW5kIGRldGVybWluZXMgdGhlIHNlYXJjaCByZXN1bHQgY29udGVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFtTZWFyY2hSZXN1bHRdPn0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIGFuIGFycmF5XG4gICAgICogb2Ygc2VhcmNoIHJlc3VsdHMgb25jZSB0aGUgc2VhcmNoIGlzIGRvbmUuXG4gICAgICovXG4gICAgYXN5bmMgc2VhcmNoRXZlbnRJbmRleChzZWFyY2hBcmdzOiBTZWFyY2hBcmdzKTogUHJvbWlzZTxTZWFyY2hSZXN1bHQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgZXZlbnRzIGZyb20gdGhlIHJvb20gaGlzdG9yeSB0byB0aGUgZXZlbnQgaW5kZXguXG4gICAgICpcbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gYWRkIGEgYmF0Y2ggb2YgZXZlbnRzIHRvIHRoZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7W0V2ZW50QW5kUHJvZmlsZV19IGV2ZW50cyBUaGUgbGlzdCBvZiBldmVudHMgYW5kIHByb2ZpbGVzIHRoYXRcbiAgICAgKiBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIGV2ZW50IGluZGV4LlxuICAgICAqIEBwYXJhbSB7W0NyYXdsZXJDaGVja3BvaW50XX0gY2hlY2twb2ludCBBIG5ldyBjcmF3bGVyIGNoZWNrcG9pbnQgdGhhdFxuICAgICAqIHNob3VsZCBiZSBzdG9yZWQgaW4gdGhlIGluZGV4IHdoaWNoIHNob3VsZCBiZSB1c2VkIHRvIGNvbnRpbnVlIGNyYXdsaW5nXG4gICAgICogdGhlIHJvb20uXG4gICAgICogQHBhcmFtIHtbQ3Jhd2xlckNoZWNrcG9pbnRdfSBvbGRDaGVja3BvaW50IFRoZSBjaGVja3BvaW50IHRoYXQgd2FzIHVzZWRcbiAgICAgKiB0byBmZXRjaCB0aGUgY3VycmVudCBiYXRjaCBvZiBldmVudHMuIFRoaXMgY2hlY2twb2ludCB3aWxsIGJlIHJlbW92ZWRcbiAgICAgKiBmcm9tIHRoZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB0byB0cnVlIGlmIGFsbCB0aGUgZXZlbnRzXG4gICAgICogd2VyZSBhbHJlYWR5IGFkZGVkIHRvIHRoZSBpbmRleCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGFzeW5jIGFkZEhpc3RvcmljRXZlbnRzKFxuICAgICAgICBldmVudHM6IFtFdmVudEFuZFByb2ZpbGVdLFxuICAgICAgICBjaGVja3BvaW50OiBDcmF3bGVyQ2hlY2twb2ludCB8IG51bGwsXG4gICAgICAgIG9sZENoZWNrcG9pbnQ6IENyYXdsZXJDaGVja3BvaW50IHwgbnVsbCxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgY3Jhd2xlciBjaGVja3BvaW50IHRvIHRoZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Q3Jhd2xlckNoZWNrcG9pbnR9IGNoZWNrcG9pbnQgVGhlIGNoZWNrcG9pbnQgdGhhdCBzaG91bGQgYmUgYWRkZWRcbiAgICAgKiB0byB0aGUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgb25jZSB0aGUgY2hlY2twb2ludCBoYXNcbiAgICAgKiBiZWVuIHN0b3JlZC5cbiAgICAgKi9cbiAgICBhc3luYyBhZGRDcmF3bGVyQ2hlY2twb2ludChjaGVja3BvaW50OiBDcmF3bGVyQ2hlY2twb2ludCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBjcmF3bGVyIGNoZWNrcG9pbnQgdG8gdGhlIGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtDcmF3bGVyQ2hlY2twb2ludH0gY2hlY2twb2ludCBUaGUgY2hlY2twb2ludCB0aGF0IHNob3VsZCBiZVxuICAgICAqIHJlbW92ZWQgZnJvbSB0aGUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgb25jZSB0aGUgY2hlY2twb2ludCBoYXNcbiAgICAgKiBiZWVuIHJlbW92ZWQuXG4gICAgICovXG4gICAgYXN5bmMgcmVtb3ZlQ3Jhd2xlckNoZWNrcG9pbnQoY2hlY2twb2ludDogQ3Jhd2xlckNoZWNrcG9pbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIHRoZSBzdG9yZWQgY2hlY2twb2ludHMgZnJvbSB0aGUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFtDcmF3bGVyQ2hlY2twb2ludF0+fSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gYW5cbiAgICAgKiBhcnJheSBvZiBjcmF3bGVyIGNoZWNrcG9pbnRzIG9uY2UgdGhleSBoYXZlIGJlZW4gbG9hZGVkIGZyb20gdGhlIGluZGV4LlxuICAgICAqL1xuICAgIGFzeW5jIGxvYWRDaGVja3BvaW50cygpOiBQcm9taXNlPFtDcmF3bGVyQ2hlY2twb2ludF0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKiogTG9hZCBldmVudHMgdGhhdCBjb250YWluIGFuIG14YyBVUkwgdG8gYSBmaWxlIGZyb20gdGhlIGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBhcmdzIEFyZ3VtZW50cyBvYmplY3QgZm9yIHRoZSBtZXRob2QuXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBhcmdzLnJvb21JZCBUaGUgSUQgb2YgdGhlIHJvb20gZm9yIHdoaWNoIHRoZSBldmVudHNcbiAgICAgKiBzaG91bGQgYmUgbG9hZGVkLlxuICAgICAqIEBwYXJhbSAge251bWJlcn0gYXJncy5saW1pdCBUaGUgbWF4aW11bSBudW1iZXIgb2YgZXZlbnRzIHRvIHJldHVybi5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGFyZ3MuZnJvbUV2ZW50IEFuIGV2ZW50IGlkIG9mIGEgcHJldmlvdXMgZXZlbnQgcmV0dXJuZWRcbiAgICAgKiBieSB0aGlzIG1ldGhvZC4gUGFzc2luZyB0aGlzIG1lYW5zIHRoYXQgd2UgYXJlIGdvaW5nIHRvIGNvbnRpbnVlIGxvYWRpbmdcbiAgICAgKiBldmVudHMgZnJvbSB0aGlzIHBvaW50IGluIHRoZSBoaXN0b3J5LlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gYXJncy5kaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiB0byB3aGljaCB3ZSBzaG91bGQgY29udGludWVcbiAgICAgKiBsb2FkaW5nIGV2ZW50cyBmcm9tLiBUaGlzIGlzIHVzZWQgb25seSBpZiBmcm9tRXZlbnQgaXMgdXNlZCBhcyB3ZWxsLlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxbRXZlbnRBbmRQcm9maWxlXT59IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhblxuICAgICAqIGFycmF5IG9mIE1hdHJpeCBldmVudHMgdGhhdCBjb250YWluIG14YyBVUkxzIGFjY29tcGFuaWVkIHdpdGggdGhlXG4gICAgICogaGlzdG9yaWMgcHJvZmlsZSBvZiB0aGUgc2VuZGVyLlxuICAgICAqL1xuICAgIGFzeW5jIGxvYWRGaWxlRXZlbnRzKGFyZ3M6IExvYWRBcmdzKTogUHJvbWlzZTxbRXZlbnRBbmRQcm9maWxlXT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNsb3NlIG91ciBldmVudCBpbmRleC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSBvbmNlIHRoZSBldmVudCBpbmRleCBoYXNcbiAgICAgKiBiZWVuIGNsb3NlZC5cbiAgICAgKi9cbiAgICBhc3luYyBjbG9zZUV2ZW50SW5kZXgoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIG91ciBjdXJyZW50IGV2ZW50IGluZGV4LlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIG9uY2UgdGhlIGV2ZW50IGluZGV4IGhhc1xuICAgICAqIGJlZW4gZGVsZXRlZC5cbiAgICAgKi9cbiAgICBhc3luYyBkZWxldGVFdmVudEluZGV4KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cbn1cbiJdfQ==
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchPagination = searchPagination;
exports.default = eventSearch;

var _EventIndexPeg = _interopRequireDefault(require("./indexing/EventIndexPeg"));

var _MatrixClientPeg = require("./MatrixClientPeg");

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
const SEARCH_LIMIT = 10;

async function serverSideSearch(term, roomId = undefined) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const filter = {
    limit: SEARCH_LIMIT
  };
  if (roomId !== undefined) filter.rooms = [roomId];
  const body = {
    search_categories: {
      room_events: {
        search_term: term,
        filter: filter,
        order_by: "recent",
        event_context: {
          before_limit: 1,
          after_limit: 1,
          include_profile: true
        }
      }
    }
  };
  const response = await client.search({
    body: body
  });
  const result = {
    response: response,
    query: body
  };
  return result;
}

async function serverSideSearchProcess(term, roomId = undefined) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const result = await serverSideSearch(term, roomId); // The js-sdk method backPaginateRoomEventsSearch() uses _query internally
  // so we're reusing the concept here since we wan't to delegate the
  // pagination back to backPaginateRoomEventsSearch() in some cases.

  const searchResult = {
    _query: result.query,
    results: [],
    highlights: []
  };
  return client._processRoomEventsSearch(searchResult, result.response);
}

function compareEvents(a, b) {
  const aEvent = a.result;
  const bEvent = b.result;
  if (aEvent.origin_server_ts > bEvent.origin_server_ts) return -1;
  if (aEvent.origin_server_ts < bEvent.origin_server_ts) return 1;
  return 0;
}

async function combinedSearch(searchTerm) {
  const client = _MatrixClientPeg.MatrixClientPeg.get(); // Create two promises, one for the local search, one for the
  // server-side search.


  const serverSidePromise = serverSideSearch(searchTerm);
  const localPromise = localSearch(searchTerm); // Wait for both promises to resolve.

  await Promise.all([serverSidePromise, localPromise]); // Get both search results.

  const localResult = await localPromise;
  const serverSideResult = await serverSidePromise;
  const serverQuery = serverSideResult.query;
  const serverResponse = serverSideResult.response;
  const localQuery = localResult.query;
  const localResponse = localResult.response; // Store our queries for later on so we can support pagination.
  //
  // We're reusing _query here again to not introduce separate code paths and
  // concepts for our different pagination methods. We're storing the
  // server-side next batch separately since the query is the json body of
  // the request and next_batch needs to be a query parameter.
  //
  // We can't put it in the final result that _processRoomEventsSearch()
  // returns since that one can be either a server-side one, a local one or a
  // fake one to fetch the remaining cached events. See the docs for
  // combineEvents() for an explanation why we need to cache events.

  const emptyResult = {
    seshatQuery: localQuery,
    _query: serverQuery,
    serverSideNextBatch: serverResponse.next_batch,
    cachedEvents: [],
    oldestEventFrom: "server",
    results: [],
    highlights: []
  }; // Combine our results.

  const combinedResult = combineResponses(emptyResult, localResponse, serverResponse.search_categories.room_events); // Let the client process the combined result.

  const response = {
    search_categories: {
      room_events: combinedResult
    }
  };

  const result = client._processRoomEventsSearch(emptyResult, response); // Restore our encryption info so we can properly re-verify the events.


  restoreEncryptionInfo(result.results);
  return result;
}

async function localSearch(searchTerm, roomId = undefined, processResult = true) {
  const eventIndex = _EventIndexPeg.default.get();

  const searchArgs = {
    search_term: searchTerm,
    before_limit: 1,
    after_limit: 1,
    limit: SEARCH_LIMIT,
    order_by_recency: true,
    room_id: undefined
  };

  if (roomId !== undefined) {
    searchArgs.room_id = roomId;
  }

  const localResult = await eventIndex.search(searchArgs);
  searchArgs.next_batch = localResult.next_batch;
  const result = {
    response: localResult,
    query: searchArgs
  };
  return result;
}

async function localSearchProcess(searchTerm, roomId = undefined) {
  const emptyResult = {
    results: [],
    highlights: []
  };
  if (searchTerm === "") return emptyResult;
  const result = await localSearch(searchTerm, roomId);
  emptyResult.seshatQuery = result.query;
  const response = {
    search_categories: {
      room_events: result.response
    }
  };

  const processedResult = _MatrixClientPeg.MatrixClientPeg.get()._processRoomEventsSearch(emptyResult, response); // Restore our encryption info so we can properly re-verify the events.


  restoreEncryptionInfo(processedResult.results);
  return processedResult;
}

async function localPagination(searchResult) {
  const eventIndex = _EventIndexPeg.default.get();

  const searchArgs = searchResult.seshatQuery;
  const localResult = await eventIndex.search(searchArgs);
  searchResult.seshatQuery.next_batch = localResult.next_batch; // We only need to restore the encryption state for the new results, so
  // remember how many of them we got.

  const newResultCount = localResult.results.length;
  const response = {
    search_categories: {
      room_events: localResult
    }
  };

  const result = _MatrixClientPeg.MatrixClientPeg.get()._processRoomEventsSearch(searchResult, response); // Restore our encryption info so we can properly re-verify the events.


  const newSlice = result.results.slice(Math.max(result.results.length - newResultCount, 0));
  restoreEncryptionInfo(newSlice);
  searchResult.pendingRequest = null;
  return result;
}

function compareOldestEvents(firstResults, secondResults) {
  try {
    const oldestFirstEvent = firstResults.results[firstResults.results.length - 1].result;
    const oldestSecondEvent = secondResults.results[secondResults.results.length - 1].result;

    if (oldestFirstEvent.origin_server_ts <= oldestSecondEvent.origin_server_ts) {
      return -1;
    } else {
      return 1;
    }
  } catch {
    return 0;
  }
}

function combineEventSources(previousSearchResult, response, a, b) {
  // Merge event sources and sort the events.
  const combinedEvents = a.concat(b).sort(compareEvents); // Put half of the events in the response, and cache the other half.

  response.results = combinedEvents.slice(0, SEARCH_LIMIT);
  previousSearchResult.cachedEvents = combinedEvents.slice(SEARCH_LIMIT);
}
/**
 * Combine the events from our event sources into a sorted result
 *
 * This method will first be called from the combinedSearch() method. In this
 * case we will fetch SEARCH_LIMIT events from the server and the local index.
 *
 * The method will put the SEARCH_LIMIT newest events from the server and the
 * local index in the results part of the response, the rest will be put in the
 * cachedEvents field of the previousSearchResult (in this case an empty search
 * result).
 *
 * Every subsequent call will be made from the combinedPagination() method, in
 * this case we will combine the cachedEvents and the next SEARCH_LIMIT events
 * from either the server or the local index.
 *
 * Since we have two event sources and we need to sort the results by date we
 * need keep on looking for the oldest event. We are implementing a variation of
 * a sliding window.
 *
 * The event sources are here represented as two sorted lists where the smallest
 * number represents the newest event. The two lists need to be merged in a way
 * that preserves the sorted property so they can be shown as one search result.
 * We first fetch SEARCH_LIMIT events from both sources.
 *
 * If we set SEARCH_LIMIT to 3:
 *
 *  Server events [01, 02, 04, 06, 07, 08, 11, 13]
 *                |01, 02, 04|
 *  Local events  [03, 05, 09, 10, 12, 14, 15, 16]
 *                |03, 05, 09|
 *
 *  We note that the oldest event is from the local index, and we combine the
 *  results:
 *
 *  Server window [01, 02, 04]
 *  Local window  [03, 05, 09]
 *
 *  Combined events [01, 02, 03, 04, 05, 09]
 *
 *  We split the combined result in the part that we want to present and a part
 *  that will be cached.
 *
 *  Presented events [01, 02, 03]
 *  Cached events    [04, 05, 09]
 *
 *  We slide the window for the server since the oldest event is from the local
 *  index.
 *
 *  Server events [01, 02, 04, 06, 07, 08, 11, 13]
 *                            |06, 07, 08|
 *  Local events  [03, 05, 09, 10, 12, 14, 15, 16]
 *                |XX, XX, XX|
 *  Cached events [04, 05, 09]
 *
 *  We note that the oldest event is from the server and we combine the new
 *  server events with the cached ones.
 *
 *  Cached events [04, 05, 09]
 *  Server events [06, 07, 08]
 *
 *  Combined events [04, 05, 06, 07, 08, 09]
 *
 *  We split again.
 *
 *  Presented events [04, 05, 06]
 *  Cached events    [07, 08, 09]
 *
 *  We slide the local window, the oldest event is on the server.
 *
 *  Server events [01, 02, 04, 06, 07, 08, 11, 13]
 *                            |XX, XX, XX|
 *  Local events  [03, 05, 09, 10, 12, 14, 15, 16]
 *                            |10, 12, 14|
 *
 *  Cached events [07, 08, 09]
 *  Local events  [10, 12, 14]
 *  Combined events [07, 08, 09, 10, 12, 14]
 *
 *  Presented events [07, 08, 09]
 *  Cached events    [10, 12, 14]
 *
 *  Next up we slide the server window again.
 *
 *  Server events [01, 02, 04, 06, 07, 08, 11, 13]
 *                                        |11, 13|
 *  Local events  [03, 05, 09, 10, 12, 14, 15, 16]
 *                            |XX, XX, XX|
 *
 *  Cached events [10, 12, 14]
 *  Server events [11, 13]
 *  Combined events [10, 11, 12, 13, 14]
 *
 *  Presented events [10, 11, 12]
 *  Cached events    [13, 14]
 *
 *  We have one source exhausted, we fetch the rest of our events from the other
 *  source and combine it with our cached events.
 *
 *
 * @param {object} previousSearchResult A search result from a previous search
 * call.
 * @param {object} localEvents An unprocessed search result from the event
 * index.
 * @param {object} serverEvents An unprocessed search result from the server.
 *
 * @return {object} A response object that combines the events from the
 * different event sources.
 *
 */


function combineEvents(previousSearchResult, localEvents = undefined, serverEvents = undefined) {
  const response = {};
  const cachedEvents = previousSearchResult.cachedEvents;
  let oldestEventFrom = previousSearchResult.oldestEventFrom;
  response.highlights = previousSearchResult.highlights;

  if (localEvents && serverEvents && serverEvents.results) {
    // This is a first search call, combine the events from the server and
    // the local index. Note where our oldest event came from, we shall
    // fetch the next batch of events from the other source.
    if (compareOldestEvents(localEvents, serverEvents) < 0) {
      oldestEventFrom = "local";
    }

    combineEventSources(previousSearchResult, response, localEvents.results, serverEvents.results);
    response.highlights = localEvents.highlights.concat(serverEvents.highlights);
  } else if (localEvents) {
    // This is a pagination call fetching more events from the local index,
    // meaning that our oldest event was on the server.
    // Change the source of the oldest event if our local event is older
    // than the cached one.
    if (compareOldestEvents(localEvents, cachedEvents) < 0) {
      oldestEventFrom = "local";
    }

    combineEventSources(previousSearchResult, response, localEvents.results, cachedEvents);
  } else if (serverEvents && serverEvents.results) {
    // This is a pagination call fetching more events from the server,
    // meaning that our oldest event was in the local index.
    // Change the source of the oldest event if our server event is older
    // than the cached one.
    if (compareOldestEvents(serverEvents, cachedEvents) < 0) {
      oldestEventFrom = "server";
    }

    combineEventSources(previousSearchResult, response, serverEvents.results, cachedEvents);
  } else {
    // This is a pagination call where we exhausted both of our event
    // sources, let's push the remaining cached events.
    response.results = cachedEvents;
    previousSearchResult.cachedEvents = [];
  }

  previousSearchResult.oldestEventFrom = oldestEventFrom;
  return response;
}
/**
 * Combine the local and server search responses
 *
 * @param {object} previousSearchResult A search result from a previous search
 * call.
 * @param {object} localEvents An unprocessed search result from the event
 * index.
 * @param {object} serverEvents An unprocessed search result from the server.
 *
 * @return {object} A response object that combines the events from the
 * different event sources.
 */


function combineResponses(previousSearchResult, localEvents = undefined, serverEvents = undefined) {
  // Combine our events first.
  const response = combineEvents(previousSearchResult, localEvents, serverEvents); // Our first search will contain counts from both sources, subsequent
  // pagination requests will fetch responses only from one of the sources, so
  // reuse the first count when we're paginating.

  if (previousSearchResult.count) {
    response.count = previousSearchResult.count;
  } else {
    response.count = localEvents.count + serverEvents.count;
  } // Update our next batch tokens for the given search sources.


  if (localEvents) {
    previousSearchResult.seshatQuery.next_batch = localEvents.next_batch;
  }

  if (serverEvents) {
    previousSearchResult.serverSideNextBatch = serverEvents.next_batch;
  } // Set the response next batch token to one of the tokens from the sources,
  // this makes sure that if we exhaust one of the sources we continue with
  // the other one.


  if (previousSearchResult.seshatQuery.next_batch) {
    response.next_batch = previousSearchResult.seshatQuery.next_batch;
  } else if (previousSearchResult.serverSideNextBatch) {
    response.next_batch = previousSearchResult.serverSideNextBatch;
  } // We collected all search results from the server as well as from Seshat,
  // we still have some events cached that we'll want to display on the next
  // pagination request.
  //
  // Provide a fake next batch token for that case.


  if (!response.next_batch && previousSearchResult.cachedEvents.length > 0) {
    response.next_batch = "cached";
  }

  return response;
}

function restoreEncryptionInfo(searchResultSlice = []) {
  for (let i = 0; i < searchResultSlice.length; i++) {
    const timeline = searchResultSlice[i].context.getTimeline();

    for (let j = 0; j < timeline.length; j++) {
      const ev = timeline[j];

      if (ev.event.curve25519Key) {
        ev.makeEncrypted("m.room.encrypted", {
          algorithm: ev.event.algorithm
        }, ev.event.curve25519Key, ev.event.ed25519Key);
        ev._forwardingCurve25519KeyChain = ev.event.forwardingCurve25519KeyChain;
        delete ev.event.curve25519Key;
        delete ev.event.ed25519Key;
        delete ev.event.algorithm;
        delete ev.event.forwardingCurve25519KeyChain;
      }
    }
  }
}

async function combinedPagination(searchResult) {
  const eventIndex = _EventIndexPeg.default.get();

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const searchArgs = searchResult.seshatQuery;
  const oldestEventFrom = searchResult.oldestEventFrom;
  let localResult;
  let serverSideResult; // Fetch events from the local index if we have a token for itand if it's
  // the local indexes turn or the server has exhausted its results.

  if (searchArgs.next_batch && (!searchResult.serverSideNextBatch || oldestEventFrom === "server")) {
    localResult = await eventIndex.search(searchArgs);
  } // Fetch events from the server if we have a token for it and if it's the
  // local indexes turn or the local index has exhausted its results.


  if (searchResult.serverSideNextBatch && (oldestEventFrom === "local" || !searchArgs.next_batch)) {
    const body = {
      body: searchResult._query,
      next_batch: searchResult.serverSideNextBatch
    };
    serverSideResult = await client.search(body);
  }

  let serverEvents;

  if (serverSideResult) {
    serverEvents = serverSideResult.search_categories.room_events;
  } // Combine our events.


  const combinedResult = combineResponses(searchResult, localResult, serverEvents);
  const response = {
    search_categories: {
      room_events: combinedResult
    }
  };
  const oldResultCount = searchResult.results ? searchResult.results.length : 0; // Let the client process the combined result.

  const result = client._processRoomEventsSearch(searchResult, response); // Restore our encryption info so we can properly re-verify the events.


  const newResultCount = result.results.length - oldResultCount;
  const newSlice = result.results.slice(Math.max(result.results.length - newResultCount, 0));
  restoreEncryptionInfo(newSlice);
  searchResult.pendingRequest = null;
  return result;
}

function eventIndexSearch(term, roomId = undefined) {
  let searchPromise;

  if (roomId !== undefined) {
    if (_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(roomId)) {
      // The search is for a single encrypted room, use our local
      // search method.
      searchPromise = localSearchProcess(term, roomId);
    } else {
      // The search is for a single non-encrypted room, use the
      // server-side search.
      searchPromise = serverSideSearchProcess(term, roomId);
    }
  } else {
    // Search across all rooms, combine a server side search and a
    // local search.
    searchPromise = combinedSearch(term);
  }

  return searchPromise;
}

function eventIndexSearchPagination(searchResult) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const seshatQuery = searchResult.seshatQuery;
  const serverQuery = searchResult._query;

  if (!seshatQuery) {
    // This is a search in a non-encrypted room. Do the normal server-side
    // pagination.
    return client.backPaginateRoomEventsSearch(searchResult);
  } else if (!serverQuery) {
    // This is a search in a encrypted room. Do a local pagination.
    const promise = localPagination(searchResult);
    searchResult.pendingRequest = promise;
    return promise;
  } else {
    // We have both queries around, this is a search across all rooms so a
    // combined pagination needs to be done.
    const promise = combinedPagination(searchResult);
    searchResult.pendingRequest = promise;
    return promise;
  }
}

function searchPagination(searchResult) {
  const eventIndex = _EventIndexPeg.default.get();

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (searchResult.pendingRequest) return searchResult.pendingRequest;
  if (eventIndex === null) return client.backPaginateRoomEventsSearch(searchResult);else return eventIndexSearchPagination(searchResult);
}

function eventSearch(term, roomId = undefined) {
  const eventIndex = _EventIndexPeg.default.get();

  if (eventIndex === null) return serverSideSearchProcess(term, roomId);else return eventIndexSearch(term, roomId);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TZWFyY2hpbmcuanMiXSwibmFtZXMiOlsiU0VBUkNIX0xJTUlUIiwic2VydmVyU2lkZVNlYXJjaCIsInRlcm0iLCJyb29tSWQiLCJ1bmRlZmluZWQiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJmaWx0ZXIiLCJsaW1pdCIsInJvb21zIiwiYm9keSIsInNlYXJjaF9jYXRlZ29yaWVzIiwicm9vbV9ldmVudHMiLCJzZWFyY2hfdGVybSIsIm9yZGVyX2J5IiwiZXZlbnRfY29udGV4dCIsImJlZm9yZV9saW1pdCIsImFmdGVyX2xpbWl0IiwiaW5jbHVkZV9wcm9maWxlIiwicmVzcG9uc2UiLCJzZWFyY2giLCJyZXN1bHQiLCJxdWVyeSIsInNlcnZlclNpZGVTZWFyY2hQcm9jZXNzIiwic2VhcmNoUmVzdWx0IiwiX3F1ZXJ5IiwicmVzdWx0cyIsImhpZ2hsaWdodHMiLCJfcHJvY2Vzc1Jvb21FdmVudHNTZWFyY2giLCJjb21wYXJlRXZlbnRzIiwiYSIsImIiLCJhRXZlbnQiLCJiRXZlbnQiLCJvcmlnaW5fc2VydmVyX3RzIiwiY29tYmluZWRTZWFyY2giLCJzZWFyY2hUZXJtIiwic2VydmVyU2lkZVByb21pc2UiLCJsb2NhbFByb21pc2UiLCJsb2NhbFNlYXJjaCIsIlByb21pc2UiLCJhbGwiLCJsb2NhbFJlc3VsdCIsInNlcnZlclNpZGVSZXN1bHQiLCJzZXJ2ZXJRdWVyeSIsInNlcnZlclJlc3BvbnNlIiwibG9jYWxRdWVyeSIsImxvY2FsUmVzcG9uc2UiLCJlbXB0eVJlc3VsdCIsInNlc2hhdFF1ZXJ5Iiwic2VydmVyU2lkZU5leHRCYXRjaCIsIm5leHRfYmF0Y2giLCJjYWNoZWRFdmVudHMiLCJvbGRlc3RFdmVudEZyb20iLCJjb21iaW5lZFJlc3VsdCIsImNvbWJpbmVSZXNwb25zZXMiLCJyZXN0b3JlRW5jcnlwdGlvbkluZm8iLCJwcm9jZXNzUmVzdWx0IiwiZXZlbnRJbmRleCIsIkV2ZW50SW5kZXhQZWciLCJzZWFyY2hBcmdzIiwib3JkZXJfYnlfcmVjZW5jeSIsInJvb21faWQiLCJsb2NhbFNlYXJjaFByb2Nlc3MiLCJwcm9jZXNzZWRSZXN1bHQiLCJsb2NhbFBhZ2luYXRpb24iLCJuZXdSZXN1bHRDb3VudCIsImxlbmd0aCIsIm5ld1NsaWNlIiwic2xpY2UiLCJNYXRoIiwibWF4IiwicGVuZGluZ1JlcXVlc3QiLCJjb21wYXJlT2xkZXN0RXZlbnRzIiwiZmlyc3RSZXN1bHRzIiwic2Vjb25kUmVzdWx0cyIsIm9sZGVzdEZpcnN0RXZlbnQiLCJvbGRlc3RTZWNvbmRFdmVudCIsImNvbWJpbmVFdmVudFNvdXJjZXMiLCJwcmV2aW91c1NlYXJjaFJlc3VsdCIsImNvbWJpbmVkRXZlbnRzIiwiY29uY2F0Iiwic29ydCIsImNvbWJpbmVFdmVudHMiLCJsb2NhbEV2ZW50cyIsInNlcnZlckV2ZW50cyIsImNvdW50Iiwic2VhcmNoUmVzdWx0U2xpY2UiLCJpIiwidGltZWxpbmUiLCJjb250ZXh0IiwiZ2V0VGltZWxpbmUiLCJqIiwiZXYiLCJldmVudCIsImN1cnZlMjU1MTlLZXkiLCJtYWtlRW5jcnlwdGVkIiwiYWxnb3JpdGhtIiwiZWQyNTUxOUtleSIsIl9mb3J3YXJkaW5nQ3VydmUyNTUxOUtleUNoYWluIiwiZm9yd2FyZGluZ0N1cnZlMjU1MTlLZXlDaGFpbiIsImNvbWJpbmVkUGFnaW5hdGlvbiIsIm9sZFJlc3VsdENvdW50IiwiZXZlbnRJbmRleFNlYXJjaCIsInNlYXJjaFByb21pc2UiLCJpc1Jvb21FbmNyeXB0ZWQiLCJldmVudEluZGV4U2VhcmNoUGFnaW5hdGlvbiIsImJhY2tQYWdpbmF0ZVJvb21FdmVudHNTZWFyY2giLCJwcm9taXNlIiwic2VhcmNoUGFnaW5hdGlvbiIsImV2ZW50U2VhcmNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQWpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQSxNQUFN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LGdCQUFULENBQTBCckYsWUFBMUIsRUFBd0M7QUFDM0MsUUFBTWtDLFVBQVUsR0FBR0MsdUJBQWNyRCxHQUFkLEVBQW5COztBQUNBLFFBQU1GLE1BQU0sR0FBR0MsaUNBQWdCQyxHQUFoQixFQUFmOztBQUVBLE1BQUlrQixZQUFZLENBQUNnRCxjQUFqQixFQUFpQyxPQUFPaEQsWUFBWSxDQUFDZ0QsY0FBcEI7QUFFakMsTUFBSWQsVUFBVSxLQUFLLElBQW5CLEVBQXlCLE9BQU90RCxNQUFNLENBQUN1Ryw0QkFBUCxDQUFvQ25GLFlBQXBDLENBQVAsQ0FBekIsS0FDSyxPQUFPa0YsMEJBQTBCLENBQUNsRixZQUFELENBQWpDO0FBQ1I7O0FBRWMsU0FBU3NGLFdBQVQsQ0FBcUI3RyxJQUFyQixFQUEyQkMsTUFBTSxHQUFHQyxTQUFwQyxFQUErQztBQUMxRCxRQUFNdUQsVUFBVSxHQUFHQyx1QkFBY3JELEdBQWQsRUFBbkI7O0FBRUEsTUFBSW9ELFVBQVUsS0FBSyxJQUFuQixFQUF5QixPQUFPbkMsdUJBQXVCLENBQUN0QixJQUFELEVBQU9DLE1BQVAsQ0FBOUIsQ0FBekIsS0FDSyxPQUFPcUcsZ0JBQWdCLENBQUN0RyxJQUFELEVBQU9DLE1BQVAsQ0FBdkI7QUFDUiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBFdmVudEluZGV4UGVnIGZyb20gXCIuL2luZGV4aW5nL0V2ZW50SW5kZXhQZWdcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi9NYXRyaXhDbGllbnRQZWdcIjtcblxuY29uc3QgU0VBUkNIX0xJTUlUID0gMTA7XG5cbmFzeW5jIGZ1bmN0aW9uIHNlcnZlclNpZGVTZWFyY2godGVybSwgcm9vbUlkID0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgY29uc3QgZmlsdGVyID0ge1xuICAgICAgICBsaW1pdDogU0VBUkNIX0xJTUlULFxuICAgIH07XG5cbiAgICBpZiAocm9vbUlkICE9PSB1bmRlZmluZWQpIGZpbHRlci5yb29tcyA9IFtyb29tSWRdO1xuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgICAgc2VhcmNoX2NhdGVnb3JpZXM6IHtcbiAgICAgICAgICAgIHJvb21fZXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgc2VhcmNoX3Rlcm06IHRlcm0sXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmaWx0ZXIsXG4gICAgICAgICAgICAgICAgb3JkZXJfYnk6IFwicmVjZW50XCIsXG4gICAgICAgICAgICAgICAgZXZlbnRfY29udGV4dDoge1xuICAgICAgICAgICAgICAgICAgICBiZWZvcmVfbGltaXQ6IDEsXG4gICAgICAgICAgICAgICAgICAgIGFmdGVyX2xpbWl0OiAxLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlX3Byb2ZpbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlYXJjaCh7Ym9keTogYm9keX0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICByZXNwb25zZTogcmVzcG9uc2UsXG4gICAgICAgIHF1ZXJ5OiBib2R5LFxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXJ2ZXJTaWRlU2VhcmNoUHJvY2Vzcyh0ZXJtLCByb29tSWQgPSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2VydmVyU2lkZVNlYXJjaCh0ZXJtLCByb29tSWQpO1xuXG4gICAgLy8gVGhlIGpzLXNkayBtZXRob2QgYmFja1BhZ2luYXRlUm9vbUV2ZW50c1NlYXJjaCgpIHVzZXMgX3F1ZXJ5IGludGVybmFsbHlcbiAgICAvLyBzbyB3ZSdyZSByZXVzaW5nIHRoZSBjb25jZXB0IGhlcmUgc2luY2Ugd2Ugd2FuJ3QgdG8gZGVsZWdhdGUgdGhlXG4gICAgLy8gcGFnaW5hdGlvbiBiYWNrIHRvIGJhY2tQYWdpbmF0ZVJvb21FdmVudHNTZWFyY2goKSBpbiBzb21lIGNhc2VzLlxuICAgIGNvbnN0IHNlYXJjaFJlc3VsdCA9IHtcbiAgICAgICAgX3F1ZXJ5OiByZXN1bHQucXVlcnksXG4gICAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgICBoaWdobGlnaHRzOiBbXSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGNsaWVudC5fcHJvY2Vzc1Jvb21FdmVudHNTZWFyY2goc2VhcmNoUmVzdWx0LCByZXN1bHQucmVzcG9uc2UpO1xufVxuXG5mdW5jdGlvbiBjb21wYXJlRXZlbnRzKGEsIGIpIHtcbiAgICBjb25zdCBhRXZlbnQgPSBhLnJlc3VsdDtcbiAgICBjb25zdCBiRXZlbnQgPSBiLnJlc3VsdDtcblxuICAgIGlmIChhRXZlbnQub3JpZ2luX3NlcnZlcl90cyA+IGJFdmVudC5vcmlnaW5fc2VydmVyX3RzKSByZXR1cm4gLTE7XG4gICAgaWYgKGFFdmVudC5vcmlnaW5fc2VydmVyX3RzIDwgYkV2ZW50Lm9yaWdpbl9zZXJ2ZXJfdHMpIHJldHVybiAxO1xuXG4gICAgcmV0dXJuIDA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbWJpbmVkU2VhcmNoKHNlYXJjaFRlcm0pIHtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAvLyBDcmVhdGUgdHdvIHByb21pc2VzLCBvbmUgZm9yIHRoZSBsb2NhbCBzZWFyY2gsIG9uZSBmb3IgdGhlXG4gICAgLy8gc2VydmVyLXNpZGUgc2VhcmNoLlxuICAgIGNvbnN0IHNlcnZlclNpZGVQcm9taXNlID0gc2VydmVyU2lkZVNlYXJjaChzZWFyY2hUZXJtKTtcbiAgICBjb25zdCBsb2NhbFByb21pc2UgPSBsb2NhbFNlYXJjaChzZWFyY2hUZXJtKTtcblxuICAgIC8vIFdhaXQgZm9yIGJvdGggcHJvbWlzZXMgdG8gcmVzb2x2ZS5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChbc2VydmVyU2lkZVByb21pc2UsIGxvY2FsUHJvbWlzZV0pO1xuXG4gICAgLy8gR2V0IGJvdGggc2VhcmNoIHJlc3VsdHMuXG4gICAgY29uc3QgbG9jYWxSZXN1bHQgPSBhd2FpdCBsb2NhbFByb21pc2U7XG4gICAgY29uc3Qgc2VydmVyU2lkZVJlc3VsdCA9IGF3YWl0IHNlcnZlclNpZGVQcm9taXNlO1xuXG4gICAgY29uc3Qgc2VydmVyUXVlcnkgPSBzZXJ2ZXJTaWRlUmVzdWx0LnF1ZXJ5O1xuICAgIGNvbnN0IHNlcnZlclJlc3BvbnNlID0gc2VydmVyU2lkZVJlc3VsdC5yZXNwb25zZTtcblxuICAgIGNvbnN0IGxvY2FsUXVlcnkgPSBsb2NhbFJlc3VsdC5xdWVyeTtcbiAgICBjb25zdCBsb2NhbFJlc3BvbnNlID0gbG9jYWxSZXN1bHQucmVzcG9uc2U7XG5cbiAgICAvLyBTdG9yZSBvdXIgcXVlcmllcyBmb3IgbGF0ZXIgb24gc28gd2UgY2FuIHN1cHBvcnQgcGFnaW5hdGlvbi5cbiAgICAvL1xuICAgIC8vIFdlJ3JlIHJldXNpbmcgX3F1ZXJ5IGhlcmUgYWdhaW4gdG8gbm90IGludHJvZHVjZSBzZXBhcmF0ZSBjb2RlIHBhdGhzIGFuZFxuICAgIC8vIGNvbmNlcHRzIGZvciBvdXIgZGlmZmVyZW50IHBhZ2luYXRpb24gbWV0aG9kcy4gV2UncmUgc3RvcmluZyB0aGVcbiAgICAvLyBzZXJ2ZXItc2lkZSBuZXh0IGJhdGNoIHNlcGFyYXRlbHkgc2luY2UgdGhlIHF1ZXJ5IGlzIHRoZSBqc29uIGJvZHkgb2ZcbiAgICAvLyB0aGUgcmVxdWVzdCBhbmQgbmV4dF9iYXRjaCBuZWVkcyB0byBiZSBhIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICAvL1xuICAgIC8vIFdlIGNhbid0IHB1dCBpdCBpbiB0aGUgZmluYWwgcmVzdWx0IHRoYXQgX3Byb2Nlc3NSb29tRXZlbnRzU2VhcmNoKClcbiAgICAvLyByZXR1cm5zIHNpbmNlIHRoYXQgb25lIGNhbiBiZSBlaXRoZXIgYSBzZXJ2ZXItc2lkZSBvbmUsIGEgbG9jYWwgb25lIG9yIGFcbiAgICAvLyBmYWtlIG9uZSB0byBmZXRjaCB0aGUgcmVtYWluaW5nIGNhY2hlZCBldmVudHMuIFNlZSB0aGUgZG9jcyBmb3JcbiAgICAvLyBjb21iaW5lRXZlbnRzKCkgZm9yIGFuIGV4cGxhbmF0aW9uIHdoeSB3ZSBuZWVkIHRvIGNhY2hlIGV2ZW50cy5cbiAgICBjb25zdCBlbXB0eVJlc3VsdCA9IHtcbiAgICAgICAgc2VzaGF0UXVlcnk6IGxvY2FsUXVlcnksXG4gICAgICAgIF9xdWVyeTogc2VydmVyUXVlcnksXG4gICAgICAgIHNlcnZlclNpZGVOZXh0QmF0Y2g6IHNlcnZlclJlc3BvbnNlLm5leHRfYmF0Y2gsXG4gICAgICAgIGNhY2hlZEV2ZW50czogW10sXG4gICAgICAgIG9sZGVzdEV2ZW50RnJvbTogXCJzZXJ2ZXJcIixcbiAgICAgICAgcmVzdWx0czogW10sXG4gICAgICAgIGhpZ2hsaWdodHM6IFtdLFxuICAgIH07XG5cbiAgICAvLyBDb21iaW5lIG91ciByZXN1bHRzLlxuICAgIGNvbnN0IGNvbWJpbmVkUmVzdWx0ID0gY29tYmluZVJlc3BvbnNlcyhlbXB0eVJlc3VsdCwgbG9jYWxSZXNwb25zZSwgc2VydmVyUmVzcG9uc2Uuc2VhcmNoX2NhdGVnb3JpZXMucm9vbV9ldmVudHMpO1xuXG4gICAgLy8gTGV0IHRoZSBjbGllbnQgcHJvY2VzcyB0aGUgY29tYmluZWQgcmVzdWx0LlxuICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICBzZWFyY2hfY2F0ZWdvcmllczoge1xuICAgICAgICAgICAgcm9vbV9ldmVudHM6IGNvbWJpbmVkUmVzdWx0LFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCByZXN1bHQgPSBjbGllbnQuX3Byb2Nlc3NSb29tRXZlbnRzU2VhcmNoKGVtcHR5UmVzdWx0LCByZXNwb25zZSk7XG5cbiAgICAvLyBSZXN0b3JlIG91ciBlbmNyeXB0aW9uIGluZm8gc28gd2UgY2FuIHByb3Blcmx5IHJlLXZlcmlmeSB0aGUgZXZlbnRzLlxuICAgIHJlc3RvcmVFbmNyeXB0aW9uSW5mbyhyZXN1bHQucmVzdWx0cyk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2NhbFNlYXJjaChzZWFyY2hUZXJtLCByb29tSWQgPSB1bmRlZmluZWQsIHByb2Nlc3NSZXN1bHQgPSB0cnVlKSB7XG4gICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG5cbiAgICBjb25zdCBzZWFyY2hBcmdzID0ge1xuICAgICAgICBzZWFyY2hfdGVybTogc2VhcmNoVGVybSxcbiAgICAgICAgYmVmb3JlX2xpbWl0OiAxLFxuICAgICAgICBhZnRlcl9saW1pdDogMSxcbiAgICAgICAgbGltaXQ6IFNFQVJDSF9MSU1JVCxcbiAgICAgICAgb3JkZXJfYnlfcmVjZW5jeTogdHJ1ZSxcbiAgICAgICAgcm9vbV9pZDogdW5kZWZpbmVkLFxuICAgIH07XG5cbiAgICBpZiAocm9vbUlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2VhcmNoQXJncy5yb29tX2lkID0gcm9vbUlkO1xuICAgIH1cblxuICAgIGNvbnN0IGxvY2FsUmVzdWx0ID0gYXdhaXQgZXZlbnRJbmRleC5zZWFyY2goc2VhcmNoQXJncyk7XG5cbiAgICBzZWFyY2hBcmdzLm5leHRfYmF0Y2ggPSBsb2NhbFJlc3VsdC5uZXh0X2JhdGNoO1xuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICByZXNwb25zZTogbG9jYWxSZXN1bHQsXG4gICAgICAgIHF1ZXJ5OiBzZWFyY2hBcmdzLFxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2NhbFNlYXJjaFByb2Nlc3Moc2VhcmNoVGVybSwgcm9vbUlkID0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgZW1wdHlSZXN1bHQgPSB7XG4gICAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgICBoaWdobGlnaHRzOiBbXSxcbiAgICB9O1xuXG4gICAgaWYgKHNlYXJjaFRlcm0gPT09IFwiXCIpIHJldHVybiBlbXB0eVJlc3VsdDtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGxvY2FsU2VhcmNoKHNlYXJjaFRlcm0sIHJvb21JZCk7XG5cbiAgICBlbXB0eVJlc3VsdC5zZXNoYXRRdWVyeSA9IHJlc3VsdC5xdWVyeTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICBzZWFyY2hfY2F0ZWdvcmllczoge1xuICAgICAgICAgICAgcm9vbV9ldmVudHM6IHJlc3VsdC5yZXNwb25zZSxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgY29uc3QgcHJvY2Vzc2VkUmVzdWx0ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLl9wcm9jZXNzUm9vbUV2ZW50c1NlYXJjaChlbXB0eVJlc3VsdCwgcmVzcG9uc2UpO1xuICAgIC8vIFJlc3RvcmUgb3VyIGVuY3J5cHRpb24gaW5mbyBzbyB3ZSBjYW4gcHJvcGVybHkgcmUtdmVyaWZ5IHRoZSBldmVudHMuXG4gICAgcmVzdG9yZUVuY3J5cHRpb25JbmZvKHByb2Nlc3NlZFJlc3VsdC5yZXN1bHRzKTtcblxuICAgIHJldHVybiBwcm9jZXNzZWRSZXN1bHQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvY2FsUGFnaW5hdGlvbihzZWFyY2hSZXN1bHQpIHtcbiAgICBjb25zdCBldmVudEluZGV4ID0gRXZlbnRJbmRleFBlZy5nZXQoKTtcblxuICAgIGNvbnN0IHNlYXJjaEFyZ3MgPSBzZWFyY2hSZXN1bHQuc2VzaGF0UXVlcnk7XG5cbiAgICBjb25zdCBsb2NhbFJlc3VsdCA9IGF3YWl0IGV2ZW50SW5kZXguc2VhcmNoKHNlYXJjaEFyZ3MpO1xuICAgIHNlYXJjaFJlc3VsdC5zZXNoYXRRdWVyeS5uZXh0X2JhdGNoID0gbG9jYWxSZXN1bHQubmV4dF9iYXRjaDtcblxuICAgIC8vIFdlIG9ubHkgbmVlZCB0byByZXN0b3JlIHRoZSBlbmNyeXB0aW9uIHN0YXRlIGZvciB0aGUgbmV3IHJlc3VsdHMsIHNvXG4gICAgLy8gcmVtZW1iZXIgaG93IG1hbnkgb2YgdGhlbSB3ZSBnb3QuXG4gICAgY29uc3QgbmV3UmVzdWx0Q291bnQgPSBsb2NhbFJlc3VsdC5yZXN1bHRzLmxlbmd0aDtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICBzZWFyY2hfY2F0ZWdvcmllczoge1xuICAgICAgICAgICAgcm9vbV9ldmVudHM6IGxvY2FsUmVzdWx0LFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCByZXN1bHQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuX3Byb2Nlc3NSb29tRXZlbnRzU2VhcmNoKHNlYXJjaFJlc3VsdCwgcmVzcG9uc2UpO1xuXG4gICAgLy8gUmVzdG9yZSBvdXIgZW5jcnlwdGlvbiBpbmZvIHNvIHdlIGNhbiBwcm9wZXJseSByZS12ZXJpZnkgdGhlIGV2ZW50cy5cbiAgICBjb25zdCBuZXdTbGljZSA9IHJlc3VsdC5yZXN1bHRzLnNsaWNlKE1hdGgubWF4KHJlc3VsdC5yZXN1bHRzLmxlbmd0aCAtIG5ld1Jlc3VsdENvdW50LCAwKSk7XG4gICAgcmVzdG9yZUVuY3J5cHRpb25JbmZvKG5ld1NsaWNlKTtcblxuICAgIHNlYXJjaFJlc3VsdC5wZW5kaW5nUmVxdWVzdCA9IG51bGw7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBjb21wYXJlT2xkZXN0RXZlbnRzKGZpcnN0UmVzdWx0cywgc2Vjb25kUmVzdWx0cykge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG9sZGVzdEZpcnN0RXZlbnQgPSBmaXJzdFJlc3VsdHMucmVzdWx0c1tmaXJzdFJlc3VsdHMucmVzdWx0cy5sZW5ndGggLSAxXS5yZXN1bHQ7XG4gICAgICAgIGNvbnN0IG9sZGVzdFNlY29uZEV2ZW50ID0gc2Vjb25kUmVzdWx0cy5yZXN1bHRzW3NlY29uZFJlc3VsdHMucmVzdWx0cy5sZW5ndGggLSAxXS5yZXN1bHQ7XG5cbiAgICAgICAgaWYgKG9sZGVzdEZpcnN0RXZlbnQub3JpZ2luX3NlcnZlcl90cyA8PSBvbGRlc3RTZWNvbmRFdmVudC5vcmlnaW5fc2VydmVyX3RzKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNvbWJpbmVFdmVudFNvdXJjZXMocHJldmlvdXNTZWFyY2hSZXN1bHQsIHJlc3BvbnNlLCBhLCBiKSB7XG4gICAgLy8gTWVyZ2UgZXZlbnQgc291cmNlcyBhbmQgc29ydCB0aGUgZXZlbnRzLlxuICAgIGNvbnN0IGNvbWJpbmVkRXZlbnRzID0gYS5jb25jYXQoYikuc29ydChjb21wYXJlRXZlbnRzKTtcbiAgICAvLyBQdXQgaGFsZiBvZiB0aGUgZXZlbnRzIGluIHRoZSByZXNwb25zZSwgYW5kIGNhY2hlIHRoZSBvdGhlciBoYWxmLlxuICAgIHJlc3BvbnNlLnJlc3VsdHMgPSBjb21iaW5lZEV2ZW50cy5zbGljZSgwLCBTRUFSQ0hfTElNSVQpO1xuICAgIHByZXZpb3VzU2VhcmNoUmVzdWx0LmNhY2hlZEV2ZW50cyA9IGNvbWJpbmVkRXZlbnRzLnNsaWNlKFNFQVJDSF9MSU1JVCk7XG59XG5cbi8qKlxuICogQ29tYmluZSB0aGUgZXZlbnRzIGZyb20gb3VyIGV2ZW50IHNvdXJjZXMgaW50byBhIHNvcnRlZCByZXN1bHRcbiAqXG4gKiBUaGlzIG1ldGhvZCB3aWxsIGZpcnN0IGJlIGNhbGxlZCBmcm9tIHRoZSBjb21iaW5lZFNlYXJjaCgpIG1ldGhvZC4gSW4gdGhpc1xuICogY2FzZSB3ZSB3aWxsIGZldGNoIFNFQVJDSF9MSU1JVCBldmVudHMgZnJvbSB0aGUgc2VydmVyIGFuZCB0aGUgbG9jYWwgaW5kZXguXG4gKlxuICogVGhlIG1ldGhvZCB3aWxsIHB1dCB0aGUgU0VBUkNIX0xJTUlUIG5ld2VzdCBldmVudHMgZnJvbSB0aGUgc2VydmVyIGFuZCB0aGVcbiAqIGxvY2FsIGluZGV4IGluIHRoZSByZXN1bHRzIHBhcnQgb2YgdGhlIHJlc3BvbnNlLCB0aGUgcmVzdCB3aWxsIGJlIHB1dCBpbiB0aGVcbiAqIGNhY2hlZEV2ZW50cyBmaWVsZCBvZiB0aGUgcHJldmlvdXNTZWFyY2hSZXN1bHQgKGluIHRoaXMgY2FzZSBhbiBlbXB0eSBzZWFyY2hcbiAqIHJlc3VsdCkuXG4gKlxuICogRXZlcnkgc3Vic2VxdWVudCBjYWxsIHdpbGwgYmUgbWFkZSBmcm9tIHRoZSBjb21iaW5lZFBhZ2luYXRpb24oKSBtZXRob2QsIGluXG4gKiB0aGlzIGNhc2Ugd2Ugd2lsbCBjb21iaW5lIHRoZSBjYWNoZWRFdmVudHMgYW5kIHRoZSBuZXh0IFNFQVJDSF9MSU1JVCBldmVudHNcbiAqIGZyb20gZWl0aGVyIHRoZSBzZXJ2ZXIgb3IgdGhlIGxvY2FsIGluZGV4LlxuICpcbiAqIFNpbmNlIHdlIGhhdmUgdHdvIGV2ZW50IHNvdXJjZXMgYW5kIHdlIG5lZWQgdG8gc29ydCB0aGUgcmVzdWx0cyBieSBkYXRlIHdlXG4gKiBuZWVkIGtlZXAgb24gbG9va2luZyBmb3IgdGhlIG9sZGVzdCBldmVudC4gV2UgYXJlIGltcGxlbWVudGluZyBhIHZhcmlhdGlvbiBvZlxuICogYSBzbGlkaW5nIHdpbmRvdy5cbiAqXG4gKiBUaGUgZXZlbnQgc291cmNlcyBhcmUgaGVyZSByZXByZXNlbnRlZCBhcyB0d28gc29ydGVkIGxpc3RzIHdoZXJlIHRoZSBzbWFsbGVzdFxuICogbnVtYmVyIHJlcHJlc2VudHMgdGhlIG5ld2VzdCBldmVudC4gVGhlIHR3byBsaXN0cyBuZWVkIHRvIGJlIG1lcmdlZCBpbiBhIHdheVxuICogdGhhdCBwcmVzZXJ2ZXMgdGhlIHNvcnRlZCBwcm9wZXJ0eSBzbyB0aGV5IGNhbiBiZSBzaG93biBhcyBvbmUgc2VhcmNoIHJlc3VsdC5cbiAqIFdlIGZpcnN0IGZldGNoIFNFQVJDSF9MSU1JVCBldmVudHMgZnJvbSBib3RoIHNvdXJjZXMuXG4gKlxuICogSWYgd2Ugc2V0IFNFQVJDSF9MSU1JVCB0byAzOlxuICpcbiAqICBTZXJ2ZXIgZXZlbnRzIFswMSwgMDIsIDA0LCAwNiwgMDcsIDA4LCAxMSwgMTNdXG4gKiAgICAgICAgICAgICAgICB8MDEsIDAyLCAwNHxcbiAqICBMb2NhbCBldmVudHMgIFswMywgMDUsIDA5LCAxMCwgMTIsIDE0LCAxNSwgMTZdXG4gKiAgICAgICAgICAgICAgICB8MDMsIDA1LCAwOXxcbiAqXG4gKiAgV2Ugbm90ZSB0aGF0IHRoZSBvbGRlc3QgZXZlbnQgaXMgZnJvbSB0aGUgbG9jYWwgaW5kZXgsIGFuZCB3ZSBjb21iaW5lIHRoZVxuICogIHJlc3VsdHM6XG4gKlxuICogIFNlcnZlciB3aW5kb3cgWzAxLCAwMiwgMDRdXG4gKiAgTG9jYWwgd2luZG93ICBbMDMsIDA1LCAwOV1cbiAqXG4gKiAgQ29tYmluZWQgZXZlbnRzIFswMSwgMDIsIDAzLCAwNCwgMDUsIDA5XVxuICpcbiAqICBXZSBzcGxpdCB0aGUgY29tYmluZWQgcmVzdWx0IGluIHRoZSBwYXJ0IHRoYXQgd2Ugd2FudCB0byBwcmVzZW50IGFuZCBhIHBhcnRcbiAqICB0aGF0IHdpbGwgYmUgY2FjaGVkLlxuICpcbiAqICBQcmVzZW50ZWQgZXZlbnRzIFswMSwgMDIsIDAzXVxuICogIENhY2hlZCBldmVudHMgICAgWzA0LCAwNSwgMDldXG4gKlxuICogIFdlIHNsaWRlIHRoZSB3aW5kb3cgZm9yIHRoZSBzZXJ2ZXIgc2luY2UgdGhlIG9sZGVzdCBldmVudCBpcyBmcm9tIHRoZSBsb2NhbFxuICogIGluZGV4LlxuICpcbiAqICBTZXJ2ZXIgZXZlbnRzIFswMSwgMDIsIDA0LCAwNiwgMDcsIDA4LCAxMSwgMTNdXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICB8MDYsIDA3LCAwOHxcbiAqICBMb2NhbCBldmVudHMgIFswMywgMDUsIDA5LCAxMCwgMTIsIDE0LCAxNSwgMTZdXG4gKiAgICAgICAgICAgICAgICB8WFgsIFhYLCBYWHxcbiAqICBDYWNoZWQgZXZlbnRzIFswNCwgMDUsIDA5XVxuICpcbiAqICBXZSBub3RlIHRoYXQgdGhlIG9sZGVzdCBldmVudCBpcyBmcm9tIHRoZSBzZXJ2ZXIgYW5kIHdlIGNvbWJpbmUgdGhlIG5ld1xuICogIHNlcnZlciBldmVudHMgd2l0aCB0aGUgY2FjaGVkIG9uZXMuXG4gKlxuICogIENhY2hlZCBldmVudHMgWzA0LCAwNSwgMDldXG4gKiAgU2VydmVyIGV2ZW50cyBbMDYsIDA3LCAwOF1cbiAqXG4gKiAgQ29tYmluZWQgZXZlbnRzIFswNCwgMDUsIDA2LCAwNywgMDgsIDA5XVxuICpcbiAqICBXZSBzcGxpdCBhZ2Fpbi5cbiAqXG4gKiAgUHJlc2VudGVkIGV2ZW50cyBbMDQsIDA1LCAwNl1cbiAqICBDYWNoZWQgZXZlbnRzICAgIFswNywgMDgsIDA5XVxuICpcbiAqICBXZSBzbGlkZSB0aGUgbG9jYWwgd2luZG93LCB0aGUgb2xkZXN0IGV2ZW50IGlzIG9uIHRoZSBzZXJ2ZXIuXG4gKlxuICogIFNlcnZlciBldmVudHMgWzAxLCAwMiwgMDQsIDA2LCAwNywgMDgsIDExLCAxM11cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxYWCwgWFgsIFhYfFxuICogIExvY2FsIGV2ZW50cyAgWzAzLCAwNSwgMDksIDEwLCAxMiwgMTQsIDE1LCAxNl1cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwxMCwgMTIsIDE0fFxuICpcbiAqICBDYWNoZWQgZXZlbnRzIFswNywgMDgsIDA5XVxuICogIExvY2FsIGV2ZW50cyAgWzEwLCAxMiwgMTRdXG4gKiAgQ29tYmluZWQgZXZlbnRzIFswNywgMDgsIDA5LCAxMCwgMTIsIDE0XVxuICpcbiAqICBQcmVzZW50ZWQgZXZlbnRzIFswNywgMDgsIDA5XVxuICogIENhY2hlZCBldmVudHMgICAgWzEwLCAxMiwgMTRdXG4gKlxuICogIE5leHQgdXAgd2Ugc2xpZGUgdGhlIHNlcnZlciB3aW5kb3cgYWdhaW4uXG4gKlxuICogIFNlcnZlciBldmVudHMgWzAxLCAwMiwgMDQsIDA2LCAwNywgMDgsIDExLCAxM11cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwxMSwgMTN8XG4gKiAgTG9jYWwgZXZlbnRzICBbMDMsIDA1LCAwOSwgMTAsIDEyLCAxNCwgMTUsIDE2XVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgfFhYLCBYWCwgWFh8XG4gKlxuICogIENhY2hlZCBldmVudHMgWzEwLCAxMiwgMTRdXG4gKiAgU2VydmVyIGV2ZW50cyBbMTEsIDEzXVxuICogIENvbWJpbmVkIGV2ZW50cyBbMTAsIDExLCAxMiwgMTMsIDE0XVxuICpcbiAqICBQcmVzZW50ZWQgZXZlbnRzIFsxMCwgMTEsIDEyXVxuICogIENhY2hlZCBldmVudHMgICAgWzEzLCAxNF1cbiAqXG4gKiAgV2UgaGF2ZSBvbmUgc291cmNlIGV4aGF1c3RlZCwgd2UgZmV0Y2ggdGhlIHJlc3Qgb2Ygb3VyIGV2ZW50cyBmcm9tIHRoZSBvdGhlclxuICogIHNvdXJjZSBhbmQgY29tYmluZSBpdCB3aXRoIG91ciBjYWNoZWQgZXZlbnRzLlxuICpcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcHJldmlvdXNTZWFyY2hSZXN1bHQgQSBzZWFyY2ggcmVzdWx0IGZyb20gYSBwcmV2aW91cyBzZWFyY2hcbiAqIGNhbGwuXG4gKiBAcGFyYW0ge29iamVjdH0gbG9jYWxFdmVudHMgQW4gdW5wcm9jZXNzZWQgc2VhcmNoIHJlc3VsdCBmcm9tIHRoZSBldmVudFxuICogaW5kZXguXG4gKiBAcGFyYW0ge29iamVjdH0gc2VydmVyRXZlbnRzIEFuIHVucHJvY2Vzc2VkIHNlYXJjaCByZXN1bHQgZnJvbSB0aGUgc2VydmVyLlxuICpcbiAqIEByZXR1cm4ge29iamVjdH0gQSByZXNwb25zZSBvYmplY3QgdGhhdCBjb21iaW5lcyB0aGUgZXZlbnRzIGZyb20gdGhlXG4gKiBkaWZmZXJlbnQgZXZlbnQgc291cmNlcy5cbiAqXG4gKi9cbmZ1bmN0aW9uIGNvbWJpbmVFdmVudHMocHJldmlvdXNTZWFyY2hSZXN1bHQsIGxvY2FsRXZlbnRzID0gdW5kZWZpbmVkLCBzZXJ2ZXJFdmVudHMgPSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IHt9O1xuXG4gICAgY29uc3QgY2FjaGVkRXZlbnRzID0gcHJldmlvdXNTZWFyY2hSZXN1bHQuY2FjaGVkRXZlbnRzO1xuICAgIGxldCBvbGRlc3RFdmVudEZyb20gPSBwcmV2aW91c1NlYXJjaFJlc3VsdC5vbGRlc3RFdmVudEZyb207XG4gICAgcmVzcG9uc2UuaGlnaGxpZ2h0cyA9IHByZXZpb3VzU2VhcmNoUmVzdWx0LmhpZ2hsaWdodHM7XG5cbiAgICBpZiAobG9jYWxFdmVudHMgJiYgc2VydmVyRXZlbnRzICYmIHNlcnZlckV2ZW50cy5yZXN1bHRzKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBmaXJzdCBzZWFyY2ggY2FsbCwgY29tYmluZSB0aGUgZXZlbnRzIGZyb20gdGhlIHNlcnZlciBhbmRcbiAgICAgICAgLy8gdGhlIGxvY2FsIGluZGV4LiBOb3RlIHdoZXJlIG91ciBvbGRlc3QgZXZlbnQgY2FtZSBmcm9tLCB3ZSBzaGFsbFxuICAgICAgICAvLyBmZXRjaCB0aGUgbmV4dCBiYXRjaCBvZiBldmVudHMgZnJvbSB0aGUgb3RoZXIgc291cmNlLlxuICAgICAgICBpZiAoY29tcGFyZU9sZGVzdEV2ZW50cyhsb2NhbEV2ZW50cywgc2VydmVyRXZlbnRzKSA8IDApIHtcbiAgICAgICAgICAgIG9sZGVzdEV2ZW50RnJvbSA9IFwibG9jYWxcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbWJpbmVFdmVudFNvdXJjZXMocHJldmlvdXNTZWFyY2hSZXN1bHQsIHJlc3BvbnNlLCBsb2NhbEV2ZW50cy5yZXN1bHRzLCBzZXJ2ZXJFdmVudHMucmVzdWx0cyk7XG4gICAgICAgIHJlc3BvbnNlLmhpZ2hsaWdodHMgPSBsb2NhbEV2ZW50cy5oaWdobGlnaHRzLmNvbmNhdChzZXJ2ZXJFdmVudHMuaGlnaGxpZ2h0cyk7XG4gICAgfSBlbHNlIGlmIChsb2NhbEV2ZW50cykge1xuICAgICAgICAvLyBUaGlzIGlzIGEgcGFnaW5hdGlvbiBjYWxsIGZldGNoaW5nIG1vcmUgZXZlbnRzIGZyb20gdGhlIGxvY2FsIGluZGV4LFxuICAgICAgICAvLyBtZWFuaW5nIHRoYXQgb3VyIG9sZGVzdCBldmVudCB3YXMgb24gdGhlIHNlcnZlci5cbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBzb3VyY2Ugb2YgdGhlIG9sZGVzdCBldmVudCBpZiBvdXIgbG9jYWwgZXZlbnQgaXMgb2xkZXJcbiAgICAgICAgLy8gdGhhbiB0aGUgY2FjaGVkIG9uZS5cbiAgICAgICAgaWYgKGNvbXBhcmVPbGRlc3RFdmVudHMobG9jYWxFdmVudHMsIGNhY2hlZEV2ZW50cykgPCAwKSB7XG4gICAgICAgICAgICBvbGRlc3RFdmVudEZyb20gPSBcImxvY2FsXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29tYmluZUV2ZW50U291cmNlcyhwcmV2aW91c1NlYXJjaFJlc3VsdCwgcmVzcG9uc2UsIGxvY2FsRXZlbnRzLnJlc3VsdHMsIGNhY2hlZEV2ZW50cyk7XG4gICAgfSBlbHNlIGlmIChzZXJ2ZXJFdmVudHMgJiYgc2VydmVyRXZlbnRzLnJlc3VsdHMpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIHBhZ2luYXRpb24gY2FsbCBmZXRjaGluZyBtb3JlIGV2ZW50cyBmcm9tIHRoZSBzZXJ2ZXIsXG4gICAgICAgIC8vIG1lYW5pbmcgdGhhdCBvdXIgb2xkZXN0IGV2ZW50IHdhcyBpbiB0aGUgbG9jYWwgaW5kZXguXG4gICAgICAgIC8vIENoYW5nZSB0aGUgc291cmNlIG9mIHRoZSBvbGRlc3QgZXZlbnQgaWYgb3VyIHNlcnZlciBldmVudCBpcyBvbGRlclxuICAgICAgICAvLyB0aGFuIHRoZSBjYWNoZWQgb25lLlxuICAgICAgICBpZiAoY29tcGFyZU9sZGVzdEV2ZW50cyhzZXJ2ZXJFdmVudHMsIGNhY2hlZEV2ZW50cykgPCAwKSB7XG4gICAgICAgICAgICBvbGRlc3RFdmVudEZyb20gPSBcInNlcnZlclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbWJpbmVFdmVudFNvdXJjZXMocHJldmlvdXNTZWFyY2hSZXN1bHQsIHJlc3BvbnNlLCBzZXJ2ZXJFdmVudHMucmVzdWx0cywgY2FjaGVkRXZlbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIGlzIGEgcGFnaW5hdGlvbiBjYWxsIHdoZXJlIHdlIGV4aGF1c3RlZCBib3RoIG9mIG91ciBldmVudFxuICAgICAgICAvLyBzb3VyY2VzLCBsZXQncyBwdXNoIHRoZSByZW1haW5pbmcgY2FjaGVkIGV2ZW50cy5cbiAgICAgICAgcmVzcG9uc2UucmVzdWx0cyA9IGNhY2hlZEV2ZW50cztcbiAgICAgICAgcHJldmlvdXNTZWFyY2hSZXN1bHQuY2FjaGVkRXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgcHJldmlvdXNTZWFyY2hSZXN1bHQub2xkZXN0RXZlbnRGcm9tID0gb2xkZXN0RXZlbnRGcm9tO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIENvbWJpbmUgdGhlIGxvY2FsIGFuZCBzZXJ2ZXIgc2VhcmNoIHJlc3BvbnNlc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcmV2aW91c1NlYXJjaFJlc3VsdCBBIHNlYXJjaCByZXN1bHQgZnJvbSBhIHByZXZpb3VzIHNlYXJjaFxuICogY2FsbC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBsb2NhbEV2ZW50cyBBbiB1bnByb2Nlc3NlZCBzZWFyY2ggcmVzdWx0IGZyb20gdGhlIGV2ZW50XG4gKiBpbmRleC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXJ2ZXJFdmVudHMgQW4gdW5wcm9jZXNzZWQgc2VhcmNoIHJlc3VsdCBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogQHJldHVybiB7b2JqZWN0fSBBIHJlc3BvbnNlIG9iamVjdCB0aGF0IGNvbWJpbmVzIHRoZSBldmVudHMgZnJvbSB0aGVcbiAqIGRpZmZlcmVudCBldmVudCBzb3VyY2VzLlxuICovXG5mdW5jdGlvbiBjb21iaW5lUmVzcG9uc2VzKHByZXZpb3VzU2VhcmNoUmVzdWx0LCBsb2NhbEV2ZW50cyA9IHVuZGVmaW5lZCwgc2VydmVyRXZlbnRzID0gdW5kZWZpbmVkKSB7XG4gICAgLy8gQ29tYmluZSBvdXIgZXZlbnRzIGZpcnN0LlxuICAgIGNvbnN0IHJlc3BvbnNlID0gY29tYmluZUV2ZW50cyhwcmV2aW91c1NlYXJjaFJlc3VsdCwgbG9jYWxFdmVudHMsIHNlcnZlckV2ZW50cyk7XG5cbiAgICAvLyBPdXIgZmlyc3Qgc2VhcmNoIHdpbGwgY29udGFpbiBjb3VudHMgZnJvbSBib3RoIHNvdXJjZXMsIHN1YnNlcXVlbnRcbiAgICAvLyBwYWdpbmF0aW9uIHJlcXVlc3RzIHdpbGwgZmV0Y2ggcmVzcG9uc2VzIG9ubHkgZnJvbSBvbmUgb2YgdGhlIHNvdXJjZXMsIHNvXG4gICAgLy8gcmV1c2UgdGhlIGZpcnN0IGNvdW50IHdoZW4gd2UncmUgcGFnaW5hdGluZy5cbiAgICBpZiAocHJldmlvdXNTZWFyY2hSZXN1bHQuY291bnQpIHtcbiAgICAgICAgcmVzcG9uc2UuY291bnQgPSBwcmV2aW91c1NlYXJjaFJlc3VsdC5jb3VudDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZS5jb3VudCA9IGxvY2FsRXZlbnRzLmNvdW50ICsgc2VydmVyRXZlbnRzLmNvdW50O1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBvdXIgbmV4dCBiYXRjaCB0b2tlbnMgZm9yIHRoZSBnaXZlbiBzZWFyY2ggc291cmNlcy5cbiAgICBpZiAobG9jYWxFdmVudHMpIHtcbiAgICAgICAgcHJldmlvdXNTZWFyY2hSZXN1bHQuc2VzaGF0UXVlcnkubmV4dF9iYXRjaCA9IGxvY2FsRXZlbnRzLm5leHRfYmF0Y2g7XG4gICAgfVxuICAgIGlmIChzZXJ2ZXJFdmVudHMpIHtcbiAgICAgICAgcHJldmlvdXNTZWFyY2hSZXN1bHQuc2VydmVyU2lkZU5leHRCYXRjaCA9IHNlcnZlckV2ZW50cy5uZXh0X2JhdGNoO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgcmVzcG9uc2UgbmV4dCBiYXRjaCB0b2tlbiB0byBvbmUgb2YgdGhlIHRva2VucyBmcm9tIHRoZSBzb3VyY2VzLFxuICAgIC8vIHRoaXMgbWFrZXMgc3VyZSB0aGF0IGlmIHdlIGV4aGF1c3Qgb25lIG9mIHRoZSBzb3VyY2VzIHdlIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3RoZXIgb25lLlxuICAgIGlmIChwcmV2aW91c1NlYXJjaFJlc3VsdC5zZXNoYXRRdWVyeS5uZXh0X2JhdGNoKSB7XG4gICAgICAgIHJlc3BvbnNlLm5leHRfYmF0Y2ggPSBwcmV2aW91c1NlYXJjaFJlc3VsdC5zZXNoYXRRdWVyeS5uZXh0X2JhdGNoO1xuICAgIH0gZWxzZSBpZiAocHJldmlvdXNTZWFyY2hSZXN1bHQuc2VydmVyU2lkZU5leHRCYXRjaCkge1xuICAgICAgICByZXNwb25zZS5uZXh0X2JhdGNoID0gcHJldmlvdXNTZWFyY2hSZXN1bHQuc2VydmVyU2lkZU5leHRCYXRjaDtcbiAgICB9XG5cbiAgICAvLyBXZSBjb2xsZWN0ZWQgYWxsIHNlYXJjaCByZXN1bHRzIGZyb20gdGhlIHNlcnZlciBhcyB3ZWxsIGFzIGZyb20gU2VzaGF0LFxuICAgIC8vIHdlIHN0aWxsIGhhdmUgc29tZSBldmVudHMgY2FjaGVkIHRoYXQgd2UnbGwgd2FudCB0byBkaXNwbGF5IG9uIHRoZSBuZXh0XG4gICAgLy8gcGFnaW5hdGlvbiByZXF1ZXN0LlxuICAgIC8vXG4gICAgLy8gUHJvdmlkZSBhIGZha2UgbmV4dCBiYXRjaCB0b2tlbiBmb3IgdGhhdCBjYXNlLlxuICAgIGlmICghcmVzcG9uc2UubmV4dF9iYXRjaCAmJiBwcmV2aW91c1NlYXJjaFJlc3VsdC5jYWNoZWRFdmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXNwb25zZS5uZXh0X2JhdGNoID0gXCJjYWNoZWRcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbmZ1bmN0aW9uIHJlc3RvcmVFbmNyeXB0aW9uSW5mbyhzZWFyY2hSZXN1bHRTbGljZSA9IFtdKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWFyY2hSZXN1bHRTbGljZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0aW1lbGluZSA9IHNlYXJjaFJlc3VsdFNsaWNlW2ldLmNvbnRleHQuZ2V0VGltZWxpbmUoKTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRpbWVsaW5lLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCBldiA9IHRpbWVsaW5lW2pdO1xuXG4gICAgICAgICAgICBpZiAoZXYuZXZlbnQuY3VydmUyNTUxOUtleSkge1xuICAgICAgICAgICAgICAgIGV2Lm1ha2VFbmNyeXB0ZWQoXG4gICAgICAgICAgICAgICAgICAgIFwibS5yb29tLmVuY3J5cHRlZFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGFsZ29yaXRobTogZXYuZXZlbnQuYWxnb3JpdGhtIH0sXG4gICAgICAgICAgICAgICAgICAgIGV2LmV2ZW50LmN1cnZlMjU1MTlLZXksXG4gICAgICAgICAgICAgICAgICAgIGV2LmV2ZW50LmVkMjU1MTlLZXksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBldi5fZm9yd2FyZGluZ0N1cnZlMjU1MTlLZXlDaGFpbiA9IGV2LmV2ZW50LmZvcndhcmRpbmdDdXJ2ZTI1NTE5S2V5Q2hhaW47XG5cbiAgICAgICAgICAgICAgICBkZWxldGUgZXYuZXZlbnQuY3VydmUyNTUxOUtleTtcbiAgICAgICAgICAgICAgICBkZWxldGUgZXYuZXZlbnQuZWQyNTUxOUtleTtcbiAgICAgICAgICAgICAgICBkZWxldGUgZXYuZXZlbnQuYWxnb3JpdGhtO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBldi5ldmVudC5mb3J3YXJkaW5nQ3VydmUyNTUxOUtleUNoYWluO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb21iaW5lZFBhZ2luYXRpb24oc2VhcmNoUmVzdWx0KSB7XG4gICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgY29uc3Qgc2VhcmNoQXJncyA9IHNlYXJjaFJlc3VsdC5zZXNoYXRRdWVyeTtcbiAgICBjb25zdCBvbGRlc3RFdmVudEZyb20gPSBzZWFyY2hSZXN1bHQub2xkZXN0RXZlbnRGcm9tO1xuXG4gICAgbGV0IGxvY2FsUmVzdWx0O1xuICAgIGxldCBzZXJ2ZXJTaWRlUmVzdWx0O1xuXG4gICAgLy8gRmV0Y2ggZXZlbnRzIGZyb20gdGhlIGxvY2FsIGluZGV4IGlmIHdlIGhhdmUgYSB0b2tlbiBmb3IgaXRhbmQgaWYgaXQnc1xuICAgIC8vIHRoZSBsb2NhbCBpbmRleGVzIHR1cm4gb3IgdGhlIHNlcnZlciBoYXMgZXhoYXVzdGVkIGl0cyByZXN1bHRzLlxuICAgIGlmIChzZWFyY2hBcmdzLm5leHRfYmF0Y2ggJiYgKCFzZWFyY2hSZXN1bHQuc2VydmVyU2lkZU5leHRCYXRjaCB8fCBvbGRlc3RFdmVudEZyb20gPT09IFwic2VydmVyXCIpKSB7XG4gICAgICAgIGxvY2FsUmVzdWx0ID0gYXdhaXQgZXZlbnRJbmRleC5zZWFyY2goc2VhcmNoQXJncyk7XG4gICAgfVxuXG4gICAgLy8gRmV0Y2ggZXZlbnRzIGZyb20gdGhlIHNlcnZlciBpZiB3ZSBoYXZlIGEgdG9rZW4gZm9yIGl0IGFuZCBpZiBpdCdzIHRoZVxuICAgIC8vIGxvY2FsIGluZGV4ZXMgdHVybiBvciB0aGUgbG9jYWwgaW5kZXggaGFzIGV4aGF1c3RlZCBpdHMgcmVzdWx0cy5cbiAgICBpZiAoc2VhcmNoUmVzdWx0LnNlcnZlclNpZGVOZXh0QmF0Y2ggJiYgKG9sZGVzdEV2ZW50RnJvbSA9PT0gXCJsb2NhbFwiIHx8ICFzZWFyY2hBcmdzLm5leHRfYmF0Y2gpKSB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSB7Ym9keTogc2VhcmNoUmVzdWx0Ll9xdWVyeSwgbmV4dF9iYXRjaDogc2VhcmNoUmVzdWx0LnNlcnZlclNpZGVOZXh0QmF0Y2h9O1xuICAgICAgICBzZXJ2ZXJTaWRlUmVzdWx0ID0gYXdhaXQgY2xpZW50LnNlYXJjaChib2R5KTtcbiAgICB9XG5cbiAgICBsZXQgc2VydmVyRXZlbnRzO1xuXG4gICAgaWYgKHNlcnZlclNpZGVSZXN1bHQpIHtcbiAgICAgICAgc2VydmVyRXZlbnRzID0gc2VydmVyU2lkZVJlc3VsdC5zZWFyY2hfY2F0ZWdvcmllcy5yb29tX2V2ZW50cztcbiAgICB9XG5cbiAgICAvLyBDb21iaW5lIG91ciBldmVudHMuXG4gICAgY29uc3QgY29tYmluZWRSZXN1bHQgPSBjb21iaW5lUmVzcG9uc2VzKHNlYXJjaFJlc3VsdCwgbG9jYWxSZXN1bHQsIHNlcnZlckV2ZW50cyk7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IHtcbiAgICAgICAgc2VhcmNoX2NhdGVnb3JpZXM6IHtcbiAgICAgICAgICAgIHJvb21fZXZlbnRzOiBjb21iaW5lZFJlc3VsdCxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgY29uc3Qgb2xkUmVzdWx0Q291bnQgPSBzZWFyY2hSZXN1bHQucmVzdWx0cyA/IHNlYXJjaFJlc3VsdC5yZXN1bHRzLmxlbmd0aCA6IDA7XG5cbiAgICAvLyBMZXQgdGhlIGNsaWVudCBwcm9jZXNzIHRoZSBjb21iaW5lZCByZXN1bHQuXG4gICAgY29uc3QgcmVzdWx0ID0gY2xpZW50Ll9wcm9jZXNzUm9vbUV2ZW50c1NlYXJjaChzZWFyY2hSZXN1bHQsIHJlc3BvbnNlKTtcblxuICAgIC8vIFJlc3RvcmUgb3VyIGVuY3J5cHRpb24gaW5mbyBzbyB3ZSBjYW4gcHJvcGVybHkgcmUtdmVyaWZ5IHRoZSBldmVudHMuXG4gICAgY29uc3QgbmV3UmVzdWx0Q291bnQgPSByZXN1bHQucmVzdWx0cy5sZW5ndGggLSBvbGRSZXN1bHRDb3VudDtcbiAgICBjb25zdCBuZXdTbGljZSA9IHJlc3VsdC5yZXN1bHRzLnNsaWNlKE1hdGgubWF4KHJlc3VsdC5yZXN1bHRzLmxlbmd0aCAtIG5ld1Jlc3VsdENvdW50LCAwKSk7XG4gICAgcmVzdG9yZUVuY3J5cHRpb25JbmZvKG5ld1NsaWNlKTtcblxuICAgIHNlYXJjaFJlc3VsdC5wZW5kaW5nUmVxdWVzdCA9IG51bGw7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBldmVudEluZGV4U2VhcmNoKHRlcm0sIHJvb21JZCA9IHVuZGVmaW5lZCkge1xuICAgIGxldCBzZWFyY2hQcm9taXNlO1xuXG4gICAgaWYgKHJvb21JZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNSb29tRW5jcnlwdGVkKHJvb21JZCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBzZWFyY2ggaXMgZm9yIGEgc2luZ2xlIGVuY3J5cHRlZCByb29tLCB1c2Ugb3VyIGxvY2FsXG4gICAgICAgICAgICAvLyBzZWFyY2ggbWV0aG9kLlxuICAgICAgICAgICAgc2VhcmNoUHJvbWlzZSA9IGxvY2FsU2VhcmNoUHJvY2Vzcyh0ZXJtLCByb29tSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIHNlYXJjaCBpcyBmb3IgYSBzaW5nbGUgbm9uLWVuY3J5cHRlZCByb29tLCB1c2UgdGhlXG4gICAgICAgICAgICAvLyBzZXJ2ZXItc2lkZSBzZWFyY2guXG4gICAgICAgICAgICBzZWFyY2hQcm9taXNlID0gc2VydmVyU2lkZVNlYXJjaFByb2Nlc3ModGVybSwgcm9vbUlkKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNlYXJjaCBhY3Jvc3MgYWxsIHJvb21zLCBjb21iaW5lIGEgc2VydmVyIHNpZGUgc2VhcmNoIGFuZCBhXG4gICAgICAgIC8vIGxvY2FsIHNlYXJjaC5cbiAgICAgICAgc2VhcmNoUHJvbWlzZSA9IGNvbWJpbmVkU2VhcmNoKHRlcm0pO1xuICAgIH1cblxuICAgIHJldHVybiBzZWFyY2hQcm9taXNlO1xufVxuXG5mdW5jdGlvbiBldmVudEluZGV4U2VhcmNoUGFnaW5hdGlvbihzZWFyY2hSZXN1bHQpIHtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICBjb25zdCBzZXNoYXRRdWVyeSA9IHNlYXJjaFJlc3VsdC5zZXNoYXRRdWVyeTtcbiAgICBjb25zdCBzZXJ2ZXJRdWVyeSA9IHNlYXJjaFJlc3VsdC5fcXVlcnk7XG5cbiAgICBpZiAoIXNlc2hhdFF1ZXJ5KSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBzZWFyY2ggaW4gYSBub24tZW5jcnlwdGVkIHJvb20uIERvIHRoZSBub3JtYWwgc2VydmVyLXNpZGVcbiAgICAgICAgLy8gcGFnaW5hdGlvbi5cbiAgICAgICAgcmV0dXJuIGNsaWVudC5iYWNrUGFnaW5hdGVSb29tRXZlbnRzU2VhcmNoKHNlYXJjaFJlc3VsdCk7XG4gICAgfSBlbHNlIGlmICghc2VydmVyUXVlcnkpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIHNlYXJjaCBpbiBhIGVuY3J5cHRlZCByb29tLiBEbyBhIGxvY2FsIHBhZ2luYXRpb24uXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBsb2NhbFBhZ2luYXRpb24oc2VhcmNoUmVzdWx0KTtcbiAgICAgICAgc2VhcmNoUmVzdWx0LnBlbmRpbmdSZXF1ZXN0ID0gcHJvbWlzZTtcblxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBoYXZlIGJvdGggcXVlcmllcyBhcm91bmQsIHRoaXMgaXMgYSBzZWFyY2ggYWNyb3NzIGFsbCByb29tcyBzbyBhXG4gICAgICAgIC8vIGNvbWJpbmVkIHBhZ2luYXRpb24gbmVlZHMgdG8gYmUgZG9uZS5cbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGNvbWJpbmVkUGFnaW5hdGlvbihzZWFyY2hSZXN1bHQpO1xuICAgICAgICBzZWFyY2hSZXN1bHQucGVuZGluZ1JlcXVlc3QgPSBwcm9taXNlO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaFBhZ2luYXRpb24oc2VhcmNoUmVzdWx0KSB7XG4gICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgaWYgKHNlYXJjaFJlc3VsdC5wZW5kaW5nUmVxdWVzdCkgcmV0dXJuIHNlYXJjaFJlc3VsdC5wZW5kaW5nUmVxdWVzdDtcblxuICAgIGlmIChldmVudEluZGV4ID09PSBudWxsKSByZXR1cm4gY2xpZW50LmJhY2tQYWdpbmF0ZVJvb21FdmVudHNTZWFyY2goc2VhcmNoUmVzdWx0KTtcbiAgICBlbHNlIHJldHVybiBldmVudEluZGV4U2VhcmNoUGFnaW5hdGlvbihzZWFyY2hSZXN1bHQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBldmVudFNlYXJjaCh0ZXJtLCByb29tSWQgPSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBldmVudEluZGV4ID0gRXZlbnRJbmRleFBlZy5nZXQoKTtcblxuICAgIGlmIChldmVudEluZGV4ID09PSBudWxsKSByZXR1cm4gc2VydmVyU2lkZVNlYXJjaFByb2Nlc3ModGVybSwgcm9vbUlkKTtcbiAgICBlbHNlIHJldHVybiBldmVudEluZGV4U2VhcmNoKHRlcm0sIHJvb21JZCk7XG59XG4iXX0=
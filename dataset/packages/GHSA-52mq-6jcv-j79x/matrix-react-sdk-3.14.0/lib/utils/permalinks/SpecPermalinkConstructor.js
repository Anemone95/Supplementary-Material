"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.baseUrl = exports.host = void 0;

var _PermalinkConstructor = _interopRequireWildcard(require("./PermalinkConstructor"));

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
const host = "matrix.to";
exports.host = host;
const baseUrl = `https://${host}`;
/**
 * Generates matrix.to permalinks
 */

exports.baseUrl = baseUrl;

class SpecPermalinkConstructor extends _PermalinkConstructor.default {
  constructor() {
    super();
  }

  forEvent(roomId
  /*: string*/
  , eventId
  /*: string*/
  , serverCandidates
  /*: string[]*/
  )
  /*: string*/
  {
    return `${baseUrl}/#/${roomId}/${eventId}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forRoom(roomIdOrAlias
  /*: string*/
  , serverCandidates
  /*: string[]*/
  )
  /*: string*/
  {
    return `${baseUrl}/#/${roomIdOrAlias}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forUser(userId
  /*: string*/
  )
  /*: string*/
  {
    return `${baseUrl}/#/${userId}`;
  }

  forGroup(groupId
  /*: string*/
  )
  /*: string*/
  {
    return `${baseUrl}/#/${groupId}`;
  }

  forEntity(entityId
  /*: string*/
  )
  /*: string*/
  {
    return `${baseUrl}/#/${entityId}`;
  }

  isPermalinkHost(testHost
  /*: string*/
  )
  /*: boolean*/
  {
    return testHost === host;
  }

  encodeServerCandidates(candidates
  /*: string[]*/
  ) {
    if (!candidates || candidates.length === 0) return '';
    return `?via=${candidates.map(c => encodeURIComponent(c)).join("&via=")}`;
  } // Heavily inspired by/borrowed from the matrix-bot-sdk (with permission):
  // https://github.com/turt2live/matrix-js-bot-sdk/blob/7c4665c9a25c2c8e0fe4e509f2616505b5b66a1c/src/Permalinks.ts#L33-L61


  parsePermalink(fullUrl
  /*: string*/
  )
  /*: PermalinkParts*/
  {
    if (!fullUrl || !fullUrl.startsWith(baseUrl)) {
      throw new Error("Does not appear to be a permalink");
    }

    const parts = fullUrl.substring(`${baseUrl}/#/`.length).split("/");
    const entity = parts[0];

    if (entity[0] === '@') {
      // Probably a user, no further parsing needed.
      return _PermalinkConstructor.PermalinkParts.forUser(entity);
    } else if (entity[0] === '+') {
      // Probably a group, no further parsing needed.
      return _PermalinkConstructor.PermalinkParts.forGroup(entity);
    } else if (entity[0] === '#' || entity[0] === '!') {
      if (parts.length === 1) {
        // room without event permalink
        const [roomId, query = ""] = entity.split("?");
        const via = query.split(/&?via=/g).filter(p => !!p);
        return _PermalinkConstructor.PermalinkParts.forRoom(roomId, via);
      } // rejoin the rest because v3 events can have slashes (annoyingly)


      const eventIdAndQuery = parts.length > 1 ? parts.slice(1).join('/') : "";
      const [eventId, query = ""] = eventIdAndQuery.split("?");
      const via = query.split(/&?via=/g).filter(p => !!p);
      return _PermalinkConstructor.PermalinkParts.forEvent(entity, eventId, via);
    } else {
      throw new Error("Unknown entity type in permalink");
    }
  }

}

exports.default = SpecPermalinkConstructor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9wZXJtYWxpbmtzL1NwZWNQZXJtYWxpbmtDb25zdHJ1Y3Rvci5qcyJdLCJuYW1lcyI6WyJob3N0IiwiYmFzZVVybCIsIlNwZWNQZXJtYWxpbmtDb25zdHJ1Y3RvciIsIlBlcm1hbGlua0NvbnN0cnVjdG9yIiwiY29uc3RydWN0b3IiLCJmb3JFdmVudCIsInJvb21JZCIsImV2ZW50SWQiLCJzZXJ2ZXJDYW5kaWRhdGVzIiwiZW5jb2RlU2VydmVyQ2FuZGlkYXRlcyIsImZvclJvb20iLCJyb29tSWRPckFsaWFzIiwiZm9yVXNlciIsInVzZXJJZCIsImZvckdyb3VwIiwiZ3JvdXBJZCIsImZvckVudGl0eSIsImVudGl0eUlkIiwiaXNQZXJtYWxpbmtIb3N0IiwidGVzdEhvc3QiLCJjYW5kaWRhdGVzIiwibGVuZ3RoIiwibWFwIiwiYyIsImVuY29kZVVSSUNvbXBvbmVudCIsImpvaW4iLCJwYXJzZVBlcm1hbGluayIsImZ1bGxVcmwiLCJzdGFydHNXaXRoIiwiRXJyb3IiLCJwYXJ0cyIsInN1YnN0cmluZyIsInNwbGl0IiwiZW50aXR5IiwiUGVybWFsaW5rUGFydHMiLCJxdWVyeSIsInZpYSIsImZpbHRlciIsInAiLCJldmVudElkQW5kUXVlcnkiLCJzbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJTyxNQUFNQSxJQUFJLEdBQUcsV0FBYjs7QUFDQSxNQUFNQyxPQUFPLEdBQUksV0FBVUQsSUFBSyxFQUFoQztBQUVQO0FBQ0E7QUFDQTs7OztBQUNlLE1BQU1FLHdCQUFOLFNBQXVDQyw2QkFBdkMsQ0FBNEQ7QUFDdkVDLEVBQUFBLFdBQVcsR0FBRztBQUNWO0FBQ0g7O0FBRURDLEVBQUFBLFFBQVEsQ0FBQ0M7QUFBRDtBQUFBLElBQWlCQztBQUFqQjtBQUFBLElBQWtDQztB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S0FBSyxDQUFDVCxNQUFOLEdBQWUsQ0FBZixHQUFtQlMsS0FBSyxDQUFDVSxLQUFOLENBQVksQ0FBWixFQUFlZixJQUFmLENBQW9CLEdBQXBCLENBQW5CLEdBQThDLEVBQXRFO0FBQ0EsWUFBTSxDQUFDbEIsT0FBRCxFQUFVNEIsS0FBSyxHQUFDLEVBQWhCLElBQXNCSSxlQUFlLENBQUNQLEtBQWhCLENBQXNCLEdBQXRCLENBQTVCO0FBQ0EsWUFBTUksR0FBRyxHQUFHRCxLQUFLLENBQUNILEtBQU4sQ0FBWSxTQUFaLEVBQXVCSyxNQUF2QixDQUE4QkMsQ0FBQyxJQUFJLENBQUMsQ0FBQ0EsQ0FBckMsQ0FBWjtBQUVBLGFBQU9KLHFDQUFlN0IsUUFBZixDQUF3QjRCLE1BQXhCLEVBQWdDMUIsT0FBaEMsRUFBeUM2QixHQUF6QyxDQUFQO0FBQ0gsS0FiTSxNQWFBO0FBQ0gsWUFBTSxJQUFJUCxLQUFKLENBQVUsa0NBQVYsQ0FBTjtBQUNIO0FBQ0o7O0FBbEVzRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBQZXJtYWxpbmtDb25zdHJ1Y3Rvciwge1Blcm1hbGlua1BhcnRzfSBmcm9tIFwiLi9QZXJtYWxpbmtDb25zdHJ1Y3RvclwiO1xuXG5leHBvcnQgY29uc3QgaG9zdCA9IFwibWF0cml4LnRvXCI7XG5leHBvcnQgY29uc3QgYmFzZVVybCA9IGBodHRwczovLyR7aG9zdH1gO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBtYXRyaXgudG8gcGVybWFsaW5rc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGVjUGVybWFsaW5rQ29uc3RydWN0b3IgZXh0ZW5kcyBQZXJtYWxpbmtDb25zdHJ1Y3RvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgZm9yRXZlbnQocm9vbUlkOiBzdHJpbmcsIGV2ZW50SWQ6IHN0cmluZywgc2VydmVyQ2FuZGlkYXRlczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7YmFzZVVybH0vIy8ke3Jvb21JZH0vJHtldmVudElkfSR7dGhpcy5lbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKHNlcnZlckNhbmRpZGF0ZXMpfWA7XG4gICAgfVxuXG4gICAgZm9yUm9vbShyb29tSWRPckFsaWFzOiBzdHJpbmcsIHNlcnZlckNhbmRpZGF0ZXM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmx9LyMvJHtyb29tSWRPckFsaWFzfSR7dGhpcy5lbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKHNlcnZlckNhbmRpZGF0ZXMpfWA7XG4gICAgfVxuXG4gICAgZm9yVXNlcih1c2VySWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHtiYXNlVXJsfS8jLyR7dXNlcklkfWA7XG4gICAgfVxuXG4gICAgZm9yR3JvdXAoZ3JvdXBJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmx9LyMvJHtncm91cElkfWA7XG4gICAgfVxuXG4gICAgZm9yRW50aXR5KGVudGl0eUlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7YmFzZVVybH0vIy8ke2VudGl0eUlkfWA7XG4gICAgfVxuXG4gICAgaXNQZXJtYWxpbmtIb3N0KHRlc3RIb3N0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRlc3RIb3N0ID09PSBob3N0O1xuICAgIH1cblxuICAgIGVuY29kZVNlcnZlckNhbmRpZGF0ZXMoY2FuZGlkYXRlczogc3RyaW5nW10pIHtcbiAgICAgICAgaWYgKCFjYW5kaWRhdGVzIHx8IGNhbmRpZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gJyc7XG4gICAgICAgIHJldHVybiBgP3ZpYT0ke2NhbmRpZGF0ZXMubWFwKGMgPT4gZW5jb2RlVVJJQ29tcG9uZW50KGMpKS5qb2luKFwiJnZpYT1cIil9YDtcbiAgICB9XG5cbiAgICAvLyBIZWF2aWx5IGluc3BpcmVkIGJ5L2JvcnJvd2VkIGZyb20gdGhlIG1hdHJpeC1ib3Qtc2RrICh3aXRoIHBlcm1pc3Npb24pOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90dXJ0MmxpdmUvbWF0cml4LWpzLWJvdC1zZGsvYmxvYi83YzQ2NjVjOWEyNWMyYzhlMGZlNGU1MDlmMjYxNjUwNWI1YjY2YTFjL3NyYy9QZXJtYWxpbmtzLnRzI0wzMy1MNjFcbiAgICBwYXJzZVBlcm1hbGluayhmdWxsVXJsOiBzdHJpbmcpOiBQZXJtYWxpbmtQYXJ0cyB7XG4gICAgICAgIGlmICghZnVsbFVybCB8fCAhZnVsbFVybC5zdGFydHNXaXRoKGJhc2VVcmwpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBwZXJtYWxpbmtcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0cyA9IGZ1bGxVcmwuc3Vic3RyaW5nKGAke2Jhc2VVcmx9LyMvYC5sZW5ndGgpLnNwbGl0KFwiL1wiKTtcblxuICAgICAgICBjb25zdCBlbnRpdHkgPSBwYXJ0c1swXTtcbiAgICAgICAgaWYgKGVudGl0eVswXSA9PT0gJ0AnKSB7XG4gICAgICAgICAgICAvLyBQcm9iYWJseSBhIHVzZXIsIG5vIGZ1cnRoZXIgcGFyc2luZyBuZWVkZWQuXG4gICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yVXNlcihlbnRpdHkpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudGl0eVswXSA9PT0gJysnKSB7XG4gICAgICAgICAgICAvLyBQcm9iYWJseSBhIGdyb3VwLCBubyBmdXJ0aGVyIHBhcnNpbmcgbmVlZGVkLlxuICAgICAgICAgICAgcmV0dXJuIFBlcm1hbGlua1BhcnRzLmZvckdyb3VwKGVudGl0eSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50aXR5WzBdID09PSAnIycgfHwgZW50aXR5WzBdID09PSAnIScpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHsgLy8gcm9vbSB3aXRob3V0IGV2ZW50IHBlcm1hbGlua1xuICAgICAgICAgICAgICAgIGNvbnN0IFtyb29tSWQsIHF1ZXJ5PVwiXCJdID0gZW50aXR5LnNwbGl0KFwiP1wiKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2aWEgPSBxdWVyeS5zcGxpdCgvJj92aWE9L2cpLmZpbHRlcihwID0+ICEhcCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBlcm1hbGlua1BhcnRzLmZvclJvb20ocm9vbUlkLCB2aWEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyByZWpvaW4gdGhlIHJlc3QgYmVjYXVzZSB2MyBldmVudHMgY2FuIGhhdmUgc2xhc2hlcyAoYW5ub3lpbmdseSlcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SWRBbmRRdWVyeSA9IHBhcnRzLmxlbmd0aCA+IDEgPyBwYXJ0cy5zbGljZSgxKS5qb2luKCcvJykgOiBcIlwiO1xuICAgICAgICAgICAgY29uc3QgW2V2ZW50SWQsIHF1ZXJ5PVwiXCJdID0gZXZlbnRJZEFuZFF1ZXJ5LnNwbGl0KFwiP1wiKTtcbiAgICAgICAgICAgIGNvbnN0IHZpYSA9IHF1ZXJ5LnNwbGl0KC8mP3ZpYT0vZykuZmlsdGVyKHAgPT4gISFwKTtcblxuICAgICAgICAgICAgcmV0dXJuIFBlcm1hbGlua1BhcnRzLmZvckV2ZW50KGVudGl0eSwgZXZlbnRJZCwgdmlhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gZW50aXR5IHR5cGUgaW4gcGVybWFsaW5rXCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
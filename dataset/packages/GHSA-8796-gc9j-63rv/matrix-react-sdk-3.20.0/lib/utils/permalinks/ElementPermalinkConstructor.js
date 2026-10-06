"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _PermalinkConstructor = _interopRequireWildcard(require("./PermalinkConstructor"));

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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
 * Generates permalinks that self-reference the running webapp
 */
class ElementPermalinkConstructor extends _PermalinkConstructor.default {
  constructor(elementUrl
  /*: string*/
  ) {
    super();
    (0, _defineProperty2.default)(this, "elementUrl", void 0);
    this.elementUrl = elementUrl;

    if (!this.elementUrl.startsWith("http:") && !this.elementUrl.startsWith("https:")) {
      throw new Error("Element prefix URL does not appear to be an HTTP(S) URL");
    }
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
    return `${this.elementUrl}/#/room/${roomId}/${eventId}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forRoom(roomIdOrAlias
  /*: string*/
  , serverCandidates
  /*: string[]*/
  )
  /*: string*/
  {
    return `${this.elementUrl}/#/room/${roomIdOrAlias}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forUser(userId
  /*: string*/
  )
  /*: string*/
  {
    return `${this.elementUrl}/#/user/${userId}`;
  }

  forGroup(groupId
  /*: string*/
  )
  /*: string*/
  {
    return `${this.elementUrl}/#/group/${groupId}`;
  }

  forEntity(entityId
  /*: string*/
  )
  /*: string*/
  {
    if (entityId[0] === '!' || entityId[0] === '#') {
      return this.forRoom(entityId);
    } else if (entityId[0] === '@') {
      return this.forUser(entityId);
    } else if (entityId[0] === '+') {
      return this.forGroup(entityId);
    } else throw new Error("Unrecognized entity");
  }

  isPermalinkHost(testHost
  /*: string*/
  )
  /*: boolean*/
  {
    const parsedUrl = new URL(this.elementUrl);
    return testHost === (parsedUrl.host || parsedUrl.hostname); // one of the hosts should match
  }

  encodeServerCandidates(candidates
  /*: string[]*/
  ) {
    if (!candidates || candidates.length === 0) return '';
    return `?via=${candidates.map(c => encodeURIComponent(c)).join("&via=")}`;
  } // Heavily inspired by/borrowed from the matrix-bot-sdk (with permission):
  // https://github.com/turt2live/matrix-js-bot-sdk/blob/7c4665c9a25c2c8e0fe4e509f2616505b5b66a1c/src/Permalinks.ts#L33-L61
  // Adapted for Element's URL format


  parsePermalink(fullUrl
  /*: string*/
  )
  /*: PermalinkParts*/
  {
    if (!fullUrl || !fullUrl.startsWith(this.elementUrl)) {
      throw new Error("Does not appear to be a permalink");
    }

    const parts = fullUrl.substring(`${this.elementUrl}/#/`.length);
    return ElementPermalinkConstructor.parseAppRoute(parts);
  }
  /**
   * Parses an app route (`(user|room|group)/identifer`) to a Matrix entity
   * (room, user, group).
   * @param {string} route The app route
   * @returns {PermalinkParts}
   */


  static parseAppRoute(route
  /*: string*/
  )
  /*: PermalinkParts*/
  {
    const parts = route.split("/");

    if (parts.length < 2) {
      // we're expecting an entity and an ID of some kind at least
      throw new Error("URL is missing parts");
    } // Split optional query out of last part


    const [lastPartMaybeWithQuery] = parts.splice(-1, 1);
    const [lastPart, query = ""] = lastPartMaybeWithQuery.split("?");
    parts.push(lastPart);
    const entityType = parts[0];
    const entity = parts[1];

    if (entityType === 'user') {
      // Probably a user, no further parsing needed.
      return _PermalinkConstructor.PermalinkParts.forUser(entity);
    } else if (entityType === 'group') {
      // Probably a group, no further parsing needed.
      return _PermalinkConstructor.PermalinkParts.forGroup(entity);
    } else if (entityType === 'room') {
      // Rejoin the rest because v3 events can have slashes (annoyingly)
      const eventId = parts.length > 2 ? parts.slice(2).join('/') : "";
      const via = query.split(/&?via=/).filter(p => !!p);
      return _PermalinkConstructor.PermalinkParts.forEvent(entity, eventId, via);
    } else {
      throw new Error("Unknown entity type in permalink");
    }
  }

}

exports.default = ElementPermalinkConstructor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9wZXJtYWxpbmtzL0VsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3Rvci50cyJdLCJuYW1lcyI6WyJFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IiLCJQZXJtYWxpbmtDb25zdHJ1Y3RvciIsImNvbnN0cnVjdG9yIiwiZWxlbWVudFVybCIsInN0YXJ0c1dpdGgiLCJFcnJvciIsImZvckV2ZW50Iiwicm9vbUlkIiwiZXZlbnRJZCIsInNlcnZlckNhbmRpZGF0ZXMiLCJlbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzIiwiZm9yUm9vbSIsInJvb21JZE9yQWxpYXMiLCJmb3JVc2VyIiwidXNlcklkIiwiZm9yR3JvdXAiLCJncm91cElkIiwiZm9yRW50aXR5IiwiZW50aXR5SWQiLCJpc1Blcm1hbGlua0hvc3QiLCJ0ZXN0SG9zdCIsInBhcnNlZFVybCIsIlVSTCIsImhvc3QiLCJob3N0bmFtZSIsImNhbmRpZGF0ZXMiLCJsZW5ndGgiLCJtYXAiLCJjIiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwiam9pbiIsInBhcnNlUGVybWFsaW5rIiwiZnVsbFVybCIsInBhcnRzIiwic3Vic3RyaW5nIiwicGFyc2VBcHBSb3V0ZSIsInJvdXRlIiwic3BsaXQiLCJsYXN0UGFydE1heWJlV2l0aFF1ZXJ5Iiwic3BsaWNlIiwibGFzdFBhcnQiLCJxdWVyeSIsInB1c2giLCJlbnRpdHlUeXBlIiwiZW50aXR5IiwiUGVybWFsaW5rUGFydHMiLCJzbGljZSIsInZpYSIsImZpbHRlciIsInAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSwyQkFBTixTQUEwQ0MsNkJBQTFDLENBQStEO0FBRzFFQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUFxQjtBQUM1QjtB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LENBQUNhLEtBQU4sQ0FBWSxDQUFaLEVBQWVoQixJQUFmLENBQW9CLEdBQXBCLENBQW5CLEdBQThDLEVBQTlEO0FBQ0EsWUFBTWlCLEdBQUcsR0FBR04sS0FBSyxDQUFDSixLQUFOLENBQVksUUFBWixFQUFzQlcsTUFBdEIsQ0FBNkJDLENBQUMsSUFBSSxDQUFDLENBQUNBLENBQXBDLENBQVo7QUFDQSxhQUFPSixxQ0FBZXZDLFFBQWYsQ0FBd0JzQyxNQUF4QixFQUFnQ3BDLE9BQWhDLEVBQXlDdUMsR0FBekMsQ0FBUDtBQUNILEtBTE0sTUFLQTtBQUNILFlBQU0sSUFBSTFDLEtBQUosQ0FBVSxrQ0FBVixDQUFOO0FBQ0g7QUFDSjs7QUE5RnlFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFBlcm1hbGlua0NvbnN0cnVjdG9yLCB7UGVybWFsaW5rUGFydHN9IGZyb20gXCIuL1Blcm1hbGlua0NvbnN0cnVjdG9yXCI7XG5cbi8qKlxuICogR2VuZXJhdGVzIHBlcm1hbGlua3MgdGhhdCBzZWxmLXJlZmVyZW5jZSB0aGUgcnVubmluZyB3ZWJhcHBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxlbWVudFBlcm1hbGlua0NvbnN0cnVjdG9yIGV4dGVuZHMgUGVybWFsaW5rQ29uc3RydWN0b3Ige1xuICAgIHByaXZhdGUgZWxlbWVudFVybDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudFVybDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudFVybCA9IGVsZW1lbnRVcmw7XG5cbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnRVcmwuc3RhcnRzV2l0aChcImh0dHA6XCIpICYmICF0aGlzLmVsZW1lbnRVcmwuc3RhcnRzV2l0aChcImh0dHBzOlwiKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBwcmVmaXggVVJMIGRvZXMgbm90IGFwcGVhciB0byBiZSBhbiBIVFRQKFMpIFVSTFwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvckV2ZW50KHJvb21JZDogc3RyaW5nLCBldmVudElkOiBzdHJpbmcsIHNlcnZlckNhbmRpZGF0ZXM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuZWxlbWVudFVybH0vIy9yb29tLyR7cm9vbUlkfS8ke2V2ZW50SWR9JHt0aGlzLmVuY29kZVNlcnZlckNhbmRpZGF0ZXMoc2VydmVyQ2FuZGlkYXRlcyl9YDtcbiAgICB9XG5cbiAgICBmb3JSb29tKHJvb21JZE9yQWxpYXM6IHN0cmluZywgc2VydmVyQ2FuZGlkYXRlcz86IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuZWxlbWVudFVybH0vIy9yb29tLyR7cm9vbUlkT3JBbGlhc30ke3RoaXMuZW5jb2RlU2VydmVyQ2FuZGlkYXRlcyhzZXJ2ZXJDYW5kaWRhdGVzKX1gO1xuICAgIH1cblxuICAgIGZvclVzZXIodXNlcklkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5lbGVtZW50VXJsfS8jL3VzZXIvJHt1c2VySWR9YDtcbiAgICB9XG5cbiAgICBmb3JHcm91cChncm91cElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5lbGVtZW50VXJsfS8jL2dyb3VwLyR7Z3JvdXBJZH1gO1xuICAgIH1cblxuICAgIGZvckVudGl0eShlbnRpdHlJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKGVudGl0eUlkWzBdID09PSAnIScgfHwgZW50aXR5SWRbMF0gPT09ICcjJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yUm9vbShlbnRpdHlJZCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50aXR5SWRbMF0gPT09ICdAJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yVXNlcihlbnRpdHlJZCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50aXR5SWRbMF0gPT09ICcrJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yR3JvdXAoZW50aXR5SWQpO1xuICAgICAgICB9IGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiVW5yZWNvZ25pemVkIGVudGl0eVwiKTtcbiAgICB9XG5cbiAgICBpc1Blcm1hbGlua0hvc3QodGVzdEhvc3Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBwYXJzZWRVcmwgPSBuZXcgVVJMKHRoaXMuZWxlbWVudFVybCk7XG4gICAgICAgIHJldHVybiB0ZXN0SG9zdCA9PT0gKHBhcnNlZFVybC5ob3N0IHx8IHBhcnNlZFVybC5ob3N0bmFtZSk7IC8vIG9uZSBvZiB0aGUgaG9zdHMgc2hvdWxkIG1hdGNoXG4gICAgfVxuXG4gICAgZW5jb2RlU2VydmVyQ2FuZGlkYXRlcyhjYW5kaWRhdGVzPzogc3RyaW5nW10pIHtcbiAgICAgICAgaWYgKCFjYW5kaWRhdGVzIHx8IGNhbmRpZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gJyc7XG4gICAgICAgIHJldHVybiBgP3ZpYT0ke2NhbmRpZGF0ZXMubWFwKGMgPT4gZW5jb2RlVVJJQ29tcG9uZW50KGMpKS5qb2luKFwiJnZpYT1cIil9YDtcbiAgICB9XG5cbiAgICAvLyBIZWF2aWx5IGluc3BpcmVkIGJ5L2JvcnJvd2VkIGZyb20gdGhlIG1hdHJpeC1ib3Qtc2RrICh3aXRoIHBlcm1pc3Npb24pOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90dXJ0MmxpdmUvbWF0cml4LWpzLWJvdC1zZGsvYmxvYi83YzQ2NjVjOWEyNWMyYzhlMGZlNGU1MDlmMjYxNjUwNWI1YjY2YTFjL3NyYy9QZXJtYWxpbmtzLnRzI0wzMy1MNjFcbiAgICAvLyBBZGFwdGVkIGZvciBFbGVtZW50J3MgVVJMIGZvcm1hdFxuICAgIHBhcnNlUGVybWFsaW5rKGZ1bGxVcmw6IHN0cmluZyk6IFBlcm1hbGlua1BhcnRzIHtcbiAgICAgICAgaWYgKCFmdWxsVXJsIHx8ICFmdWxsVXJsLnN0YXJ0c1dpdGgodGhpcy5lbGVtZW50VXJsKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRG9lcyBub3QgYXBwZWFyIHRvIGJlIGEgcGVybWFsaW5rXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHMgPSBmdWxsVXJsLnN1YnN0cmluZyhgJHt0aGlzLmVsZW1lbnRVcmx9LyMvYC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gRWxlbWVudFBlcm1hbGlua0NvbnN0cnVjdG9yLnBhcnNlQXBwUm91dGUocGFydHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyBhbiBhcHAgcm91dGUgKGAodXNlcnxyb29tfGdyb3VwKS9pZGVudGlmZXJgKSB0byBhIE1hdHJpeCBlbnRpdHlcbiAgICAgKiAocm9vbSwgdXNlciwgZ3JvdXApLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByb3V0ZSBUaGUgYXBwIHJvdXRlXG4gICAgICogQHJldHVybnMge1Blcm1hbGlua1BhcnRzfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZUFwcFJvdXRlKHJvdXRlOiBzdHJpbmcpOiBQZXJtYWxpbmtQYXJ0cyB7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gcm91dGUuc3BsaXQoXCIvXCIpO1xuXG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKSB7IC8vIHdlJ3JlIGV4cGVjdGluZyBhbiBlbnRpdHkgYW5kIGFuIElEIG9mIHNvbWUga2luZCBhdCBsZWFzdFxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVVJMIGlzIG1pc3NpbmcgcGFydHNcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGxpdCBvcHRpb25hbCBxdWVyeSBvdXQgb2YgbGFzdCBwYXJ0XG4gICAgICAgIGNvbnN0IFtsYXN0UGFydE1heWJlV2l0aFF1ZXJ5XSA9IHBhcnRzLnNwbGljZSgtMSwgMSk7XG4gICAgICAgIGNvbnN0IFtsYXN0UGFydCwgcXVlcnkgPSBcIlwiXSA9IGxhc3RQYXJ0TWF5YmVXaXRoUXVlcnkuc3BsaXQoXCI/XCIpO1xuICAgICAgICBwYXJ0cy5wdXNoKGxhc3RQYXJ0KTtcblxuICAgICAgICBjb25zdCBlbnRpdHlUeXBlID0gcGFydHNbMF07XG4gICAgICAgIGNvbnN0IGVudGl0eSA9IHBhcnRzWzFdO1xuICAgICAgICBpZiAoZW50aXR5VHlwZSA9PT0gJ3VzZXInKSB7XG4gICAgICAgICAgICAvLyBQcm9iYWJseSBhIHVzZXIsIG5vIGZ1cnRoZXIgcGFyc2luZyBuZWVkZWQuXG4gICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yVXNlcihlbnRpdHkpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudGl0eVR5cGUgPT09ICdncm91cCcpIHtcbiAgICAgICAgICAgIC8vIFByb2JhYmx5IGEgZ3JvdXAsIG5vIGZ1cnRoZXIgcGFyc2luZyBuZWVkZWQuXG4gICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yR3JvdXAoZW50aXR5KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRpdHlUeXBlID09PSAncm9vbScpIHtcbiAgICAgICAgICAgIC8vIFJlam9pbiB0aGUgcmVzdCBiZWNhdXNlIHYzIGV2ZW50cyBjYW4gaGF2ZSBzbGFzaGVzIChhbm5veWluZ2x5KVxuICAgICAgICAgICAgY29uc3QgZXZlbnRJZCA9IHBhcnRzLmxlbmd0aCA+IDIgPyBwYXJ0cy5zbGljZSgyKS5qb2luKCcvJykgOiBcIlwiO1xuICAgICAgICAgICAgY29uc3QgdmlhID0gcXVlcnkuc3BsaXQoLyY/dmlhPS8pLmZpbHRlcihwID0+ICEhcCk7XG4gICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yRXZlbnQoZW50aXR5LCBldmVudElkLCB2aWEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBlbnRpdHkgdHlwZSBpbiBwZXJtYWxpbmtcIik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
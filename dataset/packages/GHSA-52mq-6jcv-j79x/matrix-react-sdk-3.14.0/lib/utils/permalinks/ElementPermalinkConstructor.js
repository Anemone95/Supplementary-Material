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
    (0, _defineProperty2.default)(this, "_elementUrl", void 0);
    this._elementUrl = elementUrl;

    if (!this._elementUrl.startsWith("http:") && !this._elementUrl.startsWith("https:")) {
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
    return `${this._elementUrl}/#/room/${roomId}/${eventId}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forRoom(roomIdOrAlias
  /*: string*/
  , serverCandidates
  /*: string[]*/
  )
  /*: string*/
  {
    return `${this._elementUrl}/#/room/${roomIdOrAlias}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forUser(userId
  /*: string*/
  )
  /*: string*/
  {
    return `${this._elementUrl}/#/user/${userId}`;
  }

  forGroup(groupId
  /*: string*/
  )
  /*: string*/
  {
    return `${this._elementUrl}/#/group/${groupId}`;
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
    const parsedUrl = new URL(this._elementUrl);
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
    if (!fullUrl || !fullUrl.startsWith(this._elementUrl)) {
      throw new Error("Does not appear to be a permalink");
    }

    const parts = fullUrl.substring(`${this._elementUrl}/#/`.length);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9wZXJtYWxpbmtzL0VsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3Rvci5qcyJdLCJuYW1lcyI6WyJFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IiLCJQZXJtYWxpbmtDb25zdHJ1Y3RvciIsImNvbnN0cnVjdG9yIiwiZWxlbWVudFVybCIsIl9lbGVtZW50VXJsIiwic3RhcnRzV2l0aCIsIkVycm9yIiwiZm9yRXZlbnQiLCJyb29tSWQiLCJldmVudElkIiwic2VydmVyQ2FuZGlkYXRlcyIsImVuY29kZVNlcnZlckNhbmRpZGF0ZXMiLCJmb3JSb29tIiwicm9vbUlkT3JBbGlhcyIsImZvclVzZXIiLCJ1c2VySWQiLCJmb3JHcm91cCIsImdyb3VwSWQiLCJmb3JFbnRpdHkiLCJlbnRpdHlJZCIsImlzUGVybWFsaW5rSG9zdCIsInRlc3RIb3N0IiwicGFyc2VkVXJsIiwiVVJMIiwiaG9zdCIsImhvc3RuYW1lIiwiY2FuZGlkYXRlcyIsImxlbmd0aCIsIm1hcCIsImMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJqb2luIiwicGFyc2VQZXJtYWxpbmsiLCJmdWxsVXJsIiwicGFydHMiLCJzdWJzdHJpbmciLCJwYXJzZUFwcFJvdXRlIiwicm91dGUiLCJzcGxpdCIsImxhc3RQYXJ0TWF5YmVXaXRoUXVlcnkiLCJzcGxpY2UiLCJsYXN0UGFydCIsInF1ZXJ5IiwicHVzaCIsImVudGl0eVR5cGUiLCJlbnRpdHkiLCJQZXJtYWxpbmtQYXJ0cyIsInNsaWNlIiwidmlhIiwiZmlsdGVyIiwicCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLDJCQUFOLFNBQTBDQyw2QkFBMUMsQ0FBK0Q7QUFHMUVDLEVBQUFBLFdBQVcsQ0FBQ0M7QUFBRDtBQUFB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QWYsR0FBbUJPLEtBQUssQ0FBQ2EsS0FBTixDQUFZLENBQVosRUFBZWhCLElBQWYsQ0FBb0IsR0FBcEIsQ0FBbkIsR0FBOEMsRUFBOUQ7QUFDQSxZQUFNaUIsR0FBRyxHQUFHTixLQUFLLENBQUNKLEtBQU4sQ0FBWSxRQUFaLEVBQXNCVyxNQUF0QixDQUE2QkMsQ0FBQyxJQUFJLENBQUMsQ0FBQ0EsQ0FBcEMsQ0FBWjtBQUNBLGFBQU9KLHFDQUFldkMsUUFBZixDQUF3QnNDLE1BQXhCLEVBQWdDcEMsT0FBaEMsRUFBeUN1QyxHQUF6QyxDQUFQO0FBQ0gsS0FMTSxNQUtBO0FBQ0gsWUFBTSxJQUFJMUMsS0FBSixDQUFVLGtDQUFWLENBQU47QUFDSDtBQUNKOztBQTlGeUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUGVybWFsaW5rQ29uc3RydWN0b3IsIHtQZXJtYWxpbmtQYXJ0c30gZnJvbSBcIi4vUGVybWFsaW5rQ29uc3RydWN0b3JcIjtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgcGVybWFsaW5rcyB0aGF0IHNlbGYtcmVmZXJlbmNlIHRoZSBydW5uaW5nIHdlYmFwcFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IgZXh0ZW5kcyBQZXJtYWxpbmtDb25zdHJ1Y3RvciB7XG4gICAgX2VsZW1lbnRVcmw6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnRVcmw6IHN0cmluZykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9lbGVtZW50VXJsID0gZWxlbWVudFVybDtcblxuICAgICAgICBpZiAoIXRoaXMuX2VsZW1lbnRVcmwuc3RhcnRzV2l0aChcImh0dHA6XCIpICYmICF0aGlzLl9lbGVtZW50VXJsLnN0YXJ0c1dpdGgoXCJodHRwczpcIikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgcHJlZml4IFVSTCBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYW4gSFRUUChTKSBVUkxcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3JFdmVudChyb29tSWQ6IHN0cmluZywgZXZlbnRJZDogc3RyaW5nLCBzZXJ2ZXJDYW5kaWRhdGVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLl9lbGVtZW50VXJsfS8jL3Jvb20vJHtyb29tSWR9LyR7ZXZlbnRJZH0ke3RoaXMuZW5jb2RlU2VydmVyQ2FuZGlkYXRlcyhzZXJ2ZXJDYW5kaWRhdGVzKX1gO1xuICAgIH1cblxuICAgIGZvclJvb20ocm9vbUlkT3JBbGlhczogc3RyaW5nLCBzZXJ2ZXJDYW5kaWRhdGVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLl9lbGVtZW50VXJsfS8jL3Jvb20vJHtyb29tSWRPckFsaWFzfSR7dGhpcy5lbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKHNlcnZlckNhbmRpZGF0ZXMpfWA7XG4gICAgfVxuXG4gICAgZm9yVXNlcih1c2VySWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLl9lbGVtZW50VXJsfS8jL3VzZXIvJHt1c2VySWR9YDtcbiAgICB9XG5cbiAgICBmb3JHcm91cChncm91cElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5fZWxlbWVudFVybH0vIy9ncm91cC8ke2dyb3VwSWR9YDtcbiAgICB9XG5cbiAgICBmb3JFbnRpdHkoZW50aXR5SWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGlmIChlbnRpdHlJZFswXSA9PT0gJyEnIHx8IGVudGl0eUlkWzBdID09PSAnIycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvclJvb20oZW50aXR5SWQpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudGl0eUlkWzBdID09PSAnQCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvclVzZXIoZW50aXR5SWQpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudGl0eUlkWzBdID09PSAnKycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvckdyb3VwKGVudGl0eUlkKTtcbiAgICAgICAgfSBlbHNlIHRocm93IG5ldyBFcnJvcihcIlVucmVjb2duaXplZCBlbnRpdHlcIik7XG4gICAgfVxuXG4gICAgaXNQZXJtYWxpbmtIb3N0KHRlc3RIb3N0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVXJsID0gbmV3IFVSTCh0aGlzLl9lbGVtZW50VXJsKTtcbiAgICAgICAgcmV0dXJuIHRlc3RIb3N0ID09PSAocGFyc2VkVXJsLmhvc3QgfHwgcGFyc2VkVXJsLmhvc3RuYW1lKTsgLy8gb25lIG9mIHRoZSBob3N0cyBzaG91bGQgbWF0Y2hcbiAgICB9XG5cbiAgICBlbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKGNhbmRpZGF0ZXM6IHN0cmluZ1tdKSB7XG4gICAgICAgIGlmICghY2FuZGlkYXRlcyB8fCBjYW5kaWRhdGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnO1xuICAgICAgICByZXR1cm4gYD92aWE9JHtjYW5kaWRhdGVzLm1hcChjID0+IGVuY29kZVVSSUNvbXBvbmVudChjKSkuam9pbihcIiZ2aWE9XCIpfWA7XG4gICAgfVxuXG4gICAgLy8gSGVhdmlseSBpbnNwaXJlZCBieS9ib3Jyb3dlZCBmcm9tIHRoZSBtYXRyaXgtYm90LXNkayAod2l0aCBwZXJtaXNzaW9uKTpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdHVydDJsaXZlL21hdHJpeC1qcy1ib3Qtc2RrL2Jsb2IvN2M0NjY1YzlhMjVjMmM4ZTBmZTRlNTA5ZjI2MTY1MDViNWI2NmExYy9zcmMvUGVybWFsaW5rcy50cyNMMzMtTDYxXG4gICAgLy8gQWRhcHRlZCBmb3IgRWxlbWVudCdzIFVSTCBmb3JtYXRcbiAgICBwYXJzZVBlcm1hbGluayhmdWxsVXJsOiBzdHJpbmcpOiBQZXJtYWxpbmtQYXJ0cyB7XG4gICAgICAgIGlmICghZnVsbFVybCB8fCAhZnVsbFVybC5zdGFydHNXaXRoKHRoaXMuX2VsZW1lbnRVcmwpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBwZXJtYWxpbmtcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0cyA9IGZ1bGxVcmwuc3Vic3RyaW5nKGAke3RoaXMuX2VsZW1lbnRVcmx9LyMvYC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gRWxlbWVudFBlcm1hbGlua0NvbnN0cnVjdG9yLnBhcnNlQXBwUm91dGUocGFydHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyBhbiBhcHAgcm91dGUgKGAodXNlcnxyb29tfGdyb3VwKS9pZGVudGlmZXJgKSB0byBhIE1hdHJpeCBlbnRpdHlcbiAgICAgKiAocm9vbSwgdXNlciwgZ3JvdXApLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByb3V0ZSBUaGUgYXBwIHJvdXRlXG4gICAgICogQHJldHVybnMge1Blcm1hbGlua1BhcnRzfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZUFwcFJvdXRlKHJvdXRlOiBzdHJpbmcpOiBQZXJtYWxpbmtQYXJ0cyB7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gcm91dGUuc3BsaXQoXCIvXCIpO1xuXG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKSB7IC8vIHdlJ3JlIGV4cGVjdGluZyBhbiBlbnRpdHkgYW5kIGFuIElEIG9mIHNvbWUga2luZCBhdCBsZWFzdFxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVVJMIGlzIG1pc3NpbmcgcGFydHNcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGxpdCBvcHRpb25hbCBxdWVyeSBvdXQgb2YgbGFzdCBwYXJ0XG4gICAgICAgIGNvbnN0IFtsYXN0UGFydE1heWJlV2l0aFF1ZXJ5XSA9IHBhcnRzLnNwbGljZSgtMSwgMSk7XG4gICAgICAgIGNvbnN0IFtsYXN0UGFydCwgcXVlcnkgPSBcIlwiXSA9IGxhc3RQYXJ0TWF5YmVXaXRoUXVlcnkuc3BsaXQoXCI/XCIpO1xuICAgICAgICBwYXJ0cy5wdXNoKGxhc3RQYXJ0KTtcblxuICAgICAgICBjb25zdCBlbnRpdHlUeXBlID0gcGFydHNbMF07XG4gICAgICAgIGNvbnN0IGVudGl0eSA9IHBhcnRzWzFdO1xuICAgICAgICBpZiAoZW50aXR5VHlwZSA9PT0gJ3VzZXInKSB7XG4gICAgICAgICAgICAvLyBQcm9iYWJseSBhIHVzZXIsIG5vIGZ1cnRoZXIgcGFyc2luZyBuZWVkZWQuXG4gICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yVXNlcihlbnRpdHkpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudGl0eVR5cGUgPT09ICdncm91cCcpIHtcbiAgICAgICAgICAgIC8vIFByb2JhYmx5IGEgZ3JvdXAsIG5vIGZ1cnRoZXIgcGFyc2luZyBuZWVkZWQuXG4gICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yR3JvdXAoZW50aXR5KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRpdHlUeXBlID09PSAncm9vbScpIHtcbiAgICAgICAgICAgIC8vIFJlam9pbiB0aGUgcmVzdCBiZWNhdXNlIHYzIGV2ZW50cyBjYW4gaGF2ZSBzbGFzaGVzIChhbm5veWluZ2x5KVxuICAgICAgICAgICAgY29uc3QgZXZlbnRJZCA9IHBhcnRzLmxlbmd0aCA+IDIgPyBwYXJ0cy5zbGljZSgyKS5qb2luKCcvJykgOiBcIlwiO1xuICAgICAgICAgICAgY29uc3QgdmlhID0gcXVlcnkuc3BsaXQoLyY/dmlhPS8pLmZpbHRlcihwID0+ICEhcCk7XG4gICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yRXZlbnQoZW50aXR5LCBldmVudElkLCB2aWEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBlbnRpdHkgdHlwZSBpbiBwZXJtYWxpbmtcIik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
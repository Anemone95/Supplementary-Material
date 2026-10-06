"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PermalinkParts = exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

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
 * Interface for classes that actually produce permalinks (strings).
 * TODO: Convert this to a real TypeScript interface
 */
class PermalinkConstructor {
  forEvent(roomId
  /*: string*/
  , eventId
  /*: string*/
  , serverCandidates
  /*: string[]*/
  )
  /*: string*/
  {
    throw new Error("Not implemented");
  }

  forRoom(roomIdOrAlias
  /*: string*/
  , serverCandidates
  /*: string[]*/
  )
  /*: string*/
  {
    throw new Error("Not implemented");
  }

  forGroup(groupId
  /*: string*/
  )
  /*: string*/
  {
    throw new Error("Not implemented");
  }

  forUser(userId
  /*: string*/
  )
  /*: string*/
  {
    throw new Error("Not implemented");
  }

  forEntity(entityId
  /*: string*/
  )
  /*: string*/
  {
    throw new Error("Not implemented");
  }

  isPermalinkHost(host
  /*: string*/
  )
  /*: boolean*/
  {
    throw new Error("Not implemented");
  }

  parsePermalink(fullUrl
  /*: string*/
  )
  /*: PermalinkParts*/
  {
    throw new Error("Not implemented");
  }

} // Inspired by/Borrowed with permission from the matrix-bot-sdk:
// https://github.com/turt2live/matrix-js-bot-sdk/blob/7c4665c9a25c2c8e0fe4e509f2616505b5b66a1c/src/Permalinks.ts#L1-L6


exports.default = PermalinkConstructor;

class PermalinkParts {
  constructor(roomIdOrAlias
  /*: string*/
  , eventId
  /*: string*/
  , userId
  /*: string*/
  , groupId
  /*: string*/
  , viaServers
  /*: string[]*/
  ) {
    (0, _defineProperty2.default)(this, "roomIdOrAlias", void 0);
    (0, _defineProperty2.default)(this, "eventId", void 0);
    (0, _defineProperty2.default)(this, "userId", void 0);
    (0, _defineProperty2.default)(this, "groupId", void 0);
    (0, _defineProperty2.default)(this, "viaServers", void 0);
    this.roomIdOrAlias = roomIdOrAlias;
    this.eventId = eventId;
    this.groupId = groupId;
    this.userId = userId;
    this.viaServers = viaServers;
  }

  static forUser(userId
  /*: string*/
  )
  /*: PermalinkParts*/
  {
    return new PermalinkParts(null, null, userId, null, null);
  }

  static forGroup(groupId
  /*: string*/
  )
  /*: PermalinkParts*/
  {
    return new PermalinkParts(null, null, null, groupId, null);
  }

  static forRoom(roomIdOrAlias
  /*: string*/
  , viaServers
  /*: string[]*/
  )
  /*: PermalinkParts*/
  {
    return new PermalinkParts(roomIdOrAlias, null, null, null, viaServers || []);
  }

  static forEvent(roomId
  /*: string*/
  , eventId
  /*: string*/
  , viaServers
  /*: string[]*/
  )
  /*: PermalinkParts*/
  {
    return new PermalinkParts(roomId, eventId, null, null, viaServers || []);
  }

  get primaryEntityId()
  /*: string*/
  {
    return this.roomIdOrAlias || this.userId || this.groupId;
  }

  get sigil()
  /*: string*/
  {
    return this.primaryEntityId[0];
  }

}

exports.PermalinkParts = PermalinkParts;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua0NvbnN0cnVjdG9yLnRzIl0sIm5hbWVzIjpbIlBlcm1hbGlua0NvbnN0cnVjdG9yIiwiZm9yRXZlbnQiLCJyb29tSWQiLCJldmVudElkIiwic2VydmVyQ2FuZGlkYXRlcyIsIkVycm9yIiwiZm9yUm9vbSIsInJvb21JZE9yQWxpYXMiLCJmb3JHcm91cCIsImdyb3VwSWQiLCJmb3JVc2VyIiwidXNlcklkIiwiZm9yRW50aXR5IiwiZW50aXR5SWQiLCJpc1Blcm1hbGlua0hvc3QiLCJob3N0IiwicGFyc2VQZXJtYWxpbmsiLCJmdWxsVXJsIiwiUGVybWFsaW5rUGFydHMiLCJjb25zdHJ1Y3RvciIsInZpYVNlcnZlcnMiLCJwcmltYXJ5RW50aXR5SWQiLCJzaWdpbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxvQkFBTixDQUEyQjtBQUN0Q0MsRUFBQUEsUUFBUSxDQUFDQztBQUFEO0FBQUEsSUFBaUJDO0FBQWpCO0FBQUEsSUFBa0NDO0FBQWxDO0FBQUE7QUFBQTtBQUFzRTtBQUMxRSxVQUFNLElBQUlDLEtBQUosQ0FBVSxpQkFBVixDQUFOO0FBQ0g7O0FBRURDLEVBQUFBLE9BQU8sQ0FBQ0M7QUFBRDtBQUFBLElBQXdCSDtBQUF4QjtBQUFBO0FBQUE7QUFBNEQ7QUFDL0QsVUFBTSxJQUFJQyxLQUFKLENBQVUsaUJBQVYsQ0FBTjtBQUNIOztBQUVERyxFQUFBQSxRQUFRLENBQUNDO0FBQUQ7QUFBQTtBQUFBO0FBQTBCO0FBQzlCLFVBQU0sSUFBSUosS0FBSixDQUFVLGlCQUFWLENBQU47QUFDSDs7QUFFREssRUFBQUEsT0FBTyxDQUFDQztBQUFEO0FBQUE7QUFBQTtBQUF5QjtBQUM1QixVQUFNLElBQUlOLEtBQUosQ0FBVSxpQkFBVixDQUFOO0FBQ0g7O0FBRURPLEVBQUFBLFNBQVMsQ0FBQ0M7QUFBRDtBQUFBO0FBQUE7QUFBMkI7QUFDaEMsVUFBTSxJQUFJUixLQUFKLENBQVUsaUJBQVYsQ0FBTjtBQUNIOztBQUVEUyxFQUFBQSxlQUFlLENBQUNDO0FBQUQ7QUFBQTtBQUFBO0FBQXdCO0FBQ25DLFVBQU0sSUFBSVYsS0FBSixDQUFVLGlCQUFWLENBQU47QUFDSDs7QUFFRFcsRUFBQUEsY0FBYyxDQUFDQztBQUFEO0FBQUE7QUFBQTtBQUFrQztBQUM1QyxVQUFNLElBQUlaLEtBQUosQ0FBVSxpQkFBVixDQUFOO0FBQ0g7O0FBM0JxQyxDLENBOEIxQztBQUNBOzs7OztBQUNPLE1BQU1hLGNBQU4sQ0FBcUI7QUFPeEJDLEVBQUFBLFdBQVcsQ0FBQ1o7QUFBRDtBQUFBLElBQXdCSjtBQUF4QjtBQUFBLElBQXlDUTtBQUF6QztBQUFBLElBQXlERjtBQUF6RDtBQUFBLElBQTBFVztBQUExRTtBQUFBLElBQWdHO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN2RyxTQUFLYixhQUFMLEdBQXFCQSxhQUFyQjtBQUNBLFNBQUtKLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtNLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtFLE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtTLFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0g7O0FBRUQsU0FBT1YsT0FBUCxDQUFlQztBQUFmO0FBQUE7QUFBQTtBQUErQztBQUMzQyxXQUFPLElBQUlPLGNBQUosQ0FBbUIsSUFBbkIsRUFBeUIsSUFBekIsRUFBK0JQLE1BQS9CLEVBQXVDLElBQXZDLEVBQTZDLElBQTdDLENBQVA7QUFDSDs7QUFFRCxTQUFPSCxRQUFQLENBQWdCQztBQUFoQjtBQUFBO0FBQUE7QUFBaUQ7QUFDN0MsV0FBTyxJQUFJUyxjQUFKLENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLElBQS9CLEVBQXFDVCxPQUFyQyxFQUE4QyxJQUE5QyxDQUFQO0FBQ0g7O0FBRUQsU0FBT0gsT0FBUCxDQUFlQztBQUFmO0FBQUEsSUFBc0NhO0FBQXRDO0FBQUE7QUFBQTtBQUE0RTtBQUN4RSxXQUFPLElBQUlGLGNBQUosQ0FBbUJYLGFBQW5CLEVBQWtDLElBQWxDLEVBQXdDLElBQXhDLEVBQThDLElBQTlDLEVBQW9EYSxVQUFVLElBQUksRUFBbEUsQ0FBUDtBQUNIOztBQUVELFNBQU9uQixRQUFQLENBQWdCQztBQUFoQjtBQUFBLElBQWdDQztBQUFoQztBQUFBLElBQWlEaUI7QUFBakQ7QUFBQTtBQUFBO0FBQXVGO0FBQ25GLFdBQU8sSUFBSUYsY0FBSixDQUFtQmhCLE1BQW5CLEVBQTJCQyxPQUEzQixFQUFvQyxJQUFwQyxFQUEwQyxJQUExQyxFQUFnRGlCLFVBQVUsSUFBSSxFQUE5RCxDQUFQO0FBQ0g7O0FBRUQsTUFBSUMsZUFBSjtBQUFBO0FBQThCO0FBQzFCLFdBQU8sS0FBS2QsYUFBTCxJQUFzQixLQUFLSSxNQUEzQixJQUFxQyxLQUFLRixPQUFqRDtBQUNIOztBQUVELE1BQUlhLEtBQUo7QUFBQTtBQUFvQjtBQUNoQixXQUFPLEtBQUtELGVBQUwsQ0FBcUIsQ0FBckIsQ0FBUDtBQUNIOztBQXJDdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgY2xhc3NlcyB0aGF0IGFjdHVhbGx5IHByb2R1Y2UgcGVybWFsaW5rcyAoc3RyaW5ncykuXG4gKiBUT0RPOiBDb252ZXJ0IHRoaXMgdG8gYSByZWFsIFR5cGVTY3JpcHQgaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlcm1hbGlua0NvbnN0cnVjdG9yIHtcbiAgICBmb3JFdmVudChyb29tSWQ6IHN0cmluZywgZXZlbnRJZDogc3RyaW5nLCBzZXJ2ZXJDYW5kaWRhdGVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICBmb3JSb29tKHJvb21JZE9yQWxpYXM6IHN0cmluZywgc2VydmVyQ2FuZGlkYXRlczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgZm9yR3JvdXAoZ3JvdXBJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIGZvclVzZXIodXNlcklkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgZm9yRW50aXR5KGVudGl0eUlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgaXNQZXJtYWxpbmtIb3N0KGhvc3Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgcGFyc2VQZXJtYWxpbmsoZnVsbFVybDogc3RyaW5nKTogUGVybWFsaW5rUGFydHMge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxufVxuXG4vLyBJbnNwaXJlZCBieS9Cb3Jyb3dlZCB3aXRoIHBlcm1pc3Npb24gZnJvbSB0aGUgbWF0cml4LWJvdC1zZGs6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vdHVydDJsaXZlL21hdHJpeC1qcy1ib3Qtc2RrL2Jsb2IvN2M0NjY1YzlhMjVjMmM4ZTBmZTRlNTA5ZjI2MTY1MDViNWI2NmExYy9zcmMvUGVybWFsaW5rcy50cyNMMS1MNlxuZXhwb3J0IGNsYXNzIFBlcm1hbGlua1BhcnRzIHtcbiAgICByb29tSWRPckFsaWFzOiBzdHJpbmc7XG4gICAgZXZlbnRJZDogc3RyaW5nO1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICAgIGdyb3VwSWQ6IHN0cmluZztcbiAgICB2aWFTZXJ2ZXJzOiBzdHJpbmdbXTtcblxuICAgIGNvbnN0cnVjdG9yKHJvb21JZE9yQWxpYXM6IHN0cmluZywgZXZlbnRJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZywgZ3JvdXBJZDogc3RyaW5nLCB2aWFTZXJ2ZXJzOiBzdHJpbmdbXSkge1xuICAgICAgICB0aGlzLnJvb21JZE9yQWxpYXMgPSByb29tSWRPckFsaWFzO1xuICAgICAgICB0aGlzLmV2ZW50SWQgPSBldmVudElkO1xuICAgICAgICB0aGlzLmdyb3VwSWQgPSBncm91cElkO1xuICAgICAgICB0aGlzLnVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgdGhpcy52aWFTZXJ2ZXJzID0gdmlhU2VydmVycztcbiAgICB9XG5cbiAgICBzdGF0aWMgZm9yVXNlcih1c2VySWQ6IHN0cmluZyk6IFBlcm1hbGlua1BhcnRzIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQZXJtYWxpbmtQYXJ0cyhudWxsLCBudWxsLCB1c2VySWQsIG51bGwsIG51bGwpO1xuICAgIH1cblxuICAgIHN0YXRpYyBmb3JHcm91cChncm91cElkOiBzdHJpbmcpOiBQZXJtYWxpbmtQYXJ0cyB7XG4gICAgICAgIHJldHVybiBuZXcgUGVybWFsaW5rUGFydHMobnVsbCwgbnVsbCwgbnVsbCwgZ3JvdXBJZCwgbnVsbCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZvclJvb20ocm9vbUlkT3JBbGlhczogc3RyaW5nLCB2aWFTZXJ2ZXJzOiBzdHJpbmdbXSk6IFBlcm1hbGlua1BhcnRzIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQZXJtYWxpbmtQYXJ0cyhyb29tSWRPckFsaWFzLCBudWxsLCBudWxsLCBudWxsLCB2aWFTZXJ2ZXJzIHx8IFtdKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZm9yRXZlbnQocm9vbUlkOiBzdHJpbmcsIGV2ZW50SWQ6IHN0cmluZywgdmlhU2VydmVyczogc3RyaW5nW10pOiBQZXJtYWxpbmtQYXJ0cyB7XG4gICAgICAgIHJldHVybiBuZXcgUGVybWFsaW5rUGFydHMocm9vbUlkLCBldmVudElkLCBudWxsLCBudWxsLCB2aWFTZXJ2ZXJzIHx8IFtdKTtcbiAgICB9XG5cbiAgICBnZXQgcHJpbWFyeUVudGl0eUlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvb21JZE9yQWxpYXMgfHwgdGhpcy51c2VySWQgfHwgdGhpcy5ncm91cElkO1xuICAgIH1cblxuICAgIGdldCBzaWdpbCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmltYXJ5RW50aXR5SWRbMF07XG4gICAgfVxufVxuIl19
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NameFilterCondition = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _IFilterCondition = require("./IFilterCondition");

var _events = require("events");

var _utils = require("matrix-js-sdk/src/utils");

var _lodash = require("lodash");

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
 * A filter condition for the room list which reveals rooms of a particular
 * name, or associated name (like a room alias).
 */
class NameFilterCondition extends _events.EventEmitter
/*:: implements IFilterCondition*/
{
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_search", "");
    (0, _defineProperty2.default)(this, "callUpdate", (0, _lodash.throttle)(() => {
      this.emit(_IFilterCondition.FILTER_CHANGED);
    }, 200, {
      trailing: true,
      leading: true
    }));
  }

  get kind()
  /*: FilterKind*/
  {
    return _IFilterCondition.FilterKind.Runtime;
  }

  get search()
  /*: string*/
  {
    return this._search;
  }

  set search(val
  /*: string*/
  ) {
    this._search = val;
    this.callUpdate();
  }

  isVisible(room
  /*: Room*/
  )
  /*: boolean*/
  {
    const lcFilter = this.search.toLowerCase();

    if (this.search[0] === '#') {
      // Try and find rooms by alias
      if (room.getCanonicalAlias() && room.getCanonicalAlias().toLowerCase().startsWith(lcFilter)) {
        return true;
      }

      if (room.getAltAliases().some(a => a.toLowerCase().startsWith(lcFilter))) {
        return true;
      }
    }

    if (!room.name) return false; // should realistically not happen: the js-sdk always calculates a name

    return this.matches(room.name);
  }

  normalize(val
  /*: string*/
  )
  /*: string*/
  {
    // Note: we have to match the filter with the removeHiddenChars() room name because the
    // function strips spaces and other characters (M becomes RN for example, in lowercase).
    return (0, _utils.removeHiddenChars)(val.toLowerCase()) // Strip all punctuation
    .replace(/[\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~\u2000-\u206f\u2e00-\u2e7f]/g, "") // We also doubly convert to lowercase to work around oddities of the library.
    .toLowerCase();
  }

  matches(val
  /*: string*/
  )
  /*: boolean*/
  {
    return this.normalize(val).includes(this.normalize(this.search));
  }

}

exports.NameFilterCondition = NameFilterCondition;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2ZpbHRlcnMvTmFtZUZpbHRlckNvbmRpdGlvbi50cyJdLCJuYW1lcyI6WyJOYW1lRmlsdGVyQ29uZGl0aW9uIiwiRXZlbnRFbWl0dGVyIiwiY29uc3RydWN0b3IiLCJlbWl0IiwiRklMVEVSX0NIQU5HRUQiLCJ0cmFpbGluZyIsImxlYWRpbmciLCJraW5kIiwiRmlsdGVyS2luZCIsIlJ1bnRpbWUiLCJzZWFyY2giLCJfc2VhcmNoIiwidmFsIiwiY2FsbFVwZGF0ZSIsImlzVmlzaWJsZSIsInJvb20iLCJsY0ZpbHRlciIsInRvTG93ZXJDYXNlIiwiZ2V0Q2Fub25pY2FsQWxpYXMiLCJzdGFydHNXaXRoIiwiZ2V0QWx0QWxpYXNlcyIsInNvbWUiLCJhIiwibmFtZSIsIm1hdGNoZXMiLCJub3JtYWxpemUiLCJyZXBsYWNlIiwiaW5jbHVkZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDTyxNQUFNQSxtQkFBTixTQUFrQ0M7QUFBbEM7QUFBMkU7QUFHOUVDLEVBQUFBLFdBQVcsR0FBRztBQUNWO0FBRFUsbURBRkksRUFFSjtBQUFBLHNEQWlCTyxzQkFBUyxNQUFNO0FBQ2hDLFdBQUtDLElBQUwsQ0FBVUMsZ0NBQVY7QUFDSCxLQUZvQixFQUVsQixHQUZrQixFQUViO0FBQUNDLE1BQUFBLFFBQVEsRUFBRSxJQUFYO0FBQWlCQyxNQUFBQSxPQUFPLEVBQUU7QUFBMUIsS0FGYSxDQWpCUDtBQUViOztBQUVELE1BQVdDLElBQVg7QUFBQTtBQUE4QjtBQUMxQixXQUFPQyw2QkFBV0MsT0FBbEI7QUFDSDs7QUFFRCxNQUFXQyxNQUFYO0FBQUE7QUFBNEI7QUFDeEIsV0FBTyxLQUFLQyxPQUFaO0FBQ0g7O0FBRUQsTUFBV0QsTUFBWCxDQUFrQkU7QUFBbEI7QUFBQSxJQUErQjtBQUMzQixTQUFLRCxPQUFMLEdBQWVDLEdBQWY7QUFDQSxTQUFLQyxVQUFMO0FBQ0g7O0FBTU1DLEVBQUFBLFNBQVAsQ0FBaUJDO0FBQWpCO0FBQUE7QUFBQTtBQUFzQztBQUNsQyxVQUFNQyxRQUFRLEdBQUcsS0FBS04sTUFBTCxDQUFZTyxXQUFaLEVBQWpCOztBQUNBLFFBQUksS0FBS1AsTUFBTCxDQUFZLENBQVosTUFBbUIsR0FBdkIsRUFBNEI7QUFDeEI7QUFDQSxVQUFJSyxJQUFJLENBQUNHLGlCQUFMLE1BQTRCSCxJQUFJLENBQUNHLGlCQUFMLEdBQXlCRCxXQUF6QixHQUF1Q0UsVUFBdkMsQ0FBa0RILFFBQWxELENBQWhDLEVBQTZGO0FBQ3pGLGVBQU8sSUFBUDtBQUNIOztBQUNELFVBQUlELElBQUksQ0FBQ0ssYUFBTCxHQUFxQkMsSUFBckIsQ0FBMEJDLENBQUMsSUFBSUEsQ0FBQyxDQUFDTCxXQUFGLEdBQWdCRSxVQUFoQixDQUEyQkgsUUFBM0IsQ0FBL0IsQ0FBSixFQUEwRTtBQUN0RSxlQUFPLElBQVA7QUFDSDtBQUNKOztBQUVELFFBQUksQ0FBQ0QsSUFBSSxDQUFDUSxJQUFWLEVBQWdCLE9BQU8sS0FBUCxDQVprQixDQVlKOztBQUU5QixXQUFPLEtBQUtDLE9BQUwsQ0FBYVQsSUFBSSxDQUFDUSxJQUFsQixDQUFQO0FBQ0g7O0FBRU9FLEVBQUFBLFNBQVIsQ0FBa0JiO0FBQWxCO0FBQUE7QUFBQTtBQUF1QztBQUNuQztBQUNBO0FBQ0EsV0FBTyw4QkFBa0JBLEdBQUcsQ0FBQ0ssV0FBSixFQUFsQixFQUNIO0FBREcsS0FFRlMsT0FGRSxDQUVNLGtFQUZOLEVBRTBFLEVBRjFFLEVBR0g7QUFIRyxLQUlGVCxXQUpFLEVBQVA7QUFLSDs7QUFFTU8sRUFBQUEsT0FBUCxDQUFlWjtBQUFmO0FBQUE7QUFBQTtBQUFxQztBQUNqQyxXQUFPLEtBQUthLFNBQUwsQ0FBZWIsR0FBZixFQUFvQmUsUUFBcEIsQ0FBNkIsS0FBS0YsU0FBTCxDQUFlLEtBQUtmLE1BQXBCLENBQTdCLENBQVA7QUFDSDs7QUFyRDZFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwLCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgRklMVEVSX0NIQU5HRUQsIEZpbHRlcktpbmQsIElGaWx0ZXJDb25kaXRpb24gfSBmcm9tIFwiLi9JRmlsdGVyQ29uZGl0aW9uXCI7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgeyByZW1vdmVIaWRkZW5DaGFycyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy91dGlsc1wiO1xuaW1wb3J0IHsgdGhyb3R0bGUgfSBmcm9tIFwibG9kYXNoXCI7XG5cbi8qKlxuICogQSBmaWx0ZXIgY29uZGl0aW9uIGZvciB0aGUgcm9vbSBsaXN0IHdoaWNoIHJldmVhbHMgcm9vbXMgb2YgYSBwYXJ0aWN1bGFyXG4gKiBuYW1lLCBvciBhc3NvY2lhdGVkIG5hbWUgKGxpa2UgYSByb29tIGFsaWFzKS5cbiAqL1xuZXhwb3J0IGNsYXNzIE5hbWVGaWx0ZXJDb25kaXRpb24gZXh0ZW5kcyBFdmVudEVtaXR0ZXIgaW1wbGVtZW50cyBJRmlsdGVyQ29uZGl0aW9uIHtcbiAgICBwcml2YXRlIF9zZWFyY2ggPSBcIlwiO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBraW5kKCk6IEZpbHRlcktpbmQge1xuICAgICAgICByZXR1cm4gRmlsdGVyS2luZC5SdW50aW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc2VhcmNoKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2g7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBzZWFyY2godmFsOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fc2VhcmNoID0gdmFsO1xuICAgICAgICB0aGlzLmNhbGxVcGRhdGUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbGxVcGRhdGUgPSB0aHJvdHRsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdChGSUxURVJfQ0hBTkdFRCk7XG4gICAgfSwgMjAwLCB7dHJhaWxpbmc6IHRydWUsIGxlYWRpbmc6IHRydWV9KTtcblxuICAgIHB1YmxpYyBpc1Zpc2libGUocm9vbTogUm9vbSk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBsY0ZpbHRlciA9IHRoaXMuc2VhcmNoLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaFswXSA9PT0gJyMnKSB7XG4gICAgICAgICAgICAvLyBUcnkgYW5kIGZpbmQgcm9vbXMgYnkgYWxpYXNcbiAgICAgICAgICAgIGlmIChyb29tLmdldENhbm9uaWNhbEFsaWFzKCkgJiYgcm9vbS5nZXRDYW5vbmljYWxBbGlhcygpLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChsY0ZpbHRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyb29tLmdldEFsdEFsaWFzZXMoKS5zb21lKGEgPT4gYS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgobGNGaWx0ZXIpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyb29tLm5hbWUpIHJldHVybiBmYWxzZTsgLy8gc2hvdWxkIHJlYWxpc3RpY2FsbHkgbm90IGhhcHBlbjogdGhlIGpzLXNkayBhbHdheXMgY2FsY3VsYXRlcyBhIG5hbWVcblxuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVzKHJvb20ubmFtZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBub3JtYWxpemUodmFsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICAvLyBOb3RlOiB3ZSBoYXZlIHRvIG1hdGNoIHRoZSBmaWx0ZXIgd2l0aCB0aGUgcmVtb3ZlSGlkZGVuQ2hhcnMoKSByb29tIG5hbWUgYmVjYXVzZSB0aGVcbiAgICAgICAgLy8gZnVuY3Rpb24gc3RyaXBzIHNwYWNlcyBhbmQgb3RoZXIgY2hhcmFjdGVycyAoTSBiZWNvbWVzIFJOIGZvciBleGFtcGxlLCBpbiBsb3dlcmNhc2UpLlxuICAgICAgICByZXR1cm4gcmVtb3ZlSGlkZGVuQ2hhcnModmFsLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgICAvLyBTdHJpcCBhbGwgcHVuY3R1YXRpb25cbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXFxcXCchXCIjJCUmKCkqKyxcXC0uLzo7PD0+P0BbXFxdXl9ge3x9flxcdTIwMDAtXFx1MjA2ZlxcdTJlMDAtXFx1MmU3Zl0vZywgXCJcIilcbiAgICAgICAgICAgIC8vIFdlIGFsc28gZG91Ymx5IGNvbnZlcnQgdG8gbG93ZXJjYXNlIHRvIHdvcmsgYXJvdW5kIG9kZGl0aWVzIG9mIHRoZSBsaWJyYXJ5LlxuICAgICAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIG1hdGNoZXModmFsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHZhbCkuaW5jbHVkZXModGhpcy5ub3JtYWxpemUodGhpcy5zZWFyY2gpKTtcbiAgICB9XG59XG4iXX0=
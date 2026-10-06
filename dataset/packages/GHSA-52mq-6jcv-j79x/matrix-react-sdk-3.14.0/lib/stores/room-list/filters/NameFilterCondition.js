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

  get relativePriority()
  /*: FilterPriority*/
  {
    // We want this one to be at the highest priority so it can search within other filters.
    return _IFilterCondition.FilterPriority.Highest;
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

  matches(val
  /*: string*/
  )
  /*: boolean*/
  {
    // Note: we have to match the filter with the removeHiddenChars() room name because the
    // function strips spaces and other characters (M becomes RN for example, in lowercase).
    // We also doubly convert to lowercase to work around oddities of the library.
    const noSecretsFilter = (0, _utils.removeHiddenChars)(this.search.toLowerCase()).toLowerCase();
    const noSecretsName = (0, _utils.removeHiddenChars)(val.toLowerCase()).toLowerCase();
    return noSecretsName.includes(noSecretsFilter);
  }

}

exports.NameFilterCondition = NameFilterCondition;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2ZpbHRlcnMvTmFtZUZpbHRlckNvbmRpdGlvbi50cyJdLCJuYW1lcyI6WyJOYW1lRmlsdGVyQ29uZGl0aW9uIiwiRXZlbnRFbWl0dGVyIiwiY29uc3RydWN0b3IiLCJlbWl0IiwiRklMVEVSX0NIQU5HRUQiLCJ0cmFpbGluZyIsImxlYWRpbmciLCJyZWxhdGl2ZVByaW9yaXR5IiwiRmlsdGVyUHJpb3JpdHkiLCJIaWdoZXN0Iiwic2VhcmNoIiwiX3NlYXJjaCIsInZhbCIsImNhbGxVcGRhdGUiLCJpc1Zpc2libGUiLCJyb29tIiwibGNGaWx0ZXIiLCJ0b0xvd2VyQ2FzZSIsImdldENhbm9uaWNhbEFsaWFzIiwic3RhcnRzV2l0aCIsImdldEFsdEFsaWFzZXMiLCJzb21lIiwiYSIsIm5hbWUiLCJtYXRjaGVzIiwibm9TZWNyZXRzRmlsdGVyIiwibm9TZWNyZXRzTmFtZSIsImluY2x1ZGVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsbUJBQU4sU0FBa0NDO0FBQWxDO0FBQTJFO0FBRzlFQyxFQUFBQSxXQUFXLEdBQUc7QUFDVjtBQURVLG1EQUZJLEVBRUo7QUFBQSxzREFrQk8sc0JBQVMsTUFBTTtBQUNoQyxXQUFLQyxJQUFMLENBQVVDLGdDQUFWO0FBQ0gsS0FGb0IsRUFFbEIsR0FGa0IsRUFFYjtBQUFDQyxNQUFBQSxRQUFRLEVBQUUsSUFBWDtBQUFpQkMsTUFBQUEsT0FBTyxFQUFFO0FBQTFCLEtBRmEsQ0FsQlA7QUFFYjs7QUFFRCxNQUFXQyxnQkFBWDtBQUFBO0FBQThDO0FBQzFDO0FBQ0EsV0FBT0MsaUNBQWVDLE9BQXRCO0FBQ0g7O0FBRUQsTUFBV0MsTUFBWDtBQUFBO0FBQTRCO0FBQ3hCLFdBQU8sS0FBS0MsT0FBWjtBQUNIOztBQUVELE1BQVdELE1BQVgsQ0FBa0JFO0FBQWxCO0FBQUEsSUFBK0I7QUFDM0IsU0FBS0QsT0FBTCxHQUFlQyxHQUFmO0FBQ0EsU0FBS0MsVUFBTDtBQUNIOztBQU1NQyxFQUFBQSxTQUFQLENBQWlCQztBQUFqQjtBQUFBO0FBQUE7QUFBc0M7QUFDbEMsVUFBTUMsUUFBUSxHQUFHLEtBQUtOLE1BQUwsQ0FBWU8sV0FBWixFQUFqQjs7QUFDQSxRQUFJLEtBQUtQLE1BQUwsQ0FBWSxDQUFaLE1BQW1CLEdBQXZCLEVBQTRCO0FBQ3hCO0FBQ0EsVUFBSUssSUFBSSxDQUFDRyxpQkFBTCxNQUE0QkgsSUFBSSxDQUFDRyxpQkFBTCxHQUF5QkQsV0FBekIsR0FBdUNFLFVBQXZDLENBQWtESCxRQUFsRCxDQUFoQyxFQUE2RjtBQUN6RixlQUFPLElBQVA7QUFDSDs7QUFDRCxVQUFJRCxJQUFJLENBQUNLLGFBQUwsR0FBcUJDLElBQXJCLENBQTBCQyxDQUFDLElBQUlBLENBQUMsQ0FBQ0wsV0FBRixHQUFnQkUsVUFBaEIsQ0FBMkJILFFBQTNCLENBQS9CLENBQUosRUFBMEU7QUFDdEUsZUFBTyxJQUFQO0FBQ0g7QUFDSjs7QUFFRCxRQUFJLENBQUNELElBQUksQ0FBQ1EsSUFBVixFQUFnQixPQUFPLEtBQVAsQ0Faa0IsQ0FZSjs7QUFFOUIsV0FBTyxLQUFLQyxPQUFMLENBQWFULElBQUksQ0FBQ1EsSUFBbEIsQ0FBUDtBQUNIOztBQUVNQyxFQUFBQSxPQUFQLENBQWVaO0FBQWY7QUFBQTtBQUFBO0FBQXFDO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBLFVBQU1hLGVBQWUsR0FBRyw4QkFBa0IsS0FBS2YsTUFBTCxDQUFZTyxXQUFaLEVBQWxCLEVBQTZDQSxXQUE3QyxFQUF4QjtBQUNBLFVBQU1TLGFBQWEsR0FBRyw4QkFBa0JkLEdBQUcsQ0FBQ0ssV0FBSixFQUFsQixFQUFxQ0EsV0FBckMsRUFBdEI7QUFDQSxXQUFPUyxhQUFhLENBQUNDLFFBQWQsQ0FBdUJGLGVBQXZCLENBQVA7QUFDSDs7QUFqRDZFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgRklMVEVSX0NIQU5HRUQsIEZpbHRlclByaW9yaXR5LCBJRmlsdGVyQ29uZGl0aW9uIH0gZnJvbSBcIi4vSUZpbHRlckNvbmRpdGlvblwiO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IHsgcmVtb3ZlSGlkZGVuQ2hhcnMgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvdXRpbHNcIjtcbmltcG9ydCB7IHRocm90dGxlIH0gZnJvbSBcImxvZGFzaFwiO1xuXG4vKipcbiAqIEEgZmlsdGVyIGNvbmRpdGlvbiBmb3IgdGhlIHJvb20gbGlzdCB3aGljaCByZXZlYWxzIHJvb21zIG9mIGEgcGFydGljdWxhclxuICogbmFtZSwgb3IgYXNzb2NpYXRlZCBuYW1lIChsaWtlIGEgcm9vbSBhbGlhcykuXG4gKi9cbmV4cG9ydCBjbGFzcyBOYW1lRmlsdGVyQ29uZGl0aW9uIGV4dGVuZHMgRXZlbnRFbWl0dGVyIGltcGxlbWVudHMgSUZpbHRlckNvbmRpdGlvbiB7XG4gICAgcHJpdmF0ZSBfc2VhcmNoID0gXCJcIjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcmVsYXRpdmVQcmlvcml0eSgpOiBGaWx0ZXJQcmlvcml0eSB7XG4gICAgICAgIC8vIFdlIHdhbnQgdGhpcyBvbmUgdG8gYmUgYXQgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgc28gaXQgY2FuIHNlYXJjaCB3aXRoaW4gb3RoZXIgZmlsdGVycy5cbiAgICAgICAgcmV0dXJuIEZpbHRlclByaW9yaXR5LkhpZ2hlc3Q7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzZWFyY2goKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlYXJjaDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHNlYXJjaCh2YWw6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9zZWFyY2ggPSB2YWw7XG4gICAgICAgIHRoaXMuY2FsbFVwZGF0ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FsbFVwZGF0ZSA9IHRocm90dGxlKCgpID0+IHtcbiAgICAgICAgdGhpcy5lbWl0KEZJTFRFUl9DSEFOR0VEKTtcbiAgICB9LCAyMDAsIHt0cmFpbGluZzogdHJ1ZSwgbGVhZGluZzogdHJ1ZX0pO1xuXG4gICAgcHVibGljIGlzVmlzaWJsZShyb29tOiBSb29tKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGxjRmlsdGVyID0gdGhpcy5zZWFyY2gudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoWzBdID09PSAnIycpIHtcbiAgICAgICAgICAgIC8vIFRyeSBhbmQgZmluZCByb29tcyBieSBhbGlhc1xuICAgICAgICAgICAgaWYgKHJvb20uZ2V0Q2Fub25pY2FsQWxpYXMoKSAmJiByb29tLmdldENhbm9uaWNhbEFsaWFzKCkudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKGxjRmlsdGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJvb20uZ2V0QWx0QWxpYXNlcygpLnNvbWUoYSA9PiBhLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChsY0ZpbHRlcikpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJvb20ubmFtZSkgcmV0dXJuIGZhbHNlOyAvLyBzaG91bGQgcmVhbGlzdGljYWxseSBub3QgaGFwcGVuOiB0aGUganMtc2RrIGFsd2F5cyBjYWxjdWxhdGVzIGEgbmFtZVxuXG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoZXMocm9vbS5uYW1lKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbWF0Y2hlcyh2YWw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBOb3RlOiB3ZSBoYXZlIHRvIG1hdGNoIHRoZSBmaWx0ZXIgd2l0aCB0aGUgcmVtb3ZlSGlkZGVuQ2hhcnMoKSByb29tIG5hbWUgYmVjYXVzZSB0aGVcbiAgICAgICAgLy8gZnVuY3Rpb24gc3RyaXBzIHNwYWNlcyBhbmQgb3RoZXIgY2hhcmFjdGVycyAoTSBiZWNvbWVzIFJOIGZvciBleGFtcGxlLCBpbiBsb3dlcmNhc2UpLlxuICAgICAgICAvLyBXZSBhbHNvIGRvdWJseSBjb252ZXJ0IHRvIGxvd2VyY2FzZSB0byB3b3JrIGFyb3VuZCBvZGRpdGllcyBvZiB0aGUgbGlicmFyeS5cbiAgICAgICAgY29uc3Qgbm9TZWNyZXRzRmlsdGVyID0gcmVtb3ZlSGlkZGVuQ2hhcnModGhpcy5zZWFyY2gudG9Mb3dlckNhc2UoKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3Qgbm9TZWNyZXRzTmFtZSA9IHJlbW92ZUhpZGRlbkNoYXJzKHZhbC50b0xvd2VyQ2FzZSgpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gbm9TZWNyZXRzTmFtZS5pbmNsdWRlcyhub1NlY3JldHNGaWx0ZXIpO1xuICAgIH1cbn1cbiJdfQ==
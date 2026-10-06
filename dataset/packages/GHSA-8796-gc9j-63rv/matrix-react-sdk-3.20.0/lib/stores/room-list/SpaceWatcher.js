"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpaceWatcher = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _SpaceFilterCondition = require("./filters/SpaceFilterCondition");

var _SpaceStore = _interopRequireWildcard(require("../SpaceStore"));

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
 * Watches for changes in spaces to manage the filter on the provided RoomListStore
 */
class SpaceWatcher {
  constructor(store
  /*: RoomListStoreClass*/
  ) {
    this.store
    /*:: */
    = store
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "filter", new _SpaceFilterCondition.SpaceFilterCondition());
    (0, _defineProperty2.default)(this, "activeSpace", _SpaceStore.default.instance.activeSpace);
    (0, _defineProperty2.default)(this, "onSelectedSpaceUpdated", (activeSpace
    /*: Room*/
    ) => {
      this.activeSpace = activeSpace;
      this.updateFilter();
    });
    (0, _defineProperty2.default)(this, "updateFilter", () => {
      if (this.activeSpace) {
        _SpaceStore.default.instance.traverseSpace(this.activeSpace.roomId, roomId => {
          this.store.matrixClient?.getRoom(roomId)?.loadMembersIfNeeded();
        });
      }

      this.filter.updateSpace(this.activeSpace);
    });
    this.updateFilter(); // get the filter into a consistent state

    store.addFilter(this.filter);

    _SpaceStore.default.instance.on(_SpaceStore.UPDATE_SELECTED_SPACE, this.onSelectedSpaceUpdated);
  }

}

exports.SpaceWatcher = SpaceWatcher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L1NwYWNlV2F0Y2hlci50cyJdLCJuYW1lcyI6WyJTcGFjZVdhdGNoZXIiLCJjb25zdHJ1Y3RvciIsInN0b3JlIiwiU3BhY2VGaWx0ZXJDb25kaXRpb24iLCJTcGFjZVN0b3JlIiwiaW5zdGFuY2UiLCJhY3RpdmVTcGFjZSIsInVwZGF0ZUZpbHRlciIsInRyYXZlcnNlU3BhY2UiLCJyb29tSWQiLCJtYXRyaXhDbGllbnQiLCJnZXRSb29tIiwibG9hZE1lbWJlcnNJZk5lZWRlZCIsImZpbHRlciIsInVwZGF0ZVNwYWNlIiwiYWRkRmlsdGVyIiwib24iLCJVUERBVEVfU0VMRUNURURfU1BBQ0UiLCJvblNlbGVjdGVkU3BhY2VVcGRhdGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBUUE7QUFDQTtBQUNBO0FBQ08sTUFBTUEsWUFBTixDQUFtQjtBQUl0QkMsRUFBQUEsV0FBVyxDQUFTQztBQUFUO0FBQUEsSUFBb0M7QUFBQSxTQUEzQkE7QUFBMkI7QUFBQSxNQUEzQkE7QUFBMkI7QUFBQTtBQUFBLGtEQUg5QixJQUFJQywwQ0FBSixFQUc4QjtBQUFBLHVEQUZuQkMsb0JBQVdDLFFBQVgsQ0FBb0JDLFdBRUQ7QUFBQSxrRUFNZCxDQUFDQTtBQUFEO0FBQUEsU0FBdUI7QUFDcEQsV0FBS0EsV0FBTCxHQUFtQkEsV0FBbkI7QUFDQSxXQUFLQyxZQUFMO0FBQ0gsS0FUOEM7QUFBQSx3REFXeEIsTUFBTTtBQUN6QixVQUFJLEtBQUtELFdBQVQsRUFBc0I7QUFDbEJGLDRCQUFXQyxRQUFYLENBQW9CRyxhQUFwQixDQUFrQyxLQUFLRixXQUFMLENBQWlCRyxNQUFuRCxFQUEyREEsTUFBTSxJQUFJO0FBQ2pFLGVBQUtQLEtBQUwsQ0FBV1EsWUFBWCxFQUF5QkMsT0FBekIsQ0FBaUNGLE1BQWpDLEdBQTBDRyxtQkFBMUM7QUFDSCxTQUZEO0FBR0g7O0FBQ0QsV0FBS0MsTUFBTCxDQUFZQyxXQUFaLENBQXdCLEtBQUtSLFdBQTdCO0FBQ0gsS0FsQjhDO0FBQzNDLFNBQUtDLFlBQUwsR0FEMkMsQ0FDdEI7O0FBQ3JCTCxJQUFBQSxLQUFLLENBQUNhLFNBQU4sQ0FBZ0IsS0FBS0YsTUFBckI7O0FBQ0FULHdCQUFXQyxRQUFYLENBQW9CVyxFQUFwQixDQUF1QkMsaUNBQXZCLEVBQThDLEtBQUtDLHNCQUFuRDtBQUNIOztBQVJxQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IHsgUm9vbUxpc3RTdG9yZUNsYXNzIH0gZnJvbSBcIi4vUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IHsgU3BhY2VGaWx0ZXJDb25kaXRpb24gfSBmcm9tIFwiLi9maWx0ZXJzL1NwYWNlRmlsdGVyQ29uZGl0aW9uXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSwgeyBVUERBVEVfU0VMRUNURURfU1BBQ0UgfSBmcm9tIFwiLi4vU3BhY2VTdG9yZVwiO1xuXG4vKipcbiAqIFdhdGNoZXMgZm9yIGNoYW5nZXMgaW4gc3BhY2VzIHRvIG1hbmFnZSB0aGUgZmlsdGVyIG9uIHRoZSBwcm92aWRlZCBSb29tTGlzdFN0b3JlXG4gKi9cbmV4cG9ydCBjbGFzcyBTcGFjZVdhdGNoZXIge1xuICAgIHByaXZhdGUgZmlsdGVyID0gbmV3IFNwYWNlRmlsdGVyQ29uZGl0aW9uKCk7XG4gICAgcHJpdmF0ZSBhY3RpdmVTcGFjZTogUm9vbSA9IFNwYWNlU3RvcmUuaW5zdGFuY2UuYWN0aXZlU3BhY2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHN0b3JlOiBSb29tTGlzdFN0b3JlQ2xhc3MpIHtcbiAgICAgICAgdGhpcy51cGRhdGVGaWx0ZXIoKTsgLy8gZ2V0IHRoZSBmaWx0ZXIgaW50byBhIGNvbnNpc3RlbnQgc3RhdGVcbiAgICAgICAgc3RvcmUuYWRkRmlsdGVyKHRoaXMuZmlsdGVyKTtcbiAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfU0VMRUNURURfU1BBQ0UsIHRoaXMub25TZWxlY3RlZFNwYWNlVXBkYXRlZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlbGVjdGVkU3BhY2VVcGRhdGVkID0gKGFjdGl2ZVNwYWNlOiBSb29tKSA9PiB7XG4gICAgICAgIHRoaXMuYWN0aXZlU3BhY2UgPSBhY3RpdmVTcGFjZTtcbiAgICAgICAgdGhpcy51cGRhdGVGaWx0ZXIoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVGaWx0ZXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVNwYWNlKSB7XG4gICAgICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLnRyYXZlcnNlU3BhY2UodGhpcy5hY3RpdmVTcGFjZS5yb29tSWQsIHJvb21JZCA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9yZS5tYXRyaXhDbGllbnQ/LmdldFJvb20ocm9vbUlkKT8ubG9hZE1lbWJlcnNJZk5lZWRlZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maWx0ZXIudXBkYXRlU3BhY2UodGhpcy5hY3RpdmVTcGFjZSk7XG4gICAgfTtcbn1cbiJdfQ==
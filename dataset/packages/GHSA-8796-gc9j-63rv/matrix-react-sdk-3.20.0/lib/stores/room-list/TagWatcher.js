"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TagWatcher = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _GroupFilterOrderStore = _interopRequireDefault(require("../GroupFilterOrderStore"));

var _CommunityFilterCondition = require("./filters/CommunityFilterCondition");

var _arrays = require("../../utils/arrays");

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
 * Watches for changes in groups to manage filters on the provided RoomListStore
 */
class TagWatcher {
  constructor(store
  /*: RoomListStoreClass*/
  ) {
    this.store
    /*:: */
    = store
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "filters", new Map());
    (0, _defineProperty2.default)(this, "onTagsUpdated", () => {
      const lastTags = Array.from(this.filters.keys());

      const newTags = _GroupFilterOrderStore.default.getSelectedTags();

      if ((0, _arrays.arrayHasDiff)(lastTags, newTags)) {
        // Selected tags changed, do some filtering
        if (!this.store.matrixClient) {
          console.warn("Tag update without an associated matrix client - ignoring");
          return;
        }

        const newFilters = new Map();
        const filterableTags = newTags.filter(t => t.startsWith("+"));

        for (const tag of filterableTags) {
          const group = this.store.matrixClient.getGroup(tag);

          if (!group) {
            console.warn(`Group selected with no group object available: ${tag}`);
            continue;
          }

          let filter = this.filters.get(tag);

          if (!filter) {
            filter = new _CommunityFilterCondition.CommunityFilterCondition(group);
          }

          newFilters.set(tag, filter);
        } // Update the room list store's filters


        const diff = (0, _arrays.arrayDiff)(lastTags, newTags);

        for (const tag of diff.added) {
          const filter = newFilters.get(tag);
          if (!filter) continue;
          this.store.addFilter(filter);
        }

        for (const tag of diff.removed) {
          // TODO: Remove this check when custom tags are supported (as we shouldn't be losing filters)
          const filter = this.filters.get(tag);
          if (!filter) continue;
          this.store.removeFilter(filter);
          filter.destroy();
        }

        this.filters = newFilters;
      }
    });

    _GroupFilterOrderStore.default.addListener(this.onTagsUpdated);
  }

}

exports.TagWatcher = TagWatcher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L1RhZ1dhdGNoZXIudHMiXSwibmFtZXMiOlsiVGFnV2F0Y2hlciIsImNvbnN0cnVjdG9yIiwic3RvcmUiLCJNYXAiLCJsYXN0VGFncyIsIkFycmF5IiwiZnJvbSIsImZpbHRlcnMiLCJrZXlzIiwibmV3VGFncyIsIkdyb3VwRmlsdGVyT3JkZXJTdG9yZSIsImdldFNlbGVjdGVkVGFncyIsIm1hdHJpeENsaWVudCIsImNvbnNvbGUiLCJ3YXJuIiwibmV3RmlsdGVycyIsImZpbHRlcmFibGVUYWdzIiwiZmlsdGVyIiwidCIsInN0YXJ0c1dpdGgiLCJ0YWciLCJncm91cCIsImdldEdyb3VwIiwiZ2V0IiwiQ29tbXVuaXR5RmlsdGVyQ29uZGl0aW9uIiwic2V0IiwiZGlmZiIsImFkZGVkIiwiYWRkRmlsdGVyIiwicmVtb3ZlZCIsInJlbW92ZUZpbHRlciIsImRlc3Ryb3kiLCJhZGRMaXN0ZW5lciIsIm9uVGFnc1VwZGF0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBT0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsVUFBTixDQUFpQjtBQUdwQkMsRUFBQUEsV0FBVyxDQUFTQztBQUFUO0FBQUEsSUFBb0M7QUFBQSxTQUEzQkE7QUFBMkI7QUFBQSxNQUEzQkE7QUFBMkI7QUFBQTtBQUFBLG1EQUY3QixJQUFJQyxHQUFKLEVBRTZCO0FBQUEseURBSXZCLE1BQU07QUFDMUIsWUFBTUMsUUFBUSxHQUFHQyxLQUFLLENBQUNDLElBQU4sQ0FBVyxLQUFLQyxPQUFMLENBQWFDLElBQWIsRUFBWCxDQUFqQjs7QUFDQSxZQUFNQyxPQUFPLEdBQUdDLCtCQUFzQkMsZUFBdEIsRUFBaEI7O0FBRUEsVUFBSSwwQkFBYVAsUUFBYixFQUF1QkssT0FBdkIsQ0FBSixFQUFxQztBQUNqQztBQUVBLFlBQUksQ0FBQyxLQUFLUCxLQUFMLENBQVdVLFlBQWhCLEVBQThCO0FBQzFCQyxVQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSwyREFBYjtBQUNBO0FBQ0g7O0FBRUQsY0FBTUMsVUFBVSxHQUFHLElBQUlaLEdBQUosRUFBbkI7QUFDQSxjQUFNYSxjQUFjLEdBQUdQLE9BQU8sQ0FBQ1EsTUFBUixDQUFlQyxDQUFDLElBQUlBLENBQUMsQ0FBQ0MsVUFBRixDQUFhLEdBQWIsQ0FBcEIsQ0FBdkI7O0FBRUEsYUFBSyxNQUFNQyxHQUFYLElBQWtCSixjQUFsQixFQUFrQztBQUM5QixnQkFBTUssS0FBSyxHQUFHLEtBQUtuQixLQUFMLENBQVdVLFlBQVgsQ0FBd0JVLFFBQXhCLENBQWlDRixHQUFqQyxDQUFkOztBQUNBLGNBQUksQ0FBQ0MsS0FBTCxFQUFZO0FBQ1JSLFlBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFjLGtEQUFpRE0sR0FBSSxFQUFuRTtBQUNBO0FBQ0g7O0FBRUQsY0FBSUgsTUFBTSxHQUFHLEtBQUtWLE9BQUwsQ0FBYWdCLEdBQWIsQ0FBaUJILEdBQWpCLENBQWI7O0FBQ0EsY0FBSSxDQUFDSCxNQUFMLEVBQWE7QUFDVEEsWUFBQUEsTUFBTSxHQUFHLElBQUlPLGtEQUFKLENBQTZCSCxLQUE3QixDQUFUO0FBQ0g7O0FBQ0ROLFVBQUFBLFVBQVUsQ0FBQ1UsR0FBWCxDQUFlTCxHQUFmLEVBQW9CSCxNQUFwQjtBQUNILFNBdkJnQyxDQXlCakM7OztBQUNBLGNBQU1TLElBQUksR0FBRyx1QkFBVXRCLFFBQVYsRUFBb0JLLE9BQXBCLENBQWI7O0FBQ0EsYUFBSyxNQUFNVyxHQUFYLElBQWtCTSxJQUFJLENBQUNDLEtBQXZCLEVBQThCO0FBQzFCLGdCQUFNVixNQUFNLEdBQUdGLFVBQVUsQ0FBQ1EsR0FBWCxDQUFlSCxHQUFmLENBQWY7QUFDQSxjQUFJLENBQUNILE1BQUwsRUFBYTtBQUViLGVBQUtmLEtBQUwsQ0FBVzBCLFNBQVgsQ0FBcUJYLE1BQXJCO0FBQ0g7O0FBQ0QsYUFBSyxNQUFNRyxHQUFYLElBQWtCTSxJQUFJLENBQUNHLE9BQXZCLEVBQWdDO0FBQzVCO0FBQ0EsZ0JBQU1aLE1BQU0sR0FBRyxLQUFLVixPQUFMLENBQWFnQixHQUFiLENBQWlCSCxHQUFqQixDQUFmO0FBQ0EsY0FBSSxDQUFDSCxNQUFMLEVBQWE7QUFFYixlQUFLZixLQUFMLENBQVc0QixZQUFYLENBQXdCYixNQUF4QjtBQUNBQSxVQUFBQSxNQUFNLENBQUNjLE9BQVA7QUFDSDs7QUFFRCxhQUFLeEIsT0FBTCxHQUFlUSxVQUFmO0FBQ0g7QUFDSixLQXBEOEM7O0FBQzNDTCxtQ0FBc0JzQixXQUF0QixDQUFrQyxLQUFLQyxhQUF2QztBQUNIOztBQUxtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IFJvb21MaXN0U3RvcmVDbGFzcyB9IGZyb20gXCIuL1Jvb21MaXN0U3RvcmVcIjtcbmltcG9ydCBHcm91cEZpbHRlck9yZGVyU3RvcmUgZnJvbSBcIi4uL0dyb3VwRmlsdGVyT3JkZXJTdG9yZVwiO1xuaW1wb3J0IHsgQ29tbXVuaXR5RmlsdGVyQ29uZGl0aW9uIH0gZnJvbSBcIi4vZmlsdGVycy9Db21tdW5pdHlGaWx0ZXJDb25kaXRpb25cIjtcbmltcG9ydCB7IGFycmF5RGlmZiwgYXJyYXlIYXNEaWZmIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2FycmF5c1wiO1xuXG4vKipcbiAqIFdhdGNoZXMgZm9yIGNoYW5nZXMgaW4gZ3JvdXBzIHRvIG1hbmFnZSBmaWx0ZXJzIG9uIHRoZSBwcm92aWRlZCBSb29tTGlzdFN0b3JlXG4gKi9cbmV4cG9ydCBjbGFzcyBUYWdXYXRjaGVyIHtcbiAgICBwcml2YXRlIGZpbHRlcnMgPSBuZXcgTWFwPHN0cmluZywgQ29tbXVuaXR5RmlsdGVyQ29uZGl0aW9uPigpO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBzdG9yZTogUm9vbUxpc3RTdG9yZUNsYXNzKSB7XG4gICAgICAgIEdyb3VwRmlsdGVyT3JkZXJTdG9yZS5hZGRMaXN0ZW5lcih0aGlzLm9uVGFnc1VwZGF0ZWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25UYWdzVXBkYXRlZCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbGFzdFRhZ3MgPSBBcnJheS5mcm9tKHRoaXMuZmlsdGVycy5rZXlzKCkpO1xuICAgICAgICBjb25zdCBuZXdUYWdzID0gR3JvdXBGaWx0ZXJPcmRlclN0b3JlLmdldFNlbGVjdGVkVGFncygpO1xuXG4gICAgICAgIGlmIChhcnJheUhhc0RpZmYobGFzdFRhZ3MsIG5ld1RhZ3MpKSB7XG4gICAgICAgICAgICAvLyBTZWxlY3RlZCB0YWdzIGNoYW5nZWQsIGRvIHNvbWUgZmlsdGVyaW5nXG5cbiAgICAgICAgICAgIGlmICghdGhpcy5zdG9yZS5tYXRyaXhDbGllbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUYWcgdXBkYXRlIHdpdGhvdXQgYW4gYXNzb2NpYXRlZCBtYXRyaXggY2xpZW50IC0gaWdub3JpbmdcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBuZXdGaWx0ZXJzID0gbmV3IE1hcDxzdHJpbmcsIENvbW11bml0eUZpbHRlckNvbmRpdGlvbj4oKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmFibGVUYWdzID0gbmV3VGFncy5maWx0ZXIodCA9PiB0LnN0YXJ0c1dpdGgoXCIrXCIpKTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgZmlsdGVyYWJsZVRhZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBncm91cCA9IHRoaXMuc3RvcmUubWF0cml4Q2xpZW50LmdldEdyb3VwKHRhZyk7XG4gICAgICAgICAgICAgICAgaWYgKCFncm91cCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEdyb3VwIHNlbGVjdGVkIHdpdGggbm8gZ3JvdXAgb2JqZWN0IGF2YWlsYWJsZTogJHt0YWd9YCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBmaWx0ZXIgPSB0aGlzLmZpbHRlcnMuZ2V0KHRhZyk7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gbmV3IENvbW11bml0eUZpbHRlckNvbmRpdGlvbihncm91cCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld0ZpbHRlcnMuc2V0KHRhZywgZmlsdGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByb29tIGxpc3Qgc3RvcmUncyBmaWx0ZXJzXG4gICAgICAgICAgICBjb25zdCBkaWZmID0gYXJyYXlEaWZmKGxhc3RUYWdzLCBuZXdUYWdzKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGRpZmYuYWRkZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXIgPSBuZXdGaWx0ZXJzLmdldCh0YWcpO1xuICAgICAgICAgICAgICAgIGlmICghZmlsdGVyKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmUuYWRkRmlsdGVyKGZpbHRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBkaWZmLnJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgdGhpcyBjaGVjayB3aGVuIGN1c3RvbSB0YWdzIGFyZSBzdXBwb3J0ZWQgKGFzIHdlIHNob3VsZG4ndCBiZSBsb3NpbmcgZmlsdGVycylcbiAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXIgPSB0aGlzLmZpbHRlcnMuZ2V0KHRhZyk7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWx0ZXIpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9yZS5yZW1vdmVGaWx0ZXIoZmlsdGVyKTtcbiAgICAgICAgICAgICAgICBmaWx0ZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmZpbHRlcnMgPSBuZXdGaWx0ZXJzO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapDiff = mapDiff;
exports.mapKeyChanges = mapKeyChanges;
exports.EnhancedMap = void 0;

var _arrays = require("./arrays");

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
 * Determines the keys added, changed, and removed between two Maps.
 * For changes, simple triple equal comparisons are done, not in-depth tree checking.
 * @param a The first Map. Must be defined.
 * @param b The second Map. Must be defined.
 * @returns The difference between the keys of each Map.
 */
function mapDiff
/*:: <K, V>*/
(a
/*: Map<K, V>*/
, b
/*: Map<K, V>*/
)
/*: { changed: K[], added: K[], removed: K[] }*/
{
  const aKeys = [...a.keys()];
  const bKeys = [...b.keys()];
  const keyDiff = (0, _arrays.arrayDiff)(aKeys, bKeys);
  const possibleChanges = (0, _arrays.arrayUnion)(aKeys, bKeys);
  const changes = possibleChanges.filter(k => a.get(k) !== b.get(k));
  return {
    changed: changes,
    added: keyDiff.added,
    removed: keyDiff.removed
  };
}
/**
 * Gets all the key changes (added, removed, or value difference) between two Maps.
 * Triple equals is used to compare values, not in-depth tree checking.
 * @param a The first Map. Must be defined.
 * @param b The second Map. Must be defined.
 * @returns The keys which have been added, removed, or changed between the two Maps.
 */


function mapKeyChanges
/*:: <K, V>*/
(a
/*: Map<K, V>*/
, b
/*: Map<K, V>*/
)
/*: K[]*/
{
  const diff = mapDiff(a, b);
  return (0, _arrays.arrayMerge)(diff.removed, diff.added, diff.changed);
}
/**
 * A Map<K, V> with added utility.
 */


class EnhancedMap
/*:: <K, V>*/
extends Map
/*:: <K, V>*/
{
  constructor(entries
  /*: Iterable<[K, V]>*/
  ) {
    super(entries);
  }

  getOrCreate(key
  /*: K*/
  , def
  /*: V*/
  )
  /*: V*/
  {
    if (this.has(key)) {
      return this.get(key);
    }

    this.set(key, def);
    return def;
  }

  remove(key
  /*: K*/
  )
  /*: V*/
  {
    const v = this.get(key);
    this.delete(key);
    return v;
  }

}

exports.EnhancedMap = EnhancedMap;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tYXBzLnRzIl0sIm5hbWVzIjpbIm1hcERpZmYiLCJhIiwiYiIsImFLZXlzIiwia2V5cyIsImJLZXlzIiwia2V5RGlmZiIsInBvc3NpYmxlQ2hhbmdlcyIsImNoYW5nZXMiLCJmaWx0ZXIiLCJrIiwiZ2V0IiwiY2hhbmdlZCIsImFkZGVkIiwicmVtb3ZlZCIsIm1hcEtleUNoYW5nZXMiLCJkaWZmIiwiRW5oYW5jZWRNYXAiLCJNYXAiLCJjb25zdHJ1Y3RvciIsImVudHJpZXMiLCJnZXRPckNyZWF0ZSIsImtleSIsImRlZiIsImhhcyIsInNldCIsInJlbW92ZSIsInYiLCJkZWxldGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sU0FBU0E7QUFBVDtBQUFBLENBQXVCQztBQUF2QjtBQUFBLEVBQXFDQztBQUFyQztBQUFBO0FBQUE7QUFBK0Y7QUFDbEcsUUFBTUMsS0FBSyxHQUFHLENBQUMsR0FBR0YsQ0FBQyxDQUFDRyxJQUFGLEVBQUosQ0FBZDtBQUNBLFFBQU1DLEtBQUssR0FBRyxDQUFDLEdBQUdILENBQUMsQ0FBQ0UsSUFBRixFQUFKLENBQWQ7QUFDQSxRQUFNRSxPQUFPLEdBQUcsdUJBQVVILEtBQVYsRUFBaUJFLEtBQWpCLENBQWhCO0FBQ0EsUUFBTUUsZUFBZSxHQUFHLHdCQUFXSixLQUFYLEVBQWtCRSxLQUFsQixDQUF4QjtBQUNBLFFBQU1HLE9BQU8sR0FBR0QsZUFBZSxDQUFDRSxNQUFoQixDQUF1QkMsQ0FBQyxJQUFJVCxDQUFDLENBQUNVLEdBQUYsQ0FBTUQsQ0FBTixNQUFhUixDQUFDLENBQUNTLEdBQUYsQ0FBTUQsQ0FBTixDQUF6QyxDQUFoQjtBQUVBLFNBQU87QUFBQ0UsSUFBQUEsT0FBTyxFQUFFSixPQUFWO0FBQW1CSyxJQUFBQSxLQUFLLEVBQUVQLE9BQU8sQ0FBQ08sS0FBbEM7QUFBeUNDLElBQUFBLE9BQU8sRUFBRVIsT0FBTyxDQUFDUTtBQUExRCxHQUFQO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ08sU0FBU0M7QUFBVDtBQUFBLENBQTZCZDtBQUE3QjtBQUFBLEVBQTJDQztBQUEzQztBQUFBO0FBQUE7QUFBOEQ7QUFDakUsUUFBTWMsSUFBSSxHQUFHaEIsT0FBTyxDQUFDQyxDQUFELEVBQUlDLENBQUosQ0FBcEI7QUFDQSxTQUFPLHdCQUFXYyxJQUFJLENBQUNGLE9BQWhCLEVBQXlCRSxJQUFJLENBQUNILEtBQTlCLEVBQXFDRyxJQUFJLENBQUNKLE9BQTFDLENBQVA7QUFDSDtBQUVEO0FBQ0E7QUFDQTs7O0FBQ08sTUFBTUs7QUFBTjtBQUFBLFFBQWdDQztBQUFoQztBQUEwQztBQUN0Q0MsRUFBQUEsV0FBUCxDQUFtQkM7QUFBbkI7QUFBQSxJQUErQztBQUMzQyxVQUFNQSxPQUFOO0FBQ0g7O0FBRU1DLEVBQUFBLFdBQVAsQ0FBbUJDO0FBQW5CO0FBQUEsSUFBMkJDO0FBQTNCO0FBQUE7QUFBQTtBQUFzQztBQUNsQyxRQUFJLEtBQUtDLEdBQUwsQ0FBU0YsR0FBVCxDQUFKLEVBQW1CO0FBQ2YsYUFBTyxLQUFLWCxHQUFMLENBQVNXLEdBQVQsQ0FBUDtBQUNIOztBQUNELFNBQUtHLEdBQUwsQ0FBU0gsR0FBVCxFQUFjQyxHQUFkO0FBQ0EsV0FBT0EsR0FBUDtBQUNIOztBQUVNRyxFQUFBQSxNQUFQLENBQWNKO0FBQWQ7QUFBQTtBQUFBO0FBQXlCO0FBQ3JCLFVBQU1LLENBQUMsR0FBRyxLQUFLaEIsR0FBTCxDQUFTVyxHQUFULENBQVY7QUFDQSxTQUFLTSxNQUFMLENBQVlOLEdBQVo7QUFDQSxXQUFPSyxDQUFQO0FBQ0g7O0FBakI0QyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGFycmF5RGlmZiwgYXJyYXlNZXJnZSwgYXJyYXlVbmlvbiB9IGZyb20gXCIuL2FycmF5c1wiO1xuXG4vKipcbiAqIERldGVybWluZXMgdGhlIGtleXMgYWRkZWQsIGNoYW5nZWQsIGFuZCByZW1vdmVkIGJldHdlZW4gdHdvIE1hcHMuXG4gKiBGb3IgY2hhbmdlcywgc2ltcGxlIHRyaXBsZSBlcXVhbCBjb21wYXJpc29ucyBhcmUgZG9uZSwgbm90IGluLWRlcHRoIHRyZWUgY2hlY2tpbmcuXG4gKiBAcGFyYW0gYSBUaGUgZmlyc3QgTWFwLiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcGFyYW0gYiBUaGUgc2Vjb25kIE1hcC4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHJldHVybnMgVGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUga2V5cyBvZiBlYWNoIE1hcC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcERpZmY8SywgVj4oYTogTWFwPEssIFY+LCBiOiBNYXA8SywgVj4pOiB7IGNoYW5nZWQ6IEtbXSwgYWRkZWQ6IEtbXSwgcmVtb3ZlZDogS1tdIH0ge1xuICAgIGNvbnN0IGFLZXlzID0gWy4uLmEua2V5cygpXTtcbiAgICBjb25zdCBiS2V5cyA9IFsuLi5iLmtleXMoKV07XG4gICAgY29uc3Qga2V5RGlmZiA9IGFycmF5RGlmZihhS2V5cywgYktleXMpO1xuICAgIGNvbnN0IHBvc3NpYmxlQ2hhbmdlcyA9IGFycmF5VW5pb24oYUtleXMsIGJLZXlzKTtcbiAgICBjb25zdCBjaGFuZ2VzID0gcG9zc2libGVDaGFuZ2VzLmZpbHRlcihrID0+IGEuZ2V0KGspICE9PSBiLmdldChrKSk7XG5cbiAgICByZXR1cm4ge2NoYW5nZWQ6IGNoYW5nZXMsIGFkZGVkOiBrZXlEaWZmLmFkZGVkLCByZW1vdmVkOiBrZXlEaWZmLnJlbW92ZWR9O1xufVxuXG4vKipcbiAqIEdldHMgYWxsIHRoZSBrZXkgY2hhbmdlcyAoYWRkZWQsIHJlbW92ZWQsIG9yIHZhbHVlIGRpZmZlcmVuY2UpIGJldHdlZW4gdHdvIE1hcHMuXG4gKiBUcmlwbGUgZXF1YWxzIGlzIHVzZWQgdG8gY29tcGFyZSB2YWx1ZXMsIG5vdCBpbi1kZXB0aCB0cmVlIGNoZWNraW5nLlxuICogQHBhcmFtIGEgVGhlIGZpcnN0IE1hcC4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHBhcmFtIGIgVGhlIHNlY29uZCBNYXAuIE11c3QgYmUgZGVmaW5lZC5cbiAqIEByZXR1cm5zIFRoZSBrZXlzIHdoaWNoIGhhdmUgYmVlbiBhZGRlZCwgcmVtb3ZlZCwgb3IgY2hhbmdlZCBiZXR3ZWVuIHRoZSB0d28gTWFwcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcEtleUNoYW5nZXM8SywgVj4oYTogTWFwPEssIFY+LCBiOiBNYXA8SywgVj4pOiBLW10ge1xuICAgIGNvbnN0IGRpZmYgPSBtYXBEaWZmKGEsIGIpO1xuICAgIHJldHVybiBhcnJheU1lcmdlKGRpZmYucmVtb3ZlZCwgZGlmZi5hZGRlZCwgZGlmZi5jaGFuZ2VkKTtcbn1cblxuLyoqXG4gKiBBIE1hcDxLLCBWPiB3aXRoIGFkZGVkIHV0aWxpdHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBFbmhhbmNlZE1hcDxLLCBWPiBleHRlbmRzIE1hcDxLLCBWPiB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGVudHJpZXM/OiBJdGVyYWJsZTxbSywgVl0+KSB7XG4gICAgICAgIHN1cGVyKGVudHJpZXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRPckNyZWF0ZShrZXk6IEssIGRlZjogVik6IFYge1xuICAgICAgICBpZiAodGhpcy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoa2V5LCBkZWYpO1xuICAgICAgICByZXR1cm4gZGVmO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmUoa2V5OiBLKTogViB7XG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmdldChrZXkpO1xuICAgICAgICB0aGlzLmRlbGV0ZShrZXkpO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG59XG4iXX0=
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayFastClone = arrayFastClone;
exports.arrayHasOrderChange = arrayHasOrderChange;
exports.arrayHasDiff = arrayHasDiff;
exports.arrayDiff = arrayDiff;
exports.arrayUnion = arrayUnion;
exports.arrayMerge = arrayMerge;
exports.GroupedArray = exports.ArrayUtil = void 0;

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
 * Clones an array as fast as possible, retaining references of the array's values.
 * @param a The array to clone. Must be defined.
 * @returns A copy of the array.
 */
function arrayFastClone(a
/*: any[]*/
)
/*: any[]*/
{
  return a.slice(0, a.length);
}
/**
 * Determines if the two arrays are different either in length, contents,
 * or order of those contents.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns True if they are different, false otherwise.
 */


function arrayHasOrderChange(a
/*: any[]*/
, b
/*: any[]*/
)
/*: boolean*/
{
  if (a.length === b.length) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return true;
    }

    return false;
  } else {
    return true; // like arrayHasDiff, a difference in length is a natural change
  }
}
/**
 * Determines if two arrays are different through a shallow comparison.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns True if they are different, false otherwise.
 */


function arrayHasDiff(a
/*: any[]*/
, b
/*: any[]*/
)
/*: boolean*/
{
  if (a.length === b.length) {
    // When the lengths are equal, check to see if either array is missing
    // an element from the other.
    if (b.some(i => !a.includes(i))) return true;
    if (a.some(i => !b.includes(i))) return true; // if all the keys are common, say so

    return false;
  } else {
    return true; // different lengths means they are naturally diverged
  }
}
/**
 * Performs a diff on two arrays. The result is what is different with the
 * first array (`added` in the returned object means objects in B that aren't
 * in A). Shallow comparisons are used to perform the diff.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns The diff between the arrays.
 */


function arrayDiff
/*:: <T>*/
(a
/*: T[]*/
, b
/*: T[]*/
)
/*: { added: T[], removed: T[] }*/
{
  return {
    added: b.filter(i => !a.includes(i)),
    removed: a.filter(i => !b.includes(i))
  };
}
/**
 * Returns the union of two arrays.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns The union of the arrays.
 */


function arrayUnion
/*:: <T>*/
(a
/*: T[]*/
, b
/*: T[]*/
)
/*: T[]*/
{
  return a.filter(i => b.includes(i));
}
/**
 * Merges arrays, deduping contents using a Set.
 * @param a The arrays to merge.
 * @returns The merged array.
 */


function arrayMerge
/*:: <T>*/
(...a)
/*: T[]*/
{
  return Array.from(a.reduce((c, v) => {
    v.forEach(i => c.add(i));
    return c;
  }, new Set()));
}
/**
 * Helper functions to perform LINQ-like queries on arrays.
 */


class ArrayUtil
/*:: <T>*/
{
  /**
   * Create a new array helper.
   * @param a The array to help. Can be modified in-place.
   */
  constructor(a
  /*: T[]*/
  ) {
    this.a
    /*:: */
    = a
    /*:: */
    ;
  }
  /**
   * The value of this array, after all appropriate alterations.
   */


  get value()
  /*: T[]*/
  {
    return this.a;
  }
  /**
   * Groups an array by keys.
   * @param fn The key-finding function.
   * @returns This.
   */


  groupBy(fn
  /*: (a: T) => K*/
  )
  /*: GroupedArray<K, T>*/
  {
    const obj = this.a.reduce((rv
    /*: Map<K, T[]>*/
    , val
    /*: T*/
    ) => {
      const k = fn(val);
      if (!rv.has(k)) rv.set(k, []);
      rv.get(k).push(val);
      return rv;
    }, new Map());
    return new GroupedArray(obj);
  }

}
/**
 * Helper functions to perform LINQ-like queries on groups (maps).
 */


exports.ArrayUtil = ArrayUtil;

class GroupedArray
/*:: <K, T>*/
{
  /**
   * Creates a new group helper.
   * @param val The group to help. Can be modified in-place.
   */
  constructor(val
  /*: Map<K, T[]>*/
  ) {
    this.val
    /*:: */
    = val
    /*:: */
    ;
  }
  /**
   * Orders the grouping into an array using the provided key order.
   * @param keyOrder The key order.
   * @returns An array helper of the result.
   */


  orderBy(keyOrder
  /*: K[]*/
  )
  /*: ArrayUtil<T>*/
  {
    const a
    /*: T[]*/
    = [];

    for (const k of keyOrder) {
      if (!this.val.has(k)) continue;
      a.push(...this.val.get(k));
    }

    return new ArrayUtil(a);
  }

}

exports.GroupedArray = GroupedArray;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9hcnJheXMudHMiXSwibmFtZXMiOlsiYXJyYXlGYXN0Q2xvbmUiLCJhIiwic2xpY2UiLCJsZW5ndGgiLCJhcnJheUhhc09yZGVyQ2hhbmdlIiwiYiIsImkiLCJhcnJheUhhc0RpZmYiLCJzb21lIiwiaW5jbHVkZXMiLCJhcnJheURpZmYiLCJhZGRlZCIsImZpbHRlciIsInJlbW92ZWQiLCJhcnJheVVuaW9uIiwiYXJyYXlNZXJnZSIsIkFycmF5IiwiZnJvbSIsInJlZHVjZSIsImMiLCJ2IiwiZm9yRWFjaCIsImFkZCIsIlNldCIsIkFycmF5VXRpbCIsImNvbnN0cnVjdG9yIiwidmFsdWUiLCJncm91cEJ5IiwiZm4iLCJvYmoiLCJydiIsInZhbCIsImsiLCJoYXMiLCJzZXQiLCJnZXQiLCJwdXNoIiwiTWFwIiwiR3JvdXBlZEFycmF5Iiwib3JkZXJCeSIsImtleU9yZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxTQUFTQSxjQUFULENBQXdCQztBQUF4QjtBQUFBO0FBQUE7QUFBeUM7QUFDNUMsU0FBT0EsQ0FBQyxDQUFDQyxLQUFGLENBQVEsQ0FBUixFQUFXRCxDQUFDLENBQUNFLE1BQWIsQ0FBUDtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLFNBQVNDLG1CQUFULENBQTZCSDtBQUE3QjtBQUFBLEVBQXVDSTtBQUF2QztBQUFBO0FBQUE7QUFBMEQ7QUFDN0QsTUFBSUosQ0FBQyxDQUFDRSxNQUFGLEtBQWFFLENBQUMsQ0FBQ0YsTUFBbkIsRUFBMkI7QUFDdkIsU0FBSyxJQUFJRyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHTCxDQUFDLENBQUNFLE1BQXRCLEVBQThCRyxDQUFDLEVB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NkI7QUFDbkQsWUFBTUMsQ0FBQyxHQUFHSixFQUFFLENBQUNHLEdBQUQsQ0FBWjtBQUNBLFVBQUksQ0FBQ0QsRUFBRSxDQUFDRyxHQUFILENBQU9ELENBQVAsQ0FBTCxFQUFnQkYsRUFBRSxDQUFDSSxHQUFILENBQU9GLENBQVAsRUFBVSxFQUFWO0FBQ2hCRixNQUFBQSxFQUFFLENBQUNLLEdBQUgsQ0FBT0gsQ0FBUCxFQUFVSSxJQUFWLENBQWVMLEdBQWY7QUFDQSxhQUFPRCxFQUFQO0FBQ0gsS0FMVyxFQUtULElBQUlPLEdBQUosRUFMUyxDQUFaO0FBTUEsV0FBTyxJQUFJQyxZQUFKLENBQWlCVCxHQUFqQixDQUFQO0FBQ0g7O0FBNUJxQjtBQStCMUI7QUFDQTtBQUNBOzs7OztBQUNPLE1BQU1TO0FBQU47QUFBeUI7QUFDNUI7QUFDSjtBQUNBO0FBQ0E7QUFDSWIsRUFBQUEsV0FBVyxDQUFTTTtBQUFUO0FBQUEsSUFBMkI7QUFBQSxTQUFsQkE7QUFBa0I7QUFBQSxNQUFsQkE7QUFBa0I7QUFBQTtBQUNyQztBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztBQUNXUSxFQUFBQSxPQUFQLENBQWVDO0FBQWY7QUFBQTtBQUFBO0FBQTRDO0FBQ3hDLFVBQU12QztBQUFNO0FBQUEsTUFBRyxFQUFmOztBQUNBLFNBQUssTUFBTStCLENBQVgsSUFBZ0JRLFFBQWhCLEVBQTBCO0FBQ3RCLFVBQUksQ0FBQyxLQUFLVCxHQUFMLENBQVNFLEdBQVQsQ0FBYUQsQ0FBYixDQUFMLEVBQXNCO0FBQ3RCL0IsTUFBQUEsQ0FBQyxDQUFDbUMsSUFBRixDQUFPLEdBQUcsS0FBS0wsR0FBTCxDQUFTSSxHQUFULENBQWFILENBQWIsQ0FBVjtBQUNIOztBQUNELFdBQU8sSUFBSVIsU0FBSixDQUFjdkIsQ0FBZCxDQUFQO0FBQ0g7O0FBcEIyQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8qKlxuICogQ2xvbmVzIGFuIGFycmF5IGFzIGZhc3QgYXMgcG9zc2libGUsIHJldGFpbmluZyByZWZlcmVuY2VzIG9mIHRoZSBhcnJheSdzIHZhbHVlcy5cbiAqIEBwYXJhbSBhIFRoZSBhcnJheSB0byBjbG9uZS4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHJldHVybnMgQSBjb3B5IG9mIHRoZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RmFzdENsb25lKGE6IGFueVtdKTogYW55W10ge1xuICAgIHJldHVybiBhLnNsaWNlKDAsIGEubGVuZ3RoKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSB0d28gYXJyYXlzIGFyZSBkaWZmZXJlbnQgZWl0aGVyIGluIGxlbmd0aCwgY29udGVudHMsXG4gKiBvciBvcmRlciBvZiB0aG9zZSBjb250ZW50cy5cbiAqIEBwYXJhbSBhIFRoZSBmaXJzdCBhcnJheS4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHBhcmFtIGIgVGhlIHNlY29uZCBhcnJheS4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGV5IGFyZSBkaWZmZXJlbnQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5SGFzT3JkZXJDaGFuZ2UoYTogYW55W10sIGI6IGFueVtdKTogYm9vbGVhbiB7XG4gICAgaWYgKGEubGVuZ3RoID09PSBiLmxlbmd0aCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIGxpa2UgYXJyYXlIYXNEaWZmLCBhIGRpZmZlcmVuY2UgaW4gbGVuZ3RoIGlzIGEgbmF0dXJhbCBjaGFuZ2VcbiAgICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0d28gYXJyYXlzIGFyZSBkaWZmZXJlbnQgdGhyb3VnaCBhIHNoYWxsb3cgY29tcGFyaXNvbi5cbiAqIEBwYXJhbSBhIFRoZSBmaXJzdCBhcnJheS4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHBhcmFtIGIgVGhlIHNlY29uZCBhcnJheS4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGV5IGFyZSBkaWZmZXJlbnQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5SGFzRGlmZihhOiBhbnlbXSwgYjogYW55W10pOiBib29sZWFuIHtcbiAgICBpZiAoYS5sZW5ndGggPT09IGIubGVuZ3RoKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGxlbmd0aHMgYXJlIGVxdWFsLCBjaGVjayB0byBzZWUgaWYgZWl0aGVyIGFycmF5IGlzIG1pc3NpbmdcbiAgICAgICAgLy8gYW4gZWxlbWVudCBmcm9tIHRoZSBvdGhlci5cbiAgICAgICAgaWYgKGIuc29tZShpID0+ICFhLmluY2x1ZGVzKGkpKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChhLnNvbWUoaSA9PiAhYi5pbmNsdWRlcyhpKSkpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIGlmIGFsbCB0aGUga2V5cyBhcmUgY29tbW9uLCBzYXkgc29cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBkaWZmZXJlbnQgbGVuZ3RocyBtZWFucyB0aGV5IGFyZSBuYXR1cmFsbHkgZGl2ZXJnZWRcbiAgICB9XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBkaWZmIG9uIHR3byBhcnJheXMuIFRoZSByZXN1bHQgaXMgd2hhdCBpcyBkaWZmZXJlbnQgd2l0aCB0aGVcbiAqIGZpcnN0IGFycmF5IChgYWRkZWRgIGluIHRoZSByZXR1cm5lZCBvYmplY3QgbWVhbnMgb2JqZWN0cyBpbiBCIHRoYXQgYXJlbid0XG4gKiBpbiBBKS4gU2hhbGxvdyBjb21wYXJpc29ucyBhcmUgdXNlZCB0byBwZXJmb3JtIHRoZSBkaWZmLlxuICogQHBhcmFtIGEgVGhlIGZpcnN0IGFycmF5LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcGFyYW0gYiBUaGUgc2Vjb25kIGFycmF5LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcmV0dXJucyBUaGUgZGlmZiBiZXR3ZWVuIHRoZSBhcnJheXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheURpZmY8VD4oYTogVFtdLCBiOiBUW10pOiB7IGFkZGVkOiBUW10sIHJlbW92ZWQ6IFRbXSB9IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhZGRlZDogYi5maWx0ZXIoaSA9PiAhYS5pbmNsdWRlcyhpKSksXG4gICAgICAgIHJlbW92ZWQ6IGEuZmlsdGVyKGkgPT4gIWIuaW5jbHVkZXMoaSkpLFxuICAgIH07XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdW5pb24gb2YgdHdvIGFycmF5cy5cbiAqIEBwYXJhbSBhIFRoZSBmaXJzdCBhcnJheS4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHBhcmFtIGIgVGhlIHNlY29uZCBhcnJheS4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHJldHVybnMgVGhlIHVuaW9uIG9mIHRoZSBhcnJheXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheVVuaW9uPFQ+KGE6IFRbXSwgYjogVFtdKTogVFtdIHtcbiAgICByZXR1cm4gYS5maWx0ZXIoaSA9PiBiLmluY2x1ZGVzKGkpKTtcbn1cblxuLyoqXG4gKiBNZXJnZXMgYXJyYXlzLCBkZWR1cGluZyBjb250ZW50cyB1c2luZyBhIFNldC5cbiAqIEBwYXJhbSBhIFRoZSBhcnJheXMgdG8gbWVyZ2UuXG4gKiBAcmV0dXJucyBUaGUgbWVyZ2VkIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlNZXJnZTxUPiguLi5hOiBUW11bXSk6IFRbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oYS5yZWR1Y2UoKGMsIHYpID0+IHtcbiAgICAgICAgdi5mb3JFYWNoKGkgPT4gYy5hZGQoaSkpO1xuICAgICAgICByZXR1cm4gYztcbiAgICB9LCBuZXcgU2V0PFQ+KCkpKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb25zIHRvIHBlcmZvcm0gTElOUS1saWtlIHF1ZXJpZXMgb24gYXJyYXlzLlxuICovXG5leHBvcnQgY2xhc3MgQXJyYXlVdGlsPFQ+IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgYXJyYXkgaGVscGVyLlxuICAgICAqIEBwYXJhbSBhIFRoZSBhcnJheSB0byBoZWxwLiBDYW4gYmUgbW9kaWZpZWQgaW4tcGxhY2UuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBhOiBUW10pIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgdmFsdWUgb2YgdGhpcyBhcnJheSwgYWZ0ZXIgYWxsIGFwcHJvcHJpYXRlIGFsdGVyYXRpb25zLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgdmFsdWUoKTogVFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHcm91cHMgYW4gYXJyYXkgYnkga2V5cy5cbiAgICAgKiBAcGFyYW0gZm4gVGhlIGtleS1maW5kaW5nIGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIFRoaXMuXG4gICAgICovXG4gICAgcHVibGljIGdyb3VwQnk8Sz4oZm46IChhOiBUKSA9PiBLKTogR3JvdXBlZEFycmF5PEssIFQ+IHtcbiAgICAgICAgY29uc3Qgb2JqID0gdGhpcy5hLnJlZHVjZSgocnY6IE1hcDxLLCBUW10+LCB2YWw6IFQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGsgPSBmbih2YWwpO1xuICAgICAgICAgICAgaWYgKCFydi5oYXMoaykpIHJ2LnNldChrLCBbXSk7XG4gICAgICAgICAgICBydi5nZXQoaykucHVzaCh2YWwpO1xuICAgICAgICAgICAgcmV0dXJuIHJ2O1xuICAgICAgICB9LCBuZXcgTWFwPEssIFRbXT4oKSk7XG4gICAgICAgIHJldHVybiBuZXcgR3JvdXBlZEFycmF5KG9iaik7XG4gICAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbnMgdG8gcGVyZm9ybSBMSU5RLWxpa2UgcXVlcmllcyBvbiBncm91cHMgKG1hcHMpLlxuICovXG5leHBvcnQgY2xhc3MgR3JvdXBlZEFycmF5PEssIFQ+IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGdyb3VwIGhlbHBlci5cbiAgICAgKiBAcGFyYW0gdmFsIFRoZSBncm91cCB0byBoZWxwLiBDYW4gYmUgbW9kaWZpZWQgaW4tcGxhY2UuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB2YWw6IE1hcDxLLCBUW10+KSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3JkZXJzIHRoZSBncm91cGluZyBpbnRvIGFuIGFycmF5IHVzaW5nIHRoZSBwcm92aWRlZCBrZXkgb3JkZXIuXG4gICAgICogQHBhcmFtIGtleU9yZGVyIFRoZSBrZXkgb3JkZXIuXG4gICAgICogQHJldHVybnMgQW4gYXJyYXkgaGVscGVyIG9mIHRoZSByZXN1bHQuXG4gICAgICovXG4gICAgcHVibGljIG9yZGVyQnkoa2V5T3JkZXI6IEtbXSk6IEFycmF5VXRpbDxUPiB7XG4gICAgICAgIGNvbnN0IGE6IFRbXSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGsgb2Yga2V5T3JkZXIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52YWwuaGFzKGspKSBjb250aW51ZTtcbiAgICAgICAgICAgIGEucHVzaCguLi50aGlzLnZhbC5nZXQoaykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXlVdGlsKGEpO1xuICAgIH1cbn1cbiJdfQ==
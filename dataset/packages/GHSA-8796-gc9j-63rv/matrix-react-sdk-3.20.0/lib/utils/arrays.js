"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayFastResample = arrayFastResample;
exports.arraySeed = arraySeed;
exports.arrayTrimFill = arrayTrimFill;
exports.arrayFastClone = arrayFastClone;
exports.arrayHasOrderChange = arrayHasOrderChange;
exports.arrayHasDiff = arrayHasDiff;
exports.arrayDiff = arrayDiff;
exports.arrayUnion = arrayUnion;
exports.arrayMerge = arrayMerge;
exports.GroupedArray = exports.ArrayUtil = void 0;

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
 * Quickly resample an array to have less/more data points. If an input which is larger
 * than the desired size is provided, it will be downsampled. Similarly, if the input
 * is smaller than the desired size then it will be upsampled.
 * @param {number[]} input The input array to resample.
 * @param {number} points The number of samples to end up with.
 * @returns {number[]} The resampled array.
 */
function arrayFastResample(input
/*: number[]*/
, points
/*: number*/
)
/*: number[]*/
{
  if (input.length === points) return input; // short-circuit a complicated call
  // Heavily inspired by matrix-media-repo (used with permission)
  // https://github.com/turt2live/matrix-media-repo/blob/abe72c87d2e29/util/util_audio/fastsample.go#L10

  let samples
  /*: number[]*/
  = [];

  if (input.length > points) {
    // Danger: this loop can cause out of memory conditions if the input is too small.
    const everyNth = Math.round(input.length / points);

    for (let i = 0; i < input.length; i += everyNth) {
      samples.push(input[i]);
    }
  } else {
    // Smaller inputs mean we have to spread the values over the desired length. We
    // end up overshooting the target length in doing this, so we'll resample down
    // before returning. This recursion is risky, but mathematically should not go
    // further than 1 level deep.
    const spreadFactor = Math.ceil(points / input.length);

    for (const val of input) {
      samples.push(...arraySeed(val, spreadFactor));
    }

    samples = arrayFastResample(samples, points);
  } // Sanity fill, just in case


  while (samples.length < points) {
    samples.push(input[input.length - 1]);
  } // Sanity trim, just in case


  if (samples.length > points) {
    samples = samples.slice(0, points);
  }

  return samples;
}
/**
 * Creates an array of the given length, seeded with the given value.
 * @param {T} val The value to seed the array with.
 * @param {number} length The length of the array to create.
 * @returns {T[]} The array.
 */


function arraySeed
/*:: <T>*/
(val
/*: T*/
, length
/*: number*/
)
/*: T[]*/
{
  const a
  /*: T[]*/
  = [];

  for (let i = 0; i < length; i++) {
    a.push(val);
  }

  return a;
}
/**
 * Trims or fills the array to ensure it meets the desired length. The seed array
 * given is pulled from to fill any missing slots - it is recommended that this be
 * at least `len` long. The resulting array will be exactly `len` long, either
 * trimmed from the source or filled with the some/all of the seed array.
 * @param {T[]} a The array to trim/fill.
 * @param {number} len The length to trim or fill to, as needed.
 * @param {T[]} seed Values to pull from if the array needs filling.
 * @returns {T[]} The resulting array of `len` length.
 */


function arrayTrimFill
/*:: <T>*/
(a
/*: T[]*/
, len
/*: number*/
, seed
/*: T[]*/
)
/*: T[]*/
{
  // Dev note: we do length checks because the spread operator can result in some
  // performance penalties in more critical code paths. As a utility, it should be
  // as fast as possible to not cause a problem for the call stack, no matter how
  // critical that stack is.
  if (a.length === len) return a;
  if (a.length > len) return a.slice(0, len);
  return a.concat(seed.slice(0, len - a.length));
}
/**
 * Clones an array as fast as possible, retaining references of the array's values.
 * @param a The array to clone. Must be defined.
 * @returns A copy of the array.
 */


function arrayFastClone
/*:: <T>*/
(a
/*: T[]*/
)
/*: T[]*/
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
   * The value of this group, after all applicable alterations.
   */


  get value()
  /*: Map<K, T[]>*/
  {
    return this.val;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9hcnJheXMudHMiXSwibmFtZXMiOlsiYXJyYXlGYXN0UmVzYW1wbGUiLCJpbnB1dCIsInBvaW50cyIsImxlbmd0aCIsInNhbXBsZXMiLCJldmVyeU50aCIsIk1hdGgiLCJyb3VuZCIsImkiLCJwdXNoIiwic3ByZWFkRmFjdG9yIiwiY2VpbCIsInZhbCIsImFycmF5U2VlZCIsInNsaWNlIiwiYSIsImFycmF5VHJpbUZpbGwiLCJsZW4iLCJzZWVkIiwiY29uY2F0IiwiYXJyYXlGYXN0Q2xvbmUiLCJhcnJheUhhc09yZGVyQ2hhbmdlIiwiYiIsImFycmF5SGFzRGlmZiIsInNvbWUiLCJpbmNsdWRlcyIsImFycmF5RGlmZiIsImFkZGVkIiwiZmlsdGVyIiwicmVtb3ZlZCIsImFycmF5VW5pb24iLCJhcnJheU1lcmdlIiwiQXJyYXkiLCJmcm9tIiwicmVkdWNlIiwiYyIsInYiLCJmb3JFYWNoIiwiYWRkIiwiU2V0IiwiQXJyYXlVdGlsIiwiY29uc3RydWN0b3IiLCJ2YWx1ZSIsImdyb3VwQnkiLCJmbiIsIm9iaiIsInJ2IiwiayIsImhhcyIsInNldCIsImdldCIsIk1hcCIsIkdyb3VwZWRBcnJheSIsIm9yZGVyQnkiLCJrZXlPcmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sU0FBU0EsaUJBQVQsQ0FBMkJDO0FBQTNCO0FBQUEsRUFBNENDO0FBQTVDO0FBQUE7QUFBQTtBQUFzRTtBQUN6RSxNQUFJRCxLQUFLLENBQUNFLE1BQU4sS0FBaUJELE1BQXJCLEVBQTZCLE9BQU9ELEtBQVAsQ0FENEMsQ0FDOUI7QUFFM0M7QUFDQTs7QUFDQSxNQUFJRztBQUFpQjtBQUFBLElBQUcsRUFBeEI7O0FBQ0EsTUFBSUgs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LEdBQVQsQ0FBYUQsQ0FBYixDQUFMLEVBQXNCO0FBQ3RCaEMsTUFBQUEsQ0FBQyxDQUFDTixJQUFGLENBQU8sR0FBRyxLQUFLRyxHQUFMLENBQVNzQyxHQUFULENBQWFILENBQWIsQ0FBVjtBQUNIOztBQUNELFdBQU8sSUFBSVAsU0FBSixDQUFjekIsQ0FBZCxDQUFQO0FBQ0g7O0FBM0IyQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8qKlxuICogUXVpY2tseSByZXNhbXBsZSBhbiBhcnJheSB0byBoYXZlIGxlc3MvbW9yZSBkYXRhIHBvaW50cy4gSWYgYW4gaW5wdXQgd2hpY2ggaXMgbGFyZ2VyXG4gKiB0aGFuIHRoZSBkZXNpcmVkIHNpemUgaXMgcHJvdmlkZWQsIGl0IHdpbGwgYmUgZG93bnNhbXBsZWQuIFNpbWlsYXJseSwgaWYgdGhlIGlucHV0XG4gKiBpcyBzbWFsbGVyIHRoYW4gdGhlIGRlc2lyZWQgc2l6ZSB0aGVuIGl0IHdpbGwgYmUgdXBzYW1wbGVkLlxuICogQHBhcmFtIHtudW1iZXJbXX0gaW5wdXQgVGhlIGlucHV0IGFycmF5IHRvIHJlc2FtcGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IHBvaW50cyBUaGUgbnVtYmVyIG9mIHNhbXBsZXMgdG8gZW5kIHVwIHdpdGguXG4gKiBAcmV0dXJucyB7bnVtYmVyW119IFRoZSByZXNhbXBsZWQgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUZhc3RSZXNhbXBsZShpbnB1dDogbnVtYmVyW10sIHBvaW50czogbnVtYmVyKTogbnVtYmVyW10ge1xuICAgIGlmIChpbnB1dC5sZW5ndGggPT09IHBvaW50cykgcmV0dXJuIGlucHV0OyAvLyBzaG9ydC1jaXJjdWl0IGEgY29tcGxpY2F0ZWQgY2FsbFxuXG4gICAgLy8gSGVhdmlseSBpbnNwaXJlZCBieSBtYXRyaXgtbWVkaWEtcmVwbyAodXNlZCB3aXRoIHBlcm1pc3Npb24pXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3R1cnQybGl2ZS9tYXRyaXgtbWVkaWEtcmVwby9ibG9iL2FiZTcyYzg3ZDJlMjkvdXRpbC91dGlsX2F1ZGlvL2Zhc3RzYW1wbGUuZ28jTDEwXG4gICAgbGV0IHNhbXBsZXM6IG51bWJlcltdID0gW107XG4gICAgaWYgKGlucHV0Lmxlbmd0aCA+IHBvaW50cykge1xuICAgICAgICAvLyBEYW5nZXI6IHRoaXMgbG9vcCBjYW4gY2F1c2Ugb3V0IG9mIG1lbW9yeSBjb25kaXRpb25zIGlmIHRoZSBpbnB1dCBpcyB0b28gc21hbGwuXG4gICAgICAgIGNvbnN0IGV2ZXJ5TnRoID0gTWF0aC5yb3VuZChpbnB1dC5sZW5ndGggLyBwb2ludHMpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSArPSBldmVyeU50aCkge1xuICAgICAgICAgICAgc2FtcGxlcy5wdXNoKGlucHV0W2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNtYWxsZXIgaW5wdXRzIG1lYW4gd2UgaGF2ZSB0byBzcHJlYWQgdGhlIHZhbHVlcyBvdmVyIHRoZSBkZXNpcmVkIGxlbmd0aC4gV2VcbiAgICAgICAgLy8gZW5kIHVwIG92ZXJzaG9vdGluZyB0aGUgdGFyZ2V0IGxlbmd0aCBpbiBkb2luZyB0aGlzLCBzbyB3ZSdsbCByZXNhbXBsZSBkb3duXG4gICAgICAgIC8vIGJlZm9yZSByZXR1cm5pbmcuIFRoaXMgcmVjdXJzaW9uIGlzIHJpc2t5LCBidXQgbWF0aGVtYXRpY2FsbHkgc2hvdWxkIG5vdCBnb1xuICAgICAgICAvLyBmdXJ0aGVyIHRoYW4gMSBsZXZlbCBkZWVwLlxuICAgICAgICBjb25zdCBzcHJlYWRGYWN0b3IgPSBNYXRoLmNlaWwocG9pbnRzIC8gaW5wdXQubGVuZ3RoKTtcbiAgICAgICAgZm9yIChjb25zdCB2YWwgb2YgaW5wdXQpIHtcbiAgICAgICAgICAgIHNhbXBsZXMucHVzaCguLi5hcnJheVNlZWQodmFsLCBzcHJlYWRGYWN0b3IpKTtcbiAgICAgICAgfVxuICAgICAgICBzYW1wbGVzID0gYXJyYXlGYXN0UmVzYW1wbGUoc2FtcGxlcywgcG9pbnRzKTtcbiAgICB9XG5cbiAgICAvLyBTYW5pdHkgZmlsbCwganVzdCBpbiBjYXNlXG4gICAgd2hpbGUgKHNhbXBsZXMubGVuZ3RoIDwgcG9pbnRzKSB7XG4gICAgICAgIHNhbXBsZXMucHVzaChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSk7XG4gICAgfVxuXG4gICAgLy8gU2FuaXR5IHRyaW0sIGp1c3QgaW4gY2FzZVxuICAgIGlmIChzYW1wbGVzLmxlbmd0aCA+IHBvaW50cykge1xuICAgICAgICBzYW1wbGVzID0gc2FtcGxlcy5zbGljZSgwLCBwb2ludHMpO1xuICAgIH1cblxuICAgIHJldHVybiBzYW1wbGVzO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGdpdmVuIGxlbmd0aCwgc2VlZGVkIHdpdGggdGhlIGdpdmVuIHZhbHVlLlxuICogQHBhcmFtIHtUfSB2YWwgVGhlIHZhbHVlIHRvIHNlZWQgdGhlIGFycmF5IHdpdGguXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIFRoZSBsZW5ndGggb2YgdGhlIGFycmF5IHRvIGNyZWF0ZS5cbiAqIEByZXR1cm5zIHtUW119IFRoZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5U2VlZDxUPih2YWw6IFQsIGxlbmd0aDogbnVtYmVyKTogVFtdIHtcbiAgICBjb25zdCBhOiBUW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGEucHVzaCh2YWwpO1xuICAgIH1cbiAgICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBUcmltcyBvciBmaWxscyB0aGUgYXJyYXkgdG8gZW5zdXJlIGl0IG1lZXRzIHRoZSBkZXNpcmVkIGxlbmd0aC4gVGhlIHNlZWQgYXJyYXlcbiAqIGdpdmVuIGlzIHB1bGxlZCBmcm9tIHRvIGZpbGwgYW55IG1pc3Npbmcgc2xvdHMgLSBpdCBpcyByZWNvbW1lbmRlZCB0aGF0IHRoaXMgYmVcbiAqIGF0IGxlYXN0IGBsZW5gIGxvbmcuIFRoZSByZXN1bHRpbmcgYXJyYXkgd2lsbCBiZSBleGFjdGx5IGBsZW5gIGxvbmcsIGVpdGhlclxuICogdHJpbW1lZCBmcm9tIHRoZSBzb3VyY2Ugb3IgZmlsbGVkIHdpdGggdGhlIHNvbWUvYWxsIG9mIHRoZSBzZWVkIGFycmF5LlxuICogQHBhcmFtIHtUW119IGEgVGhlIGFycmF5IHRvIHRyaW0vZmlsbC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gVGhlIGxlbmd0aCB0byB0cmltIG9yIGZpbGwgdG8sIGFzIG5lZWRlZC5cbiAqIEBwYXJhbSB7VFtdfSBzZWVkIFZhbHVlcyB0byBwdWxsIGZyb20gaWYgdGhlIGFycmF5IG5lZWRzIGZpbGxpbmcuXG4gKiBAcmV0dXJucyB7VFtdfSBUaGUgcmVzdWx0aW5nIGFycmF5IG9mIGBsZW5gIGxlbmd0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5VHJpbUZpbGw8VD4oYTogVFtdLCBsZW46IG51bWJlciwgc2VlZDogVFtdKTogVFtdIHtcbiAgICAvLyBEZXYgbm90ZTogd2UgZG8gbGVuZ3RoIGNoZWNrcyBiZWNhdXNlIHRoZSBzcHJlYWQgb3BlcmF0b3IgY2FuIHJlc3VsdCBpbiBzb21lXG4gICAgLy8gcGVyZm9ybWFuY2UgcGVuYWx0aWVzIGluIG1vcmUgY3JpdGljYWwgY29kZSBwYXRocy4gQXMgYSB1dGlsaXR5LCBpdCBzaG91bGQgYmVcbiAgICAvLyBhcyBmYXN0IGFzIHBvc3NpYmxlIHRvIG5vdCBjYXVzZSBhIHByb2JsZW0gZm9yIHRoZSBjYWxsIHN0YWNrLCBubyBtYXR0ZXIgaG93XG4gICAgLy8gY3JpdGljYWwgdGhhdCBzdGFjayBpcy5cbiAgICBpZiAoYS5sZW5ndGggPT09IGxlbikgcmV0dXJuIGE7XG4gICAgaWYgKGEubGVuZ3RoID4gbGVuKSByZXR1cm4gYS5zbGljZSgwLCBsZW4pO1xuICAgIHJldHVybiBhLmNvbmNhdChzZWVkLnNsaWNlKDAsIGxlbiAtIGEubGVuZ3RoKSk7XG59XG5cbi8qKlxuICogQ2xvbmVzIGFuIGFycmF5IGFzIGZhc3QgYXMgcG9zc2libGUsIHJldGFpbmluZyByZWZlcmVuY2VzIG9mIHRoZSBhcnJheSdzIHZhbHVlcy5cbiAqIEBwYXJhbSBhIFRoZSBhcnJheSB0byBjbG9uZS4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHJldHVybnMgQSBjb3B5IG9mIHRoZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RmFzdENsb25lPFQ+KGE6IFRbXSk6IFRbXSB7XG4gICAgcmV0dXJuIGEuc2xpY2UoMCwgYS5sZW5ndGgpO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIHR3byBhcnJheXMgYXJlIGRpZmZlcmVudCBlaXRoZXIgaW4gbGVuZ3RoLCBjb250ZW50cyxcbiAqIG9yIG9yZGVyIG9mIHRob3NlIGNvbnRlbnRzLlxuICogQHBhcmFtIGEgVGhlIGZpcnN0IGFycmF5LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcGFyYW0gYiBUaGUgc2Vjb25kIGFycmF5LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZXkgYXJlIGRpZmZlcmVudCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlIYXNPcmRlckNoYW5nZShhOiBhbnlbXSwgYjogYW55W10pOiBib29sZWFuIHtcbiAgICBpZiAoYS5sZW5ndGggPT09IGIubGVuZ3RoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gbGlrZSBhcnJheUhhc0RpZmYsIGEgZGlmZmVyZW5jZSBpbiBsZW5ndGggaXMgYSBuYXR1cmFsIGNoYW5nZVxuICAgIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHR3byBhcnJheXMgYXJlIGRpZmZlcmVudCB0aHJvdWdoIGEgc2hhbGxvdyBjb21wYXJpc29uLlxuICogQHBhcmFtIGEgVGhlIGZpcnN0IGFycmF5LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcGFyYW0gYiBUaGUgc2Vjb25kIGFycmF5LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZXkgYXJlIGRpZmZlcmVudCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlIYXNEaWZmKGE6IGFueVtdLCBiOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgIGlmIChhLmxlbmd0aCA9PT0gYi5sZW5ndGgpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgbGVuZ3RocyBhcmUgZXF1YWwsIGNoZWNrIHRvIHNlZSBpZiBlaXRoZXIgYXJyYXkgaXMgbWlzc2luZ1xuICAgICAgICAvLyBhbiBlbGVtZW50IGZyb20gdGhlIG90aGVyLlxuICAgICAgICBpZiAoYi5zb21lKGkgPT4gIWEuaW5jbHVkZXMoaSkpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKGEuc29tZShpID0+ICFiLmluY2x1ZGVzKGkpKSkgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgLy8gaWYgYWxsIHRoZSBrZXlzIGFyZSBjb21tb24sIHNheSBzb1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIGRpZmZlcmVudCBsZW5ndGhzIG1lYW5zIHRoZXkgYXJlIG5hdHVyYWxseSBkaXZlcmdlZFxuICAgIH1cbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGRpZmYgb24gdHdvIGFycmF5cy4gVGhlIHJlc3VsdCBpcyB3aGF0IGlzIGRpZmZlcmVudCB3aXRoIHRoZVxuICogZmlyc3QgYXJyYXkgKGBhZGRlZGAgaW4gdGhlIHJldHVybmVkIG9iamVjdCBtZWFucyBvYmplY3RzIGluIEIgdGhhdCBhcmVuJ3RcbiAqIGluIEEpLiBTaGFsbG93IGNvbXBhcmlzb25zIGFyZSB1c2VkIHRvIHBlcmZvcm0gdGhlIGRpZmYuXG4gKiBAcGFyYW0gYSBUaGUgZmlyc3QgYXJyYXkuIE11c3QgYmUgZGVmaW5lZC5cbiAqIEBwYXJhbSBiIFRoZSBzZWNvbmQgYXJyYXkuIE11c3QgYmUgZGVmaW5lZC5cbiAqIEByZXR1cm5zIFRoZSBkaWZmIGJldHdlZW4gdGhlIGFycmF5cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RGlmZjxUPihhOiBUW10sIGI6IFRbXSk6IHsgYWRkZWQ6IFRbXSwgcmVtb3ZlZDogVFtdIH0ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGFkZGVkOiBiLmZpbHRlcihpID0+ICFhLmluY2x1ZGVzKGkpKSxcbiAgICAgICAgcmVtb3ZlZDogYS5maWx0ZXIoaSA9PiAhYi5pbmNsdWRlcyhpKSksXG4gICAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB1bmlvbiBvZiB0d28gYXJyYXlzLlxuICogQHBhcmFtIGEgVGhlIGZpcnN0IGFycmF5LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcGFyYW0gYiBUaGUgc2Vjb25kIGFycmF5LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcmV0dXJucyBUaGUgdW5pb24gb2YgdGhlIGFycmF5cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5VW5pb248VD4oYTogVFtdLCBiOiBUW10pOiBUW10ge1xuICAgIHJldHVybiBhLmZpbHRlcihpID0+IGIuaW5jbHVkZXMoaSkpO1xufVxuXG4vKipcbiAqIE1lcmdlcyBhcnJheXMsIGRlZHVwaW5nIGNvbnRlbnRzIHVzaW5nIGEgU2V0LlxuICogQHBhcmFtIGEgVGhlIGFycmF5cyB0byBtZXJnZS5cbiAqIEByZXR1cm5zIFRoZSBtZXJnZWQgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheU1lcmdlPFQ+KC4uLmE6IFRbXVtdKTogVFtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShhLnJlZHVjZSgoYywgdikgPT4ge1xuICAgICAgICB2LmZvckVhY2goaSA9PiBjLmFkZChpKSk7XG4gICAgICAgIHJldHVybiBjO1xuICAgIH0sIG5ldyBTZXQ8VD4oKSkpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbnMgdG8gcGVyZm9ybSBMSU5RLWxpa2UgcXVlcmllcyBvbiBhcnJheXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBcnJheVV0aWw8VD4ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBhcnJheSBoZWxwZXIuXG4gICAgICogQHBhcmFtIGEgVGhlIGFycmF5IHRvIGhlbHAuIENhbiBiZSBtb2RpZmllZCBpbi1wbGFjZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGE6IFRbXSkge1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSB2YWx1ZSBvZiB0aGlzIGFycmF5LCBhZnRlciBhbGwgYXBwcm9wcmlhdGUgYWx0ZXJhdGlvbnMuXG4gICAgICovXG4gICAgcHVibGljIGdldCB2YWx1ZSgpOiBUW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5hO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdyb3VwcyBhbiBhcnJheSBieSBrZXlzLlxuICAgICAqIEBwYXJhbSBmbiBUaGUga2V5LWZpbmRpbmcgZnVuY3Rpb24uXG4gICAgICogQHJldHVybnMgVGhpcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ3JvdXBCeTxLPihmbjogKGE6IFQpID0+IEspOiBHcm91cGVkQXJyYXk8SywgVD4ge1xuICAgICAgICBjb25zdCBvYmogPSB0aGlzLmEucmVkdWNlKChydjogTWFwPEssIFRbXT4sIHZhbDogVCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgayA9IGZuKHZhbCk7XG4gICAgICAgICAgICBpZiAoIXJ2LmhhcyhrKSkgcnYuc2V0KGssIFtdKTtcbiAgICAgICAgICAgIHJ2LmdldChrKS5wdXNoKHZhbCk7XG4gICAgICAgICAgICByZXR1cm4gcnY7XG4gICAgICAgIH0sIG5ldyBNYXA8SywgVFtdPigpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBHcm91cGVkQXJyYXkob2JqKTtcbiAgICB9XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9ucyB0byBwZXJmb3JtIExJTlEtbGlrZSBxdWVyaWVzIG9uIGdyb3VwcyAobWFwcykuXG4gKi9cbmV4cG9ydCBjbGFzcyBHcm91cGVkQXJyYXk8SywgVD4ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgZ3JvdXAgaGVscGVyLlxuICAgICAqIEBwYXJhbSB2YWwgVGhlIGdyb3VwIHRvIGhlbHAuIENhbiBiZSBtb2RpZmllZCBpbi1wbGFjZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHZhbDogTWFwPEssIFRbXT4pIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgdmFsdWUgb2YgdGhpcyBncm91cCwgYWZ0ZXIgYWxsIGFwcGxpY2FibGUgYWx0ZXJhdGlvbnMuXG4gICAgICovXG4gICAgcHVibGljIGdldCB2YWx1ZSgpOiBNYXA8SywgVFtdPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPcmRlcnMgdGhlIGdyb3VwaW5nIGludG8gYW4gYXJyYXkgdXNpbmcgdGhlIHByb3ZpZGVkIGtleSBvcmRlci5cbiAgICAgKiBAcGFyYW0ga2V5T3JkZXIgVGhlIGtleSBvcmRlci5cbiAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBoZWxwZXIgb2YgdGhlIHJlc3VsdC5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3JkZXJCeShrZXlPcmRlcjogS1tdKTogQXJyYXlVdGlsPFQ+IHtcbiAgICAgICAgY29uc3QgYTogVFtdID0gW107XG4gICAgICAgIGZvciAoY29uc3QgayBvZiBrZXlPcmRlcikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZhbC5oYXMoaykpIGNvbnRpbnVlO1xuICAgICAgICAgICAgYS5wdXNoKC4uLnRoaXMudmFsLmdldChrKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheVV0aWwoYSk7XG4gICAgfVxufVxuIl19
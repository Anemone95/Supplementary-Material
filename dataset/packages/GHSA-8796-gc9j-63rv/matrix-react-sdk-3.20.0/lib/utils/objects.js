"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.objectExcluding = objectExcluding;
exports.objectWithOnly = objectWithOnly;
exports.objectShallowClone = objectShallowClone;
exports.objectHasDiff = objectHasDiff;
exports.objectDiff = objectDiff;
exports.objectKeyChanges = objectKeyChanges;
exports.objectClone = objectClone;
exports.objectFromEntries = objectFromEntries;

var _arrays = require("./arrays");

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
 * Gets a new object which represents the provided object, excluding some properties.
 * @param a The object to strip properties of. Must be defined.
 * @param props The property names to remove.
 * @returns The new object without the provided properties.
 */
function objectExcluding
/*:: <O extends {}, P extends Array<keyof O>>*/
(a
/*: O*/
, props
/*: P*/
)
/*: ObjectExcluding<O, P>*/
{
  // We use a Map to avoid hammering the `delete` keyword, which is slow and painful.
  const tempMap = new Map(Object.entries(a));

  for (const prop of props) {
    tempMap.delete(prop);
  } // Convert the map to an object again


  return Array.from(tempMap.entries()).reduce((c, [k, v]) => {
    c[k] = v;
    return c;
  }, {});
}
/**
 * Gets a new object which represents the provided object, with only some properties
 * included.
 * @param a The object to clone properties of. Must be defined.
 * @param props The property names to keep.
 * @returns The new object with only the provided properties.
 */


function objectWithOnly
/*:: <O extends {}, P extends Array<keyof O>>*/
(a
/*: O*/
, props
/*: P*/
)
/*: {[k in P[number]]: O[k]}*/
{
  const existingProps = Object.keys(a);
  const diff = (0, _arrays.arrayDiff)(existingProps, props);

  if (diff.removed.length === 0) {
    return objectShallowClone(a);
  } else {
    return objectExcluding(a, diff.removed);
  }
}
/**
 * Clones an object to a caller-controlled depth. When a propertyCloner is supplied, the
 * object's properties will be passed through it with the return value used as the new
 * object's type. This is intended to be used to deep clone a reference, but without
 * having to deep clone the entire object. This function is safe to call recursively within
 * the propertyCloner.
 * @param a The object to clone. Must be defined.
 * @param propertyCloner The function to clone the properties of the object with, optionally.
 * First argument is the property key with the second being the current value.
 * @returns A cloned object.
 */


function objectShallowClone
/*:: <O extends {}>*/
(a
/*: O*/
, propertyCloner
/*: (k: keyof O, v: O[keyof O]) => any*/
)
/*: O*/
{
  const newObj = {};

  for (const [k, v] of Object.entries(a)) {
    newObj[k] = v;

    if (propertyCloner) {
      newObj[k] = propertyCloner(k, v);
    }
  }

  return newObj;
}
/**
 * Determines if any keys were added, removed, or changed between two objects.
 * For changes, simple triple equal comparisons are done, not in-depth
 * tree checking.
 * @param a The first object. Must be defined.
 * @param b The second object. Must be defined.
 * @returns True if there's a difference between the objects, false otherwise
 */


function objectHasDiff
/*:: <O extends {}>*/
(a
/*: O*/
, b
/*: O*/
)
/*: boolean*/
{
  if (a === b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  const possibleChanges = (0, _arrays.arrayUnion)(aKeys, bKeys); // if the amalgamation of both sets of keys has the a different length to the inputs then there must be a change

  if (possibleChanges.length !== aKeys.length) return true;
  return possibleChanges.some(k => a[k] !== b[k]);
}

/**
 * Determines the keys added, changed, and removed between two objects.
 * For changes, simple triple equal comparisons are done, not in-depth
 * tree checking.
 * @param a The first object. Must be defined.
 * @param b The second object. Must be defined.
 * @returns The difference between the keys of each object.
 */
function objectDiff
/*:: <O extends {}>*/
(a
/*: O*/
, b
/*: O*/
)
/*: Diff<keyof O>*/
{
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const keyDiff = (0, _arrays.arrayDiff)(aKeys, bKeys);
  const possibleChanges = (0, _arrays.arrayUnion)(aKeys, bKeys);
  const changes = possibleChanges.filter(k => a[k] !== b[k]);
  return {
    changed: changes,
    added: keyDiff.added,
    removed: keyDiff.removed
  };
}
/**
 * Gets all the key changes (added, removed, or value difference) between
 * two objects. Triple equals is used to compare values, not in-depth tree
 * checking.
 * @param a The first object. Must be defined.
 * @param b The second object. Must be defined.
 * @returns The keys which have been added, removed, or changed between the
 * two objects.
 */


function objectKeyChanges
/*:: <O extends {}>*/
(a
/*: O*/
, b
/*: O*/
)
/*: (keyof O)[]*/
{
  const diff = objectDiff(a, b);
  return (0, _arrays.arrayMerge)(diff.removed, diff.added, diff.changed);
}
/**
 * Clones an object by running it through JSON parsing. Note that this
 * will destroy any complicated object types which do not translate to
 * JSON.
 * @param obj The object to clone.
 * @returns The cloned object
 */


function objectClone
/*:: <O extends {}>*/
(obj
/*: O*/
)
/*: O*/
{
  return JSON.parse(JSON.stringify(obj));
}
/**
 * Converts a series of entries to an object.
 * @param entries The entries to convert.
 * @returns The converted object.
 */
// NOTE: Deprecated once we have Object.fromEntries() support.
// @ts-ignore - return type is complaining about non-string keys, but we know better


function objectFromEntries
/*:: <K, V>*/
(entries
/*: Iterable<[K, V]>*/
)
/*: {[k: K]: V}*/
{
  const obj
  /*: {
          // @ts-ignore - same as return type
          [k: K]: V}*/
  = {};

  for (const e of entries) {
    // @ts-ignore - same as return type
    obj[e[0]] = e[1];
  }

  return obj;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9vYmplY3RzLnRzIl0sIm5hbWVzIjpbIm9iamVjdEV4Y2x1ZGluZyIsImEiLCJwcm9wcyIsInRlbXBNYXAiLCJNYXAiLCJPYmplY3QiLCJlbnRyaWVzIiwicHJvcCIsImRlbGV0ZSIsIkFycmF5IiwiZnJvbSIsInJlZHVjZSIsImMiLCJrIiwidiIsIm9iamVjdFdpdGhPbmx5IiwiZXhpc3RpbmdQcm9wcyIsImtleXMiLCJkaWZmIiwicmVtb3ZlZCIsImxlbmd0aCIsIm9iamVjdFNoYWxsb3dDbG9uZSIsInByb3BlcnR5Q2xvbmVyIiwibmV3T2JqIiwib2JqZWN0SGFzRGlmZiIsImIiLCJhS2V5cyIsImJLZXlzIiwicG9zc2libGVDaGFuZ2VzIiwic29tZSIsIm9iamVjdERpZmYiLCJrZXlEaWZmIiwiY2hhbmdlcyIsImZpbHRlciIsImNoYW5nZWQiLCJhZGRlZCIsIm9iamVjdEtleUNoYW5nZXMiLCJvYmplY3RDbG9uZSIsIm9iaiIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsIm9iamVjdEZyb21FbnRyaWVzIiwiZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxTQUFTQTtBQUFUO0FBQUEsQ0FBaUVDO0FBQWpFO0FBQUEsRUFBdUVDO0FBQXZFO0FBQUE7QUFBQTtBQUF3RztBQUMzRztBQUNBLFFBQU1DLE9BQU8sR0FBRyxJQUFJQyxHQUFKLENBQXNCQyxNQUFNLENBQUNDLE9BQVAsQ0FBZUwsQ0FBZixDQUF0QixDQUFoQjs7QUFDQSxPQUFLLE1BQU1NLElBQVgsSUFBbUJMLEtBQW5CLEVBQTBCO0FBQ3RCQyxJQUFBQSxPQUFPLENBQUNLLE1BQVIsQ0FBZUQsSUFBZjtBQUNILEdBTDBHLENBTzNHOzs7QUFD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QztBQUVRO0FBQ2xCO0FBQ0E7QUFGa0IsSUFBRyxFQUZqQjs7QUFHQSxPQUFLLE1BQU1LLENBQVgsSUFBZ0JyQyxPQUFoQixFQUF5QjtBQUNyQjtBQUNBZ0MsSUFBQUEsR0FBRyxDQUFDSyxDQUFDLENBQUMsQ0FBRCxDQUFGLENBQUgsR0FBWUEsQ0FBQyxDQUFDLENBQUQsQ0FBYjtBQUNIOztBQUNELFNBQU9MLEdBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGFycmF5RGlmZiwgYXJyYXlNZXJnZSwgYXJyYXlVbmlvbiB9IGZyb20gXCIuL2FycmF5c1wiO1xuXG50eXBlIE9iamVjdEV4Y2x1ZGluZzxPIGV4dGVuZHMge30sIFAgZXh0ZW5kcyAoa2V5b2YgTylbXT4gPSB7W2sgaW4gRXhjbHVkZTxrZXlvZiBPLCBQW251bWJlcl0+XTogT1trXX07XG5cbi8qKlxuICogR2V0cyBhIG5ldyBvYmplY3Qgd2hpY2ggcmVwcmVzZW50cyB0aGUgcHJvdmlkZWQgb2JqZWN0LCBleGNsdWRpbmcgc29tZSBwcm9wZXJ0aWVzLlxuICogQHBhcmFtIGEgVGhlIG9iamVjdCB0byBzdHJpcCBwcm9wZXJ0aWVzIG9mLiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcGFyYW0gcHJvcHMgVGhlIHByb3BlcnR5IG5hbWVzIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIFRoZSBuZXcgb2JqZWN0IHdpdGhvdXQgdGhlIHByb3ZpZGVkIHByb3BlcnRpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3RFeGNsdWRpbmc8TyBleHRlbmRzIHt9LCBQIGV4dGVuZHMgQXJyYXk8a2V5b2YgTz4+KGE6IE8sIHByb3BzOiBQKTogT2JqZWN0RXhjbHVkaW5nPE8sIFA+IHtcbiAgICAvLyBXZSB1c2UgYSBNYXAgdG8gYXZvaWQgaGFtbWVyaW5nIHRoZSBgZGVsZXRlYCBrZXl3b3JkLCB3aGljaCBpcyBzbG93IGFuZCBwYWluZnVsLlxuICAgIGNvbnN0IHRlbXBNYXAgPSBuZXcgTWFwPGtleW9mIE8sIGFueT4oT2JqZWN0LmVudHJpZXMoYSkgYXMgW2tleW9mIE8sIGFueV1bXSk7XG4gICAgZm9yIChjb25zdCBwcm9wIG9mIHByb3BzKSB7XG4gICAgICAgIHRlbXBNYXAuZGVsZXRlKHByb3ApO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgdGhlIG1hcCB0byBhbiBvYmplY3QgYWdhaW5cbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0ZW1wTWFwLmVudHJpZXMoKSkucmVkdWNlKChjLCBbaywgdl0pID0+IHtcbiAgICAgICAgY1trXSA9IHY7XG4gICAgICAgIHJldHVybiBjO1xuICAgIH0sIHt9IGFzIE8pO1xufVxuXG4vKipcbiAqIEdldHMgYSBuZXcgb2JqZWN0IHdoaWNoIHJlcHJlc2VudHMgdGhlIHByb3ZpZGVkIG9iamVjdCwgd2l0aCBvbmx5IHNvbWUgcHJvcGVydGllc1xuICogaW5jbHVkZWQuXG4gKiBAcGFyYW0gYSBUaGUgb2JqZWN0IHRvIGNsb25lIHByb3BlcnRpZXMgb2YuIE11c3QgYmUgZGVmaW5lZC5cbiAqIEBwYXJhbSBwcm9wcyBUaGUgcHJvcGVydHkgbmFtZXMgdG8ga2VlcC5cbiAqIEByZXR1cm5zIFRoZSBuZXcgb2JqZWN0IHdpdGggb25seSB0aGUgcHJvdmlkZWQgcHJvcGVydGllcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdFdpdGhPbmx5PE8gZXh0ZW5kcyB7fSwgUCBleHRlbmRzIEFycmF5PGtleW9mIE8+PihhOiBPLCBwcm9wczogUCk6IHtbayBpbiBQW251bWJlcl1dOiBPW2tdfSB7XG4gICAgY29uc3QgZXhpc3RpbmdQcm9wcyA9IE9iamVjdC5rZXlzKGEpIGFzIChrZXlvZiBPKVtdO1xuICAgIGNvbnN0IGRpZmYgPSBhcnJheURpZmYoZXhpc3RpbmdQcm9wcywgcHJvcHMpO1xuICAgIGlmIChkaWZmLnJlbW92ZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBvYmplY3RTaGFsbG93Q2xvbmUoYSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdEV4Y2x1ZGluZyhhLCBkaWZmLnJlbW92ZWQpIGFzIHtbayBpbiBQW251bWJlcl1dOiBPW2tdfTtcbiAgICB9XG59XG5cbi8qKlxuICogQ2xvbmVzIGFuIG9iamVjdCB0byBhIGNhbGxlci1jb250cm9sbGVkIGRlcHRoLiBXaGVuIGEgcHJvcGVydHlDbG9uZXIgaXMgc3VwcGxpZWQsIHRoZVxuICogb2JqZWN0J3MgcHJvcGVydGllcyB3aWxsIGJlIHBhc3NlZCB0aHJvdWdoIGl0IHdpdGggdGhlIHJldHVybiB2YWx1ZSB1c2VkIGFzIHRoZSBuZXdcbiAqIG9iamVjdCdzIHR5cGUuIFRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCB0byBkZWVwIGNsb25lIGEgcmVmZXJlbmNlLCBidXQgd2l0aG91dFxuICogaGF2aW5nIHRvIGRlZXAgY2xvbmUgdGhlIGVudGlyZSBvYmplY3QuIFRoaXMgZnVuY3Rpb24gaXMgc2FmZSB0byBjYWxsIHJlY3Vyc2l2ZWx5IHdpdGhpblxuICogdGhlIHByb3BlcnR5Q2xvbmVyLlxuICogQHBhcmFtIGEgVGhlIG9iamVjdCB0byBjbG9uZS4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHBhcmFtIHByb3BlcnR5Q2xvbmVyIFRoZSBmdW5jdGlvbiB0byBjbG9uZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgb2JqZWN0IHdpdGgsIG9wdGlvbmFsbHkuXG4gKiBGaXJzdCBhcmd1bWVudCBpcyB0aGUgcHJvcGVydHkga2V5IHdpdGggdGhlIHNlY29uZCBiZWluZyB0aGUgY3VycmVudCB2YWx1ZS5cbiAqIEByZXR1cm5zIEEgY2xvbmVkIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdFNoYWxsb3dDbG9uZTxPIGV4dGVuZHMge30+KGE6IE8sIHByb3BlcnR5Q2xvbmVyPzogKGs6IGtleW9mIE8sIHY6IE9ba2V5b2YgT10pID0+IGFueSk6IE8ge1xuICAgIGNvbnN0IG5ld09iaiA9IHt9IGFzIE87XG4gICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoYSkgYXMgW2tleW9mIE8sIE9ba2V5b2YgT11dW10pIHtcbiAgICAgICAgbmV3T2JqW2tdID0gdjtcbiAgICAgICAgaWYgKHByb3BlcnR5Q2xvbmVyKSB7XG4gICAgICAgICAgICBuZXdPYmpba10gPSBwcm9wZXJ0eUNsb25lcihrLCB2KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3T2JqO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgYW55IGtleXMgd2VyZSBhZGRlZCwgcmVtb3ZlZCwgb3IgY2hhbmdlZCBiZXR3ZWVuIHR3byBvYmplY3RzLlxuICogRm9yIGNoYW5nZXMsIHNpbXBsZSB0cmlwbGUgZXF1YWwgY29tcGFyaXNvbnMgYXJlIGRvbmUsIG5vdCBpbi1kZXB0aFxuICogdHJlZSBjaGVja2luZy5cbiAqIEBwYXJhbSBhIFRoZSBmaXJzdCBvYmplY3QuIE11c3QgYmUgZGVmaW5lZC5cbiAqIEBwYXJhbSBiIFRoZSBzZWNvbmQgb2JqZWN0LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZXJlJ3MgYSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG9iamVjdHMsIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0SGFzRGlmZjxPIGV4dGVuZHMge30+KGE6IE8sIGI6IE8pOiBib29sZWFuIHtcbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGFLZXlzID0gT2JqZWN0LmtleXMoYSk7XG4gICAgY29uc3QgYktleXMgPSBPYmplY3Qua2V5cyhiKTtcbiAgICBpZiAoYUtleXMubGVuZ3RoICE9PSBiS2V5cy5sZW5ndGgpIHJldHVybiB0cnVlO1xuICAgIGNvbnN0IHBvc3NpYmxlQ2hhbmdlcyA9IGFycmF5VW5pb24oYUtleXMsIGJLZXlzKTtcbiAgICAvLyBpZiB0aGUgYW1hbGdhbWF0aW9uIG9mIGJvdGggc2V0cyBvZiBrZXlzIGhhcyB0aGUgYSBkaWZmZXJlbnQgbGVuZ3RoIHRvIHRoZSBpbnB1dHMgdGhlbiB0aGVyZSBtdXN0IGJlIGEgY2hhbmdlXG4gICAgaWYgKHBvc3NpYmxlQ2hhbmdlcy5sZW5ndGggIT09IGFLZXlzLmxlbmd0aCkgcmV0dXJuIHRydWU7XG5cbiAgICByZXR1cm4gcG9zc2libGVDaGFuZ2VzLnNvbWUoayA9PiBhW2tdICE9PSBiW2tdKTtcbn1cblxudHlwZSBEaWZmPEs+ID0geyBjaGFuZ2VkOiBLW10sIGFkZGVkOiBLW10sIHJlbW92ZWQ6IEtbXSB9O1xuXG4vKipcbiAqIERldGVybWluZXMgdGhlIGtleXMgYWRkZWQsIGNoYW5nZWQsIGFuZCByZW1vdmVkIGJldHdlZW4gdHdvIG9iamVjdHMuXG4gKiBGb3IgY2hhbmdlcywgc2ltcGxlIHRyaXBsZSBlcXVhbCBjb21wYXJpc29ucyBhcmUgZG9uZSwgbm90IGluLWRlcHRoXG4gKiB0cmVlIGNoZWNraW5nLlxuICogQHBhcmFtIGEgVGhlIGZpcnN0IG9iamVjdC4gTXVzdCBiZSBkZWZpbmVkLlxuICogQHBhcmFtIGIgVGhlIHNlY29uZCBvYmplY3QuIE11c3QgYmUgZGVmaW5lZC5cbiAqIEByZXR1cm5zIFRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGtleXMgb2YgZWFjaCBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3REaWZmPE8gZXh0ZW5kcyB7fT4oYTogTywgYjogTyk6IERpZmY8a2V5b2YgTz4ge1xuICAgIGNvbnN0IGFLZXlzID0gT2JqZWN0LmtleXMoYSkgYXMgKGtleW9mIE8pW107XG4gICAgY29uc3QgYktleXMgPSBPYmplY3Qua2V5cyhiKSBhcyAoa2V5b2YgTylbXTtcbiAgICBjb25zdCBrZXlEaWZmID0gYXJyYXlEaWZmKGFLZXlzLCBiS2V5cyk7XG4gICAgY29uc3QgcG9zc2libGVDaGFuZ2VzID0gYXJyYXlVbmlvbihhS2V5cywgYktleXMpO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBwb3NzaWJsZUNoYW5nZXMuZmlsdGVyKGsgPT4gYVtrXSAhPT0gYltrXSk7XG5cbiAgICByZXR1cm4ge2NoYW5nZWQ6IGNoYW5nZXMsIGFkZGVkOiBrZXlEaWZmLmFkZGVkLCByZW1vdmVkOiBrZXlEaWZmLnJlbW92ZWR9O1xufVxuXG4vKipcbiAqIEdldHMgYWxsIHRoZSBrZXkgY2hhbmdlcyAoYWRkZWQsIHJlbW92ZWQsIG9yIHZhbHVlIGRpZmZlcmVuY2UpIGJldHdlZW5cbiAqIHR3byBvYmplY3RzLiBUcmlwbGUgZXF1YWxzIGlzIHVzZWQgdG8gY29tcGFyZSB2YWx1ZXMsIG5vdCBpbi1kZXB0aCB0cmVlXG4gKiBjaGVja2luZy5cbiAqIEBwYXJhbSBhIFRoZSBmaXJzdCBvYmplY3QuIE11c3QgYmUgZGVmaW5lZC5cbiAqIEBwYXJhbSBiIFRoZSBzZWNvbmQgb2JqZWN0LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcmV0dXJucyBUaGUga2V5cyB3aGljaCBoYXZlIGJlZW4gYWRkZWQsIHJlbW92ZWQsIG9yIGNoYW5nZWQgYmV0d2VlbiB0aGVcbiAqIHR3byBvYmplY3RzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0S2V5Q2hhbmdlczxPIGV4dGVuZHMge30+KGE6IE8sIGI6IE8pOiAoa2V5b2YgTylbXSB7XG4gICAgY29uc3QgZGlmZiA9IG9iamVjdERpZmYoYSwgYik7XG4gICAgcmV0dXJuIGFycmF5TWVyZ2UoZGlmZi5yZW1vdmVkLCBkaWZmLmFkZGVkLCBkaWZmLmNoYW5nZWQpO1xufVxuXG4vKipcbiAqIENsb25lcyBhbiBvYmplY3QgYnkgcnVubmluZyBpdCB0aHJvdWdoIEpTT04gcGFyc2luZy4gTm90ZSB0aGF0IHRoaXNcbiAqIHdpbGwgZGVzdHJveSBhbnkgY29tcGxpY2F0ZWQgb2JqZWN0IHR5cGVzIHdoaWNoIGRvIG5vdCB0cmFuc2xhdGUgdG9cbiAqIEpTT04uXG4gKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyBUaGUgY2xvbmVkIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0Q2xvbmU8TyBleHRlbmRzIHt9PihvYmo6IE8pOiBPIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHNlcmllcyBvZiBlbnRyaWVzIHRvIGFuIG9iamVjdC5cbiAqIEBwYXJhbSBlbnRyaWVzIFRoZSBlbnRyaWVzIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIG9iamVjdC5cbiAqL1xuLy8gTk9URTogRGVwcmVjYXRlZCBvbmNlIHdlIGhhdmUgT2JqZWN0LmZyb21FbnRyaWVzKCkgc3VwcG9ydC5cbi8vIEB0cy1pZ25vcmUgLSByZXR1cm4gdHlwZSBpcyBjb21wbGFpbmluZyBhYm91dCBub24tc3RyaW5nIGtleXMsIGJ1dCB3ZSBrbm93IGJldHRlclxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdEZyb21FbnRyaWVzPEssIFY+KGVudHJpZXM6IEl0ZXJhYmxlPFtLLCBWXT4pOiB7W2s6IEtdOiBWfSB7XG4gICAgY29uc3Qgb2JqOiB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSBzYW1lIGFzIHJldHVybiB0eXBlXG4gICAgICAgIFtrOiBLXTogVn0gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGUgb2YgZW50cmllcykge1xuICAgICAgICAvLyBAdHMtaWdub3JlIC0gc2FtZSBhcyByZXR1cm4gdHlwZVxuICAgICAgICBvYmpbZVswXV0gPSBlWzFdO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuIl19
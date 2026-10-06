"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEnumValues = getEnumValues;
exports.isEnumValue = isEnumValue;

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
 * Get the values for an enum.
 * @param e The enum.
 * @returns The enum values.
 */
function getEnumValues(e
/*: any*/
)
/*: (string | number)[]*/
{
  // String-based enums will simply be objects ({Key: "value"}), but number-based
  // enums will instead map themselves twice: in one direction for {Key: 12} and
  // the reverse for easy lookup, presumably ({12: Key}). In the reverse mapping,
  // the key is a string, not a number.
  //
  // For this reason, we try to determine what kind of enum we're dealing with.
  const keys = Object.keys(e);
  const values
  /*: (string | number)[]*/
  = [];

  for (const key of keys) {
    const value = e[key];

    if (Number.isFinite(value) || e[value.toString()] !== Number(key)) {
      values.push(value);
    }
  }

  return values;
}
/**
 * Determines if a given value is a valid value for the provided enum.
 * @param e The enum to check against.
 * @param val The value to search for.
 * @returns True if the enum contains the value.
 */


function isEnumValue
/*:: <T>*/
(e
/*: T*/
, val
/*: string | number*/
)
/*: boolean*/
{
  return getEnumValues(e).includes(val);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9lbnVtcy50cyJdLCJuYW1lcyI6WyJnZXRFbnVtVmFsdWVzIiwiZSIsImtleXMiLCJPYmplY3QiLCJ2YWx1ZXMiLCJrZXkiLCJ2YWx1ZSIsIk51bWJlciIsImlzRmluaXRlIiwidG9TdHJpbmciLCJwdXNoIiwiaXNFbnVtVmFsdWUiLCJ2YWwiLCJpbmNsdWRlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLFNBQVNBLGFBQVQsQ0FBdUJDO0FBQXZCO0FBQUE7QUFBQTtBQUFvRDtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxRQUFNQyxJQUFJLEdBQUdDLE1BQU0sQ0FBQ0QsSUFBUCxDQUFZRCxDQUFaLENBQWI7QUFDQSxRQUFNRztBQUEyQjtBQUFBLElBQUcsRUFBcEM7O0FBQ0EsT0FBSyxNQUFNQyxHQUFYLElBQWtCSCxJQUFsQixFQUF3QjtBQUNwQixVQUFNSSxLQUFLLEdBQUdMLENBQUMsQ0FBQ0ksR0FBRCxDQUFmOztBQUNBLFFBQUlFLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkYsS0FBaEIsS0FBMEJMLENBQUMsQ0FBQ0ssS0FBSyxDQUFDRyxRQUFOLEVBQUQsQ0FBRCxLQUF3QkYsTUFBTSxDQUFDRixHQUFELENBQTVELEVBQW1FO0FBQy9ERCxNQUFBQSxNQUFNLENBQUNNLElBQVAsQ0FBWUosS0FBWjtBQUNIO0FBQ0o7O0FBQ0QsU0FBT0YsTUFBUDtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDTyxTQUFTTztBQUFUO0FBQUEsQ0FBd0JWO0FBQXhCO0FBQUEsRUFBOEJXO0FBQTlCO0FBQUE7QUFBQTtBQUE2RDtBQUNoRSxTQUFPWixhQUFhLENBQUNDLENBQUQsQ0FBYixDQUFpQlksUUFBakIsQ0FBMEJELEdBQTFCLENBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8qKlxuICogR2V0IHRoZSB2YWx1ZXMgZm9yIGFuIGVudW0uXG4gKiBAcGFyYW0gZSBUaGUgZW51bS5cbiAqIEByZXR1cm5zIFRoZSBlbnVtIHZhbHVlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudW1WYWx1ZXMoZTogYW55KTogKHN0cmluZyB8IG51bWJlcilbXSB7XG4gICAgLy8gU3RyaW5nLWJhc2VkIGVudW1zIHdpbGwgc2ltcGx5IGJlIG9iamVjdHMgKHtLZXk6IFwidmFsdWVcIn0pLCBidXQgbnVtYmVyLWJhc2VkXG4gICAgLy8gZW51bXMgd2lsbCBpbnN0ZWFkIG1hcCB0aGVtc2VsdmVzIHR3aWNlOiBpbiBvbmUgZGlyZWN0aW9uIGZvciB7S2V5OiAxMn0gYW5kXG4gICAgLy8gdGhlIHJldmVyc2UgZm9yIGVhc3kgbG9va3VwLCBwcmVzdW1hYmx5ICh7MTI6IEtleX0pLiBJbiB0aGUgcmV2ZXJzZSBtYXBwaW5nLFxuICAgIC8vIHRoZSBrZXkgaXMgYSBzdHJpbmcsIG5vdCBhIG51bWJlci5cbiAgICAvL1xuICAgIC8vIEZvciB0aGlzIHJlYXNvbiwgd2UgdHJ5IHRvIGRldGVybWluZSB3aGF0IGtpbmQgb2YgZW51bSB3ZSdyZSBkZWFsaW5nIHdpdGguXG5cbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoZSk7XG4gICAgY29uc3QgdmFsdWVzOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gW107XG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGVba2V5XTtcbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgfHwgZVt2YWx1ZS50b1N0cmluZygpXSAhPT0gTnVtYmVyKGtleSkpIHtcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgYSBnaXZlbiB2YWx1ZSBpcyBhIHZhbGlkIHZhbHVlIGZvciB0aGUgcHJvdmlkZWQgZW51bS5cbiAqIEBwYXJhbSBlIFRoZSBlbnVtIHRvIGNoZWNrIGFnYWluc3QuXG4gKiBAcGFyYW0gdmFsIFRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgZW51bSBjb250YWlucyB0aGUgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VudW1WYWx1ZTxUPihlOiBULCB2YWw6IHN0cmluZyB8IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRFbnVtVmFsdWVzKGUpLmluY2x1ZGVzKHZhbCk7XG59XG4iXX0=
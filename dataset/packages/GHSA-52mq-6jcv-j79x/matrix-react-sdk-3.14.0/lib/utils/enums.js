"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEnumValues = getEnumValues;
exports.isEnumValue = isEnumValue;

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
 * Get the values for an enum.
 * @param e The enum.
 * @returns The enum values.
 */
function getEnumValues
/*:: <T>*/
(e
/*: any*/
)
/*: T[]*/
{
  const keys = Object.keys(e);
  return keys.filter(k => ['string', 'number'].includes(typeof e[k])).map(k => e[k]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9lbnVtcy50cyJdLCJuYW1lcyI6WyJnZXRFbnVtVmFsdWVzIiwiZSIsImtleXMiLCJPYmplY3QiLCJmaWx0ZXIiLCJrIiwiaW5jbHVkZXMiLCJtYXAiLCJpc0VudW1WYWx1ZSIsInZhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLFNBQVNBO0FBQVQ7QUFBQSxDQUEwQkM7QUFBMUI7QUFBQTtBQUFBO0FBQXVDO0FBQzFDLFFBQU1DLElBQUksR0FBR0MsTUFBTSxDQUFDRCxJQUFQLENBQVlELENBQVosQ0FBYjtBQUNBLFNBQU9DLElBQUksQ0FDTkUsTUFERSxDQUNLQyxDQUFDLElBQUksQ0FBQyxRQUFELEVBQVcsUUFBWCxFQUFxQkMsUUFBckIsQ0FBOEIsT0FBT0wsQ0FBQyxDQUFDSSxDQUFELENBQXRDLENBRFYsRUFFRkUsR0FGRSxDQUVFRixDQUFDLElBQUlKLENBQUMsQ0FBQ0ksQ0FBRCxDQUZSLENBQVA7QUFHSDtBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ08sU0FBU0c7QUFBVDtBQUFBLENBQXdCUDtBQUF4QjtBQUFBLEVBQThCUTtBQUE5QjtBQUFBO0FBQUE7QUFBNkQ7QUFDaEUsU0FBT1QsYUFBYSxDQUFDQyxDQUFELENBQWIsQ0FBaUJLLFFBQWpCLENBQTBCRyxHQUExQixDQUFQO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKipcbiAqIEdldCB0aGUgdmFsdWVzIGZvciBhbiBlbnVtLlxuICogQHBhcmFtIGUgVGhlIGVudW0uXG4gKiBAcmV0dXJucyBUaGUgZW51bSB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnVtVmFsdWVzPFQ+KGU6IGFueSk6IFRbXSB7XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGUpO1xuICAgIHJldHVybiBrZXlzXG4gICAgICAgIC5maWx0ZXIoayA9PiBbJ3N0cmluZycsICdudW1iZXInXS5pbmNsdWRlcyh0eXBlb2YoZVtrXSkpKVxuICAgICAgICAubWFwKGsgPT4gZVtrXSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBhIGdpdmVuIHZhbHVlIGlzIGEgdmFsaWQgdmFsdWUgZm9yIHRoZSBwcm92aWRlZCBlbnVtLlxuICogQHBhcmFtIGUgVGhlIGVudW0gdG8gY2hlY2sgYWdhaW5zdC5cbiAqIEBwYXJhbSB2YWwgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBlbnVtIGNvbnRhaW5zIHRoZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW51bVZhbHVlPFQ+KGU6IFQsIHZhbDogc3RyaW5nIHwgbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldEVudW1WYWx1ZXMoZSkuaW5jbHVkZXModmFsKTtcbn1cbiJdfQ==
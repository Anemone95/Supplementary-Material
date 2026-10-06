"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeWheelEvent = normalizeWheelEvent;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/*
Copyright 2021 Šimon Brandner <simon.bra.ag@gmail.com>

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
 * Different browsers use different deltaModes. This causes different behaviour.
 * To avoid that we use this function to convert any event to pixels.
 * @param {WheelEvent} event to normalize
 * @returns {WheelEvent} normalized event event
 */
function normalizeWheelEvent(event
/*: WheelEvent*/
)
/*: WheelEvent*/
{
  const LINE_HEIGHT = 18;
  let deltaX;
  let deltaY;
  let deltaZ;

  if (event.deltaMode === 1) {
    // Units are lines
    deltaX = event.deltaX * LINE_HEIGHT;
    deltaY = event.deltaY * LINE_HEIGHT;
    deltaZ = event.deltaZ * LINE_HEIGHT;
  } else {
    deltaX = event.deltaX;
    deltaY = event.deltaY;
    deltaZ = event.deltaZ;
  }

  return new WheelEvent("syntheticWheel", _objectSpread({
    deltaMode: 0,
    deltaY: deltaY,
    deltaX: deltaX,
    deltaZ: deltaZ
  }, event));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9Nb3VzZS50cyJdLCJuYW1lcyI6WyJub3JtYWxpemVXaGVlbEV2ZW50IiwiZXZlbnQiLCJMSU5FX0hFSUdIVCIsImRlbHRhWCIsImRlbHRhWSIsImRlbHRhWiIsImRlbHRhTW9kZSIsIldoZWVsRXZlbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxTQUFTQSxtQkFBVCxDQUE2QkM7QUFBN0I7QUFBQTtBQUFBO0FBQTREO0FBQy9ELFFBQU1DLFdBQVcsR0FBRyxFQUFwQjtBQUVBLE1BQUlDLE1BQUo7QUFDQSxNQUFJQyxNQUFKO0FBQ0EsTUFBSUMsTUFBSjs7QUFFQSxNQUFJSixLQUFLLENBQUNLLFNBQU4sS0FBb0IsQ0FBeEIsRUFBMkI7QUFBRTtBQUN6QkgsSUFBQUEsTUFBTSxHQUFJRixLQUFLLENBQUNFLE1BQU4sR0FBZUQsV0FBekI7QUFDQUUsSUFBQUEsTUFBTSxHQUFJSCxLQUFLLENBQUNHLE1BQU4sR0FBZUYsV0FBekI7QUFDQUcsSUFBQUEsTUFBTSxHQUFJSixLQUFLLENBQUNJLE1BQU4sR0FBZUgsV0FBekI7QUFDSCxHQUpELE1BSU87QUFDSEMsSUFBQUEsTUFBTSxHQUFHRixLQUFLLENBQUNFLE1BQWY7QUFDQUMsSUFBQUEsTUFBTSxHQUFHSCxLQUFLLENBQUNHLE1BQWY7QUFDQUMsSUFBQUEsTUFBTSxHQUFHSixLQUFLLENBQUNJLE1BQWY7QUFDSDs7QUFFRCxTQUFPLElBQUlFLFVBQUosQ0FDSCxnQkFERztBQUdDRCxJQUFBQSxTQUFTLEVBQUUsQ0FIWjtBQUlDRixJQUFBQSxNQUFNLEVBQUVBLE1BSlQ7QUFLQ0QsSUFBQUEsTUFBTSxFQUFFQSxNQUxUO0FBTUNFLElBQUFBLE1BQU0sRUFBRUE7QUFOVCxLQU9JSixLQVBKLEVBQVA7QUFVSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSDFoGltb24gQnJhbmRuZXIgPHNpbW9uLmJyYS5hZ0BnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLyoqXG4gKiBEaWZmZXJlbnQgYnJvd3NlcnMgdXNlIGRpZmZlcmVudCBkZWx0YU1vZGVzLiBUaGlzIGNhdXNlcyBkaWZmZXJlbnQgYmVoYXZpb3VyLlxuICogVG8gYXZvaWQgdGhhdCB3ZSB1c2UgdGhpcyBmdW5jdGlvbiB0byBjb252ZXJ0IGFueSBldmVudCB0byBwaXhlbHMuXG4gKiBAcGFyYW0ge1doZWVsRXZlbnR9IGV2ZW50IHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge1doZWVsRXZlbnR9IG5vcm1hbGl6ZWQgZXZlbnQgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVdoZWVsRXZlbnQoZXZlbnQ6IFdoZWVsRXZlbnQpOiBXaGVlbEV2ZW50IHtcbiAgICBjb25zdCBMSU5FX0hFSUdIVCA9IDE4O1xuXG4gICAgbGV0IGRlbHRhWDtcbiAgICBsZXQgZGVsdGFZO1xuICAgIGxldCBkZWx0YVo7XG5cbiAgICBpZiAoZXZlbnQuZGVsdGFNb2RlID09PSAxKSB7IC8vIFVuaXRzIGFyZSBsaW5lc1xuICAgICAgICBkZWx0YVggPSAoZXZlbnQuZGVsdGFYICogTElORV9IRUlHSFQpO1xuICAgICAgICBkZWx0YVkgPSAoZXZlbnQuZGVsdGFZICogTElORV9IRUlHSFQpO1xuICAgICAgICBkZWx0YVogPSAoZXZlbnQuZGVsdGFaICogTElORV9IRUlHSFQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbHRhWCA9IGV2ZW50LmRlbHRhWDtcbiAgICAgICAgZGVsdGFZID0gZXZlbnQuZGVsdGFZO1xuICAgICAgICBkZWx0YVogPSBldmVudC5kZWx0YVo7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBXaGVlbEV2ZW50KFxuICAgICAgICBcInN5bnRoZXRpY1doZWVsXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGRlbHRhTW9kZTogMCxcbiAgICAgICAgICAgIGRlbHRhWTogZGVsdGFZLFxuICAgICAgICAgICAgZGVsdGFYOiBkZWx0YVgsXG4gICAgICAgICAgICBkZWx0YVo6IGRlbHRhWixcbiAgICAgICAgICAgIC4uLmV2ZW50LFxuICAgICAgICB9LFxuICAgICk7XG59XG4iXX0=
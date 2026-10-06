"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setHasDiff = setHasDiff;

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
 * Determines if two sets are different through a shallow comparison.
 * @param a The first set. Must be defined.
 * @param b The second set. Must be defined.
 * @returns True if they are different, false otherwise.
 */
function setHasDiff
/*:: <T>*/
(a
/*: Set<T>*/
, b
/*: Set<T>*/
)
/*: boolean*/
{
  if (a.size === b.size) {
    // When the lengths are equal, check to see if either set is missing an element from the other.
    if (Array.from(b).some(i => !a.has(i))) return true;
    if (Array.from(a).some(i => !b.has(i))) return true; // if all the keys are common, say so

    return false;
  } else {
    return true; // different lengths means they are naturally diverged
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9zZXRzLnRzIl0sIm5hbWVzIjpbInNldEhhc0RpZmYiLCJhIiwiYiIsInNpemUiLCJBcnJheSIsImZyb20iLCJzb21lIiwiaSIsImhhcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxTQUFTQTtBQUFUO0FBQUEsQ0FBdUJDO0FBQXZCO0FBQUEsRUFBa0NDO0FBQWxDO0FBQUE7QUFBQTtBQUFzRDtBQUN6RCxNQUFJRCxDQUFDLENBQUNFLElBQUYsS0FBV0QsQ0FBQyxDQUFDQyxJQUFqQixFQUF1QjtBQUNuQjtBQUNBLFFBQUlDLEtBQUssQ0FBQ0MsSUFBTixDQUFXSCxDQUFYLEVBQWNJLElBQWQsQ0FBbUJDLENBQUMsSUFBSSxDQUFDTixDQUFDLENBQUNPLEdBQUYsQ0FBTUQsQ0FBTixDQUF6QixDQUFKLEVBQXdDLE9BQU8sSUFBUDtBQUN4QyxRQUFJSCxLQUFLLENBQUNDLElBQU4sQ0FBV0osQ0FBWCxFQUFjSyxJQUFkLENBQW1CQyxDQUFDLElBQUksQ0FBQ0wsQ0FBQyxDQUFDTSxHQUFGLENBQU1ELENBQU4sQ0FBekIsQ0FBSixFQUF3QyxPQUFPLElBQVAsQ0FIckIsQ0FLbkI7O0FBQ0EsV0FBTyxLQUFQO0FBQ0gsR0FQRCxNQU9PO0FBQ0gsV0FBTyxJQUFQLENBREcsQ0FDVTtBQUNoQjtBQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHR3byBzZXRzIGFyZSBkaWZmZXJlbnQgdGhyb3VnaCBhIHNoYWxsb3cgY29tcGFyaXNvbi5cbiAqIEBwYXJhbSBhIFRoZSBmaXJzdCBzZXQuIE11c3QgYmUgZGVmaW5lZC5cbiAqIEBwYXJhbSBiIFRoZSBzZWNvbmQgc2V0LiBNdXN0IGJlIGRlZmluZWQuXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZXkgYXJlIGRpZmZlcmVudCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0SGFzRGlmZjxUPihhOiBTZXQ8VD4sIGI6IFNldDxUPik6IGJvb2xlYW4ge1xuICAgIGlmIChhLnNpemUgPT09IGIuc2l6ZSkge1xuICAgICAgICAvLyBXaGVuIHRoZSBsZW5ndGhzIGFyZSBlcXVhbCwgY2hlY2sgdG8gc2VlIGlmIGVpdGhlciBzZXQgaXMgbWlzc2luZyBhbiBlbGVtZW50IGZyb20gdGhlIG90aGVyLlxuICAgICAgICBpZiAoQXJyYXkuZnJvbShiKS5zb21lKGkgPT4gIWEuaGFzKGkpKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChBcnJheS5mcm9tKGEpLnNvbWUoaSA9PiAhYi5oYXMoaSkpKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAvLyBpZiBhbGwgdGhlIGtleXMgYXJlIGNvbW1vbiwgc2F5IHNvXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gZGlmZmVyZW50IGxlbmd0aHMgbWVhbnMgdGhleSBhcmUgbmF0dXJhbGx5IGRpdmVyZ2VkXG4gICAgfVxufVxuIl19